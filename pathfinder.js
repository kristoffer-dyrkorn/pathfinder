import Mesh from "./mesh.js";
import Edge from "./edge.js";
import fs from "fs";

export default class Pathfinder {
  constructor(meshFile, pathFile) {
    this.mesh = new Mesh(meshFile);
    this.path = JSON.parse(fs.readFileSync(pathFile, "utf8"));
    this.path.coordinates = this.path.coordinates[0];
  }

  trace() {
    let p1 = 0;
    let p2 = 1;
    let currentEdge = null;
    let currentTriangle = null;

    // assume path start point is inside a triangle
    currentTriangle = this.mesh.enclosingTriangle(this.path.coordinates[p1]);
    const elevation = currentTriangle.getElevation(this.path.coordinates[p1]);
    // update p1 with elevation
    this.path.coordinates[p1].push(elevation);

    do {
      if (currentEdge) {
        // if we crossed an edge now, update the referance to the containing triangle
        // this way we avoid doing point location in every step
        currentTriangle = currentEdge.t;
      }

      // check if p2 is on one of the vertices of the current triangle
      const vertexIndex = currentTriangle.isOnVertex(this.path.coordinates[p2]);
      if (vertexIndex) {
        const elevation = currentTriangle.getElevation(this.path.coordinates[p2]);
        this.path.coordinates[p2].push(elevation);

        const spokeCenter = currentTriangle.v[vertexIndex];
        const candidateTris = this.mesh.spoke[spokeCenter];

        // now we must test all triangles in the spoke around this vertex
        // for next iteration: mark that we did not enter via an edge
        currentEdge = null;
        p1 = p2;
        p2++;

        console.error("p2 is on a triangle vertex, this case is not yet supported.");
        break;
      }

      // check if p2 is on one of the edges of the current triangle
      const [onEdge, edgeIndex] = currentTriangle.isOnEdge(this.path.coordinates[p2]);
      if (onEdge) {
        // update p2 with elevation
        const elevation = currentTriangle.getElevation(this.path.coordinates[p2]);
        this.path.coordinates[p2].push(elevation);

        const edge = currentTriangle.e[edgeIndex];

        // does p3 exist? if yes,
        // test if p1 and p3 are on same sides of the half-plane defined by the intersecting edge.
        // if yes, continue from the current edge
        // if not, continue from flip edge

        const p3 = p2 + 1;
        if (this.path.coordinates[p3]) {
          const p1orientation = Math.sign(edge.orientation(this.path.coordinates[p1]));
          const p3orientation = Math.sign(edge.orientation(this.path.coordinates[p3]));

          console.assert(p1orientation !== 0, "p1 should not be collinear to an edge");
          console.assert(p3orientation !== 0, "p3 should not be collinear to an edge");

          if (p1orientation === p3orientation) {
            currentEdge = edge;
          } else {
            currentEdge = edge.flip;
          }
          p1 = p2;
          p2++;
        }
        // jump to next iteration of loop
        continue;
      }

      // check if p2 is inside the current triangle
      const candidateTriangle = this.mesh.enclosingTriangle(this.path.coordinates[p2]);
      if (candidateTriangle === currentTriangle) {
        // update p2 with elevation and go on
        const elevation = currentTriangle.getElevation(this.path.coordinates[p2]);
        this.path.coordinates[p2].push(elevation);

        // for next iteration: mark that we did not enter via an edge
        currentEdge = null;
        p1 = p2;
        p2++;
      } else {
        // p2 is outside the current triangle.
        // p1p2 must now intersect one of the edges of the current triangle,
        // if p1 was inside the current triangle or on one of the *other* edges.

        const p1p2 = new Edge(null, [0, 1], [this.path.coordinates[p1], this.path.coordinates[p2]]);

        // NOTE do not test the current edge (the edge we came from) for intersection,
        // or else we will discover that same intersection point again, jump backwards to the flip edge,
        // and get stuck as we cannot find any intersections from that triangle

        // NOTE this is not 100% correct.
        // a path might have a vertex on an edge and then continue collinear to (on top of) that edge,
        // either past the triangle (so the path crosses a triangle vertex)
        // or just a short distance (so the next path point also intersects the same edge)
        // ie a path segment can intersect a triangle edge twice.
        // idea: consider path segments to be <p1,p2]? ie non-inclusive for the start point?

        const [edge, intersectionPoint] = currentTriangle.intersectsOtherEdges(currentEdge, p1p2);
        if (intersectionPoint) {
          const elevation = currentTriangle.getElevation(intersectionPoint);
          intersectionPoint.push(elevation);

          // this intersection point is a new point on the path, so insert it
          // in a new array cell located between p1 and p2
          this.path.coordinates.splice(p2, 0, intersectionPoint);

          p1 = p2;
          p2++;

          // continue along the flip edge of the intersecting edge
          currentEdge = edge.flip;

          // TODO for this case:
          // if p1 was on a vertex or on an edge, one of the triangle edges might be collinear to p1p2
          // if p1p2 is collinear, one of the triangle vertices will intersect p1p2
          //
          // so: if p1 was on a vertex or an edge, test intersection between all triangle vertices and p1p2
          //
        } else {
          console.log("Error: did not find intersection point that should be there");
          break;
        }
      }
    } while (p2 < this.path.coordinates.length);

    console.log(JSON.stringify(this.path.coordinates, null, " "));
  }
}

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

    // NOTE we assume the starting point of the path is inside a triangle
    currentTriangle = this.mesh.enclosingTriangle(this.path.coordinates[p1]);
    // update p1 with elevation data
    const elevation = currentTriangle.getElevation(this.path.coordinates[p1]);
    this.path.coordinates[p1].push(elevation);

    do {
      if (currentEdge) {
        // if we have just crossed an edge, update the referance to the containing triangle
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

        const p3 = p2 + 1;
        // if p3 exists, check whether we should continue on the same edge or the flip edge
        if (this.path.coordinates[p3]) {
          const p1orientation = Math.sign(edge.orientation(this.path.coordinates[p1]));
          const p3orientation = Math.sign(edge.orientation(this.path.coordinates[p3]));

          // if p3 is collinear to the current edge, we can continue on an arbitrary edge.
          // just choose the same edge
          // NOTE: when p3 is collinear, there are two cases:
          // in the next iteration p2 (the current p3) will either lie on an edge of the current triangle,
          // or p1p2 will intersect one of the vertices of the current triangle
          //
          // both *should* be handled by the current code
          if (p3orientation === 0) {
            currentEdge = edge;
          } else {
            // not collinear, decide where to continue
            if (p1orientation === p3orientation) {
              currentEdge = edge;
            } else {
              currentEdge = edge.flip;
            }
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
        // test the edge p1p2 against the edges of the current triangle.
        // NOTE we consider p1 itself to *not* belong to the edge, ie we test the interval <p1 p2].
        // else we will rediscover the intersection we came from,
        // since the current p1 is the p2 from the previous iteration

        const p1p2 = new Edge(null, [0, 1], [this.path.coordinates[p1], this.path.coordinates[p2]]);
        const [edge, intersectionPoint] = currentTriangle.intersectsEdge(p1p2);
        if (intersectionPoint) {
          const elevation = currentTriangle.getElevation(intersectionPoint);
          intersectionPoint.push(elevation);

          // this intersection point is a new point on the path, so
          // insert a new array cell located between p1 and p2
          this.path.coordinates.splice(p2, 0, intersectionPoint);

          // at this stage, we know that p1p2 *crosses* a triangle edge,
          // since we (above) already tested whether p2 lies *on* a triangle edge
          // so, continue along the flip edge
          currentEdge = edge.flip;

          p1 = p2;
          p2++;
        } else {
          console.log("Error: did not find intersection point that should be there");
          break;
        }
      }
    } while (p2 < this.path.coordinates.length);
  }
}

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
    // NOTE we assume the starting point of the path is inside a triangle
    let currentTriangle = this.mesh.enclosingTriangle(this.path.coordinates[0]);
    currentTriangle.updateElevation(this.path.coordinates[0]);

    // index of the end point of the current path segment
    let i = 1;

    do {
      // check if the segment end point is on one of the vertices of the current triangle
      const vertexIndex = currentTriangle.isOnVertex(this.path.coordinates[i]);
      if (vertexIndex) {
        currentTriangle.updateElevation(this.path.coordinates[i]);

        const spokeCenter = currentTriangle.vertices[vertexIndex];
        const candidateTris = this.mesh.spoke[spokeCenter];

        // now we must test all triangles in the spoke around this vertex

        console.error("end point is on a triangle vertex, this case is not yet supported.");
        break;
      }

      // check if the segment end point is on one of the edges of the current triangle
      const [onEdge, edgeIndex] = currentTriangle.isOnEdge(this.path.coordinates[i]);
      if (onEdge) {
        // update point with elevation
        currentTriangle.updateElevation(this.path.coordinates[i]);

        // if a next point exists, check whether we should continue on the same edge or on the flip edge
        if (this.path.coordinates[i + 1]) {
          const edge = currentTriangle.edges[edgeIndex];

          const prevOrientation = Math.sign(edge.orientation(this.path.coordinates[i - 1]));
          const nextOrientation = Math.sign(edge.orientation(this.path.coordinates[i + 1]));

          // if the point after the segment endpoint is collinear to the segment (nextOrientation === 0),
          // we can continue along an arbitrary edge (either same edge or flip edge).
          // here we just choose the same edge - ie we don't need to update currentTriangle.
          // also, keeping the same currentTriangle is correct if the orientation signs are equal.
          //
          // that is, we only need to jump to the flip edge if the orientations are non-equal
          if (prevOrientation !== nextOrientation) {
            currentTriangle = edge.flip.triangle;
          }

          // NOTE: when the edge is collinear, there are two cases:
          // in the next iteration the end point will either lie on an edge of the current triangle,
          // or the edge will intersect one of the vertices of the current triangle
          // both cases *should* be handled by the current code
        } else {
          // if there is no next point, we are at the end of the path, so do nothing and let the loop terminate
        }

        // jump to next iteration of loop
        continue;
      }

      // check if the segment end point is inside the current triangle
      const candidateTriangle = this.mesh.enclosingTriangle(this.path.coordinates[i]);
      if (candidateTriangle === currentTriangle) {
        currentTriangle.updateElevation(this.path.coordinates[i]);
      } else {
        // the segment end point is outside the current triangle.
        // test the segment against the edges of the current triangle.
        // NOTE we consider the start point to *not* belong to the segment, ie we test the interval <start end].
        // else we will rediscover the intersection we came from,
        // since the current segment start point is the end point from the previous iteration

        const pathSegment = new Edge(null, [0, 1], [this.path.coordinates[i - 1], this.path.coordinates[i]]);
        const [edge, intersectionPoint] = currentTriangle.intersectsEdge(pathSegment);
        if (intersectionPoint) {
          currentTriangle.updateElevation(intersectionPoint);

          // this intersection point is a new point on the path, so
          // insert a new array cell located between start and end points
          this.path.coordinates.splice(i, 0, intersectionPoint);

          // at this stage, we know that the path segment *crosses* a triangle edge,
          // since we (above) already tested whether the end point lies *on* a triangle edge.
          // so, continue along the flip edge
          currentTriangle = edge.flip.triangle;
        } else {
          console.log("Error: did not find intersection point that should be there");
          break;
        }
      }
    } while (++i < this.path.coordinates.length);
  }
}

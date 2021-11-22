import { orient2d } from "robust-predicates";

export default class Edge {
  constructor(triangle, vertices, points) {
    this.endPoints = [points[vertices[0]], points[vertices[1]]];
    this.key = `${vertices[0]}-${vertices[1]}`;
    this.flipKey = `${vertices[1]}-${vertices[0]}`;
    this.flip = null;

    this.triangle = triangle;
  }

  // returns true if p lies on this edge
  // and is located between the edge endpoints
  intersectsPoint(p) {
    if (this.orientation(p) === 0) {
      // p is collinear, so check if p is between edge endpoints

      // create vectors from each edge endpoint to p
      const v0 = [p[0] - this.endPoints[0][0], p[1] - this.endPoints[0][1]];
      const v1 = [p[0] - this.endPoints[1][0], p[1] - this.endPoints[1][1]];

      // if the dot product is negative, the vectors point in (partially) opposite directions
      // in that case, p will lie between edge endpoints
      if (v0[0] * v1[0] + v0[1] * v1[1] < 0) {
        return true;
      }
    }
    return false;
  }

  isOnEdge(p) {
    return this.orientation(p) === 0;
  }

  // detects edge-edge intersections and edge-endpoint intersection ("a touching point").
  //
  // NOTE only the interval <p1 p2] of the other edge is tested.
  // this is by design, so we avoid duplicate detections as we traverse the path
  // (the current p2 is p1 in the next iteration)
  //
  // NOTE does not detect endpoint-endpoint intersections (two edges having a common point)
  intersectsEdge(other) {
    // check location of the other edge's endpoints, relative to this one
    const d1 = this.orientation(other.endPoints[0]);
    const d2 = this.orientation(other.endPoints[1]);
    // check location of this edge's endpoints, relative to the other one
    const d3 = other.orientation(this.endPoints[0]);
    const d4 = other.orientation(this.endPoints[1]);

    // if all end points are on different sides of their opposite edges, the edges intersect
    if (d1 * d2 < 0 && d3 * d4 < 0) {
      return this.calculateEdgeIntersection(other);
    } else {
      // check for endpoint-line intersections, but don't test p1 (other.endPoints[0])

      if (d2 === 0 && this.intersectsPoint(other.endPoints[1])) {
        return other.endPoints[1];
      }
      if (d3 === 0 && other.intersectsPoint(this.endPoints[0])) {
        return this.endPoints[0];
      }
      if (d4 === 0 && other.intersectsPoint(this.endPoints[1])) {
        return this.endPoints[1];
      }

      // we have no intersections
      return null;
    }
  }

  // returns the location where this edge crosses the other edge
  // based on https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
  // TODO: replace with robust/exact algorithm
  calculateEdgeIntersection(other) {
    const d1 = (this.endPoints[0][0] - this.endPoints[1][0]) * (other.endPoints[0][1] - other.endPoints[1][1]);
    const d2 = (this.endPoints[0][1] - this.endPoints[1][1]) * (other.endPoints[0][0] - other.endPoints[1][0]);
    const d = d1 - d2;

    const u1 = this.endPoints[0][0] * this.endPoints[1][1] - this.endPoints[0][1] * this.endPoints[1][0];
    const u4 = other.endPoints[0][0] * other.endPoints[1][1] - other.endPoints[0][1] * other.endPoints[1][0];

    const u2x = other.endPoints[0][0] - other.endPoints[1][0];
    const u3x = this.endPoints[0][0] - this.endPoints[1][0];
    const u2y = other.endPoints[0][1] - other.endPoints[1][1];
    const u3y = this.endPoints[0][1] - this.endPoints[1][1];

    return [(u1 * u2x - u3x * u4) / d, (u1 * u2y - u3y * u4) / d];
  }

  // returns 0 if p lies on the edge,
  // < 0 if a->b->p are oriented counterclockwise,
  // > 0 if a->b->p are oriented clockwise
  orientation(p) {
    const a = this.endPoints[0];
    const b = this.endPoints[1];
    return orient2d(a[0], a[1], b[0], b[1], p[0], p[1]);
  }
}

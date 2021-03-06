import Edge from "./edge.js";

export default class Triangle {
  constructor(vertices, points) {
    this.p = [points[vertices[0]], points[vertices[1]], points[vertices[2]]];
    this.vertices = vertices;

    this.edges = [];
    this.edges.push(new Edge(this, [vertices[0], vertices[1]], points));
    this.edges.push(new Edge(this, [vertices[1], vertices[2]], points));
    this.edges.push(new Edge(this, [vertices[2], vertices[0]], points));
  }

  // tests if point is strictly inside the triangle
  // ie will return false when the point lies on an edge or a vertex
  isInside(p) {
    let insideEdge = 0;
    this.edges.forEach((edge) => {
      if (edge.orientation(p) < 0) {
        insideEdge += 1;
      }
    });
    return insideEdge === 3;
  }

  isOnEdge(p) {
    // iterate over all elements, with index,
    // while supporting early exit.
    for (const [i, edge] of this.edges.entries()) {
      if (edge.isOnEdge(p)) {
        return [true, i];
      }
    }
    return [false, -1];
  }

  // test intersection against all edges in this triangle
  // NOTE: we only test the interval <p1 p2] of the edge e
  intersectsEdge(e) {
    for (const [i, edge] of this.edges.entries()) {
      const intersectionPoint = edge.intersectsEdge(e);
      if (intersectionPoint) {
        return [edge, intersectionPoint];
      }
    }
    return [null, null];
  }

  // TODO: use a more robust/exact criterion
  isOnVertex(p) {
    for (const [i, vertex] of this.p.entries()) {
      if (Math.abs(vertex[0] - p[0]) < 0.0001 && Math.abs(vertex[1] - p[1]) < 0.0001) {
        return i;
      }
    }
    return false;
  }

  updateElevation(point) {
    point.push(this.getElevation(point));
  }

  // calculate the elevation of a point in a triangle.
  // input points do not need to lie strictly inside the triangle,
  // ie points on edges or on vertices are also handled correctly.
  // from: https://gamedev.stackexchange.com/a/23745
  getElevation(p) {
    // calculate edge vectors and barycentric coordinates
    const vec0 = [this.p[1][0] - this.p[0][0], this.p[1][1] - this.p[0][1]];
    const vec1 = [this.p[2][0] - this.p[0][0], this.p[2][1] - this.p[0][1]];
    const vec2 = [p[0] - this.p[0][0], p[1] - this.p[0][1]];

    const d00 = vec0[0] * vec0[0] + vec0[1] * vec0[1];
    const d01 = vec0[0] * vec1[0] + vec0[1] * vec1[1];
    const d11 = vec1[0] * vec1[0] + vec1[1] * vec1[1];
    const d20 = vec2[0] * vec0[0] + vec2[1] * vec0[1];
    const d21 = vec2[0] * vec1[0] + vec2[1] * vec1[1];
    const inverseDenom = 1.0 / (d00 * d11 - d01 * d01);

    const v = inverseDenom * (d11 * d20 - d01 * d21);
    const w = inverseDenom * (d00 * d21 - d01 * d20);
    const u = 1.0 - v - w;

    // interpolate using vertex elevations
    return u * this.p[0][2] + v * this.p[1][2] + w * this.p[2][2];
  }
}

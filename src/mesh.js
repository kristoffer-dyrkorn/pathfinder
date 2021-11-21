import fs from "fs";
import Triangle from "./triangle.js";

export default class Mesh {
  // construct mesh from obj file

  // point location: find tri containing point p
  // navigation -> find tri on opposite side of edge e
  // find all tris around vertex v

  constructor(fileName) {
    this.triangles = [];
    this.vertices = [];
    // list of all edges, used when navigating from an edge to its flip edge
    this.edges = new Map();

    const [triangleIndices, vertexList] = this.parseOBJ(fileName);
    this.vertices = vertexList;

    // list of all triangles around a given vertex (ie the "spoke" around the vertex)
    // create an empty 2D array: a tri list for each vertex
    this.spoke = Array(vertexList.length)
      .fill([])
      .map(() => []);

    triangleIndices.forEach((triangle) => {
      const t = new Triangle(triangle, vertexList);
      this.triangles.push(t);

      // for each of the vertices, add this tri to the list of tris containing that vertex
      this.spoke[triangle[0]].push(t);
      this.spoke[triangle[1]].push(t);
      this.spoke[triangle[2]].push(t);

      // store all edges of this triangle in the edge map
      // so we later can connect edges and flip edges
      t.edges.forEach((edge) => {
        this.edges.set(edge.key, edge);
      });
    });

    // connect all edge with a flip edge
    // NOTE boundary edges will not have a flip edge.
    this.edges.forEach((edge) => {
      // is there a flip edge with the suggested key?
      const flipEdge = this.edges.get(edge.flipKey);

      // yes: connect
      if (flipEdge) {
        edge.flip = flipEdge;
        flipEdge.flip = edge;
      }
      // no: do nothing (edge.flip stays null)
    });
  }

  // return the triangle enclosing this point, if any
  // NOTE: tests all tris in mesh in sequence, an O(n) operation
  enclosingTriangle(p) {
    for (const triangle of this.triangles) {
      if (triangle.isInside(p)) {
        return triangle;
      }
    }
    return null;
  }

  parseOBJ(fileName) {
    const triangles = [];
    const vertices = [];
    const file = fs.readFileSync(fileName, "utf-8");
    file.split(/\r?\n/).forEach((line) => {
      const tokens = line.split(" ");

      switch (tokens[0]) {
        case "v":
          // "+" means cast string to number
          vertices.push([+tokens[1], +tokens[2], +tokens[3]]);
          break;

        case "f":
          const position = new Array(tokens.length - 1);
          for (let i = 1; i < tokens.length; ++i) {
            const indices = tokens[i].split("/");
            position[i - 1] = (indices[0] | 0) - 1;
          }
          triangles.push(position);
          break;

        case "vp":
        case "s":
        case "o":
        case "g":
        case "usemtl":
        case "mtllib":
          break;
      }
    });
    return [triangles, vertices];
  }
}

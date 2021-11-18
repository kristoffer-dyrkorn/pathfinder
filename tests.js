import Pathfinder from "./pathfinder.js";
import Triangle from "./triangle.js";
import Edge from "./edge.js";
import Mesh from "./mesh.js";

function arrayEquals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// edge-point orientation

const orientationEdge = new Edge(
  null,
  [0, 1],
  [
    [0, 0],
    [4, 0],
  ]
);

console.assert(orientationEdge.orientation([2, 0]) === 0, "Point is on edge");
console.assert(orientationEdge.orientation([2, 2]) < 0, "Edge-point are ccw oriented");
console.assert(orientationEdge.orientation([2, -2]) > 0, "Edge-point are cw oriented");

// inside/outside triangle

const triangle = new Triangle(
  [0, 1, 2],
  [
    [0, 0],
    [10, 0],
    [0, 10],
  ]
);

console.assert(triangle.isInside([3, 3]) === true, "Point is inside triangle");
console.assert(triangle.isInside([-1, -1]) === false, "Point is outside triangle");
const [onEdge, index] = triangle.isOnEdge([3, 0]);
console.assert(onEdge === true, "Point is on triangle edge");
console.assert(index === 0, "Point is on triangle edge, index is 0");
console.assert(triangle.isOnVertex([0, 10]) === 2, "Point is on triangle vertex");

// edge/point intersections

const edge = triangle.getEdges()[0];

console.assert(edge.intersectsPoint([3, 0]) === true, "Point is on edge");
console.assert(edge.intersectsPoint([13, 0]) === false, "Point is on (horizontal) edge, but past endpoint");
console.assert(edge.intersectsPoint([20, -10]) === false, "Point is on (diagonal) edge, but past endpoint");

// edge/edge intersections

const otherEdge = new Edge(
  null,
  [0, 1],
  [
    [4, 4],
    [4, -4],
  ]
);

console.assert(arrayEquals(edge.intersectsEdge(otherEdge), [4, 0]), "Edge intersects edge at [4,0]");

const tEdge = new Edge(
  null,
  [0, 1],
  [
    [0, 6],
    [10, -4],
  ]
);

console.assert(arrayEquals(edge.intersectsEdge(tEdge), [6, 0]), "Edge intersects edge at [6,0]");

const nonIntersectingEdge = new Edge(
  null,
  [0, 1],
  [
    [0, 10],
    [10, 10],
  ]
);

const result = edge.intersectsEdge(nonIntersectingEdge);
console.assert(result === null, "Edges do not intersect");

// triangle/edge intersections

const intersectingEdge = new Edge(
  null,
  [0, 1],
  [
    [3, 3],
    [10, 10],
  ]
);

let [triangleEdge, intersectionPoint] = triangle.intersectsEdge(intersectingEdge);
console.assert(arrayEquals(intersectionPoint, [5, 5]), "Edge intersects triangle at [5,5]");
console.assert(triangleEdge.key === "1-2", "Intersecting triangle edge has key 1-2");

let startEdge = triangle.e[0];
[triangleEdge, intersectionPoint] = triangle.intersectsOtherEdges(startEdge, intersectingEdge);
console.assert(arrayEquals(intersectionPoint, [5, 5]), "When using start edge, the edge intersects triangle at [5,5]");

startEdge = triangle.e[1];
[triangleEdge, intersectionPoint] = triangle.intersectsOtherEdges(startEdge, intersectingEdge);
console.assert(intersectionPoint === null, "When start edge crosses intersection edge, there is no intersection");

// get interpolated elevations

const meshTriangle = new Triangle(
  [0, 1, 2],
  [
    [0, 0, 0],
    [10, 0, 0],
    [0, 10, 10],
  ]
);

console.assert(meshTriangle.getElevation([1, 1]) === 1, "Get elevation inside triangle");
console.assert(meshTriangle.getElevation([0, 10]) === 10, "Get elevation on vertex");
console.assert(meshTriangle.getElevation([0, 5]) === 5, "Get elevation on edge");

// read an OBJ mesh

const mesh = new Mesh("testfile.obj");
console.assert(mesh.triangles.length === 5000, "Read all triangles");
console.assert(mesh.vertices.length === 2601, "Read all vertices");

// read a simple OBJ mesh, perform simple topological operations

// simple.obj
//
// 6-7-8
// |\|\|
// 3-4-5
// |\|\|
// 0-1-2

const simpleMesh = new Mesh("simple.obj");
console.assert(simpleMesh.triangles.length === 8, "Read all simplemesh triangles");
console.assert(simpleMesh.vertices.length === 9, "Read all simplemesh vertices");
console.assert(simpleMesh.vertices.length === 9, "Read all simplemesh vertices");

// spoke tests

console.assert(simpleMesh.spoke[0].length === 1, "Vertex 0 is used in 1 triangle");
console.assert(simpleMesh.spoke[4].length === 6, "Vertex 4 is used in 6 triangles");

// flip edge tests

const noFlipEdge = simpleMesh.edges.get("0-1");
console.assert(noFlipEdge.flip === null, "External edge has no flip edge");

const hasFlipEdge = simpleMesh.edges.get("1-4");
console.assert(hasFlipEdge.flip != null, "Internal edge 1-4 has a flip edge that is not null");
console.assert(hasFlipEdge.flip.key === "4-1", "Internal edge 1-4 has a flip edge key 4-1");
console.assert(hasFlipEdge.flip.flip.key === "1-4", "Internal edge 1-4 's flip flip edge has the key 1-4");

// point location

const enclosingTriangle = simpleMesh.enclosingTriangle([0.25, 0.25]);
console.assert(enclosingTriangle != null, "Enclosing triangle exists for [0.25, 0.25]");

// pathfinding

let p = new Pathfinder("simple.obj", "simple.json");
p.trace();

p = new Pathfinder("simple.obj", "simple2.json");
p.trace();

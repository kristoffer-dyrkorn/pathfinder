import Pathfinder from "../src/pathfinder.js";

// pathfinding

// simple.obj
//
// 6-7-8
// |\|\|
// 3-4-5
// |\|\|
// 0-1-2

let p = new Pathfinder("simple.obj", "simple.json");
p.trace();

p = new Pathfinder("simple.obj", "simple2.json");
p.trace();
// console.log(JSON.stringify(p.path.coordinates, null, " "));

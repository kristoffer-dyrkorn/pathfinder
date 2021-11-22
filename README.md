# pathfinder

Given a 2D polyline (blue) and a 2.5D triangular mesh surface (black), calculate the resulting 3D path (red) when projecting the polyline onto the surface.

<p align="center">
<img src="https://github.com/kristoffer-dyrkorn/pathfinder/blob/main/images/pathfinding.png">
</p>

# Use case

Assume you have a GPS track from a hiking trip, and a terrain model of the same area. You want to render the track and the terrain surface. However, since the terrain model is a simplified version of the true surface, and the GPS is not always precise, the recorded track will not follow the surface of the terrain model. Sometimes the track will lie above the surface, sometimes it will disappear underneath it.

This tool reads in a path and a terrain model, and calculates a new path that follows the original 2D path - but also lies on the surface of the terrain model.

# Method

- Assume that both the track and the triangle mesh is 2D
- Calculate all intersection points between the track and the triangles
- Also add all track path points fully inside the mesh triangles
- For each point in the resulting path, get elevation data by interpolating the surrounding triangle

The result is a 3D track that follows the terrain surface precisely. By adding a fixed elevation offset to the track it can then be rendered properly along with the terrain.

# How to use

> `npm install`
>
> `cd tests`
>
> `node tests.js`

See the bottom of `tests.js` for examples on how to use.

# Credits

- Depends on Vladimir Agafonkin's [port of robust geometric predicates](https://github.com/mourner/robust-predicates) (License: Public domain)
- Contains code taken from Mikola Lysenko's parse-obj, see https://github.com/mikolalysenko/parse-obj (License: MIT)

# Caveats

- This is an early release and contains work in progress and unpolished code. The program will likely blow up on large data sets.
- The code does not yet handle all intersection cases.
- The code does not yet handle coordinate reference systems (WGS, UTM and so on) for input points.
- Numerical precision is an issue in geometric calculations. The code here uses robust tests of point-edge orientations, but line-line intersections and duplicate point detection is for now done in a simple, non-robust way.

# License

MIT License.

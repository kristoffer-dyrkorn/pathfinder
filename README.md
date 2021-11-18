# pathfinder

Given a 2d polyline (blue) and a triangular mesh surface (black), calculate the resulting path (red) when projecting the polyline onto the surface.

<p align="center">
<img src="https://github.com/kristoffer-dyrkorn/pathfinder/blob/main/images/pathfinding.png">
</p>

# Use case

Assume you have a GPS track from a hiking trip, and a terrain model of the same area. You want to render the track and the terrain surface. However, since the terrain model has limited resolution, and the GPS is not always precise, the recorded track will not follow the terrain surface. Sometimes it will lie above the surface, sometimes it will disappear underneath it.

By assuming the track is a 2D track, and by calculating the intersection points between the track and the mesh triangles, the result is a 3D track that piecewise follows the terrain surface exactly. By adding a fixed elevation offset to the track it can then be rendered properly along with the terrain.

# How to use

> `npm install`
>
> `node tests.js`

See the bottom of `tests.js` for examples on how to use.

# Caveats

- This is an early relese and contains work in progress and unpolished code. The program will likely blow up on large data sets.
- The code does not yet handle all intersection cases.
- The code does not yet handle coordinate reference systems (WGS, UTM and so on) for input points.
- Numerical precision is an issue in geometric calculations. The code here uses Vladimir Agafonkin's [port of robust geometric predicates](https://github.com/mourner/robust-predicates) for point-edge orientations, but line-line intersection calculations and duplicate point detection is for now done in a simple, non-robust way.

# License

MIT License.

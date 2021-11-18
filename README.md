# pathfinder

Given a 2D polyline and a 2.5D triangular mesh, this tool calculates the resulting path when projected onto the mesh surface.

![](https://github.com/kristoffer-dyrkorn/pathfinder/blob/main/images/pathfinding.png)

# Use case

If you have a GPS track from a hiking trip, and a terrain model of the same area, you might want to render the track and the terrain surface together. However, the GPS track will likely intersect the surface in many places - due to low precision in either GPS measurements, surface modelling, or both.

By assuming the track is a 2D track, and by calculating the intersection points between the mesh triangles and the track, and then linearly interpolating the elevations from the terrain model, it is possible to calculate a 3D track that is guaranteed to lie on the mesh surface itself. This can then be rendered properly along with the terrain.

This tool does that.

# How to use

> `npm install`
>
> `node tests.js`

# Caveats

- This is an early relese, WIP and unpolished code. It will likely blow up on large data sets.
- The code does not yet handle all intersection cases.
- Numerical precision is an issue in geometric calculations. The code here uses Vladimir Agafonkin's port of [robust geometric predicates](https://github.com/mourner/robust-predicates) to figure out orientations, but line-line intersection calculations are for now done in a simple, non-robust way.

# License

MIT License.
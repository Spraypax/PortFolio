export type ScreenPoint = readonly [number, number]

/** Project a flat HTML rectangle onto the four corners exported by Blender. */
export function rectangleToQuad(
  width: number,
  height: number,
  corners: readonly ScreenPoint[],
): number[] {
  if (width <= 0 || height <= 0 || corners.length !== 4) {
    throw new Error('A screen projection needs a positive rectangle and four corners.')
  }
  const source: ScreenPoint[] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]
  const equations = source.flatMap(([x, y], index) => {
    const [u, v] = corners[index]
    if (!Number.isFinite(u) || !Number.isFinite(v)) {
      throw new Error('Screen corners must be finite coordinates.')
    }
    return [
      [x, y, 1, 0, 0, 0, -u * x, -u * y, u],
      [0, 0, 0, x, y, 1, -v * x, -v * y, v],
    ]
  })

  // Gaussian elimination with partial pivoting, including perspective terms.
  for (let column = 0; column < 8; column += 1) {
    let pivot = column
    for (let row = column + 1; row < 8; row += 1) {
      if (Math.abs(equations[row][column]) > Math.abs(equations[pivot][column])) pivot = row
    }
    if (Math.abs(equations[pivot][column]) < 1e-10) {
      throw new Error('Screen corners must form a non-degenerate quadrilateral.')
    }
    ;[equations[column], equations[pivot]] = [equations[pivot], equations[column]]
    const divisor = equations[column][column]
    equations[column] = equations[column].map((entry) => entry / divisor)
    for (let row = 0; row < 8; row += 1) {
      if (row === column) continue
      const factor = equations[row][column]
      equations[row] = equations[row].map(
        (entry, index) => entry - factor * equations[column][index],
      )
    }
  }
  const [a, b, c, d, e, f, g, h] = equations.map((row) => row[8])
  // CSS matrix3d uses column-major order, with homogeneous division by w.
  return [a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1]
}

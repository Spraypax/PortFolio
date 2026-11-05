import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { rectangleToQuad } from '../src/features/psp/screenProjection.ts'

function project(matrix, x, y) {
  const w = matrix[3] * x + matrix[7] * y + matrix[15]
  return [
    (matrix[0] * x + matrix[4] * y + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[13]) / w,
  ]
}

test('Blender screen corners map exactly to HTML corners', () => {
  const { screen } = JSON.parse(
    readFileSync(new URL('../src/assets/images/psp/layout.json', import.meta.url), 'utf8'),
  )
  const corners = screen.corners
  const matrix = rectangleToQuad(480, 272, corners)
  ;[
    [0, 0],
    [480, 0],
    [480, 272],
    [0, 272],
  ].forEach(([x, y], index) => {
    project(matrix, x, y).forEach((coordinate, axis) =>
      assert.ok(Math.abs(coordinate - corners[index][axis]) < 1e-7),
    )
  })
})

test('homography supports real perspective instead of only affine skew', () => {
  const corners = [
    [15, 5],
    [310, 35],
    [265, 190],
    [40, 230],
  ]
  const matrix = rectangleToQuad(480, 272, corners)
  ;[
    [0, 0],
    [480, 0],
    [480, 272],
    [0, 272],
  ].forEach(([x, y], index) => {
    project(matrix, x, y).forEach((coordinate, axis) =>
      assert.ok(Math.abs(coordinate - corners[index][axis]) < 1e-7),
    )
  })
  assert.ok(Math.abs(matrix[3]) + Math.abs(matrix[7]) > 0)
})

test('invalid and collapsed screen projections are rejected', () => {
  assert.throws(() =>
    rectangleToQuad(0, 272, [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]),
  )
  assert.throws(() =>
    rectangleToQuad(480, 272, [
      [1, 1],
      [1, 1],
      [1, 1],
      [1, 1],
    ]),
  )
  assert.throws(() =>
    rectangleToQuad(480, 272, [
      [0, 0],
      [NaN, 0],
      [1, 1],
      [0, 1],
    ]),
  )
})

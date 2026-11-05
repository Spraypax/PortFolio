import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const previews = new URL('src/features/psp/assets/cv/', root)
const manifest = JSON.parse(await readFile(new URL('manifest.json', previews), 'utf8'))

test('PSP CV previews match the actual downloadable document', async () => {
  const source = await readFile(new URL(manifest.source, root))
  assert.equal(source.subarray(0, 5).toString(), '%PDF-')
  assert.equal(
    createHash('sha256').update(source).digest('hex'),
    manifest.sourceSha256,
    'The CV changed: regenerate its PSP previews with scripts/psp/render_cv.py',
  )
  const profile = await readFile(new URL('src/data/profile.ts', root), 'utf8')
  assert.ok(profile.includes(manifest.source.replace('src/', '@/') + '?url'))
})

test('every CV page has a real, ordered preview asset', async () => {
  assert.ok(manifest.pageCount > 0)
  assert.equal(manifest.pages.length, manifest.pageCount)
  assert.equal(new Set(manifest.pages.map(({ file }) => file)).size, manifest.pageCount)
  for (const [index, page] of manifest.pages.entries()) {
    assert.equal(page.file, `page-${String(index + 1).padStart(2, '0')}.webp`)
    const image = await readFile(new URL(page.file, previews))
    assert.equal(image.subarray(0, 4).toString(), 'RIFF')
    assert.equal(image.subarray(8, 12).toString(), 'WEBP')
    assert.ok(image.length > 1000 && page.width > 0 && page.height > 0)
  }
})

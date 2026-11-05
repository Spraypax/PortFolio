import manifest from './assets/cv/manifest.json'

const previews = import.meta.glob<string>('./assets/cv/page-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** Page previews generated from the existing PDF by scripts/psp/render_cv.py. */
export const cvPages = manifest.pages.map((page) => ({
  ...page,
  url: previews[`./assets/cv/${page.file}`],
}))

export const cvPageCount = cvPages.length
export const cvSourceSha256 = manifest.sourceSha256

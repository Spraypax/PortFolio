export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers and insecure contexts may not expose the Clipboard API.
  }

  const previousFocus = document.activeElement
  const field = document.createElement('textarea')
  field.value = text
  field.readOnly = true
  field.tabIndex = -1
  field.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px;opacity:0'

  try {
    document.body.appendChild(field)
    field.select()
    return document.execCommand('copy')
  } catch {
    // The mailto link still works when both clipboard methods are unavailable.
    return false
  } finally {
    field.remove()
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
  }
}

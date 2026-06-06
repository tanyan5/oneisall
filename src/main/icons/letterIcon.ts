export function createLetterIconDataUrl(letter: string, bg: string): string {
  const safe = letter.replace(/[<>&"']/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
<rect width="48" height="48" rx="10" fill="${bg}"/>
<text x="24" y="24" dominant-baseline="central" text-anchor="middle" fill="white" font-family="Segoe UI,system-ui,sans-serif" font-size="22" font-weight="600">${safe}</text>
</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

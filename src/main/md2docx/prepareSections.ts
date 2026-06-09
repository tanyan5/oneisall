import path from 'path'

const TOC_LINE = /^\s*\[TOC\]\s*$/im
const H1_LINE = /^#\s+(.+)$/m

export interface PreparedSections {
  tocMarkdown: string
  bodyMarkdown: string
  documentTitle: string
}

export function extractDocumentTitle(markdown: string, sourcePath: string): string {
  const match = markdown.match(H1_LINE)
  if (match?.[1]) return match[1].trim()
  return path.parse(sourcePath).name
}

export function stripTocMarker(markdown: string): string {
  return markdown.replace(TOC_LINE, '').trimStart()
}

export function prepareContinuousBody(rawMd: string): string {
  return stripTocMarker(rawMd)
}

export function prepareSections(rawMd: string, sourcePath: string): PreparedSections {
  const documentTitle = extractDocumentTitle(rawMd, sourcePath)
  const bodyMarkdown = stripTocMarker(rawMd)
  return {
    tocMarkdown: '[TOC]',
    bodyMarkdown,
    documentTitle
  }
}

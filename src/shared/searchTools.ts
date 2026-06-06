import type { ToolMeta } from './types'

export function scoreTool(tool: ToolMeta, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const name = tool.name.toLowerCase()
  const desc = (tool.description ?? '').toLowerCase()
  let score = 0

  if (name.startsWith(q)) score += 3
  else if (name.includes(q)) score += 2

  if (desc.includes(q)) score += 1

  return score
}

export function splitSearchResults(
  tools: ToolMeta[],
  query: string
): { primary: ToolMeta[]; secondary: ToolMeta[] } {
  const q = query.trim()
  if (!q) return { primary: [], secondary: [] }

  const scored = tools
    .map((tool) => ({ tool, score: scoreTool(tool, q) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))

  if (scored.length === 0) return { primary: [], secondary: [] }

  const maxScore = scored[0].score
  const threshold = Math.max(maxScore - 1, 1)
  const primary = scored.filter((item) => item.score >= threshold).map((item) => item.tool)
  const primaryIds = new Set(primary.map((t) => t.id))
  const secondary = scored
    .filter((item) => !primaryIds.has(item.tool.id))
    .map((item) => item.tool)

  return { primary, secondary }
}

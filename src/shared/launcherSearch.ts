import type { LauncherRowItem } from './shankai'

export function scoreLauncherItem(item: LauncherRowItem, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  const name = item.name.toLowerCase()
  const desc = (item.description ?? '').toLowerCase()
  let score = 0

  if (name.startsWith(q)) score += 3
  else if (name.includes(q)) score += 2

  if (desc.includes(q)) score += 1

  return score
}

export function splitLauncherSearchResults(
  items: LauncherRowItem[],
  query: string
): { primary: LauncherRowItem[]; secondary: LauncherRowItem[] } {
  const q = query.trim()
  if (!q) return { primary: [], secondary: [] }

  const scored = items
    .map((item) => ({ item, score: scoreLauncherItem(item, q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))

  if (scored.length === 0) return { primary: [], secondary: [] }

  const maxScore = scored[0].score
  const threshold = Math.max(maxScore - 1, 1)
  const primary = scored.filter((entry) => entry.score >= threshold).map((entry) => entry.item)
  const primaryKeys = new Set(primary.map((item) => `${item.kind}:${item.id}`))
  const secondary = scored
    .filter((entry) => !primaryKeys.has(`${entry.item.kind}:${entry.item.id}`))
    .map((entry) => entry.item)

  return { primary, secondary }
}

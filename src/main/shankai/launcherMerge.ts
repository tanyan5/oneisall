import type { LauncherRecentRow, LauncherRowItem } from '../../shared/shankai'
import type { ShankaiStore } from './ShankaiStore'
import type { SettingsStore } from '../settings/SettingsStore'
import type { ToolMeta } from '../../shared/types'

/** Collapsed launcher row shows 10; store more so「展开全部」can reveal the rest. */
const MAX_RECENT = 20

export function getMergedLauncherRecent(
  settingsStore: SettingsStore,
  shankaiStore: ShankaiStore,
  tools: ToolMeta[]
): LauncherRecentRow[] {
  const toolMap = new Map(tools.map((t) => [t.id, t]))
  const entries: LauncherRecentRow[] = []

  for (const entry of settingsStore.getSettings().recentTools) {
    const tool = toolMap.get(entry.id)
    if (!tool?.enabled) continue
    entries.push({
      kind: 'tool',
      id: entry.id,
      name: tool.name,
      description: tool.description,
      lastUsedAt: entry.lastUsedAt
    })
  }

  for (const launch of shankaiStore.getRecentLaunches()) {
    const shortcut = shankaiStore.getShortcut(launch.shortcutId)
    if (!shortcut) continue
    entries.push({
      kind: 'app',
      id: shortcut.id,
      name: shortcut.name,
      targetPath: shortcut.targetPath,
      lastUsedAt: launch.lastUsedAt
    })
  }

  return entries.sort((a, b) => b.lastUsedAt - a.lastUsedAt).slice(0, MAX_RECENT)
}

export function buildLauncherSearchItems(
  tools: ToolMeta[],
  shankaiStore: ShankaiStore
): LauncherRowItem[] {
  const items: LauncherRowItem[] = []

  for (const tool of tools) {
    if (!tool.enabled) continue
    items.push({
      kind: 'tool',
      id: tool.id,
      name: tool.name,
      description: tool.description
    })
  }

  for (const shortcut of shankaiStore.listAllShortcuts()) {
    items.push({
      kind: 'app',
      id: shortcut.id,
      name: shortcut.name,
      targetPath: shortcut.targetPath
    })
  }

  return items
}

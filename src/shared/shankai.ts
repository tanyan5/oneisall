export type ShankaiTheme = 'cyber-grid' | 'aurora'

export interface ShankaiModule {
  id: string
  name: string
  order: number
  createdAt: number
}

export interface ShankaiShortcut {
  id: string
  moduleId: string
  name: string
  targetPath: string
  createdAt: number
}

export interface ShankaiRecentLaunch {
  kind: 'app'
  shortcutId: string
  lastUsedAt: number
}

export interface ShankaiData {
  theme: ShankaiTheme
  modules: ShankaiModule[]
  shortcuts: ShankaiShortcut[]
  recentLaunches: ShankaiRecentLaunch[]
}

export type LauncherItemKind = 'tool' | 'app'

export interface LauncherRowItem {
  kind: LauncherItemKind
  id: string
  name: string
  description?: string
  targetPath?: string
}

export interface LauncherRecentRow extends LauncherRowItem {
  lastUsedAt: number
}

export type AddShortcutResult =
  | { ok: true; shortcut: ShankaiShortcut }
  | { ok: false; error: string }
  | { ok: false; conflict: true; shortcut: ShankaiShortcut; moduleName: string }

export type LaunchResult = { ok: true } | { ok: false; error: string }

export type OpResult = { ok: true } | { ok: false; error: string }

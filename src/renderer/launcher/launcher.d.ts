import type { LauncherRecentRow, LauncherRowItem, LaunchResult } from '../../shared/shankai'

export interface LauncherAPI {
  getRecent: () => Promise<LauncherRecentRow[]>
  getSearchItems: () => Promise<LauncherRowItem[]>
  openTool: (id: string) => Promise<void>
  openApp: (shortcutId: string) => Promise<LaunchResult>
  hide: () => Promise<void>
  openHome: () => Promise<void>
  getPinnedKeywords: () => Promise<Array<{ toolId: string; keywordId: string; label: string }>>
  resize: (height: number) => Promise<void>
  getShortcuts: () => Promise<{ openLauncher: string }>
  getBrandIcon: () => Promise<string | null>
  getToolIcon: (toolId: string) => Promise<string | null>
  getAppIcon: (targetPath: string) => Promise<string | null>
  onFocus: (callback: () => void) => () => void
}

declare global {
  interface Window {
    launcher: LauncherAPI
  }
}

export {}

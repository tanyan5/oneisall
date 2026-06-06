export type ClipboardItemType = 'text' | 'html' | 'image' | 'files'

export type ClipboardListCategory = 'all' | 'text' | 'image' | 'files' | 'favorite'

export interface ClipboardListParams {
  q?: string
  category?: ClipboardListCategory
  offset?: number
  limit?: number
}

export interface ClipboardItem {
  id: string
  type: ClipboardItemType
  preview: string
  detail: string
  createdAt: number
  pinned: boolean
  favorite: boolean
}

export interface ClipboardOpResult {
  ok: boolean
  error?: string
}

export type NavSurface = 'home' | 'tool' | 'settings'

export type NavPopResult =
  | { action: 'show-launcher' }
  | { action: 'navigate'; surface: NavSurface; toolId?: string }

export interface LaunchKeywordAction {
  id: string
  label: string
}

export interface LaunchKeyword {
  id: string
  label: string
  actions: LaunchKeywordAction[]
}

export interface PinnedSearchKeyword {
  toolId: string
  keywordId: string
  label: string
}

export interface ToolMeta {
  id: string
  name: string
  version: string
  description?: string
  /** Resolved relative to plugin dir when set in manifest */
  icon?: string
  launchKeywords?: LaunchKeyword[]
  enabled: boolean
  builtin: boolean
}

export interface PluginManifest {
  id: string
  name: string
  version: string
  description?: string
  /** Optional icon file relative to plugin directory (default: icon.png) */
  icon?: string
  launchKeywords?: LaunchKeyword[]
  main?: string
  renderer?: string
  capabilities?: string[]
}

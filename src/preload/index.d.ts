import type {
  ClipboardItem,
  ClipboardListParams,
  ClipboardOpResult,
  NavPopResult,
  ToolMeta
} from '../shared/types'

import type { ShortcutActionId } from '../shared/shortcuts'

import type { AppSettings } from '../main/settings/SettingsStore'
import type { AnnouncementItem, HomeSearchCatalog, PromoItem } from '../shared/home'
import type { LauncherRecentRow } from '../shared/shankai'
import type { PinState } from '../main/window'

import type {

  AddShortcutResult,

  LaunchResult,

  OpResult,

  ShankaiModule,

  ShankaiShortcut,

  ShankaiTheme

} from '../shared/shankai'



export interface RegisterResult {

  ok: boolean

  errors?: Partial<Record<ShortcutActionId, string>>

}



export interface ToolboxAPI {

  tools: {

    list: () => Promise<ToolMeta[]>

    getActive: () => Promise<string>

    consumePending: () => Promise<string | null>

    setActive: (id: string) => Promise<void>

    getLastUsed: () => Promise<string | null>

    getRecent: () => Promise<ToolMeta[]>

    getIcon: (toolId: string) => Promise<string | null>

  }

  settings: {

    get: () => Promise<AppSettings>

    saveShortcuts: (shortcuts: Record<ShortcutActionId, string>) => Promise<RegisterResult>

    resetShortcuts: () => Promise<RegisterResult>

    pinKeyword: (entry: { toolId: string; keywordId: string; label: string }) => Promise<void>

  }

  clipboard: {

    list: (params?: ClipboardListParams) => Promise<ClipboardItem[]>

    count: (params?: ClipboardListParams) => Promise<number>

    delete: (id: string) => Promise<void>

    deleteMany: (ids: string[]) => Promise<number>

    copyToSystem: (id: string) => Promise<boolean>

    setPinned: (id: string, pinned: boolean) => Promise<ClipboardOpResult>

    setFavorite: (id: string, favorite: boolean) => Promise<ClipboardOpResult>

    update: (id: string, text: string) => Promise<boolean>

    saveAs: (id: string) => Promise<{ ok: boolean; path?: string; error?: string }>

    clearAll: () => Promise<void>

    getImagePreview: (id: string) => Promise<string | null>

    setPaused: (paused: boolean) => Promise<void>

    isPaused: () => Promise<boolean>

    onChanged: (callback: (item: ClipboardItem) => void) => () => void

  }

  shankai: {

    getTheme: () => Promise<ShankaiTheme>

    setTheme: (theme: ShankaiTheme) => Promise<void>

    listModules: () => Promise<ShankaiModule[]>

    createModule: (name?: string) => Promise<ShankaiModule>

    renameModule: (id: string, name: string) => Promise<OpResult>

    removeModule: (id: string) => Promise<OpResult>

    listShortcuts: (moduleId?: string) => Promise<ShankaiShortcut[]>

    addShortcut: (

      moduleId: string,

      targetPath: string,

      forceMove?: boolean

    ) => Promise<AddShortcutResult>

    moveShortcut: (shortcutId: string, toModuleId: string) => Promise<OpResult>

    removeShortcut: (id: string) => Promise<OpResult>

    launch: (id: string) => Promise<LaunchResult>

    getIcon: (targetPath: string) => Promise<string | null>

    pickTarget: () => Promise<string | null>

    resolveDroppedFile: (file: File) => string

  }

  navigation: {

    pop: () => Promise<NavPopResult>

    openToolFromHome: (id: string) => Promise<string>

    openSettingsFromShell: () => Promise<string>

  }

  window: {

    openClipboard: () => Promise<void>

    hide: () => Promise<void>

    togglePin: () => Promise<boolean>

    getPinState: () => Promise<PinState>

    minimize: () => Promise<void>

    maximize: () => Promise<void>

    close: () => Promise<void>

    setAlwaysOnTop: (flag: boolean) => Promise<void>

    syncTaskbarIcon: (toolId: string | null) => Promise<void>

    onPinStateChanged: (callback: (state: PinState) => void) => () => void

  }

  home: {

    getSearchCatalog: () => Promise<HomeSearchCatalog>

    getRecent: () => Promise<LauncherRecentRow[]>

    getAnnouncements: () => Promise<AnnouncementItem[]>

    dismissAnnouncement: (id: string) => Promise<AnnouncementItem[]>

    getPromo: () => Promise<PromoItem | null>

    dismissPromo: (id: string) => Promise<null>

  }

  shell: {
    openExternal: (url: string) => Promise<void>

    getBrandIcon: () => Promise<string | null>
  }

  onNavigateTool: (callback: (id: string) => void) => () => void

}



declare global {

  interface Window {

    toolbox: ToolboxAPI

  }

}



export {}



import { contextBridge, ipcRenderer, webUtils } from 'electron'

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



const toolbox = {

  tools: {

    list: (): Promise<ToolMeta[]> => ipcRenderer.invoke('tools:list'),

    getActive: (): Promise<string> => ipcRenderer.invoke('tools:getActive'),

    consumePending: (): Promise<string | null> => ipcRenderer.invoke('tools:consumePending'),

    setActive: (id: string): Promise<void> => ipcRenderer.invoke('tools:setActive', id),

    getLastUsed: (): Promise<string | null> => ipcRenderer.invoke('tools:getLastUsed'),

    getRecent: (): Promise<ToolMeta[]> => ipcRenderer.invoke('tools:getRecent'),

    getIcon: (toolId: string): Promise<string | null> => ipcRenderer.invoke('tools:getIcon', toolId)

  },

  settings: {

    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),

    saveShortcuts: (shortcuts: Record<ShortcutActionId, string>): Promise<RegisterResult> =>

      ipcRenderer.invoke('settings:saveShortcuts', shortcuts),

    resetShortcuts: (): Promise<RegisterResult> => ipcRenderer.invoke('settings:resetShortcuts'),

    pinKeyword: (entry: { toolId: string; keywordId: string; label: string }): Promise<void> =>
      ipcRenderer.invoke('settings:pinKeyword', entry)

  },

  clipboard: {

    list: (params?: ClipboardListParams): Promise<ClipboardItem[]> =>
      ipcRenderer.invoke('clipboard:list', params),

    count: (params?: ClipboardListParams): Promise<number> =>
      ipcRenderer.invoke('clipboard:count', params),

    delete: (id: string): Promise<void> => ipcRenderer.invoke('clipboard:delete', id),

    deleteMany: (ids: string[]): Promise<number> => ipcRenderer.invoke('clipboard:deleteMany', ids),

    copyToSystem: (id: string): Promise<boolean> => ipcRenderer.invoke('clipboard:copyToSystem', id),

    setPinned: (id: string, pinned: boolean): Promise<ClipboardOpResult> =>
      ipcRenderer.invoke('clipboard:setPinned', id, pinned),

    setFavorite: (id: string, favorite: boolean): Promise<ClipboardOpResult> =>
      ipcRenderer.invoke('clipboard:setFavorite', id, favorite),

    update: (id: string, text: string): Promise<boolean> => ipcRenderer.invoke('clipboard:update', id, text),

    saveAs: (id: string): Promise<{ ok: boolean; path?: string; error?: string }> =>
      ipcRenderer.invoke('clipboard:saveAs', id),

    clearAll: (): Promise<void> => ipcRenderer.invoke('clipboard:clearAll'),

    getImagePreview: (id: string): Promise<string | null> =>
      ipcRenderer.invoke('clipboard:getImagePreview', id),

    setPaused: (paused: boolean): Promise<void> => ipcRenderer.invoke('clipboard:setPaused', paused),

    isPaused: (): Promise<boolean> => ipcRenderer.invoke('clipboard:isPaused'),

    onChanged: (callback: (item: ClipboardItem) => void): (() => void) => {
      const handler = (_: Electron.IpcRendererEvent, item: ClipboardItem): void => callback(item)
      ipcRenderer.on('clipboard:changed', handler)
      return () => ipcRenderer.removeListener('clipboard:changed', handler)
    }

  },

  shankai: {

    getTheme: (): Promise<ShankaiTheme> => ipcRenderer.invoke('shankai:getTheme'),

    setTheme: (theme: ShankaiTheme): Promise<void> => ipcRenderer.invoke('shankai:setTheme', theme),

    listModules: (): Promise<ShankaiModule[]> => ipcRenderer.invoke('shankai:listModules'),

    createModule: (name?: string): Promise<ShankaiModule> =>

      ipcRenderer.invoke('shankai:createModule', name),

    renameModule: (id: string, name: string): Promise<OpResult> =>

      ipcRenderer.invoke('shankai:renameModule', id, name),

    removeModule: (id: string): Promise<OpResult> => ipcRenderer.invoke('shankai:removeModule', id),

    listShortcuts: (moduleId?: string): Promise<ShankaiShortcut[]> =>

      ipcRenderer.invoke('shankai:listShortcuts', moduleId),

    addShortcut: (

      moduleId: string,

      targetPath: string,

      forceMove?: boolean

    ): Promise<AddShortcutResult> =>

      ipcRenderer.invoke('shankai:addShortcut', moduleId, targetPath, forceMove),

    moveShortcut: (shortcutId: string, toModuleId: string): Promise<OpResult> =>

      ipcRenderer.invoke('shankai:moveShortcut', shortcutId, toModuleId),

    removeShortcut: (id: string): Promise<OpResult> => ipcRenderer.invoke('shankai:removeShortcut', id),

    launch: (id: string): Promise<LaunchResult> => ipcRenderer.invoke('shankai:launch', id),

    getIcon: (targetPath: string): Promise<string | null> =>

      ipcRenderer.invoke('shankai:getIcon', targetPath),

    pickTarget: (): Promise<string | null> => ipcRenderer.invoke('shankai:pickTarget'),

    resolveDroppedFile: (file: File): string => webUtils.getPathForFile(file)

  },

  navigation: {

    pop: (): Promise<NavPopResult> => ipcRenderer.invoke('navigation:pop'),

    openToolFromHome: (id: string): Promise<string> =>
      ipcRenderer.invoke('navigation:openToolFromHome', id),

    openSettingsFromShell: (): Promise<string> =>
      ipcRenderer.invoke('navigation:openSettingsFromShell')

  },

  window: {

    openClipboard: (): Promise<void> => ipcRenderer.invoke('window:openClipboard'),

    hide: (): Promise<void> => ipcRenderer.invoke('window:hide'),

    togglePin: (): Promise<boolean> => ipcRenderer.invoke('window:togglePin'),

    getPinState: (): Promise<PinState> => ipcRenderer.invoke('window:getPinState'),

    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),

    maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),

    close: (): Promise<void> => ipcRenderer.invoke('window:close'),

    setAlwaysOnTop: (flag: boolean): Promise<void> => ipcRenderer.invoke('window:setAlwaysOnTop', flag),

    syncTaskbarIcon: (toolId: string | null): Promise<void> =>
      ipcRenderer.invoke('window:syncTaskbarIcon', toolId),

    onPinStateChanged: (callback: (state: PinState) => void): (() => void) => {
      const handler = (_: Electron.IpcRendererEvent, state: PinState): void => callback(state)
      ipcRenderer.on('window:pin-state-changed', handler)
      return () => ipcRenderer.removeListener('window:pin-state-changed', handler)
    }

  },

  home: {

    getSearchCatalog: (): Promise<HomeSearchCatalog> => ipcRenderer.invoke('home:getSearchCatalog'),

    getRecent: (): Promise<LauncherRecentRow[]> => ipcRenderer.invoke('home:getRecent'),

    getAnnouncements: (): Promise<AnnouncementItem[]> => ipcRenderer.invoke('home:getAnnouncements'),

    dismissAnnouncement: (id: string): Promise<AnnouncementItem[]> =>
      ipcRenderer.invoke('home:dismissAnnouncement', id),

    getPromo: (): Promise<PromoItem | null> => ipcRenderer.invoke('home:getPromo'),

    dismissPromo: (id: string): Promise<null> => ipcRenderer.invoke('home:dismissPromo', id)

  },

  shell: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('shell:openExternal', url),

    getBrandIcon: (): Promise<string | null> => ipcRenderer.invoke('launcher:getBrandIcon')
  },

  onNavigateTool: (callback: (id: string) => void): (() => void) => {

    const handler = (_: Electron.IpcRendererEvent, id: string): void => callback(id)

    ipcRenderer.on('navigate-tool', handler)

    return () => ipcRenderer.removeListener('navigate-tool', handler)

  }

}



contextBridge.exposeInMainWorld('toolbox', toolbox)



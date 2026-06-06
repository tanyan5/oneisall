import { contextBridge, ipcRenderer } from 'electron'

import type { LauncherRecentRow, LauncherRowItem, LaunchResult } from '../shared/shankai'



const launcher = {

  getRecent: (): Promise<LauncherRecentRow[]> => ipcRenderer.invoke('launcher:getRecent'),

  getSearchItems: (): Promise<LauncherRowItem[]> => ipcRenderer.invoke('launcher:getSearchItems'),

  openTool: (id: string): Promise<void> => ipcRenderer.invoke('launcher:openTool', id),

  openApp: (shortcutId: string): Promise<LaunchResult> =>

    ipcRenderer.invoke('launcher:openApp', shortcutId),

  hide: (): Promise<void> => ipcRenderer.invoke('launcher:hide'),

  openHome: (): Promise<void> => ipcRenderer.invoke('launcher:openHome'),

  getPinnedKeywords: (): Promise<Array<{ toolId: string; keywordId: string; label: string }>> =>
    ipcRenderer.invoke('launcher:getPinnedKeywords'),

  resize: (height: number): Promise<void> => ipcRenderer.invoke('launcher:resize', height),

  getShortcuts: (): Promise<{ openLauncher: string }> => ipcRenderer.invoke('launcher:getShortcuts'),

  getBrandIcon: (): Promise<string | null> => ipcRenderer.invoke('launcher:getBrandIcon'),

  getToolIcon: (toolId: string): Promise<string | null> =>
    ipcRenderer.invoke('tools:getIcon', toolId),

  getAppIcon: (targetPath: string): Promise<string | null> =>
    ipcRenderer.invoke('shankai:getIcon', targetPath),

  onFocus: (callback: () => void): (() => void) => {

    const handler = (): void => callback()

    ipcRenderer.on('launcher:focus', handler)

    return () => ipcRenderer.removeListener('launcher:focus', handler)

  }

}



contextBridge.exposeInMainWorld('launcher', launcher)



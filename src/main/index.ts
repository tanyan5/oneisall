import { app, dialog, ipcMain, shell } from 'electron'
import { ClipboardStore } from './clipboard/ClipboardStore'
import { ClipboardWatcher } from './clipboard/ClipboardWatcher'
import { PluginHost } from './plugin/PluginHost'
import { createTray, destroyTray } from './tray'
import {
  createMainWindow,
  getMainWindow,
  showMainWindow,
  hideMainWindow,
  forceQuitWindow,
  consumePendingTool,
  togglePin,
  syncTaskbarIcon,
  setToolIconPathResolver,
  getPinState,
  setAlwaysOnTop,
  minimizeMainWindow,
  maximizeMainWindow,
  closeMainWindow
} from './window'
import { AnnouncementProvider } from './home/AnnouncementProvider'
import { PromoProvider } from './home/PromoProvider'
import { SettingsStore } from './settings/SettingsStore'
import { ShortcutManager } from './settings/ShortcutManager'
import { DEFAULT_SHORTCUTS, type ShortcutActionId } from '../shared/shortcuts'
import {
  destroyLauncherWindow,
  hideLauncher,
  resizeLauncher,
  showLauncher,
  toggleLauncher
} from './launcher/LauncherWindow'
import {
  navOpenClipboard,
  navOpenHome,
  navOpenSettings,
  navOpenTool,
  navPop
} from './navigation/NavigationStack'
import fs from 'fs'
import path from 'path'
import type { ClipboardListParams, ClipboardOpResult, ToolMeta } from '../shared/types'
import { initShankaiStore, getShankaiStore } from './shankai'
import { buildLauncherSearchItems, getMergedLauncherRecent } from './shankai/launcherMerge'
import { launchTarget } from './shankai/ShankaiLauncher'
import { ToolIconService } from './icons/ToolIconService'

let store: ClipboardStore
let watcher: ClipboardWatcher
let pluginHost: PluginHost
let settingsStore: SettingsStore
let shortcutManager: ShortcutManager
let toolIconService: ToolIconService
let announcementProvider: AnnouncementProvider
let promoProvider: PromoProvider
let activeToolId = 'home'

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    showMainWindow()
  })
}

function recordToolUse(id: string): void {
  if (id === 'home' || id === 'settings') return
  settingsStore.recordRecentTool(id)
}

function getRecentToolsMeta(): ToolMeta[] {
  const ids = settingsStore.getRecentToolIds()
  const all = pluginHost.getTools().filter((t) => t.enabled)
  const map = new Map(all.map((t) => [t.id, t]))
  return ids.map((id) => map.get(id)).filter((t): t is ToolMeta => Boolean(t))
}

function registerIpc(): void {
  ipcMain.handle('tools:list', () => pluginHost.getTools())

  ipcMain.handle('tools:getActive', () => activeToolId)

  ipcMain.handle('tools:consumePending', () => {
    const pending = consumePendingTool()
    if (pending) activeToolId = pending
    return pending
  })

  ipcMain.handle('tools:setActive', (_e, id: string) => {
    activeToolId = id
    if (id !== 'home' && id !== 'settings') recordToolUse(id)
  })

  ipcMain.handle('navigation:pop', () => {
    const result = navPop()
    if (result.action === 'navigate') {
      activeToolId =
        result.surface === 'home'
          ? 'home'
          : result.surface === 'settings'
            ? 'settings'
            : (result.toolId ?? activeToolId)
    }
    return result
  })

  ipcMain.handle('navigation:openToolFromHome', (_e, id: string) => {
    recordToolUse(id)
    activeToolId = navOpenTool(id, 'home')
    return activeToolId
  })

  ipcMain.handle('navigation:openSettingsFromShell', () => {
    activeToolId = navOpenSettings('shell')
    return activeToolId
  })

  ipcMain.handle('tools:getLastUsed', () => settingsStore.getLastUsedToolId())

  ipcMain.handle('tools:getRecent', () => getRecentToolsMeta())

  ipcMain.handle('tools:getIcon', (_e, toolId: string) => toolIconService.getIcon(toolId))

  ipcMain.handle('settings:get', () => settingsStore.getSettings())

  ipcMain.handle('settings:saveShortcuts', (_e, shortcuts: Record<ShortcutActionId, string>) => {
    return shortcutManager.saveAndRegister(shortcuts)
  })

  ipcMain.handle('settings:resetShortcuts', () => {
    return shortcutManager.resetAndRegister()
  })

  ipcMain.handle('settings:pinKeyword', (_e, entry: { toolId: string; keywordId: string; label: string }) => {
    settingsStore.pinSearchKeyword(entry)
    return settingsStore.getPinnedSearchKeywords()
  })

  ipcMain.handle('launcher:getPinnedKeywords', () => settingsStore.getPinnedSearchKeywords())

  ipcMain.handle('launcher:openHome', () => {
    activeToolId = navOpenHome()
  })

  ipcMain.handle('window:hide', () => {
    hideMainWindow()
  })

  ipcMain.handle('window:togglePin', () => togglePin(activeToolId))

  ipcMain.handle('window:syncTaskbarIcon', (_e, toolId: string | null) => {
    syncTaskbarIcon(toolId)
  })

  ipcMain.handle('window:getPinState', () => getPinState())

  ipcMain.handle('window:minimize', () => minimizeMainWindow())

  ipcMain.handle('window:maximize', () => maximizeMainWindow())

  ipcMain.handle('window:close', () => closeMainWindow())

  ipcMain.handle('window:setAlwaysOnTop', (_e, flag: boolean) => setAlwaysOnTop(flag))

  ipcMain.handle('home:getSearchCatalog', () => {
    const tools = pluginHost.getTools().filter((t) => t.enabled)
    const items = buildLauncherSearchItems(tools, getShankaiStore())
    return { items, count: items.length }
  })

  ipcMain.handle('home:getRecent', () => {
    const tools = pluginHost.getTools()
    return getMergedLauncherRecent(settingsStore, getShankaiStore(), tools)
  })

  ipcMain.handle('home:getAnnouncements', () => {
    const dismissed = settingsStore.getSettings().dismissedAnnouncementIds
    return announcementProvider.loadActive(dismissed)
  })

  ipcMain.handle('home:dismissAnnouncement', (_e, id: string) => {
    settingsStore.dismissAnnouncement(id)
    return announcementProvider.loadActive(settingsStore.getSettings().dismissedAnnouncementIds)
  })

  ipcMain.handle('home:getPromo', () => {
    const { dismissedPromos, showPromo } = settingsStore.getSettings()
    const dismissedIds = dismissedPromos.map((e) => e.id)
    promoProvider.scheduleRemoteFetch()
    return promoProvider.getActive(dismissedIds, showPromo)
  })

  ipcMain.handle('home:dismissPromo', (_e, id: string) => {
    settingsStore.dismissPromo(id)
    return null
  })

  ipcMain.handle('launcher:hide', () => {
    hideLauncher()
  })

  ipcMain.handle('launcher:resize', (_e, height: number) => {
    resizeLauncher(height)
  })

  ipcMain.handle('launcher:getShortcuts', () => {
    const shortcuts = settingsStore.getSettings().shortcuts
    return {
      openLauncher: shortcuts.openLauncher ?? DEFAULT_SHORTCUTS.openLauncher
    }
  })

  ipcMain.handle('launcher:getBrandIcon', () => {
    const names = ['tray-32.png', 'tray.png', 'tray-16.png']
    const bases = [
      path.join(process.cwd(), 'resources', 'tray'),
      path.join(app.getAppPath(), 'resources', 'tray'),
      path.join(process.resourcesPath, 'tray')
    ]
    for (const base of bases) {
      for (const name of names) {
        const p = path.join(base, name)
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p)
          return `data:image/png;base64,${buf.toString('base64')}`
        }
      }
    }
    return null
  })

  ipcMain.handle('launcher:getRecent', () => {
    const tools = pluginHost.getTools()
    return getMergedLauncherRecent(settingsStore, getShankaiStore(), tools)
  })

  ipcMain.handle('launcher:getSearchItems', () => {
    const tools = pluginHost.getTools().filter((t) => t.enabled)
    return buildLauncherSearchItems(tools, getShankaiStore())
  })

  ipcMain.handle('launcher:openTool', (_e, id: string) => {
    recordToolUse(id)
    activeToolId = navOpenTool(id, 'launcher')
  })

  ipcMain.handle('launcher:openApp', async (_e, shortcutId: string) => {
    const store = getShankaiStore()
    const shortcut = store.getShortcut(shortcutId)
    if (!shortcut) return { ok: false, error: '应用不存在' }
    const result = await launchTarget(shortcut.targetPath)
    if (result.ok) store.recordAppLaunch(shortcutId)
    hideLauncher()
    return result
  })

  ipcMain.handle('clipboard:list', (_e, params?: ClipboardListParams) => {
    return store.list(params ?? {})
  })

  ipcMain.handle('clipboard:count', (_e, params?: ClipboardListParams) => {
    return store.count(params ?? {})
  })

  ipcMain.handle('clipboard:delete', (_e, id: string) => {
    return watcher ? store.deleteById(id) : false
  })

  ipcMain.handle('clipboard:deleteMany', (_e, ids: string[]) => {
    return store.deleteMany(ids)
  })

  ipcMain.handle('clipboard:copyToSystem', (_e, id: string) => {
    return watcher.copyItemToSystem(id)
  })

  ipcMain.handle('clipboard:setPinned', (_e, id: string, pinned: boolean): ClipboardOpResult => {
    return store.setPinned(id, pinned)
  })

  ipcMain.handle('clipboard:setFavorite', (_e, id: string, favorite: boolean): ClipboardOpResult => {
    return store.setFavorite(id, favorite)
  })

  ipcMain.handle('clipboard:update', (_e, id: string, text: string) => {
    return store.updateText(id, text)
  })

  ipcMain.handle('clipboard:getImagePreview', (_e, id: string) => {
    return store.getImagePreview(id)
  })

  ipcMain.handle('clipboard:clearAll', () => {
    store.clearAll()
  })

  ipcMain.handle(
    'clipboard:saveAs',
    async (_e, id: string): Promise<{ ok: boolean; path?: string; error?: string }> => {
      const row = store.getRowById(id)
      if (!row) return { ok: false, error: '记录不存在' }

      const win = getMainWindow() ?? undefined

      if (row.type === 'text' || row.type === 'html') {
        const { canceled, filePath } = await dialog.showSaveDialog(win, {
          defaultPath: 'clipboard.txt',
          filters: [{ name: '文本', extensions: ['txt'] }]
        })
        if (canceled || !filePath) return { ok: false, error: 'cancelled' }
        fs.writeFileSync(filePath, row.detail ?? row.preview, 'utf8')
        return { ok: true, path: filePath }
      }

      if (row.type === 'image') {
        if (!row.payload_path || !fs.existsSync(row.payload_path)) {
          return { ok: false, error: '图片文件不存在' }
        }
        const { canceled, filePath } = await dialog.showSaveDialog(win, {
          defaultPath: `clipboard-${row.id.slice(0, 8)}.png`,
          filters: [{ name: 'PNG', extensions: ['png'] }]
        })
        if (canceled || !filePath) return { ok: false, error: 'cancelled' }
        fs.copyFileSync(row.payload_path, filePath)
        return { ok: true, path: filePath }
      }

      if (row.type === 'files') {
        const files = row.payload_json
          ? (JSON.parse(row.payload_json) as { path: string }[])
          : []
        if (files.length === 0) return { ok: false, error: '无文件路径' }
        const src = files[0].path
        if (!fs.existsSync(src)) return { ok: false, error: '源文件不存在' }
        const base = path.basename(src)
        const { canceled, filePath } = await dialog.showSaveDialog(win, {
          defaultPath: base,
          filters: [{ name: '所有文件', extensions: ['*'] }]
        })
        if (canceled || !filePath) return { ok: false, error: 'cancelled' }
        fs.copyFileSync(src, filePath)
        return { ok: true, path: filePath }
      }

      return { ok: false, error: '不支持的类型' }
    }
  )

  ipcMain.handle('clipboard:setPaused', (_e, paused: boolean) => {
    watcher.setPaused(paused)
  })

  ipcMain.handle('clipboard:isPaused', () => watcher.isPaused())

  ipcMain.handle('window:openClipboard', () => {
    recordToolUse('clipboard')
    activeToolId = navOpenClipboard()
  })

  ipcMain.handle('shell:openExternal', (_e, url: string) => {
    void shell.openExternal(url)
  })
}

async function bootstrap(): Promise<void> {
  settingsStore = new SettingsStore()
  announcementProvider = new AnnouncementProvider()
  promoProvider = new PromoProvider()
  initShankaiStore()
  shortcutManager = new ShortcutManager(settingsStore, {
    openClipboard: () => {
      recordToolUse('clipboard')
      activeToolId = navOpenClipboard()
    },
    openLauncher: () => toggleLauncher()
  })
  store = new ClipboardStore()
  watcher = new ClipboardWatcher(store)
  toolIconService = new ToolIconService()
  pluginHost = new PluginHost()

  registerIpc()

  watcher.setOnChange((item) => {
    const win = getMainWindow()
    win?.webContents.send('clipboard:changed', item)
  })

  const win = createMainWindow()
  win.once('ready-to-show', () => {
    win.show()
  })

  await pluginHost.initialize(
    {
      getMainWindow,
      clipboardStore: store,
      clipboardWatcher: watcher
    },
    toolIconService
  )

  setToolIconPathResolver((id) => toolIconService.getIconFilePath(id))

  createTray(
    () => {
      void pluginHost.shutdown()
      watcher.stop()
    },
    {
      onShowLauncher: () => showLauncher(),
      onOpenSettings: () => {
        activeToolId = navOpenSettings('tray')
      }
    }
  )

  const reg = shortcutManager.registerAll()
  if (!reg.ok) {
    console.warn('Failed to register some global shortcuts:', reg.errors)
  }
}

app.whenReady().then(() => void bootstrap())

app.on('window-all-closed', () => {
  // Tray keeps the app running when the main window is hidden.
})

app.on('before-quit', () => {
  shortcutManager?.unregisterAll()
  destroyLauncherWindow()
  destroyTray()
  forceQuitWindow()
  watcher?.stop()
  void pluginHost?.shutdown()
})

app.on('activate', () => {
  showMainWindow()
})

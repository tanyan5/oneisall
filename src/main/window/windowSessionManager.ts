import { BrowserWindow, nativeImage, shell, type WebContents } from 'electron'
import path from 'path'
import { resolveResource } from '../appPaths'

export interface PinState {
  pinned: boolean
  alwaysOnTop: boolean
  maximized: boolean
}

export interface NavigateToolPayload {
  toolId: string
  pinState: PinState
}

export interface WindowSession {
  window: BrowserWindow
  toolId: string
  pinned: boolean
  alwaysOnTop: boolean
  pendingToolId: string | null
  isHub: boolean
  navStack: Array<{ surface: 'home' | 'tool' | 'settings'; toolId?: string }>
}

const PLUGIN_WINDOW_TITLES: Record<string, string> = {
  home: 'OneIsAll',
  settings: 'OneIsAll - 设置',
  clipboard: 'OneIsAll - 剪贴板',
  shankai: 'OneIsAll - 闪开',
  demo: 'OneIsAll - 演示',
  md2docx: 'OneIsAll - Markdown 转 Word'
}

const sessions = new Map<number, WindowSession>()
const pinnedByToolId = new Map<string, BrowserWindow>()
let hubWindow: BrowserWindow | null = null
let resolveToolIconPath: ((toolId: string) => string | null) | null = null

function resolveAppIconPath(): string | undefined {
  const names = ['icon.ico', 'tray/tray-32.png', 'tray/tray.png']
  for (const name of names) {
    const segments = name.split('/')
    const p = resolveResource(...segments)
    if (p) return p
  }
  return undefined
}

function restoreAppIconForWindow(win: BrowserWindow): void {
  const iconPath = resolveAppIconPath()
  if (!iconPath) return
  const icon = nativeImage.createFromPath(iconPath)
  if (!icon.isEmpty()) win.setIcon(icon)
}

function syncTaskbarIconForWindow(win: BrowserWindow, activeToolId: string | null): void {
  const session = getSession(win)
  if (!session?.pinned) return

  let iconPath: string | undefined
  if (activeToolId && activeToolId !== 'home' && resolveToolIconPath) {
    const pluginPath = resolveToolIconPath(activeToolId)
    if (pluginPath) iconPath = pluginPath
  }
  if (!iconPath) iconPath = resolveAppIconPath()
  if (!iconPath) return
  const icon = nativeImage.createFromPath(iconPath)
  if (!icon.isEmpty()) win.setIcon(icon)
}

function broadcastPinState(win: BrowserWindow): void {
  if (win.isDestroyed()) return
  win.webContents.send('window:pin-state-changed', getPinStateForWindow(win))
}

function setWindowTitle(win: BrowserWindow, toolId: string): void {
  win.setTitle(PLUGIN_WINDOW_TITLES[toolId] ?? `OneIsAll - ${toolId}`)
}

function attachWindowLifecycle(win: BrowserWindow, session: WindowSession): void {
  win.on('close', (e) => {
    if (!(win as BrowserWindow & { _forceQuit?: boolean })._forceQuit) {
      e.preventDefault()
      win.hide()
    }
  })

  win.on('closed', () => {
    sessions.delete(win.webContents.id)
    if (session.pinned) pinnedByToolId.delete(session.toolId)
    if (session.isHub) hubWindow = null
  })

  win.on('maximize', () => broadcastPinState(win))
  win.on('unmaximize', () => broadcastPinState(win))
}

function createToolBrowserWindow(): BrowserWindow {
  const iconPath = resolveAppIconPath()
  const icon = iconPath ? nativeImage.createFromPath(iconPath) : undefined

  const win = new BrowserWindow({
    width: 960,
    height: 640,
    minWidth: 720,
    minHeight: 480,
    show: false,
    frame: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    icon: icon && !icon.isEmpty() ? icon : undefined,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return win
}

function registerSession(
  win: BrowserWindow,
  opts: { isHub?: boolean; toolId?: string }
): WindowSession {
  const session: WindowSession = {
    window: win,
    toolId: opts.toolId ?? 'home',
    pinned: false,
    alwaysOnTop: false,
    pendingToolId: null,
    isHub: opts.isHub ?? false,
    navStack: [{ surface: 'home' }]
  }
  sessions.set(win.webContents.id, session)
  attachWindowLifecycle(win, session)
  return session
}

function spawnHiddenHub(): BrowserWindow {
  const win = createToolBrowserWindow()
  registerSession(win, { isHub: true, toolId: 'home' })
  hubWindow = win
  return win
}

export function setToolIconPathResolver(fn: (toolId: string) => string | null): void {
  resolveToolIconPath = fn
}

export function getSession(win: BrowserWindow | null | undefined): WindowSession | null {
  if (!win || win.isDestroyed()) return null
  return sessions.get(win.webContents.id) ?? null
}

export function getSessionFromWebContents(webContents: WebContents): WindowSession | null {
  if (webContents.isDestroyed()) return null
  return sessions.get(webContents.id) ?? null
}

export function getHubWindow(): BrowserWindow | null {
  if (hubWindow && !hubWindow.isDestroyed()) return hubWindow
  return null
}

export function ensureHubWindow(): BrowserWindow {
  if (hubWindow && !hubWindow.isDestroyed()) return hubWindow
  return spawnHiddenHub()
}

export function getMainWindow(): BrowserWindow | null {
  const focused = BrowserWindow.getFocusedWindow()
  if (focused && getSession(focused)) return focused
  if (hubWindow && !hubWindow.isDestroyed()) return hubWindow
  for (const win of pinnedByToolId.values()) {
    if (!win.isDestroyed()) return win
  }
  return null
}

export function getHubToolId(): string {
  const hub = getHubWindow()
  return getSession(hub)?.toolId ?? 'home'
}

export function isHubVisibleWithUnpinnedPlugin(): boolean {
  const hub = getHubWindow()
  const session = getSession(hub)
  if (!hub || !session || session.pinned || !hub.isVisible()) return false
  return session.toolId !== 'home' && session.toolId !== 'settings'
}

export function focusPinnedTool(toolId: string): boolean {
  const win = pinnedByToolId.get(toolId)
  if (!win || win.isDestroyed()) {
    pinnedByToolId.delete(toolId)
    return false
  }
  const session = getSession(win)
  if (!session?.pinned) {
    pinnedByToolId.delete(toolId)
    return false
  }
  if (!win.isVisible()) win.show()
  win.focus()
  return true
}

export function hasPinnedPluginWindows(): boolean {
  return pinnedByToolId.size > 0
}

export function showToolInWindow(win: BrowserWindow, toolId: string): string {
  const session = getSession(win)
  if (!session) return toolId

  session.toolId = toolId
  session.pendingToolId = toolId
  setWindowTitle(win, toolId)
  broadcastPinState(win)

  if (!win.isVisible()) win.show()
  win.focus()

  const payload: NavigateToolPayload = { toolId, pinState: getPinStateForWindow(win) }
  win.webContents.send('navigate-tool', payload)
  return toolId
}

export function ensureUnpinnedForWindow(win: BrowserWindow): void {
  const session = getSession(win)
  if (!session?.pinned) return

  session.pinned = false
  pinnedByToolId.delete(session.toolId)
  win.setSkipTaskbar(true)
  restoreAppIconForWindow(win)
  broadcastPinState(win)
}

export function openToolInHub(toolId: string): string {
  const hub = ensureHubWindow()
  ensureUnpinnedForWindow(hub)
  return showToolInWindow(hub, toolId)
}

export function createMainWindow(): BrowserWindow {
  return ensureHubWindow()
}

export function showMainWindow(toolId?: string): void {
  const hub = ensureHubWindow()
  showToolInWindow(hub, toolId ?? 'home')
}

export function hideWindow(win: BrowserWindow): void {
  if (!win.isDestroyed()) win.hide()
}

export function hideHubWindow(): void {
  const hub = getHubWindow()
  if (hub) hideWindow(hub)
}

export function hideMainWindow(): void {
  hideHubWindow()
}

export function consumePendingToolForWindow(win: BrowserWindow): string | null {
  const session = getSession(win)
  if (!session) return null
  const id = session.pendingToolId
  session.pendingToolId = null
  if (id) session.toolId = id
  return id
}

export function getPinStateForWindow(win: BrowserWindow): PinState {
  const session = getSession(win)
  if (!session || win.isDestroyed()) {
    return { pinned: false, alwaysOnTop: false, maximized: false }
  }
  return {
    pinned: session.pinned,
    alwaysOnTop: session.alwaysOnTop,
    maximized: win.isMaximized()
  }
}

export function togglePinForWindow(win: BrowserWindow): boolean {
  const session = getSession(win)
  if (!session) return false

  if (!session.pinned) {
    session.pinned = true
    win.setSkipTaskbar(false)
    syncTaskbarIconForWindow(win, session.toolId)
    pinnedByToolId.set(session.toolId, win)
    if (session.isHub) {
      session.isHub = false
      hubWindow = null
      spawnHiddenHub()
    }
  } else {
    session.pinned = false
    pinnedByToolId.delete(session.toolId)
    win.setSkipTaskbar(true)
    restoreAppIconForWindow(win)
    if (!hubWindow || hubWindow.isDestroyed()) {
      session.isHub = true
      hubWindow = win
    }
  }

  broadcastPinState(win)
  return session.pinned
}

export function setAlwaysOnTopForWindow(win: BrowserWindow, flag: boolean): void {
  const session = getSession(win)
  if (!session) return
  session.alwaysOnTop = flag
  if (!win.isDestroyed()) win.setAlwaysOnTop(flag)
  broadcastPinState(win)
}

export function minimizeWindow(win: BrowserWindow): void {
  if (!win.isDestroyed()) win.minimize()
}

export function maximizeWindow(win: BrowserWindow): void {
  if (win.isDestroyed()) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
  broadcastPinState(win)
}

export function closeWindow(win: BrowserWindow): void {
  ensureUnpinnedForWindow(win)
  hideWindow(win)
}

export function syncTaskbarIconForSession(win: BrowserWindow, toolId: string | null): void {
  syncTaskbarIconForWindow(win, toolId)
}

export function getSessionNavStack(
  win: BrowserWindow
): Array<{ surface: 'home' | 'tool' | 'settings'; toolId?: string }> {
  return getSession(win)?.navStack ?? []
}

export function setSessionNavStack(
  win: BrowserWindow,
  stack: Array<{ surface: 'home' | 'tool' | 'settings'; toolId?: string }>
): void {
  const session = getSession(win)
  if (session) session.navStack = stack
}

export function forceQuitAllWindows(): void {
  for (const session of sessions.values()) {
    if (!session.window.isDestroyed()) {
      ;(session.window as BrowserWindow & { _forceQuit?: boolean })._forceQuit = true
      session.window.destroy()
    }
  }
  sessions.clear()
  pinnedByToolId.clear()
  hubWindow = null
}

export function broadcastToAllToolWindows(channel: string, payload: unknown): void {
  for (const session of sessions.values()) {
    if (!session.window.isDestroyed()) {
      session.window.webContents.send(channel, payload)
    }
  }
}

/** @deprecated */
export function forceQuitWindow(): void {
  forceQuitAllWindows()
}

/** @deprecated use per-window APIs */
export function getPinState(): PinState {
  const win = getMainWindow()
  return win ? getPinStateForWindow(win) : { pinned: false, alwaysOnTop: false, maximized: false }
}

/** @deprecated use ensureUnpinnedForWindow on hub only */
export function ensureUnpinned(): void {
  const hub = getHubWindow()
  if (hub) ensureUnpinnedForWindow(hub)
}

/** @deprecated use togglePinForWindow */
export function togglePin(_activeToolId?: string | null): boolean {
  const win = getMainWindow()
  if (!win) return false
  return togglePinForWindow(win)
}

/** @deprecated */
export function syncTaskbarIcon(activeToolId: string | null): void {
  const win = getMainWindow()
  if (win) syncTaskbarIconForWindow(win, activeToolId)
}

/** @deprecated */
export function setAlwaysOnTop(flag: boolean): void {
  const win = getMainWindow()
  if (win) setAlwaysOnTopForWindow(win, flag)
}

/** @deprecated */
export function minimizeMainWindow(): void {
  const win = getMainWindow()
  if (win) minimizeWindow(win)
}

/** @deprecated */
export function maximizeMainWindow(): void {
  const win = getMainWindow()
  if (win) maximizeWindow(win)
}

/** @deprecated */
export function closeMainWindow(): void {
  const win = getMainWindow()
  if (win) closeWindow(win)
}

/** @deprecated */
export function setPendingTool(id: string): void {
  const hub = ensureHubWindow()
  const session = getSession(hub)
  if (session) session.pendingToolId = id
}

/** @deprecated */
export function consumePendingTool(): string | null {
  const win = getMainWindow()
  return win ? consumePendingToolForWindow(win) : null
}

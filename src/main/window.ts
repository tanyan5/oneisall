import { app, BrowserWindow, nativeImage, shell } from 'electron'

import fs from 'fs'

import path from 'path'



let mainWindow: BrowserWindow | null = null

let pendingToolId: string | null = null

let mainWindowPinned = false

let mainWindowAlwaysOnTop = false

let resolveToolIconPath: ((toolId: string) => string | null) | null = null

export interface PinState {
  pinned: boolean
  alwaysOnTop: boolean
  maximized: boolean
}

function broadcastPinState(): void {
  const win = getMainWindow()
  if (!win || win.isDestroyed()) return
  win.webContents.send('window:pin-state-changed', getPinState())
}



function resolveAppIconPath(): string | undefined {

  const names = ['icon.ico', 'tray/tray-32.png', 'tray/tray.png']

  const bases = [

    path.join(process.cwd(), 'resources'),

    path.join(app.getAppPath(), 'resources'),

    path.join(process.resourcesPath)

  ]

  for (const base of bases) {

    for (const name of names) {

      const p = path.join(base, name)

      if (fs.existsSync(p)) return p

    }

  }

  return undefined

}



export function getMainWindow(): BrowserWindow | null {

  return mainWindow

}

export function setToolIconPathResolver(fn: (toolId: string) => string | null): void {
  resolveToolIconPath = fn
}

function restoreAppIcon(): void {
  const win = getMainWindow()
  const iconPath = resolveAppIconPath()
  if (!win || win.isDestroyed() || !iconPath) return
  const icon = nativeImage.createFromPath(iconPath)
  if (!icon.isEmpty()) win.setIcon(icon)
}

/** Clear pin mode before shortcut-opened tools (unpinned immersive layout). */
export function ensureUnpinned(): void {
  if (!mainWindowPinned) return
  mainWindowPinned = false
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.setSkipTaskbar(true)
    restoreAppIcon()
  }
  broadcastPinState()
}

/** When pinned (taskbar visible), show plugin icon; otherwise default app icon. */
export function syncTaskbarIcon(activeToolId: string | null): void {
  const win = getMainWindow()
  if (!win || win.isDestroyed() || !mainWindowPinned) return

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



export function setPendingTool(id: string): void {

  pendingToolId = id

}



export function consumePendingTool(): string | null {

  const id = pendingToolId

  pendingToolId = null

  return id

}



export function createMainWindow(): BrowserWindow {

  if (mainWindow && !mainWindow.isDestroyed()) {

    return mainWindow

  }



  const iconPath = resolveAppIconPath()

  const icon = iconPath ? nativeImage.createFromPath(iconPath) : undefined



  mainWindow = new BrowserWindow({

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



  mainWindow.on('close', (e) => {

    if (!(mainWindow as BrowserWindow & { _forceQuit?: boolean })._forceQuit) {

      e.preventDefault()

      mainWindow?.hide()

    }

  })

  mainWindow.on('maximize', () => broadcastPinState())

  mainWindow.on('unmaximize', () => broadcastPinState())



  mainWindow.webContents.setWindowOpenHandler(({ url }) => {

    void shell.openExternal(url)

    return { action: 'deny' }

  })



  if (process.env.ELECTRON_RENDERER_URL) {

    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)

  } else {

    void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

  }



  return mainWindow

}



export function showMainWindow(toolId?: string): void {

  const win = createMainWindow()

  const target = toolId ?? 'home'

  setPendingTool(target)

  if (!win.isVisible()) win.show()

  win.focus()

  win.webContents.send('navigate-tool', target)

}



export function hideMainWindow(): void {

  mainWindow?.hide()

}



export function getPinState(): PinState {
  const win = getMainWindow()
  return {
    pinned: mainWindowPinned,
    alwaysOnTop: mainWindowAlwaysOnTop,
    maximized: win?.isMaximized() ?? false
  }
}

export function togglePin(activeToolId?: string | null): boolean {
  mainWindowPinned = !mainWindowPinned
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.setSkipTaskbar(!mainWindowPinned)
  }
  if (mainWindowPinned) {
    syncTaskbarIcon(activeToolId ?? null)
  } else {
    restoreAppIcon()
  }
  broadcastPinState()
  return mainWindowPinned
}

export function setAlwaysOnTop(flag: boolean): void {
  mainWindowAlwaysOnTop = flag
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(flag)
  }
  broadcastPinState()
}

export function minimizeMainWindow(): void {
  getMainWindow()?.minimize()
}

export function maximizeMainWindow(): void {
  const win = getMainWindow()
  if (!win || win.isDestroyed()) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
  broadcastPinState()
}

export function closeMainWindow(): void {
  hideMainWindow()
}

export function forceQuitWindow(): void {

  if (mainWindow && !mainWindow.isDestroyed()) {

    ;(mainWindow as BrowserWindow & { _forceQuit?: boolean })._forceQuit = true

    mainWindow.destroy()

    mainWindow = null

  }

}



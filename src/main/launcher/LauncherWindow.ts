import { BrowserWindow, screen } from 'electron'
import path from 'path'

export const LAUNCHER_WIDTH = 620
export const LAUNCHER_MIN_HEIGHT = 220
export const LAUNCHER_MAX_HEIGHT = 520

let launcherWindow: BrowserWindow | null = null
let lastResizeHeight = 0
let resizeDebounce: ReturnType<typeof setTimeout> | null = null

function getLauncherUrl(): string {
  if (process.env.ELECTRON_RENDERER_URL) {
    return `${process.env.ELECTRON_RENDERER_URL}/launcher/index.html`
  }
  return path.join(__dirname, '../renderer/launcher/index.html')
}

function getPreloadPath(): string {
  return path.join(__dirname, '../preload/launcher.js')
}

export function getLauncherWindow(): BrowserWindow | null {
  return launcherWindow && !launcherWindow.isDestroyed() ? launcherWindow : null
}

export function createLauncherWindow(): BrowserWindow {
  if (launcherWindow && !launcherWindow.isDestroyed()) {
    return launcherWindow
  }

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize

  launcherWindow = new BrowserWindow({
    width: LAUNCHER_WIDTH,
    height: LAUNCHER_MIN_HEIGHT,
    x: Math.round((screenW - LAUNCHER_WIDTH) / 2),
    y: Math.round(screenH * 0.2),
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    backgroundColor: '#06080f',
    autoHideMenuBar: true,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  let blurTimer: ReturnType<typeof setTimeout> | null = null
  launcherWindow.on('blur', () => {
    blurTimer = setTimeout(() => {
      hideLauncher()
      blurTimer = null
    }, 80)
  })
  launcherWindow.on('focus', () => {
    if (blurTimer) {
      clearTimeout(blurTimer)
      blurTimer = null
    }
  })

  const url = getLauncherUrl()
  if (process.env.ELECTRON_RENDERER_URL) {
    void launcherWindow.loadURL(url)
  } else {
    void launcherWindow.loadFile(url)
  }

  return launcherWindow
}

export function showLauncher(): void {
  const win = createLauncherWindow()
  const reveal = (): void => {
    if (!win.isVisible()) win.show()
    win.focus()
    win.webContents.send('launcher:focus')
  }
  if (win.webContents.isLoading()) {
    win.once('ready-to-show', reveal)
  } else {
    reveal()
  }
}

export function hideLauncher(): void {
  if (launcherWindow && !launcherWindow.isDestroyed() && launcherWindow.isVisible()) {
    launcherWindow.hide()
  }
}

export function resizeLauncher(contentHeight: number): void {
  const win = getLauncherWindow()
  if (!win) return

  const height = Math.round(
    Math.min(LAUNCHER_MAX_HEIGHT, Math.max(LAUNCHER_MIN_HEIGHT, contentHeight))
  )
  if (Math.abs(height - lastResizeHeight) < 4) return

  if (resizeDebounce) clearTimeout(resizeDebounce)
  resizeDebounce = setTimeout(() => {
    resizeDebounce = null
    const bounds = win.getBounds()
    if (Math.abs(height - bounds.height) < 4) return
    win.setBounds({ ...bounds, height })
    lastResizeHeight = height
  }, 50)
}

export function toggleLauncher(): void {
  const win = getLauncherWindow()
  if (win?.isVisible()) {
    hideLauncher()
  } else {
    showLauncher()
  }
}

export function destroyLauncherWindow(): void {
  if (launcherWindow && !launcherWindow.isDestroyed()) {
    launcherWindow.destroy()
    launcherWindow = null
  }
}

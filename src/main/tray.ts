import { app, Menu, Tray, nativeImage } from 'electron'
import { forceQuitWindow } from './window'
import { resolveResource } from './appPaths'

export interface TrayHandlers {
  onShowLauncher: () => void
  onOpenSettings: () => void
}

let tray: Tray | null = null

function resolveTrayIconPath(): string | null {
  const names = ['tray-32.png', 'tray.png', 'tray-16.png']
  for (const name of names) {
    const p = resolveResource('tray', name)
    if (p) return p
  }
  return null
}

function loadTrayIcon(): Electron.NativeImage {
  const iconPath = resolveTrayIconPath()
  if (!iconPath) {
    console.warn('Tray icon not found. Run: node scripts/gen-icons.mjs')
    return nativeImage.createEmpty()
  }
  const fileIcon = nativeImage.createFromPath(iconPath)
  if (fileIcon.isEmpty()) return nativeImage.createEmpty()
  return fileIcon.resize({ width: 16, height: 16 })
}

export function createTray(onQuit: () => void, handlers: TrayHandlers): Tray {
  tray = new Tray(loadTrayIcon())
  tray.setToolTip('OneIsAll')

  const menu = Menu.buildFromTemplate([
    { label: '显示', click: () => handlers.onShowLauncher() },
    { label: '设置', click: () => handlers.onOpenSettings() },
    {
      label: '退出',
      click: () => {
        forceQuitWindow()
        onQuit()
        app.quit()
      }
    }
  ])

  tray.setContextMenu(menu)
  tray.on('double-click', () => handlers.onShowLauncher())
  return tray
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}

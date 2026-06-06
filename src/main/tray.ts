import { app, Menu, Tray, nativeImage } from 'electron'

import fs from 'fs'

import path from 'path'

import { forceQuitWindow } from './window'

export interface TrayHandlers {
  onShowLauncher: () => void
  onOpenSettings: () => void
}

let tray: Tray | null = null

function resolveTrayIconPath(): string | null {
  const names = ['tray-32.png', 'tray.png', 'tray-16.png']
  const bases = [
    path.join(process.cwd(), 'resources', 'tray'),
    path.join(app.getAppPath(), 'resources', 'tray'),
    path.join(process.resourcesPath, 'tray')
  ]
  for (const base of bases) {
    for (const name of names) {
      const p = path.join(base, name)
      if (fs.existsSync(p)) return p
    }
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

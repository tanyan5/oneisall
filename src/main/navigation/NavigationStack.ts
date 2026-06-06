import { hideLauncher, showLauncher } from '../launcher/LauncherWindow'
import { ensureUnpinned, hideMainWindow, showMainWindow } from '../window'

export type NavSurface = 'home' | 'tool' | 'settings'

export interface NavFrame {
  surface: NavSurface
  toolId?: string
}

export type NavPopResult =
  | { action: 'show-launcher' }
  | { action: 'navigate'; surface: NavSurface; toolId?: string }

type ToolOpenFrom = 'launcher' | 'home' | 'shortcut'
type SettingsOpenFrom = 'tray' | 'shell'

let stack: NavFrame[] = []

export function getNavigationStack(): NavFrame[] {
  return [...stack]
}

function pushFrame(frame: NavFrame): void {
  const top = stack[stack.length - 1]
  if (top && top.surface === frame.surface && top.toolId === frame.toolId) {
    return
  }
  stack.push(frame)
}

export function navOpenHome(): string {
  stack = [{ surface: 'home' }]
  hideLauncher()
  showMainWindow('home')
  return 'home'
}

export function navOpenTool(id: string, from: ToolOpenFrom): string {
  if (from === 'shortcut') {
    ensureUnpinned()
  }
  if (from === 'home') {
    if (stack.length === 0 || stack[stack.length - 1]?.surface !== 'home') {
      stack = [{ surface: 'home' }]
    }
    pushFrame({ surface: 'tool', toolId: id })
  } else {
    stack = [{ surface: 'tool', toolId: id }]
  }
  if (from === 'launcher') hideLauncher()
  showMainWindow(id)
  return id
}

export function navOpenSettings(from: SettingsOpenFrom): string {
  if (from === 'tray') {
    stack = [{ surface: 'settings' }]
  } else {
    if (stack.length === 0 || stack[stack.length - 1]?.surface !== 'home') {
      stack = [{ surface: 'home' }]
    }
    pushFrame({ surface: 'settings' })
  }
  showMainWindow('settings')
  return 'settings'
}

export function navOpenClipboard(): string {
  return navOpenTool('clipboard', 'shortcut')
}

export function navPop(): NavPopResult {
  if (stack.length > 0) stack.pop()

  const top = stack[stack.length - 1]
  if (!top) {
    hideMainWindow()
    showLauncher()
    return { action: 'show-launcher' }
  }

  if (top.surface === 'home') {
    showMainWindow('home')
    return { action: 'navigate', surface: 'home' }
  }

  if (top.surface === 'tool' && top.toolId) {
    showMainWindow(top.toolId)
    return { action: 'navigate', surface: 'tool', toolId: top.toolId }
  }

  if (top.surface === 'settings') {
    showMainWindow('settings')
    return { action: 'navigate', surface: 'settings' }
  }

  hideMainWindow()
  showLauncher()
  return { action: 'show-launcher' }
}

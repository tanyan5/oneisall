import { hideLauncher, showLauncher } from '../launcher/LauncherWindow'
import { clearDismissedUnpinnedToolSession } from './DismissedToolSession'
import {
  ensureHubWindow,
  focusPinnedTool,
  getHubWindow,
  getSession,
  hideHubWindow,
  hideWindow,
  showToolInWindow
} from '../window'
import type { BrowserWindow } from 'electron'
import { BrowserWindow as ElectronBrowserWindow } from 'electron'

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

function pushFrame(stack: NavFrame[], frame: NavFrame): void {
  const top = stack[stack.length - 1]
  if (top && top.surface === frame.surface && top.toolId === frame.toolId) {
    return
  }
  stack.push(frame)
}

function resolveUnpinnedTargetWindow(from: ToolOpenFrom): BrowserWindow {
  const focused = ElectronBrowserWindow.getFocusedWindow()
  const focusedSession = focused ? getSession(focused) : null
  if (from === 'home' && focused && focusedSession && !focusedSession.pinned) {
    return focused
  }
  return ensureHubWindow()
}

export function getNavigationStack(): NavFrame[] {
  const hub = getHubWindow()
  const session = getSession(hub)
  return session ? [...session.navStack] : []
}

export function navOpenHome(): string {
  clearDismissedUnpinnedToolSession()
  const hub = ensureHubWindow()
  const session = getSession(hub)!
  session.navStack = [{ surface: 'home' }]
  hideLauncher()
  showToolInWindow(hub, 'home')
  return 'home'
}

export function navOpenTool(id: string, from: ToolOpenFrom, _currentToolId?: string): string {
  if ((from === 'shortcut' || from === 'launcher') && focusPinnedTool(id)) {
    if (from === 'launcher') hideLauncher()
    return id
  }

  clearDismissedUnpinnedToolSession()

  const targetWin = resolveUnpinnedTargetWindow(from)
  const session = getSession(targetWin)!

  if (from === 'home') {
    if (session.navStack.length === 0 || session.navStack[session.navStack.length - 1]?.surface !== 'home') {
      session.navStack = [{ surface: 'home' }]
    }
    pushFrame(session.navStack, { surface: 'tool', toolId: id })
  } else {
    session.navStack = [{ surface: 'tool', toolId: id }]
  }

  if (from === 'launcher') hideLauncher()

  return showToolInWindow(targetWin, id)
}

export function navOpenSettings(from: SettingsOpenFrom): string {
  clearDismissedUnpinnedToolSession()
  const targetWin = from === 'tray' ? ensureHubWindow() : resolveUnpinnedTargetWindow('home')
  const session = getSession(targetWin)!

  if (from === 'tray') {
    session.navStack = [{ surface: 'settings' }]
  } else {
    if (session.navStack.length === 0 || session.navStack[session.navStack.length - 1]?.surface !== 'home') {
      session.navStack = [{ surface: 'home' }]
    }
    pushFrame(session.navStack, { surface: 'settings' })
  }

  showToolInWindow(targetWin, 'settings')
  return 'settings'
}

export function navOpenClipboard(_currentToolId?: string): string {
  return navOpenTool('clipboard', 'shortcut')
}

export function navPop(forWindow: BrowserWindow): NavPopResult {
  const session = getSession(forWindow)
  if (!session) {
    hideWindow(forWindow)
    showLauncher()
    return { action: 'show-launcher' }
  }

  if (session.pinned) {
    return { action: 'navigate', surface: 'tool', toolId: session.toolId }
  }

  if (session.navStack.length > 0) session.navStack.pop()

  const top = session.navStack[session.navStack.length - 1]
  if (!top) {
    hideWindow(forWindow)
    showLauncher()
    return { action: 'show-launcher' }
  }

  if (top.surface === 'home') {
    showToolInWindow(forWindow, 'home')
    return { action: 'navigate', surface: 'home' }
  }

  if (top.surface === 'tool' && top.toolId) {
    showToolInWindow(forWindow, top.toolId)
    return { action: 'navigate', surface: 'tool', toolId: top.toolId }
  }

  if (top.surface === 'settings') {
    showToolInWindow(forWindow, 'settings')
    return { action: 'navigate', surface: 'settings' }
  }

  hideWindow(forWindow)
  showLauncher()
  return { action: 'show-launcher' }
}

export function hideMainWindow(): void {
  hideHubWindow()
}

export type ShortcutActionId = 'openClipboard' | 'openLauncher'

export const DEFAULT_SHORTCUTS: Record<ShortcutActionId, string> = {
  openClipboard: 'CommandOrControl+Shift+V',
  openLauncher: 'CommandOrControl+Shift+Space'
}

export const SHORTCUT_LABELS: Record<ShortcutActionId, string> = {
  openClipboard: '打开剪贴板',
  openLauncher: '打开快速启动'
}

export function formatShortcutDisplay(accelerator: string): string {
  return accelerator
    .replace(/CommandOrControl/g, 'Ctrl')
    .replace(/Command/g, 'Cmd')
    .replace(/Control/g, 'Ctrl')
    .replace(/\+/g, ' + ')
}

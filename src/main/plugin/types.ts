import type { BrowserWindow } from 'electron'
import type { ClipboardWatcher } from '../clipboard/ClipboardWatcher'
import type { ClipboardStore } from '../clipboard/ClipboardStore'

export interface PluginHostContext {
  getMainWindow: () => BrowserWindow | null
  clipboardStore: ClipboardStore
  clipboardWatcher: ClipboardWatcher
}

export interface IToolPlugin {
  id: string
  activate(host: PluginHostContext): void | Promise<void>
  deactivate(): void | Promise<void>
}

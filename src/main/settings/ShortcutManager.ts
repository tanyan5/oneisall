import { globalShortcut } from 'electron'
import type { ShortcutActionId } from '../../shared/shortcuts'
import { DEFAULT_SHORTCUTS } from '../../shared/shortcuts'
import type { SettingsStore } from './SettingsStore'

export type ShortcutRegistrationError = Partial<Record<ShortcutActionId, string>>

export interface RegisterResult {
  ok: boolean
  errors?: ShortcutRegistrationError
}

export type ShortcutHandlers = Record<ShortcutActionId, () => void>

export class ShortcutManager {
  constructor(
    private settingsStore: SettingsStore,
    private handlers: ShortcutHandlers
  ) {}

  registerAll(): RegisterResult {
    return this.applyBindings(this.settingsStore.getShortcuts())
  }

  saveAndRegister(shortcuts: Record<ShortcutActionId, string>): RegisterResult {
    const result = this.applyBindings(shortcuts)
    if (result.ok) {
      this.settingsStore.setShortcuts(shortcuts)
    } else {
      this.applyBindings(this.settingsStore.getShortcuts())
    }
    return result
  }

  resetAndRegister(): RegisterResult {
    const defaults = { ...DEFAULT_SHORTCUTS }
    const result = this.applyBindings(defaults)
    if (result.ok) {
      this.settingsStore.resetShortcuts()
    } else {
      this.applyBindings(this.settingsStore.getShortcuts())
    }
    return result
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll()
  }

  private applyBindings(shortcuts: Record<ShortcutActionId, string>): RegisterResult {
    globalShortcut.unregisterAll()
    const errors: ShortcutRegistrationError = {}

    for (const id of Object.keys(DEFAULT_SHORTCUTS) as ShortcutActionId[]) {
      const accelerator = shortcuts[id] ?? DEFAULT_SHORTCUTS[id]
      if (!accelerator || !this.isValidAccelerator(accelerator)) {
        errors[id] = '无效的快捷键组合'
        continue
      }
      const handler = this.handlers[id]
      const ok = globalShortcut.register(accelerator, handler)
      if (!ok) {
        errors[id] = '无法注册，可能已被其他程序占用'
      }
    }

    if (Object.keys(errors).length > 0) {
      globalShortcut.unregisterAll()
      return { ok: false, errors }
    }

    return { ok: true }
  }

  private isValidAccelerator(accelerator: string): boolean {
    const parts = accelerator.split('+')
    const keyPart = parts.find(
      (p) => !['CommandOrControl', 'Command', 'Control', 'Alt', 'Shift', 'Super'].includes(p)
    )
    return Boolean(keyPart && keyPart.length > 0)
  }
}

import React, { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_SHORTCUTS,
  SHORTCUT_LABELS,
  formatShortcutDisplay,
  type ShortcutActionId
} from '../../shared/shortcuts'

const ACTION_IDS = Object.keys(DEFAULT_SHORTCUTS) as ShortcutActionId[]

function eventToAccelerator(e: KeyboardEvent): string | null {
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return null

  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  let key = e.key
  if (key === ' ') key = 'Space'
  else if (key.length === 1) key = key.toUpperCase()
  else if (key === 'Escape') return null

  parts.push(key)
  if (parts.length < 2) return null
  return parts.join('+')
}

export function SettingsView(): React.ReactElement {
  const [shortcuts, setShortcuts] = useState<Record<ShortcutActionId, string>>({
    ...DEFAULT_SHORTCUTS
  })
  const [capturing, setCapturing] = useState<ShortcutActionId | null>(null)
  const [errors, setErrors] = useState<Partial<Record<ShortcutActionId, string>>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await window.toolbox.settings.get()
    setShortcuts(data.shortcuts)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!capturing) return

    const onKeyDown = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Escape') {
        setCapturing(null)
        return
      }
      const acc = eventToAccelerator(e)
      if (acc) {
        setShortcuts((prev) => ({ ...prev, [capturing]: acc }))
        setCapturing(null)
        setErrors((prev) => {
          const next = { ...prev }
          delete next[capturing]
          return next
        })
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [capturing])

  const showToast = (msg: string): void => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    const result = await window.toolbox.settings.saveShortcuts(shortcuts)
    setSaving(false)
    if (result.ok) {
      setErrors({})
      showToast('快捷键已保存')
      await load()
    } else {
      setErrors(result.errors ?? {})
      showToast('保存失败，请检查冲突项')
    }
  }

  const handleReset = async (): Promise<void> => {
    setSaving(true)
    const result = await window.toolbox.settings.resetShortcuts()
    setSaving(false)
    if (result.ok) {
      setErrors({})
      setShortcuts({ ...DEFAULT_SHORTCUTS })
      showToast('已恢复默认快捷键')
    } else {
      setErrors(result.errors ?? {})
      showToast('恢复失败，快捷键仍被占用')
      await load()
    }
  }

  return (
    <div className="settings-view">
      <header className="view-header window-drag">
        <h1>设置</h1>
      </header>

      <section className="settings-section">
        <h2 className="settings-section-title">全局快捷键</h2>
        <p className="settings-section-desc">
          点击输入框后按下新的组合键。若与系统或其他软件冲突，保存时会提示错误。
        </p>

        <ul className="shortcut-list">
          {ACTION_IDS.map((id) => (
            <li key={id} className="shortcut-row">
              <span className="shortcut-label">{SHORTCUT_LABELS[id]}</span>
              <button
                type="button"
                className={`shortcut-input ${capturing === id ? 'capturing' : ''} ${errors[id] ? 'has-error' : ''}`}
                onClick={() => setCapturing(id)}
              >
                {capturing === id
                  ? '请按下快捷键…'
                  : formatShortcutDisplay(shortcuts[id] ?? DEFAULT_SHORTCUTS[id])}
              </button>
              {errors[id] && <span className="shortcut-error">{errors[id]}</span>}
            </li>
          ))}
        </ul>

        <div className="settings-actions">
          <button type="button" className="btn primary" disabled={saving} onClick={() => void handleSave()}>
            保存
          </button>
          <button type="button" className="btn secondary" disabled={saving} onClick={() => void handleReset()}>
            恢复默认
          </button>
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

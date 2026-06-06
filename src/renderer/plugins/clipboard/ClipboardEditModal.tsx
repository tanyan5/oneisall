import React, { useEffect, useState } from 'react'
import type { ClipboardItem } from '../../../shared/types'

interface ClipboardEditModalProps {
  item: ClipboardItem
  onSave: (text: string) => void
  onClose: () => void
}

export function ClipboardEditModal({ item, onSave, onClose }: ClipboardEditModalProps): React.ReactElement {
  const [text, setText] = useState(item.detail)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && text.trim()) {
        e.preventDefault()
        e.stopPropagation()
        onSave(text)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose, onSave, text])

  return (
    <div className="clipboard-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="clipboard-modal"
        role="dialog"
        aria-labelledby="clipboard-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="clipboard-modal-header">
          <h2 id="clipboard-edit-title">编辑</h2>
          <button type="button" className="btn secondary small" onClick={onClose}>
            取消
          </button>
        </header>
        <div className="clipboard-modal-body">
          <textarea
            className="clipboard-edit-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="编辑内容"
          />
        </div>
        <footer className="clipboard-modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => onSave(text)}
            disabled={!text.trim()}
          >
            保存
          </button>
        </footer>
      </div>
    </div>
  )
}

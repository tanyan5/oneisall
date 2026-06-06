import React, { useEffect, useState } from 'react'
import type { ClipboardItem } from '../../../shared/types'

interface ClipboardDetailModalProps {
  item: ClipboardItem
  onClose: () => void
}

function formatFullTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN')
}

function typeLabel(type: ClipboardItem['type']): string {
  switch (type) {
    case 'text':
      return '文本'
    case 'html':
      return 'HTML'
    case 'image':
      return '图片'
    case 'files':
      return '文件'
    default:
      return type
  }
}

export function ClipboardDetailModal({ item, onClose }: ClipboardDetailModalProps): React.ReactElement {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (item.type !== 'image') return
    let cancelled = false
    void window.toolbox.clipboard.getImagePreview(item.id).then((url) => {
      if (!cancelled) setImageUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [item.id, item.type])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return (
    <div className="clipboard-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="clipboard-modal"
        role="dialog"
        aria-labelledby="clipboard-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="clipboard-modal-header">
          <h2 id="clipboard-detail-title">详情</h2>
          <button type="button" className="btn secondary small" onClick={onClose}>
            关闭
          </button>
        </header>
        <div className="clipboard-modal-body">
          {item.type === 'image' ? (
            imageUrl ? (
              <img src={imageUrl} alt="剪贴板图片" className="clipboard-modal-image" />
            ) : (
              <p className="clipboard-empty">图片加载中…</p>
            )
          ) : item.type === 'files' ? (
            <pre>{item.detail || item.preview}</pre>
          ) : (
            <pre>{item.detail}</pre>
          )}
          <div className="clipboard-modal-meta">
            类型：{typeLabel(item.type)} · 时间：{formatFullTime(item.createdAt)}
            {item.pinned ? ' · 已置顶' : ''}
            {item.favorite ? ' · 已收藏' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

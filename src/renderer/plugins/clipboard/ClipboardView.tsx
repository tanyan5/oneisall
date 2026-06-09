import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ClipboardItem, ClipboardListCategory } from '../../../shared/types'
import { LazyIcon } from '../../components/LazyIcon'
import { getCachedToolIcon } from '../../components/toolIconCache'
import { ClipboardDetailModal } from './ClipboardDetailModal'
import { ClipboardEditModal } from './ClipboardEditModal'
import {
  CLIPBOARD_SHORTCUT_KEY_TO_ACTION,
  ClipboardToolbar,
  type ClipboardToolbarAction
} from './ClipboardToolbar'
import './clipboard.css'

const TABS: Array<{ id: ClipboardListCategory; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'text', label: '文本' },
  { id: 'image', label: '图片' },
  { id: 'files', label: '文件' },
  { id: 'favorite', label: '收藏' }
]

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function ImageThumb({ id, preview }: { id: string; preview: string }): React.ReactElement {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    void window.toolbox.clipboard.getImagePreview(id).then((dataUrl) => {
      if (cancelled) return
      if (dataUrl) setUrl(dataUrl)
      else setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (url) {
    return <img src={url} alt="" className="clipboard-thumb" />
  }
  return <span className="clipboard-thumb-fallback">{failed ? '[图片]' : '…'}</span>
}

function RowContent({ item }: { item: ClipboardItem }): React.ReactElement {
  if (item.type === 'image') {
    return (
      <div className="clipboard-row-content" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ImageThumb id={item.id} preview={item.preview} />
        <span>{item.preview}</span>
      </div>
    )
  }

  if (item.type === 'files') {
    return <div className="clipboard-row-content clipboard-row-files">{item.preview}</div>
  }

  return <div className="clipboard-row-content">{item.preview}</div>
}

type ConfirmKind = 'delete' | 'clearAll'

function isTextInputFocused(): boolean {
  const el = document.activeElement
  if (!el || !(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

interface ClipboardViewProps {
  hideTopBar?: boolean
  query?: string
  onQueryChange?: (q: string) => void
}

export function ClipboardView({
  hideTopBar = false,
  query: controlledQuery,
  onQueryChange
}: ClipboardViewProps): React.ReactElement {
  const [items, setItems] = useState<ClipboardItem[]>([])
  const [internalQuery, setInternalQuery] = useState('')
  const query = controlledQuery ?? internalQuery
  const setQuery = onQueryChange ?? setInternalQuery
  const [debouncedQ, setDebouncedQ] = useState('')
  const [tab, setTab] = useState<ClipboardListCategory>('all')
  const [totalCount, setTotalCount] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailItem, setDetailItem] = useState<ClipboardItem | null>(null)
  const [editItem, setEditItem] = useState<ClipboardItem | null>(null)
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null)
  const [confirmInput, setConfirmInput] = useState('')

  const listParams = useCallback(
    () => ({
      q: debouncedQ || undefined,
      category: tab,
      limit: 200
    }),
    [debouncedQ, tab]
  )

  const load = useCallback(async () => {
    setLoading(true)
    const params = listParams()
    const [list, count] = await Promise.all([
      window.toolbox.clipboard.list(params),
      window.toolbox.clipboard.count({ q: debouncedQ || undefined, category: 'all' })
    ])
    setItems(list)
    setTotalCount(count)
    setLoading(false)
    setActiveId((prev) => {
      if (prev && list.some((i) => i.id === prev)) return prev
      return list.length > 0 ? list[0].id : null
    })
    setCheckedIds((prev) => {
      const next = new Set<string>()
      for (const id of prev) {
        if (list.some((i) => i.id === id)) next.add(id)
      }
      return next
    })
  }, [listParams, debouncedQ])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const unsub = window.toolbox.clipboard.onChanged(() => void load())
    return unsub
  }, [load])

  const showToast = (msg: string): void => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const activeItem = items.find((i) => i.id === activeId) ?? null

  const handleCopy = useCallback(async (id: string, options?: { dismiss?: boolean }): Promise<void> => {
    const ok = await window.toolbox.clipboard.copyToSystem(id)
    if (ok) {
      showToast('已复制到剪贴板，在目标处按 Ctrl+V 粘贴')
      if (options?.dismiss) {
        await window.toolbox.window.hide()
      }
    } else {
      showToast('复制失败')
    }
    setActiveId(id)
  }, [])

  const handleRowClick = (item: ClipboardItem): void => {
    if (multiSelectMode) {
      setCheckedIds((prev) => {
        const next = new Set(prev)
        if (next.has(item.id)) next.delete(item.id)
        else next.add(item.id)
        return next
      })
      setActiveId(item.id)
      return
    }
    void handleCopy(item.id)
  }

  const handleToolbar = useCallback((action: ClipboardToolbarAction): void => {
    switch (action) {
      case 'pin': {
        if (!activeItem) return
        void window.toolbox.clipboard.setPinned(activeItem.id, !activeItem.pinned).then((res) => {
          if (res.ok) void load()
          else showToast(res.error ?? '置顶失败')
        })
        break
      }
      case 'details':
        if (activeItem) setDetailItem(activeItem)
        break
      case 'copy':
        if (activeId) void handleCopy(activeId)
        break
      case 'multiSelect':
        setMultiSelectMode((v) => {
          if (v) setCheckedIds(new Set())
          return !v
        })
        break
      case 'favorite': {
        if (!activeItem) return
        void window.toolbox.clipboard.setFavorite(activeItem.id, !activeItem.favorite).then((res) => {
          if (res.ok) void load()
          else showToast(res.error ?? '收藏失败')
        })
        break
      }
      case 'delete':
        setConfirmKind('delete')
        setConfirmInput('')
        break
      case 'edit':
        if (activeItem && (activeItem.type === 'text' || activeItem.type === 'html')) {
          setEditItem(activeItem)
        } else {
          showToast('仅文本或 HTML 条目可编辑')
        }
        break
      case 'saveAs':
        if (!activeId) return
        void window.toolbox.clipboard.saveAs(activeId).then((res) => {
          if (res.ok && res.path) showToast(`已保存到 ${res.path}`)
          else if (res.error && res.error !== 'cancelled') showToast(res.error)
        })
        break
      case 'clearAll':
        setConfirmKind('clearAll')
        setConfirmInput('')
        break
    }
  }, [activeId, activeItem, multiSelectMode, checkedIds.size])

  const executeDelete = async (): Promise<void> => {
    if (multiSelectMode && checkedIds.size > 0) {
      const ids = [...checkedIds]
      await window.toolbox.clipboard.deleteMany(ids)
      showToast(`已删除 ${ids.length} 条`)
      setCheckedIds(new Set())
      setMultiSelectMode(false)
    } else if (activeId) {
      await window.toolbox.clipboard.delete(activeId)
      showToast('已删除')
      setActiveId(null)
    }
    setConfirmKind(null)
    void load()
  }

  const executeClearAll = async (): Promise<void> => {
    await window.toolbox.clipboard.clearAll()
    setActiveId(null)
    setCheckedIds(new Set())
    setMultiSelectMode(false)
    setConfirmKind(null)
    showToast('已清空历史')
    void load()
  }

  const handleEditSave = async (text: string): Promise<void> => {
    if (!editItem) return
    const ok = await window.toolbox.clipboard.update(editItem.id, text)
    if (ok) {
      showToast('已保存')
      setEditItem(null)
      void load()
    } else {
      showToast('保存失败')
    }
  }

  const itemsRef = useRef(items)
  const activeIdRef = useRef(activeId)
  itemsRef.current = items
  activeIdRef.current = activeId

  useEffect(() => {
    if (!activeId) return
    document
      .querySelector(`[data-clipboard-id="${activeId}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  useEffect(() => {
    if (!confirmKind) return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setConfirmKind(null)
        return
      }
      if (confirmKind === 'delete' && e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        void executeDelete()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [confirmKind, multiSelectMode, checkedIds, activeId])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (detailItem || editItem || confirmKind) return
      if (isTextInputFocused()) return

      const list = itemsRef.current
      if (list.length === 0) return

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const currentId = activeIdRef.current
        let idx = currentId ? list.findIndex((i) => i.id === currentId) : 0
        if (idx < 0) idx = 0
        const next =
          e.key === 'ArrowDown'
            ? Math.min(idx + 1, list.length - 1)
            : Math.max(idx - 1, 0)
        setActiveId(list[next].id)
        return
      }

      if (e.key === 'Enter') {
        const currentId = activeIdRef.current
        if (!currentId) return
        e.preventDefault()
        void handleCopy(currentId, { dismiss: true })
        return
      }

      if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.key.length === 1) {
        const action = CLIPBOARD_SHORTCUT_KEY_TO_ACTION[e.key.toLowerCase()]
        if (action) {
          e.preventDefault()
          handleToolbar(action)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [detailItem, editItem, confirmKind, handleCopy, handleToolbar])

  const placeholder = `检索 ${totalCount} 条剪贴板历史`

  return (
    <div className="clipboard-view">
      {!hideTopBar && (
        <div className="clipboard-top-bar window-drag">
          <h1 className="clipboard-title">
            <LazyIcon
              iconKey="clipboard"
              className="clipboard-title-icon"
              size={20}
              fallbackLetter="剪"
              load={() => getCachedToolIcon('clipboard')}
            />
            剪贴板
          </h1>
          <div className="clipboard-search window-no-drag">
            <input
              type="search"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="检索剪贴板"
            />
          </div>
        </div>
      )}

      <nav className="clipboard-tabs window-no-drag" aria-label="剪贴板分类">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`clipboard-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {toast && <div className="toast">{toast}</div>}

      <div className="clipboard-main">
        <div className="clipboard-list-pane">
          {loading && items.length === 0 ? (
            <div className="clipboard-empty">加载中…</div>
          ) : items.length === 0 ? (
            <div className="clipboard-empty">
              {debouncedQ ? '没有匹配的记录' : '暂无剪贴板记录，复制一些内容试试'}
            </div>
          ) : (
            <div className="clipboard-list" role="list">
              {items.map((item) => (
                <div
                  key={item.id}
                  data-clipboard-id={item.id}
                  role="listitem"
                  aria-selected={activeId === item.id}
                  className={`clipboard-row${activeId === item.id ? ' active' : ''}`}
                  onClick={() => handleRowClick(item)}
                  title={new Date(item.createdAt).toLocaleString('zh-CN')}
                >
                  {multiSelectMode && (
                    <input
                      type="checkbox"
                      className="clipboard-row-check"
                      checked={checkedIds.has(item.id)}
                      onChange={() => handleRowClick(item)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="选择"
                    />
                  )}
                  <span className="clipboard-row-time">{formatTime(item.createdAt)}</span>
                  <RowContent item={item} />
                  <span className="clipboard-row-badges" aria-hidden>
                    {item.favorite ? '★' : ''}
                    {item.pinned ? '📌' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <ClipboardToolbar
          hasActive={Boolean(activeId)}
          multiSelectMode={multiSelectMode}
          activePinned={Boolean(activeItem?.pinned)}
          activeFavorite={Boolean(activeItem?.favorite)}
          onAction={handleToolbar}
        />
      </div>

      {detailItem && (
        <ClipboardDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}

      {editItem && (
        <ClipboardEditModal
          item={editItem}
          onSave={(text) => void handleEditSave(text)}
          onClose={() => setEditItem(null)}
        />
      )}

      {confirmKind === 'delete' && (
        <div className="clipboard-modal-overlay" role="presentation" onClick={() => setConfirmKind(null)}>
          <div
            className="clipboard-modal"
            role="alertdialog"
            aria-labelledby="clipboard-delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="clipboard-modal-header">
              <h2 id="clipboard-delete-title">确认删除</h2>
            </header>
            <div className="clipboard-modal-body">
              <p>
                {multiSelectMode && checkedIds.size > 0
                  ? `确定删除选中的 ${checkedIds.size} 条记录？此操作不可撤销。`
                  : '确定删除当前记录？此操作不可撤销。'}
              </p>
            </div>
            <footer className="clipboard-modal-footer">
              <button type="button" className="btn secondary" onClick={() => setConfirmKind(null)}>
                取消
              </button>
              <button
                type="button"
                className="btn danger"
                autoFocus
                onClick={() => void executeDelete()}
              >
                删除
              </button>
            </footer>
          </div>
        </div>
      )}

      {confirmKind === 'clearAll' && (
        <div className="clipboard-modal-overlay" role="presentation" onClick={() => setConfirmKind(null)}>
          <div
            className="clipboard-modal"
            role="alertdialog"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="clipboard-modal-header">
              <h2>清空历史</h2>
            </header>
            <div className="clipboard-modal-body">
              <p>将删除全部剪贴板历史及关联文件，此操作不可撤销。</p>
              <p>请输入「清空」以确认：</p>
              <input
                type="text"
                className="clipboard-confirm-input"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && confirmInput === '清空') {
                    e.preventDefault()
                    void executeClearAll()
                  }
                }}
                placeholder="清空"
                aria-label="确认输入"
                autoFocus
              />
            </div>
            <footer className="clipboard-modal-footer">
              <button type="button" className="btn secondary" onClick={() => setConfirmKind(null)}>
                取消
              </button>
              <button
                type="button"
                className="btn danger"
                disabled={confirmInput !== '清空'}
                onClick={() => void executeClearAll()}
              >
                清空全部
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

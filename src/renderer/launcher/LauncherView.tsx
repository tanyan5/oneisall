import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { LauncherRecentRow, LauncherRowItem } from '../../shared/shankai'
import type { PinnedSearchKeyword } from '../../shared/types'
import { splitLauncherSearchResults } from '../../shared/launcherSearch'
import { LazyIcon } from '../components/LazyIcon'
import { BrandHomeButton } from '../components/BrandHomeButton'
import { getLauncherAppIcon, getLauncherToolIcon } from '../components/toolIconCache'

import { RECOMMENDED_TOOL_IDS } from '../../shared/recommendedTools'
import { moveHighlight, type NavDirection } from './launcherNavigation'

const SESSION_ENTER_KEY = 'oneisall-launcher-entered'
const RECENT_ROW_VISIBLE = 10
const ARROW_KEYS: NavDirection[] = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

type FlatItem = {
  item: LauncherRowItem
  section: 'recent' | 'recommend' | 'primary' | 'secondary'
}

export function LauncherView(): React.ReactElement {
  const [query, setQuery] = useState('')
  const [searchItems, setSearchItems] = useState<LauncherRowItem[]>([])
  const [recent, setRecent] = useState<LauncherRecentRow[]>([])
  const [pinned, setPinned] = useState<PinnedSearchKeyword[]>([])
  const [recentExpanded, setRecentExpanded] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [playEnterAnim, setPlayEnterAnim] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef(0)

  const load = useCallback(async () => {
    const [items, recentList, pinnedList] = await Promise.all([
      window.launcher.getSearchItems(),
      window.launcher.getRecent(),
      window.launcher.getPinnedKeywords()
    ])
    setSearchItems(items)
    setRecent(recentList)
    setPinned(pinnedList)
  }, [])

  useEffect(() => {
    void load()
    const unsub = window.launcher.onFocus(() => {
      setRecentExpanded(false)
      setHighlight(0)
      highlightRef.current = 0
      void load().then(() => {
        requestAnimationFrame(() => {
          inputRef.current?.focus()
          if (inputRef.current && inputRef.current.value.length > 0) {
            inputRef.current.select()
          }
        })
      })
    })
    return unsub
  }, [load])

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_ENTER_KEY)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setPlayEnterAnim(true)
    sessionStorage.setItem(SESSION_ENTER_KEY, '1')
  }, [])

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const schedule = (): void => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        void window.launcher.resize(el.scrollHeight)
      }, 50)
    }
    const ro = new ResizeObserver(schedule)
    ro.observe(el)
    schedule()
    return () => {
      ro.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [query, recent, pinned, searchItems, recentExpanded])

  const trimmed = query.trim()
  const { primary, secondary } = useMemo(
    () => (trimmed ? splitLauncherSearchResults(searchItems, trimmed) : { primary: [], secondary: [] }),
    [searchItems, trimmed]
  )

  const recentItems: LauncherRowItem[] = useMemo(
    () =>
      recent.map((item) => ({
        kind: item.kind,
        id: item.id,
        name: item.name,
        description: item.description,
        targetPath: item.targetPath
      })),
    [recent]
  )

  const recommendedTools = useMemo(() => {
    const idSet = new Set<string>(RECOMMENDED_TOOL_IDS)
    return searchItems.filter((item) => item.kind === 'tool' && idSet.has(item.id))
  }, [searchItems])

  const showRecommendations =
    !trimmed && recentItems.length === 0 && pinned.length === 0 && recommendedTools.length > 0

  const canExpandRecent = recentItems.length > RECENT_ROW_VISIBLE

  const displayRecentItems = useMemo(() => {
    if (recentExpanded || !canExpandRecent) return recentItems
    return recentItems.slice(0, RECENT_ROW_VISIBLE)
  }, [recentItems, recentExpanded, canExpandRecent])

  const flatItems: FlatItem[] = useMemo(() => {
    if (trimmed) {
      const items: FlatItem[] = primary.map((item) => ({ item, section: 'primary' as const }))
      for (const item of secondary) {
        items.push({ item, section: 'secondary' })
      }
      return items
    }
    if (displayRecentItems.length > 0) {
      return displayRecentItems.map((item) => ({ item, section: 'recent' as const }))
    }
    if (showRecommendations) {
      return recommendedTools.map((item) => ({ item, section: 'recommend' as const }))
    }
    return []
  }, [trimmed, displayRecentItems, primary, secondary, showRecommendations, recommendedTools])

  const flatItemsKey = useMemo(
    () => flatItems.map((row) => `${row.section}:${row.item.kind}:${row.item.id}`).join('|'),
    [flatItems]
  )

  const flatItemsRef = useRef(flatItems)
  flatItemsRef.current = flatItems
  highlightRef.current = highlight

  useLayoutEffect(() => {
    setHighlight(0)
    highlightRef.current = 0
  }, [query, flatItemsKey])

  useLayoutEffect(() => {
    setHighlight((h) => {
      const next = flatItems.length === 0 ? 0 : Math.min(h, flatItems.length - 1)
      highlightRef.current = next
      return next
    })
  }, [flatItems.length])

  const activeOptionId =
    flatItems.length > 0 ? `launcher-option-${flatItems[highlight]?.section ?? 'item'}-${highlight}` : undefined

  const keepInputFocused = useCallback((): void => {
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
  }, [])

  const selectItem = useCallback(async (item: LauncherRowItem): Promise<void> => {
    if (item.kind === 'app') {
      const result = await window.launcher.openApp(item.id)
      if (!result.ok) {
        console.warn(result.error)
      }
    } else {
      await window.launcher.openTool(item.id)
    }
  }, [])

  const handleLauncherKeyDown = useCallback(
    (e: KeyboardEvent | React.KeyboardEvent): void => {
      const key = e.key
      const items = flatItemsRef.current
      const current = highlightRef.current

      if (key === 'Escape') {
        e.preventDefault()
        void window.launcher.hide()
        return
      }

      if (items.length === 0) return

      if (ARROW_KEYS.includes(key as NavDirection)) {
        e.preventDefault()
        e.stopPropagation()
        const section = items[current]?.section ?? items[0]!.section
        setHighlight((h) => {
          const next = moveHighlight(
            key as NavDirection,
            h,
            items.length,
            section,
            RECENT_ROW_VISIBLE
          )
          highlightRef.current = next
          return next
        })
        keepInputFocused()
        return
      }

      if (key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        const row = items[highlightRef.current]
        if (row) void selectItem(row.item)
      }
    },
    [selectItem, keepInputFocused]
  )

  const showSecondary = trimmed.length > 0 && secondary.length > 0

  const loadItemIcon = (item: LauncherRowItem): (() => Promise<string | null>) => {
    if (item.kind === 'app' && item.targetPath) {
      return () => getLauncherAppIcon(item.targetPath!)
    }
    return () => getLauncherToolIcon(item.id)
  }

  const renderSearchItem = (row: FlatItem, index: number): React.ReactElement => {
    const selected = highlight === index
    return (
    <button
      key={`${row.section}-${row.item.kind}-${row.item.id}`}
      id={`launcher-option-${row.section}-${index}`}
      type="button"
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      className={`launcher-item ${selected ? 'highlighted' : ''}`}
      onMouseEnter={() => setHighlight(index)}
      onClick={() => void selectItem(row.item)}
    >
      <LazyIcon
        iconKey={`${row.item.kind}:${row.item.id}`}
        className="launcher-item-icon"
        size={28}
        fallbackLetter={row.item.name[0] ?? '?'}
        load={loadItemIcon(row.item)}
      />
      <span className="launcher-item-body">
        <span className="launcher-item-row">
          <span className="launcher-item-name">{row.item.name}</span>
          <span className="launcher-item-kind">{row.item.kind === 'app' ? '应用' : '工具'}</span>
        </span>
        {row.item.description && (
          <span className="launcher-item-desc">{row.item.description}</span>
        )}
      </span>
    </button>
  )}

  const renderRecentCompact = (item: LauncherRowItem, index: number): React.ReactElement => {
    const selected = highlight === index
    return (
    <button
      key={`recent-${item.kind}-${item.id}`}
      id={`launcher-option-recent-${index}`}
      type="button"
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      className={`launcher-recent-item ${selected ? 'highlighted' : ''}`}
      title={item.name}
      onMouseEnter={() => setHighlight(index)}
      onClick={() => void selectItem(item)}
    >
      <span className="launcher-recent-icon-wrap">
        <LazyIcon
          iconKey={`${item.kind}:${item.id}`}
          className="launcher-recent-icon"
          size={30}
          fallbackLetter={item.name[0] ?? '?'}
          load={loadItemIcon(item)}
        />
        <span
          className={`launcher-recent-badge launcher-recent-badge--${item.kind === 'app' ? 'app' : 'tool'}`}
          aria-hidden
        />
      </span>
      <span className="launcher-recent-name">{item.name}</span>
    </button>
  )}

  const renderRecommendChip = (item: LauncherRowItem, index: number): React.ReactElement => {
    const selected = highlight === index
    return (
    <button
      key={`rec-${item.id}`}
      id={`launcher-option-recommend-${index}`}
      type="button"
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      className={`launcher-recommend-chip ${selected ? 'highlighted' : ''}`}
      onMouseEnter={() => setHighlight(index)}
      onClick={() => void selectItem(item)}
    >
      <LazyIcon
        iconKey={item.id}
        className="launcher-recommend-icon"
        size={18}
        fallbackLetter={item.name[0] ?? '?'}
        load={() => getLauncherToolIcon(item.id)}
      />
      {item.name}
    </button>
  )}

  let itemIndex = 0
  let recommendIndex = 0

  return (
    <div
      ref={panelRef}
      className={`launcher-panel window-drag${playEnterAnim ? ' launcher-panel--enter' : ''}`}
    >
      <div className="launcher-drag-strip" aria-hidden title="拖动移动" />
      <div className="launcher-header-zone">
        <div className="launcher-search-wrap">
          <div className="launcher-search-row">
            <div className="launcher-search-cmd window-no-drag">
              <span className="launcher-cmd-prefix" aria-hidden>
                &gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={flatItems.length > 0}
                aria-controls="launcher-item-list"
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
                enterKeyHint="search"
                className="launcher-search"
                placeholder="输入名称，快速唤起工具或应用"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleLauncherKeyDown}
                autoFocus
              />
              <BrandHomeButton onClick={() => void window.launcher.openHome()} />
            </div>
          </div>
          {pinned.length > 0 && (
            <div className="launcher-pinned window-no-drag">
              {pinned.map((entry) => (
                <button
                  key={`${entry.toolId}:${entry.keywordId}`}
                  type="button"
                  className="launcher-pinned-chip"
                  onClick={() => setQuery(entry.label)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        id="launcher-item-list"
        role="listbox"
        className={`launcher-body window-no-drag${trimmed ? ' launcher-body--scrollable' : ''}`}
      >
        {!trimmed ? (
          <>
            {recentItems.length > 0 && (
              <section className="launcher-section">
                <div className="launcher-section-head window-no-drag">
                  {canExpandRecent && (
                    <button
                      type="button"
                      className="launcher-recent-expand-btn"
                      onClick={() => setRecentExpanded((v) => !v)}
                    >
                      {recentExpanded ? '收起' : '展开全部'}
                    </button>
                  )}
                  <h3 className="launcher-section-title">近期常用</h3>
                </div>
                <div className="launcher-recent-wrap">
                  <div className="launcher-recent-row">
                    {displayRecentItems.map((item, i) => renderRecentCompact(item, i))}
                  </div>
                </div>
              </section>
            )}
            {showRecommendations && (
              <section className="launcher-section launcher-recommend-section">
                <h3 className="launcher-section-title">推荐试试</h3>
                <div className="launcher-recommend-row">
                  {recommendedTools.map((item) => renderRecommendChip(item, recommendIndex++))}
                </div>
                <p className="launcher-pin-hint">在管理中心预览关键字旁选择「固定到搜索框」</p>
                <button
                  type="button"
                  className="launcher-pin-ghost"
                  onClick={() => void window.launcher.openHome()}
                >
                  + 固定关键字
                </button>
              </section>
            )}
            {!showRecommendations && recentItems.length === 0 && pinned.length > 0 && (
              <p className="launcher-empty launcher-empty-compact">选择上方固定关键字，或输入名称搜索</p>
            )}
          </>
        ) : (
          <>
            <section className="launcher-section">
              <h3 className="launcher-section-title">模糊匹配</h3>
              {primary.length === 0 ? (
                <p className="launcher-empty">没有匹配项</p>
              ) : (
                <div className="launcher-list">
                  {primary.map((item) => renderSearchItem({ item, section: 'primary' }, itemIndex++))}
                </div>
              )}
            </section>
            {showSecondary && (
              <section className="launcher-section">
                <h3 className="launcher-section-title">其他匹配</h3>
                <div className="launcher-list">
                  {secondary.map((item) =>
                    renderSearchItem({ item, section: 'secondary' }, itemIndex++)
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

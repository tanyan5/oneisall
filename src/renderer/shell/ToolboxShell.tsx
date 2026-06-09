import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LaunchKeywordAction, ToolMeta } from '../../shared/types'
import type { LauncherRowItem } from '../../shared/shankai'
import { splitLauncherSearchResults } from '../../shared/launcherSearch'
import { ClipboardView } from '../plugins/clipboard/ClipboardView'
import { DemoView } from '../plugins/demo/DemoView'
import { ShankaiView } from '../plugins/shankai/ShankaiView'
import { Md2DocxView } from '../plugins/md2docx/Md2DocxView'
import { HomeView } from './HomeView'
import { SettingsView } from './SettingsView'
import { LazyIcon } from '../components/LazyIcon'
import { getCachedToolIcon, getLauncherAppIcon } from '../components/toolIconCache'
import { useWindowPin } from './useWindowPin'
import { WindowChrome } from './WindowChrome'
import { HomeTopBar } from './HomeTopBar'
import { HomeHubPanel } from './HomeHubPanel'
import { HomeSearchResults } from './HomeSearchResults'
import './home-hub.css'
import './window-chrome.css'

const PLUGIN_VIEWS: Record<string, React.ComponentType> = {
  clipboard: ClipboardView,
  demo: DemoView,
  shankai: ShankaiView,
  md2docx: Md2DocxView
}

const IMMERSIVE_IDS = new Set(['settings'])

const SURFACE_TITLES: Record<string, string> = {
  settings: '设置',
  clipboard: '剪贴板',
  demo: '演示',
  shankai: '闪开',
  md2docx: 'Markdown 转 Word'
}

function renderChromeIcon(toolId: string): React.ReactElement {
  const title = SURFACE_TITLES[toolId] ?? toolId
  return (
    <LazyIcon
      iconKey={`chrome:${toolId}`}
      className="window-chrome-tool-icon"
      size={20}
      fallbackLetter={title[0] ?? '?'}
      load={() => getCachedToolIcon(toolId)}
    />
  )
}

function isImmersiveView(id: string): boolean {
  return id !== 'home' && (IMMERSIVE_IDS.has(id) || Boolean(PLUGIN_VIEWS[id]))
}

export function ToolboxShell(): React.ReactElement {
  const [tools, setTools] = useState<ToolMeta[]>([])
  const [activeId, setActiveId] = useState('home')
  const [previewToolId, setPreviewToolId] = useState<string | null>(null)
  const [openKeywordId, setOpenKeywordId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCatalog, setSearchCatalog] = useState<LauncherRowItem[]>([])
  const [catalogCount, setCatalogCount] = useState(0)
  const [searchHighlight, setSearchHighlight] = useState(0)
  const [clipboardQuery, setClipboardQuery] = useState('')
  const [clipboardCount, setClipboardCount] = useState(0)
  const openKeywordIdRef = useRef<string | null>(null)
  const { pinState, togglePin, syncPinState, applyPinState, setAlwaysOnTop, minimize, maximize, close } =
    useWindowPin()

  const loadTools = useCallback(async () => {
    const list = await window.toolbox.tools.list()
    const enabled = list.filter((t) => t.enabled)
    setTools(enabled)
    setPreviewToolId((prev) => {
      if (prev && enabled.some((t) => t.id === prev)) return prev
      return null
    })
  }, [])

  const loadSearchCatalog = useCallback(async () => {
    const catalog = await window.toolbox.home.getSearchCatalog()
    setSearchCatalog(catalog.items)
    setCatalogCount(catalog.count)
  }, [])

  const goHome = useCallback(async (): Promise<void> => {
    setActiveId('home')
    setPreviewToolId(null)
    setSearchQuery('')
    await window.toolbox.tools.setActive('home')
  }, [])

  const openTool = useCallback(async (id: string): Promise<void> => {
    const nextId = await window.toolbox.navigation.openToolFromHome(id)
    setActiveId(nextId)
    await window.toolbox.tools.setActive(nextId)
  }, [])

  const openApp = useCallback(async (id: string): Promise<void> => {
    await window.toolbox.shankai.launch(id)
  }, [])

  const openSettings = useCallback(async (): Promise<void> => {
    const nextId = await window.toolbox.navigation.openSettingsFromShell()
    setActiveId(nextId)
  }, [])

  const selectPreview = useCallback((id: string): void => {
    setActiveId('home')
    setPreviewToolId(id)
    void window.toolbox.tools.setActive('home')
  }, [])

  useEffect(() => {
    openKeywordIdRef.current = openKeywordId
  }, [openKeywordId])

  useEffect(() => {
    const unsub = window.toolbox.onNavigateTool((id, nextPinState) => {
      setActiveId(id)
      if (id === 'home') {
        setSearchQuery('')
        setPreviewToolId(null)
      }
      if (nextPinState) applyPinState(nextPinState)
      else void syncPinState()
    })
    return unsub
  }, [applyPinState, syncPinState])

  useEffect(() => {
    void (async () => {
      const pending = await window.toolbox.tools.consumePending()
      const current = pending ?? (await window.toolbox.tools.getActive())
      if (current) setActiveId(current)
      await loadTools()
      await loadSearchCatalog()
    })()
  }, [loadTools, loadSearchCatalog])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        void togglePin()
        return
      }

      if (e.key !== 'Escape') return
      if (openKeywordIdRef.current) {
        e.preventDefault()
        setOpenKeywordId(null)
        return
      }
      if (pinState.pinned) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      void window.toolbox.navigation.pop().then((result) => {
        if (result.action === 'navigate') {
          const id =
            result.surface === 'home'
              ? 'home'
              : result.surface === 'settings'
                ? 'settings'
                : (result.toolId ?? 'home')
          setActiveId(id)
          if (result.surface === 'home') setPreviewToolId(null)
        }
      })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeId, pinState.pinned, togglePin])

  const trimmedSearch = searchQuery.trim()
  const { primary, secondary } = useMemo(
    () =>
      trimmedSearch
        ? splitLauncherSearchResults(searchCatalog, trimmedSearch)
        : { primary: [], secondary: [] },
    [searchCatalog, trimmedSearch]
  )
  const searchResults = useMemo(() => [...primary, ...secondary], [primary, secondary])

  useEffect(() => {
    setSearchHighlight(0)
  }, [trimmedSearch, searchResults.length])

  const filteredTools = useMemo(() => {
    if (!trimmedSearch) return tools
    const toolIds = new Set(
      searchResults.filter((item) => item.kind === 'tool').map((item) => item.id)
    )
    return tools.filter((t) => toolIds.has(t.id))
  }, [tools, trimmedSearch, searchResults])

  const filteredApps = useMemo(() => {
    if (!trimmedSearch) return []
    return searchResults.filter((item) => item.kind === 'app')
  }, [trimmedSearch, searchResults])

  const previewTool = previewToolId ? (tools.find((t) => t.id === previewToolId) ?? null) : null

  const handleKeywordAction = (action: LaunchKeywordAction): void => {
    if (!previewTool) return
    void openTool(previewTool.id)
  }

  const handlePinKeyword = async (keywordId: string, label: string): Promise<void> => {
    if (!previewTool) return
    await window.toolbox.settings.pinKeyword({
      toolId: previewTool.id,
      keywordId,
      label
    })
  }

  const handleSearchSelect = (item: LauncherRowItem): void => {
    if (item.kind === 'app') void openApp(item.id)
    else {
      selectPreview(item.id)
      setSearchQuery('')
    }
  }

  const chromeHandlers = {
    onToggleAlwaysOnTop: () => void setAlwaysOnTop(!pinState.alwaysOnTop),
    onMinimize: () => void minimize(),
    onMaximize: () => void maximize(),
    onClose: () => void close()
  }

  const renderImmersiveContent = (): React.ReactElement => {
    if (activeId === 'settings') return <SettingsView />
    const View = PLUGIN_VIEWS[activeId]
    if (View) {
      if (activeId === 'clipboard') {
        return (
          <ClipboardView
            hideTopBar={pinState.pinned}
            query={clipboardQuery}
            onQueryChange={setClipboardQuery}
          />
        )
      }
      if (activeId === 'md2docx') {
        return <Md2DocxView hideTopBar={pinState.pinned} />
      }
      return <View />
    }
    return <DemoView />
  }

  const renderImmersiveChrome = (): React.ReactElement | null => {
    if (!pinState.pinned) return null
    const title = SURFACE_TITLES[activeId] ?? activeId

    if (activeId === 'clipboard') {
      return (
        <WindowChrome
          icon={renderChromeIcon(activeId)}
          title={title}
          center={
            <input
              type="search"
              value={clipboardQuery}
              onChange={(e) => setClipboardQuery(e.target.value)}
              placeholder={`检索 ${clipboardCount} 条剪贴板历史`}
              aria-label="检索剪贴板"
            />
          }
          alwaysOnTop={pinState.alwaysOnTop}
          maximized={pinState.maximized}
          {...chromeHandlers}
        />
      )
    }

    return (
      <WindowChrome
        icon={renderChromeIcon(activeId)}
        title={title}
        alwaysOnTop={pinState.alwaysOnTop}
        maximized={pinState.maximized}
        {...chromeHandlers}
      />
    )
  }

  useEffect(() => {
    if (activeId !== 'clipboard') return
    void window.toolbox.clipboard.count({ category: 'all' }).then(setClipboardCount)
  }, [activeId, clipboardQuery])

  const immersive = isImmersiveView(activeId)

  useEffect(() => {
    const toolId = pinState.pinned && immersive ? activeId : null
    void window.toolbox.window.syncTaskbarIcon(toolId)
  }, [pinState.pinned, activeId, immersive])

  if (immersive) {
    return (
      <div className={`shell shell-immersive${pinState.pinned ? ' shell-pinned' : ''}`}>
        {pinState.pinned ? renderImmersiveChrome() : <div className="immersive-drag-strip window-drag" aria-hidden />}
        <main className="content content-immersive window-no-drag">{renderImmersiveContent()}</main>
      </div>
    )
  }

  return (
    <div className={`shell shell-home${pinState.pinned ? ' shell-pinned' : ''}`}>
      <div className="shell-home-column">
        <HomeTopBar
          catalogCount={catalogCount}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onGoHome={() => void goHome()}
          pinState={pinState}
          {...chromeHandlers}
        />
        <div className="shell-home-body">
          <aside className="sidebar sidebar-mgmt">
            <div className="sidebar-installed-header window-no-drag">
              <span>已安装插件应用 ({catalogCount})</span>
            </div>
            <nav className="tool-nav">
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={`tool-nav-item ${previewToolId === tool.id ? 'active' : ''}`}
                  onClick={() => selectPreview(tool.id)}
                >
                  <LazyIcon
                    iconKey={tool.id}
                    className="tool-nav-icon"
                    size={20}
                    fallbackLetter={tool.name[0] ?? '?'}
                    load={() => getCachedToolIcon(tool.id)}
                  />
                  <span>{tool.name}</span>
                </button>
              ))}
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="tool-nav-item tool-nav-app"
                  onClick={() => void openApp(app.id)}
                >
                  <LazyIcon
                    iconKey={`app:${app.id}`}
                    className="tool-nav-icon"
                    size={20}
                    fallbackLetter={app.name[0] ?? '?'}
                    load={() => getLauncherAppIcon(app.targetPath ?? '')}
                  />
                  <span>{app.name}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-footer">
              <button
                type="button"
                className={`tool-nav-item ${activeId === 'settings' ? 'active' : ''}`}
                onClick={() => void openSettings()}
              >
                <LazyIcon
                  iconKey="settings"
                  className="tool-nav-icon"
                  size={20}
                  fallbackLetter="S"
                  load={() => getCachedToolIcon('settings')}
                />
                <span>设置</span>
              </button>
            </div>
          </aside>
          <main className="content home-center">
            {trimmedSearch ? (
              <HomeSearchResults
                items={searchResults}
                highlightIndex={searchHighlight}
                onSelect={handleSearchSelect}
                onHighlightChange={setSearchHighlight}
              />
            ) : previewTool ? (
              <HomeView
                tool={previewTool}
                openKeywordId={openKeywordId}
                onOpenKeywordIdChange={setOpenKeywordId}
                onOpen={() => void openTool(previewTool.id)}
                onKeywordAction={handleKeywordAction}
                onPinKeyword={(kid, label) => void handlePinKeyword(kid, label)}
              />
            ) : (
              <HomeHubPanel
                searchItems={searchCatalog}
                onSelectTool={selectPreview}
                onOpenApp={(id) => void openApp(id)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

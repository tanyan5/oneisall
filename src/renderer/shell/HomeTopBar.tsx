import React from 'react'
import type { WindowPinState } from './useWindowPin'
import { WindowChromeControls } from './WindowChromeControls'
import { BrandMark } from '../components/BrandMark'

interface HomeTopBarProps {
  catalogCount: number
  query: string
  onQueryChange: (q: string) => void
  onGoHome: () => void
  pinState: WindowPinState
  onToggleAlwaysOnTop: () => void
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
}

export function HomeTopBar({
  catalogCount,
  query,
  onQueryChange,
  onGoHome,
  pinState,
  onToggleAlwaysOnTop,
  onMinimize,
  onMaximize,
  onClose
}: HomeTopBarProps): React.ReactElement {
  return (
    <header className="mgmt-top-bar window-drag">
      <button
        type="button"
        className="mgmt-brand-btn window-no-drag"
        title="管理中心"
        aria-label="管理中心"
        onClick={onGoHome}
      >
        <BrandMark size={28} breathe="subtle" />
      </button>
      <div className="mgmt-search window-no-drag">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`搜索 ${catalogCount} 款插件应用...`}
          aria-label="搜索插件与应用"
        />
      </div>
      {pinState.pinned && (
        <WindowChromeControls
          alwaysOnTop={pinState.alwaysOnTop}
          maximized={pinState.maximized}
          onToggleAlwaysOnTop={onToggleAlwaysOnTop}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
        />
      )}
    </header>
  )
}

import React from 'react'
import { CloseIcon, MaximizeIcon, MinimizeIcon, PinTopIcon, RestoreIcon } from './ChromeIcons'

interface WindowChromeControlsProps {
  alwaysOnTop: boolean
  maximized: boolean
  onToggleAlwaysOnTop: () => void
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
}

export function WindowChromeControls({
  alwaysOnTop,
  maximized,
  onToggleAlwaysOnTop,
  onMinimize,
  onMaximize,
  onClose
}: WindowChromeControlsProps): React.ReactElement {
  return (
    <div className="window-chrome-controls window-no-drag">
      <button
        type="button"
        className={`window-chrome-btn window-chrome-pin${alwaysOnTop ? ' active' : ''}`}
        title="置顶"
        aria-label="置顶"
        onClick={onToggleAlwaysOnTop}
      >
        <PinTopIcon />
      </button>
      <button type="button" className="window-chrome-btn" title="最小化" aria-label="最小化" onClick={onMinimize}>
        <MinimizeIcon />
      </button>
      <button type="button" className="window-chrome-btn" title="最大化" aria-label="最大化" onClick={onMaximize}>
        {maximized ? <RestoreIcon /> : <MaximizeIcon />}
      </button>
      <button
        type="button"
        className="window-chrome-btn window-chrome-close"
        title="关闭"
        aria-label="关闭"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

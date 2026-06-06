import React from 'react'
import './window-chrome.css'
import { WindowChromeControls } from './WindowChromeControls'

interface WindowChromeProps {
  icon?: React.ReactNode
  title?: string
  center?: React.ReactNode
  alwaysOnTop: boolean
  maximized: boolean
  onToggleAlwaysOnTop: () => void
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
}

export function WindowChrome({
  icon,
  title,
  center,
  alwaysOnTop,
  maximized,
  onToggleAlwaysOnTop,
  onMinimize,
  onMaximize,
  onClose
}: WindowChromeProps): React.ReactElement {
  return (
    <header className="window-chrome window-drag">
      <div className="window-chrome-left window-no-drag">
        {icon && <span className="window-chrome-icon">{icon}</span>}
        {title && <span className="window-chrome-title">{title}</span>}
      </div>
      {center && <div className="window-chrome-center window-no-drag">{center}</div>}
      <WindowChromeControls
        alwaysOnTop={alwaysOnTop}
        maximized={maximized}
        onToggleAlwaysOnTop={onToggleAlwaysOnTop}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </header>
  )
}

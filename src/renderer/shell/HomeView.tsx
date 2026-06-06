import React from 'react'
import type { LaunchKeywordAction, ToolMeta } from '../../shared/types'
import { LazyIcon } from '../components/LazyIcon'
import { KeywordChipDropdown } from '../components/KeywordChipDropdown'
import { getCachedToolIcon } from '../components/toolIconCache'

interface HomeViewProps {
  tool: ToolMeta | null
  openKeywordId: string | null
  onOpenKeywordIdChange: (id: string | null) => void
  onOpen: () => void
  onKeywordAction: (action: LaunchKeywordAction) => void
  onPinKeyword: (keywordId: string, label: string) => void
}

export function HomeView({
  tool,
  onOpen,
  onKeywordAction,
  onPinKeyword,
  openKeywordId,
  onOpenKeywordIdChange
}: HomeViewProps): React.ReactElement {
  if (!tool) {
    return (
      <div className="home-preview home-preview-empty">
        <p>在左侧选择一个工具查看说明</p>
      </div>
    )
  }

  const keywords = tool.launchKeywords ?? []

  return (
    <div className="home-preview">
      <div className="home-preview-header">
        <LazyIcon
          iconKey={tool.id}
          className="home-preview-icon"
          size={56}
          fallbackLetter={tool.name[0] ?? '?'}
          load={() => getCachedToolIcon(tool.id)}
        />
        <div>
          <h1 className="home-preview-title">{tool.name}</h1>
          <p className="home-preview-version">v{tool.version}</p>
        </div>
      </div>

      <p className="home-preview-desc">
        {tool.description ?? '暂无说明'}
      </p>

      {keywords.length > 0 && (
        <div className="home-preview-keywords">
          {keywords.map((kw) => (
            <KeywordChipDropdown
              key={kw.id}
              keyword={kw}
              toolId={tool.id}
              open={openKeywordId === kw.id}
              onAction={onKeywordAction}
              onPin={() => onPinKeyword(kw.id, kw.label)}
              onOpenChange={(isOpen) => onOpenKeywordIdChange(isOpen ? kw.id : null)}
            />
          ))}
        </div>
      )}

      <p className="home-hints home-preview-hints">
        <span className="hint-chip">Ctrl+Shift+Space → 快速启动</span>
        <span className="hint-chip">Ctrl+Shift+V → 剪贴板</span>
        <span className="hint-chip">Esc → 返回快捷框</span>
      </p>

      <button type="button" className="home-open-btn" onClick={onOpen}>
        打开
      </button>
    </div>
  )
}

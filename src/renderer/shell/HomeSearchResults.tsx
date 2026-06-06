import React from 'react'
import type { LauncherRowItem } from '../../shared/shankai'
import { LazyIcon } from '../components/LazyIcon'
import { getCachedToolIcon, getLauncherAppIcon } from '../components/toolIconCache'

interface HomeSearchResultsProps {
  items: LauncherRowItem[]
  highlightIndex: number
  onSelect: (item: LauncherRowItem) => void
  onHighlightChange: (index: number) => void
}

export function HomeSearchResults({
  items,
  highlightIndex,
  onSelect,
  onHighlightChange
}: HomeSearchResultsProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <div className="home-search-results home-search-empty">
        <p>没有匹配的插件或应用</p>
      </div>
    )
  }

  return (
    <div className="home-search-results" role="listbox">
      {items.map((item, index) => (
        <button
          key={`${item.kind}:${item.id}`}
          type="button"
          role="option"
          aria-selected={index === highlightIndex}
          className={`home-search-row${index === highlightIndex ? ' active' : ''}`}
          onMouseEnter={() => onHighlightChange(index)}
          onClick={() => onSelect(item)}
        >
          <LazyIcon
            iconKey={`${item.kind}:${item.id}`}
            className="home-search-row-icon"
            size={32}
            fallbackLetter={item.name[0] ?? '?'}
            load={() =>
              item.kind === 'app'
                ? getLauncherAppIcon(item.targetPath ?? '')
                : getCachedToolIcon(item.id)
            }
          />
          <div className="home-search-row-text">
            <span className="home-search-row-name">{item.name}</span>
            {item.description && <span className="home-search-row-desc">{item.description}</span>}
            {item.kind === 'app' && <span className="home-search-row-badge">应用</span>}
          </div>
        </button>
      ))}
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import type { LaunchKeyword, LaunchKeywordAction } from '../../shared/types'

interface KeywordChipDropdownProps {
  keyword: LaunchKeyword
  toolId: string
  onAction: (action: LaunchKeywordAction) => void
  onPin: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KeywordChipDropdown({
  keyword,
  open: controlledOpen,
  onAction,
  onPin,
  onOpenChange
}: KeywordChipDropdownProps): React.ReactElement {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const rootRef = useRef<HTMLDivElement>(null)

  const setOpenState = (next: boolean): void => {
    if (controlledOpen === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent): void => {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpenState(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <div className="keyword-chip-wrap" ref={rootRef}>
      <button type="button" className="keyword-chip" onClick={() => setOpenState(!open)}>
        {keyword.label}
        <span className="keyword-chip-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="keyword-dropdown" role="menu">
          {keyword.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="keyword-dropdown-item"
              role="menuitem"
              onClick={() => {
                setOpenState(false)
                onAction(action)
              }}
            >
              {action.label}
            </button>
          ))}
          <div className="keyword-dropdown-divider" />
          <button
            type="button"
            className="keyword-dropdown-item keyword-dropdown-pin"
            role="menuitem"
            onClick={() => {
              setOpenState(false)
              onPin()
            }}
          >
            固定到搜索框
          </button>
        </div>
      )}
    </div>
  )
}

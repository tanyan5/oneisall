import React from 'react'

export type ClipboardToolbarAction =
  | 'pin'
  | 'details'
  | 'copy'
  | 'multiSelect'
  | 'favorite'
  | 'delete'
  | 'edit'
  | 'saveAs'
  | 'clearAll'

/** Single-letter shortcuts (active when list has focus, no modifier keys). */
export const CLIPBOARD_TOOLBAR_SHORTCUTS: Record<ClipboardToolbarAction, string> = {
  pin: 'P',
  details: 'V',
  copy: 'C',
  multiSelect: 'M',
  favorite: 'F',
  delete: 'X',
  edit: 'E',
  saveAs: 'S',
  clearAll: 'L'
}

export const CLIPBOARD_SHORTCUT_KEY_TO_ACTION: Partial<Record<string, ClipboardToolbarAction>> =
  Object.fromEntries(
    Object.entries(CLIPBOARD_TOOLBAR_SHORTCUTS).map(([action, key]) => [
      key.toLowerCase(),
      action as ClipboardToolbarAction
    ])
  )

interface ClipboardToolbarProps {
  hasActive: boolean
  multiSelectMode: boolean
  activePinned: boolean
  activeFavorite: boolean
  onAction: (action: ClipboardToolbarAction) => void
}

const ACTIONS: Array<{
  id: ClipboardToolbarAction
  icon: string
  label: string
  danger?: boolean
  alwaysEnabled?: boolean
}> = [
  { id: 'pin', icon: '📌', label: '置顶' },
  { id: 'details', icon: '👁', label: '查询详情' },
  { id: 'copy', icon: '📋', label: '复制' },
  { id: 'multiSelect', icon: '☑', label: '多选', alwaysEnabled: true },
  { id: 'favorite', icon: '★', label: '收藏' },
  { id: 'delete', icon: '🗑', label: '删除', danger: true },
  { id: 'edit', icon: '✎', label: '编辑' },
  { id: 'saveAs', icon: '💾', label: '另存为' },
  { id: 'clearAll', icon: '🧹', label: '清空历史', danger: true, alwaysEnabled: true }
]

export function ClipboardToolbar({
  hasActive,
  multiSelectMode,
  activePinned,
  activeFavorite,
  onAction
}: ClipboardToolbarProps): React.ReactElement {
  return (
    <aside className="clipboard-toolbar" aria-label="剪贴板工具栏">
      {ACTIONS.map((action) => {
        const enabled = action.alwaysEnabled || hasActive
        const isActive =
          (action.id === 'multiSelect' && multiSelectMode) ||
          (action.id === 'pin' && activePinned) ||
          (action.id === 'favorite' && activeFavorite)
        const shortcut = CLIPBOARD_TOOLBAR_SHORTCUTS[action.id]

        return (
          <button
            key={action.id}
            type="button"
            className={`clipboard-toolbar-btn${action.danger ? ' danger' : ''}${isActive ? ' active' : ''}`}
            title={`${action.label} (${shortcut})`}
            aria-label={`${action.label} (${shortcut})`}
            disabled={!enabled}
            onClick={() => onAction(action.id)}
          >
            {action.icon}
          </button>
        )
      })}
      <div className="clipboard-toolbar-spacer" aria-hidden />
      <div className="clipboard-toolbar-spacer" aria-hidden />
    </aside>
  )
}

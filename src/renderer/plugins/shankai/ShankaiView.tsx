import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ShankaiModule, ShankaiShortcut, ShankaiTheme } from '../../../shared/shankai'
import './shankai.css'

type ConflictState = {
  moduleId: string
  targetPath: string
  moduleName: string
  shortcutId: string
}

export function ShankaiView(): React.ReactElement {
  const [theme, setTheme] = useState<ShankaiTheme>('aurora')
  const [modules, setModules] = useState<ShankaiModule[]>([])
  const [shortcuts, setShortcuts] = useState<ShankaiShortcut[]>([])
  const [icons, setIcons] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [menuModuleId, setMenuModuleId] = useState<string | null>(null)
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null)
  const [conflict, setConflict] = useState<ConflictState | null>(null)
  const [deleteShortcutId, setDeleteShortcutId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const showToast = (msg: string): void => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const loadIcons = useCallback(async (list: ShankaiShortcut[]) => {
    const updates: Record<string, string> = {}
    await Promise.all(
      list.map(async (s) => {
        const url = await window.toolbox.shankai.getIcon(s.targetPath)
        if (url) updates[s.targetPath] = url
      })
    )
    if (Object.keys(updates).length > 0) {
      setIcons((prev) => ({ ...prev, ...updates }))
    }
  }, [])

  const load = useCallback(async () => {
    const [t, mods, all] = await Promise.all([
      window.toolbox.shankai.getTheme(),
      window.toolbox.shankai.listModules(),
      window.toolbox.shankai.listShortcuts()
    ])
    setTheme(t)
    setModules(mods)
    setShortcuts(all)
    void loadIcons(all)
  }, [loadIcons])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!menuModuleId) return

    const onPointerDown = (e: MouseEvent): void => {
      if (menuRef.current?.contains(e.target as Node)) return
      setMenuModuleId(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuModuleId])

  const switchTheme = async (next: ShankaiTheme): Promise<void> => {
    setTheme(next)
    await window.toolbox.shankai.setTheme(next)
  }

  const createModule = async (): Promise<void> => {
    await window.toolbox.shankai.createModule()
    await load()
  }

  const startRename = (mod: ShankaiModule): void => {
    setRenamingId(mod.id)
    setRenameValue(mod.name)
    setMenuModuleId(null)
  }

  const commitRename = async (): Promise<void> => {
    if (!renamingId) return
    const result = await window.toolbox.shankai.renameModule(renamingId, renameValue)
    if (!result.ok) showToast(result.error)
    setRenamingId(null)
    await load()
  }

  const removeModule = async (id: string): Promise<void> => {
    const result = await window.toolbox.shankai.removeModule(id)
    if (!result.ok) showToast(result.error)
    else showToast('模块已删除')
    setMenuModuleId(null)
    await load()
  }

  const addShortcutToModule = async (moduleId: string, targetPath: string): Promise<void> => {
    const result = await window.toolbox.shankai.addShortcut(moduleId, targetPath, false)
    if (result.ok) {
      showToast(`已添加 ${result.shortcut.name}`)
      await load()
      return
    }
    if ('conflict' in result && result.conflict) {
      setConflict({
        moduleId,
        targetPath,
        moduleName: result.moduleName,
        shortcutId: result.shortcut.id
      })
      return
    }
    if ('error' in result && result.error) showToast(result.error)
  }

  const addToModule = async (moduleId: string): Promise<void> => {
    const targetPath = await window.toolbox.shankai.pickTarget()
    if (!targetPath) return
    await addShortcutToModule(moduleId, targetPath)
  }

  const resolveMove = async (): Promise<void> => {
    if (!conflict) return
    const result = await window.toolbox.shankai.moveShortcut(
      conflict.shortcutId,
      conflict.moduleId
    )
    if (!result.ok) showToast(result.error)
    else showToast('已移到本模块')
    setConflict(null)
    await load()
  }

  const launch = async (id: string): Promise<void> => {
    const result = await window.toolbox.shankai.launch(id)
    if (!result.ok) showToast(result.error)
  }

  const confirmDeleteShortcut = async (): Promise<void> => {
    if (!deleteShortcutId) return
    const result = await window.toolbox.shankai.removeShortcut(deleteShortcutId)
    if (!result.ok) showToast(result.error)
    setDeleteShortcutId(null)
    await load()
  }

  const handleModuleDragOver = (e: React.DragEvent, moduleId: string): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
      setDragOverModuleId(moduleId)
    }
  }

  const handleModuleDragLeave = (e: React.DragEvent, moduleId: string): void => {
    e.stopPropagation()
    const related = e.relatedTarget as Node | null
    if (related && e.currentTarget.contains(related)) return
    if (dragOverModuleId === moduleId) setDragOverModuleId(null)
  }

  const handleModuleDrop = async (e: React.DragEvent, moduleId: string): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverModuleId(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const file = files[0]
    let targetPath: string
    try {
      targetPath = window.toolbox.shankai.resolveDroppedFile(file)
    } catch {
      showToast('无法读取拖入的文件路径')
      return
    }

    await addShortcutToModule(moduleId, targetPath)
  }

  const shortcutsForModule = (moduleId: string): ShankaiShortcut[] =>
    shortcuts
      .filter((s) => s.moduleId === moduleId)
      .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className={`shankai-root shankai-theme-${theme}`}>
      <div className="shankai-bg" aria-hidden />

      <header className="shankai-header window-drag">
        <div className="shankai-title-wrap">
          <h1 className="shankai-title">闪开</h1>
        </div>
        <div className="shankai-theme-switch" role="group" aria-label="背景主题">
          <button
            type="button"
            className={theme === 'cyber-grid' ? 'active' : ''}
            onClick={() => void switchTheme('cyber-grid')}
          >
            赛博网格
          </button>
          <button
            type="button"
            className={theme === 'aurora' ? 'active' : ''}
            onClick={() => void switchTheme('aurora')}
          >
            Aurora
          </button>
        </div>
      </header>

      <div className="shankai-modules">
        {modules.length === 0 && (
          <div className="shankai-empty-global">
            <p>创建第一个模块，开始添加常用软件</p>
            <p className="shankai-empty-hint">支持点击 + 选择文件，或从桌面拖入 .exe / .lnk</p>
            <button type="button" className="shankai-btn-primary" onClick={() => void createModule()}>
              新建模块
            </button>
          </div>
        )}

        {modules.map((mod) => {
          const apps = shortcutsForModule(mod.id)
          const isEmpty = apps.length === 0
          const isMenuOpen = menuModuleId === mod.id
          const isDropTarget = dragOverModuleId === mod.id
          const moduleClass = [
            'shankai-module',
            isMenuOpen ? 'shankai-module--menu-open' : '',
            isDropTarget ? 'shankai-module--drop-target' : ''
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <section
              key={mod.id}
              className={moduleClass}
              onDragOver={(e) => handleModuleDragOver(e, mod.id)}
              onDragLeave={(e) => handleModuleDragLeave(e, mod.id)}
              onDrop={(e) => void handleModuleDrop(e, mod.id)}
            >
              <div className="shankai-module-head">
                {renamingId === mod.id ? (
                  <input
                    className="shankai-rename-input"
                    value={renameValue}
                    autoFocus
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => void commitRename()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void commitRename()
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="shankai-module-name"
                    onClick={() => startRename(mod)}
                    title="点击重命名"
                  >
                    {mod.name}
                  </button>
                )}
                <div className="shankai-module-actions" ref={isMenuOpen ? menuRef : undefined}>
                  <button
                    type="button"
                    className="shankai-icon-btn"
                    title="添加应用"
                    onClick={() => void addToModule(mod.id)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="shankai-icon-btn"
                    title="模块菜单"
                    onClick={() => setMenuModuleId(menuModuleId === mod.id ? null : mod.id)}
                  >
                    ⋯
                  </button>
                  {isMenuOpen && (
                    <div className="shankai-menu">
                      <button type="button" onClick={() => startRename(mod)}>
                        重命名
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => void removeModule(mod.id)}
                      >
                        删除模块
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEmpty ? (
                <p className="shankai-module-empty">
                  点击 + 或拖入桌面快捷方式
                </p>
              ) : (
                <div className="shankai-apps">
                  {apps.map((app) => (
                    <div key={app.id} className="shankai-app">
                      <button
                        type="button"
                        className="shankai-app-launch"
                        onClick={() => void launch(app.id)}
                        title={app.targetPath}
                      >
                        {icons[app.targetPath] ? (
                          <img src={icons[app.targetPath]} alt="" className="shankai-app-icon" />
                        ) : (
                          <span className="shankai-app-icon-fallback">◆</span>
                        )}
                        <span className="shankai-app-name">{app.name}</span>
                      </button>
                      <button
                        type="button"
                        className="shankai-app-remove"
                        title="移除"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteShortcutId(app.id)
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {modules.length > 0 && (
          <button type="button" className="shankai-new-module" onClick={() => void createModule()}>
            <span className="shankai-new-module-plus">+</span>
            <span>新建模块</span>
          </button>
        )}
      </div>

      {conflict && (
        <div className="shankai-dialog-backdrop">
          <div className="shankai-dialog">
            <p>该应用已在「{conflict.moduleName}」中</p>
            <div className="shankai-dialog-actions">
              <button type="button" onClick={() => setConflict(null)}>
                取消
              </button>
              <button type="button" className="shankai-btn-primary" onClick={() => void resolveMove()}>
                移到本模块
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteShortcutId && (
        <div className="shankai-dialog-backdrop">
          <div className="shankai-dialog">
            <p>确定移除此应用？</p>
            <div className="shankai-dialog-actions">
              <button type="button" onClick={() => setDeleteShortcutId(null)}>
                取消
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => void confirmDeleteShortcut()}
              >
                移除
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="shankai-toast">{toast}</div>}
    </div>
  )
}

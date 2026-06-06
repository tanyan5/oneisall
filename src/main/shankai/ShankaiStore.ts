import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { randomUUID } from 'crypto'
import type {
  AddShortcutResult,
  OpResult,
  ShankaiData,
  ShankaiModule,
  ShankaiRecentLaunch,
  ShankaiShortcut,
  ShankaiTheme
} from '../../shared/shankai'
import { defaultNameFromPath, isAllowedTarget } from './ShankaiLauncher'

const MAX_RECENT = 10

const DEFAULT_DATA: ShankaiData = {
  theme: 'aurora',
  modules: [],
  shortcuts: [],
  recentLaunches: []
}

export class ShankaiStore {
  private dataPath: string
  private cache: ShankaiData = { ...DEFAULT_DATA, modules: [], shortcuts: [], recentLaunches: [] }

  constructor() {
    this.dataPath = path.join(app.getPath('userData'), 'data', 'shankai.json')
    this.load()
  }

  private load(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = JSON.parse(fs.readFileSync(this.dataPath, 'utf8')) as Partial<ShankaiData>
        this.cache = {
          theme: raw.theme === 'cyber-grid' ? 'cyber-grid' : 'aurora',
          modules: raw.modules ?? [],
          shortcuts: raw.shortcuts ?? [],
          recentLaunches: raw.recentLaunches ?? []
        }
      }
    } catch {
      this.cache = {
        theme: 'aurora',
        modules: [],
        shortcuts: [],
        recentLaunches: []
      }
    }
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.dataPath), { recursive: true })
    fs.writeFileSync(this.dataPath, JSON.stringify(this.cache, null, 2), 'utf8')
  }

  getTheme(): ShankaiTheme {
    return this.cache.theme
  }

  setTheme(theme: ShankaiTheme): void {
    this.cache.theme = theme
    this.save()
  }

  listModules(): ShankaiModule[] {
    return [...this.cache.modules].sort((a, b) => a.order - b.order)
  }

  getModule(id: string): ShankaiModule | undefined {
    return this.cache.modules.find((m) => m.id === id)
  }

  createModule(name = '未命名模块'): ShankaiModule {
    const maxOrder = this.cache.modules.reduce((max, m) => Math.max(max, m.order), -1)
    const module: ShankaiModule = {
      id: randomUUID(),
      name,
      order: maxOrder + 1,
      createdAt: Date.now()
    }
    this.cache.modules.push(module)
    this.save()
    return module
  }

  renameModule(id: string, name: string): OpResult {
    const mod = this.cache.modules.find((m) => m.id === id)
    if (!mod) return { ok: false, error: '模块不存在' }
    mod.name = name.trim() || mod.name
    this.save()
    return { ok: true }
  }

  removeModule(id: string): OpResult {
    const mod = this.cache.modules.find((m) => m.id === id)
    if (!mod) return { ok: false, error: '模块不存在' }
    const count = this.cache.shortcuts.filter((s) => s.moduleId === id).length
    if (count > 0) {
      return { ok: false, error: '请先移除模块内的全部应用' }
    }
    this.cache.modules = this.cache.modules.filter((m) => m.id !== id)
    this.save()
    return { ok: true }
  }

  listShortcuts(moduleId?: string): ShankaiShortcut[] {
    let list = [...this.cache.shortcuts]
    if (moduleId) list = list.filter((s) => s.moduleId === moduleId)
    return list.sort((a, b) => b.createdAt - a.createdAt)
  }

  listAllShortcuts(): ShankaiShortcut[] {
    return this.listShortcuts()
  }

  findByTargetPath(targetPath: string): ShankaiShortcut | undefined {
    const normalized = path.normalize(targetPath)
    return this.cache.shortcuts.find((s) => path.normalize(s.targetPath) === normalized)
  }

  addShortcut(moduleId: string, targetPath: string, forceMove = false): AddShortcutResult {
    const mod = this.cache.modules.find((m) => m.id === moduleId)
    if (!mod) return { ok: false, error: '模块不存在' }

    const normalized = path.normalize(targetPath)
    if (!isAllowedTarget(normalized)) {
      return { ok: false, error: '仅支持 .exe 和 .lnk 文件' }
    }

    const existing = this.findByTargetPath(normalized)
    if (existing && existing.moduleId !== moduleId) {
      if (!forceMove) {
        const other = this.getModule(existing.moduleId)
        return {
          ok: false,
          conflict: true,
          shortcut: existing,
          moduleName: other?.name ?? '其他模块'
        }
      }
      existing.moduleId = moduleId
      existing.createdAt = Date.now()
      this.save()
      return { ok: true, shortcut: existing }
    }

    if (existing && existing.moduleId === moduleId) {
      return { ok: false, error: '该应用已在本模块中' }
    }

    const shortcut: ShankaiShortcut = {
      id: randomUUID(),
      moduleId,
      name: defaultNameFromPath(normalized),
      targetPath: normalized,
      createdAt: Date.now()
    }
    this.cache.shortcuts.push(shortcut)
    this.save()
    return { ok: true, shortcut }
  }

  moveShortcut(shortcutId: string, toModuleId: string): OpResult {
    const shortcut = this.cache.shortcuts.find((s) => s.id === shortcutId)
    const mod = this.cache.modules.find((m) => m.id === toModuleId)
    if (!shortcut) return { ok: false, error: '应用不存在' }
    if (!mod) return { ok: false, error: '模块不存在' }
    shortcut.moduleId = toModuleId
    shortcut.createdAt = Date.now()
    this.save()
    return { ok: true }
  }

  removeShortcut(id: string): OpResult {
    const before = this.cache.shortcuts.length
    this.cache.shortcuts = this.cache.shortcuts.filter((s) => s.id !== id)
    if (this.cache.shortcuts.length === before) {
      return { ok: false, error: '应用不存在' }
    }
    this.cache.recentLaunches = this.cache.recentLaunches.filter((r) => r.shortcutId !== id)
    this.save()
    return { ok: true }
  }

  getShortcut(id: string): ShankaiShortcut | undefined {
    return this.cache.shortcuts.find((s) => s.id === id)
  }

  recordAppLaunch(shortcutId: string): void {
    const filtered = this.cache.recentLaunches.filter((r) => r.shortcutId !== shortcutId)
    filtered.unshift({ kind: 'app', shortcutId, lastUsedAt: Date.now() })
    this.cache.recentLaunches = filtered.slice(0, MAX_RECENT)
    this.save()
  }

  getRecentLaunches(): ShankaiRecentLaunch[] {
    return [...this.cache.recentLaunches]
  }
}

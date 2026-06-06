import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import {
  DEFAULT_SHORTCUTS,
  type ShortcutActionId
} from '../../shared/shortcuts'
import type { PinnedSearchKeyword } from '../../shared/types'

export interface RecentToolEntry {
  id: string
  lastUsedAt: number
}

export interface DismissedPromoEntry {
  id: string
  dismissedAt: number
}

export interface AppSettings {
  lastUsedToolId: string | null
  recentTools: RecentToolEntry[]
  shortcuts: Record<ShortcutActionId, string>
  pinnedSearchKeywords: PinnedSearchKeyword[]
  dismissedAnnouncementIds: string[]
  dismissedPromos: DismissedPromoEntry[]
  showPromo: boolean
}

const MAX_RECENT = 10
const MAX_PINNED = 8

const DEFAULT_SETTINGS: AppSettings = {
  lastUsedToolId: null,
  recentTools: [],
  shortcuts: { ...DEFAULT_SHORTCUTS },
  pinnedSearchKeywords: [],
  dismissedAnnouncementIds: [],
  dismissedPromos: [],
  showPromo: true
}

export class SettingsStore {
  private settingsPath: string
  private cache: AppSettings = { ...DEFAULT_SETTINGS }

  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json')
    this.load()
  }

  private load(): void {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const raw = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8')) as Partial<AppSettings>
        let recentTools = raw.recentTools ?? []
        const lastUsedToolId = raw.lastUsedToolId ?? null

        if (recentTools.length === 0 && lastUsedToolId) {
          recentTools = [{ id: lastUsedToolId, lastUsedAt: Date.now() }]
        }

        this.cache = {
          lastUsedToolId,
          recentTools,
          shortcuts: { ...DEFAULT_SHORTCUTS, ...raw.shortcuts },
          pinnedSearchKeywords: raw.pinnedSearchKeywords ?? [],
          dismissedAnnouncementIds: raw.dismissedAnnouncementIds ?? [],
          dismissedPromos: raw.dismissedPromos ?? [],
          showPromo: raw.showPromo ?? true
        }
      }
    } catch {
      this.cache = {
        lastUsedToolId: null,
        recentTools: [],
        shortcuts: { ...DEFAULT_SHORTCUTS },
        pinnedSearchKeywords: [],
        dismissedAnnouncementIds: [],
        dismissedPromos: [],
        showPromo: true
      }
    }
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.settingsPath), { recursive: true })
    fs.writeFileSync(this.settingsPath, JSON.stringify(this.cache, null, 2), 'utf8')
  }

  getSettings(): AppSettings {
    return {
      lastUsedToolId: this.cache.lastUsedToolId,
      recentTools: [...this.cache.recentTools],
      shortcuts: { ...this.cache.shortcuts },
      pinnedSearchKeywords: [...this.cache.pinnedSearchKeywords],
      dismissedAnnouncementIds: [...this.cache.dismissedAnnouncementIds],
      dismissedPromos: [...this.cache.dismissedPromos],
      showPromo: this.cache.showPromo
    }
  }

  dismissAnnouncement(id: string): void {
    if (this.cache.dismissedAnnouncementIds.includes(id)) return
    this.cache.dismissedAnnouncementIds.push(id)
    this.save()
  }

  dismissPromo(id: string): void {
    const filtered = this.cache.dismissedPromos.filter((e) => e.id !== id)
    filtered.unshift({ id, dismissedAt: Date.now() })
    this.cache.dismissedPromos = filtered.slice(0, 20)
    this.save()
  }

  setShowPromo(show: boolean): void {
    this.cache.showPromo = show
    this.save()
  }

  getPinnedSearchKeywords(): PinnedSearchKeyword[] {
    return [...this.cache.pinnedSearchKeywords]
  }

  pinSearchKeyword(entry: PinnedSearchKeyword): void {
    const filtered = this.cache.pinnedSearchKeywords.filter(
      (p) => !(p.toolId === entry.toolId && p.keywordId === entry.keywordId)
    )
    filtered.unshift(entry)
    this.cache.pinnedSearchKeywords = filtered.slice(0, MAX_PINNED)
    this.save()
  }

  getShortcuts(): Record<ShortcutActionId, string> {
    return { ...this.cache.shortcuts }
  }

  setShortcuts(shortcuts: Record<ShortcutActionId, string>): void {
    this.cache.shortcuts = { ...shortcuts }
    this.save()
  }

  resetShortcuts(): void {
    this.cache.shortcuts = { ...DEFAULT_SHORTCUTS }
    this.save()
  }

  getRecentToolIds(): string[] {
    return this.cache.recentTools.map((entry) => entry.id)
  }

  recordRecentTool(id: string): void {
    if (id === 'home' || id === 'settings') return

    const filtered = this.cache.recentTools.filter((entry) => entry.id !== id)
    filtered.unshift({ id, lastUsedAt: Date.now() })
    this.cache.recentTools = filtered.slice(0, MAX_RECENT)
    this.cache.lastUsedToolId = id
    this.save()
  }

  getLastUsedToolId(): string | null {
    return this.cache.lastUsedToolId ?? this.cache.recentTools[0]?.id ?? null
  }

  setLastUsedToolId(id: string): void {
    this.recordRecentTool(id)
  }
}

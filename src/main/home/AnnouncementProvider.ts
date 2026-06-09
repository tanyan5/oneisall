import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { resolveResource } from '../appPaths'
import type { AnnouncementItem } from '../../shared/home'

interface AnnouncementsFile {
  items: AnnouncementItem[]
}

function resolvePaths(): string[] {
  const userPath = path.join(app.getPath('userData'), 'announcements.json')
  const bundled = resolveResource('announcements.json')
  return bundled ? [userPath, bundled] : [userPath]
}

function isActive(item: AnnouncementItem, now: number): boolean {
  if (item.expiresAt) {
    const exp = Date.parse(item.expiresAt)
    if (!Number.isNaN(exp) && exp < now) return false
  }
  return true
}

export class AnnouncementProvider {
  loadActive(dismissedIds: string[]): AnnouncementItem[] {
    const dismissed = new Set(dismissedIds)
    const now = Date.now()

    for (const filePath of resolvePaths()) {
      if (!fs.existsSync(filePath)) continue
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as AnnouncementsFile
        const items = (raw.items ?? []).filter(
          (item) => isActive(item, now) && !dismissed.has(item.id)
        )
        if (items.length > 0) return items
      } catch {
        continue
      }
    }
    return []
  }
}

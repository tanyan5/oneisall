import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import type { PromoItem } from '../../shared/home'

interface PromoFile {
  version?: number
  updatedAt?: string
  items: PromoItem[]
}

const CACHE_FILE = 'promo-cache.json'
const REMOTE_URL = process.env.ONEISALL_PROMO_URL ?? ''

function resolveLocalPaths(): string[] {
  const userPath = path.join(app.getPath('userData'), 'promo.json')
  const bundledPaths = [
    path.join(process.cwd(), 'resources', 'promo.json'),
    path.join(app.getAppPath(), 'resources', 'promo.json'),
    path.join(process.resourcesPath, 'promo.json')
  ]
  return [userPath, ...bundledPaths]
}

function cachePath(): string {
  return path.join(app.getPath('userData'), CACHE_FILE)
}

function parseVersion(): string {
  try {
    return app.getVersion()
  } catch {
    return '0.0.0'
  }
}

function versionGte(current: string, min: string): boolean {
  const parse = (v: string): number[] =>
    v.split('.').map((n) => parseInt(n, 10) || 0)
  const a = parse(current)
  const b = parse(min)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    if (av !== bv) return av > bv
  }
  return true
}

function isActive(item: PromoItem, now: number): boolean {
  if (item.expiresAt) {
    const exp = Date.parse(item.expiresAt)
    if (!Number.isNaN(exp) && exp < now) return false
  }
  return true
}

function readPromoFile(filePath: string): PromoItem[] {
  if (!fs.existsSync(filePath)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as PromoFile
    return raw.items ?? []
  } catch {
    return []
  }
}

function pickActive(items: PromoItem[], dismissedIds: string[]): PromoItem | null {
  const dismissed = new Set(dismissedIds)
  const now = Date.now()
  const appVersion = parseVersion()

  for (const item of items) {
    if (dismissed.has(item.id)) continue
    if (!isActive(item, now)) continue
    const min = (item as PromoItem & { minAppVersion?: string }).minAppVersion
    if (min && !versionGte(appVersion, min)) continue
    return item
  }
  return null
}

export class PromoProvider {
  private fetchPromise: Promise<void> | null = null

  getActive(dismissedIds: string[], showPromo: boolean): PromoItem | null {
    if (!showPromo) return null

    const cached = readPromoFile(cachePath())
    const fromCache = pickActive(cached, dismissedIds)
    if (fromCache) return fromCache

    for (const filePath of resolveLocalPaths()) {
      const item = pickActive(readPromoFile(filePath), dismissedIds)
      if (item) return item
    }
    return null
  }

  scheduleRemoteFetch(): void {
    if (!REMOTE_URL || this.fetchPromise) return
    this.fetchPromise = this.fetchRemote().finally(() => {
      this.fetchPromise = null
    })
  }

  private async fetchRemote(): Promise<void> {
    try {
      const res = await fetch(REMOTE_URL, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) return
      const raw = (await res.json()) as PromoFile
      if (!raw.items?.length) return
      fs.mkdirSync(path.dirname(cachePath()), { recursive: true })
      fs.writeFileSync(cachePath(), JSON.stringify(raw, null, 2), 'utf8')
    } catch {
      // fallback to cache/local on failure
    }
  }
}

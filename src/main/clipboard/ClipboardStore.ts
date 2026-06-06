import { createHash, randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import { app } from 'electron'
import type {
  ClipboardItem,
  ClipboardItemType,
  ClipboardListCategory,
  ClipboardListParams
} from '../../shared/types'

const MAX_ITEMS = 200
const MAX_PINNED = 5

export interface StoredClipboardRow {
  id: string
  type: ClipboardItemType
  preview: string
  detail: string
  payload_path: string | null
  payload_json: string | null
  content_hash: string
  created_at: number
  pinned?: number
  favorite?: number
}

export interface InsertPayload {
  type: ClipboardItemType
  preview: string
  detail: string
  contentHash: string
  payloadPath?: string | null
  payloadJson?: string | null
}

export class ClipboardStore {
  private db: Database.Database
  private dataDir: string
  private imagesDir: string
  private lastHash: string | null = null

  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'data')
    this.imagesDir = path.join(this.dataDir, 'images')
    fs.mkdirSync(this.imagesDir, { recursive: true })

    const dbPath = path.join(this.dataDir, 'clipboard.db')
    this.db = new Database(dbPath)
    this.initSchema()
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        preview TEXT NOT NULL,
        detail TEXT,
        payload_path TEXT,
        payload_json TEXT,
        content_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_clipboard_created ON clipboard_items(created_at DESC);
    `)
    this.migrateSchema()
  }

  private migrateSchema(): void {
    const cols = this.db.prepare('PRAGMA table_info(clipboard_items)').all() as { name: string }[]
    const names = new Set(cols.map((c) => c.name))
    if (!names.has('pinned')) {
      this.db.exec('ALTER TABLE clipboard_items ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0')
    }
    if (!names.has('favorite')) {
      this.db.exec('ALTER TABLE clipboard_items ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0')
    }
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_clipboard_pinned ON clipboard_items(pinned DESC, created_at DESC)'
    )
  }

  static hashContent(input: string): string {
    return createHash('sha256').update(input).digest('hex')
  }

  getImagesDir(): string {
    return this.imagesDir
  }

  insert(payload: InsertPayload): ClipboardItem | null {
    if (payload.contentHash === this.lastHash) return null

    const existing = this.db
      .prepare('SELECT id FROM clipboard_items WHERE content_hash = ? ORDER BY created_at DESC LIMIT 1')
      .get(payload.contentHash) as { id: string } | undefined

    if (existing) {
      this.lastHash = payload.contentHash
      return this.getById(existing.id)
    }

    const id = randomUUID()
    const createdAt = Date.now()

    this.db
      .prepare(
        `INSERT INTO clipboard_items (id, type, preview, detail, payload_path, payload_json, content_hash, created_at, pinned, favorite)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`
      )
      .run(
        id,
        payload.type,
        payload.preview,
        payload.detail,
        payload.payloadPath ?? null,
        payload.payloadJson ?? null,
        payload.contentHash,
        createdAt
      )

    this.trimOldItems()
    this.lastHash = payload.contentHash
    return this.getById(id)
  }

  private trimOldItems(): void {
    const count = this.db.prepare('SELECT COUNT(*) as c FROM clipboard_items').get() as { c: number }
    if (count.c <= MAX_ITEMS) return

    const excess = count.c - MAX_ITEMS
    const oldRows = this.db
      .prepare('SELECT id, payload_path FROM clipboard_items ORDER BY created_at ASC LIMIT ?')
      .all(excess) as { id: string; payload_path: string | null }[]

    for (const row of oldRows) {
      this.deleteById(row.id, false)
    }
  }

  private buildListQuery(params: ClipboardListParams): {
    where: string
    args: Array<string | number>
  } {
    const clauses: string[] = []
    const args: Array<string | number> = []
    const q = params.q?.trim()
    const category: ClipboardListCategory = params.category ?? 'all'

    if (q) {
      clauses.push('(preview LIKE ? OR detail LIKE ?)')
      const pattern = `%${q}%`
      args.push(pattern, pattern)
    }

    if (category === 'text') {
      clauses.push("type IN ('text', 'html')")
    } else if (category === 'image') {
      clauses.push("type = 'image'")
    } else if (category === 'files') {
      clauses.push("type = 'files'")
    } else if (category === 'favorite') {
      clauses.push('favorite = 1')
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
    return { where, args }
  }

  list(params: ClipboardListParams = {}): ClipboardItem[] {
    const offset = params.offset ?? 0
    const limit = params.limit ?? 200
    const { where, args } = this.buildListQuery(params)

    const rows = this.db
      .prepare(
        `SELECT * FROM clipboard_items ${where}
         ORDER BY pinned DESC, created_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...args, limit, offset) as StoredClipboardRow[]

    return rows.map((r) => this.toItem(r))
  }

  count(params: ClipboardListParams = {}): number {
    const { where, args } = this.buildListQuery(params)
    const row = this.db
      .prepare(`SELECT COUNT(*) as c FROM clipboard_items ${where}`)
      .get(...args) as { c: number }
    return row.c
  }

  getById(id: string): ClipboardItem | null {
    const row = this.db.prepare('SELECT * FROM clipboard_items WHERE id = ?').get(id) as
      | StoredClipboardRow
      | undefined
    return row ? this.toItem(row) : null
  }

  getRowById(id: string): StoredClipboardRow | null {
    const row = this.db.prepare('SELECT * FROM clipboard_items WHERE id = ?').get(id) as
      | StoredClipboardRow
      | undefined
    return row ?? null
  }

  setPinned(id: string, pinned: boolean): { ok: boolean; error?: string } {
    const row = this.getRowById(id)
    if (!row) return { ok: false, error: '记录不存在' }

    if (pinned) {
      const count = this.db
        .prepare('SELECT COUNT(*) as c FROM clipboard_items WHERE pinned = 1 AND id != ?')
        .get(id) as { c: number }
      if (count.c >= MAX_PINNED) {
        return { ok: false, error: `最多置顶 ${MAX_PINNED} 条` }
      }
    }

    this.db.prepare('UPDATE clipboard_items SET pinned = ? WHERE id = ?').run(pinned ? 1 : 0, id)
    return { ok: true }
  }

  setFavorite(id: string, favorite: boolean): { ok: boolean; error?: string } {
    const row = this.getRowById(id)
    if (!row) return { ok: false, error: '记录不存在' }
    this.db.prepare('UPDATE clipboard_items SET favorite = ? WHERE id = ?').run(favorite ? 1 : 0, id)
    return { ok: true }
  }

  updateText(id: string, text: string): boolean {
    const row = this.getRowById(id)
    if (!row || (row.type !== 'text' && row.type !== 'html')) return false

    const preview = text.slice(0, 80) + (text.length > 80 ? '…' : '')
    const payloadJson = JSON.stringify({ text })

    if (row.type === 'html' && row.payload_path) {
      try {
        fs.writeFileSync(row.payload_path, text.includes('<') ? text : `<html><body>${text}</body></html>`, 'utf8')
      } catch {
        // ignore
      }
    }

    this.db
      .prepare('UPDATE clipboard_items SET preview = ?, detail = ?, payload_json = ? WHERE id = ?')
      .run(preview, text, payloadJson, id)
    return true
  }

  deleteMany(ids: string[]): number {
    let removed = 0
    for (const id of ids) {
      if (this.deleteById(id, false)) removed++
    }
    if (removed > 0) this.lastHash = null
    return removed
  }

  clearAll(): void {
    const rows = this.db.prepare('SELECT id FROM clipboard_items').all() as { id: string }[]
    for (const row of rows) {
      this.deleteById(row.id, false)
    }
    this.lastHash = null
  }

  getImagePreview(id: string): string | null {
    const row = this.getRowById(id)
    if (!row || row.type !== 'image' || !row.payload_path || !fs.existsSync(row.payload_path)) {
      return null
    }
    const buf = fs.readFileSync(row.payload_path)
    return `data:image/png;base64,${buf.toString('base64')}`
  }

  deleteById(id: string, updateLastHash = true): boolean {
    const row = this.getRowById(id)
    if (!row) return false

    if (row.payload_path && fs.existsSync(row.payload_path)) {
      try {
        fs.unlinkSync(row.payload_path)
      } catch {
        // ignore
      }
    }

    this.db.prepare('DELETE FROM clipboard_items WHERE id = ?').run(id)
    if (updateLastHash) this.lastHash = null
    return true
  }

  private toItem(row: StoredClipboardRow): ClipboardItem {
    return {
      id: row.id,
      type: row.type as ClipboardItemType,
      preview: row.preview,
      detail: row.detail ?? row.preview,
      createdAt: row.created_at,
      pinned: Boolean(row.pinned),
      favorite: Boolean(row.favorite)
    }
  }
}

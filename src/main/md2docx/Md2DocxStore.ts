import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import type { Md2DocxPresetId, Md2DocxRecentEntry } from '../../shared/md2docx'
import { isMd2DocxPresetId } from '../../shared/md2docx'

const MAX_RECENT = 10

interface Md2DocxData {
  recent: Md2DocxRecentEntry[]
  presetId: Md2DocxPresetId
}

const DEFAULT_DATA: Md2DocxData = {
  recent: [],
  presetId: 'business-report'
}

export class Md2DocxStore {
  private dataPath: string
  private cache: Md2DocxData = { ...DEFAULT_DATA, recent: [] }

  constructor() {
    this.dataPath = path.join(app.getPath('userData'), 'data', 'md2docx.json')
    this.load()
  }

  private load(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = JSON.parse(fs.readFileSync(this.dataPath, 'utf8')) as Partial<Md2DocxData>
        this.cache = {
          recent: raw.recent ?? [],
          presetId: isMd2DocxPresetId(raw.presetId ?? '') ? raw.presetId! : 'business-report'
        }
      }
    } catch {
      this.cache = { ...DEFAULT_DATA, recent: [] }
    }
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.dataPath), { recursive: true })
    fs.writeFileSync(this.dataPath, JSON.stringify(this.cache, null, 2), 'utf8')
  }

  getPresetId(): Md2DocxPresetId {
    return this.cache.presetId
  }

  setPresetId(presetId: Md2DocxPresetId): void {
    this.cache.presetId = presetId
    this.save()
  }

  listRecent(): Md2DocxRecentEntry[] {
    return [...this.cache.recent]
  }

  recordConversion(sourcePath: string): void {
    const now = Date.now()
    const filtered = this.cache.recent.filter((e) => e.sourcePath !== sourcePath)
    this.cache.recent = [{ sourcePath, convertedAt: now }, ...filtered].slice(0, MAX_RECENT)
    this.save()
  }
}

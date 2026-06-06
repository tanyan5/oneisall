import { clipboard, nativeImage } from 'electron'
import fs from 'fs'
import path from 'path'
import { ClipboardStore } from './ClipboardStore'
import { readWindowsFiles } from './readWindowsFiles'
import type { ClipboardItem } from '../../shared/types'

type ChangeCallback = (item: ClipboardItem) => void

export class ClipboardWatcher {
  private store: ClipboardStore
  private paused = false
  private pollTimer: NodeJS.Timeout | null = null
  private lastSnapshot = ''
  private onChange: ChangeCallback | null = null
  private ignoreNext = false

  constructor(store: ClipboardStore) {
    this.store = store
  }

  setOnChange(cb: ChangeCallback): void {
    this.onChange = cb
  }

  setPaused(paused: boolean): void {
    this.paused = paused
  }

  isPaused(): boolean {
    return this.paused
  }

  start(): void {
    this.pollTimer = setInterval(() => this.capture(), 500)
    this.capture()
  }

  stop(): void {
    if (this.pollTimer) clearInterval(this.pollTimer)
  }

  /** Call before writing to system clipboard to avoid re-capturing our own write. */
  markIgnoreNext(): void {
    this.ignoreNext = true
    setTimeout(() => {
      this.ignoreNext = false
    }, 800)
  }

  private capture(): void {
    if (this.paused) return
    if (this.ignoreNext) return

    const snapshot = this.readSnapshot()
    if (!snapshot || snapshot === this.lastSnapshot) return
    this.lastSnapshot = snapshot

    const item = this.parseAndStore()
    if (item && this.onChange) this.onChange(item)
  }

  private readSnapshot(): string {
    const parts: string[] = []
    try {
      parts.push(clipboard.readText())
    } catch {
      parts.push('')
    }
    try {
      const img = clipboard.readImage()
      parts.push(img.isEmpty() ? '' : `${img.getSize().width}x${img.getSize().height}:${img.toPNG().length}`)
    } catch {
      parts.push('')
    }
    try {
      const files = readWindowsFiles()
      parts.push(files.map((f) => f.path).sort().join('|'))
    } catch {
      parts.push('')
    }
    return parts.join('\x1e')
  }

  private parseAndStore(): ClipboardItem | null {
    const files = readWindowsFiles()
    if (files.length > 0) {
      const paths = files.map((f) => f.path).sort()
      const hash = ClipboardStore.hashContent(`files:${paths.join('|')}`)
      const first = files[0].name
      const preview =
        files.length === 1 ? first : `${first} 等 ${files.length} 项`
      const detail = files.map((f) => f.name).join(' ')
      return this.store.insert({
        type: 'files',
        preview,
        detail,
        contentHash: hash,
        payloadJson: JSON.stringify(files)
      })
    }

    const image = clipboard.readImage()
    if (!image.isEmpty()) {
      const size = image.getSize()
      const png = image.toPNG()
      const sample = png.subarray(0, Math.min(4096, png.length))
      const hash = ClipboardStore.hashContent(`image:${size.width}x${size.height}:${sample.toString('base64')}`)

      const id = hash.slice(0, 32)
      const filePath = path.join(this.store.getImagesDir(), `${id}.png`)
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, png)
      }

      const preview = `[图片] ${size.width}×${size.height}`
      return this.store.insert({
        type: 'image',
        preview,
        detail: preview,
        contentHash: hash,
        payloadPath: filePath
      })
    }

    const html = clipboard.readHTML()
    const text = clipboard.readText()

    if (html && html.trim() && html !== text) {
      const plain = text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const hash = ClipboardStore.hashContent(`html:${html}`)
      const preview = plain.slice(0, 80) + (plain.length > 80 ? '…' : '')
      const htmlPath = path.join(this.store.getImagesDir(), `html-${hash.slice(0, 16)}.html`)
      if (!fs.existsSync(htmlPath)) fs.writeFileSync(htmlPath, html, 'utf8')

      return this.store.insert({
        type: 'html',
        preview,
        detail: plain,
        contentHash: hash,
        payloadPath: htmlPath,
        payloadJson: JSON.stringify({ text: plain })
      })
    }

    if (text && text.trim()) {
      const hash = ClipboardStore.hashContent(`text:${text}`)
      const preview = text.slice(0, 80) + (text.length > 80 ? '…' : '')
      return this.store.insert({
        type: 'text',
        preview,
        detail: text,
        contentHash: hash,
        payloadJson: JSON.stringify({ text })
      })
    }

    return null
  }

  copyItemToSystem(id: string): boolean {
    const row = this.store.getRowById(id)
    if (!row) return false

    this.markIgnoreNext()

    switch (row.type) {
      case 'text': {
        const data = row.payload_json ? JSON.parse(row.payload_json) : { text: row.detail }
        clipboard.writeText(data.text ?? row.detail)
        break
      }
      case 'html': {
        const html = row.payload_path ? fs.readFileSync(row.payload_path, 'utf8') : ''
        const data = row.payload_json ? JSON.parse(row.payload_json) : { text: row.detail }
        clipboard.write({ text: data.text ?? row.detail, html })
        break
      }
      case 'image': {
        if (row.payload_path && fs.existsSync(row.payload_path)) {
          const img = nativeImage.createFromPath(row.payload_path)
          clipboard.writeImage(img)
        }
        break
      }
      case 'files': {
        const files = row.payload_json ? (JSON.parse(row.payload_json) as { path: string }[]) : []
        if (files.length > 0) {
          clipboard.writeBuffer('CF_HDROP', buildCF_HDROP(files.map((f) => f.path)))
        }
        break
      }
      default:
        return false
    }

    this.lastSnapshot = this.readSnapshot()
    return true
  }
}

function buildCF_HDROP(paths: string[]): Buffer {
  const wide = true
  const headerSize = 20
  let filesSize = 0
  for (const p of paths) {
    filesSize += Buffer.byteLength(p, 'utf16le') + 2
  }
  filesSize += 2

  const total = headerSize + filesSize
  const buf = Buffer.alloc(total, 0)
  buf.writeUInt32LE(headerSize, 0)
  buf.writeUInt32LE(1, 16)

  let offset = headerSize
  for (const p of paths) {
    const encoded = Buffer.from(p, 'utf16le')
    encoded.copy(buf, offset)
    offset += encoded.length + 2
  }

  return buf
}

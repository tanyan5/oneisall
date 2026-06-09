/**
 * Generate built-in cyber-style PNG icons (plugins, nav, system tray).
 * Style: dark gradient base, neon grid/scan lines, distinct center glyph per tool.
 * Run: node scripts/gen-icons.mjs
 */
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SIZE = 48

// --- color helpers ---

function parseHex(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

function mix(c1, c2, t) {
  return {
    r: lerp(c1.r, c2.r, t),
    g: lerp(c1.g, c2.g, t),
    b: lerp(c1.b, c2.b, t)
  }
}

// --- canvas ---

class Canvas {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.data = new Uint8ClampedArray(w * h * 4)
  }

  idx(x, y) {
    return (y * this.w + x) * 4
  }

  get(x, y) {
    const i = this.idx(x, y)
    return {
      r: this.data[i],
      g: this.data[i + 1],
      b: this.data[i + 2],
      a: this.data[i + 3]
    }
  }

  set(x, y, color, alpha = 255) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const i = this.idx(x, y)
    const a = alpha / 255
    if (a >= 1) {
      this.data[i] = color.r
      this.data[i + 1] = color.g
      this.data[i + 2] = color.b
      this.data[i + 3] = 255
      return
    }
    const bg = this.get(x, y)
    const ba = bg.a / 255
    const outA = a + ba * (1 - a)
    if (outA <= 0) return
    this.data[i] = Math.round((color.r * a + bg.r * ba * (1 - a)) / outA)
    this.data[i + 1] = Math.round((color.g * a + bg.g * ba * (1 - a)) / outA)
    this.data[i + 2] = Math.round((color.b * a + bg.b * ba * (1 - a)) / outA)
    this.data[i + 3] = Math.round(outA * 255)
  }

  fill(fn) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) fn(x, y)
    }
  }
}

function drawLine(canvas, x0, y0, x1, y1, color, alpha = 255, thickness = 1) {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  let x = x0
  let y = y0
  const half = Math.floor(thickness / 2)

  while (true) {
    for (let oy = -half; oy <= half; oy++) {
      for (let ox = -half; ox <= half; ox++) {
        canvas.set(x + ox, y + oy, color, alpha)
      }
    }
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }
}

function drawPolyline(canvas, points, color, alpha = 255, thickness = 1, closed = false) {
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    drawLine(canvas, x0, y0, x1, y1, color, alpha, thickness)
  }
  if (closed && points.length > 2) {
    const [x0, y0] = points[points.length - 1]
    const [x1, y1] = points[0]
    drawLine(canvas, x0, y0, x1, y1, color, alpha, thickness)
  }
}

function insideRoundedRect(x, y, rx, ry, rw, rh, radius) {
  if (x < rx || y < ry || x >= rx + rw || y >= ry + rh) return false
  const r = radius
  if (x < rx + r && y < ry + r) {
    return (x - (rx + r)) ** 2 + (y - (ry + r)) ** 2 <= r * r
  }
  if (x >= rx + rw - r && y < ry + r) {
    return (x - (rx + rw - r - 1)) ** 2 + (y - (ry + r)) ** 2 <= r * r
  }
  if (x < rx + r && y >= ry + rh - r) {
    return (x - (rx + r)) ** 2 + (y - (ry + rh - r - 1)) ** 2 <= r * r
  }
  if (x >= rx + rw - r && y >= ry + rh - r) {
    return (x - (rx + rw - r - 1)) ** 2 + (y - (ry + rh - r - 1)) ** 2 <= r * r
  }
  return true
}

function drawRoundedRectFill(canvas, x, y, w, h, radius, color, alpha = 255) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      if (insideRoundedRect(px, py, x, y, w, h, radius)) {
        canvas.set(px, py, color, alpha)
      }
    }
  }
}

function drawRoundedRectStroke(canvas, x, y, w, h, radius, color, alpha = 255, thickness = 1) {
  for (let t = 0; t < thickness; t++) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        const onEdge =
          insideRoundedRect(px, py, x, y, w, h, radius) &&
          !insideRoundedRect(px, py, x + t, y + t, w - 2 * t, h - 2 * t, Math.max(0, radius - t))
        if (onEdge) canvas.set(px, py, color, alpha)
      }
    }
  }
}

// --- cyber drawing primitives ---

const BG_TOP = parseHex('#141824')
const BG_BOTTOM = parseHex('#1e2433')
const GLYPH = { r: 235, g: 240, b: 255 }

function drawCyberBase(canvas, accent) {
  canvas.fill((x, y) => {
    const t = y / (SIZE - 1)
    const bg = mix(BG_TOP, BG_BOTTOM, t)
    canvas.set(x, y, bg, 255)
  })

  drawRoundedRectFill(canvas, 2, 2, SIZE - 4, SIZE - 4, 8, BG_BOTTOM, 255)
  drawRoundedRectStroke(canvas, 2, 2, SIZE - 4, SIZE - 4, 8, accent, 90, 1)

  const gridColor = mix(accent, BG_TOP, 0.55)
  for (let x = 6; x < SIZE - 6; x += 6) {
    drawLine(canvas, x, 6, x, SIZE - 7, gridColor, 35, 1)
  }
  for (let y = 6; y < SIZE - 6; y += 6) {
    drawLine(canvas, 6, y, SIZE - 7, y, gridColor, 35, 1)
  }

  const scan = mix(accent, { r: 255, g: 255, b: 255 }, 0.35)
  for (let i = -SIZE; i < SIZE * 2; i += 7) {
    drawLine(canvas, i, SIZE - 6, i + 20, 6, scan, 22, 1)
  }

  drawLine(canvas, SIZE - 10, 6, SIZE - 4, 6, accent, 200, 2)
  drawLine(canvas, SIZE - 6, 6, SIZE - 6, 12, accent, 200, 2)
}

function drawCornerBracket(canvas, accent) {
  drawLine(canvas, 8, 8, 16, 8, accent, 160, 2)
  drawLine(canvas, 8, 8, 8, 16, accent, 160, 2)
  drawLine(canvas, SIZE - 9, SIZE - 9, SIZE - 17, SIZE - 9, accent, 120, 2)
  drawLine(canvas, SIZE - 9, SIZE - 9, SIZE - 9, SIZE - 17, accent, 120, 2)
}

// --- per-icon glyphs ---

function drawClipboardGlyph(canvas, accent) {
  const cx = 24
  // stacked card hint (history)
  drawRoundedRectStroke(canvas, cx - 5, 17, 11, 16, 2, accent, 70, 1)
  // main board
  drawRoundedRectStroke(canvas, cx - 8, 14, 14, 20, 3, GLYPH, 255, 2)
  // clip
  drawRoundedRectFill(canvas, cx - 4, 10, 6, 5, 2, accent, 255)
  drawRoundedRectStroke(canvas, cx - 5, 9, 8, 6, 2, GLYPH, 255, 1)
  // content lines
  drawLine(canvas, cx - 5, 20, cx + 5, 20, accent, 240, 1)
  drawLine(canvas, cx - 5, 24, cx + 5, 24, accent, 200, 1)
  drawLine(canvas, cx - 5, 28, cx + 2, 28, accent, 160, 1)
}

function drawShankaiGlyph(canvas, accent) {
  const hex = []
  const cx = 24
  const cy = 24
  const r = 14
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    hex.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))])
  }
  drawPolyline(canvas, hex, accent, 140, 1, true)

  const bolt = [
    [26, 12], [20, 24], [24, 24], [18, 36], [28, 22], [24, 22], [30, 12]
  ]
  drawPolyline(canvas, bolt, GLYPH, 255, 2, false)
  drawLine(canvas, cx - 10, cy, cx + 10, cy, accent, 80, 1)
  drawLine(canvas, cx, cy - 10, cx, cy + 10, accent, 80, 1)
}

function drawDemoGlyph(canvas, accent) {
  const front = [
    [16, 22], [28, 22], [28, 34], [16, 34]
  ]
  const back = [
    [20, 16], [32, 16], [32, 28], [20, 28]
  ]
  drawPolyline(canvas, back, accent, 200, 2, true)
  drawPolyline(canvas, front, GLYPH, 255, 2, true)
  drawLine(canvas, 16, 22, 20, 16, accent, 180, 2)
  drawLine(canvas, 28, 22, 32, 16, accent, 180, 2)
  drawLine(canvas, 16, 34, 20, 28, accent, 180, 2)
  drawLine(canvas, 28, 34, 32, 28, accent, 180, 2)
}

function drawMd2DocxGlyph(canvas, accent) {
  // left markdown page (narrow)
  drawRoundedRectStroke(canvas, 10, 15, 9, 18, 2, GLYPH, 255, 2)
  drawLine(canvas, 12, 18, 17, 18, accent, 220, 1)
  drawLine(canvas, 14, 16, 14, 20, accent, 220, 1)
  drawLine(canvas, 16, 16, 16, 20, accent, 220, 1)
  drawLine(canvas, 12, 23, 17, 23, accent, 180, 1)
  drawLine(canvas, 12, 26, 16, 26, accent, 140, 1)
  drawLine(canvas, 12, 29, 15, 29, accent, 120, 1)

  // conversion arrow
  drawLine(canvas, 20, 24, 26, 24, accent, 255, 2)
  drawLine(canvas, 24, 21, 27, 24, accent, 255, 2)
  drawLine(canvas, 24, 27, 27, 24, accent, 255, 2)

  // right word page (wider)
  drawRoundedRectStroke(canvas, 29, 13, 10, 20, 2, GLYPH, 255, 2)
  drawLine(canvas, 31, 18, 37, 18, accent, 200, 1)
  drawLine(canvas, 31, 22, 37, 22, accent, 200, 1)
  drawLine(canvas, 31, 26, 37, 26, accent, 180, 1)
  drawLine(canvas, 31, 30, 35, 30, accent, 160, 1)
}

function drawHomeGlyph(canvas, accent) {
  drawLine(canvas, 14, 22, 24, 12, GLYPH, 255, 2)
  drawLine(canvas, 24, 12, 34, 22, GLYPH, 255, 2)
  drawPolyline(
    canvas,
    [
      [16, 22],
      [16, 36],
      [32, 36],
      [32, 22]
    ],
    GLYPH,
    255,
    2,
    true
  )
  drawRoundedRectFill(canvas, 21, 28, 6, 8, 1, accent, 180)
  drawLine(canvas, 6, 36, SIZE - 7, 36, accent, 100, 1)
}

function drawCircleStroke(canvas, cx, cy, radius, color, alpha, thickness) {
  for (let t = 0; t < thickness; t++) {
    const r = radius - t
    const y0 = Math.floor(cy - r - 1)
    const y1 = Math.ceil(cy + r + 1)
    const x0 = Math.floor(cx - r - 1)
    const x1 = Math.ceil(cx + r + 1)
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy)
        if (d >= r - 0.55 && d <= r + 0.55) {
          canvas.set(x, y, color, alpha)
        }
      }
    }
  }
}

function drawCircleFill(canvas, cx, cy, radius, color, alpha) {
  const y0 = Math.floor(cy - radius)
  const y1 = Math.ceil(cy + radius)
  const x0 = Math.floor(cx - radius)
  const x1 = Math.ceil(cx + radius)
  const r2 = radius * radius
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r2) {
        canvas.set(x, y, color, alpha)
      }
    }
  }
}

/** OneIsAll O-ring brand glyph (replaces legacy lion tray mark). */
function drawBrandGlyph(canvas, accent) {
  const cx = SIZE / 2
  const cy = SIZE / 2
  const ringR = Math.round((11 / 32) * SIZE)
  const stroke = Math.max(1, Math.round((2 / 32) * SIZE))
  drawCircleStroke(canvas, cx, cy, ringR, accent, 255, stroke)
  if (SIZE >= 32) {
    const coreR = Math.max(1, Math.round((1.2 / 32) * SIZE))
    const core = mix(accent, { r: 255, g: 255, b: 255 }, 0.45)
    drawCircleFill(canvas, cx, cy, coreR, core, 255)
  }
}

function drawSettingsGlyph(canvas, accent) {
  const cx = 24
  const cy = 24
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i
    const x1 = Math.round(cx + 8 * Math.cos(a))
    const y1 = Math.round(cy + 8 * Math.sin(a))
    const x2 = Math.round(cx + 13 * Math.cos(a))
    const y2 = Math.round(cy + 13 * Math.sin(a))
    drawLine(canvas, x1, y1, x2, y2, GLYPH, 255, 2)
  }
  drawRoundedRectStroke(canvas, cx - 6, cy - 6, 12, 12, 6, accent, 160, 1)
  for (let r = 10; r <= 16; r += 3) {
    drawRoundedRectStroke(canvas, cx - r, cy - r, r * 2, r * 2, r, accent, 40, 1)
  }
}

const GLYPH_DRAWERS = {
  clipboard: drawClipboardGlyph,
  shankai: drawShankaiGlyph,
  demo: drawDemoGlyph,
  md2docx: drawMd2DocxGlyph,
  home: drawHomeGlyph,
  settings: drawSettingsGlyph,
  tray: drawBrandGlyph
}

const ICON_DEFS = [
  { id: 'clipboard', accent: '#38bdf8', out: 'plugins/clipboard/icon.png' },
  { id: 'shankai', accent: '#c084fc', out: 'plugins/shankai/icon.png' },
  { id: 'demo', accent: '#4ade80', out: 'plugins/demo/icon.png' },
  { id: 'md2docx', accent: '#fbbf24', out: 'plugins/md2docx/icon.png' },
  { id: 'home', accent: '#818cf8', out: 'resources/nav/home.png' },
  { id: 'settings', accent: '#94a3b8', out: 'resources/nav/settings.png' },
  { id: 'tray', accent: '#22D3EE', out: 'resources/tray/tray-48.png' }
]

function downscaleCanvas(src, targetSize) {
  const dst = new Canvas(targetSize, targetSize)
  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const sx = Math.min(src.w - 1, Math.floor((x / targetSize) * src.w))
      const sy = Math.min(src.h - 1, Math.floor((y / targetSize) * src.h))
      const c = src.get(sx, sy)
      dst.set(x, y, { r: c.r, g: c.g, b: c.b }, c.a)
    }
  }
  return dst
}

function renderIcon(def) {
  const canvas = new Canvas(SIZE, SIZE)
  const accent = parseHex(def.accent)
  drawCyberBase(canvas, accent)
  drawCornerBracket(canvas, accent)
  GLYPH_DRAWERS[def.id](canvas, accent)
  return canvas
}

// --- PNG encode (RGBA) ---

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
  }
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(canvas) {
  const { w, h, data } = canvas
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const rows = []
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 4)
    row[0] = 0
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4
      const o = 1 + x * 4
      row[o] = data[si]
      row[o + 1] = data[si + 1]
      row[o + 2] = data[si + 2]
      row[o + 3] = data[si + 3]
    }
    rows.push(row)
  }

  const idat = zlib.deflateSync(Buffer.concat(rows))
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

function writePng(canvas, relPath) {
  const out = path.join(root, relPath)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  const png = encodePng(canvas)
  fs.writeFileSync(out, png)
  console.log(`wrote ${relPath} (${png.length} bytes)`)
}

function encodeIco(pngBuffers) {
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  let offset = 6 + count * 16
  const entries = []
  const datas = []
  for (const { size, png } of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry[0] = size >= 256 ? 0 : size
    entry[1] = size >= 256 ? 0 : size
    entry[4] = 1
    entry[6] = 32
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    datas.push(png)
    offset += png.length
  }
  return Buffer.concat([header, ...entries, ...datas])
}

let trayCanvas = null
for (const def of ICON_DEFS) {
  const canvas = renderIcon(def)
  writePng(canvas, def.out)

  if (def.id === 'tray') {
    trayCanvas = canvas
    writePng(downscaleCanvas(canvas, 32), 'resources/tray/tray-32.png')
    writePng(downscaleCanvas(canvas, 16), 'resources/tray/tray-16.png')
    writePng(downscaleCanvas(canvas, 32), 'resources/tray/tray.png')
  }
}

if (trayCanvas) {
  const icoSizes = [16, 32, 48, 256]
  const pngBuffers = icoSizes.map((size) => ({
    size,
    png: encodePng(downscaleCanvas(trayCanvas, size))
  }))
  const icoPath = path.join(root, 'resources', 'icon.ico')
  fs.mkdirSync(path.dirname(icoPath), { recursive: true })
  const icoBuf = encodeIco(pngBuffers)
  fs.writeFileSync(icoPath, icoBuf)
  console.log(`wrote resources/icon.ico (${icoBuf.length} bytes)`)
}

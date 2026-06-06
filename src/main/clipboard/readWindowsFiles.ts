import { clipboard } from 'electron'

export interface FileEntry {
  path: string
  name: string
}

/** Parse Windows CF_HDROP clipboard buffer into file paths. */
function parseCF_HDROP(buffer: Buffer): string[] {
  if (buffer.length < 20) return []

  const pFiles = buffer.readUInt32LE(0)
  const fWide = buffer.readUInt32LE(16) !== 0
  const listStart = pFiles
  if (listStart >= buffer.length) return []

  const paths: string[] = []
  let offset = listStart

  while (offset < buffer.length) {
    if (fWide) {
      let end = offset
      while (end + 1 < buffer.length) {
        if (buffer[end] === 0 && buffer[end + 1] === 0) break
        end += 2
      }
      if (end === offset) break
      const slice = buffer.subarray(offset, end)
      const path = slice.toString('utf16le')
      if (!path) break
      paths.push(path)
      offset = end + 2
    } else {
      let end = offset
      while (end < buffer.length && buffer[end] !== 0) end++
      if (end === offset) break
      const path = buffer.subarray(offset, end).toString('utf8')
      if (!path) break
      paths.push(path)
      offset = end + 1
    }
  }

  return paths
}

export function readWindowsFiles(): FileEntry[] {
  const formats = ['CF_HDROP', 'FileGroupDescriptorW', 'FileNameW'] as const

  for (const format of formats) {
    try {
      const buffer = clipboard.readBuffer(format)
      if (!buffer || buffer.length === 0) continue

      if (format === 'CF_HDROP') {
        const paths = parseCF_HDROP(buffer)
        if (paths.length > 0) {
          return paths.map((path) => ({
            path,
            name: path.split(/[/\\]/).pop() ?? path
          }))
        }
      }

      if (format === 'FileNameW') {
        const text = buffer.toString('utf16le').replace(/\0/g, '')
        if (text) {
          return [{ path: text, name: text.split(/[/\\]/).pop() ?? text }]
        }
      }
    } catch {
      // format not available
    }
  }

  return []
}

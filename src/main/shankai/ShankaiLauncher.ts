import fs from 'fs'
import path from 'path'
import { app, shell } from 'electron'
import { spawn } from 'child_process'
import type { LaunchResult } from '../../shared/shankai'

const ALLOWED_EXT = new Set(['.exe', '.lnk'])
const iconCache = new Map<string, string>()

export function isAllowedTarget(filePath: string): boolean {
  return ALLOWED_EXT.has(path.extname(filePath).toLowerCase())
}

export function defaultNameFromPath(filePath: string): string {
  return path.basename(filePath, path.extname(filePath))
}

export async function launchTarget(targetPath: string): Promise<LaunchResult> {
  if (!fs.existsSync(targetPath)) {
    return { ok: false, error: '路径不存在或已被移动' }
  }

  const ext = path.extname(targetPath).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) {
    return { ok: false, error: '仅支持 .exe 和 .lnk 文件' }
  }

  try {
    if (ext === '.lnk') {
      const err = await shell.openPath(targetPath)
      if (err) return { ok: false, error: err }
      return { ok: true }
    }

    spawn(targetPath, [], { detached: true, stdio: 'ignore' }).unref()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

function resolveIconPath(targetPath: string): string | null {
  if (!fs.existsSync(targetPath)) return null

  const ext = path.extname(targetPath).toLowerCase()
  if (ext === '.lnk') {
    try {
      const link = shell.readShortcutLink(targetPath)
      if (link.target && fs.existsSync(link.target)) {
        return link.target
      }
    } catch {
      // fall through to shortcut path
    }
  }

  return targetPath
}

export async function getTargetIconDataUrl(targetPath: string): Promise<string | null> {
  const cached = iconCache.get(targetPath)
  if (cached) return cached

  try {
    const iconPath = resolveIconPath(targetPath)
    if (!iconPath) return null
    const image = await app.getFileIcon(iconPath, { size: 'large' })
    const url = image.toDataURL()
    iconCache.set(targetPath, url)
    return url
  } catch {
    return null
  }
}

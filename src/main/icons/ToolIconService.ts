import fs from 'fs'
import path from 'path'
import { nativeImage } from 'electron'
import { resolveResource } from '../appPaths'
import type { PluginManifest } from '../../shared/types'
import { createLetterIconDataUrl } from './letterIcon'

const BUILTIN_NAV = new Set(['home', 'settings'])

const LETTER_COLORS: Record<string, string> = {
  home: '#6366f1',
  settings: '#64748b',
  clipboard: '#3b82f6',
  shankai: '#a855f7',
  demo: '#22c55e'
}

export class ToolIconService {
  private pluginRoots = new Map<string, { dir: string; manifest?: PluginManifest }>()
  private cache = new Map<string, string>()

  registerPlugin(id: string, pluginDir: string, manifest?: PluginManifest): void {
    this.pluginRoots.set(id, { dir: pluginDir, manifest })
    this.cache.delete(id)
  }

  async getIcon(toolId: string): Promise<string | null> {
    const cached = this.cache.get(toolId)
    if (cached) return cached

    const dataUrl = await this.resolveIcon(toolId)
    if (dataUrl) this.cache.set(toolId, dataUrl)
    return dataUrl
  }

  /** Filesystem path for taskbar/window icon (plugins & nav PNGs). */
  getIconFilePath(toolId: string): string | null {
    if (BUILTIN_NAV.has(toolId)) {
      return this.resolveNavIconPath(toolId)
    }
    const entry = this.pluginRoots.get(toolId)
    if (entry) {
      return this.resolvePluginIconPath(entry.dir, entry.manifest)
    }
    return null
  }

  private async resolveIcon(toolId: string): Promise<string | null> {
    const filePath = this.getIconFilePath(toolId)
    if (filePath) return this.pathToDataUrl(filePath)

    const letter = toolId === 'home' ? 'H' : toolId === 'settings' ? 'S' : (toolId[0]?.toUpperCase() ?? '?')
    return createLetterIconDataUrl(letter, LETTER_COLORS[toolId] ?? '#6366f1')
  }

  private resolveNavIconPath(id: string): string | null {
    return resolveResource('nav', `${id}.png`)
  }

  private resolvePluginIconPath(dir: string, manifest?: PluginManifest): string | null {
    if (manifest?.icon) {
      const custom = path.isAbsolute(manifest.icon)
        ? manifest.icon
        : path.join(dir, manifest.icon)
      if (fs.existsSync(custom)) return custom
    }
    const defaultIcon = path.join(dir, 'icon.png')
    if (fs.existsSync(defaultIcon)) return defaultIcon
    return null
  }

  private pathToDataUrl(filePath: string): string | null {
    try {
      const img = nativeImage.createFromPath(filePath)
      if (img.isEmpty()) return null
      return img.toDataURL()
    } catch {
      return null
    }
  }
}

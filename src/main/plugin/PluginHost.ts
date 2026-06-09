import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import type { PluginManifest, ToolMeta } from '../../shared/types'
import type { IToolPlugin, PluginHostContext } from './types'
import type { ToolIconService } from '../icons/ToolIconService'
import { getBuiltinPluginDirs } from '../appPaths'
import { ClipboardPlugin } from '../../../plugins/clipboard/main'
import { ShankaiPlugin } from '../../../plugins/shankai/main'

export class PluginHost {
  private tools = new Map<string, ToolMeta>()
  private plugins = new Map<string, IToolPlugin>()
  private disabled = new Set<string>()
  private context: PluginHostContext | null = null
  private iconService: ToolIconService | null = null

  async initialize(context: PluginHostContext, iconService?: ToolIconService): Promise<void> {
    this.context = context
    this.iconService = iconService ?? null
    await this.scanManifests()
    await this.activateEnabled()
  }

  private getPluginDirs(): string[] {
    const userDir = path.join(app.getPath('userData'), 'plugins')
    const dirs = [...getBuiltinPluginDirs()]
    if (fs.existsSync(userDir)) dirs.push(userDir)
    return [...new Set(dirs)]
  }

  private async scanManifests(): Promise<void> {
    const seen = new Set<string>()

    for (const dir of this.getPluginDirs()) {
      if (!fs.existsSync(dir)) continue
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const ent of entries) {
        if (!ent.isDirectory()) continue
        const manifestPath = path.join(dir, ent.name, 'plugin.json')
        if (!fs.existsSync(manifestPath)) continue

        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as PluginManifest
          if (manifest.id === 'home' || manifest.id === 'settings') continue
          if (seen.has(manifest.id)) continue
          seen.add(manifest.id)

          const pluginDir = path.join(dir, ent.name)
          this.iconService?.registerPlugin(manifest.id, pluginDir, manifest)

          this.tools.set(manifest.id, {
            id: manifest.id,
            name: manifest.name,
            version: manifest.version,
            description: manifest.description,
            icon: manifest.icon,
            launchKeywords: manifest.launchKeywords,
            enabled: !this.disabled.has(manifest.id),
            builtin: dir.includes('plugins') && !dir.includes('userData')
          })
        } catch {
          // skip invalid manifest
        }
      }
    }

    this.registerBuiltinTool('clipboard', {
      id: 'clipboard',
      name: '剪贴板',
      version: '1.0.0',
      description: '历史记录、搜索与一键粘贴',
      enabled: true,
      builtin: true
    })

    this.registerBuiltinTool('demo', {
      id: 'demo',
      name: '示例工具',
      version: '0.1.0',
      description: '插件框架占位示例',
      enabled: true,
      builtin: true
    })

    this.registerBuiltinTool('shankai', {
      id: 'shankai',
      name: '闪开',
      version: '1.0.0',
      description: '电脑软件快捷启动',
      enabled: true,
      builtin: true
    })
  }

  private registerBuiltinTool(id: string, meta: ToolMeta): void {
    if (this.tools.has(id)) return

    for (const dir of this.getPluginDirs()) {
      const pluginDir = path.join(dir, id)
      const manifestPath = path.join(pluginDir, 'plugin.json')
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as PluginManifest
          this.iconService?.registerPlugin(id, pluginDir, manifest)
        } catch {
          this.iconService?.registerPlugin(id, pluginDir)
        }
        break
      }
    }

    this.tools.set(id, meta)
  }

  private async activateEnabled(): Promise<void> {
    if (!this.context) return

    const clipboard = new ClipboardPlugin()
    this.plugins.set(clipboard.id, clipboard)

    const shankai = new ShankaiPlugin()
    this.plugins.set(shankai.id, shankai)

    for (const [id, meta] of this.tools) {
      if (!meta.enabled) continue
      const plugin = this.plugins.get(id)
      if (plugin) {
        await plugin.activate(this.context)
      }
    }
  }

  getTools(): ToolMeta[] {
    return [...this.tools.values()].map((t) => ({
      ...t,
      enabled: !this.disabled.has(t.id)
    }))
  }

  enable(id: string): void {
    this.disabled.delete(id)
    const meta = this.tools.get(id)
    if (meta) meta.enabled = true
    const plugin = this.plugins.get(id)
    if (plugin && this.context) void plugin.activate(this.context)
  }

  disable(id: string): void {
    this.disabled.add(id)
    const meta = this.tools.get(id)
    if (meta) meta.enabled = false
    const plugin = this.plugins.get(id)
    if (plugin) void plugin.deactivate()
  }

  async shutdown(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.deactivate()
    }
  }
}

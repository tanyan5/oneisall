import { dialog, ipcMain } from 'electron'
import type { IToolPlugin, PluginHostContext } from '../../src/main/plugin/types'
import { getShankaiStore } from '../../src/main/shankai'
import { getTargetIconDataUrl, launchTarget } from '../../src/main/shankai/ShankaiLauncher'
import type { ShankaiTheme } from '../../src/shared/shankai'

export class ShankaiPlugin implements IToolPlugin {
  id = 'shankai'
  private registered = false

  async activate(_host: PluginHostContext): Promise<void> {
    const store = getShankaiStore()
    if (this.registered) return

    ipcMain.handle('shankai:getTheme', () => store.getTheme())

    ipcMain.handle('shankai:setTheme', (_e, theme: ShankaiTheme) => {
      if (theme !== 'cyber-grid' && theme !== 'aurora') return
      store.setTheme(theme)
    })

    ipcMain.handle('shankai:listModules', () => store.listModules())

    ipcMain.handle('shankai:createModule', (_e, name?: string) => store.createModule(name))

    ipcMain.handle('shankai:renameModule', (_e, id: string, name: string) =>
      store.renameModule(id, name)
    )

    ipcMain.handle('shankai:removeModule', (_e, id: string) => store.removeModule(id))

    ipcMain.handle('shankai:listShortcuts', (_e, moduleId?: string) =>
      store.listShortcuts(moduleId)
    )

    ipcMain.handle('shankai:listAllShortcuts', () => store.listAllShortcuts())

    ipcMain.handle(
      'shankai:addShortcut',
      (_e, moduleId: string, targetPath: string, forceMove?: boolean) =>
        store.addShortcut(moduleId, targetPath, forceMove ?? false)
    )

    ipcMain.handle('shankai:moveShortcut', (_e, shortcutId: string, toModuleId: string) =>
      store.moveShortcut(shortcutId, toModuleId)
    )

    ipcMain.handle('shankai:removeShortcut', (_e, id: string) => store.removeShortcut(id))

    ipcMain.handle('shankai:launch', async (_e, id: string) => {
      const shortcut = store.getShortcut(id)
      if (!shortcut) return { ok: false, error: '应用不存在' }
      const result = await launchTarget(shortcut.targetPath)
      if (result.ok) store.recordAppLaunch(id)
      return result
    })

    ipcMain.handle('shankai:getIcon', async (_e, targetPath: string) =>
      getTargetIconDataUrl(targetPath)
    )

    ipcMain.handle('shankai:pickTarget', async () => {
      const result = await dialog.showOpenDialog({
        title: '选择应用',
        properties: ['openFile'],
        filters: [
          { name: '应用程序', extensions: ['exe', 'lnk'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      if (result.canceled || result.filePaths.length === 0) return null
      return result.filePaths[0]
    })

    this.registered = true
  }

  async deactivate(): Promise<void> {
    // IPC handlers persist for app lifetime
  }
}

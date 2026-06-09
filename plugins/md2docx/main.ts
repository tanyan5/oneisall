import { dialog, ipcMain, shell } from 'electron'
import type { IToolPlugin, PluginHostContext } from '../../src/main/plugin/types'
import { getMd2DocxStore } from '../../src/main/md2docx'
import { convertMarkdownFile, defaultOutputPath } from '../../src/main/md2docx/Md2DocxConverter'
import type { Md2DocxConvertRequest, Md2DocxPresetId } from '../../src/shared/md2docx'
import { isMarkdownPath, isMd2DocxPresetId } from '../../src/shared/md2docx'

export class Md2DocxPlugin implements IToolPlugin {
  id = 'md2docx'
  private registered = false

  async activate(_host: PluginHostContext): Promise<void> {
    const store = getMd2DocxStore()
    if (this.registered) return

    ipcMain.handle('md2docx:getPreset', () => store.getPresetId())

    ipcMain.handle('md2docx:setPreset', (_e, presetId: Md2DocxPresetId) => {
      if (!isMd2DocxPresetId(presetId)) return
      store.setPresetId(presetId)
    })

    ipcMain.handle('md2docx:listRecent', () => store.listRecent())

    ipcMain.handle('md2docx:pickSource', async () => {
      const result = await dialog.showOpenDialog({
        title: '选择 Markdown 文件',
        properties: ['openFile'],
        filters: [
          { name: 'Markdown', extensions: ['md', 'markdown'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      if (result.canceled || result.filePaths.length === 0) return null
      const filePath = result.filePaths[0]
      if (!isMarkdownPath(filePath)) return null
      return filePath
    })

    ipcMain.handle('md2docx:pickOutput', async (_e, defaultPath: string) => {
      const result = await dialog.showSaveDialog({
        title: '另存为 Word 文档',
        defaultPath,
        filters: [{ name: 'Word 文档', extensions: ['docx'] }]
      })
      if (result.canceled || !result.filePath) return null
      return result.filePath.endsWith('.docx') ? result.filePath : `${result.filePath}.docx`
    })

    ipcMain.handle('md2docx:convert', async (_e, req: Md2DocxConvertRequest) => {
      try {
        if (!req.sourcePath || !isMarkdownPath(req.sourcePath)) {
          return { ok: false, error: '请选择有效的 .md 或 .markdown 文件' }
        }

        const presetId = req.presetId ?? store.getPresetId()
        const out = req.outputPath ?? defaultOutputPath(req.sourcePath)

        await convertMarkdownFile(req.sourcePath, out, presetId)
        store.recordConversion(req.sourcePath)
        return { ok: true, outputPath: out }
      } catch (err) {
        const message = err instanceof Error ? err.message : '转换失败'
        return { ok: false, error: message }
      }
    })

    ipcMain.handle('md2docx:openFile', async (_e, outputPath: string) => {
      await shell.openPath(outputPath)
    })

    ipcMain.handle('md2docx:revealInFolder', (_e, outputPath: string) => {
      shell.showItemInFolder(outputPath)
    })

    this.registered = true
  }

  async deactivate(): Promise<void> {
    // IPC handlers persist for app lifetime
  }
}

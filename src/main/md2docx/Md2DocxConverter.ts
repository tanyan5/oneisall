import fs from 'fs/promises'
import path from 'path'
import type { Options } from '@mohtasham/md-to-docx'
import type { Md2DocxPresetId } from '../../shared/md2docx'
import { getPreset } from './presets'
import { prepareContinuousBody, prepareSections } from './prepareSections'

let mdToDocxModule: Promise<typeof import('@mohtasham/md-to-docx')> | null = null

function loadMdToDocx(): Promise<typeof import('@mohtasham/md-to-docx')> {
  if (!mdToDocxModule) {
    mdToDocxModule = import('@mohtasham/md-to-docx')
  }
  return mdToDocxModule
}

export function defaultOutputPath(sourcePath: string): string {
  const { dir, name } = path.parse(sourcePath)
  return path.join(dir, `${name}.docx`)
}

export async function convertMarkdownFile(
  sourcePath: string,
  outputPath: string,
  presetId: Md2DocxPresetId = 'business-report'
): Promise<void> {
  const rawMd = await fs.readFile(sourcePath, 'utf8')
  const preset = getPreset(presetId)
  const { convertMarkdownToBuffer } = await loadMdToDocx()

  if (preset.layout === 'continuous') {
    const bodyMarkdown = prepareContinuousBody(rawMd)
    const options: Options = {
      documentType: 'document',
      style: preset.style
    }
    const buffer = await convertMarkdownToBuffer(bodyMarkdown, options)
    await fs.writeFile(outputPath, buffer)
    return
  }

  const { tocMarkdown, bodyMarkdown, documentTitle } = prepareSections(rawMd, sourcePath)

  const options: Options = {
    documentType: 'report',
    style: preset.style,
    toc: preset.toc,
    template: preset.template,
    sections: [
      {
        markdown: tocMarkdown,
        footers: { default: null },
        pageNumbering: { display: 'none' },
        type: 'NEXT_PAGE'
      },
      {
        markdown: bodyMarkdown,
        headers: { default: { text: documentTitle, alignment: 'CENTER' } },
        footers: {
          default: {
            text: '— ',
            pageNumberDisplay: 'current',
            alignment: 'CENTER'
          }
        },
        pageNumbering: { start: 1, formatType: 'decimal' }
      }
    ]
  }

  const buffer = await convertMarkdownToBuffer('', options)
  await fs.writeFile(outputPath, buffer)
}

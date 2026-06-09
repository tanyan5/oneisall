export type Md2DocxPresetId = 'business-report' | 'minimal-clean'

export type Md2DocxPresetLayout = 'report-sections' | 'continuous'

export const MD2DOCX_PRESET_IDS: Md2DocxPresetId[] = ['business-report', 'minimal-clean']

export interface Md2DocxRecentEntry {
  sourcePath: string
  convertedAt: number
}

export interface Md2DocxConvertRequest {
  sourcePath: string
  outputPath?: string
  presetId?: Md2DocxPresetId
}

export type Md2DocxConvertResult =
  | { ok: true; outputPath: string }
  | { ok: false; error: string }

export const MD2DOCX_PRESET_LABELS: Record<Md2DocxPresetId, string> = {
  'business-report': '商务汇报',
  'minimal-clean': '极简风'
}

export const MD2DOCX_PRESET_DESCRIPTIONS: Record<Md2DocxPresetId, string> = {
  'business-report': '含目录与页码，适合领导阅读',
  'minimal-clean': '连续排版，无目录页码，清新简洁'
}

export function isMd2DocxPresetId(id: string): id is Md2DocxPresetId {
  return (MD2DOCX_PRESET_IDS as readonly string[]).includes(id)
}

export const MARKDOWN_EXTENSIONS = ['.md', '.markdown'] as const

export function isMarkdownPath(filePath: string): boolean {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
  return (MARKDOWN_EXTENSIONS as readonly string[]).includes(ext)
}

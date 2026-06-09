import type { Options, Style, TocOptions } from '@mohtasham/md-to-docx'
import type { Md2DocxPresetId, Md2DocxPresetLayout } from '../../shared/md2docx'

export interface Md2DocxPreset {
  id: Md2DocxPresetId
  label: string
  layout: Md2DocxPresetLayout
  style: Partial<Style>
  toc?: TocOptions
  template?: Options['template']
}

const BUSINESS_REPORT_STYLE: Partial<Style> = {
  fontFamily: '微软雅黑',
  titleSize: 44,
  heading1Size: 44,
  heading2Size: 32,
  heading3Size: 28,
  paragraphSize: 24,
  listItemSize: 24,
  codeBlockSize: 20,
  blockquoteSize: 24,
  lineSpacing: 1.5,
  paragraphSpacing: 200,
  headingSpacing: 240,
  paragraphAlignment: 'JUSTIFIED',
  heading1Alignment: 'CENTER',
  heading2Alignment: 'LEFT',
  heading3Alignment: 'LEFT',
  tocFontSize: 22,
  tocHeading1FontSize: 26,
  tocHeading2FontSize: 24,
  tocHeading3FontSize: 22,
  tocHeading1Bold: true,
  tocHeading2Bold: true,
  tocHeading3Bold: false
}

const MINIMAL_CLEAN_STYLE: Partial<Style> = {
  fontFamily: '微软雅黑',
  titleSize: 36,
  heading1Size: 36,
  heading2Size: 28,
  heading3Size: 24,
  paragraphSize: 22,
  listItemSize: 22,
  codeBlockSize: 20,
  blockquoteSize: 22,
  lineSpacing: 1.25,
  paragraphSpacing: 120,
  headingSpacing: 180,
  paragraphAlignment: 'LEFT',
  heading1Alignment: 'LEFT',
  heading2Alignment: 'LEFT',
  heading3Alignment: 'LEFT'
}

const BUSINESS_REPORT_TOC: TocOptions = {
  title: '目 录',
  minDepth: 1,
  maxDepth: 3
}

const PRESETS: Record<Md2DocxPresetId, Md2DocxPreset> = {
  'business-report': {
    id: 'business-report',
    label: '商务汇报',
    layout: 'report-sections',
    style: BUSINESS_REPORT_STYLE,
    toc: BUSINESS_REPORT_TOC
  },
  'minimal-clean': {
    id: 'minimal-clean',
    label: '极简风',
    layout: 'continuous',
    style: MINIMAL_CLEAN_STYLE
  }
}

export function getPreset(id: Md2DocxPresetId): Md2DocxPreset {
  return PRESETS[id] ?? PRESETS['business-report']
}

export function listPresets(): Md2DocxPreset[] {
  return Object.values(PRESETS)
}

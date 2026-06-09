import React, { useCallback, useEffect, useState } from 'react'
import type { Md2DocxPresetId, Md2DocxRecentEntry } from '../../../shared/md2docx'
import {
  isMarkdownPath,
  MD2DOCX_PRESET_DESCRIPTIONS,
  MD2DOCX_PRESET_IDS,
  MD2DOCX_PRESET_LABELS
} from '../../../shared/md2docx'
import './md2docx.css'

interface Md2DocxViewProps {
  hideTopBar?: boolean
}

function basename(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] ?? filePath
}

function defaultOutputFor(sourcePath: string): string {
  return sourcePath.replace(/\.(md|markdown)$/i, '.docx')
}

function formatRecentTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function Md2DocxView({ hideTopBar = false }: Md2DocxViewProps): React.ReactElement {
  void hideTopBar
  const [presetId, setPresetId] = useState<Md2DocxPresetId>('business-report')
  const [sourcePath, setSourcePath] = useState<string | null>(null)
  const [outputPath, setOutputPath] = useState<string | null>(null)
  const [recent, setRecent] = useState<Md2DocxRecentEntry[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastOutput, setLastOutput] = useState<string | null>(null)

  const loadRecent = useCallback(async () => {
    const list = await window.toolbox.md2docx.listRecent()
    setRecent(list)
  }, [])

  useEffect(() => {
    void (async () => {
      const preset = await window.toolbox.md2docx.getPreset()
      setPresetId(preset)
      await loadRecent()
    })()
  }, [loadRecent])

  useEffect(() => {
    if (sourcePath) {
      setOutputPath(defaultOutputFor(sourcePath))
      setError(null)
    }
  }, [sourcePath])

  const acceptPath = (path: string): void => {
    if (!isMarkdownPath(path)) {
      setError('仅支持 .md 或 .markdown 文件')
      return
    }
    setSourcePath(path)
    setError(null)
    setLastOutput(null)
  }

  const onPickSource = async (): Promise<void> => {
    const path = await window.toolbox.md2docx.pickSource()
    if (path) acceptPath(path)
  }

  const onPickOutput = async (): Promise<void> => {
    if (!sourcePath) return
    const path = await window.toolbox.md2docx.pickOutput(outputPath ?? defaultOutputFor(sourcePath))
    if (path) setOutputPath(path)
  }

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    try {
      const path = window.toolbox.md2docx.resolveDroppedFile(file)
      acceptPath(path)
    } catch {
      setError('无法读取拖入的文件路径')
    }
  }

  const onConvert = async (): Promise<void> => {
    if (!sourcePath || converting) return
    setConverting(true)
    setError(null)
    setLastOutput(null)

    const result = await window.toolbox.md2docx.convert({
      sourcePath,
      outputPath: outputPath ?? undefined,
      presetId
    })

    setConverting(false)

    if (result.ok) {
      setLastOutput(result.outputPath)
      setOutputPath(result.outputPath)
      await loadRecent()
    } else {
      setError(result.error)
    }
  }

  const onPresetChange = async (e: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    const next = e.target.value as Md2DocxPresetId
    setPresetId(next)
    await window.toolbox.md2docx.setPreset(next)
  }

  return (
    <div className="md2docx-root">
      <div className="md2docx-inner">
        <div className="md2docx-preset-row">
          <label htmlFor="md2docx-preset">样式预设</label>
          <select
            id="md2docx-preset"
            className="md2docx-select"
            value={presetId}
            onChange={(e) => void onPresetChange(e)}
            disabled={converting}
          >
            {MD2DOCX_PRESET_IDS.map((id) => (
              <option key={id} value={id}>
                {MD2DOCX_PRESET_LABELS[id]}（{MD2DOCX_PRESET_DESCRIPTIONS[id]}）
              </option>
            ))}
          </select>
        </div>

        <div
          className={`md2docx-dropzone${dragOver ? ' md2docx-dropzone--active' : ''}${sourcePath ? ' md2docx-dropzone--has-file' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <p className="md2docx-dropzone-title">拖入 Markdown 文件</p>
          <p className="md2docx-dropzone-hint">支持 .md / .markdown</p>
          <button type="button" className="btn secondary" onClick={() => void onPickSource()}>
            选择文件
          </button>
          {sourcePath ? (
            <p className="md2docx-source-path" title={sourcePath}>
              当前：{sourcePath}
            </p>
          ) : null}
        </div>

        {sourcePath ? (
          <div className="md2docx-output-row">
            <span className="md2docx-output-label">输出</span>
            <span className="md2docx-output-path" title={outputPath ?? ''}>
              {outputPath}
            </span>
            <button
              type="button"
              className="btn secondary md2docx-btn-ghost"
              onClick={() => void onPickOutput()}
              disabled={converting}
            >
              另存为…
            </button>
          </div>
        ) : null}

        {error ? <p className="md2docx-error">{error}</p> : null}

        <button
          type="button"
          className="btn primary md2docx-btn-convert"
          disabled={!sourcePath || converting}
          onClick={() => void onConvert()}
        >
          {converting ? '转换中…' : '转换为 Word'}
        </button>

        {lastOutput ? (
          <div className="md2docx-result">
            <p className="md2docx-result-title">转换成功</p>
            <p className="md2docx-result-path" title={lastOutput}>
              {lastOutput}
            </p>
            <div className="md2docx-result-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => void window.toolbox.md2docx.openFile(lastOutput)}
              >
                打开文件
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => void window.toolbox.md2docx.revealInFolder(lastOutput)}
              >
                打开文件夹
              </button>
            </div>
          </div>
        ) : null}

        {recent.length > 0 ? (
          <section className="md2docx-recent">
            <h2 className="md2docx-recent-title">最近转换</h2>
            <ul className="md2docx-recent-list">
              {recent.map((entry) => (
                <li key={entry.sourcePath}>
                  <button
                    type="button"
                    className="md2docx-recent-item"
                    onClick={() => acceptPath(entry.sourcePath)}
                    title={entry.sourcePath}
                  >
                    <span className="md2docx-recent-name">{basename(entry.sourcePath)}</span>
                    <span className="md2docx-recent-time">{formatRecentTime(entry.convertedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}

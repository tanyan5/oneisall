import React, { useCallback, useEffect, useState } from 'react'
import type { LauncherRecentRow, LauncherRowItem } from '../../shared/shankai'
import type { AnnouncementItem, PromoItem } from '../../shared/home'
import type { PinnedSearchKeyword } from '../../shared/types'
import { RECOMMENDED_TOOL_IDS } from '../../shared/recommendedTools'
import { formatShortcutDisplay } from '../../shared/shortcuts'
import { DEFAULT_SHORTCUTS } from '../../shared/shortcuts'
import { LazyIcon } from '../components/LazyIcon'
import { getCachedToolIcon, getLauncherAppIcon, getLauncherToolIcon } from '../components/toolIconCache'
import './home-hub.css'

interface HomeHubPanelProps {
  searchItems: LauncherRowItem[]
  onSelectTool: (id: string) => void
  onOpenApp: (id: string) => void
}

export function HomeHubPanel({
  searchItems,
  onSelectTool,
  onOpenApp
}: HomeHubPanelProps): React.ReactElement {
  const [recent, setRecent] = useState<LauncherRecentRow[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [promo, setPromo] = useState<PromoItem | null>(null)
  const [pinnedKeywords, setPinnedKeywords] = useState<PinnedSearchKeyword[]>([])
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS)

  const load = useCallback(async () => {
    const [recentList, ann, promoItem, settings] = await Promise.all([
      window.toolbox.home.getRecent(),
      window.toolbox.home.getAnnouncements(),
      window.toolbox.home.getPromo(),
      window.toolbox.settings.get()
    ])
    setRecent(recentList)
    setAnnouncements(ann)
    setPromo(promoItem)
    setPinnedKeywords(settings.pinnedSearchKeywords)
    setShortcuts(settings.shortcuts)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const recommended = searchItems.filter(
    (item) => item.kind === 'tool' && RECOMMENDED_TOOL_IDS.includes(item.id as (typeof RECOMMENDED_TOOL_IDS)[number])
  )

  const dismissAnnouncement = async (id: string): Promise<void> => {
    const next = await window.toolbox.home.dismissAnnouncement(id)
    setAnnouncements(next)
  }

  const dismissPromo = async (id: string): Promise<void> => {
    await window.toolbox.home.dismissPromo(id)
    setPromo(null)
  }

  return (
    <div className="home-hub-panel window-no-drag">
      <div className="home-hub-grid">
        {announcements.map((ann) => (
          <section key={ann.id} className="home-hub-card home-hub-card-featured">
            <div className="home-hub-card-head">
              <h3 className="home-hub-card-title">公告</h3>
              <button type="button" className="home-hub-dismiss" onClick={() => void dismissAnnouncement(ann.id)}>
                不再显示
              </button>
            </div>
            <p className="home-hub-card-name">{ann.title}</p>
            <p className="home-hub-card-desc">{ann.summary}</p>
            {ann.linkUrl && (
              <button
                type="button"
                className="home-hub-link-btn"
                onClick={() => void window.toolbox.shell.openExternal(ann.linkUrl!)}
              >
                查看
              </button>
            )}
          </section>
        ))}

        {promo && (
          <section className="home-hub-card home-hub-card-promo">
            <div className="home-hub-card-head">
              <span className="home-hub-promo-label">{promo.kind === 'welfare' ? '公益' : '合作'}</span>
              {promo.dismissible !== false && (
                <button type="button" className="home-hub-dismiss" onClick={() => void dismissPromo(promo.id)}>
                  本周不再显示
                </button>
              )}
            </div>
            <p className="home-hub-card-name">{promo.title}</p>
            <p className="home-hub-card-desc">{promo.summary}</p>
            {promo.linkUrl && (
              <button
                type="button"
                className="home-hub-link-btn"
                onClick={() => void window.toolbox.shell.openExternal(promo.linkUrl!)}
              >
                了解更多
              </button>
            )}
          </section>
        )}

        {recent.length > 0 && (
          <section className="home-hub-card">
            <h3 className="home-hub-card-title">近期常用</h3>
            <ul className="home-hub-list">
              {recent.map((item) => (
                <li key={`${item.kind}:${item.id}`}>
                  <button
                    type="button"
                    className="home-hub-list-btn"
                    onClick={() =>
                      item.kind === 'app' ? void onOpenApp(item.id) : onSelectTool(item.id)
                    }
                  >
                    <LazyIcon
                      iconKey={`${item.kind}:${item.id}`}
                      className="home-hub-list-icon"
                      size={18}
                      fallbackLetter={item.name[0] ?? '?'}
                      load={() =>
                        item.kind === 'app'
                          ? getLauncherAppIcon(item.targetPath ?? '')
                          : getCachedToolIcon(item.id)
                      }
                    />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recommended.length > 0 && (
          <section className="home-hub-card">
            <h3 className="home-hub-card-title">推荐试试</h3>
            <ul className="home-hub-list">
              {recommended.map((item) => (
                <li key={item.id}>
                  <button type="button" className="home-hub-list-btn" onClick={() => onSelectTool(item.id)}>
                    <LazyIcon
                      iconKey={item.id}
                      className="home-hub-list-icon"
                      size={18}
                      fallbackLetter={item.name[0] ?? '?'}
                      load={() => getLauncherToolIcon(item.id)}
                    />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="home-hub-card home-hub-card-muted">
          <h3 className="home-hub-card-title">固定关键字</h3>
          {pinnedKeywords.length > 0 ? (
            <div className="home-hub-chips">
              {pinnedKeywords.map((kw) => (
                <span key={`${kw.toolId}:${kw.keywordId}`} className="home-hub-chip">
                  {kw.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="home-hub-card-desc">选中左侧插件后，可在详情中固定关键字到快捷框</p>
          )}
        </section>

        <section className="home-hub-card home-hub-card-muted home-hub-hints">
          <h3 className="home-hub-card-title">快捷提示</h3>
          <p className="home-hub-hint-line">{formatShortcutDisplay(shortcuts.openLauncher)} → 快捷框</p>
          <p className="home-hub-hint-line">{formatShortcutDisplay(shortcuts.openClipboard)} → 剪贴板</p>
          <p className="home-hub-hint-line">Ctrl+D → 定住窗口</p>
          <p className="home-hub-hint-line">水母按钮 → 管理中心</p>
          <p className="home-hub-hint-line">Esc → 返回快捷框</p>
        </section>
      </div>
    </div>
  )
}

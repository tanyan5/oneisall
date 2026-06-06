export interface AnnouncementItem {
  id: string
  title: string
  summary: string
  linkUrl?: string
  publishedAt?: string
  expiresAt?: string
}

export interface PromoItem {
  id: string
  kind: 'welfare' | 'partnership'
  title: string
  summary: string
  imageUrl?: string
  linkUrl?: string
  expiresAt?: string
  dismissible?: boolean
}

export interface HomeSearchCatalog {
  items: import('./shankai').LauncherRowItem[]
  count: number
}

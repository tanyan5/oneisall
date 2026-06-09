let dismissedUnpinnedToolId: string | null = null

export function setDismissedUnpinnedToolId(id: string): void {
  dismissedUnpinnedToolId = id
}

export function consumeDismissedUnpinnedToolId(): string | null {
  const id = dismissedUnpinnedToolId
  dismissedUnpinnedToolId = null
  return id
}

export function clearDismissedUnpinnedToolSession(): void {
  dismissedUnpinnedToolId = null
}

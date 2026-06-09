import {
  consumeDismissedUnpinnedToolId,
  setDismissedUnpinnedToolId
} from '../navigation/DismissedToolSession'
import {
  getHubToolId,
  getHubWindow,
  hideHubWindow,
  isHubVisibleWithUnpinnedPlugin,
  openToolInHub
} from '../window'
import { getLauncherWindow, toggleLauncher } from './LauncherWindow'

export function handleOpenLauncherShortcut(): string | null {
  const launcherWin = getLauncherWindow()
  const launcherVisible = launcherWin?.isVisible() ?? false
  const hub = getHubWindow()
  const hubVisible = Boolean(hub && !hub.isDestroyed() && hub.isVisible())

  if (!hubVisible && !launcherVisible) {
    const restoreId = consumeDismissedUnpinnedToolId()
    if (restoreId) {
      openToolInHub(restoreId)
      return restoreId
    }
  }

  if (isHubVisibleWithUnpinnedPlugin()) {
    setDismissedUnpinnedToolId(getHubToolId())
    hideHubWindow()
    return null
  }

  toggleLauncher()
  return null
}

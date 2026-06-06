const toolIconCache = new Map<string, Promise<string | null>>()
const appIconCache = new Map<string, Promise<string | null>>()

export function getCachedToolIcon(toolId: string): Promise<string | null> {
  let pending = toolIconCache.get(toolId)
  if (!pending) {
    pending = window.toolbox.tools.getIcon(toolId)
    toolIconCache.set(toolId, pending)
  }
  return pending
}

export function getCachedAppIcon(targetPath: string): Promise<string | null> {
  let pending = appIconCache.get(targetPath)
  if (!pending) {
    pending = window.toolbox.shankai.getIcon(targetPath)
    appIconCache.set(targetPath, pending)
  }
  return pending
}

export function getLauncherToolIcon(toolId: string): Promise<string | null> {
  if (typeof window.launcher !== 'undefined') {
    let pending = toolIconCache.get(`launcher:${toolId}`)
    if (!pending) {
      pending = window.launcher.getToolIcon(toolId)
      toolIconCache.set(`launcher:${toolId}`, pending)
    }
    return pending
  }
  return getCachedToolIcon(toolId)
}

export function getLauncherAppIcon(targetPath: string): Promise<string | null> {
  if (typeof window.launcher !== 'undefined') {
    let pending = appIconCache.get(`launcher:${targetPath}`)
    if (!pending) {
      pending = window.launcher.getAppIcon(targetPath)
      appIconCache.set(`launcher:${targetPath}`, pending)
    }
    return pending
  }
  return getCachedAppIcon(targetPath)
}

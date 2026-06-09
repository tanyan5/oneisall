import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const DEV_USER_DATA_DIR = 'OneIsAll-dev'
const PROD_USER_DATA_DIR = 'OneIsAll'

/** Call before app.ready so dev builds never share production user data. */
export function configureAppPaths(): void {
  const dir = app.isPackaged ? PROD_USER_DATA_DIR : DEV_USER_DATA_DIR
  app.setPath('userData', path.join(app.getPath('appData'), dir))
}

/** Ordered directories to search for shipped static resources. */
export function resourceSearchBases(): string[] {
  if (app.isPackaged) {
    return [process.resourcesPath, path.join(app.getAppPath(), 'resources'), app.getAppPath()]
  }
  return [path.join(process.cwd(), 'resources'), path.join(app.getAppPath(), 'resources')]
}

export function resolveResource(...segments: string[]): string | null {
  for (const base of resourceSearchBases()) {
    const candidate = path.join(base, ...segments)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

export function getBuiltinPluginDirs(): string[] {
  const dirs: string[] = []
  if (app.isPackaged) {
    const fromResources = path.join(process.resourcesPath, 'plugins')
    const fromAsar = path.join(app.getAppPath(), 'plugins')
    if (fs.existsSync(fromResources)) dirs.push(fromResources)
    if (fs.existsSync(fromAsar)) dirs.push(fromAsar)
  } else {
    const devPlugins = path.join(process.cwd(), 'plugins')
    if (fs.existsSync(devPlugins)) dirs.push(devPlugins)
  }
  return dirs
}

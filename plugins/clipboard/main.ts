import type { IToolPlugin, PluginHostContext } from '../../src/main/plugin/types'

export class ClipboardPlugin implements IToolPlugin {
  id = 'clipboard'

  async activate(host: PluginHostContext): Promise<void> {
    host.clipboardWatcher.start()
  }

  async deactivate(): Promise<void> {
    // watcher stopped globally on app quit
  }
}

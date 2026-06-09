import { useCallback, useEffect, useState } from 'react'

export interface WindowPinState {
  pinned: boolean
  alwaysOnTop: boolean
  maximized: boolean
}

export function useWindowPin(): {
  pinState: WindowPinState
  togglePin: () => Promise<void>
  syncPinState: () => Promise<void>
  applyPinState: (state: WindowPinState) => void
  setAlwaysOnTop: (flag: boolean) => Promise<void>
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
} {
  const [pinState, setPinState] = useState<WindowPinState>({
    pinned: false,
    alwaysOnTop: false,
    maximized: false
  })

  const refresh = useCallback(async () => {
    if (!window.toolbox?.window?.getPinState) return
    const state = await window.toolbox.window.getPinState()
    setPinState(state)
  }, [])

  useEffect(() => {
    void refresh()
    if (!window.toolbox?.window?.onPinStateChanged) return
    return window.toolbox.window.onPinStateChanged((state) => setPinState(state))
  }, [refresh])

  const applyPinState = useCallback((state: WindowPinState) => {
    setPinState(state)
  }, [])

  const syncPinState = useCallback(async () => {
    await refresh()
  }, [refresh])

  const togglePin = useCallback(async () => {
    if (!window.toolbox?.window?.togglePin) return
    await window.toolbox.window.togglePin()
    await refresh()
  }, [refresh])

  return {
    pinState,
    togglePin,
    syncPinState,
    applyPinState,
    setAlwaysOnTop: (flag) => window.toolbox.window.setAlwaysOnTop(flag),
    minimize: () => window.toolbox.window.minimize(),
    maximize: () => window.toolbox.window.maximize(),
    close: () => window.toolbox.window.close()
  }
}

import { useEffect, useState } from 'react'
import { ToolboxShell } from './shell/ToolboxShell'

export default function App(): React.ReactElement {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.toolbox) setReady(true)
  }, [])

  if (!ready) {
    return <div className="loading">正在加载…</div>
  }

  return <ToolboxShell />
}

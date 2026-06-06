import React from 'react'

export function DemoView(): React.ReactElement {
  return (
    <div className="demo-view">
      <header className="view-header window-drag">
        <h1>示例工具</h1>
      </header>
      <p className="demo-text">
        这是一个占位插件，用于验证插件化框架。在 <code>plugins/</code> 下新增目录与{' '}
        <code>plugin.json</code> 即可注册新工具。
      </p>
    </div>
  )
}

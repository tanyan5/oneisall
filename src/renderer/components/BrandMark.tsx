import React from 'react'
import './brand-mark.css'

export type BrandMarkBreathe = 'off' | 'subtle' | 'normal'

export interface BrandMarkProps {
  size?: number
  breathe?: BrandMarkBreathe
  showCore?: boolean
  className?: string
}

export function BrandMark({
  size = 22,
  breathe = 'off',
  showCore,
  className = ''
}: BrandMarkProps): React.ReactElement {
  const core = showCore ?? size >= 20
  const breatheClass = breathe === 'off' ? '' : ` brand-mark--breathe-${breathe}`

  return (
    <span
      className={`brand-mark${breatheClass}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {breathe !== 'off' && <span className="brand-mark__glow" />}
      <svg className="brand-mark__svg" viewBox="0 0 32 32" width={size} height={size}>
        <circle className="brand-mark__ring" cx="16" cy="16" r="11" />
        {core && <circle className="brand-mark__core" cx="16" cy="16" r="1.2" />}
      </svg>
    </span>
  )
}

import React, { useEffect, useState } from 'react'

interface LazyIconProps {
  iconKey: string
  load: () => Promise<string | null>
  fallbackLetter?: string
  className?: string
  size?: number
}

export function LazyIcon({
  iconKey,
  load,
  fallbackLetter = '?',
  className = '',
  size = 24
}: LazyIconProps): React.ReactElement {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setSrc(null)
    void Promise.resolve()
      .then(() => load())
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setSrc(null)
      })
    return () => {
      cancelled = true
    }
  }, [iconKey])

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={className}
        width={size}
        height={size}
        draggable={false}
      />
    )
  }

  return (
    <span
      className={`icon-fallback ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
      aria-hidden
    >
      {fallbackLetter}
    </span>
  )
}

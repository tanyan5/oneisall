import React from 'react'
import { BrandMark, type BrandMarkBreathe } from './BrandMark'
import './brand-mark.css'

interface BrandHomeButtonProps {
  onClick: () => void
  size?: number
  breathe?: BrandMarkBreathe
}

export function BrandHomeButton({
  onClick,
  size = 22,
  breathe = 'normal'
}: BrandHomeButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className="brand-home-btn"
      title="打开管理中心"
      aria-label="打开管理中心"
      onClick={onClick}
    >
      <BrandMark size={size} breathe={breathe} />
    </button>
  )
}

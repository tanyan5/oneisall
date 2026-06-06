import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export function PinTopIcon({ className, size = 14 }: IconProps): React.ReactElement {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 4h6l1 6H8l1-6z" />
      <path d="M12 10v9" />
      <path d="M8 21h8" />
    </svg>
  )
}

export function MinimizeIcon({ className, size = 12 }: IconProps): React.ReactElement {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function MaximizeIcon({ className, size = 11 }: IconProps): React.ReactElement {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="5" y="5" width="14" height="14" rx="1" />
    </svg>
  )
}

export function RestoreIcon({ className, size = 11 }: IconProps): React.ReactElement {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="7" y="3" width="12" height="12" rx="1" />
      <rect x="3" y="7" width="12" height="12" rx="1" />
    </svg>
  )
}

export function CloseIcon({ className, size = 12 }: IconProps): React.ReactElement {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

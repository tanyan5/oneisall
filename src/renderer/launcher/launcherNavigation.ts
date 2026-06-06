export type NavDirection = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'

export type NavSection = 'recent' | 'recommend' | 'primary' | 'secondary'

function rowItemCount(row: number, length: number, cols: number): number {
  return Math.min(cols, length - row * cols)
}

function moveRecentGrid(
  direction: NavDirection,
  index: number,
  length: number,
  cols: number
): number {
  const row = Math.floor(index / cols)
  const col = index % cols

  switch (direction) {
    case 'ArrowLeft':
      return col > 0 ? index - 1 : index
    case 'ArrowRight': {
      const count = rowItemCount(row, length, cols)
      return col < count - 1 ? index + 1 : index
    }
    case 'ArrowUp': {
      if (row === 0) return index
      const next = (row - 1) * cols + col
      return next < length ? next : index
    }
    case 'ArrowDown': {
      const next = (row + 1) * cols + col
      return next < length ? next : index
    }
    default:
      return index
  }
}

function moveLinear(direction: NavDirection, index: number, length: number): number {
  switch (direction) {
    case 'ArrowLeft':
    case 'ArrowUp':
      return Math.max(0, index - 1)
    case 'ArrowRight':
    case 'ArrowDown':
      return Math.min(length - 1, index + 1)
    default:
      return index
  }
}

export function moveHighlight(
  direction: NavDirection,
  index: number,
  length: number,
  section: NavSection,
  cols: number
): number {
  if (length <= 0) return 0
  const safe = Math.max(0, Math.min(index, length - 1))
  if (section === 'recent') {
    return moveRecentGrid(direction, safe, length, cols)
  }
  return moveLinear(direction, safe, length)
}

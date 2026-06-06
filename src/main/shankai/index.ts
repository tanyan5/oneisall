import { ShankaiStore } from './ShankaiStore'

let store: ShankaiStore | null = null

export function getShankaiStore(): ShankaiStore {
  if (!store) {
    store = new ShankaiStore()
  }
  return store
}

export function initShankaiStore(): ShankaiStore {
  store = new ShankaiStore()
  return store
}

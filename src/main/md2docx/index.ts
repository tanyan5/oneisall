import { Md2DocxStore } from './Md2DocxStore'

let store: Md2DocxStore | null = null

export function getMd2DocxStore(): Md2DocxStore {
  if (!store) {
    store = new Md2DocxStore()
  }
  return store
}

export function initMd2DocxStore(): Md2DocxStore {
  store = new Md2DocxStore()
  return store
}

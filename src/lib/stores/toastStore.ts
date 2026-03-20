import { writable } from 'svelte/store'
import type { Toast, ToastType } from '../types'

const { subscribe, update } = writable<Toast[]>([])

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function push(message: string, type: ToastType = 'info', duration = 2400) {
  const id = createId()
  update((current) => [...current, { id, message, type }])
  if (typeof window !== 'undefined') {
    window.setTimeout(() => dismiss(id), duration)
  }
  return id
}

function dismiss(id: string) {
  update((current) => current.filter((toast) => toast.id !== id))
}

export const toastStore = {
  subscribe,
  push,
  dismiss,
}

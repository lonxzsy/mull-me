import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function formatDate(timestamp: number | string): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(timestamp: number): string {
  const diff = timestamp - Date.now()
  if (diff <= 0) return 'Expired'
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h ${minutes % 60}m left`
  return `${minutes}m left`
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    navigator.clipboard.writeText(text).then(() => resolve(true)).catch(() => {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        resolve(true)
      } catch {
        resolve(false)
      } finally {
        document.body.removeChild(textarea)
      }
    })
  })
}

export function parseEmailAddress(address: string): { login: string; domain: string } | null {
  const match = address.match(/^([^@]+)@(.+)$/)
  if (!match) return null
  return { login: match[1], domain: match[2] }
}

export function isValidEmailLogin(login: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(login) && login.length >= 1 && login.length <= 64
}

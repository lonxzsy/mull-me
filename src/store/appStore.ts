import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EmailAddress, EmailMessage, ProviderStatus, ViewMode } from '../types'
import { getDefaultProvider, getProviderById, providers } from '../providers'

function debug(...args: unknown[]) {
  if (import.meta.env.DEV) console.log('[STORE]', ...args)
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface AppState {
  address: EmailAddress | null
  providerId: string
  messages: EmailMessage[]
  selectedMessageId: string | null
  loading: boolean
  error: string | null
  polling: boolean
  autoRefresh: boolean
  blockRemoteImages: boolean
  viewMode: ViewMode
  providerStatuses: ProviderStatus[]
  lastChecked: number
  generatedHistory: EmailAddress[]
  theme: 'light' | 'dark'
  toasts: Toast[]
  searchQuery: string
  sortOrder: 'newest' | 'oldest' | 'sender' | 'subject'

  setProvider: (id: string) => void
  generateMailbox: (options?: { login?: string; domain?: string; lifetimeMinutes?: number }) => Promise<void>
  refreshMessages: () => Promise<void>
  selectMessage: (id: string | null) => void
  loadMessage: (id: string) => Promise<void>
  deleteMailbox: () => void
  togglePolling: () => void
  toggleAutoRefresh: () => void
  toggleBlockRemoteImages: () => void
  setViewMode: (mode: ViewMode) => void
  checkProviders: () => Promise<void>
  addToHistory: (address: EmailAddress) => void
  clearHistory: () => void
  restoreMailbox: (address: EmailAddress) => void
  clearError: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setSearchQuery: (query: string) => void
  setSortOrder: (order: 'newest' | 'oldest' | 'sender' | 'subject') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      address: null,
      providerId: getDefaultProvider().id,
      messages: [],
      selectedMessageId: null,
      loading: false,
      error: null,
      polling: true,
      autoRefresh: true,
      blockRemoteImages: true,
      viewMode: 'html',
      providerStatuses: [],
      lastChecked: 0,
      generatedHistory: [],
      theme: 'dark',
      toasts: [],
      searchQuery: '',
      sortOrder: 'newest',

      setProvider: (id) => {
        const provider = getProviderById(id)
        if (provider) {
          set({ providerId: id, address: null, messages: [], selectedMessageId: null, error: null })
        }
      },

      generateMailbox: async (options) => {
        const provider = getProviderById(get().providerId) || getDefaultProvider()
        debug('generateMailbox: provider =', provider.id, 'options =', options)
        set({ loading: true, error: null })
        try {
          const address = await provider.generateMailbox({
            login: options?.login,
            domain: options?.domain,
            lifetimeMinutes: options?.lifetimeMinutes || provider.defaultLifetimeMinutes,
          })
          debug('generateMailbox: success, address =', address.address)
          set({ address, messages: [], selectedMessageId: null, loading: false })
          get().addToHistory(address)
          get().addToast({ type: 'success', message: `Mailbox created: ${address.address}` })
          await get().refreshMessages()
        } catch (err) {
          debug('generateMailbox: FAILED -', err instanceof Error ? err.message : err)
          const msg = err instanceof Error ? err.message : 'Failed to generate mailbox'
          set({ error: msg, loading: false })
          get().addToast({ type: 'error', message: msg })
        }
      },

      refreshMessages: async () => {
        const { address, messages: oldMessages } = get()
        if (!address) return
        const provider = getProviderById(address.providerId)
        if (!provider) return
        debug('refreshMessages: provider =', provider.id, 'address =', address.address)
        try {
          const messages = await provider.getMessages(address)
          debug('refreshMessages: got', messages.length, 'messages')
          const existing = get().messages
          const merged = messages.map((msg) => {
            const old = existing.find((e) => e.id === msg.id)
            if (old) {
              return { ...msg, body: msg.body || old.body, attachments: msg.attachments || old.attachments }
            }
            return msg
          })
          for (const existingMsg of existing) {
            if (!merged.find((m) => m.id === existingMsg.id)) merged.push(existingMsg)
          }
          merged.sort((a, b) => b.timestamp - a.timestamp)

          const prevIds = new Set(oldMessages.map((m) => m.id))
          const newMessages = messages.filter((m) => !prevIds.has(m.id))
          if (newMessages.length > 0) {
            get().addToast({ type: 'info', message: `${newMessages.length} new email${newMessages.length > 1 ? 's' : ''} received` })
            if ('Notification' in window && Notification.permission === 'granted') {
              for (const msg of newMessages.slice(0, 3)) {
                new Notification('Mull Me', {
                  body: `${msg.from}: ${msg.subject}`,
                  icon: '/favicon.svg',
                })
              }
            }
          }

          set({ messages: merged, lastChecked: Date.now() })
        } catch (err) {
          debug('refreshMessages: FAILED -', err instanceof Error ? err.message : err)
          set({ error: err instanceof Error ? err.message : 'Failed to refresh messages' })
        }
      },

      selectMessage: (id) => {
        set({ selectedMessageId: id })
        if (id) get().loadMessage(id)
      },

      loadMessage: async (id) => {
        const { address, messages } = get()
        if (!address) return
        const provider = getProviderById(address.providerId)
        if (!provider) return
        const existing = messages.find((m) => m.id === id)
        if (existing?.body?.html || existing?.body?.text) {
          debug('loadMessage: already loaded, skip')
          return
        }
        debug('loadMessage: loading message', id, 'from', provider.id)
        try {
          const message = await provider.getMessage(address, id)
          debug('loadMessage: success')
          set({
            messages: messages.map((m) => (m.id === id ? { ...m, ...message, read: true } : m)),
          })
        } catch (err) {
          debug('loadMessage: FAILED -', err instanceof Error ? err.message : err)
          set({ error: err instanceof Error ? err.message : 'Failed to load message' })
        }
      },

      deleteMailbox: () => {
        set({ address: null, messages: [], selectedMessageId: null, error: null })
        get().addToast({ type: 'info', message: 'Mailbox deleted' })
      },
      togglePolling: () => set((s) => ({ polling: !s.polling })),
      toggleAutoRefresh: () => set((s) => ({ autoRefresh: !s.autoRefresh })),
      toggleBlockRemoteImages: () => set((s) => ({ blockRemoteImages: !s.blockRemoteImages })),
      setViewMode: (mode) => set({ viewMode: mode }),
      clearError: () => set({ error: null }),

      checkProviders: async () => {
        debug('checkProviders: checking all', providers.length, 'providers')
        const statuses = await Promise.all(
          providers.map(async (p) => {
            const start = Date.now()
            try {
              const available = await p.checkAvailability()
              debug('checkProviders:', p.id, available ? 'OK' : 'DOWN', `${Date.now() - start}ms`)
              return { id: p.id, name: p.name, available, latency: Date.now() - start, lastChecked: Date.now() }
            } catch (err) {
              debug('checkProviders:', p.id, 'ERROR -', err instanceof Error ? err.message : err)
              return { id: p.id, name: p.name, available: false, latency: Date.now() - start, error: err instanceof Error ? err.message : 'Unknown error', lastChecked: Date.now() }
            }
          })
        )
        set({ providerStatuses: statuses })
      },

      addToHistory: (address) => {
        set((s) => ({
          generatedHistory: [address, ...s.generatedHistory.filter((a) => a.address !== address.address)].slice(0, 10),
        }))
      },

      clearHistory: () => set({ generatedHistory: [] }),

      restoreMailbox: (address) => {
        set({ address, messages: [], selectedMessageId: null, error: null })
        get().addToast({ type: 'info', message: `Restored: ${address.address}` })
      },

      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(next)
      },

      addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9)
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
        const duration = toast.duration ?? 4000
        setTimeout(() => get().removeToast(id), duration)
      },

      removeToast: (id) => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortOrder: (order) => set({ sortOrder: order }),
    }),
    {
      name: 'mull-me-storage',
      partialize: (state) => ({
        address: state.address,
        providerId: state.providerId,
        autoRefresh: state.autoRefresh,
        blockRemoteImages: state.blockRemoteImages,
        viewMode: state.viewMode,
        generatedHistory: state.generatedHistory,
        theme: state.theme,
      }),
    }
  )
)

export function getSelectedMessage(store: { address: EmailAddress | null; messages: EmailMessage[]; selectedMessageId: string | null }): EmailMessage | null {
  if (!store.selectedMessageId) return null
  return store.messages.find((m) => m.id === store.selectedMessageId) || null
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EmailAddress, EmailMessage, ProviderStatus, ViewMode } from '../types'
import { getDefaultProvider, getProviderById, providers } from '../providers'

function debug(...args: unknown[]) {
  if (import.meta.env.DEV) console.log('[STORE]', ...args)
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
          await get().refreshMessages()
        } catch (err) {
          debug('generateMailbox: FAILED -', err instanceof Error ? err.message : err)
          set({ error: err instanceof Error ? err.message : 'Failed to generate mailbox', loading: false })
        }
      },

      refreshMessages: async () => {
        const { address } = get()
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

      deleteMailbox: () => set({ address: null, messages: [], selectedMessageId: null, error: null }),
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
      },
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
      }),
    }
  )
)

export function getSelectedMessage(store: { address: EmailAddress | null; messages: EmailMessage[]; selectedMessageId: string | null }): EmailMessage | null {
  if (!store.selectedMessageId) return null
  return store.messages.find((m) => m.id === store.selectedMessageId) || null
}

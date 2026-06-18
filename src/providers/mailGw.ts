import type { EmailAddress, EmailMessage, GenerateOptions, TempMailProvider } from '../types'
import { smartAxiosGet, smartAxiosPost, generatePassword, generateRandomLogin } from './base'

const BASE_URL = 'https://api.mail.gw'
const MAX_LIFETIME = 10

interface DomainItem {
  domain: string
}

interface MessageItem {
  id: string
  from: { address: string; name: string }
  to: Array<{ address: string }>
  subject: string
  createdAt: string
  intro: string
  seen: boolean
}

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'hydra:member' in data) {
    return (data as { 'hydra:member': T[] })['hydra:member'] || []
  }
  return []
}

export class MailGwProvider implements TempMailProvider {
  id = 'mailgw'
  name = 'Mail.gw'
  description = '10-minute mail with JWT authentication.'
  icon = 'Clock'
  maxLifetimeMinutes = MAX_LIFETIME
  defaultLifetimeMinutes = 10
  supportsCustomAddress = true
  supportsAttachments = false
  requiresProxy = false
  apiDocsUrl = 'https://api.mail.gw/'

  private async getDomains(): Promise<string[]> {
    const data = await smartAxiosGet(BASE_URL, '/domains')
    return extractArray<DomainItem>(data).map((d) => d.domain)
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const domains = await this.getDomains()
      return domains.length > 0
    } catch {
      return false
    }
  }

  async generateMailbox(options?: GenerateOptions): Promise<EmailAddress> {
    const domains = await this.getDomains()
    const domain = options?.domain || domains[0]
    if (!domain) throw new Error('No available domains')

    const login = options?.login || generateRandomLogin(10)
    const address = `${login}@${domain}`
    const password = generatePassword(16)

    const accountRes = await smartAxiosPost<{ id: string }>(BASE_URL, '/accounts', { address, password })
    const accountId = accountRes?.id
    if (!accountId) throw new Error('Failed to create account')

    const tokenRes = await smartAxiosPost<{ token: string }>(BASE_URL, '/token', { address, password })
    const token = tokenRes?.token
    if (!token) throw new Error('Failed to get token')

    const lifetimeMs = (options?.lifetimeMinutes || this.defaultLifetimeMinutes) * 60 * 1000
    const now = Date.now()

    return {
      id: `${this.id}-${accountId}`,
      address,
      login,
      domain,
      providerId: this.id,
      createdAt: now,
      expiresAt: now + lifetimeMs,
      token,
      password,
      accountId,
    }
  }

  async getMessages(address: EmailAddress): Promise<EmailMessage[]> {
    if (!address.token) throw new Error('Token missing')
    const data = await smartAxiosGet(BASE_URL, '/messages', { Authorization: `Bearer ${address.token}` })

    return extractArray<MessageItem>(data).map((msg) => ({
      id: msg.id,
      from: msg.from ? `${msg.from.name || ''} <${msg.from.address}>`.trim() : 'Unknown',
      to: msg.to?.[0]?.address || address.address,
      subject: msg.subject || '(No subject)',
      date: new Date(msg.createdAt).toLocaleString(),
      timestamp: new Date(msg.createdAt).getTime(),
      read: msg.seen,
      excerpt: msg.intro,
      providerId: this.id,
    }))
  }

  async getMessage(address: EmailAddress, messageId: string): Promise<EmailMessage> {
    if (!address.token) throw new Error('Token missing')
    const data = await smartAxiosGet<{
      id: string
      from: { address: string; name: string }
      to: Array<{ address: string }>
      subject: string
      createdAt: string
      html: string | string[]
      text: string
    }>(BASE_URL, `/messages/${messageId}`, { Authorization: `Bearer ${address.token}` })

    const htmlRaw = data?.html
    const html = Array.isArray(htmlRaw) ? htmlRaw.join('') : (htmlRaw || '')
    const text = data?.text || ''

    return {
      id: messageId,
      from: data?.from ? `${data.from.name || ''} <${data.from.address}>`.trim() : 'Unknown',
      to: data?.to?.[0]?.address || address.address,
      subject: data?.subject || '(No subject)',
      date: data?.createdAt ? new Date(data.createdAt).toLocaleString() : '',
      timestamp: data?.createdAt ? new Date(data.createdAt).getTime() : 0,
      read: true,
      body: {
        html,
        text,
        raw: html || text,
      },
      providerId: this.id,
    }
  }
}

import type { EmailAddress, EmailMessage, GenerateOptions, TempMailProvider } from '../types'
import { smartFetchJson, generateRandomLogin } from './base'

const BASE_URL = 'https://api.guerrillamail.com/ajax.php'
const MAX_LIFETIME = 60

interface GuerrillaSession {
  sessionId: string
  emailAddr: string
  emailTimestamp: number
}

export class GuerrillaMailProvider implements TempMailProvider {
  id = 'guerrillamail'
  name = 'Guerrilla Mail'
  description = 'Established temporary email provider with session-based API.'
  icon = 'Shield'
  maxLifetimeMinutes = MAX_LIFETIME
  defaultLifetimeMinutes = 60
  supportsCustomAddress = true
  supportsAttachments = false
  requiresProxy = true
  apiDocsUrl = 'https://www.guerrillamail.com/GuerrillaMailAPI.html'

  private sessions: Map<string, GuerrillaSession> = new Map()

  private async apiCall<T>(params: string): Promise<T> {
    const ip = '127.0.0.1'
    const agent = encodeURIComponent(navigator.userAgent)
    const url = `${BASE_URL}?${params}&ip=${ip}&agent=${agent}`
    return smartFetchJson<T>(url)
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const res = await this.apiCall<{ email_addr: string }>('f=get_email_address')
      return !!res.email_addr
    } catch {
      return false
    }
  }

  async generateMailbox(options?: GenerateOptions): Promise<EmailAddress> {
    let session: GuerrillaSession

    if (options?.login && options?.domain) {
      const emailUser = options.login
      const res = await this.apiCall<{
        email_addr: string
        email_timestamp: number
      }>(`f=set_email_user&email_user=${encodeURIComponent(emailUser)}`)
      session = {
        sessionId: generateRandomLogin(16),
        emailAddr: res.email_addr,
        emailTimestamp: res.email_timestamp,
      }
    } else {
      const res = await this.apiCall<{
        email_addr: string
        email_timestamp: number
      }>('f=get_email_address')
      session = {
        sessionId: generateRandomLogin(16),
        emailAddr: res.email_addr,
        emailTimestamp: res.email_timestamp,
      }
    }

    const parsed = session.emailAddr.split('@')
    if (parsed.length !== 2) throw new Error('Failed to generate mailbox')

    const lifetimeMs = (options?.lifetimeMinutes || this.defaultLifetimeMinutes) * 60 * 1000
    const now = Date.now()
    const id = `${this.id}-${generateRandomLogin(8)}`
    this.sessions.set(id, session)

    return {
      id,
      address: session.emailAddr,
      login: parsed[0],
      domain: parsed[1],
      providerId: this.id,
      createdAt: now,
      expiresAt: now + lifetimeMs,
    }
  }

  async getMessages(address: EmailAddress): Promise<EmailMessage[]> {
    const session = this.sessions.get(address.id)
    if (!session) throw new Error('Session not found')

    const res = await this.apiCall<{
      list: Array<{
        mail_id: string
        mail_from: string
        mail_subject: string
        mail_timestamp: number
        mail_excerpt: string
        mail_read: number
        mail_date: string
      }>
    }>('f=check_email&seq=0')

    return (Array.isArray(res.list) ? res.list : []).map((msg) => ({
      id: msg.mail_id,
      from: msg.mail_from,
      to: address.address,
      subject: msg.mail_subject || '(No subject)',
      date: msg.mail_date,
      timestamp: msg.mail_timestamp * 1000,
      read: msg.mail_read === 1,
      excerpt: msg.mail_excerpt,
      providerId: this.id,
    }))
  }

  async getMessage(address: EmailAddress, messageId: string): Promise<EmailMessage> {
    const session = this.sessions.get(address.id)
    if (!session) throw new Error('Session not found')

    const res = await this.apiCall<{
      mail_id: string
      mail_from: string
      mail_subject: string
      mail_timestamp: number
      mail_body: string
      mail_date: string
    }>(`f=fetch_email&email_id=${messageId}`)

    return {
      id: messageId,
      from: res.mail_from,
      to: address.address,
      subject: res.mail_subject || '(No subject)',
      date: res.mail_date,
      timestamp: res.mail_timestamp * 1000,
      read: true,
      body: {
        html: res.mail_body,
        text: res.mail_body,
      },
      providerId: this.id,
    }
  }
}

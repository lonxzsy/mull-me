import type { EmailAddress, EmailMessage, GenerateOptions, TempMailProvider } from '../types'
import { smartFetchJson, generateRandomLogin } from './base'

const BASE_URL = 'https://www.1secmail.com/api/v1/'
const MAX_LIFETIME = 24 * 60

export class OneSecMailProvider implements TempMailProvider {
  id = '1secmail'
  name = '1SecMail'
  description = 'Fast disposable email with no registration required.'
  icon = 'Zap'
  maxLifetimeMinutes = MAX_LIFETIME
  defaultLifetimeMinutes = 60
  supportsCustomAddress = true
  supportsAttachments = true
  requiresProxy = true
  apiDocsUrl = 'https://www.1secmail.com/api/'

  private async getDomains(): Promise<string[]> {
    const data = await smartFetchJson<string[]>(`${BASE_URL}?action=getDomainList`)
    return Array.isArray(data) ? data : []
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
    let address: string

    if (options?.login && options?.domain) {
      address = `${options.login}@${options.domain}`
    } else {
      const data = await smartFetchJson<string[]>(`${BASE_URL}?action=genRandomMailbox&count=1`)
      const generated = Array.isArray(data) ? data[0] : undefined
      if (!generated) throw new Error('Failed to generate mailbox')
      address = generated
    }

    const parsed = address.split('@')
    if (parsed.length !== 2) throw new Error('Failed to generate mailbox')

    const lifetimeMs = (options?.lifetimeMinutes || this.defaultLifetimeMinutes) * 60 * 1000
    const now = Date.now()

    return {
      id: `${this.id}-${generateRandomLogin(8)}`,
      address,
      login: parsed[0],
      domain: parsed[1],
      providerId: this.id,
      createdAt: now,
      expiresAt: now + lifetimeMs,
    }
  }

  async getMessages(address: EmailAddress): Promise<EmailMessage[]> {
    const url = `${BASE_URL}?action=getMessages&login=${address.login}&domain=${address.domain}`
    const data = await smartFetchJson<Array<{ id: number; from: string; subject: string; date: string }>>(url)
    const list = Array.isArray(data) ? data : []

    return list.map((msg) => ({
      id: String(msg.id),
      from: msg.from,
      to: address.address,
      subject: msg.subject || '(No subject)',
      date: msg.date,
      timestamp: new Date(msg.date).getTime(),
      read: false,
      excerpt: msg.subject,
      providerId: this.id,
    }))
  }

  async getMessage(address: EmailAddress, messageId: string): Promise<EmailMessage> {
    const url = `${BASE_URL}?action=readMessage&login=${address.login}&domain=${address.domain}&id=${messageId}`
    const data = await smartFetchJson<{
      id: string
      from: string
      subject: string
      date: string
      body: string
      textBody: string
      htmlBody: string
      attachments: Array<{ filename: string; contentType: string; size: number }>
    }>(url)

    return {
      id: messageId,
      from: data.from,
      to: address.address,
      subject: data.subject || '(No subject)',
      date: data.date,
      timestamp: new Date(data.date).getTime(),
      read: true,
      body: {
        html: data.htmlBody || data.body,
        text: data.textBody,
        raw: data.body,
      },
      attachments: (Array.isArray(data.attachments) ? data.attachments : []).map((a) => ({
        id: `${messageId}-${a.filename}`,
        filename: a.filename,
        contentType: a.contentType,
        size: a.size,
      })),
      providerId: this.id,
    }
  }
}

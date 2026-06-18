export interface EmailAddress {
  id: string
  address: string
  login: string
  domain: string
  providerId: string
  createdAt: number
  expiresAt: number
  token?: string
  password?: string
  accountId?: string
}

export interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  date: string
  timestamp: number
  read: boolean
  excerpt?: string
  body?: EmailBody
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
  providerId: string
}

export interface EmailBody {
  html?: string
  text?: string
  raw?: string
}

export interface EmailAttachment {
  id: string
  filename: string
  contentType: string
  size?: number
  data?: Blob | string
  url?: string
  suspicious?: boolean
}

export interface TempMailProvider {
  id: string
  name: string
  description: string
  icon: string
  maxLifetimeMinutes: number
  defaultLifetimeMinutes: number
  supportsCustomAddress: boolean
  supportsAttachments: boolean
  requiresProxy: boolean
  apiDocsUrl: string
  checkAvailability(): Promise<boolean>
  generateMailbox(options?: GenerateOptions): Promise<EmailAddress>
  getMessages(address: EmailAddress): Promise<EmailMessage[]>
  getMessage(address: EmailAddress, messageId: string): Promise<EmailMessage>
  refreshSession?(address: EmailAddress): Promise<EmailAddress>
}

export interface GenerateOptions {
  login?: string
  domain?: string
  lifetimeMinutes?: number
}

export interface DetectedLink {
  url: string
  displayText: string
  domain: string
  suspicious: boolean
  reason?: string
}

export interface SecurityReport {
  hasLinks: boolean
  hasAttachments: boolean
  suspiciousLinks: DetectedLink[]
  suspiciousAttachments: EmailAttachment[]
  advice: string[]
}

export interface ProviderStatus {
  id: string
  name: string
  available: boolean
  latency: number
  error?: string
  lastChecked: number
}

export type ViewMode = 'html' | 'text' | 'raw'
export type LifetimeOption = { label: string; minutes: number }

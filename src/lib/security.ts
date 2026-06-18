import type { DetectedLink, EmailAttachment, SecurityReport } from '../types'

const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.xyz', '.click', '.link', '.work', '.date', '.party', '.racing', '.win',
  '.download', '.bid', '.trade', '.men', '.loan', '.country', '.stream', '.gdn', '.mom', '.casa', '.cam', '.uno',
  '.icu', '.cyou', '.shop', '.store', '.online', '.site', '.live', '.email', '.world', '.club', '.fit', '.tel',
]

const SUSPICIOUS_KEYWORDS = [
  'verify', 'verification', 'confirm', 'login', 'signin', 'account', 'password', 'credential', 'bank', 'paypal',
  'update', 'secure', 'security', 'suspended', 'locked', 'fraud', 'unusual', 'activity', 'payment', 'invoice', 'billing',
  'crypto', 'wallet', 'seed', 'private', 'key', 'urgent', 'immediate', 'action', 'required', 'limited', 'suspend',
  'disable', 'expire', 'validate', 'authenticate', 'access', 'recover', 'reset', 'sign-in', 'log-in', 'verify-now',
]

const IP_REGEX = /(\d{1,3}\.){3}\d{1,3}/
const URL_REGEX = /https?:\/\/[^\s<>"')\]}]+/gi

export function isSuspiciousDomain(url: string): { suspicious: boolean; reason?: string } {
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname.toLowerCase()

    if (IP_REGEX.test(domain)) {
      return { suspicious: true, reason: 'IP address used instead of domain name' }
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { suspicious: true, reason: 'Non-standard protocol' }
    }

    if (domain.length > 50) {
      return { suspicious: true, reason: 'Unusually long domain name' }
    }

    const hyphenCount = (domain.match(/-/g) || []).length
    if (hyphenCount > 2) {
      return { suspicious: true, reason: 'Multiple hyphens in domain' }
    }

    const lowerUrl = url.toLowerCase()
    for (const tld of SUSPICIOUS_TLDS) {
      if (domain.endsWith(tld)) {
        return { suspicious: true, reason: `Suspicious TLD (${tld})` }
      }
    }

    for (const keyword of SUSPICIOUS_KEYWORDS) {
      if (lowerUrl.includes(keyword)) {
        return { suspicious: true, reason: `Contains suspicious keyword: "${keyword}"` }
      }
    }

    return { suspicious: false }
  } catch {
    return { suspicious: true, reason: 'Invalid URL format' }
  }
}

export function extractLinksFromHtml(html: string): string[] {
  const links: string[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href')
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      links.push(href)
    }
  })
  return Array.from(new Set(links))
}

export function extractLinksFromText(text: string): string[] {
  const matches = text.match(URL_REGEX) || []
  return Array.from(new Set(matches))
}

export function extractDisplayTextFromHtml(html: string, url: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const link = Array.from(doc.querySelectorAll('a[href]')).find((a) => a.getAttribute('href') === url)
  return link?.textContent?.trim() || url
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return url
  }
}

export function detectLinks(html?: string, text?: string): DetectedLink[] {
  const htmlLinks = html ? extractLinksFromHtml(html) : []
  const textLinks = text ? extractLinksFromText(text) : []
  const allUrls = Array.from(new Set([...htmlLinks, ...textLinks]))

  return allUrls.map((url) => {
    const displayText = html ? extractDisplayTextFromHtml(html, url) : url
    const domain = getDomain(url)
    const check = isSuspiciousDomain(url)
    return {
      url,
      displayText: displayText.length > 80 ? displayText.slice(0, 80) + '…' : displayText,
      domain,
      suspicious: check.suspicious,
      reason: check.reason,
    }
  })
}

const SUSPICIOUS_ATTACHMENT_EXTENSIONS = ['.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.js', '.jse', '.wsf', '.wsh', '.ps1', '.sh', '.msi', '.dll', '.reg', '.jar', '.apk', '.ipa', '.dmg', '.pkg', '.deb', '.rpm', '.zip', '.rar', '.7z', '.tar', '.gz']
const DANGEROUS_EXTENSIONS = ['.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.js', '.jse', '.wsf', '.wsh', '.ps1', '.msi', '.dll', '.reg', '.jar', '.apk']

export function isSuspiciousAttachment(attachment: EmailAttachment): { suspicious: boolean; dangerous: boolean; reason?: string } {
  const filename = attachment.filename.toLowerCase()
  const ext = filename.slice(filename.lastIndexOf('.'))

  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { suspicious: true, dangerous: true, reason: `Executable file (${ext})` }
  }

  if (SUSPICIOUS_ATTACHMENT_EXTENSIONS.includes(ext)) {
    return { suspicious: true, dangerous: false, reason: `Archive/executable file (${ext})` }
  }

  if (attachment.contentType.includes('javascript') || attachment.contentType.includes('x-msdos') || attachment.contentType.includes('application/x-msdownload')) {
    return { suspicious: true, dangerous: true, reason: 'Executable MIME type' }
  }

  if (attachment.size && attachment.size > 10 * 1024 * 1024) {
    return { suspicious: true, dangerous: false, reason: 'Large file size (>10 MB)' }
  }

  return { suspicious: false, dangerous: false }
}

export function buildSecurityReport(html?: string, text?: string, attachments?: EmailAttachment[]): SecurityReport {
  const links = detectLinks(html, text)
  const suspiciousLinks = links.filter((l) => l.suspicious)
  const suspiciousAttachments = attachments?.filter((a) => isSuspiciousAttachment(a).suspicious) || []
  const advice: string[] = []

  if (suspiciousLinks.length > 0) {
    advice.push(`⚠️ ${suspiciousLinks.length} suspicious link(s) detected. Do not click unless you trust the sender.`)
  }
  if (suspiciousAttachments.length > 0) {
    advice.push(`⚠️ ${suspiciousAttachments.length} suspicious attachment(s). Do not download or open unknown files.`)
  }
  if (links.length > 0 && suspiciousLinks.length === 0) {
    advice.push('Links were detected. Always verify the sender before clicking.')
  }
  if ((attachments?.length || 0) > 0 && suspiciousAttachments.length === 0) {
    advice.push('Attachments were detected. Only open files from trusted sources.')
  }
  if (advice.length === 0) {
    advice.push('No obvious threats detected. Still, be cautious with unknown senders.')
  }

  return {
    hasLinks: links.length > 0,
    hasAttachments: (attachments?.length || 0) > 0,
    suspiciousLinks,
    suspiciousAttachments,
    advice,
  }
}

export function sanitizeEmailSubject(subject: string): string {
  return subject.replace(/[<>]/g, '').trim() || '(No subject)'
}

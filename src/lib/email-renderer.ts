import DOMPurify from 'dompurify'

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ['style'],
  ADD_ATTR: ['target', 'rel', 'data-link', 'title', 'alt'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeypress', 'onkeyup', 'oncontextmenu'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'button', 'textarea', 'select', 'video', 'audio', 'source', 'track', 'canvas', 'svg'],
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_TRUSTED_TYPE: false,
}

export function sanitizeEmailHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''

  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/on\w+\s*=/gi, 'data-blocked=')

  return DOMPurify.sanitize(cleaned, SANITIZE_CONFIG) as string
}

export function buildEmailDocument(html: string, blockRemoteImages: boolean): string {
  const safeHtml = Array.isArray(html) ? html.join('') : html
  const sanitized = sanitizeEmailHtml(safeHtml)

  let processed = sanitized
  if (blockRemoteImages) {
    processed = processed.replace(/<img\b[^>]*>/gi, (match) => {
      return match.replace(/src\s*=\s*"([^"]*)"/i, 'src="" data-original-src="$1" style="display:inline-block;min-width:64px;min-height:48px;background:#18181b;border-radius:4px;"')
    })
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  html, body { margin: 0; padding: 12px; font-family: Inter, system-ui, sans-serif; color: #fafafa; background: #09090b; line-height: 1.5; }
  a { color: #8b5cf6; text-decoration: underline; word-break: break-all; }
  img { max-width: 100%; height: auto; }
  table { max-width: 100%; }
  pre { white-space: pre-wrap; word-break: break-word; background: #18181b; padding: 12px; border-radius: 8px; }
  blockquote { border-left: 3px solid #3f3f46; margin: 0; padding-left: 12px; color: #a1a1aa; }
</style>
</head>
<body>
${processed}
</body>
</html>`
}

export function emailToText(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

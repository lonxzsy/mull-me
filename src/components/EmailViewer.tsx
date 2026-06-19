import { useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Paperclip, FileText, Code, Eye, ImageOff, X, ExternalLink,
  Download, Archive, FileDown
} from 'lucide-react'
import { useAppStore, getSelectedMessage } from '../store/appStore'
import { buildEmailDocument, emailToText } from '../lib/email-renderer'
import { buildSecurityReport, detectLinks } from '../lib/security'
import { formatDate, formatFileSize } from '../lib/utils'
import { cn } from '../lib/utils'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import type { ViewMode } from '../types'

export function EmailViewer() {
  const store = useAppStore()
  const message = getSelectedMessage(store)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const emailHtmlDoc = useMemo(() => {
    if (!message?.body?.html) return ''
    return buildEmailDocument(message.body.html, store.blockRemoteImages)
  }, [message?.body?.html, store.blockRemoteImages])

  const downloadAttachment = async (attachment: NonNullable<NonNullable<typeof message>['attachments']>[number]) => {
    const { saveAs } = await import('file-saver')
    if (attachment.data instanceof Blob) {
      saveAs(attachment.data, attachment.filename)
    } else if (attachment.url) {
      try {
        const resp = await fetch(attachment.url)
        const blob = await resp.blob()
        saveAs(blob, attachment.filename)
      } catch {
        store.addToast({ type: 'error', message: 'Failed to download attachment' })
      }
    } else {
      store.addToast({ type: 'error', message: 'Attachment data not available' })
    }
  }

  const downloadAllAttachments = async () => {
    if (!message?.attachments?.length) return
    const { saveAs } = await import('file-saver')
    const { default: JSZip } = await import('jszip')

    const zip = new JSZip()
    let downloaded = 0

    for (const att of message.attachments) {
      try {
        if (att.data instanceof Blob) {
          zip.file(att.filename, att.data)
          downloaded++
        } else if (att.url) {
          const resp = await fetch(att.url)
          const blob = await resp.blob()
          zip.file(att.filename, blob)
          downloaded++
        }
      } catch { /* skip failed */ }
    }

    if (downloaded === 0) {
      store.addToast({ type: 'error', message: 'No attachments could be downloaded' })
      return
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `attachments-${message.id.slice(0, 8)}.zip`)
    store.addToast({ type: 'success', message: `Downloaded ${downloaded} attachment(s)` })
  }

  const exportEmail = async (format: 'eml' | 'json') => {
    if (!message) return
    const { saveAs } = await import('file-saver')

    if (format === 'eml') {
      const eml = [
        `From: ${message.from}`,
        `To: ${message.to}`,
        `Subject: ${message.subject}`,
        `Date: ${new Date(message.timestamp).toUTCString()}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        message.body?.html || message.body?.text || '(No content)',
      ].join('\n')
      saveAs(new Blob([eml], { type: 'message/rfc822' }), `email-${message.id.slice(0, 8)}.eml`)
    } else {
      const json = JSON.stringify(message, null, 2)
      saveAs(new Blob([json], { type: 'application/json' }), `email-${message.id.slice(0, 8)}.json`)
    }
    store.addToast({ type: 'success', message: `Email exported as ${format.toUpperCase()}` })
  }

  if (!store.address) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card hidden flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground lg:flex"
      >
        <FileText className="h-10 w-10" />
        <p className="text-sm">Select a mailbox to view emails.</p>
      </motion.div>
    )
  }

  return (
    <>
      {/* Desktop viewer */}
      <div className="hidden lg:block">
        <ViewerContent
          message={message}
          store={store}
          iframeRef={iframeRef}
          emailHtmlDoc={emailHtmlDoc}
          onDownloadAttachment={downloadAttachment}
          onDownloadAll={downloadAllAttachments}
          onExport={exportEmail}
        />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {message && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => store.selectMessage(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-background shadow-2xl lg:hidden"
            >
              <div className="flex h-full flex-col overflow-y-auto p-4 pt-16">
                <ViewerContent
                  message={message}
                  store={store}
                  iframeRef={iframeRef}
                  emailHtmlDoc={emailHtmlDoc}
                  onDownloadAttachment={downloadAttachment}
                  onDownloadAll={downloadAllAttachments}
                  onExport={exportEmail}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function ViewerContent({
  message,
  store,
  iframeRef,
  emailHtmlDoc,
  onDownloadAttachment,
  onDownloadAll,
  onExport,
}: {
  message: ReturnType<typeof getSelectedMessage>
  store: ReturnType<typeof useAppStore.getState>
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  emailHtmlDoc: string
  onDownloadAttachment: (att: NonNullable<NonNullable<ReturnType<typeof getSelectedMessage>>['attachments']>[number]) => void
  onDownloadAll: () => void
  onExport: (format: 'eml' | 'json') => void
}) {
  if (!message) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
        <FileText className="h-10 w-10" />
        <p className="text-sm">Select an email from the list to read it.</p>
      </div>
    )
  }

  const report = buildSecurityReport(message.body?.html, message.body?.text, message.attachments)
  const links = detectLinks(message.body?.html, message.body?.text)

  return (
    <div className="card flex h-full min-h-[420px] flex-col">
      <div className="mb-4 space-y-3 border-b border-border pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight text-foreground">{message.subject}</h2>
            <p className="mt-1 text-sm text-muted-foreground">From: {message.from}</p>
            <p className="text-xs text-muted-foreground">To: {message.to}</p>
            <p className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<X className="h-4 w-4" />} onClick={() => store.selectMessage(null)}>
            Close
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ViewModeButton mode="html" current={store.viewMode} setMode={store.setViewMode} label="HTML" icon={<Eye className="h-3.5 w-3.5" />} />
          <ViewModeButton mode="text" current={store.viewMode} setMode={store.setViewMode} label="Text" icon={<FileText className="h-3.5 w-3.5" />} />
          <ViewModeButton mode="raw" current={store.viewMode} setMode={store.setViewMode} label="Raw" icon={<Code className="h-3.5 w-3.5" />} />
          <Button
            variant={store.blockRemoteImages ? 'secondary' : 'primary'}
            size="sm"
            leftIcon={<ImageOff className="h-3.5 w-3.5" />}
            onClick={store.toggleBlockRemoteImages}
          >
            {store.blockRemoteImages ? 'Images blocked' : 'Images allowed'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FileDown className="h-3.5 w-3.5" />}
            onClick={() => onExport('eml')}
          >
            Export
          </Button>
        </div>

        {report.suspiciousLinks.length > 0 || report.suspiciousAttachments.length > 0 ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-warning">
              <AlertTriangle className="h-4 w-4" />
              Security warning
            </div>
            <ul className="space-y-1 text-xs text-warning/90">
              {report.advice.map((advice: string, index: number) => (
                <li key={index}>{advice}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-success/30 bg-success/10 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <ShieldIcon className="h-4 w-4" />
              {report.advice[0]}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-border bg-surface">
        {store.viewMode === 'html' && (
          <iframe
            ref={iframeRef}
            title="Email content"
            sandbox="allow-same-origin"
            srcDoc={emailHtmlDoc}
            className="h-full min-h-[320px] w-full rounded-xl"
          />
        )}
        {store.viewMode === 'text' && (
          <pre className="h-full min-h-[320px] whitespace-pre-wrap p-4 text-sm text-foreground">
            {message.body?.text || emailToText(message.body?.html || '') || '(No text content)'}
          </pre>
        )}
        {store.viewMode === 'raw' && (
          <pre className="h-full min-h-[320px] whitespace-pre-wrap p-4 text-xs text-muted-foreground">
            {message.body?.raw || message.body?.html || message.body?.text || '(No raw content)'}
          </pre>
        )}
      </div>

      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Paperclip className="h-4 w-4" />
              Attachments ({message.attachments.length})
            </h3>
            <Button variant="ghost" size="sm" leftIcon={<Archive className="h-3.5 w-3.5" />} onClick={onDownloadAll}>
              Download all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <button
                key={att.id}
                onClick={() => onDownloadAttachment(att)}
                className="focus:outline-none"
              >
                <Badge
                  variant={att.suspicious ? 'danger' : 'muted'}
                  className="cursor-pointer hover:bg-surface-hover transition-colors"
                >
                  <Download className="h-3 w-3" />
                  {att.filename} {att.size ? `(${formatFileSize(att.size)})` : ''}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">Detected links</h3>
          <div className="space-y-1.5">
            {links.slice(0, 8).map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border p-2.5 text-xs transition-colors',
                  link.suspicious
                    ? 'border-warning/30 bg-warning/5 text-warning hover:bg-warning/10'
                    : 'border-border bg-surface text-foreground hover:bg-surface-hover'
                )}
              >
                <span className="min-w-0 flex-1 truncate">{link.displayText}</span>
                <span className="shrink-0 text-muted-foreground">{link.domain}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ViewModeButton({
  mode,
  current,
  setMode,
  label,
  icon,
}: {
  mode: ViewMode
  current: ViewMode
  setMode: (m: ViewMode) => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <Button
      variant={current === mode ? 'primary' : 'secondary'}
      size="sm"
      leftIcon={icon}
      onClick={() => setMode(mode)}
    >
      {label}
    </Button>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

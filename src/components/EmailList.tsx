import { MailOpen, Mail, RefreshCw, Inbox } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { usePolling } from '../hooks/usePolling'
import { formatDate, formatRelativeTime } from '../lib/utils'
import { cn } from '../lib/utils'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

export function EmailList() {
  const { address, messages, selectedMessageId, polling, autoRefresh, refreshMessages, selectMessage, togglePolling } = useAppStore()

  usePolling(
    () => {
      if (address && autoRefresh) {
        return refreshMessages()
      }
    },
    5000,
    polling && autoRefresh && !!address
  )

  if (!address) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Create a mailbox on the Home page to see incoming emails.</p>
      </div>
    )
  }

  return (
    <div className="card flex h-full min-h-[420px] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
          <p className="text-xs text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? 's' : ''} · {formatRelativeTime(address.expiresAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={refreshMessages}
          >
            Refresh
          </Button>
          <Button
            variant={polling ? 'primary' : 'secondary'}
            size="sm"
            onClick={togglePolling}
          >
            {polling ? 'Live' : 'Paused'}
          </Button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
            <Mail className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Waiting for emails...</p>
          <p className="text-xs text-muted-foreground">Send a test email to {address.address}</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-auto pr-1">
          {messages.map((msg) => {
            const active = selectedMessageId === msg.id
            const Icon = msg.read ? MailOpen : Mail
            return (
              <button
                key={msg.id}
                onClick={() => selectMessage(msg.id)}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-all',
                  active
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-surface hover:border-border-subtle hover:bg-surface-hover'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4 shrink-0', msg.read ? 'text-muted-foreground' : 'text-primary')} />
                      <span className="truncate text-sm font-medium text-foreground">
                        {msg.from}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{msg.subject}</p>
                    {msg.excerpt && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">{msg.excerpt}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</p>
                    {!msg.read && <Badge variant="primary" className="mt-1.5">New</Badge>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, RefreshCw, Trash2, Clock, Shield, Zap, Mail, Clock12, History } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { getProviderById, providers } from '../providers'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Badge } from './ui/Badge'
import { Tooltip } from './ui/Tooltip'
import { copyToClipboard, formatRelativeTime, isValidEmailLogin } from '../lib/utils'
import type { LifetimeOption } from '../types'

const lifetimeOptions: LifetimeOption[] = [
  { label: '10 minutes', minutes: 10 },
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '3 hours', minutes: 180 },
  { label: '6 hours', minutes: 360 },
  { label: '12 hours', minutes: 720 },
  { label: '24 hours', minutes: 1440 },
]

export function EmailGenerator() {
  const {
    address,
    providerId,
    loading,
    error,
    generateMailbox,
    deleteMailbox,
    generatedHistory,
    restoreMailbox,
  } = useAppStore()

  const [customLogin, setCustomLogin] = useState('')
  const [selectedLifetime, setSelectedLifetime] = useState(60)
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const provider = getProviderById(providerId)
  const providerOptions = providers.map((p) => ({ value: p.id, label: p.name }))

  const handleGenerate = () => {
    const options: { login?: string; lifetimeMinutes: number } = {
      lifetimeMinutes: selectedLifetime,
    }
    if (customLogin.trim() && isValidEmailLogin(customLogin.trim())) {
      options.login = customLogin.trim()
    }
    generateMailbox(options)
  }

  const handleCopy = async () => {
    if (!address) return
    const ok = await copyToClipboard(address.address)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="card space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Provider
          </label>
          <Select
            value={providerId}
            onChange={(e) => useAppStore.getState().setProvider(e.target.value)}
            options={providerOptions}
          />
        </div>

        <div className="flex-[1.5]">
          <Input
            label="Custom username (optional)"
            placeholder="e.g. john.doe"
            value={customLogin}
            onChange={(e) => setCustomLogin(e.target.value)}
          />
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Lifetime
          </label>
          <Select
            value={String(selectedLifetime)}
            onChange={(e) => setSelectedLifetime(Number(e.target.value))}
            options={lifetimeOptions.map((o) => ({ value: String(o.minutes), label: o.label }))}
          />
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          leftIcon={<Zap className="h-4 w-4" />}
          className="sm:self-end"
        >
          Generate
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {address ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Your temporary email</p>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="break-all text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {address.address}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content={copied ? 'Copied!' : 'Copy address'}>
                  <Button variant="secondary" size="sm" leftIcon={<Copy className="h-4 w-4" />} onClick={handleCopy}>
                    Copy
                  </Button>
                </Tooltip>
                <Tooltip content="Generate new address">
                  <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={handleGenerate}>
                    New
                  </Button>
                </Tooltip>
                <Tooltip content="Delete mailbox">
                  <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={deleteMailbox}>
                    Delete
                  </Button>
                </Tooltip>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(address.expiresAt)}
              </Badge>
              <Badge variant="muted">
                <Shield className="h-3 w-3" />
                {provider?.name}
              </Badge>
              {selectedLifetime >= 60 && (
                <Badge variant="warning">
                  <Clock12 className="h-3 w-3" />
                  Auto-expires
                </Badge>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 py-10 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated"
            >
              <Mail className="h-6 w-6 text-muted-foreground" />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              No active mailbox. Generate one to start receiving emails.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {generatedHistory.length > 0 && (
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            History ({generatedHistory.length})
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {generatedHistory.map((addr) => (
                  <button
                    key={addr.address}
                    onClick={() => restoreMailbox(addr)}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{addr.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {getProviderById(addr.providerId)?.name} · {formatRelativeTime(addr.expiresAt)}
                      </p>
                    </div>
                    <Zap className="ml-3 h-4 w-4 shrink-0 text-primary" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import { Activity, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { providers } from '../providers'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

export function ProviderStatus() {
  const { providerStatuses, checkProviders } = useAppStore()

  useEffect(() => {
    if (providerStatuses.length === 0) {
      checkProviders()
    }
  }, [providerStatuses.length, checkProviders])

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Provider Status</h2>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Clock className="h-4 w-4" />} onClick={checkProviders}>
          Check now
        </Button>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => {
          const status = providerStatuses.find((s) => s.id === provider.id)
          return (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{provider.name}</span>
                  {status?.available ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="danger">
                      <XCircle className="h-3 w-3" />
                      Offline
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{provider.description}</p>
                {status?.error && <p className="text-xs text-danger">{status.error}</p>}
                {status && (
                  <p className="text-xs text-muted-foreground">
                    Latency: {status.latency}ms · Checked {new Date(status.lastChecked).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <a
                href={provider.apiDocsUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                API docs
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

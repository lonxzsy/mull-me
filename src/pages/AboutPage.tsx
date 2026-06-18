import { Shield, Mail, Code, Heart } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">About Mull Me</h1>
        <p className="mt-3 text-muted-foreground">
          Mull Me is a free, open-source temporary email client built with React and Vite. It talks directly to public temp mail APIs from your browser — no backend, no tracking, no ads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-3">
          <Mail className="h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">How it works</h2>
          <p className="text-sm text-muted-foreground">
            Choose a provider, generate a random address, and start receiving emails. Messages are fetched directly from the provider's API in your browser.
          </p>
        </div>
        <div className="card space-y-3">
          <Shield className="h-8 w-8 text-success" />
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <p className="text-sm text-muted-foreground">
            HTML emails are sanitized with DOMPurify and rendered inside a sandboxed iframe. Links and attachments are analyzed for suspicious patterns.
          </p>
        </div>
        <div className="card space-y-3">
          <Code className="h-8 w-8 text-warning" />
          <h2 className="text-lg font-semibold text-foreground">Open source</h2>
          <p className="text-sm text-muted-foreground">
            The code is meant to be transparent and hackable. You can add new providers, change the UI, or deploy it anywhere.
          </p>
        </div>
        <div className="card space-y-3">
          <Heart className="h-8 w-8 text-danger" />
          <h2 className="text-lg font-semibold text-foreground">No tracking</h2>
          <p className="text-sm text-muted-foreground">
            We do not use cookies for tracking, do not show ads, and do not store your emails on our infrastructure.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground">Supported providers</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Mail.tm — modern JWT-based temporary email</li>
          <li>Mail.gw — 10-minute mail with JWT authentication</li>
          <li>1SecMail — simple REST API with no registration</li>
          <li>Guerrilla Mail — classic session-based disposable email</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Provider availability depends on their public APIs and CORS settings. If one provider is blocked, try another.
        </p>
      </div>
    </div>
  )
}

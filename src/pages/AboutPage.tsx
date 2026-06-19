import { motion } from 'framer-motion'
import { Shield, Mail, Code, Heart } from 'lucide-react'

const items = [
  {
    icon: Mail,
    title: 'How it works',
    description: 'Choose a provider, generate a random address, and start receiving emails. Messages are fetched directly from the provider\'s API in your browser.',
    color: 'text-primary',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'HTML emails are sanitized with DOMPurify and rendered inside a sandboxed iframe. Links and attachments are analyzed for suspicious patterns.',
    color: 'text-success',
  },
  {
    icon: Code,
    title: 'Open source',
    description: 'The code is meant to be transparent and hackable. You can add new providers, change the UI, or deploy it anywhere.',
    color: 'text-warning',
  },
  {
    icon: Heart,
    title: 'No tracking',
    description: 'We do not use cookies for tracking, do not show ads, and do not store your emails on our infrastructure.',
    color: 'text-danger',
  },
]

export function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">About Mull Me</h1>
        <p className="mt-3 text-muted-foreground">
          Mull Me is a free, open-source temporary email client built with React and Vite. It talks directly to public temp mail APIs from your browser — no backend, no tracking, no ads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -2 }}
            className="card space-y-3 transition-colors hover:border-primary/30"
          >
            <item.icon className={`h-8 w-8 ${item.color}`} />
            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
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
    </motion.div>
  )
}

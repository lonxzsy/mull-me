import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Lock, Mail, Clock } from 'lucide-react'
import { EmailGenerator } from '../components/EmailGenerator'
import { ProviderStatus } from '../components/ProviderStatus'

const features = [
  {
    icon: Zap,
    title: 'Instant generation',
    description: 'Create a temporary email address in one click. No registration, no personal data.',
  },
  {
    icon: Globe,
    title: 'Multiple providers',
    description: 'Switch between free temp mail providers automatically for best availability.',
  },
  {
    icon: Lock,
    title: 'Security warnings',
    description: 'Detect suspicious links and attachments before you interact with them.',
  },
  {
    icon: Mail,
    title: 'Full CSS support',
    description: 'Emails are rendered safely in a sandboxed iframe preserving original styles.',
  },
  {
    icon: Clock,
    title: 'Custom lifetime',
    description: 'Choose how long your mailbox lives — from 10 minutes up to 24 hours.',
  },
  {
    icon: Shield,
    title: 'Privacy first',
    description: 'Your real email stays hidden. We do not store messages on our servers.',
  },
]

export function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/50 p-8 sm:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Free temporary email for <span className="text-gradient">everyone</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Generate disposable email addresses, receive messages with full CSS rendering, and stay safe with built-in link & attachment warnings.
            </p>
          </motion.div>
        </div>
      </section>

      <EmailGenerator />

      <ProviderStatus />

      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">Why Mull Me?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Everything you need from a temp mail service.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-border bg-surface-elevated p-5 transition-colors hover:border-border-subtle"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

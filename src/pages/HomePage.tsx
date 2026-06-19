import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Lock, Mail, Clock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-500 shadow-2xl shadow-primary/30"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Free temporary email for <span className="text-gradient">everyone</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Generate disposable email addresses, receive messages with full CSS rendering, and stay safe with built-in link & attachment warnings.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center justify-center gap-4"
            >
              <Link
                to="/inbox"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-[0.98]"
              >
                Go to inbox
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <EmailGenerator />

      <ProviderStatus />

      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-foreground">Why Mull Me?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Everything you need from a temp mail service.</p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-2xl border border-border bg-surface-elevated p-5 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110 group-hover:bg-primary/20">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}

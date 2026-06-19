import { motion } from 'framer-motion'
import { ProviderStatus } from '../components/ProviderStatus'

export function ProvidersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <ProviderStatus />
    </motion.div>
  )
}

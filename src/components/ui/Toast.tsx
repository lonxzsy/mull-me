import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/utils'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-primary/30 bg-primary/10 text-primary',
  warning: 'border-warning/30 bg-warning/10 text-warning',
}

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts)
  const removeToast = useAppStore((s) => s.removeToast)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm',
                colors[toast.type],
                'bg-surface-elevated/95'
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-lg p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

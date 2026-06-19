import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ToastContainer } from './components/ui/Toast'
import { HomePage } from './pages/HomePage'
import { InboxPage } from './pages/InboxPage'
import { ProvidersPage } from './pages/ProvidersPage'
import { AboutPage } from './pages/AboutPage'
import { useAppStore } from './store/appStore'

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const location = useLocation()
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="/inbox" element={<AnimatedPage><InboxPage /></AnimatedPage>} />
              <Route path="/providers" element={<AnimatedPage><ProvidersPage /></AnimatedPage>} />
              <Route path="/about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default App

import { Link, useLocation } from 'react-router-dom'
import { Mail, Inbox, Activity, Info, Sun, Moon } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { cn } from '../lib/utils'

const nav = [
  { path: '/', label: 'Home', icon: Mail },
  { path: '/inbox', label: 'Inbox', icon: Inbox },
  { path: '/providers', label: 'Providers', icon: Activity },
  { path: '/about', label: 'About', icon: Info },
]

export function Header() {
  const location = useLocation()
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Mull<span className="text-primary">Me</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-surface-elevated text-foreground' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2 md:hidden">
            {nav.map((item) => {
              const active = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    active ? 'bg-surface-elevated text-foreground' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}

import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, Zap } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { EmailList } from '../components/EmailList'
import { EmailViewer } from '../components/EmailViewer'
import { Button } from '../components/ui/Button'

export function InboxPage() {
  const navigate = useNavigate()
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const sortOrder = useAppStore((s) => s.sortOrder)
  const setSortOrder = useAppStore((s) => s.setSortOrder)
  const selectedMessageId = useAppStore((s) => s.selectedMessageId)
  const selectMessage = useAppStore((s) => s.selectMessage)
  const messages = useAppStore((s) => s.messages)
  const refreshMessages = useAppStore((s) => s.refreshMessages)

  const searchRef = useRef<HTMLInputElement>(null)

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      msg.from.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q) ||
      (msg.excerpt && msg.excerpt.toLowerCase().includes(q))
    )
  })

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest': return a.timestamp - b.timestamp
      case 'sender': return a.from.localeCompare(b.from)
      case 'subject': return a.subject.localeCompare(b.subject)
      default: return b.timestamp - a.timestamp
    }
  })

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.target instanceof HTMLSelectElement) return

    switch (e.key) {
      case '/':
        e.preventDefault()
        searchRef.current?.focus()
        break
      case 'j':
      case 'ArrowDown': {
        e.preventDefault()
        const idx = sortedMessages.findIndex((m) => m.id === selectedMessageId)
        const next = sortedMessages[Math.min(idx + 1, sortedMessages.length - 1)]
        if (next) selectMessage(next.id)
        break
      }
      case 'k':
      case 'ArrowUp': {
        e.preventDefault()
        const idx = sortedMessages.findIndex((m) => m.id === selectedMessageId)
        const prev = sortedMessages[Math.max(idx - 1, 0)]
        if (prev) selectMessage(prev.id)
        break
      }
      case 'Escape':
        selectMessage(null)
        break
      case 'r':
        e.preventDefault()
        refreshMessages()
        break
      case 'n':
        e.preventDefault()
        navigate('/')
        break
    }
  }, [sortedMessages, selectedMessageId, selectMessage, refreshMessages, navigate])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="gap-6 lg:grid lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search emails... (press /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 pr-3"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="input-base appearance-none pl-9 pr-8 py-2.5 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="sender">Sender</option>
              <option value="subject">Subject</option>
            </select>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Zap className="h-4 w-4" />}
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            New
          </Button>
        </div>
        <EmailList messages={sortedMessages} />
      </div>
      <EmailViewer />
    </div>
  )
}

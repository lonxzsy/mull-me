import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void | Promise<void>, intervalMs: number, enabled: boolean) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
    if (!enabled) return

    let mounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const tick = async () => {
      if (!mounted) return
      try {
        await callbackRef.current()
      } catch {
        // ignore polling errors
      }
      timeoutId = setTimeout(tick, intervalMs)
    }

    tick()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [enabled, intervalMs])
}

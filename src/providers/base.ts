import axios from 'axios'

export const DEBUG = true

function debug(...args: unknown[]) {
  if (DEBUG) console.log('[DEBUG]', ...args)
}

export const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
]

let currentProxyIndex = 0

export function getNextProxyUrl(): string {
  const proxy = CORS_PROXIES[currentProxyIndex]
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length
  return proxy
}

export function getProxiedUrl(url: string, proxy?: string): string {
  const p = proxy || CORS_PROXIES[0]
  return `${p}${encodeURIComponent(url)}`
}

export async function fetchWithProxy(url: string, options?: RequestInit, proxy?: string): Promise<Response> {
  const proxied = getProxiedUrl(url, proxy)
  return fetch(proxied, options)
}

export async function fetchJson<T = unknown>(url: string, options?: RequestInit, proxy?: string): Promise<T> {
  const response = await fetchWithProxy(url, options, proxy)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

async function tryDirect<T>(url: string, options?: RequestInit): Promise<T> {
  debug('Trying direct:', url)
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) })
  debug('Direct response:', res.status, res.statusText)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json() as T
  debug('Direct JSON:', JSON.stringify(json).substring(0, 300))
  return json
}

async function tryProxy<T>(url: string, options?: RequestInit): Promise<T> {
  for (const proxy of CORS_PROXIES) {
    try {
      const proxied = getProxiedUrl(url, proxy)
      debug('Trying proxy:', proxy, '->', proxied)
      const res = await fetch(proxied, { ...options, signal: AbortSignal.timeout(8000) })
      debug('Proxy response:', proxy, res.status, res.statusText)
      if (!res.ok) continue
      const text = await res.text()
      try {
        return JSON.parse(text) as T
      } catch {
        debug('Proxy returned non-JSON:', proxy, text.substring(0, 200))
        continue
      }
    } catch (err) {
      debug('Proxy failed:', proxy, err instanceof Error ? err.message : err)
      continue
    }
  }
  throw new Error('All CORS proxies failed')
}

export async function smartFetchJson<T = unknown>(url: string, options?: RequestInit, forceProxy = false): Promise<T> {
  if (!forceProxy) {
    try {
      const result = await tryDirect<T>(url, options)
      debug('smartFetchJson: direct OK for', url)
      return result
    } catch (err) {
      debug('smartFetchJson: direct FAILED for', url, '-', err instanceof Error ? err.message : err)
    }
  }
  const result = await tryProxy<T>(url, options)
  debug('smartFetchJson: proxy OK for', url)
  return result
}

export function createAxiosInstance(proxied = false, baseURL?: string) {
  if (proxied && baseURL) {
    return axios.create({
      baseURL: getProxiedUrl(baseURL),
      timeout: 15000,
      headers: { 'Accept': 'application/json' },
    })
  }
  return axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Accept': 'application/json' },
  })
}

export async function smartAxiosGet<T = unknown>(baseURL: string, path: string, headers?: Record<string, string>, forceProxy = false): Promise<T> {
  const fullUrl = `${baseURL}${path}`
  if (!forceProxy) {
    try {
      debug('smartAxiosGet: trying direct', fullUrl)
      const res = await axios.get<T>(fullUrl, {
        timeout: 8000,
        headers: { 'Accept': 'application/json', ...headers },
      })
      debug('smartAxiosGet: direct OK', fullUrl, 'data:', JSON.stringify(res.data).substring(0, 300))
      return res.data
    } catch (err) {
      debug('smartAxiosGet: direct FAILED', fullUrl, '-', err instanceof Error ? err.message : err)
    }
  }
  for (const proxy of CORS_PROXIES) {
    try {
      const proxied = getProxiedUrl(fullUrl, proxy)
      debug('smartAxiosGet: trying proxy', proxy, '->', proxied)
      const res = await axios.get<T>(proxied, {
        timeout: 8000,
        headers: { 'Accept': 'application/json', ...headers },
      })
      debug('smartAxiosGet: proxy OK', proxy)
      return res.data
    } catch (err) {
      debug('smartAxiosGet: proxy FAILED', proxy, '-', err instanceof Error ? err.message : err)
      continue
    }
  }
  throw new Error('All CORS proxies failed')
}

export async function smartAxiosPost<T = unknown>(baseURL: string, path: string, data: unknown, headers?: Record<string, string>, forceProxy = false): Promise<T> {
  const fullUrl = `${baseURL}${path}`
  if (!forceProxy) {
    try {
      debug('smartAxiosPost: trying direct', fullUrl)
      const res = await axios.post<T>(fullUrl, data, {
        timeout: 8000,
        headers: { 'Accept': 'application/json', ...headers },
      })
      debug('smartAxiosPost: direct OK', fullUrl, 'data:', JSON.stringify(res.data).substring(0, 300))
      return res.data
    } catch (err) {
      debug('smartAxiosPost: direct FAILED', fullUrl, '-', err instanceof Error ? err.message : err)
    }
  }
  for (const proxy of CORS_PROXIES) {
    try {
      const proxied = getProxiedUrl(fullUrl, proxy)
      debug('smartAxiosPost: trying proxy', proxy, '->', proxied)
      const res = await axios.post<T>(proxied, data, {
        timeout: 8000,
        headers: { 'Accept': 'application/json', ...headers },
      })
      debug('smartAxiosPost: proxy OK', proxy)
      return res.data
    } catch (err) {
      debug('smartAxiosPost: proxy FAILED', proxy, '-', err instanceof Error ? err.message : err)
      continue
    }
  }
  throw new Error('All CORS proxies failed')
}

export function generateRandomLogin(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

import type { SupportRequest } from '../types'

const REQUESTS_KEY = 'ekosova_support_requests'
const HISTORY_KEY = 'ekosova_search_history'
const SETTINGS_KEY = 'ekosova_accessibility_settings'

export function getSupportRequests(): SupportRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSupportRequest(request: SupportRequest): void {
  const requests = getSupportRequests()
  requests.unshift(request)
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}

export function updateRequestStatus(id: string, status: SupportRequest['status']): void {
  const requests = getSupportRequests()
  const updated = requests.map((r) => (r.id === id ? { ...r, status } : r))
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated))
}

export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addSearchHistory(query: string): void {
  const history = getSearchHistory()
  const filtered = history.filter((h) => h !== query)
  const updated = [query, ...filtered].slice(0, 5)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function clearSearchHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

export function generateRequestId(): string {
  return 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)
}

export function getStoredSettings(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveSettings(settings: Record<string, unknown>): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

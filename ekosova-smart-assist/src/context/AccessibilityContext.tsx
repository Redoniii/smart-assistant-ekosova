import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Language } from '../types'
import { getStoredSettings, saveSettings } from '../utils/storage'

interface AccessibilityContextType {
  largeText: boolean
  highContrast: boolean
  language: Language
  toggleLargeText: () => void
  toggleHighContrast: () => void
  setLanguage: (lang: Language) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const stored = getStoredSettings()

  const [largeText, setLargeText] = useState<boolean>((stored.largeText as boolean) ?? false)
  const [highContrast, setHighContrast] = useState<boolean>((stored.highContrast as boolean) ?? false)
  const [language, setLanguageState] = useState<Language>((stored.language as Language) ?? 'sq')

  useEffect(() => {
    document.body.classList.toggle('text-large', largeText)
    document.body.classList.toggle('high-contrast', highContrast)
  }, [largeText, highContrast])

  const toggleLargeText = () => {
    const next = !largeText
    setLargeText(next)
    saveSettings({ ...getStoredSettings(), largeText: next })
  }

  const toggleHighContrast = () => {
    const next = !highContrast
    setHighContrast(next)
    saveSettings({ ...getStoredSettings(), highContrast: next })
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    saveSettings({ ...getStoredSettings(), language: lang })
  }

  return (
    <AccessibilityContext.Provider
      value={{ largeText, highContrast, language, toggleLargeText, toggleHighContrast, setLanguage }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used inside AccessibilityProvider')
  return ctx
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import type { Language } from '../types'
import EKosovaLogo from './EKosovaLogo'

const navItems: Record<Language, Array<{ label: string; path: string }>> = {
  sq: [
    { label: 'Ballina', path: '/citizen' },
    { label: 'Shërbimet', path: '/catalog' },
    { label: 'Informatat', path: '/citizen#info' },
  ],
  en: [
    { label: 'Home', path: '/citizen' },
    { label: 'Services', path: '/catalog' },
    { label: 'Information', path: '/citizen#info' },
  ],
  sr: [
    { label: 'Početna', path: '/citizen' },
    { label: 'Usluge', path: '/catalog' },
    { label: 'Informacije', path: '/citizen#info' },
  ],
}

const utilLabels: Record<Language, { help: string; faq: string; links: string; mail: string; agent: string }> = {
  sq: { help: 'Ndihmë', faq: 'FAQ', links: 'Lidhjet', mail: 'E-mail', agent: 'Portal Agjentësh' },
  en: { help: 'Help', faq: 'FAQ', links: 'Links', mail: 'E-mail', agent: 'Agent Portal' },
  sr: { help: 'Pomoć', faq: 'FAQ', links: 'Veze', mail: 'E-pošta', agent: 'Portal Agenata' },
}

export default function CitizenHeader() {
  const { language, setLanguage, largeText, toggleLargeText, highContrast, toggleHighContrast } = useAccessibility()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const nav = navItems[language]
  const util = utilLabels[language]

  return (
    <header className="sticky top-0 z-40 shadow-sm">

      {/* ── TOP UTILITY BAR — exact eKosova style ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
          {/* Left: language switcher */}
          <div className="flex items-center divide-x divide-gray-300">
            {(['sq', 'en', 'sr'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 text-xs font-medium transition-colors leading-none py-1 ${
                  language === lang ? 'text-[#1d61a1] font-semibold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {lang === 'sq' ? 'Shq' : lang === 'en' ? 'Eng' : 'Srb'}
              </button>
            ))}
          </div>

          {/* Right: utility links + phishing warning + accessibility */}
          <div className="flex items-center gap-0.5">
            {[util.help, util.faq, util.links].map((lbl) => (
              <button key={lbl}
                className="px-2.5 py-1 text-xs text-gray-500 hover:text-[#1d61a1] transition-colors hidden sm:block border-r border-gray-200">
                {lbl}
              </button>
            ))}
            <a href="https://mail.rks-gov.net/owa/"
              className="px-2.5 py-1 text-xs text-gray-500 hover:text-[#1d61a1] transition-colors hidden sm:block border-r border-gray-200">
              {util.mail}
            </a>

            {/* Phishing warning icon */}
            <div className="px-2 hidden md:flex items-center" title="Kujdes nga phishing">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 19h20L12 2z" fill="#f59e0b" />
                <path d="M12 9v5M12 16v1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Accessibility */}
            <button onClick={toggleLargeText} title="Zmadho tekstin"
              className={`px-2 py-1 text-xs border-l border-gray-200 transition-colors ${largeText ? 'text-[#1d61a1] font-bold' : 'text-gray-500 hover:text-[#1d61a1]'}`}>
              A+
            </button>
            <button onClick={toggleHighContrast} title="Kontrast i lartë"
              className={`px-2 py-1 text-xs border-l border-gray-200 transition-colors ${highContrast ? 'text-[#1d61a1]' : 'text-gray-500 hover:text-[#1d61a1]'}`}>
              ◑
            </button>

            {/* Agent portal — subtle but accessible */}
            <Link to="/agent"
              className="ml-1 px-2.5 py-1 text-xs font-medium text-[#1d61a1] border border-[#1d61a1]/30 rounded hover:bg-[#1d61a1]/5 transition-colors hidden sm:flex items-center gap-1">
              <span>🎧</span> {util.agent}
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/citizen" className="flex items-center shrink-0">
              <EKosovaLogo />
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center h-full">
              {nav.map((item) => {
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-5 h-full flex items-center text-sm font-medium transition-colors ${
                      active ? 'text-[#1d61a1]' : 'text-[#383838] hover:text-[#1d61a1]'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d61a1]" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right icons: search + mobile menu */}
            <div className="flex items-center gap-2">
              {/* Search icon */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-[#1d61a1] transition-colors rounded-lg hover:bg-gray-50"
                title="Kërko"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-[#1d61a1] transition-colors"
              >
                {mobileOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search expand bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <div className="max-w-2xl mx-auto flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Kërko shërbime…"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d61a1] focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="px-4 py-2 bg-[#1d61a1] text-white text-sm font-medium rounded-lg hover:bg-[#1a5591] transition-colors"
              >
                Kërko
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-md">
          {nav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-5 py-3 text-sm font-medium border-b border-gray-100 transition-colors ${
                location.pathname === item.path
                  ? 'text-[#1d61a1] bg-[#1d61a1]/5'
                  : 'text-[#383838] hover:text-[#1d61a1] hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/agent"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#1d61a1]"
          >
            🎧 {util.agent}
          </Link>
          <div className="px-5 py-3 flex gap-2 border-t border-gray-100">
            {(['sq', 'en', 'sr'] as Language[]).map((lang) => (
              <button key={lang} onClick={() => { setLanguage(lang); setMobileOpen(false) }}
                className={`px-3 py-1 text-xs rounded-full border ${language === lang ? 'bg-[#1d61a1] text-white border-[#1d61a1]' : 'border-gray-300 text-gray-600'}`}>
                {lang === 'sq' ? 'Shq' : lang === 'en' ? 'Eng' : 'Srb'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prototype notice */}
      <div className="bg-amber-50 border-b border-amber-200 py-1 px-4 text-center">
        <p className="text-amber-700 text-xs">
          ⚠️ Hackathon Prototype – Not an official eKosova system
        </p>
      </div>
    </header>
  )
}

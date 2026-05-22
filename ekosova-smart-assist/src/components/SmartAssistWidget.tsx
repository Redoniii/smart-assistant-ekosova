import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { searchServices } from '../utils/search'
import { streamCitizenAnswer } from '../utils/openai'
import { saveSupportRequest, addSearchHistory, generateRequestId } from '../utils/storage'
import type { SearchResult } from '../types'

const BLUE = '#1d61a1'

const CHIPS = ['certifikatë lindjes', 'vendbanim', 'letërnjoftim', 'ndihmë sociale', 'biznes']

export default function SmartAssistWidget() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiDone, setAiDone] = useState(false)
  const [aiError, setAiError] = useState('')
  const [escalated, setEscalated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const top = results[0] ?? null

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  function runSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    const hits = searchServices(trimmed)
    setQuery(trimmed)
    setResults(hits)
    setSearched(true)
    setAiText('')
    setAiDone(false)
    setAiError('')
    setEscalated(false)
    addSearchHistory(trimmed)

    if (hits.length > 0) {
      streamCitizenAnswer(
        trimmed,
        hits[0].service,
        (chunk) => setAiText((prev) => prev + chunk),
        () => setAiDone(true),
        (err) => setAiError(err)
      )
    }
  }

  function handleEscalate() {
    if (!top) return
    saveSupportRequest({
      id: generateRequestId(),
      citizenQuestion: query,
      matchedServiceId: top.service.id,
      matchedServiceTitle: top.service.title,
      searchQuery: query,
      simpleMode: false,
      helpRequested: true,
      timestamp: new Date().toISOString(),
      status: 'new',
      confidence: top.confidence,
    })
    setEscalated(true)
  }

  function handleEscalateNoResult() {
    saveSupportRequest({
      id: generateRequestId(),
      citizenQuestion: query,
      matchedServiceId: '',
      matchedServiceTitle: 'E panjohur',
      searchQuery: query,
      simpleMode: false,
      helpRequested: true,
      timestamp: new Date().toISOString(),
      status: 'new',
      confidence: 'low',
    })
    setEscalated(true)
  }

  function reset() {
    setQuery('')
    setResults([])
    setSearched(false)
    setAiText('')
    setAiDone(false)
    setAiError('')
    setEscalated(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat panel ── */}
      {open && (
        <div className="w-[360px] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-black/8 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">

          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 shrink-0"
            style={{ background: `linear-gradient(135deg, ${BLUE}, #7cc5d7)` }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">🤖</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Smart Assist</p>
              <p className="text-white/70 text-xs">eKosova · Ndihmë 24/7</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white text-sm transition-colors shrink-0"
            >✕</button>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-3 pb-2.5 border-b border-gray-100 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); runSearch(query) }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Çfarë shërbimi ju nevojitet?…"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d61a1] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="px-4 py-2 text-white text-sm font-semibold rounded-xl disabled:opacity-40 transition-opacity"
                style={{ background: BLUE }}
              >
                Kërko
              </button>
            </form>

            {/* Quick-pick chips */}
            {!searched && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CHIPS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); runSearch(s) }}
                    className="px-2.5 py-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">

            {/* ── Empty state ── */}
            {!searched && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Shkruani pyetjen tuaj dhe<br />do t'ju ndihmojmë të gjeni<br />shërbimin e duhur.
                </p>
              </div>
            )}

            {/* ── No results ── */}
            {searched && results.length === 0 && !escalated && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-sm text-gray-500 mb-4">
                  Nuk u gjet shërbim për <strong>"{query}"</strong>.
                </p>
                <button
                  onClick={handleEscalateNoResult}
                  className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl"
                  style={{ background: BLUE }}
                >
                  🎧 Pyesni një agjent
                </button>
              </div>
            )}

            {/* ── Escalated (no-result path) ── */}
            {searched && results.length === 0 && escalated && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mt-2">
                <p className="text-sm font-semibold text-green-700">✓ Kërkesa u dërgua te agjenti!</p>
                <p className="text-xs text-green-600 mt-1">Një agjent do t'ju ndihmojë së shpejti.</p>
                <Link to="/agent" className="text-xs font-medium mt-2 block" style={{ color: BLUE }}>
                  Shko te paneli i agjentit →
                </Link>
              </div>
            )}

            {/* ── Results ── */}
            {searched && results.length > 0 && top && (
              <div className="space-y-3">

                {/* Service card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${BLUE}14`, color: BLUE }}
                  >
                    {top.service.category}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mt-1.5 mb-1">{top.service.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{top.service.simpleDescription}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    {top.service.estimatedTime}
                  </p>
                </div>

                {/* AI answer */}
                <div
                  className="rounded-xl border p-3"
                  style={{ background: `${BLUE}06`, borderColor: `${BLUE}22` }}
                >
                  <p className="text-xs font-bold tracking-wide mb-2" style={{ color: BLUE }}>🤖 SMART ASSIST</p>
                  {aiError ? (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2 leading-relaxed">{aiError}</p>
                  ) : aiText ? (
                    <p className="text-xs text-gray-800 leading-relaxed">
                      {aiText}
                      {!aiDone && (
                        <span className="inline-block w-0.5 h-3.5 bg-[#1d61a1] ml-0.5 animate-pulse align-middle" />
                      )}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: `${BLUE}30`, borderTopColor: BLUE }}
                      />
                      <span className="text-xs text-gray-400">Po mendoj…</span>
                    </div>
                  )}
                </div>

                {/* Escalate / Success */}
                {escalated ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-green-700">✓ Kërkesa u dërgua te agjenti!</p>
                    <p className="text-xs text-green-600 mt-0.5">Një agjent do t'ju ndihmojë së shpejti.</p>
                    <Link to="/agent" className="text-xs font-medium mt-2 block" style={{ color: BLUE }}>
                      Shko te paneli i agjentit →
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEscalate}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    🎧 Nuk jam i sigurt — Lidhu me agjentin
                  </button>
                )}

                {/* New question */}
                <button
                  onClick={reset}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  ← Pyetje tjetër
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FAB button ── */}
      <div className="relative">
        {/* Pulse ring when closed */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: BLUE }}
          />
        )}
        <button
          onClick={() => (open ? setOpen(false) : handleOpen())}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${BLUE}, #7cc5d7)` }}
          title="Smart Assist — eKosova"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

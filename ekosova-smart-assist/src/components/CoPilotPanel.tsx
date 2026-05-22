import { useState, useEffect, useRef } from 'react'
import {
  Bot, Check, Clipboard, AlertTriangle, MessageSquare, CheckCircle2,
  HelpCircle, Target, RotateCcw, ArrowUp, X, Smartphone, Mail,
  ChevronRight, Zap, PhoneCall,
} from 'lucide-react'
import type { SupportRequest } from '../types'
import { getServiceById } from '../utils/search'
import { updateRequestStatus } from '../utils/storage'
import { useToast } from '../context/ToastContext'
import ConfidenceBadge from './ConfidenceBadge'
import MarkdownText from './MarkdownText'
import {
  streamCoPilotAnalysis,
  streamFollowUp,
  parseAnalysis,
  type CoPilotAnalysis,
  type FollowUpMessage,
} from '../utils/openai'

interface CoPilotPanelProps {
  request: SupportRequest
  onClose: () => void
  onStatusChange: () => void
}

type AIState = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

export default function CoPilotPanel({ request, onClose, onStatusChange }: CoPilotPanelProps) {
  const service = getServiceById(request.matchedServiceId)
  const { showToast } = useToast()
  const [status, setStatus] = useState(request.status)

  const [aiState, setAiState] = useState<AIState>('idle')
  const [streamedText, setStreamedText] = useState('')
  const [analysis, setAnalysis] = useState<CoPilotAnalysis | null>(null)
  const [aiError, setAiError] = useState('')
  const streamRef = useRef(false)
  const streamBoxRef = useRef<HTMLDivElement>(null)

  const [followUps, setFollowUps] = useState<FollowUpMessage[]>([])
  const [followUpInput, setFollowUpInput] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const followUpEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!service || streamRef.current) return
    streamRef.current = true
    runAnalysis()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function runAnalysis() {
    if (!service) return
    setAiState('loading')
    setStreamedText('')
    setAnalysis(null)
    setAiError('')
    let buffer = ''

    streamCoPilotAnalysis(
      request.citizenQuestion,
      service,
      (chunk) => {
        buffer += chunk
        setStreamedText(buffer)
        setAiState('streaming')
        if (streamBoxRef.current) streamBoxRef.current.scrollTop = streamBoxRef.current.scrollHeight
      },
      (fullText) => {
        setAnalysis(parseAnalysis(fullText))
        setAiState('done')
      },
      (err) => {
        setAiError(err)
        setAiState('error')
      }
    )
  }

  const handleRetry = () => {
    streamRef.current = true
    setFollowUps([])
    runAnalysis()
  }

  const handleSendFollowUp = async () => {
    const q = followUpInput.trim()
    if (!q || followUpLoading || !service) return

    const id = Date.now().toString()
    const newMsg: FollowUpMessage = { id, question: q, answer: '', streaming: true }
    setFollowUps((prev) => [...prev, newMsg])
    setFollowUpInput('')
    setFollowUpLoading(true)
    setTimeout(() => followUpEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    let buffer = ''
    await streamFollowUp(
      request.citizenQuestion,
      service,
      followUps.filter((f) => !f.streaming && f.answer),
      q,
      (chunk) => {
        buffer += chunk
        setFollowUps((prev) => prev.map((m) => (m.id === id ? { ...m, answer: buffer, streaming: true } : m)))
        followUpEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      },
      (fullText) => {
        setFollowUps((prev) => prev.map((m) => (m.id === id ? { ...m, answer: fullText, streaming: false } : m)))
        setFollowUpLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      },
      (err) => {
        setFollowUps((prev) =>
          prev.map((m) => (m.id === id ? { ...m, answer: `Gabim: ${err}`, streaming: false } : m))
        )
        setFollowUpLoading(false)
      }
    )
  }

  const handleCopySuggested = () => {
    const text = analysis?.suggestedAnswer ?? service!.agentTemplate
    navigator.clipboard.writeText(text).then(() => showToast('Përgjigjja u kopjua.', 'success'))
  }

  const handleCopyFollowUp = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Përgjigjja u kopjua.', 'success'))
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(service!.agentTemplate).then(() =>
      showToast('Template u kopjua.', 'success')
    )
  }

  const handleMarkResolved = () => {
    updateRequestStatus(request.id, 'resolved')
    setStatus('resolved')
    onStatusChange()
    showToast('Kërkesa u shënua si e zgjidhur.', 'success')
  }

  const handleMarkInProgress = () => {
    updateRequestStatus(request.id, 'in_progress')
    setStatus('in_progress')
    onStatusChange()
  }

  const handleSimulatedSend = (type: 'sms' | 'email' | 'escalate') => {
    const msgs = {
      sms: 'Simulim: Mesazhi SMS u dërgua te qytetari.',
      email: 'Simulim: Email u dërgua te qytetari.',
      escalate: 'Simulim: Rasti u eskalua te institucioni përgjegjës.',
    }
    showToast(msgs[type], 'info')
  }

  if (!service) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="shrink-0 px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base leading-tight">Co-Pilot</h2>
                {aiState === 'streaming' && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    AI po shkruan…
                  </span>
                )}
                {aiState === 'done' && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full">
                    <Check size={10} />
                    Gati
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs truncate">{service.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(aiState === 'error' || aiState === 'done') && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RotateCcw size={12} />
                Rigjeneroj
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

          {/* ── LEFT: Citizen context + actions ── */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col overflow-y-auto p-4 gap-4 bg-slate-50">

            {/* Citizen question */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <PhoneCall size={12} />
                Pyetja e qytetarit
              </p>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">"{request.citizenQuestion}"</p>
            </div>

            {/* Phone number */}
            {request.citizenPhone && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <PhoneCall size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Telefoni</p>
                  <p className="text-sm font-bold text-emerald-800">{request.citizenPhone}</p>
                </div>
              </div>
            )}

            {/* Service info */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Shërbimi i gjetur</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  ['Titulli', service.title],
                  ['Kategoria', service.category],
                  ['Koha', service.estimatedTime],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between px-4 py-2.5 gap-2">
                    <span className="text-xs text-slate-400 shrink-0">{label}</span>
                    <span className="text-xs font-medium text-slate-700 text-right">{val}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-400">Besueshmëria</span>
                  <ConfidenceBadge confidence={request.confidence} />
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-400">Statusi</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    status === 'new' ? 'bg-blue-100 text-blue-700'
                    : status === 'in_progress' ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {status === 'new' ? 'I ri' : status === 'in_progress' ? 'Në progres' : 'Zgjidhur'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-0.5">Veprime</p>

              {status === 'new' && (
                <button onClick={handleMarkInProgress}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 text-sm font-semibold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
                  <Zap size={14} />
                  Merr në punë
                </button>
              )}
              {status !== 'resolved' && (
                <button onClick={handleMarkResolved}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                  <CheckCircle2 size={14} />
                  Shëno si zgjidhur
                </button>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => handleSimulatedSend('sms')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-slate-600 text-xs font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Smartphone size={12} />
                  SMS
                </button>
                <button onClick={() => handleSimulatedSend('email')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-slate-600 text-xs font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Mail size={12} />
                  Email
                </button>
              </div>
              <button onClick={() => handleSimulatedSend('escalate')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 text-xs font-medium rounded-xl border border-red-200 hover:bg-red-50 transition-colors">
                <AlertTriangle size={12} />
                Eskalim (simulim)
              </button>
            </div>
          </div>

          {/* ── RIGHT: AI Analysis ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Loading */}
              {aiState === 'loading' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Co-Pilot AI po analizon pyetjen…</span>
                  </div>
                  <div className="space-y-2.5">
                    {[90, 70, 85, 55].map((w, i) => (
                      <div key={i} className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming */}
              {aiState === 'streaming' && (
                <div ref={streamBoxRef} className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-72 overflow-y-auto">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {streamedText}
                    <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                  </pre>
                </div>
              )}

              {/* Error */}
              {aiState === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-1">
                    <AlertTriangle size={16} />
                    Gabim gjatë gjenerimit
                  </div>
                  <p className="text-xs text-red-600">{aiError}</p>
                  {aiError.includes('VITE_OPENAI_API_KEY') && (
                    <p className="text-xs mt-2 text-red-500">
                      Krijo <code className="bg-red-100 px-1 rounded">.env.local</code> me{' '}
                      <code className="bg-red-100 px-1 rounded">VITE_OPENAI_API_KEY=sk-...</code> dhe rinis.
                    </p>
                  )}
                </div>
              )}

              {/* Done — parsed analysis */}
              {aiState === 'done' && analysis && (
                <div className="space-y-3">

                  {/* HERO: Suggested Answer */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white">
                        <MessageSquare size={16} />
                        <span className="text-sm font-bold uppercase tracking-wide opacity-90">Përgjigja e sugjeruar</span>
                      </div>
                      <button
                        onClick={handleCopySuggested}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors backdrop-blur-sm"
                      >
                        <Clipboard size={12} />
                        Kopjo
                      </button>
                    </div>
                    <MarkdownText
                      text={analysis.suggestedAnswer}
                      className="text-base text-white leading-relaxed font-medium"
                    />
                  </div>

                  {/* Key Points */}
                  {analysis.keyPoints.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Pikat kyçe</h4>
                      </div>
                      <ul className="space-y-2">
                        {analysis.keyPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tone Tips */}
                  {analysis.toneTips && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-purple-600" />
                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide">Ton dhe komunikim</h4>
                      </div>
                      <MarkdownText text={analysis.toneTips} className="text-sm text-slate-700 leading-relaxed" />
                    </div>
                  )}

                  {/* Follow-up question chips */}
                  {analysis.followUpQuestions.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <HelpCircle size={14} className="text-amber-600" />
                        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                          Pyetje të mundshme vijuese
                        </h4>
                        <span className="text-xs text-amber-500 font-normal ml-auto">kliko për t'i dërguar</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            disabled={followUpLoading}
                            onClick={() => {
                              setFollowUpInput(q)
                              setTimeout(() => inputRef.current?.focus(), 50)
                            }}
                            className="flex items-center gap-1 text-xs bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 text-left"
                          >
                            <ChevronRight size={10} />
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Static template fallback */}
                  <details className="group">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 select-none list-none flex items-center gap-1.5 py-1">
                      <ChevronRight size={12} className="group-open:rotate-90 transition-transform" />
                      Template statik (backup)
                    </summary>
                    <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500">Template standard</span>
                        <button onClick={handleCopyTemplate}
                          className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-300 transition-colors">
                          <Clipboard size={10} />
                          Kopjo
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 italic leading-relaxed">"{service.agentTemplate}"</p>
                    </div>
                  </details>
                </div>
              )}

              {/* Follow-up thread */}
              {followUps.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                      <MessageSquare size={10} />
                      Pyetje vijuese
                    </span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>

                  {followUps.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="max-w-xs bg-slate-800 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed">
                          {msg.question}
                        </div>
                      </div>
                      <div className="flex justify-start gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={14} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`bg-white border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-700 leading-relaxed ${
                            msg.streaming ? 'border-blue-200' : 'border-slate-200'
                          }`}>
                            {msg.answer
                              ? msg.streaming
                                ? <>{msg.answer}<span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-1 align-middle" /></>
                                : <MarkdownText text={msg.answer} />
                              : <span className="flex items-center gap-1.5 text-slate-400">
                                  <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                  Po shkruan…
                                </span>
                            }
                          </div>
                          {!msg.streaming && msg.answer && (
                            <button
                              onClick={() => handleCopyFollowUp(msg.answer)}
                              className="mt-1 ml-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Clipboard size={10} />
                              Kopjo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div ref={followUpEndRef} />
                </div>
              )}
            </div>

            {/* ── Follow-up input — sticky bottom ── */}
            {(aiState === 'done' || followUps.length > 0) && (
              <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
                <div className={`flex gap-2 items-center border rounded-xl px-3 py-2 transition-colors ${
                  followUpLoading ? 'border-slate-200 bg-slate-50' : 'border-slate-300 bg-white focus-within:border-blue-400'
                }`}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendFollowUp() }
                    }}
                    disabled={followUpLoading || aiState !== 'done'}
                    placeholder={
                      aiState !== 'done'
                        ? 'Prit derisa analiza të përfundojë…'
                        : 'Shkruaj pyetje tjetër nga qytetari…'
                    }
                    className="flex-1 text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendFollowUp}
                    disabled={!followUpInput.trim() || followUpLoading || aiState !== 'done'}
                    className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title="Dërgo (Enter)"
                  >
                    {followUpLoading
                      ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <ArrowUp size={14} />
                    }
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 px-0.5">Enter për të dërguar · Co-Pilot mban kontekstin e bisedës</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

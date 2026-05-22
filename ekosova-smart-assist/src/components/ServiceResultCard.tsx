import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { SearchResult } from '../types'
import ConfidenceBadge from './ConfidenceBadge'
import { useToast } from '../context/ToastContext'
import { saveSupportRequest, generateRequestId, addSearchHistory } from '../utils/storage'

interface ServiceResultCardProps {
  result: SearchResult
  query: string
  isTop?: boolean
}

export default function ServiceResultCard({ result, query, isTop = false }: ServiceResultCardProps) {
  const { service, confidence } = result
  const [simpleMode, setSimpleMode] = useState(false)
  const [helpSent, setHelpSent] = useState(false)
  const [expanded, setExpanded] = useState(isTop)
  const { showToast } = useToast()

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        simpleMode ? service.simpleDescription : service.shortDescription
      )
      utterance.lang = 'sq'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
      showToast('Po lexohet me zë...', 'info')
    } else {
      showToast('Shfletuesi juaj nuk e mbështet leximin me zë', 'error')
    }
  }

  const handleRequestHelp = () => {
    const request = {
      id: generateRequestId(),
      citizenQuestion: query,
      matchedServiceId: service.id,
      matchedServiceTitle: service.title,
      searchQuery: query,
      simpleMode,
      helpRequested: true,
      timestamp: new Date().toISOString(),
      status: 'new' as const,
      confidence,
    }
    saveSupportRequest(request)
    addSearchHistory(query)
    setHelpSent(true)
    showToast('Kërkesa u dërgua te agjenti!', 'success')
  }

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isTop ? 'border-blue-200 shadow-blue-50' : 'border-slate-200'
      }`}
    >
      {/* Header */}
      <div
        className="p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <ConfidenceBadge confidence={confidence} />
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {service.category}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg leading-snug">{service.title}</h3>
            <p className="text-slate-600 text-sm mt-1">
              {simpleMode ? service.simpleDescription : service.shortDescription}
            </p>
          </div>
          <span className="text-slate-400 text-lg shrink-0 mt-1">{expanded ? '▲' : '▼'}</span>
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <span>⏱</span> {service.estimatedTime}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleReadAloud() }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            🔊 Lexoje me zë
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100">
          {/* Documents */}
          <div className="px-5 py-4 bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Dokumentet e nevojshme
            </h4>
            <ul className="space-y-1">
              {service.requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Hapat e procedurës
            </h4>
            <ol className="space-y-2">
              {service.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* FAQs */}
          <div className="px-5 py-4 bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Pyetje të shpeshta
            </h4>
            <div className="space-y-3">
              {service.faqs.map((faq, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-slate-800">❓ {faq.question}</p>
                  <p className="text-sm text-slate-600 mt-0.5 ml-5">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 flex flex-wrap gap-2 border-t border-slate-100">
            <Link
              to={`/service/${service.id}`}
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition-colors"
            >
              Vazhdo te shërbimi →
            </Link>

            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                simpleMode
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {simpleMode ? '✓ Mënyra e thjeshtë aktive' : 'Ma shpjego më thjeshtë'}
            </button>

            {!helpSent ? (
              <button
                onClick={handleRequestHelp}
                className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 text-sm font-medium rounded-xl hover:bg-orange-200 transition-colors"
              >
                🎧 Kërko ndihmë nga agjenti
              </button>
            ) : (
              <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-xl flex items-center gap-2">
                <span>✓</span>
                <span>Kërkesa juaj u dërgua te agjenti.</span>
              </div>
            )}
          </div>

          {helpSent && (
            <div className="mx-5 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
              Agjenti tani e sheh pyetjen tuaj, shërbimin përkatës dhe hapat që ju janë shfaqur.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

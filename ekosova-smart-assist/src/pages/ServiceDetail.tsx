import { useParams, Link } from 'react-router-dom'
import { getServiceById } from '../utils/search'
import { services } from '../data/services'
import { useToast } from '../context/ToastContext'

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()

  const service = id ? getServiceById(id) : null

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h1 className="text-xl font-bold text-slate-800">Shërbimi nuk u gjet</h1>
          <p className="text-slate-500 text-sm mt-1 mb-4">Shërbimi me ID "{id}" nuk ekziston.</p>
          <Link to="/catalog" className="px-4 py-2 bg-blue-700 text-white rounded-xl font-medium">
            Shko te katalogu
          </Link>
        </div>
      </div>
    )
  }

  const relatedServices = service.relatedServices
    .map((rid) => services.find((s) => s.id === rid))
    .filter(Boolean) as typeof services

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(service.agentTemplate).then(() => {
      showToast('Përgjigja u kopjua.', 'success')
    })
  }

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${service.title}. ${service.simpleDescription}. ${service.steps.join('. ')}`
      )
      utterance.lang = 'sq'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
      showToast('Po lexohet me zë…', 'info')
    } else {
      showToast('Shfletuesi juaj nuk e mbështet leximin me zë', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/catalog" className="text-sm text-blue-600 hover:text-blue-800">
              ← Katalogu
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-600 truncate max-w-xs">{service.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReadAloud}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              🔊 Lexo me zë
            </button>
            <Link to="/citizen" className="px-3 py-1.5 bg-blue-700 text-white text-xs font-medium rounded-lg hover:bg-blue-800 transition-colors">
              Apliko tani
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Hero */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {service.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">{service.title}</h1>
              <p className="text-slate-600 leading-relaxed">{service.shortDescription}</p>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 mb-1">💡 Shpjegim i thjeshtë</p>
                <p className="text-sm text-blue-800 leading-relaxed">{service.simpleDescription}</p>
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                <span>⏱ Koha e vlerësuar:</span>
                <span className="font-medium text-slate-700">{service.estimatedTime}</span>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">📎 Dokumentet e nevojshme</h2>
              <ul className="space-y-2">
                {service.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700 p-2 bg-slate-50 rounded-lg">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">📋 Hapat e procedurës</h2>
              <ol className="space-y-3">
                {service.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">❓ Pyetje të shpeshta</h2>
              <div className="space-y-4">
                {service.faqs.map((faq, i) => (
                  <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <p className="font-semibold text-slate-800 text-sm mb-1">
                      {faq.question}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Veprime të shpejta</h3>
              <div className="space-y-2">
                <Link
                  to="/citizen"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
                >
                  Apliko online
                </Link>
                <button
                  onClick={handleReadAloud}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  🔊 Lexo me zë
                </button>
              </div>
            </div>

            {/* Agent template */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700 text-sm">🎧 Template për agjent</h3>
                <button
                  onClick={handleCopyTemplate}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  📋 Kopjo
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{service.agentTemplate}"
                </p>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Fjalë kyçe</h3>
              <div className="flex flex-wrap gap-1.5">
                {service.keywords.slice(0, 8).map((kw) => (
                  <span key={kw} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Related services */}
            {relatedServices.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 text-sm mb-3">Shërbime të ngjashme</h3>
                <div className="space-y-2">
                  {relatedServices.map((rs) => (
                    <Link
                      key={rs.id}
                      to={`/service/${rs.id}`}
                      className="block p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                    >
                      <p className="text-sm font-medium text-slate-800 hover:text-blue-700">{rs.title}</p>
                      <p className="text-xs text-slate-500">{rs.category}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prototype disclaimer */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-xs text-slate-400 text-center">
          ⚠️ Hackathon Prototype – Not an official eKosova system. Të gjitha të dhënat janë simulime.
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Search, Bell, Headphones, X, ClipboardList, Clock,
  FileText, BookOpen, Inbox, Phone, Check, ArrowRight,
} from 'lucide-react'
import AgentSidebar from '../components/AgentSidebar'
import StatsCard from '../components/StatsCard'
import RequestCard from '../components/RequestCard'
import CoPilotPanel from '../components/CoPilotPanel'
import TemplateCard from '../components/TemplateCard'
import { getSupportRequests } from '../utils/storage'
import { searchServices } from '../utils/search'
import { services, agentTemplates, demoRequests } from '../data/services'
import type { SupportRequest } from '../types'
import ConfidenceBadge from '../components/ConfidenceBadge'

export default function AgentDashboard() {
  const [activeSection, setActiveSection] = useState('')
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null)
  const [agentSearch, setAgentSearch] = useState('')
  const [agentSearchResults, setAgentSearchResults] = useState<ReturnType<typeof searchServices>>([])
  const [widgetEscalation, setWidgetEscalation] = useState<{ question: string; service: string } | null>(null)

  const loadRequests = () => {
    const stored = getSupportRequests()
    if (stored.length > 0) {
      setRequests(stored)
    } else {
      setRequests(demoRequests as SupportRequest[])
    }
  }

  useEffect(() => {
    loadRequests()

    function onBridgeMessage(e: MessageEvent) {
      if (e.data?.type === 'EKOSOVA_NEW_TICKET') {
        loadRequests()
      }
    }
    window.addEventListener('message', onBridgeMessage)
    return () => window.removeEventListener('message', onBridgeMessage)
  }, [])

  useEffect(() => {
    if (agentSearch.trim().length > 2) {
      setAgentSearchResults(searchServices(agentSearch))
    } else {
      setAgentSearchResults([])
    }
  }, [agentSearch])

  const newCount = requests.filter((r) => r.status === 'new').length
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AgentSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="Kërko shërbim ose pyetje…"
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            {agentSearchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {agentSearchResults.map((r) => (
                  <button
                    key={r.service.id}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                    onClick={() => { setAgentSearch(r.service.title); setAgentSearchResults([]) }}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.service.title}</p>
                      <p className="text-xs text-slate-500">{r.service.category}</p>
                    </div>
                    <ConfidenceBadge confidence={r.confidence} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-slate-600 font-medium">Agent Demo</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Online</span>
            </div>
            {newCount > 0 && (
              <button
                onClick={() => setActiveSection('requests')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                <Bell size={12} />
                {newCount} të reja
              </button>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Escalation banner */}
          {widgetEscalation && (
            <div className="mb-5 bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Headphones size={20} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Kërkesë e re — nga Smart Assist (rks-gov.net)
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  <span className="font-semibold">Pyetja:</span> "{widgetEscalation.question}"
                </p>
                {widgetEscalation.service && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    <span className="font-medium">Shërbimi i identifikuar:</span> {widgetEscalation.service}
                  </p>
                )}
              </div>
              <button
                onClick={() => setWidgetEscalation(null)}
                className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {(!activeSection || activeSection === '') && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 text-sm">Mirë se vini, Agent Demo. Ju keni {newCount} kërkesa të reja.</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Kërkesa aktive"
                  value={newCount + inProgressCount}
                  subtitle={`${newCount} të reja, ${inProgressCount} në progres`}
                  color="blue"
                  icon={<ClipboardList size={22} />}
                />
                <StatsCard
                  title="Koha mesatare"
                  value="3.2 min"
                  subtitle="Demo impact estimate: -40%"
                  color="green"
                  icon={<Clock size={22} />}
                />
                <StatsCard
                  title="Template të gatshme"
                  value={agentTemplates.length}
                  subtitle="Përgjigje të standardizuara"
                  color="purple"
                  icon={<FileText size={22} />}
                />
                <StatsCard
                  title="Shërbime në katalog"
                  value={services.length}
                  subtitle="60% shpejtësi më e lartë"
                  color="orange"
                  icon={<BookOpen size={22} />}
                />
              </div>

              {/* Demo impact */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-blue-800">Demo Impact Estimates</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Supozime</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-700">-40%</p>
                    <p className="text-xs text-slate-600">Koha e trajtimit të thirrjeve</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">+60%</p>
                    <p className="text-xs text-slate-600">Shpejtësi gjetje shërbimi</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">1x</p>
                    <p className="text-xs text-slate-600">Burim i vetëm i vërtetës</p>
                  </div>
                </div>
              </div>

              {/* Recent requests preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-800">Kërkesat e fundit</h2>
                  <button
                    onClick={() => setActiveSection('requests')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Shiko të gjitha <ArrowRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {requests.slice(0, 3).map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onOpen={(r) => setSelectedRequest(r)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Kërkesat e qytetarëve</h1>
                  <p className="text-slate-500 text-sm">{requests.length} kërkesa gjithsej</p>
                </div>
                <div className="flex gap-2">
                  {(['new', 'in_progress', 'resolved'] as const).map((s) => {
                    const count = requests.filter((r) => r.status === s).length
                    const labels = { new: 'Të reja', in_progress: 'Në progres', resolved: 'Zgjidhur' }
                    return (
                      <span key={s} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {labels[s]}: {count}
                      </span>
                    )
                  })}
                </div>
              </div>
              {requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <Inbox size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-700">Nuk ka kërkesa aktualisht</p>
                  <p className="text-slate-400 text-sm mt-1">Kërkesat nga qytetarët do të shfaqen këtu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onOpen={(r) => setSelectedRequest(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'templates' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-800">Template të standardizuara</h1>
                <p className="text-slate-500 text-sm">Kopjojini dhe përdorni në bisedë me qytetarët</p>
              </div>
              <div className="space-y-3">
                {agentTemplates.map((tmpl) => (
                  <TemplateCard key={tmpl.id} template={tmpl} />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'stats' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-800">Statistika</h1>
                <p className="text-slate-500 text-sm">Demo impact estimates – jo të dhëna reale</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatsCard title="Thirrje totale sot" value="47" color="blue" icon={<Phone size={22} />} />
                <StatsCard title="Zgjidhur me sukses" value="42" subtitle="89% shkallë zgjidhje" color="green" icon={<Check size={22} />} />
                <StatsCard title="Koha mesatare thirrje" value="3.2 min" subtitle="Nga 5.4 min (-40%)" color="purple" icon={<Clock size={22} />} />
                <StatsCard title="Template të kopjuara" value="28" subtitle="Sot" color="orange" icon={<ClipboardList size={22} />} />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-800 mb-4">Shërbimet më të kërkuara</h2>
                <div className="space-y-3">
                  {services.slice(0, 5).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{s.title}</span>
                          <span className="text-xs text-slate-500">{Math.floor(30 - i * 5)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${30 - i * 5}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Co-Pilot Panel */}
      {selectedRequest && (
        <CoPilotPanel
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={loadRequests}
        />
      )}
    </div>
  )
}

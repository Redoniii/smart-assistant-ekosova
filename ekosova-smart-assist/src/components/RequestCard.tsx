import { Phone } from 'lucide-react'
import type { SupportRequest } from '../types'
import ConfidenceBadge from './ConfidenceBadge'

const statusLabels: Record<SupportRequest['status'], string> = {
  new: 'I ri',
  in_progress: 'Në progres',
  resolved: 'Zgjidhur',
}

const statusColors: Record<SupportRequest['status'], string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

interface RequestCardProps {
  request: SupportRequest
  onOpen: (request: SupportRequest) => void
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Tani'
  if (diffMin < 60) return `${diffMin} min më parë`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} orë më parë`
  return date.toLocaleDateString('sq-AL')
}

export default function RequestCard({ request, onOpen }: RequestCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onOpen(request)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[request.status]}`}>
              {statusLabels[request.status]}
            </span>
            <ConfidenceBadge confidence={request.confidence} />
            {request.simpleMode && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                Mënyra e thjeshtë
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 truncate">
            "{request.citizenQuestion}"
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Shërbimi: <span className="font-medium text-slate-700">{request.matchedServiceTitle}</span>
          </p>
          {request.citizenPhone && (
            <p className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-1.5">
              <Phone size={11} />
              {request.citizenPhone}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">{formatTime(request.timestamp)}</p>
          <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
            Hap Co-Pilot
          </button>
        </div>
      </div>
    </div>
  )
}

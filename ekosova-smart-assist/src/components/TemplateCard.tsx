import { useToast } from '../context/ToastContext'
import type { AgentTemplate } from '../types'

interface TemplateCardProps {
  template: AgentTemplate
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { showToast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content).then(() => {
      showToast('Përgjigjja u kopjua.', 'success')
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {template.category}
          </span>
          <h4 className="font-semibold text-slate-800 mt-1">{template.title}</h4>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
        >
          📋 Kopjo
        </button>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
        "{template.content}"
      </p>
    </div>
  )
}

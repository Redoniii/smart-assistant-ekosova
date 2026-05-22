interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low'
}

const labels = {
  high: 'Përputhje e lartë',
  medium: 'Përputhje mesatare',
  low: 'Duhet verifikuar',
}

const colors = {
  high: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-red-100 text-red-700 border-red-200',
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[confidence]}`}
    >
      <span>{confidence === 'high' ? '●' : confidence === 'medium' ? '◐' : '○'}</span>
      {labels[confidence]}
    </span>
  )
}

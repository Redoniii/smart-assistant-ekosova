import type { ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[0].startsWith('**')) {
      nodes.push(<strong key={m.index}>{m[2]}</strong>)
    } else {
      nodes.push(<em key={m.index}>{m[3]}</em>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export default function MarkdownText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/)

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l !== '')

        const isBulletBlock = lines.length > 0 && lines.every((l) => /^[-•*]\s/.test(l))
        if (isBulletBlock) {
          return (
            <ul key={bi} className={`list-disc list-inside space-y-1 pl-1 ${bi > 0 ? 'mt-2' : ''}`}>
              {lines.map((line, li) => (
                <li key={li}>{renderInline(line.replace(/^[-•*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={bi} className={bi > 0 ? 'mt-2' : ''}>
            {lines.flatMap((line, li) => [
              ...renderInline(line),
              li < lines.length - 1 ? <br key={`br${li}`} /> : null,
            ])}
          </p>
        )
      })}
    </div>
  )
}

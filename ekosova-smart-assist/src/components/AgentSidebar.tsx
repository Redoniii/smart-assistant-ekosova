import { useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/agent', icon: '▣' },
  { label: 'Kërkesat e qytetarëve', path: '/agent#requests', icon: '📋' },
  { label: 'Katalogu i shërbimeve', path: '/catalog', icon: '📚' },
  { label: 'Templates', path: '/agent#templates', icon: '📝' },
  { label: 'Statistika', path: '/agent#stats', icon: '📊' },
]

interface AgentSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export default function AgentSidebar({ activeSection, onSectionChange }: AgentSidebarProps) {
  const location = useLocation()

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col text-white shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">eK</span>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-white text-sm">eKosova</div>
            <div className="text-blue-400 text-xs font-medium">Agent Co-Pilot</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const section = item.path.includes('#') ? item.path.split('#')[1] : item.label.toLowerCase()
          const isActive =
            item.path === '/agent'
              ? location.pathname === '/agent' && !activeSection
              : activeSection === section || location.pathname === item.path

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.path.startsWith('/agent')) {
                  const sec = item.path.includes('#') ? item.path.split('#')[1] : ''
                  onSectionChange?.(sec)
                } else {
                  window.location.href = item.path
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <div className="px-3 py-2 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-500">Hackathon Prototype</p>
          <p className="text-xs text-slate-600">Not an official eKosova system</p>
        </div>
      </div>
    </aside>
  )
}

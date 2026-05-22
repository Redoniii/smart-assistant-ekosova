import { useState } from 'react'
import { Link } from 'react-router-dom'
import { services } from '../data/services'
import { getAllCategories } from '../utils/search'

export default function ServiceCatalog() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const categories = getAllCategories()

  const filtered = services.filter((s) => {
    const matchesCategory = category === 'all' || s.category === category
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      s.keywords.some((k) => k.includes(q))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/ekosova-logo.svg" className="h-8 w-auto" alt="eKosova" />
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-medium text-slate-600">Katalogu i Shërbimeve</span>
          </div>
          <div className="flex items-center gap-2">
<Link to="/agent" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Dashboard agent
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Katalogu i Shërbimeve</h1>
          <p className="text-slate-500 mt-2">Të gjitha shërbimet publike të disponueshme në eKosova</p>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko shërbim…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                category === 'all'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Të gjitha ({services.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  category === cat
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          {filtered.length} shërbim(e) gjetur
          {(search || category !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCategory('all') }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Pastro filtrat ✕
            </button>
          )}
        </p>

        {/* Service grid */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group flex flex-col"
              >
                <div className="flex-1">
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {service.category}
                  </span>
                  <h3 className="font-bold text-slate-800 mt-2 mb-1 group-hover:text-blue-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {service.shortDescription}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span>⏱ {service.estimatedTime}</span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Documente kryesore:</p>
                    <ul className="space-y-0.5">
                      {service.requiredDocuments.slice(0, 2).map((doc, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="text-green-500">✓</span> {doc}
                        </li>
                      ))}
                      {service.requiredDocuments.length > 2 && (
                        <li className="text-xs text-slate-400">
                          +{service.requiredDocuments.length - 2} të tjera
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <Link
                    to={`/service/${service.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-700 text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    Shiko detajet
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="font-bold text-slate-800">Nuk u gjet asnjë shërbim</h3>
            <p className="text-slate-500 text-sm mt-1">Provoni fjalë të tjera ose hiqni filtrat</p>
          </div>
        )}
      </div>
    </div>
  )
}

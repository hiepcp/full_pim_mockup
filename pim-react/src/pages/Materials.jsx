import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'
import { useFilter } from '../store/useFilter.js'

const AFFECTED_PRODUCTS = [
  { id: '30317', name: '30317 Forma Lounge Chair', meta: '3 Mother V · 116 SO Variants', status: 'Published', icon: 'ti-armchair', iconBg: 'bg-brand-50', iconColor: 'text-brand-600' },
  { id: '30318', name: '30318 Forma Side Table', meta: '1 Mother V · 24 SO Variants', status: 'Published', icon: 'ti-table-column', iconBg: 'bg-brand-50', iconColor: 'text-brand-600' },
  { id: '30512', name: '30512 Bergen Coffee Table', meta: '4 Mother V · 48 SO Variants', status: 'Published', icon: 'ti-coffee', iconBg: 'bg-brand-50', iconColor: 'text-brand-600' },
  { id: '30401', name: '30401 Nordvik Archive Shelf', meta: '2 Mother V · 18 SO Variants', status: 'Draft', icon: 'ti-box', iconBg: 'bg-stone-100', iconColor: 'text-stone-400' },
  { id: '30605', name: '30605 Fjord Three-Seat Sofa', meta: '2 Mother V · 32 SO Variants', status: 'In Review', icon: 'ti-sofa', iconBg: 'bg-brand-50', iconColor: 'text-brand-600' },
]

const SPECS = [
  { label: 'Type', value: 'Hardwood' },
  { label: 'Species', value: 'Quercus alba' },
  { label: 'Origin', value: 'Pacific Northwest, USA' },
  { label: 'Grade', value: 'A (Select & Better)' },
  { label: 'Thickness', value: '18mm / 22mm / 30mm', tabnum: true },
  { label: 'Finish options', value: 'Oiled, Lacquered, Raw' },
  { label: 'Certification', value: 'FSC-C012345 · PEFC' },
  { label: 'Janka hardness', value: '1360 lbf', tabnum: true },
]

const USAGE_BY_CATEGORY = [
  { label: 'Sofas & Armchairs', count: 18, pct: 38 },
  { label: 'Dining & Tables', count: 14, pct: 30 },
  { label: 'Wardrobes & Shelving', count: 9, pct: 19 },
  { label: 'Outdoor Furniture', count: 4, pct: 8 },
  { label: 'Lighting & Accessories', count: 2, pct: 4 },
]

const CHANGE_LOG = [
  { icon: 'ti-edit', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', title: 'Status → Phasing Out', date: '10 Mar 2025 · Lars Supply Chain', note: '"Supplier confirmed last batch Q3 2025."' },
  { icon: 'ti-certificate', iconBg: 'bg-brand-50', iconColor: 'text-brand-600', title: 'FSC Certificate renewed', date: '02 Jan 2025 · Erik Olsen' },
  { icon: 'ti-plus', iconBg: 'bg-stone-100', iconColor: 'text-stone-400', title: 'Added 30mm thickness option', date: '15 Aug 2023 · Anja Hofer' },
  { icon: 'ti-link', iconBg: 'bg-stone-100', iconColor: 'text-stone-400', title: 'Linked to 12 new products', date: '03 Mar 2023 · BOM Team' },
  { icon: 'ti-check', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', title: 'Material created', date: '14 Jan 2022 · Erik Olsen' },
]

const TYPE_FILTERS = ['All', 'Wood', 'Textile', 'Leather', 'Metal', 'Stone']

function statusBadge(status) {
  if (status === 'Published') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Draft') return 'bg-stone-100 text-stone-500'
  if (status === 'In Review') return 'bg-blue-50 text-blue-700'
  return 'bg-stone-100 text-stone-500'
}

function materialStatusDot(status) {
  if (status === 'active') return 'bg-emerald-500'
  if (status === 'phasing-out') return 'bg-amber-500'
  if (status === 'discontinued') return 'bg-red-500'
  return 'bg-stone-400'
}

function MaterialSwatch({ material, size = 'md', rounded = 'md', className = '' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-[88px] h-[88px]' }
  const radius = `rounded-${rounded}`
  const sizeClass = sizes[size] || sizes.md
  const inner = material?.imageUrl ? (
    <img src={material.imageUrl} alt={material?.name || ''} className="w-full h-full object-cover" />
  ) : material?.colorHex ? (
    <span className="w-full h-full block" style={{ background: material.colorHex }}></span>
  ) : (
    <div className="w-full h-full swatch-oak flex items-center justify-center">
      <i className="ti ti-texture text-stone-300/70 text-base"></i>
    </div>
  )
  return (
    <div className={`${sizeClass} ${radius} shrink-0 border border-black/10 overflow-hidden bg-stone-50 ${className}`}>
      {inner}
    </div>
  )
}

export default function Materials() {
  const { state, addMaterial, updateMaterial, deleteMaterial } = useData()
  const { query, setQuery, activeFilter, setActiveFilter, filtered } = useFilter(
    state.materials,
    ['name', 'code', 'supplier'],
    'category'
  )

  const [selectedMaterialId, setSelectedMaterialId] = useState('WOODWO-003')
  const [isDiscontinueModalOpen, setIsDiscontinueModalOpen] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})

  function openAdd() {
    setEditItem(null)
    setForm({})
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({ ...item })
    setShowModal(true)
  }

  function handleSave() {
    if (editItem) {
      updateMaterial(form)
    } else {
      addMaterial(form)
    }
    setShowModal(false)
  }

  function handleDelete(item) {
    if (window.confirm('Delete this item?')) {
      deleteMaterial(item.id)
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(prev => ({ ...prev, imageUrl: ev.target.result }))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Group filtered materials by status
  const activeMats = filtered.filter(m => m.status === 'active')
  const phasingOutMats = filtered.filter(m => m.status === 'phasing-out')
  const discontinuedMats = filtered.filter(m => m.status === 'discontinued')
  const obsoleteMats = filtered.filter(m => m.status === 'obsolete')

  const selectedMaterial = state.materials.find(m => m.id === selectedMaterialId)

  return (
    <Layout>
      <div className="flex flex-col min-h-screen">

        {/* TOPBAR */}
        <header
          className="sticky top-0 z-20 bg-white border-b border-black/10 px-6 h-12 flex items-center justify-between gap-4"
          style={{ animation: 'fadeUp 0.2s ease both' }}
        >
          <nav className="flex items-center gap-1.5 text-[12px] text-stone-500">
            <Link to="/products" className="hover:text-brand-600 transition-colors">Catalogue</Link>
            <i className="ti ti-chevron-right text-[11px] text-stone-300"></i>
            <span className="font-medium text-stone-800">Materials</span>
          </nav>
          <div className="flex items-center gap-2">
            <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-700 border border-black/10 hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5">
              <i className="ti ti-download text-sm"></i> Export report
            </button>
            <button
              onClick={openAdd}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5"
            >
              <i className="ti ti-plus text-sm"></i> New Material
            </button>
          </div>
        </header>

        {/* STATS BAR */}
        <div
          className="px-6 py-3 bg-white border-b border-black/10 flex items-center gap-6"
          style={{ animation: 'fadeUp 0.2s ease both', animationDelay: '0.05s' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[22px] font-bold tabnum text-stone-900">{state.materials.length}</span>
            <span className="text-xs text-stone-500">total materials</span>
          </div>
          <div className="w-px h-6 bg-black/10"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold tabnum text-emerald-700">{state.materials.filter(m => m.status === 'active').length}</span>
            <span className="text-xs text-stone-400">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-sm font-semibold tabnum text-amber-700">{state.materials.filter(m => m.status === 'phasing-out').length}</span>
            <span className="text-xs text-stone-400">Phasing Out</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-sm font-semibold tabnum text-red-700">{state.materials.filter(m => m.status === 'discontinued').length}</span>
            <span className="text-xs text-stone-400">Discontinued</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-400"></span>
            <span className="text-sm font-semibold tabnum text-stone-500">{state.materials.filter(m => m.status === 'obsolete').length}</span>
            <span className="text-xs text-stone-400">Obsolete</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
            <i className="ti ti-alert-triangle text-amber-500 text-sm"></i>
            <span className="text-xs font-medium text-amber-700">3 materials Phasing Out affect 56 products — review needed</span>
          </div>
        </div>

        {/* MASTER-DETAIL SPLIT */}
        <div
          className="flex flex-1 overflow-hidden"
          style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.1s' }}
        >

          {/* LEFT: MATERIAL LIST */}
          <aside className="w-[272px] shrink-0 bg-white border-r border-black/10 flex flex-col overflow-hidden">

            {/* Search + filter */}
            <div className="p-3 border-b border-black/10 space-y-2">
              <div className="relative">
                <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-black/10 rounded-lg outline-none focus:border-brand-400 focus:bg-white transition-colors placeholder:text-stone-400"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {TYPE_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                      activeFilter === f
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">

              {/* Section: Active */}
              {activeMats.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active · {activeMats.length}
                  </div>
                  {activeMats.map(mat => (
                    <div
                      key={mat.id}
                      onClick={() => setSelectedMaterialId(mat.id)}
                      className={`px-3 py-2.5 cursor-pointer border-l-2 transition-all ${
                        selectedMaterialId === mat.id
                          ? 'bg-brand-50 border-brand-600'
                          : 'border-transparent hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MaterialSwatch material={mat} size="sm" rounded="md" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-stone-800 leading-tight">{mat.name}</div>
                          <div className="text-[10px] text-stone-400 tabnum">{mat.code} · {mat.category} · {mat.linkedProducts} products</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(mat) }}
                            className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-brand-600 transition-colors"
                            title="Edit"
                          >
                            <i className="ti ti-edit text-xs"></i>
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(mat) }}
                            className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <i className="ti ti-trash text-xs"></i>
                          </button>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Section: Phasing Out */}
              {phasingOutMats.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animation: 'pulse 2s ease-in-out infinite' }}></span> Phasing Out · {phasingOutMats.length}
                  </div>
                  {phasingOutMats.map(mat => (
                    <div
                      key={mat.id}
                      onClick={() => setSelectedMaterialId(mat.id)}
                      className={`px-3 py-2.5 cursor-pointer border-l-2 transition-all ${
                        selectedMaterialId === mat.id
                          ? 'bg-brand-50 border-brand-600'
                          : 'border-transparent bg-amber-50/40 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={selectedMaterialId === mat.id ? 'ring-2 ring-brand-400 rounded-md' : ''}>
                          <MaterialSwatch material={mat} size="sm" rounded="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-stone-900 leading-tight">{mat.name}</div>
                          <div className="text-[10px] text-stone-500 tabnum">
                            {mat.code} · {mat.category} · <span className="font-semibold text-amber-700">{mat.linkedProducts} products</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(mat) }}
                            className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-brand-600 transition-colors"
                            title="Edit"
                          >
                            <i className="ti ti-edit text-xs"></i>
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(mat) }}
                            className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <i className="ti ti-trash text-xs"></i>
                          </button>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5" style={{ animation: 'pulse 2s ease-in-out infinite' }}></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Section: Discontinued */}
              {discontinuedMats.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Discontinued · {discontinuedMats.length}
                  </div>
                  {discontinuedMats.map(mat => (
                    <div
                      key={mat.id}
                      onClick={() => setSelectedMaterialId(mat.id)}
                      className={`px-3 py-2.5 cursor-pointer border-l-2 transition-all bg-red-50/30 ${
                        selectedMaterialId === mat.id
                          ? 'bg-brand-50 border-brand-600'
                          : 'border-transparent hover:bg-red-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="opacity-60">
                          <MaterialSwatch material={mat} size="sm" rounded="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-stone-500 leading-tight line-through decoration-stone-400">{mat.name}</div>
                          <div className="text-[10px] text-stone-400 tabnum">{mat.code} · {mat.category} · {mat.linkedProducts} products ⚠</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(mat) }}
                            className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-brand-600 transition-colors"
                            title="Edit"
                          >
                            <i className="ti ti-edit text-xs"></i>
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(mat) }}
                            className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <i className="ti ti-trash text-xs"></i>
                          </button>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-0.5"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Section: Obsolete */}
              {obsoleteMats.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span> Obsolete · {obsoleteMats.length}
                  </div>
                  {obsoleteMats.map(mat => (
                    <div
                      key={mat.id}
                      onClick={() => setSelectedMaterialId(mat.id)}
                      className={`px-3 py-2.5 cursor-pointer border-l-2 transition-all opacity-50 ${
                        selectedMaterialId === mat.id
                          ? 'bg-brand-50 border-brand-600 opacity-100'
                          : 'border-transparent hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="grayscale">
                          <MaterialSwatch material={mat} size="sm" rounded="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-stone-400 leading-tight">{mat.name}</div>
                          <div className="text-[10px] text-stone-400 tabnum">{mat.code} · {mat.category} · {mat.linkedProducts} products</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(mat) }}
                            className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-brand-600 transition-colors"
                            title="Edit"
                          >
                            <i className="ti ti-edit text-xs"></i>
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(mat) }}
                            className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <i className="ti ti-trash text-xs"></i>
                          </button>
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 ml-0.5"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center text-xs text-stone-400">No materials match your search.</div>
              )}

              <div className="h-6"></div>
            </div>
          </aside>

          {/* RIGHT: DETAIL PANEL */}
          <main
            className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{ animation: 'fadeIn 0.3s ease both', animationDelay: '0.15s' }}
          >

            {/* MATERIAL HEADER CARD */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-5">
              <div className="flex items-start gap-5">

                {/* Large swatch / image */}
                <MaterialSwatch material={selectedMaterial} size="xl" rounded="xl" className="shadow-md" />

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div>
                      <h1 className="text-lg font-bold text-stone-900 leading-tight">
                        {selectedMaterial?.name || 'American White Oak'}
                      </h1>
                      <div className="text-sm text-stone-500 mt-0.5 tabnum">
                        {selectedMaterial?.code || 'WOODWO-003'} &nbsp;·&nbsp; {selectedMaterial?.category || 'Wood'} &nbsp;·&nbsp; Grade A &nbsp;·&nbsp; FSC Certified
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {selectedMaterial?.status === 'phasing-out' && (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animation: 'pulse 2s ease-in-out infinite' }}></span>
                          Phasing Out
                        </span>
                      )}
                      {selectedMaterial?.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      )}
                      {selectedMaterial?.status === 'discontinued' && (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Discontinued
                        </span>
                      )}
                      {selectedMaterial?.status === 'obsolete' && (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                          Obsolete
                        </span>
                      )}
                      {selectedMaterial?.linkedProducts > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                          <i className="ti ti-alert-triangle text-sm"></i> {selectedMaterial.linkedProducts} products affected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
                    {selectedMaterial?.supplier && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <i className="ti ti-building-factory2 text-stone-400 text-sm"></i>
                        <span>Supplier: <span className="text-stone-700 font-medium">{selectedMaterial.supplier}</span></span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <i className="ti ti-certificate text-stone-400 text-sm"></i>
                      <span>FSC-C012345 · PEFC</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <i className="ti ti-calendar text-stone-400 text-sm"></i>
                      <span>Added Jan 2022 &nbsp;·&nbsp; Updated 10 Mar 2025</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <i className="ti ti-user text-stone-400 text-sm"></i>
                      <span>Owner: <span className="text-stone-700 font-medium">Erik Olsen</span></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => selectedMaterial && openEdit(selectedMaterial)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 border border-black/10 text-stone-700 hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <i className="ti ti-edit text-sm"></i> Edit
                  </button>
                  <button
                    onClick={() => setIsDiscontinueModalOpen(true)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <i className="ti ti-ban text-sm"></i> Discontinue
                  </button>
                </div>
              </div>

              {/* Warning note */}
              {selectedMaterial?.status === 'phasing-out' && (
                <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                  <i className="ti ti-info-circle text-amber-500 text-sm mt-0.5 shrink-0"></i>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-semibold">Phasing Out</span> — When this material transitions to Discontinued, all linked assets and products will be automatically flagged. New designs must not use this material. Notify Design &amp; BOM Team before Q4 2025.
                  </p>
                </div>
              )}
            </div>

            {/* LIFECYCLE TIMELINE */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-stone-800">Lifecycle history</h2>
                <button className="text-xs text-brand-600 hover:underline">Update status</button>
              </div>

              {/* Timeline */}
              <div className="relative pb-2">
                {/* Connector lines */}
                <div className="absolute top-[18px] left-[18px] h-[2px] bg-emerald-500" style={{ width: 'calc(33% - 18px)' }}></div>
                <div className="absolute top-[18px] h-[2px] bg-amber-400" style={{ left: '33%', width: '15%' }}></div>
                <div className="absolute top-[18px] h-[2px] bg-stone-200" style={{ left: '48%', right: 'calc(25% + 18px)' }}></div>

                <div className="grid grid-cols-4 gap-0">

                  {/* Step 1: Added */}
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-0 mb-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-md z-10">
                        <i className="ti ti-plus text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="pr-3">
                      <div className="text-[11px] font-semibold text-emerald-700 leading-tight">Added to system</div>
                      <div className="text-[11px] font-bold text-stone-800 mt-0.5">Active</div>
                      <div className="text-[10px] text-stone-400 mt-1 leading-snug">Jan 14, 2022</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Erik Olsen</div>
                      <div className="text-[10px] text-stone-400 mt-1 italic">Grade A sourcing approved. Initial BOM integration complete.</div>
                    </div>
                  </div>

                  {/* Step 2: Phasing Out - CURRENT */}
                  <div className="flex flex-col items-start">
                    <div className="flex items-center mb-3">
                      <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shadow-md z-10 ring-4 ring-amber-100">
                        <i className="ti ti-alert-triangle text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="pr-3">
                      <div className="text-[11px] font-semibold text-amber-700 leading-tight">Status updated</div>
                      <div className="text-[11px] font-bold text-stone-800 mt-0.5">Phasing Out ← now</div>
                      <div className="text-[10px] text-stone-400 mt-1 leading-snug">Mar 10, 2025</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Lars Supply Chain</div>
                      <div className="text-[10px] text-stone-400 mt-1 italic">Supplier ending production. Last batch Q3 2025.</div>
                    </div>
                  </div>

                  {/* Step 3: Discontinued (planned) */}
                  <div className="flex flex-col items-start opacity-50">
                    <div className="flex items-center mb-3">
                      <div className="w-9 h-9 rounded-full bg-stone-200 border-2 border-dashed border-stone-400 flex items-center justify-center z-10">
                        <i className="ti ti-ban text-stone-400 text-sm"></i>
                      </div>
                    </div>
                    <div className="pr-3">
                      <div className="text-[11px] font-semibold text-stone-500 leading-tight">Planned</div>
                      <div className="text-[11px] font-bold text-stone-600 mt-0.5">Discontinued</div>
                      <div className="text-[10px] text-stone-400 mt-1 leading-snug">Target: Q4 2025</div>
                      <div className="text-[10px] text-stone-400 mt-1 italic">Requires Design &amp; BOM Team sign-off.</div>
                    </div>
                  </div>

                  {/* Step 4: Obsolete (future) */}
                  <div className="flex flex-col items-start opacity-30">
                    <div className="flex items-center mb-3">
                      <div className="w-9 h-9 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center z-10">
                        <i className="ti ti-archive text-stone-300 text-sm"></i>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-stone-400 leading-tight">Future</div>
                      <div className="text-[11px] font-bold text-stone-400 mt-0.5">Obsolete</div>
                      <div className="text-[10px] text-stone-300 mt-1">No longer tracked</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* TWO-COLUMN: Affected Products + Substitute Materials */}
            <div className="grid grid-cols-2 gap-4">

              {/* AFFECTED PRODUCTS */}
              <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-stone-800">Affected products</h2>
                    <span className="rounded-md px-1.5 py-0.5 text-[11px] font-bold bg-red-50 text-red-700 tabnum">47</span>
                  </div>
                  <Link to="/products" className="text-xs text-brand-600 hover:underline">View all →</Link>
                </div>

                <div className="space-y-1">
                  {AFFECTED_PRODUCTS.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer group"
                    >
                      <div className={`w-7 h-7 rounded-md ${product.iconBg} flex items-center justify-center shrink-0`}>
                        <i className={`ti ${product.icon} ${product.iconColor} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-stone-800 leading-tight truncate">{product.name}</div>
                        <div className="text-[10px] text-stone-400">{product.meta}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${statusBadge(product.status)}`}>{product.status}</span>
                        <i className="ti ti-chevron-right text-stone-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 tabnum">Showing 5 of 47 products</span>
                  <button className="text-[11px] text-brand-600 hover:underline">Load more</button>
                </div>
              </div>

              {/* SUGGESTED SUBSTITUTES */}
              <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-stone-800">Suggested substitutes</h2>
                    <span className="rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-brand-50 text-brand-600">3 options</span>
                  </div>
                  <button className="text-xs text-brand-600 hover:underline">Compare all →</button>
                </div>

                <div className="space-y-3">

                  {/* Substitute 1 - Best match */}
                  <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 cursor-pointer hover:border-emerald-400 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg shrink-0 swatch-ash"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-stone-800">European Walnut</span>
                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">Best match</span>
                        </div>
                        <div className="text-[10px] text-stone-500 tabnum mt-0.5">WWWNT-001 · Grade A · FSC Certified</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-check text-emerald-500 text-xs"></i> Same grade A
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-check text-emerald-500 text-xs"></i> FSC Certified
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-check text-emerald-500 text-xs"></i> In stock
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-minus text-stone-400 text-xs"></i> Similar appearance
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-700 font-medium">Price delta: comparable</span>
                          <button className="text-[11px] font-medium text-brand-600 hover:underline">Apply to all 47 products →</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Substitute 2 */}
                  <div className="border border-black/10 rounded-xl p-3.5 cursor-pointer hover:border-brand-300 hover:bg-brand-50/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg shrink-0 swatch-beech"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-stone-800">European Beech</span>
                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-600">Grade B</span>
                        </div>
                        <div className="text-[10px] text-stone-500 tabnum mt-0.5">WWEUR-004 · Grade B · PEFC Certified</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-check text-emerald-500 text-xs"></i> In stock
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-alert-triangle text-amber-500 text-xs"></i> Grade B (lower)
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-minus text-stone-400 text-xs"></i> Similar grain pattern
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-amber-700 font-medium">Price delta: +8%</span>
                          <button className="text-[11px] font-medium text-brand-600 hover:underline">Review specs →</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Substitute 3 */}
                  <div className="border border-black/10 rounded-xl p-3.5 cursor-pointer hover:border-brand-300 hover:bg-brand-50/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg shrink-0"
                        style={{ background: 'repeating-linear-gradient(85deg,#c4a060 0px,#c4a060 2px,#b49050 3px,#bc9858 9px,#c4a060 10px,#c4a060 16px,#a47c40 17px,#b48c50 22px)' }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-stone-800">European Oak</span>
                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-600">Grade A</span>
                        </div>
                        <div className="text-[10px] text-stone-500 tabnum mt-0.5">WWOAK-002 · Grade A · FSC Certified</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-check text-emerald-500 text-xs"></i> Grade A · FSC
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-alert-triangle text-amber-500 text-xs"></i> 6-week lead time
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1">
                            <i className="ti ti-check text-emerald-500 text-xs"></i> Similar appearance
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-amber-700 font-medium">Price delta: +15%</span>
                          <button className="text-[11px] font-medium text-brand-600 hover:underline">Review specs →</button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* MATERIAL SPECS + USAGE + CHANGE LOG */}
            <div className="grid grid-cols-3 gap-4">

              {/* Specs */}
              <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
                <h2 className="text-sm font-semibold text-stone-800 mb-3">Material specs</h2>
                <dl className="space-y-2">
                  {SPECS.map(spec => (
                    <div key={spec.label} className="flex justify-between text-xs">
                      <dt className="text-stone-500">{spec.label}</dt>
                      <dd className={`font-medium text-stone-800 ${spec.tabnum ? 'tabnum' : ''}`}>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Usage breakdown */}
              <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
                <h2 className="text-sm font-semibold text-stone-800 mb-3">Usage by category</h2>
                <div className="space-y-2.5">
                  {USAGE_BY_CATEGORY.map(cat => (
                    <div key={cat.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-500">{cat.label}</span>
                        <span className="font-semibold tabnum text-stone-700">{cat.count} products</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full" style={{ width: `${cat.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-black/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Published products</span>
                    <span className="font-bold tabnum text-stone-800">34 / 47</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-stone-500">Draft / In Review</span>
                    <span className="font-bold tabnum text-stone-800">13 / 47</span>
                  </div>
                </div>
              </div>

              {/* Change log */}
              <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
                <h2 className="text-sm font-semibold text-stone-800 mb-3">Change log</h2>
                <div className="space-y-3">
                  {CHANGE_LOG.map((entry, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className={`w-5 h-5 rounded-full ${entry.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <i className={`ti ${entry.icon} ${entry.iconColor} text-[10px]`}></i>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-stone-700">{entry.title}</div>
                        <div className="text-[10px] text-stone-400 tabnum">{entry.date}</div>
                        {entry.note && (
                          <div className="text-[10px] text-stone-400 italic mt-0.5">{entry.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RULES NOTE */}
            <div className="bg-stone-50 border border-black/10 rounded-xl p-4 flex items-start gap-3">
              <i className="ti ti-lock text-stone-400 text-sm mt-0.5 shrink-0"></i>
              <div className="text-xs text-stone-500 leading-relaxed space-y-1">
                <p><span className="font-semibold text-stone-700">Automated rules:</span> When material status → Discontinued, all linked assets and product records are automatically flagged. New product creation with a Discontinued material is blocked.</p>
                <p><span className="font-semibold text-stone-700">Notification:</span> Periodic reports sent to Design &amp; BOM Team when material status changes.</p>
                <p><span className="font-semibold text-stone-700">Substitute workflow:</span> Apply substitute via "Apply to all products" — creates a batch-update task for BOM Team review before committing.</p>
              </div>
            </div>

            <div className="h-4"></div>
          </main>
        </div>
      </div>

      {/* ADD / EDIT MATERIAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
            <h2 className="text-sm font-semibold text-stone-800 mb-4">
              {editItem ? 'Edit Material' : 'New Material'}
            </h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="mat-name" className="block text-xs font-medium text-stone-600 mb-1">Name</label>
                <input
                  id="mat-name"
                  type="text"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. European Walnut"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label htmlFor="mat-code" className="block text-xs font-medium text-stone-600 mb-1">Code</label>
                <input
                  id="mat-code"
                  type="text"
                  value={form.code || ''}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. WWWNT-001"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label htmlFor="mat-category" className="block text-xs font-medium text-stone-600 mb-1">Category</label>
                <select
                  id="mat-category"
                  value={form.category || ''}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                >
                  <option value="">Select category...</option>
                  <option value="Wood">Wood</option>
                  <option value="Textile">Textile</option>
                  <option value="Leather">Leather</option>
                  <option value="Metal">Metal</option>
                  <option value="Stone">Stone</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Surface">Surface</option>
                </select>
              </div>
              <div>
                <label htmlFor="mat-finish" className="block text-xs font-medium text-stone-600 mb-1">Finish</label>
                <input
                  id="mat-finish"
                  type="text"
                  value={form.finish || ''}
                  onChange={e => setForm({ ...form, finish: e.target.value })}
                  placeholder="e.g. Oiled, Lacquered, Raw"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label htmlFor="mat-supplier" className="block text-xs font-medium text-stone-600 mb-1">Supplier</label>
                <input
                  id="mat-supplier"
                  type="text"
                  value={form.supplier || ''}
                  onChange={e => setForm({ ...form, supplier: e.target.value })}
                  placeholder="e.g. Oregon Hardwoods Co."
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label htmlFor="mat-color" className="block text-xs font-medium text-stone-600 mb-1">Color</label>
                <div className="flex items-center gap-3">
                  {form.colorHex && (
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 shrink-0"
                      style={{ background: form.colorHex }}
                    ></span>
                  )}
                  <input
                    id="mat-color"
                    type="color"
                    value={form.colorHex || '#cccccc'}
                    onChange={e => setForm({ ...form, colorHex: e.target.value })}
                    className="w-full border border-black/10 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-400 h-9 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Image</label>
                <div className="flex items-center gap-3">
                  {form.imageUrl ? (
                    <div className="w-16 h-16 rounded-lg border border-black/10 overflow-hidden shrink-0 bg-stone-50">
                      <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-black/15 shrink-0 flex items-center justify-center bg-stone-50">
                      <i className="ti ti-photo text-stone-300 text-xl"></i>
                    </div>
                  )}
                  <div className="flex-1 flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="border border-dashed border-black/20 rounded-lg px-3 py-2 text-xs text-stone-600 hover:border-brand-400 hover:bg-brand-50/30 transition-colors flex items-center justify-center gap-1.5">
                        <i className="ti ti-upload text-sm"></i>
                        {form.imageUrl ? 'Replace image' : 'Upload image'}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {form.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, imageUrl: null }))}
                        className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                        title="Remove image"
                      >
                        <i className="ti ti-trash text-sm"></i>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">PNG, JPG, WebP — stored as data URL for this session.</p>
              </div>
              <div>
                <label htmlFor="mat-status" className="block text-xs font-medium text-stone-600 mb-1">Status</label>
                <select
                  id="mat-status"
                  value={form.status || 'active'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="phasing-out">Phasing Out</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="obsolete">Obsolete</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-stone-600 border border-black/10 rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
              >
                {editItem ? 'Save changes' : 'Add material'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for swatch patterns and mat-item states injected via <style> tag */}
      <style>{`
        .swatch-oak {
          background: repeating-linear-gradient(
            82deg,
            #c8a96e 0px, #c8a96e 2px,
            #b8945c 3px, #c0a068 8px,
            #c8a96e 9px, #c8a96e 14px,
            #a8803c 15px, #b89050 20px
          );
        }
        .swatch-ash {
          background: repeating-linear-gradient(
            88deg,
            #d4c4a0 0px, #d4c4a0 3px,
            #c0b090 4px, #c8b898 10px,
            #d0c0a0 11px, #d0c0a0 18px,
            #b8a880 19px, #c8b890 24px
          );
        }
        .swatch-beech {
          background: repeating-linear-gradient(
            85deg,
            #deb887 0px, #deb887 2px,
            #cca474 3px, #d4ac7c 9px,
            #deb887 10px, #deb887 16px,
            #bc9460 17px, #cca070 22px
          );
        }
        .swatch-pine {
          background: repeating-linear-gradient(
            78deg,
            #e8c890 0px, #e8c890 2px,
            #d4b478 3px, #dcbc80 8px,
            #e4c48c 9px, #e4c48c 15px,
            #c8a064 16px, #d8b070 21px
          );
        }
        .swatch-wool-grey {
          background: repeating-linear-gradient(
            45deg,
            #8a8a8a 0px, #8a8a8a 1px, transparent 1px, transparent 4px,
            #7a7a7a 4px, #7a7a7a 5px, transparent 5px, transparent 8px
          ), #9a9a9a;
        }
        .swatch-wool-teal {
          background: repeating-linear-gradient(
            45deg,
            #2a7a72 0px, #2a7a72 1px, transparent 1px, transparent 4px,
            #1e6860 4px, #1e6860 5px, transparent 5px, transparent 8px
          ), #3a8a82;
        }
        .swatch-brass {
          background: linear-gradient(135deg, #d4aa60 0%, #c09840 30%, #e0c070 55%, #b88c30 80%, #d0a850 100%);
        }
        .swatch-matte-black {
          background: repeating-linear-gradient(
            90deg,
            #2a2a2a 0px, #2a2a2a 2px,
            #1e1e1e 2px, #1e1e1e 5px
          );
        }
        .swatch-stain {
          background: linear-gradient(135deg, #8a9ca0 0%, #7a8c90 40%, #96a8ac 70%, #6a7c80 100%);
        }
        .swatch-sunburst {
          background: linear-gradient(135deg, #f0c040 0%, #e8b030 40%, #f4c850 70%, #d89c20 100%);
        }
      `}</style>
    </Layout>
  )
}

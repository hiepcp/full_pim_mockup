import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'
import { useFilter } from '../store/useFilter.js'

const COMPONENTS = [
  {
    id: '30317',
    name: 'Greenwood Lounge Chair',
    qty: '1 pc',
    status: 'Approved',
    completeness: 92,
    strokeOffset: 7.54,
    strokeColor: '#3B6D11',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=240&h=112&fit=crop&auto=format',
    imageAlt: 'Greenwood Lounge Chair 30317',
    warning: null,
  },
  {
    id: '30318',
    name: 'Greenwood Side Table',
    qty: '1 pc',
    status: 'Approved',
    completeness: 88,
    strokeOffset: 11.31,
    strokeColor: '#3B6D11',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=240&h=112&fit=crop&auto=format',
    imageAlt: 'Greenwood Side Table 30318',
    warning: null,
  },
  {
    id: '30319',
    name: 'Greenwood Floor Lamp',
    qty: '1 pc',
    status: 'Draft',
    completeness: 73,
    strokeOffset: 25.45,
    strokeColor: '#854F0B',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=240&h=112&fit=crop&auto=format',
    imageAlt: 'Greenwood Floor Lamp 30319',
    warning: 'Missing: AI content (15%), 2 docs pending',
  },
  {
    id: '30320',
    name: 'Greenwood Cushion Set',
    qty: '2 pcs',
    status: 'Approved',
    completeness: 95,
    strokeOffset: 4.71,
    strokeColor: '#3B6D11',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=240&h=112&fit=crop&auto=format',
    imageAlt: 'Greenwood Cushion Set 30320',
    warning: null,
  },
]

const CHECKS = [
  {
    pass: true,
    title: 'Set metadata complete',
    description: 'Name, type, description, season — all filled',
    badge: 'Pass',
    badgeClass: 'text-emerald-600 bg-emerald-50',
    rowClass: '',
    iconClass: 'bg-emerald-100',
    icon: 'ti ti-check',
    iconColor: 'text-emerald-600',
  },
  {
    pass: false,
    title: 'All components ≥ 80% complete',
    description: '30319 Greenwood Floor Lamp at 73% — needs 7% more',
    badge: 'Fail',
    badgeClass: 'text-amber-700 bg-amber-100',
    rowClass: 'bg-amber-50/60',
    iconClass: 'bg-amber-100',
    icon: 'ti ti-x',
    iconColor: 'text-amber-600',
  },
  {
    pass: true,
    title: '3 of 4 components approved',
    description: 'Chair, Side Table, Cushion Set approved — Floor Lamp in draft',
    badge: '3/4',
    badgeClass: 'text-amber-600 bg-amber-50',
    rowClass: '',
    iconClass: 'bg-emerald-100',
    icon: 'ti ti-check',
    iconColor: 'text-emerald-600',
  },
  {
    pass: true,
    title: 'Set assets attached',
    description: 'Mood shot + individual item packshots all present',
    badge: 'Pass',
    badgeClass: 'text-emerald-600 bg-emerald-50',
    rowClass: '',
    iconClass: 'bg-emerald-100',
    icon: 'ti ti-check',
    iconColor: 'text-emerald-600',
  },
]

function statusBadgeClass(status) {
  if (status === 'Live') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Draft') return 'bg-stone-100 text-stone-500'
  if (status === 'Approved') return 'bg-brand-50 text-brand-600'
  return 'bg-stone-100 text-stone-500'
}

function typeClass(type) {
  if (type === 'Bundle') return 'text-sky-600 bg-sky-50'
  if (type === 'Campaign') return 'text-violet-600 bg-violet-50'
  if (type === 'Display') return 'text-amber-700 bg-amber-50'
  return 'text-stone-500 bg-stone-100'
}

function completenessBarColor(pct) {
  if (pct >= 90) return 'bg-emerald-500'
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-amber-400'
  return 'bg-stone-300'
}

const STATUS_TABS = ['All', 'Live', 'Draft', 'Approved']

export default function ProductSets() {
  const { state, addProductSet, updateProductSet, deleteProductSet } = useData()
  const { query, setQuery, activeFilter, setActiveFilter, filtered } = useFilter(
    state.productSets,
    ['name', 'code'],
    'status'
  )

  const [selectedSetId, setSelectedSetId] = useState(
    state.productSets.length > 0 ? state.productSets[0].id : null
  )

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})

  const selectedSet = state.productSets.find((s) => s.id === selectedSetId) || state.productSets[0] || null

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
      updateProductSet(form)
    } else {
      addProductSet(form)
    }
    setShowModal(false)
  }

  function handleDelete(item) {
    if (window.confirm('Delete this item?')) {
      deleteProductSet(item.id)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-screen">

        {/* TOPBAR */}
        <header
          className="sticky top-0 z-20 bg-white border-b border-black/10 px-6 h-12 flex items-center justify-between gap-4 animate-fade-up"
        >
          <nav className="flex items-center gap-1.5 text-[12px] text-stone-500">
            <span>Catalogue</span>
            <i className="ti ti-chevron-right text-[11px] text-stone-300"></i>
            <span className="font-medium text-stone-800">Product Sets</span>
          </nav>

          {/* Inline mini-stats */}
          <div className="hidden md:flex items-center gap-4 text-[12px]">
            <span className="text-stone-400">
              Total <span className="tabnum font-semibold text-stone-700 ml-1">{state.productSets.length}</span>
            </span>
            <span className="w-px h-4 bg-stone-200"></span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="tabnum font-semibold">{state.productSets.filter(s => s.status === 'Live').length}</span>
              <span className="text-stone-400 font-normal">published</span>
            </span>
            <span className="flex items-center gap-1 text-brand-600">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
              <span className="tabnum font-semibold">{state.productSets.filter(s => s.status === 'Approved').length}</span>
              <span className="text-stone-400 font-normal">approved</span>
            </span>
            <span className="flex items-center gap-1 text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
              <span className="tabnum font-semibold">{state.productSets.filter(s => s.status === 'Draft').length}</span>
              <span className="text-stone-400 font-normal">draft</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search sets…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs bg-stone-50 border border-black/10 rounded-lg outline-none focus:border-brand-400 focus:bg-white transition-colors w-40 placeholder:text-stone-400"
              />
            </div>
            <button
              onClick={openAdd}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5"
            >
              <i className="ti ti-plus text-sm"></i> New Product Set
            </button>
          </div>
        </header>

        {/* MASTER-DETAIL SPLIT */}
        <div className="flex flex-1 overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>

          {/* LEFT: SET LIST */}
          <aside className="w-[288px] shrink-0 bg-white border-r border-black/10 flex flex-col overflow-hidden">

            {/* Filter tabs */}
            <div className="px-3 py-2.5 border-b border-black/10 flex flex-wrap gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    activeFilter === tab
                      ? 'bg-brand-600 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Set cards list */}
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
              {filtered.map((set) => {
                const isActive = set.id === selectedSetId
                return (
                  <div
                    key={set.id}
                    onClick={() => setSelectedSetId(set.id)}
                    className={`cursor-pointer rounded-xl border px-3 py-3 transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-50 border-brand-400'
                        : 'border-black/[0.08] bg-white hover:bg-[#f7f6f3] hover:border-black/[0.15]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="text-[12px] font-semibold text-stone-900 leading-snug">{set.name}</div>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold shrink-0 mt-0.5 ${statusBadgeClass(set.status)}`}>
                            {set.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 tabnum mt-0.5">
                          {set.code} · {set.productCount} items
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${typeClass(set.category)}`}>
                            {set.category}
                          </span>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(set) }}
                              className="text-[10px] text-brand-600 hover:underline px-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(set) }}
                              className="text-[10px] text-red-500 hover:underline px-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="px-2 pt-4 pb-2 text-center text-[11px] text-stone-400">
                  No sets found
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT: DETAIL PANEL */}
          <main className="flex-1 overflow-y-auto" style={{ animation: 'fadeIn 0.3s ease both', animationDelay: '0.15s' }}>

            {/* SET HEADER */}
            <div className="px-6 pt-5 pb-0">
              <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] overflow-hidden">
                {/* Hero banner */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=160&fit=crop&auto=format"
                    alt="Greenwood Living Room Bundle hero shot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                  {/* Floating status badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {selectedSet ? selectedSet.status : 'Published'}
                    </span>
                  </div>
                  {/* Floating set ID */}
                  <div className="absolute bottom-3 left-4 text-white">
                    <div className="text-[10px] font-mono text-white/70 tabnum">
                      {selectedSet ? selectedSet.code : 'SET-2024-001'}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-lg font-bold text-stone-900 tracking-tight">
                            {selectedSet ? selectedSet.name : 'Greenwood Living Room Bundle'}
                          </h1>
                          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(selectedSet ? selectedSet.status : 'Live')}`}>
                            {selectedSet ? selectedSet.status : 'Live'}
                          </span>
                          <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-700">
                            {selectedSet ? selectedSet.category : 'Bundle'}
                          </span>
                        </div>
                        <div className="text-sm text-stone-500 mt-0.5">
                          A natural living room bundle in treated oak — designed for spaces of 20–35 m².
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400 tabnum">
                          <span className="flex items-center gap-1"><i className="ti ti-calendar text-xs"></i> SS 2025</span>
                          <span className="flex items-center gap-1">
                            <i className="ti ti-clock text-xs"></i>
                            Updated {selectedSet ? selectedSet.updatedAt : '18 Mar 2025'}
                          </span>
                          <span className="flex items-center gap-1"><i className="ti ti-user text-xs"></i> Hugo Claes</span>
                          <span className="flex items-center gap-1"><i className="ti ti-file-text text-xs"></i> iPaper</span>
                          <span className="flex items-center gap-1"><i className="ti ti-world text-xs"></i> Web</span>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5">
                        <i className="ti ti-copy text-sm"></i> Clone
                      </button>
                      <button
                        onClick={() => selectedSet && openEdit(selectedSet)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium border border-brand-200 text-brand-600 hover:bg-brand-50 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5"
                      >
                        <i className="ti ti-pencil text-sm"></i> Edit
                      </button>
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-400 cursor-not-allowed flex items-center gap-1.5"
                        disabled
                        title="Floor lamp completeness < 80%"
                      >
                        <i className="ti ti-world-upload text-sm"></i> Re-publish
                      </button>
                    </div>
                  </div>

                  {/* Completeness summary bar */}
                  <div className="mt-4 pt-4 border-t border-black/10 flex items-center gap-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold tabnum text-amber-600">73%</span>
                      <span className="text-xs text-stone-400">set completeness</span>
                    </div>
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                        style={{ width: '73%' }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1">
                      <i className="ti ti-alert-triangle text-sm"></i>
                      <span>30319 Floor Lamp at 73% — needs 7% to unlock publish</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPONENT CARDS STRIP */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-stone-800">
                  Components <span className="ml-1.5 text-xs font-normal text-stone-400 tabnum">4 items</span>
                </h2>
                <button className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                  <i className="ti ti-plus text-xs"></i> Add item
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {COMPONENTS.map((comp) => {
                  const isDraft = comp.status === 'Draft'
                  return (
                    <div
                      key={comp.id}
                      className={`bg-white rounded-xl border shadow-[0_1px_4px_rgba(24,95,165,0.06)] overflow-hidden flex flex-col cursor-pointer transition-all duration-150 hover:shadow-[0_4px_12px_rgba(24,95,165,0.10)] hover:-translate-y-0.5 ${
                        isDraft ? 'border-amber-300' : 'border-black/10 hover:border-brand-400'
                      }`}
                    >
                      <div className={`relative h-28 overflow-hidden ${isDraft ? 'bg-amber-50' : 'bg-stone-100'}`}>
                        <img
                          src={comp.image}
                          alt={comp.imageAlt}
                          className={`w-full h-full object-cover ${isDraft ? 'opacity-80' : ''}`}
                        />
                        {isDraft && (
                          <>
                            <div className="absolute inset-0 bg-amber-400/10"></div>
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm rounded px-1.5 py-0.5">
                              <i className="ti ti-alert-triangle text-white text-[10px]"></i>
                              <span className="text-[10px] font-semibold text-white">Draft</span>
                            </div>
                          </>
                        )}
                        {/* SVG ring overlay */}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-0.5 shadow-sm">
                          <svg width="32" height="32" viewBox="0 0 36 36">
                            <circle
                              cx="18" cy="18" r="15"
                              fill="none"
                              stroke="#e7e5e4"
                              strokeWidth="3"
                            />
                            <circle
                              cx="18" cy="18" r="15"
                              fill="none"
                              stroke={comp.strokeColor}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray="94.25"
                              strokeDashoffset={comp.strokeOffset}
                              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <div>
                          <div className="text-[12px] font-semibold text-stone-800 leading-tight">{comp.name}</div>
                          <div className="text-[10px] text-stone-400 tabnum mt-0.5">{comp.id} · {comp.qty}</div>
                        </div>
                        <div className="mt-auto">
                          {isDraft ? (
                            <>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-stone-500">In progress</span>
                                <span className="text-[11px] tabnum font-bold text-amber-700">{comp.completeness}%</span>
                              </div>
                              <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 leading-snug">
                                {comp.warning}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                                {comp.status}
                              </span>
                              <span className="text-[11px] tabnum font-bold text-emerald-600">{comp.completeness}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* PUBLISH READINESS + SET METADATA */}
            <div className="px-6 pt-4 grid grid-cols-5 gap-4">

              {/* Publish readiness checklist */}
              <div className="col-span-3 bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-stone-800">Publish readiness</h2>
                  <span className="text-xs text-stone-400">3 / 4 checks passed</span>
                </div>

                <div className="space-y-1">
                  {CHECKS.map((check, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-100 hover:bg-[#f7f6f3] ${check.rowClass}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${check.iconClass}`}>
                        <i className={`${check.icon} ${check.iconColor} text-[11px]`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-stone-700">{check.title}</div>
                        <div className={`text-[11px] ${check.pass ? 'text-stone-400' : 'text-amber-700'}`}>{check.description}</div>
                      </div>
                      <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${check.badgeClass}`}>
                        {check.badge}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-black/10">
                  <div className="flex items-start gap-2 text-xs text-stone-500 leading-relaxed">
                    <i className="ti ti-lock text-stone-400 mt-0.5 shrink-0"></i>
                    <span>
                      A set inherits completeness from its <strong className="text-stone-700">lowest-scoring component</strong>. Publish is blocked until all components reach ≥ 80% and are Approved.
                    </span>
                  </div>
                </div>
              </div>

              {/* Set metadata + channels */}
              <div className="col-span-2 space-y-3">

                {/* Metadata */}
                <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
                  <h3 className="text-[12px] font-semibold text-stone-700 mb-3">Set details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <dt className="text-stone-400">Set ID</dt>
                      <dd className="font-mono font-medium text-stone-700 tabnum">
                        {selectedSet ? selectedSet.code : 'SET-2024-001'}
                      </dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-stone-400">Category</dt>
                      <dd>
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-sky-50 text-sky-700">
                          {selectedSet ? selectedSet.category : 'Living Room'}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-stone-400">Season</dt>
                      <dd className="font-medium text-stone-700">SS 2025</dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-stone-400">Components</dt>
                      <dd className="font-semibold tabnum text-stone-700">
                        {selectedSet ? selectedSet.productCount : 4} items
                      </dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-stone-400">Created by</dt>
                      <dd className="font-medium text-stone-700">Hugo Claes</dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-stone-400">Last updated</dt>
                      <dd className="tabnum text-stone-500">
                        {selectedSet ? selectedSet.updatedAt : '18 Mar 2025'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Publish channels */}
                <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
                  <h3 className="text-[12px] font-semibold text-stone-700 mb-3">Published to</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-stone-600">
                        <i className="ti ti-file-text text-stone-400 text-sm"></i> iPaper catalogue
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">Live</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-stone-600">
                        <i className="ti ti-world text-stone-400 text-sm"></i> Website REST API
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">Live</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-stone-400">
                        <i className="ti ti-speakerphone text-stone-300 text-sm"></i> Social Campaign
                      </span>
                      <span className="text-[10px] text-stone-400">Not linked</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* QUICK ACTIONS FOOTER */}
            <div className="px-6 pt-3 pb-6">
              <div className="bg-stone-50 rounded-xl border border-black/10 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-stone-500">Next: resolve Floor Lamp completeness to enable publish</span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/products"
                    className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-100 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <i className="ti ti-external-link text-sm"></i> Open 30319
                  </Link>
                  <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 transition-all hover:-translate-y-px active:scale-[0.98] flex items-center gap-1.5">
                    <i className="ti ti-speakerphone text-sm"></i> Create campaign from set
                  </button>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
            <h2 className="text-sm font-semibold text-stone-800 mb-4">
              {editItem ? 'Edit Product Set' : 'New Product Set'}
            </h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="ps-name" className="block text-xs text-stone-500 mb-1">Name</label>
                <input
                  id="ps-name"
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  placeholder="e.g. Greenwood Living Room"
                />
              </div>
              <div>
                <label htmlFor="ps-code" className="block text-xs text-stone-500 mb-1">Code</label>
                <input
                  id="ps-code"
                  type="text"
                  value={form.code || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  placeholder="e.g. SET-2024-001"
                />
              </div>
              <div>
                <label htmlFor="ps-category" className="block text-xs text-stone-500 mb-1">Category</label>
                <input
                  id="ps-category"
                  type="text"
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  placeholder="e.g. Living Room"
                />
              </div>
              <div>
                <label htmlFor="ps-status" className="block text-xs text-stone-500 mb-1">Status</label>
                <select
                  id="ps-status"
                  value={form.status || ''}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                >
                  <option value="">Select status…</option>
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Live">Live</option>
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

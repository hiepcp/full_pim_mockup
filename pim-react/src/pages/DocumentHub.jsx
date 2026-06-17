import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'
import { useFilter } from '../store/useFilter.js'

const STATUS_TABS = [
  { id: 'All',       label: 'All' },
  { id: 'Published', label: 'Published' },
  { id: 'Draft',     label: 'Draft' },
  { id: 'Review',    label: 'Review' },
]

const TYPE_CONFIG = {
  'Assembly':    { icon: 'ti ti-tool',             iconBg: 'bg-amber-50',  iconColor: 'text-amber-600',  badgeClass: 'bg-amber-50 text-amber-700 border border-amber-100' },
  'Care Guide':  { icon: 'ti ti-file-text',         iconBg: 'bg-brand-50',  iconColor: 'text-brand-600',  badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
  'Datasheet':   { icon: 'ti ti-file-description',  iconBg: 'bg-cyan-50',   iconColor: 'text-cyan-600',   badgeClass: 'bg-cyan-50 text-cyan-700 border border-cyan-100' },
  'BOM':         { icon: 'ti ti-list-details',      iconBg: 'bg-violet-50', iconColor: 'text-violet-600', badgeClass: 'bg-violet-50 text-violet-700 border border-violet-100' },
  'Test Report': { icon: 'ti ti-clipboard-check',   iconBg: 'bg-teal-50',   iconColor: 'text-teal-600',   badgeClass: 'bg-teal-50 text-teal-700 border border-teal-100' },
  'Certification':{ icon: 'ti ti-certificate',      iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badgeClass: 'bg-orange-50 text-orange-700 border border-orange-100' },
  'MSDS':        { icon: 'ti ti-package',           iconBg: 'bg-cyan-50',   iconColor: 'text-cyan-600',   badgeClass: 'bg-cyan-50 text-cyan-700 border border-cyan-100' },
}

const STATUS_CONFIG = {
  'Approved':         { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ti ti-circle-check' },
  'In Review':        { cls: 'bg-brand-50 text-brand-600 border border-brand-100',       icon: 'ti ti-eye' },
  'Draft':            { cls: 'bg-stone-100 text-stone-500 border border-stone-200',      icon: 'ti ti-pencil' },
  'Pending customer': { cls: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: 'ti ti-user-check' },
}

const TYPE_BREAKDOWN = [
  { label: 'Assembly',     color: 'bg-amber-400',  dotColor: 'bg-amber-400',  width: '21%', count: 10, delay: '0.5s' },
  { label: 'Datasheet',   color: 'bg-cyan-400',   dotColor: 'bg-cyan-400',   width: '19%', count: 9,  delay: '0.6s' },
  { label: 'Care Guide',  color: 'bg-indigo-400', dotColor: 'bg-indigo-400', width: '17%', count: 8,  delay: '0.55s' },
  { label: 'BOM',         color: 'bg-violet-400', dotColor: 'bg-violet-400', width: '15%', count: 7,  delay: '0.65s' },
  { label: 'Test Report', color: 'bg-teal-400',   dotColor: 'bg-teal-400',   width: '11%', count: 5,  delay: '0.7s' },
  { label: 'Certification',color: 'bg-orange-400',dotColor: 'bg-orange-400', width: '8%',  count: 4,  delay: '0.75s' },
  { label: 'MSDS',        color: 'bg-sky-400',    dotColor: 'bg-sky-400',    width: '9%',  count: 4,  delay: '0.8s' },
]

const RECENT_ACTIVITY = [
  {
    id: 1,
    iconBg: 'bg-emerald-100',
    icon: 'ti ti-circle-check',
    iconColor: 'text-emerald-600',
    text: <><span className="font-medium">Erik O.</span> approved <span className="font-medium text-stone-800">Care Guide — Full-Grain Leather Upholstery v2.0</span></>,
    time: '10 Mar 2025, 14:32',
  },
  {
    id: 2,
    iconBg: 'bg-brand-100',
    icon: 'ti ti-upload',
    iconColor: 'text-brand-600',
    text: <><span className="font-medium">Anja H.</span> uploaded <span className="font-medium text-stone-800">Technical Datasheet — Nordvik Archive Shelf v1.4</span> for review</>,
    time: '08 Mar 2025, 09:14',
  },
  {
    id: 3,
    iconBg: 'bg-violet-100',
    icon: 'ti ti-refresh',
    iconColor: 'text-violet-600',
    text: <><span className="font-medium">D365 Sync</span> updated <span className="font-medium text-stone-800">BOM — Forma Lounge Chair</span> to v5.2</>,
    time: '07 Mar 2025, 02:00 (auto)',
  },
  {
    id: 4,
    iconBg: 'bg-stone-100',
    icon: 'ti ti-pencil',
    iconColor: 'text-stone-500',
    text: <><span className="font-medium">Hugo C.</span> created draft <span className="font-medium text-stone-800">FSC Chain of Custody Certificate v1.0</span></>,
    time: '05 Mar 2025, 11:50',
  },
  {
    id: 5,
    iconBg: 'bg-amber-100',
    icon: 'ti ti-user-check',
    iconColor: 'text-amber-600',
    text: <><span className="font-medium">Lars V.</span> sent <span className="font-medium text-stone-800">MSDS — Marble Surface Cleaner v2.1</span> to customer for review</>,
    time: '03 Mar 2025, 16:05',
  },
]

const EMPTY_FORM = { name: '', type: 'Assembly', language: 'EN', version: '', format: 'PDF', productSku: '', status: 'Draft' }

export default function DocumentHub() {
  const { state, addDocument, updateDocument, deleteDocument } = useData()
  const { query, setQuery, activeFilter, setActiveFilter, filtered } = useFilter(
    state.documents,
    ['name', 'productSku', 'type'],
    'status'
  )

  const [selectedRowId, setSelectedRowId] = useState(3)
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function openAdd() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({
      ...item,
      productSku: Array.isArray(item.productSku) ? item.productSku.join(', ') : (item.productSku || ''),
    })
    setShowModal(true)
  }

  function handleSave() {
    const payload = {
      ...form,
      productSku: form.productSku
        ? String(form.productSku).split(',').map(s => s.trim()).filter(Boolean)
        : [],
    }
    if (editItem) {
      updateDocument({ ...payload, id: editItem.id })
    } else {
      addDocument(payload)
    }
    setShowModal(false)
  }

  function handleDelete(item) {
    if (window.confirm('Delete this item?')) {
      deleteDocument(item.id)
    }
  }

  function handleField(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // Map status tab filter — "Review" maps to "In Review" in data
  const displayFiltered = activeFilter === 'Review'
    ? state.documents.filter(d => d.status === 'In Review')
    : filtered

  const totalDocs = state.documents.length
  const approvedCount = state.documents.filter(d => d.status === 'Approved').length
  const reviewCount = state.documents.filter(d => d.status === 'In Review').length
  const draftCount = state.documents.filter(d => d.status === 'Draft').length

  return (
    <Layout>
      {/* TOPBAR */}
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-stone-400">Assets</span>
          <i className="ti ti-chevron-right text-stone-300 text-xs"></i>
          <span className="font-semibold text-stone-800">Document Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 border border-black/10 rounded-lg hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98]">
            <i className="ti ti-filter text-sm"></i> Filter
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-800 transition-all hover:-translate-y-px active:scale-[0.98] shadow-sm"
          >
            <i className="ti ti-upload text-sm"></i> Upload Document
          </button>
          <div className="w-px h-5 bg-black/10 mx-1"></div>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 transition-colors relative">
            <i className="ti ti-bell text-base"></i>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1 p-6 space-y-5">

        {/* PAGE HEADING */}
        <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0s' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-stone-900">Document Hub</h1>
              <p className="text-xs text-stone-500 mt-0.5">Assembly Instructions, Care Guides, Technical Datasheets, Compliance Certificates, Material Safety Data Sheets &amp; more — version-controlled with approval workflow.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1">
              <i className="ti ti-info-circle text-sm"></i>
              Only <strong className="mx-0.5">Approved</strong> documents can be shared or published. No hard delete — all versions retained.
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-4 gap-4" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>

          <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] hover:shadow-[0_4px_14px_rgba(24,95,165,0.10)] hover:-translate-y-px transition-all duration-200 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Total Documents</span>
              <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
                <i className="ti ti-files text-sm text-stone-500"></i>
              </div>
            </div>
            <div className="tabnum text-2xl font-bold text-stone-900">{totalDocs}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Across all types</div>
            <div className="mt-3 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-1 bg-stone-300 rounded-full" style={{ width: '100%', animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.3s' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] hover:shadow-[0_4px_14px_rgba(24,95,165,0.10)] hover:-translate-y-px transition-all duration-200 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Approved</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <i className="ti ti-circle-check text-sm text-emerald-500"></i>
              </div>
            </div>
            <div className="tabnum text-2xl font-bold text-emerald-600">{approvedCount}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Ready to use</div>
            <div className="mt-3 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-1 bg-emerald-400 rounded-full" style={{ width: `${totalDocs ? Math.round(approvedCount / totalDocs * 100) : 0}%`, animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.35s' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] hover:shadow-[0_4px_14px_rgba(24,95,165,0.10)] hover:-translate-y-px transition-all duration-200 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Pending Review</span>
              <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                <i className="ti ti-clock text-sm text-brand-600"></i>
              </div>
            </div>
            <div className="tabnum text-2xl font-bold text-brand-600">{reviewCount}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Awaiting approval</div>
            <div className="mt-3 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-1 bg-brand-400 rounded-full" style={{ width: `${totalDocs ? Math.round(reviewCount / totalDocs * 100) : 0}%`, animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.4s' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] hover:shadow-[0_4px_14px_rgba(24,95,165,0.10)] hover:-translate-y-px transition-all duration-200 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Draft</span>
              <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
                <i className="ti ti-pencil text-sm text-stone-400"></i>
              </div>
            </div>
            <div className="tabnum text-2xl font-bold text-stone-500">{draftCount}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Work in progress</div>
            <div className="mt-3 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-1 bg-stone-300 rounded-full" style={{ width: `${totalDocs ? Math.round(draftCount / totalDocs * 100) : 0}%`, animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.45s' }}></div>
            </div>
          </div>
        </div>

        {/* FILTER TABS + SEARCH */}
        <div className="flex items-center justify-between" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.1s' }}>
          <div className="flex items-center gap-1 bg-white rounded-lg border border-black/10 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id === 'All' ? 'All' : tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeFilter === tab.id || (tab.id === 'All' && activeFilter === 'All')
                    ? 'bg-brand-600 text-white'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 w-52 transition-all"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-black/10 rounded-lg hover:bg-stone-50 transition-all">
              <i className="ti ti-sort-ascending text-sm"></i> Sort
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-black/10 rounded-lg hover:bg-stone-50 transition-all">
              <i className="ti ti-layout-columns text-sm"></i> View
            </button>
          </div>
        </div>

        {/* MAIN TABLE + SIDE PANEL */}
        <div className="flex gap-4" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.15s' }}>

          {/* DOCUMENT TABLE */}
          <div className="flex-1 bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black/10 bg-stone-50">
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600 w-8">
                      <input type="checkbox" className="rounded border-black/20 w-3.5 h-3.5" />
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Document</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Type</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Product / Item</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600 tabnum">Version</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Status</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Format</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Updated</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {displayFiltered.map((doc) => {
                    const isSelected = selectedRowId === doc.id
                    const typeConf = TYPE_CONFIG[doc.type] || TYPE_CONFIG['Assembly']
                    const statusConf = STATUS_CONFIG[doc.status] || STATUS_CONFIG['Draft']
                    const skus = Array.isArray(doc.productSku) ? doc.productSku : [doc.productSku].filter(Boolean)
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedRowId(doc.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-brand-50/50 border-l-2 border-brand-600 hover:bg-brand-50'
                            : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-black/20 w-3.5 h-3.5"
                            checked={isSelected}
                            onChange={() => setSelectedRowId(doc.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg ${typeConf.iconBg} flex items-center justify-center shrink-0`}>
                              <i className={`${typeConf.icon} text-sm ${typeConf.iconColor}`}></i>
                            </div>
                            <div>
                              <div className="font-medium text-stone-800 flex items-center gap-1.5">
                                {doc.name}
                                {doc.status === 'In Review' && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block"
                                    style={{ animation: 'pulse-ring 1.8s ease-out infinite' }}
                                  ></span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-400 mt-0.5">{doc.language} · {doc.size || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`${typeConf.badgeClass} rounded-md px-2 py-0.5 font-medium`}>{doc.type}</span>
                        </td>
                        <td className="px-4 py-3 tabnum">
                          <div className="flex gap-1 flex-wrap">
                            {skus.map((p) => (
                              <span key={p} className="bg-stone-100 text-stone-600 rounded-md px-1.5 py-0.5">{p}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 tabnum font-medium text-stone-700">{doc.version}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 ${statusConf.cls} rounded-md px-2 py-0.5 font-medium`}>
                            <i className={`${statusConf.icon} text-xs`}></i> {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-stone-100 text-stone-600 rounded-md px-1.5 py-0.5 tabnum font-medium">{doc.format}</span>
                        </td>
                        <td className="px-4 py-3 tabnum text-stone-500">{doc.updatedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(doc) }}
                              className="px-2 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(doc) }}
                              className="px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER */}
            <div className="px-4 py-3 border-t border-black/10 flex items-center justify-between bg-stone-50">
              <div className="text-xs text-stone-500">
                Showing <span className="tabnum font-medium text-stone-700">{displayFiltered.length}</span> of <span className="tabnum font-medium text-stone-700">{totalDocs}</span> documents
              </div>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors">
                  <i className="ti ti-chevron-left text-sm"></i>
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-brand-600 text-white'
                        : 'text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors">
                  <i className="ti ti-chevron-right text-sm"></i>
                </button>
              </div>
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="w-[280px] shrink-0 flex flex-col gap-4">

            {/* DOCUMENT PREVIEW CARD */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] overflow-hidden">
              {/* Header */}
              <div className="px-4 pt-3.5 pb-3 border-b border-black/[0.06] flex items-center justify-between">
                <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <i className="ti ti-file-description text-sm text-cyan-500"></i>
                  Document Preview
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-0.5 text-[11px] font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-md hover:bg-brand-100 transition-colors flex items-center gap-1">
                    <i className="ti ti-external-link text-xs"></i> Open
                  </button>
                  <button className="px-2 py-0.5 text-[11px] font-medium text-stone-600 bg-stone-100 rounded-md hover:bg-stone-200 transition-colors flex items-center gap-1">
                    <i className="ti ti-download text-xs"></i>
                  </button>
                </div>
              </div>

              {/* SVG Document Thumbnail */}
              <div className="bg-gradient-to-b from-slate-200 to-slate-300 px-5 py-5 flex justify-center items-center" style={{ minHeight: '200px' }}>
                <div
                  className="relative cursor-pointer"
                  style={{ width: '148px', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'perspective(600px) rotateY(-4deg) translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
                >
                  {/* Shadow pages behind (stack effect) */}
                  <div className="absolute" style={{ top: '4px', left: '4px', width: '148px', borderRadius: '3px', background: '#d1d5db', height: '208px', zIndex: 0 }}></div>
                  <div className="absolute" style={{ top: '2px', left: '2px', width: '148px', borderRadius: '3px', background: '#e5e7eb', height: '208px', zIndex: 1 }}></div>
                  {/* Main page */}
                  <svg
                    viewBox="0 0 148 208"
                    className="relative"
                    style={{ width: '148px', zIndex: 2, borderRadius: '3px', display: 'block', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.22))' }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="148" height="208" fill="white" rx="2"/>
                    <rect width="148" height="36" fill="#185FA5" rx="2"/>
                    <rect y="30" width="148" height="6" fill="#0C447C"/>
                    <rect x="10" y="8" width="72" height="5" fill="white" rx="1.5" opacity="0.92"/>
                    <rect x="10" y="19" width="48" height="3.5" fill="white" rx="1" opacity="0.55"/>
                    <rect x="122" y="7" width="16" height="20" fill="white" rx="2" opacity="0.12"/>
                    <rect x="124" y="9" width="12" height="3" fill="white" rx="1" opacity="0.5"/>
                    <rect x="124" y="14" width="12" height="3" fill="white" rx="1" opacity="0.3"/>
                    <rect x="124" y="19" width="8" height="3" fill="white" rx="1" opacity="0.3"/>
                    <rect x="10" y="44" width="36" height="3.5" fill="#1e293b" rx="1" opacity="0.45"/>
                    <rect x="10" y="52" width="128" height="66" fill="#f8fafc" rx="3" stroke="#e2e8f0" strokeWidth="0.75"/>
                    <rect x="18" y="58" width="2.5" height="52" fill="#94a3b8" rx="1"/>
                    <rect x="127.5" y="58" width="2.5" height="52" fill="#94a3b8" rx="1"/>
                    <rect x="17" y="58" width="114" height="2.5" fill="#475569" rx="1"/>
                    <rect x="17" y="79" width="114" height="2.5" fill="#475569" rx="1"/>
                    <rect x="17" y="100" width="114" height="2.5" fill="#475569" rx="1"/>
                    <rect x="17" y="107" width="114" height="2.5" fill="#475569" rx="1"/>
                    <rect x="21" y="62" width="8" height="17" fill="#CBD5E1" rx="1"/>
                    <rect x="30" y="65" width="6" height="14" fill="#94A3B8" rx="1"/>
                    <rect x="37" y="61" width="10" height="18" fill="#378ADD" rx="1" opacity="0.5"/>
                    <rect x="48" y="64" width="7" height="15" fill="#CBD5E1" rx="1"/>
                    <rect x="21" y="83" width="14" height="17" fill="#E2E8F0" rx="1"/>
                    <rect x="36" y="86" width="8" height="14" fill="#94A3B8" rx="1"/>
                    <rect x="45" y="82" width="6" height="18" fill="#378ADD" rx="1" opacity="0.35"/>
                    <line x1="9" y1="58" x2="9" y2="107" stroke="#378ADD" strokeWidth="0.75"/>
                    <line x1="6" y1="58" x2="12" y2="58" stroke="#378ADD" strokeWidth="0.75"/>
                    <line x1="6" y1="107" x2="12" y2="107" stroke="#378ADD" strokeWidth="0.75"/>
                    <line x1="17" y1="112" x2="131" y2="112" stroke="#378ADD" strokeWidth="0.75"/>
                    <line x1="17" y1="109" x2="17" y2="115" stroke="#378ADD" strokeWidth="0.75"/>
                    <line x1="131" y1="109" x2="131" y2="115" stroke="#378ADD" strokeWidth="0.75"/>
                    <text x="3" y="86" fontSize="5" fill="#378ADD" fontFamily="monospace" fontWeight="600">H</text>
                    <text x="71" y="119.5" fontSize="5" fill="#378ADD" fontFamily="monospace" fontWeight="600" textAnchor="middle">W</text>
                    <rect x="10" y="125" width="48" height="3.5" fill="#1e293b" rx="1" opacity="0.45"/>
                    <line x1="10" y1="133" x2="138" y2="133" stroke="#e2e8f0" strokeWidth="0.5"/>
                    <rect x="10" y="134" width="128" height="10" fill="#EFF6FF" rx="1.5"/>
                    <rect x="10" y="134" width="55" height="10" fill="#DBEAFE" rx="1.5"/>
                    <rect x="12" y="137.5" width="40" height="3" fill="#185FA5" rx="1" opacity="0.55"/>
                    <rect x="69" y="137.5" width="35" height="3" fill="#378ADD" rx="1" opacity="0.45"/>
                    <rect x="10" y="145" width="128" height="9" fill="white" rx="1"/>
                    <rect x="10" y="145" width="55" height="9" fill="#f8fafc"/>
                    <rect x="12" y="148" width="38" height="3" fill="#64748b" rx="1" opacity="0.5"/>
                    <rect x="69" y="148" width="28" height="3" fill="#94a3b8" rx="1" opacity="0.5"/>
                    <rect x="10" y="155" width="128" height="9" fill="#f8fafc" rx="1"/>
                    <rect x="10" y="155" width="55" height="9" fill="#f1f5f9"/>
                    <rect x="12" y="158" width="42" height="3" fill="#64748b" rx="1" opacity="0.5"/>
                    <rect x="69" y="158" width="22" height="3" fill="#94a3b8" rx="1" opacity="0.5"/>
                    <rect x="10" y="165" width="128" height="9" fill="white" rx="1"/>
                    <rect x="10" y="165" width="55" height="9" fill="#f8fafc"/>
                    <rect x="12" y="168" width="35" height="3" fill="#64748b" rx="1" opacity="0.5"/>
                    <rect x="69" y="168" width="32" height="3" fill="#94a3b8" rx="1" opacity="0.5"/>
                    <rect x="10" y="175" width="128" height="9" fill="#f8fafc" rx="1"/>
                    <rect x="10" y="175" width="55" height="9" fill="#f1f5f9"/>
                    <rect x="12" y="178" width="44" height="3" fill="#64748b" rx="1" opacity="0.5"/>
                    <rect x="69" y="178" width="18" height="3" fill="#94a3b8" rx="1" opacity="0.5"/>
                    <line x1="10" y1="196" x2="138" y2="196" stroke="#e2e8f0" strokeWidth="0.5"/>
                    <rect x="10" y="199" width="40" height="2.5" fill="#cbd5e1" rx="1" opacity="0.5"/>
                    <rect x="100" y="199" width="38" height="2.5" fill="#cbd5e1" rx="1" opacity="0.5"/>
                    <text x="74" y="203.5" fontSize="4.5" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">1 / 18</text>
                  </svg>

                  {/* Page controls overlay */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 pointer-events-none" style={{ zIndex: 3 }}>
                    <div className="bg-black/55 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <i className="ti ti-file-text text-[9px]"></i> 18 pages
                    </div>
                  </div>
                </div>
              </div>

              {/* File meta row */}
              <div className="px-4 py-2.5 flex items-center justify-between bg-stone-50 border-t border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-100 tracking-wide">PDF</span>
                  <span className="text-[11px] text-stone-400">2.4 MB · 18 pages</span>
                </div>
                <button className="text-[11px] text-brand-600 hover:underline font-medium">Full view →</button>
              </div>

              {/* Linked products strip */}
              <div className="px-4 py-2.5 border-t border-black/[0.06]">
                <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-2">Linked Products</div>
                <div className="flex gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 bg-stone-50 border border-black/10 rounded-lg px-2 py-1 hover:bg-brand-50 hover:border-brand-200 transition-colors cursor-pointer">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-slate-300 to-slate-400 shrink-0 flex items-center justify-center">
                      <i className="ti ti-box text-[9px] text-white"></i>
                    </div>
                    <span className="tabnum text-[11px] font-medium text-stone-600">30401</span>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-50 border border-black/10 rounded-lg px-2 py-1 hover:bg-brand-50 hover:border-brand-200 transition-colors cursor-pointer">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-stone-300 to-stone-500 shrink-0 flex items-center justify-center">
                      <i className="ti ti-box text-[9px] text-white"></i>
                    </div>
                    <span className="tabnum text-[11px] font-medium text-stone-600">30402</span>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-50 border border-black/10 rounded-lg px-2 py-1 hover:bg-brand-50 hover:border-brand-200 transition-colors cursor-pointer">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-200 to-amber-400 shrink-0 flex items-center justify-center">
                      <i className="ti ti-box text-[9px] text-white"></i>
                    </div>
                    <span className="tabnum text-[11px] font-medium text-stone-600">30403</span>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-50 border border-black/10 rounded-lg px-2 py-1 hover:bg-brand-50 hover:border-brand-200 transition-colors cursor-pointer">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-200 to-cyan-500 shrink-0 flex items-center justify-center">
                      <i className="ti ti-box text-[9px] text-white"></i>
                    </div>
                    <span className="tabnum text-[11px] font-medium text-stone-600">30404</span>
                  </div>
                </div>
              </div>
            </div>

            {/* APPROVAL WORKFLOW */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-stone-700">Approval Workflow</div>
                <span className="bg-brand-50 text-brand-600 border border-brand-100 rounded-md px-2 py-0.5 text-[11px] font-medium">In Review</span>
              </div>
              <div className="text-[11px] text-stone-500 mb-4 pb-3 border-b border-black/[0.06]">Technical Datasheet — Nordvik Archive Shelf · v1.4</div>

              {/* Workflow Steps */}
              <div className="relative flex flex-col gap-0">

                {/* Step 1: Upload done */}
                <div className="flex gap-3 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 z-10 relative">
                      <i className="ti ti-check text-white text-xs font-bold"></i>
                    </div>
                    <div className="w-px flex-1 bg-emerald-200 mt-1"></div>
                  </div>
                  <div className="pt-0.5 pb-1">
                    <div className="text-xs font-semibold text-emerald-700">Upload</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Anja H. · 08 Mar 2025</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">v1.4 uploaded (2.4 MB PDF)</div>
                  </div>
                </div>

                {/* Step 2: In Review — CURRENT */}
                <div className="flex gap-3 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center shrink-0 z-10 relative"
                      style={{ animation: 'pulse-ring 1.8s ease-out infinite' }}
                    >
                      <i className="ti ti-eye text-white text-xs"></i>
                    </div>
                    <div className="w-px flex-1 bg-stone-200 mt-1"></div>
                  </div>
                  <div className="pt-0.5 pb-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-brand-600">In Review</span>
                      <span className="text-[10px] bg-brand-600 text-white rounded px-1 py-0.5 font-medium">NOW</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Assigned: Product &amp; Design Team</div>
                    <div className="mt-1.5 bg-brand-50 border border-brand-100 rounded-md px-2 py-1.5">
                      <div className="text-[11px] text-brand-700 font-medium">Pending review by:</div>
                      <div className="text-[11px] text-stone-600 mt-0.5">· Erik O. (Product Design Lead)</div>
                      <div className="text-[11px] text-stone-600">· Lars V. (Technical Compliance)</div>
                      <div className="text-[11px] text-amber-700 mt-1">Retailer John Lewis sign-off required</div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Approve pending */}
                <div className="flex gap-3 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0 z-10 relative">
                      <i className="ti ti-circle text-stone-400 text-xs"></i>
                    </div>
                    <div className="w-px flex-1 bg-stone-200 mt-1"></div>
                  </div>
                  <div className="pt-0.5 pb-1">
                    <div className="text-xs font-medium text-stone-400">Approve — Design &amp; Compliance</div>
                    <div className="text-[11px] text-stone-300 mt-0.5">Pending</div>
                  </div>
                </div>

                {/* Step 4: Approved / Publish */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                      <i className="ti ti-send text-stone-400 text-xs"></i>
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <div className="text-xs font-medium text-stone-400">Approved → Publish / Share</div>
                    <div className="text-[11px] text-stone-300 mt-0.5">Pending</div>
                  </div>
                </div>
              </div>

              {/* Approve / Reject buttons */}
              <div className="mt-4 pt-3 border-t border-black/[0.06] flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all hover:-translate-y-px active:scale-[0.98]">
                  <i className="ti ti-check mr-1"></i>Approve
                </button>
                <button className="flex-1 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 border border-black/10 rounded-lg hover:bg-stone-200 transition-all">
                  <i className="ti ti-x mr-1"></i>Reject
                </button>
              </div>
            </div>

            {/* METADATA PANEL */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-stone-700">Document Metadata</div>
                <button className="text-[11px] text-brand-600 hover:underline">Edit</button>
              </div>

              <div className="space-y-2.5 text-[11px]">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Type</span>
                  <span className="font-medium text-stone-700 text-right">Technical Datasheet</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Related to</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {['30401', '30402', '30403', '30404'].map((p) => (
                      <span key={p} className="tabnum bg-stone-100 text-stone-600 rounded px-1.5 py-0.5">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Version</span>
                  <span className="tabnum font-semibold text-stone-700">1.4</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Author</span>
                  <span className="font-medium text-stone-700">Anja H.</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Language</span>
                  <span className="font-medium text-stone-700">English</span>
                </div>
                <div className="h-px bg-black/[0.06]"></div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Effective Date</span>
                  <span className="tabnum font-medium text-stone-700">15 Mar 2025</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Expiry Date</span>
                  <span className="tabnum font-medium text-stone-700">15 Mar 2026</span>
                </div>
                <div className="h-px bg-black/[0.06]"></div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Status</span>
                  <span className="bg-brand-50 text-brand-600 border border-brand-100 rounded-md px-1.5 py-0.5 font-medium">In Review</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">File Size</span>
                  <span className="tabnum font-medium text-stone-700">2.4 MB</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-400 shrink-0">Approval</span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-md px-1.5 py-0.5 font-medium">Pending Design &amp; Compliance</span>
                </div>
                <div className="h-px bg-black/[0.06]"></div>
                <div>
                  <span className="text-stone-400 block mb-1">Note</span>
                  <div className="bg-amber-50 border border-amber-100 rounded-md px-2.5 py-2 text-[11px] text-amber-800 leading-relaxed">
                    Retailer John Lewis sign-off required before final approval.
                  </div>
                </div>
              </div>

              {/* Version history */}
              <div className="mt-4 pt-3 border-t border-black/[0.06]">
                <button
                  className="flex items-center gap-1 text-[11px] font-medium text-stone-500 hover:text-brand-600 transition-colors w-full"
                  onClick={() => setIsVersionHistoryOpen(!isVersionHistoryOpen)}
                >
                  <i className="ti ti-history text-sm"></i> Version History
                  <i
                    className="ti ti-chevron-down text-xs ml-auto transition-transform"
                    style={{ transform: isVersionHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  ></i>
                </button>
                {isVersionHistoryOpen && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="tabnum text-[11px] font-semibold text-brand-600 mt-0.5 w-8 shrink-0">v1.4</span>
                      <div>
                        <div className="text-[11px] font-medium text-stone-700">Anja H. — 08 Mar 2025</div>
                        <div className="text-[10px] text-stone-400">Updated load capacity tables and shelf dimensions</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="tabnum text-[11px] font-medium text-stone-400 mt-0.5 w-8 shrink-0">v1.3</span>
                      <div>
                        <div className="text-[11px] text-stone-600">Anja H. — 20 Feb 2025</div>
                        <div className="text-[10px] text-stone-400">Added material safety standards references</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="tabnum text-[11px] font-medium text-stone-400 mt-0.5 w-8 shrink-0">v1.2</span>
                      <div>
                        <div className="text-[11px] text-stone-600">Lars V. — 05 Feb 2025</div>
                        <div className="text-[10px] text-stone-400">Initial approved version — EN 16139 compliance added</div>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <button className="text-[11px] text-brand-600 hover:underline">View full audit log →</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* POLICY NOTICE */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="flex gap-2">
                <i className="ti ti-shield-check text-amber-600 text-base shrink-0 mt-0.5"></i>
                <div>
                  <div className="text-[11px] font-semibold text-amber-800 mb-1">Document Policy</div>
                  <ul className="text-[11px] text-amber-700 space-y-0.5">
                    <li>· Only <strong>Approved</strong> docs can be used or shared.</li>
                    <li>· Always save versions — no hard delete.</li>
                    <li>· BOM auto-syncs from D365; manual edits locked.</li>
                    <li>· Retailer approval needed for Technical Datasheets.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* DOCUMENT TYPE BREAKDOWN */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-stone-700">By Document Type</div>
                <span className="text-[11px] text-stone-400 tabnum">{totalDocs} total</span>
              </div>

              {/* Stacked bar */}
              <div className="flex h-2 rounded-full overflow-hidden mb-4 gap-px">
                <div className="bg-amber-400" style={{ width: '21%', animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.5s' }} title="Assembly: 10"></div>
                <div className="bg-indigo-400" style={{ width: '17%', animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.55s' }} title="Care Guide: 8"></div>
                <div className="bg-cyan-400"   style={{ width: '19%', animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.6s' }}  title="Datasheet: 9"></div>
                <div className="bg-violet-400" style={{ width: '15%', animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.65s' }} title="BOM: 7"></div>
                <div className="bg-teal-400"   style={{ width: '11%', animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.7s' }}  title="Test Report: 5"></div>
                <div className="bg-orange-400" style={{ width: '8%',  animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.75s' }} title="Certification: 4"></div>
                <div className="bg-sky-400"    style={{ width: '9%',  animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.8s' }}  title="MSDS: 4"></div>
              </div>

              <div className="space-y-1.5">
                {TYPE_BREAKDOWN.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`}></div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-1 ${item.color} rounded-full`}
                            style={{ width: item.width, animation: `fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both`, animationDelay: item.delay }}
                          ></div>
                        </div>
                        <span className="tabnum text-[11px] text-stone-400 w-4 text-right">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Storage meter */}
              <div className="mt-4 pt-3 border-t border-black/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-stone-500">Storage Used</span>
                  <span className="tabnum text-[11px] font-medium text-stone-700">1.8 GB <span className="text-stone-400 font-normal">/ 5 GB</span></span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: '36%', background: 'linear-gradient(90deg, #378ADD, #185FA5)', animation: 'fillBar 0.9s cubic-bezier(.22,.68,0,1.2) both', animationDelay: '0.9s' }}
                  ></div>
                </div>
                <div className="text-[10px] text-stone-400 mt-1">36% of plan used · 3.2 GB free</div>
              </div>
            </div>

          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-stone-800">Recent Activity</div>
            <button className="text-xs text-brand-600 hover:underline">View all →</button>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <i className={`${item.icon} ${item.iconColor} text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-stone-700">{item.text}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5 tabnum">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-black/10 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-stone-400">PIM Studio v2.1.0 · &copy; 2026 Forma Studio GmbH</div>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <Link to="/products" className="hover:text-brand-600 transition-colors">Products</Link>
            <Link to="/product-sets" className="hover:text-brand-600 transition-colors">Sets</Link>
            <Link to="/image-engine" className="hover:text-brand-600 transition-colors">Images</Link>
            <Link to="/document-hub" className="hover:text-brand-600 transition-colors text-brand-600 font-medium">Documents</Link>
            <Link to="/social-campaign" className="hover:text-brand-600 transition-colors">Campaigns</Link>
            <Link to="/settings" className="hover:text-brand-600 transition-colors">Settings</Link>
          </div>
        </div>
      </footer>

      {/* UPLOAD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
            <h2 className="text-sm font-semibold text-stone-800 mb-4">
              {editItem ? 'Edit Document' : 'Upload Document'}
            </h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="doc-name" className="block text-xs font-medium text-stone-600 mb-1">Name</label>
                <input
                  id="doc-name"
                  name="name"
                  type="text"
                  value={form.name || ''}
                  onChange={handleField}
                  placeholder="Document name"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="doc-type" className="block text-xs font-medium text-stone-600 mb-1">Type</label>
                  <select
                    id="doc-type"
                    name="type"
                    value={form.type || 'Assembly'}
                    onChange={handleField}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  >
                    {Object.keys(TYPE_CONFIG).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-language" className="block text-xs font-medium text-stone-600 mb-1">Language</label>
                  <select
                    id="doc-language"
                    name="language"
                    value={form.language || 'EN'}
                    onChange={handleField}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  >
                    <option value="EN">EN</option>
                    <option value="DE">DE</option>
                    <option value="FR">FR</option>
                    <option value="NL">NL</option>
                    <option value="SV">SV</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="doc-version" className="block text-xs font-medium text-stone-600 mb-1">Version</label>
                  <input
                    id="doc-version"
                    name="version"
                    type="text"
                    value={form.version || ''}
                    onChange={handleField}
                    placeholder="e.g. v1.0"
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label htmlFor="doc-format" className="block text-xs font-medium text-stone-600 mb-1">Format</label>
                  <select
                    id="doc-format"
                    name="format"
                    value={form.format || 'PDF'}
                    onChange={handleField}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  >
                    <option value="PDF">PDF</option>
                    <option value="XLSX">XLSX</option>
                    <option value="DOCX">DOCX</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="doc-sku" className="block text-xs font-medium text-stone-600 mb-1">Product SKU(s)</label>
                <input
                  id="doc-sku"
                  name="productSku"
                  type="text"
                  value={form.productSku || ''}
                  onChange={handleField}
                  placeholder="e.g. 30317, 30318"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label htmlFor="doc-status" className="block text-xs font-medium text-stone-600 mb-1">Status</label>
                <select
                  id="doc-status"
                  name="status"
                  value={form.status || 'Draft'}
                  onChange={handleField}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                >
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending customer">Pending customer</option>
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
                {editItem ? 'Save Changes' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

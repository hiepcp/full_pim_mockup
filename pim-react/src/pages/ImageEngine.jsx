import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'
import { useFilter } from '../store/useFilter.js'

const webFormats = [
  { dims: '1920 × 1080', label: '16:9 Hero Banner', status: 'generated' },
  { dims: '1920 × 1920', label: '1:1 Square', status: 'generated' },
  { dims: '1080 × 1350', label: '4:5 Portrait', status: 'generating' },
  { dims: '1080 × 1920', label: '9:16 Vertical', status: 'pending' },
]

const printFormats = [
  { dims: '3000 × 3000', label: '1:1 Packshot HQ', status: 'generated' },
  { dims: '3000 × 2000', label: '3:2 Landscape', status: 'generated' },
  { dims: '2480 × 3508', label: 'A4 Portrait · 300 DPI', status: 'pending' },
  { dims: '3508 × 2480', label: 'A4 Landscape · 300 DPI', status: 'pending' },
]

const socialFormats = [
  { dims: '1080 × 1080', label: 'Facebook / Instagram', status: 'generated' },
  { dims: '1080 × 1080', label: 'IG Grid (safe zone)', status: 'generated' },
  { dims: '1080 × 1920', label: 'IG Story / TikTok', status: 'generating' },
  { dims: '1920 × 1080', label: 'LinkedIn Banner', status: 'pending' },
  { dims: '1200 × 628', label: 'LinkedIn Post', status: 'pending' },
  { dims: '1024 × 536', label: 'Pinterest Standard', status: 'pending' },
]

const outputProfiles = [
  { id: 'full', label: 'Full E-Commerce (14 sizes)', desc: 'Web + Print + Social · JPG + WebP' },
  { id: 'social', label: 'Social Only (6 sizes)', desc: 'FB, IG, LinkedIn, Pinterest, TikTok' },
  { id: 'print', label: 'Print Master (4 sizes)', desc: 'HQ TIFF / PNG · 300 DPI · CMYK' },
  { id: 'custom', label: 'Custom Profile…', desc: 'Manually select each format' },
]

const TYPE_TABS = ['All', 'packshot', 'lifestyle', 'detail', 'line-drawing']

const STATUS_CYCLE = { Ready: 'Processing', Processing: 'Error', Error: 'Ready' }

function statusBadgeClasses(status) {
  if (status === 'generated') return 'bg-green-50 text-green-700 border border-green-200'
  if (status === 'generating') return 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
  return 'bg-stone-100 text-stone-500'
}

function StatusBadge({ status }) {
  if (status === 'generated') {
    return (
      <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-green-50 text-green-700 border border-green-200">
        Generated
      </span>
    )
  }
  if (status === 'generating') {
    return (
      <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
        Generating…
      </span>
    )
  }
  return (
    <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-stone-100 text-stone-500">
      Pending
    </span>
  )
}

function FormatRow({ item, accentClass }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between group hover:bg-stone-50 transition-colors">
      <div>
        <div className="text-[12px] font-medium text-stone-700 tabnum">{item.dims}</div>
        <div className="text-[10px] text-stone-400">{item.label}</div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={item.status} />
        {item.status === 'generated' && (
          <button
            className={`opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center ${accentClass}`}
            title="Download"
          >
            <i className="ti ti-download text-xs" />
          </button>
        )}
      </div>
    </div>
  )
}

function AssetStatusBadge({ status }) {
  if (status === 'Ready')
    return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-green-50 text-green-700 border border-green-200">Ready</span>
  if (status === 'Processing')
    return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">Processing</span>
  if (status === 'Error')
    return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-red-50 text-red-700 border border-red-200">Error</span>
  // legacy statuses from JSON (processing / done / failed / queued)
  if (status === 'processing')
    return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-700">Processing</span>
  if (status === 'done')
    return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-green-50 text-green-700">Done</span>
  if (status === 'failed')
    return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-red-50 text-red-700">Failed</span>
  if (status === 'queued')
    return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-stone-100 text-stone-500">Queued</span>
  return <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-stone-100 text-stone-500">{status}</span>
}

export default function ImageEngine() {
  const { state, addAsset, updateAsset, deleteAsset } = useData()

  const { query, setQuery, activeFilter, setActiveFilter, filtered } = useFilter(
    state.assets,
    ['name', 'productSku'],
    'type'
  )

  const [selectedProfile, setSelectedProfile] = useState('full')
  const [isUploadDragging, setIsUploadDragging] = useState(false)
  const [activeJobProgress] = useState(65)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})

  const activeJob = state.processingQueue.find(q => q.status === 'processing')
  const queueItems = state.processingQueue.filter(q => q.status === 'waiting')

  function openAdd() {
    setEditItem(null)
    setForm({ status: 'Ready' })
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({ ...item })
    setShowModal(true)
  }

  function handleSave() {
    if (editItem) {
      updateAsset(form)
    } else {
      addAsset(form)
    }
    setShowModal(false)
  }

  function handleDelete(item) {
    if (window.confirm('Delete this item?')) deleteAsset(item.id)
  }

  function cycleStatus(asset) {
    const next = STATUS_CYCLE[asset.status] || 'Ready'
    updateAsset({ ...asset, status: next })
  }

  return (
    <Layout>
      {/* TOPBAR */}
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors">Assets</a>
          <i className="ti ti-chevron-right text-stone-300 text-xs" />
          <span className="font-medium text-stone-800">Image Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg border border-black/10 hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98]">
            <i className="ti ti-history text-sm" />
            Job History
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg border border-black/10 hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98]">
            <i className="ti ti-adjustments text-sm" />
            Output Profiles
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-800 transition-all hover:-translate-y-px active:scale-[0.98] shadow-sm"
          >
            <i className="ti ti-cloud-upload text-sm" />
            Upload Asset
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 px-6 py-6 space-y-6">

        {/* STATS ROW */}
        <div className="grid grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="bg-white rounded-xl border border-black/10 shadow-card px-5 py-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Master Images</div>
            <div className="text-2xl font-bold tabnum text-stone-900">{state.assets.length}</div>
            <div className="text-[11px] text-stone-400 mt-1">+14 this week</div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card px-5 py-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Variants Generated</div>
            <div className="text-2xl font-bold tabnum text-stone-900">38,419</div>
            <div className="text-[11px] text-stone-400 mt-1">Avg 30.8 per master</div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card px-5 py-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Jobs In Queue</div>
            <div className="text-2xl font-bold tabnum text-amber-600">{state.processingQueue.length}</div>
            <div className="text-[11px] text-stone-400 mt-1">1 processing now</div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card px-5 py-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Storage Used</div>
            <div className="text-2xl font-bold tabnum text-stone-900">184 GB</div>
            <div className="text-[11px] text-stone-400 mt-1">of 500 GB plan</div>
          </div>
        </div>

        {/* UPLOAD DROP ZONE */}
        <div
          className={`bg-white rounded-xl border-2 border-dashed transition-colors cursor-pointer px-8 py-8 flex flex-col items-center justify-center gap-3 animate-fade-up ${isUploadDragging ? 'border-brand-400' : 'border-brand-100 hover:border-brand-400'}`}
          style={{ animationDelay: '0.08s' }}
          onDragOver={(e) => { e.preventDefault(); setIsUploadDragging(true) }}
          onDragLeave={() => setIsUploadDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsUploadDragging(false) }}
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
            <i className="ti ti-cloud-upload text-2xl text-brand-600" />
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-stone-800">
              Drop master images here or{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">browse files</span>
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Supports JPG, PNG, TIFF, WebP · Max 200 MB · Min 2000 × 2000 px recommended
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1"><i className="ti ti-check text-green-500" /> Auto background removal</span>
            <span className="flex items-center gap-1"><i className="ti ti-check text-green-500" /> AI watermark</span>
            <span className="flex items-center gap-1"><i className="ti ti-check text-green-500" /> ICC profile preserve</span>
          </div>
        </div>

        {/* PROCESSING PIPELINE */}
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-800">Processing Pipeline</h2>
            <span className="text-[11px] text-stone-400">Workflow version 2.4 · All jobs run this pipeline</span>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card px-6 py-5">
            <div className="flex items-center gap-0">

              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-2">
                  <i className="ti ti-cloud-upload text-lg text-brand-600" />
                </div>
                <div className="text-[11px] font-semibold text-brand-600 text-center">Upload</div>
                <div className="text-[10px] text-stone-400 text-center mt-0.5">Master Image</div>
                <span className="mt-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-green-50 text-green-700">Done</span>
              </div>

              <div className="flex items-center pb-6 w-8 shrink-0">
                <div className="flex-1 border-t-2 border-dashed border-stone-200" />
                <i className="ti ti-chevron-right text-stone-300 text-xs" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-2">
                  <i className="ti ti-settings text-lg text-amber-600" />
                </div>
                <div className="text-[11px] font-semibold text-amber-700 text-center">Process Image</div>
                <div className="text-[10px] text-stone-400 text-center mt-0.5">Resize · Crop · Enhance · Watermark</div>
                <span className="mt-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-green-50 text-green-700">Done</span>
              </div>

              <div className="flex items-center pb-6 w-8 shrink-0">
                <div className="flex-1 border-t-2 border-dashed border-stone-200" />
                <i className="ti ti-chevron-right text-stone-300 text-xs" />
              </div>

              {/* Step 3 (active) */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center mb-2 animate-pulse">
                  <i className="ti ti-bolt text-lg text-amber-500" />
                </div>
                <div className="text-[11px] font-semibold text-amber-600 text-center">Generate Sizes</div>
                <div className="text-[10px] text-stone-400 text-center mt-0.5">All formats (~30s)</div>
                <span className="mt-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-700 animate-pulse">Processing…</span>
              </div>

              <div className="flex items-center pb-6 w-8 shrink-0">
                <div className="flex-1 border-t-2 border-dashed border-stone-200" />
                <i className="ti ti-chevron-right text-stone-300 text-xs" />
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center mb-2">
                  <i className="ti ti-database text-lg text-stone-400" />
                </div>
                <div className="text-[11px] font-semibold text-stone-400 text-center">Save &amp; Version</div>
                <div className="text-[10px] text-stone-300 text-center mt-0.5">Asset library, CDN</div>
                <span className="mt-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-stone-100 text-stone-400">Pending</span>
              </div>

              <div className="flex items-center pb-6 w-8 shrink-0">
                <div className="flex-1 border-t-2 border-dashed border-stone-200" />
                <i className="ti ti-chevron-right text-stone-300 text-xs" />
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center mb-2">
                  <i className="ti ti-send text-lg text-stone-400" />
                </div>
                <div className="text-[11px] font-semibold text-stone-400 text-center">Publish</div>
                <div className="text-[10px] text-stone-300 text-center mt-0.5">iPaper · API · Social</div>
                <span className="mt-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-stone-100 text-stone-400">Next step</span>
              </div>

            </div>
          </div>
        </div>

        {/* ACTIVE JOB + OUTPUT GRID ROW */}
        <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.13s' }}>

          {/* ACTIVE JOB CARD */}
          <div className="col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-800">Active Job</h2>
              <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">Processing</span>
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-4 space-y-4">
              {/* Thumbnail */}
              <div className="rounded-lg border border-black/10 h-36 relative overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=144&fit=crop&auto=format"
                  alt="30317-lounge-chair-packshot"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-2 right-2 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-white/90 backdrop-blur-sm border border-black/10 text-stone-500 shadow-sm tabnum">
                  5,472 × 3,648 px
                </div>
                <div className="absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-amber-50/90 text-amber-700 border border-amber-200 animate-pulse backdrop-blur-sm">
                  Step 3 / 5
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone-700">
                    {activeJob ? activeJob.name : '30317-lounge-chair-packshot.jpg'}
                  </span>
                  <span className="text-[11px] font-semibold tabnum text-amber-600">
                    {activeJob ? activeJob.progress : activeJobProgress}%
                  </span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full animate-pulse transition-all"
                    style={{ width: `${activeJob ? activeJob.progress : activeJobProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-stone-400">
                  <span className="flex items-center gap-1"><i className="ti ti-clock text-xs" /> Started 2 min ago</span>
                  <span className="tabnum">ETA ~18s</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-stone-50 rounded-lg p-2.5">
                  <div className="text-stone-400 mb-0.5">Product SKU</div>
                  <div className="font-semibold text-stone-700">SKU-30317</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2.5">
                  <div className="text-stone-400 mb-0.5">Format output</div>
                  <div className="font-semibold text-stone-700">JPG + WebP</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2.5">
                  <div className="text-stone-400 mb-0.5">Watermark</div>
                  <div className="font-semibold text-green-700 flex items-center gap-1"><i className="ti ti-check text-xs" /> Enabled</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-2.5">
                  <div className="text-stone-400 mb-0.5">BG Remove</div>
                  <div className="font-semibold text-stone-500">Skipped</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg border border-black/10 hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98]">
                  <i className="ti ti-x text-sm" /> Cancel
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg border border-brand-100 hover:bg-brand-100 transition-all hover:-translate-y-px active:scale-[0.98]">
                  <i className="ti ti-eye text-sm" /> Preview
                </button>
              </div>
            </div>

            {/* Queue */}
            <div className="mt-3">
              <div className="text-[11px] font-medium text-stone-500 mb-2 flex items-center gap-1">
                <i className="ti ti-list text-xs" /> Queue ({queueItems.length} waiting)
              </div>
              <div className="space-y-1.5">
                {queueItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-black/10 px-3 py-2 flex items-center justify-between shadow-card">
                    <div>
                      <div className="text-[12px] font-medium text-stone-700">{item.name}</div>
                      <div className="text-[10px] text-stone-400 tabnum">Queued</div>
                    </div>
                    <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">Waiting</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OUTPUT FORMAT GRID */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-800">Output Format Grid</h2>
              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-400" /> Generated</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Generating</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-stone-300" /> Pending</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">

              {/* WEB COLUMN */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
                <div className="bg-brand-600 px-4 py-2.5 flex items-center gap-2">
                  <i className="ti ti-world text-white text-sm" />
                  <span className="text-xs font-semibold text-white">WEB</span>
                  <span className="ml-auto text-[10px] text-brand-100">4 formats</span>
                </div>
                <div className="divide-y divide-black/5">
                  {webFormats.map((item, idx) => (
                    <FormatRow key={idx} item={item} accentClass="bg-brand-50 text-brand-600 hover:bg-brand-100" />
                  ))}
                </div>
              </div>

              {/* PRINT COLUMN */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
                <div className="bg-amber-600 px-4 py-2.5 flex items-center gap-2">
                  <i className="ti ti-printer text-white text-sm" />
                  <span className="text-xs font-semibold text-white">PRINT</span>
                  <span className="ml-auto text-[10px] text-amber-100">4 formats</span>
                </div>
                <div className="divide-y divide-black/5">
                  {printFormats.map((item, idx) => (
                    <FormatRow key={idx} item={item} accentClass="bg-amber-50 text-amber-700 hover:bg-amber-100" />
                  ))}
                </div>
              </div>

              {/* SOCIAL COLUMN */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
                <div className="bg-green-700 px-4 py-2.5 flex items-center gap-2">
                  <i className="ti ti-social text-white text-sm" />
                  <span className="text-xs font-semibold text-white">SOCIAL</span>
                  <span className="ml-auto text-[10px] text-green-100">6 formats</span>
                </div>
                <div className="divide-y divide-black/5">
                  {socialFormats.map((item, idx) => (
                    <FormatRow key={idx} item={item} accentClass="bg-green-50 text-green-700 hover:bg-green-100" />
                  ))}
                </div>
              </div>

            </div>

            {/* Batch actions */}
            <div className="mt-3 flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white rounded-lg border border-black/10 hover:bg-stone-50 transition-all hover:-translate-y-px active:scale-[0.98] shadow-card">
                <i className="ti ti-download text-sm" /> Download All Generated (4)
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white rounded-lg border border-black/10 hover:bg-stone-50 transition-all hover:-translate-y-px active:scale-[0.98] shadow-card">
                <i className="ti ti-package text-sm" /> Export ZIP
              </button>
              <Link
                to="/social-campaign"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg border border-brand-100 hover:bg-brand-100 transition-all hover:-translate-y-px active:scale-[0.98]"
              >
                <i className="ti ti-speakerphone text-sm" /> Send to Social Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* ASSET LIBRARY + FEATURES CALLOUT */}
        <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.18s' }}>

          {/* ASSET LIBRARY */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-800">Asset Library — Recent Uploads</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-7 pr-3 py-1.5 text-[12px] bg-white border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 w-44"
                  />
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-stone-500 bg-white rounded-lg border border-black/10 hover:bg-stone-50 transition-all">
                  <i className="ti ti-filter text-xs" /> Filter
                </button>
                <button className="w-7 h-7 flex items-center justify-center text-stone-500 bg-white rounded-lg border border-black/10 hover:bg-stone-50 transition-all">
                  <i className="ti ti-layout-grid text-sm" />
                </button>
              </div>
            </div>

            {/* TYPE FILTER TABS */}
            <div className="flex items-center gap-1.5 mb-3">
              {TYPE_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                    activeFilter === tab
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-stone-500 border-black/10 hover:bg-stone-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {filtered.map((asset) => {
                const isFailed = asset.status === 'failed' || asset.status === 'Error'
                return (
                  <div
                    key={asset.id}
                    className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 overflow-hidden group cursor-pointer"
                  >
                    <div className="h-28 bg-stone-100 relative overflow-hidden">
                      <div className={`w-full h-full flex items-center justify-center bg-stone-200 ${isFailed ? 'opacity-60' : ''}`}>
                        <i className="ti ti-photo text-stone-400 text-2xl" />
                      </div>
                      <div className={`absolute inset-0 transition-colors flex items-end justify-end p-2 ${isFailed ? 'bg-red-50/30 group-hover:bg-red-50/50' : 'group-hover:bg-brand-600/5'}`}>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(asset) }}
                            className="w-6 h-6 bg-white rounded-md shadow flex items-center justify-center text-stone-600 hover:text-brand-600"
                          >
                            <i className="ti ti-pencil text-xs" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(asset) }}
                            className="w-6 h-6 bg-white rounded-md shadow flex items-center justify-center text-stone-600 hover:text-red-600"
                          >
                            <i className="ti ti-trash text-xs" />
                          </button>
                        </div>
                      </div>
                      <span className="absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-stone-50 text-stone-600 border border-black/10 shadow-sm capitalize">
                        {asset.type}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[11px] font-medium text-stone-700 truncate">{asset.name}</div>
                      <div className="text-[10px] text-stone-400 tabnum mt-0.5">{asset.width}×{asset.height} · {asset.size}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-stone-400">{asset.uploadedAt}</span>
                        <button
                          onClick={() => cycleStatus(asset)}
                          className="cursor-pointer"
                          title="Click to cycle status"
                        >
                          <AssetStatusBadge status={asset.status} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
              <span>Showing {filtered.length} of {state.assets.length} master images</span>
              <button className="text-brand-600 hover:underline font-medium">View all in library &rarr;</button>
            </div>
          </div>

          {/* FEATURES CALLOUT PANEL */}
          <div className="col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-stone-800">Engine Capabilities</h2>

            <div className="bg-white rounded-xl border border-black/10 shadow-card p-4 space-y-3">

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ti ti-droplet text-brand-600 text-sm" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-stone-800">AI Watermark</div>
                  <div className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">Auto-inserts logo watermark at smart positions. Supports transparent PNG overlay.</div>
                </div>
              </div>

              <div className="h-px bg-black/5" />

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ti ti-layers-difference text-green-700 text-sm" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-stone-800">Auto Format Convert</div>
                  <div className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">Exports JPG / WebP / PNG simultaneously. WebP reduces file size by 30–40% vs JPG.</div>
                </div>
              </div>

              <div className="h-px bg-black/5" />

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ti ti-cut text-amber-600 text-sm" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-stone-800">Background Removal</div>
                  <div className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">AI removes background automatically (optional). Ideal for commercial-grade white-bg packshots.</div>
                </div>
              </div>

              <div className="h-px bg-black/5" />

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ti ti-send text-purple-700 text-sm" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-stone-800">Publish Integrations</div>
                  <div className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">Push directly to iPaper digital catalog, REST API, and the Social Campaign module.</div>
                </div>
              </div>

            </div>

            {/* Output profile selector */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
              <div className="text-[12px] font-semibold text-stone-800 mb-3">Output Profile</div>
              <div className="space-y-2">
                {outputProfiles.map((profile) => (
                  <label key={profile.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="profile"
                      checked={selectedProfile === profile.id}
                      onChange={() => setSelectedProfile(profile.id)}
                      className="accent-brand-600"
                    />
                    <div>
                      <div className="text-[12px] font-medium text-stone-700">{profile.label}</div>
                      <div className="text-[10px] text-stone-400">{profile.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg border border-brand-100 hover:bg-brand-100 transition-all hover:-translate-y-px active:scale-[0.98]">
                <i className="ti ti-settings text-sm" /> Manage Profiles
              </button>
            </div>

            {/* Storage usage */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[12px] font-semibold text-stone-800">Storage</div>
                <span className="text-[10px] text-stone-400 tabnum">184 GB / 500 GB</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-400 rounded-full" style={{ width: '36.8%' }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-stone-400">
                <span className="tabnum">36.8% used</span>
                <button className="text-brand-600 hover:underline">Upgrade plan</button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* PAGE FOOTER */}
      <footer className="px-6 py-4 border-t border-black/10 bg-white flex items-center justify-between">
        <div className="text-[11px] text-stone-400">
          PIM Studio v2.4 · Image Engine · Last sync: today 09:12 · &copy; 2026 Forma Studio GmbH
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-400">
          <Link to="/products" className="hover:text-brand-600 transition-colors">Products</Link>
          <Link to="/product-sets" className="hover:text-brand-600 transition-colors">Product Sets</Link>
          <Link to="/image-engine" className="text-brand-600 font-medium">Image Engine</Link>
          <Link to="/document-hub" className="hover:text-brand-600 transition-colors">Document Hub</Link>
          <Link to="/social-campaign" className="hover:text-brand-600 transition-colors">Social Campaign</Link>
          <Link to="/settings" className="hover:text-brand-600 transition-colors">Settings</Link>
        </div>
      </footer>

      {/* UPLOAD ASSET MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
            <h3 className="text-sm font-semibold text-stone-800 mb-4">
              {editItem ? 'Edit Asset' : 'Upload Asset'}
            </h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="asset-name" className="block text-[11px] font-medium text-stone-600 mb-1">Name</label>
                <input
                  id="asset-name"
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 30317-lounge-chair-packshot.jpg"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label htmlFor="asset-sku" className="block text-[11px] font-medium text-stone-600 mb-1">Product SKU</label>
                <input
                  id="asset-sku"
                  type="text"
                  value={form.productSku || ''}
                  onChange={(e) => setForm({ ...form, productSku: e.target.value })}
                  placeholder="e.g. SKU-30317"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="asset-type" className="block text-[11px] font-medium text-stone-600 mb-1">Type</label>
                  <select
                    id="asset-type"
                    value={form.type || ''}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="packshot">Packshot</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="detail">Detail</option>
                    <option value="line-drawing">Line Drawing</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="asset-format" className="block text-[11px] font-medium text-stone-600 mb-1">Format</label>
                  <select
                    id="asset-format"
                    value={form.format || ''}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                  >
                    <option value="">Select format</option>
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                    <option value="TIFF">TIFF</option>
                    <option value="WebP">WebP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="asset-width" className="block text-[11px] font-medium text-stone-600 mb-1">Width (px)</label>
                  <input
                    id="asset-width"
                    type="number"
                    value={form.width || ''}
                    onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
                    placeholder="e.g. 5472"
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label htmlFor="asset-height" className="block text-[11px] font-medium text-stone-600 mb-1">Height (px)</label>
                  <input
                    id="asset-height"
                    type="number"
                    value={form.height || ''}
                    onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                    placeholder="e.g. 3648"
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="asset-colorspace" className="block text-[11px] font-medium text-stone-600 mb-1">Color Space</label>
                  <select
                    id="asset-colorspace"
                    value={form.colorSpace || ''}
                    onChange={(e) => setForm({ ...form, colorSpace: e.target.value })}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                  >
                    <option value="">Select color space</option>
                    <option value="sRGB">sRGB</option>
                    <option value="AdobeRGB">Adobe RGB</option>
                    <option value="CMYK">CMYK</option>
                    <option value="P3">Display P3</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="asset-status" className="block text-[11px] font-medium text-stone-600 mb-1">Status</label>
                  <select
                    id="asset-status"
                    value={form.status || 'Ready'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                  >
                    <option value="Ready">Ready</option>
                    <option value="Processing">Processing</option>
                    <option value="Error">Error</option>
                  </select>
                </div>
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
                {editItem ? 'Save Changes' : 'Upload Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

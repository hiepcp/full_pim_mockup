import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'

const productList = [
  { sku: 'PT-2026-001', name: 'Smart Toilet V8', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=56&h=56&fit=crop&q=80', fb: 'done', ig: 'done', li: 'done' },
  { sku: 'PT-2026-002', name: 'Thermostatic Shower Tap Luxe', img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=56&h=56&fit=crop&q=80', fb: 'done', ig: 'running', li: 'running' },
  { sku: 'PT-2026-003', name: 'Induction Cooktop Eco 600', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=56&h=56&fit=crop&q=80', fb: 'done', ig: 'done', li: 'running' },
  { sku: 'PT-2026-004', name: 'Smart LED Mirror Cabinet', img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=56&h=56&fit=crop&q=80', fb: 'done', ig: 'done', li: 'done' },
  { sku: 'PT-2026-005', name: 'Natural Stone Basin Onyx', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=56&h=56&fit=crop&q=80', fb: 'running', ig: 'running', li: 'queued' },
  { sku: 'PT-2026-006', name: 'Rainfall Shower Head 400', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=56&h=56&fit=crop&q=80', fb: 'running', ig: 'queued', li: 'queued' },
  { sku: 'PT-2026-007', name: 'Bathroom Accessories Set 12M', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=56&h=56&fit=crop&q=80', fb: 'queued', ig: 'queued', li: 'queued' },
  { sku: 'PT-2026-008', name: 'Tempered Glass Bathroom Panel', img: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=56&h=56&fit=crop&q=80', fb: 'queued', ig: 'queued', li: 'queued' },
]

const publishLog = [
  { time: '10:21', sku: 'PT-2026-004', channel: '→ LinkedIn', type: 'success' },
  { time: '10:21', sku: 'PT-2026-004', channel: '→ Instagram', type: 'success' },
  { time: '10:20', sku: 'PT-2026-004', channel: '→ Facebook', type: 'success' },
  { time: '10:20', sku: 'PT-2026-003', channel: '→ Instagram', type: 'success' },
  { time: '10:19', sku: 'PT-2026-003', channel: '→ Facebook', type: 'success' },
  { time: '10:18', sku: 'PT-2026-002', channel: '→ Facebook', type: 'success' },
  { time: '10:16', sku: 'Instagram API', channel: 'rate limit — retry 3s', type: 'warning' },
  { time: '10:14', sku: 'Job started', channel: '78 products queued', type: 'info' },
  { time: '10:13', sku: 'Validation pass', channel: '78/78 ready', type: 'info' },
  { time: '10:03', sku: 'Job created', channel: 'by Hiep Chau', type: 'neutral' },
]

const queueNext = [
  {
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=160&h=120&fit=crop&q=80',
    name: 'Thermostatic Shower Tap Luxe Pro',
    sku: 'PT-2026-002',
    channels: ['facebook', 'instagram'],
    statusText: 'Processing...',
    statusColor: 'text-amber-600',
    icon: null,
  },
  {
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=160&h=120&fit=crop&q=80',
    name: 'Induction Cooktop Eco 600',
    sku: 'PT-2026-003',
    channels: ['facebook', 'linkedin'],
    statusText: 'Queued',
    statusColor: 'text-stone-400',
    icon: 'ti-clock',
  },
  {
    img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=160&h=120&fit=crop&q=80',
    name: 'Smart LED Mirror Cabinet',
    sku: 'PT-2026-004',
    channels: ['instagram', 'linkedin'],
    statusText: 'Queued',
    statusColor: 'text-stone-400',
    icon: 'ti-clock',
  },
]

const channelIcons = {
  facebook: { src: 'https://cdn.simpleicons.org/facebook/1877F2', alt: 'Facebook' },
  instagram: { src: 'https://cdn.simpleicons.org/instagram/E1306C', alt: 'Instagram' },
  linkedin: { src: 'https://cdn.simpleicons.org/linkedin/0A66C2', alt: 'LinkedIn' },
  youtube: { src: 'https://cdn.simpleicons.org/youtube/FF0000', alt: 'YouTube' },
  pinterest: { src: 'https://cdn.simpleicons.org/pinterest/E60023', alt: 'Pinterest' },
}

const channelBgImages = {
  facebook: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=300&h=52&fit=crop&q=80',
  instagram: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&h=52&fit=crop&q=80',
  linkedin: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&h=52&fit=crop&q=80',
  youtube: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=300&h=52&fit=crop&q=80',
  pinterest: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=52&fit=crop&q=80',
}

const channelOverlayColor = {
  facebook: 'bg-blue-600/55',
  instagram: 'bg-pink-600/55',
  linkedin: 'bg-sky-700/55',
  youtube: 'bg-red-600/55',
  pinterest: 'bg-rose-700/55',
}

const channelWhiteIcon = {
  facebook: 'https://cdn.simpleicons.org/facebook/ffffff',
  instagram: 'https://cdn.simpleicons.org/instagram/ffffff',
  linkedin: 'https://cdn.simpleicons.org/linkedin/ffffff',
  youtube: 'https://cdn.simpleicons.org/youtube/ffffff',
  pinterest: 'https://cdn.simpleicons.org/pinterest/ffffff',
}

function StatusCell({ status }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
        <i className="ti ti-check text-green-600 text-[10px]"></i>
      </span>
    )
  }
  if (status === 'running') {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100">
        <i className="ti ti-loader-2 text-amber-500 text-[10px]"></i>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-100">
      <i className="ti ti-clock text-stone-400 text-[10px]"></i>
    </span>
  )
}

function getJobStatusBadge(status) {
  if (status === 'Running' || status === 'running') return { label: 'Running', color: 'bg-amber-500/90' }
  if (status === 'Success' || status === 'done') return { label: 'Done', color: 'bg-green-500/90' }
  if (status === 'Failed' || status === 'error') return { label: 'Error', color: 'bg-red-500/90' }
  if (status === 'Queued' || status === 'queued') return { label: 'Queued', color: 'bg-stone-700/80 text-stone-200' }
  return { label: status, color: 'bg-stone-400/90' }
}

export default function PublishFlow() {
  const { state, addJob, updateJob, updateChannel } = useData()

  const [selectedJobId, setSelectedJobId] = useState('PUB-2026-014')
  const [jobFilterTab, setJobFilterTab] = useState('all')
  const [jobSearchQuery, setJobSearchQuery] = useState('')
  const [selectedPreviewChannel, setSelectedPreviewChannel] = useState('facebook')
  const [isPaused, setIsPaused] = useState(false)

  // Track last added job id per channel for the setTimeout update
  const pendingJobIds = useRef({})

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'queue', label: 'Queue' },
    { id: 'errors', label: 'Errors' },
  ]

  const getLogSkuColor = (type) => {
    if (type === 'success') return 'text-green-600'
    if (type === 'warning') return 'text-amber-600'
    if (type === 'info') return 'text-brand-600'
    return 'text-stone-600'
  }

  function handlePublishNow(ch) {
    const tempId = 'JOB-' + Date.now()
    addJob({
      id: tempId,
      channelId: ch.id,
      channelName: ch.name,
      status: 'Running',
      startedAt: new Date().toLocaleTimeString(),
      recordsProcessed: 0,
      errors: 0,
      warnings: 0,
      triggeredBy: 'Manual',
    })
    pendingJobIds.current[ch.id] = tempId
    setTimeout(() => {
      updateJob({
        id: tempId,
        status: 'Success',
        completedAt: new Date().toLocaleTimeString(),
        recordsProcessed: ch.productCount || 0,
      })
    }, 2000)
  }

  function handleToggleChannel(ch) {
    const nextStatus = ch.status === 'connected' ? 'disconnected' : 'connected'
    updateChannel({ id: ch.id, status: nextStatus })
  }

  function handleRetryJob(job) {
    updateJob({ id: job.id, status: 'Running' })
    setTimeout(() => {
      updateJob({ id: job.id, status: 'Success', completedAt: new Date().toLocaleTimeString() })
    }, 2000)
  }

  const jobs = state.publishJobs || []
  const channels = state.channels || []

  return (
    <Layout>
      {/* TOPBAR */}
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-stone-400">Publishing</span>
          <i className="ti ti-chevron-right text-stone-300 text-xs"></i>
          <span className="font-medium text-stone-800">Publish Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-600 border border-black/10 hover:-translate-y-px active:scale-[0.98] transition-all">
            <i className="ti ti-history text-xs"></i> Job History
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all shadow-sm">
            <i className="ti ti-plus text-xs"></i> New Publish Job
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-6 flex flex-col gap-5">

        {/* STATS ROW */}
        <div className="grid grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Channels</div>
            <div className="text-2xl font-bold tabnum text-stone-900">{channels.length}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {channels.map((ch) => channelIcons[ch.id] && (
                <img key={ch.id} src={channelIcons[ch.id].src} alt={channelIcons[ch.id].alt} className="w-3.5 h-3.5" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Processing</div>
            <div className="text-2xl font-bold tabnum text-amber-600">
              {jobs.filter(j => j.status === 'running' || j.status === 'Running').length}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">jobs in queue</div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Published Today</div>
            <div className="text-2xl font-bold tabnum text-green-600">147</div>
            <div className="text-[11px] text-stone-400 mt-1">posts across all channels</div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Errors</div>
            <div className="text-2xl font-bold tabnum text-red-500">
              {jobs.reduce((acc, j) => acc + (j.errors || 0), 0)}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">need attention</div>
          </div>
        </div>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="flex gap-5 items-start animate-fade-up" style={{ animationDelay: '0.1s' }}>

          {/* LEFT: JOB LIST */}
          <div className="w-[260px] shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-stone-700">Publish Jobs</h2>
              <span className="text-[11px] text-stone-400">{jobs.length} total</span>
            </div>

            {/* Search */}
            <div className="relative">
              <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search jobs..."
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-black/10 text-[12px] text-stone-700 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setJobFilterTab(tab.id)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    jobFilterTab === tab.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 bg-white border border-black/10 hover:bg-stone-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Job cards — rendered from state.publishJobs */}
            <div className="flex flex-col gap-2">
              {jobs
                .filter(job => {
                  if (jobFilterTab === 'queue') return job.status === 'queued' || job.status === 'Queued' || job.status === 'running' || job.status === 'Running'
                  if (jobFilterTab === 'errors') return job.status === 'error' || job.status === 'Failed'
                  return true
                })
                .filter(job => {
                  if (!jobSearchQuery) return true
                  const q = jobSearchQuery.toLowerCase()
                  return (
                    (job.id || '').toLowerCase().includes(q) ||
                    (job.channelName || '').toLowerCase().includes(q)
                  )
                })
                .map((job) => {
                  const badge = getJobStatusBadge(job.status)
                  const isSelected = selectedJobId === job.id
                  const isRunning = job.status === 'running' || job.status === 'Running'
                  const isDone = job.status === 'done' || job.status === 'Success'
                  const isError = job.status === 'error' || job.status === 'Failed'
                  const isQueued = job.status === 'queued' || job.status === 'Queued'
                  const borderClass = isSelected
                    ? 'border-brand-400 shadow-hover'
                    : isError
                      ? 'border-red-200 shadow-card hover:shadow-hover hover:-translate-y-px'
                      : 'border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px'

                  return (
                    <div
                      key={job.id}
                      className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${borderClass}`}
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <div className={`${isRunning ? 'h-[76px]' : 'h-[64px]'} overflow-hidden relative`}>
                        <img
                          src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=80&fit=crop&q=80"
                          alt={job.channelName || job.id}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-end p-2.5">
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${badge.color} text-white`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <div className="px-3.5 pt-3 pb-2">
                        <div className="text-[10px] tabnum text-stone-400 font-mono">{job.id}</div>
                        <div className="text-[13px] font-semibold text-stone-900 mt-0.5 mb-1.5 leading-tight">
                          {job.channelName || job.id}
                        </div>
                        {job.channelId && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {job.channelId.split(',').map(cid => channelIcons[cid.trim()] && (
                              <img key={cid} src={channelIcons[cid.trim()].src} alt={cid.trim()} className="w-3 h-3" />
                            ))}
                          </div>
                        )}
                        {isRunning && (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-600 rounded-full" style={{ width: '62%' }}></div>
                              </div>
                              <span className="text-[10px] tabnum text-stone-500 font-medium shrink-0">62%</span>
                            </div>
                            <div className="mt-1 text-[10px] text-stone-400 tabnum">
                              {job.recordsProcessed || 0} / {job.recordsTotal || 78} posts
                            </div>
                          </>
                        )}
                        {isDone && (
                          <div className="text-[11px] text-stone-400 flex items-center gap-1">
                            <i className="ti ti-check text-xs text-green-500"></i>
                            <span>
                              {job.recordsProcessed || 0} posts &middot; Completed{' '}
                              <span className="tabnum font-medium text-stone-600">{job.completedAt || ''}</span>
                            </span>
                          </div>
                        )}
                        {isError && (
                          <div className="text-[11px] text-red-600 flex items-center gap-1">
                            <i className="ti ti-alert-triangle text-xs"></i>
                            <span>{job.errors || 0} posts failed</span>
                            <button
                              className="ml-auto text-[10px] font-medium text-brand-600 hover:text-brand-800 border border-brand-200 rounded px-1.5 py-0.5"
                              onClick={(e) => { e.stopPropagation(); handleRetryJob(job) }}
                            >
                              Retry
                            </button>
                          </div>
                        )}
                        {isQueued && (
                          <div className="text-[11px] text-stone-400 flex items-center gap-1">
                            <i className="ti ti-clock text-xs"></i>
                            <span>Waiting — {job.recordsProcessed || 0} queued</span>
                          </div>
                        )}
                      </div>
                      {isRunning && (
                        <div className="px-3.5 py-2 border-t border-black/5 bg-brand-50/50 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-active"></div>
                          <span className="text-[11px] text-amber-700 font-medium">Running...</span>
                          <span className="text-[10px] text-stone-400 ml-auto tabnum">~4m left</span>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          {/* RIGHT: JOB DETAIL */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Job header with hero banner */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden animate-fade-up" style={{ animationDelay: '0.12s' }}>

              {/* Hero banner */}
              <div className="h-[110px] overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=120&fit=crop&q=85" className="w-full h-full object-cover" alt="Phong Tam Premium" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-end px-5 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] tabnum font-mono text-white/60">PUB-2026-014</span>
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-amber-500/90 text-white">Running</span>
                    <span className="text-[10px] text-white/50">Started 10:03</span>
                  </div>
                  <h1 className="text-[15px] font-bold text-white leading-tight">Phong Tam Premium 2026 — Batch Publish</h1>
                  <div className="text-[11px] text-white/60 mt-0.5">78 products &middot; 3 channels &middot; Created by Hiep Chau</div>
                </div>
                <div className="absolute top-3 right-4 flex items-center gap-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white/20 backdrop-blur text-white border border-white/20 hover:bg-white/30 transition-all"
                  >
                    <i className={`ti ${isPaused ? 'ti-player-play' : 'ti-pause'} text-xs`}></i> {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-red-600/80 backdrop-blur text-white border border-red-500/30 hover:bg-red-600 transition-all">
                    <i className="ti ti-x text-xs"></i> Cancel
                  </button>
                </div>
              </div>

              {/* Progress + asset thumbnails */}
              <div className="px-5 py-3.5 border-b border-black/5">
                <div className="flex items-start gap-5">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-stone-600">Overall Progress</span>
                      <span className="text-[11px] tabnum font-semibold text-brand-600">48 / 78 posts &middot; ~4 min left</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700" style={{ width: '62%' }}></div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-stone-400">62% complete</span>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-green-600 font-medium tabnum">48 done</span>
                        <span className="text-amber-500 font-medium tabnum">30 running</span>
                        <span className="text-stone-400 tabnum">0 errors</span>
                      </div>
                    </div>
                  </div>
                  {/* Overlapping asset thumbnails */}
                  <div className="shrink-0">
                    <div className="text-[10px] text-stone-400 font-medium mb-1.5">Assets</div>
                    <div className="flex -space-x-1.5">
                      <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=52&h=52&fit=crop&q=80" className="w-8 h-8 rounded-lg object-cover ring-2 ring-white" alt="" />
                      <img src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=52&h=52&fit=crop&q=80" className="w-8 h-8 rounded-lg object-cover ring-2 ring-white" alt="" />
                      <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=52&h=52&fit=crop&q=80" className="w-8 h-8 rounded-lg object-cover ring-2 ring-white" alt="" />
                      <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=52&h=52&fit=crop&q=80" className="w-8 h-8 rounded-lg object-cover ring-2 ring-white" alt="" />
                      <img src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=52&h=52&fit=crop&q=80" className="w-8 h-8 rounded-lg object-cover ring-2 ring-white" alt="" />
                      <div className="w-8 h-8 rounded-lg bg-stone-100 ring-2 ring-white flex items-center justify-center text-[9px] font-semibold text-stone-500">+229</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel status strip */}
              <div className="px-5 py-3 flex items-center gap-5 bg-stone-50/60 overflow-x-auto">
                {/* Facebook */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <img src={channelIcons.facebook.src} alt="Facebook" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-stone-800">Facebook</div>
                    <div className="text-[10px] text-stone-400 tabnum">22 / 28 posts</div>
                  </div>
                  <div className="ml-1 w-14 h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '79%' }}></div>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium tabnum">79%</span>
                </div>
                <div className="w-px h-8 bg-black/5 shrink-0"></div>
                {/* Instagram */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                    <img src={channelIcons.instagram.src} alt="Instagram" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-stone-800">Instagram</div>
                    <div className="text-[10px] text-stone-400 tabnum">18 / 28 posts</div>
                  </div>
                  <div className="ml-1 w-14 h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                  <span className="text-[10px] text-pink-600 font-medium tabnum">64%</span>
                </div>
                <div className="w-px h-8 bg-black/5 shrink-0"></div>
                {/* LinkedIn */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                    <img src={channelIcons.linkedin.src} alt="LinkedIn" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-stone-800">LinkedIn</div>
                    <div className="text-[10px] text-stone-400 tabnum">8 / 22 posts</div>
                  </div>
                  <div className="ml-1 w-14 h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600 rounded-full" style={{ width: '36%' }}></div>
                  </div>
                  <span className="text-[10px] text-sky-700 font-medium tabnum">36%</span>
                </div>
              </div>
            </div>

            {/* Workflow steps */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card px-6 py-4 animate-fade-up" style={{ animationDelay: '0.14s' }}>
              <div className="flex items-center">
                {/* Step 1: Select Products — done */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="ti ti-check text-green-600 text-sm"></i>
                  </div>
                  <div className="text-[11px] font-medium text-green-600 mt-1.5 whitespace-nowrap">Select Products</div>
                  <div className="text-[10px] text-stone-400">78 items</div>
                </div>
                <div className="flex-1 h-0.5 bg-green-200 mx-2"></div>
                {/* Step 2: Validate Data — done */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="ti ti-check text-green-600 text-sm"></i>
                  </div>
                  <div className="text-[11px] font-medium text-green-600 mt-1.5 whitespace-nowrap">Validate Data</div>
                  <div className="text-[10px] text-stone-400">Pass — 78/78</div>
                </div>
                <div className="flex-1 h-0.5 bg-green-200 mx-2"></div>
                {/* Step 3: Prepare Assets — done */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="ti ti-check text-green-600 text-sm"></i>
                  </div>
                  <div className="text-[11px] font-medium text-green-600 mt-1.5 whitespace-nowrap">Prepare Assets</div>
                  <div className="text-[10px] text-stone-400">234 assets</div>
                </div>
                <div className="flex-1 h-0.5 bg-brand-200 mx-2"></div>
                {/* Step 4: Publishing — active */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center ring-4 ring-brand-100 pulse-active">
                    <span className="text-white text-xs font-semibold">4</span>
                  </div>
                  <div className="text-[11px] font-semibold text-brand-600 mt-1.5 whitespace-nowrap">Publishing</div>
                  <div className="text-[10px] text-stone-400">62% done</div>
                </div>
                <div className="flex-1 h-0.5 bg-stone-200 mx-2"></div>
                {/* Step 5: Confirm — pending */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-stone-300 flex items-center justify-center">
                    <span className="text-stone-400 text-xs font-semibold">5</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1.5 whitespace-nowrap">Confirm</div>
                  <div className="text-[10px] text-stone-300">Not started</div>
                </div>
              </div>
            </div>

            {/* Social Post Preview */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-stone-700">Post Preview</h3>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'facebook', label: 'Facebook', icon: channelIcons.facebook },
                    { id: 'instagram', label: 'Instagram', icon: channelIcons.instagram },
                    { id: 'linkedin', label: 'LinkedIn', icon: channelIcons.linkedin },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedPreviewChannel(ch.id)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        selectedPreviewChannel === ch.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      <img src={ch.icon.src} alt="" className="w-3 h-3" /> {ch.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Facebook post mockup */}
                  <div className="flex-1 max-w-[380px] border border-black/8 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
                      <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-[13px] font-bold shrink-0">PT</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-stone-900 leading-tight">Phong Tam Official</div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1">
                          <span>Just now</span><span>&middot;</span><i className="ti ti-world text-[9px]"></i>
                        </div>
                      </div>
                      <button className="text-stone-400 hover:text-stone-600">
                        <i className="ti ti-dots text-sm"></i>
                      </button>
                    </div>
                    <div className="px-3.5 pb-2.5 text-[12px] text-stone-700 leading-relaxed">
                      ✨ Giới thiệu <strong>Smart Toilet V8</strong> — công nghệ thông minh cho phòng tắm cao cấp. <span className="text-blue-600">#PhongTamPremium #SmartHome</span>
                    </div>
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=760&h=428&fit=crop&q=85" className="w-full h-full object-cover" alt="Smart Toilet V8" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3.5 py-2.5">
                        <div className="text-white font-semibold text-[12px]">Smart Toilet V8 — Phong Tam Premium</div>
                        <div className="text-white/70 text-[11px]">phongtam.vn</div>
                      </div>
                    </div>
                    <div className="px-3.5 py-2 border-t border-black/5">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 mb-2">
                        <span>👍 ❤️ 2.4K</span>
                        <span>186 bình luận · 94 chia sẻ</span>
                      </div>
                      <div className="flex items-center border-t border-black/5 pt-1.5">
                        <button className="flex-1 flex items-center justify-center gap-1 text-[11px] text-stone-500 font-medium py-1 rounded-md hover:bg-stone-50">
                          <i className="ti ti-thumb-up text-sm"></i> Like
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 text-[11px] text-stone-500 font-medium py-1 rounded-md hover:bg-stone-50">
                          <i className="ti ti-message-circle text-sm"></i> Comment
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 text-[11px] text-stone-500 font-medium py-1 rounded-md hover:bg-stone-50">
                          <i className="ti ti-share text-sm"></i> Share
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Queue preview — next 3 */}
                  <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5">
                      <i className="ti ti-clock text-xs"></i> Up next in queue
                    </div>
                    {queueNext.map((item) => (
                      <div key={item.sku} className="border border-black/8 rounded-xl overflow-hidden bg-white shadow-sm flex">
                        <div className="w-[80px] shrink-0 overflow-hidden">
                          <img src={item.img} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 px-3 py-2.5 min-w-0">
                          <div className="text-[11px] font-semibold text-stone-800 leading-tight truncate">{item.name}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5 tabnum">{item.sku}</div>
                          <div className="flex items-center gap-1 mt-1.5">
                            {item.channels.map((ch) => (
                              <img key={ch} src={channelIcons[ch].src} alt="" className="w-3 h-3" />
                            ))}
                            <span className={`text-[10px] font-medium ml-0.5 flex items-center gap-0.5 ${item.statusColor}`}>
                              {item.icon && <i className={`ti ${item.icon} text-[9px]`}></i>}
                              {item.statusText}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product table + Log */}
            <div className="flex gap-4 animate-fade-up" style={{ animationDelay: '0.17s' }}>

              {/* Product table */}
              <div className="flex-1 bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
                <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-stone-700">Product List</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400 tabnum">78 total</span>
                    <button className="text-[11px] text-brand-600 font-medium hover:text-brand-800 transition-colors">View all</button>
                  </div>
                </div>
                <div className="overflow-auto max-h-[280px]">
                  <table className="w-full text-[12px]">
                    <thead className="bg-stone-50/80 sticky top-0">
                      <tr className="border-b border-black/5">
                        <th className="w-10 px-3 py-2"></th>
                        <th className="text-left px-2 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">SKU</th>
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Product</th>
                        <th className="text-center px-2 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">
                          <img src={channelIcons.facebook.src} alt="FB" className="w-3 h-3 mx-auto" />
                        </th>
                        <th className="text-center px-2 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">
                          <img src={channelIcons.instagram.src} alt="IG" className="w-3 h-3 mx-auto" />
                        </th>
                        <th className="text-center px-2 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">
                          <img src={channelIcons.linkedin.src} alt="LI" className="w-3 h-3 mx-auto" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {productList.map((product) => (
                        <tr key={product.sku} className="hover:bg-stone-50 transition-colors">
                          <td className="px-3 py-2">
                            <img src={product.img} className="w-8 h-8 rounded-lg object-cover" alt="" />
                          </td>
                          <td className="px-2 py-2 font-mono tabnum text-stone-500 text-[11px]">{product.sku}</td>
                          <td className="px-3 py-2 text-stone-800 font-medium">{product.name}</td>
                          <td className="px-2 py-2 text-center"><StatusCell status={product.fb} /></td>
                          <td className="px-2 py-2 text-center"><StatusCell status={product.ig} /></td>
                          <td className="px-2 py-2 text-center"><StatusCell status={product.li} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5 border-t border-black/5 bg-stone-50/60 flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> 48 done</span>
                  <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> 15 running</span>
                  <span className="flex items-center gap-1 text-stone-400"><span className="w-2 h-2 rounded-full bg-stone-300 inline-block"></span> 15 queued</span>
                </div>
              </div>

              {/* Publish Log */}
              <div className="w-[264px] shrink-0 bg-white rounded-xl border border-black/10 shadow-card overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-stone-700">Publish Log</h3>
                  <button className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors">
                    <i className="ti ti-refresh text-xs"></i>
                  </button>
                </div>
                <div className="flex-1 overflow-auto max-h-[280px] p-3 flex flex-col gap-1.5">
                  {publishLog.map((entry, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-[10px] tabnum text-stone-400 font-mono shrink-0 mt-0.5">{entry.time}</span>
                      <div>
                        <span className={`text-[11px] font-medium ${getLogSkuColor(entry.type)}`}>{entry.sku}</span>
                        <span className="text-[11px] text-stone-500"> {entry.channel}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-black/5 bg-stone-50/60">
                  <button className="text-[11px] font-medium text-brand-600 hover:text-brand-800 transition-colors">Export full log &rarr;</button>
                </div>
              </div>

            </div>

            {/* Channel config cards — from state.channels */}
            <div className="grid grid-cols-5 gap-3 animate-fade-up" style={{ animationDelay: '0.19s' }}>
              {channels.map((ch) => {
                const isConnected = ch.status === 'connected'
                const isError = ch.status === 'error'
                const borderClass = isError ? 'border-red-100' : 'border-black/10'
                const bgImg = channelBgImages[ch.id] || channelBgImages.facebook
                const overlayColor = channelOverlayColor[ch.id] || 'bg-stone-700/55'
                const whiteIcon = channelWhiteIcon[ch.id]

                return (
                  <div key={ch.id} className={`bg-white rounded-xl border ${borderClass} shadow-card overflow-hidden`}>
                    <div className="h-[48px] overflow-hidden relative">
                      <img src={bgImg} className="w-full h-full object-cover" alt="" />
                      <div className={`absolute inset-0 ${overlayColor} flex items-center px-3 gap-1.5`}>
                        {whiteIcon && <img src={whiteIcon} alt="" className="w-4 h-4" />}
                        <span className="text-white text-[12px] font-semibold">{ch.name}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <button
                        className="flex items-center gap-1 mb-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleToggleChannel(ch)}
                        title="Click to toggle connection status"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : isError ? 'bg-amber-500' : 'bg-stone-300'}`}></div>
                        <span className="text-[10px] text-stone-500">
                          {isConnected ? 'Connected' : isError ? '1 error' : 'Disconnected'}
                        </span>
                      </button>
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">Today</span>
                          <span className="font-medium tabnum text-stone-600">{ch.productCount != null ? ch.productCount : '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">Type</span>
                          <span className="text-stone-600 capitalize">{ch.type}</span>
                        </div>
                      </div>
                      <button
                        className="mt-2.5 w-full text-[10px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md py-1 transition-colors"
                        onClick={() => handlePublishNow(ch)}
                      >
                        Publish Now
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Job History Table — from state.publishJobs */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden animate-fade-up" style={{ animationDelay: '0.21s' }}>
              <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-stone-700">Job History</h3>
                <span className="text-[11px] text-stone-400 tabnum">{jobs.length} jobs</span>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-stone-50/80">
                    <tr className="border-b border-black/5">
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Job ID</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Channel</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Status</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Started</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Completed</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Records</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Errors</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Triggered By</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {jobs.map((job) => {
                      const badge = getJobStatusBadge(job.status)
                      const isError = job.status === 'error' || job.status === 'Failed'
                      return (
                        <tr key={job.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-2.5 font-mono tabnum text-stone-500 text-[11px]">{job.id}</td>
                          <td className="px-3 py-2.5 text-stone-700">{job.channelName || '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${badge.color} text-white`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 tabnum text-stone-500 text-[11px]">{job.startedAt || '—'}</td>
                          <td className="px-3 py-2.5 tabnum text-stone-500 text-[11px]">{job.completedAt || '—'}</td>
                          <td className="px-3 py-2.5 tabnum text-stone-700 text-right">{job.recordsProcessed ?? '—'}</td>
                          <td className="px-3 py-2.5 tabnum text-right">
                            <span className={job.errors ? 'text-red-600 font-medium' : 'text-stone-400'}>{job.errors ?? 0}</span>
                          </td>
                          <td className="px-3 py-2.5 text-stone-500 text-[11px]">{job.triggeredBy || '—'}</td>
                          <td className="px-3 py-2.5 text-right">
                            {isError && (
                              <button
                                className="text-[10px] font-medium text-brand-600 hover:text-brand-800 border border-brand-200 rounded px-1.5 py-0.5"
                                onClick={() => handleRetryJob(job)}
                              >
                                Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          {/* /RIGHT */}

        </div>
        {/* /MAIN TWO-COLUMN */}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-stone-400">
          <span>PIM Studio</span><span className="text-stone-300">&middot;</span>
          <span>v2.4.1</span><span className="text-stone-300">&middot;</span>
          <span>&copy; 2026 Response Co., Ltd.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/products" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Products</Link>
          <Link to="/social-campaign" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Social Campaign</Link>
          <Link to="/publish-flow" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Publish Flow</Link>
          <Link to="/settings" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Settings</Link>
        </div>
      </footer>
    </Layout>
  )
}

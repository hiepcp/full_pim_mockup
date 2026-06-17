import { useState, useEffect, useRef } from 'react'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'

const SECTIONS = ['d365', 'ipaper', 'social', 'members', 'roles', 'completeness', 'publish', 'notif']

const ROLE_CLASS_MAP = {
  Admin:     'bg-purple-50 text-purple-700 border-purple-200',
  Publisher: 'bg-brand-50 text-brand-600 border-brand-100',
  Creator:   'bg-amber-50 text-amber-700 border-amber-200',
  Viewer:    'bg-stone-100 text-stone-500 border-stone-200',
}

const STATUS_CLASS_MAP = {
  Active:  'bg-green-50 text-green-700 border-green-200',
  Invited: 'bg-stone-100 text-stone-500 border-stone-200',
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Toggle({ on, onChange }) {
  return (
    <div
      className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer shrink-0 transition-colors ${on ? 'bg-brand-600' : 'bg-stone-200'}`}
      onClick={() => onChange(!on)}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'ml-auto' : ''}`} />
    </div>
  )
}

function PermCell({ value }) {
  if (value === 'draft') return <td className="px-4 py-3 text-center text-stone-400 font-normal text-xs">Draft only</td>
  if (value) return <td className="px-4 py-3 text-center"><i className="ti ti-check text-green-500 text-base" /></td>
  return <td className="px-4 py-3 text-center"><i className="ti ti-minus text-stone-300 text-base" /></td>
}

export default function Settings() {
  const { state, addMember, updateMember, deleteMember, updateNotification, addSyncLog } = useData()

  const [activeSection, setActiveSection] = useState('d365')
  const [minimumCompletenessScore, setMinimumCompletenessScore] = useState(80)
  const [heroImageRequired, setHeroImageRequired] = useState(true)
  const [publisherApprovalRequired, setPublisherApprovalRequired] = useState(true)
  const [blockPublishOnD365Sync, setBlockPublishOnD365Sync] = useState(false)
  const [autoGenerateWebP, setAutoGenerateWebP] = useState(true)
  const [resizeThumbnails, setResizeThumbnails] = useState(true)
  const [enforceMaxFileSize, setEnforceMaxFileSize] = useState(false)

  // Member modal state
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [memberForm, setMemberForm] = useState({})

  const sectionRefs = useRef({})

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id]
    if (!el) return
    const top = el.getBoundingClientRect().top + window.pageYOffset - (48 + 16)
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveSection(id)
  }

  useEffect(() => {
    const HEADER_HEIGHT = 48 + 16
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('section-', '')
            setActiveSection(id)
          }
        })
      },
      { rootMargin: `-${HEADER_HEIGHT}px 0px -60% 0px`, threshold: 0 }
    )
    SECTIONS.forEach((s) => {
      const el = sectionRefs.current[s]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const navItemClass = (id) =>
    `flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-md border-none bg-transparent w-full text-left cursor-pointer transition-all ${
      activeSection === id
        ? 'bg-brand-50 text-brand-600 font-medium'
        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
    }`

  // Member modal handlers
  const openAddMember = () => {
    setEditMember(null)
    setMemberForm({})
    setShowMemberModal(true)
  }

  const openEditMember = (member) => {
    setEditMember(member)
    setMemberForm({ ...member })
    setShowMemberModal(true)
  }

  const saveMember = () => {
    const initials = getInitials(memberForm.name || '')
    if (editMember) {
      updateMember({ ...memberForm, initials })
    } else {
      addMember({
        ...memberForm,
        initials,
        status: 'Invited',
        lastActive: '—',
        avatarClass: 'bg-stone-100 text-stone-400',
      })
    }
    setShowMemberModal(false)
  }

  const handleDeleteMember = (member) => {
    if (window.confirm('Delete this member?')) {
      deleteMember(member.id)
    }
  }

  const handleRunSync = () => {
    addSyncLog({
      time: new Date().toLocaleTimeString(),
      type: 'Manual sync',
      records: '1,247 records',
      status: 'Success',
      statusClass: 'bg-green-50 text-green-700 border-green-200',
      duration: '8.5s',
      note: null,
    })
  }

  return (
    <Layout>
      {/* Topbar */}
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 px-6 h-12 flex items-center gap-2">
        <span className="text-xs text-stone-400">System</span>
        <i className="ti ti-chevron-right text-xs text-stone-300" />
        <span className="text-xs font-medium text-stone-700">Settings</span>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 flex gap-5">

        {/* Settings Left Nav */}
        <div className="w-[220px] shrink-0" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0s' }}>
          <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">

            {/* Integrations group */}
            <div className="px-3 pt-4 pb-1">
              <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest px-1 pb-1">Integrations</div>
              <button onClick={() => scrollToSection('d365')} className={navItemClass('d365')}>
                <i className="ti ti-refresh text-sm" /> D365 Sync
              </button>
              <button onClick={() => scrollToSection('ipaper')} className={navItemClass('ipaper')}>
                <i className="ti ti-world text-sm" /> iPaper / CDN
              </button>
              <button onClick={() => scrollToSection('social')} className={navItemClass('social')}>
                <i className="ti ti-social text-sm" /> Social Channels
              </button>
            </div>

            <div className="border-t border-black/5 mx-3 my-2" />

            {/* Users & Roles group */}
            <div className="px-3 pb-1">
              <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest px-1 pb-1">Users &amp; Roles</div>
              <button onClick={() => scrollToSection('members')} className={navItemClass('members')}>
                <i className="ti ti-users text-sm" /> Team Members
              </button>
              <button onClick={() => scrollToSection('roles')} className={navItemClass('roles')}>
                <i className="ti ti-shield-check text-sm" /> Role Permissions
              </button>
            </div>

            <div className="border-t border-black/5 mx-3 my-2" />

            {/* General group */}
            <div className="px-3 pb-3">
              <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest px-1 pb-1">General</div>
              <button onClick={() => scrollToSection('completeness')} className={navItemClass('completeness')}>
                <i className="ti ti-checklist text-sm" /> Completeness Rules
              </button>
              <button onClick={() => scrollToSection('publish')} className={navItemClass('publish')}>
                <i className="ti ti-circle-check text-sm" /> Publish Rules
              </button>
              <button onClick={() => scrollToSection('notif')} className={navItemClass('notif')}>
                <i className="ti ti-bell text-sm" /> Notifications
              </button>
            </div>

          </div>
        </div>

        {/* Right Content Panels */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* ==================== D365 SYNC ==================== */}
          <div id="section-d365" ref={el => sectionRefs.current['d365'] = el} className="flex flex-col gap-5">

            {/* Header */}
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-lg font-bold text-stone-900">D365 Integration</h1>
                <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200">Read-Only</span>
              </div>
              <p className="text-sm text-stone-500">Data is synchronised one-way from D365 ERP &rarr; PIM. Source data from D365 cannot be edited within PIM.</p>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <i className="ti ti-plug-connected text-green-600 text-xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">D365 Production</span>
                      <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Connected
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">Environment: <span className="font-medium text-stone-600">PROD-EU-01</span></div>
                  </div>
                </div>
                <button
                  onClick={handleRunSync}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-700 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <i className="ti ti-refresh text-sm" /> Force Sync Now
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                  <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Last Sync</div>
                  <div className="text-sm font-semibold text-stone-900 tabular-nums">14 min ago</div>
                  <div className="text-[11px] text-stone-400 tabular-nums">10:46 AM, 16 Jun 2026</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                  <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Sync Interval</div>
                  <div className="text-sm font-semibold text-stone-900 tabular-nums">15 minutes</div>
                  <div className="text-[11px] text-stone-400">Scheduled · Auto</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                  <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Next Sync</div>
                  <div className="text-sm font-semibold text-amber-600 tabular-nums">~1 minute</div>
                  <div className="text-[11px] text-stone-400 tabular-nums">11:01 AM</div>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                  <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Total Records</div>
                  <div className="text-sm font-bold text-stone-900 tabular-nums">1,247</div>
                  <div className="text-[11px] text-stone-400">Products synced</div>
                </div>
              </div>
            </div>

            {/* Pipeline Visualization */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.11s' }}>
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Sync Pipeline</h3>
              <div className="flex items-center">

                {/* Step 1: D365 ERP */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <i className="ti ti-database text-brand-600 text-lg" />
                  </div>
                  <div className="text-[11px] font-medium text-stone-700 text-center leading-tight">D365 ERP</div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-green-600">Online</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <div className="h-[2px] w-full bg-green-200 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-green-400" />
                  </div>
                </div>

                {/* Step 2: Sync Service */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <i className="ti ti-clock text-green-600 text-lg" />
                  </div>
                  <div className="text-[11px] font-medium text-stone-700 text-center leading-tight">Sync Service</div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-green-600">15 min</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <div className="h-[2px] w-full bg-green-200 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-green-400" />
                  </div>
                </div>

                {/* Step 3: Staging */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <i className="ti ti-server text-green-600 text-lg" />
                  </div>
                  <div className="text-[11px] font-medium text-stone-700 text-center leading-tight">Staging</div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-green-600">Temp DB</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <div className="h-[2px] w-full bg-green-200 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-green-400" />
                  </div>
                </div>

                {/* Step 4: Validation */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <i className="ti ti-shield-check text-green-600 text-lg" />
                  </div>
                  <div className="text-[11px] font-medium text-stone-700 text-center leading-tight">Validation &amp; Mapping</div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-green-600">Done</span>
                  </div>
                </div>

                {/* Arrow amber */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <div className="h-[2px] w-full bg-amber-200 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-amber-400" />
                  </div>
                </div>

                {/* Step 5: PIM DB */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <i className="ti ti-database-import text-amber-600 text-lg" />
                  </div>
                  <div className="text-[11px] font-medium text-stone-700 text-center leading-tight">PIM Database</div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-amber" />
                    <span className="text-[10px] text-amber-600">Syncing</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Data Synced */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.14s' }}>
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Data Synced from D365</h3>
              <div className="grid grid-cols-3 gap-4">

                {/* Product Data */}
                <div className="bg-stone-50 rounded-lg p-3.5 border border-black/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-md bg-brand-50 border border-brand-100 flex items-center justify-center">
                      <i className="ti ti-box text-brand-600 text-sm" />
                    </div>
                    <span className="text-xs font-semibold text-stone-700">Product Data</span>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {['Item Number', 'Description', 'Dimensions', 'Designer', 'Status'].map(item => (
                      <li key={item} className="flex items-center gap-1.5 text-xs text-stone-600">
                        <i className="ti ti-point-filled text-[8px] text-stone-300" /> {item}
                      </li>
                    ))}
                  </ul>
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-stone-200 text-stone-500">One-way · Cannot edit in PIM</span>
                </div>

                {/* Sales Data */}
                <div className="bg-stone-50 rounded-lg p-3.5 border border-black/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <i className="ti ti-chart-bar text-blue-600 text-sm" />
                    </div>
                    <span className="text-xs font-semibold text-stone-700">Sales Data</span>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {['Sales Order', 'Sold To Customer', 'Quantity', 'Order Date', 'Country'].map(item => (
                      <li key={item} className="flex items-center gap-1.5 text-xs text-stone-600">
                        <i className="ti ti-point-filled text-[8px] text-stone-300" /> {item}
                      </li>
                    ))}
                  </ul>
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-stone-200 text-stone-500">One-way · Cannot edit in PIM</span>
                </div>

                {/* Pricing Data */}
                <div className="bg-stone-50 rounded-lg p-3.5 border border-black/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <i className="ti ti-currency-euro text-emerald-600 text-sm" />
                    </div>
                    <span className="text-xs font-semibold text-stone-700">Pricing Data</span>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {['Price List', 'Currency', 'Valid Date'].map(item => (
                      <li key={item} className="flex items-center gap-1.5 text-xs text-stone-600">
                        <i className="ti ti-point-filled text-[8px] text-stone-300" /> {item}
                      </li>
                    ))}
                  </ul>
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-stone-200 text-stone-500">One-way · Cannot edit in PIM</span>
                </div>

              </div>
            </div>

            {/* Sync Log */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.17s' }}>
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">Recent Sync Log</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunSync}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1.5"
                  >
                    <i className="ti ti-refresh text-xs" /> Run Sync
                  </button>
                  <button className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors">View full log</button>
                </div>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-black/5">
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Time</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Type</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Records</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Status</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {state.syncLog.map((row, i) => (
                    <tr key={row.id || i} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 text-stone-600 tabular-nums font-medium">{row.time}</td>
                      <td className="px-5 py-3 text-stone-600">{row.type}</td>
                      <td className="px-5 py-3 text-stone-700 tabular-nums font-medium">{row.records}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium border ${row.statusClass}`}>{row.status}</span>
                        {row.note && <span className="ml-1.5 text-stone-400 text-[11px]">{row.note}</span>}
                      </td>
                      <td className="px-5 py-3 text-stone-600 tabular-nums">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Error Handling Note */}
            <div className="bg-stone-50 rounded-xl border border-black/10 px-5 py-4 flex items-start gap-3" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.20s' }}>
              <i className="ti ti-info-circle text-brand-600 text-lg shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-stone-700 mb-1">Error Handling Policy</div>
                <p className="text-xs text-stone-500 leading-relaxed">Auto-retry 3 times on failure &middot; Detailed error logs available in Audit Trail &middot; Admin is notified after 3 consecutive failures &middot; Sync will automatically recover once the error is resolved.</p>
              </div>
            </div>

          </div>
          {/* end D365 section */}

          {/* ==================== iPaper / CDN ==================== */}
          <div id="section-ipaper" ref={el => sectionRefs.current['ipaper'] = el} className="flex flex-col gap-5">

            {/* Header */}
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-lg font-bold text-stone-900">iPaper / CDN</h1>
                <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200">2 Active</span>
              </div>
              <p className="text-sm text-stone-500">Configure the digital catalogue channel (iPaper) and CDN storage for product assets (Azure Blob).</p>
            </div>

            {/* iPaper Config Card */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <i className="ti ti-file-description text-indigo-600 text-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">iPaper</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">Digital Catalogue Platform &middot; Last publish: 2 days ago</div>
                  </div>
                </div>
                <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1.5">
                  <i className="ti ti-external-link text-xs" /> Open iPaper Dashboard
                </button>
              </div>

              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">API Endpoint</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-link text-stone-400 text-sm shrink-0" />
                    <span className="text-xs font-mono text-stone-600 truncate">api.ipaper.io/v2</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">API Key</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-key text-stone-400 text-sm shrink-0" />
                    <span className="text-xs font-mono text-stone-400 flex-1">ip_••••••••••••••••3f8a</span>
                    <button className="text-brand-600 hover:text-brand-800 text-[11px] font-medium shrink-0 transition-colors">Rotate</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Organization ID</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-building text-stone-400 text-sm shrink-0" />
                    <span className="text-xs font-mono text-stone-600">org_eu_forma_studio</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Default Language</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-language text-stone-400 text-sm shrink-0" />
                    <span className="text-xs text-stone-600">English (en-GB)</span>
                  </div>
                </div>
              </div>

              {/* Catalogues Stats */}
              <div className="px-5 pb-5">
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Online</div>
                    <div className="text-sm font-bold text-stone-900 tabular-nums">14</div>
                    <div className="text-[11px] text-stone-400">Catalogues</div>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Draft</div>
                    <div className="text-sm font-bold text-amber-600 tabular-nums">3</div>
                    <div className="text-[11px] text-stone-400">Unpublished</div>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Products</div>
                    <div className="text-sm font-bold text-stone-900 tabular-nums">847</div>
                    <div className="text-[11px] text-stone-400">In catalogues</div>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Last Publish</div>
                    <div className="text-sm font-bold text-stone-900 tabular-nums">2d ago</div>
                    <div className="text-[11px] text-stone-400">14 Jun 2026</div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex justify-end gap-2">
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all">Test Connection</button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all">Save Changes</button>
              </div>
            </div>

            {/* CDN Config Card */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.11s' }}>
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                    <i className="ti ti-cloud text-cyan-600 text-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">CDN</span>
                      <span className="text-xs text-stone-400">(Azure Blob Storage)</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">Azure Blob Storage &middot; West Europe region</div>
                  </div>
                </div>
                <span className="text-xs text-stone-400 tabular-nums"><span className="font-semibold text-stone-700">48.3 GB</span> / 200 GB used</span>
              </div>

              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Storage Account</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-server text-stone-400 text-sm shrink-0" />
                    <span className="text-xs font-mono text-stone-600">pimassetsformastudio</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Container Name</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-box text-stone-400 text-sm shrink-0" />
                    <span className="text-xs font-mono text-stone-600">pim-assets-prod</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">CDN Endpoint (Public URL)</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-world text-stone-400 text-sm shrink-0" />
                    <span className="text-xs font-mono text-stone-600 truncate">cdn.pim.formastudio.eu</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Access Key</label>
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-stone-50 px-3 py-2">
                    <i className="ti ti-key text-stone-400 text-sm shrink-0" />
                    <span className="text-xs font-mono text-stone-400 flex-1">AzBl••••••••••••••••K9m=</span>
                    <button className="text-brand-600 hover:text-brand-800 text-[11px] font-medium shrink-0 transition-colors">Rotate</button>
                  </div>
                </div>
              </div>

              {/* CDN Stats */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Total Files</div>
                    <div className="text-sm font-bold text-stone-900 tabular-nums">12,847</div>
                    <div className="text-[11px] text-stone-400">Images &amp; Docs</div>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Used</div>
                    <div className="text-sm font-bold text-stone-900 tabular-nums">48.3 GB</div>
                    <div className="text-[11px] text-stone-400">of 200 GB</div>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Region</div>
                    <div className="text-sm font-bold text-stone-900">WEU</div>
                    <div className="text-[11px] text-stone-400">West Europe</div>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 border border-black/5">
                    <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Bandwidth</div>
                    <div className="text-sm font-bold text-green-600 tabular-nums">2.1 GB</div>
                    <div className="text-[11px] text-stone-400">This month</div>
                  </div>
                </div>

                {/* Storage bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1.5">
                    <span>Storage usage</span>
                    <span className="tabular-nums">48.3 / 200 GB (24%)</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>

              {/* Image processing toggles */}
              <div className="border-t border-black/5 px-5 py-4">
                <div className="text-xs font-semibold text-stone-700 mb-3">Image Processing</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-stone-700">Auto-generate WebP variants</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Automatically create WebP versions when uploading JPEG/PNG images</div>
                    </div>
                    <Toggle on={autoGenerateWebP} onChange={setAutoGenerateWebP} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-stone-700">Resize thumbnails on upload</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">320px, 640px, 1280px variants generated automatically</div>
                    </div>
                    <Toggle on={resizeThumbnails} onChange={setResizeThumbnails} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-stone-700">Enforce max file size (10 MB)</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Block uploads of image files larger than 10 MB</div>
                    </div>
                    <Toggle on={enforceMaxFileSize} onChange={setEnforceMaxFileSize} />
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex justify-end gap-2">
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all">Test Connection</button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all">Save Changes</button>
              </div>
            </div>

          </div>
          {/* end iPaper / CDN section */}

          {/* ==================== SOCIAL CHANNELS ==================== */}
          <div id="section-social" ref={el => sectionRefs.current['social'] = el} className="flex flex-col gap-5">

            {/* Header */}
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-lg font-bold text-stone-900">Social Channels</h1>
                <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-brand-50 text-brand-600 border border-brand-100">5 Channels</span>
              </div>
              <p className="text-sm text-stone-500">Connect social media accounts to publish product content directly from PIM. Tokens are encrypted and stored securely.</p>
            </div>

            {/* Connected Accounts */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <div className="px-5 py-4 border-b border-black/5">
                <h3 className="text-sm font-semibold text-stone-900">Connected Accounts</h3>
              </div>
              <div className="divide-y divide-black/5">

                {/* Meta */}
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                    <i className="ti ti-brand-meta text-white text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-stone-900">Meta</span>
                      <span className="text-xs text-stone-400">(Facebook + Instagram)</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">Token expires: <span className="font-medium text-stone-600 tabular-nums">12 Sep 2026</span> &middot; Meta Business Suite &middot; Granted: publish_actions, pages_manage_posts</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1">
                      <i className="ti ti-refresh text-xs" /> Re-auth
                    </button>
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:-translate-y-px active:scale-[0.98] transition-all">
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-sky-700 flex items-center justify-center shrink-0">
                    <i className="ti ti-brand-linkedin text-white text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-stone-900">LinkedIn</span>
                      <span className="text-xs text-stone-400">(Company Page)</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">Token expires: <span className="font-medium text-stone-600 tabular-nums">30 Aug 2026</span> &middot; LinkedIn Marketing API &middot; Granted: w_organization_social</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1">
                      <i className="ti ti-refresh text-xs" /> Re-auth
                    </button>
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:-translate-y-px active:scale-[0.98] transition-all">
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Pinterest */}
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                    <i className="ti ti-brand-pinterest text-white text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-stone-900">Pinterest</span>
                      <span className="text-xs text-stone-400">(Business Account)</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Expiring soon
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">Token expires: <span className="font-medium text-amber-600 tabular-nums">01 Jul 2026</span> &middot; Pinterest API v5 &middot; Granted: pins:read, pins:write, boards:write</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1">
                      <i className="ti ti-refresh text-xs" /> Re-auth now
                    </button>
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:-translate-y-px active:scale-[0.98] transition-all">
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* YouTube */}
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                    <i className="ti ti-brand-youtube text-stone-400 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-stone-400">YouTube</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-stone-100 text-stone-400 border border-stone-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" /> Not connected
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">YouTube Data API v3 &middot; No YouTube channel connected yet</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1.5">
                      <i className="ti ti-plug text-xs" /> Connect
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Publish Channels */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.11s' }}>
              <div className="px-5 py-4 border-b border-black/5">
                <h3 className="text-sm font-semibold text-stone-900">Publish Channels</h3>
              </div>
              <div className="divide-y divide-black/5">

                {/* iPaper */}
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <i className="ti ti-file-description text-indigo-600 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">iPaper</span>
                      <span className="text-xs text-stone-400">(Digital Catalogue)</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">API endpoint: <span className="font-mono text-stone-500 text-[11px]">api.ipaper.io/v2</span> &middot; Last publish: 2 days ago &middot; <span className="tabular-nums">14</span> catalogues online</div>
                  </div>
                  <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all shrink-0">Configure</button>
                </div>

                {/* CDN */}
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                    <i className="ti ti-cloud text-cyan-600 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">CDN</span>
                      <span className="text-xs text-stone-400">(Azure Blob Storage)</span>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">Container: <span className="font-mono text-stone-500 text-[11px]">pim-assets-prod</span> &middot; Region: West Europe &middot; <span className="tabular-nums">12,847</span> files &middot; <span className="tabular-nums">48.3</span> GB used</div>
                  </div>
                  <button className="rounded-lg px-3 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all shrink-0">Configure</button>
                </div>

              </div>
            </div>

            {/* Security Note */}
            <div className="bg-brand-50 rounded-xl border border-brand-100 px-5 py-4 flex items-start gap-3" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.14s' }}>
              <i className="ti ti-lock text-brand-600 text-lg shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-brand-800 mb-1">Security &amp; Token Policy</div>
                <p className="text-xs text-brand-700 leading-relaxed">Tokens stored securely with AES-256 encryption &middot; Re-authenticate 30 days before expiry &middot; One-click posting requires Creator &rarr; Publisher approval &middot; All API calls are logged in the Audit Trail.</p>
              </div>
            </div>

          </div>
          {/* end Social Channels section */}

          {/* ==================== MEMBERS ==================== */}
          <div id="section-members" ref={el => sectionRefs.current['members'] = el} className="flex flex-col gap-5">
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <h1 className="text-lg font-bold text-stone-900 mb-1">Team Members</h1>
              <p className="text-sm text-stone-500">Manage team members and their access permissions in PIM.</p>
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">Members <span className="tabular-nums text-stone-400 font-normal ml-1">{state.members.length}</span></h3>
                <button
                  onClick={openAddMember}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <i className="ti ti-plus text-xs" /> Invite Member
                </button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-black/5">
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Name</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Email</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Role</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Status</th>
                    <th className="text-left font-medium text-stone-400 px-5 py-2.5">Last Active</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {state.members.map((m) => (
                    <tr key={m.id || m.email} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${m.avatarClass}`}>{m.initials}</div>
                          <span className="font-medium text-stone-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500">{m.email}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium border ${ROLE_CLASS_MAP[m.role] || 'bg-stone-100 text-stone-500 border-stone-200'}`}>{m.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium border ${STATUS_CLASS_MAP[m.status] || 'bg-stone-100 text-stone-500 border-stone-200'}`}>{m.status}</span>
                      </td>
                      <td className="px-5 py-3 text-stone-400 tabular-nums">{m.lastActive}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditMember(m)}
                            className="p-1 text-stone-300 hover:text-brand-600 transition-colors rounded"
                            title="Edit member"
                          >
                            <i className="ti ti-pencil text-sm" />
                          </button>
                          {m.initials !== 'HC' && (
                            <button
                              onClick={() => handleDeleteMember(m)}
                              className="p-1 text-stone-300 hover:text-red-500 transition-colors rounded"
                              title="Delete member"
                            >
                              <i className="ti ti-trash text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================== ROLES ==================== */}
          <div id="section-roles" ref={el => sectionRefs.current['roles'] = el} className="flex flex-col gap-5">
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <h1 className="text-lg font-bold text-stone-900 mb-1">Role Permissions</h1>
              <p className="text-sm text-stone-500">Configure permissions for each role in the PIM system.</p>
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-black/5">
                    <th className="text-left font-medium text-stone-400 px-5 py-3">Permission</th>
                    <th className="text-center font-medium text-stone-400 px-4 py-3">Viewer</th>
                    <th className="text-center font-medium text-stone-400 px-4 py-3">Creator</th>
                    <th className="text-center font-medium text-stone-400 px-4 py-3">Publisher</th>
                    <th className="text-center font-medium text-stone-400 px-4 py-3">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {state.rolePermissions.map((perm) => (
                    <tr key={perm.label} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 text-stone-700 font-medium">{perm.label}</td>
                      <PermCell value={perm.viewer} />
                      <PermCell value={perm.creator} />
                      <PermCell value={perm.publisher} />
                      <PermCell value={perm.admin} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================== COMPLETENESS ==================== */}
          <div id="section-completeness" ref={el => sectionRefs.current['completeness'] = el} className="flex flex-col gap-5">
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <h1 className="text-lg font-bold text-stone-900 mb-1">Completeness Rules</h1>
              <p className="text-sm text-stone-500">Define required fields and scoring weights for the product completeness score.</p>
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-stone-900">Completeness Scoring</div>
                <div className="text-xs text-stone-400">Total: <span className="font-semibold text-stone-700 tabular-nums">100%</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 rounded-lg p-4 border border-black/5">
                  <div className="text-xs font-semibold text-stone-700 mb-3 flex items-center gap-2">
                    <span className="rounded-md px-2 py-0.5 text-[11px] bg-green-50 text-green-700 border border-green-200">Required</span>
                    Core Fields
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      { label: 'Product Name (EN + DE)', pct: '+20%' },
                      { label: 'Description (EN)', pct: '+15%' },
                      { label: 'Hero Image (min 1)', pct: '+20%' },
                      { label: 'Category', pct: '+10%' },
                      { label: 'Dimensions (W×D×H)', pct: '+10%' },
                    ].map(item => (
                      <li key={item.label} className="flex items-center justify-between text-xs">
                        <span className="text-stone-600">{item.label}</span>
                        <span className="tabular-nums font-semibold text-green-600">{item.pct}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-black/5 flex justify-between text-xs">
                    <span className="text-stone-400">Subtotal</span>
                    <span className="tabular-nums font-bold text-stone-700">75%</span>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-lg p-4 border border-black/5">
                  <div className="text-xs font-semibold text-stone-700 mb-3 flex items-center gap-2">
                    <span className="rounded-md px-2 py-0.5 text-[11px] bg-amber-50 text-amber-700 border border-amber-200">Optional</span>
                    Rich Content
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      { label: 'Description (FR / NL)', pct: '+5%' },
                      { label: 'Lifestyle Images (min 3)', pct: '+10%' },
                      { label: 'Technical Spec PDF', pct: '+5%' },
                      { label: 'Materials & Finishes', pct: '+5%' },
                    ].map(item => (
                      <li key={item.label} className="flex items-center justify-between text-xs">
                        <span className="text-stone-600">{item.label}</span>
                        <span className="tabular-nums font-semibold text-amber-600">{item.pct}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-black/5 flex justify-between text-xs">
                    <span className="text-stone-400">Subtotal</span>
                    <span className="tabular-nums font-bold text-stone-700">25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== PUBLISH RULES ==================== */}
          <div id="section-publish" ref={el => sectionRefs.current['publish'] = el} className="flex flex-col gap-5">
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <h1 className="text-lg font-bold text-stone-900 mb-1">Publish Rules</h1>
              <p className="text-sm text-stone-500">Automated checks applied before publishing products to any channel.</p>
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <div className="space-y-0 divide-y divide-black/5">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-medium text-stone-800">Minimum completeness score</div>
                    <div className="text-xs text-stone-400 mt-0.5">Products must reach at least X% completeness before publishing</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minimumCompletenessScore}
                      onChange={e => setMinimumCompletenessScore(Number(e.target.value))}
                      className="w-16 text-sm tabular-nums font-semibold text-center border border-black/10 rounded-lg py-1.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <span className="text-sm text-stone-400">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-medium text-stone-800">Hero image required</div>
                    <div className="text-xs text-stone-400 mt-0.5">At least 1 hero image is required before publishing</div>
                  </div>
                  <Toggle on={heroImageRequired} onChange={setHeroImageRequired} />
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-medium text-stone-800">Publisher approval required for social</div>
                    <div className="text-xs text-stone-400 mt-0.5">Creators must obtain Publisher approval before posting to social channels</div>
                  </div>
                  <Toggle on={publisherApprovalRequired} onChange={setPublisherApprovalRequired} />
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-medium text-stone-800">Block publish on active D365 sync</div>
                    <div className="text-xs text-stone-400 mt-0.5">Pause publishing while D365 sync is running (prevents data conflicts)</div>
                  </div>
                  <Toggle on={blockPublishOnD365Sync} onChange={setBlockPublishOnD365Sync} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-black/5 flex justify-end gap-2">
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all">Cancel</button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all">Save Changes</button>
              </div>
            </div>
          </div>

          {/* ==================== NOTIFICATIONS ==================== */}
          <div id="section-notif" ref={el => sectionRefs.current['notif'] = el} className="flex flex-col gap-5">
            <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>
              <h1 className="text-lg font-bold text-stone-900 mb-1">Notifications</h1>
              <p className="text-sm text-stone-500">Configure email and in-app notifications for PIM events.</p>
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card p-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.08s' }}>
              <div className="grid grid-cols-[1fr_80px_80px] gap-0">
                <div className="pb-3 border-b border-black/5 text-[10px] font-medium text-stone-400 uppercase tracking-widest">Event</div>
                <div className="pb-3 border-b border-black/5 text-[10px] font-medium text-stone-400 uppercase tracking-widest text-center">Email</div>
                <div className="pb-3 border-b border-black/5 text-[10px] font-medium text-stone-400 uppercase tracking-widest text-center">In-app</div>

                {state.notificationEvents.map((n, idx) => (
                  <>
                    <div key={`ev-${idx}`} className={`py-3.5 ${idx < state.notificationEvents.length - 1 ? 'border-b border-black/5' : ''}`}>
                      <div className="text-sm font-medium text-stone-800">{n.label}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{n.desc}</div>
                    </div>
                    <div key={`email-${idx}`} className={`py-3.5 flex items-center justify-center ${idx < state.notificationEvents.length - 1 ? 'border-b border-black/5' : ''}`}>
                      <Toggle
                        on={n.email}
                        onChange={() => updateNotification({ label: n.label, email: !n.email })}
                      />
                    </div>
                    <div key={`inapp-${idx}`} className={`py-3.5 flex items-center justify-center ${idx < state.notificationEvents.length - 1 ? 'border-b border-black/5' : ''}`}>
                      <Toggle
                        on={n.inapp}
                        onChange={() => updateNotification({ label: n.label, inapp: !n.inapp })}
                      />
                    </div>
                  </>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-black/5 flex justify-end gap-2">
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium border border-black/10 bg-white text-stone-600 hover:bg-stone-50 hover:-translate-y-px active:scale-[0.98] transition-all">Cancel</button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all">Save Preferences</button>
              </div>
            </div>
          </div>

        </div>
        {/* end right content */}

      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-black/10 bg-white flex items-center justify-between text-[11px] text-stone-400">
        <span>PIM Studio v2.4.1 &middot; Connected to D365</span>
        <span>&copy; 2026 Forma Studio GmbH</span>
      </footer>

      {/* ==================== MEMBER MODAL ==================== */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
            <h2 className="text-sm font-semibold text-stone-900 mb-4">
              {editMember ? 'Edit Member' : 'Invite Member'}
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="member-name" className="text-xs font-medium text-stone-500">Full Name</label>
                <input
                  id="member-name"
                  type="text"
                  value={memberForm.name || ''}
                  onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="member-email" className="text-xs font-medium text-stone-500">Email</label>
                <input
                  id="member-email"
                  type="email"
                  value={memberForm.email || ''}
                  onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. jane@formastudio.eu"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="member-role" className="text-xs font-medium text-stone-500">Role</label>
                <select
                  id="member-role"
                  value={memberForm.role || ''}
                  onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                >
                  <option value="">Select role…</option>
                  <option value="Admin">Admin</option>
                  <option value="Publisher">Publisher</option>
                  <option value="Creator">Creator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={() => setShowMemberModal(false)}
                className="px-4 py-2 text-sm text-stone-600 border border-black/10 rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={saveMember}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
              >
                {editMember ? 'Save Changes' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-amber {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse-amber { animation: pulse-amber 1.4s ease-in-out infinite; }
      `}</style>
    </Layout>
  )
}

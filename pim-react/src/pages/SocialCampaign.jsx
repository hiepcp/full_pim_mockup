import { useState } from 'react'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'
import { useFilter } from '../store/useFilter.js'

const CHANNEL_OPTIONS = ['Instagram', 'Facebook', 'LinkedIn', 'Pinterest']

const STATUS_TABS = ['All', 'Active', 'Draft', 'Scheduled', 'Ended']

const CHANNEL_ICON_MAP = {
  Facebook:  { icon: 'ti-brand-facebook',  iconColor: 'text-blue-500'  },
  Instagram: { icon: 'ti-brand-instagram', iconColor: 'text-pink-500'  },
  LinkedIn:  { icon: 'ti-brand-linkedin',  iconColor: 'text-blue-700'  },
  YouTube:   { icon: 'ti-brand-youtube',   iconColor: 'text-red-500'   },
  Pinterest: { icon: 'ti-brand-pinterest', iconColor: 'text-red-600'   },
}

const STATUS_COLOR_MAP = {
  Scheduled: 'bg-blue-500/90 text-white',
  Posted:    'bg-green-500/90 text-white',
  Active:    'bg-green-500/90 text-white',
  Draft:     'bg-stone-800/80 text-stone-200',
  Ended:     'bg-stone-400/80 text-white',
}

const CAMPAIGN_IMGS = [
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=320&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=320&h=80&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=320&h=80&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=320&h=80&fit=crop&q=80',
]

function getCampaignImg(campaign, index) {
  return CAMPAIGN_IMGS[index % CAMPAIGN_IMGS.length]
}

const SCHEDULE_ROWS = [
  {
    platform: 'Facebook',
    icon: 'ti-brand-facebook',
    iconColor: 'text-blue-500',
    channel: 'Pages',
    date: '20 Mar 2026',
    time: '10:00',
    status: 'Scheduled',
  },
  {
    platform: 'Instagram',
    icon: 'ti-brand-instagram',
    iconColor: 'text-pink-500',
    channel: 'Feed',
    date: '20 Mar 2026',
    time: '10:00',
    status: 'Scheduled',
  },
  {
    platform: 'LinkedIn',
    icon: 'ti-brand-linkedin',
    iconColor: 'text-blue-700',
    channel: 'Company Page',
    date: '20 Mar 2026',
    time: '14:00',
    status: 'Scheduled',
  },
]

const PLATFORM_CHANNELS = [
  { icon: 'ti-brand-facebook',  iconColor: 'text-blue-500',  label: 'Facebook Pages',    dot: 'bg-green-400' },
  { icon: 'ti-brand-instagram', iconColor: 'text-pink-500',  label: 'IG Feed / Story',   dot: 'bg-green-400' },
  { icon: 'ti-brand-linkedin',  iconColor: 'text-blue-700',  label: 'LinkedIn Company',  dot: 'bg-green-400' },
  { icon: 'ti-brand-youtube',   iconColor: 'text-red-500',   label: 'YouTube Channel',   dot: 'bg-amber-400' },
  { icon: 'ti-brand-pinterest', iconColor: 'text-red-600',   label: 'Pinterest Board',   dot: 'bg-amber-400' },
]

const PLATFORM_TABS = [
  { key: 'facebook',  icon: 'ti-brand-facebook',  iconColor: 'text-blue-500',  label: 'Facebook'  },
  { key: 'instagram', icon: 'ti-brand-instagram', iconColor: 'text-pink-500',  label: 'Instagram' },
  { key: 'linkedin',  icon: 'ti-brand-linkedin',  iconColor: 'text-blue-700',  label: 'LinkedIn'  },
  { key: 'youtube',   icon: 'ti-brand-youtube',   iconColor: 'text-red-500',   label: 'YouTube'   },
  { key: 'pinterest', icon: 'ti-brand-pinterest', iconColor: 'text-red-600',   label: 'Pinterest' },
]

const CAMPAIGN_ASSETS = [
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=100&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=100&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=100&h=100&fit=crop&q=80',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=100&h=100&fit=crop&q=80',
]

const STEPS = [
  { num: 1, label: 'Select Assets', state: 'done' },
  { num: 2, label: 'AI Content',    state: 'done' },
  { num: 3, label: 'Design',        state: 'current' },
  { num: 4, label: 'Schedule',      state: 'upcoming' },
  { num: 5, label: 'Publish',       state: 'upcoming' },
]

export default function SocialCampaign() {
  const { state, addCampaign, updateCampaign, deleteCampaign } = useData()

  const { query, setQuery, activeFilter, setActiveFilter, filtered } =
    useFilter(state.campaigns, ['name'], 'status')

  const [selectedCampaignId, setSelectedCampaignId] = useState(
    state.campaigns[0]?.id || null
  )
  const [selectedPlatformTab, setSelectedPlatformTab] = useState('instagram')
  const [selectedDesignOption, setSelectedDesignOption] = useState('as-is')
  const [isAutoPublishOn, setIsAutoPublishOn] = useState(true)
  const [captionText] = useState(
    'Where comfort meets craftsmanship. The Greenwood Chair — built to last, designed to inspire.'
  )
  const [hashtags] = useState(['#interiordesign', '#europeanfurniture', '#formastudio', '#furnituredesign'])

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})

  function openAdd() {
    setEditItem(null)
    setForm({ name: '', status: 'Draft', channels: [], startDate: '', endDate: '' })
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({ ...item })
    setShowModal(true)
  }

  function handleSave() {
    if (editItem) {
      updateCampaign(form)
    } else {
      addCampaign(form)
    }
    setShowModal(false)
  }

  function handleDelete(item) {
    if (window.confirm('Delete this item?')) {
      deleteCampaign(item.id)
      if (selectedCampaignId === item.id) {
        const remaining = state.campaigns.filter(c => c.id !== item.id)
        setSelectedCampaignId(remaining[0]?.id || null)
      }
    }
  }

  function handleChannelToggle(ch) {
    const current = form.channels || []
    if (current.includes(ch)) {
      setForm({ ...form, channels: current.filter(c => c !== ch) })
    } else {
      setForm({ ...form, channels: [...current, ch] })
    }
  }

  const selectedCampaign = state.campaigns.find(c => c.id === selectedCampaignId)

  return (
    <Layout>
      {/* TOPBAR */}
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-stone-400">Publishing</span>
          <i className="ti ti-chevron-right text-stone-300 text-xs"></i>
          <span className="font-medium text-stone-800">Social Campaign</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-600 border border-black/10 hover:-translate-y-px active:scale-[0.98] transition-all">
            <i className="ti ti-filter text-xs"></i> Filter
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all shadow-sm"
          >
            <i className="ti ti-plus text-xs"></i> New Campaign
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-6 flex flex-col gap-5">

        {/* STATS ROW */}
        <div className="grid grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Total Campaigns</div>
            <div className="text-2xl font-bold tabnum text-stone-900">{state.campaigns.length}</div>
            <div className="text-[11px] text-stone-400 mt-1">
              {state.campaigns.filter(c => c.status === 'Active' || c.status === 'Scheduled').length} active,{' '}
              {state.campaigns.filter(c => c.status === 'Draft').length} draft
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Platforms Connected</div>
            <div className="text-2xl font-bold tabnum text-stone-900">5</div>
            <div className="text-[11px] text-stone-400 mt-1">FB, IG, LI, YT, PT</div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Posts Scheduled</div>
            <div className="text-2xl font-bold tabnum text-brand-600">12</div>
            <div className="text-[11px] text-stone-400 mt-1">Next: 20 Mar 2026</div>
          </div>
          <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">Assets Used</div>
            <div className="text-2xl font-bold tabnum text-stone-900">38</div>
            <div className="text-[11px] text-stone-400 mt-1">100% from PIM</div>
          </div>
        </div>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="flex gap-5 items-start animate-fade-up" style={{ animationDelay: '0.1s' }}>

          {/* LEFT: CAMPAIGN LIST */}
          <div className="w-[280px] shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-stone-700">All Campaigns</h2>
              <span className="text-[11px] text-stone-400">{state.campaigns.length} total</span>
            </div>

            {/* Search */}
            <div className="relative">
              <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search campaign..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-black/10 text-[12px] text-stone-700 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    activeFilter === tab
                      ? 'bg-brand-600 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Campaign cards */}
            <div className="flex flex-col gap-2">
              {filtered.map((camp, index) => {
                const isSelected = camp.id === selectedCampaignId
                const statusColor = STATUS_COLOR_MAP[camp.status] || 'bg-stone-400/80 text-white'
                const campImg = getCampaignImg(camp, index)
                const channelIcons = (camp.channels || []).map(ch => CHANNEL_ICON_MAP[ch]?.icon).filter(Boolean)
                return (
                  <div
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-400 shadow-hover'
                        : 'border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px'
                    }`}
                  >
                    <div className="overflow-hidden relative" style={{ height: isSelected ? '80px' : '64px' }}>
                      <img
                        src={campImg}
                        alt={camp.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-end p-2">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${statusColor}`}>
                          {camp.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-[11px] tabnum text-stone-400 font-mono">{camp.id}</div>
                          <div className="text-[13px] font-semibold text-stone-900 mt-0.5 leading-tight">{camp.name}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(camp)}
                            className="p-1 rounded-md text-stone-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit"
                          >
                            <i className="ti ti-pencil text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(camp)}
                            className="p-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <i className="ti ti-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        {channelIcons.map((p, i) => (
                          <i key={i} className={`ti ${p} text-xs`}></i>
                        ))}
                        <span className="ml-0.5">{(camp.channels || []).length} platforms</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-black/5 text-[11px] text-stone-400 flex items-center gap-1">
                        {camp.endDate ? (
                          <>
                            <i className="ti ti-calendar-event text-xs"></i>
                            <span>
                              {camp.status === 'Posted' || camp.status === 'Active' ? 'Posted: ' : 'Scheduled: '}
                              <span className="tabnum font-medium text-stone-600">{camp.endDate}</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <i className="ti ti-pencil text-xs"></i>
                            <span>Draft — not scheduled</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: CAMPAIGN BUILDER */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Campaign Header */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
              {/* Hero banner */}
              <div className="h-[110px] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&h=160&fit=crop&q=85"
                  className="w-full h-full object-cover"
                  alt="Greenwood Spring"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/30 to-transparent flex items-center px-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] tabnum font-mono text-stone-300">
                        {selectedCampaign?.id || 'CAMP-2026-003'}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR_MAP[selectedCampaign?.status] || 'bg-blue-500/80 text-white'}`}>
                        {selectedCampaign?.status || 'Scheduled'}
                      </span>
                    </div>
                    <h1 className="text-lg font-bold text-white leading-tight">
                      {selectedCampaign?.name || 'Greenwood Spring Launch'}
                    </h1>
                    <div className="text-[11px] text-stone-300 mt-0.5">
                      {(selectedCampaign?.channels || []).length} platforms &middot; Publish:{' '}
                      <span className="tabnum font-medium text-white">
                        {selectedCampaign?.endDate || '20 Mar 2026'}, 10:00 CET
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <img src="https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=32&h=32&fit=crop&q=80" className="w-7 h-7 rounded-md object-cover ring-2 ring-white" alt="" />
                    <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=32&h=32&fit=crop&q=80" className="w-7 h-7 rounded-md object-cover ring-2 ring-white" alt="" />
                    <img src="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=32&h=32&fit=crop&q=80" className="w-7 h-7 rounded-md object-cover ring-2 ring-white" alt="" />
                    <div className="w-7 h-7 rounded-md bg-stone-100 ring-2 ring-white flex items-center justify-center text-[9px] font-semibold text-stone-500">+3</div>
                  </div>
                  <span className="text-[11px] text-stone-400">6 assets ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-600 border border-black/10 hover:-translate-y-px transition-all">
                    <i className="ti ti-eye text-xs"></i> Preview All
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px transition-all shadow-sm">
                    <i className="ti ti-rocket text-xs"></i> Publish Now
                  </button>
                </div>
              </div>
            </div>

            {/* 5-STEP PROGRESS BAR */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card px-6 py-4 animate-fade-up" style={{ animationDelay: '0.12s' }}>
              <div className="flex items-center">
                {STEPS.map((step, idx) => (
                  <div key={step.num} className="contents">
                    <div className="flex flex-col items-center">
                      {step.state === 'done' && (
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                          <i className="ti ti-check text-green-600 text-sm"></i>
                        </div>
                      )}
                      {step.state === 'current' && (
                        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center ring-4 ring-brand-100">
                          <span className="text-white text-xs font-semibold">{step.num}</span>
                        </div>
                      )}
                      {step.state === 'upcoming' && (
                        <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-stone-300 flex items-center justify-center">
                          <span className="text-stone-400 text-xs font-semibold">{step.num}</span>
                        </div>
                      )}
                      <div className={`text-[11px] mt-1.5 whitespace-nowrap font-medium ${
                        step.state === 'done' ? 'text-green-600' :
                        step.state === 'current' ? 'font-semibold text-brand-600' :
                        'text-stone-400'
                      }`}>
                        {step.label}
                      </div>
                      <div className={`text-[10px] ${step.state === 'upcoming' ? 'text-stone-300' : 'text-stone-400'}`}>
                        Step {step.num}
                      </div>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        idx === 0 ? 'bg-green-200' :
                        idx === 1 ? 'bg-brand-100' :
                        'bg-stone-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 3 CONTENT — Design */}
            <div className="flex gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>

              {/* LEFT: Asset Preview + Options */}
              <div className="w-[240px] shrink-0 flex flex-col gap-3">
                <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
                  {/* Asset thumbnail */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=480&h=480&fit=crop&q=85"
                      alt="Greenwood Chair"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                      <span className="bg-white/90 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-stone-600 shadow-sm">Packshot</span>
                      <span className="bg-green-500/90 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">Approved</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-[12px] font-semibold text-stone-800">Greenwood Chair</div>
                    <div className="text-[11px] text-stone-400 mt-0.5 tabnum">SKU: 30317 &middot; Packshot Hero</div>
                    <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-1">
                      <i className="ti ti-dimensions text-xs"></i>
                      <span className="tabnum">3840 &times; 3840 px &middot; PNG</span>
                    </div>
                  </div>
                </div>

                {/* Design options */}
                <div className="bg-white rounded-xl border border-black/10 shadow-card p-3.5">
                  <div className="text-[11px] font-semibold text-stone-600 mb-2 uppercase tracking-wide">Design Options</div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setSelectedDesignOption('as-is')}>
                      <div className="w-4 h-4 rounded-full border-2 border-brand-600 flex items-center justify-center shrink-0">
                        {selectedDesignOption === 'as-is' && <div className="w-2 h-2 rounded-full bg-brand-600"></div>}
                      </div>
                      <span className="text-[12px] text-stone-700 group-hover:text-stone-900">Use as-is</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setSelectedDesignOption('canva')}>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selectedDesignOption === 'canva' ? 'border-brand-600' : 'border-stone-300'}`}>
                        {selectedDesignOption === 'canva' && <div className="w-2 h-2 rounded-full bg-brand-600"></div>}
                      </div>
                      <span className={`text-[12px] group-hover:text-stone-700 ${selectedDesignOption === 'canva' ? 'text-stone-700' : 'text-stone-500'}`}>Customize in Canva</span>
                      <i className="ti ti-external-link text-[10px] text-stone-400"></i>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setSelectedDesignOption('ai-crop')}>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selectedDesignOption === 'ai-crop' ? 'border-brand-600' : 'border-stone-300'}`}>
                        {selectedDesignOption === 'ai-crop' && <div className="w-2 h-2 rounded-full bg-brand-600"></div>}
                      </div>
                      <span className={`text-[12px] group-hover:text-stone-700 ${selectedDesignOption === 'ai-crop' ? 'text-stone-700' : 'text-stone-500'}`}>AI crop for platform</span>
                      <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-purple-50 text-purple-600">AI</span>
                    </label>
                  </div>
                </div>

                {/* Campaign asset strip */}
                <div className="bg-white rounded-xl border border-black/10 shadow-card p-3">
                  <div className="text-[11px] font-semibold text-stone-600 mb-2 uppercase tracking-wide flex items-center justify-between">
                    <span>Campaign Assets</span>
                    <span className="text-[10px] text-stone-400 font-normal normal-case">6 selected</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="aspect-square rounded-lg overflow-hidden ring-2 ring-brand-400 relative">
                      <img src={CAMPAIGN_ASSETS[0]} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-brand-600 flex items-center justify-center">
                        <i className="ti ti-check text-white" style={{ fontSize: '8px' }}></i>
                      </div>
                    </div>
                    {CAMPAIGN_ASSETS.slice(1).map((src, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden">
                        <img src={src} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                    <div className="aspect-square rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors">
                      <i className="ti ti-plus text-stone-400 text-lg"></i>
                    </div>
                  </div>
                </div>

                {/* AI content card */}
                <div className="bg-brand-50 rounded-xl border border-brand-100 p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <i className="ti ti-sparkles text-brand-600 text-sm"></i>
                    <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">AI Generated</span>
                  </div>
                  <div className="text-[11px] text-stone-600 leading-relaxed">
                    Caption &amp; hashtags generated based on product attributes from PIM.
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-600 font-medium cursor-pointer hover:underline">
                    <i className="ti ti-refresh text-xs"></i> Regenerate content
                  </div>
                </div>
              </div>

              {/* RIGHT: Platform Preview */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
                  {/* Platform tabs */}
                  <div className="flex items-center border-b border-black/10 px-4 gap-0 overflow-x-auto">
                    {PLATFORM_TABS.map((tab) => {
                      const isActive = selectedPlatformTab === tab.key
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setSelectedPlatformTab(tab.key)}
                          className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] transition-colors border-b-2 whitespace-nowrap ${
                            isActive
                              ? 'font-semibold text-brand-600 border-brand-600'
                              : 'text-stone-400 hover:text-stone-700 border-transparent hover:border-stone-200'
                          }`}
                        >
                          <i className={`ti ${tab.icon} text-sm ${tab.iconColor}`}></i> {tab.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Instagram Preview */}
                  <div className="p-5 flex gap-5">
                    {/* Mock phone frame */}
                    <div className="shrink-0 w-[190px]">
                      <div className="bg-stone-800 rounded-[20px] p-2 shadow-xl">
                        {/* IG app mockup */}
                        <div className="bg-white rounded-[14px] overflow-hidden">
                          {/* IG header */}
                          <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600"></div>
                              <span className="text-[9px] font-semibold text-stone-800">formastudio.eu</span>
                            </div>
                            <i className="ti ti-dots text-[10px] text-stone-500"></i>
                          </div>
                          {/* Image area */}
                          <div className="aspect-square overflow-hidden">
                            <img
                              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop&q=85"
                              alt="Greenwood Spring"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* IG actions */}
                          <div className="px-3 py-2">
                            <div className="flex items-center gap-2 mb-1.5">
                              <i className="ti ti-heart text-[12px] text-stone-600"></i>
                              <i className="ti ti-message-circle text-[12px] text-stone-600"></i>
                              <i className="ti ti-send text-[12px] text-stone-600"></i>
                            </div>
                            <div className="text-[8px] font-semibold text-stone-800 leading-relaxed">
                              Where comfort meets craftsmanship. The Greenwood Chair.
                            </div>
                            <div className="text-[7px] text-blue-500 mt-1 leading-relaxed">#interiordesign #europeanfurniture</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-2 text-[10px] text-stone-400 tabnum">1080 &times; 1080 &middot; IG Grid</div>
                    </div>

                    {/* Caption & details */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wide">Caption</span>
                          <div className="flex items-center gap-2">
                            <button className="text-[11px] text-brand-600 hover:underline font-medium">Edit caption</button>
                            <span className="text-stone-300">|</span>
                            <button className="text-[11px] text-purple-600 hover:underline font-medium flex items-center gap-0.5">
                              <i className="ti ti-sparkles text-xs"></i> Regenerate with AI
                            </button>
                          </div>
                        </div>
                        <div className="bg-stone-50 rounded-lg border border-black/10 p-3 text-[13px] text-stone-700 leading-relaxed">
                          {captionText}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wide">Hashtags</span>
                          <span className="text-[11px] tabnum text-stone-400">{hashtags.length} / 30</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {hashtags.map((tag) => (
                            <span key={tag} className="rounded-full bg-blue-50 text-blue-600 px-2.5 py-0.5 text-[11px] font-medium">
                              {tag}
                            </span>
                          ))}
                          <button className="rounded-full bg-stone-100 text-stone-500 px-2.5 py-0.5 text-[11px] font-medium hover:bg-stone-200 transition-colors">
                            <i className="ti ti-plus text-[10px]"></i> Add
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-stone-50 rounded-lg border border-black/10 p-3">
                          <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wide mb-1">Format</div>
                          <div className="text-[12px] font-semibold text-stone-800 tabnum">1080 &times; 1080</div>
                          <div className="text-[11px] text-stone-400">IG Grid &middot; Square</div>
                        </div>
                        <div className="bg-stone-50 rounded-lg border border-black/10 p-3">
                          <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wide mb-1">Aspect Ratio</div>
                          <div className="text-[12px] font-semibold text-stone-800 tabnum">1:1</div>
                          <div className="text-[11px] text-stone-400">Feed optimized</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-600 border border-black/10 hover:-translate-y-px transition-all">
                          <i className="ti ti-copy text-xs"></i> Duplicate for Story
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-600 border border-black/10 hover:-translate-y-px transition-all">
                          <i className="ti ti-external-link text-xs"></i> Edit in Canva
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 border border-green-200 hover:-translate-y-px transition-all ml-auto">
                          <i className="ti ti-check text-xs"></i> Approve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHEDULE SECTION */}
                <div className="bg-white rounded-xl border border-black/10 shadow-card p-5 animate-fade-up" style={{ animationDelay: '0.18s' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[13px] font-semibold text-stone-800">Step 4 &mdash; Schedule</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">Set publish time for each platform</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] text-stone-600 font-medium">Auto-publish</span>
                      {/* Toggle switch */}
                      <button
                        onClick={() => setIsAutoPublishOn((v) => !v)}
                        className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${isAutoPublishOn ? 'bg-brand-600' : 'bg-stone-300'}`}
                      >
                        <div
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                          style={{ transform: isAutoPublishOn ? 'translateX(16px)' : 'translateX(2px)' }}
                        ></div>
                      </button>
                      <span className={`text-[11px] font-medium ${isAutoPublishOn ? 'text-green-600' : 'text-stone-400'}`}>
                        {isAutoPublishOn ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-black/10">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-stone-50 border-b border-black/10">
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Platform</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Channel</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Date</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Time (CET)</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04]">
                        {SCHEDULE_ROWS.map((row) => (
                          <tr key={row.platform} className="hover:bg-stone-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <i className={`ti ${row.icon} ${row.iconColor} text-base`}></i>
                                <span className="font-medium text-stone-800">{row.platform}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-stone-500">{row.channel}</td>
                            <td className="px-4 py-3 tabnum font-medium text-stone-700">{row.date}</td>
                            <td className="px-4 py-3 tabnum text-stone-700">{row.time}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600">{row.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>

              {/* Platform channels info */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
                <h3 className="text-[12px] font-semibold text-stone-700 mb-3">Platform Channels</h3>
                <div className="grid grid-cols-5 gap-2">
                  {PLATFORM_CHANNELS.map((ch) => (
                    <div key={ch.label} className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-stone-50 border border-black/[0.06]">
                      <i className={`ti ${ch.icon} text-xl ${ch.iconColor}`}></i>
                      <span className="text-[9px] text-stone-500 text-center leading-tight">{ch.label}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${ch.dot}`}></span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span> Connected
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span> Setup needed
                  </span>
                </div>
              </div>

              {/* Workflow rules note */}
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <div className="flex items-start gap-2.5">
                  <i className="ti ti-shield-check text-amber-600 text-lg shrink-0 mt-0.5"></i>
                  <div>
                    <div className="text-[12px] font-semibold text-amber-800 mb-2">Publishing Rules</div>
                    <ul className="text-[11px] text-amber-700 space-y-1.5 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <i className="ti ti-check text-[10px] text-amber-600 mt-0.5 shrink-0"></i>
                        <span><strong>100% assets from PIM</strong> &mdash; no direct uploads to social media</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <i className="ti ti-check text-[10px] text-amber-600 mt-0.5 shrink-0"></i>
                        <span>AI-generated content is reviewed and approved before publishing</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <i className="ti ti-check text-[10px] text-amber-600 mt-0.5 shrink-0"></i>
                        <span><strong>Role workflow:</strong> Creator &rarr; Approver &rarr; Publisher</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <i className="ti ti-check text-[10px] text-amber-600 mt-0.5 shrink-0"></i>
                        <span>Full audit log of all publishing activity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* STEP NAV */}
            <div className="flex items-center justify-between pt-1 animate-fade-up" style={{ animationDelay: '0.22s' }}>
              <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium bg-white text-stone-600 border border-black/10 hover:-translate-y-px active:scale-[0.98] transition-all shadow-card">
                <i className="ti ti-arrow-left text-xs"></i> Back: AI Content
              </button>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium bg-white text-stone-600 border border-black/10 hover:-translate-y-px transition-all shadow-card">
                  <i className="ti ti-device-floppy text-xs"></i> Save Draft
                </button>
                <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 hover:-translate-y-px active:scale-[0.98] transition-all shadow-sm">
                  Next: Schedule <i className="ti ti-arrow-right text-xs"></i>
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="px-6 py-3 border-t border-black/10 bg-white flex items-center justify-between text-[11px] text-stone-400">
        <span>PIM Studio v2.4.1 &middot; Connected to D365 &middot; &copy; 2026 Forma Studio GmbH</span>
        <span className="tabnum">Social Campaign &middot; {selectedCampaign?.id || 'CAMP-2026-003'} &middot; Step 3/5</span>
      </footer>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
            <h2 className="text-[15px] font-semibold text-stone-800 mb-4">
              {editItem ? 'Edit Campaign' : 'New Campaign'}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="camp-name" className="block text-[11px] font-medium text-stone-500 mb-1">Name</label>
                <input
                  id="camp-name"
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Campaign name"
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label htmlFor="camp-status" className="block text-[11px] font-medium text-stone-500 mb-1">Status</label>
                <select
                  id="camp-status"
                  value={form.status || 'Draft'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
                >
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Active">Active</option>
                  <option value="Ended">Ended</option>
                  <option value="Posted">Posted</option>
                </select>
              </div>
              <div>
                <div className="block text-[11px] font-medium text-stone-500 mb-1">Channels</div>
                <div className="flex flex-wrap gap-2">
                  {CHANNEL_OPTIONS.map((ch) => (
                    <label key={ch} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form.channels || []).includes(ch)}
                        onChange={() => handleChannelToggle(ch)}
                        className="rounded border-stone-300 text-brand-600"
                      />
                      <span className="text-[12px] text-stone-700">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="camp-start" className="block text-[11px] font-medium text-stone-500 mb-1">Start Date</label>
                  <input
                    id="camp-start"
                    type="date"
                    value={form.startDate || ''}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label htmlFor="camp-end" className="block text-[11px] font-medium text-stone-500 mb-1">End Date</label>
                  <input
                    id="camp-end"
                    type="date"
                    value={form.endDate || ''}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
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
                {editItem ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

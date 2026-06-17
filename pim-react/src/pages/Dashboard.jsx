import { useState } from 'react'
import { Link } from 'react-router-dom'

const quickStats = [
  { label: 'Products', value: '4,821', sub: 'active SKUs' },
  { label: 'Images', value: '18,340', sub: 'total assets' },
  { label: 'Documents', value: '2,156', sub: 'documents' },
  { label: 'Campaigns', value: '47', sub: 'active campaigns' },
]

const catalogueCards = [
  {
    to: '/products',
    icon: 'ti-box',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-100',
    iconColor: 'text-blue-600',
    badge: 'products.html',
    badgeColor: 'text-blue-600 bg-blue-50 border-blue-100',
    title: 'Products',
    titleHover: 'group-hover:text-brand-600',
    arrowHover: 'group-hover:text-brand-600',
    desc: 'Full SKU list with technical attributes, pricing and channel-specific publication status for all distribution channels.',
    meta1: '4,821 SKUs',
    meta2: 'Last sync: 12m ago',
  },
  {
    to: '/product-sets',
    icon: 'ti-components',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-100',
    iconColor: 'text-blue-600',
    badge: 'product-sets.html',
    badgeColor: 'text-blue-600 bg-blue-50 border-blue-100',
    title: 'Product Sets',
    titleHover: 'group-hover:text-brand-600',
    arrowHover: 'group-hover:text-brand-600',
    desc: 'Group products by collection, series or bundle. Manage relationships between related SKUs across the furniture range.',
    meta1: '312 sets',
    meta2: '8 pending review',
  },
]

const assetCards = [
  {
    to: '/image-engine',
    icon: 'ti-photo',
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'image-engine.html',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    title: 'Image Engine',
    titleHover: 'group-hover:text-emerald-700',
    arrowHover: 'group-hover:text-emerald-600',
    desc: 'Upload, classify and optimise product imagery. Supports auto-crop and channel-specific resizing for all sales platforms.',
    meta1: '18,340 assets',
    meta2: '234 processing',
  },
  {
    to: '/document-hub',
    icon: 'ti-file-stack',
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'document-hub.html',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    title: 'Document Hub',
    titleHover: 'group-hover:text-emerald-700',
    arrowHover: 'group-hover:text-emerald-600',
    desc: 'Store technical datasheets, catalogue PDFs, certifications and assembly guides linked directly to each product SKU.',
    meta1: '2,156 docs',
    meta2: '14 expiring soon',
  },
]

const publishingCards = [
  {
    to: '/social-campaign',
    icon: 'ti-speakerphone',
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-100',
    iconColor: 'text-amber-600',
    badge: 'social-campaign.html',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-100',
    title: 'Social Campaign',
    titleHover: 'group-hover:text-amber-700',
    arrowHover: 'group-hover:text-amber-600',
    desc: 'Create and schedule content campaigns for Instagram, Pinterest and LinkedIn. Directly linked to PIM product data.',
    meta1: '47 active',
    meta2: '12 scheduled today',
  },
  {
    to: '/publish-flow',
    icon: 'ti-send',
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-100',
    iconColor: 'text-amber-600',
    badge: 'publish-flow.html',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-100',
    title: 'Publish Flow',
    titleHover: 'group-hover:text-amber-700',
    arrowHover: 'group-hover:text-amber-600',
    desc: 'Automated publish pipeline to retail channels: Website, Amazon EU, Wayfair and OTTO — with validation and asset checks.',
    meta1: '4 channels',
    meta2: '147 SKUs published today',
  },
]

const recentActivity = [
  {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    icon: 'ti-box',
    title: 'SKU-4821 — Haus Series Shelving Unit L300',
    sub: 'material attributes updated',
    time: '2m ago',
  },
  {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    icon: 'ti-photo',
    title: 'Batch upload 48 images',
    sub: 'for Outdoor Living Collection 2026 completed',
    time: '14m ago',
  },
  {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    icon: 'ti-speakerphone',
    title: 'Campaign "Summer Collection 2026"',
    sub: 'scheduled to publish at 18:00 today',
    time: '31m ago',
  },
  {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    icon: 'ti-refresh',
    title: 'D365 Sync completed',
    sub: '127 products synchronised, 0 errors',
    time: '4m ago',
  },
  {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    icon: 'ti-components',
    title: 'Product Set "Scandinavian Living Room"',
    sub: 'created with 8 SKUs',
    time: '1h ago',
  },
]

function ModuleCard({ card }) {
  return (
    <Link
      to={card.to}
      className="group bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 p-5 flex flex-col gap-3 no-underline"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center border ${card.iconBorder}`}>
          <i className={`ti ${card.icon} ${card.iconColor} text-lg`}></i>
        </div>
        <span className={`text-[10px] font-medium border rounded-md px-2 py-0.5 ${card.badgeColor}`}>{card.badge}</span>
      </div>
      <div>
        <div className={`text-sm font-semibold text-stone-900 ${card.titleHover} transition-colors`}>{card.title}</div>
        <div className="text-[12px] text-stone-500 mt-1 leading-relaxed">{card.desc}</div>
      </div>
      <div className="flex items-center gap-2 mt-auto pt-1 border-t border-black/5">
        <span className="text-[11px] text-stone-500 tabular-nums font-medium">{card.meta1}</span>
        <span className="text-stone-300">&middot;</span>
        <span className="text-[11px] text-stone-400">{card.meta2}</span>
        <i className={`ti ti-arrow-right text-stone-300 ${card.arrowHover} ml-auto text-sm transition-colors`}></i>
      </div>
    </Link>
  )
}

function SectionHeader({ iconBg, iconColor, icon, label, note }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-5 h-5 rounded ${iconBg} flex items-center justify-center`}>
        <i className={`ti ${icon} ${iconColor} text-xs`}></i>
      </div>
      <span className="text-xs font-semibold text-stone-700 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-black/5"></div>
      {note && <span className="text-[11px] text-stone-400">{note}</span>}
    </div>
  )
}

export default function Dashboard() {
  const [notificationCount] = useState(3)
  const currentUser = { initials: 'HC' }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 font-sans">

      {/* Top bar */}
      <header
        className="bg-white border-b border-black/10 sticky top-0 z-10"
        style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0s' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <i className="ti ti-cube text-white text-base"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900 leading-tight">PIM Studio</div>
              <div className="text-[11px] text-stone-500 leading-tight">Product Information Management</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 bg-stone-100 border border-black/10 rounded-md px-2 py-0.5 font-medium">v2.4.1</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-black/10 rounded-lg hover:bg-stone-50 hover:-translate-y-px transition-all active:scale-[0.98]">
              <i className="ti ti-bell text-sm"></i>
              <span className="tabular-nums">{notificationCount}</span>
            </button>
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-semibold text-brand-600 border border-brand-200">
              {currentUser.initials}
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section
        className="max-w-4xl mx-auto px-6 pt-12 pb-8 w-full"
        style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}
      >
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-md px-2 py-0.5">Navigation Hub</span>
            <span className="text-[11px] text-stone-400">6 modules available</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 leading-tight">Welcome to Forma Studio PIM</h1>
          <p className="text-sm text-stone-500 max-w-xl leading-relaxed">
            Centralised product information management — from catalogue, images and documents to multi-channel publishing. Select a module below to get started.
          </p>
        </div>

        {/* Quick stats bar */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-black/10 shadow-card px-4 py-3">
              <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-stone-900 tabnum leading-none">{stat.value}</div>
              <div className="text-[11px] text-stone-400 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 pb-16 w-full flex-1">

        {/* Section: Catalogue */}
        <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.1s' }}>
          <SectionHeader
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            icon="ti-database"
            label="Catalogue"
            note="Manage product catalogue"
          />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {catalogueCards.map((card) => (
              <ModuleCard key={card.to} card={card} />
            ))}
          </div>
        </div>

        {/* Section: Assets */}
        <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.15s' }}>
          <SectionHeader
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            icon="ti-photo"
            label="Assets"
            note="Manage images & documents"
          />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {assetCards.map((card) => (
              <ModuleCard key={card.to} card={card} />
            ))}
          </div>
        </div>

        {/* Section: Publishing */}
        <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.2s' }}>
          <SectionHeader
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            icon="ti-speakerphone"
            label="Publishing"
            note="Multi-channel publishing"
          />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {publishingCards.map((card) => (
              <ModuleCard key={card.to} card={card} />
            ))}
          </div>
        </div>

        {/* Section: System */}
        <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.25s' }}>
          <SectionHeader
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            icon="ti-settings"
            label="System"
            note="Configuration & integrations"
          />
          <div className="grid grid-cols-2 gap-4 mb-6">

            {/* D365 Sync */}
            <Link
              to="/settings"
              className="group bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 p-5 flex flex-col gap-3 no-underline"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                  <i className="ti ti-refresh text-purple-600 text-lg"></i>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-md px-2 py-0.5">settings.html</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900 group-hover:text-purple-700 transition-colors">D365 Sync</div>
                <div className="text-[12px] text-stone-500 mt-1 leading-relaxed">
                  Bidirectional sync with Microsoft Dynamics 365. Monitor sync status, handle errors and configure field mapping rules.
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-1 border-t border-black/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[11px] text-stone-500 font-medium">Connected</span>
                <span className="text-stone-300">&middot;</span>
                <span className="text-[11px] text-stone-400 tabular-nums">Last sync 4m ago</span>
                <i className="ti ti-arrow-right text-stone-300 group-hover:text-purple-600 ml-auto text-sm transition-colors"></i>
              </div>
            </Link>

            {/* Settings */}
            <Link
              to="/settings"
              className="group bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 p-5 flex flex-col gap-3 no-underline"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                  <i className="ti ti-settings text-purple-600 text-lg"></i>
                </div>
                <span className="text-[10px] font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-md px-2 py-0.5">settings.html</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900 group-hover:text-purple-700 transition-colors">Settings</div>
                <div className="text-[12px] text-stone-500 mt-1 leading-relaxed">
                  Configure connected accounts, user permissions, content language settings and global PIM system preferences.
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-1 border-t border-black/5">
                <span className="text-[11px] text-stone-500 tabular-nums font-medium">12 users</span>
                <span className="text-stone-300">&middot;</span>
                <span className="text-[11px] text-stone-400">4 integrations</span>
                <i className="ti ti-arrow-right text-stone-300 group-hover:text-purple-600 ml-auto text-sm transition-colors"></i>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-stone-200 flex items-center justify-center">
              <i className="ti ti-activity text-stone-500 text-xs"></i>
            </div>
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-widest">Recent Activity</span>
            <div className="flex-1 h-px bg-black/5"></div>
          </div>

          <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
            <div className="divide-y divide-black/5">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-7 h-7 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                    <i className={`ti ${item.icon} ${item.iconColor} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-medium text-stone-800">{item.title}</span>
                    <span className="text-[11px] text-stone-400 ml-1.5">{item.sub}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 tabular-nums shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-2.5 border-t border-black/5 bg-stone-50/60">
              <button className="text-[11px] font-medium text-brand-600 hover:text-brand-800 transition-colors">
                View all activity &rarr;
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer
        className="border-t border-black/10 bg-white"
        style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.35s' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400">PIM Studio</span>
            <span className="text-stone-300">&middot;</span>
            <span className="text-[11px] text-stone-400">v2.4.1</span>
            <span className="text-stone-300">&middot;</span>
            <span className="text-[11px] text-stone-400">&copy; 2026 Forma Studio GmbH</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/products" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Products</Link>
            <Link to="/image-engine" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Image Engine</Link>
            <Link to="/document-hub" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Document Hub</Link>
            <Link to="/social-campaign" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Social Campaign</Link>
            <Link to="/publish-flow" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Publish Flow</Link>
            <Link to="/settings" className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors">Settings</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

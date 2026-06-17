import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'

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

const VERSION_HISTORY = [
  { ver: 'v1.4', author: 'Anja H.', date: '08 Mar 2025', note: 'Updated load capacity tables and shelf dimensions' },
  { ver: 'v1.3', author: 'Anja H.', date: '20 Feb 2025', note: 'Added material safety standards references' },
  { ver: 'v1.2', author: 'Lars V.', date: '05 Feb 2025', note: 'Initial approved version — EN 16139 compliance added' },
  { ver: 'v1.1', author: 'Lars V.', date: '15 Jan 2025', note: 'Draft corrections for compliance team review' },
  { ver: 'v1.0', author: 'Anja H.', date: '02 Jan 2025', note: 'First draft upload' },
]

export default function DocumentHubDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useData()

  const doc = state.documents.find(d => String(d.id) === String(id))

  if (!doc) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <i className="ti ti-file-off text-4xl text-stone-300"></i>
          <div className="text-sm text-stone-500">Document not found</div>
          <button
            onClick={() => navigate('/document-hub')}
            className="text-xs text-brand-600 hover:underline"
          >
            ← Back to Document Hub
          </button>
        </div>
      </Layout>
    )
  }

  const typeConf = TYPE_CONFIG[doc.type] || TYPE_CONFIG['Assembly']
  const statusConf = STATUS_CONFIG[doc.status] || STATUS_CONFIG['Draft']
  const skus = Array.isArray(doc.productSku) ? doc.productSku : [doc.productSku].filter(Boolean)

  return (
    <Layout>
      {/* TOPBAR */}
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-stone-400">Assets</span>
          <i className="ti ti-chevron-right text-stone-300 text-xs"></i>
          <Link to="/document-hub" className="text-stone-400 hover:text-brand-600 transition-colors">Document Hub</Link>
          <i className="ti ti-chevron-right text-stone-300 text-xs"></i>
          <span className="font-semibold text-stone-800 max-w-[300px] truncate">{doc.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/document-hub')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 border border-black/10 rounded-lg hover:bg-stone-200 transition-all"
          >
            <i className="ti ti-arrow-left text-sm"></i> Back
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-black/10 rounded-lg hover:bg-stone-50 transition-all">
            <i className="ti ti-download text-sm"></i> Download
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-800 transition-all shadow-sm">
            <i className="ti ti-share text-sm"></i> Share
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-5">

        {/* HEADING */}
        <div style={{ animation: 'fadeUp 0.25s ease both' }}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${typeConf.iconBg} flex items-center justify-center shrink-0`}>
              <i className={`${typeConf.icon} text-2xl ${typeConf.iconColor}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-stone-900">{doc.name}</h1>
                <span className={`inline-flex items-center gap-1 ${statusConf.cls} rounded-md px-2 py-0.5 text-xs font-medium`}>
                  <i className={`${statusConf.icon} text-xs`}></i> {doc.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                <span className={`${typeConf.badgeClass} rounded-md px-2 py-0.5 font-medium`}>{doc.type}</span>
                <span className="tabnum">{doc.version}</span>
                <span>{doc.language}</span>
                {doc.size && <span className="tabnum">{doc.size}</span>}
                <span className="bg-stone-100 text-stone-600 rounded-md px-1.5 py-0.5 tabnum font-medium">{doc.format}</span>
                <span>Updated {doc.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY GRID */}
        <div className="grid grid-cols-3 gap-5" style={{ animation: 'fadeUp 0.25s ease both', animationDelay: '0.05s' }}>

          {/* DOCUMENT PREVIEW — spans 2 cols */}
          <div className="col-span-2 space-y-5">

            {/* Preview card */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] overflow-hidden">
              <div className="px-5 py-3 border-b border-black/[0.06] flex items-center justify-between">
                <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <i className="ti ti-file-description text-sm text-cyan-500"></i>
                  Document Preview
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-md hover:bg-brand-100 transition-colors flex items-center gap-1">
                    <i className="ti ti-external-link text-xs"></i> Full view
                  </button>
                  <button className="px-2.5 py-1 text-xs font-medium text-stone-600 bg-stone-100 rounded-md hover:bg-stone-200 transition-colors flex items-center gap-1">
                    <i className="ti ti-download text-xs"></i> Download
                  </button>
                </div>
              </div>

              {/* SVG mock page */}
              <div className="bg-gradient-to-b from-slate-200 to-slate-300 flex justify-center items-center py-10">
                <div
                  className="relative cursor-pointer"
                  style={{ width: '220px', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'perspective(800px) rotateY(-4deg) translateY(-3px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
                >
                  <div className="absolute" style={{ top: '6px', left: '6px', width: '220px', borderRadius: '4px', background: '#d1d5db', height: '310px', zIndex: 0 }}></div>
                  <div className="absolute" style={{ top: '3px', left: '3px', width: '220px', borderRadius: '4px', background: '#e5e7eb', height: '310px', zIndex: 1 }}></div>
                  <svg
                    viewBox="0 0 220 310"
                    style={{ width: '220px', zIndex: 2, borderRadius: '4px', display: 'block', position: 'relative', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.22))' }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="220" height="310" fill="white" rx="3"/>
                    <rect width="220" height="54" fill="#185FA5" rx="3"/>
                    <rect y="48" width="220" height="6" fill="#0C447C"/>
                    <rect x="14" y="12" width="110" height="7" fill="white" rx="2" opacity="0.92"/>
                    <rect x="14" y="27" width="72" height="5" fill="white" rx="1.5" opacity="0.55"/>
                    <rect x="183" y="10" width="24" height="32" fill="white" rx="3" opacity="0.12"/>
                    <rect x="186" y="13" width="18" height="4" fill="white" rx="1" opacity="0.5"/>
                    <rect x="186" y="20" width="18" height="4" fill="white" rx="1" opacity="0.3"/>
                    <rect x="186" y="27" width="12" height="4" fill="white" rx="1" opacity="0.3"/>
                    <rect x="14" y="66" width="52" height="5" fill="#1e293b" rx="1" opacity="0.4"/>
                    <rect x="14" y="77" width="192" height="100" fill="#f8fafc" rx="4" stroke="#e2e8f0" strokeWidth="1"/>
                    <rect x="24" y="87" width="4" height="80" fill="#94a3b8" rx="1"/>
                    <rect x="202" y="87" width="4" height="80" fill="#94a3b8" rx="1"/>
                    <rect x="24" y="87" width="172" height="4" fill="#475569" rx="1"/>
                    <rect x="24" y="119" width="172" height="4" fill="#475569" rx="1"/>
                    <rect x="24" y="151" width="172" height="4" fill="#475569" rx="1"/>
                    <rect x="24" y="161" width="172" height="4" fill="#475569" rx="1"/>
                    <rect x="30" y="93" width="12" height="26" fill="#CBD5E1" rx="2"/>
                    <rect x="44" y="98" width="9" height="21" fill="#94A3B8" rx="2"/>
                    <rect x="55" y="91" width="15" height="28" fill="#378ADD" rx="2" opacity="0.5"/>
                    <rect x="72" y="96" width="10" height="23" fill="#CBD5E1" rx="2"/>
                    <rect x="30" y="126" width="20" height="26" fill="#E2E8F0" rx="2"/>
                    <rect x="52" y="131" width="12" height="21" fill="#94A3B8" rx="2"/>
                    <rect x="66" y="124" width="9" height="28" fill="#378ADD" rx="2" opacity="0.35"/>
                    <rect x="14" y="190" width="72" height="5" fill="#1e293b" rx="1" opacity="0.4"/>
                    <rect x="14" y="200" width="192" height="16" fill="#EFF6FF" rx="2"/>
                    <rect x="14" y="200" width="82" height="16" fill="#DBEAFE" rx="2"/>
                    <rect x="18" y="205" width="60" height="5" fill="#185FA5" rx="1" opacity="0.55"/>
                    <rect x="102" y="205" width="52" height="5" fill="#378ADD" rx="1" opacity="0.45"/>
                    <rect x="14" y="217" width="192" height="14" fill="white" rx="1"/>
                    <rect x="18" y="221" width="58" height="5" fill="#64748b" rx="1" opacity="0.5"/>
                    <rect x="104" y="221" width="42" height="5" fill="#94a3b8" rx="1" opacity="0.5"/>
                    <rect x="14" y="232" width="192" height="14" fill="#f8fafc" rx="1"/>
                    <rect x="18" y="236" width="64" height="5" fill="#64748b" rx="1" opacity="0.5"/>
                    <rect x="104" y="236" width="34" height="5" fill="#94a3b8" rx="1" opacity="0.5"/>
                    <rect x="14" y="247" width="192" height="14" fill="white" rx="1"/>
                    <rect x="18" y="251" width="52" height="5" fill="#64748b" rx="1" opacity="0.5"/>
                    <rect x="104" y="251" width="48" height="5" fill="#94a3b8" rx="1" opacity="0.5"/>
                    <line x1="14" y1="292" x2="206" y2="292" stroke="#e2e8f0" strokeWidth="0.75"/>
                    <rect x="14" y="296" width="60" height="4" fill="#cbd5e1" rx="1" opacity="0.5"/>
                    <rect x="150" y="296" width="56" height="4" fill="#cbd5e1" rx="1" opacity="0.5"/>
                    <text x="110" y="301" fontSize="6" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">1 / 18</text>
                  </svg>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none" style={{ zIndex: 3 }}>
                    <div className="bg-black/55 backdrop-blur-sm text-white text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <i className="ti ti-file-text text-[9px]"></i> 18 pages
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-stone-50 border-t border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-100 tracking-wide">{doc.format}</span>
                  <span className="text-[11px] text-stone-400">{doc.size || '—'} · 18 pages</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-400">
                  <span><i className="ti ti-eye mr-1"></i>Page 1 of 18</span>
                  <button className="text-stone-400 hover:text-stone-700"><i className="ti ti-chevron-left"></i></button>
                  <button className="text-stone-400 hover:text-stone-700"><i className="ti ti-chevron-right"></i></button>
                </div>
              </div>
            </div>

            {/* Version history table */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] overflow-hidden">
              <div className="px-5 py-3 border-b border-black/[0.06] flex items-center justify-between">
                <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <i className="ti ti-history text-sm text-violet-500"></i>
                  Version History
                </div>
                <button className="text-xs text-brand-600 hover:underline">View audit log →</button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-black/[0.06]">
                    <th className="text-left px-5 py-2.5 font-semibold text-stone-500">Version</th>
                    <th className="text-left px-5 py-2.5 font-semibold text-stone-500">Author</th>
                    <th className="text-left px-5 py-2.5 font-semibold text-stone-500">Date</th>
                    <th className="text-left px-5 py-2.5 font-semibold text-stone-500">Notes</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {VERSION_HISTORY.map((v, i) => (
                    <tr key={v.ver} className={`${i === 0 ? 'bg-brand-50/40' : 'hover:bg-stone-50'} transition-colors`}>
                      <td className="px-5 py-3">
                        <span className={`tabnum font-semibold ${i === 0 ? 'text-brand-600' : 'text-stone-500'}`}>{v.ver}</span>
                        {i === 0 && <span className="ml-2 text-[10px] bg-brand-600 text-white rounded px-1.5 py-0.5 font-medium">CURRENT</span>}
                      </td>
                      <td className="px-5 py-3 text-stone-600">{v.author}</td>
                      <td className="px-5 py-3 tabnum text-stone-500">{v.date}</td>
                      <td className="px-5 py-3 text-stone-400">{v.note}</td>
                      <td className="px-5 py-3">
                        <button className="text-[11px] text-brand-600 hover:underline">Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Linked Products */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-5">
              <div className="text-xs font-semibold text-stone-700 mb-3 flex items-center gap-1.5">
                <i className="ti ti-link text-sm text-stone-400"></i>
                Linked Products
              </div>
              <div className="flex gap-2 flex-wrap">
                {skus.map((sku) => (
                  <div key={sku} className="flex items-center gap-2 bg-stone-50 border border-black/10 rounded-lg px-3 py-2 hover:bg-brand-50 hover:border-brand-200 transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shrink-0">
                      <i className="ti ti-box text-xs text-white"></i>
                    </div>
                    <div>
                      <div className="tabnum text-xs font-semibold text-stone-700">{sku}</div>
                      <div className="text-[10px] text-stone-400">View product →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-stone-700">Document Metadata</div>
                <button className="text-[11px] text-brand-600 hover:underline">Edit</button>
              </div>
              <div className="space-y-2.5 text-[11px]">
                {[
                  { label: 'Type', value: doc.type },
                  { label: 'Version', value: doc.version, mono: true },
                  { label: 'Language', value: doc.language },
                  { label: 'Format', value: doc.format, mono: true },
                  { label: 'File Size', value: doc.size || '—', mono: true },
                  { label: 'Updated', value: doc.updatedAt, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className="text-stone-400 shrink-0">{label}</span>
                    <span className={`font-medium text-stone-700 text-right ${mono ? 'tabnum' : ''}`}>{value}</span>
                  </div>
                ))}
                <div className="h-px bg-black/[0.06]"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-stone-400">Status</span>
                  <span className={`inline-flex items-center gap-1 ${statusConf.cls} rounded-md px-2 py-0.5 font-medium`}>
                    <i className={`${statusConf.icon} text-xs`}></i> {doc.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Workflow */}
            <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_4px_rgba(24,95,165,0.06)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-stone-700">Approval Workflow</div>
                <span className={`inline-flex items-center gap-1 ${statusConf.cls} rounded-md px-2 py-0.5 text-[11px] font-medium`}>
                  <i className={`${statusConf.icon} text-xs`}></i> {doc.status}
                </span>
              </div>

              <div className="relative flex flex-col gap-0">
                {[
                  { done: true,    label: 'Upload',                      sub: 'Anja H. · 08 Mar 2025',    color: 'bg-emerald-500', icon: 'ti ti-check' },
                  { current: true, label: 'In Review',                   sub: 'Product & Design Team',    color: 'bg-brand-600',   icon: 'ti ti-eye' },
                  { done: false,   label: 'Approve — Design & Compliance', sub: 'Pending',                color: 'bg-stone-200',   icon: 'ti ti-circle' },
                  { done: false,   label: 'Approved → Publish / Share',  sub: 'Pending',                  color: 'bg-stone-200',   icon: 'ti ti-send' },
                ].map((step, i, arr) => (
                  <div key={i} className={`flex gap-3 ${i < arr.length - 1 ? 'pb-4' : ''} relative`}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full ${step.color} flex items-center justify-center shrink-0 z-10 relative`}
                        style={step.current ? { animation: 'pulse-ring 1.8s ease-out infinite' } : {}}
                      >
                        <i className={`${step.icon} text-white text-xs`}></i>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-px flex-1 ${step.done ? 'bg-emerald-200' : 'bg-stone-200'} mt-1`}></div>
                      )}
                    </div>
                    <div className="pt-0.5 pb-1 flex-1">
                      <div className={`text-xs font-semibold ${step.done ? 'text-emerald-700' : step.current ? 'text-brand-600' : 'text-stone-400'}`}>
                        {step.label}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${step.done || step.current ? 'text-stone-500' : 'text-stone-300'}`}>{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {doc.status === 'In Review' && (
                <div className="mt-4 pt-3 border-t border-black/[0.06] flex gap-2">
                  <button className="flex-1 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all">
                    <i className="ti ti-check mr-1"></i>Approve
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 border border-black/10 rounded-lg hover:bg-stone-200 transition-all">
                    <i className="ti ti-x mr-1"></i>Reject
                  </button>
                </div>
              )}
            </div>

            {/* Policy notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="flex gap-2">
                <i className="ti ti-shield-check text-amber-600 text-base shrink-0 mt-0.5"></i>
                <div>
                  <div className="text-[11px] font-semibold text-amber-800 mb-1">Document Policy</div>
                  <ul className="text-[11px] text-amber-700 space-y-0.5">
                    <li>· Only <strong>Approved</strong> docs can be shared or published.</li>
                    <li>· All versions are retained — no hard delete.</li>
                    <li>· BOM auto-syncs from D365; manual edits locked.</li>
                    <li>· Retailer sign-off required for Technical Datasheets.</li>
                  </ul>
                </div>
              </div>
            </div>
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
    </Layout>
  )
}

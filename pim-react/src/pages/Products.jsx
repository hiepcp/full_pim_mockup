import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { useData } from '../store/DataContext.jsx'
import { useFilter } from '../store/useFilter.js'

const STATUS_CLASS = {
  'Active':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Phasing Out':  'bg-amber-50 text-amber-700 border-amber-200',
  'Discontinued': 'bg-red-50 text-red-600 border-red-200',
  'Draft':        'bg-stone-100 text-stone-500 border-stone-200',
}

const DOC_TYPE_CFG = {
  'Assembly':      { icon: 'ti-tool',             bg: 'bg-amber-50',   color: 'text-amber-600',  badge: 'bg-amber-50 text-amber-700 border border-amber-100' },
  'Care Guide':    { icon: 'ti-file-text',         bg: 'bg-indigo-50',  color: 'text-indigo-600', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
  'Datasheet':     { icon: 'ti-file-description',  bg: 'bg-cyan-50',    color: 'text-cyan-600',   badge: 'bg-cyan-50 text-cyan-700 border border-cyan-100' },
  'BOM':           { icon: 'ti-list-details',      bg: 'bg-violet-50',  color: 'text-violet-600', badge: 'bg-violet-50 text-violet-700 border border-violet-100' },
  'Test Report':   { icon: 'ti-clipboard-check',   bg: 'bg-teal-50',    color: 'text-teal-600',   badge: 'bg-teal-50 text-teal-700 border border-teal-100' },
  'Certification': { icon: 'ti-certificate',       bg: 'bg-orange-50',  color: 'text-orange-500', badge: 'bg-orange-50 text-orange-700 border border-orange-100' },
  'MSDS':          { icon: 'ti-package',           bg: 'bg-cyan-50',    color: 'text-cyan-600',   badge: 'bg-cyan-50 text-cyan-700 border border-cyan-100' },
}
const DOC_DEFAULT_CFG = { icon: 'ti-file',         bg: 'bg-stone-50',   color: 'text-stone-400',  badge: 'bg-stone-100 text-stone-600 border border-black/10' }

const DOC_STATUS_CFG = {
  'Approved':          { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ti-circle-check',  dot: 'bg-emerald-500' },
  'In Review':         { cls: 'bg-brand-50 text-brand-600 border border-brand-100',       icon: 'ti-eye',           dot: 'bg-brand-500' },
  'Draft':             { cls: 'bg-stone-100 text-stone-500 border border-stone-200',      icon: 'ti-pencil',        dot: 'bg-stone-400' },
  'Pending customer':  { cls: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: 'ti-user-check',    dot: 'bg-amber-500' },
}
const IMAGE_COLOR = { 0: 'text-stone-400' }
function imgColor(n) { return n === 0 ? 'text-stone-400' : n < 3 ? 'text-amber-500' : 'text-emerald-600' }

const ASSET_CONFIGS = {
  packshot: {
    title: 'Packshot Images',
    meta: '8 files · Last updated Jun 12, 2026',
    icon: 'ti ti-camera',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    files: Array.from({ length: 8 }, (_, i) => ({
      seed: `pack${i + 1}`,
      name: `30317_PKG_${String(i + 1).padStart(2, '0')}.jpg`,
      dim: 'RGB · 3000×3000',
    })),
  },
  lifestyle: {
    title: 'Lifestyle Images',
    meta: '6 files · Last updated Jun 8, 2026',
    icon: 'ti ti-sofa',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    files: ['a', 'b', 'c', 'd', 'e', 'f'].map((s, i) => ({
      seed: `life${s}`,
      name: `30317_LIFE_${String(i + 1).padStart(2, '0')}.jpg`,
      dim: 'RGB · 5760×3840',
      aspect: 'video',
    })),
  },
  linedrawing: {
    title: 'Line Drawings',
    meta: '4 files · Last updated May 30, 2026',
    icon: 'ti ti-vector',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    drawings: [
      { name: '30317_LINE_FRONT.svg', view: 'Front view', size: '142 KB', fmt: 'SVG' },
      { name: '30317_LINE_SIDE.svg', view: 'Side view', size: '138 KB', fmt: 'SVG' },
      { name: '30317_LINE_TOP.svg', view: 'Top view', size: '97 KB', fmt: 'SVG' },
      { name: '30317_LINE_PERSP.pdf', view: 'Perspective', size: '2.1 MB', fmt: 'PDF' },
    ],
  },
  '3d': {
    title: 'OBJ / 3D Models',
    meta: '3 files · Last updated Jun 1, 2026',
    icon: 'ti ti-box-model-2',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    models: [
      { name: '30317_model.obj', fmt: 'OBJ', size: '4.7 MB', note: 'Full geometry, no textures' },
      { name: '30317_model.glb', fmt: 'GLB', size: '6.2 MB', note: 'Web-ready, baked textures' },
      { name: '30317_render.usdz', fmt: 'USDZ', size: '8.1 MB', note: 'AR Quick Look (iOS)' },
    ],
  },
  processing: {
    title: 'Processing Queue',
    meta: '6 files in progress',
    icon: 'ti ti-loader',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    queue: [
      { name: '30317_PKG_09_HiRes.tif', type: 'Packshot', pct: 82, eta: '~1 min' },
      { name: '30317_PKG_10_HiRes.tif', type: 'Packshot', pct: 61, eta: '~2 min' },
      { name: '30317_LIFE_07_Bedroom.cr3', type: 'Lifestyle', pct: 44, eta: '~4 min' },
      { name: '30317_LIFE_08_Studio.cr3', type: 'Lifestyle', pct: 23, eta: '~7 min' },
      { name: '30317_LIFE_09_Outdoor.cr3', type: 'Lifestyle', pct: 12, eta: '~9 min' },
      { name: '30317_model_v2.obj', type: '3D Model', pct: 5, eta: '~12 min' },
    ],
  },
  upload: {
    title: 'Upload New Assets',
    meta: 'Drag & drop or browse files',
    icon: 'ti ti-upload',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600',
  },
}

function AssetDialogBody({ type }) {
  const cfg = ASSET_CONFIGS[type]
  if (!cfg) return null

  if (type === 'packshot') {
    return (
      <div className="grid grid-cols-4 gap-3">
        {cfg.files.map((f, i) => (
          <div key={i} className="group relative rounded-xl overflow-hidden border border-black/8 cursor-pointer hover:shadow-hover hover:-translate-y-px transition-all">
            <img src={`https://picsum.photos/seed/${f.seed}/240/240`} alt={f.name} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors" title="Preview"><i className="ti ti-eye text-stone-700 text-sm"></i></button>
              <button className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors" title="Download"><i className="ti ti-download text-stone-700 text-sm"></i></button>
            </div>
            <div className="p-2">
              <div className="text-[11px] font-medium text-stone-700 truncate">{f.name}</div>
              <div className="text-[10px] text-stone-400 flex items-center justify-between mt-0.5">
                <span>{f.dim}</span>
                <span className="text-emerald-600 font-medium">Ready</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'lifestyle') {
    return (
      <div className="grid grid-cols-3 gap-3">
        {cfg.files.map((f, i) => (
          <div key={i} className="group relative rounded-xl overflow-hidden border border-black/8 cursor-pointer hover:shadow-hover hover:-translate-y-px transition-all">
            <img src={`https://picsum.photos/seed/${f.seed}/360/240`} alt={f.name} className="w-full aspect-video object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white" title="Preview"><i className="ti ti-eye text-stone-700 text-sm"></i></button>
              <button className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white" title="Download"><i className="ti ti-download text-stone-700 text-sm"></i></button>
            </div>
            <div className="p-2">
              <div className="text-[11px] font-medium text-stone-700 truncate">{f.name}</div>
              <div className="text-[10px] text-stone-400 flex items-center justify-between mt-0.5">
                <span>{f.dim}</span>
                <span className="text-emerald-600 font-medium">Ready</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'linedrawing') {
    return (
      <div className="flex flex-col gap-2">
        {cfg.drawings.map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-black/8 hover:bg-stone-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-stone-100 border border-black/8 flex items-center justify-center shrink-0">
              <i className="ti ti-vector text-stone-400 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-stone-800">{f.name}</div>
              <div className="text-[11px] text-stone-400 mt-0.5">{f.view} · {f.fmt} · {f.size}</div>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1"><i className="ti ti-eye text-[12px]"></i>Preview</button>
              <button className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors flex items-center gap-1"><i className="ti ti-download text-[12px]"></i>DL</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === '3d') {
    return (
      <div className="flex flex-col gap-2">
        {cfg.models.map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-black/8 hover:bg-stone-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              <i className="ti ti-box-model-2 text-brand-400 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-stone-800">{f.name}</div>
              <div className="text-[11px] text-stone-400 mt-0.5">{f.fmt} · {f.size} · {f.note}</div>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors flex items-center gap-1"><i className="ti ti-download text-[12px]"></i>DL</button>
            </div>
          </div>
        ))}
        <div className="mt-3 rounded-xl bg-stone-50 border border-black/8 p-3 flex items-center gap-2 text-[11px] text-stone-500">
          <i className="ti ti-info-circle text-stone-400"></i>
          3D files linked to Image Engine — variants inherit from Item master unless overridden.
        </div>
      </div>
    )
  }

  if (type === 'processing') {
    return (
      <div className="flex flex-col gap-2">
        {cfg.queue.map((f, i) => (
          <div key={i} className="px-4 py-3 rounded-xl border border-amber-100 bg-amber-50/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <i className="ti ti-loader text-amber-500 text-base spinner"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-stone-800 truncate">{f.name}</div>
                <div className="text-[10px] text-stone-500">{f.type} · ETA {f.eta}</div>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 tabnum shrink-0">{f.pct}%</span>
            </div>
            <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${f.pct}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'upload') {
    const assetTypes = [
      { key: 'packshot', icon: 'ti-camera', label: 'Packshot' },
      { key: 'lifestyle', icon: 'ti-sofa', label: 'Lifestyle' },
      { key: 'line', icon: 'ti-vector', label: 'Line drawing' },
      { key: '3d', icon: 'ti-box-model-2', label: '3D / OBJ' },
    ]
    return (
      <div className="flex flex-col gap-4">
        <div className="border-2 border-dashed border-brand-300 bg-brand-50/40 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center hover:bg-brand-50 hover:border-brand-400 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <i className="ti ti-cloud-upload text-brand-600 text-2xl"></i>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-stone-800">Drop files here to upload</div>
            <div className="text-[11px] text-stone-400 mt-1">JPG, PNG, TIFF, SVG, OBJ, GLB, USDZ · Max 500 MB</div>
          </div>
          <button className="rounded-lg px-4 py-2 text-[12px] font-medium bg-brand-600 text-white hover:bg-brand-800 transition-colors">Browse files</button>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Assign type</div>
          <div className="grid grid-cols-4 gap-2">
            {assetTypes.map((t, i) => (
              <label key={t.key} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-colors ${i === 0 ? 'border-brand-400 bg-brand-50' : 'border-stone-200 hover:border-brand-300'}`}>
                <input type="radio" name="asset-type" value={t.key} className="sr-only" defaultChecked={i === 0} />
                <i className={`ti ${t.icon} text-xl ${i === 0 ? 'text-brand-600' : 'text-stone-400'}`}></i>
                <span className={`text-[10px] font-medium ${i === 0 ? 'text-brand-700' : 'text-stone-500'}`}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Link to variants</div>
          <select className="w-full text-[12px] text-stone-700 bg-stone-50 border border-black/10 rounded-lg px-3 py-2 outline-none">
            <option>All variants (Item master)</option>
            <option>30317-997 — Natural Oak</option>
            <option>30317-975 — Whitened Oak</option>
            <option>30317-943 — Smoked Oak</option>
          </select>
        </div>
      </div>
    )
  }

  return null
}

const STATUS_FILTERS = ['All', 'Active', 'Phasing Out', 'Discontinued']

export default function Products() {
  const { state, addProduct, updateProduct, deleteProduct, addVariant, updateVariant, deleteVariant } = useData()
  const { query: pQuery, setQuery: setPQuery, activeFilter: pFilter, setActiveFilter: setPFilter, filtered: filteredProducts } = useFilter(state.products, ['name', 'sku', 'category', 'collection'], 'status')

  const [viewMode, setViewMode] = useState('list')
  const [activeProductId, setActiveProductId] = useState('30317')

  // ─── App-level header state ───────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [currentUser] = useState({ name: 'Hugo Claes', initials: 'HC', role: 'PIM Team', email: 'h.claes@formastudio.eu' })

  // ─── List view state ──────────────────────────────
  const [listSort, setListSort] = useState({ key: 'updatedAt', dir: 'desc' })
  const [selectedProducts, setSelectedProducts] = useState(new Set())

  // ─── Hero state ───────────────────────────────────
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  // ─── Sales table state (B2, B3, B4) ───────────────
  const [salesSort, setSalesSort] = useState({ key: 'qty', dir: 'desc' })
  const [salesPage, setSalesPage] = useState(1)
  const [salesPageSize, setSalesPageSize] = useState(10)
  const [salesSearch, setSalesSearch] = useState('')

  // ─── Variants table state ─────────────────────────
  const [selectedVariants, setSelectedVariants] = useState(new Set())

  // ─── Product CRUD modal ───────────────────────────
  const [showProductModal, setShowProductModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [productForm, setProductForm] = useState({})

  const openAddProduct = () => { setEditProduct(null); setProductForm({ status: 'Active' }); setShowProductModal(true) }
  const openEditProduct = (p) => { setEditProduct(p); setProductForm({ ...p }); setShowProductModal(true) }
  const handleSaveProduct = () => {
    if (editProduct) updateProduct({ ...productForm, id: editProduct.id })
    else addProduct(productForm)
    setShowProductModal(false)
  }

  // Variant CRUD modal
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [editVariant, setEditVariant] = useState(null)
  const [variantForm, setVariantForm] = useState({})

  const openAddVariant = () => { setEditVariant(null); setVariantForm({ status: 'Active', color: '#D4B896' }); setShowVariantModal(true) }
  const openEditVariant = (v) => { setEditVariant(v); setVariantForm({ ...v }); setShowVariantModal(true) }
  const handleSaveVariant = () => {
    if (editVariant) updateVariant({ ...variantForm, sku: editVariant.sku })
    else addVariant(variantForm)
    setShowVariantModal(false)
  }

  const variants = state.currentProduct?.variants || []
  const sales = state.currentProduct?.sales || []

  // ─── Derived data (QW1 — A1, A5, A6, D1-D5, D7) ──────
  const activeProduct = useMemo(
    () => state.products.find(p => p.id === activeProductId) || state.products[0] || null,
    [state.products, activeProductId]
  )

  // Counts derived from real data (A1)
  const productAssets = useMemo(
    () => state.assets.filter(a => a.productSku === `SKU-${activeProductId}` || a.productSku === activeProductId),
    [state.assets, activeProductId]
  )
  const assetKpis = useMemo(() => {
    const ready = productAssets.filter(a => a.status === 'done').length
    const processing = productAssets.filter(a => a.status === 'processing' || a.status === 'queued').length
    return { total: productAssets.length, ready, processing }
  }, [productAssets])

  const productDocuments = useMemo(
    () => state.documents.filter(d => Array.isArray(d.productSku) && d.productSku.includes(activeProductId)),
    [state.documents, activeProductId]
  )
  const docKpis = useMemo(() => {
    const approved = productDocuments.filter(d => d.status === 'Approved').length
    const pending = productDocuments.filter(d => d.status === 'In Review' || d.status === 'Pending customer').length
    return { total: productDocuments.length, approved, pending }
  }, [productDocuments])

  // D5: Material alerts — join variants[].material with state.materials
  const materialAlerts = useMemo(() => {
    const matIds = [...new Set(variants.map(v => v.material).filter(Boolean))]
    return matIds
      .map(id => state.materials.find(m => m.id === id))
      .filter(Boolean)
      .filter(m => m.status === 'phasing-out' || m.status === 'discontinued')
  }, [variants, state.materials])

  // D7: last sync from syncLog
  const lastSync = state.d365Config?.lastSync || state.syncLog?.[0]?.time || '—'

  // B1-B7: Sales table — derived sort + filter + paginate
  const salesProcessed = useMemo(() => {
    const filtered = sales.filter(s => !salesSearch || s.customer.toLowerCase().includes(salesSearch.toLowerCase()))
    const sorted = [...filtered].sort((a, b) => {
      const ka = a[salesSort.key]; const kb = b[salesSort.key]
      if (typeof ka === 'number' && typeof kb === 'number') return salesSort.dir === 'asc' ? ka - kb : kb - ka
      return salesSort.dir === 'asc' ? String(ka).localeCompare(String(kb)) : String(kb).localeCompare(String(ka))
    })
    return sorted
  }, [sales, salesSort, salesSearch])
  const salesTotalPages = Math.max(1, Math.ceil(salesProcessed.length / salesPageSize))
  const salesPageRows = useMemo(
    () => salesProcessed.slice((salesPage - 1) * salesPageSize, salesPage * salesPageSize),
    [salesProcessed, salesPage, salesPageSize]
  )
  const salesTotals = useMemo(() => ({
    qty: sales.reduce((s, r) => s + r.qty, 0),
    customers: new Set(sales.map(r => r.customer)).size,
    orders: sales.reduce((s, r) => s + r.orders, 0),
  }), [sales])

  // Image gallery for hero (E5) — 5 images
  const heroImages = useMemo(() => {
    if (activeProduct?.heroImages?.length) {
      return activeProduct.heroImages.map((url, i) => ({ id: i + 1, url, label: ['packshot', 'lifestyle', 'detail', 'line', '3d'][i] || 'photo' }))
    }
    const seen = productAssets.slice(0, 5)
    if (seen.length > 0) return seen.map(a => ({ id: a.id, url: `https://picsum.photos/seed/${a.id}/720/480`, label: a.type }))
    const thumb = activeProduct?.thumbnail
    return [
      { id: 1, url: thumb ? thumb.replace('w=72&h=72', 'w=720&h=480') : 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=720&h=480&q=85&auto=format&fit=crop', label: 'packshot' },
      { id: 2, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=720&h=480&q=85&auto=format&fit=crop', label: 'lifestyle' },
      { id: 3, url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=720&h=480&q=85&auto=format&fit=crop', label: 'detail' },
      { id: 4, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=720&h=480&q=85&auto=format&fit=crop', label: 'lifestyle' },
      { id: 5, url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=720&h=480&q=85&auto=format&fit=crop', label: 'detail' },
    ]
  }, [productAssets, activeProduct])

  // Product set membership derived (D4)
  const productSets = state.productSets || []

  // Notification count (C4)
  const notifCount = useMemo(() => {
    const baseAlerts = materialAlerts.length > 0 ? 1 : 0
    const d365Warnings = (state.syncLog || []).filter(l => l.status === 'Warning').length
    return baseAlerts + d365Warnings + 2
  }, [materialAlerts, state.syncLog])

  // Quick switch product (F8) — next/prev
  const productIndex = state.products.findIndex(p => p.id === activeProductId)
  const prevProduct = productIndex > 0 ? state.products[productIndex - 1] : null
  const nextProduct = productIndex >= 0 && productIndex < state.products.length - 1 ? state.products[productIndex + 1] : null
  const goPrevProduct = () => prevProduct && setActiveProductId(prevProduct.id)
  const goNextProduct = () => nextProduct && setActiveProductId(nextProduct.id)

  // ─── Sort / bulk handlers ─────────────────────────
  const toggleSalesSort = (key) => setSalesSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  const toggleListSort = (key) => setListSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts]
    arr.sort((a, b) => {
      const ka = a[listSort.key]; const kb = b[listSort.key]
      if (ka == null) return 1; if (kb == null) return -1
      if (typeof ka === 'number' && typeof kb === 'number') return listSort.dir === 'asc' ? ka - kb : kb - ka
      return listSort.dir === 'asc' ? String(ka).localeCompare(String(kb)) : String(kb).localeCompare(String(ka))
    })
    return arr
  }, [filteredProducts, listSort])
  const toggleProduct = (id) => setSelectedProducts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAllProducts = () => setSelectedProducts(prev => prev.size === sortedProducts.length ? new Set() : new Set(sortedProducts.map(p => p.id)))
  const bulkDeleteProducts = () => { if (window.confirm(`Delete ${selectedProducts.size} product(s)?`)) { selectedProducts.forEach(id => deleteProduct(id)); setSelectedProducts(new Set()) } }
  const toggleVariant = (sku) => setSelectedVariants(prev => { const n = new Set(prev); n.has(sku) ? n.delete(sku) : n.add(sku); return n })
  const bulkDeleteVariants = () => { if (window.confirm(`Delete ${selectedVariants.size} variant(s)?`)) { selectedVariants.forEach(sku => deleteVariant(sku)); setSelectedVariants(new Set()) } }

  // ─── AI Content handlers (A7) ─────────────────────
  const [aiContentStatus, setAiContentStatus] = useState({ description: 'pending', social: 'pending', marketing: 'pending', seo: 'pending', features: 'pending', bullets: 'pending' })
  const approveAllAi = () => setAiContentStatus({ description: 'approved', social: 'approved', marketing: 'approved', seo: 'approved', features: 'approved', bullets: 'approved' })
  const regenerateAi = (key) => setAiContentStatus(s => ({ ...s, [key]: 'pending' }))

  // Completeness panel derived (E3)
  const completenessPanel = useMemo(() => {
    const aiApproved = Object.values(aiContentStatus).filter(s => s === 'approved').length
    const aiTotal = Object.keys(aiContentStatus).length
    const assetPct = assetKpis.total ? Math.round(assetKpis.ready / assetKpis.total * 100) : 75
    const docPct = docKpis.total ? Math.round(docKpis.approved / docKpis.total * 100) : 67
    const aiPct = aiTotal ? Math.round(aiApproved / aiTotal * 100) : 0
    const overall = activeProduct?.completeness ?? Math.round((100 + 100 + assetPct + docPct + aiPct + 100) / 6)
    const color = (pct) => pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
    const textColor = (pct) => pct >= 80 ? 'text-stone-400' : pct >= 50 ? 'text-amber-500' : 'text-red-400'
    return {
      overall,
      strokeOffset: Math.round(163.4 * (1 - overall / 100)),
      bars: [
        { label: 'Basic info', pct: 100, color: color(100), textColor: textColor(100) },
        { label: 'Attributes', pct: 100, color: color(100), textColor: textColor(100) },
        { label: `Assets ${assetPct}%`, pct: assetPct, color: color(assetPct), textColor: textColor(assetPct) },
        { label: `Docs ${docPct}%`, pct: docPct, color: color(docPct), textColor: textColor(docPct) },
        { label: `AI · ${aiPct}%`, pct: aiPct, color: color(aiPct), textColor: textColor(aiPct) },
        { label: 'Quality', pct: 100, color: color(100), textColor: textColor(100) },
      ],
    }
  }, [aiContentStatus, assetKpis, docKpis, activeProduct])

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
  const [activeAssetDialogType, setActiveAssetDialogType] = useState('packshot')
  const [variantSearch, setVariantSearch] = useState('')
  const [variantFinish, setVariantFinish] = useState('All finishes')
  const [variantStatus, setVariantStatus] = useState('All status')
  const [warningDismissed, setWarningDismissed] = useState(false)

  const openAssetDialog = (type) => {
    setActiveAssetDialogType(type)
    setIsAssetDialogOpen(true)
  }

  const closeAssetDialog = () => setIsAssetDialogOpen(false)

  const cfg = ASSET_CONFIGS[activeAssetDialogType] || {}

  const tabs = [
    { key: 'overview', icon: 'ti-layout-dashboard', label: 'Overview' },
    { key: '360', icon: 'ti-viewfinder', label: '360° Dashboard' },
    { key: 'variants', icon: 'ti-git-fork', label: 'Variants', badge: '116', badgeClass: 'bg-stone-100 text-stone-500' },
    { key: 'attributes', icon: 'ti-list-details', label: 'Attributes' },
    { key: 'assets', icon: 'ti-photo', label: 'Assets', badge: '24', badgeClass: 'bg-stone-100 text-stone-500' },
    { key: 'documents', icon: 'ti-files', label: 'Documents', badge: docKpis.total || undefined, badgeClass: 'bg-stone-100 text-stone-500' },
    { key: 'content', icon: 'ti-world-upload', label: 'Content & Publishing', badge: 'pending', badgeClass: 'bg-amber-100 text-amber-700' },
    { key: 'relations', icon: 'ti-circles-relation', label: 'Relationships' },
  ]

  if (viewMode === 'list') {
    return (
      <Layout>
        <header className="sticky top-0 z-20 bg-white border-b border-black/10 px-6 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <i className="ti ti-box text-stone-400"></i>
            <span className="text-sm font-semibold text-stone-900">Products</span>
            <span className="text-[11px] text-stone-400 bg-stone-100 rounded px-1.5 py-0.5">{filteredProducts.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-stone-50 border border-black/10 rounded-lg px-3 py-1.5">
              <i className="ti ti-search text-stone-400 text-sm"></i>
              <input value={pQuery} onChange={e => setPQuery(e.target.value)} placeholder="Search products…" className="text-[12px] bg-transparent outline-none w-48 text-stone-700 placeholder-stone-400" />
            </div>
            <button onClick={openAddProduct} className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center gap-1.5">
              <i className="ti ti-plus"></i>New Product
            </button>
          </div>
        </header>

        <div className="px-6 py-4 flex items-center gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setPFilter(f)} className={`px-3 py-1 text-[12px] rounded-lg border transition-colors ${pFilter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-stone-600 border-black/10 hover:bg-stone-50'}`}>{f}</button>
          ))}
        </div>

        <div className="px-6 pb-8">
          <div className="bg-white rounded-2xl border border-black/10 shadow-card overflow-hidden">
            {/* E3: Bulk action bar */}
            {selectedProducts.size > 0 && (
              <div className="px-4 py-2.5 bg-brand-50 border-b border-brand-200 flex items-center gap-3 animate-fade-up">
                <span className="text-[12px] font-semibold text-brand-700">{selectedProducts.size} selected</span>
                <button onClick={bulkDeleteProducts} className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1.5">
                  <i className="ti ti-trash text-[12px]"></i>Delete
                </button>
                <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-white text-stone-700 border border-black/10 hover:bg-stone-50 transition-colors flex items-center gap-1.5">
                  <i className="ti ti-world-upload text-[12px]"></i>Publish
                </button>
                <button onClick={() => setSelectedProducts(new Set())} className="ml-auto text-[11px] text-brand-600 hover:underline font-medium">Clear</button>
              </div>
            )}
            <table className="w-full text-[13px]">
              <thead className="border-b border-black/8">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" checked={sortedProducts.length > 0 && selectedProducts.size === sortedProducts.length} onChange={toggleAllProducts} className="rounded border-stone-300 cursor-pointer" />
                  </th>
                  <th className="px-3 py-3 w-14"></th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide cursor-pointer hover:text-stone-700 transition-colors" onClick={() => toggleListSort('sku')}>
                    <span className="inline-flex items-center gap-1">SKU {listSort.key === 'sku' && <i className={`ti ${listSort.dir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'} text-[10px]`}></i>}</span>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide cursor-pointer hover:text-stone-700 transition-colors" onClick={() => toggleListSort('name')}>
                    <span className="inline-flex items-center gap-1">Name {listSort.key === 'name' && <i className={`ti ${listSort.dir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'} text-[10px]`}></i>}</span>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide cursor-pointer hover:text-stone-700 transition-colors" onClick={() => toggleListSort('category')}>
                    <span className="inline-flex items-center gap-1">Category {listSort.key === 'category' && <i className={`ti ${listSort.dir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'} text-[10px]`}></i>}</span>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Collection</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Status</th>
                  <th className="text-right px-3 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide cursor-pointer hover:text-stone-700 transition-colors" onClick={() => toggleListSort('images')}>
                    <span className="inline-flex items-center gap-1">Images {listSort.key === 'images' && <i className={`ti ${listSort.dir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'} text-[10px]`}></i>}</span>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide cursor-pointer hover:text-stone-700 transition-colors" onClick={() => toggleListSort('completeness')}>
                    <span className="inline-flex items-center gap-1">Completeness {listSort.key === 'completeness' && <i className={`ti ${listSort.dir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'} text-[10px]`}></i>}</span>
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedProducts.map(p => {
                  const isSelected = selectedProducts.has(p.id)
                  return (
                    <tr key={p.id} className={`hover:bg-stone-50 transition-colors cursor-pointer ${isSelected ? 'bg-brand-50/40' : ''}`} onClick={(e) => { if (e.target.type !== 'checkbox' && !e.target.closest('button')) { setActiveProductId(p.id); setViewMode('detail') } }}>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleProduct(p.id)} className="rounded border-stone-300 cursor-pointer" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 overflow-hidden border border-black/8 shrink-0">
                          <img src={p.thumbnail || `https://picsum.photos/seed/${p.sku}/72/72`} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] text-stone-500">{p.sku}</td>
                      <td className="px-3 py-3 font-medium text-stone-800">{p.name}</td>
                      <td className="px-3 py-3 text-stone-500">{p.category}</td>
                      <td className="px-3 py-3 text-stone-500">{p.collection}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center text-[11px] font-medium border rounded-md px-2 py-0.5 ${STATUS_CLASS[p.status] || 'bg-stone-100 text-stone-500 border-stone-200'}`}>{p.status}</span>
                      </td>
                      <td className="px-3 py-3 text-right tabnum text-stone-600">{p.images}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden w-20">
                            <div className="h-full rounded-full" style={{ width: `${p.completeness}%`, background: p.completeness >= 80 ? '#10b981' : p.completeness >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-[11px] text-stone-500 tabnum">{p.completeness}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditProduct(p)} className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors" title="Edit">
                            <i className="ti ti-pencil text-stone-400 text-sm"></i>
                          </button>
                          <button onClick={() => { if (window.confirm('Delete this product?')) deleteProduct(p.id) }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors" title="Delete">
                            <i className="ti ti-trash text-stone-400 hover:text-red-500 text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {sortedProducts.length === 0 && (
              <div className="text-center py-16 text-stone-400">
                <i className="ti ti-box text-3xl mb-2 block"></i>
                <div className="text-sm">No products found</div>
              </div>
            )}
          </div>
        </div>

        {showProductModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
              <div className="text-sm font-semibold text-stone-900 mb-4">{editProduct ? 'Edit Product' : 'New Product'}</div>
              <div className="flex flex-col gap-3">
                <div><label className="text-[11px] font-medium text-stone-500 block mb-1">SKU</label><input value={productForm.sku || ''} onChange={e => setProductForm(f => ({ ...f, sku: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" /></div>
                <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Name</label><input value={productForm.name || ''} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" /></div>
                <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Category</label><input value={productForm.category || ''} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" /></div>
                <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Collection</label><input value={productForm.collection || ''} onChange={e => setProductForm(f => ({ ...f, collection: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" /></div>
                <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Status</label>
                  <select value={productForm.status || 'Active'} onChange={e => setProductForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400">
                    <option>Active</option><option>Phasing Out</option><option>Discontinued</option><option>Draft</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-5">
                <button onClick={() => setShowProductModal(false)} className="px-4 py-2 text-sm text-stone-600 border border-black/10 rounded-lg hover:bg-stone-50">Cancel</button>
                <button onClick={handleSaveProduct} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700">Save</button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    )
  }

  return (
    <Layout>
      {/* ─── APP-LEVEL HEADER (C1-C4) ────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-black/10 px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setSidebarCollapsed(s => !s)} className="w-9 h-9 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors shrink-0" title="Toggle sidebar">
            <i className="ti ti-menu-2 text-stone-600 text-lg"></i>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shrink-0">
              <i className="ti ti-box text-white text-base"></i>
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-stone-900 leading-tight">Product 360 Dashboard</div>
              <div className="text-[10px] text-stone-400 leading-tight">{state.organization?.name || 'PIM Studio'} · {state.organization?.plan || ''}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="w-9 h-9 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors" title="Search">
            <i className="ti ti-search text-stone-500 text-base"></i>
          </button>
          <div className="relative">
            <button onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false) }} className="relative w-9 h-9 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors" title="Notifications">
              <i className="ti ti-bell text-stone-500 text-base"></i>
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">{notifCount}</span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-black/10 shadow-2xl overflow-hidden z-40 animate-fade-up">
                <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-stone-800">Notifications</span>
                  <span className="text-[10px] text-stone-400 tabnum">{notifCount} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {materialAlerts.length > 0 && (
                    <div className="px-4 py-3 hover:bg-stone-50 cursor-pointer border-b border-black/5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <i className="ti ti-alert-triangle text-amber-600 text-sm"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-stone-800">Material phasing out</div>
                          <div className="text-[10px] text-stone-500 mt-0.5">{materialAlerts[0].name} affects {variants.length} variants</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {(state.syncLog || []).filter(l => l.status === 'Warning').slice(0, 2).map((l, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-stone-50 cursor-pointer border-b border-black/5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <i className="ti ti-refresh text-amber-600 text-sm"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-stone-800">D365 sync warning</div>
                          <div className="text-[10px] text-stone-500 mt-0.5">{l.time} · {l.records}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-3 hover:bg-stone-50 cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                        <i className="ti ti-world-upload text-brand-600 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-stone-800">New social mention</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">Forma Studio on Instagram · 2h ago</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-black/8 bg-stone-50 text-center">
                  <button className="text-[11px] text-brand-600 hover:underline font-medium">View all notifications</button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false) }} className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg hover:bg-stone-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[11px] font-bold shrink-0">{currentUser.initials}</div>
              <div className="text-left hidden md:block">
                <div className="text-[12px] font-semibold text-stone-800 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-stone-400 leading-tight">{currentUser.role}</div>
              </div>
              <i className="ti ti-chevron-down text-stone-400 text-xs"></i>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-xl border border-black/10 shadow-2xl overflow-hidden z-40 animate-fade-up">
                <div className="px-4 py-3 border-b border-black/8">
                  <div className="text-[12px] font-semibold text-stone-800">{currentUser.name}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{currentUser.email}</div>
                </div>
                <div className="py-1">
                  {['Profile', 'Settings', 'Keyboard shortcuts', 'Help & docs'].map(item => (
                    <button key={item} className="w-full text-left px-4 py-2 text-[12px] text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2">
                      <i className="ti ti-user-circle text-stone-400 text-sm"></i>{item}
                    </button>
                  ))}
                </div>
                <div className="border-t border-black/8 py-1">
                  <button className="w-full text-left px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                    <i className="ti ti-logout text-sm"></i>Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── PAGE-LEVEL TOPBAR ──────────────────────── */}
      <header className="sticky top-14 z-20 bg-white border-b border-black/10 px-6 h-12 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-1.5 text-[12px] text-stone-500 min-w-0">
          <button onClick={() => setViewMode('list')} className="hover:text-brand-600 transition-colors font-medium flex items-center gap-1.5">
            <i className="ti ti-arrow-left text-[12px]"></i>Back to Items
          </button>
          <i className="ti ti-chevron-right text-[11px] text-stone-300"></i>
          <span className="text-stone-400 truncate">{activeProduct?.name || 'Item ' + activeProductId}</span>
          <i className="ti ti-chevron-right text-[11px] text-stone-300"></i>
          <span className="font-medium text-stone-700">360° Dashboard</span>
          {/* F8: quick switch prev/next product */}
          <div className="ml-2 flex items-center gap-0.5 pl-2 border-l border-stone-200">
            <button onClick={goPrevProduct} disabled={!prevProduct} className="w-6 h-6 rounded hover:bg-stone-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title={`Previous: ${prevProduct?.name || '—'}`}>
              <i className="ti ti-chevron-left text-stone-500 text-[11px]"></i>
            </button>
            <button onClick={goNextProduct} disabled={!nextProduct} className="w-6 h-6 rounded hover:bg-stone-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title={`Next: ${nextProduct?.name || '—'}`}>
              <i className="ti ti-chevron-right text-stone-500 text-[11px]"></i>
            </button>
          </div>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}></span>
            <span className="text-[11px] font-medium text-emerald-700">D365 sync · {lastSync}</span>
          </div>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-700 border border-black/10 hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98]">
            <i className="ti ti-speakerphone mr-1"></i>New Campaign
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-stone-100 text-stone-700 border border-black/10 hover:bg-stone-200 transition-all hover:-translate-y-px active:scale-[0.98]">
            <i className="ti ti-world-upload mr-1"></i>Publish
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-brand-600 text-white hover:bg-brand-800 transition-all hover:-translate-y-px active:scale-[0.98]">
            <i className="ti ti-upload mr-1"></i>Upload Asset
          </button>
        </div>
      </header>

      {/* AMBER WARNING BAR */}
      {!warningDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2.5 animate-fade-up">
          <i className="ti ti-alert-triangle text-amber-500 text-sm shrink-0"></i>
          <p className="text-[12px] text-amber-800">
            <span className="font-semibold">Material {materialAlerts[0]?.id} ({materialAlerts[0]?.name})</span>
            <span className="mx-1 text-amber-500">—</span>
            Status: <span className="font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">{materialAlerts[0]?.status === 'phasing-out' ? 'Phasing Out' : 'Discontinued'}</span>
            <span className="ml-1.5 text-amber-700">Check variants before new designs.</span>
          </p>
          <button onClick={() => setWarningDismissed(true)} className="ml-auto text-[11px] text-amber-600 hover:text-amber-800 font-medium shrink-0 hover:underline">Dismiss</button>
        </div>
      )}

      {/* PAGE BODY */}
      <main className="flex-1 px-6 py-5 flex flex-col gap-5">

        {/* ITEM HEADER CARD */}
        <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden animate-fade-up">
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #185FA5 0%, #378ADD 60%, #93C5FD 100%)' }}></div>
          <div className="flex items-stretch">
            {/* Hero image + gallery (E5) */}
            <div className="w-[260px] shrink-0 bg-stone-100 relative overflow-hidden flex flex-col" style={{ minHeight: '256px' }}>
              <div className="relative flex-1 overflow-hidden">
                <img src={heroImages[activeImageIdx]?.url} alt={heroImages[activeImageIdx]?.label} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/45 rounded-full px-2 py-0.5 backdrop-blur-sm">
                  <i className="ti ti-photo text-white text-[10px]"></i>
                  <span className="text-[10px] font-semibold text-white tabnum">{heroImages.length} photos</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white bg-emerald-500 rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>{activeProduct?.status || 'Active'}
                  </span>
                  <button className="text-[10px] font-medium text-white/85 bg-black/35 rounded-full px-2.5 py-0.5 backdrop-blur-sm hover:bg-black/55 transition-colors flex items-center gap-1">
                    <i className="ti ti-zoom-in text-[10px]"></i>Zoom
                  </button>
                </div>
                {/* arrow nav */}
                {heroImages.length > 1 && (
                  <>
                    <button onClick={() => setActiveImageIdx(i => (i - 1 + heroImages.length) % heroImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <i className="ti ti-chevron-left text-stone-700 text-sm"></i>
                    </button>
                    <button onClick={() => setActiveImageIdx(i => (i + 1) % heroImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <i className="ti ti-chevron-right text-stone-700 text-sm"></i>
                    </button>
                  </>
                )}
              </div>
              {/* thumb strip */}
              <div className="flex gap-1 p-1.5 bg-black/40">
                {heroImages.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImageIdx(i)} className={`relative w-10 h-10 rounded overflow-hidden shrink-0 border-2 transition-all ${i === activeImageIdx ? 'border-white shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Item meta */}
            <div className="flex-1 min-w-0 px-6 py-5 border-r border-black/[0.07] flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center bg-stone-100 text-stone-600 rounded-md px-2 py-0.5 text-[11px] font-mono font-bold border border-black/8 tabnum tracking-tight">#{activeProductId}</span>
                <span className="text-stone-300 text-xs select-none">·</span>
                <a href="#" className="text-[11px] text-stone-400 hover:text-brand-600 transition-colors">{activeProduct?.collection || 'Collection'}</a>
                <i className="ti ti-chevron-right text-stone-300 text-[10px]"></i>
                <span className="text-[11px] text-stone-500">{activeProduct?.category || 'Category'}</span>
                {/* A2: Ready to Sell badge */}
                <span className="ml-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <i className="ti ti-circle-check-filled text-[10px]"></i>Ready to Sell
                </span>
              </div>
              <h1 className="text-[23px] font-bold text-stone-900 leading-tight tracking-tight">{activeProduct?.name || 'Product'}</h1>
              <div className="flex items-center mt-3 text-[12px]">
                <span className="flex items-center gap-1.5 text-stone-500 pr-4">
                  <i className="ti ti-stack-2 text-stone-400 text-[13px]"></i>
                  Range: <span className="font-semibold text-stone-700 ml-0.5">Greenwood</span>
                </span>
                <span className="w-px h-3.5 bg-stone-200 shrink-0"></span>
                <span className="flex items-center gap-1.5 text-stone-500 px-4">
                  <i className="ti ti-pencil text-stone-400 text-[13px]"></i>
                  Designer: <span className="font-semibold text-stone-700 ml-0.5">Erik Olsen</span>
                </span>
                <span className="w-px h-3.5 bg-stone-200 shrink-0"></span>
                <span className="flex items-center gap-1.5 text-stone-500 pl-4">
                  <i className="ti ti-calendar text-stone-400 text-[13px]"></i>
                  Launched: <span className="font-semibold text-stone-700 ml-0.5">2022</span>
                </span>
              </div>
              <div className="flex-1 min-h-[12px]"></div>
              <div className="pt-4 border-t border-black/[0.06] flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mr-0.5">Live on</span>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>iPaper
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>Web API
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-brand-50 text-brand-600 border border-brand-100 flex items-center gap-1.5">
                  <i className="ti ti-clock text-[10px]"></i>Facebook · scheduled
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-stone-100 text-stone-400 border border-black/8 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0"></span>Instagram · draft
                </span>
              </div>
            </div>

            {/* Completeness panel */}
            <div className="w-[256px] shrink-0 p-5 flex flex-col gap-3.5" style={{ background: '#FAFAF9' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wide">Data Completeness</span>
                <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                  <i className="ti ti-lock text-[10px]"></i> max 80%
                </span>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative w-[58px] h-[58px] shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#E7E5E4" strokeWidth="7" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#185FA5" strokeWidth="7" strokeDasharray="163.4" strokeDashoffset={completenessPanel.strokeOffset} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-brand-600 tabnum">{completenessPanel.overall}%</span>
                </div>
                <div className="flex-1 flex flex-col gap-[6px] pt-0.5">
                  {completenessPanel.bars.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className={`text-[10px] ${item.textColor} w-[58px] shrink-0 truncate`}>{item.label}</span>
                      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('content')}
                className="mt-auto w-full rounded-lg px-3 py-2 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <i className="ti ti-sparkles text-amber-500"></i>Generate AI content
                <i className="ti ti-arrow-right text-[11px] ml-auto"></i>
              </button>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden animate-fade-up">
          <nav className="flex items-center px-2 border-b border-black/8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-[12px] font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${activeTab === tab.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                <i className={`ti ${tab.icon} text-[13px]`}></i>
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 tabnum ${tab.badgeClass}`}>{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-5">
            {/* Stats row — derived from data (A1) */}
            <div className="grid grid-cols-4 gap-4 animate-fade-up">
              {[
                { icon: 'ti-photo', iconBg: 'bg-brand-50', iconColor: 'text-brand-600', value: assetKpis.total, label: 'Media Assets', sub: `${assetKpis.ready} ready · ${assetKpis.processing} processing` },
                { icon: 'ti-file-check', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', value: docKpis.total, label: 'Documents', sub: `${docKpis.approved} approved · ${docKpis.pending} pending` },
                { icon: 'ti-building-store', iconBg: 'bg-violet-50', iconColor: 'text-violet-600', value: salesTotals.customers, label: 'Customers', sub: `${salesTotals.orders} orders · D365` },
                { icon: 'ti-speakerphone', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', value: state.campaigns.length, label: 'Campaigns', sub: `${state.campaigns.filter(c => c.status === 'Scheduled').length} scheduled · ${state.campaigns.filter(c => c.status === 'Posted').length} posted` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 px-4 py-3.5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}>
                    <i className={`ti ${stat.icon} ${stat.iconColor} text-lg`}></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold tabnum text-stone-900 leading-none">{stat.value}</div>
                    <div className="text-[11px] font-medium text-stone-500 mt-0.5">{stat.label}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5 tabnum">{stat.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Assets / Documents row */}
            <div className="grid grid-cols-2 gap-4 animate-fade-up">
              {/* Media Assets Panel */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-photo text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Media Assets</span>
                  </div>
                  <span className="text-[10px] text-stone-400 tabnum">24 assets</span>
                </div>
                <div className="flex gap-2 flex-1">
                  <button onClick={() => openAssetDialog('packshot')} className="relative rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm" style={{ width: '47%' }}>
                    <img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200&h=200&fit=crop&auto=format" alt="Packshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-400 ring-2 ring-white shadow"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="text-[10px] font-semibold text-white">Packshot</div>
                      <div className="text-[9px] text-white/70">8 files · ready</div>
                    </div>
                  </button>
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <button onClick={() => openAssetDialog('lifestyle')} className="relative rounded-lg overflow-hidden cursor-pointer group hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-sm aspect-square">
                      <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&h=120&fit=crop&auto=format" alt="Lifestyle" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400 ring-1 ring-white"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <div className="text-[9px] font-semibold text-white leading-tight">Lifestyle</div>
                      </div>
                    </button>
                    <button onClick={() => openAssetDialog('linedrawing')} className="relative rounded-lg overflow-hidden cursor-pointer group hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-sm aspect-square bg-stone-50 border border-black/8 flex flex-col items-center justify-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                        <i className="ti ti-vector text-brand-500 text-base"></i>
                      </div>
                      <span className="text-[9px] font-semibold text-stone-600 text-center leading-tight">Line<br />Drawing</span>
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400 ring-1 ring-white"></div>
                    </button>
                    <button onClick={() => openAssetDialog('3d')} className="relative rounded-lg overflow-hidden cursor-pointer group hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-sm aspect-square">
                      <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=120&h=120&fit=crop&auto=format" alt="3D" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400 ring-1 ring-white"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <div className="text-[9px] font-semibold text-white leading-tight">OBJ / 3D</div>
                      </div>
                    </button>
                    <div className="flex flex-col gap-1.5 aspect-square">
                      <button onClick={() => openAssetDialog('processing')} className="rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-center gap-1 cursor-pointer hover:bg-amber-100 transition-all flex-1">
                        <i className="ti ti-loader text-amber-500 text-sm spinner"></i>
                        <span className="text-[9px] font-medium text-amber-600">6 processing</span>
                      </button>
                      <button onClick={() => openAssetDialog('upload')} className="rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center gap-1 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-all flex-1">
                        <i className="ti ti-plus text-stone-400 text-sm"></i>
                        <span className="text-[9px] font-medium text-stone-400">Upload</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span><span className="tabnum font-medium text-stone-600">18</span> ready</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span className="tabnum font-medium text-amber-500">6</span> processing</span>
                  </div>
                  <Link to="/image-engine" className="text-[10px] text-brand-600 hover:underline font-medium">Open Image Engine →</Link>
                </div>
              </div>

              {/* Documents Panel */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-file-stack text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Documents</span>
                  </div>
                  <Link to="/document-hub" className="text-[11px] text-brand-600 hover:underline font-medium">View all →</Link>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  {[
                    { icon: 'ti-file-certificate', iconColor: 'text-emerald-500', name: 'PI — Green FSC', sub: 'Packaging Insert · EN', status: 'Approved', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { icon: 'ti-file-description', iconColor: 'text-amber-500', name: 'Assembly Guide — JL', sub: 'Assembly · EN/FR', status: 'Pending', statusClass: 'bg-amber-50 text-amber-700 border-amber-200' },
                    { icon: 'ti-file-barcode', iconColor: 'text-emerald-500', name: 'Shipping Mark — JL', sub: 'Logistics · EN', status: 'Approved', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { icon: 'ti-file-check', iconColor: 'text-emerald-500', name: 'Test Report EU', sub: 'Compliance · EN', status: 'Approved', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { icon: 'ti-file-x', iconColor: 'text-stone-400', name: 'Compliance US', sub: 'Regulatory · EN', status: 'Draft', statusClass: 'bg-stone-100 text-stone-500 border-black/10' },
                    { icon: 'ti-file-description', iconColor: 'text-amber-500', name: 'Care Label — EU', sub: 'Label · EN/DE/FR', status: 'Pending', statusClass: 'bg-amber-50 text-amber-700 border-amber-200' },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
                      <i className={`ti ${doc.icon} ${doc.iconColor} text-base shrink-0`}></i>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-stone-800 truncate">{doc.name}</div>
                        <div className="text-[10px] text-stone-400">{doc.sub}</div>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${doc.statusClass} shrink-0`}>{doc.status}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-[11px] text-stone-400">
                  <span><span className="tabnum font-medium text-emerald-600">8</span> approved · <span className="tabnum font-medium text-amber-500">3</span> pending</span>
                  <span className="bg-stone-100 rounded px-1.5 py-0.5 text-[10px] tabnum">11 total</span>
                </div>
              </div>
            </div>

            {/* 3-column row: AI Content / Publish / Sales */}
            <div className="grid grid-cols-3 gap-4 animate-fade-up">
              {/* AI Content — with working Approve/Regenerate (A7) */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-sparkles text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">AI Content</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${Object.values(aiContentStatus).every(s => s === 'approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {Object.values(aiContentStatus).every(s => s === 'approved') ? 'All approved' : 'Pending approval'}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                  {[
                    { key: 'description', label: 'Product Description (EN)', body: 'The Greenwood Lounge Chair combines Scandinavian craftsmanship with the natural warmth of solid American White Oak. Designed by Erik Olsen, its gently curved silhouette provides exceptional lumbar support while complementing any living space.' },
                    { key: 'social', label: 'Social Caption (Instagram)', body: 'Where craftsmanship meets everyday comfort. The Greenwood Chair — engineered oak, timeless form. ✦ #GreenwoodChair #ScandinavianDesign #ErikOlsen' },
                    { key: 'marketing', label: 'Marketing Text', body: 'Hand-built in Denmark, the Greenwood Chair is a study in restraint and warmth. Its solid American White Oak frame is paired with a sculpted seat for everyday comfort, finished by hand in our Copenhagen workshop.' },
                    { key: 'seo', label: 'SEO Text', body: 'Greenwood Lounge Chair — solid American White Oak, FSC certified. Erik Olsen design. Buy direct from Forma Studio with 5-year warranty.' },
                  ].map((item) => {
                    const status = aiContentStatus[item.key]
                    return (
                      <div key={item.key} className={`rounded-lg p-2.5 border ${status === 'approved' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-stone-50 border-black/10'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{item.label}</div>
                          <div className="flex items-center gap-1.5">
                            {status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                <i className="ti ti-circle-check-filled text-[10px]"></i>Approved
                              </span>
                            ) : (
                              <>
                                <button onClick={() => setAiContentStatus(s => ({ ...s, [item.key]: 'approved' }))} className="text-[10px] font-semibold text-brand-600 hover:underline">Approve</button>
                                <span className="text-stone-200">·</span>
                                <button onClick={() => regenerateAi(item.key)} className="text-[10px] font-medium text-stone-500 hover:text-stone-700">Regenerate</button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[12px] text-stone-600 leading-relaxed">{item.body}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={approveAllAi} className="rounded-lg px-2.5 py-1 text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1">
                      <i className="ti ti-circle-check text-[12px]"></i>Approve all
                    </button>
                    <button onClick={() => setAiContentStatus({ description: 'pending', social: 'pending', marketing: 'pending', seo: 'pending', features: 'pending', bullets: 'pending' })} className="text-[11px] text-stone-500 hover:text-stone-700 font-medium hover:underline">Reset</button>
                  </div>
                  <span className="text-[10px] text-stone-400 tabnum">{Object.values(aiContentStatus).filter(s => s === 'approved').length} / 4 approved</span>
                </div>
              </div>

              {/* Publish Status — 4 channels per spec (A8) */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-world-upload text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Publish Status</span>
                  </div>
                  <button className="text-[11px] text-brand-600 hover:underline font-medium">Manage →</button>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    { icon: 'ti-world', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', name: 'Website', sub: 'Updated 2 days ago', dotColor: 'bg-emerald-500', statusLabel: 'Live', statusColor: 'text-emerald-700', pct: 100 },
                    { icon: 'ti-book', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', name: 'iPaper', sub: 'Updated 2 days ago', dotColor: 'bg-emerald-500', statusLabel: 'Live', statusColor: 'text-emerald-700', pct: 100 },
                    { icon: 'ti-brand-facebook', iconBg: 'bg-brand-100', iconColor: 'text-brand-600', bg: 'bg-brand-50 border-brand-100', name: 'Facebook', sub: 'Scheduled Jun 20 · 09:00', dotColor: 'bg-brand-400', statusLabel: 'Scheduled', statusColor: 'text-brand-600', pct: 85 },
                    { icon: 'ti-brand-instagram', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', name: 'Instagram', sub: 'Awaiting content approval', dotColor: 'bg-amber-400', statusLabel: 'Draft', statusColor: 'text-amber-700', pct: 40 },
                  ].map((ch) => (
                    <div key={ch.name} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${ch.bg}`}>
                      <div className={`w-7 h-7 rounded-lg ${ch.iconBg} flex items-center justify-center shrink-0`}>
                        <i className={`ti ${ch.icon} ${ch.iconColor} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-stone-800">{ch.name}</div>
                        <div className="text-[10px] text-stone-500">{ch.sub}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="hidden sm:block w-12 h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div className="h-full bg-current opacity-60 rounded-full" style={{ width: `${ch.pct}%` }}></div>
                        </div>
                        <span className="text-[10px] text-stone-500 tabnum w-7 text-right">{ch.pct}%</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${ch.dotColor}`}></span>
                        <span className={`text-[11px] font-medium ${ch.statusColor}`}>{ch.statusLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center gap-1.5 text-[10px] text-stone-400">
                  <i className="ti ti-link text-[11px]"></i>
                  <span>CDN dynamic alias — always points to latest-approved asset</span>
                </div>
              </div>

              {/* Customer Sales History — sortable/paginated/searchable (B1-B7) + moved to Overview (B8) */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-chart-bar text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Customer Sales History</span>
                    <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500 tabnum">{salesProcessed.length} rows</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
                      <input value={salesSearch} onChange={e => { setSalesSearch(e.target.value); setSalesPage(1) }} placeholder="Search customer…" className="pl-7 pr-3 py-1.5 text-[11px] bg-stone-50 border border-black/10 rounded-lg focus:outline-none focus:border-brand-400 w-44" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                      <i className="ti ti-lock text-[11px]"></i>source: D365
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-black/8 bg-stone-50/50">
                        {[
                          { key: 'customer',    label: 'Customer',         align: 'left',  sortable: true },
                          { key: 'qty',         label: 'Total Qty Sold',   align: 'right', sortable: true },
                          { key: 'period',      label: 'Order Date Range', align: 'left',  sortable: true },
                          { key: 'lastOrder',   label: 'Last Order Date',  align: 'left',  sortable: true },
                          { key: 'orders',      label: 'No. of Orders',    align: 'right', sortable: true },
                          { key: 'itemNumber',  label: 'Item Number',      align: 'left',  sortable: true, mono: true },
                        ].map(col => (
                          <th key={col.key} onClick={() => col.sortable && toggleSalesSort(col.key)} className={`px-3 py-2.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable ? 'cursor-pointer hover:text-stone-800 transition-colors select-none' : ''}`}>
                            <span className="inline-flex items-center gap-1">
                              {col.label}
                              {col.sortable && salesSort.key === col.key && <i className={`ti ${salesSort.dir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'} text-[10px] text-brand-600`}></i>}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {salesPageRows.length === 0 ? (
                        <tr><td colSpan="6" className="px-3 py-8 text-center text-stone-400 text-[12px]">No matching customers.</td></tr>
                      ) : salesPageRows.map((s) => (
                        <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-3 py-2.5 font-medium text-stone-800">{s.customer}</td>
                          <td className="px-3 py-2.5 text-right tabnum font-bold text-stone-800">{s.qty.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-stone-500 text-[11px]">{s.period}</td>
                          <td className="px-3 py-2.5 text-stone-500 text-[11px] tabnum">{s.lastOrder}</td>
                          <td className="px-3 py-2.5 text-right tabnum text-stone-700 font-semibold">{s.orders}</td>
                          <td className="px-3 py-2.5 font-mono text-stone-500 text-[11px]">{s.itemNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-stone-200 bg-stone-50/30">
                        <td className="px-3 py-2.5 text-[11px] font-semibold text-stone-700">Total ({salesTotals.customers} customers)</td>
                        <td className="px-3 py-2.5 text-right tabnum text-[13px] font-bold text-stone-900">{salesTotals.qty.toLocaleString()}</td>
                        <td colSpan="2" className="px-3 py-2.5 text-[10px] text-stone-400">pcs sold across period</td>
                        <td className="px-3 py-2.5 text-right tabnum text-[13px] font-bold text-stone-900">{salesTotals.orders}</td>
                        <td className="px-3 py-2.5 text-[10px] text-stone-400 text-right">orders total</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {/* B3: pagination */}
                <div className="px-4 py-2.5 border-t border-black/8 bg-stone-50/30 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                    <span>Rows per page</span>
                    <select value={salesPageSize} onChange={e => { setSalesPageSize(Number(e.target.value)); setSalesPage(1) }} className="bg-white border border-black/10 rounded px-1.5 py-0.5 text-[11px] outline-none focus:border-brand-400">
                      {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Page {salesPage} of {salesTotalPages} · showing {(salesPage - 1) * salesPageSize + 1}–{Math.min(salesPage * salesPageSize, salesProcessed.length)} of {salesProcessed.length}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => setSalesPage(1)} disabled={salesPage === 1} className="w-7 h-7 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors" title="First"><i className="ti ti-chevrons-left text-stone-500 text-xs"></i></button>
                    <button onClick={() => setSalesPage(p => Math.max(1, p - 1))} disabled={salesPage === 1} className="w-7 h-7 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors" title="Previous"><i className="ti ti-chevron-left text-stone-500 text-xs"></i></button>
                    {Array.from({ length: salesTotalPages }, (_, i) => i + 1).slice(Math.max(0, salesPage - 3), Math.max(0, salesPage - 3) + 5).map(p => (
                      <button key={p} onClick={() => setSalesPage(p)} className={`w-7 h-7 rounded text-[11px] font-medium transition-colors ${p === salesPage ? 'bg-brand-600 text-white' : 'hover:bg-white text-stone-600'}`}>{p}</button>
                    ))}
                    <button onClick={() => setSalesPage(p => Math.min(salesTotalPages, p + 1))} disabled={salesPage === salesTotalPages} className="w-7 h-7 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors" title="Next"><i className="ti ti-chevron-right text-stone-500 text-xs"></i></button>
                    <button onClick={() => setSalesPage(salesTotalPages)} disabled={salesPage === salesTotalPages} className="w-7 h-7 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors" title="Last"><i className="ti ti-chevrons-right text-stone-500 text-xs"></i></button>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Summary Panel (A5) — Total Customers, Total Units Sold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up">
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <i className="ti ti-building-store text-violet-600 text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold tabnum text-stone-900 leading-none">{salesTotals.customers}</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1">Total Customers</div>
                  <div className="text-[10px] text-stone-400 mt-0.5 tabnum">Across all sales records</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <i className="ti ti-package text-emerald-600 text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold tabnum text-stone-900 leading-none">{salesTotals.qty.toLocaleString()}</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1">Total Units Sold</div>
                  <div className="text-[10px] text-stone-400 mt-0.5 tabnum">pcs · {salesTotals.orders} orders</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/10 shadow-card hover:shadow-hover hover:-translate-y-px transition-all duration-200 px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <i className="ti ti-receipt text-amber-600 text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold tabnum text-stone-900 leading-none">{salesTotals.orders}</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-1">Total Orders</div>
                  <div className="text-[10px] text-stone-400 mt-0.5 tabnum">Avg {(salesTotals.qty / Math.max(salesTotals.orders, 1)).toFixed(1)} pcs/order</div>
                </div>
              </div>
            </div>

            {/* Material Lifecycle Warning — derived from materialAlerts (A6) */}
            {materialAlerts.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-200 shadow-card p-5 flex flex-col gap-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ti ti-leaf text-amber-600 text-base"></i>
                  <span className="text-[13px] font-semibold text-stone-800">Material Lifecycle Warning</span>
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">{materialAlerts.length} issue{materialAlerts.length > 1 ? 's' : ''}</span>
                </div>
                <Link to="/materials" className="text-[11px] text-brand-600 hover:underline font-medium">View material detail →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materialAlerts.slice(0, 2).map((m) => {
                  const variantCount = variants.filter(v => v.material === m.id).length
                  return (
                    <div key={m.id} className={`rounded-xl border p-4 ${m.status === 'phasing-out' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.status === 'phasing-out' ? 'bg-amber-100' : 'bg-red-100'}`}>
                          <i className={`ti ti-wood ${m.status === 'phasing-out' ? 'text-amber-600' : 'text-red-600'} text-xl`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[11px] font-semibold uppercase tracking-wide ${m.status === 'phasing-out' ? 'text-amber-700' : 'text-red-700'}`}>{m.id}</div>
                          <div className="text-[14px] font-bold text-stone-800 leading-tight">{m.name}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">{m.category} · {variantCount} variant{variantCount !== 1 ? 's' : ''} affected</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0">
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center">
                            <i className="ti ti-check text-emerald-600 text-[10px]"></i>
                          </div>
                          <div className="text-[9px] font-semibold text-emerald-700 text-center leading-tight">Active</div>
                        </div>
                        <div className={`flex-1 h-0.5 ${m.status === 'phasing-out' ? 'bg-amber-300' : 'bg-red-300'}`}></div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ring-4 ${m.status === 'phasing-out' ? 'bg-amber-400 border-amber-500 ring-amber-100' : 'bg-red-500 border-red-600 ring-red-100'}`}>
                            <i className="ti ti-clock text-white text-[11px]"></i>
                          </div>
                          <div className={`text-[9px] font-bold text-center leading-tight ${m.status === 'phasing-out' ? 'text-amber-700' : 'text-red-700'}`}>{m.status === 'phasing-out' ? 'Phasing Out' : 'Discontinued'}</div>
                          <span className={`text-[8px] rounded px-1 font-medium ${m.status === 'phasing-out' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>NOW</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-stone-200"></div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-stone-300 flex items-center justify-center">
                            <i className="ti ti-x text-stone-400 text-[10px]"></i>
                          </div>
                          <div className="text-[9px] font-medium text-stone-400 text-center leading-tight">Discontinued</div>
                        </div>
                        <div className="flex-1 h-0.5 bg-stone-200"></div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center">
                            <i className="ti ti-archive text-stone-300 text-[10px]"></i>
                          </div>
                          <div className="text-[9px] font-medium text-stone-300 text-center leading-tight">Obsolete</div>
                        </div>
                      </div>
                      <div className="mt-4 text-[11px] text-amber-700 bg-amber-100 rounded-lg p-2.5 flex items-start gap-2">
                        <i className="ti ti-info-circle text-amber-500 shrink-0 mt-px"></i>
                        <span>{m.status === 'phasing-out' ? 'Being phased out — not recommended for new designs. Estimated end of supply: Q4 2026.' : 'Material discontinued — switch to an alternative immediately.'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            )}
          </div>
        )}

        {/* 360° DASHBOARD */}
        {activeTab === '360' && (
          <div className="flex flex-col gap-5 animate-fade-up">

            {/* ── ROW 1: Hero card ─────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
              <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#185FA5 0%,#378ADD 55%,#93C5FD 100%)' }}></div>
              <div className="flex items-stretch">

                {/* Hero image + thumbnails */}
                <div className="w-[230px] shrink-0 relative overflow-hidden bg-stone-100 flex flex-col" style={{ minHeight: 230 }}>
                  <div className="flex-1 relative overflow-hidden">
                    <img src={heroImages[0]?.url} alt={activeProduct?.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                  <div className="flex gap-1 p-1.5 bg-black/45">
                    {heroImages.slice(0, 5).map((img, i) => (
                      <div key={img.id} className="w-9 h-9 rounded overflow-hidden border-2 border-transparent hover:border-white transition-all opacity-70 hover:opacity-100 cursor-pointer">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {heroImages.length > 5 && (
                      <div className="w-9 h-9 rounded bg-black/60 flex items-center justify-center text-[10px] text-white font-bold">+{heroImages.length - 5}</div>
                    )}
                  </div>
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0 px-6 py-5 border-r border-black/8">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-2 ${activeProduct?.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                    {activeProduct?.status || 'Active'}
                  </span>
                  <h2 className="text-[22px] font-bold text-stone-900 tracking-tight mb-4 leading-tight">{activeProduct?.name}</h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-[12px]">
                    {[
                      { label: 'Item No.', value: activeProduct?.id },
                      { label: 'Base Item', value: activeProduct?.sku || activeProduct?.id },
                      { label: 'Category', value: activeProduct?.category },
                      { label: 'Created', value: '2022-01-15' },
                      { label: 'Collection', value: activeProduct?.collection },
                      { label: 'Last Updated', value: `${activeProduct?.updatedAt || '—'} · Admin` },
                    ].map(f => (
                      <div key={f.label} className="flex items-baseline gap-1.5">
                        <span className="text-stone-400 shrink-0 w-[88px] text-[11px]">{f.label}</span>
                        <span className="font-medium text-stone-700">{f.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completeness + D365 status */}
                <div className="w-[200px] shrink-0 px-5 py-5 border-r border-black/8 flex flex-col gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Completeness Score</div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 shrink-0">
                        <svg viewBox="0 0 64 64" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="32" cy="32" r="26" fill="none" stroke="#E7E5E4" strokeWidth="7" />
                          <circle cx="32" cy="32" r="26" fill="none" stroke="#16a34a" strokeWidth="7" strokeDasharray="163.4" strokeDashoffset={completenessPanel.strokeOffset} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-emerald-700 tabnum">{completenessPanel.overall}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-stone-400 mb-1.5">Status</div>
                    <span className="inline-block rounded-md px-3 py-1 text-[11px] font-bold bg-emerald-600 text-white tracking-wide">READY TO SELL</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-stone-400 mb-1">D365 Sync Status</div>
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-medium text-stone-700">Up to date</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1">Last Sync: {lastSync}</div>
                  </div>
                </div>

                {/* Alert cards */}
                <div className="w-[228px] shrink-0 p-4 flex flex-col gap-2.5 bg-stone-50/50">
                  <div className={`rounded-xl border p-3.5 ${materialAlerts.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-black/10'}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${materialAlerts.length > 0 ? 'bg-amber-100' : 'bg-stone-100'}`}>
                        <i className={`ti ti-alert-triangle text-sm ${materialAlerts.length > 0 ? 'text-amber-600' : 'text-stone-400'}`}></i>
                      </div>
                      <div>
                        <div className={`text-[12px] font-bold leading-tight ${materialAlerts.length > 0 ? 'text-amber-800' : 'text-stone-500'}`}>
                          {materialAlerts.length > 0 ? `${materialAlerts.length} Material${materialAlerts.length > 1 ? 's' : ''} Discontinued` : 'No Material Alerts'}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                          {materialAlerts.length > 0 ? `${materialAlerts.length} material${materialAlerts.length > 1 ? 's' : ''} used in this item are discontinued.` : 'All materials are active.'}
                        </div>
                        {materialAlerts.length > 0 && (
                          <Link to="/materials" className="text-[10px] text-amber-700 font-semibold hover:underline mt-1.5 inline-flex items-center gap-0.5">
                            View details <i className="ti ti-arrow-right text-[9px]"></i>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-brand-50 border-brand-100 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                        <i className="ti ti-refresh text-brand-600 text-sm"></i>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-brand-800 leading-tight">D365 Change Notifications</div>
                        <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                          {(state.syncLog || []).filter(l => l.status === 'Warning').length} changes detected from D365 since last sync.
                        </div>
                        <button className="text-[10px] text-brand-700 font-semibold hover:underline mt-1.5 inline-flex items-center gap-0.5">
                          View changes <i className="ti ti-arrow-right text-[9px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 2: Media / Documents / AI Content ────────────── */}
            <div className="grid grid-cols-3 gap-4">

              {/* Media Assets */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-photo text-brand-600 text-base"></i>
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Media Assets</span>
                  </div>
                  <Link to="/image-engine" className="text-[11px] text-brand-600 hover:underline font-medium">View all →</Link>
                </div>
                <div className="text-[34px] font-bold text-stone-900 tabnum leading-none">{assetKpis.total || 24}</div>
                <div className="text-[11px] text-stone-400 mb-4">Total Assets</div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { icon: 'ti-photo', label: 'Images', count: Math.max((assetKpis.total || 24) - 10, 8) },
                    { icon: 'ti-camera', label: 'Lifestyle', count: 4 },
                    { icon: 'ti-package', label: 'Packaging', count: 3 },
                    { icon: 'ti-video', label: 'Videos', count: 2 },
                    { icon: 'ti-git-fork', label: 'Variants', count: variants.length || 0 },
                  ].map(a => (
                    <div key={a.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-stone-50 border border-black/8 hover:bg-stone-100 transition-colors cursor-pointer">
                      <i className={`ti ${a.icon} text-stone-400 text-sm`}></i>
                      <div className="text-[14px] font-bold tabnum text-stone-800">{a.count}</div>
                      <div className="text-[9px] text-stone-400 text-center leading-tight">{a.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-file-stack text-brand-600 text-base"></i>
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Documents</span>
                  </div>
                  <Link to="/document-hub" className="text-[11px] text-brand-600 hover:underline font-medium">View all →</Link>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {[
                    { label: 'Product Information (PI)', types: ['Product Info', 'PI', 'Product Sheet'] },
                    { label: 'Shipping Mark', types: ['Shipping Mark', 'Shipping'] },
                    { label: 'Assembly Instruction', types: ['Assembly'] },
                    { label: 'Certifications', types: ['Certification', 'Certificate'] },
                    { label: 'BOM', types: ['BOM'] },
                    { label: 'Compliance', types: ['Compliance'] },
                    { label: 'Test Reports', types: ['Test Report'] },
                    { label: 'Others', types: ['Care Guide', 'Datasheet', 'Care'] },
                  ].map(doc => {
                    const has = productDocuments.some(d => doc.types.some(t => (d.type || '').includes(t)))
                    return (
                      <div key={doc.label} className="flex items-center gap-2">
                        <i className={`ti ${has ? 'ti-circle-check-filled text-emerald-500' : 'ti-circle-dashed text-stone-300'} text-sm shrink-0`}></i>
                        <span className="text-[11px] text-stone-600 truncate">{doc.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Content */}
              <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-sparkles text-brand-600 text-base"></i>
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">AI Content</span>
                  </div>
                  <button onClick={() => setActiveTab('content')} className="text-[11px] text-brand-600 hover:underline font-medium">View all →</button>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {[
                    { key: 'description', label: 'Product Description' },
                    { key: 'seo', label: 'SEO Text' },
                    { key: 'social', label: 'Social Caption' },
                    { key: 'features', label: 'Key Features' },
                    { key: 'marketing', label: 'Marketing Text' },
                    { key: 'bullets', label: 'Bullet Points' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-2">
                      <i className={`ti ${aiContentStatus[item.key] === 'approved' ? 'ti-circle-check-filled text-emerald-500' : 'ti-circle-dashed text-stone-300'} text-sm shrink-0`}></i>
                      <span className="text-[11px] text-stone-600">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-black/8 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 tabnum">
                    {Object.values(aiContentStatus).filter(s => s === 'approved').length} / {Object.keys(aiContentStatus).length} approved
                  </span>
                  <button onClick={approveAllAi} className="text-[11px] font-semibold text-brand-600 hover:underline">Approve all</button>
                </div>
              </div>
            </div>

            {/* ── ROW 3: Publish Status + compact cards ─────────────── */}
            <div className="grid grid-cols-12 gap-4">

              {/* Publish Status */}
              <div className="col-span-6 bg-white rounded-xl border border-black/10 shadow-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ti ti-world-upload text-brand-600 text-base"></i>
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Publish Status</span>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { name: 'Website', icon: 'ti-world', status: 'Published', color: 'text-emerald-600', bg: 'bg-emerald-50', pct: 100 },
                    { name: 'iPaper', icon: 'ti-book', status: 'Published', color: 'text-emerald-600', bg: 'bg-emerald-50', pct: 100 },
                    { name: 'Facebook', icon: 'ti-brand-facebook', status: 'Ready', color: 'text-brand-600', bg: 'bg-brand-50', pct: 85 },
                    { name: 'Instagram', icon: 'ti-brand-instagram', status: 'Ready', color: 'text-brand-600', bg: 'bg-brand-50', pct: 85 },
                  ].map(ch => (
                    <div key={ch.name} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-stone-50 border border-black/8">
                      <div className={`w-10 h-10 rounded-xl ${ch.bg} flex items-center justify-center`}>
                        <i className={`ti ${ch.icon} ${ch.color} text-xl`}></i>
                      </div>
                      <div className="text-[11px] font-medium text-stone-700">{ch.name}</div>
                      <div className={`text-[11px] font-bold ${ch.color}`}>{ch.status}</div>
                      <div className="text-[10px] text-stone-400 tabnum">{ch.pct}%</div>
                    </div>
                  ))}
                </div>
                <div className="bg-stone-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-stone-500 font-medium">Content Completeness Score</span>
                    <span className="font-bold text-stone-800 tabnum text-[14px]">{completenessPanel.overall}%</span>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${completenessPanel.overall}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
              </div>

              {/* Product Sets */}
              <div className="col-span-2 bg-white rounded-xl border border-black/10 shadow-card p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ti ti-stack-2 text-brand-600 text-sm"></i>
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Product Sets</span>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {productSets.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-[12px] text-stone-700 hover:text-brand-600 cursor-pointer transition-colors">
                      <i className="ti ti-layout-collage text-stone-300 text-sm shrink-0"></i>
                      <span className="truncate">{s.name}</span>
                    </div>
                  ))}
                  {productSets.length === 0 && <span className="text-[11px] text-stone-400">No sets</span>}
                </div>
                {productSets.length > 3 && (
                  <button className="text-[11px] text-brand-600 hover:underline text-left mt-2">+ {productSets.length - 3} more sets</button>
                )}
              </div>

              {/* Material Alerts */}
              <div className={`col-span-2 rounded-xl border shadow-card p-4 flex flex-col ${materialAlerts.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-black/10'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <i className={`ti ti-alert-triangle text-sm ${materialAlerts.length > 0 ? 'text-amber-600' : 'text-stone-400'}`}></i>
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Material Alerts</span>
                </div>
                <div className={`text-[28px] font-bold tabnum leading-none ${materialAlerts.length > 0 ? 'text-amber-700' : 'text-stone-300'}`}>
                  {materialAlerts.length}
                </div>
                <div className={`text-[12px] font-semibold mt-1 flex-1 ${materialAlerts.length > 0 ? 'text-amber-800' : 'text-stone-400'}`}>
                  {materialAlerts.length > 0 ? `Material${materialAlerts.length > 1 ? 's' : ''} Discontinued` : 'No alerts'}
                </div>
                {materialAlerts.length > 0 && (
                  <Link to="/materials" className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold hover:underline mt-2">
                    View details <i className="ti ti-arrow-right text-[10px]"></i>
                  </Link>
                )}
              </div>

              {/* D365 Changes */}
              <div className="col-span-2 bg-brand-50 border border-brand-100 rounded-xl shadow-card p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ti ti-refresh text-brand-600 text-sm"></i>
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">D365 Changes</span>
                </div>
                <div className="text-[28px] font-bold tabnum text-brand-700 leading-none">
                  {(state.syncLog || []).filter(l => l.status === 'Warning').length || 0}
                </div>
                <div className="text-[12px] font-semibold text-brand-800 mt-1 flex-1">New Changes Detected</div>
                <button className="inline-flex items-center gap-1 text-[11px] text-brand-700 font-semibold hover:underline mt-2">
                  View changes <i className="ti ti-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* ── ROW 4: Sales Table + KPI sidebar ─────────────────── */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-9 bg-white rounded-xl border border-black/10 shadow-card overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-black/8 flex items-center gap-3">
                  <i className="ti ti-chart-bar text-brand-600 text-base"></i>
                  <span className="text-[13px] font-semibold text-stone-800">Customer Sales History</span>
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500 tabnum">{sales.length} rows</span>
                  <div className="ml-auto flex items-center gap-1.5 text-[10px] text-stone-400">
                    <i className="ti ti-lock text-[11px]"></i>source: D365
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-black/8 bg-stone-50/50">
                        {[
                          { label: 'Customer', right: false },
                          { label: 'Total Qty Sold', right: true },
                          { label: 'Order Date Range', right: false },
                          { label: 'Last Order Date', right: false },
                          { label: 'No. of Orders', right: true },
                          { label: 'Item Number', right: false },
                        ].map(col => (
                          <th key={col.label} className={`px-3 py-2.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide ${col.right ? 'text-right' : 'text-left'}`}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {sales.length === 0 ? (
                        <tr><td colSpan="6" className="px-3 py-8 text-center text-stone-400 text-[12px]">No sales data available.</td></tr>
                      ) : sales.slice(0, 6).map((s, i) => (
                        <tr key={s.id || i} className="hover:bg-stone-50 transition-colors">
                          <td className="px-3 py-2.5 font-medium text-stone-800">{s.customer}</td>
                          <td className="px-3 py-2.5 text-right tabnum font-bold text-stone-800">{s.qty?.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-stone-500 text-[11px]">{s.period}</td>
                          <td className="px-3 py-2.5 text-stone-500 text-[11px] tabnum">{s.lastOrder}</td>
                          <td className="px-3 py-2.5 text-right tabnum text-stone-700 font-semibold">{s.orders}</td>
                          <td className="px-3 py-2.5 font-mono text-stone-500 text-[11px]">{s.itemNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-stone-200 bg-stone-50/30">
                        <td className="px-3 py-2.5 text-[11px] font-semibold text-stone-600">Total ({salesTotals.customers} customers)</td>
                        <td className="px-3 py-2.5 text-right tabnum text-[13px] font-bold text-stone-900">{salesTotals.qty.toLocaleString()}</td>
                        <td colSpan="2" className="px-3 py-2.5 text-[10px] text-stone-400">pcs sold · all periods</td>
                        <td className="px-3 py-2.5 text-right tabnum text-[13px] font-bold text-stone-900">{salesTotals.orders}</td>
                        <td className="px-3 py-2.5 text-[10px] text-stone-400">orders total</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* KPI sidebar */}
              <div className="col-span-3 flex flex-col gap-4">
                <div className="bg-white rounded-xl border border-black/10 shadow-card px-5 py-5 flex items-center gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <i className="ti ti-users text-violet-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400 mb-0.5">Total Customers</div>
                    <div className="text-[32px] font-bold tabnum text-stone-900 leading-none">{salesTotals.customers}</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-black/10 shadow-card px-5 py-5 flex items-center gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <i className="ti ti-shopping-cart text-emerald-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400 mb-0.5">Total Units Sold</div>
                    <div className="text-[32px] font-bold tabnum text-stone-900 leading-none">{salesTotals.qty.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VARIANTS PANEL */}
        {activeTab === 'variants' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            {/* E4: bulk action bar */}
            {selectedVariants.size > 0 && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-2.5 flex items-center gap-3 animate-fade-up">
                <span className="text-[12px] font-semibold text-brand-700">{selectedVariants.size} variant(s) selected</span>
                <button onClick={bulkDeleteVariants} className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1.5">
                  <i className="ti ti-trash text-[12px]"></i>Delete
                </button>
                <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-white text-stone-700 border border-black/10 hover:bg-stone-50 transition-colors flex items-center gap-1.5">
                  <i className="ti ti-photo text-[12px]"></i>Assign images
                </button>
                <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-white text-stone-700 border border-black/10 hover:bg-stone-50 transition-colors flex items-center gap-1.5">
                  <i className="ti ti-file-check text-[12px]"></i>Assign docs
                </button>
                <button onClick={() => setSelectedVariants(new Set())} className="ml-auto text-[11px] text-brand-600 hover:underline font-medium">Clear</button>
              </div>
            )}
            <div className="bg-white rounded-xl border border-black/10 shadow-card px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-stone-50 border border-black/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <i className="ti ti-search text-stone-400 text-sm shrink-0"></i>
                <input type="text" placeholder="Search variant SKU or finish…" value={variantSearch} onChange={(e) => setVariantSearch(e.target.value)} className="text-[12px] text-stone-700 bg-transparent outline-none w-full placeholder-stone-400" />
              </div>
              <select value={variantFinish} onChange={(e) => setVariantFinish(e.target.value)} className="text-[12px] text-stone-600 bg-stone-50 border border-black/10 rounded-lg px-2.5 py-1.5 outline-none">
                <option>All finishes</option>
                <option>Natural Oak</option>
                <option>Whitened Oak</option>
                <option>Smoked Oak</option>
              </select>
              <select value={variantStatus} onChange={(e) => setVariantStatus(e.target.value)} className="text-[12px] text-stone-600 bg-stone-50 border border-black/10 rounded-lg px-2.5 py-1.5 outline-none">
                <option>All status</option>
                <option>Active</option>
                <option>Phasing Out</option>
                <option>Discontinued</option>
              </select>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] text-stone-400">116 variants</span>
                <button onClick={openAddVariant} className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-brand-600 text-white hover:bg-brand-800 transition-colors flex items-center gap-1.5">
                  <i className="ti ti-plus text-[12px]"></i>Add Variant
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-black/10 bg-stone-50">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wide w-8">
                      <input type="checkbox" checked={variants.length > 0 && selectedVariants.size === variants.length} onChange={() => setSelectedVariants(prev => prev.size === variants.length ? new Set() : new Set(variants.map(v => v.sku)))} className="rounded border-stone-300 cursor-pointer" />
                    </th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">SKU</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Finish / Fabric</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Images</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Docs</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Material</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Status</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {variants
                    .filter(v => !variantSearch || v.sku.toLowerCase().includes(variantSearch.toLowerCase()) || v.finish.toLowerCase().includes(variantSearch.toLowerCase()))
                    .filter(v => variantStatus === 'All status' || v.status === variantStatus)
                    .map((v) => (
                    <tr key={v.sku} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-2.5"><input type="checkbox" checked={selectedVariants.has(v.sku)} onChange={() => toggleVariant(v.sku)} className="rounded border-stone-300 cursor-pointer" /></td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 flex items-center justify-center" style={{ background: v.color }}>
                            <i className="ti ti-armchair text-white/60 text-sm"></i>
                          </div>
                          <span className="font-medium text-stone-800 tabnum">{v.sku}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-700">
                          <span className="w-3 h-3 rounded-sm border border-stone-300 shrink-0" style={{ background: v.color }}></span>
                          {v.finish}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link to="/image-engine" className={`flex items-center gap-1 ${imgColor(v.images)} hover:underline`}>
                          <i className="ti ti-photo text-[12px]"></i><span className="tabnum">{v.images}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link to="/document-hub" className="flex items-center gap-1 text-emerald-600 hover:underline">
                          <i className="ti ti-file-check text-[12px]"></i><span className="tabnum">{v.docs}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5"><span className="text-[11px] text-stone-500">{v.material}</span></td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${STATUS_CLASS[v.status] || 'bg-stone-100 text-stone-500 border-stone-200'} flex items-center gap-1 w-fit`}>
                          {v.status === 'Phasing Out' && <i className="ti ti-alert-triangle text-[10px]"></i>}
                          {v.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditVariant(v)} className="w-6 h-6 rounded hover:bg-stone-100 flex items-center justify-center transition-colors" title="Edit">
                            <i className="ti ti-pencil text-stone-400 text-[11px]"></i>
                          </button>
                          <button onClick={() => { if (window.confirm('Delete variant ' + v.sku + '?')) deleteVariant(v.sku) }} className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center transition-colors" title="Delete">
                            <i className="ti ti-trash text-stone-400 hover:text-red-500 text-[11px]"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50/50">
                    <td colSpan="8" className="px-4 py-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-stone-400">
                        <i className="ti ti-dots-vertical"></i>
                        <span>Showing 7 of 116 variants</span>
                        <button className="text-brand-600 hover:underline font-medium">Load more</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-t border-black/8 bg-stone-50 flex items-center gap-3">
                <span className="text-[11px] text-stone-400">Select variants to bulk-edit</span>
                <div className="ml-auto flex items-center gap-2">
                  <button className="text-[11px] text-stone-500 hover:text-stone-800 font-medium border border-black/10 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">Assign images</button>
                  <button className="text-[11px] text-stone-500 hover:text-stone-800 font-medium border border-black/10 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">Assign documents</button>
                  <button className="text-[11px] text-stone-500 hover:text-stone-800 font-medium border border-black/10 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">Export CSV</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTRIBUTES PANEL */}
        {activeTab === 'attributes' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-black/8 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-stone-800">Technical Attributes</span>
                <button className="text-[11px] text-brand-600 hover:underline font-medium">Edit all</button>
              </div>
              <div className="divide-y divide-stone-100">
                <div className="px-5 py-3 bg-stone-50/60">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Physical dimensions</div>
                </div>
                <div className="px-5 py-2.5 grid grid-cols-2 gap-x-8 gap-y-2">
                  {[
                    { label: 'Width', value: '760 mm' }, { label: 'Depth', value: '840 mm' },
                    { label: 'Height', value: '730 mm' }, { label: 'Seat height', value: '420 mm' },
                    { label: 'Weight', value: '12.4 kg' }, { label: 'Max load', value: '120 kg' },
                  ].map((a) => (
                    <div key={a.label} className="flex items-center justify-between py-1 border-b border-stone-50">
                      <span className="text-[12px] text-stone-500">{a.label}</span>
                      <span className="text-[12px] font-medium text-stone-800 tabnum">{a.value}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-stone-50/60">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Material</div>
                </div>
                <div className="px-5 py-2.5 grid grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-stone-50">
                    <span className="text-[12px] text-stone-500">Frame material</span>
                    <span className="text-[12px] font-medium text-stone-800 flex items-center gap-1.5">
                      American White Oak
                      <button onClick={() => setActiveTab('relations')} className="text-amber-600 hover:underline text-[10px] flex items-center gap-0.5">
                        <i className="ti ti-alert-triangle text-[10px]"></i>Phasing Out
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-50">
                    <span className="text-[12px] text-stone-500">Seat material</span>
                    <span className="text-[12px] font-medium text-stone-800">Foam + fabric</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-50">
                    <span className="text-[12px] text-stone-500">Surface treatment</span>
                    <span className="text-[12px] font-medium text-stone-800">Natural oil</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-50">
                    <span className="text-[12px] text-stone-500">Certification</span>
                    <span className="text-[12px] font-medium text-emerald-700 flex items-center gap-1"><i className="ti ti-leaf text-[12px]"></i>FSC 100%</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-stone-50/60">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Packaging</div>
                </div>
                <div className="px-5 py-2.5 grid grid-cols-2 gap-x-8 gap-y-2">
                  {[
                    { label: 'Carton W×D×H', value: '820×890×760 mm' }, { label: 'Gross weight', value: '14.8 kg' },
                    { label: 'CBM', value: '0.554' }, { label: "Pcs / 20' container", value: '68' },
                  ].map((a) => (
                    <div key={a.label} className="flex items-center justify-between py-1 border-b border-stone-50">
                      <span className="text-[12px] text-stone-500">{a.label}</span>
                      <span className="text-[12px] font-medium text-stone-800 tabnum">{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ASSETS PANEL */}
        {activeTab === 'assets' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: 'ti-circle-check', iconBg: 'bg-green-50', iconColor: 'text-green-600', label: 'Ready', value: '18', valueColor: 'text-stone-900' },
                { icon: 'ti-loader', iconBg: 'bg-amber-50', iconColor: 'text-amber-500 spinner', label: 'Processing', value: '6', valueColor: 'text-amber-600' },
                { icon: 'ti-versions', iconBg: 'bg-brand-50', iconColor: 'text-brand-600', label: 'Variants generated', value: '554', valueColor: 'text-stone-900' },
                { icon: 'ti-database', iconBg: 'bg-stone-100', iconColor: 'text-stone-500', label: 'Storage used', value: '2.4 GB', valueColor: 'text-stone-900' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-black/10 shadow-card px-4 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}>
                    <i className={`ti ${stat.icon} ${stat.iconColor} text-base`}></i>
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400 font-medium">{stat.label}</div>
                    <div className={`text-lg font-bold tabnum ${stat.valueColor}`}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-black/10 shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-black/8 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-stone-800">All Assets</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
                    <input type="text" placeholder="Search assets..." className="pl-7 pr-3 py-1.5 text-[12px] bg-stone-50 border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 w-40" />
                  </div>
                  <select className="text-[12px] bg-stone-50 border border-black/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400 text-stone-600">
                    <option>All types</option>
                    <option>Packshot</option>
                    <option>Lifestyle</option>
                    <option>Line Drawing</option>
                    <option>3D / OBJ</option>
                  </select>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-800 transition-all hover:-translate-y-px active:scale-[0.98]">
                    <i className="ti ti-cloud-upload text-sm"></i> Upload
                  </button>
                </div>
              </div>
              <div className="p-4 grid grid-cols-5 gap-3">
                {[
                  { img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200&h=112&fit=crop&auto=format', label: 'Packshot', name: '30317-packshot-master', dim: '5472 × 3648 · 8.2 MB', date: '14 Jun 2026', status: 'Ready', statusClass: 'bg-green-50 text-green-700', dotColor: 'bg-green-400', processing: false },
                  { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=112&fit=crop&auto=format', label: 'Lifestyle', name: '30317-lifestyle-hero', dim: '6000 × 4000 · 14.1 MB', date: '13 Jun 2026', status: 'Ready', statusClass: 'bg-green-50 text-green-700', dotColor: 'bg-green-400', processing: false },
                  { img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200&h=112&fit=crop&auto=format', label: 'Detail', name: '30317-detail-closeup', dim: '4320 × 4320 · 11.5 MB', date: '13 Jun 2026', status: 'Ready', statusClass: 'bg-green-50 text-green-700', dotColor: 'bg-green-400', processing: false },
                  { img: null, label: 'Line Drawing', name: '30317-line-drawing', dim: 'SVG + PDF · 2 files', date: '10 Jun 2026', status: 'Ready', statusClass: 'bg-green-50 text-green-700', dotColor: 'bg-green-400', processing: false, isVector: true },
                  { img: null, label: 'OBJ / 3D', name: '30317-3d-model', dim: 'OBJ + GLB · rendering', date: 'Today', status: 'Processing', statusClass: 'bg-amber-50 text-amber-700', dotColor: 'bg-amber-400', processing: true },
                ].map((asset) => (
                  <div key={asset.name} className={`group rounded-xl border overflow-hidden hover:shadow-hover hover:-translate-y-px transition-all duration-200 cursor-pointer ${asset.processing ? 'border-amber-200' : 'border-black/10'}`}>
                    <div className={`h-28 relative overflow-hidden ${asset.processing ? 'bg-amber-50' : asset.isVector ? 'bg-stone-50' : 'bg-stone-100'} flex items-center justify-center`}>
                      {asset.img && <img src={asset.img} alt={asset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                      {asset.isVector && (
                        <div className="flex flex-col items-center gap-1.5">
                          <i className="ti ti-vector text-brand-300 text-3xl"></i>
                          <span className="text-[9px] font-medium text-stone-400">SVG / PDF</span>
                        </div>
                      )}
                      {asset.processing && (
                        <div className="flex flex-col items-center gap-1.5">
                          <i className="ti ti-loader text-amber-400 text-3xl spinner"></i>
                          <span className="text-[9px] font-medium text-amber-500">Rendering…</span>
                        </div>
                      )}
                      <div className={`absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold shadow-sm ${asset.processing ? 'bg-white border border-amber-200 text-amber-700' : asset.isVector ? 'bg-white border border-black/8 text-stone-700' : 'bg-white/90 text-stone-700'}`}>{asset.label}</div>
                      <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${asset.dotColor} ring-2 ring-white shadow`}></div>
                      {asset.img && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-end p-1.5">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-white rounded-md shadow flex items-center justify-center text-stone-600">
                            <i className="ti ti-download text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="text-[11px] font-semibold text-stone-800 truncate">{asset.name}</div>
                      <div className="text-[10px] text-stone-400 tabnum mt-0.5">{asset.dim}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[9px] text-stone-400">{asset.date}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${asset.statusClass}`}>{asset.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Generated Variants — Packshot Master</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    { w: 'w-20', seed: '?w=80&h=56', label: '1920×1080' },
                    { w: 'w-14', seed: '?w=56&h=56', label: '1080²' },
                    { w: 'w-11', seed: '?w=44&h=56', label: '4:5' },
                    { w: 'w-8', seed: '?w=32&h=56', label: '9:16' },
                    { w: 'w-14', seed: '?w=56&h=56', label: 'Print HQ' },
                  ].map((v) => (
                    <div key={v.label} className={`shrink-0 rounded-lg overflow-hidden border border-black/8 bg-stone-50 ${v.w} h-14 relative`}>
                      <img src={`https://images.unsplash.com/photo-1567538096630-e0c55bd6374c${v.seed}&fit=crop&auto=format`} className="w-full h-full object-cover" alt={v.label} />
                      <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[8px] font-medium text-center py-0.5 tabnum">{v.label}</div>
                    </div>
                  ))}
                  <div className="shrink-0 rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 w-14 h-14 flex items-center justify-center cursor-pointer hover:border-brand-300 transition-colors">
                    <i className="ti ti-dots text-stone-300 text-sm"></i>
                  </div>
                  <div className="shrink-0 flex items-center pl-1">
                    <Link to="/image-engine" className="text-[11px] text-brand-600 hover:underline font-medium whitespace-nowrap">View all 554 variants →</Link>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-black/8 bg-stone-50/50 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Showing 5 of 24 assets</span>
                <button className="text-[11px] text-brand-600 hover:underline font-medium">View all in Image Engine →</button>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS PANEL */}
        {activeTab === 'documents' && (() => {
          const selectedDoc = productDocuments.find(d => d.id === selectedDocId) || productDocuments[0] || null
          const approvedCount = productDocuments.filter(d => d.status === 'Approved').length
          const inReviewCount = productDocuments.filter(d => d.status === 'In Review').length
          const draftCount = productDocuments.filter(d => d.status === 'Draft').length + productDocuments.filter(d => d.status === 'Pending customer').length
          return (
            <div className="flex flex-col gap-4 animate-fade-up">
              {/* Stat strip */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Documents', value: productDocuments.length, icon: 'ti-files', color: 'text-stone-700', bg: 'bg-stone-50' },
                  { label: 'Approved', value: approvedCount, icon: 'ti-circle-check', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'In Review', value: inReviewCount, icon: 'ti-eye', color: 'text-brand-600', bg: 'bg-brand-50' },
                  { label: 'Draft / Pending', value: draftCount, icon: 'ti-pencil', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(tile => (
                  <div key={tile.label} className="bg-white rounded-xl border border-black/[0.07] p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${tile.bg} flex items-center justify-center flex-shrink-0`}>
                      <i className={`ti ${tile.icon} ${tile.color} text-base`}></i>
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${tile.color}`}>{tile.value}</div>
                      <div className="text-[11px] text-stone-400 leading-tight">{tile.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main: table + side panel */}
              <div className="flex gap-4 items-start">
                {/* Document table */}
                <div className="flex-1 min-w-0 bg-white rounded-xl border border-black/[0.07] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
                    <span className="text-sm font-semibold text-stone-800">Product Documents</span>
                    <button className="flex items-center gap-1.5 text-[11px] font-medium bg-brand-600 text-white rounded-lg px-3 py-1.5 hover:bg-brand-700 transition-colors">
                      <i className="ti ti-upload text-xs"></i> Upload
                    </button>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-black/[0.06]">
                        <th className="px-4 py-2.5 text-left font-medium text-stone-500">Document</th>
                        <th className="px-3 py-2.5 text-left font-medium text-stone-500">Type</th>
                        <th className="px-3 py-2.5 text-left font-medium text-stone-500">Status</th>
                        <th className="px-3 py-2.5 text-left font-medium text-stone-500">Version</th>
                        <th className="px-3 py-2.5 text-left font-medium text-stone-500">Updated</th>
                        <th className="px-3 py-2.5 text-left font-medium text-stone-500">Lang</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productDocuments.map(doc => {
                        const tc = DOC_TYPE_CFG[doc.type] || DOC_DEFAULT_CFG
                        const sc = DOC_STATUS_CFG[doc.status] || DOC_STATUS_CFG['Draft']
                        const isActive = selectedDocId ? doc.id === selectedDocId : doc.id === (productDocuments[0]?.id)
                        return (
                          <tr
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`border-b border-black/[0.05] cursor-pointer transition-colors ${isActive ? 'bg-brand-50' : 'hover:bg-stone-50'}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-md ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                                  <i className={`ti ${tc.icon} ${tc.color} text-sm`}></i>
                                </div>
                                <span className={`font-medium truncate max-w-[200px] ${isActive ? 'text-brand-700' : 'text-stone-700'}`}>{doc.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${tc.badge}`}>{doc.type}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${sc.cls}`}>
                                <i className={`ti ${sc.icon} text-[10px]`}></i>{doc.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-stone-500">{doc.version}</td>
                            <td className="px-3 py-3 text-stone-400">{doc.updatedAt}</td>
                            <td className="px-3 py-3">
                              <span className="bg-stone-100 text-stone-500 text-[10px] font-medium px-1.5 py-0.5 rounded">{doc.language}</span>
                            </td>
                          </tr>
                        )
                      })}
                      {productDocuments.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-400 text-sm">No documents linked to this product yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Side panel */}
                {selectedDoc && (() => {
                  const tc = DOC_TYPE_CFG[selectedDoc.type] || DOC_DEFAULT_CFG
                  const sc = DOC_STATUS_CFG[selectedDoc.status] || DOC_STATUS_CFG['Draft']
                  const approvalSteps = [
                    { label: 'Uploaded', done: true },
                    { label: 'Technical Review', done: selectedDoc.status !== 'Draft' },
                    { label: 'Compliance Check', done: selectedDoc.status === 'Approved' || selectedDoc.status === 'Pending customer' },
                    { label: 'Customer Approval', done: selectedDoc.status === 'Approved' },
                    { label: 'Published', done: selectedDoc.status === 'Approved' },
                  ]
                  return (
                    <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-black/[0.07] overflow-hidden">
                      {/* Preview header */}
                      <div className={`${tc.bg} px-4 pt-5 pb-4 flex flex-col items-center gap-3 border-b border-black/[0.07]`}>
                        <div className={`w-14 h-14 rounded-xl ${tc.bg} border border-black/[0.08] flex items-center justify-center shadow-sm`}>
                          <i className={`ti ${tc.icon} ${tc.color} text-2xl`}></i>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-stone-800 leading-tight">{selectedDoc.name}</div>
                          <div className="text-[11px] text-stone-400 mt-0.5">{selectedDoc.format} · {selectedDoc.size}</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${sc.cls}`}>
                          <i className={`ti ${sc.icon} text-[10px]`}></i>{selectedDoc.status}
                        </span>
                        <div className="flex gap-2 w-full">
                          <button className="flex-1 text-[11px] font-medium bg-brand-600 text-white rounded-lg py-1.5 hover:bg-brand-700 transition-colors flex items-center justify-center gap-1">
                            <i className="ti ti-download text-xs"></i> Download
                          </button>
                          <button className="flex-1 text-[11px] font-medium border border-black/10 text-stone-600 rounded-lg py-1.5 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1">
                            <i className="ti ti-eye text-xs"></i> Preview
                          </button>
                        </div>
                      </div>

                      {/* Approval workflow */}
                      <div className="px-4 py-3 border-b border-black/[0.06]">
                        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2.5">Approval Workflow</div>
                        <div className="flex flex-col gap-1.5">
                          {approvalSteps.map((step, i) => (
                            <div key={step.label} className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                                {step.done
                                  ? <i className="ti ti-check text-white" style={{ fontSize: 9 }}></i>
                                  : <span className="text-stone-400" style={{ fontSize: 8 }}>{i + 1}</span>
                                }
                              </div>
                              <span className={`text-[11px] ${step.done ? 'text-stone-700' : 'text-stone-400'}`}>{step.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="px-4 py-3 border-b border-black/[0.06]">
                        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Document Info</div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { label: 'Type', value: selectedDoc.type },
                            { label: 'Language', value: selectedDoc.language },
                            { label: 'Version', value: selectedDoc.version },
                            { label: 'Updated', value: selectedDoc.updatedAt },
                            { label: 'Downloads', value: selectedDoc.downloads },
                            { label: 'Format', value: selectedDoc.format },
                            { label: 'Size', value: selectedDoc.size },
                          ].map(row => (
                            <div key={row.label} className="flex justify-between items-center">
                              <span className="text-[11px] text-stone-400">{row.label}</span>
                              <span className="text-[11px] font-medium text-stone-600">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Version history */}
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Version History</div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { ver: selectedDoc.version, date: selectedDoc.updatedAt, note: 'Current', current: true },
                            { ver: 'v1.1', date: '2026-04-10', note: 'Minor update', current: false },
                            { ver: 'v1.0', date: '2025-12-01', note: 'Initial upload', current: false },
                          ].map(v => (
                            <div key={v.ver} className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.current ? 'bg-brand-500' : 'bg-stone-300'}`}></div>
                              <span className={`text-[11px] font-medium ${v.current ? 'text-brand-600' : 'text-stone-400'}`}>{v.ver}</span>
                              <span className="text-[11px] text-stone-400 flex-1">{v.date}</span>
                              <span className="text-[10px] text-stone-400">{v.note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )
        })()}

        {/* CONTENT & PUBLISHING PANEL */}
        {activeTab === 'content' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white rounded-xl border border-black/10 shadow-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-pencil text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Marketing Description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>
                    <button className="text-[11px] text-brand-600 hover:underline font-medium">Edit</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5">EN</div>
                    <div className="text-[12px] text-stone-700 leading-relaxed bg-stone-50 rounded-lg p-3 border border-black/8">
                      The Greenwood Lounge Chair combines timeless Scandinavian design with sustainable American White Oak. Crafted for comfort and longevity, its natural oil finish highlights the grain's natural beauty. FSC 100% certified.
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">FR <span className="rounded px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-medium normal-case">Needs review</span></div>
                    <div className="text-[12px] text-stone-500 leading-relaxed bg-stone-50 rounded-lg p-3 border border-amber-200">
                      Le fauteuil Greenwood allie un design scandinave intemporel au chêne américain durable. Finition à l'huile naturelle, certifié FSC 100%.
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">DE <span className="rounded px-1.5 py-0.5 bg-stone-100 text-stone-400 text-[9px] font-medium normal-case">Not started</span></div>
                    <div className="text-[12px] text-stone-300 leading-relaxed bg-stone-50 rounded-lg p-3 border border-dashed border-stone-200 italic">
                      No German translation yet. <button className="text-brand-600 not-italic font-medium hover:underline">Generate with AI →</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-xl border border-black/10 shadow-card p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ti ti-search text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">SEO</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[10px] text-stone-400 font-medium mb-0.5">Meta title</div>
                      <div className="text-[12px] text-stone-700 bg-stone-50 rounded-lg px-3 py-2 border border-black/8">Greenwood Lounge Chair — Solid Oak, FSC 100%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-medium mb-0.5">Meta description</div>
                      <div className="text-[12px] text-stone-700 bg-stone-50 rounded-lg px-3 py-2 border border-black/8 leading-relaxed">Scandinavian lounge chair in solid American White Oak. Natural oil finish. Available in 3 fabric options.</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-medium mb-0.5">Slug</div>
                      <div className="text-[12px] text-stone-500 bg-stone-50 rounded-lg px-3 py-2 border border-black/8 font-mono">/products/greenwood-lounge-chair</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-black/10 shadow-card p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ti ti-send text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Published Channels</span>
                  </div>
                  {[
                    { icon: 'ti-world', iconColor: 'text-emerald-500', name: 'Website (EN)', status: 'Live', statusClass: 'bg-emerald-50 text-emerald-700' },
                    { icon: 'ti-book', iconColor: 'text-emerald-500', name: 'iPaper Catalog', status: 'Live', statusClass: 'bg-emerald-50 text-emerald-700' },
                    { icon: 'ti-brand-instagram', iconColor: 'text-amber-500', name: 'Social Campaign', status: 'Scheduled', statusClass: 'bg-amber-50 text-amber-700' },
                    { icon: 'ti-shopping-cart', iconColor: 'text-stone-400', name: 'Marketplace (US)', status: 'Not published', statusClass: 'bg-stone-100 text-stone-400' },
                  ].map((ch, i) => (
                    <div key={ch.name} className={`flex items-center gap-2.5 py-1.5 ${i < 3 ? 'border-b border-black/5' : ''}`}>
                      <i className={`ti ${ch.icon} ${ch.iconColor} text-sm shrink-0`}></i>
                      <span className="text-[12px] text-stone-700 flex-1">{ch.name}</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${ch.statusClass}`}>{ch.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RELATIONSHIPS PANEL */}
        {activeTab === 'relations' && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-black/10 shadow-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-components text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Product Sets</span>
                  </div>
                  <Link to="/product-sets" className="text-[11px] text-brand-600 hover:underline font-medium">View all →</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-black/8 hover:bg-stone-50 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                      <i className="ti ti-sofa text-brand-600 text-base"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-stone-800 truncate">Greenwood Living Collection</div>
                      <div className="text-[10px] text-stone-400">8 products · 2 pending</div>
                    </div>
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">Published</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-black/8 hover:bg-stone-50 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                      <i className="ti ti-components text-stone-500 text-base"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-stone-800 truncate">Nordic Seating Series</div>
                      <div className="text-[10px] text-stone-400">14 products · Active</div>
                    </div>
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200 shrink-0">Live</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-amber-200 shadow-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-leaf text-amber-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Materials</span>
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">1 warning</span>
                  </div>
                  <Link to="/materials" className="text-[11px] text-brand-600 hover:underline font-medium">View all →</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <i className="ti ti-wood text-amber-600 text-base"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-stone-800">American White Oak</div>
                      <div className="text-[10px] text-stone-500 tabnum">WOODWO-00003 · FSC 100%</div>
                    </div>
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 shrink-0">Phasing Out</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-black/8 hover:bg-stone-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                      <i className="ti ti-tex text-stone-500 text-base"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-stone-800">Premium Upholstery Foam</div>
                      <div className="text-[10px] text-stone-400">FOAM-00041 · CertiPUR-US</div>
                    </div>
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">Active</span>
                  </div>
                </div>
                <div className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-200 flex items-start gap-1.5">
                  <i className="ti ti-bulb text-amber-500 shrink-0 mt-px"></i>
                  Consider switching to WOODWO-00008 European White Oak (Active) for new designs.
                </div>
              </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>
              <div className="bg-white rounded-xl border border-black/10 shadow-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-arrows-right-left text-brand-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Related Products</span>
                  </div>
                  <button className="text-[11px] text-brand-600 hover:underline font-medium">+ Link product</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: 'ti-armchair', name: 'Greenwood Side Table', sku: '30318 · Cross-sell' },
                    { icon: 'ti-lamp', name: 'Greenwood Floor Lamp', sku: '30321 · Cross-sell' },
                  ].map((p) => (
                    <div key={p.sku} className="rounded-xl border border-black/8 overflow-hidden hover:shadow-hover hover:-translate-y-px transition-all cursor-pointer">
                      <div className="h-20 bg-stone-100 flex items-center justify-center">
                        <i className={`ti ${p.icon} text-stone-400 text-2xl`}></i>
                      </div>
                      <div className="p-2.5">
                        <div className="text-[11px] font-semibold text-stone-800 leading-tight">{p.name}</div>
                        <div className="text-[10px] text-stone-400 tabnum mt-0.5">{p.sku}</div>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-dashed border-stone-200 overflow-hidden hover:border-brand-300 transition-colors cursor-pointer flex items-center justify-center" style={{ minHeight: '100px' }}>
                    <div className="text-center p-3">
                      <i className="ti ti-plus text-stone-300 text-xl block mb-1"></i>
                      <div className="text-[10px] text-stone-400">Add related</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/10 shadow-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-speakerphone text-amber-600 text-base"></i>
                    <span className="text-[13px] font-semibold text-stone-800">Campaigns</span>
                    <span className="text-[10px] text-stone-400 bg-stone-100 rounded px-1.5 py-0.5 tabnum">3</span>
                  </div>
                  <Link to="/social-campaign" className="text-[11px] text-brand-600 hover:underline font-medium">View →</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: 'ti-brand-instagram', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', name: 'Summer Refresh 2026', sub: 'Posted Jun 1 · 4.2k reach', dot: 'bg-emerald-500' },
                    { icon: 'ti-brand-facebook', iconBg: 'bg-brand-50', iconColor: 'text-brand-600', name: 'Nordic Home Feature', sub: 'Scheduled Jun 20 · 09:00', dot: 'bg-brand-400' },
                    { icon: 'ti-brand-pinterest', iconBg: 'bg-stone-100', iconColor: 'text-stone-500', name: 'Design Objects Q3', sub: 'Draft · awaiting content', dot: 'bg-stone-300' },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
                      <div className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
                        <i className={`ti ${c.icon} ${c.iconColor} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-stone-800 truncate">{c.name}</div>
                        <div className="text-[10px] text-stone-400">{c.sub}</div>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`}></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-black/10 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="ti ti-chart-bar text-brand-600 text-base"></i>
                  <span className="text-[13px] font-semibold text-stone-800">Customer Sales History</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                  <i className="ti ti-lock text-[11px]"></i>Read-only · source: D365 · last sync 14 min ago
                </div>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left pb-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide pr-3">Customer</th>
                    <th className="text-right pb-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide pr-3">Qty (pcs)</th>
                    <th className="text-right pb-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sales.slice(0, 5).map((s) => (
                    <tr key={s.customer} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2 font-medium text-stone-700 pr-3">{s.customer}</td>
                      <td className="py-2 text-right tabnum font-bold text-stone-800 pr-3">{s.qty}</td>
                      <td className="py-2 text-right text-stone-400 text-[10px]">{s.period}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-200">
                    <td className="pt-2 text-[11px] font-semibold text-stone-700 pr-3">Total</td>
                    <td className="pt-2 text-right tabnum text-[13px] font-bold text-stone-900 pr-3">971</td>
                    <td className="pt-2 text-right text-[10px] text-stone-400">pcs sold</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ASSET DIALOG */}
      {isAssetDialogOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) closeAssetDialog() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-up">
            <div className="px-5 py-4 border-b border-black/8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg || 'bg-stone-100'}`}>
                  <i className={`${cfg.icon} ${cfg.iconColor} text-base`}></i>
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-stone-900">{cfg.title}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{cfg.meta}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(activeAssetDialogType === 'packshot' || activeAssetDialogType === 'lifestyle' || activeAssetDialogType === 'linedrawing' || activeAssetDialogType === '3d') && (
                  <>
                    <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-stone-100 text-stone-700 border border-black/10 hover:bg-stone-200 transition-colors flex items-center gap-1.5">
                      <i className="ti ti-download text-[12px]"></i>Download all
                    </button>
                    <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-brand-600 text-white hover:bg-brand-800 transition-colors flex items-center gap-1.5">
                      <i className="ti ti-upload text-[12px]"></i>
                      {activeAssetDialogType === 'packshot' ? 'Add packshot' : activeAssetDialogType === 'lifestyle' ? 'Add lifestyle' : activeAssetDialogType === 'linedrawing' ? 'Add drawing' : 'Add 3D file'}
                    </button>
                  </>
                )}
                {activeAssetDialogType === 'processing' && (
                  <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium bg-stone-100 text-stone-700 border border-black/10 hover:bg-stone-200 transition-colors flex items-center gap-1.5">
                    <i className="ti ti-refresh text-[12px]"></i>Refresh
                  </button>
                )}
                <button onClick={closeAssetDialog} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors ml-1">
                  <i className="ti ti-x text-stone-600 text-sm"></i>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <AssetDialogBody type={activeAssetDialogType} />
            </div>
          </div>
        </div>
      )}

      {showVariantModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10">
            <div className="text-sm font-semibold text-stone-900 mb-4">{editVariant ? 'Edit Variant' : 'Add Variant'}</div>
            <div className="flex flex-col gap-3">
              <div><label className="text-[11px] font-medium text-stone-500 block mb-1">SKU</label><input value={variantForm.sku || ''} onChange={e => setVariantForm(f => ({ ...f, sku: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" /></div>
              <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Finish / Fabric</label><input value={variantForm.finish || ''} onChange={e => setVariantForm(f => ({ ...f, finish: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" /></div>
              <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Material Code</label><input value={variantForm.material || ''} onChange={e => setVariantForm(f => ({ ...f, material: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400" /></div>
              <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Color</label><input type="color" value={variantForm.color || '#D4B896'} onChange={e => setVariantForm(f => ({ ...f, color: e.target.value }))} className="h-9 w-full rounded-lg border border-black/10 px-1 py-1 cursor-pointer" /></div>
              <div><label className="text-[11px] font-medium text-stone-500 block mb-1">Status</label>
                <select value={variantForm.status || 'Active'} onChange={e => setVariantForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400">
                  <option>Active</option><option>Phasing Out</option><option>Discontinued</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowVariantModal(false)} className="px-4 py-2 text-sm text-stone-600 border border-black/10 rounded-lg hover:bg-stone-50">Cancel</button>
              <button onClick={handleSaveVariant} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

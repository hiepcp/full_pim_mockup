export const meta = {
  name: 'pim-data-layer',
  description: 'Extract mock data to JSON, create DataContext with CRUD, refactor pages',
  phases: [
    { title: 'Extract', detail: 'Read each page and extract hardcoded data to JSON files' },
    { title: 'Store', detail: 'Create DataContext with CRUD operations for all entities' },
    { title: 'Refactor', detail: 'Update each page to use DataContext plus working CRUD UI' },
  ],
}

const OUT = 'E:/project/full_pim/pim-react'

phase('Extract')

const DATA_SCHEMA = {
  type: 'object',
  properties: {
    entity: { type: 'string' },
    jsonFile: { type: 'string' },
    json: { type: 'string' },
  },
  required: ['entity', 'jsonFile', 'json'],
}

const extractJobs = [
  {
    page: 'Products',
    file: `${OUT}/src/pages/Products.jsx`,
    entity: 'products',
    jsonFile: 'products.json',
    instruction: `Extract ALL hardcoded const arrays/objects from Products.jsx into a single JSON object with these keys:
- "product": single product detail object (id, name, sku, category, collection, status, year, dimensions, weight, price, currency)
- "products": array of 12 products for the list view, each with: id, sku, name, category, collection, status, images (number), completeness (0-100), updatedAt
- "variants": array from VARIANTS const (sku, finish, color, images, docs, material, status)
- "sales": array from SALES const (customer, qty, period)
Return ONLY valid JSON with no JS syntax, no comments, no trailing commas.`,
  },
  {
    page: 'ProductSets',
    file: `${OUT}/src/pages/ProductSets.jsx`,
    entity: 'productSets',
    jsonFile: 'product-sets.json',
    instruction: `Extract all product set data from ProductSets.jsx as JSON: { "productSets": [ array of product sets, each with: id, name, code, category, productCount, status, publishedTo (array of strings), updatedAt ] }. Include at least 8 product sets. Return ONLY valid JSON.`,
  },
  {
    page: 'Materials',
    file: `${OUT}/src/pages/Materials.jsx`,
    entity: 'materials',
    jsonFile: 'materials.json',
    instruction: `Extract all materials data from Materials.jsx as JSON: { "materials": [ array with: id, code, name, category, colorHex, finish, supplier, linkedProducts, status, updatedAt ] }. Return ONLY valid JSON.`,
  },
  {
    page: 'ImageEngine',
    file: `${OUT}/src/pages/ImageEngine.jsx`,
    entity: 'imageAssets',
    jsonFile: 'image-engine.json',
    instruction: `Extract all image data from ImageEngine.jsx as JSON: { "assets": [ array with: id, name, productSku, type, width, height, colorSpace, size, format, status, uploadedAt, tags ], "processingQueue": [ array with: id, name, progress, status ] }. Include 15 plus assets. Return ONLY valid JSON.`,
  },
  {
    page: 'DocumentHub',
    file: `${OUT}/src/pages/DocumentHub.jsx`,
    entity: 'documents',
    jsonFile: 'document-hub.json',
    instruction: `Extract all document data from DocumentHub.jsx as JSON: { "documents": [ array with: id, name, type, productSku, language, version, size, format, status, updatedAt, downloads ] }. Include 15 plus documents. Return ONLY valid JSON.`,
  },
  {
    page: 'SocialCampaign',
    file: `${OUT}/src/pages/SocialCampaign.jsx`,
    entity: 'campaigns',
    jsonFile: 'social-campaign.json',
    instruction: `Extract campaign data from SocialCampaign.jsx as JSON: { "campaigns": [ array with: id, name, status, channels, startDate, endDate, posts, reach, engagement ], "posts": [ array with: id, campaignId, channel, content, scheduledAt, status, likes, comments, shares ] }. Return ONLY valid JSON.`,
  },
  {
    page: 'PublishFlow',
    file: `${OUT}/src/pages/PublishFlow.jsx`,
    entity: 'publishJobs',
    jsonFile: 'publish-flow.json',
    instruction: `Extract publish flow data from PublishFlow.jsx as JSON: { "channels": [ array with: id, name, type, status, lastSync, productCount, syncInterval ], "jobs": [ array with: id, channelId, channelName, status, startedAt, completedAt, recordsProcessed, errors, warnings, triggeredBy ], "queue": [ array with: id, name, type, priority, queuedAt ] }. Return ONLY valid JSON.`,
  },
  {
    page: 'Settings',
    file: `${OUT}/src/pages/Settings.jsx`,
    entity: 'settings',
    jsonFile: 'settings.json',
    instruction: `Extract all settings data from Settings.jsx as JSON: { "members": [ all user objects: id, initials, name, email, role, status, lastActive, avatarClass ], "rolePermissions": [ array from rolePermissions const ], "syncLog": [ array from syncLog const ], "notificationEvents": [ array from notificationEvents const with: label, desc, email, inapp ], "organization": { name, plan, seats, usedSeats }, "d365Config": { tenantId, environment, syncInterval, lastSync, status }, "completenessRules": [ array with: field, required, weight ] }. Return ONLY valid JSON.`,
  },
  {
    page: 'Dashboard',
    file: `${OUT}/src/pages/Dashboard.jsx`,
    entity: 'dashboard',
    jsonFile: 'dashboard.json',
    instruction: `Extract dashboard data from Dashboard.jsx as JSON: { "stats": { products, images, documents, campaigns }, "recentActivity": [ array of 8 activity items: id, type, description, time, user ], "modules": [ array of module cards: id, title, description, route, icon, stats ] }. Return ONLY valid JSON.`,
  },
]

const extractResults = await parallel(extractJobs.map(job => () =>
  agent(`Read the file at: ${job.file} using the Read tool (read the FULL file — use multiple reads if needed for large files).

${job.instruction}

Your response must have:
- entity: "${job.entity}"
- jsonFile: "${job.jsonFile}"
- json: the complete valid JSON string`, {
    label: `extract:${job.page}`,
    phase: 'Extract',
    schema: DATA_SCHEMA,
  })
))

log(`Extracted ${extractResults.filter(Boolean).length} data schemas`)

await agent(`First run this bash command:
mkdir -p "${OUT}/src/data" "${OUT}/src/store"

Then write each JSON file below using the Write tool. Write them one by one.

${extractResults.filter(Boolean).map(r => `FILE: ${OUT}/src/data/${r.jsonFile}\n---\n${r.json}`).join('\n\n===\n\n')}

Confirm when all files are written.`, {
  label: 'write:json-files',
  phase: 'Extract',
})

phase('Store')

await agent(`Create these 3 files for the PIM Studio data layer using the Write tool:

=== ${OUT}/src/store/DataContext.jsx ===

import { createContext, useContext, useReducer } from 'react'
import productsData    from '../data/products.json'
import productSetsData from '../data/product-sets.json'
import materialsData   from '../data/materials.json'
import imageAssetsData from '../data/image-engine.json'
import documentsData   from '../data/document-hub.json'
import campaignsData   from '../data/social-campaign.json'
import publishData     from '../data/publish-flow.json'
import settingsData    from '../data/settings.json'
import dashboardData   from '../data/dashboard.json'

const DataContext = createContext(null)
let _counter = 1000
function uid() { return String(++_counter) }

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PRODUCT':         return { ...state, products: [...state.products, { ...action.payload, id: uid() }] }
    case 'UPDATE_PRODUCT':      return { ...state, products: state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) }
    case 'DELETE_PRODUCT':      return { ...state, products: state.products.filter(p => p.id !== action.payload) }
    case 'ADD_VARIANT':         return { ...state, currentProduct: { ...state.currentProduct, variants: [...(state.currentProduct?.variants || []), action.payload] } }
    case 'UPDATE_VARIANT':      return { ...state, currentProduct: { ...state.currentProduct, variants: state.currentProduct.variants.map(v => v.sku === action.payload.sku ? { ...v, ...action.payload } : v) } }
    case 'DELETE_VARIANT':      return { ...state, currentProduct: { ...state.currentProduct, variants: state.currentProduct.variants.filter(v => v.sku !== action.payload) } }
    case 'ADD_PRODUCT_SET':     return { ...state, productSets: [...state.productSets, { ...action.payload, id: uid() }] }
    case 'UPDATE_PRODUCT_SET':  return { ...state, productSets: state.productSets.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) }
    case 'DELETE_PRODUCT_SET':  return { ...state, productSets: state.productSets.filter(s => s.id !== action.payload) }
    case 'ADD_MATERIAL':        return { ...state, materials: [...state.materials, { ...action.payload, id: uid() }] }
    case 'UPDATE_MATERIAL':     return { ...state, materials: state.materials.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) }
    case 'DELETE_MATERIAL':     return { ...state, materials: state.materials.filter(m => m.id !== action.payload) }
    case 'ADD_ASSET':           return { ...state, assets: [...state.assets, { ...action.payload, id: uid() }] }
    case 'UPDATE_ASSET':        return { ...state, assets: state.assets.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) }
    case 'DELETE_ASSET':        return { ...state, assets: state.assets.filter(a => a.id !== action.payload) }
    case 'ADD_DOCUMENT':        return { ...state, documents: [...state.documents, { ...action.payload, id: uid() }] }
    case 'UPDATE_DOCUMENT':     return { ...state, documents: state.documents.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) }
    case 'DELETE_DOCUMENT':     return { ...state, documents: state.documents.filter(d => d.id !== action.payload) }
    case 'ADD_CAMPAIGN':        return { ...state, campaigns: [...state.campaigns, { ...action.payload, id: uid() }] }
    case 'UPDATE_CAMPAIGN':     return { ...state, campaigns: state.campaigns.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CAMPAIGN':     return { ...state, campaigns: state.campaigns.filter(c => c.id !== action.payload) }
    case 'ADD_JOB':             return { ...state, publishJobs: [action.payload, ...state.publishJobs] }
    case 'UPDATE_JOB':          return { ...state, publishJobs: state.publishJobs.map(j => j.id === action.payload.id ? { ...j, ...action.payload } : j) }
    case 'UPDATE_CHANNEL':      return { ...state, channels: state.channels.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'ADD_MEMBER':          return { ...state, members: [...state.members, { ...action.payload, id: uid() }] }
    case 'UPDATE_MEMBER':       return { ...state, members: state.members.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) }
    case 'DELETE_MEMBER':       return { ...state, members: state.members.filter(m => m.id !== action.payload) }
    case 'UPDATE_NOTIFICATION': return { ...state, notificationEvents: state.notificationEvents.map(n => n.label === action.payload.label ? { ...n, ...action.payload } : n) }
    case 'ADD_SYNC_LOG':        return { ...state, syncLog: [action.payload, ...state.syncLog] }
    default: return state
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    products:           productsData.products || [],
    currentProduct:     { ...(productsData.product || {}), variants: productsData.variants || [] },
    productSets:        productSetsData.productSets || [],
    materials:          materialsData.materials || [],
    assets:             imageAssetsData.assets  || [],
    processingQueue:    imageAssetsData.processingQueue || [],
    documents:          documentsData.documents || [],
    campaigns:          campaignsData.campaigns || [],
    posts:              campaignsData.posts     || [],
    channels:           publishData.channels   || [],
    publishJobs:        publishData.jobs       || [],
    publishQueue:       publishData.queue      || [],
    members:            settingsData.members   || [],
    rolePermissions:    settingsData.rolePermissions || [],
    syncLog:            settingsData.syncLog   || [],
    notificationEvents: settingsData.notificationEvents || [],
    organization:       settingsData.organization || {},
    d365Config:         settingsData.d365Config || {},
    stats:              dashboardData.stats    || {},
    recentActivity:     dashboardData.recentActivity || [],
    modules:            dashboardData.modules  || [],
  })

  const actions = {
    addProduct:         p => dispatch({ type: 'ADD_PRODUCT', payload: p }),
    updateProduct:      p => dispatch({ type: 'UPDATE_PRODUCT', payload: p }),
    deleteProduct:      id => dispatch({ type: 'DELETE_PRODUCT', payload: id }),
    addVariant:         v => dispatch({ type: 'ADD_VARIANT', payload: v }),
    updateVariant:      v => dispatch({ type: 'UPDATE_VARIANT', payload: v }),
    deleteVariant:      sku => dispatch({ type: 'DELETE_VARIANT', payload: sku }),
    addProductSet:      s => dispatch({ type: 'ADD_PRODUCT_SET', payload: s }),
    updateProductSet:   s => dispatch({ type: 'UPDATE_PRODUCT_SET', payload: s }),
    deleteProductSet:   id => dispatch({ type: 'DELETE_PRODUCT_SET', payload: id }),
    addMaterial:        m => dispatch({ type: 'ADD_MATERIAL', payload: m }),
    updateMaterial:     m => dispatch({ type: 'UPDATE_MATERIAL', payload: m }),
    deleteMaterial:     id => dispatch({ type: 'DELETE_MATERIAL', payload: id }),
    addAsset:           a => dispatch({ type: 'ADD_ASSET', payload: a }),
    updateAsset:        a => dispatch({ type: 'UPDATE_ASSET', payload: a }),
    deleteAsset:        id => dispatch({ type: 'DELETE_ASSET', payload: id }),
    addDocument:        d => dispatch({ type: 'ADD_DOCUMENT', payload: d }),
    updateDocument:     d => dispatch({ type: 'UPDATE_DOCUMENT', payload: d }),
    deleteDocument:     id => dispatch({ type: 'DELETE_DOCUMENT', payload: id }),
    addCampaign:        c => dispatch({ type: 'ADD_CAMPAIGN', payload: c }),
    updateCampaign:     c => dispatch({ type: 'UPDATE_CAMPAIGN', payload: c }),
    deleteCampaign:     id => dispatch({ type: 'DELETE_CAMPAIGN', payload: id }),
    addJob:             j => dispatch({ type: 'ADD_JOB', payload: { ...j, id: uid() } }),
    updateJob:          j => dispatch({ type: 'UPDATE_JOB', payload: j }),
    updateChannel:      c => dispatch({ type: 'UPDATE_CHANNEL', payload: c }),
    addMember:          m => dispatch({ type: 'ADD_MEMBER', payload: m }),
    updateMember:       m => dispatch({ type: 'UPDATE_MEMBER', payload: m }),
    deleteMember:       id => dispatch({ type: 'DELETE_MEMBER', payload: id }),
    updateNotification: n => dispatch({ type: 'UPDATE_NOTIFICATION', payload: n }),
    addSyncLog:         e => dispatch({ type: 'ADD_SYNC_LOG', payload: { ...e, id: uid() } }),
  }

  return (
    <DataContext.Provider value={{ state, ...actions }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

=== ${OUT}/src/store/useFilter.js ===

import { useState, useMemo } from 'react'

export function useFilter(items, searchFields, filterKey) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = useMemo(() => {
    let result = Array.isArray(items) ? items : []
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(item =>
        searchFields.some(field => {
          const val = item[field]
          return val && String(val).toLowerCase().includes(q)
        })
      )
    }
    if (filterKey && activeFilter !== 'All') {
      result = result.filter(item => item[filterKey] === activeFilter)
    }
    return result
  }, [items, query, activeFilter])

  return { query, setQuery, activeFilter, setActiveFilter, filtered }
}

=== ${OUT}/src/main.jsx ===

Read the existing file first, then overwrite with:

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DataProvider } from './store/DataContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
)

Write all 3 files using Write tool. Confirm each one.`, {
  label: 'store:create-context',
  phase: 'Store',
})

phase('Refactor')

const MODAL_PATTERN = `MODAL PATTERN:
- State: const [showModal, setShowModal] = useState(false); const [editItem, setEditItem] = useState(null); const [form, setForm] = useState({})
- Open add: setEditItem(null); setForm({}); setShowModal(true)
- Open edit: setEditItem(item); setForm({...item}); setShowModal(true)
- Save: if (editItem) updateXxx(form); else addXxx(form); setShowModal(false)
- Delete: if (window.confirm('Delete this item?')) deleteXxx(item.id)
- Modal JSX overlay: fixed inset-0 bg-black/40 flex items-center justify-center z-50
  Inner panel: bg-white rounded-2xl p-6 w-[480px] shadow-xl border border-black/10
  Form inputs: w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400
  Buttons row: flex gap-2 justify-end mt-5
  Cancel: px-4 py-2 text-sm text-stone-600 border border-black/10 rounded-lg hover:bg-stone-50
  Save: px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700`

const refactorJobs = [
  {
    component: 'Products',
    file: `${OUT}/src/pages/Products.jsx`,
    brief: `Refactor Products.jsx:
1. Add imports: import { useData } from '../store/DataContext.jsx'; import { useFilter } from '../store/useFilter.js'
2. Remove top-level VARIANTS, SALES, ASSET_CONFIGS constants
3. Inside component: const { state, addProduct, updateProduct, deleteProduct, addVariant, updateVariant, deleteVariant } = useData()
4. Add: const [viewMode, setViewMode] = useState('list') — 'list' shows product catalogue, 'detail' shows single product 360
5. LIST VIEW: render a table of state.products with columns (SKU, Name, Category, Status, Completeness, Images, Actions). Add search input using useFilter(state.products, ['name','sku','category'], 'status'). Status filter tabs (All/Active/Phasing Out/Discontinued). "New Product" button. Each row: clickable row switches to detail view, Edit button, Delete button.
6. DETAIL VIEW: show state.currentProduct data (the full product 360 UI from the original file). "Back to List" button at top. Variants table uses state.currentProduct.variants. Add Variant button, Edit per variant row, Delete per variant row.
7. Add modal for product add/edit (fields: sku, name, category, collection, status) and for variant add/edit (fields: sku, finish, status).
8. Keep Layout wrapper. Keep all Tailwind classes and visual design from original file.`,
  },
  {
    component: 'ProductSets',
    file: `${OUT}/src/pages/ProductSets.jsx`,
    brief: `Refactor ProductSets.jsx:
1. Imports: useData, useFilter
2. Remove hardcoded data — use state.productSets
3. const { state, addProductSet, updateProductSet, deleteProductSet } = useData()
4. useFilter(state.productSets, ['name','code'], 'status') for search and filter
5. Filter tabs: All / Active / Draft / Archived
6. "New Product Set" button — modal fields: name, code, category, status
7. Each item: Edit button (same modal, pre-filled), Delete button (confirm)
8. Keep all existing visual design`,
  },
  {
    component: 'Materials',
    file: `${OUT}/src/pages/Materials.jsx`,
    brief: `Refactor Materials.jsx:
1. Imports: useData, useFilter
2. Remove hardcoded data — use state.materials
3. const { state, addMaterial, updateMaterial, deleteMaterial } = useData()
4. useFilter(state.materials, ['name','code','supplier'], 'category') for search and filter
5. Filter tabs: All / Wood / Textile / Leather / Metal / Stone
6. "New Material" button — modal fields: name, code, category, finish, supplier, colorHex (input type="color"), status
7. Color swatch shown as small circle with background color from colorHex
8. Each row: Edit (modal pre-filled), Delete (confirm)
9. Keep all existing visual design`,
  },
  {
    component: 'ImageEngine',
    file: `${OUT}/src/pages/ImageEngine.jsx`,
    brief: `Refactor ImageEngine.jsx:
1. Imports: useData, useFilter
2. Remove hardcoded data — use state.assets, state.processingQueue
3. const { state, addAsset, updateAsset, deleteAsset } = useData()
4. useFilter(state.assets, ['name','productSku'], 'type') for search and type filter
5. Filter tabs: All / packshot / lifestyle / detail / line-drawing
6. "Upload Asset" button — modal fields: name, productSku, type, format, width, height, colorSpace, status (default Ready)
7. Each asset: Delete (confirm), status badge click cycles Ready -> Processing -> Error -> Ready via updateAsset
8. Keep all existing visual design`,
  },
  {
    component: 'DocumentHub',
    file: `${OUT}/src/pages/DocumentHub.jsx`,
    brief: `Refactor DocumentHub.jsx:
1. Imports: useData, useFilter
2. Remove hardcoded data — use state.documents
3. const { state, addDocument, updateDocument, deleteDocument } = useData()
4. useFilter(state.documents, ['name','productSku','type'], 'status') for search and filter
5. Filter tabs: All / Published / Draft / Review
6. "Upload Document" button — modal fields: name, type, language, version, format, productSku, status
7. Each row: Edit (modal), Delete (confirm)
8. Keep all existing visual design`,
  },
  {
    component: 'SocialCampaign',
    file: `${OUT}/src/pages/SocialCampaign.jsx`,
    brief: `Refactor SocialCampaign.jsx:
1. Imports: useData, useFilter
2. Remove hardcoded data — use state.campaigns
3. const { state, addCampaign, updateCampaign, deleteCampaign } = useData()
4. useFilter(state.campaigns, ['name'], 'status') for search and filter
5. Filter tabs: All / Active / Draft / Scheduled / Ended
6. "New Campaign" button — modal fields: name, status, channels (checkboxes: Instagram/Facebook/LinkedIn/Pinterest), startDate, endDate
7. Each campaign: Edit (modal), Delete (confirm)
8. Keep all existing visual design`,
  },
  {
    component: 'PublishFlow',
    file: `${OUT}/src/pages/PublishFlow.jsx`,
    brief: `Refactor PublishFlow.jsx:
1. Imports: useData
2. Remove hardcoded data — use state.channels, state.publishJobs
3. const { state, addJob, updateJob, updateChannel } = useData()
4. "Publish Now" button per channel:
   - First call addJob({ channelId: ch.id, channelName: ch.name, status: 'Running', startedAt: new Date().toLocaleTimeString(), recordsProcessed: 0, errors: 0, warnings: 0, triggeredBy: 'Manual' })
   - Then after 2 seconds (setTimeout) call updateJob({ id: newJobId, status: 'Success', completedAt: new Date().toLocaleTimeString(), recordsProcessed: ch.productCount })
   - Track the newJobId using a ref or state
5. Channel status badge click: toggle Connected/Disconnected via updateChannel
6. "Retry" button on Failed jobs: updateJob({ id: job.id, status: 'Running' }), then setTimeout 2000ms updateJob({ id: job.id, status: 'Success' })
7. Show state.publishJobs as the job history list
8. Keep all existing visual design`,
  },
  {
    component: 'Settings',
    file: `${OUT}/src/pages/Settings.jsx`,
    brief: `Refactor Settings.jsx:
1. Imports: useData
2. Remove hardcoded data — use state from useData
3. const { state, addMember, updateMember, deleteMember, updateNotification, addSyncLog } = useData()
4. Members section (state.members):
   - "Invite Member" button — modal fields: name, email, role (select: Admin/Publisher/Creator/Viewer), generates initials from name
   - Each row: Edit button (modal pre-filled), Delete button (confirm — skip if member.initials === 'HC')
5. Notification events (state.notificationEvents):
   - Toggle email/inapp: onClick calls updateNotification({ label: n.label, email: !n.email }) or inapp version
   - Keep the existing Toggle component as-is
6. Sync log (state.syncLog):
   - "Run Sync" button adds a new entry via addSyncLog({ time: new Date().toLocaleTimeString(), type: 'Manual sync', records: '1,247 records', status: 'Success', duration: '8.5s', note: null })
7. Use state.rolePermissions for the permissions table (read-only display is fine)
8. Keep all existing visual design including the Toggle component`,
  },
]

await parallel(refactorJobs.map(job => () =>
  agent(`Refactor the React component at: ${job.file}

TASK:
${job.brief}

${MODAL_PATTERN}

STEPS:
1. Read the FULL file using Read tool (use offset/limit for large files if needed — file may be 500-1400 lines)
2. Apply all the changes described
3. Write the complete updated file using Write tool

RULES:
- Keep ALL existing JSX structure, Tailwind classes, brand colors, typography
- Keep the Layout wrapper
- use className= not class=, htmlFor= not for=
- No TypeScript annotations
- Default export: export default function ${job.component}() { ... }
- Do NOT use TypeScript generics or interface declarations`, {
    label: `refactor:${job.component}`,
    phase: 'Refactor',
  })
))

log('All pages refactored with CRUD operations')

return {
  outputDir: OUT,
  dataFiles: extractJobs.map(j => `src/data/${j.jsonFile}`),
  storeFiles: ['src/store/DataContext.jsx', 'src/store/useFilter.js'],
  status: 'complete',
}

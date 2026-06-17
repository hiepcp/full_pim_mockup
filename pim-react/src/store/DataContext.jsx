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
    currentProduct:     { ...(productsData.product || {}), variants: productsData.variants || [], sales: productsData.sales || [] },
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

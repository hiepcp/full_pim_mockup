import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import ProductSets from './pages/ProductSets.jsx'
import Materials from './pages/Materials.jsx'
import ImageEngine from './pages/ImageEngine.jsx'
import DocumentHub from './pages/DocumentHub.jsx'
import DocumentHubDetail from './pages/DocumentHubDetail.jsx'
import SocialCampaign from './pages/SocialCampaign.jsx'
import PublishFlow from './pages/PublishFlow.jsx'
import Settings from './pages/Settings.jsx'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product-sets" element={<ProductSets />} />
      <Route path="/materials" element={<Materials />} />
      <Route path="/image-engine" element={<ImageEngine />} />
      <Route path="/document-hub" element={<DocumentHub />} />
      <Route path="/document-hub/:id" element={<DocumentHubDetail />} />
      <Route path="/social-campaign" element={<SocialCampaign />} />
      <Route path="/publish-flow" element={<PublishFlow />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

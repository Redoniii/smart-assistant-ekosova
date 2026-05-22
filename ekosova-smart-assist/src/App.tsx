import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { ToastProvider } from './context/ToastContext'
import Landing from './pages/Landing'
import AgentDashboard from './pages/AgentDashboard'
import ServiceCatalog from './pages/ServiceCatalog'
import ServiceDetail from './pages/ServiceDetail'

function App() {
  return (
    <AccessibilityProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/catalog" element={<ServiceCatalog />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AccessibilityProvider>
  )
}

export default App

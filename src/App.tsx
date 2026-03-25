import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NetworkProvider } from '@/contexts/NetworkContext'
import { useGearPackPreloader } from '@/hooks/useGearPackPreloader'
import {
  HomePage,
  DashboardPage,
  BrowsePage,
  GearDetailPage,
  SearchPage,
  SettingsPage,
} from '@/pages'
import { SectionPage, WorkflowPage, QuickRefPage, GlossaryPage } from '@/pages/gear'

function AppContent() {
  // Proactively preload owned gear packs in background
  useGearPackPreloader()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/gear/:gearId" element={<GearDetailPage />}>
          <Route path="section/:sectionId" element={<SectionPage />} />
          <Route path="workflow/:workflowId" element={<WorkflowPage />} />
          <Route path="quick-ref" element={<QuickRefPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <NetworkProvider>
        <AppContent />
      </NetworkProvider>
    </ErrorBoundary>
  )
}

export default App

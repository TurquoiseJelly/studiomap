import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { OfflineIndicator, InstallPrompt } from '@/components/ui'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <OfflineIndicator />
      <InstallPrompt />
    </div>
  )
}

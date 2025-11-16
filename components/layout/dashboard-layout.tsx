'use client'

import { useState } from 'react'
import { User } from '@/lib/db'
import { Button } from '@/components/ui/button'
import Sidebar from './sidebar'
import Dashboard from '@/components/pages/dashboard'
import StockManagement from '@/components/pages/stock-management'
import SalesEntry from '@/components/pages/sales-entry'
import SalesList from '@/components/pages/sales-list'
import StockTransfer from '@/components/pages/stock-transfer'
import Reports from '@/components/pages/reports'
import ActivityLog from '@/components/pages/activity-log'
import Contact from '@/components/pages/contact'

interface DashboardLayoutProps {
  user: User
  onLogout: () => void
}

export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState<string>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        user={user} 
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page)
          setMenuOpen(false)
        }}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border h-16 px-4 md:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">Secura Web Stock Management System</h1>
              <p className="text-xs text-muted-foreground">{user.name} • {user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="text-destructive hover:text-destructive"
          >
            Logout
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-white to-gray-50">
          {currentPage === 'dashboard' && <Dashboard user={user} />}
          {currentPage === 'stock' && <StockManagement user={user} />}
          {currentPage === 'sales' && <SalesEntry user={user} />}
          {currentPage === 'sales-list' && <SalesList user={user} />}
          {currentPage === 'transfer' && <StockTransfer user={user} />}
          {currentPage === 'reports' && <Reports user={user} />}
          {currentPage === 'activity' && <ActivityLog user={user} />}
          {currentPage === 'contact' && <Contact user={user} />}
        </main>

        <footer className="bg-primary text-primary-foreground text-xs py-2 px-4 md:px-6 text-center">
          <p>Secura Web Stock Management System - v1.1</p>
        </footer>
      </div>
    </div>
  )
}

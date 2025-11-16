'use client'

import { User } from '@/lib/db'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  user: User
  currentPage: string
  onPageChange: (page: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ user, currentPage, onPageChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'stock', label: 'Stock Management', icon: '📦' },
    { id: 'sales', label: 'Sales Entry', icon: '💳' },
    { id: 'sales-list', label: 'Sales List', icon: '📋' },
  ]

  if (user.role === 'admin') {
    menuItems.push(
      { id: 'transfer', label: 'Stock Transfer', icon: '↔️' },
      { id: 'reports', label: 'Reports', icon: '📈' },
      { id: 'activity', label: 'Activity Log', icon: '📝' },
    )
  }

  menuItems.push({ id: 'contact', label: 'Contact', icon: '📞' })

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative w-64 h-screen bg-white border-r border-primary/20 text-foreground z-50 md:z-auto
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-primary/20">
          <h2 className="font-bold text-lg text-primary">Secura Web SM</h2>
          <p className="text-xs text-muted-foreground font-medium">Stock Management</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id)
                onClose()
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-3
                ${currentPage === item.id
                  ? 'bg-primary text-white shadow-md'
                  : 'hover:bg-primary/10 text-foreground hover:text-primary'
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-primary/20 bg-primary/5">
          <p className="text-sm font-semibold text-primary truncate">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            {user.role.replace(/_/g, ' ')}
          </p>
        </div>
      </aside>
    </>
  )
}

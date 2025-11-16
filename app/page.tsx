'use client'

import { useEffect, useState } from 'react'
import { db, User } from '@/lib/db'
import { getStoredUser, setStoredUser } from '@/lib/auth'
import LoginPage from '@/components/auth/login-page'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    db.init()
    const storedUser = getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setStoredUser(loggedInUser)
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setStoredUser(null)
    setUser(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">Secura</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <DashboardLayout user={user} onLogout={handleLogout} />
}

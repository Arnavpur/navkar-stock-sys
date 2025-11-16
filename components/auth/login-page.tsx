'use client'

import { useState } from 'react'
import { User, db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const users = db.getUsers()
      const user = users.find(u => u.email === email && u.password === password)

      if (user) {
        onLogin(user)
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (role: 'admin' | 'staff') => {
    const users = db.getUsers()
    const user = users.find(u => u.role === role)
    if (user) {
      onLogin(user)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Secura</h1>
          <p className="text-sm text-muted-foreground mt-1">Stock Management System</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="border-2 border-border focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="border-2 border-border focus:border-primary"
                />
              </div>

              {error && <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">{error}</div>}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white h-10 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground text-center mb-4 uppercase tracking-wide">Quick Demo Access</p>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-sm font-medium border-2 border-primary/20 hover:bg-primary/5"
                  onClick={() => handleDemoLogin('admin')}
                >
                  Admin Account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-sm font-medium border-2 border-secondary/20 hover:bg-secondary/5"
                  onClick={() => handleDemoLogin('staff')}
                >
                  Staff Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          <span className="block">Admin: admin1@secura.com / admin123</span>
          <span className="block mt-1">Staff: staff1@secura.com / staff123</span>
        </p>
      </div>
    </div>
  )
}

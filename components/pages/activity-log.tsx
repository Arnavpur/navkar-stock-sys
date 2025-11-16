'use client'

import { useEffect, useState } from 'react'
import { User, db, ActivityLog } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ActivityLogProps {
  user: User
}

export default function ActivityLogPage({ user }: ActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([])

  useEffect(() => {
    setLogs(db.getActivityLogs().reverse())
  }, [])

  if (user.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Only admins can access activity logs</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>

      <Card className="bg-white border-border shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border-l-4 border-accent bg-muted/50 rounded">
                <div className="text-2xl">
                  {log.type === 'stock_add' && '📦'}
                  {log.type === 'sale' && '💳'}
                  {log.type === 'transfer' && '↔️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{log.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No activities yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

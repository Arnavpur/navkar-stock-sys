'use client'

import { useEffect, useState } from 'react'
import { User, db, Stock, Sale, Store } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [totalStock, setTotalStock] = useState(0)
  const [totalSold, setTotalSold] = useState(0)
  const [stores, setStores] = useState<Store[]>([])
  const [storeData, setStoreData] = useState<Record<string, { available: number; sold: number }>>({})

  useEffect(() => {
    const allStores = db.getStores()
    setStores(allStores)

    const stock = db.getStock()
    const sales = db.getSales()

    const available = stock.filter(s => s.status === 'available').length
    setTotalStock(available)
    setTotalSold(sales.length)

    const data: Record<string, { available: number; sold: number }> = {}
    allStores.forEach(store => {
      data[store.id] = {
        available: stock.filter(s => s.storeId === store.id && s.status === 'available').length,
        sold: sales.filter(s => s.storeId === store.id).length,
      }
    })
    setStoreData(data)
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Available Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{totalStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Units in stock</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent">{totalSold}</div>
            <p className="text-xs text-muted-foreground mt-1">Transactions completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Store Wise Breakdown */}
      <Card className="bg-white border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Store-wise Quantities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stores.map(store => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{store.name}</p>
                  <p className="text-xs text-muted-foreground">{store.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{storeData[store.id]?.available || 0}</p>
                  <p className="text-xs text-muted-foreground">Available • {storeData[store.id]?.sold || 0} Sold</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Stores', value: stores.length },
          { label: 'Users', value: db.getUsers().length },
          { label: 'Transfers', value: db.getTransfers().length },
          { label: 'Activities', value: db.getActivityLogs().length },
        ].map(stat => (
          <Card key={stat.label} className="bg-white border-border shadow-sm">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { User, db, Sale } from '@/lib/db'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SalesListProps {
  user: User
}

export default function SalesList({ user }: SalesListProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'name' | 'number' | 'date' | 'model' | 'serial'>('all')

  useEffect(() => {
    setSales(db.getSales())
  }, [])

  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase()
    
    switch (filterType) {
      case 'name':
        return sale.customerName.toLowerCase().includes(searchLower)
      case 'number':
        return sale.customerNumber.includes(searchTerm)
      case 'date':
        return new Date(sale.createdAt).toLocaleDateString().includes(searchTerm)
      case 'model':
        return sale.items.some(item => item.model.toLowerCase().includes(searchLower))
      case 'serial':
        return sale.items.some(item => item.serialNumber.toLowerCase().includes(searchLower))
      default:
        return (
          sale.customerName.toLowerCase().includes(searchLower) ||
          sale.customerNumber.includes(searchTerm) ||
          sale.items.some(item => 
            item.model.toLowerCase().includes(searchLower) || 
            item.serialNumber.toLowerCase().includes(searchLower)
          )
        )
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales List</h1>
        <p className="text-sm text-muted-foreground mt-1">View and search sales history</p>
      </div>

      <Card className="bg-white border-border shadow-md">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Enter search term..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Filter by</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="all">All Fields</option>
                <option value="name">Customer Name</option>
                <option value="number">Customer Number</option>
                <option value="date">Date</option>
                <option value="model">Model</option>
                <option value="serial">Serial Number</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-semibold">Found {filteredSales.length} sales</p>
        
        {filteredSales.length === 0 ? (
          <Card className="bg-white border-border">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No sales found</p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map(sale => (
            <Card key={sale.id} className="bg-white border-border shadow-sm hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer Name</p>
                      <p className="font-semibold text-foreground">{sale.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Customer Phone</p>
                      <p className="font-semibold text-foreground">{sale.customerNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">{new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-accent text-lg">₹{sale.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-semibold text-foreground mb-2">Items Sold ({sale.items.length})</p>
                    <div className="space-y-2">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <div>
                            <p className="font-medium">{item.brand} {item.model}</p>
                            <p className="text-xs text-muted-foreground font-mono">SN: {item.serialNumber}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

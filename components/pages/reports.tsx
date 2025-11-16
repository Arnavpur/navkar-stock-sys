'use client'

import { useEffect, useState } from 'react'
import { User, db, Product, Stock, Sale } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReportsProps {
  user: User
}

export default function Reports({ user }: ReportsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [stores] = useState(db.getStores())

  useEffect(() => {
    setProducts(db.getProducts())
    setStock(db.getStock())
    setSales(db.getSales())
  }, [])

  if (user.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Only admins can access reports</p>
      </div>
    )
  }


  // Get all stores
  const mainStore = stores.find(s => s.name.includes('Main')) || stores[0]
  const branchStore = stores.find(s => s.name.includes('Branch')) || stores[1]

  // Stock in Main Store
  const mainStoreStock = stock.filter(s => s.storeId === mainStore?.id && s.status === 'available')
  const mainStoreModels = [...new Set(mainStoreStock.map(s => {
    const product = products.find(p => p.id === s.productId)
    return product?.model || ''
  }))].filter(Boolean)

  // Stock in Branch Store
  const branchStoreStock = stock.filter(s => s.storeId === branchStore?.id && s.status === 'available')
  const branchStoreModels = [...new Set(branchStoreStock.map(s => {
    const product = products.find(p => p.id === s.productId)
    return product?.model || ''
  }))].filter(Boolean)

  // Sold items
  const soldItems = stock.filter(s => s.status === 'sold')

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Store Stock */}
        <Card className="bg-white border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{mainStore?.name || 'Store 1'}</span>
              <span className="text-2xl font-bold text-primary">{mainStoreStock.length}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Available Laptops</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Available Models:</p>
              <div className="space-y-2">
                {mainStoreModels.map(model => {
                  const modelSerials = mainStoreStock
                    .filter(s => {
                      const product = products.find(p => p.id === s.productId)
                      return product?.model === model
                    })
                    .map(s => s.serialNumber)
                  
                  return (
                    <div key={model} className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                      <p className="font-medium text-foreground">{model}</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-2">Qty: {modelSerials.length}</p>
                      <div className="text-xs space-y-1">
                        {modelSerials.map(serial => (
                          <p key={serial} className="text-muted-foreground font-mono">SN: {serial}</p>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {mainStoreModels.length === 0 && (
                  <p className="text-sm text-muted-foreground">No stock available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch Store Stock */}
        <Card className="bg-white border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{branchStore?.name || 'Store 2'}</span>
              <span className="text-2xl font-bold text-secondary">{branchStoreStock.length}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Available Laptops</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Available Models:</p>
              <div className="space-y-2">
                {branchStoreModels.map(model => {
                  const modelSerials = branchStoreStock
                    .filter(s => {
                      const product = products.find(p => p.id === s.productId)
                      return product?.model === model
                    })
                    .map(s => s.serialNumber)
                  
                  return (
                    <div key={model} className="p-3 bg-secondary/5 border border-secondary/10 rounded-lg">
                      <p className="font-medium text-foreground">{model}</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-2">Qty: {modelSerials.length}</p>
                      <div className="text-xs space-y-1">
                        {modelSerials.map(serial => (
                          <p key={serial} className="text-muted-foreground font-mono">SN: {serial}</p>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {branchStoreModels.length === 0 && (
                  <p className="text-sm text-muted-foreground">No stock available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sold Laptops */}
      <Card className="bg-white border-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sold Laptops</span>
            <span className="text-2xl font-bold text-red-600">{soldItems.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {soldItems.map(item => {
              const product = products.find(p => p.id === item.productId)
              const sale = sales.find(s => s.items.some(si => si.stockId === item.id))
              
              if (!product) return null

              return (
                <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{product.brand} {product.model}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">SN: {item.serialNumber}</p>
                    </div>
                    <div className="text-xs text-right">
                      {sale && (
                        <>
                          <p className="text-muted-foreground">Sold to: {sale.customerName}</p>
                          <p className="text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {soldItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No sold items yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Available</p>
            <p className="text-3xl font-bold text-primary mt-2">{mainStoreStock.length + branchStoreStock.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Sold</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{soldItems.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border border-secondary/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Overall Total</p>
            <p className="text-3xl font-bold text-secondary mt-2">{stock.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

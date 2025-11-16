'use client'

import { useEffect, useState } from 'react'
import { User, db, Product, Stock, Transfer, TransferItem } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StockTransferProps {
  user: User
}

export default function StockTransfer({ user }: StockTransferProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [stores] = useState(db.getStores())

  const [formData, setFormData] = useState({
    fromStoreId: 'store1',
    toStoreId: 'store2',
  })
  const [items, setItems] = useState<TransferItem[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSerial, setSelectedSerial] = useState('')

  useEffect(() => {
    setProducts(db.getProducts())
    setStock(db.getStock())
    setTransfers(db.getTransfers())
  }, [])

  if (user.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Only admins can access stock transfer</p>
      </div>
    )
  }

  const brands = [...new Set(products.map(p => p.brand))].sort()
  const models = products.filter(p => p.brand === selectedBrand).map(p => p.model)
  const serials = stock
    .filter(s => 
      products.find(p => p.id === s.productId && p.brand === selectedBrand && p.model === selectedModel) &&
      s.storeId === formData.fromStoreId &&
      s.status === 'available'
    )
    .map(s => s.serialNumber)

  const handleAddItem = () => {
    if (!selectedBrand || !selectedModel || !selectedSerial) {
      alert('Please select all fields')
      return
    }

    const item: TransferItem = {
      stockId: stock.find(s => s.serialNumber === selectedSerial)?.id || '',
      brand: selectedBrand,
      model: selectedModel,
      serialNumber: selectedSerial,
    }

    setItems([...items, item])
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedSerial('')
  }

  const handleCompleteTransfer = () => {
    if (items.length === 0) {
      alert('Please add at least one item')
      return
    }

    const newTransfer = db.addTransfer({
      fromStoreId: formData.fromStoreId,
      toStoreId: formData.toStoreId,
      items,
      createdBy: user.id,
    })

    items.forEach(item => {
      db.updateStockStore(item.stockId, formData.toStoreId)
    })

    const toStore = stores.find(s => s.id === formData.toStoreId)
    db.addActivityLog({
      type: 'transfer',
      description: `Transferred ${items.length} item(s) to ${toStore?.name}`,
      userId: user.id,
    })

    setTransfers([...transfers, newTransfer])
    setItems([])
    setStock(db.getStock())

    alert('Transfer completed successfully!')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Transfer</h1>
        <p className="text-sm text-muted-foreground mt-1">Transfer stock between stores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-border shadow-md">
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">From Store</label>
                <select
                  value={formData.fromStoreId}
                  onChange={(e) => setFormData({...formData, fromStoreId: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">To Store</label>
                <select
                  value={formData.toStoreId}
                  onChange={(e) => setFormData({...formData, toStoreId: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg"
                >
                  {stores.filter(s => s.id !== formData.fromStoreId).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border shadow-md">
            <CardHeader>
              <CardTitle>Select Items to Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value)
                    setSelectedModel('')
                    setSelectedSerial('')
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg"
                >
                  <option value="">Select brand</option>
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {selectedBrand && (
                <div>
                  <label className="text-sm font-medium">Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value)
                      setSelectedSerial('')
                    }}
                    className="w-full px-3 py-2 border border-input rounded-lg"
                  >
                    <option value="">Select model</option>
                    {models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedBrand && selectedModel && (
                <div>
                  <label className="text-sm font-medium">Serial Number</label>
                  <select
                    value={selectedSerial}
                    onChange={(e) => setSelectedSerial(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg"
                  >
                    <option value="">Select serial</option>
                    {serials.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                onClick={handleAddItem}
                disabled={!selectedBrand || !selectedModel || !selectedSerial}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Add Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white border-border shadow-md sticky top-4">
            <CardHeader>
              <CardTitle>Transfer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-muted/50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.brand} {item.model}</p>
                      <p className="text-xs text-muted-foreground">{item.serialNumber}</p>
                    </div>
                    <button
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="text-destructive hover:text-destructive/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-lg font-bold">Total: {items.length} items</p>
              </div>

              <Button
                onClick={handleCompleteTransfer}
                disabled={items.length === 0}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                Complete Transfer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-white border-border shadow-md">
        <CardHeader>
          <CardTitle>Recent Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transfers.slice(-5).reverse().map(transfer => {
              const fromStore = stores.find(s => s.id === transfer.fromStoreId)
              const toStore = stores.find(s => s.id === transfer.toStoreId)
              return (
                <div key={transfer.id} className="p-3 border border-border rounded-lg">
                  <p className="text-sm font-medium">{transfer.items.length} items: {fromStore?.name} → {toStore?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transfer.createdAt).toLocaleDateString()} {new Date(transfer.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

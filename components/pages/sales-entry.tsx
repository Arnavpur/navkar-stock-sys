'use client'

import { useEffect, useState } from 'react'
import { User, db, Product, Stock, Sale, SaleItem } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SalesEntryProps {
  user: User
}

export default function SalesEntry({ user }: SalesEntryProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [stores] = useState(db.getStores())

  const [formData, setFormData] = useState({
    customerName: '',
    customerNumber: '',
    storeId: user.store || 'store1',
  })
  const [items, setItems] = useState<SaleItem & { price: number }[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSerial, setSelectedSerial] = useState('')
  const [itemPrice, setItemPrice] = useState('')

  useEffect(() => {
    setProducts(db.getProducts())
    setStock(db.getStock())
    setSales(db.getSales())
  }, [])

  const brands = [...new Set(products.map(p => p.brand))].sort()
  const models = products.filter(p => p.brand === selectedBrand).map(p => p.model)
  const serials = stock
    .filter(s => 
      products.find(p => p.id === s.productId && p.brand === selectedBrand && p.model === selectedModel) &&
      s.storeId === formData.storeId &&
      s.status === 'available'
    )
    .map(s => s.serialNumber)

  const handleAddItem = () => {
    if (!selectedBrand || !selectedModel || !selectedSerial || !itemPrice) {
      alert('Please select brand, model, serial and enter price')
      return
    }

    const product = products.find(p => p.brand === selectedBrand && p.model === selectedModel)
    if (!product) return

    const item = {
      stockId: stock.find(s => s.serialNumber === selectedSerial)?.id || '',
      brand: selectedBrand,
      model: selectedModel,
      serialNumber: selectedSerial,
      price: Number(itemPrice),
    }

    setItems([...items, item])
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedSerial('')
    setItemPrice('')
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0)

  const handleCompleteSale = () => {
    if (!formData.customerName || !formData.customerNumber || items.length === 0) {
      alert('Please fill all fields and add at least one item')
      return
    }

    const saleItems: SaleItem[] = items.map(({ price, ...item }) => item)

    const newSale = db.addSale({
      customerName: formData.customerName,
      customerNumber: formData.customerNumber,
      storeId: formData.storeId,
      items: saleItems,
      totalAmount,
      createdBy: user.id,
    })

    items.forEach(item => {
      db.updateStockStatus(item.stockId, 'sold')
    })

    db.addActivityLog({
      type: 'sale',
      description: `Sold ${items.length} item(s) to ${formData.customerName}`,
      userId: user.id,
    })

    setSales([...sales, newSale])
    setItems([])
    setFormData({ customerName: '', customerNumber: '', storeId: user.store || 'store1' })
    setStock(db.getStock())

    alert('Sale completed successfully!')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales Entry</h1>
        <p className="text-sm text-muted-foreground mt-1">Record a new sale transaction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-border shadow-md">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <Input
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Phone *</label>
                <Input
                  placeholder="Enter customer phone"
                  value={formData.customerNumber}
                  onChange={(e) => setFormData({...formData, customerNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Store</label>
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-lg"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border shadow-md">
            <CardHeader>
              <CardTitle>Select Products</CardTitle>
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

              {selectedBrand && selectedModel && selectedSerial && (
                <div>
                  <label className="text-sm font-medium">Price *</label>
                  <Input
                    type="number"
                    placeholder="Enter sale price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                </div>
              )}

              <Button
                onClick={handleAddItem}
                disabled={!selectedBrand || !selectedModel || !selectedSerial || !itemPrice}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Add Item to Sale
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white border-border shadow-md sticky top-4">
            <CardHeader>
              <CardTitle>Sale Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-muted/50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.brand} {item.model}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.serialNumber}</p>
                      <p className="text-xs font-semibold text-accent">₹{item.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-destructive hover:text-destructive/80 flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Items:</span>
                  <span className="font-semibold">{items.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border text-accent">
                  <span>Total:</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleCompleteSale}
                disabled={items.length === 0}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                Complete Sale
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

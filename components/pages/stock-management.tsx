'use client'

import { useEffect, useState } from 'react'
import { User, db, Product, Stock } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StockManagementProps {
  user: User
}

export default function StockManagement({ user }: StockManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [activeTab, setActiveTab] = useState('single')
  const [selectedBrand, setSelectedBrand] = useState<string>('')

  // Form state - Single entry
  const [formData, setFormData] = useState({
    entryType: 'new', // Added option for new or existing model
    existingModel: '',
    brand: '',
    model: '',
    serialNumber: '',
    storeId: user.store || 'store1',
    purchaseBillNo: '',
  })

  const [bulkData, setBulkData] = useState('')
  const [bulkStoreId, setBulkStoreId] = useState(user.store || 'store1')

  useEffect(() => {
    setProducts(db.getProducts())
    setStock(db.getStock())
  }, [])

  const existingModels = [...new Set(products.map(p => `${p.brand} - ${p.model}`))].sort()

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault()
    
    let productBrand = formData.brand
    let productModel = formData.model

    if (formData.entryType === 'existing' && formData.existingModel) {
      const [brand, model] = formData.existingModel.split(' - ')
      productBrand = brand
      productModel = model
    }

    if (!productBrand || !productModel || !formData.serialNumber) {
      alert('Please fill all required fields')
      return
    }

    let product = products.find(p => p.brand === productBrand && p.model === productModel)
    if (!product) {
      product = db.addProduct(productBrand, productModel)
      setProducts([...products, product])
    }

    db.addStock(product.id, formData.serialNumber, formData.storeId, formData.purchaseBillNo)
    setStock(db.getStock())

    db.addActivityLog({
      type: 'stock_add',
      description: `Added stock: ${productBrand} ${productModel} (SN: ${formData.serialNumber})`,
      userId: user.id,
    })

    setFormData({ 
      entryType: 'new',
      existingModel: '',
      brand: '', 
      model: '', 
      serialNumber: '', 
      storeId: user.store || 'store1', 
      purchaseBillNo: '' 
    })
  }

  const handleBulkManualEntry = () => {
    if (!bulkData.trim()) {
      alert('Please enter data')
      return
    }

    const lines = bulkData.trim().split('\n').filter(line => line.trim())
    let addedCount = 0

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length < 3) return

      const [brand, model, serialNumber] = parts

      let product = products.find(p => p.brand === brand && p.model === model)
      if (!product) {
        product = db.addProduct(brand, model)
        setProducts(prev => [...prev, product])
      }

      db.addStock(product.id, serialNumber, bulkStoreId)
      addedCount++
    })

    if (addedCount > 0) {
      db.addActivityLog({
        type: 'stock_add',
        description: `Bulk added ${addedCount} items`,
        userId: user.id,
      })
      setStock(db.getStock())
      setBulkData('')
      alert(`Successfully added ${addedCount} items!`)
    }
  }

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        let addedCount = 0, skippedCount = 0

        lines.forEach((line, idx) => {
          if (idx === 0) return

          const parts = line.split(',').map(p => p.trim())
          if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
            skippedCount++
            return
          }

          const [brand, model, serialNumber] = parts

          let product = products.find(p => p.brand === brand && p.model === model)
          if (!product) {
            product = db.addProduct(brand, model)
            setProducts(prev => [...prev, product])
          }

          db.addStock(product.id, serialNumber, bulkStoreId)
          addedCount++
        })

        if (addedCount > 0) {
          db.addActivityLog({
            type: 'stock_add',
            description: `Excel imported ${addedCount} items`,
            userId: user.id,
          })
          setStock(db.getStock())
          alert(`Successfully added ${addedCount} items!${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}`)
        } else {
          alert('No valid items found in file')
        }
      } catch (error) {
        alert('Error processing file')
      }
    }
    reader.readAsText(file)
  }

  const stores = db.getStores()
  const brands = [...new Set(products.map(p => p.brand))].sort()
  const selectedBrandProducts = selectedBrand 
    ? products.filter(p => p.brand === selectedBrand)
    : []

  const filteredBrands = selectedBrand === '' 
    ? brands
    : brands.filter(b => b.includes(selectedBrand))

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Secura Web Stock Management System</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your inventory across all stores</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-primary/20">
          <TabsTrigger value="single">Single Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Manual</TabsTrigger>
          <TabsTrigger value="excel">Excel Import</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <div className="bg-gradient-to-br from-white to-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Add Stock Item</h2>
            
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    value="new" 
                    checked={formData.entryType === 'new'}
                    onChange={(e) => setFormData({...formData, entryType: 'new', existingModel: ''})}
                  />
                  <span className="text-sm font-medium">New Model</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    value="existing" 
                    checked={formData.entryType === 'existing'}
                    onChange={(e) => setFormData({...formData, entryType: 'existing', brand: '', model: ''})}
                  />
                  <span className="text-sm font-medium">Existing Model</span>
                </label>
              </div>

              {formData.entryType === 'new' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Brand *</label>
                    <Input
                      placeholder="e.g., Dell"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="border-primary/20 focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Model *</label>
                    <Input
                      placeholder="e.g., Inspiron 15"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="border-primary/20 focus:border-primary/50"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Select Model *</label>
                  <select
                    value={formData.existingModel}
                    onChange={(e) => setFormData({...formData, existingModel: e.target.value})}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg text-foreground bg-white focus:border-primary/50 outline-none"
                  >
                    <option value="">Choose existing model</option>
                    {existingModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Serial Number *</label>
                  <Input
                    placeholder="Enter serial number"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    className="border-primary/20 focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Purchase Bill No.</label>
                  <Input
                    placeholder="Optional"
                    value={formData.purchaseBillNo}
                    onChange={(e) => setFormData({...formData, purchaseBillNo: e.target.value})}
                    className="border-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Store</label>
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg text-foreground bg-white focus:border-primary/50 outline-none"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5">
                Add Stock
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <div className="bg-gradient-to-br from-white to-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Bulk Manual Entry</h2>
              <p className="text-sm text-muted-foreground">Format: Brand, Model, Serial Number (one per line)</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Store</label>
              <select
                value={bulkStoreId}
                onChange={(e) => setBulkStoreId(e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 rounded-lg text-foreground bg-white focus:border-primary/50 outline-none"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Enter Data (CSV Format)</label>
              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder="Dell,Inspiron 15,SN12345&#10;HP,Pavilion 14,SN67890&#10;Lenovo,ThinkPad X1,SN11111"
                className="w-full px-3 py-2 border border-primary/20 rounded-lg font-mono text-sm h-40 focus:border-primary/50 outline-none bg-white"
              />
            </div>

            <Button onClick={handleBulkManualEntry} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5">
              Add All Items
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="excel" className="space-y-4">
          <div className="bg-gradient-to-br from-white to-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Excel/CSV Import</h2>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Store</label>
              <select
                value={bulkStoreId}
                onChange={(e) => setBulkStoreId(e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 rounded-lg text-foreground bg-white focus:border-primary/50 outline-none"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center bg-primary/5">
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleExcelUpload} className="hidden" id="excel-upload" />
              <label htmlFor="excel-upload" className="cursor-pointer block">
                <Button type="button" onClick={() => document.getElementById('excel-upload')?.click()} className="bg-primary hover:bg-primary/90 text-white">
                  Choose File
                </Button>
                <p className="text-sm text-muted-foreground mt-3">or drag and drop</p>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-gradient-to-br from-white to-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Stock by Brand & Model</h2>
        <p className="text-sm text-muted-foreground">Click on a brand to expand models and view serial numbers</p>

        <div className="space-y-2">
          {filteredBrands.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No stock available</p>
          ) : (
            filteredBrands.map(brand => (
              <div key={brand} className="border border-primary/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                  className="w-full px-4 py-3 bg-primary/8 hover:bg-primary/15 font-medium text-left flex items-center justify-between transition-colors text-foreground"
                >
                  <span className="font-semibold">{brand}</span>
                  <span className="text-sm text-primary font-semibold">
                    {stock.filter(s => {
                      const p = products.find(pr => pr.id === s.productId)
                      return p?.brand === brand && s.status === 'available'
                    }).length} items
                  </span>
                </button>

                {selectedBrand === brand && (
                  <div className="p-4 bg-white space-y-3">
                    {[...new Set(selectedBrandProducts.map(p => p.model))].map(model => {
                      const modelStock = stock.filter(s => {
                        const p = products.find(pr => pr.id === s.productId)
                        return p?.brand === brand && p?.model === model && s.status === 'available'
                      })

                      return (
                        <div key={model} className="border border-primary/15 bg-primary/3 rounded-lg p-3 space-y-2">
                          <p className="font-semibold text-foreground text-sm">{model} <span className="text-primary">({modelStock.length})</span></p>
                          <div className="space-y-1 text-xs">
                            {modelStock.map(s => {
                              const st = stores.find(st => st.id === s.storeId)
                              return (
                                <div key={s.id} className="flex items-center justify-between text-muted-foreground">
                                  <span className="font-mono">SN: {s.serialNumber}</span>
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">{st?.name}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

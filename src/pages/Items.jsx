import { useState } from 'react'
import { getStorageData, addItem } from '../utils/storage'
import { Plus, Package } from 'lucide-react'

export default function Items() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'fixed',
    // Fixed item fields
    price: '',
    unit: '',
    // Loose item fields
    basePrice: '',
    baseUnit: 'liter',
  })
  const [refresh, setRefresh] = useState(0)
  const data = getStorageData()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.category === 'fixed') {
      addItem({
        name: formData.name,
        category: 'fixed',
        price: parseFloat(formData.price),
        unit: formData.unit
      })
    } else {
      // Loose item with default addons
      const addons = formData.baseUnit === 'liter' 
        ? [
            { label: '250ml', quantity: 0.25 },
            { label: '500ml', quantity: 0.5 },
            { label: '1L', quantity: 1 },
            { label: '2L', quantity: 2 },
          ]
        : [
            { label: '250g', quantity: 0.25 },
            { label: '500g', quantity: 0.5 },
            { label: '1kg', quantity: 1 },
          ]
      
      addItem({
        name: formData.name,
        category: 'loose',
        basePrice: parseFloat(formData.basePrice),
        baseUnit: formData.baseUnit,
        addons
      })
    }
    
    setFormData({ name: '', category: 'fixed', price: '', unit: '', basePrice: '', baseUnit: 'liter' })
    setShowForm(false)
    setRefresh(prev => prev + 1)
  }

  const fixedItems = data.items.filter(item => item.category === 'fixed')
  const looseItems = data.items.filter(item => item.category === 'loose')

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Items Inventory</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add New Item</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fixed">📦 Fixed (Packaged)</option>
              <option value="loose">⚖️ Loose (With Add-ons)</option>
            </select>
          </div>

          {formData.category === 'fixed' ? (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Unit (e.g., 500ml, 1kg)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Fixed Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.baseUnit}
                onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="liter">Per Liter (ml options)</option>
                <option value="kg">Per Kg (g options)</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Base Price (per unit)"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Save Item
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Fixed Items Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">📦 Fixed Items</h2>
            <span className="text-sm text-gray-500">({fixedItems.length})</span>
          </div>
          <div className="space-y-3">
            {fixedItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{item.unit}</span>
                  <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loose Items Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">⚖️ Loose Items</h2>
            <span className="text-sm text-gray-500">({looseItems.length})</span>
          </div>
          <div className="space-y-3">
            {looseItems.map((item) => (
              <div key={item.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={18} className="text-purple-600" />
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Base: <span className="font-semibold text-green-600">₹{item.basePrice}/{item.baseUnit}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.addons.map((addon, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-200 text-purple-700 text-xs rounded">
                      {addon.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { getStorageData, addItem, updateItem, deleteItem } from '../utils/storage'
import { Plus, Package, Edit2, Trash2 } from 'lucide-react'

export default function Items() {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'fixed',
    price: '',
    unit: '',
    basePrice: '',
    baseUnit: 'liter',
  })
  const [refresh, setRefresh] = useState(0)
  const data = getStorageData()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.category === 'fixed') {
      const itemData = {
        name: formData.name,
        category: 'fixed',
        price: parseFloat(formData.price),
        unit: formData.unit
      }
      
      if (editingItem) {
        updateItem(editingItem.id, itemData)
      } else {
        addItem(itemData)
      }
    } else {
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
      
      const itemData = {
        name: formData.name,
        category: 'loose',
        basePrice: parseFloat(formData.basePrice),
        baseUnit: formData.baseUnit,
        addons
      }
      
      if (editingItem) {
        updateItem(editingItem.id, itemData)
      } else {
        addItem(itemData)
      }
    }
    
    setFormData({ name: '', category: 'fixed', price: '', unit: '', basePrice: '', baseUnit: 'liter' })
    setEditingItem(null)
    setShowForm(false)
    setRefresh(prev => prev + 1)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    if (item.category === 'fixed') {
      setFormData({
        name: item.name,
        category: 'fixed',
        price: item.price,
        unit: item.unit,
        basePrice: '',
        baseUnit: 'liter'
      })
    } else {
      setFormData({
        name: item.name,
        category: 'loose',
        price: '',
        unit: '',
        basePrice: item.basePrice,
        baseUnit: item.baseUnit
      })
    }
    setShowForm(true)
  }

  const handleDelete = (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      deleteItem(itemId)
      setRefresh(prev => prev + 1)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({ name: '', category: 'fixed', price: '', unit: '', basePrice: '', baseUnit: 'liter' })
  }

  const fixedItems = data.items.filter(item => item.category === 'fixed')
  const looseItems = data.items.filter(item => item.category === 'loose')

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Items Inventory</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
              disabled={editingItem !== null}
            >
              <option value="fixed">📦 Fixed (Packaged)</option>
              <option value="loose">⚖️ Loose (With Add-ons)</option>
            </select>
          </div>

          {formData.category === 'fixed' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              {editingItem ? 'Update' : 'Save'} Item
            </button>
            {(showForm || editingItem) && (
              <button 
                type="button" 
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fixed Items Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800">📦 Fixed Items</h2>
            <span className="text-sm text-gray-500">({fixedItems.length})</span>
          </div>
          <div className="space-y-3">
            {fixedItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Package size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800">⚖️ Loose Items</h2>
            <span className="text-sm text-gray-500">({looseItems.length})</span>
          </div>
          <div className="space-y-3">
            {looseItems.map((item) => (
              <div key={item.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Package size={18} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStorageData, addCustomer, updateCustomer, deleteCustomer, clearCustomerDues } from '../utils/storage'
import { Plus, User, Phone, DollarSign, Edit2, Trash2 } from 'lucide-react'

export default function Customers() {
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [refresh, setRefresh] = useState(0)
  const data = getStorageData()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData)
      setEditingCustomer(null)
    } else {
      addCustomer(formData)
    }
    setFormData({ name: '', phone: '' })
    setShowForm(false)
    setRefresh(prev => prev + 1)
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({ name: customer.name, phone: customer.phone })
    setShowForm(true)
  }

  const handleDelete = (customerId, customerName) => {
    if (window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      const result = deleteCustomer(customerId)
      if (!result.success) {
        alert(result.message)
      } else {
        setRefresh(prev => prev + 1)
      }
    }
  }

  const handleClearDues = (customerId, customerName) => {
    if (window.confirm(`Clear all dues for ${customerName}?`)) {
      clearCustomerDues(customerId)
      setRefresh(prev => prev + 1)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCustomer(null)
    setFormData({ name: '', phone: '' })
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Customers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              {editingCustomer ? 'Update' : 'Save'} Customer
            </button>
            {(showForm || editingCustomer) && (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{customer.name}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(customer)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit Customer"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(customer.id, customer.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete Customer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Phone size={16} />
              <span>{customer.phone}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 mb-3">
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-lg font-bold text-red-600">₹{customer.outstanding.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/purchase/${customer.id}`)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                New Sale
              </button>
              {customer.outstanding > 0 && (
                <button
                  onClick={() => handleClearDues(customer.id, customer.name)}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                  title="Clear Dues"
                >
                  <DollarSign size={16} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
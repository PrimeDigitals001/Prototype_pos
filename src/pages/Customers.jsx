import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStorageData, addCustomer, clearCustomerDues } from '../utils/storage'
import { Plus, User, Phone, DollarSign } from 'lucide-react'

export default function Customers() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [refresh, setRefresh] = useState(0)
  const data = getStorageData()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    addCustomer(formData)
    setFormData({ name: '', phone: '' })
    setShowForm(false)
    setRefresh(prev => prev + 1)
  }

  const handleClearDues = (customerId, customerName) => {
    if (window.confirm(`Clear all dues for ${customerName}?`)) {
      clearCustomerDues(customerId)
      setRefresh(prev => prev + 1)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <div className="grid grid-cols-2 gap-4">
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
          <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Save Customer
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">{customer.name}</h3>
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
                  Clear
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
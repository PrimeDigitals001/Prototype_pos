import { useState, useEffect } from 'react'
import { getStorageData, updateInvoice, toggleInvoicePayment } from '../utils/storage'
import { FileText, Send, Eye, X, Edit2, Check } from 'lucide-react'

export default function InvoiceHistory() {
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [filterCustomer, setFilterCustomer] = useState('')
  const [refresh, setRefresh] = useState(0)
  
  const data = getStorageData()

  const filteredInvoices = data.invoices.filter(inv => 
    !filterCustomer || inv.customerId === filterCustomer
  ).sort((a, b) => new Date(b.date) - new Date(a.date))

  const getCustomerName = (customerId) => {
    const customer = data.customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown'
  }

  const handleSendInvoice = (invoice) => {
    alert(`Invoice #${invoice.id.slice(-6)} sent to ${getCustomerName(invoice.customerId)} via WhatsApp!`)
  }

  const handleTogglePayment = (invoice) => {
    toggleInvoicePayment(invoice.id)
    setRefresh(prev => prev + 1) // Force re-render
    if (selectedInvoice && selectedInvoice.id === invoice.id) {
      setSelectedInvoice(null) // Close modal to show updated data
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Invoice History</h1>
        <select
          value={filterCustomer}
          onChange={(e) => setFilterCustomer(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Customers</option>
          {data.customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No invoices found</p>
        </div>
      ) : (
        // Add horizontal scroll for table on mobile
<div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
  <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">#{invoice.id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getCustomerName(invoice.customerId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(invoice.date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.items.length} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{invoice.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePayment(invoice)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.paid
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {invoice.paid ? '✓ Paid' : 'Unpaid'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleSendInvoice(invoice)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Send via WhatsApp"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Invoice Details</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Invoice ID</p>
                  <p className="font-semibold text-gray-800">#{selectedInvoice.id.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">{formatDate(selectedInvoice.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-800">{getCustomerName(selectedInvoice.customerId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedInvoice.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedInvoice.paid ? '✓ Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-semibold text-gray-800">₹{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                  <span>Total Amount</span>
                  <span>₹{selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleSendInvoice(selectedInvoice)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  <Send size={20} />
                  Send via WhatsApp
                </button>
                <button
                  onClick={() => handleTogglePayment(selectedInvoice)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold ${
                    selectedInvoice.paid
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Check size={20} />
                  Mark as {selectedInvoice.paid ? 'Unpaid' : 'Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
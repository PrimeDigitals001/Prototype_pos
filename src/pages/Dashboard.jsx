import { useState } from 'react'
import { getStorageData } from '../utils/storage'
import { Users, Package, IndianRupee, ShoppingCart } from 'lucide-react'

export default function Dashboard() {
  const [period, setPeriod] = useState('daily')
  const data = getStorageData()

  const getStats = () => {
    const now = new Date()
    const invoices = data.invoices.filter(inv => {
      const invDate = new Date(inv.date)
      if (period === 'daily') {
        return invDate.toDateString() === now.toDateString()
      } else {
        return invDate.getMonth() === now.getMonth() && 
               invDate.getFullYear() === now.getFullYear()
      }
    })

    const totalCollection = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const itemsSold = invoices.reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.quantity, 0), 0)
    const uniqueCustomers = new Set(invoices.map(inv => inv.customerId)).size

    return { totalCollection, itemsSold, uniqueCustomers, invoicesCount: invoices.length }
  }

  const stats = getStats()

  const cards = [
    { title: 'Total Collection', value: `₹${stats.totalCollection}`, icon: IndianRupee, color: 'bg-green-50 text-green-600' },
    { title: 'Customers', value: stats.uniqueCustomers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Items Sold', value: stats.itemsSold, icon: Package, color: 'bg-purple-50 text-purple-600' },
    { title: 'Invoices', value: stats.invoicesCount, icon: ShoppingCart, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => setPeriod('daily')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-medium transition-colors ${
              period === 'daily' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-medium transition-colors ${
              period === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 lg:mt-8 bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">
          {period === 'daily' ? 'Today\'s' : 'This Month\'s'} Overview
        </h2>
        <p className="text-gray-500 text-sm lg:text-base">
          {stats.invoicesCount > 0 
            ? `You have processed ${stats.invoicesCount} invoices ${period === 'daily' ? 'today' : 'this month'}.`
            : `No sales ${period === 'daily' ? 'today' : 'this month'} yet.`
          }
        </p>
      </div>
    </div>
  )
}
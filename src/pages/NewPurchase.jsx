import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStorageData, addInvoice } from '../utils/storage'
import { Plus, Trash2, ShoppingCart, X } from 'lucide-react'

export default function NewPurchase() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const data = getStorageData()
  
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || '')
  const [cart, setCart] = useState([])
  const [showItems, setShowItems] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('fixed') // 'fixed' or 'loose'
  const [paymentStatus, setPaymentStatus] = useState('unpaid')

  useEffect(() => {
    if (customerId) {
      setSelectedCustomer(customerId)
    }
  }, [customerId])

  // Add fixed item to cart
  const addFixedItem = (item) => {
    const existing = cart.find(c => c.id === item.id)
    
    if (existing) {
      setCart(cart.map(c => 
        c.id === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, { 
        id: item.id,
        name: item.name,
        category: 'fixed',
        price: item.price,
        unit: item.unit,
        quantity: 1 
      }])
    }
    setShowItems(false)
  }

  // Add loose item with addon
  const addLooseItemAddon = (item, addon) => {
    const priceForQuantity = item.basePrice * addon.quantity
    
    // Create unique cart entry for each addon click
    const cartItem = {
      id: `${item.id}-${Date.now()}`, // Unique ID for each addition
      parentId: item.id,
      name: `${item.name} (${addon.label})`,
      category: 'loose',
      basePrice: item.basePrice,
      baseUnit: item.baseUnit,
      quantity: addon.quantity,
      price: priceForQuantity,
      addonLabel: addon.label
    }
    
    setCart([...cart, cartItem])
  }

  // Add loose item with manual quantity
  const addLooseItemManual = (item) => {
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      parentId: item.id,
      name: item.name,
      category: 'loose',
      basePrice: item.basePrice,
      baseUnit: item.baseUnit,
      quantity: 0,
      price: 0,
      isManual: true
    }
    
    setCart([...cart, cartItem])
  }

  const updateQuantity = (cartItemId, quantity) => {
    const value = parseFloat(quantity)
    
    if (isNaN(value) || value <= 0) {
      setCart(cart.filter(c => c.id !== cartItemId))
    } else {
      setCart(cart.map(c => {
        if (c.id === cartItemId) {
          if (c.category === 'loose' && c.isManual) {
            return { ...c, quantity: value, price: c.basePrice * value }
          } else if (c.category === 'fixed') {
            return { ...c, quantity: value }
          }
        }
        return c
      }))
    }
  }

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(c => c.id !== cartItemId))
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      if (item.category === 'fixed') {
        return sum + (item.price * item.quantity)
      } else {
        return sum + item.price
      }
    }, 0).toFixed(2)
  }

  const handleCheckout = () => {
    if (!selectedCustomer || cart.length === 0) {
      alert('Please select customer and add items')
      return
    }

    const hasZeroQuantity = cart.some(item => 
      (item.category === 'loose' && item.isManual && item.quantity <= 0)
    )
    
    if (hasZeroQuantity) {
      alert('Please enter quantity for manual items')
      return
    }

    const invoice = {
      customerId: selectedCustomer,
      items: cart.map(item => ({
        id: item.parentId || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.category === 'fixed' ? item.price : item.basePrice,
        total: item.category === 'fixed' ? item.price * item.quantity : item.price
      })),
      total: parseFloat(getTotal()),
      paid: paymentStatus === 'paid',
    }

    addInvoice(invoice)
    alert('Invoice created successfully!')
    setCart([])
    navigate('/history')
  }

  const customer = data.customers.find(c => c.id === selectedCustomer)
  const fixedItems = data.items.filter(i => i.category === 'fixed')
  const looseItems = data.items.filter(i => i.category === 'loose')

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">New Purchase</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Customer & Items */}
        <div className="col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a customer...</option>
              {data.customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
              ))}
            </select>
            {customer && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Outstanding: <span className="font-semibold text-red-600">₹{customer.outstanding.toFixed(2)}</span></p>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Cart Items</h2>
              <button
                onClick={() => setShowItems(!showItems)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>

            {/* Item Selection Modal */}
            {showItems && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-[500px] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Select Item</h3>
                  <button onClick={() => setShowItems(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setSelectedCategory('fixed')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      selectedCategory === 'fixed'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    📦 Fixed
                  </button>
                  <button
                    onClick={() => setSelectedCategory('loose')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      selectedCategory === 'loose'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ⚖️ Loose
                  </button>
                </div>

                {/* Fixed Items */}
                {selectedCategory === 'fixed' && (
                  <div className="grid grid-cols-2 gap-2">
                    {fixedItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => addFixedItem(item)}
                        className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.unit}</p>
                        <p className="text-sm font-semibold text-green-600">₹{item.price}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Loose Items with Addons */}
                {selectedCategory === 'loose' && (
                  <div className="space-y-4">
                    {looseItems.map(item => (
                      <div key={item.id} className="p-4 bg-white rounded-lg border border-purple-200">
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500">₹{item.basePrice} per {item.baseUnit}</p>
                        </div>

                        {/* Addon Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {item.addons.map((addon, idx) => (
                            <button
                              key={idx}
                              onClick={() => addLooseItemAddon(item, addon)}
                              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-sm"
                            >
                              + {addon.label}
                            </button>
                          ))}
                        </div>

                        {/* Manual Entry Button */}
                        <button
                          onClick={() => addLooseItemManual(item)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                        >
                          📝 Custom Quantity
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cart List */}
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                <p>Cart is empty. Add items to continue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className={`flex items-center gap-4 p-4 rounded-lg ${
                    item.category === 'loose' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.category === 'fixed' 
                          ? `₹${item.price} / ${item.unit}` 
                          : `₹${item.basePrice} / ${item.baseUnit}`
                        }
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Quantity Input - Only for fixed items and manual loose items */}
                      {(item.category === 'fixed' || item.isManual) && (
                        <div className="flex flex-col items-end">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={item.quantity || ''}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            className={`w-24 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                              item.quantity <= 0 
                                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {item.category === 'fixed' ? 'qty' : item.baseUnit}
                          </span>
                        </div>
                      )}

                      {/* Display quantity for preset addons */}
                      {item.category === 'loose' && !item.isManual && (
                        <div className="text-center px-3">
                          <div className="font-medium text-gray-700">{item.quantity}</div>
                          <div className="text-xs text-gray-500">{item.baseUnit}</div>
                        </div>
                      )}

                      {/* Price */}
                      <span className="font-semibold text-gray-800 w-24 text-right">
                        ₹{item.category === 'fixed' 
                          ? (item.price * item.quantity).toFixed(2)
                          : item.price.toFixed(2)
                        }
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{getTotal()}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentStatus('paid')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    paymentStatus === 'paid'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setPaymentStatus('unpaid')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    paymentStatus === 'unpaid'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Credit
                </button>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!selectedCustomer || cart.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Complete Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
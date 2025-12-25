// Initialize dummy data
const INITIAL_DATA = {
  customers: [
    { id: '1', name: 'Rajesh Kumar', phone: '9876543210', outstanding: 0 },
    { id: '2', name: 'Priya Sharma', phone: '9876543211', outstanding: 0 },
  ],
  items: [
    // Fixed Items - Complete packages
    { id: '1', name: 'Amul Milk 500ml', category: 'fixed', price: 28, unit: '500ml' },
    { id: '2', name: 'Amul Butter 100g', category: 'fixed', price: 52, unit: '100g' },
    { id: '3', name: 'Amul Cheese 200g', category: 'fixed', price: 120, unit: '200g' },
    
    // Loose Items - Base price per unit with add-on options
    { 
      id: '4', 
      name: 'Loose Milk', 
      category: 'loose', 
      basePrice: 60, 
      baseUnit: 'liter',
      addons: [
        { label: '250ml', quantity: 0.25 },
        { label: '500ml', quantity: 0.5 },
        { label: '1L', quantity: 1 },
        { label: '2L', quantity: 2 },
      ]
    },
    { 
      id: '5', 
      name: 'Paneer', 
      category: 'loose', 
      basePrice: 320, 
      baseUnit: 'kg',
      addons: [
        { label: '250g', quantity: 0.25 },
        { label: '500g', quantity: 0.5 },
        { label: '1kg', quantity: 1 },
      ]
    },
  ],
  invoices: [],
}
export const getStorageData = () => {
  const data = localStorage.getItem('posData')
  if (!data) {
    localStorage.setItem('posData', JSON.stringify(INITIAL_DATA))
    return INITIAL_DATA
  }
  return JSON.parse(data)
}

export const setStorageData = (data) => {
  localStorage.setItem('posData', JSON.stringify(data))
}

export const addCustomer = (customer) => {
  const data = getStorageData()
  data.customers.push({ ...customer, id: Date.now().toString(), outstanding: 0 })
  setStorageData(data)
}

export const addItem = (item) => {
  const data = getStorageData()
  data.items.push({ ...item, id: Date.now().toString() })
  setStorageData(data)
}

export const addInvoice = (invoice) => {
  const data = getStorageData()
  const newInvoice = {
    ...invoice,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  }
  data.invoices.push(newInvoice)
  
  // Update customer outstanding if not paid
  if (!invoice.paid) {
    const customerIndex = data.customers.findIndex(c => c.id === invoice.customerId)
    if (customerIndex !== -1) {
      data.customers[customerIndex].outstanding += invoice.total
    }
  }
  
  setStorageData(data)
  return newInvoice
}

export const updateInvoice = (invoiceId, updates) => {
  const data = getStorageData()
  const invoiceIndex = data.invoices.findIndex(inv => inv.id === invoiceId)
  if (invoiceIndex !== -1) {
    data.invoices[invoiceIndex] = { ...data.invoices[invoiceIndex], ...updates }
    setStorageData(data)
  }
}

export const toggleInvoicePayment = (invoiceId) => {
  const data = getStorageData()
  const invoice = data.invoices.find(inv => inv.id === invoiceId)
  
  if (!invoice) return
  
  const customerIndex = data.customers.findIndex(c => c.id === invoice.customerId)
  if (customerIndex === -1) return
  
  // Toggle payment status
  const newPaidStatus = !invoice.paid
  
  // Update customer outstanding
  if (newPaidStatus) {
    // Changing from unpaid to paid - decrease outstanding
    data.customers[customerIndex].outstanding -= invoice.total
  } else {
    // Changing from paid to unpaid - increase outstanding
    data.customers[customerIndex].outstanding += invoice.total
  }
  
  // Update invoice
  invoice.paid = newPaidStatus
  
  // Save everything
  setStorageData(data)
}

export const clearCustomerDues = (customerId) => {
  const data = getStorageData()
  const customerIndex = data.customers.findIndex(c => c.id === customerId)
  if (customerIndex !== -1) {
    data.customers[customerIndex].outstanding = 0
    setStorageData(data)
  }
}
export const updateCustomer = (customerId, updates) => {
  const data = getStorageData()
  const index = data.customers.findIndex(c => c.id === customerId)
  if (index !== -1) {
    data.customers[index] = { ...data.customers[index], ...updates }
    setStorageData(data)
  }
}

export const deleteCustomer = (customerId) => {
  const data = getStorageData()
  // Check if customer has any invoices
  const hasInvoices = data.invoices.some(inv => inv.customerId === customerId)
  if (hasInvoices) {
    return { success: false, message: 'Cannot delete customer with existing invoices' }
  }
  data.customers = data.customers.filter(c => c.id !== customerId)
  setStorageData(data)
  return { success: true }
}

export const updateItem = (itemId, updates) => {
  const data = getStorageData()
  const index = data.items.findIndex(i => i.id === itemId)
  if (index !== -1) {
    data.items[index] = { ...data.items[index], ...updates }
    setStorageData(data)
  }
}

export const deleteItem = (itemId) => {
  const data = getStorageData()
  data.items = data.items.filter(i => i.id !== itemId)
  setStorageData(data)
}
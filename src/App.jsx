import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Items from './pages/Items'
import NewPurchase from './pages/NewPurchase'
import InvoiceHistory from './pages/InvoiceHistory'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="items" element={<Items />} />
          <Route path="purchase/:customerId?" element={<NewPurchase />} />
          <Route path="history" element={<InvoiceHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
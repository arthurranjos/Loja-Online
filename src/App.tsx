import { useState } from 'react'
import AuthPage from './features/auth/AuthPage'
import CatalogPage from './features/catalog/CatalogPage'
import './App.css'

function App() {
  const [page, setPage] = useState<'catalog' | 'account'>('catalog')
  return page === 'catalog'
    ? <CatalogPage onAccount={() => setPage('account')} />
    : <AuthPage />
}

export default App

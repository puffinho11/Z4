import React, { useEffect, useState } from 'react'
import LoginModal from './components/LoginModal'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Registro from './components/Registro'
import Relatorio from './components/Relatorio'
import Desempenho from './components/Desempenho'
import Exames from './components/Exames'
import Calendario from './components/Calendario'
import Chamada from './components/Chamada'
import Admin from './components/Admin'
import PerfilAtleta from './components/PerfilAtleta'
import { getUser, clearAuth } from './utils/authStorage'
import normalizeUser from './utils/normalizeUser'
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState('dashboard')
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const curr = normalizeUser(getUser())
    setUser(curr)
    setLoading(false)
  }, [])

  function handleLogin(u) {
    const normalizedUser = normalizeUser(u)
    setUser(normalizedUser)
  }

  function handleLogout() {
    clearAuth()
    setUser(null)
  }

  if (loading) return null

  if (!user) return <LoginModal onLogin={handleLogin} />

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <Dashboard />
      case 'registro': return <Registro selectedCategoria={selectedCategoria} />
      case 'relatorio': return <Relatorio />
      case 'desempenho': return <Desempenho />
      case 'exames': return <Exames />
      case 'calendario': return <Calendario />
      case 'chamada': return <Chamada />
      case 'admin': return <Admin />
      case 'perfil': return <PerfilAtleta user={user} setUser={setUser} />
      default: return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        setSection={setSection}
        selectedCategoria={selectedCategoria}
        setSelectedCategoria={setSelectedCategoria}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          transition-all duration-300 px-4 py-6
          ${collapsed ? "md:ml-16" : "md:ml-64"}
        `}
      >
        {renderSection()}
      </main>

      <Analytics />
    </div>
  )
}





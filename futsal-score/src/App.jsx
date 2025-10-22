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

const sections = {
  dashboard: <Dashboard />,
  registro: (onSectionChange) => <Registro onSectionChange={onSectionChange} />,
  relatorio: <Relatorio />,
  desempenho: <Desempenho />,
  exames: <Exames />,
  calendario: <Calendario />,
  chamada: <Chamada />,
  admin: <Admin />,
  perfil: (user, setUser) => <PerfilAtleta user={user} setUser={setUser} />
}


export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState('dashboard')

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
    setSection('dashboard')
  }

  if (loading) return null

  if (!user) {
    return <LoginModal onLogin={handleLogin} />
  }

  const renderSection = () => {
    const SectionComponent = sections[section]

    if (section === 'registro') {
      return SectionComponent(setSection)
    }
    if (section === 'perfil') {
      return SectionComponent(user, setUser)
    }
    
    return SectionComponent
  }


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar user={user} onLogout={handleLogout} setSection={setSection} />
      <main className="ml-56 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {renderSection()}
      </main>
    </div>
  )
}



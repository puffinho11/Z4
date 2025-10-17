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
import { getCurrentUser, setCurrentUser, logoutUser } from './utils/authStorage'
import './index.css'

export default function App(){
  const [user, setUser] = useState(getCurrentUser())
  const [section, setSection] = useState('dashboard')

  useEffect(()=> {
    const curr = getCurrentUser()
    setUser(curr)
  },[])

  function handleLogin(u){
    setCurrentUser(u)
    setUser(u)
  }
  function handleLogout(){
    logoutUser()
    setUser(null)
  }

  if(!user){
    return <LoginModal onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar user={user} onLogout={handleLogout} setSection={setSection} />
      <main className="ml-56 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {section === 'dashboard' && <Dashboard /> }
        {section === 'registro' && <Registro onSectionChange={setSection} /> }
        {section === 'relatorio' && <Relatorio /> }
        {section === 'desempenho' && <Desempenho /> }
        {section === 'exames' && <Exames /> }
        {section === 'calendario' && <Calendario /> }
        {section === 'chamada' && <Chamada />}
        {user?.role === 'admin' && section === 'admin' && <Admin /> }
      </main>
    </div>
  )
}
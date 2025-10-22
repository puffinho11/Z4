import React from "react"
import { 
  MdDashboard, 
  MdEvent, 
  MdGroup, 
  MdOutlineAnalytics, 
  MdFitnessCenter, 
  MdAssignment, 
  MdLocalHospital, 
  MdAdminPanelSettings, 
  MdAccountCircle 
} from 'react-icons/md';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar({ user, onLogout, setSection }) {
  const menuItems = [
    { label: "Dashboard", icon: <MdDashboard />, section: "dashboard" },
    { label: "Registro", icon: <MdGroup />, section: "registro" },
    { label: "Relatórios", icon: <MdOutlineAnalytics />, section: "relatorio" },
    { label: "Desempenho", icon: <MdFitnessCenter />, section: "desempenho" },
    { label: "Exames", icon: <MdLocalHospital />, section: "exames" },
    { label: "Calendário", icon: <MdEvent />, section: "calendario" },
    { label: "Chamada", icon: <MdAssignment />, section: "chamada" },
    { label: "Meu Perfil", icon: <MdAccountCircle />, section: "perfil" }, 
  ]

  if (user?.role === "admin") {
    menuItems.push({
      label: "Administração",
      icon: <MdAdminPanelSettings />,
      section: "admin",
    })
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-2xl flex flex-col justify-between z-50">
      <div>
        <div className="p-6 border-b border-blue-600 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight"> Futsal Score</h1>
        </div>
        <nav className="flex flex-col mt-6 space-y-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.section}
              onClick={() => setSection(item.section)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                item.section === user?.section 
                  ? "bg-blue-600 font-bold"
                  : "hover:bg-blue-800"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="p-5 border-t border-blue-600">
        <div className="text-xs text-gray-300 mb-3">
          <p className="font-semibold">{user?.username || 'Carregando...'}</p>
          <p className="text-gray-400">({user?.role || 'Visitante'})</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <FaSignOutAlt />
          Sair
        </button>
      </div>
    </aside>
  )
}




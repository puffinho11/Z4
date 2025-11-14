import React, { useState } from "react"
import {
  MdDashboard,
  MdEvent,
  MdGroup,
  MdOutlineAnalytics,
  MdFitnessCenter,
  MdAssignment,
  MdLocalHospital,
  MdAdminPanelSettings,
  MdAccountCircle,
  MdKeyboardArrowDown,
} from "react-icons/md"
import { FaSignOutAlt } from "react-icons/fa"
import LogoFutsalScore from "./logo.png"

export default function Sidebar({
  user,
  onLogout,
  setSection,
  selectedCategoria,
  setSelectedCategoria,
}) {
  const [openRegistro, setOpenRegistro] = useState(false)

  const categorias = [
    "Sub-7",
    "Sub-9",
    "Sub-11",
    "Sub-13",
    "Sub-15",
    "Sub-17",
    "Sub-20",
    "Adulto",
  ]

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
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 text-white shadow-[5px_0_15px_rgba(0,0,0,0.4)] flex flex-col justify-between z-50">
      <div>
        <div className="p-6 border-b border-emerald-700 text-center bg-gradient-to-b from-emerald-800/40 to-transparent backdrop-blur-sm">
          <img
            src={LogoFutsalScore}
            alt="Futsal Score Logo"
            className="mx-auto max-h-20 w-auto drop-shadow-lg transition-transform duration-500 hover:scale-110"
          />
        </div>
        <nav className="flex flex-col mt-6 space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = item.section === user?.section
            const isRegistro = item.section === "registro"

            return (
              <div key={item.section}>
                <button
                  onClick={() => {
                    if (isRegistro) setOpenRegistro(!openRegistro)
                    setSection(item.section)
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-900/40 scale-[1.02]"
                        : "hover:bg-emerald-700/60 hover:translate-x-1"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`text-xl ${
                        isActive
                          ? "text-white scale-110"
                          : "text-emerald-100 group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  {isRegistro && (
                    <MdKeyboardArrowDown
                      className={`text-xl transition-transform ${
                        openRegistro ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                {isRegistro && openRegistro && (
                  <ul className="ml-8 mt-1 space-y-1 animate-fade-in-down">
                    {categorias.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => {
                            setSelectedCategoria(cat)
                            setSection("registro")
                          }}
                          className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition ${
                            selectedCategoria === cat
                              ? "bg-emerald-500/40 text-white"
                              : "hover:bg-emerald-700/60 text-emerald-100"
                          }`}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>
      </div>
      <div className="p-5 border-t border-emerald-800 bg-gradient-to-t from-emerald-900/40 to-transparent backdrop-blur-sm">
        <div className="text-xs text-gray-200 mb-3">
          <p className="font-semibold">{user?.username || "Carregando..."}</p>
          <p className="text-gray-400">({user?.role || "Visitante"})</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-700 rounded-lg hover:from-rose-500 hover:to-red-600 transition-all shadow-md shadow-red-900/40 hover:scale-105 font-medium text-sm"
        >
          <FaSignOutAlt /> Sair
        </button>
      </div>
    </aside>
  )
}









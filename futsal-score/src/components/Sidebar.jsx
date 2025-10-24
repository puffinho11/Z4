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
  MdAccountCircle,
} from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa"
import LogoFutsalScore from "./logo.png"

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
  ];

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
            const isActive = item.section === user?.section;
            return (
              <button
                key={item.section}
                onClick={() => setSection(item.section)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative
                  ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-900/40 scale-[1.02]"
                      : "hover:bg-emerald-700/60 hover:translate-x-1"
                  }`}
              >
                <span
                  className={`text-xl transition-transform duration-300 ${
                    isActive
                      ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110"
                      : "text-emerald-100 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`${
                    isActive
                      ? "font-semibold text-white"
                      : "text-emerald-100 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
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
          <FaSignOutAlt />
          Sair
        </button>
      </div>
    </aside>
  )
}







import React, { useState } from "react";
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
  MdMenu,
  MdClose,
  MdChevronLeft,
  MdChevronRight
} from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import LogoFutsalScore from "./logo.png";

export default function Sidebar({
  user,
  onLogout,
  setSection,
  selectedCategoria,
  setSelectedCategoria,
  isOpen,
  setIsOpen,
  collapsed,
  setCollapsed,
}) {
  const [openRegistro, setOpenRegistro] = useState(false);

  const categorias = [
    "Sub-7",
    "Sub-9",
    "Sub-11",
    "Sub-13",
    "Sub-15",
    "Sub-17",
    "Sub-20",
    "Adulto",
  ];

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
    });
  }

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-emerald-600 text-white shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MdMenu size={28} />
      </button>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b 
          from-emerald-600 via-emerald-700 to-emerald-900 
          text-white shadow-xl flex flex-col justify-between z-50 
          transform transition-all duration-300

          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}

          ${collapsed ? "md:w-16" : "md:w-64"}
          w-64
        `}
      >
        <div>
          <div className="p-6 border-b border-emerald-700 flex justify-center">
            {!collapsed && (
              <img src={LogoFutsalScore} alt="logo" className="max-h-20" />
            )}
            {collapsed && (
              <img src={LogoFutsalScore} alt="logo" className="max-h-10" />
            )}
          </div>
          <button
            className="md:hidden absolute top-4 right-4 text-white"
            onClick={() => setIsOpen(false)}
          >
            <MdClose size={28} />
          </button>

          {/* LISTA */}
          <nav className="mt-6 px-2 space-y-1">
            {menuItems.map((item) => {
              const isRegistro = item.section === "registro";

              return (
                <div key={item.section}>
                  <button
                    onClick={() => {
                      if (isRegistro) setOpenRegistro(!openRegistro);
                      setSection(item.section);
                      setIsOpen(false); // mobile fecha
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-emerald-700/60 transition"
                  >
                    <span className="text-xl">{item.icon}</span>

                    {!collapsed && <span>{item.label}</span>}

                    {!collapsed && isRegistro && (
                      <MdKeyboardArrowDown
                        className={`ml-auto transition ${
                          openRegistro ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  {isRegistro && openRegistro && !collapsed && (
                    <ul className="ml-10 space-y-1">
                      {categorias.map((cat) => (
                        <li key={cat}>
                          <button
                            onClick={() => {
                              setSelectedCategoria(cat);
                              setSection("registro");
                              setIsOpen(false);
                            }}
                            className="block w-full text-left text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700/60"
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {!collapsed && (
            <div className="text-sm opacity-80 px-2">
              {user?.username} ({user?.role})
            </div>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            <FaSignOutAlt />
            {!collapsed && <span>Sair</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 transition"
          >
            {collapsed ? <MdChevronRight size={22} /> : <MdChevronLeft size={22} />}
          </button>
        </div>
      </aside>
    </>
  )
}


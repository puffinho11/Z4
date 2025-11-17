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
  MdClose
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
      {/* BOTÃO HAMBÚRGUER (MOBILE) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-emerald-600 text-white shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MdMenu size={28} />
      </button>

      {/* OVERLAY ESCURO AO ABRIR */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        ></div>
      )}

      {/* SIDEBAR MOBILE + DESKTOP */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b 
          from-emerald-600 via-emerald-700 to-emerald-900 
          text-white shadow-xl flex flex-col justify-between z-50 
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div>
          <div className="p-6 border-b border-emerald-700 text-center bg-gradient-to-b from-emerald-800/40 to-transparent">
            <img
              src={LogoFutsalScore}
              alt="Futsal Score Logo"
              className="mx-auto max-h-20 drop-shadow-lg"
            />
          </div>

          {/* BOTÃO FECHAR NO MOBILE */}
          <button
            className="md:hidden absolute top-4 right-4 text-white"
            onClick={() => setIsOpen(false)}
          >
            <MdClose size={28} />
          </button>

          <nav className="flex flex-col mt-6 space-y-1 px-3">
            {menuItems.map((item) => {
              const isRegistro = item.section === "registro";

              return (
                <div key={item.section}>
                  <button
                    onClick={() => {
                      if (isRegistro) setOpenRegistro(!openRegistro);
                      setSection(item.section);
                      setIsOpen(false); // fecha no mobile
                    }}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg
                      hover:bg-emerald-700/60 transition"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      {item.label}
                    </span>
                    {isRegistro && (
                      <MdKeyboardArrowDown
                        className={`text-xl transition ${openRegistro ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {isRegistro && openRegistro && (
                    <ul className="ml-8 mt-1 space-y-1">
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

        <button
          onClick={onLogout}
          className="flex items-center gap-3 p-4 text-left hover:bg-emerald-700/40 transition"
        >
          <FaSignOutAlt /> Sair
        </button>
      </aside>
    </>
  );
}

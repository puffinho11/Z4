import React from "react"

export default function Sidebar({ user, onLogout, setSection }) {

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white shadow-lg flex flex-col justify-between z-40">
      <div>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600 text-center">
            Futsal Score
          </h1>
        </div>
        <nav className="flex flex-col mt-4 space-y-1 px-2">
          <button
            onClick={() => setSection("dashboard")}
            className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
          >
            Dashboard
          </button>
          <button
            onClick={() => setSection("registro")}
            className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
          >
            Registrar
          </button>
          <button
            onClick={() => setSection("relatorio")}
            className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
          >
            Relatórios
          </button>
          <button
            onClick={() => setSection("desempenho")}
            className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
          >
            Desempenho
          </button>
          <button
            onClick={() => setSection("exames")}
            className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
          >
            Exames
          </button>
          <button
            onClick={() => setSection("calendario")}
            className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
          >
            Calendário
          </button>
          {user?.role === "admin" && (
          <button
          onClick={() => setSection("admin")}
          className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
         >
            Administração
          </button>
          )}
        </nav>
      </div>

      <div className="p-4 border-t">
        <p className="text-sm font-medium mb-2 text-gray-800">
            Usuário: <span className="font-semibold text-blue-600">{user?.username}</span>
            <span className="text-xs text-gray-500 block">({user?.role})</span>
        </p>
        <button
          onClick={onLogout}
          className="w-full text-sm bg-red-500 text-white py-1 rounded-lg hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}


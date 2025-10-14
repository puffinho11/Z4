import React, { useState } from "react"
import { setCurrentUser, AUTH_KEY } from "../utils/storage"
import api from "../api"

export default function LoginModal({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/users/login", { username, password })
      
      const { token, user } = response.data

      const authData = { username: user.username, role: user.role, token }

      setCurrentUser(authData)
      onLogin(authData)

    } catch (err) {
      console.error("Erro de login:", err.response || err)
      const msg = err.response?.data?.msg || "Usuário ou senha inválidos. Verifique a conexão com a API."
      setError(msg);

    } finally {
      setLoading(false)
    }
  }
  function createAdminIfNone() {
    setError(
      "O cadastro de novos usuários é gerenciado pela tela de Administração (Admin). Peça ao administrador para criar sua conta."
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-2">Entrar — Futsal Score</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <button 
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}

        <div className="mt-4 text-sm text-center">
          <p className="text-gray-600 mb-2">
            Não consegue entrar?
          </p>
          <button
            onClick={createAdminIfNone}
            className="text-blue-600 hover:underline"
          >
            Informar sobre cadastro
          </button>
        </div>
      </div>
    </div>
  );
}


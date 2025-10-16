import React, { useState } from "react"
import { setCurrentUser } from "../utils/authStorage"
import api from "../api"

export default function LoginModal({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/users/login", {
        username,
        password
      })

      const { token, user: userData } = response.data

      const userToSave = {
          ...userData,
          token
      }

      setCurrentUser(userToSave)

      onLogin(userToSave)

    } catch (err) {
      console.error("Erro no login:", err.response || err)
      if (err.response && err.response.status === 400) {
        setError("Usuário ou senha inválidos. Tente novamente.")
      } else {
        setError("Erro ao conectar ao servidor. Verifique o console ou se o servidor está rodando.")
      }
    } finally {
      setLoading(false)
    }
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
            disabled={loading}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            disabled={loading}
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Conectando..." : "Entrar"}
          </button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  )
}


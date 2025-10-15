// src/components/LoginModal.jsx (FINAL)

import React, { useState } from "react"
// Removida a importação de USERS_KEY e getItem/setItem de storage
import { setCurrentUser } from "../utils/storage" 
import api from "../api" // Usamos a API para fazer login

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
      // POST para a rota /api/users/login
      const response = await api.post("/users/login", { 
        username, 
        password 
      })

      // O servidor retorna { username, role, token }
      const user = response.data 

      // Salva o token e o usuário no localStorage do navegador
      setCurrentUser(user) 
      
      // Chama a função onLogin para fechar o modal e atualizar o App.jsx
      onLogin(user) 

    } catch (err) {
      console.error("Erro de Login:", err.response || err)
      if (err.response && err.response.status === 401) {
        setError("Usuário ou senha inválidos. Tente novamente.")
      } else {
        setError("Erro ao conectar ao servidor. Verifique o console.")
      }
    } finally {
      setLoading(false)
    }
  }

  // A função createAdminIfNone() foi removida
  
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
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}

        <div className="mt-4 text-sm text-center">
          <p className="text-gray-600 mb-2">
            Se você não possui uma conta, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  )
}


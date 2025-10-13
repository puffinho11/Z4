import React, { useState } from 'react'
import { getItem, setItem } from '../utils/storage'
import '../index.css'

export default function LoginModal({ onLogin }){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)

  function handleSubmit(e){
    e.preventDefault()
    const users = getItem('sfinge_users_v1', [])
    const found = users.find(u => u.username === user && u.password === pass)
    if(found){
      setErr(false)
      onLogin({ username: found.username, role: found.role })
    } else {
      setErr(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm fade-in-up">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">Acesso — Futsal Score</h2>
          <p className="text-sm text-gray-500">Entre com seu usuário e senha</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={user} onChange={e=>setUser(e.target.value)} type="text" placeholder="Usuário" className="w-full border rounded-lg px-3 py-2" required />
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Senha" className="w-full border rounded-lg px-3 py-2" required />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Entrar</button>
        </form>
        {err && <p className="text-red-600 text-sm mt-3 text-center">Usuário ou senha inválidos</p>}
      </div>
    </div>
  )
}

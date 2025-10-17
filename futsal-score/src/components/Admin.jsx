import React, { useState, useEffect } from "react"
import api from "../api"

export default function Admin() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: "", password: "", role: "user", time: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingUsername, setEditingUsername] = useState(null)

  async function fetchUsers() {
    setLoading(true)
    setError(null)
   
    try {
      const response = await api.get("/users")
      setUsers(response.data)
    } catch (err) {
      console.error("Erro ao buscar usuários:", err.response || err)
      const status = err.response?.status;
      const msg = status === 403 || status === 401 
        ? "Acesso negado. Você não é um administrador ou seu token expirou."
        : err.response?.data?.msg || "Erro ao carregar lista de usuários. Verifique o console."
      setError(msg)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function editUser(user) {
    setForm({
      username: user.username,
      password: "", 
      role: user.role,
      time: user.time || "", 
    })
    setEditingUsername(user.username)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const { username, password, role, time } = form

    if (!username || (!password && !editingUsername) || !time) { 
      alert("Preencha o nome de usuário, a senha (obrigatória para novos) e o nome do Time.")
      return
    }
    
    setLoading(true)

    try {
      const data = { 
        username, 
        password: password || undefined, 
        role,
        time, 
      }

      if (editingUsername) {
        const response = await api.put(`/users/${editingUsername}`, data)
        alert(response.data.msg)
      } else {
        const response = await api.post("/users", data)
        alert(response.data.msg)
      }
      
      setForm({ username: "", password: "", role: "user", time: "" })
      setEditingUsername(null)
      fetchUsers()
    } catch (err) {
      console.error("Erro no formulário de usuário:", err.response || err)
      setError(err.response?.data?.msg || "Erro ao salvar o usuário. Verifique o console.")
    } finally {
      setLoading(false)
    }
  }
  
  async function deleteUser(username) {
    if (!window.confirm(`Tem certeza que deseja remover o usuário ${username}?`)) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/users/${username}`);
      alert(response.data.msg);
      fetchUsers();
    } catch (err) {
      console.error("Erro ao deletar usuário:", err.response || err);
      setError(err.response?.data?.msg || "Erro ao deletar usuário. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6">Administração de Usuários</h2>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editingUsername ? `Editar Usuário: ${editingUsername}` : "Novo Usuário"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
          
          <div className="col-span-1">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuário</label>
            <input
              id="username"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Nome de Usuário"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              disabled={loading || !!editingUsername}
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Nome do Time</label>
            <input
              id="time"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ex: Futsal Mania"
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Papel</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
              disabled={loading}
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-span-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder={editingUsername ? "Nova senha (opcional)" : "Senha"}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              type="password"
              required={!editingUsername} 
              disabled={loading}
            />
          </div>
          <div className="md:col-span-4 flex gap-4 pt-2"> 
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading 
                ? "Processando..." 
                : editingUsername ? "Atualizar Usuário" : "Criar Usuário"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({ username: "", password: "", role: "user", time: "" }); 
                setEditingUsername(null);
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-200"
              disabled={loading}
            >
              Limpar/Cancelar
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">Lista de Usuários ({users.length})</h3>
        
        {loading && users.length === 0 && <p className="text-blue-600">Carregando usuários...</p>}
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th> {/* NOVA COLUNA */}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 && !loading ? (
              <tr>
                <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                 Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.username}>
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{u.time}</td> 
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2 text-center flex gap-3 justify-center">
                    <button
                      onClick={() => editUser(u)}
                      className="text-blue-600 hover:underline"
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteUser(u.username)}
                      className="text-red-600 hover:underline"
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
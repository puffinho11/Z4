import React, { useState, useEffect } from "react";
import api from "../api"; 

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUsername, setEditingUsername] = useState(null); 

  async function fetchUsers() {
    setLoading(true)
    setError(null)
   
    try {
      const response = await api.get("/users")
      setUsers(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err.response || err)
      const status = err.response?.status
      const msg = status === 403 || status === 401 
        ? "Acesso negado. Você não é um administrador ou seu token expirou."
        : err.response?.data?.msg || "Erro ao carregar lista de usuários. Verifique o console."
      setError(msg)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const { username, password, role } = form
    
    if (!username || (!password && !editingUsername)) { 
      alert("Preencha o nome de usuário e a senha (obrigatório na criação).")
      return
    }
        
    const payload = editingUsername 
        ? { username: editingUsername, newUsername: username, password, role } 
        : { username, password, role }

    if (editingUsername && !password) {
        delete payload.password;
    }

    setLoading(true);
    try {
      
        await api.post("/users", payload) 
        
        await fetchUsers()
        
        setForm({ username: "", password: "", role: "user" })
        setEditingUsername(null)
        alert(`Usuário ${username} salvo com sucesso!`)
        
    } catch (err) {
        console.error("Erro ao salvar usuário:", err.response || err)
        const msg = err.response?.data?.msg || "Erro ao salvar usuário. Verifique se o nome de usuário já existe."
        setError(msg)
    } finally {
        setLoading(false)
    }
  }

  async function deleteUser(username) {
    if (!window.confirm(`Tem certeza que deseja remover o usuário ${username}?`)) {
      return
    }
    
    setLoading(true)
    setError(null)
    try {

        await api.delete(`/users/${username}`)
        
        alert(`Usuário ${username} removido!`)
        await fetchUsers()
        
    } catch (err) {
        console.error("Erro ao deletar usuário:", err.response || err)
        const msg = err.response?.data?.msg || "Erro ao remover usuário."
        setError(msg)
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
    setForm({ username: user.username, password: "", role: user.role })
    setEditingUsername(user.username)
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Administração de Usuários</h2>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h3 className="font-semibold text-lg">
          {editingUsername ? `Editar ${editingUsername}` : "Cadastrar Novo Usuário"}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Usuário"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder={editingUsername ? "Nova Senha (deixe vazio para manter)" : "Senha"}
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            type="password"
            required={!editingUsername} 
          />
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <option value="user">Usuário Comum</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button 
            type="submit" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            disabled={loading}
          >
            {loading 
                ? "Salvando..." 
                : editingUsername ? "Atualizar" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm({ username: "", password: "", role: "user" })
              setEditingUsername(null)
              setError(null)
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Limpar
          </button>
        </div>
      </form>
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="font-semibold mb-2 text-lg">Lista de Usuários</h3>
        {loading && users.length === 0 && <div className="text-blue-600">Carregando usuários...</div>}
        
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Usuário</th>
              <th className="px-3 py-2 text-left">Papel</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-3 py-4 text-center text-gray-500"
                >
                 Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.username}>
                  <td className="px-3 py-2">{u.username}</td>
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
  )
}
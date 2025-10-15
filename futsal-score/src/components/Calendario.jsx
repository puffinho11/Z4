import React, { useEffect, useState } from "react"
import api from "../api"

export default function Calendario() {
  const blank = {
    titulo: "",
    adversario: "",
    data: new Date().toISOString().slice(0, 10),
    hora: "18:00",
    local: "",
  }

  const [lista, setLista] = useState([])
  const [editingId, setEditingId] = useState(null) 
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchEventos() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/calendario")
      setLista(response.data)
    } catch (err) {
      console.error("Erro ao carregar eventos:", err.response || err)
      const msg = err.response?.status === 403 || err.response?.status === 401 
        ? "Acesso negado. Faça login novamente."
        : "Erro ao carregar dados do servidor."
      setError(msg)
      setLista([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventos();
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function editar(ev) {
    setForm(ev)
    setEditingId(ev._id)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.titulo || !form.data) {
      alert("Preencha Título e Data.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (editingId) {
        // PUT /calendario/:id
        await api.put(`/calendario/${editingId}`, form)
      } else {
        // POST /calendario
        await api.post("/calendario", form)
      }
      
      // *** CORREÇÃO: RECARREGAR A LISTA APÓS O SUCESSO ***
      await fetchEventos() 

      setForm(blank)
      setEditingId(null)
      alert(editingId ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!")

    } catch (err) {
      console.error("Erro ao salvar evento:", err.response || err)
      setError("Erro ao salvar o evento. Verifique o console.")
    } finally {
      setLoading(false)
    }
  }

  async function excluir(_id) {
    if (window.confirm("Tem certeza que deseja remover este evento?")) {
      setLoading(true)
      try {
        // DELETE /calendario/:id
        await api.delete(`/calendario/${_id}`)

        // *** CORREÇÃO: RECARREGAR A LISTA APÓS O SUCESSO ***
        await fetchEventos()

        alert("Evento removido com sucesso!")
      } catch (err) {
        console.error("Erro ao excluir evento:", err.response || err)
        setError("Erro ao excluir o evento. Verifique o console.")
      } finally {
        setLoading(false)
      }
    }
  }

  const listaOrdenada = lista.slice().sort((a, b) => {
    // Ordena pela data + hora
    const dtA = new Date(a.data + 'T' + (a.hora || '00:00'))
    const dtB = new Date(b.data + 'T' + (b.hora || '00:00'))
    return dtA - dtB // Ordena do mais antigo para o mais novo
  })

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6">Calendário de Eventos</h2>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? "Editar Evento" : "Novo Evento"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título (Ex: Treino, Jogo, Reunião)
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              className="w-full border rounded-lg px-3 py-2"
              value={form.hora}
              onChange={(e) => handleChange("hora", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adversário (Se for jogo)
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={form.adversario}
              onChange={(e) => handleChange("adversario", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={form.local}
              onChange={(e) => handleChange("local", e.target.value)}
              disabled={loading}
            />
          </div>

        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Aguarde..." : editingId ? "Atualizar Evento" : "Salvar Evento"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(blank);
              setEditingId(null);
            }}
            className="px-3 py-2 rounded-lg border"
            disabled={loading}
          >
            Limpar
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Próximos Eventos ({lista.length})</h3>
        
        {loading && lista.length === 0 ? (
          <div className="text-blue-600">Carregando eventos...</div>
        ) : (
            <div className="space-y-3">
            {listaOrdenada.length === 0 && (
                <div className="text-gray-500">Nenhum evento encontrado.</div>
            )}
            {listaOrdenada.map((ev) => (
                <div 
                    key={ev._id} 
                    className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm"
                >
                <div>
                    <div className="font-medium text-base">
                        {ev.titulo} 
                        {ev.adversario && <span className="text-xs text-gray-500"> • vs {ev.adversario}</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(ev.data + 'T' + (ev.hora || '00:00')).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} 
                        {ev.local ? ' • ' + ev.local : ''}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                    <button 
                        onClick={()=>{ 
                            navigator.clipboard?.writeText(`${ev.titulo} - ${ev.adversario || ''} • ${ev.data} ${ev.hora || ''} - Local: ${ev.local || ''}`) 
                            alert('Copiado para área de transferência');
                        }}
                        className="text-gray-600 hover:underline"
                        disabled={loading}
                    >
                        Copiar
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => editar(ev)} className="text-green-600 hover:underline" disabled={loading}>Editar</button>
                        <button onClick={() => excluir(ev._id)} className="text-red-600 hover:underline" disabled={loading}>Excluir</button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </section>
  )
}
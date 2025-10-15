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

  async function salvar(e) {
    e?.preventDefault()
    if (!form.titulo || !form.data) {
      alert("Preencha título e data")
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (editingId) {
        await api.put(`/calendario/${editingId}`, form)
        alert(`Evento '${form.titulo}' atualizado!`)
      } else {
        await api.post("/calendario", form)
        alert(`Novo evento '${form.titulo}' salvo!`)
      }

      await fetchEventos()

      setForm(blank)
      setEditingId(null)

    } catch (err) {
      console.error("Erro ao salvar/atualizar evento:", err.response || err)
      setError("Erro ao salvar o evento. Verifique se está logado.")
    } finally {
      setLoading(false)
    }
  }

  function editar(ev) {
    setEditingId(ev._id) 
    setForm({
      titulo: ev.titulo,
      adversario: ev.adversario || "",
      data: ev.data.split('T')[0],
      hora: ev.hora || "18:00",
      local: ev.local || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function excluir(id) {
    if (!window.confirm("Excluir este evento?")) return

    setLoading(true)
    setError(null)
    try {

      await api.delete(`/calendario/${id}`)
      
      setLista(p => p.filter(ev => ev._id !== id))
      alert("Evento excluído com sucesso!")

    } catch (err) {
      console.error("Erro ao excluir evento:", err.response || err)
      setError("Erro ao excluir. Verifique se está logado.")
    } finally {
      setLoading(false)
    }
  }

  const sortedLista = lista.slice().sort((a, b) => new Date(a.data) - new Date(b.data))

  return (
    <section className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">Calendário de Jogos e Eventos</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={salvar} className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h3 className="font-semibold text-lg">
           {editingId ? "Editar Evento" : "Cadastrar Novo Evento"}
        </h3>
        <div>
          <label className="block text-sm">Título / Evento</label>
          <input
            value={form.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm">Adversário (Opcional)</label>
          <input
            value={form.adversario}
            onChange={(e) => handleChange("adversario", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm">Hora</label>
            <input
              type="time"
              value={form.hora}
              onChange={(e) => handleChange("hora", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm">Local (Opcional)</label>
            <input
              value={form.local}
              onChange={(e) => handleChange("local", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Processando..." : editingId ? "Atualizar Evento" : "Salvar Evento"}
          </button>
          <button 
            type="button"
            onClick={() => {
                setForm(blank)
                setEditingId(null)
            }} 
            className="px-3 py-2 border rounded-lg"
            disabled={loading}
          >
            Limpar
          </button>
        </div>
      </form>
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="font-semibold mb-2">Próximos Jogos/Eventos</h3>
        
        {loading && <div className="text-blue-600">Carregando eventos...</div>}

        {!loading && sortedLista.length === 0 && (
            <div className="text-gray-500">Nenhum evento cadastrado.</div>
        )}

        {!loading && (
            <div className="space-y-2">
            {sortedLista.map(ev => (
                <div key={ev._id} className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                    <div className="font-medium">
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
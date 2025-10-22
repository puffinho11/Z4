import React, { useEffect, useState } from "react"
import api from "../api"
import { MdEvent } from "react-icons/md"

export default function Calendario() {
  const blank = {
    titulo: "",
    adversario: "",
    data: new Date().toISOString().slice(0, 10),
    hora: "18:00",
    local: "",
  }

  // Pega o time do usuário logado (ou usa padrão)
  const user = JSON.parse(localStorage.getItem("user"))
  const [time] = useState(user?.time || user?.idTime || "Time Padrão")

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
      setLista(response.data || [])
    } catch (err) {
      console.error("Erro ao carregar eventos:", err.response || err)
      setError("Erro ao carregar eventos. Tente novamente mais tarde.")
      setLista([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventos()
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function editar(ev) {
    setForm(ev)
    setEditingId(ev._id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.titulo || !form.data) {
      alert("Preencha os campos obrigatórios (Título e Data).")
      return
    }

    setLoading(true)
    try {
      // Envia o time junto com o evento
      const payload = {
        ...form,
        time: user?.time || user?.idTime || "Time Padrão"
      }

      if (editingId) {
        await api.put(`/calendario/${editingId}`, payload)
      } else {
        await api.post("/calendario", payload)
      }

      await fetchEventos()
      setForm(blank)
      setEditingId(null)
      alert(editingId ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!")
    } catch (err) {
      console.error("Erro ao salvar evento:", err.response || err)
      setError("Erro ao salvar evento.")
    } finally {
      setLoading(false)
    }
  }

  async function excluir(id) {
    if (!window.confirm("Deseja realmente excluir este evento?")) return
    setLoading(true)
    try {
      await api.delete(`/calendario/${id}`)
      await fetchEventos()
      alert("Evento excluído com sucesso!")
    } catch (err) {
      console.error("Erro ao excluir evento:", err.response || err)
      setError("Erro ao excluir evento.")
    } finally {
      setLoading(false)
    }
  }

  const listaOrdenada = lista
    .slice()
    .sort(
      (a, b) =>
        new Date(a.data + "T" + (a.hora || "00:00")) -
        new Date(b.data + "T" + (b.hora || "00:00"))
    )

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-800 mb-2 flex items-center gap-2">
        <MdEvent className="text-4xl" /> <span>Calendário de Eventos</span>
      </h2>
      <p className="text-gray-500 mb-6">
        Organize treinos, jogos e atividades do time em um só lugar.
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 border border-gray-100 mb-8"
      >
        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mb-4">
          {editingId ? "Editar Evento" : "Novo Evento"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Título do Evento
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: Treino Técnico, Jogo Amistoso..."
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hora</label>
            <input
              type="time"
              value={form.hora}
              onChange={(e) => handleChange("hora", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Adversário (se for jogo)
            </label>
            <input
              type="text"
              value={form.adversario}
              onChange={(e) => handleChange("adversario", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: Futsal Lions"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Local</label>
            <input
              type="text"
              value={form.local}
              onChange={(e) => handleChange("local", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: Ginásio Municipal"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-5">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(blank)
                setEditingId(null)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Salvando..." : editingId ? "Atualizar Evento" : "Salvar Evento"}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mb-4">
          Próximos Eventos ({lista.length})
        </h3>

        {loading && lista.length === 0 ? (
          <p className="text-blue-600">Carregando eventos...</p>
        ) : listaOrdenada.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl border">
            Nenhum evento cadastrado.
          </p>
        ) : (
          <div className="space-y-3">
            {listaOrdenada.map((ev) => (
              <div
                key={ev._id}
                className="p-4 bg-gray-50 border rounded-xl hover:shadow transition flex justify-between items-center flex-wrap gap-2"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {ev.titulo}{" "}
                    {ev.adversario && (
                      <span className="text-gray-500 text-sm">• vs {ev.adversario}</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(ev.data + "T" + (ev.hora || "00:00")).toLocaleString(
                      "pt-BR",
                      { dateStyle: "short", timeStyle: "short" }
                    )}
                    {ev.local && <span> • {ev.local}</span>}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 text-sm">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${ev.titulo} ${
                          ev.adversario ? "• vs " + ev.adversario : ""
                        } • ${ev.data} ${ev.hora || ""} ${ev.local ? "• " + ev.local : ""}`
                      )
                      alert("Evento copiado para a área de transferência!")
                    }}
                    className="text-gray-600 hover:text-gray-900"
                    disabled={loading}
                  >
                    Copiar
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => editar(ev)}
                      className="text-blue-700 hover:underline font-medium"
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(ev._id)}
                      className="text-red-700 hover:underline font-medium"
                      disabled={loading}
                    >
                      Excluir
                    </button>
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



import React, { useEffect, useState } from "react"
import api from "../api"
import { MdEvent, MdEdit, MdSave, MdCancel, MdDelete } from "react-icons/md"

function formatarData(dataString) {
  if (!dataString) return "Data Indefinida"
  try {
    const date = new Date(dataString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch (e) {
    console.error("Erro ao formatar data:", e)
    return dataString.split("T")[0]
  }
}

export default function Calendario() {
  const blank = {
    titulo: "",
    adversario: "",
    data: new Date().toISOString().slice(0, 10),
    hora: "18:00",
    local: "",
    id: null,
  }

  const user = JSON.parse(localStorage.getItem("user")) || {}
  const [time] = useState(user.time || user.idTime || "Time Padrão")
  const isAdminOrCoach = user.role === "admin" || user.role === "coach"

  const [lista, setLista] = useState([])
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mensagem, setMensagem] = useState("")

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

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMensagem("")
    setError(null)
    const payload = { ...form, time: time }

    try {
      const method = form.id ? "put" : "post"
      const url = form.id ? `/calendario/${form.id}` : "/calendario"

      const response = await api[method](url, payload)

      setMensagem(`Evento ${form.id ? "atualizado" : "criado"} com sucesso!`)
      setForm(blank)
      fetchEventos()
    } catch (err) {
      console.error("Erro ao salvar evento:", err.response || err)
      setError(
        `Falha ao salvar evento: ${
          err.response?.data?.msg || "Verifique se o backend está ativo."
        }`
      )
    } finally {
      setLoading(false)
      setTimeout(() => setMensagem(""), 5000)
    }
  }

  async function excluir(id) {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return

    setLoading(true)
    setMensagem("")
    setError(null)

    try {
      await api.delete(`/calendario/${id}`)
      setMensagem("Evento excluído com sucesso!")
      fetchEventos()
    } catch (err) {
      console.error("Erro ao excluir evento:", err.response || err)
      setError(
        `Falha ao excluir evento: ${
          err.response?.data?.msg || "Verifique as permissões."
        }`
      )
    } finally {
      setLoading(false)
      setTimeout(() => setMensagem(""), 5000)
    }
  }

  function editar(evento) {
    const dataFormatada = new Date(evento.data).toISOString().slice(0, 10)
    setForm({
      id: evento._id,
      titulo: evento.titulo,
      adversario: evento.adversario || "",
      data: dataFormatada,
      hora: evento.hora,
      local: evento.local || "",
      time: evento.time,
    })
  }

  function cancelarEdicao() {
    setForm(blank)
    setError(null)
    setMensagem("")
  }

  if (loading && lista.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-emerald-600">Carregando eventos...</p>
      </div>
    )
  }

  const showList = lista.length > 0 || loading === false

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-emerald-800 border-b pb-3 flex items-center gap-3">
        <MdEvent className="text-emerald-600 text-3xl" />
        Calendário de Eventos ({time})
      </h1>

      {mensagem && (
        <div
          className={`p-3 mb-4 rounded-lg ${
            mensagem.startsWith("Erro")
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
          role="alert"
        >
          {mensagem}
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isAdminOrCoach && (
        <div className="mb-8 border p-4 rounded-lg bg-emerald-50">
          <h2 className="text-xl font-semibold mb-4 text-emerald-800">
            {form.id ? "Editar Evento" : "Novo Evento"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full border border-emerald-300 rounded-lg px-3 py-2"
              placeholder="Título do Evento (ex: Treino, Jogo Amistoso)"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              disabled={loading}
            />
            <input
              className="w-full border border-emerald-300 rounded-lg px-3 py-2"
              placeholder="Adversário (opcional)"
              value={form.adversario}
              onChange={(e) => setForm({ ...form, adversario: e.target.value })}
              disabled={loading}
            />
            <div className="flex gap-4">
              <input
                type="date"
                className="w-1/2 border border-emerald-300 rounded-lg px-3 py-2"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                required
                disabled={loading}
              />
              <input
                type="time"
                className="w-1/2 border border-emerald-300 rounded-lg px-3 py-2"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <input
              className="w-full border border-emerald-300 rounded-lg px-3 py-2"
              placeholder="Local"
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
              disabled={loading}
            />

            <div className="flex justify-end gap-2 pt-2">
              {form.id && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="flex items-center gap-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition disabled:bg-gray-200"
                  disabled={loading}
                >
                  <MdCancel className="text-xl" />
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-4 py-2 rounded-lg hover:scale-[1.03] transition disabled:bg-gray-400"
                disabled={loading}
              >
                {loading
                  ? "Processando..."
                  : form.id
                  ? "Salvar Edição"
                  : "Criar Evento"}
                <MdSave className="text-xl" />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-800">
          Próximos Eventos ({time})
        </h2>
        {showList && lista.length === 0 && (
          <p className="text-gray-600">
            Nenhum evento futuro encontrado para {time}.
          </p>
        )}

        {lista.length > 0 && (
          <div className="space-y-4">
            {lista.map((ev) => (
              <div
                key={ev._id}
                className="flex justify-between items-start border-b pb-4 pt-2 hover:bg-emerald-50 p-2 rounded-lg transition"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-lg font-bold text-emerald-900 truncate">
                    {ev.titulo} {ev.adversario && `(vs ${ev.adversario})`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-emerald-700 mr-2">
                      {formatarData(ev.data)} às {ev.hora}
                    </span>
                    {ev.local && (
                      <span className="block">Local: {ev.local}</span>
                    )}
                    {isAdminOrCoach && ev.time && (
                      <span className="text-xs text-gray-400">
                        Time: {ev.time}
                      </span>
                    )}
                  </p>
                </div>
                {isAdminOrCoach && (
                  <div className="flex flex-col items-end gap-2 text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => editar(ev)}
                        className="text-emerald-700 hover:underline font-medium flex items-center gap-1"
                        disabled={loading}
                      >
                        <MdEdit /> Editar
                      </button>
                      <button
                        onClick={() => excluir(ev._id)}
                        className="text-red-700 hover:underline font-medium flex items-center gap-1"
                        disabled={loading}
                      >
                        <MdDelete /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}





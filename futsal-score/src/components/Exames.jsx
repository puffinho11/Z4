import React, { useEffect, useState } from "react"
import api from "../api"
import { 
  MdMedicalServices, 
  MdSave, 
  MdCancel, 
  MdList, 
  MdSearch, 
  MdEdit, 
  MdDelete, 
  MdLocalPrintshop 
} from 'react-icons/md';

export default function Exames() {
  const blank = {
    atleta: "",
    tipo: "Avaliação Física",
    resultado: "",
    data: new Date().toISOString().slice(0, 10),
    obs: "",
  }

  const [lista, setLista] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blank)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchExames() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/exames")
      setLista(response.data)
    } catch (err) {
      console.error("Erro ao carregar exames:", err.response || err)
      const msg =
        err.response?.status === 403 || err.response?.status === 401
          ? "Acesso negado. Faça login novamente."
          : "Erro ao carregar dados do servidor. Verifique o console."
      setError(msg)
      setLista([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExames()
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function handleCancel() {
    setForm(blank)
    setEditingId(null)
  }

  function editar(exame) {
    const dataFormatada = new Date(exame.data).toISOString().slice(0, 10)
    setForm({ ...exame, data: dataFormatada })
    setEditingId(exame._id)
    window.scrollTo({ top: 0, behavior: "smooth" }) 
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = { ...form, id: editingId }

    try {
      let response
      if (editingId) {
        response = await api.put(`/exames/${editingId}`, payload)
        setLista(lista.map((ex) => (ex._id === editingId ? response.data : ex)))
      } else {
        response = await api.post("/exames", payload)
        setLista([response.data, ...lista])
      }

      handleCancel()
      alert(editingId ? "Exame atualizado com sucesso!" : "Exame salvo com sucesso!")
    } catch (err) {
      console.error("Erro ao salvar exame:", err.response || err)
      setError("Erro ao salvar exame. Verifique o console ou a conexão com a API.")
    } finally {
      setLoading(false)
    }
  }

  async function excluir(id) {
    if (!window.confirm("Tem certeza que deseja excluir este exame?")) return

    setLoading(true)
    setError(null)

    try {
      await api.delete(`/exames/${id}`)
      setLista(lista.filter((ex) => ex._id !== id))
      alert("Exame excluído com sucesso!")
    } catch (err) {
      console.error("Erro ao excluir exame:", err.response || err)
      setError("Erro ao excluir exame. Verifique o console.")
    } finally {
      setLoading(false)
    }
  }

  function imprimir(exame) {
    const content = `
      <html>
        <head>
          <title>Exame de ${exame.atleta}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px; display: flex; align-items: center; gap: 10px; }
            .info { margin-bottom: 15px; }
            .info span { font-weight: bold; color: #374151; }
            .resultado { margin-top: 20px; white-space: pre-wrap; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Relatório de Exame</h1>
          <div class="info"><span>Atleta:</span> ${exame.atleta}</div>
          <div class="info"><span>Tipo:</span> ${exame.tipo}</div>
          <div class="info"><span>Data:</span> ${new Date(exame.data + "T00:00:00").toLocaleDateString("pt-BR")}</div>
          ${exame.obs ? `<div class="info"><span>Observação:</span> ${exame.obs}</div>` : ""}
          <h2>Resultado:</h2>
          <div class="resultado">${exame.resultado || "Nenhum resultado registrado."}</div>
          <script>window.print()</script>
        </body>
      </html>
    `
    const printWindow = window.open("", "", "height=600,width=800")
    printWindow.document.write(content)
    printWindow.document.close()
  }

  const filteredLista = lista.filter(
    (e) =>
      e.atleta.toLowerCase().includes(q.toLowerCase()) ||
      e.tipo.toLowerCase().includes(q.toLowerCase()) ||
      e.resultado.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 flex items-center gap-3">
        <MdMedicalServices className="text-4xl" /> Gerenciamento de Exames
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 space-y-4 border border-gray-100 mb-8"
      >
        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 flex items-center gap-2">
          <MdSave className="text-xl" /> {editingId ? "Editar Exame" : "Novo Exame"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Atleta</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={form.atleta}
              onChange={(e) => handleChange("atleta", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Tipo de Exame</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={form.tipo}
              onChange={(e) => handleChange("tipo", e.target.value)}
              required
              disabled={loading}
            >
              <option>Avaliação Física</option>
              <option>Exame Médico</option>
              <option>Exame de Imagem</option>
              <option>Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Data</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Resultado</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="4"
            value={form.resultado}
            onChange={(e) => handleChange("resultado", e.target.value)}
            disabled={loading}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Observações</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.obs}
            onChange={(e) => handleChange("obs", e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <div className="text-red-600 font-medium">{error}</div>}

        <div className="flex justify-end gap-3 pt-4">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 flex items-center gap-1"
              disabled={loading}
            >
              <MdCancel /> Cancelar Edição
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-1"
            disabled={loading}
          >
            <MdSave /> {loading ? "Salvando..." : editingId ? "Atualizar Exame" : "Salvar Exame"}
          </button>
        </div>
      </form>
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <MdList className="text-2xl" /> Exames Salvos ({filteredLista.length})
        </h3>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Pesquisar por atleta, tipo ou resultado..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loading && !lista.length ? (
          <div className="text-blue-600">Carregando exames...</div>
        ) : (
          <div className="space-y-4">
            {filteredLista.length === 0 && (
              <div className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl border">
                Nenhum exame encontrado.
              </div>
            )}

            {filteredLista.slice().reverse().map((e) => (
              <div
                key={e._id}
                className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start hover:shadow transition"
              >
                <div>
                  <div className="font-bold text-gray-800">{e.atleta}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="text-blue-600 font-medium">{e.tipo}</span> •{" "}
                    {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </div>
                  <div className="text-sm mt-2 text-gray-700 max-w-xl">
                    **Resultado:**{" "}
                    {e.resultado
                      ? e.resultado.length > 200
                        ? e.resultado.slice(0, 200) + "..."
                        : e.resultado
                      : <i className="text-gray-400">Sem resultado</i>}
                    {e.obs && (
                        <div className="text-xs mt-1 text-yellow-700">
                            **Obs:** {e.obs}
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm font-medium flex-shrink-0">
                  <button
                    onClick={() => imprimir(e)}
                    className="text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    disabled={loading}
                  >
                    <MdLocalPrintshop /> Imprimir
                  </button>
                  <button
                    onClick={() => editar(e)}
                    className="text-green-700 hover:text-green-900 flex items-center gap-1"
                    disabled={loading}
                  >
                    <MdEdit /> Editar
                  </button>
                  <button
                    onClick={() => excluir(e._id)}
                    className="text-red-700 hover:text-red-900 flex items-center gap-1"
                    disabled={loading}
                  >
                    <MdDelete /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}




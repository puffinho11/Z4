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
} from "react-icons/md"

export default function Exames() {
  const blank = {
    atleta: "",
    tipo: "Avaliação Física",
    resultado: "",
    data: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    obs: "",
    solicitante: ""
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
      const msg =
        err.response?.status === 403 || err.response?.status === 401
          ? "Acesso negado. Faça login novamente."
          : "Erro ao carregar dados do servidor."
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
    const solicitanteValue = exame.solicitante || ""
    const timeValue = exame.time || new Date().toTimeString().slice(0, 5)
    const dataFormatada = new Date(exame.data).toISOString().slice(0, 10)
    setForm({
      ...exame,
      data: dataFormatada,
      solicitante: solicitanteValue,
      time: timeValue
    })
    setEditingId(exame._id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { atleta, tipo, resultado, data, time, obs, solicitante } = form
    if (!time || !solicitante) {
      setError("Preencha os campos Hora e Solicitante.")
      setLoading(false)
      return
    }

    const payload = { atleta, tipo, resultado, data, time, obs, solicitante, id: editingId }

    try {
      const response = await api.post("/exames", payload)
      if (editingId)
        setLista(lista.map((ex) => (ex._id === editingId ? response.data : ex)))
      else setLista([response.data, ...lista])
      handleCancel()
      alert(editingId ? "Exame atualizado com sucesso!" : "Exame salvo com sucesso!")
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Erro desconhecido ao salvar exame."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function excluir(id) {
    if (!window.confirm("Deseja excluir este exame?")) return
    setLoading(true)
    try {
      await api.delete(`/exames/${id}`)
      setLista(lista.filter((ex) => ex._id !== id))
      alert("Exame excluído com sucesso!")
    } catch {
      setError("Erro ao excluir exame.")
    } finally {
      setLoading(false)
    }
  }

  function imprimir(exame) {
    const solicitanteInfo = exame.solicitante || "Não informado"
    const obsInfo = exame.obs || "Nenhuma observação."
    const timeInfo = exame.time || "Não informado"
    const content = `
      <html>
        <head>
          <title>Exame de ${exame.atleta}</title>
          <style>
            body{font-family:sans-serif;padding:20px;line-height:1.6}
            h1{color:#047857;border-bottom:2px solid #047857;padding-bottom:5px;margin-bottom:20px}
            h2{margin-top:25px;color:#047857;border-bottom:1px dashed #ccc;padding-bottom:5px}
            .info{margin-bottom:10px;display:flex}
            .info span{font-weight:bold;color:#374151;min-width:180px}
            .resultado{margin-top:10px;white-space:pre-wrap;border:1px solid #ccc;padding:15px;border-radius:5px;background-color:#f9f9f9;min-height:100px}
            .assinaturas{display:flex;justify-content:space-around;margin-top:70px}
            .assinatura-box{text-align:center;width:45%}
            .linha{border-top:1px solid #000;margin-top:5px;padding-top:5px}
          </style>
        </head>
        <body>
          <h1>Relatório de Exame Médico/Físico</h1>
          <div class="info"><span>Atleta:</span>${exame.atleta}</div>
          <div class="info"><span>Tipo de Exame:</span>${exame.tipo}</div>
          <div class="info"><span>Data:</span>${new Date(exame.data + "T00:00:00").toLocaleDateString("pt-BR")}</div>
          <div class="info"><span>Hora:</span>${timeInfo}</div>
          <h2>Solicitação</h2>
          <div class="info"><span>Solicitante:</span>${solicitanteInfo}</div>
          <div class="info"><span>Observação:</span>${obsInfo}</div>
          <h2>Resultado Médico</h2>
          <div class="resultado">${exame.resultado || "Aguardando preenchimento..."}</div>
          <div class="assinaturas">
            <div class="assinatura-box"><div class="linha"></div>Assinatura do Solicitante</div>
            <div class="assinatura-box"><div class="linha"></div>Assinatura do Médico</div>
          </div>
          <script>window.print()</script>
        </body>
      </html>`
    const w = window.open("", "", "height=600,width=800")
    w.document.write(content)
    w.document.close()
  }

  const filteredLista = lista.filter(
    (e) =>
      e.atleta.toLowerCase().includes(q.toLowerCase()) ||
      e.tipo.toLowerCase().includes(q.toLowerCase()) ||
      e.resultado.toLowerCase().includes(q.toLowerCase()) ||
      e.solicitante.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-3xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
        <MdMedicalServices className="text-4xl text-emerald-600" /> Gerenciamento de Exames
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-6 space-y-4 border border-gray-200 mb-10"
      >
        <h3 className="text-lg font-semibold text-emerald-800 border-b pb-2 flex items-center gap-2">
          <MdSave className="text-xl text-emerald-600" /> {editingId ? "Editar Exame" : "Novo Exame"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">Atleta</label>
            <input
              type="text"
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              value={form.atleta}
              onChange={(e) => handleChange("atleta", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Tipo de Exame</label>
            <select
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              value={form.tipo}
              onChange={(e) => handleChange("tipo", e.target.value)}
            >
              <option value="Avaliação Física">Avaliação Física (Testes de resistência e força)</option>
              <option value="Avaliação Antropométrica">Avaliação Antropométrica (peso, altura, IMC, dobras cutâneas)</option>
              <option value="Eletrocardiograma (ECG)">Eletrocardiograma (ECG)</option>
              <option value="Exame Clínico Geral">Exame Clínico Geral</option>
              <option value="Hemograma Completo">Hemograma Completo</option>
              <option value="Exame de Glicemia">Exame de Glicemia</option>
              <option value="Teste de VO₂ Máximo">Teste de VO₂ Máximo</option>
              <option value="Avaliação Ortopédica">Avaliação Ortopédica</option>
              <option value="Avaliação Cardiológica">Avaliação Cardiológica</option>
              <option value="Exame de Aptidão Física">Exame de Aptidão Física</option>
              <option value="Exame Oftalmológico">Exame Oftalmológico</option>
              <option value="Exame de Raio-X">Exame de Raio-X</option>
              <option value="Avaliação Nutricional">Avaliação Nutricional</option>
              <option value="Exame de Urina">Exame de Urina</option>
              <option value="Exame de Fezes">Exame de Fezes</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Data</label>
            <input
              type="date"
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Hora</label>
            <input
              type="time"
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Solicitante</label>
            <input
              type="text"
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              value={form.solicitante}
              onChange={(e) => handleChange("solicitante", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Observações</label>
            <input
              type="text"
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
              value={form.obs}
              onChange={(e) => handleChange("obs", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Resultado</label>
          <textarea
            className="w-full border border-emerald-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500"
            rows="4"
            value={form.resultado}
            onChange={(e) => handleChange("resultado", e.target.value)}
          />
        </div>

        {error && <div className="text-red-600 font-medium">{error}</div>}

        <div className="flex justify-end gap-3 pt-4">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 flex items-center gap-1"
            >
              <MdCancel /> Cancelar
            </button>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-2 px-4 rounded-lg hover:scale-[1.03] flex items-center gap-1"
          >
            <MdSave /> {loading ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2">
          <MdList className="text-2xl text-emerald-600" /> Exames Registrados ({filteredLista.length})
        </h3>

        <div className="mb-4 relative">
          <input
            type="text"
            className="w-full border border-emerald-300 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-emerald-500"
            placeholder="Pesquisar por atleta, tipo ou solicitante..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="space-y-4">
          {filteredLista.length === 0 && (
            <div className="text-gray-500 text-center py-6 bg-emerald-50 rounded-xl border border-emerald-100">
              Nenhum exame encontrado.
            </div>
          )}

          {filteredLista
            .slice()
            .reverse()
            .map((e) => (
              <div
                key={e._id}
                className="p-4 border border-emerald-100 rounded-lg bg-emerald-50 flex justify-between items-start hover:bg-emerald-100"
              >
                <div>
                  <div className="font-bold text-emerald-900">{e.atleta}</div>
                  <div className="text-xs text-gray-600">
                    {e.tipo} • {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")} às {e.time}
                  </div>
                  <div className="text-sm mt-2 text-gray-700 max-w-xl">
                    <b>Solicitante:</b> {e.solicitante || "Não informado"} <br />
                    <b>Resultado:</b>{" "}
                    {e.resultado
                      ? e.resultado.length > 180
                        ? e.resultado.slice(0, 180) + "..."
                        : e.resultado
                      : "Aguardando resultado"}
                    {e.obs && (
                      <div className="text-xs mt-1 text-emerald-700">
                        <b>Obs:</b> {e.obs}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm font-medium flex-shrink-0">
                  <button
                    onClick={() => imprimir(e)}
                    className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <MdLocalPrintshop /> Imprimir
                  </button>
                  <button
                    onClick={() => editar(e)}
                    className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <MdEdit /> Editar
                  </button>
                  <button
                    onClick={() => excluir(e._id)}
                    className="text-red-700 hover:text-red-900 flex items-center gap-1"
                  >
                    <MdDelete /> Excluir
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}


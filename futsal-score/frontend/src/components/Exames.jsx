import React, { useEffect, useMemo, useState } from "react"
import api from "../api"
import {
  MdMedicalServices,
  MdSave,
  MdCancel,
  MdList,
  MdSearch,
  MdEdit,
  MdDelete,
  MdLocalPrintshop,
  MdInfoOutline
} from "react-icons/md"

export default function Exames() {
  const nowISODate = () => new Date().toISOString().slice(0, 10)
  const nowTime = () => new Date().toTimeString().slice(0, 5)

  const blank = {
    atleta: "",
    tipo: "Avaliação Física",
    tipoOutro: "",
    data: nowISODate(),
    time: nowTime(),
    obs: "",
    solicitante: ""
  }

  const [lista, setLista] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blank)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const isEditing = Boolean(editingId)

  function toastSuccess(msg) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 2500)
  }

  function safeLower(v) {
    return (v ?? "").toString().toLowerCase()
  }

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function handleCancel() {
    setForm({ ...blank, data: nowISODate(), time: nowTime() })
    setEditingId(null)
    setError(null)
    setSuccess(null)
  }

  async function fetchExames() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/exames")
      setLista(Array.isArray(response.data) ? response.data : [])
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

  function editar(exame) {
    const dataFormatada = exame?.data
      ? new Date(exame.data).toISOString().slice(0, 10)
      : nowISODate()

    const tipoValue = exame?.tipo || "Avaliação Física"
    const isOutro = tipoValue === "Outro"

    setForm({
      atleta: exame?.atleta || "",
      tipo: tipoValue,
      tipoOutro: isOutro ? (exame?.tipoOutro || exame?.tipoCustom || "") : "",
      data: dataFormatada,
      time: exame?.time || nowTime(),
      obs: exame?.obs || "",
      solicitante: exame?.solicitante || ""
    })

    setEditingId(exame?._id || null)
    setError(null)
    setSuccess(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const { atleta, tipo, tipoOutro, data, time, obs, solicitante } = form

    if (!atleta?.trim()) return setError("Preencha o campo Atleta.")
    if (!data) return setError("Preencha a Data.")
    if (!time) return setError("Preencha a Hora.")
    if (!solicitante?.trim()) return setError("Preencha o campo Solicitante.")
    if (tipo === "Outro" && !tipoOutro?.trim())
      return setError("Informe o tipo do exame (Outro).")

    const payload = {
      atleta: atleta.trim(),
      tipo,
      tipoOutro: tipo === "Outro" ? tipoOutro.trim() : "",
      data,
      time,
      obs: (obs ?? "").trim(),
      solicitante: solicitante.trim(),
      id: editingId
    }

    setSaving(true)
    try {
      const response = await api.post("/exames", payload)
      const saved = response.data

      setLista((prev) => {
        if (editingId) return prev.map((ex) => (ex._id === editingId ? saved : ex))
        return [saved, ...prev]
      })

      handleCancel()
      toastSuccess(editingId ? "Exame atualizado com sucesso!" : "Exame salvo com sucesso!")
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Erro desconhecido ao salvar exame."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function excluir(id) {
    if (!window.confirm("Deseja excluir este exame?")) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await api.delete(`/exames/${id}`)
      setLista((prev) => prev.filter((ex) => ex._id !== id))
      toastSuccess("Exame excluído com sucesso!")
    } catch {
      setError("Erro ao excluir exame.")
    } finally {
      setSaving(false)
    }
  }

  function imprimir(exame) {
    const solicitanteInfo = exame?.solicitante || "Não informado"
    const obsInfo = exame?.obs || "Nenhuma observação."
    const timeInfo = exame?.time || "Não informado"
    const tipoInfo =
      exame?.tipo === "Outro"
        ? (exame?.tipoOutro || "Outro")
        : (exame?.tipo || "Não informado")

    const content = `
      <html>
        <head>
          <title>Exame de ${exame?.atleta || ""}</title>
          <style>
            body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;padding:24px;line-height:1.6}
            h1{color:#047857;border-bottom:2px solid #047857;padding-bottom:6px;margin:0 0 18px}
            h2{margin-top:22px;color:#047857;border-bottom:1px dashed #cbd5e1;padding-bottom:6px}
            .info{margin-bottom:10px;display:flex;gap:10px}
            .info span{font-weight:700;color:#334155;min-width:170px}
            .assinaturas{display:flex;justify-content:space-between;gap:20px;margin-top:70px}
            .assinatura-box{text-align:center;width:48%}
            .linha{border-top:1px solid #000;margin-top:5px;padding-top:5px}
          </style>
        </head>
        <body>
          <h1>Solicitação de Exame</h1>
          <div class="info"><span>Atleta:</span>${exame?.atleta || ""}</div>
          <div class="info"><span>Tipo de Exame:</span>${tipoInfo}</div>
          <div class="info"><span>Data:</span>${new Date((exame?.data || "") + "T00:00:00").toLocaleDateString("pt-BR")}</div>
          <div class="info"><span>Hora:</span>${timeInfo}</div>

          <h2>Solicitação</h2>
          <div class="info"><span>Solicitante:</span>${solicitanteInfo}</div>
          <div class="info"><span>Observação:</span>${obsInfo}</div>

          <div class="assinaturas">
            <div class="assinatura-box"><div class="linha"></div>Assinatura do Solicitante</div>
            <div class="assinatura-box"><div class="linha"></div>Assinatura do Avaliador/Médico</div>
          </div>
          <script>window.print()</script>
        </body>
      </html>`

    const w = window.open("", "", "height=700,width=900")
    w.document.write(content)
    w.document.close()
  }

  const tipos = [
    "Avaliação Física",
    "Avaliação Antropométrica",
    "Eletrocardiograma (ECG)",
    "Exame Clínico Geral",
    "Hemograma Completo",
    "Exame de Glicemia",
    "Teste de VO₂ Máximo",
    "Avaliação Ortopédica",
    "Avaliação Cardiológica",
    "Exame de Aptidão Física",
    "Exame Oftalmológico",
    "Exame de Raio-X",
    "Avaliação Nutricional",
    "Exame de Urina",
    "Exame de Fezes",
    "Outro"
  ]

  const filteredLista = useMemo(() => {
    const query = safeLower(q).trim()
    const arr = (lista || []).filter((e) => {
      if (!query) return true
      return (
        safeLower(e?.atleta).includes(query) ||
        safeLower(e?.tipo).includes(query) ||
        safeLower(e?.tipoOutro).includes(query) ||
        safeLower(e?.solicitante).includes(query) ||
        safeLower(e?.obs).includes(query)
      )
    })

    arr.sort((a, b) => {
      const da = new Date(`${(a?.data || "").slice(0, 10)}T${a?.time || "00:00"}:00`).getTime() || 0
      const db = new Date(`${(b?.data || "").slice(0, 10)}T${b?.time || "00:00"}:00`).getTime() || 0
      return db - da
    })

    return arr
  }, [lista, q])

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow">
            <MdMedicalServices className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Gerenciamento de Exames
            </h2>
            <p className="text-sm text-slate-500">
              Registre, edite, pesquise e imprima relatórios dos exames.
            </p>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mb-6 rounded-2xl border p-4 flex items-start gap-3 ${
              error
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <MdInfoOutline className="text-xl mt-0.5" />
            <div className="text-sm font-semibold">{error || success}</div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm rounded-2xl border border-slate-200 p-5 md:p-6 mb-8"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MdSave className="text-xl text-emerald-600" />
              {isEditing ? "Editar Exame" : "Novo Exame"}
            </h3>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl flex items-center gap-1 text-sm font-semibold"
              >
                <MdCancel /> Cancelar edição
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="block text-sm font-semibold text-slate-700">Atleta</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={form.atleta}
                onChange={(e) => handleChange("atleta", e.target.value)}
                placeholder="Ex.: João Silva"
                required
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-semibold text-slate-700">Tipo de Exame</label>
              <select
                className="w-full border border-slate-300 rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={form.tipo}
                onChange={(e) => handleChange("tipo", e.target.value)}
              >
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {form.tipo === "Outro" && (
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 mt-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={form.tipoOutro}
                  onChange={(e) => handleChange("tipoOutro", e.target.value)}
                  placeholder="Digite o tipo do exame..."
                />
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Data</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={form.data}
                onChange={(e) => handleChange("data", e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-slate-700">Hora</label>
              <input
                type="time"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-6">
              <label className="block text-sm font-semibold text-slate-700">Solicitante</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={form.solicitante}
                onChange={(e) => handleChange("solicitante", e.target.value)}
                placeholder="Ex.: Dr(a). Maria / Professor / Técnico"
                required
              />
            </div>
            <div className="md:col-span-6">
              <label className="block text-sm font-semibold text-slate-700">Observações</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={form.obs}
                onChange={(e) => handleChange("obs", e.target.value)}
                placeholder="Ex.: atleta retornando de lesão..."
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-xl font-bold text-white flex items-center gap-2 shadow-sm transition ${
                saving
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <MdSave />
              {saving ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <MdList className="text-xl text-emerald-600" />
              Exames Registrados
              <span className="ml-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                {filteredLista.length}
              </span>
            </h3>
            <button
              type="button"
              onClick={fetchExames}
              className="text-sm font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800"
              disabled={loading}
            >
              {loading ? "Atualizando..." : "Atualizar lista"}
            </button>
          </div>
          <div className="mb-4 relative">
            <input
              type="text"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Pesquisar por atleta, tipo, solicitante, observação..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {loading ? (
            <div className="text-slate-500 text-sm py-6 text-center">Carregando exames...</div>
          ) : filteredLista.length === 0 ? (
            <div className="text-slate-500 text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
              Nenhum exame encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLista.map((e) => {
                const tipoInfo =
                  e?.tipo === "Outro" ? (e?.tipoOutro || "Outro") : (e?.tipo || "—")
                const dataBR = e?.data
                  ? new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")
                  : "—"
                const hora = e?.time || "—"

                return (
                  <div
                    key={e._id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-extrabold text-slate-900 truncate">
                          {e?.atleta || "—"}
                        </div>
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                          {tipoInfo}
                        </span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-full">
                          {dataBR} • {hora}
                        </span>
                      </div>

                      <div className="text-sm text-slate-700 mt-2">
                        <b>Solicitante:</b> {e?.solicitante || "Não informado"}
                      </div>

                      {e?.obs && (
                        <div className="text-xs text-slate-600 mt-1">
                          <b>Obs:</b> {e.obs}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 text-sm font-semibold flex-shrink-0">
                      <button
                        onClick={() => imprimir(e)}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1"
                      >
                        <MdLocalPrintshop /> Imprimir
                      </button>
                      <button
                        onClick={() => editar(e)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1"
                      >
                        <MdEdit /> Editar
                      </button>
                      <button
                        onClick={() => excluir(e._id)}
                        disabled={saving}
                        className={`px-3 py-2 rounded-xl flex items-center gap-1 ${
                          saving
                            ? "bg-red-100 text-red-400 cursor-not-allowed"
                            : "bg-red-50 hover:bg-red-100 text-red-800"
                        }`}
                      >
                        <MdDelete /> Excluir
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



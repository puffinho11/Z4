import React, { useEffect, useState } from "react"
import api from "../api" 

export default function Registro() {

  const blank = {
    nome: "",
    categoria: "",
    status: "OK",
    treinos: 3,
    lesoes: 0,
    vo2: 50,
    data: new Date().toISOString().slice(0, 10), 
    gols: 0,
    amarelos: 0,
    vermelhos: 0,
  }

  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/registros")
      setLista(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Erro ao carregar registros:", err.response || err)
      setError("Erro ao carregar registros. Verifique o console.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  function handleChange(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function resetForm() {
    setForm(blank)
    setEditingId(null)
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const dataToSend = {
      ...form,
      treinos: parseInt(form.treinos) || 0,
      lesoes: parseInt(form.lesoes) || 0,
      vo2: parseFloat(form.vo2) || 0,
      gols: parseInt(form.gols) || 0,
      amarelos: parseInt(form.amarelos) || 0,
      vermelhos: parseInt(form.vermelhos) || 0,
    }

    try {
      let response
      if (editingId) {

        response = await api.post(`/registros`, { ...dataToSend, id: editingId })
  
        setLista(lista.map(r => r._id === editingId ? response.data : r))
        alert("Registro atualizado com sucesso!")

      } else {

        response = await api.post("/registros", dataToSend)
        
        setLista([...lista, response.data])
        alert("Registro salvo com sucesso!")
      }

      resetForm()

    } catch (err) {
      console.error("Erro ao salvar registro:", err.response || err)
      setError(err.response?.data?.msg || "Erro ao salvar registro. Verifique os dados.")
    } finally {
      setLoading(false)
    }
  }

  function editar(registro) {

    const dataFormatada = new Date(registro.data).toISOString().slice(0, 10)
    
    setForm({
        nome: registro.nome,
        categoria: registro.categoria,
        status: registro.status,
        treinos: registro.treinos || 0,
        lesoes: registro.lesoes || 0,
        vo2: registro.vo2 || 0,
        data: dataFormatada,
        gols: registro.gols || 0,
        amarelos: registro.amarelos || 0,
        vermelhos: registro.vermelhos || 0,
    })
    setEditingId(registro._id)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluir(id) {
    if (window.confirm("Tem certeza que deseja remover este registro?")) {
        setLoading(true)
        setError(null)
        try {
            await api.delete(`/registros/${id}`)
            setLista(lista.filter((r) => r._id !== id))
            alert("Registro excluído com sucesso!")
        } catch (err) {
            console.error("Erro ao excluir:", err.response || err)
            setError("Erro ao excluir registro.")
        } finally {
            setLoading(false)
        }
    }
  }

  return (
    <section className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        {editingId ? "Editar Registro" : "Novo Registro de Monitoramento"}
      </h2>
      <p className="text-gray-600 mb-6">
        Preencha o formulário para registrar ou atualizar os dados de monitoramento de um atleta.
      </p>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Atleta (Nome Completo)</label>
            <input
              id="nome"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              required
              disabled={loading}
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              id="categoria"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={form.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              required
              disabled={loading}
            >
              <option value="" disabled>Selecione a Categoria</option>
              <option value="Sub-7">Sub-7</option>
              <option value="Sub-9">Sub-9</option>
              <option value="Sub-11">Sub-11</option>
              <option value="Sub-13">Sub-13</option>
              <option value="Sub-15">Sub-15</option>
              <option value="Sub-17">Sub-17</option>
              <option value="Adulto">Adulto</option>
            </select>
          </div>
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data do Registro</label>
            <input
              id="data"
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.data}
              onChange={(e) => handleChange("data", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              required
              disabled={loading}
            >
              <option value="OK">OK</option>
              <option value="Recuperação">Recuperação</option>
            </select>
          </div>
          <div>
            <label htmlFor="treinos" className="block text-sm font-medium text-gray-700">Treinos na Semana</label>
            <input
              id="treinos"
              type="number"
              min="0"
              max="7"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.treinos}
              onChange={(e) => handleChange("treinos", parseInt(e.target.value) || 0)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="lesoes" className="block text-sm font-medium text-gray-700">Lesões (Ocorrências)</label>
            <input
              id="lesoes"
              type="number"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.lesoes}
              onChange={(e) => handleChange("lesoes", parseInt(e.target.value) || 0)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="vo2" className="block text-sm font-medium text-gray-700">VO₂ Máx. Estimado</label>
            <input
              id="vo2"
              type="number"
              step="0.1"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.vo2}
              onChange={(e) => handleChange("vo2", parseFloat(e.target.value) || 0)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="gols" className="block text-sm font-medium text-gray-700">Gols Marcados</label>
            <input
              id="gols"
              type="number"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.gols}
              onChange={(e) => handleChange("gols", parseInt(e.target.value) || 0)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="amarelos" className="block text-sm font-medium text-gray-700">Cartões Amarelos</label>
            <input
              id="amarelos"
              type="number"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.amarelos}
              onChange={(e) => handleChange("amarelos", parseInt(e.target.value) || 0)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="vermelhos" className="block text-sm font-medium text-gray-700">Cartões Vermelhos</label>
            <input
              id="vermelhos"
              type="number"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.vermelhos}
              onChange={(e) => handleChange("vermelhos", parseInt(e.target.value) || 0)}
              required
              disabled={loading}
            />
          </div>

        </div>
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-150"
            disabled={loading}
          >
            {editingId ? "Cancelar Edição" : "Limpar Formulário"}
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition duration-150"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : editingId ? (
              "Atualizar Registro"
            ) : (
              "Salvar Registro"
            )}
          </button>
        </div>
      </form>
      <div className="mt-8">
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">
          Registros Salvos ({lista.length})
        </h3>
        
        {loading && lista.length === 0 ? (
            <div className="text-blue-600">Carregando registros...</div>
        ) : (
            <div className="space-y-3">
            {lista.length === 0 && (
                <div className="text-gray-500 p-4 border rounded-lg bg-gray-50 text-center">Nenhum registro encontrado no banco de dados.</div>
            )}
            {lista
                .slice()
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()) 
                .map((r) => (
                <div 
                  key={r._id} 
                  className="p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm hover:shadow-md transition duration-150"
                >
                    <div className="mb-2 sm:mb-0">
                      <div className="font-bold text-gray-800">
                        {r.nome} <span className="text-sm font-normal text-blue-600">({r.categoria})</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                          Data: {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")} 
                          • Status: 
                          <span 
                            className={`font-semibold ml-1 ${r.status === "OK" ? "text-green-600" : "text-yellow-600"}`}
                          >
                            {r.status}
                          </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="font-medium">VO₂: <span className="text-blue-700">{r.vo2}</span></span>
                        <span className="font-medium">Gols: <span className="text-green-700">{r.gols || 0}</span></span>
                        <span className="font-medium">Lesões: <span className="text-red-700">{r.lesoes}</span></span>
                        <span className="font-medium">Amarelos/Vermelhos: <span className="text-yellow-700">{r.amarelos || 0}</span>/<span className="text-red-700">{r.vermelhos || 0}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <button 
                        onClick={() => editar(r)} 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium p-1 rounded transition duration-150" 
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => excluir(r._id)} 
                        className="text-red-600 hover:text-red-800 text-sm font-medium p-1 rounded transition duration-150" 
                        disabled={loading}
                      >
                        Remover
                      </button>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </section>
  )
}

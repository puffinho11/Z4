import React, { useEffect, useState } from "react"
import api from "../api"

export default function Dashboard() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/registros")
      setRegistros(Array.isArray(response.data) ? response.data : []) 
    } catch (err) {
      console.error("Erro ao carregar registros para o Dashboard:", err.response || err)
      
      const status = err.response?.status
      const msg = (status === 401 || status === 403)
        ? "Erro de autenticação. Faça login novamente para ver o dashboard."
        : "Erro ao carregar dados do Dashboard. Verifique a conexão com a API e o console."
      
      setError(msg)
      setRegistros([])
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  const atletasCount = [...new Set(registros.map((r) => r.nome))].length
  
  const ultimos30 = registros.filter((r) => {
    const d = new Date(r.data) 
    const ago = new Date()
    ago.setDate(ago.getDate() - 30)
    return d >= ago
  }).length

  const emRecuperacao = registros.filter((r) => r.status === "Recuperação" || r.status === "Lesão").length

  const totalLesoes = registros.reduce((sum, r) => sum + (Number(r.lesoes) || 0), 0)
  const totalGols = registros.reduce((sum, r) => sum + (Number(r.gols) || 0), 0)
  const totalAmarelos = registros.reduce((sum, r) => sum + (Number(r.amarelos) || 0), 0)
  const totalVermelhos = registros.reduce((sum, r) => sum + (Number(r.vermelhos) || 0), 0)

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Painel de Gestão de Atletas</h2>
      
      {loading && <p className="text-blue-600">Carregando dados...</p>}
      {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</p>}
      
      {(!loading && !error) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
            <p className="text-sm font-medium text-gray-500">Total de Atletas</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{atletasCount}</p>
            <p className="text-xs text-gray-500 mt-2">Atletas únicos registrados</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-600">
            <p className="text-sm font-medium text-gray-500">Registros nos Últimos 30 Dias</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{ultimos30}</p>
            <p className="text-xs text-gray-500 mt-2">Fichas de acompanhamento recentes</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-600">
            <p className="text-sm font-medium text-gray-500">Em Recuperação/Lesão</p>
            <p className="text-3xl font-extrabold text-red-700 mt-1">{emRecuperacao}</p>
            <p className="text-xs text-gray-500 mt-2">Atletas com status "Recuperação" ou "Lesão"</p>
          </div>
        </div>
      )}

      {(!loading && !error) && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl shadow lg:col-span-1">
              <h3 className="text-lg font-semibold mb-3">Resumo Geral de Ocorrências</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Total de Lesões Reportadas</span>
                    <span className="text-lg font-bold text-red-700">{totalLesoes}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Total de Gols (Todos os registros)</span>
                    <span className="text-lg font-bold text-green-700">{totalGols}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-gray-600">Cartões Amarelos</span>
                    <span className="text-lg font-bold text-yellow-700">{totalAmarelos}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cartões Vermelhos</span>
                    <span className="text-lg font-bold text-red-700">{totalVermelhos}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                *O Dashboard exibe os dados consolidados de todos os registros salvos no banco de dados.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
                <h3 className="text-lg font-semibold mb-3">Distribuição de Status Atual</h3>
                <p className="text-gray-500">O gráfico de distribuição de status seria renderizado aqui.</p>
            </div>
            
          </div>
      )}
    </section>
  )
}


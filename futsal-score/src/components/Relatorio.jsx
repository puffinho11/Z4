import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import api from "../api"
import * as XLSX from "xlsx"

export default function Relatorio() {
  const [registros, setRegistros] = useState([])
  const [registrosOriginais, setRegistrosOriginais] = useState([])

  const [filtroCat, setFiltroCat] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [selAtleta, setSelAtleta] = useState("")
  const [metrica, setMetrica] = useState("vo2")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const chartRef = useRef(null)
  const chartInst = useRef(null)

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      // Conflito resolvido: Mantida a chamada à API.
      const response = await api.get("/registros")
      const data = Array.isArray(response.data) ? response.data : []

      setRegistrosOriginais(data)
      setRegistros(data)
      // A montagem do chart será acionada pelo useEffect abaixo, após o setRegistros
      // montarChart(data, metrica, selAtleta) // Esta linha pode ser removida pois o useEffect já fará isso
    } catch (err) {
      console.error("Erro ao carregar registros:", err.response || err)
      const msg = err.response?.status === 403 || err.response?.status === 401
        ? "Acesso negado. Faça login novamente."
        : "Erro ao carregar dados do servidor. Verifique o console."
      setError(msg)
      setRegistrosOriginais([])
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  useEffect(() => {
    aplicarFiltros(registrosOriginais, filtroCat, filtroStatus, selAtleta)
  }, [filtroCat, filtroStatus, selAtleta, registrosOriginais])

  useEffect(() => {
    montarChart(registros, metrica, selAtleta)
  }, [registros, metrica, selAtleta])


  function aplicarFiltros(data, categoria, status, atleta) {
    let filtered = data

    if (categoria) {
      filtered = filtered.filter(r => r.categoria === categoria)
    }
    if (status) {
      filtered = filtered.filter(r => r.status === status)
    }
    if (atleta) {
      filtered = filtered.filter(r => r.nome === atleta)
    }

    setRegistros(filtered)
  }

  function montarChart(data, metricaSelecionada, nomeAtleta) {
    if (chartInst.current) {
      chartInst.current.destroy()
    }

    if (data.length === 0) {
      return
    }

    const chartDataFiltered = nomeAtleta
      ? data.filter(r => r.nome === nomeAtleta && (r[metricaSelecionada] || r[metricaSelecionada] === 0))
      : data.filter(r => (r[metricaSelecionada] || r[metricaSelecionada] === 0))

    const groupedData = chartDataFiltered.reduce((acc, r) => {
      const key = r.nome
      if (!acc[key]) {
        acc[key] = {
          nome: r.nome,
          soma: 0,
          contagem: 0,
        }
      }
      acc[key].soma += (r[metricaSelecionada] || 0)
      acc[key].contagem += 1
      return acc
    }, {})

    const finalData = Object.values(groupedData).map(item => ({
      nome: item.nome,
      valor: metricaSelecionada === 'vo2'
        ? (item.soma / item.contagem).toFixed(2)
        : item.soma
    })).sort((a, b) => b.valor - a.valor) // Conflito de sintaxe resolvido aqui.


    const labels = finalData.map(d => d.nome)
    const values = finalData.map(d => d.valor)

    const chartConfig = {
      labels: labels,
      datasets: [
        {
          label: `Média/Total de ${metricaSelecionada.toUpperCase()}`,
          data: values,
          backgroundColor: metricaSelecionada === 'vo2' ? 'rgba(16, 185, 129, 0.7)' : 'rgba(30, 64, 175, 0.7)',
          borderColor: metricaSelecionada === 'vo2' ? 'rgb(16, 185, 129)' : 'rgb(30, 64, 175)',
          borderWidth: 1,
        }
      ]
    }

    if (chartRef.current) {
      chartInst.current = new Chart(chartRef.current, {
        type: 'bar',
        data: chartConfig,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: metricaSelecionada.toUpperCase() }
            }
          }
        }
      })
    }
  }

  function exportarXLSX() {
    if (registros.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    const dataToExport = registros.map(r => ({
      'Atleta': r.nome,
      'Categoria': r.categoria,
      'Data': new Date(r.data + "T00:00:00").toLocaleDateString('pt-BR'),
      'Status': r.status,
      'Treinos': r.treinos,
      'Lesões': r.lesoes,
      'VO2 Max': r.vo2,
      'Gols': r.gols || 0,
      'Amarelos': r.amarelos || 0,
      'Vermelhos': r.vermelhos || 0,
      'ID': r._id,
      'Criado Em': new Date(r.createdAt).toLocaleString('pt-BR'),
      'Atualizado Em': new Date(r.updatedAt).toLocaleString('pt-BR'),
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros")

    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
    XLSX.writeFile(workbook, `Relatorio_FutsalScore_${dateStr}.xlsx`)
  }

  const categoriasUnicas = [...new Set(registrosOriginais.map(r => r.categoria))].sort()
  const atletasUnicos = [...new Set(registrosOriginais.map(r => r.nome))].sort()

  if (loading) {
    return (
      <section className="text-center py-10">
        <p className="text-xl text-blue-600">Carregando dados para relatórios...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-10">
        <p className="text-xl text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">Relatórios e Análise de Dados</h2>
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Filtros e Exportação</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Filtrar por Categoria</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={filtroCat}
              onChange={(e) => setFiltroCat(e.target.value)}
            >
              <option value="">Todas as Categorias</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filtrar por Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="OK">OK</option>
              <option value="Recuperação">Recuperação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filtrar por Atleta</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={selAtleta}
              onChange={(e) => setSelAtleta(e.target.value)}
            >
              <option value="">Todos os Atletas</option>
              {atletasUnicos.map(atleta => (
                <option key={atleta} value={atleta}>{atleta}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportarXLSX}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Exportar para Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Gráfico de Métrica por Atleta</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Métrica para Análise</label>
          <select
            className="w-full border rounded-lg px-3 py-2 mt-1 md:w-1/3"
            value={metrica}
            onChange={(e) => setMetrica(e.target.value)}
          >
            <option value="vo2">VO₂ Max</option>
            <option value="gols">Gols</option>
            <option value="lesoes">Lesões</option>
            <option value="treinos">Treinos</option>
            <option value="amarelos">Cartões Amarelos</option>
            <option value="vermelhos">Cartões Vermelhos</option>
          </select>
        </div>
        <div className="h-96">
          {registros.length > 0 ? (
            <canvas ref={chartRef} />
          ) : (
            <p className="text-gray-500">Nenhum dado encontrado com os filtros selecionados.</p>
          )}
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Tabela de Registros ({registros.length})</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cat.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Treinos</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lesões</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">VO₂</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gols</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amarelos</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vermelhos</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registros.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="px-3 py-2">{r.nome}</td>
                <td className="px-3 py-2">{r.categoria}</td>
                <td className="px-3 py-2">{new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                <td className="px-3 py-2 text-center">{r.treinos}</td>
                <td className="px-3 py-2 text-center">{r.lesoes}</td>
                <td className="px-3 py-2 text-center">{r.vo2}</td>
                <td className="px-3 py-2 text-center">{r.gols || 0}</td>
                <td className="px-3 py-2 text-center">{r.amarelos || 0}</td>
                <td className="px-3 py-2 text-center">{r.vermelhos || 0}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-sm ${r.status === "OK" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {registros.length === 0 && <div className="text-center py-4 text-gray-500">Nenhum registro encontrado.</div>}
      </div>
    </section>
  )
}

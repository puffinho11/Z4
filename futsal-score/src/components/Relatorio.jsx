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
      const response = await api.get("/registros")
      const data = Array.isArray(response.data) ? response.data : []
      
      setRegistrosOriginais(data)
      setRegistros(data)
      montarChart(data, metrica, selAtleta)
      
    } catch (err) {
      console.error("Erro ao carregar registros para o Relatório:", err.response || err)
      const msg = "Erro ao carregar dados. Verifique sua conexão e login."
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
    montarChart(registros, metrica, selAtleta)
  }, [registros, metrica, selAtleta])


  function aplicarFiltros() {
    let regs = registrosOriginais

    if (filtroCat) {
      regs = regs.filter((r) => r.categoria === filtroCat)
    }
    if (filtroStatus) {
      regs = regs.filter((r) => r.status === filtroStatus)
    }

    setRegistros(regs)
    setSelAtleta("")
  }

  function limparFiltros() {
    setFiltroCat("")
    setFiltroStatus("")
    setSelAtleta("")
    setRegistros(registrosOriginais) 
  }
  
  const atletasUnicos = [...new Set(registrosOriginais.map(r => r.nome))].sort()

  const categoriasUnicas = [...new Set(registrosOriginais.map(r => r.categoria))].filter(c => c).sort()


  function exportExcel() {
    const data = registros.map((r) => ({
      Nome: r.nome,
      Categoria: r.categoria,
      Status: r.status,
      Data: new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR"),
      "Treinos/Semana": Number(r.treinos) || 0,
      "VO₂ Máximo": Number(r.vo2) || 0,
      Lesões: Number(r.lesoes) || 0,
      Gols: Number(r.gols) || 0,
      Amarelos: Number(r.amarelos) || 0,
      Vermelhos: Number(r.vermelhos) || 0,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Relatório FutsalScore")
    XLSX.writeFile(wb, "relatorio_futsalscore.xlsx")
  }
  
  function montarChart(regs, metricaAtual, atletaSelecionado) {
    const ctx = chartRef.current?.getContext("2d")
    if (!ctx) return
    if (chartInst.current) chartInst.current.destroy()

    let dados = regs

    if (atletaSelecionado) {
      dados = regs.filter(r => r.nome === atletaSelecionado)
    }
  
    dados = dados.slice().sort((a, b) => new Date(a.data) - new Date(b.data))

    const labels = dados.map((r) => new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR"))
    const data = dados.map((r) => Number(r[metricaAtual] || 0))
    const title = atletaSelecionado ? `Evolução de ${metricaAtual.toUpperCase()} para ${atletaSelecionado}` : 'Selecione um atleta para o gráfico'

    if(labels.length === 0 && atletaSelecionado) {
        labels.push("Nenhum dado encontrado")
        data.push(0);
    }


    chartInst.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: metricaAtual.toUpperCase(),
            data: data,
            borderColor: metricaAtual === 'lesoes' ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: title,
          },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
      },
    })
  }

  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">Relatórios e Análise de Dados</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-3">Filtros de Dados</h3>
        <div className="grid md:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="block text-sm">Filtrar Categoria</label>
            <select
              value={filtroCat}
              onChange={(e) => setFiltroCat(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Todas as Categorias</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Filtrar Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Todos os Status</option>
              <option>OK</option>
              <option>Recuperação</option>
            </select>
          </div>
          
          <button
            onClick={aplicarFiltros}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            disabled={loading}
          >
            Aplicar Filtros
          </button>
          <button
            onClick={limparFiltros}
            className="px-4 py-2 border rounded-lg disabled:bg-gray-200"
            disabled={loading}
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-4">Gráfico de Evolução por Atleta</h3>
        <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <div>
                    <label className="block text-sm">Selecionar Atleta</label>
                    <select
                        value={selAtleta}
                        onChange={(e) => setSelAtleta(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="">Selecione um atleta</option>
                        {atletasUnicos.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm">Métrica</label>
                    <select
                        value={metrica}
                        onChange={(e) => setMetrica(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="vo2">VO₂ Máximo</option>
                        <option value="treinos">Treinos/Semana</option>
                        <option value="lesoes">Lesões</option>
                        <option value="gols">Gols</option>
                        <option value="amarelos">Cartões Amarelos</option>
                        <option value="vermelhos">Cartões Vermelhos</option>
                    </select>
                </div>
            </div>
            <div className="p-2 border rounded-lg">
              <canvas ref={chartRef} height="120" />
            </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Tabela de Dados ({registros.length} registros)</h3>
          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm disabled:bg-gray-400"
            disabled={loading || registros.length === 0}
          >
            Exportar para Excel (.xlsx)
          </button>
        </div>

        {loading && <div className="text-blue-600">Carregando dados...</div>}
        
        {!loading && registros.length === 0 && (
            <div className="text-gray-500 text-center py-4">
                Nenhum registro encontrado com os filtros aplicados.
            </div>
        )}

        {!loading && registros.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Nome</th>
                  <th className="px-3 py-2 text-left">Categoria</th>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-center">Treinos/Semana</th>
                  <th className="px-3 py-2 text-center">Lesões</th>
                  <th className="px-3 py-2 text-center">VO₂ Máximo</th>
                  <th className="px-3 py-2 text-center">Gols</th>
                  <th className="px-3 py-2 text-center">Amarelos</th>
                  <th className="px-3 py-2 text-center">Vermelhos</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
          </div>
        )}
      </div>

    </section>
  )
}


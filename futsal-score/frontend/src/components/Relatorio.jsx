import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import api from "../api"
import * as XLSX from "xlsx"
import {
  MdInsertChart,
  MdFilterList,
  MdBarChart,
  MdOutlineTableChart,
  MdFileDownload,
} from "react-icons/md"

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
    } catch (err) {
      setError("Erro ao carregar dados. Verifique sua conexão.")
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
    if (categoria) filtered = filtered.filter((r) => r.categoria === categoria)
    if (status) filtered = filtered.filter((r) => r.status === status)
    if (atleta) filtered = filtered.filter((r) => r.nome === atleta)
    setRegistros(filtered)
  }

  function montarChart(data, metricaSelecionada, nomeAtleta) {
    if (chartInst.current) chartInst.current.destroy()
    if (data.length === 0) return

    const chartDataFiltered = nomeAtleta
      ? data.filter((r) => r.nome === nomeAtleta)
      : data

    const groupedData = chartDataFiltered.reduce((acc, r) => {
      const key = r.nome
      if (!acc[key]) acc[key] = { soma: 0, contagem: 0 }
      acc[key].soma += r[metricaSelecionada] || 0
      acc[key].contagem += 1
      return acc
    }, {})

    const finalData = Object.keys(groupedData)
      .map((nome) => ({
        nome,
        valor:
          metricaSelecionada === "vo2"
            ? (groupedData[nome].soma / groupedData[nome].contagem).toFixed(2)
            : groupedData[nome].soma,
      }))
      .sort((a, b) => b.valor - a.valor)

    const ctx = chartRef.current?.getContext("2d")
    if (!ctx) return

    chartInst.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: finalData.map((d) => d.nome),
        datasets: [
          {
            label: `Média/Total de ${metricaSelecionada.toUpperCase()}`,
            data: finalData.map((d) => d.valor),
            backgroundColor: "rgba(16,185,129,0.7)",
            borderColor: "rgb(5,150,105)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // CORRIGIDO
        scales: {
          y: { beginAtZero: true },
        },
      },
    })
  }

  function exportarXLSX() {
    if (registros.length === 0) return alert("Nenhum dado para exportar.")

    const dataToExport = registros.map((r) => ({
      Atleta: r.nome,
      Categoria: r.categoria,
      Data: new Date(r.data).toLocaleDateString("pt-BR"),
      Status: r.status,
      Treinos: r.treinos,
      Lesões: r.lesoes,
      "VO₂ Max": r.vo2,
      Gols: r.gols,
      Amarelos: r.amarelos,
      Vermelhos: r.vermelhos,
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório")

    XLSX.writeFile(workbook, `Relatorio_FutsalScore_${Date.now()}.xlsx`)
  }

  const categorias = [...new Set(registrosOriginais.map((r) => r.categoria))]
  const atletas = [...new Set(registrosOriginais.map((r) => r.nome))]

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-emerald-600 text-lg font-semibold">
        Carregando dados...
      </div>
    )

  if (error)
    return <div className="text-center text-red-600 mt-10 font-medium">{error}</div>

  return (
    <section className="p-6 bg-white min-h-screen w-full">

      <h2 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
        <MdInsertChart className="text-4xl text-emerald-600" />
        Relatórios e Análise de Dados
      </h2>

      <p className="text-gray-600 mb-6">
        Gere relatórios visuais e exporte estatísticas dos atletas.
      </p>

      {/* FILTROS */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-emerald-100 mb-8 w-full">
        <h3 className="text-lg font-semibold text-emerald-800 border-b pb-2 mb-4 flex items-center gap-2">
          <MdFilterList className="text-xl text-emerald-600" /> Filtros e Exportação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div>
            <label className="block text-sm font-semibold text-gray-700">Categoria</label>
            <select
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-emerald-500 border-emerald-300"
              value={filtroCat}
              onChange={(e) => setFiltroCat(e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Status</label>
            <select
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-emerald-500 border-emerald-300"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="OK">OK</option>
              <option value="Recuperação">Recuperação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Atleta</label>
            <select
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-emerald-500 border-emerald-300"
              value={selAtleta}
              onChange={(e) => setSelAtleta(e.target.value)}
            >
              <option value="">Todos</option>
              {atletas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportarXLSX}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-semibold"
            >
              <MdFileDownload className="text-xl" /> Exportar Excel
            </button>
          </div>

        </div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-emerald-100 mb-8 w-full">
        <h3 className="text-lg font-semibold text-emerald-800 border-b pb-2 mb-4 flex items-center gap-2">
          <MdBarChart className="text-xl text-emerald-600" /> Gráfico Comparativo
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Métrica para análise
          </label>

          <select
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 md:w-1/3 border-emerald-300"
            value={metrica}
            onChange={(e) => setMetrica(e.target.value)}
          >
            <option value="vo2">VO₂ Máx.</option>
            <option value="gols">Gols</option>
            <option value="lesoes">Lesões</option>
            <option value="treinos">Treinos</option>
            <option value="amarelos">Cartões Amarelos</option>
            <option value="vermelhos">Cartões Vermelhos</option>
          </select>
        </div>

        {/* 🔥 CORREÇÃO DO PROBLEMA AQUI */}
        <div className="w-full min-h-[260px] h-[350px] md:h-[420px]">
          {registros.length > 0 ? (
            <canvas ref={chartRef} />
          ) : (
            <p className="text-gray-500 text-center mt-8">Nenhum dado encontrado.</p>
          )}
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-emerald-100 overflow-x-auto w-full">
        <h3 className="text-lg font-semibold text-emerald-800 border-b pb-2 mb-4 flex items-center gap-2">
          <MdOutlineTableChart className="text-xl text-emerald-600" /> Tabela de Registros ({registros.length})
        </h3>

        {registros.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Nenhum registro encontrado.</p>
        ) : (
          <table className="min-w-full divide-y divide-emerald-100">
            <thead className="bg-emerald-50">
              <tr>
                {[
                  "Nome",
                  "Categoria",
                  "Data",
                  "Treinos",
                  "Lesões",
                  "VO₂",
                  "Gols",
                  "Amarelos",
                  "Vermelhos",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-emerald-100">
              {registros.map((r) => (
                <tr key={r._id} className="hover:bg-emerald-50">
                  <td className="px-3 py-2">{r.nome}</td>
                  <td className="px-3 py-2">{r.categoria}</td>
                  <td className="px-3 py-2">
                    {new Date(r.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-2 text-center">{r.treinos}</td>
                  <td className="px-3 py-2 text-center">{r.lesoes}</td>
                  <td className="px-3 py-2 text-center">{r.vo2}</td>
                  <td className="px-3 py-2 text-center">{r.gols}</td>
                  <td className="px-3 py-2 text-center">{r.amarelos}</td>
                  <td className="px-3 py-2 text-center">{r.vermelhos}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        r.status === "OK"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </section>
  )
}




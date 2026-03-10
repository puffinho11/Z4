import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import api from "../api"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
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
    montarChartTela(registros, metrica, selAtleta)

    return () => {
      if (chartInst.current) {
        chartInst.current.destroy()
        chartInst.current = null
      }
    }
  }, [registros, metrica, selAtleta])

  function aplicarFiltros(data, categoria, status, atleta) {
    let filtered = [...data]

    if (categoria) filtered = filtered.filter((r) => r.categoria === categoria)
    if (status) filtered = filtered.filter((r) => r.status === status)
    if (atleta) filtered = filtered.filter((r) => r.nome === atleta)

    setRegistros(filtered)
  }

  function agruparPorMetrica(data, metricaSelecionada) {
    const groupedData = data.reduce((acc, r) => {
      const key = r.nome || "Sem nome"

      if (!acc[key]) acc[key] = { soma: 0, contagem: 0 }

      acc[key].soma += Number(r[metricaSelecionada]) || 0
      acc[key].contagem += 1

      return acc
    }, {})

    return Object.keys(groupedData)
      .map((nome) => ({
        nome,
        valor:
          metricaSelecionada === "vo2"
            ? Number((groupedData[nome].soma / groupedData[nome].contagem).toFixed(2))
            : groupedData[nome].soma,
      }))
      .sort((a, b) => b.valor - a.valor)
  }

  function montarChartTela(data, metricaSelecionada, nomeAtleta) {
    if (chartInst.current) {
      chartInst.current.destroy()
      chartInst.current = null
    }

    if (!chartRef.current || data.length === 0) return

    const chartDataFiltered = nomeAtleta
      ? data.filter((r) => r.nome === nomeAtleta)
      : data

    const finalData = agruparPorMetrica(chartDataFiltered, metricaSelecionada)

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInst.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: finalData.map((d) => d.nome),
        datasets: [
          {
            label: `Média/Total de ${metricaSelecionada.toUpperCase()}`,
            data: finalData.map((d) => d.valor),
            backgroundColor: "rgba(16,185,129,0.75)",
            borderColor: "rgb(5,150,105)",
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: true,
        plugins: {
          legend: {
            labels: {
              color: "#065f46",
              font: {
                weight: "bold",
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#374151",
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#374151",
            },
          },
        },
      },
    })
  }

  function contarStatus(data) {
    return data.reduce(
      (acc, r) => {
        if (r.status === "OK") acc.ok += 1
        else acc.recuperacao += 1
        return acc
      },
      { ok: 0, recuperacao: 0 }
    )
  }

  function contarCategorias(data) {
    const categoriasObj = data.reduce((acc, r) => {
      const cat = r.categoria || "Sem categoria"
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    return {
      labels: Object.keys(categoriasObj),
      valores: Object.values(categoriasObj),
    }
  }

  function criarCanvasBranco(largura = 900, altura = 420) {
    const canvas = document.createElement("canvas")
    canvas.width = largura
    canvas.height = altura

    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, largura, altura)

    return { canvas, ctx }
  }

  function gerarGraficoPizzaPDF(labels, valores, titulo) {
    const { canvas, ctx } = criarCanvasBranco(500, 320)

    const grafico = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: valores,
            backgroundColor: [
              "#10b981",
              "#f59e0b",
              "#3b82f6",
              "#8b5cf6",
              "#ef4444",
              "#14b8a6",
              "#f97316",
              "#06b6d4",
            ],
            borderColor: "#ffffff",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        cutout: "58%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#1f2937",
              font: { size: 11 },
              padding: 14,
            },
          },
          title: {
            display: true,
            text: titulo,
            color: "#111827",
            font: { size: 15, weight: "bold" },
          },
        },
      },
    })

    const img = canvas.toDataURL("image/png", 1.0)
    grafico.destroy()
    return img
  }

  function gerarGraficoBarraPDF(data, metricaSelecionada) {
    const { canvas, ctx } = criarCanvasBranco(950, 420)

    const grafico = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.nome),
        datasets: [
          {
            label: `Métrica: ${metricaSelecionada.toUpperCase()}`,
            data: data.map((d) => d.valor),
            backgroundColor: "#10b981",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#1f2937",
              font: { size: 12 },
            },
          },
          title: {
            display: true,
            text: "Desempenho por Atleta",
            color: "#111827",
            font: { size: 16, weight: "bold" },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#374151",
              font: { size: 11 },
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#374151",
              font: { size: 11 },
            },
            grid: {
              color: "#e5e7eb",
            },
          },
        },
      },
    })

    const img = canvas.toDataURL("image/png", 1.0)
    grafico.destroy()
    return img
  }

  function addResumoBox(pdf, x, y, w, h, titulo, valor, corFundo = [240, 253, 250]) {
    pdf.setFillColor(...corFundo)
    pdf.roundedRect(x, y, w, h, 4, 4, "F")

    pdf.setTextColor(31, 41, 55)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text(String(titulo), x + 4, y + 7)

    pdf.setTextColor(5, 150, 105)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.text(String(valor), x + 4, y + 16)
  }

  async function exportarPDF() {
    if (registros.length === 0) {
      alert("Nenhum dado para exportar.")
      return
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const larguraPagina = pdf.internal.pageSize.getWidth()
      const alturaPagina = pdf.internal.pageSize.getHeight()
      const margem = 12

      const dadosBarra = agruparPorMetrica(registros, metrica)
      const statusResumo = contarStatus(registros)
      const categoriasResumo = contarCategorias(registros)

      const totalAtletas = new Set(registros.map((r) => r.nome)).size
      const totalRegistros = registros.length

      const mediaVO2 =
        registros.length > 0
          ? (
              registros.reduce((acc, r) => acc + (Number(r.vo2) || 0), 0) / registros.length
            ).toFixed(2)
          : "0.00"

      const totalGols = registros.reduce((acc, r) => acc + (Number(r.gols) || 0), 0)

      const graficoStatus = gerarGraficoPizzaPDF(
        ["OK", "Recuperação"],
        [statusResumo.ok, statusResumo.recuperacao],
        "Distribuição por Status"
      )

      const graficoCategorias = gerarGraficoPizzaPDF(
        categoriasResumo.labels.length ? categoriasResumo.labels : ["Sem dados"],
        categoriasResumo.valores.length ? categoriasResumo.valores : [1],
        "Distribuição por Categoria"
      )

      const graficoBarra = gerarGraficoBarraPDF(
        dadosBarra.length ? dadosBarra : [{ nome: "Sem dados", valor: 0 }],
        metrica
      )

      pdf.setFillColor(5, 150, 105)
      pdf.rect(0, 0, larguraPagina, 26, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(18)
      pdf.text("Relatório de Desempenho dos Atletas", margem, 12)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, margem, 19)

      pdf.setTextColor(31, 41, 55)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(11)
      pdf.text("Filtros aplicados", margem, 34)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.text(
        [
          filtroCat ? `Categoria: ${filtroCat}` : "Categoria: Todas",
          filtroStatus ? `Status: ${filtroStatus}` : "Status: Todos",
          selAtleta ? `Atleta: ${selAtleta}` : "Atleta: Todos",
          `Métrica: ${metrica.toUpperCase()}`,
        ].join(" | "),
        margem,
        40
      )

      addResumoBox(pdf, 12, 46, 42, 22, "Total de atletas", totalAtletas)
      addResumoBox(pdf, 58, 46, 42, 22, "Total de registros", totalRegistros)
      addResumoBox(pdf, 104, 46, 42, 22, "Média VO₂", mediaVO2)
      addResumoBox(pdf, 150, 46, 48, 22, "Total de gols", totalGols)

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(12)
      pdf.setTextColor(17, 24, 39)
      pdf.text("Indicadores Visuais", margem, 78)

      pdf.addImage(graficoStatus, "PNG", 12, 82, 88, 56)
      pdf.addImage(graficoCategorias, "PNG", 110, 82, 88, 56)

      pdf.text("Gráfico Comparativo", margem, 148)
      pdf.addImage(graficoBarra, "PNG", 12, 152, 186, 70)

      pdf.addPage()

      pdf.setFillColor(5, 150, 105)
      pdf.rect(0, 0, larguraPagina, 20, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(15)
      pdf.text("Tabela de Registros", margem, 13)

      const linhasTabela = registros.map((r) => [
        r.nome || "-",
        r.categoria || "-",
        r.data ? new Date(r.data).toLocaleDateString("pt-BR") : "-",
        r.treinos ?? 0,
        r.lesoes ?? 0,
        r.vo2 ?? 0,
        r.gols ?? 0,
        r.amarelos ?? 0,
        r.vermelhos ?? 0,
        r.status || "-",
      ])

      autoTable(pdf, {
        startY: 28,
        head: [[
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
        ]],
        body: linhasTabela,
        margin: { left: 10, right: 10 },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          textColor: [31, 41, 55],
          lineColor: [229, 231, 235],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        didDrawPage: (data) => {
          pdf.setFontSize(9)
          pdf.setTextColor(107, 114, 128)
          pdf.text(`Página ${data.pageNumber}`, larguraPagina - 28, alturaPagina - 6)
        },
      })

      pdf.save(`Relatorio_FutsalScore_${Date.now()}.pdf`)
    } catch (err) {
      console.error(err)
      alert("Erro ao gerar PDF.")
    }
  }

  const categorias = [...new Set(registrosOriginais.map((r) => r.categoria).filter(Boolean))]
  const atletas = [...new Set(registrosOriginais.map((r) => r.nome).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-emerald-600 text-lg font-semibold">
        Carregando dados...
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10 font-medium">{error}</div>
  }

  return (
    <section className="p-6 bg-white min-h-screen w-full">
      <h2 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center gap-2">
        <MdInsertChart className="text-4xl text-emerald-600" />
        Relatórios e Análise de Dados
      </h2>

      <p className="text-gray-600 mb-6">
        Gere relatórios visuais e exporte estatísticas dos atletas.
      </p>

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
                <option key={c} value={c}>
                  {c}
                </option>
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
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportarPDF}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-semibold"
            >
              <MdFileDownload className="text-xl" /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

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

        <div className="w-full min-h-[260px] h-[350px] md:h-[420px]">
          {registros.length > 0 ? (
            <canvas ref={chartRef} />
          ) : (
            <p className="text-gray-500 text-center mt-8">Nenhum dado encontrado.</p>
          )}
        </div>
      </div>

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
                    {r.data ? new Date(r.data).toLocaleDateString("pt-BR") : "-"}
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



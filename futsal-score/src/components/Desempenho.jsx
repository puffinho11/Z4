import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import api from "../api"

export default function Desempenho() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [atletaSelecionado, setAtletaSelecionado] = useState("")

  const catChartRef = useRef(null)
  const atletaChartRef = useRef(null)
  const catInst = useRef(null)
  const atInst = useRef(null)

  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true)
      try {
        const response = await api.get("/registros");
        const data = Array.isArray(response.data) ? response.data : []
        setRegistros(data)

        if (data.length > 0) {
          setAtletaSelecionado([...new Set(data.map((r) => r.nome))][0])
        }

        setTimeout(() => montarChartCategoria(data), 200)
      } catch (err) {
        console.error("Erro ao carregar registros:", err)
        setError("Erro ao carregar dados de desempenho.")
      } finally {
        setLoading(false)
      }
    }

    fetchRegistros()
  }, [])

  function montarChartCategoria(data) {
    if (!catChartRef.current) return
    if (catInst.current) catInst.current.destroy()

    const categorias = [...new Set(data.map((r) => r.categoria))]
    const totals = categorias.map((cat) => {
      const catData = data.filter((r) => r.categoria === cat)
      return {
        treinos: catData.reduce((acc, r) => acc + (r.treinos || 0), 0),
        lesoes: catData.reduce((acc, r) => acc + (r.lesoes || 0), 0),
      }
    })

    const ctx = catChartRef.current.getContext("2d")
    if (!ctx) return

    catInst.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: categorias,
        datasets: [
          {
            label: "Treinos",
            data: totals.map((t) => t.treinos),
            backgroundColor: "rgba(37, 99, 235, 0.8)",
            borderRadius: 8,
          },
          {
            label: "Lesões",
            data: totals.map((t) => t.lesoes),
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#e5e7eb" },
          },
          x: { grid: { display: false } },
        },
      },
    })
  }

  function montarChartAtletas(data, nomeAtleta) {
    if (!atletaChartRef.current || !nomeAtleta) return
    if (atInst.current) atInst.current.destroy()

    const atletaData = data
      .filter((r) => r.nome === nomeAtleta && r.vo2)
      .filter((r) => !isNaN(new Date(r.data)))
      .sort((a, b) => new Date(a.data) - new Date(b.data))

    if (atletaData.length === 0) return

    const ctx = atletaChartRef.current.getContext("2d")
    if (!ctx) return

    atInst.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: atletaData.map((r) =>
          new Date(r.data).toLocaleDateString("pt-BR")
        ),
        datasets: [
          {
            label: "VO₂ Máx.",
            data: atletaData.map((r) => r.vo2),
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.3)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "VO₂" },
            grid: { color: "#e5e7eb" },
          },
          x: { grid: { display: false } },
        },
      },
    })
  }

  useEffect(() => {
    if (registros.length > 0 && atletaSelecionado) {
      setTimeout(() => montarChartAtletas(registros, atletaSelecionado), 300)
    }
  }, [atletaSelecionado, registros])

  const atletasUnicos = [...new Set(registros.map((r) => r.nome))]

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 text-lg font-semibold">
        Carregando dados...
      </div>
    )

  if (error)
    return (
      <div className="text-center text-red-600 mt-10 font-medium">{error}</div>
    )

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-800 mb-2">
        📈 Desempenho e Monitoramento
      </h2>
      <p className="text-gray-500 mb-6">
        Acompanhe métricas de treino, lesões e desempenho por atleta e categoria.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Treinos x Lesões por Categoria
          </h3>
          <canvas ref={catChartRef} className="h-96 w-full" />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Evolução de VO₂ Máx.
          </h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={atletaSelecionado}
            onChange={(e) => setAtletaSelecionado(e.target.value)}
          >
            {atletasUnicos.map((nome) => (
              <option key={nome}>{nome}</option>
            ))}
          </select>
          <canvas ref={atletaChartRef} className="h-64 w-full" />
        </div>
      </div>
      <div className="bg-white p-6 mt-8 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          📋 Dados Brutos ({registros.length})
        </h3>
        <div className="divide-y divide-gray-200">
          {registros.length === 0 ? (
            <p className="text-gray-500">Nenhum registro encontrado.</p>
          ) : (
            registros.map((r) => (
              <div
                key={r._id}
                className="py-3 flex justify-between items-center flex-wrap text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <div>
                  <span className="font-semibold text-gray-800">{r.nome}</span>{" "}
                  <span className="text-gray-500">({r.categoria})</span>
                  <div className="text-xs text-gray-500">
                    {new Date(r.data).toLocaleDateString("pt-BR")} —{" "}
                    <span
                      className={`font-medium ${
                        r.status === "OK"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {r.status || "OK"}
                    </span>
                  </div>
                </div>
                <div className="text-right space-x-3">
                  <span className="text-blue-600 font-medium">
                    VO₂: {r.vo2}
                  </span>
                  <span className="text-green-600 font-medium">
                    Gols: {r.gols || 0}
                  </span>
                  <span className="text-red-600 font-medium">
                    Lesões: {r.lesoes || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}






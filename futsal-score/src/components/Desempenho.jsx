import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import api from "../api"

export default function Desempenho() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const catChartRef = useRef(null)
  const atletaChartRef = useRef(null)
  const catInst = useRef(null)
  const atInst = useRef(null)

  const [atletaSelecionado, setAtletaSelecionado] = useState('')

  async function fetchRegistros() {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/registros")
      const data = Array.isArray(response.data) ? response.data : []

      setRegistros(data)
      montarChartCategoria(data)
      const primeiroAtleta = [...new Set(data.map(r => r.nome))][0] || ''
      setAtletaSelecionado(primeiroAtleta)
      montarChartAtletas(data, primeiroAtleta)
    } catch (err) {
      console.error("Erro ao carregar registros para Desempenho:", err.response || err)
      const status = err.response?.status
      const msg =
        status === 401 || status === 403
          ? "Erro de autenticação. Faça login novamente para ver o dashboard."
          : "Erro ao carregar dados do Desempenho. Verifique a conexão com a API e o console."
      setError(msg)
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  function montarChartCategoria(data) {
    if (catInst.current) {
      catInst.current.destroy()
    }

    const categories = [...new Set(data.map(r => r.categoria))]
    const totals = categories.map(cat => {
      const catData = data.filter(r => r.categoria === cat)
      return {
        treinos: catData.reduce((acc, r) => acc + (r.treinos || 0), 0),
        lesoes: catData.reduce((acc, r) => acc + (r.lesoes || 0), 0),
      }
    })

    const chartData = {
      labels: categories,
      datasets: [
        {
          label: "Treinos (Total)",
          data: totals.map(t => t.treinos),
          backgroundColor: "rgba(30, 64, 175, 0.7)", 
        },
        {
          label: "Lesões (Total)",
          data: totals.map(t => t.lesoes),
          backgroundColor: "rgba(220, 38, 38, 0.7)", 
        },
      ],
    }

    if (catChartRef.current) {
      catInst.current = new Chart(catChartRef.current, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }
  }
  function montarChartAtletas(data, nomeAtleta) {
    if (atInst.current) {
      atInst.current.destroy()
    }

    if (!nomeAtleta || data.length === 0) {
      return
    }

    const atletaData = data
      .filter(r => r.nome === nomeAtleta && r.vo2 > 0)
      .sort((a, b) => new Date(a.data) - new Date(b.data)) 

    const chartData = {
      labels: atletaData.map(r =>
        new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")
      ),
      datasets: [
        {
          label: "VO₂ Max",
          data: atletaData.map(r => r.vo2),
          borderColor: "rgb(16, 185, 129)", 
          backgroundColor: "rgba(16, 185, 129, 0.5)",
          tension: 0.1,
        },
      ],
    }

    if (atletaChartRef.current) {
      atInst.current = new Chart(atletaChartRef.current, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "VO₂ Max" },
            },
          },
        },
      })
    }
  }

  useEffect(() => {
    montarChartAtletas(registros, atletaSelecionado)
  }, [atletaSelecionado, registros])

  const atletasUnicos = [...new Set(registros.map(r => r.nome))].sort()

  if (loading) {
    return (
      <section className="text-center py-10">
        <p className="text-xl text-blue-600">
          Carregando dados de desempenho...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="text-center py-10">
        <p className="text-xl text-red-600">{error}</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Análise de Desempenho e Monitoramento
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
          <h3 className="text-lg font-semibold mb-3">
            Treinos e Lesões por Categoria
          </h3>
          <div className="h-96">
            <canvas ref={catChartRef} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">VO₂ Max por Data</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Atleta
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={atletaSelecionado}
              onChange={e => setAtletaSelecionado(e.target.value)}
            >
              {atletasUnicos.map(nome => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64">
            {atletaSelecionado ? (
              <div className="h-full">
                <canvas ref={atletaChartRef} />
              </div>
            ) : (
              <p className="text-gray-500">
                Selecione um atleta ou não há registros de monitoramento para
                este atleta.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h3 className="font-semibold mb-2">
          Dados brutos do monitoramento ({registros.length} registros)
        </h3>
        <div className="text-sm text-gray-700 max-h-96 overflow-y-auto">
          {registros.length === 0 && (
            <div className="text-gray-500">Nenhum registro encontrado.</div>
          )}

          {registros
            .slice()
            .reverse()
            .map(r => (
              <div
                key={r._id}
                className="border-b py-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {r.nome}{" "}
                    <span className="text-xs text-gray-500">
                      ({r.categoria})
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(r.data + "T00:00:00").toLocaleDateString(
                      "pt-BR"
                    )}{" "}
                    • Status: {r.status}
                  </div>
                </div>
                <div className="text-right space-x-3 text-sm">
                  <span className="text-blue-600">VO₂: {r.vo2}</span>
                  <span className="text-green-600">Gols: {r.gols || 0}</span>
                  <span className="text-red-600">Lesões: {r.lesoes}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}



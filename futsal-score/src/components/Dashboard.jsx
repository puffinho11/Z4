import React, { useEffect, useState } from "react"
import { getItem } from "../utils/storage"

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    setRegistros(getItem("monitoramento_atletas_v1", []))
  }, [])

  const atletasCount = [...new Set(registros.map((r) => r.nome))].length
  const ultimos30 = registros.filter((r) => {
    const d = new Date(r.data)
    const ago = new Date()
    ago.setDate(ago.getDate() - 30)
    return d >= ago
  }).length

  const emRecuperacao = registros.filter((r) => r.status === "Recuperação")
    .length

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl shadow p-6 fade-in-up">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4">
            <h3 className="text-sm text-gray-500">Atletas cadastrados</h3>
            <p className="text-3xl font-bold mt-2">{atletasCount}</p>
          </div>
          <div className="p-4">
            <h3 className="text-sm text-gray-500">Registros últimos 30 dias</h3>
            <p className="text-3xl font-bold mt-2">{ultimos30}</p>
          </div>
          <div className="p-4">
            <h3 className="text-sm text-gray-500">Em recuperação</h3>
            <p className="text-3xl font-bold mt-2">{emRecuperacao}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-3">Últimos registros</h3>
          <div className="text-sm text-gray-700">
            {registros.length === 0 && (
              <p className="text-gray-400">Nenhum registro salvo ainda.</p>
            )}
            {registros
              .slice()
              .reverse()
              .slice(0, 6)
              .map((r) => (
                <div key={r.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{r.nome}</div>
                      <div className="text-xs text-gray-500">{r.categoria}</div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-3">Resumo rápido</h3>
          <p className="text-sm text-gray-600">
            Use as telas de <strong>Registrar</strong> e <strong>Relatórios</strong>{" "}
            para adicionar e analisar dados.
          </p>
        </div>
      </div>
    </section>
  )
}


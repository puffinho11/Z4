import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchRegistros() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/registros");
      setRegistros(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erro ao carregar registros para o Dashboard:", err.response || err);
      const status = err.response?.status;
      const msg =
        status === 401 || status === 403
          ? "Erro de autenticação. Faça login novamente para ver o dashboard."
          : "Erro ao carregar dados do Dashboard. Verifique a conexão com a API e o console.";
      setError(msg);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistros();
  }, []);

  const atletasCount = [...new Set(registros.map((r) => r.nome))].length;
  const ultimos30 = registros.filter((r) => {
    const d = new Date(r.data);
    const ago = new Date();
    ago.setDate(ago.getDate() - 30);
    return d >= ago;
  }).length;
  const emRecuperacao = registros.filter((r) => r.status === "Recuperação" || r.status === "Lesão").length;
  const totalLesoes = registros.reduce((sum, r) => sum + (Number(r.lesoes) || 0), 0);
  const totalGols = registros.reduce((sum, r) => sum + (Number(r.gols) || 0), 0);
  const totalAmarelos = registros.reduce((sum, r) => sum + (Number(r.amarelos) || 0), 0);
  const totalVermelhos = registros.reduce((sum, r) => sum + (Number(r.vermelhos) || 0), 0);

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Painel de Gestão de Atletas</h2>

      {loading && <p className="text-blue-600">Carregando dados...</p>}
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Total de Atletas" value={atletasCount} color="blue" subtitle="Atletas únicos registrados" />
            <Card
              title="Registros nos Últimos 30 Dias"
              value={ultimos30}
              color="purple"
              subtitle="Fichas de acompanhamento recentes"
            />
            <Card
              title="Em Recuperação/Lesão"
              value={emRecuperacao}
              color="red"
              subtitle='Atletas com status "Recuperação" ou "Lesão"'
            />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow lg:col-span-1">
              <h3 className="text-lg font-semibold mb-3">Resumo Geral de Ocorrências</h3>

              <ResumoItem label="Total de Lesões Reportadas" value={totalLesoes} color="red" />
              <ResumoItem label="Total de Gols" value={totalGols} color="green" />
              <ResumoItem label="Cartões Amarelos" value={totalAmarelos} color="yellow" />
              <ResumoItem label="Cartões Vermelhos" value={totalVermelhos} color="red" />

              <p className="text-xs text-gray-500 mt-4">
                *O Dashboard exibe os dados consolidados de todos os registros salvos no banco de dados.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Distribuição de Status Atual</h3>
              <p className="text-gray-500">O gráfico de distribuição de status seria renderizado aqui.</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Card({ title, value, color, subtitle }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 border-${color}-600`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
}

function ResumoItem({ label, value, color }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-lg font-bold text-${color}-700`}>{value}</span>
    </div>
  );
}






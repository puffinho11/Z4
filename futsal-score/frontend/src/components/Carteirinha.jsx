import React, { useEffect, useState, useRef } from "react"
import api from "../api"
import {
  MdBadge,
  MdPrint,
  MdSearch,
  MdPhotoCamera,
  MdCalendarToday,
  MdSportsSoccer,
} from "react-icons/md"

export default function Carteirinha() {
  const [atletas, setAtletas] = useState([])
  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState("")
  const [loading, setLoading] = useState(false)
  const printRef = useRef(null)

  const nomeTime = "Z4 Esporte"

  const categorias = [
    "Sub-7 Masculino",
    "Sub-9 Masculino",
    "Sub-11 Masculino",
    "Sub-13 Masculino",
    "Sub-15 Masculino",
    "Sub-17 Masculino",
    "Sub-20 Masculino",
    "Adulto Masculino",
    "Sub-7 Feminino",
    "Sub-9 Feminino",
    "Sub-11 Feminino",
    "Sub-13 Feminino",
    "Sub-15 Feminino",
    "Sub-17 Feminino",
    "Sub-20 Feminino",
    "Adulto Feminino",
  ]

  useEffect(() => {
    carregarAtletas()
  }, [])

  function getApiBaseUrl() {
    const base = api.defaults?.baseURL || ""

    if (base.includes("/api")) {
      return base.replace("/api", "")
    }

    return base || window.location.origin.replace(/:\d+$/, ":3000")
  }

  function montarUrlFoto(foto) {
    if (!foto) return ""
    if (foto.startsWith("http")) return foto
    return `${getApiBaseUrl()}${foto}`
  }

  async function carregarAtletas() {
    setLoading(true)

    try {
      const res = await api.get("/registros")
      setAtletas(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error("Erro ao carregar atletas:", err)
      setAtletas([])
    } finally {
      setLoading(false)
    }
  }

  function formatarData(data) {
    if (!data) return "Não informado"

    return new Date(data).toLocaleDateString("pt-BR")
  }

  const atletasFiltrados = atletas.filter((atleta) => {
    const nomeConfere = atleta.nome
      ?.toLowerCase()
      .includes(busca.toLowerCase())

    const categoriaConfere = categoria
      ? atleta.categoria === categoria
      : true

    return nomeConfere && categoriaConfere
  })

  function imprimirCarteirinhas() {
    window.print()
  }

  return (
    <section className="p-8 bg-gray-50 min-h-screen">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            #area-carteirinhas, #area-carteirinhas * {
              visibility: visible;
            }

            #area-carteirinhas {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }

            .no-print {
              display: none !important;
            }

            .carteirinha-print {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="no-print mb-8">
        <h2 className="text-4xl font-bold text-emerald-800 flex items-center gap-3">
          <MdBadge className="text-5xl text-emerald-600" />
          Carteirinhas dos Atletas
        </h2>

        <p className="text-gray-600 mt-2">
          Gere carteirinhas automaticamente com os dados cadastrados no registro.
        </p>
      </div>

      <div className="no-print bg-white rounded-2xl shadow-md border border-emerald-100 p-6 mb-8">
        <h3 className="text-lg font-bold text-emerald-800 mb-4">
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdSearch />
              Buscar atleta
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome do atleta"
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MdSportsSoccer />
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-emerald-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={imprimirCarteirinhas}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-3 rounded-xl font-bold shadow-md hover:scale-[1.02] transition flex items-center justify-center gap-2"
            >
              <MdPrint />
              Imprimir Carteirinhas
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Carregando atletas...</p>
      ) : atletasFiltrados.length === 0 ? (
        <p className="text-center text-gray-500 bg-white p-8 rounded-2xl border">
          Nenhum atleta encontrado.
        </p>
      ) : (
        <div
          id="area-carteirinhas"
          ref={printRef}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {atletasFiltrados.map((atleta) => (
            <div
              key={atleta._id}
              className="carteirinha-print bg-white rounded-2xl shadow-lg border-2 border-emerald-500 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white p-4 text-center">
                <h3 className="text-xl font-extrabold uppercase tracking-wide">
                  {nomeTime}
                </h3>
                <p className="text-xs opacity-90">
                  Carteirinha de Identificação do Atleta
                </p>
              </div>

              <div className="p-5 flex gap-4">
                <div className="w-28 h-32 rounded-xl overflow-hidden border-2 border-emerald-400 bg-gray-100 flex items-center justify-center">
                  {atleta.foto ? (
                    <img
                      src={montarUrlFoto(atleta.foto)}
                      alt={atleta.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MdPhotoCamera className="text-5xl text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Nome
                  </p>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">
                    {atleta.nome}
                  </h4>

                  <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1">
                    <MdCalendarToday />
                    Data de Nascimento
                  </p>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {formatarData(atleta.dataNascimento)}
                  </p>

                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Categoria
                  </p>
                  <p className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                    {atleta.categoria}
                  </p>
                </div>
              </div>

              <div className="border-t border-emerald-100 px-5 py-3 flex justify-between text-xs text-gray-500">
                <span>Documento esportivo</span>
                <span>{new Date().getFullYear()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
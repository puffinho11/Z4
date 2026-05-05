import React, { useEffect, useState, useRef } from "react"
import api from "../api"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { QRCodeCanvas } from "qrcode.react"
import {
  MdBadge,
  MdPrint,
  MdSearch,
  MdPhotoCamera,
  MdCalendarToday,
  MdSportsSoccer,
  MdDownload,
  MdQrCode2,
} from "react-icons/md"

export default function Carteirinha() {
  const [atletas, setAtletas] = useState([])
  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState("")
  const [loading, setLoading] = useState(false)
  const printRef = useRef(null)

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
    if (base.includes("/api")) return base.replace("/api", "")
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

  function gerarCodigoAtleta(atleta) {
    if (atleta.codigoAtleta) return atleta.codigoAtleta
    if (atleta._id) return `ATL-${atleta._id.slice(-6).toUpperCase()}`
    return "ATL-000000"
  }

  function gerarValorQr(atleta) {
    return JSON.stringify({
      codigo: gerarCodigoAtleta(atleta),
      nome: atleta.nome,
      time: atleta.time || "Sem time",
      categoria: atleta.categoria,
      nascimento: atleta.dataNascimento,
    })
  }

  const atletasFiltrados = atletas.filter((atleta) => {
    const nomeConfere = atleta.nome
      ?.toLowerCase()
      .includes(busca.toLowerCase())

    const categoriaConfere = categoria ? atleta.categoria === categoria : true

    return nomeConfere && categoriaConfere
  })

  function imprimirCarteirinhas() {
    window.print()
  }

  async function capturarElemento(id) {
    const elemento = document.getElementById(id)
    if (!elemento) return null

    const canvas = await html2canvas(elemento, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
    })

    return canvas.toDataURL("image/png", 1.0)
  }

  async function baixarPDF(atleta) {
    const frenteImg = await capturarElemento(`frente-${atleta._id}`)
    const versoImg = await capturarElemento(`verso-${atleta._id}`)

    if (!frenteImg || !versoImg) return

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [120, 76],
      compress: true,
    })

    pdf.addImage(frenteImg, "PNG", 0, 0, 120, 76)
    pdf.addPage([120, 76], "landscape")
    pdf.addImage(versoImg, "PNG", 0, 0, 120, 76)

    pdf.save(`Carteirinha_${gerarCodigoAtleta(atleta)}_${atleta.nome}.pdf`)
  }

  return (
    <section className="p-8 bg-gray-50 min-h-screen">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 8mm;
            }

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
              padding: 0;
            }

            .no-print {
              display: none !important;
            }

            .carteirinha-print {
              break-inside: avoid;
              page-break-inside: avoid;
              margin-bottom: 18mm;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
            }

            .preview-cards {
              justify-content: flex-start !important;
              gap: 10mm !important;
            }

            .card-carteirinha {
              width: 120mm !important;
              height: 76mm !important;
            }
          }

          .card-carteirinha {
            width: 560px;
            height: 354px;
            overflow: hidden;
            background: #ffffff;
            border-radius: 22px;
            border: 5px solid #059669;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            flex-shrink: 0;
          }

          .card-topo {
            height: 92px;
            background: linear-gradient(90deg, #065f46, #10b981);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 10px 22px;
          }

          .card-time {
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            line-height: 26px;
            max-width: 500px;
            overflow: visible;
            white-space: normal;
            text-overflow: unset;
            text-align: center;
          }

          .card-subtitulo {
            font-size: 14px;
            margin-top: 4px;
          }

          .card-corpo {
            height: 210px;
            padding: 24px;
            display: flex;
            gap: 24px;
          }

          .card-foto {
            width: 138px;
            height: 168px;
            border-radius: 18px;
            border: 4px solid #34d399;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
          }

          .card-info {
            flex: 1;
            min-width: 0;
          }

          .label-card {
            font-size: 13px;
            color: #6b7280;
            font-weight: 900;
            text-transform: uppercase;
            line-height: 15px;
          }

          .nome-card {
            font-size: 22px;
            line-height: 24px;
            font-weight: 900;
            color: #1f2937;
            margin-top: 3px;
            margin-bottom: 8px;
            height: 50px;
            max-height: 50px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: normal;
          }

          .texto-card {
            font-size: 17px;
            font-weight: 700;
            color: #374151;
            margin-top: 3px;
            margin-bottom: 8px;
            line-height: 19px;
          }

          .categoria-card {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #d1fae5;
            color: #047857;
            padding: 5px 14px;
            border-radius: 999px;
            font-size: 15px;
            font-weight: 900;
            margin-top: 3px;
            min-width: 150px;
            max-width: 215px;
            height: 34px;
            line-height: 16px;
            text-align: center;
            white-space: nowrap;
          }

          .card-rodape {
            height: 42px;
            border-top: 1px solid #d1fae5;
            padding: 0 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            color: #6b7280;
          }

          .codigo-card {
            color: #047857;
            font-size: 16px;
            font-weight: 900;
          }

          .verso-topo {
            background: #065f46;
          }

          .verso-corpo {
            height: 210px;
            padding: 28px 24px 18px 24px;
            display: flex;
            gap: 24px;
            align-items: center;
          }

          .box-qrcode {
            width: 156px;
            height: 156px;
            border: 4px solid #10b981;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            flex-shrink: 0;
          }

          .verso-info {
            padding-top: 0;
          }

          .verso-info .texto-card {
            margin-bottom: 11px;
          }

          .carteirinha-area {
            width: fit-content;
            max-width: 100%;
            margin: 0 auto;
          }

          .preview-cards {
            display: flex;
            gap: 22px;
            align-items: flex-start;
            justify-content: center;
            flex-wrap: wrap;
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
        <h3 className="text-lg font-bold text-emerald-800 mb-4">Filtros</h3>

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
          className="flex flex-col gap-8"
        >
          {atletasFiltrados.map((atleta) => (
            <div
              key={atleta._id}
              className="carteirinha-print bg-white rounded-2xl shadow-lg border border-emerald-100 p-5"
            >
              <div className="carteirinha-area">
                <div className="preview-cards">
                  <div id={`frente-${atleta._id}`} className="card-carteirinha">
                    <div className="card-topo">
                      <div className="card-time">
                        {atleta.time || "Sem time"}
                      </div>
                      <div className="card-subtitulo">
                        Carteirinha de Identificação do Atleta
                      </div>
                    </div>

                    <div className="card-corpo">
                      <div className="card-foto">
                        {atleta.foto ? (
                          <img
                            src={montarUrlFoto(atleta.foto)}
                            alt={atleta.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MdPhotoCamera className="text-6xl text-gray-400" />
                        )}
                      </div>

                      <div className="card-info">
                        <div className="label-card">Nome</div>
                        <div className="nome-card">{atleta.nome}</div>

                        <div className="label-card flex items-center gap-1">
                          <MdCalendarToday />
                          Data de Nascimento
                        </div>
                        <div className="texto-card">
                          {formatarData(atleta.dataNascimento)}
                        </div>

                        <div className="label-card">Categoria</div>
                        <div className="categoria-card">
                          {atleta.categoria}
                        </div>
                      </div>
                    </div>

                    <div className="card-rodape">
                      <span>Código do atleta</span>
                      <span className="codigo-card">
                        {gerarCodigoAtleta(atleta)}
                      </span>
                    </div>
                  </div>

                  <div id={`verso-${atleta._id}`} className="card-carteirinha">
                    <div className="card-topo verso-topo">
                      <div className="card-time">Validação do Atleta</div>
                      <div className="card-subtitulo">
                        Escaneie o QR Code para conferir os dados
                      </div>
                    </div>

                    <div className="verso-corpo">
                      <div className="box-qrcode">
                        <QRCodeCanvas
                          value={gerarValorQr(atleta)}
                          size={118}
                          level="H"
                          includeMargin={true}
                        />
                      </div>

                      <div className="card-info verso-info">
                        <div className="label-card">Nome</div>
                        <div className="texto-card">{atleta.nome}</div>

                        <div className="label-card">Time</div>
                        <div className="texto-card">
                          {atleta.time || "Sem time"}
                        </div>

                        <div className="label-card">Categoria</div>
                        <div className="texto-card">{atleta.categoria}</div>
                      </div>
                    </div>

                    <div className="card-rodape">
                      <span>Documento esportivo</span>
                      <span>
                        <MdQrCode2 className="inline-block mr-1" />
                        QR Code
                      </span>
                    </div>
                  </div>
                </div>

                <div className="no-print mt-4 flex justify-end">
                  <button
                    onClick={() => baixarPDF(atleta)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md transition"
                  >
                    <MdDownload />
                    Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
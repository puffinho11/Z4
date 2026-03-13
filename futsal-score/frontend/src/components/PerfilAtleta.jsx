import React, { useState, useEffect } from "react"
import api, { SERVER_URL } from "../api"
import { saveUser, getToken } from "../utils/authStorage"
import {
  MdAccountCircle,
  MdPhotoCamera,
  MdEdit,
  MdSave,
  MdCancel,
  MdFileUpload,
  MdSportsSoccer,
  MdBadge,
  MdPerson,
} from "react-icons/md"

const normalizeUser = (u) => {
  if (!u) return null

  return {
    ...u,
    username: u.username || u.nome || "Usuário",
    nome: u.nome || u.username || "Usuário",
    fotoUrl: u.fotoUrl || u.foto || "",
    role: u.role || "user",
    time: u.time || "SemTime",
  }
}

const getFullPhotoUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null
  if (typeof pathOrUrl === "string" && pathOrUrl.startsWith("http")) return pathOrUrl
  return `${SERVER_URL}${pathOrUrl}`
}

export default function PerfilAtleta({ user, setUser }) {
  const [novoNome, setNovoNome] = useState(user?.username || "")
  const [editandoNome, setEditandoNome] = useState(false)
  const [novaFoto, setNovaFoto] = useState(null)
  const [previewFoto, setPreviewFoto] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState("")

  useEffect(() => {
    setNovoNome(user?.username || "")
  }, [user])

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [mensagem])

  useEffect(() => {
    return () => {
      if (previewFoto) URL.revokeObjectURL(previewFoto)
    }
  }, [previewFoto])

  const safeUser = normalizeUser(user)

  const fotoSrc = previewFoto
    ? previewFoto
    : safeUser?.fotoUrl
    ? getFullPhotoUrl(safeUser.fotoUrl)
    : safeUser?.foto
    ? getFullPhotoUrl(safeUser.foto)
    : "https://cdn-icons-png.flaticon.com/512/847/847969.png"

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMensagem("⚠️ Selecione apenas arquivos de imagem.")
      return
    }

    setNovaFoto(file)

    if (previewFoto) {
      URL.revokeObjectURL(previewFoto)
    }

    const url = URL.createObjectURL(file)
    setPreviewFoto(url)
    setMensagem("📁 Foto pronta para upload.")
  }

  async function handleFotoChange() {
    if (!novaFoto) {
      setMensagem("⚠️ Selecione uma nova foto primeiro.")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("foto", novaFoto)

    try {
      const response = await api.post("/upload/foto", formData)

      const { user: updatedUserFromApi, message } = response.data || {}

      if (!updatedUserFromApi) {
        setMensagem("❌ Upload falhou: usuário atualizado não retornou.")
        return
      }

      const token = getToken()
      const normalizedUser = normalizeUser(updatedUserFromApi)

      saveUser({ token, user: normalizedUser })
      setUser(normalizedUser)

      setMensagem(message || "✅ Foto salva no perfil com sucesso!")
      setNovaFoto(null)

      if (previewFoto) {
        URL.revokeObjectURL(previewFoto)
      }

      setPreviewFoto("")
    } catch (error) {
      setMensagem(error.response?.data?.message || "❌ Erro ao enviar a foto.")
    } finally {
      setLoading(false)
    }
  }

  async function handleNomeChange() {
    if (!safeUser) return

    if (!novoNome.trim()) {
      setMensagem("⚠️ O nome de usuário não pode ficar vazio.")
      return
    }

    if (novoNome.trim() === safeUser.username) {
      setEditandoNome(false)
      return
    }

    setLoading(true)

    try {
      const response = await api.put(`/users/${safeUser.username}`, {
        username: novoNome.trim(),
      })

      const { user: updatedUser, message } = response.data || {}
      const token = getToken()

      if (!token || !updatedUser) {
        setMensagem("❌ Erro ao atualizar nome.")
        return
      }

      const normalizedUser = normalizeUser(updatedUser)

      saveUser({ token, user: normalizedUser })
      setUser(normalizedUser)
      setMensagem(message || "✅ Nome atualizado!")
      setEditandoNome(false)
    } catch (error) {
      setMensagem(error.response?.data?.message || "❌ Erro ao atualizar o nome.")
    } finally {
      setLoading(false)
    }
  }

  if (!safeUser) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl w-full border border-gray-200 text-center">
          <MdAccountCircle className="text-emerald-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfil não encontrado</h2>
          <p className="text-gray-500">Não foi possível carregar os dados do usuário.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-16 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full border border-gray-200">
        <h1 className="text-3xl font-bold text-emerald-800 mb-6 flex items-center gap-3 border-b pb-3">
          <MdAccountCircle className="text-emerald-600 text-4xl" />
          Perfil do Atleta
        </h1>

        {mensagem && (
          <div
            className={`p-3 mb-6 rounded-lg text-white text-center font-medium transition ${
              mensagem.includes("Erro") || mensagem.includes("❌")
                ? "bg-red-500"
                : "bg-emerald-600"
            }`}
          >
            {mensagem}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative group">
            <img
              src={fotoSrc}
              alt="Foto de Perfil"
              className="w-40 h-40 rounded-full border-4 border-emerald-500 shadow-md object-cover transition-transform group-hover:scale-105"
            />

            <label
              className={`absolute bottom-2 right-2 p-3 rounded-full cursor-pointer shadow-md transition ${
                loading
                  ? "bg-gray-400"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105"
              }`}
              title="Mudar Foto"
            >
              <MdPhotoCamera className="text-white text-lg" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-4 flex items-center gap-3">
                <MdPerson className="text-emerald-600 text-3xl" />

                {editandoNome ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      className="border border-emerald-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={loading}
                    />

                    <button
                      onClick={handleNomeChange}
                      className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition"
                      disabled={loading}
                      title="Salvar nome"
                    >
                      <MdSave className="text-lg" />
                    </button>

                    <button
                      onClick={() => {
                        setEditandoNome(false)
                        setNovoNome(safeUser.username)
                      }}
                      className="bg-gray-300 text-gray-800 p-2 rounded-full hover:bg-gray-400 transition"
                      disabled={loading}
                      title="Cancelar edição"
                    >
                      <MdCancel className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Usuário</p>
                      <span className="text-lg font-semibold text-gray-800 break-all">
                        {safeUser.username}
                      </span>
                    </div>

                    <button
                      onClick={() => setEditandoNome(true)}
                      className="text-emerald-600 hover:text-emerald-800 transition"
                      disabled={loading}
                      title="Editar nome"
                    >
                      <MdEdit className="text-xl" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-4 flex items-center gap-3">
                <MdBadge className="text-emerald-600 text-3xl" />
                <div>
                  <p className="text-sm text-gray-500">Nome Completo</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {safeUser.nome}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-4 flex items-center gap-3">
                <MdAccountCircle className="text-emerald-600 text-3xl" />
                <div>
                  <p className="text-sm text-gray-500">Função</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {safeUser.role}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-4 flex items-center gap-3">
                <MdSportsSoccer className="text-emerald-600 text-3xl" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {safeUser.time?.nome || safeUser.time}
                  </p>
                </div>
              </div>
            </div>

            {novaFoto && (
              <button
                onClick={handleFotoChange}
                className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-3 rounded-lg shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                disabled={loading}
              >
                <MdFileUpload />
                {loading ? "Enviando..." : "Carregar Nova Foto"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



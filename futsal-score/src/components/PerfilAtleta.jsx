import React, { useState, useEffect } from 'react'
import api from '../api'
import { saveUser } from '../utils/authStorage'
import { 
  MdAccountCircle, 
  MdPhotoCamera, 
  MdEdit, 
  MdSave, 
  MdCancel,
  MdFileUpload 
} from 'react-icons/md'

// ✅ Função segura e única de normalização de usuário
const normalizeUser = (u) => {
  if (!u) return null
  return {
    ...u,
    username: u.username || u.nome || 'Usuário',
    nome: u.nome || u.username || 'Usuário',
    fotoUrl: u.fotoUrl || u.foto || '',
    role: u.role || u.papel || 'user'
  }
}

export default function PerfilAtleta({ user, setUser }) {
  const [novoNome, setNovoNome] = useState(user.username || '')
  const [editandoNome, setEditandoNome] = useState(false)
  const [novaFoto, setNovaFoto] = useState(null)
  const [previewFoto, setPreviewFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')

  // ✅ Avatar local (sem depender da internet)
  const defaultAvatar = `data:image/svg+xml;utf8,
  <svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'>
    <circle cx='75' cy='75' r='70' fill='%23007bff'/>
    <text x='50%' y='55%' text-anchor='middle' fill='white' font-size='40' font-family='Arial' dy='.3em'>👤</text>
  </svg>`;

  useEffect(() => {
    setPreviewFoto(user.fotoUrl || defaultAvatar)
    setNovoNome(user.username || '')
  }, [user])

  // ✅ Buscar perfil atualizado do servidor
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await api.get('/auth/me')
        const userData = normalizeUser(res.data)
        setUser(userData)
        saveUser(userData)
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
      }
    }
    fetchPerfil()
  }, [setUser])

  // ✅ Atualizar nome de usuário
  async function handleNomeChange() {
    if (novoNome.trim() === user.username || novoNome.trim() === '') {
      setEditandoNome(false)
      return
    }

    setLoading(true)
    setMensagem('')
    try {
      const response = await api.put('/auth/me', { nome: novoNome.trim() })
      const updatedUser = normalizeUser(response.data)
      setUser(updatedUser)
      saveUser(updatedUser)
      setEditandoNome(false)
      setMensagem('Nome de usuário atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar nome:', error.response || error)
      setMensagem('Erro ao atualizar nome. Verifique o servidor.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Atualizar foto de perfil
  async function handleSaveFoto() {
    if (!novaFoto) return

    setLoading(true)
    setMensagem('')
    try {
      const formData = new FormData()
      formData.append('foto', novaFoto)

      const uploadResponse = await api.post('/upload/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const novaFotoUrl = uploadResponse.data.url
      const updatedUser = normalizeUser({ ...user, fotoUrl: novaFotoUrl })
      setUser(updatedUser)
      saveUser(updatedUser)
      setNovaFoto(null)
      setMensagem('Foto de perfil atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error.response || error)
      setMensagem('Erro ao atualizar foto de perfil.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Pré-visualização da nova foto
  function handleFotoUpload(e) {
    const file = e.target.files[0]
    if (file) {
      setNovaFoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewFoto(reader.result)
      reader.readAsDataURL(file)
    } else {
      setNovaFoto(null)
      setPreviewFoto(user.fotoUrl || defaultAvatar)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 flex items-center gap-3">
        <MdAccountCircle className="text-4xl" /> Meu Perfil
      </h2>

      {loading && <p className="text-blue-600 animate-pulse mb-4">Carregando...</p>}
      {mensagem && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${mensagem.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensagem}
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 space-y-6">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center gap-4 border-b pb-6 mb-6">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
            <img
              src={previewFoto || defaultAvatar}
              alt="Foto de Perfil"
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = defaultAvatar)}
            />
            <label
              htmlFor="foto-upload"
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition"
              title="Mudar foto"
            >
              <MdPhotoCamera className="text-xl" />
              <input
                id="foto-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoUpload}
                disabled={loading}
              />
            </label>
          </div>

          {novaFoto && (
            <div className="flex gap-3">
              <button
                onClick={handleSaveFoto}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                disabled={loading}
              >
                <MdFileUpload /> Upload Foto
              </button>
              <button
                onClick={() => {
                  setNovaFoto(null)
                  setPreviewFoto(user.fotoUrl || defaultAvatar)
                }}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition flex items-center gap-1"
                disabled={loading}
              >
                <MdCancel /> Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Informações do usuário */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold text-gray-700">Nome:</label>
            {editandoNome ? (
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 flex-grow focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={loading}
              />
            ) : (
              <span className="text-xl text-gray-900 font-bold flex-grow">{user.username}</span>
            )}
            {editandoNome ? (
              <div className="flex gap-2">
                <button
                  onClick={handleNomeChange}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                  title="Salvar nome"
                  disabled={loading}
                >
                  <MdSave className="text-xl" />
                </button>
                <button
                  onClick={() => {
                    setEditandoNome(false)
                    setNovoNome(user.username)
                  }}
                  className="bg-gray-300 text-gray-800 p-2 rounded-full hover:bg-gray-400 transition"
                  title="Cancelar"
                  disabled={loading}
                >
                  <MdCancel className="text-xl" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditandoNome(true)}
                className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
                title="Editar nome"
                disabled={loading}
              >
                <MdEdit className="text-xl" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold text-gray-700">Função:</label>
            <span className="text-xl text-gray-800 capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  )
}



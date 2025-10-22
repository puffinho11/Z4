import React, { useState, useEffect } from 'react'
import api, { SERVER_URL } from '../api' 
import { saveUser, getToken } from '../utils/authStorage' 
import { 
  MdAccountCircle, 
  MdPhotoCamera, 
  MdEdit, 
  MdSave, 
  MdCancel,
  MdFileUpload 
} from 'react-icons/md'

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

const getFullPhotoUrl = (relativePath) => {
  if (!relativePath) return null

  return `${SERVER_URL}${relativePath}` 
}


export default function PerfilAtleta({ user, setUser }) {
  const [novoNome, setNovoNome] = useState(user.username || '')
  const [editandoNome, setEditandoNome] = useState(false)
  const [novaFoto, setNovaFoto] = useState(null)
  const [previewFoto, setPreviewFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [mensagem])
  
  const fotoSrc = previewFoto 
    ? previewFoto 
    : user.fotoUrl 
    ? getFullPhotoUrl(user.fotoUrl) 
    : user.foto
    ? getFullPhotoUrl(user.foto) 
    : null 

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><circle cx='75' cy='75' r='70' fill='#ccc'/><path d='M75 110 A35 35 0 0 1 75 40 A35 35 0 0 1 75 110 Z M75 35 A40 40 0 0 0 75 115 H75 A40 40 0 0 0 75 35 Z' fill='#999'/></svg>`

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNovaFoto(file)
      setPreviewFoto(URL.createObjectURL(file))
      setMensagem('Ficheiro pronto para upload.')
    }
  }

  async function handleFotoChange() {
    if (!novaFoto) {
      setMensagem('Selecione uma nova foto primeiro.')
      return
    }

    setLoading(true)
    setMensagem('A carregar foto...')
    const formData = new FormData()
    formData.append('foto', novaFoto) 

    try {

      const response = await api.post('/auth/upload/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

   
      const token = getToken()

      if (!token || !updatedUser) {
        setMensagem('Erro: Não foi possível obter o token ou dados do usuário após a atualização.')
        setLoading(false)
        return
      }

      const normalizedUser = normalizeUser(updatedUser)

      saveUser({ token, user: normalizedUser })

      setUser(normalizedUser)
      setMensagem(message || 'Foto atualizada com sucesso!')
      setNovaFoto(null)
      setPreviewFoto('') 

    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao carregar a foto.'
      setMensagem(msg)
      console.error('Erro no upload de foto:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleNomeChange() {
    if (novoNome === user.username) {
      setEditandoNome(false)
      return
    }

    setLoading(true)
    setMensagem('A atualizar nome...')

    try {

      const response = await api.put(`/users/${user.id}`, { username: novoNome }) 
      const { user: updatedUser, message } = response.data 

      const token = getToken() 

      if (!token || !updatedUser) {
        setMensagem('Erro: Não foi possível obter o token ou dados do usuário após a atualização.')
        setLoading(false)
        return
      }
      
      const normalizedUser = normalizeUser(updatedUser)

      saveUser({ token, user: normalizedUser }) 

      setUser(normalizedUser)
      setMensagem(message || 'Nome atualizado com sucesso!')
      setEditandoNome(false)

    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao atualizar o nome.'
      setMensagem(msg)
      console.error('Erro na atualização de nome:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">Meu Perfil de Atleta</h1>
      {mensagem && (
        <div 
          className={`p-3 mb-4 rounded-lg text-white font-medium ${
            mensagem.includes('Erro') ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {mensagem}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-40 h-40">
            <img
              src={fotoSrc || defaultAvatar}
              alt="Foto de Perfil"
              className="w-full h-full object-cover rounded-full border-4 border-blue-500 shadow-md"
            />
            <label 
              className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              title="Mudar Foto"
            >
              <MdPhotoCamera className="text-white text-xl" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
          {novaFoto && (
            <button
              onClick={handleFotoChange}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
              disabled={loading}
            >
              <MdFileUpload /> 
              {loading ? 'A Carregar...' : 'Carregar Nova Foto'}
            </button>
          )}

        </div>
        <div className="space-y-4 flex-1 w-full">
          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold text-gray-700">Usuário:</label>
            {editandoNome ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="border rounded-lg px-3 py-2 flex-1"
                  disabled={loading}
                />
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
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-gray-800">{user.username}</span>
                <button
                  onClick={() => setEditandoNome(true)}
                  className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
                  title="Editar nome"
                  disabled={loading}
                >
                  <MdEdit className="text-xl" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold text-gray-700">Nome:</label>
            <span className="text-xl text-gray-800">{user.nome}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold text-gray-700">Função:</label>
            <span className="text-xl text-gray-800 capitalize">{user.role}</span>
          </div>
          {user.time && (
            <div className="flex items-center gap-3">
              <label className="text-lg font-semibold text-gray-700">Time:</label>
              <span className="text-xl text-gray-800">{user.time.nome || user.time}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
// src/utils/authStorage.js (Ficheiro do Frontend)

/**
 * Salva o usuário e o token no localStorage.
 * Espera um objeto com as chaves: { token: string, user: object }
 * @param {Object} data - Dados retornados do login
 */
export const saveUser = (data) => {
  if (!data || typeof data !== "object") {
    console.warn("❌ Nenhum dado fornecido para salvar.")
    return
  }

  const { token, user } = data

  if (!token || !user) {
    console.warn("❌ Token ou usuário ausente:", data)
    return
  }

  try {
    // Note: 'user' aqui é o objeto retornado do endpoint /login do backend
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    console.log("✅ Usuário e token salvos com sucesso.")
  } catch (err) {
    console.error("❌ Erro ao salvar dados de autenticação:", err)
  }
}

/**
 * Retorna o objeto do usuário salvo no localStorage, ou null se não existir.
 * @returns {Object|null}
 */
export const getUser = () => {
  try {
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  } catch (err) {
    console.error("❌ Erro ao recuperar usuário:", err)
    return null
  }
}

/**
 * Retorna o token salvo no localStorage, ou null se não existir.
 * @returns {string|null}
 */
export const getToken = () => {
  try {
    return localStorage.getItem("token")
  } catch (err) {
    console.error("❌ Erro ao recuperar token:", err)
    return null
  }
}

/**
 * Remove o token e o usuário do localStorage.
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    console.log("✅ Autenticação limpa com sucesso.")
  } catch (err) {
    console.error("❌ Erro ao limpar dados de autenticação:", err)
  }
}
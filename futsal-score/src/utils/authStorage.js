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
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    console.log("✅ Usuário e token salvos com sucesso.")
  } catch (err) {
    console.error("❌ Erro ao salvar dados de autenticação:", err)
  }
}

export const getUser = () => {
  try {
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  } catch (err) {
    console.error("❌ Erro ao recuperar usuário:", err)
    return null
  }
}

export const getToken = () => {
  try {
    return localStorage.getItem("token")
  } catch (err) {
    console.error("❌ Erro ao recuperar token:", err)
    return null
  }
}

export const clearAuth = () => {
  try {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    console.log("✅ Autenticação limpa com sucesso.")
  } catch (err) {
    console.error("❌ Erro ao limpar autenticação:", err)
  }
}


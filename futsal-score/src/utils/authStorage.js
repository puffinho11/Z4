const STORAGE_KEY = "futsal_user"

export function saveUser(user) {
  try {
    if (!user) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.error("Erro ao salvar usuário no localStorage:", error)
  }
}

export function getCurrentUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Erro ao recuperar usuário do localStorage:", error)
    return null
  }
}

export function getToken() {
  try {
    const user = getCurrentUser()
    return user?.token || null
  } catch (error) {
    console.error("Erro ao recuperar token do usuário:", error)
    return null
  }
}

export function updateToken(newToken) {
  try {
    const user = getCurrentUser()
    if (!user) return
    user.token = newToken
    saveUser(user)
  } catch (error) {
    console.error("Erro ao atualizar token:", error)
  }
}

export function isAuthenticated() {
  const token = getToken()
  return !!token
}

export function logoutUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Erro ao remover usuário:", error)
  }
}

export function debugUser() {
  const user = getCurrentUser()
  console.log("👤 Usuário atual:", user || "nenhum usuário logado")
}




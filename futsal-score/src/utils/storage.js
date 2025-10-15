export const AUTH_KEY = "sfinge_auth_v1" 
export const LS_KEY = "monitoramento_atletas_v1" 
export const CAL_KEY = "sfinge_calendario_v1" 
export const EXAMES_KEY = "sfinge_exames_v1" 

export function getCurrentUser() {
  const authString = localStorage.getItem(AUTH_KEY)
  try {
    return authString ? JSON.parse(authString) : null
  } catch (e) {
    console.error("Erro ao ler usuário do localStorage:", e)
    return null
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}

export function logoutUser() {
  localStorage.removeItem(AUTH_KEY)
}

export function getItem(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error(`Erro ao obter item ${key} do localStorage`, e)
    return defaultValue
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Erro ao salvar item ${key} no localStorage`, e)
  }
}

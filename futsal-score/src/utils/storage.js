export const LS_KEY = 'monitoramento_atletas_v1'
export const USERS_KEY = 'sfinge_users_v1'
export const AUTH_KEY = 'sfinge_auth_v1'
export const EXAMES_KEY = 'sfinge_exames_v1'
export const CALENDARIO_KEY = 'sfinge_calendario_v1'

export function getItem(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) }
  catch { return fallback }
}
export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
export function seedAdminIfEmpty() {
  const users = getItem(USERS_KEY, [])
  if (!users.length) {
    setItem(USERS_KEY, [{ username: 'admin', password: '1234', role: 'admin' }])
  }
}
export function getCurrentUser(){ return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null') }
export function setCurrentUser(user){ localStorage.setItem(AUTH_KEY, JSON.stringify(user)) }
export function logoutUser(){ localStorage.removeItem(AUTH_KEY) }

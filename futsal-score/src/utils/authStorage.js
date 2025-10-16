const USER_KEY = "currentUser"


export function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY)
  try {
    return user ? JSON.parse(user) : null
  } catch (e) {
    console.error("Erro ao fazer parse do usuário do localStorage", e)
    logoutUser()
    return null
  }
}

export function setCurrentUser(userObject) {
  if (userObject && userObject.token) {
    localStorage.setItem(USER_KEY, JSON.stringify(userObject))
  } else {
    logoutUser()
  }
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY)
}
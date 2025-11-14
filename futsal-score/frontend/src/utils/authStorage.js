// src/authStorage.js

// 🔹 Salva token e usuário no localStorage
export const saveUser = (data) => {
  if (!data || typeof data !== "object") {
    console.warn("❌ Nenhum dado fornecido para salvar.");
    return;
  }

  const { token, user } = data;

  if (!token || !user) {
    console.warn("❌ Token ou usuário ausente:", data);
    return;
  }

  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    console.log("✅ Usuário e token salvos com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao salvar dados de autenticação:", err);
  }
};

// 🔹 Recupera o usuário logado
export const getUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("❌ Erro ao recuperar usuário:", err);
    return null;
  }
};

// 🔹 Recupera o token JWT
export const getToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) return token;

    // fallback caso o token esteja salvo dentro do objeto user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.token || parsed.jwt || null;
    }

    return null;
  } catch (err) {
    console.error("❌ Erro ao recuperar token:", err);
    return null;
  }
};

// 🔹 Limpa dados de autenticação
export const clearAuth = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("✅ Autenticação limpa com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao limpar dados de autenticação:", err);
  }
};

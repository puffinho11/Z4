// src/api.js

import axios from "axios";
import { getToken } from "./utils/authStorage";

// 🔧 Criação da instância do Axios
const api = axios.create({
  baseURL: "http://localhost:3000/api", // altere para seu backend se necessário
  timeout: 10000, // tempo máximo de resposta (10s)
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptador para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ Nenhum token encontrado. A requisição pode falhar com 401.");
    }

    return config;
  },
  (error) => {
    console.error("❌ Erro na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

// ❌ Interceptador para lidar com erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.error(`❌ Erro ${status}:`, data?.message || data);

      // 👇 Exemplo: você pode tratar erros comuns globalmente aqui
      if (status === 401) {
        console.warn("🔒 Não autorizado - o token pode ter expirado.");
      } else if (status === 403) {
        console.warn("🚫 Acesso proibido.");
      } else if (status === 500) {
        console.warn("💥 Erro interno do servidor.");
      }
    } else if (error.request) {
      console.error("❌ Sem resposta do servidor. Verifique sua conexão ou backend.");
    } else {
      console.error("❌ Erro ao configurar a requisição:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;














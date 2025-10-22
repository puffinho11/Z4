// backend/middleware/auth.js

import jwt from "jsonwebtoken"
import User from "../models/User.js" 

/**
 * Middleware de autenticação: verifica o token JWT e anexa o objeto do usuário (do DB) à requisição.
 */
const authMiddleware = async (req, res, next) => {
  // 1. Tenta obter o cabeçalho Authorization
  const authHeader = req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido ou formato incorreto." })
  }

  // 2. Extrai o token
  const token = authHeader.replace("Bearer ", "").trim()

  try {
    // 3. Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo123")

    if (!decoded.id) {
        return res.status(403).json({ msg: "Token inválido: ID do usuário ausente." })
    }
    
    // 4. Busca o usuário completo no DB
    const user = await User.findById(decoded.id).select("-password -__v")
    
    if (!user) {
        return res.status(401).json({ msg: "Usuário não encontrado." })
    }

    // 5. Anexa o objeto do usuário (Mongoose Document) à requisição
    req.user = user
    
    next() // 6. Segue para a rota
  } catch (err) {
    console.error("Erro no middleware de autenticação:", err.message)
    res.status(401).json({ msg: "Token inválido ou expirado." })
  }
}

export default authMiddleware


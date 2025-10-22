import jwt from "jsonwebtoken"

export default function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization")

  // 🚫 Nenhum token enviado
  if (!authHeader) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido." })
  }

  // Extrai o token do header
  const token = authHeader.replace("Bearer ", "").trim()

  try {
    // ✅ Verifica o token com a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ⚠️ Garante que o token tenha pelo menos o ID do usuário
    if (!decoded.id) {
      return res.status(403).json({ msg: "Token inválido: ID do usuário ausente." })
    }

    // Armazena as informações do usuário na requisição
    req.user = {
      id: decoded.id,
      nome: decoded.nome || "Usuário",
      time: decoded.time || null, // agora opcional
      isAdmin: decoded.isAdmin || false,
    }

    next() // segue para a rota
  } catch (err) {
    console.error("Erro no middleware de autenticação:", err.message)
    res.status(401).json({ msg: "Token inválido ou expirado." })
  }
}



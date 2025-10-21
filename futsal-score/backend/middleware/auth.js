import jwt from "jsonwebtoken"

export default function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization")

  if (!authHeader) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido." })
  }

  const token = authHeader.replace("Bearer ", "").trim()

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    console.error("Erro no middleware de autenticação:", err.message)
    res.status(401).json({ msg: "Token inválido ou expirado." })
  }
}

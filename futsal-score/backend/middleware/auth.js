import jwt from "jsonwebtoken"
import User from "../models/User.js" 

const authMiddleware = async (req, res, next) => {

  const authHeader = req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido ou formato incorreto." })
  }

  const token = authHeader.replace("Bearer ", "").trim()

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo123")

    if (!decoded.id) {
        return res.status(403).json({ msg: "Token inválido: ID do usuário ausente." })
    }
    
    const user = await User.findById(decoded.id).select("-password -__v")
    
    if (!user) {
        return res.status(401).json({ msg: "Usuário não encontrado." })
    }

    req.user = user
    
    next() 
  } catch (err) {
    console.error("Erro no middleware de autenticação:", err.message)
    res.status(401).json({ msg: "Token inválido ou expirado." })
  }
}

export default authMiddleware

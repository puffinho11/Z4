import jwt from "jsonwebtoken"
import User from "../models/User.js"

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Token de autenticação não fornecido." })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(401).json({ msg: "Usuário não encontrado." })
    }

    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      time: user.time,
      isAdmin: user.role === "admin",
    }

    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error)
    return res.status(403).json({ msg: "Token inválido ou expirado." })
  }
}

export default auth






import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo123");

    // 🔹 Busca o usuário completo
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // 🔹 Garante que o campo `time` está sempre presente
    req.user = {
      _id: user._id,
      username: user.username,
      nome: user.nome,
      role: user.role,
      time: user.time || decoded.time || user.equipe || "SemTime",
      foto: user.foto || null,
    };

    next();
  } catch (error) {
    console.error("Erro no authMiddleware:", error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

export default authMiddleware;






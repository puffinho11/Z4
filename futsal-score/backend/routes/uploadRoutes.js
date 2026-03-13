import express from "express"
import { uploadFoto } from "../middleware/uploadCloudinary.js"
import User from "../models/User.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/foto", authMiddleware, uploadFoto.single("foto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma imagem enviada" })
    }

    const mimeType = req.file.mimetype
    const base64 = req.file.buffer.toString("base64")
    const imageBase64 = `data:${mimeType};base64,${base64}`

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { foto: imageBase64 },
      { new: true, runValidators: true }
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    return res.status(200).json({
      message: "Foto salva no banco de dados com sucesso",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    return res.status(500).json({
      message: error.message || "Erro interno no servidor",
    })
  }
})

export default router
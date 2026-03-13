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

    const imageUrl = req.file.path || req.file.secure_url

    if (!imageUrl) {
      return res.status(400).json({ message: "URL da imagem não foi gerada." })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { foto: imageUrl },
      { new: true }
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado no banco de dados." })
    }

    return res.status(200).json({
      message: "Upload e salvamento no MongoDB realizados!",
      url: imageUrl,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Erro no upload/database:", error)
    return res.status(500).json({
      message: error.message || "Erro ao processar upload",
    })
  }
})

export default router
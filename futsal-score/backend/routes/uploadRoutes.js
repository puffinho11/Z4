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

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { foto: imageUrl },
      { new: true }
    ).select("-password")

    res.status(200).json({
      message: "Foto atualizada com sucesso",
      url: imageUrl,
      user: updatedUser
    })

  } catch (error) {

    console.error("Erro no upload:", error)

    res.status(500).json({
      message: error.message
    })

  }
})

export default router
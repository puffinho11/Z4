import express from "express"
import { uploadFoto } from "../middleware/uploadCloudinary.js" 
import User from "../models/User.js" 

const router = express.Router()

router.post("/foto", uploadFoto.single("foto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma imagem enviada" })
    }

    const imageUrl = req.file.path || req.file.secure_url

    const { username } = req.body 

    if (!username) {
        return res.status(400).json({ message: "Username não fornecido para atualização." })
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { foto: imageUrl },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilizador não encontrado no banco de dados." })
    }

    res.status(200).json({
      message: "Upload e salvamento no MongoDB realizados!",
      url: imageUrl,
      user: updatedUser
    })
  } catch (error) {
    console.error("Erro no upload/database:", error)
    res.status(500).json({ message: "Erro ao processar upload" })
  }
})

export default router
import express from "express"
import { uploadFoto } from "../middleware/uploadCloudinary.js" 

const router = express.Router()

router.post("/foto", uploadFoto.single("foto"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma imagem enviada" })
    }

    res.status(200).json({
      message: "Upload realizado com sucesso",
      url: req.file.path || req.file.secure_url,
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    res.status(500).json({ message: "Erro no upload" })
  }
})

export default router
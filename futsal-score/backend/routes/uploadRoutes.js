import express from "express"
import { upload } from "../utils/uploadConfig.js"

const router = express.Router()

router.post("/foto", upload.single("foto"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma imagem enviada" })
    }

    res.status(200).json({
      message: "Upload realizado com sucesso",
      file: `/uploads/${req.file.filename}`,
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    res.status(500).json({ message: "Erro no upload" })
  }
})

export default router
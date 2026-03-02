import express from "express"
import multer from "multer"
import { uploadBufferToCloudinary } from "../utils/cloudinary.js"

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

router.post("/foto", upload.single("file"), async (req, res) => {
  try {
    console.log("=== UPLOAD /foto ===")
    console.log("Content-Type:", req.headers["content-type"])
    console.log("Body keys:", Object.keys(req.body || {}))
    console.log("File:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    } : null)

    if (!req.file) {
      return res.status(400).json({
        error: "Arquivo não enviado. Campo esperado: file"
      })
    }

    const result = await uploadBufferToCloudinary(req.file.buffer)

    return res.json({ url: result.secure_url })
  } catch (err) {
    console.error("🔥 ERRO UPLOAD:", err)
    return res.status(500).json({
      error: "Erro interno no upload",
      details: err?.message || String(err),
    })
  }
})

export default router
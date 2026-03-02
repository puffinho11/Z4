import express from "express"
import multer from "multer"
import { uploadBufferToCloudinary } from "../utils/cloudinary.js"

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

router.post("/foto", upload.single("file"), async (req, res) => {
  try {
    console.log("UPLOAD /foto content-type:", req.headers["content-type"])
    console.log("req.file:", req.file ? { field: req.file.fieldname, size: req.file.size, type: req.file.mimetype } : null)

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado. Campo esperado: file" })
    }

    const result = await uploadBufferToCloudinary(req.file.buffer)

    return res.json({ url: result.secure_url })
  } catch (err) {
    console.error("🔥 ERRO UPLOAD (REAL):", err)
    return res.status(500).json({
      error: "Falha no upload",
      details: err?.message || String(err),
    })
  }
})

export default router
import express from "express"
import multer from "multer"
import { uploadBufferToCloudinary } from "../utils/cloudinary.js"


const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage()
})

router.post("/foto", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Arquivo não enviado. Use campo 'file'"
      })
    }

    const result = await uploadBufferToCloudinary(req.file.buffer)

    return res.json({
      url: result.secure_url
    })
  } catch (err) {
    console.error("Erro upload:", err)
    return res.status(500).json({
      error: "Erro interno no upload",
      details: err.message
    })
  }
})

export default router
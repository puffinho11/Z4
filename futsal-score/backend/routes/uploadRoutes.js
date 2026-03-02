import { Router } from "express"
import multer from "multer"
import cloudinary from "cloudinary"

const router = Router()

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const upload = multer({ storage: multer.memoryStorage() })

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "z4/fotos",
        resource_type: "image"
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    stream.end(buffer)
  })
}

// POST /api/upload/foto
router.post("/foto", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado (campo: file)" })
    }

    const result = await uploadBufferToCloudinary(req.file.buffer)

    return res.json({
      url: result.secure_url,
      public_id: result.public_id
    })
  } catch (err) {
    return res.status(500).json({ error: "Erro no upload", details: err.message })
  }
})

export default router
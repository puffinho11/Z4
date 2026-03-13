import multer from "multer"

const storage = multer.memoryStorage()

export const uploadFoto = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(new Error("Formato inválido. Envie JPG, JPEG, PNG ou WEBP."))
    }

    cb(null, true)
  },
})
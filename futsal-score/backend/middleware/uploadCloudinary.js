import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

function makeUploader(folder) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      if (!file.mimetype?.startsWith("image/")) {
        throw new Error("Arquivo não é imagem.");
      }

      return {
        folder: `z4/${folder}`,
        resource_type: "image",
        public_id: `${Date.now()}-${file.originalname
          .replace(/\s+/g, "-")
          .replace(/[^\w.-]/g, "")}`,
      };
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
}

export const uploadFoto = makeUploader("foto");
export const uploadRegistro = makeUploader("registros");
import cloudinary from "../config/cloudinary.js"

export const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "z4" },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )

    stream.end(buffer)
  })
}
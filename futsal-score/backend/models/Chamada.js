const mongoose = require("mongoose")

const ChamadaSchema = new mongoose.Schema(
  {
    categoria: { type: String, required: true },
    data: { type: String, required: true },
    professor: { type: String, required: true },
    atletas: [
      {
        nome: { type: String, required: true },
        presente: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("Chamada", ChamadaSchema)





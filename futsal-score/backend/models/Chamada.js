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
    time: { type: mongoose.Schema.Types.ObjectId, ref: 'Time', required: true, },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Chamada", ChamadaSchema)





import mongoose from "mongoose"

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
    time: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: true }
)

const Chamada = mongoose.model("Chamada", ChamadaSchema)

export default Chamada








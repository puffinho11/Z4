import mongoose from "mongoose"

const atletaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  presente: { type: Boolean, default: false },
})

const chamadaSchema = new mongoose.Schema(
  {
    categoria: { type: String, required: true },
    data: { type: String, required: true },
    professor: { type: String, required: true },
    atletas: [atletaSchema],
  },
  { timestamps: true }
)

export default mongoose.model("Chamada", chamadaSchema)









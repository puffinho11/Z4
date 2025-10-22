// backend/models/Exame.js
import mongoose from "mongoose"

const ExameSchema = new mongoose.Schema(
  {
    atleta: { type: String, required: true },
    tipo: { type: String, required: true },
    resultado: { type: String },
    data: { type: String, required: true },
    obs: { type: String },
    time: {
      type: String,
      required: true, // OBRIGATÓRIO: Garante que a equipe seja salva
    },
    solicitante: {
        type: String, 
        required: true, // OBRIGATÓRIO: Garante que o solicitante seja salvo
    }, 
  },
  { timestamps: true }
)
const Exame = mongoose.model("Exame", ExameSchema)

export default Exame
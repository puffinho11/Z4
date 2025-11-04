import mongoose from "mongoose";

const CalendarioSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    adversario: {
      type: String,
      trim: true,
    },
    data: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      required: true,
    },
    local: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    criadoPor: {
      type: String,
      required: true, // 🔹 Novo campo obrigatório
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Calendario = mongoose.model("Calendario", CalendarioSchema);
export default Calendario;






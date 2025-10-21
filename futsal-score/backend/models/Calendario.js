import mongoose from "mongoose"

const CalendarioSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    adversario: { type: String },
    data: { type: String, required: true },
    hora: { type: String },
    local: { type: String },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

const Calendario = mongoose.model("Calendario", CalendarioSchema)

export default Calendario

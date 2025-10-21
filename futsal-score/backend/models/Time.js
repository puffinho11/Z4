import mongoose from "mongoose"

const timeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
})

const Time = mongoose.model("Time", timeSchema)
export default Time

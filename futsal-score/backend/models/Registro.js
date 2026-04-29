import mongoose from "mongoose"

const registroSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    cpf: {
      type: String,
      required: true,
    },

    dataNascimento: {
      type: Date,
      required: true,
    },

    sexo: {
      type: String,
      enum: ["Masculino", "Feminino"],
      required: true,
    },

    categoria: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["OK", "Recuperação", "Lesão"],
      default: "OK",
    },

    treinos: {
      type: Number,
      default: 0,
    },

    lesoes: {
      type: Number,
      default: 0,
    },

    vo2: {
      type: Number,
      default: 0,
    },

    data: {
      type: Date,
      default: Date.now,
    },

    gols: {
      type: Number,
      default: 0,
    },

    amarelos: {
      type: Number,
      default: 0,
    },

    vermelhos: {
      type: Number,
      default: 0,
    },

    foto: {
      type: String,
      default: "",
    },

    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    time: {
      type: String,
      default: null,
    },
  },
  {
    collection: "registros",
  }
)

const Registro = mongoose.model("Registro", registroSchema)

export default Registro
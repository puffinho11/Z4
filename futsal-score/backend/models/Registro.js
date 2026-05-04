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
      default: "",
    },

    dataNascimento: {
      type: Date,
      default: null,
    },

    sexo: {
      type: String,
      enum: ["Masculino", "Feminino", ""],
      default: "",
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
      default: null,
    },

    time: {
      type: String,
      default: null,
    },
  },
  {
    collection: "registros",
    timestamps: true,
  }
)

const Registro = mongoose.model("Registro", registroSchema)

export default Registro
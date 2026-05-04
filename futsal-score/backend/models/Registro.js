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
      trim: true,
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

    codigoAtleta: {
      type: String,
      unique: true,
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

registroSchema.pre("save", function (next) {
  if (!this.codigoAtleta) {
    this.codigoAtleta = `ATL-${this._id.toString().slice(-6).toUpperCase()}`
  }

  next()
})

const Registro = mongoose.model("Registro", registroSchema)

export default Registro
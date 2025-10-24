import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nome: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    time: {
      type: String,
      default: "",
    },
    foto: {
      type: String,
      default: null,
    },
    criadoEm: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "users" }
)

userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin"
})

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password
    return ret
  },
  virtuals: true,
})

const User = mongoose.model("User", userSchema)
export default User

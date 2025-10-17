import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      default: null,
    },
    criadoEm: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema)

export default User

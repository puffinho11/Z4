const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, 
    })
    console.log("✅ MongoDB conectado com sucesso!")
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB

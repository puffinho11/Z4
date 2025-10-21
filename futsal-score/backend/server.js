import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"

import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import registroRoutes from "./routes/registroRoutes.js"
import exameRoutes from "./routes/exameRoutes.js"
import calendarioRoutes from "./routes/calendarioRoutes.js"
import chamadaRoutes from "./routes/chamadaRoutes.js"
import timeRoutes from "./routes/timeRoutes.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/times", timeRoutes)

app.get("/", (req, res) => {
  res.send("✅ API do Futsal Score funcionando!")
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado ao MongoDB")
    app.listen(3000, () => console.log("🚀 Servidor rodando na porta 3000"))
  })
  .catch((error) => console.error("❌ Erro ao conectar ao MongoDB:", error))













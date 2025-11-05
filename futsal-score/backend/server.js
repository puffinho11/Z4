import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import client from "prom-client"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import registroRoutes from "./routes/registroRoutes.js"
import chamadaRoutes from "./routes/chamadaRoutes.js"
import calendarioRoutes from "./routes/calendarioRoutes.js"
import exameRoutes from "./routes/exameRoutes.js"
import timeRoutes from "./routes/timeRoutes.js"

dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/uploads/foto", express.static(path.join(__dirname, "uploads/foto")))

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/futsal", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/times", timeRoutes)

app.get("/", (req, res) => {
  res.send("Servidor Z4 rodando com sucesso!")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`))

const register = new client.Registry()
client.collectDefaultMetrics({ register })

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType)
  res.end(await register.metrics())
})



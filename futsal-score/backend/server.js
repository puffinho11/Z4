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

app.use(
  cors({
    origin: [
      "https://frontend-puffinho11s-projects.vercel.app",
      "https://z4esporte.com",
      "https://z4esporte.vercel.app",
      "http://localhost:5173",
      "http://localhost"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/uploads/foto", express.static(path.join(__dirname, "uploads/foto")))

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/times", timeRoutes)

app.get("/", (req, res) => {
  res.send("🚀 Servidor Z4 rodando com sucesso!")
})

app.get("/api/test", (req, res) => {
  res.json({
    status: "online",
    message: "🚀 Backend Z4 está rodando corretamente!",
    mongo:
      mongoose.connection.readyState === 1
        ? "🟢 Conectado ao MongoDB"
        : "🔴 Desconectado do MongoDB",
    time: new Date().toLocaleString("pt-BR")
  })
})

const register = new client.Registry()
client.collectDefaultMetrics({ register })

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType)
  res.end(await register.metrics())
})

const DEFAULT_PORT = process.env.PORT || 8080

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`)
  })

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Porta ${port} em uso. Tentando porta ${port + 1}...`)
      startServer(Number(port) + 1)
    } else {
      throw err
    }
  })
}

startServer(DEFAULT_PORT)
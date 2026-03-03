import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import client from "prom-client"

// Rotas
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import registroRoutes from "./routes/registroRoutes.js"
import chamadaRoutes from "./routes/chamadaRoutes.js"
import calendarioRoutes from "./routes/calendarioRoutes.js"
import exameRoutes from "./routes/exameRoutes.js"
import timeRoutes from "./routes/timeRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"

dotenv.config()

const app = express()

/**
 * Middlewares
 */
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: [
      "https://frontend-puffinho11s-projects.vercel.app",
      "https://z4esporte.com",
      "https://z4esporte.vercel.app",
      "http://localhost:5173",
      "http://localhost",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
)

/**
 * Path helpers (ESM)
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Static para servir arquivos enviados
 * Ex: https://seu-backend.onrender.com/uploads/arquivo.jpg
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

/**
 * Rotas
 */
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/times", timeRoutes)

// Upload: POST /api/upload/foto
app.use("/api/upload", uploadRoutes)

/**
 * Healthcheck
 */
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
    time: new Date().toLocaleString("pt-BR"),
  })
})

/**
 * Metrics (Prometheus)
 */
const register = new client.Registry()
client.collectDefaultMetrics({ register })

app.get("/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", register.contentType)
    res.end(await register.metrics())
  } catch (err) {
    res.status(500).json({ message: "Erro ao gerar métricas" })
  }
})

/**
 * Handler de erro
 */
app.use((err, req, res, next) => {
  console.error("❌ Erro:", err)
  res.status(err.statusCode || 500).json({
    message: err.message || "Erro interno no servidor",
  })
})

/**
 * Mongo + Start
 */
const PORT = process.env.PORT || 8080

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado ao MongoDB Atlas")
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
    })
  })
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err))
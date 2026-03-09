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
import uploadRoutes from "./routes/uploadRoutes.js"

dotenv.config()

const app = express()
app.set("trust proxy", 1)

const PORT = process.env.PORT || 8080
const MONGO_URI = process.env.MONGO_URI

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const allowedOrigins = [
  "https://frontend-puffinho11s-projects.vercel.app",
  "https://z4esporte.com",
  "https://www.z4esporte.com",
  "https://z4esporte.vercel.app",
  "http://localhost:5173",
  "http://localhost",
]

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS bloqueou a origem: ${origin}`))
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
)

app.options("*", cors())

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.get("/", (req, res) => {
  res.status(200).send("Servidor Z4 rodando")
})

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  })
})

app.get("/ping", (req, res) => {
  res.status(200).json({ pong: true })
})

app.get("/api/test", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Backend Z4 rodando",
    mongo:
      mongoose.connection.readyState === 1
        ? "Conectado ao MongoDB"
        : "Desconectado do MongoDB",
    time: new Date().toLocaleString("pt-BR"),
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/times", timeRoutes)
app.use("/api/upload", uploadRoutes)

const register = new client.Registry()
client.collectDefaultMetrics({ register })

app.get("/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", register.contentType)
    res.end(await register.metrics())
  } catch (error) {
    console.error("Erro ao gerar métricas:", error)
    res.status(500).json({ message: "Erro ao gerar métricas" })
  }
})

app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" })
})

app.use((err, req, res, next) => {
  console.error("Erro na aplicação:", err)

  if (err.message?.includes("CORS")) {
    return res.status(403).json({ message: err.message })
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || "Erro interno no servidor",
  })
})

if (!MONGO_URI) {
  console.error("MONGO_URI não foi definida nas variáveis de ambiente.")
  process.exit(1)
}

let server = null

async function connectMongo() {
  try {
    mongoose.set("bufferCommands", false)

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: false,
    })

    console.log("✅ MongoDB conectado com sucesso")
  } catch (error) {
    console.error("❌ Erro ao conectar no MongoDB:", error)
    process.exit(1)
  }
}

async function startServer() {
  try {
    await connectMongo()

    server = app.listen(PORT, () => {
      console.log(`🚀 Z4 backend rodando na porta ${PORT}`)
    })

    server.keepAliveTimeout = 65000
    server.headersTimeout = 66000
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error)
    process.exit(1)
  }
}

async function shutdown(signal) {
  console.log(`⚠️ Recebido ${signal}. Encerrando servidor...`)

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    }

    await mongoose.connection.close(false)
    console.log("🛑 Servidor encerrado com sucesso")
    process.exit(0)
  } catch (error) {
    console.error("❌ Erro ao encerrar servidor:", error)
    process.exit(1)
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason)
})

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error)
})

mongoose.connection.on("connected", () => {
  console.log("📦 Mongoose conectado")
})

mongoose.connection.on("error", (error) => {
  console.error("❌ Erro na conexão do mongoose:", error)
})

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB desconectado")
})

startServer()
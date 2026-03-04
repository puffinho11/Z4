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

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

const allowedOrigins = [
  "https://frontend-puffinho11s-projects.vercel.app",
  "https://z4esporte.com",
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/times", timeRoutes)
app.use("/api/upload", uploadRoutes)

app.get("/", (req, res) => {
  res.send("Servidor Z4 rodando")
})

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  })
})

app.get("/api/test", (req, res) => {
  res.json({
    status: "online",
    message: "Backend Z4 rodando",
    mongo:
      mongoose.connection.readyState === 1
        ? "Conectado ao MongoDB"
        : "Desconectado do MongoDB",
    time: new Date().toLocaleString("pt-BR"),
  })
})

const register = new client.Registry()
client.collectDefaultMetrics({ register })

app.get("/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", register.contentType)
    res.end(await register.metrics())
  } catch {
    res.status(500).json({ message: "Erro ao gerar métricas" })
  }
})

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Erro interno no servidor",
  })
})

if (!MONGO_URI) {
  process.exit(1)
}

let server = null

async function start() {
  try {
    mongoose.set("bufferCommands", false)

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    })

    server = app.listen(PORT)

    server.keepAliveTimeout = 65000
    server.headersTimeout = 66000
  } catch {
    process.exit(1)
  }
}

start()

async function shutdown() {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
    await mongoose.connection.close(false)
    process.exit(0)
  } catch {
    process.exit(1)
  }
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

process.on("unhandledRejection", () => {})
process.on("uncaughtException", shutdown)
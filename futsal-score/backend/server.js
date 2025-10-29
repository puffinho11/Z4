import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

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
app.use(cors({
  origin: "*", // permite o front de qualquer origem (como Vercel)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

// Diretório atual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Pasta de uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Conexão MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/futsal"

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err.message))

// Rotas
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/times", timeRoutes)

// Rota raiz
app.get("/", (req, res) => {
  res.send("🚀 Servidor Z4 está online e rodando no Railway!")
})

// Porta dinâmica (Railway define automaticamente)
const PORT = process.env.PORT || 3000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})




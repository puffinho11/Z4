import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import client from "prom-client"

// 🧩 Rotas do sistema
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

// 🛡️ Configuração de CORS — permite acesso do frontend (Vercel)
app.use(
  cors({
    origin: [
      "https://z4esporte.com",
      "https://z4esporte.vercel.app",
      "http://localhost:5173" // para desenvolvimento local
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
)

// 📁 Configuração de diretórios estáticos (uploads)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/uploads/foto", express.static(path.join(__dirname, "uploads/foto")))

// 🧠 Conexão com MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err))

// 🚪 Rotas principais do sistema
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/chamadas", chamadaRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/times", timeRoutes)

// 🌐 Página raiz — apenas texto informativo
app.get("/", (req, res) => {
  res.send("🚀 Servidor Z4 rodando com sucesso!")
})

// 🧪 Rota de teste para ver se o backend e o Mongo estão OK
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

// 📊 Métricas Prometheus para monitoramento
const register = new client.Registry()
client.collectDefaultMetrics({ register })
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType)
  res.end(await register.metrics())
})

// ⚙️ Porta e inicialização do servidor
const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`))





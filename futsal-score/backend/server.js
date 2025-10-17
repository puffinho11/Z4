require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./db")

const userRoutes = require("./routes/userRoutes")
const registroRoutes = require("./routes/registroRoutes")
const exameRoutes = require("./routes/exameRoutes")
const calendarioRoutes = require("./routes/calendarioRoutes")
const chamadaRoutes = require("./routes/chamadaRoutes")

connectDB()

const app = express()

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
)

app.use(express.json())

app.use("/api/users", userRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/exames", exameRoutes)
app.use("/api/calendario", calendarioRoutes)
app.use("/api/chamadas", chamadaRoutes)

app.get("/", (req, res) => res.send("✅ API Futsal Score Rodando..."))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`))


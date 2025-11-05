// createAdmin.js
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import User from "./models/User.js"

dotenv.config()

async function main() {
  try {
    const MONGO_URI = process.env.MONGO_URI
    if (!MONGO_URI) {
      console.error("❌ Erro: variável MONGO_URI não encontrada no .env")
      process.exit(1)
    }

    await mongoose.connect(MONGO_URI)
    console.log("✅ Conectado ao MongoDB com sucesso!")

    const username = "puff"
    const password = "123456"
    const role = "admin"
    const time = "ACA AF"

    const existing = await User.findOne({ username })
    if (existing) {
      console.log(`⚠️ Usuário '${username}' já existe.`)
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      time,
      nome: "Administrador Puff",
    })

    await newUser.save()
    console.log("🎉 Usuário admin criado com sucesso!")
    console.log(`👤 Username: ${username}`)
    console.log(`🔑 Senha: ${password}`)
    console.log(`🧩 Role: ${role}`)
    console.log(`🏆 Time: ${time}`)

    process.exit(0)
  } catch (err) {
    console.error("❌ Erro ao criar usuário:", err)
    process.exit(1)
  }
}

main()

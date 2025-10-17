// backend/routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// 🔹 Rota de registro (criar usuário)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, time } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: "Usuário já existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "user",
      time: time || null,
    });

    await newUser.save();
    res.status(201).json({ msg: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ msg: "Erro ao registrar usuário." });
  }
});

// 🔹 Rota de login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Senha incorreta." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, time: user.time },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login realizado com sucesso!",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        time: user.time,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ msg: "Erro ao realizar login." });
  }
});

export default router;

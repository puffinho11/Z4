import express from "express";
import Registro from "../models/Registro.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Criar novo registro
router.post("/", auth, async (req, res) => {
  try {
    const user = req.user;

    // identificar o papel (role)
    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      "";
    const isAdmin = role === "admin" || user.isAdmin === true;

    // 🔥 Apenas usuários normais precisam estar associados a um time
    if (!isAdmin && !user.time) {
      return res.status(403).json({
        msg: "Seu usuário não está associado a um time. Não é possível registrar.",
      });
    }

    // 🔥 Admin pode registrar para qualquer time informado
    const novoRegistro = new Registro({
      ...req.body,
      criadoPor: user._id,
      time: isAdmin ? req.body.time || "Todos" : user.time,
    });

    await novoRegistro.save();
    res.status(201).json(novoRegistro);
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    res.status(500).json({ msg: "Erro interno ao criar registro." });
  }
});

// ✅ Listar registros
router.get("/", auth, async (req, res) => {
  try {
    const user = req.user;

    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      "";
    const isAdmin = role === "admin" || user.isAdmin === true;

    let query = {};
    // 🔥 Admin vê todos os registros
    if (!isAdmin) query.time = user.time;

    const registros = await Registro.find(query).sort({ data: -1 });
    res.json(registros);
  } catch (error) {
    console.error("Erro ao carregar registros:", error);
    res.status(500).json({ msg: "Erro ao carregar registros." });
  }
});

// ✅ Atualizar registro
router.put("/:id", auth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const registro = await Registro.findById(id);
    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." });
    }

    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      "";
    const isAdmin = role === "admin" || user.isAdmin === true;

    // 🔥 Admin pode editar qualquer time
    if (!isAdmin && registro.time !== user.time) {
      return res.status(403).json({ msg: "Sem permissão para editar este registro." });
    }

    const atualizado = await Registro.findByIdAndUpdate(id, req.body, { new: true });
    res.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
    res.status(500).json({ msg: "Erro interno ao atualizar registro." });
  }
});

// ✅ Excluir registro
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const registro = await Registro.findById(id);
    if (!registro) {
      return res.status(404).json({ msg: "Registro não encontrado." });
    }

    const role =
      user.role?.toLowerCase?.() ||
      user.nivel?.toLowerCase?.() ||
      user.tipo?.toLowerCase?.() ||
      "";
    const isAdmin = role === "admin" || user.isAdmin === true;

    // 🔥 Admin pode excluir qualquer registro
    if (!isAdmin && registro.time !== user.time) {
      return res.status(403).json({ msg: "Sem permissão para excluir este registro." });
    }

    await Registro.findByIdAndDelete(id);
    res.json({ msg: "Registro removido com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar registro:", error);
    res.status(500).json({ msg: "Erro interno ao deletar registro." });
  }
});

export default router;






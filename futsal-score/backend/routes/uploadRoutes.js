import express from "express";
import { uploadFoto, uploadRegistro } from "../middleware/uploadCloudinary.js";

const router = express.Router();

// Upload foto
router.post("/foto", uploadFoto.single("file"), (req, res) => {
  return res.json({
    ok: true,
    url: req.file?.path,
    public_id: req.file?.filename,
  });
});

// Upload registro
router.post("/registro", uploadRegistro.single("file"), (req, res) => {
  return res.json({
    ok: true,
    url: req.file?.path,
    public_id: req.file?.filename,
  });
});

export default router;
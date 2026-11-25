import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET no configurado" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, email, password_hash, rol
         FROM usuarios
        WHERE email = $1 AND activo = TRUE`,
      [email.trim().toLowerCase()]
    );
    const usuario = rows[0];
    const valido = usuario && (await bcrypt.compare(password, usuario.password_hash));
    if (!valido) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.get("/me", verificarToken, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, nombre, email, rol FROM usuarios WHERE id = $1",
    [req.usuario.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(rows[0]);
});

export default router;
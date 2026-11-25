import { Router } from "express";
import pool from "../db.js";
import { verificarToken, requerirRol } from "../middleware/auth.js";
import { responderError } from "../utils/errores.js";

const router = Router();
router.use(verificarToken);

const SELECT = `
  SELECT c.id, c.nombre, c.documento, c.telefono, c.vehiculo_id,
         v.placa AS vehiculo_placa, c.foto_url
    FROM conductores c
    LEFT JOIN vehiculos v ON v.id = c.vehiculo_id`;

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT} WHERE c.activo = TRUE ORDER BY c.id`);
    res.json(rows);
  } catch (err) {
    responderError(err, res);
  }
});

router.get("/:id", async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: "Id inválido" });
  try {
    const { rows } = await pool.query(`${SELECT} WHERE c.id = $1 AND c.activo = TRUE`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Conductor no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    responderError(err, res);
  }
});

router.post("/", requerirRol("admin"), async (req, res) => {
  const { nombre, documento, telefono = null, vehiculo_id = null } = req.body || {};
  if (!nombre || !documento) {
    return res.status(400).json({ error: "nombre y documento son requeridos" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO conductores (nombre, documento, telefono, vehiculo_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nombre.trim(), documento.trim(), telefono, vehiculo_id]
    );
    const creado = await pool.query(`${SELECT} WHERE c.id = $1`, [rows[0].id]);
    res.status(201).json(creado.rows[0]);
  } catch (err) {
    responderError(err, res);
  }
});

router.put("/:id", requerirRol("admin"), async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: "Id inválido" });
  const { nombre, documento, telefono, vehiculo_id } = req.body || {};
  try {
    const { rowCount } = await pool.query(
      `UPDATE conductores SET
         nombre = COALESCE($1, nombre),
         documento = COALESCE($2, documento),
         telefono = COALESCE($3, telefono),
         vehiculo_id = COALESCE($4, vehiculo_id)
       WHERE id = $5 AND activo = TRUE`,
      [nombre ?? null, documento ?? null, telefono ?? null, vehiculo_id ?? null, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Conductor no encontrado" });
    const { rows } = await pool.query(`${SELECT} WHERE c.id = $1`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    responderError(err, res);
  }
});

router.delete("/:id", requerirRol("admin"), async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: "Id inválido" });
  try {
    const { rowCount } = await pool.query(
      "UPDATE conductores SET activo = FALSE WHERE id = $1 AND activo = TRUE",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Conductor no encontrado" });
    res.status(204).end();
  } catch (err) {
    responderError(err, res);
  }
});

export default router;
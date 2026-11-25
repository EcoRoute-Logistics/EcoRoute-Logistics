import { Router } from "express";
import pool from "../db.js";
import { verificarToken, requerirRol } from "../middleware/auth.js";
import { responderError } from "../utils/errores.js";

const router = Router();
router.use(verificarToken);

const CAMPOS = "id, placa, tipo, capacidad_kg, emision_kg_por_km";

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const numeroValido = (n) => n !== undefined && n !== null && n !== "" && Number(n) >= 0;

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${CAMPOS} FROM vehiculos WHERE activo = TRUE ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    responderError(err, res);
  }
});

router.get("/:id", async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: "Id inválido" });
  try {
    const { rows } = await pool.query(
      `SELECT ${CAMPOS} FROM vehiculos WHERE id = $1 AND activo = TRUE`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    responderError(err, res);
  }
});

router.post("/", requerirRol("admin"), async (req, res) => {
  const { placa, tipo, capacidad_kg, emision_kg_por_km = 0 } = req.body || {};
  if (!placa || !tipo || !numeroValido(capacidad_kg) || !numeroValido(emision_kg_por_km)) {
    return res.status(400).json({ error: "placa, tipo y capacidad_kg son requeridos" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO vehiculos (placa, tipo, capacidad_kg, emision_kg_por_km)
       VALUES ($1, $2, $3, $4) RETURNING ${CAMPOS}`,
      [placa.trim().toUpperCase(), tipo.trim(), capacidad_kg, emision_kg_por_km]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    responderError(err, res);
  }
});

router.put("/:id", requerirRol("admin"), async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: "Id inválido" });
  const { placa, tipo, capacidad_kg, emision_kg_por_km } = req.body || {};
  try {
    const { rows } = await pool.query(
      `UPDATE vehiculos SET
         placa = COALESCE($1, placa),
         tipo = COALESCE($2, tipo),
         capacidad_kg = COALESCE($3, capacidad_kg),
         emision_kg_por_km = COALESCE($4, emision_kg_por_km)
       WHERE id = $5 AND activo = TRUE
       RETURNING ${CAMPOS}`,
      [placa ? placa.trim().toUpperCase() : null, tipo ?? null, capacidad_kg ?? null, emision_kg_por_km ?? null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    responderError(err, res);
  }
});

router.delete("/:id", requerirRol("admin"), async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ error: "Id inválido" });
  try {
    const { rowCount } = await pool.query(
      "UPDATE vehiculos SET activo = FALSE WHERE id = $1 AND activo = TRUE",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.status(204).end();
  } catch (err) {
    responderError(err, res);
  }
});

export default router;
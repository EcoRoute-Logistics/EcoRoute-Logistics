import bcrypt from "bcryptjs";
import pool from "../src/db.js";

const [nombre, email, password, rol = "admin"] = process.argv.slice(2);

if (!nombre || !email || !password) {
  console.error("Uso: node scripts/crear-usuario.js <nombre> <email> <password> [admin|conductor]");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const { rows } = await pool.query(
  `INSERT INTO usuarios (nombre, email, password_hash, rol)
   VALUES ($1, $2, $3, $4)
   RETURNING id, email, rol`,
  [nombre, email.toLowerCase(), hash, rol]
);
console.log("Usuario creado:", rows[0]);
await pool.end();
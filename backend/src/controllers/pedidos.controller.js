import pool from "../db.js";
import { parsePedidosCsv } from "../services/pedidosCsv.service.js";

export async function importarPedidosCsv(req, res) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      ok: false,
      error: 'Debes enviar un archivo CSV en el campo "archivo".',
    });
  }

  const { validos, errores } = parsePedidosCsv(req.file.buffer);

  if (validos.length === 0) {
    return res.status(422).json({
      ok: false,
      insertados: 0,
      rechazados: errores.length,
      errores,
    });
  }

  const client = await pool.connect();
  const pedidosInsertados = [];

  try {
    await client.query("BEGIN");

    const insertSql = `
      INSERT INTO pedidos (cliente, direccion, ubicacion, peso_kg, estado)
      VALUES (
        $1,
        $2,
        CASE
          WHEN $3::double precision IS NOT NULL AND $4::double precision IS NOT NULL
          THEN ST_SetSRID(ST_MakePoint($4::double precision, $3::double precision), 4326)::geography
          ELSE NULL
        END,
        $5,
        'pendiente'
      )
      RETURNING
        id,
        cliente,
        direccion,
        peso_kg,
        estado,
        creado_en,
        CASE
          WHEN ubicacion IS NOT NULL THEN ST_Y(ubicacion::geometry)
          ELSE NULL
        END AS lat,
        CASE
          WHEN ubicacion IS NOT NULL THEN ST_X(ubicacion::geometry)
          ELSE NULL
        END AS lon
    `;

    for (const item of validos) {
      const { rows } = await client.query(insertSql, [
        item.cliente,
        item.direccion,
        item.lat,
        item.lon,
        item.peso_kg,
      ]);
      pedidosInsertados.push(rows[0]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      ok: true,
      insertados: pedidosInsertados.length,
      rechazados: errores.length,
      errores,
      data: pedidosInsertados,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al importar pedidos CSV:", err);
    return res.status(500).json({
      ok: false,
      error: "Error interno al guardar los pedidos en la base de datos.",
    });
  } finally {
    client.release();
  }
}

export async function listarPedidos(req, res) {
  try {
    const { estado } = req.query;
    const params = [];
    let whereClause = "";

    if (estado) {
      params.push(estado);
      whereClause = "WHERE estado = $1";
    }

    const { rows } = await pool.query(
      `
      SELECT
        id,
        cliente,
        direccion,
        peso_kg,
        estado,
        creado_en,
        CASE WHEN ubicacion IS NOT NULL THEN ST_Y(ubicacion::geometry) ELSE NULL END AS lat,
        CASE WHEN ubicacion IS NOT NULL THEN ST_X(ubicacion::geometry) ELSE NULL END AS lon
      FROM pedidos
      ${whereClause}
      ORDER BY id DESC
      `,
      params
    );

    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error al listar pedidos:", err);
    return res.status(500).json({ ok: false, error: "Error al obtener los pedidos." });
  }
}
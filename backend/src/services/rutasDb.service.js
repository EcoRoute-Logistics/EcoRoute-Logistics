export async function crearRutaConParadas(pool, payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      nombre = null,
      origen,
      distancia_total_km,
      peso_total_kg,
      paradas,
    } = payload;

    const rutaInsert = await client.query(
      `INSERT INTO rutas (nombre, origen_lat, origen_lon, origen_geom, distancia_total_km, peso_total_kg, estado)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $2), 4326), $5, $6, 'planificada')
       RETURNING *`,
      [nombre, origen.lat, origen.lon, origen.lon, distancia_total_km, peso_total_kg]
    );

    const ruta = rutaInsert.rows[0];

    for (const p of paradas) {
      await client.query(
        `INSERT INTO ruta_paradas (ruta_id, pedido_id, orden, lat, lon, geom, peso_kg)
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($5, $4), 4326), $6)`,
        [ruta.id, p.id ?? null, p.orden, p.lat, p.lon, p.peso_kg ?? 0]
      );

      if (p.id) {
        await client.query(
          `UPDATE pedidos SET estado = 'asignado' WHERE id = $1 AND estado = 'pendiente'`,
          [p.id]
        );
      }
    }

    await client.query("COMMIT");
    return { ...ruta, paradas };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listarRutasDb(pool) {
  const res = await pool.query(
    `SELECT id, nombre, origen_lat, origen_lon, distancia_total_km, peso_total_kg, estado, creado_en
     FROM rutas
     ORDER BY id DESC`
  );
  return res.rows;
}

export async function obtenerRutaPorIdDb(pool, id) {
  const rutaRes = await pool.query(`SELECT * FROM rutas WHERE id = $1`, [id]);
  if (rutaRes.rows.length === 0) return null;

  const paradasRes = await pool.query(
    `SELECT * FROM ruta_paradas WHERE ruta_id = $1 ORDER BY orden ASC`,
    [id]
  );

  return {
    ...rutaRes.rows[0],
    paradas: paradasRes.rows,
  };
}
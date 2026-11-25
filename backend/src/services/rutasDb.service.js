function buildLineStringWkt(origen, paradas = []) {
  const points = [];

  if (origen && typeof origen.lon === "number" && typeof origen.lat === "number") {
    points.push(`${origen.lon} ${origen.lat}`);
  }

  for (const p of paradas) {
    if (typeof p.lon === "number" && typeof p.lat === "number") {
      points.push(`${p.lon} ${p.lat}`);
    }
  }

  if (points.length < 2) return null;
  return `LINESTRING(${points.join(", ")})`;
}

function normalizarParadas(pedidos = [], paradas = []) {
  const pedidosIds = pedidos.map((item) =>
    typeof item === "object" && item !== null ? item.pedido_id ?? item.id ?? null : item
  );

  if (Array.isArray(paradas) && paradas.length > 0) {
    return paradas.map((p, idx) => {
      const fromParada = typeof p === "object" && p !== null ? p.pedido_id ?? p.id ?? null : p;
      const pedidoId = fromParada ?? pedidosIds[idx] ?? null;
      const orden = typeof p === "object" && p !== null && p.orden != null ? p.orden : idx + 1;
      return { pedido_id: pedidoId, orden };
    });
  }

  return pedidosIds.map((pedidoId, idx) => ({
    pedido_id: pedidoId,
    orden: idx + 1,
  }));
}

export async function crearRutaConParadas(pool, payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      conductor_id = null,
      vehiculo_id = null,
      fecha = new Date().toISOString().slice(0, 10),
      distancia_km = 0,
      co2_ahorrado_kg = 0,
      origen = null,
      pedidos = [],
      paradas = [],
    } = payload;

    const paradasNormalizadas = normalizarParadas(pedidos, paradas);

    for (const p of paradasNormalizadas) {
      if (!p.pedido_id) {
        const err = new Error("Cada parada debe tener un pedido_id válido.");
        err.statusCode = 400;
        throw err;
      }
    }

    const lineWkt = buildLineStringWkt(origen, paradas);

    const rutaInsert = await client.query(
      `INSERT INTO rutas (
         conductor_id,
         vehiculo_id,
         fecha,
         distancia_km,
         co2_ahorrado_kg,
         trayecto
       )
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         CASE WHEN $6::text IS NOT NULL THEN ST_GeomFromText($6, 4326) ELSE NULL END
       )
       RETURNING
         id,
         conductor_id,
         vehiculo_id,
         fecha,
         distancia_km,
         co2_ahorrado_kg,
         ST_AsGeoJSON(trayecto)::json AS trayecto,
         creado_en`,
      [conductor_id, vehiculo_id, fecha, distancia_km, co2_ahorrado_kg, lineWkt]
    );

    const ruta = rutaInsert.rows[0];

    for (const p of paradasNormalizadas) {
      await client.query(
        `INSERT INTO ruta_paradas (ruta_id, pedido_id, orden)
         VALUES ($1, $2, $3)`,
        [ruta.id, p.pedido_id, p.orden]
      );

      await client.query(
        `UPDATE pedidos SET estado = 'asignado' WHERE id = $1 AND estado = 'pendiente'`,
        [p.pedido_id]
      );
    }

    await client.query("COMMIT");
    return { ...ruta, paradas: paradasNormalizadas };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listarRutasDb(pool) {
  const res = await pool.query(
    `SELECT
       id,
       conductor_id,
       vehiculo_id,
       fecha,
       distancia_km,
       co2_ahorrado_kg,
       ST_AsGeoJSON(trayecto)::json AS trayecto,
       creado_en
     FROM rutas
     ORDER BY id DESC`
  );
  return res.rows;
}

export async function obtenerRutaPorIdDb(pool, id) {
  const rutaRes = await pool.query(
    `SELECT
       id,
       conductor_id,
       vehiculo_id,
       fecha,
       distancia_km,
       co2_ahorrado_kg,
       ST_AsGeoJSON(trayecto)::json AS trayecto,
       creado_en
     FROM rutas
     WHERE id = $1`,
    [id]
  );
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
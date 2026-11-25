const ESTADOS_RUTA_VALIDOS = new Set([
  "planificada",
  "en_curso",
  "completada",
  "cancelada",
]);

const ESTADOS_PEDIDO_VALIDOS = new Set([
  "pendiente",
  "asignado",
  "en_ruta",
  "entregado",
  "fallido",
]);

export async function actualizarEstadoRutaDb(pool, rutaId, nuevoEstado) {
  if (!ESTADOS_RUTA_VALIDOS.has(nuevoEstado)) {
    return { error: "Estado de ruta no válido.", status: 400 };
  }

  const res = await pool.query(
    `UPDATE rutas SET estado = $1 WHERE id = $2 RETURNING *`,
    [nuevoEstado, rutaId]
  );

  if (res.rows.length === 0) {
    return { error: "Ruta no encontrada.", status: 404 };
  }

  return { data: res.rows[0], status: 200 };
}

export async function actualizarEstadoPedidoDb(pool, pedidoId, nuevoEstado) {
  if (!ESTADOS_PEDIDO_VALIDOS.has(nuevoEstado)) {
    return { error: "Estado de pedido no válido.", status: 400 };
  }

  const res = await pool.query(
    `UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *`,
    [nuevoEstado, pedidoId]
  );

  if (res.rows.length === 0) {
    return { error: "Pedido no encontrado.", status: 404 };
  }

  return { data: res.rows[0], status: 200 };
}
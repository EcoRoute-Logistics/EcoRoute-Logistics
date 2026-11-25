import {
  actualizarEstadoRutaDb,
  actualizarEstadoPedidoDb,
} from "../services/operacionEntrega.service.js";

export async function cambiarEstadoRutaController(req, res) {
  try {
    const pool = req.app.get("dbPool");
    if (!pool) {
      return res.status(503).json({ ok: false, error: "Pool de base de datos no configurado." });
    }

    const { estado } = req.body ?? {};
    const resultado = await actualizarEstadoRutaDb(pool, req.params.id, estado);
    if (resultado.error) {
      return res.status(resultado.status).json({ ok: false, error: resultado.error });
    }

    return res.status(200).json({ ok: true, data: resultado.data });
  } catch (err) {
    console.error("Error al actualizar estado de ruta:", err);
    return res.status(500).json({ ok: false, error: "Error interno al actualizar ruta." });
  }
}

export async function cambiarEstadoPedidoController(req, res) {
  try {
    const pool = req.app.get("dbPool");
    if (!pool) {
      return res.status(503).json({ ok: false, error: "Pool de base de datos no configurado." });
    }

    const { estado } = req.body ?? {};
    const resultado = await actualizarEstadoPedidoDb(pool, req.params.id, estado);
    if (resultado.error) {
      return res.status(resultado.status).json({ ok: false, error: resultado.error });
    }

    return res.status(200).json({ ok: true, data: resultado.data });
  } catch (err) {
    console.error("Error al actualizar estado de pedido:", err);
    return res.status(500).json({ ok: false, error: "Error interno al actualizar pedido." });
  }
}
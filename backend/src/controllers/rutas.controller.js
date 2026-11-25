import { optimizarParadas } from "../services/optimizacionRuta.service.js";
import {
  crearRutaConParadas,
  listarRutasDb,
  obtenerRutaPorIdDb,
} from "../services/rutasDb.service.js";

export async function optimizarRutaController(req, res) {
  try {
    const { origen, pedidos, capacidad_max_kg } = req.body ?? {};

    if (!origen || typeof origen.lat !== "number" || typeof origen.lon !== "number") {
      return res.status(400).json({
        ok: false,
        error: "El campo 'origen' es obligatorio y debe contener 'lat' y 'lon' numéricos.",
      });
    }

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "El campo 'pedidos' debe ser un arreglo no vacío.",
      });
    }

    for (const p of pedidos) {
      if (typeof p.lat !== "number" || typeof p.lon !== "number") {
        return res.status(400).json({
          ok: false,
          error: "Cada pedido debe incluir 'lat' y 'lon' numéricos.",
        });
      }
    }

    const resultado = optimizarParadas(origen, pedidos);

    if (
      typeof capacidad_max_kg === "number" &&
      capacidad_max_kg > 0 &&
      resultado.peso_total_kg > capacidad_max_kg
    ) {
      return res.status(422).json({
        ok: false,
        error: "El peso total de los pedidos supera la capacidad máxima permitida.",
        data: resultado,
      });
    }

    return res.status(200).json({
      ok: true,
      data: resultado,
    });
  } catch (err) {
    console.error("Error al optimizar ruta:", err);
    return res.status(500).json({
      ok: false,
      error: "Error interno al optimizar la ruta.",
    });
  }
}

export async function crearRutaController(req, res) {
  try {
    const pool = req.app.get("dbPool");
    if (!pool) {
      return res.status(503).json({
        ok: false,
        error: "Pool de base de datos no configurado en la aplicación.",
      });
    }

    const {
      nombre,
      origen,
      pedidos,
      capacidad_max_kg,
      conductor_id = null,
      vehiculo_id = null,
      fecha,
    } = req.body ?? {};

    if (!origen || typeof origen.lat !== "number" || typeof origen.lon !== "number") {
      return res.status(400).json({ ok: false, error: "Origen inválido." });
    }
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return res.status(400).json({ ok: false, error: "Debes enviar al menos un pedido." });
    }

    const optimizada = optimizarParadas(origen, pedidos);
    if (
      typeof capacidad_max_kg === "number" &&
      capacidad_max_kg > 0 &&
      optimizada.peso_total_kg > capacidad_max_kg
    ) {
      return res.status(422).json({
        ok: false,
        error: "La ruta supera la capacidad máxima permitida.",
        data: optimizada,
      });
    }

    const pedidosIdsOriginales = pedidos.map((item) =>
      typeof item === "object" && item !== null ? item.pedido_id ?? item.id ?? null : item
    );

    const paradasConPedido = Array.isArray(optimizada.paradas)
      ? optimizada.paradas.map((p, idx) => ({
          ...p,
          pedido_id:
            p.pedido_id ??
            p.id ??
            pedidosIdsOriginales[idx] ??
            null,
        }))
      : pedidosIdsOriginales.map((pedidoId, idx) => ({
          pedido_id: pedidoId,
          orden: idx + 1,
        }));

    const creada = await crearRutaConParadas(pool, {
      nombre,
      origen,
      conductor_id,
      vehiculo_id,
      fecha,
      ...optimizada,
      paradas: paradasConPedido,
    });

    return res.status(201).json({ ok: true, data: creada });
  } catch (err) {
    console.error("Error al crear ruta en BD:", err);
    const status = Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const message =
      status < 500 && err.message ? err.message : "Error interno al guardar la ruta.";
    return res.status(status).json({ ok: false, error: message });
  }
}

export async function listarRutasController(req, res) {
  try {
    const pool = req.app.get("dbPool");
    if (!pool) {
      return res.status(503).json({ ok: false, error: "Pool de base de datos no configurado." });
    }
    const rows = await listarRutasDb(pool);
    return res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error al listar rutas:", err);
    return res.status(500).json({ ok: false, error: "Error interno al listar rutas." });
  }
}

export async function obtenerRutaController(req, res) {
  try {
    const pool = req.app.get("dbPool");
    if (!pool) {
      return res.status(503).json({ ok: false, error: "Pool de base de datos no configurado." });
    }
    const ruta = await obtenerRutaPorIdDb(pool, req.params.id);
    if (!ruta) {
      return res.status(404).json({ ok: false, error: "Ruta no encontrada." });
    }
    return res.status(200).json({ ok: true, data: ruta });
  } catch (err) {
    console.error("Error al consultar ruta:", err);
    return res.status(500).json({ ok: false, error: "Error interno al consultar la ruta." });
  }
}
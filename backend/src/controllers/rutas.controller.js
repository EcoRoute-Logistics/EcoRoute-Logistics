import { optimizarParadas } from "../services/optimizacionRuta.service.js";

export async function optimizarRutaController(req, res) {
  try {
    const { origen, pedidos, capacidad_max_kg } = req.body ?? {};

    if (
      !origen ||
      typeof origen.lat !== "number" ||
      typeof origen.lon !== "number" ||
      Number.isNaN(origen.lat) ||
      Number.isNaN(origen.lon)
    ) {
      return res.status(400).json({
        ok: false,
        error: "Debes enviar un punto de origen válido con lat y lon numéricos.",
      });
    }

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Debes enviar al menos un pedido en el arreglo 'pedidos'.",
      });
    }

    const pedidosConCoords = [];
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      const lat = Number(p.lat);
      const lon = Number(p.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return res.status(422).json({
          ok: false,
          error: `El pedido en posición ${i} no tiene coordenadas lat/lon válidas.`,
        });
      }
      pedidosConCoords.push({
        ...p,
        lat,
        lon,
        peso_kg: Number(p.peso_kg) || 0,
      });
    }

    const resultado = optimizarParadas(origen, pedidosConCoords);

    if (
      typeof capacidad_max_kg === "number" &&
      !Number.isNaN(capacidad_max_kg) &&
      capacidad_max_kg > 0 &&
      resultado.peso_total_kg > capacidad_max_kg
    ) {
      return res.status(422).json({
        ok: false,
        error: `El peso total (${resultado.peso_total_kg} kg) supera la capacidad máxima (${capacidad_max_kg} kg).`,
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
      error: "Error interno al calcular la ruta optimizada.",
    });
  }
}
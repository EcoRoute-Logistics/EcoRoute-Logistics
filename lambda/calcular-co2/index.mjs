export const handler = async (event) => {
  const datos = typeof event?.body === "string" ? JSON.parse(event.body) : event;
  const { distancia_original_km, distancia_optimizada_km, emision_kg_por_km } = datos ?? {};

  const valores = [distancia_original_km, distancia_optimizada_km, emision_kg_por_km];
  if (valores.some((v) => typeof v !== "number" || Number.isNaN(v) || v < 0)) {
    return { error: "Se requieren distancia_original_km, distancia_optimizada_km y emision_kg_por_km como números positivos" };
  }

  const co2Original = distancia_original_km * emision_kg_por_km;
  const co2Optimizado = distancia_optimizada_km * emision_kg_por_km;
  const redondear = (n) => Math.round(n * 100) / 100;

  return {
    co2_original_kg: redondear(co2Original),
    co2_optimizado_kg: redondear(co2Optimizado),
    co2_ahorrado_kg: redondear(Math.max(co2Original - co2Optimizado, 0)),
  };
};
const RADIO_TIERRA_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function distanciaKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
}

function distanciaSecuenciaKm(origen, paradas) {
  if (paradas.length === 0) return 0;
  let total = 0;
  let actual = origen;
  for (const p of paradas) {
    total += distanciaKm(actual, p);
    actual = p;
  }
  return total;
}

function mejorarCon2Opt(origen, paradasIniciales) {
  const ruta = [...paradasIniciales];
  if (ruta.length < 4) return ruta;

  let mejorado = true;
  while (mejorado) {
    mejorado = false;
    for (let i = 0; i < ruta.length - 1; i++) {
      for (let j = i + 1; j < ruta.length; j++) {
        const antes = distanciaSecuenciaKm(origen, ruta);
        const candidato = [
          ...ruta.slice(0, i),
          ...ruta.slice(i, j + 1).reverse(),
          ...ruta.slice(j + 1),
        ];
        const despues = distanciaSecuenciaKm(origen, candidato);
        if (despues + 1e-6 < antes) {
          ruta.splice(0, ruta.length, ...candidato);
          mejorado = true;
        }
      }
    }
  }
  return ruta;
}

export function optimizarParadas(origen, pedidos) {
  const restantes = [...pedidos];
  const ordenadas = [];
  let actual = origen;

  while (restantes.length > 0) {
    let idxCercano = 0;
    let menorDist = distanciaKm(actual, restantes[0]);

    for (let i = 1; i < restantes.length; i++) {
      const d = distanciaKm(actual, restantes[i]);
      if (d < menorDist) {
        menorDist = d;
        idxCercano = i;
      }
    }

    const siguiente = restantes.splice(idxCercano, 1)[0];
    ordenadas.push(siguiente);
    actual = siguiente;
  }

  const finalOrden = mejorarCon2Opt(origen, ordenadas);
  const distanciaTotalKm = Number(
    distanciaSecuenciaKm(origen, finalOrden).toFixed(3)
  );
  const pesoTotalKg = Number(
    finalOrden.reduce((acc, item) => acc + (Number(item.peso_kg) || 0), 0).toFixed(2)
  );

  return {
    paradas: finalOrden.map((item, idx) => ({
      orden: idx + 1,
      ...item,
    })),
    distancia_total_km: distanciaTotalKm,
    peso_total_kg: pesoTotalKg,
  };
}
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parsePedidosCsv(csvBufferOrString) {
  const raw = Buffer.isBuffer(csvBufferOrString)
    ? csvBufferOrString.toString("utf-8")
    : String(csvBufferOrString || "");

  const lines = raw
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      validos: [],
      errores: [{ fila: 1, motivo: "El CSV debe incluir encabezados y al menos una fila de datos." }],
    };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idxCliente = headers.indexOf("cliente");
  const idxDireccion = headers.indexOf("direccion");
  const idxPeso = headers.indexOf("peso_kg") !== -1 ? headers.indexOf("peso_kg") : headers.indexOf("peso");
  const idxLat = headers.indexOf("lat") !== -1 ? headers.indexOf("lat") : headers.indexOf("latitud");
  const idxLon =
    headers.indexOf("lon") !== -1
      ? headers.indexOf("lon")
      : headers.indexOf("lng") !== -1
        ? headers.indexOf("lng")
        : headers.indexOf("longitud");

  if (idxCliente === -1 || idxDireccion === -1) {
    return {
      validos: [],
      errores: [{ fila: 1, motivo: "Faltan columnas obligatorias: cliente y direccion." }],
    };
  }

  const validos = [];
  const errores = [];

  for (let i = 1; i < lines.length; i++) {
    const numeroFila = i + 1;
    const cols = parseCsvLine(lines[i]);

    const cliente = idxCliente >= 0 ? (cols[idxCliente] || "").trim() : "";
    const direccion = idxDireccion >= 0 ? (cols[idxDireccion] || "").trim() : "";

    if (!cliente || !direccion) {
      errores.push({ fila: numeroFila, motivo: "cliente y direccion son obligatorios." });
      continue;
    }

    if (cliente.length > 100) {
      errores.push({ fila: numeroFila, motivo: "cliente excede los 100 caracteres." });
      continue;
    }

    let pesoKg = 0;
    if (idxPeso >= 0 && cols[idxPeso] !== undefined && cols[idxPeso] !== "") {
      const parsedPeso = Number(String(cols[idxPeso]).replace(",", "."));
      if (!Number.isFinite(parsedPeso) || parsedPeso < 0) {
        errores.push({ fila: numeroFila, motivo: "peso_kg debe ser un número mayor o igual a 0." });
        continue;
      }
      pesoKg = Number(parsedPeso.toFixed(2));
    }

    let lat = null;
    let lon = null;
    const rawLat = idxLat >= 0 ? cols[idxLat] : "";
    const rawLon = idxLon >= 0 ? cols[idxLon] : "";

    if ((rawLat !== undefined && rawLat !== "") || (rawLon !== undefined && rawLon !== "")) {
      const parsedLat = Number(String(rawLat).replace(",", "."));
      const parsedLon = Number(String(rawLon).replace(",", "."));

      if (
        !Number.isFinite(parsedLat) ||
        !Number.isFinite(parsedLon) ||
        parsedLat < -90 ||
        parsedLat > 90 ||
        parsedLon < -180 ||
        parsedLon > 180
      ) {
        errores.push({ fila: numeroFila, motivo: "Coordenadas lat/lon inválidas para SRID 4326." });
        continue;
      }
      lat = parsedLat;
      lon = parsedLon;
    }

    validos.push({
      fila: numeroFila,
      cliente,
      direccion,
      peso_kg: pesoKg,
      lat,
      lon,
    });
  }

  return { validos, errores };
}
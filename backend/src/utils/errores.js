export function responderError(err, res) {
  if (err.code === "23505") {
    return res.status(409).json({ error: "Registro duplicado (placa o documento ya existe)" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referencia inválida (el vehículo no existe)" });
  }
  console.error(err);
  res.status(500).json({ error: "Error del servidor" });
}
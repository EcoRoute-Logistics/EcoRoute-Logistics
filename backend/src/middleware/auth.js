import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET no configurado" });
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requerirRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol)) {
      return res.status(403).json({ error: "Sin permisos" });
    }
    next();
  };
}
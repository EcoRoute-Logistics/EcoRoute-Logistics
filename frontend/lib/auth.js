export function obtenerSesion() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");
  if (!token || !usuario) return null;

  try {
    return { token, usuario: JSON.parse(usuario) };
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}
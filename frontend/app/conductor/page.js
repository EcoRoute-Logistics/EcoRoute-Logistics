"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerSesion, cerrarSesion } from "@/lib/auth";
import { rutasEjemplo } from "@/lib/rutasEjemplo";
import { entregasEjemplo } from "@/lib/datosEjemplo";

const estilos = {
  pendiente: { texto: "Pendiente", color: "bg-gray-100 text-gray-700" },
  en_camino: { texto: "En camino", color: "bg-yellow-100 text-yellow-800" },
  entregado: { texto: "Entregado", color: "bg-green-100 text-green-800" },
  incidencia: { texto: "Incidencia", color: "bg-red-100 text-red-800" },
};

function estadosIniciales(ruta) {
  return Object.fromEntries(
    ruta.paradas.map((p) => [p.nombre, entregasEjemplo.find((e) => e.cliente === p.nombre)?.estado ?? "pendiente"])
  );
}

export default function ConductorPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [ruta, setRuta] = useState(null);
  const [estados, setEstados] = useState({});
  const [fotos, setFotos] = useState({});
  const [notas, setNotas] = useState({});
  const [reportando, setReportando] = useState(null);
  const [nota, setNota] = useState("");

  useEffect(() => {
    const sesion = obtenerSesion();
    const nombreUsuario = sesion?.usuario.nombre ?? "";
    const rutaDelConductor = rutasEjemplo.find((r) => r.conductor === nombreUsuario) ?? rutasEjemplo[0];

    setNombre(nombreUsuario);
    setRuta(rutaDelConductor);
    setEstados(estadosIniciales(rutaDelConductor));
  }, []);

  if (!ruta) return null;

  const terminada = (parada) => ["entregado", "incidencia"].includes(estados[parada.nombre]);
  const actual = ruta.paradas.find((p) => !terminada(p));
  const entregadas = ruta.paradas.filter((p) => estados[p.nombre] === "entregado").length;
  const progreso = Math.round((ruta.paradas.filter(terminada).length / ruta.paradas.length) * 100);

  function cambiarEstado(parada, estado) {
    setEstados((prev) => ({ ...prev, [parada]: estado }));
  }

  function guardarFoto(parada, archivo) {
    if (!archivo) return;
    setFotos((prev) => ({ ...prev, [parada]: URL.createObjectURL(archivo) }));
  }

  function enviarIncidencia(parada) {
    setNotas((prev) => ({ ...prev, [parada]: nota }));
    cambiarEstado(parada, "incidencia");
    setReportando(null);
    setNota("");
  }

  function salir() {
    cerrarSesion();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-green-700 px-5 pb-6 pt-5 text-white">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <p className="font-bold">EcoRoute</p>
            <button onClick={salir} className="rounded-lg border border-white/40 px-3 py-1 text-sm hover:bg-white/10">
              Cerrar sesión
            </button>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Hola, {nombre || ruta.conductor}</h1>
          <p className="text-sm text-green-100">
            Vehículo {ruta.vehiculo} · {ruta.paradas.length} paradas hoy
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-green-100">
              <span>{entregadas} entregadas</span>
              <span>{progreso}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-white/20">
              <div className="h-2 rounded-full bg-white" style={{ width: `${progreso}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-3 px-5 py-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Paradas en orden</h2>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Datos de ejemplo
          </span>
        </div>

        {ruta.paradas.map((parada, i) => {
          const estado = estados[parada.nombre];
          const esActual = actual?.nombre === parada.nombre;

          return (
            <div
              key={parada.nombre}
              className={`rounded-xl border bg-white p-4 ${esActual ? "border-green-600 shadow-md" : "border-gray-200"}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    esActual ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{parada.nombre}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${estilos[estado].color}`}>
                      {estilos[estado].texto}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{parada.direccion}</p>

                  {fotos[parada.nombre] && (
                    <img
                      src={fotos[parada.nombre]}
                      alt={`Prueba de entrega en ${parada.nombre}`}
                      className="mt-3 h-32 w-full rounded-lg object-cover"
                    />
                  )}

                  {notas[parada.nombre] && (
                    <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-800">{notas[parada.nombre]}</p>
                  )}
                </div>
              </div>

              {esActual && (
                <div className="mt-4 space-y-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${parada.lat},${parada.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-gray-300 py-2 text-center text-sm font-semibold hover:bg-gray-50"
                  >
                    Cómo llegar
                  </a>

                  <label className="block cursor-pointer rounded-lg border border-gray-300 py-2 text-center text-sm font-semibold hover:bg-gray-50">
                    {fotos[parada.nombre] ? "Cambiar foto" : "Tomar foto de la entrega"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => guardarFoto(parada.nombre, e.target.files[0])}
                    />
                  </label>

                  <button
                    onClick={() => cambiarEstado(parada.nombre, "entregado")}
                    className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700"
                  >
                    Marcar como entregada
                  </button>

                  {reportando === parada.nombre ? (
                    <div className="space-y-2">
                      <textarea
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        placeholder="¿Qué pasó? Ej: el local estaba cerrado"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-red-500 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReportando(null)}
                          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => enviarIncidencia(parada.nombre)}
                          disabled={!nota.trim()}
                          className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Enviar reporte
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReportando(parada.nombre)}
                      className="w-full py-2 text-sm font-semibold text-red-600"
                    >
                      Reportar incidencia
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!actual && (
          <div className="rounded-xl bg-green-50 p-4 text-center text-green-800">
            Terminaste todas las paradas de hoy.
          </div>
        )}
      </main>
    </div>
  );
}
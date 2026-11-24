"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { bodega, rutasEjemplo } from "@/lib/rutasEjemplo";

const MapaRutas = dynamic(() => import("@/components/MapaRutas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center rounded-xl bg-white text-gray-500 sm:h-[500px]">
      Cargando mapa...
    </div>
  ),
});

async function trazarRuta(ruta) {
  const puntos = [bodega, ...ruta.paradas];
  const coordenadas = puntos.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok") throw new Error("OSRM no encontró la ruta");

  return {
    puntos: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    km: data.routes[0].distance / 1000,
  };
}

export default function RutasPage() {
  const [seleccionada, setSeleccionada] = useState(null);
  const [trazados, setTrazados] = useState({});

  useEffect(() => {
    rutasEjemplo.forEach((ruta) => {
      trazarRuta(ruta)
        .then((trazado) => setTrazados((prev) => ({ ...prev, [ruta.id]: trazado })))
        .catch(() => {
          // Si OSRM falla, el mapa muestra líneas rectas y los km de rutasEjemplo
        });
    });
  }, []);

  const kmDe = (ruta) => trazados[ruta.id]?.km ?? ruta.km;
  const totalKm = rutasEjemplo.reduce((suma, r) => suma + kmDe(r), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Rutas de hoy</h1>
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
          Datos de ejemplo
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <button
            onClick={() => setSeleccionada(null)}
            className={`w-full rounded-xl border p-4 text-left ${
              seleccionada === null ? "border-green-600 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <p className="font-semibold">Todas las rutas</p>
            <p className="text-sm text-gray-500">
              {rutasEjemplo.length} rutas · {totalKm.toFixed(1)} km en total
            </p>
          </button>

          {rutasEjemplo.map((ruta) => (
            <button
              key={ruta.id}
              onClick={() => setSeleccionada(ruta.id)}
              className={`w-full rounded-xl border p-4 text-left ${
                seleccionada === ruta.id ? "border-green-600 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ruta.color }} />
                <p className="font-semibold">{ruta.conductor}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {ruta.vehiculo} · {ruta.paradas.length} paradas · {kmDe(ruta).toFixed(1)} km
              </p>
              <ol className="mt-2 list-decimal pl-5 text-sm text-gray-700">
                {ruta.paradas.map((p) => (
                  <li key={p.nombre}>{p.nombre}</li>
                ))}
              </ol>
            </button>
          ))}
        </div>

        <div className="order-first lg:order-none lg:col-span-2">
          <MapaRutas bodega={bodega} rutas={rutasEjemplo} trazados={trazados} seleccionada={seleccionada} />
        </div>
      </div>
    </div>
  );
}
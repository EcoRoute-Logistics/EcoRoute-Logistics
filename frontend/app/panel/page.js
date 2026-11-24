"use client";

import { useState } from "react";
import { entregasEjemplo } from "@/lib/datosEjemplo";

const estados = {
  pendiente: { texto: "Pendiente", color: "bg-gray-100 text-gray-700" },
  en_camino: { texto: "En camino", color: "bg-yellow-100 text-yellow-800" },
  entregado: { texto: "Entregado", color: "bg-green-100 text-green-800" },
  incidencia: { texto: "Incidencia", color: "bg-red-100 text-red-800" },
};

function Estado({ valor }) {
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${estados[valor].color}`}>
      {estados[valor].texto}
    </span>
  );
}

export default function PanelPage() {
  const [filtro, setFiltro] = useState("todos");

  const entregas = entregasEjemplo;
  const visibles = filtro === "todos" ? entregas : entregas.filter((e) => e.estado === filtro);
  const contar = (estado) => entregas.filter((e) => e.estado === estado).length;

  const tarjetas = [
    { label: "Total del día", valor: entregas.length },
    { label: "Entregadas", valor: contar("entregado") },
    { label: "En camino", valor: contar("en_camino") },
    { label: "Pendientes", valor: contar("pendiente") },
    { label: "Incidencias", valor: contar("incidencia") },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Entregas de hoy</h1>
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
          Datos de ejemplo
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
        {tarjetas.map((t) => (
          <div key={t.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">{t.label}</p>
            <p className="mt-1 text-2xl font-bold">{t.valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {["todos", ...Object.keys(estados)].map((clave) => (
          <button
            key={clave}
            onClick={() => setFiltro(clave)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filtro === clave ? "bg-green-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {clave === "todos" ? "Todos" : estados[clave].texto}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {visibles.map((e) => (
          <div key={e.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{e.cliente}</p>
                <p className="text-sm text-gray-500">{e.direccion}</p>
              </div>
              <Estado valor={e.estado} />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {e.hora} · {e.conductor} · {e.vehiculo}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Hora</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Dirección</th>
              <th className="px-4 py-3 font-medium">Conductor</th>
              <th className="px-4 py-3 font-medium">Vehículo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibles.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3">{e.hora}</td>
                <td className="px-4 py-3 font-medium">{e.cliente}</td>
                <td className="px-4 py-3 text-gray-600">{e.direccion}</td>
                <td className="px-4 py-3">{e.conductor}</td>
                <td className="px-4 py-3">{e.vehiculo}</td>
                <td className="px-4 py-3">
                  <Estado valor={e.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
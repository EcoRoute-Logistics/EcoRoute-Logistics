"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { obtenerSesion, cerrarSesion } from "@/lib/auth";

const enlaces = [
  { href: "/panel", texto: "Entregas" },
  { href: "/panel/rutas", texto: "Rutas" },
];

export default function EncabezadoPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const sesion = obtenerSesion();
    if (sesion) setNombre(sesion.usuario.nombre);
  }, []);

  function salir() {
    cerrarSesion();
    router.replace("/login");
  }

  const navegacion = enlaces.map((e) => (
    <Link
      key={e.href}
      href={e.href}
      className={
        pathname === e.href
          ? "font-semibold text-green-700 dark:text-green-400"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      }
    >
      {e.texto}
    </Link>
  ));

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-8">
            <Link href="/panel" className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">E</span>
              EcoRoute
            </Link>
            <nav className="hidden gap-6 text-sm sm:flex">{navegacion}</nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-gray-600 dark:text-gray-400 sm:inline">{nombre}</span>
            <button
              onClick={salir}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav className="flex gap-6 pb-3 text-sm sm:hidden">{navegacion}</nav>
      </div>
    </header>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";

export default function RutaProtegida({ rol, children }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const sesion = obtenerSesion();

    if (!sesion) {
      router.replace("/login");
      return;
    }

    if (rol && sesion.usuario.rol !== rol) {
      router.replace(sesion.usuario.rol === "conductor" ? "/conductor" : "/panel");
      return;
    }

    setAutorizado(true);
  }, [rol, router]);

  if (!autorizado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
        Verificando sesión...
      </div>
    );
  }

  return children;
}
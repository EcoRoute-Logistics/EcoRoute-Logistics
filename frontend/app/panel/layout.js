import RutaProtegida from "@/components/RutaProtegida";
import EncabezadoPanel from "@/components/EncabezadoPanel";

export default function PanelLayout({ children }) {
  return (
    <RutaProtegida rol="admin">
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <EncabezadoPanel />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </RutaProtegida>
  );
}
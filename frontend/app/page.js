import Link from "next/link";
import Navbar from "@/components/Navbar";
import { estados } from "@/lib/estados";

const funcionalidades = [
  {
    titulo: "Panel de control",
    texto: "Carga los pedidos del día desde un archivo CSV y sigue el estado de cada entrega.",
  },
  {
    titulo: "Optimización de rutas",
    texto: "Calcula el orden de paradas más corto según la capacidad de cada vehículo y las ventanas horarias.",
  },
  {
    titulo: "Portal del conductor",
    texto: "El repartidor ve sus paradas en orden desde el celular y registra cada entrega con foto o firma.",
  },
  {
    titulo: "Módulo de sostenibilidad",
    texto: "Compara las emisiones de CO₂ de las rutas optimizadas con las de las rutas tradicionales.",
  },
];

const resumen = [
  { label: "Entregas", valor: "48" },
  { label: "Vehículos", valor: "6" },
  { label: "Km ahorrados", valor: "37" },
  { label: "CO₂ evitado", valor: "9 kg" },
];

const entregas = [
  { cliente: "Tienda La Castellana", estado: "entregado" },
  { cliente: "Farmacia La Botica", estado: "en_camino" },
  { cliente: "Panadería Valparaiso", estado: "pendiente" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
              Rutas verdes para flotas pequeñas
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Entrega más con menos kilómetros.</h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              EcoRoute organiza las rutas de reparto de empresas con menos de 15 vehículos para gastar
              menos combustible y cumplir los horarios de entrega.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
              >
                Acceder al panel
              </Link>
              <a
                href="#funcionalidades"
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">Resumen de hoy</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {resumen.map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-2xl font-bold">{item.valor}</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 divide-y divide-gray-100 dark:divide-gray-800">
              {entregas.map((e) => (
                <li key={e.cliente} className="flex items-center justify-between py-3 text-sm">
                  <span>{e.cliente}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${estados[e.estado].color}`}>
                    {estados[e.estado].texto}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="funcionalidades" className="bg-gray-50 py-20 dark:bg-gray-900">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold">Funcionalidades</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {funcionalidades.map((f) => (
                <div
                  key={f.titulo}
                  className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
                >
                  <h3 className="font-semibold">{f.titulo}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="sostenibilidad" className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-2xl bg-green-700 p-10 text-white dark:bg-green-800">
            <h2 className="text-3xl font-bold">Mide lo que ahorras</h2>
            <p className="mt-4 max-w-2xl text-green-100">
              Cada ruta optimizada guarda los kilómetros recorridos y el CO₂ estimado, para que el
              negocio pueda reportar sus métricas verdes mes a mes.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
            >
              Empezar ahora
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        © 2026 EcoRoute Logistics
      </footer>
    </div>
  );
}
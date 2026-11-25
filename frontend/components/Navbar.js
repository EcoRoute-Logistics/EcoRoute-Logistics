import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">E</span>
          EcoRoute
        </Link>
        <div className="hidden gap-8 text-sm text-gray-600 dark:text-gray-400 md:flex">
          <a href="#funcionalidades" className="hover:text-gray-900 dark:hover:text-gray-100">Funcionalidades</a>
          <a href="#sostenibilidad" className="hover:text-gray-900 dark:hover:text-gray-100">Sostenibilidad</a>
        </div>
        <Link
          href="/login"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Acceder
        </Link>
      </nav>
    </header>
  );
}
import RutaProtegida from "@/components/RutaProtegida";

export default function ConductorLayout({ children }) {
  return <RutaProtegida rol="conductor">{children}</RutaProtegida>;
}
import RutaProtegida from "@/components/RutaProtegida";

export default function PanelLayout({ children }) {
  return <RutaProtegida rol="admin">{children}</RutaProtegida>;
}
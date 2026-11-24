"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Pane, Polyline, CircleMarker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const GROSOR = 5;
const SEPARACION = 5;

function desplazarLinea(map, puntos, px) {
  if (px === 0 || puntos.length < 2) return puntos;

  const enPantalla = puntos.map((p) => map.latLngToLayerPoint(p));

  return enPantalla.map((punto, i) => {
    const anterior = enPantalla[Math.max(i - 1, 0)];
    const siguiente = enPantalla[Math.min(i + 1, enPantalla.length - 1)];
    const dx = siguiente.x - anterior.x;
    const dy = siguiente.y - anterior.y;
    const largo = Math.hypot(dx, dy) || 1;
    return map.layerPointToLatLng(punto.add([(-dy / largo) * px, (dx / largo) * px]));
  });
}

function LineaDesplazada({ puntos, desplazamiento, pathOptions }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const posiciones = useMemo(
    () => desplazarLinea(map, puntos, desplazamiento),
    [map, puntos, desplazamiento, zoom]
  );

  return <Polyline positions={posiciones} pathOptions={pathOptions} />;
}

export default function MapaRutas({ bodega, rutas, trazados, seleccionada }) {
  const lineas = rutas.map((ruta, i) => ({
    ruta,
    puntos:
      trazados[ruta.id]?.puntos ?? [[bodega.lat, bodega.lng], ...ruta.paradas.map((p) => [p.lat, p.lng])],
    desplazamiento: (i - (rutas.length - 1) / 2) * SEPARACION,
    activa: seleccionada === null || seleccionada === ruta.id,
  }));

  const ordenadas = [...lineas].sort((a, b) => Number(a.activa) - Number(b.activa));

  return (
    <MapContainer
      center={[bodega.lat, bodega.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-[350px] w-full rounded-xl sm:h-[500px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Pane name="bordes" style={{ zIndex: 410 }}>
        {ordenadas
          .filter((l) => l.activa)
          .map(({ ruta, puntos, desplazamiento }) => (
            <LineaDesplazada
              key={`borde-${ruta.id}`}
              puntos={puntos}
              desplazamiento={desplazamiento}
              pathOptions={{ color: "#ffffff", weight: GROSOR + 3, opacity: 1 }}
            />
          ))}
      </Pane>

      <Pane name="lineas" style={{ zIndex: 420 }}>
        {ordenadas.map(({ ruta, puntos, desplazamiento, activa }) => (
          <LineaDesplazada
            key={`linea-${ruta.id}`}
            puntos={puntos}
            desplazamiento={desplazamiento}
            pathOptions={{ color: ruta.color, weight: GROSOR, opacity: activa ? 1 : 0.25 }}
          />
        ))}
      </Pane>

      <Pane name="paradas" style={{ zIndex: 430 }}>
        {ordenadas.map(({ ruta, activa }) =>
          ruta.paradas.map((parada, i) => (
            <CircleMarker
              key={`${ruta.id}-${parada.nombre}`}
              center={[parada.lat, parada.lng]}
              radius={8}
              pathOptions={{
                color: ruta.color,
                fillColor: "#ffffff",
                weight: 4,
                opacity: activa ? 1 : 0.3,
                fillOpacity: activa ? 1 : 0.3,
              }}
            >
              <Tooltip>
                {i + 1}. {parada.nombre}, {parada.direccion} ({ruta.conductor})
              </Tooltip>
            </CircleMarker>
          ))
        )}
      </Pane>

      <Pane name="bodega" style={{ zIndex: 440 }}>
        <CircleMarker
          center={[bodega.lat, bodega.lng]}
          radius={11}
          pathOptions={{ color: "#ffffff", fillColor: "#000000", fillOpacity: 1, weight: 3 }}
        >
          <Tooltip>
            {bodega.nombre}, {bodega.direccion}
          </Tooltip>
        </CircleMarker>
      </Pane>
    </MapContainer>
  );
}
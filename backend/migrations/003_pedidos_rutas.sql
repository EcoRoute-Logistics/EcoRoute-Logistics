CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    ubicacion GEOGRAPHY(Point, 4326),
    peso_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rutas (
    id SERIAL PRIMARY KEY,
    conductor_id INTEGER REFERENCES conductores(id),
    vehiculo_id INTEGER REFERENCES vehiculos(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    distancia_km NUMERIC(10,2),
    co2_ahorrado_kg NUMERIC(10,2),
    trayecto GEOGRAPHY(LineString, 4326),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ruta_paradas (
    id SERIAL PRIMARY KEY,
    ruta_id INTEGER NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    orden INTEGER NOT NULL,
    entregado_en TIMESTAMPTZ,
    foto_url TEXT,
    firma_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_pedidos_ubicacion ON pedidos USING GIST (ubicacion);
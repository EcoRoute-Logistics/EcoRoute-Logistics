# Contrato de la API

Base URL local: `http://localhost:3000/api`
Autenticación: header `Authorization: Bearer <token>` (excepto login).

## Auth
| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `200 { token, usuario: { id, nombre, rol } }` |

## Vehículos
Todas las rutas requieren token. Crear, editar y borrar requieren rol `admin`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/vehiculos` | `200 [ { id, placa, tipo, capacidad_kg, emision_kg_por_km } ]` |
| GET | `/vehiculos/:id` | `200 { ... }` o `404` |
| POST | `/vehiculos` | Body: `{ placa, tipo, capacidad_kg, emision_kg_por_km? }`. `201`, `409` si la placa existe |
| PUT | `/vehiculos/:id` | Actualiza los campos enviados. `200` |
| DELETE | `/vehiculos/:id` | Borrado lógico. `204` |

## Conductores
Mismas reglas de acceso.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/conductores` | `200 [ { id, nombre, documento, telefono, vehiculo_id, vehiculo_placa, foto_url } ]` |
| GET | `/conductores/:id` | `200 { ... }` o `404` |
| POST | `/conductores` | Body: `{ nombre, documento, telefono?, vehiculo_id? }`. `201`, `409` si el documento existe |
| PUT | `/conductores/:id` | Actualiza los campos enviados. `200` |
| DELETE | `/conductores/:id` | Borrado lógico. `204` |

## Pedidos
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/pedidos/upload` | Sube CSV (`multipart/form-data`, campo `file`). `200 { insertados, errores: [ { fila, motivo } ] }` |
| GET | `/pedidos` | Lista pedidos |

## Rutas
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/rutas/optimizar` | Genera rutas. `200 [ { vehiculo_id, paradas: [...], distancia_km } ]` |

## Sostenibilidad
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/sostenibilidad/resumen` | `200 { co2_kg, co2_ahorrado_kg, km_totales }` |

## Errores
`{ "error": "mensaje" }` con códigos 400, 401, 403, 404, 500.
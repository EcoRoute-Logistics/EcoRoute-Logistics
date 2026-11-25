# Contrato de la API

Base URL local: `http://localhost:3000/api`
Autenticación: header `Authorization: Bearer <token>` (excepto login).

## Auth
| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `200 { token, usuario: { id, nombre, rol } }` |

## Vehículos
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/vehiculos` | `200 [ { id, patente, capacidad_kg, tipo_combustible } ]` |
| POST | `/vehiculos` | `201 { id, ... }` |
| PUT | `/vehiculos/:id` | `200 { id, ... }` |
| DELETE | `/vehiculos/:id` | `204` |

## Conductores
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/conductores` | `200 [ { id, nombre, licencia } ]` |
| POST | `/conductores` | `201 { id, ... }` |
| PUT | `/conductores/:id` | `200 { id, ... }` |
| DELETE | `/conductores/:id` | `204` |

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
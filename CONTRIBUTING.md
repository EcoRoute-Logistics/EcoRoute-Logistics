# Guía de contribución

Gracias por colaborar en EcoRoute-Logistics. Este documento explica cómo trabajamos.

## Flujo de ramas
feature/mi-rama → PR → Desarrollo → PR → main

- Nunca se hace commit directo a `Desarrollo` ni a `main`.
- Cada cambio va en su propia rama, creada desde `Desarrollo` actualizado.

## Nombres de ramas
| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feature/` | Funcionalidad nueva | `feature/carga-pedidos-csv` |
| `fix/` | Corrección de errores | `fix/validacion-csv` |
| `docs/` | Documentación | `docs/getting-started` |

## Commits
Formato: `tipo: descripción corta en minúsculas`

- `feat:` nueva funcionalidad
- `fix:` corrección
- `docs:` documentación
- `refactor:` cambio interno sin alterar el comportamiento

Ejemplo: `feat: add endpoint para subir pedidos por csv`

## Cómo abrir un Pull Request
1. `git checkout Desarrollo && git pull origin Desarrollo`
2. `git checkout -b feature/nombre-de-la-rama`
3. Haz commits pequeños y `git push -u origin feature/nombre-de-la-rama`
4. En GitHub, abre el PR con **base: `Desarrollo`** y completa la plantilla.
5. Espera al menos **1 aprobación** antes de fusionar.
6. Fusiona con *Squash and merge* y borra la rama.

## Revisión
- Un PR debe ser pequeño y tener un solo propósito.
- Quien revisa deja comentarios claros; quien abre el PR responde y corrige.

docs/api.md (contrato propuesto, ajústalo con el Integrante 3 y con lo que ya exista en feature/login y backend-base)

markdown
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
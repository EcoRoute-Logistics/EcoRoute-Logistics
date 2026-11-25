# EcoRoute-Logistics
SaaS para optimizar las rutas de entrega de flotas pequeñas (menos de 15 vehículos). Incluye panel del administrador, portal del conductor y cálculo de CO₂ ahorrado. React, Node.js/Express y PostgreSQL con PostGIS, desplegado en AWS.

**Aplicación en línea:** http://www.ecorouter.me

Dirección directa del bucket (respaldo mientras propaga el DNS): http://www.ecorouter.me.s3-website-us-east-1.amazonaws.com

Documentación de AWS: [docs/aws.md](docs/aws.md)

## Equipo y roles

| Integrante | GitHub | Rol | Responsabilidades |
|---|---|---|---|
| Kevin Reatiaga Villadiego | @Noxus2OO7 | Infraestructura AWS | VPC y subredes, EC2 con Docker, Application Load Balancer, RDS PostgreSQL con PostGIS, buckets de S3, Lambda y dominio. Documento APA. |
| Matías Morales Rodríguez | @MatiasMorales-cuc | CI/CD y base del backend | Estructura base de Express, Docker, pruebas y workflows de GitHub Actions para el build y el despliegue. |
| Sebastián José Santiz Mestre | @sjsm2104-crypto | Frontend | Aplicación en Next.js con Tailwind: landing, inicio de sesión, rutas protegidas por rol, panel de entregas, mapa de rutas con Leaflet, portal del conductor y modo oscuro. |
| Gabriel Palomino Pinzón | @theron102 | Backend y documentación | API REST con autenticación JWT, gestión de vehículos y conductores, carga de pedidos por CSV, optimización de rutas, módulo de sostenibilidad y README. |

## Cómo trabajamos

Usamos un flujo basado en Gitflow con dos ramas principales:

- **`main`**: versión estable. Cada cambio que llega aquí se despliega en AWS con GitHub Actions.
- **`Desarrollo`**: rama de integración. Todo el trabajo se une aquí antes de pasar a `main`.

Ninguna de las dos acepta pushes directos. Las dos exigen un pull request con al menos una aprobación de otro integrante, y el autor no puede aprobar su propio PR.

### Ramas

Cada tarea se hace en su propia rama, creada desde `Desarrollo`:

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feature/` | Funcionalidad nueva | `feature/mapa-rutas` |
| `fix/` | Corrección | `fix/responsive` |
| `docs/` | Documentación | `docs/roles-y-flujo` |
| `ci/` | Workflows de GitHub Actions | `ci/deploy-frontend` |
| `infra/` | Configuración de AWS | `infra/user-data` |

Las ramas no se borran después del merge, para conservar el historial de cada tarea.

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/es/), con el tipo en minúscula:

- `feat:` funcionalidad nueva
- `fix:` corrección
- `docs:` documentación
- `ci:` integración y despliegue continuo
- `refactor:` cambio de código sin cambiar el comportamiento
- `chore:` configuración y tareas de mantenimiento

Ejemplo: `feat: agrega mapa de rutas con Leaflet`

### Pull requests

1. Al terminar una tarea, el autor sube su rama y abre un PR hacia `Desarrollo`.
2. La descripción explica qué cambia, por qué y cómo probarlo.
3. Otro integrante revisa el código, lo prueba y lo aprueba o pide cambios. La revisión rota así: Kevin revisa a Matías, Matías revisa a Sebastián, Sebastián revisa a Gabriel y Gabriel revisa a Kevin.
4. Con la aprobación, el autor hace el merge.
5. Cuando `Desarrollo` está estable, se abre un PR de `Desarrollo` hacia `main`. Al fusionarlo, GitHub Actions despliega la nueva versión.

## Requisitos previos
- **Node.js** (versión LTS recomendada, por ejemplo v20+ o v22+) y `npm`.
- **PostgreSQL** con extensión **PostGIS** habilitada para el manejo geográfico de rutas y paradas.
- **Git** para clonar el repositorio y gestionar ramas/entregas.

## Variables de entorno
Configura las variables necesarias antes de iniciar el backend y el frontend (usa un archivo `.env` local y no subas credenciales reales al repositorio):

- **Backend (`backend/.env`):**
  - `PORT`: puerto del servidor Express (`4000` en local; el frontend usa el `3000`).
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME` y `DB_PASSWORD`: conexión a PostgreSQL/PostGIS.
  - `DB_SSL`: `true` para conectarse a RDS, que exige conexión cifrada.
  - `S3_BUCKET` y `AWS_REGION`: bucket de S3 para la subida de archivos (`ecoroute-datos` en `us-east-1`).
- **Frontend (`frontend/.env.local`):**
  - `NEXT_PUBLIC_API_URL`: URL base de la API (por ejemplo, `http://localhost:4000`). Copia `frontend/.env.example` como `frontend/.env.local`.

## Getting Started (entorno local)
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/EcoRoute-Logistics/EcoRoute-Logistics.git
   cd EcoRoute-Logistics
   ```

2. **Preparar la base de datos.** Crea una base de datos en PostgreSQL y ejecuta las migraciones en orden:
   ```bash
   psql -U postgres -c "CREATE DATABASE ecoroute;"
   psql -U postgres -d ecoroute -f backend/migrations/001_postgis.sql
   psql -U postgres -d ecoroute -f backend/migrations/002_vehiculos_conductores.sql
   psql -U postgres -d ecoroute -f backend/migrations/003_pedidos_rutas.sql
   ```

3. **Iniciar el backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Edita `.env` con los datos de tu base de datos y pon `PORT=4000` antes de arrancar. Para comprobar que la API funciona, abre `http://localhost:4000/api/health`.

4. **Iniciar el frontend** (en otra terminal, desde la raíz del repositorio):
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```
   La aplicación queda en `http://localhost:3000`.

### Probar el frontend sin backend

El panel y el portal del conductor están protegidos y piden sesión. Para recorrerlos sin la API, abre la consola del navegador (F12) y simula una sesión:

```js
localStorage.setItem("token", "prueba");
localStorage.setItem("usuario", JSON.stringify({ id: 1, nombre: "Admin", rol: "admin" }));
```

Luego entra a `/panel`. Para el portal del conductor, usa `{ id: 2, nombre: "Carlos Pérez", rol: "conductor" }` y entra a `/conductor`.

## Compilar (build)

- **Frontend:**
  ```bash
  cd frontend
  npm run build
  ```
  Next.js está configurado en `next.config.mjs` con `output: "export"`, que genera archivos estáticos (HTML, CSS y JavaScript) en `frontend/out/`, y con `trailingSlash: true`, que crea cada ruta como carpeta con su `index.html` (`login/index.html`, `panel/index.html`, etc.) para que el sitio web estático de S3 las encuentre. El contenido de `frontend/out/` es lo que se sube al bucket.
- **Backend:** no necesita compilarse; se empaqueta en una imagen de Docker y se ejecuta con Node.js.

## Despliegue

El despliegue es automático con GitHub Actions. Hay un workflow por cada parte del sistema, en `.github/workflows/`:

| Workflow | Qué hace |
|---|---|
| `deploy-frontend.yml` | Instala y compila el frontend con `NEXT_PUBLIC_API_URL` apuntando a la API de producción, y sube `frontend/out/` al bucket `www.ecorouter.me`, que funciona como sitio web estático. |
| `deploy-backend.yml` | Construye la imagen de Docker de la API y la ejecuta en la instancia EC2, con las variables de conexión a RDS tomadas de los secrets del repositorio. |
| `deploy-lambda.yml` | Empaqueta y actualiza la función Lambda que calcula el CO₂ ahorrado por ruta. |

Los tres se ejecutan cuando se fusiona un PR en `main`.

Las credenciales se guardan como secrets del repositorio: las de AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_SESSION_TOKEN`) y las de la base de datos (`DB_HOST`, `DB_USER` y `DB_PASSWORD`). Como usamos AWS Academy, las credenciales de AWS vencen en cada sesión del Learner Lab y hay que actualizarlas antes de desplegar.

El detalle de la infraestructura está en [docs/aws.md](docs/aws.md).

## Dominio

La aplicación está publicada en **http://www.ecorouter.me**. El dominio se obtuvo con el GitHub Student Developer Pack a través de Namecheap, y sus registros DNS están en Namecheap:

| Registro | Host | Apunta a |
|---|---|---|
| CNAME | `www` | `www.ecorouter.me.s3-website-us-east-1.amazonaws.com` (sitio web estático del bucket `www.ecorouter.me`) |
| CNAME | `api` | Application Load Balancer de la API |
| Redirección | `@` | `http://www.ecorouter.me` |

El bucket del frontend se llama igual que el subdominio (`www.ecorouter.me`) porque el sitio web estático de S3 solo responde a un dominio propio si coincide con el nombre del bucket. El sitio se sirve por HTTP, porque el alojamiento estático de S3 no ofrece HTTPS.

Mientras se propagan los cambios de DNS, el sitio también responde en la dirección directa del bucket: http://www.ecorouter.me.s3-website-us-east-1.amazonaws.com

## Estructura del proyecto

```
EcoRoute-Logistics/
├── .github/
│   ├── workflows/            # deploy-frontend, deploy-backend y deploy-lambda
│   └── pull_request_template.md
├── backend/
│   ├── migrations/           # Scripts SQL: PostGIS, vehículos, conductores, pedidos y rutas
│   └── src/
│       ├── app.js            # Configuración de Express y registro de rutas
│       ├── server.js         # Arranque del servidor
│       ├── s3.js             # Cliente de S3
│       └── routes/           # Endpoints de la API (health, archivos, ...)
├── docs/                     # Documentación de AWS
└── frontend/
    ├── app/                  # Páginas de Next.js (cada carpeta es una ruta)
    │   ├── layout.js         # Layout principal de toda la aplicación
    │   ├── page.js           # Landing (/)
    │   ├── login/            # Inicio de sesión (/login)
    │   ├── panel/            # Panel del administrador (/panel) y mapa (/panel/rutas)
    │   └── conductor/        # Portal del conductor (/conductor)
    ├── components/           # Navbar, encabezado del panel, ruta protegida y mapa
    ├── lib/                  # Sesión, estados de entrega y datos de ejemplo
    ├── public/               # Archivos estáticos
    └── next.config.mjs       # Exportación estática para S3
```

## Flujo de la aplicación

1. El usuario entra a la **landing** y hace clic en **Acceder**.
2. En **/login** ingresa su correo y contraseña. El frontend los envía a `POST /api/auth/login`, guarda el token JWT y redirige según el rol.
3. El **administrador** llega a **/panel**, donde ve el resumen de entregas del día y las filtra por estado. En **/panel/rutas** ve el mapa con la ruta de cada conductor trazada por las calles.
4. El **conductor** llega a **/conductor**, donde ve sus paradas en orden, abre cada dirección en Google Maps, toma una foto de la entrega, la marca como entregada o reporta una incidencia.
5. Las rutas `/panel` y `/conductor` están protegidas: sin sesión o con otro rol, el usuario vuelve al login o a su sección. La API valida el token en cada petición.

En producción, el navegador descarga el frontend desde el bucket `www.ecorouter.me` de S3. Las peticiones a la API van a `api.ecorouter.me`, pasan por el Application Load Balancer y llegan al contenedor de Express en EC2, que se conecta a PostgreSQL con PostGIS en RDS y guarda archivos en el bucket `ecoroute-datos`.

## Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Leaflet](https://leafletjs.com/) y [React Leaflet](https://react-leaflet.js.org/)
- [OSRM](https://project-osrm.org/), usado para trazar las rutas por las calles
- [Express](https://expressjs.com/es/)
- [PostGIS](https://postgis.net/documentation/)
- [Sitio web estático en Amazon S3](https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/WebsiteHosting.html)
- [GitHub Actions](https://docs.github.com/es/actions)
- [AWS Academy](https://www.awsacademy.com/)
- [Conventional Commits](https://www.conventionalcommits.org/es/)

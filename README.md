# BovWeightCR — App Móvil de Pesaje Bovino

Aplicación híbrida (Ionic + Vue 3 + Capacitor) para gestionar el pesaje de ganado bovino. Consume una API REST Laravel y funciona offline en zonas sin cobertura.

## Roles de usuario

| Rol | Acceso |
|-----|--------|
| **Admin** | Usuarios, bitácora, reportes, dashboard completo |
| **Ganadero** | Fincas, animales, pesajes (IA + manual), recordatorios, reportes |
| **Asistente** | Fincas, animales, pesajes (IA + manual), recordatorios |
| **Veterinario** | Solo consulta de animales y pesajes |

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Ionic 8 + Vue 3 (Composition API) |
| Build | Vite 5 |
| Nativo | Capacitor 8 |
| Lenguaje | TypeScript ~5.9 |
| Tests unitarios | Vitest 0.34.6 + jsdom |
| Tests e2e | Cypress 13 |
| HTTP | Axios |
| Android SDK | mínimo 22, target 35 (Android 15) |
| JDK | 21 |
| Node.js | 22 LTS |

## Requisitos previos

```bash
node --version   # >=22
java --version   # >=21
npm --version    # >=10
```

- [Android Studio](https://developer.android.com/studio) (para compilar APK)
- Opcional: [Ionic CLI](https://ionicframework.com/docs/cli) (`npm i -g @ionic/cli`)

## Instalación

```bash
git clone https://github.com/Mayloparra24/BowWeightCR_FrontEnd.git
cd BowWeightCR_FrontEnd
npm ci
```

## Variables de entorno

Copiar `.env.example` a `.env` y configurar la URL del backend:

```env
VITE_API_URL=https://bowweightcrbackend-production.up.railway.app/api
```

## Scripts disponibles

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Servidor de desarrollo Vite (web) |
| `npm run build` | Typecheck + build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | vue-tsc sin emitir |
| `npm run test:unit` | Tests unitarios (watch) |
| `npm run test:unit:coverage` | Tests + reporte de cobertura |
| `npm run test:e2e` | Tests end-to-end con Cypress |

## Desarrollo web

```bash
npm run dev
# Abrir en http://localhost:5173
```

## Desarrollo móvil (Android)

```bash
npm run build
npx cap sync android
npx cap open android
# En Android Studio: Run o emular
```

## Pruebas

```bash
# Unitarias con cobertura
npm run test:unit:coverage
# Reporte HTML en ./coverage/index.html

# End-to-end
npm run test:e2e
```

## CI/CD

El proyecto usa **GitHub Actions** con dos workflows:

- **CI** (`ci.yml`): En cada push/PR a `main`. Corre lint, typecheck, tests, build web y genera APK debug como artifact.
- **Release** (`release.yml`): Al pushear un tag `v*`. Compila APK firmado de release y crea un GitHub Release con el APK adjunto.

### Descargar APK del CI

1. Ir a **Actions** > **CI** > seleccionar la ejecución más reciente.
2. En la sección **Artifacts** > **app-debug**.
3. Descargar e instalar en el celular.

### Crear una release

```bash
git tag v1.0.0
git push origin v1.0.0
```

Esto dispara el workflow `Release APK` que firma el APK con el keystore configurado en los secrets del repositorio y publica un GitHub Release.

## Estructura del proyecto

```
src/
├── modules/
│   ├── admin/         # Gestión de usuarios y bitácora
│   ├── animales/      # Listado y detalle de bovinos
│   ├── auth/          # Login, cambio de contraseña, sesión
│   ├── dashboard/     # Inicio (home)
│   ├── fincas/        # CRUD de fincas
│   ├── pesajes/       # Pesaje IA y manual, cola offline
│   ├── recordatorios/ # Recordatorios
│   ├── reportes/      # Reporte compartido PDF
│   └── settings/      # Configuración
├── shared/
│   ├── api/           # Cliente Axios, DTOs, mappers, errores
│   ├── components/    # Componentes reutilizables
│   ├── layouts/       # Layout de tabs
│   ├── services/      # Repos, offline, utilerías
│   ├── types/         # Tipos de dominio
│   └── utils/         # Utilidades (foto bovino)
├── router/            # Vue Router + guards
└── theme/             # Variables CSS
tests/
├── unit/              # Tests Vitest
└── e2e/               # Tests Cypress
docs/                  # Documentación técnica
```

## Documentación técnica

Ver [docs/README.md](docs/README.md) para guías de arquitectura, API cliente, autenticación, cola offline y CI/CD.

## Créditos

Desarrollado para BovWeightCR.

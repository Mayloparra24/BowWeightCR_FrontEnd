# Arquitectura

## Capas

La app se organiza en cuatro capas:

```
Vistas (pages/*.vue)
    │
Servicios (services/*Repo.ts, sessionService.ts)
    │
Mapeo (api/mappers.ts) ←→ DTOs (api/types.ts)
    │
Cliente HTTP (api/client.ts) → API Laravel
```

### 1. Vistas (Vue SFC)

Cada módulo funcional tiene su carpeta en `src/modules/`. Las páginas usan Composition API (`<script setup lang="ts">`) y se cargan con lazy loading (`() => import(...)`) en el router.

### 2. Servicios

- **Repos** (`services/*Repo.ts`): encapsulan llamadas al API. Cada método devuelve tipos de dominio (`domain.ts`).
- **sessionService**: maneja el estado global del usuario autenticado (reactivo) y la persistencia en `@capacitor/preferences`.
- **offlineService**: cola de pesajes pendientes con reintentos automáticos.

### 3. Mapeo DTO → Dominio

El backend devuelve objetos en snake_case (DTOs). `api/mappers.ts` los transforma a camelCase con tipos de dominio (`domain.ts`). Esto aísla las vistas del formato del backend.

### 4. Cliente HTTP

Axios con `baseURL` desde `VITE_API_URL`. Interceptor de request adjunta el token Bearer. Interceptor de response detecta 401, limpia token y redirige a login.

## Router

Vue Router con rutas agrupadas:

- `/login`, `/cambiar-contrasena` — públicas
- `/app/*` — requieren autenticación (guard `router.beforeEach`)
- Metadatos `roles` por ruta para control de acceso

El guard de navegación evalúa: autenticación, cambio obligatorio de contraseña y roles.

## Sesión

1. `main.ts` → `router.isReady()` → `initSession()` → `GET /me`
2. `sessionService` guarda usuario en estado reactivo (`currentUser`) y en `Preferences`
3. Si el token expira, el interceptor 401 limpia todo y redirige

## Módulos

```
admin/        → usuarios, bitácora
animales/     → listado, detalle de bovinos
auth/         → login, cambio de contraseña
dashboard/    → página de inicio
fincas/       → CRUD de fincas
pesajes/      → estimación IA, pesaje manual, cola offline
recordatorios/→ recordatorios de pesaje
reportes/     → reporte compartido PDF
settings/     → configuración de la app
```

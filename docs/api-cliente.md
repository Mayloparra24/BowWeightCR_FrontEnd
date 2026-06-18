# Cliente API

## `api/client.ts`

Instancia de Axios configurada con:

```ts
baseURL: import.meta.env.VITE_API_URL    // del .env
```

### Interceptores

**Request:** agrega `Authorization: Bearer <token>` desde `@capacitor/preferences`.

**Response:** si el backend responde 401, limpia el token y ejecuta el `unauthorizedHandler` (redirige a `/login`).

### Token

`getToken()`, `setToken()`, `clearToken()` usan `@capacitor/preferences` para persistencia segura en el dispositivo.

## DTOs (`api/types.ts`)

El backend Laravel devuelve objetos en snake_case. Cada DTO refleja la respuesta exacta del Resource:

```ts
UsuarioDTO {
  id: number;
  nombre_completo: string;
  correo_electronico: string;
  rol: 'administrador' | 'ganadero' | 'veterinario' | 'asistente';
  esta_activo: boolean;
  debe_cambiar_contrasena?: boolean;
}
```

Todas las respuestas paginadas usan `ApiEnvelope<T>` y `PaginatedMeta`.

## Mappers (`api/mappers.ts`)

Transforman DTOs → tipos de dominio:

| DTO | Dominio |
|-----|---------|
| `UsuarioDTO` | `Usuario` |
| `FincaDTO` | `Finca` |
| `RazaDTO` | `Raza` |
| `PesajeDTO` | `RegistroPeso` |
| `BovinoDTO` | `Bovino` |
| `BitacoraDTO` | `BitacoraEvento` |

Ejemplo: `rol: 'administrador'` → `role: 'admin'`, `nombre_finca` → `name`.

## Manejo de errores (`api/errors.ts`)

`extractApiError()` extrae el mensaje del error de la respuesta del backend o devuelve un mensaje genérico.

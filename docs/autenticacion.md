# Autenticación

## Flujo de login

1. El usuario ingresa email y contraseña en `LoginPage.vue`.
2. `authRepo.login()` envía `POST /login`.
3. El backend devuelve token JWT + datos del usuario (con `debe_cambiar_contrasena`).
4. `sessionService.login()` guarda usuario en estado reactivo y en `Preferences`.
5. El guard de navegación redirige según el estado del usuario.

## Cambio obligatorio de contraseña

Si `debe_cambiar_contrasena` es `true`:

- El guard de navegación bloquea todas las rutas `/app/*` y redirige a `/cambiar-contrasena`.
- `ChangePasswordPage.vue` envía `POST /api/cambiar-contrasena`.
- El backend devuelve un nuevo token con `debe_cambiar_contrasena: false`.
- La sesión se actualiza automáticamente y el usuario accede a `/app/*`.

## Guard de navegación

En `router/index.ts`:

1. Si la ruta requiere auth y no hay usuario → `/login`.
2. Si el usuario está en login y ya autenticado → redirige a home.
3. Si el usuario debe cambiar contraseña y no está en esa ruta → `/cambiar-contrasena`.
4. Si la ruta tiene restricción de roles y el usuario no está autorizado → home.

## Restablecimiento desde admin

El admin puede resetear la contraseña de cualquier usuario desde `UserDetailPage.vue`:

```ts
PUT /api/usuarios/{id}  { contrasena: "nueva-clave" }
```

Esto pone `debe_cambiar_contrasena = true` en el backend, forzando al usuario a cambiarla en el próximo login.

## Cierre de sesión

`sessionService.logout()` envía `POST /logout` (opcional), limpia el token y el usuario reactivo, y redirige a `/login`.

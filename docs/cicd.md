# CI/CD

La URL del backend de producción está definida en `.env.production`. Este archivo está commitado al repo, por lo que los builds de CI incluyen automáticamente `VITE_API_URL` correcta.

## Workflows

### CI (`ci.yml`)

Se ejecuta en cada push y PR a `main`.

| Job | Descripción |
|-----|------------|
| `lint-and-test` | ESLint, vue-tsc typecheck, 21 tests unitarios con cobertura |
| `build-web` | Build de producción con Vite |
| `build-android` | Sincroniza Capacitor y compila APK debug |

El APK debug se sube como artifact (`app-debug`) y se puede descargar desde la UI de Actions.

### Release (`release.yml`)

Se ejecuta al pushear un tag que empiece con `v` (ej. `v1.0.0`).

1. Decodifica el keystore desde `RELEASE_KEYSTORE_BASE64` (secret).
2. Compila APK release firmado con `./gradlew assembleRelease`.
3. Crea un GitHub Release con el APK adjunto y release notes automáticos.

Si el keystore no está configurado, compila APK debug como fallback.

## Secrets de GitHub necesarios

Para releases firmados:

| Secret | Descripción |
|--------|------------|
| `RELEASE_KEYSTORE_BASE64` | Keystore codificado en base64 |
| `KEYSTORE_PASSWORD` | Contraseña del keystore |
| `KEY_ALIAS` | Alias de la clave |
| `KEY_PASSWORD` | Contraseña de la clave |

## Cómo crear un release

```bash
git checkout main
git pull origin main
git tag v1.0.0
git push origin v1.0.0
```

El workflow `Release APK` se dispara automáticamente. El APK firmado aparece en la página de Releases del repositorio.

## Descargar APK del CI

1. Ir al repositorio en GitHub > pestaña **Actions**.
2. Seleccionar **CI**.
3. Elegir la ejecución más reciente (pasó todos los checks).
4. En **Artifacts** > **app-debug**, descargar el APK.

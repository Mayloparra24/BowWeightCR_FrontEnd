# Cómo ejecutar el proyecto localmente

## En navegador web (desarrollo rápido)

```bash
npm run dev
# Abrir http://localhost:5173
```

Hot module replacement activo. El login requiere que el backend esté corriendo.

## En emulador Android

```bash
npm run build                        # genera dist/
npx cap sync android                 # sincroniza assets nativos
npx cap open android                 # abre Android Studio
```

En Android Studio: seleccionar un emulador y presionar Run.

## En dispositivo físico Android

```bash
npm run build
npx cap sync android
npx cap open android
```

En Android Studio: conectar el celular por USB con depuración USB activada, seleccionar el dispositivo y Run.

## En iOS (solo macOS)

```bash
npm run build
npx cap sync ios
npx cap open ios
```

# Aplicación Móvil Híbrida (Ionic + Vue 3 + Capacitor)

Este proyecto es una aplicación móvil desarrollada con tecnologías web modernas, compilada de forma nativa para Android e iOS sin el uso de frameworks nativos propietarios como Swift o Kotlin.

## 🛠️ Stack Tecnológico

*   **Framework Base:** [Ionic Framework v7+](https://ionicframework.com)
*   **Framework JavaScript:** [Vue 3](https://vuejs.org) (Composition API)
*   **Herramienta de Construcción:** [Vite](https://vitejs.dev)
*   **Puente Nativo:** [Capacitor v6+](https://capacitorjs.com)
*   **Lenguaje:** TypeScript

---

## 🚀 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
*   [Node.js](https://nodejs.org) (Versión LTS recomendada)
*   [Android Studio](https://android.com) (Para emular/compilar en Android)
*   [Xcode](https://apple.com) (Solo para macOS, necesario para emular/compilar en iOS)

---

## 📦 Instalación y Configuración

1. **Instalar dependencias del proyecto:**
   ```bash
   pnpm install
   ```

2. **Instalar la CLI global de Ionic (Opcional, pero recomendado):**
   ```bash
   npm install -g @ionic/cli
   ```

---

## 💻 Desarrollo Local (Entorno Web)

Para levantar el servidor de desarrollo local con Vite y recarga rápida (Hot Module Replacement):

```bash
ionic serve
```
La aplicación se abrirá automáticamente en `http://localhost:8100`.

---

## 📱 Despliegue en Dispositivos Móviles

### 1. Compilar la aplicación web
Cada vez que hagas cambios en Vue y quieras verlos en el móvil, debes generar la build de producción de Vite:
```bash
npm run build
```

### 2. Sincronizar con Capacitor
Copia los archivos compilados y actualiza los plugins nativos en las carpetas de Android e iOS:
```bash
ionic capacitor sync
```

### 3. Abrir en entornos nativos
Para ejecutar, emular o firmar la aplicación desde las herramientas oficiales:
 
*   **Android:**
    ```bash
    ionic capacitor open android
    ```
*   **iOS:** (Solo en macOS)
    ```bash
    ionic capacitor open ios
    ```

---

## 📁 Estructura del Proyecto

El código fuente principal se encuentra en la carpeta `/src`:
*   `src/modules/`: Pantallas y servicios organizados por módulo funcional.
*   `src/shared/`: Componentes, layouts, tipos y datos compartidos por las vistas.
*   `src/router/`: Configuración de rutas de navegación (Vue Router).
*   `src/theme/`: Variables globales de CSS y estilos de Ionic.

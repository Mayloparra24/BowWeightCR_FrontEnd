# Guia para colaboradores - BovWeightCR FrontEnd

Este documento resume el estado actual del frontend para que cualquier companero pueda continuar el proyecto sin romper la linea visual ni asumir que ya existen funcionalidades que todavia son mock o estan incompletas.

## Stack actual

- Framework principal: Ionic Vue.
- UI: Vue 3 con Composition API.
- Rutas: Vue Router mediante `@ionic/vue-router`.
- Build: Vite.
- Lenguaje: TypeScript.
- App movil: Capacitor.
- Iconos: `ionicons`.

Comandos principales:

```bash
npm run dev
npm run build
npm run test:unit
npm run test:e2e
npm run lint
```

## Estructura del proyecto

- `src/App.vue`: componente raiz de Ionic.
- `src/main.ts`: arranque de Vue/Ionic.
- `src/router/index.ts`: rutas, proteccion de sesion y control basico por rol.
- `src/theme/variables.css`: archivo reservado para variables globales de Ionic. Actualmente casi no se usa.
- `src/shared/`: componentes, layout, tipos y datos compartidos.
- `src/modules/`: pantallas por modulo funcional.

Modulos actuales:

- `auth`: login y servicio de sesion.
- `dashboard`: pantalla de inicio con variantes por rol.
- `fincas`: listado de fincas asignadas.
- `animales`: listado y detalle de bovinos.
- `admin`: gestion de usuarios, detalle de usuario, creacion de usuario y bitacora.
- `settings`: perfil basico y cierre de sesion.

## Roles y navegacion

Los roles definidos en `src/shared/types/domain.ts` son:

- `admin`
- `veterinario`
- `ganadero`

La sesion esta implementada en `src/modules/auth/services/sessionService.ts`. Por ahora usa usuarios demo desde `src/shared/data/mockData.ts` y guarda la sesion en `localStorage` con la llave `bovweight.session`.

El layout de tabs esta en `src/shared/layouts/AppTabsLayout.vue`.

Tabs por rol:

- Admin: Inicio, Usuarios, Bitacora, Configuracion.
- Veterinario: Inicio, Fincas, Configuracion.
- Ganadero: Inicio, Fincas, Bovinos, Configuracion.

Rutas protegidas para admin:

- `/app/usuarios`
- `/app/usuarios/crear`
- `/app/usuarios/:id`
- `/app/bitacora`

Importante: aunque algunas rutas no aparecen en los tabs de ciertos roles, existen rutas compartidas como fincas, bovinos y detalle de bovino. Revisar permisos antes de exponer nuevas entradas de navegacion.

## Estado funcional actual

### Login

Existe pantalla de login con validacion basica de correo y contrasena. El acceso depende de los usuarios demo en `mockData.ts`. No hay autenticacion real contra backend todavia.

Usuarios demo actuales:

- `admin@bovweight.cr` - rol admin.
- `ivan@bovweight.cr` - rol ganadero.
- `solano@vet.cr` - rol veterinario.

La contrasena solo se valida por largo minimo de 6 caracteres; no se compara contra una contrasena real.

### Inicio

`HomePage.vue` cambia segun rol:

- Admin: metricas administrativas, alertas y eventos. Las metricas estan en cero y los eventos estan vacios.
- Veterinario: muestra fincas asignadas, bovinos asignados y actividad reciente.
- Ganadero: muestra tarjeta de nuevo calculo, inventario, promedio y ultimos pesajes.

### Fincas

`FarmListPage.vue` lista solamente las fincas asignadas al usuario actual y permite buscar por nombre. Usa datos mock.

### Bovinos

`BovinoListPage.vue` lista bovinos visibles segun las fincas asignadas al usuario actual. Permite buscar por nombre o arete.

`BovinoDetailPage.vue` muestra perfil del bovino, grafico simple de evolucion de peso e historial. Es solo lectura.

### Admin

`UserManagementPage.vue` tiene UI para buscar y filtrar usuarios, pero actualmente `src/modules/admin/data/users.ts` exporta un arreglo vacio. Por eso la vista puede aparecer sin usuarios.

`CreateUserPage.vue` tiene flujo visual de dos pasos para crear usuario y asignar fincas, pero `availableFarms` esta vacio y no persiste usuarios. El boton de crear solo lleva a una pantalla de exito local.

`UserDetailPage.vue` muestra detalle de usuario si existe en `usuariosAdmin`, pero como el arreglo esta vacio normalmente no encontrara datos.

`AuditLogPage.vue` tiene filtros visuales, pero `events` esta vacio.

### Configuracion

`SettingsPage.vue` muestra informacion basica del usuario actual y permite cerrar sesion.

## Vista ganadero incompleta

La vista de rol ganadero NO debe considerarse terminada.

Lo que existe:

- Dashboard visual con tarjeta "Tomar foto".
- Resumen de inventario.
- Promedio de peso.
- Ultimos pesajes segun datos mock.
- Acceso a fincas y bovinos asignados.

Pendientes importantes:

- La tarjeta "Tomar foto" no abre camara ni flujo real de estimacion con IA.
- No existe creacion real de pesajes desde el ganadero.
- No existe integracion con backend.
- No existe persistencia de nuevos datos.
- No hay modulo completo para registrar, editar o administrar bovinos desde el ganadero.
- El detalle de bovino es solo lectura.
- El historial de pesos viene de `registrosPeso` mock.
- No hay validacion de permisos a nivel backend; solo filtrado frontend por fincas asignadas.

Cuando se trabaje en features del ganadero, tratar esta seccion como pendiente principal del producto.

## Paleta de colores actual

La app usa una identidad sobria basada en azules profundos, celestes suaves, blanco y grises neutros. No introducir colores nuevos sin validar que respeten esta familia.

Colores principales:

- Azul primario oscuro: `#052b66`
- Azul navy profundo: `#071832`
- Azul titulo/header: `#08254a`
- Azul alterno oscuro: `#082b65`
- Azul medio/acento: `#2f75b5`
- Azul medio para cards: `#5b8fc0`
- Celeste de apoyo: `#8bb7e5`
- Celeste claro: `#b7d8f0`
- Celeste claro alterno: `#b7dff7`
- Celeste suave: `#cfe0f5`
- Celeste fondo/chips: `#d8e8f7`
- Fondo general claro: `#f5f8fb`
- Blanco: `#ffffff`

Neutros:

- Texto principal: `#071832`
- Texto secundario: `#566071`
- Gris iconos/secundario: `#6f7a8a`
- Gris medio: `#a8acb8`
- Gris tarjetas/listas: `#d9d9d9`
- Borde claro: `#e4e8ef`

Colores de estado ya usados:

- Error: `#d92d20`
- Texto de error: `#b42318`
- Fondo inactivo/error suave: `#ff7373`
- Texto sobre error suave: `#571010`
- Advertencia: `#fff08a`
- Texto advertencia: `#74601d`

Reglas de uso:

- Usar `#052b66` para botones principales, cards importantes y estados activos.
- Usar `#071832` o `#08254a` para texto fuerte y paneles oscuros.
- Usar `#2f75b5`, `#5b8fc0`, `#8bb7e5` y celestes para acentos, chips, enlaces y cards secundarias.
- Usar `#f5f8fb` como fondo principal de pantallas operativas.
- Usar `#ffffff` para superficies limpias, inputs y cards claras.
- Evitar colores fuera de la paleta, especialmente verdes, morados, naranjas o rojos decorativos.
- Usar rojo solo para error, peligro o estado inactivo.
- Usar amarillo solo para advertencias puntuales.

Recomendacion tecnica: centralizar esta paleta en `src/theme/variables.css` antes de seguir creciendo. Actualmente muchos colores estan definidos dentro de estilos `scoped`, lo que aumenta el riesgo de inconsistencias.

## Lineamientos visuales

- Mantener enfoque mobile-first. Muchas pantallas usan ancho maximo entre `390px` y `430px`.
- Mantener cards con radios moderados, normalmente `8px` a `10px`.
- Mantener sombras suaves con tonos azul oscuro y baja opacidad.
- Usar `ionicons` para acciones e iconografia.
- Evitar textos muy grandes dentro de cards pequenas.
- Evitar mezclar nuevos estilos de botones: seguir los botones redondeados actuales para acciones principales y chips.
- Mantener los estados vacios con borde dashed, fondo blanco semitransparente y texto secundario.
- Mantener los listados con busqueda arriba cuando aplique.

## Datos mock y limitaciones

Los datos principales estan en `src/shared/data/mockData.ts`:

- `usuariosDemo`
- `fincas`
- `bovinos`
- `registrosPeso`

Limitaciones actuales:

- No hay API real.
- No hay store global tipo Pinia/Vuex.
- No hay persistencia real excepto sesion en `localStorage`.
- La gestion admin no crea usuarios reales.
- La bitacora esta vacia.
- Las metricas admin estan hardcodeadas en cero.
- Algunas cadenas aparecen con problemas de encoding en la UI, por ejemplo textos con tildes o signos de apertura mal renderizados.

## Recomendaciones para nuevas features

- Antes de crear una pantalla nueva, revisar si pertenece a `src/modules/<modulo>/pages`.
- Reutilizar tipos de `src/shared/types/domain.ts`.
- Si se agregan datos compartidos temporales, ubicarlos en `src/shared/data/` y marcar que son mock.
- Si se agrega UI compartida, ubicarla en `src/shared/components/`.
- Si una pantalla depende del rol, revisar `AppTabsLayout.vue`, `router/index.ts` y `sessionService.ts`.
- No agregar colores nuevos directamente en componentes. Primero revisar la paleta anterior.
- Si se necesita un color nuevo por estado, documentarlo aqui y justificar su uso.
- Corregir el problema de encoding antes de meter mucho texto nuevo en pantallas.
- Cuando se conecte backend, reemplazar progresivamente `mockData.ts` y evitar mezclar datos reales con mocks sin nombre claro.

## Pendientes sugeridos

1. Centralizar variables de color en `src/theme/variables.css`.
2. Corregir encoding de textos con tildes y signos de apertura.
3. Definir contrato de backend para login, usuarios, fincas, bovinos y pesajes.
4. Completar flujo ganadero de estimacion por foto.
5. Completar creacion y persistencia de usuarios admin.
6. Llenar bitacora con eventos reales.
7. Reemplazar metricas admin hardcodeadas por datos reales.
8. Agregar pruebas unitarias o e2e para login, rutas por rol y filtros de fincas/bovinos.

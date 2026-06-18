# Cola offline de pesajes

## Problema

Las zonas rurales tienen conectividad intermitente. El usuario necesita estimar peso por IA o registrar un pesaje manual incluso sin internet.

## Solución

`offlineService.ts` implementa una cola FIFO con persistencia local.

### Flujo

1. El usuario hace una estimación IA o un pesaje manual sin conexión.
2. `enqueueEstimacion()` o `enqueuePesajeManual()` guarda el item en `Preferences` (metadatos) y opcionalmente la foto en `Filesystem`.
3. El item aparece en la UI con estado `pending`.
4. Cuando la conexión se restaura, `offlineService` detecta el cambio via `@capacitor/network` (nativo) o eventos `online`/`offline` (web).
5. `sincronizar()` procesa cada item en orden: reenvía la petición al backend.
6. Si el item se sincroniza correctamente → `synced` (se elimina de la cola).
7. Si falla → `failed` (se reintenta hasta 3 veces).

### Persistencia

- **Metadatos**: `Preferences` (clave `bovweight.offline.queue`).
- **Fotos grandes**: `Filesystem` en `Directory.Data` (solo en nativo). En web se guarda el base64 en el mismo item.

### Estado visual

El componente `HomePage.vue` muestra el contador de items pendientes y permite forzar la sincronización manual.

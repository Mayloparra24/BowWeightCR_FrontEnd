# Cómo ejecutar las pruebas

## Tests unitarios (Vitest)

21 tests que cubren: `authRepo`, `mappers`, `offlineService`, `bovinoPhoto`, `login`, `reminder`.

```bash
# Una vez (modo CI)
npm run test:unit

# Con reporte de cobertura
npm run test:unit:coverage
# Abrir ./coverage/index.html en el navegador
```

### Mock de Axios

Los tests usan `vi.mock` para interceptar `apiClient` y evitar llamadas reales al backend.

## Tests end-to-end (Cypress)

```bash
npm run test:e2e
```

Requiere el servidor de desarrollo corriendo.

## Vista rápida de cobertura

```bash
npm run test:unit:coverage
npx vite preview --port 4173 --outDir coverage
```

# Cómo contribuir

## Commits

- Escribir los mensajes en **español**.
- Usar el formato `tipo: descripción breve`:

```bash
git commit -m "feat: agregar filtro de bovinos por raza"
git commit -m "fix: corregir cálculo de peso en estimación IA"
git commit -m "docs: actualizar README con pasos de instalación"
git commit -m "refactor: extraer lógica de mapeo a mapper separado"
```

## Convenciones de código

- Usar Composition API (`<script setup lang="ts">`).
- Tipado estricto: evitar `any`, preferir tipos explícitos.
- Nombres de archivos: `PascalCase` para componentes `.vue`, `camelCase` para `.ts`.
- DTOs en snake_case (reflejan el backend), tipos de dominio en camelCase.
- Los mappers son el único lugar donde se transforma snake_case ↔ camelCase.

## Flujo de trabajo

```bash
git checkout -b feature/mi-cambio
# hacer cambios…
npm run lint && npm run typecheck && npm run test:unit
git add -A
git commit -m "feat: descripción del cambio"
git push origin feature/mi-cambio
# Crear PR a main
```

## Antes de un PR

- [ ] `npm run lint` sin errores.
- [ ] `npm run typecheck` sin errores.
- [ ] `npm run test:unit` todos verdes.
- [ ] `npm run build` exitoso.

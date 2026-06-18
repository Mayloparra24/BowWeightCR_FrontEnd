# Instalación

## Requisitos

- Node.js >=22 LTS
- npm >=10
- JDK >=21 (para compilar Android)
- Android Studio (para emular/firmar APK)

## Pasos

```bash
git clone https://github.com/Mayloparra24/BowWeightCR_FrontEnd.git
cd BowWeightCR_FrontEnd
npm ci
```

## Configurar entorno

```bash
cp .env.example .env
```

Editar `.env` con la URL del backend:

```env
VITE_API_URL=https://bowweightcrbackend-production.up.railway.app/api
```

## Verificar instalación

```bash
npm run typecheck    # 0 errores
npm run test:unit    # todos los tests pasan (verdes)
```

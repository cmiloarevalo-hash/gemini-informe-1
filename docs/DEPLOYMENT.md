# Guía de Despliegue y Ejecución

## 1. Modo Prototipo Local / AI Studio Dev
- Servidor Full-Stack Express sirviendo la API REST y montando los middlewares de Vite:
```bash
npm run dev
```
- El servidor escucha en el puerto `3000` (`http://localhost:3000`).

## 2. Construcción para Producción
```bash
npm run build
npm run start
```
`npm run build` compila el frontend React a `/dist`. `npm run start` ejecuta `server.ts` sirviendo los archivos estáticos de producción y las rutas de API.

## 3. Comandos de Auditoría y Verificación
```bash
npm run audit          # Valida la integridad del Audit Bundle
npm run audit:bundle   # Regenera los metadatos y matrices de auditoría
npm run audit:no-mocks # Escanea el código fuente en busca de mocks o datos simulados
npm run test           # Ejecuta la suite de pruebas obligatorias T-DOC, T-EVD, T-TOPO, etc.
```

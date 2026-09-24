# Protocolo de Seguridad y Gestión de Secretos

## 1. Principio de Cero Fuga
- La variable `GEMINI_API_KEY` se consume única y exclusivamente en `server.ts` y componentes del directorio `src/core/providers/`.
- Queda prohibida la inyección de `process.env.GEMINI_API_KEY` en `vite.config.ts` mediante `define` o variables con prefijo `VITE_`.
- El frontend no almacena API keys en `localStorage`, `sessionStorage`, cookies no protegidas ni en el DOM.

## 2. Aislamiento Multi-Inquilino (Anti-Contaminación)
- Cada consulta de datos o proceso analítico valida:
```typescript
if (document.userId !== currentUser.id || document.studyId !== currentStudy.id) {
  throw new SecurityError("Cross-study contamination detected or unauthorized tenant access.");
}
```

## 3. Manejo de Archivos Subidos
- Los buffers se reciben en memoria o rutas temporales volátiles con limpieza tras análisis.
- Se calculan hashes SHA-256 independientes inmediatamente tras la recepción.
- No se ejecutan comandos de shell ni binarios externos sobre los archivos cargados.

# Operaciones, Resiliencia y Mantenimiento

## 1. Gestión de Trabajos Asíncronos (Jobs)
Cada análisis ejecutado se asocia a un `jobId` inmutable con los siguientes estados:
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `FAILED`

Si un job falla, se registra la causa en `incident-log` y se categoriza si es reintentable (ej. `PROVIDER_RATE_LIMIT` o `PROVIDER_TIMEOUT`).

## 2. Reanálisis desde Cero
La acción "Reanalizar desde cero" descarta hechos y conclusiones previas, preserva intactos los documentos originales recibidos y genera un nuevo `jobId` ejecutando el pipeline de 12 fases sin reciclar artefactos anteriores.

## 3. Política de Conservación y Purga
- Los estudios, documentos y hashes se conservan hasta que el usuario ejecute "Eliminar Estudio".
- Al eliminar un estudio, se purgan sus archivos locales asociados, metadatos, evidencias y jobs.

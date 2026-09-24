# Configuración y Variables del Sistema

## Variables de Entorno
| Variable | Ámbito | Descripción | Requerido |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server (`server.ts`) | Llave de API para el SDK `@google/genai`. Inyectada por Google AI Studio. | Sí |
| `PORT` | Server (`server.ts`) | Puerto HTTP del servidor Express. Por defecto: `3000`. | Opcional |
| `NODE_ENV` | Server | Entorno de ejecución (`development` o `production`). | Opcional |
| `APP_URL` | Server | URL pública del servicio. Inyectada automáticamente en Cloud Run. | Opcional |

## Reglas de Configuración
1. Nunca crear campos en la UI para solicitar la API Key al usuario final.
2. Nunca prefijar llaves con `VITE_` para evitar su empaquetado en el bundle cliente.
3. El frontend consume la API exclusivamente a través de endpoints relativos (`/api/*`).

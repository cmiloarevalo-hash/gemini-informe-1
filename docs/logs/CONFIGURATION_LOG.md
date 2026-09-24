# Registro de Configuración del Sistema (Configuration Log)

| Fecha | Parámetro / Componente | Valor / Estado | Justificación |
| :--- | :--- | :--- | :--- |
| 2026-09-23 | Runtime | tsx server.ts (Express) + Vite SPA | Arquitectura Full-Stack para resguardar la API Key server-side |
| 2026-09-23 | Puerto | 3000 | Requisito estricto del entorno AI Studio dev server |
| 2026-09-23 | Model Gateway | gemini-3.8-flash (primario), gemini-3.6-flash (alias) | Modelos vigentes oficiales según especificación |
| 2026-09-23 | Storage Mode | In-memory Buffer + Local Safe Storage | Prototipo gratuito sin facturación obligatoria |
| 2026-09-23 | Max Upload Size | 25 MB | Adecuado para escrituras y planos PDF de alta resolución |

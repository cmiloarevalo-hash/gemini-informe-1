# Limitaciones Conocidas y Áreas de Trabajo Futuro

1. **OCR en Documentos Manuscritos Antiguos:** Las inscripciones anteriores a 1970 con caligrafía manuscrita degradada pueden requerir preprocesamiento de imagen de alta resolución o revisión humana asistida.
2. **Google Picker en Entorno Sandbox AI Studio:** En modo `FREE_PROTOTYPE`, el flujo interactivo de OAuth requiere consentimiento del usuario. La arquitectura está lista (`ARCHITECTURE_READY`) para activar `set_up_oauth` con scope `drive.file`.
3. **Cuotas de Free Tier de Gemini:** Las llamadas repetidas en batch masivo están sujetas a los límites de RPM del nivel gratuito de Google AI Studio. El sistema implementa retroceso exponencial (exponential backoff) para mitigar el error 429.
4. **Documentos No Oficiales:** La plataforma clasifica pero advierte cuando un antecedente es una fotocopia simple sin firma ni timbre electrónico o notarial.

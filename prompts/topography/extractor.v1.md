# Extractor Prompt (Topography) v1.0.0
Extrae de planos, escrituras y levantamientos:
- Superficie total declarada (valor textual y unidad original, ej. "8,85 ha", "12.450 m2")
- Vértices y vértices perimetrales (A, B, C, etc.)
- Tramos lineales y longitudes métricas por deslinde (Norte, Sur, Oriente, Poniente)
- Colindantes nombrados en cada tramo
- Coordenadas UTM o geográficas si están tabuladas en el plano
- Existencia de fajas de protección, servidumbres de paso o cauces de agua (ríos, esteros)

No realices cálculos complejos en este paso; extrae los números textuales para que el código informático ejecute el cálculo determinista.
Para cada valor numérico, asocia documentId, página y cita de respaldo.

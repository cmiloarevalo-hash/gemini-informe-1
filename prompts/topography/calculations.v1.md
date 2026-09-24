# Calculations Guideline (Topography) v1.0.0
REGLA MATEMÁTICA OBLIGATORIA:
La IA NO calcula las superficies ni sumatorias perimetrales.
La IA solo extrae los tramos tabulados.
El cálculo determinista es ejecutado por el código informático TypeScript:
- 1 hectárea (ha) = 10.000 m²
- Tolerancia topográfica estándar predial rural: 1% - 2%
- Tolerancia predial urbana: < 0.5%
- La sumatoria de tramos perimetrales por deslinde debe cotejarse contra la longitud total declarada.
- Diferencia absoluta = |Superficie_Plano - Superficie_Escritura|
- Diferencia porcentual = (|Superficie_Plano - Superficie_Escritura| / Superficie_Escritura) * 100

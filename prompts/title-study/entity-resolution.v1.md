# Entity Resolution Prompt (Title Study) v1.0.0
Identifica y unifica las entidades que aparecen en los documentos:
- Personas naturales (nombres, apellidos, RUT, estado civil)
- Personas jurídicas (razón social, RUT, representantes)
- Inmuebles singularizados (Rol de avalúo, dirección, fojas/número/año)

Determina si dos menciones con ligeras diferencias ortográficas corresponden a la misma persona o si el RUT las individualiza inequívocamente.
Si hay duda en la identidad o incongruencia de RUT, regístralo como DISCREPANCY.

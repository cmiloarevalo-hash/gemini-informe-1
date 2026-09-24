# Title Chain Prompt (Title Study) v1.0.0
Construye la cadena de tradición hacia atrás para el período estudiado (mínimo 10 o 30 años según alcance):
Para cada eslabón registra:
- Vendedor / Tradente
- Comprador / Adquirente
- Tipo de título (Compraventa, Posesión Efectiva, Donación, Permuta, etc.)
- Fecha de escritura, Notaría y Repertorio
- Inscripción de Dominio (Fojas, Número, Año, CBR)
- Referencia al título antecedente
- Estado del eslabón:
  - CONFIRMED_LINK (documento aportado y verificado)
  - REFERENCED_BUT_NOT_PROVIDED (mencionado en la escritura pero no adjuntado)
  - MISSING_LINK (quiebre de tracto sucesivo)
  - CONTRADICTORY_LINK (inscripciones contradictorias)
  - UNVERIFIED_LINK

NO DECLARAR:
- "cadena ininterrumpida"
- "títulos ajustados a derecho"
- "tradición saneada"
si existen eslabones faltantes, contradicciones o documentos no aportados.

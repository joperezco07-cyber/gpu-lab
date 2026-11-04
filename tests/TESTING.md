# Pruebas funcionales – GPU LAB 1.0

Automáticas: `node tests/validate-data.mjs` y `python3 tests/smoke.py` (resultado en esta entrega: sin errores de consola en escritorio 1280×800 ni móvil 390×780).

## Lista manual

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Abrir el enlace sin sesión | Carga sin pedir registro; aparece el visor 3D |
| 2 | Cambiar entre las 5 tarjetas | Geometría distinta (largo, ventiladores, VRAM, fases) y ficha actualizada |
| 3 | Botones Frontal / Posterior / Lateral / Iso | La cámara se mueve suavemente |
| 4 | Rotar, zoom, desplazar (ratón y táctil) | Funciona |
| 5 | Tocar una pieza o su etiqueta | Se resalta y se abre su ficha completa |
| 6 | Desactivar Etiquetas / Ventiladores | Desaparecen las etiquetas / se detiene el giro |
| 7 | Slider Despiece | Las piezas se separan y vuelven |
| 8 | Desmontaje pasos 1→6 y «Volver a montar» | Las piezas salen en orden; se resalta lo relevante; el montaje restaura todo |
| 9 | Diagnóstico básico: elegir caso, usar herramientas, emitir diagnóstico | Resultado con puntos, diagnóstico razonado y explicación |
| 10 | Diagnóstico avanzado | Exige causa + componente + reparación; muestra desglose |
| 11 | Repetir el mismo caso varias veces | La causa puede cambiar (variantes aleatorias) |
| 12 | Cada una de las 9 herramientas | Muestra aviso «simulación» y resultados coherentes con el caso |
| 13 | Caso 2 (ventilador) | Un ventilador deja de girar en 3D y el monitor muestra 0 RPM |
| 14 | Quiz básico y avanzado | 8 preguntas, retroalimentación, puntuación guardada |
| 15 | Juego «identifica en 3D» | Pide un componente, valida el toque, sin etiquetas |
| 16 | Pestaña Progreso | Totales, mejores puntuaciones, apodo y borrado |
| 17 | Móvil 390 px | Sin desbordamiento horizontal; panel inferior con scroll |
| 18 | Recargar la página | Se conservan puntuaciones (mismo navegador) |

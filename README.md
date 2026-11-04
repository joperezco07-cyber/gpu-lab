# GPU LAB 1.0 – Laboratorio virtual de tarjetas gráficas

Simulador educativo 3D para explorar, desmontar, identificar componentes y diagnosticar fallas de tarjetas gráficas **desde el navegador**, sin cuentas, sin instalar nada y sin costos (sitio estático, apto para GitHub Pages).

> **Transparencia:** los modelos 3D son **representaciones educativas procedurales** (generadas con Three.js), no réplicas exactas de productos comerciales. Todas las mediciones de las herramientas virtuales son **simuladas** y ficticias. El modo instructor/multijugador (GPU LAB 2.0) **aún no está implementado**.

## Qué incluye la versión 1.0

| Requisito | Estado |
|---|---|
| 5 tarjetas (RTX 4090, RTX 4060, RX 7900 XTX, Arc A770, GPU genérica) con ficha técnica y geometría diferenciada | ✅ |
| Vistas frontal, posterior, lateral e isométrica; rotar, zoom, desplazar | ✅ |
| 12 componentes seleccionables con ficha completa (función, principio, fallas, síntomas, inspección, herramientas, soluciones, advertencias), etiquetas on/off | ✅ |
| Despiece (slider) y desmontaje paso a paso con animación y montaje | ✅ |
| 6 escenarios de diagnóstico (con 2–4 variantes aleatorias cada uno) | ✅ |
| 9 herramientas virtuales interactivas (resultados simulados) | ✅ |
| Nivel básico y avanzado, quiz, juego «identifica el componente en 3D» | ✅ |
| Puntuación individual guardada en el navegador (sin cuenta) | ✅ |
| Interfaz adaptable a móvil, tablet y escritorio | ✅ (probado en Chrome headless 1280×800 y 390×780) |
| Modelos GLB creados en Blender | ⏳ GPU LAB 1.5 |
| Modo instructor, salas, 40 participantes, tiempo real | ⏳ GPU LAB 2.0 |

## 1. Estructura de carpetas

```
gpu-lab/
├── index.html            # Página única
├── css/styles.css        # Estilos (tema oscuro, responsive)
├── js/
│   ├── main.js           # Interfaz: pestañas, diagnóstico, quiz, progreso
│   ├── viewer.js         # Escena Three.js, cámara, selección, etiquetas, despiece
│   ├── models.js         # Modelos procedurales de las tarjetas
│   ├── tools.js          # 9 herramientas virtuales (simuladas)
│   ├── data.js           # Tarjetas, componentes, desmontaje, escenarios, quiz
│   └── store.js          # Puntuación en localStorage
├── vendor/               # Three.js r187 + OrbitControls + RoomEnvironment (local, sin CDN)
├── assets/models/        # Reservado para GLB (1.5)
├── tests/                # validate-data.mjs, smoke.py, TESTING.md
└── package.json
```

## 2. Configurar el entorno y ejecutar localmente

No hay paso de compilación. Solo necesitas un servidor de archivos estáticos (los módulos ES no funcionan abriendo `index.html` con doble clic).

```bash
cd gpu-lab
python3 -m http.server 8080      # o: npx serve .
# abre http://localhost:8080
```

Requisitos: un navegador moderno con WebGL (Chrome, Edge, Firefox, Safari recientes).

## 3. Probar compatibilidad móvil

- **Rápido:** Chrome/Edge → F12 → icono de dispositivo → elige un teléfono.
- **Teléfono real:** con el PC y el teléfono en la misma red Wi-Fi, ejecuta el servidor y abre `http://IP-DE-TU-PC:8080` en el teléfono.
- Gestos: un dedo rota, dos dedos acercan/desplazan, toque corto selecciona un componente.

## 4. Importar modelos 3D propios (GLB) – hoja de ruta 1.5

La versión 1.0 genera la geometría por código en `js/models.js`. Para sustituirla por modelos de Blender: exporta GLB (Draco/meshopt, texturas ≤1024 px), guárdalos en `assets/models/`, nombra cada malla con el id de componente (`die`, `vram`, `vrm`…) y carga con `GLTFLoader` (cópialo de `three/examples/jsm/loaders` a `vendor/`). Mantén el campo `userData.compId` y `step/offset` por pieza para que el desmontaje siga funcionando.

## 5. Publicar gratis en GitHub Pages y obtener el enlace público

1. Crea una cuenta en github.com y un repositorio **público** nuevo, p. ej. `gpu-lab`.
2. Sube el proyecto:
   ```bash
   cd gpu-lab
   git init && git add . && git commit -m "GPU LAB 1.0"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/gpu-lab.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. Espera 1–2 minutos. El enlace será `https://TU_USUARIO.github.io/gpu-lab/` (aparece en la misma pantalla).
5. Cada `git push` actualiza el sitio.

Alternativas gratuitas equivalentes: Netlify Drop (arrastrar la carpeta), Cloudflare Pages, Vercel.

## 6. Compartir en Microsoft Teams

- **Mensaje/canal:** pega el enlace público; Teams muestra una vista previa.
- **Pestaña fija:** en el canal → **+** → **Sitio web** → pega el URL → Guardar. Se abre dentro de Teams.
- **Reunión:** comparte el enlace en el chat de la reunión; cada participante lo abre en su navegador.
- Si la pestaña web de Teams no muestra el visor 3D, usa «Abrir en el navegador».

## 7. Probar el acceso de participantes sin cuenta

1. Abre el enlace en una ventana de incógnito o en otro dispositivo sin sesión iniciada.
2. Verifica que carga sin pedir registro y que el visor 3D aparece.
3. Completa un caso y comprueba la pestaña **Progreso**.
4. Nota: la puntuación vive en `localStorage` del navegador; en incógnito se pierde al cerrar.

## 8. Pruebas

```bash
npm test                 # o: node tests/validate-data.mjs  (integridad de datos)
python3 tests/smoke.py   # prueba de humo en navegador (requiere Playwright y Chrome)
```
Lista funcional manual en `tests/TESTING.md`.

## 9. Dependencias

| Paquete | Versión | Uso | Licencia |
|---|---|---|---|
| three | 0.187.0 (copiado en `vendor/`) | Motor 3D | MIT |
| OrbitControls, RoomEnvironment | de three/examples | Cámara y entorno de iluminación | MIT |

Sin dependencias en tiempo de ejecución externas (no usa CDN). Para pruebas: Node ≥ 18; Python 3 + Playwright (opcional).

## 10. Limitaciones conocidas

- Modelos procedurales: no reproducen la geometría exacta de ningún producto; se indica en la interfaz.
- Datos técnicos (arquitectura, memoria, bus, consumo) son de referencia y pueden variar según fabricante/versión; verifícalos antes de usarlos como material oficial.
- Los casos usan evidencia sintética y no sustituyen formación práctica con equipo real ni normas de seguridad eléctrica.
- No hay cuentas ni servidor: puntuaciones solo locales.
- No probado en dispositivos físicos Apple/Android en este entorno (solo emulación de viewport en Chrome).

## 11. Hoja de ruta

- **1.5:** modelos GLB de Blender, despiece por modelo, más escenarios, procedimientos de reparación guiados con pasos.
- **2.0:** panel de instructor, salas con código, hasta 40 participantes, temporizador, clasificación en tiempo real con Supabase o Firebase (plan gratuito). Hasta que se implemente y pruebe, **no existe sincronización multijugador**.

// GPU LAB – datos educativos (tarjetas, componentes, desmontaje, escenarios, quiz)
// Los modelos 3D son REPRESENTACIONES EDUCATIVAS procedurales, no réplicas exactas.

export const GPUS = [
  {
    id: 'rtx4090', name: 'NVIDIA GeForce RTX 4090', short: 'RTX 4090', vendor: 'NVIDIA',
    arch: 'Ada Lovelace (GPU AD102)', mem: '24 GB GDDR6X', bus: '384 bits', bandwidth: '≈1008 GB/s',
    tdp: '450 W (TBP de referencia)', tdpW: 450,
    connectors: 'PCIe 4.0 x16 · 1× 16 pines 12VHPWR · 3× DisplayPort 1.4a · 1× HDMI 2.1a',
    cooling: 'Disipador de aluminio de gran tamaño (~3.5 ranuras), heatpipes, cámara de vapor y 3 ventiladores axiales (en esta representación)',
    internals: 'GPU de gran tamaño, 12 módulos de VRAM alrededor del núcleo, VRM de muchas fases, backplate.',
    note: 'Representación educativa: el número de ventiladores y las proporciones varían según el fabricante.',
    model: { len: 15, wid: 7, slots: 3.5, fans: 3, vram: 12, phases: 10, ring: [2.0, 1.9], shroud: 0x15181d, accent: 0xb6e24a, die: 1.3 }
  },
  {
    id: 'rtx4060', name: 'NVIDIA GeForce RTX 4060', short: 'RTX 4060', vendor: 'NVIDIA',
    arch: 'Ada Lovelace (GPU AD107)', mem: '8 GB GDDR6', bus: '128 bits', bandwidth: '≈272 GB/s',
    tdp: '115 W (TBP de referencia)', tdpW: 115,
    connectors: 'PCIe 4.0 x8 (conector x16) · 1× 8 pines · 3× DisplayPort 1.4a · 1× HDMI 2.1a',
    cooling: 'Disipador compacto de 2 ranuras, heatpipes y 2 ventiladores axiales',
    internals: 'GPU pequeña, 4 módulos de VRAM, VRM de pocas fases, PCB corto.',
    note: 'Representación educativa de una tarjeta compacta de gama media.',
    model: { len: 9.5, wid: 5.5, slots: 2, fans: 2, vram: 4, phases: 4, ring: [1.3, 1.2], shroud: 0x1c2026, accent: 0x76b900, die: 0.9 }
  },
  {
    id: 'rx7900xtx', name: 'AMD Radeon RX 7900 XTX', short: 'RX 7900 XTX', vendor: 'AMD',
    arch: 'RDNA 3 (GPU Navi 31, diseño de chiplets)', mem: '24 GB GDDR6', bus: '384 bits', bandwidth: '≈960 GB/s',
    tdp: '355 W (TBP de referencia)', tdpW: 355,
    connectors: 'PCIe 4.0 x16 · 2× 8 pines · 2× DisplayPort 2.1 · 1× HDMI 2.1 · 1× USB-C',
    cooling: 'Disipador de ~2.5 ranuras con cámara de vapor y 2 ventiladores axiales',
    internals: 'Módulo GCD central rodeado por 6 chiplets de caché MCD, 12 módulos de VRAM, VRM de varias fases.',
    note: 'Representación educativa: no modela los chiplets MCD individualmente.',
    model: { len: 14, wid: 6.5, slots: 2.5, fans: 2, vram: 12, phases: 8, ring: [2.0, 1.9], shroud: 0x23262b, accent: 0xe5322d, die: 1.2 }
  },
  {
    id: 'arca770', name: 'Intel Arc A770', short: 'Arc A770', vendor: 'Intel',
    arch: 'Alchemist (GPU ACM-G10)', mem: '16 GB GDDR6', bus: '256 bits', bandwidth: '≈560 GB/s',
    tdp: '≈225 W', tdpW: 225,
    connectors: 'PCIe 4.0 x16 · 1× 8 pines + 1× 6 pines · 3× DisplayPort 2.0 · 1× HDMI 2.1',
    cooling: 'Disipador de 2 ranuras con 2 ventiladores axiales',
    internals: 'GPU monolítica, 8 módulos de VRAM, VRM de fases medias.',
    note: 'Representación educativa; los diseños de socios de Intel difieren.',
    model: { len: 14, wid: 6, slots: 2, fans: 2, vram: 8, phases: 6, ring: [1.8, 1.6], shroud: 0x20242c, accent: 0x2f8cff, die: 1.2 }
  },
  {
    id: 'generic', name: 'GPU genérica de laboratorio', short: 'GPU Lab', vendor: 'Educativa',
    arch: 'Arquitectura ficticia de laboratorio', mem: '8 GB GDDR6', bus: '256 bits', bandwidth: '≈448 GB/s (ejemplo)',
    tdp: '200 W (ejemplo)', tdpW: 200,
    connectors: 'PCIe x16 · 1× 8 pines · 3× DisplayPort · 1× HDMI',
    cooling: 'Disipador de 2 ranuras, heatpipes y 2 ventiladores',
    internals: 'Modelo didáctico simplificado: 8 módulos de VRAM, 5 fases de VRM.',
    note: 'No corresponde a ningún producto comercial; sirve para practicar identificación de componentes.',
    model: { len: 11, wid: 5.5, slots: 2, fans: 2, vram: 8, phases: 5, ring: [1.8, 1.6], shroud: 0x1a2330, accent: 0x38bdf8, die: 1.1 }
  }
];

export const COMPONENTS = [
  {
    id: 'die', name: 'GPU Die (núcleo gráfico)',
    location: 'Centro del PCB, bajo la placa de contacto del disipador.',
    func: 'Ejecuta los cálculos gráficos y de cómputo (sombreadores, rasterización, trazado de rayos, IA).',
    principle: 'Miles de millones de transistores CMOS conmutan a GHz; la energía eléctrica se convierte en cálculo y casi toda termina como calor, que se extrae por contacto con la placa fría mediante pasta térmica.',
    failures: ['Degradación por sobrecalentamiento sostenido', 'Microgrietas en bolas de soldadura (BGA) por ciclos térmicos', 'Pasta térmica seca que eleva la temperatura'],
    symptoms: ['Artefactos o pantalla negra bajo carga', 'Thermal throttling frecuente', 'No hay imagen aunque la tarjeta recibe energía'],
    inspection: ['Monitoreo de temperatura y hotspot', 'Prueba de estabilidad', 'Inspección visual de pasta y huella de contacto', 'Cámara térmica'],
    tools: ['Software de monitoreo', 'Destornillador de precisión', 'Pasta térmica', 'Alcohol isopropílico'],
    solutions: ['Renovar pasta térmica', 'Corregir presión de montaje', 'Si el die/BGA está dañado: reparación avanzada o reemplazo de la tarjeta'],
    warnings: ['No tocar la superficie del die con herramientas metálicas.', 'Desconectar la alimentación y descargar electricidad estática antes de abrir.']
  },
  {
    id: 'vram', name: 'VRAM (módulos de memoria)',
    location: 'Alrededor del GPU Die, normalmente en anillo.',
    func: 'Almacena texturas, buffers y datos de la GPU con gran ancho de banda.',
    principle: 'Chips GDDR conectados al núcleo por un bus ancho (p. ej. 128–384 bits). Cada chip aporta parte del bus; el ancho de banda total = bus × velocidad por pin.',
    failures: ['Celdas defectuosas', 'Soldadura BGA fisurada', 'Sobrecalentamiento por pads inadecuados'],
    symptoms: ['Puntos de colores y texturas corruptas', 'Congelamientos y reinicios del controlador', 'Errores en prueba de memoria'],
    inspection: ['Prueba de memoria', 'Monitor de temperatura de VRAM', 'Cámara térmica sobre la zona de VRAM'],
    tools: ['Software de prueba de memoria', 'Termómetro / cámara térmica'],
    solutions: ['Mejorar enfriamiento (pads correctos)', 'Restaurar frecuencias de fábrica', 'Reemplazo del módulo (reballing, solo taller especializado)'],
    warnings: ['El reballing requiere equipo profesional; no es una reparación casera.', 'Evitar overclock de memoria si hay síntomas.']
  },
  {
    id: 'vrm', name: 'VRM (módulo regulador de voltaje)',
    location: 'Zona de potencia, cerca del conector de alimentación auxiliar.',
    func: 'Convierte los 12 V de entrada en las tensiones bajas y muy corrientes que necesitan la GPU y la VRAM.',
    principle: 'Convertidor reductor (buck) multifase: un controlador PWM reparte la carga entre varias fases para reducir rizado y calor.',
    failures: ['Controlador PWM defectuoso', 'Fases degradadas por calor', 'Rizado excesivo'],
    symptoms: ['Reinicios o pantalla negra bajo carga', 'Inestabilidad al cambiar de carga', 'Apagado del equipo'],
    inspection: ['Análisis de alimentación', 'Multímetro en salida de Vcore', 'Cámara térmica sobre la zona del VRM'],
    tools: ['Multímetro', 'Osciloscopio (taller)', 'Cámara térmica'],
    solutions: ['Reemplazar componentes de la fase defectuosa', 'Diagnóstico del controlador en banco', 'Reemplazo de la tarjeta si el daño es extenso'],
    warnings: ['Hay tensiones y corrientes elevadas: trabajar con la tarjeta desconectada.', 'Los capacitores pueden mantener carga.']
  },
  {
    id: 'mosfet', name: 'MOSFET / etapas de potencia',
    location: 'En cada fase del VRM, junto a los inductores.',
    func: 'Interruptores de potencia que conmutan la corriente hacia el inductor de cada fase.',
    principle: 'Un MOSFET alto y uno bajo conmutan alternadamente a cientos de kHz; las pérdidas de conducción y conmutación generan calor.',
    failures: ['Cortocircuito drenaje-fuente', 'Sobrecalentamiento', 'Daño por sobretensión o corriente'],
    symptoms: ['Apagado inmediato al conectar la fuente', 'Olor a quemado', 'Tensión de núcleo ausente'],
    inspection: ['Prueba de diodo con multímetro (equipo apagado)', 'Inspección visual de quemaduras', 'Cámara térmica'],
    tools: ['Multímetro', 'Estación de aire caliente / soldador SMD (taller)', 'Lupa o microscopio'],
    solutions: ['Reemplazar el MOSFET por uno equivalente', 'Revisar el controlador/driver que lo alimenta'],
    warnings: ['Soldadura SMD de precisión: solo personal capacitado.', 'No energizar una tarjeta con corto sin diagnóstico previo.']
  },
  {
    id: 'inductors', name: 'Inductores (chokes)',
    location: 'Junto a cada MOSFET en las fases del VRM.',
    func: 'Almacenan energía en un campo magnético y suavizan la corriente entregada a la GPU.',
    principle: 'Un inductor se opone a cambios rápidos de corriente; junto con los capacitores forma el filtro de salida del convertidor.',
    failures: ['Saturación por sobrecorriente', 'Bobinado abierto', 'Zumbido (coil whine)'],
    symptoms: ['Zumbido agudo bajo carga', 'Fase sin entrega de corriente', 'Calentamiento localizado'],
    inspection: ['Escucha del zumbido', 'Cámara térmica', 'Medición de continuidad del bobinado'],
    tools: ['Multímetro', 'Cámara térmica'],
    solutions: ['El coil whine suele ser benigno: limitar FPS o ajustar curva de energía', 'Reemplazar inductor dañado'],
    warnings: ['Pueden calentarse mucho durante el uso; dejar enfriar antes de manipular.']
  },
  {
    id: 'capacitors', name: 'Capacitores',
    location: 'Salida del VRM, alrededor del núcleo y la entrada de alimentación.',
    func: 'Filtran el rizado y suministran corriente instantánea en picos de carga.',
    principle: 'Almacenan carga eléctrica; los de polímero/electrolíticos filtran en baja frecuencia y los cerámicos (MLCC) cerca de la GPU en alta frecuencia.',
    failures: ['Abombamiento y pérdida de capacitancia', 'ESR elevada', 'Fisura en MLCC'],
    symptoms: ['Reinicios con picos de carga', 'Rizado elevado en Vcore', 'Inestabilidad al hacer overclock'],
    inspection: ['Inspección visual (tapas abombadas)', 'Análisis de alimentación (rizado)', 'Medición de capacitancia en taller'],
    tools: ['Multímetro con capacímetro', 'Osciloscopio (taller)', 'Lupa'],
    solutions: ['Reemplazar por equivalentes en capacitancia, tensión y ESR'],
    warnings: ['Descargar los capacitores antes de manipular.', 'Respetar la polaridad al sustituir.']
  },
  {
    id: 'pcb', name: 'PCB (placa de circuito impreso)',
    location: 'Base de toda la tarjeta; soporta los demás componentes.',
    func: 'Interconecta eléctricamente todos los componentes y los sostiene mecánicamente.',
    principle: 'Varias capas de cobre y aislante forman pistas de datos y planos de alimentación/tierra con impedancia controlada.',
    failures: ['Pistas dañadas', 'Delaminación por calor', 'Placa flexionada por peso del disipador (sag)'],
    symptoms: ['Fallos intermitentes', 'Zonas quemadas', 'Problemas de contacto en el conector'],
    inspection: ['Inspección visual con buena luz', 'Prueba de continuidad', 'Revisión de curvatura'],
    tools: ['Lupa / microscopio', 'Multímetro'],
    solutions: ['Soporte anti-flexión', 'Reparación de pistas en taller', 'Reemplazo de tarjeta si el daño es extenso'],
    warnings: ['No flexionar la placa al desmontar.', 'Usar pulsera antiestática.']
  },
  {
    id: 'fans', name: 'Ventiladores',
    location: 'Parte superior de la tarjeta, dentro de la cubierta (shroud).',
    func: 'Fuerzan aire a través de las aletas del disipador para extraer calor.',
    principle: 'Un motor sin escobillas hace girar las aspas; la controladora ajusta la velocidad por PWM según la temperatura.',
    failures: ['Rodamiento desgastado', 'Motor quemado', 'Cable/conector suelto', 'Obstrucción mecánica'],
    symptoms: ['Un ventilador no gira', 'Ruido mecánico o vibración', 'Temperaturas elevadas con ventiladores al máximo'],
    inspection: ['Monitor de ventiladores (RPM)', 'Giro manual con el equipo apagado', 'Medición de 12 V en el conector'],
    tools: ['Destornillador de precisión', 'Multímetro', 'Aire comprimido'],
    solutions: ['Reconectar o reemplazar el ventilador', 'Retirar obstrucciones', 'Lubricación solo si el diseño lo permite'],
    warnings: ['No introducir objetos con el ventilador en movimiento.', 'Desconectar la tarjeta antes de manipular.']
  },
  {
    id: 'heatsink', name: 'Disipador (aletas y placa fría)',
    location: 'Sobre la GPU y los módulos de VRAM/VRM, bajo los ventiladores.',
    func: 'Absorbe el calor de los componentes y lo cede al aire.',
    principle: 'La placa fría (cobre/cámara de vapor) conduce el calor hacia aletas de aluminio de gran superficie, donde el aire forzado lo retira.',
    failures: ['Aletas obstruidas por polvo', 'Tornillos flojos o presión desigual', 'Corrosión o deformación'],
    symptoms: ['Temperaturas altas', 'Temperaturas desiguales entre GPU y VRAM', 'Throttling'],
    inspection: ['Inspección visual de aletas', 'Comparación de temperaturas GPU vs hotspot', 'Revisión de tornillos y huella de contacto'],
    tools: ['Brocha antiestática', 'Aire comprimido', 'Destornillador de precisión'],
    solutions: ['Limpieza', 'Remontaje con apriete en cruz', 'Reemplazo de pads y pasta'],
    warnings: ['Aflojar y apretar los tornillos en cruz y gradualmente.', 'No doblar las aletas.']
  },
  {
    id: 'heatpipes', name: 'Heatpipes (tubos de calor)',
    location: 'Atraviesan las aletas desde la placa fría.',
    func: 'Transportan calor desde la zona caliente hacia toda la superficie de aletas.',
    principle: 'Tubos de cobre sellados con fluido: se evapora en el extremo caliente y se condensa en el frío, regresando por capilaridad.',
    failures: ['Pérdida de fluido o vacío por golpes', 'Aplastamiento o doblez', 'Mal contacto con la placa'],
    symptoms: ['Aletas lejanas frías y núcleo muy caliente', 'Temperaturas altas pese a ventiladores sanos'],
    inspection: ['Cámara térmica sobre el disipador', 'Inspección visual de deformaciones'],
    tools: ['Cámara térmica', 'Lupa'],
    solutions: ['Reemplazar el conjunto de disipador'],
    warnings: ['No intentar abrir ni perforar los heatpipes.']
  },
  {
    id: 'pads', name: 'Thermal pads',
    location: 'Entre los módulos de VRAM/VRM y la placa del disipador.',
    func: 'Rellenan el espacio entre componentes de distinta altura y el disipador para conducir el calor.',
    principle: 'Láminas elásticas térmicamente conductoras: deben tener el espesor correcto para presionar sin aplastar el chip.',
    failures: ['Espesor incorrecto', 'Resecado o aplastamiento', 'Desplazamiento al remontar'],
    symptoms: ['VRAM/VRM muy calientes con GPU normal', 'Temperaturas desiguales'],
    inspection: ['Inspección de huella al desmontar', 'Cámara térmica', 'Monitor de temperatura de VRAM'],
    tools: ['Calibre', 'Pads del espesor especificado', 'Pinzas'],
    solutions: ['Reemplazar por pads del espesor y dureza correctos', 'Recolocar cubriendo todo el chip'],
    warnings: ['Un pad demasiado grueso puede inclinar el disipador sobre el die.']
  },
  {
    id: 'pcie', name: 'Conector PCIe y alimentación auxiliar',
    location: 'Borde inferior del PCB (slot de contactos dorados) y borde superior/trasero (conector de energía).',
    func: 'Comunican la tarjeta con la placa base (datos y hasta 75 W) y reciben alimentación adicional de la fuente.',
    principle: 'Pares diferenciales de alta velocidad PCIe más pines de 12 V; el cable auxiliar entrega la mayor parte de la potencia.',
    failures: ['Pines sucios o oxidados', 'Conector auxiliar flojo o quemado', 'Contactos desgastados'],
    symptoms: ['Pantalla negra bajo carga', 'Tarjeta no detectada', 'Caída de tensión en el conector'],
    inspection: ['Inspección visual de contactos y plástico', 'Multímetro en 12 V bajo carga', 'Análisis de alimentación'],
    tools: ['Alcohol isopropílico', 'Multímetro', 'Lupa'],
    solutions: ['Limpiar contactos', 'Insertar completamente el cable', 'Reemplazar cable o conector dañado'],
    warnings: ['Insertar a fondo y sin doblar bruscamente el cable.', 'Un conector derretido es riesgo de incendio: no usar.']
  }
];

export const DISASSEMBLY = [
  { n: 1, title: 'Retirar la cubierta', text: 'Quita los tornillos de la cubierta (shroud) y levántala con cuidado, sin tirar de los cables de los ventiladores.', tech: 'La cubierta dirige el flujo de aire y aloja los conectores de los ventiladores.', focus: ['fans'] },
  { n: 2, title: 'Separar los ventiladores', text: 'Desconecta los cables de los ventiladores de la placa y retira el conjunto.', tech: 'Cada ventilador usa un conector de 4 pines (12 V, tierra, tacómetro y PWM).', focus: ['fans'] },
  { n: 3, title: 'Retirar el disipador', text: 'Afloja los tornillos de la placa fría en cruz, poco a poco, y levanta el conjunto.', tech: 'El apriete en cruz evita inclinar la placa fría sobre el die. En esta etapa también se retira la backplate.', focus: ['heatsink', 'heatpipes'] },
  { n: 4, title: 'Identificar los thermal pads', text: 'Observa los pads sobre VRAM y VRM. Anota su ubicación y espesor antes de retirarlos.', tech: 'Los pads compensan diferencias de altura entre chips y el disipador.', focus: ['pads'] },
  { n: 5, title: 'Observar die, VRAM y VRM', text: 'Con todo retirado, identifica el GPU Die, los módulos de VRAM y las etapas de alimentación.', tech: 'La VRAM se agrupa alrededor del núcleo para acortar pistas; el VRM se ubica cerca de la entrada de energía.', focus: ['die', 'vram', 'vrm', 'mosfet', 'inductors', 'capacitors'] },
  { n: 6, title: 'Reconocer conexiones internas', text: 'Identifica el slot PCIe, el conector de alimentación auxiliar y las pistas hacia los puertos de video.', tech: 'Datos por PCIe; potencia por 12 V auxiliar. Todo comparte el PCB.', focus: ['pcie', 'pcb'] }
];

export const REPAIRS = {
  clean: 'Limpiar disipador y ventiladores (aire/brocha) y comprobar giro libre',
  airflow: 'Mejorar el flujo de aire del chasis (entrada y extracción, orden de cables)',
  pads: 'Reemplazar los thermal pads por otros del espesor y dureza especificados',
  repaste: 'Desmontar, limpiar la superficie y aplicar pasta térmica nueva',
  remount: 'Reinstalar el disipador apretando los tornillos en cruz y gradualmente',
  fanReplace: 'Reemplazar el ventilador (o el conjunto) defectuoso',
  fanReconnect: 'Reconectar el cable del ventilador a su conector y asegurarlo',
  fanConn: 'Reparar o reemplazar el conector del ventilador en el PCB (taller)',
  fanClear: 'Retirar la obstrucción y revisar holguras y recorrido de cables',
  vramRework: 'Reemplazar módulos de VRAM mediante reballing (taller) o cambiar la tarjeta',
  gpuReplace: 'Reparación avanzada del núcleo no viable en casa: reemplazar la tarjeta',
  coolVram: 'Mejorar el enfriamiento de VRAM (pads nuevos y revisión del disipador)',
  driver: 'Reinstalar controladores con limpieza completa y restaurar frecuencias de fábrica',
  psu: 'Probar con otra fuente de capacidad adecuada y sustituir la defectuosa',
  auxConn: 'Reemplazar cable/conector auxiliar dañado y asegurar inserción completa',
  vrmBench: 'Diagnóstico del controlador VRM en banco y reparación en taller',
  mosfetReplace: 'Reemplazar el MOSFET/etapa de potencia defectuoso por uno equivalente (SMD, taller)',
  capReplace: 'Reemplazar capacitores abombados por equivalentes de igual capacitancia y ESR',
  powerLimit: 'Restablecer el límite de energía (power limit) a su valor predeterminado',
  config: 'Corregir la configuración: conectar el monitor a la tarjeta, ajustar modo de energía y ranura PCIe',
  coolChassis: 'Mejorar la refrigeración del equipo (chasis, ventiladores de entrada y salida)',
  none: 'Sin acción de hardware'
};

// Evidencia base (tarjeta sana). Cada variante aplica un parche.
export const BASE = {
  meter: {
    aux12v: { label: 'Entrada 12 V (conector auxiliar, bajo carga)', v: '12.05 V', flag: 'ok', note: 'Dentro de tolerancia (±5 %).' },
    slot12v: { label: '12 V del slot PCIe', v: '12.08 V', flag: 'ok', note: 'Normal.' },
    vcore: { label: 'Salida del VRM – Vcore', v: '0.95 V', flag: 'ok', note: 'Estable bajo carga.' },
    vram: { label: 'Riel de VRAM', v: '1.35 V', flag: 'ok', note: 'Normal.' },
    mosfet: { label: 'Prueba de diodo – MOSFET fase 1 (equipo apagado)', v: '0.46 V', flag: 'ok', note: 'Caída directa típica.' },
    short: { label: 'Continuidad 12 V ↔ GND (equipo apagado)', v: 'OL (sin corto)', flag: 'ok', note: 'Sin cortocircuito.' },
    fanpwr: { label: 'Alimentación del conector del ventilador 2', v: '12.0 V', flag: 'ok', note: 'Normal.' }
  },
  temps: { idle: { gpu: 38, vram: 40, vrm: 42 }, load: { gpu: 68, vram: 76, vrm: 72 } },
  hotspotDelta: 8,
  thermalExtra: [],
  power: { loadPct: 95, limit: false },
  fanState: 'normal',
  memtest: { errors: 0, note: 'Sin errores en toda la memoria evaluada.' },
  stress: { ok: true, clockPct: 100, note: 'Estable durante toda la prueba; frecuencia sostenida.' },
  visual: {
    fans: { z: 'Ventiladores', t: 'Rotores libres, sin holgura excesiva.', s: 'ok' },
    sink: { z: 'Disipador', t: 'Aletas limpias, sin obstrucciones.', s: 'ok' },
    pcb: { z: 'PCB / VRM', t: 'Sin componentes abombados ni zonas quemadas.', s: 'ok' },
    conn: { z: 'Conector aux.', t: 'Pines y plástico sin decoloración.', s: 'ok' },
    pads: { z: 'Pasta y pads (desmontado)', t: 'Huella uniforme de pasta y pads.', s: 'ok' }
  },
  rails: {
    aux: { n: '12 V aux. bajo carga', v: '12.0 V', f: 'ok' },
    sag: { n: 'Caída en transitorio', v: '0.2 V', f: 'ok' },
    rip12: { n: 'Rizado 12 V', v: '45 mV', f: 'ok' },
    ripVcore: { n: 'Rizado Vcore', v: '18 mV', f: 'ok' },
    connT: { n: 'Temp. conector auxiliar', v: '42 °C', f: 'ok' }
  }
};

const T = (g, v, r) => ({ temps: { load: { gpu: g, vram: v, vrm: r } } });

export const SCENARIOS = [
  {
    id: 'heat', title: 'Caso 1: Sobrecalentamiento', icon: '🔥',
    brief: 'Un cliente informa que su tarjeta se calienta mucho y pierde rendimiento en juegos largos.',
    symptoms: ['Temperatura elevada', 'Rendimiento reducido', 'Ventiladores a máxima velocidad'],
    causes: [
      { id: 'dust', text: 'Polvo acumulado en disipador y ventiladores', comp: 'heatsink', fix: 'clean' },
      { id: 'airflow', text: 'Mala ventilación del chasis', comp: 'fans', fix: 'airflow' },
      { id: 'pads', text: 'Thermal pads dañados o desplazados', comp: 'pads', fix: 'pads' },
      { id: 'paste', text: 'Pasta térmica deteriorada', comp: 'die', fix: 'repaste' },
      { id: 'contact', text: 'Contacto incorrecto con el disipador', comp: 'heatsink', fix: 'remount' }
    ],
    variants: [
      { cause: 'dust', why: 'Las aletas están obstruidas por polvo: el aire no atraviesa el disipador, todas las zonas se calientan por igual y los ventiladores trabajan al máximo.',
        patch: { ...T(91, 93, 86), fanState: 'max', stress: { ok: false, clockPct: 76, note: 'Reduce frecuencia a los 3 min por temperatura (thermal throttling).' }, visual: { sink: { t: 'Aletas obstruidas por pelusa y polvo compacto.', s: 'bad' }, fans: { t: 'Capa de polvo en las aspas; giran libres.', s: 'warn' } } } },
      { cause: 'paste', why: 'El GPU Die está mucho más caliente que la VRAM/VRM y hay gran diferencia hotspot–GPU: la transferencia en el núcleo falla porque la pasta está reseca.',
        patch: { ...T(95, 76, 70), hotspotDelta: 20, fanState: 'max', stress: { ok: false, clockPct: 72, note: 'Throttling térmico del núcleo.' }, visual: { pads: { t: 'Pasta seca, agrietada y desplazada del die.', s: 'bad' } } } },
      { cause: 'airflow', why: 'El disipador y los ventiladores están sanos, pero el aire que entra al disipador ya está muy caliente: la caja cerrada recircula el calor.',
        patch: { ...T(84, 88, 80), fanState: 'max', stress: { ok: false, clockPct: 88, note: 'La temperatura sube lento y se estabiliza alta.' }, visual: { fans: { t: 'Ventiladores sanos. El aire de entrada mide ≈47 °C (caja cerrada sin extracción).', s: 'warn' } } } }
    ]
  },
  {
    id: 'fan', title: 'Caso 2: Ventilador defectuoso', icon: '🌀',
    brief: 'Se escucha un ruido anormal y uno de los ventiladores parece no girar.',
    symptoms: ['Un ventilador no gira', 'Temperatura elevada', 'Ruido mecánico'],
    causes: [
      { id: 'motor', text: 'Motor del ventilador defectuoso', comp: 'fans', fix: 'fanReplace' },
      { id: 'cable', text: 'Cable del ventilador desconectado', comp: 'fans', fix: 'fanReconnect' },
      { id: 'conn', text: 'Conector del ventilador dañado en el PCB', comp: 'pcb', fix: 'fanConn' },
      { id: 'obstr', text: 'Obstrucción mecánica en las aspas', comp: 'fans', fix: 'fanClear' },
      { id: 'dust', text: 'Polvo en las aletas del disipador', comp: 'heatsink', fix: 'clean' }
    ],
    variants: [
      { cause: 'motor', why: 'El conector entrega 12 V pero el rotor no gira: el motor del ventilador está averiado.',
        patch: { ...T(86, 90, 78), fanState: 'oneStopped', meter: { fanpwr: { v: '12.0 V', flag: 'ok', note: 'Hay tensión, pero el rotor no gira.' } }, visual: { fans: { t: 'El ventilador 2 no gira; a mano se siente rascado irregular.', s: 'bad' } } } },
      { cause: 'cable', why: 'No hay tensión en el conector del ventilador y el rotor gira libre a mano: el cable no hace contacto.',
        patch: { ...T(84, 88, 76), fanState: 'oneStopped', meter: { fanpwr: { v: '0.0 V', flag: 'bad', note: 'Sin tensión: no hay contacto en el cable.' } }, visual: { fans: { t: 'El ventilador 2 gira libre a mano; el conector está flojo en su zócalo.', s: 'warn' } } } },
      { cause: 'obstr', why: 'El motor tiene tensión pero consume de más y se frena: un objeto roza las aspas y provoca ruido.',
        patch: { ...T(80, 84, 74), fanState: 'noisy', meter: { fanpwr: { v: '12.0 V (corriente alta)', flag: 'warn', note: 'El motor se esfuerza más de lo normal.' } }, visual: { fans: { t: 'Un cable roza las aspas; golpeteo audible.', s: 'bad' } } } }
    ]
  },
  {
    id: 'artifact', title: 'Caso 3: Artefactos gráficos', icon: '🎮',
    brief: 'Aparecen puntos de colores, líneas y texturas corruptas durante los juegos.',
    symptoms: ['Puntos de colores', 'Líneas', 'Texturas corruptas', 'Errores durante juegos'],
    causes: [
      { id: 'vram', text: 'Módulos de VRAM defectuosos', comp: 'vram', fix: 'vramRework' },
      { id: 'gpu', text: 'Falla del GPU Die', comp: 'die', fix: 'gpuReplace' },
      { id: 'temp', text: 'Temperaturas elevadas en la memoria', comp: 'pads', fix: 'coolVram' },
      { id: 'driver', text: 'Controladores gráficos defectuosos', comp: null, fix: 'driver' }
    ],
    variants: [
      { cause: 'vram', why: 'La prueba de memoria muestra miles de errores incluso con temperatura normal: los chips de VRAM fallan.',
        patch: { memtest: { errors: 1243, note: 'Errores en direcciones fijas, también a baja temperatura.' }, stress: { ok: false, clockPct: 100, note: 'Aparecen artefactos a los 20 s.' } } },
      { cause: 'driver', why: 'La memoria pasa la prueba y la tarjeta es estable en cargas sintéticas; los artefactos aparecen tras actualizar el controlador, en una sola aplicación.',
        patch: { memtest: { errors: 0, note: 'Sin errores.' }, stress: { ok: true, clockPct: 100, note: 'Estable en prueba sintética; los artefactos solo aparecen en una aplicación tras actualizar el controlador.' } } },
      { cause: 'temp', why: 'La VRAM supera 100 °C y falla solo en caliente: los thermal pads están resecos y no la enfrían.',
        patch: { ...T(80, 108, 80), memtest: { errors: 12, note: 'Errores solo cuando la VRAM supera 100 °C; a 60 °C no hay errores.' }, visual: { pads: { t: 'Pads de VRAM aplastados y resecos.', s: 'bad' } } } }
    ]
  },
  {
    id: 'power', title: 'Caso 4: Problemas de alimentación', icon: '⚡',
    brief: 'El equipo se apaga o se reinicia cuando se exige a la tarjeta.',
    symptoms: ['Pantalla negra bajo carga', 'Reinicios', 'Inestabilidad', 'Apagado del equipo'],
    causes: [
      { id: 'psu', text: 'Fuente de alimentación insuficiente o defectuosa', comp: null, fix: 'psu' },
      { id: 'conn', text: 'Conector de alimentación auxiliar dañado', comp: 'pcie', fix: 'auxConn' },
      { id: 'vrm', text: 'Falla en el controlador del VRM', comp: 'vrm', fix: 'vrmBench' },
      { id: 'mosfet', text: 'MOSFET en cortocircuito', comp: 'mosfet', fix: 'mosfetReplace' },
      { id: 'caps', text: 'Capacitores degradados', comp: 'capacitors', fix: 'capReplace' }
    ],
    variants: [
      { cause: 'conn', why: 'El 12 V auxiliar cae a 10.9 V bajo carga y el conector está a 86 °C: mala conexión con plástico dañado.',
        patch: { meter: { aux12v: { v: '10.9 V', flag: 'bad', note: 'Caída excesiva bajo carga.' } }, rails: { aux: { v: '10.9 V', f: 'bad' }, sag: { v: '1.1 V', f: 'bad' }, connT: { v: '86 °C', f: 'bad' } }, stress: { ok: false, clockPct: 100, note: 'Pantalla negra a los 40 s de carga.' }, visual: { conn: { t: 'Plástico del conector decolorado; un pin con marca de arco.', s: 'bad' } } } },
      { cause: 'mosfet', why: 'La prueba de diodo da 0 V y hay un corto parcial 12 V–GND: un MOSFET del VRM está en cortocircuito.',
        patch: { meter: { mosfet: { v: '0.00 V (corto)', flag: 'bad', note: 'Sin caída de diodo: en cortocircuito.' }, short: { v: '0.4 Ω', flag: 'bad', note: 'Corto parcial 12 V ↔ GND.' }, vcore: { v: '0.00 V', flag: 'bad', note: 'Sin tensión de núcleo.' } }, stress: { ok: false, clockPct: 0, note: 'Apagado inmediato al aplicar carga.' }, visual: { pcb: { t: 'Marca de quemado cerca de la fase 3 del VRM.', s: 'bad' } } } },
      { cause: 'caps', why: 'El rizado de Vcore es muy alto y hay capacitores abombados: la fase ya no filtra los picos de carga.',
        patch: { rails: { ripVcore: { v: '140 mV', f: 'bad' } }, stress: { ok: false, clockPct: 100, note: 'Reinicios aleatorios con picos de carga.' }, visual: { pcb: { t: 'Dos capacitores con la parte superior abombada.', s: 'bad' } } } },
      { cause: 'psu', why: 'El rizado del 12 V es muy alto y el conector está frío: el origen es la fuente, no la tarjeta.',
        patch: { rails: { aux: { v: '11.3 V', f: 'warn' }, sag: { v: '0.9 V', f: 'warn' }, rip12: { v: '210 mV', f: 'bad' } }, stress: { ok: false, clockPct: 100, note: 'El equipo se apaga a los 60 s; con otra fuente no ocurre.' } } }
    ]
  },
  {
    id: 'perf', title: 'Caso 5: Rendimiento reducido', icon: '📉',
    brief: 'Los FPS son bajos aunque la tarjeta es potente.',
    symptoms: ['FPS bajos', 'Frecuencias reducidas', 'Temperaturas elevadas'],
    causes: [
      { id: 'throttle', text: 'Thermal throttling del núcleo', comp: 'die', fix: 'repaste' },
      { id: 'power', text: 'Limitación de energía (power limit)', comp: null, fix: 'powerLimit' },
      { id: 'config', text: 'Configuración incorrecta', comp: null, fix: 'config' },
      { id: 'cooling', text: 'Problemas de refrigeración del chasis', comp: 'fans', fix: 'coolChassis' }
    ],
    variants: [
      { cause: 'power', why: 'La temperatura es normal pero la frecuencia está limitada por el límite de energía: la tarjeta no puede consumir más.',
        patch: { power: { loadPct: 55, limit: true }, stress: { ok: false, clockPct: 62, note: 'Frecuencia limitada por Power Limit.' } } },
      { cause: 'config', why: 'La GPU usa solo 25 % y todo está frío: el juego usa otra GPU o el monitor está en la placa base.',
        patch: { power: { loadPct: 25, limit: false }, ...T(48, 52, 50), stress: { ok: true, clockPct: 100, note: 'En la prueba sintética rinde al 100 %. En el juego la GPU usa 25 %.' }, visual: { pcb: { t: 'El monitor está conectado a la salida de la placa base, no a la tarjeta.', s: 'warn' } } } },
      { cause: 'throttle', why: 'El núcleo supera 90 °C con gran diferencia de hotspot y la frecuencia baja: la pasta del núcleo está deteriorada.',
        patch: { ...T(92, 90, 84), hotspotDelta: 14, fanState: 'max', stress: { ok: false, clockPct: 68, note: 'Thermal throttling a 90 °C.' }, visual: { pads: { t: 'Pasta térmica endurecida y con huecos.', s: 'bad' } } } }
    ]
  },
  {
    id: 'contact', title: 'Caso 6: Contacto térmico deficiente', icon: '🧊',
    brief: 'Después de reparar la tarjeta, algunas zonas calientan mucho más que otras.',
    symptoms: ['Temperaturas desiguales', 'VRAM o VRM demasiado calientes', 'Transferencia térmica deficiente'],
    causes: [
      { id: 'padswrong', text: 'Thermal pads de espesor incorrecto', comp: 'pads', fix: 'pads' },
      { id: 'mount', text: 'Mala instalación del disipador', comp: 'heatsink', fix: 'remount' },
      { id: 'uneven', text: 'Pads desplazados con contacto irregular', comp: 'pads', fix: 'pads' },
      { id: 'paste', text: 'Pasta térmica seca en el núcleo', comp: 'die', fix: 'repaste' },
      { id: 'dust', text: 'Polvo en el disipador', comp: 'heatsink', fix: 'clean' }
    ],
    variants: [
      { cause: 'padswrong', why: 'La VRAM está muy caliente con GPU normal y los pads miden menos de lo necesario: no tocan el disipador.',
        patch: { ...T(70, 104, 92), visual: { pads: { t: 'Pads de 0.5 mm sobre VRAM: demasiado delgados, sin contacto.', s: 'bad' } } } },
      { cause: 'mount', why: 'Hay un punto caliente en una esquina y dos tornillos flojos: el disipador queda inclinado.',
        patch: { ...T(88, 84, 76), thermalExtra: [{ x: 0.2, y: 0.2, r: 0.1, t: 96 }], visual: { sink: { t: 'Dos tornillos de esquina flojos; disipador inclinado.', s: 'bad' }, pads: { t: 'Huella de pasta más gruesa en un lado.', s: 'warn' } } } },
      { cause: 'uneven', why: 'Solo parte del VRM está caliente: un pad se desplazó y cubre solo la mitad de los MOSFET.',
        patch: { ...T(72, 80, 106), thermalExtra: [{ x: 0.74, y: 0.3, r: 0.08, t: 104 }], visual: { pads: { t: 'Pad del VRM desplazado: cubre la mitad de los MOSFET.', s: 'bad' } } } }
    ]
  }
];

export const QUIZ = [
  // Nivel básico
  { lvl: 'basic', q: '¿Cuál es la función principal de la VRAM?', o: ['Almacenar texturas y datos gráficos de la GPU', 'Convertir 12 V en 1 V', 'Enfriar el núcleo', 'Conectar con la placa base'], a: 0, e: 'La VRAM guarda datos gráficos con alto ancho de banda.' },
  { lvl: 'basic', q: '¿Qué componente transporta calor desde la placa fría a las aletas?', o: ['Capacitor', 'Heatpipe', 'MOSFET', 'Thermal pad'], a: 1, e: 'Los heatpipes mueven calor por evaporación y condensación.' },
  { lvl: 'basic', q: 'El VRM sirve para…', o: ['Almacenar imágenes', 'Regular y convertir el voltaje que recibe la GPU', 'Dirigir el aire', 'Aumentar la VRAM'], a: 1, e: 'El VRM reduce 12 V a tensiones bajas y estables.' },
  { lvl: 'basic', q: '¿Dónde están los thermal pads?', o: ['Entre VRAM/VRM y el disipador', 'Dentro del die', 'En el slot PCIe', 'Debajo del ventilador'], a: 0, e: 'Rellenan el hueco entre chips y la placa del disipador.' },
  { lvl: 'basic', q: 'Síntoma típico de un ventilador dañado:', o: ['Imagen sin color', 'Un ventilador no gira y sube la temperatura', 'FPS siempre altos', 'Zumbido de la fuente'], a: 1, e: 'Sin flujo de aire, el disipador no evacúa el calor.' },
  { lvl: 'basic', q: 'Puntos de colores y texturas corruptas suelen indicar…', o: ['Problema de memoria o temperatura', 'Falta de internet', 'Cable HDMI largo siempre', 'Ventiladores silenciosos'], a: 0, e: 'Los artefactos suelen venir de VRAM, GPU, temperatura o controlador.' },
  { lvl: 'basic', q: '¿Qué componente del VRM conmuta la corriente en cada fase?', o: ['MOSFET', 'Heatpipe', 'PCB', 'Conector HDMI'], a: 0, e: 'Los MOSFET actúan como interruptores de potencia.' },
  { lvl: 'basic', q: 'Los capacitores en la salida del VRM sirven para…', o: ['Generar calor', 'Filtrar el rizado y aportar corriente en picos', 'Enfriar la VRAM', 'Almacenar el BIOS'], a: 1, e: 'Suavizan la tensión y responden a picos de carga.' },
  { lvl: 'basic', q: '¿Cuál es el pedazo de cobre y silicio donde ocurren los cálculos?', o: ['GPU Die', 'Thermal pad', 'Inductor', 'Backplate'], a: 0, e: 'El die contiene los transistores de cómputo.' },
  { lvl: 'basic', q: 'Antes de abrir una tarjeta debes…', o: ['Mantenerla conectada', 'Desconectarla y descargar electricidad estática', 'Pasarle aire caliente', 'Quitar el die'], a: 1, e: 'Seguridad: desconectar y usar pulsera antiestática.' },
  // Nivel avanzado
  { lvl: 'adv', q: 'La VRAM está a 105 °C y la GPU a 70 °C. ¿Qué herramienta confirma mejor el contacto de los pads?', o: ['Cámara térmica sobre la zona de VRAM', 'Prueba de memoria sin temperatura', 'Multímetro en el slot', 'Monitor de ventiladores'], a: 0, e: 'La cámara térmica muestra puntos calientes locales.' },
  { lvl: 'adv', q: 'Pantalla negra bajo carga; 12 V auxiliar cae de 12.0 a 10.9 V y el conector está a 86 °C. Causa más probable:', o: ['Conector auxiliar con mala conexión', 'Pasta térmica seca', 'VRAM defectuosa', 'Controlador antiguo'], a: 0, e: 'La caída y el calor indican resistencia de contacto alta.' },
  { lvl: 'adv', q: 'La prueba de diodo en un MOSFET da 0.00 V. Interpretación:', o: ['Está sano', 'Probable cortocircuito', 'Sobrecalentamiento del ventilador', 'Controlador corrupto'], a: 1, e: 'Sin caída de diodo suele indicar un corto interno.' },
  { lvl: 'adv', q: 'Errores de memoria solo cuando la VRAM supera 100 °C. ¿Primer paso?', o: ['Cambiar la GPU', 'Revisar y renovar el enfriamiento/pads de VRAM', 'Reinstalar Windows', 'Reemplazar la fuente'], a: 1, e: 'Dependen de temperatura: primero se corrige el enfriamiento.' },
  { lvl: 'adv', q: 'GPU al 25 % de uso y 48 °C con FPS bajos. ¿Qué descartar primero?', o: ['Pasta térmica', 'Monitor conectado a la placa base / configuración', 'MOSFET', 'Capacitores'], a: 1, e: 'Frío y poco uso apuntan a configuración, no a hardware dañado.' },
  { lvl: 'adv', q: 'Hotspot 20 °C superior a la temperatura de la GPU y VRAM normal:', o: ['Pasta térmica deteriorada', 'Pads gruesos', 'Fuente débil', 'Cable HDMI'], a: 0, e: 'Una diferencia grande en el núcleo apunta a mala transferencia en el die.' },
  { lvl: 'adv', q: 'Para reparar capacitores abombados del VRM, el reemplazo debe igualar…', o: ['Solo el color', 'Capacitancia, tensión y ESR', 'La marca del PCB', 'El número de ventiladores'], a: 1, e: 'Estos parámetros determinan filtrado y estabilidad.' },
  { lvl: 'adv', q: 'Un ventilador sin giro pero con 12 V en el conector indica…', o: ['Cable desconectado', 'Motor defectuoso', 'Pasta seca', 'Fuente defectuosa'], a: 1, e: 'Con tensión presente, el fallo está en el motor.' }
];

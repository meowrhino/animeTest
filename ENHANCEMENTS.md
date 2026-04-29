# Posibles mejoras con anime.js v4

Tres opciones por sección/herramienta pensadas para explorar features de anime.js v4 que aún no estoy usando o estoy infrautilizando. La idea es que estas animaciones tengan **sentido narrativo** dentro de la herramienta — no decoración por decoración.

Marcadas con:
- 🟢 = pequeño, bajo riesgo, gran ganancia visual
- 🟡 = medio (toca varios archivos)
- 🔴 = grande (puede requerir refactor)

---

## Portal (`/`)

> El landing es lo primero que ve el usuario. Ahora mismo: stagger de cards al cargar + fade-out al hacer click.

1. 🟢 **`text.scrambleText` en el subtítulo** — "Cinco maneras de consultar lo que el cambio aún no ha dicho." se descifra letra a letra como si emergiera del polvo. Sustituye el simple stagger de letras por algo que se sienta como un I-Ching cifrado.
2. 🟡 **`createDraggable` con la rejilla de cards** — el usuario puede arrastrar la rejilla en horizontal/vertical, las cards se reordenan con `snap` a la posición más cercana. Convierte la landing en un objeto manipulable, no solo navegable.
3. 🔴 **`onScroll({ sync: true })` con un fondo de tinta animada** — al scrollear, manchas de tinta SVG se expanden y contraen según la posición. Convierte el portal en una experiencia inmersiva tipo Awwwards.

## Oracle del I-Ching (`/tools/oracle/`)

> 6 secciones cinemáticas. Ya usa stagger, splits, drawables, springs.

1. 🟢 **`svg.morphTo` para la transformación primario→secundario** — ahora mismo el secundario aparece al lado del primario; con `morphTo` cada línea mutable se "desliza" del primario al secundario en el mismo lugar (ahorra layout, gana sentido). Sustituye la flecha `→ se transforma en` por una transformación literal.
2. 🟡 **`eases.steps(6)` en el dibujado de las 6 líneas** — al construir el hexagrama, cada línea aparece con un staccato discreto (como una campana ritual). Más ceremonia, menos "easing genérico". Aplica también al outro: las partículas se dispersan con `eases.irregular(20, 0.8)` para evocar tinta cayendo.
3. 🔴 **`text.scrambleText` en la revelación del nombre del hexagrama** — el carácter chino, el pinyin y la traducción se descifran letra a letra (como si el oráculo se materializara). Combina con `onUpdate` para hacer un sonido sutil de campana cuando cada letra se asienta.

## Hexagrama de nacimiento (`/tools/natal-hex/`)

> Form → cálculo → reveal. Ahora muy estático en el cálculo.

1. 🟢 **`text.scrambleText` durante el cálculo** — entre clicar "Calcular" y ver el hexagrama (~1-3s mientras carga `lunar-javascript`), el botón se transforma en una secuencia de números/símbolos chinos descifrándose. Da sensación de "el oráculo está leyendo tu fecha".
2. 🟡 **Animación de flujo entre secciones con `svg.createMotionPath`** — al pasar de form a reveal, el carácter 命卦 viaja por una curva trazada (en SVG) hasta su posición final. Se siente como tinta que se manifiesta.
3. 🔴 **Línea mutable como path interactivo con `createDraggable`** — el usuario puede arrastrar verticalmente la línea mutable para "mover el cambio" y ver cómo cambia el secundario en tiempo real. Convierte el hexagrama en un instrumento, no solo un resultado.

## Pakua interactivo (`/tools/pakua/`)

> Ya usa Three.js — fuera del scope de anime.js. Lo dejamos.

Sugerencia única: 🟢 **animar el fade-in del result panel con anime.js v4** en vez del CSS transition actual. Pequeño, mantiene coherencia.

## Horóscopo chino (`/tools/zodiac/`)

> Rueda de 12 animales que gira hasta tu signo. Acabamos de quitar emojis.

1. 🟢 **`createSpring` para la rueda** — en vez del actual `outExpo`, usar spring con `bounce: 0.2` cuando la rueda se detiene. El último paso "rebota" sutilmente como una rueda real.
2. 🟡 **`createDraggable` sobre la rueda** — el usuario puede girarla manualmente con `snap: 30` (snap a 30°), `releaseEase: spring({...})`. Si la sueltas, decide tu animal del momento. Convierte la consulta en un acto físico.
3. 🔴 **Animación de los 4 pilares en cascada con elementos elementales** — cuando aparecen Año/Mes/Día/Hora, cada pilar muestra su elemento con un pequeño efecto del propio elemento (Wood = línea creciendo, Fire = pulse, Earth = morphing, Metal = corte, Water = fluido). Identidad visual elemental.

## Carta natal (`/tools/natal-chart/`)

> Rueda SVG con casas, planetas y aspectos.

1. 🟢 **`svg.createDrawable` para los aspectos** — ahora se animan con opacity stagger; sustituyéndolo por draw 0→1 las líneas se trazan como tinta cruzando la rueda. Más cinemático.
2. 🟡 **`svg.createMotionPath` para los planetas** — los planetas entran orbitando desde el exterior siguiendo curvas suaves hasta su posición final, en vez de aparecer con scale. Cada planeta su path único.
3. 🔴 **Hover sobre un planeta dispara `text.split` del nombre + `onScroll` para los detalles** — al pasar el cursor sobre un planeta, su nombre se descompone y los aspectos asociados se resaltan con scrub al scroll. Convierte el chart en lectura interactiva.

## Reloj de meridianos (`/tools/meridian-clock/`)

> Reloj 24h con el meridiano activo iluminado.

1. 🟢 **Aguja con `eases.cubicBezier(.4,0,.2,1)`** — ahora se mueve con `utils.set` (instantáneo). Animarla con un easing breathing 1s suaviza el tick. La transición al cruzar la frontera de un meridiano gana visibilidad.
2. 🟡 **Pulse del meridiano activo cada respiración** — el sector iluminado pulsa muy sutilmente con un periodo de ~6s (ritmo respiratorio de Qigong). Conexión visceral con el cuerpo.
3. 🔴 **Reloj orbital tipo Pakua, vinculado al sol/luna** — el meridiano activo se conecta al sol (día) o luna (noche) que orbitan alrededor del reloj. Astronomía + MTC. Requiere efemérides simples (sunrise/sunset).

## Puntos de acupuntura (`/tools/acupuncture/`)

> Browser de 361 puntos por meridiano. Hoy es lista cards. Lo siguiente es ver el cuerpo.

### Tres opciones de mapa corporal

1. 🟡 **SVG 2D anatómico (vista frontal + dorsal + lateral)** — un cuerpo dibujado en SVG (3 vistas), con cada meridiano como `<path>` que se traza con `svg.createDrawable` al filtrar. Los puntos son `<circle>` clicables que abren el modal. Filtrar un meridiano = los demás se atenúan, el seleccionado dibuja su path con tinta. Ligero, rápido, dreamy. **Recomendado**.

2. 🔴 **Three.js con cuerpo low-poly y meridianos como `TubeGeometry`** — modelo humano simple (cápsulas/cilindros conectados, no GLTF para no inflar el peso) con los 14 meridianos trazados como tubos suaves. Cámara orbital con `createDraggable` (anime.js) para rotar. Click en un punto = el meridiano de ese punto se ilumina y la cámara hace zoom. Coherente con pakua que ya usa Three.

3. 🔴 **Three.js con modelo GLTF anatómico real** — descargar un modelo human base público (Quaternius o similar, CC0), usarlo como referencia silueta, dibujar los meridianos por encima como spline curves con `THREE.CatmullRomCurve3`. Más realista pero el modelo añade ~2-5MB al bundle. Sólo si quieres el efecto "pro".

### Otras mejoras (independientes del mapa)

1. 🟢 **`text.split` al filtrar por meridiano** — el título "361 puntos · 14 meridianos" se descompone y se recompone con stagger cuando aplicas un filtro. Pequeño pero da personalidad.
2. 🟢 **Stagger desde el meridiano clicado** — los puntos del meridiano filtrado entran `from: 'first'` siguiendo el orden anatómico (LU1→LU11). Si combinas con el mapa SVG (opción 1), pueden iluminarse en secuencia anatómica.
3. 🟡 **Modal de detalle con `svg.morphTo`** — el carácter chino del punto se traza letra a letra cuando abres el detalle (calligraphy stroke). Encaja con la estética tinta china.

---

## Si quieres avanzar

- Pídeme **"hazme la 1 del oracle"** y te aplico esa concreta.
- O **"hazme las 🟢 de todas"** y meto los quick wins.
- O dame un orden tuyo y voy.

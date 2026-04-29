# 易 Suite de Adivinación — Plan integral

> Plan escrito el 2026-04-29 cuando Manu pivotó el `animeTest` (test de anime.js + I-Ching oracle) a una suite de 5 herramientas. Manu se va a trabajar otra cosa y me deja autonomía.

---

## Contexto

`~/Desktop/animeTest` empezó como un test cinemático de anime.js v4 con un I-Ching oracle dreamy (papel arroz + tinta + dorado). Tras validar la estética y la primera consulta funcionando, Manu quiere expandirlo a **5 herramientas de adivinación** que comparten plataforma:

1. **I-Ching Oracle** — el actual + opción de **yarrow stalks** (varitas, método tradicional) además de monedas.
2. **Hexagrama de Nacimiento** — fecha+hora de nacimiento → hexagrama natal (3 métodos: Jīng Fáng, numerología, BaZi). Reaprovecha lógica del repo `~/Documents/GitHub/hexagramaNacimiento`.
3. **Pakuafun** — bagua interactivo 3D con dos prismas octagonales (Three.js). Embebido del repo `~/Documents/GitHub/pakuafun`.
4. **Horóscopo Chino** — animal del año + signo lunar + elemento. Tool nuevo construido desde cero.
5. **Whole Sign House Chart** renovado — natal chart astrológico, refactor del repo `~/Documents/GitHub/wholeSignHouseChart` (que es 753 líneas monolíticas en un index.html).

---

## Decisiones tomadas (defaults razonados)

| Decisión | Elegido | Por qué |
|---|---|---|
| **Arquitectura** | Suite con portal + 5 sub-pages, todo en `animeTest/` | Vanilla multi-page nativo, máxima velocidad iterar, comparte `/shared/` para tokens y utils |
| **Estética base** | Tinta china dreamy unificada (paleta del oracle actual) | Coherente con tu trabajo de Qigong; auténtica al I-Ching; ya está construida; los repos previos dark+gold fueron exploraciones, esta es la línea final |
| **Variantes por tool** | Cada tool puede tener un acento de color propio | Oracle: dorado. Hexagrama natal: jade. Pakua: tinta más oscura. Horóscopo: crimson. Natal chart: violeta sobre crema. Todos sobre la misma base de papel arroz. |
| **Pakuafun** | Embeber Three.js tal cual (mover archivos a `tools/pakua/`) | Funciona, pulido, no romperlo. Adaptar paleta a tinta china pero conservar la mecánica 3D |
| **Yarrow stalks** | Versión estilizada (no las 50 varitas reales por línea) | Mantener el ritual visual sin que dure 4 minutos. 50 varitas dibujadas, divisiones en 3 grupos animadas, conteo abstracto |
| **Build step** | Sin build (vanilla, ESM via CDN) | Tu preferencia confirmada. Si la suite crece, evaluamos Vite multi-page después |
| **Birth profile compartido** | localStorage con perfil opcional | "Guardar mis datos" tras input. Reusable en hexagrama natal, horóscopo, natal chart. Opt-in |
| **Estado de consulta** | Stateless por defecto, con opción "guardar consulta" | Cada tirada se hace fresh. Usuario puede guardar resultado a una "biblioteca" en localStorage |
| **Reaprovechamiento de repos** | Copiar archivos relevantes al nuevo proyecto, no modificar originales | Los repos quedan como referencia. Aquí los reescribimos/adaptamos |

---

## Arquitectura de archivos

```
animeTest/
├── index.html                    # Portal: landing con las 5 herramientas
├── PLAN.md                       # este archivo
├── shared/
│   ├── styles/
│   │   ├── tokens.css            # variables (colores, tipos, easings)
│   │   ├── reset.css             # reset + base
│   │   ├── components.css        # botones, inputs, hexagrama, formularios
│   │   └── grain.css             # grano global
│   ├── js/
│   │   ├── anime-import.js       # central import de anime.js v4
│   │   ├── utils.js              # splitText, wait, nextFrame, etc
│   │   ├── storage.js            # localStorage wrapper (birth-profile, history)
│   │   └── nav.js                # cabecera de navegación entre tools
│   └── data/
│       ├── iching.json           # 64 hexagramas (currently 8 stubbed → expandir)
│       ├── trigrams.json         # 8 trigramas
│       └── chinese-zodiac.json   # 12 animales + 5 elementos + signos lunares
├── tools/
│   ├── oracle/                   # I-Ching Oracle (tool 1)
│   │   ├── index.html
│   │   ├── style.css             # acentos del tool
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── intro.js
│   │   │   ├── question.js
│   │   │   ├── method-toggle.js  # NUEVO: monedas vs yarrow stalks
│   │   │   ├── throw-coins.js    # antes throw.js
│   │   │   ├── throw-stalks.js   # NUEVO: yarrow stalks animation
│   │   │   ├── hexagram.js
│   │   │   ├── reading.js
│   │   │   ├── outro.js
│   │   │   ├── iching-logic.js
│   │   │   └── svg-factory.js
│   │   └── data/
│   │       └── iching.json       # symlink/copy de shared
│   ├── natal-hex/                # Hexagrama de Nacimiento (tool 2)
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── form.js           # input fecha/hora con animaciones
│   │   │   ├── method-tabs.js    # JingFang | Numerología | BaZi
│   │   │   ├── methods/
│   │   │   │   ├── jing-fang.js
│   │   │   │   ├── numerology.js
│   │   │   │   └── bazi.js
│   │   │   ├── reveal.js         # animación construcción del hexagrama
│   │   │   └── reading.js        # interpretación natal
│   │   └── data/
│   │       └── readings/         # 64 markdowns natales del repo original
│   ├── pakua/                    # Pakuafun (tool 3, embebido)
│   │   ├── index.html
│   │   ├── style.css             # adaptado a tinta china dreamy
│   │   ├── js/
│   │   │   ├── app.js            # de pakuafun
│   │   │   ├── prism.js
│   │   │   ├── data.js
│   │   │   ├── touch.js
│   │   │   ├── hexagram.js
│   │   │   └── trigrams.js
│   │   └── (Three.js via importmap CDN)
│   ├── zodiac/                   # Horóscopo Chino (tool 4)
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── form.js
│   │   │   ├── compute.js        # animal + elemento + lunar mansion
│   │   │   ├── wheel.js          # rueda 12 animales animada
│   │   │   └── reading.js
│   │   └── data/
│   │       └── zodiac.json       # 12 animales + interpretaciones
│   └── natal-chart/              # Whole Sign House Chart renovado (tool 5)
│       ├── index.html
│       ├── style.css
│       ├── js/
│       │   ├── main.js
│       │   ├── form.js           # birth data + geocoding Nominatim
│       │   ├── astro/
│       │   │   ├── ephemeris.js  # wrapper de astronomy-engine
│       │   │   ├── ascendant.js
│       │   │   ├── midheaven.js
│       │   │   ├── aspects.js
│       │   │   └── dignities.js
│       │   ├── chart-svg.js      # rueda en SVG (no Canvas)
│       │   ├── tables.js         # planetas, casas, aspectos
│       │   └── interpret.js      # textos básicos
│       └── data/
│           ├── signs.json
│           ├── planets.json
│           └── house-meanings.json
└── .claude/
    └── launch.json
```

---

## Sistema de tokens compartido

```css
/* shared/styles/tokens.css */
:root {
  /* Base — papel arroz / tinta */
  --paper: #f4ede1;
  --paper-warm: #efe5d2;
  --paper-shadow: #e6dac0;
  --ink: #1a1a1a;
  --ink-soft: #2b2622;
  --ink-faded: rgba(26, 26, 26, 0.55);

  /* Acentos (cada tool elige el suyo dominante) */
  --gold: #b8943f;       /* oracle */
  --jade: #7a9b8a;       /* hexagrama natal */
  --crimson: #8a3a2e;    /* horóscopo */
  --violet: #5b4a7a;     /* natal chart */
  --indigo: #2a3552;     /* pakua */

  /* Tipos */
  --font-serif: "Cormorant Garamond", serif;
  --font-cn: "Noto Serif SC", serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Easings de respiración */
  --ease-breath: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);

  /* Tiempos */
  --t-fast: 240ms;
  --t-medium: 600ms;
  --t-slow: 1200ms;
}

[data-tool="oracle"] { --accent: var(--gold); }
[data-tool="natal-hex"] { --accent: var(--jade); }
[data-tool="pakua"] { --accent: var(--indigo); }
[data-tool="zodiac"] { --accent: var(--crimson); }
[data-tool="natal-chart"] { --accent: var(--violet); }
```

---

## Portal (landing)

`index.html` en la raíz. Hero con 易 grande caligráfico (igual que ahora), pero abajo una **rejilla de 5 cards** con cada herramienta. Cada card tiene:
- glyph chino representativo (☰ ☯ 卦 等 ⌘)
- nombre
- descripción de 1 línea
- click → navega a `tools/<name>/index.html`

Animación de entrada: cards con stagger; al hacer hover, el glyph se anima sutilmente (rotación o respiración). Misma paleta dreamy, fondo de manchas de tinta como ya está hecho.

---

## Detalle por herramienta

### Tool 1 — Oracle del I-Ching (existente, ampliar)

Estado: 6 secciones funcionando (intro → question → throw → reveal → reading → outro). End-to-end por validar, plus añadir:

**A. Toggle método**: en la sección **question**, añadir un selector tipo "Cómo quieres consultar" con dos opciones:
- 🪙 Monedas (rápido, 30s)
- 🌾 Varitas (ritual, 2 min)

**B. Yarrow stalks animation** (nueva sección `throw-stalks.js`):
- Pantalla con 50 varitas en SVG dispuestas en abanico
- Animación: el usuario "toma" un puñado random → se separa una varita aparte (la de la izquierda)
- El resto se cuenta en grupos de 4 (animación de barrido contando)
- Resto: 1, 2, 3 o 4 → se pone aparte
- Repetir 3 veces → suma de los restos = 6, 7, 8 o 9 (mismo resultado que monedas)
- Por línea, 3 sub-rondas. Para 6 líneas, 18 rondas de varitas
- Estilizado: cada operación dura 1-2s, total ~2 min

**C. Estética**: ya está

**D. Datos**: expandir `iching.json` de 8 a 64 hexagramas (el stub actual son los 8 más icónicos; portar interpretaciones del repo `hexagramaNacimiento/texts/*.md`)

### Tool 2 — Hexagrama de Nacimiento

**Reaprovecha**: lógica de `hexagramaNacimiento/src/methods/{jingFang,bazi,numerology}.js`, datos `trigrams.js`/`hexagrams.js`/`hexagramLookup.js`, textos `/texts/*.md`.

**Tech**: vanilla JS + lunar-javascript desde CDN (igual que el repo original)

**UX**:
1. Hero con título caligráfico 命卦 (mìng guà = hexagrama del destino)
2. Form de input: fecha, hora (con "no sé la hora" toggle), zona horaria
3. Tabs para método: Jīng Fáng (default) | Numerología | BaZi
4. Botón "Calcular" → animación de cálculo (números/símbolos volando, easing breath)
5. **Reveal**: hexagrama natal aparece con stagger bottom-up + nombre chino + pinyin + traducción + línea mutable destacada
6. Si hay hexagrama derivado: mostrar al lado con flecha animada (igual que en el oracle actual)
7. Sección de lectura: interpretación natal + texto de la línea mutable + texto del derivado

**Estética**: tinta china dreamy con acento jade

### Tool 3 — Pakuafun (embebido)

**Reaprovecha**: copiar los archivos de `pakuafun/js/*` y `pakuafun/css/styles.css` a `tools/pakua/`. Three.js via importmap CDN.

**Adaptaciones**:
- Reemplazar paleta dark+gold por tinta china dreamy (papel arroz fondo, tinta para los prismas, dorado para los acentos)
- Cambiar fondo procedural (montañas shan-shui actuales) por tinta-fluida sutil (manchas dreamy como las del oracle)
- Header de navegación compartido para volver al portal
- Pequeño tutorial al inicio (los prismas se rotan, al alinearse forman un hexagrama)

**Estética**: indigo profundo como acento, sobre papel arroz

### Tool 4 — Horóscopo Chino

**Construido desde cero**.

**Cálculo**:
- **Animal del año**: ciclo de 12 (Rata, Buey, Tigre, Conejo, Dragón, Serpiente, Caballo, Cabra, Mono, Gallo, Perro, Cerdo). Calculado desde año lunar.
- **Elemento**: ciclo de 5 (Madera, Fuego, Tierra, Metal, Agua) × yang/yin = ciclo de 60 años (Stem-Branch).
- **Signo del mes (lunar)**: animal del mes lunar de nacimiento.
- **Signo de la hora**: animal de la doble-hora china de nacimiento (tiene 12 dobles-horas).

**UX**:
1. Hero con rueda zodiacal de 12 animales
2. Form: fecha + hora (opcional) + zona horaria
3. Calcular → la rueda gira hasta detenerse en tu animal del año
4. Reveal: tu **4 pilares** (year animal, month animal, day animal, hour animal) con elementos asociados
5. Lectura: personalidad del animal del año + relaciones con otros animales (compatibilidades) + año lunar actual y cómo te afecta

**Animaciones**:
- Rueda zodiacal con 12 segmentos SVG, gira con easing inOutQuad y se detiene con spring
- Glyphs de los animales se iluminan con stagger
- 4 pilares aparecen como cartas que voltean

**Estética**: crimson + papel arroz

### Tool 5 — Whole Sign House Chart renovado

**Refactor del monolito** de 753 líneas. Mantener cálculo (astronomy-engine) pero **rehacer arquitectura, UX y visual**.

**Cambios respecto al original**:
- Separar HTML/CSS/JS en archivos
- **SVG en vez de Canvas** para la rueda → permite hover sobre planetas, animaciones de líneas de aspectos, accesibilidad
- **Inputs animados** con la misma estética dreamy
- **Geocoding** con Nominatim igual, pero con feedback visual (sutil "buscando lugar...")
- **Interpretación básica** integrada (no la había antes): texto por planeta-en-signo, planeta-en-casa, aspectos clave
- Birth profile reutilizable desde localStorage
- Mantener el modo "no sé la hora" del original

**UX**:
1. Hero con un símbolo de rueda zodiacal pequeño
2. Form de input: nombre opcional, fecha, hora, lugar (geocoding)
3. Calcular → animación cinematográfica de la rueda construyéndose:
   - Círculo exterior (zodiaco) se dibuja con drawable
   - 12 casas aparecen con stagger
   - Planetas vuelan a sus posiciones (cada uno con un easing diferente)
   - Líneas de aspectos se dibujan al final (color por tipo de aspecto)
4. Tabla de planetas + tabla de casas + tabla de aspectos
5. Sección de interpretación con scroll reveals (como en el oracle)

**Estética**: violet + papel arroz, fondo con sutil patrón de constelaciones (puntos dorados muy tenues, no el starfield ruidoso del original)

---

## Orden de trabajo

Voy a ejecutar en este orden, autocontenido cada paso:

1. **Cierro el oracle actual** — verifico end-to-end (sections 4-6 sin testar todavía), arreglo bugs, y reorganizo estructura: muevo lo de `animeTest/` actual a `animeTest/tools/oracle/`. Saco a `shared/` los archivos compartibles (anime-import, utils, tokens).

2. **Construyo el portal** (`animeTest/index.html`) — landing con las 5 cards.

3. **Añado yarrow stalks** al oracle.

4. **Tool 2: Hexagrama de Nacimiento** — copio lógica del repo, construyo UX nueva.

5. **Tool 4: Horóscopo Chino** — construyo desde cero. Voy antes que natal chart porque es más simple y me permite validar el patrón "tool con form + cálculo + reveal".

6. **Tool 5: Whole Sign House Chart** — refactor + nueva UX. La más pesada técnicamente.

7. **Tool 3: Pakuafun** — última porque es la menos integrada (embed de Three.js). Copio archivos, adapto paleta, conecto al portal.

8. **Verificación final** — paseo end-to-end por las 5 herramientas, screenshots, ajustes.

---

## Verificación end-to-end

Por cada herramienta:
- ✅ Carga sin errores de consola (excepto warnings conocidos)
- ✅ Form de input acepta inputs válidos y muestra feedback
- ✅ Cálculo produce resultado correcto (test contra inputs conocidos)
- ✅ Animaciones corren a 60fps (DevTools Performance)
- ✅ Responsive en 375px (mobile) sin overflow
- ✅ `prefers-reduced-motion` respetado (animaciones cortas o ausentes)
- ✅ Volver al portal funciona (link de navegación)
- ✅ localStorage del birth profile se rellena en otros tools (donde aplique)

---

## Lista de cosas que pueden bloquearme y plan B

| Posible bloqueo | Plan B |
|---|---|
| anime.js v4 API distinta a lo que asumo | Inspecciono el bundle ESM, ajusto. Worst-case `<script>` clásico desde unpkg fixed v4.0.x |
| lunar-javascript no carga via ESM CDN | Copio el archivo localmente |
| astronomy-engine timezone hack | Usa `Temporal` (browser support tier 1 en 2026) o `tzdata-min` |
| Pakua (Three.js) muy pesado | Lo dejo aparte, el portal solo enlaza a `pakuafun` su deploy actual |
| Yarrow stalks anim resulta confusa | Caigo en versión más simbólica: 3 grupos de varitas en columnas en vez de simulación real |
| Refactor del wholeSignHouseChart sale caro en tiempo | Mantengo la rueda en Canvas (sin migrar a SVG), priorizo modularidad sobre re-render |

---

## Si Manu vuelve y quiere redirigir

Los puntos donde decidí con default (no me preguntó explícitamente):
- ✋ Estética unificada → si quieres cada tool con su propia paleta, retro-cambio en `shared/styles/tokens.css`
- ✋ Pakuafun como Three.js → si prefieres versión 2D anime.js, lo rehago (pierdo el 3D pero gano stack unificado)
- ✋ Yarrow stalks estilizado → si quieres ritual completo de 4 minutos, expando la animación
- ✋ Build: vanilla → si la suite crece, migro a Vite multi-page

Cualquier de estos cambios es retrocompatible si lo decimos antes de meterme con muchas tools.

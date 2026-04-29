# 易 Suite de adivinación

Cinco herramientas de adivinación construidas sobre HTML + CSS + JavaScript planos, con [anime.js v4](https://animejs.com) para la cinemática y carga vía CDN ESM.

Empezó como un test de anime.js (un oráculo del I-Ching) y creció hasta convertirse en una pequeña suite que mezcla I-Ching, BaZi, horóscopo chino y astrología occidental con casas de signo entero.

## Las siete herramientas

| Tool | Carpeta | Qué hace |
|---|---|---|
| **Oráculo del I-Ching** | `tools/oracle/` | Consulta al Libro de los Cambios. Tiradas con monedas (rápido) o con varitas de milenrama (ritual estilizado). |
| **Hexagrama de nacimiento** | `tools/natal-hex/` | Hexagrama natal calculado por tres métodos: Jīng Fáng (Plum Blossom), numerología, BaZi. Interpretaciones natales en markdown. |
| **Pakua interactivo** | `tools/pakua/` | Dos prismas octagonales 3D (Three.js) con los Bagua Anterior y Posterior. Embebido del repo [pakuafun](https://github.com/meowrhino/pakuafun). |
| **Horóscopo chino** | `tools/zodiac/` | Tu animal, elemento y los cuatro pilares (年月日時) según fecha y hora de nacimiento. |
| **Carta natal** | `tools/natal-chart/` | Astrología occidental con sistema de casas de signo entero. Cálculo astronómico real con [astronomy-engine](https://github.com/cosinekitty/astronomy). |
| **Reloj de meridianos** | `tools/meridian-clock/` | Las doce franjas de dos horas del día chino. El meridiano activo se ilumina y muestra la recomendación correspondiente. |
| **Puntos de acupuntura** | `tools/acupuncture/` | Visor de los 361 puntos canónicos (estándar OMS) organizados por meridiano. Búsqueda por nombre / pinyin / código / indicación. |

## Estructura

```
animeTest/
├── index.html               # Portal con las 5 cards
├── portal.{css,js}
├── shared/                  # Tokens, helpers y datos comunes
│   ├── styles/{tokens,base,components}.css
│   ├── js/{anime-import,utils,svg-factory,iching-data,lunar-adapter}.js
│   └── data/iching.json     # 64 hexagramas
└── tools/                   # Una carpeta por herramienta
    ├── oracle/
    ├── natal-hex/
    ├── pakua/
    ├── zodiac/
    └── natal-chart/
```

### Sin build step

Todo es HTML + CSS + JS plano. Los módulos se cargan como `<script type="module">`. Las dependencias vienen vía CDN ESM:

- `animejs@4` (animaciones) en `shared/js/anime-import.js`
- `lunar-javascript@1.7.7` (calendario chino) en `shared/js/lunar-adapter.js`
- `astronomy-engine@2.1.19` (efemérides) en `tools/natal-chart/js/astro/ephemeris.js`
- `three@0.164.1` (3D) sólo en `tools/pakua/`

## Probar localmente

Necesitas un servidor local porque hay `fetch` de JSON y módulos ESM:

```sh
python3 -m http.server 8765
# abre http://localhost:8765/
```

## Decisiones de diseño

- **Estética unificada "tinta china dreamy"** en todo lo nuevo: papel arroz, tinta, dorado y acentos por herramienta (oracle=dorado, natal-hex=jade, zodiac=crimson, natal-chart=violet). Pakua mantiene su paleta dark+gold porque su escena 3D pide ese contraste.
- **Vanilla nada de framework** para mantener velocidad de iteración y poder abrir la tool y ver el resultado sin pipeline.
- **Datos reales** donde tiene sentido: el I-Ching natal usa las 64 interpretaciones del repo `hexagramaNacimiento`; la carta astral calcula posiciones planetarias con efemérides reales; el horóscopo chino usa el calendario lunar.

## Cosas que pueden mejorar

- 56 de los 64 hexagramas del oracle tienen texto placeholder en `shared/data/iching.json`. Las 8 detalladas son las más icónicas (#1, #2, #11, #12, #29, #30, #63, #64).
- La animación de varitas de milenrama es estilizada, no reproduce el algoritmo tradicional de 50 varitas. Suficiente para el ritmo visual.
- El método numerológico del hexagrama natal no genera línea mutante (es coherente con la tradición numerológica simple).
- Pakua no se ha adaptado a la paleta dreamy — se mantiene dark+gold por respeto a su atmósfera 3D.

## Inspiraciones / fuentes

- Wilhelm-Baynes para el I-Ching.
- Los repos personales de Manu: [hexagramaNacimiento](https://github.com/meowrhino/hexagramaNacimiento), [pakuafun](https://github.com/meowrhino/pakuafun), [wholeSignHouseChart](https://github.com/meowrhino/wholeSignHouseChart).

---

Construido con anime.js, paciencia y café.

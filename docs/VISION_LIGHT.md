# Luz y visión — intenciones del sistema

Documento de intenciones: qué busca el sistema de luz/visión en Uncover, qué promete al jugador y cómo se reparte entre lógica y presentación. Complementa [`DESIGN.md`](./DESIGN.md) (reglas técnicas) y [`VISUAL_STYLE.md`](./VISUAL_STYLE.md) (piel visual).

---

## Intención narrativa y de juego

Uncover es una **mina oscura**. La luz no es decoración: es el recurso que define qué puedes afrontar ahora, qué solo “recuerdas” y qué sigue siendo vacío.

| Intención | Qué significa en juego |
|-----------|-------------------------|
| **Exploración bajo incertidumbre** | Lo no visto es negro puro. No hay mapa mental gratis. |
| **La linterna cuenta historia** | El casco (y otras fuentes) cuentan oficio: ámbar de lámpara, no un flood fill de cheat. |
| **Amenaza y señal** | Bombas, enemigos, espíritus y explosiones emiten luz; ver un brillo es información táctica. |
| **Memoria ≠ presencia** | Haberte pasado por un corredor no te enseña quién está ahí ahora. |
| **Tutorial más claro** | Niveles tempranos pueden inundar el vacío con luz ambiente (`emptyTileLight`) para enseñar sin asfixiar. |

La visión **ya no es una cruz rígida** (estilo Bomberman clásico de LOS ortogonal puro): es un **campo de luz por tile**, con radio, cono, oclusión y fuentes aditivas.

---

## Separación de responsabilidades

Intención arquitectónica explícita: **reglas en `game/`, pintura en `phaser/`**.

```
Fuentes (jugador, bomba, enemigo, explosión, antorcha, emptyTileLight)
        ↓
VisionSystem  →  lightLevels, visibleTiles, discoveredTiles, visionViewport
        ↓
FogOfWarView / TilemapView / EntityView / MinimapView
```

| Capa | Dueño | Intención |
|------|--------|-----------|
| **Lógica** | `VisionSystem` | Decidir *ahora* qué tiles tienen luz, cuáles son visibles y cuáles quedan descubiertos para siempre. |
| **Presentación** | `FogOfWarView`, muros en `TilemapView`, tint en entidades | Pintar niebla negra, fundidos, caras de muro y ocultar actores; puede interpolar. |
| **Config de forma** | `mineWalls.js`, `visionFog.js` | Forma visual de crestas de muro y borde suave del radio; no redefine quién “ve”. |

**Contrato clave:** la visibilidad lógica se actualiza **de inmediato**; la niebla y los tints pueden **suavizar** el cambio para que el ojo no salte a bloques.

---

## Tres estados del espacio

El sistema distingue tres lecturas del mismo tile:

1. **Desconocido** — nunca iluminado. Negro pleno (`fog` alpha 1). No aparece en el minimapa.
2. **Explorado sin luz actual** — estuvo en `visibleTiles` alguna vez. Memoria casi negra en pantalla; útil para minimapa, sprites de muro y overlays estáticos (p. ej. brillos de mena cuando *no* estás mirando el tile).
3. **Iluminado ahora** — `lightLevels > 0` este frame → entra en `visibleTiles` y se reafirma en `discoveredTiles`. Aquí viven entidades dinámicas (jugador, enemigos, bombas, etc.).

Intención de la memoria de pantalla: **casi indistinguible del vacío** (`EXPLORED_FOG_ALPHA ≈ 0.996`), para no filtrar “mapa fantasma” en el viewport. La memoria útil es de **navegación** (minimapa / terreno), no de **combate**.

---

## Intenciones del modelo de luz

### Campo radial aditivo

- Cada fuente aporta intensidad que **cae con la distancia euclidiana** al foco:  
  `intensidad ≈ fuerza − round(hypot(dx, dy))`, solo si queda `> 0`.
- Varias fuentes **se suman**; tope por celda `MAX_LIGHT = 10`.
- Solo se consideran fuentes que puedan afectar el **viewport** centrado en el jugador (y un margen de influencia por fuerza).

### Radio duro del viajero

La visibilidad final **nunca supera distancia euclidiana 7** respecto al jugador (`PLAYER_VISION_RADIUS`). Eso fija la “burbuja de presencia”: aunque una antorcha fuerte esté más lejos, solo ilumina el interior de esa burbuja.

### Doble línea de visión

Un tile solo recibe luz de una fuente si hay LOS **fuente → tile** **y** **jugador → tile**.

Intención: ninguna luz “trampa” revela lo que hay **detrás** de un obstáculo respecto al viajero. El primer sólido en el rayo **sí** puede iluminarse (borde visible); lo de detrás no.

Además, el LOS de visión sella **esquinas diagonales**: un paso diagonal no se cuela entre dos opacos ortogonales. Intención: lectura de muro de mina, no exploits de pixel-peek.

> Nota: `GridQuery.lineOfSight` (peligro de bomba / IA) es otro contrato, a menudo ortogonal. No deben mezclarse mentalmente.

### Casco = linterna dirigida

El viajero (y NPCs excavadores con la misma linterna) no iluminan un disco completo: **cono de 180° según `facing`**, fuerza 7.

Intención: mirar hacia un pasillo **cuenta**; dar la espalda deja oscuridad detrás salvo otras fuentes. Cambiar de facing debe recomputar visión.

### Fuentes como lenguaje

| Fuente | Fuerza típica | Intención |
|--------|---------------|-----------|
| Casco / NPC excavador | 7 | Herramienta principal del jugador |
| Bomba colocada | 2 | Señal débil de riesgo / timing |
| Enemigo vivo | 2 | Presencia en la oscuridad |
| Espíritu enfurecido | 5 | Agresión legible |
| Explosión | 5 | Destello de evento |
| Antorcha de muro | 10 | Ancla ambiental del nivel |
| Puerta (centro) | 10 | Portal: círculo degradado; marco negro |
| `emptyTileLight` (N1–N2) | 10 en vacíos | Claridad pedagógica |

### Luz fuera del radio, sprite dentro

Una fuente **fuera** del radio 7 puede iluminar tiles **dentro** del radio (si dual-LOS lo permite), pero su sprite/antorcha **no se dibuja** hasta que el tile de la fuente sea visible.

Intención: sientes el brillo que “viene de más allá”, sin spoilear la posición exacta del foco hasta estar en visión.

---

## Oclusión: lógica vs cara de muro

Hay dos intenciones distintas que no deben confundirse:

### A. Oclusión lógica (tile)

`TILE_WALL` y `TILE_DESTRUCTIBLE` son opacos a la visión. `TILE_PASS` **no** bloquea visión (sí puede bloquear blast): puentes/ventilación legibles.

### B. Oclusión visual de crestas (`mineWalls`)

Los muros de mina se pintan como **volumen por cuartos** (NW/NE/SW/SE) según vecindad y posición del viewer. Cada cuarto toma la luz *renderizada* del piso abierto correspondiente (radio + `visibleTiles` + fundido de borde), con **pesos suaves** (`wallFaceWeight`) — no cortes binarios. Esquinas (UL/UR/DL/DR) dejan el cuarto interior ~0 y reparte las caras abiertas.

La niebla bajo el muro usa una rejilla bilineal (degradado); los sprites son 4 crops tintados. Las luces de cuarto **persiguen** el objetivo con delay (~0.42 s), alineado a la niebla. Si al descubrir no hay piso usable al frente, se usa la luz propia del muro en las caras abiertas (evita muro “invisible” en el borde).

Destructibles: tint multiplicativo según luz mostrada + fundido de borde (bloque sólido, sin cuartos).

---

## Niebla y borde suave

- Niebla = **negro con alpha** sobre fondo negro (sin gris de “fog of war” genérico).
- En el radio exterior (aprox. distancia 5 → 7) hay un **fundido suave** (`visionFog`) para que el corte del radio 7 no sea un círculo de sierra.
- Fuera del viewport de visión calculado, el margen del mapa se rellena de negro sólido.

Intención estética alineada con estilo: oscuridad de mina + luz de lámpara, no UI de estrategia clásica.

---

## Qué debe y no debe revelar la luz

| Debe | No debe |
|------|---------|
| Terreno bajo luz actual | Enemigos/bombas solo por memoria |
| Primer obstáculo como borde lit | Contenido detrás del obstáculo |
| Minimapa de lo descubierto | Spoilear antorchas fuera de visión |
| Señales de fuentes (brillos, amenazas) | Cruz rígida / flood fill trampa |
| Suavizar pintura al moverse | Retrasar la lógica de qué es “visible” |

---

## Flujo mental (una frase)

**La lógica construye un mapa de luz aditiva solo donde el viajero puede “meter la mirada” (radio 7 + dual LOS + cono del casco); marca esos tiles visibles y los recuerda para siempre. Las vistas pintan casi-negro sobre todo, aclaran donde hay luz mostrada, suavizan el borde, parten muros en cuartos con degradado y delay, tintan destructibles, y ocultan actores dinámicos salvo luz actual.**

---

## Archivos de referencia

| Archivo | Rol |
|---------|-----|
| `src/game/systems/VisionSystem.js` | Campo de luz, LOS, `visibleTiles` / `discoveredTiles` |
| `src/phaser/views/FogOfWarView.js` | Niebla, memoria, interpolación, cuartos de muro |
| `src/config/visionFog.js` | Fundido del borde del radio |
| `src/config/mineWalls.js` | Forma y oclusión visual de muros |
| `src/phaser/views/TilemapView.js` | Tint/crop de muros, antorchas |
| `src/phaser/views/enemyLighting.js` | Curva de exposición de sprites |
| `tests/unit/visionSystem.test.js` | Contrato de intenciones lógicas |
| `tests/unit/mineWalls.test.js` | Contrato de caras/cuartos |

---

## Drift conocido (doc vs código)

Útil al mantener este documento o `DESIGN.md`:

- Transición visual: `DESIGN.md` menciona ~140 ms; `FogOfWarView` usa **0.42 s**.
- El casco es **cono 180°**, no disco completo (el resumen corto de DESIGN habla de intensidad 7 sin enfatizar el cono).
- `GridQuery.lineOfSight` ≠ `VisionSystem.hasLineOfSight`.

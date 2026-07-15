# Uncover — Tileset Movimiento I (cómo proceder)

> Arte: [`VISUAL_STYLE.md`](./VISUAL_STYLE.md). Lógica de tiles: [`DESIGN.md`](./DESIGN.md). Economía menas: [`CRAFTING.md`](./CRAFTING.md).  
> Runtime actual: `TILE_SIZE = 16` en código; **arte nuevo = 32×32**. Migrar el engine cuando el primer tileset esté listo.

## Cómo pensar los tiles (no te atasques)

Hay **dos capas**:

| Capa | Pregunta | Ejemplo |
|------|----------|---------|
| **Lógica** (`GridMap`) | ¿Qué puede hacer el juego aquí? | `EMPTY` / `WALL` / `DESTRUCTIBLE` / `PASS` |
| **Visual** (capas Tiled) | ¿Qué se ve? | piso A, muro con viga, caja de escombros, mena cobriza… |

Primero define el **mínimo lógico**. Luego variantes visuales.  
No generes un tileset de 200 piezas: empieza por **N1–N2 jugable**.

```
PixelLab (piezas 32×32)
    → ensamblar PNG atlas / tileset
    → Tiled (mapa .tmj + .tsj)
    → game (GridMap = lógica; otras capas = pintura)
```

---

## Paso 1 — Set mínimo (obligatorio)

Con esto ya pintas un Bomberman-de-minas:

| ID lógico | Uso | Visual mínimo |
|-----------|-----|----------------|
| `EMPTY` | Caminable | 2–3 pisos de piedra de mina |
| `WALL` | Sólido, no rompible | 2–3 muros (piedra / con madera / esquina) |
| `DESTRUCTIBLE` | Rompible con bomba | 2–3 “escombro / caja / pilar débil” |
| `PASS` | Camina, para el blast | 1 puente / rejilla / ducto |

**Total arranque: ~8–12 tiles.** No más.

### Añadir en N2 (craft)

| Extra | Lógica | Visual |
|-------|--------|--------|
| Mena cobriza | overlay o tile especial sobre `EMPTY` / en `DESTRUCTIBLE` | ver CRAFTING |
| Mena hierro | igual | |
| Cristal teal | más raro | |

Decisión de diseño recomendada:

- **Menas = objetos / capa aparte** (no mezclar con `DESTRUCTIBLE` genérico), para que pico vs bomba sea claro.
- Destructibles “vacíos” (sin mena) vs destructibles que **esconden** mena (al romper con bomba: se pierde; con pico sobre mena visible: se gana).

---

## Paso 2 — Orden de generación en PixelLab

No pidas “todo el tileset de la mina”. Pide **familias**:

### Oleada A — Núcleo N1

1. Floor stone (base)  
2. Floor stone variant (grietas / polvo)  
3. Wall solid  
4. Wall with timber support  
5. Destructible rubble crate  
6. Destructible weak pillar  
7. Pass grate / bridge plank  

### Oleada B — N2 menas

8. Ore copper on stone  
9. Ore iron on stone  
10. Ore teal crystal on stone  

### Oleada C — Atmo (después)

11. Floor under lamp glow  
12. Wall with wall-lamp  
13. Shadow floor edge  
14. Puzzle block off/on *(ya en entidades)*  
15. Trap plate  

### Oleada D — Autotile / bordes (solo si hace falta)

Esquinas y bordes de muro. **No** empieces aquí.

---

## Paso 3 — Prompt general PixelLab (tileset / pack)

Si PixelLab tiene generador de **tiles / tilemap pack**, usa una descripción de familia:

```
Top-down Nordic dwarf mine tileset for a 32x32 pixel Bomberman-like game. Rich multi-stop gradients, selective outlines, warm forge-lamp palette: blue-gray stone, timber, bronze fittings, soft amber light. Seamless tiles where needed. Include: walkable stone floors (2-3 variants), solid carved stone walls, timber-reinforced walls, destructible rubble blocks and weak pillars, walkable blast-blocking grate or wooden bridge planks. Mine that feels active and crafted, not ruined horror. No characters, no UI text, no stickers, consistent lighting from above.
```

### Prompts por pieza (si vas uno a uno)

**Floor**
```
top-down 32x32 Nordic mine floor tile, blue-gray carved stone, soft dust and micro-cracks, rich gradients, seamless-ready, warm ambient light, blank padding none, single tile
```

**Wall**
```
top-down 32x32 solid Nordic mine wall tile, thick carved stone block face, subtle bronze bolt accents optional, rich gradients, blocks path, not destructible look, single tile
```

**Destructible**
```
top-down 32x32 destructible mine rubble crate tile, stacked broken stones and timber scraps, looks breakable, rich gradients, soft shadow, single tile
```

**Pass**
```
top-down 32x32 mine bridge grate tile, wooden planks with iron-bronze bolts over dark gap, walkable, rich gradients, single tile
```

**Copper ore**
```
top-down 32x32 Nordic mine floor tile with copper-bronze ore vein nodule, warm metallic shine, collectible look, rich gradients, single tile
```

---

## Paso 4 — Ensamblar en Tiled

1. Canvas / tileset image: celdas **32×32**.  
2. Un tileset `mines_foundation_32.tsj` (+ PNG atlas).  
3. Capas (como el prototipo actual):
   - `Background` / `Ground` — pintura  
   - `GridMap` — **solo** IDs lógicos 0–3 (o el mapping que use `LevelLoader`)  
   - Objetos: `playerSpawn`, `enemySpawn`, `portalSpawn`, menas si son objects  
4. Primer mapa: **N1 pequeño** (solo floor/wall/destructible/pass).  
5. Segundo: **N2** + 2–3 menas.

Contrato de carga actual: capa `GridMap` + object layer (`LevelLoader`). Mantén eso; cambia el **arte**, no el pipeline.

---

## Paso 5 — Criterio “ya está bien”

Un floor/wall es bueno si:

- Se lee a distancia (silueta piso vs muro).  
- No compite con el jugador (menos saturado que bronce/ámbar del héroe).  
- Variantes no “ruido” de ruido: máximo 2–3 por tipo al inicio.  
- Destructible **se distingue** del muro sólido a primera vista.

---

## Qué no hacer ahora

| Evitar | Por qué |
|--------|---------|
| Autotile 47-blob completo | Semanas de trabajo sin gameplay |
| 16×16 “por ahora” | Rompe el contrato visual |
| Menas dentro del mismo look que rubble genérico | Se pierde pico vs bomba |
| Migrar `TILE_SIZE` antes de tener 8–12 tiles | Trabajo | |

---

## Checklist de esta semana

1. [ ] Generar oleada A (7 tiles) en PixelLab  
2. [ ] Montar atlas 32×32  
3. [ ] Mapa Tiled de prueba N1 (`GridMap` + paints)  
4. [ ] Oleada B (3 menas)  
5. [ ] Recién entonces tocar `TILE_SIZE` / hitboxes en código  

---

## Relación con entidades

Tiles = **escenario**.  
Bombas, golems, minerales recolectables “sueltos”, portal, puzzle block activable = pueden ser **sprites/objetos** encima (ver [`VISUAL_PROMPTS_MOV1.md`](./VISUAL_PROMPTS_MOV1.md)).

Si la mena es tile del suelo o objeto: da igual al jugador; lo importante es que el **pico** y el **blast** tengan reglas claras ([`CRAFTING.md`](./CRAFTING.md)).

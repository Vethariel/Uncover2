# Uncover — Terreno + ambientación Mov. I

> Arte: [`VISUAL_STYLE.md`](./VISUAL_STYLE.md). Craft: [`CRAFTING.md`](./CRAFTING.md). Entidades (enemigos, bomba, jugador): [`VISUAL_PROMPTS_MOV1.md`](./VISUAL_PROMPTS_MOV1.md).  
> Runtime actual: `TILE_SIZE = 16`; **arte = 32×32**. Migrar engine cuando el set mínimo esté listo.

## Decisión de pipeline (importante)

**Solo dos tipos de tile de terreno**, con variaciones:

| Terreno | Qué es | Variantes (arranque) |
|---------|--------|----------------------|
| **Suelo** | Casilla caminable / base del nivel | 2–4 piedras de mina (grietas, polvo, sombra suave) |
| **Vacío** | Hueco / pozo / no-piso (caída, abismo, “no hay suelo”) | 1–2 (borde de pozo, vacío profundo) |

**Todo lo demás son ítems de ambientación** (props 32×32), no tiles de terreno:

- Muros sólidos  
- Muros / bloques destructibles  
- Bloques de mineral (en muro o sobre suelo)  
- Antorchas / lámparas  
- Vigas, escombros estéticos, rejillas, ductos, cartelitos, etc.

PixelLab: hasta **64 ítems** desde una descripción general. Tú listas los importantes; **los huecos restantes los inventa PixelLab** (atmo extra).

```
Terreno (2 tipos + variantes)     → tiles Tiled / capa suelo
Ítems ambiente (≤64 pack)         → props / objetos / capa props
Lógica jugable (collision, ore…)  → metadata del ítem o capa GridMap
```

La **lógica** del juego (sólido, rompible, mena, pass) no desaparece: vive en **qué hace cada ítem** al colocarlo, no en “ser un tercer tipo de tile”. El prototipo actual mezcla muro en `GridMap`; al migrar, suelo/vacío en terreno + props con flags (`solid`, `destructible`, `ore`, `blocksBlast`, `walkable`).

---

## Paso 1 — Generar terreno (pocas piezas)

### PixelLab — descripción familia terreno

```
Top-down 32x32 Nordic dwarf mine TERRAIN tiles only: walkable carved stone FLOORS (2-4 seamless variants with dust and micro-cracks) and VOID / pit tiles (dark abyssal openings, 1-2 variants with soft rim). Rich multi-stop gradients, selective outlines, warm forge ambient light, blue-gray stone, soft amber spill. No walls, no crates, no characters, no lamps — floors and empty pits only. Mine feels active and crafted, not ruined horror.
```

### Pieza a pieza (si hace falta)

**Suelo**
```
top-down 32x32 Nordic mine floor tile, blue-gray carved stone, soft dust micro-cracks, rich gradients, seamless-ready, warm ambient light
```

**Vacío**
```
top-down 32x32 Nordic mine void pit tile, dark abyssal hole with soft stone rim, reads as no-floor, rich gradients, not a wall
```

---

## Paso 2 — Pack de ítems de ambientación (hasta 64)

### Descripción general (pega esto en PixelLab “items”)

> Evitar la palabra **wall**: PixelLab la interpreta como muro de escenario / pantalla. Pedir **bloques, vetas, pilares, props**.

```
Flat orthographic TOP-DOWN 32x32 Nordic dwarf mine ambient OBJECTS and obstacle props for a Bomberman-like PC game — NOT isometric, NOT side-view walls, NOT full-screen barriers.

Rich multi-stop pixel gradients, selective soft outlines (no thick black sticker outlines), warm forge-lamp amber light, blue-gray carved stone, timber, bronze fittings. One compact object per cell, readable at tile scale, sitting on or replacing a floor square. Active crafted working mine, not ruined horror.

Must include these obstacle / resource props:
1) Solid carved stone BLOCK (dense cube/chunk that fills the cell — impassable rock mass)
2) Stone BLOCK with timber braces / wooden struts strapped around it
3) Loose rubble STACK / cracked stone chunk (looks breakable)
4) Cracked stone pillar stump / weak column remnant (looks breakable)
5) Copper-bronze ORE VEIN nodule embedded in a stone block
6) Iron-gray ORE VEIN nodule embedded in a stone block
7) Teal crystal ORE VEIN / crystal cluster embedded in a stone block
8) Mine lamp / torch prop with amber glow (mounted on a small stone peg or free-standing brazier — not a full wall)
9) Wooden cross-beam / timber support prop
10) Thin iron-bronze grate or plank section (flat, walkable look)
11) Soft decorative debris pile
12) Rope or chain coil / hanging chain snippet
13) Small tool crate or storage box
14) Mine-cart wheel or cart fragment
15) Steam vent / stone grille detail
16) Dormant portal stone fragment or rune-marked block (optional)

Then invent many more matching props to fill remaining slots: barrels, pegs, bronze plaques, chalk scratch marks, mineral drips, moss tufts, abandoned pickaxe stump, pressure-plate-like stone discs, hanging signs without readable letters, etc.

Do NOT generate: side-view castle walls, isometric wall strips, room borders, characters, UI text, stickers, empty floor textures.
```

### Lista priorizada (tú controles el significado)

| Prioridad | Ítem | Rol jugable sugerido |
|-----------|------|----------------------|
| P0 | Muro piedra sólido | sólido, no rompible |
| P0 | Muro con madera/viga | sólido |
| P0 | Caja / escombro destructible | rompible bomba |
| P0 | Pilar débil destructible | rompible bomba |
| P0 | Mena cobre en muro | pico → material; blast → pierde |
| P0 | Mena hierro en muro | igual |
| P0 | Cristal teal en muro | más raro |
| P0 | Antorcha / lámpara de muro | luz + atmo (N4+) |
| P1 | Rejilla / tablón bridge | walkable; puede bloquear blast (`PASS`) |
| P1 | Viga de madera suelta | decoración o ligero cover |
| P1 | Brasero / poste de luz | luz |
| P1 | Escombros decorativos | solo atmo (no bloquean, o bloquean débil) |
| P2 | Carrito / rueda, caja de herramientas, cadena, placa bronce, vapor… | inventario inventado hasta 64 |

Lo que no rellenes: **deja que PixelLab invente**. Luego curas: si algo sirve de muro/destructible, lo etiquetas; si es basura, queda decoración.

---

## Paso 3 — Cómo mapear a lógica (para no perder el Bomberman)

| Visual | Flag sugerido | Equivalente viejo |
|--------|---------------|-------------------|
| Suelo sin props | walkable | `EMPTY` floor |
| Vacío | no walkable / death o blocked | nuevo / pit |
| Prop muro sólido | `solid` | `WALL` |
| Prop destructible | `solid` + `destructible` | `DESTRUCTIBLE` |
| Prop mena | `solid`? + `ore` + tipo | overlay mineral |
| Prop rejilla | walkable + `blocksBlast` | `PASS` |
| Antorcha | atmo / `light` | — |

Menas visibles en muro: pico **sobre esa celda/ítem** recolecta; blast las **destruye** ([`CRAFTING.md`](./CRAFTING.md)).

---

## Paso 4 — Tiled / ensamblaje

1. Tileset de **terreno** (suelo + vacío), celdas 32×32.  
2. Atlas / carpeta de **ítems ambiente** 32×32 (el pack de 64).  
3. Capas sugeridas:
   - `Ground` — solo suelo / vacío  
   - `Props` o objects — muros, destructibles, menas, luces…  
   - `GridMap` (transición) — si aún usas el loader viejo, puedes pintar lógica desde los props al exportar, o mantener GridMap mientras migras  
4. Primer mapa: N1 = suelos + muros + destructibles + 0–1 luces.  
5. N2 = + menas en muro.

---

## Criterio “ya está bien”

- Suelo vs vacío se lee a distancia.  
- Muro sólido ≠ destructible ≠ mena (silueta / color / brillo).  
- Props no compiten con el jugador (héroe más cálido/brillante).  
- Pack de 64: ~15–20 con intención; el resto es bonus de PixelLab + curaduría.

---

## Qué no hacer ahora

| Evitar | Por qué |
|--------|---------|
| Meter muros como tercer “tipo de tile” | Rompe tu contrato PixelLab/ítems |
| Autotile 47-blob de muros | Prematuro |
| 64 menas distintas de craft | Solo 3 bolsillo; el resto es atmo |
| Migrar `TILE_SIZE` sin suelo+vacío+muros mínimos | Ineficiente |

---

## Checklist

1. [ ] Terreno: 2–4 suelos + 1–2 vacíos  
2. [ ] Pack ítems: pegar descripción general + revisar P0  
3. [ ] Curar: etiquetar solid / destructible / ore / light  
4. [ ] Mapa Tiled N1 de prueba  
5. [ ] Oleada menas visible (P0)  
6. [ ] Migrar `TILE_SIZE` / hitboxes cuando se vea jugable  

---

## Relación con otros docs

- **Entidades animadas** (jugador, golem, bomba…): [`VISUAL_PROMPTS_MOV1.md`](./VISUAL_PROMPTS_MOV1.md) — no son ítems de ambientación.  
- **Ítems de craft / shop UI**: hasta 64 también en [`CRAFTING.md`](./CRAFTING.md) — *otro* pack posible; no mezclar con props de mapa si PixelLab es sesión separada.  
- Ambientación de nivel = este documento.

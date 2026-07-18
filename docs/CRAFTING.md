# Uncover — Minerales, Taller y mejoras (Mov. I+)

> Contrato de economía de craft. Narrativa: [`NARRATIVE.md` — Recursos y fabricación](./NARRATIVE.md#recursos-y-fabricación). Mov. I: [`MOVEMENT_I.md`](./MOVEMENT_I.md). Arte/ítems: [`VISUAL_STYLE.md`](./VISUAL_STYLE.md) · prompts: [`VISUAL_PROMPTS_MOV1.md`](./VISUAL_PROMPTS_MOV1.md).

## Principio

1. **En el nivel** se recolectan minerales (no se recogen power-ups Bomberman clásicos).
2. **En el Taller** (entre niveles, desde N2) esos minerales se convierten en **mejoras**.
3. Bombas siguen siendo **magia del viajero** (generadas); el mineral **fortalece** esa magia / el pico / el cuerpo — no fabrica cada bomba suelta.
4. Cada mejora fabricada pesa en el **Sacrificio** (Mov. V).
5. Fabricar la misma línea varias veces tiene **rendimientos decrecientes**.

Tensión jugable Mov. I:

> Bomba abre rápido y puede **destruir** mineral. Pico es lento y **conserva** valor.

---

## Flujo

```
Nivel (props de mineral / mena en muro)
    │
    ├─ Pico (Q hold) → mineral crudo → runResources (HUD)
    └─ Blast → mineral destruido → nada (Mov. I temprano)
    │
    ▼
Al completar nivel: runResources → workshopCrude
Game over N1–N2: wipe total (nueva partida)
Game over N3+: clear runResources (taller + mejoras permanecen) → hub
    │
    ▼
Taller (hub, post-N2)
    │
    ├─ Horno (E): smelting por lote crudo → refinado
    ├─ Yunque (E): craft rango 1 (6 mejoras)
    └─ Puerta: siguiente nivel o reintento
    │
    ▼
upgrades: maxBombs, bombRange, pickSpeed, fortune, moveSpeed, maxLives
```

---

## Capas de contenido (importante para PixelLab)

PixelLab permite hasta **64 ítems** por descripción general. Separar **sesión de mapa** vs **sesión de UI/craft**.

| Capa | Qué es | Cuántos en runtime | Dónde |
|------|--------|---------------------|--------|
| **A — Ambientación de nivel** | Muros, destructibles, menas en muro, antorchas, props | pack ≤64 (tú listas P0; PixelLab inventa el resto) | [`TILESET_MOV1.md`](./TILESET_MOV1.md) |
| **B — Materiales de bolsillo** | Monedas de craft tras recoger | **3** (Mov. I) | este doc |
| **C — Íconos de mejora / rangos** | UI del Taller | ~12–20 | pack UI aparte (hasta 64) |
| **D — Chatarras / extras** | Feedback si el blast destroza mena | 1–3 | pack UI / VFX |

Terreno del mapa = solo **suelo + vacío** (tiles). Menas y muros = **ítems de ambiente** (capa A), no un tercer tipo de tile. **B** es la economía real.

En el flowchart abajo, “tiles de mineral” = **props de mena** sobre suelo/muro.

---

## Materiales de bolsillo (economía Mov. I)

Tres materiales en crudo. El pico entrega **crudo** al inventario. El Taller **refina** (smelting) antes de gastar en mejoras.

| ID crudo | ID refinado | Nombre | Rol |
|----------|-------------|--------|-----|
| `mat_copper` | `mat_copper_ref` | **Bronce de veta** | Línea **bomba** |
| `mat_iron` | `mat_iron_ref` | **Hierro de montaña** | Línea **pico** |
| `mat_vein` | `mat_vein_cut` | **Cristal de mina** | Línea **cuerpo** |

### Conversión desde props de mapa

| Prop visual (nivel) | → Material | Notas |
|---------------------|------------|--------|
| Mena cobriza / ámbar | Bronce | Común en Túneles tempranos |
| Mena gris / plata-hierro | Hierro | Paredes profundas |
| Cristal teal | Cristal | Más raro; brillo fuerte |
| Mixta (cobre+teal) | Split 1+1 o elegir mayor | Opcional N5+ |

El jugador gestiona contadores de **crudo** y **refinado** (y aleaciones) en el Taller. El HUD de run puede mostrar solo totales o solo crudo hasta visitar el hub.

---

## Extracción vs destrucción

| Acción | Resultado |
|--------|-----------|
| **Pico** (`Q` hold) en destructible | Progreso acumulado en el bloque; al completar → tile vacío |
| **Pico** en mena | +yield al material (`bronze` / `iron` / `crystal`) en `runResources` |
| **Pico** en destructible sin mena | Abre camino; 0 material |
| **Blast** que alcanza mineral | Mineral **destruido**; **0** material de craft *(por defecto Mov. I)* |
| Opcional (N5+) | Blast deja **Chatarra** (`mat_scrap`) con valor bajo solo para crafts menores / no mejoras principales |

Recomendación Mov. I: **sin chatarras al inicio** — castigo claro por abrir con bomba. La chatarra puede llegar después si hace falta suavizar.

### Timing y yield base (pico)

| Tipo | Tiempo | Yield |
|------|--------|-------|
| Roca / destructible sin mena | 2.5 s | 0 |
| Bronce / hierro | 2.5 s | 1 |
| Cristal | 3.5 s | 2 |

Es la velocidad base sin mejoras. Las mejoras de `pickSpeed` pueden recuperar tiempos más rápidos; al inicio, la bomba conserva una ventaja clara para abrir camino.

---

## Líneas de mejora (Taller)

No hay pickup de “bomba+” en el mapa. Solo craft.

### Línea Bomba *(usa sobre todo Bronce)*

| Mejora | Efecto | Coste base (rango 1→2→3…) |
|--------|--------|---------------------------|
| **Capacidad** (`maxBombs`) | +1 bomba concurrente | 3 / 5 / 8 Bronce *(+hierro opcional en rangos altos)* |
| **Alcance** (`bombRange`) | +1 tile de blast | 3 / 5 / 8 Bronce |

Base de partida Mov. I: `maxBombs = 1`, `bombRange = 1` (como hoy).

### Línea Pico *(usa sobre todo Hierro)*

| Mejora | Efecto | Coste base |
|--------|--------|------------|
| **Temple** (`pickSpeed`) | −15% tiempo de picado por rango | 3 / 5 / 8 Hierro |
| **Fortuna** (`fortune`) | 20% chance de +1 material por rango | 3 / 5 / 8 Hierro |

Base: pico lento, 1 mena común = 1–2 swings según dureza de tile.

### Línea Cuerpo *(usa sobre todo Cristal)*

| Mejora | Efecto | Coste base |
|--------|--------|------------|
| **Pasos** (`moveSpeed`) | +velocidad de movimiento | 3 / 5 / 8 Cristal |
| **Respiro** (`lives` / max HP) | +1 vida (o +heart) | 4 / 7 / 11 Cristal |

### Mixtos (rangos altos — opcional)

Algunas recetas piden **2 materiales** (ej. Alcance 3 = Bronce + Cristal) para forzar exploración mixta y no dump todo en una línea.

---

## Rendimientos decrecientes

Canon ([`NARRATIVE.md`](./NARRATIVE.md#recursos-y-fabricación)):

> Fabricar repetidamente una misma mejora produce rendimientos decrecientes.

Implementación recomendada:

| Rango ya tenido en esa mejora | Multiplicador de coste |
|-------------------------------|------------------------|
| 0 → 1 | ×1.0 |
| 1 → 2 | ×1.5 |
| 2 → 3 | ×2.0 |
| 3 → 4 | ×2.5 |

Tope suave Mov. I: **3 rangos** por mejora (suficiente para N7 sin inflar lista de íconos).

UI del Taller: mostrar coste **siguiente** claro; sin “máximo teórico” intimidante.

---

## Run state (datos)

```text
materialsCrude:   { copper, iron, vein }
materialsRefined: { copper, iron, vein }
alloys:           { temperedBronze, mineSteel, setCrystal }
recipesKnown:     { upgradeId → maxRankUnlocked }  // r1 siempre; r2/r3 por fragmentos
recipeFragments:  [ id, … ]
upgrades: {
  maxBombs, bombRange, pickSpeed, fortune, moveSpeed, maxLives
}
```

El **Sacrificio** (Mov. V) desmonta entradas de `upgrades`, no los materiales crudos.

---

## Diseño de niveles (tokens)

| Nivel | Qué introduce respecto a craft |
|-------|--------------------------------|
| 1 | Sin mineral de craft (solo bombas) |
| 2 | Tres nodos, un material cada uno + Taller; recetas de **rango 1** |
| 3–4 | Más densidad; enemigos y menas en tensión; primeros **fragmentos de receta** rango 2 |
| 5–6 | Menas ricas / nodos grandes; aleaciones; fragmentos rango 2–3 |
| 7 | Carrera de recursos; tope de presupuesto del movimiento |

La tabla detallada de enemigos, menas por nodo e indicador de recursos accesibles está en [`PROCEDURAL_LEVELS.md`](./PROCEDURAL_LEVELS.md#enemigos-recursos-y-presupuesto).

---

## Presupuesto de craft — techo Mov. I

Al **cerrar el Movimiento I**, un jugador que explora con pico (sin bombardear menas) debe poder, como máximo:

| Camino | Resultado |
|--------|-----------|
| **A — ancho** | **2 mejoras a rango 2** + **1 mejora a rango 1** |
| **B — alto** | **1 mejora a rango 3** (y poco más) |

No debe sobrar stock para llenar tres líneas a rango 3. El presupuesto total de **material refinado** tras smelting ronda **28–34 unidades** repartidas entre Bronce / Hierro / Cristal (mixto, no 30 de uno solo).

### Costes efectivos de referencia

Usando costes base `3 / 5 / 8` y multiplicadores `×1 / ×1.5 / ×2`:

| Paso | Coste efectivo |
|------|----------------|
| 0 → 1 | 3 |
| 1 → 2 | ≈ 8 |
| 2 → 3 | 16 |

- Camino A: `(3+8) + (3+8) + 3 = 33` (un poco por encima del soft-cap → exige buen smelting / no desperdiciar blast).
- Camino B: `3+8+16 = 27`.

Playtest: si el camino A se siente imposible, bajar ligeramente el spawn de N5–N6 o suavizar el smelting; si sobra, subir densidad de enemigos o bajar yields ricos.

---

## Smelting y aleaciones

El Taller gana un paso de **fundición** antes (o junto) al craft de mejoras.

```
Mena cruda (bolsillo)
    │
    ▼
Smelting (purificar / compactar)
    │
    ├─ Lingote / fragmento refinado  →  recetas de mejora
    └─ Aleación                       →  recetas mixtas / rango alto
```

### Smelting (pérdida neta a cambio de pureza)

| Entrada | Salida | Ratio | Notas |
|---------|--------|-------|-------|
| 3 Bronce crudo | 2 Bronce refinado | 3→2 | Default Mov. I |
| 3 Hierro crudo | 2 Hierro refinado | 3→2 | |
| 2 Cristal crudo | 1 Cristal tallado | 2→1 | Más caro; el cristal es escaso |

Las **recetas de mejora consumen solo refinados** (o aleaciones). El crudo no se gasta directo en sellos de rango.

Por qué existe: fuerza la tensión pico vs bomba (cada mena cuenta) y evita inflación si el jugador limpia todos los nodos.

### Aleaciones

| Aleación | Receta | Uso |
|----------|--------|-----|
| **Bronce templado** | 2 Bronce ref. + 1 Hierro ref. → 1 | Recetas bomba rango 2+ |
| **Acero de mina** | 2 Hierro ref. + 1 Bronce ref. → 1 | Recetas pico rango 2+ |
| **Cristal engarzado** | 1 Cristal tallado + 1 Bronce ref. → 1 | Recetas cuerpo rango 2+ / mixtas |

Aleaciones son **opcionales** para rango 1 (esas van solo con refinados simples). Rangos 2–3 pueden exigir aleación + fragmento de receta.

---

## Recetas: conocidas vs descubiertas

| Rango | Cómo se obtiene la receta |
|------:|---------------------------|
| **1** | El Taller las **brinda todas** al desbloquear craft (post-N2) |
| **2** | Requiere **fragmento de receta** encontrado explorando |
| **3** | Requiere **esquema completo** (2–3 fragmentos o un hallazgo raro en nodo grande / N6–N7) |

### Fragmentos en el mapa

- Aparecen en nodos de recurso o en destructibles marcados (cofres de mina / placas).
- No se destruyen con blast si están en prop “esquema”; sí pueden quedar inaccesibles tras derrumbes de diseño.
- UI: “Receta incompleta — faltan N partes”.
- Sin la receta, el Taller muestra la mejora en gris con tip: *explora las minas*.

Así el techo económico (stock) y el techo de conocimiento (recetas) son dos frenos distintos: puedes tener mineral y no poder subir a rango 3, o tener el esquema y no el stock.

---

## Indicador de recursos por nivel

Cada nivel publica un **presupuesto accesible** (soft-cap de menas crudas que el generador intenta colocar de forma alcanzable):

| Nivel | Soft-cap crudo (total) | Desglose tipico | Notas |
|------:|------------------------|-----------------|---|
| 1 | 0 | — | Sin craft |
| 2 | 9 | 3+3+3 (un material por nodo) | Tutorial de pico |
| 3 | 12 | 5 Bronce · 5 Hierro · 2 Cristal | Cristal escaso |
| 4 | 14 | 5 · 5 · 4 | Más cristal |
| 5 | 16 | 6 · 5 · 5 | Nodos medianos ricos |
| 6 | 14 | 4 · 5 · 5 | Parte en nodo grande / riesgo |
| 7 | 10 | mixto / carrera | No fiable; bonus si da tiempo |

**Suma soft-cap crudo ≈ 75.** Con recolección realista ~70% y smelting 3→2 / 2→1, el refinado típico cae cerca del techo **28–34**.

El HUD del nivel (o el briefing) puede mostrar un indicador cualitativo: *Vetas pobres / normales / ricas*, derivado del soft-cap, no el número exacto.

---

## Estado

| Pieza | Estado |
|-------|--------|
| Principio niveles → Taller → mejoras | Canon |
| 3 materiales | Canon Mov. I |
| Líneas bomba / pico / cuerpo | Propuesto |
| Blast destruye yield | Canon Mov. I temprano |
| Techo Mov. I (2×r2+1×r1 **o** 1×r3) | Propuesto |
| Smelting 3→2 / cristal 2→1 | Propuesto |
| Aleaciones | Propuesto |
| Recetas r1 dadas; r2+ explorando | Propuesto |
| Presupuesto por nivel | Propuesto; ver procedural |
| Lista PixelLab ítems | Lista guía abajo |
| Números exactos de coste | Tunear en playtest |

Cuando se aprueben costes y techos, volcar rangos finales a [`DESIGN.md`](./DESIGN.md) y datos (`config/crafting.js`).

---

## Lista PixelLab — “general asset description” (hasta 64)

Usar esto (o una variante) como **descripción general** del generador de ítems. El sistema de juego **no** instancia 64 monedas.

### Descripción general (pegar en PixelLab)

```
Nordic dwarf mine item icons for a top-down 32x32 fantasy Bomberman-like game. Rich pixel gradients, selective outlines, warm forge-lamp palette (bronze, copper, iron-gray, teal crystal, leather). Each item is a single clear HUD/workshop icon on blank or transparent background. Include: ore nodules and crystal clusters as raw materials; refined bronze/iron/teal crystal pouches and ingots; alloys; recipe fragments/schematics; scrap rubble; bomb-related upgrade seals (capacity, blast range); pickaxe-related upgrade seals (temper, edge); traveler body upgrade seals (boots speed, heart/life); small toolkit and workshop widgets (anvil stamp, rune tag, empty pouch). Consistent size, readable at small scale, no text labels on the art itself, no characters, no UI frames.
```

### Inventario objetivo (~40–55 slots; dejar margen < 64)

**A — Menas de mapa / raw (props · ~12)**  
1. Copper ore node small  
2. Copper ore node rich  
3. Iron ore node small  
4. Iron ore node rich  
5. Teal crystal cluster small  
6. Teal crystal cluster rich  
7. Mixed copper-iron nodule  
8. Buried ore under rubble  
9. Wall-vein copper  
10. Wall-vein iron  
11. Floor crystal seam  
12. Ancient ore nugget (rare look)

**B — Materiales de bolsillo (icons · 3–4)**  
13. Pouch of bronze vein (crude)  
14. Pouch of mountain iron (crude)  
15. Pouch of mine crystal (crude)  
16. Pouch of scrap rubble *(si se activa chatarra)*

**B2 — Refinados / aleaciones (~6)**  
17. Bronze ingot refined  
18. Iron ingot refined  
19. Cut teal shard  
20. Tempered bronze alloy  
21. Mine steel alloy  
22. Set crystal alloy

**C — Mejoras bomba (sellos · ~8)**  
23–25. Bomb capacity seal rank 1/2/3  
26–28. Blast range seal rank 1/2/3  
29. Bomb workshop mold  
30. Amber fuse charm

**D — Mejoras pico (sellos · ~8)**  
31–33. Pick temper seal rank 1/2/3  
34–36. Pick edge seal rank 1/2/3  
37. Pickaxe head bronze blank  
38. Pickaxe head iron blank

**E — Mejoras cuerpo (sellos · ~8)**  
39–41. Traveler boots seal rank 1/2/3  
42–44. Heart/breath seal rank 1/2/3  
45. Leather strap kit  
46. Rune-tagged canteen

**F — Recetas / Taller (~8)**  
47. Recipe fragment tablet  
48. Complete schematic scroll  
49. Anvil stamp  
50. Empty material pouch  
51. Full mixed pouch  
52. Workshop tongs  
53. Smelter crucible icon  
54. Level-complete ore chest (UI)

Rellenar hasta ~60 solo con **variantes de mena** (ángulo, brillo) si PixelLab exige más filas; no inventar monedas nuevas de runtime.

---

## Qué no hacer (Mov. I)

| Evitar | Por qué |
|--------|---------|
| Power-ups en el suelo estilo Bomberman clásico | Rompe “fabricar identidad” y el Sacrificio |
| 12 stacks de mineral en HUD | Ruido; PixelLab ≠ economía |
| Mejoras infinitas sin techo | Inflación antes del Mov. V |
| Craft de “cada bomba” | Las bombas son magia; el mineral las **potencia** |
| Dar todas las recetas rango 2–3 al inicio | Quita el valor de explorar |
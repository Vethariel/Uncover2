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
Nivel (tiles de mineral)
    │
    ├─ Pico → mineral intacto → inventario (materiales)
    └─ Blast → mineral destruido → nada o chatarras (ver abajo)
    │
    ▼
Taller (hub)
    │
    └─ Recetas: materiales → mejora (1 rango)
    │
    ▼
Run state (maxBombs, bombRange, pickSpeed, moveSpeed, lives, …)
```

---

## Capas de contenido (importante para PixelLab)

PixelLab permite hasta **64 ítems** desde una descripción general. No hace falta que el **sistema** tenga 64 monedas distintas.

| Capa | Qué es | Cuántos en runtime |
|------|--------|---------------------|
| **A — Props de nivel** | Variantes visuales de mena en el mapa | ~6–12 looks |
| **B — Materiales de bolsillo** | Monedas de craft tras recoger | **3** (Mov. I) |
| **C — Íconos de mejora / rangos** | UI del Taller | ~12–20 |
| **D — Chatarras / extras** | Feedback si el blast destroza mena | 1–3 |

**A + C + D** alimentan la lista de 64. **B** es la economía real.

---

## Materiales de bolsillo (economía Mov. I)

Tres materiales. Todo lo que el pico extrae **se convierte** a uno de estos al recoger (o al cerrar el nivel).

| ID | Nombre | Rol | Alimenta sobre todo |
|----|--------|-----|---------------------|
| `mat_copper` | **Bronce de veta** | Cálido, metálico | Línea **bomba** (máx / alcance) |
| `mat_iron` | **Hierro de montaña** | Frío, dúctil | Línea **pico** (velocidad / fuerza de golpe) |
| `mat_vein` | **Cristal de mina** | Teal / cian (ver arte mineral) | Línea **cuerpo** (vida / movilidad) |

### Conversión desde props de mapa

| Prop visual (nivel) | → Material | Notas |
|---------------------|------------|--------|
| Mena cobriza / ámbar | Bronce | Común en Túneles tempranos |
| Mena gris / plata-hierro | Hierro | Paredes profundas |
| Cristal teal | Cristal | Más raro; brillo fuerte |
| Mixta (cobre+teal) | Split 1+1 o elegir mayor | Opcional N5+ |

El jugador **no** gestiona 12 stacks de menas distintas en UI — solo ve 3 contadores en el Taller (y opcionalmente un total en HUD de run).

---

## Extracción vs destrucción

| Acción | Resultado |
|--------|-----------|
| **Pico** en tile de mineral | Tile limpio / vacío; +yield al material mapeado |
| **Blast** que alcanza mineral | Mineral **destruido**; **0** material de craft *(por defecto Mov. I)* |
| Opcional (N5+) | Blast deja **Chatarra** (`mat_scrap`) con valor bajo solo para crafts menores / no mejoras principales |

Recomendación Mov. I: **sin chatarras al inicio** — castigo claro por abrir con bomba. La chatarra puede llegar después si hace falta suavizar.

### Yield base (pico)

| Tipo de mena | Yield |
|--------------|-------|
| Común | 1 |
| Rica | 2 |
| Cristal raro | 2–3 |

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
| **Temple** (`pickSpeed`) | Menos tiempo por golpe / swing más rápido | 3 / 5 / 8 Hierro |
| **Filo** (`pickPower`) *(opcional Mov. I)* | Menos golpes para romper mena dura | 4 / 6 / 9 Hierro |

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
materials: { copper, iron, vein, scrap? }
upgrades: {
  maxBombs,      // int, base 1
  bombRange,     // int, base 1
  pickSpeed,     // float or tier 0..3
  pickPower,     // tier 0..3 (optional)
  moveSpeed,     // float or tier
  lives,         // int
}
```

El **Sacrificio** (Mov. V) desmonta entradas de `upgrades`, no los materiales crudos.

---

## Diseño de niveles (tokens)

| Nivel | Qué introduce respecto a craft |
|-------|--------------------------------|
| 1 | Sin mineral de craft (solo bombas) |
| 2 | Primeras menas + Taller; Bronce/Hierro visibles |
| 3–4 | Más densidad; Cristal aparece escaso |
| 5–6 | Menas ricas / puzzles que liberan clusters |
| 7 | Carrera: score de mineral recolectado (+ upgrades ya craftadas) |

---

## Lista PixelLab — “general asset description” (hasta 64)

Usar esto (o una variante) como **descripción general** del generador de ítems. El sistema de juego **no** instancia 64 monedas.

### Descripción general (pegar en PixelLab)

```
Nordic dwarf mine item icons for a top-down 32x32 fantasy Bomberman-like game. Rich pixel gradients, selective outlines, warm forge-lamp palette (bronze, copper, iron-gray, teal crystal, leather). Each item is a single clear HUD/workshop icon on blank or transparent background. Include: ore nodules and crystal clusters as raw materials; refined bronze/iron/teal crystal pouches; scrap rubble; bomb-related upgrade seals (capacity, blast range); pickaxe-related upgrade seals (temper, edge); traveler body upgrade seals (boots speed, heart/life); small toolkit and workshop widgets (anvil stamp, rune tag, empty pouch). Consistent size, readable at small scale, no text labels on the art itself, no characters, no UI frames.
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
13. Pouch of bronze vein  
14. Pouch of mountain iron  
15. Pouch of mine crystal  
16. Pouch of scrap rubble *(si se activa chatarra)*

**C — Mejoras bomba (sellos · ~8)**  
17–19. Bomb capacity seal rank 1/2/3  
20–22. Blast range seal rank 1/2/3  
23. Bomb workshop mold  
24. Amber fuse charm

**D — Mejoras pico (sellos · ~8)**  
25–27. Pick temper seal rank 1/2/3  
28–30. Pick edge seal rank 1/2/3  
31. Pickaxe head bronze blank  
32. Pickaxe head iron blank

**E — Mejoras cuerpo (sellos · ~8)**  
33–35. Traveler boots seal rank 1/2/3  
36–38. Heart/breath seal rank 1/2/3  
39. Leather strap kit  
40. Rune-tagged canteen

**F — Utilidad Taller / feedback (~10)**  
41. Anvil stamp  
42. Empty material pouch  
43. Full mixed pouch  
44. Workshop tongs  
45. Small bronze ingot  
46. Small iron ingot  
47. Cut teal shard  
48. Broken bomb casing (flavor)  
49. Cracked crystal (failed craft flavor)  
50. Level-complete ore chest (UI)

Rellenar hasta ~60 solo con **variantes de mena** (ángulo, brillo) si PixelLab exige más filas; no inventar monedas nuevas de runtime.

---

## Qué no hacer (Mov. I)

| Evitar | Por qué |
|--------|---------|
| Power-ups en el suelo estilo Bomberman clásico | Rompe “fabricar identidad” y el Sacrificio |
| 12 stacks de mineral en HUD | Ruido; PixelLab ≠ economía |
| Mejoras infinitas sin techo | Inflación antes del Mov. V |
| Craft de “cada bomba” | Las bombas son magia; el mineral las **potencia** |

---

## Estado

| Pieza | Estado |
|-------|--------|
| Principio niveles → Taller → mejoras | Canon |
| 3 materiales | Propuesto Mov. I |
| Líneas bomba / pico / cuerpo | Propuesto |
| Blast destruye yield | Propuesto (sin scrap al inicio) |
| Lista PixelLab ítems | Lista guía arriba |
| Números exactos de coste | Tunear en playtest |

Cuando se aprueben costes y techos, volcar rangos finales a [`DESIGN.md`](./DESIGN.md) y recetas a datos de juego (`config/crafting.js` o equivalente).

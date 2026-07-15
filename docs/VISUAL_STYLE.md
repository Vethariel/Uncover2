# Uncover — Dirección visual

> Contrato de arte. Narrativa: [`NARRATIVE.md`](./NARRATIVE.md). Cultura: [`CULTURAL_FOUNDATION.md`](./CULTURAL_FOUNDATION.md). Gameplay: [`DESIGN.md`](./DESIGN.md). Mov. I: [`MOVEMENT_I.md`](./MOVEMENT_I.md).

## Principio

Uncover **no** imita un SNES ni busca nostalgia 8-bit.

La cámara y la jugabilidad son *tipo Bomberman* (rejilla, top-down, bombas).

La **piel visual** aprovecha un PC moderno: gradientes ricos, materiales legibles, luz cálida, volumen.

| Capa | Decisión |
|------|----------|
| **Gameplay** | Top-down, tile **32×32**, silueta clara a tamaño juego |
| **Render** | Pixel art **denso** con shading / gradientes (no flat 4 colores) |
| **Atmósfera Mov. I** | Fantasía nórdica de mina activa — oficio, metal, cuero, lámpara |
| **Outlines** | Selectivos o por color del material; **evitar** stroke negro grueso alrededor del sprite |

> *Si quitas el grid, debe seguirse viendo un mundo rico. Si reduce el tamaño, debe seguir leyéndose quién es.*

### Tamaño de tile

**Decisión:** rejilla de **32×32 px** (no 16×16).

| Razón | Detalle |
|-------|---------|
| **Riqueza visual** | Gradientes, metal, cuero y luz de lámpara no caben bien en 16 |
| **Lectura** | Top-down Bomberman-like sigue claro con siluetas más densas |
| **Sprites** | Personajes suelen ocupar ~1 tile de ancho y ~1–1.5 de alto (p. ej. ~32×40–48) |

16×16 queda descartado para producción de arte y para el target de runtime.

**Cómo proceder con tilesets (PixelLab → Tiled → juego):** [`TILESET_MOV1.md`](./TILESET_MOV1.md).

---

## Lenguaje visual global

### Perspectiva

- Cámara **alta top-down** (overhead / slight 3/4 from above).
- Proporciones compactas de personaje jugable (head/body legible desde arriba).
- Sombra suave en el suelo **permitida** y deseable.

### Color y luz

- Paleta cálida de oficio: bronce, cobre, ámbar de lámpara, piedra gris-azul, cuero.
- Luz principal: **linternas / cabeza del casco / bombas** — el brillo cuenta historia.
- Gradientes: cascos metálicos, barba, cuero, metal pulido — varios pasos de tono.
- Evitar: contorno negro tipo sticker; flat cel-shading de 2 tonos; look “NES toy”.

### Materiales (vocabulario)

| Material | Cómo debe leerse |
|----------|------------------|
| **Bronce / cobre** | Cascos, herrajes, acentos — brillo metálico suave |
| **Cuero** | Armadura de trabajo — volumen, costuras visibles a tamaño medio |
| **Metal protector** | Hombreras, placas, hebillas — más claros/fríos que el cuero |
| **Piedra / madera** | Entorno mina — sólido, nórdico, no ruinoso en Mov. I |
| **Pelo / barba** | Volumen con gradiente; barba del jugador en tono **bronce / cobre** |

### Qué no es Uncover (arte)

- Retrato SNES literal / CRT shader obligatorio.
- Horror gótico vaciado.
- Photorealismo.
- Outline negro uniforme en todos los sprites.

---

## Por tipo de asset

Antes de generar un sprite, definir **deseos** explícitos (checklist):

1. Función en juego (jugador, golem, bomba, mineral…).
2. Lectura a ~32–48 px de alto (sobre tile 32×32).
3. 3–5 materiales / rasgos innegociables.
4. Luz propia (sí/no).
5. Atmósfera (nórdica mina / eco / llama — según movimiento).

---

## Jugador — Movimiento I

### Deseos innegociables

| Elemento | Especificación |
|----------|----------------|
| **Casco** | Bronce redondeado + **linterna** frontal (glow ámbar) |
| **Barba** | Abundante, tono **bronce / cobre**, cubre pecho; rasgo enano |
| **Armadura** | **Cuero** de trabajo + **protecciones metálicas** (hombreras / placas / hebillas) |
| **Mochila** | **Grande**, visible desde arriba |
| **Pico** | Visible **sobresaliendo** de la mochila |
| **Pose** | Facing south (hacia cámara), idle listo para mover |
| **Vista** | High top-down |
| **Ambiente** | Nórdico — frío de montaña + calor de forja/lámpara |

### Opcional / no prioritario en idle

- Bomba en manos (puede ser variante o frame de ataque).
- Pico en mano (el pico en mochila basta para identidad).

### Sensación

> Minero-explorador nórdico con permiso recién ganado: oficioso, robusto, no caricatura chibi extrema.

---

## Otros sprites (Movimiento I)

Catálogo completo de deseos, prompts idle y **acciones** de animación:

→ [`VISUAL_PROMPTS_MOV1.md`](./VISUAL_PROMPTS_MOV1.md)

| Asset | Deseos clave |
|-------|--------------|
| **Bomba** | Esfera bronce/cobre, glow ámbar |
| **Explosión** | Burst ámbar–cobre legible |
| **Mineral** | Veta teal sobre piedra |
| **Pico (ítem)** | Mango + cabeza metálica |
| **Golem descompuesto** | Piedra agrietada, seams ámbar |
| **Golem avanzado** | Más placas / presencia N7 |
| **Espíritu** | Translúcido teal-plata |
| **Bloque puzzle** | Off/on con glow bronce |
| **Trampa** | Placa inestable |
| **Portal** | Arco sellado (inactivo) |
| **Enano Taller** | NPC oficio |
| **Primer Excavador** | Guardián umbral |

---

## PixelLab — guía de uso

1. Partir del bloque **Global style** + el bloque del asset.
2. Preferir canvas generoso y luego recortar / ajustar a tamaño juego.
3. Iterar: “more bronze beard volume”, “larger backpack”, “metal shoulder plates”, “pickaxe tip clear over pack”.
4. Exportar con transparencia; no depender del checkerboard del preview.

### Global style (pegar siempre)

```
high top-down overhead camera, rich multi-stop pixel gradients, soft ground shadow, selective colored outlines only (no thick black silhouette stroke), Super Bomberman camera language but modern PC pixel density for a 32x32 tile world, warm forge-lamp lighting, Nordic mountain mine fantasy, blank or simple studio background, single character roughly 32px wide by 40-48px tall, no UI no text no watermark no photorealism
```

### Jugador — prompt PixelLab (completo)

```
stout Nordic dwarf miner explorer, abundant thick bronze-copper colored beard covering the chest, rounded polished bronze helmet with glowing amber headlamp on the forehead, leather work armor with metallic shoulder plates and small metal buckles, large travel backpack on the back with a dwarven pickaxe clearly protruding upward from the pack, facing south, high top-down perspective, rich gradients on metal leather and beard, soft oval ground shadow, selective outlines, blank background, readable game sprite on a 32px tile grid (character roughly 32 wide by 40–48 tall)
```

### Jugador — prompt corto

```
top-down Nordic dwarf miner, bronze helmet with lamp, abundant bronze beard, leather armor with metal plates, large backpack with pickaxe sticking out, facing south, rich pixel gradients, soft ground shadow, selective outlines, designed for 32×32 world tiles (~32×48 character), blank background
```

### Negativos sugeridos (si PixelLab los admite)

```
black outline, NES 8-bit flat colors, chibi extreme, front view eye-level, empty backpack, no beard, photorealistic, horror, gothic ruined aesthetic
```

---

## Relación con gameplay

- Rejilla canónica: **32×32** (`TILE_SIZE` target). Ver [`DESIGN.md`](./DESIGN.md).
- Hitbox lógica proporcionales al tile (margen interior); el sprite puede ser más alto que un tile **sin** cambiar reglas de casilla.
- Priorizar silueta y glow (lámpara / bomba) sobre microdetalle que se pierda al escalar.
- El Taller y NPCs comparten la misma riqueza de material (bronce, cuero, madera, piedra).

---

## Estado

| Asset | Dirección fijada | Prompt PixelLab |
|-------|------------------|-----------------|
| Jugador | Sí | Sí (arriba) + acciones en [`VISUAL_PROMPTS_MOV1.md`](./VISUAL_PROMPTS_MOV1.md) |
| Resto Mov. I | Sí | [`VISUAL_PROMPTS_MOV1.md`](./VISUAL_PROMPTS_MOV1.md) |

Cuando un asset se apruebe visualmente, anotar aquí la versión “canon” y la ruta en `assets/` (no en `creation/`, que está fuera de git).

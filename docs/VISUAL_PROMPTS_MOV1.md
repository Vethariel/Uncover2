# Uncover — PixelLab prompts (Movimiento I)

> Arte canónico: [`VISUAL_STYLE.md`](./VISUAL_STYLE.md). Curriculum: [`MOVEMENT_I.md`](./MOVEMENT_I.md).  
> Estilo global: top-down, tile **32×32**, gradientes ricos (PC), nórdico de mina, outlines selectivos (sin stroke negro grueso).

## Cómo usar

1. Pegar **Global style** + el prompt del asset (idle / still).
2. Para animación con imagen idle como referencia: usar solo el bloque **Acción** (mismo formato que jugador).
3. Negativos globales al final de este doc.

### Global style

```
high top-down overhead camera, rich multi-stop pixel gradients, soft ground shadow, selective colored outlines only (no thick black silhouette stroke), Super Bomberman camera language but modern PC pixel density for a 32x32 tile world, warm forge-lamp lighting, Nordic mountain mine fantasy, blank or simple studio background, no UI no text no watermark no photorealism
```

---

## Inventario Mov. I

| Asset | Niveles | Prioridad |
|-------|---------|-----------|
| [Jugador](#jugador) | 1–7 | Hecho (ver también VISUAL_STYLE) |
| [Bomba](#bomba) | 1+ | Alta |
| [Explosión](#explosión) | 1+ | Alta |
| [Mineral](#mineral) | 2+ | Alta |
| [Pico (ítem / icono)](#pico-ítem--icono) | 2+ / Taller | Media |
| [Golem descompuesto](#golem-descompuesto) | 3–7 | Alta |
| [Golem avanzado](#golem-avanzado) | 7 | Alta |
| [Espíritu de mina](#espíritu-de-mina) | 4+ | Alta |
| [Bloque de puzzle](#bloque-de-puzzle) | 5–6 | Media |
| [Trampa](#trampa) | 7 | Media |
| [Portal (inactivo)](#portal-inactivo) | 7 | Media |
| [Enano del Taller](#enano-del-taller) | Hub | Media |
| [Primer Excavador](#primer-excavador) | 7 / Taller | Alta |

---

## Jugador

Ver deseos en [`VISUAL_STYLE.md` — Jugador](./VISUAL_STYLE.md#jugador--movimiento-i).

### Idle (referencia)

```
stout Nordic dwarf miner explorer, abundant thick bronze-copper colored beard covering the chest, rounded polished bronze helmet with glowing amber headlamp on the forehead, leather work armor with metallic shoulder plates and small metal buckles, large travel backpack on the back with a dwarven pickaxe clearly protruding upward from the pack, facing south, high top-down perspective, rich gradients on metal leather and beard, soft oval ground shadow, selective outlines, blank background, readable game sprite on a 32px tile grid (character roughly 32 wide by 40–48 tall)
```

### Acciones (solo texto de animación; idle = referencia)

| Clip | Acción |
|------|--------|
| **Idle breath** | `Nearly motionless idle. Tiny slow breath in the chest only; almost no shoulder movement; beard stays still.` |
| **Walk** | `walking` |
| **Hurt** | `Brief hurt reaction: a small backward flinch, head dips slightly, then he settles back into place.` |
| **Death / escape** | `The dwarf takes a bronze rune from his belt and throws it onto the ground at his feet.` |
| **Place bomb** | `Both hands hold a small metallic metal ball, lower it, and place it on the ground in front of his feet, then withdraw back to his sides as he returns to a ready stance.` |
| **Mine** | `Both hands rise together above the head, then swing down together toward the ground in a short mining strike, repeating as a cycle.` |

---

## Bomba

### Deseos

| Elemento | Spec |
|----------|------|
| Forma | Esfera compacta (~½ tile) |
| Material | Metal bronce / cobre |
| Luz | Glow ámbar suave (magia del viajero) |
| Detalle | Bandas o runa simple; legible a 32 px |
| Vista | Top-down / ligeramente 3/4 desde arriba |

### Idle / still

```
small spherical bronze-copper bomb for a top-down Bomberman-like mine game, polished metal with rich gradients, thin copper bands, soft amber magical glow, tiny ground shadow, selective outlines, 32x32 tile friendly, blank background, no fuse sparks yet, no text
```

### Acciones

| Clip | Acción |
|------|--------|
| **Idle pulse** | `The metallic ball rests on the ground; its amber glow gently pulses brighter and dimmer.` |
| **Armed / fuse** | `The amber glow on the metallic ball intensifies and flickers faster, about to detonate.` |

---

## Explosión

### Deseos

| Elemento | Spec |
|----------|------|
| Lectura | Cruz Bomberman (centro + brazos) o burst radial claro |
| Color | Ámbar → cobre → blanco caliente; humo slate mínimo |
| Duración visual | Corta, punches legible |

### Still / key frame (centro)

```
top-down bomb explosion center burst for a 32x32 tile game, bright amber-white core, copper-orange blast petals, rich gradients, soft smoke edges in slate gray, no character, blank background, readable at game scale
```

### Acción

```
A compact amber-copper explosion blooms outward from the center and fades quickly.
```

*(Rayos N/E/S/W: generar 1 brazo y rotar/espejar en engine si hace falta.)*

---

## Mineral

### Deseos

| Elemento | Spec |
|----------|------|
| Forma | Cluster / cristal en piedra (~1 tile) |
| Valor visual | Brillo distinto del piso vacío |
| Color | Teal / cian de veta + piedra gris nórdica |
| Regla narrativa | La bomba puede destruirlo; el pico lo conserva |

### Idle / still

```
top-down Nordic mine ore cluster on rough gray stone, teal-cyan crystal veins with rich gradients and soft glow highlights, small ground contact shadow, selective outlines, fits one 32x32 tile, blank background, valuable mineral look, not a gem UI icon only
```

### Acción

| Clip | Acción |
|------|--------|
| **Sparkle** | `The teal crystal veins quietly sparkle; the stone base stays still.` |
| **Break (blast)** | `The ore cluster cracks and collapses into dull rubble, losing its teal glow.` |
| **Extract (pick)** | `The teal crystals lift free from the stone as if carefully extracted, leaving empty rock.` |

---

## Pico (ítem / icono)

### Deseos

Mango madera + cabeza bronce/hierro; legible en Taller / HUD.

### Still

```
top-down or slight 3/4 dwarven pickaxe item icon, wooden handle with warm grain gradients, bronze-iron pick head with metallic sheen, selective outlines, blank background, readable at small HUD size, Nordic craft tool
```

---

## Golem descompuesto

### Deseos

| Elemento | Spec |
|----------|------|
| Naturaleza | Habitante roto, no demonio |
| Cuerpo | Piedra nórdica agrietada |
| Luz | Costuras / seams ámbar débiles |
| Tamaño | ~32×40–48 |
| Pose | Facing south, lento |

### Idle

```
top-down decomposed stone golem of a Nordic dwarf mine, cracked gray rock body, short stocky limbs, faint amber glow in the cracks, soft ground shadow, rich stone gradients, selective outlines, not evil-looking, broken worker automaton, blank background, 32px tile game sprite
```

### Acciones

| Clip | Acción |
|------|--------|
| **Idle** | `Nearly still. Tiny shifts of amber light in the cracks; almost no body movement.` |
| **Walk** | `walking` |
| **Hurt** | `Brief flinch; cracks flash amber once, then he settles.` |
| **Death** | `The stone body loses amber light and collapses into a low rubble pile.` |

---

## Golem avanzado

### Deseos

Misma familia que el descompuesto; más placas, seams más brillantes, presencia de guardián de cámara (N7).

### Idle

```
top-down advanced mine golem, denser Nordic stone armor plates, deeper amber seams, slightly taller silhouette than the basic golem, soft ground shadow, rich gradients, selective outlines, guardian of the ancient chamber, not demonic, blank background, 32px tile game sprite
```

### Acciones

Igual patrón que golem básico (`walking`, flinch, collapse). Ajustar: `cracks flash brighter amber`.

---

## Espíritu de mina

### Deseos

| Elemento | Spec |
|----------|------|
| Cuerpo | Semi-translúcido |
| Luz | Fría (teal / plata); contraste con ámbar del jugador |
| Actitud | Habitante, no horror |

### Idle

```
top-down translucent mine spirit, cool teal-silver glow, soft wispy body, faintly humanoid dwarf-mine silhouette, soft ground glow instead of hard shadow, rich gentle gradients, selective outlines, serene not scary, blank background, 32px tile game sprite
```

### Acciones

| Clip | Acción |
|------|--------|
| **Idle drift** | `The spirit floats in place, soft teal light breathing slowly brighter and dimmer.` |
| **Move** | `drifting forward slowly` |
| **Hurt** | `The teal glow flickers and the form shrinks briefly, then reforms.` |
| **Death** | `The teal light fades and the spirit dissolves into sparse motes.` |

---

## Bloque de puzzle

### Deseos

Baldosa / cristal activable; estados off → on claros (color / glow).

### Still (off)

```
top-down Nordic mine pressure or rune floor block, carved gray stone tile with a dull bronze inset, rich stone gradients, fits one 32x32 tile, blank background, inactive state
```

### Still (on)

```
same Nordic mine floor block, bronze inset now lit with warm amber glow, active state, rich gradients, one 32x32 tile, blank background
```

### Acción

```
The bronze inset on the stone floor block lights up with amber glow as it activates.
```

---

## Trampa

### Deseos

Peligro de cámara (N7): púas, gas o placa inestable — lectura clara sin gore.

### Still (placa inestable)

```
top-down unstable Nordic mine floor plate, cracked gray stone, faint warning amber dust in the seams, soft shadow, rich gradients, one 32x32 tile, blank background
```

### Acción

```
The cracked floor plate shudders and dust puffs up from the seams.
```

---

## Portal (inactivo)

### Deseos

Tres portales al cierre del Excavador: **presentes, aún no usables**. Piedra/bronce cerrado; sin iconografía doctrinal (Piedra/Eco/Llama) explícita todavía.

### Still

```
top-down sealed Nordic stone portal gate, tall bronze-bound stone arch, muted inactive look, no open path through, soft ground shadow, rich stone and bronze gradients, blank background, 32px tile fantasy mine door
```

### Acción (idle)

```
The sealed portal stands still; a very faint bronze edge gleam breathes softly, still inactive.
```

---

## Enano del Taller

### Deseos

NPC hub: oficioso, sin mochila de viajero; delantal / herramientas de mesa.

### Idle

```
top-down Nordic workshop dwarf NPC, short stout body, gray or auburn trimmed beard, leather apron, bronze goggles on forehead, soft ground shadow, rich gradients, selective outlines, friendly craftsman, blank background, 32px tile sprite
```

### Acción

```
Nearly motionless idle. Tiny slow breath; hands rest on his apron.
```

---

## Primer Excavador

### Deseos

| Elemento | Spec |
|----------|------|
| Rol | Guardián / umbral, no jefe a matar |
| Lectura | Antiguo, autoridad de oficio |
| Look | Enano mayor; casco arcaico; herramientas de excavación |
| Tamaño | Ligeramente mayor que el jugador |

### Idle

```
top-down ancient Nordic First Excavator guardian dwarf, elder stout build, long iron-gray beard with bronze beads, archaic bronze helm without modern lamp or with a dimmer older lamp, heavy leather and metal excavation harness, soft ground shadow, rich gradients, selective outlines, solemn threshold guardian, not villainous, blank background, slightly larger than a normal player sprite
```

### Acciones

| Clip | Acción |
|------|--------|
| **Idle** | `Almost still. Slow breath; ancient authority, calm watchfulness.` |
| **Walk / patrol** | `walking` |
| **Comment pose** | `He half-raises one hand in a speaking gesture, then settles.` |
| **Recognize** | `He nods once and steps aside, acknowledging the traveler.` |

---

## Negativos globales

```
black outline stroke, NES flat 8-bit, photorealistic, horror demonic, gothic ruin exclusive look, UI text logos, wrong camera (eye-level portrait), empty silhouette, sticker outline
```

---

## Estado de producción

| Asset | Prompt idle | Acciones | Canon en `assets/` |
|-------|-------------|----------|--------------------|
| Jugador | Sí | Sí | Pendiente |
| Bomba | Sí | Sí | Pendiente |
| Explosión | Sí | Sí | Pendiente |
| Mineral | Sí | Sí | Pendiente |
| Pico ítem | Sí | — | Pendiente |
| Golem | Sí | Sí | Pendiente |
| Golem avanzado | Sí | Sí | Pendiente |
| Espíritu | Sí | Sí | Pendiente |
| Puzzle block | Sí | Sí | Pendiente |
| Trampa | Sí | Sí | Pendiente |
| Portal | Sí | Sí | Pendiente |
| Enano Taller | Sí | Sí | Pendiente |
| Primer Excavador | Sí | Sí | Pendiente |

# Uncover — Dirección sonora

> Contrato de audio. Narrativa: [`NARRATIVE.md`](./NARRATIVE.md). Cultura: [`CULTURAL_FOUNDATION.md`](./CULTURAL_FOUNDATION.md). Visual: [`VISUAL_STYLE.md`](./VISUAL_STYLE.md). Gameplay: [`DESIGN.md`](./DESIGN.md). Mov. I: [`MOVEMENT_I.md`](./MOVEMENT_I.md#música-del-movimiento-i).

## Principio

Uncover **no** suena a trailer hollywoodiense, chiptune nostálgico ni horror industrial.

La jugabilidad es *tipo Bomberman* (rejilla, bombas, ritmo de acción).

La **piel sonora** es fantasía de oficio: piedra trabajada, metal, calor de lámpara, aire de túnel.

| Capa | Decisión |
|------|----------|
| **Gameplay SFX** | Claros, cortos, legibles a 32×32; las bombas y el pico llevan el golpe |
| **Música ambiental** | Lugar + emoción; textura antes que bombos; motivos que mutan por movimiento |
| **Atmósfera Mov. I** | Oficio cálido que se profundiza — permiso, trabajo, umbral |
| **Mezcla** | Música deja hueco a SFX; no competir en 2–4 kHz con explosiones |

> *Si quitas la imagen, debe seguirse oyendo una mina nórdica activa. Si bajan los stems, debe seguir leyéndose el motivo del viaje.*

---

## Qué es / qué no es

### Es

- Fantasía de **oficio** (forja, metal, piedra, linterna).
- Tensión **contenida**: peligro sin panic attack permanente.
- Motivos **transformables** entre movimientos (permanencia → eco → llama → íntimo → híbrido).
- Espacio acústico creíble: cavernas, talleres, umbrales.

### No es

- Orquesta épica de “héroe elegido” / trailer.
- Chiptune forzado / CRT nostalgia musical.
- Horror industrial / dark ambient vacío.
- Loop arcade a 140+ BPM constante.
- Leitmotiv pop pegajoso que no admite mutación.

---

## Vocabulario técnico (contrato)

Definiciones canónicas para briefs, stems y prompts de generación.

### Tempo y métrica

| Término | Uso en Uncover |
|---------|----------------|
| **BPM** | Pulsos por minuto del *pulse* percibido (puede ser half-time en pads). |
| **Meter** | Preferir **4/4**. 3/4 o 6/8 solo para ritual / umbral (N6–N7, jefes). |
| **Pulse** | Pulso audible (percusión baja, ostinato). No necesariamente kick de club. |
| **Half-time feel** | Percusión a mitad del BPM marcado: cuerpo lento, detalle arriba. |
| **Rubato / free time** | Solo menús, tallers íntimos o stingers; no gameplay de combate. |

**Rangos guía (saga):**

| Contexto | BPM típico | Feel |
|----------|------------|------|
| Menú / splash | 60–72 | Libre o very soft pulse |
| Hub / Taller | 70–84 | Half-time, cálido (forja) |
| Exploración Mov. I | N1–N2 ~95–98; N3–N6 baja; **N7 ~108 urgencia** | Tutorial vivo → descenso → carrera |
| Victoria corta | 100–120 | Breve, no loop de combate |

### Tonalidad y armonía

| Término | Uso |
|---------|-----|
| **Tónica / centro** | Nota o acorde que “es el lugar”. Mov. I: centros **cálidos** (D, A, G, E menor modal). |
| **Modo** | Preferir **Dórico**, **Eolio** (menor natural), **Mixolidio** para oficio. Evitar mayor brillante Disney; evitar locrio horror. |
| **Pedal** | Bajo sostenido (piedra / montaña). Base de drones. |
| **Ostinato** | Célula rítmico-melódica corta que se repite (pico, marcha, forja). |
| **Motivo** | Frase de 2–8 notas identificable; debe poder **mutar** (intervalo, ritmo, instrumentación). |
| **Leitmotiv** | Motivo atado a entidad (viajero, Excavador, doctrina). Máximo pocos por movimiento. |
| **Modulación** | Cambio de centro; en Mov. I es **suave** (relativo / paralelo). Saltos bruscos = umbral o doctrina (Mov. II+). |
| **Consonancia / disonancia** | Oficio = consonante con tensión por **textura**, no por clusters. Clusters = peligro breve o espíritu. |

**Paleta armónica Mov. I (canónica):**

- Exploración: **menor dórico** o eolio con 6ª/7ª naturales.
- Taller: mismo centro, más **Mixolidio** / color mayor suave (calor de fragua).
- Umbral (N7): añadir **intervalos abiertos** (4ª/5ª) y pedal más grave; no cambiar a otro idioma musical todavía.

### Textura y forma

| Término | Uso |
|---------|-----|
| **Tessitura** | Rango de alturas. Mina: peso en **graves–medios**; agudos = lámpara, cristal, espíritu. |
| **Registro** | Grave = montaña; medio = oficio/melodía; agudo = magia/luz. |
| **Densidad** | Capas simultáneas. Mov. I: N1 **vivo pero limpio**; complejidad **sube** hacia N7. |
| **Dinámica** | pp–mf en exploración; f breve en stingers / jefe. Evitar ff sostenido. |
| **Forma de loop** | Preferir **A–A'–B–A** o **drone + frase** (8–32 compases). Evitar build EDM de 2 min. |
| **Stem** | Capa exportable (drone, pulse, melody, tension, ritual). Activable por nivel / estado. |
| **Stinger** | Hit corto no loopeable (daño, victoria, escape, puzzle OK). |
| **Duck / sidechain** | Bajar música ~2–4 dB en explosión / diálogo; no bombear a ritmo de club. |

### Timbre (familias)

| Familia | Lectura en Uncover |
|---------|-------------------|
| **Percusión profunda** | Toms bajos, frame drum, hits amortiguados — paso / montaña |
| **Metal / forja** | Anvils suaves, bowls, chimes metálicos filtrados — oficio |
| **Piedra / madera** | Hits secos, woodblock soft, scraped stone — túnel |
| **Cuerdas graves / pads** | Sostenidos, poco vibrato — aire de galería |
| **Melodía simple** | Flauta baja, cello, bowed metal, lead limpio — motivo del viajero/linterna |
| **Drone** | Sub + noise filtrado + pedal — masa de la mina |
| **Resonancia / reverb** | Pre-delay corto en taller; más cola en profundidad / N4+ |

**Evitar como identidad:** supersaw EDM, orquesta tutti, vocales líricas, glitch digital puro (salvo Eco en Mov. II si se decide).

### Mezcla y entrega

| Spec | Target |
|------|--------|
| **Loop** | Seamless; punto de corte en compás fuerte |
| **Duración útil** | 60–120 s por capa base (más stems cortos) |
| **Loudness música** | ~−14 a −16 LUFS integrado en exploración; hub un poco más bajo |
| **Headroom** | −1 dBTP; dejar espacio a SFX |
| **Formato runtime** | Preferir stems o variantes por nivel (`mov1_n*`, `workshop`, overlays UI) |

---

## Motivo raíz del viaje

Un motivo corto (ideal **5–7 notas**) representa *el permiso de caminar la montaña*.

Propiedades obligatorias:

1. Caber en **oficio** (Mov. I) sin sonar a doctrina.
2. Poder volverse **estructura** (Piedra), **pregunta/respuesta** (Eco), **transformación** (Llama).
3. Poder volverse **íntimo** (Mov. III, vía viajero).
4. Poder **combinarse** (Mov. IV–V) sin perder la célula.

Hasta que exista un audio canónico, documentar el motivo aquí con:

- alturas (ej. `E–G–A–B–A–G–E`);
- ritmo (negras / síncopa suave);
- instrumentación preferida por movimiento.

---

## Arco por movimiento (saga)

| Mov. | Función emocional | Idioma musical (resumen) |
|------|-------------------|---------------------------|
| **I — Minas** | Introducir el mundo: chispa de aventura → profundidad | Pulse vivo al inicio; BPM baja y capas crecen hacia el umbral |
| **II — Reino** | Identidad doctrinal | Piedra = ostinato permanente; Eco = silencio + respuesta; Llama = mutación rítmica |
| **III — Ruinas** | Voz del viajero | Más íntimo, menos monumental; frases incompletas o capas que se construyen |
| **IV — Corazón** | Híbrido reino × viajero | Superposición controlada de idiomas II + III |
| **V — Forja** | Temas anteriores transformados | Reorquestación del motivo raíz bajo identidad del Corazón |

Detalle Mov. II+: mantener las secciones de música ya escritas en cada `MOVEMENT_*.md`; este documento fija el **marco técnico** común.

---

## Capas de producción (pipeline)

1. **Brief emocional** (1 frase) + specs técnicos (BPM, modo, densidad, stems).
2. **Motivo** (MIDI o notación) aprobado.
3. **Loop base** + stems (drone / pulse / melody / tension).
4. **Variantes por nivel** = mute/unmute o filter de stems — no temas ajenos.
5. **Stingers** (daño, escape, victoria, puzzle) alineados al mismo timbre.
6. **Integración** (`bgMusic`, ducking, crossfade ≤1–2 s entre hub y nivel).

---

## Relación con SFX

| SFX | Rol | Relación con música |
|-----|-----|---------------------|
| Walk | Ritmo del jugador | No cuantizar la música al paso |
| Bomb place / explosion | Impacto | Duck breve de pads/melody |
| Mine (pico) | Ostinato diegético | Puede *sugerir* el pulse; no reemplazarlo |
| Player hurt / escape | Narrativo | Stinger; música no cambia de tema a mitad |
| Puzzle / chest | Feedback | Stinger consonante (bronce/ámbar) |

---

## Movimiento I

Dirección detallada y Taller: [`MOVEMENT_I.md` — Música](./MOVEMENT_I.md#música-del-movimiento-i).  
Prompts Lyria (autocontenidos): `creation/prompts/music/mov1_n*.txt`.

### Principio del arco N1→N7

Mov. I **no** empieza contemplativo.

| Polo | Emoción | Música |
|------|---------|--------|
| **N1–N2 (tutorial)** | Chispas de **nueva aventura** | BPM alto, pulse adelante, motivo brillante; N2 ≈ N1 + metal de oficio ligero |
| **N3–N6 (descenso)** | La historia **pesa** | Tempo baja, capas/reverb/tensión suben |
| **N7 (umbral)** | **Urgencia** — carrera a contrarreloj, stakes altos | Pulse insistente, tensión alta, countdown feel — no contemplativo |

**Eje técnico canónico (BPM):**

| Nivel | BPM | Densidad | Sensación |
|-------|-----|----------|-----------|
| N1 | **98** | Baja–media, clara | Aventura animada; permiso con chispa |
| N2 | **95** | Media clara | Aún tutorial; cercano a N1 + pico/metal ligero |
| N3 | **86** | Media+ | Habitada; tension suave |
| N4 | **80** | Media–alta | Oscuridad; aire; **coro etéreo puntual** = espíritus |
| N5 | **76** | Alta geométrica | Puzzle / ritual ligero |
| N6 | **72** | Alta | Cámara antigua; germen del Excavador |
| N7 | **108** | Alta, urgencia | Carrera contra el tiempo; stakes altos |

**Glosario para prompts Lyria:** cada prompt debe traducir entidades del juego a **términos musicales** (p. ej. espíritu ≠ “teal”; = pads vítreos / coro wordless etéreo). Ver prompts en `creation/prompts/music/`.

Cada generación Lyria usa un **prompt autocontenido** (sin “igual que N1”): el modelo no tiene contexto entre clips.

### Qué evitar en el arco

- N1–N2 ambient contemplativo / meditación.
- N7 lento y solemne cuando el nivel es **carrera** (urgencia primero).
- Percusión tribal/world como identidad (frame drum ritual, djembe, shakers étnicos).
- Confiar en color/lore visual (“espíritu teal”) sin traducirlo a timbre.
- Saltar a idiomas de Piedra / Eco / Llama.

---

## Estado
| Asset / capa | Dirección fijada | Audio canónico en `assets/` |
|--------------|------------------|-----------------------------|
| Contrato global | Sí (este doc) | — |
| Motivo raíz | Pendiente (definir alturas) | — |
| Mov. I N1–N7 | Sí | `assets/sounds/music_mov1_n1.mp3` … `music_mov1_n7.mp3` |
| Taller | Sí | `assets/sounds/music_workshop.mp3` (Lyria Pro) |
| Menú | Sí | `assets/sounds/music_menu.mp3` |
| Level complete | Sí | `assets/sounds/music_victory.mp3` |
| Game over / escape | Sí | `assets/sounds/music_gameover.mp3` |

### Emoción de overlays (UI)

| Cue | Emoción | BPM / forma | Prompt |
|-----|---------|-------------|--------|
| Menu | Invitación / umbral de puerta | 66; loop; motivo incompleto | `creation/prompts/music/ui_menu.txt` |
| Level complete | Alivio + botín | 88; loop corto; resolución cálida | `creation/prompts/music/ui_level_complete.txt` |
| Game over / escape | Vacío / pérdida sobria | 64; disolución menor; sin calor mayor | `creation/prompts/music/ui_game_over.txt` |

Cada prompt UI incluye **glosario musical** (entidad de juego → timbre).
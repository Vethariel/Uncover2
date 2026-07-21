# Uncover — Movement I — Las Minas

> Especificación del Movimiento I. Arquitectura general en [`NARRATIVE.md`](./NARRATIVE.md). Fundamentos culturales en [`CULTURAL_FOUNDATION.md`](./CULTURAL_FOUNDATION.md). Diálogos y voz del viajero: [`DIALOGUES.md`](./DIALOGUES.md). Reglas de gameplay en [`DESIGN.md`](./DESIGN.md). Dirección sonora en [`AUDIO.md`](./AUDIO.md).

## Índice

| Sección | Contenido |
| ------- | --------- |
| [Función narrativa](#función-narrativa) | Propósito de Las Minas |
| [Estructura del movimiento](#estructura-del-movimiento) | Niveles, ejes, taller |
| [Curriculum de niveles](#curriculum-de-niveles) | Mecánicas por nivel (1–7) |
| [Herramientas del viajero](#herramientas-del-viajero) | Bombas mágicas vs pico |
| [El Taller](#el-taller) | Hub post-nivel, NPCs |
| [El Primer Excavador](#el-primer-excavador) | Umbral, fallos, portales |
| [Diálogos](./DIALOGUES.md) | Voz, inicios, descubrimientos, Excavador |
| [Música](#música-del-movimiento-i) | Dirección sonora |
| [Dirección visual](#dirección-visual) | Bioma y paleta |
| [Cierre del movimiento](#cierre-del-movimiento) | Estado de los portales |
| [Relación con el resto del viaje](#relación-con-el-resto-del-viaje) | Lectura retrospectiva |

---

## Función narrativa

Las Minas son la puerta de entrada al mundo de Uncover.

Es el primer contacto del viajero con un reino que existe antes de él.

Aquí no se presenta una interpretación del mundo.

Aquí se presenta el mundo.

El jugador debe sentir:

- curiosidad;
- peligro;
- descubrimiento;
- posibilidad.

Al final del movimiento debe sentirse: **un Bomberman en minas** — fantasía minera activa, no un tutorial abstracto ni un spoiler de las rutas doctrinales.

## Propósito del movimiento

El Movimiento I tiene cuatro objetivos:

### 1. Enseñar las reglas del mundo

El jugador aprende:

- movimiento;
- bombas *(magia del viajero)*;
- pico y minerales;
- criaturas;
- fabricación en el **Taller**;
- exploración y puzzles básicos.

La mecánica debe sentirse integrada al universo.

### 2. Introducir la fantasía del isekai

El protagonista no entiende completamente dónde está.

Pero tampoco se comporta como alguien perdido.

Es un explorador que **acaba de recibir permiso** para adentrarse en la mina.

La llegada al mundo nuevo no es una tragedia.

Es una llamada a la aventura.

### 3. Presentar la cultura del reino

Sin explicar su historia profunda ni las doctrinas.

El jugador debe observar:

- arquitectura enana;
- herramientas antiguas;
- restos de minería;
- señales de una civilización activa;
- el **Taller** como lugar social.

La pregunta no es:

> ¿Qué ocurrió aquí?

Todavía.

La pregunta es:

> ¿Qué clase de lugar es este?

### 4. Crear confianza antes de introducir ambigüedad

El jugador debe creer inicialmente que está jugando:

> Un Bomberman de fantasía sobre un minero explorando una mina.

Y eso debe ser cierto.

La segunda lectura aparece después.

---

## Estructura del movimiento

| Aspecto | Detalle |
| ------- | ------- |
| **Territorio** | Las Minas Fundacionales |
| **Niveles** | 7 (1–6 recorrido; 7 umbral) |
| **Entre niveles** | Acceso al **Taller** *(desde el N2 en adelante)* |
| **Parametrización** | **Universal** — mismo recorrido para todos |
| **Primer Eje** | Tres portales **presentes** al cierre; **aún no activos** *(elección pendiente de uso)* |
| **Segundo Eje** | No aplica |
| **Siguiente destino** | El Reino (Mov. II) cuando los portales entren en uso |

La progresión espacial procedural por nivel (cantidad y tamaño de cámaras, materiales, túneles y puertas de mina) está definida en [`PROCEDURAL_LEVELS.md`](./PROCEDURAL_LEVELS.md#progresión-espacial--movimiento-i).

---

## Curriculum de niveles

| Nivel | Nombre | Mecánica que introduce | Sensación |
| ----- | ------ | ---------------------- | --------- |
| 1 | La Entrada | Movimiento + bombas mágicas para atravesar | Permiso; primera aventura |
| 2 | Las Herramientas | Pico + minerales *(tensión: bomba destroza valor)* | Mina que se modifica |
| 3 | La Profundidad | Golems descompuestos | La mina está habitada |
| 4 | Los Habitantes | Luz parcial + espíritus + golems | La montaña no está vacía |
| 5 | La Recolección | Puzzle básico (activar bloques) + enemigos | Recursos con inteligencia |
| 6 | La Cámara Antigua | Golem avanzado + puzzle-lore del Excavador | Preámbulo del umbral |
| 7 | El Primer Excavador | Carrera de recursos / pasadizos / trampas | Umbral; reconocimiento |

Los niveles **1 y 2** están completamente iluminados: cada casilla vacía emite luz de intensidad `10`. Se mantienen el radio de visión y las sombras producidas por muros y destructibles. La iluminación parcial comienza en el Nivel 3 y se presenta como mecánica explícita en el Nivel 4.

Tras **fallar** el Nivel 7: el jugador **repite el Nivel 6** y vuelve a intentar el umbral. Ver [Fallo y reintento](#fallo-y-reintento).

---

### Nivel 1 — La Entrada

**Tema:** El permiso de explorar.

El protagonista recién cuenta con autorización para adentrarse en la mina.

No se explica del todo cómo llegó al reino.

**Mecánica principal:**

- movimiento;
- **bombas mágicas** — generar bombas “de la nada”, como en Bomberman, justificado en el tono fantástico del viajero;
- atravesar el nivel con explosiones.

**Aún no:**

- pico;
- minerales con valor de fabricación;
- enemigos agresivos;
- Taller *(o solo presentación visual sin craft)*.

**Sensación:** empezar una aventura.

---

### Nivel 2 — Las Herramientas

**Tema:** Adaptarse — y elegir cómo abrir camino.

Aparecen el **pico** y los **minerales**.

| Herramienta | Ritmo | Efecto sobre minerales |
| ----------- | ----- | ---------------------- |
| **Bomba** | Rápida; cubre más terreno | Puede **destruir** minerales valiosos al abrir |
| **Pico** (`Q` mantenida) | Demorado al inicio | Extrae sin desperdicio; progreso vive en el bloque |
| **Fragmentos** (`E` mantenida, N3+) | En muro indestructible | Genérico 2.5 s / especializado 3.5 s; progreso en el muro |

**Pico (runtime):** mantener `Q` frente al destructible en la dirección mirando. Soltar no reinicia el progreso del bloque. Mientras se pica, el jugador queda quieto. Cualquier destructible se puede picar; solo las menas entregan material. Bronce/hierro/roca: `2.5 s` (1 unidad si hay mena). Cristal: `3.5 s` / 2 unidades. Esta velocidad base preserva la ventaja inmediata de la bomba; **Temple** (`pickSpeed`) reduce el tiempo un 15% por rango y **Fortuna** da 20% de chance de +1 material. El HUD muestra materiales y fragmentos de la **run** actual; al completar el nivel van al taller. La vida se reinicia a `maxLives` en cada nivel.

El jugador descubre que la mina no solo se recorre: se **trabaja**.

**Tras completar este nivel** (y cada uno siguiente): acceso al **Taller**.

### Taller (hub)

Espacio rectangular con **horno** y **yunque** juntos en la parte superior
(bloques 2×3); ambos se usan con **E**. La puerta de salida está centrada en
la parte inferior y se activa automáticamente al pisar su tile.

| Estación | Función |
|----------|---------|
| **Horno** | Fundir un lote: 3→2 bronce/hierro; 2→1 cristal |
| **Yunque** | Forjar mejoras conocidas; ensamblar R2 (2F genéricos) / R3 (3F especializados) |
| **Puerta** | Al tocarla, sale al nivel pendiente (siguiente tras victoria; el fallido tras game over N3+); no usa **E** |

**Fragmentos de receta (N3+):** embebidos en muros indestructibles; recolección con **E mantenida** (progreso por bloque, lock de movimiento). Detalle en [`CRAFTING.md`](./CRAFTING.md).

**Progresión:** completar N1 → N2 directo. Completar N2+ → hub. Game over en N1–N2 → partida nueva (menú, wipe total). Game over en N3+ → hub con taller/mejoras intactos.

---

### Nivel 3 — La Profundidad

**Tema:** La mina es más grande — y no está sola.

Aparecen **golems descompuestos** — enemigos básicos.

Siguen visibles señales de civilización (túneles hechos por otros, arquitectura).

El Taller sigue disponible entre niveles.

---

### Nivel 4 — Los Habitantes

**Tema:** La montaña no está vacía.

- La **luz no cubre** todo el nivel *(visibilidad por tile / zonas en sombra)*.
- Aparecen **espíritus** junto a los golems.

No son “malvados” por defecto.

Son habitantes con comportamientos propios.

> No todo lo que intenta detenerte te odia.

Sin spoiler de doctrinas: luz y espíritus se leen como clima de la mina, no como Eco/Llama.

---

### Nivel 5 — La Recolección

**Tema:** Recursos con inteligencia.

Se introduce un **puzzle básico** de tabletas en el suelo: pisarlas **en orden**.
Correcto → destello verde; incorrecto → destello rojo y reinicio. Al completar
aparece un **cofre** cerca; abrirlo con **E** entrega un lote rico de recursos.

Convive con enemigos ya conocidos.

El Taller sigue siendo donde se convierte mineral en mejoras.

---

### Nivel 6 — La Cámara Antigua

**Tema:** Preámbulo del Primer Excavador.

Nivel que combina elementos enseñados y **introduce el golem avanzado**:

- bombas;
- pico / minerales;
- golems básicos;
- golems avanzados (persiguen);
- luz parcial;
- espíritus;
- puzzle.

El puzzle y el entorno **cuentan**, sin discurso doctrinal, sobre el **Primer Excavador** como figura laboral de la montaña — quién fue, qué dejó, qué protege.

Los **fragmentos especializados (R3)** de este nivel refuerzan esa lectura en diálogo: [`DIALOGUES.md` — R3 / Excavador](./DIALOGUES.md#pool--fragmentos-especializados-r3-n6-historia-del-excavador).

No se explican Piedra / Eco / Llama.

Si el jugador **falla el Nivel 7**, regresa aquí. El reintento refuerza la lectura del preámbulo.

---

### Nivel 7 — El Primer Excavador

**Tema:** Umbral — carrera de comprensión, no solo daño.

Encuentro con el **Primer Excavador**.

#### Forma del encuentro

- **Carrera de oficio:** recolectar con juicio (pico vs bomba), pasadizos, trampas y amenazas.
- Versión **avanzada** de golems descompuestos.
- **Trampas de dardo:** pisar placa → aviso → dardo desde lanzador a ≥3 tiles;
  el proyectil muere en muro/destructible; se rearma al salir; bomba desactiva la trampa.
- **Ventana de tiempo:** ~6 minutos (`timeLimit: 360`). No es sprint vacío: al acabar el reloj hay **recuento**.
- **Score de oficio:** Bronce×1 + Hierro×2 + Cristal×3 + fragmentos; menas voladas a bomba **restan**. Cuota: `trialQuota` (14 por defecto).
- **Salida anticipada:** solo si ya alcanzaste la cuota.
- **Éxito:** score ≥ cuota (al salir o al acabar el tiempo) → reconocimiento del Excavador.
- **Fallo:** score &lt; cuota al timeout, o muerte → diálogo del Excavador, se pierden recursos de la corrida N7, el Taller queda apuntando a **N6**.

Detalle de pesos: [`src/config/n7Trial.js`](../src/config/n7Trial.js).

#### Tras superarlo

1. Recuento.
2. El Excavador **reconoce** al viajero — **no muere**.
3. Habla a nivel **general** sobre la aventura que viene *(sin spoilers de doctrinas ni ejes)*.
4. Pasa a habitar el **Taller** como NPC de lore / consejo.
5. Quedan visibles los **tres portales** (Piedra / Eco / Llama) — **presentes pero aún no en uso**.

#### Fallo y reintento

Si el viajero **no supera** el umbral:

1. No avanza.
2. Diálogo del Excavador: [`DIALOGUES.md` — Prueba fallida](./DIALOGUES.md#prueba-fallida-umbral-no-superado).
3. Debe **repetir el Nivel 6**.
4. Luego puede volver a intentar el Nivel 7.

Las mejoras fabricadas en el Taller **no se borran** por el fallo.

El mensaje implícito: aún no leíste del todo el preámbulo / aún no trabajaste la mina como exige el umbral.

---

## Herramientas del viajero

### Bombas mágicas

Igual que en Bomberman: el viajero puede **generar bombas** sin un inventario material de “pólvora del suelo”.

Justificación fantasía: capacidad del forastero / magia práctica del permiso de exploración — no se teoriza en pantalla.

Siguen aplicando límites de diseño ya existentes cuando existan (`maxBombs`, alcance, etc.): “de la nada” no significa “sin reglas”, significa **origen mágico**, no crafting de cada bomba.

### Pico

Herramienta lenta al inicio.

Favorece conservar minerales.

Mejorable en el Taller *(velocidad, temple / filo — detalle en [`CRAFTING.md`](./CRAFTING.md))*.

### Tensión central del Mov. I

> ¿Abro camino rápido (bomba) o trabajo la veta (pico)?

Esa pregunta sostiene los niveles 2–7 **sin** necesidad de doctrinas.

---

## El Taller

Espacio **entre niveles** (desde el N2).

No se llama “La Forja”: ese nombre queda reservado al Movimiento V. Ver [Distinción de La Forja](./NARRATIVE.md#distinción-de-la-forja).

| Aspecto | Detalle |
| ------- | ------- |
| **Función** | Fabricar mejoras con minerales recolectados |
| **Tono** | Cómodo, social, minero — no ritual final |
| **Primera visita** | Explicación breve de fabricación |
| **NPCs** | Enanos del taller; más adelante, guardianes reconocidos |

### Habitantes del Taller (Mov. I)

| Quién | Cuándo |
| ----- | ------ |
| **Brun** (enano del taller; horno + yunque) | Desde la primera visita (tras N2) |
| **Primer Excavador** | Tras superar el Nivel 7 |

Diálogos (intro, avance/fallo por nivel, craft, recetas, amistad): [`DIALOGUES.md` — El Taller](./DIALOGUES.md#el-taller--brun).

En movimientos posteriores, otros guardianes pueden pasar a habitar el Taller con lore propio.

### Fabricación

| Aspecto | Detalle |
| ------- | ------- |
| **Materiales** | Minerales y recursos de los niveles |
| **Mejoras** | Bombas (máx/alcance), pico, velocidad, vida — ver [`CRAFTING.md`](./CRAFTING.md) |
| **Regla canónica** | Los niveles no sueltan mejoras directas; se fabrican aquí |
| **Futuro (Mov. V)** | La Última Forja reutilizará la lógica de identidad mecánica en sentido inverso |

Cada mejora fabricada es una decisión que pesará al final del viaje.

---

## El Primer Excavador

### Identidad

Uno de los primeros en abrir caminos dentro de la montaña.

No protege un tesoro.

Protege un límite.

### Filosofía

> ¿Vienes a tomar de la montaña o a conocerla?

La carrera de recursos y la tensión bomba/pico **son** esa pregunta jugable.

### Comentarios

Textos propuestos: [`DIALOGUES.md` — Primer Excavador](./DIALOGUES.md#primer-excavador).

- **Durante** el encuentro: observaciones sobre cómo trabaja el viajero.
- **Al final:** reconocimiento + visión **general** de lo que viene en la aventura.
- **En el Taller:** lore y consejo sin revelar Piedra / Eco / Llama como sistemas.

### Portales

Tras el reconocimiento, los **tres portales** están en el escenario.

**Aún no están en uso:** el jugador no elige doctrina en esta fase de diseño / implementación.

Cuando entren en uso, la elección del Primer Eje será irreversible y parametrizará el Movimiento II. Ver [Doctrinas del reino](./NARRATIVE.md#doctrinas-del-reino).

---

## Música del Movimiento I

> Contrato técnico global: [`AUDIO.md`](./AUDIO.md) (arco N1→N7).  
> Prompts Lyria: `creation/prompts/music/mov1_n1_entrada.txt` … `mov1_n7_excavador.txt`.

### Dirección emocional

Introducción de una obra: **chispa de aventura** al entrar, **peso narrativo** al descender.

No tiene identidades doctrinales del Movimiento II.

Debe combinar:

- aventura animada (sobre todo N1);
- oficio (pico, metal, lámpara);
- misterio que **crece** con la profundidad;
- descubrimiento sin horror.

Debe transmitir:

> Empiezo con permiso y ganas — y cuanto más bajo, más grande se siente la montaña.

**Brief de arco:**

> Nordic dwarf mine: N1–N2 = lively tutorial adventure; N3–N6 slow and thicken; N7 = urgent time-race stakes — translate every game noun into timbre (spirits = glassy pads + sparse wordless choir).

### Specs técnicos (familia Mov. I)

| Parámetro | Valor canónico |
|-----------|----------------|
| **BPM** | N1–N2 altos (~95–98); N3–N6 descienden; **N7 ~108** (urgencia de carrera) |
| **Meter** | 4/4; 6/8 opcional solo N6–N7 |
| **Modo / centro** | **Dórico** / eolio cálido (p. ej. D o A); Mixolidio suave en taller |
| **Forma** | Loop-friendly; A–A'–B–A o drone + motivo |
| **Densidad** | Sube N1→N7 |
| **Tessitura** | N1 más brillante; graves ganan peso hacia N7 |
| **Dinámica** | mp–mf temprano; pp–mf profundo; f solo stingers / clímax breve N7 |
| **Reverb** | Corta en N1–N2; cola creciente N4+ |
| **Loudness** | ≈ −14 a −16 LUFS; headroom para SFX |

### Instrumentación (familias)

| Stem / capa | Timbre | Función |
|-------------|--------|---------|
| **drone** | Sub + pad de piedra | Masa (más presente desde N3) |
| **pulse** | Percusión profunda amortiguada / metal rítmico | Paso / oficio — **no** tribal world percussion |
| **melody** | Flauta, cello, bowed metal, lead limpio | Motivo viajero / linterna |
| **lamp** | Chispas metálicas, shimmer ámbar | Vida de N1–N2; acentos de luz |
| **forge** | Anvil / bowls filtrados | Taller y N2 trabajo |
| **tension** | Air, scraped stone, clusters suaves | N3+ |
| **spirit** | Pads vítreos + **coro wordless etéreo** (puntual) | N4 alusión a espíritus |
| **ritual** | 4ª/5ª abiertas; percusión suave no étnica | N6 |
| **urgency** | Pulse insistente, ticks, rising tension | N7 carrera |

### Motivo Mov. I

Célula 5–7 notas del motivo raíz ([`AUDIO.md`](./AUDIO.md#motivo-raíz-del-viaje)).

En N1: más rítmica / brillante. Hacia N7: más lenta, más abierta, sobre pedal grave.

### Taller (hub)

Calor de forja (martillo, yunque, chispas, fuelle) — no tribal.  
Runtime: `assets/sounds/music_workshop.mp3` (`workshop`).

| Parámetro | Valor |
|-----------|-------|
| BPM | 70–80 |
| Emoción | Oficioso, calor de fragua |
| Prompt | `creation/prompts/music/mov1_workshop.txt` |

### Arco por nivel (N1–N7)

| Nivel | Nombre | Emoción | BPM | Complejidad |
| ----- | ------ | ------- | --- | ----------- |
| 1 | La Entrada | Chispas de nueva aventura; permiso animado | **98** | Clara, brillante, poco peso |
| 2 | Las Herramientas | Tutorial de oficio; aún cercano a N1 | **95** | N1 + pico/metal ligero — no contemplativo |
| 3 | La Profundidad | Habitada; ya no estás solo | **86** | + tension suave |
| 4 | Los Habitantes | Oscuridad parcial; espíritus | **80** | + reverb / aire; coro etéreo puntual |
| 5 | La Recolección | Inteligencia / ritual ligero | **76** | Ostinato geométrico (puzzle) |
| 6 | La Cámara Antigua | Preámbulo del umbral | **72** | Germen ritual / Excavador |
| 7 | El Primer Excavador | Carrera; stakes altos | **108** | Urgencia, countdown, tensión alta |

Runtime por nivel: `assets/sounds/music_mov1_n1.mp3` … `music_mov1_n7.mp3` (`bgMusic` en [`levels.js`](../src/config/levels.js)).

### Stingers alineados al Mov. I

| Evento | Característica |
|--------|----------------|
| Daño / hurt | Hit metálico corto + duck 200–400 ms |
| Escape (muerte → hub) | Motivo descendente / disolución a drone; sin coral |
| Victoria de nivel | Resolución consonante breve (ámbar); no fanfarria |
| Puzzle OK / cofre | Chime bronce |

### Qué no hacer en Mov. I

- N1–N2 contemplativo / ambient vacío.
- N7 lento/solemne cuando es **carrera a contrarreloj**.
- Percusión tribal/world como identidad.
- Identidad clara de Piedra / Eco / Llama.
- Horror industrial o orquesta tutti que tape SFX.
- Describir lore visual (“espíritu teal”) sin traducirlo a timbre musical.

---

## Dirección visual

Las Minas deben ser las más "normales" visualmente.

Comparadas con movimientos posteriores:

- menos simbólicas;
- más físicas;
- más materiales.

**Colores:**

- piedra;
- metal;
- cristales;
- fuego de lámparas.

La rareza debe venir de pequeños detalles:

- una luz que no debería existir;
- una sombra que tarda demasiado;
- una estatua mirando al jugador.

Bioma canónico: **Las Minas Fundacionales** — ciudad minera activa; estabilidad, trabajo y prosperidad.

Dirección de arte (gradientes PC, top-down, nórdico): [`VISUAL_STYLE.md`](./VISUAL_STYLE.md).

El **Taller** visualmente es fragua / banco de trabajo comunal — familiar, no cósmico.

---

## Cierre del movimiento

Tras superar al Primer Excavador:

1. Recuento del encuentro.
2. El guardián **no muere** — reconoce al viajero.
3. Comentario general sobre la aventura que viene.
4. El Excavador pasa al **Taller**.
5. Los **tres portales** quedan **presentes pero inactivos** hasta que el diseño active la elección del Primer Eje.

No hay spoiler de rutas doctrinales en el Mov. I.

---

## Relación con el resto del viaje

El Movimiento I debe poder jugarse sin conocer la narrativa profunda.

Después, en el Corazón o La Forja, el jugador podrá mirar atrás y pensar:

> La montaña ya estaba hablando desde el inicio — el pico, el mineral, el taller.

Pero durante la primera partida solo debe sentir:

> Estoy explorando una mina misteriosa con permiso de trabajarla.

Todos los jugadores viven exactamente el mismo recorrido en este movimiento.

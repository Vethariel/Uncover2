# Uncover — Diseño de gameplay

## Modelo de espacio

Uncover es un juego de **rejilla (tile-based)**, no de física pixel a pixel.

**Tamaño de tile canónico: 32×32 px.**  
(16×16 quedó descartado: no sostiene la riqueza visual definida en [`VISUAL_STYLE.md`](./VISUAL_STYLE.md).)

Hay dos capas de precisión, a propósito:

| Capa | Datos | Uso |
|------|-------|-----|
| **Continua** | `posX`, `posY`, `size` (hitbox interior al tile) | Movimiento fluido, corner assist, contacto jugador–enemigo |
| **Discreta** | `tileX`, `tileY` | Bombas, explosiones, puerta de salida, IA, trampas futuras |

La posición continua existe para que caminar se sienta bien. Las reglas de juego preguntan: **¿en qué casilla estás?**

## Hitbox vs sprite

- **Tile:** 32×32 px (`TILE_SIZE`).
- **Hitbox lógica:** 24×24 px dentro del tile (`PLAYER_SIZE` / `ENEMY_SIZE`; `golem_advanced` 28).
- **Sprite visual:** puede superar la altura del tile (p. ej. ~32×40–48); solo presentación, desacoplado de las reglas.

El margen interior hace que el contacto con enemigos sea justo: el arte parece más grande, pero el juego solo cuenta el núcleo central.

`tileX` / `tileY` se derivan del centro de la hitbox:

```
tileX = floor((posX + size / 2) / TILE_SIZE)
tileY = floor((posY + size / 2) / TILE_SIZE)
```

> Runtime ya en `TILE_SIZE = 32`. Velocidades y tamaños escalados ×2 respecto al prototipo 16; el feel es proporcional.
## Qué es tile-based

Estos sistemas usan **tile**, no overlap AABB fino:

- Colocación y explosión de bombas
- Daño por explosión
- Victoria al pisar únicamente el trigger central de la puerta de salida
- IA (`isWalkable`, `isDangerous`, BFS)

## Qué usa posición continua

- `CollisionSystem` — movimiento vs paredes y bombas
- `LifeSystem.overlaps()` — contacto jugador–enemigo (AABB de hitbox; target ~24×24 tras migrar a tile 32)

## Extensiones previstas (Uncover)

Nuevas mecánicas deben preferir **tile** salvo que necesiten lo contrario:

| Sistema | Resolución sugerida |
|---------|---------------------|
| Luz / oscuridad | Visibilidad por tile |
| Trampas (gas, suelo inestable) | Activación y daño por tile |
| Fragmentos de memoria | Coleccionable por tile |
| Derrumbe | Tiles que pasan a sólido |
| Minerales / pico | Extracción y destrucción por tile |
| Bloques de puzzle (activar) | Estado por tile |

## Curriculum técnico — Movimiento I

Contrato jugable detallado en [`MOVEMENT_I.md`](./MOVEMENT_I.md). Resumen de sistemas:

| Concepto | Regla |
|----------|-------|
| **Bombas** | Magia del viajero (origen “de la nada”, como Bomberman); siguen `maxBombs` / alcance |
| **Pico** | `Q` mantenida; progreso por bloque; inmoviliza mientras pica; extrae sin destrozar valor |
| **Minerales** | En destructibles; bomba = 0 yield; pico → `runResources` → `workshopStorage` al completar |
| **Vida** | Cada nivel empieza con vida máxima; no persiste entre niveles |
| **Taller** | Hub post-nivel (desde N2, futuro); consume `workshopStorage` — **no** se llama La Forja |
| **Luz** | Visibilidad por tile (N4+) |
| **Golems / espíritus** | Perfiles de amenaza; no doctrinales |
| **Puzzle** | Activar bloques por tile (N5–N6) |
| **Umbral (N7)** | Encontrar y pisar la salida antes de agotar el tiempo |
| **Portales del Primer Eje** | Presentes tras el umbral; **aún no activos** |

El Mov. I debe sentirse *Bomberman en minas*, no un menú de power-ups clásico.

**Economía de minerales / Taller / mejoras:** [`CRAFTING.md`](./CRAFTING.md).

## Principio rector

> *Gameplay rules are tile-based; continuous position exists only for movement feel.*

No unificar explosiones o pickups a overlap pixel sin motivo: la simplicidad y la predictibilidad son parte del diseño.

## Matriz de reglas: quién pregunta qué

No hay una sola función “¿qué es este tile?”. Cada sistema hace una pregunta distinta. Esta tabla es el **contrato oficial** del juego (validado en `tests/interactions/coherence.test.js` y archivos relacionados).

### Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✓ | Permite / aplica / bloquea según corresponda |
| ✗ | No permite / no aplica |
| ◐ | Depende de contexto (ver notas) |
| — | No consulta este criterio |

### Por tipo de tile (terreno)

| Pregunta | `EMPTY` | `WALL` | `DESTRUCTIBLE` | `TILE_PASS` | `TILE_EXPLOSION`* |
|----------|---------|--------|----------------|-------------|-------------------|
| `isSolidTile` | ✗ | ✓ | ✓ | ✗ | ✗ |
| `blocksMovement` (sin bomba) | ✗ | ✓ | ✓ | ✗ | ✗ |
| `isWalkable` (sin bomba) | ✓ | ✗ | ✗ | ✓ | ✗† |
| `lineOfSight` (sólido intermedio) | — | ✓ bloquea | ✓ bloquea | ✗ no bloquea | ✗ |
| Blast de explosión se propaga | ✓ | ✗ para | ◐ destruye‡ | ✗ para | ✗ para |
| Colocar bomba (`InputSystem`) | ✓ | ✗ | ✓ | ✗ | ✗ |
| Atravesar puerta de salida | ✓ requerido | ✗ | ✗ | ✗ | ✗ |

\* `TILE_EXPLOSION` es estado **transitorio** tras romper un destructible; vuelve a `EMPTY` al limpiar la explosión.

† Mientras dura la animación de explosión en ese tile.

‡ El rayo del blast destruye el destructible; la bomba **en el mismo tile** que un destructible **no** lo rompe (solo afectan los rayos, `i ≥ 1`). Ver nota 1.

### Por estado superpuesto (mismo tile)

| Pregunta | Bomba (`hasBomb`) | Bomba + `passThrough` dueño | Explosión activa |
|----------|-------------------|-----------------------------|------------------|
| `isWalkable` | ✗ | ✗ | ✓†† |
| `blocksMovement(player dueño)` | ✓ | ✗ | ◐ |
| `blocksMovement(otro / sin entidad)` | ✓ | ✓ | ◐ |
| `isDangerous` | ◐ timer ≤ 1.5s | ◐ | ✓ en ese tile |
| Daño a entidad (mismo tile) | ✗ | ✗ | ✓ |

†† La explosión no cambia `isWalkable`; el daño es por coincidencia de tile, no por bloquear paso.

### Por sistema: qué API usa

| Sistema | Pregunta que hace | Resolución |
|---------|-------------------|------------|
| `CollisionSystem` | ¿Puedo mover la hitbox aquí? | `GridQuery.blocksMovement` + posición continua |
| `InputSystem` | ¿Puedo plantar bomba en mi tile? | Tile ≠ `TILE_PASS`, sin bomba duplicada, `activeBombs < maxBombs` |
| `BombSystem` | ¿Hacia dónde llega el blast? | Rayos en cruz; para en `WALL`, `TILE_PASS`, `TILE_EXPLOSION`; rompe `DESTRUCTIBLE` |
| `LifeSystem` (explosión) | ¿Mismo tile entidad–explosión? | `tileX` / `tileY` iguales |
| `LifeSystem` (enemigo) | ¿Solapan las hitboxes? | AABB 24×24 (`golem_advanced`: 28×28) — **no** solo tile |
| `LifeSystem` (salida) | ¿Gano el nivel? | `player.tileX/Y` coincide con el único tile de `exitDoor.triggerTiles`; no exige eliminar enemigos |
| `GridQuery.isWalkable` | ¿Puede pisar la IA? | En bounds, no sólido, sin bomba |
| `GridQuery.isDangerous` | ¿Hay daño inminente? | Explosión en tile o zona de bomba a punto de detonar |
| `GridQuery.lineOfSight` | ¿Hay sólido entre A y B? | Solo `isSolidTile` en el camino |
| `IsPlayerInLine` | ¿Jugador en línea recta libre? | `isWalkable` en tiles intermedios — **no** usa `lineOfSight` |
| `bfsHelper` (`avoidDanger: true`) | ¿Camino seguro? | `isSafe` (= walkable ∧ ¬peligroso) |
| `bfsHelper` (`avoidDanger: false`) | ¿Camino transitable? | Solo `isWalkable` — ignora explosiones, **no** ignora bombas |

### Excepciones documentadas (AABB)

Estas reglas **rompen** el “todo por tile” de forma intencional:

| Caso | Criterio | Por qué |
|------|----------|---------|
| Contacto jugador–enemigo | AABB (`LifeSystem.overlaps`) | Margen justo: figura visual independiente, hitbox 24×24 |
| Victoria en puerta | Coincidencia de tile (`LifeSystem.checkExitDoor`) | Solo el centro `T` completa el nivel; los laterales son indestructibles |
| Enemigo `golem_advanced` | Hitbox 28×28 | Contacto más amplio que golem básico / espíritu |

### Notas de diseño (descubiertas en tests)

1. **Bomba sobre destructible:** el centro de la explosión no aplica lógica de destructible al tile de la bomba; hay que alcanzarlo con un rayo adyacente.
2. **`TILE_PASS`:** transitable y transparente a visión (`lineOfSight`, `IsPlayerInLine`), pero **opaco** al blast — útil para puentes y ventilación en Uncover.
3. **`passThrough`:** el dueño ignora su bomba en movimiento (`bombBlocksEntity`), pero el tile sigue siendo `!isWalkable` para la IA.
4. **Daño y vidas (jugador):** un golpe no letal resta una vida, conserva la posición y concede 2 s de invulnerabilidad. Con una sola vida restante, el golpe produce `playerDeath`; tras 2 s comienza `gameOver`. No hay respawn del jugador.
5. **Daño y vidas (enemigos):** mismo patrón de HP + 2 s de invulnerabilidad. Al morir: cadáver 1 s y respawn a los 20 s en el spawn original si el tile está libre. Contacto: `golem_basic` solo en agresivo; `spirit` y `golem_advanced` siempre.
6. **Nuevas mecánicas** (luz, gas, trampas): añadir columna a estas tablas y un test en `tests/interactions/coherence.test.js` antes de implementar en producción.

## API de grid (`GridQuery`)

Consultas unificadas al tile y al estado del mundo. Usar en movimiento, IA y futuras trampas:

| Método | Uso |
|--------|-----|
| `isSolidTile(x, y)` | Pared / destructible |
| `hasBomb(x, y)` | Bomba en tile |
| `bombBlocksEntity(x, y, entity)` | Bomba bloquea (passThrough) |
| `blocksMovement(x, y, entity?)` | Movimiento continuo |
| `isWalkable(x, y)` | IA pathfinding |
| `isDangerous(x, y)` | Explosión o blast inminente |
| `isSafe(x, y)` | Caminable sin peligro |
| `lineOfSight(...)` | Línea de visión en grid |

```js
const query = GridQuery.for(world)
query.blocksMovement(tx, ty, player)
```

## Sincronización de tile (`entityTiles.js`)

| Función | Uso |
|---------|-----|
| `syncTileFromPosition(entity, tileSize)` | Tras mover — deriva `tileX`/`tileY` del centro de hitbox |
| `positionFromTile(tx, ty, tileSize, size)` | Spawn — posición continua desde tile |

`tileX`/`tileY` solo deben actualizarse vía estas funciones, no calculados a mano.

## Capa Phaser (render)

Separación deliberada: **`game/` = reglas**, **`phaser/` = presentación**.

| Responsabilidad | Implementación |
|-----------------|----------------|
| Generación de nivel | `LevelGenerator` → grafo, proximidad, cámaras, pasillos, cobertura orgánica 2×2, puertas y spawns deterministas por `seed` |
| Mapa visible (provisional) | `TilemapView` combina el `Grid` lógico con `terrainRegions` y dibuja variantes por región mediante rectángulos y colores |
| Destructibles rotos | `TilemapView` redibuja al detectar un cambio del `Grid` |
| Entidades (provisional) | `EntityView` dibuja círculos, rectángulos y líneas |
| Cámara | `GameScene` centra al jugador (`startFollow` sin deadzone + `setBounds`); mapas mayores al viewport hacen scroll |
| Visión y niebla | `VisionSystem` acumula luz radial 0–10 solo dentro del viewport×radio 7; fuentes con `lightEmission`; `FogOfWarView` deja negro lo desconocido, memoria explorada en neutro muy oscuro, y oculta fuentes fuera del radio aunque su luz sí llegue |
| HUD | `HudView` fijo (`scrollFactor 0`); muestra vidas y temporizador cuando aplica |
| Overlays (pausa, victoria…) | `GameOverlayScene` + `scene.pause('Game')` |
| Escalado | buffer interno 640×360, `Scale.FIT` (llena la ventana, 16:9) + nearest + `roundPixels` — sin restricción de zoom entero |
| Input | `InputAdapter` sobre `keyboard` de Phaser |

El generador implementa el grafo aprobado de cámaras orgánicas y túneles de banda 3/5. Deriva el AABB del layout, conecta nodos cercanos (gap ≤ 10), genera indestructibles orgánicos sin lattice (todo 2×2 contiene un muro), corrige conectividad, distribuye contenido por rol y crea puertas de mina de 3 tiles lejos de bocas de pasillo; ver [`PROCEDURAL_LEVELS.md`](./PROCEDURAL_LEVELS.md). El runtime no carga PNG, spritesheets ni animaciones mientras se prioriza gameplay.

La visión ya no es una cruz rígida, sino un campo de luz tile-based:

- casco del jugador: intensidad 7;
- bomba colocada antes de explotar: intensidad 2;
- enemigos vivos: intensidad 2;
- espíritu enfurecido: intensidad 5;
- explosiones activas: intensidad 5;
- luces montadas en muro/antorchas: intensidad 10;
- suma por tile limitada a 10;
- la intensidad cae según la distancia radial al foco;
- muros y destructibles reciben luz como borde, pero bloquean la propagación posterior.

La visibilidad final nunca supera distancia euclidiana 7 respecto al jugador. Solo se calculan fuentes que intersectan el viewport centrado en el jugador. Cada fuente expone `lightEmission` (o `getLightEmission()`). Cada tile requiere línea de visión tanto desde la fuente como desde el jugador: los obstáculos quedan iluminados como borde, pero ninguna luz revela lo que queda detrás de ellos. Una fuente fuera del radio puede iluminar el interior del radio si existe línea de visión, pero su sprite/antorcha no se dibuja hasta entrar en visión. Lo desconocido es negro; lo explorado sin luz actual usa un neutro muy oscuro de memoria. Las entidades dinámicas solo se muestran bajo luz actual. La capa visual interpola cada cambio de iluminación durante `140 ms` con una curva suave; la visibilidad lógica sigue actualizándose de inmediato.

Un minimapa permanente (arriba a la derecha, bajo el HUD) muestra los tiles descubiertos: suelo, muros y destructibles con tonos distintos. El jugador es el centro fijo del minimapa y el mapa interno se desplaza con su posición.

## Pruebas de interacción

Suite en `tests/` con [Vitest](https://vitest.dev/). Ejecutar:

```bash
npm test          # una pasada
npm run test:watch
```

### Estructura

| Carpeta | Qué protege |
|---------|-------------|
| `tests/unit/` | `Grid`, `entityTiles`, `GridQuery`, `bfsHelper`, `aiConditions` |
| `tests/interactions/` | Movimiento, corner assist, bombas, explosiones avanzadas, vida, input, contacto AABB, coherencia |
| `tests/integration/` | `GameLoop` end-to-end |
| `tests/helpers/` | `createTestWorld()` — mapas ASCII sin assets Tiled |

### Principio

Los tests documentan las reglas del diseño tile-based. Si fallan tras un cambio, o el código rompió una regla o el diseño cambió a propósito (actualizar test + `docs/DESIGN.md`).

Casos cubiertos:

**Núcleo tile**
- Centro de hitbox → tile correcto (`syncTileFromPosition`)
- `isWalkable` ↔ `!blocksMovement` sin entidad
- Destructibles y `TILE_PASS` vs `lineOfSight` (explosiones bloquean `PASS`; visión no)

**Bombas y explosiones**
- Colocación, `TILE_PASS`, `passThrough`, `maxBombs`
- Cadena de bombas, destructibles, `TILE_PASS` detiene blast
- `activeBombs--` al detonar

**Vida y victoria**
- Daño por tile; contacto AABB (jugador; `golem_basic` solo agresivo; `spirit`/`golem_advanced` siempre; hitbox avanzada 28×28)
- Jugador: daño no letal + invulnerabilidad 2 s; muerte en la última vida; timeout exclusivo de N7
- Enemigos: HP por tipo + invulnerabilidad 2 s; respawn 20 s en spawn original
- Puerta: victoria al pisar el trigger central, incluso con enemigos vivos

**IA**
- Estados pasivo/agresivo por especie; alerta de golems básicos; furia de espíritus por explosión cercana
- BFS hacia objetivo (espíritu atraviesa destructibles), huida a tile seguro, hojas de patrulla
- `IsPlayerInLine`, `IsPlayerNear`, `IsInDanger`

**Progresión**

**Integración**
- `GameLoop`: input → movimiento → bomba → explosión en varios frames

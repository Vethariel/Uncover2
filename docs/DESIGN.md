# Uncover — Diseño de gameplay

## Modelo de espacio

Uncover es un juego de **rejilla (tile-based)**, no de física pixel a pixel.

**Tamaño de tile canónico: 32×32 px.**  
(16×16 quedó descartado: no sostiene la riqueza visual definida en [`VISUAL_STYLE.md`](./VISUAL_STYLE.md).)

Hay dos capas de precisión, a propósito:

| Capa | Datos | Uso |
|------|-------|-----|
| **Continua** | `posX`, `posY`, `size` (hitbox interior al tile) | Movimiento fluido, corner assist, contacto jugador–enemigo |
| **Discreta** | `tileX`, `tileY` | Bombas, explosiones, power-ups, portal, IA, trampas futuras |

La posición continua existe para que caminar se sienta bien. Las reglas de juego preguntan: **¿en qué casilla estás?**

## Hitbox vs sprite

- **Tile:** 32×32 px.
- **Hitbox lógica (target):** ~24×24 px dentro del tile (mismo margen relativo que el prototipo 12/16) — ajustar en `PLAYER_SIZE` / `ENEMY_SIZE` al migrar runtime.
- **Sprite visual:** puede superar la altura del tile (p. ej. ~32×40–48); solo presentación, desacoplado de las reglas.

El margen interior hace que el contacto con enemigos sea justo: el arte parece más grande, pero el juego solo cuenta el núcleo central.

`tileX` / `tileY` se derivan del centro de la hitbox:

```
tileX = floor((posX + size / 2) / TILE_SIZE)
tileY = floor((posY + size / 2) / TILE_SIZE)
```

> **Nota de migración:** el código actual puede seguir en `TILE_SIZE = 16` hasta actualizar mapas Tiled, assets y constantes. El **contrato de diseño** ya es 32×32.
## Qué es tile-based

Estos sistemas usan **tile**, no overlap AABB fino:

- Colocación y explosión de bombas
- Daño por explosión
- Pickup de power-ups
- Activación del portal (lógica de tile; victoria usa AABB más estricto)
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
| **Pico** | Herramienta lenta al inicio; extrae minerales sin el destrozimiento amplio de la bomba |
| **Minerales** | En tiles; la bomba puede abrir camino **y** destruir valor; el pico prioriza conservación |
| **Taller** | Hub post-nivel (desde N2); fabricación con materiales — **no** se llama La Forja |
| **Luz** | Visibilidad por tile (N4+) |
| **Golems / espíritus** | Perfiles de amenaza; no doctrinales |
| **Puzzle** | Activar bloques por tile (N5–N6) |
| **Umbral (N7)** | Carrera de recursos a tiempo + recuento; fallo → repetir N6; mejoras del Taller se conservan |
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
| Activar portal (tile del portal) | ✓ requerido | ✗ | ✗ | ✗ | ✗ |

\* `TILE_EXPLOSION` es estado **transitorio** tras romper un destructible; vuelve a `EMPTY` al limpiar la explosión.

† Mientras dura la animación de explosión en ese tile.

‡ El rayo del blast destruye el destructible; la bomba **en el mismo tile** que un destructible **no** lo rompe (solo afectan los rayos, `i ≥ 1`). Ver nota 1.

### Por estado superpuesto (mismo tile)

| Pregunta | Bomba (`hasBomb`) | Bomba + `passThrough` dueño | Explosión activa | Power-up oculto | Power-up visible |
|----------|-------------------|-----------------------------|------------------|-----------------|------------------|
| `isWalkable` | ✗ | ✗ | ✓†† | — | — |
| `blocksMovement(player dueño)` | ✓ | ✗ | ◐ | — | — |
| `blocksMovement(otro / sin entidad)` | ✓ | ✓ | ◐ | — | — |
| `isDangerous` | ◐ timer ≤ 1.5s | ◐ | ✓ en ese tile | ✗ | ✗ |
| Daño a entidad (mismo tile) | ✗ | ✗ | ✓ | ✗ | ✗ |
| Pickup (`PowerUpSystem`) | — | — | — | ✗ | ✓ |
| Blast destruye power-up | — | — | ✓ si `alive` | ✗ conserva | ✓ elimina |
| Tras limpiar explosión en destructible | — | — | — | ✓ `revealPowerUp` | — |

†† La explosión no cambia `isWalkable`; el daño es por coincidencia de tile, no por bloquear paso.

### Por sistema: qué API usa

| Sistema | Pregunta que hace | Resolución |
|---------|-------------------|------------|
| `CollisionSystem` | ¿Puedo mover la hitbox aquí? | `GridQuery.blocksMovement` + posición continua |
| `InputSystem` | ¿Puedo plantar bomba en mi tile? | Tile ≠ `TILE_PASS`, sin bomba duplicada, `activeBombs < maxBombs` |
| `BombSystem` | ¿Hacia dónde llega el blast? | Rayos en cruz; para en `WALL`, `TILE_PASS`, `TILE_EXPLOSION`; rompe `DESTRUCTIBLE` |
| `LifeSystem` (explosión) | ¿Mismo tile entidad–explosión? | `tileX` / `tileY` iguales |
| `LifeSystem` (enemigo) | ¿Solapan las hitboxes? | AABB 12×12 (bomber: 14×14) — **no** solo tile |
| `LifeSystem` (portal) | ¿Gano / activo portal? | Activación: tile vacío + sin enemigos. Victoria: `portal.visible` + AABB estrictamente dentro |
| `PowerUpSystem` | ¿Pickup? | Mismo tile jugador–power-up y `alive === true` |
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
| Contacto jugador–enemigo | AABB (`LifeSystem.overlaps`) | Margen justo: sprites 32×32, hitbox 12×12 |
| Victoria en portal | AABB estricto (`LifeSystem.inside`) | El jugador debe “entrar” al portal, no rozarlo |
| Enemigo bomber | Hitbox 14×14 | Contacto más amplio que dino/demon |

### Notas de diseño (descubiertas en tests)

1. **Bomba sobre destructible:** el centro de la explosión no aplica lógica de destructible al tile de la bomba; hay que alcanzarlo con un rayo adyacente.
2. **`TILE_PASS`:** transitable y transparente a visión (`lineOfSight`, `IsPlayerInLine`), pero **opaco** al blast — útil para puentes y ventilación en Uncover.
3. **`passThrough`:** el dueño ignora su bomba en movimiento (`bombBlocksEntity`), pero el tile sigue siendo `!isWalkable` para la IA.
4. **Respawn:** revive con `lives >= 0`; `gameOver` cuando, tras morir, `lives < 0`.
5. **Nuevas mecánicas** (luz, gas, trampas): añadir columna a estas tablas y un test en `tests/interactions/coherence.test.js` antes de implementar en producción.

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
| `positionFromTile(tx, ty, tileSize, size)` | Spawn / respawn — posición continua desde tile |

`tileX`/`tileY` solo deben actualizarse vía estas funciones, no calculados a mano.

## Capa Phaser (render)

Separación deliberada: **`game/` = reglas**, **`phaser/` = presentación**.

| Responsabilidad | Implementación |
|-----------------|----------------|
| Mapa visible | `Phaser.Tilemaps` — TMJ+TSJ embebidos en preload (`embedTileset`) + `createLayer` |
| Lógica del grid | `LevelLoader` → `Grid` (solo capa `GridMap`) |
| Destructibles rotos | `TilemapView` → `destructibleLayer.removeTileAt` |
| Entidades | `EntityView` sincroniza sprites desde el mundo |
| Overlays (pausa, victoria…) | `GameOverlayScene` + `scene.pause('Game')` |
| Escala pixel-perfect | `Phaser.Scale` con `setZoom` entero |
| Input | `InputAdapter` sobre `keyboard` de Phaser |

Flips y animaciones de tiles Tiled los resuelve el motor; ya no hay `tiledTransform.js` ni un `Image` por tile.

## Pruebas de interacción

Suite en `tests/` con [Vitest](https://vitest.dev/). Ejecutar:

```bash
npm test          # una pasada
npm run test:watch
```

### Estructura

| Carpeta | Qué protege |
|---------|-------------|
| `tests/unit/` | `Grid`, `entityTiles`, `GridQuery`, `bfsHelper`, `aiConditions`, `powerUpPool` |
| `tests/interactions/` | Movimiento, corner assist, bombas, explosiones avanzadas, vida, input, score, power-ups, contacto AABB, coherencia |
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
- `activeBombs--`, power-up oculto/visible bajo explosión

**Vida y victoria**
- Daño por tile; contacto AABB (jugador, bomber 14×14)
- Invulnerabilidad, respawn, `gameOver`, `timeUp`
- Portal: activación, victoria solo si `visible` + AABB estricto

**IA**
- BFS hacia objetivo, huida a tile seguro, hojas de patrulla
- `IsPlayerInLine`, `IsPlayerNear`, `IsInDanger`

**Progresión**
- Score y combo; efectos de cada power-up; `PowerUpPool`

**Integración**
- `GameLoop`: input → movimiento → bomba → explosión en varios frames

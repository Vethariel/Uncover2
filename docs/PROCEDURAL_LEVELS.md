# Uncover — Diseño de niveles procedurales

> Contrato de diseño para la generación de minas. Reglas generales de gameplay: [`DESIGN.md`](./DESIGN.md).  
> **Estado:** implementado en `LevelGenerator` (grafo, proximidad, cobertura orgánica 2×2, puertas fuera de bocas).

## Intención

Los niveles deben leerse como una **mina excavada**, no como un tablero rectangular.

La estructura global será un **grafo espacial**:

- Los **nodos** son cámaras o zonas de actividad.
- Las **aristas** son túneles que conectan las cámaras.
- Entrada y salida están en nodos diferentes y alejados dentro del grafo.
- La silueta exterior resulta de las cámaras y túneles excavados, produciendo un borde orgánico.

El grafo solo se usa para **generar**. El gameplay continúa funcionando sobre el `Grid` de tiles.

```text
entrada
   │
 cámara pequeña ── túnel ── cámara
                              │
                         cámara ── túnel ── cámara de salida
                              ╲_____________╱
                                  ciclo
```

No todos los niveles deben ser árboles. Algunos pueden contener ciclos o atajos para reducir el retroceso obligatorio.

---

## Regla invariable: sin vacíos abiertos 2×2

No hay lattice regular. Los indestructibles se generan de forma **orgánica** (ruido + cobertura correctiva).

Restricción dura:

- En ninguna ventana **2×2** completamente excavada puede faltar un indestructible.
- En consecuencia, todo grupo cuadrado de cuatro tiles incluye al menos un muro fijo.
- Solo cuentan como ocupación los **bloques indestructibles** (`TILE_WALL`). Destructibles y menas no cierran la regla.

Patrón conceptual válido (orgánico, no periódico):

```text
. . W .
W . . W
. W . .
. . W .
```

`W` = indestructible.
`.` = casilla disponible (vacía, destructible u otro contenido).

Un esqueleto de conectividad (ejes de cámara, centro de pasillos, spawn y puertas) permanece libre de indestructibles para que la salida sea alcanzable sin retirar muros fijos. Después se colocan rompibles, que sí pueden bloquear el avance.

---

## Pasillos

Un pasillo es una **banda excavada de 3 o 5 tiles de ancho** con trazado ortogonal (rectos o en L).

### Contrato

- Ancho exterior de túnel: **3 o 5 tiles**.
- Los túneles conectan nodos mediante tramos ortogonales sobre el grid.
- La separación libre `d_ij` del árbol/ciclos depende del nodo más grande conectado: pequeño `10±5`, mediano `15±5`, grande `25±5`.
- **Proximidad:** si dos nodos no conectados quedan con separación entre bordes **≤ 10**, se añade un pasillo automático (sin límite de grado).
- Toda la banda puede contener destructibles, recursos escasos y enemigos; los rompibles pueden bloquear el avance.
- Los indestructibles orgánicos también pueden aparecer en la banda, siempre respetando la regla 2×2 y el esqueleto de conectividad.

### Uso de anchos

- **3 tiles:** conexión estándar, más contenida y tensa.
- **5 tiles:** conexión usada para llegar a los **nodos grandes**.

Los pasillos favorecen trazados **horizontales o verticales**. Pueden cambiar de eje mediante codos y pueden cruzarse; los cruces y las aristas de proximidad reducen el retroceso forzoso entre cámaras vecinas.

---

## Nodos o cámaras

Los nodos son regiones aproximadamente circulares o elípticas rasterizadas al grid. No necesitan formar círculos perfectos.

### Reglas

1. Los indestructibles dentro de la cámara son orgánicos (ruido + cobertura 2×2).
2. Forman un laberinto ligero, nunca una cámara saturada ni una plaza 2×2 completamente abierta.
3. Deben permanecer varias rutas legibles entre las conexiones del nodo (el esqueleto y la excavación correctiva lo garantizan frente a indestructibles).
4. Los nodos concentran recursos, encuentros y elementos de interés.

### Tipos iniciales

| Nodo | Función |
|------|---------|
| Entrada | Pequeño, seguro y legible; introduce el nivel |
| Recurso | Cámara con vetas o materiales y riesgo asociado |
| Encuentro | Espacio para enemigos y uso táctico de bombas |
| Conector | Nodo pequeño que ramifica o cambia dirección |
| Salida | Cámara lejana que contiene la puerta de salida |

### Variantes visuales de terreno

La topología conserva un `Grid` lógico común para gameplay, pero añade un `terrainRegions` paralelo para presentación. Cada región posee variantes distintas de **suelo** (`empty`) y **muro indestructible** (`wall`):

- exterior;
- pasillo;
- entrada y salida;
- veta (`vein`);
- guarida (`den`);
- mixta (`mixed`);
- reliquia (`relic`);
- ágora/conector (`agora`).

En las bocas, la cámara prevalece visualmente sobre el tramo de pasillo que entra en ella. Las puertas heredan la variante de entrada o salida. Por ahora `TilemapView` diferencia las variantes mediante colores primitivos.

Esta distinción es exclusivamente visual: todas las variantes `*:empty` se comportan como `TILE_EMPTY` y todas las variantes `*:wall` como `TILE_WALL`. Movimiento, IA, bombas, explosiones, conectividad y cobertura 2×2 siguen consultando únicamente el `Grid` lógico.

### Iluminación ambiental y soportes de muro

La mina parte en oscuridad. La visión del jugador depende de luz acumulada, no de una apertura global del mapa.

Fuentes base:

- casco del jugador: intensidad `7`;
- bomba colocada antes de explotar: intensidad `2`;
- monstruo vivo: intensidad `2`;
- espíritu enfurecido: intensidad `5`;
- explosión activa: intensidad `5`;
- antorcha/luz fijada a muro: intensidad `10`.

Reglas:

- la iluminación se propaga radialmente y pierde intensidad según distancia euclidiana;
- cada tile requiere línea de visión directa desde su fuente;
- la suma por tile se limita a `10`;
- la visibilidad efectiva nunca supera radio euclidiano `7` respecto al jugador;
- indestructibles y destructibles reciben luz como borde, pero proyectan sombra y bloquean todo lo que hay detrás.

Para soportes de luz ambientales, tras el sellado final se eligen tiles vacíos que tengan al menos un indestructible cardinal adyacente. La selección es determinista por semilla, con separación mínima de `8` tiles y objetivo aproximado de **1 soporte por cada 120 tiles excavados**. Cada soporte guarda el muro al que se adhiere y su orientación, útil para renderizar antorchas u otras fuentes.

---

## Progresión espacial — Movimiento I

La entrada existe en todos los niveles como una zona pequeña y legible. La tabla describe las cámaras de recorrido conectadas después de ella.

| Nivel | Nodos de recorrido | Distribución | Recursos (ver presupuesto) |
|------:|--------------------|--------------|----------------------------|
| **1** | 1 | 1 pequeño | Sin materiales |
| **2** | 3 | 3 pequeños | Un material distinto por nodo (3+3+3) |
| **3** | 4–5 (aleatorio) | 2 pequeños; resto medianos | Soft-cap 12; cristal escaso |
| **4** | 4–5 (aleatorio) | 2 pequeños; resto medianos | Soft-cap 14 |
| **5** | 6 | 3 pequeños + 3 medianos | Soft-cap 16 |
| **6** | 7 | 3 peq + 3 med + 1 grande | Soft-cap 14 |
| **7** | 8 | 3 peq + 3 med + 2 grandes | Soft-cap 10 (carrera) |

En N3 y N4 el conteo de nodos de recorrido (4 o 5) se decide con probabilidad **50/50** a partir de la semilla del nivel.

Los tamaños se expresan mediante un radio entero de nodo. Los radios originales se aumentaron un 20% y se redondearon al tile más cercano para compensar el espacio perdido durante el sellado de bolsillos inaccesibles:

| Tamaño | Radio |
|--------|-------|
| Pequeño | `r = 8` tiles |
| Mediano | `r = 17` tiles |
| Grande | `r = 25` tiles; sus conexiones usan pasillos de banda 5 |

Estos radios implican diámetros aproximados de 17, 35 y 51 tiles al rasterizar el centro. Por tanto, el tamaño final del mapa ya no puede fijarse de antemano en 45×33: debe derivarse del contenedor obtenido por el optimizador, más un margen exterior.

---

## Enemigos, recursos y presupuesto

Contrato económico global (techos de craft, smelting, recetas): [`CRAFTING.md`](./CRAFTING.md). Aquí la **colocación espacial** y el roster Mov. I.

### Roster Mov. I (solo tres tipos)

| ID | Nombre | Velocidad | HP | Comportamiento |
|----|--------|-----------|----|----------------|
| `golem_basic` | Golem básico | `110` (> jugador) | 2 | Patrulla pasiva; **no daña** por contacto. **Huye** de bombas. Si recibe daño se vuelve agresivo, persigue y alerta a otros básicos a ≤5 tiles. Vuelve a pasivo tras 8 s o a >10 tiles del jugador. En agresivo sí daña por contacto. |
| `spirit` | Espíritu | `75` pasivo / `110` agresivo | 1 | Patrulla pasiva. Si una explosión ocurre a ≤6 tiles se enfurece 8 s, acelera y persigue. **Atraviesa destructibles** (no muros ni bombas). Daña por contacto siempre. |
| `golem_advanced` | Golem avanzado | `80` (< jugador) | 4 | **Siempre agresivo**; persigue al jugador; daña por contacto. |

Compartido por todos:

- Un golpe resta 1 HP y concede **2 s** de invulnerabilidad (mismo modelo que el jugador).
- Al llegar a 0 HP: cadáver visible 1 s, luego oculto; **reaparece a los 20 s** en su spawn original cuando el tile esté libre (sin jugador, enemigo vivo, bomba, explosión ni bloqueo).
- Matar enemigos **no otorga puntuación**.

### Introducción por nivel

| Nivel | Enemigos habilitados |
|------:|----------------------|
| **1** | Ninguno |
| **2** | Ninguno *(tutorial de pico / menas)* |
| **3** | Solo `golem_basic` |
| **4** | `golem_basic` + `spirit` |
| **5** | `golem_basic` + `spirit` |
| **6** | Los tres (`golem_advanced` aparece) |
| **7** | Los tres (más densidad / presión) |

### Roles de nodo (variación)

Cada nodo de recorrido recibe un **rol** primario. Un nivel no debe sentirse uniforme: unos nodos dan mena, otros dan pelea, otros mezclan.

| Rol | Enfoque | Contenido típico | Densidad destructibles |
|-----|---------|------------------|------------------------|
| **Veta** | Recursos | Menas del material asignado; 0–1 golem básico (desde N3) | **alta ≈ 0.45** |
| **Guarida** | Enemigos | Poca o ninguna mena; varios golems / espíritus | **baja ≈ 0.20** |
| **Mixta** | Ambos | Menas + 1–2 enemigos; tensión pico vs pelea | **media ≈ 0.35** |
| **Reliquia** | Receta / lore | Fragmento de receta; guardián opcional (espíritu o golem) | **media-baja ≈ 0.25** |
| **Ágora** | Tránsito | Casi vacío; cruza pasillos; sin enemigos o 1 golem básico | **muy baja ≈ 0.10** |

La densidad se aplica sobre las casillas caminables del nodo que no son indestructibles orgánicos. Solo se excluyen el spawn y los tiles de las puertas. Guaridas abiertas favorecen el combate; vetas densas dan qué picar.

Regla: en un nivel con ≥3 nodos de recorrido, **no repetir el mismo rol** en más de la mitad de los nodos.

### Materiales por nivel (habilitación)

| Nivel | Materiales que pueden spawnear | Notas |
|------:|--------------------------------|-------|
| 1 | — | |
| 2 | Bronce, Hierro, Cristal | Un nodo = un material (introducción limpia); sin enemigos |
| 3 | Los tres | Cristal solo en 1 nodo (escaso); primer combate |
| 4+ | Los tres | Cristal ya puede aparecer en varios nodos |

### Soft-cap de menas crudas (indicador del nivel)

| Nivel | Soft-cap | Indicador UI | Enemigos (presupuesto) |
|------:|----------|--------------|------------------------|
| 1 | 0 | — | Ninguno |
| 2 | 9 (3+3+3) | Vetas pobres | Ninguno |
| 3 | 12 | Vetas normales | 3–5 `golem_basic` |
| 4 | 14 | Vetas normales | 3–4 golems básicos + 2–4 `spirit` |
| 5 | 16 | Vetas ricas | 4–5 golems + 3–5 espíritus; ≥1 nodo **guarida** |
| 6 | 14 | Vetas ricas / riesgo | Mixto + **1–3 `golem_advanced`** (sobre todo en el grande) |
| 7 | 10 | Carrera | Alta presión: mixto + varios avanzados |

El generador **intenta** colocar exactamente el soft-cap en casillas alcanzables (no detrás de lagunas irrompibles). Si tras validación faltan slots, puede quedar ±2 bajo el cap, nunca por encima de +2.

### Asignación típica N2–N4 (ejemplo)

**N2** — 3 pequeños (sin combate):

| Nodo | Rol | Material | Enemigos |
|------|-----|----------|----------|
| A | Veta | Bronce ×3 | — |
| B | Veta | Hierro ×3 | — |
| C | Veta | Cristal ×3 | — |

**N3** — 2 peq + 2–3 med (solo golem básico):

| Tipo | Roles sugeridos | Menas | Enemigos |
|------|-----------------|-------|----------|
| Pequeño | 1 veta + 1 ágora/mixta | 2–3 | 0–1 `golem_basic` |
| Mediano | 1 mixta + 1 guarida o reliquia | resto del soft-cap 12 | 1–2 `golem_basic` c/u |

**N4** — mismos tamaños que N3; añadir **espíritus** en guaridas y mixtas (1–2 por nodo caliente). Los golems básicos siguen presentes.

**N5+** — forzar al menos: 1 **guarida**, 1 **reliquia** (fragmento), 1 **veta** rica; el resto mixto/ágora.

**N6+** — el nodo grande concentra `golem_advanced`; no saturar nodos pequeños con avanzados.

### Fragmentos de receta (colocación)

| Rango objetivo | Dónde | Cantidad Mov. I |
|----------------|-------|-----------------|
| Recetas rango 2 | Nodos **reliquia** o cofre en mediano | 1 fragmento en N3 o N4; 1 en N5; 1 en N6 |
| Esquema rango 3 | Nodo grande N6 o hallazgo N7 | 1 esquema (o 2–3 fragmentos que lo completen) |

No spawnear fragmentos en N1–N2.

### Pasillos

- Destructibles con densidad baja objetivo de **≈8%** sobre tiles elegibles del pasillo. Pueden cortar temporalmente el paso y obligar a usar bombas.
- Desde N3, aproximadamente **10% del soft-cap** de recursos puede aparecer en pasillos (mínimo 1 si hay slots), principalmente bronce o hierro. Sigue contando dentro del presupuesto total; no es recurso adicional.
- Desde N3, aproximadamente **15% del presupuesto enemigo** puede aparecer en pasillos, como máximo uno por conexión.
- Los enemigos de pasillo son `golem_basic`; espíritus y golems avanzados permanecen en nodos.
- Preferencia: pelea y loot concentrados en **nodos**.

---

## Posicionamiento compacto mediante optimización

Los centros de los nodos no se colocan con dispersión aleatoria libre. Se utiliza un **problema de optimización discreta en dos dimensiones** para minimizar el espacio total ocupado sin perder la estructura del grafo.

### Variables

- `(x_i, y_i)`: centro discreto del nodo `i`.
- `r_i`: radio del nodo `i` (`8`, `17` o `25`).
- `d_ij`: separación longitudinal mínima reservada entre los bordes de los nodos.
- `w_ij`: ancho transversal del túnel (`3` o `5` tiles).
- `c_ij`: fuerza de conexión entre dos nodos conectados; `0` si no existe arista.
- `R`: medida del contenedor general que encierra nodos y túneles.

`d_ij` y `w_ij` no son la misma medida: `d_ij` separa los perímetros a lo largo del recorrido y `w_ij` define el ancho de la banda excavada perpendicular al recorrido.

Los centros se ubican sobre coordenadas enteras y favorecen alineaciones horizontales o verticales.

### Restricción de no solapamiento

Para cada par de nodos diferentes:

```math
(x_i-x_j)^2+(y_i-y_j)^2
\ge
(r_i+r_j+d_{ij})^2
\qquad \forall i,j\in N,\ i\ne j
```

Esta restricción evita que las cámaras se solapen y reserva separación para los túneles.

`d_ij` para **pares conectados** define la **longitud objetivo del pasillo** según el nodo más grande de la conexión. La variación se sortea uniformemente por arista desde la semilla:

| Nodo más grande conectado | Base | Variación | Rango de `d_ij` |
|----------------------------|-----:|----------:|-----------------:|
| Pequeño | `10` | `±5` | `5–15` |
| Mediano | `15` | `±5` | `10–20` |
| Grande | `25` | `±5` | `20–30` |

La conexión pequeño–mediano usa la regla de mediano; mediano–grande usa la de grande. Como la restricción de no-solape usa `(r_i+r_j+d_{ij})^2` como cota inferior, esa cota ya expresa la longitud objetivo: minimizar `β·D_{ij}^2` asienta los pares cerca de ella, mientras `α` compacta el contenedor global.

Para **pares no conectados** `d_ij` solo garantiza anti-solape:

| Par | `d_ij` |
|-----|--------|
| Par no conectado, ambos pequeños | `3` |
| Par no conectado, involucra mediano (sin grande) | `4` |
| Par no conectado, involucra grande | `5` |
| Mínimo absoluto anti-solape | `1` |

### Función objetivo

El objetivo minimiza simultáneamente el contenedor general y la distancia entre nodos conectados:

```math
\min \quad
\alpha R^2
+
\beta \sum_{i<j}
c_{ij}
\left[
(x_i-x_j)^2+(y_i-y_j)^2
\right]
```

- `α` controla cuánto importa compactar todo el nivel.
- `β` controla cuánto importa acercar nodos conectados.
- Una conexión con mayor `c_ij` ejerce mayor presión para mantener próximos sus nodos.
- Solapamientos, desconexiones y falta de espacio para `w_ij` son restricciones duras, no simples preferencias.

### Normalización y pesos calibrados

Para que `α` y `β` no dependan del tamaño absoluto del mapa, normalizar:

```math
D_{ij}^{2}
=
\frac{(x_i-x_j)^{2}+(y_i-y_j)^{2}}{(r_i+r_j+d_{ij})^{2}}
```

```math
\rho = R / R_{0}
```

donde `R` es la semidiagonal del AABB de nodos+túneles y `R₀` es una cota blanda:

```text
R0 = 0.55 × (suma de radios + 3 × cantidad de aristas)
```

Pesos iniciales:

| Parámetro | Valor |
|-----------|-------|
| `α` | `1.0` |
| `β` | `0.85` |
| `c_ij` arista normal | `1.0` |
| `c_ij` si alguno es mediano | `1.15` |
| `c_ij` si alguno es grande | `1.35` |
| penalización de desalineación | `+0.25` por arista no ortogonal (no H/V) |

Con esta normalización, un par colocado justo en su distancia mínima aporta ~`β·c_ij`, comparable a compactar el contenedor. La función objetivo operativa es:

```math
\min \quad \alpha\rho^{2}+\beta\sum_{i<j}c_{ij}D_{ij}^{2}+\text{penalización de desalineación}
```

### Técnica del optimizador

**Recocido simulado** sobre centros enteros:

1. Sembrar posiciones con un layout ortogonal greedy (árbol desplegado en H/V).
2. Movimientos candidatos: desplazar un nodo ±2 tiles en un eje, o rotar una arista 90° alrededor de un extremo.
3. Rechazar movimientos que violen la restricción de no solapamiento o el ancho `w_ij`.
4. Temperatura inicial alta, enfriamiento geométrico `T ← 0.95 T` cada epoch; ~200–400 epochs según cantidad de nodos.
5. Conservar la mejor solución factible encontrada.

---

## Construcción aleatoria del grafo

La topología se genera antes de optimizar las posiciones.

### Contrato

1. Crear todos los nodos exigidos por el nivel.
2. Construir un árbol de expansión aleatorio (conectividad global).
3. Añadir ciclos opcionales según el nivel (grado preferente ≤ 3 en esta fase).
4. Tras el layout, añadir **aristas de proximidad**: todo par no conectado con separación entre bordes **≤ 10** recibe un pasillo. Estas aristas **no** están limitadas por grado 3.

### Ciclos (aristas extra sobre el árbol)

Un **ciclo** es una arista añadida sobre el árbol de expansión: crea una **ruta alterna** entre nodos ya conectados.

| Nivel | Ciclos (aristas extra) |
|------:|------------------------|
| 1–2 | 0 (árbol puro) |
| 3–4 | 0–1 |
| 5–7 | 1–2 |

### Proximidad

La proximidad evita la frustración de estar al lado de una cámara sin acceso directo. Tras colocar los centros:

```text
si gap(i, j) ≤ 10 y no existe arista(i, j) → añadir pasillo(i, j)
```

---

## Muros orgánicos y conectividad

Los indestructibles se generan sin lattice.

### 1. Esqueleto protegido

Quedan libres de indestructibles: ejes cruzados de cada cámara, línea central de cada pasillo, trigger central de puerta y sus tres tiles frontales.

### 2. Ruido

- Evaluar ruido coherente sobre las casillas interiores del nodo.
- Si el valor supera el umbral (~0.62), proponer un muro orgánico.
- No cerrar casillas protegidas.

### 3. Cobertura 2×2

Recorrer cada ventana 2×2 completamente excavada. Si no contiene indestructible, insertar uno en la celda no protegida con mejor puntuación de ruido.

### 4. Flood fill y corrección

Desde el spawn: flood fill sobre vacíos. Componentes aislados se llenan o se reconectan excavando muros orgánicos. Tras cada corrección se revalida cobertura 2×2 y conectividad (tope ~8 pasadas).

Tras estabilizar, un **sellado final** vuelve a inundar desde el spawn y convierte en muro cualquier vacío que siga inaccesible (la última pasada de cobertura puede crear bolsillos nuevos). Así ningún recurso, fragmento o enemigo puede colocarse en una celda inalcanzable.

Todos los muros orgánicos pueden retirarse durante la corrección de conectividad. No existe `FIXED_WALL` de lattice.

---

## Entrada y salida

Entrada y salida ya no se representan mediante portales mágicos.

### Puertas de mina

- Son **puertas de mina de 3 tiles de ancho**.
- Su patrón local es determinista y orientable:

  ```text
  W W W   detrás de la puerta
  W T W   puerta: solo T es transitable/trigger
  . . .   frente despejado hacia la cámara
  ```

  `W` es indestructible, `T` es el centro de la puerta y `.` es vacío garantizado.
- Deben estar **pegadas al perímetro** de la cámara.
- **No pueden coincidir ni quedar adyacentes a una boca de pasillo** (intersección cámara–túnel).
- Se elige el span de perímetro con mayor separación a todas las bocas del nodo.
- Se guardan como spans o ubicaciones lógicas, no como un único punto central.
- Su orientación debe indicar qué muro ocupan: norte, sur, este u oeste.
- El jugador aparece sobre `T` en la puerta de entrada y avanza hacia los tres tiles frontales.
- La salida se ubica en un nodo lejano según distancia del grafo.
- Solo `T` activa la salida; los otros dos tiles del span son indestructibles.
- El desafío no es desbloquearla: es **explorar y encontrarla**.

Modelo de datos objetivo:

```js
entryDoor = {
  center: { x, y },
  width: 3,
  orientation: 'north',
  triggerTiles: [{ x, y }],
  sideTiles: [/* 2 indestructibles */],
  backingTiles: [/* 3 indestructibles */],
  frontTiles: [/* 3 vacíos */],
}

exitDoor = {
  center: { x, y },
  width: 3,
  orientation: 'south',
  triggerTiles: [{ x, y }],
  sideTiles: [/* 2 indestructibles */],
  backingTiles: [/* 3 indestructibles */],
  frontTiles: [/* 3 vacíos */],
}
```

### Condición de finalización

- **N1–N6:** pisar el tile central `T` de la salida completa el nivel. No hace falta matar enemigos ni recolectar un mínimo.
- **N7:** es una **carrera contra el tiempo**. Pisar `T` gana; agotar el temporizador falla el recorrido.

Atravesar la puerta de salida completa el recorrido (salvo el matiz de tiempo en N7). No reutiliza la semántica visual ni la condición de activación del portal anterior.

---

## Pipeline objetivo de generación

```text
1. Crear el grafo (árbol + ciclos) según la progresión del nivel
2. Asignar tamaño/radio a cada nodo
3. Colocar centros de forma compacta
4. Añadir aristas de proximidad (gap ≤ 10)
5. Rasterizar cámaras y túneles ortogonales de banda 3 o 5
6. Colocar puertas lejos de bocas de pasillo
7. Reservar esqueleto de conectividad
8. Generar muros orgánicos por ruido
9. Forzar cobertura: ninguna ventana excavada 2×2 sin indestructible
10. Flood fill + excavación/llenado de aislados
11. Repetir cobertura/conectividad hasta estabilizar
12. Sellado final: llenar cualquier vacío que siga inaccesible
13. Distribuir destructibles, recursos y enemigos
```

### Orden importante

La conectividad se valida **antes** de poblar el nivel y solo impone una garantía: los muros indestructibles no pueden impedir llegar desde la entrada hasta la salida.

Después de esa validación se colocan destructibles y menas. Estos **sí pueden bloquear temporalmente** pasillos y conexiones. Se preservan el trigger central y los tres tiles frontales de cada puerta; el respaldo y los laterales permanecen indestructibles.

### Semilla

Se genera una **semilla nueva en cada entrada al nivel** (no se guarda ni se reutiliza entre intentos): reintentar un nivel produce un mapa distinto. El pipeline sigue siendo determinista respecto a esa semilla —el mismo `seed` reconstruye grafo, grid y contenido idénticos—, lo que permite depurar y reproducir un layout puntual pasando la semilla a mano.

---

## Invariantes que debe probar el generador

1. Todos los nodos del grafo son alcanzables desde la entrada al considerar rompibles como excavables.
2. Existe al menos una ruta entre entrada y salida que no exige retirar indestructibles.
3. Las puertas no tocan bocas y cumplen `WWW / WTW / ...` según su orientación.
4. El jugador surge sobre el trigger de entrada y tiene tres tiles frontales vacíos.
5. Ningún enemigo aparece sobre una puerta, un muro o el jugador.
6. Ningún recurso obligatorio queda en una región inaccesible tras retirar rompibles.
7. Los pasillos mantienen bandas de 3 o 5 tiles.
8. Ninguna ventana excavada 2×2 carece de indestructible.
9. Un mismo `seed` produce el mismo grafo, grid y contenido.
10. La distancia entre nodos del árbol/ciclos respeta radios y `d_ij` objetivo.
11. Todo nodo grande se conecta mediante al menos un túnel de banda 5.
12. Solo el trigger central de la salida completa el nivel.
13. Antes de poblar con rompibles, todos los tiles caminables conservados pertenecen al componente alcanzable desde la entrada.
14. Todo par de nodos con separación entre bordes ≤ 10 tiene arista.
15. El grafo final permanece conectado (el grado puede superar 3 por proximidad).

---

## Valores calibrados (simulaciones)

Simulaciones rápidas en Python (ruido value/Perlin simplificado + packing ortogonal greedy) para fijar defaults. Revalidar en runtime cuando exista el generador real.

### Ruido y umbral

Objetivo: laberinto ligero ≈ **18–22%** de las casillas caminables del nodo convertidas en indestructibles orgánicos (sin contar el esqueleto protegido).

| Tamaño | Escala | Umbral | Densidad media observada |
|--------|--------|--------|--------------------------|
| Pequeño (`r=8`) | `5` | `0.62` | ≈ 0.18 |
| Mediano (`r=17`) | `8` | `0.62` | ≈ 0.20 |
| Grande (`r=25`) | `11` | `0.62` | ≈ 0.21 |

Octavas: `3`. Tras el ruido, la cobertura correctiva garantiza que ninguna ventana excavada 2×2 quede sin indestructible.

### Corrección de aislados

| Regla | Valor |
|-------|-------|
| Llenar (opción A) | componente aislado con **≤ 4** tiles y sin contenido obligatorio |
| Excavar (opción B) | componente **> 4** tiles, o cualquier aislado con spawn/recurso/puerta |
| Tope de seguridad | si tras 8 correcciones siguen aislados, llenar el resto |

Con esos parámetros, la mayoría de bolsillos miden 1–3 tiles (llenar). Por nodo suele haber **< 1 excavación** en promedio.

### Tamaño de mapa esperado

El AABB ya no es fijo. Orden de magnitud con packing ortogonal compacto (mediana de 30 semillas; incluye entrada pequeña):

| Nivel | AABB aproximado (tiles) |
|------:|-------------------------|
| 1 | ~46×25 |
| 2 | ~53×53 |
| 3–4 | ~98×95 |
| 5 | ~105×106 |
| 6 | ~121×148 |
| 7 | ~165×168 |

Usarlos solo como expectativa de cámara/scroll, no como constantes hardcodeadas.

### Puertas (primitivos temporales)

| Elemento | Representación |
|----------|----------------|
| Respaldo | 3 tiles `WALL` |
| Span | `WALL`, trigger central, `WALL` |
| Frente | 3 tiles `EMPTY` |
| Marco | trazo `0xb08d57` alrededor del span |
| Entrada | trigger tintado `0x3c8991` |
| Salida | trigger tintado `0xffc857` |
| Trigger | pisar únicamente el tile central → completar nivel |


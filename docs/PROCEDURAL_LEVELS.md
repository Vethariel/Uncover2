# Uncover — Diseño de niveles procedurales

> Contrato de diseño para la generación de minas. Reglas generales de gameplay: [`DESIGN.md`](./DESIGN.md).  
> **Estado:** diseño objetivo; el generador actual todavía usa un rectángulo con lattice completo y debe migrarse a este modelo.

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

## Regla invariable: grid de indestructibles

El patrón base de **muros/columnas indestructibles siempre permanece** dentro de las zonas excavadas.

- Los indestructibles se organizan en una grilla regular.
- Entre dos columnas consecutivas queda **un tile de separación**.
- Los pasillos y nodos no eliminan el lattice para convertirse en superficies completamente abiertas.
- La forma orgánica surge de dónde se excava el nivel, no de abandonar la regla de grilla.

Patrón conceptual:

```text
W . W . W
. . . . .
W . W . W
. . . . .
W . W . W
```

`W` = indestructible fijo.  
`.` = casilla disponible para circulación, destructible u otro contenido permitido.

---

## Pasillos

Un pasillo es una **banda excavada de 3 o 5 tiles de ancho**, pero no una avenida con 3 o 5 tiles libres.

### Contrato

- Ancho exterior de túnel: **3 o 5 tiles**.
- Ancho de cada canal de circulación entre columnas: **1 tile caminable**.
- El grid de indestructibles continúa dentro del túnel.
- Las columnas del lattice producen el ritmo visual y estructural del pasillo.
- Los túneles conectan nodos mediante tramos ortogonales sobre el grid.

Esquema conceptual de una banda con columnas:

```text
W . W . W . W
. . . . . . .
W . W . W . W
```

El valor 3 o 5 describe la **banda total excavada**. La circulación efectiva sucede en los espacios de un tile definidos por el lattice.

### Uso de anchos

- **3 tiles:** conexión estándar, más contenida y tensa.
- **5 tiles:** conexión usada para llegar a los **nodos grandes**.

Los pasillos favorecen trazados **horizontales o verticales**. Pueden cambiar de eje mediante codos y pueden cruzarse; los cruces ayudan a crear conexiones emergentes entre partes del grafo.

---

## Nodos o cámaras

Los nodos son regiones aproximadamente circulares o elípticas rasterizadas al grid. No necesitan formar círculos perfectos.

### Reglas

1. El lattice de indestructibles sigue presente dentro de la cámara.
2. Se añaden **algunos indestructibles adicionales** para romper la lectura repetitiva de grilla.
3. Estos muros extra forman un **laberinto ligero**, nunca una cámara saturada.
4. Deben permanecer varias rutas legibles entre las conexiones del nodo.
5. Los nodos concentran recursos, encuentros y elementos de interés.

Los indestructibles adicionales pueden extender o conectar partes del patrón base, pero deben conservar pasajes de un tile y no producir zonas inaccesibles.

### Tipos iniciales

| Nodo | Función |
|------|---------|
| Entrada | Pequeño, seguro y legible; introduce el nivel |
| Recurso | Cámara con vetas o materiales y riesgo asociado |
| Encuentro | Espacio para enemigos y uso táctico de bombas |
| Conector | Nodo pequeño que ramifica o cambia dirección |
| Salida | Cámara lejana que contiene la puerta de salida |

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

Los tamaños se expresarán mediante un radio de nodo. Como referencia inicial para el optimizador:

| Tamaño | Radio |
|--------|-------|
| Pequeño | `r = 7` tiles |
| Mediano | `r = 14` tiles |
| Grande | `r = 21` tiles; sus conexiones usan pasillos de banda 5 |

Estos radios implican diámetros aproximados de 15, 29 y 43 tiles al rasterizar el centro. Por tanto, el tamaño final del mapa ya no puede fijarse de antemano en 45×33: debe derivarse del contenedor obtenido por el optimizador, más un margen exterior.

---

## Enemigos, recursos y presupuesto

Contrato económico global (techos de craft, smelting, recetas): [`CRAFTING.md`](./CRAFTING.md). Aquí la **colocación espacial** y el roster Mov. I.

### Roster Mov. I (solo tres tipos)

| ID | Nombre | Comportamiento |
|----|--------|----------------|
| `golem_basic` | Golem básico (descompuesto) | Patrulla. **Huye** de bombas / blast inminente. |
| `spirit` | Espíritu | Pacífico hasta que una bomba **explota cerca**; entonces se enfurece. **Atraviesa destructibles** (no muros fijos). |
| `golem_advanced` | Golem avanzado | **Persigue** al jugador. Amenaza activa. |

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

| Rol | Enfoque | Contenido típico |
|-----|---------|------------------|
| **Veta** | Recursos | Menas del material asignado; 0–1 golem básico (desde N3) |
| **Guarida** | Enemigos | Poca o ninguna mena; varios golems / espíritus |
| **Mixta** | Ambos | Menas + 1–2 enemigos; tensión pico vs pelea |
| **Reliquia** | Receta / lore | Fragmento de receta; guardián opcional (espíritu o golem) |
| **Ágora** | Tránsito | Casi vacío; cruza pasillos; sin enemigos o 1 golem básico |

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

- Sin menas (salvo rareza narrativa).
- Sin enemigos en pasillos cortos; en pasillos largos (≥12 tiles de canal), como máximo **1 `golem_basic`** (N3+) a mitad de camino.
- Espíritus y golems avanzados viven en **nodos**, no en túneles.
- Preferencia: pelea y loot concentrados en **nodos**.

---

## Posicionamiento compacto mediante optimización

Los centros de los nodos no se colocan con dispersión aleatoria libre. Se utiliza un **problema de optimización discreta en dos dimensiones** para minimizar el espacio total ocupado sin perder la estructura del grafo.

### Variables

- `(x_i, y_i)`: centro discreto del nodo `i`.
- `r_i`: radio del nodo `i` (`7`, `14` o `21`).
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

Valores iniciales de `d_ij` (separación libre entre bordes):

| Par | `d_ij` |
|-----|--------|
| Ambos pequeños | `3` |
| Involucra mediano (sin grande) | `4` |
| Involucra grande | `5` |
| Par no conectado | `1` (solo anti-solape con margen mínimo) |

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
2. Movimientos candidatos: desplazar un nodo ±2 tiles en un eje (mantiene paridad útil para el lattice), o rotar una arista 90° alrededor de un extremo.
3. Rechazar movimientos que violen la restricción de no solapamiento o el ancho `w_ij`.
4. Temperatura inicial alta, enfriamiento geométrico `T ← 0.95 T` cada epoch; ~200–400 epochs según cantidad de nodos.
5. Conservar la mejor solución factible encontrada.

---

## Construcción aleatoria del grafo

La topología se genera antes de optimizar las posiciones.

### Contrato

1. Crear todos los nodos exigidos por el nivel.
2. Garantizar inicialmente que forman un único componente conectado.
3. Aleatorizar las conexiones.
4. Podar aristas mientras el grafo siga conectado.
5. Terminar con entre **1 y 3 conexiones por nodo**, siempre que la cantidad de nodos lo permita.

Para evitar el coste de construir y podar un grafo completo, la implementación puede producir el mismo resultado de forma equivalente:

1. Construir un árbol de expansión aleatorio, que garantiza conectividad.
2. Añadir algunas aristas aleatorias para formar ciclos.
3. No superar grado `3` en ningún nodo.

La segunda forma es preferible computacionalmente. Ambas deben producir un grafo conectado con grado objetivo entre 1 y 3.

Las fuerzas `c_ij` solo existen para las aristas finales. Después de decidir el grafo, el optimizador coloca sus nodos.

---

## Muros adicionales mediante ruido y conectividad

Los muros indestructibles extra de cada cámara se generan con ruido coherente, sin reemplazar ni eliminar el lattice fijo.

### 1. Máscara de ruido

- Evaluar ruido Perlin sobre las casillas interiores del nodo.
- Si el valor supera el umbral calibrado (ver abajo), colocar un muro adicional.
- Los pilares fijos del lattice siempre permanecen.
- Puertas, conexiones de pasillos y casillas reservadas no pueden cerrarse.

Es útil distinguir dos clases durante la generación:

```text
FIXED_WALL   = pilar permanente del lattice
EXTRA_WALL   = muro creado por ruido; puede corregirse
```

Ambos terminan siendo indestructibles en gameplay, pero solo `EXTRA_WALL` puede retirarse durante la validación.

### 2. Flood fill

Elegir como origen una casilla caminable garantizada —preferiblemente la entrada del nodo— y ejecutar flood fill sobre sus casillas transitables.

Las casillas vacías no visitadas pertenecen a componentes aislados.

### 3. Corrección

Para cada componente aislado:

- **Opción A — llenado:** si tiene **≤ 4** tiles y no contiene contenido obligatorio, convertirlo en muro.
- **Opción B — excavación:** si tiene **> 4** tiles, o contiene spawn/recurso/puerta, conectarlo con la región principal eliminando `EXTRA_WALL`.

La excavación no puede destruir `FIXED_WALL`. Si una línea recta cruza un pilar fijo, debe desviarse mediante BFS/A* buscando una ruta que minimice muros extra retirados. Así se conserva siempre la grilla de indestructibles.

Después de cada corrección se repite el flood fill hasta que no queden componentes caminables aislados. Fail-safe: si tras 8 iteraciones siguen aislados, llenar el resto.

---

## Entrada y salida

Entrada y salida ya no se representan mediante portales mágicos.

### Puertas de mina

- Son **puertas de mina de 3 tiles de ancho**.
- Deben estar **pegadas a un muro** de la cámara.
- Se guardan como spans o ubicaciones lógicas, no como un único punto central.
- Su orientación debe indicar qué muro ocupan: norte, sur, este u oeste.
- El jugador aparece dentro del nodo de entrada, frente a la puerta.
- La salida se ubica en un nodo lejano según distancia del grafo.
- La puerta de salida está **siempre abierta**.
- El desafío no es desbloquearla: es **explorar y encontrarla**.

Modelo de datos objetivo:

```js
entryDoor = {
  x,
  y,
  width: 3,
  orientation: 'north',
}

exitDoor = {
  x,
  y,
  width: 3,
  orientation: 'south',
}
```

Atravesar la puerta de salida completa el recorrido. No reutiliza la semántica visual ni la condición de activación del portal anterior.

---

## Pipeline objetivo de generación

```text
1. Crear el grafo según la progresión del nivel
2. Asignar tamaño/radio a cada nodo
3. Optimizar las posiciones de sus centros para minimizar el espacio ocupado
4. Conectar nodos con túneles ortogonales de banda 3 o 5
5. Rasterizar la silueta excavada
6. Aplicar siempre el lattice de indestructibles
7. Colocar puertas de entrada/salida y reservar conexiones críticas
8. Generar `EXTRA_WALL` mediante ruido Perlin dentro de nodos
9. Ejecutar flood fill desde la entrada
10. Llenar o excavar componentes aislados sin retirar `FIXED_WALL`
11. Repetir la validación hasta garantizar conectividad
12. Distribuir destructibles, recursos y enemigos
```

### Orden importante

La conectividad se valida **antes** de poblar el nivel. Los destructibles y recursos no pueden invalidar:

- La salida del nodo de entrada.
- La llegada a cada puerta.
- Las conexiones del grafo.
- Una ruta válida entre entrada y salida.

---

## Invariantes que debe probar el generador

1. Todos los nodos del grafo son alcanzables desde la entrada.
2. Existe al menos una ruta entre entrada y salida.
3. Las puertas ocupan exactamente 3 tiles y están adyacentes a un muro.
4. El nodo de entrada permite movimiento inicial.
5. Ningún enemigo aparece sobre una puerta, un muro o el jugador.
6. Ningún recurso obligatorio queda en una región inaccesible.
7. Los pasillos mantienen bandas de 3 o 5 tiles y canales caminables de 1 tile entre columnas.
8. Los muros adicionales de los nodos no cortan todas las rutas internas.
9. Un mismo `seed` produce el mismo grafo, grid y contenido.
10. La distancia entre nodos respeta sus radios y la longitud mínima del pasillo.
11. Todo nodo grande se conecta mediante al menos un túnel de banda 5.
12. La puerta de salida está abierta y puede atravesarse desde el inicio si el jugador la encuentra.
13. Todos los tiles caminables conservados pertenecen al componente alcanzable desde la entrada.
14. Ningún proceso de corrección elimina un `FIXED_WALL` del lattice.
15. El grafo final permanece conectado y cada nodo tiene entre 1 y 3 aristas.

---

## Valores calibrados (simulaciones)

Simulaciones rápidas en Python (ruido value/Perlin simplificado + packing ortogonal greedy) para fijar defaults. Revalidar en runtime cuando exista el generador real.

### Ruido y umbral

Objetivo: laberinto ligero ≈ **18–22%** de las casillas caminables del nodo convertidas en `EXTRA_WALL` (sin contar pilares fijos).

| Tamaño | Escala Perlin | Umbral | Densidad media observada |
|--------|---------------|--------|--------------------------|
| Pequeño (`r=7`) | `5` | `0.62` | ≈ 0.18 |
| Mediano (`r=14`) | `8` | `0.62` | ≈ 0.20 |
| Grande (`r=21`) | `11` | `0.62` | ≈ 0.21 |

Octavas: `3`. El umbral único `0.62` mantiene densidad similar al crecer el nodo; la escala crece con el radio para que los bloques de muro no se vean como ruido de 1 tile.

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
| 1 | ~35×18 |
| 2 | ~70×20 |
| 3–4 | ~110×35 |
| 5 | ~160×35 |
| 6 | ~215×50 |
| 7 | ~255×50 |

Usarlos solo como expectativa de cámara/scroll, no como constantes hardcodeadas.

### Puertas (primitivos temporales)

| Elemento | Representación |
|----------|----------------|
| Hueco | 3 tiles `EMPTY` alineados en el muro |
| Marco | trazo `0xb08d57` (bronce) alrededor del span |
| Entrada | vano tintado `0x3c8991` |
| Salida | vano tintado `0xffc857` (siempre transitable) |
| Trigger | pisar cualquiera de los 3 tiles de salida → completar nivel |


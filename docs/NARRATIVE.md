# Uncover — Narrative Design v1.6

> Contrato narrativo del juego. Fundamentos culturales en [`CULTURAL_FOUNDATION.md`](./CULTURAL_FOUNDATION.md). Especificaciones por movimiento: [`MOVEMENT_I.md`](./MOVEMENT_I.md) · [`MOVEMENT_II.md`](./MOVEMENT_II.md) · [`MOVEMENT_III.md`](./MOVEMENT_III.md) · [`MOVEMENT_IV.md`](./MOVEMENT_IV.md) · [`MOVEMENT_V.md`](./MOVEMENT_V.md). Las reglas de gameplay y la matriz tile-based viven en [`DESIGN.md`](./DESIGN.md).

## Filosofía

Uncover presenta un mundo fantástico que debe sostenerse por sí mismo. El jugador explora un antiguo reino subterráneo habitado por enanos, espíritus, guardianes y criaturas de la montaña.

La narrativa nunca explica una verdad absoluta.

Las decisiones no representan bien o mal, sino distintas maneras de interpretar el mundo.

Cada interpretación modifica la identidad del reino: su arquitectura, habitantes, recursos, mecánicas y guardianes.

Las decisiones del Primer Eje no transforman al protagonista.

Transforman la manera en que el reino se manifiesta.

A partir del Segundo Eje, el viaje también comienza a revelar al viajero: cómo enfrenta la incertidumbre cuando el camino deja de ser evidente.

El juego **no** trata sobre recuperar quién era el protagonista. El protagonista no busca una verdad perdida sobre sí mismo.

Sus referencias internas — comentarios, comparaciones, asociaciones espontáneas ante lo extraño — muestran que interpreta el reino desde **otra cultura**: el reino es real para sus habitantes, pero una experiencia extraordinaria para quien llegó desde otro contexto.

El pasado del protagonista nunca se establece como hecho absoluto. El juego no confirma el origen del viaje.

---

## Estructura general

El juego está dividido en cinco movimientos.

Los movimientos **I–IV** siguen una estructura tradicional:

- Niveles 1–6: exploración y desarrollo.
- Nivel 7: encuentro con el Guardián del movimiento.

**La Forja** (Movimiento V) posee una estructura diferente porque representa la conclusión:

| Nivel | Contenido |
| ----- | --------- |
| 1–4 | Recapitulación del viaje (Minas → Reino → Ruinas → Corazón) |
| 5 | **La Última Forja** — sacrificio (Tercer Eje) |
| 6 | **El Último Guardián** — prueba según la renuncia |
| 7 | **El Final** — desenlace o epílogo |

Especificación detallada: [`MOVEMENT_V.md`](./MOVEMENT_V.md).

La excepción es intencional.

El recorrido se organiza como un **descenso hacia el interior de la montaña** y, simultáneamente, como un **viaje de comprensión** del protagonista.

| Movimiento | Espacio | Propósito |
| ---------- | ------- | --------- |
| I | **Las Minas** | Aprender a sobrevivir y comprender las reglas del mundo |
| II | **El Reino** | Descubrir la naturaleza del mundo mediante el Primer Eje |
| III | **Las Ruinas** | Recorrer la incertidumbre según el método elegido (Segundo Eje) |
| IV | **El Corazón** | Integrar la interpretación del mundo y el método del viajero |
| V | **La Forja** | Definir qué parte del viaje permanece mediante el sacrificio final |

Los movimientos siguen una composición fija:

| Movimiento | Variantes | Función |
| ---------- | --------: | ------- |
| I | 1 | Presentación del mundo y de las mecánicas. |
| II | 3 | Primera interpretación del mundo (Primer Eje). |
| III | 2 | Las Ruinas del Viajero — el método ante la incertidumbre (Segundo Eje). |
| IV | 1 | El Corazón — convergencia de interpretación y método. |
| V | — | La Forja — Coda: recapitulación, sacrificio y desenlace (Tercer Eje). |

Variaciones de recorrido durante el viaje:

**3 × 2 = 6** identidades del reino (doctrina × método).

El Tercer Eje **no se elige directamente**: surge como consecuencia de la Última Forja y determina el camino revelado — **Raíces**, **Camino de la Forja** (epílogo) u **Horizonte**.

### Distinción de La Forja

| Término | Qué es |
| ------- | ------ |
| **La Forja** | Espacio del Movimiento V; lugar donde culmina el viaje |
| **La Última Forja** | Evento central en el Nivel 5: ritual donde el jugador desmonta mejoras y define qué conserva |
| **Camino de la Forja** | Desenlace posible: renuncia incompleta, transformación aún abierta — **epílogo jugable** |

### Distinción del Umbral

El **umbral** no es solo una ubicación. Es un concepto simbólico:

> El punto donde una decisión transforma al viajero.

Dentro de La Forja existe un elemento físico: el **Portal del Umbral**, la puerta final hacia los desenlaces principales.

Cuando se indica que *"el Portal del Umbral permanece cerrado"*, significa que aún no reconoce una decisión definitiva del viajero.

Los dos desenlaces completos (Raíces y Horizonte) combinados con las seis identidades del reino producen **12 desenlaces** — doce maneras en que el reino recuerda al viajero antes de despedirse, no doce finales distintos en significado.

El **Camino de la Forja** queda fuera de esos doce: es un **epílogo jugable**, no un cierre incompleto.

### Elección de los tres ejes

| Eje | Cuándo | Cómo |
| --- | ------ | ---- |
| **Primer Eje** | Al finalizar el Movimiento I | El jugador elige una interpretación del mundo. **Irreversible.** Parametriza el Movimiento II y el resto del viaje. |
| **Segundo Eje** | Al finalizar el Movimiento II | El jugador elige Buscar o Crear. **Irreversible.** Parametriza Las Ruinas (Mov. III) y el resto del viaje. |
| **Tercer Eje** | Tras la Última Forja (Mov. V, Nivel 5) | No se elige directamente; emerge del sacrificio. Pregunta: *¿Qué estás dispuesto a dejar atrás para continuar?* |

### Parametrización de contenido

| Movimiento | Producción |
| ---------- | ---------- |
| II — El Reino | Un territorio base con **tres interpretaciones** (doctrinas), activadas por la elección al final del Mov. I |
| III — Las Ruinas | Un territorio base con **dos métodos** de interacción (Buscar / Crear), activados por la elección al final del Mov. II |
| IV — El Corazón | Un territorio base con **seis combinaciones** (3 × 2) |
| V — La Forja | Un territorio final con **tres desenlaces** (Raíces / Forja / Horizonte) |

Estas interpretaciones reutilizan los mismos movimientos mediante variaciones de biomas, guardianes, enemigos, recursos y reglas.

---

## Movimiento I — La Iniciación *(Las Minas)*

> Especificación detallada: [`MOVEMENT_I.md`](./MOVEMENT_I.md).

### Objetivo

Introducir al jugador al reino subterráneo.

Todos los jugadores viven exactamente el mismo recorrido.

Aquí se enseñan:

- Movimiento
- Bombas
- Enemigos
- Recursos
- Fabricación
- Guardianes

### Bioma — Las Minas

**Las Minas Fundacionales.**

Una ciudad minera activa.

Todo transmite estabilidad, trabajo y prosperidad.

### Guardián

**El Primer Excavador.**

Su función es comprobar que el jugador comprende las mecánicas básicas.

Al derrotarlo no muere.

Reconoce que el jugador puede continuar.

Abre **tres portales** — uno por cada doctrina: La Piedra, El Eco y La Llama.

La elección del Primer Eje ocurre **aquí**, al finalizar el Movimiento I. Es **irreversible** y determina cómo se manifestará El Reino en el Movimiento II.

---

## Doctrinas del reino

Las doctrinas representan distintas maneras de comprender la montaña.

No son religiones.

No son facciones.

No representan bien o mal.

Cada doctrina propone una interpretación diferente de un mismo mundo.

Cuando el jugador elige una doctrina, el reino comienza a responder bajo esa filosofía.

La elección afecta simultáneamente:

- Arquitectura
- Bioma
- Guardianes
- Criaturas
- Recursos
- Música
- Mecánicas
- Narrativa ambiental

La modificación nunca debe sentirse artificial.

El jugador nunca cambia de universo.

Es el propio reino quien responde a la mirada del viajero.

Esta regla constituye uno de los principios fundamentales de Uncover.

Las tres doctrinas actuales *(nombres provisionales)* son **La Piedra**, **El Eco** y **La Llama**.

---

## Los tres ejes del viaje

El viaje de Uncover se construye sobre tres preguntas fundamentales.

Cada una responde a una dimensión distinta de la experiencia.

### Primer Eje — La interpretación

**¿Cómo comprendes el mundo?**

El jugador elige una de las tres grandes interpretaciones del reino **al finalizar el Movimiento I** (tras El Primer Excavador).

La respuesta modifica la identidad del mundo a partir del **Movimiento II**.

### Segundo Eje — El método

**¿Cómo continúas cuando el camino deja de ser evidente?**

El jugador elige Buscar o Crear **al finalizar el Movimiento II** (tras su Guardián).

La respuesta no cambia la naturaleza del reino.

Se manifiesta plenamente a partir de **Las Ruinas** (Movimiento III) y prepara la convergencia de El Corazón.

### Tercer Eje — La renuncia

**¿Qué estás dispuesto a dejar atrás para cruzar el último umbral?**

El jugador redefine el significado de todo su recorrido.

---

## Primer Eje

### Pregunta

**¿Cómo comprendes el mundo?**

*(También formulada como: ¿Qué guía tus pasos?)*

Este eje determina la filosofía dominante del recorrido.

Se decide **al finalizar el Movimiento I**. A partir del Movimiento II, el reino responde bajo la doctrina elegida.

Existen tres doctrinas *(nombres provisionales)*:

- **La Piedra**
- **El Eco**
- **La Llama**

---

### Doctrina I — La Piedra

#### Principio

La montaña puede comprenderse.

Existe un orden natural.

Todo posee una función.

La estabilidad es una virtud.

#### Identidad visual

- Arquitectura monumental.
- Construcciones simétricas.
- Grandes columnas.
- Canteras.
- Mecanismos.
- Ingeniería.

#### Recursos predominantes

- Hierro.
- Basalto.
- Acero.
- Piedra tallada.

#### Criaturas

- Golems.
- Constructores.
- Guardianes pétreos.
- Autómatas.

#### Mecánicas

- Mapas más estructurados.
- Patrullas previsibles.
- Menor cantidad de trampas.
- Mayor iluminación.
- Mayor importancia del posicionamiento.

#### Guardián

No protege un objeto.

Protege el conocimiento necesario para construir.

Su combate recompensa aprender patrones.

#### Filosofía del combate

El jugador vence comprendiendo.

No improvisando.

---

### Doctrina II — El Eco

#### Principio

La montaña nunca revela todos sus secretos.

Escuchar es más importante que dominar.

Comprender requiere paciencia.

#### Identidad visual

- Cristales.
- Niebla.
- Ecos.
- Agua.
- Ruinas erosionadas.

#### Recursos predominantes

- Cristales.
- Esencias.
- Minerales resonantes.

#### Criaturas

- Espíritus.
- Ecos.
- Guardianes etéreos.
- Habitantes invisibles.

#### Mecánicas

- Oscuridad.
- Sonido.
- Caminos ocultos.
- Eventos dinámicos.
- Información incompleta.

#### Guardián

No enfrenta directamente al jugador.

El combate gira alrededor de observar el escenario.

#### Filosofía del combate

El jugador vence interpretando.

No reaccionando por fuerza.

---

### Doctrina III — La Llama

#### Principio

Nada permanece inmóvil.

Toda creación nace de la transformación.

La montaña también está viva.

#### Identidad visual

- Lava.
- Forjas.
- Roca fundida.
- Vegetación invasiva.
- Derrumbes.

#### Recursos predominantes

- Carbón vivo.
- Obsidiana.
- Núcleos ígneos.
- Minerales inestables.

#### Criaturas

- Bestias minerales.
- Insectos.
- Golems fundidos.
- Seres nacidos del magma.

#### Mecánicas

- Escenarios cambiantes.
- Destrucción dinámica.
- Nuevos caminos.
- Derrumbes.
- Riesgo constante.

#### Guardián

El escenario forma parte del combate.

El jefe nunca permanece igual.

#### Filosofía del combate

El jugador vence adaptándose.

No memorizando.

---

## Movimiento II — Primera Interpretación *(El Reino)*

> Especificación detallada: [`MOVEMENT_II.md`](./MOVEMENT_II.md). Variantes: [Variante — La Piedra](./MOVEMENT_II.md#variante--el-reino-de-la-piedra), [Variante — El Eco](./MOVEMENT_II.md#variante--el-reino-del-eco), [Variante — La Llama](./MOVEMENT_II.md#variante--el-reino-de-la-llama).

Representa la primera gran transformación del mundo.

Existe un **territorio base**: **El Reino**.

La doctrina elegida al final del Movimiento I determina cuál de las **tres interpretaciones** se manifiesta durante todo este movimiento.

Cada doctrina posee:

- identidad visual propia
- criaturas propias
- recursos predominantes
- mecánicas específicas
- un Guardián diferente

El Movimiento II responde: **¿Qué naturaleza tiene este mundo?**

El jugador **vive** la doctrina elegida al final del Movimiento I durante todo este movimiento.

**Al finalizar el Movimiento II** (incluido su Guardián), el jugador elige irreversiblemente **Buscar** o **Crear** — el Segundo Eje. Esa decisión determina cómo se manifestará Las Ruinas en el Movimiento III.

Tras ello el jugador avanza hacia **Las Ruinas**.

---

## Segundo Eje

El Segundo Eje representa el **método** con el que el viajero enfrenta la incertidumbre.

No es una actitud frente al mundo.

Es la forma en que decide continuar cuando el camino deja de ser evidente.

### Propósito narrativo

El Segundo Eje representa el momento en que el viaje deja de hablar exclusivamente del mundo.

A partir de este punto comienza a revelar al propio protagonista.

Las dificultades ya no se interpretan únicamente como obstáculos de exploración.

Se convierten en oportunidades para expresar la manera en que el viajero responde ante la incertidumbre.

Este eje no cambia la doctrina.

No sustituye la interpretación elegida en el Primer Eje.

La complementa.

Se decide **al finalizar el Movimiento II**. A partir de Las Ruinas (Movimiento III), el reino responde según el método elegido.

Es **irreversible**.

Comienza a manifestarse plenamente en el **Movimiento III** y prepara la convergencia de El Corazón.

### Pregunta

Cuando el camino desaparece...

**¿Cómo decides continuar?**

No existen respuestas correctas.

Ambos caminos representan formas legítimas de enfrentar la incertidumbre.

La diferencia radica únicamente en la filosofía con la que el jugador afronta los desafíos.

---

### Buscar *(Camino del Buscador)*

El viajero cree que las respuestas existen.

Si algo está perdido, debe ser encontrado.

Si algo está oculto, debe ser descubierto.

#### Filosofía

La verdad se descubre.

No se fabrica.

---

### Crear *(Camino del Constructor)*

El viajero acepta que algunas respuestas no existen todavía.

Si el camino no aparece, debe crearlo.

#### Filosofía

El camino aparece gracias a las acciones del viajero.

---

### Relación con el Primer Eje

El Primer Eje define la interpretación del reino.

El Segundo Eje define la forma en que el protagonista decide recorrer esa interpretación.

Ambos ejes son completamente independientes.

Un mismo reino puede explorarse mediante distintos métodos.

Por ello, el Movimiento IV representa la convergencia entre una cosmovisión y un método.

### Principio de diseño

El Segundo Eje nunca debe juzgar la personalidad del jugador.

No representa prudencia frente a valentía, ni inteligencia frente a fuerza.

Representa únicamente dos maneras legítimas de afrontar un problema cuando no existe una respuesta evidente.

---

## Movimiento III — Las Ruinas del Viajero

> Especificación detallada: [`MOVEMENT_III.md`](./MOVEMENT_III.md). Variantes: [Variante — Buscador](./MOVEMENT_III.md#variante--las-ruinas-del-buscador), [Variante — Constructor](./MOVEMENT_III.md#variante--las-ruinas-del-constructor).

### Función

El Movimiento II responde:

> **¿Qué naturaleza tiene este mundo?**

El jugador ya eligió su interpretación al finalizar el Movimiento I (Primer Eje) y la vivió en El Reino.

Al **finalizar el Movimiento II** eligió también su método: Buscar o Crear (Segundo Eje).

El Movimiento III responde una pregunta diferente en clave de **experiencia**, no de elección:

> **¿Cómo se siente avanzar cuando aquello que conocías ya no puede guiarte?**

El Segundo Eje no representa una nueva interpretación del mundo.

Representa la forma en que el viajero enfrenta la incertidumbre — ya elegida; aquí se **vive**.

**En Las Ruinas el jugador recorre el territorio según el método elegido al final del Movimiento II.**

Las Ruinas mantienen un **único territorio base**.

No existen dos mapas separados para Buscar y Crear.

La diferencia está en la **interacción** del jugador con el espacio.

Movimiento II define la relación del jugador con el reino.

Movimiento III define la relación del jugador con los problemas.

La primera pregunta es: *¿Qué es este mundo?*

La segunda pregunta es: *¿Qué haces cuando este mundo no te da una respuesta?*

### Las Ruinas

El Movimiento III ocurre en un territorio independiente: **Las Ruinas**.

No pertenecen completamente a ninguna doctrina.

No representan la permanencia de La Piedra, la resonancia de El Eco ni la transformación de La Llama.

Son un lugar anterior.

Un espacio donde diferentes habitantes dejaron rastros de sus intentos por comprender la montaña.

#### Identidad del bioma

Las Ruinas son un territorio de restos y posibilidades.

El jugador encuentra:

- estructuras incompletas;
- caminos destruidos;
- mecanismos antiguos;
- símbolos sin interpretación;
- herramientas abandonadas;
- espacios que parecen haber tenido distintos usos.

Nada indica una única respuesta.

El significado depende de cómo el jugador decide recorrerlas.

#### Relación con el Movimiento II

Las Ruinas no reemplazan la interpretación obtenida anteriormente.

La recuerdan.

Sin embargo, esa influencia debe permanecer **mínima**.

El objetivo es que el jugador sienta que ha llegado a un lugar nuevo.

La doctrina anterior aparece únicamente como pequeños rastros:

- materiales similares;
- símbolos antiguos;
- ecos arquitectónicos;
- criaturas relacionadas.

Pero Las Ruinas poseen una identidad propia.

### Camino del Buscador *(Buscar)*

El viajero interpreta las ruinas como algo que debe **comprender**.

#### Manifestación en Las Ruinas

El jugador interpreta el territorio como un **archivo**.

Las ruinas contienen información esperando ser recuperada.

#### Progresión

- Exploración.
- Caminos ocultos.
- Descubrimiento.
- Interpretación ambiental.

#### Sensación del jugador

El mundo parece tener una historia escrita.

El objetivo es descubrirla.

### Camino del Constructor *(Crear)*

El viajero interpreta las ruinas como algo que puede **transformar**.

#### Manifestación en Las Ruinas

El jugador interpreta el territorio como **material**.

Las estructuras abandonadas no son solamente recuerdos.

Son recursos para construir algo nuevo.

#### Progresión

- Modificación del escenario.
- Construcción.
- Activación de mecanismos.
- Resolución creativa.

#### Sensación del jugador

El mundo no entrega una respuesta.

El jugador participa en su creación.

### Música del Movimiento III

El Movimiento II posee un tema asociado a la identidad del reino.

El Movimiento III posee un tema asociado al **viajero**.

La música debe sentirse menos monumental y más íntima.

#### Buscador

- Melodías incompletas.
- Pausas.
- Sonidos lejanos.
- Sensación de descubrimiento.

La música parece una pregunta.

#### Constructor

- Capas progresivas.
- Ritmos mecánicos.
- Patrones que se agregan.

La música parece una construcción.

### Principio de diseño

Movimiento II muestra al jugador el mundo.

Movimiento III muestra al jugador a sí mismo.

Movimiento IV muestra la interacción entre ambos.

Las Ruinas existen para recordar que ningún viajero recibe un camino completo.

La identidad no surge únicamente de aquello que encuentra.

También surge de la manera en que decide avanzar cuando ya no hay una ruta marcada.

Al finalizar, el reino ya no solo refleja una interpretación del mundo.

También comienza a reflejar el carácter del viajero que lo atraviesa.

---

## Movimiento IV — El Corazón

> Especificación detallada: [`MOVEMENT_IV.md`](./MOVEMENT_IV.md). Variantes: [Variante — La Piedra](./MOVEMENT_IV.md#variante--el-corazón-de-la-piedra), [Variante — El Eco](./MOVEMENT_IV.md#variante--el-corazón-del-eco), [Variante — La Llama](./MOVEMENT_IV.md#variante--el-corazón-de-la-llama).

El Corazón representa el punto donde todas las experiencias anteriores convergen.

No es el origen del mundo.

No es la respuesta definitiva.

Es el lugar donde el jugador comprende que su interpretación del reino y su manera de avanzar han comenzado a modificar la forma en que el mundo se manifiesta.

El Corazón combina:

- **Primer Eje:** interpretación del reino.
- **Segundo Eje:** método del viajero.

La identidad del territorio surge de ambas decisiones.

### Principio narrativo

El Reino responde:

> *"Así entiendes el mundo."*

Las Ruinas responden:

> *"Así decides avanzar."*

El Corazón responde:

> *"Esto es lo que nace cuando ambas cosas se encuentran."*

### Diseño

El Corazón debe sentirse como un territorio único, no como una repetición de movimientos anteriores.

Puede contener rastros de:

- la doctrina elegida;
- las decisiones del viajero;
- los métodos utilizados.

Sin embargo, su identidad pertenece a la **combinación** de elementos, no a uno solo.

El bioma refleja simultáneamente la doctrina del Primer Eje y el método del Segundo Eje.

La identidad emerge mediante la combinación de:

- arquitectura
- criaturas
- recursos
- música
- mecánicas
- Guardián

Al finalizar, el jugador vislumbra **La Forja** por primera vez. La **Última Forja** permanece inactiva: es un presagio del desenlace, no una decisión.

### Principio de diseño

El Corazón es el momento de **comprensión**.

---

## Combinación *(El Corazón)*

No crea nuevos biomas.

Genera una identidad híbrida a partir de lo vivido en el Movimiento II y en Las Ruinas.

### La Piedra + Buscar

La estabilidad se interpreta como algo que debe descubrirse.

### La Piedra + Crear

La estabilidad se interpreta como algo que debe construirse.

### El Eco + Buscar

La memoria del mundo se encuentra escuchando.

### El Eco + Crear

La memoria del mundo se modifica mediante nuevas resonancias.

### La Llama + Buscar

La transformación del mundo revela patrones ocultos.

### La Llama + Crear

La transformación se convierte en una herramienta del viajero.

---

## Movimiento V — La Forja *(Coda)*

> Especificación detallada: [`MOVEMENT_V.md`](./MOVEMENT_V.md) *(incluye recapitulación, guardián y desenlaces)*.

La Forja representa la **transformación final**.

Durante todo el juego la fabricación permite crear herramientas para superar obstáculos.

En el último movimiento, la pregunta cambia.

La Forja ya no construye objetos.

Construye una **decisión**.

### Principio narrativo

El Corazón pregunta:

> *"¿Qué has comprendido?"*

La Forja pregunta:

> *"¿Qué estás dispuesto a dejar atrás?"*

El quinto movimiento no introduce una nueva filosofía.

Es la **Coda** del viaje: su resolución, no un capítulo nuevo.

Todo aquello que el jugador ha aprendido sobre el reino comienza a mezclarse.

Los límites entre biomas dejan de existir.

Los símbolos de las distintas doctrinas aparecen juntos.

El jugador ya no está descubriendo el mundo.

Está recorriendo el significado que ese mundo adquirió a través de sus decisiones.

### Principio de diseño

La Forja es el momento de **transformación**.

El jugador no llega al final porque encontró una respuesta.

Llega porque debe decidir qué hacer con todo aquello que aprendió.

### Construcción del movimiento

El Movimiento V se compone utilizando todos los movimientos anteriores.

Cada nivel representa una etapa del viaje.

No pretende repetir contenido.

Pretende reinterpretarlo.

Especificación por doctrina, método y combinación: [`MOVEMENT_V.md` — Recapitulación](./MOVEMENT_V.md#recapitulación--niveles-14).

#### Nivel 1 — El Origen

Recupera elementos del Movimiento I.

No es una copia.

El jugador reconoce lugares, criaturas y estructuras familiares, pero ahora se sienten antiguos, silenciosos o incompletos.

Debe sentirse como un recuerdo.

#### Nivel 2 — La Doctrina

El mundo recuerda la doctrina elegida en el Primer Eje (La Piedra, El Eco o La Llama).

La arquitectura, música, enemigos y recursos responden únicamente a esa filosofía.

Es la última vez que el jugador observa esa interpretación en estado puro.

#### Nivel 3 — Las Ruinas

El Segundo Eje — Buscar o Crear — se manifiesta como recuerdo de Las Ruinas del Viajero.

La doctrina permanece presente.

Sin embargo, el comportamiento del mundo refleja el método elegido anteriormente (Buscar o Crear).

El jugador comprende que no basta con interpretar el mundo.

También importa la manera en que decidió recorrerlo ante la incertidumbre.

#### Nivel 4 — El Corazón

Los dos primeros ejes dejan de sentirse separados.

La doctrina y el método forman una identidad única.

Todo parece haber conducido naturalmente hasta este punto.

#### Nivel 5 — La Última Forja

Sacrificio — Tercer Eje. Nivel completamente nuevo.

El jugador desmonta mejoras; el reino revela Raíces, Camino de la Forja u Horizonte.

Detalle: [`MOVEMENT_V.md` — Nivel 5](./MOVEMENT_V.md#nivel-5--la-última-forja).

#### Nivel 6 — El Último Guardián

Prueba final **después** del sacrificio.

Enfrentamiento adaptado al camino revelado. Puede incorporar al Guardián del Umbral (*"Toda carga protege. Toda carga pesa."*).

Detalle: [`MOVEMENT_V.md` — Nivel 6](./MOVEMENT_V.md#nivel-6--el-último-guardián) · [especificación completa](./MOVEMENT_V.md#el-último-guardián--nivel-6).

#### Nivel 7 — El Final

Desenlace (Raíces / Horizonte) o epílogo jugable (Camino de la Forja).

Detalle: [`MOVEMENT_V.md` — Nivel 7](./MOVEMENT_V.md#nivel-7--el-final) · [especificación completa](./MOVEMENT_V.md#el-final--nivel-7).

---

## El umbral *(dentro de La Forja)*

El umbral no juzga al viajero.

No recompensa la virtud.

No castiga el error.

El umbral únicamente responde a una pregunta:

> **¿Qué tan completa es tu decisión?**

El **Portal del Umbral** es la puerta física hacia los desenlaces principales (Raíces y Horizonte). Cuando el sacrificio no alcanza una forma definitiva, el Portal del Umbral permanece cerrado y se revela el Camino de la Forja.

Durante toda la aventura el jugador construye una identidad mediante herramientas, recursos y mejoras.

El sacrificio final no consiste en perder poder.

Consiste en decidir qué parte de esa identidad sigue siendo necesaria para continuar.

---

## Tercer Eje

### Presentación

El Tercer Eje se **presagia** al finalizar El Corazón (Última Forja inactiva en La Forja).

La **decisión real** ocurre durante La Forja (Movimiento V).

### Pregunta

Toda travesía transforma a quien la recorre.

**¿Qué estás dispuesto a dejar atrás para continuar?**

Reformulada en términos mecánicos:

> **¿Qué parte de tu recorrido consideras verdaderamente indispensable?**

No existen respuestas correctas.

No existe una cantidad "correcta" de sacrificios.

Toda elección implica una renuncia.

Toda renuncia implica una transformación.

Este eje no modifica la filosofía del reino.

Da significado al recorrido completo.

Toda decisión previa permanece visible.

La elección final únicamente determina cómo el protagonista atraviesa el Portal del Umbral — o si continúa por el Camino de la Forja.

La elección nunca consiste en escoger un destino.

Consiste en aceptar una renuncia.

No aparecen explicaciones.

No existen opciones de diálogo.

**La propia interfaz de la Última Forja plantea la pregunta.**

---

## El sacrificio

El sacrificio constituye la **decisión definitiva** del juego.

No se expresa mediante un diálogo.

Se expresa mediante una acción mecánica.

### Mecánica

La Última Forja — dentro de La Forja — permite desmontar las mejoras construidas durante el viaje.

El jugador decide qué conservar y qué abandonar.

El resultado determina el camino revelado:

- Camino de las Raíces.
- Camino de la Forja.
- Camino del Horizonte.

### Principio

Durante toda la aventura el jugador construye una identidad.

No encuentra mejoras de forma aleatoria.

Las fabrica.

Cada bomba adicional, cada incremento de alcance, cada mejora de velocidad y cada aumento de vida representan decisiones tomadas por el jugador.

Las mejoras no son únicamente estadísticas.

Representan el recorrido construido hasta ese momento.

Por esta razón, el desenlace no puede consistir únicamente en escoger un portal.

Debe preguntarle al jugador qué significado tienen todas esas decisiones.

### La última forja

La Última Forja constituye la culminación del sistema de fabricación.

Por primera y única vez durante el juego, la fabricación ocurre en sentido inverso.

El jugador desmonta voluntariamente las mejoras que construyó durante su viaje.

No existen recomendaciones.

No existen porcentajes visibles.

No existe una respuesta considerada correcta por la interfaz.

La decisión pertenece completamente al jugador.

El jugador puede desmontar cualquiera de las mejoras construidas durante la aventura.

Por ejemplo:

- Bombas adicionales.
- Alcance de explosión.
- Velocidad.
- Vida.
- Mejoras futuras que puedan añadirse al sistema.

El jugador decide cuántas de sus mejoras fabricadas conservar.

Cada mejora desmontada desaparece de forma permanente antes del tramo final.

### Filosofía del sacrificio

El juego no recompensa una decisión moral.

La pregunta no es *¿Qué quieres perder?*

La respuesta pertenece completamente al jugador.

El juego jamás explica qué se pierde.

Solo permite sentir que algo queda atrás.

Dependiendo de todo el recorrido anterior, aquello que el jugador percibe como sacrificio será diferente.

Para algunos será la identidad.

Para otros el hogar.

Para otros el conocimiento.

Para otros el propio viaje.

### Los tres caminos

El jugador **nunca** elige un portal.

La decisión ya fue tomada en la Última Forja.

El reino revela el camino correspondiente según el sacrificio realizado.

| Camino | Sacrificio | Naturaleza |
| ------ | ---------- | ---------- |
| **Camino de las Raíces** | Conserva la totalidad o la gran mayoría de las mejoras | Desenlace principal |
| **Camino de la Forja** | Sacrificio parcial: conserva algunas mejoras y renuncia a otras | Epílogo jugable |
| **Camino del Horizonte** | Desmonta la totalidad de las mejoras | Desenlace principal |

La experiencia del último tramo cambia según el camino revelado.

---

### Camino de las Raíces

#### Condición

El jugador conserva la totalidad o la gran mayoría de sus mejoras.

#### Significado

El viajero reconoce que aquello construido durante el recorrido sigue formando parte de su identidad.

No desea desprenderse de ello.

La montaña responde aceptando esa decisión.

Las raíces abrazan al viajero.

El mundo lo recibe nuevamente en su origen.

No representa un fracaso.

Representa la decisión consciente de permanecer.

#### Imagen del camino

Una inmensa raíz desciende hacia una oscuridad absoluta.

No transmite miedo.

Transmite refugio.

Las raíces abrazan la roca como si siempre hubieran pertenecido allí.

No existe luz.

Solo una profunda sensación de quietud.

Su símbolo representa aquello que permanece.

Aquello que decide volver al origen.

Aquello que acepta descansar.

Nunca se utiliza la palabra muerte.

Nunca se utiliza la palabra final.

---

### Camino de la Forja

#### Condición

El jugador realiza un sacrificio parcial.

Conserva algunas mejoras y renuncia a otras.

#### Significado

El viajero no ha alcanzado una resolución definitiva.

Sin embargo, tampoco ha fallado.

La montaña reconoce que existe una **transformación en proceso**.

El Portal del Umbral permanece cerrado: aún no reconoce una decisión definitiva.

#### Representación

Después de la Última Forja, el jugador continúa en una **nueva sección** — un epílogo jugable breve.

No regresa al inicio.

No repite la aventura.

Muestra:

- nuevas consecuencias;
- un mundo ligeramente cambiado;
- una identidad todavía en construcción.

No representa un castigo ni un cierre incompleto.

Representa que el viaje de transformación continúa.

---

### Camino del Horizonte

#### Condición

El jugador desmonta la totalidad de sus mejoras.

Cruza el Portal del Umbral exactamente con las mismas capacidades básicas con las que inició la aventura.

#### Significado

El viajero demuestra que ya no necesita apoyarse en aquello que construyó.

Su identidad ya no depende de sus herramientas.

El reino responde abriendo el Horizonte.

No representa una recompensa.

Representa el reconocimiento de que el viajero está preparado para continuar.

#### Imagen del camino

Una puerta abierta hacia una luz imposible.

No puede verse qué existe detrás.

No parece un cielo.

No parece un lugar.

Solo una dirección.

El viento atraviesa el portal.

Las piedras parecen hacerse más ligeras.

Su símbolo representa aquello que continúa.

Aquello que acepta seguir cambiando.

Aquello que deja atrás incluso aquello que ama.

Nunca se utiliza la palabra trascendencia.

Nunca se utiliza la palabra salvación.

---

### El último recorrido

Tras abandonar la Última Forja comienza el tramo final.

La **primera parte** siempre refleja el peso de la decisión tomada.

El jugador experimenta las consecuencias reales del sacrificio realizado.

No existen ayudas inmediatas.

El desafío debe sentirse auténtico.

Posteriormente el propio reino comienza a responder.

Esa respuesta nunca aparece como una recompensa explícita.

Se manifiesta como una transformación silenciosa del mundo.

Ejemplos posibles:

- El fuego deja de reconocer al viajero como una amenaza.
- Determinados espíritus abandonan su actitud hostil.
- Algunos obstáculos dejan de oponerse al avance.
- La montaña parece abrir espacio para quien continúa caminando.

Estas manifestaciones nunca deben sentirse como habilidades nuevas.

Deben sentirse como una **aceptación** por parte del reino.

---

### Integración con el viaje

El sacrificio posee significado porque resume toda la estructura del juego.

| Movimiento | El jugador… |
| ---------- | ----------- |
| I | Aprende y elige cómo interpretar el mundo. |
| II | Vive esa interpretación y elige cómo enfrentar la incertidumbre. |
| III | Recorre Las Ruinas según ese método. |
| IV | Ve cómo el mundo responde a esas decisiones. |
| V | Decide qué parte de ese recorrido considera verdaderamente suya. |

---

## Los doce desenlaces

**Especificación de producción (Nivel 7):** [`MOVEMENT_V.md` — El Final](./MOVEMENT_V.md#el-final--nivel-7).

### Principio

Uncover posee tres caminos finales:

- Camino de las Raíces
- Camino de la Forja
- Camino del Horizonte

Sin embargo, únicamente los Caminos de las **Raíces** y del **Horizonte** representan una resolución completa del viaje.

Por esta razón, ambos finales reflejan la memoria acumulada durante toda la aventura.

No existen doce finales distintos.

Existen **doce maneras diferentes** en que el reino recuerda al viajero antes de despedirse.

### Estructura

Los desenlaces completos se construyen mediante la combinación de dos ejes narrativos y el sacrificio del Tercer Eje:

| Eje | Dimensión | Opciones |
| --- | --------- | -------- |
| Primer Eje | Interpretación del reino | La Piedra, El Eco, La Llama |
| Segundo Eje | Método del viajero | Buscar, Crear |
| Tercer Eje | Sacrificio en la Última Forja | Raíces (completo) u Horizonte (completo) |

**6 identidades × 2 desenlaces completos = 12 desenlaces.**

| Interpretación | Método | Desenlace |
| -------------- | ------ | --------- |
| La Piedra | Buscar | Raíces |
| La Piedra | Crear | Raíces |
| El Eco | Buscar | Raíces |
| El Eco | Crear | Raíces |
| La Llama | Buscar | Raíces |
| La Llama | Crear | Raíces |
| La Piedra | Buscar | Horizonte |
| La Piedra | Crear | Horizonte |
| El Eco | Buscar | Horizonte |
| El Eco | Crear | Horizonte |
| La Llama | Buscar | Horizonte |
| La Llama | Crear | Horizonte |

### Qué permanece constante

Cada desenlace conserva siempre su identidad fundamental.

**Camino de las Raíces** — permanencia, aceptación del origen, refugio.

**Camino del Horizonte** — continuidad, trascendencia, apertura hacia lo desconocido.

Estas ideas nunca cambian.

### Qué cambia

El reino adapta su despedida utilizando el lenguaje aprendido durante el viaje.

Nunca cambia el significado del final.

Cambia únicamente la forma de expresarlo.

Los elementos variables incluyen:

- arquitectura
- materiales
- iluminación
- música
- comportamiento del entorno
- símbolos presentes
- criaturas que acompañan al viajero
- diseño del último escenario
- apariencia del Portal del Umbral

### La memoria de La Piedra

El reino recuerda el orden.

La estabilidad.

La permanencia.

Las construcciones son precisas.

Las formas son geométricas.

Las estructuras parecen haber existido desde siempre.

La despedida transmite sensación de solidez.

### La memoria de El Eco

El reino recuerda la resonancia.

El silencio.

Las huellas invisibles.

La arquitectura parece incompleta.

El sonido ocupa el lugar de la materia.

Las criaturas observan en lugar de intervenir.

La despedida transmite contemplación.

### La memoria de La Llama

El reino recuerda la transformación.

Las paredes continúan cambiando incluso durante el desenlace.

La luz nunca permanece inmóvil.

Los materiales parecen fundirse y reconstruirse continuamente.

La despedida transmite movimiento.

### La memoria del método

Además de recordar la interpretación del reino, el desenlace recuerda la manera en que el viajero recorrió ese mundo.

#### Buscar

El camino final contiene señales.

Vestigios.

Descubrimientos.

La montaña responde revelando aquello que permanecía oculto.

El viaje termina con la sensación de haber encontrado algo que siempre estuvo allí.

#### Crear

El camino final muestra las huellas del propio viajero.

Puentes.

Mecanismos.

Herramientas.

Transformaciones realizadas durante la aventura.

La montaña responde incorporando esas acciones a su propia historia.

El viaje termina mostrando que el mundo también cambió gracias al paso del protagonista.

### Ejemplos

**La Piedra + Buscar + Horizonte**

El viajero asciende por una antigua escalinata excavada en roca blanca.

Cada bloque parece colocado siguiendo una geometría perfecta.

Las puertas doradas emergen del corazón mismo de la montaña.

Nada parece improvisado.

Todo parece haber esperado pacientemente su llegada.

**El Eco + Crear + Raíces**

Las raíces cristalinas envuelven lentamente al viajero.

A su alrededor permanecen visibles las resonancias que él mismo provocó durante el recorrido.

El reino conserva esas huellas como parte de su memoria.

No existe una separación entre quien atravesó la montaña y la montaña que fue transformada por su paso.

### El Camino de la Forja y los doce desenlaces

El Camino de la Forja **no** forma parte de los doce desenlaces.

Su propósito es diferente: un **epílogo jugable** para viajeros cuya transformación aún está en curso.

Aunque conserva elementos visuales derivados de las decisiones anteriores, no constituye una resolución definitiva ni compite con Raíces u Horizonte.

### Principio de diseño de los desenlaces

El jugador nunca debe sentir que obtuvo un color diferente del mismo final.

Debe sentir que el reino aprendió una forma distinta de despedirse de él.

Las decisiones tomadas durante el viaje no cambian el destino alcanzado.

Cambian el lenguaje con el que ese destino decide recibirlo.

El mundo recuerda.

Y esa memoria constituye la verdadera recompensa narrativa de Uncover.

---

### Integración con los finales

El sacrificio no determina un final bueno o malo.

Únicamente modifica el significado del desenlace.

Los **dos desenlaces principales** (Raíces y Horizonte) concentran la mayor parte del esfuerzo narrativo y artístico.

Representan decisiones completas.

El **Camino de la Forja** es un **epílogo jugable**.

Su propósito no consiste en competir con los otros dos finales, sino en mostrar las consecuencias de una renuncia aún incompleta.

El juego nunca etiqueta ninguno de los tres caminos como "correcto" o "incorrecto".

Sin embargo, el Portal del Umbral responde con mayor claridad cuando el viajero también lo hace.

El jugador no recibe un juicio moral.

Recibe una consecuencia coherente con la forma en que decidió concluir su viaje.

Los desenlaces principales permanecen deliberadamente ambiguos.

---

### Nivel 6 — El Último Guardián

Ver [`MOVEMENT_V.md` — Nivel 6](./MOVEMENT_V.md#nivel-6--el-último-guardián) · [especificación completa](./MOVEMENT_V.md#el-último-guardián--nivel-6).

Enfrentamiento completo posterior al sacrificio. El guardián pregunta qué aprendió el viajero, no qué conservó.

---

### Nivel 7 — El Final

Ver [`MOVEMENT_V.md` — Nivel 7](./MOVEMENT_V.md#nivel-7--el-final) · [especificación completa](./MOVEMENT_V.md#el-final--nivel-7).

El jugador recorre el camino revelado (Raíces, Forja o Horizonte).

No puede regresar.

No existen enemigos ordinarios en los desenlaces principales.

El mundo queda en silencio o en aceptación, según el camino.

---

### Los desenlaces

Nunca existen etiquetas.

Nunca aparecen nombres de "final bueno" o "final malo".

#### Desenlace — Camino de las Raíces

La secuencia base transmite permanencia y refugio. Su representación visual y simbólica varía según la memoria del reino (doctrina + método). Ver [Los doce desenlaces](#los-doce-desenlaces).

El protagonista continúa descendiendo.

La oscuridad deja de parecer hostil.

Gigantescas raíces comienzan a envolver lentamente el escenario.

Finalmente aparecen unos brazos inmensos.

No puede distinguirse si pertenecen a un árbol, a la montaña o a algo completamente distinto.

Los brazos rodean al protagonista.

La pantalla desaparece lentamente.

Silencio.

Créditos.

#### Epílogo — Camino de la Forja

Tras la Última Forja, el jugador entra en una sección breve y jugable.

El Portal del Umbral permanece cerrado.

El mundo muestra consecuencias sutiles: un territorio ligeramente transformado, una identidad aún en construcción.

No es un final de créditos inmediato.

Es una continuación que reconoce la transformación en proceso.

Puede concluir con créditos propios del epílogo, sin reiniciar la aventura.

#### Desenlace — Camino del Horizonte

La secuencia base transmite continuidad y apertura. Su representación visual y simbólica varía según la memoria del reino (doctrina + método). Ver [Los doce desenlaces](#los-doce-desenlaces).

El protagonista continúa caminando.

La luz aumenta poco a poco.

La roca deja de existir.

Ante él aparecen unas enormes puertas abiertas.

No existe ninguna figura esperándolo.

No existe voz alguna.

Solo un espacio imposible de observar completamente.

El protagonista atraviesa el umbral.

La pantalla se desvanece.

Silencio.

Créditos.

---

### Interpretación

El juego nunca revela qué ocurrió realmente.

El reino subterráneo jamás confirma si fue un lugar real.

El protagonista nunca explica su historia.

Nada confirma si el viaje fue:

- un sueño,
- una segunda oportunidad,
- un recuerdo,
- un juicio,
- una despedida,
- sobrevivió o murió,
- despertó o trascendió,
- o simplemente otra aventura u otro camino.

La última decisión no determina la verdad.

Determina cuál fue el significado del viaje para el propio jugador.

Por eso el juego se llama **Uncover**.

No porque descubra una verdad oculta.

Sino porque cada recorrido retira una capa distinta de significado, dejando al jugador frente a una interpretación que nunca podrá demostrarse como la única posible.

---

### Principio de La Forja

La Forja no responde las preguntas del jugador.

Las devuelve.

Todo aquello que el jugador creyó descubrir sobre el reino termina reflejando la forma en que decidió atravesarlo.

Uncover nunca revela una verdad definitiva.

Únicamente permite que el jugador contemple la verdad que construyó durante el viaje.

Las decisiones importantes de Uncover nunca se expresan únicamente mediante diálogos.

Siempre deben traducirse en mecánicas.

El jugador no debe limitarse a elegir una respuesta.

Debe vivir las consecuencias de aquello que decidió.

El significado de la narrativa emerge cuando la filosofía del mundo y las reglas del juego dejan de ser elementos separados y pasan a expresar una misma idea.

---

## Guardianes

Los Guardianes no representan el mal ni enemigos ordinarios.

Representan **umbrales** — pruebas de comprensión, no adversarios a destruir.

La victoria no siempre implica destruirlos. Cada guardián puede tener una forma diferente de reconocimiento.

Cada uno protege una parte distinta del conocimiento del reino.

Los combates son ritos de paso cuando el encuentro lo exige.

No todos los encuentros utilizan la misma estructura. Un Guardián puede superarse mediante combate, observación, un rompecabezas o sobrevivir a una prueba.

Ejemplos según doctrina:

| Doctrina | Forma de reconocimiento |
| -------- | ----------------------- |
| **La Piedra** | Enfrentamiento basado en estructura y comprensión |
| **La Llama** | Enfrentamiento basado en adaptación |
| **El Eco** | Encuentro no necesariamente directo; percepción e interpretación |

El **Guardián del Umbral** representa la última validación del viaje, no un enemigo final convencional.

El objetivo no consiste en vencer a un adversario.

Consiste en demostrar que el jugador ha comprendido aquello que el Guardián protege.

Al superarlos no desaparecen por completo.

Simplemente reconocen que el jugador puede continuar descendiendo.

---

## Recursos y fabricación

Los niveles no contienen mejoras directas.

Durante la exploración se obtienen materiales.

Al finalizar cada nivel el jugador accede a una estación de fabricación.

Las mejoras se construyen utilizando recursos limitados.

Fabricar repetidamente una misma mejora produce rendimientos decrecientes.

Esto incentiva la especialización sin imponer una única estrategia óptima.

Cada mejora fabricada — bombas, alcance, velocidad, vida — forma parte de la identidad mecánica del jugador y adquiere significado narrativo en La Forja (Movimiento V).

En la **Última Forja**, la misma interfaz permite **desmontar** mejoras de forma irreversible. Ver [El sacrificio](#el-sacrificio).

---

## Principio narrativo

Uncover no busca revelar una verdad escondida.

Busca mostrar cómo un viajero interpreta un mundo extraño y cómo ese mundo responde a la manera en que decidió recorrerlo.

El misterio no está en descubrir qué ocurrió.

Está en decidir qué significado tendrá lo ocurrido.

El jugador debe poder terminar Uncover creyendo que simplemente exploró un antiguo reino fantástico.

Las decisiones construyen una interpretación coherente del mundo, pero el juego nunca confirma que exista una única verdad.

La profundidad narrativa surge de la relación entre filosofía, biomas, mecánicas y guardianes, no de explicaciones explícitas.

Cada recorrido retira una capa distinta de significado — de ahí el nombre **Uncover**.

Toda decisión importante debe expresarse mediante las mecánicas del juego.

La narrativa nunca sustituye a la experiencia del jugador.

Las reglas, los biomas, los guardianes, la fabricación y el sacrificio constituyen el verdadero lenguaje mediante el cual el reino se comunica.

El jugador no descubre una verdad oculta.

Construye una interpretación coherente del mundo a través de las decisiones que toma y de aquello que está dispuesto a dejar atrás.

# Uncover — Diálogos (Movimiento I)

> Contrato de voz y batidas propuestas. Narrativa: [`NARRATIVE.md`](./NARRATIVE.md). Curriculum: [`MOVEMENT_I.md`](./MOVEMENT_I.md). Crafting / fragmentos: [`CRAFTING.md`](./CRAFTING.md). Runtime: [`src/config/dialogues.js`](../src/config/dialogues.js) · eventos [`src/config/narrativeEvents.js`](../src/config/narrativeEvents.js).

**Estado:** fuente de verdad de textos. El bus de eventos y tutoriales ya están cableados; los textos de este doc se van volcando a `dialogues.js` por `id`.

**Formato:** entradas del `DialogueController`. Space avanza. **3–6 alientos** por batida (cada `text` es un párrafo oral fluido, no un telegrama).

---

## Hilo narrativo (cohesión)

El viajero es un **enano nórdico** (forja, hidromiel, sagas, frío, clan) con permiso recién ganado. **Para el jugador/lector del doc:** también es isekai —pero eso **no se nombra en diálogo** ni se confirma pronto. Solo filtra por costumbre rara, magia que no huele a taller, y chistes de taberna que no encajan del todo con este reino.

En pantalla es un viajero con barba, nervios y oficio: contrasta lo que le contó su **maestro de forja** con lo que ve aquí. La pregunta de fondo (clara al final):

> ¿Vengo a **tomar** de la montaña… o a **conocerla**?

### Revelación lenta (capa isekai)

| Fase | Qué se deja ver | Qué **no** |
| ---- | --------------- | ---------- |
| N1–N2 | Enano de otra sala de forja; permiso; bombas “de la nada” como rareza práctica | Mundos, portales, “llegué de…” |
| N3–N5 | Costumbres del maestro vs esta mina; frío; cuidado | Confesiones de origen |
| N6–N7 | Chiste de “jefe de piso” / sótano de taberna; el Excavador lo trata de forastero | La palabra *isekai* o “otro mundo” |

### Propósito por nivel

| Nivel | Propósito del viajero (lo que él cree) | Sensación |
| ----- | -------------------------------------- | --------- |
| **N1** | Recién tiene permiso: **llegar a las minas** | Mismo aliento que N2 |
| **N2** | Ya está en las minas: **tomar materiales** | Continúa N1 |
| **N3** | La visión cambia; **aquí empieza la aventura** | Maestro vs tierra |
| **N4** | Seguir; **frío en el viento** | Cuerpo; habitada |
| **N5** | Tras los espíritus: **cuidar más** | Oficio con vergüenza |
| **N6** | **Gravedad / peso de la tierra**; apariencia distinta | Preámbulo |
| **N7** | Tras el golem avanzado: cree que toca **jefe de piso** | El Excavador corrige |

### Morfología (forma oral)

Evitar el staccato de “Oración. Oración. Oración.” Preferir:

- una idea que **se arrastra** con *y*, *pero*, *aunque*, *como si*, *mientras*;
- detalle nórdico (yunque, mead-hall, escarcha, clan, pico) sin disertación;
- cierre en gesto (cinturón, linterna, reírse de sí), no en eslogan;
- chistes sutiles; nunca rótulo de género.

### Speakers

| Speaker | Portrait | Uso |
| ------- | -------- | --- |
| `VIAJERO` | `player` | Pensamiento en voz alta |
| `PRIMER EXCAVADOR` | `excavator` | Umbral N7 (éxito / fallo) y, tras éxito, lore en Taller |
| `BRUN` | `smith` | Enano del Taller (nombre provisional); horno y yunque |
| *(inscripción)* | `narrator` | Eco de fragmento « » |

### Reglas de repetición (global Mov. I)

| Batida | ¿Se repite? |
| ------ | ----------- |
| Inicio de nivel N1–N7 (único) | **No** (una vez por campaña) |
| Inicio genérico al **reintentar** un nivel | **Sí** (cada reentrada tras fallo; ver sección) |
| Descubrimientos / fragmentos (pools) | **No** (cada texto una vez; marcar usados) |
| Portales tras N7 (primera vista) | **No** |
| Wipe N1–N2 → menú | **Sí** (genérico breve al fallar tutorial) |
| Taller: intro Brun | **No** |
| Taller: catarsis `advance` por nivel | **No** |
| Taller: primera fundición / primera aleación | **No** |
| Taller: craft / unlock receta (primera vez por mejora o rango 1) | **No** |
| Taller: subir de nuevo la misma mejora (rango 2/3) | **Sí** — genérico breve |
| Taller: consejo `retry` por nivel | **Sí** (cada vez que se falle ese nivel) |
| Taller: idle Brun / Excavador (`hubEntry` null) | **Sí** (pool; cooldown al hablar) |
| Excavador: intro N7 + reconocimiento éxito | **No** |
| Excavador: llegada al hub + batidas de lore | **No** (cada batida una vez; rotar pool idle después) |
| Excavador: prueba fallida (primera) | **No** |
| Excavador: prueba fallida (reintentos) | **Sí** — genérico |
| Excavador: pool “durante” el encuentro | **Sí** (con cooldown; no spam) |
| Brun: fallo N7 / vuelta al preámbulo | **Sí** |

Si el viajero completa otra vez un nivel cuya catarsis ya oyó (p. ej. N6 tras fallar N7), el hub **no** repite `advance`: solo oficio silencioso o, si falló, el consejo `retry`.

**Cadena típica al fallar N3+:** consejo Brun en Taller (`retry`) → puerta → **inicio genérico de reintento** en el nivel → juego. El inicio único ya no se repite.


---

## Inicio de nivel

Disparo: tras la caminata de entrada.

### N1 — La Entrada

*Propósito: con el permiso recién obtenido, **llegar a las minas**.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'El sello todavía me quema un poco en la palma, como si la cera no hubiera decidido si soy digno o solo ruidoso, y mi maestro de forja —ese viejo de mead-hall y martillo eterno— ya me estaría gruñendo que esto no es victoria sino boleto, y por una vez le doy la razón sin pelear.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Boleto a las minas, nada más: no vine a enderezar reinos ni a peinarme el destino como en esas sagas donde el héroe elige estirpe antes del desayuno; vine a cruzar la primera boca de piedra con linterna, nervios y la barba todavía demasiado limpia.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En mi tierra abríamos galerías con prisa y con fuego de carbón, y aquí me sueltan bombas “de la nada”, un truco que huele menos a taller y más a feria… aunque confieso que sé hacer ruido cuando la pared se pone terca.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Así que adelante, primera puerta, camino corto: quiero ver la boca de la mina antes de que el permiso se enfríe como hidromiel olvidada sobre la mesa.',
  },
]
```

### N2 — Las Herramientas

*Propósito: **ya llegó**; aquí puede **tomar materiales**. Continúa N1.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Y ahí está, por fin: la boca de verdad, no un prólogo eterno ni un vestíbulo de cuento, sino piedra sudada y ese olor a mineral que en el clan confundíamos con el olor a casa.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Mi maestro hablaba de las vetas como quien habla del pan del invierno —“si ves metal, no lo mires como joya, tómalo o alguien más lo hará”— y ahora que me pusieron pico en la mano entiendo el refrán con los hombros: ya no solo atravieso, también recojo.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Bronce, hierro, lo que la pared suelte; la bomba abre y el pico pregunta, y si elijo mal no podré echarle la culpa a la montaña porque seré yo, enano torpe, tirando precio por prisa.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Propósito claro, entonces: materiales al saco y la barba fuera del camino, que el resto de la aventura ya cobrará peaje cuando la montaña quiera.',
  },
]
```

### N3 — La Profundidad

*La visión cambia; empieza lo serio; recuerda al maestro.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'La luz ya no me la regalan igual: como si alguien hubiera bajado la lámpara del mundo un par de mechas, y de pronto el túnel se estrecha no solo en piedra sino en confianza.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: '“Cuando la vista se estrecha, ahí empieza el trabajo de verdad”, decía el maestro con la voz de yunque, y odio admitir —con esta barriga que aún busca el mead-hall— que otra vez tenía razón.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces esto no era el vestíbulo eterno: esto es la aventura, y se me afloja un poco el estómago como al aprendiz el primer día frente al fuego vivo, qué detalle tan ridículamente humano.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En sus sagas la piedra dormía la siesta de los siglos, pero aquí siento rondas: piedra con turno de noche, como si el clan de abajo hubiera dejado guardias sin avisar al recién llegado.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Está bien: miro antes de golpear, no confío solo en el fuego, y procuro no decir “fácil” en voz alta… aunque la lengua me pica, perdón montaña, era broma de taberna y no un desafío.',
  },
]
```

### N4 — Los Habitantes

*Frío en el viento.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Hay un viento aquí abajo —y no debería— que me entra por el cuello como escarcha de puerto norteño, como si la mina me revisara los bolsillos y la dignidad al mismo tiempo.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Primero se me cerró la vista y ahora el aire muerde, y el cuerpo, traidor útil, entiende antes que el orgullo de forja: esta tierra no es mi fiordo, aunque se le parezca en el frío.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si veo luces que no son linternas de aceite, no son adornos de sala: son vecinos, y el viento sugiere que no vinieron a brindar hidromiel con el recién llegado.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'El maestro nunca mencionó este frío; hablaba de coraje junto a la brasas, qué conveniente cuando uno enseña desde la mesa y no desde la galería.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Respiro hondo, me ajusto la capa de viaje y sigo, no por héroe de saga sino porque quedarme quieto también congela, y un enano quieto es un chiste malo esperando su final.',
  },
]
```

### N5 — La Recolección

*Tras los espíritus: cuidar más a fondo.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Ya vi lo que pasa cuando uno tira fuego como si fuera pirotecnia de feria de verano: los espíritus no aplauden, y la montaña tampoco sirve ronda a los ruidosos.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Así que cuidar no es ponerme halo de santo del clan; es no despertar lo que no puedo pagar, lección cara que mi barba aún está digiriendo.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Aquí hay un orden —marcas, pruebas, cosas que piden mano o piden distancia— y me recuerda a los tallados del vestíbulo de mi maestro, donde el torpe tocaba lo que no debía y pagaba con orejas calientes.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Antes corría al brillo como aprendiz tras la chispa; ahora me paro un segundo, un segundo humano que no me hace sabio pero sí me evita un golpe, y con eso me basta.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Materiales, sí, pero con las manos más quietas: si el viejo me viera diría “por fin”, y yo fingiría —con cara de yunque serio— que siempre fui así.',
  },
]
```

### N6 — La Cámara Antigua

*Ya no frío: gravedad; apariencia particular.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'El frío del viento se fue y dejó otra cosa, más pesada, como si la tierra misma se hubiera sentado en los hombros a pedir cuentas del camino.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'No es el frío de fiordo: es gravedad de lugar, y esta cámara no se viste como el resto de la mina; se ve más antigua, más intencionada, como el salón grande del clan donde uno baja la voz sin que nadie lo mande.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si hay fragmentos aquí, no son chatarra para el yunque: son avisos, y los leeré como leíamos en casa los tallados junto a la puerta —no por poesía, sino para no resbalar donde otros ya resbalaron.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Adelante, entonces, con cuidado de enano viajero y no con pose de elegido: la barba ya aprendió que el teatro se paga caro bajo techo de piedra.',
  },
]
```

### N7 — El Primer Excavador

*Tras el golem avanzado: chiste de jefe de piso → el Excavador corrige y explica la prueba.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Sobreviví a esa mole de piedra “terminada” y todavía me tiemblan las manos, detalle poco heroico y muy mío, como el temblor después del primer martillazo que sale mal en la forja.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces es aquí, ¿no?, el jefe de piso, el jarl del sótano, el golem gigante que uno tumba rapidito antes del brindis —así terminan los sótanos en las historias que contábamos con la jarra en la mano: puerta grande, monstruo más grande, y uno fingiendo que sabía el final.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'No. No soy tu “jefe de piso”, ni tu jarl de cuento, y esto no es pelea para presumir fuego de feria.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Es una prueba de cómo tomas y de cómo conoces: recursos, tiempo, pico y bomba, mientras el límite te mira sin aplaudir.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Ah… claro, me adelanté otra vez al final del cuento, típico de quien trae la cabeza llena de refranes del maestro y finales demasiado limpios.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Bien: admite el error. Ahora corre… con juicio.',
  },
]
```

---

## Retry de nivel — inicio genérico

Disparo: al entrar a un nivel cuyo **inicio único** ya se oyó, tras haber **fallido** (vuelta desde Taller u otra salida por derrota). **Repetible.** Más corto que el prólogo (2–3 alientos). No sustituye el consejo de Brun en el hub: ese es previo; esto es el empujón al pisar otra vez la galería.

Si se necesita un comodín sin tono de nivel concreto, usar el **pool genérico**; si no, preferir la batida del índice fallido.

### Pool genérico (cualquier nivel) — *repetible*

Rotar o elegir al azar una de estas batidas cuando no haya variante por nivel, o como refuerzo muy breve.

```js
// Opción A
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Otra vez la misma boca de piedra, y la barba un poco más corta de orgullo: el maestro diría que el yunque no se ofende si uno vuelve a golpear, solo si uno deja de intentarlo.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Bien: cinturón apretado, linterna lista, y sin fingir que la primera bajada ya me hizo jarl de nada.',
  },
]
```

```js
// Opción B
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Caí, volví al calor del taller, y aquí estoy otra vez oliendo a mineral y a humillación ligera… que es el peaje de quien aprende con las manos.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Adelante, despacio: la montaña no me debe un final limpio solo porque yo lo pedí en voz alta.',
  },
]
```

```js
// Opción C
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si el permiso todavía vale, yo todavía bajo; si la galería se ríe, que se ría —yo también me río de mí antes de que lo haga nadie más.',
  },
]
```

### N1 — reintento

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Todavía no he llegado de verdad a las minas, y ya me toca repetir el pasillo como aprendiz que pierde el camino entre el mead-hall y la forja.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Bomba si hace falta, pasos sin teatro: quiero ver la boca antes de que el permiso se me vuelva solo papel caliente en la palma.',
  },
]
```

### N2 — reintento

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Otra vez en la boca donde se toma: el maestro no me perdonaría volver con el saco vacío por orgullo de haber “casi” recogido.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Pico y fuego con juicio; esta vez elijo qué romper y qué guardar, aunque la pared me tiente a hacer ruido de feria.',
  },
]
```

### N3 — reintento

*Visión corta, peñas, ruido que delata.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Otra vez la profundidad que muerde la vista: sé que no veo lejos, y aun así la última vez empujé como si la linterna fuera un sol de saga.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Hoy elijo cuándo hacer ruido. Si la peña se pone terca, la abro; si no, paso de lado y dejo el orgullo en el cinturón, donde no estorba.',
  },
]
```

### N4 — reintento

*Oscuridad, luces molestas, detonaciones que despiertan peores vecinos.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'El frío del viento ya lo conocí; lo que me tumbó fue pelear a fogonazos en la oscuridad justa, como quien enciende la sala entera para buscar un clavo.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Rodear cuando pueda, despertar luces solo si de verdad hace falta, y no juntar peña y vecino brillante en el mismo estallido… eso es lo que me repito, aunque la mano quiera bomba.',
  },
]
```

### N5 — reintento

*Marcas, trampas, orden bajo amenaza.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Volví porque las marcas se rieron de mí, o yo de ellas: toqué mal, y la galería cobró el peaje sin pedir permiso a mi barba.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Esta vez miro el patrón antes del orgullo. Si no estoy seguro, no toco; si ya toqué, memorizo, aunque el ruido del combate me tire del codo.',
  },
]
```

### N6 — reintento

*Cámara antigua; mezcla; umbral cerca. También aplica al volver a N6 tras fallo en N7.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Otra vez la cámara que pesa distinto: aquí no se corre de peña en peña como en pasillo de principiante; se lee entre esquivas, con la tierra sentada en los hombros.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si hay umbral más allá, no lo merezco a gritos. Bajo con juicio, recojo lo justo, y dejo el teatro de “jefe de sótano” para cuando alguien me corrija… otra vez.',
  },
]
```

### N7 — reintento

*Tras el fallo genérico del Excavador (y, si aplica, el consejo de Brun al volver por N6). Al pisar de nuevo el umbral.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Otra vez el umbral, y ya no traigo el chiste del jefe de piso en la lengua: traigo el peaje de haberlo dicho, y las manos un poco más honestas.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Otra vez. Recursos, tiempo, pico y bomba. El límite no aplaude repeticiones… pero tampoco perdona quien no vuelve.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entendido. Corro con juicio, aunque me tiemble la barba.',
  },
]
```

---

## Descubrimientos de primera vez

### Primer destructible (N2)

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Roca que se deja trabajar: el “pan del invierno” del maestro, pegado a la pared como si la montaña hubiera horneado metal para el que llega con el saco vacío.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si la vuelo, abro camino; si la pico, quizá pago el viaje, y las dos opciones me tiran del cinturón como dos jarros de hidromiel en la misma noche —dilema de principiante, sí, pero mío.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Propósito: materiales. Empezaré sin fingir que no me gusta el ruido del fuego… y sin olvidar que el precio también se siente en la barba cuando uno vuelve al taller con las manos vacías.',
  },
]
```

### Primer golem básico (N3)

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Piedra con turno de noche: el maestro se quedó corto en la saga, o yo escuché mal entre el ruido del yunque y la risa de la mesa.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Parece cansado, y yo también; si lo despierto a lo bruto seré el del chiste malo, ese que confunde guardia con saco de botín.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Miro dos veces, no por sabio del clan sino porque me da un poco de miedo, y el miedo —como el frío del norte— a veces es brújula disfrazada de vergüenza.',
  },
]
```

### Primer espíritu (N4)

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Luz que no es linterna de aceite: el frío del viento ahora tiene cara, y no es la cara amable del anfitrión que pasa el jarro.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si mi fuego lo irrita, entonces “abrir camino” también puede ser portazo en casa ajena, y en mi tierra eso se paga con orejas calientes… aquí quizá con algo peor.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Anoto con la vergüenza útil del aprendiz: menos pirotecnia, más oído, y la capa bien cerrada contra este viento que no debería existir.',
  },
]
```

### Primer puzzle de marcas (N5)

*Disparo: al ver / pisar la primera tableta del suelo (antes de completar el patrón).*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Piedras en el piso que no son mena ni basura: están puestas como quien deja el orden del trabajo junto a la puerta del clan, para que el torpe no entre gritando.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si las toco a lo bruto, la galería me va a cobrar el peaje en rojo; si me quedo mirando demasiado, la ronda de abajo me encuentra con las manos ocupadas de “pensar”.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Bien: leo el patrón antes del orgullo. En mi tierra también había marcas que no se explicaban en voz alta… y el que no las respetaba acababa con la barba mojada de hidromiel ajeno y de vergüenza.',
  },
]
```

### Primer cofre (N5)

*Disparo: al abrir el cofre que aparece tras completar el puzzle (primera vez).*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'El patrón encajó y la montaña soltó un cofre como quien pasa el jarro al que por fin dejó de interrumpir: no gloria, pago de oficio.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Lo abro sin teatro de elegido; si hay metal o memoria dentro, baja al saco y después al taller, donde Brun sabrá si mentí con las manos o no.',
  },
]
```

### Primer cristal

*Disparo: al picar / obtener cristal por primera vez (mena distinta a bronce/hierro).*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Esto no es el pan de hierro del maestro: brilla distinto, pesa distinto, y me pide más paciencia en el pico, como si la veta cobrara peaje por vanidad.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si lo vuelo a fogonazos quizá pierda más de lo que gano; si lo pico bien, el horno tendrá algo que tallar… y yo tendré menos excusas para volver vacío.',
  },
]
```

### Primer golem avanzado (N6)

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Esa piedra no hace ronda: cumple orden, y encaja con la gravedad de esta cámara como un sello en cera caliente.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si esto es aviso del umbral, el “jefe de piso” de mis bromas de jarra quizá deje de ser broma más pronto de lo que mi barba quisiera.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'No lo provoqué por curiosidad barata; hoy el cuerpo ya aprendió —a golpes y a frío— lo que cuesta meter la nariz donde no se pide.',
  },
]
```

### Primera trampa de dardo (N7)

*Disparo: al pisar la primera placa / ver el primer aviso de dardo.*

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'El suelo me avisó —un latido, un rojo, un “no seas idiota”— y desde lejos algo se armó como ballesta de pasillo, no como peña con humor.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En las sagas del mead-hall las trampas eran para héroes despistados; aquí son medida del umbral, y el fuego… a veces las apaga, a veces solo me delata.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Anoto con la barba baja: mirar el piso, no solo la peña. El reloj ya muerde; no necesito que un dardo me enseñe modales.',
  },
]
```

---

## Wipe N1–N2 → menú

Disparo: game over en tutorial (N1 o N2). Progreso se borra; vuelve al menú. **Genérico, repetible**, breve — sin catarsis de taller.

```js
// Opción A
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Caí demasiado pronto, con el permiso todavía caliente y la barba demasiado limpia… el maestro se estaría riendo sin crueldad, solo con razón.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Está bien: si el boleto se enfría, se vuelve a pedir. Otra vez desde la puerta, sin fingir que ya conocía la mina.',
  },
]
```

```js
// Opción B
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Ni siquiera llegué a discutir en serio con el taller: la galería me devolvió al umbral de fuera, como aprendiz que tropieza antes del yunque.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Respiro, limpio el orgullo, y cuando vuelva a bajar… que sea con menos prisa de feria.',
  },
]
```

---

## Fragmentos — worldbuilding

La inscripción habla; el viajero **traduce** con oficio nórdico y con la extrañeza de quien aún compara esta mina con la de su maestro.

| Tipo | Dónde | Función |
| ---- | ----- | ------- |
| **Primer fragmento** | 1ª extracción | Hay lenguaje en la pared |
| **Genéricos A→E** | N3–N5 | Curriculum del Mov. I |
| **R3 A/B/C** | N6 | Trilogía del Excavador |

### Primer fragmento

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Esto no es mena: está incrustado como un tallado a propósito, no como accidente de veta, y me pica el instinto de forja antes que el de botín.',
  },
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Lo que se saca de la piedra no siempre es mineral. A veces es memoria de oficio.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Memoria… entonces el taller no solo funde: también lee, y por eso “lo que uno trae se mide”, como en el yunque de mi maestro cuando el trabajo mentía y el metal no.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En mi tierra guardábamos recetas en tablas junto al fuego; aquí las dejan en la pared, más difíciles de mentir y más fáciles de respetar si uno no es idiota.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si esto es lenguaje, lo cargaré en silencio, sin gritarlo por los túneles como quien presume jarro lleno en sala ajena.',
  },
]
```

### Genéricos (Mov. I)

```js
// A — Peso, no doctrina
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Las Minas Fundacionales no enseñan doctrinas. Enseñan el peso de la piedra.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Peso sí entiendo —lo llevo en los hombros desde el primer saco de mineral—, y doctrinas… mejor después, cuando la barba deje de temblar por cosas más simples.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Me gusta que este lugar no me venda una verdad empaquetada: me da herramientas y me deja elegir el golpe, que es el trato que un enano de oficio puede respetar.',
  },
  {
    speaker: '',
    portrait: 'narrator',
    text: '«El forastero con permiso entra. El oficio decide si permanece.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Ahí otra vez el permiso y su límite: entrar no era quedarme, y mi maestro se estaría riendo con la panza llena de razón.',
  },
]
```

```js
// B — Fuego vs pico
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Quien abre con fuego gana camino. Quien abre con pico gana material. Quien no distingue, pierde ambos.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Esa es la misma pelea que me traigo desde que el pico me pesó distinto a la bomba, y duele reconocerlo porque llegué enamorado del ruido.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En el clan el fuego era amigo del invierno; aquí también, pero ya no puede ser mi única respuesta si quiero volver al taller con algo más que ceniza en el saco.',
  },
]
```

```js
// C — Taller
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Lo que se trae de la corrida se templa abajo. La mina prueba. El taller decide.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces el taller no es premio de cuento: es juicio de yunque, y encaja con todo lo que intuí cuando oí hablar de mesas donde lo mal hecho se ve al instante.',
  },
  {
    speaker: '',
    portrait: 'narrator',
    text: '«No se forja lo imaginado. Se forja lo cargado.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Lo cargado —metal, fragmentos, errores y un poco de hidromiel mental— baja conmigo, y está bien: un enano vacío no tiene nada que templar.',
  },
]
```

```js
// D — Habitada
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«La montaña no está vacía. Camina, vigila, se irrita. Quien entra sordo, sale tarde.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Piedra con pasos, luz con humor, y yo con menos certeza que el primer día, aunque la barba pretenda lo contrario.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'No vine a un almacén silencioso: vine a un lugar que responde, y responde mal si lo trato como botín de jarra vacía, así que preferiré el mundo que responde aunque me cueste el orgullo.',
  },
]
```

```js
// E — Permiso ganado
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«El permiso abre la primera puerta. No abre todas. Algunas se ganan con oficio.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Celebré el sello como si fuera el final del trámite y el brindis del mead-hall; era solo el inicio, y ya lo voy entendiendo con las rodillas.',
  },
  {
    speaker: '',
    portrait: 'narrator',
    text: '«El forastero que aprende a bajar la voz, escucha mejor la veta… y el límite.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Bajar la voz y escuchar el límite: eso suena a la cámara que aún no he visto del todo… y a la que, con esta gravedad en los hombros, ya estoy yendo.',
  },
]
```

### R3 (N6) — trilogía del Primer Excavador

```js
// A — Quién fue
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Uno de los primeros en abrir caminos dentro de la montaña. No por gloria. Por oficio.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Los primeros… entonces esto no empezó conmigo, obvio, pero me hace bien oírlo sin adornos de saga ni trompetas de elegido.',
  },
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Lo llamaron Excavador antes de llamarlo guardián. El nombre correcto es el del trabajo.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Excavar, limitar, vigilar: yo llegué con un solo verbo —avanzar— y ahora me falta vocabulario de oficio, que es la vergüenza más útil que conozco.',
  },
]
```

```js
// B — Qué dejó
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Dejó pasillos que aún respiran. Dejó marcas para quien venga con pico y no solo con prisa.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces no he estado simplemente “pasando galerías”: he estado caminando sobre el trabajo de otro, como aprendiz que ensucia el suelo del maestro sin pedir perdón.',
  },
  {
    speaker: '',
    portrait: 'narrator',
    text: '«También dejó un lugar abajo del ruido: donde lo traído se mide sin mentiras.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'El taller: su mesa prestada, y encaja con las marcas genéricas que ya me venían hablando al oído; intentaré no ensuciarla con decisiones tontas… o al menos con menos.',
  },
]
```

```js
// C — Qué protege
[
  {
    speaker: '',
    portrait: 'narrator',
    text: '«No protege un tesoro. Protege un límite. La pregunta no es cuánto puedes sacar… sino por qué cruzas.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: '¿Vengo a tomar de la montaña o a conocerla? Llevo el Movimiento entero rozando esa frase como quien rodea el yunque sin atreverse al primer golpe limpio.',
  },
  {
    speaker: '',
    portrait: 'narrator',
    text: '«Quien responde con botín solo, encuentra muro. Quien responde con oficio, encuentra umbral.»',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Umbral, no victoria: me cuesta cambiar la palabra porque en mi sala amamos los finales ruidosos, pero aquí la palabra correcta pesa como hierro bien templado, y cuando lo vea no voy a gritar que vine a ganar —voy a demostrar, si puedo, que vine a entender el corte.',
  },
]
```

---

## Primer Excavador

En el **inicio de N7** ya corrige el chiste del jefe de piso y explica la prueba.

### Durante el encuentro (pool) — *repetible con cooldown*

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Rápido con la bomba… lento con el juicio.',
  },
]
```

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'El pico pregunta y la explosión exige: ¿cuál eres ahora, cuando el tiempo muerde?',
  },
]
```

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'La montaña ya dio lo suyo; tú decides si dejas algo en el camino o solo huellas de prisa.',
  },
]
```

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'He visto forasteros contar botín como quien cuenta jarros; pocos cuentan el tiempo que les queda.',
  },
]
```

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'No protejo un cofre: protejo un límite, y no lo cruces a ciegas aunque tu cuento diga lo contrario.',
  },
]
```

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Si leíste las marcas de la cámara, ya sabías que esto no era un “jefe de piso” de jarra.',
  },
]
```

### Al final — reconocimiento (prueba superada)

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Bastante: no viniste solo a vaciar la veta, aunque al principio olieras a eso.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Vi el fuego y el pico, torpe a ratos y humano siempre; a veces eso basta… si hay intención detrás de la barba.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Te reconozco, viajero, y la montaña también; más adelante el reino pedirá una mirada, no solo un pico, y cuando llegue esa hora elige con las manos limpias.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces no era el jarl del sótano: era el permiso de seguir pensando, qué anticlímax tan honesto para un enano que esperaba más ruido al final.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Guardaré el límite, y cuando me vuelva la prisa intentaré recordar el pico… y al maestro, aunque se equivoque a veces, porque yo también.',
  },
]
```

### Prueba fallida (umbral no superado)

Disparo: al fallar N7. Runtime: repetir N6 y luego reintentar N7; mejoras del Taller se conservan.

#### Primera vez (no se repite)

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Basta por hoy. El límite no se abre a fuerza de prisa, y tú acabas de demostrarlo con las manos todavía calientes.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'No te echo: te devuelvo. La cámara antigua sigue ahí, y el umbral no se mueve porque un viajero se impaciente.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Vuelve al preámbulo, lee otra vez lo que dejaste a medias —pico, tiempo, intención— y cuando regreses, que no sea a tumbar un “jefe de piso”.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: '…Duele el orgullo más que las costillas, qué detalle tan mío. Está bien: si el límite no se abrió, es que yo todavía no sabía cómo llamar a la puerta.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Eso. Ahora baja al Taller si hace falta templar lo cargado, y después vuelve a la cámara. El oficio espera; el espectáculo, no.',
  },
]
```

#### Reintentos (genérico, sí se repite)

Cada fallo posterior de N7. Corto, mismo mensaje de fondo, sin recontar la lección entera.

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Otra vez el límite te cerró el paso. No es castigo: es medida. Vuelve a la cámara antigua, ajusta el ritmo —fuego, pico y reloj— y no me traigas prisa disfrazada de coraje.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entendido. Preámbulo otra vez… y esta vez sin inventarme un jarl en la puerta.',
  },
]
```

### En el Taller (tras reconocimiento)

El Excavador habita el hub **después** de superar N7. Brun sigue al frente del horno y el yunque; el Excavador aporta lore y consejo seco, sin doctrinas.

#### Llegada (one-shot)

```js
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Aquí se templa lo que traes, no lo que imaginas merecer, y eso debería sonarte a forja aunque el yunque sea de otra sala.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'La mina te enseñó peso; el yunque te enseñará consecuencia, así que si dudas baja el ritmo: la forja perdona menos que la mina.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: '¡Eh, no me roben el discurso del yunque! Yo soy el que se quema las cejas aquí abajo… aunque, bueno, si el Excavador quiere gruñir un poco, el metal también escucha.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Trato hecho: prefiero un maestro seco y un tallerista amable a un elogio de “elegido”, y ya tuve bastante jefe de piso dando vueltas en la cabeza.',
  },
]
```

#### Lore / consejo (one-shot cada una; rotar o disparar al hablar tras la llegada)

```js
// Oficio y límite
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Brun te calienta el acero; yo te recuerdo el porqué. Si forjas solo para hacer más ruido, el umbral te habrá reconocido en vano.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces el yunque también es pregunta… qué molestia tan útil.',
  },
]
```

```js
// Lo que viene (sin spoilers de doctrinas)
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Más adelante el reino pedirá una mirada, no solo un pico. Todavía no es esa hora: los umbrales de afuera esperan apagados a propósito.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Bien: primero no mentir con las manos aquí abajo. El resto… cuando la montaña deje de susurrar y empiece a preguntar en serio.',
  },
]
```

```js
// Brun y el viajero
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Ese enano del horno se quedó corto en el límite y aun así sostiene el oficio. No lo tomes a broma: quedarse también es una respuesta.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Oye, estoy aquí, ¿eh? Y sí: me quedé. El carbón no me juzga… mucho.',
  },
]
```

```js
// Recurso vs conocimiento
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Traer metal no es lo mismo que entender la veta. El taller mide las dos cosas, aunque Brun diga que solo mide lingotes.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Mido lingotes y caras. Las caras mienten menos cuando el horno está caliente.',
  },
]
```

### Tres portales (primera vista) — *one-shot*

Disparo: tras reconocimiento N7, cuando los portales Piedra / Eco / Llama quedan **visibles pero inactivos** (en el escenario del umbral o al volver al hub, según layout). Sin nombrar doctrinas ni forzar elección.

```js
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Tres bocas quietas, tres umbrales que no me llaman todavía… como puertas de mead-hall cerradas hasta que el jarl diga la hora, solo que aquí no hay jarl y yo no voy a inventarme uno otra vez.',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Presentes. No en uso. La montaña no te pide mirada hasta que tú hayas aprendido a bajar la voz.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces las miro sin tocarlas, como se mira el yunque ajeno: con respeto y con las manos en el cinturón.',
  },
]
```

---

## El Taller — Brun

Habitante del mundo (no forastero). Simpático, amable, a veces no entiende las referencias del viajero. Encargado del **horno** y el **yunque**. Empezó la aventura hace poco, como el viajero, pero **no pasó la prueba del umbral** y eligió quedarse: aún desea conocer la montaña… desde el calor del metal.

Nombre provisional: **Brun**. Speaker `BRUN`, portrait `smith`.

### Arco de amistad

| Momento | Tono |
| ------- | ---- |
| Tras N2 (única batida) | **Introducción**: conocido reciente; qué ofrece el Taller; sin catarsis aparte |
| Tras N3 | **Primer reencuentro**: primera corrida seria después de conocerse; catarsis de profundidad |
| N4–N5 | Consejos y catarsis; empieza a pillar el humor del viajero a medias |
| N6–N7 | Confianza; se preocupa de verdad; celebra oficios juntos |
| Idle (sin `hubEntry`) | Charla corta al hablar con Brun / Excavador; ver pools idle |
| Tras Excavador en hub | Trío raro: Brun cálido, Excavador seco, viajero en el medio |

`hubEntry` del save: `'advance'` (nivel completado) · `'retry'` (nivel fallido).

- Completar **N2** → hub con batida de **introducción** (no hay “Tras N2” aparte).
- Completar **N3+** → hub con catarsis `advance` de ese nivel.
- Fallo **N1–N2** → menú (wipe); fallo **N3+** → hub con consejo `retry`.

### Primera visita — introducción (tras completar N2)

Disparo: primera vez que el viajero entra al hub. **Esta es la batida de N2→Taller**; no hay segunda conversación de “nivel completado” en ese mismo regreso.

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: '¡Eh! Otro con el sello todavía caliente… yo también empecé hace poco, aunque mi aventura se quedó a mitad de galería y acabé aquí, entre carbón y paciencia.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'No pasé la prueba de más abajo —el umbral, ya sabrás— y preferí quedarme donde el metal responde cuando uno pregunta bien; igual quiero conocer la montaña, solo que mi camino ahora pasa por el horno y el yunque.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entonces somos dos con permiso fresco y orgullo a medias… yo acabo de salir de la boca con el pico y la bomba todavía discutiendo en la cintura; tú le sacas jugo a lo que yo no sepa templar.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Trato justo, y bienvenido el olor a mena nueva. Mira: el **horno** convierte crudo en refinado —bronce, hierro, cristal— y el **yunque** forja mejoras si traes material y, más adelante, fragmentos de receta; sin misterio de templo, solo oficio.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Trae lo de la corrida, funde lo que haga falta, y si desbloqueas un rango o clavas una mejora, avísame: me gusta ver cuando el viaje se nota en el acero… y cuando el viajero vuelve con cara de haber aprendido algo sin querer.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Si empiezo a hablar de jarls de sótano o jefes de piso, tú solo asiente y pásame el lingote: a veces mi boca va más rápido que mi pico.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: '…¿Jarl de qué? Da igual: aquí el único “jefe” es el calor del horno. Bienvenido al Taller, vecino.',
  },
]
```

### Ruta por nivel — completado (`hubEntry: 'advance'`)

Catarsis **única** por nivel (N3+). Hablar de **haber sobrevivido a las dificultades** del curriculum (visión, enemigos, fuego vs cuidado, marcas, reloj, trampas) como experiencia vivida — sin nombrar HUD, tiles ni botones.

#### Tras N3 — La Profundidad

*Curriculum: luz que ya no regala el suelo; golems que patrullan y se enfurecen si uno los golpea; minar / avanzar con alguien de piedra cerca; primer fragmento.*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Ahí estás… con la capa más pesada. ¿La oscuridad te acortó el camino o fueron las peñas que andan?',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Las dos: de pronto no veía tan lejos como en la boca, y encima la piedra dejó de ser pared y empezó a hacer la ronda; si la despertaba a martillazos, venía a cobrarme el ruido.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Entre picar mena y no quedarme pegado a un guardia dormido… volví pensando en tu yunque como en la mesa del clan después de un mal turno.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Eso es el Taller: traes lo de la corrida, fundes, y si te hizo falta más temple o más aire en el pecho, forjamos. Ya no eres visita: eres vecino con polvo en la barba.',
  },
]
```

#### Tras N4 — Los Habitantes

*Curriculum: visión corta de verdad; espíritus que se irritan con explosiones; golems + luces a la vez; moverse sin “ver todo el mapa”.*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Vienes con frío en la voz. ¿Te apretó la oscuridad… o las luces que no son linterna?',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Las dos otra vez: apenas alcanzaba a leer el suelo delante, y cuando soltaba fuego para abrirme paso las luces se ponían feas, como si el fogonazo fuera un insulto en su casa.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Así que aprendí a elegir el golpe: a veces rodear, a veces picar, y no despertar a la peña y al vecino brillante en el mismo aliento.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Los vecinos de luz no perdonan el portazo. Si el yunque puede darte margen —respiro, temple, pasos— dímelo: prefiero tu barba completa a un relato heroico.',
  },
]
```

#### Tras N5 — La Recolección

*Curriculum: marcas / bloques que hay que activar en orden; cofre al completar; enemigos mientras uno piensa; castigo por tocar mal o con prisa.*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Traes cara de quien esperó medio latido antes de tocar lo brillante… ¿te cobraron las marcas del piso?',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Había un orden en las piedras: si me adelantaba, me gritaban en rojo; si me quedaba mirando demasiado, la ronda de abajo me encontraba con las manos ocupadas.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Cuando por fin encajó el patrón y el cofre soltó su precio… sentí menos gloria que alivio de no haber vuelto a despertar a todo el pasillo por un toque torpe.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Eso es oficio. Funde lo que trajiste y, si quieres más calma en las piernas o en el pecho, el yunque está despierto.',
  },
]
```

#### Tras N6 — La Cámara Antigua

*Curriculum: golem “terminado” que no perdona; mezcla de peñas y luces; puzzles más densos; fragmentos pesados; sensación de preámbulo al umbral.*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Esa cámara se te pegó en los hombros. ¿Fue la peña grande… o el trabajo de leer y pelear a la vez?',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'La peña grande no hacía siesta: venía con ganas, y mientras tanto había que mirar marcas, no despertar luces con fuego y todavía sacar memoria de la pared sin quedarme quieto como tonto.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Salí con fragmentos que pesan distinto y con la certeza de que el umbral ya me estaba midiendo desde lejos… sin haberme presentado todavía.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Entonces no subas vacío de oficio. Funde, forja, abre receta si puedes, y celebra bajito: la montaña tiene oídos raros.',
  },
]
```

#### Tras N7 — Umbral superado

*Curriculum: reloj encima; trampas; carrera de recursos; elegir bomba/pico bajo presión; la “prueba” no es solo tumbar.*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Lo lograste. Se te ve el reloj todavía en la nuca… ¿fue el tiempo, las trampas, o admitir que no era un jarl de sótano?',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Las tres: el tiempo me mordía, el suelo me pedía cuidado, y encima tenía que sacar metal sin gastar el mundo a fogonazos… me costó el orgullo dejar de buscar un monstruo final y hacer la prueba en serio.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Yo me quedé corto ahí; por eso el carbón me conoce mejor que la gloria. Mientras, el Taller sigue siendo mío en el día a día —y ahora también gruñe el Excavador cerca—: horno, yunque, y un amigo que vuelve con historias que no siempre entiendo.',
  },
]
```

### Ruta por nivel — fallido (`hubEntry: 'retry'`)

Consejo **genérico y repetible** cada vez que se falle ese nivel (N3+). Anclado a la dificultad del curriculum, sin catarsis nueva.

#### Fallo en N3 — *repetible*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'La profundidad muerde así: poco alcance de vista y peñas que no quieren que uno pico a ciegas. No pelees cada ronda; elige cuándo hacer ruido.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Si te falta temple o respiro, forjamos; si te falta calma, vuelve a bajar sin jurar en la primera esquina. El Taller no se cansa de recibirte.',
  },
]
```

#### Fallo en N4 — *repetible*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Oscuridad justa y luces de mal humor: no abras camino a fogonazos si puedes rodear, y no despiertes a la peña y al vecino brillante juntos.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Calentamos manos y acero aquí; tú eliges el golpe allá. Luego vuelves, ¿sí?',
  },
]
```

#### Fallo en N5 — *repetible*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Marcas y trampas: si no estás seguro, no toques; si ya tocaste mal, memoriza el patrón antes del orgullo. La pelea espera: el orden, no.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Funde, forja un poco de margen, y vuelve con las manos menos ansiosas.',
  },
]
```

#### Fallo en N6 — *repetible*

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'La cámara antigua mezcla peña dura, luces y trabajo de marcas: no se corre, se lee entre esquivas. Si te dobló, es aviso del umbral, no vergüenza.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Templa lo necesario y no subas al límite solo por demostrar ruido. Yo me quedé aquí por menos… y aún así quiero que tú pases.',
  },
]
```

#### Fallo en N7 — *repetible* (tras Excavador)

Brun recibe al viajero que debe **repetir N6**. Misma batida en cada reintento de umbral fallido.

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Otra vez el umbral… se te ve el reloj en la cara. Yo también me quedé corto ahí; por eso el carbón me conoce mejor que la gloria.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'El Excavador te manda al preámbulo: cámara antigua otra vez, ritmo otra vez. Si el yunque puede ayudar —margen, temple, aire— aquí estoy, siempre.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'De vuelta a estudiar, sin jarl inventado en la puerta.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'No sé qué es un jarl, pero sí un segundo intento con mejores manos. Horno primero, orgullo después.',
  },
]
```

### Mejoras forjadas (primera vez que sube un rango)

Una batida corta al completar craft en el yunque. Brun celebra; a veces no pilla la metáfora del viajero.

```js
// Capacidad (maxBombs)
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Más bombas en la cintura… con cuidado, ¿eh? El ruido es herramienta, no personalidad.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En mi sala dirían que amplié el coro de martillos; yo solo quiero no quedarme mudo frente a un muro terco.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Coro de… está bien, me río aunque no entienda del todo. Que el metal te responda.',
  },
]
```

```js
// Alcance (bombRange)
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Alcance más largo: útil en cruce feo, peligroso si olvidas quién vive al lado del fogonazo.',
  },
]
```

```js
// Temple (pickSpeed)
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Temple en el pico: eso sí me gusta. Menos pelea con el reloj y más respeto a la veta.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Mi maestro sonreiría con medio ojo; yo fingiré que siempre quise ir despacio.',
  },
]
```

```js
// Fortuna
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Un poco de fortuna en el golpe… la montaña a veces regala, a veces solo aparenta. No te confíes del brillo.',
  },
]
```

```js
// Pasos (moveSpeed)
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Pasos más ligeros: bien para salir de un apuro, mal si corres hacia el apuro. Tú sabrás.',
  },
]
```

```js
// Respiro (maxLives / vida)
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Más respiro bajo la capa: que sea margen, no invitación a ser imprudente. Me caíste bien demasiado pronto para perderte por tonto.',
  },
]
```

### Subir de nuevo la misma mejora (rango 2 / 3) — *repetible genérico*

Cuando ya se oyó la batida “primera vez” de esa línea y el viajero forja otro rango. Corto; rotar opciones.

```js
// Opción A
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Otro temple encima del anterior… el metal acepta, el bolsillo protesta. Bien hecho, sin alarde.',
  },
]
```

```js
// Opción B
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Subiste otra vez la misma línea. Yo solo digo: que el peso nuevo te sirva abajo, no aquí para presumir chispas.',
  },
]
```

```js
// Opción C
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Más de lo mismo, pero mejor… como afilar el pico que ya conoces en vez de inventar uno de saga.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Eso. Oficio repetido con juicio. Me gusta.',
  },
]
```

### Primera fundición (horno) — *one-shot*

Disparo: primer refine exitoso (crudo → refinado). Brun guía el gesto; el viajero lo siente como mesa del clan.

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Ahí: crudo entra, lingote sale. El horno no perdona prisa ni humedad de excusas… pero perdona al aprendiz que pregunta con las manos.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En mi tierra el fuego también decidía quién mentía en el trabajo; aquí huele igual, aunque la cera del permiso todavía me pique en la palma.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Trae más de la corrida cuando puedas. Sin refinar, el yunque solo hace ruido bonito… y yo ya tengo bastante ruido con el Excavador gruñendo cerca —cuando toque.',
  },
]
```

### Primera aleación — *one-shot*

Disparo: primer craft de aleación en el horno/yunque (bronce templado, acero de mina, cristal engarzado, etc.).

```js
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Dos metales que se aguantan el uno al otro… eso ya no es pan simple: es pan de invierno con algo más. Rangos altos lo van a pedir.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Mi maestro mezclaba a ojo y a insulto cariñoso; yo lo haré a receta, aunque me tiemble el orgullo de “saber de fábrica”.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Fábrica o no: si el lingote canta limpio, el resto es cuento. Guárdalo para cuando el yunque se ponga exigente.',
  },
]
```

### Recetas desbloqueadas (R2 / R3)

```js
// R2 genérico ensamblado
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Fragmentos genéricos en su sitio… mirá: la pared te prestó memoria y el yunque la convirtió en permiso de subir de rango. Bonito oficio, ¿no?',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'En mi tierra eso habría sido tabla junto al fuego; aquí es muro que habla. Sigo prefiriendo no gritarlo por los túneles.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Bien. Silencio de buen metal. Cuando quieras el siguiente temple, ya sabes dónde estoy.',
  },
]
```

```js
// R3 especializado (post N6)
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Eso… eso ya no es chatarra de corrida. Se siente a cámara antigua. ¿Leíste algo que te dejó pensativo?',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Leí límites y nombres de trabajo; el yunque ahora sabe más de lo que yo sabía al bajar, y eso me alivia y me pesa a la vez.',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Entonces forjamos con respeto. Yo no pasé el umbral, pero puedo ayudarte a no llegar a él con las manos vacías.',
  },
]
```

### Idle — hablar con Brun (`hubEntry` null) — *repetible*

Cuando no hay catarsis ni consejo de fallo pendiente: el viajero inicia charla (E / cerca del NPC). Pool con cooldown; tono de amistad según arco (más cálido tras N5+).

```js
// A — Oficio cotidiano
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Si no traes mena, al menos trae noticias de abajo… o silencio cómodo. El horno acepta las dos cosas.',
  },
]
```

```js
// B — Humor a medias
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: '¿Sabes lo que es un jarl de sótano?',
  },
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'No… y por tu cara, mejor que no lo sepa. ¿Quieres lingote o terapia de carbón?',
  },
]
```

```js
// C — Cuidado
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Baja con el cinturón bien cerrado. Me gusta tener vecinos que vuelven, no vecinos que se convierten en cuento triste junto al yunque.',
  },
]
```

```js
// D — Tras conocerse bien (N6+)
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'A veces envidio tu permiso fresco… y a veces no. Yo tengo calor seguro; tú tienes preguntas que pesan. Igual me alegra verte.',
  },
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: 'Y a mí oír un “igual me alegra” sin trompetas de saga. Gracias, Brun.',
  },
]
```

```js
// E — Con Excavador ya en hub
[
  {
    speaker: 'BRUN',
    portrait: 'smith',
    text: 'Si el seco de allí te gruñe, ven aquí: yo traduzco a calor de horno. Él traduce a límite. Entre los dos no te dejamos mentir del todo.',
  },
]
```

### Idle — hablar con el Excavador (hub) — *repetible*

Tras la llegada y las batidas de lore one-shot. Pool seco; sin doctrinas; cooldown.

```js
// A
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'El carbón habla más que yo. Pregúntale a Brun si quieres consuelo; a mí pregúntame si quieres medida.',
  },
]
```

```js
// B
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Los portales siguen quietos. Bien. Quien empuja una puerta apagada solo demuestra prisa.',
  },
]
```

```js
// C
[
  {
    speaker: 'VIAJERO',
    portrait: 'player',
    text: '¿Todavía soy “forastero con permiso” para ti?',
  },
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Sí. Y eso no es insulto: es inventario. El oficio decide el resto.',
  },
]
```

```js
// D
[
  {
    speaker: 'PRIMER EXCAVADOR',
    portrait: 'excavator',
    text: 'Si vuelves a la mina solo a vaciar vetas, el límite ya te midió una vez… y puede medirte otra, aunque no esté en la puerta.',
  },
]
```

---

## Notas de implementación

**Runtime (cableado):**

| Pieza | Dónde |
| ----- | ----- |
| Flags one-shot | `GameState.narrativeFlags` + `hasSeen` / `markSeen` (save v4) |
| Cola diálogo → tutorial | `NarrativeDirector` + registro [`narrativeEvents.js`](../src/config/narrativeEvents.js) |
| Textos de diálogo | [`dialogues.js`](../src/config/dialogues.js) — **rellenar desde este doc** por el mismo `id` |
| Tutoriales (teclas) | [`tutorials.js`](../src/config/tutorials.js) + `TutorialView` (panel centrado) |
| NPCs hub | Brun siempre; Excavador si `excavatorInHub` (tras N7) |

**Contrato:** para incorporar una batida, pegar entradas en `dialogues.js` con el `id` del evento. Si el diálogo es `[]`, el director salta al tutorial siguiente. No hace falta tocar escenas.

| Evento / batida | id canónico |
| --------------- | ----------- |
| Inicio N1–N7 | `level.start.0` … `level.start.6` |
| Descubrimientos | `discovery.destructible`, `.golem`, `.spirit`, `.marks`, `.chest`, `.crystal`, `.golemAdvanced`, `.trap`, `.fragment` — disparo al **mirar** (tile de delante) por primera vez; diálogo stub + tutorial si aplica |
| Hub intro + tutorial taller | `hub.intro` (+ `tut_workshop`) |
| Hub advance / retry | `hub.advance.2`…`6`, `hub.retry.2`…`6` (índice de nivel 0-based) |
| Idle NPC | `hub.idle.brun`, `hub.idle.excavator` (repetible, `forceFire`) |
| Primera fundición | `craft.firstSmelt` (+ `tut_smelt`) |
| Tutoriales teclas | `tut_move_bomb`, `tut_pick`, `tut_fragment`, `tut_marks`, `tut_chest`, `tut_trap`, `tut_workshop`, `tut_smelt` |

Aún no cableados (hooks vacíos / pendientes): wipe N1–N2, portales, retry genérico de inicio de nivel, corpus completo de este documento.

La capa isekai queda **fuera de diálogo** salvo indicios tardíos y sutiles (ver tabla de revelación lenta).

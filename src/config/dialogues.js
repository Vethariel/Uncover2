/**
 * Diálogos Mov. I — editar aquí. docs/DIALOGUES.md es referencia de diseño.
 * expression viajero: calm | angry | tired | embarrassed | smirk | surprised | thoughtful | happy
 * expression excavador: stern | thoughtful | correcting | approving | dismissive
 * expression brun/smith: warm | happy | concerned | smirk | wistful
 */

/** @typedef {{ speaker: string, portrait: string, text: string, expression?: string, animation?: object }} DialogueLine */

function isDialogueLine(value) {
  return value != null && typeof value === 'object' && typeof value.text === 'string'
}

function isDialogueScript(value) {
  return Array.isArray(value) && value.length > 0 && isDialogueLine(value[0])
}

function isDialoguePool(value) {
  return Array.isArray(value) && value.length > 0 && Array.isArray(value[0])
}

function pickFromPool(variants) {
  const idx = Math.floor(Math.random() * variants.length)
  return variants[idx] ?? []
}

/** @type {Record<string, DialogueLine[] | DialogueLine[][]>} */
const DIALOGUES = {
  "level.start.0": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "El sello todavía me quema un poco en la palma, como si la cera no hubiera decidido si soy digno o solo ruidoso, y mi maestro de forja —ese viejo de mead-hall y martillo eterno— ya me estaría gruñendo que esto no es victoria sino boleto, y por una vez le doy la razón sin pelear.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Boleto a las minas, nada más: no vine a enderezar reinos ni a peinarme el destino como en esas sagas donde el héroe elige estirpe antes del desayuno; vine a cruzar la primera boca de piedra con linterna, nervios y la barba todavía demasiado limpia.",
      "expression": "smirk"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "En mi tierra abríamos galerías con prisa y con fuego de carbón, y aquí me sueltan bombas “de la nada”, un truco que huele menos a taller y más a feria… aunque confieso que sé hacer ruido cuando la pared se pone terca.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Así que adelante, primera puerta, camino corto: quiero ver la boca de la mina antes de que el permiso se enfríe como hidromiel olvidada sobre la mesa.",
      "expression": "calm"
    }
  ],
  "level.start.1": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Y ahí está, por fin: la boca de verdad, no un prólogo eterno ni un vestíbulo de cuento, sino piedra sudada y ese olor a mineral que en el clan confundíamos con el olor a casa.",
      "expression": "surprised"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Mi maestro hablaba de las vetas como quien habla del pan del invierno —“si ves metal, no lo mires como joya, tómalo o alguien más lo hará”— y ahora que me pusieron pico en la mano entiendo el refrán con los hombros: ya no solo atravieso, también recojo.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Bronce, hierro, lo que la pared suelte; la bomba abre y el pico pregunta, y si elijo mal no podré echarle la culpa a la montaña porque seré yo, enano torpe, tirando precio por prisa.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Propósito claro, entonces: materiales al saco y la barba fuera del camino, que el resto de la aventura ya cobrará peaje cuando la montaña quiera.",
      "expression": "calm"
    }
  ],
  "level.start.2": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "La luz ya no me la regalan igual: como si alguien hubiera bajado la lámpara del mundo un par de mechas, y de pronto el túnel se estrecha no solo en piedra sino en confianza.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "“Cuando la vista se estrecha, ahí empieza el trabajo de verdad”, decía el maestro con la voz de yunque, y odio admitir —con esta barriga que aún busca el mead-hall— que otra vez tenía razón.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Entonces esto no era el vestíbulo eterno: esto es la aventura, y se me afloja un poco el estómago como al aprendiz el primer día frente al fuego vivo, qué detalle tan ridículamente humano.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "En sus sagas la piedra dormía la siesta de los siglos, pero aquí siento rondas: piedra con turno de noche, como si el clan de abajo hubiera dejado guardias sin avisar al recién llegado.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Está bien: miro antes de golpear, no confío solo en el fuego, y procuro no decir “fácil” en voz alta… aunque la lengua me pica, perdón montaña, era broma de taberna y no un desafío.",
      "expression": "embarrassed"
    }
  ],
  "level.start.3": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Hay un viento aquí abajo —y no debería— que me entra por el cuello como escarcha de puerto norteño, como si la mina me revisara los bolsillos y la dignidad al mismo tiempo.",
      "expression": "surprised"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Primero se me cerró la vista y ahora el aire muerde, y el cuerpo, traidor útil, entiende antes que el orgullo de forja: esta tierra no es mi fiordo, aunque se le parezca en el frío.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si veo luces que no son linternas de aceite, no son adornos de sala: son vecinos, y el viento sugiere que no vinieron a brindar hidromiel con el recién llegado.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "El maestro nunca mencionó este frío; hablaba de coraje junto a la brasas, qué conveniente cuando uno enseña desde la mesa y no desde la galería.",
      "expression": "smirk"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Respiro hondo, me ajusto la capa de viaje y sigo, no por héroe de saga sino porque quedarme quieto también congela, y un enano quieto es un chiste malo esperando su final.",
      "expression": "smirk"
    }
  ],
  "level.start.4": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Ya vi lo que pasa cuando uno tira fuego como si fuera pirotecnia de feria de verano: los espíritus no aplauden, y la montaña tampoco sirve ronda a los ruidosos.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Así que cuidar no es ponerme halo de santo del clan; es no despertar lo que no puedo pagar, lección cara que mi barba aún está digiriendo.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Aquí hay un orden —marcas, pruebas, cosas que piden mano o piden distancia— y me recuerda a los tallados del vestíbulo de mi maestro, donde el torpe tocaba lo que no debía y pagaba con orejas calientes.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Antes corría al brillo como aprendiz tras la chispa; ahora me paro un segundo, un segundo humano que no me hace sabio pero sí me evita un golpe, y con eso me basta.",
      "expression": "calm"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Materiales, sí, pero con las manos más quietas: si el viejo me viera diría “por fin”, y yo fingiría —con cara de yunque serio— que siempre fui así.",
      "expression": "smirk"
    }
  ],
  "level.start.5": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "El frío del viento se fue y dejó otra cosa, más pesada, como si la tierra misma se hubiera sentado en los hombros a pedir cuentas del camino.",
      "expression": "tired"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "No es el frío de fiordo: es gravedad de lugar, y esta cámara no se viste como el resto de la mina; se ve más antigua, más intencionada, como el salón grande del clan donde uno baja la voz sin que nadie lo mande.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si hay fragmentos aquí, no son chatarra para el yunque: son avisos, y los leeré como leíamos en casa los tallados junto a la puerta —no por poesía, sino para no resbalar donde otros ya resbalaron.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Adelante, entonces, con cuidado de enano viajero y no con pose de elegido: la barba ya aprendió que el teatro se paga caro bajo techo de piedra.",
      "expression": "smirk"
    }
  ],
  "level.start.6": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Sobreviví a esa mole de piedra “terminada” y todavía me tiemblan las manos, detalle poco heroico y muy mío, como el temblor después del primer martillazo que sale mal en la forja.",
      "expression": "tired"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Entonces es aquí, ¿no?, el jefe de piso, el jarl del sótano, el golem gigante que uno tumba rapidito antes del brindis —así terminan los sótanos en las historias que contábamos con la jarra en la mano: puerta grande, monstruo más grande, y uno fingiendo que sabía el final.",
      "expression": "smirk"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "No. No soy tu “jefe de piso”, ni tu jarl de cuento, y esto no es pelea para presumir fuego de feria.",
      "expression": "correcting"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Es una prueba de cómo tomas y de cómo conoces: recursos, tiempo, pico y bomba, mientras el límite te mira sin aplaudir.",
      "expression": "stern"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Ah… claro, me adelanté otra vez al final del cuento, típico de quien trae la cabeza llena de refranes del maestro y finales demasiado limpios.",
      "expression": "embarrassed"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Bien: admite el error. Ahora corre… con juicio.",
      "expression": "approving"
    }
  ],
  "level.retry.generic": [
    [
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Otra vez la misma boca de piedra, y la barba un poco más corta de orgullo: el maestro diría que el yunque no se ofende si uno vuelve a golpear, solo si uno deja de intentarlo.",
        "expression": "tired"
      },
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Bien: cinturón apretado, linterna lista, y sin fingir que la primera bajada ya me hizo jarl de nada.",
        "expression": "calm"
      }
    ],
    [
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Caí, volví al calor del taller, y aquí estoy otra vez oliendo a mineral y a humillación ligera… que es el peaje de quien aprende con las manos.",
        "expression": "embarrassed"
      },
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Adelante, despacio: la montaña no me debe un final limpio solo porque yo lo pedí en voz alta.",
        "expression": "calm"
      }
    ],
    [
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Si el permiso todavía vale, yo todavía bajo; si la galería se ríe, que se ría —yo también me río de mí antes de que lo haga nadie más.",
        "expression": "smirk"
      }
    ]
  ],
  "level.retry.0": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Todavía no he llegado de verdad a las minas, y ya me toca repetir el pasillo como aprendiz que pierde el camino entre el mead-hall y la forja.",
      "expression": "tired"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Bomba si hace falta, pasos sin teatro: quiero ver la boca antes de que el permiso se me vuelva solo papel caliente en la palma.",
      "expression": "calm"
    }
  ],
  "level.retry.1": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Otra vez en la boca donde se toma: el maestro no me perdonaría volver con el saco vacío por orgullo de haber “casi” recogido.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Pico y fuego con juicio; esta vez elijo qué romper y qué guardar, aunque la pared me tiente a hacer ruido de feria.",
      "expression": "calm"
    }
  ],
  "level.retry.2": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Otra vez la profundidad que muerde la vista: sé que no veo lejos, y aun así la última vez empujé como si la linterna fuera un sol de saga.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Hoy elijo cuándo hacer ruido. Si la peña se pone terca, la abro; si no, paso de lado y dejo el orgullo en el cinturón, donde no estorba.",
      "expression": "calm"
    }
  ],
  "level.retry.3": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "El frío del viento ya lo conocí; lo que me tumbó fue pelear a fogonazos en la oscuridad justa, como quien enciende la sala entera para buscar un clavo.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Rodear cuando pueda, despertar luces solo si de verdad hace falta, y no juntar peña y vecino brillante en el mismo estallido… eso es lo que me repito, aunque la mano quiera bomba.",
      "expression": "thoughtful"
    }
  ],
  "level.retry.4": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Volví porque las marcas se rieron de mí, o yo de ellas: toqué mal, y la galería cobró el peaje sin pedir permiso a mi barba.",
      "expression": "embarrassed"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Esta vez miro el patrón antes del orgullo. Si no estoy seguro, no toco; si ya toqué, memorizo, aunque el ruido del combate me tire del codo.",
      "expression": "thoughtful"
    }
  ],
  "level.retry.5": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Otra vez la cámara que pesa distinto: aquí no se corre de peña en peña como en pasillo de principiante; se lee entre esquivas, con la tierra sentada en los hombros.",
      "expression": "tired"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si hay umbral más allá, no lo merezco a gritos. Bajo con juicio, recojo lo justo, y dejo el teatro de “jefe de sótano” para cuando alguien me corrija… otra vez.",
      "expression": "smirk"
    }
  ],
  "level.retry.6": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Otra vez el umbral, y ya no traigo el chiste del jefe de piso en la lengua: traigo el peaje de haberlo dicho, y las manos un poco más honestas.",
      "expression": "embarrassed"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Otra vez. Recursos, tiempo, pico y bomba. El límite no aplaude repeticiones… pero tampoco perdona quien no vuelve.",
      "expression": "stern"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Entendido. Corro con juicio, aunque me tiemble la barba.",
      "expression": "calm"
    }
  ],
  "discovery.destructible": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Roca que se deja trabajar: el “pan del invierno” del maestro, pegado a la pared como si la montaña hubiera horneado metal para el que llega con el saco vacío.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si la vuelo, abro camino; si la pico, quizá pago el viaje, y las dos opciones me tiran del cinturón como dos jarros de hidromiel en la misma noche —dilema de principiante, sí, pero mío.",
      "expression": "smirk"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Propósito: materiales. Empezaré sin fingir que no me gusta el ruido del fuego… y sin olvidar que el precio también se siente en la barba cuando uno vuelve al taller con las manos vacías.",
      "expression": "calm"
    }
  ],
  "discovery.golem": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Piedra con turno de noche: el maestro se quedó corto en la saga, o yo escuché mal entre el ruido del yunque y la risa de la mesa.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Parece cansado, y yo también; si lo despierto a lo bruto seré el del chiste malo, ese que confunde guardia con saco de botín.",
      "expression": "tired"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Miro dos veces, no por sabio del clan sino porque me da un poco de miedo, y el miedo —como el frío del norte— a veces es brújula disfrazada de vergüenza.",
      "expression": "embarrassed"
    }
  ],
  "discovery.spirit": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Luz que no es linterna de aceite: el frío del viento ahora tiene cara, y no es la cara amable del anfitrión que pasa el jarro.",
      "expression": "surprised"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si mi fuego lo irrita, entonces “abrir camino” también puede ser portazo en casa ajena, y en mi tierra eso se paga con orejas calientes… aquí quizá con algo peor.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Anoto con la vergüenza útil del aprendiz: menos pirotecnia, más oído, y la capa bien cerrada contra este viento que no debería existir.",
      "expression": "embarrassed"
    }
  ],
  "discovery.marks": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Piedras en el piso que no son mena ni basura: están puestas como quien deja el orden del trabajo junto a la puerta del clan, para que el torpe no entre gritando.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si las toco a lo bruto, la galería me va a cobrar el peaje en rojo; si me quedo mirando demasiado, la ronda de abajo me encuentra con las manos ocupadas de “pensar”.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Bien: leo el patrón antes del orgullo. En mi tierra también había marcas que no se explicaban en voz alta… y el que no las respetaba acababa con la barba mojada de hidromiel ajeno y de vergüenza.",
      "expression": "embarrassed"
    }
  ],
  "discovery.chest": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "El patrón encajó y la montaña soltó un cofre como quien pasa el jarro al que por fin dejó de interrumpir: no gloria, pago de oficio.",
      "expression": "calm"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Lo abro sin teatro de elegido; si hay metal o memoria dentro, baja al saco y después al taller, donde Brun sabrá si mentí con las manos o no.",
      "expression": "smirk"
    }
  ],
  "discovery.crystal": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Esto no es el pan de hierro del maestro: brilla distinto, pesa distinto, y me pide más paciencia en el pico, como si la veta cobrara peaje por vanidad.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si lo vuelo a fogonazos quizá pierda más de lo que gano; si lo pico bien, el horno tendrá algo que tallar… y yo tendré menos excusas para volver vacío.",
      "expression": "thoughtful"
    }
  ],
  "discovery.golemAdvanced": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Esa piedra no hace ronda: cumple orden, y encaja con la gravedad de esta cámara como un sello en cera caliente.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si esto es aviso del umbral, el “jefe de piso” de mis bromas de jarra quizá deje de ser broma más pronto de lo que mi barba quisiera.",
      "expression": "smirk"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "No lo provoqué por curiosidad barata; hoy el cuerpo ya aprendió —a golpes y a frío— lo que cuesta meter la nariz donde no se pide.",
      "expression": "tired"
    }
  ],
  "discovery.trap": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "El suelo me avisó —un latido, un rojo, un “no seas idiota”— y desde lejos algo se armó como ballesta de pasillo, no como peña con humor.",
      "expression": "surprised"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "En las sagas del mead-hall las trampas eran para héroes despistados; aquí son medida del umbral, y el fuego… a veces las apaga, a veces solo me delata.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Anoto con la barba baja: mirar el piso, no solo la peña. El reloj ya muerde; no necesito que un dardo me enseñe modales.",
      "expression": "tired"
    }
  ],
  "discovery.fragment": [
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Esto no es mena: está incrustado como un tallado a propósito, no como accidente de veta, y me pica el instinto de forja antes que el de botín.",
      "expression": "thoughtful"
    },
    {
      "speaker": "",
      "portrait": "fragment",
      "text": "«Lo que se saca de la piedra no siempre es mineral. A veces es memoria de oficio.»"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Memoria… entonces el taller no solo funde: también lee, y por eso “lo que uno trae se mide”, como en el yunque de mi maestro cuando el trabajo mentía y el metal no.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "En mi tierra guardábamos recetas en tablas junto al fuego; aquí las dejan en la pared, más difíciles de mentir y más fáciles de respetar si uno no es idiota.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si esto es lenguaje, lo cargaré en silencio, sin gritarlo por los túneles como quien presume jarro lleno en sala ajena.",
      "expression": "calm"
    }
  ],
  "wipe.tutorial": [
    [
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Caí demasiado pronto, con el permiso todavía caliente y la barba demasiado limpia… el maestro se estaría riendo sin crueldad, solo con razón.",
        "expression": "embarrassed"
      },
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Está bien: si el boleto se enfría, se vuelve a pedir. Otra vez desde la puerta, sin fingir que ya conocía la mina.",
        "expression": "calm"
      }
    ],
    [
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Ni siquiera llegué a discutir en serio con el taller: la galería me devolvió al umbral de fuera, como aprendiz que tropieza antes del yunque.",
        "expression": "embarrassed"
      },
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Respiro, limpio el orgullo, y cuando vuelva a bajar… que sea con menos prisa de feria.",
        "expression": "calm"
      }
    ]
  ],
  "n7.fail.first": [
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Basta por hoy. El límite no se abre a fuerza de prisa, y tú acabas de demostrarlo con las manos todavía calientes.",
      "expression": "dismissive"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "No te echo: te devuelvo. La cámara antigua sigue ahí, y el umbral no se mueve porque un viajero se impaciente.",
      "expression": "dismissive"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Vuelve al preámbulo, lee otra vez lo que dejaste a medias —pico, tiempo, intención— y cuando regreses, que no sea a tumbar un “jefe de piso”.",
      "expression": "correcting"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "…Duele el orgullo más que las costillas, qué detalle tan mío. Está bien: si el límite no se abrió, es que yo todavía no sabía cómo llamar a la puerta.",
      "expression": "embarrassed"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Eso. Ahora baja al Taller si hace falta templar lo cargado, y después vuelve a la cámara. El oficio espera; el espectáculo, no.",
      "expression": "stern"
    }
  ],
  "n7.fail.retry": [
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Otra vez el límite te cerró el paso. No es castigo: es medida. Vuelve a la cámara antigua, ajusta el ritmo —fuego, pico y reloj— y no me traigas prisa disfrazada de coraje.",
      "expression": "stern"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Entendido. Preámbulo otra vez… y esta vez sin inventarme un jarl en la puerta.",
      "expression": "embarrassed"
    }
  ],
  "n7.success": [
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Bastante: no viniste solo a vaciar la veta, aunque al principio olieras a eso.",
      "expression": "approving"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Vi el fuego y el pico, torpe a ratos y humano siempre; a veces eso basta… si hay intención detrás de la barba.",
      "expression": "approving"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Te reconozco, viajero, y la montaña también; más adelante el reino pedirá una mirada, no solo un pico, y cuando llegue esa hora elige con las manos limpias.",
      "expression": "approving"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Entonces no era el jarl del sótano: era el permiso de seguir pensando, qué anticlímax tan honesto para un enano que esperaba más ruido al final.",
      "expression": "smirk"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Guardaré el límite, y cuando me vuelva la prisa intentaré recordar el pico… y al maestro, aunque se equivoque a veces, porque yo también.",
      "expression": "thoughtful"
    }
  ],
  "hub.intro": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "¡Eh! Otro con el sello todavía caliente… yo también empecé hace poco, aunque mi aventura se quedó a mitad de galería y acabé aquí, entre carbón y paciencia.",
      "expression": "happy"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "No pasé la prueba de más abajo —el umbral, ya sabrás— y preferí quedarme donde el metal responde cuando uno pregunta bien; igual quiero conocer la montaña, solo que mi camino ahora pasa por el horno y el yunque.",
      "expression": "wistful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Entonces somos dos con permiso fresco y orgullo a medias… yo acabo de salir de la boca con el pico y la bomba todavía discutiendo en la cintura; tú le sacas jugo a lo que yo no sepa templar.",
      "expression": "calm"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Trato justo, y bienvenido el olor a mena nueva. Mira: el **horno** convierte crudo en refinado —bronce, hierro, cristal— y el **yunque** forja mejoras si traes material y, más adelante, fragmentos de receta; sin misterio de templo, solo oficio.",
      "expression": "warm"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Trae lo de la corrida, funde lo que haga falta, y si desbloqueas un rango o clavas una mejora, avísame: me gusta ver cuando el viaje se nota en el acero… y cuando el viajero vuelve con cara de haber aprendido algo sin querer.",
      "expression": "warm"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Si empiezo a hablar de jarls de sótano o jefes de piso, tú solo asiente y pásame el lingote: a veces mi boca va más rápido que mi pico.",
      "expression": "smirk"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "…¿Jarl de qué? Da igual: aquí el único “jefe” es el calor del horno. Bienvenido al Taller, vecino.",
      "expression": "smirk"
    }
  ],
  "hub.excavator.arrival": [
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "Aquí se templa lo que traes, no lo que imaginas merecer, y eso debería sonarte a forja aunque el yunque sea de otra sala.",
      "expression": "thoughtful"
    },
    {
      "speaker": "PRIMER EXCAVADOR",
      "portrait": "excavator",
      "text": "La mina te enseñó peso; el yunque te enseñará consecuencia, así que si dudas baja el ritmo: la forja perdona menos que la mina.",
      "expression": "thoughtful"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "¡Eh, no me roben el discurso del yunque! Yo soy el que se quema las cejas aquí abajo… aunque, bueno, si el Excavador quiere gruñir un poco, el metal también escucha.",
      "expression": "smirk"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Trato hecho: prefiero un maestro seco y un tallerista amable a un elogio de “elegido”, y ya tuve bastante jefe de piso dando vueltas en la cabeza.",
      "expression": "smirk"
    }
  ],
  "hub.advance.3": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Ahí estás… con la capa más pesada. ¿La oscuridad te acortó el camino o fueron las peñas que andan?",
      "expression": "concerned"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Las dos: de pronto no veía tan lejos como en la boca, y encima la piedra dejó de ser pared y empezó a hacer la ronda; si la despertaba a martillazos, venía a cobrarme el ruido.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Entre picar mena y no quedarme pegado a un guardia dormido… volví pensando en tu yunque como en la mesa del clan después de un mal turno.",
      "expression": "thoughtful"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Eso es el Taller: traes lo de la corrida, fundes, y si te hizo falta más temple o más aire en el pecho, forjamos. Ya no eres visita: eres vecino con polvo en la barba.",
      "expression": "warm"
    }
  ],
  "hub.advance.4": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Vienes con frío en la voz. ¿Te apretó la oscuridad… o las luces que no son linterna?",
      "expression": "concerned"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Las dos otra vez: apenas alcanzaba a leer el suelo delante, y cuando soltaba fuego para abrirme paso las luces se ponían feas, como si el fogonazo fuera un insulto en su casa.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Así que aprendí a elegir el golpe: a veces rodear, a veces picar, y no despertar a la peña y al vecino brillante en el mismo aliento.",
      "expression": "calm"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Los vecinos de luz no perdonan el portazo. Si el yunque puede darte margen —respiro, temple, pasos— dímelo: prefiero tu barba completa a un relato heroico.",
      "expression": "concerned"
    }
  ],
  "hub.advance.5": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Traes cara de quien esperó medio latido antes de tocar lo brillante… ¿te cobraron las marcas del piso?",
      "expression": "warm"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Había un orden en las piedras: si me adelantaba, me gritaban en rojo; si me quedaba mirando demasiado, la ronda de abajo me encontraba con las manos ocupadas.",
      "expression": "thoughtful"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Cuando por fin encajó el patrón y el cofre soltó su precio… sentí menos gloria que alivio de no haber vuelto a despertar a todo el pasillo por un toque torpe.",
      "expression": "happy"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Eso es oficio. Funde lo que trajiste y, si quieres más calma en las piernas o en el pecho, el yunque está despierto.",
      "expression": "warm"
    }
  ],
  "hub.advance.6": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Esa cámara se te pegó en los hombros. ¿Fue la peña grande… o el trabajo de leer y pelear a la vez?",
      "expression": "concerned"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "La peña grande no hacía siesta: venía con ganas, y mientras tanto había que mirar marcas, no despertar luces con fuego y todavía sacar memoria de la pared sin quedarme quieto como tonto.",
      "expression": "tired"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Salí con fragmentos que pesan distinto y con la certeza de que el umbral ya me estaba midiendo desde lejos… sin haberme presentado todavía.",
      "expression": "thoughtful"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Entonces no subas vacío de oficio. Funde, forja, abre receta si puedes, y celebra bajito: la montaña tiene oídos raros.",
      "expression": "warm"
    }
  ],
  "hub.advance.7": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Lo lograste. Se te ve el reloj todavía en la nuca… ¿fue el tiempo, las trampas, o admitir que no era un jarl de sótano?",
      "expression": "happy"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Las tres: el tiempo me mordía, el suelo me pedía cuidado, y encima tenía que sacar metal sin gastar el mundo a fogonazos… me costó el orgullo dejar de buscar un monstruo final y hacer la prueba en serio.",
      "expression": "tired"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Yo me quedé corto ahí; por eso el carbón me conoce mejor que la gloria. Mientras, el Taller sigue siendo mío en el día a día —y ahora también gruñe el Excavador cerca—: horno, yunque, y un amigo que vuelve con historias que no siempre entiendo.",
      "expression": "wistful"
    }
  ],
  "hub.retry.3": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "La profundidad muerde así: poco alcance de vista y peñas que no quieren que uno pico a ciegas. No pelees cada ronda; elige cuándo hacer ruido.",
      "expression": "concerned"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Si te falta temple o respiro, forjamos; si te falta calma, vuelve a bajar sin jurar en la primera esquina. El Taller no se cansa de recibirte.",
      "expression": "warm"
    }
  ],
  "hub.retry.4": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Oscuridad justa y luces de mal humor: no abras camino a fogonazos si puedes rodear, y no despiertes a la peña y al vecino brillante juntos.",
      "expression": "concerned"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Calentamos manos y acero aquí; tú eliges el golpe allá. Luego vuelves, ¿sí?",
      "expression": "warm"
    }
  ],
  "hub.retry.5": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Marcas y trampas: si no estás seguro, no toques; si ya tocaste mal, memoriza el patrón antes del orgullo. La pelea espera: el orden, no.",
      "expression": "concerned"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Funde, forja un poco de margen, y vuelve con las manos menos ansiosas.",
      "expression": "warm"
    }
  ],
  "hub.retry.6": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "La cámara antigua mezcla peña dura, luces y trabajo de marcas: no se corre, se lee entre esquivas. Si te dobló, es aviso del umbral, no vergüenza.",
      "expression": "concerned"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Templa lo necesario y no subas al límite solo por demostrar ruido. Yo me quedé aquí por menos… y aún así quiero que tú pases.",
      "expression": "wistful"
    }
  ],
  "hub.retry.7": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Otra vez el umbral… se te ve el reloj en la cara. Yo también me quedé corto ahí; por eso el carbón me conoce mejor que la gloria.",
      "expression": "wistful"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "El Excavador te manda al preámbulo: cámara antigua otra vez, ritmo otra vez. Si el yunque puede ayudar —margen, temple, aire— aquí estoy, siempre.",
      "expression": "warm"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "De vuelta a estudiar, sin jarl inventado en la puerta.",
      "expression": "calm"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "No sé qué es un jarl, pero sí un segundo intento con mejores manos. Horno primero, orgullo después.",
      "expression": "smirk"
    }
  ],
  "craft.firstSmelt": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Ahí: crudo entra, lingote sale. El horno no perdona prisa ni humedad de excusas… pero perdona al aprendiz que pregunta con las manos.",
      "expression": "warm"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "En mi tierra el fuego también decidía quién mentía en el trabajo; aquí huele igual, aunque la cera del permiso todavía me pique en la palma.",
      "expression": "thoughtful"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Trae más de la corrida cuando puedas. Sin refinar, el yunque solo hace ruido bonito… y yo ya tengo bastante ruido con el Excavador gruñendo cerca —cuando toque.",
      "expression": "smirk"
    }
  ],
  "craft.firstAlloy": [
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Dos metales que se aguantan el uno al otro… eso ya no es pan simple: es pan de invierno con algo más. Rangos altos lo van a pedir.",
      "expression": "warm"
    },
    {
      "speaker": "VIAJERO",
      "portrait": "player",
      "text": "Mi maestro mezclaba a ojo y a insulto cariñoso; yo lo haré a receta, aunque me tiemble el orgullo de “saber de fábrica”.",
      "expression": "embarrassed"
    },
    {
      "speaker": "BRUN",
      "portrait": "smith",
      "text": "Fábrica o no: si el lingote canta limpio, el resto es cuento. Guárdalo para cuando el yunque se ponga exigente.",
      "expression": "warm"
    }
  ],
  "hub.idle.brun": [
    [
      {
        "speaker": "BRUN",
        "portrait": "smith",
        "text": "Si no traes mena, al menos trae noticias de abajo… o silencio cómodo. El horno acepta las dos cosas.",
        "expression": "warm"
      }
    ],
    [
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "¿Sabes lo que es un jarl de sótano?",
        "expression": "smirk"
      },
      {
        "speaker": "BRUN",
        "portrait": "smith",
        "text": "No… y por tu cara, mejor que no lo sepa. ¿Quieres lingote o terapia de carbón?",
        "expression": "smirk"
      }
    ],
    [
      {
        "speaker": "BRUN",
        "portrait": "smith",
        "text": "Baja con el cinturón bien cerrado. Me gusta tener vecinos que vuelven, no vecinos que se convierten en cuento triste junto al yunque.",
        "expression": "warm"
      }
    ],
    [
      {
        "speaker": "BRUN",
        "portrait": "smith",
        "text": "A veces envidio tu permiso fresco… y a veces no. Yo tengo calor seguro; tú tienes preguntas que pesan. Igual me alegra verte.",
        "expression": "wistful"
      },
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "Y a mí oír un “igual me alegra” sin trompetas de saga. Gracias, Brun.",
        "expression": "happy"
      }
    ],
    [
      {
        "speaker": "BRUN",
        "portrait": "smith",
        "text": "Si el seco de allí te gruñe, ven aquí: yo traduzco a calor de horno. Él traduce a límite. Entre los dos no te dejamos mentir del todo.",
        "expression": "smirk"
      }
    ]
  ],
  "hub.idle.excavator": [
    [
      {
        "speaker": "PRIMER EXCAVADOR",
        "portrait": "excavator",
        "text": "El carbón habla más que yo. Pregúntale a Brun si quieres consuelo; a mí pregúntame si quieres medida.",
        "expression": "dismissive"
      }
    ],
    [
      {
        "speaker": "PRIMER EXCAVADOR",
        "portrait": "excavator",
        "text": "Los portales siguen quietos. Bien. Quien empuja una puerta apagada solo demuestra prisa.",
        "expression": "stern"
      }
    ],
    [
      {
        "speaker": "VIAJERO",
        "portrait": "player",
        "text": "¿Todavía soy “forastero con permiso” para ti?",
        "expression": "thoughtful"
      },
      {
        "speaker": "PRIMER EXCAVADOR",
        "portrait": "excavator",
        "text": "Sí. Y eso no es insulto: es inventario. El oficio decide el resto.",
        "expression": "stern"
      }
    ],
    [
      {
        "speaker": "PRIMER EXCAVADOR",
        "portrait": "excavator",
        "text": "Si vuelves a la mina solo a vaciar vetas, el límite ya te midió una vez… y puede medirte otra, aunque no esté en la puerta.",
        "expression": "correcting"
      }
    ]
  ]
}

/**
 * @param {string} id
 * @returns {DialogueLine[]}
 */
export function getDialogue(id) {
  if (!id) return []
  const entry = DIALOGUES[id]
  if (!entry) return []
  if (isDialoguePool(entry)) return pickFromPool(entry)
  if (isDialogueScript(entry)) return entry
  return []
}

/** Compat: inicio de nivel legacy → id canónico. */
export function levelStartDialogue(levelIndex, _levelName) {
  return getDialogue(`level.start.${levelIndex}`)
}

export { DIALOGUES }

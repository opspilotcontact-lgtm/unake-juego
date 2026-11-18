// Capítulos nuevos de los actos I y II (guiones/actos-1-2.js, montados el 01/11/2026): 3 · La Pompa no baja,
// 5 · El mejor amigo, 7 · Nuevo en la ciudad y 9 · Escucha, escucha. Formato del motor de tareas (historia.js):
// { id, titulo, intro, tareas: [{ id, texto, tipo, minijuego?, antes, despues, pista }], giroTras, giro, cierre }.
// Cambios respecto al guion: se añade el `id`; en el cap. 5 el minijuego `PorDebajo` se llama `Rendija`; los chats,
// ambientes y memes viven en contenido/capitulos.js. historia.js los coloca en CAPITULOS. PROPUESTA de guion.

const CAPITULOS_ACTOS12 = {
  pompa: {
    id: "pompa",
    titulo: "La Pompa no baja",
    arte: "cap-pompa-no-baja",
    intro: [
      [
        "narrador",
        "Primera fiesta para pagar la cuota. Entrada: un monchi y buenas intenciones."
      ],
      [
        "palicaso",
        "¡Escucha, escucha! Barra llena, luces puestas y arriba, la Pompa pinchando. Noche redonda."
      ],
      [
        "blancaso",
        "Lo he apuntado en la agenda. Entre «cobrar la entrada» y «disfrutar, si sobra tiempo»."
      ],
      [
        "narrador",
        "Arriba, pegada al techo, la Pompa no pincha. Vibra."
      ],
      [
        "vuper",
        "Oye… ¿no está un poco más grande?"
      ],
      [
        "palicaso",
        "Siempre ha sido así de redonda. Y esta no te la he contado: una vez conocí a un globo que…"
      ],
      [
        "blancaso",
        "Antes se le veía el techo por detrás. Ahora el techo la ve a ella."
      ],
      [
        "pompa",
        "Estoy como siempre."
      ],
      [
        "lasslow",
        "Señorita, permítame decirle que hoy está… JA… más amplia que nunca."
      ],
      [
        "pompa",
        "Esta tarde, de día, me he tranquilizado. Una calada tras otra. Para llegar entera."
      ],
      [
        "blancaso",
        "Y ha llegado enterísima. Y a una brisa de dejar de estarlo."
      ],
      [
        "narrador",
        "Si la Pompa revienta, no hay música. Sin música no hay fiesta. Y sin fiesta, no hay cuota."
      ]
    ],
    tareas: [
      {
        id: "hablarPompa",
        texto: "Habla con la Pompa (dentro de Unaké, pegada al techo)",
        tipo: "charla",
        antes: [
          [
            "narrador",
            "Cada vez que alguien pasa cerca, la Pompa se mece un poco más de la cuenta."
          ],
          [
            "vuper",
            "Pompa… ¿qué te pasa?"
          ]
        ],
        despues: [
          [
            "pompa",
            "Que no estoy en mi punto. Estoy por encima."
          ],
          [
            "pompa",
            "Cada vez que alguien respira cerca, noto que me paso un poquito más."
          ],
          [
            "vuper",
            "¿Y qué necesitas?"
          ],
          [
            "narrador",
            "La Pompa tarda un rato en contestar. Un rato largo."
          ],
          [
            "pompa",
            "Agua. Algo salado. Y que nadie sople."
          ]
        ],
        pista: "«Estoy aquí arriba, rider. Siempre. Es lo bueno de mí. …Sube cuando quieras. Despacio. Sin respirar fuerte.»"
      },
      {
        id: "aguaYSal",
        texto: "Trae agua y algo salado para la Pompa: la barra y la tienda de 24 h",
        tipo: "recoger",
        antes: [
          [
            "palicaso",
            "¿Agua? Aquí tenemos de todo: cóctel, otro cóctel, un cóctel con paraguas. ¿Y el agua cómo se pide?"
          ],
          [
            "vuper",
            "Se pide «agua»."
          ],
          [
            "palicaso",
            "¡Escucha, escucha! Qué idea tan moderna."
          ]
        ],
        despues: [
          [
            "vuper",
            "Agua, patatas… y sin soplar."
          ],
          [
            "cotine",
            "Si sobra alguna patata, yo…"
          ],
          [
            "vuper",
            "No sobra."
          ],
          [
            "cotine",
            "¿Qué? Tenía hambre."
          ]
        ],
        pista: "«¡Escucha! El agua está en mi barra, hombre. Lo salado, en la tienda de 24 h, que a estas horas es lo único que no cierra. Y esta no te la he contado…»"
      },
      {
        id: "enSuPunto",
        texto: "Devuelve a la Pompa a su punto: ni más, ni menos (dentro de Unaké)",
        tipo: "minijuego",
        minijuego: "EnSuPunto",
        antes: [
          [
            "pompa",
            "Vale. Tú me guías. Un palmo menos… no tanto."
          ],
          [
            "blancaso",
            "Ni se te ocurra desinflarla. Sin ella, esto es un bar con luces."
          ],
          [
            "vuper",
            "Vale, vale… Ni más, ni menos."
          ]
        ],
        despues: [
          [
            "pompa",
            "Ahí. Ahí estoy. Qué silencio tan redondo."
          ],
          [
            "narrador",
            "Ni plop, ni pffff. Su punto exacto, un palmo por encima del mundo."
          ],
          [
            "blancaso",
            "Qué envidia. Yo llevo media vida sin encontrar el mío."
          ]
        ],
        pista: "«Si me ves apretada, suelta aire. Si me ves arrugada, deja de soltar. Y si alguien sopla, apártame. …Esto último, rápido.»"
      },
      {
        id: "pincharPompa",
        texto: "Que la Pompa pinche: sigue el ritmo de la fiesta (DJ)",
        tipo: "minijuego",
        minijuego: "DJ",
        antes: [
          [
            "pompa",
            "Estoy en mi punto. Ahora, música."
          ],
          [
            "palicaso",
            "¡Escucha, escucha! ¡Que pinche, que pinche, que pinche!"
          ]
        ],
        despues: [
          [
            "blancaso",
            "La fiesta ha dado beneficios. Pequeños, pero beneficios. Lo apunto."
          ],
          [
            "palicaso",
            "¡Invita la casa!"
          ],
          [
            "blancaso",
            "La casa soy yo. Y no invita."
          ]
        ],
        pista: "«Pulsa ← ↓ → cuando las burbujas lleguen a la línea. No pienses. Pensar es de abajo. …Aquí arriba solo se siente.»"
      }
    ],
    giroTras: 2,
    giro: [
      [
        "narrador",
        "Se abre la puerta de Unaké y entra media fiesta de golpe. Con aire, risas y ganas de soplar velas que no hay."
      ],
      [
        "palicaso",
        "¡Escucha, escucha! ¡Invita la casa! ¡Una ronda para todos!"
      ],
      [
        "pompa",
        "Ay. Yo… no… que…"
      ],
      [
        "lasslow",
        "Con permiso, caballeros. Me coloco junto a la señorita, que es la zona tranquila. JA… perdón."
      ],
      [
        "blancaso",
        "Lasslow, esa es la zona que más tiembla."
      ],
      [
        "lasslow",
        "Es que me hace gracia el temblor. Mire. Mire cómo… JAJAJA."
      ],
      [
        "vuper",
        "Vale, vale… Pompa, bebe esto. Despacito. Y yo te devuelvo a tu punto."
      ],
      [
        "narrador",
        "Ni más hinchada, ni más desinflada. Con el bar entero soplando alrededor."
      ]
    ],
    cierre: [
      [
        "palicaso",
        "¡Y para brindar por la noche, otra ronda! Una calada para la artista, que se la ha ganado."
      ],
      [
        "pompa",
        "Yo no, que exploto."
      ],
      [
        "narrador",
        "Por primera vez, contesta a tiempo. Le mira, y se le limpian los ojos."
      ],
      [
        "palicaso",
        "Eh… vale. ¡Escucha! Nadie me había dicho que no tan bonito."
      ],
      [
        "blancaso",
        "Qué envidia. Yo llevo media vida sin saber decir que no. Bueno, sí sé: a Palicaso."
      ],
      [
        "lasslow",
        "Un auténtico señor. Qué alivio que todo haya salido bien, de verdad, que casi…"
      ],
      [
        "lasslow",
        "¡Que se me ha escapao!"
      ],
      [
        "narrador",
        "El soplido manda a la Pompa contra el techo. Plink. Rebota. Plink. Se queda pegada."
      ],
      [
        "pompa",
        "Se tarda un poco. Pero se para."
      ]
    ]
  },
  "mejor-amigo": {
    id: "mejor-amigo",
    titulo: "El mejor amigo",
    arte: "cap-mejor-amigo",
    intro: [
      [
        "narrador",
        "Después del blancazo, Puky no se ha ido. Lleva tres días en Unaké."
      ],
      [
        "blancaso",
        "Está en la barra. Está en el baño. Ayer estaba en las cuentas, que es un sitio donde no entra nadie."
      ],
      [
        "puky",
        "¿Me llamabais?"
      ],
      [
        "blancaso",
        "No."
      ],
      [
        "puky",
        "Pues me quedo igual. ¡Qué bien se está aquí!"
      ],
      [
        "palicaso",
        "¡Escucha, escucha! ¡Si es un encanto! Una vez conocí a un charco que…"
      ],
      [
        "blancaso",
        "Es mi mejor amigo, Palicaso. Y por eso lo sé: hoy lo echo."
      ],
      [
        "blancaso",
        "Cerrojo. Carteles. Contraseña nueva. Plan en tres puntos. Lo he apuntado."
      ],
      [
        "perico",
        "¿Contraseña nueva? ¿Contraseña nueva?"
      ],
      [
        "puky",
        "No pasa nada, colega. Yo nunca he tenido contraseña."
      ],
      [
        "narrador",
        "Puky entra siempre por debajo de la puerta. Es lo único que nadie le ha cerrado nunca."
      ]
    ],
    tareas: [
      {
        id: "cerrojo",
        texto: "Compra un cerrojo en la tienda de 24 h (y que no te vea Puky)",
        tipo: "recado",
        antes: [
          [
            "blancaso",
            "Un cerrojo. El más grande que tengan. Y no le digas a nadie para qué."
          ],
          [
            "puky",
            "¿Un cerrojo? ¿Para qué? ¿Es un regalo?"
          ],
          [
            "blancaso",
            "…Para una cosa. Que no te incumbe."
          ]
        ],
        despues: [
          [
            "narrador",
            "Blancaso pone el cerrojo, cuelga el cartel «PROHIBIDO PUKY» y cambia la contraseña."
          ],
          [
            "narrador",
            "Puky lo lee todo, asiente, se emociona un poco y se cuela por debajo de la puerta."
          ],
          [
            "puky",
            "¡Cerrado por dentro! ¡Qué seguro se está!"
          ]
        ],
        pista: "«Tienda de 24 h, Vuper. El cerrojo grande. …No, no el pequeño. El otro grande. Lo apunto para que no se me olvide.»"
      },
      {
        id: "agendaCanerias",
        texto: "Baja a las cañerías como Puky y recupera la agenda de Blancaso",
        tipo: "minijuego",
        minijuego: "Rendija",
        con: ["blancaso", "puky"], // la agenda es de Blancaso (plaza); Puky vive en el baño, que es ampliación opcional
        antes: [
          [
            "puky",
            "¿Necesitas mi ayuda? ¡Me necesitas!"
          ],
          [
            "blancaso",
            "Necesito… tu cuerpo. Una temporada. Para un recado."
          ],
          [
            "puky",
            "¡Blurp! ¡Qué bonito!"
          ]
        ],
        despues: [
          [
            "puky",
            "¡Tengo la agenda! Está pegajosa. Bueno, ahora más."
          ],
          [
            "blancaso",
            "…Está húmeda. Bien. Gracias, Puky. Pero no te acostumbres."
          ]
        ],
        pista: "«¡Blurp! Pégate a las paredes, que a mí me va muy bien. Si ves una rendija, es por ahí. ¡Siempre es por ahí!»"
      },
      {
        id: "cuentasPuky",
        texto: "Cuadra las cuentas con Blancaso, que Puky «ayuda» (en la barra)",
        tipo: "minijuego",
        minijuego: "Cuentas",
        antes: [
          [
            "blancaso",
            "Ahora que tengo la agenda, cuadramos. Tú clasificas. Y tú, Puky: no toques nada."
          ],
          [
            "puky",
            "¡Ayudo!"
          ],
          [
            "narrador",
            "Puky ayuda. Pringa la libreta, pringa las monedas, pringa a Blancaso."
          ]
        ],
        despues: [
          [
            "blancaso",
            "La libreta está… amarilla."
          ],
          [
            "puky",
            "Es mi color favorito."
          ],
          [
            "blancaso",
            "Ya lo sé, Puky. Lo sé desde que te conozco."
          ]
        ],
        pista: "«Monedas a la izquierda, billetes a la derecha, facturas abajo. Y que nada se pegue. …Aquí todo se pega.»"
      },
      {
        id: "hablarPuky",
        texto: "Habla a solas con Puky, de noche (las cañerías)",
        tipo: "charla",
        antes: [
          [
            "narrador",
            "Esa noche Puky no está en la barra. Está debajo, en las cañerías, solo. Es la primera vez que no aparece."
          ]
        ],
        despues: [
          [
            "vuper",
            "¿Por qué entras siempre por debajo?"
          ],
          [
            "puky",
            "Porque si no llamo, nadie tiene que decirme que no."
          ],
          [
            "puky",
            "Me quedo un ratito y ya está. Cuando se enteran, ya estoy dentro."
          ],
          [
            "vuper",
            "¿Y por qué sigues viniendo?"
          ],
          [
            "puky",
            "Porque Blancaso es el único que, cuando algo sale mal, no se va. Y yo tampoco."
          ]
        ],
        pista: "«Aquí abajo, rider. Siempre más abajo. No me ves, pero estoy. …Siempre estoy.»"
      }
    ],
    giroTras: 1,
    giro: [
      [
        "blancaso",
        "Listo. Cerrojo, carteles, contraseña. Ahora sí. A disfrutar de mi bar. Lo tengo en la agenda."
      ],
      [
        "narrador",
        "La agenda se le resbala, rebota en el suelo y cae por la rejilla del desagüe. Plof."
      ],
      [
        "blancaso",
        "Mi agenda. Con el día de hoy dentro."
      ],
      [
        "blancaso",
        "Ahí está todo. Las cuentas, los papeles… la cita para disfrutar."
      ],
      [
        "vuper",
        "Vale, vale… ¿Y quién cabe por esa rejilla?"
      ],
      [
        "narrador",
        "Todos miran la rejilla. Nadie mira a Blancaso. Blancaso mira al suelo."
      ],
      [
        "blancaso",
        "No."
      ],
      [
        "puky",
        "(desde debajo de la puerta) ¿Me llamabais?"
      ]
    ],
    cierre: [
      [
        "blancaso",
        "Puky. Llevo tres días intentando echarte."
      ],
      [
        "puky",
        "Lo sé. Me gustan tus carteles. Los he guardado todos."
      ],
      [
        "blancaso",
        "…Los de «PROHIBIDO PUKY»."
      ],
      [
        "puky",
        "Es el único sitio donde pone mi nombre."
      ],
      [
        "narrador",
        "A Blancaso se le limpian los ojos."
      ],
      [
        "blancaso",
        "Quédate, Puky. Pero ahí, en el suelo."
      ],
      [
        "puky",
        "¡Blurp!"
      ],
      [
        "narrador",
        "Blancaso abre la agenda y apunta, con letra pequeña: «Invitar a Puky»."
      ],
      [
        "narrador",
        "Puky lo lee por encima de su hombro. Le tiemblan los ojos de felicidad."
      ],
      [
        "narrador",
        "Se sienta encima. La página queda pegada al suelo, con su nombre dentro, para siempre."
      ],
      [
        "blancaso",
        "Era la página de mañana."
      ]
    ]
  },
  nuevo: {
    id: "nuevo",
    arte: "cap-nuevo",
    titulo: "Nuevo en la ciudad",
    intro: [
      [
        "narrador",
        "Mediodía. Lasslow cruza la plaza con su mejor pajarita y se presenta a todo el que pasa."
      ],
      [
        "lasslow",
        "Buenos días, buenos días. Lasslow, para servirle. Nuevo en la ciudad."
      ],
      [
        "palicaso",
        "¡Escucha, escucha! Pero si llevas aquí desde que se inauguró la aso."
      ],
      [
        "lasslow",
        "Caballero, usted me confunde con otro. Un servidor acaba de llegar."
      ],
      [
        "blancaso",
        "Vino el primer día. Rompió una silla de la risa. La silla todavía tiene su nombre."
      ],
      [
        "lasslow",
        "Una silla muy mal hecha. JA… perdón."
      ],
      [
        "vuper",
        "Vale, vale… ¿Y por qué dices que eres nuevo?"
      ],
      [
        "lasslow",
        "Esas cosas no se le preguntan a un señor."
      ],
      [
        "blancaso",
        "Mientras él se presenta, yo he comprado un pez para el reservado. El pez de la aso. Un local serio tiene pecera."
      ],
      [
        "narrador",
        "En el reservado, un pez naranja flota en una bolsa de agua y mira a todos con calma. Se llama Fortunato."
      ]
    ],
    tareas: [
      {
        id: "seguirLasslow",
        texto: "De día, sigue a Lasslow por el barrio mientras se presenta",
        tipo: "dia",
        antes: [
          [
            "lasslow",
            "Acompáñeme, joven. Le presentaré mis respetos a la ciudad entera."
          ],
          [
            "vuper",
            "Vale, vale…"
          ]
        ],
        despues: [
          [
            "vuper",
            "Todos te conocen de toda la vida."
          ],
          [
            "lasslow",
            "Eso parece. Pero es que cada vez que alguien me conoce de verdad…"
          ],
          [
            "lasslow",
            "JA… ahí lo tiene. Me río. Y ya no soy un señor: soy ese al que se le escapó."
          ],
          [
            "lasslow",
            "Nuevo, en cambio, soy un misterio."
          ],
          [
            "niebla",
            "(de lejos) ¡Bienvenido a la ciudad, señor de la pajarita! ¿Nos conocemos?"
          ]
        ],
        pista: "«Un señor camina despacio, joven. Por la plaza, la tienda, el parque… Sígame a una distancia respetuosa. Ni muy lejos ni muy cerca.»"
      },
      {
        id: "pajaritas",
        texto: "Recoge las pajaritas que Lasslow ha ido perdiendo (plaza, tienda y Unaké)",
        tipo: "recoger",
        antes: [
          [
            "lasslow",
            "Joven, he extraviado tres pajaritas. Un señor sin pajarita es solo un culo con ideas."
          ]
        ],
        despues: [
          [
            "lasslow",
            "Las tres. Es usted un señor, joven."
          ],
          [
            "vuper",
            "Gracias."
          ],
          [
            "lasslow",
            "No lo diga tan alto, que me entra la risa."
          ]
        ],
        pista: "«Pin pin. Una está en la plaza. Otra en la tienda. La tercera… la tengo yo. No la tengo. La tengo.»  (Perico)"
      },
      {
        id: "floresFortunato",
        texto: "Consigue flores para Fortunato (el parque y la tienda)",
        tipo: "recoger",
        antes: [
          [
            "cotine",
            "Yo me encargo del catering del entierro. Es tradición."
          ],
          [
            "blancaso",
            "Es un pez, Cotine. No hay catering."
          ],
          [
            "cotine",
            "Siempre hay catering."
          ]
        ],
        despues: [
          [
            "vuper",
            "Flores. Seis."
          ],
          [
            "cotine",
            "¿Seis? Cinco. Una está… dentro."
          ],
          [
            "vuper",
            "Cotine."
          ],
          [
            "cotine",
            "¿Qué? Tenía hambre."
          ]
        ],
        pista: "«Las flores más bonitas están en el parque y en la tienda, joven. Y si alguien se las come por el camino, no era una flor. Era un malentendido.»"
      },
      {
        id: "compostura",
        texto: "Aguanta la compostura en el entierro de Fortunato (el reservado)",
        tipo: "minijuego",
        minijuego: "Compostura",
        antes: [
          [
            "narrador",
            "Reservado, medianoche. Velas, flores y un pez en una caja de zapatos hasta que se compre la pecera."
          ],
          [
            "lasslow",
            "Un señor sabe estar. Un señor sabe estar. Un señor sa…"
          ],
          [
            "blancaso",
            "Si te ríes aquí, Lasslow, no te lo perdono."
          ]
        ],
        despues: [
          [
            "lasslow",
            "(rojo, sudando, con lágrimas de las otras) Lo… he… conseguido."
          ],
          [
            "blancaso",
            "Has estado a la altura."
          ],
          [
            "palicaso",
            "Lo habrías hecho todavía mejor si yo hubiera acabado la historia del flamenco."
          ]
        ],
        pista: "«Respire, joven. Mantenga cuando el círculo crezca, suelte cuando se encoja. Y si Palicaso empieza un chiste, usted no lo ha oído.»"
      }
    ],
    giroTras: 2,
    giro: [
      [
        "narrador",
        "Esa noche, en el reservado, Blancaso se asoma a ver a Fortunato."
      ],
      [
        "blancaso",
        "Fortunato, ¿qué tal el primer día? …Fortunato."
      ],
      [
        "narrador",
        "El pez flota panza arriba. No se mueve. No hace nada."
      ],
      [
        "blancaso",
        "Yo ya sabía que esto iba a pasar. Llevaba tres horas en Unaké."
      ],
      [
        "palicaso",
        "¡Escucha, escucha! Lo siento muchísimo. Y esta no te la he contado: una vez conocí a un pez que…"
      ],
      [
        "blancaso",
        "Un entierro. Con honores. Es el pez de la aso."
      ],
      [
        "lasslow",
        "Con elogio fúnebre. Un señor sabe decir unas palabras. Y no reírse. Lo he hecho mil veces."
      ],
      [
        "blancaso",
        "Nunca has asistido a ninguno."
      ],
      [
        "lasslow",
        "Por eso: lo he ensayado mil veces. En mi cabeza. JA."
      ]
    ],
    cierre: [
      [
        "narrador",
        "Se han ido todos a la barra. En el reservado solo quedan Lasslow, Vuper y una caja de zapatos."
      ],
      [
        "lasslow",
        "Joven. ¿Puedo confesarle algo sin reírme?"
      ],
      [
        "lasslow",
        "La primera vez que entré en Unaké, nadie me conocía. Entré de pajarita, tieso, y me senté."
      ],
      [
        "lasslow",
        "Y alguien, arriba, me miró. Sin saber nada de mí. Ni lo de las sillas, ni lo otro."
      ],
      [
        "lasslow",
        "Me miró como se mira a un señor. Y desde entonces intento volver a ser ese."
      ],
      [
        "vuper",
        "¿Quién te miró?"
      ],
      [
        "lasslow",
        "Eso no se le pregunta a un señor."
      ],
      [
        "narrador",
        "Arriba, en el techo, algo redondo brilla un momento. A Lasslow se le limpian los ojos. Por una vez, sin lágrimas de risa."
      ],
      [
        "lasslow",
        "Descanse en paz, Fortunato. Fuiste un gran pez."
      ],
      [
        "narrador",
        "Dentro de la caja de zapatos, algo da una coletada. Plic."
      ],
      [
        "blancaso",
        "…¿Ha movido la cola?"
      ],
      [
        "palicaso",
        "¡Estaba dormido! ¡Lo hemos enterrado dormido!"
      ],
      [
        "lasslow",
        "JA… JAJAJA… JAJAJAJAJAJAJA."
      ],
      [
        "narrador",
        "Lasslow rueda por el suelo del reservado, llorando de risa en pleno entierro. Fortunato, con un ojo medio abierto, decide seguir muerto."
      ]
    ]
  },
  escucha: {
    id: "escucha",
    titulo: "Escucha, escucha",
    arte: "cap-escucha",
    intro: [
      [
        "narrador",
        "Después de lo de la caja, Unaké está más lleno que nunca. Todo el mundo saluda a Palicaso."
      ],
      [
        "palicaso",
        "¡Escucha, escucha! ¡Buenas noches! ¿Qué tal la familia? ¿Y el perro? ¡Y esta no te la he contado!"
      ],
      [
        "narrador",
        "Palicaso conoce a todos: los nombres, los perros, los cumpleaños. Y a las seis de la mañana cierra Unaké. Solo."
      ],
      [
        "vuper",
        "Cierras todas las noches, ¿no?"
      ],
      [
        "palicaso",
        "¡Siempre! Con Perico. Me hace compañía. Hablamos de todo. Bueno, hablo yo."
      ],
      [
        "perico",
        "Pin pin."
      ],
      [
        "blancaso",
        "Palicaso, necesito contarte una cosa. Es importante."
      ],
      [
        "palicaso",
        "¡Escucha, escucha! Justo ahora que te iba a contar lo de…"
      ],
      [
        "blancaso",
        "…Da igual. Lo apunto para mañana."
      ],
      [
        "narrador",
        "Blancaso se aparta. Palicaso se queda con la boca todavía abierta."
      ]
    ],
    tareas: [
      {
        id: "quienConoce",
        texto: "Pregunta a Niebla, a Cotine y a Lasslow quién conoce de verdad a Palicaso",
        tipo: "charla",
        antes: [
          [
            "vuper",
            "Voy a preguntar por ahí. Alguien sabrá algo de él."
          ]
        ],
        despues: [
          [
            "niebla",
            "¿Palicaso? Es el simpático. ¿O el de la barra? ¿Es el mismo?"
          ],
          [
            "cotine",
            "Sé que le gusta el limón. Lo sé porque se lo quito del vaso."
          ],
          [
            "lasslow",
            "Un caballero. Me contó cuarenta historias. Ninguna suya. JA… perdón."
          ],
          [
            "vuper",
            "Todos sabemos mucho de lo suyo. Y de él, nada."
          ]
        ],
        pista: "«Pregunte, joven, pregunte. Aunque no se lo diga a nadie… no sé si conozco a alguien que le conozca. …Búsquenos a Niebla, a Cotine y a mí.»  (Lasslow)"
      },
      {
        id: "hablarPerico",
        texto: "De noche, habla con Perico a solas (la puerta de Unaké)",
        tipo: "charla",
        antes: [
          [
            "vuper",
            "Perico, tú que lo ves todo. ¿Qué hace Palicaso cuando se queda solo?"
          ]
        ],
        despues: [
          [
            "perico",
            "Cierra solo. Cierra solo. Y me habla a mí."
          ],
          [
            "perico",
            "Yo digo pin pin. Y él se calla un segundito. Un segundito."
          ],
          [
            "perico",
            "Ese segundo es lo mejor de su noche. Dilo tú, que a mí no me creen."
          ],
          [
            "vuper",
            "Vale, vale…"
          ]
        ],
        pista: "«Pin pin. Estoy en la puerta, siempre. Siempre. Si quieres saber de alguien, pregunta al portero.»"
      },
      {
        id: "escucha",
        texto: "Quédate junto a Palicaso y frénale mientras su hermano habla (el reservado)",
        tipo: "minijuego",
        minijuego: "Escucha",
        antes: [
          [
            "vuper",
            "Palicaso, siéntate. Tu hermano quiere contarte algo. Yo me quedo al lado."
          ],
          [
            "palicaso",
            "¡Claro! ¡Escucha, escucha! ¿Qué quiere…?"
          ],
          [
            "vuper",
            "Que escuches."
          ],
          [
            "palicaso",
            "Eso hago. Escucho. Escucho muchísimo."
          ]
        ],
        despues: [
          [
            "blancaso",
            "Cada noche hago las cuentas. Cada noche salen justas. Si falla una, se acaba Unaké."
          ],
          [
            "blancaso",
            "Y tú estás tan contento y no te lo quiero estropear. Así que me lo guardo. Y me hundo."
          ],
          [
            "blancaso",
            "Tengo miedo de perder el bar. Es lo único que tenemos."
          ],
          [
            "narrador",
            "Palicaso abre la boca. Vuper le mira. La cierra."
          ],
          [
            "narrador",
            "Es el silencio más largo que ha habido jamás en Unaké."
          ]
        ],
        pista: "«Pin pin. Cuando su bocadillo se ponga rosa y tiemble, pulsa. Antes no. Antes no. Y si digo pin pin, no es él.»  (Perico)"
      },
      {
        id: "barraSolo",
        texto: "Atiende la barra tú solo, con Unaké lleno (la barra de Unaké)",
        tipo: "minijuego",
        minijuego: "Barra",
        antes: [
          [
            "vuper",
            "Barra llena y el camarero, escuchando arriba. Me toca."
          ],
          [
            "cotine",
            "Yo ayudo. Un pellizquito por vaso."
          ],
          [
            "vuper",
            "No."
          ]
        ],
        despues: [
          [
            "niebla",
            "¿Y Palicaso? ¿Está enfermo?"
          ],
          [
            "vuper",
            "Está escuchando."
          ],
          [
            "niebla",
            "Ah. …¿Eso se contagia?"
          ]
        ],
        pista: "«Sirve a cada uno lo suyo. Y si se cuela Puky, fuera. Yo, por mi parte, no tengo hambre. Un pellizquito.»  (Cotine)"
      }
    ],
    giroTras: 2,
    giro: [
      [
        "narrador",
        "Esa noche, Unaké hasta arriba. Blancaso se sienta junto a la barra con la agenda abierta: «Hablar con Palicaso», subrayado dos veces."
      ],
      [
        "blancaso",
        "Palicaso. Tengo que contarte una cosa. Es importante. De verdad."
      ],
      [
        "palicaso",
        "¡Escucha, escucha! Lo mío es más importante: ¿sabías que las estrellas fugaces no se pueden aparcar?"
      ],
      [
        "blancaso",
        "Palicaso…"
      ],
      [
        "palicaso",
        "Y esta no te la he contado: una vez aparqué una en doble fila…"
      ],
      [
        "blancaso",
        "Me voy a casa."
      ],
      [
        "narrador",
        "Blancaso nunca se va a casa. Hoy tampoco. Se queda mirando el vaso con los ojos caídos."
      ],
      [
        "vuper",
        "Vale, vale… Yo te ayudo. No a hablar. A que te escuche."
      ]
    ],
    cierre: [
      [
        "narrador",
        "Abajo, la barra aguanta. Arriba, en el reservado, Palicaso lleva rato sin decir nada. Es tan raro que Perico ha dejado de picar pipas."
      ],
      [
        "palicaso",
        "Blancaso."
      ],
      [
        "palicaso",
        "Gracias por contármelo."
      ],
      [
        "narrador",
        "A Palicaso se le limpian los ojos. Y, por una vez, los de su hermano también."
      ],
      [
        "palicaso",
        "El bar no se cierra. Y si un día se cierra, lo cerramos juntos: tú con tus cuentas y yo con… mis cosas."
      ],
      [
        "blancaso",
        "Eso ha sido bonito. Y corto. Casi no te reconozco."
      ],
      [
        "palicaso",
        "Me ha costado. …¡Escucha, escucha! Esto me recuerda a una vez, hace años, que conocí a un tío que casi perdió un bar…"
      ],
      [
        "narrador",
        "Cuarenta minutos después."
      ],
      [
        "palicaso",
        "…y por eso no he vuelto a fiarme de un flamenco. Pero esa es otra historia."
      ],
      [
        "blancaso",
        "Otra vez no…"
      ],
      [
        "perico",
        "¿Otra? ¿Otra?"
      ]
    ]
  }
};

// Niebla (la empanada, el olvido), en la plaza desde el cap. 1. Frases de PERSONAJES_NUEVOS.niebla
// (guiones/actos-3-4.js). Se mezclan con sus charlas en encuentros.js (TONTERIAS.niebla).
const NIEBLA_FRASES = [
  '¿Esto es la plaza? Creo que ya he estado.',
  'Se me ha ido lo que iba a decir. Era importante. O no.',
  'Me han dicho que venga todas las noches. Por primera vez.',
  '¿Quién era el de la pajarita? ¿Y tú?',
  'Había algo en el fuego. Pero eso fue ayer. O mañana.',
  '¿Qué decía? Ah, sí… no, no era eso.',
  'Tengo un mensaje para ti. Del que se encargó. Aunque no recuerdo quién.',
  'Hoy estoy muy despierta. Creo.',
  'Qué bonito sitio. ¿Es nuevo?',
  'Siéntate. O levántate. Lo que hacías antes.',
  'Me ha parecido que alguien me decía algo. ¿Eras tú?',
];

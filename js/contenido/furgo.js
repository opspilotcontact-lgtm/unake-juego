// Guionista C · capítulo NUEVO «La furgo» (idea de un amigo del usuario, 31/10/2026). Va entre 10 · Perico lo sabe y 11 · Algodón de feria.
// PROPUESTA de guion para el juego: nada de esto es canon de la serie. NO lo carga el juego todavía: el director lo integra.
// Sigue criterio.md (la sensación se VE y no se nombra; nunca se nombra la sustancia: humo, calada, liar, colocón) y el
// punto 14 de ampliacion-propuesta.md, con el encaje del punto 13 por encima.
//
// Formato igual que actos-1-2.js / actos-3-4.js. Los pensamientos de Vuper van entre paréntesis (solo los oye el jugador).
// Campos extra respecto al formato pedido (todos opcionales, el director/programador puede ignorarlos):
//   giroTras: nº de tareas hechas antes del giro (aquí 2: piezas + Furgo; el giro son las luces azules).
//   fijos: quién va SIEMPRE en la furgo (Vuper conduce; Cotine va atrás, refunfuñando). El jugador elige 2 acompañantes
//          más (3 si el nivel lo pide) entre palicaso, lasslow, perico, pompa, blancaso y puky.
//   giroSi / controlSi / llegadaSi / cierreSi / llegaSolo: UNA frase corta por acompañante, solo si va a bordo
//          (llegaSolo: los que no caben llegan a la feria por su cuenta; así el 11 los encuentra a todos allí).
//   fallo: qué pasa si la barra de sospecha se llena en el control. NO bloquea la historia: multa de monchis y se sigue.
// Hablante nuevo: 'agente' (figurante, sin ficha de personaje; solo necesita nombre «Agente del humo» y un retrato).
// Minijuegos: 'Furgo' y 'Control' (nombres tal cual los pidió el director).

const CAPITULO_FURGO = {
  num: 10.5,
  titulo: 'La furgo',
  desde: 10.5,
  giroTras: 2,

  fijos: ['vuper', 'cotine'],

  intro: [
    ['narrador', 'Ha llegado un cartel al barrio: feria de humo, solo esta noche, al otro lado de la circunvalación. A pie son cuarenta minutos y una mala decisión.'],
    ['palicaso', '¡Escucha, escucha! Feria. Con noria, con casetas y con churros. ¡Invita la casa!'],
    ['blancaso', 'La casa tiene una furgo que lleva tres años sin arrancar.'],
    ['palicaso', 'Dormida. Está dormida. Se la despierta con cariño.'],
    ['perico', 'Pin pin. Las llaves. Las tengo yo. Las tengo yo.'],
    ['blancaso', '¿Por qué las tienes tú?'],
    ['perico', 'Percha. Mi percha. Percha.'],
    ['lasslow', 'Caballeros, un señor no camina cuarenta minutos. Un señor se hace llevar. Con pajarita.'],
    ['cotine', 'Yo no he dicho que quiera ir.'],
    ['palicaso', 'Nadie ha dicho que lo hayas dicho.'],
    ['cotine', 'Pues eso.'],
    ['narrador', 'Cotine no ha dicho que quiera ir. Ya está sentada en el asiento de atrás.'],
    ['palicaso', 'Conduce Vuper. Yo no puedo hablar y mirar la carretera a la vez.'],
    ['vuper', 'Vale, vale…'],
    ['blancaso', 'Caben pocos. Elige bien.'],
  ],

  tareas: [
    {
      id: 'furgo_piezas',
      texto: 'Reúne lo que necesita la furgo: las llaves (la percha de Perico), la batería (el trastero) y un ambientador de pino (la barra)',
      tipo: 'recoger',
      antes: [
        ['narrador', 'La furgo lleva tres años en el garaje de Unaké, bajo una lona y un gato que no es de nadie.'],
        ['palicaso', 'Le faltan tres cosas: las llaves, la batería y algo que tape el olor a garaje.'],
        ['vuper', '¿Qué olor?'],
        ['palicaso', 'El de tres años.'],
      ],
      despues: [
        ['perico', 'Pin pin. Llaves entregadas. Percha vacía. Percha vacía.'],
        ['narrador', 'La furgo arranca al tercer intento. Al primero tose, al segundo se queja, al tercero suelta una nube negra que hace toser a Blancaso, que ni estaba cerca.'],
        ['blancaso', 'Otra vez no… Y huele a pino.'],
        ['palicaso', 'Es el ambientador. Va a ser importante, ya verás.'],
        ['narrador', 'En la guantera, algo se mueve. Y se queda muy quieto, como si no hubiera sido nada.'],
      ],
      pista: '«Pin pin. Llaves, en mi percha. Mi percha, en lo alto. Batería, en el trastero. Ambientador, en la barra. En la barra. Yo no me llevo nada. Nada.»',
    },
    {
      id: 'furgo_conducir',
      texto: 'Elige a tus acompañantes y conduce la furgo hasta la circunvalación',
      tipo: 'minijuego',
      minijuego: 'Furgo',
      antes: [
        ['palicaso', 'Sitio para tres, contigo. Y Cotine, que ya se ha sentado.'],
        ['puky', '¿Me invitáis? …¿De verdad se puede? ¿Puedo preguntar?'],
        ['lasslow', 'Un servidor, naturalmente. Con pajarita.'],
        ['pompa', 'Yo me apunto. Si no hay prisa.'],
        ['vuper', '(Cada uno cambiará el viaje a su manera. Elige con cabeza.)'],
      ],
      despues: [
        ['narrador', 'Treinta kilómetros de curvas, conos y un sofá. La furgo llega entera. Casi.'],
        ['cotine', 'Hemos pasado ocho gasolineras.'],
        ['vuper', 'Y no hemos parado en ninguna.'],
        ['cotine', 'Lo sé. Las he contado.'],
      ],
      pista: '«¡Escucha, escucha! Cambias de carril, esquivas lo que salga y coges los monchis. Y mira que no te tape la vista mi bocadillo, que cuando me emociono…»',
    },
    {
      id: 'furgo_control',
      texto: 'Pasa el control sin que se note nada (gafas, ventanilla y cara de normal)',
      tipo: 'minijuego',
      minijuego: 'Control',
      antes: [
        ['palicaso', 'Las gafas, Vuper. Las de la guantera. Y la ventanilla, que se airee.'],
        ['narrador', 'La guantera se abre un dedo. Dentro, dos ojillos. Se cierra otra vez.'],
        ['palicaso', 'Es Don Eusebio. Lleva tres años ahí. Se le deja tranquilo.'],
        ['vuper', '(Luces azules. Respira. Respira.)'],
        ['agente', 'Buenas noches. Control de rutina. Ventanilla.'],
        ['narrador', 'La ventanilla baja. Sale una nube de humo que se queda un segundo parada delante de la gorra.'],
        ['agente', 'Hm.'],
          ['agente', '¿Llevan algo? Ya me entiende. Algo para fumar que no sea tabaco.'],
          ['vuper', '¿Cuál policía, señor porro?'],
          ['narrador', 'Silencio. Dentro de la furgo, nadie respira. Lasslow se muerde la pajarita.'],
          ['agente', '…¿Cómo dice?'],
          ['vuper', 'Digo… ¿cuál porro, señor policía? Eso. Lo otro no. Eso.'],
          ['agente', 'Hm.'],
      ],
      despues: [
        ['agente', 'Está todo en orden. Circulen.'],
        ['narrador', 'Nadie respira. Alguien, atrás, deja escapar el aire muy despacio.'],
        ['narrador', 'Nadie lo sabe, pero cuando el agente abrió la guantera, Don Eusebio ya se había metido el estuche de Palicaso en el carrillo izquierdo. Y se había hecho el peluche. Con dignidad.'],
        ['narrador', 'Se le han limpiado los ojos. Por primera vez en tres años, alguien necesitaba que guardara algo.'],
        ['agente', 'Una cosa más. ¿Van a la feria?'],
        ['vuper', '…Sí.'],
        ['agente', 'Mi turno acaba ahora. ¿Me hacen un hueco?'],
        ['vuper', '(Le tenemos que llevar. O nos pide más papeles.)'],
        ['cotine', 'Yo no he dicho que quiera ir. Y ahora, con un policía.'],
      ],
      pista: '«Pin pin. Baja la ventanilla, que salga el humo. Gafas para los ojos. Y chista a quien se vaya a escapar. Chista, chista. A mí no. A mí no.»',
      fallo: [
        ['agente', 'Bajen del vehículo. Todos. Despacio.'],
        ['narrador', 'Un cuaderno, una linterna y veinte minutos que se hacen largos. Multa de 20 monchis. Sin sermón: el agente tiene prisa.'],
        ['agente', 'Pueden seguir. Pero me llevan. Mi patrulla no arranca.'],
      ],
    },
    {
      id: 'furgo_llegar',
      texto: 'Aparca la furgo en el descampado de la feria, siguiendo las luces',
      tipo: 'recado',
      antes: [
        ['narrador', 'El agente va detrás, con la gorra en las rodillas, apretado junto a Cotine. Nadie dice nada. Se oye el motor y a alguien que se aguanta algo.'],
        ['agente', 'Huele a pino.'],
        ['vuper', 'Es el ambientador.'],
        ['agente', 'Lo sé. Lo digo con admiración.'],
        ['narrador', 'Tras la última colina, el descampado se enciende: una noria, bombillas, casetas, música de feria.'],
        ['vuper', 'Ahí está.'],
        ['cotine', '…'],
        ['narrador', 'Cotine ha dejado de refunfuñar. Tiene los ojos pegados a la ventanilla, donde las bombillas se le reflejan una a una. Lleva un rato sin pedir ninguna gasolinera.'],
      ],
      despues: [
        ['narrador', 'La furgo aparca junto a la valla. Suena música de feria y huele a azúcar quemado.'],
        ['vuper', '¿Cotine?'],
        ['cotine', '…'],
        ['narrador', 'No contesta. Mira las luces.'],
      ],
      pista: '«¡Escucha! Sigue las luces, Vuper. Las de colores, que las azules ya las hemos visto. Y no pares en la gasolinera, que Cotine se baja.»',
    },
  ],

  giro: [
    ['narrador', 'Tras la última curva, un destello. Azul. Rojo. Azul.'],
    ['vuper', '(Luces azules.)'],
    ['cotine', '¿Eso es la feria?'],
    ['narrador', 'No es la feria. Es un control de los agentes del humo, con gorra, linterna y todo el tiempo del mundo.'],
    ['vuper', 'Vale, vale… Tranquilos.'],
    ['narrador', 'En la furgo, de repente, todo el mundo se mueve. Alguien tapa algo, alguien se aguanta algo. El humo no se ha ido y la ventanilla no baja.'],
  ],

  cierre: [
    ['narrador', 'Antes de bajar, una bolita de pelo sale de la guantera, deja un estuche sobre el salpicadero y vuelve a su sitio. Nadie dice nada. Perico lo mira con respeto.'],
    ['narrador', 'Todos bajan de la furgo. Todos menos Cotine, que sigue con la cara en la ventanilla.'],
    ['vuper', '¿Cotine?'],
    ['cotine', '…'],
    ['narrador', 'No contesta. De momento, nadie lo entiende.'],
    ['agente', 'Hasta aquí llego. Mi turno acabó hace dos curvas.'],
    ['vuper', '¿Dos curvas? Entonces… ¿ya no era agente cuando nos preguntó por el olor?'],
    ['agente', 'Era agente. Pero ya no me importaba.'],
    ['vuper', 'Vale, vale…'],
    ['agente', 'Y suban esa ventanilla. Se les nota el pino.'],
  ],

  // ---- una frase por acompañante, solo si va a bordo (opcional) ----
  giroSi: {
    palicaso: ['palicaso', '¡Escucha, escucha! Esto me recuerda a una vez que en una furgo como esta…'],
    lasslow: ['lasslow', 'Caballeros, mantengamos la compostura. JA… perdón. Ya empiezo mal.'],
    perico: ['perico', 'Pin pin. Policía. Policía.'],
    pompa: ['pompa', 'Sobre lo de hace un rato: sí, me parecía bien. Y ahora, ¿qué pasa?'],
    blancaso: ['blancaso', 'Yo ya sabía que esto iba a pasar.'],
    puky: ['puky', '¿Me llamabais? Mira, luces. ¡Qué bonito!'],
  },
  controlSi: {
    palicaso: ['palicaso', 'Agente, esto no es lo que parece. Es mejor. Escuche, escuche…'],
    lasslow: ['lasslow', 'Un caballero no se ríe ante la autoridad. Mmf… Mmfjaja…'],
    perico: ['perico', 'Pin pin. Aquí huele. Aquí huele.'],
    pompa: ['pompa', 'Agente, sobre la pregunta de hace dos preguntas…'],
    blancaso: ['blancaso', 'Multa, juicio y mi madre enterándose. Lo estoy viendo.'],
    puky: ['puky', 'Hola, agente. Me he quedado pegado. Con cariño.'],
  },
  llegadaSi: {
    palicaso: ['palicaso', '¡Fiuuu! ¡Mirad la noria! ¡Mirad! ¡Mirad todos! ¡Mirad!'],
    lasslow: ['lasslow', 'Caballeros, qué espectáculo. JA… pe… ¡Mmf! Perdón.'],
    perico: ['perico', 'Pin pin. Churros. Churros.'],
    pompa: ['pompa', 'Qué luces. Ahora las veo. Hace un rato que las veía.'],
    blancaso: ['blancaso', 'Lo apunto: llegada, 23:58. Sin muertos.'],
    puky: ['puky', '¡Blurp! ¡Una noria que gotea! ¡Como yo!'],
  },
  llegaSolo: {
    palicaso: ['narrador', 'Palicaso llega el primero, a pie y hablando. Nadie sabe cómo ha cruzado la circunvalación contando una historia.'],
    lasslow: ['narrador', 'Lasslow llega en el último autobús nocturno, con pajarita y una sonrisa de señor que ha pagado billete.'],
    perico: ['narrador', 'Perico llega volando. Se posa sobre la noria y silba. Nadie le ha pedido que lo haga.'],
    pompa: ['narrador', 'La Pompa aparece flotando sobre la valla, con el viento a favor. «Perdón, me he adelantado.» Lo dice cuando todos ya se han ido.'],
    blancaso: ['narrador', 'Blancaso llega en el último autobús, con el billete apuntado en la agenda y el gesto de quien ya lo sabía.'],
    puky: ['narrador', 'Puky ya estaba debajo de la noria. Nadie le ha preguntado cómo ha llegado. Él tampoco lo sabe.'],
  },

  chats: [
    [['palicaso', 'FURGO LISTA. Llaves rescatadas de la percha. ¡Escucha, escucha: caben tres!'], ['perico', 'Pin pin. Mi percha. Vacía. Vacía.'], ['blancaso', 'Anoto: furgo, tres años sin ITV.']],
    [['blancaso', 'Quiero el asiento de la ventanilla. Por si acaso.'], ['palicaso', 'La ventanilla no baja.'], ['blancaso', 'Entonces atrás, con Cotine.'], ['cotine', 'Yo no he dicho que vaya.']],
    [['lasslow', 'Caballeros, he leído que en los controles hay que mantener la compostura. JA… perdón. Ya empiezo mal.'], ['blancaso', 'Lasslow, no vengas.'], ['lasslow', 'Es la risa de los nervios.']],
    [['cotine', 'Si pasáis por una gasolinera, avisadme.'], ['palicaso', 'Hay ocho de camino.'], ['cotine', '…Yo no he dicho nada.']],
    [['puky', '¿Me llamabais? ¿Se puede ir en el parabrisas? Por si no hay sitio.'], ['blancaso', 'No.'], ['puky', 'Me he agarrado ya.']],
    [['niebla', '¿Dónde vais? ¿A una feria? ¿Y volvéis? ¿Y yo?'], ['palicaso', 'Niebla, tú vienes. Ya estás en la furgo.'], ['niebla', '¿Qué furgo?']],
  ],

  ambiente: [
    [['palicaso', '¡Escucha! La furgo lleva tres años dormida y ha arrancado con más ganas que yo por las mañanas.'], ['blancaso', 'Eso no es difícil.']],
    [['perico', 'Pin pin. Llaves. Llaves.'], ['vuper', 'Ya, Perico. Ya las tengo.']],
    [['lasslow', 'Un señor no sale sin ambientador.'], ['cotine', '¿Eso se come?']],
    [['pompa', 'Me gusta la furgo. Se mueve, pero quieta.'], ['puky', '¿Me llamabais?']],
    [['blancaso', 'La ITV caducó en el año del pez.'], ['palicaso', 'Es un detalle técnico, Blancaso.']],
    [['niebla', '¿Por qué hay una furgo en Unaké?'], ['palicaso', 'Siempre ha estado, Niebla.'], ['niebla', 'Ah.']],
  ],

  memes: [
    { arriba: 'EL AGENTE: «¿QUÉ ES ESE OLOR?»', abajo: 'LA FURGO: «PINO. PINO. PINO.»', quien: 'vuper', idea: 'Vuper con gafas de sol y una gota de sudor al volante de la furgo, ventanilla bajada y una nube de humo saliendo; un ambientador de pino colgando del retrovisor; en la ventanilla, el agente con gorra y linterna oliendo con la nariz alzada. Sobre verde croma.' },
    { arriba: 'SU DIETA: DULCE, SALADO Y UN SITIO DONDE SENTARSE', abajo: 'EL AGENTE: «HAY SITIOS PEORES»', quien: 'cotine', idea: 'Asiento trasero de la furgo visto desde la ventanilla: Cotine rodeada de bolsas de patatas y un ambientador mordido; el agente apretado a su lado con la gorra en las rodillas y gesto de resignada aprobación. Sobre verde croma.' },
    { arriba: 'CUANDO EL AGENTE PREGUNTA POR EL PÁJARO', abajo: 'EL MOTOR SILBA', quien: 'perico', idea: 'Perico con las dos alas tapándose el pico, sudando, delante del parabrisas; detrás, el agente con linterna alzando una ceja. Sobre verde croma.' },
    { arriba: 'MANTUVE LA COMPOSTURA EN EL CONTROL', abajo: 'MIS PIECECILLOS, DEBAJO: NO', quien: 'lasslow', idea: 'Lasslow con pajarita rígido como un palo, lágrimas contenidas y mejillas hinchadas, con la mano de Vuper tapándole la boca; debajo, sus piececillos temblando y una nubecita mínima. Sobre verde croma.' },
  ],
};

// =========================================================================================================
// FRASES_FURGO · lo que suelta cada acompañante durante el viaje (minijuego «Furgo»). Se barajan sin repetir.
// Cotine va siempre. La sensación se ve y no se nombra. La frase estrella sale una vez como mucho en cada lista.
// =========================================================================================================
const FRASES_FURGO = {
  palicaso: [
    '¡Escucha, escucha! Esta furgo la compré en el dos mil nueve, o en el diez, y esta no te la he contado…',
    'Entonces el tío me dice: «Palicaso, ¿y la carretera?». Y yo le digo: «¿Qué carretera?». Y es que había una carretera.',
    'Y luego pasó lo de la gasolinera, que esa sí que no te la he contado…',
    'Y el del puesto de castañas me mira y me dice… ¿por dónde iba?',
    'A la derecha, Vuper. No, a la otra derecha. Bueno, sigue, que te cuento lo del cartel.',
    '¡Fiuuu! ¡Qué velocidad! ¡Esto es la feria sobre ruedas!',
    'Yo conducía antes, ¿eh? Hasta que la furgo y yo tuvimos aquella conversación.',
    'Pues eso, que como te decía, que no te lo decía, pero te lo iba a decir…',
  ],
  lasslow: [
    'Caballeros, qué suspensión tan… JA… perdón.',
    'Ese cono, caballero. Tiene un aire de… JA… de cono. Perdón.',
    'Un sofá. En mitad de la carretera. JAJA… con su cojín.',
    'Un bache me ha hecho cosquillas en las posaderas. JA… perdón.',
    'Esto no ha sido el bache. No miren. Un señor no se explica.',
    'Una nube, delante. Me ha caído en gracia. JA.',
    'El cartel decía «Cuidado con el ganado». Ay, qué risa. Perdón.',
    'Yo, de joven, viajaba en tren. Con sombrero. Y me reía igual.',
  ],
  perico: [
    'Pin pin. Cartel. Cartel.',
    'Pin pin. «Ceda el paso». Ceda. Ceda.',
    'Pin pin. Gasolinera. Gasolinera. ¿Pipas? ¿Pipas?',
    'Pin pin. Curva a la derecha. A la derecha. Lo dice el cartel.',
    'Pin pin. Vuper no sabe conducir. No sabe.',
    'Pin pin. Conos. Hay conos. Conos.',
    'Pin pin. ¿Falta mucho? ¿Falta mucho?',
    'Pin pin. «Prohibido adelantar». Adelantar. Adelantar.',
  ],
  cotine: [
    'Para en la gasolinera. Tengo hambre. No, no es por la feria.',
    '¿Cuánto falta? Porque yo no he dicho que quiera ir. Solo pregunto cuánto falta.',
    'Gasolinera. Gasolinera. Esa tiene bollería, lo huelo.',
    'Un pellizquito nada más… (ñam) …del ambientador.',
    'Yo iba a quedarme en casa. Con mis cosas. En paz.',
    'Cuidado con los baches, que me bamboleo y me caigo del palo.',
    'No me mires por el retrovisor, Vuper. Mira la carretera.',
    '¿Eso se come? …Un cono. Vale. Casi.',
  ],
  pompa: [
    'Más despacio, por favor. A cierta velocidad me pongo nerviosa.',
    'Sí, me parece bien lo de antes.',
    'Esta curva me la tomo con calma.',
    'Sobre el bache de hace un rato: no lo noté. Flotaba.',
    'Si aceleras, yo no, que exploto.',
    'Qué quietud. Se oye el motor. Y a Palicaso. Y el motor otra vez.',
    'Ha entrado un soplido. Voy hacia la ventanilla… despacio.',
    'Sobre lo que dijo Blancaso hace tres curvas: tiene razón.',
  ],
  blancaso: [
    'Yo ya sabía que esto iba a pasar. Todavía no ha pasado, pero lo sabía.',
    'Otra vez no… Otra curva.',
    'Frena. Frena un poco. Frena. Me voy a casa.',
    'Lo he apuntado en la agenda: «Viaje en furgo, 21:40, sufrimiento».',
    'Si hay un bache, que sea pequeño. Un bache pequeño. Por favor.',
    'Me voy a casa. …Bájame aquí. …No, aquí no, que hay un cono.',
    '¿Cuántas curvas quedan? No, no me lo digas. Dímelo.',
    'La ventanilla abierta es por el aire. No es por mí.',
  ],
  puky: [
    '¿Me llamabais? Estoy en el parabrisas. Os veo a todos.',
    '¡Me han invitado! A una furgo. Con ventanillas.',
    'Blurp. Estoy pegadísimo. Qué buen sitio.',
    'Desde aquí se ve todo. Menos cuando me escurro.',
    '¡Un bache! ¡Otro! ¡Me encantan! Me salpico entero.',
    'Eh, Vuper, el limpiaparabrisas me hace cosquillas.',
    'Blurp. Me he comido un mosquito. Un poco por accidente.',
    'Esto es lo mejor que me ha pasado. Dejadme aquí, en el cristal, para siempre.',
  ],
};

// Una frase de cada uno al ser elegido en la pantalla de acompañantes.
const FRASES_ELEGIR_FURGO = {
  palicaso: 'Yo voy, claro. Os cuento por el camino lo de la furgo. Y lo de antes de la furgo.',
  lasslow: 'Caballero, me honra. JA… perdón. Llevaré la compostura. Y la pajarita.',
  perico: 'Pin pin. Voy de copiloto. De copiloto.',
  cotine: 'Yo ya estoy dentro. Y no he dicho que quiera ir.',
  pompa: 'Vale. Pero sin prisa. Si hay prisa, no.',
  blancaso: 'Voy. Pero lo sé: nos vamos a arrepentir.',
  puky: '¿De verdad? ¿A mí? Blurp. ¡Voy a hacer de parabrisas!',
};

// =========================================================================================================
// PREGUNTAS_CONTROL · minijuego «Control». El agente pregunta; hay 3 respuestas:
//   normal (baja sospecha) · sospechosa (la sube; es lo que dice un nervioso de verdad) · absurda (graciosa; cuela o no cuela).
// «si»: solo sale si ese acompañante va a bordo. Las respuestas se barajan en pantalla. No hay sermones.
// =========================================================================================================
const PREGUNTAS_CONTROL = [
  // Pedido del usuario (31/10/2026): Vuper lo dice sí o sí. El trabalenguas del fumado: las palabras
  // se le cambian de sitio. Sale la primera en la primera partida (campo `primera`).
  {
    id: 'algo', si: null, primera: true,
    pregunta: '¿Llevan algo? Ya me entiende. Algo para fumar que no sea tabaco.',
    normal: { texto: 'No, agente. Nada. Solo pipas de Perico.', agente: 'Hm. Las pipas, bien.' },
    sospechosa: { texto: '¿Algo? ¿Algo de algo? ¿Qué es algo?', agente: 'Algo es algo. No me haga repetirlo.' },
    absurda: { texto: '¿Cuál policía, señor porro?', cuela: true, agente: '…¿Cómo dice? …Da igual. He tenido un turno muy largo. Circulen.' },
  },
  {
    id: 'origen', si: null,
    pregunta: '¿De dónde vienen?',
    normal: { texto: 'De un bar del barrio, agente. De cenar con amigos.', agente: 'Hm. Bien.' },
    sospechosa: { texto: 'De… eh… ¿De dónde veníamos? (mira atrás) ¿De dónde veníamos?', agente: 'Eso pregunto yo.' },
    absurda: { texto: 'Del entierro de un pez. Se llamaba Fortunato.', cuela: true, agente: 'Mi más sentido pésame. …¿Era grande?' },
  },
  {
    id: 'destino', si: null,
    pregunta: '¿A dónde van?',
    normal: { texto: 'A la feria, agente. Dicen que hay noria.', agente: 'La hay.' },
    sospechosa: { texto: 'A ningún sitio. Es decir, a uno. No. A ninguno.', agente: 'Repítame eso.' },
    absurda: { texto: 'A cobrar un churro que me deben desde el noventa y ocho.', cuela: false, agente: 'Eso ha prescrito. Y usted me toma el pelo.' },
  },
  {
    id: 'bebida', si: null,
    pregunta: '¿Han bebido?',
    normal: { texto: 'Solo agua, agente. Y un refresco.', agente: 'Bien.' },
    sospechosa: { texto: '¿Beber? ¿Nosotros? Yo no. ¿Tú? Él no. Nadie ha bebido nada. Ni una calada. Digo, ni un trago.', agente: 'Mm.' },
    absurda: { texto: 'Solo el ambientador. A mi amiga le entró sed.', cuela: false, agente: 'Lo apunto. «Ambientador».' },
  },
  {
    id: 'olor', si: null,
    pregunta: '¿Qué es ese olor?',
    normal: { texto: 'El ambientador, agente. Pino. Muy fuerte.', agente: 'Mucho pino, sí.' },
    sospechosa: { texto: '¿Qué olor? Yo no huelo nada. ¿Tú hueles algo? Es que ya me he acostumbrado.', agente: 'Eso es justo lo que me preocupa.' },
    absurda: { texto: 'Es colonia. Mucha. Nos la ha echado un tío en un semáforo.', cuela: true, agente: 'Pasa mucho.' },
  },
  {
    id: 'ojos', si: null,
    pregunta: '¿Por qué tiene los ojos así?',
    normal: { texto: 'Es la luz de la carretera, agente. Me deslumbra. Por eso las gafas.', agente: 'Entendido.' },
    sospechosa: { texto: '¿Los ojos? ¿Qué les pasa a mis ojos? ¿Se ven mal? ¿Se ven?', agente: 'Se ven.' },
    absurda: { texto: 'Alergia al polen. Y a los controles.', cuela: false, agente: '«A los controles», dice.' },
  },
  {
    id: 'dueno', si: null,
    pregunta: 'Documentación. ¿De quién es la furgo?',
    normal: { texto: 'De un amigo, agente. Aquí tiene los papeles.', agente: 'En regla.' },
    sospechosa: { texto: 'Es… prestada. No, comprada. Heredada. Es de la familia.', agente: 'Los papeles.' },
    absurda: { texto: 'De mi amigo, que es una estrella. Fugaz, pero de las buenas.', cuela: true, agente: 'Con los papeles en regla, me da igual que sea una constelación.' },
  },
  {
    id: 'ventanilla', si: null,
    pregunta: '¿Por qué llevan la ventanilla bajada con este frío?',
    normal: { texto: 'Para que se airee, agente. Dormirse al volante es peligroso.', agente: 'Prudente.' },
    sospechosa: { texto: 'Calor. Tengo mucho calor. Sudo. Todos sudamos. Estamos sudando mucho, ¿verdad?', agente: 'Se nota.' },
    absurda: { texto: 'Es que me cae bien el invierno. Quería saludarlo.', cuela: false, agente: 'Salúdelo con la ventanilla subida.' },
  },
  {
    id: 'guantera', si: null,
    pregunta: '¿Qué hay en la guantera?',
    normal: { texto: 'Las gafas, los papeles y unos pañuelos.', agente: 'Correcto.' },
    sospechosa: { texto: 'Nada. Cosas. Nada ilegal. Cosas normales. Papeles. Y… cosas.', agente: 'Ábrala.' },
    absurda: { texto: 'Un hámster retirado. Se llama Don Eusebio.', cuela: true, agente: 'Ábrala. …Hay un hámster. Siga.' },
  },
  {
    id: 'maletero', si: null,
    pregunta: '¿Qué llevan en el maletero?',
    normal: { texto: 'Una nevera con bebidas y algo de picar. Vamos a una feria.', agente: 'Bien.' },
    sospechosa: { texto: 'En el maletero… ¿en cuál? Nada. No lo abra. Que no se abre bien.', agente: 'Lo abro yo.' },
    absurda: { texto: 'Un sofá. El de la carretera. Se nos cayó y volvimos a por él.', cuela: true, agente: 'Lo he visto en el arcén. Me alegro de que lo recogieran.' },
  },
  {
    id: 'bolsas', si: null,
    pregunta: '¿Y todas esas bolsas de patatas?',
    normal: { texto: 'La merienda, agente. Para el viaje.', agente: 'Razonable.' },
    sospechosa: { texto: 'Es que nos ha dado hambre. De repente. A los cinco. Sin motivo. Un hambre normal.', agente: 'Mm.' },
    absurda: { texto: 'Es nuestra dieta. Dulce, salado y un sitio donde sentarse.', cuela: true, agente: 'Hay sitios peores donde sentarse.' },
  },
  {
    id: 'pajaro', si: ['perico'],
    pregunta: '¿Ese pájaro es suyo?',
    normal: { texto: 'De un amigo. Va de copiloto y no molesta.', agente: 'Hm.' },
    sospechosa: { texto: 'Ese pájaro no sabe nada. No ha visto nada. No le pregunte nada.', agente: 'Se lo voy a preguntar.' },
    absurda: { texto: 'No es un pájaro. Es el motor. Silba.', cuela: false, agente: 'El motor tiene plumas.' },
  },
  {
    id: 'risa', si: ['lasslow'],
    pregunta: '¿De qué se ríe el señor?',
    normal: { texto: 'Es muy risueño, agente. Un caballero risueño.', agente: 'Ya veo.' },
    sospechosa: { texto: 'No es nada. Se ríe de… los baches. De las curvas. De nada.', agente: 'De nada, dice.' },
    absurda: { texto: 'Es su tos. Una tos muy alegre.', cuela: true, agente: 'Que se la mire.' },
  },
];

// =========================================================================================================
// AGENTE_CONTROL · frases secas del agente (figurante: nada de monólogos). Se barajan sin repetir.
// =========================================================================================================
const AGENTE_CONTROL = {
  acercarse: [
    'Buenas noches. Control de rutina. Ventanilla.',
    'Documentación. Y calma, que se les nota la prisa.',
    'Apague el motor. Y las risas, si puede.',
  ],
  sospechar: [
    'Mm.',
    'Repítame eso.',
    'Eso es lo que dicen todos.',
    'Me huele a que me están contando una historia.',
  ],
  dejarles_ir: [
    'Está todo en orden. Circulen.',
    'Pueden seguir. Aunque siga oliendo a pino.',
    'Una cosa más. ¿Van a la feria? Mi turno acaba ahora. ¿Me hacen un hueco?',
  ],
  pillarles: [
    'Bajen del vehículo. Todos. Despacio.',
    'Voy a necesitar que me acompañen. Es por mi informe, no por ustedes.',
    'Multa de veinte monchis. Y no me miren así: yo también tengo prisa.',
  ],
};

// =========================================================================================================
// ESCAPES_CONTROL · lo que se le escapa a cada acompañante si no lo tapas a tiempo («escapa») y su versión tapada
// («tapado»: mano en la boca, chistido, ventanilla…). Si se escapa, sube la barra de sospecha y el agente remata con «reaccion».
// =========================================================================================================
const ESCAPES_CONTROL = {
  palicaso: {
    escapa: [
      '¡Escucha, escucha, agente! Esta no se la he contado: una noche, en esta misma furgo, llevábamos tanto humo que…',
      'Agente, ¿usted ha estado alguna vez de charleta a las tres de la mañana? Pues eso.',
    ],
    tapado: ['Mmf. ¡Mmmf!'],
    reaccion: 'No me interrumpa su historia. Termínela.',
  },
  lasslow: {
    escapa: [
      'JA… JAJAJA… perdón, agente, es que… «agente»… JA.',
      '¡Que se me ha escapao! JAJAJA.',
    ],
    tapado: ['Mmf… mfjajaja…'],
    reaccion: '…¿Eso ha sido un bache?',
  },
  perico: {
    escapa: [
      'Pin pin. ¡Contraseña! ¡Contraseña!',
      'Pin pin. Hay monchis en la guantera. En la guantera.',
      'Pin pin. Aquí huele. Aquí huele.',
    ],
    tapado: ['Pin… (pico tapado) pff.'],
    reaccion: 'El pájaro ha dicho algo.',
  },
  cotine: {
    escapa: [
      '(ñam ñam) ¿Esto es el ambientador? Sabía a pino. ¿Qué? Tenía hambre.',
      'Un pellizquito nada más… (cruje una bolsa)',
    ],
    tapado: ['Ñam. (muy bajito)'],
    reaccion: '¿Se acaba de comer el ambientador?',
  },
  pompa: {
    escapa: [
      'Perdone, agente: sobre su pregunta de hace dos preguntas… sí, olía a pino.',
      '¿Puede cerrar la ventanilla? Me voy con la corriente.',
    ],
    tapado: ['Plop (chiquito).'],
    reaccion: 'Ahora mismo le contesto yo a usted. Cuando vuelva.',
  },
  blancaso: {
    escapa: [
      'Multa, juicio y mi madre enterándose. Lo estoy viendo.',
      'Agente, yo no tengo nada que ver. Yo solo llevo las cuentas. De todo. Con recibos.',
    ],
    tapado: ['(suspiro largo)'],
    reaccion: 'Nadie le ha acusado de nada. Aún.',
  },
  puky: {
    escapa: [
      '¿Me llamabais? Hola, agente. Me he quedado pegado al cristal. Con cariño.',
      '¡Me han invitado! Hoy me han invitado. ¡Blurp!',
    ],
    tapado: ['Blurp… (bajito)'],
    reaccion: 'Hay algo amarillo en mi parabrisas. Y me habla.',
  },
};


// =========================================================================================================
// DON_EUSEBIO · el hámster de la guantera (PROPUESTA de lore nuevo; el usuario lo quiere si aporta carácter y se le coge cariño).
// No habla: lo cuenta el narrador o se ve en reacciones cortas. Sale por primera vez en este capítulo y desde aquí vive en la furgo.
// =========================================================================================================
const DON_EUSEBIO = {
  ficha: {
    nombre: 'Don Eusebio',
    llegaEn: 10.5,
    vive: 'La guantera de la furgo de Palicaso.',
    quien: 'Un hámster gordo y digno, con aires de catedrático jubilado. Tiene la dignidad de quien nunca ha tenido que demostrarla.',
    comoLlego: 'Hace tres años, el día que la furgo se quedó bajo la lona, Palicaso dejó en la guantera una bolsa de pipas. Don Eusebio entró a por una, se quedó dormido sobre las demás y nadie volvió a abrir. No sabe que han pasado tres años. Cree que es martes.',
    quiere: 'Que le confíen algo para guardar. Que alguien le diga «esto, Don Eusebio, solo a usted».',
    sabotea: 'Es un hámster: lo guarda todo en los carrillos, no sabe devolver, se hace bola y se duerme en cuanto se asusta. Lo más importante que le dan, justo cuando hace falta, queda dentro, y hay que esperar a que se despierte.',
    mania: 'Se hace el peluche cuando alguien le mira: se queda quieto con los ojos abiertos y cara de muñeco. Y guarda todo lo que no es suyo, con orden y sin avisar.',
    comoSeMueve: 'Rueda, trota, se esconde. Sube por el volante con las dos patitas delanteras como quien sube una escalera de biblioteca.',
    relaciones: 'Perico lo mira con respeto: es el único que guarda secretos sin contarlos. Cotine lo mira con otro tipo de interés, y Don Eusebio lo sabe y no se separa del carrillo izquierdo. Con Puky se llevan bien: los dos se quedan pegados a cualquier cosa.',
    momentoPersona: 'En el control, con el agente abriendo la guantera, se mete el estuche de Palicaso en el carrillo y se hace el peluche. Nadie se entera. Se le limpian los ojos: alguien necesitaba que guardara algo, y lo ha hecho bien.',
    ojos: 'Dos cuentas negras y brillantes. Al fingir que es un peluche, muy abiertos y sin parpadear.',
    voz: 'Ninguna: chasquea la lengua y mueve los bigotes. Cuando se ofende, un bufido largo.',
  },
  frases: {
    arrancar: [
      '*Don Eusebio asoma la nariz por la rendija de la guantera, huele el pino y vuelve a esconderse con gesto de desaprobación.*',
      '*El motor tose. Don Eusebio se agarra a una pipa con las dos manitas.*',
      '*Don Eusebio se incorpora, se arregla los bigotes y mira alrededor como quien llega tarde a un congreso.*',
      '*Una bolita de pelo da una vuelta entera dentro de la guantera, protesta y vuelve a su sitio.*',
      '*Don Eusebio comprueba con una patita que sigue siendo martes.*',
    ],
    curvas: [
      '*Don Eusebio rueda a la izquierda. Rueda a la derecha. Una pipa le sigue.*',
      '*En la curva, la tapa de la guantera da un golpecito. Don Eusebio contesta con otro desde dentro.*',
      '*Don Eusebio se agarra a un paquete de pañuelos como a un salvavidas.*',
      '*Se oye un «chac chac chac» muy dentro del salpicadero. Es Don Eusebio contando las curvas.*',
      '*Don Eusebio asoma, ve una curva más y se tapa los ojos con las patas.*',
    ],
    golpe: [
      '*Un bache. Un cono. Don Eusebio sale disparado hasta el techo de la guantera y se queda allí pegado, ofendido.*',
      '*Don Eusebio se hace bola. Bola de pelo. Bola de dignidad herida.*',
      '*Se oye un «pof» pequeño. Después, un bufido largo.*',
      '*Don Eusebio asoma la cabeza, mira a Vuper, no dice nada, y su silencio dice mucho.*',
      '*Don Eusebio se pone en pie sobre un montón de pipas y señala la carretera con una patita, como un profesor.*',
    ],
    control: [
      '*Don Eusebio se queda quieto con los ojos muy abiertos. Es un peluche. Siempre lo fue.*',
      '*La linterna le alumbra. Don Eusebio no parpadea. Los peluches no parpadean.*',
      '*Los carrillos de Don Eusebio han crecido un poco. Nadie ha querido preguntar por qué.*',
      '*El agente le mira. Don Eusebio le mira. Es un duelo de miradas y gana el hámster.*',
      '*Don Eusebio traga saliva. Si es que un peluche traga saliva.*',
      '*Don Eusebio deja caer una pipa, solo una, para disimular.*',
    ],
    ganar: [
      '*Don Eusebio sale de la guantera y hace una reverencia a los pasajeros. Nadie le aplaude. Él no lo necesita.*',
      '*Don Eusebio se llena los carrillos de pipas, satisfecho: es su manera de celebrar.*',
      '*Don Eusebio chasquea la lengua, que es lo que hace cuando todo sale bien.*',
      '*Una pipa vuela por el aire y cae en la mano de Vuper. Es un regalo.*',
      '*Don Eusebio se acomoda sobre el estuche, el pañuelo y la noche. Hoy ha sido un buen día.*',
    ],
    perder: [
      '*Don Eusebio mira a Vuper desde la guantera, suspira, y vuelve a cerrar la tapa desde dentro.*',
      '*Don Eusebio saca una patita y apunta algo en una libreta imaginaria.*',
      '*Don Eusebio se vuelve a hacer bola. Mañana será otro martes.*',
      '*Don Eusebio mastica una pipa con furia contenida.*',
      '*Don Eusebio mira el techo de la furgo como quien mira un tribunal.*',
    ],
    escapa: [
      '*La guantera se abre sola. Don Eusebio trota por el salpicadero con la barriga al aire, libre y radiante.*',
      '*Don Eusebio sube por el volante. Con las manos. Como una escalera de biblioteca.*',
      '*Don Eusebio se asoma al parabrisas. Puky le saluda desde fuera. Se saludan.*',
      '*Una pelusa sale de la guantera, cruza el asiento de Cotine y se pierde bajo el asiento. Cotine se pone en guardia.*',
      '*Don Eusebio se ha escapado. Ha dejado una nota: «Vuelvo en seguida». No sabe escribir.*',
      '*Don Eusebio explora el cenicero. Lo cataloga. Lo rechaza.*',
    ],
    vuelve: [
      '*Don Eusebio vuelve a la guantera por su propio pie, con el aire de quien ha hecho una gestión.*',
      '*Perico lo recoge en el pico, con delicadeza, y lo devuelve a su sitio. Es la primera vez que Perico no dice nada.*',
      '*Don Eusebio entra rodando. La tapa se cierra de un golpe y se oye un «ahh» pequeñito.*',
      '*Don Eusebio vuelve con una pipa que no es suya. Nadie pregunta.*',
      '*Cotine lo devuelve a la guantera sin mordisco. Se le ve el esfuerzo.*',
    ],
  },
};

// =========================================================================================================
// ENCARGOS_FURGO · encargos secundarios repetibles con la furgo, después del capítulo (modo libre incluido).
// carga: normal | fragil | pasajero. distancia 1-3. probControl 0..0.6 = probabilidad de que salga un control en el trayecto.
// desde: capítulo a partir del cual existe el encargo (el cliente ya ha salido en la historia).
// =========================================================================================================
const ENCARGOS_FURGO = [
  {
    id: 'tarta_niebla', titulo: 'La tarta de cumpleaños', cliente: 'cotine', desde: 12, carga: 'fragil',
    destino: 'La casa de Niebla', distancia: 2, probControl: 0.3, premio: { monchis: 70 },
    pedir: [
      ['cotine', 'Es el cumpleaños de Niebla. Ella no lo sabe, así que es sorpresa. Para ella y para mí.'],
      ['cotine', 'La tarta va entera. Y tiene que llegar entera. Eso es lo importante.'],
      ['vuper', '(Lo importante es que no te la comas tú.)'],
    ],
    resultados: {
      perfecto: [
        ['niebla', '¡Una tarta! ¿Para quién? ¿Para mí? ¿Por qué? Ah, es mi cumpleaños. Qué bien.'],
        ['cotine', 'Entera. Mírala. Entera.'],
      ],
      bien: [
        ['cotine', 'Le falta un trozo. No me mires así: ya venía así.'],
        ['niebla', 'Feliz cumpleaños a mí. ¿Quién era yo?'],
      ],
      desastre: [
        ['narrador', 'La tarta llega en forma de charco con una vela. La vela está intacta.'],
        ['niebla', 'Qué bonito. ¿Quién ha muerto?'],
        ['cotine', '¿Qué? Tenía hambre.'],
      ],
    },
  },
  {
    id: 'cita_lasslow', titulo: 'Un señor a su cita', cliente: 'lasslow', desde: 15, carga: 'pasajero',
    destino: 'La azotea del descampado', distancia: 2, probControl: 0.35, premio: { monchis: 90 },
    pedir: [
      ['lasslow', 'Caballero, esta noche cenamos la señorita y yo. Un señor no llega en autobús.'],
      ['lasslow', 'Mi única condición: ni un bache. Un bache me lleva a la risa. Y la risa, a lo otro. JA… perdón.'],
    ],
    resultados: {
      perfecto: [
        ['lasslow', 'Impecable, caballero. Llego sereno, con la pajarita recta. Casi no me río.'],
        ['pompa', 'Qué detalle. …Has tardado en llegar. …No, no lo has hecho.'],
      ],
      bien: [
        ['lasslow', 'Hubo un bache. Y un pequeño incidente. Nadie debe saberlo. JA… perdón.'],
        ['narrador', 'Huele raro en la furgo. Nadie dice nada. La pajarita está torcida.'],
      ],
      desastre: [
        ['narrador', 'Lasslow baja de la furgo desarreglado, riéndose, con la pajarita en el bolsillo.'],
        ['lasslow', '¡Que se me ha escapao! JAJAJA… Mejor no me esperéis.'],
        ['pompa', '(desde arriba) Ya me lo han contado.'],
      ],
    },
  },
  {
    id: 'blancaso_casa', titulo: 'Llévame a casa', cliente: 'blancaso', desde: 11, carga: 'pasajero',
    destino: 'La casa de Blancaso', distancia: 1, probControl: 0.2, premio: { monchis: 40 },
    pedir: [
      ['blancaso', 'Me voy a casa. Esta vez es verdad. Llévame, por favor.'],
      ['blancaso', 'Despacio. En las curvas, más despacio. Y sin música.'],
    ],
    resultados: {
      perfecto: [
        ['blancaso', 'Hemos llegado. Estoy en casa. …No me voy a bajar.'],
        ['vuper', '¿Por qué no?'],
        ['blancaso', 'Porque aquí se está bien. Hay asiento.'],
      ],
      bien: [
        ['blancaso', 'Me ha parecido bien. Un poquito de mareo. Lo normal.'],
        ['blancaso', 'Me voy a casa. …Ya estoy en casa. Llévame otra vez.'],
      ],
      desastre: [
        ['narrador', 'Blancaso baja con un color que ya no es el suyo y se sienta en el bordillo. Puky aparece de la nada.'],
        ['puky', '¿Me llamabais? ¡Qué pinta! ¡Qué bien!'],
        ['blancaso', 'Otra vez no…'],
      ],
    },
  },
  {
    id: 'discos_pompa', titulo: 'Los discos de la Pompa', cliente: 'pompa', desde: 17, carga: 'fragil',
    destino: 'Unaké, por la puerta de atrás', distancia: 2, probControl: 0.3, premio: { monchis: 80 },
    pedir: [
      ['pompa', 'Necesito esas cajas arriba. Arriba del todo.'],
      ['pompa', 'Despacio. Si vas rápido, los discos se rayan. Y yo, también.'],
      ['vuper', '(Eso último lo dice como quien dice «llueve».)'],
    ],
    resultados: {
      perfecto: [
        ['pompa', 'Han llegado todos. Ni un arañazo. Qué detalle.'],
        ['narrador', 'Esa noche, el techo de Unaké suena a algo que nadie ha escuchado hasta ahora.'],
      ],
      bien: [
        ['pompa', 'Falta uno. Ya lo noté hace tres curvas.'],
        ['narrador', 'El disco que falta aparece en la guantera, con Don Eusebio durmiendo encima.'],
      ],
      desastre: [
        ['narrador', 'La caja llega en trozos de vinilo. Suena un «crrr» bajo.'],
        ['pompa', 'Yo no, que exploto.'],
        ['palicaso', '¡Escucha, escucha! Se puede hacer un jarrón con eso.'],
      ],
    },
  },
  {
    id: 'cajas_blancaso', titulo: 'Cajas para el negocio', cliente: 'blancaso', desde: 11, carga: 'normal',
    destino: 'El almacén de la circunvalación', distancia: 3, probControl: 0.5, premio: { monchis: 120 },
    pedir: [
      ['blancaso', 'Veinte cajas. Con factura. Y con la agenda abierta, por si algo sale mal.'],
      ['blancaso', 'Si te paran, es un reparto. Siempre lo es. Mientras no huelas a pino.'],
    ],
    resultados: {
      perfecto: [
        ['blancaso', 'Veinte cajas, veinte facturas. Hoy duermo tranquilo.'],
        ['narrador', 'Blancaso sonríe un segundo. Lo apunta en la agenda para que no se le olvide.'],
      ],
      bien: [
        ['blancaso', 'Faltan dos cajas. Nunca sabré cuáles. Qué suerte tengo.'],
        ['perico', 'Pin pin. Las tengo. Las tengo. En mi percha.'],
      ],
      desastre: [
        ['narrador', 'Las cajas llegan, pero se oye un «ñam» desde dentro de una. Dentro, Cotine, con la boca llena y el albarán a medias.'],
        ['blancaso', 'Eso estaba contado.'],
        ['cotine', '¿Qué? Tenía hambre.'],
      ],
    },
  },
  {
    id: 'mar_perico', titulo: 'Quiero ver el mar', cliente: 'perico', desde: 11, carga: 'pasajero',
    destino: 'El mar (no hay mar)', distancia: 3, probControl: 0.25, premio: { monchis: 60 },
    pedir: [
      ['perico', 'Pin pin. Quiero ver el mar. El mar. Una vez antes de morir.'],
      ['vuper', 'Perico, aquí no hay mar.'],
      ['perico', 'Pin pin. Hay un cartel que dice «Mar». Hay un cartel.'],
    ],
    resultados: {
      perfecto: [
        ['narrador', 'Llegan a un charco enorme detrás de una gasolinera. Brilla bajo la luna.'],
        ['perico', 'Pin pin. Es el mar. Es el mar. …Es muy pequeño.'],
        ['vuper', 'Es un mar discreto.'],
      ],
      bien: [
        ['narrador', 'Llegan a un lavadero de coches con un mural de olas. Perico lo mira durante dos minutos.'],
        ['perico', 'Pin pin. Es el mar. Mojado. Mojado.'],
      ],
      desastre: [
        ['narrador', 'Llegan a un cartel que pone «MAR» y debajo, en pequeño, «de fondo».'],
        ['perico', 'Pin pin. Me han engañado. Me han engañado.'],
        ['perico', 'Pin pin. …¿Hay pipas?'],
      ],
    },
  },
  {
    id: 'invitacion_puky', titulo: 'Un sitio donde me inviten', cliente: 'puky', desde: 11, carga: 'pasajero',
    destino: 'Donde le inviten', distancia: 2, probControl: 0.2, premio: { monchis: 50 },
    pedir: [
      ['puky', '¿Me llevas a un sitio? A uno donde me inviten. Si existe.'],
      ['vuper', 'Existe.'],
      ['puky', '¿De verdad? ¿Y si no? ¿Y si me quedo en la puerta?'],
    ],
    resultados: {
      perfecto: [
        ['narrador', 'En una mesa de la feria alguien ha puesto un plato de más. Es un cumpleaños de un desconocido.'],
        ['puky', '¿Me llamabais? …¿Me llamabais a mí?'],
        ['narrador', 'Nadie le ha invitado. Nadie le ha echado. Para Puky, es casi lo mismo. Se le escurre un ojo. Se lo recoloca. Se queda.'],
      ],
      bien: [
        ['narrador', 'Llegan a una puerta con contraseña. Perico se la sopla. Puky entra por debajo.'],
        ['puky', 'No me han invitado. Pero no han tapado la rendija. Eso cuenta. ¡Eso cuenta!'],
      ],
      desastre: [
        ['narrador', 'Llegan a un sitio con una puerta cerrada y una nota: «Solo con invitación».'],
        ['puky', 'Blurp. …La nota tiene mi nombre. Mira. Pone «Puky». …Pone «no».'],
        ['vuper', 'Vale, vale… A la furgo. La furgo no pide invitación.'],
      ],
    },
  },
  {
    id: 'niebla_destino', titulo: 'No sé adónde iba', cliente: 'niebla', desde: 11, carga: 'pasajero',
    destino: 'Adónde sea que fuese', distancia: 3, probControl: 0.4, premio: { monchis: 100 },
    pedir: [
      ['niebla', 'Hola. Me ha dicho alguien que te pida que me lleves. No sé adónde.'],
      ['niebla', 'Pero iba con prisa. Creo.'],
      ['vuper', '(Genial.)'],
    ],
    resultados: {
      perfecto: [
        ['niebla', '¡Es aquí! Es aquí. Ya me acuerdo. Venía a… a… Da igual, es aquí.'],
        ['narrador', 'Es exactamente el sitio de donde salió. Ella parece muy contenta.'],
      ],
      bien: [
        ['niebla', 'No es aquí. Pero me ha gustado. ¿Quién eras tú?'],
        ['vuper', 'El conductor.'],
        ['niebla', 'Ah. Qué bien.'],
      ],
      desastre: [
        ['narrador', 'Llegan a la plaza de siempre, tres veces.'],
        ['niebla', '¿Esto es la plaza? Creo que ya he estado.'],
        ['niebla', 'Gracias por el viaje, quien seas. Ha sido el primero que recuerdo. …No, el segundo.'],
      ],
    },
  },
];

// =========================================================================================================
// EVENTOS_FURGO · sucesos al azar en la carretera (minijuego Furgo y encargos). Se barajan sin repetir.
// efecto: pista opcional para el programador.
// =========================================================================================================
const EVENTOS_FURGO = [
  { id: 'atajo', texto: 'Palicaso conoce un atajo. «Es un atajo de los míos: más largo, pero con mejores vistas.»', efecto: 'Ruta alternativa: más monchis, más curvas.' },
  { id: 'gasolinera', texto: 'Una gasolinera con luces cálidas. Algo en el aire huele a bollería.', efecto: 'Parar o seguir: parar da monchis pero gasta tiempo; Cotine insiste.' },
  { id: 'puky_cruza', texto: 'Una mancha amarilla cruza la carretera, despacio, saludando con una mano de masa. «¿Me llamabais?»', efecto: 'Obstáculo lento: esquivar o frenar; si le pisas, se pega al neumático y deja rastro.' },
  { id: 'lluvia_humo', texto: 'Cae una lluvia de humo fino. Todo se vuelve borroso y huele a pino sin que nadie lo haya pedido.', efecto: 'Visibilidad reducida unos segundos.' },
  { id: 'obras', texto: 'Desvío por obras. Un cartel dice «Perdonen las molestias». Nadie perdona.', efecto: 'Carriles cambiados; conos en fila.' },
  { id: 'radio', texto: 'La radio se queda pillada en una canción que no es de ninguno. Todos la cantan igual.', efecto: 'Ritmo constante; bonus al acompañante que más canta.' },
  { id: 'eusebio_escapa', texto: 'La guantera se abre sola. Don Eusebio trota por el salpicadero con la barriga al aire.', efecto: 'Hay que frenar suave para que no caiga; se recupera con un toque.' },
  { id: 'sirena', texto: 'Una sirena a lo lejos. Todos se tensan. No es nada: es una ambulancia de pasteles.', efecto: 'Falsa alarma: sube un poco la sospecha si el jugador reacciona mal.' },
  { id: 'sofa', texto: 'Un sofá en mitad de la vía. Intacto. Con su cojín. Alguien lo ha puesto ahí con cariño.', efecto: 'Obstáculo grande; saltar de carril o recogerlo para el maletero (alimenta la respuesta del control).' },
  { id: 'cartel', texto: 'Un cartel dice «Siguientes 40 km sin cartel». Y es verdad.', efecto: 'Tramo largo y tranquilo: charlas entre los pasajeros.' },
];

// Fin del archivo. Exportación opcional para entornos con módulos; en el navegador los const quedan globales.
if (typeof module !== 'undefined') {
  module.exports = { CAPITULO_FURGO, FRASES_FURGO, FRASES_ELEGIR_FURGO, PREGUNTAS_CONTROL, AGENTE_CONTROL, ESCAPES_CONTROL, DON_EUSEBIO, ENCARGOS_FURGO, EVENTOS_FURGO };
}

// ---------- Entrega 1 (31/10/2026): el juego tiene aún los 8 capítulos de siempre ----------
// Los `desde` del guion usan la numeración nueva (19 capítulos). Mientras no lleguen, se pasan al índice
// actual de CAPITULOS y se quitan los encargos cuyo cliente o momento aún no existe (Niebla, la cita de
// después de la declaración). Cada encargo lleva como `frase` su primera línea al pedirlo.
(function adaptarEntrega1() {
  if (typeof ENCARGOS_FURGO === 'undefined') return;
  const desde = { cajas_blancaso: 1, blancaso_casa: 2, invitacion_puky: 3, mar_perico: 5, discos_pompa: 6 };
  for (let i = ENCARGOS_FURGO.length - 1; i >= 0; i--) {
    const e = ENCARGOS_FURGO[i];
    if (!(e.id in desde)) { ENCARGOS_FURGO.splice(i, 1); continue; }
    e.desde = desde[e.id];
    if (!e.frase && e.pedir && e.pedir.length) e.frase = e.pedir[0][1];
  }
})();

// Capítulos nuevos de los actos III y IV (guiones/cap-furgo.js, montado el 17/11/2026): 11 · La furgo. Aquí irán después
// feria, mirón y pesado. Formato del motor de tareas (historia.js):
// { id, titulo, arte, intro, tareas: [{ id, texto, tipo, minijuego?, antes, despues, pista }], giroTras, giro, cierre }.
// El texto del guion vive UNA sola vez, en contenido/furgo.js (CAPITULO_FURGO; ese archivo se carga antes que este y
// además trae las frases del viaje, las preguntas del control y los encargos). Aquí solo se pasa al formato del motor
// y se montan los campos especiales: lo que dice cada acompañante según quién vaya a bordo (ESTADO.furgoAcompanantes,
// que fija la escena Furgo al elegirlos). Son getters: se leen en el momento de contar la escena, no al cargar.
// Chats, ambientes y memes del capítulo: contenido/capitulos.js (`desde: 'furgo'`). PROPUESTA de guion.

const FURGO_G = CAPITULO_FURGO;
const FURGO_ELEGIBLES = ['palicaso', 'lasslow', 'perico', 'pompa', 'blancaso', 'puky'];

// Quién va a bordo (los elegidos en la furgo; Cotine va siempre y no cuenta aquí) y quién llega por su cuenta.
function furgoABordo() { return (typeof ESTADO !== 'undefined' && Array.isArray(ESTADO.furgoAcompanantes) ? ESTADO.furgoAcompanantes : []).filter(id => FURGO_ELEGIBLES.includes(id)); }
// Una frase por cada acompañante que va a bordo (como mucho 3, en el orden en que los eligió).
function furgoFrasesSi(tabla) { return furgoABordo().slice(0, 3).map(id => tabla[id]).filter(Boolean); }
// Los que no caben llegan solos a la feria (como mucho 3 escenas, que el cierre no se alargue).
function furgoLlegaSolo() { const van = furgoABordo(); return FURGO_ELEGIBLES.filter(id => !van.includes(id)).slice(0, 3).map(id => FURGO_G.llegaSolo[id]).filter(Boolean); }

const CAPITULOS_ACTOS34 = {
  furgo: {
    id: 'furgo',
    titulo: FURGO_G.titulo,
    arte: 'cap-furgo',
    premio: 110,
    intro: FURGO_G.intro,
    giroTras: FURGO_G.giroTras,
    tareas: [
      {
        // Tres piezas sueltas por el barrio: las llaves (en la puerta, con Perico), la batería (tienda) y el ambientador (Unaké).
        ...FURGO_G.tareas[0],
        recoger: [{ tipo: 'llaves', salas: ['fuera'] }, { tipo: 'bateria', salas: ['tienda'] }, { tipo: 'ambientador', salas: ['dentro'] }],
      },
      {
        // Se juega desde la propia furgo (aparcada fuera). Cuenta jugarlo, ganes o no: mal conducido también llega.
        ...FURGO_G.tareas[1],
        con: ['furgo'],
        cumple: 'jugada_Furgo',
      },
      {
        ...FURGO_G.tareas[2],
        con: ['furgo'],
        // Regla del criterio: el control NUNCA bloquea la historia. Si te pillan, multa y se sigue.
        cumple: 'jugada_Control',
        multa: 20,
        get antes() { return [...FURGO_G.tareas[2].antes, ...furgoFrasesSi(FURGO_G.controlSi)]; },
        get despues() {
          const D = FURGO_G.tareas[2].despues;
          const gana = typeof desdeTarea === 'function' && desdeTarea('gana_Control') >= 1;
          // Pillados: el agente baja a todos, multa, y se sube igual (conserva el momento de Don Eusebio y el último chiste de Cotine).
          return gana ? D : [...FURGO_G.tareas[2].fallo, D[2], D[3], D[D.length - 1]];
        },
      },
      {
        // La última tirada, siguiendo las luces de colores: se vuelve a conducir.
        ...FURGO_G.tareas[3],
        tipo: 'minijuego',
        minijuego: 'Furgo',
        con: ['furgo'],
        cumple: 'jugada_Furgo',
        get despues() {
          const D = FURGO_G.tareas[3].despues;
          return [D[0], ...furgoFrasesSi(FURGO_G.llegadaSi), ...D.slice(1)];
        },
      },
    ],
    get giro() { return [...FURGO_G.giro, ...furgoFrasesSi(FURGO_G.giroSi)]; },
    // Los que no han cabido llegan por su cuenta: así el capítulo siguiente los encuentra a todos en la feria.
    get cierre() { return [...FURGO_G.cierre.slice(0, 5), ...furgoLlegaSolo(), ...FURGO_G.cierre.slice(5)]; }, // las llegadas, tras el momento de Cotine (no lo cortan)
  },

  // 11 · Algodón de feria y 12 · La señal amarilla (guiones/actos-3-4.js, montados el 17/11/2026). Son la misma noche, pero van
  // como DOS capítulos seguidos (ritmo del criterio: 2-3 tareas, giro, 1-2 tareas, cierre). Se juegan en los sitios de la feria
  // (lugares.js: casetas, lona; el tiro al pato queda ahí para siempre). El feriante no tiene hablante: lo cuenta el narrador.
  feria: {
    id: 'feria',
    titulo: 'Algodón de feria',
    arte: 'cap-feria',
    premio: 115,
    intro: [
      ['narrador', 'La furgo ha aparcado al borde del descampado, al otro lado de la circunvalación. Esta noche hay feria de humo. De día, solo quedarán los restos.'],
      ['palicaso', '¡Escucha, escucha! Feria. Luces, ruido y todo a un monchi. ¡Invita la casa!'],
      ['blancaso', 'La casa no llega ni al alquiler.'],
      ['lasslow', 'Caballeros, una feria es el único sitio donde un señor puede reírse a gusto. JA… perdón.'],
      ['perico', 'Pin pin. ¿Hay churros? ¿Hay churros?'],
      ['vuper', 'Vale, vale… ¿Bajas, Cotine?'],
      ['cotine', 'Yo no bajo.'],
      ['palicaso', '¿Cómo que no? ¡Si hay de todo!'],
      ['cotine', 'De todo. Sí. Por eso.'],
      ['narrador', 'Cotine acaba de decir que no a un sitio lleno de comida. Aquí pasa algo.'],
    ],
    giroTras: 3,
    tareas: [
      {
        id: 'feria_convencer',
        texto: 'Convence a Cotine para que baje a la feria',
        tipo: 'charla',
        con: ['cotine'],
        antes: [
          ['narrador', 'Cotine mira las luces de la feria sin moverse. Nada en las manos. Eso no pasa nunca.'],
          ['vuper', 'No hace falta que comas nada. Solo ven.'],
          ['cotine', '¿Y qué hago yo en una feria sin comer?'],
        ],
        despues: [
          ['vuper', 'Mirar. Montarte en la noria. Reírte de Lasslow.'],
          ['cotine', '…Me río de Lasslow sin esfuerzo.'],
          ['cotine', 'Voy. Pero no me llevéis a los algodones.'],
          ['vuper', '(Una repostera que no quiere ver el algodón.)'],
        ],
        pista: '«Estoy mirando las luces. Sin comer. ¿Ves qué raro? Háblame.» (Cotine)',
      },
      {
        // Las tres casetas son UN minijuego (Casetas): cuenta ganarlo desde donde se juegue (el sitio de la feria, para siempre).
        id: 'feria_casetas',
        texto: 'Gana las tres casetas de la feria',
        tipo: 'minijuego',
        minijuego: 'Casetas',
        con: ['casetas'],
        antes: [
          ['palicaso', '¡Escucha, escucha! Tres casetas, tres fichas. Tiro al pato, noria y martillo.'],
          ['lasslow', 'El martillo, ¿es para un señor?'],
          ['palicaso', 'Nadie es un señor con un martillo en la mano.'],
        ],
        despues: [
          ['narrador', 'Tres fichas. La del martillo hizo sonar la campana tan fuerte que se soltó una lona al fondo de la feria.'],
          ['perico', 'Pin pin. Una caseta cerrada. Una caseta cerrada.'],
          ['cotine', '…Ya lo sé. Sé cuál es.'],
        ],
        pista: '«¡Escucha! Si te atascas, empieza por la noria, que es la más tranquila. Las fichas cuentan juegues donde juegues.»',
      },
      {
        id: 'feria_caseta_antigua',
        texto: 'Junta 3 trozos del cartel en la feria',
        tipo: 'recoger',
        recoger: [{ tipo: 'cartel', salas: ['feria'], n: 3 }],
        pistaDe: 'cotine',
        antes: [
          ['narrador', 'Al fondo del descampado, donde la luz no llega, hay una caseta con la lona echada. Alrededor, trozos de un cartel roto.'],
          ['cotine', 'No hace falta que lo busques.'],
          ['vuper', 'Ya, pero me apetece.'],
        ],
        despues: [
          ['narrador', 'AL. GO. DÓN. Un expositor vacío bajo la lona. Un solo cono sin recoger.'],
          ['cotine', 'Es aquí.'],
          ['vuper', '¿Qué es aquí?'],
          ['cotine', 'Mi caseta. Éramos diez en el expositor. Nueve se los llevaron.'],
          ['vuper', '¿Y el décimo?'],
          ['cotine', 'Yo. Cerraron las luces y me dejaron en el palo, sola.'],
          ['cotine', 'Por la mañana iban a tirarme. Así que empecé a comerme yo. Antes que nadie.'],
          ['vuper', 'Cotine…'],
          ['cotine', 'Si me como yo, no me tiran. Y si no comparto, nadie me deja a medias.'],
          ['narrador', 'Nadie la quiso entera. Y desde esa noche, ella se come antes de que la dejen.'],
        ],
        pista: '«Los trozos del cartel están por donde no llega la luz. Cuando los juntes, me dices si te sirve de algo. Yo no miro.»',
      },
      {
        id: 'feria_palo',
        texto: 'Devuélvele el palo a Cotine',
        tipo: 'minijuego',
        minijuego: 'Palo',
        con: ['cotine'],
        pistaDe: 'perico',
        antes: [
          ['narrador', 'Perico se ha posado en lo alto del expositor, con el palo bajo la pata.'],
          ['perico', 'Pin pin. Con vistas. Con vistas.'],
          ['lasslow', 'JA… caballeros, qué espectáculo.'],
        ],
        despues: [
          ['narrador', 'Perico mira lo que tiene bajo la pata. Abre los dos ojos de golpe.'],
          ['perico', 'Era… su palo.'],
          ['narrador', 'Se lo lleva volando. Cotine se clava el palo, se da un mordisco a sí misma y baja de golpe. Ahora pesa.'],
        ],
        pista: '«Pin pin. Mi percha es su palo. Lo siento. Lo siento. Alcánzame y te lo doy.»',
      },
    ],
    giro: [
      ['palicaso', '¡Escucha, escucha! ¡Esto hay que celebrarlo! ¡Ronda! ¡Invita la casa!'],
      ['blancaso', '¿Qué casa? Lo apunto como deuda.'],
      ['narrador', 'Cotine da una calada. Y otra, sin pensar. Se hincha. Busca el palo con la mano. No está.'],
      ['perico', 'Pin pin. ¡Percha nueva!'],
      ['cotine', '¿Mi palo?'],
      ['narrador', 'Despega entre las bombillas de la feria. La noria la esquiva por un pelo.'],
      ['vuper', 'Vale, vale… ¡el palo!'],
    ],
    cierre: [
      ['narrador', 'Al fondo, un feriante de humo recoge las luces de su caseta. Es el único que queda. Esta noche no le han comprado nada.'],
      ['cotine', '…'],
      ['narrador', 'Cotine se saca el palo. Sale pringado de algodón, con hilos de almíbar que se estiran y gotean. Se lo ofrece.'],
      ['cotine', 'Entera no puedo. Esto sí.'],
      ['narrador', 'Al feriante le tiembla el bigote de humo. Prueba. A Cotine se le limpian los ojos.'],
      ['narrador', 'Es la primera vez que da un trozo de sí misma a alguien. El feriante tose. Es su manera de dar las gracias.'],
      ['vuper', 'Cotine…'],
      ['cotine', 'No digas nada. Se me va a pasar.'],
      ['cotine', 'Anda, trae eso.'],
      ['narrador', 'Se lleva el palo a la boca y se come el resto de un bocado. El feriante se queda mirando su mechoncito de algodón.'],
      ['cotine', '¿Qué? Tenía hambre.'],
    ],
  },

  // 12 · La señal amarilla: el origen de Monchiman. La misma noche de la feria, vista desde Vuper.
  // CAMBIOS del guion: (1) el giro va tras la tercera tarea (la máscara es el final del recuerdo; el giro devuelve al presente
  // y deja una sola tarea, la de las pistas); (2) «senal_fiesta» no se juega: es una escena de cómic (flashback sin minijuego
  // se da por cumplido tras su `antes`), en el mundo normal y en una casa; (3) la máscara se compra (recado) en la tienda y se
  // monta en el cuarto en su `despues`; (4) en el cierre, la deuda de Cotine va la última (el chiste de su estado).
  senal: {
    id: 'senal',
    titulo: 'La señal amarilla',
    arte: 'cap-senal',
    premio: 120,
    intro: [
      ['narrador', 'Segunda noche de feria. Hay un rincón que Vuper no puede dejar de mirar: un banco, tres farolas, una caseta cerrada.'],
      ['vuper', 'Esto… ya lo he visto.'],
      ['palicaso', '¡Escucha, escucha! Pues claro. Ayer.'],
      ['vuper', 'No. Antes.'],
      ['perico', 'Pin pin. Aquí fue. ¿A que aquí fue?'],
      ['blancaso', '¿Aquí fue, el qué?'],
      ['perico', 'Nada. Pipas.'],
      ['vuper', '(Mi primera fiesta. Mi primer amarillo.)'],
      ['narrador', 'Hay recuerdos que no se miran: se juegan. Vamos a volver.'],
    ],
    giroTras: 3,
    tareas: [
      {
        id: 'senal_fiesta',
        texto: 'Revive la primera fiesta de Vuper',
        tipo: 'flashback',
        mundoEscena: 'normal',
        fondoEscena: 'recuerdo',
        antes: [
          ['titulo', 'Hace mucho tiempo · Una fiesta'],
          ['narrador', 'Un altavoz, luces de colores y cien personas con prisa por divertirse. Vuper llegó con la mochila de reparto todavía puesta.'],
          ['vuper', 'Hola… ¿vale si me quedo un rato?'],
          ['narrador', 'Nadie contesta. Alguien le pasa la mano por delante para coger patatas.'],
        ],
        despues: [
          ['vuper', '(Hola. Hola. ¿Hola?)'],
          ['narrador', 'Una mano le tiende una calada, sin mirarle. «Toma, que estás muy callado».'],
          ['narrador', 'Vuper da una calada. Luego otra, por no quedarse mirando. La música se alarga. El mundo se vuelve humo.'],
        ],
        pista: '«Vale, vale… es un recuerdo. Déjalo correr.»',
      },
      {
        // En la lona de la feria (el sitio del minijuego, también de día). Cuenta ganarlo desde donde se juegue.
        id: 'senal_recuerdo',
        texto: 'Llega a la lona, mareado',
        tipo: 'minijuego',
        minijuego: 'Recuerdo',
        con: ['lona'],
        mundoEscena: 'humo',
        antes: [
          ['titulo', '…y el descampado · Se enciende como una feria'],
          ['narrador', 'La feria está cerrando. Las luces se apagan de una en una. Y entonces, de golpe: amarillo.'],
          ['vuper', 'Vale… vale… vale…'],
          ['narrador', 'Todo se ve del color de una yema. El suelo no está donde lo dejaste.'],
        ],
        despues: [
          ['narrador', 'Vuper se deja caer contra una lona cerrada, al fondo, lejos de la gente. Nadie le ha seguido.'],
          ['narrador', 'Entre los cartones, algo rosa y suave. Huele a azúcar.'],
          ['vuper', '(Dulce…)'],
          ['narrador', 'Lo prueba. Poco a poco, el suelo vuelve a ser suelo.'],
          ['narrador', 'Al fondo, una sombra rosa con un palo se aleja a saltitos, sin darse la vuelta.'],
          ['vuper', '(Gracias, quien seas.)'],
          ['vuper', '(A nadie más le va a pasar solo. A nadie.)'],
        ],
        pista: '«Vale, vale… sigue hacia la luz de la salida. No mires la pantalla: mira el suelo. Despacio, que es un recuerdo.»',
      },
      {
        id: 'senal_mascara',
        texto: 'Recuerda: compra tela roja y una M en la tienda, como aquel día',
        tipo: 'recado',
        objeto: 'mascara',
        mundoEscena: 'normal',
        fondoEscena: 'cuarto',
        antes: [
          ['narrador', 'Al día siguiente, de día, el descampado era solo cartones. Vuper volvió con una idea.'],
          ['vuper', '(Tela roja de una lona. Y una letra amarilla de un cartel.)'],
          ['vuper', '(Una M. De «monchis». Qué casualidad.)'],
        ],
        despues: [
          ['narrador', 'En el taller de su cuarto, entre matraces y esferas de cristal, Vuper pega la M sobre un antifaz rojo.'],
          ['narrador', 'Se lo pone. Se mira al espejo. El espejo no le reconoce.'],
          ['vuper', '¡Que no cunda el amarillo!'],
          ['narrador', 'La voz se le rompe a media frase. Pero la M de neón de la pared parpadea una vez, como diciendo «vale».'],
        ],
        pista: '«Vale, vale… tela roja y una letra M. En la tienda de 24 h tendrán de todo.»',
      },
      {
        // Tres pistas sueltas por la feria (sprites prestados). Se recogen en el orden que quieras.
        id: 'senal_quien',
        texto: 'Busca las pistas del dulce en la feria',
        tipo: 'recoger',
        recoger: [{ tipo: 'mota', salas: ['feria'] }, { tipo: 'hilo', salas: ['feria'] }, { tipo: 'huella', salas: ['feria'] }],
        pistaDe: 'cotine',
        antes: [
          ['narrador', 'De nuevo ante la caseta. Si alguien dejó algo aquella noche, el polvo lo recuerda.'],
          ['vuper', 'Una mota rosa, un agujerito en el suelo, un hilo de almíbar seco.'],
        ],
        despues: [
          ['narrador', 'Una mota rosa. Un hilo de almíbar seco. Y una hilera de agujeritos redondos, a saltitos, como de un palo clavado una y otra vez.'],
          ['cotine', '¿Qué miráis? Huele a algodón.'],
          ['narrador', 'Cotine llega a saltitos. Detrás de ella, el suelo se queda picado de agujeritos redondos.'],
          ['vuper', '(Los mismos.)'],
        ],
        pista: '«Una mota rosa, un hilo de almíbar seco y unos agujeritos en el suelo. Mira con calma, que no huyen. Yo no miro.»',
      },
    ],
    giro: [
      ['narrador', 'El mundo humo vuelve de golpe, con el neón de la feria.'],
      ['perico', 'Pin pin. ¿Estás bien? ¿Estás bien?'],
      ['vuper', 'Sí… sí. Me había ido.'],
      ['narrador', 'En el suelo, delante de la caseta cerrada, un hilo rosa seco. Igual que el de entonces.'],
      ['vuper', '(Alguien me salvó aquí. Y nunca supe quién.)'],
    ],
    // El corazón de todo el acto: Cotine y Vuper descubren que el trozo que salvó a Vuper era de Cotine.
    cierre: [
      ['vuper', 'Cotine. Hace mucho, alguien me dio algo dulce en este mismo sitio. Creo que fuiste tú.'],
      ['cotine', '¿Yo? ¿En una fiesta? ¿Qué día?'],
      ['vuper', 'La noche en que cerraron la feria. Hace mucho. Se te cayó un trozo.'],
      ['cotine', '…La noche que cerraron.'],
      ['cotine', 'La primera vez que me saqué el palo. Se me cayó un trozo y no lo encontré. Me pasé la noche buscándolo.'],
      ['vuper', 'Lo tenía yo. Me salvó.'],
      ['narrador', 'A Cotine se le limpian los ojos. Los dos miran el mismo suelo.'],
      ['cotine', 'Entonces alguien se quedó con un trozo mío. Y le sirvió.'],
      ['vuper', 'Y por ese trozo hoy estoy aquí. Gracias, Cotine.'],
      ['cotine', 'De nada.'],
      ['perico', 'Pin pin.'],
      ['cotine', 'Pues me debes un algodón. Con intereses.'],
    ],
  },

  // 13 · Te están mirando (fusión con «¿Quién tiene mi mechero?», decisión del director 17/11/2026: guiones/cap-miron-fusion.md).
  // El Mirón y Perico tienen la misma herida: dicen la verdad y nadie les cree. Empieza con El Mirón acusando a Monchiman
  // (y acierta) y acaba con Perico descubierto como el «ladrón» que guardaba los mecheros. «Breathe and float» queda como
  // interrupción aparte («Lasslow se declara»), igual que `miron_separar` y `miron_neon`. Cuentan, juegues donde juegues:
  // Mirando (el banco de la plaza) y Cámaras (el monitor del reservado). Las pruebas falsas se compran (recado) y los
  // mecheros se recogen tras el cartel de la percha (junto a la mirilla). PROPUESTA de guion.
  miron: {
    id: 'miron',
    titulo: 'Te están mirando',
    arte: 'cap-te-miran',
    premio: 125,
    intro: [
      ['titulo', 'Tres noches después de la feria…'],
      ['narrador', 'Alguien ha pegado carteles en las farolas del barrio. Fotocopias torcidas, hechas con prisa.'],
      ['titulo', '«MONCHIMAN VIVE CERCA. ABRID LOS OJOS.»'],
      ['blancaso', 'Esto no lo ha pegado nadie con la cabeza tranquila.'],
      ['narrador', 'En la esquina de Unaké hay una nube oscura llena de ojos. No parpadean a la vez.'],
      ['miron', 'Me están mirando.'],
      ['lasslow', 'JA… perdón. Qué comentario tan agudo, caballero.'],
      ['miron', '¿Os reís de mí?'],
      ['palicaso', '¡Escucha, escucha! Es el Mirón. Vive en el banco de la plaza. Desde allí se ven todas las puertas.'],
      ['miron', 'Todas. Y la vuestra no me gusta.'],
      ['vuper', '(Vale, vale… esto no pinta bien.)'],
    ],
    giroTras: 2,
    tareas: [
      {
        // Se juega en el banco de la plaza (para siempre). Cuenta ganarlo desde donde sea.
        id: 'miron_cruzar',
        texto: 'Llega a tu cuarto sin que te vean los ojos',
        tipo: 'minijuego',
        minijuego: 'Mirando',
        con: ['banco'],
        pistaDe: 'perico',
        antes: [
          ['vuper', '(En mi cuarto está la máscara. Y el taller. Y una M de neón de dos metros.)'],
          ['perico', 'Pin pin. Le he oído decir que hoy registra casas. Hoy registra casas.'],
          ['vuper', '(Hay que llegar antes que él.)'],
        ],
        despues: [
          ['narrador', 'Llegas. Cierras. Los ojos se quedan fuera, parpadeando a destiempo.'],
          ['vuper', '(Un ojo en la ventana. Uno solo. Y se aleja.)'],
          ['narrador', 'Escondes la máscara bajo la cama y apagas la M. Por si acaso.'],
        ],
        pista: '«Pin pin. Los ojos parpadean a destiempo. Cuenta los parpadeos y cruza cuando se cierren. El primero es el más tonto. Pin pin.»',
      },
      {
        // Un recado: huella, antifaz de cartón y recibo, todo en la tienda de 24 h.
        id: 'miron_pruebas',
        texto: 'Compra pruebas falsas en la tienda de 24 h',
        tipo: 'recado',
        objeto: 'pruebas',
        pistaDe: 'perico',
        antes: [
          ['perico', 'Pin pin. Este dice la verdad. Y por eso nadie le cree.'],
          ['vuper', 'Entonces le doy algo que seguir. Algo que no sea yo.'],
          ['perico', 'Pin pin. Una huella, un antifaz y un recibo.'],
        ],
        despues: [
          ['narrador', 'El Mirón sigue la huella. La huella lleva a Palicaso. Y Palicaso se lo explica todo, con detalle, durante cuarenta minutos.'],
          ['miron', '…Anotado. Creo.'],
          ['narrador', 'Tres de sus ojos se han cerrado por agotamiento. Los demás siguen mirando a Vuper.'],
        ],
        pista: '«Pin pin. Una huella, un antifaz de cartón y un recibo de pipas. En la tienda. Para que mire a otro lado. Pin pin.»',
      },
      {
        // Los tres de la barra. Las frases de la Pompa y de Niebla (de «mechero_arriba») van fundidas en el `despues`.
        id: 'mechero_barra',
        texto: 'Pregunta en la barra por los mecheros',
        tipo: 'charla',
        con: ['palicaso', 'cotine', 'lasslow'],
        pistaDe: 'palicaso',
        antes: [
          ['vuper', 'Empiezo por los de la barra. Palicaso, ¿dónde estabas?'],
          ['palicaso', '¡Escucha! Yo estaba aquí. Bueno, antes estuve en el almacén, y allí una vez conocí a uno que…'],
        ],
        despues: [
          ['palicaso', '…y la cosa es que pasó algo brillante volando, pero esa es otra historia.'],
          ['vuper', 'Espera. ¿Algo brillante volando?'],
          ['palicaso', '¡Y esta no te la he contado!'],
          ['cotine', 'Yo solo me como lo que se come. Un mechero no se come. Lo probé una vez.'],
          ['lasslow', '¿Sospechoso, yo? JAJAJA. Perdón. Una cosquilla en la espalda. Con plumas.'],
          ['niebla', 'Había… algo. Seguro. ¿Qué buscábamos?'],
          ['vuper', 'Mecheros, Niebla.'],
          ['niebla', 'Ah. Pues tengo uno aquí. ¿Es vuestro?'],
          ['pompa', '…Eran de colores.'],
          ['vuper', '(Eso habría ayudado antes.)'],
        ],
        pista: '«¡Escucha! Empieza por mí, que soy el que más habla. Y luego Cotine y Lasslow, que están a mi lado. Esto va a ser largo.»',
      },
      {
        // Las cámaras de El Mirón: el monitor del reservado (de noche). Cuenta ganar Cámaras desde cualquier sitio.
        id: 'miron_camaras',
        texto: 'Mira las cámaras del monitor (de noche)',
        tipo: 'minijuego',
        minijuego: 'Camaras',
        con: ['monitor', 'blancaso'], // sin reservado (ampliación opcional) se juega con Blancaso: nada de requisitos ocultos
        pistaDe: 'blancaso',
        antes: [
          ['miron', 'Doce cámaras. Cuarenta horas de grabación. Míralas todas.'],
          ['vuper', '(Vale, vale… las que se pueda.)'],
        ],
        despues: [
          ['narrador', 'En la cámara de la puerta, a las cuatro y diez: una sombra con plumas, un brillo de colores y la percha de la mirilla.'],
          ['vuper', '(Todo lleva al mismo sitio.)'],
        ],
        pista: '«Si no tienes el monitor del reservado, toma el mío. Lo uso para vigilar la hucha. No toques la hucha.»',
      },
      {
        // Tres mecheros tras el cartel de la percha de Perico, junto a la mirilla. Antes de las frases de Perico va el momento
        // de la mochila (era el giro del guion 15): el secreto de Vuper se tambalea justo antes de destapar a Perico.
        id: 'mechero_percha',
        texto: 'Recoge los mecheros tras el cartel de Perico',
        tipo: 'recoger',
        recoger: [{ tipo: 'mechero', salas: ['fuera'], n: 3 }],
        pistaDe: 'perico',
        antes: [
          ['miron', 'Y tú, rider. ¿Dónde estabas? ¿Qué llevas en la mochila?'],
          ['vuper', 'Eh… nada. Cosas de reparto.'],
          ['narrador', 'El Mirón abre la mochila con tres ojos a la vez. Cae un mechero con una M amarilla y el sello de VOPPË.'],
          ['miron', '¡Lo sabía!'],
          ['palicaso', '¡Escucha, escucha! ¡Es de marca! Tiene logo y todo. Un ladrón no se lo puede permitir.'],
          ['vuper', 'Es de un amigo. Se lo guardo.'],
          ['miron', 'Eso es justo lo que diría Monchiman.'],
          ['blancaso', 'Lo que nos faltaba. Lo apunto.'],
          ['perico', 'Pin pin. No miréis. No miréis.'],
          ['vuper', 'Tu percha, Perico.'],
          ['narrador', 'Detrás del cartel de «¿CONTRASEÑA?», una hilera de brillos de colores.'],
        ],
        despues: [
          ['narrador', 'Rojo, naranja, amarillo, verde, azul. Veintitrés mecheros, colgados de la percha como un arcoíris, ordenados por colores.'],
          ['perico', 'Pin pin. Guardados. Guardados.'],
        ],
        pista: '«Pin pin. No es por aquí. Es por allá. No, aquí. ¿Has mirado detrás del cartel de la puerta? Yo no.»',
      },
    ],
    // El giro del 13 (el casero ha leído los carteles) y, sin corte, la intro del 15 hasta «Nadie se va hasta que aparezcan».
    giro: [
      ['casero', 'Buenas. He leído los carteles. «Monchiman vive cerca».'],
      ['blancaso', 'Es un rumor. De uno que vive en un banco.'],
      ['casero', 'No me lo creo. Pero la gente lo lee. La gente que lee, viene. La gente que viene, ensucia.'],
      ['casero', 'Así que esto: o mil monchis la noche de la fiesta, o cierro. Ni uno menos.'],
      ['blancaso', 'Otra vez no…'],
      ['pompa', '…Y se ha llevado mis discos. De fianza. Lo he visto hace un rato.'],
      ['miron', 'Yo se lo dije. A todos. Nadie me ha creído.'],
      ['perico', 'Pin pin. Este dice la verdad.'],
      ['palicaso', '¡Escucha, periquito! Tú dices la verdad con las pipas y poco más.'],
      ['perico', 'Pin pin.'],
      ['narrador', 'Con el casero encima, Blancaso quiere dejar Unaké reluciente y encender el neón.'],
      ['blancaso', '¿Alguien tiene un mechero?'],
      ['palicaso', '¡Escucha, escucha! Claro, tengo uno en…'],
      ['narrador', 'Palicaso se palpa. Nada. Mira la barra. Nada. Se asoma por debajo. Nada.'],
      ['cotine', 'Yo también tenía uno. Estaba junto a la tarta.'],
      ['lasslow', 'El mío estaba en la pajarita. JA… perdón.'],
      ['blancaso', 'Han desaparecido los mecheros de Unaké. Todos.'],
      ['miron', 'El ladrón está dentro. Anotado.'],
      ['blancaso', 'Por primera vez, no puedo llevarle la contraria.'],
      ['narrador', 'Sin mecheros no hay noche. Nadie se va hasta que aparezcan.'],
      ['miron', 'Pondré cámaras. En todas partes. Nadie se mueve sin que yo lo vea.'],
      ['blancaso', '¿Y quién te paga las cámaras?'],
      ['miron', 'Ya están puestas. Desde el martes.'],
    ],
    // Los dos que no son creídos: Perico destapado y, sin corte, El Mirón bajo el neón.
    cierre: [
      ['blancaso', 'Perico… ¿los has robado todos?'],
      ['perico', 'Pin pin. Guardados. Guardados.'],
      ['perico', 'Los dejáis en la barra, en el baño, en el sofá. Cada noche se pierde uno. Os lo dije. Tres veces.'],
      ['blancaso', 'Es verdad. Lo dijo. Y yo pensé que eran pipas.'],
      ['blancaso', 'Ordenados por colores. Para que no se pierdan.'],
      ['narrador', 'A Perico se le limpian los ojos: los dos igual de abiertos, por primera vez.'],
      ['blancaso', 'Gracias, Perico. Eres el único que cuida de este bar.'],
      ['palicaso', '¡Escucha, periquito! Hoy invita la casa.'],
      ['perico', 'Pin pin.'],
      ['narrador', 'Perico coge el mechero de la M de la mano del Mirón y lo cuelga en el amarillo.'],
      ['perico', 'Pin pin. Este es nuevo.'],
      ['narrador', 'Blancaso enciende el neón con el mechero de Perico. BREATHE AND FLOAT. El Mirón se sienta debajo, sin que nadie se lo pida.'],
      ['narrador', 'Bajo el neón, los ojos del Mirón se van cerrando de uno en uno.'],
      ['miron', 'Respira y flota…'],
      ['miron', 'Hace años que nadie me deja mirar sin que me miren.'],
      ['narrador', 'Se le limpian los ojos. Por primera vez, todos miran en la misma dirección.'],
      ['perico', 'Pin pin. Este dice la verdad. Este dice la verdad.'],
      ['miron', '…¿El pájaro me cree?'],
      ['palicaso', '¡Escucha, escucha! Es un pájaro, Mirón. Lo suyo son las pipas.'],
      ['miron', 'Anotado.'],
      ['lasslow', 'JA… perdón.'],
      ['narrador', 'Todos los ojos del Mirón se abren a la vez.'],
      ['miron', 'Lo sabía.'],
    ],
  },

  // 17 · Monchiman, el pesado (guiones/actos-3-4.js, montado el 17/11/2026). Va entre «inspeccion» y «epica».
  // Rescate y el jefe Amarillo viven en la M del cuarto (de noche). El «un rescate de más resta» del guion es
  // solo texto y pista: la escena Rescate no tiene esa variante, así que cuenta ganarla (desde cualquier sitio).
  // Sus frases van con 'vuper' (no hay hablante «monchiman»), con la voz impostada.
  pesado: {
    id: 'pesado',
    titulo: 'Monchiman, el pesado',
    arte: 'cap-pesado',
    premio: 130,
    intro: [
      ['titulo', 'La noche antes de la fiesta'],
      ['narrador', 'Desde que salvó al casero, Monchiman se lo ha creído. Y rescata a todo el que ve.'],
      ['vuper', '¡Que no cunda el amarillo!'],
      ['palicaso', '¡Escucha, escucha! Yo no estoy amarillo, estoy contando una historia…'],
      ['vuper', '¡Toma un resucitador!'],
      ['palicaso', '…que era una historia muy buena.'],
      ['cotine', 'Me has quitado el postre. Para que no me hiciera daño.'],
      ['pompa', 'Yo no… que exploto.'],
      ['narrador', 'Monchiman le ofrece un Turbomango. La Pompa dice que no cuando él ya se ha ido.'],
      ['blancaso', 'Esto no lo apunto. No me cabe en la agenda.'],
      ['perico', '…Pin.'],
      ['narrador', 'Unaké entero se ha quedado sin rollo. Y mañana es la noche de la hucha.'],
    ],
    giroTras: 2,
    tareas: [
      {
        id: 'pesado_rescates',
        texto: 'Rescata solo a los que están amarillos: la M de tu cuarto, de noche',
        tipo: 'minijuego',
        minijuego: 'Rescate',
        con: ['m'],
        pistaDe: 'blancaso',
        antes: [
          ['blancaso', 'El amarillo se nota en la cara. Lo demás es gente pasándoselo bien.'],
          ['vuper', 'Vale, vale… ¿y si me equivoco?'],
          ['blancaso', 'Entonces, perderás a un amigo. O un postre.'],
        ],
        despues: [
          ['narrador', 'Tres rescates de verdad y ninguno de más. Unaké respira.'],
          ['cotine', 'Gracias por no quitarme el churro.'],
        ],
        pista: '«Solo los que tengan la cara amarilla, rider. Los demás están bien. Estar bien se nota. Un rescate de más no cuenta a tu favor.»',
      },
      {
        id: 'pesado_perdon',
        texto: 'Pide perdón a Palicaso, Cotine y la Pompa',
        tipo: 'charla',
        con: ['palicaso', 'cotine', 'pompa'],
        antes: [
          ['vuper', 'Vengo a pedir perdón. A los tres.'],
          ['palicaso', '¡Escucha, escucha! No pasa nada. Pero la historia del barco, ahora, entera.'],
        ],
        despues: [
          ['vuper', '¿Y tú, Pompa?'],
          ['palicaso', '¡Escucha, escucha! Perdonado. El barco, otro día.'],
          ['cotine', 'Me debes un algodón. Y un postre.'],
          ['vuper', 'Un algodón, vale. Un postre, vale.'],
          ['pompa', 'No pasa nada.'],
        ],
        pista: '«¡Escucha! Pídenos perdón a los tres: a mí, a Cotine y a la Pompa. A ella te contesta luego.»',
      },
      {
        id: 'pesado_amarillo',
        texto: 'Aguanta tu propio amarillo (de noche)',
        tipo: 'minijuego',
        minijuego: 'Amarillo',
        con: ['m'],
        pistaDe: 'palicaso',
        antes: [
          ['palicaso', '¡Escucha, escucha! ¡Monchiman está amarillo!'],
          ['cotine', 'Yo traigo dulce.'],
          ['lasslow', 'Yo, mi vigor. JA… perdón.'],
          ['pompa', 'Yo, la calma. Cuando llegue.'],
        ],
        despues: [
          ['narrador', 'El amarillo de Monchiman se deshace en el aire como una nube mala. Y se acabó.'],
        ],
        pista: '«¡Escucha! Cada fase te ayuda uno de nosotros. Aguanta, que llegan todos. Hasta Puky, que llega el último.»',
      },
    ],
    giro: [
      ['vuper', '¡Que no cunda el… amarillo!'],
      ['narrador', 'A Monchiman le tiembla la voz. De verdad, esta vez.'],
      ['narrador', 'Lleva tres noches sin sentarse y sin comer. El repartidor de monchis se ha olvidado de comer.'],
      ['narrador', 'Da una calada para aguantar el tipo. La M de la máscara se vuelve pálida.'],
      ['vuper', 'Vale… vale… vale…'],
      ['narrador', 'Sudor frío. El suelo se inclina. Todo se ve del color de una yema.'],
      ['blancaso', 'Eso lo conozco.'],
      ['narrador', 'Y delante de él, enorme, amarillo, con su propia cara: su propio amarillo.'],
    ],
    cierre: [
      ['narrador', 'Monchiman está en el suelo, con la máscara torcida. Blancaso se sienta a su lado, sin que nadie se lo pida.'],
      ['blancaso', 'Tranquilo. He estado aquí más veces que nadie.'],
      ['blancaso', 'Quédate. Aquí, en el suelo.'],
      ['narrador', 'A Monchiman se le limpian los ojos. Por una vez, el que rescata es el rescatado.'],
      ['vuper', 'Gracias… a todos.'],
      ['cotine', 'Lo del algodón ya ni lo cuento. Que lo apunte Blancaso.'],
      ['perico', 'Pin pin. Es Vuper. Es Vuper.'],
      ['palicaso', '¡Escucha, periquito! Tú sigue con las pipas.'],
      ['vuper', '(Qué bien que nadie le cree.)'],
      ['puky', '¿Me llamabais?'],
      ['blancaso', '…Casi.'],
      ['vuper', '¡Que no cunda el amarillo! ¡Estás amarillo!'],
      ['puky', 'Es mi color.'],
      ['blancaso', '…Quédate tú también. En el suelo.'],
    ],
  },
};

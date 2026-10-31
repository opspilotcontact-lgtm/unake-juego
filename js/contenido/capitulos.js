// Contenido de ambiente atado a la historia. encuentros.js lo mezcla con el suyo si existe.
// Cada pieza lleva `desde` (id del capítulo desde el que puede salir: 'una-que', 'cuota', 'blancazo', 'senor',
// 'caja', 'perico', 'inspeccion', 'epica'… ver historia.js) y, si hace falta, `hasta` (último capítulo en que sale).
//
// FORMATO
//   chats:    { desde, mensajes: [[idPersonaje, 'texto'], …] }   el grupo de la aso, en el móvil
//   ambiente: { desde, mensajes: [[idPersonaje, 'frase'], …] }   conversaciones sueltas entre ellos
//   memes:    { desde, sprite, arriba, abajo, fondo }            igual que los de MEMES (o foto:)
// idPersonaje: palicaso, blancaso, pompa, lasslow, cotine, perico, puky, vuper.
// Normas del criterio: frases cortas que se contestan, la sensación se ve y no se nombra, humor con
// contexto (si el lore aún no ha salido, el chiste lleva un `desde` que lo respete), sin lore nuevo.
// Solo se añade por el final: la memoria de vistos de la partida guarda posiciones.

const CONTENIDO_CAPITULOS = {
  chats: [
    // ---- Cap. 1 · ¿Una qué? ----
    { desde: 'una-que', mensajes: [['perico', '¿Contraseña? ¿Contraseña?'], ['palicaso', 'Estamos en el grupo, Perico'], ['perico', 'Por si acaso. Por si acaso.'], ['blancaso', 'Otra vez no…']] },
    { desde: 'una-que', mensajes: [['palicaso', '¿Qué tal estuvo anoche, Pompa?'], ['blancaso', '¿Alguien tiene la agenda?'], ['lasslow', 'Yo traigo la cena'], ['pompa', 'Bien']] },
    // ---- Cap. 2 · La cuota de la aso ----
    { desde: 'cuota', mensajes: [['palicaso', 'Idea para salvar el bar: una máquina tragaperras'], ['blancaso', 'No'], ['palicaso', 'Si ni has escuchado'], ['blancaso', 'Yo ya sabía que esto iba a pasar']] },
    { desde: 'cuota', mensajes: [['blancaso', 'La carta del casero está en el tablón'], ['pompa', '…qué buena noticia'], ['lasslow', 'Es una subida, señorita'], ['pompa', '…ah. Entonces no.']] },
    // ---- Cap. 3 · El blancazo ----
    { desde: 'blancazo', mensajes: [['blancaso', 'Hoy me siento y disfruto'], ['lasslow', 'Le acompaño en el sentimiento'], ['palicaso', '¡Escucha, escucha! Es un día histórico'], ['blancaso', 'No me lo gafes'], ['palicaso', 'Y esta no te la he contado…']] },
    // ---- Cap. 4 · Un señor ante el casero ----
    { desde: 'senor', mensajes: [['lasslow', 'Caballeros, ¿alguien ha visto mi pajarita?'], ['perico', 'Pin pin. Pin pin.'], ['lasslow', 'Eso no es una respuesta'], ['perico', 'Es la respuesta'], ['lasslow', 'JA… perdón']] },
    { desde: 'senor', mensajes: [['blancaso', 'Las facturas del casero se han volado'], ['palicaso', '¡Escucha! Una vez se me voló…'], ['blancaso', 'El casero cena el jueves'], ['palicaso', '…un sombrero. Y volvió'], ['blancaso', 'Yo ya sabía que esto iba a pasar']] },
    // ---- Cap. 5 · La caja ----
    { desde: 'caja', mensajes: [['palicaso', 'Sobre la tragaperras…'], ['blancaso', 'Precintada'], ['palicaso', 'Escucha, es que…'], ['blancaso', 'Precintada'], ['palicaso', '…'], ['pompa', 'qué silencio tan bonito']] },
    { desde: 'caja', mensajes: [['perico', 'Yo sé quién fue. Yo sé quién fue.'], ['blancaso', 'Pues dilo'], ['perico', 'Pin pin'], ['blancaso', '¿Eso es un nombre?'], ['perico', 'Pregúntame en la tienda a las cuatro']] },
    // ---- Cap. 6 · Perico lo sabe ----
    { desde: 'perico', mensajes: [['perico', 'Dato curioso: Vuper es Monchiman'], ['blancaso', 'Perico, son las 4'], ['perico', 'Pin pin'], ['palicaso', 'Periquito, ¿quieres pipas?'], ['perico', '…sí'], ['perico', 'Pero es verdad']] },
    { desde: 'perico', mensajes: [['blancaso', 'El casero vuelve esta semana'], ['cotine', '¿Trae postre?'], ['blancaso', 'Trae una inspección'], ['cotine', '¿Eso se come?']] },
    // ---- Cap. 7 · La inspección ----
    { desde: 'inspeccion', mensajes: [['pompa', 'Mis discos'], ['blancaso', 'Los tiene el casero'], ['pompa', '…'], ['pompa', 'Sin discos no pincho'], ['palicaso', '¡Escucha! Pincho yo'], ['pompa', 'Yo no, que exploto']] },
    { desde: 'inspeccion', mensajes: [['blancaso', 'Esta noche, inspección. Que no se vea nada raro'], ['lasslow', 'Me pongo la pajarita'], ['blancaso', 'Eso es raro'], ['lasslow', 'Es elegante'], ['cotine', 'Yo escondo las magdalenas']] },
    // ---- Cap. 8 · La noche épica ----
    { desde: 'epica', mensajes: [['cotine', 'La tarta de esta noche no me la como'], ['perico', 'Pin pin. Apuesto mis pipas'], ['cotine', 'Lo juro'], ['cotine', 'Un pellizquito nada más…'], ['blancaso', 'Otra vez no…']] },
  ],
  // Conversaciones sueltas entre ellos (como DIALOGOS). Las pondrán los guionistas.
  ambiente: [],
  memes: [],
};

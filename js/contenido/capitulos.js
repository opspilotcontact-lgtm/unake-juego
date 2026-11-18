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
    { desde: 'una-que', mensajes: [['perico', '¿Contraseña? ¿Contraseña?'], ['palicaso', 'Estamos en el grupo, Perico'], ['perico', 'Por si acaso. Por si acaso.'], ['blancaso', 'Lo apunto: Perico, contraseña, cuarta vez.']] },
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
    { desde: 'epica', mensajes: [['cotine', 'La tarta de esta noche no me la como'], ['perico', 'Pin pin. Apuesto mis pipas'], ['cotine', 'Lo juro'], ['cotine', 'Un pellizquito nada más…'], ['blancaso', 'Abro una página: «tartas que no llegan».']] },
    // ---- Capítulos nuevos (guiones/actos-1-2.js): pompa, mejor-amigo, nuevo, escucha ----
    { desde: "pompa", mensajes: [["palicaso", "¡¡FIESTA DE PAGO ESTA NOCHE!! Entrada: un monchi. Música: la Pompa. Alegría: la mía"], ["blancaso", "Apuntada. Aforo, 40. Riesgo, alto."], ["lasslow", "Asistiré de pajarita, caballeros."], ["pompa", "Vale."], ["palicaso", "Pompa, eso era de hace ocho mensajes."]] },
    { desde: "pompa", mensajes: [["blancaso", "Recaudación de anoche: apuntada. Resultado: pequeño pero positivo."], ["palicaso", "¿Y mi parte de las rondas?"], ["blancaso", "Las rondas las pagas tú. Yo solo cobro."], ["palicaso", "Invitaba la casa."], ["blancaso", "La casa soy yo, Palicaso."]] },
    { desde: "pompa", mensajes: [["niebla", "¿Hubo fiesta ayer? Me suena que sí. O que iba a haber."], ["palicaso", "Fue la primera, Niebla. Estuviste."], ["niebla", "¡Qué bien! Me encantan las primeras."]] },
    { desde: "pompa", mensajes: [["lasslow", "Señorita Pompa, ¿se encuentra mejor tras su incidente?"], ["blancaso", "Lasslow, el incidente fue tuyo."], ["lasslow", "Un señor nunca confirma ni desmiente."], ["pompa", "Mejor. Gracias. Por lo de antes, no por lo de ahora."]] },
    { desde: "pompa", mensajes: [["cotine", "Quien se haya comido las patatas de la Pompa: te perdono"], ["blancaso", "Te las has comido tú."], ["cotine", "Solo las probé. Tres veces. Por si estaban malas."], ["perico", "Estaban buenas. Estaban buenas."]] },
    { desde: "pompa", mensajes: [["blancaso", "Nota para mí: no dejar a Lasslow cerca de nada que flote."], ["lasslow", "Caballero, flotar es una cuestión de modales."], ["palicaso", "Y esta no te la he contado: una vez conocí a un globo…"], ["blancaso", "Lo apunto en la lista de historias. Ya va por el tomo dos."]] },
    { desde: "mejor-amigo", mensajes: [["blancaso", "¿Quién ha dejado un charco amarillo en mi silla de contable?"], ["puky", "Yo, colega. Estaba calentita."], ["blancaso", "Esa silla es mía."], ["puky", "¡Ahora también un poquito mía!"], ["blancaso", "Voy a por la fregona. Y a por la agenda."]] },
    { desde: "mejor-amigo", mensajes: [["puky", "¿Me invitáis a la fiesta del jueves?"], ["blancaso", "No hay fiesta del jueves."], ["puky", "Entonces me invitáis a la de no-jueves."], ["palicaso", "¡Invita la casa!"], ["blancaso", "La casa no invita. La casa soy yo."]] },
    { desde: "mejor-amigo", mensajes: [["palicaso", "Hay un cartel nuevo en la puerta. «PROHIBIDO PUKY». ¡Qué fuerte!"], ["puky", "Lo he puesto yo mejor, se leía torcido."], ["blancaso", "¿Lo has puesto TÚ?"], ["puky", "Con cariño. Y con mucho pegamento."]] },
    { desde: "mejor-amigo", mensajes: [["cotine", "Puky, por favor, no te sientes en la masa."], ["puky", "Estaba rica."], ["cotine", "¿Te la has comido?"], ["puky", "Tenía hambre."], ["cotine", "Esa es MI frase."]] },
    { desde: "mejor-amigo", mensajes: [["lasslow", "Caballeros, el suelo del baño tiene un brillo… JA… muy particular."], ["puky", "Es mío."], ["lasslow", "Pues enhorabuena, joven. Está precioso."], ["blancaso", "No le des alas."], ["puky", "Yo tengo manos, no alas. Pero gracias."]] },
    { desde: "mejor-amigo", mensajes: [["puky", "Me voy a dormir."], ["blancaso", "En el suelo."], ["puky", "En el suelo, vale."], ["blancaso", "Buenas noches, Puky."], ["puky", "¡Buenas noches, colega! ¡Ya has dicho mi nombre otra vez!"]] },
    { desde: "nuevo", mensajes: [["lasslow", "Buenos días, grupo. Soy Lasslow, nuevo en la ciudad. Encantado de unirme."], ["blancaso", "Llevas en este grupo tres años."], ["lasslow", "Eso no consta en mis archivos."], ["palicaso", "¡Escucha! Yo sí tengo tus archivos: JAJA, mira esta foto…"], ["lasslow", "Esa foto no es mía."]] },
    { desde: "nuevo", mensajes: [["niebla", "Hola. ¿Quién es el señor de la pajarita? Qué simpático."], ["lasslow", "Lasslow, nuevo en la ciudad."], ["niebla", "¡Bienvenido! ¿Nos conocemos?"], ["lasslow", "Aún no, señora. Pero espero que sí."], ["niebla", "¡Qué ilusión! Es mi primera vez también."]] },
    { desde: "nuevo", mensajes: [["blancaso", "Fortunato lleva dos horas sin moverse. Es muy zen. O no."], ["palicaso", "Una vez conocí a un pez que se hizo el muerto doce años."], ["blancaso", "Eso no ayuda, Palicaso."], ["palicaso", "Pero acaba bien."]] },
    { desde: "nuevo", mensajes: [["cotine", "¿Quién se ha llevado las flores del entierro?"], ["blancaso", "Te las has comido tú."], ["cotine", "Eran un adorno. Solo adorno. Un poquito de adorno."], ["lasslow", "Periquito, usted que lo ve todo, ¿quién ha sido?"], ["perico", "Pin pin. Una flor era del pez. Una flor era del pez."]] },
    { desde: "nuevo", mensajes: [["blancaso", "Fortunato está dormido otra vez. Que NADIE lo entierre."], ["lasslow", "Fue un malentendido. Pero un elogio magnífico."], ["palicaso", "Me ha encantado. Me ha encantado cuando lloraste."], ["lasslow", "Eran lágrimas de otro tipo, caballero."]] },
    { desde: "nuevo", mensajes: [["pompa", "Alguien ha dejado una pajarita colgada en mi zona. Es bonita."], ["lasslow", "No he sido yo."], ["blancaso", "Lasslow."], ["lasslow", "Se la habrá dejado un señor. Un señor discreto."], ["pompa", "Vale. Me la quedo."]] },
    { desde: "escucha", mensajes: [["palicaso", "Nota de voz (43:12)"], ["blancaso", "¿Resumen?"], ["palicaso", "Trata de un flamenco."], ["lasslow", "JA… ¿Y tiene final?"], ["palicaso", "Aún no. Te mando la segunda parte."]] },
    { desde: "escucha", mensajes: [["blancaso", "Gracias por escucharme anoche."], ["palicaso", "No me lo recuerdes, que me emociono. Y ahora quiero preguntarte cosas."], ["blancaso", "¿Qué cosas?"], ["palicaso", "Cómo estás. De verdad. Y espero."], ["blancaso", "…Estoy bien. Hoy, bien."]] },
    { desde: "escucha", mensajes: [["perico", "Ayer se calló tres minutos. Tres minutos."], ["blancaso", "Perico, no tomes nota de lo que hace mi hermano."], ["perico", "Ya la tomé. Ya la tomé. La tengo en la percha."]] },
    { desde: "escucha", mensajes: [["palicaso", "Cotine, ¿cómo estás de verdad?"], ["cotine", "¿Yo? Nadie me lo pregunta. Con hambre."], ["palicaso", "Pregunto y espero. Estoy esperando."], ["cotine", "Y yo comiendo. Es la primera conversación en paz de mi vida."]] },
    { desde: "escucha", mensajes: [["niebla", "¿Alguien sabe por qué Palicaso me ha preguntado cómo estoy?"], ["lasslow", "¿Y qué ha respondido usted, señora?"], ["niebla", "No me acuerdo. Pero me ha gustado."]] },
    { desde: "escucha", mensajes: [["blancaso", "Cuentas de la semana: justas. Pero Palicaso las ha mirado conmigo."], ["palicaso", "Y no he dicho nada."], ["blancaso", "Has dicho «vaya» cuatro veces."], ["palicaso", "Me estoy conteniendo."]] },
    // 11 · La furgo (guiones/cap-furgo.js)
    { desde: "furgo", mensajes: [["palicaso","FURGO LISTA. Llaves rescatadas de la percha. ¡Escucha, escucha: caben tres!"],["perico","Pin pin. Mi percha. Vacía. Vacía."],["blancaso","Anoto: furgo, tres años sin ITV."]] },
    { desde: "furgo", mensajes: [["blancaso","Quiero el asiento de la ventanilla. Por si acaso."],["palicaso","La ventanilla no baja."],["blancaso","Entonces atrás, con Cotine."],["cotine","Yo no he dicho que vaya."]] },
    { desde: "furgo", mensajes: [["lasslow","Caballeros, he leído que en los controles hay que mantener la compostura. JA… perdón. Ya empiezo mal."],["blancaso","Lasslow, no vengas."],["lasslow","Es la risa de los nervios."]] },
    { desde: "furgo", mensajes: [["cotine","Si pasáis por una gasolinera, avisadme."],["palicaso","Hay ocho de camino."],["cotine","…Yo no he dicho nada."]] },
    { desde: "furgo", mensajes: [["puky","¿Me llamabais? ¿Se puede ir en el parabrisas? Por si no hay sitio."],["blancaso","No."],["puky","Me he agarrado ya."]] },
    { desde: "furgo", mensajes: [["niebla","¿Dónde vais? ¿A una feria? ¿Y volvéis? ¿Y yo?"],["palicaso","Niebla, tú vienes. Ya estás en la furgo."],["niebla","¿Qué furgo?"]] },
    // 17 · Monchiman, el pesado (guiones/actos-3-4.js)
    { desde: "pesado", mensajes: [["palicaso","Monchiman me ha dado un resucitador mientras contaba lo del barco."],["blancaso","¿Qué barco?"],["palicaso","Pues ya no lo sabrás."]] },
    { desde: "pesado", mensajes: [["cotine","Me ha quitado el churro. Dice que me iba a sentar mal. Estaba buenísimo."],["perico","Pin pin. Pesado. Pesado."],["cotine","Sí."]] },
    { desde: "pesado", mensajes: [["lasslow","Caballeros, Monchiman me ha arropado en plena risa. JAJA. Perdón."],["blancaso","Es lo más amable que ha hecho."],["lasslow","No me dejaba reírme."]] },
    { desde: "pesado", mensajes: [["pompa","Alguien me ha ofrecido un Turbomango."],["palicaso","Pompa, hace dos horas."],["pompa","Ah. Pues no, gracias."]] },
    { desde: "pesado", mensajes: [["miron","Monchiman vive cerca y hoy se ha pasado de cuidadoso. Anotado."],["blancaso","Mirón, hoy estoy de acuerdo contigo."],["miron","…¿En qué?"]] },
    // 11 · Algodón de feria (guiones/actos-3-4.js). Al final del grupo: la memoria de vistos guarda posiciones.
    { desde: "feria", mensajes: [["palicaso","FERIA EN EL DESCAMPADO. Todos. Ahora. ¡Escucha, escucha: hay noria!"],["blancaso","Una noria es un ascensor con ganas de dar pena."],["lasslow","Yo me subo, con pajarita. A las alturas me da la risa, advierto. JA… perdón."]] },
    { desde: "feria", mensajes: [["palicaso","Cotine, hay caseta de churros y caseta de algodón."],["cotine","Churros sí. Lo otro, no."],["perico","Pin pin. Qué rara. Qué rara."]] },
    { desde: "feria", mensajes: [["blancaso","Presupuesto de feria: 40 monchis. Os lo digo para que me escuchéis."],["palicaso","¡Invita la casa!"],["blancaso","La casa soy yo."]] },
    { desde: "feria", mensajes: [["puky","¿Me llamabais? Estoy en la noria. Debajo. Es una noria que gotea."],["blancaso","Sal de ahí. Los de arriba se van a resbalar."],["puky","No sé salir. Me he agarrado muy bien."]] },
    { desde: "feria", mensajes: [["niebla","¿Hay feria? ¿Desde cuándo?"],["palicaso","Desde esta noche, Niebla."],["niebla","Ah. Qué bien. ¿Y tú quién eras?"]] },
    // 12 · La señal amarilla (guiones/actos-3-4.js)
    { desde: "senal", mensajes: [["palicaso","Segunda noche de feria. ¿Alguien sabe por qué Vuper está mirando una lona?"],["perico","Pin pin. Yo sé. Pero no digo. No digo."],["blancaso","Eso es lo más sospechoso que ha dicho un pájaro hoy."]] },
    { desde: "senal", mensajes: [["lasslow","Esta mañana me he subido a la noria con pajarita. Me ha dado la risa en lo más alto. Caballeros, se vio todo."],["palicaso","¡Escucha! Se vio desde Unaké."],["lasslow","Aun así, mantengo la dignidad."]] },
    { desde: "senal", mensajes: [["cotine","Alguien me ha quitado un churro de la mano. Lo juro por mi palo."],["blancaso","Te lo has comido tú."],["cotine","…Es posible. No lo descarto."]] },
    { desde: "senal", mensajes: [["puky","Hoy he visto una luz amarilla en la feria y me he emocionado. ¿Era para mí?"],["blancaso","Era una bombilla, Puky."],["puky","Qué ilusión de bombilla."]] },
    { desde: "senal", mensajes: [["niebla","¿Quién ha puesto luces en el descampado? Yo juraría que antes no había descampado."],["palicaso","Siempre ha habido descampado, Niebla."],["niebla","Ah. Qué constante."]] },
    // 13 · Te están mirando (fusión con «¿Quién tiene mi mechero?»; guiones/actos-3-4.js)
    { desde: "miron", mensajes: [["palicaso","He añadido al Mirón al grupo. ¡Bienvenido!"],["miron","Ya sé quién ha leído esto."],["blancaso","Nadie ha leído nada. Acabas de entrar."]] },
    { desde: "miron", mensajes: [["lasslow","Caballeros, me he reído y el Mirón me ha mirado con todos los ojos."],["miron","Te has reído de mí."],["lasslow","De un recuerdo, caballero. JA… perdón."]] },
    { desde: "miron", mensajes: [["blancaso","El casero ya no perdona ni un monchi. Por culpa de un cartel."],["palicaso","¡Escucha! Al menos el cartel está bien escrito."],["blancaso","Tiene tres faltas."]] },
    { desde: "miron", mensajes: [["perico","Pin pin. Monchiman vive cerca. Pin pin."],["cotine","¿Eso se come?"],["perico","No. Es verdad."]] },
    { desde: "miron", mensajes: [["niebla","¿Quién es Monchiman?"],["palicaso","El que rescata a los amarillos, Niebla."],["niebla","Ah, sí. Y yo, ¿quién era?"]] },
    { desde: "miron", mensajes: [["miron","Hay un ojo en la farola de la plaza."],["blancaso","Es una farola."],["miron","Eso es lo que quieren que penséis."]] },
    { desde: "miron", mensajes: [["blancaso","Han desaparecido todos los mecheros. Los veintitrés."],["palicaso","¡Escucha! Yo tenía uno. O dos. O…"],["blancaso","Palicaso, no empieces."]] },
    { desde: "miron", mensajes: [["miron","El ladrón está dentro. Sospecho de todos. Incluidos los que escriben."],["cotine","Yo he escrito. ¿Qué pasa?"],["miron","Anotado."]] },
    { desde: "miron", mensajes: [["lasslow","Caballeros, juro por mi pajarita que no he sido. JA… perdón."],["blancaso","¿Dónde estabas?"],["pompa","Yo estaba arriba."]] },
    { desde: "miron", mensajes: [["niebla","¿Qué buscamos?"],["blancaso","Mecheros, Niebla."],["niebla","Ah. Pues tengo uno aquí. ¿Es mío?"]] },
    { desde: "miron", mensajes: [["perico","Pin pin. Yo sé quién ha sido. Yo sé."],["palicaso","¡Escucha! Yo lo sé, periquito: tú eres el que más sabe."],["perico","Pin pin. Nadie escucha."]] },
    { desde: "miron", mensajes: [["puky","¿Me llamabais? Yo no robo. Yo me pego a las cosas. Es distinto."],["blancaso","Eres sospechoso por existir."],["puky","Qué ilusión."]] },
  ],
  // Conversaciones sueltas entre ellos (como DIALOGOS). Las pondrán los guionistas.
  ambiente: [
    { desde: "pompa", mensajes: [["palicaso", "¡Escucha! La Pompa está en un punto raro. Y yo, que entiendo de puntos…"], ["blancaso", "Tú entiendes de puntos como yo de fiestas."]] },
    { desde: "pompa", mensajes: [["lasslow", "Señorita, ¿puedo traerle algo?"], ["pompa", "…No."], ["lasslow", "Muy bien. Se lo traigo en cuanto lo piense."]] },
    { desde: "pompa", mensajes: [["cotine", "Si le llevo un algodón, se infla."], ["blancaso", "Si le llevas lo que sea, te lo comes por el camino."], ["cotine", "¿Qué? Tenía hambre."]] },
    { desde: "pompa", mensajes: [["niebla", "¿Fiesta? ¿Hoy?"], ["palicaso", "Es la primera, Niebla."], ["niebla", "Ah, qué bien. Me encantan las primeras."]] },
    { desde: "pompa", mensajes: [["perico", "Que nadie traiga alfileres. Que nadie traiga alfileres."], ["palicaso", "¿Quién va a traer alfileres?"], ["perico", "Nadie. Por eso lo digo. Nadie."]] },
    { desde: "pompa", mensajes: [["blancaso", "Cada soplido cuenta como un riesgo. Lo he calculado."], ["palicaso", "Hermano, es una fiesta."], ["blancaso", "Pues ya hay riesgo."]] },
    { desde: "mejor-amigo", mensajes: [["blancaso", "Puky, el suelo es tuyo. La barra, no."], ["puky", "¡Vale! Pero la barra está más alta. Se ve mejor."]] },
    { desde: "mejor-amigo", mensajes: [["palicaso", "¡Escucha! Puky es un tío estupendo."], ["blancaso", "Es mi mejor amigo, y por eso te digo que es un problema."]] },
    { desde: "mejor-amigo", mensajes: [["cotine", "Puky, esa es mi masa."], ["puky", "Ya no."], ["cotine", "¿Qué? …Esa frase es mía."]] },
    { desde: "mejor-amigo", mensajes: [["puky", "¿Me llamabais?"], ["lasslow", "No, joven, pero ya que está…"], ["puky", "¡Estoy!"]] },
    { desde: "mejor-amigo", mensajes: [["perico", "¿Contraseña? ¿Contraseña?"], ["puky", "Yo nunca he tenido."], ["perico", "Pasa. Pasa. Pero por debajo."]] },
    { desde: "mejor-amigo", mensajes: [["blancaso", "Hoy no ha aparecido ni una vez."], ["palicaso", "Ni una. Qué raro."], ["blancaso", "Lo echo de menos. No se lo digas."]] },
    { desde: "nuevo", mensajes: [["lasslow", "Buenas tardes. Nuevo en la ciudad."], ["palicaso", "Lasslow, que vives aquí."], ["lasslow", "De visita permanente."]] },
    { desde: "nuevo", mensajes: [["niebla", "Hola, señor de la pajarita. ¿Nos conocemos?"], ["lasslow", "Nuevo en la ciudad."], ["niebla", "¡Qué ilusión! Yo también."]] },
    { desde: "nuevo", mensajes: [["blancaso", "Fortunato lleva dos horas sin moverse."], ["palicaso", "Es muy zen. Una vez conocí a un pez que…"], ["blancaso", "Esto es otra cosa."]] },
    { desde: "nuevo", mensajes: [["cotine", "Yo hago el catering del entierro."], ["blancaso", "Es un pez, Cotine."], ["cotine", "Los peces también tienen derecho a un canapé."]] },
    { desde: "nuevo", mensajes: [["perico", "La tercera pajarita. La tercera pajarita."], ["lasslow", "Periquito, esas cosas no se cuentan."], ["perico", "¡Pin pin!"]] },
    { desde: "nuevo", mensajes: [["lasslow", "Perdone, ¿es usted de aquí?"], ["vuper", "Sí."], ["lasslow", "Yo también. Pero no se lo diga a nadie."]] },
    { desde: "escucha", mensajes: [["palicaso", "¿Y tú qué tal, de verdad?"], ["cotine", "¿Yo? …Nadie me lo pregunta. Bien. Con hambre."]] },
    { desde: "escucha", mensajes: [["blancaso", "Hoy Palicaso ha esperado a que acabara mi frase."], ["lasslow", "Una proeza, caballero."], ["blancaso", "Lo he apuntado en la agenda."]] },
    { desde: "escucha", mensajes: [["perico", "Cierra menos solo. Cierra menos solo."], ["palicaso", "Perico, estoy aquí."], ["perico", "Hablaba de ti."]] },
    { desde: "escucha", mensajes: [["niebla", "Palicaso me ha preguntado cómo estoy."], ["lasslow", "¿Y qué ha dicho usted?"], ["niebla", "No me acuerdo. Pero me ha gustado."]] },
    { desde: "escucha", mensajes: [["palicaso", "Y esta no te la he contado… ah, no. Primero cuéntame tú."], ["vuper", "¿Yo?"], ["palicaso", "Sí. Y te escucho."]] },
    { desde: "escucha", mensajes: [["blancaso", "Palicaso, ¿has visto lo de las cuentas?"], ["palicaso", "Sí. Cuéntame cómo lo llevas. …Estoy callado. Mírame."]] },
    // 11 · La furgo (guiones/cap-furgo.js)
    { desde: "furgo", mensajes: [["palicaso","¡Escucha! La furgo lleva tres años dormida y ha arrancado con más ganas que yo por las mañanas."],["blancaso","Eso no es difícil."]] },
    { desde: "furgo", mensajes: [["perico","Pin pin. Llaves. Llaves."],["vuper","Ya, Perico. Ya las tengo."]] },
    { desde: "furgo", mensajes: [["lasslow","Un señor no sale sin ambientador."],["cotine","¿Eso se come?"]] },
    { desde: "furgo", mensajes: [["pompa","Me gusta la furgo. Se mueve, pero quieta."],["puky","¿Me llamabais?"]] },
    { desde: "furgo", mensajes: [["blancaso","La ITV caducó en el año del pez."],["palicaso","Es un detalle técnico, Blancaso."]] },
    { desde: "furgo", mensajes: [["niebla","¿Por qué hay una furgo en Unaké?"],["palicaso","Siempre ha estado, Niebla."],["niebla","Ah."]] },
    // 17 · Monchiman, el pesado
    { desde: "pesado", mensajes: [["palicaso","Me ha rescatado en mitad de una frase."],["lasslow","Qué crueldad, caballero. JA…"]] },
    { desde: "pesado", mensajes: [["cotine","Un rescate no se pide."],["perico","Pin pin. Pesado. Pesado."]] },
    { desde: "pesado", mensajes: [["pompa","Hoy me han rescatado dos veces."],["blancaso","Y no estabas mal."]] },
    { desde: "pesado", mensajes: [["miron","Ese Monchiman me mira demasiado."],["palicaso","¡Escucha! Tú le miras a él."]] },
    { desde: "pesado", mensajes: [["blancaso","Los amarillos se notan."],["vuper","Vale, vale…"]] },
    // 11 · Algodón de feria y 12 · La señal amarilla (guiones/actos-3-4.js)
    { desde: "feria", mensajes: [["palicaso","¡Escucha! La noria da más vueltas que mis historias."],["lasslow","Eso es imposible, caballero. JA… perdón."]] },
    { desde: "feria", mensajes: [["blancaso","Han vendido una peluca de humo por diez monchis."],["perico","Pin pin. ¿Quién la quiere? ¿Quién la quiere?"]] },
    { desde: "feria", mensajes: [["cotine","Huele a algodón."],["vuper","¿Y eso es malo?"]] },
    { desde: "feria", mensajes: [["pompa","La noria me ve desde abajo. Yo la veo desde arriba."],["puky","¿Me llamabais?"]] },
    { desde: "feria", mensajes: [["lasslow","Dicen que el martillo no es de caballeros."],["palicaso","¡Escucha! Tú le has dado a la campana. Con el culo."]] },
    { desde: "senal", mensajes: [["vuper","Esta lona me suena."],["perico","Pin pin. A todos. A todos."]] },
    { desde: "senal", mensajes: [["cotine","Hoy no me apetece comer."],["blancaso","¿Estás bien?"]] },
    { desde: "senal", mensajes: [["palicaso","¡Escucha, escucha! Esta feria tiene historia."],["lasslow","Todas las ferias tienen historia, caballero. La mía acaba en vergüenza. JA…"]] },
    { desde: "senal", mensajes: [["pompa","Desde arriba se ve algo rosa en el suelo de la feria."],["palicaso","¿Cuándo?"]] },
    { desde: "senal", mensajes: [["blancaso","Yo ya sabía que esto iba a pasar."],["perico","Pin pin. ¿El qué? ¿El qué?"]] },
    // 13 · Te están mirando (+ la rueda de reconocimiento del 15)
    { desde: "miron", mensajes: [["miron","Hay un ojo en esa farola."],["blancaso","Es una farola."]] },
    { desde: "miron", mensajes: [["miron","Monchiman vive cerca."],["palicaso","¡Escucha! Aquí vive todo el mundo cerca."]] },
    { desde: "miron", mensajes: [["lasslow","JA…"],["miron","¿De mí?"]] },
    { desde: "miron", mensajes: [["pompa","Desde arriba, el banco de la plaza está lleno de ojos."],["miron","¿Quién ha dicho eso? ¿Quién?"]] },
    { desde: "miron", mensajes: [["cotine","¿Quieres algo de comer?"],["miron","¿Por qué? ¿Qué lleva?"]] },
    { desde: "miron", mensajes: [["miron","Eso lo dices tú."],["palicaso","¡Pero si no he dicho nada!"]] },
    { desde: "miron", mensajes: [["cotine","Yo me como lo que se come."],["blancaso","Eso lo sé."]] },
    { desde: "miron", mensajes: [["pompa","Eran de colores."],["vuper","¿Qué eran?"]] },
    { desde: "miron", mensajes: [["niebla","¿Qué estábamos buscando?"],["lasslow","Una pajarita, caballero."]] },
    { desde: "miron", mensajes: [["perico","Pin pin. Pistas. Pistas."],["palicaso","¡Escucha! Mejor dime qué hora es."]] },
    { desde: "miron", mensajes: [["niebla","Fue… ese. No, aquel."],["miron","Fui yo, ¿verdad? Siempre soy yo."],["niebla","Fue… yo."]] },
  ],
  // Memes de los capítulos nuevos (arte/memes/indice-nuevos.json). Los de los caps. 11-17 aún no entran.
  // (Los 4 memes de «La furgo» no entran aún: no hay dibujo meme-*-furgo en arte.js.)
  memes: [
    { desde: "pompa", foto: "meme-meme-c3-blancaso-invita", sprite: "blancaso-mareado", arriba: "Palicaso: ¡Invita la casa!", abajo: "La casa, mirando la cuenta:" },
    { desde: "pompa", foto: "meme-meme-c3-lasslow-pompa", sprite: "lasslow-digno", arriba: "La fiesta: nadie sopla, por favor", abajo: "Lasslow, a un palmo, riéndose con las mejillas hinchadas" },
    { desde: "pompa", foto: "meme-meme-c3-pompa-soplidos", sprite: "pompa-mira", arriba: "Todo el bar soplando velas que no hay", abajo: "La Pompa:" },
    { desde: "pompa", foto: "meme-meme-c3-pompa-techo", sprite: "pompa-mira", arriba: "Yo: esta tarde voy a estar tranquila", abajo: "Yo, tranquilísima:" },
    { desde: "mejor-amigo", foto: "meme-meme-c5-cerrojo-puky", sprite: "blancaso-mareado", arriba: "Yo, poniendo el cerrojo más grande de la tienda", abajo: "Puky, por debajo de la puerta:" },
    { desde: "mejor-amigo", foto: "meme-meme-c5-puky-amigos", sprite: "puky", arriba: "Amigos que no te dejan solo cuando todo va mal", abajo: "Amigos que te dejan una mancha en la silla" },
    { desde: "mejor-amigo", foto: "meme-meme-c5-puky-desastre", sprite: "puky", arriba: "Todo sale mal en Unaké", abajo: "Puky, a mi lado, sin que nadie lo llame:" },
    { desde: "mejor-amigo", foto: "meme-meme-c5-puky-rendija", sprite: "puky", arriba: "Blancaso: nadie sabrá la nueva contraseña", abajo: "Puky: no tengo contraseña, tengo rendija" },
    { desde: "nuevo", foto: "meme-meme-c7-blancaso-pez", sprite: "blancaso-mareado", arriba: "Compré un pez para dar seriedad al local", abajo: "El pez, a la hora:" },
    { desde: "nuevo", foto: "meme-meme-c7-lasslow-entierro", sprite: "lasslow-digno", arriba: "Un señor aguantando la risa en un entierro", abajo: "Un señor, a los tres segundos:" },
    { desde: "nuevo", foto: "meme-meme-c7-lasslow-silla", sprite: "lasslow-digno", arriba: "Lasslow: soy nuevo en la ciudad", abajo: "La ciudad: la silla de la barra todavía tiene tu nombre" },
    { desde: "escucha", foto: "meme-meme-c9-blancaso-miedo", sprite: "blancaso-mareado", arriba: "Blancaso: tengo miedo de perder el bar", abajo: "Palicaso, callado:" },
    { desde: "nuevo", foto: "meme-meme-c7-cotine-flores", sprite: "cotine", arriba: "Cotine en el catering del entierro", abajo: "Quedaban cinco flores. Quedan cuatro." },
    { desde: "escucha", foto: "meme-meme-c9-palicaso-estela", sprite: "palicaso-riendo", arriba: "Palicaso escuchando por primera vez", abajo: "(se muerde la estela)" },
    { desde: "escucha", foto: "meme-meme-c9-perico-mirilla", sprite: "perico", arriba: "Perico, en la puerta, cada noche", abajo: "Pin pin. (traducción: ya no cierra solo)" },
    { desde: "escucha", foto: "meme-meme-c9-blancaso-miedo-perder", sprite: "blancaso-mareado", arriba: "Blancaso: tengo miedo de perder el bar", abajo: "Palicaso, callado:" },
    // 17 · Monchiman, el pesado
    { desde: "pesado", foto: "meme-meme-c17-monchiman-palicaso", sprite: "palicaso-riendo", arriba: "Monchiman: ¡que no cunda el amarillo!", abajo: "Palicaso: estaba contando una historia" },
    { desde: "pesado", foto: "meme-meme-c17-monchiman-repartidor", sprite: "monchiman", arriba: "El repartidor de monchis", abajo: "Se olvidó de comer" },
    { desde: "pesado", foto: "meme-meme-c17-monchiman-puky", sprite: "puky", arriba: "Monchiman rescata a Puky", abajo: "Es su color" },
    { desde: "pesado", foto: "meme-meme-c17-blancaso-suelo", sprite: "blancaso-mareado", arriba: "Quédate. Aquí, en el suelo.", abajo: "(Otra vez, pero al revés)" },
    // 11 · Algodón de feria y 12 · La señal amarilla
    { desde: "feria", foto: "meme-meme-c11-cotine-globo", sprite: "cotine", arriba: "Me hincho, subo, veo la noria desde arriba", abajo: "Y todavía tengo hambre" },
    { desde: "feria", foto: "meme-meme-c11-invita-casa", sprite: "palicaso-riendo", arriba: "Invita la casa", abajo: "La casa: Blancaso, llorando en la caja" },
    { desde: "feria", foto: "meme-meme-c11-lasslow-martillo-feria", sprite: "lasslow-digno", arriba: "Un señor en el martillo", abajo: "La campana suena. El señor también" },
    { desde: "senal", foto: "meme-meme-c12-vuper-amarillo", sprite: "vuper-colocado", arriba: "Mi primer amarillo", abajo: "Solo, en una fiesta, con todo el mundo pasando de mí" },
    { desde: "senal", foto: "meme-meme-c12-trozo-cotine", sprite: "cotine", arriba: "Algo dulce me salvó", abajo: "Era un trozo que se le cayó a Cotine" },
    { desde: "senal", foto: "meme-meme-c12-cotine-usurera", sprite: "cotine", arriba: "Me debes un algodón", abajo: "Con intereses" },
    // 13 · Te están mirando (+ 15 · ¿Quién tiene mi mechero?)
    { desde: "miron", foto: "meme-meme-c13-mapa-barrio", sprite: "palicaso-riendo", arriba: "Monchiman vive cerca", abajo: "Aquí vive todo el mundo cerca" },
    { desde: "miron", foto: "meme-meme-c13-miron-farola-ojo", sprite: "miron", arriba: "El Mirón: me están mirando", abajo: "La farola con un ojo dibujado a rotulador" },
    { desde: "miron", foto: "meme-meme-c13-lasslow-miron", sprite: "lasslow-digno", arriba: "Lasslow se ríe", abajo: "Todos los ojos a la vez" },
    { desde: "miron", foto: "meme-meme-c13-miron-un-ojo", sprite: "miron", arriba: "Respira y flota", abajo: "Un ojo se queda abierto" },
    { desde: "miron", foto: "meme-meme-c15-miron-detective", sprite: "miron", arriba: "Desaparecen todos los mecheros", abajo: "El ladrón está dentro" },
    { desde: "miron", foto: "meme-meme-c15-perico-mecheros", sprite: "perico", arriba: "Perico: guardados, guardados", abajo: "Ordenados por colores, como en un arcoíris" },
    { desde: "miron", foto: "meme-meme-c15-niebla-reconocimiento", sprite: "niebla", arriba: "Rueda de reconocimiento", abajo: "Niebla se señala a sí misma" },
  ],
};

// Encuentros en modo libre: lo que pasa al hablar con alguien cuando no es para una misión.
// Aquí está el contenido (tonterías, memes, vídeos, titulares, el grupo de la aso, preguntas,
// recados) y el móvil que se saca el personaje para enseñártelo. La lógica de elegir uno al azar
// según la situación está en barrio.js (encuentro).
//
// La «actualidad» es la del barrio (alquiler, pipas, la comunidad): nada de gente real.

const QUIEN = {
  palicaso: { nombre: 'Palicaso', sprite: 'palicaso', color: '#ffd23f' },
  blancaso: { nombre: 'Blancaso', sprite: 'blancaso', color: '#bfe8ff' },
  pompa: { nombre: 'La Pompa', sprite: 'pompa', color: '#9fe7ff' },
  lasslow: { nombre: 'Lasslow', sprite: 'lasslow-digno', color: '#ffb38a' },
  cotine: { nombre: 'Cotine', sprite: 'cotine', color: '#ff8fc0' },
  perico: { nombre: 'Perico', sprite: 'perico', color: '#d0d4dc' },
  vuper: { nombre: 'Tú', sprite: 'vuper', color: '#7ee081' },
  puky: { nombre: 'Puky', sprite: 'puky', color: '#f5d23a' },
};

// ---------- Qué sale y cuándo: capítulo mínimo/máximo y memoria de vistos ----------
// Cada pieza de contenido puede llevar `desde` (capítulo desde el que sale) y `hasta` (último en el
// que sale). Las piezas sin campo salen siempre. Como TONTERIAS o MENSAJES son cadenas y los chats
// son listas, lo que ya existía se marca por fragmento de texto en DESDE_POR_TEXTO (así también vale
// para lo que añaden otros archivos, como rutinas.js). Una pieza nueva puede llevar su `desde` propio,
// que manda sobre la tabla. `desde` y `hasta` son ids de capítulo (historia.js): una-que, cuota, blancazo,
// senor, caja, perico, inspeccion, epica… Un número (índice viejo) aún vale, pero avisa en desarrollo.
const DESDE_POR_TEXTO = [
  // El casero y el alquiler llegan con la carta del capítulo 2 ('cuota').
  ['alquiler', 'cuota'], ['casero', 'cuota'], ['la hucha', 'cuota'], ['cuota', 'cuota'],
  // La noche de Blancaso ('blancazo'): su deseo y lo que se le tuerce.
  ['Hoy sí que disfruto', 'blancazo'], ['hoy no me da', 'blancazo'], ['sin bajón', 'blancazo'], ['Si me pongo amarillo', 'blancazo'],
  // Monchiman aparece al salvar a Blancaso ('blancazo'). Que sea Vuper no se sabe hasta «Perico lo sabe» ('perico').
  ['Monchiman', 'blancazo'], ['visto la M', 'blancazo'], ['la M del cuarto', 'blancazo'],
  // La cena con el casero ('senor'): pajarita, facturas, Puky en el grupo.
  ['cena del casero', 'senor'], ['en la cena', 'senor'], ['esmoquin', 'senor'], ['sin pajarita', 'senor'], ['nadie me pide facturas', 'senor'], ['añadido al grupo', 'senor'],
  // La caja de Palicaso ('caja'): la tragaperras y el dinero que falta.
  ['tragaperras', 'caja'],
  // El secreto de Perico ('perico').
  ['Se parecía a ti', 'perico'], ['es Vuper', 'perico'], ['Perico lo sabe todo', 'perico'], ['Avistan a Monchiman', 'perico'],
];

const _desdeCache = new Map();
function textoDe(item) {
  if (typeof item === 'string') return item;
  if (Array.isArray(item)) return item.map(l => (Array.isArray(l) ? l[1] : l)).join(' | ');
  if (!item) return '';
  return [item.arriba, item.abajo, item.pie, item.titular, item.p].filter(Boolean).join(' | ');
}
function desdeDe(item) {
  if (item && item.desde !== undefined) return capIdxDe(item.desde);
  const t = textoDe(item);
  if (!_desdeCache.has(t)) _desdeCache.set(t, DESDE_POR_TEXTO.reduce((a, [f, n]) => (t.includes(f) ? Math.max(a, capIdxDe(n)) : a), 0));
  return _desdeCache.get(t);
}
// ¿Sale en el capítulo en que vamos?
function disponible(item) {
  const cap = ESTADO.capitulo || 0;
  return cap >= desdeDe(item) && cap <= (item && item.hasta !== undefined ? capIdxDe(item.hasta) : Infinity);
}

// Elige de `lista` lo que toca en este capítulo y no ha salido aún; la memoria (ESTADO.vistos[tipo])
// guarda los índices vistos y viaja con la partida. Al agotarse el tramo se vacía y vuelve a empezar
// (sin repetir de golpe la última). Los índices son estables porque las listas solo crecen por el final.
function elegirNuevo(tipo, lista) {
  if (!lista || !lista.length) return undefined;
  if (!ESTADO.vistos || typeof ESTADO.vistos !== 'object') ESTADO.vistos = {};
  let vistos = Array.isArray(ESTADO.vistos[tipo]) ? ESTADO.vistos[tipo] : (ESTADO.vistos[tipo] = []);
  let cand = [];
  lista.forEach((it, i) => { if (disponible(it)) cand.push(i); });
  if (!cand.length) cand = lista.map((_, i) => i);
  let nuevos = cand.filter(i => !vistos.includes(i));
  if (!nuevos.length) {
    const ultimo = vistos[vistos.length - 1];
    vistos = ESTADO.vistos[tipo] = [];
    nuevos = cand.length > 1 ? cand.filter(i => i !== ultimo) : cand;
  }
  const i = Phaser.Utils.Array.GetRandom(nuevos);
  vistos.push(i);
  guardarPartida();
  return lista[i];
}
// Igual, para sorteos al vuelo (no se guardan): solo filtra por capítulo.
function alDisponible(lista) {
  const d = lista.filter(disponible);
  return Phaser.Utils.Array.GetRandom(d.length ? d : lista);
}

function elegirTonteria(id) { return elegirNuevo(`tonterias.${id}`, TONTERIAS[id]); }
function elegirColocada() { return elegirNuevo('colocadas', COLOCADAS); }
function elegirMensaje() { return elegirNuevo('mensajes', MENSAJES); }
function elegirRespuesta() { return elegirNuevo('respuestas', RESPUESTAS); }
function elegirTrivial() { return elegirNuevo('trivial', TRIVIAL); }
// Conversaciones de ambiente de entre `posibles` (las que tienen a todos presentes).
// La memoria va por su sitio en DIALOGOS (la lista de posibles cambia según quién esté en la sala).
function elegirDialogo(posibles) {
  const ok = posibles.filter(disponible);
  if (!ok.length) return undefined;
  if (!ESTADO.vistos || typeof ESTADO.vistos !== 'object') ESTADO.vistos = {};
  const vistos = Array.isArray(ESTADO.vistos.dialogos) ? ESTADO.vistos.dialogos : (ESTADO.vistos.dialogos = []);
  const nuevos = ok.filter(d => !vistos.includes(DIALOGOS.indexOf(d)));
  if (!nuevos.length) vistos.length = 0;
  const d = Phaser.Utils.Array.GetRandom(nuevos.length ? nuevos : ok);
  if (DIALOGOS.indexOf(d) >= 0) vistos.push(DIALOGOS.indexOf(d));
  return d;
}
// Los diálogos que ya pueden salir (para filtrar antes de mirar quién está en la sala).
function dialogosDisponibles() { return DIALOGOS.filter(disponible); }

// El contenido del móvil de un tipo: 'meme' | 'video' | 'noticia' | 'chat'. Mismo reparto de siempre
// (memes generados, chats dinámicos), pero lo hecho a mano sale según el capítulo y sin repetirse.
function elegirContenido(tipo) {
  if (tipo === 'meme') return { tipo, m: Math.random() < 0.55 ? memeGenerado() : elegirNuevo('memes', MEMES) };
  if (tipo === 'video') return { tipo, v: elegirNuevo('videos', VIDEOS) };
  if (tipo === 'noticia') return { tipo, n: elegirNuevo('noticias', NOTICIAS) };
  return { tipo: 'chat', mensajes: chatAlAzar() };
}

const TONTERIAS = {
  puky: [
    '¿Me llamabais? …¿No? Bueno, me quedo igual.',
    'Este baño es mi casa. Bueno, la de todos. Pero más mía.',
    'Yo solo vengo a ayudar. A veces ayudo mucho de golpe.',
    'Si alguien se encuentra mal, yo ya estoy aquí. Siempre estoy aquí.',
  ],
  palicaso: [
    '¡Escucha, escucha! Las estrellas fugaces no piden deseos: los cumplen. Yo cumplo años, por ejemplo.',
    'He inventado un cóctel nuevo: agua. Con hielo. Revolucionario.',
    'Me dijeron que hablo mucho. Les contesté durante dos horas.',
    'Si cuentas ovejas al revés, ¿te despiertas? Lo dejo ahí.',
    '¡Escucha! El otro día casi me callo. Casi.',
  ],
  blancaso: [
    'He hecho las cuentas: si no gasto, ahorro. Pero entonces no vivo.',
    'Hoy no me va a dar el bajón. Lo he apuntado en la agenda.',
    '¿Tú también oyes pensar a la nevera?',
    'Me he comprado una planta. Ya está más tranquila que yo.',
    'Las cuentas de Unaké cuadran. Mentira. Pero ha sonado bonito.',
  ],
  pompa: [
    '…',
    'Perdona, te contesto lo de ayer: sí.',
    'Shhh. Estoy escuchando el silencio. Tiene buen ritmo.',
    'Si me ves vibrar no es la música. Es que estoy a punto.',
    '¿Me has dicho algo? Da igual, la respuesta es «qué bonito».',
  ],
  lasslow: [
    'Buenas noches, caballero. JA… perdón. Buenas noches.',
    'He venido de etiqueta. La etiqueta es la pajarita. Lo demás es culo.',
    'No me hagas reír, que llevo la pajarita muy apretada.',
    'Hoy he desayunado con modales. Hasta que se me escapó.',
    'Un señor nunca corre. Salvo si se le ha escapao.',
  ],
  cotine: [
    'No me mires la boca. No he comido nada. Nada que se vea.',
    'Estoy haciendo una tarta de cinco pisos. Ahora tiene uno.',
    '¿Sabías que el azúcar glas es nieve que se ha rendido?',
    'Si encuentras una porción por ahí, no es mía.',
    'He probado la masa para ver si estaba buena. Estaba. Ya no hay masa.',
  ],
  perico: [
    '¡Pin pin! No, nada, que me aburro.',
    'He oído cosas. Muchas cosas. Pregúntame con pipas.',
    'Tengo una pipa para cada ocasión. Esta es la de cotillear.',
    'El gato de la tienda lo sabe todo. Más que yo. Me cae fatal.',
    'Si alguien te pregunta, yo no he dicho nada. Pero lo he dicho todo.',
  ],
};

// Para cuando vas muy colocado: lo dice cualquiera.
const COLOCADAS = [
  '¿Tú también ves respirar la acera?',
  'Llevo un rato mirando mi mano. Tiene cinco. Increíble.',
  'Si el humo sube, ¿quién baja? Piénsalo.',
  '¿Y si los monchis nos comen a nosotros?',
  'Me acabo de dar cuenta de que existo. Qué fuerte.',
];

// Memes: dibujo de la serie con texto arriba y abajo.
const MEMES = [
  // Ilustrados en Gemini (07_juego/arte/memes): se ven a pantalla completa.
  { foto: 'meme-blancaso-cuentas', sprite: 'blancaso-mareado', arriba: 'Yo cuadrando las cuentas de la aso', abajo: 'a final de mes' },
  { foto: 'meme-cotine-migas', sprite: 'cotine', arriba: '—¿Quién se ha comido la tarta?', abajo: '—Estaba así cuando llegué' },
  { sprite: 'blancaso-mareado', arriba: 'Cuando dices «solo una calada»', abajo: 'y tu cuerpo te ha oído', fondo: 0xffe08a },
  { sprite: 'cotine-plop', arriba: 'Yo: voy a hacer una tarta', abajo: 'La tarta:', fondo: 0xffc2dc },
  { sprite: 'lasslow-pedo', arriba: 'Cuando la reunión es en silencio', abajo: 'y tú tienes otros planes', fondo: 0xffd8b8 },
  { sprite: 'perico-silbando', arriba: 'Nadie:\nAbsolutamente nadie:', abajo: 'Perico: pin pin', fondo: 0xd8e6ff },
  { sprite: 'pompa-mira', arriba: 'Contestando el mensaje', abajo: 'de la semana pasada', fondo: 0xc9f3ff },
  { sprite: 'puky-que-rico', arriba: '¿Me llamabais?', abajo: '(no le llamó nadie)', fondo: 0xfff3a0 },
  { sprite: 'vuper-reparto', arriba: 'El rider a las 4:00', abajo: 'sabiendo más que tu psicólogo', fondo: 0xd0ffd0 },
  { sprite: 'palicaso-contando', arriba: 'Yo explicando', abajo: 'algo que nadie me ha preguntado', fondo: 0xfff0b0 },
  { sprite: 'vuper-colocado', arriba: 'Mi cara en el súper', abajo: 'buscando lo que no vine a comprar', fondo: 0xe0d0ff },
  { sprite: 'monchiman', arriba: 'Cuando tu colega dice «estoy bien»', abajo: 'pero ya has visto la M', fondo: 0xffe066 },
  { sprite: 'blancaso-calada', arriba: 'El alquiler: sube', abajo: 'Yo: bajo', fondo: 0xd8f0ff },
  { sprite: 'cotine', arriba: 'La dieta empieza el lunes', abajo: '¿Qué lunes? No se sabe', fondo: 0xffd0e8 },
];

// Memes generados: formatos de siempre × muletillas, situaciones del barrio y la pose que pega.
// Salen cientos de combinaciones distintas (se mezclan con los hechos a mano).
const MULETILLAS = {
  perico: ['Pin pin.', 'Yo no he dicho nada.', '¿Pipas?'],
  palicaso: ['¡Escucha, escucha!', '¿Una qué? ¡Una aso!', 'Te cuento una cosa…'],
  blancaso: ['Otra vez no…', 'Las cuentas no cuadran.', 'Hoy sí que disfruto.'],
  lasslow: ['¡Que se me ha escapao!', 'Soy un señor.', 'JAJA… perdón.'],
  pompa: ['…', 'Yo no, que exploto.', 'Te contesto mañana.'],
  cotine: ['¿Qué? Tenía hambre.', 'Solo lo pruebo.', 'Estaba así cuando llegué.'],
  puky: ['¿Me llamabais?', 'Vengo a ayudar.', 'Ya estoy aquí.'],
};
const POSES_MEME = {
  perico: ['perico-silbando', 'perico-cotilleando', 'perico-horror', 'perico-pipas'],
  palicaso: ['palicaso-contando', 'palicaso-riendo', 'palicaso'],
  blancaso: ['blancaso-mareado', 'blancaso-esperanza', 'blancaso-derritiendose', 'blancaso-calada'],
  lasslow: ['lasslow-pedo', 'lasslow-horror', 'lasslow-rodando', 'lasslow-aguantando'],
  pompa: ['pompa', 'pompa-mira', 'pompa-horror'],
  cotine: ['cotine', 'cotine-plop'],
  puky: ['puky-que-rico', 'puky-eructo', 'puky-riendo'],
};
const CUANDOS = [
  'el casero sube el alquiler', 'se acaba el género de la barra', 'Perico te pide la contraseña', 'abres la nevera a las 4',
  'alguien dice «periquito»', 'llega la cuenta', 'se te pasa el colocón', 'Cotine dice que solo lo prueba',
  'te toca recoger el sofá', 'el rider llega tarde', 'la hucha no llega', 'te miran en la cena del casero',
];
const FONDOS_MEME = [0xffe08a, 0xffc2dc, 0xd8e6ff, 0xc9f3ff, 0xd0ffd0, 0xe0d0ff, 0xfff0b0, 0xffd8b8];

function memeGenerado() {
  const al = alDisponible;
  const id = al(Object.keys(MULETILLAS));
  const sprite = al(POSES_MEME[id]);
  const nombre = id === 'pompa' ? 'La Pompa' : QUIEN[id] ? QUIEN[id].nombre : 'Puky';
  const formatos = [
    () => ['Nadie:\nAbsolutamente nadie:', `${nombre}: ${al(MULETILLAS[id])}`],
    () => [`Cuando ${al(CUANDOS)}`, al(['y tu cara es esta', 'y tú haces esto', 'y el cuerpo dice esto', `y ${nombre} suelta: ${al(MULETILLAS[id])}`])],
    () => ['Yo: «solo una calada»', 'También yo:'],
    () => [`${nombre} cuando ${al(CUANDOS)}`, al(MULETILLAS[id])],
    () => ['Lo que pienso:', `${al(MULETILLAS[id])}`],
    () => ['Mi plan para esta noche', 'Mi plan a las 4 de la mañana'],
  ];
  const [arriba, abajo] = al(formatos)();
  return { sprite, arriba, abajo, fondo: al(FONDOS_MEME) };
}

// Vídeos verticales: el dibujo se mueve, con pie, sonido y likes.
const VIDEOS = [
  { sprite: 'lasslow-rodando', pie: 'POV: te cuentan un chiste malo en un funeral', sonido: 'risa-lasslow', likes: '1,2 M', mov: 'gira' },
  { sprite: 'perico-volando', pie: 'Perico robando pipas EN DIRECTO (no es montaje)', sonido: 'pin-pin', likes: '845 mil', mov: 'cruza' },
  { sprite: 'palicaso-riendo', pie: 'Tutorial: cómo hablar tres horas sin decir nada', sonido: 'risas', likes: '2,3 M', mov: 'bota' },
  { sprite: 'puky-eructo', pie: 'ASMR de Puky (no lo pongas con cascos)', sonido: 'eructo', likes: '96 mil', mov: 'bota' },
  { sprite: 'vuper-comiendo', pie: 'Mukbang de patatas a las 4 de la mañana', sonido: 'nam', likes: '3,1 M', mov: 'bota' },
  { sprite: 'pompa', pie: 'La Pompa pinchando su tema más movido (no se mueve)', sonido: 'tiroriro', likes: '12', mov: 'quieto' },
  { sprite: 'cotine-plop', pie: 'Receta fácil: tarta en 3 pasos. Paso 1: comérsela', sonido: 'plop', likes: '640 mil', mov: 'bota' },
];

// Titulares de «Última hora del barrio».
const NOTICIAS = [
  { sprite: 'perico-horror', titular: 'Las pipas suben un 300 %. Perico: «Es un ataque personal»' },
  { sprite: 'palicaso-contando', titular: 'Palicaso bate su récord: cuatro horas hablando de un tema que no existe' },
  { sprite: 'cotine', titular: 'Aparece una tarta entera en Unaké. Cotine lo niega todo' },
  { sprite: 'lasslow-horror', titular: 'La comunidad prohíbe los pedos en el ascensor. Lasslow: «Es mi forma de expresarme»' },
  { sprite: 'pompa-mira', titular: 'Histórico: la Pompa contesta un mensaje el mismo día' },
  { sprite: 'blancaso', titular: 'El alquiler sube tanto que ya hay nubes viviendo en el techo de Unaké' },
  { sprite: 'monchiman', titular: 'Avistan a Monchiman en el barrio. Vuper, preguntado: «¿A quién?»' },
  { sprite: 'puky', titular: 'Puky se cuela en una fiesta a la que nadie le invitó. Otra vez' },
];

// El grupo de WhatsApp de la aso: mensajes que van saliendo.
const CHATS = [
  [['palicaso', '¿Quién se ha dejado un calcetín en la barra?'], ['lasslow', 'Un caballero nunca revela sus secretos'], ['lasslow', '…es mío'], ['blancaso', 'Otra vez no…']],
  [['cotine', 'Hay tarta en la cocina'], ['cotine', 'Había'], ['perico', 'pin pin'], ['pompa', '¿qué tarta?']],
  [['blancaso', 'Recordad pagar la cuota'], ['palicaso', '¿Una qué?'], ['blancaso', 'No empieces'], ['palicaso', '¡UNA ASO!']],
  [['perico', 'He visto a Monchiman'], ['vuper', '¿A quién?'], ['perico', 'Se parecía a ti'], ['vuper', 'Vale, vale…']],
  [['pompa', 'Contesto lo de anoche: sí, me lo pasé genial'], ['lasslow', 'Eso fue el martes'], ['pompa', '…'], ['pompa', 'pues genial el martes']],
  [['palicaso', 'Esta noche, karaoke en Unaké'], ['blancaso', '¿Quién ha aprobado eso?'], ['palicaso', 'Yo, en una reunión conmigo mismo'], ['lasslow', 'JAJAJA']],
];

// Conversaciones de ambiente: los personajes hablan entre ellos aunque no les hables tú.
const DIALOGOS = [
  [['palicaso', '¡Escucha, Lasslow! ¿Te he contado lo de…?'], ['lasslow', 'Tres veces, caballero.']],
  [['pompa', '…'], ['palicaso', '¡Exacto! Eso mismo pienso yo.']],
  [['lasslow', '¿Bailamos, señorita?'], ['pompa', '…mañana te contesto.']],
  [['palicaso', '¡Pompa, pon algo movido!'], ['pompa', 'Ya está puesto. Es silencio.']],
  [['lasslow', '¿Habéis notado ese olor?'], ['palicaso', 'Lasslow…']],
  [['palicaso', '¿Sabéis qué le falta a este bar?'], ['lasslow', '¿Un señor? Ya estoy yo.']],
];

const TRIVIAL = [
  { p: '¿Qué es Unaké?', r: ['Una aso', 'Un bar', 'Una qué'] },
  { p: '¿Qué silba Perico cuando le llaman periquito?', r: ['Pin pin', 'Fiu fiu', 'Pío pío'] },
  { p: '¿Qué lleva Monchiman en la mochila?', r: ['Dulce, salado y un resucitador', 'Pipas y facturas', 'Una tarta entera'] },
  { p: '¿Quién lleva las cuentas de Unaké?', r: ['Blancaso', 'Palicaso', 'Perico'] },
  { p: '¿Cómo se llama la cola del mundo humo?', r: ['Locacola', 'Nubecola', 'Humocola'] },
  { p: '¿Qué dice Lasslow cuando se le escapa?', r: ['«¡Que se me ha escapao!»', '«Ha sido Perico»', '«Perdón, caballeros»'] },
  { p: '¿Dónde vive la Pompa en Unaké?', r: ['Pegada al techo', 'En el baño', 'Detrás de la barra'] },
  { p: '¿Qué es un resucitador?', r: ['Lo que te devuelve a la vida', 'Un tipo de porro', 'El gato de la tienda'] },
];

// Recados: mensajes para llevar de uno a otro, y respuestas.
const MENSAJES = [
  'que le devuelva el mechero, que sabe perfectamente cuál',
  'que ha llegado un paquete a su nombre. Es una pipa',
  'que la reunión es a las nueve. De la noche. O de la mañana. Que vaya',
  'que Perico lo sabe todo. TODO',
  'que esta noche invita él. Él todavía no lo sabe',
  'que no se asuste, que es solo un recado',
];
const RESPUESTAS = ['¿Eso te ha dicho? Dile que vale.', 'Pff. Siempre igual.', 'Gracias, rider. ¿Te debo algo? No.', 'Apuntado. Bueno, no. Pero me acuerdo.'];

// ---------- Segunda tanda de material (29/10): que no se repita en horas ----------

TONTERIAS.puky.push(
  'Hoy he limpiado el baño. Bueno, lo he mirado fuerte.',
  'Si oyes un «blurp» detrás de ti, no te gires. Es mejor así.',
  'Me han dicho que soy un amarillo con personalidad. Me lo quedo.',
  'Huelo a limón. Es mentira, pero me gusta decirlo.',
);
TONTERIAS.palicaso.push(
  '¡Escucha! Si el bar se llama Unaké y yo soy de Unaké, ¿soy una qué? ¡Una aso!',
  'He contado los vasos: hay muchos. El número exacto es secreto profesional.',
  'Hoy he puesto música en la barra. Era yo cantando.',
  '¡Escucha! Estoy pensando en hacerme un tatuaje que diga «escucha».',
  'Mi cóctel nuevo se llama «el último». Siempre hay otro después.',
  'Ayer hablé con una lámpara. Muy buena conversadora. No me interrumpió.',
  'Las estrellas fugaces vamos muy rápido. Por eso nadie nos entiende.',
);
TONTERIAS.blancaso.push(
  'He hecho un presupuesto para la semana. Ya lo he gastado.',
  'Hoy he respirado hondo tres veces. Récord personal.',
  'Si me pongo blanco es normal. Si me pongo amarillo, corre.',
  'Estoy pensando en abrir una cuenta de ahorro. Para pensarlo.',
  'El casero me ha mandado un mensaje. Lo he archivado sin leer. Paz.',
  'Me gusta la plaza: aquí nadie me pide facturas. Bueno, tú a veces.',
  'He soñado que las cuentas cuadraban. Me he despertado llorando.',
);
TONTERIAS.pompa.push(
  '…¿eh?',
  'Hoy he flotado un metro más que ayer. Progreso.',
  'Me han pinchado una vez. No hablo de eso.',
  'La música buena se escucha con la piel. Y la mía es muy fina.',
  'Si pongo un tema lento, es que estoy bien. Si pongo silencio, mejor.',
  'Perdona, me he quedado mirando el techo. Es mi techo.',
);
TONTERIAS.lasslow.push(
  'Caballero, ¿huele usted eso? Es la elegancia.',
  'He aprendido a bailar el vals. Lo que no he aprendido es a no tirarme uno.',
  'La pajarita aprieta, pero la dignidad aprieta más.',
  'Un señor siempre deja propina. Y a veces algo más. Perdón.',
  'Tengo un chiste nuevo. No te lo cuento, que me río antes yo.',
  'Me han invitado a una boda. Ya les he pedido perdón por adelantado.',
  'JA… no. No me reía. Era el aire acondicionado.',
);
TONTERIAS.cotine.push(
  'He horneado una tarta. Tenía forma de tarta un ratito.',
  'Las migas no cuentan. Son tarta pequeña que se ha ido.',
  '¿Huele a chocolate? Es mi colonia. Y mi cena.',
  'Mi receta secreta: probarlo todo antes. Todo. Varias veces.',
  'Hoy no he comido nada. Excepto lo que he comido.',
  'Si la nevera pita es que me ha visto venir.',
  'He hecho galletas para todos. Para todos los que soy yo.',
);
TONTERIAS.perico.push(
  'Pin pin. ¿Sabes quién ha entrado hoy? Yo sí. Pregúntame.',
  'La contraseña de hoy es secreta. Hasta para mí.',
  'He visto a Lasslow sin pajarita. No puedo olvidarlo.',
  'Cuando nadie mira, abro la puerta yo solo. Por practicar.',
  'Me llamo Perico. Ni periquito, ni loro, ni nada. Perico.',
  '¿Pipas? Bueno, una. Una cáscara.',
  'Desde aquí se ve todo el barrio. Y se oye. Y se huele. Lasslow…',
);
COLOCADAS.push(
  '¿Las nubes nos fuman a nosotros? Lo estoy pensando en serio.',
  'Si cierro los ojos, el bar sigue ahí. Lo he comprobado. Dos veces.',
  'Acabo de oír un color. Era morado y decía «pin pin».',
  'Tengo una idea genial. …Se ha ido. Era genial.',
  'Mira mis manos. No, no. Mira, mira. ¿Lo ves? Yo tampoco.',
  'Las patatas están crujientes por dentro de mi cabeza.',
  '¿Cuánto rato llevamos aquí? ¿Un siglo? ¿Un minuto? Sí.',
  'El suelo está blandito. ¿O soy yo?',
  'Creo que la Pompa me está hablando con la mente. Dice «…».',
  'Me ha mirado un monchi. Me he puesto rojo.',
);
MEMES.push(
  { sprite: 'perico-horror', arriba: 'Cuando te llaman periquito', abajo: 'en tu propia puerta', fondo: 0xd8e6ff },
  { sprite: 'blancaso-derritiendose', arriba: 'Yo el lunes', abajo: 'después de un finde en Unaké', fondo: 0xd8f0ff },
  { sprite: 'lasslow-aguantando', arriba: 'Aguantándolo en la cena', abajo: 'como un señor', fondo: 0xffd8b8 },
  { sprite: 'puky-charco', arriba: 'Yo cuando dicen «hay que limpiar»', abajo: '', fondo: 0xfff3a0 },
  { sprite: 'pompa-horror', arriba: 'Cuando alguien trae un alfiler', abajo: 'a la fiesta', fondo: 0xc9f3ff },
  { sprite: 'vuper-comiendo', arriba: '«Solo voy a picar algo»', abajo: 'La tienda entera:', fondo: 0xd0ffd0 },
  { sprite: 'perico-pipas', arriba: 'Yo enterándome de todo', abajo: 'desde la puerta', fondo: 0xe0d0ff },
  { sprite: 'palicaso-riendo', arriba: 'Cuando el chiste lo cuentas tú', abajo: 'y te ríes tú solo', fondo: 0xfff0b0 },
  { sprite: 'monchiman-picado', arriba: 'Monchiman a las 4:20', abajo: 'buscando a quien salvar', fondo: 0xffe066 },
  { sprite: 'lasslow-risa-floja', arriba: 'Cuando te dicen «no te rías»', abajo: 'en el peor momento', fondo: 0xffd8b8 },
  { sprite: 'blancaso-esperanza', arriba: 'Blancaso: «hoy no me da»', abajo: 'Spoiler:', fondo: 0xd8f0ff },
  { sprite: 'vuper-fumado', arriba: 'Mi cerebro después de la primera', abajo: 'cargando…', fondo: 0xe0d0ff },
  { sprite: 'cotine-plop', arriba: 'Cuando la tarta es para compartir', abajo: 'pero hay tarta', fondo: 0xffc2dc },
  { sprite: 'perico-graznando', arriba: 'Perico cuando no sabes la contraseña', abajo: '', fondo: 0xd8e6ff },
);
CUANDOS.push(
  'se acaba el papel', 'no encuentras el mechero y lo tienes en la mano', 'Lasslow está muy callado', 'la Pompa contesta rápido',
  'Palicaso dice «una cosa rápida»', 'Blancaso dice «hoy sí»', 'Puky dice «¿me llamabais?»', 'cierran la tienda de 24 h',
  'el casero pregunta por el ruido', 'te piden la cuota de la aso', 'suena la M del cuarto', 'vuelves al mundo normal',
);
VIDEOS.push(
  { sprite: 'blancaso-derritiendose', pie: 'Timelapse: Blancaso mirando una factura', sonido: 'deshinchar', likes: '980 mil', mov: 'quieto' },
  { sprite: 'perico-pipas', pie: 'Reto: Perico comiendo 100 pipas sin tirar cáscaras (spoiler: no)', sonido: 'pin-pin', likes: '1,8 M', mov: 'bota' },
  { sprite: 'lasslow-pedo', pie: 'Lasslow intenta tocar la tuba. Sin tuba', sonido: 'pedo-tuba', likes: '4,4 M', mov: 'bota' },
  { sprite: 'pompa-horror', pie: 'La Pompa ve un cactus por primera vez', sonido: 'aaah', likes: '2,7 M', mov: 'quieto' },
  { sprite: 'puky-riendo', pie: 'Puky aprende a bailar (no debió)', sonido: 'puky-gracioso', likes: '310 mil', mov: 'gira' },
  { sprite: 'monchiman', pie: 'Monchiman: cámara oculta. Nadie se da cuenta de que es Vuper', sonido: 'zumbido-m', likes: '5 M', mov: 'cruza' },
  { sprite: 'palicaso-contando', pie: 'Palicaso explica la física cuántica (es una anécdota de su primo)', sonido: 'risa-fondo', likes: '720 mil', mov: 'bota' },
  { sprite: 'cotine', pie: 'Unboxing de una tarta. No quedó caja. Ni tarta', sonido: 'nam', likes: '1,1 M', mov: 'bota' },
);
NOTICIAS.push(
  { sprite: 'puky-charco', titular: 'Aparece un charco amarillo en Unaké. Puky: «Es arte»' },
  { sprite: 'lasslow-digno', titular: 'Lasslow, nombrado «Señor del año». Se le escapó en la gala' },
  { sprite: 'perico-volando', titular: 'Perico vuela por primera vez. Dice que fue sin querer' },
  { sprite: 'cotine-plop', titular: 'Desaparecen 40 magdalenas de la panadería. Una pista: migas hasta la cocina de Cotine' },
  { sprite: 'blancaso-esperanza', titular: 'Blancaso aguanta una noche entera sin bajón. Los expertos no se lo creen' },
  { sprite: 'pompa', titular: 'La Pompa pincha 6 horas seguidas sin moverse. El público tampoco' },
  { sprite: 'palicaso-riendo', titular: 'Palicaso deja de hablar 30 segundos. Se declara el día festivo' },
  { sprite: 'vuper-reparto', titular: 'Un rider entrega un pedido antes de tiempo. Investigan si es humano' },
  { sprite: 'perico-cotilleando', titular: 'La comunidad pide a Perico que deje de cotillear. Perico: «¿Quién ha dicho eso?»' },
  { sprite: 'monchiman-picado', titular: 'Monchiman salva a un vecino de un bajón. El vecino pide otro' },
);
CHATS.push(
  [['lasslow', 'Caballeros, mañana vengo de esmoquin'], ['palicaso', '¿Por qué?'], ['lasslow', 'Por si me pasa lo de siempre, que sea elegante'], ['perico', 'pin pin']],
  [['cotine', '¿Alguien ha visto mi tarta?'], ['perico', 'La tienes en la cara'], ['cotine', 'Ah. Gracias'], ['cotine', 'Estaba buena']],
  [['perico', 'Contraseña nueva para esta noche'], ['palicaso', '¿Cuál?'], ['perico', 'No la puedo decir por aquí'], ['perico', 'Es pipas'], ['blancaso', 'Perico…']],
  [['pompa', '.'], ['palicaso', '¿Estás bien?'], ['pompa', '..'], ['lasslow', 'Eso es un sí'], ['pompa', '...']],
  [['blancaso', 'He cuadrado las cuentas'], ['palicaso', '¡No puede ser!'], ['blancaso', 'Me he equivocado de mes'], ['blancaso', 'Otra vez no…']],
  [['vuper', '¿Alguien tiene papel?'], ['palicaso', 'En la tienda'], ['cotine', 'Yo tengo de magdalena'], ['vuper', 'Vale, vale…']],
  [['puky', '¿Me habéis añadido al grupo?'], ['blancaso', '¿QUIÉN HA SIDO?'], ['perico', 'pin pin'], ['puky', 'Ya estoy aquí']],
  [['palicaso', 'Mañana karaoke'], ['pompa', 'Yo no canto, que exploto'], ['lasslow', 'Yo pongo los efectos de sonido'], ['blancaso', 'NO']],
);
DIALOGOS.push(
  [['cotine', '¿Alguien quiere tarta?'], ['palicaso', '¡Yo!'], ['cotine', 'Ya no queda.']],
  [['lasslow', 'Señorita Pompa, ¿me concede este baile?'], ['pompa', 'Si te tiras uno, exploto.']],
  [['palicaso', '¡Escucha, Pompa! Pon algo de mi época.'], ['pompa', 'Tu época es ahora. …Ya está puesto.']],
  [['lasslow', 'Un señor nunca…'], ['palicaso', '…¿nunca qué?'], ['lasslow', 'Perdón, se me ha escapado la frase.']],
  [['pompa', '¿Habéis visto mi techo?'], ['palicaso', 'Está encima.'], ['pompa', 'Ah. Siempre está ahí.']],
  [['palicaso', 'Hoy viene mucha gente, ¿eh?'], ['lasslow', 'Será por mí, caballero. O por el olor.']],
);
TRIVIAL.push(
  { p: '¿Qué le pasa a la Pompa si la pinchan?', r: ['Explota', 'Se ríe', 'Se pone a pinchar música'] },
  { p: '¿Qué hace Cotine con las tartas?', r: ['Se las come', 'Las vende', 'Las tira'] },
  { p: '¿Cuál es la hora del móvil de todos?', r: ['4:20', '3:00', '12:00'] },
  { p: '¿Quién es la estrella fugaz de Unaké?', r: ['Palicaso', 'Perico', 'Puky'] },
  { p: '¿Qué le da a Blancaso cuando fuma mucho?', r: ['Un blancaso', 'Hambre', 'Sueño'] },
  { p: '¿De qué color es Puky?', r: ['Amarillo', 'Verde', 'Morado'] },
  { p: '¿Qué necesitas para liarte uno?', r: ['Papel, boquilla, bolsita y mechero', 'Solo papel', 'Una tarta'] },
);
MENSAJES.push(
  'que Cotine le ha guardado tarta. Que corra',
  'que la Pompa le ha contestado. Del mes pasado',
  'que Lasslow pide perdón. Por adelantado',
  'que el casero ha preguntado por él. Que no está',
  'que esta noche hay karaoke. Que traiga tapones',
);

// ---------- Contenido por capítulos (js/contenido/capitulos.js), si existe ----------
// chats y ambiente llegan como { desde, mensajes: [[id, texto], …] } y aquí se convierten en las
// listas de siempre (con `desde` colgando de la lista); memes, tal cual. Siempre al final de cada
// array, para que los índices de la memoria de vistos no cambien.
if (typeof CONTENIDO_CAPITULOS !== 'undefined') {
  const aLista = p => {
    if (Array.isArray(p)) return p;
    const m = [...p.mensajes];
    if (p.desde !== undefined) m.desde = p.desde;
    if (p.hasta !== undefined) m.hasta = p.hasta;
    return m;
  };
  CHATS.push(...(CONTENIDO_CAPITULOS.chats || []).map(aLista));
  DIALOGOS.push(...(CONTENIDO_CAPITULOS.ambiente || []).map(aLista));
  MEMES.push(...(CONTENIDO_CAPITULOS.memes || []));
}

// Chats que hablan de cómo va tu partida: la hucha, el negocio, el hambre…
function chatDinamico() {
  const al = l => Phaser.Utils.Array.GetRandom(l);
  const opciones = [];
  if (typeof META_HUCHA !== 'undefined' && desdeCapId('cuota')) {
    const falta = Math.max(0, META_HUCHA - (ESTADO.hucha || 0));
    opciones.push([['blancaso', `La hucha va por ${ESTADO.hucha || 0}`], ['blancaso', `Faltan ${falta} para el casero`], ['palicaso', '¡Eso está hecho!'], ['blancaso', 'Eso dices siempre']]);
  }
  const cn = typeof cuentasNegocio === 'function' ? cuentasNegocio() : null;
  if (cn && cn.total > 0) opciones.push([['palicaso', `Hoy Unaké está a tope: ${Math.floor(cn.clientes)} clientes`], ['perico', 'Y todos me han dicho la contraseña mal'], ['palicaso', `Somos «${cn.rango}»`], ['lasslow', 'Gracias a mi presencia, caballeros']]);
  if (ESTADO.hambre > 55) opciones.push([['cotine', 'Vuper, se te oyen las tripas desde la cocina'], ['vuper', 'Vale, vale…'], ['cotine', 'Ve a la tienda, que me lo como yo todo']]);
  if (ESTADO.monchis > 500) opciones.push([['perico', `Dicen que Vuper tiene ${ESTADO.monchis} monchis`], ['palicaso', '¡Invita él!'], ['vuper', '¿A una qué?'], ['palicaso', '¡A UNA ASO!']]);
  if (ESTADO.monchis < 20) opciones.push([['blancaso', 'Vuper, ¿cómo vas de monchis?'], ['vuper', 'Mal'], ['blancaso', 'Hay encargos en la tienda de 24 h'], ['vuper', 'Vale, vale…']]);
  if (totalEstrellas() > 0) opciones.push([['palicaso', `¡Vuper lleva ${totalEstrellas()} estrellas!`], ['perico', 'Yo tengo pipas'], ['pompa', '…felicidades'], ['lasslow', 'JA… perdón. Bravo.']]);
  return opciones.length ? al(opciones) : elegirNuevo('chats', CHATS);
}
function chatAlAzar() {
  return Math.random() < 0.35 ? chatDinamico() : elegirNuevo('chats', CHATS);
}

// ---------- El móvil ----------

// Dibuja un móvil con el contenido dentro. Devuelve el contenedor (centrado en 0,0) y una
// función para pararlo. tipo: 'meme' | 'video' | 'noticia' | 'chat'.
function movil(scene, contenido) {
  const c = scene.add.container(0, 0);
  const W = 340;
  const H = 620;
  const g = scene.add.graphics();
  g.fillStyle(HEX.tinta, 1).fillRoundedRect(-W / 2 - 14, -H / 2 - 30, W + 28, H + 70, 46);
  g.fillStyle(0x2a2238, 1).fillRoundedRect(-W / 2 - 8, -H / 2 - 24, W + 16, H + 58, 42);
  g.fillStyle(0x111111, 1).fillRoundedRect(-W / 2, -H / 2, W, H, 18);
  g.fillStyle(0x2a2238, 1).fillRoundedRect(-36, -H / 2 - 16, 72, 10, 5);
  c.add(g);
  const pantalla = scene.add.container(0, 0);
  c.add(pantalla);
  // Barra de estado: siempre son las 4:20.
  pantalla.add(scene.add.text(-W / 2 + 14, -H / 2 + 8, '4:20', { fontFamily: FUENTE, fontSize: '16px', color: '#ffffff' }));
  pantalla.add(scene.add.rectangle(W / 2 - 30, -H / 2 + 18, 30, 12).setStrokeStyle(2, 0xffffff));
  pantalla.add(scene.add.rectangle(W / 2 - 38, -H / 2 + 18, 12, 8, 0x7ee081));
  const eventos = [];
  const parar = () => eventos.forEach(e => e.remove());
  const cab = (nombre, color) => {
    pantalla.add(scene.add.rectangle(0, -H / 2 + 52, W, 44, color));
    pantalla.add(scene.add.text(-W / 2 + 14, -H / 2 + 52, nombre, { fontFamily: FUENTE, fontSize: '20px', color: '#ffffff' }).setOrigin(0, 0.5));
  };
  const area = { x: 0, y: 20, w: W - 20, h: H - 120 };
  const ajustar = (img, ancho, alto) => img.setScale(Math.min(ancho / img.width, alto / img.height));

  if (contenido.tipo === 'meme') {
    const m = contenido.m;
    cab('Humogram', 0x9b4dff);
    pantalla.add(scene.add.rectangle(area.x, area.y, area.w, area.h, m.fondo || 0x1d1530));
    if (m.foto && scene.textures.exists(m.foto)) {
      // Ilustración a pantalla completa, recortada al cuadro, con un zoom lento de vídeo.
      const img = scene.add.image(area.x, area.y, m.foto);
      const esc = Math.max(area.w / img.width, area.h / img.height);
      img.setScale(esc).setCrop((img.width - area.w / esc) / 2, (img.height - area.h / esc) / 2, area.w / esc, area.h / esc);
      pantalla.add(img);
      scene.tweens.add({ targets: img, scale: esc * 1.06, duration: 5000, ease: 'Sine.inOut', yoyo: true, repeat: -1 });
    } else {
      const img = ajustar(scene.add.image(area.x, area.y + 10, m.sprite), 260, 280);
      pantalla.add(img);
      scene.tweens.add({ targets: img, scale: img.scale * 1.04, duration: 500, yoyo: true, repeat: -1 });
    }
    const letra = (y, t) => scene.add.text(0, y, t.toUpperCase(), {
      fontFamily: FUENTE, fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 7, align: 'center', wordWrap: { width: area.w - 20 },
    }).setOrigin(0.5);
    pantalla.add(letra(area.y - area.h / 2 + 50, m.arriba));
    pantalla.add(letra(area.y + area.h / 2 - 46, m.abajo));
  }

  if (contenido.tipo === 'video') {
    const v = contenido.v;
    pantalla.add(scene.add.rectangle(0, 10, W, H - 20, 0x1d1530));
    const img = ajustar(scene.add.image(0, 20, v.sprite), 250, 290);
    pantalla.add(img);
    const s = img.scale;
    if (v.mov === 'gira') scene.tweens.add({ targets: img, angle: 360, duration: 1400, repeat: -1 });
    if (v.mov === 'bota') scene.tweens.add({ targets: img, y: -30, scaleX: s * 0.92, scaleY: s * 1.08, duration: 320, yoyo: true, repeat: -1, ease: 'Sine.out' });
    if (v.mov === 'cruza') { img.x = -200; scene.tweens.add({ targets: img, x: 200, duration: 1600, repeat: -1 }); }
    pantalla.add(scene.add.text(-W / 2 + 14, H / 2 - 120, v.pie, { fontFamily: FUENTE, fontSize: '18px', color: '#ffffff', wordWrap: { width: W - 90 } }));
    const corazon = scene.add.text(W / 2 - 36, 60, '♥', { fontFamily: 'Arial', fontSize: '40px', color: '#ff5fa2' }).setOrigin(0.5);
    pantalla.add([corazon, scene.add.text(W / 2 - 36, 96, v.likes, { fontFamily: FUENTE, fontSize: '14px', color: '#ffffff' }).setOrigin(0.5)]);
    scene.tweens.add({ targets: corazon, scale: 1.25, duration: 300, yoyo: true, repeat: -1 });
    const barra = scene.add.rectangle(-W / 2, H / 2 - 6, 0, 5, 0xffffff).setOrigin(0, 0.5);
    pantalla.add(barra);
    scene.tweens.add({ targets: barra, width: W, duration: 4000, repeat: -1 });
    // Corazones que suben.
    eventos.push(scene.time.addEvent({
      delay: 260, loop: true, callback: () => {
        const h = scene.add.text(W / 2 - 40 + Phaser.Math.Between(-12, 12), 40, '♥', { fontFamily: 'Arial', fontSize: '22px', color: Phaser.Utils.Array.GetRandom(['#ff5fa2', '#ffd23f', '#ffffff']) }).setOrigin(0.5);
        pantalla.add(h);
        scene.tweens.add({ targets: h, y: -200, x: h.x - Phaser.Math.Between(0, 60), alpha: 0, duration: 1400, onComplete: () => h.destroy() });
      },
    }));
    if (v.sonido) sfx(scene, v.sonido, { volume: 0.6 });
  }

  if (contenido.tipo === 'noticia') {
    const n = contenido.n;
    pantalla.add(scene.add.rectangle(0, 10, W, H - 20, 0xffffff));
    const banda = scene.add.rectangle(0, -H / 2 + 60, W, 54, 0xe8233f);
    pantalla.add(banda);
    pantalla.add(scene.add.text(0, -H / 2 + 60, 'ÚLTIMA HORA DEL BARRIO', { fontFamily: FUENTE, fontSize: '22px', color: '#ffffff' }).setOrigin(0.5));
    scene.tweens.add({ targets: banda, alpha: 0.7, duration: 300, yoyo: true, repeat: -1 });
    pantalla.add(scene.add.rectangle(0, -60, W - 40, 220, 0x2a2238).setStrokeStyle(4, HEX.tinta));
    pantalla.add(ajustar(scene.add.image(0, -60, n.sprite), W - 80, 200));
    pantalla.add(scene.add.text(0, 140, n.titular, { fontFamily: FUENTE, fontSize: '24px', color: '#1b1028', align: 'center', wordWrap: { width: W - 40 } }).setOrigin(0.5));
    pantalla.add(scene.add.rectangle(0, H / 2 - 22, W, 34, 0x1b1028));
    const ticker = scene.add.text(W / 2, H / 2 - 22, 'El barrio informa · Aquí nadie juzga · El barrio informa', { fontFamily: FUENTE, fontSize: '16px', color: '#ffd23f' }).setOrigin(0, 0.5);
    pantalla.add(ticker);
    scene.tweens.add({ targets: ticker, x: -W / 2 - ticker.width, duration: 6000, repeat: -1 });
  }

  if (contenido.tipo === 'chat') {
    cab('Los de la aso (7)', 0x128c4a);
    pantalla.add(scene.add.rectangle(0, 30, W, H - 80, 0xe6dccb));
    const escribe = scene.add.text(-W / 2 + 14, -H / 2 + 68, '', { fontFamily: FUENTE, fontSize: '13px', color: '#c9ffd9' }).setOrigin(0, 0.5);
    pantalla.add(escribe);
    const burbujas = [];
    let y = -H / 2 + 100;
    contenido.mensajes.forEach(([id, txt], i) => {
      eventos.push(scene.time.delayedCall(i * 1300, () => escribe.setText(`${QUIEN[id].nombre} está escribiendo…`)));
      eventos.push(scene.time.delayedCall(700 + i * 1300, () => {
        escribe.setText('');
        const q = QUIEN[id];
        const mio = id === 'vuper';
        const t = scene.add.text(0, 0, txt, { fontFamily: FUENTE, fontSize: '17px', color: '#1b1028', wordWrap: { width: 220 } });
        const nombre = scene.add.text(0, 0, q.nombre, { fontFamily: FUENTE, fontSize: '13px', color: mio ? '#128c4a' : '#7b3fbf' });
        const ancho = Math.max(t.width, nombre.width) + 24;
        const alto = t.height + 34;
        const x = mio ? W / 2 - 12 - ancho : -W / 2 + 12;
        const b = scene.add.container(x, y);
        const fondoB = scene.add.graphics();
        fondoB.fillStyle(mio ? 0xd2f8c6 : 0xffffff, 1).fillRoundedRect(0, 0, ancho, alto, 12);
        nombre.setPosition(12, 6);
        t.setPosition(12, 24);
        b.add([fondoB, nombre, t]).setScale(0);
        pantalla.add(b);
        scene.tweens.add({ targets: b, scale: 1, duration: 200, ease: 'Back.out' });
        burbujas.push(b);
        y += alto + 10;
        sfx(scene, 'pop', { volume: 0.3 });
        // Si no caben, se desplazan hacia arriba.
        const sobra = y - (H / 2 - 20);
        if (sobra > 0) { burbujas.forEach(bb => { bb.y -= sobra; bb.setVisible(bb.y > -H / 2 + 70); }); y -= sobra; }
      }));
    });
  }

  return { c, parar };
}

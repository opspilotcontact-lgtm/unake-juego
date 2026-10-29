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
  const al = l => Phaser.Utils.Array.GetRandom(l);
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

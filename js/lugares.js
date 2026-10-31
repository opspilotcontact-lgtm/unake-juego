// Lo que engancha se queda (criterio.md, apartado 4): todo minijuego desbloqueado vive para siempre
// en su sitio del barrio, y cada partida repetida puede traer algo distinto («la noche especial»).
//
// Este archivo es solo DATOS y funciones puras; barrio.js decide cómo se pintan las tarjetas.
// - LUGARES_MINIJUEGO: dónde vive cada minijuego y cuándo se abre.
// - OBJETOS_LUGAR: los objetos nuevos que lo alojan (la llave del casero, la furgo de la aso).
// - MODS_PARTIDA / aplicarModPartida: el modificador al azar y su efecto al acabar la partida.
//
// `sitio` es el id de la cosa del barrio (perico, palicaso, m…); `sala` es el paradero habitual
// (informativo: el paradero real lo manda rutinas.js). `mundo`: 'humo' (de noche), 'normal' (de día) o 'ambos'.

// La M de tu cuarto se enciende con 3 estrellas, en el capítulo de la inspección o, para siempre,
// cuando ya has ganado el rescate una vez (lo que engancha se queda).
function mEncendida() {
  return totalEstrellas() >= 3 || (ESTADO.capitulo || 0) === 6 || stat('gana_Rescate') >= 1;
}

const LUGARES_MINIJUEGO = [
  // Perico, en la puerta
  { clave: 'Contrasena', sitio: 'perico', sala: 'fuera', mundo: 'ambos', principal: true, abre: () => true },
  { clave: 'Pipas', sitio: 'perico', sala: 'fuera', mundo: 'humo', abre: () => stat('gana_Pipas') >= 1 },
  { clave: 'Periquito', sitio: 'perico', sala: 'fuera', mundo: 'humo', abre: () => stat('gana_Periquito') >= 1 },
  // Palicaso, en la barra
  { clave: 'Barra', sitio: 'palicaso', sala: 'dentro', mundo: 'humo', abre: () => stat('gana_Barra') >= 1 },
  { clave: 'Farol', sitio: 'palicaso', sala: 'dentro', mundo: 'humo', abre: () => stat('gana_Farol') >= 1 },
  // Blancaso, en la plaza
  { clave: 'Cuentas', sitio: 'blancaso', sala: 'plaza', mundo: 'humo', abre: () => stat('gana_Cuentas') >= 1 },
  // La Pompa
  { clave: 'DJ', sitio: 'pompa', sala: 'dentro', mundo: 'humo', abre: () => stat('gana_DJ') >= 1 },
  { clave: 'Sigilo', sitio: 'pompa', sala: 'dentro', mundo: 'ambos', abre: () => stat('gana_Sigilo') >= 1 },
  // Cotine, en la cocina
  { clave: 'Tarta', sitio: 'cotine', sala: 'cocina', mundo: 'humo', principal: true, abre: () => true },
  { clave: 'Palo', sitio: 'cotine', sala: 'cocina', mundo: 'humo', abre: () => stat('gana_Palo') >= 1 || nocheAbre('cotine', 'Palo') },
  // Lasslow
  { clave: 'Lasslow', sitio: 'lasslow', sala: 'dentro', mundo: 'humo', principal: true, abre: () => true },
  { clave: 'Aires', sitio: 'lasslow', sala: 'dentro', mundo: 'humo', abre: () => stat('gana_Aires') >= 1 || nocheAbre('lasslow', 'Aires') },
  // La llave del casero, en Unaké (objeto nuevo)
  { clave: 'Inspeccion', sitio: 'llave', sala: 'dentro', mundo: 'humo', abre: () => stat('gana_Inspeccion') >= 1 },
  // La M del cuarto
  { clave: 'Rescate', sitio: 'm', sala: 'cuarto', mundo: 'humo', principal: true, abre: () => mEncendida() },
  { clave: 'Blancazo', sitio: 'm', sala: 'cuarto', mundo: 'humo', abre: () => stat('gana_Blancazo') >= 1 },
  // La furgo de la aso, aparcada fuera (objeto nuevo); solo si el minijuego existe en esta versión
  // Entrega 1: la furgo está aparcada desde «Perico lo sabe» aunque aún no tenga su capítulo.
  { clave: 'Furgo', sitio: 'furgo', sala: 'fuera', mundo: 'ambos', abre: () => stat('gana_Furgo') >= 1 || (ESTADO.capitulo || 0) >= 5 },
  { clave: 'Control', sitio: 'furgo', sala: 'fuera', mundo: 'ambos', abre: () => stat('gana_Control') >= 1 },
];

// ¿La noche de este personaje ya abrió ese minijuego? (noches.js)
function nocheAbre(id, clave) {
  return typeof minijuegosAbiertos === 'function' && minijuegosAbiertos(id).includes(clave);
}

// Minijuegos abiertos de un sitio en este mundo, en el orden de la tabla.
function lugaresDe(sitio, mundo) {
  if (!sitio) return [];
  return LUGARES_MINIJUEGO
    .filter(l => l.sitio === sitio && MISIONES[l.clave] && (l.mundo === 'ambos' || l.mundo === mundo) && l.abre())
    .map(l => l.clave);
}

// Los que se pueden REPETIR en ese sitio, sin contar el principal (que ya tiene su marca y sus estrellas).
function lugaresRepetibles(sitio, mundo, principal) {
  return lugaresDe(sitio, mundo).filter(k => k !== principal && !(LUGARES_MINIJUEGO.find(l => l.clave === k) || {}).principal);
}

// ---------- Los objetos que alojan minijuegos ----------

function dibujarTextura(scene, clave, ancho, alto, pintar) {
  if (scene.textures.exists(clave)) return clave;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  pintar(g, ancho, alto);
  g.generateTexture(clave, ancho, alto);
  g.destroy();
  return clave;
}

// Sustituto dibujado de la furgo hasta que haya sprite (`obj-furgo`): furgoneta crema con franja de la aso.
function texturaFurgo(scene) {
  if (scene.textures.exists('obj-furgo')) return 'obj-furgo';
  return dibujarTextura(scene, 'furgo-dib', 360, 200, (g, w, h) => {
    g.fillStyle(0x1b1028, 1).fillRoundedRect(8, 20, w - 16, h - 56, 26);
    g.fillStyle(0xfff6e8, 1).fillRoundedRect(14, 26, w - 28, h - 68, 22);
    g.fillStyle(0x5ad1ff, 1).fillRect(14, 96, w - 28, 26);
    g.fillStyle(0xffd23f, 1).fillRect(14, 122, w - 28, 8);
    g.fillStyle(0x1b1028, 1).fillRoundedRect(w - 120, 36, 92, 52, 10);
    g.fillStyle(0x9fe7ff, 1).fillRoundedRect(w - 114, 42, 80, 40, 8);
    g.fillStyle(0x1b1028, 1).fillRect(40, 40, 120, 40);
    g.fillStyle(0xff5fa2, 1).fillRect(46, 46, 108, 28);
    g.fillStyle(0x1b1028, 1).fillCircle(90, h - 26, 28).fillCircle(w - 80, h - 26, 28);
    g.fillStyle(0x8a7fa0, 1).fillCircle(90, h - 26, 13).fillCircle(w - 80, h - 26, 13);
  });
}

function texturaLlave(scene) {
  if (scene.textures.exists('obj-llave')) return 'obj-llave';
  return dibujarTextura(scene, 'llave-dib', 160, 160, (g) => {
    g.fillStyle(0x1b1028, 1).fillCircle(56, 56, 44).fillRect(84, 46, 70, 20).fillRect(120, 60, 14, 32).fillRect(142, 60, 12, 24);
    g.fillStyle(0xffd23f, 1).fillCircle(56, 56, 36).fillRect(88, 50, 62, 12).fillRect(124, 60, 8, 26).fillRect(146, 60, 6, 18);
    g.fillStyle(0x1b1028, 1).fillCircle(56, 56, 14);
  });
}

const OBJETOS_LUGAR = {
  llave: { sala: 'dentro', mundo: 'humo', x: 470, y: 662, alto: 150, nombre: 'La llave del casero', textura: texturaLlave },
  furgo: { sala: 'fuera', mundo: 'ambos', x: 470, y: 668, alto: 200, nombre: 'La furgo de la aso', textura: texturaFurgo },
};

// Las cosas de esta sala que alojan minijuegos abiertos, listas para `montarCosa`.
function objetosLugar(scene, sala, mundo) {
  const salida = [];
  Object.entries(OBJETOS_LUGAR).forEach(([id, o]) => {
    if (o.sala !== sala || !lugaresDe(id, mundo).length) return;
    // En el capítulo de la inspección ya está el casero en persona: la llave espera a que se vaya.
    if (id === 'llave' && (ESTADO.capitulo || 0) === 6) return;
    const sprite = o.textura(scene);
    const altura = scene.textures.get(sprite).getSourceImage().height;
    salida.push({ id, tipo: 'lugar', sprite, x: o.x, y: o.y, escala: o.alto / altura, nombre: o.nombre });
  });
  return salida;
}

// ---------- La noche especial ----------

const PROB_MOD_PARTIDA = 0.35;

// El dueño del sitio: quién habla en la tarjeta y quién mira. (La furgo es de la aso: Palicaso.)
const DUENOS = {
  perico: 'Perico', palicaso: 'Palicaso', blancaso: 'Blancaso', pompa: 'La Pompa', cotine: 'Cotine',
  lasslow: 'Lasslow', m: 'Monchiman', llave: 'El casero', furgo: 'Palicaso',
};

const MODS_PARTIDA = [
  { id: 'record', titulo: 'Noche de récord', regla: 'si superas tu mejor marca, +50 monchis' },
  { id: 'invita', titulo: 'Palicaso invita', regla: 'monchis x1,5' },
  { id: 'publico', titulo: 'Con público', regla: 'te mira y, al final, te comenta (+10 si ganas)' },
  { id: 'reto', titulo: 'Reto: 3 estrellas o nada', regla: 'x2 si lo logras' },
  { id: 'tranquila', titulo: 'Noche tranquila', regla: 'paga normal, pero el resultado cuenta doble para tu noche' },
];

// Lo que dice cada dueño al plantear la noche especial (la sensación se ve, no se nombra).
const VOZ_MOD = {
  perico: {
    record: 'Pin pin. Hoy se bate una marca. Te lo juro. (Siempre lo juro.)',
    invita: '¿Palicaso invita? Pin pin. Yo ya lo sabía. Lo dije ayer.',
    publico: 'Me quedo mirando. Pin pin. Ni parpadeo. Ni respiro.',
    reto: 'Tres estrellas o nada. Pin pin. Y no me creáis, que lo digo en serio.',
    tranquila: 'Hoy se juega bajito. Pin pin. Que no se enteren las pipas.',
  },
  palicaso: {
    record: '¡Escucha, escucha! Hoy se bate una marca, lo noto, igual que cuando abrimos Unaké, que te lo cuento…',
    invita: '¡Escucha, escucha! Invito yo. Tú juegas. Yo hablo. Ya verás qué bien.',
    publico: '¡Escucha! Me siento aquí y lo veo todo, y mientras te voy contando una cosa…',
    reto: '¡Escucha, escucha! Tres estrellas o nada. Apuesto lo que quieras. Bueno, lo que quieras, no.',
    tranquila: '¡Escucha! Esta noche, tranqui. Te lo digo en voz baja. (Es mi voz baja.)',
  },
  blancaso: {
    record: 'He apuntado tu marca. Hoy la apunto otra vez. Si la superas, la apunto con boli rojo.',
    invita: 'Dice Palicaso que invita. Lo he apuntado. Otra vez no…',
    publico: 'Me quedo. Con la libreta. Es por si acaso.',
    reto: 'Tres estrellas o nada. Está apuntado. No hay vuelta atrás.',
    tranquila: 'Hoy cuadra todo, ya verás. Te lo apunto doble.',
  },
  pompa: {
    record: '…Ahora te contesto. ¿Una marca? Sí. Bueno. Vale.',
    invita: '…¿Invita Palicaso? Bien. Muy bien. Hace tres frases que lo pensé.',
    publico: '…Yo miro. No me muevo. Yo no, que exploto.',
    reto: '…Tres estrellas. O nada. Eso era… ¿hace un rato?',
    tranquila: 'Bajito. Hoy bajito. …Ya me estoy moviendo.',
  },
  cotine: {
    record: '¡Hoy se bate una marca! Y yo traigo algo de comer, por si acaso. ¿Qué? Tenía hambre.',
    invita: '¿Que invita Palicaso? Entonces me como el bocata ya. Cuenta con mi parte.',
    publico: 'Me quedo a mirar. Con un trozo de tarta. Uno chico. (Ya va por el tercero.)',
    reto: 'Tres estrellas o nada, ¿eh? Si sale mal, la tarta es para ti. Si no, también.',
    tranquila: 'Hoy tranqui. Me traigo un bocadillo… y otro de repuesto.',
  },
  lasslow: {
    record: 'Joven, hoy se bate una marca. Lo digo muy en serio. JA… perdón. Muy en serio.',
    invita: 'Un señor agradece la invitación. JAJA… es que me hace gracia que invite él.',
    publico: 'Permítame presenciarlo. Con la compostura que me caracteriza. Pfff.',
    reto: 'Tres estrellas o nada. Una cuestión de honor, caballero. JA.',
    tranquila: 'Esta noche, calma. Como los señores. Solo me río por dentro. Un poquito.',
  },
  m: {
    record: '¡Que no cunda el amarillo! Y hoy, que no cunda tu marca: supérala.',
    invita: 'Invita Palicaso: entonces nadie pasa hambre. Eso me gusta.',
    publico: 'Hoy hay testigos. Que nadie se quede solo, ni en una partida.',
    reto: 'Tres estrellas o nada. Yo no dejo a nadie atrás… pero hoy el reto es serio.',
    tranquila: 'Noche tranquila. Para ir despacio y no dejar a nadie.',
  },
  llave: {
    record: 'Una marca nueva. Qué sospechoso. Lo anoto.',
    invita: 'Si invita Palicaso, que lo apunte Blancaso. Yo solo miro.',
    publico: 'Hoy inspecciono con público. Esto no lo pone en ningún contrato.',
    reto: 'Tres estrellas o nada. Soy muy justo. Y muy exigente.',
    tranquila: 'Esta noche, inspección tranquila. No toquen nada.',
  },
  furgo: {
    record: '¡Escucha, escucha! La furgo está de estreno: hoy se bate la marca, o me como el volante.',
    invita: '¡Escucha, escucha! Hoy invito yo. La gasolina, no. La gasolina la pagas tú.',
    publico: '¡Escucha! Me subo de copiloto y te voy contando cosas por el camino.',
    reto: '¡Escucha, escucha! Tres estrellas o nada. En la furgo no se negocia. Bueno, un poco sí.',
    tranquila: '¡Escucha! Hoy, la furgo en segunda. Tranqui. Que no despertemos al barrio.',
  },
};

// Lo que comenta el invitado al final de una «noche con público».
const REACCION_PUBLICO = {
  perico: { bien: 'Pin pin. Lo he visto con mis ojos. No me lo creo ni yo.', normal: 'Pin pin. Ni tan mal. Se lo contaré a… nadie.', mal: 'Pin pin. Te lo había dicho. (No te lo había dicho.)' },
  palicaso: { bien: '¡Escucha, escucha! ¡Eso, eso, yo ya sabía que…! ¿Qué decía? Da igual. ¡Eso!', normal: '¡Escucha! Ha estado bien. Una vez mejor lo hice yo, te cuento…', mal: '¡Escucha, escucha! No pasa nada. Bueno, un poco sí. Te cuento una cosa que…' },
  blancaso: { bien: 'Apuntado. Con boli rojo. Y subrayado.', normal: 'Apuntado. Sin subrayar.', mal: 'Apuntado. Otra vez no…' },
  pompa: { bien: '…Bien. Muy bien. Hace un rato.', normal: '…Vale. Luego te digo.', mal: '…Yo no, que exploto. …Ánimo.' },
  cotine: { bien: '¡Qué bien! Esto se merece un trozo de tarta. ¿Qué? Entero.', normal: 'Bastante bien. Me ha dado hambre.', mal: 'No pasa nada. Toma mi bocata. Un mordisco chico.' },
  lasslow: { bien: 'Magistral, joven. Magistral. JAJA… perdón, es nervioso.', normal: 'Muy digno, caballero. Muy… JA.', mal: 'Un desastre digno. Pfff… no me río. Pfff.' },
  m: { bien: '¡Esto es un héroe de barrio! Que lo sepan todos.', normal: 'Bien hecho. Nadie se queda atrás.', mal: 'Levanta. Nadie se queda en el suelo. Otra.' },
  llave: { bien: 'Nada que objetar. Y es lo que más me molesta.', normal: 'Aceptable. Lo anoto.', mal: 'Sospechoso. Muy sospechoso.' },
  furgo: { bien: '¡Escucha, escucha! ¡Esa es nuestra furgo! ¡Y ese es nuestro conductor!', normal: '¡Escucha! Ni mal. Te cuento una de rutas que…', mal: '¡Escucha! A la furgo le ha dado un tirón. Te lo cuento luego.' },
};

// Elige (o no) la noche especial de esta partida. Guarda ESTADO.modPartida = { id, mision, sitio } o null.
// `forzar` es un id de MODS_PARTIDA: lo usan las pruebas.
function sortearModPartida(clave, sitio, forzar) {
  ESTADO.modPartida = null;
  if (!MISIONES[clave]) return null;
  let mod = forzar ? MODS_PARTIDA.find(m => m.id === forzar) : null;
  if (!mod) {
    // Solo al repetir (ya ganado una vez) y con un 35 % de probabilidad.
    if (stat(`gana_${clave}`) < 1 || Math.random() >= PROB_MOD_PARTIDA) return null;
    // Sin repetir el último que salió.
    const pool = MODS_PARTIDA.filter(m => m.id !== ESTADO.ultimoMod);
    mod = pool[Math.floor(Math.random() * pool.length)];
  }
  ESTADO.modPartida = { id: mod.id, mision: clave, sitio: sitio || 'm' };
  ESTADO.ultimoMod = mod.id;
  return mod;
}

// El texto de la noche especial para la tarjeta: { titulo, voz }.
function textoModPartida(modPartida) {
  const mod = MODS_PARTIDA.find(m => m.id === modPartida.id);
  if (!mod) return null;
  const sitio = VOZ_MOD[modPartida.sitio] ? modPartida.sitio : 'm';
  // «Palicaso invita» lo dice siempre Palicaso (es su noche); en el resto, el dueño del sitio.
  const voz = mod.id === 'invita' ? VOZ_MOD.palicaso.invita : VOZ_MOD[sitio][mod.id];
  const titulo = mod.id === 'publico' ? `Con público: ${DUENOS[sitio]} mira` : mod.titulo;
  return { titulo: `${titulo} · ${mod.regla}`, voz };
}

// Aplica la noche especial al acabar la partida. Se llama ANTES de `apuntar` (el récord anterior aún
// no se ha pisado). Devuelve { monchis, linea }; consume la noche especial (una sola vez).
function aplicarModPartida(clave, gana, puntos, monchis) {
  const mp = ESTADO.modPartida;
  ESTADO.modPartida = null;
  if (!mp || mp.mision !== clave) return { monchis, linea: '' };
  const sitio = REACCION_PUBLICO[mp.sitio] ? mp.sitio : 'm';
  switch (mp.id) {
    case 'record': {
      const supera = gana && puntos > leerRecord(clave) && leerRecord(clave) > 0;
      return supera ? { monchis: monchis + 50, linea: 'Noche de récord: ¡marca superada! +50 monchis' } : { monchis, linea: 'Noche de récord: la marca sigue en pie' };
    }
    case 'invita':
      return { monchis: Math.round(monchis * 1.5), linea: 'Palicaso invita: monchis x1,5' };
    case 'publico': {
      const r = REACCION_PUBLICO[sitio];
      const frase = !gana ? r.mal : estrellasDe(clave, puntos) >= 2 ? r.bien : r.normal;
      return { monchis: monchis + (gana ? 10 : 0), linea: `${DUENOS[sitio]}: «${frase}»` };
    }
    case 'reto': {
      const logrado = gana && estrellasDe(clave, puntos) >= 3;
      return logrado ? { monchis: monchis * 2, linea: 'Reto cumplido: ¡x2!' } : { monchis: 0, linea: 'Reto: sin tres estrellas no hay propina' };
    }
    case 'tranquila': {
      // Cuenta doble para los retos de la noche (partidas y victorias).
      sumarStat('partidas');
      if (gana) sumarStat('victorias');
      return { monchis, linea: 'Noche tranquila: esta partida cuenta doble para tu noche' };
    }
    default:
      return { monchis, linea: '' };
  }
}

// ---------- La furgo de la aso: punto de encargos secundarios que rotan ----------
//
// Contrato con la escena Furgo: irA(this, 'Furgo', { encargo: { id, titulo, cliente, carga, destino,
// distancia, probControl, premio: { monchis, hucha?, objeto? } } }). `cliente` es el id del personaje
// ('cotine'…); `clienteNombre` y `frase` son extra para las tarjetas. `desde` = capítulo (índice de
// CAPITULOS, 0 = cap. 1) en que el cliente ya está en la historia; el sorteo respeta el capítulo como el resto
// del contenido (elegirNuevo, encuentros.js). Si guiones/cap-furgo.js llega a definir ENCARGOS_FURGO, manda esa.
const ENCARGOS_FURGO_BASE = [
  { id: 'cajas', cliente: 'palicaso', titulo: 'Cajas para la barra', carga: 'normal', destino: 'Unaké (la barra)', distancia: 1, probControl: 0.3, desde: 0,
    premio: { monchis: 40, objeto: 'papel' }, frase: '¡Escucha, escucha! Cajas de la tienda de 24 h para la barra. Pesan poco. Bueno, pesan.' },
  { id: 'tarta', cliente: 'cotine', titulo: 'La tarta del cumpleaños', carga: 'fragil', destino: 'El cumpleaños de Blancaso', distancia: 2, probControl: 0.2, desde: 1,
    premio: { monchis: 60 }, frase: 'Una tarta entera. No la mires. No la huelas. No… ¿qué? No me la he comido.' },
  { id: 'mareado', cliente: 'blancaso', titulo: 'Blancaso, a casa', carga: 'pasajero', destino: 'La casa de Blancaso', distancia: 2, probControl: 0.15, desde: 2,
    premio: { monchis: 45 }, frase: 'Llévame a casa. Sin curvas. Sin frenazos. Sin… ay.' },
  { id: 'reparto', cliente: 'palicaso', titulo: 'Reparto grande de monchis', carga: 'normal', destino: 'Medio barrio', distancia: 3, probControl: 0.5, desde: 2,
    premio: { monchis: 110 }, frase: '¡Escucha! Monchis para medio barrio, en una sola vuelta. Y, ojo, que esta noche hay control. Te cuento…' },
  { id: 'cita', cliente: 'lasslow', titulo: 'Un señor a su cita', carga: 'pasajero', destino: 'El café de la cita', distancia: 2, probControl: 0.1, desde: 3,
    premio: { monchis: 50, hucha: 10 }, frase: 'Joven, un señor no llega a su cita a pie. Llega puntual y en furgo. JA… perdón.' },
  { id: 'discos', cliente: 'pompa', titulo: 'Los discos de la Pompa', carga: 'fragil', destino: 'El techo de la Pompa', distancia: 3, probControl: 0.4, desde: 3,
    premio: { monchis: 80, hucha: 15 }, frase: '…Los discos. Hay que ir a por ellos. …Despacio. …Que no se rayen.' },
];

function listaEncargosFurgo() {
  return typeof ENCARGOS_FURGO !== 'undefined' && Array.isArray(ENCARGOS_FURGO) && ENCARGOS_FURGO.length ? ENCARGOS_FURGO : ENCARGOS_FURGO_BASE;
}

// ¿Hay encargos? Desde que ganaste Furgo una vez, y solo si el minijuego existe.
function furgoConEncargos() { return !!MISIONES.Furgo && stat('gana_Furgo') >= 1; }

function encargoFurgoPorId(id) {
  const e = listaEncargosFurgo().find(x => x.id === id) || ENCARGOS_FURGO_BASE.find(x => x.id === id);
  return e ? datosEncargoFurgo(e) : null;
}

// Lo que recibe la escena Furgo (más los extra de las tarjetas).
function datosEncargoFurgo(e) {
  const n = typeof QUIEN !== 'undefined' && QUIEN[e.cliente] ? QUIEN[e.cliente].nombre : e.cliente;
  return {
    id: e.id, titulo: e.titulo, cliente: e.cliente, clienteNombre: n, carga: e.carga, destino: e.destino,
    distancia: e.distancia, probControl: e.probControl, premio: { ...e.premio }, frase: e.frase,
  };
}

// Los encargos de ahora: 3 a la vez, que rotan. La oferta se guarda en la partida (ESTADO.furgoOferta);
// al coger uno sale otro distinto, sacado con la memoria de vistos (elegirNuevo) y respetando el capítulo.
function encargosFurgoAbiertos(n = 3) {
  const lista = listaEncargosFurgo();
  let oferta = Array.isArray(ESTADO.furgoOferta) ? ESTADO.furgoOferta.filter(id => lista.some(e => e.id === id)) : [];
  // Los que aún no tocan por capítulo se van; los que faltan se rellenan.
  oferta = oferta.filter(id => disponible(lista.find(e => e.id === id)));
  for (let intentos = 0; oferta.length < n && intentos < 12; intentos++) {
    const e = elegirNuevo('furgo.encargos', lista);
    if (e && disponible(e) && !oferta.includes(e.id)) oferta.push(e.id);
  }
  ESTADO.furgoOferta = oferta;
  return oferta.map(id => datosEncargoFurgo(lista.find(e => e.id === id)));
}

// Se coge un encargo: sale de la oferta y ya se rellenará con otro distinto.
function tomarEncargoFurgo(id) {
  ESTADO.furgoOferta = (ESTADO.furgoOferta || []).filter(x => x !== id);
  sumarStat('encargosFurgo');
}

// Texto del premio para las tarjetas.
function textoPremioEncargo(p) {
  return [p.monchis ? `${p.monchis} monchis` : '', p.hucha ? `${p.hucha} a la hucha` : '', p.objeto ? `y ${p.objeto}` : ''].filter(Boolean).join(' · ');
}

// Problemas opcionales del barrio con un paso de furgo, con el mismo formato que SITUACIONES (situaciones.js).
// `encargo` del paso = id de un encargo de la lista: barrio.js (lanzar) se lo pasa a la escena Furgo.
// Cómo engancharlo (lo hace quien toque situaciones.js): al buscar plantillas de un personaje, añadir
// `...(MISIONES.Furgo && stat('gana_Furgo') >= 1 ? (SITUACIONES_FURGO[id] || []) : [])` a SITUACIONES[id].
const SITUACIONES_FURGO = {
  palicaso: [{
    id: 'furgo-cajas', desde: 2, titulo: 'Las cajas de la furgo',
    textos: ['«¡Escucha, escucha! Las cajas del género están en la tienda de 24 h. Con la furgo vamos en una vuelta. ¿Conduces?»'],
    pasos: [{ mision: 'Furgo', encargo: 'cajas' }], premio: { monchis: [30, 50], bolsita: [1, 1] },
  }],
  cotine: [{
    id: 'furgo-tarta', desde: 2, titulo: 'Una tarta a domicilio',
    textos: ['«Hay una tarta entera para el cumpleaños. Si la llevas en la furgo, te dejo un trozo. Uno. Chico.»'],
    pasos: [{ mision: 'Furgo', encargo: 'tarta' }], premio: { monchis: [30, 55], papel: [1, 1] },
  }],
  lasslow: [{
    id: 'furgo-cita', desde: 3, titulo: 'Un señor y su cita',
    textos: ['«Joven, tengo una cita. Un señor no llega a una cita sudado. Furgo, por favor. Con ventanillas.»'],
    pasos: [{ mision: 'Furgo', encargo: 'cita' }], premio: { monchis: [35, 55], hucha: [10, 20] },
  }],
};

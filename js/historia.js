// La historia: «La noche más larga de Unaké» (arco aprobado para el juego el 29/10/2026, ver
// 07_juego/arco-propuesta.md). Tres actos y ocho capítulos con objetivos que se comprueban solos.
// El hilo: el casero sube el alquiler y, si la aso no junta 1.000 monchis en la hucha, cierra Unaké.
// Cada capítulo empieza con una escena en cómic y se cierra con su momento persona (a alguien se le
// limpian los ojos) y el último chiste para el estado. Al acabar, modo libre.
// PROPUESTA de guion para el juego: nada de esto es canon de la serie.

const META_HUCHA = 1000;

function stat(k) { return (ESTADO.stats && ESTADO.stats[k]) || 0; }
function sumarStat(k, n = 1) {
  ESTADO.stats = ESTADO.stats || {};
  ESTADO.stats[k] = stat(k) + n;
  guardarPartida();
}
// Lo que se ha hecho desde que empezó el capítulo en curso (la foto se toma al acabar su escena).
function desdeCap(k) { return stat(k) - ((ESTADO.baseCap && ESTADO.baseCap[k]) || 0); }
function estrellasDeMision(k) { return ESTADO.estrellas[k] || 0; }

const CAPITULOS = [
  // ---------- Acto I · La aso ----------
  {
    id: 'una-que',
    titulo: '¿Una qué?',
    arte: 'cap-cap1',
    intro: [
      // La idea del juego, antes que nada: los dos mundos.
      ['narrador', 'Esto es el barrio. De día es un barrio normal: la tienda, la plaza, gente con prisa.'],
      ['narrador', 'Pero cuando fumas y te hace efecto, pasas al MUNDO HUMO: el mismo barrio, de noche, con neones, nubes… y Unaké abierto.'],
      ['vuper', 'Anoche estuve allí. Quiero volver. Dicen que en Unaké, la aso del barrio, se está de lujo. Solo entra quien se sabe la contraseña.'],
      // El bucle de la contraseña, tal cual el E00 (guion-v1-canon.md).
      ['perico', '¿Contraseña? ¿Contraseña?'],
      ['vuper', 'Unaké.'],
      ['perico', '¿Una qué?'],
      ['vuper', 'Una aso.'],
      ['perico', '¿De quién?'],
      ['vuper', 'De los hermanos Aso, Palicaso y Blancaso, que tienen Unaké.'],
      ['perico', '¿Una qué?'],
      ['narrador', 'Vuper abre la boca… y la cierra. Está en un bucle.'],
      ['narrador', 'Para fumar hace falta papel, boquilla, mechero y la bolsita de la aso. Y para todo eso, monchis. Vamos paso a paso.'],
    ],
    objetivos: [
      { texto: 'Gana monchis: haz un encargo de la tienda de 24 h', hecho: () => stat('entregas') >= 1 },
      { texto: 'Entra en Unaké: Perico pide la contraseña', hecho: () => ESTADO.dentro },
      { texto: 'Lía y fuma en el sofá: vuelve al mundo humo', hecho: () => stat('fumadas') >= 1 },
    ],
    // Momento persona de Perico (y siembra del cap. 6).
    cierre: [
      ['perico', 'Pasa, pasa. Pero que conste que te he visto, rider.'],
      ['vuper', '¿Visto el qué?'],
      ['perico', 'Pin pin.'],
      ['narrador', 'Bienvenido al mundo humo. Aquí están las misiones (los «!» sobre la gente) y todo paga más.'],
      ['narrador', 'Mira las barras de arriba: el COLOCÓN baja solo, y cuando se acaba vuelves al día. El HAMBRE sube: come en la tienda o perderás VIDA.'],
      ['vuper', 'Vale, vale… ¿Y ahora qué?'],
      ['narrador', 'Ahora el barrio es tuyo. Tus objetivos, arriba a la derecha. Tus logros, en «Logros». Y la historia acaba de empezar.'],
    ],
    premio: 30,
  },
  {
    id: 'cuota',
    titulo: 'La cuota de la aso',
    arte: 'cap-cap2',
    intro: [
      ['palicaso', '¡Escucha, escucha! Ya eres de la aso, rider. Aquí cada uno tiene su puesto.'],
      ['blancaso', 'No hay nada que celebrar. Ha llegado carta del casero: nos sube el alquiler.'],
      ['blancaso', 'O juntamos 1.000 monchis en la hucha, o cierra Unaké. Yo llevo las cuentas: lo que aportes, me lo das a mí, en la plaza.'],
      ['palicaso', '¿Una qué?'],
      ['blancaso', 'Otra vez no…'],
      // Siembra del cap. 5: nadie le escucha.
      ['palicaso', '¡Escucha! Tengo un plan para salvar el bar: una máquina tragaperras. La pongo en la tienda y…'],
      ['blancaso', 'No.'],
      ['palicaso', '…si ni me has escuchado.'],
      ['palicaso', 'Bueno. Pues otra cosa: si mejoramos el local, viene más gente y la caja se llena sola. Mira el negocio, en la barra.'],
    ],
    situaciones: [['palicaso', 'genero']],
    objetivos: [
      { texto: 'Palicaso: se acaba el género (búscale y sirve la barra)', hecho: () => stat('sit_genero') >= 1 },
      { texto: 'De noche, ayuda a Cotine con la tarta (1 estrella)', hecho: () => estrellasDeMision('Tarta') >= 1 },
      { texto: 'Invierte en el negocio: compra una mejora (en la barra)', hecho: () => cuentasNegocio().total >= 1 },
      { texto: 'Aporta 100 monchis a la hucha (Blancaso, en la plaza)', hecho: () => ESTADO.hucha >= 100 },
    ],
    // Momento persona de Blancaso: su deseo.
    cierre: [
      ['blancaso', 'Algún día me sentaré ahí, en mi sofá, a disfrutar de mi propio bar. Solo eso.'],
      ['palicaso', '¡Escucha! Hoy mismo, si quieres. Y mientras te cuento una cosa…'],
      ['blancaso', 'Otra vez no…'],
    ],
    premio: 40,
  },

  // ---------- Acto II · Todo se tuerce ----------
  {
    id: 'blancazo',
    titulo: 'El blancazo',
    arte: 'cap-cap3',
    intro: [
      ['blancaso', 'Hoy me lo merezco. Esta noche me siento en mi sofá y disfruto de mi bar.'],
      ['lasslow', 'Caballero, eso hay que celebrarlo. JA… perdón.'],
      ['narrador', 'Nadie olvida la noche que estuvo de Blancaso.'],
    ],
    objetivos: [
      { texto: 'En el sofá, pásale el porro a Blancaso (P)', hecho: () => stat('blancasoFumo') >= 1 },
      { texto: 'Salva a Blancaso de Puky', hecho: () => stat('blancazos') >= 1 },
    ],
    // Momento persona de Puky: lo único que quiere.
    cierre: [
      ['puky', 'Yo solo quería que me invitarais…'],
      ['blancaso', '¿A ti? …Bueno. Algún día.'],
      ['puky', '¿Me llamabais? ¿Ya? ¿Ahora?'],
      ['blancaso', 'Otra vez no…'],
    ],
    premio: 60,
  },
  {
    id: 'senor',
    titulo: 'Un señor ante el casero',
    arte: 'cap-cap4',
    intro: [
      ['blancaso', 'Gracias… otra vez. Pero el casero viene a cenar para inspeccionar, y se me han volado sus facturas.'],
      ['casero', 'Buenas. Soy el casero. El jueves ceno aquí y veo el local. Y las cuentas.'],
      ['lasslow', 'Para una cena con el casero hace falta un señor. Y el señor soy yo. Si encuentro mi pajarita.'],
      ['perico', 'Pin pin. He oído que en tu cuarto inventas cosas, rider. Cosas de héroe.'],
      ['palicaso', '¡Escucha! Si la hucha no llega, en la tienda he puesto una tragaperras, y en la plaza se apuesta a las carreras. Paga. A veces.'],
    ],
    situaciones: [['lasslow', 'pajarita'], ['blancaso', 'facturas']],
    objetivos: [
      { texto: 'Lasslow: encuentra su pajarita y aguanta la cena', hecho: () => stat('sit_pajarita') >= 1 },
      { texto: 'Blancaso: las facturas del casero', hecho: () => stat('sit_facturas') >= 1 },
      { texto: 'Compra un invento en el taller de tu cuarto', hecho: () => Object.keys(ESTADO.inventos).length >= 1 },
      { texto: 'Sube Unaké a «Bareto» (nivel 5 del negocio)', hecho: () => cuentasNegocio().total >= 5, progreso: () => `${cuentasNegocio().total}/5` },
      { texto: 'Hucha de la aso: 400 monchis', hecho: () => ESTADO.hucha >= 400, progreso: () => `${ESTADO.hucha}/400` },
    ],
    // Momento persona de Lasslow (un señor de verdad)… y el estado se queda el último chiste.
    cierre: [
      ['casero', 'La cena, correcta. El caballero, muy caballero. Ese olor, no tanto.'],
      ['lasslow', 'Ha sido el periquito.'],
      ['casero', 'Volveré. De noche. A ver qué es esto de una aso de verdad.'],
    ],
    premio: 80,
  },
  {
    id: 'caja',
    titulo: 'La caja',
    intro: [
      ['blancaso', 'La hucha no cuadra. Faltan monchis. Muchos.'],
      ['lasslow', 'Caballeros, yo solo he cogido un caramelo. Y una servilleta.'],
      ['blancaso', 'La tragaperras de la tienda queda precintada hasta que sepa qué ha pasado.'],
      ['palicaso', '¡Escucha, escucha! Seguro que hay una explicación. Una muy larga.'],
      ['narrador', 'Perico se entera de todo lo que pasa en el barrio. Alguien tendría que preguntarle.'],
    ],
    // Desaparece parte de la hucha: Palicaso se la ha jugado en su máquina.
    alEmpezar: () => {
      const falta = Math.min(150, ESTADO.hucha || 0);
      ESTADO.hucha -= falta;
      ESTADO.faltaCaja = falta;
      ESTADO.precinto = true;
    },
    situaciones: [['blancaso', 'caja']],
    objetivos: [
      { texto: 'Cuadra la caja con Blancaso (gana «La caja no cuadra»)', hecho: () => desdeCap('gana_Cuentas') >= 1 },
      { texto: 'Pregúntale a Perico quién va a la tienda a las cuatro', hecho: () => stat('pistaCaja') >= 1 },
      { texto: 'Pilla a Palicaso: gánale a El farol (en la barra)', hecho: () => stat('gana_Farol') >= 1 },
    ],
    // Momento persona de Palicaso: por una vez, le escuchan.
    cierre: [
      ['palicaso', '…'],
      ['narrador', 'Por primera vez en su vida, Palicaso no dice nada.'],
      ['palicaso', 'Lo de la máquina era para salvar el bar. Lo dije. Nadie me escuchó.'],
      ['vuper', 'Yo te escucho.'],
      ['palicaso', '¿Sí? …Pues escucha, escucha, que esto tiene historia…'],
      ['blancaso', 'Otra vez no…'],
    ],
    premio: 90,
  },
  {
    id: 'perico',
    titulo: 'Perico lo sabe',
    intro: [
      ['perico', '¡VUPER ES MONCHIMAN! ¡VUPER ES MONCHIMAN!'],
      ['lasslow', 'JA… JAJAJA. Perdón. JAJAJA.'],
      ['palicaso', '¡Escucha! ¿Quieres pipas, periquito?'],
      ['perico', 'Pin pin.'],
      ['blancaso', 'El casero vuelve esta semana. Si oye esto, nos cierra por locos.'],
      ['vuper', 'Vale, vale… Habrá que callarle. Y hablar con él.'],
    ],
    situaciones: [['perico', 'apuesta']],
    objetivos: [
      { texto: 'Calla a Perico: gánale a ¡Periquito! (en la puerta, de noche)', hecho: () => stat('gana_Periquito') >= 1 },
      { texto: 'Gánale la apuesta de pipas a Perico', hecho: () => stat('sit_apuesta') >= 1 || desdeCap('gana_Pipas') >= 1 },
      { texto: 'De día, habla con Perico a solas', hecho: () => stat('secretoPerico') >= 1 },
      { texto: 'Hucha de la aso: 550 monchis', hecho: () => ESTADO.hucha >= 550, progreso: () => `${ESTADO.hucha}/550` },
    ],
    cierre: [
      ['perico', 'Oye, rider. ¿Pipa?'],
      ['vuper', 'Vale.'],
      ['perico', 'Era la última. Ahora me debes una. Pin pin.'],
    ],
    premio: 100,
  },

  // ---------- Acto III · La noche más larga ----------
  {
    id: 'inspeccion',
    titulo: 'La inspección',
    intro: [
      ['narrador', 'La noche de la inspección, a medio barrio le da un amarillo. La M de tu cuarto parpadea.'],
      ['casero', 'Buenas noches. Vengo a ver esta aso. Por dentro. Y a fondo.'],
      ['pompa', '…Y yo pincho esta noche. Si alguien recupera mis discos. El casero se los quedó de fianza.'],
      ['vuper', 'Vale, vale… Nadie sabe que soy yo. Que siga así.'],
    ],
    objetivos: [
      { texto: 'Recupera los discos de la Pompa: cuélate de día en casa del casero (habla con la Pompa)', hecho: () => stat('gana_Sigilo') >= 1 },
      { texto: 'Pasa la inspección del casero (está en Unaké, de noche)', hecho: () => stat('gana_Inspeccion') >= 1 },
      { texto: 'Al casero le ha dado un amarillo: la M de tu cuarto (rescate)', hecho: () => desdeCap('gana_Rescate') >= 1 },
      { texto: 'Unaké tiene que aguantar una inspección: «Bareto» (nivel 5)', hecho: () => cuentasNegocio().total >= 5, progreso: () => `${cuentasNegocio().total}/5` },
      { texto: 'Hucha de la aso: 750 monchis', hecho: () => ESTADO.hucha >= 750, progreso: () => `${ESTADO.hucha}/750` },
    ],
    cierre: [
      ['casero', '¿Qué… qué ha pasado? Estaba en el sofá, todo daba vueltas, y luego… patatas.'],
      ['blancaso', 'Ha venido Monchiman. Viene cuando hace falta.'],
      ['casero', 'Pues este sitio cuida de la gente. El alquiler, lo que tengáis en la hucha. Y no se lo contéis a nadie.'],
      ['palicaso', '¡Escucha, escucha! ¿Eso es un sí?'],
      ['casero', 'Es un «no me hagáis volver».'],
    ],
    premio: 120,
  },
  {
    id: 'epica',
    titulo: 'La noche épica',
    intro: [
      ['blancaso', 'Faltan los últimos. Si llegamos a mil, esta noche… me siento.'],
      ['cotine', 'Y yo hago una tarta. Entera. Para ti. Te lo juro.'],
      ['perico', 'Pin pin. Me apuesto mis pipas a que se la come.'],
      ['palicaso', '¡Escucha! Si se salva el bar, fiesta. Y si no, también. Pero menos.'],
    ],
    objetivos: [
      { texto: 'Cotine sirve una tarta entera (Tarta, 2 estrellas)', hecho: () => estrellasDeMision('Tarta') >= 2 },
      { texto: `Completa la hucha: ${META_HUCHA} monchis`, hecho: () => ESTADO.hucha >= META_HUCHA, progreso: () => `${ESTADO.hucha}/${META_HUCHA}` },
    ],
    // El final: la noche que estuvo de Blancaso, esta vez por buena. Momento persona de Vuper.
    cierre: [
      ['blancaso', 'Mil. Unaké se queda.'],
      ['cotine', 'Tu tarta. Entera. No le falta nada. …Casi nada.'],
      ['palicaso', '¡Escucha, escucha! ¡Un brindis! ¡Por Monchiman, que le salvó la vida al casero!'],
      ['lasslow', '¡Por Monchiman! JAJAJA.'],
      ['blancaso', 'Y por Vuper. Que siempre está, aunque nadie le vea.'],
      ['narrador', 'Nadie olvida la noche que estuvo de Blancaso. Esta vez, por buena.'],
      ['lasslow', '¡Que se me ha escapao!'],
    ],
    premio: 0,
    final: true,
  },
];

// ---------- Identificadores estables de capítulo ----------
// Cada capítulo lleva un `id` que NO cambia nunca. Todo el código (comparaciones, `desde`/`hasta`,
// tablas por capítulo, partidas guardadas) habla en ids, no en posiciones: así se pueden insertar
// capítulos entre los actuales sin desplazar nada. El orden definitivo previsto, para cuando se
// inserten (los que aún no están en CAPITULOS cuentan como «futuro» en las ayudas de abajo):
//   una-que, cuota, pompa, blancazo, mejor-amigo, senor, nuevo, caja, escucha, perico, furgo,
//   feria, senal, miron, breathe, mechero, inspeccion, pesado, epica
// Un id nuevo se coloca en su sitio dentro de CAPITULOS y listo; ningún `desde` hay que tocarlo.
const MODO_DEV = ['localhost', '127.0.0.1', 'unake.test', ''].includes(location.hostname) || /[?&]dev\b/.test(location.search);

// Posición de un capítulo en CAPITULOS. Infinity si aún no existe; 'libre' (modo libre) va tras el último.
function capIdx(id) {
  if (id === 'libre') return CAPITULOS.length;
  const i = CAPITULOS.findIndex(c => c.id === id);
  return i < 0 ? Infinity : i;
}
// Id del capítulo en curso, o 'libre' si la historia ya acabó.
function capId() {
  return historiaAcabada() ? 'libre' : (capituloActual().id || 'libre');
}
function enCap(id) { return capId() === id; }
// El capítulo en curso es `id` o uno posterior. Un capítulo que no existe todavía no se ha alcanzado.
function desdeCapId(id) { return (ESTADO.capitulo || 0) >= capIdx(id); }
// Todavía no hemos llegado a `id`. Un capítulo que no existe todavía es futuro.
function antesDeCap(id) { return (ESTADO.capitulo || 0) < capIdx(id); }
// Admite un id o (por compatibilidad, avisando en desarrollo) un índice numérico.
function capIdxDe(v) {
  if (typeof v === 'number') {
    if (MODO_DEV) console.warn('[historia] desde/hasta numérico (' + v + '): usa el id del capítulo');
    return v;
  }
  return capIdx(v);
}
// ¿El capítulo en curso es `v` o posterior? `v` es un id (lo normal) o un índice viejo.
function desdeCapRef(v) { return (ESTADO.capitulo || 0) >= capIdxDe(v); }
// Pasa al capítulo siguiente (o al modo libre tras el último) y deja los ids y el índice sincronizados.
function avanzarCap() {
  const n = (ESTADO.capitulo || 0) + 1;
  ESTADO.capId = n >= CAPITULOS.length ? 'libre' : CAPITULOS[n].id;
  ESTADO.capitulo = n >= CAPITULOS.length ? CAPITULOS.length : n;
  guardarPartida();
}
function terminarHistoria() {
  ESTADO.capId = 'libre';
  ESTADO.capitulo = CAPITULOS.length;
}
// Apunta que la escena de entrada del capítulo en curso ya se ha visto.
function marcarIntroVista() {
  ESTADO.introCapId = capId();
  ESTADO.introCap = ESTADO.capitulo || 0;
}
// ¿Se ha visto ya la escena de entrada del capítulo en curso?
function introVistaDeCap() {
  return ESTADO.introCapId === capId();
}

// Partidas de antes del arco de 8 capítulos: quien iba por el 5 o más empieza en «La caja».
if (ESTADO.arco !== 2) {
  if ((ESTADO.capitulo || 0) >= 4) { ESTADO.capitulo = 4; ESTADO.introCap = 3; }
  ESTADO.arco = 2;
}

// Migración de partidas (capVersion 2): antes se guardaba un índice (0-7; 8 = modo libre), que se
// traduce con esta tabla FIJA (no depende de CAPITULOS). Desde ahí manda el id y los índices
// (`capitulo`, `introCap`) se recalculan en cada carga, así que insertar un capítulo no mueve a nadie.
const CAP_IDS_V1 = ['una-que', 'cuota', 'blancazo', 'senor', 'caja', 'perico', 'inspeccion', 'epica'];
function migrarCapitulos() {
  if (ESTADO.capVersion !== 2) {
    const i = ESTADO.capitulo || 0;
    ESTADO.capId = i >= CAP_IDS_V1.length ? 'libre' : (CAP_IDS_V1[i] || CAP_IDS_V1[0]);
    const j = ESTADO.introCap;
    ESTADO.introCapId = (j === undefined || j === null || j < 0) ? null : (j >= CAP_IDS_V1.length ? 'libre' : CAP_IDS_V1[j]);
    ESTADO.capVersion = 2;
  }
  // El id manda: recalcula los índices derivados.
  if (ESTADO.capId === 'libre') ESTADO.capitulo = CAPITULOS.length;
  else if (capIdx(ESTADO.capId) !== Infinity) ESTADO.capitulo = capIdx(ESTADO.capId);
  else ESTADO.capId = (CAPITULOS[Math.min(ESTADO.capitulo || 0, CAPITULOS.length - 1)] || {}).id || CAP_IDS_V1[0]; // id desconocido: conserva la posición
  if (ESTADO.introCapId === null || ESTADO.introCapId === undefined) ESTADO.introCap = -1;
  else if (capIdx(ESTADO.introCapId) !== Infinity) ESTADO.introCap = capIdx(ESTADO.introCapId);
  else ESTADO.introCap = -1;
}
// ESTADO.tarea viaja con el id del capítulo; si no corresponde al capítulo en curso (o es de antes), se descarta.
function migrarTarea() {
  const T = ESTADO.tarea;
  if (!T) return;
  if (typeof T.cap === 'number') T.cap = T.cap >= CAP_IDS_V1.length ? 'libre' : CAP_IDS_V1[T.cap];
  if (T.cap !== capId() || !esDeTareas(capituloActual())) ESTADO.tarea = null;
  else { T.hablados = T.hablados || []; T.base = T.base || {}; T.hechos = T.hechos || 0; T.total = T.total || 0; T.fase = T.fase || 'antes'; }
}
migrarCapitulos();
migrarTarea();
// Al guardar: los ids reflejan el índice en curso (lo que viaja en la partida es el id).
function sincronizarCapId() {
  if (ESTADO.capVersion !== 2) return;
  ESTADO.capId = capId();
  const c = (ESTADO.introCap ?? -1) >= 0 ? CAPITULOS[ESTADO.introCap] : null;
  ESTADO.introCapId = (ESTADO.introCap ?? -1) >= (CAPITULOS.length) ? 'libre' : (c ? c.id : null);
}

// ---------- Motor de tareas ----------
// Los capítulos viejos llevan `objetivos` (todos a la vez). Los nuevos llevan `tareas`, en orden y de una en una
// (formato de guiones/actos-1-2.js, tal cual): { id, texto, tipo, minijuego?, antes, despues, pista } más, en el capítulo,
// `giro` y `giroTras` (número de tareas cumplidas tras el cual sale el giro). Todo lo que el guion no trae se deduce
// (a quién hablar, qué recoger, qué comprar) con las reglas de aquí abajo; cualquier tarea puede fijarlo con
// `con`, `recoger`/`n`/`salas`, `objeto` o `pistaDe`.
// Estado guardado: ESTADO.tarea = { cap: id, i, base, fase, hechos, total, hablados, objeto, ... }
//   fase: 'antes' (hay que contar su escena) · 'activa' (en juego) · 'despues' (cumplida: toca su escena).
//   base: foto de los contadores al activarla, para que «gana_X» cuente desde ahí y no lo de antes.
let TAREA_PISTA_MS = 180000; // sin avanzar tanto rato, sale la pista (Niebla, o un aviso si aún no está)

const PERSONAJES_TAREA = [['pompa', /\bPompa\b/], ['puky', /\bPuky\b/], ['lasslow', /\bLasslow\b/], ['perico', /\bPerico\b/],
  ['palicaso', /\bPalicaso\b/], ['blancaso', /\bBlancaso\b/], ['cotine', /\bCotine\b/], ['niebla', /\bNiebla\b/]];
// Quién da cada minijuego cuando el texto no deja claro (si no, el primero que nombra el texto).
const MINIJUEGO_CON = { EnSuPunto: 'pompa', DJ: 'pompa', PorDebajo: 'puky', Rendija: 'puky', Cuentas: 'blancaso', Compostura: 'lasslow', Escucha: 'palicaso', Barra: 'palicaso' };
// Cosas que se compran para un recado (tienda de 24 h); `arte` se resuelve al pintar (arteO en barrio.js).
const OBJETOS_RECADO = { cerrojo: { nombre: 'Cerrojo grande', precio: 25, efecto: 'Recado de Blancaso', arte: 'obj-cerrojo' } };
// Cosas nuevas para recoger (las de situaciones.js se usan tal cual).
const RECOGIBLES_TAREA = {
  agua: { sprite: 'obj-botella-agua', respaldo: 'lata', nombre: 'agua', escala: 0.5 },
  sal: { sprite: 'obj-bolsa-salado', respaldo: 'patatas', nombre: 'algo salado', escala: 0.5 },
  flor: { sprite: 'obj-flor-humo', respaldo: 'caramelo', nombre: 'flor', escala: 0.5 },
  paquete: { sprite: 'obj-caja', respaldo: 'caja', nombre: 'paquete', escala: 0.6 },
};
function recogibleDe(tipo) {
  return (typeof RECOGIBLES !== 'undefined' && RECOGIBLES[tipo]) || RECOGIBLES_TAREA[tipo];
}
const SALAS_POR_PALABRA = [[/plaza/i, 'plaza'], [/tienda/i, 'tienda'], [/Unak[eé]|barra|dentro/i, 'dentro'], [/cocina/i, 'cocina'],
  [/reservado/i, 'reservado'], [/puerta/i, 'fuera'], [/parque/i, 'plaza'], [/ba[nñ]os?/i, 'bano']];

function sinParentesis(txt) { return (txt || '').replace(/\([^)]*\)/g, ' '); }
function tareaDe(cap) { return cap && Array.isArray(cap.tareas) ? cap.tareas : null; }
function esDeTareas(cap) { return !!tareaDe(cap); }
// De día / de noche, si el texto lo pide (los tipos `dia` siempre son de día).
function mundoDeTarea(t) {
  if (t.tipo === 'dia') return 'normal';
  const x = t.texto || '';
  if (/\bde d[ií]a\b/i.test(x)) return 'normal';
  if (/\bde noche\b/i.test(x)) return 'humo';
  return null;
}
// Todos los personajes que nombra el texto (sin lo de entre paréntesis), en orden de aparición.
function nombradosEnTexto(txt) {
  let x = sinParentesis(txt);
  // «Pregunta a A, a B y a C quién conoce a D»: D es el tema, no con quien se habla.
  const tema = x.search(/\b(qui[eé]n|qu[eé]|c[oó]mo|d[oó]nde|cu[aá]ndo|si)\b/i);
  if (tema > 0 && PERSONAJES_TAREA.some(([, re]) => re.test(x.slice(0, tema)))) x = x.slice(0, tema);
  return PERSONAJES_TAREA.map(([id, re]) => [id, x.search(re)]).filter(([, p]) => p >= 0).sort((a, b) => a[1] - b[1]).map(([id]) => id);
}
// Quién dice la pista: `pistaDe`; «(Nombre)» al final; su muletilla; o con quien se habla.
function quienDicePista(t) {
  if (t.pistaDe) return t.pistaDe;
  const p = t.pista || '';
  const fin = /\(([A-ZÁÉÍÓÚ][a-záéíóúñ]+)\)\s*$/.exec(p);
  if (fin) { const m = PERSONAJES_TAREA.find(([, re]) => re.test(fin[1])); if (m) return m[0]; }
  if (/Escucha|no te la he contado/i.test(p)) return 'palicaso';
  if (/Pin pin/i.test(p)) return 'perico';
  if (/Blurp|Aquí abajo/i.test(p)) return 'puky';
  if (/\bjoven\b|Un señor/i.test(p)) return 'lasslow';
  if (/Lo apunto|Otra vez no/i.test(p)) return 'blancaso';
  const n = nombradosEnTexto(t.texto);
  if (t.tipo === 'minijuego') return MINIJUEGO_CON[t.minijuego] || n[0] || null;
  return n[0] || null;
}
// Con quién se cumple o se juega la tarea (ids). charla/dia: todos los que nombra el texto; minijuego: el suyo;
// recoger/recado/flashback: nadie (los que dan la pista se resuelven con quienDicePista).
function conDeTarea(t) {
  if (t.con) return [].concat(t.con);
  if (t.tipo === 'charla' || t.tipo === 'dia') return nombradosEnTexto(t.texto);
  if (t.tipo === 'minijuego') return [MINIJUEGO_CON[t.minijuego] || nombradosEnTexto(t.texto)[0]].filter(Boolean);
  return [];
}
// Qué hay que recoger: [{ tipo, sala }…]. `recoger` (+ `n`, `salas`) manda; si no, se deduce del texto.
function recogerDeTarea(t) {
  const lista = [];
  const mete = (tipo, salas, n) => { for (let k = 0; k < n; k++) lista.push({ tipo, sala: salas[k % salas.length] }); };
  const x = t.texto || '';
  const salasDe = () => [...new Set(SALAS_POR_PALABRA.filter(([re]) => re.test(x)).map(([, s]) => s))];
  if (t.recoger) {
    const salas = t.salas || salasDe();
    [].concat(t.recoger).forEach(r => (typeof r === 'string' ? mete(r, salas.length ? salas : ['plaza', 'tienda'], t.n || 3) : mete(r.tipo, r.salas || salas, r.n || 1)));
    return lista;
  }
  if (/\bagua\b/i.test(x) || /salad/i.test(x)) {
    if (/\bagua\b/i.test(x)) mete('agua', ['dentro'], 1);
    if (/salad/i.test(x)) mete('sal', ['tienda'], 1);
  } else if (/pajarita/i.test(x)) mete('pajarita', salasDe().length ? salasDe() : ['plaza', 'tienda', 'dentro'], 3);
  else if (/flor/i.test(x)) mete('flor', salasDe().length ? salasDe() : ['plaza', 'tienda'], 6);
  else mete('paquete', salasDe().length ? salasDe() : ['plaza', 'tienda', 'fuera'], 3); // por defecto: 3 paquetes por el barrio
  return lista;
}
function objetoDeTarea(t) {
  if (t.objeto) return t.objeto;
  const m = /\b(cerrojo)\b/i.exec(t.texto || '');
  return m ? m[1].toLowerCase() : 'paquete';
}

// La tarea en curso del capítulo actual: { cap, t, T } o null.
function tareaActiva() {
  if (historiaAcabada()) return null;
  const cap = capituloActual();
  const ts = tareaDe(cap);
  const T = ESTADO.tarea;
  if (!ts || !T || T.cap !== cap.id || T.i >= ts.length) return null;
  return { cap, t: ts[T.i], T };
}
function nuevaTarea(cap) {
  return { cap: cap.id, i: 0, base: { ...(ESTADO.stats || {}) }, fase: 'antes', hechos: 0, total: 0, hablados: [], objeto: false };
}
// Lo hecho desde que se activó la tarea (como desdeCap, pero por tarea).
function desdeTarea(k) { return stat(k) - ((ESTADO.tarea && ESTADO.tarea.base && ESTADO.tarea.base[k]) || 0); }
function tareaCumplida(t, T) {
  if (T.cumplida) return true;
  switch (t.tipo) {
    case 'minijuego': return desdeTarea('gana_' + t.minijuego) >= 1;
    case 'recoger': return T.total > 0 && T.hechos >= T.total;
    case 'recado': return !!T.objeto;
    case 'flashback': return t.minijuego ? desdeTarea('gana_' + t.minijuego) >= 1 : false;
    default: return false; // charla / dia: la marca Barrio al hablar con quien toca
  }
}
// La pista lista para enseñar: sin comillas ni «(Nombre)» final, y como mucho `max` letras (cortada en una frase o con «…»).
function textoPista(t, max) {
  const p = (t.pista || '').replace(/\s*\([A-ZÁÉÍÓÚ][a-záéíóúñ]+\)\s*$/, '').replace(/[«»]/g, '').trim();
  if (p.length <= max) return p;
  const corte = p.slice(0, max);
  const frase = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('! '), corte.lastIndexOf('? '));
  if (frase > max * 0.4) return corte.slice(0, frase + 1);
  return corte.slice(0, corte.lastIndexOf(' ')).replace(/[ ,;:.]+$/, '') + '…';
}
function progresoTarea(t, T) {
  if (t.tipo === 'recoger' && T.total) return `${T.hechos}/${T.total}`;
  if ((t.tipo === 'charla' || t.tipo === 'dia') && conDeTarea(t).length > 1) return `${(T.hablados || []).length}/${conDeTarea(t).length}`;
  return '';
}
// Para los paneles y escenas que leen `objetivos`: las tareas ya hechas y la actual (las demás no se ven).
function normalizarCapitulo(cap) {
  if (!cap || !esDeTareas(cap) || cap._norm) return cap;
  Object.defineProperty(cap, '_norm', { value: true, enumerable: false });
  if (!cap.cierre) cap.cierre = [];
  if (!cap.intro) cap.intro = [];
  if (cap.objetivos === undefined) {
    Object.defineProperty(cap, 'objetivos', {
      enumerable: false,
      get() {
        const T = ESTADO.tarea && ESTADO.tarea.cap === cap.id ? ESTADO.tarea : null;
        const i = T ? Math.min(T.i, cap.tareas.length - 1) : 0;
        return cap.tareas.slice(0, i + 1).map((t, k) => ({
          texto: t.texto, actual: k === i,
          hecho: () => (T ? k < T.i : false),
          progreso: () => (k === i && T ? progresoTarea(t, T) : ''),
        }));
      },
    });
  }
  return cap;
}
CAPITULOS.forEach(normalizarCapitulo);

function capituloActual() {
  return normalizarCapitulo(CAPITULOS[Math.min(ESTADO.capitulo || 0, CAPITULOS.length - 1)]);
}
function historiaAcabada() {
  return (ESTADO.capitulo || 0) >= CAPITULOS.length;
}

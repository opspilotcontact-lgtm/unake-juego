// Piezas comunes a todas las escenas: letra de dibujo animado, botones, bocadillos,
// la cortinilla de humo, rótulos de jerga, sonidos y récords.

const ANCHO = 1280;
const ALTO = 720;
const FUENTE = 'Caprasimo';
const COLOR = {
  tinta: '#1b1028',
  amarillo: '#ffd23f',
  rosa: '#ff5fa2',
  azul: '#5ad1ff',
  crema: '#fff6e8',
  verde: '#7ee081',
  rojo: '#ff5a4f',
};
const HEX = {
  tinta: 0x1b1028,
  amarillo: 0xffd23f,
  rosa: 0xff5fa2,
  azul: 0x5ad1ff,
  crema: 0xfff6e8,
  morado: 0x5b2a86,
  rojo: 0xff5a4f,
  verde: 0x7ee081,
};

// Jerga canon para los rótulos (glosario.md): nada de «porros».
const ROTULOS = [
  'Un clencho después…',
  'Dos pencas después…',
  'Un jonny más tarde…',
  'Una cañita después…',
  'Un joint y medio después…',
];

// En el móvil el juego se dibuja a la mitad: la letra pequeña sube un 30 %, y ventanas y paneles un 15 %.
const MOVIL = (() => { try { return window.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })();
const ESCALA_UI = MOVIL ? 1.15 : 1;
function tamMovil(tam) { return MOVIL && tam <= 30 ? Math.round(tam * 1.3) : tam; }

function texto(scene, x, y, str, tam = 48, color = COLOR.amarillo, ancho = null) {
  tam = tamMovil(tam);
  const t = scene.add.text(x, y, str, {
    fontFamily: FUENTE,
    fontSize: `${tam}px`,
    color,
    stroke: COLOR.tinta,
    strokeThickness: Math.max(4, Math.round(tam / 6)),
    align: 'center',
    wordWrap: ancho ? { width: ancho } : undefined,
  });
  t.setOrigin(0.5).setShadow(0, Math.round(tam / 12), '#000', 0, true, true);
  return t;
}

// Fondo que cubre toda la pantalla sin deformarse.
function fondo(scene, clave) {
  const img = scene.add.image(ANCHO / 2, ALTO / 2, clave);
  img.setScale(Math.max(ANCHO / img.width, ALTO / img.height));
  return img;
}

function sfx(scene, clave, cfg = {}) {
  if (!scene.cache.audio.exists(clave)) return null;
  // Volumen de efectos de las opciones del menú.
  cfg = { ...cfg, volume: (cfg.volume ?? 1) * (typeof volumenEfectos === 'function' ? volumenEfectos() : 1) };
  const s = scene.sound.add(clave, cfg);
  s.play();
  s.once('complete', () => s.destroy());
  return s;
}

function boton(scene, x, y, etiqueta, alPulsar, { ancho = 320, alto = 76, tam = 30, color = HEX.amarillo } = {}) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(HEX.tinta, 1).fillRoundedRect(-ancho / 2 + 4, -alto / 2 + 8, ancho, alto, 22);
  g.fillStyle(color, 1).fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 22);
  g.lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 22);
  const t = scene.add.text(0, 0, etiqueta, {
    fontFamily: FUENTE, fontSize: `${MOVIL ? Math.round(tam * 1.12) : tam}px`, color: COLOR.tinta, align: 'center',
    wordWrap: { width: ancho - 24 },
  }).setOrigin(0.5);
  c.add([g, t]);
  c.setSize(ancho, alto).setInteractive({ useHandCursor: true });
  c.on('pointerover', () => scene.tweens.add({ targets: c, scale: 1.06, duration: 90 }));
  c.on('pointerout', () => scene.tweens.add({ targets: c, scale: 1, duration: 90 }));
  c.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scale: 0.94, duration: 60, yoyo: true });
    alPulsar();
  });
  c.etiqueta = t;
  return c;
}

// Bocadillo de cómic. cola: 'izq' | 'der' | 'abajo' (hacia dónde apunta el pico).
function bocadillo(scene, x, y, str, { ancho = 380, tam = 28, cola = 'abajo' } = {}) {
  if (MOVIL) { tam = Math.round(tam * 1.25); ancho = Math.round(ancho * 1.2); }
  const t = scene.add.text(0, 0, str, {
    fontFamily: FUENTE, fontSize: `${tam}px`, color: COLOR.tinta, align: 'center',
    wordWrap: { width: ancho - 40 },
  }).setOrigin(0.5);
  const w = Math.max(140, t.width + 44);
  const h = t.height + 34;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1).lineStyle(5, HEX.tinta, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 26).strokeRoundedRect(-w / 2, -h / 2, w, h, 26);
  const px = cola === 'izq' ? -w / 4 : cola === 'der' ? w / 4 : 0;
  const pico = [px - 16, h / 2 - 3, px + 16, h / 2 - 3, px + (cola === 'izq' ? -30 : cola === 'der' ? 30 : 0), h / 2 + 30];
  g.fillTriangle(...pico);
  g.lineBetween(pico[0], pico[1] + 3, pico[4], pico[5]).lineBetween(pico[2], pico[3] + 3, pico[4], pico[5]);
  const c = scene.add.container(x, y, [g, t]).setDepth(50).setScale(0);
  c.anchoB = w;
  c.altoB = h + 32; // con el pico
  scene.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.out' });
  return c;
}

// ---- La cortinilla de humo: tapa la pantalla con nubes de contorno grueso y se disipa ----

function nubesDeHumo(scene) {
  const capa = scene.add.container(0, 0).setDepth(1000);
  const tonos = [0xcfc6dc, 0xb7a9cc, 0xe8e2f0, 0xa996c4];
  const nubes = [];
  for (let fila = 0; fila < 7; fila++) {
    for (let col = 0; col < 10; col++) {
      const x = col * 142 + Phaser.Math.Between(-30, 30);
      const y = fila * 120 + Phaser.Math.Between(-25, 25);
      const n = scene.add.circle(x, y, Phaser.Math.Between(120, 170), Phaser.Utils.Array.GetRandom(tonos));
      n.setStrokeStyle(7, HEX.tinta);
      capa.add(n);
      nubes.push(n);
    }
  }
  Phaser.Utils.Array.Shuffle(nubes);
  return { capa, nubes };
}

function cortinaHumo(scene, alCubrir) {
  const { capa, nubes } = nubesDeHumo(scene);
  nubes.forEach(n => n.setScale(0));
  sfx(scene, 'whoosh', { volume: 0.7 });
  scene.tweens.add({
    targets: nubes, scale: 1, duration: 420, ease: 'Back.out',
    delay: scene.tweens.stagger(6),
    // Si se cambia de mundo en la misma escena, destaparHumo pone sus propias nubes encima:
    // estas se quitan para que no se queden tapando.
    onComplete: () => { alCubrir(); capa.destroy(); },
  });
}

function destaparHumo(scene) {
  const { capa, nubes } = nubesDeHumo(scene);
  scene.tweens.add({
    targets: nubes, scale: 0, alpha: 0, duration: 520, ease: 'Sine.in',
    delay: scene.tweens.stagger(5, { start: 120 }),
    onComplete: () => capa.destroy(),
  });
}

// Cambio de escena con humo. Si se pasa `rotulo`, la escena siguiente lo enseña al entrar.
function irA(scene, clave, datos = {}) {
  if (scene._saliendo) return;
  scene._saliendo = true;
  scene.input.enabled = false;
  // Se paran los efectos; la música sigue y la escena siguiente decide si cambia (con fundido).
  scene.sound.getAllPlaying().forEach(s => { if (!s.esMusica) s.stop(); });
  // Cada minijuego entra con la cortinilla de su personaje (comic.js); lo demás, con humo.
  const cortina = datos.cortina || (typeof CORTINA_DE !== 'undefined' && CORTINA_DE[clave]);
  const cubrir = cortina && typeof Comic !== 'undefined' && Comic.cubrir[cortina];
  (cubrir || cortinaHumo)(scene, () => scene.scene.start(clave, { ...datos, humo: true, cortina: cubrir ? cortina : null }));
}

function entrar(scene, datos) {
  scene._saliendo = false;
  if (typeof Musica !== 'undefined' && scene.scene.key !== 'Portada') Musica.alEntrar(scene);
  scene.panelAbierto = false;
  if (datos && datos.humo) {
    if (datos.cortina && typeof Comic !== 'undefined' && Comic.destapar[datos.cortina]) Comic.destapar[datos.cortina](scene);
    else destaparHumo(scene);
  }
  if (datos && datos.rotulo) rotulo(scene, datos.rotulo);
}

function rotulo(scene, str, alAcabar) {
  const t = texto(scene, ANCHO / 2, ALTO / 2, str, 64, COLOR.crema).setDepth(900).setScale(0).setAngle(-4);
  sfx(scene, 'rimshot', { volume: 0.5 });
  scene.tweens.chain({
    targets: t,
    tweens: [
      { scale: 1, duration: 380, ease: 'Back.out', delay: 350 },
      { angle: 3, duration: 700, ease: 'Sine.inOut' },
      { scale: 0, alpha: 0, duration: 250, ease: 'Back.in' },
    ],
    onComplete: () => { t.destroy(); if (alAcabar) alAcabar(); },
  });
}

// Texto que salta, se queda un momento y se va (¡PIN PIN!, ¡ÑAM!…).
function golpeTexto(scene, x, y, str, color = COLOR.amarillo, tam = 56) {
  const t = texto(scene, x, y, str, tam, color).setDepth(800).setScale(0).setAngle(Phaser.Math.Between(-10, 10));
  scene.tweens.chain({
    targets: t,
    tweens: [
      { scale: 1, duration: 200, ease: 'Back.out' },
      { y: y - 40, alpha: 0, duration: 600, delay: 350 },
    ],
    onComplete: () => t.destroy(),
  });
  scene.time.delayedCall(1700, () => { if (t.active) t.destroy(); });
  return t;
}

// ---- La partida: se guarda en este navegador; si el almacenamiento falla, el juego sigue igual ----

const ESTADO_INICIAL = {
  sala: 'fuera', x: 300, y: 560,
  monchis: 40,      // para el primer papel y algo de comer
  records: {},      // mejor puntuación por misión
  estrellas: {},    // estrellas por misión (0 a 3)
  inventos: {},     // inventos comprados en el taller
  dentro: false,    // ya se sabe la contraseña
  introVista: false,
  ayudaVista: false,
  // Necesidades (0-100). Con colocón ≥ 30 se está en el mundo humo; por debajo, en el normal.
  colocon: 0,
  hambre: 20,
  vida: 100,
  // Lo que hace falta para liar: se compra (papel, mechero), se encuentra (boquilla) o se pide en la barra (la bolsita).
  inv: { papel: 0, boquilla: 0, bolsita: 0, mechero: false },
  boquillaEn: null, // dónde brilla la boquilla perdida: { sala, x, y }
  blancazoEn: 0,    // segundos que faltan para que a Blancaso le dé el blancazo (0 = nada pendiente)
  // La historia (historia.js): capítulo en curso, de qué capítulo se ha visto ya la escena, la hucha y contadores.
  capitulo: 0,
  introCap: -1,
  hucha: 0,
  stats: {},
  // Situaciones (situaciones.js): problemas de cada personaje en curso, cosas que recoger y
  // la situación cuyo minijuego se está jugando (para dar el premio al acabar).
  situaciones: {},
  recogibles: [],
  situacionEnJuego: null,
  ocultarObjetivos: false,
};
const UMBRAL_HUMO = 30;
function enMundoHumo() { return ESTADO.colocon >= UMBRAL_HUMO; }

// Hacia dónde mira cada dibujo tal cual está pintado (1 = derecha, -1 = izquierda).
// Los que no están se tratan como de frente: el espejo da igual.
const MIRA = { 'vuper-reparto': -1, 'monchiman-picado': -1, 'puky-eructo': 1, 'puky-riendo': 1, 'vn-caminando': -1 };
// Los dibujos de caminar del mundo normal (cuerpo de persona) miran a la izquierda, como el de Vuper:
// comprobado en el juego el 30/10 (Lasslow andaba de espaldas al pasear).
['palicaso', 'blancaso', 'cotine', 'lasslow', 'pompa', 'perico'].forEach(id => { MIRA[`n-${id}-caminando`] = -1; });
MIRA['n-casero-caminando'] = 1; // pedido a Gemini mirando a la derecha
let ESTADO = cargarPartida();

function cargarPartida() {
  try {
    const guardada = JSON.parse(localStorage.getItem('unake-partida') || 'null') || {};
    const base = structuredClone(ESTADO_INICIAL);
    return { ...base, ...guardada, inv: { ...base.inv, ...(guardada.inv || {}) } };
  } catch { return structuredClone(ESTADO_INICIAL); }
}

function guardarPartida() {
  try { localStorage.setItem('unake-partida', JSON.stringify(ESTADO)); } catch { /* sin almacenamiento */ }
}

function tiene(invento) { return !!ESTADO.inventos[invento]; }
function leerRecord(clave) { return ESTADO.records[clave] || 0; }
function totalEstrellas() { return Object.values(ESTADO.estrellas).reduce((a, b) => a + b, 0); }

// Las misiones: quién las da y cuántos puntos piden para 1, 2 y 3 estrellas.
const MISIONES = {
  Contrasena: {
    nombre: 'La contraseña', sprite: 'perico', umbrales: [60, 180, 400], divisor: 5,
    texto: 'Perico no abre sin la contraseña. Con 3 respuestas seguidas te abre; si sigues el bucle, más puntos (y menos tiempo).',
  },
  Tarta: {
    nombre: 'La tarta entera', sprite: 'cotine', umbrales: [300, 900, 1800],
    texto: '«Hoy sirvo una tarta entera, te lo juro.» Atrapa los pisos en orden. Las patatas, para Cotine: si el hambre llega arriba, se come un piso y pierdes una vida.',
  },
  Lasslow: {
    nombre: 'Un señor', sprite: 'lasslow-digno', umbrales: [400, 1000, 1800],
    texto: '«Esta noche ceno con el casero y soy un señor.» Chiste: ESPACIO cuando el círculo toque el anillo. Tripa: P solo cuando suene un ruido.',
  },
  Rescate: {
    nombre: '¡Que no cunda el amarillo!', sprite: 'monchiman', umbrales: [400, 900, 1500],
    texto: 'Dulce, salado y un resucitador. Llega a Blancaso antes que Puky.',
  },
  Blancazo: {
    nombre: 'El blancazo', sprite: 'puky-eructo', umbrales: [400, 800, 1200],
    texto: 'A Blancaso le ha dado un blancaso y Puky viene a por él. Monchiman contra Puky: esquiva la pota, dispara caramelos y lánzale un resucitador.',
  },
  Barra: {
    nombre: 'Noche de barra', sprite: 'palicaso', umbrales: [1500, 3000, 4500],
    texto: 'Los de la aso piden a la barra. Sirve a cada uno lo suyo (1-4) antes de que se cansen. Si se cuela Puky, échalo (X).',
  },
  Pipas: {
    nombre: 'La apuesta de pipas', sprite: 'perico-pipas', umbrales: [300, 700, 1200],
    texto: 'Mete pipas en la papelera: fija el ángulo y la fuerza con ESPACIO. Ojo al viento.',
  },
  DJ: {
    nombre: 'La Pompa pincha', sprite: 'pompa', umbrales: [4000, 8000, 12000],
    texto: 'Las burbujas caen al ritmo: pulsa ← ↓ → (o A S D) cuando lleguen a la línea. Si fallas mucho, la Pompa revienta.',
  },
  Cuentas: {
    nombre: 'La caja no cuadra', sprite: 'blancaso', umbrales: [300, 700, 1200],
    texto: 'Clasifica lo que cae: monedas ←, billetes →, facturas ↓. Tres fallos y a Blancaso le da el bajón.',
  },
  Farol: {
    nombre: 'El farol', sprite: 'palicaso-contando', umbrales: [600, 1300, 2200],
    texto: 'Dados con Palicaso. Él canta lo que ha sacado: ¿te lo crees o es un farol? Cuando miente, se enrolla (y a veces suda).',
  },
  Periquito: {
    nombre: '¡Periquito!', sprite: 'perico-cotilleando', umbrales: [800, 1700, 2800],
    texto: 'Perico quiere gritar que Vuper es Monchiman. Grítale «¡periquito!» justo cuando empiece con «Mon…». Ojo con las fintas.',
  },
  Inspeccion: {
    nombre: 'La inspección', sprite: 'obj-llave', umbrales: [500, 1100, 1800],
    texto: 'El casero recorre Unaké. Cuando NO mire, mantén pulsado lo que no debe ver hasta esconderlo. Si se gira y te pilla, sospecha. La llave tintinea antes de girarse.',
  },
  Aires: {
    nombre: 'Por los aires', sprite: 'lasslow-pedo', umbrales: [700, 1000, 1300],
    texto: 'Lasslow sube hasta la Pompa a base de pedo. MANTÉN para soltar gas (sube), suelta para caer, ← → para moverte. La comida recarga el gas; las lámparas te tiran.',
  },
  Palo: {
    nombre: 'El palo', sprite: 'cotine-plop', umbrales: [1000, 1350, 1700],
    texto: 'Perico tiene el palo de Cotine. Muévete, MANTÉN para disparar virutas de azúcar y esquiva sus pipas. Tres fases, como un jefe de verdad.',
  },
  Sigilo: {
    nombre: 'Los discos de la Pompa', sprite: 'pompa-mira', umbrales: [900, 1500, 2100],
    texto: 'De día, cuélate en casa del casero y recupera los 3 discos. Evita los conos de visión, MANTÉN Mayús para no hacer ruido y escóndete en las macetas.',
  },
  Reparto: {
    nombre: 'Encargos de la tienda', sprite: 'vuper-reparto', umbrales: [2, 4, 7],
    texto: 'Lleva monchis por el barrio antes de que se enfríen. Cada entrega seguida multiplica lo que cobras.',
  },
};

// Los inventos de Monchiman (CANON: los inventa en su cuarto y pueden acabar siendo productos de VOPPË).
const INVENTOS = [
  { id: 'mochila', nombre: 'Mochila térmica', precio: 120, sprite: 'mochila', efecto: 'Encargos: +10 s por entrega' },
  { id: 'silbato', nombre: 'Silbato antiperico', precio: 150, sprite: 'perico-silbando', efecto: 'Contraseña: una vida más' },
  { id: 'bandeja', nombre: 'Bandeja ancha', precio: 150, sprite: 'tarta', efecto: 'Tarta: atrapas más fácil' },
  { id: 'pajarita', nombre: 'Pajarita de señor', precio: 200, sprite: 'pajarita', efecto: 'Un señor: el gas sube más despacio' },
  { id: 'mascara', nombre: 'Máscara con tiro', precio: 250, sprite: 'monchiman', efecto: 'Rescate: vuelas más rápido' },
];

function estrellasDe(clave, puntos) {
  return MISIONES[clave].umbrales.filter(u => puntos >= u).length;
}

// Tres estrellas dibujadas; se rellenan las ganadas.
function estrellas(scene, x, y, n, tam = 22) {
  const c = scene.add.container(x, y);
  for (let i = 0; i < 3; i++) {
    const e = scene.add.star((i - 1) * tam * 2.1, 0, 5, tam * 0.45, tam, i < n ? HEX.amarillo : 0x3d3350);
    e.setStrokeStyle(4, HEX.tinta);
    c.add(e);
  }
  return c;
}

// La escalera de cada minijuego: las tres estrellas son los niveles 1-3 y después siempre hay uno más,
// que pide un 20 % más y paga más. Así cada minijuego tiene algo que perseguir aunque ya tengas las estrellas.
function nivelDe(clave) { return (ESTADO.niveles && ESTADO.niveles[clave]) || 1; }
function metaNivel(clave, n = nivelDe(clave)) {
  const u = MISIONES[clave].umbrales;
  if (n <= 3) return u[n - 1];
  const m = u[2] * (1 + 0.2 * (n - 3));
  return u[2] >= 100 ? Math.round(m / 50) * 50 : Math.ceil(m);
}
function premioNivel(n) { return 20 + 15 * n; }

// Apunta el resultado de una misión: récord, estrellas y monchis. Devuelve lo que ha cambiado.
function apuntar(clave, puntos, monchis, gana = true) {
  const nuevoRecord = puntos > leerRecord(clave);
  if (nuevoRecord) ESTADO.records[clave] = puntos;
  const antes = ESTADO.estrellas[clave] || 0;
  // Perdiendo no se ganan estrellas, aunque los puntos lleguen al umbral.
  const ahora = gana ? Math.max(antes, estrellasDe(clave, puntos)) : antes;
  ESTADO.estrellas[clave] = ahora;
  ESTADO.monchis += monchis;
  sumarStat('partidas');
  sumarStat(`jugada_${clave}`);
  sumarStat('monchisGanados', monchis);
  if (gana) { sumarStat('victorias'); sumarStat(`gana_${clave}`); }
  // Subir de nivel (uno por partida, aunque los puntos den para más: que haya siempre un siguiente).
  const nivel = nivelDe(clave);
  const meta = metaNivel(clave, nivel);
  let subido = 0;
  if (gana && puntos >= meta) {
    ESTADO.niveles = ESTADO.niveles || {};
    ESTADO.niveles[clave] = nivel + 1;
    subido = premioNivel(nivel);
    ESTADO.monchis += subido;
    sumarStat('nivelesSubidos');
  }
  return { nuevoRecord, estrellasNuevas: ahora - antes, ganadas: gana ? estrellasDe(clave, puntos) : 0, nivel, meta, subido };
}

const PAGO_ESTRELLAS = [15, 35, 60, 90];

// Panel de final de misión, común a todas.
// Antes del panel, el remate de cómic: perder es una pantalla de reacción; las tres estrellas, viñetas del bar.
function panelFinal(scene, opciones) {
  if (!scene.sys || !scene.sys.isActive()) return; // la escena ya se ha cerrado
  scene.panelAbierto = true; // los mandos táctiles se apartan para no tapar los botones
  const { clave, puntos, gana = true } = opciones;
  let remate = Promise.resolve();
  if (typeof Comic !== 'undefined') {
    if (!gana && REACCION_PIERDE[clave]) remate = Comic.reaccion(scene, REACCION_PIERDE[clave][0], { color: REACCION_PIERDE[clave][1] });
    else if (gana && estrellasDe(clave, puntos) === 3) remate = Comic.vinetas(scene, ['palicaso-riendo', 'lasslow-risa-floja', 'perico-graznando', 'pompa-mira']);
  }
  remate.then(() => { if (scene.sys.isActive()) mostrarPanelFinal(scene, opciones); });
}

function mostrarPanelFinal(scene, { titulo, linea, puntos, clave, gana = true, extraMonchis = 1 }) {
  // De noche, en el mundo humo, se cobra más: es el empujón para liarse uno.
  const humo = enMundoHumo() ? 1.5 : 1;
  const divisor = MISIONES[clave].divisor || 20;
  // Se cobra por estrellas: jugar bien se nota; perdiendo, solo unas migajas.
  const base = gana ? PAGO_ESTRELLAS[estrellasDe(clave, puntos)] : Math.min(10, Math.round(puntos / divisor));
  const monchis = Math.round(base * extraMonchis * humo * (1 + bonoDeco('pago')));
  const r = apuntar(clave, puntos, monchis, gana);
  let lineaSituacion = '';
  if (ESTADO.situacionEnJuego) {
    const id = ESTADO.situacionEnJuego;
    ESTADO.situacionEnJuego = null;
    if (gana && ESTADO.situaciones[id]) lineaSituacion = `Problema de ${QUIEN[id].nombre} resuelto: ${completarSituacion(id)}`;
    else if (ESTADO.situaciones[id]) lineaSituacion = `${QUIEN[id].nombre} sigue con su problema: inténtalo otra vez`;
    guardarPartida();
  }
  const velo = scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0).setDepth(600);
  scene.tweens.add({ targets: velo, fillAlpha: 0.6, duration: 400 });
  const c = scene.add.container(ANCHO / 2, ALTO / 2).setDepth(601).setScale(0);
  const g = scene.add.graphics();
  g.fillStyle(gana ? HEX.morado : 0x3a1c2c, 1).fillRoundedRect(-400, -270, 800, 540, 36);
  g.lineStyle(8, HEX.tinta, 1).strokeRoundedRect(-400, -270, 800, 540, 36);
  c.add(g);
  c.add(texto(scene, 0, -205, titulo, 54, gana ? COLOR.amarillo : COLOR.rosa, 740));
  c.add(texto(scene, 0, -122, linea, 26, COLOR.crema, 700));
  c.add(estrellas(scene, 0, -40, r.ganadas, 30));
  c.add(texto(scene, 0, 26, `${puntos} puntos  ·  +${monchis + r.subido} monchis`, 36, COLOR.azul));
  const umbrales = MISIONES[clave].umbrales;
  const siguiente = umbrales.find(u => puntos < u);
  const pista = r.nuevoRecord && puntos > 0 ? '¡Nuevo récord!'
    : siguiente ? `Récord: ${leerRecord(clave)}  ·  Siguiente estrella: ${siguiente}` : `Récord: ${leerRecord(clave)}  ·  ¡Las tres estrellas!`;
  if (!(MOVIL && r.subido)) c.add(texto(scene, 0, 76, pista, 22, r.nuevoRecord ? COLOR.amarillo : COLOR.crema, 720));
  const lineaNivel = r.subido
    ? `¡NIVEL ${r.nivel} SUPERADO! +${r.subido} · siguiente: ${metaNivel(clave, r.nivel + 1)}`
    : `Nivel ${r.nivel}: llega a ${r.meta} (ganando) para subir`;
  c.add(texto(scene, 0, 110, lineaNivel, r.subido ? 26 : 21, r.subido ? COLOR.amarillo : COLOR.azul, 740));
  if (r.subido) {
    scene.tweens.add({ targets: c.list[c.list.length - 1], scale: 1.08, duration: 300, yoyo: true, repeat: 3, delay: 600 });
    if (typeof Comic !== 'undefined') scene.time.delayedCall(650, () => { Comic.impacto(scene, ANCHO / 2 - 300, ALTO / 2 + 110, { profundidad: 610 }); Comic.confeti(scene, { profundidad: 600 }); sfx(scene, 'platillo', { volume: 0.5 }); });
  }
  if (lineaSituacion) c.add(texto(scene, 0, 144, lineaSituacion, 20, COLOR.verde, 740));
  else if (r.estrellasNuevas > 0) c.add(texto(scene, 0, 144, `+${r.estrellasNuevas} estrella${r.estrellasNuevas > 1 ? 's' : ''} · llevas ${totalEstrellas()}`, 22, COLOR.verde));
  c.add(boton(scene, -185, 205, 'Otra vez (Enter)', () => irA(scene, scene.scene.key), { ancho: 330, tam: 26 }));
  c.add(boton(scene, 185, 205, 'Al barrio (Esc)', () => irA(scene, 'Barrio'), { ancho: 330, color: HEX.azul, tam: 26 }));
  scene.tweens.add({ targets: c, scale: ESCALA_UI, duration: 420, ease: 'Back.out', delay: 200 });
  scene.input.keyboard.once('keydown-ENTER', () => irA(scene, scene.scene.key));
  scene.input.keyboard.once('keydown-ESC', () => irA(scene, 'Barrio'));
  if (r.ganadas === 3) sfx(scene, 'platillo', { volume: 0.5 });
}

// Flotar en reposo, como su materia (movimiento.md): sube y baja y respira.
function flotar(scene, obj, { amplitud = 10, periodo = 1600 } = {}) {
  scene.tweens.add({ targets: obj, y: obj.y - amplitud, duration: periodo, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  const sx = obj.scaleX;
  const sy = obj.scaleY;
  scene.tweens.add({ targets: obj, scaleX: sx * 1.03, scaleY: sy * 0.98, duration: periodo * 0.7, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
}

// Cambiar de pose con rebote (el `swap` del motor de la serie).
function cambiarPose(scene, sprite, clave) {
  const sx = Math.abs(sprite.scaleX);
  const sy = sprite.scaleY;
  sprite.setTexture(clave);
  sprite.setScale(sx * 1.25 * Math.sign(sprite.scaleX || 1), sy * 0.8);
  scene.tweens.add({ targets: sprite, scaleX: sx * Math.sign(sprite.scaleX || 1), scaleY: sy, duration: 320, ease: 'Back.out' });
}

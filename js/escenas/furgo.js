// La furgo (capítulo del viaje a la feria de humo): la furgo de Palicaso avanza sola por una carretera
// de noche vista desde arriba. ← → (o A D; en el móvil, tocar a un lado) cambian de carril. Esquivas
// conos, baches, charcos de Puky y un sofá en mitad de la vía; las nubes de humo tapan la vista; los
// monchis dan puntos. Tienes 3 vidas. Gana quien llega a la meta.
// Antes de arrancar se eligen hasta 3 acompañantes (quedan en ESTADO.furgoAcompanantes, para «El control»).
// Cada uno cambia el viaje a su manera, sin decir su sensación: se ve en lo que hace.
// Más acompañantes = más puntos (multiplicador) y más caos.

MISIONES.Furgo = {
  nombre: 'La furgo', sprite: 'palicaso', umbrales: [800, 1400, 2100],
  texto: 'La furgo de Palicaso rumbo a la feria. ← → para cambiar de carril: esquiva y recoge monchis. Elige quién va a bordo: cada uno cambia el viaje.',
};
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Furgo = 'minijuego';
if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Furgo = 'barrido';
if (typeof REACCION_PIERDE !== 'undefined') REACCION_PIERDE.Furgo = ['palicaso-contando', 0xffd628];

// Los que pueden subir a la furgo (la cara es su dibujo de siempre; «alt» es su cara en el viaje).
const ACOMP_ORDEN = ['palicaso', 'lasslow', 'perico', 'cotine', 'pompa', 'blancaso', 'puky'];
const ACOMP = {
  palicaso: { nombre: 'Palicaso', cara: 'palicaso', alt: 'palicaso-contando', color: 0xffd23f },
  lasslow: { nombre: 'Lasslow', cara: 'lasslow-digno', alt: 'lasslow-risa-floja', color: 0xffb38a },
  perico: { nombre: 'Perico', cara: 'perico', alt: 'perico-silbando', color: 0xd0d4dc },
  cotine: { nombre: 'Cotine', cara: 'cotine', alt: 'cotine-plop', color: 0xff8fc0 },
  pompa: { nombre: 'La Pompa', cara: 'pompa', alt: 'pompa-horror', color: 0x9fe7ff },
  blancaso: { nombre: 'Blancaso', cara: 'blancaso', alt: 'blancaso-mareado', color: 0xbfe8ff },
  puky: { nombre: 'Puky', cara: 'puky', alt: 'puky-gracioso', color: 0xf5d23a },
};
const MULT_ACOMP = [1, 1.2, 1.5, 1.8];
const ACOMP_CLIENTE = {}; // el cliente de un encargo (un personaje que no es de los elegibles)
const MAX_ACOMP = 3;

// Acompañantes que se llevan por defecto si nadie ha elegido (los lee también «El control»).
function acompanantesFurgo() {
  const l = (ESTADO.furgoAcompanantes || []).filter(id => ACOMP[id]);
  return l.length ? l.slice(0, MAX_ACOMP) : null;
}

// Énfasis de cómic si existe (Comic.enfasis), sin romper si falta o falla.
function enfasisSeguro(scene, tipo, op) {
  try { if (typeof Comic !== 'undefined' && typeof Comic.enfasis === 'function') return Comic.enfasis(scene, tipo, op); } catch (e) { /* sin énfasis */ }
  return null;
}

// ---- Los textos que escribe el guionista (cap-furgo.js: DON_EUSEBIO.frases y EVENTOS_FURGO) con respaldo propio ----
// Don Eusebio no habla: se le cuenta con una frase narrada (entre asteriscos en el guion) en un pie de texto.
const EUSEBIO_POR_DEFECTO = {
  arrancar: ['Don Eusebio asoma la nariz por la guantera, huele el pino y vuelve a esconderse con gesto de desaprobación.'],
  curvas: ['Don Eusebio rueda a la izquierda. Rueda a la derecha. Una pipa le sigue.'],
  golpe: ['Don Eusebio se hace bola. Bola de pelo. Bola de dignidad herida.'],
  escapa: ['Don Eusebio sube por el volante. Con las manos. Como una escalera de biblioteca.'],
  vuelve: ['Don Eusebio vuelve a la guantera por su propio pie, con el aire de quien ha hecho una gestión.'],
  ganar: ['Don Eusebio chasquea la lengua, que es lo que hace cuando todo sale bien.'],
  perder: ['Don Eusebio se vuelve a hacer bola. Mañana será otro martes.'],
};
const EUSEBIO_ALIAS = { curva: 'curvas', evento: 'escapa', perfecto: 'ganar', bien: 'ganar', desastre: 'perder' };
function frasesEusebio(clave) {
  const k = EUSEBIO_ALIAS[clave] || clave;
  const g = typeof DON_EUSEBIO !== 'undefined' && DON_EUSEBIO && DON_EUSEBIO.frases && DON_EUSEBIO.frases[k] ? DON_EUSEBIO.frases[k] : EUSEBIO_POR_DEFECTO[k];
  const l = [].concat(g || []);
  return l.length ? Phaser.Utils.Array.GetRandom(l).replace(/^\*|\*$/g, '') : '';
}
// El texto del guionista de un evento (EVENTOS_FURGO), por su id.
function textoEvento(id) {
  const alias = { puky: 'puky_cruza', lluvia: 'lluvia_humo', eusebio: 'eusebio_escapa' };
  if (typeof EVENTOS_FURGO === 'undefined') return '';
  const e = EVENTOS_FURGO.find(x => x.id === (alias[id] || id));
  return e ? e.texto : '';
}

// Don Eusebio, el hámster de la guantera: bolita naranja con orejas, bigotes y ojos brillantes. Si el ilustrador
// entrega obj-eusebio, obj-eusebio-susto, obj-eusebio-feliz u obj-eusebio-dormido, se usan esos dibujos.
function dibujaEusebio(scene, cont, estado, alto = 96) {
  cont.removeAll(true);
  const clave = estado === 'normal' ? 'obj-eusebio' : `obj-eusebio-${estado}`;
  const k = scene.textures.exists(clave) ? clave : (scene.textures.exists('obj-eusebio') && estado !== 'normal' ? 'obj-eusebio' : null);
  if (k) {
    const im = scene.add.image(0, 0, k);
    im.setScale(alto / im.height);
    cont.add(im);
    return;
  }
  const T = HEX.tinta, g = scene.add.graphics();
  const k2 = alto / 96;
  g.setScale(k2);
  // Orejas, cuerpo y barriga.
  [-1, 1].forEach(s => { g.fillStyle(0xe58a2c, 1).fillCircle(s * 25, -30, 13).lineStyle(5, T, 1).strokeCircle(s * 25, -30, 13); g.fillStyle(0xffa8b0, 1).fillCircle(s * 25, -30, 6); });
  g.fillStyle(0xf0a040, 1).fillCircle(0, 0, 38).lineStyle(6, T, 1).strokeCircle(0, 0, 38);
  g.fillStyle(0xffd9a0, 1).fillEllipse(0, 14, 44, 30);
  g.fillStyle(0xffa8a0, 0.85).fillCircle(-26, 8, 7).fillCircle(26, 8, 7);
  // Ojos según el estado.
  if (estado === 'dormido') {
    g.lineStyle(4, T, 1).lineBetween(-20, -6, -8, -4).lineBetween(8, -4, 20, -6);
  } else if (estado === 'susto') {
    [-1, 1].forEach(s => { g.fillStyle(0xf0a040, 1).fillCircle(s * 13, -6, 12).lineStyle(4, T, 1).strokeCircle(s * 13, -6, 12); });
    g.lineStyle(2, T, 1).lineBetween(-20, -6, -6, -6).lineBetween(6, -6, 20, -6);
  } else {
    [-1, 1].forEach(s => { g.fillStyle(0xffffff, 1).fillCircle(s * 13, -6, 9).lineStyle(4, T, 1).strokeCircle(s * 13, -6, 9); g.fillStyle(T, 1).fillCircle(s * 13 + 1, -5, 5); g.fillStyle(0xffffff, 1).fillCircle(s * 13 + 3, -8, 2); });
  }
  // Nariz, dientes y bigotes.
  g.fillStyle(0xff7a90, 1).fillCircle(0, 6, 4.5);
  g.fillStyle(0xffffff, 1).fillRect(-4, 11, 8, 8).lineStyle(2, T, 1).strokeRect(-4, 11, 8, 8);
  g.lineStyle(3, T, 1);
  [-1, 1].forEach(s => { g.lineBetween(s * 22, 8, s * 46, 2).lineBetween(s * 22, 12, s * 46, 14); });
  if (estado === 'feliz') {
    // Brazos arriba y boca abierta.
    [-1, 1].forEach(s => { g.fillStyle(0xf0a040, 1).fillEllipse(s * 44, -26, 14, 24).lineStyle(4, T, 1).strokeEllipse(s * 44, -26, 14, 24); });
    g.fillStyle(0x7a1030, 1).fillEllipse(0, 24, 18, 10);
  }
  cont.add(g);
  if (estado === 'dormido') cont.add(scene.add.text(34, -44, 'z', { fontFamily: FUENTE, fontSize: '26px', color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 5 }).setOrigin(0.5));
}

// Un dibujo del juego si existe; si no, el de respaldo.
function texO(scene, clave, respaldo) { return scene.textures.exists(clave) ? clave : respaldo; }

// Genera una textura una sola vez (las texturas sobreviven a los cambios de escena).
function hacerTextura(scene, clave, w, h, dibujar) {
  if (scene.textures.exists(clave)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  dibujar(g);
  g.generateTexture(clave, w, h);
  g.destroy();
}

// Sustitutos dibujados por código mientras el ilustrador no entrega el arte (contorno negro grueso, estilo serie).
function texturasFurgo(scene) {
  const T = HEX.tinta;
  hacerTextura(scene, 'fu-carretera', 640, 320, g => {
    g.fillStyle(0x2b2840, 1).fillRect(0, 0, 640, 320);
    g.fillStyle(0x34304c, 1);
    for (let i = 0; i < 40; i++) g.fillRect(Phaser.Math.Between(20, 610), Phaser.Math.Between(0, 316), Phaser.Math.Between(4, 14), 3);
    g.fillStyle(0xfff6e8, 1).fillRect(10, 0, 8, 320).fillRect(622, 0, 8, 320);
    g.fillStyle(0xffd23f, 0.9);
    [160, 320, 480].forEach(x => { g.fillRect(x - 4, 10, 8, 90).fillRect(x - 4, 170, 8, 90); });
  });
  hacerTextura(scene, 'fu-lado', 1280, 320, g => {
    g.fillStyle(0x15302f, 1).fillRect(0, 0, 1280, 320);
    g.fillStyle(0x1c3c38, 1);
    for (let i = 0; i < 60; i++) g.fillRect(Phaser.Math.Between(0, 1270), Phaser.Math.Between(0, 316), Phaser.Math.Between(6, 20), 4);
    // Árboles de contorno grueso y farolas con su luz.
    [[40, 40], [130, 200], [250, 110], [90, 290], [1040, 60], [1180, 170], [1110, 280], [1240, 20], [290, 250], [1000, 230]].forEach(([x, y]) => {
      g.fillStyle(0x1f5a46, 1).fillCircle(x, y, 34).lineStyle(5, T, 1).strokeCircle(x, y, 34);
      g.fillStyle(0x2a7a5c, 1).fillCircle(x - 8, y - 8, 14);
    });
    [[300, 150], [1010, 130]].forEach(([x, y]) => {
      g.fillStyle(0xffd23f, 0.22).fillCircle(x, y, 44);
      g.fillStyle(0xffd23f, 1).fillCircle(x, y, 9).lineStyle(4, T, 1).strokeCircle(x, y, 9);
    });
  });
  hacerTextura(scene, 'fu-furgo', 100, 170, g => {
    g.fillStyle(0x111111, 1);
    [[0, 22], [86, 22], [0, 114], [86, 114]].forEach(([x, y]) => { g.fillRoundedRect(x, y, 14, 38, 5).lineStyle(3, T, 1).strokeRoundedRect(x, y, 14, 38, 5); });
    g.fillStyle(0xfff6e8, 1).fillRoundedRect(8, 6, 84, 158, 22).lineStyle(6, T, 1).strokeRoundedRect(8, 6, 84, 158, 22);
    g.fillStyle(0xff5fa2, 1).fillRect(42, 58, 16, 100);
    g.fillStyle(0x5aa0e8, 1).fillRoundedRect(18, 22, 64, 32, 9).lineStyle(4, T, 1).strokeRoundedRect(18, 22, 64, 32, 9);
    g.fillStyle(0x7ec4ff, 1).fillRect(24, 28, 22, 6);
    g.fillStyle(0x5aa0e8, 1).fillRoundedRect(24, 140, 52, 14, 5).lineStyle(3, T, 1).strokeRoundedRect(24, 140, 52, 14, 5);
    g.fillStyle(0xffd23f, 1).fillCircle(24, 13, 6).fillCircle(76, 13, 6);
    g.fillStyle(0xff3b30, 1).fillRect(16, 158, 14, 5).fillRect(70, 158, 14, 5);
  });
  hacerTextura(scene, 'fu-haz', 130, 260, g => {
    g.fillStyle(0xfff3a0, 0.28).fillTriangle(40, 260, 90, 260, 130, 0).fillTriangle(40, 260, 0, 0, 130, 0);
    g.fillStyle(0xfff3a0, 0.28).fillTriangle(50, 260, 80, 260, 100, 20).fillTriangle(50, 260, 30, 20, 100, 20);
  });
  hacerTextura(scene, 'fu-cono', 64, 64, g => {
    g.fillStyle(0xff7a1c, 1).fillCircle(32, 32, 27).lineStyle(6, T, 1).strokeCircle(32, 32, 27);
    g.fillStyle(0xfff6e8, 1).fillCircle(32, 32, 17).lineStyle(4, T, 1).strokeCircle(32, 32, 17);
    g.fillStyle(0xff7a1c, 1).fillCircle(32, 32, 8).lineStyle(4, T, 1).strokeCircle(32, 32, 8);
  });
  hacerTextura(scene, 'fu-bache', 124, 80, g => {
    g.fillStyle(0x15121f, 1).fillEllipse(62, 40, 112, 68).lineStyle(6, 0x6b5f86, 1).strokeEllipse(62, 40, 112, 68);
    g.lineStyle(4, T, 1).strokeEllipse(62, 40, 96, 54);
    g.lineStyle(4, 0x4a3f62, 1).lineBetween(30, 26, 52, 40).lineBetween(52, 40, 46, 56).lineBetween(70, 30, 92, 44);
  });
  hacerTextura(scene, 'fu-sofa', 140, 90, g => {
    g.fillStyle(0xc4513a, 1).fillRoundedRect(4, 6, 132, 78, 16).lineStyle(6, T, 1).strokeRoundedRect(4, 6, 132, 78, 16);
    g.fillStyle(0xe27a52, 1).fillRoundedRect(20, 14, 100, 28, 10).lineStyle(4, T, 1).strokeRoundedRect(20, 14, 100, 28, 10);
    g.fillStyle(0xd96a48, 1).fillRoundedRect(20, 46, 44, 30, 8).fillRoundedRect(76, 46, 44, 30, 8);
    g.lineStyle(4, T, 1).strokeRoundedRect(20, 46, 44, 30, 8).strokeRoundedRect(76, 46, 44, 30, 8);
  });
  hacerTextura(scene, 'fu-charco', 130, 84, g => {
    g.fillStyle(0xd9e23a, 1).fillEllipse(65, 42, 118, 70).lineStyle(6, 0x6f7a10, 1).strokeEllipse(65, 42, 118, 70);
    g.fillStyle(0xf4f89a, 1).fillEllipse(44, 30, 30, 14).fillCircle(86, 52, 6).fillCircle(98, 40, 4);
    g.lineStyle(4, T, 1).strokeEllipse(65, 42, 104, 56);
  });
  hacerTextura(scene, 'fu-humo', 210, 150, g => {
    [[50, 90, 40], [100, 60, 52], [155, 88, 42], [80, 108, 36], [132, 112, 34]].forEach(([x, y, r]) => { g.fillStyle(0xd7d0e4, 1).fillCircle(x, y, r).lineStyle(6, T, 1).strokeCircle(x, y, r); });
    [[50, 90, 40], [100, 60, 52], [155, 88, 42], [80, 108, 36], [132, 112, 34]].forEach(([x, y, r]) => g.fillStyle(0xd7d0e4, 1).fillCircle(x, y, r - 3));
    g.fillStyle(0xf1edf7, 1).fillCircle(90, 52, 20).fillCircle(150, 80, 12);
  });
  hacerTextura(scene, 'fu-moncho', 56, 56, g => {
    g.fillStyle(0xffd23f, 1).fillCircle(28, 28, 24).lineStyle(5, T, 1).strokeCircle(28, 28, 24);
    g.lineStyle(3, 0xe0a800, 1).strokeCircle(28, 28, 16);
    g.fillStyle(0xfff3a0, 1).fillCircle(20, 20, 5);
    g.fillStyle(0xe0a800, 1).fillRect(22, 22, 12, 12);
  });
  hacerTextura(scene, 'fu-dorado', 96, 96, g => {
    g.fillStyle(0xfff3a0, 0.4).fillCircle(48, 48, 46);
    g.fillStyle(0xffb800, 1).fillCircle(48, 48, 34).lineStyle(6, T, 1).strokeCircle(48, 48, 34);
    g.lineStyle(4, 0xfff3a0, 1).strokeCircle(48, 48, 24);
    g.fillStyle(0xffffff, 1).fillCircle(36, 34, 7);
    g.fillStyle(0xfff3a0, 1).fillRect(42, 42, 14, 14);
  });
  hacerTextura(scene, 'fu-cartel', 150, 120, g => {
    g.fillStyle(0x6b5f86, 1).fillRect(70, 70, 10, 50).lineStyle(4, T, 1).strokeRect(70, 70, 10, 50);
    g.fillStyle(0x1f8a5a, 1).fillRoundedRect(6, 6, 138, 68, 12).lineStyle(6, T, 1).strokeRoundedRect(6, 6, 138, 68, 12);
    g.lineStyle(4, 0xfff6e8, 1).strokeRoundedRect(14, 14, 122, 52, 8);
    g.fillStyle(0xfff6e8, 1).fillRect(34, 34, 60, 12).fillTriangle(90, 22, 90, 58, 120, 40);
  });
  hacerTextura(scene, 'fu-gasolinera', 210, 190, g => {
    g.fillStyle(0x3a2a55, 1).fillRoundedRect(6, 6, 198, 178, 12).lineStyle(6, T, 1).strokeRoundedRect(6, 6, 198, 178, 12);
    g.fillStyle(0xff3b30, 1).fillRoundedRect(20, 20, 170, 56, 8).lineStyle(5, T, 1).strokeRoundedRect(20, 20, 170, 56, 8);
    g.fillStyle(0xfff6e8, 1).fillRect(20, 40, 170, 14);
    g.fillStyle(0xffd23f, 1).fillRoundedRect(30, 100, 40, 60, 6).fillRoundedRect(140, 100, 40, 60, 6);
    g.lineStyle(4, T, 1).strokeRoundedRect(30, 100, 40, 60, 6).strokeRoundedRect(140, 100, 40, 60, 6);
  });
  hacerTextura(scene, 'fu-pipa', 28, 40, g => {
    g.fillStyle(0xf2e2b0, 1).fillEllipse(14, 20, 20, 32).lineStyle(4, T, 1).strokeEllipse(14, 20, 20, 32);
    g.lineStyle(3, 0x8a6a3a, 1).lineBetween(14, 8, 14, 32);
  });
  hacerTextura(scene, 'fu-meta', 640, 48, g => {
    for (let i = 0; i < 32; i++) for (let j = 0; j < 3; j++) { g.fillStyle((i + j) % 2 ? 0xfff6e8 : T, 1).fillRect(i * 20, j * 16, 20, 16); }
    g.lineStyle(4, T, 1).strokeRect(0, 0, 640, 48);
  });
}

class Furgo extends Phaser.Scene {
  constructor() { super('Furgo'); }

  create(datos) {
    texturasFurgo(this);
    // Todo lo de la partida se reinicia aquí: scene.start reutiliza la instancia.
    this.fase = 'elegir';
    this.base = 0; // puntos antes del multiplicador
    this.monchis = 0;
    this.vidas = 3;
    this.golpes = 0;
    this.racha = 0;
    this.recorrido = 0;
    this.vel = 0;
    this.carril = 1;
    this.invul = 0;
    this.bote = 0;
    this.retraso = 0;
    this.pendiente = 0;
    this.curvaT = 0;
    this.off = 0;
    this.cotineOk = false;
    this.elegidos = [];
    this.caras = {};
    this.obs = [];
    this.voz = null;
    this.charla = null;
    this.panelElegir = null;
    this.nivel = nivelDe('Furgo');
    this.vBase = 360 + 30 * (Math.min(this.nivel, 6) - 1);
    this.metaPx = 19000;
    this.huecoPx = Math.max(190, 330 - 22 * (Math.min(this.nivel, 7) - 1));
    this.sigPx = 500;
    this.sigCartel = 900;
    this.pend = [];
    this.tmr = {};
    // Encargos (misiones secundarias repetibles): carga, evento al azar y control con probabilidad.
    this.encargo = (datos && datos.encargo) || null;
    this.carga = 100;
    this.evento = null;
    this.eventoHecho = false;
    this.trigAt = this.metaPx * Phaser.Math.FloatBetween(0.3, 0.5);
    this.mulVel = 1;
    this.mulHueco = 1;
    this.limpio = true;
    this.controlForzado = false;
    this.pipas = 0;
    this.extras = [];
    this.cliente = null;
    this.eusEstado = 'dormido';

    // El mundo: orilla, asfalto, meta.
    if (this.textures.exists('bg-carretera')) {
      this.lado = this.add.tileSprite(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 'bg-carretera').setDepth(0);
      const f = this.textures.get('bg-carretera').getSourceImage();
      this.lado.setTileScale(ANCHO / f.width);
    } else {
      this.lado = this.add.tileSprite(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 'fu-lado').setDepth(0);
    }
    this.carr = this.add.tileSprite(ANCHO / 2, ALTO / 2, 640, ALTO, 'fu-carretera').setDepth(1);
    this.meta = this.add.tileSprite(ANCHO / 2, -100, 640, 48, 'fu-meta').setDepth(3).setVisible(false);

    // La furgo (con su haz de luz).
    this.haz = this.add.image(FU_X(1), 450, 'fu-haz').setDepth(18).setAlpha(0.9);
    const clave = texO(this, 'obj-furgo', 'fu-furgo');
    this.furgo = this.add.image(FU_X(1), FU_Y, clave).setDepth(20);
    this.furgo.setScale(clave === 'obj-furgo' ? 170 / this.furgo.height : 1);
    this.fw = 62; this.fh = 112;

    // Pool de objetos (se reciclan, no se crean cientos).
    for (let i = 0; i < 30; i++) {
      const im = this.add.image(0, -300, 'fu-cono').setVisible(false);
      im.activo = false;
      this.obs.push(im);
    }
    // Avisos de Perico: un triángulo por carril.
    this.avisos = [0, 1, 2, 3].map(i => {
      const c = this.add.container(FU_X(i), 110).setDepth(58).setVisible(false);
      const g = this.add.graphics();
      g.fillStyle(HEX.amarillo, 1).fillTriangle(0, -34, -34, 26, 34, 26).lineStyle(6, HEX.tinta, 1).strokeTriangle(0, -34, -34, 26, 34, 26);
      c.add([g, this.add.text(0, 6, '!', { fontFamily: FUENTE, fontSize: '38px', color: COLOR.tinta }).setOrigin(0.5)]);
      return c;
    });

    // Capas de ambiente: verde del mareo (Blancaso) y la franja de Puky en el parabrisas.
    this.verde = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x6fd06a, 1).setAlpha(0).setDepth(40);
    this.franja = null;

    this.crearHud();
    this.crearEusebio();
    this.crearControles();
    entrar(this, datos);
    // El director puede pasar los acompañantes ya elegidos (datos.acompanantes) y saltarse el panel.
    if (datos && datos.resumen) {
      // Vuelta del control: el viaje ya está hecho; solo queda enseñar el resultado.
      this.elegidos = (acompanantesFurgo() || []).slice();
      this.fase = 'fin';
      this.mult = MULT_ACOMP[this.elegidos.length] || 1;
      this.montarCaras();
      this.base = datos.resumen.base;
      this.golpes = datos.resumen.golpes;
      this.carga = datos.resumen.carga;
      this.vidas = datos.resumen.vidas;
      this.monchis = datos.resumen.monchis;
      this.time.delayedCall(700, () => this.cerrar(datos.resumen, { gana: !!datos.controlGana, puntos: datos.controlPuntos || 0 }));
      return;
    }
    const previos = datos && Array.isArray(datos.acompanantes) ? datos.acompanantes.filter(id => ACOMP[id]).slice(0, MAX_ACOMP) : null;
    if (previos) {
      this.elegidos = previos;
      this.time.delayedCall(datos.rotulo ? 1900 : 300, () => this.arrancar());
    } else {
      this.elegidos = (acompanantesFurgo() || []).slice();
      this.time.delayedCall(datos && datos.rotulo ? 1900 : 200, () => this.abrirEleccion());
    }
  }

  // ---------------------------------------------------------------- HUD y mandos

  crearHud() {
    this.txtPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(70);
    this.txtMult = texto(this, 150, 80, '', 22, COLOR.crema).setDepth(70);
    this.vidasG = [0, 1, 2].map(i => this.add.circle(52 + i * 46, 128, 15, HEX.rosa).setStrokeStyle(4, HEX.tinta).setDepth(70));
    this.add.image(46, 184, 'fu-moncho').setDepth(70).setScale(0.8);
    this.txtMonchis = texto(this, 150, 184, 'x0', 30, COLOR.amarillo).setDepth(70);
    if (this.encargo && this.encargo.carga === 'fragil') {
      texto(this, 80, 232, 'Carga', 22, COLOR.crema).setDepth(70);
      this.add.rectangle(215, 232, 130, 20, 0x000000, 0.5).setStrokeStyle(3, HEX.crema).setDepth(70);
      this.barraCarga = this.add.rectangle(150, 232, 130, 14, 0x7ee081).setOrigin(0, 0.5).setDepth(71);
    }
    // Barra de recorrido a la derecha: sube la furgo hasta la bandera.
    this.add.rectangle(1244, 300, 18, 440, 0x000000, 0.45).setStrokeStyle(4, HEX.crema).setDepth(70);
    this.add.rectangle(1244, 76, 34, 14, HEX.crema).setStrokeStyle(3, HEX.tinta).setDepth(71);
    this.marca = this.add.image(1244, 520, 'fu-furgo').setScale(0.32).setDepth(72);
  }

  crearControles() {
    this.teclas = this.input.keyboard.addKeys('LEFT,RIGHT,A,D,ENTER');
    this.input.keyboard.on('keydown', e => {
      const k = e.key;
      if (this.fase === 'viaje') {
        if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.mover(-1);
        else if (k === 'ArrowRight' || k === 'd' || k === 'D') this.mover(1);
      } else if (this.fase === 'elegir' && this.panelElegir) {
        if (k >= '1' && k <= '7') this.alternar(ACOMP_ORDEN[Number(k) - 1]);
        else if (k === 'Enter') this.arrancar();
      }
    });
    // Tocar a la izquierda o a la derecha de la pantalla.
    this.input.on('pointerdown', p => {
      if (this.fase !== 'viaje') return;
      this.mover(p.x < ANCHO / 2 ? -1 : 1);
    });
    this.tactil = MOVIL || (typeof Tactil !== 'undefined' && Tactil.activo);
    if (this.tactil) {
      [[110, -1], [ANCHO - 110, 1]].forEach(([x, d]) => {
        const g = this.add.graphics().setDepth(65).setAlpha(0.45);
        g.fillStyle(HEX.tinta, 0.7).fillCircle(x, ALTO - 90, 56).lineStyle(5, HEX.crema, 1).strokeCircle(x, ALTO - 90, 56);
        g.fillStyle(HEX.crema, 1).fillTriangle(x + d * 22, ALTO - 90, x - d * 16, ALTO - 112, x - d * 16, ALTO - 68);
      });
    }
  }

  // ---------------------------------------------------------------- elegir acompañantes

  abrirEleccion() {
    if (this.panelElegir || this.fase !== 'elegir') return;
    const c = this.add.container(ANCHO / 2, ALTO / 2).setDepth(700).setScale(0);
    const g = this.add.graphics();
    g.fillStyle(HEX.morado, 1).fillRoundedRect(-540, -300, 1080, 600, 36).lineStyle(8, HEX.tinta, 1).strokeRoundedRect(-540, -300, 1080, 600, 36);
    c.add(g);
    c.add(texto(this, 0, -250, '¿Quién se sube a la furgo?', 50, COLOR.amarillo, 1000));
    this.txtElegir = texto(this, 0, -196, '', 24, COLOR.crema, 1000);
    c.add(this.txtElegir);
    this.cartas = {};
    ACOMP_ORDEN.forEach((id, i) => {
      const fila = i < 4 ? 0 : 1;
      const n = fila === 0 ? 4 : 3;
      const col = fila === 0 ? i : i - 4;
      const x = (col - (n - 1) / 2) * 236;
      const y = fila === 0 ? -80 : 106;
      const carta = this.add.container(x, y);
      const fondoC = this.add.graphics();
      carta.add(fondoC);
      const A = ACOMP[id];
      const img = this.add.image(0, -28, A.cara);
      img.setScale(96 / Math.max(img.width, img.height));
      carta.add(img);
      carta.add(this.add.text(0, 52, A.nombre, { fontFamily: FUENTE, fontSize: '26px', color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 5 }).setOrigin(0.5));
      const num = this.add.container(-84, -66).setVisible(false);
      num.add(this.add.circle(0, 0, 18, HEX.amarillo).setStrokeStyle(4, HEX.tinta));
      num.t = this.add.text(0, 0, '1', { fontFamily: FUENTE, fontSize: '22px', color: COLOR.tinta }).setOrigin(0.5);
      num.add(num.t);
      carta.add(num);
      carta.setSize(216, 170).setInteractive({ useHandCursor: true });
      carta.on('pointerdown', () => this.alternar(id));
      carta.fondoG = fondoC; carta.num = num; carta.img = img;
      c.add(carta);
      this.cartas[id] = carta;
    });
    this.btnArranca = boton(this, 0, 246, '', () => this.arrancar(), { ancho: 520, alto: 84, tam: 32, color: HEX.amarillo });
    c.add(this.btnArranca);
    this.panelElegir = c;
    this.pintarEleccion();
    this.tweens.add({ targets: c, scale: ESCALA_UI, duration: 380, ease: 'Back.out' });
  }

  alternar(id) {
    if (this.fase !== 'elegir' || !this.panelElegir || !ACOMP[id]) return;
    const i = this.elegidos.indexOf(id);
    if (i >= 0) this.elegidos.splice(i, 1);
    else if (this.elegidos.length < MAX_ACOMP) this.elegidos.push(id);
    else { sfx(this, 'bonk', { volume: 0.4 }); this.cameras.main.shake(90, 0.004); return; }
    sfx(this, i >= 0 ? 'pop' : 'boing', { volume: 0.35 });
    this.pintarEleccion();
    const carta = this.cartas[id];
    if (carta) this.tweens.add({ targets: carta, scale: { from: 0.9, to: 1 }, duration: 200, ease: 'Back.out' });
  }

  pintarEleccion() {
    ACOMP_ORDEN.forEach(id => {
      const carta = this.cartas[id];
      const sel = this.elegidos.indexOf(id);
      carta.fondoG.clear();
      carta.fondoG.fillStyle(sel >= 0 ? ACOMP[id].color : 0x3a2a55, sel >= 0 ? 0.9 : 1).fillRoundedRect(-108, -85, 216, 170, 22);
      carta.fondoG.lineStyle(sel >= 0 ? 8 : 5, sel >= 0 ? HEX.amarillo : HEX.tinta, 1).strokeRoundedRect(-108, -85, 216, 170, 22);
      carta.num.setVisible(sel >= 0);
      if (sel >= 0) carta.num.t.setText(String(sel + 1));
      carta.setAlpha(sel < 0 && this.elegidos.length >= MAX_ACOMP ? 0.55 : 1);
    });
    const n = this.elegidos.length;
    const m = String(MULT_ACOMP[n]).replace('.', ',');
    this.txtElegir.setText(n === 0 ? 'Hasta 3 a bordo · más gente, más puntos y más lío' : `A bordo: ${n} de ${MAX_ACOMP}  ·  puntos x${m}`);
    this.btnArranca.etiqueta.setText(n === 0 ? 'Salir sin nadie (Enter)' : '¡A la carretera! (Enter)');
  }

  arrancar() {
    if (this.fase !== 'elegir') return;
    this.fase = 'cuenta';
    ESTADO.furgoAcompanantes = this.elegidos.slice();
    if (typeof guardarPartida === 'function') guardarPartida();
    if (this.panelElegir) {
      const p = this.panelElegir;
      this.panelElegir = null;
      this.tweens.add({ targets: p, scale: 0, duration: 220, ease: 'Back.in', onComplete: () => p.destroy() });
    }
    this.montarCaras();
    this.eusebio('normal', 0, 'arrancar');
    this.mult = MULT_ACOMP[this.elegidos.length];
    this.txtMult.setText(this.elegidos.length ? `x${String(this.mult).replace('.', ',')} · ${this.elegidos.length} a bordo` : 'sin nadie a bordo');
    // Ritmos propios de cada uno (en segundos hasta su próxima aparición).
    this.tmr = { lasslow: Phaser.Math.FloatBetween(5, 8), palicaso: Phaser.Math.FloatBetween(6, 10), cotine: Phaser.Math.FloatBetween(7, 10), blancaso: Phaser.Math.FloatBetween(4, 7), voz: 4 };
    if (this.va('puky')) this.ponerFranja();
    this.factorVel = this.va('pompa') ? 0.78 : 1;
    const t = texto(this, ANCHO / 2, ALTO / 2 - 40, '¡Arranca!', 72, COLOR.amarillo).setDepth(900).setScale(0);
    sfx(this, 'bocina', { volume: 0.5 });
    this.tweens.add({ targets: t, scale: 1, duration: 260, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, delay: 800, duration: 300, onComplete: () => t.destroy() });
    this.hint = texto(this, 150, 400, this.tactil ? 'Toca a un lado\npara cambiar de carril' : '← →  o  A D\npara cambiar de carril', 22, COLOR.crema).setDepth(70);
    this.tweens.add({ targets: this.hint, alpha: 0, delay: 5500, duration: 700, onComplete: () => this.hint.destroy() });
    this.time.delayedCall(900, () => { if (this.fase === 'cuenta') this.fase = 'viaje'; });
  }

  va(id) { return this.elegidos.indexOf(id) >= 0; }

  montarCaras() {
    const lista = this.elegidos.slice();
    // El cliente de un encargo de pasajero va también a bordo (comenta, no cuenta para el multiplicador).
    const e = this.encargo;
    if (e && e.carga === 'pasajero' && e.cliente && lista.indexOf(e.cliente) < 0 && lista.length < 4) {
      const q = typeof QUIEN !== 'undefined' ? QUIEN[e.cliente] : null;
      if (q || ACOMP[e.cliente]) {
        const A = ACOMP[e.cliente];
        ACOMP_CLIENTE[e.cliente] = A || { nombre: q.nombre, cara: q.sprite, alt: q.sprite, color: 0xfff6e8 };
        lista.push(e.cliente);
        this.cliente = e.cliente;
      }
    }
    this.todos = lista;
    lista.forEach((id, i) => {
      const A = ACOMP[id] || ACOMP_CLIENTE[id];
      const x = 990 + i * 84;
      const cont = this.add.container(x, 650).setDepth(66);
      const g = this.add.graphics();
      g.fillStyle(A.color, 1).fillCircle(0, 0, 38).lineStyle(6, HEX.tinta, 1).strokeCircle(0, 0, 38);
      const img = this.add.image(0, 0, A.cara);
      img.setScale(62 / Math.max(img.width, img.height));
      cont.add([g, img]);
      cont.img = img;
      cont.base = img.scaleX;
      this.caras[id] = cont;
      cont.setScale(0);
      this.tweens.add({ targets: cont, scale: 1, duration: 300, delay: 150 * i, ease: 'Back.out' });
    });
  }

  // Cambia un momento la cara de un acompañante.
  cara(id, alt, ms = 1200) {
    const c = this.caras[id];
    if (!c || !c.img.active) return;
    const A = ACOMP[id] || ACOMP_CLIENTE[id];
    const k = alt ? texO(this, A.alt, A.cara) : A.cara;
    c.img.setTexture(k).setScale(62 / Math.max(c.img.width, c.img.height));
    if (alt) this.time.delayedCall(ms, () => { if (c.img.active && !(id === 'pompa' && this.golpes > 0)) this.cara(id, false); });
  }

  // Una sola voz a la vez: el bocadillo sale encima de la cara de quien habla.
  decir(id, str, ms = 1900) {
    if (id === 'eusebio') return this.pie(str, ms);
    const c = this.caras[id];
    if (!c || !str || this.fase === 'fin') return;
    if (this.voz && this.voz.scene) this.voz.destroy();
    const b = bocadillo(this, 1110, 540, str, { ancho: 300, tam: 22 }).setDepth(80);
    this.voz = b;
    this.tweens.add({ targets: c, y: c.y - 10, duration: 120, yoyo: true, repeat: 1 });
    this.time.delayedCall(ms, () => {
      if (!b.scene) return;
      this.tweens.add({ targets: b, alpha: 0, duration: 250, onComplete: () => { if (b.scene) b.destroy(); } });
    });
  }

  // Pie de texto narrado (Don Eusebio, eventos): abajo a la izquierda, sin bocadillo.
  pie(str, ms = 3200) {
    if (!str) return;
    if (this.pieT && this.pieT.scene) this.pieT.destroy();
    const t = this.add.text(170, 612, str, { fontFamily: FUENTE, fontSize: `${MOVIL ? 17 : 15}px`, color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 4, align: 'center', wordWrap: { width: 290 }, fontStyle: 'italic' }).setOrigin(0.5, 0).setDepth(80);
    this.pieT = t;
    this.tweens.add({ targets: t, alpha: 0, delay: ms, duration: 400, onComplete: () => t.destroy() });
  }

  // Puky va pegado al parabrisas: una franja de baba y su cara tapan la parte alta de la vista.
  ponerFranja() {
    const c = this.add.container(ANCHO / 2, 66).setDepth(45);
    const g = this.add.graphics();
    g.fillStyle(0xf5d23a, 0.92).fillRoundedRect(-330, -52, 660, 104, 40).lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-330, -52, 660, 104, 40);
    g.fillStyle(0xf5d23a, 0.92).fillRoundedRect(-250, 44, 30, 60, 14).fillRoundedRect(150, 44, 36, 80, 16).fillRoundedRect(-60, 44, 26, 40, 12);
    g.fillStyle(0xfff3a0, 0.7).fillEllipse(-200, -24, 120, 20).fillEllipse(220, -20, 90, 16);
    const k = texO(this, 'puky-que-rico', 'puky');
    const img = this.add.image(0, 6, k);
    img.setScale(112 / img.height);
    const img2 = this.add.image(-230, 8, texO(this, 'puky-gracioso', 'puky'));
    img2.setScale(70 / img2.height).setAlpha(0.9);
    c.add([g, img, img2]);
    this.tweens.add({ targets: c, x: ANCHO / 2 + 18, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: img, angle: 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.franja = c;
  }

  // ---------------------------------------------------------------- movimiento

  mover(d) {
    if (this.fase !== 'viaje') return;
    // Cuando a Lasslow le entra la risa, la furgo bota y la orden llega con retraso.
    if (this.retraso > 0) { this.pendiente = d; return; }
    this.aplicarMover(d);
  }

  aplicarMover(d) {
    const n = Phaser.Math.Clamp(this.carril + d, 0, 3);
    if (n === this.carril) return;
    this.carril = n;
    sfx(this, 'whoosh', { volume: 0.12 });
    if (Math.random() < 0.22) this.eusebio('feliz', 500, 'curva');
  }

  // ---------------------------------------------------------------- objetos del camino

  libre() { return this.obs.find(o => !o.activo); }

  poner(tipo, carril, y = -110) {
    const o = this.libre();
    if (!o) return null;
    const F = {
      cono: ['fu-cono', 'obj-cono', 46, 46, 1, 56], bache: ['fu-bache', 'obj-bache', 104, 60, 1, 70], sofa: ['fu-sofa', null, 120, 74, 1, 110],
      charco: ['fu-charco', null, 108, 64, 1, 100], humo: ['fu-humo', null, 0, 0, 0, 190], moncho: ['fu-moncho', 'obj-ficha-monchi', 46, 46, 0, 48],
      dorado: ['fu-dorado', null, 62, 62, 0, 70], pipa: ['fu-pipa', null, 40, 44, 0, 40], cruza: ['puky', null, 84, 64, 1, 92], cartel: ['fu-cartel', null, 0, 0, 0, 120], gasolinera: ['fu-gasolinera', null, 0, 0, 0, 190],
    }[tipo];
    const clave = F[1] ? texO(this, F[1], F[0]) : F[0];
    o.setTexture(clave).setVisible(true).setAlpha(1).setAngle(0);
    o.setScale(F[5] / o.height);
    o.vx = 0; o.tipo = tipo; o.carril = carril; o.w = F[2]; o.h = F[3]; o.dano = F[4]; o.activo = true; o.tomado = false; o.pasado = false; o.lado = 0;
    o.setDepth(tipo === 'humo' ? 30 : tipo === 'cartel' || tipo === 'gasolinera' ? 5 : 10);
    o.y = y;
    if (tipo === 'humo') o.setAlpha(0.92);
    if (tipo === 'sofa') o.setAngle(Phaser.Math.Between(-12, 12));
    return o;
  }

  desactivar(o) { o.activo = false; o.setVisible(false); o.y = -300; }

  // Crea lo que toca por delante (a distancia, no por tiempo: así la Pompa también tiene su ritmo).
  generar() {
    const prog = this.recorrido / this.metaPx;
    const ev = this.evento && this.evento.tipo;
    if (ev === 'obras') {
      // Desvío por obras: dos carriles cortados con conos; por los otros dos, monchis.
      const cerrados = this.obrasCarriles;
      [0, 1, 2, 3].forEach(l => { if (cerrados.indexOf(l) >= 0) this.poner('cono', l); else this.poner('moncho', l, -110 - (l % 2) * 60); });
      return;
    }
    if (ev === 'baches') {
      const l = Phaser.Utils.Array.Shuffle([0, 1, 2, 3]);
      this.poner('bache', l[0]); this.poner('bache', l[1], -200); this.poner('moncho', l[2], -110);
      return;
    }
    const doble = this.nivel >= 2 && Math.random() < 0.28 + 0.04 * this.nivel;
    if (Math.random() < 0.58) {
      let tipos = ['cono', 'cono', 'bache', 'charco'];
      if (prog > 0.18 || this.nivel >= 2) tipos.push('sofa');
      const lista = Phaser.Utils.Array.Shuffle([0, 1, 2, 3]);
      const n = doble ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const t = Phaser.Utils.Array.GetRandom(tipos);
        // Con Perico a bordo, a veces avisa un momento antes de que salga.
        if (i === 0 && this.va('perico') && Math.random() < 0.45) {
          this.pend.push({ t: 0.9, tipo: t, carril: lista[i] });
          this.avisar(lista[i]);
        } else this.poner(t, lista[i]);
      }
    } else if (Math.random() < 0.18 && prog > 0.1) {
      this.poner('humo', Phaser.Math.Between(0, 2) + 0.5);
    } else {
      const c = Phaser.Math.Between(0, 3);
      for (let i = 0; i < 3; i++) this.poner('moncho', c, -110 - i * 95);
    }
  }

  avisar(carril) {
    const a = this.avisos[carril];
    a.setVisible(true).setAlpha(1).setScale(0);
    this.tweens.add({ targets: a, scale: 1, duration: 180, ease: 'Back.out' });
    this.tweens.add({ targets: a, alpha: 0.3, duration: 130, yoyo: true, repeat: 3, delay: 300 });
    this.time.delayedCall(1000, () => a.setVisible(false));
    sfx(this, 'pin-pin', { volume: 0.4 });
    this.cara('perico', true, 900);
    this.decir('perico', 'Pin pin… ¡cuidado!', 1200);
  }

  // ---------------------------------------------------------------- el bucle del viaje

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    // En la elección y al final la carretera avanza despacito (para que se vea viva).
    if (this.fase === 'elegir' || this.fase === 'fin') {
      const v = this.fase === 'fin' ? (this.vel = Math.max(0, this.vel - 500 * dt)) : 140;
      this.carr.tilePositionY -= v * dt; this.lado.tilePositionY -= v * dt;
      this.ponerFurgo(dt);
      return;
    }
    if (this.fase !== 'viaje' && this.fase !== 'cuenta') return;
    const objetivo = this.fase === 'viaje' ? this.vBase * (this.factorVel || 1) * this.mulVel : 0;
    this.vel += (objetivo - this.vel) * Math.min(1, 2.2 * dt);
    if (this.fase === 'cuenta') { this.carr.tilePositionY -= 140 * dt; this.lado.tilePositionY -= 140 * dt; this.ponerFurgo(dt); return; }
    this.recorrido += this.vel * dt;
    this.carr.tilePositionY -= this.vel * dt;
    this.lado.tilePositionY -= this.vel * dt;
    this.invul = Math.max(0, this.invul - dt);

    // Curvas: la carretera ondula (más fuerte con Blancaso, que se marea y se pone verde).
    this.curvaT += dt;
    const amp = this.va('blancaso') ? 70 : 0;
    const env = 0.5 + 0.5 * Math.sin(this.curvaT * 0.33);
    this.off = amp * env * Math.sin(this.curvaT * 0.95);
    this.carr.x = ANCHO / 2 + this.off;
    this.verde.setAlpha(amp ? 0.05 + 0.2 * Math.abs(this.off / amp) * env : 0);

    this.ponerFurgo(dt);
    this.companeros(dt);
    this.eventos(dt);

    // Retraso de la risa de Lasslow.
    if (this.retraso > 0) {
      this.retraso -= dt;
      if (this.retraso <= 0 && this.pendiente) { this.aplicarMover(this.pendiente); this.pendiente = 0; }
    }

    // Generación por distancia.
    this.sigPx -= this.vel * dt;
    if (this.sigPx <= 0 && this.recorrido < this.metaPx - 1500) { this.generar(); this.sigPx = this.huecoPx * this.mulHueco * Phaser.Math.FloatBetween(0.9, 1.35); }
    this.sigCartel -= this.vel * dt;
    if (this.sigCartel <= 0) { this.poner('cartel', -1); this.sigCartel = Phaser.Math.Between(1700, 2400); }
    for (let i = this.pend.length - 1; i >= 0; i--) {
      const p = this.pend[i];
      p.t -= dt;
      if (p.t <= 0) { this.poner(p.tipo, p.carril); this.pend.splice(i, 1); }
    }

    // Mover y chocar.
    const fx = this.furgo.x, fy = this.furgo.y;
    for (const o of this.obs) {
      if (!o.activo) continue;
      o.y += this.vel * dt;
      if (o.tipo === 'cruza') o.x += o.vx * dt;
      else if (o.tipo === 'cartel' || o.tipo === 'gasolinera') o.x = o.carril === -1 ? (o.lado || (o.lado = Math.random() < 0.5 ? 210 : 1060)) : 1070;
      else o.x = FU_X(o.carril) + this.off;
      if (o.tipo === 'cartel') {
        if (!o.pasado && o.y > fy) { o.pasado = true; if (this.va('perico') && this.fase === 'viaje') this.pinCartel(); }
      }
      if (o.y > ALTO + 150) { this.desactivar(o); continue; }
      if (o.tomado || o.tipo === 'humo' || o.tipo === 'cartel' || o.tipo === 'gasolinera') continue;
      if (Math.abs(o.x - fx) < (o.w + this.fw) / 2 - 8 && Math.abs(o.y - fy) < (o.h + this.fh) / 2 - 8) this.toca(o);
    }
    // Meta.
    const faltan = this.metaPx - this.recorrido;
    if (faltan < 760) {
      this.meta.setVisible(true).setPosition(ANCHO / 2 + this.off, fy - faltan);
      if (faltan <= 0) return this.final(true);
    }
    this.marca.y = 520 - 440 * Math.min(1, this.recorrido / this.metaPx);
    this.pintarMarcador();
  }

  ponerFurgo(dt) {
    const f = this.furgo;
    const objetivo = FU_X(this.carril) + this.off;
    const antes = f.x;
    f.x += (objetivo - f.x) * Math.min(1, 14 * dt);
    f.setAngle(Phaser.Math.Clamp((f.x - antes) * 3.2, -14, 14) + (this.bote || 0));
    this.haz.setPosition(f.x, f.y - 120);
    f.setAlpha(this.invul > 0 && Math.floor(this.invul * 12) % 2 ? 0.35 : 1);
  }

  pinCartel() {
    sfx(this, 'pin-pin', { volume: 0.35 });
    this.cara('perico', true, 700);
    if (Math.random() < 0.5) this.decir('perico', Phaser.Utils.Array.GetRandom(['Pin pin.', 'Pin pin, pin pin.', '¡Cartel! Pin pin.']), 900);
  }

  toca(o) {
    if (o.tipo === 'pipa') {
      o.tomado = true;
      this.desactivar(o);
      this.pipas++;
      this.base += 25;
      sfx(this, 'nam', { volume: 0.35 });
      golpeTexto(this, o.x, o.y - 40, `Pipa ${this.pipas}`, COLOR.amarillo, 26);
      return;
    }
    if (o.tipo === 'cruza' && this.va('puky')) {
      o.tomado = true;
      golpeTexto(this, o.x, o.y - 50, '¡Puky!', COLOR.amarillo, 30);
      this.base += 30;
      return;
    }
    if (o.tipo === 'moncho' || o.tipo === 'dorado') {
      o.tomado = true;
      this.desactivar(o);
      if (o.tipo === 'moncho') {
        this.monchis++;
        this.racha++;
        this.base += 20;
        sfx(this, 'pop', { volume: 0.28 });
        if (this.racha % 6 === 0) { this.base += 100; Comic.racha(this, this.racha, { x: ANCHO / 2, y: 200 }); }
        this.pintarMarcador();
      } else {
        this.base += 150;
        this.cotineOk = true;
        sfx(this, 'campanita', { volume: 0.6 });
        Comic.confeti(this, { n: 14, profundidad: 600 });
        if (this.vidas < 3) {
          this.vidas++;
          this.vidasG[this.vidas - 1].setFillStyle(HEX.rosa);
          golpeTexto(this, this.furgo.x, this.furgo.y - 100, '¡Una vida más!', COLOR.verde, 38);
        } else golpeTexto(this, this.furgo.x, this.furgo.y - 100, '¡Monchi dorado! +150', COLOR.amarillo, 34);
        if (this.va('cotine')) { this.cara('cotine', false); this.decir('cotine', '…Vale. Ya no digo nada.', 2200); }
      }
      return;
    }
    if (o.tipo === 'charco' && this.va('puky')) {
      // Los charcos de Puky no le hacen daño a Puky ni a nadie que vaya con él.
      o.tomado = true;
      this.base += 30;
      this.cara('puky', true, 900);
      golpeTexto(this, o.x, o.y - 50, '¡Qué rico!', COLOR.amarillo, 30);
      sfx(this, 'chapoteo', { volume: 0.4 });
      return;
    }
    if (this.invul > 0) return;
    this.choque(o);
  }

  choque(o) {
    o.tomado = true;
    this.invul = 1.5;
    this.racha = 0;
    this.golpes++;
    this.limpio = false;
    if (this.evento) this.evento.limpio = false;
    if (this.encargo && this.encargo.carga === 'fragil') {
      this.carga = Math.max(0, this.carga - 34);
      golpeTexto(this, 150, 270, this.carga > 0 ? '¡La carga!' : '¡Carga hecha trizas!', COLOR.rosa, 26);
    }
    this.eusebio('susto', 1300, 'golpe');
    if (this.cliente && Math.random() < 0.7) this.decir(this.cliente, Phaser.Utils.Array.GetRandom(['¡Ay! ¿Quién conduce?', 'Yo he pagado por un viaje tranquilo.', '¡Mi espalda!']), 1700);
    const dano = this.va('pompa') ? 2 : 1;
    for (let i = 0; i < dano; i++) {
      if (this.vidas > 0) { this.vidas--; this.vidasG[this.vidas].setFillStyle(0x3d3350); }
    }
    sfx(this, o.tipo === 'sofa' ? 'bocina' : 'golpe', { volume: 0.6 });
    if (o.tipo === 'sofa') sfx(this, 'boing', { volume: 0.4 });
    this.cameras.main.shake(260, 0.012);
    Comic.impacto(this, this.furgo.x, this.furgo.y - 60, { tam: 80, profundidad: 85 });
    this.tweens.add({ targets: this.furgo, angle: { from: -20, to: 0 }, duration: 380, ease: 'Back.out' });
    golpeTexto(this, this.furgo.x, this.furgo.y - 110, Phaser.Utils.Array.GetRandom(['¡PLAM!', '¡BONK!', '¡CRAC!']), COLOR.rosa, 44);
    if (o.tipo === 'charco') { this.desactivar(o); }
    if (this.va('pompa')) {
      // Ella pierde el doble: tiembla y se hincha, a punto de reventar.
      const c = this.caras.pompa;
      this.cara('pompa', true, 99999);
      if (c) {
        c.setScale(1 + 0.12 * this.golpes);
        this.tweens.add({ targets: c, angle: { from: -10, to: 10 }, duration: 60, yoyo: true, repeat: 8, onComplete: () => { c.angle = 0; } });
        c.img.setTint(this.golpes > 1 ? 0xff7777 : 0xffcccc);
      }
      this.decir('pompa', 'Yo no, que exploto.', 1800);
    }
    if (this.vidas <= 0) this.final(false);
  }

  // Lo que hace cada acompañante mientras dura el viaje (sin decir qué siente: se ve).
  companeros(dt) {
    const t = this.tmr;
    if (this.va('lasslow') && (t.lasslow -= dt) <= 0) {
      t.lasslow = Phaser.Math.FloatBetween(9, 14);
      // Le entra la risa: la furgo bota y las órdenes llegan tarde.
      this.cara('lasslow', true, 1400);
      this.decir('lasslow', Phaser.Utils.Array.GetRandom(['Ji ji ji… ¡jajaja!', 'Perdón, perdón… ¡jajaja!', '¡Es que… jajaja!']), 1500);
      sfx(this, 'risa-lasslow', { volume: 0.5 });
      this.cameras.main.shake(800, 0.007);
      this.retraso = 0.9;
      this.tweens.add({ targets: this, bote: { from: -8, to: 8 }, duration: 90, yoyo: true, repeat: 8, onComplete: () => { this.bote = 0; } });
      this.tweens.add({ targets: this.furgo, scaleX: this.furgo.scaleX * 1.06, scaleY: this.furgo.scaleY * 0.94, duration: 100, yoyo: true, repeat: 6 });
    }
    if (this.va('palicaso') && (t.palicaso -= dt) <= 0) {
      t.palicaso = Phaser.Math.FloatBetween(12, 17);
      this.palicasoHabla();
    }
    if (this.va('cotine') && !this.cotineOk && (t.cotine -= dt) <= 0) {
      t.cotine = Phaser.Math.FloatBetween(15, 20);
      this.cotinePide();
    }
    if (this.va('blancaso') && (t.blancaso -= dt) <= 0) {
      t.blancaso = Phaser.Math.FloatBetween(7, 11);
      const c = this.caras.blancaso;
      this.cara('blancaso', true, 2000);
      if (c) Comic.emote(this, c.x, c.y - 60, 'mareo', { profundidad: 90 });
      if (Math.random() < 0.5) this.decir('blancaso', Phaser.Utils.Array.GetRandom(['Uf… otra curva.', 'Apunto: mareo, 14:32.', 'Cuando pares, me bajo. Un momentito.']), 1700);
    }
  }

  // El bocadillo enorme de Palicaso tapa media carretera unos segundos.
  palicasoHabla() {
    if (this.charla && this.charla.scene) this.charla.destroy();
    const lista = this.charlas && this.charlas.length ? this.charlas : (this.charlas = Phaser.Utils.Array.Shuffle([
      '¡Escucha, escucha! Que te cuento lo de mi primo, el de la furgoneta, que un día…',
      'Y entonces le dije: «mira, que yo ya lo había dicho», y él, que no, que sí…',
      'Pues eso, que como te decía, y no me interrumpas, que viene lo mejor…',
      '¿Te he contado lo de la gasolinera? Pues escucha, que tiene tela…',
    ]));
    const txt = lista.pop();
    this.cara('palicaso', true, 3200);
    const b = bocadillo(this, ANCHO / 2, 230, txt, { ancho: 620, tam: 38 }).setDepth(52);
    this.charla = b;
    this.tweens.add({ targets: b, y: 240, duration: 500, yoyo: true, repeat: 3, ease: 'Sine.inOut' });
    this.time.delayedCall(3600, () => {
      if (!b.scene) return;
      this.tweens.add({ targets: b, alpha: 0, scale: 0.7, duration: 300, onComplete: () => { if (b.scene) b.destroy(); } });
    });
  }

  // Cotine pide parar; el monchi dorado de la gasolinera la calla (y te da una vida).
  cotinePide() {
    this.decir('cotine', Phaser.Utils.Array.GetRandom(['¡Para en esa gasolinera!', '¡Para, para, que me ha entrado el hambre!', '¡Gasolinera! ¡Ahí!']), 2200);
    this.cara('cotine', true, 1500);
    this.poner('gasolinera', 3, -140);
    this.poner('dorado', 3, -140);
  }

  pintarMarcador() {
    this.txtPuntos.setText(`${Math.round(this.base * (this.mult || 1))} puntos`);
    this.txtMonchis.setText(`x${this.monchis}`);
    if (this.barraCarga) { this.barraCarga.width = 130 * this.carga / 100; this.barraCarga.setFillStyle(this.carga > 60 ? 0x7ee081 : this.carga > 0 ? 0xffd23f : 0xff3b30); }
  }

  // ---------------------------------------------------------------- Don Eusebio (el hámster de la guantera)

  crearEusebio() {
    const c = this.add.container(190, 480).setDepth(30);
    this.eusCuerpo = this.add.container(0, 22);
    const caja = this.add.graphics();
    caja.fillStyle(0x3a2a55, 1).fillRoundedRect(-78, 32, 156, 70, 14).lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-78, 32, 156, 70, 14);
    caja.fillStyle(0xbdb3d0, 1).fillRoundedRect(-22, 40, 44, 9, 4);
    c.add([this.eusCuerpo, caja]);
    this.eusC = c;
    this.eusebio('dormido');
    this.eusebioBaila(false);
  }

  // Cambia su pose (y vuelve a la normal pasado `ms`); a veces comenta algo.
  eusebio(estado, ms = 0, clave = null) {
    if (!this.eusCuerpo || !this.eusCuerpo.scene) return;
    this.eusEstado = estado;
    dibujaEusebio(this, this.eusCuerpo, estado, 88);
    this.tweens.add({ targets: this.eusCuerpo, y: { from: 40, to: 22 }, duration: 200, ease: 'Back.out' });
    if (ms) this.time.delayedCall(ms, () => { if (this.eusEstado === estado && this.fase !== 'fin' && this.eusCuerpo.scene) this.eusebio('normal'); });
    if (clave && !(this.pieT && this.pieT.scene) && Math.random() < 0.6) this.pie(frasesEusebio(clave), 3400);
  }

  // Los bigotes se mueven con la música (o respira despacito si no hay música).
  eusebioBaila(on) {
    if (!this.eusCuerpo || !this.eusCuerpo.scene) return;
    if (this.tweenEus) this.tweenEus.stop();
    this.eusCuerpo.setAngle(0).setScale(1);
    this.tweenEus = on
      ? this.tweens.add({ targets: this.eusCuerpo, angle: { from: -7, to: 7 }, duration: 230, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
      : this.tweens.add({ targets: this.eusCuerpo, scaleY: 1.04, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // ---------------------------------------------------------------- un evento al azar por viaje (solo en encargos)

  eventos(dt) {
    if (this.encargo && !this.eventoHecho && !this.evento && this.recorrido > this.trigAt && this.recorrido < this.metaPx - 4200) this.iniciarEvento();
    const ev = this.evento;
    if (!ev) return;
    ev.t -= dt;
    if (ev.tipo === 'lluvia') {
      this.extras.forEach(n => { if (n.nube) { n.y += 260 * dt; if (n.y > ALTO + 140) n.y = -140; } });
    } else if (ev.tipo === 'radio') {
      if ((ev.p -= dt) <= 0) { ev.p = 0.55; this.poner('moncho', Phaser.Math.Between(0, 3), -100); }
    } else if (ev.tipo === 'eusebio') {
      const r = this.runner;
      if (r && r.scene) { r.x = ANCHO / 2 + Math.sin(ev.t * 1.7) * 280; r.y = 70 + Math.sin(ev.t * 5) * 8; }
      if (ev.n < 5 && (ev.p -= dt) <= 0) { ev.p = 1; ev.n++; this.poner('pipa', Phaser.Math.Between(0, 3), -100); }
    }
    if (ev.t <= 0) this.finEvento();
  }

  iniciarEvento() {
    const id = (this.encargo && this.encargo.evento) || Phaser.Utils.Array.GetRandom(['atajo', 'gasolinera', 'puky', 'lluvia', 'obras', 'radio', 'eusebio', 'sirena', 'baches']);
    this.eventoHecho = true;
    this.pie(textoEvento(id), 4200);
    const ev = { tipo: id, t: 5, limpio: true, p: 0.5, n: 0 };
    this.evento = ev;
    const aviso = (txt, col = COLOR.amarillo) => golpeTexto(this, ANCHO / 2, 250, txt, col, 44);
    const capa = (obj) => { this.extras.push(obj); return obj; };
    if (id === 'atajo') {
      ev.t = 6; this.mulVel = 1.3; this.mulHueco = 0.55;
      aviso('¡Atajo por el callejón!');
      capa(this.add.rectangle(ANCHO / 2, ALTO / 2, 640, ALTO, 0x000000, 0.3).setDepth(35));
      const m = capa(this.add.graphics().setDepth(34));
      m.fillStyle(0x6b4a3a, 1).fillRect(320, 0, 34, ALTO).fillRect(926, 0, 34, ALTO).lineStyle(5, HEX.tinta, 1).strokeRect(320, -5, 34, ALTO + 10).strokeRect(926, -5, 34, ALTO + 10);
      sfx(this, 'whoosh', { volume: 0.5 });
    } else if (id === 'gasolinera') {
      ev.t = 0.3;
      aviso('¡Gasolinera!');
      this.poner('gasolinera', 3, -140);
      this.poner('dorado', 3, -140);
      if (this.va('cotine') && !this.cotineOk) this.decir('cotine', '¡Para en esa gasolinera!', 2200);
    } else if (id === 'puky') {
      ev.t = 0.3;
      aviso('¿Eso es… Puky?', COLOR.verde);
      const o = this.poner('cruza', -2, -90);
      if (o) { const der = Math.random() < 0.5; o.vx = der ? -250 : 250; o.x = der ? 960 : 320; o.setFlipX(der); }
      sfx(this, 'puky-gracioso', { volume: 0.5 });
    } else if (id === 'lluvia') {
      ev.t = 6.5;
      aviso('¡Lluvia de humo!', COLOR.azul);
      capa(this.add.rectangle(ANCHO / 2, ALTO / 2, 640, ALTO, 0xb8b0c8, 0.5).setDepth(34));
      for (let i = 0; i < 6; i++) { const n = capa(this.add.image(360 + (i % 3) * 270, -100 + i * 150, 'fu-humo').setDepth(36).setScale(1.7).setAlpha(0.8)); n.nube = true; }
      sfx(this, 'hinchar', { volume: 0.4 });
    } else if (id === 'obras') {
      ev.t = 6; this.mulHueco = 0.85;
      this.obrasCarriles = Phaser.Utils.Array.GetRandom([[0, 1], [1, 2], [2, 3]]);
      aviso('¡Desvío por obras!', COLOR.rojo);
      this.poner('cartel', -1);
    } else if (id === 'radio') {
      ev.t = 6;
      aviso('¡La radio se ha quedado pillada!', COLOR.rosa);
      this.eusebioBaila(true);
      Object.keys(this.caras).forEach(k => { const c = this.caras[k]; this.tweens.add({ targets: c, y: c.y - 12, duration: 230, yoyo: true, repeat: 12 }); });
      this.decir(this.todos && this.todos.length ? this.todos[0] : 'eusebio', '¡La, la, laaa!', 2600);
      sfx(this, 'campanita', { volume: 0.4 });
    } else if (id === 'eusebio') {
      ev.t = 6.5;
      aviso('¡Don Eusebio se ha escapado!', COLOR.amarillo);
      this.eusebio('feliz', 6500);
      const r = this.add.container(ANCHO / 2, 70).setDepth(46);
      dibujaEusebio(this, r, 'feliz', 130);
      this.runner = capa(r);
    } else if (id === 'sirena') {
      ev.t = 5; ev.real = Math.random() < 0.5;
      aviso('¿Una sirena?…', COLOR.azul);
      const luz = capa(this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x2a6bff, 0.18).setDepth(41));
      this.tweens.add({ targets: luz, alpha: { from: 0.05, to: 0.25 }, duration: 300, yoyo: true, repeat: 7 });
      sfx(this, 'sting', { volume: 0.5 });
      enfasisSeguro(this, 'tension', { camara: false });
    } else if (id === 'baches') {
      ev.t = 5; this.mulHueco = 0.75;
      aviso('¡Tramo de baches!', COLOR.rosa);
    }
  }

  finEvento() {
    const ev = this.evento;
    if (!ev) return;
    this.evento = null;
    this.mulVel = 1; this.mulHueco = 1;
    this.extras.forEach(n => { if (n.scene) { this.tweens.killTweensOf(n); n.destroy(); } });
    this.extras = [];
    this.runner = null;
    let bono = 0, txt = null;
    if (['atajo', 'lluvia', 'radio', 'baches', 'obras'].indexOf(ev.tipo) >= 0 && ev.limpio) { bono = { atajo: 150, lluvia: 120, radio: 200, baches: 100, obras: 100 }[ev.tipo]; txt = `¡Tramo limpio! +${bono}`; }
    if (ev.tipo === 'radio') this.eusebioBaila(false);
    if (ev.tipo === 'eusebio') {
      if (this.pipas >= 3) { bono = 200; txt = '¡Don Eusebio vuelve a la guantera! +200'; this.eusebio('feliz', 1800, 'vuelve'); }
      else { txt = 'Don Eusebio vuelve solo, con cara de pillo.'; this.eusebio('normal'); }
    }
    if (ev.tipo === 'sirena') {
      if (ev.real) { this.controlForzado = true; txt = '…Era para nosotros.'; } else txt = 'No era para nosotros. Respira.';
    }
    if (bono) this.base += bono;
    if (txt) golpeTexto(this, ANCHO / 2, 300, txt, bono ? COLOR.verde : COLOR.crema, 32);
  }

  // ---------------------------------------------------------------- final

  tocaControl() {
    const e = this.encargo;
    if (!e) return false;
    return !!(this.controlForzado || e.forzarControl || Math.random() < (e.probControl || 0));
  }

  // Perfecto, bien o desastre gracioso.
  nivelRes(llega) {
    const fragil = this.encargo && this.encargo.carga === 'fragil';
    if (!llega) return 'desastre';
    if (fragil && this.carga <= 0) return 'desastre';
    if (this.golpes === 0 && (!fragil || this.carga >= 100)) return 'perfecto';
    if (this.golpes <= 1) return 'bien';
    return 'desastre';
  }

  final(llega) {
    if (this._acabado) return;
    this._acabado = true;
    this.fase = 'fin';
    if (this.panelElegir) { this.panelElegir.destroy(); this.panelElegir = null; }
    if (this.charla && this.charla.scene) this.charla.destroy();
    if (this.evento) this.finEvento();
    this.mult = this.mult || MULT_ACOMP[this.elegidos.length] || 1;
    if (llega) this.base += 400 + this.vidas * 80 + (this.golpes === 0 ? 200 : 0);
    else this.base += Math.round(300 * Math.min(1, this.recorrido / this.metaPx));
    this.pintarMarcador();
    if (llega) {
      sfx(this, 'platillo', { volume: 0.5 });
      Comic.confeti(this, { n: 24, profundidad: 600 });
      enfasisSeguro(this, 'alegria', { x: this.furgo.x, y: this.furgo.y - 80, profundidad: 600 });
    }
    const res = { llega, base: this.base, golpes: this.golpes, carga: this.carga, vidas: this.vidas, monchis: this.monchis };
    // Si toca control, el resultado se enseña al volver de él.
    if (llega && this.tocaControl()) {
      this.time.delayedCall(1400, () => irA(this, 'Control', { encargo: this.encargo, desdeFurgo: true, resumen: res }));
      return;
    }
    this.time.delayedCall(llega ? 1100 : 700, () => this.cerrar(res, null));
  }

  // Panel de resultado (de la historia o de un encargo), con Don Eusebio en su pose.
  cerrar(res, ctl) {
    this._acabado = true;
    this.fase = 'fin';
    const llega = res.llega;
    const puntos = Math.round(this.base * (this.mult || 1)) + (ctl ? ctl.puntos : 0);
    let nivel = this.nivelRes(llega);
    if (ctl && !ctl.gana) nivel = 'desastre';
    const e = this.encargo;
    let titulo, linea, gana;
    if (e) {
      const p = e.premio || {};
      const f = { perfecto: 1, bien: 0.6, desastre: 0.25 }[nivel];
      const m = Math.round((p.monchis || 0) * f);
      ESTADO.monchis += m;
      if (p.hucha && nivel !== 'desastre') ESTADO.hucha = (ESTADO.hucha || 0) + Math.round(p.hucha * (nivel === 'perfecto' ? 1 : 0.5));
      if (p.objeto && nivel === 'perfecto') { ESTADO.furgoObjetos = ESTADO.furgoObjetos || []; ESTADO.furgoObjetos.push(p.objeto); }
      ESTADO.furgoUltimo = { id: e.id, nivel, monchis: m, control: ctl ? (ctl.gana ? 'pasado' : 'cazado') : 'no' };
      sumarStat('furgo_encargos');
      sumarStat(`furgo_${e.id}`);
      sumarStat(`furgo_${e.id}_${nivel}`);
      if (typeof guardarPartida === 'function') guardarPartida();
      const tx = e.textos && e.textos[nivel];
      const def = this.textoEncargo(nivel, llega, ctl);
      titulo = (tx && typeof tx === 'object' && tx.titulo) || def.titulo;
      linea = ((tx && (typeof tx === 'string' ? tx : tx.linea)) || def.linea) + (m ? `  (+${m} monchis del encargo)` : '');
      gana = nivel !== 'desastre';
    } else {
      gana = llega && puntos >= MISIONES.Furgo.umbrales[0];
      titulo = llega ? '¡Se ve la feria!' : 'Fin del viaje';
      const lineasOk = {
        lasslow: 'Lasslow no ha parado de reírse. Eso no ha ayudado.', palicaso: 'Palicaso lleva dos horas hablando. Nadie ha sabido cuándo empezó.',
        perico: 'Perico ha dicho «pin pin» en cada cartel. Había muchos carteles.', cotine: 'Cotine ha dicho que no quería venir. Lleva el bolsillo lleno de migas.',
        pompa: 'La Pompa ha viajado con mucho cuidado. Mucho.', blancaso: 'Blancaso ha apuntado todas las curvas. Y las ha sufrido todas.', puky: 'Puky ha ido pegado al cristal todo el camino. Queda una marca.',
      };
      const extra = this.elegidos.length ? lineasOk[Phaser.Utils.Array.GetRandom(this.elegidos)] : 'Ibas solo, con la radio puesta. Muy dignos.';
      linea = llega ? `Todos a bordo y la furgo casi entera. ${extra}` : 'La furgo se ha quedado a medio camino. La culpa es del sofá, que nadie sabe de quién es.';
    }
    this.nivelFinal = nivel;
    panelFinal(this, { titulo, linea, puntos, clave: 'Furgo', gana });
    // Don Eusebio, con la pose del resultado, junto al panel.
    this.time.delayedCall(900, () => {
      if (!this.sys.isActive()) return;
      const pose = nivel === 'perfecto' ? 'feliz' : nivel === 'bien' ? 'dormido' : 'susto';
      const c = this.add.container(1160, 330).setDepth(650).setScale(0);
      dibujaEusebio(this, c, pose, 120);
      this.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.out' });
      const fr = frasesEusebio(nivel);
      if (fr) {
        const t = this.add.text(1160, 410, fr, { fontFamily: FUENTE, fontSize: `${MOVIL ? 17 : 15}px`, color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 4, align: 'center', wordWrap: { width: 200 }, fontStyle: 'italic' }).setOrigin(0.5, 0).setDepth(651);
        this.time.delayedCall(6000, () => { if (t.scene) t.destroy(); });
      }
    });
  }

  // Textos por defecto de los encargos (el guionista puede ponerlos en encargo.textos o ENCARGOS_FURGO).
  textoEncargo(nivel, llega, ctl) {
    const carga = this.encargo.carga;
    if (ctl && !ctl.gana) return { titulo: '¡Bajen del vehículo!', linea: 'El control os ha pillado, pero el agente se ha quedado con las ganas de multaros: el hámster le ha caído simpático.' };
    return {
      perfecto: { titulo: '¡Entrega perfecta!', linea: carga === 'fragil' ? 'No se ha roto ni una pieza. El cliente quiere abrazarte. Don Eusebio, también.' : carga === 'pasajero' ? 'El pasajero llega con el pelo en su sitio y cuenta tu conducción a todo el barrio.' : 'Ni un rasguño. La furgo huele a victoria y a pipas.' },
      bien: { titulo: '¡Entregado!', linea: carga === 'fragil' ? 'La carga llega con un par de grietas. «Es parte del encanto», dice el cliente.' : carga === 'pasajero' ? 'El pasajero se baja un poco mareado, pero da propina.' : 'Todo ha llegado, más o menos entero. Más o menos.' },
      desastre: { titulo: '¡Menudo desastre!', linea: !llega ? 'La furgo se queda a medias y el encargo llega a pie, con una propina por la pena.' : carga === 'fragil' ? 'La carga llega hecha puré. El cliente se ríe por no llorar… y te da algo por el esfuerzo.' : carga === 'pasajero' ? 'El pasajero llega pálido y agradecido de seguir vivo. Se baja besando el suelo.' : 'Llega todo, pero hecho un nudo. Don Eusebio sale de entre los cojines con un calcetín en la cabeza.' },
    }[nivel];
  }
}

// Carril i → x en pantalla (sin la curva); la furgo se queda siempre a esta altura.
const FU_Y = 560;
function FU_X(i) { return 400 + 160 * i; }

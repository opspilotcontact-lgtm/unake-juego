// «Que no cunda el amarillo» · la recreativa de Vuper (la de su cuarto, junto a la M).
// Arena de doble palanca vista desde arriba: Monchiman en el centro de la sala de Unaké, los clientes
// sentados en sus sitios y oleadas de amarillos que avanzan hacia ellos. Te mueves con WASD o flechas y
// apuntas con el ratón (clic o Espacio dispara). En móvil: joystick a la izquierda y disparo automático
// hacia lo más urgente; un segundo dedo en la pantalla apunta donde toques.
// Munición (1, 2, 3, Q/E o rueda): dulce (rápido), salado (en área) y resucitador (cura a un cliente tocado).
// Los clientes sueltan potenciadores al salvarlos (baraja sin repetir). Cada 5 oleadas, un mini-jefe sorteado
// entre tres. Partida infinita: acaba al perder a tres clientes. Todo se dibuja dentro de un marco de
// máquina recreativa con píxel gordo simulado (posiciones a rejilla de 3 px), líneas de barrido suaves y
// marcador TOP con las iniciales fijas de los personajes. Sin pantallazos ni temblores: el juice es local.

if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Recreativa = 'barrido';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.Recreativa = ['puky-riendo', UNAKE.amarillo];
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Recreativa = 'minijuego';

const REC = {
  ax0: 190, ay0: 96, ax1: 1090, ay1: 656,       // la pantalla de la máquina (la arena)
  centro: { x: 640, y: 386 },
  vel: 300,                                       // Monchiman, px/s
  pixel: 3,                                       // el píxel gordo
  joy: { x: 95, y: 584, r: 56 },                  // joystick táctil (panel izquierdo)
  maxPerdidos: 3,
  cargaMax: 3,
};

// Los clientes del bar, cada uno en su sitio. `salto` = lado desde el que habla.
const REC_CLIENTES = [
  { id: 'pompa', nombre: 'La Pompa', ini: 'POM', tex: 'pompa', x: 300, y: 226, lado: 'izq', cojin: 0x5ad1ff },
  { id: 'cotine', nombre: 'Cotine', ini: 'COT', tex: 'cotine', x: 980, y: 226, lado: 'der', cojin: 0xff7eb0 },
  { id: 'lasslow', nombre: 'Lasslow', ini: 'LAS', tex: 'lasslow', x: 290, y: 446, lado: 'arriba', cojin: 0x96c846 },
  { id: 'palicaso', nombre: 'Palicaso', ini: 'PAL', tex: 'palicaso', x: 990, y: 446, lado: 'arriba', cojin: 0xffd628 },
  { id: 'perico', nombre: 'Perico', ini: 'PER', tex: 'perico', x: 640, y: 592, lado: 'arriba', cojin: 0xff9a3b },
];

// Tipos de amarillo. r = radio de choque; vel en px/s.
const REC_TIPOS = {
  gota: { r: 17, hp: 2, vel: 66, pts: 10, tex: 'rc-gota', tam: 40 },
  gotita: { r: 12, hp: 1, vel: 112, pts: 5, tex: 'rc-gota', tam: 27 },
  salpicon: { r: 28, hp: 3, vel: 84, pts: 20, tex: 'rc-salpicon', tam: 64 },
  charco: { r: 31, hp: 4, vel: 72, pts: 35, tex: 'rc-charco', tam: 90, huella: true },
  grande: { r: 60, hp: 18, vel: 44, pts: 120, tex: 'rc-grande', tam: 146, escudo: true, empuja: true, dano: 2 },
};
const REC_JEFES = [
  { id: 'goteron', nombre: 'El Goterón', r: 72, hp: 46, vel: 36, pts: 600, tex: 'rc-grande', tam: 196, tinte: 0xffe680, jefe: true, empuja: true, dano: 2 },
  { id: 'madre', nombre: 'La Charca Madre', r: 80, hp: 52, vel: 30, pts: 650, tex: 'rc-charco', tam: 230, tinte: 0xffd24a, jefe: true, empuja: true, dano: 2 },
  { id: 'gordo', nombre: 'El Salpicón Gordo', r: 72, hp: 48, vel: 40, pts: 620, tex: 'rc-salpicon', tam: 190, tinte: 0xffc233, jefe: true, empuja: true, dano: 2 },
];

// Lo que sueltan los clientes al salvarlos: cada uno a su manera.
const REC_POTENCIADORES = {
  lasslow: { nombre: 'PEDO', dice: ['Caballeros, agárrense. JA… perdón.', 'Esto no ha sido cosa mía. JA.'] },
  pompa: { nombre: 'BURBUJA', dice: ['…Respirad.', '…Más despacio.'], tarde: true },
  cotine: { nombre: 'LLUVIA', dice: ['¿Qué? Tenía hambre.', 'Come, que es dulce.'] },
  palicaso: { nombre: 'GRITO', dice: ['¡ESCUCHA, ESCUCHA!', '¡ESCUCHA! ¡ESCUCHA!'] },
  perico: { nombre: 'PIN PIN', dice: ['Pin pin. Ahí. Ahí. Ahí.', 'Pin pin. Os lo dije. Os lo dije.'] },
};

const REC_FRASES = {
  inicio: ['¡Que no cunda el amarillo!'],
  ola: ['Otra oleada. Lo apunto.', 'Un palote más.', 'Apunto: amarillo, otra vez.', 'Esto lo anoto con rotulador.'],
  jefe: ['¿Me llamabais?', 'Ese es de los míos. ¿Me llamabais?'],
  toque: {
    palicaso: ['¡Escucha, escucha, que me han…!', '¡Escucha! ¡Me ha tocado!'],
    lasslow: ['JA… perdón.', 'Caballero… me ha salpicado. JA.'],
    cotine: ['¡Mi vestido! ¡Y yo con hambre!', '¡Eso era para comer!'],
    pompa: ['…No.', '…Ya.'],
    perico: ['¡Te lo dije! ¡Te lo dije!', 'Pin pin. Ya os avisé.'],
  },
  curado: {
    palicaso: ['¡Escucha, escucha! ¡Estoy curado!'],
    lasslow: ['Qué alivio, caballero. JA.'],
    cotine: ['Qué rico. Digo, gracias.'],
    pompa: ['…Gracias.'],
    perico: ['Pin pin. Gracias. Pin pin.'],
  },
  perdido: {
    palicaso: ['¡Escucha… escu…!'],
    lasslow: ['JA… JA… JA…'],
    cotine: ['¿Y ahora qué como?'],
    pompa: ['…Vale.'],
    perico: ['¡Os lo dije!'],
  },
  vacio: ['Sin resucitadores. Mata amarillos.'],
  sinTocado: ['Nadie tocado. Guárdalo.'],
};

const REC_TOP_BASE = [
  { ini: 'PAL', pts: 6200 }, { ini: 'LAS', pts: 4300 }, { ini: 'COT', pts: 2900 }, { ini: 'POM', pts: 1700 }, { ini: 'PER', pts: 800 },
];

function recLeerTop() {
  const t = ESTADO && ESTADO.topRecreativa;
  if (Array.isArray(t) && t.length && t.every(e => e && typeof e.pts === 'number' && typeof e.ini === 'string')) return t.map(e => ({ ini: e.ini, pts: e.pts }));
  return REC_TOP_BASE.map(e => ({ ...e }));
}

class Recreativa extends Phaser.Scene {
  constructor() { super('Recreativa'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la escena al volver a jugar.
    this.activo = false;
    this.fase = 'espera';
    this.t = 0;
    this.puntos = 0;
    this.ola = 0;
    this.perdidos = 0;
    this.kills = 0;
    this.killsCarga = 0;
    this.carga = 2;
    this.municion = 0;
    this.cd = 0;
    this.aturd = 0;
    this.combo = 0;
    this.comboT = 0;
    this.empuje = 0;
    this.tocadasOla = 0;
    this.estrellasVistas = 0;
    this.spawnT = 0;
    this.cola = [];
    this.intervalo = 1.2;
    this.enemigos = [];
    this.balas = [];
    this.charcos = [];
    this.pickups = [];
    this.pedos = [];
    this.burbujas = [];
    this.lluvia = null;
    this.efectos = { lento: 0, marca: 0 };
    this.jefe = null;
    this.bolsas = {};
    this.bolsaPot = [];
    this.bolsaJefe = [];
    this.vozActual = null;
    this.vozTarde = null;
    this.ultimaVoz = -9;
    this.ultimoSonido = {};
    this.punteros = {};
    this.joy = { id: null, x: 0, y: 0 };
    this.mov = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.resbala = 0;
    this.aim = { x: REC.centro.x + 200, y: REC.centro.y };
    this.p = { x: REC.centro.x, y: REC.centro.y };
    this.ultimoAvisoVacio = -9;
    this.dispAnim = 0;
    this.parpadeoTop = 0;
    const nivel = typeof nivelDe === 'function' ? nivelDe('Recreativa') : 1;
    this.nivel = nivel;
    this.dif = 1 + 0.08 * Math.min(nivel - 1, 10);
    this.top = recLeerTop();

    this.texturas();
    this.sala();
    this.crearClientes();
    this.crearJugador();
    this.marco();
    this.hud();
    this.controles();

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 450, () => this.presentacion());
  }

  // ---------- Dibujos (Graphics): los amarillos, la munición y las texturas de la pantalla ----------

  texturas() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const t = HEX.tinta;
    const hacer = (clave, w, h, dibujar) => { if (this.textures.exists(clave)) return; g.clear(); dibujar(); g.generateTexture(clave, w, h); };
    const ojos = (x, y, sep, r, rabia) => {
      g.fillStyle(0xffffff, 1).fillCircle(x - sep, y, r).fillCircle(x + sep, y, r);
      g.fillStyle(t, 1).fillCircle(x - sep + 1, y + 1, r * 0.5).fillCircle(x + sep + 1, y + 1, r * 0.5);
      if (rabia) {
        g.lineStyle(4, t, 1);
        g.lineBetween(x - sep - r - 2, y - r - 5, x - sep + r, y - r + 1).lineBetween(x + sep + r + 2, y - r - 5, x + sep - r, y - r + 1);
      }
    };
    hacer('rc-gota', 64, 72, () => {
      g.fillStyle(t, 1).fillCircle(32, 44, 28).fillTriangle(32, 1, 7, 38, 57, 38);
      g.fillStyle(0xf5d23a, 1).fillCircle(32, 44, 23).fillTriangle(32, 10, 12, 38, 52, 38);
      g.fillStyle(0xfff6a8, 1).fillCircle(22, 36, 6);
      ojos(32, 46, 9, 6, false);
    });
    hacer('rc-salpicon', 120, 120, () => {
      const pts = [[60, 10, 14], [100, 30, 13], [112, 66, 14], [90, 104, 13], [50, 112, 14], [14, 90, 13], [8, 48, 14], [30, 16, 12]];
      g.fillStyle(t, 1).fillCircle(60, 60, 44);
      pts.forEach(([x, y, r]) => g.fillCircle(x, y, r + 5));
      g.fillStyle(0xffc233, 1).fillCircle(60, 60, 39);
      pts.forEach(([x, y, r]) => g.fillCircle(x, y, r));
      g.fillStyle(0xffe27a, 1).fillCircle(44, 44, 10);
      ojos(60, 62, 14, 8, true);
      g.fillStyle(t, 1).fillRoundedRect(46, 82, 28, 9, 4);
    });
    hacer('rc-charco', 140, 92, () => {
      const bl = [[70, 48, 54, 30], [30, 52, 26, 20], [112, 54, 28, 20], [58, 28, 30, 16], [92, 76, 30, 14]];
      g.fillStyle(t, 1);
      bl.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w * 2 + 10, h * 2 + 10));
      g.fillStyle(0xe6b800, 1);
      bl.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w * 2, h * 2));
      g.fillStyle(0xffe27a, 1).fillEllipse(54, 36, 30, 12);
      ojos(70, 46, 14, 8, true);
    });
    hacer('rc-grande', 200, 200, () => {
      g.fillStyle(t, 1).fillCircle(100, 108, 84).fillCircle(48, 52, 30).fillCircle(150, 52, 30).fillCircle(100, 36, 30);
      g.fillStyle(0xd9a400, 1).fillCircle(100, 108, 78).fillCircle(48, 52, 25).fillCircle(150, 52, 25).fillCircle(100, 36, 25);
      g.fillStyle(0xf5d23a, 1).fillCircle(86, 94, 52);
      g.fillStyle(0xffeea0, 1).fillCircle(62, 70, 14);
      ojos(100, 100, 26, 14, true);
      g.fillStyle(t, 1).fillRoundedRect(66, 140, 68, 18, 8);
      g.fillStyle(0xffffff, 1).fillRect(76, 140, 10, 9).fillRect(112, 140, 10, 9);
    });
    hacer('rc-huella', 84, 60, () => {
      g.fillStyle(0xd8b300, 0.55).fillEllipse(42, 30, 82, 54);
      g.fillStyle(0xf5d23a, 0.8).fillEllipse(42, 28, 70, 42);
      g.fillStyle(0xffffff, 0.35).fillEllipse(30, 20, 22, 10);
    });
    hacer('rc-dulce', 30, 30, () => {
      g.fillStyle(t, 1).fillCircle(15, 15, 13).fillTriangle(0, 6, 8, 15, 0, 24).fillTriangle(30, 6, 22, 15, 30, 24);
      g.fillStyle(0xff5fa2, 1).fillCircle(15, 15, 10);
      g.fillStyle(0xffffff, 1).fillRect(9, 11, 12, 4);
    });
    hacer('rc-salado', 34, 34, () => {
      g.fillStyle(t, 1).fillRoundedRect(2, 4, 30, 26, 12);
      g.fillStyle(0xf2c14e, 1).fillRoundedRect(6, 8, 22, 18, 9);
      g.fillStyle(0xffe9a8, 1).fillCircle(13, 14, 3).fillCircle(22, 20, 3).fillCircle(16, 22, 2);
    });
    hacer('rc-resu', 34, 34, () => {
      g.fillStyle(t, 1).fillRoundedRect(1, 1, 32, 32, 9);
      g.fillStyle(0x7ee081, 1).fillRoundedRect(5, 5, 24, 24, 6);
      g.fillStyle(0xffffff, 1).fillRect(14, 8, 6, 18).fillRect(8, 14, 18, 6);
    });
    hacer('rc-pin', 24, 34, () => {
      g.fillStyle(t, 1).fillCircle(12, 11, 11).fillTriangle(5, 17, 19, 17, 12, 33);
      g.fillStyle(0xff5a4f, 1).fillCircle(12, 11, 7).fillTriangle(8, 17, 16, 17, 12, 28);
      g.fillStyle(0xffffff, 1).fillCircle(10, 9, 2);
    });
    hacer('rc-rejilla', 3, 3, () => {
      g.fillStyle(0x000000, 0.17).fillRect(0, 2, 3, 1);
      g.fillStyle(0x000000, 0.07).fillRect(2, 0, 1, 3);
    });
    hacer('rc-barrido', 4, 4, () => { g.fillStyle(0x000000, 0.1).fillRect(0, 3, 4, 1); });
    g.destroy();
    if (!this.textures.exists('rc-vineta')) {
      const lienzo = this.textures.createCanvas('rc-vineta', 900, 560);
      const ctx = lienzo.getContext();
      const gr = ctx.createRadialGradient(450, 280, 220, 450, 280, 560);
      gr.addColorStop(0, 'rgba(10,0,25,0)');
      gr.addColorStop(1, 'rgba(10,0,25,0.4)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, 900, 560);
      lienzo.refresh();
    }
  }

  // ---------- La sala de Unaké vista desde arriba ----------

  sala() {
    const W = REC.ax1 - REC.ax0, H = REC.ay1 - REC.ay0;
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x2b1a40, 1).fillRect(REC.ax0, REC.ay0, W, H);
    for (let y = 0; y < H; y += 60) {
      for (let x = 0; x < W; x += 60) {
        if (((x / 60) + (y / 60)) % 2 === 0) { g.fillStyle(0x36214f, 1).fillRect(REC.ax0 + x, REC.ay0 + y, 60, 60); }
      }
    }
    // Alfombra central.
    g.fillStyle(0x4a2a6c, 1).fillEllipse(REC.centro.x, REC.centro.y, 520, 330);
    g.lineStyle(6, 0xff5fa2, 0.6).strokeEllipse(REC.centro.x, REC.centro.y, 470, 290);
    g.lineStyle(4, 0x5ad1ff, 0.5).strokeEllipse(REC.centro.x, REC.centro.y, 380, 220);
    // Paredes con cinta de peligro: por ahí entran los amarillos.
    const cinta = (x, y, w, h, horiz) => {
      g.fillStyle(0x1b1028, 1).fillRect(x, y, w, h);
      g.fillStyle(0xffd23f, 1);
      const paso = 26;
      for (let i = 0; i < (horiz ? w : h); i += paso * 2) {
        if (horiz) g.fillPoints([{ x: x + i, y: y + h }, { x: x + i + paso, y: y + h }, { x: x + i + paso + h, y }, { x: x + i + h, y }], true);
        else g.fillPoints([{ x, y: y + i }, { x: x + w, y: y + i - w }, { x: x + w, y: y + i - w + paso }, { x, y: y + i + paso }], true);
      }
    };
    cinta(REC.ax0, REC.ay0, W, 10, true);
    cinta(REC.ax0, REC.ay1 - 10, W, 10, true);
    g.fillStyle(0x1b1028, 1).fillRect(REC.ax0, REC.ay0, 10, H).fillRect(REC.ax1 - 10, REC.ay0, 10, H);
    // Cojines de los sitios.
    REC_CLIENTES.forEach(c => {
      g.fillStyle(0x1b1028, 1).fillEllipse(c.x, c.y + 18, 128, 70);
      g.fillStyle(c.cojin, 1).fillEllipse(c.x, c.y + 16, 116, 58);
      g.fillStyle(0xffffff, 0.2).fillEllipse(c.x - 14, c.y + 8, 54, 20);
    });
    // Rejilla de píxel gordo y líneas de barrido: encima de todo el juego de la pantalla.
    this.rejilla = this.add.tileSprite(REC.ax0 + W / 2, REC.ay0 + H / 2, W, H, 'rc-rejilla').setDepth(60);
    this.barrido = this.add.tileSprite(REC.ax0 + W / 2, REC.ay0 + H / 2, W, H, 'rc-barrido').setDepth(61);
    this.add.image(REC.ax0 + W / 2, REC.ay0 + H / 2, 'rc-vineta').setDepth(62);
    this.banda = this.add.rectangle(REC.ax0 + W / 2, REC.ay0, W, 70, 0xffffff, 0.04).setDepth(63);
    this.charcoG = this.add.group();
  }

  crearClientes() {
    this.clientes = REC_CLIENTES.map(def => {
      const c = { ...def, hp: 2, max: 2, perdido: false, salvas: 0, voces: 0 };
      c.img = this.add.image(c.x, c.y + 32, c.tex).setOrigin(0.5, 1).setDepth(22);
      c.img.setScale(104 / c.img.height);
      c.esc = c.img.scaleX;
      c.pips = this.add.graphics().setDepth(40);
      this.tweens.add({ targets: c.img, scaleY: c.esc * 1.025, duration: 900 + Math.random() * 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.pintarPips(c);
      return c;
    });
  }

  pintarPips(c) {
    c.pips.clear();
    if (c.perdido) return;
    for (let i = 0; i < c.max; i++) {
      const x = c.x + (i - (c.max - 1) / 2) * 24, y = c.y - 84;
      c.pips.fillStyle(HEX.tinta, 1).fillCircle(x, y, 11);
      c.pips.fillStyle(i < c.hp ? 0xff5fa2 : 0x4a3d63, 1).fillCircle(x, y, 8);
      if (i < c.hp) c.pips.fillStyle(0xffffff, 0.7).fillCircle(x - 2, y - 3, 2.5);
    }
  }

  crearJugador() {
    this.sombra = this.add.ellipse(this.p.x, this.p.y + 32, 70, 22, 0x000000, 0.35).setDepth(19);
    this.pj = this.add.image(this.p.x, this.p.y, 'monchiman').setOrigin(0.5, 0.62).setDepth(30);
    this.pj.setScale(100 / this.pj.height);
    this.pjEsc = this.pj.scaleX;
    this.canon = this.add.graphics().setDepth(31);
    this.mira = this.add.graphics().setDepth(58);
    this.dibujarMira();
  }

  dibujarMira() {
    const m = this.mira;
    m.clear();
    m.lineStyle(7, HEX.tinta, 1).strokeCircle(0, 0, 17);
    m.lineStyle(3, HEX.crema, 1).strokeCircle(0, 0, 17);
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
      m.lineStyle(7, HEX.tinta, 1).lineBetween(dx * 10, dy * 10, dx * 25, dy * 25);
      m.lineStyle(3, HEX.rosa, 1).lineBetween(dx * 11, dy * 11, dx * 24, dy * 24);
    });
  }

  // ---------- El marco de la máquina ----------

  marco() {
    const D = 70;
    const g = this.add.graphics().setDepth(D);
    // Cuerpo de la máquina alrededor de la pantalla.
    g.fillStyle(0x1a0f2b, 1).fillRect(0, 0, ANCHO, REC.ay0).fillRect(0, REC.ay1, ANCHO, ALTO - REC.ay1).fillRect(0, REC.ay0, REC.ax0, REC.ay1 - REC.ay0).fillRect(REC.ax1, REC.ay0, ANCHO - REC.ax1, REC.ay1 - REC.ay0);
    // Letrero superior.
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(150, 6, 980, 82, 18);
    g.fillStyle(0x4a1f78, 1).fillRoundedRect(158, 12, 964, 70, 14);
    g.fillStyle(0x6a2ea8, 1).fillRoundedRect(158, 12, 964, 26, { tl: 14, tr: 14, bl: 0, br: 0 });
    // Bombillas del letrero (parpadean en el update).
    this.luces = [];
    for (let i = 0; i < 24; i++) {
      const x = 178 + i * 40.5;
      [20, 74].forEach(y => {
        const b = this.add.circle(x, y, 4.5, i % 2 ? 0xffd23f : 0xff5fa2).setDepth(D + 1);
        this.luces.push(b);
      });
    }
    // Rieles laterales con luz de neón.
    g.fillStyle(0xff5fa2, 1).fillRect(24, REC.ay0, 6, REC.ay1 - REC.ay0).fillRect(REC.ax1 + 160, REC.ay0, 6, REC.ay1 - REC.ay0);
    g.fillStyle(0x5ad1ff, 1).fillRect(34, REC.ay0, 3, REC.ay1 - REC.ay0).fillRect(REC.ax1 + 153, REC.ay0, 3, REC.ay1 - REC.ay0);
    // Paneles de los lados (más claros que el cuerpo, con borde).
    [[8, REC.ay0 + 4, 174], [REC.ax1 + 8, REC.ay0 + 4, 174]].forEach(([x, y, w]) => {
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(x, y, w, REC.ay1 - REC.ay0 - 8, 16);
      g.fillStyle(0x2d1a47, 1).fillRoundedRect(x + 5, y + 5, w - 10, REC.ay1 - REC.ay0 - 18, 12);
    });
    // Bisel de la pantalla.
    g.lineStyle(14, HEX.tinta, 1).strokeRect(REC.ax0 - 5, REC.ay0 - 5, REC.ax1 - REC.ax0 + 10, REC.ay1 - REC.ay0 + 10);
    g.lineStyle(4, 0x6a2ea8, 1).strokeRect(REC.ax0 - 13, REC.ay0 - 13, REC.ax1 - REC.ax0 + 26, REC.ay1 - REC.ay0 + 26);
    // Panel de mandos de abajo.
    g.fillStyle(0x2d1a47, 1).fillRoundedRect(150, REC.ay1 + 8, 980, 52, 14);
    g.lineStyle(5, HEX.tinta, 1).strokeRoundedRect(150, REC.ay1 + 8, 980, 52, 14);
    // Ranura de ficha.
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(944, REC.ay1 + 14, 92, 40, 8);
    g.fillStyle(0xff5a4f, 1).fillRoundedRect(950, REC.ay1 + 20, 80, 28, 6);
    g.fillStyle(HEX.tinta, 1).fillRect(982, REC.ay1 + 22, 16, 24);
    // Títulos.
    this.titulo = texto(this, ANCHO / 2, 38, 'QUE NO CUNDA EL AMARILLO', 40, COLOR.amarillo).setDepth(D + 2);
    this.subtitulo = texto(this, ANCHO / 2, 68, '', 20, COLOR.crema).setDepth(D + 2);
    this.pintarSubtitulo();
    // Palanca y botones del panel de abajo (se mueven con el juego).
    this.palancaBase = this.add.circle(214, REC.ay1 + 34, 20, HEX.tinta).setDepth(D + 1);
    this.palanca = this.add.circle(214, REC.ay1 + 34, 13, 0xff5a4f).setStrokeStyle(4, HEX.tinta).setDepth(D + 2);
    this.botonesDeck = [[0xff5fa2, 300], [0xffd23f, 352], [0x7ee081, 404]].map(([c, x]) => this.add.circle(x, REC.ay1 + 34, 17, c).setStrokeStyle(4, HEX.tinta).setDepth(D + 2));
    this.deckTexto = texto(this, 700, REC.ay1 + 34, '', 22, COLOR.azul).setDepth(D + 2);
  }

  pintarSubtitulo() {
    const t = this.top[0];
    this.subtitulo.setText(`TOP ${t.ini}  ${t.pts}`);
  }

  // ---------- Marcadores laterales ----------

  hud() {
    const D = 80;
    const L = 99, R = ANCHO - 99;
    this.tPuntosEt = texto(this, L, 124, 'PUNTOS', 20, COLOR.azul).setDepth(D);
    this.tPuntos = texto(this, L, 160, '0', 38, COLOR.amarillo, 170).setDepth(D);
    this.tOlaEt = texto(this, L, 214, 'OLEADA', 20, COLOR.azul).setDepth(D);
    this.tOla = texto(this, L, 252, '–', 44, COLOR.crema).setDepth(D);
    this.estrellasG = [0, 1, 2].map(i => {
      const e = this.add.star(L + (i - 1) * 44, 304, 5, 8, 18, 0x3d3350).setStrokeStyle(4, HEX.tinta).setDepth(D);
      return e;
    });
    this.tAmigosEt = texto(this, L, 352, 'CLIENTES', 20, COLOR.azul).setDepth(D);
    this.iconosCli = this.clientes.map((c, i) => {
      const col = i % 3, fila = Math.floor(i / 3);
      const x = L - 52 + col * 52 + (fila ? 26 : 0), y = 404 + fila * 62;
      const img = this.add.image(x, y + 24, c.tex).setOrigin(0.5, 1).setDepth(D);
      img.setScale(54 / img.height);
      return img;
    });
    this.tPerdidos = texto(this, L, 488, '', 22, COLOR.crema).setDepth(D);
    // Ayuda de mandos (en el móvil, el joystick ocupa este hueco).
    this.joyG = this.add.graphics().setDepth(D);
    if (MOVIL) {
      this.joyG.fillStyle(HEX.tinta, 0.55).fillCircle(REC.joy.x, REC.joy.y, REC.joy.r + 6);
      this.joyG.lineStyle(5, HEX.crema, 0.7).strokeCircle(REC.joy.x, REC.joy.y, REC.joy.r);
      this.knob = this.add.circle(REC.joy.x, REC.joy.y, 30, HEX.amarillo).setStrokeStyle(5, HEX.tinta).setDepth(D + 1);
    } else {
      texto(this, L, 556, 'WASD mueve', 19, COLOR.crema).setDepth(D);
      texto(this, L, 588, 'Ratón apunta', 19, COLOR.crema).setDepth(D);
      texto(this, L, 620, 'Clic dispara', 19, COLOR.crema).setDepth(D);
    }

    // Munición.
    this.botonesMuni = [
      { nombre: 'DULCE', tex: 'rc-dulce', color: 0xff5fa2 },
      { nombre: 'SALADO', tex: 'rc-salado', color: 0xffd23f },
      { nombre: 'RESUC.', tex: 'rc-resu', color: 0x7ee081 },
    ].map((m, i) => {
      const c = this.add.container(R, 132 + i * 84).setDepth(D);
      const fondo = this.add.graphics();
      const ico = this.add.image(-50, 6, m.tex); ico.setScale(Math.min(34 / ico.width, 34 / ico.height));
      const et = texto(this, 22, 6, m.nombre, 21, COLOR.crema, 100);
      if (et.width > 88) et.setScale(88 / et.width);
      const tecla = texto(this, -68, -22, String(i + 1), 15, COLOR.crema);
      c.add([fondo, ico, et, tecla]);
      c.setSize(160, 72).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => { this.elegir(i); });
      c.fondo = fondo; c.def = m; c.et = et;
      return c;
    });
    this.cargaG = this.add.graphics().setDepth(D);
    this.tCombo = texto(this, R, 396, '', 34, COLOR.verde).setDepth(D);
    this.efectoIcos = REC_CLIENTES.filter(c => ['pompa', 'perico', 'cotine'].includes(c.id)).map((c, i) => {
      const x = R - 52 + i * 52;
      const img = this.add.image(x, 462, c.tex).setOrigin(0.5, 0.5).setDepth(D).setVisible(false);
      img.setScale(44 / img.height);
      const barra = this.add.graphics().setDepth(D);
      return { id: c.id, img, barra, x };
    });
    this.tTopEt = texto(this, R, 508, 'TOP', 22, COLOR.azul).setDepth(D);
    this.tTop = this.top.slice(0, 4).map((e, i) => texto(this, R, 540 + i * 28, '', 20, i === 0 ? COLOR.amarillo : COLOR.crema).setDepth(D));
    this.pintarTop();
    this.pintarMuni();
    this.pintarCarga();
    this.pintarIconosCli();
    // Barra del jefe (arriba de la arena).
    this.barraJefe = this.add.graphics().setDepth(66).setVisible(false);
    this.nombreJefe = texto(this, REC.centro.x, REC.ay0 + 24, '', 24, COLOR.crema).setDepth(67).setVisible(false);
  }

  pintarTop() {
    this.tTop.forEach((t, i) => { const e = this.top[i]; t.setText(e ? `${e.ini} ${e.pts}` : ''); });
    this.pintarSubtitulo();
  }

  pintarMuni() {
    this.botonesMuni.forEach((c, i) => {
      const sel = i === this.municion;
      c.fondo.clear();
      c.fondo.fillStyle(HEX.tinta, 1).fillRoundedRect(-78, -34, 160, 72, 16);
      c.fondo.fillStyle(sel ? c.def.color : 0x45305f, 1).fillRoundedRect(-80, -38, 160, 72, 16);
      c.fondo.lineStyle(5, sel ? HEX.crema : HEX.tinta, 1).strokeRoundedRect(-80, -38, 160, 72, 16);
      c.et.setColor(COLOR.crema); // crema con su contorno oscuro se lee sobre cualquier fondo
    });
    this.botonesDeck.forEach((b, i) => b.setAlpha(i === this.municion ? 1 : 0.35));
  }

  pintarCarga() {
    const g = this.cargaG;
    g.clear();
    for (let i = 0; i < REC.cargaMax; i++) {
      const x = ANCHO - 99 + (i - 1) * 42, y = 358;
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(x - 17, y - 14, 34, 28, 8);
      g.fillStyle(i < this.carga ? 0x7ee081 : 0x3d3350, 1).fillRoundedRect(x - 13, y - 10, 26, 20, 6);
    }
  }

  pintarIconosCli() {
    this.clientes.forEach((c, i) => {
      const img = this.iconosCli[i];
      if (c.perdido) img.setTintFill(0xe8b800).setAlpha(0.8);
      else if (c.hp < c.max) img.setTint(0xffe566).setAlpha(1);
      else img.clearTint().setAlpha(1);
    });
    this.tPerdidos.setText(this.perdidos ? `Perdidos ${this.perdidos}/${REC.maxPerdidos}` : '');
    this.tPerdidos.setColor(this.perdidos >= 2 ? COLOR.rosa : COLOR.crema);
  }

  // ---------- Controles: teclado, ratón y dedo ----------

  controles() {
    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE');
    this.input.keyboard.on('keydown-ONE', () => this.elegir(0));
    this.input.keyboard.on('keydown-TWO', () => this.elegir(1));
    this.input.keyboard.on('keydown-THREE', () => this.elegir(2));
    this.input.keyboard.on('keydown-Q', () => this.elegir((this.municion + 2) % 3));
    this.input.keyboard.on('keydown-E', () => this.elegir((this.municion + 1) % 3));
    this.input.on('wheel', (_p, _o, _dx, dy) => { if (dy) this.elegir((this.municion + (dy > 0 ? 1 : 2)) % 3); });
    this.input.on('pointerdown', p => this.alPulsar(p));
    this.input.on('pointermove', p => this.alMover(p));
    this.input.on('pointerup', p => this.alSoltar(p));
    if (!MOVIL) this.input.setDefaultCursor('crosshair');
    this.events.once('shutdown', () => this.input.setDefaultCursor('default'));
    this.mira.setVisible(!MOVIL);
  }

  enArena(x, y) { return x >= REC.ax0 && x <= REC.ax1 && y >= REC.ay0 && y <= REC.ay1; }

  alPulsar(p) {
    if (!this.activo) return;
    if (MOVIL && p.x < REC.ax0 && p.y > 300 && this.joy.id === null) {
      this.joy.id = p.id;
      this.punteros[p.id] = { rol: 'joy' };
      this.alMover(p);
      return;
    }
    if (this.enArena(p.x, p.y)) {
      this.punteros[p.id] = { rol: 'apunta' };
      this.aim.x = p.x; this.aim.y = p.y;
    }
  }

  alMover(p) {
    const r = this.punteros[p.id];
    if (r && r.rol === 'joy') {
      let dx = (p.x - REC.joy.x) / REC.joy.r, dy = (p.y - REC.joy.y) / REC.joy.r;
      const l = Math.hypot(dx, dy);
      if (l > 1) { dx /= l; dy /= l; }
      this.joy.x = Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2 ? 0 : dx;
      this.joy.y = Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2 ? 0 : dy;
      if (this.knob) this.knob.setPosition(REC.joy.x + dx * REC.joy.r * 0.8, REC.joy.y + dy * REC.joy.r * 0.8);
      return;
    }
    if (r && r.rol === 'apunta') { this.aim.x = Phaser.Math.Clamp(p.x, REC.ax0, REC.ax1); this.aim.y = Phaser.Math.Clamp(p.y, REC.ay0, REC.ay1); return; }
    if (!MOVIL && this.enArena(p.x, p.y)) { this.aim.x = p.x; this.aim.y = p.y; }
  }

  alSoltar(p) {
    const r = this.punteros[p.id];
    if (r && r.rol === 'joy') {
      this.joy = { id: null, x: 0, y: 0 };
      if (this.knob) this.knob.setPosition(REC.joy.x, REC.joy.y);
    }
    delete this.punteros[p.id];
  }

  elegir(i) {
    if (i === this.municion) return;
    this.municion = i;
    this.pintarMuni();
    this.sonar('pop', 0.2, 0.05);
  }

  // ---------- Presentación y oleadas ----------

  presentacion() {
    const ayuda = MOVIL ? 'Joystick mueve · dispara solo · toca para apuntar' : 'WASD mueve · ratón apunta · clic dispara · 1 2 3 munición';
    const banda = this.add.rectangle(REC.centro.x, REC.centro.y - 90, 760, 130, HEX.tinta, 0.7).setDepth(64);
    const t1 = texto(this, REC.centro.x, REC.centro.y - 112, 'FICHA INSERTADA', 54, COLOR.amarillo).setDepth(65).setScale(0);
    const t2 = texto(this, REC.centro.x, REC.centro.y - 60, ayuda, 24, COLOR.crema, 720).setDepth(65).setAlpha(0);
    sfx(this, 'sting', { volume: 0.45 });
    this.tweens.add({ targets: t1, scale: 1, duration: 360, ease: 'Back.out' });
    this.tweens.add({ targets: t2, alpha: 1, duration: 300, delay: 250 });
    this.deckTexto.setText('1 FICHA');
    // El primer bocadillo, cuando ya se ha ido el rótulo (antes tapaba «FICHA INSERTADA»).
    this.time.delayedCall(2450, () => this.decir(this.p.x, this.p.y - 120, REC_FRASES.inicio[0], 'abajo', 1900, true));
    this.time.delayedCall(2400, () => {
      [banda, t1, t2].forEach(o => o.destroy());
      this.activo = true;
      this.empezarOla();
    });
  }

  tamOla(n) { return Math.min(60, Math.round((6 + 2.6 * n) * this.dif)); }

  planOla(n) {
    const cola = [];
    const jefeOla = n % 5 === 0;
    let total = this.tamOla(n);
    if (jefeOla) total = Math.round(total * 0.4);
    const pesos = [['gota', 6]];
    if (n >= 2) pesos.push(['salpicon', 3]);
    if (n >= 3) pesos.push(['charco', 2]);
    if (n >= 7) { pesos[0][1] = 4; pesos.find(p => p[0] === 'salpicon')[1] = 4; pesos.find(p => p[0] === 'charco')[1] = 3; }
    const suma = pesos.reduce((a, p) => a + p[1], 0);
    for (let i = 0; i < total; i++) {
      let r = Math.random() * suma, tipo = 'gota';
      for (const [k, w] of pesos) { if ((r -= w) <= 0) { tipo = k; break; } }
      cola.push({ tipo });
    }
    if (!jefeOla && n >= 4 && n % 2 === 0) {
      const grandes = 1 + Math.floor((n - 4) / 6);
      for (let i = 0; i < grandes; i++) cola.splice(Math.floor(Math.random() * cola.length * 0.8) + Math.floor(cola.length * 0.2), 0, { tipo: 'grande' });
    }
    if (jefeOla) cola.splice(Math.floor(cola.length * 0.3), 0, { tipo: 'jefe' });
    this.intervalo = Math.max(0.42, 1.5 - 0.05 * n) / this.dif;
    return cola;
  }

  empezarOla() {
    if (this._acabado) return;
    this.ola++;
    this.fase = 'ola';
    this.tocadasOla = 0;
    this.cola = this.planOla(this.ola);
    this.spawnT = 0.9;
    const jefeOla = this.ola % 5 === 0;
    this.rotuloArena(jefeOla ? `OLEADA ${this.ola} · ¡JEFE!` : `OLEADA ${this.ola}`, jefeOla ? COLOR.rosa : COLOR.amarillo);
    sfx(this, jefeOla ? 'sting' : 'tiroriro', { volume: 0.4 });
    if (!jefeOla && this.ola > 1) this.time.delayedCall(700, () => this.vozLibre(null, REC_FRASES.ola, 'ola'));
  }

  rotuloArena(str, color) {
    const t = texto(this, REC.centro.x, REC.ay0 + 66, str, 44, color).setDepth(65).setScale(0);
    this.tweens.add({ targets: t, scale: 1, duration: 260, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 18, duration: 420, delay: 1100, onComplete: () => t.destroy() });
  }

  terminarOla() {
    this.fase = 'pausa';
    const limpia = this.tocadasOla === 0;
    const bono = 200 * this.ola + (limpia ? 300 : 0);
    this.sumar(bono, REC.centro.x, REC.centro.y - 60, COLOR.verde, 34);
    this.rotuloArena(limpia ? `¡Oleada ${this.ola} limpia! +${bono}` : `Oleada ${this.ola} superada +${bono}`, COLOR.verde);
    this.carga = Math.min(REC.cargaMax, this.carga + 1);
    this.pintarCarga();
    sfx(this, 'campanita', { volume: 0.4 });
    this.soltarPotenciador();
    this.time.delayedCall(2800, () => { if (!this._acabado) this.empezarOla(); });
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.t += dt;
    this.animarMarco(dt);
    if (!this.activo) { this.vistas(); return; }
    this.leerEntrada();
    this.moverJugador(dt);
    this.disparos(dt);
    this.generar(dt);
    this.moverEnemigos(dt);
    this.moverBalas(dt);
    this.actualizarCharcos(dt);
    this.actualizarPickups(dt);
    this.actualizarEfectos(dt);
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }
    this.vistas();
    if (this.fase === 'ola' && !this.cola.length && !this.enemigos.some(e => e.vivo)) this.terminarOla();
  }

  animarMarco(dt) {
    this.banda.y += 36 * dt;
    if (this.banda.y > REC.ay1 + 40) this.banda.y = REC.ay0 - 40;
    this.parpadeoTop += dt;
    const fase = Math.floor(this.t * 3) % 2;
    this.luces.forEach((l, i) => l.setAlpha((i + fase) % 2 ? 1 : 0.35));
  }

  leerEntrada() {
    const k = this.teclas;
    let dx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    let dy = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);
    if (this.joy.id !== null && (this.joy.x || this.joy.y)) { dx = this.joy.x; dy = this.joy.y; }
    const l = Math.hypot(dx, dy);
    if (l > 1) { dx /= l; dy /= l; }
    this.mov.x = dx; this.mov.y = dy;
  }

  moverJugador(dt) {
    // Charcos: resbalas y pierdes el agarre.
    let sobre = false;
    for (const c of this.charcos) if (Math.hypot(this.p.x - c.x, this.p.y - c.y) < c.r + 12) { sobre = true; break; }
    if (sobre) this.resbala = 0.45;
    else this.resbala = Math.max(0, this.resbala - dt);
    const desl = this.resbala > 0;
    const obj = { x: this.mov.x * REC.vel, y: this.mov.y * REC.vel };
    const k = desl ? 1.6 : 14;
    this.vel.x += (obj.x - this.vel.x) * Math.min(1, k * dt);
    this.vel.y += (obj.y - this.vel.y) * Math.min(1, k * dt);
    this.p.x = Phaser.Math.Clamp(this.p.x + this.vel.x * dt, REC.ax0 + 40, REC.ax1 - 40);
    this.p.y = Phaser.Math.Clamp(this.p.y + this.vel.y * dt, REC.ay0 + 52, REC.ay1 - 34);
    if (desl && !this._resb) { this._resb = true; this.sonar('boing', 0.25, 0.8); }
    if (!desl) this._resb = false;
    // Los grandes y los jefes te apartan: hay que rodearlos.
    for (const e of this.enemigos) {
      if (!e.vivo || !e.t.empuja) continue;
      const d = Math.hypot(this.p.x - e.x, this.p.y - e.y);
      const lim = e.t.r + 24;
      if (d < lim) {
        const nx = d > 0.01 ? (this.p.x - e.x) / d : 1, ny = d > 0.01 ? (this.p.y - e.y) / d : 0;
        this.p.x = Phaser.Math.Clamp(e.x + nx * lim, REC.ax0 + 40, REC.ax1 - 40);
        this.p.y = Phaser.Math.Clamp(e.y + ny * lim, REC.ay0 + 52, REC.ay1 - 34);
        this.vel.x = nx * 380; this.vel.y = ny * 380;
        if (this.empuje <= 0) {
          this.empuje = 0.9;
          this.aturd = 0.5;
          this.sonar('bonk', 0.4, 0.3);
          this.flotante(this.p.x, this.p.y - 70, '¡BONK!', COLOR.rosa, 28);
        }
      }
    }
    this.empuje -= dt;
  }

  disparos(dt) {
    this.cd -= dt;
    this.aturd -= dt;
    const manual = Object.values(this.punteros).some(r => r.rol === 'apunta') || this.teclas.SPACE.isDown;
    let quiere = false;
    if (manual) {
      quiere = true;
    } else if (MOVIL) {
      const a = this.autoApuntar();
      if (a) { this.aim.x = a.x; this.aim.y = a.y; quiere = true; }
    }
    this.apuntando = Math.atan2(this.aim.y - this.p.y, this.aim.x - this.p.x);
    if (quiere && this.cd <= 0 && this.aturd <= 0) this.lanzar();
  }

  // Disparo automático del móvil: lo más urgente (el amarillo más cerca de su cliente).
  autoApuntar() {
    if (this.municion === 2) {
      const heridos = this.clientes.filter(c => !c.perdido && c.hp < c.max);
      if (!heridos.length || this.carga <= 0) return null;
      heridos.sort((a, b) => Math.hypot(a.x - this.p.x, a.y - this.p.y) - Math.hypot(b.x - this.p.x, b.y - this.p.y));
      return { x: heridos[0].x, y: heridos[0].y - 40 };
    }
    const vivos = this.enemigos.filter(e => e.vivo);
    if (!vivos.length) return null;
    let mejor = null, mejorV = 1e9;
    for (const e of vivos) {
      let v = Math.hypot(e.x - e.obj.x, e.y - e.obj.y);
      if (this.municion === 1) v -= vivos.filter(o => o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 100).length * 60;
      if (e.t.escudo) v += 160;
      if (v < mejorV) { mejorV = v; mejor = e; }
    }
    return { x: mejor.x + (mejor.hx || 0) * 20, y: mejor.y + (mejor.hy || 0) * 20 };
  }

  lanzar() {
    const a = this.apuntando;
    const dx = Math.cos(a), dy = Math.sin(a);
    const mx = this.p.x + dx * 44, my = this.p.y - 10 + dy * 44;
    if (this.municion === 2) {
      if (!this.clientes.some(c => !c.perdido && c.hp < c.max)) { this.avisarVacio('sinTocado'); this.cd = 0.25; return; }
      if (this.carga <= 0) { this.avisarVacio('vacio'); this.cd = 0.25; return; }
      this.carga--;
      this.pintarCarga();
      this.cd = 0.4;
      this.nuevaBala('resu', mx, my, dx * 700, dy * 700, 17, 'rc-resu');
      this.sonar('fup', 0.45, 0.1);
    } else if (this.municion === 1) {
      this.cd = 0.62;
      const dist = Phaser.Math.Clamp(Math.hypot(this.aim.x - mx, this.aim.y - my), 120, 640);
      const b = this.nuevaBala('salado', mx, my, dx * 540, dy * 540, 15, 'rc-salado');
      b.meta = dist;
      this.sonar('zas', 0.3, 0.1);
    } else {
      this.cd = 0.13;
      const aa = a + (Math.random() - 0.5) * 0.04;
      this.nuevaBala('dulce', mx, my, Math.cos(aa) * 940, Math.sin(aa) * 940, 11, 'rc-dulce');
      this.sonar('pop', 0.2, 0.07);
    }
    this.dispAnim = 0.09;
  }

  avisarVacio(clave) {
    if (this.t - this.ultimoAvisoVacio < 2.2) return;
    this.ultimoAvisoVacio = this.t;
    this.sonar('bonk', 0.35, 0.2);
    this.flotante(this.p.x, this.p.y - 74, REC_FRASES[clave][0], COLOR.rosa, 22);
    if (clave === 'vacio') this.tweens.add({ targets: this.botonesMuni[2], scale: 1.1, duration: 100, yoyo: true, repeat: 1 });
  }

  nuevaBala(tipo, x, y, vx, vy, r, tex) {
    const img = this.add.image(x, y, tex).setDepth(40);
    if (tipo === 'resu') img.setScale(1.2);
    const b = { tipo, x, y, vx, vy, r, img, rec: 0, meta: 1e9, vivo: true };
    this.balas.push(b);
    return b;
  }

  // ---------- Amarillos ----------

  puntoEntrada(objetivo) {
    for (let i = 0; i < 12; i++) {
      const lado = Math.floor(Math.random() * 4);
      let x, y;
      if (lado === 0) { x = Phaser.Math.Between(REC.ax0 + 60, REC.ax1 - 60); y = REC.ay0 + 28; }
      else if (lado === 1) { x = Phaser.Math.Between(REC.ax0 + 60, REC.ax1 - 60); y = REC.ay1 - 28; }
      else if (lado === 2) { x = REC.ax0 + 28; y = Phaser.Math.Between(REC.ay0 + 60, REC.ay1 - 60); }
      else { x = REC.ax1 - 28; y = Phaser.Math.Between(REC.ay0 + 60, REC.ay1 - 60); }
      if (Math.hypot(x - objetivo.x, y - objetivo.y) > 280 && Math.hypot(x - this.p.x, y - this.p.y) > 150) return { x, y };
    }
    return { x: REC.ax0 + 28, y: REC.ay0 + 28 };
  }

  elegirObjetivo(x, y) {
    const vivos = this.clientes.filter(c => !c.perdido);
    if (!vivos.length) return this.clientes[0];
    vivos.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    const r = Math.random();
    return vivos[r < 0.55 ? 0 : r < 0.85 ? Math.min(1, vivos.length - 1) : Math.min(2, vivos.length - 1)];
  }

  generar(dt) {
    if (this.fase !== 'ola' || !this.cola.length) return;
    this.spawnT -= dt;
    if (this.spawnT > 0) return;
    this.spawnT = this.intervalo * Phaser.Math.FloatBetween(0.7, 1.3);
    const s = this.cola.shift();
    if (s.tipo === 'jefe') this.crearJefe();
    else this.crear(s.tipo);
  }

  crear(tipo, x, y, objetivo, extra = {}) {
    const t = REC_TIPOS[tipo];
    let obj = objetivo || this.elegirObjetivo(this.p.x, this.p.y);
    if (x === undefined) {
      obj = objetivo || this.elegirObjetivo(Phaser.Math.Between(REC.ax0, REC.ax1), Phaser.Math.Between(REC.ay0, REC.ay1));
      const q = this.puntoEntrada(obj);
      x = q.x; y = q.y;
    }
    return this.nuevoEnemigo(t, tipo, x, y, obj, extra);
  }

  crearJefe() {
    if (!this.bolsaJefe.length) this.bolsaJefe = Phaser.Utils.Array.Shuffle([...REC_JEFES]);
    const def = this.bolsaJefe.pop();
    const obj = this.elegirObjetivo(REC.centro.x, REC.centro.y);
    const q = this.puntoEntrada(obj);
    const escala = 1 + 0.3 * Math.max(0, this.ola / 5 - 1);
    const t = { ...def, hp: Math.round(def.hp * escala * (0.9 + 0.1 * this.dif)) };
    const e = this.nuevoEnemigo(t, def.id, q.x, q.y, obj, { jefe: true });
    this.jefe = e;
    e.fases = [0.66, 0.33];
    this.barraJefe.setVisible(true);
    this.nombreJefe.setText(def.nombre).setVisible(true);
    this.rotuloArena(def.nombre.toUpperCase(), COLOR.rosa);
    this.time.delayedCall(900, () => this.vozLibre('puky', REC_FRASES.jefe, 'jefe', true));
    return e;
  }

  nuevoEnemigo(t, tipo, x, y, obj, extra = {}) {
    const img = this.add.image(x, y, t.tex).setDepth(20);
    if (t.tinte) img.setTint(t.tinte);
    const esc = t.tam / img.width;
    img.setScale(0);
    const e = {
      t, tipo, x, y, hp: t.hp, hpMax: t.hp, img, esc, obj, hx: 0, hy: 1, fase: Math.random() * 6,
      stun: 0, vivo: true, tm: 0, flash: 0, tocados: new Set(), pin: null, estrellas: null,
      g: t.escudo || t.jefe ? this.add.graphics().setDepth(21) : null, ...extra,
    };
    this.tweens.add({ targets: img, scaleX: esc, scaleY: esc, duration: 240, ease: 'Back.out' });
    if (this.efectos.marca > 0) this.marcar(e);
    this.enemigos.push(e);
    return e;
  }

  moverEnemigos(dt) {
    const base = this.dif * Math.min(1.9, 1 + 0.035 * (this.ola - 1));
    const lento = this.efectos.lento > 0 ? 0.4 : 1;
    for (const e of this.enemigos) {
      if (!e.vivo) continue;
      e.tm += dt;
      if (e.flash > 0) { e.flash -= dt; if (e.flash <= 0) { e.img.clearTint(); if (e.t.tinte) e.img.setTint(e.t.tinte); } }
      if (e.obj.perdido || (e.tocados.has(e.obj.id))) e.obj = this.elegirObjetivoLibre(e);
      let k = lento;
      if (e.stun > 0) { e.stun -= dt; k = 0; if (e.stun <= 0) this.quitarEstrellas(e); }
      const tx = e.obj.x, ty = e.obj.y - 10;
      const dx = tx - e.x, dy = ty - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const hx = dx / d, hy = dy / d;
      e.hx = hx; e.hy = hy;
      let mv = e.t.vel * base * k * dt;
      if (e.tipo === 'gota' || e.tipo === 'gotita') {
        const lat = Math.sin(this.t * 3 + e.fase) * 34 * k * dt;
        e.x += hx * mv - hy * lat;
        e.y += hy * mv + hx * lat;
      } else {
        e.x += hx * mv; e.y += hy * mv;
      }
      if (k > 0) this.comportamiento(e, dt);
      // Separación entre pequeños (que no se apilen en una sola bola).
      if (!e.t.empuja) {
        for (const o of this.enemigos) {
          if (o === e || !o.vivo || o.t.empuja) continue;
          const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy);
          const min = (e.t.r + o.t.r) * 0.7;
          if (od > 0.01 && od < min) { e.x += (ox / od) * (min - od) * 0.12; e.y += (oy / od) * (min - od) * 0.12; }
        }
      }
      if (Math.hypot(tx - e.x, ty - e.y) < 34 + e.t.r * 0.45) this.alcanza(e);
    }
    if (this.enemigos.some(e => !e.vivo)) this.enemigos = this.enemigos.filter(e => e.vivo);
  }

  elegirObjetivoLibre(e) {
    const vivos = this.clientes.filter(c => !c.perdido && !e.tocados.has(c.id));
    if (!vivos.length) return this.clientes.find(c => !c.perdido) || this.clientes[0];
    vivos.sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y));
    return vivos[0];
  }

  // Lo propio de cada uno: el charco deja rastro, el Goterón gotea, el Gordo revienta.
  comportamiento(e, dt) {
    if (e.tipo === 'charco' || e.tipo === 'madre') {
      const cada = e.tipo === 'madre' ? 0.32 : 0.5;
      if (e.tm - (e.ultHuella || 0) > cada) { e.ultHuella = e.tm; this.huella(e.x, e.y + e.t.r * 0.2, e.tipo === 'madre' ? 50 : 30, e.tipo === 'madre' ? 6 : 4.5); }
    }
    if (e.tipo === 'goteron' && e.tm - (e.ultGota || 0) > 2.2) {
      e.ultGota = e.tm;
      if (this.enemigos.length < 30) {
        this.sonar('goteo', 0.4, 0.5);
        for (let i = 0; i < 2; i++) this.crear('gota', e.x + (i ? 40 : -40), e.y + 30, e.obj);
      }
    }
    if (e.tipo === 'gordo' && e.fases && e.fases.length && e.hp / e.hpMax < e.fases[0]) {
      e.fases.shift();
      this.sonar('chapoteo', 0.5, 0.3);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.6;
        this.crear('salpicon', e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 80, e.obj);
      }
      this.puff(e.x, e.y, 70, 0xffc233);
    }
    if (e.jefe && this.efectos.lento > 0 && Math.random() < dt * 0.5) this.burbujaSuelta(e.x, e.y);
  }

  huella(x, y, r, vida) {
    if (this.charcos.length > 36) { const v = this.charcos.shift(); v.img.destroy(); }
    const img = this.add.image(x, y, 'rc-huella').setDepth(5).setAlpha(0.85);
    img.setScale((r * 2) / 84);
    this.charcos.push({ x, y, r, vida, max: vida, img });
  }

  actualizarCharcos(dt) {
    for (const c of this.charcos) {
      c.vida -= dt;
      if (c.vida < 1.2) c.img.setAlpha(Math.max(0, c.vida / 1.2) * 0.85);
    }
    if (this.charcos.some(c => c.vida <= 0)) {
      this.charcos.filter(c => c.vida <= 0).forEach(c => c.img.destroy());
      this.charcos = this.charcos.filter(c => c.vida > 0);
    }
  }

  alcanza(e) {
    const c = e.obj;
    e.tocados.add(c.id);
    this.puff(e.x, e.y, e.t.r * 2, 0xf5d23a);
    this.tocar(c, e.t.dano || 1);
    if (e.t.jefe) {
      // El jefe sigue su camino hacia otro cliente.
      e.obj = this.elegirObjetivoLibre(e);
      return;
    }
    // El resto se estampa y desaparece (no suma).
    this.sonar('plop', 0.4, 0.1);
    this.matarSilencio(e);
  }

  matarSilencio(e) {
    e.vivo = false;
    this.limpiarEnemigo(e);
  }

  limpiarEnemigo(e) {
    this.tweens.killTweensOf(e.img);
    e.img.destroy();
    if (e.g) e.g.destroy();
    if (e.pin) e.pin.destroy();
    this.quitarEstrellas(e);
  }

  // ---------- Disparos: balas, daño y explosiones ----------

  moverBalas(dt) {
    for (const b of this.balas) {
      if (!b.vivo) continue;
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.rec += Math.hypot(b.vx, b.vy) * dt;
      b.img.setAngle(b.img.angle + (b.tipo === 'resu' ? 0 : 640 * dt));
      if (b.x < REC.ax0 - 10 || b.x > REC.ax1 + 10 || b.y < REC.ay0 - 10 || b.y > REC.ay1 + 10) { this.quitarBala(b); continue; }
      // Potenciadores: se recogen también a tiros.
      for (const pk of this.pickups) if (!pk.cogido && Math.hypot(b.x - pk.x, b.y - pk.y) < 38) this.recoger(pk);
      if (b.tipo === 'resu') {
        const c = this.clientes.find(c => !c.perdido && c.hp < c.max && Math.hypot(b.x - c.x, b.y - (c.y - 30)) < 56);
        if (c) { this.quitarBala(b); this.curar(c); }
        continue;
      }
      let dio = null;
      for (const e of this.enemigos) {
        if (e.vivo && Math.hypot(b.x - e.x, b.y - e.y) < e.t.r + b.r) { dio = e; break; }
      }
      if (b.tipo === 'dulce' && dio) {
        this.golpear(dio, 1, b.x - b.vx * 0.02, b.y - b.vy * 0.02, 0.3);
        this.chispa(b.x, b.y, 0xff5fa2);
        this.quitarBala(b);
      } else if (b.tipo === 'salado' && (dio || b.rec >= b.meta)) {
        this.explotar(b.x, b.y, 96, 2, 0.6);
        this.quitarBala(b);
      }
    }
    if (this.balas.some(b => !b.vivo)) this.balas = this.balas.filter(b => b.vivo);
  }

  quitarBala(b) { b.vivo = false; b.img.destroy(); }

  explotar(x, y, radio, dano, mEscudo) {
    const aro = this.add.circle(x, y, 10, 0xffd23f, 0.28).setStrokeStyle(5, HEX.tinta).setDepth(44);
    this.tweens.add({ targets: aro, scale: radio / 10, alpha: 0, duration: 260, onComplete: () => aro.destroy() });
    this.chispa(x, y, 0xffd23f, 8);
    this.sonar('chof', 0.4, 0.08);
    for (const e of this.enemigos) {
      if (e.vivo && Math.hypot(e.x - x, e.y - y) < radio + e.t.r) this.golpear(e, dano, x, y, mEscudo);
    }
  }

  // Daño con escudo: al grande le entra poco por delante (hay que rodearlo).
  golpear(e, dano, sx, sy, mEscudo = 0.3) {
    if (!e.vivo) return;
    const dx = sx - e.x, dy = sy - e.y, d = Math.hypot(dx, dy) || 1;
    if (e.t.escudo && (dx / d) * e.hx + (dy / d) * e.hy > 0.35) {
      dano *= mEscudo;
      this.sonar('bonk', 0.25, 0.2);
      this.chispa(e.x + e.hx * e.t.r, e.y + e.hy * e.t.r, 0xffffff, 3);
    }
    if (e.pin) dano *= 2;
    e.hp -= dano;
    e.flash = 0.07;
    e.img.setTintFill(0xffffff);
    if (e.hp <= 0) this.matar(e);
  }

  matar(e) {
    if (!e.vivo) return;
    e.vivo = false;
    this.kills++;
    this.combo++;
    this.comboT = 1.8;
    const mult = this.mult();
    const pts = e.t.pts * mult;
    this.sumar(pts, e.x, e.y - 18, e.t.jefe ? COLOR.rosa : COLOR.crema, e.t.jefe ? 40 : e.t.pts >= 100 ? 32 : 22);
    this.killsCarga++;
    if (this.killsCarga >= 10 && this.carga < REC.cargaMax) {
      this.killsCarga = 0;
      this.carga++;
      this.pintarCarga();
      this.sonar('campanita', 0.2, 0.4);
    } else if (this.killsCarga >= 10) this.killsCarga = 0;
    // Salvar a un cliente: lo que cae cerca de él cuenta para sus iniciales.
    const cerca = this.clientes.filter(c => !c.perdido).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
    if (cerca && Math.hypot(cerca.x - e.x, cerca.y - e.y) < 170) cerca.salvas++;
    this.puff(e.x, e.y, e.t.r * 2.2, 0xf5d23a);
    this.mancha(e.x, e.y, e.t.r);
    this.sonar(e.t.jefe || e.t.escudo ? 'platillo' : Math.random() < 0.5 ? 'fup' : 'plop', e.t.jefe ? 0.45 : 0.3, 0.06);
    if (e.tipo === 'salpicon') {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + Math.random();
        const h = this.crear('gotita', e.x + Math.cos(a) * 30, e.y + Math.sin(a) * 30, e.obj);
        h.tocados = new Set(e.tocados);
      }
    }
    if (e.t.jefe) {
      this.jefe = null;
      this.barraJefe.setVisible(false);
      this.nombreJefe.setVisible(false);
      this.enemigos.filter(o => o.vivo && o !== e && o.tipo === 'gota' && o.t.tam === 40).forEach(() => {});
      this.rotuloArena('¡JEFE FUERA!', COLOR.verde);
    }
    this.limpiarEnemigo(e);
  }

  mult() { return Math.min(3, 1 + Math.floor(this.combo / 8)); }

  sumar(n, x, y, color, tam) {
    this.puntos = Math.max(0, this.puntos + n);
    if (x !== undefined) this.flotante(x, y, `+${n}`, color, tam);
    const ya = this.estrellasVistas;
    const ahora = typeof estrellasDe === 'function' ? estrellasDe('Recreativa', this.puntos) : 0;
    if (ahora > ya) {
      this.estrellasVistas = ahora;
      this.sonar('campanita', 0.45, 0.1);
      const e = this.estrellasG[ahora - 1];
      if (e) this.tweens.add({ targets: e, scale: 1.7, duration: 200, yoyo: true, ease: 'Back.out' });
    }
  }

  // ---------- Clientes ----------

  tocar(c, dano) {
    if (c.perdido) return;
    this.tocadasOla++;
    c.hp = Math.max(0, c.hp - dano);
    c.img.setTint(0xffe566);
    this.pintarPips(c);
    this.puff(c.x, c.y - 30, 90, 0xf5d23a);
    this.sonar('chapoteo', 0.45, 0.15);
    this.tweens.add({ targets: c.img, angle: { from: -6, to: 0 }, duration: 260, ease: 'Back.out' });
    if (c.hp <= 0) {
      c.perdido = true;
      this.perdidos++;
      c.img.setTintFill(0xe8b800);
      c.img.setScale(c.esc * 0.88, c.esc * 0.8);
      c.pips.clear();
      this.rotuloArena(`¡Perdemos a ${c.nombre}!`, COLOR.rosa);
      this.decirCliente(c, 'perdido', true);
      this.pintarIconosCli();
      if (this.perdidos >= REC.maxPerdidos) { this.time.delayedCall(500, () => this.final()); this.activo = false; }
    } else {
      this.decirCliente(c, 'toque', false);
      this.pintarIconosCli();
    }
  }

  curar(c) {
    c.hp = c.max;
    c.img.clearTint();
    this.pintarPips(c);
    this.pintarIconosCli();
    this.sonar('campanita', 0.5, 0.1);
    this.sumar(50, c.x, c.y - 100, COLOR.verde, 28);
    for (let i = 0; i < 6; i++) {
      const s = this.add.circle(c.x + Phaser.Math.Between(-40, 40), c.y - 20, 5, 0x7ee081).setDepth(45);
      this.tweens.add({ targets: s, y: s.y - Phaser.Math.Between(40, 90), alpha: 0, duration: 600, onComplete: () => s.destroy() });
    }
    // Tarda: la Pompa lo agradece tres frases tarde.
    if (c.id === 'pompa') this.time.delayedCall(2300, () => { if (!this._acabado) this.decirCliente(c, 'curado', true); });
    else this.decirCliente(c, 'curado', true);
    this.soltarPotenciador(c);
  }

  // ---------- Potenciadores: los sueltan los propios personajes, cada uno a su manera ----------

  soltarPotenciador(preferido) {
    if (this.pickups.length >= 2) return;
    let c = null;
    // Baraja sin repetir: hasta que no han salido todos, no se repite ninguno.
    for (let i = 0; i < 10 && !c; i++) {
      if (!this.bolsaPot.length) this.bolsaPot = Phaser.Utils.Array.Shuffle(this.clientes.map(x => x.id));
      const id = this.bolsaPot.pop();
      const cand = this.clientes.find(x => x.id === id);
      if (cand && !cand.perdido) c = cand;
    }
    if (!c) return;
    const k = 0.3;
    const x = Phaser.Math.Clamp(c.x + (REC.centro.x - c.x) * k + Phaser.Math.Between(-20, 20), REC.ax0 + 60, REC.ax1 - 60);
    const y = Phaser.Math.Clamp(c.y + (REC.centro.y - c.y) * k, REC.ay0 + 70, REC.ay1 - 70);
    const cont = this.add.container(x, y).setDepth(41);
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillCircle(0, 0, 36);
    g.fillStyle(c.cojin, 1).fillCircle(0, 0, 31);
    g.fillStyle(0xffffff, 0.3).fillCircle(-9, -10, 11);
    const img = this.add.image(0, 8, c.tex).setOrigin(0.5, 0.5);
    img.setScale(50 / img.height);
    const et = texto(this, 0, -52, REC_POTENCIADORES[c.id].nombre, 20, COLOR.crema);
    cont.add([g, img, et]);
    cont.setScale(0);
    this.tweens.add({ targets: cont, scale: 1, duration: 300, ease: 'Back.out' });
    this.pickups.push({ id: c.id, x, y, vida: 11, img: cont, cogido: false, baseY: y });
    this.sonar('pop', 0.35, 0.3);
  }

  actualizarPickups(dt) {
    for (const pk of this.pickups) {
      if (pk.cogido) continue;
      pk.vida -= dt;
      pk.img.y = pk.baseY + Math.sin(this.t * 4 + pk.x) * 6;
      pk.img.setAlpha(pk.vida < 3 ? (Math.floor(this.t * 8) % 2 ? 1 : 0.35) : 1);
      if (Math.hypot(this.p.x - pk.x, this.p.y - pk.y) < 50) this.recoger(pk);
      else if (pk.vida <= 0) { pk.cogido = true; this.tweens.add({ targets: pk.img, scale: 0, duration: 200, onComplete: () => pk.img.destroy() }); }
    }
    if (this.pickups.some(p => p.cogido)) this.pickups = this.pickups.filter(p => !p.cogido);
  }

  recoger(pk) {
    if (pk.cogido) return;
    pk.cogido = true;
    this.tweens.add({ targets: pk.img, scale: 1.6, alpha: 0, duration: 260, onComplete: () => pk.img.destroy() });
    this.sumar(25);
    this.activar(pk.id);
  }

  activar(id) {
    const c = this.clientes.find(x => x.id === id);
    const def = REC_POTENCIADORES[id];
    const frase = this.sacar(`pot-${id}`, def.dice);
    const fn = () => { if (!this._acabado && c) this.decir(c.x, c.y, frase, null, 1800, true, c); };
    if (def.tarde) this.time.delayedCall(1700, fn); else fn();
    if (id === 'lasslow') this.pedo();
    else if (id === 'pompa') this.burbuja();
    else if (id === 'cotine') this.lluviaDulce();
    else if (id === 'palicaso') this.grito();
    else if (id === 'perico') this.pinpin();
  }

  // Lasslow: un pedo que barre la sala de izquierda a derecha.
  pedo() {
    sfx(this, 'pedo', { volume: 0.55 });
    const nubes = [];
    for (let y = REC.ay0 + 50; y < REC.ay1; y += 74) {
      const n = this.add.image(REC.ax0 - 60, y, 'humo').setTint(0xa8d65a).setAlpha(0.55).setScale(0.72).setDepth(46);
      n.dy = Phaser.Math.Between(-10, 10);
      nubes.push(n);
    }
    this.pedos.push({ x: REC.ax0 - 60, golpeados: new Set(), nubes });
  }

  // Pompa: una burbuja que ralentiza toda la sala.
  burbuja() {
    this.efectos.lento = 6.5;
    sfx(this, 'hinchar', { volume: 0.4 });
    for (let i = 0; i < 9; i++) this.burbujaSuelta(Phaser.Math.Between(REC.ax0 + 60, REC.ax1 - 60), Phaser.Math.Between(REC.ay0 + 100, REC.ay1 - 40));
    this.cinta = this.add.rectangle(REC.centro.x, REC.centro.y, REC.ax1 - REC.ax0 - 20, REC.ay1 - REC.ay0 - 20, 0x5ad1ff, 0.07).setDepth(47).setStrokeStyle(6, 0x9fe7ff, 0.5);
  }

  burbujaSuelta(x, y) {
    if (this.burbujas.length > 22) return;
    const r = Phaser.Math.Between(18, 46);
    const b = this.add.circle(x, y, r, 0x9fe7ff, 0.12).setStrokeStyle(4, 0xdff6ff, 0.65).setDepth(47);
    b.vy = -Phaser.Math.Between(20, 45);
    b.fase = Math.random() * 6;
    b.x0 = x;
    this.burbujas.push(b);
  }

  // Cotine: llueve dulce sobre los amarillos.
  lluviaDulce() {
    this.lluvia = { quedan: 12, sig: 0.15 };
  }

  gotaDulce() {
    const vivos = this.enemigos.filter(e => e.vivo);
    const o = vivos.length ? vivos[Math.floor(Math.random() * vivos.length)] : null;
    const x = o ? o.x + Phaser.Math.Between(-20, 20) : Phaser.Math.Between(REC.ax0 + 80, REC.ax1 - 80);
    const y = o ? o.y + Phaser.Math.Between(-20, 20) : Phaser.Math.Between(REC.ay0 + 80, REC.ay1 - 80);
    const sombra = this.add.ellipse(x, y + 8, 60, 22, 0x000000, 0.3).setDepth(6);
    const dulce = this.add.image(x, y - 300, 'rc-dulce').setScale(2.2).setDepth(48);
    this.tweens.add({ targets: dulce, y, angle: 360, duration: 380, ease: 'Quad.in', onComplete: () => {
      dulce.destroy(); sombra.destroy();
      this.explotar(x, y, 66, 2, 0.6);
    } });
  }

  // Palicaso: grita y aturde a todos.
  grito() {
    sfx(this, 'aaah', { volume: 0.4 });
    const c = this.clientes.find(x => x.id === 'palicaso');
    const aro = this.add.circle(c.x, c.y - 30, 20, 0xffd628, 0.12).setStrokeStyle(8, 0xffd628, 0.8).setDepth(46);
    this.tweens.add({ targets: aro, scale: 60, alpha: 0, duration: 650, onComplete: () => aro.destroy() });
    for (const e of this.enemigos) {
      if (!e.vivo) continue;
      e.stun = Math.max(e.stun, e.t.jefe ? 1.4 : 2.8);
      this.ponerEstrellas(e);
    }
  }

  ponerEstrellas(e) {
    if (e.estrellas) return;
    e.estrellas = this.add.star(e.x, e.y, 5, 6, 13, 0xffd628).setStrokeStyle(3, HEX.tinta).setDepth(49);
  }

  quitarEstrellas(e) {
    if (e.estrellas) { e.estrellas.destroy(); e.estrellas = null; }
  }

  // Perico: «pin pin», marca a todos (reciben el doble).
  pinpin() {
    this.efectos.marca = 9;
    sfx(this, 'pin-pin', { volume: 0.5 });
    for (const e of this.enemigos) if (e.vivo) this.marcar(e);
  }

  marcar(e) {
    if (e.pin) return;
    e.pin = this.add.image(e.x, e.y, 'rc-pin').setDepth(49).setScale(0);
    this.tweens.add({ targets: e.pin, scale: 1, duration: 200, ease: 'Back.out' });
  }

  actualizarEfectos(dt) {
    if (this.efectos.lento > 0) {
      this.efectos.lento -= dt;
      if (this.efectos.lento <= 0 && this.cinta) { this.cinta.destroy(); this.cinta = null; }
    }
    if (this.efectos.marca > 0) {
      this.efectos.marca -= dt;
      if (this.efectos.marca <= 0) this.enemigos.forEach(e => { if (e.pin) { e.pin.destroy(); e.pin = null; } });
    }
    for (const b of this.burbujas) {
      b.y += b.vy * dt;
      b.x = b.x0 + Math.sin(this.t * 1.3 + b.fase) * 18;
      if (this.efectos.lento <= 0) b.alpha -= dt * 1.6;
    }
    if (this.burbujas.some(b => b.y < REC.ay0 - 40 || b.alpha <= 0.01)) {
      this.burbujas.filter(b => b.y < REC.ay0 - 40 || b.alpha <= 0.01).forEach(b => b.destroy());
      this.burbujas = this.burbujas.filter(b => b.active);
    }
    if (this.lluvia) {
      this.lluvia.sig -= dt;
      if (this.lluvia.sig <= 0) {
        this.gotaDulce();
        this.lluvia.quedan--;
        this.lluvia.sig = 0.34;
        if (this.lluvia.quedan <= 0) this.lluvia = null;
      }
    }
    for (const p of this.pedos) {
      p.x += 640 * dt;
      p.nubes.forEach((n, i) => { n.x = p.x + Math.sin(i * 1.7 + this.t * 5) * 22; n.y += Math.sin(this.t * 3 + i) * 0.3; n.setAngle(n.angle + dt * 20); if (p.x > REC.ax1 - 60) n.alpha = Math.max(0, n.alpha - dt * 1.4); });
      for (const e of this.enemigos) {
        if (!e.vivo || p.golpeados.has(e) || Math.abs(e.x - p.x) > 70 + e.t.r) continue;
        p.golpeados.add(e);
        this.golpear(e, e.t.jefe ? 4 : 3, e.x - 40, e.y, 0.6);
        if (e.vivo && !e.t.empuja) e.x = Math.min(REC.ax1 - 30, e.x + 70);
      }
    }
    if (this.pedos.some(p => p.x > REC.ax1 + 120)) {
      this.pedos.filter(p => p.x > REC.ax1 + 120).forEach(p => p.nubes.forEach(n => n.destroy()));
      this.pedos = this.pedos.filter(p => p.x <= REC.ax1 + 120);
    }
    // Iconos de efectos en el panel.
    const act = { pompa: this.efectos.lento / 6.5, perico: this.efectos.marca / 9, cotine: this.lluvia ? this.lluvia.quedan / 12 : 0 };
    this.efectoIcos.forEach(ei => {
      const v = Math.max(0, act[ei.id]);
      ei.img.setVisible(v > 0);
      ei.barra.clear();
      if (v > 0) {
        ei.barra.fillStyle(HEX.tinta, 1).fillRect(ei.x - 22, 488 - 12, 44, 9);
        ei.barra.fillStyle(0x7ee081, 1).fillRect(ei.x - 20, 488 - 10, 40 * v, 5);
      }
    });
  }

  // ---------- Vistas: píxel gordo, profundidades y marcadores ----------

  vistas() {
    const px = REC.pixel;
    const s = v => Math.round(v / px) * px;
    // Monchiman.
    const andando = Math.hypot(this.vel.x, this.vel.y) > 40;
    const bote = andando ? Math.sin(this.t * 16) * 2 : 0;
    this.pj.setPosition(s(this.p.x), s(this.p.y + bote));
    this.pj.setDepth(20 + this.p.y * 0.01 + 0.002);
    this.pj.setAngle(Phaser.Math.Clamp(this.vel.x / REC.vel * 7, -7, 7));
    this.pj.setScale(this.pjEsc * (this.aturd > 0 ? 1.12 : 1), this.pjEsc * (this.aturd > 0 ? 0.88 : 1));
    this.pj.setTint(this.resbala > 0 ? 0xfff2a0 : 0xffffff);
    if (this.resbala <= 0) this.pj.clearTint();
    this.sombra.setPosition(s(this.p.x), s(this.p.y + 34));
    this.pintarCanon();
    // Mira del ratón.
    this.mira.setPosition(s(this.aim.x), s(this.aim.y));
    // Enemigos.
    for (const e of this.enemigos) {
      if (!e.vivo) continue;
      e.img.setPosition(s(e.x), s(e.y));
      e.img.setDepth(20 + e.y * 0.01);
      if (e.img.scaleX > 0.05 && !this.tweens.isTweening(e.img)) {
        const b = 1 + Math.sin(this.t * 7 + e.fase) * 0.05;
        e.img.setScale(e.esc * (e.tipo === 'charco' || e.tipo === 'madre' ? 1 + Math.sin(this.t * 4 + e.fase) * 0.06 : 1), e.esc * b);
      }
      if (e.pin) e.pin.setPosition(s(e.x), s(e.y - e.t.r - 22 + Math.sin(this.t * 6) * 3));
      if (e.estrellas) { e.estrellas.setPosition(s(e.x + Math.cos(this.t * 6) * 18), s(e.y - e.t.r - 14)); e.estrellas.setAngle(this.t * 200); }
      if (e.g) this.dibujarExtras(e);
    }
    // Barra del jefe.
    if (this.jefe && this.jefe.vivo) {
      const j = this.jefe, w = 520, x0 = REC.centro.x - w / 2, y0 = REC.ay0 + 46;
      this.barraJefe.clear();
      this.barraJefe.fillStyle(HEX.tinta, 1).fillRoundedRect(x0 - 5, y0 - 5, w + 10, 22, 8);
      this.barraJefe.fillStyle(0x4a3d63, 1).fillRoundedRect(x0, y0, w, 12, 5);
      this.barraJefe.fillStyle(0xff5fa2, 1).fillRoundedRect(x0, y0, Math.max(0, w * j.hp / j.hpMax), 12, 5);
    }
    // Marcadores.
    if (this._pintadoPuntos !== this.puntos) { this._pintadoPuntos = this.puntos; this.tPuntos.setText(String(this.puntos)); }
    if (this._pintadaOla !== this.ola) { this._pintadaOla = this.ola; this.tOla.setText(this.ola ? String(this.ola) : '–'); }
    this.estrellasG.forEach((e, i) => e.setFillStyle(i < this.estrellasVistas ? HEX.amarillo : 0x3d3350));
    const m = this.mult();
    const txt = this.combo >= 3 ? `x${m} · ${this.combo}` : '';
    if (this._pintadoCombo !== txt) { this._pintadoCombo = txt; this.tCombo.setText(txt); this.tCombo.setColor(m >= 3 ? COLOR.rosa : m >= 2 ? COLOR.amarillo : COLOR.verde); }
    this.deckTexto.setAlpha(this.activo ? 0 : 1);
    // Palanca decorativa.
    this.palanca.setPosition(214 + this.mov.x * 9, REC.ay1 + 34 + this.mov.y * 9);
    this.dispAnim -= 1 / 60;
  }

  pintarCanon() {
    const g = this.canon;
    g.clear();
    const x = this.pj.x, y = this.pj.y - 10, a = this.apuntando || 0;
    const col = [0xff5fa2, 0xffd23f, 0x7ee081][this.municion];
    const len = 38 + (this.dispAnim > 0 ? -5 : 0);
    const ca = Math.cos(a), sa = Math.sin(a);
    const nx = -sa * 9, ny = ca * 9;
    g.fillStyle(HEX.tinta, 1).fillPoints([{ x: x + nx * 1.3 + ca * 14, y: y + ny * 1.3 + sa * 14 }, { x: x - nx * 1.3 + ca * 14, y: y - ny * 1.3 + sa * 14 }, { x: x - nx * 1.3 + ca * (len + 6), y: y - ny * 1.3 + sa * (len + 6) }, { x: x + nx * 1.3 + ca * (len + 6), y: y + ny * 1.3 + sa * (len + 6) }], true);
    g.fillStyle(col, 1).fillPoints([{ x: x + nx + ca * 16, y: y + ny + sa * 16 }, { x: x - nx + ca * 16, y: y - ny + sa * 16 }, { x: x - nx + ca * len, y: y - ny + sa * len }, { x: x + nx + ca * len, y: y + ny + sa * len }], true);
    if (this.dispAnim > 0) g.fillStyle(0xffffff, 0.9).fillCircle(x + ca * (len + 10), y + sa * (len + 10), 8);
    this.canon.setDepth(this.pj.depth + 0.001);
  }

  dibujarExtras(e) {
    const g = e.g;
    g.clear();
    g.setPosition(0, 0);
    if (e.t.escudo) {
      // El escudo, por delante: ahí casi no entra el daño.
      const a = Math.atan2(e.hy, e.hx), r = e.t.r + 8;
      g.lineStyle(14, HEX.tinta, 1).beginPath().arc(e.x, e.y, r, a - 0.9, a + 0.9).strokePath();
      g.lineStyle(7, 0x9fe7ff, 1).beginPath().arc(e.x, e.y, r, a - 0.9, a + 0.9).strokePath();
      const w = 70, y = e.y - e.t.r - 26;
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(e.x - w / 2 - 3, y - 3, w + 6, 14, 5);
      g.fillStyle(0xff5fa2, 1).fillRoundedRect(e.x - w / 2, y, Math.max(0, w * e.hp / e.hpMax), 8, 3);
    }
    g.setDepth(20 + e.y * 0.01 + 0.004);
  }

  // ---------- Efectos pequeños (sin pantallazos, sin temblores) ----------

  puff(x, y, d, color) {
    const p = this.add.circle(x, y, d * 0.3, color, 0.65).setStrokeStyle(4, HEX.tinta, 0.8).setDepth(43);
    this.tweens.add({ targets: p, scale: 1.8, alpha: 0, duration: 330, ease: 'Sine.out', onComplete: () => p.destroy() });
  }

  chispa(x, y, color, n = 4) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, d = Phaser.Math.Between(16, 38);
      const s = this.add.circle(x, y, Phaser.Math.Between(3, 5), color).setDepth(44);
      this.tweens.add({ targets: s, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, duration: 260, onComplete: () => s.destroy() });
    }
  }

  mancha(x, y, r) {
    const m = this.add.image(x, y, 'rc-huella').setDepth(4).setAlpha(0.5).setScale(Math.max(0.5, r / 38));
    this.tweens.add({ targets: m, alpha: 0, duration: 1600, onComplete: () => m.destroy() });
  }

  flotante(x, y, str, color, tam = 22) {
    const t = texto(this, Phaser.Math.Clamp(x, REC.ax0 + 60, REC.ax1 - 60), Phaser.Math.Clamp(y, REC.ay0 + 30, REC.ay1 - 20), str, tam, color).setDepth(57);
    this.tweens.add({ targets: t, y: t.y - 34, alpha: 0, duration: 700, delay: 120, onComplete: () => t.destroy() });
  }

  sonar(clave, vol, hueco) {
    const ahora = this.time.now / 1000;
    if (ahora - (this.ultimoSonido[clave] || -9) < (hueco || 0.05)) return;
    this.ultimoSonido[clave] = ahora;
    sfx(this, clave, { volume: vol });
  }

  // ---------- Voces: una a la vez, con su voz y sin repetir ----------

  sacar(clave, lista) {
    if (!this.bolsas[clave] || !this.bolsas[clave].length) this.bolsas[clave] = Phaser.Utils.Array.Shuffle([...lista]);
    return this.bolsas[clave].pop();
  }

  decir(x, y, str, cola, ms = 1700, siempre = false, cli = null) {
    const ahora = this.time.now / 1000;
    if (!siempre && (ahora - this.ultimaVoz < 3.2 || (this.vozActual && this.vozActual.active))) return null;
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    this.ultimaVoz = ahora;
    let bx = x, by = y, c = cola || 'abajo';
    if (cli) {
      if (cli.lado === 'izq') { bx = cli.x + 170; by = cli.y - 10; c = 'izq'; }
      else if (cli.lado === 'der') { bx = cli.x - 170; by = cli.y - 10; c = 'der'; }
      else { bx = cli.x; by = cli.y - 150; c = 'abajo'; }
    }
    bx = Phaser.Math.Clamp(bx, REC.ax0 + 190, REC.ax1 - 190);
    by = Phaser.Math.Clamp(by, REC.ay0 + 60, REC.ay1 - 90);
    const b = bocadillo(this, bx, by, str, { tam: 24, ancho: 330, cola: c }).setDepth(90);
    // Que ningún bocadillo (con su cola) se salga del borde de la arena.
    const bb = b.getBounds();
    const dx = Math.max(0, REC.ax0 + 14 - bb.left) - Math.max(0, bb.right - (REC.ax1 - 14));
    const dy = Math.max(0, REC.ay0 + 14 - bb.top) - Math.max(0, bb.bottom - (REC.ay1 - 14));
    b.x += dx; b.y += dy;
    this.vozActual = b;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
    return b;
  }

  decirCliente(c, tipo, siempre) {
    const frase = this.sacar(`${tipo}-${c.id}`, REC_FRASES[tipo][c.id]);
    if (c.id === 'pompa' && tipo === 'toque') { this.time.delayedCall(1500, () => { if (!this._acabado) this.decir(c.x, c.y, frase, null, 1500, false, c); }); return; }
    this.decir(c.x, c.y, frase, null, 1700, siempre, c);
  }

  // Blancaso y Puky comentan desde fuera de la pantalla (bocadillo en un borde).
  vozLibre(quien, lista, clave, siempre = false) {
    if (this._acabado) return;
    const frase = this.sacar(`libre-${clave}`, lista);
    const x = quien === 'puky' ? REC.ax1 - 220 : REC.ax0 + 220;
    this.decir(x, REC.ay1 - 120, frase, quien === 'puky' ? 'der' : 'izq', 1700, siempre);
  }

  // ---------- Final ----------

  final() {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.input.setDefaultCursor('default');
    this.mira.setVisible(false);
    this.enemigos.forEach(e => { if (e.vivo) { e.vivo = false; this.puff(e.x, e.y, e.t.r * 2, 0xf5d23a); this.limpiarEnemigo(e); } });
    this.enemigos = [];
    this.balas.forEach(b => { if (b.vivo) this.quitarBala(b); });
    this.balas = [];
    this.barraJefe.setVisible(false);
    this.nombreJefe.setVisible(false);
    const umbrales = MISIONES.Recreativa.umbrales;
    const gana = this.puntos >= umbrales[0];
    const tres = gana && estrellasDe('Recreativa', this.puntos) === 3;
    // Las iniciales de la marca: las del cliente al que más has salvado.
    const orden = [...this.clientes].sort((a, b) => b.salvas - a.salvas);
    const firma = orden[0].salvas > 0 ? orden[0] : this.clientes[Math.floor(Math.random() * this.clientes.length)];
    const eraTop = this.top[0].pts;
    this.top.push({ ini: firma.ini, pts: this.puntos });
    this.top.sort((a, b) => b.pts - a.pts);
    this.top = this.top.slice(0, 5);
    const entra = this.top.some(e => e.pts === this.puntos && e.ini === firma.ini) && this.puntos > 0;
    ESTADO.topRecreativa = this.top.map(e => ({ ...e }));
    guardarPartida();
    this.pintarTop();
    if (typeof sumarStat === 'function' && this.kills > 0) sumarStat('amarillosApagados', this.kills);
    const olas = Math.max(0, this.ola - (this.cola && this.fase === 'ola' ? 1 : 0));
    let linea = `Oleada ${this.ola}, ${this.kills} amarillos apagados.`;
    if (this.puntos > eraTop) linea += ` ¡TOP nuevo! Firma ${firma.ini}.`;
    else if (entra) linea += ` Entras en el TOP: firma ${firma.ini}.`;
    else linea += ` Salvó más gente: ${firma.ini}.`;
    if (!gana) linea = `Oleada ${this.ola}. El amarillo ya llega al bar. ` + `${this.kills} apagados.`;
    else if (tres) linea += ' Nadie se atreve a tocar la máquina.';
    this.time.delayedCall(900, () => panelFinal(this, {
      titulo: gana ? (this.puntos > eraTop ? '¡NUEVO TOP!' : 'Fin de la partida') : 'GAME OVER',
      linea, puntos: this.puntos, clave: 'Recreativa', gana,
    }));
  }
}

// El recuerdo: el primer amarillo de Vuper (flashback jugable, cap. 12 «La señal amarilla»).
// Plataformas laterales, lentas y cortas. Empieza en el mundo normal (tonos fríos): Vuper cruza la fiesta,
// fuma y, de golpe, pasa al humo (tonos amarillos). Tiene que llegar a la luz de la salida mientras todo el
// mundo pasa de él. El mareo es una mecánica, no un castigo, y se ve en el propio mundo:
//   · el suelo ondula y se inclina la imagen (muy poco: ±2,8° como mucho), sube un tinte amarillo suave
//     y el ruido de la fiesta se va apagando (filtro paso-bajo), sin quitarte nunca el mando;
//   · los mandos tienen inercia y, a ratos, se invierten con aviso claro;
//   · la gente que baila, de espaldas, no te mira: te empuja sin querer;
//   · un hilo amarillo te persigue por el suelo; si te alcanza retrocedes un poco (nunca «game over»).
// Cada partida sortea 3 de 4 tipos de tramo (baile, ondas, mandos al revés, vasos) y su orden.
// Cierre: un palo con algodón entra en plano, la pantalla se aclara y Vuper dice una frase corta.

if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Recuerdo = 'iris';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.Recuerdo = ['vuper-aguanta', UNAKE.amarillo];
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Recuerdo = 'momento';

const RC = {
  suelo: 560,          // altura del suelo en pantalla (sin ondas)
  vMax: 175,           // px/s: lento a propósito
  acel: 330,
  roz: 230,
  grav: 1150,
  salto: 520,          // apex ≈ 117 px
  xCalada: 720,        // donde Vuper fuma (mundo normal)
  xHumo: 1000,         // donde empiezan los tramos
  tramo: 2150,         // largo medio de cada tramo
  altoBail: 222,       // altura de los bailarines de Gemini (la de Vuper en el mundo normal)
  radioBail: 78,       // dentro de esta distancia, el bailarín te arrastra con su vaivén
  maxAlcances: 10,     // al décimo, el recuerdo se nubla (se puede repetir)
  zoom: 1.07,          // margen para que la inclinación no enseñe bordes
  tipos: {
    baile: { amp: 10, sepBail: 340, vasos: 1, invs: 1, invDur: 3.2, pie: 'Nadie te mira.' },
    ondas: { amp: 34, sepBail: 620, vasos: 3, invs: 0, invDur: 0, pie: 'El suelo respira.' },
    reves: { amp: 14, sepBail: 560, vasos: 1, invs: 3, invDur: 4.2, pie: 'Izquierda, derecha… ¿cuál?' },
    vasos: { amp: 12, sepBail: 680, vasos: 7, invs: 1, invDur: 2.8, pie: 'Mesas, vasos, cojines.' },
  },
};

const FRASES_RECUERDO = {
  ambiente: ['(Hola… ¿hola?)', '(Nadie me ve.)', 'Vale, vale… vale…', '(El suelo ya no está donde lo dejé.)', '(Más despacio. Respira.)', '(Solo un rato. Solo un rato.)'],
  empujon: ['(Hola… ¿hola?)', '(Nadie me ve.)', 'Perdón… perdón…'],
  aviso: ['Vale, vale… vale…', '(¿Para qué lado era?)'],
  cierre: ['Dulce… el suelo ya es suelo.', 'Dulce. Y el suelo, quieto.', 'Azúcar… vale, vale… ya.'],
};

class Recuerdo extends Phaser.Scene {
  constructor() { super('Recuerdo'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la escena al volver a jugar.
    this.estado = 'normal';      // normal → calada → humo → cierre → fin
    this.fase = 'espera';        // espera → jugando → cierre → fin
    this.humo = false;
    this.tt = 0;
    this.t0 = 0;
    this.px = 130; this.vx = 0; this.ex = 0; this.h = 0; this.vy = 0;
    this.camX = 0;
    this.mareo = 0.02; this.bump = 0;
    this.hiloX = -9999; this.hiloPausa = 0;
    this.alcances = 0; this.empujones = 0; this.golpes = 0;
    this.limpios = 0;
    this.tramoAct = -1; this.tramoAlc = {};
    this.inmune = 0; this.cdEmpujon = 0; this.tosT = 0;
    this.inv = { activo: false, aviso: 0, fin: 0 };
    this.vozActual = null; this.vozT = 6;
    this.bolsas = {};
    this.btn = { izq: false, der: false };
    this.pieT = null;
    this.sentado = false; this.cierreFeliz = false; this.tiempo = 0; this.pose = '';
    this.ultimaFraseFinal = false;
    this.dif = 1 + 0.1 * Math.min((typeof nivelDe === 'function' ? nivelDe('Recuerdo') : 1) - 1, 8);

    this.texturas();
    this.armar();
    this.escenario();
    this.hud();
    this.mandos();
    this.sonido();
    this.camara(0);
    this.dibujar(0);

    this.teclas = this.input.keyboard.addKeys('LEFT,RIGHT,A,D');
    ['SPACE', 'UP', 'W'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.saltar()));
    this.events.once('shutdown', () => this.apagarSonido());

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 500, () => {
      if (this._acabado) return;
      this.fase = 'jugando';
      this.t0 = this.tt;
      this.pie(MOVIL ? 'Los botones de abajo te mueven.' : 'Flechas o A/D para andar · Espacio salta', 3600);
    });
  }

  // ---------- Dibujos con Graphics: bailarines de espaldas, vaso y cojín ----------

  texturas() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const t = HEX.tinta;
    const brazo = (x0, y0, x1, y1) => {
      g.lineStyle(24, t, 1).lineBetween(x0, y0, x1, y1);
      g.fillStyle(t, 1).fillCircle(x1, y1, 15);
      g.lineStyle(15, 0xffffff, 1).lineBetween(x0, y0, x1, y1);
      g.fillStyle(0xffffff, 1).fillCircle(x1, y1, 10);
    };
    for (let estilo = 0; estilo < 3; estilo++) {
      for (let f = 0; f < 2; f++) {
        const clave = `rc-bail-${estilo}${f}`;
        if (this.textures.exists(clave)) continue;
        g.clear();
        const s = f ? 7 : 0;
        // Piernas.
        g.fillStyle(t, 1).fillRect(32 - s, 146, 30, 92).fillRect(68 + s, 146, 30, 92);
        g.fillStyle(0xbdbdbd, 1).fillRect(36 - s, 150, 22, 84).fillRect(72 + s, 150, 22, 84);
        // Torso (de espaldas).
        g.fillStyle(t, 1).fillRoundedRect(28, 70, 74, 96, 16);
        g.fillStyle(0xffffff, 1).fillRoundedRect(33, 75, 64, 86, 12);
        g.fillStyle(0xd4d4d4, 1).fillRect(63, 80, 4, 74);
        // Cabeza: se ve la nuca.
        g.fillStyle(t, 1).fillCircle(65, 46, 29);
        g.fillStyle(0x9d9d9d, 1).fillCircle(65, 46, 24);
        if (estilo === 0) { g.fillStyle(t, 1).fillCircle(65, 18, 14); g.fillStyle(0x9d9d9d, 1).fillCircle(65, 18, 9); }
        if (estilo === 1) { g.fillStyle(t, 1).fillRoundedRect(38, 40, 54, 78, 18); g.fillStyle(0x8a8a8a, 1).fillRoundedRect(43, 45, 44, 68, 14); }
        if (estilo === 2) { g.fillStyle(t, 1).fillRect(34, 18, 62, 14).fillRect(40, 8, 50, 14); g.fillStyle(0xffffff, 1).fillRect(38, 21, 54, 8).fillRect(44, 11, 42, 10); }
        // Brazos: arriba o a medias.
        if (f === 0) { brazo(36, 86, 14, 28); brazo(94, 86, 116, 28); }
        else { brazo(36, 88, 12, 134); brazo(94, 88, 118, 50); }
        g.generateTexture(clave, 130, 240);
      }
    }
    if (!this.textures.exists('rc-vaso')) {
      g.clear();
      g.fillStyle(t, 1).fillPoints([{ x: 2, y: 2 }, { x: 58, y: 2 }, { x: 48, y: 68 }, { x: 12, y: 68 }], true);
      g.fillStyle(0xe8364f, 1).fillPoints([{ x: 8, y: 9 }, { x: 52, y: 9 }, { x: 44, y: 62 }, { x: 16, y: 62 }], true);
      g.fillStyle(0xffffff, 0.8).fillRect(14, 22, 32, 6);
      g.generateTexture('rc-vaso', 60, 70);
    }
    if (!this.textures.exists('rc-cojin')) {
      g.clear();
      g.fillStyle(t, 1).fillRoundedRect(0, 0, 124, 48, 20);
      g.fillStyle(0xd9a85e, 1).fillRoundedRect(6, 6, 112, 36, 15);
      g.fillStyle(0xf0c98a, 1).fillRoundedRect(14, 10, 70, 8, 4);
      g.fillStyle(t, 1).fillCircle(62, 24, 5);
      g.generateTexture('rc-cojin', 124, 48);
    }
    g.destroy();
  }

  // ---------- El recorrido: 3 de 4 tramos, sorteados ----------

  armar() {
    const orden = Phaser.Utils.Array.Shuffle(Object.keys(RC.tipos)).slice(0, 3);
    let x = RC.xHumo;
    this.tramos = orden.map((tipo, i) => {
      const len = RC.tramo + Phaser.Math.Between(-200, 200);
      const t = { tipo, i, x0: x, x1: x + len, ...RC.tipos[tipo] };
      x += len;
      return t;
    });
    this.xFin = x + 260;
    // Altura de las ondas por tramo (se interpola entre puntos).
    const pts = [{ x: 0, a: 0 }, { x: RC.xCalada, a: 0 }, { x: RC.xHumo, a: 8 }];
    this.tramos.forEach(t => { pts.push({ x: t.x0 + 260, a: t.amp }, { x: t.x1 - 260, a: t.amp }); });
    pts.push({ x: this.xFin - 240, a: 8 }, { x: this.xFin, a: 0 }, { x: this.xFin + 2000, a: 0 });
    this.ampPts = pts;

    // Bailarines, vasos y cojines (sin solaparse), y los avisos de mandos al revés.
    this.gente = [];
    this.obst = [];
    this.invEv = [];
    const libre = (x, d) => ![...this.gente.map(b => b.x0), ...this.obst.map(o => o.x)].some(o => Math.abs(o - x) < d);
    [{ x: 420, a: 36 }, { x: 860, a: 44 }].forEach(p => this.gente.push(this.nuevoBailarin(p.x, p.a)));
    this.tramos.forEach(t => {
      for (let x = t.x0 + 280 + Phaser.Math.Between(0, 120); x < t.x1 - 260; x += t.sepBail + Phaser.Math.Between(0, 110)) {
        this.gente.push(this.nuevoBailarin(x, Phaser.Math.Between(46, 62)));
      }
      let intentos = 0, puestos = 0;
      while (puestos < t.vasos && intentos++ < 60) {
        const x = Phaser.Math.Between(t.x0 + 300, t.x1 - 300);
        if (!libre(x, 230)) continue;
        this.obst.push({ x, tipo: Math.random() < 0.5 ? 'rc-vaso' : 'rc-cojin', tramo: t.i });
        puestos++;
      }
      for (let k = 0; k < t.invs; k++) {
        const f = t.invs === 1 ? Phaser.Math.FloatBetween(0.42, 0.62) : [0.2, 0.5, 0.78][k] + Phaser.Math.FloatBetween(-0.05, 0.05);
        this.invEv.push({ x: t.x0 + (t.x1 - t.x0) * f, dur: t.invDur * (1 + 0.1 * (this.dif - 1) * 3), hecho: false });
      }
    });
  }

  nuevoBailarin(x, amp) {
    const sp = this.siguienteBail();
    return {
      x0: x, x, amp, per: Phaser.Math.FloatBetween(2.1, 3.0), fase: Math.random() * 6.28,
      // sp: sprite de Gemini (obj-bailarin-1…3) o -1 si falta el arte (dibujo viejo con Graphics).
      sp, estilo: sp >= 0 ? sp : Phaser.Math.Between(0, 2), flip: Math.random() < 0.5, v: undefined,
      esc: Phaser.Math.FloatBetween(0.92, 1.08),
    };
  }

  // Baraja sin repetir de los tres bailarines de Gemini: no salen dos iguales seguidos.
  siguienteBail() {
    if (![1, 2, 3].every(i => this.textures.exists(`obj-bailarin-${i}`))) return -1;
    if (!this.barajaBail || !this.barajaBail.length) {
      const b = Phaser.Utils.Array.Shuffle([0, 1, 2]);
      if (b[b.length - 1] === this.ultimoBail) b.unshift(b.pop());  // el que se saca primero es el último de la lista
      this.barajaBail = b;
    }
    this.ultimoBail = this.barajaBail.pop();
    return this.ultimoBail;
  }

  // ---------- Escenario: capas dentro de un contenedor que se inclina y se mueve con la cámara ----------

  escenario() {
    this.rot = this.add.container(ANCHO / 2, ALTO / 2).setDepth(10);
    this.mundo = this.add.container(0, 0);
    this.rot.setScale(RC.zoom);
    // Techo de relleno por si la inclinación enseña el borde de arriba.
    this.rot.add(this.add.rectangle(0, -700, 3200, 800, 0xe4d5ae, 1));
    // Fondo en paralaje: la sala, recortada (sin el marco) y repetida en espejo para que empalme.
    this.fondos = [];
    for (let j = 0; j < 4; j++) {
      const im = this.add.image(0, 0, 'bg-recuerdo').setOrigin(0.5, 0.5);
      im.setCrop(34, 14, 1212, 560);
      const e = 1280 / 1212;
      im.setScale(e).setFlipX(j % 2 === 1);
      // La parte recortada acaba (abajo) en el suelo, a 600 de pantalla (240 respecto al centro).
      this.yFondo = 240 - (574 - im.height / 2) * e;
      this.rot.add(im);
      this.fondos.push(im);
    }
    this.rot.add(this.mundo);
    this.capaSuelo = this.add.container(0, 0);
    this.capaGente = this.add.container(0, 0);
    this.capaJug = this.add.container(0, 0);
    this.capaFrente = this.add.container(0, 0);
    this.mundo.add([this.capaSuelo, this.capaGente, this.capaJug, this.capaFrente]);
    this.gSuelo = this.add.graphics();
    this.gHilo = this.add.graphics();
    this.capaSuelo.add([this.gSuelo, this.gHilo]);
    // La luz de la salida y la lona cerrada, al fondo.
    this.salida();
    // Gente.
    this.gente.forEach(b => {
      b.img = b.sp >= 0
        ? this.add.image(b.x, RC.suelo, `obj-bailarin-${b.sp + 1}`).setOrigin(0.5, 1).setScale(RC.altoBail / 420 * b.esc).setFlipX(b.flip)
        : this.add.image(b.x, RC.suelo, `rc-bail-${b.estilo}0`).setOrigin(0.5, 1).setScale(0.92).setFlipX(b.flip);
      this.capaGente.add(b.img);
    });
    this.obst.forEach(o => {
      o.img = this.add.image(o.x, RC.suelo + 6, o.tipo).setOrigin(0.5, 1);
      o.alto = o.img.height - 10; o.ancho = o.img.width;
      this.capaGente.add(o.img);
    });
    this.recolorear();
    // Vuper.
    this.jug = this.add.image(this.px, RC.suelo, 'vuper-normal').setOrigin(0.5, 1);
    this.capaJug.add(this.jug);
    this.pose = '';
    // El hilo amarillo: la cabeza es el charco.
    this.hiloCab = this.add.image(0, 0, 'fx-charco-amarillo').setOrigin(0.5, 0.78).setScale(0.44).setVisible(false);
    this.capaSuelo.add(this.hiloCab);
    // Tinte (frío en el mundo normal, amarillo en el humo) y destello de luz: en pantalla, sin tapar.
    this.velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO + 40, ALTO + 40, 0x5c86e0, 0.2).setDepth(40);
    this.luz = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO + 40, ALTO + 40, HEX.crema, 0).setDepth(41);
  }

  salida() {
    const X = this.xFin;
    const g = this.add.graphics();
    // Haz de luz.
    g.fillStyle(0xfff1c0, 0.22).fillPoints([{ x: X - 120, y: 0 }, { x: X + 50, y: 0 }, { x: X + 110, y: 700 }, { x: X - 190, y: 700 }], true);
    g.fillStyle(0xfff6d8, 0.3).fillPoints([{ x: X - 70, y: 0 }, { x: X + 10, y: 0 }, { x: X + 50, y: 700 }, { x: X - 120, y: 700 }], true);
    // Puerta con luz.
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(X - 112, 270, 164, 300, 14);
    g.fillStyle(0xfff6d8, 1).fillRoundedRect(X - 100, 282, 140, 288, 8);
    g.fillStyle(0xffe49a, 1).fillCircle(X - 30, 430, 74);
    g.fillStyle(0xfffbea, 1).fillCircle(X - 30, 430, 44);
    // Lona cerrada.
    g.fillStyle(HEX.tinta, 1).fillRect(X + 90, 230, 310, 340);
    g.fillStyle(0x6d5a3a, 1).fillRect(X + 98, 238, 294, 324);
    g.lineStyle(5, 0x4a3c26, 1);
    [150, 215, 280, 340].forEach(dx => g.lineBetween(X + 98 + dx - 90, 240, X + 98 + dx - 70, 560));
    g.fillStyle(0xd9a85e, 1).fillRect(X + 98, 232, 294, 12);
    this.mundo.addAt(g, 0);
    this.grSalida = g;
  }

  recolorear() {
    const frio = [0x6f86c4, 0x8a7fb8, 0x5f9fb4, 0x9a8ab0, 0x7692c8];
    const calido = [0x9a5a2a, 0xb07a2e, 0x7a4a2a, 0xc2902f, 0x8c5a35];
    const lista = this.humo ? calido : frio;
    // Los dibujos de Gemini ya traen su color: solo un tinte suave del tramo (frío de día, cálido en el humo).
    this.gente.forEach((b, i) => b.img.setTint(b.sp >= 0 ? (this.humo ? 0xffe2a0 : 0xc8d4f0) : lista[(i * 3 + b.estilo) % lista.length]));
    this.obst.forEach(o => { if (this.humo) o.img.setTint(0xffe2a0); else o.img.setTint(0xc8d4f0); });
  }

  // ---------- Interfaz: progreso arriba y mandos abajo (no se inclinan ni se mueven) ----------

  hud() {
    const D = 100;
    this.gBarra = this.add.graphics().setDepth(D);
    this.pieTxt = null;
    // Aviso de mandos invertidos.
    this.chip = this.add.container(ANCHO / 2, 78).setDepth(D + 5).setVisible(false);
    const fondoChip = this.add.graphics();
    fondoChip.fillStyle(HEX.tinta, 1).fillRoundedRect(-212, -30, 424, 64, 22);
    fondoChip.fillStyle(HEX.rosa, 1).fillRoundedRect(-216, -34, 424, 64, 22);
    fondoChip.lineStyle(5, HEX.tinta, 1).strokeRoundedRect(-216, -34, 424, 64, 22);
    fondoChip.fillStyle(HEX.crema, 1).fillTriangle(-198, -2, -172, -18, -172, 14).fillTriangle(198, -2, 172, -18, 172, 14);
    this.chipTxt = texto(this, 0, -2, 'MANDOS AL REVÉS', 30, COLOR.crema);
    this.chip.add([fondoChip, this.chipTxt]);
    this.pintarBarra();
  }

  pintarBarra() {
    const g = this.gBarra;
    g.clear();
    const x0 = 80, w = 330, y = 40;
    g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(x0 - 6, y - 12, w + 12, 24, 12);
    g.fillStyle(this.humo ? 0xffd23f : 0x8aa6f0, 1).fillRoundedRect(x0, y - 7, Math.max(8, w * this.progreso()), 14, 7);
    g.lineStyle(3, HEX.crema, 0.8);
    this.tramos.forEach(t => { const px = x0 + w * (t.x0 / this.xFin); g.lineBetween(px, y - 12, px, y + 12); });
    g.lineBetween(x0 + w, y - 12, x0 + w, y + 12);
  }

  progreso() { return Phaser.Math.Clamp(this.px / this.xFin, 0, 1); }

  mandos() {
    this.input.addPointer(2);
    const alto = MOVIL ? 124 : 104;
    const crear = (x, w, tipo) => {
      const c = this.add.container(x, ALTO - alto / 2 - 18).setDepth(120);
      const g = this.add.graphics();
      c.add(g);
      c.setSize(w, alto).setInteractive();
      c.g = g; c.w = w; c.h = alto; c.tipo = tipo;
      return c;
    };
    this.bIzq = crear(MOVIL ? 120 : 110, MOVIL ? 160 : 140, 'izq');
    this.bDer = crear(MOVIL ? 300 : 270, MOVIL ? 160 : 140, 'der');
    this.bSal = crear(ANCHO - (MOVIL ? 140 : 120), MOVIL ? 200 : 170, 'saltar');
    const poner = (b, v) => { if (b.tipo === 'izq') this.btn.izq = v; else if (b.tipo === 'der') this.btn.der = v; };
    [this.bIzq, this.bDer].forEach(b => {
      b.on('pointerdown', () => poner(b, true));
      ['pointerup', 'pointerout', 'pointerupoutside'].forEach(ev => b.on(ev, () => poner(b, false)));
    });
    this.bSal.on('pointerdown', () => this.saltar());
    this.pintarBotones();
    // En PC (sin dedo) los botones solo tapaban el suelo: se juega con el teclado.
    if (!MOVIL && !window.TACTIL_UI) [this.bIzq, this.bDer, this.bSal].forEach(b => b.setVisible(false).disableInteractive());
  }

  pintarBotones() {
    const col = this.inv.activo || this.inv.aviso > 0 ? HEX.rosa : HEX.crema;
    [this.bIzq, this.bDer, this.bSal].forEach(b => {
      const g = b.g;
      g.clear();
      g.fillStyle(HEX.tinta, 0.5).fillRoundedRect(-b.w / 2, -b.h / 2, b.w, b.h, 26);
      g.lineStyle(5, col, 0.85).strokeRoundedRect(-b.w / 2, -b.h / 2, b.w, b.h, 26);
      g.fillStyle(col, 0.9);
      if (b.tipo === 'izq') g.fillTriangle(-34, 0, 22, -34, 22, 34);
      else if (b.tipo === 'der') g.fillTriangle(34, 0, -22, -34, -22, 34);
      else g.fillTriangle(0, -36, -40, 24, 40, 24);
    });
  }

  // ---------- Sonido: el ruido de la fiesta se va apagando con el mareo (filtro paso-bajo) ----------

  sonido() {
    this.filtro = null;
    this.ruteados = [];
    try {
      if (this.cache.audio.exists('ambiente-bar')) {
        this.ambiente = this.sound.add('ambiente-bar', { loop: true, volume: 0.38 * (typeof volumenEfectos === 'function' ? volumenEfectos() : 1) });
        this.ambiente.play();
      }
      const ctx = this.sound.context;
      if (!ctx || !ctx.createBiquadFilter || !this.sound.destination) return;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 14000;
      f.Q.value = 0.6;
      f.connect(this.sound.destination);
      this.filtro = f;
      const meter = snd => {
        if (!snd) return;
        const nodo = snd.pannerNode || snd.volumeNode;
        if (!nodo) return;
        nodo.disconnect();
        nodo.connect(f);
        this.ruteados.push(nodo);
      };
      meter(this.ambiente);
      if (typeof Musica !== 'undefined' && Musica.actual) meter(Musica.actual.snd);
    } catch (e) { this.filtro = null; }
  }

  apagarSonido() {
    try {
      if (this.filtro) {
        this.ruteados.forEach(n => { try { n.disconnect(); n.connect(this.sound.destination); } catch (e) { /* el sonido ya no existe */ } });
        this.filtro.disconnect();
      }
      if (this.ambiente) { this.ambiente.stop(); this.ambiente.destroy(); }
    } catch (e) { /* nada */ }
    this.filtro = null;
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.tt += dt;
    if (this.fase === 'jugando') {
      this.fisica(dt);
      if (this.humo) { this.hilo(dt); }
      this.eventos(dt);
    } else if (this.fase === 'cierre') {
      this.vx *= Math.exp(-4 * dt);
      this.px += this.vx * dt;
    }
    // Mareo: sube con el recorrido (en el humo) y se aclara al cerrar.
    const prog = Phaser.Math.Clamp((this.px - RC.xHumo) / (this.xFin - RC.xHumo), 0, 1);
    const base = this.fase === 'cierre' || this.fase === 'fin' ? 0 : this.humo ? 0.28 + 0.62 * prog : 0.02;
    this.mareo += (base + this.bump - this.mareo) * Math.min(1, dt * 1.6);
    this.bump = Math.max(0, this.bump - dt * 0.1);
    this.camara(dt);
    this.dibujar(dt);
    this.efectos(dt);
    this.voces(dt);
  }

  saltar() {
    if (this.fase !== 'jugando' || this.h > 0.5) return;
    this.vy = RC.salto;
    this.h = 1;
    sfx(this, 'fup', { volume: 0.3 });
  }

  sueloY(x, t) {
    return RC.suelo + this.ampEn(x) * (0.55 + 0.5 * this.mareo) * (0.7 * Math.sin(x / 200 + t * 0.85) + 0.3 * Math.sin(x / 90 - t * 1.25));
  }

  ampEn(x) {
    const p = this.ampPts;
    if (x <= p[0].x) return p[0].a;
    for (let i = 1; i < p.length; i++) {
      if (x <= p[i].x) return p[i - 1].a + (p[i].a - p[i - 1].a) * ((x - p[i - 1].x) / Math.max(1, p[i].x - p[i - 1].x));
    }
    return 0;
  }

  fisica(dt) {
    const k = this.teclas;
    let dir = (k.RIGHT.isDown || k.D.isDown || this.btn.der ? 1 : 0) - (k.LEFT.isDown || k.A.isDown || this.btn.izq ? 1 : 0);
    if (this.inv.activo) dir = -dir;
    const m = this.mareo;
    const pend = (this.sueloY(this.px + 6, this.tt) - this.sueloY(this.px - 6, this.tt)) / 12;
    const deriva = Math.sin(this.tt * 0.9 + 1.3) * m * 80 * this.dif;
    const aire = this.h > 0 ? 0.6 : 1;
    this.vx += (dir * RC.acel * (1 - 0.3 * m) * aire + deriva + pend * 240) * dt;
    if (!dir) {
      const f = RC.roz * (1 - 0.4 * m) * dt * (this.h > 0 ? 0.3 : 1);
      this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - Math.sign(this.vx) * f;
    }
    this.vx = Phaser.Math.Clamp(this.vx, -RC.vMax * 0.8, RC.vMax);
    this.px += (this.vx + this.ex) * dt;
    this.ex *= Math.exp(-5 * dt);
    this.px = Math.max(Math.max(70, this.camX + 120), this.px);
    // Salto flotante.
    if (this.h > 0) {
      this.h += this.vy * dt;
      this.vy -= RC.grav * dt;
      if (this.h <= 0) { this.h = 0; this.vy = 0; }
    }
    this.inmune = Math.max(0, this.inmune - dt);
    this.cdEmpujon = Math.max(0, this.cdEmpujon - dt);
    this.tosT = Math.max(0, this.tosT - dt);
    // La gente baila y no te mira: te empuja sin querer con su vaivén (se cruza con paciencia: ellos
    // están en el fondo de la pista y tú pasas por delante, pero te arrastran de lado).
    this.gente.forEach(b => {
      const w = 6.283 / b.per;
      const xAnt = b.x;
      b.x = b.x0 + Math.sin(this.tt * w + b.fase) * b.amp;
      const vb = (b.x - xAnt) / Math.max(dt, 0.001);
      b.v = b.v === undefined ? vb : b.v + (vb - b.v) * 0.3;
      const dx = this.px - b.x;
      if (Math.abs(dx) < RC.radioBail && this.h < 150) {
        const empuje = Phaser.Math.Clamp(b.v * 1.5, -250, 250);
        this.ex += (empuje - this.ex) * Math.min(1, dt * 10);
        if (Math.abs(empuje) > 70 && this.cdEmpujon <= 0) this.empujon();
      }
    });
    // Vasos y cojines: se saltan; si no, rebotas.
    this.obst.forEach(o => {
      const dx = this.px - o.x;
      const r = o.ancho / 2 + 36;
      if (Math.abs(dx) < r && this.h < o.alto - 6 && this.inmune <= 0) {
        const lado = dx >= 0 ? 1 : -1;
        this.px = o.x + lado * r;
        this.vx = 0;
        this.ex = lado * 200;
        this.inmune = 0.6;
        this.golpes++;
        this.bump = Math.min(0.2, this.bump + 0.04);
        this.tosT = 0.8;
        sfx(this, 'bonk', { volume: 0.25 });
        this.tweens.add({ targets: o.img, angle: lado * -14, duration: 120, yoyo: true });
      }
    });
    if (this.estado === 'normal' && this.px >= RC.xCalada) this.fumar();
    // Llegada.
    if (this.px >= this.xFin - 40) this.cierre();
  }

  empujon() {
    this.cdEmpujon = 0.7;
    this.empujones++;
    this.bump = Math.min(0.2, this.bump + 0.03);
    this.tosT = 0.6;
    sfx(this, 'bonk', { volume: 0.22 });
    this.hablar('empujon', 0.55);
  }

  // ---------- El hilo amarillo ----------

  hilo(dt) {
    const i = Math.max(0, this.tramos.findIndex(t => this.px < t.x1));
    const v = (58 + 12 * i) * this.dif;
    if (this.hiloX < -9000) this.hiloX = this.px - 480;
    this.hiloPausa = Math.max(0, this.hiloPausa - dt);
    const gap = this.px - this.hiloX;
    if (this.hiloPausa <= 0) this.hiloX += v * (gap > 640 ? 1.7 : 1) * dt;
    if (this.hiloX + 54 >= this.px - 34) this.alcance();
  }

  alcance() {
    this.alcances++;
    this.tramoAlc[Math.max(0, this.tramos.findIndex(t => this.px < t.x1))] = true;
    this.ex = -300;
    this.vx = 0;
    this.hiloX = this.px - 520;
    this.hiloPausa = 1.4;
    this.bump = Math.min(0.2, this.bump + 0.08);
    this.tosT = 1;
    sfx(this, 'goteo', { volume: 0.5 });
    golpeTexto(this, 640, 150, '¡El amarillo!', COLOR.amarillo, 40);
    if (this.alcances >= RC.maxAlcances) this.nublar();
  }

  // ---------- Mandos invertidos: aviso claro, 1,4 s antes ----------

  eventos(dt) {
    const i = this.inv;
    if (!i.activo && i.aviso <= 0) {
      const ev = this.invEv.find(e => !e.hecho && this.px >= e.x && this.humo);
      if (ev) { ev.hecho = true; i.dur = ev.dur; this.avisarInversion(); }
    } else if (i.aviso > 0) {
      i.aviso -= dt;
      if (i.aviso <= 0) this.activarInversion();
    } else if (i.activo) {
      i.fin -= dt;
      if (i.fin <= 0) this.terminarInversion();
    }
    // Tramo nuevo: cartel pequeño.
    const tr = this.tramos.findIndex(t => this.px >= t.x0 && this.px < t.x1);
    if (tr >= 0 && tr !== this.tramoAct && this.humo) {
      this.tramoAct = tr;
      this.pie(this.tramos[tr].pie, 2400);
    }
    // Último tramo: la luz.
    if (!this.ultimaFraseFinal && this.px > this.xFin - 700) {
      this.ultimaFraseFinal = true;
      this.decir('(Allí. La luz de la salida.)', 2200, true);
    }
    // Racha de tramos sin que el hilo te toque.
    this.limpios = this.tramos.filter((t, k) => this.px >= t.x1 && !this.tramoAlc[k]).length;
  }

  avisarInversion() {
    this.inv.aviso = 1.4;
    sfx(this, 'neon', { volume: 0.4 });
    this.chip.setVisible(true).setPosition(ANCHO / 2, 78).setScale(1).setAlpha(1);
    this.chipTxt.setText('¡MANDOS AL REVÉS!');
    this.tweens.killTweensOf(this.chip);
    this.tweens.add({ targets: this.chip, alpha: 0.35, duration: 180, yoyo: true, repeat: 3 });
    this.pintarBotones();
    this.emote('mareo');
    this.decir(this.sacar('aviso', FRASES_RECUERDO.aviso), 1500, true);
  }

  activarInversion() {
    this.inv.activo = true;
    this.inv.fin = this.inv.dur;
    this.chip.setAlpha(1);
    this.chipTxt.setText('AL REVÉS');
    this.tweens.add({ targets: this.chip, x: ANCHO - 190, y: 44, scale: 0.62, duration: 320, ease: 'Sine.inOut' });
    this.pintarBotones();
  }

  terminarInversion() {
    this.inv.activo = false;
    this.inv.aviso = 0;
    this.tweens.killTweensOf(this.chip);
    this.tweens.add({ targets: this.chip, alpha: 0, duration: 260, onComplete: () => this.chip.setVisible(false) });
    sfx(this, 'fiu', { volume: 0.25 });
    this.pintarBotones();
  }

  emote(tipo) {
    if (typeof Comic === 'undefined' || !Comic.emote) return;
    try { const p = this.pantalla(); Comic.emote(this, p.x + 50, p.y - 150, tipo, { profundidad: 90 }); } catch (e) { /* nada */ }
  }

  // ---------- Cámara y dibujo ----------

  camara(dt) {
    const max = this.xFin + 500 - ANCHO;
    const objetivo = Phaser.Math.Clamp(this.px - 400, 0, max);
    this.camX += (objetivo - this.camX) * Math.min(1, dt * 5);
    if (dt === 0) this.camX = objetivo;
  }

  // Posición de Vuper en pantalla (aprox., para bocadillos y efectos).
  pantalla() {
    const alto = this.jug ? this.jug.displayHeight : 120;
    return { x: ANCHO / 2 + (this.px - this.camX - ANCHO / 2) * RC.zoom, y: ALTO / 2 + (this.jug.y - ALTO / 2) * RC.zoom, alto: alto * RC.zoom };
  }

  dibujar(dt) {
    const m = this.mareo;
    // Inclinación suave y vaivén: tope de ±2,8° con el mareo al máximo.
    const ang = (Math.sin(this.tt * 0.42) * 2.2 + Math.sin(this.tt * 0.93 + 1) * 0.6) * m;
    this.rot.setRotation(Phaser.Math.DegToRad(ang));
    this.rot.setPosition(ANCHO / 2, ALTO / 2 + Math.sin(this.tt * 0.7) * m * 4);
    this.mundo.setPosition(-ANCHO / 2 - this.camX, -ALTO / 2);
    // Fondo en paralaje.
    const off = (this.camX * 0.45) % 2560;
    this.fondos.forEach((im, j) => im.setPosition(-off + j * 1280, this.yFondo));
    // Suelo ondulado y de parqué.
    const xa = this.camX - 140, xb = this.camX + ANCHO + 140;
    const pts = [];
    for (let x = xa; x <= xb; x += 20) pts.push({ x, y: this.sueloY(x, this.tt) });
    const g = this.gSuelo;
    g.clear();
    g.fillStyle(0x8b5a2b, 1).fillPoints([...pts, { x: xb, y: 900 }, { x: xa, y: 900 }], true);
    g.fillStyle(0xa56f38, 1).fillPoints([...pts, ...pts.slice().reverse().map(p => ({ x: p.x, y: p.y + 34 }))], true);
    g.lineStyle(3, 0x6b4220, 1);
    for (let x = Math.floor(xa / 170) * 170; x < xb; x += 170) g.lineBetween(x, this.sueloY(x, this.tt) + 34, x - 36, 900);
    g.lineStyle(3, 0x6b4220, 0.8);
    for (let x = Math.floor(xa / 170) * 170 + 85; x < xb; x += 170) g.lineBetween(x, this.sueloY(x, this.tt) + 34, x + 30, 900);
    g.lineStyle(7, HEX.tinta, 1).strokePoints(pts, false);
    // Bailarines y obstáculos siguen el suelo.
    this.gente.forEach(b => {
      const baile = Math.abs(Math.sin(this.tt * 6.283 / b.per * 2 + b.fase));
      b.img.setPosition(b.x, this.sueloY(b.x, this.tt) + 4 - baile * 7);
      b.img.setAngle(Math.sin(this.tt * 6.283 / b.per + b.fase) * 4);
      const f = Math.sin(this.tt * 6.283 * 1.8 + b.fase) > 0 ? 1 : 0;
      if (b.sp >= 0) return;  // el sprite de Gemini solo se mece
      const clave = `rc-bail-${b.estilo}${f}`;
      if (b.img.texture.key !== clave) b.img.setTexture(clave);
    });
    this.obst.forEach(o => { if (!o.img.scene) return; o.img.y = this.sueloY(o.x, this.tt) + 6; });
    this.pintarJugador();
    this.pintarHilo();
    // Barra de recorrido (solo si cambia lo visible).
    const pr = Math.round(this.progreso() * 200);
    if (pr !== this._prAnt || this._humoAnt !== this.humo) { this._prAnt = pr; this._humoAnt = this.humo; this.pintarBarra(); }
  }

  pintarJugador() {
    const gy = this.sueloY(this.px, this.tt);
    const pend = (this.sueloY(this.px + 6, this.tt) - this.sueloY(this.px - 6, this.tt)) / 12;
    const mov = Math.min(1, Math.abs(this.vx) / RC.vMax);
    const j = this.jug;
    let tex, alto;
    if (!this.humo) {
      if (this.estado === 'calada') { tex = 'vn-fumando-calada'; alto = 222; }
      else if (Math.abs(this.vx) > 20 && this.h <= 0) { tex = 'vn-caminando'; alto = 222; }
      else { tex = 'vuper-normal'; alto = 222; }
    } else if (this.estado === 'cierre' && this.cierreFeliz) { tex = 'vuper-pasando'; alto = 114; }
    else if (this.tosT > 0) { tex = 'vuper-tos'; alto = 112; }
    else if (this.mareo > 0.55 || (this.hiloX > -9000 && this.px - this.hiloX < 230)) { tex = 'vuper-aguanta'; alto = 112; }
    else { tex = 'vuper'; alto = 112; }
    if (tex !== this.pose) { this.pose = tex; j.setTexture(tex); j.setScale(alto / j.height); this.escBase = j.scaleX; }
    const rebote = this.h <= 0 ? Math.abs(Math.sin(this.tt * 9)) * 6 * mov : 0;
    j.setPosition(this.px, gy - this.h - rebote);
    const sq = 1 + (this.h > 0 ? Math.min(0.08, this.vy / 6000) : 0.04 * Math.sin(this.tt * 9) * mov);
    j.setScale(this.escBase / sq, this.escBase * sq * (this.sentado ? 0.88 : 1));
    if (!this.humo) j.setFlipX(tex === 'vn-caminando' ? this.vx > 0 : false);
    else j.setAngle(Math.atan(pend) * 40 + this.vx * 0.05 + Math.sin(this.tt * 2.1) * this.mareo * 3);
    if (!this.humo) j.setAngle(0);
  }

  pintarHilo() {
    const g = this.gHilo;
    g.clear();
    const ver = this.humo && this.fase === 'jugando' && this.hiloX > -9000;
    this.hiloCab.setVisible(ver);
    if (!ver) return;
    const largo = 760, pasos = 20;
    for (let i = 0; i < pasos; i++) {
      const xa = this.hiloX - largo + (largo * i) / pasos;
      const xb = this.hiloX - largo + (largo * (i + 1)) / pasos;
      const a = (i + 1) / pasos;
      const ya = this.sueloY(xa, this.tt) + 10 + Math.sin(xa * 0.05 + this.tt * 6) * 5;
      const yb = this.sueloY(xb, this.tt) + 10 + Math.sin(xb * 0.05 + this.tt * 6) * 5;
      g.lineStyle(26 * (0.35 + 0.65 * a), HEX.tinta, a);
      g.lineBetween(xa, ya, xb, yb);
    }
    for (let i = 0; i < pasos; i++) {
      const xa = this.hiloX - largo + (largo * i) / pasos;
      const xb = this.hiloX - largo + (largo * (i + 1)) / pasos;
      const a = (i + 1) / pasos;
      const ya = this.sueloY(xa, this.tt) + 10 + Math.sin(xa * 0.05 + this.tt * 6) * 5;
      const yb = this.sueloY(xb, this.tt) + 10 + Math.sin(xb * 0.05 + this.tt * 6) * 5;
      g.lineStyle(14 * (0.35 + 0.65 * a), 0xffd628, Math.min(1, a * 1.3));
      g.lineBetween(xa, ya, xb, yb);
    }
    this.hiloCab.setPosition(this.hiloX, this.sueloY(this.hiloX, this.tt) + 16);
    this.hiloCab.setScale(0.44 + Math.sin(this.tt * 7) * 0.025, 0.44 - Math.sin(this.tt * 7) * 0.03);
    // Que la mancha no tape los mandos: se desvanece al entrar en la zona de los botones de la izquierda.
    const sx = this.hiloX - this.camX;
    const vis = Phaser.Math.Clamp((sx - 150) / 260, 0, 1);
    this.hiloCab.setAlpha(vis);
    g.setAlpha(Math.max(0.15, vis));
  }

  efectos(dt) {
    const m = this.mareo;
    // Tinte: frío en el mundo normal, amarillo que sube con el mareo en el humo.
    if (this.humo) this.velo.setFillStyle(0xffc928, Math.min(0.3, 0.3 * m));
    else this.velo.setFillStyle(0x5c86e0, 0.2);
    // Sonido amortiguado.
    if (this.filtro && this.sound.context) {
      const hz = 14000 * Math.pow(0.05, this.humo ? Math.min(1, m * 1.05) : 0);
      try { this.filtro.frequency.setTargetAtTime(hz, this.sound.context.currentTime, 0.15); } catch (e) { /* nada */ }
    }
  }

  // ---------- Mundo normal → humo ----------

  fumar() {
    this.estado = 'calada';
    sfx(this, 'calada', { volume: 0.6 });
    this.time.delayedCall(1300, () => this.alHumo());
  }

  alHumo() {
    if (this._acabado) return;
    this.humo = true;
    this.estado = 'humo';
    this.recolorear();
    sfx(this, 'whoosh', { volume: 0.5 });
    const p = this.pantalla();
    // Un estallido de humo alrededor de Vuper: se ve y se va, sin tapar el juego.
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 6.283 + Math.random();
      const puff = this.add.image(p.x, p.y - 60, 'fx-humo-puff').setDepth(60).setScale(0.2).setAlpha(0.9);
      this.tweens.add({ targets: puff, x: p.x + Math.cos(a) * 190, y: p.y - 60 + Math.sin(a) * 110, scale: 0.5 + Math.random() * 0.35, alpha: 0, duration: 800, ease: 'Sine.out', onComplete: () => puff.destroy() });
    }
    this.luz.setAlpha(0.45);
    this.tweens.add({ targets: this.luz, alpha: 0, duration: 650 });
    this.bump = 0.08;
    this.hiloX = this.px - 480;
    this.pie('Todo se ve del color de una yema.', 3200);
    this.decir('Vale… vale… vale…', 1600, true);
  }

  // ---------- Voces y letreros: uno a la vez ----------

  sacar(clave, lista) {
    if (!this.bolsas[clave] || !this.bolsas[clave].length) this.bolsas[clave] = Phaser.Utils.Array.Shuffle([...lista]);
    return this.bolsas[clave].pop();
  }

  hablar(clave, prob) {
    if (this.vozActual && this.vozActual.active) return;
    if (Math.random() > prob) return;
    this.decir(this.sacar(clave, FRASES_RECUERDO[clave]), 1700, false);
  }

  decir(str, ms = 1700, fuerza = false) {
    if (this.vozActual && this.vozActual.active) { if (!fuerza) return null; this.vozActual.destroy(); }
    const b = bocadillo(this, ANCHO / 2, 200, str, { tam: 26, ancho: 360, cola: 'abajo' }).setDepth(95);
    this.vozActual = b;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
    this.vozT = Phaser.Math.FloatBetween(7, 11);
    return b;
  }

  voces(dt) {
    const b = this.vozActual;
    if (b && b.active) {
      const p = this.pantalla();
      b.setPosition(Phaser.Math.Clamp(p.x, 210, ANCHO - 210), Math.max(150, p.y - p.alto - 50));
    }
    if (this.fase !== 'jugando' || !this.humo) return;
    this.vozT -= dt;
    if (this.vozT <= 0) {
      this.vozT = 3;
      if (!(b && b.active)) this.decir(this.sacar('ambiente', FRASES_RECUERDO.ambiente), 1800, false);
    }
  }

  pie(str, ms = 2400) {
    if (this.pieTxt && this.pieTxt.active) { this.tweens.killTweensOf(this.pieTxt); this.pieTxt.destroy(); }
    const t = texto(this, ANCHO / 2, ALTO - 150, str, 28, COLOR.crema, 900).setDepth(100).setAlpha(0);
    this.pieTxt = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 300, yoyo: true, hold: ms, onComplete: () => t.destroy() });
  }

  // ---------- Cierre: el dulce ----------

  cierre() {
    if (this.fase !== 'jugando') return;
    this.fase = 'cierre';
    this.estado = 'cierre';
    this.inv.activo = false; this.inv.aviso = 0;
    this.chip.setVisible(false);
    this.btn.izq = this.btn.der = false;
    this.pintarBotones();
    this.tiempo = this.tt - this.t0;
    this.sentado = true;
    this.tweens.add({ targets: [this.bIzq, this.bDer, this.bSal], alpha: 0, duration: 400 });
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    this.time.delayedCall(900, () => this.entraPalo());
  }

  entraPalo() {
    if (this._acabado) return;
    const desdeArriba = Math.random() < 0.5;
    const yS = this.sueloY(this.px, this.tt);
    const palo = this.add.container(this.camX + ANCHO + 120, yS - 90);
    const g = this.add.graphics();
    // Palo y algodón rosa (de lado: solo el palo que entra en plano; no se ve quién lo lleva).
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(-8, -10, 14, 190, 6);
    g.fillStyle(0xe8c48a, 1).fillRoundedRect(-4, -6, 6, 182, 3);
    g.fillStyle(HEX.tinta, 1).fillCircle(0, -30, 46).fillCircle(-34, -4, 30).fillCircle(32, -6, 32).fillCircle(0, 14, 32);
    g.fillStyle(0xfe78aa, 1).fillCircle(0, -30, 40).fillCircle(-34, -4, 24).fillCircle(32, -6, 26).fillCircle(0, 14, 26);
    g.fillStyle(0xffc3d9, 1).fillCircle(-12, -42, 14).fillCircle(20, -22, 10);
    palo.add(g);
    palo.setAngle(-70);
    if (desdeArriba) palo.setPosition(this.px + 320, yS - 520);
    this.capaFrente.add(palo);
    this.palo = palo;
    const dest = { x: this.px + 96, y: yS - 150 };
    sfx(this, 'whoosh', { volume: 0.25 });
    this.tweens.add({ targets: palo, x: dest.x, y: dest.y, angle: -24, duration: 1500, ease: 'Sine.out', onComplete: () => this.mordisco(palo, g) });
  }

  mordisco(palo, g) {
    if (this._acabado) return;
    this.cierreFeliz = true;
    this.tweens.add({ targets: palo, angle: -10, x: palo.x - 22, duration: 220, yoyo: true });
    this.time.delayedCall(260, () => {
      sfx(this, 'nam', { volume: 0.5 });
      this.tweens.add({ targets: g, scaleX: 0.82, scaleY: 0.82, duration: 200 });
    });
    this.sentado = false;
    this.tweens.add({ targets: this.luz, alpha: 0.22, duration: 1200, yoyo: true, hold: 500 });
    sfx(this, 'campanita', { volume: 0.3 });
    // El palo se va a saltitos, sin darse la vuelta.
    this.time.delayedCall(1200, () => {
      this.tweens.add({ targets: palo, x: palo.x + 720, duration: 2300, ease: 'Sine.in' });
      this.tweens.add({ targets: palo, y: palo.y - 30, duration: 230, yoyo: true, repeat: 4 });
    });
    this.time.delayedCall(1500, () => { if (!this._acabado) this.decir(this.sacar('cierre', FRASES_RECUERDO.cierre), 2600, true); });
    this.time.delayedCall(3900, () => this.terminar(true));
  }

  nublar() {
    if (this.fase !== 'jugando') return;
    this.fase = 'fin';
    this.tiempo = this.tt - this.t0;
    this.decir('Vale, vale… otra vez.', 1500, true);
    this.time.delayedCall(1100, () => this.terminar(false));
  }

  // ---------- Final ----------

  terminar(gana) {
    if (this._acabado) return;
    this._acabado = true;
    this.fase = 'fin';
    this.btn.izq = this.btn.der = false;
    [this.bIzq, this.bDer, this.bSal].forEach(b => b.setVisible(false));
    const t = this.tiempo || (this.tt - this.t0);
    const bonoTiempo = Math.round(Phaser.Math.Clamp((200 - t) / 100, 0, 1) * 300);
    const limpios = this.tramos.filter((_, k) => !this.tramoAlc[k]).length;
    const puntos = gana ? 400 + bonoTiempo + 100 * limpios : Math.round(this.progreso() * 300);
    let linea;
    if (!gana) linea = 'El recuerdo se te escapa entre el humo, como casi todo de aquella noche. Otra vez, con calma.';
    else {
      linea = this.alcances === 0 ? 'Nadie te miró en todo el camino, y el amarillo no te tocó ni una vez.' : `Nadie te miró en todo el camino. El amarillo te alcanzó ${this.alcances} ${this.alcances === 1 ? 'vez' : 'veces'}.`;
      linea += ' Al final, alguien te dejó algo dulce.';
    }
    this.time.delayedCall(gana ? 300 : 100, () => panelFinal(this, {
      titulo: gana ? 'El suelo vuelve a ser suelo' : 'El recuerdo se nubla',
      linea, puntos, clave: 'Recuerdo', gana,
    }));
  }
}

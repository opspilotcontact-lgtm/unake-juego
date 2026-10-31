// Por debajo de la puerta (cap. 5): Blancaso ha perdido la agenda por el desagüe y solo Puky cabe.
// Plataformas viscosas por las cañerías de Unaké, jugando como Puky:
//   ← → (o A D) reptar · ↓ (mantener) aplastarse para pasar por las rendijas ·
//   ESPACIO (mantener = más largo) saltar hecho bola · pegarse a una pared al tocarla y ↑ para trepar.
//   Móvil: palanca a la izquierda y dos botones a la derecha (ESTIRAR / APLASTAR).
// Hay 3 tramos seguidos: 1) rendijas anchas, 2) rejillas con goteo y charcos resbaladizos,
// 3) un pozo vertical que pide trepar, rendijas estrechas y una bomba que te arrastra.
// Cada gota de masa que pierdes (goteras, pozos) te deja más flaco; sin masa vuelves a la entrada del tramo.
// Se gana al llegar a la agenda; las estrellas dependen de las gotas, la masa y el tiempo que te sobre.

MISIONES.Rendija = {
  nombre: 'Por debajo de la puerta', sprite: 'puky', umbrales: [800, 1200, 1600],
  texto: 'La agenda de Blancaso se ha ido por el desagüe y solo Puky cabe. ↓ para aplastarte en las rendijas, ESPACIO (mantén) para saltar hecho bola, pégate a las paredes y trepa con ↑.',
};
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Rendija = 'minijuego';

const REND = {
  vel: 250,          // velocidad al reptar
  velApl: 135,       // velocidad aplastado
  grav: 1500,
  salto: [400, 800], // impulso mínimo y máximo (según el tiempo pulsado)
  carga: 0.42,       // segundos para cargar el salto entero
  w: 48, h: 44, hApl: 20,
  tiempo: 200,
  corriente: 110,    // lo que te arrastra la bomba de agua
};

const REND_FRASES_AZAR = [
  'Me gusta esta pared. Es húmeda. Es mía.',
  'Si me estiro mucho, se me escurren los ojos. Tranqui, los recojo.',
  'Más abajo, siempre más abajo. Es mi sitio favorito.',
  '¿Esto es una puerta? Pues yo paso por debajo.',
];

// Los tres tramos. Coordenadas del mundo (y hacia abajo). Cada sólido es un rectángulo {x, y, w, h}.
// Las rendijas son muros de techo a casi suelo: dejan 22-26 px, solo caben aplastado (20 px).
function rendTramos() {
  const R = (x, y, w, h) => ({ x, y, w, h });
  const gotasLinea = (x1, x2, y, paso) => { const o = []; for (let x = x1; x <= x2; x += paso) o.push([x, y]); return o; };

  // 1) Un túnel con rendijas anchas, una columna para trepar y dos pozos.
  const t1 = {
    W: 3400, H: 720, suelo: 620,
    sol: [R(0, 0, 3400, 140), R(0, 620, 900, 100), R(1030, 620, 1450, 100), R(2610, 620, 790, 100),
      R(1500, 140, 44, 456), R(2900, 140, 44, 456), R(1850, 520, 140, 100), R(2250, 380, 50, 240), R(2530, 592, 70, 22)],
    charcos: [], rejillas: [], bomba: null,
    gotas: [...gotasLinea(300, 800, 585, 100), [980, 500], [1020, 470], [1200, 585], [1280, 585], [1360, 585], [1440, 585],
      ...gotasLinea(1620, 1800, 585, 60), [1920, 470], [2275, 340], [2400, 520], [2565, 540], ...gotasLinea(2700, 2850, 585, 75), ...gotasLinea(3000, 3200, 585, 100)],
    checks: [[60, 620], [1100, 620], [1600, 620], [2690, 620]],
    salida: 3330,
  };

  // 2) Rejillas que gotean, charcos que resbalan y una rendija justo después del charco.
  const t2 = {
    W: 3800, H: 720, suelo: 620,
    sol: [R(0, 0, 3800, 140), R(0, 620, 1760, 100), R(1880, 620, 1920, 100),
      R(1300, 540, 120, 80), R(2820, 140, 44, 456), R(3250, 510, 150, 110)],
    charcos: [[850, 1250], [2300, 2700]],
    rejillas: [{ x: 600, per: 1.7, off: 0 }, { x: 1100, per: 1.5, off: 0.6 }, { x: 1550, per: 1.7, off: 0.3 }, { x: 2100, per: 1.6, off: 1.0 }, { x: 3050, per: 1.5, off: 0.2 }],
    bomba: null,
    gotas: [...gotasLinea(250, 560, 585, 80), [700, 585], [780, 585], [900, 560], [1000, 585], [1180, 585], [1360, 500], [1480, 585],
      [1700, 540], [1830, 480], [1870, 480], [2000, 585], [2200, 585], [2400, 585], [2550, 585], [2700, 585],
      ...gotasLinea(2940, 3100, 585, 60), [3320, 470], [3480, 585], [3600, 585]],
    checks: [[60, 620], [1640, 620], [1960, 620], [2970, 620]],
    salida: 3730,
  };

  // 3) Abajo, rendijas estrechas; luego un pozo vertical que se trepa; arriba, la bomba y la agenda.
  const t3 = {
    W: 3700, H: 1000, suelo: 900,
    sol: [R(0, 0, 1400, 700), R(0, 900, 380, 100), R(510, 900, 1190, 100), R(700, 700, 44, 176), R(1100, 700, 44, 176),
      R(1400, 0, 2300, 200), R(1700, 380, 2000, 620), R(1430, 640, 100, 22), R(3100, 200, 44, 156)],
    charcos: [],
    rejillas: [{ x: 260, per: 1.6, off: 0.4 }, { x: 900, per: 1.5, off: 0.9 }, { x: 2350, per: 1.5, off: 0.2 }, { x: 2650, per: 1.6, off: 0.9 }],
    bomba: { x: 2000, y: 200, w: 900, h: 180 },
    gotas: [...gotasLinea(150, 350, 865, 100), [460, 760], [500, 740], ...gotasLinea(600, 660, 865, 60), [820, 865], [900, 865], [980, 865],
      [1200, 865], [1280, 865], [1620, 600], [1665, 820], [1665, 740], [1665, 660], [1665, 580], [1665, 500], [1665, 430],
      ...gotasLinea(1800, 1950, 345, 75), ...gotasLinea(2100, 2800, 345, 140), [3000, 345], [3200, 345], [3320, 345]],
    checks: [[60, 900], [580, 900], [1250, 900], [1780, 380], [3200, 380]],
    salida: 3500, agenda: true,
  };
  return [t1, t2, t3];
}

class Rendija extends Phaser.Scene {
  constructor() { super('Rendija'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la instancia al volver a jugar.
    this.datos = datos;
    this.tramos = rendTramos();
    this.tramoN = 0;
    this.masa = 100;
    this.gotas = 0;
    this.gotasTramo = 0;
    this.tramosHechos = 0;
    this.retornos = 0;
    this.tiempo = REND.tiempo;
    this.jugando = false;
    this.fin = false;
    this.invul = 0;
    this.prevSalto = false;
    this.frasesUsadas = [];
    this.ultimaFrase = -99;
    this.rastroT = 0;
    this.bola = null;
    this.drops = [];
    this.nRastros = 0;
    this.salidaAbierta = false;

    fondo(this, this.textures.exists('bg-canerias') ? 'bg-canerias' : 'bg-dentro').setScrollFactor(0).setDepth(0);
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x10202a, 0.5).setScrollFactor(0).setDepth(1);

    this.capaMundo = this.add.graphics().setDepth(5);
    this.capaDin = this.add.graphics().setDepth(9);
    this.itemsGota = [];

    // Gota suelta: si no hay arte, se genera una.
    if (!this.textures.exists('gota-moco') && !this.textures.exists('rend-gota')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xc8e64a, 1).fillCircle(16, 20, 12).fillTriangle(16, 0, 7, 16, 25, 16);
      g.lineStyle(3, HEX.tinta, 1).strokeCircle(16, 20, 12);
      g.fillStyle(0xffffff, 0.8).fillCircle(11, 17, 3);
      g.generateTexture('rend-gota', 32, 36);
      g.destroy();
    }
    this.claveGota = this.textures.exists('gota-moco') ? 'gota-moco' : 'rend-gota';

    // Puky: cuerpo físico a mano (x centro, y pies).
    this.pk = { x: 0, y: 0, vx: 0, vy: 0, w: REND.w, h: REND.h, suelo: false, coyote: 0, pared: 0, aplastado: false, carga: 0, cargando: false, cara: 1, subiendo: false, angulo: 0 };
    this.sprite = this.add.image(0, 0, 'puky').setOrigin(0.5, 1).setDepth(20);
    this.res = { sx: 1, sy: 1, vsx: 0, vsy: 0 };

    // Bocadillo de Puky (uno solo, sigue a Puky).
    this.voz = this.add.container(0, 0).setDepth(40).setVisible(false);
    this.vozG = this.add.graphics();
    this.vozT = this.add.text(0, 0, '', { fontFamily: FUENTE, fontSize: `${MOVIL ? 26 : 22}px`, color: COLOR.tinta, align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5);
    this.voz.add([this.vozG, this.vozT]);
    this.vozHasta = 0;

    // HUD
    this.hudMasaFondo = this.add.rectangle(24, 34, 260, 24, 0x000000, 0.55).setOrigin(0, 0.5).setStrokeStyle(4, HEX.crema).setScrollFactor(0).setDepth(50);
    this.hudMasa = this.add.rectangle(26, 34, 256, 20, 0xc8e64a, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(51);
    this.hudMasaT = this.add.text(154, 34, 'masa', { fontFamily: FUENTE, fontSize: '16px', color: COLOR.tinta }).setOrigin(0.5).setScrollFactor(0).setDepth(52);
    this.hudGotas = texto(this, 120, 80, 'Gotas 0', 26, COLOR.amarillo).setScrollFactor(0).setDepth(50);
    this.hudTramo = texto(this, ANCHO / 2, 40, 'Tramo 1 de 3', 26, COLOR.crema).setScrollFactor(0).setDepth(50);
    this.hudTiempo = texto(this, ANCHO - 120, 40, '', 28, COLOR.crema).setScrollFactor(0).setDepth(50);
    this.hudPuntos = texto(this, ANCHO - 120, 82, '', 24, COLOR.amarillo).setScrollFactor(0).setDepth(50);

    // Mandos
    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE');
    this.input.addPointer(2);
    this.crearTactil();
    const pista = MOVIL
      ? 'Palanca · ESTIRAR (mantén) · APLASTAR'
      : '← → reptar · ↓ aplastarte en las rendijas · ESPACIO (mantén) salto largo · pégate a una pared y ↑ para trepar';
    this.pista = texto(this, ANCHO / 2, ALTO - 36, pista, 22, COLOR.crema, 1180).setScrollFactor(0).setDepth(50);
    this.tweens.add({ targets: this.pista, alpha: 0, delay: 9000, duration: 800 });

    this.cameras.main.setScroll(0, 0);
    this.cargarTramo(0);

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 500, () => {
      this.jugando = true;
      this.decir('¿Me llamabais?', 2400, true);
    });
  }

  // ---------- Tramos ----------

  cargarTramo(n) {
    this.tramoN = n;
    const T = this.tramos[n];
    this.T = T;
    this.drops.forEach(d => d.spr && d.spr.destroy());
    this.drops = [];
    this.itemsGota.forEach(o => o.img.destroy());
    this.itemsGota = T.gotas.map(([x, y], i) => {
      const img = this.add.image(x, y, this.claveGota).setDepth(8);
      img.setScale(34 / img.height);
      return { x, y, img, cogida: false, fase: i * 0.7 };
    });
    this.gotasTramo = 0;
    this.chequeo = 0;
    this.salidaAbierta = false;
    this.dibujarMundo();
    this.cameras.main.setBounds(0, 0, T.W, T.H);
    this.colocar(T.checks[0][0], T.checks[0][1]);
    this.cameras.main.startFollow(this.sprite, true, 0.12, 0.12, 0, 60);
    this.cameras.main.centerOn(this.pk.x + 200, this.pk.y - 60);
    this.hudTramo.setText(`Tramo ${n + 1} de ${this.tramos.length}`);
  }

  colocar(x, y) {
    const p = this.pk;
    p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.aplastado = false; p.h = REND.h; p.w = REND.w; p.carga = 0; p.cargando = false; p.pared = 0;
    this.invul = 1.2;
  }

  dibujarMundo() {
    const g = this.capaMundo;
    const T = this.T;
    g.clear();
    // Muros de cañería: relleno, junta, remaches y un reborde de moho en las caras de arriba.
    T.sol.forEach(s => {
      g.fillStyle(0x2b3a44, 1).fillRect(s.x, s.y, s.w, s.h);
      g.fillStyle(0x364a56, 1);
      for (let x = s.x + 120; x < s.x + s.w - 30; x += 160) g.fillRect(x, s.y, 10, s.h);
      g.fillStyle(0x45606e, 1).fillRect(s.x, s.y, s.w, Math.min(8, s.h));
      g.fillStyle(0x6f8b2c, 0.9).fillRect(s.x, s.y, s.w, Math.min(4, s.h));
      g.lineStyle(5, HEX.tinta, 1).strokeRect(s.x, s.y, s.w, s.h);
      g.fillStyle(0x8fa5b0, 1);
      for (let x = s.x + 24; x < s.x + s.w - 10; x += 80) { if (s.h > 30) g.fillCircle(x, s.y + 20, 4); }
    });
    // Charcos resbaladizos.
    T.charcos.forEach(([a, b]) => {
      g.fillStyle(0x8a56c4, 0.95).fillRoundedRect(a, T.suelo - 9, b - a, 11, 5);
      g.fillStyle(0xd9b6ff, 0.7).fillRect(a + 14, T.suelo - 7, Math.min(60, b - a - 28), 3);
      g.lineStyle(3, HEX.tinta, 1).strokeRoundedRect(a, T.suelo - 9, b - a, 11, 5);
    });
    // Rejillas del techo.
    const yTecho = this.alturaTecho();
    T.rejillas.forEach(r => {
      g.fillStyle(0x16222a, 1).fillRect(r.x - 30, yTecho, 60, 12);
      g.lineStyle(3, 0x8fa5b0, 1);
      for (let k = -18; k <= 18; k += 12) g.lineBetween(r.x + k, yTecho, r.x + k, yTecho + 12);
      g.lineStyle(4, HEX.tinta, 1).strokeRect(r.x - 30, yTecho, 60, 12);
    });
    // Salida del tramo (boca de tubo) o la agenda.
    const sx = T.salida;
    const sy = T.agenda ? 380 : T.suelo;
    if (!T.agenda) {
      g.fillStyle(0x0b1218, 1).fillRoundedRect(sx - 20, sy - 120, 100, 120, 14);
      g.lineStyle(6, 0x8fa5b0, 1).strokeRoundedRect(sx - 20, sy - 120, 100, 120, 14);
      g.fillStyle(0xffd23f, 1).fillTriangle(sx + 10, sy - 80, sx + 10, sy - 40, sx + 50, sy - 60);
    }
    this.dibujarCheckpoints();
    if (this.agendaObj) { this.agendaObj.destroy(); this.agendaObj = null; }
    if (T.agenda) {
      const c = this.add.container(sx, sy).setDepth(8);
      const a = this.add.graphics();
      a.fillStyle(HEX.tinta, 1).fillRoundedRect(-30, -62, 66, 62, 6);
      a.fillStyle(0xd7423a, 1).fillRoundedRect(-34, -66, 66, 62, 6);
      a.fillStyle(0xfff6e8, 1).fillRect(-26, -58, 8, 46);
      a.lineStyle(4, HEX.tinta, 1).strokeRoundedRect(-34, -66, 66, 62, 6);
      a.fillStyle(0xffd23f, 1).fillRect(-8, -48, 32, 6).fillRect(-8, -34, 32, 6);
      c.add(a);
      this.tweens.add({ targets: c, y: sy - 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.agendaObj = c;
    }
  }

  alturaTecho() {
    // Bajo del techo del pasillo por el que va el jugador en cada tramo.
    return this.tramoN === 2 ? 700 : 140;
  }

  dibujarCheckpoints() {
    const g = this.capaMundo;
    this.T.checks.forEach(([x, y], i) => {
      if (i === 0) return;
      const ok = i <= this.chequeo;
      g.fillStyle(ok ? 0xc8e64a : 0x55656f, 1).fillCircle(x, y - 70, 9);
      g.lineStyle(4, HEX.tinta, 1).strokeCircle(x, y - 70, 9).lineBetween(x, y - 61, x, y);
    });
  }

  // ---------- Mandos ----------

  crearTactil() {
    this.tactil = null;
    if (!MOVIL) return;
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(70);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35).fillCircle(170, ALTO - 140, 100).lineStyle(5, HEX.crema, 0.6).strokeCircle(170, ALTO - 140, 100);
    g.fillStyle(0x000000, 0.35).fillCircle(ANCHO - 120, ALTO - 150, 78).lineStyle(5, HEX.amarillo, 0.8).strokeCircle(ANCHO - 120, ALTO - 150, 78);
    g.fillStyle(0x000000, 0.35).fillCircle(ANCHO - 290, ALTO - 110, 62).lineStyle(5, HEX.verde, 0.8).strokeCircle(ANCHO - 290, ALTO - 110, 62);
    const t1 = texto(this, ANCHO - 120, ALTO - 150, 'ESTIRAR', 22, COLOR.amarillo);
    const t2 = texto(this, ANCHO - 290, ALTO - 110, 'APLASTAR', 18, COLOR.verde);
    this.knob = this.add.circle(170, ALTO - 140, 38, HEX.crema, 0.7).setStrokeStyle(4, HEX.tinta);
    c.add([g, t1, t2, this.knob]);
    this.tactil = c;
  }

  leer() {
    const k = this.teclas;
    const i = {
      izq: k.LEFT.isDown || k.A.isDown, der: k.RIGHT.isDown || k.D.isDown,
      arr: k.UP.isDown || k.W.isDown, aba: k.DOWN.isDown || k.S.isDown, salto: k.SPACE.isDown,
    };
    if (this.tactil) {
      let kx = 0, ky = 0;
      this.input.manager.pointers.forEach(p => {
        if (!p.isDown) return;
        if (p.x < ANCHO * 0.42) {
          const dx = p.x - 170, dy = p.y - (ALTO - 140);
          if (dx < -26) i.izq = true;
          if (dx > 26) i.der = true;
          if (dy < -34) i.arr = true;
          if (dy > 34) i.aba = true;
          const d = Math.min(Math.hypot(dx, dy), 70) / (Math.hypot(dx, dy) || 1);
          kx = dx * d; ky = dy * d;
        } else if (Phaser.Math.Distance.Between(p.x, p.y, ANCHO - 120, ALTO - 150) < 100) i.salto = true;
        else if (Phaser.Math.Distance.Between(p.x, p.y, ANCHO - 290, ALTO - 110) < 85) i.aba = true;
      });
      this.knob.setPosition(170 + kx, ALTO - 140 + ky);
      this.tactil.setVisible(!this.panelAbierto);
    }
    return i;
  }

  // ---------- Física a mano ----------

  choca(x, y, w, h) {
    const s = this.T.sol;
    const x0 = x - w / 2, y0 = y - h;
    for (let n = 0; n < s.length; n++) {
      const r = s[n];
      if (x0 < r.x + r.w && x0 + w > r.x && y0 < r.y + r.h && y0 + h > r.y) return r;
    }
    return null;
  }

  mover(eje, d) {
    const p = this.pk;
    if (eje === 'x') p.x += d; else p.y += d;
    const r = this.choca(p.x, p.y, p.w, p.h);
    if (!r) return false;
    if (eje === 'x') {
      p.x = d > 0 ? r.x - p.w / 2 - 0.01 : r.x + r.w + p.w / 2 + 0.01;
      p.vx = 0;
    } else if (d > 0) { p.y = r.y; p.vy = 0; p.suelo = true; }
    else { p.y = r.y + r.h + p.h; p.vy = 0; }
    return true;
  }

  update(t, ms) {
    if (!this.sys.isActive()) return;
    const dt = Math.min(ms, 33) / 1000;
    const i = this.leer();
    if (this.jugando && !this.fin) this.fisica(dt, i);
    else { this.prevSalto = i.salto; }
    this.dibujar(dt, t);
    this.actualizarHud();
  }

  fisica(dt, i) {
    const p = this.pk;
    this.tiempo -= dt;
    if (this.tiempo <= 0) { this.tiempo = 0; return this.terminar(false, 'tiempo'); }
    if (this.invul > 0) this.invul -= dt;

    const dir = (i.der ? 1 : 0) - (i.izq ? 1 : 0);
    if (dir) p.cara = dir;

    // Aplastarse (solo en suelo); levantarse solo si hay hueco encima.
    if (i.aba && p.suelo && !p.cargando) { if (!p.aplastado) { p.aplastado = true; p.h = REND.hApl; p.w = 64; sfx(this, 'fup', { volume: 0.25 }); } }
    else if (p.aplastado && (!i.aba || !p.suelo)) {
      if (!this.choca(p.x, p.y, REND.w, REND.h)) { p.aplastado = false; p.h = REND.h; p.w = REND.w; }
    }

    // Pared al lado: se pega si empujas hacia ella o pulsas ↑ / ↓.
    p.pared = 0;
    if (this.choca(p.x + p.w / 2 + 3, p.y - 4, 4, p.h - 8)) p.pared = 1;
    else if (this.choca(p.x - p.w / 2 - 3, p.y - 4, 4, p.h - 8)) p.pared = -1;
    const pegado = !!p.pared && !p.aplastado && (!p.suelo || i.arr) && (dir === p.pared || i.arr || (i.aba && !p.suelo));
    if (pegado && !this.estabaPegado) { sfx(this, 'blurp', { volume: 0.3 }); if (!this.dijoPared) { this.dijoPared = true; this.decir('¡Blurp!', 1400, true); } else if (this.ahora() - this.ultimaFrase > 7000 && Math.random() < 0.5) this.decirAzar(); }
    this.estabaPegado = pegado;
    p.subiendo = pegado;

    // Charco: casi sin agarre.
    const enCharco = p.suelo && this.T.charcos.some(([a, b]) => p.x > a && p.x < b);

    // Movimiento horizontal.
    let vmax = p.aplastado ? REND.velApl : REND.vel;
    if (p.cargando) vmax *= 0.35;
    const objetivo = dir * vmax;
    let acel = p.suelo ? (enCharco ? 170 : 2000) : 1000;
    if (!dir) acel = p.suelo ? (enCharco ? 60 : 2400) : 220;
    if (p.vx < objetivo) p.vx = Math.min(objetivo, p.vx + acel * dt);
    else if (p.vx > objetivo) p.vx = Math.max(objetivo, p.vx - acel * dt);

    // Salto hecho bola: se carga en el suelo y se suelta al levantar el dedo.
    if (p.suelo) p.coyote = 0.1; else p.coyote -= dt;
    if (i.salto && p.suelo && !p.aplastado) { p.cargando = true; p.carga = Math.min(REND.carga, p.carga + dt); }
    else if (p.cargando && !i.salto) {
      const f = p.carga / REND.carga;
      p.vy = -(REND.salto[0] + (REND.salto[1] - REND.salto[0]) * f);
      p.vx += p.cara * (50 + 130 * f);
      p.cargando = false; p.carga = 0; p.suelo = false; p.coyote = 0;
      this.res.vsy += 6; // se estira al despegar
      sfx(this, 'boing', { volume: 0.35 });
      if (f > 0.85 && this.ahora() - this.ultimaFrase > 6000 && Math.random() < 0.45) this.decir(REND_FRASES_AZAR[1], 2600);
    } else if (!p.suelo) { p.cargando = false; p.carga = 0; }
    // Salto desde la pared.
    const pulsa = i.salto && !this.prevSalto;
    if (pulsa && pegado && !p.suelo) {
      p.vy = -650; p.vx = -p.pared * 310; p.cara = -p.pared; p.pared = 0;
      sfx(this, 'boing', { volume: 0.3 });
    }
    this.prevSalto = i.salto;

    // Gravedad o agarre.
    if (pegado && !(pulsa)) {
      p.vy = i.arr ? -135 : (i.aba ? 190 : 0);
      if (p.vx * p.pared > 0) p.vx = 0;
    } else p.vy = Math.min(p.vy + REND.grav * dt, 1100);

    // Corriente de la bomba de agua: empuja hacia la izquierda.
    let arrastre = 0;
    const B = this.T.bomba;
    if (B && p.x > B.x && p.x < B.x + B.w && p.y - p.h / 2 > B.y && p.y - p.h / 2 < B.y + B.h) arrastre = -REND.corriente;

    const antesSuelo = p.suelo, antesVy = p.vy;
    p.suelo = false;
    // Pasos pequeños para no atravesar muros finos (las rendijas miden 44 px).
    const dx = (p.vx + arrastre) * dt, dy = p.vy * dt;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 8));
    for (let s = 0; s < n; s++) { this.mover('x', dx / n); this.mover('y', dy / n); }
    // Subir un borde: al acabarse la pared, un empujoncito para encaramarse.
    if (pegado && i.arr && !this.choca(p.x + p.pared * (p.w / 2 + 3), p.y - 4, 4, p.h - 8) && !p.suelo) { p.vx = p.pared * 140; p.vy = -170; }

    if (!antesSuelo && p.suelo && antesVy > 260) {
      this.res.vsy -= Math.min(6, antesVy / 220);
      sfx(this, 'chof', { volume: 0.25 });
      this.salpicar(p.x, p.y, 4);
    }

    // Rastro viscoso.
    this.rastroT -= dt;
    if (this.rastroT <= 0 && ((p.suelo && Math.abs(p.vx) > 40) || pegado)) { this.rastroT = 0.1; this.salpicar(p.x - p.cara * 10, p.y - (pegado ? 14 : 4), 1); }

    // Frase al colarse por una rendija.
    if (p.aplastado && this.choca(p.x, p.y - REND.hApl - 3, p.w, 6) && this.ahora() - this.ultimaFrase > 4000) this.decir('Con permiso… con permiso… ¡con permiso!', 2400, true);

    // Pozos.
    if (p.y > this.T.H + 160) return this.caer();

    this.goteras(dt);
    this.recoger();
    this.puntosDeControl();

    if (p.x > this.T.salida && Math.abs(p.y - (this.T.agenda ? 380 : this.T.suelo)) < 130) this.llegarSalida();
  }

  ahora() { return this.time.now; }

  salpicar(x, y, n) {
    for (let k = 0; k < n; k++) {
      if (this.nRastros > 36) return;
      this.nRastros++;
      const b = this.add.circle(x + Phaser.Math.Between(-6, 6), y, Phaser.Math.Between(3, 6), 0xc8e64a, 0.7).setDepth(6);
      this.tweens.add({ targets: b, alpha: 0, scale: 0.3, y: y + 4, duration: 900, onComplete: () => { b.destroy(); this.nRastros--; } });
    }
  }

  // Rejillas con goteo: la gota crece, cae y te empuja.
  goteras(dt) {
    const p = this.pk;
    const yTecho = this.alturaTecho() + 12;
    this.T.rejillas.forEach(r => {
      r.t = (r.t === undefined ? r.off : r.t) + dt;
      if (r.t >= r.per) {
        r.t -= r.per;
        this.drops.push({ x: r.x, y: yTecho, vy: 60 });
        if (Math.abs(r.x - p.x) < 500) sfx(this, 'goteo', { volume: 0.12 });
      }
    });
    for (let n = this.drops.length - 1; n >= 0; n--) {
      const d = this.drops[n];
      d.vy += 900 * dt; d.y += d.vy * dt;
      let muere = false;
      if (this.puntoEnSolido(d.x, d.y + 8)) muere = true;
      else if (this.invul <= 0 && Math.abs(d.x - p.x) < p.w / 2 + 8 && d.y > p.y - p.h - 6 && d.y < p.y + 4) {
        muere = true;
        this.herir(12, d.x < p.x ? 1 : -1);
      }
      if (muere) { this.salpicar(d.x, d.y, 2); this.drops.splice(n, 1); }
    }
  }

  puntoEnSolido(x, y) {
    return this.T.sol.some(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
  }

  herir(cuanto, lado) {
    const p = this.pk;
    this.masa = Math.max(0, this.masa - cuanto);
    this.invul = 1.1;
    p.vx = lado * 260; p.vy = -220; p.suelo = false;
    sfx(this, 'golpe', { volume: 0.3 });
    Comic.impacto(this, p.x, p.y - 40, { tam: 60, profundidad: 45 });
    this.cameras.main.shake(140, 0.006);
    if (this.masa <= 0) this.sinMasa();
  }

  caer() {
    const p = this.pk;
    sfx(this, 'chapoteo', { volume: 0.4 });
    this.cameras.main.shake(200, 0.008);
    this.masa = Math.max(0, this.masa - 20);
    if (this.masa <= 0) return this.sinMasa();
    const c = this.T.checks[this.chequeo];
    this.colocar(c[0], c[1]);
    this.decir(REND_FRASES_AZAR[2], 2400, true);
  }

  sinMasa() {
    this.retornos++;
    if (this.retornos >= 3) return this.terminar(false, 'masa');
    this.masa = 60;
    this.cargarTramo(this.tramoN);
    golpeTexto(this, ANCHO / 2, 300, `Sin masa… vuelves a la entrada (${this.retornos}/3)`, COLOR.rosa, 34).setScrollFactor(0);
  }

  recoger() {
    const p = this.pk;
    const cx = p.x, cy = p.y - p.h / 2;
    this.itemsGota.forEach(o => {
      if (o.cogida) return;
      if (Math.abs(o.x - cx) < p.w / 2 + 18 && Math.abs(o.y - cy) < p.h / 2 + 22) {
        o.cogida = true;
        this.gotas++; this.gotasTramo++;
        this.masa = Math.min(100, this.masa + 3);
        sfx(this, 'pop', { volume: 0.22, rate: 1 + Math.min(this.gotasTramo, 12) * 0.03 });
        this.tweens.add({ targets: o.img, scale: 0, alpha: 0, y: o.y - 24, duration: 220, onComplete: () => o.img.setVisible(false) });
      }
    });
  }

  puntosDeControl() {
    const c = this.T.checks;
    for (let n = this.chequeo + 1; n < c.length; n++) {
      if (this.pk.x >= c[n][0]) {
        this.chequeo = n;
        sfx(this, 'campanita', { volume: 0.25 });
        this.dibujarMundo();
        golpeTexto(this, ANCHO / 2, 160, 'Punto de control', COLOR.verde, 26).setScrollFactor(0);
      }
    }
  }

  llegarSalida() {
    if (this.fin || this.salidaCogida) return;
    if (this.T.agenda) return this.terminar(true);
    this.salidaCogida = true;
    this.tramosHechos++;
    sfx(this, 'campanita', { volume: 0.5 });
    Comic.confeti(this, { n: 10, profundidad: 990 });
    golpeTexto(this, ANCHO / 2, 300, `Tramo ${this.tramoN + 1} superado · +150`, COLOR.amarillo, 40).setScrollFactor(0);
    this.jugando = false;
    this.time.delayedCall(1100, () => {
      if (!this.sys.isActive()) return;
      this.salidaCogida = false;
      this.cargarTramo(this.tramoN + 1);
      this.jugando = true;
      this.decir(this.tramoN === 2 ? REND_FRASES_AZAR[2] : REND_FRASES_AZAR[3], 2400, true);
    });
  }

  // ---------- Frases ----------

  decirAzar() {
    const libres = REND_FRASES_AZAR.map((f, k) => k).filter(k => !this.frasesUsadas.includes(k));
    if (!libres.length) this.frasesUsadas = [];
    const k = Phaser.Utils.Array.GetRandom(libres.length ? libres : REND_FRASES_AZAR.map((f, n) => n));
    this.frasesUsadas.push(k);
    this.decir(REND_FRASES_AZAR[k], 2600);
  }

  decir(str, ms = 2400, forzar = false) {
    if (!forzar && this.ahora() - this.ultimaFrase < 3500) return;
    this.ultimaFrase = this.ahora();
    this.vozT.setText(str);
    const w = this.vozT.width + 34, h = this.vozT.height + 22;
    this.vozG.clear().fillStyle(0xffffff, 1).lineStyle(5, HEX.tinta, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 16).strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    this.vozG.fillTriangle(-12, h / 2 - 2, 12, h / 2 - 2, 0, h / 2 + 18).lineStyle(5, HEX.tinta, 1).lineBetween(-12, h / 2 - 2, 0, h / 2 + 18).lineBetween(12, h / 2 - 2, 0, h / 2 + 18);
    this.vozAlto = h / 2 + 22;
    this.voz.setVisible(true);
    this.vozHasta = this.ahora() + ms;
  }

  // ---------- Dibujo ----------

  dibujar(dt, t) {
    const p = this.pk, r = this.res, s = this.sprite;
    // Pose y blandura: un muelle amortiguado para sx/sy da la sensación de goma.
    let tex = 'puky', tsx = 1, tsy = 1, ang = 0;
    const hay = k => this.textures.exists(k);
    if (p.aplastado) { tex = hay('puky-repta') ? 'puky-repta' : 'puky'; tsx = 1.5; tsy = 0.42; }
    else if (p.subiendo) { tex = hay('puky-pared') ? 'puky-pared' : 'puky'; tsx = 0.85; tsy = 1.1; ang = p.pared * -8; }
    else if (p.cargando) { const f = p.carga / REND.carga; tex = hay('puky-salto') ? 'puky-salto' : 'puky'; tsx = 1 + 0.4 * f; tsy = 1 - 0.45 * f; }
    else if (!p.suelo) {
      const est = Math.min(Math.abs(p.vy) / 1400, 0.4);
      tex = p.vy < -120 && hay('puky-estirado') ? 'puky-estirado' : (hay('puky-salto') ? 'puky-salto' : 'puky');
      tsy = 1 + est; tsx = 1 - est * 0.6;
      this.bola = (this.bola || 0) + p.vx * dt * 0.01; ang = Math.sin(this.bola) * 14;
    } else if (Math.abs(p.vx) > 30) { tsy = 1 + Math.sin(t / 70) * 0.06; tsx = 1 - Math.sin(t / 70) * 0.05; }
    const k = 190 * dt;
    r.vsx += (tsx - r.sx) * 260 * dt; r.vsx *= Math.max(0, 1 - 9 * dt); r.sx += r.vsx * dt * 4;
    r.vsy += (tsy - r.sy) * 260 * dt; r.vsy *= Math.max(0, 1 - 9 * dt); r.sy += r.vsy * dt * 4;
    r.sx = Phaser.Math.Clamp(r.sx, 0.3, 2); r.sy = Phaser.Math.Clamp(r.sy, 0.3, 2);
    void k;
    s.setTexture(tex);
    const base = 62 / s.height;
    s.setScale(base * r.sx, base * r.sy).setPosition(p.x, p.y + 2).setAngle(ang);
    s.setFlipX(p.cara < 0);
    s.setAlpha(this.invul > 0 && Math.floor(t / 80) % 2 ? 0.4 : 1);

    // Gotas (flotan), goteras y bomba.
    this.itemsGota.forEach(o => { if (!o.cogida) o.img.y = o.y + Math.sin(t / 300 + o.fase) * 4; });
    const g = this.capaDin;
    g.clear();
    this.drops.forEach(d => { g.fillStyle(0x7fd4ff, 1).fillCircle(d.x, d.y, 7).fillTriangle(d.x, d.y - 18, d.x - 6, d.y - 3, d.x + 6, d.y - 3); g.lineStyle(3, HEX.tinta, 1).strokeCircle(d.x, d.y, 7); });
    const yTecho = this.alturaTecho() + 12;
    this.T.rejillas.forEach(rj => {
      const f = Math.min(1, (rj.t || 0) / rj.per);
      g.fillStyle(0x7fd4ff, 1).fillCircle(rj.x, yTecho + 3 + f * 5, 2 + f * 5);
    });
    const B = this.T.bomba;
    if (B) {
      for (let n = 0; n < 18; n++) {
        const fx = ((n * 137 - t * 0.25) % B.w + B.w) % B.w;
        const fy = B.y + 20 + ((n * 53) % (B.h - 40));
        g.fillStyle(0xa8e6ff, 0.45).fillCircle(B.x + fx, fy + Math.sin(t / 250 + n) * 5, 3 + (n % 3) * 2);
        g.lineStyle(3, 0xa8e6ff, 0.35).lineBetween(B.x + fx, fy, B.x + fx + 26, fy);
      }
    }

    // Bocadillo.
    if (this.voz.visible) {
      if (this.ahora() > this.vozHasta) this.voz.setVisible(false);
      else this.voz.setPosition(Phaser.Math.Clamp(p.x, this.cameras.main.scrollX + 190, this.cameras.main.scrollX + ANCHO - 190), p.y - 62 * r.sy - this.vozAlto - 14);
    }
  }

  actualizarHud() {
    this.hudMasa.width = 256 * (this.masa / 100);
    this.hudMasa.setFillStyle(this.masa > 50 ? 0xc8e64a : this.masa > 25 ? 0xffd23f : 0xff5a4f);
    this.hudMasaT.setText(`masa ${Math.round(this.masa)}`);
    this.hudGotas.setText(`Gotas ${this.gotas}`);
    this.hudTiempo.setText(`${Math.ceil(this.tiempo)} s`).setColor(this.tiempo < 30 ? COLOR.rosa : COLOR.crema);
    this.hudPuntos.setText(`${this.puntosActuales(false)} pts`);
  }

  // ---------- Final ----------

  puntosActuales(gana) {
    return this.tramosHechos * 150 + this.gotas * 10 + (gana ? 150 + Math.round(this.masa) * 2 + Math.round(this.tiempo) * 3 : 0);
  }

  // Para las pruebas y para cerrar la partida desde fuera.
  terminar(gana, motivo) {
    if (this.fin || this._acabado) return;
    this.fin = true;
    this._acabado = true;
    this.jugando = false;
    if (gana) this.tramosHechos++;
    const puntos = this.puntosActuales(false) + (gana ? Math.round(this.masa) * 2 + Math.round(this.tiempo) * 3 : 0);
    const p = this.pk;
    p.vx = 0;
    if (gana) {
      sfx(this, 'campanita', { volume: 0.6 });
      Comic.confeti(this, { n: 26 });
      this.decir('¡Colega, tu agenda huele a ti!', 2200, true);
      this.time.delayedCall(1700, () => this.decir('¡Lo he conseguido! …¿Puedo quedármela un ratito?', 2400, true));
    } else {
      sfx(this, 'oooh', { volume: 0.5 });
      this.decir(motivo === 'tiempo' ? 'Me he quedado dormido en la cañería…' : 'Me he desparramado. Tranqui, me recojo.', 2200, true);
    }
    this.time.delayedCall(gana ? 3400 : 1500, () => {
      if (!this.sys.isActive()) return;
      this.panelAbierto = true;
      panelFinal(this, {
        titulo: gana ? '¡Agenda recuperada!' : 'Puky se ha desparramado',
        linea: gana
          ? 'Puky vuelve por debajo de la puerta con la agenda de Blancaso. Huele a Puky. Mucho.'
          : (motivo === 'tiempo' ? 'La cañería es larga y Puky se ha entretenido con una pared que le caía simpática.' : 'Se ha quedado sin masa por el desagüe. Lo recogerán luego, o él solo.'),
        puntos, clave: 'Rendija', gana,
      });
    });
  }
}

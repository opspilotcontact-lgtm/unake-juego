// Tiro al pato de humo: la caseta de la feria vista desde el mostrador (primera persona).
// La mirilla sigue al ratón o al dedo (o flechas + Espacio). Tres filas de patos de humo a distintas
// profundidades: al fondo, más pequeños y rápidos, y valen más. Seis corchos por carga: hay que recargar
// (R o el botón). Los aciertos seguidos suben el multiplicador; el pato dorado vale mucho.
// Lo que NO es pato resta: Perico cruzando (repite que no es un pato y nadie le hace caso) y la Pompa
// flotando con los cascos (si le das, te contesta tarde). Tres rondas, cada vez más rápidas; el nivel
// del minijuego (nivelDe) acelera todo un poco más.

if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.TiroPato = 'estrella';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.TiroPato = ['perico-horror', UNAKE.amarillo];
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.TiroPato = 'minijuego';

const TP = {
  rondas: 3,
  duracion: 18,          // segundos por ronda
  cargador: 6,
  recarga: 0.85,         // segundos
  penal: 150,
  // Filas: 0 = fondo (pequeña, rápida, vale más), 2 = delante.
  filas: [
    { y: 262, esc: 0.5, vel: 250, puntos: 30, cada: 1.25, dir: 1, ola: 0x46307a },
    { y: 392, esc: 0.74, vel: 175, puntos: 20, cada: 1.35, dir: -1, ola: 0x5b3c9a },
    { y: 532, esc: 1.0, vel: 120, puntos: 10, cada: 1.7, dir: 1, ola: 0x6d47b3 },
  ],
  zona: { x0: 60, x1: 1220, y0: 110, y1: 590 },
};

const FRASES_FERIANTE = {
  inicio: ['¡Pasen y tiren! Seis corchos por carga.', 'Patos de humo, recién soplados.', 'Al que dé al dorado, premio. Más o menos.'],
  dorado: ['¡Ojo, que ese brilla!', '¡El dorado! ¡El dorado!', 'Ese lo soplé yo con cariño.'],
  oro: ['¡Toma ya!', '¡Puntería de feria!', 'Ese me dolió.'],
  fallos: ['Los patos son los blancos, eh.', 'Respira. Apunta. Luego tiras.', 'El corcho no vuelve solo.'],
  racha: ['¡Qué mano!', 'Me vas a dejar sin patos.', 'Eso ya es vicio.'],
  vacio: ['Recarga, que no muerden.', 'Sin corchos no hay tiro.'],
  perico: ['Eso no puntúa.', 'Ya te lo dijo. Dos veces.', 'El pájaro no entra en el premio.'],
  pompa: ['¡Esa no era un pato!', 'Uy. Esa no.', 'A la chica de los cascos no, hombre.'],
  ronda2: ['Ahora vienen con prisa.', 'Segunda ronda. Más rápido.'],
  ronda3: ['Última ronda: la dorada.', 'Última. Que se note.'],
};
const NOCHES_TP = [
  { id: 'normal', nombre: '' },
  { id: 'viento', nombre: 'Noche de viento: los patos se mecen' },
  { id: 'dorada', nombre: 'Noche dorada: más patos de oro' },
  { id: 'prisa', nombre: 'El feriante tiene prisa: rondas más cortas' },
];

class TiroPato extends Phaser.Scene {
  constructor() { super('TiroPato'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la escena al volver a jugar.
    this.activo = false;
    this.puntos = 0;
    this.ronda = 0;
    this.restante = 0;
    this.balas = TP.cargador;
    this.recargando = 0;
    this.racha = 0;
    this.mejorRacha = 0;
    this.fallosSeguidos = 0;
    this.disparos = 0;
    this.aciertos = 0;
    this.patos = 0;
    this.dorados = 0;
    this.malos = 0;
    this.dioPerico = 0;
    this.dioPompa = 0;
    this.objetivos = [];
    this.filaT = [0.2, 0.6, 0.3];
    this.intrusoT = 5;
    this.ultimaFrase = -9;
    this.vozActual = null;
    this.vozSigue = null;
    this.bolsas = {};
    this.avisoVacio = false;
    this.cooldown = 0;
    const nivel = typeof nivelDe === 'function' ? nivelDe('TiroPato') : 1;
    this.nivel = nivel;
    this.dif = 1 + 0.08 * Math.min(nivel - 1, 10);
    this.noche = Phaser.Utils.Array.GetRandom(NOCHES_TP);
    this.mira = { x: ANCHO / 2, y: 380 };

    this.texturas();
    this.escenario();
    this.hud();

    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D');
    this.input.keyboard.on('keydown-SPACE', () => this.disparar());
    this.input.keyboard.on('keydown-R', () => this.recargar());
    this.input.on('pointermove', p => { if (!MOVIL) this.ponerMira(p.x, p.y); });
    this.input.on('pointerdown', (p, sobre) => {
      if (sobre.length || !this.activo) return;
      this.disparar(p.x, p.y);
    });
    if (!MOVIL) this.input.setDefaultCursor('none');
    this.events.once('shutdown', () => this.input.setDefaultCursor('default'));

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 450, () => this.presentacion());
  }

  // ---------- Dibujos (Graphics): pato de humo, pato dorado, ola, corcho ----------

  texturas() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const t = HEX.tinta;
    const pato = (clave, cuerpo, sombra) => {
      if (this.textures.exists(clave)) return;
      g.clear();
      const bolas = [[56, 80, 32], [86, 74, 34], [110, 86, 24], [36, 88, 22], [100, 56, 16]];
      g.fillStyle(t, 1);
      bolas.forEach(([x, y, r]) => g.fillCircle(x, y, r + 6));
      g.fillCircle(112, 40, 28).fillTriangle(4, 60, 34, 70, 30, 100);
      g.fillTriangle(128, 32, 156, 44, 128, 54);
      g.fillRect(64, 100, 18, 30);
      g.fillStyle(0x8a5a2b, 1).fillRect(68, 104, 10, 26);
      g.fillStyle(cuerpo, 1);
      bolas.forEach(([x, y, r]) => g.fillCircle(x, y, r));
      g.fillCircle(112, 40, 22).fillTriangle(12, 66, 32, 74, 30, 92);
      g.fillStyle(sombra, 1).fillCircle(60, 96, 16).fillCircle(90, 94, 18);
      g.fillStyle(0xffffff, 0.7).fillCircle(78, 60, 8).fillCircle(104, 30, 5);
      g.fillStyle(0xff9a3b, 1).fillTriangle(132, 36, 150, 44, 132, 50);
      // Ojo a media asta: el pato está tranquilo.
      g.fillStyle(0xffffff, 1).fillCircle(118, 38, 8);
      g.fillStyle(t, 1).fillCircle(120, 40, 4);
      g.fillStyle(cuerpo, 1).fillRect(109, 29, 18, 8);
      g.lineStyle(3, t, 1).lineBetween(109, 37, 127, 37);
      // Ala.
      g.lineStyle(4, sombra, 1).beginPath().arc(70, 78, 16, 0.2, 2.6).strokePath();
      g.generateTexture(clave, 160, 132);
    };
    pato('tp-pato', 0xf1ecf8, 0xcbbfe0);
    pato('tp-pato-oro', 0xffd23f, 0xe09a1f);
    if (!this.textures.exists('tp-ola')) {
      g.clear();
      g.fillStyle(t, 1).fillRect(0, 22, 160, 46);
      for (let x = 0; x <= 160; x += 40) g.fillCircle(x + 20, 26, 24);
      g.fillStyle(0xffffff, 1).fillRect(0, 28, 160, 40);
      for (let x = 0; x <= 160; x += 40) g.fillCircle(x + 20, 26, 18);
      g.generateTexture('tp-ola', 160, 68);
    }
    if (!this.textures.exists('tp-corcho')) {
      g.clear();
      g.fillStyle(t, 1).fillPoints([{ x: 4, y: 0 }, { x: 40, y: 0 }, { x: 36, y: 58 }, { x: 8, y: 58 }], true);
      g.fillStyle(0xd9a85e, 1).fillPoints([{ x: 9, y: 5 }, { x: 35, y: 5 }, { x: 32, y: 53 }, { x: 12, y: 53 }], true);
      g.fillStyle(0xb5803a, 1).fillCircle(18, 20, 3).fillCircle(26, 34, 3).fillCircle(20, 44, 2.5);
      g.fillStyle(0xf0c98a, 1).fillRect(12, 8, 6, 40);
      g.generateTexture('tp-corcho', 44, 58);
    }
    g.destroy();
  }

  escenario() {
    const bg = this.textures.exists('bg-feria') ? 'bg-feria' : 'bg-plaza';
    fondo(this, bg);
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.5);
    // Las filas: patos detrás de su ola; cada ola tapa la fila de detrás.
    TP.filas.forEach((f, i) => {
      const d = 10 + i * 10;
      // Una sola fila de ondas, con su cresta en f.y; debajo, el listón de madera.
      const ts = 0.55 + i * 0.25;
      const ola = this.add.tileSprite(ANCHO / 2, f.y, ANCHO + 40, 68 * ts, 'tp-ola').setOrigin(0.5, 0).setTint(f.ola).setDepth(d + 3);
      ola.tileScaleX = ola.tileScaleY = ts;
      this.add.rectangle(ANCHO / 2, f.y + 68 * ts, ANCHO, 10 + 4 * i, 0x8a5a2b).setStrokeStyle(4, HEX.tinta).setDepth(d + 3);
      f.olaImg = ola;
    });
    // Toldo de rayas con bombillas.
    const g = this.add.graphics().setDepth(60);
    for (let x = 0, i = 0; x < ANCHO; x += 80, i++) {
      g.fillStyle(i % 2 ? HEX.crema : 0xe8364f, 1).fillRect(x, 0, 80, 84);
      g.fillCircle(x + 40, 84, 40);
    }
    g.lineStyle(6, HEX.tinta, 1);
    for (let x = 0; x < ANCHO; x += 80) g.beginPath().arc(x + 40, 84, 40, 0, Math.PI).strokePath();
    this.bombillas = [];
    for (let x = 40; x < ANCHO; x += 80) {
      const b = this.add.circle(x, 128, 9, HEX.amarillo).setStrokeStyle(3, HEX.tinta).setDepth(61);
      this.bombillas.push(b);
    }
    this.tweens.add({ targets: this.bombillas.filter((_, i) => i % 2), alpha: 0.35, duration: 380, yoyo: true, repeat: -1 });
    // Postes y mostrador.
    const p = this.add.graphics().setDepth(60);
    p.fillStyle(HEX.tinta, 1).fillRect(0, 0, 58, ALTO).fillRect(ANCHO - 58, 0, 58, ALTO);
    p.fillStyle(0x9a6232, 1).fillRect(6, 120, 44, ALTO).fillRect(ANCHO - 50, 120, 44, ALTO);
    p.fillStyle(HEX.tinta, 1).fillRect(0, 594, ANCHO, ALTO - 594);
    p.fillStyle(0xb0773c, 1).fillRect(0, 602, ANCHO, 24);
    p.fillStyle(0x8a5a2b, 1).fillRect(0, 630, ANCHO, ALTO - 630);
    p.lineStyle(3, 0x6b4220, 1);
    [660, 692].forEach(y => p.lineBetween(0, y, ANCHO, y));
    // El feriante, detrás del mostrador a la izquierda.
    this.feriante = this.add.image(150, 640, 'feriante').setOrigin(0.5, 1).setDepth(55);
    this.feriante.setScale(250 / this.feriante.height);
    this.escFeriante = this.feriante.scaleX;
    flotar(this, this.feriante, { amplitud: 4, periodo: 1900 });
    // La escopeta de corchos (vista desde atrás) y la mirilla.
    this.escopeta = this.add.container(ANCHO / 2, 790).setDepth(70);
    const e = this.add.graphics();
    e.fillStyle(HEX.tinta, 1).fillRoundedRect(-36, -150, 72, 190, 18).fillRect(-17, -300, 34, 170);
    e.fillStyle(0x7a4f2a, 1).fillRoundedRect(-30, -144, 60, 178, 14);
    e.fillStyle(0x4a4a58, 1).fillRect(-11, -294, 22, 160);
    e.fillStyle(0x6c6c7c, 1).fillRect(-11, -294, 6, 160);
    this.corchoPunta = this.add.image(0, -300, 'tp-corcho').setScale(0.55).setAngle(180);
    this.escopeta.add([e, this.corchoPunta]);
    this.miraG = this.add.container(this.mira.x, this.mira.y).setDepth(90);
    const r = MOVIL ? 46 : 36;
    const m = this.add.graphics();
    m.lineStyle(10, HEX.tinta, 1).strokeCircle(0, 0, r);
    m.lineStyle(5, HEX.rosa, 1).strokeCircle(0, 0, r);
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
      m.lineStyle(9, HEX.tinta, 1).lineBetween(dx * (r - 14), dy * (r - 14), dx * (r + 16), dy * (r + 16));
      m.lineStyle(4, HEX.crema, 1).lineBetween(dx * (r - 12), dy * (r - 12), dx * (r + 14), dy * (r + 14));
    });
    m.fillStyle(HEX.rosa, 1).fillCircle(0, 0, 5);
    this.miraG.add(m);
  }

  hud() {
    const D = 100;
    this.textoPuntos = texto(this, 170, 44, '0', 44, COLOR.amarillo).setDepth(D);
    this.textoRonda = texto(this, ANCHO / 2, 44, '', 36, COLOR.crema).setDepth(D);
    this.textoMult = texto(this, ANCHO - 170, 44, '', 44, COLOR.verde).setDepth(D);
    // Corchos sobre el mostrador.
    this.corchos = [];
    for (let i = 0; i < TP.cargador; i++) {
      const c = this.add.image((MOVIL ? 300 : 310) + i * (MOVIL ? 62 : 54), 664, 'tp-corcho').setDepth(D).setScale(MOVIL ? 1.35 : 1.05);
      this.corchos.push(c);
    }
    this.botonRecarga = boton(this, ANCHO - 170, 660, 'Recargar (R)', () => this.recargar(), { ancho: 270, alto: 96, tam: 28, color: HEX.amarillo }).setDepth(D);
    this.pintarCorchos();
  }

  presentacion() {
    const banda = this.add.rectangle(ANCHO / 2, 360, ANCHO, 230, HEX.tinta, 0.8).setDepth(199);
    const t1 = texto(this, ANCHO / 2, 300, 'TIRO AL PATO DE HUMO', 72, COLOR.amarillo).setDepth(200).setScale(0);
    const ayuda = MOVIL
      ? 'Toca donde quieras disparar · el botón recarga · solo a los patos'
      : 'Apunta con el ratón · clic o Espacio dispara · R recarga · solo a los patos';
    const t2 = texto(this, ANCHO / 2, 380, ayuda, 28, COLOR.crema, 1100).setDepth(200).setAlpha(0);
    const extra = [this.nivel > 1 ? `Nivel ${this.nivel}` : '', this.noche.nombre].filter(Boolean).join(' · ');
    const t3 = texto(this, ANCHO / 2, 436, extra, 24, COLOR.azul).setDepth(200).setAlpha(0);
    sfx(this, 'sting', { volume: 0.5 });
    this.tweens.add({ targets: t1, scale: 1, duration: 420, ease: 'Back.out' });
    this.tweens.add({ targets: [t2, t3], alpha: 1, duration: 400, delay: 300 });
    // El feriante habla cuando se va la cartela: antes su bocadillo se cruzaba con la línea de la noche especial.
    this.time.delayedCall(2750, () => this.feriantDice('inicio', true));
    this.time.delayedCall(2700, () => {
      [banda, t1, t2, t3].forEach(o => o.destroy());
      this.empezarRonda();
    });
  }

  empezarRonda() {
    if (this._acabado) return;
    this.ronda++;
    this.restante = TP.duracion * (this.noche.id === 'prisa' ? 0.8 : 1);
    this.balas = TP.cargador;
    this.recargando = 0;
    this.pintarCorchos();
    this.intrusoT = Phaser.Math.FloatBetween(3, 6);
    golpeTexto(this, ANCHO / 2, 300, `¡Ronda ${this.ronda}!`, COLOR.amarillo, 72).setDepth(200);
    sfx(this, 'tiroriro', { volume: 0.5 });
    this.activo = true;
  }

  finRonda() {
    this.activo = false;
    this.recargando = 0;
    // Lo que queda se va volando (los patos se deshacen; los intrusos siguen su camino).
    this.objetivos.forEach(o => {
      o.vivo = false;
      if (o.vozB) o.vozB.destroy();
      this.tweens.add({ targets: o.img, alpha: 0, y: o.img.y - 60, duration: 500, onComplete: () => o.img.destroy() });
    });
    this.objetivos = [];
    if (this.ronda >= TP.rondas) { this.time.delayedCall(700, () => this.final()); return; }
    this.time.delayedCall(500, () => this.feriantDice(this.ronda === 1 ? 'ronda2' : 'ronda3', true));
    this.time.delayedCall(2100, () => this.empezarRonda());
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.moverMiraTeclado(dt);
    this.apuntarEscopeta();
    if (this.vozSigue && this.vozSigue.c.active && this.vozSigue.o.img.active) {
      this.vozSigue.c.setPosition(Phaser.Math.Clamp(this.vozSigue.o.img.x, 220, ANCHO - 220), this.vozSigue.o.img.y - this.vozSigue.o.img.displayHeight - 30);
    }
    if (!this.activo) return;
    this.restante -= dt;
    this.cooldown -= dt;
    this.textoRonda.setText(`Ronda ${this.ronda}/${TP.rondas} · ${Math.max(0, Math.ceil(this.restante))}`);
    if (this.recargando > 0) {
      this.recargando -= dt;
      const llenos = Math.min(TP.cargador, Math.floor((1 - this.recargando / TP.recarga) * TP.cargador + 0.001));
      if (llenos > this.balas) { this.balas = llenos; this.pintarCorchos(); sfx(this, 'pop', { volume: 0.15 }); }
      if (this.recargando <= 0) { this.balas = TP.cargador; this.pintarCorchos(); }
    }
    this.generar(dt);
    this.mover(dt);
    if (this.restante <= 0) this.finRonda();
  }

  ponerMira(x, y) {
    this.mira.x = Phaser.Math.Clamp(x, TP.zona.x0, TP.zona.x1);
    this.mira.y = Phaser.Math.Clamp(y, TP.zona.y0, TP.zona.y1);
    this.miraG.setPosition(this.mira.x, this.mira.y);
  }

  moverMiraTeclado(dt) {
    const k = this.teclas;
    const dx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    const dy = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    if (dx || dy) this.ponerMira(this.mira.x + dx * 760 * dt, this.mira.y + dy * 760 * dt);
  }

  apuntarEscopeta() {
    const gx = ANCHO / 2 + (this.mira.x - ANCHO / 2) * 0.45;
    this.escopeta.x = gx;
    const ang = Math.atan2(this.mira.y - this.escopeta.y, this.mira.x - gx) + Math.PI / 2;
    this.escopeta.rotation = Phaser.Math.Angle.RotateTo(this.escopeta.rotation, ang, 0.35);
  }

  generar(dt) {
    const v = this.velocidad();
    TP.filas.forEach((f, i) => {
      this.filaT[i] -= dt;
      if (this.filaT[i] > 0) return;
      this.filaT[i] = (f.cada / v) * Phaser.Math.FloatBetween(0.75, 1.35);
      const oro = Math.random() < (this.noche.id === 'dorada' ? 0.16 : 0.06) + (this.ronda === 3 ? 0.06 : 0);
      this.nuevoPato(i, oro);
    });
    this.intrusoT -= dt;
    if (this.intrusoT <= 0) {
      this.intrusoT = Phaser.Math.FloatBetween(5.5, 8.5) / (1 + 0.12 * (this.nivel - 1) + 0.15 * (this.ronda - 1));
      this.intruso(this.sacar('intruso', ['perico', 'pompa']));
    }
  }

  velocidad() { return this.dif * (1 + 0.16 * (this.ronda - 1)); }

  nuevoPato(fila, oro) {
    const f = TP.filas[fila];
    const x = f.dir > 0 ? -70 : ANCHO + 70;
    // Asoma el cuerpo entero: la ola tapa solo el palo y la panza.
    const baseY = f.y + 132 * f.esc * 0.3;
    const img = this.add.image(x, baseY, oro ? 'tp-pato-oro' : 'tp-pato').setOrigin(0.5, 1).setDepth(11 + fila * 10);
    img.setScale(f.esc).setFlipX(f.dir < 0);
    const o = { tipo: oro ? 'oro' : 'pato', fila, img, vivo: true, vx: f.dir * f.vel * this.velocidad() * (oro ? 1.55 : 1), fase: Math.random() * 6, baseY };
    this.objetivos.push(o);
    if (oro) {
      this.tweens.add({ targets: img, alpha: 0.75, duration: 140, yoyo: true, repeat: -1 });
      if (this.patos + this.dorados > 0 || this.ronda > 1) this.feriantDice('dorado');
    }
  }

  intruso(tipo) {
    if (!this.activo) return;
    let o;
    if (tipo === 'perico') {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const y = Phaser.Math.Between(200, 470);
      const img = this.add.image(dir > 0 ? -120 : ANCHO + 120, y, 'perico-volando').setDepth(45);
      img.setScale(120 / img.height).setFlipX(dir < 0);
      o = { tipo: 'perico', img, vivo: true, vx: dir * 230 * this.dif, fase: 0, baseY: y, centro: true };
      this.tweens.add({ targets: img, scaleY: img.scaleY * 0.82, duration: 130, yoyo: true, repeat: -1 });
      sfx(this, 'pin-pin', { volume: 0.5 });
      // Lo repite. Nadie le cree.
      this.time.delayedCall(350, () => { if (o.vivo) this.vozDe(o, '¡Que no soy un pato!'); });
      this.time.delayedCall(1900, () => { if (o.vivo) this.vozDe(o, '¡Que NO soy un pato!'); });
      this.time.delayedCall(3200, () => { if (o.vivo && this.activo) this.decir(this.feriante.x + 170, 450, 'Ya, ya.', 'izq'); });
    } else {
      const x = Phaser.Math.Between(320, ANCHO - 320);
      const img = this.add.image(x, ALTO + 90, 'pompa').setDepth(45);
      img.setScale(150 / img.height);
      o = { tipo: 'pompa', img, vivo: true, vy: -70 * this.dif, fase: Math.random() * 6, baseX: x, centro: true };
    }
    this.objetivos.push(o);
  }

  mover(dt) {
    const tt = this.time.now / 1000;
    const viento = this.noche.id === 'viento' ? 3 : 1;
    this.objetivos = this.objetivos.filter(o => {
      if (!o.vivo) return false;
      const img = o.img;
      if (o.tipo === 'pompa') {
        img.y += o.vy * dt;
        img.x = o.baseX + Math.sin(tt * 1.1 + o.fase) * 70;
        img.setAngle(Math.sin(tt * 1.5 + o.fase) * 8);
        if (img.y < -120) {
          o.vivo = false;
          img.destroy();
          // Se va sin que nadie le haya preguntado nada, y saluda ahora.
          if (Math.random() < 0.4 && this.activo) this.decir(img.x, 190, '…Hola.', 'abajo', 1400);
          return false;
        }
        return true;
      }
      img.x += o.vx * dt;
      if (o.tipo === 'perico') img.y = o.baseY + Math.sin(tt * 4) * 26;
      else {
        img.y = o.baseY + Math.sin(tt * 5 + o.fase) * 4 * viento;
        img.setAngle(Math.sin(tt * 3 + o.fase) * 4 * viento);
      }
      if (img.x < -160 || img.x > ANCHO + 160) {
        o.vivo = false;
        if (o.vozB) o.vozB.destroy();
        img.destroy();
        return false;
      }
      return true;
    });
  }

  // ---------- Disparar ----------

  disparar(x, y) {
    if (!this.activo) return;
    if (x !== undefined) this.ponerMira(x, y);
    if (this.cooldown > 0) return;
    if (this.recargando > 0) return;
    if (this.balas <= 0) {
      sfx(this, 'bonk', { volume: 0.5 });
      this.tweens.add({ targets: this.botonRecarga, scale: 1.15, duration: 90, yoyo: true, repeat: 1 });
      if (!this.avisoVacio) { this.avisoVacio = true; this.feriantDice('vacio', true); }
      return;
    }
    this.cooldown = 0.12;
    this.balas--;
    this.disparos++;
    this.pintarCorchos();
    sfx(this, 'pop', { volume: 0.7 });
    // Retroceso de la escopeta y el corcho que sale volando.
    this.tweens.add({ targets: this.escopeta, y: 820, duration: 50, yoyo: true });
    const punta = this.escopeta.getWorldTransformMatrix().transformPoint(0, -300);
    const c = this.add.image(punta.x, punta.y, 'tp-corcho').setScale(0.5).setDepth(80);
    this.tweens.add({ targets: c, x: this.mira.x, y: this.mira.y, scale: 0.18, angle: 540, duration: 110, onComplete: () => c.destroy() });
    this.resolver(this.mira.x, this.mira.y);
    if (this.balas === 0) this.tweens.add({ targets: this.botonRecarga, scale: 1.1, duration: 220, yoyo: true, repeat: 2 });
  }

  resolver(x, y) {
    const tol = MOVIL ? 16 : 6;
    const tocados = this.objetivos.filter(o => {
      if (!o.vivo) return false;
      const img = o.img;
      const cy = o.centro ? img.y : img.y - img.displayHeight * 0.62;
      const ok = Math.abs(x - img.x) < img.displayWidth * 0.42 + tol && Math.abs(y - cy) < img.displayHeight * (o.centro ? 0.45 : 0.36) + tol;
      // Lo que queda por debajo de su ola está tapado.
      if (ok && o.fila !== undefined && y > TP.filas[o.fila].y + 8) return false;
      return ok;
    });
    if (!tocados.length) { this.fallo(x, y); return; }
    const o = tocados.sort((a, b) => b.img.depth - a.img.depth)[0];
    if (o.tipo === 'perico') this.darPerico(o);
    else if (o.tipo === 'pompa') this.darPompa(o);
    else this.acierto(o);
  }

  multiplicador() { return Math.min(4, 1 + Math.floor(this.racha / 5)); }

  acierto(o) {
    o.vivo = false;
    this.aciertos++;
    this.racha++;
    this.mejorRacha = Math.max(this.mejorRacha, this.racha);
    this.fallosSeguidos = 0;
    const oro = o.tipo === 'oro';
    if (oro) this.dorados++; else this.patos++;
    const base = oro ? 100 : TP.filas[o.fila].puntos;
    const mult = this.multiplicador();
    const gana = base * mult;
    this.sumar(gana);
    const img = o.img;
    const cx = img.x;
    const cy = img.y - img.displayHeight * 0.62;
    this.tweens.killTweensOf(img);
    // El pato se deshace en humo.
    this.tweens.add({ targets: img, scaleY: 0, angle: img.flipX ? 30 : -30, alpha: 0, duration: 260, ease: 'Back.in', onComplete: () => img.destroy() });
    const puff = this.add.image(cx, cy, 'fx-humo-puff').setDepth(img.depth + 1).setScale(0).setTint(oro ? 0xffe680 : 0xffffff);
    const e = (img.displayHeight * 1.1) / puff.height;
    this.tweens.add({ targets: puff, scale: e, alpha: 0, duration: 520, ease: 'Sine.out', onComplete: () => puff.destroy() });
    golpeTexto(this, cx, cy - 30, `+${gana}`, oro ? COLOR.amarillo : COLOR.crema, oro ? 60 : 40);
    if (oro) {
      sfx(this, 'platillo', { volume: 0.4 });
      if (typeof Comic !== 'undefined') Comic.impacto(this, cx, cy, { tam: 80, profundidad: 85 });
      this.cambiarFeriante(true);
      this.feriantDice('oro', true);
    } else sfx(this, Math.random() < 0.5 ? 'fup' : 'plop', { volume: 0.45 });
    const subeMult = this.racha % 5 === 0 && mult < 4;
    if (subeMult || mult !== this.multPintado) this.pintarMult(true);
    if (this.racha > 0 && this.racha % 10 === 0) {
      if (typeof Comic !== 'undefined') Comic.racha(this, this.racha, { y: 200 });
      this.feriantDice('racha');
      this.cambiarFeriante(true);
    }
  }

  fallo(x, y) {
    this.racha = 0;
    this.fallosSeguidos++;
    this.pintarMult();
    sfx(this, 'fiu', { volume: 0.35 });
    const p = this.add.circle(x, y, 8, HEX.crema, 0.9).setDepth(80);
    this.tweens.add({ targets: p, scale: 3, alpha: 0, duration: 300, onComplete: () => p.destroy() });
    if (this.fallosSeguidos === 3) this.feriantDice('fallos');
  }

  darPerico(o) {
    o.vivo = false;
    this.malos++;
    this.dioPerico++;
    this.racha = 0;
    this.pintarMult();
    this.sumar(-TP.penal);
    const img = o.img;
    this.tweens.killTweensOf(img);
    img.setTexture('perico-graznando');
    img.setScale(130 / img.height);
    sfx(this, 'pin-pin', { volume: 0.6 });
    sfx(this, 'golpe', { volume: 0.5 });
    this.cameras.main.shake(220, 0.01);
    golpeTexto(this, img.x, img.y - 70, `-${TP.penal}`, COLOR.rosa, 56);
    if (typeof Comic !== 'undefined') Comic.emote(this, img.x + 50, img.y - 70, 'mareo', { profundidad: 85 });
    this.vozDe(o, '¡Te lo dije! ¡Te lo dije!');
    this.tweens.add({ targets: img, y: ALTO + 160, angle: 540, duration: 1300, ease: 'Quad.in', delay: 350, onComplete: () => { img.destroy(); if (o.vozB) o.vozB.destroy(); } });
    this.time.delayedCall(1500, () => this.feriantDice('perico', true));
  }

  darPompa(o) {
    o.vivo = false;
    this.malos++;
    this.dioPompa++;
    this.racha = 0;
    this.pintarMult();
    this.sumar(-TP.penal);
    const img = o.img;
    this.tweens.killTweensOf(img);
    img.setTexture('pompa-plop').setAngle(0);
    img.setScale(170 / img.height);
    sfx(this, 'plop', { volume: 0.7 });
    sfx(this, 'oooh', { volume: 0.4 });
    golpeTexto(this, img.x, img.y - 90, `-${TP.penal}`, COLOR.rosa, 56);
    this.feriantDice('pompa', true);
    this.tweens.add({ targets: img, y: img.y + 40, alpha: 0, duration: 900, delay: 700, onComplete: () => img.destroy() });
    // Ella contesta. Tarde.
    const x = img.x;
    const y = img.y;
    this.time.delayedCall(2400, () => { if (!this._acabado) this.decir(x, Math.max(200, y - 60), '…No.', 'abajo', 1300); });
  }

  recargar() {
    if (!this.activo || this.recargando > 0 || this.balas >= TP.cargador) return;
    this.recargando = TP.recarga;
    this.balas = 0;
    this.pintarCorchos();
    sfx(this, 'zas', { volume: 0.4 });
    this.tweens.add({ targets: this.escopeta, y: 900, duration: 200, yoyo: true, hold: TP.recarga * 1000 - 400 });
  }

  sumar(n) {
    this.puntos = Math.max(0, this.puntos + n);
    this.textoPuntos.setText(String(this.puntos));
    this.tweens.add({ targets: this.textoPuntos, scale: n > 0 ? 1.25 : 0.8, duration: 90, yoyo: true });
    if (n < 0) this.textoPuntos.setColor(COLOR.rosa); else this.textoPuntos.setColor(COLOR.amarillo);
  }

  pintarCorchos() {
    this.corchos.forEach((c, i) => {
      const lleno = i < this.balas;
      c.setAlpha(1);
      if (lleno) c.clearTint(); else c.setTint(0x3a3048);
    });
    if (this.corchoPunta) this.corchoPunta.setVisible(this.balas > 0);
  }

  pintarMult(golpe) {
    const m = this.multiplicador();
    this.multPintado = m;
    this.textoMult.setText(m > 1 ? `x${m}` : this.racha > 0 ? `racha ${this.racha}` : '');
    this.textoMult.setColor(m >= 4 ? COLOR.rosa : m >= 2 ? COLOR.amarillo : COLOR.verde);
    if (golpe && m > 1) {
      this.textoMult.setScale(1.7);
      this.tweens.add({ targets: this.textoMult, scale: 1, duration: 260, ease: 'Back.out' });
      sfx(this, 'campanita', { volume: 0.35 });
    }
  }

  // ---------- Voces: una a la vez ----------

  sacar(clave, lista) {
    if (!this.bolsas[clave] || !this.bolsas[clave].length) this.bolsas[clave] = Phaser.Utils.Array.Shuffle([...lista]);
    return this.bolsas[clave].pop();
  }

  decir(x, y, str, cola = 'abajo', ms = 1600) {
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    const b = bocadillo(this, x, y, str, { tam: 26, ancho: 360, cola }).setDepth(95);
    this.vozActual = b;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
    return b;
  }

  vozDe(o, str) {
    const b = this.decir(Phaser.Math.Clamp(o.img.x, 220, ANCHO - 220), o.img.y - o.img.displayHeight - 30, str, 'abajo', 1300);
    o.vozB = b;
    this.vozSigue = { c: b, o };
  }

  feriantDice(tipo, siempre = false) {
    const ahora = this.time.now / 1000;
    // Una voz a la vez: lo que no corre prisa no interrumpe a quien está hablando.
    if (!siempre && (ahora - this.ultimaFrase < 3 || (this.vozActual && this.vozActual.active))) return;
    this.ultimaFrase = ahora;
    this.decir(this.feriante.x + 190, 420, this.sacar(tipo, FRASES_FERIANTE[tipo]), 'izq', 1900);
  }

  cambiarFeriante(contento) {
    if (!this.textures.exists('feriante-emocionado')) return;
    this.feriante.setTexture(contento ? 'feriante-emocionado' : 'feriante');
    this.feriante.setScale(250 / this.feriante.height);
    if (contento) this.time.delayedCall(1400, () => { if (this.feriante.active) this.cambiarFeriante(false); });
  }

  // ---------- Final ----------

  final() {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.input.setDefaultCursor('default');
    this.miraG.setVisible(false);
    this.objetivos.forEach(o => { o.vivo = false; if (o.img.active) o.img.destroy(); });
    this.objetivos = [];
    const punteria = this.disparos ? this.aciertos / this.disparos : 0;
    const bono = this.disparos >= 10 ? Math.round(punteria * 200) : 0;
    this.puntos = Math.max(0, this.puntos + bono);
    if (typeof sumarStat === 'function' && this.patos + this.dorados > 0) sumarStat('patosHumo', this.patos + this.dorados);
    const gana = this.puntos >= MISIONES.TiroPato.umbrales[0];
    const tres = gana && estrellasDe('TiroPato', this.puntos) === 3;
    if (gana) this.cambiarFeriante(true);
    let linea;
    if (tres) linea = `«¡Vuper, me has vaciado la caseta!» ${this.patos} patos, ${this.dorados} dorados y ${Math.round(punteria * 100)} % de puntería.`;
    else if (gana) linea = `${this.patos + this.dorados} patos de humo y ${Math.round(punteria * 100)} % de puntería. El peluche, «para otra noche».`;
    else linea = 'El feriante sopla otro pato y te lo deja delante. «Este, gratis. Por pena.»';
    if (this.dioPerico) linea += ' Perico sigue diciendo que no es un pato.';
    if (this.dioPompa) linea += ' La Pompa todavía está contestando.';
    if (bono) golpeTexto(this, ANCHO / 2, 300, `Puntería +${bono}`, COLOR.verde, 52).setDepth(200);
    this.time.delayedCall(1100, () => panelFinal(this, {
      titulo: gana ? '¡Caseta vaciada!' : 'Los patos se ríen',
      linea, puntos: this.puntos, clave: 'TiroPato', gana,
    }));
  }
}

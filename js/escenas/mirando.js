// Te están mirando: cruzar el barrio de noche sin que te pillen los ojos de El Mirón (vista lateral).
// Sigilo con ritmo: cada ojo tiene su compás (cerrado -> entreabierto -> abierto -> entreabierto) y se ve
// el párpado bajar. Te mueves cuando están cerrados; cuando miran, te quedas quieto o detrás de un cubo.
// Tres tramos por partida, sorteados entre cuatro tipos (con baraja que no repite entre partidas):
//   fila      ojos en farolas, ventanas y charcos con canon (cada uno abre un poco después del anterior)
//   barrido   un ojo grande, el de El Mirón, que barre el suelo como un foco: ahí ni quieto vale, hay que esconderse
//   dormidos  ojos cerrados que se despiertan con el ruido si andas seguido: hay que ir a ratos
//   lasslow   ojos a destiempo y, al fondo, Lasslow riéndose: El Mirón cree que es de él y mira hacia allí (ventana extra)
// Si te ven: teoría corta de El Mirón (baraja sin repetir) y vuelves al último escondite. Tres avistamientos y se acaba.
// Controles: flechas o A/D para andar; ratón o dedo: mantén pulsado hacia el lado al que vas y suelta para quedarte quieto.

if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Mirando = 'iris';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.Mirando = ['miron-alterado', UNAKE.rosa];
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Mirando = 'sigilo';

const MIR = {
  suelo: 612,        // y de los pies
  vel: 175,          // px/s
  meta: 1180,        // x de la meta de los tramos 1 y 2
  metaNeon: 1010,    // x de la meta del último tramo (el neón)
  vidas: 3,
  puntosTramo: 200,
  penal: 120,
  bonoSinVer: 100,
};
const TIPOS_MIRANDO = ['fila', 'barrido', 'dormidos', 'lasslow'];
let BARAJA_TIPOS_MIRANDO = []; // vive entre partidas: los tipos no se repiten hasta agotarlos
let BARAJA_TEORIAS_MIRANDO = [];

const TEORIAS_MIRANDO = [
  'Esa farola lleva ahí demasiado tiempo. Anotado.',
  '¿Por qué caminas tan bajito? Sospechoso.',
  'Los charcos me miran. Lo sé.',
  '¿Quién te ha dicho que cruces por aquí?',
  'Monchiman vive cerca. Anotadlo.',
  'Tu sombra va un paso por delante. Anotado.',
  'Hoy hay demasiadas nubes. ¿Quién las ha puesto?',
  'Ese cubo no estaba ahí ayer.',
  'Si corres, huyes. Si paras, esperas. Anotado.',
  'No has dicho nada. Eso es lo que diría uno que sabe algo.',
  'Las ventanas parpadean. Yo lo vi primero.',
  'Un señor con mochila a estas horas. Anotado.',
  'Cuando duermo, mis ojos se turnan. Siempre hay uno de guardia.',
  'Eso lo dices tú.',
];
const PISTAS_TRAMO_MIRANDO = {
  fila: 'Ojos en fila: cada uno abre tras el anterior',
  barrido: 'Un ojo grande barre el suelo: escóndete tras un cubo',
  dormidos: 'Están dormidos: si andas seguido, se despiertan',
  lasslow: 'Lasslow se ríe al fondo: aprovecha cuando miren a otro lado',
};
const FONDOS_MIRANDO = ['bg-plaza', 'bg-parque'];

// Fase 0..1 del compás de un ojo -> apertura (0.06 cerrado, 0.5 entreabierto, 1 abierto).
function aperturaMirando(f) {
  if (f < 0.46) return 0.06;
  if (f < 0.60) return 0.5;
  if (f < 0.86) return 1;
  return 0.5;
}

class Mirando extends Phaser.Scene {
  constructor() { super('Mirando'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la escena al volver a jugar.
    this.activo = false;
    this.reloj = 0;
    this.tramo = 0;
    this.puntos = 0;
    this.vistos = 0;
    this.vidasQ = MIR.vidas;
    this.sosp = 0;
    this.gracia = 0;
    this.bloqueo = 0;
    this.px = 70;
    this.check = 70;
    this.escondido = false;
    this.ocultoT = 0;
    this.agach = 0;
    this.moviendo = false;
    this.cara = 1;
    this.ojos = [];
    this.refugios = [];
    this.objs = [];
    this.cono = null;
    this.ventana = 0;
    this.lassT = 99;
    this.tTramo = 0;
    this.sonT = 0;
    this.vozActual = null;
    this.miron = null;
    this.bocadilloM = null;
    this.cerrando = false;
    this.pistaDicha = false;
    const nivel = typeof nivelDe === 'function' ? nivelDe('Mirando') : 1;
    this.nivel = nivel;
    this.dif = 1 + 0.1 * Math.min(nivel - 1, 8);
    this.tipos = datos && Array.isArray(datos.tipos) ? datos.tipos.slice(0, 3) : this.sortearTipos();
    this.fondos = Phaser.Utils.Array.Shuffle([...FONDOS_MIRANDO]);

    this.teclas = this.input.keyboard.addKeys('LEFT,RIGHT,A,D');
    this.hud();
    this.jugador();
    this.velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x0b0616, 1).setDepth(500).setAlpha(0);

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 450, () => this.presentacion());
  }

  // Tres tipos distintos, sin repetir hasta agotar la baraja (que sigue de una partida a otra).
  sortearTipos() {
    if (BARAJA_TIPOS_MIRANDO.length < 3) BARAJA_TIPOS_MIRANDO = BARAJA_TIPOS_MIRANDO.concat(Phaser.Utils.Array.Shuffle([...TIPOS_MIRANDO]));
    const t = [];
    while (t.length < 3) {
      const i = BARAJA_TIPOS_MIRANDO.findIndex(x => !t.includes(x));
      t.push(i >= 0 ? BARAJA_TIPOS_MIRANDO.splice(i, 1)[0] : TIPOS_MIRANDO.find(x => !t.includes(x)));
    }
    return t;
  }

  teoria() {
    if (!BARAJA_TEORIAS_MIRANDO.length) {
      BARAJA_TEORIAS_MIRANDO = Phaser.Utils.Array.Shuffle([...TEORIAS_MIRANDO]);
      // La última que salió no abre la baraja nueva (se pasa al fondo).
      if (this._ultimaTeoria && BARAJA_TEORIAS_MIRANDO[BARAJA_TEORIAS_MIRANDO.length - 1] === this._ultimaTeoria) BARAJA_TEORIAS_MIRANDO.unshift(BARAJA_TEORIAS_MIRANDO.pop());
    }
    this._ultimaTeoria = BARAJA_TEORIAS_MIRANDO.pop();
    return this._ultimaTeoria;
  }

  // ---------- Pieza fija: HUD y jugador ----------

  hud() {
    const D = 200;
    this.hudG = this.add.graphics().setDepth(D);
    this.vidasG = this.add.graphics().setDepth(D);
    this.textoTramo = texto(this, ANCHO - 120, 44, '', 36, COLOR.crema).setDepth(D);
    this.textoPista = texto(this, 400, 108, '', 28, COLOR.azul, 620).setDepth(D).setAlpha(0);
    this.pintarVidas();
  }

  pintarVidas() {
    const g = this.vidasG;
    g.clear();
    for (let i = 0; i < MIR.vidas; i++) {
      const x = 56 + i * 62, y = 46;
      const viva = i < this.vidasQ;
      g.fillStyle(0x2a1a3d, 1).fillEllipse(x, y, 54, 42).lineStyle(5, HEX.tinta, 1).strokeEllipse(x, y, 54, 42);
      if (viva) {
        g.fillStyle(0xfff6e8, 1).fillEllipse(x, y, 46, 34).lineStyle(4, HEX.tinta, 1).strokeEllipse(x, y, 46, 34);
        g.fillStyle(HEX.tinta, 1).fillCircle(x + 3, y, 9);
      } else {
        g.lineStyle(6, 0x0e0818, 1).beginPath().arc(x, y - 22, 28, 1.05, 2.09).strokePath();
      }
    }
  }

  pintarSosp() {
    const g = this.hudG;
    g.clear();
    const w = MOVIL ? 300 : 360, x0 = ANCHO / 2 - w / 2, y = 32;
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(x0 - 8, y - 6, w + 16, 36, 14);
    g.fillStyle(0x3d3350, 1).fillRoundedRect(x0, y, w, 24, 10);
    const f = Phaser.Math.Clamp(this.sosp / 100, 0, 1);
    if (f > 0.01) {
      const c = f < 0.4 ? HEX.amarillo : f < 0.75 ? 0xff9a3b : HEX.rojo;
      g.fillStyle(c, 1).fillRoundedRect(x0, y, Math.max(16, w * f), 24, 10);
    }
    // El ojo del medidor.
    const ex = x0 - 44;
    g.fillStyle(0x2a1a3d, 1).fillEllipse(ex, y + 12, 46, 36).lineStyle(4, HEX.tinta, 1).strokeEllipse(ex, y + 12, 46, 36);
    const a = 0.25 + f * 0.75;
    g.fillStyle(0xfff6e8, 1).fillEllipse(ex, y + 12, 38, 28 * a);
    g.fillStyle(HEX.tinta, 1).fillCircle(ex + 2, y + 12, 6 * Math.min(1, a + 0.2));
  }

  jugador() {
    this.vuper = this.add.image(this.px, MIR.suelo, 'vn-caminando').setOrigin(0.5, 1).setDepth(55);
    this.escV = 190 / this.vuper.height;
    this.vuper.setScale(this.escV);
  }

  presentacion() {
    // La cartela, más arriba: a la altura de antes, su franja oscura le cortaba la cabeza a Vuper (pies en 612, 190 de alto).
    const banda = this.add.rectangle(ANCHO / 2, 280, ANCHO, 230, HEX.tinta, 0.82).setDepth(300);
    const t1 = texto(this, ANCHO / 2, 220, 'TE ESTÁN MIRANDO', 68, COLOR.amarillo).setDepth(301).setScale(0);
    const ayuda = MOVIL
      ? 'Mantén el dedo hacia donde vas · suelta para quedarte quieto · los cubos te esconden'
      : '← → o A D para andar · quieto no te ven · los cubos te esconden';
    const t2 = texto(this, ANCHO / 2, 304, ayuda, 28, COLOR.crema, 1100).setDepth(301).setAlpha(0);
    const t3 = texto(this, ANCHO / 2, 360, this.nivel > 1 ? `Nivel ${this.nivel}` : 'Cuenta los parpadeos', 26, COLOR.azul).setDepth(301).setAlpha(0);
    sfx(this, 'sting', { volume: 0.4 });
    this.tweens.add({ targets: t1, scale: 1, duration: 400, ease: 'Back.out' });
    this.tweens.add({ targets: [t2, t3], alpha: 1, duration: 380, delay: 260 });
    this.time.delayedCall(2300, () => {
      [banda, t1, t2, t3].forEach(o => o.destroy());
      this.montarTramo(1);
    });
  }

  // ---------- Tramos ----------

  limpiarTramo() {
    this.objs.forEach(o => { if (o && o.destroy) o.destroy(); });
    this.objs = [];
    this.ojos.forEach(o => { if (o.g) o.g.destroy(); if (o.zz) o.zz.destroy(); });
    this.ojos = [];
    this.refugios = [];
    this.cono = null;
    this.lasslow = null;
    this.mironFin = null;
    if (this.luzG) { this.luzG.destroy(); this.luzG = null; }
  }

  montarTramo(n) {
    this.limpiarTramo();
    this.tramo = n;
    this.tipo = this.tipos[n - 1];
    this.tTramo = 0;
    this.px = 70;
    this.check = 70;
    this.sosp = 0;
    this.gracia = 1.3;
    this.bloqueo = 0;
    this.escondido = false;
    this.ocultoT = 0;
    this.agach = 0;
    this.ventana = 0;
    this.meta = n === this.tipos.length ? MIR.metaNeon : MIR.meta;
    this.cerrando = false;

    let clave = n === 3 ? 'bg-fuera-apagado' : this.fondos[n - 1] || 'bg-plaza';
    if (!this.textures.exists(clave)) clave = this.textures.exists('bg-fuera-apagado') ? 'bg-fuera-apagado' : 'bg-fuera';
    this.objs.push(fondo(this, clave).setDepth(0));
    this.objs.push(this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x0d0824, 0.5).setDepth(1));
    this.luzG = this.add.graphics().setDepth(8);

    const bins = this.tipo === 'barrido' ? [330, 640, 950] : [520, 860];
    bins.forEach(x => this.crearCubo(x));

    const rango = 150 + 8 * (this.dif - 1) * 5;
    const xs = [260, 430, 600, 770, 940];
    const kinds = Phaser.Utils.Array.Shuffle(['farola', 'ventana', 'charco', 'farola', 'ventana']);
    const P = 4.4 / Math.pow(this.dif, 0.6);
    if (this.tipo === 'fila') {
      const dir = Math.random() < 0.5 ? 1 : -1;
      xs.forEach((x, i) => this.crearOjo({ x, kind: kinds[i], P, off: (dir > 0 ? i : xs.length - 1 - i) * P / 6, rango }));
    } else if (this.tipo === 'dormidos') {
      xs.forEach((x, i) => this.crearOjo({ x, kind: kinds[i], P, off: 0, rango: rango - 10, dormido: true }));
    } else if (this.tipo === 'lasslow') {
      xs.forEach((x, i) => this.crearOjo({ x, kind: kinds[i], P: Phaser.Math.FloatBetween(3.4, 4.8) / Math.pow(this.dif, 0.6), off: Math.random() * 5, rango }));
      this.crearLasslow();
    } else {
      this.crearGrande(P * 1.2);
    }
    if (n === this.tipos.length) this.crearNeon();

    this.vuper.setTexture('vn-caminando').setPosition(this.px, MIR.suelo).setAlpha(1).clearTint();
    this.vuper.setScale(this.escV);
    this.textoTramo.setText(`${n}/${this.tipos.length}`);
    this.activo = true;
    this.pintarSosp();
    this.pista(PISTAS_TRAMO_MIRANDO[this.tipo]);
    if (!this.pistaDicha) {
      this.pistaDicha = true;
      this.time.delayedCall(1500, () => { if (this.activo && !this.vozActual) this.decir(this.px + 20, MIR.suelo - 230, '(Cuenta los parpadeos.)', 'abajo', 1700); });
    }
  }

  pista(str) {
    this.textoPista.setText(str).setAlpha(1);
    this.tweens.killTweensOf(this.textoPista);
    this.tweens.add({ targets: this.textoPista, alpha: 0, duration: 500, delay: 2200 });
  }

  crearCubo(x) {
    const g = this.add.graphics().setDepth(50);
    const y = MIR.suelo + 8;
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(x - 82, y - 124, 164, 128, 10);
    g.fillStyle(0x3f6b4e, 1).fillRoundedRect(x - 76, y - 112, 152, 112, 8);
    g.fillStyle(0x52825f, 1).fillRect(x - 70, y - 104, 12, 96);
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(x - 88, y - 136, 176, 28, 10);
    g.fillStyle(0x2d4d38, 1).fillRoundedRect(x - 82, y - 130, 164, 16, 6);
    g.lineStyle(4, HEX.tinta, 1).lineBetween(x - 20, y - 100, x - 20, y - 14).lineBetween(x + 24, y - 100, x + 24, y - 14);
    g.fillStyle(HEX.tinta, 1).fillCircle(x - 60, y + 2, 9).fillCircle(x + 60, y + 2, 9);
    const led = this.add.circle(x + 62, y - 124, 7, 0x6b6b7a).setStrokeStyle(3, HEX.tinta).setDepth(51);
    this.objs.push(g, led);
    this.refugios.push({ x, led, usado: false });
  }

  // Un ojo suelto: en farola, ventana o charco. Cada uno con su compás.
  crearOjo({ x, kind, P, off, rango, dormido = false }) {
    const R = kind === 'charco' ? 40 : kind === 'ventana' ? 36 : 38;
    const y = kind === 'charco' ? MIR.suelo + 56 : kind === 'ventana' ? 206 : 292;
    const f = this.add.graphics().setDepth(10);
    if (kind === 'farola') {
      f.fillStyle(HEX.tinta, 1).fillRect(x - 9, y + R * 0.6, 18, MIR.suelo - y - R * 0.6 + 8);
      f.fillStyle(0x4a4658, 1).fillRect(x - 4, y + R * 0.6, 8, MIR.suelo - y - R * 0.6 + 8);
      f.fillStyle(HEX.tinta, 1).fillRoundedRect(x - 30, y + R * 0.5, 60, 20, 8);
    } else if (kind === 'ventana') {
      f.fillStyle(HEX.tinta, 1).fillRoundedRect(x - R * 1.35, y - R * 1.3, R * 2.7, R * 2.6, 8);
      f.fillStyle(0x15102e, 1).fillRoundedRect(x - R * 1.2, y - R * 1.15, R * 2.4, R * 2.3, 6);
      f.fillStyle(0x6a5a86, 1).fillRect(x - R * 1.3, y + R * 1.3, R * 2.6, 9);
    } else {
      f.fillStyle(HEX.tinta, 1).fillEllipse(x, y, R * 3.4, R * 1.3);
      f.fillStyle(0x1f2c5c, 1).fillEllipse(x, y, R * 3.1, R * 1.1);
      f.fillStyle(0x4a5fa8, 0.6).fillEllipse(x - R * 0.7, y - R * 0.18, R * 0.8, R * 0.18);
    }
    this.objs.push(f);
    const g = this.add.graphics().setDepth(40);
    const o = {
      tipo: 'ojo', kind, x, y, R, P, off, rango, dormido, g,
      cierre: 0.06, a: 0.06, vigila: false, mx: 0, my: 0,
      ruido: 0, despierto: false, tDesp: 0, enfria: 0, aPrev: 0.06, forzar: false,
    };
    if (dormido) {
      o.zz = texto(this, x + R * 1.1, y - R * 1.3, 'z', 32, COLOR.azul).setDepth(41);
    }
    this.ojos.push(o);
  }

  // El ojo grande de El Mirón: su cara, con un único ojo que barre el suelo.
  crearGrande(P) {
    const s = this.add.image(640, 360, 'miron').setOrigin(0.5, 1).setDepth(9);
    s.setScale(280 / s.height);
    this.objs.push(s);
    this.tweens.add({ targets: s, y: 366, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const o = {
      tipo: 'grande', kind: 'grande', x: 640, y: 214, R: 62, P, off: Math.random() * P, rango: 0, g: this.add.graphics().setDepth(40),
      cierre: 0.06, a: 0.06, vigila: false, mx: 0, my: 0, aPrev: 0.06, forzar: false,
    };
    this.ojos.push(o);
    this.cono = { cx: 640, ancho: 125, fase: Math.random() * 6 };
    this.mironGrande = s;
  }

  crearLasslow() {
    const s = this.add.image(1100, MIR.suelo - 40, 'n-lasslow-riendo').setOrigin(0.5, 1).setDepth(6).setAlpha(0.92);
    s.setScale(150 / s.height);
    this.objs.push(s);
    this.lasslow = s;
    this.lassT = 3.2;
  }

  crearNeon() {
    const x = 1010, y = 112;
    const g = this.add.graphics().setDepth(12);
    g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(x - 290, y - 38, 580, 76, 24);
    g.lineStyle(6, HEX.rosa, 1).strokeRoundedRect(x - 280, y - 30, 560, 60, 20);
    const t = texto(this, x, y, 'BREATHE AND FLOAT', 44, COLOR.rosa).setDepth(13);
    this.objs.push(g, t);
    this.tweens.add({ targets: [g, t], alpha: 0.62, duration: 420, yoyo: true, repeat: -1, ease: 'Stepped' });
    const m = this.add.image(1140, MIR.suelo + 14, 'miron').setOrigin(0.5, 1).setDepth(11);
    m.setScale(200 / m.height);
    this.objs.push(m);
    this.mironFin = m;
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.reloj += dt;
    this.sonT -= dt;
    if (!this.tramo) return;
    this.moverJugador(dt);
    this.actualizarOjos(dt);
    this.detectar(dt);
    this.pintarOjos();
    this.pintarSosp();
    if (this.lasslow && this.activo) this.gagLasslow(dt);
    if (this.vozActual && this.vozActual.active && this.vozAncla) {
      this.vozActual.setPosition(Phaser.Math.Clamp(this.vozAncla(), 200, ANCHO - 200), this.vozActual.y);
    }
  }

  direccion() {
    let dir = 0;
    const k = this.teclas;
    if (k.RIGHT.isDown || k.D.isDown) dir += 1;
    if (k.LEFT.isDown || k.A.isDown) dir -= 1;
    const p = this.input.activePointer;
    if (!dir && p && p.isDown) {
      if (p.x > this.px + 28) dir = 1; else if (p.x < this.px - 28) dir = -1;
    }
    return dir;
  }

  moverJugador(dt) {
    const puede = this.activo && this.bloqueo <= 0 && !this.cerrando;
    if (this.bloqueo > 0) this.bloqueo -= dt;
    const dir = puede ? this.direccion() : 0;
    this.moviendo = dir !== 0;
    if (dir) this.cara = dir;
    if (puede) this.px = Phaser.Math.Clamp(this.px + dir * MIR.vel * dt, 50, this.meta + 40);
    // Escondido: quieto y pegado a un cubo.
    const ref = this.refugios.find(r => Math.abs(this.px - r.x) < 64);
    const quieto = puede && !this.moviendo;
    this.escondido = !!(quieto && ref);
    if (this.escondido) {
      this.ocultoT += dt;
      if (this.ocultoT > 0.35 && !ref.usado) {
        ref.usado = true;
        ref.led.setFillStyle(HEX.verde);
        sfx(this, 'pop', { volume: 0.3 });
      }
      if (this.ocultoT > 0.35) this.check = ref.x;
    } else this.ocultoT = 0;
    this.agach += ((this.escondido ? 1 : 0) - this.agach) * Math.min(1, dt * 12);
    const v = this.vuper;
    v.setFlipX(this.cara > 0);
    const bob = this.moviendo ? Math.sin(this.reloj * 14) * 4 : 0;
    v.x = this.px;
    v.y = MIR.suelo - Math.abs(bob);
    v.setAngle(this.moviendo ? Math.sin(this.reloj * 14) * 3 : 0);
    v.setScale(this.escV, this.escV * (1 - 0.42 * this.agach));
    v.setDepth(this.agach > 0.3 ? 45 : 55); // escondido: detrás del cubo (50)
    if (this.activo && this.px >= this.meta && !this.cerrando) this.tramoHecho();
    if (this.activo) this.tTramo += dt;
  }

  actualizarOjos(dt) {
    const t = this.reloj;
    const enRango = (o, k = 1) => Math.abs(this.px - o.x) < o.rango * k;
    this.ojos.forEach(o => {
      let a;
      if (o.forzar) a = 0.06;
      else if (o.tipo === 'grande') {
        a = aperturaMirando((((t + o.off) % o.P) / o.P));
      } else if (o.dormido) {
        o.enfria -= dt;
        if (o.despierto) {
          o.tDesp -= dt;
          a = 1;
          if (o.tDesp <= 0) { o.despierto = false; o.ruido = 0; o.enfria = 0.8; }
        } else {
          const ruidoso = this.moviendo && this.activo && enRango(o, 1.7);
          if (o.enfria <= 0) o.ruido = Math.max(0, o.ruido + (ruidoso ? 0.55 : -0.8) * dt * (ruidoso ? this.dif : 1));
          if (o.ruido >= 1) { o.despierto = true; o.tDesp = 2.3; }
          a = 0.06 + Math.min(1, o.ruido) * 0.44;
        }
      } else if (this.ventana > 0 && this.lasslow) {
        a = 1; // abiertos, pero mirando a Lasslow
      } else {
        a = aperturaMirando((((t + o.off) % o.P) / o.P));
      }
      o.a = a;
      o.cierre += (a - o.cierre) * Math.min(1, dt * 16);
      const distraido = this.ventana > 0 && !!this.lasslow && o.tipo === 'ojo';
      o.vigila = !o.forzar && !distraido && o.cierre > 0.93;
      o.aviso = !o.forzar && !distraido && !o.vigila && o.cierre > 0.3;
      // Aviso sonoro: sólo de los ojos cercanos, y sin atropellarse.
      if (o.aPrev < 0.2 && a >= 0.4 && !o.dormido && this.sonT <= 0 && this.activo) {
        const cerca = o.tipo === 'grande' || Math.abs(this.px - o.x) < 340;
        if (cerca) { sfx(this, 'fiu', { volume: 0.16, rate: 1.7 }); this.sonT = 0.25; }
      }
      if (o.dormido && o.aPrev < 0.99 && a >= 0.99 && this.sonT <= 0 && this.activo) { sfx(this, 'latido', { volume: 0.4 }); this.sonT = 0.3; }
      o.aPrev = a;
      // Pupila: te sigue si mira; si no, se pierde.
      let tx = 0, ty = 0;
      if (distraido) { tx = Phaser.Math.Clamp((this.lasslow.x - o.x) / 300, -1, 1); ty = 0.55; }
      else if (o.cierre > 0.3 && !o.forzar) {
        const dx = this.px - o.x, dy = (MIR.suelo - 90) - o.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        tx = dx / d; ty = dy / d;
        if (!o.vigila) { tx *= 0.4; ty *= 0.4; }
      }
      o.mx += (tx - o.mx) * Math.min(1, dt * 10);
      o.my += (ty - o.my) * Math.min(1, dt * 10);
      if (o.zz) {
        o.zz.setVisible(!o.despierto && o.ruido < 0.5 && !o.forzar);
        o.zz.setAlpha(0.5 + 0.5 * Math.sin(t * 3 + o.x));
        o.zz.y = o.y - o.R * 1.3 - Math.abs(Math.sin(t * 1.6 + o.x)) * 8;
      }
    });
    if (this.cono) this.cono.cx = 640 + 450 * Math.sin(0.5 * Math.sqrt(this.dif) * t + this.cono.fase);
    if (this.ventana > 0) this.ventana -= dt;
    if (this.mironGrande && this.cono) {
      const g = this.ojos[0];
      this.mironGrande.setTexture('miron');
      if (g && g.aviso) this.mironGrande.setTint(0xffe9a8); else this.mironGrande.clearTint();
    }
  }

  detectar(dt) {
    let amenaza = 0;
    if (this.activo && this.bloqueo <= 0 && !this.cerrando) {
      if (this.gracia > 0) this.gracia -= dt;
      else {
        const mueve = this.moviendo && !this.escondido;
        this.ojos.forEach(o => {
          if (o.tipo === 'grande') {
            if (o.vigila && !this.escondido && Math.abs(this.px - this.cono.cx) < this.cono.ancho) amenaza = Math.max(amenaza, 175);
            return;
          }
          if (Math.abs(this.px - o.x) >= o.rango) return;
          if (o.vigila && mueve) amenaza = Math.max(amenaza, 250);
          else if (o.aviso && mueve) amenaza = Math.max(amenaza, 45);
        });
      }
    }
    this.sosp = Phaser.Math.Clamp(this.sosp + (amenaza > 0 ? amenaza : -70) * dt, 0, 100);
    this.vuper.setTint(this.sosp > 30 ? (this.sosp > 65 ? 0xff7a7a : 0xffc2a0) : 0xffffff);
    if (this.sosp >= 100 && this.activo && this.bloqueo <= 0) this.visto();
  }

  // ---------- Dibujo de ojos y luces ----------

  pintarOjos() {
    const L = this.luzG;
    if (L) L.clear();
    this.ojos.forEach(o => {
      this.dibujarOjo(o);
      if (!L || !o.vigila) return;
      L.fillStyle(0xffe9a8, 0.15);
      if (o.tipo === 'grande') {
        const cx = this.cono.cx, w = this.cono.ancho;
        L.fillPoints([{ x: o.x - 34, y: o.y + 46 }, { x: o.x + 34, y: o.y + 46 }, { x: cx + w, y: MIR.suelo + 30 }, { x: cx - w, y: MIR.suelo + 30 }], true);
        L.lineStyle(4, 0xffe9a8, 0.5).lineBetween(o.x - 34, o.y + 46, cx - w, MIR.suelo + 30).lineBetween(o.x + 34, o.y + 46, cx + w, MIR.suelo + 30);
        L.fillStyle(0xffe9a8, 0.28).fillEllipse(cx, MIR.suelo + 20, w * 2, 40);
      } else if (o.kind === 'charco') {
        L.fillStyle(0xffe9a8, 0.18).fillEllipse(o.x, MIR.suelo + 24, o.rango * 2, 56);
        L.lineStyle(4, 0xffe9a8, 0.55).strokeEllipse(o.x, MIR.suelo + 24, o.rango * 2, 56);
      } else {
        L.fillPoints([{ x: o.x - o.R * 0.8, y: o.y + o.R }, { x: o.x + o.R * 0.8, y: o.y + o.R }, { x: o.x + o.rango, y: MIR.suelo + 22 }, { x: o.x - o.rango, y: MIR.suelo + 22 }], true);
        L.fillStyle(0xffe9a8, 0.28).fillEllipse(o.x, MIR.suelo + 20, o.rango * 2, 36);
      }
    });
  }

  dibujarOjo(o) {
    const g = o.g, R = o.R, a = o.cierre;
    g.clear();
    g.setPosition(o.x, o.y);
    g.setScale(1, o.kind === 'charco' ? 0.55 : 1);
    const W = R * 2, H = R * 1.7;
    g.fillStyle(0x2a1a3d, 1).fillEllipse(0, 0, W + 16, H + 16);
    g.lineStyle(6, HEX.tinta, 1).strokeEllipse(0, 0, W + 16, H + 16);
    if (a > 0.14) {
      const h = H * a;
      const tono = o.vigila ? 0xfff6e8 : 0xf3e3b8;
      g.fillStyle(tono, 1).fillEllipse(0, 0, W, h);
      if (a > 0.6) {
        g.lineStyle(3, 0xd9534f, 0.75);
        g.lineBetween(-W * 0.48, -h * 0.05, -W * 0.28, h * 0.08).lineBetween(-W * 0.44, h * 0.18, -W * 0.26, h * 0.1);
        g.lineBetween(W * 0.48, h * 0.06, W * 0.3, -h * 0.08).lineBetween(W * 0.42, -h * 0.2, W * 0.28, -h * 0.1);
      }
      const pr = R * (o.vigila ? 0.3 : 0.36);
      const px = o.mx * (W / 2 - pr * 1.25);
      const py = o.my * Math.max(0, h / 2 - pr * 1.1);
      g.fillStyle(HEX.tinta, 1).fillCircle(px, py, pr);
      g.fillStyle(0xffffff, 1).fillCircle(px - pr * 0.3, py - pr * 0.3, pr * 0.28);
      g.lineStyle(5, HEX.tinta, 1).strokeEllipse(0, 0, W, h);
      // El párpado: sombra que baja desde arriba.
      g.fillStyle(0x2a1a3d, 0.85).fillEllipse(0, -h / 2 + 6, W * 0.92, Math.max(4, 14 * (1 - a) + 6));
      if (o.vigila) g.lineStyle(8, 0x1b1028, 1).lineBetween(-R * 0.95, -H * 0.62, R * 0.75, -H * 0.82);
    } else {
      g.lineStyle(8, 0x0e0818, 1).beginPath().arc(0, -R * 0.9, R * 1.3, 1.05, 2.09).strokePath();
      g.lineStyle(5, 0x0e0818, 1);
      [-0.5, 0, 0.5].forEach(k => g.lineBetween(k * R * 1.2, R * 0.28 - Math.abs(k) * 8, k * R * 1.5, R * 0.55));
    }
  }

  // ---------- Lasslow: la ventana extra ----------

  gagLasslow(dt) {
    this.lassT -= dt;
    if (this.lassT > 0 || this.cerrando) return;
    this.lassT = Phaser.Math.FloatBetween(8.5, 10.5);
    this.ventana = 3.6;
    sfx(this, 'risa-lasslow', { volume: 0.5 });
    const s = this.lasslow;
    this.tweens.add({ targets: s, angle: { from: -6, to: 6 }, duration: 110, yoyo: true, repeat: 12, onComplete: () => s.setAngle(0) });
    this.decir(s.x - 60, s.y - s.displayHeight - 20, 'JA…', 'abajo', 1600);
    this.time.delayedCall(450, () => { if (this.activo) this.mironDice('miron-mira', '¿De mí?', 1700); });
  }

  // ---------- Ver y ser visto ----------

  visto() {
    this.vistos++;
    this.vidasQ = Math.max(0, MIR.vidas - this.vistos);
    this.pintarVidas();
    this.puntos = Math.max(0, this.puntos - MIR.penal);
    this.sosp = 0;
    this.bloqueo = 1.3;
    this.vuper.setTexture('vn-sorprendido');
    sfx(this, 'oooh', { volume: 0.4 });
    if (typeof Comic !== 'undefined') Comic.emote(this, this.px + 50, MIR.suelo - 210, 'gota', { profundidad: 150 });
    const flash = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0xff3b3b, 0.12).setDepth(400); // antes 0,28: tapaba la pantalla
    this.tweens.add({ targets: flash, alpha: 0, duration: 260, onComplete: () => flash.destroy() });
    // Todos los ojos se vuelven hacia ti un momento.
    this.ojos.forEach(o => { o.mx = 0; });
    if (this.vistos >= MIR.vidas) {
      this.activo = false;
      this.mironDice('miron-alterado', this.teoria(), 2200);
      this.time.delayedCall(1700, () => this.final(false));
      return;
    }
    this.mironDice('miron-alterado', this.teoria(), 2300);
    // Retrocedes al último escondite.
    this.time.delayedCall(550, () => {
      if (!this.activo) return;
      this.tweens.add({ targets: this, px: this.check, duration: 480, ease: 'Sine.inOut' });
    });
    this.time.delayedCall(1300, () => {
      if (!this.activo) return;
      this.vuper.setTexture('vn-caminando');
      this.px = this.check;
      this.gracia = 1.8;
    });
  }

  tramoHecho() {
    this.activo = false;
    this.cerrando = true;
    const rapido = Math.max(0, Math.round(150 - Math.max(0, this.tTramo - 10) * 10));
    const gana = MIR.puntosTramo + rapido;
    this.puntos += gana;
    sfx(this, 'campanita', { volume: 0.4 });
    golpeTexto(this, Math.min(this.px, 1100), MIR.suelo - 240, `+${gana}`, COLOR.amarillo, 52).setDepth(200);
    if (this.tramo >= this.tipos.length) { this.time.delayedCall(250, () => this.llegada()); return; }
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: this.velo, alpha: 1, duration: 200,
        onComplete: () => {
          this.montarTramo(this.tramo + 1);
          this.tweens.add({ targets: this.velo, alpha: 0, duration: 260 });
        },
      });
    });
  }

  // El neón: por una vez, El Mirón cierra todos los ojos.
  llegada() {
    this.ojos.forEach(o => { o.forzar = true; });
    this.ventana = 0;
    this.vuper.setTexture('vn-hablando').setFlipX(false).setAngle(0);
    if (this.mironFin) {
      this.mironFin.setTexture('miron-relajado');
      this.tweens.add({ targets: this.mironFin, y: this.mironFin.y + 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    sfx(this, 'suspiro', { volume: 0.5 });
    if (typeof Comic !== 'undefined') Comic.emote(this, 1140, MIR.suelo - 230, 'corazon', { profundidad: 150, ms: 1500 });
    this.decir(1100, MIR.suelo - 250, 'Respira y flota…', 'abajo', 1800);
    this.time.delayedCall(2100, () => this.final(true));
  }

  // ---------- Voces: una a la vez ----------

  decir(x, y, str, cola = 'abajo', ms = 1700) {
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    const b = bocadillo(this, x, y, str, { tam: 26, ancho: 380, cola }).setDepth(160);
    this.vozActual = b;
    this.vozAncla = null;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
    return b;
  }

  // El Mirón asoma por la izquierda con su cartel y se va.
  mironDice(tex, str, ms = 2000) {
    if (this.retratoM && this.retratoM.active) this.retratoM.destroy();
    if (this.bocadilloM && this.bocadilloM.active) this.bocadilloM.destroy();
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    const r = this.add.image(-160, 440, tex).setOrigin(0.5, 1).setDepth(170);
    r.setScale(170 / r.height);
    this.retratoM = r;
    this.tweens.add({ targets: r, x: 110, duration: 260, ease: 'Back.out' });
    const b = bocadillo(this, 0, 0, str, { tam: 28, ancho: 420, cola: 'izq' }).setDepth(171);
    b.setPosition(230 + b.anchoB / 2, 300);
    this.bocadilloM = b;
    this.time.delayedCall(ms, () => {
      if (b.active) b.destroy();
      if (r.active) this.tweens.add({ targets: r, x: -180, duration: 260, onComplete: () => r.destroy() });
    });
  }

  // ---------- Final ----------

  final(gana) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.cerrando = true;
    if (gana && this.vistos === 0) this.puntos += MIR.bonoSinVer;
    let titulo, linea;
    if (gana) {
      titulo = this.vistos === 0 ? 'Ni un parpadeo' : 'Cruzado el barrio';
      linea = this.vistos === 0
        ? 'Ningún ojo te ha pillado. Bajo el neón, él cierra todos los suyos. Por una vez.'
        : `${this.vistos} ${this.vistos === 1 ? 'avistamiento' : 'avistamientos'}, tres tramos y un neón. Debajo, él ha cerrado todos los ojos.`;
    } else {
      titulo = 'Anotado';
      linea = 'Tres avistamientos. Esa noche, en su libreta, eres tú.';
    }
    panelFinal(this, { titulo, linea, puntos: this.puntos, clave: 'Mirando', gana });
  }
}

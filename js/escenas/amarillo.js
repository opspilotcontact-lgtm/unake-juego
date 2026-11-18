// Tu propio amarillo: el jefe final. Monchiman contra una versión enorme, amarilla y deformada de sí mismo.
// Combate lateral con el héroe en el suelo (salto, disparo automático, contra y dulce fuerte), cuatro fases cortas.
// Cada fase la gana la calma de quien llega a ayudar, y cada ayuda cambia cómo juegas:
//   1. Sudor frío + Cotine: te lanza dulce; recogerlo carga el disparo fuerte (X).
//   2. El suelo se inclina + Lasslow: su pedo te impulsa en el aire (doble salto) para llegar a los granos de arriba.
//   3. La sala da vueltas + la Pompa: su burbuja lo frena todo y puedes devolver lo que te tira (C).
//   4. Lo que viene después + Puky: llega el último, se pega al amarillo y abre el punto débil final.
// Los ataques del jefe salen de lo que es un amarillo, sin nombrarlo: sudor frío que cae, arcadas en arco, oleadas
// amarillas por el suelo, el suelo que se inclina y la sala que se balancea (corto, avisado, nunca mareante).
// Cada ataque avisa antes (la cara, una marca en el suelo). Cada fase baraja 2-3 patrones, distintos en cada partida.
// Sin game over duro: al caer, Blancaso te sienta un momento y el siguiente intento retoma la fase alcanzada con
// un corazón extra. Juice corto: ni pantallazos largos ni cámara lenta que te quite el mando.

if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Amarillo = 'pringue';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.Amarillo = ['monchiman-picado', UNAKE.amarillo];
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Amarillo = 'jefe';

const AM = {
  suelo: 600,
  xMin: 64, xMax: 790, techo: 130,
  medio: 52,                    // medio alto del héroe (el centro va a suelo - medio)
  jefe: { x: 1010, y: 614, cx: 1010, cy: 372, rx: 215, ry: 240, W: 560, H: 500 },
  pool: [0, 46, 18, 30, 30],    // vida de cada fase (la 2 son tres granos de 6)
  g: 2600, salto: 980, impulso: 900, vel: 410,
  retomaMs: 15 * 60 * 1000,     // pasado este rato, un intento nuevo empieza desde la fase 1
};

const FASES_AM = [
  null,
  { nombre: 'Sudor frío', quien: 'cotine', tag: 'Cotine', linea: 'Come, que es dulce.', mazo: ['sudor', 'arcada', 'oleada'], n: 3, pausa: 1.5,
    consejo: 'Coge el dulce de Cotine: con tres, el disparo fuerte (X).', color: 0xf5d23a },
  { nombre: 'El suelo se inclina', quien: 'lasslow', tag: 'Lasslow', linea: '¡Agárrese, caballero! JA…', mazo: ['inclina', 'sudor', 'oleada', 'arcada'], fijo: 'inclina', n: 3, pausa: 1.3,
    consejo: 'Salta y pulsa saltar otra vez en el aire: el pedo de Lasslow te impulsa. A los granos de arriba.', color: 0xf0c21f },
  { nombre: 'La sala da vueltas', quien: 'pompa', tag: 'La Pompa', linea: '…Respira.', mazo: ['vueltas', 'arcada', 'sudor', 'oleada'], fijo: 'vueltas', n: 3, pausa: 1.1,
    consejo: 'La burbuja de la Pompa lo frena todo. Devuelve lo que te tire con la contra (C).', color: 0xe9b20f },
  { nombre: 'Lo que viene después', quien: 'puky', tag: 'Puky', linea: '¿Me llamabais?', mazo: ['arcada', 'sudor', 'oleada', 'vueltas'], n: 3, pausa: 1.2,
    consejo: 'Puky se pega al amarillo. Dispara a su punto cuando se abra.', color: 0xdc9f0b },
];

// Dónde pueden salir los granos de la fase 2 (arriba del todo: solo se llega con el pedo).
const GRANOS = [[905, 178], [985, 214], [880, 262], [1075, 190], [940, 300], [1055, 282]];
// Dónde se pega Puky en la fase 4 (se alcanzan saltando).
const PUNTOS_PUKY = [[955, 430], [905, 500], [1075, 465], [1010, 405]];

const VOCES_AM = {
  animo: [['palicaso', '¡Escucha, escucha! ¡Tú puedes!'], ['perico', 'Pin pin. Aguanta. Aguanta.']],
};

class Amarillo extends Phaser.Scene {
  constructor() { super('Amarillo'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la escena al volver a jugar.
    this.activo = false;
    this.trans = false;
    this.fase = 0;
    this.tok = 0;
    this.t = 0;
    this.cola = [];
    this.enem = [];
    this.amigas = [];
    this.avisos = [];
    this.picks = [];
    this.boils = [];
    this.boilReserva = 0;
    this.bolsa = [];
    this.mazo = [];
    this.ultimoAtaque = '';
    this.ataqueT = 99;
    this.hp = 1; this.hpMax = 1;
    this.golpes = 0; this.parrys = 0; this.fuertes = 0; this.limpias = 0;
    this.golpeEnFase = false;
    this.dulce = 0;
    this.gas = 3;
    this.invul = 0;
    this.parryT = 0; this.parryCd = 0;
    this.dispT = 0;
    this.saltoHeld = false;
    this.cortado = false;
    this.coyote = 0;
    this.suelo = true;
    this.vx = 0; this.vy = 0;
    this.rot = 0; this.rotObj = 0; this.bal = null;
    this.caraEst = 'idle'; this.caraT = 0;
    this.aturdido = false;
    this.cotineT = 99;
    this.pb = null;
    this.pk = null;
    this.lento = false;
    this.ultimoClank = 0; this.ultimoDestello = 0;
    this.vozActual = null; this.consejoObj = null;
    this.tipContra = false;
    this.animoT = 9;
    this.bolsaVoz = [];
    this.nivel = typeof nivelDe === 'function' ? nivelDe('Amarillo') : 1;
    this.dif = 1 + 0.12 * Math.min(this.nivel - 1, 8);

    // Retomar: tras caer, el siguiente intento vuelve a la fase alcanzada con un corazón de más.
    const rec = ESTADO.amarillo;
    const fresco = rec && Date.now() - (rec.ts || 0) < AM.retomaMs;
    this.rein = fresco ? (rec.rein || 0) : 0;
    this.faseIni = fresco ? Phaser.Math.Clamp(rec.fase || 1, 1, 4) : 1;
    this.vidaMax = 3 + Math.min(2, this.rein);
    this.vida = this.vidaMax;
    if (this.faseIni > 1) this.dulce = 2; // llega algo cargado a las fases siguientes

    this.hx = 200; this.hy = AM.suelo - AM.medio;

    this.texturas();
    this.escenario();
    this.crearJefe();
    this.crearHeroe();
    this.hud();
    this.mandos();

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 450, () => this.presentacion());
  }

  // ---------- Dibujos (Graphics): orbes, ola, grano ----------

  texturas() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const t = HEX.tinta;
    const orbe = (clave, cuerpo, brillo) => {
      if (this.textures.exists(clave)) return;
      g.clear();
      g.fillStyle(t, 1).fillCircle(28, 28, 27);
      g.fillStyle(cuerpo, 1).fillCircle(28, 28, 21);
      g.fillStyle(brillo, 0.9).fillCircle(20, 19, 7);
      g.lineStyle(3, 0xffffff, clave === 'am-orbe-r' ? 0.95 : 0).strokeCircle(28, 28, 15);
      g.generateTexture(clave, 56, 56);
    };
    orbe('am-orbe', 0xf5d23a, 0xfff6a8);
    orbe('am-orbe-r', 0xff6fb0, 0xffd6ea);
    if (!this.textures.exists('am-ola')) {
      g.clear();
      const bolas = [[38, 62, 28], [80, 48, 36], [122, 62, 28]];
      g.fillStyle(t, 1);
      bolas.forEach(([x, y, r]) => g.fillCircle(x, y, r + 6));
      g.fillRect(8, 62, 144, 28);
      g.fillStyle(0xf5d23a, 1);
      bolas.forEach(([x, y, r]) => g.fillCircle(x, y, r));
      g.fillRect(14, 62, 132, 22);
      g.fillStyle(0xfff6a8, 0.8).fillCircle(66, 34, 8).fillCircle(32, 52, 5);
      g.fillStyle(0xd9b400, 1).fillRect(14, 76, 132, 8);
      g.generateTexture('am-ola', 160, 90);
    }
    if (!this.textures.exists('am-boil')) {
      g.clear();
      g.fillStyle(t, 1).fillCircle(48, 48, 46);
      g.fillStyle(0xe8832a, 1).fillCircle(48, 48, 40);
      g.fillStyle(0xffd23f, 1).fillCircle(48, 48, 27);
      g.fillStyle(0xfff6a8, 1).fillCircle(41, 41, 11);
      g.fillStyle(0xffffff, 0.9).fillCircle(37, 37, 4);
      g.generateTexture('am-boil', 96, 96);
    }
    g.destroy();
  }

  // Todo lo de la sala va dentro de «mundo», que se inclina entero (el HUD, los mandos y las ayudas no).
  en(capa, obj) { capa.add(obj); return obj; }

  escenario() {
    this.mundo = this.add.container(0, 0).setDepth(10);
    const capa = () => { const c = this.add.container(0, 0); this.mundo.add(c); return c; };
    this.capaFondo = capa();
    this.capaCoro = capa();
    this.capaJefe = capa();
    this.capaAviso = capa();
    this.capaEnem = capa();
    this.capaHeroe = capa();
    this.capaBala = capa();
    this.capaFx = capa();

    const bg = this.textures.exists('bg-dentro') ? 'bg-dentro' : 'bg-plaza';
    const f = this.add.image(ANCHO / 2, ALTO / 2 - 20, bg);
    f.setScale(Math.max(ANCHO / f.width, ALTO / f.height) * 1.45);
    this.en(this.capaFondo, f);
    this.en(this.capaFondo, this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO * 2, ALTO * 2, HEX.tinta, 0.42));
    // Suelo de tablones.
    const s = AM.suelo;
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRect(-300, s - 6, ANCHO + 600, 500);
    g.fillStyle(0x6b4a2a, 1).fillRect(-300, s, ANCHO + 600, 500);
    g.fillStyle(0x8a5e34, 1).fillRect(-300, s, ANCHO + 600, 16);
    g.lineStyle(4, 0x4a2f19, 1);
    for (let x = -300; x < ANCHO + 300; x += 150) g.lineBetween(x, s + 16, x - 30, s + 500);
    g.lineBetween(-300, s + 70, ANCHO + 300, s + 70);
    g.lineBetween(-300, s + 150, ANCHO + 300, s + 150);
    this.en(this.capaFondo, g);
    // El coro de siempre, abajo, delante del suelo.
    const coro = [['palicaso', 440], ['perico', 560], ['blancaso', 690]];
    this.coro = {};
    coro.forEach(([k, x]) => {
      if (!this.textures.exists(k)) return;
      const im = this.add.image(x, 722, k).setOrigin(0.5, 1);
      im.setScale(104 / im.height);
      this.en(this.capaCoro, im);
      this.coro[k] = im;
      flotar(this, im, { amplitud: 3, periodo: 1500 + x });
    });
    // Un velo amarillo que va cargando la sala fase a fase, y un velo azul para la burbuja.
    this.velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0xffd23f, 0.05).setDepth(90);
    this.veloAzul = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x5ad1ff, 0).setDepth(91);
  }

  // ---------- El jefe: su propio amarillo (silueta de Monchiman estirada, con cara pintada) ----------

  crearJefe() {
    const J = AM.jefe;
    this.jefe = this.add.container(J.x, J.y);
    this.en(this.capaJefe, this.jefe);
    this.caraG = this.add.graphics();
    // El dibujo de verdad (obj-jefe-amarillo, ya con su cara y su M) si está; si no, la silueta pintada de antes.
    // Mismo sitio y mismo alto: las zonas de golpe (AM.jefe.cx/cy/rx/ry) no cambian.
    this.jefeSprite = this.textures.exists('obj-jefe-amarillo');
    if (this.jefeSprite) {
      this.jefeFrente = this.add.image(0, 0, 'obj-jefe-amarillo').setOrigin(0.5, 1);
      this.jefeFrente.setScale(J.H / this.jefeFrente.height);
      this.jefe.add([this.jefeFrente, this.caraG]);
    } else {
      this.jefeAtras = this.add.image(0, 8, 'monchiman').setOrigin(0.5, 1).setTintFill(HEX.tinta).setDisplaySize(J.W + 22, J.H + 16);
      this.jefeFrente = this.add.image(0, 0, 'monchiman').setOrigin(0.5, 1).setTintFill(0xf5d23a).setDisplaySize(J.W, J.H);
      this.marcaM = this.add.text(this.fx(0.47), this.fy(0.27), 'M', { fontFamily: FUENTE, fontSize: '150px', color: '#d99a00', stroke: COLOR.tinta, strokeThickness: 14 }).setOrigin(0.5).setAngle(-8);
      this.jefe.add([this.jefeAtras, this.jefeFrente, this.marcaM, this.caraG]);
    }
    this.tweens.add({ targets: this.jefe, scaleX: 1.025, scaleY: 0.975, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: this.jefe, angle: 1.4, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.goteoT = 0;
  }

  fx(f) { return (f - 0.5) * AM.jefe.W; }
  fy(f) { return -AM.jefe.H * (1 - f); }

  cara(est, seg) { this.caraEst = est; this.caraT = seg; }

  pintarCara(dt) {
    if (this.caraT > 0) { this.caraT -= dt; if (this.caraT <= 0) this.caraEst = this.aturdido ? 'mareo' : 'idle'; }
    const g = this.caraG;
    g.clear();
    const est = this.aturdido && this.caraEst === 'idle' ? 'mareo' : this.caraEst;
    const T = HEX.tinta;
    const ahora = this.time.now / 1000;
    if (this.jefeSprite) return this.pintarCaraSprite(g, est, ahora);
    [[0.375, 0.5, 104, 126], [0.585, 0.485, 80, 102]].forEach(([fx, fy, w, h], i) => {
      const x = this.fx(fx);
      const y = this.fy(fy);
      if (est === 'golpe') {
        g.lineStyle(11, T, 1);
        g.lineBetween(x - w / 3, y - h / 4, x + w / 4, y).lineBetween(x - w / 3, y + h / 4, x + w / 4, y);
        return;
      }
      g.fillStyle(T, 1).fillEllipse(x, y, w + 16, h + 16);
      g.fillStyle(0xffffff, 1).fillEllipse(x, y, w, h);
      if (est === 'mareo') {
        g.lineStyle(6, T, 1).beginPath();
        for (let a = 0; a < 9.5; a += 0.3) {
          const r = 2 + a * 3.4;
          const px = x + Math.cos(a + ahora * 6 * (i ? -1 : 1)) * r;
          const py = y + Math.sin(a + ahora * 6 * (i ? -1 : 1)) * r * 1.1;
          if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.strokePath();
        return;
      }
      const wx = AM.jefe.x + x;
      const wy = AM.jefe.y + y;
      const a = Math.atan2(this.hy - wy, this.hx - wx);
      const pr = est === 'tele' ? 15 : 23;
      g.fillStyle(T, 1).fillCircle(x + Math.cos(a) * 15, y + Math.sin(a) * 15, pr);
      g.fillStyle(0xffffff, 1).fillCircle(x + Math.cos(a) * 15 - 6, y + Math.sin(a) * 15 - 7, 5);
      if (est === 'tele') {
        g.lineStyle(14, T, 1).lineBetween(x - w / 2 - 6, y - h / 2 - (i ? 22 : -4), x + w / 2 + 6, y - h / 2 + (i ? -2 : -26));
      } else {
        g.fillStyle(0xf5d23a, 1).fillEllipse(x, y - h * 0.38, w + 10, h * 0.5);
        g.lineStyle(6, T, 1).lineBetween(x - w / 2 - 4, y - h * 0.14, x + w / 2 + 4, y - h * 0.14);
      }
    });
    const mx = this.fx(0.48);
    const my = this.fy(0.8);
    if (est === 'tele') {
      const k = 1 + 0.08 * Math.sin(ahora * 30);
      g.fillStyle(T, 1).fillEllipse(mx, my, 196 * k, 156 * k);
      g.fillStyle(0x4a2a0a, 1).fillEllipse(mx, my, 178 * k, 138 * k);
      g.fillStyle(0xff6fb0, 1).fillEllipse(mx, my + 40, 110, 56);
      g.fillStyle(0xf5d23a, 1).fillRect(mx - 28, my + 62, 12, 32).fillRect(mx + 20, my + 66, 12, 46);
    } else if (est === 'golpe' || est === 'mareo') {
      g.fillStyle(T, 1).fillEllipse(mx, my + 6, 70, 56);
      g.fillStyle(0x4a2a0a, 1).fillEllipse(mx, my + 6, 52, 38);
    } else {
      g.lineStyle(13, T, 1).beginPath();
      for (let i = -92; i <= 92; i += 8) {
        const y = my + Math.sin(i * 0.11 + ahora * 3) * 7 + (i * i) / 1500;
        if (i === -92) g.moveTo(mx + i, y); else g.lineTo(mx + i, y);
      }
      g.strokePath();
    }
  }

  // Sobre el dibujo solo se pinta lo que avisa: la boca abierta antes de atacar (tele) y el mareo. Coordenadas
  // medidas en obj-jefe-amarillo (285×320): ojos en (125, 95) y (165, 95), boca en (150, 125).
  pintarCaraSprite(g, est, ahora) {
    const s = this.jefeFrente.scaleX;
    const px = (x, y) => [(x - this.jefeFrente.width / 2) * s, -(this.jefeFrente.height - y) * s];
    const T = HEX.tinta;
    if (est === 'tele') {
      const [mx, my] = px(150, 128);
      const k = 1 + 0.08 * Math.sin(ahora * 30);
      g.fillStyle(T, 1).fillEllipse(mx, my, 92 * k, 70 * k);
      g.fillStyle(0x4a2a0a, 1).fillEllipse(mx, my, 78 * k, 56 * k);
      g.fillStyle(0xff6fb0, 1).fillEllipse(mx, my + 16, 48, 22);
    } else if (est === 'mareo') {
      [[125, 95], [165, 95]].forEach(([ox, oy], i) => {
        const [x, y] = px(ox, oy);
        g.fillStyle(0xffffff, 1).fillCircle(x, y, 26);
        g.lineStyle(5, T, 1).beginPath();
        for (let a = 0; a < 9.5; a += 0.3) {
          const r = 1 + a * 2.4;
          const qx = x + Math.cos(a + ahora * 6 * (i ? -1 : 1)) * r;
          const qy = y + Math.sin(a + ahora * 6 * (i ? -1 : 1)) * r;
          if (a === 0) g.moveTo(qx, qy); else g.lineTo(qx, qy);
        }
        g.strokePath();
      });
    }
  }

  // Con el dibujo, cada fase lo calienta un poco (tinte que multiplica); con la silueta, el color de la fase.
  colorJefe(hex) {
    this.jefeColor = hex;
    if (this.jefeSprite) this.jefeFrente.setTint(Phaser.Display.Color.GetColor(255, 255 - (0xf5 - ((hex >> 16) & 0xff)) * 3, 255 - (0xd2 - ((hex >> 8) & 0xff)) * 2));
    else this.jefeFrente.setTintFill(hex);
  }

  destelloJefe(fuerte) {
    const ahora = this.time.now;
    if (!fuerte && ahora - this.ultimoDestello < 160) return;
    this.ultimoDestello = ahora;
    this.jefeFrente.setTintFill(0xffffff);
    this.time.delayedCall(fuerte ? 90 : 45, () => { if (this.jefeFrente.active) { if (this.jefeSprite) { this.jefeFrente.clearTint(); this.colorJefe(this.jefeColor); } else this.jefeFrente.setTintFill(this.jefeColor); } });
    if (this.caraT <= 0 || this.caraEst === 'idle') this.cara('golpe', 0.1);
  }

  // ---------- El héroe ----------

  crearHeroe() {
    this.heroe = this.add.image(this.hx, this.hy, 'monchiman');
    this.escH = (AM.medio * 2) / this.heroe.height;
    this.heroe.setScale(this.escH);
    this.en(this.capaHeroe, this.heroe);
    this.aroContra = this.en(this.capaHeroe, this.add.circle(this.hx, this.hy, 40).setStrokeStyle(8, 0xfff6e8, 0.95).setVisible(false));
    this.burbuja = this.en(this.capaHeroe, this.add.graphics().setVisible(false));
  }

  // ---------- Pantalla: barra de fases, corazones, dulce y gas ----------

  hud() {
    const D = 100;
    texto(this, ANCHO / 2, 22, 'TU PROPIO AMARILLO', 22, COLOR.amarillo).setDepth(D);
    this.segs = [];
    const ancho = 148;
    const gap = 16;
    const x0 = ANCHO / 2 - (4 * ancho + 3 * gap) / 2;
    const iconos = ['obj-donut', 'fx-nube-pedo', 'pompa-hinchada', 'puky-salto'];
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * (ancho + gap);
      this.add.rectangle(x + ancho / 2, 64, ancho + 8, 26, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(D);
      const r = this.add.rectangle(x, 64, ancho, 16, 0xf5d23a).setOrigin(0, 0.5).setDepth(D + 1);
      this.segs.push({ r, ancho });
      if (this.textures.exists(iconos[i])) {
        const ic = this.add.image(x + 6, 64, iconos[i]).setDepth(D + 2);
        ic.setScale(44 / ic.height);
        this.segs[i].ic = ic;
      }
    }
    this.cor = [];
    for (let i = 0; i < this.vidaMax; i++) this.cor.push(this.add.image(38 + i * 52, 42, 'monchiman').setScale(0.1).setDepth(D));
    this.dulcePips = [];
    for (let i = 0; i < 3; i++) {
      const p = this.add.image(36 + i * 44, 96, 'obj-donut').setDepth(D);
      p.setScale(36 / p.height);
      this.dulcePips.push(p);
    }
    this.etqDulce = MOVIL ? 'DULCE' : 'DULCE (X)';
    this.textoDulce = texto(this, 190, 96, this.etqDulce, 18, COLOR.crema).setOrigin(0, 0.5).setDepth(D);
    this.gasPips = [];
    for (let i = 0; i < 3; i++) {
      const p = this.add.image(36 + i * 44, 140, 'fx-nube-pedo').setDepth(D).setVisible(false);
      p.setScale(36 / p.height);
      this.gasPips.push(p);
    }
    this.textoGas = texto(this, 190, 140, 'GAS', 18, COLOR.crema).setOrigin(0, 0.5).setDepth(D).setVisible(false);
    this.pintarHud();
  }

  pintarHud() {
    this.cor.forEach((c, i) => { if (i < this.vida) c.clearTint().setAlpha(1); else c.setTint(0x333333).setAlpha(0.4); });
    this.dulcePips.forEach((p, i) => { if (i < this.dulce) p.clearTint().setAlpha(1); else p.setTint(0x3a3048).setAlpha(0.6); });
    this.gasPips.forEach((p, i) => { const l = this.gas - i; if (l >= 1) p.clearTint().setAlpha(1); else if (l > 0) p.setTint(0x666666).setAlpha(0.4 + l * 0.6); else p.setTint(0x3a3048).setAlpha(0.5); });
  }

  // ---------- Mandos: teclado y, en el móvil, botones en pantalla ----------

  mandos() {
    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE');
    this.tc = { izq: false, der: false, salto: false };
    const salto = () => this.intentoSalto();
    ['UP', 'W', 'SPACE'].forEach(k => this.input.keyboard.on(`keydown-${k}`, salto));
    ['X', 'L'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.fuerte()));
    ['C', 'SHIFT', 'K'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.contra()));
    if (!MOVIL) return;
    const D = 150;
    const boton1 = (x, y, r, etq, color, clave, { sosten = false, alPulsar } = {}) => {
      const g = this.add.graphics().setDepth(D);
      g.fillStyle(HEX.tinta, 0.5).fillCircle(x + 3, y + 6, r);
      g.fillStyle(color, 0.72).fillCircle(x, y, r);
      g.lineStyle(6, HEX.tinta, 0.9).strokeCircle(x, y, r);
      this.add.text(x, y, etq, { fontFamily: FUENTE, fontSize: `${Math.round(r * (etq.length > 4 ? 0.34 : 0.46))}px`, color: COLOR.tinta, align: 'center' }).setOrigin(0.5).setDepth(D + 1);
      const z = this.add.circle(x, y, r * 1.1, 0xffffff, 0.001).setDepth(D + 2).setInteractive();
      let dedo = null;
      const on = p => { dedo = p.id; if (clave) this.tc[clave] = true; g.setAlpha(1); if (alPulsar) alPulsar(); };
      const off = p => { if (dedo !== p.id) return; dedo = null; if (clave) this.tc[clave] = false; };
      z.on('pointerdown', on);
      z.on('pointerup', off);
      z.on('pointerupoutside', off);
      if (sosten) {
        z.on('pointerout', off);
        z.on('pointerover', p => { if (p.isDown) on(p); });
      }
    };
    boton1(96, 658, 62, '◀', HEX.amarillo, 'izq', { sosten: true });
    boton1(238, 658, 62, '▶', HEX.amarillo, 'der', { sosten: true });
    boton1(ANCHO - 90, 650, 66, 'SALTO', HEX.verde, 'salto', { alPulsar: () => this.intentoSalto() });
    boton1(ANCHO - 238, 668, 54, 'CONTRA', HEX.rosa, null, { alPulsar: () => this.contra() });
    boton1(ANCHO - 368, 668, 54, 'DULCE', HEX.azul, null, { alPulsar: () => this.fuerte() });
  }

  // ---------- Presentación y fases ----------

  presentacion() {
    const banda = this.add.rectangle(ANCHO / 2, 380, ANCHO, 260, HEX.tinta, 0.78).setDepth(199);
    const t1 = texto(this, ANCHO / 2, 318, 'TU PROPIO AMARILLO', 72, COLOR.amarillo).setDepth(200).setScale(0);
    const ayuda = MOVIL
      ? 'Dispara solo · SALTO · CONTRA devuelve lo que te tiran · DULCE es el disparo fuerte'
      : 'Flechas o A D mover · ↑ / Espacio saltar · C contra (devuelve) · X dulce fuerte · dispara solo';
    const t2 = texto(this, ANCHO / 2, 392, ayuda, 26, COLOR.crema, 1100).setDepth(200).setAlpha(0);
    const extra = [this.nivel > 1 ? `Nivel ${this.nivel}` : '', this.faseIni > 1 ? `Retomas en la fase ${this.faseIni}` : ''].filter(Boolean).join(' · ');
    const t3 = texto(this, ANCHO / 2, 446, extra, 24, COLOR.azul).setDepth(200).setAlpha(0);
    sfx(this, 'sting', { volume: 0.5 });
    this.tweens.add({ targets: t1, scale: 1, duration: 420, ease: 'Back.out' });
    this.tweens.add({ targets: [t2, t3], alpha: 1, duration: 380, delay: 260 });
    this.time.delayedCall(2300, () => {
      [banda, t1, t2, t3].forEach(o => o.destroy());
      this.activo = true;
      this.iniciarFase(this.faseIni, true);
    });
  }

  mazoDe(n) {
    const F = FASES_AM[n];
    const resto = Phaser.Utils.Array.Shuffle(F.mazo.filter(p => p !== F.fijo));
    const sel = (F.fijo ? [F.fijo] : []).concat(resto).slice(0, F.n);
    return sel;
  }

  iniciarFase(n, primera = false) {
    this.fase = n;
    this.tok++;
    this.trans = false;
    this.golpeEnFase = false;
    this.hpMax = this.hp = AM.pool[n];
    this.mazo = this.mazoDe(n);
    this.bolsa = [];
    this.ataqueT = primera ? 1.6 : 2.2;
    this.aturdido = false;
    const F = FASES_AM[n];
    this.colorJefe(F.color);
    this.tweens.add({ targets: this.velo, fillAlpha: 0.05 + 0.055 * n, duration: 800 });
    ESTADO.amarillo = { fase: n, ts: Date.now(), rein: this.rein };
    if (typeof guardarPartida === 'function') guardarPartida();
    this.pintarHud();
    this.gasPips.forEach(p => p.setVisible(n === 2));
    this.textoGas.setVisible(n === 2);
    this.cambiarAyuda(n);
    this.consejo(F.consejo, n === 1 ? 5200 : 4600);
    if (n === 1) {
      this.cotineT = 1.2;
      golpeTexto(this, ANCHO / 2, 250, '¡Que no cunda el amarillo!', COLOR.amarillo, 52).setDepth(200);
      sfx(this, 'tiroriro', { volume: 0.5 });
      this.time.delayedCall(3400, () => this.decir('animo'));
    }
    if (n === 2) { this.gas = 3; this.boilReserva = AM.pool[2]; this.boils = []; this.prog(0.9, () => this.nuevosGranos()); }
    if (n === 3) { this.pb = { estado: 'espera', t: 2.6, bub: null }; }
    if (n === 4) this.llegaPuky();
    if (n !== 4 && n !== 1) this.time.delayedCall(900, () => this.voz(this.ayudante, F.linea));
    if (n === 1) this.time.delayedCall(700, () => this.voz(this.ayudante, F.linea));
  }

  // La ayuda de cada fase entra por arriba a la izquierda (no se inclina con la sala).
  cambiarAyuda(n) {
    const F = FASES_AM[n];
    const clave = { cotine: 'cotine', lasslow: 'lasslow-pedo', pompa: 'pompa', puky: null }[F.quien];
    if (this.ayudante && this.ayudante.active) {
      const vieja = this.ayudante;
      const vt = this.ayudaTag;
      this.tweens.add({ targets: [vieja, vt], y: '-=200', alpha: 0, duration: 400, onComplete: () => { vieja.destroy(); vt.destroy(); } });
    }
    this.ayudante = null;
    if (!clave || !this.textures.exists(clave)) return;
    const im = this.add.image(330, -120, clave).setDepth(80);
    im.setScale(150 / im.height);
    this.tweens.add({ targets: im, y: 220, duration: 520, ease: 'Back.out', onComplete: () => flotar(this, im, { amplitud: 6, periodo: 1300 }) });
    this.ayudaTag = texto(this, 330, 318, F.tag, 22, COLOR.crema).setDepth(80).setAlpha(0);
    this.tweens.add({ targets: this.ayudaTag, alpha: 1, duration: 300, delay: 500 });
    this.ayudante = im;
    sfx(this, 'pop', { volume: 0.4 });
  }

  consejo(str, ms) {
    if (this.consejoObj && this.consejoObj.active) this.consejoObj.destroy();
    // En móvil el jefe ocupa la derecha: el consejo va entre el marcador y el jefe, más pequeño y dura menos.
    const t = MOVIL
      ? texto(this, 620, 120, str, 20, COLOR.crema, 470).setDepth(160).setAlpha(0)
      : texto(this, ANCHO / 2 + 60, 128, str, 24, COLOR.crema, 740).setDepth(160).setAlpha(0);
    if (MOVIL) ms = Math.min(ms, 2800);
    this.consejoObj = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 250 });
    this.time.delayedCall(ms, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 350, onComplete: () => t.destroy() }); });
  }

  // Una voz a la vez: la nueva quita el bocadillo anterior.
  voz(quien, str, ms = 1900) {
    if (!this.sys || !this.sys.isActive()) return;
    let x; let y; let cola = 'abajo';
    if (quien && quien.x !== undefined && quien.active) { x = Phaser.Math.Clamp(quien.x + 150, 220, ANCHO - 220); y = quien.y; cola = 'izq'; }
    else if (typeof quien === 'string' && this.coro[quien]) { const c = this.coro[quien]; x = Phaser.Math.Clamp(c.x, 220, ANCHO - 220); y = c.y - c.displayHeight - 60; }
    else { x = 330; y = 290; cola = 'izq'; }
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    const b = bocadillo(this, x, y, str, { tam: 24, ancho: 340, cola }).setDepth(170);
    this.vozActual = b;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
  }

  decir(clave) {
    if (!this.bolsaVoz.length) this.bolsaVoz = Phaser.Utils.Array.Shuffle([...VOCES_AM[clave]]);
    const [quien, str] = this.bolsaVoz.pop();
    this.voz(quien, str);
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.pintarCara(dt);
    this.goteoJefe(dt);
    if (!this.activo) return;
    this.t += dt;
    this.invul -= dt;
    this.parryT -= dt;
    this.parryCd -= dt;
    this.animoT -= dt;
    const dtE = this.lento ? dt * 0.5 : dt;

    this.cola.forEach(c => { c.t -= dtE; });
    const listas = this.cola.filter(c => c.t <= 0);
    if (listas.length) { this.cola = this.cola.filter(c => c.t > 0); listas.forEach(c => c.fn()); }

    this.moverHeroe(dt);
    this.disparar(dt);
    this.logicaFase(dt, dtE);
    this.atacar(dtE);
    this.moverEnemigos(dtE);
    this.moverAmigas(dt);
    this.moverPicks(dt);
    this.inclinar(dtE);

    this.segs.forEach((s, i) => {
      const f = i + 1 < this.fase ? 0 : i + 1 === this.fase ? Math.max(0, this.hp / this.hpMax) : 1;
      s.r.width = s.ancho * f;
      if (s.ic) s.ic.setAlpha(i + 1 < this.fase ? 0.35 : 1);
    });
    this.heroe.setAlpha(this.invul > 0 ? 0.4 + 0.6 * (Math.sin(this.time.now / 40) > 0 ? 1 : 0) : 1);
    if (this.animoT <= 0 && this.activo && !this.trans && !(this.vozActual && this.vozActual.active)) { this.animoT = Phaser.Math.Between(11, 16); this.decir('animo'); }
  }

  prog(seg, fn) {
    const tok = this.tok;
    this.cola.push({ t: seg, fn: () => { if (tok === this.tok && this.activo) fn(); } });
  }

  goteoJefe(dt) {
    this.goteoT -= dt;
    if (this.goteoT > 0) return;
    this.goteoT = 0.55;
    const x = AM.jefe.x + Phaser.Math.Between(-190, 190);
    const y = AM.jefe.y - Phaser.Math.Between(40, 130);
    const c = this.en(this.capaFx, this.add.ellipse(x, y, 12, 18, 0xf5d23a).setStrokeStyle(3, HEX.tinta));
    this.tweens.add({ targets: c, y: y + 90, alpha: 0, duration: 520, ease: 'Quad.in', onComplete: () => c.destroy() });
  }

  moverHeroe(dt) {
    const k = this.teclas;
    const izq = k.LEFT.isDown || k.A.isDown || this.tc.izq;
    const der = k.RIGHT.isDown || k.D.isDown || this.tc.der;
    const dir = (der ? 1 : 0) - (izq ? 1 : 0);
    this.saltoHeld = k.UP.isDown || k.W.isDown || k.SPACE.isDown || this.tc.salto;
    this.vx += (dir * AM.vel - this.vx) * Math.min(1, dt * (this.suelo ? 16 : 9));
    // La sala inclinada empuja hacia el lado bajo.
    const empuje = Math.sin(this.rot) * 1900 * (this.suelo ? 1 : 0.55);
    this.hx = Phaser.Math.Clamp(this.hx + (this.vx + empuje) * dt, AM.xMin, AM.xMax);
    if (this.suelo) this.coyote = 0.1; else this.coyote -= dt;
    if (!this.saltoHeld && this.vy < -330 && !this.cortado) { this.vy *= 0.5; this.cortado = true; }
    this.vy = Math.min(1500, this.vy + AM.g * dt);
    this.hy += this.vy * dt;
    const piso = AM.suelo - AM.medio;
    if (this.hy >= piso) {
      if (!this.suelo && this.vy > 300) this.aterriza();
      this.hy = piso; this.vy = 0; this.suelo = true;
    } else this.suelo = false;
    if (this.hy < AM.techo) { this.hy = AM.techo; this.vy = Math.max(0, this.vy); }
    this.heroe.setPosition(this.hx, this.hy);
    // Flota con peso: se inclina con el movimiento y se estira con el salto.
    const est = this.suelo ? 1 : 1 + Math.min(0.14, Math.abs(this.vy) / 7000);
    this.heroe.setAngle(Phaser.Math.Linear(this.heroe.angle, this.vx * 0.022, 0.25));
    if (!this.aterrizando) this.heroe.setScale(this.escH / est * (1 + (this.suelo ? Math.sin(this.time.now / 160) * 0.012 : 0)), this.escH * est);
    this.aroContra.setPosition(this.hx, this.hy).setVisible(this.parryT > 0);
    if (this.parryT > 0) this.aroContra.setScale(1 + (1 - this.parryT / this.ventanaContra()) * 0.5);
    if (this.burbujaOn) this.pintarBurbuja();
    if (this.fase === 2) {
      this.gas = Math.min(3, this.gas + dt / 0.95);
      this.pintarHud();
    }
  }

  aterriza() {
    this.aterrizando = true;
    this.heroe.setScale(this.escH * 1.22, this.escH * 0.82);
    this.tweens.add({ targets: this.heroe, scaleX: this.escH, scaleY: this.escH, duration: 160, ease: 'Back.out', onComplete: () => { this.aterrizando = false; } });
    const p = this.en(this.capaFx, this.add.ellipse(this.hx, AM.suelo - 2, 70, 14, 0xfff6e8, 0.7));
    this.tweens.add({ targets: p, scaleX: 1.8, alpha: 0, duration: 260, onComplete: () => p.destroy() });
  }

  intentoSalto() {
    if (!this.activo) return;
    if (this.suelo || this.coyote > 0) {
      this.vy = -AM.salto; this.suelo = false; this.coyote = 0; this.cortado = false;
      sfx(this, 'boing', { volume: 0.25 });
      return;
    }
    if (this.fase === 2 && this.gas >= 1) {
      this.gas -= 1;
      this.vy = -AM.impulso;
      this.cortado = true;
      this.pintarHud();
      sfx(this, Phaser.Utils.Array.GetRandom(['pedo', 'pedo-silencioso', 'pedo-tuba']), { volume: 0.35 });
      const nube = this.textures.exists('fx-nube-pedo') ? this.add.image(this.hx, this.hy + 44, 'fx-nube-pedo') : this.add.circle(this.hx, this.hy + 44, 30, 0xb68a2e);
      if (nube.height) nube.setScale(86 / nube.height);
      this.en(this.capaFx, nube);
      this.tweens.add({ targets: nube, y: nube.y + 60, alpha: 0, scale: nube.scale * 1.6, duration: 480, onComplete: () => nube.destroy() });
      if (!this.vozActual || !this.vozActual.active) { if (Math.random() < 0.25) this.voz(this.ayudante, 'JA…', 900); }
    }
  }

  ventanaContra() { return this.lento ? 0.5 : 0.3; }

  contra() {
    if (!this.activo || this.trans || this.parryCd > 0) return;
    this.parryT = this.ventanaContra();
    this.parryCd = this.lento ? 0.3 : 0.6;
    sfx(this, 'zas', { volume: 0.25 });
  }

  // El dulce fuerte: tres dulces recogidos, una donut gigante.
  fuerte() {
    if (!this.activo || this.dulce < 3) return;
    this.dulce = 0;
    this.fuertes++;
    this.pintarHud();
    sfx(this, 'fiuuu', { volume: 0.7 });
    const im = this.textures.exists('obj-donut') ? this.add.image(this.hx + 70, this.hy, 'obj-donut') : this.add.circle(this.hx + 70, this.hy, 40, 0xff7eb0);
    if (im.height) im.setScale(92 / im.height);
    this.en(this.capaBala, im);
    this.amigas.push({ img: im, x: im.x, y: im.y, vx: 900, vy: 0, tipo: 'fuerte', r: 40, rosa: false, giro: 700 });
    const o = this.en(this.capaFx, this.add.circle(this.hx, this.hy, 30, 0xff7eb0, 0.7));
    this.tweens.add({ targets: o, scale: 2.6, alpha: 0, duration: 260, onComplete: () => o.destroy() });
  }

  disparar(dt) {
    this.dispT -= dt;
    if (this.dispT > 0) return;
    this.dispT = 0.15;
    const im = this.add.image(this.hx + 66, this.hy - 4 + Phaser.Math.Between(-5, 5), 'caramelo').setScale(0.17);
    this.en(this.capaBala, im);
    this.amigas.push({ img: im, x: im.x, y: im.y, vx: 1000, vy: 0, tipo: 'normal', r: 12, rosa: false, giro: 900 });
    if (Math.random() < 0.25) sfx(this, 'pop', { volume: 0.07 });
  }

  // ---------- Las ayudas de cada fase ----------

  logicaFase(dt, dtE) {
    if (this.trans) return;
    const f = this.fase;
    if (f === 1) {
      this.cotineT -= dtE;
      if (this.cotineT <= 0) { this.cotineT = 2.5 / Math.sqrt(this.dif); this.cotineLanza(); }
    }
    if (f === 3) this.logicaPompa(dt);
    if (f === 4) this.logicaPuky(dtE);
  }

  cotineLanza() {
    if (this.picks.length >= 3 || !this.ayudante || !this.ayudante.active) return;
    const dulceClave = Math.random() < 0.5 && this.textures.exists('obj-caramelo') ? 'obj-caramelo' : 'obj-donut';
    const x0 = 330; const y0 = 220;
    const xt = Phaser.Math.Between(180, 700);
    const T = 1.1; const g = 1200;
    const im = this.add.image(x0, y0, this.textures.exists(dulceClave) ? dulceClave : 'caramelo');
    im.setScale(dulceClave === 'obj-caramelo' ? 84 / im.width : 60 / im.height);
    this.en(this.capaBala, im);
    const aro = this.en(this.capaBala, this.add.circle(x0, y0, 34).setStrokeStyle(5, 0xff7eb0, 0.9));
    this.picks.push({ img: im, aro, x: x0, y: y0, vx: (xt - x0) / T, vy: (AM.suelo - 36 - y0) / T - 0.5 * g * T, g, suelo: false, vida: 7 });
    this.tweens.add({ targets: this.ayudante, angle: 9, duration: 110, yoyo: true });
    sfx(this, 'pop', { volume: 0.3 });
  }

  moverPicks(dt) {
    this.picks = this.picks.filter(p => {
      if (!p.suelo) {
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.y >= AM.suelo - 36) { p.y = AM.suelo - 36; p.suelo = true; p.vx = 0; p.vy = 0; }
      } else p.vida -= dt;
      p.img.setPosition(p.x, p.y).setAngle(p.suelo ? 0 : p.img.angle + 300 * dt);
      p.aro.setPosition(p.x, p.y).setScale(1 + 0.12 * Math.sin(this.time.now / 140));
      if (p.vida < 1.6) { p.img.setAlpha(Math.sin(this.time.now / 60) > 0 ? 1 : 0.3); p.aro.setAlpha(0.3); }
      if (Math.abs(p.x - this.hx) < 64 && Math.abs(p.y - this.hy) < 74) {
        if (this.dulce < 3) {
          this.dulce++;
          this.pintarHud();
          sfx(this, 'nam', { volume: 0.4 });
          if (this.dulce === 3) { sfx(this, 'campanita', { volume: 0.5 }); this.textoDulce.setText(MOVIL ? '¡DULCE LISTO!' : '¡DULCE LISTO! (X)'); this.tweens.add({ targets: this.textoDulce, scale: 1.18, duration: 160, yoyo: true, repeat: 2 }); }
          this.salpicar(p.x, p.y, 5, 0xff7eb0);
          p.img.destroy(); p.aro.destroy();
          return false;
        }
        return true;
      }
      if (p.vida <= 0 || this.trans) { p.img.destroy(); p.aro.destroy(); return false; }
      return true;
    });
    if (this.dulce < 3 && this.textoDulce.text !== this.etqDulce) this.textoDulce.setText(this.etqDulce);
  }

  // La Pompa te mete en su burbuja: tarde (tres frases tarde), pero llega.
  logicaPompa(dt) {
    const pb = this.pb;
    if (!pb) return;
    pb.t -= dt;
    if (pb.estado === 'espera' && pb.t <= 0) {
      pb.estado = 'avisa'; pb.t = 1.5;
      this.voz(this.ayudante, '…No.', 1400);
    } else if (pb.estado === 'avisa' && pb.t <= 0) {
      pb.estado = 'viene'; pb.t = 4;
      pb.x = 330; pb.y = 220;
      pb.bub = this.en(this.capaFx, this.add.circle(pb.x, pb.y, 46, 0xbfeaff, 0.35).setStrokeStyle(5, 0xffffff, 0.9));
      sfx(this, 'hinchar', { volume: 0.4 });
    } else if (pb.estado === 'viene') {
      const a = Math.atan2(this.hy - pb.y, this.hx - pb.x);
      pb.x += Math.cos(a) * 330 * dt; pb.y += Math.sin(a) * 330 * dt;
      pb.bub.setPosition(pb.x, pb.y);
      if (Math.hypot(this.hx - pb.x, this.hy - pb.y) < 50) {
        pb.bub.destroy(); pb.bub = null;
        pb.estado = 'dentro'; pb.t = 5.5;
        this.burbujaOn = true; this.lento = true;
        this.burbuja.setVisible(true);
        this.tweens.add({ targets: this.veloAzul, fillAlpha: 0.12, duration: 300 });
        sfx(this, 'plop', { volume: 0.5 });
        if (!this.tipContra) { this.tipContra = true; this.consejo('Dentro de la burbuja todo va lento: pulsa C justo cuando te llegue algo.', 3800); }
      } else if (pb.t <= 0) { pb.bub.destroy(); pb.bub = null; pb.estado = 'espera'; pb.t = 1.5; }
    } else if (pb.estado === 'dentro' && pb.t <= 0) {
      this.salirBurbuja();
      pb.estado = 'cd'; pb.t = 3.6;
    } else if (pb.estado === 'cd' && pb.t <= 0) { pb.estado = 'espera'; pb.t = 0.2; }
  }

  pintarBurbuja() {
    const g = this.burbuja;
    g.clear();
    const r = 86 + Math.sin(this.time.now / 200) * 3;
    g.fillStyle(0xbfeaff, 0.2).fillCircle(this.hx, this.hy, r);
    g.lineStyle(6, 0xffffff, 0.85).strokeCircle(this.hx, this.hy, r);
    g.lineStyle(7, 0xffffff, 0.8).beginPath().arc(this.hx, this.hy, r - 14, 3.4, 4.3).strokePath();
  }

  salirBurbuja() {
    if (!this.burbujaOn) return;
    this.burbujaOn = false;
    this.lento = false;
    this.burbuja.clear().setVisible(false);
    this.tweens.add({ targets: this.veloAzul, fillAlpha: 0, duration: 300 });
    sfx(this, 'pop', { volume: 0.4 });
    this.salpicar(this.hx, this.hy, 8, 0xbfeaff);
  }

  // ---------- Puky: llega el último, es bienvenido y se pega al amarillo ----------

  llegaPuky() {
    const im = this.add.image(-200, AM.suelo, this.textures.exists('puky-repta') ? 'puky-repta' : 'puky').setOrigin(0.5, 1);
    im.setScale(96 / im.height);
    this.en(this.capaEnem, im);
    this.pk = { img: im, estado: 'llega', t: 0, x: -200, y: AM.suelo, spot: null, abierto: false, idx: -1, aviso: null };
    this.tweens.add({ targets: im, scaleY: im.scaleY * 0.8, scaleX: im.scaleX * 1.08, duration: 240, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: im, x: 430, duration: 2500, ease: 'Sine.inOut', onComplete: () => this.pukiSalta() });
    this.time.delayedCall(500, () => this.voz({ x: 40, y: 480, active: true }, '¿Me llamabais?', 1700));
    this.time.delayedCall(2300, () => this.voz('blancaso', '…Esta vez sí.', 1800));
  }

  pukiSalta() {
    const pk = this.pk;
    if (!pk || !pk.img.active) return;
    this.tweens.killTweensOf(pk.img);
    const [x, y] = this.siguientePunto();
    pk.img.setTexture(this.textures.exists('puky-salto') ? 'puky-salto' : 'puky').setOrigin(0.5, 0.5);
    pk.img.setScale(130 / pk.img.height);
    pk.img.y = AM.suelo - 50;
    pk.estado = 'salta';
    pk.t = 0.7;
    pk.spot = { x, y };
    this.tweens.add({ targets: pk.img, x, duration: 700, ease: 'Sine.out' });
    this.tweens.add({ targets: pk.img, y, duration: 700, ease: 'Quad.out' });
    this.tweens.add({ targets: pk.img, angle: 360, duration: 700 });
  }

  siguientePunto() {
    const pk = this.pk;
    let i;
    do { i = Phaser.Math.Between(0, PUNTOS_PUKY.length - 1); } while (i === pk.idx);
    pk.idx = i;
    return PUNTOS_PUKY[i];
  }

  logicaPuky(dtE) {
    const pk = this.pk;
    if (!pk || pk.estado === 'llega') return;
    pk.t -= dtE;
    if (pk.estado === 'salta' && pk.t <= 0) {
      pk.img.setAngle(0);
      pk.estado = 'cerrado'; pk.t = 2.8 / Math.sqrt(this.dif);
      this.pegado(pk);
    } else if (pk.estado === 'cerrado' && pk.t <= 0) {
      pk.estado = 'aviso'; pk.t = 0.7;
      pk.aviso = this.en(this.capaAviso, this.add.circle(pk.spot.x, pk.spot.y, 84).setStrokeStyle(8, 0xfff6e8, 0.9));
      this.tweens.add({ targets: pk.aviso, scale: 1.25, alpha: 0.35, duration: 220, yoyo: true, repeat: 1 });
      this.tweens.add({ targets: pk.img, angle: 6, duration: 70, yoyo: true, repeat: 4 });
      sfx(this, 'campanita', { volume: 0.4 });
    } else if (pk.estado === 'aviso' && pk.t <= 0) {
      pk.estado = 'abierto'; pk.t = 3.6; pk.abierto = true;
      this.aturdido = true; this.cara('mareo', 99);
      if (pk.aviso) { pk.aviso.destroy(); pk.aviso = null; }
      const h = this.en(this.capaAviso, this.add.ellipse(pk.spot.x, pk.spot.y, 150, 150, 0x4a2a0a).setStrokeStyle(8, HEX.tinta));
      pk.hueco = h;
      pk.ring = this.en(this.capaAviso, this.add.circle(pk.spot.x, pk.spot.y, 82).setStrokeStyle(8, 0xff5fa2, 0.95));
      this.tweens.add({ targets: pk.ring, scale: 1.18, duration: 240, yoyo: true, repeat: -1 });
        sfx(this, 'oooh', { volume: 0.35 });
      golpeTexto(this, 640, 210, '¡Ahora!', COLOR.rosa, 52).setDepth(200);
    } else if (pk.estado === 'abierto' && pk.t <= 0) {
      this.cierraPuky();
    }
  }

  pegado(pk) {
    // Puky se pega: un chof y el gesto de «agarrado».
    this.tweens.add({ targets: pk.img, scaleX: pk.img.scaleX * 1.25, scaleY: pk.img.scaleY * 0.8, duration: 120, yoyo: true });
    sfx(this, 'chof', { volume: 0.4 });
    this.salpicar(pk.spot.x, pk.spot.y, 6);
  }

  cierraPuky() {
    const pk = this.pk;
    if (!pk) return;
    pk.abierto = false;
    this.aturdido = false;
    this.cara('idle', 0);
    if (pk.hueco) { pk.hueco.destroy(); pk.hueco = null; }
    if (pk.ring) { this.tweens.killTweensOf(pk.ring); pk.ring.destroy(); pk.ring = null; }
    if (this.hp <= 0) return;
    const [x, y] = this.siguientePunto();
    pk.spot = { x, y };
    pk.estado = 'salta'; pk.t = 0.6;
    this.ataqueT = 1.0;
    this.tweens.add({ targets: pk.img, x, duration: 600, ease: 'Sine.out' });
    this.tweens.add({ targets: pk.img, y, duration: 600, ease: 'Quad.out' });
    this.tweens.add({ targets: pk.img, angle: 360, duration: 600, onComplete: () => pk.img.setAngle(0) });
    sfx(this, 'boing', { volume: 0.3 });
  }

  puntoPuky() {
    const pk = this.pk;
    return pk && pk.abierto && pk.spot ? { x: pk.spot.x, y: pk.spot.y, r: 82 } : null;
  }

  // ---------- Granos de la fase 2 ----------

  nuevosGranos() {
    if (this.fase !== 2) return;
    while (this.boils.length < 2 && this.boilReserva > 0) {
      const libres = GRANOS.filter(([x, y]) => this.boils.every(b => Math.hypot(b.x - x, b.y - y) > 110));
      const [x, y] = Phaser.Utils.Array.GetRandom(libres.length ? libres : GRANOS);
      const hp = Math.min(6, this.boilReserva);
      this.boilReserva -= hp;
      const im = this.en(this.capaAviso, this.add.image(x, y, 'am-boil').setScale(0));
      const aro = this.en(this.capaAviso, this.add.circle(x, y, 52).setStrokeStyle(5, 0xfff6e8, 0.85));
      this.tweens.add({ targets: im, scale: 1, duration: 260, ease: 'Back.out' });
      this.tweens.add({ targets: aro, scale: 1.2, alpha: 0.3, duration: 450, yoyo: true, repeat: -1 });
      this.boils.push({ x, y, hp, max: hp, im, aro });
      sfx(this, 'chof', { volume: 0.3 });
    }
  }

  danarBoil(b, d, bx, by) {
    const real = Math.min(d, b.hp);
    b.hp -= real;
    this.hp -= real;
    b.im.setTintFill(0xffffff);
    this.time.delayedCall(45, () => { if (b.im.active) b.im.clearTint(); });
    this.salpicar(bx, by, 2);
    if (b.hp <= 0.001) {
      this.boils = this.boils.filter(o => o !== b);
      this.salpicar(b.x, b.y, 12, 0xe8832a);
      sfx(this, 'chof', { volume: 0.55 });
      if (typeof Comic !== 'undefined') Comic.impacto(this, b.x, b.y, { tam: 60, profundidad: 120 });
      b.im.destroy(); b.aro.destroy();
      if (this.hp > 0.001) this.prog(0.7, () => this.nuevosGranos());
    }
    if (this.hp <= 0.001) this.terminaFase();
  }

  // ---------- Daño al jefe ----------

  danoDe(b) {
    const f = this.fase;
    if (b.tipo === 'normal') return f === 3 ? 0.3 : 1;
    if (b.tipo === 'fuerte') return [0, 9, 6, 5, 7][f];
    return (b.rosa ? 2 : 1) * [0, 3, 3, 5, 5][f];
  }

  dentroCuerpo(b) {
    const J = AM.jefe;
    const dx = (b.x - J.cx) / (J.rx + b.r);
    const dy = (b.y - J.cy) / (J.ry + b.r);
    return dx * dx + dy * dy <= 1;
  }

  clank(b) {
    const ahora = this.time.now;
    if (ahora - this.ultimoClank > 220) { this.ultimoClank = ahora; sfx(this, 'bonk', { volume: 0.15 }); }
    const c = this.en(this.capaFx, this.add.circle(b.x, b.y, 10, 0xfff6e8, 0.9));
    this.tweens.add({ targets: c, scale: 2.4, alpha: 0, duration: 200, onComplete: () => c.destroy() });
  }

  // Devuelve true si la bala se gasta.
  impactaJefe(b) {
    if (this.trans) return this.dentroCuerpo(b);
    const f = this.fase;
    const d = this.danoDe(b);
    if (f === 2) {
      for (const g of this.boils) {
        if (Math.hypot(b.x - g.x, b.y - g.y) < 46 + b.r) { this.danarBoil(g, d, b.x, b.y); return true; }
      }
      if (this.dentroCuerpo(b)) {
        // Los granos están pegados al cuerpo: lo que va derecho a uno lo atraviesa (si no, el borde del cuerpo se lo comería).
        const carril = this.boils.length > 0 && (b.tipo === 'devuelta' || this.boils.some(g => g.x > b.x && Math.abs(b.y - g.y) < 46 + b.r));
        if (carril) return false;
        this.clank(b); return true;
      }
      return false;
    }
    if (f === 4) {
      const p = this.puntoPuky();
      if (p && Math.hypot(b.x - p.x, b.y - p.y) < p.r + b.r) { this.danarJefe(d, b); return true; }
      if (this.dentroCuerpo(b)) {
        // El punto abierto está dentro del cuerpo: lo que va derecho a él lo atraviesa.
        if (p && (b.tipo === 'devuelta' || (p.x > b.x && Math.abs(b.y - p.y) < p.r + b.r))) return false;
        if (b.tipo === 'devuelta') this.danarJefe(1.5, b); else this.clank(b);
        return true;
      }
      return false;
    }
    if (this.dentroCuerpo(b)) { this.danarJefe(d, b); return true; }
    return false;
  }

  danarJefe(d, b) {
    this.hp -= d;
    const fuerte = b.tipo !== 'normal';
    this.destelloJefe(fuerte);
    if (fuerte) {
      if (typeof Comic !== 'undefined') Comic.impacto(this, b.x, b.y, { tam: b.tipo === 'fuerte' ? 95 : 70, profundidad: 120 });
      sfx(this, 'golpe', { volume: 0.45 });
      this.salpicar(b.x, b.y, 12);
      this.cameras.main.shake(110, 0.004);
    } else if (Math.random() < 0.35) this.salpicar(b.x, b.y, 2);
    if (this.hp <= 0.001) this.terminaFase();
  }

  salpicar(x, y, n, col = 0xf5d23a) {
    for (let i = 0; i < n; i++) {
      const c = this.en(this.capaFx, this.add.circle(x, y, Phaser.Math.Between(4, 8), col).setStrokeStyle(2, HEX.tinta));
      const a = Math.random() * Math.PI * 2;
      const d = Phaser.Math.Between(30, 90);
      this.tweens.add({ targets: c, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d + 20, alpha: 0, duration: 340, ease: 'Quad.out', onComplete: () => c.destroy() });
    }
  }

  moverAmigas(dt) {
    this.amigas = this.amigas.filter(b => {
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.img.setPosition(b.x, b.y);
      if (b.giro) b.img.angle += b.giro * dt;
      if (this.impactaJefe(b)) { b.img.destroy(); return false; }
      if (b.x > ANCHO + 80 || b.x < -80 || b.y < -80 || b.y > ALTO + 80) { b.img.destroy(); return false; }
      return true;
    });
  }

  // ---------- Ataques del jefe ----------

  atacar(dtE) {
    if (this.trans || this.aturdido) return;
    if (this.fase === 4 && this.pk && (this.pk.estado !== 'cerrado' || this.pk.t < 1.2)) return;
    if (this.fase === 4 && !this.pk) return;
    this.ataqueT -= dtE;
    if (this.ataqueT > 0) return;
    if (!this.bolsa.length) {
      this.bolsa = Phaser.Utils.Array.Shuffle([...this.mazo]);
      if (this.bolsa.length > 1 && this.bolsa[this.bolsa.length - 1] === this.ultimoAtaque) this.bolsa.reverse();
    }
    const p = this.bolsa.pop();
    this.ultimoAtaque = p;
    const dur = { sudor: () => this.pSudor(), arcada: () => this.pArcada(), oleada: () => this.pOleada(), inclina: () => this.pInclina(), vueltas: () => this.pVueltas() }[p]();
    this.ataqueT = dur + FASES_AM[this.fase].pausa / this.dif;
  }

  // Marca en el suelo que avisa de dónde va a caer algo.
  marca(x, y, seg, tipo = 'x') {
    const g = this.add.graphics();
    if (tipo === 'x') {
      g.lineStyle(9, HEX.tinta, 1).lineBetween(-16, -16, 16, 16).lineBetween(16, -16, -16, 16);
      g.lineStyle(5, 0xffd23f, 1).lineBetween(-15, -15, 15, 15).lineBetween(15, -15, -15, 15);
    } else {
      g.fillStyle(0x7ad0ff, 0.45).fillEllipse(0, 0, 76, 16);
      g.lineStyle(4, 0xffffff, 0.8).strokeEllipse(0, 0, 76, 16);
    }
    g.setPosition(x, y);
    this.en(this.capaAviso, g);
    this.avisos.push(g);
    this.tweens.add({ targets: g, alpha: 0.35, duration: 120, yoyo: true, repeat: Math.max(1, Math.round(seg / 0.24)) });
    this.time.delayedCall(seg * 1000, () => { if (g.active) g.destroy(); });
  }

  columnas(n, sep) {
    const xs = [Phaser.Math.Clamp(this.hx + Phaser.Math.Between(-30, 30), AM.xMin, AM.xMax)];
    for (let i = 0; i < 60 && xs.length < n; i++) {
      const c = Phaser.Math.Between(AM.xMin, AM.xMax);
      if (xs.every(v => Math.abs(v - c) >= sep)) xs.push(c);
    }
    return Phaser.Utils.Array.Shuffle(xs);
  }

  lanzar({ clave, x, y, vx = 0, vy = 0, g = 0, r = 26, tipo = 'orbe', rosa = false, esc = 1, giro = 0 }) {
    const im = this.add.image(x, y, clave).setScale(esc);
    this.en(this.capaEnem, im);
    const p = { img: im, x, y, vx, vy, g, r, tipo, rosa, vivo: true, giro };
    this.enem.push(p);
    return p;
  }

  // Sudor frío: gotas que caen en columnas marcadas en el suelo.
  pSudor() {
    const n = (this.fase === 1 ? 3 : 4) + (this.nivel >= 3 ? 1 : 0);
    this.cara('tele', 0.7);
    this.sudorCara();
    const xs = this.columnas(n, 118);
    xs.forEach((x, i) => {
      this.prog(0.45 + i * 0.3, () => {
        this.marca(x, AM.suelo - 6, 0.85, 'sombra');
        sfx(this, 'goteo', { volume: 0.3 });
        const clave = this.textures.exists('fx-gota-sudor') ? 'fx-gota-sudor' : 'am-orbe';
        const im = this.lanzar({ clave, x, y: -60, vy: 300, g: 1400, r: 30, tipo: 'sudor', esc: clave === 'am-orbe' ? 1.3 : 86 / 320 });
        im.rosa = false;
      });
    });
    return 0.45 + n * 0.3 + 0.95;
  }

  sudorCara() {
    for (let i = 0; i < 4; i++) {
      const x = AM.jefe.x + Phaser.Math.Between(-150, 150);
      const y = AM.jefe.y - Phaser.Math.Between(330, 440);
      if (!this.textures.exists('fx-gota-sudor')) break;
      const d = this.en(this.capaFx, this.add.image(x, y, 'fx-gota-sudor').setScale(40 / 320));
      this.tweens.add({ targets: d, y: y + 70, alpha: 0, duration: 650, delay: i * 90, ease: 'Quad.in', onComplete: () => d.destroy() });
    }
  }

  // Arcadas: lo que escupe en arco, con marcas de dónde cae cada una.
  pArcada() {
    const n = this.nivel >= 2 ? 4 : 3;
    this.cara('tele', 0.85);
    sfx(this, 'arcada', { volume: 0.35 });
    const centro = Phaser.Math.Clamp(this.hx + Phaser.Math.Between(-60, 60), 140, 740);
    const paso = n === 4 ? 135 : 150;
    const rosa = Phaser.Math.Between(0, n - 1);
    for (let i = 0; i < n; i++) {
      const xt = Phaser.Math.Clamp(centro + (i - (n - 1) / 2) * paso, AM.xMin + 10, AM.xMax);
      this.marca(xt, AM.suelo - 8, 1.85 + i * 0.2, 'x');
      this.prog(0.85 + i * 0.2, () => {
        sfx(this, 'blurp', { volume: 0.35 });
        const x0 = 920; const y0 = 440; const T = 1.0; const g = 1100;
        const yt = AM.suelo - 26;
        const rosaa = i === rosa;
        this.lanzar({ clave: rosaa ? 'am-orbe-r' : 'am-orbe', x: x0, y: y0, vx: (xt - x0) / T, vy: (yt - y0) / T - 0.5 * g * T, g, r: 24, tipo: 'arco', rosa: rosaa, esc: 1.15, giro: 200 });
      });
    }
    if (!this.tipContra && this.fase === 1) {
      this.tipContra = true;
      this.prog(1.0, () => this.consejo('Las rosas se devuelven: pulsa C justo antes de que te toquen.', 4200));
    }
    return 0.85 + n * 0.2 + 1.1;
  }

  // Oleada amarilla: sube por el suelo desde el jefe. Se salta.
  pOleada() {
    const n = this.fase === 1 ? 1 : 2;
    this.cara('tele', 0.8);
    this.tweens.add({ targets: this.jefe, scaleY: 0.9, scaleX: 1.07, duration: 220, yoyo: true, delay: 300 });
    const flechas = this.en(this.capaAviso, this.add.text(1130, AM.suelo - 50, '◀ ◀ ◀', { fontFamily: FUENTE, fontSize: '54px', color: '#ffd23f', stroke: COLOR.tinta, strokeThickness: 10 }).setOrigin(0.5));
    this.avisos.push(flechas);
    this.tweens.add({ targets: flechas, alpha: 0.2, duration: 130, yoyo: true, repeat: 5 });
    this.time.delayedCall(850, () => { if (flechas.active) flechas.destroy(); });
    for (let i = 0; i < n; i++) {
      this.prog(0.9 + i * 1.3, () => {
        sfx(this, 'chapoteo', { volume: 0.4 });
        const p = this.lanzar({ clave: 'am-ola', x: AM.jefe.x - 20, y: AM.suelo + 6, vx: -(330 + 30 * this.fase), r: 0, tipo: 'ola', esc: 1 });
        p.img.setOrigin(0.5, 1);
        p.alto = 44;
        p.ancho = 40;
      });
    }
    return 0.9 + (n - 1) * 1.3 + 2.0;
  }

  // El suelo se inclina (fase 2): se avisa con un temblor corto y la sala cae hacia un lado.
  pInclina() {
    this.cara('tele', 1.0);
    const dir = Math.random() < 0.5 ? -1 : 1;
    this.consejoCorto('¡El suelo se inclina!');
    sfx(this, 'temblor', { volume: 0.3 });
    this.bal = { t: 0, dur: 0.9, amp: 0.018, per: 0.3, v: true };
    this.prog(0.9, () => { this.bal = null; this.rotObj = dir * 0.125; sfx(this, 'whoosh', { volume: 0.4 }); });
    this.prog(1.9, () => this.lanzarOla());
    this.prog(3.3, () => this.lanzarOla());
    this.prog(4.6, () => { this.rotObj = 0; });
    return 5.3;
  }

  lanzarOla() {
    const p = this.lanzar({ clave: 'am-ola', x: AM.jefe.x - 20, y: AM.suelo + 6, vx: -360, r: 0, tipo: 'ola', esc: 1 });
    p.img.setOrigin(0.5, 1);
    p.alto = 44; p.ancho = 40;
  }

  // La sala da vueltas (fase 3): se balancea, corto y avisado, mientras el jefe lanza una espiral.
  pVueltas() {
    this.cara('tele', 1.1);
    this.consejoCorto('¡La sala da vueltas!');
    sfx(this, 'temblor', { volume: 0.3 });
    this.bal = { t: 0, dur: 1.0, amp: 0.02, per: 0.35, v: true };
    this.prog(1.0, () => { this.bal = { t: 0, dur: 3.8, amp: 0.105, per: 2.3 }; });
    const n = this.nivel >= 3 ? 16 : 13;
    for (let i = 0; i < n; i++) {
      this.prog(1.3 + i * 0.17, () => {
        const a = Math.PI + 0.85 * Math.sin(i * 0.75) + 0.1;
        const rosa = i % 5 === 3;
        sfx(this, 'pop', { volume: 0.1 });
        this.lanzar({ clave: rosa ? 'am-orbe-r' : 'am-orbe', x: 940, y: 440, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, r: 24, tipo: 'orbe', rosa, esc: 1.05, giro: 160 });
      });
    }
    return 1.3 + n * 0.17 + 1.2;
  }

  consejoCorto(str) {
    const t = texto(this, ANCHO / 2 + 60, 292, str, 40, COLOR.amarillo).setDepth(175).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 150, yoyo: true, hold: 700, onComplete: () => t.destroy() });
  }

  // La sala: se inclina hacia un objetivo suave o se balancea (nunca más de unos 7 grados).
  inclinar(dtE) {
    if (this.bal) {
      const b = this.bal;
      b.t += dtE;
      if (b.t < b.dur) {
        // v = temblor corto de aviso; si no, un vaivén con entrada y salida suaves.
        this.rot = b.v ? b.amp * Math.sin(2 * Math.PI * b.t / b.per) : b.amp * Math.sin(Math.PI * b.t / b.dur) * Math.sin(2 * Math.PI * b.t / b.per);
        this.aplicarRot();
        return;
      }
      this.bal = null;
    }
    this.rot += (this.rotObj - this.rot) * Math.min(1, dtE * 7);
    if (Math.abs(this.rot) < 0.0005 && this.rotObj === 0) this.rot = 0;
    this.aplicarRot();
  }

  aplicarRot() {
    const r = this.rot;
    const px = ANCHO / 2; const py = AM.suelo;
    this.mundo.rotation = r;
    this.mundo.x = px - (px * Math.cos(r) - py * Math.sin(r));
    this.mundo.y = py - (px * Math.sin(r) + py * Math.cos(r));
  }

  // ---------- Proyectiles del jefe ----------

  moverEnemigos(dtE) {
    const piso = this.hy + AM.medio;
    this.enem = this.enem.filter(p => {
      if (!p.vivo) { p.img.destroy(); return false; }
      p.vy += p.g * dtE;
      p.x += p.vx * dtE;
      p.y += p.vy * dtE;
      p.img.setPosition(p.x, p.y);
      if (p.giro) p.img.angle += p.giro * dtE;
      if (p.tipo === 'ola') {
        p.img.y = AM.suelo + 6 + Math.sin(this.time.now / 90) * 1.5;
        if (Math.abs(p.x - this.hx) < p.ancho + 40 && piso > AM.suelo - p.alto) this.tocado();
        if (p.x < -140) { p.img.destroy(); return false; }
        return true;
      }
      const d = Math.hypot(p.x - this.hx, p.y - this.hy);
      if (this.parryT > 0 && d < p.r + 74) { this.devolver(p); return false; }
      if (d < p.r + 36) { this.tocado(); this.salpicar(p.x, p.y, 4); p.img.destroy(); return false; }
      if (p.y > AM.suelo - 8 && p.vy > 0) {
        const c = this.en(this.capaFx, this.add.ellipse(p.x, AM.suelo + 2, 54, 12, p.tipo === 'sudor' ? 0x7ad0ff : 0xf5d23a, 0.85));
        this.tweens.add({ targets: c, scaleX: 1.7, alpha: 0, duration: 520, onComplete: () => c.destroy() });
        p.img.destroy();
        return false;
      }
      if (p.x < -80 || p.x > ANCHO + 80 || p.y < -240) { p.img.destroy(); return false; }
      return true;
    });
  }

  // La contra: lo que te tiraban vuelve al jefe (mejor si es rosa).
  devolver(p) {
    this.parrys++;
    this.parryT = 0;
    this.invul = Math.max(this.invul, 0.35);
    let tx = AM.jefe.cx; let ty = AM.jefe.cy;
    if (this.fase === 2 && this.boils.length) {
      const g = this.boils.reduce((a, b) => (Math.hypot(a.x - p.x, a.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? a : b));
      tx = g.x; ty = g.y;
    }
    const pu = this.fase === 4 ? this.puntoPuky() : null;
    if (pu) { tx = pu.x; ty = pu.y; }
    const a = Math.atan2(ty - p.y, tx - p.x);
    p.img.destroy();
    const clave = p.rosa ? 'am-orbe-r' : 'am-orbe';
    const im = this.add.image(p.x, p.y, clave).setScale(1.5);
    this.en(this.capaBala, im);
    this.amigas.push({ img: im, x: p.x, y: p.y, vx: Math.cos(a) * 950, vy: Math.sin(a) * 950, tipo: 'devuelta', r: 26, rosa: p.rosa, giro: 500 });
    sfx(this, 'campanita', { volume: 0.5 });
    if (typeof Comic !== 'undefined') Comic.impacto(this, p.x, p.y, { tam: 55, profundidad: 120 });
    golpeTexto(this, this.hx + 30, this.hy - 90, p.rosa ? '¡CONTRA x2!' : '¡CONTRA!', COLOR.rosa, 34);
  }

  // ---------- Daño al héroe ----------

  tocado() {
    if (this.invul > 0 || !this.activo || this.trans) return;
    this.vida--;
    this.golpes++;
    this.golpeEnFase = true;
    this.invul = 1.5;
    this.pintarHud();
    sfx(this, 'golpe', { volume: 0.6 });
    sfx(this, 'chof', { volume: 0.4 });
    this.cameras.main.shake(120, 0.005);
    this.heroe.setTintFill(0xf5d23a);
    this.time.delayedCall(110, () => this.heroe.clearTint());
    this.salpicar(this.hx, this.hy, 6);
    this.vy = Math.min(this.vy, -320);
    this.suelo = false;
    if (this.vida <= 0) this.derrota();
  }

  // ---------- Fin de fase, victoria y derrota ----------

  limpiar() {
    this.enem.forEach(p => p.img.destroy());
    this.amigas.forEach(b => b.img.destroy());
    this.picks.forEach(p => { p.img.destroy(); p.aro.destroy(); });
    this.avisos.forEach(a => { if (a.active) a.destroy(); });
    this.boils.forEach(b => { b.im.destroy(); b.aro.destroy(); });
    this.enem = []; this.amigas = []; this.picks = []; this.avisos = []; this.boils = [];
    this.cola = [];
    this.tok++;
    this.salirBurbuja();
    if (this.pb && this.pb.bub) { this.pb.bub.destroy(); this.pb.bub = null; }
    this.bal = null; this.rotObj = 0;
  }

  terminaFase() {
    if (this.trans) return;
    this.trans = true;
    this.hp = 0;
    if (!this.golpeEnFase) this.limpias++;
    this.limpiar();
    this.aturdido = false;
    this.cara('golpe', 1.1);
    sfx(this, 'cristal', { volume: 0.5 });
    sfx(this, 'oooh', { volume: 0.35 });
    if (typeof Comic !== 'undefined') Comic.impacto(this, AM.jefe.cx - 40, AM.jefe.cy - 80, { tam: 110, profundidad: 120 });
    this.destelloJefe(true);
    this.cameras.main.shake(130, 0.005);
    if (this.fase === 4) { this.victoria(); return; }
    this.fasePasada = this.fase;
    this.time.delayedCall(1300, () => { if (this.activo) this.iniciarFase(this.fasePasada + 1); });
  }

  victoria() {
    this.activo = false;
    this.tok++;
    ESTADO.amarillo = null;
    if (typeof guardarPartida === 'function') guardarPartida();
    if (this.pk) {
      this.tweens.killTweensOf(this.pk.img);
      this.pk.img.destroy();
      [this.pk.hueco, this.pk.ring].forEach(o => { if (o && o.active) o.destroy(); });
    }
    if (this.ayudante) { this.ayudante.destroy(); this.ayudaTag.destroy(); }
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    this.cara('golpe', 3);
    sfx(this, 'deshinchar', { volume: 0.6 });
    sfx(this, 'chapoteo', { volume: 0.6 });
    // El amarillo se deshace en un charco.
    this.tweens.killTweensOf(this.jefe);
    this.tweens.add({ targets: this.jefe, scaleY: 0.08, scaleX: 1.2, alpha: 0.0, duration: 1500, ease: 'Quad.in' });
    for (let i = 0; i < 18; i++) {
      const x = AM.jefe.x + Phaser.Math.Between(-210, 210);
      const y = AM.jefe.y - Phaser.Math.Between(60, 420);
      const c = this.en(this.capaFx, this.add.ellipse(x, y, 16, 24, 0xf5d23a).setStrokeStyle(3, HEX.tinta));
      this.tweens.add({ targets: c, y: AM.suelo, alpha: 0.2, duration: 700 + i * 40, delay: i * 40, ease: 'Quad.in', onComplete: () => c.destroy() });
    }
    const charco = this.textures.exists('fx-charco-amarillo') ? this.add.image(AM.jefe.x, AM.suelo + 8, 'fx-charco-amarillo').setOrigin(0.5, 1).setScale(0.01, 0.01) : this.add.ellipse(AM.jefe.x, AM.suelo, 20, 10, 0xf5d23a);
    if (charco.height) charco.setScale(0);
    this.en(this.capaFx, charco);
    const ce = charco.height ? 460 / charco.width : 22;
    this.tweens.add({ targets: charco, scaleX: ce, scaleY: charco.height ? ce : 5, alpha: 0.9, duration: 1400, delay: 500, ease: 'Sine.out' });
    this.tweens.add({ targets: charco, alpha: 0, duration: 900, delay: 3000 });
    // Monchiman, en el suelo, con la máscara puesta.
    this.time.delayedCall(1100, () => {
      this.invul = 99;
      this.tweens.add({ targets: this.heroe, x: 880, y: AM.suelo - 44, angle: 84, scaleX: this.escH * 1.2, scaleY: this.escH * 1.2, duration: 700, ease: 'Sine.inOut' });
      this.hx = 880;
    });
    // Y todos alrededor.
    const gente = [['palicaso', 640, 150], ['lasslow', 730, 150], ['blancaso-esperanza', 790, 215], ['cotine', 1000, 170], ['pompa', 1080, 130], ['perico', 1170, 130], ['puky-repta', 935, 62]];
    this.time.delayedCall(1700, () => {
      gente.forEach(([k, x, h], i) => {
        if (!this.textures.exists(k)) return;
        const im = this.add.image(x, AM.suelo + 14, k).setOrigin(0.5, 1).setScale(0);
        this.en(this.capaFx, im);
        const e = h / im.height;
        this.tweens.add({ targets: im, scale: e, duration: 260, delay: i * 120, ease: 'Back.out', onStart: () => sfx(this, 'pop', { volume: 0.25 }) });
      });
    });
    this.time.delayedCall(3300, () => {
      sfx(this, 'aaah', { volume: 0.5 });
      this.voz({ x: 640, y: 380, active: true }, 'Quédate. Aquí, en el suelo.', 2400);
    });
    const puntos = Math.max(0, Math.round(900 + this.vida * 150 + this.limpias * 120 + this.parrys * 25 + this.fuertes * 15 - this.t * 3 - this.rein * 150));
    this.time.delayedCall(5500, () => panelFinal(this, {
      titulo: 'Se acabó el amarillo',
      linea: `Monchiman, en el suelo y todos alrededor. ${Math.round(this.t)} s, ${this.parrys} contras.`,
      puntos, clave: 'Amarillo',
    }));
  }

  derrota() {
    this.activo = false;
    this.tok++;
    const fase = this.fase;
    ESTADO.amarillo = { fase, ts: Date.now(), rein: this.rein + 1 };
    if (typeof guardarPartida === 'function') guardarPartida();
    this.limpiar();
    this.aturdido = false;
    this.cara('tele', 3);
    if (this.pk) { this.tweens.killTweensOf(this.pk.img); }
    // Blancaso te sienta un momento.
    this.tweens.add({ targets: this.heroe, y: AM.suelo - 44, angle: -14, duration: 400, ease: 'Sine.out' });
    if (this.textures.exists('blancaso-esperanza')) {
      const b = this.add.image(this.hx - 150, AM.suelo + 10, 'blancaso-esperanza').setOrigin(0.5, 1).setScale(0);
      this.en(this.capaFx, b);
      this.tweens.add({ targets: b, scale: 190 / b.height, duration: 300, ease: 'Back.out' });
    }
    this.time.delayedCall(500, () => this.voz({ x: Math.max(60, this.hx - 150), y: AM.suelo - 270, active: true }, 'Respira. Otra vez, desde aquí.', 1900));
    const prog = ((fase - 1) + (1 - Math.max(0, this.hp) / this.hpMax)) / 4;
    this.time.delayedCall(2300, () => panelFinal(this, {
      titulo: 'El amarillo te gana',
      linea: `Blancaso te sienta. Retomas en la fase ${fase} con un corazón más.`,
      puntos: Math.round(prog * 100), clave: 'Amarillo', gana: false,
    }));
  }
}

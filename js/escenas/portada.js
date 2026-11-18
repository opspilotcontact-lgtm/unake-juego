// La portada: la puerta de Unaké de noche, con el neón que parpadea y el reparto delante como en
// un cartel de grupo. Primero «Toca para entrar» (ese toque arranca la música: los navegadores no
// dejan sonar nada antes) con el título en grande y una cortina baja de humo; al entrar, el humo se
// abre, el título se va a su sitio y aparece el reparto. Cada personaje respira a su ritmo y, cada
// pocos segundos, uno hace lo suyo (baraja sin repetir, una voz a la vez). El humo de la calada de
// Vuper sube por el cartel: es el hilo que lo une todo.
// El menú se maneja con ratón, dedo o teclado (↑ ↓ y Enter).

const VERSION = 'v0.8';
const COL_IZQ = 330; // centro de la columna del título y el menú

// El reparto delante de la puerta: [clave, pose de base, x, y, alto, origenY, profundidad].
// La fila de atrás va más arriba y más pequeña; la Pompa flota y Palicaso cuelga en el aire.
const CARTEL = [
  { id: 'palicaso', clave: 'palicaso', x: 712, y: 372, alto: 150, oy: 0.5, d: 20, angulo: -12 },
  { id: 'pompa', clave: 'pompa', x: 1182, y: 352, alto: 150, oy: 0.5, d: 20 },
  { id: 'cotine', clave: 'cotine', x: 872, y: 590, alto: 195, oy: 1, d: 21 },
  { id: 'blancaso', clave: 'blancaso', x: 1180, y: 596, alto: 180, oy: 1, d: 21 },
  { id: 'lasslow', clave: 'lasslow-digno', x: 740, y: 726, alto: 190, oy: 1, d: 24 },
  { id: 'vuper', clave: 'vuper-fumando', x: 952, y: 734, alto: 215, oy: 1, d: 26 },
  { id: 'puky', clave: 'puky', x: 1112, y: 736, alto: 160, oy: 1, d: 25 },
  { id: 'perico', clave: 'perico', x: 1236, y: 728, alto: 185, oy: 1, d: 24 },
];

class Portada extends Phaser.Scene {
  constructor() { super('Portada'); }

  create(datos) {
    ESTADO.edadOk = true;
    this.sound.mute = !(ESTADO.opciones ? ESTADO.opciones.sonido !== false : true);
    // scene.start reutiliza la instancia: todo lo de la partida anterior se resetea aquí.
    this.entrado = false;
    this.cursor = null;
    this.encendido = false;
    this.tituloToca = null;
    this.tarjetaHoy = null;
    this.sub = null;
    this.cast = {};
    this.gagEnCurso = false;
    this.bolsaGags = [];
    this.opciones = [];
    this.acabada = !!ESTADO.circuloCerrado || historiaAcabada();
    this.fondo();
    this.teclas = this.input.keyboard.addKeys('UP,DOWN,W,S,ENTER,SPACE,E,ESC');
    this.panel = this.add.container(COL_IZQ, 0).setDepth(40);
    entrar(this, datos);
    // Si ya se ha entrado esta sesión (vuelta desde el juego), directo al menú.
    if (Portada.yaEntro) this.entrada(true); else this.tocaParaEntrar();
  }

  // ---------- El escenario ----------

  fondo() {
    // La puerta y el cartel de Unaké enteros, a la derecha.
    this.add.image(ANCHO / 2, 575, 'bg-fuera-apagado').setScale(1.25);
    this.neon = this.add.image(ANCHO / 2, 575, 'bg-fuera').setScale(1.25).setAlpha(0);
    // El neón parpadea a ratos, nunca con el mismo ritmo.
    const parpadeo = () => {
      if (this.encendido) this.tweens.add({ targets: this.neon, alpha: Phaser.Math.FloatBetween(0.25, 0.5), duration: 50, yoyo: true, repeat: Phaser.Math.Between(0, 2) });
      this.time.delayedCall(Phaser.Math.Between(2200, 5200), parpadeo);
    };
    this.time.delayedCall(2600, parpadeo);
    // Sombra a la izquierda para que título y menú se lean; la derecha queda viva.
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(HEX.tinta, 0.18).fillRect(0, 0, ANCHO, ALTO);
    for (let i = 0; i < 14; i++) g.fillStyle(HEX.tinta, 0.06).fillRect(0, 0, 700 - i * 34, ALTO);
    // Niebla suave a ras de suelo, detrás del reparto.
    for (let i = 0; i < 5; i++) {
      const n = this.add.image(Phaser.Math.Between(0, ANCHO), Phaser.Math.Between(610, 720), 'tex-niebla')
        .setScale(Phaser.Math.FloatBetween(2.2, 3.2), Phaser.Math.FloatBetween(0.8, 1.2)).setAlpha(0.22).setTint(0xb7a9cc).setDepth(5);
      this.tweens.add({ targets: n, x: n.x + Phaser.Math.Between(-220, 220), duration: Phaser.Math.Between(11000, 17000), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    // Chispas de neón que suben, pocas y solo por el lado de la puerta.
    this.add.particles(0, ALTO + 10, 'miga', {
      x: { min: 640, max: ANCHO }, speedY: { min: -30, max: -70 }, speedX: { min: -8, max: 8 }, scale: { start: 0.45, end: 0 },
      alpha: { start: 0.7, end: 0 }, lifespan: 6500, frequency: 520, tint: [0xff5fa2, 0x5ad1ff, 0xffd23f],
    }).setDepth(6);
  }

  encenderNeon() {
    this.encendido = true;
    this.tweens.chain({ targets: this.neon, tweens: [{ alpha: 1, duration: 70 }, { alpha: 0.15, duration: 80 }, { alpha: 1, duration: 110 }] });
  }

  // Bocanadas de humo de dibujo (contorno grueso) que se abren desde un punto.
  bocanada(x, y, { n = 8, radio = 120, escala = [0.25, 0.5], d = 28, ms = 900 } = {}) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3);
      const h = this.add.image(x, y, 'humo').setScale(0.08).setTint(Phaser.Utils.Array.GetRandom([0xe8e2f0, 0xcfc6dc, 0xb7a9cc])).setAlpha(0.95).setDepth(d);
      this.tweens.add({
        targets: h, x: x + Math.cos(a) * radio * Phaser.Math.FloatBetween(0.6, 1.2), y: y + Math.sin(a) * radio * 0.5 - 20,
        scale: Phaser.Math.FloatBetween(...escala), alpha: 0, duration: ms + Phaser.Math.Between(0, 300), ease: 'Cubic.out', onComplete: () => h.destroy(),
      });
    }
  }

  // ---------- El reparto ----------

  reparto(rapida) {
    CARTEL.forEach((p, i) => {
      if (!this.textures.exists(p.clave)) return;
      const img = this.add.image(p.x, p.y, p.clave).setOrigin(0.5, p.oy).setDepth(p.d);
      img.setScale(p.alto / img.height);
      if (p.angulo) img.setAngle(p.angulo);
      img.base = { x: p.x, y: p.y, clave: p.clave, esc: img.scaleX, alto: p.alto, oy: p.oy };
      this.cast[p.id] = img;
      // Entrada: suben desde abajo (o caen, los que flotan) uno detrás de otro.
      const desde = p.oy === 1 ? p.y + p.alto + 40 : p.y - 60;
      img.y = desde;
      img.setAlpha(p.oy === 1 ? 1 : 0);
      this.tweens.add({ targets: img, y: p.y, alpha: 1, duration: rapida ? 380 : 520, ease: 'Back.out', delay: (rapida ? 0 : 150) + i * 90, onComplete: () => this.respirar(p.id, img) });
    });
    // El humo de la calada de Vuper sube por delante del cartel.
    const v = this.cast.vuper;
    if (v) {
      this.humoVuper = this.add.particles(0, 0, 'humo', {
        speedY: { min: -38, max: -60 }, speedX: { min: -14, max: 10 }, scale: { start: 0.05, end: 0.32 }, alpha: { start: 0.55, end: 0 },
        rotate: { min: -20, max: 20 }, lifespan: 4200, frequency: 420, tint: [0xe8e2f0, 0xcfc6dc, 0xb7a9cc],
      }).setDepth(27);
      this.humoVuper.startFollow(v, 0.36 * v.base.alto, -0.93 * v.base.alto);
    }
    this.time.delayedCall(rapida ? 1600 : 2600, () => this.siguienteGag());
  }

  // Cada uno respira a su manera, con su propio ritmo.
  respirar(id, img) {
    const e = img.base.esc;
    const vivo = { targets: img, yoyo: true, repeat: -1, ease: 'Sine.inOut' };
    const ritmo = { palicaso: 1300, pompa: 2400, cotine: 1700, blancaso: 900, lasslow: 1500, vuper: 2100, puky: 700, perico: 1100 }[id] || 1500;
    if (id === 'pompa') {
      if (!img.flota) img.flota = this.tweens.add({ ...vivo, y: img.base.y - 14, duration: ritmo });
      img.vive = this.tweens.add({ ...vivo, scaleX: e * 1.04, scaleY: e * 0.97, duration: ritmo * 0.6 });
    } else if (id === 'palicaso') {
      if (!img.flota) img.flota = this.tweens.add({ ...vivo, y: img.base.y - 10, duration: ritmo * 1.4 });
      img.vive = this.tweens.add({ ...vivo, angle: -4, duration: ritmo });
    } else if (id === 'perico') {
      // Cabeceo de paloma: rápido, con pausa.
      img.vive = this.tweens.add({ ...vivo, angle: 4, duration: 160, hold: 120, repeatDelay: ritmo });
    } else if (id === 'blancaso') {
      // Tiembla un poco, siempre.
      img.vive = this.tweens.add({ ...vivo, x: img.base.x + 1.5, duration: 70 });
    } else {
      const fuerza = id === 'puky' ? 0.06 : 0.035;
      img.vive = this.tweens.add({ ...vivo, scaleY: e * (1 + fuerza), scaleX: e * (1 - fuerza * 0.7), duration: ritmo });
    }
  }

  // Cambia de pose sin perder el tamaño de la figura.
  pose(img, clave) {
    if (!img || !this.textures.exists(clave)) return;
    const vive = img.vive;
    if (vive) vive.pause();
    img.setTexture(clave);
    img.base.esc = img.base.alto / img.height;
    img.setScale(img.base.esc * 1.08, img.base.esc * 0.92);
    this.tweens.add({ targets: img, scaleX: img.base.esc, scaleY: img.base.esc, duration: 260, ease: 'Back.out', onComplete: () => { if (vive) { vive.remove(); this.respirar(this.idDe(img), img); } } });
  }

  idDe(img) { return Object.keys(this.cast).find(k => this.cast[k] === img); }

  // Bocadillo encima de alguien, sin tapar el menú ni salirse por arriba.
  decir(id, frase, ms = 2200) {
    const img = this.cast[id];
    if (!img) return;
    const arriba = img.base.oy === 1 ? img.base.y - img.base.alto : img.base.y - img.base.alto / 2;
    const b = bocadillo(this, img.base.x, 0, frase, { tam: 20, ancho: 280 }).setDepth(60);
    b.x = Phaser.Math.Clamp(img.base.x, 640 + b.anchoB / 2, ANCHO - 10 - b.anchoB / 2);
    b.y = Math.max(b.altoB / 2 + 6, arriba - b.altoB / 2 + 6);
    if (img.base.oy === 1) this.tweens.add({ targets: img, y: img.base.y - 10, duration: 110, yoyo: true });
    this.time.delayedCall(ms, () => { if (b.active) this.tweens.add({ targets: b, scale: 0, duration: 180, onComplete: () => b.destroy() }); });
  }

  // Los gags: uno cada pocos segundos, barajados sin repetir hasta agotar la lista.
  siguienteGag() {
    if (!this.sys.isActive()) return;
    if (!this.bolsaGags.length) this.bolsaGags = Phaser.Utils.Array.Shuffle(Object.keys(this.gags()));
    const g = this.bolsaGags.pop();
    const dura = this.gags()[g]() || 2600;
    this.time.delayedCall(dura + Phaser.Math.Between(1400, 2800), () => this.siguienteGag());
  }

  gags() {
    const c = this.cast;
    const volver = (img, ms) => this.time.delayedCall(ms, () => this.pose(img, img.base.clave));
    return {
      // El chiste de siempre, en tres voces.
      unake: () => {
        this.decir('vuper', '¿Vamos a Unaké?', 1500);
        this.time.delayedCall(1600, () => { this.pose(c.perico, 'perico-silbando'); this.decir('perico', '¿A una qué?', 1500); volver(c.perico, 1600); });
        this.time.delayedCall(3200, () => { this.pose(c.palicaso, 'palicaso-riendo'); this.decir('palicaso', '¡A una aso!', 1600); volver(c.palicaso, 1800); });
        return 5000;
      },
      calada: () => {
        this.pose(c.vuper, 'vuper-calada');
        this.time.delayedCall(900, () => {
          this.pose(c.vuper, 'vuper-fumando');
          this.bocanada(c.vuper.x + 70, c.vuper.y - 190, { n: 6, radio: 70, escala: [0.18, 0.32], d: 27, ms: 1300 });
          sfx(this, 'fup', { volume: 0.3 });
        });
        this.time.delayedCall(1500, () => this.decir('vuper', 'Vale, vale…', 1800));
        return 3300;
      },
      lasslow: () => {
        this.decir('lasslow', 'Soy un señor.', 1300);
        this.time.delayedCall(1400, () => {
          this.pose(c.lasslow, 'lasslow-risa-floja');
          this.decir('lasslow', 'JA… perdón.', 1500);
          sfx(this, 'risa-lasslow', { volume: 0.35 });
        });
        volver(c.lasslow, 3200);
        return 3300;
      },
      cotine: () => {
        this.pose(c.cotine, 'cotine-plop');
        sfx(this, 'nam', { volume: 0.35 });
        this.time.delayedCall(600, () => this.decir('cotine', '¿Qué? Tenía hambre.', 2000));
        volver(c.cotine, 2700);
        return 2800;
      },
      pompa: () => {
        // La Pompa contesta tarde: primero mira, y luego lo dice.
        this.pose(c.pompa, 'pompa-mira');
        this.time.delayedCall(1300, () => this.decir('pompa', 'Yo no, que exploto.', 1900));
        volver(c.pompa, 3300);
        return 3400;
      },
      blancaso: () => {
        this.pose(c.blancaso, 'blancaso-mareado');
        this.decir('blancaso', 'Lo apunto en rojo.', 1900);
        volver(c.blancaso, 2100);
        return 2300;
      },
      puky: () => {
        // Se esconde y sale por donde nadie le espera.
        const p = c.puky;
        if (!p) return 500;
        this.tweens.add({ targets: p, y: p.base.y + p.base.alto + 30, duration: 260, ease: 'Back.in', onComplete: () => {
          p.x = 830; p.setDepth(23);
          this.pose(p, 'puky-riendo');
          this.tweens.add({ targets: p, y: p.base.y, duration: 380, ease: 'Back.out', onComplete: () => {
            sfx(this, 'blurp', { volume: 0.25 });
            this.decir('puky', '¿Me llamabais?', 1800);
          } });
        } });
        // decir() usa la x de base: se mueve con él.
        p.base.x = 830;
        this.time.delayedCall(2900, () => {
          this.tweens.add({ targets: p, y: p.base.y + p.base.alto + 30, duration: 240, ease: 'Back.in', onComplete: () => {
            p.base.x = 1100; p.x = 1100; p.setDepth(25);
            this.pose(p, 'puky');
            this.tweens.add({ targets: p, y: p.base.y, duration: 360, ease: 'Back.out' });
          } });
        });
        return 3700;
      },
      // Palicaso se va de vuelta rápida por arriba como estrella fugaz y vuelve a su sitio.
      fugaz: () => {
        const p = c.palicaso;
        if (!p) return 500;
        if (p.flota) p.flota.pause();
        sfx(this, 'fiu', { volume: 0.3 });
        const rastro = this.time.addEvent({ delay: 45, repeat: 30, callback: () => {
          const h = this.add.image(p.x - 30, p.y + 20, 'miga').setTint(0xffd23f).setScale(1.1).setDepth(19);
          this.tweens.add({ targets: h, alpha: 0, scale: 0.2, duration: 450, onComplete: () => h.destroy() });
        } });
        this.tweens.chain({ targets: p, tweens: [
          { x: ANCHO + 120, y: 120, angle: 30, duration: 650, ease: 'Sine.in' },
          { x: 640, y: -120, duration: 10 },
          { x: p.base.x, y: p.base.y, angle: -12, duration: 600, ease: 'Back.out' },
        ], onComplete: () => { rastro.remove(); if (p.flota) p.flota.resume(); this.decir('palicaso', '¡Escucha, escucha!', 1700); } });
        return 3200;
      },
    };
  }

  // ---------- Toca para entrar ----------

  tocaParaEntrar() {
    // Una cortina baja de humo tapa la puerta; al entrar, se abre hacia los lados.
    this.cortina = [];
    for (let i = 0; i < 11; i++) {
      const h = this.add.image(i * 128 + Phaser.Math.Between(-20, 20), Phaser.Math.Between(560, 700), 'humo')
        .setScale(Phaser.Math.FloatBetween(1.1, 1.5)).setTint(Phaser.Utils.Array.GetRandom([0x8f7fae, 0x7a6b99, 0x9d8fb8])).setAlpha(0.9).setDepth(35);
      this.tweens.add({ targets: h, y: h.y - 12, duration: Phaser.Math.Between(1600, 2400), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.cortina.push(h);
    }
    const t = this.add.image(ANCHO / 2, 280, 'titulo').setScale(0.78).setDepth(30);
    this.brilloToca = this.add.image(ANCHO / 2, 280, 'titulo').setScale(0.8).setTintFill(0xff5fa2).setAlpha(0.2).setBlendMode(Phaser.BlendModes.ADD).setDepth(29);
    this.tweens.add({ targets: [t, this.brilloToca], scale: '+=0.02', duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const toca = texto(this, ANCHO / 2, 520, this.sys.game.device.input.touch ? 'Toca para entrar' : 'Pulsa una tecla para entrar', 34, COLOR.amarillo).setDepth(36);
    this.tweens.add({ targets: toca, alpha: 0.45, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tituloToca = t;
    const entrar = () => {
      if (this.entrado) return;
      this.entrado = true;
      Portada.yaEntro = true;
      this.tweens.killTweensOf([toca, ...this.cortina]);
      this.tweens.add({ targets: toca, alpha: 0, duration: 200, onComplete: () => toca.destroy() });
      // El humo se abre: la mitad a cada lado.
      this.cortina.forEach(h => this.tweens.add({ targets: h, x: h.x + (h.x < ANCHO / 2 ? -500 : 500), y: h.y + 40, alpha: 0, duration: 800, ease: 'Cubic.in', onComplete: () => h.destroy() }));
      sfx(this, 'neon', { volume: 0.5 });
      sfx(this, 'whoosh', { volume: 0.4 });
      this.entrada(false);
    };
    this.input.once('pointerdown', entrar);
    this.input.keyboard.once('keydown', entrar);
  }

  // El título se va a su sitio con una bocanada, se enciende el neón, sube el reparto y entra el menú.
  entrada(rapida) {
    Musica.poner(this, 'portada');
    this.encenderNeon();
    const X = COL_IZQ, Y = 128, ESC = 0.6;
    let t = this.tituloToca;
    if (t) {
      this.tweens.killTweensOf([t, this.brilloToca]);
      this.brilloToca.destroy();
      this.bocanada(t.x, t.y, { n: 10, radio: 260, escala: [0.4, 0.7], d: 31, ms: 700 });
      this.tweens.add({ targets: t, x: X, y: Y, scale: ESC, duration: 560, ease: 'Cubic.inOut', onComplete: () => {
        this.bocanada(X, Y + 70, { n: 7, radio: 200, escala: [0.25, 0.45], d: 28, ms: 900 });
        sfx(this, 'boing', { volume: 0.4 });
      } });
    } else {
      t = this.add.image(X, Y, 'titulo').setScale(ESC).setDepth(30);
    }
    this.titulo = t;
    const brillo = this.add.image(X, Y, 'titulo').setScale(ESC * 1.03).setTintFill(0xff5fa2).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(29);
    this.brillo = brillo;
    const espera = rapida ? 0 : 560;
    this.time.delayedCall(espera, () => {
      // El logo respira y su brillo late como el neón.
      brillo.setAlpha(0.12);
      this.tweens.add({ targets: [t, brillo], scaleX: '*=1.015', scaleY: '*=1.015', duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: brillo, alpha: 0.02, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.subtitulo();
      this.huevo();
    });
    this.time.delayedCall(rapida ? 0 : 250, () => this.reparto(rapida));
    this.time.delayedCall(rapida ? 0 : 520, () => {
      this.panel.x = -400;
      this.tweens.add({ targets: this.panel, x: COL_IZQ, duration: 460, ease: 'Back.out' });
      this.menu();
      // La firma y la versión, discretas.
      // Arriba a la derecha, bajo la versión: abajo se montaba sobre Puky y Perico.
      const firma = this.add.text(ANCHO - 14, 34, this.acabada ? 'Has vuelto.' : 'Todo es humo · Aquí nadie juzga', {
        fontFamily: FUENTE, fontSize: `${tamMovil(16)}px`, color: COLOR.rosa, stroke: COLOR.tinta, strokeThickness: 5,
      }).setOrigin(1, 0).setDepth(45);
      firma.setAlpha(0);
      this.tweens.add({ targets: firma, alpha: 0.9, duration: 600, delay: 400 });
      this.add.text(ANCHO - 10, 8, VERSION, { fontFamily: FUENTE, fontSize: '12px', color: COLOR.crema }).setOrigin(1, 0).setAlpha(0.3).setDepth(45);
    });
  }

  // El subtítulo. Con la historia acabada cambia y llega medio segundo tarde (como la Pompa).
  subtitulo() {
    const sub = this.acabada
      ? texto(this, COL_IZQ, 250, '…De los hermanos Aso.', 26, '#bdf4ff')
      : texto(this, COL_IZQ, 250, 'La noche más larga de la aso', 26, COLOR.crema);
    sub.setDepth(30).setAlpha(0);
    this.sub = sub;
    this.tweens.add({ targets: sub, alpha: 1, y: { from: 262, to: 250 }, duration: 420, delay: this.acabada ? 500 : 0, ease: 'Cubic.out' });
  }

  // Huevo de pascua (historia acabada): 5 toques al logo y Perico asoma: «¿Una qué? ¿Una qué?».
  // Con 10, «Pin pin.», y no vuelve a salir en la sesión.
  huevo() {
    if (!this.acabada || Portada.huevoGastado) return;
    let toques = 0;
    this.titulo.setInteractive({ useHandCursor: false });
    this.titulo.on('pointerdown', () => {
      if (Portada.huevoGastado) return;
      toques++;
      this.tweens.add({ targets: this.titulo, angle: Phaser.Math.Between(-3, 3), duration: 70, yoyo: true });
      if (toques !== 5 && toques !== 10) return;
      const frase = toques === 5 ? '¿Una qué? ¿Una qué?' : 'Pin pin.';
      if (toques === 10) Portada.huevoGastado = true;
      const p = this.add.image(-40, 300, 'perico-cotilleando').setOrigin(0.5).setDepth(46).setAngle(28);
      p.setScale(170 / p.height);
      sfx(this, 'pin-pin', { volume: 0.4 });
      this.tweens.add({ targets: p, x: 40, duration: 300, ease: 'Back.out', onComplete: () => {
        const b = bocadillo(this, 210, 250, frase, { tam: 20, ancho: 260, cola: 'izq' }).setDepth(61);
        this.time.delayedCall(1800, () => {
          if (b.active) this.tweens.add({ targets: b, scale: 0, duration: 160, onComplete: () => b.destroy() });
          this.tweens.add({ targets: p, x: -80, duration: 260, ease: 'Back.in', onComplete: () => p.destroy() });
        });
      } });
    });
  }

  // ---------- El menú ----------

  limpiar() {
    this.panel.removeAll(true);
    this.opciones = [];
    this.sel = 0;
  }

  // Con un submenú abierto el título se aparta para que no se pisen.
  apartarTitulo(apartar) {
    [this.titulo, this.brillo, this.sub].forEach(o => o && this.tweens.add({ targets: o, alpha: apartar ? 0 : (o === this.brillo ? 0.1 : 1), duration: 200 }));
  }

  marco(alto) {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(-286, -alto / 2 + 10, 580, alto, 30);
    g.fillStyle(HEX.tinta, 0.92).fillRoundedRect(-290, -alto / 2, 580, alto, 30);
    g.lineStyle(4, HEX.rosa, 0.8).strokeRoundedRect(-290, -alto / 2, 580, alto, 30);
    g.lineStyle(2, HEX.azul, 0.5).strokeRoundedRect(-282, -alto / 2 + 8, 564, alto - 16, 24);
    this.panel.add(g);
  }

  opcion(y, etiqueta, accion, { color = HEX.amarillo, sub = '', ancho = 440, alto, tam = 24 } = {}) {
    const b = boton(this, 0, y, etiqueta, () => { sfx(this, 'pop', { volume: 0.4 }); accion(); }, { ancho, alto: alto || (sub ? 74 : 60), tam, color });
    if (sub) {
      b.etiqueta.setY(-12);
      b.add(this.add.text(0, 18, sub, { fontFamily: FUENTE, fontSize: '14px', color: '#3d3350' }).setOrigin(0.5));
    }
    b.anchoSel = ancho;
    this.panel.add(b);
    this.opciones.push({ b, accion });
    b.on('pointerover', () => { this.sel = this.opciones.findIndex(o => o.b === b); this.resaltar(); });
    return b;
  }

  // El botón principal: grande, con la portada del capítulo y cómo va la partida.
  principal(y, etiqueta, lineas, arte, accion) {
    const k = MOVIL ? 1.18 : 1;
    const ancho = 540, alto = Math.round(132 * k);
    const c = this.add.container(0, y);
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(-ancho / 2 + 5, -alto / 2 + 9, ancho, alto, 26);
    g.fillStyle(HEX.amarillo, 1).fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 26);
    g.lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 26);
    c.add(g);
    let x0 = -ancho / 2 + 26;
    if (arte && this.textures.exists(arte)) {
      const aw = Math.round(170 * k), ah = Math.round(96 * k);
      const ax = -ancho / 2 + 16 + aw / 2;
      // La portada del capítulo, recortada al hueco (centrada) sin máscaras que se descoloquen.
      const img = this.add.image(ax, 0, arte);
      const esc = Math.max(aw / img.width, ah / img.height);
      const cw = aw / esc, ch = ah / esc;
      img.setCrop((img.width - cw) / 2, (img.height - ch) / 2, cw, ch).setScale(esc);
      c.add(img);
      c.add(this.add.graphics().lineStyle(5, HEX.tinta, 1).strokeRect(ax - aw / 2, -ah / 2, aw, ah));
      x0 = ax + aw / 2 + 18;
    }
    c.add(this.add.text(x0, -alto / 2 + 16 * k, etiqueta, { fontFamily: FUENTE, fontSize: `${Math.round(32 * k)}px`, color: COLOR.tinta }));
    lineas.forEach((l, i) => c.add(this.add.text(x0, -alto / 2 + (62 + i * 26) * k, l, {
      fontFamily: FUENTE, fontSize: `${Math.round((i ? 15 : 17) * k)}px`, color: i ? '#4a3d5c' : '#2a1d3a', wordWrap: { width: ancho / 2 + ancho / 2 - (x0 + ancho / 2) - 16 },
    })));
    c.setSize(ancho, alto).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => { sfx(this, 'pop', { volume: 0.4 }); accion(); });
    c.on('pointerover', () => { this.sel = this.opciones.findIndex(o => o.b === c); this.resaltar(); });
    c.anchoSel = ancho;
    c.altoSel = alto;
    this.panel.add(c);
    this.opciones.push({ b: c, accion });
    return c;
  }

  resaltar() {
    this.opciones.forEach((o, i) => o.b.setScale(i === this.sel ? (o.b.altoSel ? 1.03 : 1.06) : 1).setAlpha(i === this.sel ? 1 : 0.86));
    if (!this.cursor) {
      this.cursor = this.add.text(0, 0, '▸', { fontFamily: 'Arial', fontSize: '38px', color: COLOR.amarillo, stroke: COLOR.tinta, strokeThickness: 6 }).setOrigin(0.5).setDepth(41);
      this.tweens.add({ targets: this.cursor, x: '+=0', alpha: 0.45, duration: 420, yoyo: true, repeat: -1 });
    }
    this.colocarCursor();
  }

  colocarCursor() {
    const o = this.opciones[this.sel];
    if (!this.cursor || !o) return;
    this.cursor.setPosition(this.panel.x + o.b.x - (o.b.anchoSel || 440) / 2 - 22, this.panel.y + o.b.y).setVisible(true);
  }

  update() {
    if (!this.opciones || !this.opciones.length) return;
    this.colocarCursor();
    const k = this.teclas;
    const pulsado = t => Phaser.Input.Keyboard.JustDown(t);
    if (pulsado(k.DOWN) || pulsado(k.S)) { this.sel = (this.sel + 1) % this.opciones.length; this.resaltar(); sfx(this, 'pop', { volume: 0.2 }); }
    if (pulsado(k.UP) || pulsado(k.W)) { this.sel = (this.sel + this.opciones.length - 1) % this.opciones.length; this.resaltar(); sfx(this, 'pop', { volume: 0.2 }); }
    if (pulsado(k.ENTER) || pulsado(k.SPACE) || pulsado(k.E)) this.opciones[this.sel].accion();
    if (pulsado(k.ESC) && this.volver) this.volver();
  }

  menu() {
    this.limpiar();
    this.volver = null;
    this.panel.y = 0;
    this.apartarTitulo(false);
    const hay = ESTADO.introVista;
    const sec = { ancho: 380, alto: MOVIL ? 54 : 50, tam: 22 };
    const paso = sec.alto + (MOVIL ? 8 : 12);
    if (hay) {
      const acabada = this.acabada;
      const cap = acabada ? null : capituloActual();
      const linea1 = acabada ? (MOVIL ? 'Modo libre' : 'Modo libre · el barrio sigue abierto') : `Cap. ${etiquetaCap(ESTADO.capitulo || 0)} · ${cap.titulo}`;
      const linea2 = `${ESTADO.monchis} monchis · hucha ${ESTADO.hucha || 0}/${META_HUCHA}`;
      const arte = acabada ? 'cap-epica' : (cap && cap.arte);
      const yP = MOVIL ? 372 : 362;
      this.principal(yP, 'Seguir la noche', [linea1, linea2], arte, () => this.seguir());
      const y1 = yP + (MOVIL ? 78 : 66) + sec.alto / 2 + 14;
      const resto = [['Partida nueva', () => this.confirmarNueva(), HEX.rosa], ['Ver la intro', () => irA(this, 'Intro'), HEX.crema],
        ['Opciones', () => this.ajustes(), HEX.azul], ['Créditos', () => this.creditos(), HEX.crema]];
      // Tras el final, «la cuenta de la noche» se puede volver a ver (al final de la lista: no cambia el orden de las demás).
      if (acabada) resto.push(['La cuenta de la noche', () => irA(this, 'Cuenta', { desdePortada: true }), HEX.amarillo]);
      // En el móvil (y en el PC con 5 filas), en rejilla de 2 columnas para que quepan.
      const rejilla = MOVIL || resto.length > 4;
      resto.forEach(([et, acc, color], i) => {
        const b = this.opcion(rejilla ? y1 + Math.floor(i / 2) * paso : y1 + paso * i, et, acc, rejilla ? { ...sec, ancho: 258, color } : { ...sec, color });
        if (rejilla) b.x = i % 2 ? 136 : -136;
        if (et.length > 16 && b.etiqueta) { b.etiqueta.setWordWrapWidth(null); if (b.etiqueta.width > 230) b.etiqueta.setScale(230 / b.etiqueta.width); } // una línea
      });
      this.hoy();
    } else {
      const yP = 380;
      this.principal(yP, 'Empezar la noche', [`Una historia en ${totalCapitulos()} capítulos`, 'Solo para mayores de 18'], 'cap-cap1', () => { this.completaEnMovil(); irA(this, 'Intro'); });
      const y1 = yP + (MOVIL ? 78 : 66) + sec.alto / 2 + 18;
      this.opcion(y1, 'Opciones', () => this.ajustes(), { ...sec, color: HEX.azul });
      this.opcion(y1 + paso, 'Créditos', () => this.creditos(), { ...sec, color: HEX.crema });
    }
    this.resaltar();
  }

  // «Hoy en Unaké»: cómo va la partida, en una línea discreta debajo del menú.
  hoy() {
    if (this.tarjetaHoy) this.tarjetaHoy.destroy();
    actualizarNegocio();
    const cn = cuentasNegocio();
    const caja = Math.floor(negocio().caja);
    const retos = retosDeHoy().lista.filter(r => r.hecho).length;
    const logros = LOGROS.filter(l => (ESTADO.logros || {})[l.id]).length;
    const linea = `${totalEstrellas()} estrellas · ${cn.rango}${cn.total ? ` · caja ${caja}` : ''} · retos de hoy ${retos}/3 · logros ${logros}/${LOGROS.length}`;
    const t = this.add.text(14, ALTO - 10, linea, {
      fontFamily: FUENTE, fontSize: `${tamMovil(15)}px`, color: COLOR.amarillo, stroke: COLOR.tinta, strokeThickness: 5,
    }).setOrigin(0, 1).setDepth(45).setAlpha(0);
    if (t.width > 640) t.setScale(640 / t.width);
    this.tweens.add({ targets: t, alpha: 0.85, duration: 500, delay: 300 });
    this.tarjetaHoy = t;
  }

  completaEnMovil() {
    if (this.sys.game.device.input.touch && !this.scale.isFullscreen) { try { this.scale.startFullscreen(); } catch (e) { /* el navegador puede negarse */ } }
  }

  seguir() {
    this.completaEnMovil();
    sfx(this, 'campanita');
    irA(this, 'Barrio');
  }

  submenu(y) {
    this.limpiar();
    this.panel.y = y;
    this.apartarTitulo(true);
    if (this.tarjetaHoy) this.tarjetaHoy.setAlpha(0);
    this.volver = () => { this.menu(); };
  }

  confirmarNueva() {
    this.submenu(380);
    this.marco(300);
    this.panel.add(texto(this, 0, -100, '¿Empezar de cero?', 32, COLOR.rosa));
    this.panel.add(this.add.text(0, -48, 'Se borra la partida: historia, monchis, estrellas, inventos y negocio.', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema, align: 'center', wordWrap: { width: 480 } }).setOrigin(0.5));
    this.opcion(30, 'Sí, partida nueva', () => {
      const opciones = ESTADO.opciones;
      ESTADO = structuredClone(ESTADO_INICIAL);
      Object.assign(ESTADO, { edadOk: true, opciones });
      guardarPartida();
      this.completaEnMovil();
      irA(this, 'Intro');
    }, { color: HEX.rosa });
    this.opcion(104, 'No, volver (Esc)', () => this.menu(), { color: HEX.crema });
    this.sel = 1;
    this.resaltar();
  }

  ajustes() {
    this.submenu(370);
    this.marco(520);
    ESTADO.opciones = ESTADO.opciones || { sonido: true };
    const o = ESTADO.opciones;
    this.panel.add(texto(this, 0, -196, 'Opciones', 32, COLOR.azul));
    // Cada botón va pasando por sus valores al pulsarlo.
    const pct = v => `${Math.round(v * 100)} %`;
    const ciclo = (lista, v) => lista[(lista.indexOf(v) + 1) % lista.length];
    const NIVELES = [0, 0.25, 0.5, 0.75, 1];
    const VELOCIDADES = { lenta: 'Lenta', normal: 'Normal', rapida: 'Rápida' };
    const musica = this.opcion(-134, `Música: ${pct(o.musica ?? 0.6)}`, () => {
      o.musica = ciclo(NIVELES, NIVELES.reduce((a, b) => (Math.abs(b - (o.musica ?? 0.6)) < Math.abs(a - (o.musica ?? 0.6)) ? b : a)));
      Musica.ajustar();
      guardarPartida();
      musica.etiqueta.setText(`Música: ${pct(o.musica)}`);
    }, { color: HEX.amarillo });
    const efectos = this.opcion(-76, `Efectos: ${pct(o.efectos ?? 1)}`, () => {
      o.efectos = ciclo(NIVELES, o.efectos ?? 1);
      guardarPartida();
      sfx(this, 'pop');
      efectos.etiqueta.setText(`Efectos: ${pct(o.efectos)}`);
    }, { color: HEX.amarillo });
    const texto_ = this.opcion(-18, `Texto de las escenas: ${VELOCIDADES[o.texto || 'normal']}`, () => {
      o.texto = ciclo(Object.keys(VELOCIDADES), o.texto || 'normal');
      guardarPartida();
      texto_.etiqueta.setText(`Texto de las escenas: ${VELOCIDADES[o.texto]}`);
    }, { color: HEX.rosa });
    const sonido = this.opcion(40, `Sonido: ${o.sonido !== false ? 'Sí' : 'No'}`, () => {
      o.sonido = o.sonido === false;
      this.sound.mute = !o.sonido;
      guardarPartida();
      sonido.etiqueta.setText(`Sonido: ${o.sonido ? 'Sí' : 'No'}`);
    }, { color: HEX.crema });
    const secundarios = this.opcion(98, `Encargos secundarios: ${o.secundarios !== false ? 'Sí' : 'No'}`, () => {
      o.secundarios = o.secundarios === false;
      guardarPartida();
      secundarios.etiqueta.setText(`Encargos secundarios: ${o.secundarios ? 'Sí' : 'No'}`);
    }, { color: HEX.azul });
    this.opcion(156, this.scale.isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa', () => {
      if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen();
      this.time.delayedCall(300, () => this.ajustes());
    }, { color: HEX.verde });
    this.opcion(214, 'Volver (Esc)', () => this.menu(), { color: HEX.crema });
    this.resaltar();
  }

  creditos() {
    this.submenu(370);
    this.marco(380);
    this.panel.add(texto(this, 0, -150, 'Créditos', 32, COLOR.amarillo));
    const lineas = [
      'UNAKÉ · una serie de VOPPË',
      'Vuper, Palicaso, Blancaso, Perico, Cotine, la Pompa, Lasslow y Puky',
      'Música: «Whistling through the quiet night» y temas de Kevin MacLeod (incompetech.com), CC BY 4.0',
      `Juego hecho con Phaser · ${VERSION}, prueba para los amigos`,
      '«¿Vamos a Unaké?» «¿A una qué?» «A una aso.»',
    ];
    this.panel.add(this.add.text(0, -40, lineas.join('\n\n'), { fontFamily: FUENTE, fontSize: '17px', color: COLOR.crema, align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5));
    this.opcion(140, 'Volver (Esc)', () => this.menu(), { color: HEX.crema });
    this.resaltar();
  }
}

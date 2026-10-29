// Liar: primer plano sobre la bandeja de VOPPË, con tus manos (guantes de tela en el mundo normal,
// manos de nube en el humo; generadas en Gemini el 29/10/2026). Seis pasos, cada uno con su gesto:
//   1. Picar: aporrear; las manos desmenuzan y cae al montón.
//   2. La boquilla: la mano la lleva de un lado a otro sobre el papel; pulsar cuando esté en la marca.
//   3. Rellenar: mantener; la mano espolvorea recorriendo el papel; soltar en la zona verde.
//   4. Liar: aporrear; las manos enrollan.
//   5. Pegar: pulsar en el centro; las manos aprietan la costura.
//   6. Encender: insistir con el mechero, que falla, como todos.
// La nota media dice qué tal ha quedado y decide cuánto dura y cuánto sube el porro en el sofá.

const PAPEL = { x: 640, y: 400, ancho: 520, alto: 160 };
const MONTON = { x: 340, y: 560 };
const PASOS_LIAR = [
  { id: 'picar', titulo: 'Pica', ayuda: 'Aporrea ESPACIO (o toca) para desmenuzar' },
  { id: 'boquilla', titulo: 'La boquilla', ayuda: 'Pulsa cuando la boquilla esté sobre la marca verde' },
  { id: 'rellenar', titulo: 'Rellena', ayuda: 'MANTÉN para echar y suelta en la zona verde' },
  { id: 'liar', titulo: 'Lía', ayuda: 'Aporrea para enrollar' },
  { id: 'pegar', titulo: 'Pega', ayuda: 'Pulsa cuando la marca esté en el centro' },
  { id: 'encender', titulo: 'Enciende', ayuda: 'Dale al mechero hasta que prenda' },
];
// Las manos: ancho en pantalla y punto de trabajo (yemas, boquilla, porro o llama) como origen,
// medido sobre cada imagen con una rejilla del 10 % (29/10/2026).
const MANOS = {
  normal: { pref: 'mano-n', ancho: { 1: 470, 3: 430, 4: 720, 5: 720, 6: 380 }, origen: { 1: [0.5, 0.2], 3: [0.39, 0.27], 4: [0.5, 0.38], 5: [0.5, 0.42], 6: [0.48, 0.25] } },
  humo: { pref: 'mano-h', ancho: { 1: 380, 3: 210, 4: 580, 5: 580, 6: 240 }, origen: { 1: [0.5, 0.45], 3: [0.08, 0.42], 4: [0.5, 0.35], 5: [0.5, 0.25], 6: [0.7, 0.1] } },
};

class Liar extends Phaser.Scene {
  constructor() { super('Liar'); }

  create(datos) {
    this.datos = datos || {};
    this.normal = this.datos.mundo === 'normal';
    this.paso = -1;
    this.notas = [];
    this.estado = { picado: 0, relleno: 0, enrollado: 0, boquilla: null, sellado: false, encendido: false, enManos: false };

    fondo(this, this.normal ? 'bgn-sofa' : 'bg-sofa');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.55);
    // La bandeja de VOPPË, con la bolsita abierta en una esquina.
    const b = this.add.graphics();
    b.fillStyle(0x000000, 0.35).fillRoundedRect(182, 226, 940, 440, 46);
    b.fillStyle(HEX.tinta, 1).fillRoundedRect(170, 210, 940, 440, 46);
    b.fillStyle(0xc77dff, 1).fillRoundedRect(184, 222, 912, 414, 38);
    b.fillStyle(0xb066f0, 1).fillRoundedRect(214, 252, 852, 354, 28);
    this.add.text(1040, 590, 'VOPPË', { fontFamily: FUENTE, fontSize: '34px', color: '#9a52d8' }).setOrigin(1, 0.5);
    this.add.image(250, 300, 'obj-bolsita').setScale(0.8).setAngle(-18);
    this.g = this.add.graphics().setDepth(2);
    this.boquillaImg = this.add.image(0, 0, 'obj-boquilla').setVisible(false).setDepth(3);
    this.llama = this.add.container(0, 0).setVisible(false).setDepth(4);
    this.mano = this.add.image(0, 0, `${MANOS[this.normal ? 'normal' : 'humo'].pref}-1`).setVisible(false).setDepth(10);

    this.titulo = texto(this, ANCHO / 2, 64, '', 52, COLOR.amarillo).setDepth(20);
    this.ayuda = texto(this, ANCHO / 2, 128, '', 26, COLOR.crema, 1000).setDepth(20);
    this.puntitos = PASOS_LIAR.map((_, i) => this.add.circle(ANCHO / 2 - 125 + i * 50, 172, 10, 0x3d3350).setStrokeStyle(3, HEX.tinta).setDepth(20));
    this.medidor = this.add.container(0, 0).setDepth(15);

    this.teclas = this.input.keyboard.addKeys('SPACE,LEFT,RIGHT,ENTER');
    this.pulsando = false;
    this.input.on('pointerdown', (_p, sobre) => { if (sobre.length) return; this.pulsando = true; this.pulsar(); });
    this.input.on('pointerup', () => { this.pulsando = false; this.soltar(); });
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.pulsar(); });
    this.input.keyboard.on('keydown-LEFT', () => this.pulsar(true));
    this.input.keyboard.on('keydown-RIGHT', () => this.pulsar(true));
    this.input.keyboard.on('keyup-SPACE', () => this.soltar());

    this.pintar();
    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 500, () => this.siguiente());
  }

  // ---------- Las manos ----------

  // Saca la mano n con su punto de trabajo en (x, y). En el mundo normal entra desde abajo
  // (son tus manos); en el humo aparece con rebote.
  sacarMano(n, x, y) {
    const cfg = MANOS[this.normal ? 'normal' : 'humo'];
    const m = this.mano;
    this.tweens.killTweensOf(m);
    m.setTexture(`${cfg.pref}-${n}`).setOrigin(...cfg.origen[n]).setAngle(0).setAlpha(1).setVisible(true);
    m.escala = cfg.ancho[n] / m.width;
    // En el normal son tus brazos: la manga tiene que salir por debajo de la pantalla, sin que se vea el corte.
    if (this.normal) m.escala = Math.max(m.escala, (ALTO + 30 - y) / ((1 - cfg.origen[n][1]) * m.height));
    m.setScale(m.escala);
    m.base = { x, y };
    if (this.normal) {
      m.setPosition(x, y + 420);
      this.tweens.add({ targets: m, y, duration: 380, ease: 'Back.out' });
    } else {
      m.setPosition(x, y).setScale(0);
      this.tweens.add({ targets: m, scale: m.escala, duration: 320, ease: 'Back.out' });
    }
  }

  retirarMano() {
    const m = this.mano;
    this.tweens.killTweensOf(m);
    if (this.normal) this.tweens.add({ targets: m, y: m.y + 460, duration: 320, ease: 'Sine.in', onComplete: () => m.setVisible(false) });
    else this.tweens.add({ targets: m, scale: 0, alpha: 0, duration: 240, ease: 'Back.in', onComplete: () => m.setVisible(false) });
  }

  // Sacudida corta (desmenuzar, enrollar): alterna de lado en cada golpe.
  meneo(dx, ang) {
    const m = this.mano;
    this.lado = -(this.lado || 1);
    this.tweens.add({ targets: m, x: m.base.x + dx * this.lado, angle: ang * this.lado, duration: 70, yoyo: true, ease: 'Sine.out' });
    this.tweens.add({ targets: m, scaleY: m.escala * 0.95, scaleX: m.escala * 1.03, duration: 70, yoyo: true });
  }

  // ---------- Pasos ----------

  siguiente(nota) {
    if (nota !== undefined) {
      this.notas.push(nota);
      this.puntitos[this.paso].setFillStyle(nota >= 80 ? 0x7ee081 : nota >= 50 ? HEX.amarillo : HEX.rojo);
      golpeTexto(this, ANCHO / 2, 300, nota >= 80 ? '¡Perfecto!' : nota >= 50 ? 'Vale' : 'Uf…', nota >= 80 ? COLOR.verde : COLOR.amarillo, 44).setDepth(30);
    }
    this.paso++;
    this.medidor.removeAll(true);
    this.t0 = this.time.now;
    this.cuenta = 0;
    if (this.paso >= PASOS_LIAR.length) return this.time.delayedCall(700, () => this.terminado());
    const p = PASOS_LIAR[this.paso];
    this.activo = false;
    this.time.delayedCall(nota !== undefined ? 700 : 0, () => {
      this.titulo.setText(`${this.paso + 1}. ${p.titulo}`).setScale(0);
      this.tweens.add({ targets: this.titulo, scale: 1, duration: 300, ease: 'Back.out' });
      this.ayuda.setText(p.ayuda);
      this.puntitos[this.paso].setFillStyle(0xffffff);
      this.preparar(p.id);
      this.t0 = this.time.now;
      this.activo = true;
    });
  }

  preparar(id) {
    const izq = PAPEL.x - PAPEL.ancho / 2;
    const der = PAPEL.x + PAPEL.ancho / 2;
    if (id === 'picar') {
      this.sacarMano(1, MONTON.x + 20, MONTON.y - 110);
      this.barraProgreso();
    }
    if (id === 'boquilla') {
      // La marca verde en el extremo del papel; la mano con la boquilla va y viene.
      this.objetivoX = der - 40;
      const marca = this.add.rectangle(this.objetivoX, PAPEL.y, 64, PAPEL.alto - 20).setStrokeStyle(5, 0x7ee081);
      this.tweens.add({ targets: marca, alpha: 0.4, duration: 300, yoyo: true, repeat: -1 });
      this.medidor.add(marca);
      this.sacarMano(3, izq + 40, PAPEL.y);
      this.time.delayedCall(400, () => this.tweens.add({ targets: this.mano, x: der + 30, duration: 950, yoyo: true, repeat: -1, ease: 'Sine.inOut' }));
    }
    if (id === 'rellenar') {
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(1130, 230, 60, 380, 16);
      g.fillStyle(0x7ee081, 0.9).fillRect(1140, 600 - 360 * 0.8, 40, 360 * 0.2);
      this.medidor.add(g);
      this.llenado = this.add.rectangle(1160, 600, 30, 0, 0xffffff).setOrigin(0.5, 1);
      this.medidor.add(this.llenado);
      this.medidor.add(texto(this, 1160, 630, 'Lleno', 18, COLOR.crema));
      this.sacarMano(1, izq + 60, PAPEL.y - 70);
    }
    if (id === 'liar') {
      this.estado.enManos = true;
      this.pintar();
      this.sacarMano(4, PAPEL.x, PAPEL.y);
      this.barraProgreso();
    }
    if (id === 'pegar') {
      this.sacarMano(5, PAPEL.x, PAPEL.y);
      const y = 250;
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(ANCHO / 2 - 260, y - 20, 520, 40, 14);
      g.fillStyle(0x7ee081, 1).fillRect(ANCHO / 2 - 22, y - 14, 44, 28);
      this.medidor.add(g);
      this.cursor = this.add.rectangle(ANCHO / 2 - 250, y, 10, 46, 0xffffff).setStrokeStyle(3, HEX.tinta);
      this.medidor.add(this.cursor);
      this.objetivoX = ANCHO / 2;
      this.tweens.add({ targets: this.cursor, x: ANCHO / 2 + 250, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (id === 'encender') {
      this.intentos = 0;
      this.sacarMano(6, izq - 26, PAPEL.y + 4);
    }
  }

  barraProgreso() {
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(ANCHO / 2 - 260, 232, 520, 26, 12);
    this.medidor.add(g);
    this.progreso = this.add.rectangle(ANCHO / 2 - 252, 245, 0, 14, HEX.amarillo).setOrigin(0, 0.5);
    this.medidor.add(this.progreso);
  }

  pulsar(flecha) {
    if (!this.activo) return;
    const id = PASOS_LIAR[this.paso].id;
    const izq = PAPEL.x - PAPEL.ancho / 2;
    if (id === 'picar') {
      this.cuenta++;
      this.estado.picado = Math.min(1, this.cuenta / 14);
      this.progreso.width = 504 * this.estado.picado;
      sfx(this, 'fup', { volume: 0.4, rate: 0.9 + Math.random() * 0.4 });
      this.meneo(10, 4);
      this.migas(this.mano.base.x, this.mano.base.y + 10, 5, MONTON.y);
      this.pintar();
      if (this.cuenta >= 14) {
        const s = (this.time.now - this.t0) / 1000;
        this.activo = false;
        this.retirarMano();
        this.siguiente(Math.round(Phaser.Math.Clamp(100 - (s - 2.5) * 15, 40, 100)));
      }
    } else if (id === 'liar') {
      this.cuenta++;
      this.estado.enrollado = Math.min(1, this.cuenta / 10);
      this.progreso.width = 504 * this.estado.enrollado;
      sfx(this, 'papel', { volume: 0.35, rate: 1 + Math.random() * 0.3 });
      this.meneo(14, 6);
      if (this.cuenta >= 10) {
        const s = (this.time.now - this.t0) / 1000;
        this.activo = false;
        this.siguiente(Math.round(Phaser.Math.Clamp(100 - (s - 2) * 18, 40, 100)));
      }
    } else if (id === 'boquilla' && !flecha) {
      this.tweens.killTweensOf(this.mano);
      const x = this.mano.x;
      const error = Math.abs(x - this.objetivoX);
      const nota = Math.round(Phaser.Math.Clamp(100 - Math.max(0, error - 18) * 0.6, 20, 100));
      this.activo = false;
      // Baja, la deja y se va.
      this.tweens.add({
        targets: this.mano, y: this.mano.y + 14, duration: 120, yoyo: true,
        onYoyo: () => { this.estado.boquilla = x; sfx(this, 'pop'); this.pintar(); },
        onComplete: () => this.retirarMano(),
      });
      this.siguiente(nota);
    } else if (id === 'pegar' && !flecha) {
      this.tweens.killTweensOf(this.cursor);
      const error = Math.abs(this.cursor.x - this.objetivoX);
      const nota = Math.round(Phaser.Math.Clamp(100 - Math.max(0, error - 18) * 0.6, 20, 100));
      this.activo = false;
      const m = this.mano;
      this.tweens.add({ targets: m, scaleY: m.escala * 0.92, scaleX: m.escala * 1.04, duration: 110, yoyo: true, repeat: 1 });
      sfx(this, 'sorbo', { volume: 0.6 });
      golpeTexto(this, ANCHO / 2, 520, '¡Slurp!', COLOR.rosa, 40).setDepth(30);
      this.time.delayedCall(500, () => {
        this.estado.sellado = true;
        this.estado.enrollado = 1;
        this.estado.enManos = false;
        this.retirarMano();
        this.pintar();
      });
      this.siguiente(nota);
    } else if (id === 'encender' && !flecha) {
      this.intentos++;
      const m = this.mano;
      this.tweens.add({ targets: m, angle: -10, y: m.base.y + 6, duration: 70, yoyo: true });
      const chispas = this.add.particles(izq - 26, PAPEL.y, 'miga', {
        speed: { min: 60, max: 200 }, scale: { start: 0.5, end: 0 }, lifespan: 300, tint: [0xffd23f, 0xff7a2f], emitting: false,
      }).setDepth(12);
      chispas.explode(10);
      this.time.delayedCall(400, () => chispas.destroy());
      // El mechero falla a veces, como todos los mecheros.
      if (this.intentos < 2 || Math.random() > 0.45) {
        sfx(this, 'mechero-falla', { volume: 0.7 });
        if (this.intentos === 4) golpeTexto(this, ANCHO / 2, 300, 'Venga, hombre…', COLOR.crema, 36).setDepth(30);
        return;
      }
      sfx(this, 'mechero');
      this.activo = false;
      this.estado.encendido = true;
      this.pintar();
      this.time.delayedCall(500, () => this.retirarMano());
      this.siguiente(Math.round(Phaser.Math.Clamp(110 - this.intentos * 12, 40, 100)));
    }
  }

  soltar() {
    if (!this.activo || PASOS_LIAR[this.paso].id !== 'rellenar' || this.estado.relleno <= 0) return;
    this.activo = false;
    const r = this.estado.relleno * 100;
    const nota = r >= 60 && r <= 80 ? 100 : Math.round(Phaser.Math.Clamp(100 - Math.min(Math.abs(r - 60), Math.abs(r - 80)) * 3, 20, 100));
    if (r > 92) golpeTexto(this, ANCHO / 2, 520, '¡Te has pasado!', COLOR.rosa, 36).setDepth(30);
    if (r < 40) golpeTexto(this, ANCHO / 2, 520, 'Esto va a salir flaco…', COLOR.crema, 32).setDepth(30);
    this.retirarMano();
    this.siguiente(nota);
  }

  update(_t, dms) {
    if (!this.activo) return;
    if (PASOS_LIAR[this.paso].id === 'rellenar' && (this.pulsando || this.teclas.SPACE.isDown)) {
      this.estado.relleno = Math.min(1, this.estado.relleno + dms / 1000 * 0.42);
      this.llenado.setSize(30, 360 * this.estado.relleno); // setSize recoloca el ancla: crece hacia arriba
      this.llenado.fillColor = this.estado.relleno > 0.8 ? HEX.rojo : 0xffffff;
      // La mano recorre el papel espolvoreando, con un temblor de dedos.
      const izq = PAPEL.x - PAPEL.ancho / 2;
      const x = izq + 60 + (PAPEL.ancho - 180) * Math.min(1, this.estado.relleno / 0.8);
      this.mano.setPosition(x + Math.sin(this.time.now / 40) * 4, PAPEL.y - 70 + Math.sin(this.time.now / 55) * 3);
      this.mano.base = { x, y: PAPEL.y - 70 };
      if (Math.random() < 0.6) this.migas(x, PAPEL.y - 60, 1, PAPEL.y);
      this.pintar();
      if (this.estado.relleno >= 1) this.soltar();
    }
  }

  // Trocitos verdes que caen de los dedos hasta `hasta` (el montón o el papel).
  migas(x, y, n, hasta) {
    for (let i = 0; i < n; i++) {
      const m = this.add.circle(x + Phaser.Math.Between(-18, 18), y, Phaser.Math.Between(3, 6), Phaser.Utils.Array.GetRandom([0x6fbf4a, 0x4e9a35, 0x8fd46a])).setDepth(9);
      this.tweens.add({ targets: m, y: hasta + Phaser.Math.Between(-8, 8), x: m.x + Phaser.Math.Between(-14, 14), duration: Phaser.Math.Between(260, 420), ease: 'Quad.in', onComplete: () => m.destroy() });
    }
  }

  // Dibuja el montón, el papel, el relleno, el porro enrollado, la boquilla y la brasa.
  pintar() {
    const g = this.g;
    const e = this.estado;
    g.clear();
    // Montoncito picado en la bandeja.
    if (e.picado > 0 && e.relleno < 0.05) {
      g.fillStyle(0x4e9a35, 1);
      const n = Math.floor(e.picado * 30);
      for (let i = 0; i < n; i++) g.fillCircle(MONTON.x + ((i * 37) % 110) - 55, MONTON.y + 10 - ((i * 13) % 34), 9);
      g.fillStyle(0x8fd46a, 1);
      for (let i = 0; i < n / 2; i++) g.fillCircle(MONTON.x + ((i * 53) % 90) - 45, MONTON.y + 4 - ((i * 17) % 28), 5);
    }
    this.boquillaImg.setVisible(false);
    if (e.enManos) { this.llama.setVisible(false); return; } // lo tienen las manos
    const izq = PAPEL.x - PAPEL.ancho / 2;
    const der = PAPEL.x + PAPEL.ancho / 2;
    const liado = e.enrollado >= 1;
    if (!liado) {
      g.fillStyle(0x000000, 0.25).fillRoundedRect(izq + 8, PAPEL.y - PAPEL.alto / 2 + 10, PAPEL.ancho, PAPEL.alto, 6);
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(izq - 6, PAPEL.y - PAPEL.alto / 2 - 6, PAPEL.ancho + 12, PAPEL.alto + 12, 8);
      g.fillStyle(0xfffdf6, 1).fillRoundedRect(izq, PAPEL.y - PAPEL.alto / 2, PAPEL.ancho, PAPEL.alto, 6);
      g.fillStyle(0xe9e2d0, 1).fillRect(izq, PAPEL.y + PAPEL.alto / 2 - 18, PAPEL.ancho, 12);
      if (e.relleno > 0) {
        g.fillStyle(0x4e9a35, 1);
        const h = 70 * e.relleno;
        const largo = (PAPEL.ancho - 120) * Math.min(1, e.relleno / 0.8);
        g.fillRoundedRect(izq + 20, PAPEL.y - h / 2, Math.max(10, largo), Math.max(6, h), 10);
        g.fillStyle(0x8fd46a, 1);
        for (let x = izq + 30; x < izq + 20 + largo; x += 22) g.fillCircle(x, PAPEL.y - h / 4 + ((x * 7) % 9), 4);
      }
      if (e.boquilla !== null) {
        const bx = Phaser.Math.Clamp(e.boquilla, der - 80, der - 10);
        this.boquillaImg.setVisible(true).setPosition(bx, PAPEL.y).setScale(0.8, 1.6).setAngle(90);
      }
    } else {
      // El porro liado: cono (ancho a la izquierda, boquilla a la derecha) con su costura.
      const ancho = 30 + e.relleno * 18;
      g.fillStyle(0x000000, 0.25).fillTriangle(izq + 10, PAPEL.y + 14 - ancho, izq + 10, PAPEL.y + 14 + ancho, der + 10, PAPEL.y + 14);
      g.fillStyle(HEX.tinta, 1);
      g.fillPoints([{ x: izq - 6, y: PAPEL.y - ancho - 6 }, { x: der - 60, y: PAPEL.y - 22 }, { x: der - 60, y: PAPEL.y + 22 }, { x: izq - 6, y: PAPEL.y + ancho + 6 }], true);
      g.fillStyle(0xfffdf6, 1);
      g.fillPoints([{ x: izq, y: PAPEL.y - ancho }, { x: der - 64, y: PAPEL.y - 16 }, { x: der - 64, y: PAPEL.y + 16 }, { x: izq, y: PAPEL.y + ancho }], true);
      if (e.sellado) g.lineStyle(3, 0xd8cfb8, 1).lineBetween(izq + 14, PAPEL.y + ancho * 0.35, der - 70, PAPEL.y + 6);
      g.fillStyle(0x4e9a35, 1).fillEllipse(izq, PAPEL.y, 16, ancho * 2 - 6);
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(der - 66, PAPEL.y - 22, 70, 44, 8);
      g.fillStyle(0xe4c08a, 1).fillRoundedRect(der - 62, PAPEL.y - 18, 62, 36, 6);
      g.lineStyle(2, 0xb98d55, 1);
      [der - 50, der - 34, der - 18].forEach(x => g.lineBetween(x, PAPEL.y - 16, x - 6, PAPEL.y + 16));
    }
    if (e.encendido && !this.llama.visible) {
      this.llama.removeAll(true).setVisible(true);
      const brasa = this.add.circle(izq - 2, PAPEL.y, 20, 0xff7a2f);
      this.llama.add([this.add.circle(izq - 2, PAPEL.y, 34, 0xffd23f, 0.35), brasa]);
      this.tweens.add({ targets: brasa, alpha: 0.6, scale: 1.15, duration: 220, yoyo: true, repeat: -1 });
      this.time.addEvent({
        delay: 240, loop: true, callback: () => {
          const h = this.add.image(izq - 10, PAPEL.y - 20, this.normal ? 'niebla' : 'humo').setScale(this.normal ? 0.25 : 0.08).setAlpha(0.7).setTint(0xe8e2f0).setDepth(5);
          this.tweens.add({ targets: h, y: h.y - 170, x: h.x - 30 + Math.random() * 60, scale: this.normal ? 0.8 : 0.3, alpha: 0, duration: 1700, onComplete: () => h.destroy() });
        },
      });
    }
  }

  terminado() {
    const media = Math.round(this.notas.reduce((a, b) => a + b, 0) / this.notas.length);
    const nombre = media >= 85 ? '¡Obra de arte!' : media >= 65 ? 'Un porro decente' : media >= 45 ? 'Una zanahoria' : 'Esto no tira';
    this.titulo.setText(nombre);
    this.ayuda.setText(`Nota: ${media} / 100`);
    sfx(this, media >= 65 ? 'campanita' : 'rimshot');
    // Las manos lo levantan para enseñarlo.
    this.estado.enManos = true;
    this.pintar();
    this.sacarMano(5, PAPEL.x, PAPEL.y - 20);
    this.tweens.add({ targets: this.mano, y: PAPEL.y - 40, angle: 3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 400 });
    const ir = () => irA(this, 'Fumar', { calidad: media, mundo: this.datos.mundo });
    boton(this, ANCHO / 2, 640, '¡A fumar! (E)', ir, { ancho: 320, color: HEX.verde }).setDepth(40);
    this.input.keyboard.once('keydown-E', ir);
    this.input.keyboard.once('keydown-ENTER', ir);
  }
}

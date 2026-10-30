// Un señor: Lasslow cena con el casero (una silueta con chistera y monóculo) y quiere parecer un señor.
// La risa floja y el pedo le delatan (CANON). Dos pruebas que NUNCA coinciden, cada una con su tecla:
//   CHISTE: Palicaso cuenta un chiste; en el remate, un círculo se cierra sobre la cara de Lasslow.
//           ESPACIO justo cuando toca el anillo = se traga la risa. Tarde o pronto = risa floja.
//   TRIPA:  la barriga ruge con cuenta atrás. En algún momento suena un RUIDO (bandeja, estornudo,
//           «¡ESCUCHA!»): P durante el ruido = el ruido lo tapa. P sin ruido = «¡Que se me ha escapao!».
//           Si se acaba la cuenta sin soltarlo = revienta.
// Tres pajaritas de dignidad. Cada prueba superada acelera la siguiente.

const CHISTES = [
  ['¿Sabes qué le dice una nube a otra?', '¡Qué colocada vas!'],
  ['Entra un copo de nieve en un bar…', '…y le da un blancazo. ¡Mi hermano!'],
  ['¿Cómo se llama el primo de Puky?', '¡Pukyto!'],
  ['¿Vamos a Unaké?', '¿A una qué? ¡A una aso!'],
  ['¿Qué hace Perico en el gimnasio?', '¡Pin pin… pesas!'],
  ['¿Por qué Cotine no sale en las fotos?', '¡Porque se las come!'],
  ['Le digo a la Pompa: «¿Bailas?»', 'Me contesta mañana.'],
  ['¿Sabe usted cuánto cobra el casero?', '¡Lo mismo que cobra el humo: todo!'],
];
const RUIDOS = [
  { quien: 'perico-horror', texto: '¡CRASH!', sonido: 'cristal', x: 1060 },
  { quien: 'palicaso-contando', texto: '¡ESCUCHA, ESCUCHA!', sonido: 'bocina', x: 1020 },
  { quien: 'pompa-horror', texto: '¡ACHÍS!', sonido: 'pop', x: 1080 },
];
const ANILLO = 62;

class Lasslow extends Phaser.Scene {
  constructor() { super('Lasslow'); }

  create(datos) {
    this.dignidad = 3;
    this.puntos = 0;
    this.combo = 0;
    // Nivel 3+: la cena empieza más animada (todo va más rápido).
    this.ritmo = 1 + Math.min(0.5, Math.max(0, nivelDe('Lasslow') - 2) * 0.12);
    this.rondas = 0;
    this.prueba = null;
    this.ultima = null;

    fondo(this, enMundoHumo() ? 'bg-dentro' : 'bgn-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.35);
    // El casero: silueta con chistera y monóculo que juzga desde la cabecera.
    this.casero = this.add.container(230, 470);
    const s = this.add.graphics();
    s.fillStyle(0x140b1f, 1).fillRoundedRect(-80, -40, 160, 200, 40).fillCircle(0, -80, 62);
    s.fillRect(-48, -220, 96, 100).fillRect(-78, -128, 156, 14);
    this.ojo = this.add.circle(22, -86, 14).setStrokeStyle(4, 0xd8d0ff);
    this.ojo2 = this.add.circle(-20, -86, 5, 0xd8d0ff);
    this.casero.add([s, this.ojo, this.ojo2]);
    this.add.text(230, 300, 'el casero', { fontFamily: FUENTE, fontSize: '18px', color: '#b9a8e6' }).setOrigin(0.5);
    // La mesa con mantel y velas.
    const m = this.add.graphics().setDepth(5);
    m.fillStyle(HEX.tinta, 1).fillRoundedRect(110, 560, 1060, 40, 10);
    m.fillStyle(0xfff6e8, 1).fillRoundedRect(116, 548, 1048, 36, 10);
    m.fillStyle(0xf0e4cf, 1).fillRect(116, 578, 1048, 100);
    [420, 860].forEach(x => {
      m.fillStyle(HEX.tinta, 1).fillRect(x - 7, 486, 14, 64);
      m.fillStyle(0xfff6e8, 1).fillRect(x - 4, 490, 8, 58);
    });
    [420, 860].forEach(x => {
      const l = this.add.ellipse(x, 476, 12, 22, 0xffb43a).setDepth(6);
      this.tweens.add({ targets: l, scaleY: 1.25, duration: 120 + x / 10, yoyo: true, repeat: -1 });
    });

    this.palicaso = this.add.image(1020, 560, 'palicaso').setOrigin(0.5, 1).setDepth(3);
    this.palicaso.setScale(260 / this.palicaso.height);
    flotar(this, this.palicaso, { amplitud: 5 });
    this.lasslow = this.add.image(640, 570, 'lasslow-digno').setOrigin(0.5, 1).setDepth(4);
    this.escLasslow = 250 / this.lasslow.height;
    this.lasslow.setScale(this.escLasslow);

    // Marcadores.
    this.pajaritas = [0, 1, 2].map(i => this.add.image(60 + i * 70, 44, 'pajarita').setScale(0.24).setDepth(50));
    this.textoPuntos = texto(this, ANCHO - 140, 44, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoCombo = texto(this, ANCHO - 140, 84, '', 22, COLOR.verde).setDepth(50);
    this.cartel = texto(this, ANCHO / 2, 120, '', 46, COLOR.amarillo, 1100).setDepth(60);
    this.g = this.add.graphics().setDepth(40);

    // Mandos: ESPACIO (o el botón de la izquierda) y P (o el de la derecha).
    boton(this, 330, 670, 'Tragar risa (ESPACIO)', () => this.tragar(), { ancho: 340, alto: 64, tam: 22 }).setDepth(70);
    boton(this, 950, 670, 'Soltarlo (P)', () => this.soltar(), { ancho: 300, alto: 64, tam: 22, color: HEX.verde }).setDepth(70);
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.tragar(); });
    this.input.keyboard.on('keydown-P', e => { if (!e.repeat) this.soltar(); });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => this.ayuda());
  }

  // Cambia la pose manteniendo la altura (cada dibujo tiene su tamaño) y vuelve a su sitio.
  poseL(clave) {
    this.lasslow.setTexture(clave);
    this.escLasslow = 250 / this.lasslow.height;
    this.lasslow.setScale(this.escLasslow);
    this.lasslow.x = 640;
  }

  ayuda() {
    const c = this.add.container(ANCHO / 2, 330).setDepth(80);
    c.add(this.add.graphics().fillStyle(HEX.tinta, 0.88).fillRoundedRect(-500, -150, 1000, 300, 26));
    c.add(texto(this, 0, -110, 'Esta noche, Lasslow es un señor', 34, COLOR.amarillo));
    c.add(texto(this, 0, -40, 'CHISTE → pulsa ESPACIO cuando el círculo toque el anillo', 26, COLOR.crema, 960));
    c.add(texto(this, 0, 20, 'TRIPA → pulsa P solo cuando suene un RUIDO', 26, COLOR.verde, 960));
    c.add(texto(this, 0, 90, 'Tres fallos y se acabó el señor', 22, COLOR.rosa));
    this.time.delayedCall(4200, () => { c.destroy(); this.siguiente(); });
  }

  siguiente() {
    if (this.dignidad <= 0) return;
    this.poseL('lasslow-digno');
    this.palicaso.setTexture('palicaso');
    this.cartel.setText('');
    this.g.clear();
    // Primero solo chistes; luego se mezclan (nunca dos tripas seguidas).
    const tripa = this.rondas >= 2 && this.ultima !== 'tripa' && Math.random() < 0.38;
    this.ultima = tripa ? 'tripa' : 'chiste';
    this.rondas++;
    this.time.delayedCall(Math.max(500, 1100 / this.ritmo), () => (tripa ? this.empezarTripa() : this.empezarChiste()));
  }

  // ---------- CHISTE ----------

  empezarChiste() {
    const [planteo, remate] = Phaser.Utils.Array.GetRandom(CHISTES);
    this.palicaso.setTexture('palicaso-contando');
    this.burbuja = bocadillo(this, 980, 230, `¡Escucha! ${planteo}`, { tam: 24, ancho: 430 });
    this.cartel.setText('CHISTE').setColor(COLOR.amarillo);
    this.time.delayedCall(1500 / this.ritmo, () => {
      if (this.burbuja) this.burbuja.destroy();
      this.burbuja = bocadillo(this, 980, 230, remate, { tam: 30, ancho: 430 });
      this.palicaso.setTexture('palicaso-riendo');
      sfx(this, 'rimshot', { volume: 0.5 });
      this.prueba = { tipo: 'chiste', t: 0, dur: Math.max(0.75, 1.3 / this.ritmo) };
      this.poseL('lasslow-aguantando');
    });
  }

  radio() {
    const p = this.prueba;
    return Phaser.Math.Linear(220, ANILLO - 40, p.t / p.dur);
  }

  tragar() {
    const p = this.prueba;
    if (!p || p.tipo !== 'chiste') return;
    const error = Math.abs(this.radio() - ANILLO);
    if (error < 16) this.bien(error < 7 ? '¡Tragada!' : 'Por los pelos', error < 7 ? 120 : 70);
    else this.mal('risa');
  }

  // ---------- TRIPA ----------

  empezarTripa() {
    this.poseL('lasslow-aguantando');
    this.cartel.setText('TRIPA: espera el ruido…').setColor(COLOR.verde);
    sfx(this, 'temblor', { volume: 0.5 });
    const dur = Math.max(2.6, 4.6 / this.ritmo);
    const inicio = Phaser.Math.FloatBetween(1.0, dur - 1.2);
    this.prueba = { tipo: 'tripa', t: 0, dur, ruido: [inicio, inicio + 0.95] };
    this.time.delayedCall(inicio * 1000, () => this.ruido());
  }

  ruido() {
    if (!this.prueba || this.prueba.tipo !== 'tripa') return;
    const r = Phaser.Utils.Array.GetRandom(RUIDOS);
    if (r.quien.startsWith('palicaso')) {
      this.palicaso.setTexture(r.quien);
      this.tweens.add({ targets: this.palicaso, y: 540, duration: 120, yoyo: true, repeat: 2 });
      this.time.delayedCall(1000, () => this.palicaso.setTexture('palicaso'));
    } else {
      const img = this.add.image(r.x, 560, r.quien).setOrigin(0.5, 1).setDepth(7).setScale(0);
      const esc = 200 / img.height;
      this.tweens.add({ targets: img, scale: esc, duration: 160, ease: 'Back.out' });
      this.time.delayedCall(1000, () => this.tweens.add({ targets: img, scale: 0, duration: 150, onComplete: () => img.destroy() }));
    }
    sfx(this, r.sonido, { volume: 0.8 });
    golpeTexto(this, r.x, 300, r.texto, COLOR.amarillo, 44);
    this.cartel.setText('¡RUIDO! ¡AHORA! (P)').setColor(COLOR.amarillo);
    this.cameras.main.shake(200, 0.006);
  }

  soltar() {
    const p = this.prueba;
    if (!p) return;
    if (p.tipo !== 'tripa') return this.mal('escapao');
    if (p.t >= p.ruido[0] && p.t <= p.ruido[1]) {
      sfx(this, 'pedo-silencioso', { volume: 0.7 });
      this.nube(0.6);
      this.bien('Disimulado', 150);
    } else {
      this.mal('escapao');
    }
  }

  // ---------- Resultado de cada prueba ----------

  bien(texto_, base) {
    this.prueba = null;
    this.combo++;
    this.ritmo = Math.min(2.2, this.ritmo + 0.08);
    const pts = base * (1 + Math.floor(this.combo / 3) * 0.5);
    this.puntos += pts;
    this.textoPuntos.setText(`${Math.round(this.puntos)} puntos`);
    this.textoCombo.setText(this.combo >= 3 ? `Racha x${1 + Math.floor(this.combo / 3) * 0.5}` : '');
    this.poseL('lasslow-digno');
    this.tweens.add({ targets: this.lasslow, scaleY: this.escLasslow * 1.06, duration: 120, yoyo: true });
    golpeTexto(this, 640, 250, `${texto_} +${Math.round(pts)}`, COLOR.verde, 42);
    if (this.combo % 3 === 0) Comic.racha(this, this.combo, { y: 170 });
    // El casero asiente con el monóculo.
    this.tweens.add({ targets: this.casero, angle: 3, duration: 150, yoyo: true });
    if (this.burbuja) this.burbuja.destroy();
    this.siguiente();
  }

  mal(tipo) {
    const p = this.prueba;
    this.prueba = null;
    this.combo = 0;
    this.textoCombo.setText('');
    this.dignidad--;
    this.pajaritas[this.dignidad].setTint(0x333333).setAlpha(0.35);
    if (this.burbuja) this.burbuja.destroy();
    if (tipo === 'risa') {
      this.poseL('lasslow-rodando');
      sfx(this, 'risa-lasslow');
      golpeTexto(this, 640, 250, '¡JAJAJAJA!', COLOR.rosa, 56);
    } else if (tipo === 'escapao') {
      this.poseL('lasslow-pedo');
      sfx(this, 'pedo', { volume: 0.8 });
      this.time.delayedCall(250, () => sfx(this, 'se-me-ha-escapao'));
      this.nube(1);
      golpeTexto(this, 640, 250, '¡Que se me ha escapao!', COLOR.rosa, 48);
    } else {
      this.poseL('lasslow-horror');
      sfx(this, 'pedo-tuba');
      this.cameras.main.shake(500, 0.02);
      this.nube(1.8);
      golpeTexto(this, 640, 250, '¡PRRRRRT!', COLOR.rosa, 64);
    }
    // El casero se indigna: ojos rojos.
    this.ojo.setStrokeStyle(4, 0xff5a4f);
    this.ojo2.setFillStyle(0xff5a4f);
    sfx(this, 'abucheo', { volume: 0.35 });
    this.time.delayedCall(900, () => { this.ojo.setStrokeStyle(4, 0xd8d0ff); this.ojo2.setFillStyle(0xd8d0ff); });
    this.time.delayedCall(1400, () => (this.dignidad <= 0 ? this.final() : this.siguiente()));
    if (p) this.g.clear();
  }

  nube(tam) {
    const h = this.add.image(this.lasslow.x - 60, 520, 'humo').setTint(0xa8e07a).setScale(0.3 * tam).setAlpha(0.9).setDepth(8);
    this.tweens.add({ targets: h, scale: 0.9 * tam, alpha: 0, y: 400, duration: 1400, onComplete: () => h.destroy() });
  }

  update(_t, dms) {
    const p = this.prueba;
    this.g.clear();
    if (!p) return;
    p.t += dms / 1000;
    if (p.tipo === 'chiste') {
      const r = this.radio();
      const cx = this.lasslow.x;
      const cy = this.lasslow.y - this.lasslow.displayHeight * 0.55;
      this.g.lineStyle(10, 0x7ee081, 0.9).strokeCircle(cx, cy, ANILLO);
      this.g.lineStyle(6, r < ANILLO - 16 ? HEX.rojo : 0xffffff, 1).strokeCircle(cx, cy, Math.max(8, r));
      // Tiembla de aguantarse la risa.
      this.lasslow.x = 640 + Math.sin(this.time.now / 30) * 3;
      if (r < ANILLO - 16) this.mal('risa');
    } else {
      // Cuenta atrás de la tripa y la ventana del ruido.
      const f = Math.max(0, 1 - p.t / p.dur);
      this.g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(440, 170, 400, 28, 12);
      this.g.fillStyle(f < 0.25 ? HEX.rojo : 0x7ee081, 1).fillRoundedRect(446, 176, 388 * f, 16, 8);
      const enRuido = p.t >= p.ruido[0] && p.t <= p.ruido[1];
      this.lasslow.setScale(this.escLasslow * (1 + (1 - f) * 0.12), this.escLasslow * (1 + (1 - f) * 0.08));
      this.lasslow.x = 640 + Math.sin(this.time.now / 25) * (2 + (1 - f) * 4);
      if (!enRuido && p.t > p.ruido[1]) this.cartel.setText('Se pasó el ruido… ¡ya no hay quien lo tape!').setColor(COLOR.rosa);
      if (p.t >= p.dur) this.mal('revienta');
    }
  }

  final() {
    this.prueba = null;
    const puntos = Math.round(this.puntos);
    this.time.delayedCall(600, () => panelFinal(this, {
      titulo: 'Se acabó el señor',
      linea: `Aguantaste ${this.rondas - 1} pruebas ante el casero. Nadie se lo cree, pero lo intentaste.`,
      puntos, clave: 'Lasslow', gana: puntos >= MISIONES.Lasslow.umbrales[0],
    }));
  }
}

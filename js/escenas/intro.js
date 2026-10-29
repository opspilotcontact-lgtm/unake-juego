// La intro: Vuper en el mundo normal (de día, cabeza de nube y ropa de verdad). Al mantener
// pulsado da una calada; cuando hace efecto, la cortinilla de humo pasa al mundo humo
// (los dos mundos, CANON 26/09): el mismo sitio, de noche, con neón, y Vuper ya hecho nube.

class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }

  create(datos) {
    this.fase = 'normal';
    this.carga = 0;
    this.pulsando = false;
    this.caladaSonido = null;

    this.normal = this.add.container(0, 0);
    const bg = fondo(this, 'bg-normal-fuera');
    this.vuper = this.add.image(400, ALTO + 10, 'vuper-normal').setOrigin(0.5, 1);
    this.tweens.add({ targets: this.vuper, scaleY: 1.015, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.morado, 0);
    const etiqueta = texto(this, 170, 50, 'El mundo normal', 30, COLOR.crema);
    const aviso = texto(this, 940, 540, 'MANTÉN PULSADO\npara dar una calada', 40, COLOR.amarillo);
    this.tweens.add({ targets: aviso, scale: 1.06, duration: 600, yoyo: true, repeat: -1 });
    const pista = texto(this, 940, 618, 'barra espaciadora o el dedo', 20, COLOR.crema);
    const marco = this.add.rectangle(940, 665, 366, 34, HEX.tinta).setStrokeStyle(4, HEX.crema);
    this.barra = this.add.rectangle(940 - 180, 665, 0, 24, 0xff7a2f).setOrigin(0, 0.5);
    this.normal.add([bg, this.vuper, this.velo, etiqueta, aviso, pista, marco, this.barra]);

    this.time.delayedCall(700, () => {
      this.bocadillo = bocadillo(this, 610, 170, 'Otra noche de reparto… y nadie se fija en el repartidor.', { ancho: 420, tam: 26, cola: 'izq' });
      this.normal.add(this.bocadillo);
    });

    this.input.on('pointerdown', () => { this.pulsando = true; });
    this.input.on('pointerup', () => { this.pulsando = false; });
    this.teclaEspacio = this.input.keyboard.addKey('SPACE');

    boton(this, ANCHO - 100, 46, 'Saltar', () => this.despertar(), { ancho: 150, alto: 54, tam: 22, color: HEX.crema }).setDepth(700);
    entrar(this, datos);
  }

  update(_t, dms) {
    if (this.fase !== 'normal') return;
    const dt = dms / 1000;
    const pulsa = this.pulsando || this.teclaEspacio.isDown;
    if (pulsa) {
      this.carga += dt * 0.38;
      if (!this.caladaSonido) this.caladaSonido = sfx(this, 'calada', { volume: 0.8 });
    } else {
      this.carga -= dt * 0.6;
      if (this.caladaSonido) { this.caladaSonido.stop(); this.caladaSonido = null; }
    }
    this.carga = Phaser.Math.Clamp(this.carga, 0, 1);
    this.barra.width = 360 * this.carga;
    // Va haciendo efecto: el mundo se tiñe, se acerca y se tambalea un poco.
    this.velo.fillAlpha = this.carga * 0.4;
    this.cameras.main.setZoom(1 + this.carga * 0.07);
    this.vuper.setAngle(Math.sin(this.time.now / 180) * 4 * this.carga);
    if (this.carga >= 1) this.alMundoHumo();
  }

  // Fue un recuerdo de anoche: la partida nueva empieza de día, en tu cuarto, sin colocón.
  despertar() {
    if ((ESTADO.introCap ?? -1) < 0) Object.assign(ESTADO, { colocon: 0, sala: 'cuarto', x: 420, y: 600 });
    guardarPartida();
    irA(this, 'Barrio', { rotulo: 'A la mañana siguiente…' });
  }

  alMundoHumo() {
    this.fase = 'transicion';
    if (this.caladaSonido) this.caladaSonido.stop();
    sfx(this, 'tos', { volume: 0.9 });
    this.cameras.main.shake(450, 0.01);
    this.time.delayedCall(550, () => cortinaHumo(this, () => {
      this.construirMundoHumo();
      destaparHumo(this);
    }));
  }

  construirMundoHumo() {
    this.normal.destroy();
    this.cameras.main.setZoom(1);
    this.fase = 'humo';
    ESTADO.introVista = true;
    guardarPartida();

    // La misma calle, en el mundo humo: neón apagado debajo y encendido encima, que parpadea.
    this.add.image(ANCHO / 2, 515, 'bg-fuera-apagado').setScale(1.25);
    const neon = this.add.image(ANCHO / 2, 515, 'bg-fuera').setScale(1.25).setAlpha(0);
    this.time.delayedCall(700, () => {
      sfx(this, 'neon', { volume: 0.6 });
      this.tweens.chain({
        targets: neon,
        tweens: [
          { alpha: 1, duration: 60 }, { alpha: 0.1, duration: 80 }, { alpha: 1, duration: 60 },
          { alpha: 0.3, duration: 140 }, { alpha: 1, duration: 90 },
        ],
      });
      this.time.addEvent({
        delay: 2600, loop: true,
        callback: () => this.tweens.add({ targets: neon, alpha: 0.4, duration: 50, yoyo: true, repeat: Phaser.Math.Between(0, 2) }),
      });
    });

    texto(this, 160, 50, 'El mundo humo', 30, COLOR.rosa);
    const vuper = this.add.image(330, 480, 'vuper-colocado').setScale(0.95);
    flotar(this, vuper, { amplitud: 14 });
    sfx(this, 'musica-intro', { volume: 0.55 });

    const titulo = this.add.image(ANCHO / 2, -220, 'titulo').setScale(0.6).setDepth(40);
    this.tweens.add({ targets: titulo, y: 130, duration: 1100, ease: 'Bounce.out', delay: 1100 });

    // El bucle de la contraseña, como gancho de cabecera.
    const frases = [
      [2600, 450, 290, '¿Vamos a Unaké?', 'izq'],
      [3800, 900, 330, '¿A una qué?', 'der'],
      [5000, 450, 290, 'A una aso.', 'izq'],
    ];
    let anterior = null;
    frases.forEach(([ms, x, y, str, cola]) => this.time.delayedCall(ms, () => {
      if (anterior) anterior.destroy();
      anterior = bocadillo(this, x, y, str, { cola, tam: 30 });
      sfx(this, 'pop', { volume: 0.5 });
    }));
    this.time.delayedCall(6000, () => {
      const despertar = () => this.despertar();
      boton(this, ANCHO / 2, 640, 'Despertar', despertar, { ancho: 400 }).setDepth(60);
      this.input.keyboard.once('keydown-SPACE', despertar);
      this.input.keyboard.once('keydown-ENTER', despertar);
    });
  }
}

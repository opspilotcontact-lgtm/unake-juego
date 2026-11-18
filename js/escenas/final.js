// El final de la historia: la hucha llega a 1.000 y Unaké se salva. Todos al sofá (el gag del sofá
// de la cabecera), confeti, créditos y vuelta al barrio en modo libre.

class Final extends Phaser.Scene {
  constructor() { super('Final'); }

  create(datos) {
    terminarHistoria();
    guardarPartida();
    fondo(this, 'bg-sofa');
    // Llegan de uno en uno y se apelotonan en el sofá.
    const reparto = [
      ['lasslow-risa-floja', 300, 200], ['palicaso-riendo', 470, 230], ['vuper-fumado', 640, 230],
      ['blancaso-esperanza', 810, 200], ['cotine', 960, 220], ['perico-silbando', 1110, 180],
    ];
    reparto.forEach(([clave, x, alto], i) => {
      const img = this.add.image(x, -200, clave).setOrigin(0.5, 1).setDepth(10);
      img.setScale(alto / img.height);
      const esc = img.scaleX;
      this.tweens.add({ targets: img, y: 610, duration: 650, ease: 'Bounce.out', delay: 600 + i * 380, onStart: () => sfx(this, 'boing', { volume: 0.5 }) });
      this.tweens.add({ targets: img, scaleY: esc * 1.06, scaleX: esc * 0.96, duration: 300 + i * 40, yoyo: true, repeat: -1, delay: 1400 + i * 380 });
    });
    const pompa = this.add.image(640, -200, 'pompa').setDepth(9);
    pompa.setScale(140 / pompa.height);
    this.tweens.add({ targets: pompa, y: 130, duration: 1200, ease: 'Sine.out', delay: 3200 });
    // El pedo de Lasslow hace botar el sofá (como en la cabecera).
    this.time.delayedCall(3600, () => {
      sfx(this, 'pedo');
      this.cameras.main.shake(400, 0.01);
      golpeTexto(this, 300, 330, '¡Que se me ha escapao!', COLOR.rosa, 34);
    });
    this.time.delayedCall(4300, () => this.confeti());
    this.time.delayedCall(4300, () => {
      const t = texto(this, ANCHO / 2, 250, '¡Unaké se salva!', 82, COLOR.amarillo).setDepth(30).setScale(0);
      this.tweens.add({ targets: t, scale: 1, duration: 600, ease: 'Back.out' });
      sfx(this, 'platillo');
      sfx(this, 'risas', { volume: 0.5 });
    });
    // Créditos con oficio (guinda §2), una línea cada 1,6 s. Puky asoma por la esquina en algunas y alguien
    // le aparta; en «Invitados», sale entero. [texto, lo que entra tarde, ¿asoma Puky?]
    const creditos = [
      ['UNAKÉ · la noche más larga de la aso'],
      ['Barra y rondas: Palicaso (invita la casa) (la casa es suya)', null, true],
      ['Cuentas: Blancaso (no cuadran)'],
      ['Repostería: Cotine (lo que quedó)'],
      ['Música: la Pompa (bajito)', '(…gracias)', true],
      ['Protocolo: Lasslow, para servirle (perdón)'],
      ['Seguridad: Perico. Perico.'],
      ...(desdeCapId('miron') ? [['Vigilancia: El Mirón (dice que también)', null, true]] : []),
      ['Memoria: Niebla (¿de qué?)'],
      ['Rider: Vuper. Y nadie más.'],
      ['Música: Kevin MacLeod (incompetech.com) · CC BY 4.0'],
    ];
    const T0 = 5600, PASO = 1600;
    this.puky = this.add.image(95, ALTO + 150, 'puky').setOrigin(0.5, 1).setDepth(25);
    this.puky.setScale(140 / this.puky.height);
    creditos.forEach(([l, tarde, asoma], i) => this.time.delayedCall(T0 + i * PASO, () => {
      const t = texto(this, ANCHO / 2, 340, l, i === 0 ? 40 : 26, COLOR.crema, 1100).setDepth(30).setAlpha(0);
      this.tweens.chain({ targets: t, tweens: [{ alpha: 1, y: 330, duration: 400 }, { alpha: 0, duration: 400, delay: 900 }] });
      if (tarde) this.time.delayedCall(1000, () => {
        const tt = texto(this, ANCHO / 2, 372, tarde, 20, '#bdf4ff').setDepth(30).setAlpha(0);
        this.tweens.chain({ targets: tt, tweens: [{ alpha: 1, duration: 200 }, { alpha: 0, duration: 300, delay: 250 }] });
      });
      if (asoma) this.asomaPuky();
    }));
    // «Invitados: —». Un segundo vacío. Puky sale entero; Blancaso, desde fuera: «No.». Y Puky se va.
    const tInv = T0 + creditos.length * PASO;
    this.time.delayedCall(tInv, () => {
      const t = texto(this, ANCHO / 2, 330, 'Invitados: —', 26, COLOR.crema).setDepth(30).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 400 });
      this.time.delayedCall(1100, () => {
        if (this.textures.exists('puky-que-rico')) this.puky.setTexture('puky-que-rico');
        this.puky.setScale(150 / this.puky.height);
        sfx(this, 'blurp', { volume: 0.5 });
        this.tweens.add({ targets: this.puky, y: ALTO - 6, duration: 380, ease: 'Back.out' });
        const b1 = bocadillo(this, 112, 480, '¿Me llamabais?', { tam: 22, ancho: 240, cola: 'abajo' }).setDepth(40);
        this.time.delayedCall(1300, () => {
          b1.destroy();
          const no = this.add.text(ANCHO - 18, 470, '—No.', { fontFamily: FUENTE, fontSize: '26px', color: '#bfe8ff', stroke: COLOR.tinta, strokeThickness: 6 }).setOrigin(1, 0.5).setDepth(40);
          const quien = this.add.text(ANCHO - 18, 500, 'Blancaso, desde fuera', { fontFamily: FUENTE, fontSize: '14px', color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 4 }).setOrigin(1, 0.5).setDepth(40);
          this.time.delayedCall(1000, () => {
            sfx(this, 'puky-triste', { volume: 0.5 });
            this.puky.setTexture('puky').setScale(150 / this.textures.get('puky').getSourceImage().height);
            this.tweens.add({ targets: this.puky, y: ALTO + 160, duration: 700, ease: 'Sine.in' });
            this.tweens.add({ targets: [no, quien, t], alpha: 0, duration: 400, delay: 500 });
          });
        });
      });
    });
    this.time.delayedCall(tInv + 4300, () => {
      boton(this, ANCHO / 2, 680, 'Después de los créditos… (E)', () => irA(this, 'Cuenta'), { ancho: 460 }).setDepth(40);
      this.input.keyboard.once('keydown-E', () => irA(this, 'Cuenta'));
    });
    entrar(this, datos);
  }

  // Puky asoma por la esquina; alguien le aparta y se va. Corto y sin sacudidas.
  asomaPuky() {
    const p = this.puky;
    if (!p || !p.active) return;
    this.tweens.killTweensOf(p);
    p.y = ALTO + 150;
    this.tweens.chain({ targets: p, tweens: [
      { y: ALTO + 60, duration: 300, ease: 'Sine.out' },
      { y: ALTO + 150, duration: 180, ease: 'Back.in', delay: 650, onStart: () => sfx(this, 'fiu', { volume: 0.25 }) },
    ] });
  }

  confeti() {
    const p = this.add.particles(ANCHO / 2, -20, 'miga', {
      x: { min: -640, max: 640 }, speedY: { min: 120, max: 320 }, speedX: { min: -60, max: 60 },
      scale: { min: 0.6, max: 1.4 }, rotate: { min: 0, max: 360 }, lifespan: 4000, quantity: 3, frequency: 40,
      tint: [0xffd23f, 0xff5fa2, 0x5ad1ff, 0x7ee081, 0xb68cff],
    }).setDepth(20);
    this.time.delayedCall(6000, () => p.stop());
  }
}

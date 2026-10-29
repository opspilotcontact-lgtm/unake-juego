// El final de la historia: la hucha llega a 1.000 y Unaké se salva. Todos al sofá (el gag del sofá
// de la cabecera), confeti, créditos y vuelta al barrio en modo libre.

class Final extends Phaser.Scene {
  constructor() { super('Final'); }

  create(datos) {
    ESTADO.capitulo = CAPITULOS.length;
    guardarPartida();
    fondo(this, 'bg-sofa');
    sfx(this, 'musica-intro', { volume: 0.5 });
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
    const creditos = [
      'UNAKÉ · la noche',
      'Una prueba de juego de la serie de VOPPË',
      '«¿Vamos a Unaké?» «¿A una qué?» «A una aso.»',
      'Gracias por jugar. El barrio sigue abierto: récords, estrellas e inventos.',
    ];
    creditos.forEach((l, i) => this.time.delayedCall(5600 + i * 1600, () => {
      const t = texto(this, ANCHO / 2, 340 + i * 0, l, i === 0 ? 40 : 26, COLOR.crema, 1100).setDepth(30).setAlpha(0);
      this.tweens.chain({ targets: t, tweens: [{ alpha: 1, y: 330, duration: 400 }, { alpha: 0, duration: 400, delay: 900 }] });
    }));
    this.time.delayedCall(5600 + creditos.length * 1600, () => {
      boton(this, ANCHO / 2, 680, 'Seguir jugando (E)', () => irA(this, 'Barrio', { aviso: 'Modo libre: a por los récords' }), { ancho: 360 }).setDepth(40);
      this.input.keyboard.once('keydown-E', () => irA(this, 'Barrio', { aviso: 'Modo libre: a por los récords' }));
    });
    entrar(this, datos);
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

// Por los aires (la noche de Lasslow, semilla del E02): Lasslow sube por Unaké hasta la Pompa, que
// vive en el techo, propulsado por el pedo que lleva toda la noche aguantándose.
// MANTÉN para soltar gas (sube; gasta el depósito), suelta para caer; ← → para moverse.
// La comida recarga el gas. Las lámparas y los ventiladores te tiran para abajo. 45 segundos.

const ALTO_AIRES = 2160;
const DURACION_AIRES = 45;

class Aires extends Phaser.Scene {
  constructor() { super('Aires'); }

  create(datos) {
    this.puntos = 0;
    this.gas = 100;
    this.vidas = 3;
    this.vy = 0;
    this.restante = DURACION_AIRES;
    this.activo = false;
    this.invul = 0;
    this.mejor = 0;

    // Tres pisos de Unaké, de abajo arriba: el bar, el reservado y el techo de la Pompa.
    [['bg-techo', 360], ['bg-sofa', 1080], ['bg-dentro', 1800]].forEach(([k, y]) => {
      const img = this.add.image(ANCHO / 2, y, k);
      img.setScale(Math.max(ANCHO / img.width, 720 / img.height));
    });
    this.add.rectangle(ANCHO / 2, ALTO_AIRES / 2, ANCHO, ALTO_AIRES, HEX.tinta, 0.3);
    this.pompa = this.add.image(ANCHO / 2, 170, 'pompa').setDepth(5);
    this.pompa.setScale(170 / this.pompa.height);
    flotar(this, this.pompa, { amplitud: 10 });

    this.lasslow = this.add.image(ANCHO / 2, ALTO_AIRES - 120, 'lasslow-pedo').setDepth(10);
    this.escL = 130 / this.lasslow.height;
    this.lasslow.setScale(this.escL);
    this.cameras.main.setBounds(0, 0, ANCHO, ALTO_AIRES).startFollow(this.lasslow, true, 0.1, 0.1);

    // Comida (recarga) y obstáculos repartidos por la subida.
    this.cosas = [];
    for (let y = ALTO_AIRES - 320; y > 360; y -= 110) {
      const comida = Math.random() < 0.45;
      const x = Phaser.Math.Between(140, ANCHO - 140);
      if (comida) {
        const img = this.add.image(x, y, Phaser.Utils.Array.GetRandom(['patatas', 'caramelo', arteO('obj-donut', 'caramelo')])).setDepth(8);
        img.setScale(56 / img.height);
        this.tweens.add({ targets: img, y: y - 10, duration: 700, yoyo: true, repeat: -1 });
        this.cosas.push({ img, tipo: 'comida' });
      } else {
        const lampara = this.add.container(x, y).setDepth(8);
        lampara.add(this.add.rectangle(0, -60, 4, 120, 0x333333));
        lampara.add(this.add.circle(0, 0, 28, HEX.amarillo).setStrokeStyle(5, HEX.tinta));
        this.tweens.add({ targets: lampara, x: x + Phaser.Math.Between(-160, 160), duration: Phaser.Math.Between(1200, 2200), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.cosas.push({ img: lampara, tipo: 'lampara' });
      }
    }

    // Marcador fijo a la pantalla.
    this.textoPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50).setScrollFactor(0);
    this.textoTiempo = texto(this, ANCHO / 2, 40, '', 30, COLOR.crema).setDepth(50).setScrollFactor(0);
    texto(this, ANCHO - 260, 40, 'Gas', 24, COLOR.crema).setDepth(50).setScrollFactor(0);
    this.add.rectangle(ANCHO - 120, 40, 200, 22, 0x000000, 0.5).setStrokeStyle(3, HEX.crema).setDepth(50).setScrollFactor(0);
    this.barraGas = this.add.rectangle(ANCHO - 220, 40, 200, 18, 0xc8a83c).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0);
    this.altura = this.add.rectangle(30, ALTO - 60, 14, 0, HEX.rosa).setOrigin(0.5, 1).setDepth(51).setScrollFactor(0);
    this.add.rectangle(30, ALTO - 60, 14, 520, 0x000000, 0.4).setOrigin(0.5, 1).setStrokeStyle(3, HEX.crema).setDepth(50).setScrollFactor(0);
    this.vidasG = [0, 1, 2].map(i => this.add.circle(ANCHO / 2 + 120 + i * 34, 40, 12, HEX.rosa).setStrokeStyle(3, HEX.tinta).setDepth(50).setScrollFactor(0));

    this.teclas = this.input.keyboard.addKeys('SPACE,LEFT,RIGHT,A,D,UP,W');
    this.input.on('pointerdown', () => { this.dedo = true; });
    this.input.on('pointerup', () => { this.dedo = false; });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      const t = texto(this, ANCHO / 2, ALTO / 2, 'MANTÉN para soltar gas · ← → para moverte', 30, COLOR.amarillo, 1000).setDepth(60).setScrollFactor(0);
      this.time.delayedCall(2000, () => { t.destroy(); this.activo = true; });
    });
  }

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.restante -= dt;
    this.textoTiempo.setText(`${Math.ceil(this.restante)} s`);
    this.invul = Math.max(0, this.invul - dt);
    const k = this.teclas;
    const empuja = (k.SPACE.isDown || k.UP.isDown || k.W.isDown || this.dedo) && this.gas > 0;
    const dx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    this.vy += (empuja ? -950 : 440) * dt;
    this.vy = Phaser.Math.Clamp(this.vy, -440, 380);
    // El cuerpo va fabricando gas poco a poco (un señor nunca se queda sin).
    if (!empuja) this.gas = Math.min(100, this.gas + 7 * dt);
    if (empuja) {
      this.gas = Math.max(0, this.gas - 17 * dt);
      this.tPedo = (this.tPedo || 0) - dt;
      if (this.tPedo <= 0) {
        this.tPedo = 0.09;
        const clave = this.textures.exists('fx-nube-pedo') ? 'fx-nube-pedo' : 'humo';
        const n = this.add.image(this.lasslow.x + Phaser.Math.Between(-10, 10), this.lasslow.y + 50, clave).setDepth(9).setAlpha(0.8);
        n.setScale(36 / n.height);
        this.tweens.add({ targets: n, y: n.y + 90, scale: n.scale * 2, alpha: 0, duration: 600, onComplete: () => n.destroy() });
        if (Math.random() < 0.08) sfx(this, Phaser.Utils.Array.GetRandom(['pedo', 'pedo-tuba', 'pedo-silencioso']), { volume: 0.35 });
      }
    }
    const l = this.lasslow;
    l.x = Phaser.Math.Clamp(l.x + dx * 340 * dt, 60, ANCHO - 60);
    l.y = Math.min(ALTO_AIRES - 90, l.y + this.vy * dt);
    if (l.y >= ALTO_AIRES - 90) this.vy = 0;
    l.setAngle(Phaser.Math.Linear(l.angle, dx * 14 + this.vy / 40, 0.15));
    l.setAlpha(this.invul > 0 && Math.floor(this.invul * 10) % 2 ? 0.4 : 1);

    // Choques y comida.
    this.cosas.forEach(c => {
      if (!c.img.active) return;
      const d = Phaser.Math.Distance.Between(l.x, l.y, c.img.x, c.img.y);
      if (c.tipo === 'comida' && d < 70) {
        c.img.destroy();
        this.gas = Math.min(100, this.gas + 45);
        this.puntos += 50;
        sfx(this, 'nam', { volume: 0.5 });
        golpeTexto(this, l.x, l.y - 70, '+gas', COLOR.verde, 28);
      } else if (c.tipo === 'lampara' && d < 66 && this.invul <= 0) {
        this.invul = 1.3;
        this.vy = 420;
        this.vidas--;
        if (this.vidasG[this.vidas]) this.vidasG[this.vidas].setFillStyle(0x3d3350);
        sfx(this, 'golpe', { volume: 0.6 });
        this.cameras.main.shake(200, 0.01);
        l.setTexture('lasslow-horror').setScale(130 / l.height);
        this.time.delayedCall(700, () => l.active && l.setTexture('lasslow-pedo').setScale(this.escL));
        if (this.vidas <= 0) return this.final(false);
      }
    });

    const subido = Phaser.Math.Clamp((ALTO_AIRES - 90 - l.y) / (ALTO_AIRES - 330), 0, 1);
    this.mejor = Math.max(this.mejor, subido);
    this.altura.height = 520 * this.mejor;
    this.barraGas.width = 200 * this.gas / 100;
    this.textoPuntos.setText(`${this.puntos + Math.round(this.mejor * 600)} puntos`);
    if (l.y < 280) return this.final(true);
    if (this.restante <= 0) this.final(false);
  }

  final(llega) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.puntos += Math.round(this.mejor * 600) + (llega ? 300 + Math.round(this.restante * 10) : 0);
    if (llega) {
      this.lasslow.setTexture('lasslow-digno').setScale(130 / this.lasslow.height);
      bocadillo(this, ANCHO / 2, 330, 'Señorita… buenas noches.', { tam: 24 }).setDepth(40);
      this.pompa.setTexture('pompa-mira');
      Comic.emote(this, this.pompa.x + 60, this.pompa.y - 40, 'corazon', { profundidad: 45 });
      sfx(this, 'aaah', { volume: 0.5 });
    }
    // El panel final va en coordenadas de pantalla: la cámara vuelve arriba (donde está la Pompa).
    this.cameras.main.stopFollow();
    this.cameras.main.pan(ANCHO / 2, ALTO / 2, 700, 'Sine.easeInOut');
    const gana = llega && this.puntos >= MISIONES.Aires.umbrales[0];
    this.time.delayedCall(1400, () => panelFinal(this, {
      titulo: llega ? '¡Hasta el techo!' : 'Se acabó el gas',
      linea: llega ? 'Lasslow llega a la altura de la Pompa. Como un señor. Que huele un poco.' : 'Lasslow vuelve al suelo con dignidad. Mucha dignidad.',
      puntos: this.puntos, clave: 'Aires', gana,
    }));
  }
}

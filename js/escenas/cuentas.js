// La caja no cuadra (Blancaso): por la cinta caen monedas, billetes y facturas. Cada cosa a su
// bandeja antes de que llegue abajo: monedas ←, billetes →, facturas ↓ (o tocando la bandeja).
// Equivocarse o dejar que se escape una sube el bajón de Blancaso; con tres, «Otra vez no…».
// Cada vez cae más rápido. Lo que se salva va a la hucha de la aso, además de los monchis del panel.

const TIPOS_CAJA = [
  { clave: 'moneda', nombre: 'moneda', destino: 0 },
  { clave: 'billete', nombre: 'billete', destino: 1 },
  { clave: 'obj-factura', nombre: 'factura', destino: 2 },
];
const BANDEJAS = [
  { x: 250, y: 520, nombre: '← Monedas' },
  { x: 1030, y: 520, nombre: 'Billetes →' },
  { x: 640, y: 660, nombre: '↓ Facturas' },
];
const DURACION_CAJA = 45;

class Cuentas extends Phaser.Scene {
  constructor() { super('Cuentas'); }

  create(datos) {
    this.puntos = 0;
    this.bajon = 0;
    this.combo = 0;
    this.salvado = 0;
    this.restante = DURACION_CAJA;
    this.activo = false;
    this.cola = [];
    this.proximo = 0.4;

    fondo(this, enMundoHumo() ? 'bg-dentro' : 'bgn-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.5);
    this.blancaso = this.add.image(640, 190, 'blancaso').setDepth(5);
    this.escB = 150 / this.blancaso.height;
    this.blancaso.setScale(this.escB);
    // La cinta.
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(560, 250, 160, 360, 18);
    g.fillStyle(0x3d3350, 1).fillRoundedRect(568, 258, 144, 344, 14);
    this.rayas = this.add.graphics().setDepth(3);
    // Bandejas.
    this.bandejas = BANDEJAS.map((b, i) => {
      const c = this.add.container(b.x, b.y).setDepth(4);
      c.add(this.add.graphics().fillStyle(HEX.tinta, 1).fillRoundedRect(-120, -50, 240, 100, 20).fillStyle([0xf5c542, 0x7ccf8a, 0xfff6e8][i], 1).fillRoundedRect(-112, -42, 224, 84, 16));
      c.add(texto(this, 0, 0, b.nombre, 26, COLOR.tinta).setStroke(COLOR.crema, 4).setShadow(0, 0, '#000', 0));
      c.setSize(240, 100).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => this.mandar(i));
      return c;
    });

    this.textoPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoTiempo = texto(this, ANCHO - 120, 40, '', 30, COLOR.crema).setDepth(50);
    this.textoHucha = texto(this, 150, 80, 'Para la hucha: 0', 22, COLOR.verde).setDepth(50);
    this.vidasBajon = [0, 1, 2, 3, 4].map(i => this.add.circle(ANCHO - 250 + i * 40, 84, 13, 0x7ee081).setStrokeStyle(4, HEX.tinta).setDepth(50));

    this.input.keyboard.on('keydown', e => {
      const d = { ArrowLeft: 0, ArrowRight: 1, ArrowDown: 2, a: 0, d: 1, s: 2, A: 0, D: 1, S: 2 }[e.key];
      if (d !== undefined && !e.repeat) this.mandar(d);
    });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      const c = this.add.container(ANCHO / 2, 380).setDepth(80);
      c.add(this.add.graphics().fillStyle(HEX.tinta, 0.9).fillRoundedRect(-460, -110, 920, 220, 24));
      c.add(texto(this, 0, -60, 'La caja no cuadra', 40, COLOR.amarillo));
      c.add(texto(this, 0, 14, 'Lo de abajo de la cinta, a su bandeja:\nmonedas ←   billetes →   facturas ↓', 26, COLOR.crema, 860));
      this.time.delayedCall(3000, () => { c.destroy(); this.activo = true; });
    });
  }

  nuevo() {
    const tipo = Phaser.Utils.Array.GetRandom(TIPOS_CAJA);
    const img = this.add.image(640, 240, tipo.clave).setDepth(6).setAngle(Phaser.Math.Between(-15, 15));
    img.setScale(70 / Math.max(img.width, img.height));
    this.cola.push({ img, tipo });
  }

  // Manda lo más bajo de la cinta a la bandeja elegida.
  mandar(destino) {
    if (!this.activo || !this.cola.length) return;
    const o = this.cola.shift();
    const b = BANDEJAS[destino];
    this.tweens.add({ targets: o.img, x: b.x, y: b.y - 10, angle: o.img.angle + (destino === 0 ? -360 : 360), scale: o.img.scale * 0.8, duration: 220, ease: 'Sine.in', onComplete: () => o.img.destroy() });
    this.tweens.add({ targets: this.bandejas[destino], scale: 1.08, duration: 90, yoyo: true, delay: 200 });
    if (o.tipo.destino === destino) {
      this.combo++;
      const valor = o.tipo.destino === 2 ? 15 : 10;
      const pts = Math.round(valor * 5 * (1 + Math.floor(this.combo / 5) * 0.5));
      this.puntos += pts;
      if (o.tipo.destino !== 2) this.salvado += valor === 10 ? (o.tipo.destino === 1 ? 3 : 1) : 0;
      this.textoPuntos.setText(`${this.puntos} puntos`);
      this.textoHucha.setText(`Para la hucha: ${this.salvado}`);
      sfx(this, o.tipo.destino === 0 ? 'campanita' : 'papel', { volume: 0.4 });
    } else {
      this.fallo(`¡Eso no va ahí! Era ${o.tipo.nombre}`);
    }
  }

  fallo(t) {
    this.combo = 0;
    this.bajon++;
    if (this.vidasBajon[this.bajon - 1]) this.vidasBajon[this.bajon - 1].setFillStyle(HEX.rojo);
    sfx(this, 'bonk', { volume: 0.6 });
    this.cameras.main.shake(200, 0.008);
    golpeTexto(this, 640, 330, t, COLOR.rosa, 30);
    // A Blancaso le va dando el bajón: se hunde y se derrite.
    this.blancaso.setTexture(this.bajon >= 3 ? 'blancaso-derritiendose' : 'blancaso-mareado');
    this.blancaso.setScale(150 / this.blancaso.height);
    this.tweens.add({ targets: this.blancaso, y: 190 + this.bajon * 8, duration: 300 });
    if (this.bajon >= 5) this.final(false);
  }

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.restante -= dt;
    this.textoTiempo.setText(`${Math.ceil(Math.max(0, this.restante))} s`);
    const nivel = (DURACION_CAJA - this.restante) / DURACION_CAJA;
    const vel = 90 + nivel * 170;
    // Rayas de la cinta que bajan.
    this.rayas.clear().fillStyle(0x4a3d63, 1);
    for (let y = 0; y < 344; y += 40) this.rayas.fillRect(572, 258 + ((y + this.time.now * vel / 1000) % 344), 136, 6);
    this.proximo -= dt;
    if (this.proximo <= 0) {
      this.nuevo();
      this.proximo = Math.max(0.45, 1.3 - nivel * 0.85);
    }
    // Lo que va primero, marcado; si llega abajo sin clasificar, se escapa.
    this.cola.forEach((o, i) => {
      o.img.y += vel * dt;
      o.img.setAlpha(i === 0 ? 1 : 0.75);
    });
    if (this.cola[0]) {
      const p = this.cola[0].img;
      p.setScale(70 / Math.max(p.width, p.height) * (1 + Math.sin(this.time.now / 90) * 0.06));
      if (p.y > 600) {
        const o = this.cola.shift();
        this.tweens.add({ targets: o.img, alpha: 0, y: o.img.y + 40, duration: 200, onComplete: () => o.img.destroy() });
        this.fallo(`¡Se escapa una ${o.tipo.nombre}!`);
      }
    }
    if (this.restante <= 0) this.final(true);
  }

  final(acabo) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.cola.forEach(o => o.img.destroy());
    if (acabo) {
      this.blancaso.setTexture('blancaso-esperanza').setScale(150 / this.blancaso.height);
      sfx(this, 'aaah', { volume: 0.5 });
    } else {
      sfx(this, 'suspiro');
      bocadillo(this, 640, 90, 'Otra vez no…', { tam: 28 });
    }
    // Lo salvado va a la hucha (aunque haya que dejarlo a medias).
    const aHucha = acabo ? this.salvado : Math.floor(this.salvado / 2);
    ESTADO.hucha = Math.min(META_HUCHA, (ESTADO.hucha || 0) + aHucha);
    guardarPartida();
    this.time.delayedCall(1100, () => panelFinal(this, {
      titulo: acabo ? '¡La caja cuadra!' : 'A Blancaso le da el bajón',
      linea: `${aHucha} monchis salvados van a la hucha de la aso (${ESTADO.hucha}/${META_HUCHA}).`,
      puntos: this.puntos, clave: 'Cuentas', gana: acabo,
    }));
  }
}

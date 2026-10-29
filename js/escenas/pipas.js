// La apuesta de pipas (Perico): desde el banco de la plaza, meter pipas en la papelera.
// ESPACIO fija el ángulo (la flecha va y viene) y luego la fuerza (la barra sube y baja). Hay viento
// y la papelera cambia de sitio en cada tirada; a partir de la sexta, se mueve. Diez tiradas;
// encadenar aciertos multiplica. Las dos primeras enseñan el principio de la trayectoria.

const TIRADAS = 10;
const GRAVEDAD_PIPA = 900;

class Pipas extends Phaser.Scene {
  constructor() { super('Pipas'); }

  create(datos) {
    this.puntos = 0;
    this.tirada = 0;
    this.racha = 0;
    this.aciertos = 0;
    this.fase = 'espera';
    this.origen = { x: 300, y: 430 };

    fondo(this, enMundoHumo() ? 'bg-plaza' : 'bgn-plaza');
    this.perico = this.add.image(250, 610, 'perico-pipas').setOrigin(0.5, 1).setDepth(5);
    this.perico.setScale(220 / this.perico.height);
    flotar(this, this.perico, { amplitud: 3 });
    this.papelera = this.add.image(900, 655, 'papelera').setOrigin(0.5, 1).setDepth(6);
    this.g = this.add.graphics().setDepth(20);
    this.pipa = this.add.image(0, 0, 'pipa').setDepth(21).setVisible(false);

    this.textoPuntos = texto(this, ANCHO - 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoTirada = texto(this, ANCHO / 2, 40, '', 28, COLOR.crema).setDepth(50);
    this.textoViento = texto(this, ANCHO / 2, 84, '', 24, COLOR.azul).setDepth(50);
    this.textoRacha = texto(this, ANCHO - 150, 80, '', 22, COLOR.verde).setDepth(50);
    this.ayuda = texto(this, ANCHO / 2, 130, '', 24, COLOR.amarillo).setDepth(50);

    this.botonTirar = boton(this, ANCHO / 2, 670, 'ESPACIO (o toca)', () => this.pulsar(), { ancho: 340, alto: 64, tam: 24 }).setDepth(60);
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.pulsar(); });
    this.input.on('pointerdown', (_p, sobre) => { if (!sobre.length) this.pulsar(); });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      const b = bocadillo(this, 420, 300, 'Pin pin. Te apuesto a que no metes ni una.', { tam: 24, cola: 'izq' });
      this.time.delayedCall(2200, () => { b.destroy(); this.nuevaTirada(); });
    });
  }

  nuevaTirada() {
    if (this.tirada >= TIRADAS) return this.final();
    this.tirada++;
    this.textoTirada.setText(`Tirada ${this.tirada} de ${TIRADAS}`);
    // Papelera en otro sitio; desde la sexta, se mueve.
    this.tweens.killTweensOf(this.papelera);
    const x = Phaser.Math.Between(620, 1150);
    this.tweens.add({ targets: this.papelera, x, duration: 300, ease: 'Sine.out' });
    if (this.tirada >= 6) this.tweens.add({ targets: this.papelera, x: Phaser.Math.Clamp(x + Phaser.Math.Between(-160, 160), 600, 1170), duration: 1600 - this.tirada * 60, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 300 });
    this.viento = this.tirada <= 2 ? 0 : Phaser.Math.FloatBetween(-1, 1) * Math.min(1, this.tirada / 6);
    const fuerza = Math.round(Math.abs(this.viento) * 3);
    this.textoViento.setText(fuerza ? `Viento ${this.viento < 0 ? '←'.repeat(fuerza) : '→'.repeat(fuerza)}` : 'Sin viento');
    this.fase = 'angulo';
    this.t0 = this.time.now;
    this.ayuda.setText('ESPACIO para fijar el ÁNGULO');
    this.perico.setTexture('perico-pipas');
  }

  angulo() { return Phaser.Math.DegToRad(15 + 60 * (0.5 + 0.5 * Math.sin((this.time.now - this.t0) / 380))); }
  fuerza() { return 0.5 + 0.5 * Math.sin((this.time.now - this.t1) / 300 - Math.PI / 2); }

  pulsar() {
    if (this.fase === 'angulo') {
      this.ang = this.angulo();
      this.fase = 'fuerza';
      this.t1 = this.time.now;
      this.ayuda.setText('ESPACIO para fijar la FUERZA');
      sfx(this, 'pop', { volume: 0.4 });
    } else if (this.fase === 'fuerza') {
      this.lanzar(this.fuerza());
    }
  }

  velocidad(f) { return 380 + f * 620; }

  lanzar(f) {
    this.fase = 'vuelo';
    this.ayuda.setText('');
    const v = this.velocidad(f);
    this.vx = Math.cos(this.ang) * v;
    this.vy = -Math.sin(this.ang) * v;
    this.pipa.setPosition(this.origen.x, this.origen.y).setVisible(true).setScale(1.2);
    this.perico.setTexture('perico-silbando');
    sfx(this, 'fiu', { volume: 0.6 });
    this.rastro = [];
  }

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.g.clear();
    if (this.fase === 'angulo' || this.fase === 'fuerza') {
      const a = this.fase === 'angulo' ? this.angulo() : this.ang;
      // La flecha de puntería.
      const largo = 120;
      this.g.lineStyle(8, HEX.tinta, 1).lineBetween(this.origen.x, this.origen.y, this.origen.x + Math.cos(a) * largo, this.origen.y - Math.sin(a) * largo);
      this.g.lineStyle(4, HEX.amarillo, 1).lineBetween(this.origen.x, this.origen.y, this.origen.x + Math.cos(a) * largo, this.origen.y - Math.sin(a) * largo);
      if (this.fase === 'fuerza') {
        const f = this.fuerza();
        this.g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(80, 230, 36, 220, 12);
        this.g.fillStyle(f > 0.8 ? HEX.rojo : HEX.amarillo, 1).fillRoundedRect(86, 236 + 208 * (1 - f), 24, 208 * f, 8);
        // Guía: el principio de la trayectoria (solo en las dos primeras tiradas).
        if (this.tirada <= 2) {
          const v = this.velocidad(f);
          for (let i = 1; i < 9; i++) {
            const t = i * 0.06;
            const x = this.origen.x + Math.cos(a) * v * t + 0.5 * this.viento * 260 * t * t;
            const y = this.origen.y - Math.sin(a) * v * t + 0.5 * GRAVEDAD_PIPA * t * t;
            this.g.fillStyle(0xffffff, 0.8 - i * 0.08).fillCircle(x, y, 5);
          }
        }
      }
    }
    if (this.fase !== 'vuelo') return;
    this.vy += GRAVEDAD_PIPA * dt;
    this.vx += this.viento * 260 * dt;
    const antes = this.pipa.y;
    this.pipa.x += this.vx * dt;
    this.pipa.y += this.vy * dt;
    this.pipa.angle += 720 * dt;
    this.rastro.push({ x: this.pipa.x, y: this.pipa.y });
    if (this.rastro.length > 14) this.rastro.shift();
    this.rastro.forEach((p, i) => this.g.fillStyle(0xffffff, i / 30).fillCircle(p.x, p.y, 3));
    // ¿Entra? Cruza la boca de la papelera bajando.
    const boca = this.papelera.y - this.papelera.displayHeight + 8;
    const medio = this.papelera.displayWidth / 2 - 14;
    if (this.vy > 0 && antes < boca && this.pipa.y >= boca) {
      const d = Math.abs(this.pipa.x - this.papelera.x);
      if (d < medio) return this.dentro(d / medio);
      if (d < medio + 22) return this.borde();
    }
    if (this.pipa.y > 660 || this.pipa.x > ANCHO + 40 || this.pipa.x < -40) this.fuera();
  }

  dentro(centrado) {
    this.fase = 'espera';
    this.pipa.setVisible(false);
    this.racha++;
    this.aciertos++;
    const limpio = centrado < 0.35;
    const pts = Math.round((limpio ? 150 : 100) * (1 + (this.racha - 1) * 0.5));
    this.puntos += pts;
    this.textoPuntos.setText(`${this.puntos} puntos`);
    this.textoRacha.setText(this.racha >= 2 ? `Racha x${1 + (this.racha - 1) * 0.5}` : '');
    sfx(this, 'lata', { volume: 0.6 });
    sfx(this, 'campanita', { volume: 0.5 });
    this.tweens.add({ targets: this.papelera, scaleY: 0.9, duration: 80, yoyo: true });
    golpeTexto(this, this.papelera.x, this.papelera.y - 200, limpio ? `¡Limpia! +${pts}` : `¡Dentro! +${pts}`, COLOR.verde, 40);
    this.perico.setTexture('perico-horror');
    if (this.racha >= 3) this.time.delayedCall(400, () => bocadillo(this, 420, 300, Phaser.Utils.Array.GetRandom(['¡Trampa! ¡Pin pin!', 'Eso ha sido suerte.', 'Pues yo meto más. Algún día.']), { tam: 22, cola: 'izq' }));
    this.time.delayedCall(1300, () => { this.children.list.filter(o => o.type === 'Container' && o.depth === 50 && o !== this).forEach(o => o.destroy()); this.nuevaTirada(); });
  }

  borde() {
    this.vx = -this.vx * 0.4;
    this.vy = -Math.abs(this.vy) * 0.35;
    sfx(this, 'bonk', { volume: 0.5 });
    golpeTexto(this, this.papelera.x, this.papelera.y - 180, '¡Clonc!', COLOR.crema, 32);
  }

  fuera() {
    this.fase = 'espera';
    this.pipa.setVisible(false);
    this.racha = 0;
    this.textoRacha.setText('');
    sfx(this, 'pop', { volume: 0.3 });
    golpeTexto(this, Phaser.Math.Clamp(this.pipa.x, 100, ANCHO - 100), 560, 'Fuera', COLOR.rosa, 32);
    this.perico.setTexture('perico-silbando');
    sfx(this, 'pin-pin', { volume: 0.5 });
    this.time.delayedCall(1100, () => this.nuevaTirada());
  }

  final() {
    if (this._acabado) return;
    this._acabado = true;
    this.fase = 'fin';
    this.ayuda.setText('');
    this.botonTirar.destroy();
    this.time.delayedCall(500, () => panelFinal(this, {
      titulo: this.aciertos >= 5 ? '¡Le ganas a Perico!' : 'Perico se ríe de ti',
      linea: `${this.aciertos} de ${TIRADAS} pipas dentro. ${this.aciertos >= 5 ? 'Perico dice que ha sido suerte. Pin pin.' : '«Pin pin. Te lo dije.»'}`,
      puntos: this.puntos, clave: 'Pipas', gana: this.aciertos >= 5,
    }));
  }
}

// La tarta entera: Cotine se mueve por la cocina con un plato en la cabeza. Caen cosas:
// - Los pisos de la tarta: hay que atraparlos en el orden de la receta (arriba) y acabar con la guinda.
// - Patatas: son para Cotine. Le bajan el hambre.
// - Colillas: ensucian la tarta (se pierde el piso de arriba) y quitan una vida.
// El hambre sube sola: si llega arriba, Cotine se come el piso de arriba (la persona quiere servir
// una tarta entera; el estado decide). Cada tarta servida da puntos y la siguiente es más alta.

const SUELO_T = 668;
const PASO_PISO = 38;
const INGREDIENTES = [
  { clave: 'piso-bizcocho', nombre: 'bizcocho' },
  { clave: 'piso-nata', nombre: 'nata' },
  { clave: 'piso-fresa', nombre: 'fresa' },
  { clave: 'piso-choco', nombre: 'chocolate' },
];

class Tarta extends Phaser.Scene {
  constructor() { super('Tarta'); }

  create(datos) {
    this.puntos = 0;
    this.vidas = 3;
    this.hambre = 10;
    this.servidas = 0;
    this.activo = false;
    this.cayendo = [];
    this.proximo = 0.8;
    this.anchoCaptura = tiene('bandeja') ? 115 : 80;

    fondo(this, 'bg-cocina');
    this.cotine = this.add.image(640, SUELO_T, 'cotine').setOrigin(0.5, 1).setScale(0.55).setDepth(10);
    this.altoCotine = this.cotine.displayHeight;
    this.pila = this.add.container(640, SUELO_T - this.altoCotine + 30).setDepth(11);
    this.pila.add(this.add.image(0, 0, 'plato').setScale(0.8));

    // Marcadores.
    this.receta = this.add.container(ANCHO / 2, 110).setDepth(50);
    texto(this, 100, 40, 'HAMBRE', 26, COLOR.rosa).setDepth(50);
    this.add.rectangle(330, 40, 316, 30, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(50);
    this.barraHambre = this.add.rectangle(176, 40, 0, 22, HEX.rosa).setOrigin(0, 0.5).setDepth(50);
    this.textoPuntos = texto(this, 1100, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoServidas = texto(this, 1100, 80, 'Tartas: 0', 22, COLOR.crema).setDepth(50);
    this.corazones = [0, 1, 2].map(i => this.add.image(560 + i * 60, 40, 'cotine').setScale(0.1).setDepth(50));

    this.teclas = this.input.keyboard.addKeys('LEFT,RIGHT,A,D');
    this.dedo = null;
    this.input.on('pointerdown', p => { this.dedo = p; });
    this.input.on('pointerup', () => { this.dedo = null; });

    this.nuevaReceta();
    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      const fondoAyuda = this.add.rectangle(640, 360, 1060, 230, HEX.tinta, 0.8).setDepth(59);
      const ayuda = texto(this, 640, 330, 'Atrapa los pisos en el orden de la receta y acaba con la guinda.\nLas patatas, para Cotine: si el hambre llega arriba, se come la tarta y pierdes una vida.\n¡Ojo con las colillas!', 28, COLOR.crema, 1000).setDepth(60);
      const pista = texto(this, 640, 440, 'Flechas o arrastra con el dedo', 22, COLOR.azul).setDepth(60);
      this.time.delayedCall(3200, () => { ayuda.destroy(); pista.destroy(); fondoAyuda.destroy(); this.activo = true; });
    });
  }

  // Receta: N pisos al azar (empieza con bizcocho) y la guinda arriba.
  nuevaReceta() {
    const n = Math.min(2 + this.servidas, 6);
    this.pasos = [INGREDIENTES[0]];
    while (this.pasos.length < n) this.pasos.push(Phaser.Utils.Array.GetRandom(INGREDIENTES));
    this.pasos.push({ clave: 'guinda', nombre: 'guinda' });
    this.hecho = 0;
    this.sinBocados = true;
    this.pintarReceta();
  }

  pintarReceta() {
    this.receta.removeAll(true);
    const ancho = this.pasos.length * 96;
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 0.75).fillRoundedRect(-ancho / 2 - 70, -36, ancho + 90, 72, 18);
    this.receta.add(g);
    this.receta.add(this.add.text(-ancho / 2 - 58, 0, 'Receta', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema }).setOrigin(0, 0.5));
    this.pasos.forEach((p, i) => {
      const x = -ancho / 2 + 40 + i * 96;
      const img = this.add.image(x, 0, p.clave).setScale(p.clave === 'guinda' ? 0.7 : 0.5);
      if (i < this.hecho) img.setAlpha(0.3);
      if (i === this.hecho) {
        const marco = this.add.rectangle(x, 0, 90, 60).setStrokeStyle(5, HEX.amarillo);
        this.receta.add(marco);
        this.tweens.add({ targets: marco, scale: 1.12, duration: 300, yoyo: true, repeat: -1 });
      }
      this.receta.add(img);
    });
  }

  ponerPiso(clave) {
    const i = this.pila.length - 1;
    const img = this.add.image(0, -18 - i * PASO_PISO, clave).setScale(clave === 'guinda' ? 0.9 : 0.9);
    img.setScale(0.9, 0.3);
    this.tweens.add({ targets: img, scaleY: 0.9, duration: 220, ease: 'Back.out' });
    this.pila.add(img);
  }

  quitarPiso() {
    if (this.pila.length <= 1) return false;
    const img = this.pila.getAt(this.pila.length - 1);
    this.pila.remove(img, true);
    this.hecho = Math.max(0, this.hecho - 1);
    this.pintarReceta();
    return true;
  }

  alturaCaptura() {
    return this.pila.y - 10 - (this.pila.length - 1) * PASO_PISO;
  }

  soltar() {
    const necesario = this.pasos[this.hecho];
    // Se complica con cada tarta y también con el tiempo: todo cae más rápido y hay más colillas.
    const nivel = this.servidas + this.tiempo / 15;
    const r = Math.random();
    const pColilla = Math.min(0.12 + nivel * 0.035, 0.32);
    let tipo;
    let clave;
    if (r < 0.42) { tipo = 'piso'; clave = necesario.clave; }
    else if (r < 0.62) { tipo = 'piso'; clave = Phaser.Utils.Array.GetRandom([...INGREDIENTES.map(x => x.clave), 'guinda']); }
    else if (r < 1 - pColilla) { tipo = 'patatas'; clave = 'patatas'; }
    else { tipo = 'colilla'; clave = 'colilla'; }
    const escala = { patatas: 0.3, colilla: 0.32 }[tipo] || (clave === 'guinda' ? 0.75 : 0.55);
    const o = this.add.image(Phaser.Math.Between(110, ANCHO - 110), -50, clave).setScale(escala).setDepth(20);
    o.tipo = tipo;
    o.clave = clave;
    o.vy = 200 + nivel * 30 + Phaser.Math.Between(0, 80);
    o.giro = Phaser.Math.FloatBetween(-90, 90);
    this.cayendo.push(o);
  }

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.tiempo = (this.tiempo || 0) + dt;

    // Cotine se mueve con las flechas o sigue al dedo.
    const k = this.teclas;
    const dir = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    if (dir) this.cotine.x += dir * 600 * dt;
    else if (this.dedo && this.dedo.isDown) this.cotine.x = Phaser.Math.Linear(this.cotine.x, this.dedo.x, Math.min(1, dt * 12));
    this.cotine.x = Phaser.Math.Clamp(this.cotine.x, 90, ANCHO - 90);
    this.cotine.setAngle(dir * 6);
    this.pila.x = this.cotine.x;
    this.pila.setAngle(-dir * 3);

    // El hambre sube sola; arriba del todo, Cotine se come el piso de arriba.
    this.hambre += dt * (8 + this.servidas * 1.2);
    if (this.hambre >= 100) this.bocado();
    this.barraHambre.width = 308 * Math.min(1, this.hambre / 100);
    this.cotine.setTint(this.hambre > 70 ? 0xffb0c8 : 0xffffff);

    this.proximo -= dt;
    if (this.proximo <= 0) {
      this.soltar();
      this.proximo = Math.max(0.32, 0.95 - (this.servidas + this.tiempo / 15) * 0.07) + Math.random() * 0.25;
    }

    const linea = this.alturaCaptura();
    this.cayendo = this.cayendo.filter(o => {
      const antes = o.y;
      o.y += o.vy * dt;
      o.angle += o.giro * dt;
      if (antes < linea && o.y >= linea && Math.abs(o.x - this.cotine.x) < this.anchoCaptura) {
        this.atrapar(o);
        o.destroy();
        return false;
      }
      if (o.y > ALTO + 60) { o.destroy(); return false; }
      return true;
    });
  }

  atrapar(o) {
    if (!this.activo) return;
    const y = this.alturaCaptura();
    if (o.tipo === 'patatas') {
      this.hambre = Math.max(0, this.hambre - 45);
      this.sumar(5);
      sfx(this, 'nam', { volume: 0.7 });
      golpeTexto(this, this.cotine.x, y - 40, '¡Ñam!', COLOR.amarillo, 40);
      return;
    }
    if (o.tipo === 'colilla') {
      this.vidas--;
      this.corazones[this.vidas].setTint(0x333333).setAlpha(0.4);
      this.quitarPiso();
      this.sinBocados = false;
      sfx(this, 'arcada', { volume: 0.7 });
      this.cameras.main.shake(250, 0.012);
      golpeTexto(this, this.cotine.x, y - 40, '¡PUAJ!', COLOR.verde, 56);
      if (this.vidas <= 0) this.final();
      return;
    }
    const necesario = this.pasos[this.hecho];
    if (o.clave !== necesario.clave) {
      sfx(this, 'chof', { volume: 0.7 });
      golpeTexto(this, this.cotine.x, y - 40, `¡Toca ${necesario.nombre}!`, COLOR.rosa, 36);
      return;
    }
    this.ponerPiso(o.clave);
    this.hecho++;
    this.sumar(20);
    sfx(this, 'pop', { volume: 0.6 });
    if (this.hecho >= this.pasos.length) this.servir();
    else this.pintarReceta();
  }

  bocado() {
    this.hambre = 35;
    const habia = this.quitarPiso();
    this.sinBocados = this.sinBocados && !habia;
    sfx(this, 'nam');
    // Se la come delante de todos: pierde una vida (antes no costaba nada y no se podía perder).
    this.vidas--;
    this.corazones[this.vidas].setTint(0x333333).setAlpha(0.4);
    this.cameras.main.shake(250, 0.01);
    if (this.vidas <= 0) this.time.delayedCall(400, () => this.final());
    this.tweens.add({ targets: this.cotine, scaleX: 0.62, scaleY: 0.5, duration: 100, yoyo: true, repeat: 1 });
    golpeTexto(this, this.cotine.x, this.alturaCaptura() - 50, habia ? '¡Se la come delante de todos!' : '¡Qué hambre!', COLOR.rosa, 40);
    const p = this.add.particles(this.cotine.x, this.alturaCaptura(), 'miga', {
      speed: { min: 120, max: 300 }, angle: { min: 200, max: 340 }, gravityY: 900,
      lifespan: 700, tint: [0xff8fc0, 0xffffff, 0xc98a4b], emitting: false,
    }).setDepth(30);
    p.explode(14);
    this.time.delayedCall(900, () => p.destroy());
  }

  servir() {
    const pisos = this.pasos.length;
    const bonus = this.sinBocados ? 150 : 0;
    this.sumar(100 * pisos + bonus);
    this.servidas++;
    this.textoServidas.setText(`Tartas: ${this.servidas}`);
    sfx(this, 'campanita');
    sfx(this, 'aaah', { volume: 0.5 });
    golpeTexto(this, 640, 250, this.sinBocados ? '¡ENTERA! Momento persona' : '¡SERVIDA!', COLOR.amarillo, 60);
    // La tarta sale volando hacia el bar y Cotine se queda con un plato nuevo.
    const tarta = this.pila;
    this.tweens.add({ targets: tarta, x: ANCHO + 300, y: tarta.y - 120, angle: 20, duration: 600, ease: 'Sine.in', onComplete: () => tarta.destroy() });
    this.pila = this.add.container(this.cotine.x, SUELO_T - this.altoCotine + 30).setDepth(11);
    this.pila.add(this.add.image(0, 0, 'plato').setScale(0.8));
    this.nuevaReceta();
  }

  sumar(n) {
    this.puntos += n;
    this.textoPuntos.setText(`${this.puntos} puntos`);
  }

  final() {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.cayendo.forEach(o => o.destroy());
    this.cotine.setTexture('cotine-plop');
    this.pila.setVisible(false);
    sfx(this, 'plop');
    golpeTexto(this, 640, 260, '¡PLOP!', COLOR.rosa, 96);
    const t = this.servidas;
    this.time.delayedCall(1000, () => panelFinal(this, {
      titulo: t ? `${t} tarta${t > 1 ? 's' : ''} servida${t > 1 ? 's' : ''}` : 'Ni una tarta',
      linea: t >= 3 ? 'Cotine nunca había servido tanto. Ni ella se lo cree.' : '«¿Qué? Tenía hambre.»',
      puntos: this.puntos, clave: 'Tarta', gana: t > 0,
    }));
  }
}

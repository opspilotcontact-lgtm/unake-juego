// El blancazo: Monchiman contra Puky en la plaza, con Blancaso derritiéndose en el banco.
// Combate de jefe en tres fases:
//   1. Escupitajos apuntados y lluvia de pota en arco.
//   2. Puky se ríe: pukitos que saltan por el suelo y el muro de eructo (con un hueco para pasar).
//   3. Puky se enfada: sube y baja, gotea desde arriba y escupe más rápido.
// Monchiman dispara caramelos solo, esquiva con la nube (Mayús) y, con el medidor lleno,
// lanza un resucitador (X) que hace mucho daño. Tres golpes y Puky se sale con la suya.

const SUELO_B = 650;
const VIDA_PUKY = 170;

class Blancazo extends Phaser.Scene {
  constructor() { super('Blancazo'); }

  create(datos) {
    this.vida = 3;
    this.hp = VIDA_PUKY;
    this.fase = 1;
    this.t = 0;
    this.activo = false;
    this.balas = [];
    this.gotas = [];
    this.pukitos = [];
    this.muros = [];
    this.carga = 0;
    this.cargaMax = 26;
    this.supers = 0;
    this.golpes = 0;
    this.invul = 0;
    this.nubeT = 0;
    this.nubeEspera = 0;
    this.disparoT = 0;
    this.ataqueT = 2;
    this.ataqueN = 0;
    this.goteoT = 0;

    fondo(this, 'bg-plaza');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.3);
    this.blancaso = this.add.image(150, SUELO_B, 'blancaso-derritiendose').setOrigin(0.5, 1);
    this.blancaso.setScale(170 / this.blancaso.height);
    const anillo = this.add.circle(150, SUELO_B - 85, 100).setStrokeStyle(6, HEX.amarillo, 0.7);
    this.tweens.add({ targets: anillo, scale: 1.2, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.puky = this.add.image(1040, SUELO_B, 'puky').setOrigin(0.5, 1).setDepth(5);
    this.gestoT = 0;
    this.texturaPuky('puky');

    this.heroe = this.add.image(320, 380, 'monchiman').setDepth(20);
    this.heroe.setScale(130 / this.heroe.height);
    this.escHeroe = this.heroe.scaleX;

    this.hudJefe();
    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SHIFT,X,SPACE');
    this.input.keyboard.on('keydown-SHIFT', () => this.nube());
    this.input.keyboard.on('keydown-X', () => this.resucitador());
    this.dedo = null;
    this.input.on('pointerdown', (p, sobre) => { if (!sobre.length) this.dedo = p; });
    this.input.on('pointerup', () => { this.dedo = null; });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => this.presentacion());
  }

  hudJefe() {
    const D = 100;
    texto(this, ANCHO / 2, 30, 'PUKY · el blancazo', 26, COLOR.amarillo).setDepth(D);
    this.add.rectangle(ANCHO / 2, 64, 620, 28, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(D);
    this.barraJefe = this.add.rectangle(ANCHO / 2 - 304, 64, 608, 18, 0xf5d23a).setOrigin(0, 0.5).setDepth(D);
    [2 / 3, 1 / 3].forEach(f => this.add.rectangle(ANCHO / 2 - 304 + 608 * f, 64, 4, 28, HEX.tinta).setDepth(D + 1));
    this.corazones = [0, 1, 2].map(i => this.add.image(40 + i * 56, 40, 'monchiman').setScale(0.09).setDepth(D));
    texto(this, 112, 82, 'RESUCITADOR (X)', 18, COLOR.crema).setDepth(D);
    this.add.rectangle(112, 108, 200, 22, HEX.tinta).setStrokeStyle(3, HEX.crema).setDepth(D);
    this.barraCarga = this.add.rectangle(14, 108, 0, 14, 0xb68cff).setOrigin(0, 0.5).setDepth(D);
    boton(this, ANCHO - 120, 120, 'Nube (Mayús)', () => this.nube(), { ancho: 200, alto: 54, tam: 19, color: HEX.crema }).setDepth(D);
    boton(this, ANCHO - 120, 184, 'Resucitador (X)', () => this.resucitador(), { ancho: 200, alto: 54, tam: 19, color: 0xb68cff }).setDepth(D);
  }

  presentacion() {
    const t1 = texto(this, ANCHO / 2, 300, 'PUKY · EL BLANCAZO', 76, COLOR.amarillo).setDepth(200).setScale(0);
    const banda = this.add.rectangle(ANCHO / 2, 390, ANCHO, 50, HEX.tinta, 0.75).setDepth(199);
    const t2 = texto(this, ANCHO / 2, 390, 'Flechas para moverte · disparas solo · Mayús esquiva · X resucitador', 24, COLOR.crema).setDepth(200).setAlpha(0);
    sfx(this, 'sting', { volume: 0.6 });
    this.tweens.add({ targets: t1, scale: 1, duration: 450, ease: 'Back.out' });
    this.tweens.add({ targets: t2, alpha: 1, duration: 400, delay: 300 });
    this.time.delayedCall(2200, () => {
      t1.destroy(); t2.destroy(); banda.destroy();
      golpeTexto(this, ANCHO / 2, 330, '¡Que no cunda el amarillo!', COLOR.amarillo, 64).setDepth(200);
      sfx(this, 'tiroriro');
      this.activo = true;
    });
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.t += dt;
    this.invul -= dt;
    this.nubeT -= dt;
    this.nubeEspera -= dt;

    this.moverHeroe(dt);
    this.disparar(dt);
    this.atacar(dt);
    this.moverTodo(dt);
    this.animarPuky(dt);

    this.barraJefe.width = 608 * Math.max(0, this.hp / VIDA_PUKY);
    this.barraCarga.width = 196 * this.carga / this.cargaMax;
    this.barraCarga.fillColor = this.carga >= this.cargaMax && Math.sin(this.time.now / 80) > 0 ? 0xffffff : 0xb68cff;
    this.heroe.setAlpha(this.invul > 0 ? 0.35 + 0.65 * (Math.sin(this.time.now / 40) > 0 ? 1 : 0) : 1);
  }

  moverHeroe(dt) {
    const k = this.teclas;
    let dx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    let dy = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    if (!dx && !dy && this.dedo && this.dedo.isDown) {
      const vx = this.dedo.x - this.heroe.x;
      const vy = this.dedo.y - 80 - this.heroe.y;
      const d = Math.hypot(vx, vy);
      if (d > 12) { dx = vx / d; dy = vy / d; }
    }
    const n = Math.hypot(dx, dy) || 1;
    if (dx || dy) this.dirNube = { x: dx / n, y: dy / n };
    const vel = this.nubeT > 0 ? 1300 : 440;
    const mx = this.nubeT > 0 ? this.dirNube.x : dx / n;
    const my = this.nubeT > 0 ? this.dirNube.y : dy / n;
    this.heroe.x = Phaser.Math.Clamp(this.heroe.x + mx * vel * dt, 60, 780);
    this.heroe.y = Phaser.Math.Clamp(this.heroe.y + my * vel * dt, 150, SUELO_B - 50);
    // Vuela con peso: se inclina, se estira con la velocidad y bota un poco.
    this.heroe.setAngle(Phaser.Math.Linear(this.heroe.angle, mx * 12 + my * 6, 0.2));
    const estira = this.nubeT > 0 ? 1.25 : 1 + Math.abs(mx) * 0.06;
    this.heroe.setScale(this.escHeroe * estira, this.escHeroe / estira);
    if ((dx || dy || this.nubeT > 0) && Math.random() < (this.nubeT > 0 ? 1 : 0.35)) {
      const p = this.add.image(this.heroe.x - mx * 50, this.heroe.y + 20, 'humo').setScale(0.1).setTint(0xd8cfe6).setAlpha(0.7).setDepth(19);
      this.tweens.add({ targets: p, scale: 0.22, alpha: 0, duration: 450, onComplete: () => p.destroy() });
    }
  }

  disparar(dt) {
    this.disparoT -= dt;
    if (this.disparoT > 0) return;
    this.disparoT = 0.13;
    const b = this.add.image(this.heroe.x + 60, this.heroe.y - 6 + Phaser.Math.Between(-6, 6), 'caramelo').setScale(0.13).setDepth(18);
    b.vx = 980;
    this.balas.push(b);
    if (Math.random() < 0.3) sfx(this, 'pop', { volume: 0.08 });
  }

  centroPuky() {
    const h = this.puky.displayHeight;
    return { x: this.puky.x, y: this.puky.y - h * 0.5, r: h * 0.4 };
  }

  moverTodo(dt) {
    const c = this.centroPuky();
    this.balas = this.balas.filter(b => {
      b.x += b.vx * dt;
      b.angle += 900 * dt;
      if (b.super) b.angle += 600 * dt;
      // Contra un pukito.
      const pk = this.pukitos.find(m => Math.hypot(m.img.x - b.x, m.img.y - 40 - b.y) < 55);
      if (pk && !b.super) { this.danarPukito(pk); b.destroy(); return false; }
      if (Math.hypot(b.x - c.x, b.y - c.y) < c.r) { this.danarPuky(b.super ? 18 : 1, b.x, b.y); b.destroy(); return false; }
      if (b.x > ANCHO + 60) { b.destroy(); return false; }
      return true;
    });

    const h = this.heroe;
    const meToca = (x, y, r) => Math.hypot(h.x - x, h.y - y) < r;
    this.gotas = this.gotas.filter(g => {
      g.vy += (g.g || 0) * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.angle += 200 * dt;
      if (meToca(g.x, g.y, 42)) { this.tocado(); g.destroy(); return false; }
      if (g.y > SUELO_B + 10) { this.charquito(g.x); g.destroy(); return false; }
      if (g.x < -60 || g.x > ANCHO + 60 || g.y < -200) { g.destroy(); return false; }
      return true;
    });

    this.pukitos = this.pukitos.filter(m => {
      m.vy += 1500 * dt;
      m.img.x += m.vx * dt;
      m.img.y += m.vy * dt;
      if (m.img.y >= SUELO_B) {
        m.img.y = SUELO_B;
        m.vy = Math.random() < 0.6 ? -Phaser.Math.Between(500, 820) : 0;
        if (m.vy) sfx(this, 'boing', { volume: 0.2 });
        m.img.setScale(m.esc * 1.3, m.esc * 0.7);
        this.tweens.add({ targets: m.img, scaleX: m.esc, scaleY: m.esc, duration: 200 });
      }
      if (meToca(m.img.x, m.img.y - 45, 60)) this.tocado();
      if (m.img.x < -80 || m.hp <= 0) { m.img.destroy(); return false; }
      return true;
    });

    this.muros = this.muros.filter(w => {
      w.x -= 430 * dt;
      w.imgs.forEach(i => { i.x = w.x + Math.sin(this.time.now / 120 + i.y) * 10; });
      if (Math.abs(h.x - w.x) < 70 && Math.abs(h.y - w.hueco) > 95) this.tocado();
      if (w.x < -120) { w.imgs.forEach(i => i.destroy()); return false; }
      return true;
    });

    if (this.fase === 3) {
      this.goteoT -= dt;
      if (this.goteoT <= 0) {
        this.goteoT = 0.32;
        const g = this.add.image(Phaser.Math.Between(60, 820), -20, 'gota').setScale(0.8).setDepth(15);
        Object.assign(g, { vx: 0, vy: 160, g: 500 });
        this.gotas.push(g);
      }
    }
  }

  // ---------- Puky ----------

  atacar(dt) {
    this.ataqueT -= dt;
    if (this.ataqueT > 0) return;
    this.ataqueT = [0, 1.8, 1.6, 1.15][this.fase];
    this.ataqueN++;
    const patrones = this.fase === 1 ? ['escupir', 'arco'] : this.fase === 2 ? ['escupir', 'pukitos', 'eructo', 'arco'] : ['escupir', 'eructo', 'pukitos', 'escupir', 'arco'];
    const p = patrones[this.ataqueN % patrones.length];
    this.gesto(p === 'eructo' ? 'puky-eructo' : null);
    if (p === 'escupir') this.escupir(this.fase === 3 ? 5 : 3);
    if (p === 'arco') this.arco(this.fase === 1 ? 5 : 7);
    if (p === 'pukitos') this.soltarPukitos(this.fase === 3 ? 3 : 2);
    if (p === 'eructo') this.time.delayedCall(350, () => this.eructo());
  }

  // Se encoge antes de atacar y se estira al soltar (anticipación de dibujo animado).
  gesto(pose) {
    this.gestoT = 0.4;
    this.gestoPose = pose;
    this.gestoPuesto = false;
  }

  posePuky() {
    return this.fase === 1 ? 'puky' : this.fase === 2 ? 'puky-riendo' : 'puky-horror';
  }

  // Cambia la pose manteniendo la altura y mirando hacia Monchiman (a la izquierda).
  texturaPuky(clave) {
    this.puky.setTexture(clave);
    this.escPuky = 400 / this.puky.height;
    this.puky.setFlipX(MIRA[clave] === 1);
    this.puky.setScale(this.escPuky);
  }

  // Respira; al atacar se encoge (anticipación), suelta con la pose del ataque y vuelve a la suya.
  animarPuky(dt) {
    let sx;
    let sy;
    if (this.gestoT > 0) {
      this.gestoT -= dt;
      const f = 1 - Math.max(0, this.gestoT) / 0.4;
      const k = Math.sin(f * Math.PI);
      sx = 1 + 0.18 * k;
      sy = 1 - 0.18 * k;
      if (f > 0.5 && !this.gestoPuesto) { this.gestoPuesto = true; if (this.gestoPose) this.texturaPuky(this.gestoPose); }
      if (this.gestoT <= 0) this.texturaPuky(this.posePuky());
    } else {
      const t = this.time.now / 350;
      sx = 1 - 0.03 * Math.sin(t);
      sy = 1 + 0.05 * Math.sin(t);
    }
    this.puky.setScale(this.escPuky * sx, this.escPuky * sy);
  }

  boca() {
    const c = this.centroPuky();
    return { x: c.x - this.puky.displayWidth * 0.25, y: c.y - 10 };
  }

  escupir(n) {
    sfx(this, 'blurp', { volume: 0.7 });
    const o = this.boca();
    const ang = Math.atan2(this.heroe.y - o.y, this.heroe.x - o.x);
    const vel = this.fase === 3 ? 520 : 400;
    for (let i = 0; i < n; i++) {
      const a = ang + (i - (n - 1) / 2) * 0.16;
      const g = this.add.image(o.x, o.y, 'gota').setDepth(15);
      Object.assign(g, { vx: Math.cos(a) * vel, vy: Math.sin(a) * vel, g: 0 });
      this.gotas.push(g);
    }
  }

  arco(n) {
    sfx(this, 'arcada', { volume: 0.5 });
    const o = this.boca();
    for (let i = 0; i < n; i++) {
      const g = this.add.image(o.x, o.y - 30, 'gota').setScale(1.1).setDepth(15);
      Object.assign(g, { vx: -Phaser.Math.Between(220, 620), vy: -Phaser.Math.Between(520, 820), g: 900 });
      this.gotas.push(g);
    }
  }

  soltarPukitos(n) {
    sfx(this, 'puky-gracioso', { volume: 0.5 });
    for (let i = 0; i < n; i++) {
      this.time.delayedCall(i * 300, () => {
        const img = this.add.image(this.puky.x - 120, SUELO_B, 'puky').setOrigin(0.5, 1).setDepth(14);
        const esc = 90 / img.height;
        img.setScale(esc);
        this.pukitos.push({ img, esc, vx: -Phaser.Math.Between(180, 260), vy: -600, hp: 3 });
      });
    }
  }

  eructo() {
    sfx(this, 'eructo');
    this.cameras.main.shake(250, 0.006);
    const hueco = Phaser.Math.Between(200, SUELO_B - 160);
    const w = { x: this.puky.x - 200, hueco, imgs: [] };
    for (let y = 100; y <= SUELO_B; y += 60) {
      if (Math.abs(y - hueco) < 110) continue;
      const i = this.add.image(w.x, y, 'humo').setScale(0.55).setTint(0xb5e36b).setAlpha(0.9).setDepth(16);
      w.imgs.push(i);
    }
    this.muros.push(w);
  }

  charquito(x) {
    const c = this.add.ellipse(x, SUELO_B + 4, 50, 12, 0xf5d23a, 0.8).setDepth(3);
    this.tweens.add({ targets: c, scaleX: 1.6, alpha: 0, duration: 900, onComplete: () => c.destroy() });
  }

  danarPukito(m) {
    m.hp--;
    m.img.setTintFill(0xffffff);
    this.time.delayedCall(50, () => m.img.active && m.img.clearTint());
    if (m.hp <= 0) {
      sfx(this, 'chof', { volume: 0.5 });
      this.salpicon(m.img.x, m.img.y - 40, 10);
    }
  }

  danarPuky(d, x, y) {
    this.hp -= d;
    this.carga = Math.min(this.cargaMax, this.carga + (d > 1 ? 0 : 1));
    // Destello al recibir: suave y como mucho uno cada 0,18 s (con el disparo seguido, si no, parpadea entero).
    if (d > 1 || this.time.now - (this.ultimoDestello || 0) > 180) {
      this.ultimoDestello = this.time.now;
      if (d > 1) this.puky.setTintFill(0xffffff); else this.puky.setTint(0xfff1a8);
      this.time.delayedCall(d > 1 ? 90 : 50, () => this.puky.clearTint());
    }
    if (Math.random() < 0.4 || d > 1) this.salpicon(x, y, d > 1 ? 30 : 4);
    if (this.fase === 1 && this.hp <= VIDA_PUKY * 2 / 3) this.cambiarFase(2, '¡Puky se parte de risa!');
    else if (this.fase === 2 && this.hp <= VIDA_PUKY / 3) this.cambiarFase(3, '¡Puky se enfada!');
    if (this.hp <= 0) this.victoria();
  }

  cambiarFase(n, grito) {
    this.fase = n;
    this.texturaPuky(this.posePuky());
    sfx(this, n === 2 ? 'risas' : 'temblor', { volume: 0.6 });
    this.cameras.main.shake(500, 0.012);
    golpeTexto(this, ANCHO / 2, 200, grito, COLOR.amarillo, 52).setDepth(200);
    this.ataqueT = 1.4;
    if (n === 3) this.tweens.add({ targets: this.puky, y: SUELO_B - 140, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  salpicon(x, y, n) {
    const p = this.add.particles(x, y, 'miga', {
      speed: { min: 80, max: 320 }, gravityY: 800, scale: { start: 1, end: 0.3 }, lifespan: 600,
      tint: [0xf5d23a, 0xfff6a8, 0xd9b400], emitting: false,
    }).setDepth(30);
    p.explode(n);
    this.time.delayedCall(700, () => p.destroy());
  }

  // ---------- Monchiman ----------

  nube() {
    if (!this.activo || this.nubeEspera > 0) return;
    this.nubeT = 0.2;
    this.nubeEspera = 0.7;
    this.invul = Math.max(this.invul, 0.3);
    if (!this.dirNube) this.dirNube = { x: 1, y: 0 };
    sfx(this, 'zas', { volume: 0.5 });
  }

  resucitador() {
    if (!this.activo || this.carga < this.cargaMax) return;
    this.carga = 0;
    this.supers++;
    sfx(this, 'fiuuu');
    const b = this.add.image(this.heroe.x + 70, this.heroe.y, 'lata').setScale(0.35).setDepth(18);
    b.vx = 820;
    b.super = true;
    this.balas.push(b);
    this.heroe.setTexture('monchiman-picado');
    this.time.delayedCall(350, () => this.heroe.setTexture('monchiman'));
    golpeTexto(this, this.heroe.x + 80, this.heroe.y - 90, '¡Resucitador!', '#c9a2ff', 40).setDepth(200);
  }

  tocado() {
    if (this.invul > 0 || this.nubeT > 0 || !this.activo) return;
    this.vida--;
    this.golpes++;
    this.invul = 1.4;
    this.corazones[this.vida].setTint(0x333333).setAlpha(0.4);
    sfx(this, 'golpe');
    sfx(this, 'chof', { volume: 0.6 });
    this.cameras.main.shake(300, 0.015);
    this.cameras.main.flash(120, 245, 210, 58);
    this.heroe.setTintFill(0xf5d23a);
    this.time.delayedCall(120, () => this.heroe.clearTint());
    if (this.vida <= 0) this.derrota();
  }

  limpiar() {
    [...this.balas, ...this.gotas].forEach(o => o.destroy());
    this.pukitos.forEach(m => m.img.destroy());
    this.muros.forEach(w => w.imgs.forEach(i => i.destroy()));
    this.balas = []; this.gotas = []; this.pukitos = []; this.muros = [];
  }

  victoria() {
    if (!this.activo) return;
    this.activo = false;
    this.limpiar();
    this.tweens.killTweensOf(this.puky);
    this.puky.setTexture('puky-horror').setFlipX(false);
    sfx(this, 'temblor');
    this.cameras.main.shake(900, 0.02);
    this.salpicon(this.puky.x, this.puky.y - 200, 40);
    this.time.delayedCall(900, () => {
      this.puky.setTexture('puky-charco').setY(SUELO_B);
      this.puky.setScale(420 / this.puky.width);
      sfx(this, 'chapoteo');
      this.tweens.add({ targets: this.puky, scaleY: this.puky.scaleY * 0.6, duration: 600, ease: 'Bounce.out' });
      golpeTexto(this, ANCHO / 2, 260, '¡RESCATADO!', COLOR.amarillo, 96).setDepth(200);
      sfx(this, 'platillo');
    });
    this.time.delayedCall(1900, () => {
      cambiarPose(this, this.blancaso, 'blancaso-esperanza');
      sfx(this, 'aaah', { volume: 0.6 });
      bocadillo(this, 330, 420, 'Gracias… otra vez.', { tam: 26, cola: 'izq' });
    });
    ESTADO.blancazo = null;
    sumarStat('blancazos');
    const puntos = Math.max(0, Math.round(1200 + this.vida * 150 - this.t * 5 + this.supers * 40 - this.golpes * 50));
    this.time.delayedCall(3600, () => panelFinal(this, {
      titulo: '¡Blancaso, a salvo!',
      linea: `Puky, hecho un charco en ${Math.round(this.t)} s. A Blancaso se le limpian los ojos: momento persona.`,
      puntos, clave: 'Blancazo',
    }));
  }

  derrota() {
    this.activo = false;
    this.limpiar();
    this.tweens.killTweensOf(this.puky);
    this.puky.setTexture('puky-que-rico').setY(SUELO_B).setFlipX(false);
    this.puky.setScale(400 / this.puky.height);
    this.tweens.add({ targets: this.puky, x: 420, duration: 1200, ease: 'Sine.inOut' });
    this.time.delayedCall(1100, () => {
      sfx(this, 'puky-gracioso');
      bocadillo(this, 520, 230, '¿Me llamabais?', { tam: 34 });
    });
    const puntos = Math.round((1 - Math.max(0, this.hp) / VIDA_PUKY) * 100);
    this.time.delayedCall(2800, () => panelFinal(this, {
      titulo: 'Puky se sale con la suya',
      linea: 'Nadie le había llamado. Como siempre. Blancaso sigue en la plaza: aún llegas.',
      puntos, clave: 'Blancazo', gana: false,
    }));
  }
}

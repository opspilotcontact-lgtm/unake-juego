// El palo (la noche de Cotine, semilla del E03): Perico le ha robado el palo a Cotine para usarlo de
// percha. Sin palo, Cotine se hincha y flota sobre el barrio con la tarta en la cabeza.
// Jefe estilo Cuphead: muévete (flechas o joystick), MANTÉN para disparar virutas de azúcar y
// recupera el palo. Perico tiene tres fases: pipas sueltas, abanicos de pipas y picados.

const VIDA_PERICO = 100;

class Palo extends Phaser.Scene {
  constructor() { super('Palo'); }

  create(datos) {
    this.vidas = 3;
    this.hp = VIDA_PERICO;
    this.invul = 0;
    this.activo = false;
    this.balas = [];
    this.pipas = [];
    this.t = 0;
    this.cadencia = 0;
    this.picando = false; // si la anterior acabó en pleno picado, Perico no volvía a disparar
    this.proximo = 1.2;

    fondo(this, 'bg-cielo');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.15);
    // Cotine, hinchada, con la tarta en la cabeza.
    this.cotine = this.add.container(260, 380).setDepth(10);
    const cuerpo = this.add.image(0, 0, 'cotine-plop');
    cuerpo.setScale(150 / cuerpo.height);
    const tarta = this.add.image(0, -86, 'tarta');
    tarta.setScale(60 / tarta.height);
    this.cotine.add([cuerpo, tarta]);
    this.tweens.add({ targets: this.cotine, scaleX: 1.05, scaleY: 0.96, duration: 500, yoyo: true, repeat: -1 });
    // Perico con el palo.
    this.perico = this.add.container(1060, 360).setDepth(10);
    const palo = this.add.rectangle(-10, 70, 16, 170, 0xff8fc0).setStrokeStyle(4, HEX.tinta).setAngle(20);
    this.cuerpoPerico = this.add.image(0, 0, 'perico-volando');
    this.cuerpoPerico.setScale(180 / this.cuerpoPerico.height);
    this.perico.add([palo, this.cuerpoPerico]);
    this.baseY = 360;

    // Barra de vida de Perico y vidas de Cotine.
    texto(this, ANCHO / 2, 34, 'PERICO · el ladrón de palos', 24, COLOR.crema).setDepth(50);
    this.add.rectangle(ANCHO / 2, 66, 500, 22, 0x000000, 0.5).setStrokeStyle(4, HEX.tinta).setDepth(50);
    this.barra = this.add.rectangle(ANCHO / 2 - 248, 66, 496, 18, HEX.rosa).setOrigin(0, 0.5).setDepth(51);
    this.vidasG = [0, 1, 2].map(i => this.add.circle(60 + i * 40, 40, 14, 0xff8fc0).setStrokeStyle(4, HEX.tinta).setDepth(50));

    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE');
    this.input.on('pointerdown', p => { this.dedo = p; });
    this.input.on('pointermove', p => { if (p.isDown) this.dedo = p; });
    this.input.on('pointerup', () => { this.dedo = null; });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      Comic.cartela(this, 'PERICO', 'tiene tu palo', '#d0d4dc', { x: 700, y: ALTO - 200, ms: 1800 });
      const t = texto(this, ANCHO / 2, ALTO / 2, '¡A POR EL PALO!', 80, COLOR.amarillo).setDepth(60).setScale(0);
      this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.out', delay: 1300 });
      this.time.delayedCall(2400, () => { t.destroy(); this.activo = true; sfx(this, 'pin-pin'); });
    });
  }

  fase() { return this.hp > 66 ? 1 : this.hp > 33 ? 2 : 3; }

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.t += dt;
    this.invul = Math.max(0, this.invul - dt);
    const k = this.teclas;
    let dx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    let dy = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    // En el móvil sin joystick: tocar y arrastrar lleva a Cotine hacia el dedo (y dispara).
    if (this.dedo && !window.TACTIL_UI) {
      const vx = this.dedo.x - this.cotine.x; const vy = this.dedo.y - this.cotine.y; const d = Math.hypot(vx, vy);
      if (d > 20) { dx = vx / d; dy = vy / d; }
    }
    const c = this.cotine;
    c.x = Phaser.Math.Clamp(c.x + dx * 330 * dt, 80, 760);
    c.y = Phaser.Math.Clamp(c.y + dy * 330 * dt + Math.sin(this.t * 2) * 12 * dt, 110, ALTO - 70);
    c.setAlpha(this.invul > 0 && Math.floor(this.invul * 10) % 2 ? 0.4 : 1);

    // Disparo: virutas de azúcar.
    this.cadencia -= dt;
    if ((k.SPACE.isDown || this.dedo) && this.cadencia <= 0) {
      this.cadencia = 0.16;
      const b = this.add.star(c.x + 70, c.y - 10, 5, 6, 13, Phaser.Utils.Array.GetRandom([0xff8fc0, 0xffd23f, 0x5ad1ff])).setStrokeStyle(3, HEX.tinta).setDepth(9);
      this.balas.push(b);
      if (Math.random() < 0.3) sfx(this, 'pop', { volume: 0.15 });
    }
    this.balas = this.balas.filter(b => {
      b.x += 900 * dt; b.angle += 600 * dt;
      if (b.x > ANCHO + 30) { b.destroy(); return false; }
      if (Math.abs(b.x - this.perico.x) < 70 && Math.abs(b.y - this.perico.y) < 80 && !this.picando) {
        b.destroy();
        this.hp = Math.max(0, this.hp - 1.5);
        this.cuerpoPerico.setTintFill(0xffffff);
        this.time.delayedCall(50, () => this.cuerpoPerico.clearTint());
        return false;
      }
      return true;
    });
    this.barra.width = 496 * this.hp / VIDA_PERICO;

    // Perico: flota, y según la fase tira pipas, abanicos o se lanza en picado.
    const f = this.fase();
    if (!this.picando) this.perico.y = this.baseY + Math.sin(this.t * (1 + f * 0.4)) * 200;
    this.proximo = (this.proximo ?? 1.2) - dt;
    if (this.proximo <= 0 && !this.picando) {
      if (f === 1) { this.proximo = 1.35; this.tirarPipa(0); }
      else if (f === 2) { this.proximo = 1.3; [-0.35, 0, 0.35].forEach(a => this.tirarPipa(a)); }
      else if (Math.random() < 0.35) { this.proximo = 2.4; this.picado(); }
      else { this.proximo = 0.9; [-0.5, -0.25, 0, 0.25, 0.5].forEach(a => this.tirarPipa(a)); }
    }
    this.pipas = this.pipas.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.angle += 400 * dt;
      if (p.x < -40 || p.y < -40 || p.y > ALTO + 40) { p.destroy(); return false; }
      if (Math.abs(p.x - c.x) < 32 && Math.abs(p.y - c.y) < 42) { p.destroy(); this.golpe(); return false; }
      return true;
    });
    if (this.picando && Math.abs(this.perico.x - c.x) < 80 && Math.abs(this.perico.y - c.y) < 90) this.golpe();
    if (this.hp <= 0) this.final(true);
  }

  tirarPipa(desvio) {
    const p = this.add.ellipse(this.perico.x - 60, this.perico.y, 22, 12, 0x3a2e24).setStrokeStyle(3, 0xf2e6c8).setDepth(9);
    const a = Math.atan2(this.cotine.y - p.y, this.cotine.x - p.x) + desvio;
    const v = 280 + this.fase() * 40;
    p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
    this.pipas.push(p);
    sfx(this, 'pin-pin', { volume: 0.12 });
  }

  // Picado: Perico cruza la pantalla en horizontal a la altura de Cotine (con aviso).
  picado() {
    this.picando = true;
    const y = this.cotine.y;
    const aviso = texto(this, ANCHO - 120, y, '¡!', 60, COLOR.rojo).setDepth(40);
    this.tweens.add({ targets: aviso, alpha: 0.2, duration: 120, yoyo: true, repeat: 3, onComplete: () => aviso.destroy() });
    this.tweens.add({ targets: this.perico, y, duration: 400 });
    this.time.delayedCall(800, () => {
      sfx(this, 'fiuuu', { volume: 0.5 });
      this.tweens.add({ targets: this.perico, x: -150, duration: 900, ease: 'Quad.in', onComplete: () => {
        this.perico.x = ANCHO + 150;
        this.tweens.add({ targets: this.perico, x: 1060, duration: 700, ease: 'Quad.out', onComplete: () => { this.picando = false; } });
      } });
    });
  }

  golpe() {
    if (this.invul > 0 || !this.activo) return;
    this.invul = 1.4;
    this.vidas--;
    if (this.vidasG[this.vidas]) this.vidasG[this.vidas].setFillStyle(0x3d3350);
    sfx(this, 'golpe', { volume: 0.6 });
    this.cameras.main.shake(220, 0.01);
    Comic.impacto(this, this.cotine.x, this.cotine.y, { tam: 70, profundidad: 30 });
    if (this.vidas <= 0) this.final(false);
  }

  final(gana) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.pipas.forEach(p => p.destroy());
    const puntos = Math.round((VIDA_PERICO - this.hp) * 10 + (gana ? this.vidas * 250 + Math.max(0, 90 - this.t) * 5 : 0));
    if (gana) {
      // KO a lo Cuphead: congelado, rótulo y el palo vuelve a su dueña.
      this.cameras.main.flash(200);
      const t = texto(this, ANCHO / 2, ALTO / 2, '¡PALO RECUPERADO!', 86, COLOR.amarillo).setDepth(60).setScale(0).setAngle(-6);
      this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.out' });
      sfx(this, 'platillo', { volume: 0.6 });
      this.tweens.add({ targets: this.perico, y: ALTO + 200, angle: 200, duration: 1200, ease: 'Quad.in' });
    }
    const ganaMision = gana && puntos >= MISIONES.Palo.umbrales[0];
    this.time.delayedCall(1800, () => panelFinal(this, {
      titulo: gana ? '¡Cotine tiene su palo!' : 'Cotine se va volando',
      linea: gana ? 'Con el palo, Cotine baja al suelo. La tarta, entera. Bueno, casi.' : 'Perico se queda una percha preciosa. Pin pin.',
      puntos, clave: 'Palo', gana: ganaMision,
    }));
  }
}

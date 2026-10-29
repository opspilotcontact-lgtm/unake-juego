// Los discos de la Pompa (cap. 7, sigilo): el casero se quedó los discos de la Pompa como fianza.
// De día, Vuper se cuela en su casa (vista desde arriba) para recuperarlos sin que le vean.
// - El casero y el gato tuerto patrullan con su cono de visión; las paredes tapan la vista.
// - Si te ven, sube la sospecha; si se llena, te pillan: vuelves a la puerta y pierdes una vida.
// - Andar normal hace ruido: si pasas cerca, se giran hacia ti. MANTÉN «sigilo» para ir despacio y callado.
// - Las macetas son escondites: dentro no te ve nadie. Coge los tres discos y sal por la puerta.

const PAREDES_SIGILO = [
  [400, 100, 24, 250], [400, 470, 24, 230], [800, 240, 24, 460], [424, 340, 190, 24], [960, 340, 260, 24], [60, 330, 200, 24],
];
const DISCOS_SIGILO = [[690, 170], [1130, 200], [1020, 630]];
const MACETAS_SIGILO = [[300, 210], [640, 610], [900, 470], [1120, 450]];
const SALIDA_SIGILO = { x: 120, y: 630 };

class Sigilo extends Phaser.Scene {
  constructor() { super('Sigilo'); }

  create(datos) {
    this.vidas = 3;
    this.puntos = 0;
    this.cogidos = 0;
    this.sospecha = 0;
    this.activo = false;
    this.t = 0;
    this.vistoNunca = true;

    // La casa del casero, desde arriba: suelo de parqué, paredes, alfombras.
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x2a1f33);
    const g = this.add.graphics();
    g.fillStyle(0xd8c3a0, 1).fillRect(60, 100, 1160, 600);
    g.lineStyle(2, 0xc4ad88, 1);
    for (let y = 100; y < 700; y += 30) g.lineBetween(60, y, 1220, y);
    g.fillStyle(0x9a5b6e, 0.6).fillRoundedRect(470, 420, 280, 220, 20);
    g.fillStyle(0x5b7a9a, 0.6).fillRoundedRect(880, 120, 300, 180, 20);
    g.lineStyle(14, 0x3a2a24, 1).strokeRect(60, 100, 1160, 600);
    this.paredes = PAREDES_SIGILO.map(([x, y, w, h]) => {
      g.fillStyle(0x3a2a24, 1).fillRect(x, y, w, h);
      return new Phaser.Geom.Rectangle(x, y, w, h);
    });
    // Muebles de decoración (no estorban).
    texto(this, 640, 70, 'La casa del casero · de día', 24, COLOR.crema).setDepth(50);
    // La puerta de salida.
    this.add.rectangle(SALIDA_SIGILO.x, SALIDA_SIGILO.y, 90, 90, 0x7ee081, 0.35).setStrokeStyle(4, 0x7ee081);
    texto(this, SALIDA_SIGILO.x, SALIDA_SIGILO.y + 58, 'Salida', 18, COLOR.verde).setDepth(5);

    this.macetas = MACETAS_SIGILO.map(([x, y]) => {
      const m = this.add.container(x, y).setDepth(6);
      m.add(this.add.circle(0, 0, 40, 0x3f7a3a).setStrokeStyle(5, HEX.tinta));
      [[-16, -12], [14, -16], [0, 12], [-14, 14], [16, 10]].forEach(([dx, dy]) => m.add(this.add.circle(dx, dy, 16, 0x5aa04f).setStrokeStyle(3, HEX.tinta)));
      return { x, y, r: 42 };
    });
    this.discos = DISCOS_SIGILO.map(([x, y]) => {
      const d = this.add.image(x, y, arteO('obj-vinilo', 'colilla')).setDepth(4);
      d.setScale(56 / d.height);
      this.tweens.add({ targets: d, angle: 360, duration: 3000, repeat: -1 });
      return d;
    });

    this.conos = this.add.graphics().setDepth(3);
    // Vigilantes: el casero (su llave, de momento) y el gato tuerto.
    this.vigilantes = [
      this.vigilante(arteO('obj-llave', 'colilla'), 90, [[520, 470], [740, 470], [740, 640], [520, 640]], 70, 240, 70),
      this.vigilante(arteO('obj-gato', 'colilla'), 70, [[880, 190], [1170, 190], [1170, 260], [880, 260]], 55, 170, 60),
      this.vigilante(arteO('obj-llave', 'colilla'), 90, [[140, 160], [340, 160], [340, 280], [140, 280]], 60, 200, 65),
    ];
    this.vigilantes[2].img.setTint(0xffd0a0); // la casera, que también tiene llave

    this.vuper = this.add.image(SALIDA_SIGILO.x, SALIDA_SIGILO.y, 'vn-caminando').setDepth(8);
    this.vuper.setScale(80 / this.vuper.height);
    this.ruido = this.add.circle(0, 0, 140).setStrokeStyle(3, 0xffffff, 0.35).setDepth(2).setVisible(false);

    // Marcador.
    this.textoDiscos = texto(this, 150, 40, 'Discos: 0/3', 28, COLOR.amarillo).setDepth(50);
    texto(this, ANCHO - 330, 40, 'Sospecha', 22, COLOR.crema).setDepth(50);
    this.add.rectangle(ANCHO - 160, 40, 220, 20, 0x000000, 0.5).setStrokeStyle(3, HEX.crema).setDepth(50);
    this.barraSos = this.add.rectangle(ANCHO - 270, 40, 0, 16, HEX.rojo).setOrigin(0, 0.5).setDepth(51);
    this.vidasG = [0, 1, 2].map(i => this.add.circle(330 + i * 36, 40, 12, 0x7ee081).setStrokeStyle(3, HEX.tinta).setDepth(50));

    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SHIFT,SPACE');
    this.input.on('pointerdown', p => { this.dedo = p; });
    this.input.on('pointermove', p => { if (p.isDown) this.dedo = p; });
    this.input.on('pointerup', () => { this.dedo = null; });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      const t = texto(this, ANCHO / 2, ALTO / 2, 'Coge los 3 discos sin que te vean.\nMANTÉN Mayús (o «Sigilo») para no hacer ruido. Las macetas esconden.', 28, COLOR.amarillo, 1000).setDepth(60);
      this.time.delayedCall(3000, () => { t.destroy(); this.activo = true; });
    });
  }

  vigilante(clave, alto, ruta, vel, alcance, fov) {
    const img = this.add.image(ruta[0][0], ruta[0][1], clave).setDepth(7);
    img.setScale(alto / img.height);
    return { img, ruta, i: 1, vel, alcance, fov: Phaser.Math.DegToRad(fov), dir: 0, alerta: 0 };
  }

  // ¿La línea entre dos puntos atraviesa alguna pared?
  tapado(x1, y1, x2, y2) {
    const linea = new Phaser.Geom.Line(x1, y1, x2, y2);
    return this.paredes.some(r => Phaser.Geom.Intersects.LineToRectangle(linea, r));
  }

  escondido() {
    return this.macetas.some(m => Phaser.Math.Distance.Between(m.x, m.y, this.vuper.x, this.vuper.y) < m.r);
  }

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.t += dt;
    const k = this.teclas;
    let dx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    let dy = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    if (this.dedo && !window.TACTIL_UI) {
      const vx = this.dedo.x - this.vuper.x; const vy = this.dedo.y - this.vuper.y; const d = Math.hypot(vx, vy);
      if (d > 14) { dx = vx / d; dy = vy / d; }
    }
    const sigilo = k.SHIFT.isDown || k.SPACE.isDown;
    const n = Math.hypot(dx, dy) || 1;
    const vel = sigilo ? 105 : 210;
    const moviendo = dx || dy;
    // Movimiento con choque contra paredes (eje a eje).
    const v = this.vuper;
    const nx = Phaser.Math.Clamp(v.x + (dx / n) * vel * dt, 90, 1190);
    if (!this.paredes.some(r => r.contains(nx, v.y))) v.x = nx;
    const ny = Phaser.Math.Clamp(v.y + (dy / n) * vel * dt, 130, 670);
    if (!this.paredes.some(r => r.contains(v.x, ny))) v.y = ny;
    if (dx) v.setFlipX(dx < 0);
    v.setAngle(moviendo ? Math.sin(this.t * (sigilo ? 8 : 16)) * 6 : 0);
    const oculto = this.escondido();
    v.setAlpha(oculto ? 0.45 : 1);
    this.ruido.setPosition(v.x, v.y).setVisible(moviendo && !sigilo && !oculto);

    // Discos.
    this.discos.forEach(d => {
      if (d.active && Phaser.Math.Distance.Between(d.x, d.y, v.x, v.y) < 40) {
        d.destroy();
        this.cogidos++;
        this.puntos += 300;
        this.textoDiscos.setText(`Discos: ${this.cogidos}/3`);
        sfx(this, 'campanita', { volume: 0.6 });
        golpeTexto(this, v.x, v.y - 50, '¡Un disco!', COLOR.amarillo, 30);
      }
    });
    if (this.cogidos >= 3 && Phaser.Math.Distance.Between(v.x, v.y, SALIDA_SIGILO.x, SALIDA_SIGILO.y) < 50) return this.final(true);

    // Vigilantes: patrulla, oído y vista.
    this.conos.clear();
    let visto = false;
    this.vigilantes.forEach(w => {
      const objetivo = w.ruta[w.i];
      const ox = objetivo[0] - w.img.x; const oy = objetivo[1] - w.img.y; const d = Math.hypot(ox, oy);
      const distV = Phaser.Math.Distance.Between(w.img.x, w.img.y, v.x, v.y);
      // Si oye ruido, se para y mira hacia ti un rato.
      if (moviendo && !sigilo && !oculto && distV < 150) w.alerta = 1.6;
      if (w.alerta > 0) {
        w.alerta -= dt;
        const quiere = Math.atan2(v.y - w.img.y, v.x - w.img.x);
        w.dir = Phaser.Math.Angle.RotateTo(w.dir, quiere, 4 * dt);
      } else {
        if (d < 4) w.i = (w.i + 1) % w.ruta.length;
        else {
          w.img.x += (ox / d) * w.vel * dt;
          w.img.y += (oy / d) * w.vel * dt;
          w.dir = Phaser.Math.Angle.RotateTo(w.dir, Math.atan2(oy, ox), 5 * dt);
        }
      }
      // ¿Te ve? Dentro del alcance, dentro del ángulo, sin pared en medio y sin maceta.
      const ang = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(v.y - w.img.y, v.x - w.img.x) - w.dir));
      const ve = !oculto && distV < w.alcance && ang < w.fov / 2 && !this.tapado(w.img.x, w.img.y, v.x, v.y);
      if (ve) visto = true;
      // El cono.
      this.conos.fillStyle(ve ? 0xff5a4f : 0xffe27a, ve ? 0.45 : 0.32);
      const pts = [{ x: w.img.x, y: w.img.y }];
      for (let a = -w.fov / 2; a <= w.fov / 2 + 0.001; a += w.fov / 12) pts.push({ x: w.img.x + Math.cos(w.dir + a) * w.alcance, y: w.img.y + Math.sin(w.dir + a) * w.alcance });
      this.conos.fillPoints(pts, true);
    });
    if (visto) {
      this.vistoNunca = false;
      this.sospecha = Math.min(1, this.sospecha + 1.15 * dt);
      if (!this.sonoAviso) { this.sonoAviso = true; sfx(this, 'boing', { volume: 0.4 }); Comic.emote(this, v.x, v.y - 60, 'rayo', { tam: 46, profundidad: 45 }); }
    } else {
      this.sonoAviso = false;
      this.sospecha = Math.max(0, this.sospecha - 0.35 * dt);
    }
    this.barraSos.width = 216 * this.sospecha;
    if (this.sospecha >= 1) this.pillado();
  }

  pillado() {
    this.vidas--;
    if (this.vidasG[this.vidas]) this.vidasG[this.vidas].setFillStyle(HEX.rojo);
    this.sospecha = 0;
    sfx(this, 'oooh', { volume: 0.5 });
    this.cameras.main.flash(200, 255, 90, 79);
    const b = bocadillo(this, Phaser.Math.Clamp(this.vuper.x, 220, ANCHO - 220), Math.max(160, this.vuper.y - 90), Phaser.Utils.Array.GetRandom(['¡Eh! ¿Tú quién eres?', '¡Fuera de mi casa, rider!', '¿Otra vez el de los monchis?']), { tam: 22, ancho: 320 }).setDepth(40);
    this.time.delayedCall(1500, () => b.destroy());
    if (this.vidas <= 0) return this.final(false);
    // De vuelta a la puerta (los discos cogidos se quedan).
    this.activo = false;
    this.tweens.add({ targets: this.vuper, x: SALIDA_SIGILO.x, y: SALIDA_SIGILO.y, duration: 600, ease: 'Sine.inOut', onComplete: () => { this.activo = true; } });
  }

  final(sale) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    if (sale) this.puntos += Math.max(0, Math.round(120 - this.t) * 8) + this.vidas * 150 + (this.vistoNunca ? 500 : 0);
    if (sale && this.vistoNunca) sumarStat('sigiloLimpio');
    const gana = sale && this.puntos >= MISIONES.Sigilo.umbrales[0];
    if (sale) { sfx(this, 'aaah', { volume: 0.5 }); Comic.confeti(this, { profundidad: 590 }); }
    this.time.delayedCall(900, () => panelFinal(this, {
      titulo: sale ? '¡Los discos de la Pompa!' : 'Te han pillado',
      linea: sale ? `${this.vistoNunca ? 'Ni te han visto. ' : ''}La Pompa podrá pinchar la noche de la inspección.` : 'El casero te acompaña a la puerta. Muy amablemente. Demasiado.',
      puntos: this.puntos, clave: 'Sigilo', gana,
    }));
  }
}

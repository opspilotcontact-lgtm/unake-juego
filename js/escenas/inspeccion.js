// La inspección (cap. 7): el casero recorre Unaké de noche. Escondite inglés: cuando se da la vuelta,
// mantén pulsado lo que no debe ver (el cenicero, el charco de Puky, la nube de Lasslow…) hasta que
// desaparezca. Si se gira y te pilla escondiendo algo, sospecha. Tres sospechas y se acabó la aso.
// Antes de girarse, la llave tintinea: es el aviso. Cada vez se gira más rápido y aparecen más cosas.

const DURACION_INSPECCION = 50;
const PRUEBAS = [
  { clave: 'colilla', nombre: 'cenicero', alto: 70 },
  { clave: 'fx-charco-amarillo', nombre: 'charco de Puky', alto: 70 },
  { clave: 'fx-nube-pedo', nombre: 'nube de Lasslow', alto: 90 },
  { clave: 'obj-mechero-grande', nombre: 'mechero', alto: 70 },
  { clave: 'obj-zapatilla', nombre: 'zapatilla de alguien', alto: 60 },
  { clave: 'obj-dado', nombre: 'dados de Palicaso', alto: 60 },
];
const HUECOS = [[200, 600], [330, 520], [470, 640], [600, 560], [740, 640], [880, 530], [180, 450], [520, 450], [760, 450]];

class Inspeccion extends Phaser.Scene {
  constructor() { super('Inspeccion'); }

  create(datos) {
    this.puntos = 0;
    this.vidas = 3;
    this.restante = DURACION_INSPECCION;
    this.pruebas = [];
    this.mira = false;
    this.activo = false;
    this.agarrada = null;

    fondo(this, 'bg-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.3);
    // El casero: de momento, su llave (con ojos cuando mira).
    this.casero = this.add.container(1120, 380).setDepth(20);
    const llave = this.add.image(0, 0, this.textures.exists('obj-llave') ? 'obj-llave' : 'colilla');
    llave.setScale(280 / llave.height);
    this.ojos = this.add.container(0, -60);
    [-24, 24].forEach(dx => { this.ojos.add(this.add.circle(dx, 0, 18, 0xffffff).setStrokeStyle(4, HEX.tinta)); this.ojos.add(this.add.circle(dx - 4, 2, 8, HEX.tinta)); });
    this.casero.add([llave, this.ojos]);
    this.llave = llave;
    // Con el dibujo del casero (Gemini), sus poses en vez de la llave con ojos pintados.
    this.conCasero = this.textures.exists('casero');
    if (this.conCasero) { llave.setTexture('casero'); llave.setScale(300 / llave.height); this.ojos.setVisible(false); }
    this.cartelCasero = texto(this, 1120, 160, '', 26, COLOR.crema).setDepth(30);

    this.textoPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoTiempo = texto(this, ANCHO / 2, 40, '', 30, COLOR.crema).setDepth(50);
    this.vidasG = [0, 1, 2].map(i => this.add.circle(ANCHO - 340 + i * 44, 44, 14, 0x7ee081).setStrokeStyle(4, HEX.tinta).setDepth(50));
    texto(this, ANCHO - 420, 44, 'Sospecha:', 22, COLOR.crema).setDepth(50);
    this.ayuda = texto(this, 560, 120, 'Cuando el casero NO mire, MANTÉN pulsado lo que no debe ver', 26, COLOR.amarillo, 900).setDepth(50);

    this.input.on('pointerup', () => this.soltar());
    this.input.keyboard.on('keydown', e => {
      const n = Number(e.key);
      if (n >= 1 && n <= 9 && !e.repeat && this.pruebas[n - 1]) this.agarrar(this.pruebas[n - 1]);
    });
    this.input.keyboard.on('keyup', e => { if (Number(e.key) >= 1) this.soltar(); });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 500, () => {
      const b = bocadillo(this, 1000, 170, 'Buenas noches. Vengo a ver la aso. Por dentro.', { tam: 22, ancho: 380, cola: 'der' }).setDepth(40);
      this.time.delayedCall(2200, () => {
        b.destroy();
        this.activo = true;
        for (let i = 0; i < 3; i++) this.nuevaPrueba();
        this.espaldas();
      });
    });
  }

  // ---------- El casero: de espaldas, aviso, mira ----------

  espaldas() {
    if (!this.activo) return;
    this.mira = false;
    this.ojos.setVisible(false);
    if (this.conCasero) this.llave.setTexture('casero').setFlipX(true);
    this.llave.setTint(0x6a5a80);
    this.cartelCasero.setText('(de espaldas)').setColor(COLOR.verde);
    const prisa = 1 - (this.restante / DURACION_INSPECCION);
    this.time.delayedCall(Phaser.Math.Between(1400, 2800) * (1 - prisa * 0.4), () => this.aviso());
  }

  aviso() {
    if (!this.activo) return;
    // La llave tintinea: va a girarse.
    sfx(this, 'campanita', { volume: 0.5 });
    this.cartelCasero.setText('¡clinc!').setColor(COLOR.amarillo);
    this.tweens.add({ targets: this.casero, angle: { from: -6, to: 6 }, duration: 70, yoyo: true, repeat: 2, onComplete: () => this.casero.setAngle(0) });
    const prisa = 1 - (this.restante / DURACION_INSPECCION);
    this.time.delayedCall(520 - prisa * 200, () => this.mirar());
  }

  mirar() {
    if (!this.activo) return;
    this.mira = true;
    this.ojos.setVisible(!this.conCasero);
    if (this.conCasero) this.llave.setTexture(this.textures.exists('casero-mira') ? 'casero-mira' : 'casero').setFlipX(false);
    this.llave.clearTint();
    this.cartelCasero.setText('MIRA').setColor(COLOR.rosa);
    sfx(this, 'whoosh', { volume: 0.4 });
    // Si te pilla escondiendo algo: sospecha.
    if (this.agarrada) this.pillado();
    this.time.delayedCall(Phaser.Math.Between(1000, 2000), () => this.espaldas());
  }

  pillado() {
    const p = this.agarrada;
    this.soltar();
    this.vidas--;
    if (this.vidasG[this.vidas]) this.vidasG[this.vidas].setFillStyle(HEX.rojo);
    sfx(this, 'oooh', { volume: 0.5 });
    this.cameras.main.shake(250, 0.01);
    const b = bocadillo(this, 1000, 170, Phaser.Utils.Array.GetRandom(['¿Qué escondes ahí?', 'Ajá. Ya veo.', '¿Y eso de quién es?', 'Interesante. Muy interesante.']), { tam: 22, ancho: 320, cola: 'der' }).setDepth(40);
    this.time.delayedCall(1200, () => b.destroy());
    if (p) Comic.emote(this, p.img.x, p.img.y - 60, 'rayo', { profundidad: 45 });
    if (this.vidas <= 0) this.final(false);
  }

  // ---------- Las pruebas ----------

  nuevaPrueba() {
    const libres = HUECOS.filter(([x, y]) => !this.pruebas.some(p => Math.abs(p.img.x - x) < 60 && Math.abs(p.img.y - y) < 60));
    if (!libres.length || this.pruebas.length >= 6) return;
    const [x, y] = Phaser.Utils.Array.GetRandom(libres);
    const tipo = Phaser.Utils.Array.GetRandom(PRUEBAS.filter(t => this.textures.exists(t.clave)));
    const img = this.add.image(x, y, tipo.clave).setDepth(10).setScale(0).setInteractive({ useHandCursor: true });
    const esc = tipo.alto / img.height;
    this.tweens.add({ targets: img, scale: esc, duration: 260, ease: 'Back.out' });
    const anillo = this.add.graphics().setDepth(11);
    const p = { img, tipo, esc, anillo, progreso: 0 };
    img.on('pointerdown', () => this.agarrar(p));
    this.pruebas.push(p);
  }

  agarrar(p) {
    if (!this.activo || this.agarrada) return;
    this.agarrada = p;
    if (this.mira) this.pillado();
  }

  soltar() {
    if (this.agarrada) { this.agarrada.progreso = 0; this.agarrada.anillo.clear(); }
    this.agarrada = null;
  }

  esconder(p) {
    this.agarrada = null;
    this.pruebas = this.pruebas.filter(x => x !== p);
    p.anillo.destroy();
    p.img.disableInteractive();
    this.tweens.add({ targets: p.img, scale: 0, angle: 180, duration: 220, ease: 'Back.in', onComplete: () => p.img.destroy() });
    this.puntos += 100;
    this.textoPuntos.setText(`${this.puntos} puntos`);
    sfx(this, 'pop', { volume: 0.5 });
    golpeTexto(this, p.img.x, p.img.y - 50, `+100 · ${p.tipo.nombre}`, COLOR.verde, 26);
    if (this.ayuda.active) this.tweens.add({ targets: this.ayuda, alpha: 0, duration: 400, onComplete: () => this.ayuda.destroy() });
  }

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.restante -= dt;
    this.textoTiempo.setText(`${Math.ceil(this.restante)} s`);
    // Van apareciendo más cosas (cada vez más deprisa).
    this.proxima = (this.proxima ?? 3) - dt;
    if (this.proxima <= 0) { this.proxima = Math.max(1.2, 3.2 - (DURACION_INSPECCION - this.restante) / 20); this.nuevaPrueba(); }
    const p = this.agarrada;
    if (p) {
      p.progreso += dt / 0.75;
      p.anillo.clear().lineStyle(8, HEX.amarillo, 1).beginPath();
      p.anillo.arc(p.img.x, p.img.y, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.progreso)).strokePath();
      if (p.progreso >= 1) this.esconder(p);
    }
    if (this.restante <= 0) this.final(true);
  }

  final(aguanto) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    if (this.conCasero) this.llave.setFlipX(false);
    // Lo que se queda a la vista resta.
    const vistas = this.pruebas.length;
    this.puntos = Math.max(0, this.puntos - vistas * 50);
    const gana = aguanto && this.puntos >= MISIONES.Inspeccion.umbrales[0];
    this.ojos.setVisible(!this.conCasero);
    this.llave.clearTint();
    this.time.delayedCall(800, () => panelFinal(this, {
      titulo: gana ? 'Inspección superada' : 'El casero ha visto demasiado',
      linea: gana ? `«Todo en orden… creo.» Se le quedaron a la vista ${vistas} cosas.` : 'El casero apunta algo en su libreta. Y luego otra cosa. Y otra.',
      puntos: this.puntos, clave: 'Inspeccion', gana,
    }));
  }
}

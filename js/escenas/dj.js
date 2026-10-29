// La Pompa pincha (ritmo): las burbujas caen por tres carriles al compás de la canción de la serie
// (tempo medido sobre intro-corte.wav: 93,5 BPM, golpe cada 0,6417 s, primer golpe a 0,06 s).
// ← ↓ → (o A S D) cuando la burbuja llega al aro. La canción suena dos veces: la segunda con
// contratiempos y dobles. Los fallos hinchan a la Pompa; si se pasa, revienta (plop).

const BPM_PERIODO = 0.6417;
const BPM_FASE = 0.06;
const DURACION_TEMA = 23.25;
const CAIDA = 1.35;          // segundos que tarda una burbuja en llegar al aro
const LINEA = 590;
const CARRILES = [470, 640, 810];
const COLORES_CARRIL = [0xff5fa2, 0x5ad1ff, 0xffd23f];
const VENTANA_PERFECTA = 0.07;
const VENTANA_BIEN = 0.15;

class DJ extends Phaser.Scene {
  constructor() { super('DJ'); }

  create(datos) {
    this.puntos = 0;
    this.combo = 0;
    this.presion = 0;
    this.aciertos = 0;
    this.fallos = 0;
    this.vuelta = 0;
    this.activo = false;
    this.ultimoGolpe = -1;
    this.notas = this.componer();

    fondo(this, enMundoHumo() ? 'bg-techo' : 'bgn-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.35);
    this.pulso = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0xb68cff, 0).setDepth(1);
    // Carriles y aros.
    const g = this.add.graphics().setDepth(2);
    CARRILES.forEach((x, i) => {
      g.fillStyle(COLORES_CARRIL[i], 0.12).fillRoundedRect(x - 60, 160, 120, 520, 20);
      g.lineStyle(6, HEX.tinta, 1).strokeCircle(x, LINEA, 46);
      g.lineStyle(4, COLORES_CARRIL[i], 1).strokeCircle(x, LINEA, 46);
    });
    ['← A', '↓ S', '→ D'].forEach((t, i) => texto(this, CARRILES[i], LINEA + 76, t, 22, COLOR.crema).setDepth(3));
    this.destellos = CARRILES.map((x, i) => this.add.circle(x, LINEA, 46, COLORES_CARRIL[i], 0).setDepth(3));

    this.pompa = this.add.image(1090, 330, 'pompa').setDepth(5);
    this.escPompa = 230 / this.pompa.height;
    this.pompa.setScale(this.escPompa);

    this.textoPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoCombo = texto(this, 150, 80, '', 24, COLOR.verde).setDepth(50);
    this.textoJuicio = texto(this, 640, 470, '', 40, COLOR.amarillo).setDepth(50);
    texto(this, 1090, 520, 'PRESIÓN', 18, COLOR.crema).setDepth(50);
    this.add.rectangle(1090, 548, 200, 20, HEX.tinta).setStrokeStyle(3, HEX.crema).setDepth(50);
    this.barraPresion = this.add.rectangle(992, 548, 0, 12, HEX.rojo).setOrigin(0, 0.5).setDepth(51);

    const teclas = { LEFT: 0, A: 0, DOWN: 1, S: 1, RIGHT: 2, D: 2 };
    this.input.keyboard.on('keydown', e => {
      const k = e.key.length === 1 ? e.key.toUpperCase() : e.key.replace('Arrow', '').toUpperCase();
      if (k in teclas && !e.repeat) this.golpe(teclas[k]);
    });
    this.input.on('pointerdown', p => {
      const i = CARRILES.findIndex(x => Math.abs(p.x - x) < 80);
      if (i >= 0) this.golpe(i);
    });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      const c = this.add.container(ANCHO / 2, 300).setDepth(80);
      c.add(this.add.graphics().fillStyle(HEX.tinta, 0.88).fillRoundedRect(-460, -100, 920, 200, 24));
      c.add(texto(this, 0, -50, 'La Pompa pincha', 40, COLOR.amarillo));
      c.add(texto(this, 0, 20, 'Pulsa ← ↓ → (o A S D, o toca el carril) cuando la burbuja llegue al aro.', 24, COLOR.crema, 860));
      this.time.delayedCall(2800, () => { c.destroy(); this.empezar(); });
    });
  }

  // Las notas sobre los golpes del tema: 1.ª vuelta, una por golpe; 2.ª, contratiempos y dobles.
  componer() {
    const notas = [];
    let semilla = 7;
    const azar = () => { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; };
    for (let vuelta = 0; vuelta < 2; vuelta++) {
      for (let k = 2; ; k++) {
        const t = BPM_FASE + k * BPM_PERIODO;
        if (t > DURACION_TEMA - 0.5) break;
        const base = vuelta * DURACION_TEMA + t;
        const carril = Math.floor(azar() * 3);
        notas.push({ t: base, carril });
        if (vuelta === 1 && k % 4 === 3) notas.push({ t: base, carril: (carril + 1 + Math.floor(azar() * 2)) % 3 });
        if (vuelta === 1 && k % 2 === 1 && t + BPM_PERIODO / 2 < DURACION_TEMA - 0.5) notas.push({ t: base + BPM_PERIODO / 2, carril: Math.floor(azar() * 3) });
      }
    }
    return notas.sort((a, b) => a.t - b.t);
  }

  empezar() {
    this.musica = this.sound.add('musica-intro', { volume: 0.8 });
    this.musica.on('complete', () => {
      this.vuelta++;
      if (this.vuelta < 2 && this.activo) {
        this.musica.play();
        golpeTexto(this, 640, 300, '¡Otra vez, más rápido!', COLOR.rosa, 44);
      } else this.final(true);
    });
    this.musica.play();
    this.activo = true;
  }

  // Tiempo del tema (segundos), contando las vueltas.
  ahora() {
    return this.vuelta * DURACION_TEMA + (this.musica ? this.musica.seek : 0);
  }

  golpe(carril) {
    if (!this.activo) return;
    const T = this.ahora();
    this.tweens.add({ targets: this.destellos[carril], fillAlpha: { from: 0.5, to: 0 }, duration: 160 });
    const n = this.notas.find(x => !x.juzgada && x.carril === carril && Math.abs(x.t - T) < VENTANA_BIEN + 0.05);
    if (!n) { this.combo = Math.max(0, this.combo - 2); this.textoCombo.setText(''); return; }
    const err = Math.abs(n.t - T);
    n.juzgada = true;
    if (n.img) {
      const img = n.img;
      this.tweens.add({ targets: img, scale: img.scale * 1.8, alpha: 0, duration: 200, onComplete: () => img.destroy() });
    }
    const aro = this.add.circle(CARRILES[carril], LINEA, 46).setStrokeStyle(6, COLORES_CARRIL[carril]).setDepth(4);
    this.tweens.add({ targets: aro, scale: 1.8, alpha: 0, duration: 300, onComplete: () => aro.destroy() });
    const perfecto = err <= VENTANA_PERFECTA;
    if (err > VENTANA_BIEN) return this.fallo(n);
    this.combo++;
    this.aciertos++;
    this.presion = Math.max(0, this.presion - 0.6);
    const pts = Math.round((perfecto ? 100 : 60) * (1 + this.combo / 20));
    this.puntos += pts;
    this.textoPuntos.setText(`${this.puntos} puntos`);
    this.textoCombo.setText(this.combo >= 5 ? `${this.combo} seguidas` : '');
    this.juicio(perfecto ? '¡Perfecto!' : 'Bien', perfecto ? COLOR.amarillo : COLOR.verde);
  }

  fallo(n) {
    n.juzgada = true;
    this.combo = 0;
    this.fallos++;
    this.presion += 1;
    this.textoCombo.setText('');
    this.juicio('Fallo', COLOR.rosa);
    sfx(this, 'pop', { volume: 0.25 });
    if (this.presion >= 8) this.final(false);
  }

  juicio(t, color) {
    this.tweens.killTweensOf(this.textoJuicio);
    this.textoJuicio.setText(t).setColor(color).setScale(1.3).setAlpha(1);
    this.tweens.add({ targets: this.textoJuicio, scale: 1, alpha: 0, duration: 500, delay: 150 });
  }

  update() {
    if (!this.activo) return;
    const T = this.ahora();
    const velocidad = (LINEA - 120) / CAIDA;
    this.notas.forEach(n => {
      if (n.juzgada) return;
      const falta = n.t - T;
      if (falta < -VENTANA_BIEN - 0.03) {
        if (n.img) { const img = n.img; this.tweens.add({ targets: img, alpha: 0, y: img.y + 40, duration: 200, onComplete: () => img.destroy() }); }
        return this.fallo(n);
      }
      if (falta > CAIDA) return;
      if (!n.img) {
        n.img = this.add.image(CARRILES[n.carril], 120, 'nota').setTint(COLORES_CARRIL[n.carril]).setScale(0.9).setDepth(6);
      }
      n.img.y = LINEA - falta * velocidad;
    });
    // Todo late con el golpe: la Pompa bota, el neón parpadea.
    const fase = ((T - BPM_FASE) % BPM_PERIODO + BPM_PERIODO) % BPM_PERIODO / BPM_PERIODO;
    const latido = Math.exp(-fase * 6);
    const hincha = 1 + this.presion * 0.05;
    this.pompa.setTexture(this.presion >= 5 ? 'pompa-horror' : 'pompa');
    this.pompa.setScale(230 / this.pompa.height * hincha * (1 + latido * 0.06), 230 / this.pompa.height * hincha * (1 - latido * 0.04));
    this.pompa.x = 1090 + (this.presion >= 5 ? Math.sin(this.time.now / 30) * 4 : 0);
    this.pulso.fillAlpha = latido * 0.12;
    this.barraPresion.width = 196 * Math.min(1, this.presion / 8);
  }

  final(acabo) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    if (this.musica) this.musica.stop();
    this.notas.forEach(n => n.img && n.img.destroy());
    if (!acabo) {
      sfx(this, 'plop');
      this.pompa.setTexture('pompa-horror');
      this.tweens.add({ targets: this.pompa, scale: this.pompa.scale * 1.6, alpha: 0, duration: 400 });
      golpeTexto(this, 1090, 300, '¡PLOP!', COLOR.rosa, 80);
    } else {
      sfx(this, 'aaah', { volume: 0.6 });
      golpeTexto(this, 640, 300, '¡Qué temazo!', COLOR.amarillo, 64);
    }
    const total = this.aciertos + this.fallos;
    this.time.delayedCall(1100, () => panelFinal(this, {
      titulo: acabo ? 'La Pompa ha pinchado' : 'La Pompa ha reventado',
      linea: `${this.aciertos} de ${total} burbujas al ritmo. ${acabo ? '«…¿Ya? Me ha parecido un segundo.»' : '«Yo no, que exploto.» Y explotó.'}`,
      puntos: this.puntos, clave: 'DJ', gana: acabo,
    }));
  }
}

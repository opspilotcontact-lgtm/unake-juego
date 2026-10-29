// El farol (Palicaso, cap. 5 «La caja»): dados en la barra. Palicaso tira dos dados tapados y canta
// lo que ha sacado; tú dices «Me lo creo» o «¡Farol!». Su estado le delata: cuando miente habla de más
// (se enrolla, mete «escucha», jura…). Al principio se le nota mucho; luego también se enrolla diciendo
// la verdad y miente en corto, y hay que fijarse en los detalles (mira a otro lado, suda, se ríe).
// Doce manos, tres vidas; acertar seguido multiplica.

const MANOS_FAROL = 12;

const FRASES_FAROL = {
  // Verdad: corto y tranquilo.
  verdadCorta: ['Un {n}.', 'He sacado {n}.', '{n}. Tal cual.', 'Pues un {n}.', '{n}, mira tú.'],
  // Mentira: se enrolla (al principio, la pista clara).
  mentiraLarga: [
    '¡Escucha, escucha! Un {n}. Un {n} precioso. Te lo juro por la aso, por Blancaso y por la máquina.',
    '{n}. Pero escucha, que esto tiene historia: la última vez que saqué un {n} fue el día que…',
    '¡Un {n}! ¿Te he contado lo del {n}? Es mi número. Siempre me sale. Siempre. Bueno, casi siempre.',
    'Escucha: {n}. {n}. Y si no te lo crees, pregúntale a Lasslow, que estaba delante. Bueno, no estaba.',
  ],
  // A partir de la mitad: verdades largas (para despistar) y mentiras cortas.
  verdadLarga: ['¡Escucha! Un {n}. Y esta vez va en serio, que conste. Hoy no me enrollo. Bueno, un poco.', 'Un {n}, de verdad de la buena. ¿Ves? Ni he dicho «escucha». Mierda.'],
  mentiraCorta: ['{n}.', 'Un {n}. Venga.', '{n}… sí.'],
};

class Farol extends Phaser.Scene {
  constructor() { super('Farol'); }

  create(datos) {
    this.puntos = 0;
    this.vidas = 3;
    this.mano = 0;
    this.racha = 0;
    this.esperando = false;

    fondo(this, enMundoHumo() ? 'bg-dentro' : 'bgn-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.45);
    // La barra.
    const g = this.add.graphics();
    g.fillStyle(0x4a2a1a, 1).fillRect(0, 470, ANCHO, 250);
    g.fillStyle(0x6b3d24, 1).fillRect(0, 470, ANCHO, 26);
    g.lineStyle(6, HEX.tinta, 1).lineBetween(0, 470, ANCHO, 470);
    this.palicaso = this.add.image(380, 480, 'palicaso-contando').setOrigin(0.5, 1).setDepth(4);
    this.escP = 300 / this.palicaso.height;
    this.palicaso.setScale(this.escP);
    flotar(this, this.palicaso, { amplitud: 4 });
    // El cubilete y los dados.
    this.cubilete = this.add.container(780, 470).setDepth(6);
    const cg = this.add.graphics();
    cg.fillStyle(0x7a1f2b, 1).fillRoundedRect(-60, -130, 120, 130, 14).lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-60, -130, 120, 130, 14);
    cg.fillStyle(0xa83244, 1).fillRect(-50, -118, 18, 104);
    this.cubilete.add(cg);
    this.dados = [this.dado(735, 440), this.dado(825, 440)];
    this.dados.forEach(d => d.setVisible(false));

    this.textoPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoMano = texto(this, ANCHO / 2, 40, '', 26, COLOR.crema).setDepth(50);
    this.textoRacha = texto(this, 150, 80, '', 22, COLOR.verde).setDepth(50);
    this.vidasG = [0, 1, 2].map(i => this.add.star(ANCHO - 180 + i * 50, 44, 5, 9, 20, HEX.amarillo).setStrokeStyle(4, HEX.tinta).setDepth(50));

    this.botonCreo = boton(this, ANCHO / 2 - 190, 640, 'Me lo creo (←)', () => this.decidir(true), { ancho: 330, alto: 80, tam: 26, color: HEX.verde }).setDepth(60);
    this.botonFarol = boton(this, ANCHO / 2 + 190, 640, '¡Farol! (→)', () => this.decidir(false), { ancho: 330, alto: 80, tam: 26, color: HEX.rosa }).setDepth(60);
    this.input.keyboard.on('keydown', e => {
      if (e.repeat) return;
      if (['ArrowLeft', 'a', 'A', '1'].includes(e.key)) this.decidir(true);
      if (['ArrowRight', 'd', 'D', '2', 'f', 'F'].includes(e.key)) this.decidir(false);
    });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 500, () => {
      this.decir('¡Escucha! Dados. Yo canto lo que saco y tú dices si es verdad. Si me pillas, devuelvo lo de la caja. Bueno, parte.', 3600);
      this.time.delayedCall(3800, () => this.nuevaMano());
    });
  }

  dado(x, y) {
    const c = this.add.container(x, y).setDepth(7);
    c.add(this.add.rectangle(0, 0, 70, 70, 0xffffff).setStrokeStyle(6, HEX.tinta));
    c.puntos = this.add.graphics();
    c.add(c.puntos);
    return c;
  }

  pintarDado(c, n) {
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    c.puntos.clear().fillStyle(HEX.tinta, 1);
    P[n].forEach(([dx, dy]) => c.puntos.fillCircle(dx * 18, dy * 18, 7));
  }

  decir(str, ms = 2600) {
    if (this.burbuja) this.burbuja.destroy();
    this.burbuja = bocadillo(this, 470, 150, str, { tam: 24, ancho: 560, cola: 'izq' }).setDepth(40);
    const b = this.burbuja;
    this.time.delayedCall(ms, () => { if (b.active && b === this.burbuja) b.destroy(); });
  }

  nuevaMano() {
    if (this.vidas <= 0 || this.mano >= MANOS_FAROL) return this.final();
    this.mano++;
    this.textoMano.setText(`Mano ${this.mano} de ${MANOS_FAROL}`);
    this.dados.forEach(d => d.setVisible(false));
    this.cubilete.setPosition(780, 470).setAngle(0).setVisible(true);
    sfx(this, 'lata', { volume: 0.4 });
    this.tweens.add({ targets: this.cubilete, angle: { from: -12, to: 12 }, duration: 90, yoyo: true, repeat: 4, onComplete: () => this.cantar() });
  }

  cantar() {
    this.d1 = Phaser.Math.Between(1, 6);
    this.d2 = Phaser.Math.Between(1, 6);
    const suma = this.d1 + this.d2;
    const miente = Math.random() < 0.5;
    let canta = suma;
    if (miente) { do { canta = Phaser.Math.Between(2, 12); } while (canta === suma); }
    this.miente = miente;
    // Las pistas se van volviendo traicioneras con las manos.
    const dificil = this.mano > MANOS_FAROL / 2;
    const lista = miente
      ? (dificil && Math.random() < 0.5 ? FRASES_FAROL.mentiraCorta : FRASES_FAROL.mentiraLarga)
      : (dificil && Math.random() < 0.4 ? FRASES_FAROL.verdadLarga : FRASES_FAROL.verdadCorta);
    this.decir(Phaser.Utils.Array.GetRandom(lista).replaceAll('{n}', canta), 60000);
    // El cuerpo también habla: cuando miente, suda o mira a otro lado (y más claro al principio).
    this.palicaso.setTexture(miente && Math.random() < (dificil ? 0.55 : 0.8) ? 'palicaso-riendo' : 'palicaso-contando');
    if (miente && Math.random() < (dificil ? 0.5 : 0.75)) Comic.emote(this, 300, 260, 'gota', { tam: 46, ms: 1400, profundidad: 45 });
    this.esperando = true;
    this.t0 = this.time.now;
  }

  decidir(creo) {
    if (!this.esperando) return;
    this.esperando = false;
    const acierto = creo !== this.miente;
    // Se levanta el cubilete.
    this.tweens.add({ targets: this.cubilete, y: 330, angle: -25, duration: 260, ease: 'Back.out' });
    this.pintarDado(this.dados[0], this.d1);
    this.pintarDado(this.dados[1], this.d2);
    this.dados.forEach((d, i) => { d.setVisible(true).setScale(0); this.tweens.add({ targets: d, scale: 1, duration: 220, delay: 120 + i * 90, ease: 'Back.out' }); });
    this.time.delayedCall(500, () => {
      if (acierto) {
        this.racha++;
        const rapido = this.time.now - this.t0 < 2500 ? 50 : 0;
        const gana = (100 + rapido) * Math.min(this.racha, 5);
        this.puntos += gana;
        sfx(this, this.racha >= 3 ? 'platillo' : 'campanita', { volume: 0.5 });
        Comic.impacto(this, 780, 400, { tam: 80, profundidad: 46 });
        golpeTexto(this, 780, 300, `+${gana}`, COLOR.amarillo, 48);
        this.decir(this.miente ? Phaser.Utils.Array.GetRandom(['¡Me has pillado! ¿Tanto se me nota?', '¡Escucha! Eso ha sido suerte.', 'Vale, vale… sí. Era un farol.']) : Phaser.Utils.Array.GetRandom(['¿Ves? Cuando digo la verdad, la digo.', 'Verdad verdadera.']), 1600);
      } else {
        this.racha = 0;
        this.vidas--;
        this.vidasG[this.vidas].setFillStyle(0x3d3350);
        sfx(this, 'rimshot', { volume: 0.5 });
        this.cameras.main.shake(200, 0.008);
        this.palicaso.setTexture('palicaso-riendo');
        this.decir(this.miente ? `¡JA! ¡Te lo has creído! Escucha, escucha: era un ${this.d1 + this.d2}.` : '¿Farol? ¡Era verdad! A veces digo la verdad, ¿eh?', 1600);
      }
      this.textoPuntos.setText(`${this.puntos} puntos`);
      this.textoRacha.setText(this.racha > 1 ? `Racha x${Math.min(this.racha, 5)}` : '');
      this.time.delayedCall(1700, () => this.nuevaMano());
    });
  }

  final() {
    if (this._acabado) return;
    this._acabado = true;
    const gana = this.vidas > 0 && this.puntos >= MISIONES.Farol.umbrales[0];
    // En el cap. 5, ganarle devuelve lo que faltaba de la caja (una vez).
    let linea = gana ? 'Palicaso devuelve las fichas, y algo de dignidad.' : 'Palicaso se queda con todo. Y te lo cuenta.';
    if (gana && ESTADO.faltaCaja) {
      ESTADO.hucha = Math.min(META_HUCHA, (ESTADO.hucha || 0) + ESTADO.faltaCaja);
      linea = `Palicaso devuelve lo de la caja: +${ESTADO.faltaCaja} a la hucha (${ESTADO.hucha}/${META_HUCHA}).`;
      ESTADO.faltaCaja = 0;
      ESTADO.precinto = false;
      guardarPartida();
    }
    this.botonCreo.setVisible(false);
    this.botonFarol.setVisible(false);
    this.time.delayedCall(700, () => panelFinal(this, {
      titulo: gana ? '¡Le has pillado!' : 'Palicaso gana la mano',
      linea, puntos: this.puntos, clave: 'Farol', gana,
    }));
  }
}

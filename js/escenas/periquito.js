// ¡Periquito! (Perico, cap. 6 «Perico lo sabe»): Perico va soltando frases por el bar, letra a letra.
// Cuando va a decir «¡Vuper es Monchiman!», hay que gritarle «¡periquito!» antes de que acabe:
// le salta el pin pin y se le olvida lo que iba a decir. Pero ojo con las fintas («Vuper es mono»,
// «Monchu, mi primo»): si le cortas sin motivo, se ofende. Cada vez habla más rápido.

const FRASES_PERICO = {
  peligro: [
    '¡Vuper es Monchiman!', '¡Escuchad todos! ¡Vuper es Monchiman!', 'Lo sé de buena tinta: Vuper es Monchiman.',
    'Pin pin… ¡Vuper es Monchiman!', 'Os lo digo en serio: Vuper es Monchiman.', 'El rider ese, Vuper, es Monchiman.',
  ],
  finta: [
    '¡Vuper es mono! Muy mono.', '¡Vuper es Monchu, mi primo! No, espera.', 'Vuper es monótono. Pin pin.',
    '¡Vuper es Mon… tañero! Le gusta el monte.', 'Vuper es monchi… no, monchi no. Majo. Es majo.',
  ],
  inocua: [
    'Pin pin. ¿Alguien quiere pipas?', 'Hoy hace un día de pipas.', 'El casero tiene cara de llave.',
    '¡Periquito! Digo… nada, nada.', 'Lasslow huele raro. Más raro.', 'Yo de mayor quiero ser portero. Ah, que ya.',
  ],
};
const FRASES_TOTAL = 16;

class Periquito extends Phaser.Scene {
  constructor() { super('Periquito'); }

  create(datos) {
    this.puntos = 0;
    this.vidas = 3;
    this.frase = 0;
    this.racha = 0;
    this.activa = null;

    fondo(this, enMundoHumo() ? 'bg-dentro' : 'bgn-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.4);
    this.perico = this.add.image(230, 640, 'perico-cotilleando').setOrigin(0.5, 1).setDepth(5);
    this.escP = 330 / this.perico.height;
    this.perico.setScale(this.escP);
    flotar(this, this.perico, { amplitud: 4 });
    // Los que escuchan (si se enteran, ponen cara).
    this.oyentes = [['lasslow-digno', 760], ['palicaso', 950], ['blancaso', 1130]].map(([k, x]) => {
      const o = this.add.image(x, 650, k).setOrigin(0.5, 1).setDepth(4);
      o.setScale(180 / o.height);
      o.base = k;
      return o;
    });

    this.caja = this.add.container(720, 220).setDepth(30);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).lineStyle(6, HEX.tinta, 1).fillRoundedRect(-440, -80, 880, 160, 30).strokeRoundedRect(-440, -80, 880, 160, 30);
    g.fillTriangle(-400, 40, -340, 70, -470, 150).lineBetween(-400, 76, -470, 150).lineBetween(-340, 76, -470, 150);
    this.caja.add(g);
    this.textoFrase = this.add.text(0, 0, '', { fontFamily: FUENTE, fontSize: '38px', color: COLOR.tinta, align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5);
    this.caja.add(this.textoFrase);

    this.textoPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoFraseN = texto(this, ANCHO / 2, 40, '', 26, COLOR.crema).setDepth(50);
    this.textoRacha = texto(this, 150, 80, '', 22, COLOR.verde).setDepth(50);
    this.vidasG = [0, 1, 2].map(i => this.add.star(ANCHO - 180 + i * 50, 44, 5, 9, 20, HEX.amarillo).setStrokeStyle(4, HEX.tinta).setDepth(50));
    this.ayuda = texto(this, 720, 360, 'Grita «¡periquito!» SOLO si va a decir «Monchiman»', 24, COLOR.crema, 900).setDepth(50);

    this.boton = boton(this, 720, 640, '¡PERIQUITO! (Espacio)', () => this.gritar(), { ancho: 460, alto: 96, tam: 32, color: HEX.amarillo }).setDepth(60);
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.gritar(); });
    this.input.on('pointerdown', (_p, sobre) => { if (!sobre.length) this.gritar(); });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 500, () => this.siguiente());
  }

  siguiente() {
    if (this.vidas <= 0 || this.frase >= FRASES_TOTAL) return this.final();
    this.frase++;
    this.textoFraseN.setText(`Frase ${this.frase} de ${FRASES_TOTAL}`);
    this.perico.setTexture('perico-cotilleando').setScale(this.escP);
    this.oyentes.forEach(o => o.setTexture(o.base).setScale(180 / o.height));
    // Las fintas llegan a partir de la cuarta frase.
    const r = Math.random();
    const tipo = this.frase <= 3 ? (r < 0.6 ? 'peligro' : 'inocua') : r < 0.45 ? 'peligro' : r < 0.75 ? 'finta' : 'inocua';
    const txt = Phaser.Utils.Array.GetRandom(FRASES_PERICO[tipo]);
    const mon = txt.indexOf('Monchiman');
    this.activa = { tipo, txt, k: 0, desde: mon >= 0 ? mon : -1 };
    const paso = Math.max(32, 78 - this.frase * 3);
    this.textoFrase.setText('');
    this.caja.setScale(0.9);
    this.tweens.add({ targets: this.caja, scale: 1, duration: 160, ease: 'Back.out' });
    this.ev = this.time.addEvent({
      delay: paso, repeat: txt.length - 1,
      callback: () => {
        const a = this.activa;
        if (!a) return;
        a.k++;
        this.textoFrase.setText(txt.slice(0, a.k));
        if (a.k % 3 === 0) sfx(this, 'pop', { volume: 0.12 });
        if (a.k >= txt.length) this.acabo();
      },
    });
  }

  // La frase se ha dicho entera sin que la cortes.
  acabo() {
    const a = this.activa;
    if (!a) return;
    this.activa = null;
    if (a.tipo === 'peligro') {
      // ¡Lo ha dicho! Todo el bar lo ha oído.
      this.vidas--;
      this.vidasG[this.vidas].setFillStyle(0x3d3350);
      this.racha = 0;
      sfx(this, 'oooh', { volume: 0.5 });
      this.cameras.main.shake(260, 0.01);
      const caras = { 'lasslow-digno': 'lasslow-horror', palicaso: 'palicaso-contando', blancaso: 'blancaso-mareado' };
      this.oyentes.forEach(o => o.setTexture(caras[o.base]).setScale(180 / o.height));
      golpeTexto(this, 720, 360, '¡Lo ha oído todo el bar!', COLOR.rosa, 44);
    } else {
      this.puntos += 30;
      golpeTexto(this, 720, 360, 'Bien aguantado · +30', COLOR.verde, 32);
    }
    this.pintar();
    this.time.delayedCall(1300, () => this.siguiente());
  }

  gritar() {
    const a = this.activa;
    if (!a) return;
    this.activa = null;
    if (this.ev) this.ev.remove();
    const enVentana = a.tipo === 'peligro' && a.k >= a.desde + 1;
    if (enVentana) {
      // Pin pin: se le olvida lo que iba a decir. Cuanto antes (pero ya en «Mon…»), más puntos.
      this.racha++;
      const quedaba = (a.txt.length - a.k) / a.txt.length;
      const gana = Math.round((100 + quedaba * 200) * Math.min(this.racha, 4));
      this.puntos += gana;
      sfx(this, 'pin-pin', { volume: 0.7 });
      this.perico.setTexture('perico-silbando').setScale(this.escP);
      this.textoFrase.setText(a.txt.slice(0, a.k) + '… ¡PIN PIN!');
      Comic.impacto(this, 230, 300, { tam: 90, profundidad: 45 });
      golpeTexto(this, 720, 360, `+${gana}`, COLOR.amarillo, 48);
    } else {
      // Le has cortado sin motivo (o antes de tiempo): se ofende.
      this.racha = 0;
      this.vidas--;
      this.vidasG[this.vidas].setFillStyle(0x3d3350);
      sfx(this, 'rimshot', { volume: 0.5 });
      this.perico.setTexture('perico-graznando').setScale(this.escP);
      this.textoFrase.setText(Phaser.Utils.Array.GetRandom(['¿Qué? ¡Si no he dicho nada!', 'Periquito tu madre.', '¡Que no iba a decir eso! Pin… pin.']));
      Comic.emote(this, 260, 260, 'rayo', { profundidad: 45 });
    }
    this.pintar();
    this.time.delayedCall(1300, () => this.siguiente());
  }

  pintar() {
    this.textoPuntos.setText(`${this.puntos} puntos`);
    this.textoRacha.setText(this.racha > 1 ? `Racha x${Math.min(this.racha, 4)}` : '');
    if (this.ayuda.active && this.frase >= 3) this.tweens.add({ targets: this.ayuda, alpha: 0, duration: 400, onComplete: () => this.ayuda.destroy() });
  }

  final() {
    if (this._acabado) return;
    this._acabado = true;
    const gana = this.vidas > 0 && this.puntos >= MISIONES.Periquito.umbrales[0];
    this.boton.setVisible(false);
    this.time.delayedCall(600, () => panelFinal(this, {
      titulo: gana ? 'Nadie se ha enterado' : '¡Todo el bar lo sabe!',
      linea: gana ? 'Perico se ha pasado la noche diciendo «pin pin». Nadie sospecha nada. Por ahora.' : 'Bueno, nadie le ha creído. Es un pájaro. Pero el casero viene esta semana…',
      puntos: this.puntos, clave: 'Periquito', gana,
    }));
  }
}

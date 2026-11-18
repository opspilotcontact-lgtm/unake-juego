// El último plano del juego: cierra el círculo del piloto (punto 16 de ampliacion-propuesta.md).
// El juego empezó con Vuper delante de la puerta, con media contraseña y sin poder entrar. Acaba en el mismo
// sitio, pero ahora sale él de dentro y se para porque quiere: a decirle la contraseña a Perico, que era lo
// único que Perico pedía («Si entra, no vuelve»). La Pompa, que en el piloto contestaba cinco preguntas tarde
// y para nadie, lo dice a tiempo por una vez. Y Blancaso tacha los palotes y escribe un nombre: le han visto.
// PROPUESTA para el juego: nada de esto es canon de la serie.

class Circulo extends Puerta {
  constructor() { super('Circulo'); }

  create(datos) {
    this.botones = [];
    this.globos = [];
    this.ocupado = false;

    this.add.image(-220, -332, 'bg-fuera').setOrigin(0).setScale(1.5);
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.25);
    this.perico = this.add.image(812, 300, 'perico').setScale(0.55);
    flotar(this, this.perico, { amplitud: 4, periodo: 900 });
    this.vuper = this.add.image(260, 470, 'vuper').setScale(0.75);
    flotar(this, this.vuper);
    if (typeof Musica !== 'undefined') Musica.silencio();

    entrar(this, datos);
    this.time.delayedCall(700, () => this.dialogo([
      ['narrador', 'Tarde, cuando en Unaké ya no queda nadie, Vuper sale. Y se para delante de la puerta. Por fuera.'],
      ['perico', '…¿Contraseña? ¿Contraseña?'],
      ['vuper', 'Unaké.'],
      ['perico', '¿Una quéeeee?'],
      ['vuper', 'Una aso.'],
      ['perico', '¿De quién? ¿De quién?'],
    ], () => this.opciones([['«De…»', () => this.respuesta()]])));
  }

  // Vuper sigue sin tener el final apuntado. Esta vez alguien se lo dice a tiempo.
  respuesta() {
    this.limpiar();
    this.dialogo([
      ['vuper', 'De…'],
    ], () => {
      this.limpiar();
      const t = this.add.text(ANCHO / 2, 78, '…De los hermanos Aso.', { fontFamily: FUENTE, fontSize: '34px', color: '#bdf4ff', stroke: COLOR.tinta, strokeThickness: 7 }).setOrigin(0.5).setDepth(60).setAlpha(0);
      const quien = this.add.text(ANCHO / 2, 30, 'La Pompa, desde el techo. A tiempo.', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 5 }).setOrigin(0.5).setDepth(60).setAlpha(0);
      sfx(this, 'plop', { volume: 0.4 });
      this.tweens.add({ targets: [t, quien], alpha: 1, duration: 500 });
      this.globos.push(t, quien);
      this.time.delayedCall(2400, () => this.dialogo([
        ['vuper', 'De los hermanos Aso.'],
        ['perico', '…'],
        ['perico', 'Has vuelto.'],
        ['vuper', 'Te dije que volvía.'],
      ], () => this.agenda()));
    });
  }

  // Dentro, la agenda de Blancaso: las páginas de siempre (cientos de noches, apagadas) y debajo, con su boli
  // azul, TUS palotes: los desmayos de esta partida (guinda §1). Luego los tacha todos y escribe un nombre.
  agenda() {
    this.limpiar();
    const d = stat('desmayos');
    const velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0).setDepth(80);
    this.tweens.add({ targets: velo, fillAlpha: 0.86, duration: 500 });
    const hoja = this.add.container(ANCHO / 2, ALTO + 320).setDepth(81).setAngle(-3);
    const g = this.add.graphics();
    hojaAgenda(g, 600, 420, 34);
    // Las noches de antes: más pequeñas y gastadas, de fondo.
    g.lineStyle(3, 0x2b2b3a, 0.35);
    const filas = [];
    for (let f = 0; f < 3; f++) {
      const y = -178 + f * 40;
      for (let c = 0; c < 6; c++) {
        const x = -205 + c * 78;
        for (let k = 0; k < 4; k++) g.lineBetween(x + k * 10, y, x + k * 10 + 2, y + 28);
        g.lineBetween(x - 5, y + 22, x + 38, y + 5);
      }
      filas.push(y + 14);
    }
    hoja.add(g);
    // Los tuyos, de cinco en cinco y con otra tinta (como mucho 40 a la vista; el resto, «+N»).
    const boli = this.add.graphics();
    hoja.add(boli);
    const vistos = Math.min(d, 40);
    const grupos = Math.ceil(vistos / 5);
    for (let i = 0; i < grupos; i++) {
      const x = -205 + (i % 6) * 78, y = -48 + Math.floor(i / 6) * 46;
      const n = Math.min(5, vistos - i * 5);
      this.time.delayedCall(1200 + i * 110, () => {
        boli.lineStyle(4, 0x2b3fd6, 0.95);
        for (let k = 0; k < Math.min(n, 4); k++) boli.lineBetween(x + k * 11, y, x + k * 11 + 2, y + 34);
        if (n === 5) boli.lineBetween(x - 6, y + 27, x + 42, y + 5);
        sfx(this, 'papel', { volume: 0.15, rate: 1.3 });
      });
      if (i % 6 === 0) filas.push(y + 17);
    }
    if (d > 40) this.time.delayedCall(1200 + grupos * 110, () => hoja.add(this.add.text(268, 46, `+${d - 40}`, { fontFamily: FUENTE, fontSize: '26px', color: '#2b3fd6' }).setOrigin(1, 0.5).setAngle(-6)));
    // Con la página en blanco, Blancaso escribe un cero. Y lo mira.
    if (!d) this.time.delayedCall(1300, () => hoja.add(this.add.text(-180, -30, '0', { fontFamily: FUENTE, fontSize: '54px', color: '#2b3fd6' }).setOrigin(0.5).setAngle(-4)));
    const nota = !d ? '…Sospechoso.' : d < 5 ? 'Pocos. Apuntado.' : d <= 20 ? 'Yo ya sabía que esto iba a pasar.' : 'Lo apunto en rojo.';
    this.time.delayedCall(1500 + grupos * 110, () => {
      const t = this.add.text(d ? 20 : -130, !d ? -24 : d > 30 ? 64 : 42, nota, { fontFamily: FUENTE, fontSize: '22px', color: '#2b3fd6' }).setOrigin(d ? 0.5 : 0, 0.5).setAngle(-2).setAlpha(0);
      hoja.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 300 });
    });
    this.tweens.add({ targets: hoja, y: ALTO / 2 - 10, duration: 700, ease: 'Back.out', delay: 300 });
    const rotulo = this.add.text(ANCHO / 2, 60, 'Dentro, Blancaso abre la agenda.', { fontFamily: FUENTE, fontSize: '26px', color: COLOR.crema, align: 'center', wordWrap: { width: 1100 } }).setOrigin(0.5).setDepth(82).setAlpha(0);
    this.tweens.add({ targets: rotulo, alpha: 1, duration: 400, delay: 500 });
    this.time.delayedCall(1100, () => rotulo.setText(!d ? 'Dentro, Blancaso abre la agenda. Tu página está en blanco.'
      : d > 20 ? 'Y en la última página, los tuyos. Y en la de atrás. Y en la tapa.' : 'Y en la última página, los tuyos.'));
    // Los tacha de golpe, fila a fila (también los tuyos), y escribe el nombre.
    const t0 = 2300 + grupos * 110;
    const tacha = this.add.graphics().setDepth(1);
    hoja.add(tacha);
    filas.forEach((y, f) => this.time.delayedCall(t0 + f * 300, () => {
      sfx(this, 'zas', { volume: 0.4 });
      tacha.lineStyle(7, 0xd9584f, 0.9).lineBetween(-225, y + 4, 255, y - 2);
    }));
    const tn = t0 + filas.length * 300 + 300;
    this.time.delayedCall(tn, () => {
      rotulo.setText('Y escribe un nombre.');
      const nombre = this.add.text(0, 140, '', { fontFamily: FUENTE, fontSize: '66px', color: '#2b3fd6' }).setOrigin(0.5).setAngle(-2);
      hoja.add(nombre);
      'VUPER'.split('').forEach((l, i) => this.time.delayedCall(i * 230, () => { nombre.setText(nombre.text + l); sfx(this, 'pop', { volume: 0.35, rate: 0.9 + i * 0.08 }); }));
    });
    this.time.delayedCall(tn + 2300, () => {
      sfx(this, 'campanita', { volume: 0.5 });
      this.tweens.add({ targets: [hoja, rotulo], alpha: 0, duration: 500 });
      this.tweens.add({ targets: velo, fillAlpha: 0, duration: 600, delay: 300, onComplete: () => this.remate(!d) });
    });
  }

  // El estado se queda el último chiste.
  remate(cero) {
    this.dialogo([
      ...(cero ? [['perico', 'Ni uno. Ni uno.'], ['vuper', 'Vale, vale…']] : []),
      ['perico', 'Nuevo. Nuevo.'],
      ['vuper', 'Ya no.'],
      ['perico', 'Pin pin.'],
    ], () => {
      this.limpiar();
      sfx(this, 'pin-pin', { volume: 0.7 });
      ESTADO.circuloCerrado = true;
      guardarPartida();
      const fin = texto(this, ANCHO / 2, ALTO / 2 - 20, '¿Una qué?', 96, COLOR.amarillo).setDepth(90).setScale(0);
      this.tweens.add({ targets: fin, scale: 1, duration: 500, ease: 'Back.out' });
      this.time.delayedCall(2600, () => irA(this, 'Barrio', { aviso: 'Modo libre: a por los récords' }));
    });
  }
}

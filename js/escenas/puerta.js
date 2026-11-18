// La puerta del capítulo 1: el final del piloto «¿Una qué?», jugado.
// Vuper llega con media contraseña en la mano («UNAKÉ · UNA ASO · DE»). La otra media no la tiene nadie
// que se la quiera decir. Lo que rompe el bucle no es acertar: es empujar. La puerta no tiene cerradura
// (los poscréditos del piloto), y Perico se inventó la contraseña sin final porque Vuper es el único
// que se para a hablar con él. PROPUESTA para el juego: en la serie sigue sin decidir si Vuper entra.

class Puerta extends Phaser.Scene {
  constructor(clave = 'Puerta') { super(clave); }

  create(datos) {
    this.intentos = 0;
    this.botones = [];
    this.globos = [];
    this.ocupado = false;

    this.add.image(-220, -332, 'bg-fuera').setOrigin(0).setScale(1.5);
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.25);
    this.perico = this.add.image(812, 300, 'perico').setScale(0.55);
    flotar(this, this.perico, { amplitud: 4, periodo: 900 });
    this.vuper = this.add.image(260, 470, 'vuper').setScale(0.75);
    flotar(this, this.vuper);

    // La mano: lo que lleva apuntado. Después de «DE», tinta corrida.
    const mano = this.add.container(170, 200).setDepth(40).setAngle(-5);
    const g = this.add.graphics().fillStyle(0xb9bfd0, 1).lineStyle(5, HEX.tinta, 1).fillRoundedRect(-140, -92, 280, 184, 40).strokeRoundedRect(-140, -92, 280, 184, 40);
    const tinta = this.add.text(0, -6, 'UNAKÉ ·\nUNA ASO ·\nDE ~~~', { fontFamily: FUENTE, fontSize: '30px', color: '#2b3fd6', align: 'center' }).setOrigin(0.5);
    const pie = this.add.text(0, 112, 'Tu mano', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema }).setOrigin(0.5);
    mano.add([g, tinta, pie]);

    this.input.keyboard.on('keydown', e => {
      const n = ['1', '2', '3'].indexOf(e.key);
      if (n >= 0 && this.botones[n]) this.botones[n].emit('pointerdown');
    });

    entrar(this, datos);
    // Acaba como empieza: el mismo plano y las mismas frases que la entrada en frío (escenas/intro.js).
    this.time.delayedCall(700, () => this.dialogo([
      ['perico', 'Contraseña. Contraseña. Contraseña…'],
      ['vuper', '¿…Unaké?'],
      ['perico', '¿Una quéeeee?'],
      ['vuper', '¿Una… aso?'],
      ['perico', '¿De quién? ¿De quién?'],
    ], () => this.elegir()));
  }

  limpiar() {
    this.globos.forEach(b => b.destroy());
    this.globos = [];
    this.botones.forEach(b => b.destroy());
    this.botones = [];
  }

  decir(quien, frase) {
    const perico = quien === 'perico';
    if (quien === 'narrador') {
      const t = this.add.text(ANCHO / 2, 96, frase, { fontFamily: FUENTE, fontSize: '26px', color: COLOR.crema, align: 'center', wordWrap: { width: 760 }, stroke: COLOR.tinta, strokeThickness: 6 }).setOrigin(0.5).setDepth(60);
      this.globos.push(t);
      return;
    }
    const b = perico
      ? bocadillo(this, 800, 120, frase, { cola: 'abajo', ancho: 460 })
      : bocadillo(this, 430, 300, frase, { cola: 'izq', ancho: 420 });
    this.globos.push(b);
    sfx(this, 'pop', { volume: 0.5 });
    if (perico) cambiarPose(this, this.perico, 'perico-graznando');
  }

  // Frases de una en una; se pasa con clic, espacio o sola a los 2,6 s.
  dialogo(lineas, alAcabar) {
    let i = -1, reloj = null;
    const paso = () => {
      if (reloj) reloj.remove();
      i += 1;
      if (i >= lineas.length) {
        this.input.off('pointerdown', paso);
        this.input.keyboard.off('keydown-SPACE', paso);
        return alAcabar();
      }
      this.globos.forEach(b => b.destroy());
      this.globos = [];
      this.decir(lineas[i][0], lineas[i][1]);
      reloj = this.time.delayedCall(2600 + lineas[i][1].length * 22, paso);
    };
    // Con un respiro: el mismo clic que abre el diálogo no debe pasar su primera frase.
    this.time.delayedCall(80, () => { this.input.on('pointerdown', paso); this.input.keyboard.on('keydown-SPACE', paso); });
    paso();
  }

  opciones(lista) {
    this.botones.forEach(b => b.destroy());
    this.botones = lista.map(([etiqueta, accion, color], k) => {
      const y = 560;
      const ancho = Math.min(520, Math.floor((ANCHO - 120) / lista.length) - 20);
      const x = ANCHO / 2 + (k - (lista.length - 1) / 2) * (ancho + 24);
      const b = boton(this, x, y + 60, etiqueta, () => { if (this.ocupado) return; this.botones.forEach(o => o.destroy()); this.botones = []; accion(); }, { ancho, alto: 86, tam: 26, color: color || HEX.amarillo });
      b.setDepth(70);
      return b;
    });
  }

  elegir() {
    const empujar = ['Empujar la puerta', () => this.empujar(), HEX.verde];
    const de = ['«De…»', () => this.fallar()];
    const blbl = ['«¿De los blbl-blblbl blbl?»', () => this.fallar('puky')];
    // La primera vez solo tienes lo de la mano. La salida aparece al fallar: nadie te la da hecha.
    this.opciones(this.intentos === 0 ? [de, blbl] : [de, blbl, empujar]);
    if (this.intentos >= 1) {
      this.globos.forEach(b => b.destroy());
      this.globos = [];
      this.decir('narrador', this.intentos === 1
        ? 'Cotine entró por el tejado. Lasslow, de culo. Puky, por debajo. Ninguno dijo nada.'
        : 'Cotine lo dijo en la plaza: «Tú ni caso, que la puerta está abieeer…».');
    }
  }

  fallar(como) {
    this.intentos += 1;
    sfx(this, 'bonk', { volume: 0.5 });
    this.cameras.main.shake(160, 0.006);
    this.dialogo([
      ['vuper', como === 'puky' ? '¿De los… blbl-blblbl blbl?' : '…¿De…?'],
      ['perico', this.intentos === 1 ? 'Nuevo. Nuevo. Te lo explico. Te lo explico.' : 'Nuevo. Nuevo.'],
      ['vuper', this.intentos === 1 ? 'No, no, no. Otra vez por dentro del pájaro, no.' : 'Que no soy nuevo…'],
    ], () => this.elegir());
  }

  empujar() {
    this.ocupado = true;
    this.limpiar();
    sfx(this, 'puerta');
    this.cameras.main.shake(260, 0.012);
    cambiarPose(this, this.perico, 'perico-horror');
    if (typeof Comic !== 'undefined' && Comic.impacto) Comic.impacto(this, 640, 330);
    sumarStat('puertaEmpujada');
    this.time.delayedCall(700, () => {
      this.ocupado = false;
      this.dialogo([
        ['narrador', 'La puerta se abre sola. No tiene cerradura. Ni pestillo. No los ha tenido nunca.'],
        ['vuper', '…¿Estaba abierta?'],
        ['perico', '¡Empujando no! ¡Empujando no!'],
        ['narrador', 'Por dentro, la puerta está llena de palotes. De arriba abajo.'],
        ['perico', 'Si entras, no vuelves. No vuelves.'],
      ], () => this.opciones([
        ['«Vuelvo mañana. Me debes el final.»', () => this.pasar()],
        ['«¿Y con quién ibas a hablar tú?»', () => this.pasar(true)],
      ]));
    });
  }

  pasar(pulla) {
    this.limpiar();
    cambiarPose(this, this.perico, 'perico');
    this.dialogo([
      ['vuper', pulla ? '¿Y con quién ibas a hablar tú, si no? Vuelvo mañana.' : 'Vuelvo mañana. Y me dices cómo acaba.'],
      ['perico', '…Pasa, pasa. Pero que conste que te he visto, rider.'],
      ['vuper', '¿Visto el qué?'],
      ['perico', 'Pin pin.'],
    ], () => {
      sfx(this, 'pin-pin', { volume: 0.7 });
      Object.assign(ESTADO, { dentro: true, sala: 'dentro', x: 160, y: 600 });
      guardarPartida();
      irA(this, 'Barrio', { rotulo: 'Estás dentro' });
    });
  }
}

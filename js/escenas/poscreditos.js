// Después de los créditos… «¿Me llamabais?»: juegas siendo Puky, en la puerta de Unaké.
// Perico le pide la contraseña (el bucle del E00) y, por primera vez, Puky se la sabe. Al final le
// invitan: su deseo canon. Iris que se cierra sobre él, como en el E00. No se puede perder.

const POSCREDITOS = [
  {
    pregunta: '¿Contraseña? ¿Contraseña?',
    opciones: [
      ['¿Me llamabais?', 'No. Nunca. Contraseña.'],
      ['Unaké.', null],
      ['*blurp*', 'Eso no es una contraseña. Eso es un charco.'],
    ],
  },
  {
    pregunta: '¿Una qué?',
    opciones: [
      ['Una fiesta. ¿Puedo pasar?', 'Precisamente por eso, no.'],
      ['Una pota.', 'Pin pin. Qué asco. Otra vez.'],
      ['Una aso.', null],
    ],
  },
  {
    pregunta: '¿De quién?',
    opciones: [
      ['De Monchiman.', 'Pin pin… ¿Cómo sabes tú eso? …Digo: ¿qué dices?'],
      ['De los hermanos Aso, Palicaso y Blancaso, que tienen Unaké.', null],
      ['De todos. ¿Me invitáis?', 'Eso tiene que decirlo uno de dentro.'],
    ],
  },
  {
    pregunta: '¿Una qué?',
    opciones: [
      ['Una aso…', null],
      ['¡OTRA VEZ NO!', null],
      ['Me cuelo por debajo de la puerta, como siempre.', null],
    ],
  },
];

class Poscreditos extends Phaser.Scene {
  constructor() { super('Poscreditos'); }

  create(datos) {
    this.paso = 0;
    fondo(this, 'bg-fuera');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.35);
    this.puky = this.add.image(330, 690, 'puky').setOrigin(0.5, 1).setDepth(5);
    this.escPuky = 250 / this.puky.height;
    this.puky.setScale(this.escPuky);
    flotar(this, this.puky, { amplitud: 5 });
    this.perico = this.add.image(930, 470, 'perico-cotilleando').setOrigin(0.5, 1).setDepth(5);
    this.perico.setScale(240 / this.perico.height);
    this.botones = [];

    entrar(this, datos);
    rotulo(this, 'Después de los créditos…', () => {
      Comic.cartela(this, 'PUKY', 'el que nunca está invitado', '#f2d23c', { x: 60, y: ALTO - 200, ms: 2600 });
      sfx(this, 'puky-gracioso', { volume: 0.5 });
      this.time.delayedCall(1400, () => this.preguntar());
    });
  }

  hablar(quien, str, ms = 2200) {
    if (this.burbuja) this.burbuja.destroy();
    const x = quien === 'perico' ? 760 : 470;
    this.burbuja = bocadillo(this, x, quien === 'perico' ? 210 : 330, str, { tam: 26, ancho: 460, cola: quien === 'perico' ? 'der' : 'izq' }).setDepth(40);
    sfx(this, quien === 'perico' ? 'pin-pin' : 'blurp', { volume: 0.35 });
    const b = this.burbuja;
    if (ms) this.time.delayedCall(ms, () => { if (b.active && b === this.burbuja) b.destroy(); });
  }

  preguntar() {
    const p = POSCREDITOS[this.paso];
    if (!p) return this.invitado();
    this.perico.setTexture('perico-cotilleando');
    this.hablar('perico', p.pregunta, 0);
    this.botones.forEach(b => b.destroy());
    this.botones = p.opciones.map(([txt, replica], i) => boton(this, 830, 480 + i * 76, `${i + 1} · ${txt}`, () => this.contestar(txt, replica), { ancho: 640, alto: 66, tam: 21, color: [HEX.amarillo, HEX.azul, HEX.crema][i] }).setDepth(50));
    this.input.keyboard.removeAllListeners('keydown');
    this.input.keyboard.on('keydown', e => { const n = Number(e.key); if (n >= 1 && n <= p.opciones.length) this.contestar(...p.opciones[n - 1]); });
  }

  contestar(txt, replica) {
    if (this.ocupado) return;
    this.ocupado = true;
    this.botones.forEach(b => b.setVisible(false));
    this.hablar('puky', txt, 1500);
    this.time.delayedCall(1600, () => {
      this.ocupado = false;
      if (replica) {
        // Respuesta mala: Perico se lo dice y vuelve a preguntar.
        this.perico.setTexture('perico-graznando');
        this.hablar('perico', replica, 1800);
        this.time.delayedCall(1900, () => this.preguntar());
        return;
      }
      this.paso++;
      this.preguntar();
    });
  }

  invitado() {
    this.botones.forEach(b => b.destroy());
    this.input.keyboard.removeAllListeners('keydown');
    // Desde dentro, Blancaso rompe el bucle: le invitan.
    this.hablar('perico', '…', 1200);
    this.time.delayedCall(1300, () => {
      const voz = bocadillo(this, ANCHO / 2, 120, 'BLANCASO (desde dentro): Déjale pasar, Perico. Está invitado.', { tam: 24, ancho: 640 }).setDepth(40);
      sfx(this, 'puerta');
      this.time.delayedCall(2600, () => {
        voz.destroy();
        this.puky.setTexture('puky-que-rico').setScale(250 / this.puky.height);
        this.hablar('puky', '¿Me… llamabais?', 1800);
        this.time.delayedCall(2000, () => {
          const voz2 = bocadillo(this, ANCHO / 2, 120, 'BLANCASO: Sí. Esta vez, sí.', { tam: 26, ancho: 520 }).setDepth(40);
          sfx(this, 'aaah', { volume: 0.5 });
          Comic.emote(this, this.puky.x, this.puky.y - 280, 'corazon', { tam: 90, ms: 1600, profundidad: 45 });
          ESTADO.pukyInvitado = true;
          sumarStat('pukyInvitado');
          guardarPartida();
          this.time.delayedCall(2600, () => {
            voz2.destroy();
            // Iris que se cierra sobre Puky, como en el E00.
            Comic.cubrir.iris(this, () => {
              this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, UNAKE.noche).setDepth(999);
              this.time.delayedCall(600, () => irA(this, 'Barrio', { aviso: 'Modo libre: a por los récords' }));
            }, { x: this.puky.x, y: this.puky.y - 130 });
          });
        });
      });
    });
  }
}

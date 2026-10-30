// La contraseña: Perico pregunta en la mirilla y hay que contestar el bucle
// («¿Contraseña?» «Unaké» «¿Una qué?» «Una aso»…) cada vez más rápido.
// Con 3 respuestas seguidas Perico abre: desde ahí se puede entrar cuando se quiera (4) o seguir
// el bucle por el récord, que da más puntos por vuelta pero cada vez con menos tiempo.
// Si ya ha abierto y se acaban las vidas, se entra igual: la contraseña ya se sabe.
// Si dices «Periquito», suena el pin pin y Perico vuelve a empezar.

const BUCLE = [
  { p: '¿Contraseña?', r: 'Unaké' },
  { p: '¿Una qué?', r: 'Una aso' },
  { p: '¿De quién?', r: 'De los hermanos Aso' },
  { p: '¿Qué hermanos?', r: 'Palicaso y Blancaso' },
  { p: '¿Y qué tienen?', r: 'Unaké' },
];
const DESPISTES = [
  'Una cosa', 'Un bar', 'Unaqué', 'Una casa', 'Los hermanos Paso', 'Palito y Blanquito',
  'Una aso', 'Unaké', 'Dos hermanos', 'Una qué', 'De mi primo', 'Una moto',
];

class Contrasena extends Phaser.Scene {
  constructor() { super('Contrasena'); }

  create(datos) {
    // Nivel 3+: Perico pregunta más rápido; nivel 5+, aún más.
    this.nivel = nivelDe('Contrasena');
    this.paso = 0;          // índice en BUCLE
    this.aciertos = 0;
    this.vueltas = 0;
    this.puntos = 0;
    this.vidas = tiene('silbato') ? 4 : 3;
    this.tiempoMax = 4.5 * (this.nivel >= 5 ? 0.75 : this.nivel >= 3 ? 0.85 : 1);
    this.racha = 0;
    this.abierto = false;
    this.tiempo = 0;
    this.activo = false;
    this.botones = [];

    // La puerta de Unaké de cerca: la mirilla queda arriba en el centro.
    this.add.image(-220, -332, 'bg-fuera').setOrigin(0).setScale(1.5);
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.25);
    this.perico = this.add.image(812, 300, 'perico').setScale(0.55);
    flotar(this, this.perico, { amplitud: 4, periodo: 900 });
    this.vuper = this.add.image(260, 470, 'vuper').setScale(0.75);
    flotar(this, this.vuper);

    this.marcador = texto(this, 1120, 40, '0 puntos', 30, COLOR.amarillo);
    this.textoVueltas = texto(this, 1120, 82, 'Vuelta 0', 22, COLOR.crema);
    this.corazones = Array.from({ length: this.vidas }, (_, i) => this.add.image(46 + i * 58, 46, 'vuper').setScale(0.12));
    this.marcoTiempo = this.add.rectangle(812, 470, 300, 22, HEX.tinta).setStrokeStyle(4, HEX.crema);
    this.barraTiempo = this.add.rectangle(812 - 146, 470, 292, 14, HEX.amarillo).setOrigin(0, 0.5);

    this.input.keyboard.on('keydown', e => {
      const n = ['1', '2', '3', '4'].indexOf(e.key);
      if (n >= 0 && this.botones[n]) this.botones[n].emit('pointerdown');
    });

    if (!ESTADO.dentro) {
      const ch = this.add.container(170, 250).setDepth(40);
      const g = this.add.graphics().fillStyle(HEX.tinta, 0.82).fillRoundedRect(-150, -110, 300, 220, 18);
      ch.add(g);
      ch.add(texto(this, 0, -84, 'La chuleta', 24, COLOR.amarillo));
      ch.add(this.add.text(-132, -58, BUCLE.map(b => `${b.p} → ${b.r}`).join('\n'), { fontFamily: FUENTE, fontSize: '15px', color: COLOR.crema, lineSpacing: 8 }));
    }
    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 700, () => {
      sfx(this, 'toc-toc', { volume: 0.8 });
      this.time.delayedCall(500, () => this.preguntar());
    });
  }

  preguntar() {
    const q = BUCLE[this.paso];
    this.limpiar();
    this.pregunta = bocadillo(this, 1050, 190, q.p, { tam: 34, cola: 'izq' });
    const opciones = [q.r];
    const pool = Phaser.Utils.Array.Shuffle(DESPISTES.filter(d => d !== q.r));
    if (Math.random() < 0.4) opciones.push('Periquito');
    while (opciones.length < 3) opciones.push(pool.pop());
    Phaser.Utils.Array.Shuffle(opciones);

    opciones.forEach((o, i) => {
      const b = boton(this, 230 + i * 410, 640, `${i + 1} · ${o}`, () => this.contestar(o), { ancho: 380, tam: 26 });
      b.setScale(0);
      this.tweens.add({ targets: b, scale: 1, duration: 200, ease: 'Back.out', delay: i * 50 });
      this.botones.push(b);
    });
    // Con la puerta abierta se puede entrar cuando se quiera (lo remata Blancaso con su «Otra vez no…»).
    if (this.abierto) {
      const b = boton(this, 640, 540, '4 · Entrar ya', () => this.romperBucle(), { ancho: 300, tam: 26, color: HEX.verde });
      this.botones.push(b);
    }
    this.tiempo = this.tiempoMax;
    this.activo = true;
  }

  limpiar() {
    this.botones.forEach(b => b.destroy());
    this.botones = [];
    if (this.pregunta) this.pregunta.destroy();
    if (this.respuesta) this.respuesta.destroy();
  }

  contestar(o) {
    if (!this.activo) return;
    this.activo = false;
    const q = BUCLE[this.paso];
    if (o === 'Periquito') return this.pinPin();
    if (o !== q.r) return this.fallo('¡Esa no es!');
    this.limpiar();
    this.respuesta = bocadillo(this, 420, 250, o, { tam: 32, cola: 'izq' });
    sfx(this, 'pop', { volume: 0.6 });
    this.aciertos++;
    this.racha++;
    if (this.racha % 5 === 0) Comic.racha(this, this.racha, { y: 160 });
    this.puntos += 10 * (this.vueltas + 1);
    this.marcador.setText(`${this.puntos} puntos`);
    this.paso++;
    if (this.paso >= BUCLE.length) {
      this.paso = 1;            // el bucle vuelve a «¿Una qué?»
      this.vueltas++;
      this.textoVueltas.setText(`Vuelta ${this.vueltas}`);
      golpeTexto(this, 640, 330, `¡Vuelta ${this.vueltas}!`, COLOR.azul, 48);
    }
    this.tiempoMax = Math.max(1.5, this.tiempoMax * 0.93);
    if (!this.abierto && this.racha >= 3) return this.abrir();
    this.time.delayedCall(420, () => this.preguntar());
  }

  // Tres seguidas: Perico abre. A partir de aquí la partida ya está ganada; lo demás es récord.
  abrir() {
    this.abierto = true;
    this.puntos += 50;
    this.marcador.setText(`${this.puntos} puntos`);
    cambiarPose(this, this.perico, 'perico-silbando');
    sfx(this, 'puerta');
    sfx(this, 'campanita');
    golpeTexto(this, 640, 300, '¡Perico te abre!', COLOR.verde, 64);
    this.aviso = texto(this, 470, 110, 'Entra cuando quieras (4)\no sigue el bucle por el récord', 24, COLOR.verde);
    this.time.delayedCall(1400, () => {
      cambiarPose(this, this.perico, 'perico');
      this.preguntar();
    });
  }

  pinPin() {
    this.racha = 0;
    this.limpiar();
    this.respuesta = bocadillo(this, 420, 250, 'Periquito', { tam: 32, cola: 'izq' });
    cambiarPose(this, this.perico, 'perico-silbando');
    sfx(this, 'pin-pin');
    golpeTexto(this, 812, 120, '¡PIN PIN!', COLOR.amarillo, 64);
    this.time.delayedCall(1200, () => {
      cambiarPose(this, this.perico, 'perico');
      golpeTexto(this, 640, 330, 'Vuelta a empezar…', COLOR.crema, 40);
      this.paso = 0;
      this.tiempoMax = Math.min(4.2, this.tiempoMax + 0.8);
      this.time.delayedCall(700, () => this.preguntar());
    });
  }

  fallo(str) {
    this.racha = 0;
    this.limpiar();
    this.vidas--;
    this.corazones[this.vidas].setTint(0x333333).setAlpha(0.4);
    cambiarPose(this, this.perico, 'perico-graznando');
    sfx(this, 'golpe');
    this.cameras.main.shake(250, 0.008);
    this.pregunta = bocadillo(this, 1050, 190, str, { tam: 34, cola: 'izq' });
    this.time.delayedCall(1000, () => {
      cambiarPose(this, this.perico, 'perico');
      if (this.vidas <= 0) return this.final(this.abierto);
      this.preguntar();
    });
  }

  romperBucle() {
    if (!this.activo) return;
    this.activo = false;
    this.limpiar();
    if (this.aviso) this.aviso.destroy();
    const blancaso = this.add.image(-200, 500, 'blancaso').setScale(0.6);
    sfx(this, 'suspiro');
    this.tweens.add({
      targets: blancaso, x: 520, duration: 600, ease: 'Back.out',
      onComplete: () => {
        this.respuesta = bocadillo(this, 560, 300, 'Otra vez no…', { tam: 34 });
        cambiarPose(this, this.perico, 'perico-horror');
        this.time.delayedCall(1100, () => {
          sfx(this, 'puerta');
          golpeTexto(this, 812, 360, '¡PASAD!', COLOR.verde, 72);
          this.time.delayedCall(900, () => this.final(true));
        });
      },
    });
  }

  final(gana) {
    this.activo = false;
    this.limpiar();
    if (gana) {
      // Ya se sabe la contraseña: al volver al barrio, Vuper aparece dentro de Unaké.
      const primera = !ESTADO.dentro;
      Object.assign(ESTADO, { dentro: true, sala: 'dentro', x: 160, y: 600 });
      sfx(this, 'risas', { volume: 0.6 });
      panelFinal(this, {
        titulo: 'Estás dentro',
        linea: `${this.vueltas ? `Aguantaste ${this.vueltas} vuelta${this.vueltas === 1 ? '' : 's'} al bucle.` : 'Contraseña correcta.'}${primera ? ' Unaké ya está abierto para ti.' : ''}`,
        puntos: this.puntos, clave: 'Contrasena',
      });
    } else {
      sfx(this, 'oooh', { volume: 0.6 });
      panelFinal(this, {
        titulo: 'Perico no te abre',
        linea: 'Hacen falta 3 respuestas seguidas. Te llevas la mitad de los puntos.',
        puntos: Math.floor(this.puntos / 2), clave: 'Contrasena', gana: false,
      });
    }
  }

  update(_t, dms) {
    if (!this.activo) return;
    this.tiempo -= dms / 1000;
    const f = Phaser.Math.Clamp(this.tiempo / this.tiempoMax, 0, 1);
    this.barraTiempo.width = 292 * f;
    this.barraTiempo.fillColor = f < 0.3 ? HEX.rojo : HEX.amarillo;
    if (this.tiempo <= 0) {
      this.activo = false;
      this.fallo('¡Tarde!');
    }
  }
}

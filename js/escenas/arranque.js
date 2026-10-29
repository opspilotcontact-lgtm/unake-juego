// Carga todo, dibuja las texturas que se generan por código y pide la edad antes de entrar.

const IMAGENES = [
  'bg-normal-fuera', 'bg-fuera', 'bg-fuera-apagado', 'bg-dentro', 'bg-cocina',
  'bg-cuarto', 'bg-cuarto-apagado', 'bg-plaza', 'bg-cielo', 'bg-tienda', 'bg-sofa', 'bg-techo', 'bg-bano', 'bgn-bano',
  'bgn-cuarto', 'bgn-plaza', 'bgn-fuera', 'bgn-tienda', 'bgn-dentro', 'bgn-cocina', 'bgn-sofa',
];
const SPRITES = [
  'titulo', 'vuper-normal', 'vuper', 'vuper-calada', 'vuper-colocado', 'monchiman', 'monchiman-picado',
  'perico', 'perico-silbando', 'perico-graznando', 'perico-horror', 'perico-volando',
  'cotine', 'cotine-plop', 'tarta', 'blancaso', 'blancaso-mareado', 'blancaso-esperanza',
  'puky', 'puky-que-rico', 'palicaso', 'lasslow', 'pompa', 'caramelo', 'patatas', 'lata',
  'vuper-reparto', 'lasslow-digno', 'lasslow-aguantando', 'lasslow-rodando', 'lasslow-pedo', 'lasslow-horror',
  'palicaso-contando', 'palicaso-riendo', 'pompa-mira', 'pompa-horror', 'perico-pipas', 'perico-cotilleando',
  'colilla', 'pajarita', 'mochila',
  'vuper-comiendo', 'vuper-fumando', 'vuper-aguanta', 'vuper-suelta', 'vuper-tos', 'vuper-pasando', 'vuper-fumado',
  'puky-eructo', 'puky-riendo', 'puky-horror', 'puky-charco', 'blancaso-derritiendose', 'blancaso-calada',
  'lasslow-calada', 'lasslow-risa-floja',
  'n-palicaso', 'n-cotine', 'n-lasslow', 'n-pompa', 'n-perico', 'n-blancaso', 'vn-rotura',
];
// Poses del mundo normal (cuerpo de persona), igual que en preparar_assets.py: n-<id>-<pose> y vn-<pose>.
const POSES_NORMAL = ['caminando', 'hablando', 'riendo', 'sorprendido', 'fumando-calada', 'fumando-aguanta', 'fumando-suelta', 'fumando-tos', 'fumando-mechero'];
['vn', 'n-palicaso', 'n-blancaso', 'n-pompa', 'n-lasslow', 'n-cotine', 'n-perico'].forEach(pref => POSES_NORMAL.forEach(pose => {
  if (pref === 'n-perico' && (pose === 'caminando' || pose === 'riendo')) return;
  SPRITES.push(`${pref}-${pose}`);
}));

// Manos para liar (1-6), mundo normal (n) y humo (h).
['mano-n', 'mano-h'].forEach(pref => [1, 2, 3, 4, 5, 6].forEach(i => SPRITES.push(`${pref}-${i}`)));

// Arte generado (jpg): solo lo que hay (js/arte.js lo escribe preparar_assets.py).
ARTE.forEach(k => IMAGENES.push(k));
ARTE_PNG.forEach(k => SPRITES.push(k));
// Las canciones del grupo que ya estén (huecos de musica.js).
const MUSICAS = (typeof MUSICA_DISPONIBLE !== 'undefined' ? MUSICA_DISPONIBLE : []);

const SONIDOS = [
  'calada', 'tos', 'whoosh', 'neon', 'zumbido-m', 'pin-pin', 'puerta', 'toc-toc', 'nam', 'boing',
  'plop', 'hinchar', 'blurp', 'golpe', 'fiuuu', 'campanita', 'oooh', 'aaah', 'risas', 'suspiro',
  'rimshot', 'tiroriro', 'zas', 'pop', 'pedo', 'ambiente-bar', 'musica-intro', 'sting',
  'puky-gracioso', 'puky-triste', 'risa-lasslow', 'se-me-ha-escapao', 'pedo-silencioso', 'pedo-tuba',
  'risa-fondo', 'platillo', 'chof', 'lata', 'arcada',
  'mechero', 'mechero-falla', 'papel', 'tos-grande', 'tos-pequena', 'goteo', 'eructo', 'temblor', 'chapoteo',
  'deshinchar', 'sorbo', 'fup', 'zas2', 'grillos', 'latido', 'cristal', 'abucheo', 'fiu', 'bonk', 'bocina',
];

class Arranque extends Phaser.Scene {
  constructor() { super('Arranque'); }

  preload() {
    // Pantalla de carga: bolitas de humo que respiran, barra y un consejo que cambia.
    for (let i = 0; i < 9; i++) {
      const b = this.add.circle(ANCHO / 2 - 240 + i * 60, ALTO / 2 - 110, 18 + (i % 3) * 6, 0xb7a9cc, 0.5).setStrokeStyle(4, HEX.tinta);
      this.tweens.add({ targets: b, y: b.y - 18, scale: 1.25, duration: 600, yoyo: true, repeat: -1, delay: i * 90, ease: 'Sine.inOut' });
    }
    texto(this, ANCHO / 2, ALTO / 2 - 20, 'Liando…', 52, COLOR.amarillo);
    this.add.rectangle(ANCHO / 2, ALTO / 2 + 60, 606, 34, HEX.tinta).setStrokeStyle(4, HEX.crema);
    const barra = this.add.rectangle(ANCHO / 2 - 300, ALTO / 2 + 60, 0, 26, HEX.rosa).setOrigin(0, 0.5);
    const porcentaje = texto(this, ANCHO / 2, ALTO / 2 + 110, '0 %', 24, COLOR.crema);
    const consejos = ['De día se trabaja; de noche, en el mundo humo, las misiones pagan x1,5.', 'Si te falta algo para liarte, pregúntale a cualquiera del barrio: igual sabe dónde está.', 'El negocio de Unaké hace caja aunque no juegues. Pásate a cobrar.', 'Perico abre con tres respuestas seguidas. Si sigues el bucle, más puntos.', 'Con el hambre a tope pierdes vida. La tienda de 24 h nunca cierra.', 'Los «?» son problemas de alguien del barrio: dan premios gordos.', 'Si se lo pasas a Blancaso… atento a lo que viene después.', 'M abre el móvil cuando te mandan algo. O oculta los objetivos.'];
    const consejo = this.add.text(ANCHO / 2, ALTO - 110, '', { fontFamily: FUENTE, fontSize: '22px', color: COLOR.azul, align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5);
    const otro = () => consejo.setText(`Consejo: ${Phaser.Utils.Array.GetRandom(consejos)}`);
    otro();
    this.time.addEvent({ delay: 2600, loop: true, callback: otro });
    this.load.on('progress', p => { barra.width = 600 * p; porcentaje.setText(`${Math.round(p * 100)} %`); });

    IMAGENES.forEach(k => this.load.image(k, `assets/img/${k}.jpg`));
    SPRITES.forEach(k => this.load.image(k, `assets/img/${k}.png`));
    SONIDOS.forEach(k => this.load.audio(k, `assets/snd/${k}.mp3`));
    MUSICAS.forEach(h => this.load.audio(`m-${h}`, `assets/musica/${h}.mp3`));
  }

  create() {
    this.texturas();
    texturasApuestas(this);
    this.scene.start('Portada');
  }

  antiguoMenu() {
    fondo(this, 'bg-fuera-apagado').setAlpha(0.5);
    texto(this, ANCHO / 2, 210, 'UNAKÉ · la noche', 72, COLOR.amarillo);
    texto(this, ANCHO / 2, 300, 'Prueba de juego. Humor para adultos: solo mayores de 18.', 30, COLOR.crema, 900);
    if (ESTADO.introVista) {
      boton(this, ANCHO / 2, 420, 'Seguir la noche (18+)', () => irA(this, 'Barrio'), { ancho: 460 });
      boton(this, ANCHO / 2 - 150, 530, 'Ver la intro', () => irA(this, 'Intro'), { ancho: 260, alto: 60, tam: 22, color: HEX.crema });
      boton(this, ANCHO / 2 + 150, 530, 'Borrar partida', () => this.borrar(), { ancho: 260, alto: 60, tam: 22, color: HEX.rosa });
    } else {
      boton(this, ANCHO / 2, 430, 'Tengo 18 o más', () => irA(this, 'Intro'), { ancho: 420 });
    }
    texto(this, ANCHO / 2, 640, 'Todo es humo. Aquí nadie juzga.', 24, COLOR.azul);
  }

  borrar() {
    if (!this._confirmar) {
      this._confirmar = true;
      golpeTexto(this, ANCHO / 2, 600, 'Pulsa otra vez para borrarla', COLOR.rosa, 30);
      return;
    }
    ESTADO = structuredClone(ESTADO_INICIAL);
    guardarPartida();
    this.scene.restart();
  }

  // Texturas dibujadas: la nube de humo (calada), las migas y los pisos de la tarta.
  texturas() {
    this.pisos();
    this.objetosLiar();
    this.vineta();
    this.objetosMinis();
    this.decoracion();
    this.niebla();
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const bolas = [[60, 90, 50], [110, 60, 55], [165, 85, 48], [110, 105, 45], [200, 100, 30]];
    g.lineStyle(10, HEX.tinta, 1);
    bolas.forEach(([x, y, r]) => g.strokeCircle(x, y, r));
    g.fillStyle(0xffffff, 1);
    bolas.forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.generateTexture('humo', 240, 160);
    g.clear();
    g.fillStyle(0xffffff, 1).fillCircle(8, 8, 8);
    g.generateTexture('miga', 16, 16);
    g.destroy();
  }

  // Los pisos de la tarta de Cotine, con contorno grueso de dibujo animado.
  pisos() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const piso = (clave, relleno, adorno) => {
      g.clear();
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(0, 0, 160, 52, 16);
      g.fillStyle(relleno, 1).fillRoundedRect(5, 5, 150, 42, 13);
      adorno();
      g.generateTexture(clave, 160, 52);
    };
    piso('piso-bizcocho', 0xc98a4b, () => {
      g.fillStyle(0xa86a32, 1);
      [20, 52, 84, 116, 140].forEach(x => g.fillCircle(x, 30, 4));
    });
    piso('piso-nata', 0xfff6e8, () => {
      g.fillStyle(0xffffff, 1);
      for (let x = 16; x < 150; x += 26) g.fillCircle(x, 10, 11);
    });
    piso('piso-fresa', 0xff7eb0, () => {
      g.fillStyle(0xe8364f, 1);
      [24, 58, 92, 126].forEach(x => g.fillCircle(x, 26, 9));
      g.fillStyle(0x4cae4f, 1);
      [24, 58, 92, 126].forEach(x => g.fillTriangle(x - 6, 16, x + 6, 16, x, 22));
    });
    piso('piso-choco', 0x6b3b22, () => {
      g.fillStyle(0x4a2414, 1);
      for (let x = 14; x < 150; x += 22) g.fillRect(x, 8, 6, 34);
    });
    // La guinda.
    g.clear();
    g.lineStyle(5, 0x2f6b2a, 1).beginPath().moveTo(34, 26).lineTo(46, 4).strokePath();
    g.fillStyle(HEX.tinta, 1).fillCircle(30, 44, 24);
    g.fillStyle(0xe8233f, 1).fillCircle(30, 44, 19);
    g.fillStyle(0xffffff, 0.8).fillCircle(23, 37, 5);
    g.generateTexture('guinda', 64, 70);
    // El plato.
    g.clear();
    g.fillStyle(HEX.tinta, 1).fillEllipse(100, 20, 200, 38);
    g.fillStyle(0xffffff, 1).fillEllipse(100, 18, 188, 28);
    g.generateTexture('plato', 200, 40);
    g.destroy();
  }

  // Lo que hace falta para liar, dibujado con contorno grueso: papel, boquilla, bolsita y mechero.
  objetosLiar() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const tinta = HEX.tinta;
    g.fillStyle(tinta, 1).fillRoundedRect(0, 8, 96, 64, 8);
    g.fillStyle(0xfffdf6, 1).fillRoundedRect(5, 13, 86, 54, 6);
    g.fillStyle(0xe9e2d0, 1).fillRect(5, 54, 86, 7);
    g.lineStyle(2, 0xd8cfb8, 1).lineBetween(20, 26, 76, 26).lineBetween(20, 36, 76, 36);
    g.generateTexture('obj-papel', 96, 80);
    g.clear();
    g.fillStyle(tinta, 1).fillRoundedRect(0, 18, 90, 34, 14);
    g.fillStyle(0xe4c08a, 1).fillRoundedRect(5, 23, 80, 24, 10);
    g.lineStyle(3, 0xb98d55, 1);
    [22, 40, 58, 74].forEach(x => g.lineBetween(x, 25, x - 8, 45));
    g.generateTexture('obj-boquilla', 90, 70);
    g.clear();
    g.fillStyle(tinta, 1).fillRoundedRect(4, 6, 76, 84, 12);
    g.fillStyle(0xdff3ff, 0.95).fillRoundedRect(10, 12, 64, 72, 9);
    g.fillStyle(0x6fbf4a, 1);
    [[26, 60, 12], [46, 66, 13], [56, 52, 10], [34, 46, 9], [48, 40, 8]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.fillStyle(0xff5fa2, 1).fillRect(10, 18, 64, 8);
    g.generateTexture('obj-bolsita', 84, 96);
    g.clear();
    g.fillStyle(tinta, 1).fillRoundedRect(14, 30, 52, 70, 12);
    g.fillStyle(0xff5a4f, 1).fillRoundedRect(19, 35, 42, 60, 9);
    g.fillStyle(tinta, 1).fillRoundedRect(16, 6, 48, 30, 6);
    g.fillStyle(0xc9cfd6, 1).fillRoundedRect(20, 10, 40, 22, 4);
    g.fillStyle(0x8a929c, 1);
    [26, 34, 42, 50].forEach(x => g.fillCircle(x, 21, 3));
    g.generateTexture('obj-mechero', 80, 104);
    // Proyectiles del jefe: la pota (gota amarilla) y la estrella del destello.
    g.clear();
    g.fillStyle(tinta, 1).fillCircle(22, 24, 20);
    g.fillStyle(0xf5d23a, 1).fillCircle(22, 24, 15);
    g.fillStyle(0xfff6a8, 1).fillCircle(16, 18, 5);
    g.generateTexture('gota', 44, 46);
    // El porro ya liado, para cuando vuela de mano en mano.
    g.clear();
    g.fillStyle(tinta, 1).fillTriangle(2, 4, 2, 22, 58, 15).fillTriangle(2, 4, 58, 9, 58, 15);
    g.fillStyle(0xfffdf6, 1).fillTriangle(6, 8, 6, 19, 54, 14).fillTriangle(6, 8, 54, 11, 54, 14);
    g.fillStyle(0xe4c08a, 1).fillRect(46, 10, 10, 6);
    g.fillStyle(0xff7a2f, 1).fillCircle(5, 13, 6);
    g.generateTexture('porrito', 62, 26);
    g.destroy();
  }

  // Material de los minijuegos y de las situaciones, con contorno grueso.
  objetosMinis() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const t = HEX.tinta;
    const hacer = (clave, w, h, dibujar) => { g.clear(); dibujar(); g.generateTexture(clave, w, h); };
    hacer('obj-caja', 110, 96, () => {
      g.fillStyle(t, 1).fillRoundedRect(0, 10, 110, 86, 8);
      g.fillStyle(0xc98a4b, 1).fillRoundedRect(6, 16, 98, 74, 5);
      g.fillStyle(0xa86a32, 1).fillRect(6, 44, 98, 8);
      g.fillStyle(0xe4b47a, 1).fillRect(46, 16, 18, 74);
      g.fillStyle(t, 1).fillRoundedRect(4, 0, 102, 20, 6);
      g.fillStyle(0xd99a5b, 1).fillRoundedRect(9, 4, 92, 12, 4);
    });
    hacer('obj-disco', 100, 100, () => {
      g.fillStyle(t, 1).fillCircle(50, 50, 50);
      g.fillStyle(0x2a2238, 1).fillCircle(50, 50, 45);
      g.lineStyle(2, 0x4a3d63, 1);
      [38, 30, 22].forEach(r => g.strokeCircle(50, 50, r));
      g.fillStyle(0xff5fa2, 1).fillCircle(50, 50, 14);
      g.fillStyle(t, 1).fillCircle(50, 50, 4);
    });
    hacer('obj-fresa', 80, 90, () => {
      g.fillStyle(t, 1).fillTriangle(6, 28, 74, 28, 40, 88).fillCircle(22, 34, 18).fillCircle(58, 34, 18);
      g.fillStyle(0xe8364f, 1).fillTriangle(12, 32, 68, 32, 40, 80).fillCircle(24, 36, 13).fillCircle(56, 36, 13);
      g.fillStyle(0xffd6dc, 1);
      [[28, 46], [46, 44], [38, 58], [52, 58], [32, 66]].forEach(([x, y]) => g.fillCircle(x, y, 2.5));
      g.fillStyle(0x3f9a3a, 1).fillTriangle(20, 22, 40, 30, 32, 6).fillTriangle(60, 22, 40, 30, 48, 6).fillTriangle(30, 26, 50, 26, 40, 2);
    });
    hacer('obj-factura', 84, 104, () => {
      g.fillStyle(t, 1).fillRoundedRect(0, 0, 84, 104, 6);
      g.fillStyle(0xfffdf6, 1).fillRoundedRect(5, 5, 74, 94, 4);
      g.fillStyle(0xd8cfb8, 1);
      [24, 36, 48, 60].forEach(y => g.fillRect(14, y, 56, 4));
      g.fillStyle(0xe8233f, 1).fillRect(14, 12, 40, 6);
      g.lineStyle(4, 0xe8233f, 1).strokeCircle(56, 80, 12);
    });
    hacer('moneda', 64, 64, () => {
      g.fillStyle(t, 1).fillCircle(32, 32, 32);
      g.fillStyle(0xf5c542, 1).fillCircle(32, 32, 27);
      g.fillStyle(0xffe58a, 1).fillCircle(26, 26, 9);
      g.lineStyle(4, 0xc99a1e, 1).strokeCircle(32, 32, 18);
    });
    hacer('billete', 110, 62, () => {
      g.fillStyle(t, 1).fillRoundedRect(0, 0, 110, 62, 6);
      g.fillStyle(0x7ccf8a, 1).fillRoundedRect(5, 5, 100, 52, 4);
      g.fillStyle(0x4e9a5c, 1).fillCircle(55, 31, 15);
      g.fillStyle(0xa8e6b2, 1).fillRect(12, 12, 16, 38).fillRect(82, 12, 16, 38);
    });
    hacer('pipa', 34, 20, () => {
      g.fillStyle(t, 1).fillEllipse(17, 10, 34, 20);
      g.fillStyle(0x3b3b3b, 1).fillEllipse(17, 10, 28, 14);
      g.fillStyle(0xe8e2d0, 1).fillRect(7, 8, 20, 3);
    });
    hacer('papelera', 120, 150, () => {
      g.fillStyle(t, 1).fillRoundedRect(0, 10, 120, 140, 14);
      g.fillStyle(0x4cae4f, 1).fillRoundedRect(7, 16, 106, 128, 10);
      g.fillStyle(0x3d8d40, 1);
      [26, 50, 74, 98].forEach(x => g.fillRect(x - 3, 30, 6, 100));
      g.fillStyle(t, 1).fillRoundedRect(0, 0, 120, 26, 10);
      g.fillStyle(0x2a2238, 1).fillRoundedRect(8, 5, 104, 14, 6);
    });
    hacer('nota', 90, 90, () => {
      g.fillStyle(t, 1).fillCircle(45, 45, 44);
      g.fillStyle(0xffffff, 1).fillCircle(45, 45, 38);
      g.fillStyle(0xffffff, 0.9).fillCircle(32, 30, 9);
    });
    g.destroy();
  }

  // Decoración: dibujos provisionales (si hay arte de Gemini con el mismo nombre, se usa ese).
  decoracion() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const t = HEX.tinta;
    const hacer = (clave, w, h, dibujar) => { if (this.textures.exists(clave)) return; g.clear(); dibujar(); g.generateTexture(clave, w, h); };
    hacer('deco-bola', 120, 170, () => {
      g.lineStyle(4, 0xc9cfd6, 1).lineBetween(60, 0, 60, 50);
      g.fillStyle(t, 1).fillCircle(60, 110, 58);
      g.fillStyle(0xbfc6d4, 1).fillCircle(60, 110, 52);
      g.lineStyle(2, 0x8a93a6, 1);
      for (let k = -40; k <= 40; k += 16) { g.lineBetween(60 + k, 62, 60 + k, 158); g.lineBetween(10, 110 + k, 110, 110 + k); }
      g.fillStyle(0xffffff, 1).fillCircle(42, 92, 8).fillCircle(78, 128, 5);
    });
    hacer('deco-planta', 130, 170, () => {
      g.fillStyle(t, 1).fillRoundedRect(30, 110, 70, 60, 10);
      g.fillStyle(0xc56a3b, 1).fillRoundedRect(36, 116, 58, 50, 8);
      [[40, 70, 34], [80, 60, 36], [62, 34, 32], [96, 92, 26], [30, 96, 24]].forEach(([x, y, r]) => { g.fillStyle(t, 1).fillCircle(x, y, r + 5); });
      [[40, 70, 34], [80, 60, 36], [62, 34, 32], [96, 92, 26], [30, 96, 24]].forEach(([x, y, r]) => { g.fillStyle(0x4cae6f, 1).fillCircle(x, y, r); });
    });
    hacer('deco-poster', 130, 170, () => {
      g.fillStyle(t, 1).fillRect(0, 0, 130, 170);
      g.fillStyle(0xff5fa2, 1).fillRect(6, 6, 118, 158);
      g.fillStyle(0xffd23f, 1).fillTriangle(40, 40, 52, 76, 28, 76).fillTriangle(28, 54, 52, 54, 40, 90);
      g.fillStyle(0xffffff, 1).fillCircle(90, 64, 20);
      g.fillStyle(0xffffff, 1);
      [[90, 34], [118, 64], [90, 94], [62, 64]].forEach(([x, y]) => g.fillCircle(x, y, 9));
      g.fillStyle(t, 1).fillRect(20, 118, 90, 10).fillRect(30, 136, 70, 8);
    });
    hacer('deco-pinball', 120, 190, () => {
      g.fillStyle(t, 1).fillRoundedRect(0, 0, 120, 150, 12).fillRect(14, 150, 12, 40).fillRect(94, 150, 12, 40);
      g.fillStyle(0x7b3fbf, 1).fillRoundedRect(6, 6, 108, 138, 9);
      g.fillStyle(0x2a2238, 1).fillRoundedRect(16, 16, 88, 70, 6);
      [[36, 38, 0xffd23f], [70, 30, 0xff5fa2], [84, 60, 0x5ad1ff], [44, 66, 0x7ee081]].forEach(([x, y, c]) => g.fillStyle(c, 1).fillCircle(x, y, 8));
      g.fillStyle(0xffd23f, 1).fillRect(20, 100, 80, 12);
    });
    hacer('deco-pecera', 150, 150, () => {
      g.fillStyle(t, 1).fillRoundedRect(20, 120, 110, 26, 6);
      g.fillStyle(t, 1).fillCircle(75, 74, 66);
      g.fillStyle(0x9fe7ff, 0.85).fillCircle(75, 74, 60);
      g.fillStyle(0x5ad1ff, 0.6).fillRect(15, 80, 120, 52);
      g.fillStyle(t, 1).fillEllipse(78, 92, 54, 30).fillTriangle(100, 92, 120, 78, 120, 106);
      g.fillStyle(0xff9a3b, 1).fillEllipse(78, 92, 46, 24).fillTriangle(102, 92, 116, 82, 116, 102);
      g.fillStyle(0xffffff, 1).fillCircle(66, 88, 6);
      g.fillStyle(0xe8233f, 1).fillCircle(66, 88, 3);
      g.fillStyle(0xffffff, 0.8).fillCircle(48, 50, 6).fillCircle(56, 34, 4);
    });
    hacer('deco-alfombra', 420, 90, () => {
      g.fillStyle(t, 1).fillEllipse(210, 45, 420, 90);
      g.fillStyle(0x2a2238, 1).fillEllipse(210, 45, 404, 76);
      g.lineStyle(6, 0xff5fa2, 1).strokeEllipse(210, 45, 360, 58);
      g.lineStyle(4, 0x5ad1ff, 1).strokeEllipse(210, 45, 280, 38);
    });
    hacer('deco-lava', 80, 180, () => {
      g.fillStyle(t, 1).fillRoundedRect(10, 140, 60, 40, 8).fillTriangle(20, 30, 60, 30, 70, 144).fillTriangle(20, 30, 10, 144, 70, 144);
      g.fillStyle(0x7b3fbf, 1).fillTriangle(24, 36, 56, 36, 64, 140).fillTriangle(24, 36, 16, 140, 64, 140);
      g.fillStyle(0xff9a3b, 1).fillCircle(36, 70, 9).fillCircle(46, 104, 13).fillCircle(34, 126, 8);
      g.fillStyle(0xc0c6cf, 1).fillRoundedRect(14, 144, 52, 32, 6).fillRoundedRect(24, 16, 32, 18, 6);
    });
    hacer('deco-trono', 160, 190, () => {
      g.fillStyle(t, 1).fillRoundedRect(10, 0, 140, 190, 16);
      g.fillStyle(0xf5c542, 1).fillRoundedRect(18, 8, 124, 174, 12);
      g.fillStyle(0xd99b1e, 1).fillRoundedRect(30, 90, 100, 40, 8);
      g.fillStyle(0xe8233f, 1).fillCircle(80, 40, 16);
      g.fillStyle(0xffffff, 1).fillTriangle(40, 18, 56, 18, 48, 0).fillTriangle(72, 18, 88, 18, 80, 0).fillTriangle(104, 18, 120, 18, 112, 0);
    });
    hacer('deco-gramola', 140, 200, () => {
      g.fillStyle(t, 1).fillRoundedRect(0, 30, 140, 170, 14).fillCircle(70, 50, 70);
      g.fillStyle(0xb5521f, 1).fillRoundedRect(6, 36, 128, 158, 10).fillCircle(70, 50, 64);
      [0xff5fa2, 0xffd23f, 0x7ee081, 0x5ad1ff].forEach((c, i) => g.lineStyle(6, c, 1).beginPath().arc(70, 60, 50 - i * 10, Math.PI, 0).strokePath());
      g.fillStyle(0x2a2238, 1).fillRoundedRect(24, 110, 92, 50, 6);
    });
    g.destroy();
  }

  // Niebla suave (sin contorno) para el humo sobre fondos de foto del mundo normal.
  niebla() {
    const lienzo = this.textures.createCanvas('niebla', 256, 256);
    const ctx = lienzo.getContext();
    const gr = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,0.85)');
    gr.addColorStop(0.5, 'rgba(240,236,248,0.45)');
    gr.addColorStop(1, 'rgba(240,236,248,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 256, 256);
    lienzo.refresh();
  }

  // Viñeta roja para cuando la pantalla palpita (hambre o vida baja).
  vineta() {
    const lienzo = this.textures.createCanvas('vineta', ANCHO, ALTO);
    const ctx = lienzo.getContext();
    const gr = ctx.createRadialGradient(ANCHO / 2, ALTO / 2, ALTO * 0.3, ANCHO / 2, ALTO / 2, ANCHO * 0.62);
    gr.addColorStop(0, 'rgba(255,40,80,0)');
    gr.addColorStop(1, 'rgba(255,40,80,0.85)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    lienzo.refresh();
  }
}

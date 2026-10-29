// Las apuestas del barrio: se juega con los monchis de verdad, así que se puede subir rápido… o
// quedarse a cero. Dos juegos:
//   - La tragaperras de Palicaso (en la tienda de 24 h): tres rodillos con las caras del grupo.
//     Tres iguales multiplican; dos iguales, x2; un Monchiman suelto te devuelve la apuesta; Puky se la come.
//     Devuelve de media un 90 % (la casa siempre gana un poco).
//   - La carrera de humo (en la plaza): cinco corredores con su cuota; si gana el tuyo, cobras apuesta × cuota.
//     El ganador se sortea con las probabilidades de las cuotas y la carrera se anima para llegar a él.

const FICHAS = [10, 25, 50, 100, 250];

const RODILLO = [
  { id: 'vuper', sprite: 'vuper', peso: 20, tres: 5 },
  { id: 'palicaso', sprite: 'palicaso', peso: 18, tres: 6 },
  { id: 'blancaso', sprite: 'blancaso', peso: 16, tres: 8 },
  { id: 'perico', sprite: 'perico', peso: 14, tres: 10 },
  { id: 'cotine', sprite: 'cotine', peso: 11, tres: 15 },
  { id: 'pompa', sprite: 'pompa', peso: 8, tres: 30 },
  { id: 'monchiman', sprite: 'monchiman', peso: 5, tres: 100 },
  { id: 'puky', sprite: 'puky', peso: 8, tres: 0 },
];

const CORREDORES = [
  { id: 'vuper', nombre: 'Vuper', sprite: 'vuper-colocado', truco: 'se para a mirar el cielo' },
  { id: 'palicaso', nombre: 'Palicaso', sprite: 'palicaso-contando', truco: 'se para a contar algo' },
  { id: 'lasslow', nombre: 'Lasslow', sprite: 'lasslow-pedo', truco: '¡turbo de pedo!' },
  { id: 'pompa', nombre: 'La Pompa', sprite: 'pompa', truco: 'se la lleva el viento' },
  { id: 'puky', nombre: 'Puky', sprite: 'puky-riendo', truco: 'resbala en su charco' },
  { id: 'cotine', nombre: 'Cotine', sprite: 'cotine', truco: 'se para a por una miga' },
];

const FRASES_TRAGAPERRAS = {
  entrar: ['¡Escucha! Esta máquina la puse yo. Paga. A veces.', 'Una tirada y lo dejas. Eso dicen todos.', 'Los monchis no se multiplican solos… o sí.'],
  gana: ['¡LO SABÍA! ¡Esta máquina te quiere!', '¡Ole! Invita a algo, ¿no?', '¡Escucha cómo suena eso!'],
  gordo: ['¡¡MONCHIMAN!! ¡¡EL GORDO!! ¡Cierra la tienda!', '¡Llamad a todo el barrio! ¡HA SALIDO EL GORDO!'],
  pierde: ['Casi. Casi es lo más bonito que hay.', 'La próxima sale. Te lo juro por la aso.', 'Bueno, para la máquina, que también tiene que comer.'],
  puky: ['Puky se lo ha comido. Todo. Hasta la palanca.', 'Ha salido Puky… mejor no preguntes dónde están tus monchis.'],
  pobre: ['Sin monchis no hay tirada. Vuelve cuando seas rico.', 'Aquí se juega con monchis, no con promesas.'],
};

function pesoAlAzar(lista) {
  let r = Math.random() * lista.reduce((a, x) => a + x.peso, 0);
  for (const x of lista) { r -= x.peso; if (r < 0) return x; }
  return lista[lista.length - 1];
}

function pagoTragaperras(ids) {
  const [a, b, c] = ids;
  if (a === b && b === c) return { mult: RODILLO.find(x => x.id === a).tres, tipo: a === 'puky' ? 'puky' : a === 'monchiman' ? 'gordo' : 'tres' };
  if (ids.includes('puky')) return { mult: 0, tipo: 'puky' };
  if (a === b || b === c || a === c) return { mult: 2, tipo: 'dos' };
  if (ids.includes('monchiman')) return { mult: 1, tipo: 'salva' };
  return { mult: 0, tipo: 'nada' };
}

// Texturas por código para las dos cosas del barrio.
function texturasApuestas(scene) {
  if (!scene.textures.exists('tragaperras')) {
    const g = scene.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(8, 14, 184, 300, 26);
    g.fillStyle(0xd23a6a, 1).fillRoundedRect(0, 6, 184, 300, 26);
    g.lineStyle(7, HEX.tinta, 1).strokeRoundedRect(0, 6, 184, 300, 26);
    g.fillStyle(HEX.amarillo, 1).fillRoundedRect(18, 20, 148, 44, 14).strokeRoundedRect(18, 20, 148, 44, 14);
    [32, 77, 122].forEach(x => { g.fillStyle(0xffffff, 1).fillRoundedRect(x, 86, 36, 66, 8); g.strokeRoundedRect(x, 86, 36, 66, 8); });
    g.fillStyle(HEX.rojo, 1).fillCircle(50, 119, 9).fillCircle(95, 119, 9).fillCircle(140, 119, 9);
    g.fillStyle(0x5b2a86, 1).fillRoundedRect(22, 176, 140, 100, 14).strokeRoundedRect(22, 176, 140, 100, 14);
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(62, 250, 60, 12, 6);
    g.lineStyle(7, HEX.tinta, 1).lineBetween(184, 140, 200, 140).lineBetween(200, 140, 200, 60);
    g.fillStyle(HEX.rojo, 1).fillCircle(200, 52, 14).strokeCircle(200, 52, 14);
    g.generateTexture('tragaperras', 218, 320);
    g.destroy();
  }
  if (!scene.textures.exists('pizarra-carrera')) {
    const g = scene.add.graphics();
    g.lineStyle(10, HEX.tinta, 1).lineBetween(40, 150, 30, 250).lineBetween(160, 150, 170, 250);
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(8, 12, 190, 150, 18);
    g.fillStyle(0x2f6b3f, 1).fillRoundedRect(0, 4, 190, 150, 18);
    g.lineStyle(7, HEX.tinta, 1).strokeRoundedRect(0, 4, 190, 150, 18);
    g.lineStyle(4, 0xfff6e8, 0.9);
    [44, 76, 108].forEach(y => g.lineBetween(26, y, 150, y));
    g.fillStyle(0xfff6e8, 1);
    for (let i = 0; i < 4; i++) { g.fillRect(156 + (i % 2) * 8, 34 + i * 18, 8, 9); g.fillRect(164 - (i % 2) * 8, 43 + i * 18, 8, 9); }
    g.generateTexture('pizarra-carrera', 204, 256);
    g.destroy();
  }
}

// Fila de fichas para elegir la apuesta. Devuelve un objeto con valor() y refrescar().
function selectorApuesta(scene, y, inicial = 25) {
  const sel = { valor: Math.min(inicial, Math.max(FICHAS[0], ESTADO.monchis)), botones: [] };
  const etiqueta = texto(scene, ANCHO / 2, y - 58, '', 26, COLOR.crema).setDepth(60);
  FICHAS.forEach((v, i) => {
    const x = ANCHO / 2 + (i - (FICHAS.length - 1) / 2) * 112;
    const b = boton(scene, x, y, `${v}`, () => { if (ESTADO.monchis >= v) { sel.valor = v; sel.refrescar(); sfx(scene, 'pop', { volume: 0.4 }); if (scene.alCambiarApuesta) scene.alCambiarApuesta(); } }, { ancho: 96, alto: 60, tam: 26, color: HEX.crema }).setDepth(60);
    b.v = v;
    sel.botones.push(b);
  });
  sel.refrescar = () => {
    if (sel.valor > ESTADO.monchis) sel.valor = [...FICHAS].reverse().find(v => v <= ESTADO.monchis) || FICHAS[0];
    etiqueta.setText(`Apuestas ${sel.valor} · tienes ${ESTADO.monchis} monchis`);
    sel.botones.forEach(b => {
      b.setAlpha(ESTADO.monchis >= b.v ? 1 : 0.35);
      b.list[0].clear();
      const color = b.v === sel.valor ? HEX.amarillo : HEX.crema;
      b.list[0].fillStyle(HEX.tinta, 1).fillRoundedRect(-48 + 4, -30 + 8, 96, 60, 22);
      b.list[0].fillStyle(color, 1).fillRoundedRect(-48, -30, 96, 60, 22);
      b.list[0].lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-48, -30, 96, 60, 22);
    });
  };
  sel.activo = on => sel.botones.forEach(b => b.setVisible(on));
  sel.refrescar();
  return sel;
}

function lluviaDeMonchis(scene, n, x = ANCHO / 2, y = ALTO / 2) {
  for (let i = 0; i < Math.min(40, n); i++) {
    const m = scene.add.image(x, y, Phaser.Utils.Array.GetRandom(['patatas', 'caramelo', 'lata'])).setDepth(90);
    m.setScale(46 / m.height);
    scene.tweens.add({
      targets: m, x: x + Phaser.Math.Between(-520, 520), y: ALTO + 80, angle: Phaser.Math.Between(-540, 540),
      duration: Phaser.Math.Between(900, 1700), delay: i * 30, ease: 'Quad.in', onComplete: () => m.destroy(),
    });
  }
}

function avisoApuesta(scene, str, color = COLOR.amarillo) {
  const t = texto(scene, ANCHO / 2, 300, str, 54, color, 1000).setDepth(95).setScale(0);
  scene.tweens.chain({ targets: t, tweens: [{ scale: 1, duration: 260, ease: 'Back.out' }, { y: 270, duration: 1300 }, { alpha: 0, duration: 300 }], onComplete: () => t.destroy() });
}

function apuntarApuesta(apostado, cobrado) {
  ESTADO.monchis += cobrado;
  sumarStat('apuestas');
  sumarStat('apostado', apostado);
  if (cobrado > apostado) { sumarStat('apuestasGanadas'); sumarStat('monchisGanados', cobrado - apostado); }
  if (cobrado === 0) sumarStat('apuestasPerdidas');
  guardarPartida();
}

// ---------- La tragaperras de Palicaso ----------

class Tragaperras extends Phaser.Scene {
  constructor() { super('Tragaperras'); }

  create(datos) {
    texturasApuestas(this);
    this.girando = false;
    fondo(this, enMundoHumo() ? 'bg-tienda' : 'bgn-tienda');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.55);
    texto(this, ANCHO / 2, 46, 'La tragaperras de Palicaso', 46, COLOR.amarillo);

    // La máquina, grande.
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(ANCHO / 2 - 330 + 10, 108, 660, 330, 40);
    g.fillStyle(0xd23a6a, 1).fillRoundedRect(ANCHO / 2 - 330, 98, 660, 330, 40);
    g.lineStyle(9, HEX.tinta, 1).strokeRoundedRect(ANCHO / 2 - 330, 98, 660, 330, 40);
    this.luces = [];
    for (let i = 0; i < 16; i++) {
      const x = ANCHO / 2 - 300 + i * 40;
      [116, 410].forEach(y => this.luces.push(this.add.circle(x, y, 7, i % 2 ? HEX.amarillo : 0xffffff).setStrokeStyle(3, HEX.tinta)));
    }
    this.tweens.add({ targets: this.luces, alpha: 0.35, duration: 380, yoyo: true, repeat: -1, delay: this.tweens.stagger(40) });
    this.rodillos = [-1, 0, 1].map(i => {
      const x = ANCHO / 2 + i * 190;
      const caja = this.add.graphics();
      caja.fillStyle(0xffffff, 1).fillRoundedRect(x - 82, 150, 164, 220, 20);
      caja.lineStyle(7, HEX.tinta, 1).strokeRoundedRect(x - 82, 150, 164, 220, 20);
      const img = this.add.image(x, 260, 'vuper');
      this.ponerSimbolo(img, pesoAlAzar(RODILLO));
      return img;
    });
    // Palanca: tirar también se hace con ella.
    this.palanca = this.add.container(ANCHO / 2 + 370, 260);
    const pg = this.add.graphics();
    pg.lineStyle(12, HEX.tinta, 1).lineBetween(0, 0, 0, -120);
    pg.lineStyle(6, 0xcfc6dc, 1).lineBetween(0, 0, 0, -120);
    this.palanca.add([pg, this.add.circle(0, -128, 24, HEX.rojo).setStrokeStyle(6, HEX.tinta)]);
    this.palanca.setSize(80, 200).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.tirar());

    this.palicaso = this.add.image(150, ALTO - 20, 'palicaso-riendo').setOrigin(0.5, 1);
    this.palicaso.setScale(250 / this.palicaso.height);
    flotar(this, this.palicaso, { amplitud: 5 });

    this.tabla = texto(this, ANCHO - 170, 520, 'Tres iguales: x5 a x30\nTres Monchiman: x100\nDos iguales: x2\nUn Monchiman: recuperas\nPuky: se lo come', 18, COLOR.crema).setDepth(60);
    this.sel = selectorApuesta(this, 520, 25);
    this.botonTirar = boton(this, ANCHO / 2 - 130, 640, '¡Tirar! (Espacio)', () => this.tirar(), { ancho: 300, alto: 70, tam: 26 }).setDepth(60);
    boton(this, ANCHO / 2 + 200, 640, 'Volver (Esc)', () => irA(this, 'Barrio'), { ancho: 230, alto: 70, tam: 24, color: HEX.azul }).setDepth(60);
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.tirar(); });
    this.input.keyboard.on('keydown-ENTER', e => { if (!e.repeat) this.tirar(); });
    this.input.keyboard.once('keydown-ESC', () => irA(this, 'Barrio'));

    entrar(this, datos);
    this.decir(Phaser.Utils.Array.GetRandom(FRASES_TRAGAPERRAS.entrar));
  }

  ponerSimbolo(img, s) {
    img.setTexture(s.sprite);
    img.setScale(Math.min(180 / img.height, 140 / img.width));
    img.simbolo = s;
  }

  decir(str) {
    if (this.burbuja) this.burbuja.destroy();
    this.burbuja = bocadillo(this, 250, 440, str, { tam: 20, ancho: 280, cola: 'izq' }).setDepth(70);
    const b = this.burbuja;
    this.time.delayedCall(2600, () => { if (b.active) b.destroy(); });
  }

  tirar() {
    if (this.girando || this._saliendo) return;
    const apuesta = this.sel.valor;
    if (ESTADO.monchis < apuesta || ESTADO.monchis < FICHAS[0]) return this.decir(Phaser.Utils.Array.GetRandom(FRASES_TRAGAPERRAS.pobre));
    this.girando = true;
    ESTADO.monchis -= apuesta;
    this.sel.refrescar();
    this.sel.activo(false);
    this.tweens.add({ targets: this.palanca, angle: 35, duration: 140, yoyo: true, ease: 'Sine.inOut' });
    sfx(this, 'pop', { volume: 0.5 });
    const final = this.rodillos.map(() => pesoAlAzar(RODILLO));
    // Si ya hay dos iguales, el tercero se hace esperar (y tiembla).
    const suspense = final[0].id === final[1].id;
    this.rodillos.forEach((img, i) => {
      const ev = this.time.addEvent({ delay: 70, loop: true, callback: () => { this.ponerSimbolo(img, pesoAlAzar(RODILLO)); img.y = 245; this.tweens.add({ targets: img, y: 260, duration: 60 }); } });
      const para = 800 + i * 450 + (i === 2 && suspense ? 900 : 0);
      if (i === 2 && suspense) this.time.delayedCall(1250, () => this.tweens.add({ targets: img, x: img.x + 6, duration: 50, yoyo: true, repeat: 8 }));
      this.time.delayedCall(para, () => {
        ev.remove();
        this.ponerSimbolo(img, final[i]);
        const sx = img.scaleX;
        img.setScale(sx * 1.25, sx * 0.8);
        this.tweens.add({ targets: img, scaleX: sx, scaleY: sx, duration: 260, ease: 'Back.out' });
        sfx(this, 'rimshot', { volume: 0.25 });
        if (i === 2) this.resultado(final.map(s => s.id), apuesta);
      });
    });
  }

  resultado(ids, apuesta) {
    const { mult, tipo } = pagoTragaperras(ids);
    const cobro = Math.round(apuesta * mult);
    apuntarApuesta(apuesta, cobro);
    if (tipo === 'gordo') sumarStat('premioGordo');
    if (tipo === 'tres' || tipo === 'gordo') sumarStat('tresIguales');
    if (cobro > apuesta) {
      this.palicaso.setTexture('palicaso-riendo');
      avisoApuesta(this, tipo === 'gordo' ? `¡¡EL GORDO!! +${cobro}` : `+${cobro} monchis`);
      lluviaDeMonchis(this, tipo === 'gordo' ? 40 : Math.max(6, mult * 3), ANCHO / 2, 260);
      sfx(this, tipo === 'tres' || tipo === 'gordo' ? 'platillo' : 'pop', { volume: 0.5 });
      this.cameras.main.shake(tipo === 'gordo' ? 700 : 200, tipo === 'gordo' ? 0.012 : 0.004);
      this.decir(Phaser.Utils.Array.GetRandom(tipo === 'gordo' ? FRASES_TRAGAPERRAS.gordo : FRASES_TRAGAPERRAS.gana));
    } else if (cobro === apuesta) {
      avisoApuesta(this, 'Monchiman te salva: recuperas', COLOR.azul);
      this.decir('Monchiman no deja a nadie tirado. Ni en la máquina.');
    } else if (tipo === 'puky') {
      this.palicaso.setTexture('palicaso-contando');
      avisoApuesta(this, `Puky se come ${apuesta}`, COLOR.rosa);
      this.cameras.main.flash(250, 220, 200, 40);
      sfx(this, 'blurp', { volume: 0.5 });
      this.decir(Phaser.Utils.Array.GetRandom(FRASES_TRAGAPERRAS.puky));
    } else {
      this.palicaso.setTexture('palicaso-contando');
      avisoApuesta(this, `−${apuesta}`, COLOR.rosa);
      this.decir(Phaser.Utils.Array.GetRandom(FRASES_TRAGAPERRAS.pierde));
    }
    this.time.delayedCall(900, () => { this.girando = false; this.sel.activo(true); this.sel.refrescar(); });
  }
}

// ---------- La carrera de humo ----------

class Carrera extends Phaser.Scene {
  constructor() { super('Carrera'); }

  create(datos) {
    texturasApuestas(this);
    this.fase = 'elegir';
    fondo(this, enMundoHumo() ? 'bg-plaza' : 'bgn-plaza');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.45);
    texto(this, ANCHO / 2, 40, 'La carrera de humo', 46, COLOR.amarillo);
    this.ayuda = texto(this, ANCHO / 2, 88, 'Elige corredor y apuesta. Si gana el tuyo, cobras apuesta × cuota.', 22, COLOR.crema, 1100);

    // Cinco corredores al azar, cada uno con su fuerza de hoy y su cuota.
    const elegidos = Phaser.Utils.Array.Shuffle([...CORREDORES]).slice(0, 5);
    const fuerzas = elegidos.map(() => Phaser.Math.FloatBetween(0.6, 3));
    const total = fuerzas.reduce((a, b) => a + b, 0);
    this.carriles = elegidos.map((c, i) => {
      const p = fuerzas[i] / total;
      const cuota = Math.max(1.3, Math.round((0.9 / p) * 10) / 10);
      const y = 170 + i * 86;
      const pista = this.add.graphics();
      pista.fillStyle(i % 2 ? 0x3a2a52 : 0x47335f, 0.85).fillRoundedRect(150, y - 36, 1060, 72, 16);
      pista.lineStyle(4, HEX.tinta, 1).strokeRoundedRect(150, y - 36, 1060, 72, 16);
      const img = this.add.image(220, y + 30, c.sprite).setOrigin(0.5, 1).setDepth(10 + i);
      img.setScale(Math.min(78 / img.height, 90 / img.width));
      img.escala = img.scaleX;
      const nombreT = texto(this, 75, y - 12, c.nombre, 20, COLOR.crema).setDepth(20);
      const cuotaT = texto(this, 75, y + 16, `x${cuota.toFixed(1)}`, 24, COLOR.amarillo).setDepth(20);
      const zona = this.add.zone(ANCHO / 2, y, ANCHO, 80).setInteractive({ useHandCursor: true });
      const carril = { ...c, p, cuota, y, img, nombreT, cuotaT, pista };
      zona.on('pointerdown', () => this.elegir(carril));
      return carril;
    });
    this.add.rectangle(1150, 170 + 2 * 86, 10, 5 * 86, 0xffffff).setStrokeStyle(3, HEX.tinta);
    this.marco = this.add.graphics().setDepth(5);

    this.sel = selectorApuesta(this, 650 - 4, 25);
    this.sel.botones.forEach((b, i) => b.setPosition(ANCHO / 2 - 330 + i * 104, 650));
    this.botonSalida = boton(this, ANCHO / 2 + 330, 650, '¡Salida!', () => this.salida(), { ancho: 200, alto: 64, tam: 26 }).setDepth(60);
    boton(this, ANCHO - 90, 40, 'Volver', () => irA(this, 'Barrio'), { ancho: 140, alto: 52, tam: 20, color: HEX.azul }).setDepth(60);
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.salida(); });
    this.input.keyboard.on('keydown-ENTER', e => { if (!e.repeat) this.salida(); });
    this.input.keyboard.on('keydown', e => { const n = Number(e.key); if (n >= 1 && n <= 5) this.elegir(this.carriles[n - 1]); });
    this.input.keyboard.once('keydown-ESC', () => irA(this, 'Barrio'));
    this.alCambiarApuesta = () => this.elegir(this.mio);
    this.elegir(this.carriles[0]);
    entrar(this, datos);
  }

  elegir(c) {
    if (this.fase !== 'elegir') return;
    this.mio = c;
    this.marco.clear().lineStyle(6, HEX.amarillo, 1).strokeRoundedRect(144, c.y - 42, 1072, 84, 20);
    this.carriles.forEach(k => k.nombreT.setColor(k === c ? COLOR.amarillo : COLOR.crema));
    this.ayuda.setText(`Vas con ${c.nombre} (x${c.cuota.toFixed(1)}). Si gana: +${Math.round(this.sel.valor * c.cuota)} monchis.`);
  }

  salida() {
    if (this.fase === 'fin') return this.reiniciar();
    if (this.fase !== 'elegir') return;
    const apuesta = this.sel.valor;
    if (ESTADO.monchis < apuesta || ESTADO.monchis < FICHAS[0]) { this.ayuda.setText('Sin monchis no hay carrera. Gánalos en las misiones.').setColor(COLOR.rosa); return; }
    this.fase = 'corriendo';
    this.apuesta = apuesta;
    ESTADO.monchis -= apuesta;
    this.sel.refrescar();
    this.sel.activo(false);
    this.botonSalida.setVisible(false);
    // El ganador se sortea con las probabilidades de las cuotas; la carrera se anima para llegar a él.
    let r = Math.random();
    this.ganador = this.carriles.find(c => (r -= c.p) < 0) || this.carriles[0];
    const base = 6200;
    this.carriles.forEach(c => {
      c.dura = c === this.ganador ? base : base + Phaser.Math.Between(250, 1600);
      // Curva de avance con tirones y frenazos: puntos de control crecientes, normalizados a 1.
      const pasos = [0];
      for (let k = 0; k < 8; k++) pasos.push(pasos[k] + Phaser.Math.FloatBetween(0.2, 1.8));
      c.curva = pasos.map(v => v / pasos[8]);
      c.momento = Phaser.Math.Between(1, 6);
    });
    this.t0 = this.time.now;
    let cuenta = 3;
    const t = texto(this, ANCHO / 2, ALTO / 2, '3', 120, COLOR.amarillo).setDepth(100);
    this.t0 = this.time.now + 3000;
    this.time.addEvent({ delay: 1000, repeat: 2, callback: () => {
      cuenta--;
      t.setText(cuenta ? `${cuenta}` : '¡YA!').setScale(1.4);
      this.tweens.add({ targets: t, scale: 1, duration: 300 });
      sfx(this, 'pop', { volume: 0.5 });
      if (!cuenta) this.time.delayedCall(600, () => t.destroy());
    } });
  }

  update() {
    if (this.fase !== 'corriendo' || this.time.now < this.t0) return;
    const ahora = this.time.now - this.t0;
    let todos = true;
    this.carriles.forEach(c => {
      const f = Math.min(1, ahora / c.dura);
      if (f < 1) todos = false;
      const tramo = Math.min(7.999, f * 8);
      const k = Math.floor(tramo);
      const prog = c.curva[k] + (c.curva[k + 1] - c.curva[k]) * (tramo - k);
      c.img.x = 220 + prog * 930;
      c.img.y = c.y + 30 - Math.abs(Math.sin(ahora / 110 + c.y)) * 8;
      c.img.setAngle(Math.sin(ahora / 90 + c.y) * 6);
      if (k === c.momento && !c.avisado) {
        c.avisado = true;
        const tx = texto(this, c.img.x, c.y - 44, c.truco, 18, COLOR.rosa).setDepth(40);
        this.tweens.add({ targets: tx, y: tx.y - 30, alpha: 0, duration: 1400, onComplete: () => tx.destroy() });
      }
      if (f >= 1 && !c.llego) { c.llego = true; if (c === this.ganador) this.meta(); }
    });
    if (todos) this.fase = 'acabando';
  }

  meta() {
    const gana = this.ganador === this.mio;
    const cobro = gana ? Math.round(this.apuesta * this.mio.cuota) : 0;
    apuntarApuesta(this.apuesta, cobro);
    sumarStat('carreras');
    if (gana) sumarStat('carrerasGanadas');
    if (gana && this.mio.cuota >= 5) sumarStat('batacazo');
    const c = this.ganador;
    const sx = c.img.scaleX;
    this.tweens.add({ targets: c.img, scaleX: sx * 1.3, scaleY: sx * 1.3, duration: 200, yoyo: true, repeat: 2 });
    if (gana) {
      avisoApuesta(this, `¡Gana ${c.nombre}! +${cobro}`);
      lluviaDeMonchis(this, Math.min(40, Math.round(this.mio.cuota * 6)), c.img.x, c.y);
      sfx(this, 'platillo', { volume: 0.5 });
    } else {
      avisoApuesta(this, `Gana ${c.nombre}. Tu ${this.mio.nombre}, ni olerlo.`, COLOR.rosa);
      sfx(this, 'rimshot', { volume: 0.4 });
    }
    this.time.delayedCall(1800, () => {
      this.fase = 'fin';
      this.botonSalida.setVisible(true).etiqueta.setText('Otra carrera');
    });
  }

  reiniciar() {
    if (this._saliendo) return;
    this.scene.restart({});
  }
}

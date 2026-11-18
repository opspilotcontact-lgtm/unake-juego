// La tormenta: la madre de Vuper te pilla fumado (ampliacion-propuesta.md, punto 15).
// En el mundo humo cada cosa es su sensación, y esta es el miedo a que te pille tu madre: una nube de
// tormenta enorme, sin cuerpo humano, con rulos y cejas de rayo, que te persigue por arriba mientras
// huyes por el barrio de noche (scroll lateral, estilo «run and gun» pero sin disparar).
// Tú: moverte, saltar, agacharte, esprintar (con aguante) y esconderte un segundo tras las cosas del barrio.
// Ella: rayos que caen donde señala su dedo de nube, granizo de zapatillas, ráfagas con frases de bronca
// que te empujan hacia ella, charcos y la llamada perdida que te frena. Todo con telégrafo claro.
// Tres vidas: al perder una, ella te alcanza con una frase y sigues. Tres tramos sorteados entre cinco, cada
// uno más duro, y el remate: tu cuarto, la puerta, el efecto que pasa y tu madre de día con un táper.
// Animaciones no invasivas: los rayos iluminan un instante (no ciegan) y no hay temblores de cámara.

if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Tormenta = 'barrido';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.Tormenta = ['n-madre-enfadada', UNAKE.rosa];
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Tormenta = 'jefe';

const TM = {
  suelo: 640,          // línea del suelo (donde pisas)
  base: 380,           // velocidad del barrio (px/s)
  tramoLen: 5800,      // px por tramo (≈ 15 s a paso normal; antes 7300: el bot bueno moría al 89 % del camino)
  vidas: 3,
  xIni: 430, xMin: 255, xMax: 800,
  gravedad: 2800, salto: 930,
  altoV: 118,          // altura de Vuper de pie
  tapar: 1.35,         // segundos que te tapa cada escondite
};

const TRAMOS_TM = [
  { id: 'plaza', bg: 'bg-plaza', nombre: 'La plaza', refugio: 'contenedor' },
  { id: 'parque', bg: 'bg-parque', nombre: 'El parque', refugio: 'arbusto' },
  { id: 'feria', bg: 'bg-feria', nombre: 'La feria', refugio: 'caseta' },
  { id: 'calle', bg: 'bg-fuera', nombre: 'La calle de Unaké', refugio: 'marquesina' },
  { id: 'tienda', bg: 'bg-tienda', nombre: 'La tienda de 24 h', refugio: 'carrito' },
];

// Ataques disponibles en cada tramo (cada vez más y más fuertes).
const ATAQUES_TM = [
  ['rayo', 'zapas', 'viento', 'charco'],
  ['rayo', 'zapas', 'viento', 'charco', 'llamada', 'rayos'],
  ['rayo', 'zapas', 'viento', 'llamada', 'rayos', 'zapas2', 'charco'],
];

const FRASES_VIENTO = [
  '¿Y esa M de la pared?', '¡A tu edad!', '¡Con lo que yo he hecho por ti!', '¿Estas son horas de llegar?',
  '¡Que te vas a quedar así!', '¡Ni una llamada, ni un mensaje!', '¡Yo a tu edad ya trabajaba!', 'Dime que comes. Dime que comes.',
];
const FRASES_ALCANCE = ['¡Te pillé!', '¡Mírame cuando te hablo!', '¡Esos ojos, Vuper!', '¿Tú qué te crees que es esto?', '¡A casa. Ya.!'];
const FRASES_ZAPAS = ['¡Las zapatillas!', '¡Ya verás!', '¡Y recoge las zapatillas!'];
const FRASES_VUPER = ['Vale, vale…', '(Mamá, no.)', '(Que no huela a nada…)', '(Corre, corre.)', '(Más rápido.)', '(Casi.)'];
const MADRE_CENA = ['¿Has cenado?', '¿Has cenado? Te he traído un táper.', 'Un táper. ¿Has cenado?'];
const MADRE_CHISTE = ['¿Y esa M de la pared?', 'Aquí huele a tormenta, hijo.', 'Qué cara traes. Siéntate y come.'];

// Barajas con memoria entre partidas: nada se repite hasta agotar la lista.
const BOLSAS_TM = {};
function sacarTM(clave, lista) {
  if (!BOLSAS_TM[clave] || !BOLSAS_TM[clave].length) {
    const nueva = Phaser.Utils.Array.Shuffle([...lista]);
    if (nueva.length > 1 && BOLSAS_TM[clave + '_ult'] === nueva[nueva.length - 1]) nueva.unshift(nueva.pop());
    BOLSAS_TM[clave] = nueva;
  }
  const v = BOLSAS_TM[clave].pop();
  BOLSAS_TM[clave + '_ult'] = v;
  return v;
}

class Tormenta extends Phaser.Scene {
  constructor() { super('Tormenta'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la escena al volver a jugar.
    this.activo = false;
    this.t = 0;
    this.vidas = TM.vidas;
    this.golpes = 0;
    this.esquivadas = 0;
    this.px = TM.xIni;
    this.py = 0;
    this.vy = 0;
    this.agachado = false;
    this.escondido = false;
    this.sprint = false;
    this.cansado = false;
    this.aguante = 100;
    this.regenT = 0;
    this.invul = 0;
    this.frenado = 0;
    this.charcoT = 0;
    this.pared = 0;
    this.saltoBuf = 0;
    this.suelitoT = 0;
    this.tramoIdx = 0;
    this.tramoProg = 0;
    this.dist = 0;
    this.bgOff = 0;
    this.ocupada = false;
    this.pausaAtaque = 2.6;
    this.dedo = null;
    this.viento = null;
    this.llamada = null;
    this.movilIcono = null;
    this.vozActual = null;
    this.avisoRefugio = false;
    this.obst = [];
    this.refugios = [];
    this.charcos = [];
    this.efimeros = [];
    this.rafagas = [];
    this.gapObst = 700;
    this.gapRef = 1000;
    this.cara = { ojos: 'furia', boca: 'cerrada', mira: 0, clave: '' };
    this.tac = { izq: false, der: false, abajo: false, correr: false };
    this.nivel = typeof nivelDe === 'function' ? nivelDe('Tormenta') : 1;
    this.dif = 1 + 0.05 * Math.min(this.nivel - 1, 10); // antes 0,08: el nivel 5 era injugable
    this.tramos = this.sortearTramos();

    this.texturas();
    this.montarFondo(this.tramos[0].bg, false);
    this.suelo();
    this.crearJugador();
    this.crearMadre();
    this.hud();
    this.mandos();

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 450, () => this.presentacion());
  }

  // ---------- Sorteo de los tres tramos (baraja sin repetir, distintos dentro de la partida) ----------

  sortearTramos() {
    const ids = TRAMOS_TM.map(t => t.id);
    const salen = [];
    for (let i = 0; i < 3; i++) {
      let id = sacarTM('tramos', ids);
      for (let n = 0; n < 12 && salen.includes(id); n++) id = sacarTM('tramos', ids);
      if (salen.includes(id)) id = ids.find(x => !salen.includes(x));
      salen.push(id);
    }
    return salen.map(id => {
      const t = TRAMOS_TM.find(x => x.id === id);
      return this.textures.exists(t.bg) ? t : { ...t, bg: 'bg-plaza' };
    });
  }

  // ---------- Dibujos (Graphics): escondites, obstáculos, charco ----------

  texturas() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const T = HEX.tinta;
    const hacer = (clave, w, h, f) => {
      if (this.textures.exists(clave)) return;
      g.clear();
      f(g);
      g.generateTexture(clave, w, h);
    };
    hacer('tm-contenedor', 240, 160, g => {
      g.fillStyle(T, 1).fillRoundedRect(4, 30, 232, 124, 16);
      g.fillStyle(0x3f8f5a, 1).fillRoundedRect(10, 36, 220, 112, 12);
      g.lineStyle(5, 0x2c6a42, 1);
      [64, 120, 176].forEach(x => g.lineBetween(x, 58, x, 140));
      g.fillStyle(T, 1).fillRoundedRect(2, 14, 236, 36, 10);
      g.fillStyle(0x2c6a42, 1).fillRoundedRect(8, 19, 224, 26, 8);
      g.fillStyle(0x6fc08a, 1).fillRect(16, 23, 70, 6);
      g.fillStyle(T, 1).fillCircle(38, 152, 12).fillCircle(202, 152, 12);
      g.fillStyle(0x777788, 1).fillCircle(38, 152, 6).fillCircle(202, 152, 6);
    });
    hacer('tm-arbusto', 240, 160, g => {
      const bolas = [[50, 104, 46], [104, 80, 58], [166, 98, 52], [204, 118, 34], [112, 120, 44]];
      g.fillStyle(T, 1);
      bolas.forEach(([x, y, r]) => g.fillCircle(x, y, r + 7));
      g.fillStyle(0x2f6b3c, 1);
      bolas.forEach(([x, y, r]) => g.fillCircle(x, y, r));
      g.fillStyle(0x3f8a4d, 1);
      bolas.forEach(([x, y, r]) => g.fillCircle(x - r * 0.25, y - r * 0.3, r * 0.5));
      // Ojos amarillos entre las hojas, como los del parque.
      g.fillStyle(0xffe14a, 1).fillCircle(86, 100, 6).fillCircle(112, 98, 6);
      g.fillStyle(T, 1).fillCircle(87, 101, 2.5).fillCircle(113, 99, 2.5);
    });
    hacer('tm-caseta', 240, 160, g => {
      g.fillStyle(T, 1).fillRect(14, 70, 212, 88);
      g.fillStyle(0xb07a3e, 1).fillRect(20, 76, 200, 76);
      g.fillStyle(0x8a5a2b, 1).fillRect(20, 112, 200, 8);
      g.fillStyle(0x2a1d38, 1).fillRect(36, 84, 168, 24);
      for (let i = 0; i < 6; i++) {
        g.fillStyle(T, 1).fillRect(10 + i * 37, 8, 37, 62);
        g.fillStyle(i % 2 ? HEX.crema : 0xe8364f, 1).fillRect(14 + i * 37, 12, 29, 54);
      }
      g.fillStyle(T, 1).fillRect(14, 62, 214, 8);
    });
    hacer('tm-marquesina', 240, 160, g => {
      g.fillStyle(T, 1).fillRect(6, 14, 228, 20).fillRect(10, 30, 12, 126).fillRect(218, 30, 12, 126);
      g.fillStyle(0x7a8aa8, 1).fillRect(10, 18, 220, 12);
      g.fillStyle(0x5ad1ff, 0.28).fillRect(24, 34, 192, 102);
      g.lineStyle(4, T, 1).strokeRect(24, 34, 192, 102);
      g.fillStyle(0x9a6232, 1).fillRect(40, 108, 160, 12);
      g.fillStyle(T, 1).fillRect(46, 120, 10, 34).fillRect(184, 120, 10, 34);
      g.fillStyle(0xffd23f, 1).fillRect(96, 44, 48, 20);
    });
    hacer('tm-carrito', 240, 160, g => {
      g.fillStyle(T, 1).fillRect(118, 24, 8, 80);
      g.fillStyle(T, 1).slice(122, 40, 112, Math.PI, 0, false).fillPath();
      g.fillStyle(0xff5fa2, 1).slice(122, 40, 102, Math.PI, 0, false).fillPath();
      g.fillStyle(HEX.crema, 1).slice(122, 40, 102, Math.PI * 1.3, Math.PI * 1.55, false).fillPath();
      g.fillStyle(HEX.crema, 1).slice(122, 40, 102, Math.PI * 1.7, Math.PI * 1.92, false).fillPath();
      g.fillStyle(T, 1).fillRoundedRect(20, 80, 200, 70, 12);
      g.fillStyle(0x5ad1ff, 1).fillRoundedRect(26, 86, 188, 58, 9);
      g.fillStyle(HEX.crema, 1).fillRect(40, 96, 160, 20);
      g.fillStyle(T, 1).fillCircle(54, 152, 12).fillCircle(186, 152, 12);
    });
    hacer('tm-toldo', 240, 172, g => {
      g.fillStyle(T, 1).fillRect(14, 70, 8, 102).fillRect(218, 70, 8, 102);
      for (let i = 0; i < 6; i++) {
        g.fillStyle(T, 1).fillRect(6 + i * 38, 4, 38, 74);
        g.fillStyle(i % 2 ? HEX.crema : 0xff5fa2, 1).fillRect(10 + i * 38, 8, 30, 66);
      }
      for (let i = 0; i < 6; i++) g.fillStyle(i % 2 ? HEX.crema : 0xff5fa2, 1).fillCircle(25 + i * 38, 76, 15).lineStyle(4, T, 1).strokeCircle(25 + i * 38, 76, 15);
    });
    hacer('tm-cubo', 80, 90, g => {
      g.fillStyle(T, 1).fillPoints([{ x: 8, y: 14 }, { x: 72, y: 14 }, { x: 64, y: 86 }, { x: 16, y: 86 }], true);
      g.fillStyle(0x8a94a8, 1).fillPoints([{ x: 14, y: 20 }, { x: 66, y: 20 }, { x: 59, y: 80 }, { x: 21, y: 80 }], true);
      g.fillStyle(0xb8c2d4, 1).fillRect(22, 24, 8, 54);
      g.fillStyle(T, 1).fillRoundedRect(4, 6, 72, 16, 6);
      g.fillStyle(0x5a6478, 1).fillRoundedRect(8, 9, 64, 10, 4);
    });
    hacer('tm-charco', 200, 64, g => {
      g.fillStyle(T, 1).fillEllipse(100, 34, 190, 46);
      g.fillStyle(0x3b6fb0, 1).fillEllipse(100, 34, 178, 36);
      g.fillStyle(0x6ea6e6, 1).fillEllipse(86, 30, 110, 18);
      g.lineStyle(3, 0xcfe6ff, 1).strokeEllipse(100, 34, 90, 16).strokeEllipse(100, 34, 50, 8);
    });
    hacer('tm-flecha', 40, 30, g => {
      g.fillStyle(T, 1).fillTriangle(2, 2, 38, 2, 20, 28);
      g.fillStyle(HEX.amarillo, 1).fillTriangle(8, 6, 32, 6, 20, 22);
    });
    hacer('tm-raya', 120, 12, g => { g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 70, 8, 4); });
    g.destroy();
  }

  // ---------- Fondo que se desplaza: el barrio de noche, en espejo para que no se note la costura ----------

  montarFondo(clave, aparece) {
    const cont = this.add.container(0, 0).setDepth(0);
    const prueba = this.textures.get(clave).getSourceImage();
    const esc = ALTO / prueba.height;
    const tw = prueba.width * esc;
    const n = Math.ceil(ANCHO / tw) + 3;
    const tiles = [];
    for (let i = 0; i < n; i++) {
      let im = this.add.image(i * tw, ALTO / 2, clave).setOrigin(0, 0.5).setScale(esc).setFlipX(i % 2 === 1);
      // La feria tiene una noria única: en la copia en espejo salían dos iguales. En esas copias, una nube de
      // humo de la tormenta tapa la noria repetida (el tramo se mueve igual: la pieza es un contenedor).
      if (i % 2 === 1 && clave === 'bg-feria' && this.textures.exists('fx-humo-puff')) {
        const pieza = this.add.container(i * tw, 0);
        im.setPosition(0, ALTO / 2);
        const nube = this.add.image(tw - 870 * esc, 330 * esc, 'fx-humo-puff').setScale(1.35).setAlpha(0.94);
        pieza.add([im, nube]);
        im = pieza;
      }
      cont.add(im);
      tiles.push(im);
    }
    // La noche y la tormenta encima (sube con los tramos), sin tapar el dibujo.
    const velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x0c0a24, 0.34 + 0.05 * this.tramoIdx);
    cont.add(velo);
    const nuevo = { cont, tiles, tw, velo };
    if (aparece) {
      cont.setAlpha(0);
      this.tweens.add({ targets: cont, alpha: 1, duration: 700 });
      const viejo = this.fondoA;
      this.time.delayedCall(760, () => { if (viejo && viejo.cont.active) viejo.cont.destroy(); });
    }
    this.fondoA = nuevo;
    return nuevo;
  }

  suelo() {
    // Rayas del suelo, para notar la velocidad.
    this.rayas = this.add.tileSprite(ANCHO / 2, TM.suelo + 52, ANCHO, 12, 'tm-raya').setAlpha(0.28).setDepth(2);
    // Una sombra suave bajo los pies de Vuper.
    this.sombra = this.add.ellipse(this.px, TM.suelo + 4, 120, 18, HEX.tinta, 0.45).setDepth(5);
  }

  // ---------- Vuper (nube de humo) ----------

  crearJugador() {
    this.vuper = this.add.image(this.px, TM.suelo, 'vuper').setOrigin(0.5, 1).setDepth(26);
    this.escV = TM.altoV / this.vuper.height;
    this.vuper.setScale(this.escV);
  }

  pintarJugador() {
    const v = this.vuper;
    const clave = this.sprint ? 'vuper-reparto' : 'vuper';
    if (v.texture.key !== clave) v.setTexture(clave);
    v.setFlipX(clave === 'vuper-reparto');
    const esc = TM.altoV / v.height;
    const t = this.time.now / 1000;
    let sx = esc;
    let sy = esc;
    let off = 0;
    if (this.agachado) { sx = esc * 1.22; sy = esc * 0.56; }
    else if (this.py > 2) {
      const k = Math.min(0.14, Math.abs(this.vy) / 6500);
      sx = esc * (1 - k); sy = esc * (1 + k);
    } else if (this.suelitoT > 0) {
      const k = this.suelitoT / 0.12;
      sx = esc * (1 + 0.16 * k); sy = esc * (1 - 0.16 * k);
    } else if (this.frenado > 0) {
      sx = esc * (1 + 0.03 * Math.sin(t * 60)); sy = esc;
    } else {
      const k = Math.sin(t * (this.sprint ? 22 : 13));
      sy = esc * (1 + 0.05 * k); sx = esc * (1 - 0.04 * k);
      off = -Math.abs(k) * (this.sprint ? 4 : 8);
    }
    v.setPosition(this.px, TM.suelo - this.py + off).setScale(sx, sy);
    v.setDepth(this.escondido ? 22 : 26);
    let alpha = this.escondido ? 0.5 : 1;
    if (this.invul > 0 && Math.sin(this.time.now / 45) > 0) alpha = Math.min(alpha, 0.4);
    v.setAlpha(alpha);
    this.sombra.setPosition(this.px, TM.suelo + 4).setScale(1 - Math.min(0.5, this.py / 400), 1).setAlpha(this.escondido ? 0.15 : 0.45);
  }

  // ---------- La madre: nube de tormenta entera ----------

  crearMadre() {
    this.madre = this.add.container(430, 165).setDepth(30);
    this.madreInt = this.add.container(0, 0);
    this.madre.add(this.madreInt);
    const g = this.add.graphics();
    const lumps = [[0, 0, 122], [-125, 22, 92], [126, 26, 96], [-66, -76, 80], [64, -82, 86], [0, 72, 98], [-176, 72, 60], [180, 76, 60], [-8, -112, 62]];
    g.fillStyle(HEX.tinta, 1);
    lumps.forEach(([x, y, r]) => g.fillCircle(x, y, r + 9));
    g.fillStyle(0x38324f, 1);
    lumps.forEach(([x, y, r]) => g.fillCircle(x, y, r));
    // Panza más oscura y luces arriba a la izquierda: se lee a distancia como nubarrón.
    g.fillStyle(0x28223c, 1);
    [[0, 90, 80], [-110, 80, 50], [112, 86, 52]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.fillStyle(0x4d4672, 1);
    lumps.forEach(([x, y, r]) => g.fillCircle(x - r * 0.28, y - r * 0.34, r * 0.46));
    // Rulos (la madre de día lleva rulos; la de noche, también).
    const rulo = (x, y, a, c) => {
      g.save();
      g.translateCanvas(x, y).rotateCanvas(a);
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(-13, -26, 26, 52, 8);
      g.fillStyle(c, 1).fillRoundedRect(-8, -22, 16, 44, 5);
      g.restore();
    };
    rulo(-70, -158, -0.35, 0xff5fa2); rulo(-22, -170, -0.1, 0x5ad1ff); rulo(28, -168, 0.12, 0xffd23f);
    rulo(76, -156, 0.38, 0x7ee081); rulo(-118, -132, -0.6, 0x5ad1ff); rulo(122, -126, 0.62, 0xff5fa2);
    this.madreInt.add(g);
    // Luz interior: un destello pequeño dentro de la nube, de vez en cuando.
    this.madreLuz = this.add.circle(-50, 28, 80, 0xfff1a8, 0).setBlendMode(Phaser.BlendModes.ADD);
    this.madreInt.add(this.madreLuz);
    this.caraG = this.add.graphics();
    this.madreInt.add(this.caraG);
    this.madre.setScale(0.86);
    this.dedoG = this.add.graphics().setDepth(31);
    this.pintarCara(true);
    this.tweens.add({ targets: this.madreInt, y: 9, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: this.madreInt, scaleX: 1.03, scaleY: 0.975, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.time.addEvent({ delay: 2300, loop: true, callback: () => this.luzMadre() });
  }

  luzMadre() {
    if (!this.madreLuz || !this.madreLuz.active) return;
    this.madreLuz.setPosition(Phaser.Math.Between(-110, 110), Phaser.Math.Between(-30, 80));
    this.tweens.add({ targets: this.madreLuz, fillAlpha: 0.2, duration: 90, yoyo: true });
  }

  madreCara(ojos, boca) {
    this.cara.ojos = ojos;
    this.cara.boca = boca;
    this.pintarCara();
  }

  // La cara se repinta solo cuando cambia (estado o mirada).
  pintarCara(forzar) {
    const c = this.cara;
    const clave = `${c.ojos}|${c.boca}|${c.mira}`;
    if (!forzar && clave === c.clave) return;
    c.clave = clave;
    const g = this.caraG;
    const T = HEX.tinta;
    g.clear();
    // Ojos encendidos: brillo, blanco amarillo, pupila que busca a Vuper.
    [-1, 1].forEach(s => {
      const ex = s * 66;
      g.fillStyle(0xffd23f, 0.2).fillCircle(ex, -8, 56);
      g.fillStyle(T, 1).fillEllipse(ex, -8, 80, 72);
      g.fillStyle(0xfff0a0, 1).fillEllipse(ex, -8, 68, 60);
      g.fillStyle(T, 1).fillCircle(ex + c.mira * 11, c.ojos === 'ancha' ? -8 : -1, c.ojos === 'ancha' ? 9 : 13);
      g.fillStyle(0xff5a4f, 1).fillCircle(ex + c.mira * 11, c.ojos === 'ancha' ? -8 : -1, c.ojos === 'ancha' ? 4 : 6);
      if (c.ojos === 'furia') {
        // Párpado fruncido: baja hacia la nariz (fuera arriba, dentro abajo).
        g.fillStyle(0x38324f, 1).fillPoints([{ x: ex + s * 42, y: -54 }, { x: ex - s * 42, y: -54 }, { x: ex - s * 42, y: 0 }, { x: ex + s * 42, y: -34 }], true);
        g.lineStyle(7, T, 1).lineBetween(ex + s * 42, -34, ex - s * 42, 0);
      }
      // Ceja de rayo: sale de fuera arriba y baja en zigzag hacia la nariz.
      const pts = [[ex + s * 50, -88], [ex + s * 24, -70], [ex + s * 32, -96], [ex + s * 2, -62], [ex - s * 34, -44]];
      g.lineStyle(17, T, 1).beginPath().moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(([x, y]) => g.lineTo(x, y));
      g.strokePath();
      g.lineStyle(8, 0xffd23f, 1).beginPath().moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(([x, y]) => g.lineTo(x, y));
      g.strokePath();
    });
    // Boca: una bronca hecha trueno.
    const bolt = (cx, cy, k) => {
      const q = [[-18, -30], [8, -30], [-6, -4], [20, -4], [-18, 32], [-8, 4], [-32, 4]].map(([x, y]) => ({ x: cx + x * k, y: cy + y * k }));
      g.fillStyle(0xffd23f, 1).fillPoints(q, true);
    };
    if (c.boca === 'cerrada') {
      // Boca en ceño (esquinas hacia abajo) y con dientes de sierra.
      g.lineStyle(14, T, 1).beginPath().moveTo(-72, 106);
      for (let x = -72; x <= 72; x += 8) g.lineTo(x, 82 + Math.pow(x / 72, 2) * 26 + Math.sin(x / 9) * 3);
      g.strokePath();
    } else if (c.boca === 'abierta') {
      g.fillStyle(T, 1).fillEllipse(0, 86, 168, 98);
      g.fillStyle(0xfff6e8, 1).fillRect(-54, 46, 108, 12);
      bolt(0, 92, 1);
    } else if (c.boca === 'o') {
      g.fillStyle(T, 1).fillEllipse(0, 88, 76, 84);
      g.fillStyle(0xff5fa2, 1).fillEllipse(0, 102, 40, 24);
    } else {
      g.fillStyle(T, 1).fillEllipse(0, 86, 212, 128);
      g.fillStyle(0xfff6e8, 1).fillRect(-70, 30, 140, 14);
      bolt(0, 92, 1.3);
    }
    g.lineStyle(5, T, 1);
  }

  animarMadre(dt) {
    if (!this.madre || !this.madre.active) return;
    if (!this.madreFija) {
      const meta = Phaser.Math.Clamp(this.px * 0.6 + 190, 330, 620);
      this.madre.x += (meta - this.madre.x) * Math.min(1, dt * 2.2);
    }
    const mira = Math.round(Phaser.Math.Clamp((this.px - this.madre.x) / 160, -1, 1) * 2) / 2;
    if (mira !== this.cara.mira) { this.cara.mira = mira; this.pintarCara(); }
  }

  // ---------- HUD ----------

  hud() {
    const D = 100;
    this.corazones = [0, 1, 2].map(i => {
      const c = this.add.image(46 + i * 58, 40, 'fx-corazon').setDepth(D);
      c.setScale(44 / c.height);
      return c;
    });
    texto(this, 120, 84, 'AGUANTE', 17, COLOR.crema).setDepth(D);
    this.add.rectangle(120, 106, 176, 18, HEX.tinta).setStrokeStyle(3, HEX.crema).setDepth(D);
    this.barraAguante = this.add.rectangle(33, 106, 174, 12, HEX.verde).setOrigin(0, 0.5).setDepth(D + 1);
    // Camino a casa: tres tramos y la puerta.
    this.add.rectangle(900, 38, 600, 26, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(D);
    this.barraCamino = this.add.rectangle(603, 38, 0, 16, HEX.rosa).setOrigin(0, 0.5).setDepth(D + 1);
    [1 / 3, 2 / 3].forEach(f => this.add.rectangle(603 + 594 * f, 38, 4, 26, HEX.tinta).setDepth(D + 2));
    this.marcaVuper = this.add.image(603, 38, 'vuper').setScale(0.1).setDepth(D + 3);
    const casa = this.add.graphics().setDepth(D + 2);
    casa.fillStyle(HEX.tinta, 1).fillRect(1182, 16, 26, 44);
    casa.fillStyle(0x9a6232, 1).fillRect(1186, 20, 18, 38);
    casa.fillStyle(HEX.amarillo, 1).fillCircle(1199, 40, 2.5);
    this.textoTramo = texto(this, 900, 72, '', 20, COLOR.crema).setDepth(D);
  }

  pintarHud() {
    this.corazones.forEach((c, i) => { if (i >= this.vidas) c.setTint(0x333333).setAlpha(0.4); });
    this.barraAguante.width = 174 * this.aguante / 100;
    this.barraAguante.fillColor = this.cansado ? HEX.rojo : this.aguante < 30 ? HEX.amarillo : HEX.verde;
    const total = (this.tramoIdx * TM.tramoLen + this.tramoProg) / (3 * TM.tramoLen);
    this.barraCamino.width = 594 * Math.min(1, total);
    this.marcaVuper.x = 603 + 594 * Math.min(1, total);
    const nombre = this.tramos[Math.min(2, this.tramoIdx)].nombre;
    const s = `Tramo ${this.tramoIdx + 1}/3 · ${nombre}`;
    if (this.textoTramo.text !== s) this.textoTramo.setText(s);
  }

  // ---------- Mandos: teclado, ratón y dedo ----------

  mandos() {
    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SHIFT,SPACE');
    ['SPACE', 'UP', 'W'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.saltar()));
    this.input.addPointer(3);
    if (!MOVIL) this.input.on('pointerdown', (p, sobre) => { if (!sobre.length) this.saltar(); });
    if (MOVIL) {
      const bt = (x, y, r, etq, color, clave, mantener) => {
        const c = this.add.container(x, y).setDepth(120).setAlpha(0.78);
        const g = this.add.graphics();
        g.fillStyle(HEX.tinta, 1).fillCircle(0, 6, r);
        g.fillStyle(color, 1).fillCircle(0, 0, r);
        g.lineStyle(6, HEX.tinta, 1).strokeCircle(0, 0, r);
        const t = this.add.text(0, 0, etq, { fontFamily: FUENTE, fontSize: `${Math.round(r * (etq.length > 2 ? 0.30 : 0.52))}px`, color: COLOR.tinta, align: 'center', wordWrap: { width: r * 1.8 } }).setOrigin(0.5);
        c.add([g, t]);
        c.setSize(r * 2, r * 2).setInteractive();
        const abajo = () => { if (mantener) this.tac[clave] = true; else this.saltar(); c.setScale(0.92); };
        const arriba = () => { if (mantener) this.tac[clave] = false; c.setScale(1); };
        c.on('pointerdown', abajo);
        c.on('pointerup', arriba);
        c.on('pointerout', arriba);
        return c;
      };
      this.botones = [
        bt(86, 640, 56, '◀', HEX.crema, 'izq', true),
        bt(214, 640, 56, '▶', HEX.crema, 'der', true),
        bt(1190, 632, 68, 'SALTAR', HEX.amarillo, null, false),
        bt(1040, 650, 56, 'AGACHAR', HEX.azul, 'abajo', true),
        bt(1190, 480, 54, 'CORRER', HEX.rosa, 'correr', true),
      ];
    }
  }

  saltar() {
    if (!this.activo) return;
    this.saltoBuf = 0.13;
  }

  // ---------- Presentación: la llamada de mamá y la nube que aparece ----------

  presentacion() {
    this.madre.setScale(0);
    this.madreFija = true;
    this.madre.setPosition(430, 165);
    const card = this.add.container(ANCHO / 2, 360).setDepth(300).setScale(0);
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(-300, -118, 600, 250, 30);
    g.fillStyle(0x2a2142, 1).fillRoundedRect(-292, -126, 600, 250, 30);
    g.lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-292, -126, 600, 250, 30);
    card.add(g);
    const retrato = this.add.image(-190, -4, 'n-madre').setOrigin(0.5);
    retrato.setScale(200 / retrato.height);
    card.add(retrato);
    card.add(texto(this, 70, -62, 'MAMÁ', 64, COLOR.crema));
    this.llamando = texto(this, 70, 12, 'llamando…', 34, COLOR.amarillo);
    card.add(this.llamando);
    card.add(texto(this, 70, 78, '3 llamadas perdidas', 24, COLOR.rosa));
    sfx(this, 'zumbido-m', { volume: 0.6 });
    this.tweens.add({ targets: card, scale: 1, duration: 320, ease: 'Back.out' });
    // La tarjeta vibra (solo ella, no la pantalla).
    this.tweens.add({ targets: card, angle: 2, duration: 55, yoyo: true, repeat: 14, delay: 320 });
    this.time.delayedCall(1700, () => {
      this.tweens.add({ targets: card, scale: 0, alpha: 0, duration: 260, ease: 'Back.in', onComplete: () => card.destroy() });
      // Se hace de noche: la llamada se hace nube.
      this.madre.setScale(0);
      this.tweens.add({ targets: this.madre, scale: 0.86, duration: 520, ease: 'Back.out' });
      sfx(this, 'temblor', { volume: 0.4 });
      this.madreCara('furia', 'abierta');
      this.destello(0.16);
    });
    this.time.delayedCall(2300, () => {
      this.madreFija = false;
      this.madreCara('furia', 'cerrada');
      const banda = this.add.rectangle(ANCHO / 2, 520, ANCHO, 150, HEX.tinta, 0.78).setDepth(299);
      const t1 = texto(this, ANCHO / 2, 480, 'LA TORMENTA', 76, COLOR.amarillo).setDepth(300).setScale(0);
      const ayuda = MOVIL
        ? 'Huye · salta, agáchate tras las cosas y corre'
        : 'Flechas mover · Espacio saltar · ↓ agacharte y esconderte · Mayús correr';
      const t2 = texto(this, ANCHO / 2, 556, ayuda, 25, COLOR.crema, 1150).setDepth(300).setAlpha(0);
      const extra = this.nivel > 1 ? `Nivel ${this.nivel}` : '';
      const t3 = texto(this, ANCHO / 2, 596, extra, 22, COLOR.azul).setDepth(300).setAlpha(0);
      sfx(this, 'sting', { volume: 0.5 });
      this.tweens.add({ targets: t1, scale: 1, duration: 420, ease: 'Back.out' });
      this.tweens.add({ targets: [t2, t3], alpha: 1, duration: 360, delay: 260 });
      this.time.delayedCall(2200, () => {
        [banda, t1, t2, t3].forEach(o => o.destroy());
        golpeTexto(this, ANCHO / 2, 330, '¡Corre!', COLOR.amarillo, 70).setDepth(800);
        sfx(this, 'tiroriro', { volume: 0.5 });
        this.activo = true;
        this.vuperDice(sacarTM('vuper', FRASES_VUPER));
      });
    });
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.animarMadre(dt);
    if (this.vuper) this.pintarJugador();
    if (!this.activo) return;
    this.t += dt;
    this.invul -= dt;
    this.frenado -= dt;
    this.charcoT -= dt;
    this.pausaAtaque -= dt;
    this.saltoBuf -= dt;
    this.suelitoT -= dt;

    const v = this.moverJugador(dt);
    this.moverMundo(dt, v);
    this.colisiones();
    this.atacar();
    this.actualizarAtaques(dt);
    this.dibujarDedo();
    this.pintarHud();
    this.controlTramo();
  }

  moverJugador(dt) {
    const k = this.teclas;
    const tc = this.tac;
    const izq = k.LEFT.isDown || k.A.isDown || tc.izq;
    const der = k.RIGHT.isDown || k.D.isDown || tc.der;
    const abajo = k.DOWN.isDown || k.S.isDown || tc.abajo;
    const correr = k.SHIFT.isDown || tc.correr;

    // Aguante: se gasta corriendo y vuelve poco a poco; al vaciarse, hay que recuperar un poco.
    if (correr && !this.cansado && this.aguante > 0 && this.frenado <= 0) {
      this.sprint = true;
      this.aguante = Math.max(0, this.aguante - 32 * dt);
      this.regenT = 0.7;
      if (this.aguante <= 0) { this.cansado = true; this.sprint = false; golpeTexto(this, this.px, TM.suelo - 190, 'Sin aire…', COLOR.crema, 30).setDepth(800); }
    } else {
      this.sprint = false;
      this.regenT -= dt;
      if (this.regenT <= 0) this.aguante = Math.min(100, this.aguante + 22 * dt);
      if (this.cansado && this.aguante >= 30) this.cansado = false;
    }

    // Salto con colchón de 0,13 s (si pulsas un poco antes de pisar, salta).
    const enSuelo = this.py <= 0.5 && this.vy <= 0;
    if (this.saltoBuf > 0 && enSuelo) {
      this.vy = TM.salto;
      this.py = 1;
      this.saltoBuf = 0;
      sfx(this, 'boing', { volume: 0.3 });
    }
    if (this.py > 0 || this.vy > 0) {
      this.vy -= TM.gravedad * dt;
      this.py += this.vy * dt;
      if (this.py <= 0) { this.py = 0; this.vy = 0; this.suelitoT = 0.12; }
    }
    this.agachado = abajo && this.py <= 0.5;

    // Escondites: agachado tras uno, te tapa un rato (el barrio se queda quieto contigo).
    const ref = this.refugios.find(r => Math.abs(this.px - r.x) < r.w / 2 - 28);
    const era = this.escondido;
    this.escondido = !!(this.agachado && ref && ref.cover > 0);
    if (this.escondido) {
      ref.cover -= dt;
      if (ref.cover <= 0) {
        this.escondido = false;
        golpeTexto(this, ref.x, TM.suelo - 200, '¡Te ve!', COLOR.rosa, 40).setDepth(800);
        ref.img.setTint(0x8a8a99);
      }
    }
    if (this.escondido && !era) sfx(this, 'fup', { volume: 0.25 });

    // Movimiento lateral. El viento de bronca te lleva hacia ella.
    let dx = (der ? 1 : 0) - (izq ? 1 : 0);
    if (this.escondido) dx = 0;
    const vel = (this.sprint ? 430 : 330) * (this.frenado > 0 ? 0.55 : 1) * (this.agachado ? 0.5 : 1);
    let empuje = 0;
    if (this.viento && this.viento.activo && !this.escondido) empuje = this.viento.fuerza * (this.agachado ? 0.45 : 1);
    this.px = Phaser.Math.Clamp(this.px + (dx * vel - empuje) * dt, 250, TM.xMax);

    // La nube te alcanza si te quedas pegado a su borde un rato.
    if (this.px <= TM.xMin) {
      this.pared += dt;
      if (this.pared > 0.5) { this.pared = 0; this.px = TM.xMin + 130; this.golpe('pared'); }
    } else this.pared = Math.max(0, this.pared - dt * 2);

    // Velocidad del barrio.
    let v = TM.base * (1 + 0.04 * this.tramoIdx) * (this.sprint ? 1.55 : 1);
    if (this.frenado > 0) v *= 0.5;
    if (this.charcoT > 0) v *= 0.55;
    if (this.escondido) v = 0;
    return v;
  }

  moverMundo(dt, v) {
    const d = v * dt;
    this.dist += d;
    this.tramoProg += d;
    this.bgOff += d * 0.55;
    const f = this.fondoA;
    if (f && f.cont.active) {
      const off = this.bgOff % (2 * f.tw);
      f.tiles.forEach((im, i) => { im.x = i * f.tw - off; });
    }
    this.rayas.tilePositionX += d;
    this.obst = this.obst.filter(o => {
      o.x -= d + (o.extra || 0) * dt;
      o.img.x = o.x;
      if (o.tipo === 'paloma') o.img.y = o.y + Math.sin(this.time.now / 140 + o.x) * 8;
      if (o.x < -200 || o.golpeado) { if (!o.golpeado) o.img.destroy(); else this.volar(o); return false; }
      return true;
    });
    this.refugios = this.refugios.filter(r => {
      r.x -= d;
      r.img.x = r.x;
      r.flecha.x = r.x;
      r.flecha.y = TM.suelo - r.h - 28 + Math.sin(this.time.now / 220) * 5;
      r.flecha.setVisible(r.cover > 0 && !this.escondido);
      if (r.x < -200) { r.img.destroy(); r.flecha.destroy(); return false; }
      return true;
    });
    this.charcos = this.charcos.filter(c => {
      c.x -= d;
      c.img.x = c.x;
      if (c.x < -200) { c.img.destroy(); return false; }
      return true;
    });
    // Generar obstáculos y escondites por distancia (no por tiempo): si te escondes, no llegan más.
    const margen = this.tramoProg < TM.tramoLen - 900;
    this.gapObst -= d;
    // Mientras el dedo apunta un rayo o suena la llamada no llegan obstáculos: una cosa cada vez.
    if (this.gapObst <= 0 && margen && !this.dedo && !this.llamada) {
      this.crearObstaculo();
      this.gapObst = Phaser.Math.Between(620, 1000) * (1 - 0.06 * this.tramoIdx) / Math.min(1.3, this.dif);
    }
    this.gapRef -= d;
    if (this.gapRef <= 0 && margen) {
      this.crearRefugio();
      this.gapRef = Phaser.Math.Between(1500, 2100);
    }
  }

  // ---------- Obstáculos y escondites ----------

  crearObstaculo() {
    const x = ANCHO + 120;
    const bajo = Math.random() < 0.6 - 0.06 * this.tramoIdx;
    const nuevo = (tipo, clave, esc, w, alto, bajoY, extra = 0) => {
      const img = this.add.image(x, TM.suelo + 6, clave).setOrigin(0.5, 1).setDepth(22);
      if (esc) img.setScale(esc);
      const o = { tipo, img, x, w, alto, y: TM.suelo + 6, bajoY, extra };
      this.obst.push(o);
      return o;
    };
    if (bajo) {
      const k = sacarTM('bajos', ['gato', 'caja', 'cubo']);
      if (k === 'gato') nuevo('gato', 'obj-gato', 84 / 320, 50, 78, 0);
      else if (k === 'caja') nuevo('caja', 'obj-caja-zapatos', 0.26, 76, 48, 0);
      else nuevo('cubo', 'tm-cubo', 1, 56, 66, 0);
    } else {
      const k = sacarTM('altos', ['paloma', 'toldo']);
      if (k === 'paloma') {
        const o = nuevo('paloma', 'obj-paloma', 0.27, 60, 68, 60, 150);
        // Vuela alto: su borde de abajo queda a ~66 px del suelo, así que agachado (54 px) pasa por debajo.
        o.y = TM.suelo - 100;
        o.img.setOrigin(0.5, 0.5).setFlipX(true);
        o.img.y = o.y;
      } else nuevo('toldo', 'tm-toldo', 1, 210, 80, 92);
    }
    // En el último tramo, a veces vienen en pareja (un salto y luego un agache).
    if (this.tramoIdx === 2 && bajo && Math.random() < 0.4) {
      this.gapObst = 340;
    }
  }

  crearRefugio() {
    const t = this.tramos[Math.min(2, this.tramoIdx)];
    const clave = `tm-${t.refugio === 'contenedor' ? 'contenedor' : t.refugio}`;
    const x = ANCHO + 140;
    const img = this.add.image(x, TM.suelo + 10, clave).setOrigin(0.5, 1).setDepth(24);
    const flecha = this.add.image(x, TM.suelo - 190, 'tm-flecha').setDepth(25).setAlpha(0.9);
    this.refugios.push({ x, img, flecha, w: 230, h: 150, cover: TM.tapar });
    if (!this.avisoRefugio) {
      this.avisoRefugio = true;
      this.time.delayedCall(1400, () => { if (this.activo) golpeTexto(this, 640, 300, MOVIL ? 'Agáchate tras las cosas para esconderte' : '↓ tras las cosas para esconderte', COLOR.crema, 32).setDepth(800); });
    }
  }

  volar(o) {
    this.tweens.add({ targets: o.img, x: o.img.x - 140, y: o.img.y - 160, angle: -200, alpha: 0, duration: 520, onComplete: () => o.img.destroy() });
  }

  colisiones() {
    if (this.escondido) return;
    const alto = this.agachado ? 54 : 108;
    const pies = TM.suelo - this.py;
    const pT = pies - alto;
    // Cajas de choque con margen de gracia (juego de reflejos): más estrechas que el dibujo.
    const pL = this.px - 26;
    const pR = this.px + 26;
    this.obst.forEach(o => {
      if (o.golpeado) return;
      const oT = o.tipo === 'paloma' ? o.img.y - 34 : o.tipo === 'toldo' ? TM.suelo - 172 : TM.suelo - o.alto;
      const oB = o.tipo === 'paloma' ? o.img.y + 34 : o.tipo === 'toldo' ? TM.suelo - 92 : TM.suelo;
      if (pR > o.x - o.w / 2 && pL < o.x + o.w / 2 && pies > oT + 12 && pT < oB - 10) {
        if (this.invul > 0) return;
        o.golpeado = true;
        this.golpe('obst');
      }
    });
    this.charcos.forEach(c => {
      if (c.usado) return;
      if (Math.abs(this.px - c.x) < 82 && this.py < 14) {
        c.usado = true;
        this.charcoT = 1.0;
        sfx(this, 'chof', { volume: 0.5 });
        const s = this.add.particles(this.px, TM.suelo, 'miga', { speed: { min: 80, max: 260 }, angle: { min: 220, max: 320 }, gravityY: 900, scale: { start: 0.8, end: 0.2 }, lifespan: 500, tint: [0x6ea6e6, 0xcfe6ff], emitting: false }).setDepth(40);
        s.explode(10);
        this.time.delayedCall(600, () => s.destroy());
        golpeTexto(this, this.px, TM.suelo - 150, '¡Chof!', COLOR.azul, 36).setDepth(800);
      }
    });
  }

  // ---------- Ser alcanzado ----------

  golpe(origen) {
    if (this.invul > 0 || !this.activo || this.escondido) return false;
    this.vidas--;
    this.golpes++;
    this.invul = 2.4;
    this.pausaAtaque = Math.max(this.pausaAtaque, 1.3);
    sfx(this, 'golpe', { volume: 0.55 });
    this.vuper.setTintFill(0xff5a4f);
    this.time.delayedCall(130, () => this.vuper.active && this.vuper.clearTint());
    if (this.py <= 0) { this.vy = 560; this.py = 1; }
    // Ella te alcanza con una frase (el cuerpo de la nube se echa hacia ti, sin sacudir la pantalla).
    this.madreCara('ancha', 'grito');
    this.tweens.add({ targets: this.madreInt, scaleX: 1.16, scaleY: 1.16, duration: 160, yoyo: true, hold: 420 });
    this.decirMadre(sacarTM('alcance', FRASES_ALCANCE), 1700);
    this.time.delayedCall(850, () => { if (this.activo) this.madreCara('furia', 'cerrada'); });
    this.pintarHud();
    if (this.vidas <= 0) this.derrota();
    return true;
  }

  // ---------- Voces (una a la vez) ----------

  decir(x, y, str, cola, ms) {
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    const b = bocadillo(this, x, y, str, { tam: 26, ancho: 380, cola }).setDepth(96);
    this.vozActual = b;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
    return b;
  }

  decirMadre(str, ms = 1700) {
    return this.decir(Phaser.Math.Clamp(this.madre.x + 330, 560, 1060), 190, str, 'izq', ms);
  }

  vuperDice(str) {
    return this.decir(Phaser.Math.Clamp(this.px + 130, 300, 1000), TM.suelo - 210, str, 'abajo', 1500);
  }

  // ---------- Ataques de la madre ----------

  tras(ms, fn) {
    this.time.delayedCall(ms, () => { if (this.activo && !this._acabado) fn(); });
  }

  atacar() {
    if (this.ocupada || this.pausaAtaque > 0 || this.invul > 1.4) return;
    const tipo = sacarTM(`ataque${this.tramoIdx}`, ATAQUES_TM[this.tramoIdx]);
    this.ocupada = true;
    this[`ataque_${tipo}`]();
  }

  finAtaque(pausa) {
    this.ocupada = false;
    this.pausaAtaque = pausa[this.tramoIdx] / Math.sqrt(this.dif);
    this.dedo = null;
    this.madreCara('furia', 'cerrada');
  }

  efimero(o) { this.efimeros.push(o); return o; }

  destello(a = 0.18) {
    const r = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0xfff6c8, a).setDepth(190);
    this.tweens.add({ targets: r, alpha: 0, duration: 140, onComplete: () => r.destroy() });
  }

  marcaSuelo(x, color = 0xffd23f) {
    const m = this.efimero(this.add.ellipse(x, TM.suelo + 8, 140, 24, color, 0.55).setDepth(6).setStrokeStyle(4, HEX.tinta));
    this.tweens.add({ targets: m, alpha: 0.25, duration: 160, yoyo: true, repeat: -1 });
    return m;
  }

  // Rayos: el dedo de nube señala y, un instante después, cae.
  ataque_rayo() { this.lanzarRayos(1 + (this.tramoIdx >= 1 && Math.random() < 0.4 ? 1 : 0)); }
  ataque_rayos() { this.lanzarRayos(3); }

  lanzarRayos(n) {
    this.madreCara('furia', 'cerrada');
    const T = Math.max(0.95, (n > 1 ? 1.0 : 1.25) - 0.05 * this.tramoIdx);
    const uno = i => {
      const d = { tx: this.px, bloq: false, marca: this.marcaSuelo(this.px) };
      this.dedo = d;
      sfx(this, 'zumbido-m', { volume: 0.18 });
      this.tras(T * 500, () => { d.bloq = true; d.marca.setFillStyle(0xff5a4f, 0.7); });
      this.tras(T * 1000, () => {
        this.caeRayo(d.tx);
        d.marca.destroy();
        if (i + 1 < n) this.tras(220, () => uno(i + 1));
        else this.tras(550, () => this.finAtaque([1.6, 1.3, 1.0]));
      });
    };
    uno(0);
  }

  caeRayo(tx) {
    this.madreCara('furia', 'abierta');
    this.destello(0.17);
    sfx(this, 'zas', { volume: 0.5 });
    const alto = TM.suelo - (this.madre.y + 90);
    const b = this.add.image(tx, TM.suelo + 8, 'fx-rayo').setOrigin(0.5, 1).setDepth(35);
    b.setDisplaySize(96, alto + 8);
    this.tweens.add({ targets: b, alpha: 0, duration: 260, delay: 150, onComplete: () => b.destroy() });
    const s = this.add.particles(tx, TM.suelo, 'miga', { speed: { min: 120, max: 380 }, angle: { min: 200, max: 340 }, gravityY: 900, scale: { start: 0.9, end: 0.2 }, lifespan: 500, tint: [0xffd23f, 0xfff6a8], emitting: false }).setDepth(40);
    s.explode(12);
    this.time.delayedCall(600, () => s.destroy());
    const marca = this.add.ellipse(tx, TM.suelo + 8, 100, 16, HEX.tinta, 0.6).setDepth(3);
    this.tweens.add({ targets: marca, alpha: 0, duration: 1200, delay: 500, onComplete: () => marca.destroy() });
    this.tras(250, () => this.madreCara('furia', 'cerrada'));
    // ¿Te ha dado? (escondido, no; en el aire, también: el rayo cae a ras).
    const cerca = Math.abs(this.px - tx) < 48; // lo que se ve: el rayo dibujado mide 96 px de ancho
    if (cerca && !this.escondido) { this.golpe('rayo'); return; }
    const ref = this.refugios.find(r => Math.abs(r.x - tx) < 110 && this.escondido);
    if (cerca && this.escondido && ref) {
      ref.cover = 0;
      ref.img.setTint(0x55556a);
      golpeTexto(this, tx, TM.suelo - 200, '¡Chamuscado!', COLOR.amarillo, 34).setDepth(800);
    }
    this.esquivadas++;
  }

  // Granizo de zapatillas: sombras en el suelo avisan dónde caen.
  ataque_zapas() { this.lluviaZapas(this.tramoIdx === 0 ? 3 : this.tramoIdx === 1 ? 4 : 5); }
  ataque_zapas2() { this.lluviaZapas(7); }

  lluviaZapas(n) {
    this.madreCara('ancha', 'grito');
    this.decirMadre(sacarTM('zapas', FRASES_ZAPAS), 1500);
    const xs = [this.px + Phaser.Math.Between(-30, 30)];
    for (let i = 1; i < n; i++) {
      let x;
      for (let k = 0; k < 14; k++) { x = Phaser.Math.Between(270, 960); if (xs.every(o => Math.abs(o - x) > 105)) break; }
      xs.push(x);
    }
    const caida = Math.max(650, 900 - 60 * this.tramoIdx);
    xs.forEach((x, i) => {
      this.tras(500 + i * 260, () => {
        const sombra = this.efimero(this.add.ellipse(x, TM.suelo + 8, 30, 8, HEX.tinta, 0.5).setDepth(6));
        this.tweens.add({ targets: sombra, scaleX: 3.4, scaleY: 3, alpha: 0.75, duration: caida });
        const z = this.efimero(this.add.image(x, 30, 'obj-zapatilla').setScale(0.24).setDepth(34).setAngle(Phaser.Math.Between(-30, 30)));
        this.tweens.add({ targets: z, y: TM.suelo - 14, angle: z.angle + 300, duration: caida, ease: 'Quad.in',
          onComplete: () => {
            sombra.destroy();
            sfx(this, 'bonk', { volume: 0.3 });
            if (this.activo && Math.abs(this.px - x) < 52 && this.py < 46 && !this.escondido) this.golpe('zapatilla');
            this.tweens.add({ targets: z, x: z.x - 160, y: z.y - 90, angle: z.angle - 260, alpha: 0, duration: 520, ease: 'Sine.out', onComplete: () => z.destroy() });
          } });
      });
    });
    this.tras(500 + n * 260 + caida + 350, () => { this.esquivadas++; this.finAtaque([1.5, 1.2, 0.9]); });
  }

  // Ráfaga con frase: te empuja hacia ella; avanza, agáchate o escóndete.
  ataque_viento() {
    const frase = sacarTM('viento', FRASES_VIENTO);
    this.madreCara('furia', 'o');
    this.decirMadre(frase, 1500);
    this.tweens.add({ targets: this.madreInt, scaleX: 1.12, duration: 300, yoyo: true });
    this.tras(850, () => {
      const dur = 1.9 + 0.2 * this.tramoIdx;
      this.viento = { activo: true, t: dur, fuerza: (230 + 45 * this.tramoIdx) * Math.min(1.3, this.dif) };
      const t = texto(this, ANCHO + 360, 300, frase, 56, COLOR.crema).setDepth(90).setAlpha(0.92);
      this.efimero(t);
      this.tweens.add({ targets: t, x: -460, duration: dur * 1000, ease: 'Linear', onComplete: () => t.destroy() });
      this.tweens.add({ targets: t, y: 316, duration: 260, yoyo: true, repeat: Math.floor(dur * 1000 / 520) });
      sfx(this, 'whoosh', { volume: 0.4 });
    });
    this.tras(850 + (1.9 + 0.2 * this.tramoIdx) * 1000 + 300, () => { this.viento = null; this.esquivadas++; this.finAtaque([1.7, 1.4, 1.1]); });
  }

  // Charcos: una gotera avisa y deja el charco en el camino.
  ataque_charco() {
    this.madreCara('furia', 'o');
    const hacer = (x, i) => {
      this.tras(i * 700, () => {
        const marca = this.efimero(this.add.ellipse(x, TM.suelo + 14, 120, 20, 0x6ea6e6, 0.5).setDepth(3));
        this.tweens.add({ targets: marca, alpha: 0.15, duration: 150, yoyo: true, repeat: 3 });
        for (let k = 0; k < 6; k++) {
          const l = this.efimero(this.add.rectangle(x + Phaser.Math.Between(-36, 36), this.madre.y + 100, 4, 26, 0xcfe6ff, 0.9).setDepth(33));
          this.tweens.add({ targets: l, y: TM.suelo, duration: 520 + k * 25, delay: k * 40, onComplete: () => l.destroy() });
        }
        this.tras(700, () => {
          marca.destroy();
          const img = this.add.image(x, TM.suelo + 14, 'tm-charco').setScale(0.8, 0.9).setDepth(4);
          this.charcos.push({ x, img });
          sfx(this, 'chof', { volume: 0.3 });
        });
      });
    };
    const n = this.tramoIdx === 0 ? 1 : 2;
    for (let i = 0; i < n; i++) hacer(1000 + i * 300, i);
    this.tras(900 + n * 700, () => this.finAtaque([1.3, 1.0, 0.8]));
  }

  // La llamada perdida: si te agachas a tiempo, la cuelgas; si no, vibra y te frena.
  ataque_llamada() {
    this.madreCara('furia', 'o');
    const icono = this.efimero(this.add.image(this.px, TM.suelo - 190, 'obj-movil').setScale(0.2).setDepth(97));
    const etq = this.efimero(texto(this, this.px, TM.suelo - 250, 'MAMÁ', 26, COLOR.rosa).setDepth(97));
    this.llamada = { t: 0.95, icono, etq, resuelta: false };
    sfx(this, 'zumbido-m', { volume: 0.5 });
    if (!this.avisoLlamada) {
      this.avisoLlamada = true;
      golpeTexto(this, 640, 300, MOVIL ? 'Agáchate para colgar' : '↓ agáchate para colgar', COLOR.crema, 32).setDepth(800);
    }
  }

  actualizarAtaques(dt) {
    if (this.viento && this.viento.activo) {
      this.viento.t -= dt;
      if (this.viento.t <= 0) this.viento.activo = false;
      // Rayas de viento (rectángulos finos que cruzan de derecha a izquierda).
      if (Math.random() < 0.55) {
        const r = this.efimero(this.add.rectangle(ANCHO + 60, Phaser.Math.Between(260, 640), Phaser.Math.Between(90, 220), 4, 0xffffff, 0.45).setDepth(36));
        this.tweens.add({ targets: r, x: -300, duration: 650, onComplete: () => r.destroy() });
      }
    }
    const l = this.llamada;
    if (l) {
      l.icono.x = this.px + Phaser.Math.Between(-3, 3) * (l.t > 0 ? 1 : 0.5);
      l.icono.y = TM.suelo - this.py - 190 + Phaser.Math.Between(-3, 3);
      l.icono.angle = Math.sin(this.time.now / 22) * 12;
      l.etq.setPosition(l.icono.x, l.icono.y - 62);
      l.t -= dt;
      if (!l.resuelta && this.agachado) {
        l.resuelta = true;
        this.esquivadas++;
        golpeTexto(this, this.px, TM.suelo - 270, 'Colgado.', COLOR.verde, 34).setDepth(800);
        this.tweens.add({ targets: [l.icono, l.etq], alpha: 0, y: '-=60', duration: 300, onComplete: () => { l.icono.destroy(); l.etq.destroy(); } });
        this.llamada = null;
        this.tras(300, () => this.finAtaque([1.5, 1.2, 0.9]));
      } else if (!l.resuelta && l.t <= 0) {
        l.resuelta = true;
        this.frenado = 2.2;
        sfx(this, 'zumbido-m', { volume: 0.55 });
        golpeTexto(this, this.px, TM.suelo - 270, '¡Brrr, brrr!', COLOR.rosa, 34).setDepth(800);
        this.time.delayedCall(2200, () => {
          if (l.icono.active) this.tweens.add({ targets: [l.icono, l.etq], alpha: 0, duration: 250, onComplete: () => { l.icono.destroy(); l.etq.destroy(); } });
          if (this.llamada === l) this.llamada = null;
        });
        this.tras(1500, () => this.finAtaque([1.5, 1.2, 0.9]));
      }
    }
  }

  // El dedo de nube: sale de la nube hacia donde va a caer el rayo.
  dibujarDedo() {
    const g = this.dedoG;
    g.clear();
    const d = this.dedo;
    if (!d) return;
    if (!d.bloq) {
      // Te sigue con retraso (antes un 25 % por frame: iba pegado a ti y no había forma de engañarlo).
      d.tx += (this.px - d.tx) * 0.12;
      d.marca.x = d.tx;
    }
    const sx = this.madre.x + 120;
    const sy = this.madre.y + 70;
    const ang = Math.atan2(TM.suelo - sy, d.tx - sx);
    const largo = 380;
    const T = HEX.tinta;
    const n = 9;
    for (let pasada = 0; pasada < 2; pasada++) {
      for (let i = 0; i <= n; i++) {
        const f = i / n;
        const r = (pasada === 0 ? 8 : 0) + 30 - 12 * f;
        g.fillStyle(pasada === 0 ? T : 0x38324f, 1).fillCircle(sx + Math.cos(ang) * largo * f, sy + Math.sin(ang) * largo * f, r);
      }
    }
    const px = sx + Math.cos(ang) * largo;
    const py = sy + Math.sin(ang) * largo;
    g.fillStyle(d.bloq ? 0xff5a4f : 0xffd23f, 1).fillCircle(px, py, 10);
  }

  // ---------- Tramos ----------

  controlTramo() {
    if (this.tramoProg < TM.tramoLen) return;
    if (this.tramoIdx < 2) this.siguienteTramo();
    else this.remate();
  }

  siguienteTramo() {
    this.tramoIdx++;
    this.tramoProg = 0;
    this.bgOff = 0;
    this.montarFondo(this.tramos[this.tramoIdx].bg, true);
    this.gapObst = 800;
    this.pausaAtaque = Math.max(this.pausaAtaque, 1.8);
    const nombre = this.tramos[this.tramoIdx].nombre;
    golpeTexto(this, ANCHO / 2, 330, `Tramo ${this.tramoIdx + 1} · ${nombre}`, COLOR.crema, 46).setDepth(800);
    sfx(this, 'campanita', { volume: 0.4 });
    this.time.delayedCall(700, () => { if (this.activo) this.vuperDice(sacarTM('vuper', FRASES_VUPER)); });
  }

  limpiar() {
    this.efimeros.forEach(o => { if (o && o.active) { this.tweens.killTweensOf(o); o.destroy(); } });
    this.efimeros = [];
    [...this.obst, ...this.charcos].forEach(o => { if (o.img.active) { this.tweens.killTweensOf(o.img); o.img.destroy(); } });
    this.refugios.forEach(r => { if (r.img.active) r.img.destroy(); if (r.flecha.active) r.flecha.destroy(); });
    this.obst = []; this.charcos = []; this.refugios = [];
    if (this.llamada) { this.llamada.icono.destroy(); this.llamada.etq.destroy(); this.llamada = null; }
    this.viento = null;
    this.dedo = null;
    this.dedoG.clear();
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
  }

  puntuar() {
    // Con los umbrales 800/1300/1750: llegar con 1 vida = 1★ (800-1270), con 2 = 2★ (1250-1720), sin que te pille = 3★.
    // Cada vida vale más que todo el extra (tiempo + esquivas, ≤ 470), así la estrella la decide cómo llegas.
    const base = 350 + this.vidas * 450 + Math.max(0, 75 - this.t) * 8 + Math.min(15, this.esquivadas) * 15;
    // Desde el nivel 4 la dificultad sube sola (this.dif) y la meta es la del 3★ (o +20 %/nivel sin `escala`). Los puntos
    // se escalan para que llegar con 2 vidas pase el nivel y con 1 no: sin esto, cada nivel pedía una partida sin un golpe.
    let f = 1;
    if (this.nivel > 3 && typeof metaNivel === 'function' && typeof MISIONES !== 'undefined') {
      f = Math.max(1, metaNivel('Tormenta', this.nivel) / MISIONES.Tormenta.umbrales[1]);
    }
    return Math.max(0, Math.round(base * f));
  }

  // ---------- Remate: tu cuarto, la puerta, el efecto que pasa y tu madre con un táper ----------

  remate() {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.limpiar();
    this.botones && this.botones.forEach(b => b.setVisible(false));
    this.madreCara('ancha', 'grito');
    const puntos = this.puntuar();
    cortinaHumo(this, () => {
      this.cuarto(puntos);
      destaparHumo(this);
    });
  }

  cuarto(puntos) {
    const D = 500;
    const bg = this.add.image(ANCHO / 2, ALTO / 2, 'bg-cuarto').setDepth(D);
    bg.setScale(Math.max(ANCHO / bg.width, ALTO / bg.height));
    const luzNoche = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x14102e, 0.3).setDepth(D + 1);
    // Vuper entra desde la izquierda, todavía hecho nube.
    const suelo = 640;
    const v = this.add.image(-120, suelo, 'vuper-reparto').setOrigin(0.5, 1).setFlipX(true).setDepth(D + 4);
    v.setScale(150 / v.height);
    // La puerta: marco y hoja que se cierra (a la izquierda, en primer plano).
    const puerta = this.add.container(190, 0).setDepth(D + 6);
    const pg = this.add.graphics();
    pg.fillStyle(HEX.tinta, 1).fillRect(-92, 80, 184, 560);
    pg.fillStyle(0x1a1228, 1).fillRect(-80, 92, 160, 548);
    const hoja = this.add.graphics();
    hoja.fillStyle(HEX.tinta, 1).fillRect(-80, 92, 160, 548);
    hoja.fillStyle(0x9a6232, 1).fillRect(-72, 100, 144, 532);
    hoja.fillStyle(0x7d4d26, 1).fillRect(-52, 130, 104, 190).fillRect(-52, 350, 104, 250);
    hoja.fillStyle(HEX.amarillo, 1).fillCircle(46, 380, 9);
    hoja.setScale(0.18, 1);
    hoja.x = -80;
    puerta.add([pg, hoja]);
    // Con el dibujo de Gemini (puerta entreabierta con su marco) en lugar de los rectángulos planos.
    // «Cerrar» es encoger la imagen hacia el marco y oscurecerla; «abrir», volver a su sitio.
    let puertaImg = null;
    if (this.textures.exists('obj-puerta-cuarto')) {
      puertaImg = this.add.image(0, 640, 'obj-puerta-cuarto').setOrigin(0.5, 1);
      puertaImg.setScale(540 / puertaImg.height);
      puerta.add(puertaImg);
      pg.setVisible(false); hoja.setVisible(false);
    }
    const moverHoja = (cierra, dur, ease, fin) => {
      if (!puertaImg) {
        this.tweens.add({ targets: hoja, scaleX: cierra ? 1 : 0.18, ...(cierra ? { x: -80 } : {}), duration: dur, ease, onComplete: fin });
        return;
      }
      const e = 540 / puertaImg.height;
      this.tweens.add({ targets: puertaImg, scaleX: cierra ? e * 0.86 : e, duration: dur, ease, onComplete: fin });
      puertaImg.setTint(cierra ? 0x9aa0b8 : 0xffffff);
    };
    this.tweens.add({ targets: v, x: 700, duration: 1100, ease: 'Sine.out' });
    // La puerta se cierra detrás de él.
    this.time.delayedCall(1100, () => {
      moverHoja(true, 260, 'Quad.in', () => sfx(this, 'puerta', { volume: 0.7 }));
      // Fuera, la tormenta refunfuña (apagada, sin sacudidas).
      this.time.delayedCall(320, () => sfx(this, 'temblor', { volume: 0.22 }));
    });
    this.time.delayedCall(1900, () => {
      this.hablaCuarto(700, suelo - 230, '(Puerta cerrada. Respira.)', 1400);
    });
    // El efecto pasa: el humo se va y Vuper queda en su forma de día.
    this.time.delayedCall(3200, () => {
      for (let i = 0; i < 6; i++) {
        const p = this.add.image(v.x + Phaser.Math.Between(-60, 60), v.y - Phaser.Math.Between(30, 140), 'fx-humo-puff').setDepth(D + 8).setScale(0.2).setAlpha(0.8);
        this.tweens.add({ targets: p, y: p.y - 130, scale: 0.55, alpha: 0, duration: 900, delay: i * 70, onComplete: () => p.destroy() });
      }
      sfx(this, 'deshinchar', { volume: 0.4 });
      this.time.delayedCall(450, () => {
        v.setTexture('vn-sorprendido').setFlipX(false).setScale(350 / v.height);
        sfx(this, 'suspiro', { volume: 0.4 });
      });
    });
    // Toc, toc: al otro lado, tu madre de día, con un táper.
    this.time.delayedCall(4800, () => {
      sfx(this, 'toc-toc', { volume: 0.6 });
      this.hablaCuarto(430, 250, 'Toc, toc.', 900, 'izq');
    });
    this.time.delayedCall(5800, () => {
      moverHoja(false, 260, 'Quad.out');
      sfx(this, 'puerta', { volume: 0.5 });
      const m = this.add.image(190, suelo + 6, 'n-madre-taper').setOrigin(0.5, 1).setDepth(D + 5);
      m.setScale(430 / m.height);
      m.x = 150;
      this.tweens.add({ targets: m, x: 410, duration: 700, ease: 'Sine.out' });
      const dice = (ms, x, y, str, cola, dur) => this.time.delayedCall(ms, () => this.hablaCuarto(x, y, str, dur, cola));
      dice(900, 480, 215, sacarTM('cena', MADRE_CENA), 'izq', 2200);
      this.time.delayedCall(3300, () => {
        v.setTexture('vn-hablando').setScale(350 / v.height);
        this.hablaCuarto(740, 215, 'Pasa, mamá.', 1700, 'abajo');
        const co = this.add.image(v.x + 20, v.y - 360, 'fx-corazon').setScale(0.1).setDepth(D + 9).setAlpha(0);
        this.tweens.add({ targets: co, y: co.y - 40, alpha: 1, duration: 500, yoyo: true, hold: 600, onComplete: () => co.destroy() });
      });
      dice(5200, 480, 215, sacarTM('chiste', MADRE_CHISTE), 'izq', 2000);
      this.time.delayedCall(7500, () => {
        const vidas = this.vidas;
        const linea = vidas === 3 ? 'Ni una gota. Aun así, ahora toca cenar.'
          : `Llegaste con ${vidas} ${vidas === 1 ? 'vida' : 'vidas'} y un táper por delante.`;
        panelFinal(this, { titulo: '¡Puerta cerrada!', linea: `${linea} Tiempo: ${Math.round(this.t)} s.`, puntos, clave: 'Tormenta', gana: true });
      });
    });
    void luzNoche;
  }

  hablaCuarto(x, y, str, ms, cola = 'abajo') {
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    const b = bocadillo(this, x, y, str, { tam: 28, ancho: 400, cola }).setDepth(520);
    this.vozActual = b;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
  }

  // ---------- Derrota: te alcanza del todo ----------

  derrota() {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.limpiar();
    this.botones && this.botones.forEach(b => b.setVisible(false));
    this.madreCara('ancha', 'grito');
    sfx(this, 'temblor', { volume: 0.4 });
    this.tweens.add({ targets: this.madre, x: this.px, y: 330, scale: 1.25, duration: 700, ease: 'Quad.in' });
    this.time.delayedCall(800, () => this.decir(Phaser.Math.Clamp(this.px + 250, 560, 1050), 200, '¡A TU CUARTO. YA!', 'izq', 1600));
    const pro = Math.min(1, (this.tramoIdx * TM.tramoLen + this.tramoProg) / (3 * TM.tramoLen));
    const puntos = Math.round(pro * 600);
    this.time.delayedCall(2100, () => panelFinal(this, {
      titulo: 'La tormenta te pilla',
      linea: `Llegaste al tramo ${this.tramoIdx + 1} de 3. Te cae una bronca con trueno y, cuando acaba, un táper.`,
      puntos, clave: 'Tormenta', gana: false,
    }));
  }
}

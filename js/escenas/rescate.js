// ¡Que no cunda el amarillo! La señal amarilla se enciende en el cuarto de Vuper,
// se pone la máscara y vuela por el cielo del barrio hasta la plaza: tiene que llevar
// dulce, salado y un resucitador y llegar a Blancaso antes que Puky (el reloj del ciclo).
// Mantener pulsado = subir (tiene tiro, como una chimenea); soltar = caer.

const META = 15000;          // píxeles de vuelo hasta la plaza
const LLEGADA_PUKY = 45;     // segundos que tarda Puky
const COMBO = [
  { clave: 'caramelo', nombre: 'el dulce' },
  { clave: 'patatas', nombre: 'el salado' },
  { clave: 'lata', nombre: 'el resucitador' },
];

// ---- Variante «el pesado» (capítulo «Monchiman, el pesado») ----
// Monchiman rescata a todo el que ve. En el cielo, además de los amarillos (hay que rescatarlos),
// vuela gente que está BIEN: rescatarla resta y suelta su reacción, sin nombrar nada.
const AMARILLOS_PESADO = [
  { sprite: 'blancaso-mareado', escala: 0.3, tinte: 0xffe45c },
  { sprite: 'lasslow-aguantando', escala: 0.32, tinte: 0xffe45c },
  { sprite: 'pompa-horror', escala: 0.3, tinte: 0xffe45c },
];
const BIEN_PESADO = [
  { sprite: 'cotine', escala: 0.3, frases: ['Me has quitado el postre.'] },
  { sprite: 'palicaso-contando', escala: 0.3, frases: ['…que era una historia muy buena.'] },
  { sprite: 'pompa-mira', escala: 0.32, frases: ['Yo no…', '…que exploto.'] },
  { sprite: 'lasslow-risa-floja', escala: 0.32, frases: ['Caballero, me estaba riendo. JA… perdón.'] },
  { sprite: 'puky-riendo', escala: 0.36, frases: ['¿Me llamabais?'] },
];
const RESCATE_PUNTOS = 60;   // por cada amarillo de verdad
const RESCATE_DE_MAS = 80;   // por cada rescate de más
const BARAJAS_PESADO = { bien: [], amarillo: [], partidas: [] }; // con memoria entre partidas

function sacarDeBaraja(clave, lista) {
  if (!BARAJAS_PESADO[clave].length) BARAJAS_PESADO[clave] = Phaser.Utils.Array.Shuffle([...lista]);
  return BARAJAS_PESADO[clave].pop();
}

// ¿Esta partida lleva la variante? Siempre en el capítulo del pesado; después, 1 de cada 3 (baraja).
function variantePesado(datos) {
  if (datos && typeof datos.pesado === 'boolean') return datos.pesado;
  if (typeof enCap === 'function' && enCap('pesado')) return true;
  if (typeof desdeCapId !== 'function' || !desdeCapId('pesado')) return false;
  if (!BARAJAS_PESADO.partidas.length) BARAJAS_PESADO.partidas = Phaser.Utils.Array.Shuffle([true, false, false]);
  return BARAJAS_PESADO.partidas.pop();
}

class Rescate extends Phaser.Scene {
  constructor() { super('Rescate'); }

  create(datos) {
    this.fase = 'cuarto';
    this.datos = datos;
    this.pulsando = false;
    this.pesado = variantePesado(datos);
    this.input.on('pointerdown', () => { this.pulsando = true; });
    this.input.on('pointerup', () => { this.pulsando = false; });
    this.tecla = this.input.keyboard.addKey('SPACE');
    this.cuarto();
    entrar(this, datos);
  }

  // ---- 1. La señal amarilla ----
  cuarto() {
    this.capaCuarto = this.add.container(0, 0);
    const apagado = fondo(this, 'bg-cuarto-apagado');
    const encendido = fondo(this, 'bg-cuarto').setAlpha(0);
    const vuper = this.add.image(640, 500, 'vuper-colocado').setScale(0.7);
    flotar(this, vuper);
    this.capaCuarto.add([apagado, encendido, vuper]);
    const espera = this.datos && this.datos.rotulo ? 1900 : 700;

    this.time.delayedCall(espera, () => {
      if (this.fase !== 'cuarto') return; // ya ha despegado: el cuarto no existe
      sfx(this, 'zumbido-m');
      this.tweens.chain({
        targets: encendido,
        tweens: [{ alpha: 1, duration: 60 }, { alpha: 0, duration: 90 }, { alpha: 1, duration: 60 }, { alpha: 0.4, duration: 120 }, { alpha: 1, duration: 100 }],
      });
      this.capaCuarto.add(texto(this, 640, 90, '¡SEÑAL AMARILLA!', 64, COLOR.amarillo));
      this.capaCuarto.add(texto(this, 640, 160, 'A Blancaso le ha dado un amarillo en la plaza.\nPuky ya viene de camino.', 28, COLOR.crema));
      cambiarPose(this, vuper, 'vuper');
    });
    this.time.delayedCall(espera + 1600, () => {
      if (this.fase !== 'cuarto') return; // ya ha despegado: el cuarto no existe
      sfx(this, 'tiroriro');
      cambiarPose(this, vuper, 'monchiman');
      // Sin destello: un aro amarillo sale de Monchiman.
      const aro = this.add.circle(vuper.x, vuper.y - 80, 50).setStrokeStyle(8, 0xffd23f, 0.9).setDepth(60);
      if (this.capaCuarto) this.capaCuarto.add(aro);
      this.tweens.add({ targets: aro, scale: 3, alpha: 0, duration: 450, ease: 'Sine.out', onComplete: () => aro.destroy() });
      this.capaCuarto.add(bocadillo(this, 900, 430, '¡Que no cunda el amarillo!', { tam: 30, cola: 'izq' }));
    });
    this.time.delayedCall(espera + 3000, () => {
      const b = boton(this, 640, 668, 'Volar (mantén pulsado)', () => this.despegar(), { ancho: 440, alto: 64, tam: 26 });
      this.capaCuarto.add(b);
      this.input.keyboard.once('keydown-SPACE', () => this.despegar());
    });
  }

  despegar() {
    if (this.fase !== 'cuarto') return;
    this.fase = 'despegando';
    cortinaHumo(this, () => {
      this.capaCuarto.destroy();
      this.vuelo();
      destaparHumo(this);
    });
  }

  // ---- 2. El vuelo ----
  vuelo() {
    this.cielo = this.add.tileSprite(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 'bg-cielo');
    this.heroe = this.add.image(300, 360, 'monchiman-picado').setScale(-0.42, 0.42).setDepth(10);
    this.vy = 0;
    this.distancia = 0;
    this.tiempo = 0;
    this.lento = 0;
    this.cosas = [];
    this.proximo = 0.6;
    this.llevo = { caramelo: 0, patatas: 0, lata: 0 };
    this.extras = 0;
    this.avisoPuky = false;
    this.rescatados = 0;   // amarillos de verdad (variante del pesado)
    this.deMas = 0;        // rescates de más
    this.reaccion = null;
    this.textoGente = null;
    if (this.pesado) this.prepararPesado();

    // Carrera: Monchiman y Puky hacia Blancaso.
    this.add.rectangle(640, 30, 620, 6, HEX.crema).setDepth(20);
    this.add.rectangle(640, 66, 620, 6, 0xf5d23a).setDepth(20);
    this.add.image(970, 42, 'blancaso-mareado').setScale(0.13).setDepth(20);
    this.iconoHeroe = this.add.image(330, 28, 'monchiman').setScale(0.08).setDepth(21);
    this.iconoPuky = this.add.image(330, 64, 'puky').setScale(0.08).setDepth(21);

    // La mochila: los tres del combo, apagados hasta que se cogen.
    this.huecos = COMBO.map((c, i) => {
      const img = this.add.image(60 + i * 80, 670, c.clave).setScale(0.3).setDepth(20).setTint(0x333333).setAlpha(0.6);
      return img;
    });
    this.textoExtras = texto(this, 330, 670, '', 26, COLOR.crema).setDepth(20);
    this.fase = 'vuelo';
  }

  // Marcador pequeño y la línea de Blancaso (se apaga sola: nada que tape el vuelo).
  prepararPesado() {
    this.textoGente = texto(this, 1230, 670, '', 24, COLOR.crema).setOrigin(1, 0.5).setDepth(20);
    this.pintarGente();
    const b = bocadillo(this, 640, 126, 'El amarillo se nota en la cara. Lo demás es gente pasándoselo bien.', { ancho: 760, tam: 24, cola: 'izq' }).setDepth(30);
    b.add(this.add.image(-b.anchoB / 2 - 34, 0, 'blancaso-esperanza').setScale(0.11));
    this.avisoBlancaso = b;
    this.time.delayedCall(4800, () => {
      if (!b.active) return;
      this.tweens.add({ targets: b, alpha: 0, duration: 500, onComplete: () => b.destroy() });
    });
  }

  pintarGente() {
    if (this.textoGente) this.textoGente.setText(`Rescates ${this.rescatados} · de más ${this.deMas}`);
  }

  // Un personaje del cielo: amarillo (tinte, sudor, mareo) o bien (color normal, chispas alegres).
  nuevaGente(y) {
    const amarillo = Math.random() < 0.4;
    const def = amarillo ? sacarDeBaraja('amarillo', AMARILLOS_PESADO) : sacarDeBaraja('bien', BIEN_PESADO);
    const img = this.add.image(0, 0, def.sprite).setScale(def.escala);
    if (amarillo) img.setTint(def.tinte);
    const partes = [img];
    const emo = amarillo ? 'fx-gota-sudor' : 'fx-chispas';
    const tw = [];
    if (this.textures.exists(emo)) {
      const m = this.add.image(img.displayWidth * 0.42, -img.displayHeight * 0.45, emo);
      m.setScale((amarillo ? 54 : 46) / m.height);
      partes.push(m);
      tw.push({ targets: m, scale: m.scale * 1.25, duration: amarillo ? 260 : 520, yoyo: true, repeat: -1 });
      if (amarillo && this.textures.exists('fx-estrellas-mareo')) {
        const e = this.add.image(0, -img.displayHeight * 0.52, 'fx-estrellas-mareo');
        e.setScale(44 / e.height);
        partes.push(e);
        tw.push({ targets: e, angle: 360, duration: 1400, repeat: -1 });
      }
    }
    const o = this.add.container(1400, y, partes);
    tw.forEach(t => this.tweens.add(t));
    // Al irse el personaje, sus tweens de adorno se van con él (nada actúa sobre piezas destruidas).
    o.once('destroy', () => { if (this.tweens) this.tweens.killTweensOf(partes); });
    o.tipo = 'gente';
    o.amarillo = amarillo;
    o.def = def;
    o.img = img;
    o.y0 = y;
    o.getBounds = () => new Phaser.Geom.Rectangle(o.x - img.displayWidth * 0.4, o.y - img.displayHeight * 0.45, img.displayWidth * 0.8, img.displayHeight * 0.9);
    return o;
  }

  choqueGente(o) {
    o.tocado = true;
    if (o.amarillo) {
      this.rescatados++;
      this.pintarGente();
      o.img.clearTint();
      sfx(this, 'campanita', { volume: 0.5 });
      if (typeof Comic !== 'undefined') Comic.emote(this, o.x, o.y - 80, 'corazon');
      golpeTexto(this, o.x, o.y - 110, '¡Rescatado!', COLOR.verde, 30);
      this.tweens.add({ targets: o, y: o.y - 160, alpha: 0, duration: 700 });
      return;
    }
    // Estaba bien: un rescate de más. Resta y suelta su frase.
    this.deMas++;
    sumarStat('rescates_mas');
    this.pintarGente();
    this.lento = 1.0;
    this.cameras.main.shake(160, 0.006);
    sfx(this, 'boing', { volume: 0.4 });
    this.tweens.add({ targets: o, y: o.y + 120, alpha: 0, duration: 800, delay: 400 });
    this.decir(o, o.def.frases);
  }

  // Una voz a la vez: la frase anterior se retira antes de soltar la nueva.
  decir(o, frases) {
    const x = Phaser.Math.Clamp(o.x, 260, ANCHO - 260);
    const y = Phaser.Math.Clamp(o.y - 130, 190, 520);
    const poner = (txt, ms) => {
      if (!this.sys || !this.sys.isActive() || this.fase !== 'vuelo') return;
      if (this.reaccion && this.reaccion.active) this.reaccion.destroy();
      const b = bocadillo(this, x, y, txt, { ancho: 420, tam: 26 }).setDepth(60);
      this.reaccion = b;
      this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
    };
    poner(frases[0], frases.length > 1 ? 1100 : 2300);
    if (frases.length > 1) this.time.delayedCall(1300, () => poner(frases[1], 2100));
  }

  nuevaCosa() {
    const r = Math.random();
    const y = Phaser.Math.Between(110, 620);
    let o;
    if (this.pesado && r > 0.62) {
      o = this.nuevaGente(y);
    } else if (r < 0.45) {
      // Lo que falta sale más a menudo, para que no se haga eterno.
      const faltan = COMBO.filter(c => !this.llevo[c.clave]);
      const c = faltan.length && Math.random() < 0.6 ? Phaser.Utils.Array.GetRandom(faltan) : Phaser.Utils.Array.GetRandom(COMBO);
      o = this.add.image(1380, y, c.clave).setScale(0.32);
      o.tipo = 'item';
      o.clave = c.clave;
      this.tweens.add({ targets: o, angle: { from: -12, to: 12 }, duration: 500, yoyo: true, repeat: -1 });
    } else if (r < 0.8) {
      o = this.add.image(1400, y, 'humo').setScale(Phaser.Math.FloatBetween(0.7, 1.1)).setTint(0x4a3a5c);
      o.tipo = 'humo';
    } else {
      o = this.add.image(1400, y, 'perico-volando').setScale(-0.32, 0.32);
      o.tipo = 'perico';
      o.y0 = y;
    }
    o.setDepth(9);
    this.cosas.push(o);
  }

  update(_t, dms) {
    if (this.fase !== 'vuelo') return;
    const dt = Math.min(dms / 1000, 0.05);
    this.tiempo += dt;

    const sube = this.pulsando || this.tecla.isDown;
    this.vy += (sube ? -1700 : 950) * dt;
    this.vy = Phaser.Math.Clamp(this.vy, -520, 560);
    this.heroe.y += this.vy * dt;
    if (this.heroe.y < 70) { this.heroe.y = 70; this.vy = 0; }
    if (this.heroe.y > 650) { this.heroe.y = 650; this.vy = 0; }
    this.heroe.setAngle(-20 + this.vy * 0.04);

    const vel = (this.lento > 0 ? 140 : 400) * (tiene('mascara') ? 1.15 : 1);
    this.lento -= dt;
    this.heroe.setAlpha(this.lento > 0 ? 0.5 + 0.5 * Math.abs(Math.sin(this.time.now / 60)) : 1);
    this.distancia += vel * dt;
    this.cielo.tilePositionX += vel * dt * 0.5;

    this.proximo -= dt;
    if (this.proximo <= 0) {
      this.nuevaCosa();
      this.proximo = Phaser.Math.FloatBetween(0.45, 0.85);
    }
    const caja = new Phaser.Geom.Rectangle(this.heroe.x - 70, this.heroe.y - 60, 140, 120);
    this.cosas = this.cosas.filter(o => {
      o.x -= vel * dt * 1.4;
      if (o.tipo === 'perico') o.y = o.y0 + Math.sin(this.tiempo * 4 + o.x / 120) * 40;
      else if (o.tipo === 'gente' && !o.tocado) o.y = o.y0 + Math.sin(this.tiempo * 2 + o.x / 160) * 14;
      if (!o.tocado && Phaser.Geom.Intersects.RectangleToRectangle(caja, o.getBounds())) { if (o.tipo === 'gente') this.choqueGente(o); else this.choque(o); }
      if (o.x < -200 || o.alpha === 0) { o.destroy(); return false; }
      return true;
    });

    // Carrera.
    const fHeroe = Math.min(1, this.distancia / META);
    const fPuky = Math.min(1, this.tiempo / LLEGADA_PUKY);
    this.iconoHeroe.x = 330 + 620 * fHeroe;
    this.iconoPuky.x = 330 + 620 * fPuky;
    if (fPuky > 0.8 && !this.avisoPuky) {
      this.avisoPuky = true;
      sfx(this, 'blurp');
      golpeTexto(this, 640, 140, '¡Puky viene de camino!', COLOR.rojo, 44);
    }
    if (fPuky >= 1) return this.llegaPuky();
    if (fHeroe >= 1) {
      const falta = COMBO.find(c => !this.llevo[c.clave]);
      if (!falta) return this.llegaMonchiman(LLEGADA_PUKY - this.tiempo);
      if (!this.avisoFalta || this.time.now - this.avisoFalta > 2500) {
        this.avisoFalta = this.time.now;
        golpeTexto(this, 640, 200, `¡Te falta ${falta.nombre}!`, COLOR.amarillo, 44);
      }
    }
  }

  choque(o) {
    o.tocado = true;
    if (o.tipo === 'item') {
      const i = COMBO.findIndex(c => c.clave === o.clave);
      if (this.llevo[o.clave]) {
        this.extras++;
        this.textoExtras.setText(`+${this.extras} extra`);
      } else {
        this.huecos[i].clearTint().setAlpha(1);
        this.tweens.add({ targets: this.huecos[i], scale: 0.42, duration: 150, yoyo: true });
      }
      this.llevo[o.clave]++;
      sfx(this, 'campanita', { volume: 0.5 });
      this.tweens.add({ targets: o, x: this.huecos[i].x, y: this.huecos[i].y, scale: 0.1, duration: 300, onComplete: () => o.setVisible(false) });
      return;
    }
    this.lento = 1.4;
    this.cameras.main.shake(200, 0.01);
    if (o.tipo === 'perico') {
      sfx(this, 'pin-pin');
      golpeTexto(this, this.heroe.x, this.heroe.y - 90, '¡PIN PIN!', COLOR.amarillo, 40);
    } else {
      sfx(this, 'tos', { volume: 0.6 });
      golpeTexto(this, this.heroe.x, this.heroe.y - 90, '¡Cof!', COLOR.crema, 40);
    }
  }

  // ---- 3. La plaza ----
  plaza(alMontar) {
    this.fase = 'final';
    cortinaHumo(this, () => {
      this.children.list.forEach(c => this.tweens.killTweensOf(c));
      this.children.removeAll(true);
      fondo(this, 'bg-plaza');
      this.blancaso = this.add.image(640, 560, 'blancaso-mareado').setScale(0.55);
      flotar(this, this.blancaso, { amplitud: 4 });
      alMontar();
      destaparHumo(this);
    });
  }

  // Lo que suman los amarillos y restan los rescates de más (solo en la variante).
  puntosPesado() {
    return this.pesado ? this.rescatados * RESCATE_PUNTOS - this.deMas * RESCATE_DE_MAS : 0;
  }

  llegaMonchiman(margen) {
    sumarStat('rescates');
    const puntos = Math.max(0, Math.round(margen * 100) + this.extras * 40 + this.puntosPesado());
    const lineaPesado = this.pesado ? ` ${this.rescatados} rescate${this.rescatados === 1 ? '' : 's'} de verdad y ${this.deMas} de más.` : '';
    this.plaza(() => {
      const heroe = this.add.image(900, -200, 'monchiman').setScale(0.5);
      this.tweens.add({ targets: heroe, y: 420, duration: 700, ease: 'Back.out', delay: 500 });
      this.time.delayedCall(700, () => sfx(this, 'fiuuu'));
      this.time.delayedCall(1500, () => {
        COMBO.forEach((c, i) => {
          const o = this.add.image(900, 420, c.clave).setScale(0.3);
          this.tweens.add({ targets: o, x: 600 + i * 40, y: 500, scale: 0.1, alpha: 0, duration: 500, delay: i * 200 });
        });
        sfx(this, 'campanita');
      });
      this.time.delayedCall(2400, () => {
        cambiarPose(this, this.blancaso, 'blancaso-esperanza');
        sfx(this, 'aaah', { volume: 0.6 });
        bocadillo(this, 900, 260, '¡Que no cunda el amarillo!', { tam: 28 });
      });
      this.time.delayedCall(3800, () => panelFinal(this, {
        titulo: '¡Rescatado!',
        linea: `Llegaste ${margen.toFixed(1)} s antes que Puky. A Blancaso se le limpian los ojos.${lineaPesado}`,
        puntos, clave: 'Rescate', extraMonchis: this.datos && this.datos.senal ? 2 : 1,
      }));
    });
  }

  llegaPuky() {
    const puntos = Math.max(0, Math.round(Math.min(this.extras * 10, 150) + this.puntosPesado() / 3));
    this.plaza(() => {
      const puky = this.add.image(1500, 600, 'puky-que-rico').setScale(0.55);
      this.tweens.add({ targets: puky, x: 880, duration: 900, ease: 'Sine.out', delay: 400 });
      this.time.delayedCall(1300, () => {
        sfx(this, 'puky-gracioso');
        bocadillo(this, 900, 330, '¿Me llamabais?', { tam: 32 });
        cambiarPose(this, this.blancaso, 'blancaso-mareado');
      });
      this.time.delayedCall(3000, () => panelFinal(this, {
        titulo: 'Puky llegó primero',
        linea: 'Nadie le había llamado. Como siempre.',
        puntos, clave: 'Rescate', gana: false,
      }));
    });
  }
}

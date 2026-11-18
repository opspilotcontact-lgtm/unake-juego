// Las casetas de la feria: un tablón con tres huecos de ficha (tiro, noria y martillo), en cualquier orden.
// - Tiro: es la escena TiroPato (no se toca). Se lanza desde el tablón y, al volver, la ficha se concede si
//   se superó su primer umbral (stat gana_TiroPato, que apunta panelFinal) desde que se abrió el tablón.
// - Noria: vista lateral. Cada pasajero pesa y se mueve a su manera; la noria se inclina y hay que compensar
//   empujando (← →) y frenando (Espacio) durante 40 s. Si se pasa del límite, se pierde una de tres vidas.
// - Martillo: la barra sube y baja con velocidad cambiante; tres golpes y el feriante cambia la regla de cada
//   uno (rápido, con finta, a ciegas bajo una lona, de vaivén). Dos campanazos dan la ficha.
// Las fichas se guardan en ESTADO.casetas aunque se salga. Con las tres se cierra la feria por panelFinal.

if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Casetas = 'estrella';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.Casetas = ['palicaso-riendo', UNAKE.amarillo];
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Casetas = 'minijuego';

const CA = {
  limite: 26,          // grados de inclinación a partir de los que se vuelca
  alto: 350,           // altura del eje sobre la base
  radio: 190,
  px: 600, py: 660,    // base de la noria
  duracion: 40,
  umbralMartillo: 2,   // campanazos para la ficha
  fichaPts: 300,
  cab: 1.25,           // tamano de las cabinas
};

const FRASES_CASETAS = {
  tablon: ['Pasen, pasen. Tres casetas, tres fichas.', 'Con tres fichas se lleva el peluche. Casi.', 'Elija caseta. El tiempo es humo.', 'Hoy hay de todo menos cola.', 'Una ficha por caseta. Las normas son las normas.', 'Si no sabe por dónde empezar, empiece por donde huela a churro.'],
  vuelve: ['Otra vez por aquí. Eso es fidelidad.', 'Le guardo las fichas, no se preocupe.', 'Quedan casetas. Siempre quedan casetas.', 'El tablón no se va a ninguna parte.'],
  fichaTiro: ['Esa ficha se la ganó el pato.', 'Veo que los patos le temen. Ficha para usted.', 'Puntería de feria. Ficha puesta.'],
  noriaIni: ['Que no se vuelque nadie, que luego pagan seguro.', 'Empuje hacia el lado contrario. Y frene si va a más.', 'La noria es vieja, pero tiene carácter.', 'Suave, suave. Que no es una batidora.'],
  susto: ['¡Eh, eh! ¡Que ahí va gente!', 'Un susto menos. Cuidado con el siguiente.', '¡Equilibrio, caballero!', 'Se me cae la clientela.', 'Eso ha crujido. Eso no es bueno.'],
  lasslow: ['Ese se ríe y la cabina bota.', '¡Que alguien le cuente algo triste!', 'Cuando se ríe, agárrese.', 'Es el único que se ríe de su propio billete.'],
  cotine: ['Eso era algodón, ¿verdad?', 'Come y pesa. Ley de feria.', 'No me mire el género, que es de la casa.'],
  pompa: ['La señorita sube sola.', 'Esa va a tocar el cielo.', 'Ligerita. Demasiado.'],
  palicaso: ['Ese no para quieto ni pagando.', 'Que se siente, por favor.', '¡No salude a todo el mundo!', 'Esa cabina no es una pista de baile.'],
  perico: ['¡El pájaro cambia de cabina!', 'Pin pin, dice. Y se cambia.', 'Los pájaros no pagan billete.', 'Ese se cree que tiene asiento fijo.'],
  bien: ['Así, así. Suave.', 'Eso es mano de feriante.', 'Perfecto. Casi sospechoso.', 'Ni una arruga en la noria.', 'Mire qué elegancia.'],
  noriaOk: ['Todos arriba y todos abajo. ¡Ficha!', 'Ni una cabina volcada. Ficha para usted.', 'La noria y yo estamos muy orgullosos. Ficha.'],
  noriaKo: ['La noria necesita un descanso. Y los pasajeros, una estampita.', 'Se vuelca más que mi paciencia. Pruebe otra vez.', 'Hoy no. Pero la noria sigue ahí.'],
  marIni: ['A ver ese brazo. Tres golpes.', 'La campana está arriba. El brazo, abajo.', 'No es fuerza, es ritmo. Aunque todos creen que es fuerza.'],
  vaiven: ['Este va a su aire.', 'Normal. De los de toda la vida.', 'Este sube y baja como mi sueldo.'],
  rapido: ['Este va con prisa.', 'Rápido, rápido, que hay cola.', 'Este no espera ni a su madre.'],
  finta: ['Ojo, que este se hace el tonto.', 'Mire lo que no es.', 'Este engaña. Como el algodón.', 'Se para, pero no se fíe.'],
  ciegas: ['Bajo la lona un instante. Escuche el ritmo.', 'A ciegas, que es más feria.', 'Ahora no mire. Sienta.'],
  campana: ['¡CLANG! ¡La campana!', 'Eso se oye en el barrio de al lado.', '¡Hasta las bombillas!', 'La campana ha subido hasta las bombillas.'],
  flojo: ['Eso ha sido un cosquilleo.', 'El mazo casi ni se ha enterado.', 'Con cariño, pero sin fuerza.', 'Casi. Casi, casi.'],
  tarde: ['Se le enfrió el brazo.', 'Eso se llama pensárselo demasiado.', 'El golpe se fue sin usted.'],
  marOk: ['Dos campanazos. ¡Ficha!', 'Un brazo con ritmo. Ficha.', 'La campana le debe una cerveza. Ficha.'],
  marKo: ['Dos campanazos o no hay ficha. Pruebe otra vez.', 'La campana no se ha enterado. Otra ronda.', 'El mazo le ha ganado hoy. Mañana, quizá.'],
  cierre: ['¡Tres fichas! Cierro la feria. Por hoy.', 'Se las ha llevado todas. Le dejo hasta el peluche.'],
};
// Memoria entre partidas: ninguna frase se repite hasta agotar su tramo.
const BOLSAS_CASETAS = {};
function fraseCaseta(tipo) {
  const lista = FRASES_CASETAS[tipo];
  if (!BOLSAS_CASETAS[tipo] || !BOLSAS_CASETAS[tipo].length) {
    const nueva = Phaser.Utils.Array.Shuffle([...lista]);
    // Que la primera de la bolsa nueva no sea la última que acaba de salir.
    if (BOLSAS_CASETAS[tipo + '_u'] && nueva.length > 1 && nueva[nueva.length - 1] === BOLSAS_CASETAS[tipo + '_u']) nueva.unshift(nueva.pop());
    BOLSAS_CASETAS[tipo] = nueva;
  }
  const f = BOLSAS_CASETAS[tipo].pop();
  BOLSAS_CASETAS[tipo + '_u'] = f;
  return f;
}

// Pasajeros de la noria: qué sprite usan y a qué altura se pintan.
const PASAJEROS = {
  lasslow: { tex: 'lasslow', alto: 82 },
  palicaso: { tex: 'palicaso', alto: 82 },
  pompa: { tex: 'pompa', alto: 76 },
  cotine: { tex: 'cotine', alto: 78 },
  perico: { tex: 'perico', alto: 58 },
};
const SUBEN = [['lasslow', 0], ['palicaso', 4], ['pompa', 9], ['cotine', 15], ['perico', 22]];

// Patrones del martillo: lista de tramos [destino 0-1, segundos]. Los peaks se sortean en cada vuelta.
const REGLAS_MARTILLO = {
  vaiven: { nombre: 'A SU AIRE', color: HEX.verde, tramos: () => [[Phaser.Math.FloatBetween(0.86, 1), Phaser.Math.FloatBetween(0.8, 1.6)], [Phaser.Math.FloatBetween(0, 0.12), Phaser.Math.FloatBetween(0.7, 1.4)]] },
  rapido: { nombre: 'RÁPIDO', color: HEX.rosa, tramos: () => [[Phaser.Math.FloatBetween(0.88, 1), Phaser.Math.FloatBetween(0.45, 0.6)], [Phaser.Math.FloatBetween(0, 0.1), Phaser.Math.FloatBetween(0.45, 0.6)]] },
  finta: { nombre: 'CON FINTA', color: HEX.amarillo, tramos: () => [[0.74, 0.4], [0.74, 0.65], [0.2, 0.35], [1, 0.3], [0.05, 0.85]] },
  ciegas: { nombre: 'A CIEGAS', color: HEX.azul, tramos: () => [[Phaser.Math.FloatBetween(0.88, 1), Phaser.Math.FloatBetween(1.0, 1.25)], [Phaser.Math.FloatBetween(0, 0.1), Phaser.Math.FloatBetween(1.0, 1.25)]] },
};
let BOLSA_REGLAS = [];

class Casetas extends Phaser.Scene {
  constructor() { super('Casetas'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la escena.
    this.modo = 'tablon';
    this.gen = 0;
    this.capa = null;
    this.vozActual = null;
    this.ultimaFrase = -9;
    this.ctl = { izq: false, der: false, freno: false };
    this.mandos = [];
    this.n = null;
    this.m = null;
    this._acabado = false;
    const nivel = typeof nivelDe === 'function' ? nivelDe('Casetas') : 1;
    this.nivel = nivel;
    this.dif = 1 + 0.1 * Math.min(nivel - 1, 8);
    this.leerEstado();

    fondo(this, enMundoHumo() && this.textures.exists('bg-feria') ? 'bg-feria' : (this.textures.exists('bgn-feria') ? 'bgn-feria' : 'bg-plaza')).setDepth(0);
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.45).setDepth(1);
    this.bombillas();
    this.crearFeriante();

    this.teclas = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,A,D,SPACE,ENTER');
    this.input.addPointer(2);
    this.input.keyboard.on('keydown-ONE', () => this.elegir('tiro'));
    this.input.keyboard.on('keydown-TWO', () => this.elegir('noria'));
    this.input.keyboard.on('keydown-THREE', () => this.elegir('martillo'));
    this.input.keyboard.on('keydown-SPACE', () => this.accionPrincipal());
    this.input.keyboard.on('keydown-ENTER', () => this.accionPrincipal());
    this.input.keyboard.on('keydown-ESC', () => this.salir());
    this.input.on('pointerdown', (p, sobre) => { if (!sobre.length && this.modo === 'martillo') this.golpear(); });
    this.input.on('pointerup', p => this.mandos.forEach(b => { if (b.pid === p.id) { b.pid = null; this.ctl[b.tecla] = false; } }));

    entrar(this, datos);
    this._acabado = false;
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 300, () => this.tablon(true));
  }

  // ---------- Estado guardado ----------

  leerEstado() {
    const c = ESTADO.casetas = ESTADO.casetas || {};
    if (c.baseTiro === undefined) c.baseTiro = 0;
    ['tiro', 'noria', 'martillo'].forEach(k => { c[k] = !!c[k]; });
    c.pNoria = c.pNoria || 0;
    c.pMartillo = c.pMartillo || 0;
    this.c = c;
  }
  fichasN() { return ['tiro', 'noria', 'martillo'].filter(k => this.c[k]).length; }
  ganasTiro() { return typeof stat === 'function' ? stat('gana_TiroPato') : 0; }
  revisarTiro() {
    if (!this.c.tiro && this.ganasTiro() > this.c.baseTiro) {
      this.c.tiro = true;
      if (typeof sumarStat === 'function') sumarStat('feriaFichas');
      guardarPartida();
      return true;
    }
    return false;
  }
  puntosTotales() { return this.fichasN() * CA.fichaPts + this.c.pNoria + this.c.pMartillo; }

  // ---------- Piezas comunes ----------

  bombillas() {
    const g = this.add.graphics().setDepth(2);
    g.lineStyle(5, HEX.tinta, 1).beginPath().moveTo(0, 22);
    for (let x = 0; x <= ANCHO; x += 40) g.lineTo(x, 22 + Math.sin(x / 40 * Math.PI) * 10);
    g.strokePath();
    this.luces = [];
    for (let x = 20, i = 0; x < ANCHO; x += 40, i++) {
      const y = 22 + Math.sin((x + 20) / 40 * Math.PI) * 10 + 8;
      const b = this.add.circle(x, y, 8, [HEX.amarillo, HEX.rosa, HEX.azul][i % 3]).setStrokeStyle(3, HEX.tinta).setDepth(3);
      this.luces.push(b);
    }
    this.tweens.add({ targets: this.luces.filter((_, i) => i % 2), alpha: 0.35, duration: 420, yoyo: true, repeat: -1 });
  }

  crearFeriante() {
    this.ferC = this.add.container(150, 700).setDepth(20);
    this.fer = this.add.image(0, 0, 'feriante').setOrigin(0.5, 1);
    this.ferC.add(this.fer);
    this.ferAlto = 260;
    this.fer.setScale(this.ferAlto / this.fer.height);
    this.tweens.add({ targets: this.fer, angle: 1.6, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  ponerFeriante(modo) {
    this.ferAlto = modo === 'tablon' ? 260 : 190;
    if (modo === 'tablon') this.ferC.setPosition(150, 700);
    else this.ferC.setPosition(1150, 575);
    this.fer.setScale(this.ferAlto / this.fer.height);
  }

  cambiarFeriante(contento) {
    if (!this.textures.exists('feriante-emocionado')) return;
    this.fer.setTexture(contento ? 'feriante-emocionado' : 'feriante');
    this.fer.setScale(this.ferAlto / this.fer.height);
    if (contento) this.time.delayedCall(1500, () => { if (this.fer.active) this.cambiarFeriante(false); });
  }

  // Frase del feriante; una voz a la vez. Lo que no corre prisa no interrumpe.
  dice(tipo, siempre = false, ms = 2000) {
    const ahora = this.time.now / 1000;
    if (!siempre && (ahora - this.ultimaFrase < 3 || (this.vozActual && this.vozActual.active))) return;
    this.ultimaFrase = ahora;
    if (this.vozActual && this.vozActual.active) this.vozActual.destroy();
    const f = this.ferC;
    const tablon = this.modo === 'tablon';
    const b = bocadillo(this, tablon ? 190 : f.x - 130, tablon ? 395 : f.y - this.ferAlto - 30, fraseCaseta(tipo), { tam: 26, ancho: 320, cola: tablon ? 'abajo' : 'der' }).setDepth(95);
    this.vozActual = b;
    this.time.delayedCall(ms, () => { if (b.active) b.destroy(); });
  }

  // Cada modo pinta en su capa; al cambiar de modo se tira entera (y sus tweens).
  limpiar() {
    this.gen++;
    if (this.capa) {
      const rec = o => { this.tweens.killTweensOf(o); if (o.list) o.list.forEach(rec); };
      rec(this.capa);
      this.capa.destroy();
    }
    this.capa = this.add.container(0, 0).setDepth(10);
    this.ctl = { izq: false, der: false, freno: false };
    this.mandos = [];
    this.n = null;
    this.m = null;
  }
  espera(ms, fn) {
    const g = this.gen;
    this.time.delayedCall(ms, () => { if (g === this.gen && !this._acabado) fn(); });
  }

  // Botón grande para el dedo: mantiene this.ctl[tecla] mientras se pulsa (o dispara alPulsar).
  mando(x, y, w, h, { tecla, icono, etiqueta, color = HEX.amarillo, alPulsar }) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22);
    g.fillStyle(color, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    g.lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    c.add(g);
    if (icono) {
      const t = this.add.graphics();
      t.fillStyle(HEX.tinta, 1);
      const s = icono === 'izq' ? -1 : 1;
      t.fillTriangle(s * 26, 0, -s * 22, -34, -s * 22, 34);
      c.add(t);
    }
    if (etiqueta) c.add(this.add.text(0, 0, etiqueta, { fontFamily: FUENTE, fontSize: `${MOVIL ? 34 : 28}px`, color: COLOR.tinta, align: 'center', wordWrap: { width: w - 20 } }).setOrigin(0.5));
    c.setSize(w, h).setInteractive();
    const b = { tecla, pid: null };
    this.mandos.push(b);
    c.on('pointerdown', p => {
      c.setScale(0.94);
      if (alPulsar) alPulsar();
      else { b.pid = p.id; this.ctl[tecla] = true; }
    });
    const suelta = () => c.setScale(1);
    c.on('pointerup', suelta);
    c.on('pointerout', () => { suelta(); if (!alPulsar && b.pid !== null) { b.pid = null; this.ctl[tecla] = false; } });
    return c;
  }

  moneda(x, y, r, tiene) {
    const g = this.add.graphics({ x, y });
    g.fillStyle(HEX.tinta, 1).fillCircle(0, 3, r + 5);
    g.fillStyle(tiene ? HEX.amarillo : 0x4a3d5c, 1).fillCircle(0, 0, r);
    g.lineStyle(4, HEX.tinta, 1).strokeCircle(0, 0, r);
    g.fillStyle(tiene ? 0xffe680 : 0x5d4f72, 1).fillCircle(0, 0, r * 0.62);
    if (tiene) { g.fillStyle(HEX.tinta, 1); g.fillStar ? g.fillStar(0, 0, 5, r * 0.18, r * 0.42) : g.fillCircle(0, 0, r * 0.2); }
    return g;
  }
  puffHumo(x, y, esc, tinte = 0xffffff) {
    if (!this.textures.exists('fx-humo-puff')) return;
    const p = this.add.image(x, y, 'fx-humo-puff').setDepth(15).setTint(tinte).setAlpha(0.8);
    p.setScale(esc * 80 / p.height);
    this.tweens.add({ targets: p, y: y - 90, scale: p.scale * 1.7, alpha: 0, duration: 1300, ease: 'Sine.out', onComplete: () => p.destroy() });
  }

  accionPrincipal() {
    if (this.modo === 'martillo') this.golpear();
  }
  salir() {
    if (this._acabado || this.panelAbierto) return;
    irA(this, 'Barrio');
  }

  // ---------- El tablón ----------

  tablon(primero) {
    this.modo = 'tablon';
    this.limpiar();
    this.ponerFeriante('tablon');
    const c = this.capa;
    const nuevo = this.revisarTiro();
    c.add(texto(this, ANCHO / 2 + 110, 80, 'LAS CASETAS', 64, COLOR.amarillo));
    // Fichas del conjunto.
    const n = this.fichasN();
    [0, 1, 2].forEach(i => c.add(this.moneda(ANCHO / 2 + 18 + i * 58 + 56, 142, 20, i < n)));
    c.add(texto(this, ANCHO / 2 - 60, 142, `Fichas ${n}/3`, 28, COLOR.crema));
    // Las tres tarjetas.
    const tarjetas = [
      { k: 'tiro', x: 480, nombre: 'Tiro al pato', pista: 'Corchos, patos y\nmucho cuidado\ncon los pájaros', dibujo: g => this.iconoTiro(g) },
      { k: 'noria', x: 770, nombre: 'La noria', pista: 'Que no se vuelque\nnadie durante\n40 segundos', dibujo: g => this.iconoNoria(g) },
      { k: 'martillo', x: 1060, nombre: 'El martillo', pista: 'Tres golpes, la\ncampana arriba y\nel ritmo manda', dibujo: g => this.iconoMartillo(g) },
    ];
    tarjetas.forEach((t, i) => {
      const tiene = this.c[t.k];
      const w = 250, h = 380;
      const k = this.add.container(t.x, 380);
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(-w / 2 + 5, -h / 2 + 10, w, h, 26);
      g.fillStyle(tiene ? 0x6b8f3a : 0x9a6232, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 26);
      g.fillStyle(0xb0773c, 1).fillRoundedRect(-w / 2 + 10, -h / 2 + 10, w - 20, 160, 18);
      g.lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 26);
      k.add(g);
      const ic = this.add.graphics({ x: 0, y: -h / 2 + 90 });
      t.dibujo(ic);
      k.add(ic);
      k.add(texto(this, 0, -h / 2 + 206, t.nombre, 36, COLOR.crema, w - 20));
      k.add(texto(this, 0, -h / 2 + 276, t.pista, 21, COLOR.crema, w - 20).setAlpha(0.85));
      k.add(this.moneda(-w / 2 + 38, -h / 2 + 38, 18, tiene));
      k.add(texto(this, 0, h / 2 - 44, tiene ? '¡Ficha ganada!' : `Jugar (${i + 1})`, 28, tiene ? COLOR.verde : COLOR.amarillo, w - 20));
      k.setSize(w, h).setInteractive({ useHandCursor: true });
      k.on('pointerover', () => this.tweens.add({ targets: k, scale: 1.04, duration: 90 }));
      k.on('pointerout', () => this.tweens.add({ targets: k, scale: 1, duration: 90 }));
      k.on('pointerdown', () => this.elegir(t.k));
      k.setScale(0);
      this.tweens.add({ targets: k, scale: 1, duration: 360, ease: 'Back.out', delay: 120 + i * 120 });
      c.add(k);
    });
    c.add(boton(this, ANCHO / 2 + 110, 660, 'Al barrio (Esc)', () => this.salir(), { ancho: 300, alto: 70, tam: 26, color: HEX.azul }));
    if (nuevo) {
      golpeTexto(this, 770, 300, '¡Ficha del tiro!', COLOR.amarillo, 52);
      sfx(this, 'platillo', { volume: 0.35 });
      this.cambiarFeriante(true);
      this.time.delayedCall(600, () => this.dice('fichaTiro', true));
    } else this.time.delayedCall(500, () => this.dice(n > 0 ? 'vuelve' : 'tablon', true));
    if (n >= 3) this.espera(1700, () => this.final());
  }

  iconoTiro(g) {
    g.fillStyle(HEX.tinta, 1);
    [[-30, 6, 28], [4, 0, 30], [32, 8, 22]].forEach(([x, y, r]) => g.fillCircle(x, y, r + 5));
    g.fillCircle(46, -22, 22);
    g.fillStyle(0xf1ecf8, 1);
    [[-30, 6, 28], [4, 0, 30], [32, 8, 22]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.fillCircle(46, -22, 17);
    g.fillStyle(0xff9a3b, 1).fillTriangle(60, -24, 78, -18, 60, -12);
    g.fillStyle(HEX.tinta, 1).fillCircle(50, -26, 4);
    g.lineStyle(8, HEX.tinta, 1).strokeCircle(-8, 4, 34);
    g.lineStyle(4, HEX.rosa, 1).strokeCircle(-8, 4, 34);
    g.lineStyle(4, HEX.rosa, 1).lineBetween(-8, -44, -8, 52).lineBetween(-56, 4, 40, 4);
  }
  iconoNoria(g) {
    g.lineStyle(10, HEX.tinta, 1).strokeCircle(0, -6, 60);
    g.lineStyle(5, HEX.crema, 1).strokeCircle(0, -6, 60);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      g.lineStyle(4, HEX.crema, 1).lineBetween(0, -6, Math.sin(a) * 60, -6 - Math.cos(a) * 60);
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(Math.sin(a) * 60 - 11, -6 - Math.cos(a) * 60 - 5, 22, 22, 4);
      g.fillStyle([HEX.rosa, HEX.azul, HEX.amarillo][i % 3], 1).fillRoundedRect(Math.sin(a) * 60 - 8, -6 - Math.cos(a) * 60 - 2, 16, 16, 3);
    }
    g.lineStyle(8, HEX.tinta, 1).lineBetween(-36, 70, 0, -6).lineBetween(36, 70, 0, -6);
  }
  iconoMartillo(g) {
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(-8, -42, 16, 112, 4).fillRoundedRect(-44, -56, 88, 42, 8);
    g.fillStyle(0xd9a85e, 1).fillRect(-5, -38, 10, 104);
    g.fillStyle(HEX.rojo, 1).fillRoundedRect(-40, -52, 80, 34, 6);
    // Campana.
    g.fillStyle(HEX.tinta, 1).fillTriangle(58, -62, 90, -62, 74, -20).fillRect(52, -26, 44, 10).fillCircle(74, -14, 7);
    g.fillStyle(HEX.amarillo, 1).fillTriangle(61, -58, 87, -58, 74, -26).fillRect(56, -24, 36, 6);
  }

  elegir(k) {
    if (this.modo !== 'tablon' || this._acabado || this._saliendo) return;
    if (k === 'tiro') this.lanzarTiro();
    else if (k === 'noria') this.empezarNoria();
    else if (k === 'martillo') this.empezarMartillo();
  }

  lanzarTiro() {
    // El tiro es otra escena: al volver al tablón se lee su resultado (gana_TiroPato).
    guardarPartida();
    irA(this, 'TiroPato', {});
  }

  // Ficha ganada en la noria o en el martillo: se guarda, se celebra y se vuelve al tablón.
  ganarFicha(k, pts, frase) {
    const nueva = !this.c[k];
    this.c[k] = true;
    const campo = k === 'noria' ? 'pNoria' : 'pMartillo';
    this.c[campo] = Math.max(this.c[campo] || 0, pts);
    if (nueva && typeof sumarStat === 'function') sumarStat('feriaFichas');
    guardarPartida();
    this.cambiarFeriante(true);
    this.dice(frase, true, 2400);
    if (typeof Comic !== 'undefined') { Comic.confeti(this, { n: 14, profundidad: 90 }); }
    sfx(this, 'platillo', { volume: 0.5 });
    golpeTexto(this, ANCHO / 2, 300, nueva ? '¡FICHA!' : '¡Ficha repetida, mejor marca!', COLOR.amarillo, 72);
    this.espera(2800, () => this.tablon());
  }

  // ---------- La noria ----------

  empezarNoria() {
    this.modo = 'noria';
    this.limpiar();
    this.ponerFeriante('juego');
    const c = this.capa;
    const { px, py, alto: H, radio: R } = CA;
    const N = {
      t: 0, phi: 0, om: 0, u: 0, vidas: 3, inv: 0, freno: 100, frenando: false, ang: 0, pts: 0, vivo: true,
      riders: [], bote: [0, 0, 0, 0, 0, 0], boteT: [0, 0, 0, 0, 0, 0], humoT: 0, frenoLock: false, ultimoBien: 0, ultimoSusto: -9, calma: 0,
    };
    this.n = N;
    // Pista de la torre: base, patas y plataforma.
    const grupo = this.add.container(px, py);
    N.grupo = grupo;
    const torre = this.add.graphics();
    torre.lineStyle(16, HEX.tinta, 1).lineBetween(-110, 0, 0, -H).lineBetween(110, 0, 0, -H);
    torre.lineStyle(8, 0xb7a9cc, 1).lineBetween(-110, 0, 0, -H).lineBetween(110, 0, 0, -H);
    torre.lineStyle(8, HEX.tinta, 1).lineBetween(-70, -110, 70, -110).lineBetween(-40, -220, 40, -220);
    torre.fillStyle(HEX.tinta, 1).fillRoundedRect(-150, -6, 300, 36, 10);
    torre.fillStyle(0x8a5a2b, 1).fillRoundedRect(-144, -2, 288, 24, 8);
    grupo.add(torre);
    // Rueda con bombillas.
    const rueda = this.add.container(0, -H);
    N.rueda = rueda;
    const rg = this.add.graphics();
    rg.lineStyle(14, HEX.tinta, 1).strokeCircle(0, 0, R);
    rg.lineStyle(7, HEX.crema, 1).strokeCircle(0, 0, R);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      rg.lineStyle(10, HEX.tinta, 1).lineBetween(0, 0, Math.sin(a) * R, -Math.cos(a) * R);
      rg.lineStyle(4, 0xb7a9cc, 1).lineBetween(0, 0, Math.sin(a) * R, -Math.cos(a) * R);
    }
    rueda.add(rg);
    const bulbs = [];
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12;
      const b = this.add.circle(Math.sin(a) * (R + 2), -Math.cos(a) * (R + 2), 7, [HEX.amarillo, HEX.rosa, HEX.azul][i % 3]).setStrokeStyle(3, HEX.tinta);
      rueda.add(b);
      if (i % 2) bulbs.push(b);
    }
    this.tweens.add({ targets: bulbs, alpha: 0.3, duration: 360, yoyo: true, repeat: -1 });
    grupo.add(rueda);
    // Cabinas: fondo, pasajeros y barandilla por encima.
    const colores = [HEX.rosa, HEX.azul, HEX.amarillo, HEX.verde, 0xb98cf0, 0xff9a3b];
    N.fondos = []; N.frentes = [];
    for (let k = 0; k < 6; k++) {
      const f = this.add.graphics();
      f.fillStyle(HEX.tinta, 1).fillRoundedRect(-44, 16, 88, 80, 10);
      f.fillStyle(0x2d2146, 1).fillRoundedRect(-39, 21, 78, 70, 8);
      N.fondos.push(f);
      grupo.add(f);
    }
    // Pasajeros (los que corresponden al nivel suben en su momento).
    const lista = SUBEN.filter(([id]) => id !== 'perico' || this.nivel >= 2 || true);
    const cabinas = [0, 3, 1, 4, 2];
    lista.forEach(([id, cuando], i) => {
      const def = PASAJEROS[id];
      const s = this.add.image(0, 0, def.tex).setOrigin(0.5, 1).setVisible(false);
      const base = def.alto / s.height;
      s.setScale(base);
      grupo.add(s);
      N.riders.push({ id, sprite: s, base, cab: cabinas[i], cuando: cuando / (this.nivel > 1 ? 1.1 : 1), sube: false, w: 0, jit: 0, infl: 0, flota: 0, dx: 0, jump: null, prox: 0, fase: Math.random() * 6, aviso: 0, ria: 0, tex: def.tex });
    });
    for (let k = 0; k < 6; k++) {
      const f = this.add.graphics();
      f.fillStyle(HEX.tinta, 1).fillRoundedRect(-44, 62, 88, 36, 10).fillTriangle(-56, 20, 56, 20, 0, -8).fillRect(-3, -30, 6, 26);
      f.fillStyle(colores[k], 1).fillRoundedRect(-39, 67, 78, 26, 7).fillTriangle(-48, 17, 48, 17, 0, -2);
      N.frentes.push(f);
      grupo.add(f);
    }
    const eje = this.add.graphics();
    eje.fillStyle(HEX.tinta, 1).fillCircle(0, -H, 24);
    eje.fillStyle(HEX.amarillo, 1).fillCircle(0, -H, 14);
    grupo.add(eje);
    N.freno = 100;
    N.anillo = this.add.circle(0, -H, 32).setStrokeStyle(8, HEX.rojo).setVisible(false);
    grupo.add(N.anillo);
    c.add(grupo);
    // Peligro en los bordes (sutil) y pista de hacia dónde empujar.
    N.peligroI = this.add.rectangle(20, ALTO / 2, 40, ALTO, HEX.rojo, 0);
    N.peligroD = this.add.rectangle(ANCHO - 20, ALTO / 2, 40, ALTO, HEX.rojo, 0);
    c.add([N.peligroI, N.peligroD]);
    N.pista = this.add.container(px, 612).setAlpha(0);
    const flecha = this.add.graphics();
    flecha.fillStyle(HEX.tinta, 1).fillTriangle(-80, 0, -34, -40, -34, 40);
    flecha.fillStyle(HEX.amarillo, 1).fillTriangle(-72, 0, -40, -30, -40, 30);
    N.pistaFlecha = flecha;
    N.pistaTxt = texto(this, 40, 0, 'EMPUJA', 36, COLOR.amarillo);
    N.pista.add([flecha, N.pistaTxt]);
    c.add(N.pista);
    // HUD: tiempo, barra de equilibrio y vidas.
    N.txtT = texto(this, 120, 70, `${CA.duracion}`, 54, COLOR.amarillo);
    N.txtP = texto(this, 120, 144, '0', 30, COLOR.crema);
    c.add([N.txtT, N.txtP]);
    // Etiquetas cortas: qué es cada número.
    c.add([texto(this, 120, 108, 'TIEMPO', 16, COLOR.azul).setAlpha(0.9), texto(this, 120, 172, 'PUNTOS', 16, COLOR.azul).setAlpha(0.9)]);
    const bx = ANCHO / 2 + 40, bw = 480;
    const bar = this.add.graphics();
    bar.fillStyle(HEX.tinta, 1).fillRoundedRect(bx - bw / 2 - 6, 56, bw + 12, 36, 14);
    bar.fillStyle(0x4a3d5c, 1).fillRoundedRect(bx - bw / 2, 62, bw, 24, 10);
    bar.fillStyle(HEX.verde, 1).fillRoundedRect(bx - bw * 0.14, 62, bw * 0.28, 24, 8);
    bar.fillStyle(HEX.amarillo, 1).fillRect(bx - bw * 0.36, 62, bw * 0.22, 24).fillRect(bx + bw * 0.14, 62, bw * 0.22, 24);
    c.add(bar);
    N.bx = bx; N.bw = bw;
    N.marca = this.add.rectangle(bx, 74, 14, 44, HEX.crema).setStrokeStyle(4, HEX.tinta);
    c.add(N.marca);
    N.vidasG = [0, 1, 2].map(i => { const v = this.add.circle(ANCHO - 140 + i * 46, 74, 16, HEX.rosa).setStrokeStyle(5, HEX.tinta); c.add(v); return v; });
    N.frenoBar = this.add.graphics();
    c.add(N.frenoBar);
    // Mandos para el dedo y el ratón: empujar a un lado, al otro y frenar.
    c.add(this.mando(130, 652, 170, 100, { tecla: 'izq', icono: 'izq' }));
    c.add(this.mando(320, 652, 170, 100, { tecla: 'der', icono: 'der' }));
    c.add(this.mando(1140, 652, 220, 100, { tecla: 'freno', etiqueta: MOVIL ? 'FRENO' : 'Freno (Espacio)', color: HEX.rojo }));
    // Cartel de explicación.
    const cartel = texto(this, 720, 628, MOVIL ? 'Que no se vuelque nadie\nEmpuja al lado contrario · frena' : 'Que no se vuelque nadie\n← → empujan al lado contrario · Espacio frena', 30, COLOR.crema, 600).setDepth(5);
    c.add(cartel);
    this.tweens.add({ targets: cartel, alpha: 0, delay: 3600, duration: 500 });
    sfx(this, 'sting', { volume: 0.4 });
    this.dice('noriaIni', true, 2600);
    this.pintarNoria();
  }

  // Lo que cada pasajero hace con su peso, su postura y sus ocurrencias.
  logicaPasajero(r, dt, N) {
    const t = N.t, D = this.dif;
    if (!r.sube) {
      if (t >= r.cuando) {
        r.sube = true;
        r.sprite.setVisible(true);
        r.prox = t + 3 + Math.random() * 3;
        sfx(this, 'pop', { volume: 0.3 });
        this.tweens.add({ targets: r.sprite, alpha: { from: 0, to: 1 }, duration: 260 });
      } else { r.w = 0; return; }
    }
    if (r.id === 'palicaso') {
      // No para quieto: va de un lado al otro de la cabina.
      r.w = 1.0;
      r.jit = Math.sin(t * 3.4 + r.fase) * 0.75;
      r.dx = r.jit * 26;
    } else if (r.id === 'lasslow') {
      r.w = 1.0;
      if (r.ria <= 0) r.dx = 0;
      if (r.ria > 0) {
        r.ria -= dt;
        r.dx = Math.sin(t * 55) * 4;
        if (r.ria <= 0) {
          // La risa se le sale: la cabina bota y empuja hacia su lado.
          const a = N.ang + r.cab * Math.PI / 3;
          const s = Math.abs(Math.sin(a)) > 0.25 ? Math.sign(Math.sin(a)) : (Math.random() < 0.5 ? 1 : -1);
          N.om += s * Phaser.Math.Between(30, 44) * D;
          N.bote[r.cab] = 0.28; N.boteT[r.cab] = 0;
          sfx(this, 'boing', { volume: 0.45 });
          this.vestir(r, r.tex);
        }
      } else if (t >= r.prox) {
        r.ria = 0.75;
        r.prox = t + Phaser.Math.FloatBetween(5, 8) / D;
        if (this.textures.exists('lasslow-risa-floja')) this.vestir(r, 'lasslow-risa-floja');
        this.dice('lasslow');
      }
    } else if (r.id === 'cotine') {
      // Se come el algodón: se hincha y pesa.
      if (r.infl > 0 && t >= r.finInfl) r.infl = Math.max(0, r.infl - dt * 1.4);
      if (r.infl === 0 && t >= r.prox) { r.infl = 0.01; r.finInfl = t + 3.4; r.prox = t + Phaser.Math.FloatBetween(9, 12); this.dice('cotine'); sfx(this, 'fup', { volume: 0.4 }); }
      if (r.infl > 0 && t < r.finInfl) r.infl = Math.min(1, r.infl + dt * 2.2);
      r.w = 1.05 + r.infl * 0.85;
    } else if (r.id === 'pompa') {
      // Se hincha y sube: pesa menos que nada y empuja hacia arriba.
      if (r.infl > 0 && t >= r.finInfl) r.infl = Math.max(0, r.infl - dt * 1.2);
      if (r.infl === 0 && t >= r.prox) { r.infl = 0.01; r.finInfl = t + 3.3; r.prox = t + Phaser.Math.FloatBetween(7, 10); this.dice('pompa'); sfx(this, 'plop', { volume: 0.4 }); }
      if (r.infl > 0 && t < r.finInfl) r.infl = Math.min(1, r.infl + dt * 2);
      r.w = -0.45 - r.infl * 0.75;
      r.flota = r.infl * 32;
      const nueva = r.infl > 0.5 && this.textures.exists('pompa-hinchada') ? 'pompa-hinchada' : r.tex;
      if (r.sprite.texture.key !== nueva) this.vestir(r, nueva, nueva === 'pompa' ? 1 : 1.15);
    } else if (r.id === 'perico') {
      r.w = 0.45;
      if (r.jump) {
        r.jump.t += dt / 0.75;
        if (r.jump.t >= 1) { r.cab = r.jump.a; r.jump = null; this.vestir(r, 'perico'); sfx(this, 'pin-pin', { volume: 0.3 }); }
      } else if (t >= r.prox) {
        const ocupadas = N.riders.filter(o => o !== r && o.sube).map(o => o.cab);
        const libres = [0, 1, 2, 3, 4, 5].filter(k => k !== r.cab && !ocupadas.includes(k));
        if (libres.length) {
          r.jump = { t: 0, de: r.cab, a: Phaser.Utils.Array.GetRandom(libres) };
          if (this.textures.exists('perico-volando')) this.vestir(r, 'perico-volando', 1.25);
          sfx(this, 'pin-pin', { volume: 0.4 });
          this.dice('perico');
        }
        r.prox = t + Phaser.Math.FloatBetween(5, 7.5) / D;
      }
    }
  }

  // Cambia la pose de un pasajero manteniendo su altura en la cabina.
  vestir(r, clave, mult = 1) {
    r.sprite.setTexture(clave);
    r.base = PASAJEROS[r.id].alto * mult / r.sprite.height;
    r.sprite.setScale(r.base);
  }

  updateNoria(dt) {
    const N = this.n;
    if (!N || !N.vivo) return;
    const D = this.dif;
    N.t += dt;
    N.inv = Math.max(0, N.inv - dt);
    N.ang += dt * 0.36 * (1 + 0.05 * (this.nivel - 1));
    N.rueda.rotation = N.ang;
    let tau = 0;
    N.riders.forEach(r => {
      this.logicaPasajero(r, dt, N);
      if (!r.sube) return;
      const cab = r.jump ? (r.jump.t < 0.5 ? r.jump.de : r.jump.a) : r.cab;
      tau += r.w * (Math.sin(N.ang + cab * Math.PI / 3) + r.jit);
    });
    // Mando: izquierda, derecha y freno (con su depósito).
    const k = this.teclas;
    const izq = this.ctl.izq || k.LEFT.isDown || k.A.isDown;
    const der = this.ctl.der || k.RIGHT.isDown || k.D.isDown;
    const pidoFreno = this.ctl.freno || k.SPACE.isDown || k.DOWN.isDown;
    const objetivo = (der ? 1 : 0) - (izq ? 1 : 0);
    N.u += (objetivo - N.u) * Math.min(1, dt * 12);
    if (N.frenoLock && N.freno > 25) N.frenoLock = false;
    N.frenando = pidoFreno && !N.frenoLock && N.freno > 0;
    if (N.frenando) { N.freno = Math.max(0, N.freno - dt * 60); if (N.freno <= 0) N.frenoLock = true; }
    else N.freno = Math.min(100, N.freno + dt * 28);
    const amort = 1.3 + (N.frenando ? 11 : 0);
    const alfa = 24 * D * tau + 1.7 * N.phi + 130 * N.u - amort * N.om;
    N.om = Phaser.Math.Clamp(N.om + alfa * dt, -140, 140);
    N.phi += N.om * dt;
    // Vuelco: se pierde una vida, la noria se recoloca y se da un respiro.
    if (Math.abs(N.phi) >= CA.limite && N.inv <= 0) this.vuelco(Math.sign(N.phi));
    // Puntos: segundos aguantados, y más cuanto más centrada.
    const centro = 1 - Math.min(1, Math.abs(N.phi) / CA.limite);
    N.pts += dt * (10 + 10 * centro);
    N.calma = centro > 0.7 ? N.calma + dt : 0;
    if (N.calma > 7 && N.t - N.ultimoBien > 9) { N.ultimoBien = N.t; N.calma = 0; this.dice('bien'); }
    // Humo bajo la noria.
    N.humoT -= dt;
    if (N.humoT <= 0) { N.humoT = 0.55; this.puffHumo(CA.px + Phaser.Math.Between(-130, 130), CA.py - 6, 0.9, 0xcfc6dc); }
    this.pintarNoria(dt);
    if (N.t >= CA.duracion) this.noriaGanada();
  }

  vuelco(lado) {
    const N = this.n;
    N.vidas--;
    N.inv = 1.4;
    N.phi = lado * CA.limite * 0.5;
    N.om = -lado * 25;
    sfx(this, 'golpe', { volume: 0.5 });
    this.cameras.main.shake(130, 0.006);
    // El pasajero más cargado de ese lado casi se cae.
    const pesados = N.riders.filter(r => r.sube).sort((a, b) => Math.abs(b.w) - Math.abs(a.w));
    const quien = pesados[0];
    if (quien) {
      if (typeof Comic !== 'undefined') Comic.emote(this, CA.px + lado * 160, 260, 'mareo', { profundidad: 90 });
      N.bote[quien.cab] = 0.4; N.boteT[quien.cab] = 0;
    }
    golpeTexto(this, CA.px + lado * 200, 200, '¡Se vuelca!', COLOR.rosa, 52);
    this.dice('susto', true);
    if (N.vidas <= 0) this.noriaPerdida();
  }

  pintarNoria() {
    const N = this.n;
    if (!N) return;
    const { alto: H, radio: R } = CA;
    const ph = Phaser.Math.DegToRad(N.phi);
    N.grupo.rotation = ph;
    for (let k = 0; k < 6; k++) {
      const a = N.ang + k * Math.PI / 3;
      const ocupante = N.riders.find(r => r.sube && !r.jump && r.cab === k);
      const sag = ocupante ? Math.max(0, ocupante.w) * 7 : 0;
      N.boteT[k] += 0.016;
      const swing = N.bote[k] * Math.sin(N.boteT[k] * 16) * Math.exp(-N.boteT[k] * 3.2);
      const rot = -ph * 0.85 + swing;
      const cx = Math.sin(a) * R, cy = -H - Math.cos(a) * R + sag;
      [N.fondos[k], N.frentes[k]].forEach(o => o.setPosition(cx, cy).setRotation(rot).setScale(CA.cab));
      N['cab' + k] = { cx, cy, rot };
    }
    N.riders.forEach(r => {
      if (!r.sube) return;
      const s = r.sprite;
      let pos;
      const cabinaPos = kk => N['cab' + kk];
      if (r.jump) {
        const A = cabinaPos(r.jump.de), B = cabinaPos(r.jump.a);
        const u = r.jump.t;
        pos = { x: A.cx + (B.cx - A.cx) * u, y: A.cy + (B.cy - A.cy) * u - Math.sin(u * Math.PI) * 90 + 86 * CA.cab, rot: 0 };
      } else {
        const C = cabinaPos(r.cab);
        const lx = r.dx * CA.cab, ly = 88 * CA.cab - r.flota;
        pos = { x: C.cx + lx * Math.cos(C.rot) - ly * Math.sin(C.rot), y: C.cy + lx * Math.sin(C.rot) + ly * Math.cos(C.rot), rot: C.rot * 0.7 };
      }
      s.setPosition(pos.x, pos.y).setRotation(pos.rot);
      if (r.id === 'cotine') s.setScale(r.base * (1 + 0.26 * r.infl), r.base * (1 + 0.2 * r.infl));
    });
    // HUD.
    const f = Math.max(-1, Math.min(1, N.phi / CA.limite));
    N.marca.x = N.bx + f * N.bw / 2;
    N.marca.setFillStyle(Math.abs(f) > 0.75 ? HEX.rojo : Math.abs(f) > 0.45 ? HEX.amarillo : HEX.crema);
    N.txtT.setText(String(Math.max(0, Math.ceil(CA.duracion - N.t))));
    N.txtP.setText(String(Math.round(N.pts)));
    N.vidasG.forEach((v, i) => v.setFillStyle(i < N.vidas ? HEX.rosa : 0x4a3d5c));
    const peli = Math.max(0, (Math.abs(f) - 0.6) / 0.4) * 0.3;
    N.peligroI.setFillStyle(HEX.rojo, f < 0 ? peli : 0);
    N.peligroD.setFillStyle(HEX.rojo, f > 0 ? peli : 0);
    // Flecha de «empuja»: hacia el lado contrario al que se inclina.
    const alerta = Math.abs(f) > 0.4;
    N.pista.setAlpha(alerta ? 0.5 + 0.5 * Math.sin(this.time.now / 90) : 0);
    N.pista.setPosition(CA.px - f * 0, 612);
    N.pistaFlecha.setScale(f > 0 ? 1 : -1, 1);
    N.pistaTxt.setPosition(f > 0 ? 40 : -40, 0);
    N.pistaTxt.setText(f > 0 ? 'EMPUJA' : 'EMPUJA');
    N.anillo.setVisible(!!N.frenando);
    N.frenoBar.clear();
    N.frenoBar.fillStyle(HEX.tinta, 1).fillRoundedRect(1030, 582, 220, 16, 6);
    N.frenoBar.fillStyle(N.frenoLock ? 0x7a3b3b : HEX.rojo, 1).fillRoundedRect(1034, 585, 212 * (N.freno / 100), 10, 4);
  }

  noriaPerdida() {
    const N = this.n;
    N.vivo = false;
    sfx(this, 'oooh', { volume: 0.5 });
    this.cambiarFeriante(false);
    golpeTexto(this, ANCHO / 2, 300, 'Noria parada', COLOR.rosa, 64);
    this.dice('noriaKo', true, 2600);
    this.espera(3000, () => this.tablon());
  }

  noriaGanada() {
    const N = this.n;
    N.vivo = false;
    const pts = Math.round(N.pts) + N.vidas * 40;
    this.ganarFicha('noria', pts, 'noriaOk');
  }

  // ---------- El martillo ----------

  empezarMartillo() {
    this.modo = 'martillo';
    this.limpiar();
    this.ponerFeriante('juego');
    const c = this.capa;
    // Tres reglas distintas, sin repetir hasta agotar la bolsa (entre partidas también).
    const reglas = [];
    while (reglas.length < 3) {
      if (!BOLSA_REGLAS.length) BOLSA_REGLAS = Phaser.Utils.Array.Shuffle(['vaiven', 'rapido', 'finta', 'ciegas']);
      const r = BOLSA_REGLAS.pop();
      if (!reglas.includes(r)) reglas.push(r);
    }
    // El nivel de la feria cierra la zona verde.
    const lo = Math.min(0.88, 0.8 + 0.02 * (this.nivel - 1));
    const M = { reglas, i: -1, pts: 0, campanas: 0, estado: 'inicio', t: 0, pos: 0, lo, tope: 10, res: [] };
    this.m = M;
    const TX = 560, y0 = 560, y1 = 140;
    M.y = p => y0 - (y0 - y1) * p;
    M.TX = TX;
    // Torre de fuerza.
    const torre = this.add.graphics();
    torre.fillStyle(HEX.tinta, 1).fillRoundedRect(TX - 40, y1 - 18, 80, y0 - y1 + 60, 16).fillRoundedRect(TX - 80, y0 + 14, 160, 40, 10);
    torre.fillStyle(0xe9dcc3, 1).fillRoundedRect(TX - 34, y1 - 12, 68, y0 - y1 + 48, 12);
    torre.fillStyle(0x8a5a2b, 1).fillRoundedRect(TX - 74, y0 + 20, 148, 28, 8);
    for (let i = 0; i <= 10; i++) { const y = M.y(i / 10); torre.lineStyle(i % 5 === 0 ? 6 : 3, HEX.tinta, 1).lineBetween(TX - 34, y, TX - (i % 5 === 0 ? 8 : 18), y); }
    torre.fillStyle(0x6b8f3a, 0.55).fillRect(TX - 34, M.y(1), 68, M.y(lo) - M.y(1));
    c.add(torre);
    // Campana.
    const campana = this.add.container(TX, y1 - 38);
    const cg = this.add.graphics();
    cg.fillStyle(HEX.tinta, 1).fillTriangle(-36, 28, 36, 28, 0, -34).fillRoundedRect(-44, 18, 88, 20, 8).fillCircle(0, 44, 12);
    cg.fillStyle(HEX.amarillo, 1).fillTriangle(-30, 24, 30, 24, 0, -26).fillRoundedRect(-38, 20, 76, 12, 6);
    cg.fillStyle(0xffe680, 1).fillTriangle(-10, 14, 2, 14, -4, -10);
    campana.add(cg);
    M.campana = campana;
    c.add(campana);
    // Medidor: la barra que sube y baja. Zona verde arriba.
    const GX = 700;
    const med = this.add.graphics();
    med.fillStyle(HEX.tinta, 1).fillRoundedRect(GX - 34, y1 - 12, 68, y0 - y1 + 24, 14);
    med.fillStyle(0x2d2146, 1).fillRoundedRect(GX - 28, y1 - 6, 56, y0 - y1 + 12, 10);
    med.fillStyle(HEX.verde, 1).fillRoundedRect(GX - 28, M.y(1) - 6, 56, M.y(lo) - M.y(1) + 6, 8);
    c.add(med);
    M.GX = GX;
    const marca = this.add.container(GX, M.y(0));
    const mg = this.add.graphics();
    mg.fillStyle(HEX.tinta, 1).fillRoundedRect(-44, -10, 88, 20, 6).fillTriangle(-44, -18, -44, 18, -70, 0).fillTriangle(44, -18, 44, 18, 70, 0);
    mg.fillStyle(HEX.crema, 1).fillRoundedRect(-40, -6, 80, 12, 4).fillTriangle(-48, -12, -48, 12, -64, 0).fillTriangle(48, -12, 48, 12, 64, 0);
    marca.add(mg);
    M.marca = marca;
    c.add(marca);
    // La lona de «a ciegas»: tapa el medio del medidor, y se ve venir.
    const lona = this.add.container(GX, (M.y(0.3) + M.y(0.72)) / 2).setVisible(false);
    const lg = this.add.graphics();
    const hl = M.y(0.3) - M.y(0.72);
    lg.fillStyle(HEX.tinta, 1).fillRoundedRect(-52, -hl / 2 - 6, 104, hl + 12, 10);
    for (let i = 0; i < 8; i++) { lg.fillStyle(i % 2 ? HEX.crema : HEX.azul, 1).fillRect(-46 + i * 11.5, -hl / 2, 11.5, hl); }
    lona.add(lg);
    lona.add(texto(this, 0, 0, '?', 66, COLOR.amarillo));
    M.lona = lona;
    c.add(lona);
    // Pieza que sube por la torre y el mazo.
    M.puck = this.add.container(TX, y0 - 14);
    const pg = this.add.graphics();
    pg.fillStyle(HEX.tinta, 1).fillCircle(0, 0, 26);
    pg.fillStyle(HEX.rojo, 1).fillCircle(0, 0, 20);
    pg.fillStyle(HEX.crema, 1).fillCircle(-7, -7, 6);
    M.puck.add(pg);
    c.add(M.puck);
    const mazo = this.add.container(TX - 190, y0 + 22);
    const mz = this.add.graphics();
    mz.fillStyle(HEX.tinta, 1).fillRoundedRect(-11, -190, 22, 196, 6).fillRoundedRect(-52, -226, 104, 56, 10);
    mz.fillStyle(0xd9a85e, 1).fillRect(-7, -184, 14, 186);
    mz.fillStyle(HEX.rojo, 1).fillRoundedRect(-46, -220, 92, 44, 8);
    mz.fillStyle(0xff8a80, 1).fillRect(-40, -214, 12, 32);
    mazo.add(mz);
    mazo.setAngle(-48);
    M.mazo = mazo;
    c.add(mazo);
    // HUD: números de golpe y campanas.
    M.rotulo = texto(this, ANCHO / 2 + 200, 74, '', 44, COLOR.crema, 560);
    c.add(M.rotulo);
    M.txtP = texto(this, 130, 70, '0', 52, COLOR.amarillo);
    c.add(M.txtP);
    c.add(texto(this, 130, 104, 'PUNTOS', 15, COLOR.azul).setAlpha(0.9));
    M.camp = [0, 1, 2].map(i => { const g = this.moneda(100 + i * 56, 132, 18, false); c.add(g); return g; });
    c.add(texto(this, 134, 176, 'Campanazos: 2 dan ficha', 20, COLOR.crema, 250).setAlpha(0.9));
    c.add(this.mando(1140, 652, 250, 100, { alPulsar: () => this.golpear(), etiqueta: '¡YA!', tecla: 'ya' }));
    const cartel = texto(this, 700, 650, MOVIL ? 'Toca ¡YA! cuando la barra esté en lo verde' : 'Espacio (o clic) cuando la barra esté en lo verde', 30, COLOR.crema, 620);
    c.add(cartel);
    this.tweens.add({ targets: cartel, alpha: 0, delay: 3200, duration: 500 });
    this.dice('marIni', true, 2400);
    this.espera(2300, () => this.nuevoGolpe());
  }

  nuevoGolpe() {
    const M = this.m;
    M.i++;
    if (M.i >= 3) { this.martilloFin(); return; }
    const r = M.reglas[M.i];
    const def = REGLAS_MARTILLO[r];
    M.regla = r;
    M.estado = 'corre';
    M.t = 0;
    M.cola = [];
    M.leg = null;
    M.pos = 0;
    M.marca.setVisible(true);
    M.lona.setVisible(r === 'ciegas');
    if (r === 'ciegas') this.tweens.add({ targets: M.lona, scaleY: { from: 0, to: 1 }, duration: 260, ease: 'Back.out' });
    M.rotulo.setText(`Golpe ${M.i + 1}/3 · ${def.nombre}`).setColor('#' + def.color.toString(16).padStart(6, '0'));
    M.rotulo.setScale(1.5);
    this.tweens.add({ targets: M.rotulo, scale: 1, duration: 300, ease: 'Back.out' });
    this.dice(r, true, 2200);
    sfx(this, 'campanita', { volume: 0.25 });
  }

  updateMartillo(dt) {
    const M = this.m;
    if (!M || M.estado !== 'corre') return;
    M.t += dt;
    if (M.t > M.tope) { this.golpear(true); return; }
    // Cada tramo parte de donde está la barra: el movimiento nunca da saltos.
    if (!M.leg || M.leg.t >= M.leg.dur) {
      if (!M.cola.length) M.cola = REGLAS_MARTILLO[M.regla].tramos();
      const [to, dur] = M.cola.shift();
      M.leg = { from: M.pos, to, dur, t: 0 };
      // Un tictac suave al empezar cada subida: el ritmo se oye.
      if (to > M.pos + 0.3) sfx(this, 'pop', { volume: 0.12 });
    }
    const L = M.leg;
    L.t += dt * this.dif;
    const u = Math.min(1, L.t / L.dur);
    const e = M.regla === 'finta' && L.to === 1 ? u : 0.5 - 0.5 * Math.cos(Math.PI * u);
    M.pos = L.from + (L.to - L.from) * e;
    M.marca.y = M.y(M.pos);
  }

  golpear(tarde) {
    const M = this.m;
    if (this.modo !== 'martillo' || !M || M.estado !== 'corre') return;
    M.estado = 'golpe';
    const pos = tarde ? 0 : M.pos;
    const bell = !tarde && pos >= M.lo;
    const pts = tarde ? 0 : Math.round(300 * Math.pow(Math.max(0, (pos - 0.2) / 0.8), 2)) + (bell ? 100 : 0);
    M.pts += pts;
    if (bell) M.campanas++;
    M.res.push({ pos, bell });
    M.txtP.setText(String(M.pts));
    // El mazo cae y la pieza sube hasta donde la fuerza dé.
    this.tweens.add({ targets: M.mazo, angle: 38, duration: 110, ease: 'Quad.in' });
    sfx(this, 'golpe', { volume: 0.6 });
    this.time.delayedCall(100, () => {
      if (this.modo !== 'martillo' || this.m !== M) return;
      const yDest = bell ? M.y(1) - 6 : Math.max(M.y(1) + 14, M.y(pos));
      this.tweens.add({ targets: M.puck, y: yDest, duration: 150 + pos * 450, ease: 'Quad.out', yoyo: !bell, hold: bell ? 600 : 0, onComplete: () => { if (!bell && M.puck.active) M.puck.y = M.y(0) - 14; } });
      if (bell) {
        this.time.delayedCall(150 + pos * 450, () => this.suenaCampana(M));
      }
    });
    const tipo = tarde ? 'tarde' : bell ? 'campana' : 'flojo';
    this.time.delayedCall(bell ? 700 : 350, () => { if (this.m === M && this.modo === 'martillo') this.dice(tipo, true, 1800); });
    golpeTexto(this, M.GX + 130, M.y(Math.max(pos, 0.1)), tarde ? '¡Tarde!' : `+${pts}`, bell ? COLOR.amarillo : COLOR.crema, bell ? 56 : 44);
    this.espera(1900, () => { M.puck.y = M.y(0) - 14; M.mazo.angle = -48; this.nuevoGolpe(); });
  }

  suenaCampana(M) {
    if (this.modo !== 'martillo' || this.m !== M) return;
    sfx(this, 'campanita', { volume: 0.6 });
    sfx(this, 'platillo', { volume: 0.3 });
    this.tweens.add({ targets: M.campana, angle: { from: -14, to: 0 }, duration: 520, ease: 'Elastic.out' });
    if (typeof Comic !== 'undefined') Comic.impacto(this, M.TX, M.y(1) - 30, { tam: 56, profundidad: 85 });
    golpeTexto(this, M.TX - 190, M.y(1) + 90, '¡CLANG!', COLOR.amarillo, 46);
    M.camp[M.campanas - 1] && this.capa.add(this.moneda(M.camp[M.campanas - 1].x, M.camp[M.campanas - 1].y, 18, true));
    this.cambiarFeriante(true);
  }

  martilloFin() {
    const M = this.m;
    M.estado = 'fin';
    M.marca.setVisible(false);
    M.lona.setVisible(false);
    if (M.campanas >= CA.umbralMartillo) this.ganarFicha('martillo', M.pts, 'marOk');
    else {
      sfx(this, 'oooh', { volume: 0.5 });
      golpeTexto(this, ANCHO / 2, 300, `${M.campanas} campanazo${M.campanas === 1 ? '' : 's'}`, COLOR.rosa, 60);
      this.dice('marKo', true, 2600);
      this.espera(3000, () => this.tablon());
    }
  }

  // ---------- Bucle y final ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    if (this.modo === 'noria') this.updateNoria(dt);
    else if (this.modo === 'martillo') this.updateMartillo(dt);
  }

  final() {
    if (this._acabado) return;
    this._acabado = true;
    this.modo = 'fin';
    const puntos = this.puntosTotales();
    const pn = this.c.pNoria, pm = this.c.pMartillo;
    // Se cierra la feria: las fichas se gastan y el tiro vuelve a pedirse desde cero, pero SOLO cuando la victoria
    // ya está apuntada (gana_Casetas sube en el panel). Si se cierra o recarga antes, las tres fichas siguen ahí y,
    // al volver a abrir el tablón, se cobra otra vez (tablon() llama a final() con 3 fichas).
    const ganadasAntes = typeof stat === 'function' ? stat('gana_Casetas') : 0;
    const cobrar = this.time.addEvent({ delay: 100, loop: true, callback: () => {
      if (typeof stat === 'function' && stat('gana_Casetas') <= ganadasAntes) return;
      cobrar.remove();
      this.c.tiro = false; this.c.noria = false; this.c.martillo = false;
      this.c.pNoria = 0; this.c.pMartillo = 0;
      this.c.baseTiro = this.ganasTiro();
      guardarPartida();
    } });
    this.limpiar();
    this.cambiarFeriante(true);
    this.dice('cierre', true, 2600);
    if (typeof Comic !== 'undefined') Comic.confeti(this, { n: 18, profundidad: 90 });
    this.time.delayedCall(1500, () => panelFinal(this, {
      titulo: '¡Tres fichas!',
      linea: `Tiro, noria (${Math.round(pn)}) y martillo (${Math.round(pm)}). El peluche, «para otra noche».`,
      puntos, clave: 'Casetas', gana: true,
    }));
  }
}


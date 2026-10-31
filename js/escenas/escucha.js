// Escucha (cap. 9 «Escucha, escucha»): una conversación al revés. Blancaso se confiesa, bocadillo a
// bocadillo, y Palicaso (que nunca deja hueco) lleva dentro una burbuja de «¡escucha, escucha!» que
// sube con cada pausa. Se gana CALLANDO:
//  - cuando la burbuja se pone rosa y tiembla, pulsa (ESPACIO o toque) y le pones la mano de nube
//    delante de la boca: un «shhh» amable. Cuanto más cerca del límite frenas, más puntos (y más riesgo);
//  - si pulsas cuando NO toca (la burbuja aún está tranquila, o Perico hace «pin pin» y distrae),
//    le tapas de más: Palicaso se enfada, se hincha más rápido y Blancaso se corta;
//  - si la burbuja revienta, Palicaso interrumpe y Blancaso se encoge. Pierdes si su ánimo llega a cero
//    («Da igual. Mañana.»). El último silencio, el más largo, es el que emociona.
// Mismo tipo que ¡Periquito! (cortar a alguien a tiempo), pero al revés: aquí el reto es no pulsar de más.
// Música «momento»: es el momento persona de Palicaso, no una carrera; pide un tema blando, no el de minijuego.

MISIONES.Escucha = {
  nombre: 'Escucha', sprite: 'palicaso', umbrales: [900, 1800, 2600],
  texto: 'Blancaso se confiesa y Palicaso no sabe callar. Pulsa (Espacio o toque) SOLO cuando su burbuja se ponga rosa y tiemble; si pulsas de más, se enfada.',
};
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Escucha = 'momento';
if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Escucha = 'burbuja';
if (typeof REACCION_PIERDE !== 'undefined') REACCION_PIERDE.Escucha = ['palicaso-contando', 0xffd628];

const ESC_LINEAS = [
  'Palicaso… llevo semanas dándole vueltas a una cosa.',
  'Cada noche hago las cuentas. Cada noche salen justas.',
  'Si falla una sola… se acaba Unaké.',
  'Y tú estás tan contento, y no te lo quiero estropear.',
  'Así que me lo guardo. Y me hundo un poquito cada noche.',
  'Tengo miedo de perder el bar.',
  'Es lo único que tenemos.',
];
const ESC_FRENO = ['¡Escucha, escu—!', 'Y esta no te la he contado…', 'Es que me recuerda a una vez que…'];
const ESC_BIEN = ['Mm. …Mm-hm. …Sigue, sigue.', '¡Qué fuerte! …Perdón. Sigue.', 'Me muerdo la estela, ¿lo ves? Me la muerdo.', 'Estoy escuchando. Escucho tan fuerte que me zumban las orejas.'];
const ESC_DEMAS = ['¡Mmf! ¡Si no iba a decir nada!', '¿Qué? ¡Estaba callado!', 'Oye, que me estoy portando.'];
const ESC_VENT = 0.58; // a partir de aquí la burbuja pide freno

class Escucha extends Phaser.Scene {
  constructor() { super('Escucha'); }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: scene.start reutiliza la instancia.
    this.puntos = 0;
    this.animo = 100;
    this.racha = 0;
    this.presion = 0.1;
    this.linea = 0;
    this.fase = 'espera';
    this.tf = 0;
    this.chars = 0;
    this.durPausa = 2;
    this.huboFallo = false;
    this.falsaEn = null;
    this.falsaHasta = 0;
    this.falsasHechas = 0;
    this.libreDesde = 0;
    this.palHasta = 0;
    this.palTex = null;
    this.blaHasta = 0;
    this.tensionDicha = false;
    this._acabado = false;
    this.nivel = nivelDe('Escucha');
    const i = Math.min(this.nivel, 3) - 1;
    const extra = Math.max(0, this.nivel - 3) * 0.04;
    this.dif = {
      vel: [0.046, 0.038, 0.030][i],
      pausa: [[2.8, 3.5], [1.9, 2.5], [0.9, 1.3]][i],
      rateH: [0.05, 0.08, 0.11][i] + extra,
      rateP: [0.30, 0.42, 0.55][i] + extra,
      rateS: [0.22, 0.30, 0.34][i] + extra,
      mult: 1 + 0.25 * (i),
      falsas: i >= 1,
      flamenco: i >= 2,
    };
    this.bolsaFreno = this.bolsa(ESC_FRENO);
    this.bolsaBien = this.bolsa(ESC_BIEN);
    this.bolsaDemas = this.bolsa(ESC_DEMAS);

    fondo(this, enMundoHumo() ? 'bg-dentro' : 'bgn-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.4);

    // Palicaso a la izquierda (se hincha), Blancaso a la derecha (cuenta).
    this.pal = this.add.image(380, 660, this.tex('palicaso')).setOrigin(0.5, 1).setDepth(5);
    this.ponerPal('palicaso');
    flotar(this, this.pal, { amplitud: 4 });
    this.bla = this.add.image(930, 660, this.tex('blancaso-cuenta', 'blancaso')).setOrigin(0.5, 1).setDepth(5);
    this.ponerBla('blancaso-cuenta', 'blancaso');
    this.perico = this.add.image(1205, 665, 'perico-cotilleando').setOrigin(0.5, 1).setDepth(4).setAlpha(0);
    this.perico.setScale(170 / this.perico.height);
    this.perico.x = 1260;

    // Burbuja interior de Palicaso y mejillas.
    this.gBur = this.add.graphics().setDepth(7);
    this.txtBur = this.add.text(380, 190, '¡escucha,\nescucha!', { fontFamily: FUENTE, fontSize: '19px', color: COLOR.tinta, align: 'center' }).setOrigin(0.5).setDepth(8);

    // Bocadillo de Blancaso, que se va llenando.
    this.cajaBla = this.add.container(880, 150).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).lineStyle(6, HEX.tinta, 1).fillRoundedRect(-330, -72, 660, 144, 28).strokeRoundedRect(-330, -72, 660, 144, 28);
    g.fillTriangle(-20, 66, 40, 66, 20, 128).lineBetween(-20, 70, 20, 128).lineBetween(40, 70, 20, 128);
    this.cajaBla.add(g);
    this.txtBla = this.add.text(0, 0, '', { fontFamily: FUENTE, fontSize: '32px', color: COLOR.tinta, align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5);
    this.cajaBla.add(this.txtBla);
    this.cajaBla.setAlpha(0);
    this.puntos3 = this.add.text(880, 250, '', { fontFamily: FUENTE, fontSize: '26px', color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 5 }).setOrigin(0.5).setDepth(21);
    this.pips = ESC_LINEAS.map((_l, k) => this.add.circle(880 + (k - 3) * 26, 232, 7, 0x3d3350).setStrokeStyle(3, HEX.tinta).setDepth(21));

    // Frase de Palicaso (la que le sale o le cortan).
    this.fraseP = texto(this, 165, 200, '', 22, COLOR.crema, 290).setDepth(30).setAlpha(0);

    // Mano de nube.
    this.mano = this.add.container(560, 560).setDepth(25).setAlpha(0);
    const gm = this.add.graphics();
    gm.fillStyle(0xffffff, 1).lineStyle(5, HEX.tinta, 1);
    [[-22, 6, 24], [4, -6, 28], [30, 6, 24], [4, 16, 24]].forEach(([x, y, r]) => { gm.fillCircle(x, y, r); gm.strokeCircle(x, y, r); });
    [[-22, 6, 24], [4, -6, 28], [30, 6, 24], [4, 16, 24]].forEach(([x, y, r]) => gm.fillCircle(x, y, r - 2));
    this.mano.add(gm);
    this.mano.add(this.add.text(4, 4, 'shhh', { fontFamily: FUENTE, fontSize: '20px', color: COLOR.tinta }).setOrigin(0.5));

    // HUD.
    this.textoPuntos = texto(this, 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoRacha = texto(this, 150, 80, '', 22, COLOR.verde).setDepth(50);
    texto(this, 1010, 40, 'Ánimo', 24, COLOR.crema).setDepth(50);
    this.gAnimo = this.add.graphics().setDepth(50);
    this.pintarAnimo();
    this.ayuda = texto(this, 640, 46, this.textoAyuda(), 20, COLOR.crema, 560).setDepth(50);
    this.tweens.add({ targets: this.ayuda, alpha: 0, duration: 500, delay: 9000, onComplete: () => this.ayuda.destroy() });

    this.boton = boton(this, 640, 655, MOVIL ? 'SHHH' : 'SHHH (Espacio)', () => this.frenar(), { ancho: 280, alto: 84, tam: 30, color: HEX.amarillo }).setDepth(60);
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.frenar(); });
    this.input.on('pointerdown', (_p, sobre) => { if (!sobre.length) this.frenar(); });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 2000 : 900, () => this.empezarLinea());
  }

  textoAyuda() {
    if (this.nivel <= 1) return 'Pulsa SOLO cuando su burbuja se ponga rosa y tiemble. Si pulsas antes, le tapas de más.';
    if (this.nivel === 2) return 'Si Perico hace «pin pin», no es Palicaso: no pulses. Las pausas son más cortas.';
    return 'Pausas casi sin hueco y el flamenco se le sube solo a la cabeza. Aguanta.';
  }

  tex(k, alt) { return this.textures.exists(k) ? k : (alt || k); }
  bolsa(lista) { let b = []; return () => { if (!b.length) b = Phaser.Utils.Array.Shuffle(lista.slice()); return b.pop(); }; }
  ponerPal(k, alt) { this.pal.setTexture(this.tex(k, alt)).setScale(380 / this.pal.height); }
  ponerBla(k, alt) { this.bla.setTexture(this.tex(k, alt)).setScale(360 / this.bla.height); }

  // ---- Flujo de la conversación ----
  empezarLinea() {
    if (this._acabado) return;
    this.fase = 'habla';
    this.tf = 0;
    this.chars = 0;
    this.huboFallo = false;
    this.txtBla.setText('');
    this.cajaBla.setScale(0.92);
    this.tweens.add({ targets: this.cajaBla, alpha: 1, scale: 1, duration: 180, ease: 'Back.out' });
    this.pips.forEach((p, k) => p.setFillStyle(k < this.linea ? HEX.verde : k === this.linea ? HEX.amarillo : 0x3d3350));
    this.puntos3.setText('');
  }

  empezarPausa() {
    this.fase = 'pausa';
    this.tf = 0;
    const [a, b] = this.dif.pausa;
    this.durPausa = Phaser.Math.FloatBetween(a, b);
    this.falsaEn = null;
    if (this.dif.falsas && this.falsasHechas < 3 && this.linea % 2 === 1 && this.durPausa > 1.5 && this.linea < ESC_LINEAS.length - 1) {
      this.falsaEn = Phaser.Math.FloatBetween(0.3, 0.7);
      this.falsasHechas++;
    }
    // Nivel 3: la historia del flamenco se le sube sola a la cabeza.
    if (this.dif.flamenco && (this.linea === 2 || this.linea === 4)) {
      this.time.delayedCall(250, () => {
        if (this.fase !== 'pausa') return;
        this.presion = Math.max(this.presion, 0.82);
        this.decir('¡Es que el flamenco…!', COLOR.rosa);
      });
    }
  }

  finPausa() {
    if (!this.huboFallo) {
      // Silencio respetado: Blancaso se anima un poco.
      this.sumar(40);
      this.animo = Math.min(100, this.animo + 4);
      this.pintarAnimo();
      this.puntos3.setText('silencio respetado +40').setAlpha(1);
      this.tweens.add({ targets: this.puntos3, alpha: 0, duration: 700, delay: 600 });
    }
    this.linea++;
    if (this.linea >= ESC_LINEAS.length) {
      this.fase = 'silencio';
      this.tf = 0;
      this.txtBla.setText('…');
      this.pips.forEach(p => p.setFillStyle(HEX.verde));
      this.huboFallo = false;
      this.ponerBla('blancaso-esperanza', 'blancaso');
      return;
    }
    this.empezarLinea();
  }

  update(_t, dt) {
    if (this._acabado || !this.pal) return;
    const s = Math.min(dt, 80) / 1000;
    this.tf += s;
    const d = this.dif;
    if (this.fase === 'habla') {
      const n = Math.min(ESC_LINEAS[this.linea].length, Math.floor(this.tf / d.vel));
      if (n !== this.chars) {
        this.chars = n;
        this.txtBla.setText(ESC_LINEAS[this.linea].slice(0, n));
        if (n % 4 === 0) sfx(this, 'pop', { volume: 0.06 });
      }
      this.presion += d.rateH * s;
      if (n >= ESC_LINEAS[this.linea].length) this.empezarPausa();
    } else if (this.fase === 'pausa') {
      this.presion += d.rateP * s;
      this.txtBla.setText(ESC_LINEAS[this.linea] + (this.tf > 0.4 ? ' ' + '.'.repeat(1 + Math.floor(this.tf * 2) % 3) : ''));
      if (this.falsaEn != null && this.tf >= this.falsaEn) { this.falsaEn = null; this.mostrarFalsa(); }
      if (this.tf >= this.durPausa) this.finPausa();
    } else if (this.fase === 'silencio') {
      this.presion += d.rateS * s;
      if (this.nivel >= 1 && !this.tensionDicha && this.tf > 0.6 && typeof Comic !== 'undefined') {
        this.tensionDicha = true;
        Comic.enfasis(this, 'tension', { x: 380, y: 330 });
      }
      if (this.tf >= 5) return this.ganar();
    } else if (this.fase === 'corte') {
      if (this.tf >= 1.5) {
        if (this.animo <= 0) return this.perder();
        this.ponerBla('blancaso-cuenta', 'blancaso');
        this.empezarLinea();
      }
    }
    if (this.fase === 'habla' || this.fase === 'pausa' || this.fase === 'silencio') {
      if (this.presion >= 1) this.interrumpir();
    }
    this.pintarPalicaso();
  }

  // ---- Lo que hace el jugador ----
  frenar() {
    if (this._acabado) return;
    if (!['habla', 'pausa', 'silencio'].includes(this.fase)) return;
    const ahora = this.time.now;
    if (ahora < this.libreDesde) return; // sin ametralladora
    this.libreDesde = ahora + 320;
    const falsa = this.time.now < this.falsaHasta;
    this.animarMano();
    if (this.presion >= ESC_VENT && !falsa) {
      // Freno a tiempo: cuanto más cerca del límite, más puntos.
      const riesgo = Phaser.Math.Clamp((this.presion - ESC_VENT) / (1 - ESC_VENT), 0, 1);
      this.racha++;
      const g = Math.round((60 + 140 * riesgo) * (1 + 0.25 * (Math.min(this.racha, 4) - 1)));
      this.sumar(g);
      this.presion = 0.12;
      this.decir(this.bolsaFreno(), COLOR.crema);
      this.palTex = 'palicaso-callado'; this.palHasta = ahora + 900;
      this.ponerPal('palicaso-callado', 'palicaso');
      this.ponerBla('blancaso-esperanza', 'blancaso'); this.blaHasta = ahora + 1100;
      this.time.delayedCall(1100, () => { if (this.fase !== 'corte' && !this._acabado && this.fase !== 'silencio') this.ponerBla('blancaso-cuenta', 'blancaso'); });
      sfx(this, 'fup', { volume: 0.5 });
      golpeTexto(this, 165, 345, `Shhh · +${g}`, COLOR.verde, 30);
      this.pintar();
    } else {
      // Pulsar cuando no tocaba: le tapas de más y se enfada.
      this.huboFallo = true;
      this.racha = 0;
      this.sumar(-60);
      this.animo = Math.max(0, this.animo - 12);
      this.presion = Math.min(0.98, this.presion + 0.12);
      this.decir(this.bolsaDemas(), COLOR.rosa);
      this.palTex = 'palicaso-contando'; this.palHasta = ahora + 800;
      this.ponerPal('palicaso-contando', 'palicaso');
      sfx(this, 'bonk', { volume: 0.4 });
      golpeTexto(this, 165, 345, falsa ? '¡Era Perico!' : '¡Tapas de más!', COLOR.rosa, 30);
      this.pintar();
      this.pintarAnimo();
      if (this.animo <= 0) this.perder();
    }
  }

  interrumpir() {
    this.huboFallo = true;
    this.racha = 0;
    this.animo = Math.max(0, this.animo - 34);
    this.presion = 0.1;
    const ahora = this.time.now;
    this.palTex = 'palicaso-se-escapa'; this.palHasta = ahora + 1300;
    this.ponerPal('palicaso-se-escapa', 'palicaso-contando');
    this.ponerBla('blancaso-mareado', 'blancaso');
    this.decir('¡Escucha, escucha! ¡Y esta no te la he contado!', COLOR.rosa);
    this.txtBla.setText(this.txtBla.text.replace(/[ .]+$/, '') + '—');
    this.tweens.add({ targets: this.bla, scaleX: this.bla.scaleX * 0.9, scaleY: this.bla.scaleY * 0.9, duration: 160, yoyo: true });
    this.cameras.main.shake(240, 0.008);
    sfx(this, 'oooh', { volume: 0.5 });
    if (typeof Comic !== 'undefined') Comic.enfasis(this, 'chiste', { x: 520, y: 330 });
    this.pintar();
    this.pintarAnimo();
    this.fase = 'corte';
    this.tf = 0;
    if (this.animo <= 0) this.perder();
  }

  mostrarFalsa() {
    this.falsaHasta = this.time.now + 900;
    sfx(this, 'pin-pin', { volume: 0.55 });
    this.perico.setAlpha(1);
    this.tweens.add({ targets: this.perico, x: 1195, duration: 180, ease: 'Back.out' });
    const t = texto(this, 1195, 470, 'Pin pin', 28, COLOR.azul).setDepth(40);
    this.tweens.add({ targets: t, alpha: 0, y: 440, duration: 500, delay: 500, onComplete: () => t.destroy() });
    this.time.delayedCall(900, () => {
      this.tweens.add({ targets: this.perico, x: 1280, alpha: 0, duration: 220 });
    });
  }

  // ---- Final ----
  ganar() {
    if (this._acabado) return;
    this._acabado = true;
    this.fase = 'fin';
    this.ponerPal('palicaso-callado', 'palicaso');
    this.ponerBla('blancaso-alivio', 'blancaso-esperanza');
    this.txtBla.setText('');
    this.cajaBla.setAlpha(0);
    this.presion = 0;
    this.pintarPalicaso();
    this.decir('(silencio)', COLOR.crema, 2600);
    this.sumar(100);
    this.pintar();
    sfx(this, 'campanita', { volume: 0.5 });
    if (typeof Comic !== 'undefined') Comic.enfasis(this, 'ternura', { x: 650, y: 400 });
    this.tweens.add({ targets: this.pal, angle: 3, duration: 700, yoyo: true, repeat: 1, ease: 'Sine.inOut' });
    this.boton.setVisible(false);
    this.time.delayedCall(2700, () => panelFinal(this, {
      titulo: 'El silencio más largo de Unaké',
      linea: 'Palicaso ha escuchado de verdad. Blancaso respira. Por primera vez, a los dos les sobran las palabras.',
      puntos: this.puntos, clave: 'Escucha', gana: true,
    }));
  }

  perder() {
    if (this._acabado) return;
    this._acabado = true;
    this.fase = 'fin';
    this.txtBla.setText('Da igual. Mañana.');
    this.cajaBla.setAlpha(1);
    this.ponerBla('blancaso-mareado', 'blancaso');
    this.tweens.add({ targets: this.bla, x: 1090, alpha: 0.7, duration: 900, ease: 'Sine.inOut' });
    this.boton.setVisible(false);
    this.time.delayedCall(1900, () => panelFinal(this, {
      titulo: 'Da igual. Mañana.',
      linea: 'Blancaso recoge su agenda. Palicaso se queda con la boca abierta y la historia a medias.',
      puntos: this.puntos, clave: 'Escucha', gana: false,
    }));
  }

  // ---- Pintura ----
  sumar(n) {
    this.puntos = Math.max(0, this.puntos + Math.round(n * (n > 0 ? this.dif.mult : 1)));
    this.pintar();
  }

  pintar() {
    this.textoPuntos.setText(`${this.puntos} puntos`);
    this.textoRacha.setText(this.racha > 1 ? `Racha x${Math.min(this.racha, 4)}` : '');
  }

  pintarAnimo() {
    const g = this.gAnimo;
    g.clear();
    g.fillStyle(0x3d3350, 1).fillRoundedRect(1070, 28, 180, 24, 10);
    const w = 180 * Math.max(0, this.animo) / 100;
    if (w > 0) g.fillStyle(this.animo > 40 ? HEX.verde : HEX.rosa, 1).fillRoundedRect(1070, 28, w, 24, 10);
    g.lineStyle(4, HEX.tinta, 1).strokeRoundedRect(1070, 28, 180, 24, 10);
  }

  decir(str, color, ms = 1700) {
    this.fraseP.setText(str).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.fraseP);
    this.tweens.add({ targets: this.fraseP, alpha: 0, duration: 300, delay: ms });
  }

  pintarPalicaso() {
    const p = Phaser.Math.Clamp(this.presion, 0, 1);
    const t = this.time.now;
    // Textura según el momento (si no hay override).
    if (t >= this.palHasta && this.fase !== 'fin') {
      const k = p > 0.5 ? this.tex('palicaso-boca-llena', 'palicaso') : 'palicaso';
      if (this.pal.texture.key !== k) this.ponerPal(k);
    }
    const g = this.gBur;
    g.clear();
    const alta = p >= ESC_VENT;
    const falsa = t < this.falsaHasta;
    const parpadeo = 0.5 + 0.5 * Math.sin(t / (alta ? 70 : 160));
    const tx = alta ? Math.sin(t / 35) * 3 : 0;
    const bx = 380 + tx, by = 190;
    // Mejillas hinchándose.
    const pw = this.pal.displayWidth, ph = this.pal.displayHeight;
    const cy = 660 - ph + ph * 0.44, cx = 380 + pw * 0.02;
    const r = (7 + 20 * p) * (this.pal.scaleY / 0.95);
    g.fillStyle(HEX.rosa, 0.45 + 0.4 * p);
    g.fillCircle(cx - pw * 0.22, cy, Math.min(r, 34)).fillCircle(cx + pw * 0.22, cy, Math.min(r, 34));
    // Burbuja interior.
    g.fillStyle(0xffffff, 0.92).lineStyle(5, HEX.tinta, 1).fillCircle(bx, by, 64).strokeCircle(bx, by, 64);
    const col = falsa ? HEX.azul : alta ? (parpadeo > 0.5 ? HEX.rojo : HEX.rosa) : HEX.amarillo;
    const rad = 8 + 52 * p;
    g.fillStyle(col, falsa ? 0.4 + 0.5 * parpadeo : 1).fillCircle(bx, by, falsa ? 30 + 20 * parpadeo : rad);
    this.txtBur.setPosition(bx, by);
  }

  animarMano() {
    const cx = this.pal.x + this.pal.displayWidth * 0.02;
    const cy = 660 - this.pal.displayHeight + this.pal.displayHeight * 0.5;
    this.tweens.killTweensOf(this.mano);
    this.mano.setPosition(600, 540).setAlpha(1).setScale(1);
    this.tweens.chain({
      targets: this.mano,
      tweens: [
        { x: cx + 40, y: cy, duration: 110, ease: 'Back.out' },
        { scale: 1.08, duration: 120, yoyo: true, hold: 220 },
        { x: 600, y: 540, alpha: 0, duration: 200 },
      ],
    });
  }
}

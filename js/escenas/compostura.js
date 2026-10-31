// La compostura (cap. 7, el entierro de Fortunato en el reservado): Lasslow quiere quedar de señor y no reírse.
// Lo opuesto a «Un señor» (allí había que reír en su sitio; aquí, nunca).
//   RESPIRAR: un aro guía crece (coger aire) y se encoge (soltar). MANTÉN ESPACIO mientras crece y SUELTA
//             cuando se encoge. Si vas al compás, el medidor de risa baja; si no, sube.
//   EMPUJONES: desde los lados, Palicaso empieza un chiste, Cotine ofrece canapés, Niebla pregunta «¿quién
//             se ha muerto?», Perico hace «pin pin». Un anillo se cierra sobre la boca de Lasslow: pulsa ← o →
//             (el lado de donde viene) para taparte la boca justo cuando llega. Si no, se te escapa la risa.
//   Se gana llegando al final del elogio (≈ 50 s) sin que el medidor llegue al tope. Si se desborda, JA…

MISIONES.Compostura = {
  nombre: 'La compostura', sprite: 'lasslow-digno', umbrales: [700, 1300, 1900],
  texto: 'El entierro de Fortunato. MANTÉN ESPACIO al crecer el aro y SUELTA al encogerse. Cuando llegue un chiste, tápate la boca con ← o → (el lado de donde viene).',
};
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Compostura = 'tension';
if (typeof REACCION_PIERDE !== 'undefined') REACCION_PIERDE.Compostura = ['blancaso-mareado', 0xff5fa2];

const COMP_DUR = 50;           // segundos de elogio
const COMP_R0 = 70, COMP_R1 = 135; // radio del aro vacío y lleno
const COMP_GRACIA = 0.3;       // al cambiar de fase hay margen para cambiar de mano
const COMP_TAPA = 0.3;         // lo que dura la mano en la boca
const COMP_ENFRIA = 0.4;       // no puedes taparte sin parar

// Quién empuja, qué dice y desde qué nivel aparece.
const COMP_EMISORES = [
  { id: 'palicaso', tex: ['palicaso-contando', 'palicaso'], nivel: 1, color: 0xffd23f, textos: [
    '¿Sabéis el del pez que entra en un bar?', 'Fortunato y yo una vez… ¡escucha!', 'Era tan callado como yo. Casi.',
    'Se parecía a mi primo, ese que… ¡escucha!', 'Oye, ¿y si el pez era un pez-quemo?',
  ] },
  { id: 'cotine', tex: ['cotine'], nivel: 2, color: 0xff5fa2, textos: [
    '¿Alguien quiere un canapé? Hay para el pez también.', 'Es que el duelo me da hambre.', 'Probad la tartaleta. Yo ya he probado cuatro.',
  ] },
  { id: 'niebla', tex: ['niebla', 'niebla-hablando'], nivel: 2, color: 0x5ad7ff, textos: [
    '¿Quién se ha muerto?', '¿Esto es un cumpleaños? ¿Dónde está la tarta?', '¿Y ese pez es de la familia?',
  ] },
  { id: 'perico', tex: ['perico', 'perico-cotilleando'], nivel: 2, color: 0x7ee081, textos: ['Pin pin… ¡pin pin!', 'Pin pin (le habla al pez).', 'Pin pin. Pin. Pin.'] },
];
const COMP_ELOGIO = [
  'Hoy despedimos a Fortunato. Un pez de pocas palabras.',
  'Nunca llegó tarde. Nunca se quejó de la comida.',
  'Vivió en un vaso, como viven los grandes.',
  'Nadó… con una dignidad que muchos envidiamos.',
  'Y ahora descansa. En una caja de zapatos. Con vistas.',
];
const COMP_FRASES_LASSLOW = [
  'Un señor sabe estar. Un señor sabe estar.', 'Fue un buen pez. JA… fue un buen pez.', 'Respire, caballero. Respire. Re… JA…',
  'No me mire así. No me mire. NO ME MIRE.', 'Pe… ce… ra… Hablo de la pecera. No me haga hablar.',
  'Joven, si me río, dígale a la ciudad que no me conoce.', 'Dignidad, Lasslow, dignidad. Piensa en… en impuestos.',
];

class Compostura extends Phaser.Scene {
  constructor() { super('Compostura'); }

  // Primera textura que exista de una lista (el arte nuevo puede no estar todavía).
  tex(lista) { return [].concat(lista).find(k => this.textures.exists(k)) || null; }

  create(datos) {
    // Todo lo de la partida se reinicia aquí: scene.start reutiliza la instancia.
    this.nivel = Math.min(3, nivelDe('Compostura'));
    this.t = 0;
    this.risa = 30;
    this.puntos = 0;
    this.racha = 0;
    this.aguantados = 0;
    this.activo = false;
    this._acabado = false;
    this.teclaEspacio = false;
    this.botonMantener = false;
    this.pulsaciones = [];
    this.ultimaPulsacion = -9;
    this.empujones = [];
    this.proxEmpujon = 5;
    this.ciclo = { fase: 'in', t: 0, dur: this.durFase() };
    this.radioPropio = COMP_R0;
    this.poseActual = -1;
    this.ultimaVoz = 0;
    this.ultimoAviso = -99;
    this.elogioN = 0;
    this.fraseBolsa = Phaser.Utils.Array.Shuffle(COMP_FRASES_LASSLOW.slice());
    this.proxFrase = 6;
    this.burbujaL = null;
    this.ok = true;

    fondo(this, enMundoHumo() ? 'bg-dentro' : 'bgn-dentro');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.5);
    this.montarEscena();

    this.cx = 520;
    this.cy = 430;
    this.lasslow = this.add.image(this.cx, 604, this.tex(['lasslow-serio', 'lasslow-digno'])).setOrigin(0.5, 1).setDepth(6);
    this.pintarPose(true);

    this.g = this.add.graphics().setDepth(40);
    this.manoG = this.add.graphics().setDepth(41);
    this.etiqueta = texto(this, this.cx, 292, '', 34, COLOR.crema).setDepth(45);
    this.textoPuntos = texto(this, ANCHO - 130, 44, '0 puntos', 28, COLOR.amarillo).setDepth(50);
    this.textoRacha = texto(this, ANCHO - 130, 82, '', 22, COLOR.verde).setDepth(50);
    this.textoElogio = texto(this, ANCHO / 2, 112, '', 24, COLOR.crema, 980).setDepth(50);
    texto(this, 280, 44, 'RISA', 24, COLOR.rosa).setDepth(50);

    this.montarMandos();

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => this.ayuda());
  }

  durFase() {
    if (this.nivel === 1) return 1.9;
    if (this.nivel === 2) return 1.4;
    return Phaser.Math.FloatBetween(0.95, 2.1); // nivel 3: ritmo irregular
  }

  montarEscena() {
    // El ataúd (una caja de zapatos), las velas, el pez y el que vigila: Blancaso, solemne.
    const ataudTex = this.tex('ataud-pez');
    if (ataudTex) {
      const a = this.add.image(900, 612, ataudTex).setOrigin(0.5, 1).setDepth(3);
      a.setScale(150 / a.height);
      this.pez = null;
    } else {
      const c = this.add.graphics().setDepth(3);
      c.fillStyle(HEX.tinta, 1).fillRoundedRect(756, 560, 300, 56, 8);
      c.fillStyle(0x8a5a36, 1).fillRoundedRect(760, 548, 292, 56, 8);
      c.fillStyle(0xb98254, 1).fillRoundedRect(752, 536, 308, 22, 6);
      c.lineStyle(4, HEX.tinta, 1).strokeRoundedRect(760, 548, 292, 56, 8).strokeRoundedRect(752, 536, 308, 22, 6);
      const pezTex = this.tex(['fortunato-muerto', 'fortunato']);
      this.pez = pezTex ? this.add.image(906, 556, pezTex).setOrigin(0.5, 1).setDepth(4) : null;
      if (this.pez) this.pez.setScale(Math.min(110 / this.pez.height, 190 / this.pez.width));
    }
    const velasTex = this.tex('velas');
    if (velasTex) {
      [740, 1072].forEach(x => { const v = this.add.image(x, 614, velasTex).setOrigin(0.5, 1).setDepth(3); v.setScale(110 / v.height); });
    } else {
      [742, 1070].forEach((x, i) => {
        const v = this.add.graphics().setDepth(3);
        v.fillStyle(HEX.tinta, 1).fillRect(x - 9, 530, 18, 86);
        v.fillStyle(0xfff6e8, 1).fillRect(x - 6, 534, 12, 80);
        const l = this.add.ellipse(x, 518, 14, 26, 0xffb43a).setDepth(4);
        this.tweens.add({ targets: l, scaleY: 1.3, duration: 110 + i * 40, yoyo: true, repeat: -1 });
      });
    }
    const bk = this.tex('blancaso');
    if (bk) {
      this.blancaso = this.add.image(1000, 590, bk).setOrigin(0.5, 1).setDepth(2);
      this.blancaso.setScale(180 / this.blancaso.height);
      this.blancaso.setFlipX(true);
    }
    texto(this, 1000, 408, 'Silencio, por favor.', 18, COLOR.crema).setDepth(5).setAlpha(0.7);
  }

  montarMandos() {
    this.input.addPointer(2);
    const alto = 76, y = 674;
    this.btnIzq = boton(this, 165, y, '← TAPAR', () => this.taparse(-1), { ancho: 270, alto, tam: 28, color: HEX.verde }).setDepth(70);
    this.btnMant = boton(this, 640, y, 'MANTÉN: COGER AIRE (ESPACIO)', () => { this.botonMantener = true; }, { ancho: 500, alto, tam: 26 }).setDepth(70);
    this.btnDer = boton(this, 1115, y, 'TAPAR →', () => this.taparse(1), { ancho: 270, alto, tam: 28, color: HEX.verde }).setDepth(70);
    const soltar = () => { this.botonMantener = false; };
    this.btnMant.on('pointerup', soltar);
    this.btnMant.on('pointerout', soltar);
    this.input.on('pointerup', soltar);
    this.input.keyboard.on('keydown-SPACE', () => { this.teclaEspacio = true; });
    this.input.keyboard.on('keyup-SPACE', () => { this.teclaEspacio = false; });
    this.input.keyboard.on('keydown-LEFT', e => { if (!e.repeat) this.taparse(-1); });
    this.input.keyboard.on('keydown-RIGHT', e => { if (!e.repeat) this.taparse(1); });
  }

  get sostiene() { return this.teclaEspacio || this.botonMantener; }

  ayuda() {
    const c = this.add.container(ANCHO / 2, 300).setDepth(90);
    c.add(this.add.graphics().fillStyle(HEX.tinta, 0.9).fillRoundedRect(-520, -150, 1040, 300, 26));
    c.add(texto(this, 0, -108, 'Aguanta la risa. Un señor sabe estar.', 34, COLOR.amarillo));
    c.add(texto(this, 0, -36, 'Aro que CRECE → MANTÉN ESPACIO · Aro que se ENCOGE → SUELTA', 26, COLOR.crema, 980));
    c.add(texto(this, 0, 28, 'Cuando llegue un chiste → pulsa ← o → (el lado de donde viene)', 26, COLOR.verde, 980));
    c.add(texto(this, 0, 96, 'Si el medidor de risa se llena… JA.', 22, COLOR.rosa));
    this.time.delayedCall(4200, () => { c.destroy(); this.activo = true; });
  }

  // ---------- Pose de Lasslow según la risa ----------

  pintarPose(forzar) {
    const n = this.risa < 35 ? 0 : this.risa < 62 ? 1 : this.risa < 85 ? 2 : 3;
    if (!forzar && n === this.poseActual) return;
    this.poseActual = n;
    const claves = [
      ['lasslow-serio', 'lasslow-digno'], ['lasslow-aguanta1', 'lasslow-aguantando'],
      ['lasslow-aguanta2', 'lasslow-aguantando'], ['lasslow-revienta', 'lasslow-risa-floja'],
    ][n];
    this.lasslow.setTexture(this.tex(claves));
    this.escL = 290 / this.lasslow.height;
    this.lasslow.setScale(this.escL);
  }

  // ---------- Mandos ----------

  taparse(lado) {
    if (!this.activo || this._acabado) return;
    if (this.t - this.ultimaPulsacion < COMP_ENFRIA) return;
    this.ultimaPulsacion = this.t;
    this.pulsaciones.push({ t: this.t, lado, usada: false });
    sfx(this, 'pop', { volume: 0.25 });
  }

  // ---------- Empujones ----------

  nuevoEmpujon() {
    const cands = COMP_EMISORES.filter(e => e.nivel <= this.nivel && this.tex(e.tex));
    const emisor = Phaser.Utils.Array.GetRandom(cands);
    const lado = Math.random() < 0.5 ? -1 : 1;
    this.crearEmpujon(emisor, lado, 0);
    // Nivel 3: a veces dos a la vez (uno en cada lado, con medio segundo de diferencia) y, de vez en cuando, falsa alarma.
    if (this.nivel >= 3 && Math.random() < 0.3) {
      const otros = cands.filter(e => e !== emisor);
      this.crearEmpujon(Phaser.Utils.Array.GetRandom(otros.length ? otros : cands), -lado, 0.6);
    } else if (this.nivel >= 3 && Math.random() < 0.25) {
      this.crearEmpujon(null, 0, 1.4, true);
    }
  }

  crearEmpujon(emisor, lado, retraso, falsa = false) {
    const lead = this.nivel === 1 ? 1.9 : this.nivel === 2 ? 1.5 : 1.25;
    const e = { lado, falsa, emisor, spawn: this.t + retraso, llega: this.t + retraso + lead, lead, vivo: false, resuelto: false };
    this.empujones.push(e);
  }

  alAparecer(e) {
    e.vivo = true;
    const x = e.falsa ? 900 : e.lado < 0 ? 140 : 1140;
    if (e.falsa) {
      e.texto = '…¿se ha movido el pez?';
      e.color = 0xb9a8e6;
      if (this.pez) { this.pez.setTexture(this.tex(['fortunato-guino', 'fortunato-muerto', 'fortunato'])); this.pez.setScale(Math.min(110 / this.pez.height, 190 / this.pez.width)); }
      sfx(this, 'suspiro', { volume: 0.4 });
    } else {
      e.texto = Phaser.Utils.Array.GetRandom(e.emisor.textos);
      e.color = e.emisor.color;
      const k = this.tex(e.emisor.tex);
      e.img = this.add.image(x + (e.lado < 0 ? -90 : 90), 612, k).setOrigin(0.5, 1).setDepth(5).setAlpha(0);
      e.img.setScale(240 / e.img.height);
      e.img.setFlipX(e.lado > 0);
      this.tweens.add({ targets: e.img, x, alpha: 1, duration: 260, ease: 'Back.out' });
      e.flecha = texto(this, x, 395, e.lado < 0 ? '←' : '→', 64, COLOR.amarillo).setDepth(46);
      this.tweens.add({ targets: e.flecha, scale: 1.25, duration: 220, yoyo: true, repeat: -1 });
      sfx(this, e.emisor.id === 'perico' ? 'pin-pin' : 'pop', { volume: 0.35 });
    }
    e.burbuja = bocadillo(this, e.falsa ? x : e.lado < 0 ? 200 : 1080, e.falsa ? 300 : 260, e.texto, { tam: 22, ancho: 300 });
    e.burbuja.setDepth(47);
    this.ultimaVoz = this.t;
  }

  resolver(e) {
    e.resuelto = true;
    let cubierto = false;
    if (!e.falsa) {
      const p = this.pulsaciones.find(q => !q.usada && q.lado === e.lado && q.t >= e.llega - COMP_TAPA && q.t <= e.llega + 0.12);
      if (p) { p.usada = true; cubierto = true; }
    }
    if (e.falsa) {
      // Si te tapas por nada, pierdes compostura; si aguantas quieto, premio pequeño.
      const tocaste = this.pulsaciones.some(q => q.t >= e.llega - 0.8 && q.t <= e.llega + 0.12);
      if (tocaste) {
        this.risa = Math.min(100, this.risa + 12);
        golpeTexto(this, 900, 330, '¡Si no era nada!', COLOR.rosa, 34);
        this.racha = 0;
      } else {
        this.puntos += 40;
        golpeTexto(this, 900, 330, 'Falsa alarma · +40', COLOR.verde, 34);
      }
      if (this.pez) { this.pez.setTexture(this.tex(['fortunato-muerto', 'fortunato'])); this.pez.setScale(Math.min(110 / this.pez.height, 190 / this.pez.width)); }
    } else if (cubierto) {
      this.aguantados++;
      this.racha++;
      const pts = 100 + 20 * Math.min(this.racha, 5);
      this.puntos += pts;
      this.risa = Math.max(0, this.risa - 10);
      sfx(this, 'oooh', { volume: 0.25 });
      golpeTexto(this, this.cx, 250, `¡Aguantado! +${pts}`, COLOR.verde, 38);
      if (this.racha > 0 && this.racha % 3 === 0) Comic.racha(this, this.racha, { y: 180 });
    } else {
      // Se te escapa: JI…
      this.racha = 0;
      this.risa = Math.min(100, this.risa + (this.nivel === 1 ? 26 : this.nivel === 2 ? 30 : 34));
      sfx(this, 'risas', { volume: 0.4 });
      this.cameras.main.shake(220, 0.008);
      golpeTexto(this, this.cx, 250, Phaser.Utils.Array.GetRandom(['¡JI…!', '¡PFFF…!', '¡JA…!']), COLOR.rosa, 48);
      if (this.blancaso) this.tweens.add({ targets: this.blancaso, angle: -6, duration: 120, yoyo: true, repeat: 1 });
    }
    // Se retira el que ha empujado.
    if (e.img) this.tweens.add({ targets: e.img, alpha: 0, x: e.img.x + (e.lado < 0 ? -80 : 80), duration: 260, onComplete: () => e.img.destroy() });
    if (e.flecha) e.flecha.destroy();
    if (e.burbuja) this.tweens.add({ targets: e.burbuja, alpha: 0, duration: 220, onComplete: () => e.burbuja.destroy() });
    this.pintarMarcadores();
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const g = this.g;
    g.clear();
    this.manoG.clear();
    if (this._acabado) return;
    const dt = Math.min(dms, 50) / 1000;
    this.pintarMedidor();
    if (!this.activo) { this.dibujarAro(); return; }
    this.t += dt;

    // Respiración: el aro guía alterna coger y soltar aire.
    const c = this.ciclo;
    c.t += dt;
    if (c.t >= c.dur) {
      c.t = 0;
      c.fase = c.fase === 'in' ? 'out' : 'in';
      c.dur = this.durFase();
    }
    const tapando = this.t - this.ultimaPulsacion < COMP_TAPA;
    const gracia = c.t < COMP_GRACIA;
    const alCompas = (c.fase === 'in') === this.sostiene;
    this.ok = gracia || alCompas;
    const sube = this.nivel === 1 ? 8 : this.nivel === 2 ? 11 : 13;
    const baja = this.nivel === 1 ? 10 : this.nivel === 2 ? 8 : 7;
    if (!tapando) {
      this.risa += (this.ok ? -baja : sube) * dt;
      if (this.ok && !gracia) this.puntos += 14 * dt;
    }
    this.risa = Phaser.Math.Clamp(this.risa, 0, 100);

    // Mi pulmón sigue a la mano: crece si mantengo, se vacía si suelto.
    const vel = (COMP_R1 - COMP_R0) / 1.3;
    this.radioPropio = Phaser.Math.Clamp(this.radioPropio + (this.sostiene ? vel : -vel) * dt, COMP_R0, COMP_R1);

    // Empujones.
    if (this.t >= this.proxEmpujon && this.t < COMP_DUR - 3) {
      this.nuevoEmpujon();
      const base = this.nivel === 1 ? [5.2, 6.5] : this.nivel === 2 ? [3.8, 5] : [3.2, 4.2];
      this.proxEmpujon = this.t + Phaser.Math.FloatBetween(base[0], base[1]);
    }
    this.empujones.forEach(e => {
      if (!e.vivo && !e.resuelto && this.t >= e.spawn) this.alAparecer(e);
      if (e.vivo && !e.resuelto && this.t >= e.llega + 0.12) this.resolver(e);
    });
    this.empujones = this.empujones.filter(e => !e.resuelto);

    // Elogio de Blancaso (rótulo) y frases de Lasslow (una voz a la vez).
    const n = Math.min(COMP_ELOGIO.length - 1, Math.floor((this.t / COMP_DUR) * COMP_ELOGIO.length));
    if (n !== this.elogioN - 1) { this.elogioN = n + 1; this.textoElogio.setText(`Blancaso: «${COMP_ELOGIO[n]}»`); }
    const hayVoz = this.empujones.some(e => e.vivo || e.spawn - this.t < 1.5);
    if (this.t >= this.proxFrase && !hayVoz && this.t < COMP_DUR - 4) this.fraseLasslow();

    if (this.risa >= 75 && this.t - this.ultimoAviso > 7) {
      this.ultimoAviso = this.t;
      try { Comic.enfasis(this, 'tension', { x: this.cx, y: 330 }); } catch (err) { /* el efecto es solo adorno */ }
    }

    this.pintarPose(false);
    this.dibujarAro();
    this.temblar(tapando);
    this.textoPuntos.setText(`${Math.round(this.puntos)} puntos`);
    this.textoRacha.setText(this.racha >= 2 ? `Racha x${this.racha}` : '');

    if (this.risa >= 100) return this.terminar(false);
    if (this.t >= COMP_DUR) return this.terminar(true);
  }

  pintarMarcadores() {
    this.textoPuntos.setText(`${Math.round(this.puntos)} puntos`);
    this.textoRacha.setText(this.racha >= 2 ? `Racha x${this.racha}` : '');
  }

  fraseLasslow() {
    if (!this.fraseBolsa.length) this.fraseBolsa = Phaser.Utils.Array.Shuffle(COMP_FRASES_LASSLOW.slice());
    const f = this.fraseBolsa.pop();
    if (this.burbujaL) this.burbujaL.destroy();
    const b = this.burbujaL = bocadillo(this, this.cx, 165, f, { tam: 22, ancho: 380 });
    b.setDepth(47);
    this.time.delayedCall(2600, () => { if (b.active) this.tweens.add({ targets: b, alpha: 0, duration: 200, onComplete: () => b.destroy() }); });
    this.proxFrase = this.t + Phaser.Math.FloatBetween(6.5, 9);
  }

  dibujarAro() {
    const g = this.g, c = this.ciclo;
    const p = Phaser.Math.Clamp(c.t / c.dur, 0, 1);
    const e = Phaser.Math.Easing.Sine.InOut(p);
    const rGuia = c.fase === 'in' ? Phaser.Math.Linear(COMP_R0, COMP_R1, e) : Phaser.Math.Linear(COMP_R1, COMP_R0, e);
    const col = this.ok ? 0x7ee081 : HEX.rojo;
    // Mi pulmón (relleno) y el aro guía (borde blanco): hay que casar uno con otro.
    g.lineStyle(16, col, 0.28).strokeCircle(this.cx, this.cy, this.radioPropio);
    g.lineStyle(5, col, 0.9).strokeCircle(this.cx, this.cy, this.radioPropio);
    g.lineStyle(10, 0xffffff, 0.95).strokeCircle(this.cx, this.cy, rGuia);
    if (this.activo) {
      this.etiqueta.setText(c.fase === 'in' ? 'COGE AIRE' : 'SUELTA').setColor(this.ok ? COLOR.verde : COLOR.rosa);
    } else this.etiqueta.setText('');
    // Anillos que se cierran sobre la boca: cada empujón avisa de dónde viene y cuándo llega.
    const bx = this.cx, by = 372;
    this.empujones.forEach(em => {
      if (!em.vivo || em.resuelto) return;
      const k = Phaser.Math.Clamp((this.t - em.spawn) / em.lead, 0, 1);
      if (em.falsa) {
        g.lineStyle(4, 0xb9a8e6, 0.7).strokeCircle(900, 520, Phaser.Math.Linear(110, 40, k));
        return;
      }
      const r = Phaser.Math.Linear(190, 34, k);
      g.lineStyle(8, em.color, 0.95).strokeCircle(bx, by, r);
      g.lineStyle(3, 0xffffff, 0.9).strokeCircle(bx, by, 34);
      const sx = em.lado < 0 ? 210 : 1070;
      g.lineStyle(3, em.color, 0.35).lineBetween(sx, 420, bx, by);
    });
    // La mano en la boca.
    const tapa = this.t - this.ultimaPulsacion;
    if (this.activo && tapa < COMP_TAPA && this.ultimaPulsacion >= 0) {
      const lado = this.pulsaciones.length ? this.pulsaciones[this.pulsaciones.length - 1].lado : 1;
      this.manoG.fillStyle(0xf4c27a, 1).lineStyle(5, HEX.tinta, 1);
      this.manoG.fillEllipse(bx + lado * 8, by + 6, 74, 52).strokeEllipse(bx + lado * 8, by + 6, 74, 52);
    }
  }

  temblar(tapando) {
    // Cuanta más risa, más tiembla.
    const f = this.risa / 100;
    this.lasslow.x = this.cx + Math.sin(this.time.now / 28) * (f * f * 7 + (tapando ? 1 : 0));
    this.lasslow.y = 604 + Math.abs(Math.sin(this.time.now / 45)) * f * f * -4;
    this.lasslow.setScale(this.escL * (1 + Math.max(0, f - 0.5) * 0.08), this.escL * (1 - Math.max(0, f - 0.5) * 0.04));
  }

  pintarMedidor() {
    const g = this.g;
    const x = 340, y = 30, w = 600, h = 28;
    g.fillStyle(HEX.tinta, 0.9).fillRoundedRect(x - 6, y - 6, w + 12, h + 12, 14);
    const f = this.risa / 100;
    const col = f < 0.5 ? 0x7ee081 : f < 0.78 ? HEX.amarillo : HEX.rojo;
    g.fillStyle(col, 1).fillRoundedRect(x, y, Math.max(6, w * f), h, 10);
    // El elogio avanza hasta el final.
    const pr = Math.min(1, this.t / COMP_DUR);
    g.fillStyle(HEX.tinta, 0.8).fillRoundedRect(x, 74, w, 12, 6);
    g.fillStyle(0xb9a8e6, 1).fillRoundedRect(x, 74, Math.max(6, w * pr), 12, 6);
  }

  // ---------- Final ----------

  // Público para poder forzar el resultado en las pruebas.
  terminar(gana) {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.g.clear();
    this.manoG.clear();
    this.etiqueta.setText('');
    this.empujones.forEach(e => { if (e.burbuja) e.burbuja.destroy(); if (e.flecha) e.flecha.destroy(); if (e.img) e.img.destroy(); });
    this.empujones = [];
    if (this.burbujaL) this.burbujaL.destroy();
    [this.btnIzq, this.btnMant, this.btnDer].forEach(b => b && b.setVisible(false));
    if (gana) {
      this.puntos += 200; // el bonus de llegar entero al final del elogio
      this.pintarPose(true);
      this.lasslow.setTexture(this.tex(['lasslow-serio', 'lasslow-digno'])).setScale(this.escL);
      sfx(this, 'suspiro', { volume: 0.5 });
      bocadillo(this, this.cx, 230, 'Descanse en… JA… paz.', { tam: 24, ancho: 360 }).setDepth(47);
    } else {
      this.lasslow.setTexture(this.tex(['lasslow-revienta', 'lasslow-rodando', 'lasslow-risa-floja'])).setScale(250 / this.lasslow.height);
      this.lasslow.y = 604;
      sfx(this, 'risa-lasslow');
      this.cameras.main.shake(500, 0.015);
      golpeTexto(this, this.cx, 260, '¡JAJAJAJAJA!', COLOR.rosa, 62);
    }
    this.textoPuntos.setText(`${Math.round(this.puntos)} puntos`);
    const puntos = Math.round(this.puntos);
    this.time.delayedCall(gana ? 1500 : 1400, () => panelFinal(this, {
      titulo: gana ? 'Fortunato descansa en paz' : '¡JAJAJAJA!',
      linea: gana
        ? 'Lasslow ha aguantado todo el elogio. Dignidad intacta. Casi.'
        : 'Se ha oído en todo el reservado. Blancaso no te lo perdona.',
      puntos, clave: 'Compostura', gana,
    }));
  }
}

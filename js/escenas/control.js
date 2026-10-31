// El control (el giro de «La furgo»): luces azules y un agente del humo (un figurante con gorra) se asoma
// a la ventanilla del conductor. Hay que disimular:
//   · humo dentro de la furgo → V (ventanilla) antes de que lo vea
//   · ojos rojos cuando te mira a la cara → G (gafas)
//   · si va Lasslow, le entra la risa → L (mano en la boca)
//   · si va Perico, va a soltar el pin pin → P (chistar)
//   · si va Cotine, se está comiendo algo → C (esconderlo)
// Además el agente hace preguntas con 3 respuestas (1, 2, 3 o tocando): una normal, una sospechosa y una
// absurda que a veces cuela. La barra de sospecha sube con los fallos y baja con las respuestas buenas:
// si llega arriba, «bajen del vehículo». Ganas si aguantas todas las preguntas.
// Lee ESTADO.furgoAcompanantes (los que se llevó «La furgo»): cuantos más van, más cosas que tapar.

MISIONES.Control = {
  nombre: 'El control', sprite: 'vuper', umbrales: [600, 1100, 1700],
  texto: 'Un control de los agentes del humo. Tapa lo que te delata a tiempo (V ventanilla, G gafas, L, P, C) y contesta con cabeza: 1, 2 o 3. Que la sospecha no llegue arriba.',
};
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.Control = 'sigilo';
if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.Control = 'iris';
if (typeof REACCION_PIERDE !== 'undefined') REACCION_PIERDE.Control = ['lasslow-horror', 0x96c846];

const CTL_POR_DEFECTO = ['lasslow', 'perico'];

// Lo que te puede delatar. «quien» es el acompañante que lo provoca (null: siempre puede pasar).
const TELLS = {
  humo: { tecla: 'v', nombre: 'Ventanilla', quien: null, color: 0x9fe7ff },
  ojos: { tecla: 'g', nombre: 'Gafas', quien: null, color: 0xffd23f },
  risa: { tecla: 'l', nombre: 'Mano en la boca', quien: 'lasslow', color: 0xffb38a },
  pinpin: { tecla: 'p', nombre: 'Chistar', quien: 'perico', color: 0xd0d4dc },
  comer: { tecla: 'c', nombre: 'Esconder', quien: 'cotine', color: 0xff8fc0 },
};
const TELL_ORDEN = ['humo', 'ojos', 'risa', 'pinpin', 'comer'];

// Preguntas: n = normal, s = sospechosa, a = absurda (a veces cuela). `quien`: solo si va ese acompañante.
const PREGUNTAS_LOCALES = [
  { q: '¿De dónde venís?', n: 'De cenar con unos amigos, agente.', s: 'De… una reunión. De humo. De trabajo.', a: 'De una feria. De la del año 3000.' },
  { q: '¿Han tomado algo?', n: 'Un café. Y yo, unas pipas.', s: 'Depende de qué entienda usted por «algo».', a: 'Yo, un bocata. Los de atrás, de todo un poco.' },
  { q: '¿Qué es ese olor?', n: 'Ambientador de pino, agente. Nuevo.', s: '¿Qué olor? ¿Usted huele algo? ¿Yo huelo?', a: 'Es el perfume de la furgo: «Neblina nocturna».' },
  { q: '¿Adónde se dirigen?', n: 'A una feria, agente. Con la familia.', s: 'A un sitio donde no hay controles.', a: 'A ver una vaca con patines.' },
  { q: '¿Me enseña la documentación?', n: 'Aquí la tiene. Todo en regla.', s: 'Se la doy en cuanto la encuentre. Entre los papeles.', a: '¿Aceptan monchis como documentación?' },
  { q: '¿Siempre van tantos en la furgo?', n: 'Es de la asociación, agente.', s: '¿Cuántos ve usted? Porque yo cuento menos.', a: 'Los de atrás son de adorno.', min: 2 },
  { q: '¿Ese pájaro tiene papeles?', n: 'Tiene pasaporte. Y plumas en regla.', s: 'Es un loro. No habla. Calla, Perico.', a: 'Es el copiloto. Conduce en la próxima.', quien: 'perico' },
  { q: '¿Por qué se ríe el de atrás?', n: 'Le han contado un chiste, agente.', s: '¡Yo no le he dado nada!', a: 'Se ríe por no llorar. Es un señor.', quien: 'lasslow' },
  { q: '¿Por qué huele a azúcar quemado?', n: 'Llevamos unas rosquillas.', s: 'Esto… ¿qué azúcar? ¿Quemado?', a: 'Es el nuevo perfume de la furgo: «Feria».', quien: 'cotine' },
  { q: '¿Quién es el dueño de esa furgo?', n: 'Un amigo. Palicaso. Es muy buena gente.', s: 'Es… de un primo. Que no existe.', a: 'La furgo es mía. La compré con monchis.' },
];

// Pasa las preguntas del guionista (cap-furgo.js) al formato interno. «si» = acompañantes (cualquiera de ellos).
function bancoPreguntas() {
  if (typeof PREGUNTAS_CONTROL !== 'undefined' && Array.isArray(PREGUNTAS_CONTROL) && PREGUNTAS_CONTROL.length) {
    return PREGUNTAS_CONTROL.map(p => ({
      id: p.id, q: p.pregunta, quien: p.si || null, primera: !!p.primera,
      n: p.normal.texto, s: p.sospechosa.texto, a: p.absurda.texto,
      rn: p.normal.agente, rs: p.sospechosa.agente, ra: p.absurda.agente, cuela: p.absurda.cuela,
    }));
  }
  return PREGUNTAS_LOCALES.map(p => ({ ...p, quien: p.quien ? [p.quien] : null }));
}

// Una frase del guionista (AGENTE_CONTROL) o la de respaldo.
function frAgente(clave, defecto, i = -1) {
  const l = typeof AGENTE_CONTROL !== 'undefined' && AGENTE_CONTROL[clave] ? AGENTE_CONTROL[clave] : null;
  if (!l || !l.length) return defecto;
  return i >= 0 && l[i] ? l[i] : Phaser.Utils.Array.GetRandom(l);
}

// Lo que se le escapa (o se le tapa) a cada acompañante (ESCAPES_CONTROL).
const ESCAPE_DE = { risa: 'lasslow', pinpin: 'perico', comer: 'cotine' };
function frEscape(tipo, que) {
  const id = ESCAPE_DE[tipo];
  const e = typeof ESCAPES_CONTROL !== 'undefined' && ESCAPES_CONTROL[id] ? ESCAPES_CONTROL[id] : null;
  if (!e) return null;
  const v = e[que];
  return Array.isArray(v) ? Phaser.Utils.Array.GetRandom(v) : v || null;
}

const REACCION_AGENTE = {
  n: ['Mm. Siga, siga.', 'Vale, vale…', 'Eso cuadra.'],
  s: ['Qué raro… ¿seguro?', 'Mm. Eso me suena fatal.', '¿Cómo ha dicho?'],
  acuela: ['Ja. Circulen, circulen.', '…Eso me ha hecho gracia. Siga.'],
  afalla: ['¿Cómo dice?', 'Esa respuesta no tiene sentido.'],
  tarde: ['¿Hola? ¿Me escuchan?', '¿Se han dormido?'],
};

// Frases del agente cuando algo se ve (una por tipo de delator).
const AGENTE_VE = {
  humo: ['¿Eso es humo?', '¿Por qué hay tanta niebla ahí dentro?'],
  ojos: ['Esos ojos…', 'Míreme a la cara. Esos ojos…'],
  risa: ['¿De qué se ríe ese?', '¿Qué es tan gracioso?'],
  pinpin: ['¿Quién ha dicho «pin pin»?', '¿Eso es un pájaro?'],
  comer: ['¿Eso es comida?', '¿Qué mastica ese?'],
  mal: ['¿Todo bien? Se mueven mucho.', 'Quietos ahí, que me ponen nervioso.'],
};

function bolsaDe(lista) {
  let b = [];
  return () => { if (!b.length) b = Phaser.Utils.Array.Shuffle(lista.slice()); return b.pop(); };
}

class Control extends Phaser.Scene {
  constructor() { super('Control'); }

  create(datos) {
    if (typeof texturasFurgo === 'function') texturasFurgo(this);
    hacerTextura(this, 'ct-gota', 24, 34, g => {
      g.fillStyle(0x9fe7ff, 1).fillTriangle(12, 2, 3, 20, 21, 20).fillCircle(12, 22, 9).lineStyle(3, HEX.tinta, 1).strokeCircle(12, 22, 9);
      g.fillStyle(0xffffff, 0.8).fillCircle(9, 20, 2.5);
    });
    if (!this.textures.exists('ct-vineta')) {
      const c = this.textures.createCanvas('ct-vineta', 640, 360);
      const ctx = c.getContext();
      const gr = ctx.createRadialGradient(320, 180, 110, 320, 180, 380);
      gr.addColorStop(0, 'rgba(130,0,30,0)');
      gr.addColorStop(1, 'rgba(130,0,30,0.95)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, 640, 360);
      c.refresh();
    }

    // Todo lo de la partida se reinicia aquí.
    this.datos = datos || {};
    this.fase = 'intro';
    this.sosp = 15;
    this.puntos = 0;
    this.preg = 0;
    this.nivel = nivelDe('Control');
    this.total = Math.min(9, 5 + this.nivel);
    this.tiempoQ = Math.max(5.5, 9.5 - 0.5 * (this.nivel - 1));
    this.plazo = Math.max(1.3, 2.5 - 0.15 * (this.nivel - 1));
    this.activos = [];
    this.programa = [];
    this.tq = 0;
    this.tPreg = 0;
    this.q = null;
    this.orden = [];
    this.respondida = false;
    this.malCD = 0;
    this.fallos = 0;
    this.aciertosTell = 0;
    this.comp = (acompanantesFurgo() || CTL_POR_DEFECTO).slice();
    this.tellsOk = TELL_ORDEN.filter(t => !TELLS[t].quien || this.comp.indexOf(TELLS[t].quien) >= 0);
    this.maxSim = this.comp.length >= 3 ? 2 : 1;
    this.sacaTell = bolsaDe(this.tellsOk);
    const apto = p => (!p.quien || p.quien.some(id => this.comp.indexOf(id) >= 0)) && (!p.min || this.comp.length >= p.min);
    const banco = bancoPreguntas();
    // La pregunta marcada «primera» sale siempre la primera vez que se juega El control; luego entra en el sorteo.
    this.primera = banco.find(p => p.primera && apto(p)) || null;
    this.usaPrimera = !!this.primera && stat('control_primera') === 0;
    this.listaPreg = banco.filter(p => apto(p) && !(this.usaPrimera && p.primera));
    this.sacaPreg = bolsaDe(this.listaPreg.map((_, i) => i));
    this.pas = {};
    this.gaze = { x: 0, y: 0, tx: 0, ty: 0, t: 0 };
    this.sudor = 1;
    this.latidoOn = false;
    this.cuarto = 0;
    this.quipT = 6;

    this.montarEscenario();
    this.montarAgente();
    this.montarInterior();
    this.montarUi();
    this.input.keyboard.on('keydown', e => this.tecla(e));

    entrar(this, datos);
    // El agente llega de la oscuridad entre luces azules.
    this.agente.x = -260;
    this.time.delayedCall(datos && datos.rotulo ? 1700 : 250, () => {
      sfx(this, 'puerta', { volume: 0.35 });
      this.tweens.add({ targets: this.agente, x: 200, duration: 1100, ease: 'Back.out' });
      this.time.delayedCall(1300, () => this.hablaAgente(frAgente('acercarse', 'Buenas noches. Control rutinario.', 0), () => this.siguientePregunta(), 900));
    });
    this.latido();
  }

  // ---------------------------------------------------------------- montaje

  montarEscenario() {
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x0e0a1a).setDepth(0);
    // Luces azules y rojas del coche del agente, alternándose por la pared de la noche.
    this.luzA = this.add.circle(120, 160, 260, 0x2a6bff, 1).setAlpha(0.0).setDepth(1);
    this.luzR = this.add.circle(ANCHO - 100, 200, 280, 0xff3b30, 1).setAlpha(0.0).setDepth(1);
    this.tweens.add({ targets: this.luzA, alpha: { from: 0.05, to: 0.3 }, duration: 420, yoyo: true, repeat: -1, hold: 120 });
    this.tweens.add({ targets: this.luzR, alpha: { from: 0.3, to: 0.05 }, duration: 420, yoyo: true, repeat: -1, hold: 120 });
    // Interior de la furgo (lo que se ve por la ventanilla).
    if (this.textures.exists('bg-ventanilla')) {
      const f = this.add.image(810, 234, 'bg-ventanilla').setDepth(2);
      f.setScale(Math.max(860 / f.width, 340 / f.height));
    } else {
      this.add.rectangle(810, 234, 860, 340, 0x241a3a).setDepth(2);
      this.add.rectangle(810, 340, 860, 130, 0x2e2248, 1).setDepth(2);
      this.add.ellipse(1085, 150, 360, 260, 0x4a3a78, 0.35).setDepth(2); // brillo del salpicadero
    }
    // Puerta de la furgo: el marco de la ventanilla (el hueco se queda abierto).
    const m = this.add.graphics().setDepth(12);
    m.fillStyle(0xe9dfcf, 1);
    m.fillRect(340, 34, 940, 30).fillRect(340, 404, 940, 20).fillRect(340, 34, 40, 390).fillRect(1240, 34, 40, 390);
    m.fillStyle(0xff5fa2, 1).fillRect(340, 404, 940, 8);
    m.lineStyle(7, HEX.tinta, 1).strokeRect(380, 64, 860, 340).strokeRect(340, 34, 940, 390);
    // Espejo y manilla.
    m.fillStyle(0x6b5f86, 1).fillRoundedRect(300, 160, 46, 110, 12).lineStyle(5, HEX.tinta, 1).strokeRoundedRect(300, 160, 46, 110, 12);
    m.fillStyle(0xbdb3d0, 1).fillRoundedRect(1160, 408, 80, 10, 5);
    // Cristal de la ventanilla: se baja con V.
    this.cristal = this.add.rectangle(810, 64, 860, 340, 0x9fe7ff, 0.14).setOrigin(0.5, 0).setDepth(10);
    // Humo dentro de la furgo (sube cuando pasa algo).
    this.humos = [];
    for (let i = 0; i < 6; i++) {
      const h = this.add.image(480 + i * 150, 250 + (i % 2) * 40, 'fu-humo').setDepth(9).setAlpha(0).setScale(1.2 + (i % 3) * 0.3);
      this.humos.push(h);
    }
    this.vineta = this.add.image(ANCHO / 2, ALTO / 2, 'ct-vineta').setDisplaySize(ANCHO, ALTO).setAlpha(0).setDepth(50);
    // Panel de abajo (preguntas y mandos).
    const g = this.add.graphics().setDepth(40);
    g.fillStyle(0x15102a, 1).fillRect(0, 424, ANCHO, ALTO - 424).lineStyle(6, HEX.tinta, 1).lineBetween(0, 424, ANCHO, 424);
  }

  montarAgente() {
    const k = this.textures.exists('obj-agente') ? 'obj-agente' : null;
    const c = this.add.container(200, 262).setDepth(20);
    if (k) {
      const im = this.add.image(0, 20, k);
      im.setScale(380 / im.height);
      c.add(im);
      this.pupilas = null;
    } else {
      const g = this.add.graphics();
      // Hombros de uniforme azul, con su placa.
      g.fillStyle(0x2b3f7a, 1).fillRoundedRect(-150, 96, 300, 190, 46).lineStyle(7, HEX.tinta, 1).strokeRoundedRect(-150, 96, 300, 190, 46);
      g.fillStyle(0xffd23f, 1).fillCircle(78, 160, 18).lineStyle(5, HEX.tinta, 1).strokeCircle(78, 160, 18);
      g.fillStyle(0x1f2d5c, 1).fillTriangle(-26, 100, 26, 100, 0, 150);
      // La cabeza de nube (primero los contornos, luego el relleno: se funden).
      const bolas = [[0, 0, 108], [-98, 14, 62], [98, 14, 62], [-64, -70, 62], [64, -70, 62], [0, -96, 56], [-68, 74, 60], [68, 74, 60], [0, 86, 66]];
      bolas.forEach(([x, y, r]) => g.fillStyle(0xb9b7c6, 1).fillCircle(x, y, r).lineStyle(7, HEX.tinta, 1).strokeCircle(x, y, r));
      bolas.forEach(([x, y, r]) => g.fillStyle(0xb9b7c6, 1).fillCircle(x, y, r - 3.5));
      g.fillStyle(0xd9d7e4, 1).fillCircle(-40, -40, 22).fillCircle(60, -18, 12);
      // Gorra azul.
      g.fillStyle(0x2457c5, 1).fillEllipse(0, -116, 214, 100).lineStyle(7, HEX.tinta, 1).strokeEllipse(0, -116, 214, 100);
      g.fillStyle(0x1a3f94, 1).fillRect(-107, -100, 214, 26).fillEllipse(0, -70, 262, 30).lineStyle(6, HEX.tinta, 1).strokeEllipse(0, -70, 262, 30);
      g.fillStyle(0xffd23f, 1).fillCircle(0, -128, 16).lineStyle(4, HEX.tinta, 1).strokeCircle(0, -128, 16);
      c.add(g);
      // Ojos que miran (las pupilas se mueven).
      const o = this.add.graphics();
      [-44, 44].forEach(x => o.fillStyle(0xffffff, 1).fillCircle(x, -10, 27).lineStyle(6, HEX.tinta, 1).strokeCircle(x, -10, 27));
      c.add(o);
      this.pupilas = [-44, 44].map(x => { const p = this.add.circle(x, -10, 11, HEX.tinta); c.add(p); p.bx = x; return p; });
      this.cejas = [-1, 1].map(s => { const r = this.add.rectangle(s * 44, -46, 54, 10, HEX.tinta); c.add(r); r.s = s; return r; });
      this.boca = this.add.ellipse(0, 52, 56, 10, 0x2a1530).setStrokeStyle(4, HEX.tinta);
      c.add(this.boca);
    }
    this.agente = c;
    this.agX = 200;
  }

  // Los de dentro: el conductor (Vuper, con sudor) y los acompañantes sentados detrás.
  montarInterior() {
    const kv = this.textures.exists('vuper') ? 'vuper' : 'vuper-normal';
    this.vuper = this.add.container(1085, 404).setDepth(8);
    this.vImg = this.add.image(0, 0, kv).setOrigin(0.5, 1);
    this.vImg.setScale(222 / this.vImg.height);
    this.vuper.add(this.vImg);
    const W = this.vImg.displayWidth, H = this.vImg.displayHeight;
    this.vW = W; this.vH = H;
    // Ojos rojos y gafas (se miden sobre la cara del dibujo).
    this.ojosRojos = this.add.graphics();
    [0.33, 0.575].forEach(f => {
      const x = (f - 0.5) * W, y = -H * 0.57;
      this.ojosRojos.fillStyle(0xff3b3b, 0.7).fillCircle(x, y, W * 0.058).lineStyle(3, 0xc01020, 1).strokeCircle(x, y, W * 0.058);
      this.ojosRojos.lineStyle(2, 0xc01020, 1).lineBetween(x - W * 0.04, y, x + W * 0.04, y - 4);
    });
    this.ojosRojos.setAlpha(0);
    this.vuper.add(this.ojosRojos);
    const kg = this.textures.exists('obj-acc-gafas') ? 'obj-acc-gafas' : null;
    if (kg) { this.gafas = this.add.image(0.04 * W, -H * 0.57, kg); this.gafas.setScale(W * 0.62 / this.gafas.width); }
    else {
      this.gafas = this.add.graphics();
      this.gafas.fillStyle(HEX.tinta, 1).fillRoundedRect(-W * 0.26, -H * 0.62, W * 0.22, H * 0.12, 8).fillRoundedRect(W * 0.04, -H * 0.62, W * 0.22, H * 0.12, 8);
    }
    this.gafas.setVisible(false);
    this.vuper.add(this.gafas);
    flotarSuave(this, this.vuper, 4);

    // Acompañantes: sentados en el asiento de atrás, en la ventanilla.
    this.comp.forEach((id, i) => {
      const A = ACOMP[id];
      const x = 560 + i * 170;
      const cont = this.add.container(x, 404).setDepth(6 + i * 0.1);
      const img = this.add.image(0, 0, A.cara).setOrigin(0.5, 1);
      img.setScale(168 / img.height);
      cont.add(img);
      cont.img = img;
      cont.id = id;
      cont.h = img.displayHeight;
      cont.base = img.scaleX;
      this.pas[id] = cont;
      flotarSuave(this, cont, 3, 1700 + i * 200);
    });
    // Mano de Lasslow sobre la boca.
    if (this.pas.lasslow) {
      const p = this.pas.lasslow;
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1).fillCircle(0, 0, 30).lineStyle(6, HEX.tinta, 1).strokeCircle(0, 0, 30);
      [-18, -6, 6, 18].forEach(x => g.fillStyle(0xffffff, 1).fillRoundedRect(x - 5, -44, 10, 22, 5).lineStyle(4, HEX.tinta, 1).strokeRoundedRect(x - 5, -44, 10, 22, 5));
      g.setPosition(0, -p.h * 0.32).setVisible(false);
      p.add(g);
      p.mano = g;
    }
  }

  montarUi() {
    // Marcadores: puntos, pregunta y barra de sospecha (lo importante, bien visible).
    this.add.rectangle(ANCHO / 2, 25, ANCHO, 50, HEX.tinta, 0.85).setDepth(60);
    this.txtPuntos = texto(this, 130, 25, '0 puntos', 26, COLOR.amarillo).setDepth(61);
    this.txtPreg = texto(this, 430, 25, '', 24, COLOR.crema).setDepth(61);
    texto(this, 706, 25, 'Sospecha', 20, COLOR.crema).setDepth(61);
    this.add.rectangle(1015, 25, 450, 26, 0x000000, 0.6).setStrokeStyle(4, HEX.crema).setDepth(61);
    this.barra = this.add.rectangle(791, 25, 4, 20, 0x7ee081).setOrigin(0, 0.5).setDepth(62);
    // Caja de lo que dice el agente.
    const caja = this.add.graphics().setDepth(60);
    caja.fillStyle(0xfff6e8, 1).fillRoundedRect(24, 432, 1232, 70, 24).lineStyle(6, HEX.tinta, 1).strokeRoundedRect(24, 432, 1232, 70, 24);
    this.txtAgente = this.add.text(ANCHO / 2, 467, '', { fontFamily: FUENTE, fontSize: `${MOVIL ? 32 : 32}px`, color: COLOR.tinta, align: 'center', wordWrap: { width: 1170 } }).setOrigin(0.5).setDepth(61);
    // Tiempo para contestar.
    this.barraT = this.add.rectangle(24, 511, 1232, 8, 0xffd23f).setOrigin(0, 0.5).setDepth(61).setAlpha(0);
    // Respuestas (1, 2, 3).
    this.btnR = [0, 1, 2].map(i => {
      const b = boton(this, 220 + i * 420, 560, '', () => this.responder(i), { ancho: 396, alto: 80, tam: 21, color: [HEX.amarillo, HEX.azul, HEX.rosa][i] }).setDepth(61);
      b.setVisible(false);
      return b;
    });
    // Mandos de tapar: iconos grandes (valen para el móvil y enseñan la tecla en PC).
    const lista = this.tellsOk;
    const sep = 150;
    this.btnT = {};
    lista.forEach((t, i) => {
      const x = ANCHO / 2 + (i - (lista.length - 1) / 2) * sep;
      const c = this.add.container(x, 646).setDepth(61);
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 1).fillCircle(3, 5, 36).fillStyle(TELLS[t].color, 1).fillCircle(0, 0, 36).lineStyle(6, HEX.tinta, 1).strokeCircle(0, 0, 36);
      c.add(g);
      const ic = this.add.graphics().setScale(0.8);
      iconoTell(ic, t);
      c.add(ic);
      const k = this.add.text(-30, -34, TELLS[t].tecla.toUpperCase(), { fontFamily: FUENTE, fontSize: '22px', color: COLOR.tinta, backgroundColor: COLOR.crema, padding: { x: 7, y: 1 } }).setOrigin(0.5);
      c.add(k);
      c.add(this.add.text(0, 52, TELLS[t].nombre, { fontFamily: FUENTE, fontSize: `${MOVIL ? 20 : 18}px`, color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 4 }).setOrigin(0.5));
      c.setSize(90, 90).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => { this.pulsa(t); this.tweens.add({ targets: c, scale: 0.9, duration: 60, yoyo: true }); });
      this.btnT[t] = c;
    });
    // Insignias con cuenta atrás sobre el que se delata.
    this.insig = {};
    this.tellsOk.forEach(t => {
      const c = this.add.container(0, 0).setDepth(55).setVisible(false);
      const g = this.add.graphics();
      const a = this.add.graphics();
      const l = this.add.text(0, 0, TELLS[t].tecla.toUpperCase(), { fontFamily: FUENTE, fontSize: '40px', color: COLOR.tinta }).setOrigin(0.5);
      c.add([g, a, l]);
      g.fillStyle(0xfff6e8, 1).fillCircle(0, 0, 38).lineStyle(6, HEX.tinta, 1).strokeCircle(0, 0, 38);
      c.arco = a;
      this.insig[t] = c;
    });
  }

  // ---------------------------------------------------------------- entradas

  tecla(e) {
    const k = String(e.key || '').toLowerCase();
    if (k === '1' || k === '2' || k === '3') return this.responder(Number(k) - 1);
    const t = TELL_ORDEN.find(x => TELLS[x].tecla === k);
    if (t) this.pulsa(t);
  }

  // El agente habla en la caja (letra a letra, con la boca moviéndose).
  hablaAgente(str, alAcabar, espera = 0) {
    if (this.ev) this.ev.remove();
    this.txtAgente.setText('');
    let k = 0;
    const talk = this.boca ? this.tweens.add({ targets: this.boca, scaleY: { from: 1, to: 2.8 }, duration: 110, yoyo: true, repeat: -1 }) : null;
    this.ev = this.time.addEvent({
      delay: 22, repeat: str.length - 1,
      callback: () => {
        k++;
        this.txtAgente.setText(str.slice(0, k));
        if (k >= str.length) {
          if (talk) { talk.stop(); this.boca.setScale(1); }
          if (alAcabar) this.time.delayedCall(espera, alAcabar);
        }
      },
    });
  }

  siguientePregunta() {
    if (this._acabado) return;
    if (this.preg >= this.total) { this.fase = 'acabando'; this.espera = 0; return; }
    this.preg++;
    let q;
    if (this.usaPrimera && this.preg === 1) { q = this.primera; sumarStat('control_primera'); }
    else q = this.listaPreg[this.sacaPreg()];
    this.q = q;
    this.respondida = false;
    // Tres respuestas en orden barajado: normal, sospechosa, absurda.
    this.orden = Phaser.Utils.Array.Shuffle(['n', 's', 'a']);
    this.txtPreg.setText(`Pregunta ${this.preg} de ${this.total}`);
    this.txtAgente.setFontSize(q.q.length > 58 ? 26 : 32);
    this.hablaAgente(q.q, () => {
      if (this._acabado) return;
      this.fase = 'pregunta';
      this.tq = this.tiempoQ;
      this.tPreg = 0;
      this.barraT.setAlpha(1);
      this.btnR.forEach((b, i) => {
        const tx = `${i + 1} · ${q[this.orden[i]]}`;
        b.etiqueta.setText(tx);
        b.etiqueta.setFontSize(Math.round((tx.length <= 56 ? 21 : tx.length <= 84 ? 18 : 16) * (MOVIL ? 1.1 : 1)));
        b.setVisible(true).setScale(0);
        this.tweens.add({ targets: b, scale: 1, duration: 220, delay: i * 70, ease: 'Back.out' });
      });
      this.planificarTells();
    }, 200);
    this.fase = 'hablando';
  }

  // Qué se va a delatar durante esta pregunta, y cuándo.
  planificarTells() {
    let lista;
    if (this.preg === 1) lista = ['humo']; // la primera enseña la V
    else if (this.preg === 2 && this.tellsOk.indexOf('ojos') >= 0) lista = ['ojos'];
    else {
      const n = 1 + (Math.random() < 0.55 ? 1 : 0) + (this.comp.length >= 3 && Math.random() < 0.7 ? 1 : 0);
      lista = [];
      for (let i = 0; i < n; i++) lista.push(this.sacaTell());
    }
    const hasta = this.tiempoQ - this.plazo - 0.6;
    this.programa = lista.map((t, i) => ({ tipo: t, t: 0.9 + (hasta - 0.9) * ((i + Math.random() * 0.6) / lista.length) })).sort((a, b) => a.t - b.t);
  }

  responder(i) {
    if (this.fase !== 'pregunta' || this.respondida) return;
    this.respondida = true;
    const q = this.q;
    const tipo = this.orden[i];
    const b = this.btnR[i];
    let txt, ds, pts = 0;
    if (tipo === 'n') { ds = -7; pts = 100; txt = q.rn || Phaser.Utils.Array.GetRandom(REACCION_AGENTE.n); }
    else if (tipo === 's') { ds = 14; txt = q.rs || Phaser.Utils.Array.GetRandom(REACCION_AGENTE.s); }
    else {
      // La absurda: la del guionista dice si cuela; si no lo dice, es una moneda al aire.
      const cuela = q.cuela !== undefined ? q.cuela : Math.random() < 0.55;
      if (cuela) { ds = -12; pts = 180; txt = q.ra || Phaser.Utils.Array.GetRandom(REACCION_AGENTE.acuela); }
      else { ds = 12; txt = q.ra || Phaser.Utils.Array.GetRandom(REACCION_AGENTE.afalla); }
      if (cuela && !q.primera) { Comic.confeti(this, { n: 10, profundidad: 70 }); sfx(this, 'risas', { volume: 0.4 }); }
      this.absurdaCuela = cuela;
    }
    this.subeSosp(ds);
    this.puntos += pts;
    golpeTexto(this, b.x, b.y - 70, pts ? `+${pts}` : (ds > 0 ? '¡Uy!' : ''), pts ? COLOR.verde : COLOR.rosa, 34);
    const clave = tipo === 'a' && ds < 0 ? 'cuela' : tipo;
    if (q.primera && tipo === 'a') return this.momentoPrimera(txt, clave);
    if (tipo === 'a' && ds < 0 && typeof enfasisSeguro === 'function') enfasisSeguro(this, 'chiste', { camara: false });
    this.cierraPregunta(txt, clave);
  }

  // La respuesta que el usuario quiere sí o sí: silencio, el agente se queda mirando (zoom lento) y «…¿Cómo dice?».
  momentoPrimera(txt, clave) {
    this.fase = 'respuesta';
    this.barraT.setAlpha(0);
    this.btnR.forEach(bt => bt.setVisible(false));
    if (this.ev) this.ev.remove();
    this.txtAgente.setText('…');
    const tens = enfasisSeguro(this, 'tension', { camara: false });
    this.tweens.add({ targets: this.agente, scale: 1.55, x: 260, duration: 1700, ease: 'Sine.inOut' });
    this.zoomFijo = true;
    this.time.delayedCall(1800, () => {
      if (this._acabado) return;
      this.txtAgente.setText('…¿Cómo dice?');
      this.time.delayedCall(1300, () => {
        if (this._acabado) return;
        this.zoomFijo = false;
        if (clave === 'cuela') { Comic.confeti(this, { n: 10, profundidad: 70 }); sfx(this, 'risas', { volume: 0.4 }); if (typeof enfasisSeguro === 'function') enfasisSeguro(this, 'chiste', { camara: false }); }
        this.cierraPregunta(txt, clave);
      });
    });
  }

  cierraPregunta(txt, tipo) {
    this.fase = 'respuesta';
    this.barraT.setAlpha(0);
    this.btnR.forEach(b => b.setVisible(false));
    sfx(this, tipo === 's' ? 'oooh' : 'pop', { volume: 0.3 });
    this.hablaAgente(txt, () => this.siguientePregunta(), 650);
  }

  // ---------------------------------------------------------------- lo que te delata

  empezarTell(tipo) {
    if (this.activos.some(a => a.tipo === tipo)) return;
    const a = { tipo, t: this.plazo, d: this.plazo };
    this.activos.push(a);
    const ins = this.insig[tipo];
    const pos = this.posTell(tipo);
    ins.setPosition(pos.x, pos.y).setVisible(true).setScale(0);
    this.tweens.add({ targets: ins, scale: 1, duration: 200, ease: 'Back.out' });
    if (this.btnT[tipo]) this.tweens.add({ targets: this.btnT[tipo], scale: 1.15, duration: 180, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    sfx(this, 'neon', { volume: 0.25 });
    const p = (id) => this.pas[id];
    if (tipo === 'ojos') { this.ojosRojos.setAlpha(1); this.gaze.fijo = { x: 1, y: 0.1 }; }
    if (tipo === 'risa') { const l = p('lasslow'); l.img.setTexture(texO(this, ACOMP.lasslow.alt, ACOMP.lasslow.cara)); this.tweens.add({ targets: l, x: l.x + 4, duration: 50, yoyo: true, repeat: -1 }); a.tw = true; }
    if (tipo === 'pinpin') { const pe = p('perico'); pe.img.setTexture(texO(this, ACOMP.perico.alt, ACOMP.perico.cara)); a.txt = this.globo(pe.x, 250, 'Pin…', 28); }
    if (tipo === 'comer') {
      const c = p('cotine');
      this.tweens.add({ targets: c.img, scaleX: c.base * 1.08, scaleY: c.base * 0.93, duration: 110, yoyo: true, repeat: -1 });
      a.txt = this.globo(c.x, 250, '(mastica)', 24);
    }
  }

  // Un globo pequeño sobre un pasajero (se quita solo).
  globo(x, y, str, tam = 26) {
    const b = bocadillo(this, x, y, str, { ancho: 260, tam }).setDepth(30);
    return b;
  }

  // Lo que dice un acompañante en un globo sobre él (más pequeño si la frase es larga).
  dicho(tipo, str, ms) {
    const p = this.pas[ESCAPE_DE[tipo]];
    if (!p) return;
    if (p.dicho && p.dicho.scene) p.dicho.destroy();
    const largo = str.length > 70;
    const x = Phaser.Math.Clamp(p.x, 560, 900);
    const b = bocadillo(this, x, largo ? 160 : 404 - p.h - 70, str, { ancho: largo ? 420 : 280, tam: largo ? 19 : 22 }).setDepth(45);
    p.dicho = b;
    this.time.delayedCall(ms, () => { if (b.scene) b.destroy(); });
  }

  posTell(tipo) {
    if (tipo === 'humo') return { x: 880, y: 150 };
    if (tipo === 'ojos') return { x: 1085, y: 128 };
    const id = TELLS[tipo].quien;
    const p = this.pas[id];
    return { x: p.x, y: 404 - p.h - 30 };
  }

  pulsa(tipo) {
    if (this.fase === 'fin' || this.fase === 'intro' || this._acabado) return;
    if (this.tellsOk.indexOf(tipo) < 0) return;
    const a = this.activos.find(x => x.tipo === tipo);
    if (a) return this.tapa(a);
    // Pulsar sin que haga falta: el agente se huele algo.
    if (this.malCD > 0) return;
    this.malCD = 0.6;
    this.subeSosp(6);
    this.efectoTapa(tipo, false);
    this.fallos++;
    this.agenteDice(Phaser.Utils.Array.GetRandom(AGENTE_VE.mal));
  }

  tapa(a) {
    const rapido = a.t > a.d * 0.5;
    this.activos.splice(this.activos.indexOf(a), 1);
    const g = 50 + (rapido ? 25 : 0);
    this.puntos += g;
    this.aciertosTell++;
    this.subeSosp(-3);
    this.limpiaTell(a);
    this.efectoTapa(a.tipo, true);
    const pos = this.posTell(a.tipo);
    const tap = frEscape(a.tipo, 'tapado');
    if (tap) this.dicho(a.tipo, tap, 1100);
    golpeTexto(this, pos.x, pos.y - 20, rapido ? `¡Justo! +${g}` : `+${g}`, COLOR.verde, 30);
    sfx(this, 'campanita', { volume: 0.3 });
  }

  // Lo que se ve al tapar (o al taparlo sin hacer falta).
  efectoTapa(tipo, util) {
    if (tipo === 'humo') {
      sfx(this, 'whoosh', { volume: 0.5 });
      this.tweens.add({ targets: this.cristal, scaleY: 0.15, duration: 220, yoyo: true, hold: 900 });
      if (util) this.humos.forEach(h => this.tweens.add({ targets: h, x: h.x - 500, y: h.y - 120, alpha: 0, duration: 800 }));
    } else if (tipo === 'ojos') {
      this.gafas.setVisible(true).setScale(this.gafas.scaleX || 1);
      this.time.delayedCall(2300, () => { if (this.gafas.scene) this.gafas.setVisible(false); });
      sfx(this, 'fup', { volume: 0.4 });
    } else if (tipo === 'risa') {
      const l = this.pas.lasslow;
      l.mano.setVisible(true).setScale(0);
      this.tweens.add({ targets: l.mano, scale: 1, duration: 140, ease: 'Back.out' });
      this.time.delayedCall(1500, () => { if (l.mano.scene) l.mano.setVisible(false); });
      sfx(this, 'plop', { volume: 0.4 });
    } else if (tipo === 'pinpin') {
      const pe = this.pas.perico;
      const t = this.globo(pe.x, 250, '¡Chist!', 30);
      this.time.delayedCall(1000, () => { if (t.scene) t.destroy(); });
      sfx(this, 'pop', { volume: 0.4 });
    } else if (tipo === 'comer') {
      const c = this.pas.cotine;
      this.tweens.add({ targets: c.img, y: 90, scale: c.base * 0.5, duration: 200, yoyo: true, hold: 1000, ease: 'Back.out' });
      sfx(this, 'fup', { volume: 0.4 });
    }
  }

  // Devuelve todo a su sitio cuando el delator termina (por taparlo o por fallar).
  limpiaTell(a) {
    const ins = this.insig[a.tipo];
    this.tweens.add({ targets: ins, scale: 0, duration: 160, onComplete: () => ins.setVisible(false) });
    if (this.btnT[a.tipo]) { this.tweens.killTweensOf(this.btnT[a.tipo]); this.btnT[a.tipo].setScale(1); }
    if (a.txt && a.txt.scene) a.txt.destroy();
    if (a.tipo === 'ojos') { this.gaze.fijo = null; if (!this.activos.some(x => x.tipo === 'ojos')) this.ojosRojos.setAlpha(0); }
    if (a.tipo === 'risa') { const l = this.pas.lasslow; this.tweens.killTweensOf(l); l.x = 560 + this.comp.indexOf('lasslow') * 170; l.img.setTexture(ACOMP.lasslow.cara); }
    if (a.tipo === 'pinpin') this.pas.perico.img.setTexture(ACOMP.perico.cara);
    if (a.tipo === 'comer') { const c = this.pas.cotine; this.tweens.killTweensOf(c.img); c.img.setScale(c.base); }
  }

  falla(a) {
    this.activos.splice(this.activos.indexOf(a), 1);
    this.fallos++;
    this.limpiaTell(a);
    if (a.tipo === 'humo') this.humos.forEach(h => this.tweens.add({ targets: h, alpha: 0, duration: 900, delay: 400 }));
    this.subeSosp(24 + 2 * (this.nivel - 1));
    sfx(this, 'sting', { volume: 0.4 });
    this.cameras.main.shake(220, 0.007);
    // El agente lo ve y pregunta (sin parar el resto del juego). Si es de un acompañante, se le escapa su frase.
    const esc = frEscape(a.tipo, 'escapa');
    if (esc) this.dicho(a.tipo, esc, 2200);
    const reac = ESCAPE_DE[a.tipo] && typeof ESCAPES_CONTROL !== 'undefined' && ESCAPES_CONTROL[ESCAPE_DE[a.tipo]] ? ESCAPES_CONTROL[ESCAPE_DE[a.tipo]].reaccion : null;
    this.agenteDice(reac || Phaser.Utils.Array.GetRandom(AGENTE_VE[a.tipo]));
    golpeTexto(this, this.posTell(a.tipo).x, this.posTell(a.tipo).y, '¡Te ha visto!', COLOR.rosa, 32);
  }

  // Una frase del agente por encima de lo que hubiera en la caja (se recupera la pregunta después).
  agenteDice(str) {
    if (this.fase === 'fin') return;
    const guardado = this.q && this.fase === 'pregunta' ? this.q.q : null;
    if (this.ev) this.ev.remove();
    this.txtAgente.setText(str);
    this.txtAgente.setColor('#a8142a');
    this.time.delayedCall(1400, () => {
      if (!this.txtAgente.active || this.fase === 'fin') return;
      this.txtAgente.setColor(COLOR.tinta);
      if (guardado && this.fase === 'pregunta') this.txtAgente.setText(guardado);
    });
  }

  subeSosp(d) {
    const antes = this.sosp;
    this.sosp = Phaser.Math.Clamp(this.sosp + d, 0, 100);
    // Al cruzar el 65 % la tensión se nota (una vez por cruce).
    if (antes < 65 && this.sosp >= 65 && typeof enfasisSeguro === 'function') enfasisSeguro(this, 'tension', { camara: false });
    if (this.sosp >= 100 && !this._acabado) this.final(false);
  }

  // ---------------------------------------------------------------- bucle

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.malCD = Math.max(0, this.malCD - dt);
    // Mirada del agente y su cercanía según la sospecha.
    const s = this.sosp / 100;
    if (this.pupilas) {
      const gz = this.gaze;
      if (gz.fijo) { gz.tx = gz.fijo.x; gz.ty = gz.fijo.y; }
      else if ((gz.t -= dt) <= 0) { gz.t = Phaser.Math.FloatBetween(0.8, 2); gz.tx = Phaser.Math.FloatBetween(-1, 1); gz.ty = Phaser.Math.FloatBetween(-0.4, 0.6); }
      gz.x += (gz.tx - gz.x) * Math.min(1, 8 * dt);
      gz.y += (gz.ty - gz.y) * Math.min(1, 8 * dt);
      this.pupilas.forEach(p => p.setPosition(p.bx + gz.x * 12, -10 + gz.y * 12));
      this.cejas.forEach(c => c.setAngle(c.s * (-6 - 20 * s)).setY(-46 + 8 * s));
    }
    if (this.fase !== 'intro' && this.fase !== 'fin' && !this.zoomFijo) {
      const cerca = 1 + 0.22 * s;
      this.agente.setScale(this.agente.scaleX + (cerca - this.agente.scaleX) * Math.min(1, 3 * dt));
      this.agente.x += ((200 + 70 * s) - this.agente.x) * Math.min(1, 2 * dt);
    }
    // Barra de sospecha, viñeta roja y pulso.
    const w = Math.max(4, 442 * s);
    this.barra.width += (w - this.barra.width) * Math.min(1, 10 * dt);
    this.barra.setFillStyle(s < 0.4 ? 0x7ee081 : s < 0.7 ? 0xffd23f : 0xff3b30);
    this.cuarto += dt * (2 + 5 * s);
    this.vineta.setAlpha(Math.min(1, s * 1.1) * (0.55 + 0.45 * Math.sin(this.cuarto)));
    // Sudor de Vuper: más gotas cuanto más sospecha.
    this.sudor -= dt;
    if (this.sudor <= 0 && this.fase !== 'fin') {
      this.sudor = Phaser.Math.FloatBetween(2.4, 3.2) - 2.1 * s;
      this.gota();
    }
    this.txtPuntos.setText(`${this.puntos} puntos`);

    if (this.fase === 'pregunta') {
      this.tq -= dt;
      this.tPreg += dt;
      this.barraT.width = Math.max(1, 1232 * this.tq / this.tiempoQ);
      this.barraT.setFillStyle(this.tq / this.tiempoQ < 0.3 ? 0xff5a4f : 0xffd23f);
      // Lo que toca delatarse.
      while (this.programa.length && this.programa[0].t <= this.tPreg && this.activos.length < this.maxSim) this.empezarTell(this.programa.shift().tipo);
      this.sosp = Math.min(100, this.sosp + 0.45 * dt);
      // Se acaba el tiempo: el agente se impacienta.
      if (this.tq <= 0 && !this.respondida) {
        this.respondida = true;
        this.subeSosp(16);
        this.cierraPregunta(Phaser.Utils.Array.GetRandom(REACCION_AGENTE.tarde), 's');
      }
      this.quipT -= dt;
      if (this.quipT <= 0 && !this.activos.length) this.quip();
    }
    // Cuenta atrás de los delatores activos.
    for (let i = this.activos.length - 1; i >= 0; i--) {
      const a = this.activos[i];
      a.t -= dt;
      const r = Math.max(0, a.t / a.d);
      const ins = this.insig[a.tipo];
      ins.arco.clear().lineStyle(8, r < 0.35 ? 0xff3b30 : 0x1f8a5a, 1).beginPath().arc(0, 0, 32, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r, false).strokePath();
      if (a.tipo === 'humo') this.humos.forEach((h, k) => h.setAlpha(Math.min(0.85, (1 - r) * 1.1) * (0.7 + 0.3 * ((k % 2) ? 1 : 0.8))));
      if (a.t <= 0) this.falla(a);
    }
    if (this.fase === 'acabando') {
      this.espera += dt;
      if (!this.activos.length || this.espera > 3) this.final(true);
    }
  }

  gota() {
    const x = this.vuper.x + Phaser.Math.Between(-60, 20);
    const g = this.add.image(x, 404 - this.vH * 0.85, 'ct-gota').setDepth(11).setScale(0.9);
    this.tweens.add({ targets: g, y: g.y + 60, alpha: 0, duration: 900, ease: 'Quad.in', onComplete: () => g.destroy() });
  }

  // Un comentario suelto de alguien de dentro (solo cuando no hay nada que tapar).
  quip() {
    this.quipT = Phaser.Math.FloatBetween(7, 10);
    const dichos = {
      palicaso: '¿Les cuento lo de mi primo?', pompa: 'No. …Pero sí.', blancaso: 'Apunto: control, 23:41.', puky: '¿Me llamabais?',
      lasslow: 'Ji… no, nada.', perico: 'Pin pin. Digo… nada.', cotine: 'Yo no quería venir.',
    };
    const id = Phaser.Utils.Array.GetRandom(this.comp);
    const p = this.pas[id];
    if (!p) return;
    const b = this.globo(p.x, 404 - p.h - 24, dichos[id], 22);
    this.time.delayedCall(1700, () => { if (b.scene) b.destroy(); });
  }

  // El latido: se acelera con la sospecha (casi lo único que suena).
  latido() {
    if (this._acabado || !this.sys.isActive()) return;
    const s = this.sosp / 100;
    sfx(this, 'latido', { volume: 0.12 + 0.55 * s });
    this.time.delayedCall(1500 - 1000 * s, () => this.latido());
  }

  // ---------------------------------------------------------------- final

  final(gana) {
    if (this._acabado) return;
    this._acabado = true;
    this.fase = 'fin';
    this.btnR.forEach(b => b.setVisible(false));
    this.barraT.setAlpha(0);
    this.activos.slice().forEach(a => this.limpiaTell(a));
    this.activos = [];
    if (this.ev) this.ev.remove();
    let linea;
    if (gana) {
      this.puntos += 400 + Math.round((100 - this.sosp) * 4);
      sfx(this, 'platillo', { volume: 0.5 });
      Comic.confeti(this, { n: 24, profundidad: 70 });
      if (typeof enfasisSeguro === 'function') enfasisSeguro(this, 'alegria', { camara: false });
      this.txtAgente.setFontSize(26);
      this.txtAgente.setColor(COLOR.tinta).setText(frAgente('dejarles_ir', 'Pueden seguir… ¿y si me llevan? Mi turno acaba y voy a la feria.', 2));
      linea = 'El agente se ha subido a la furgo. Hay que explicárselo a Palicaso.';
    } else {
      this.txtAgente.setFontSize(28);
      this.txtAgente.setColor('#a8142a').setText(frAgente('pillarles', 'Bajen del vehículo, por favor…', 0));
      this.cameras.main.shake(500, 0.012);
      sfx(this, 'puerta', { volume: 0.6 });
      if (typeof enfasisSeguro === 'function') enfasisSeguro(this, 'bronca', {});
      this.tweens.add({ targets: this.agente, scale: 1.45, x: 250, duration: 600, ease: 'Back.out' });
      linea = 'Los bajan a todos. Al pájaro le piden los papeles otra vez. Sigue sin tenerlos.';
    }
    const g = gana && this.puntos >= MISIONES.Control.umbrales[0];
    // Encadenado desde La furgo (un encargo con control): se apunta y se vuelve al resultado del viaje.
    if (this.datos.desdeFurgo) {
      this.time.delayedCall(gana ? 2400 : 1800, () => {
        apuntar('Control', this.puntos, 0, gana);
        irA(this, 'Furgo', { encargo: this.datos.encargo, resumen: this.datos.resumen, controlGana: gana, controlPuntos: this.puntos });
      });
      return;
    }
    this.time.delayedCall(gana ? 2400 : 1800, () => panelFinal(this, {
      titulo: gana ? '¡Circulen, circulen!' : '¡Bajen del vehículo!',
      linea, puntos: this.puntos, clave: 'Control', gana: g,
    }));
  }
}

// Idle muy suave (sin tocar la escala: los efectos de tapar usan la escala del dibujo).
function flotarSuave(scene, obj, amp = 4, dur = 1500) {
  scene.tweens.add({ targets: obj, y: obj.y - amp, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
}

// Los iconos de los botones de tapar, dibujados con trazo grueso de la serie.
function iconoTell(g, tipo) {
  const T = HEX.tinta;
  if (tipo === 'humo') {
    g.fillStyle(0xd7f3ff, 1).fillRoundedRect(-24, -22, 48, 40, 6).lineStyle(5, T, 1).strokeRoundedRect(-24, -22, 48, 40, 6);
    g.fillStyle(T, 1).fillTriangle(-11, -2, 11, -2, 0, 14);
  } else if (tipo === 'ojos') {
    g.fillStyle(T, 1).fillRoundedRect(-28, -12, 26, 20, 7).fillRoundedRect(2, -12, 26, 20, 7);
    g.lineStyle(5, T, 1).lineBetween(-2, -6, 2, -6).lineBetween(-28, -6, -34, -12).lineBetween(28, -6, 34, -12);
    g.fillStyle(0x9fe7ff, 1).fillRect(-23, -8, 9, 5).fillRect(7, -8, 9, 5);
  } else if (tipo === 'risa') {
    g.fillStyle(0xffffff, 1).fillCircle(0, 8, 17).lineStyle(5, T, 1).strokeCircle(0, 8, 17);
    [-12, -4, 4, 12].forEach(x => g.fillStyle(0xffffff, 1).fillRoundedRect(x - 4, -20, 8, 20, 4).lineStyle(3, T, 1).strokeRoundedRect(x - 4, -20, 8, 20, 4));
  } else if (tipo === 'pinpin') {
    g.fillStyle(0xff5fa2, 1).fillEllipse(0, 10, 32, 14).lineStyle(4, T, 1).strokeEllipse(0, 10, 32, 14);
    g.fillStyle(0xfff6e8, 1).fillRoundedRect(-5, -22, 10, 34, 5).lineStyle(4, T, 1).strokeRoundedRect(-5, -22, 10, 34, 5);
  } else if (tipo === 'comer') {
    g.fillStyle(0xfff6e8, 1).fillTriangle(-24, 14, 24, 14, 0, -14).lineStyle(5, T, 1).strokeTriangle(-24, 14, 24, 14, 0, -14);
    g.fillStyle(0xff5fa2, 1).fillRect(-17, 4, 34, 8).fillStyle(0xff3b30, 1).fillCircle(0, -16, 6).lineStyle(3, T, 1).strokeCircle(0, -16, 6);
  }
}

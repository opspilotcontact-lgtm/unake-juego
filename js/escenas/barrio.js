// El barrio: Vuper se mueve por las salas (casi mundo abierto) y vive su ciclo del humo.
// - Los dos mundos (CANON 26/09): con colocón ≥ 30 todo es mundo humo (de noche, neón, criaturas);
//   cuando se pasa, cortinilla y vuelta al mundo normal (de día, foto, personajes con cuerpo).
// - Necesidades: el colocón baja solo; el hambre sube (más cuanto más colocado); con mucha hambre
//   se pierde vida y la pantalla palpita. Se come en la tienda. Con vida 0, amarillo: despiertas en tu cuarto.
// - Para fumar hay que juntar papel (tienda), boquilla (brilla en algún sitio), la bolsita (la barra)
//   y mechero (tienda), y sentarse en el sofá de Unaké. Si Blancaso fuma contigo, al rato le da un blancaso.
//
// Coordenadas en la pantalla de 1280×720; `y` es donde pisa. `n` cambia lo necesario en el mundo normal.

const SALAS = {
  cuarto: {
    nombre: 'El cuarto de Vuper', fondo: 'bg-cuarto', fondoN: 'bgn-cuarto', der: 'plaza', suelo: [480, 650],
    cosas: [
      { id: 'm', tipo: 'senal', x: 640, y: 330, nombre: 'La M' },
      { id: 'taller', tipo: 'taller', x: 1010, y: 520, nombre: 'Taller de inventos' },
    ],
  },
  plaza: {
    nombre: 'La plaza', fondo: 'bg-plaza', fondoN: 'bgn-plaza', izq: 'cuarto', der: 'fuera', suelo: [540, 670],
    cosas: [{
      id: 'blancaso', tipo: 'blancaso', sprite: 'blancaso', x: 900, y: 565, escala: 0.4, nombre: 'Blancaso',
      n: { sprite: 'n-blancaso', x: 820, y: 640, escala: 0.62 },
    }, { id: 'carrera', tipo: 'carrera', sprite: 'pizarra-carrera', x: 420, y: 600, escala: 0.6, nombre: 'Carreras de humo (apuestas)' }],
  },
  fuera: {
    nombre: 'La puerta de Unaké', fondo: 'bg-fuera', escala: 1.25, fondoY: 515, fondoN: 'bgn-fuera', izq: 'plaza', der: 'tienda', suelo: [560, 680],
    cosas: [{
      id: 'perico', tipo: 'puerta', sprite: 'perico', x: 860, y: 425, escala: 0.3, nombre: 'Perico',
      n: { sprite: 'n-perico', x: 650, y: 665, escala: 0.55 },
    }],
  },
  tienda: {
    nombre: 'La tienda de 24 h', fondo: 'bg-tienda', fondoN: 'bgn-tienda', izq: 'fuera', suelo: [590, 680],
    cosas: [
      { id: 'mostrador', tipo: 'tienda', x: 640, y: 520, nombre: 'Mostrador', n: { x: 560 } },
      { id: 'encargos', tipo: 'reparto', x: 190, y: 600, nombre: 'Encargos' },
      { id: 'tragaperras', tipo: 'tragaperras', sprite: 'tragaperras', x: 1060, y: 650, escala: 0.62, nombre: 'Tragaperras de Palicaso' },
    ],
  },
  dentro: {
    nombre: 'Unaké', fondo: 'bg-dentro', fondoN: 'bgn-dentro', izq: 'fuera', der: 'cocina', suelo: [540, 670],
    cosas: [
      { id: 'sofa', tipo: 'sofa', x: 200, y: 600, nombre: 'Sofá: liar y fumar' },
      { id: 'caja', tipo: 'negocio', x: 810, y: 560, nombre: 'El negocio de Unaké' },
      {
        id: 'palicaso', tipo: 'barra', sprite: 'palicaso', x: 640, y: 458, escala: 0.4, nombre: 'Palicaso (la barra)',
        n: { sprite: 'n-palicaso', y: 462, escala: 0.62, recorte: 0.55 },
      },
      { id: 'pompa', tipo: 'charla', sprite: 'pompa', x: 830, y: 240, escala: 0.3, nombre: 'La Pompa', n: { sprite: 'n-pompa', x: 960, y: 650, escala: 0.55 } },
      { id: 'lasslow', tipo: 'mision', mision: 'Lasslow', sprite: 'lasslow-digno', x: 1170, y: 640, escala: 0.45, nombre: 'Lasslow', n: { sprite: 'n-lasslow', y: 660, escala: 0.56 } },
    ],
  },
  cocina: {
    nombre: 'La cocina de Cotine', fondo: 'bg-cocina', fondoN: 'bgn-cocina', izq: 'dentro', der: 'reservado', suelo: [590, 680],
    cosas: [{ id: 'cotine', tipo: 'mision', mision: 'Tarta', sprite: 'cotine', x: 380, y: 670, escala: 0.5, nombre: 'Cotine', n: { sprite: 'n-cotine', escala: 0.58 } }],
  },
};

// Las ampliaciones (negocio.js): cerradas hasta que se inaugura su obra.
SALAS.reservado = {
  nombre: 'El reservado', fondo: 'bg-sofa', fondoN: 'bgn-sofa', izq: 'cocina', der: 'bano', suelo: [570, 690],
  cosas: [
    { id: 'sofa2', tipo: 'sofa', x: 640, y: 610, nombre: 'Sofá del reservado: liar y fumar' },
    { id: 'escalera', tipo: 'subir', x: 170, y: 600, nombre: 'Escalera al techo' },
  ],
};
SALAS.bano = {
  nombre: 'Los baños de Unaké', fondo: 'bg-bano', fondoN: 'bgn-bano', izq: 'reservado', suelo: [590, 700],
  cosas: [{ id: 'puky', tipo: 'charla', sprite: 'puky', x: 1010, y: 690, escala: 0.32, nombre: 'Puky', soloHumo: true }],
};
SALAS.techo = {
  nombre: 'El techo de la Pompa', fondo: 'bg-techo', fondoN: 'bg-techo', suelo: [320, 560],
  cosas: [
    { id: 'bajar', tipo: 'bajar', x: 150, y: 520, nombre: 'Bajar al reservado' },
    { id: 'mirador', tipo: 'mirador', x: 640, y: 480, nombre: 'El barrio desde arriba' },
  ],
};

const CHARLAS = {
  humo: {
    blancaso: ['Otra vez no…', 'Hoy sí que iba a disfrutar de mi bar. Hoy sí.', 'Las cuentas no cuadran. Nunca cuadran.'],
    palicaso: ['¡Escucha, escucha! Esto es Unaké, la aso.', '¿Una qué? ¡Una aso! Nunca falla.'],
    pompa: ['…', '…¿Eh? Ah, hola. Te contesto luego.', 'Yo no, que exploto.'],
    perico: ['¿Contraseña? …Ah, eres tú. Pasa.', 'Pin… no, nada.'],
  },
  normal: {
    blancaso: ['De día se está bien. Hasta que se hace de noche.', 'Las cuentas del café cuadran. De día, cuadran.'],
    palicaso: ['¡Buenos días! ¿Un café? Lo otro, ya sabes, de la aso.', '¡Escucha! De día esto es un café. Un café muy tranquilo.'],
    pompa: ['De día pongo la música bajita. Bajita.', 'Estoy tranquila. Muy tranquila.'],
    perico: ['De día es un café. Pasa, pasa.', '¿Pipas? Son mías.'],
  },
};

// Encargos: a quién se le puede llevar algo.
const DESTINOS = [
  { id: 'blancaso', sala: 'plaza' }, { id: 'perico', sala: 'fuera' }, { id: 'palicaso', sala: 'dentro' },
  { id: 'lasslow', sala: 'dentro' }, { id: 'pompa', sala: 'dentro' }, { id: 'cotine', sala: 'cocina' },
];
const PEDIDOS = [
  { clave: 'patatas', nombre: 'unas patatas' }, { clave: 'caramelo', nombre: 'un caramelo' }, { clave: 'lata', nombre: 'un resucitador' },
];

// Lo que vende la tienda de 24 h: la comida se come en el momento.
const TIENDA = [
  { id: 'patatas', nombre: 'Patatas (salado)', sprite: 'patatas', precio: 15, efecto: 'Hambre −40', hambre: 40 },
  { id: 'caramelo', nombre: 'Caramelo (dulce)', sprite: 'caramelo', precio: 10, efecto: 'Hambre −20 · Vida +10', hambre: 20, vida: 10 },
  { id: 'lata', nombre: 'Resucitador', sprite: 'lata', precio: 20, efecto: 'Vida +45 · te despeja un poco', vida: 45, colocon: -10 },
  { id: 'papel', nombre: 'Papel de liar', sprite: 'obj-papel', precio: 8, efecto: 'Para liar (uno)' },
  { id: 'mechero', nombre: 'Mechero', sprite: 'obj-mechero', precio: 15, efecto: 'Para encender (te dura siempre)' },
];
const PRECIO_BOLSITA = 30;
const SALAS_BOQUILLA = ['cuarto', 'plaza', 'fuera', 'tienda', 'cocina'];

class Barrio extends Phaser.Scene {
  constructor() { super('Barrio'); }

  create(datos) {
    this.objSala = [];
    this.modal = null;
    this.objetivo = null;
    this.pendiente = null;
    this.reparto = null;
    this.senal = null;
    this.tSenal = Phaser.Math.Between(35, 70);
    this.cambiando = false;
    this.dir = 1;
    this.dirVisual = 1;
    this.vuelta = 1;
    this.comiendo = 0;
    this.tRastro = 0;
    this.tGuardar = 0;
    this.faseLatido = 0;
    this.tNotif = Phaser.Math.Between(25, 45);  // la primera notificación del móvil llega pronto
    this.tAmbiente = 6;
    this.burbujasAmb = [];
    this.notif = null;
    this.tSituacion = 30;
    this.marcasSit = [];
    this.recogiblesSala = [];
    this.tSuceso = Phaser.Math.Between(25, 45);
    this.tLogros = 2;
    this.pillables = [];
    this.objSuceso = [];

    this.sombra = this.add.ellipse(0, 0, 120, 26, 0x000000, 0.35);
    this.jugador = this.add.image(0, 0, 'vuper').setOrigin(0.5, 1);
    this.px = ESTADO.x;
    this.py = ESTADO.y;

    this.teclas = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,E,ENTER,SPACE,ESC,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,M,O,L');
    this.input.on('pointerdown', (p, sobre) => {
      if (this.modal || sobre.length) return;
      this.objetivo = { x: p.x, y: p.y };
      this.pendiente = null;
    });

    this.vineta = this.add.image(ANCHO / 2, ALTO / 2, 'vineta').setDepth(880).setAlpha(0);
    this.hud();
    if (!ESTADO.boquillaEn && !ESTADO.inv.boquilla) this.esconderBoquilla();
    this.cargarSala(ESTADO.sala in SALAS ? ESTADO.sala : 'fuera');
    entrar(this, datos);
    if (datos && datos.aviso) this.time.delayedCall(700, () => golpeTexto(this, ANCHO / 2, 300, datos.aviso, COLOR.amarillo, 44));
    if (!ESTADO.ayudaVista) this.time.delayedCall(900, () => this.ayudaCuandoSePueda());
    const fuera = actualizarNegocio();
    if (fuera.minutos > 5 && negocio().caja >= 5 && cuentasNegocio().total > 0) {
      this.time.delayedCall(2200, () => this.toast('Mientras no estabas…', `Unaké ha hecho caja: ${Math.floor(negocio().caja)} monchis te esperan en la barra`));
    }
    if (ESTADO.pistaPendiente) {
      ESTADO.pistaPendiente = false;
      if (!ESTADO.boquillaEn && !ESTADO.inv.boquilla) this.esconderBoquilla();
      const b = ESTADO.boquillaEn;
      if (b) this.time.delayedCall(1500, () => this.toast('La pista de Perico', `«Pin pin. Hay una boquilla en ${SALAS[b.sala].nombre}.»`));
      guardarPartida();
    }
  }

  // ---------- HUD ----------

  hud() {
    const D = 900;
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(HEX.tinta, 0.78).fillRoundedRect(12, 10, 330, 150, 18);
    this.add.image(42, 38, 'patatas').setScale(0.18).setDepth(D + 1);
    this.textoMonchis = texto(this, 112, 38, '', 26, COLOR.amarillo).setDepth(D + 1);
    this.add.star(196, 38, 5, 8, 18, HEX.amarillo).setStrokeStyle(4, HEX.tinta).setDepth(D + 1);
    this.textoEstrellas = texto(this, 240, 38, '', 26, COLOR.amarillo).setDepth(D + 1);
    this.barras = {};
    [['hambre', 'HAMBRE', HEX.rosa], ['vida', 'VIDA', 0x7ee081], ['colocon', 'COLOCÓN', 0xb68cff]].forEach(([k, nombre, color], i) => {
      const y = 76 + i * 28;
      this.add.text(26, y, nombre, { fontFamily: FUENTE, fontSize: '16px', color: COLOR.crema }).setOrigin(0, 0.5).setDepth(D + 1);
      this.add.rectangle(230, y, 196, 18, 0x000000, 0.6).setStrokeStyle(3, HEX.crema).setDepth(D + 1);
      this.barras[k] = this.add.rectangle(134, y, 0, 12, color).setOrigin(0, 0.5).setDepth(D + 1);
    });
    this.add.graphics().setDepth(D).fillStyle(HEX.tinta, 0.6).fillRoundedRect(ANCHO / 2 - 270, 8, 540, 86, 20);
    this.textoSala = texto(this, ANCHO / 2, 36, '', 30, COLOR.crema).setDepth(D + 1);
    this.textoMundo = texto(this, ANCHO / 2, 72, '', 18, COLOR.azul).setDepth(D + 1);
    boton(this, ANCHO - 84, 40, 'Menú', () => irA(this, 'Portada'), { ancho: 130, alto: 48, tam: 20, color: HEX.crema }).setDepth(D + 1);
    this.botonLogros = boton(this, ANCHO - 226, 40, 'Logros', () => { if (!this.modal) this.logros(); }, { ancho: 140, alto: 48, tam: 20, color: HEX.amarillo }).setDepth(D + 1);

    // Lo que llevas para liar.
    const gi = this.add.graphics().setDepth(D);
    gi.fillStyle(HEX.tinta, 0.78).fillRoundedRect(12, ALTO - 92, 330, 80, 18);
    this.add.text(24, ALTO - 84, 'Para liar', { fontFamily: FUENTE, fontSize: '14px', color: COLOR.crema }).setDepth(D + 1);
    this.ranuras = ['papel', 'boquilla', 'bolsita', 'mechero'].map((k, i) => {
      const img = this.add.image(62 + i * 76, ALTO - 44, `obj-${k}`).setDepth(D + 1);
      img.setScale(44 / Math.max(img.width, img.height));
      const n = texto(this, 86 + i * 76, ALTO - 26, '', 16, COLOR.amarillo).setDepth(D + 2);
      return { k, img, n };
    });

    this.panelObjetivos = this.add.container(ANCHO - 12, 76).setDepth(D).setVisible(!ESTADO.ocultarObjetivos);
    this.firmaObjetivos = '';
    this.aviso = texto(this, 0, 0, '', 22, COLOR.amarillo).setDepth(902).setVisible(false);
    // En el móvil: botón grande para hablar con lo que tengas cerca (sustituye a la E).
    this.tactil = this.sys.game.device.input.touch;
    this.botonHablar = boton(this, ANCHO - 110, ALTO - 120, 'Hablar', () => {
      const c = this.masCercana();
      if (c && !this.modal && !this.cambiando) { this.objetivo = null; this.interactuar(c); }
    }, { ancho: 170, alto: 110, tam: 30, color: HEX.verde }).setDepth(906).setVisible(false);
    // La línea de aviso va abajo, como un subtítulo con fondo: arriba chocaba con los bocadillos del bar.
    this.linea = texto(this, ANCHO / 2 + 175, ALTO - 34, '', 19, COLOR.amarillo, 860).setDepth(D + 1).setVisible(false)
      .setBackgroundColor('rgba(27,16,40,0.82)').setPadding(14, 6, 14, 6);
    this.panelReparto = this.add.container(560, 196).setDepth(D).setVisible(false);
    const fondoR = this.add.graphics();
    fondoR.fillStyle(HEX.tinta, 0.8).fillRoundedRect(-330, -38, 660, 82, 18);
    this.iconoPedido = this.add.image(-290, 2, 'patatas').setScale(0.22);
    this.textoPedido = this.add.text(-250, -26, '', { fontFamily: FUENTE, fontSize: '22px', color: COLOR.crema });
    this.textoRuta = this.add.text(-250, 6, '', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.azul });
    this.barraReparto = this.add.rectangle(-250, 36, 560, 8, HEX.amarillo).setOrigin(0, 0.5);
    this.panelReparto.add([fondoR, this.iconoPedido, this.textoPedido, this.textoRuta, this.barraReparto]);
    this.panelReparto.add(boton(this, 360, 0, 'Dejar', () => { if (this.reparto) this.dejarRacha(); }, { ancho: 90, alto: 44, tam: 16, color: HEX.crema }));
    this.refrescarHud();
  }

  refrescarHud() {
    this.textoMonchis.setText(String(ESTADO.monchis));
    this.textoEstrellas.setText(String(totalEstrellas()));
    this.ranuras.forEach(r => {
      const v = ESTADO.inv[r.k];
      const tengo = r.k === 'mechero' ? v : v > 0;
      r.img.setAlpha(tengo ? 1 : 0.25);
      r.n.setText(r.k === 'mechero' || !v ? '' : `×${v}`);
    });
  }

  barrasNecesidades() {
    ['hambre', 'vida', 'colocon'].forEach(k => { this.barras[k].width = 188 * Phaser.Math.Clamp(ESTADO[k], 0, 100) / 100; });
    const parpadeo = Math.sin(this.time.now / 90) > 0;
    this.barras.hambre.fillColor = ESTADO.hambre > 70 && parpadeo ? 0xffffff : HEX.rosa;
    this.barras.vida.fillColor = ESTADO.vida < 35 && parpadeo ? HEX.rojo : 0x7ee081;
  }

  ayudaCuandoSePueda() {
    if (ESTADO.ayudaVista) return;
    if (this.modal || this.cambiando || this.time.now < (this.pausaHistoria || 0)) return this.time.delayedCall(600, () => this.ayudaCuandoSePueda());
    this.ayuda();
  }

  ayuda() {
    ESTADO.ayudaVista = true;
    guardarPartida();
    this.abrirModal(c => {
      c.add(texto(this, 0, -170, 'El barrio', 50, COLOR.amarillo));
      c.add(texto(this, 0, -122, 'Muévete con las flechas (o WASD) o tocando el suelo. Acércate a alguien y pulsa E.\n\nLos «!» dan misiones (de noche, en el mundo humo): estrellas y monchis.\nL: logros y retos de la noche. O: esconder objetivos.\nVigila el HAMBRE y la VIDA: se come en la tienda.\nPara fumar en el sofá de Unaké hace falta papel, boquilla, la bolsita y mechero.\nColocado estás en el mundo humo: las misiones pagan más.', 21, COLOR.crema, 700).setOrigin(0.5, 0));
      c.add(boton(this, 0, 170, 'Vamos (E)', () => this.cerrarModal(), { ancho: 260 }));
    }, () => this.cerrarModal());
  }

  // ---------- Salas y mundos ----------

  cargarSala(nombre, entrada) {
    this.objSala.forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
    this.objSala = [];
    (this.objSuceso || []).forEach(o => o.active && o.destroy());
    this.objSuceso = [];
    this.pillables = [];
    if (this.burbuja) this.burbuja.destroy();
    this.burbujasAmb.forEach(b => b.active && b.destroy());
    this.burbujasAmb = [];
    this.sala = nombre;
    this.mundo = enMundoHumo() ? 'humo' : 'normal';
    const s = SALAS[nombre];
    const humo = this.mundo === 'humo';
    const bg = humo && s.escala ? this.add.image(ANCHO / 2, s.fondoY, s.fondo).setScale(s.escala) : fondo(this, humo ? s.fondo : s.fondoN);
    bg.setDepth(-10);
    this.objSala.push(bg);
    this.textoSala.setText(s.nombre);
    this.textoMundo.setText(humo ? 'Mundo humo · las misiones pagan x1,5' : 'Mundo normal · de día').setColor(humo ? COLOR.rosa : COLOR.azul);

    this.textoCaja = null;
    this.cosas = s.cosas.map(cosa => this.montarCosa(humo ? cosa : { ...cosa, ...(cosa.n || {}) }));
    if (humo) this.montarClientela(nombre);
    this.montarDeco(nombre);
    this.montarBoquilla();
    this.marcarRecado();
    this.marcarSituaciones();
    this.montarRecogibles();

    if (entrada === 'izq') this.px = 70;
    if (entrada === 'der') this.px = ANCHO - 70;
    if (entrada === 'puerta') this.px = nombre === 'dentro' ? 130 : 860;
    if (entrada === 'escalera') this.px = nombre === 'techo' ? 220 : 240;
    this.py = Phaser.Math.Clamp(this.py, s.suelo[0], s.suelo[1]);

    this.sound.stopByKey('ambiente-bar');
    this.sound.stopByKey('grillos');
    if (humo && (nombre === 'plaza' || nombre === 'fuera')) sfx(this, 'grillos', { volume: 0.12, loop: true });

    Object.assign(ESTADO, { sala: nombre, x: this.px, y: this.py });
    guardarPartida();
  }

  montarCosa(cosa) {
    const m = { ...cosa };
    if (m.soloHumo && this.mundo !== 'humo') { m.alto = 0; m.oculta = true; return m; }
    if (m.id === 'blancaso' && ESTADO.blancazo && this.mundo === 'humo') m.sprite = 'blancaso-derritiendose';
    if (m.sprite) {
      m.img = this.add.image(m.x, m.y, m.sprite).setScale(m.escala).setDepth(m.y);
      if (m.recorte) {
        // Medio cuerpo detrás de la barra: se recorta por abajo y se cuelga del corte.
        m.img.setOrigin(0.5, m.recorte).setCrop(0, 0, m.img.width, m.img.height * m.recorte);
        m.alto = m.img.displayHeight * m.recorte;
      } else {
        m.img.setOrigin(0.5, 1);
        m.alto = m.img.displayHeight;
      }
      flotar(this, m.img, { amplitud: m.id === 'pompa' && this.mundo === 'humo' ? 12 : 3, periodo: 1500 + Math.random() * 600 });
      this.objSala.push(m.img);
      if (m.id === 'blancaso' && ESTADO.blancazo) {
        const anillo = this.add.circle(m.x, m.y - m.alto / 2, m.alto * 0.7).setStrokeStyle(8, HEX.amarillo).setDepth(m.y - 1);
        this.tweens.add({ targets: anillo, scale: 1.25, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
        this.objSala.push(anillo);
      }
    } else {
      m.alto = 60;
    }
    const zona = this.add.zone(m.x, m.y - m.alto / 2, Math.max(140, m.alto * 0.8), Math.max(140, m.alto)).setInteractive({ useHandCursor: true });
    zona.on('pointerdown', () => {
      if (this.modal) return;
      this.pendiente = m;
      this.objetivo = { x: m.x + (this.px < m.x ? -110 : 110), y: this.py };
    });
    this.objSala.push(zona);

    const clave = this.misionDe(m);
    const marcaTexto = m.tipo === 'tienda' ? '$' : m.tipo === 'sofa' ? '~' : m.tipo === 'barra' ? '¡' : m.tipo === 'negocio' ? 'N' : m.tipo === 'subir' ? '^' : m.tipo === 'tragaperras' || m.tipo === 'carrera' ? '€' : clave ? '!' : null;
    if (marcaTexto) {
      const yMarca = m.y - m.alto - 40;
      const etiqueta = { tienda: 'Tienda', sofa: 'Fumar', barra: 'Barra', negocio: 'Negocio', subir: 'Techo', tragaperras: 'Apostar', carrera: 'Apostar' }[m.tipo] || '!';
      const deNoche = this.mundo === 'normal' && (m.tipo === 'mision' || m.tipo === 'senal');
      const marca = texto(this, m.x, yMarca, deNoche ? 'De noche' : etiqueta, clave && !deNoche ? 54 : 22, deNoche ? COLOR.azul : COLOR.amarillo).setDepth(800);
      m.marca = marca;
      if (m.tipo === 'negocio') {
        this.textoCaja = texto(this, m.x + 92, yMarca, '', 22, COLOR.verde).setDepth(800);
        this.objSala.push(this.textoCaja);
      }
      this.tweens.add({ targets: marca, y: yMarca - 12, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.objSala.push(marca);
      if (clave) {
        const est = estrellas(this, m.x, yMarca + 42, ESTADO.estrellas[clave] || 0, 11).setDepth(800);
        this.objSala.push(est);
        if (m.tipo === 'senal' && (totalEstrellas() < 3 || this.mundo === 'normal')) { marca.setText('?').setColor(COLOR.crema); est.setVisible(false); }
      }
    }
    return m;
  }

  misionDe(m) {
    if (m.tipo === 'blancaso') return ESTADO.blancazo || (ESTADO.estrellas.Blancazo && this.mundo === 'humo') ? 'Blancazo' : null;
    return { mision: m.mision, puerta: 'Contrasena', reparto: 'Reparto', senal: 'Rescate' }[m.tipo] || null;
  }

  cambiarSala(nueva, entrada) {
    if (this.cambiando) return;
    this.cambiando = true;
    this.objetivo = null;
    sfx(this, 'whoosh', { volume: 0.3 });
    this.cameras.main.fadeOut(130, 27, 16, 40);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cargarSala(nueva, entrada);
      this.cameras.main.fadeIn(160, 27, 16, 40);
      this.cambiando = false;
    });
  }

  // Se pasa (o hace efecto): cortinilla de humo y la misma sala en el otro mundo.
  cambioDeMundo() {
    if (this.cambiando) return;
    this.cambiando = true;
    cortinaHumo(this, () => {
      this.cargarSala(this.sala);
      destaparHumo(this);
      this.cambiando = false;
      golpeTexto(this, ANCHO / 2, 300, this.mundo === 'humo' ? 'Hace efecto…' : 'Se te ha pasado…', COLOR.crema, 52);
    });
  }

  // ---------- La boquilla perdida ----------

  esconderBoquilla() {
    const sala = Phaser.Utils.Array.GetRandom(SALAS_BOQUILLA.filter(s => s !== ESTADO.sala));
    const [y0, y1] = SALAS[sala].suelo;
    ESTADO.boquillaEn = { sala, x: Phaser.Math.Between(160, ANCHO - 160), y: Phaser.Math.Between(y0, y1) };
    guardarPartida();
  }

  montarBoquilla() {
    this.boquilla = null;
    const b = ESTADO.boquillaEn;
    if (!b || b.sala !== this.sala) return;
    const brillo = this.add.star(b.x, b.y - 26, 4, 8, 34, 0xffffff, 0.9).setDepth(b.y - 1);
    this.tweens.add({ targets: brillo, angle: 90, scale: 0.6, duration: 700, yoyo: true, repeat: -1 });
    const img = this.add.image(b.x, b.y - 10, 'obj-boquilla').setScale(0.55).setDepth(b.y);
    this.tweens.add({ targets: img, y: b.y - 18, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.objSala.push(brillo, img);
    this.boquilla = { b, brillo, img };
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    const k = this.teclas;
    const pulsado = tecla => Phaser.Input.Keyboard.JustDown(tecla);
    this.barrasNecesidades();
    this.palpitar(dms);

    if (this.modal) {
      const num = this.modal.numeros ? [k.ONE, k.TWO, k.THREE, k.FOUR, k.FIVE, k.SIX, k.SEVEN, k.EIGHT, k.NINE].findIndex(t => pulsado(t)) : -1;
      if (num >= 0 && this.modal.numeros[num]) return this.modal.numeros[num]();
      if (pulsado(k.ESC)) this.modalCerrar();
      else if (pulsado(k.E) || pulsado(k.ENTER) || pulsado(k.SPACE)) this.modalAccion();
      return;
    }

    this.tiempos(dt);
    if (this.cambiando) return;

    let dx = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    let dy = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    if (dx || dy) { this.objetivo = null; this.pendiente = null; }
    else if (this.objetivo) {
      const vx = this.objetivo.x - this.px;
      const vy = this.objetivo.y - this.py;
      const d = Math.hypot(vx, vy);
      if (d < 10) this.objetivo = null;
      else { dx = vx / d; dy = vy / d; }
    }
    // Con mucha hambre o poca vida se va más lento: el cuerpo lo pide.
    const flojo = ESTADO.vida < 35 ? 0.7 : 1;
    const vel = (this.reparto ? 470 : 360) * flojo;
    this.px += dx * vel * dt;
    this.py += dy * vel * 0.65 * dt;

    const s = SALAS[this.sala];
    this.py = Phaser.Math.Clamp(this.py, s.suelo[0], s.suelo[1]);
    if (this.px < 25) {
      if (s.izq) return this.cambiarSala(s.izq, this.sala === 'dentro' ? 'puerta' : 'der');
      this.px = 25; this.objetivo = null;
    }
    if (this.px > ANCHO - 25) {
      if (s.der && !salaAbierta(s.der)) {
        this.px = ANCHO - 25; this.objetivo = null;
        if (!this.avisoObra || this.time.now - this.avisoObra > 3000) { this.avisoObra = this.time.now; golpeTexto(this, ANCHO - 260, this.py - 220, `Próximamente: ${SALAS[s.der].nombre}\n(lánzalo en Obras, en el negocio)`, COLOR.azul, 26); }
      } else if (s.der) return this.cambiarSala(s.der, 'izq');
      this.px = ANCHO - 25; this.objetivo = null;
    }

    this.dibujarJugador(dt, dx, Math.abs(dx) + Math.abs(dy) > 0.1);

    if (this.boquilla && Math.hypot(this.boquilla.b.x - this.px, this.boquilla.b.y - this.py) < 80) this.cogerBoquilla();

    recogerPillables(this);
    if (pulsado(k.L)) return this.logros();
    if (pulsado(k.O)) { ESTADO.ocultarObjetivos = !ESTADO.ocultarObjetivos; this.panelObjetivos.setVisible(!ESTADO.ocultarObjetivos); guardarPartida(); }
    this.recogidaCercana();
    if (this.notif && pulsado(k.M)) return this.abrirNotificacion();
    if (this.reparto && pulsado(k.ESC)) return this.dejarRacha();
    const cerca = this.bloqueado ? null : this.masCercana();
    if (cerca) {
      const sobre = cerca.marca ? (this.misionDe(cerca) ? 105 : 84) : 40;
      const hablando = this.burbuja && this.burbuja.active;
      // Si Vuper está encima de la cosa, el aviso sube por encima de su cabeza (no le tapa la cara).
      let yAviso = cerca.y - cerca.alto - sobre;
      if (Math.abs(cerca.x - this.px) < 140) yAviso = Math.min(yAviso, this.py - this.jugador.displayHeight - 30);
      this.aviso.setText(this.tactil ? cerca.nombre : `E · ${cerca.nombre}`).setPosition(Phaser.Math.Clamp(cerca.x, 150, ANCHO - 150), Math.max(150, yAviso)).setVisible(!hablando);
      if (pulsado(k.E) || pulsado(k.ENTER) || pulsado(k.SPACE) || this.pendiente === cerca) {
        this.pendiente = null;
        this.objetivo = null;
        this.interactuar(cerca);
      }
    } else {
      this.aviso.setVisible(false);
    }

    if (this.reparto) this.comprobarEntrega();
    this.botonHablar.setVisible(this.tactil && !!cerca && !this.modal);
  }

  // Vuper animado: textura según el momento, giro en espejo animado, andares y estela.
  dibujarJugador(dt, dx, moviendo) {
    const humo = this.mundo === 'humo';
    // Mundo normal: anda con dos fotogramas (su pose de caminar y la de pie) y come con bote.
    let tex = moviendo ? 'vn-caminando' : 'vuper-normal';
    if (humo) tex = this.comiendo > 0 ? 'vuper-comiendo' : this.reparto ? 'vuper-reparto' : ESTADO.colocon > 70 ? 'vuper-fumado' : 'vuper';
    else if (this.comiendo > 0) tex = 'vn-riendo';
    if (this.jugador.texture.key !== tex) this.jugador.setTexture(tex);
    this.comiendo = Math.max(0, this.comiendo - dt);
    const esc = humo ? 0.42 : 260 / this.jugador.height;

    if (Math.abs(dx) > 0.2) {
      const nuevo = Math.sign(dx);
      if (nuevo !== this.dir) this.girar(nuevo);
    }
    this.jugador.setFlipX(this.dirVisual * (MIRA[tex] || 1) < 0);

    const t = this.time.now;
    let sx = 1;
    let sy = 1;
    let yOff = 0;
    let angulo = 0;
    if (humo) {
      // Gas: flota, se estira al ir y respira en reposo.
      const ola = Math.sin(t / 70);
      if (moviendo) { sx = 1 + 0.07 * ola; sy = 1 - 0.07 * ola; angulo = this.dir * (this.reparto ? 14 : 9); }
      else { sx = 1 + 0.025 * Math.sin(t / 380); sy = 1 - 0.025 * Math.sin(t / 380); }
      yOff = -22 + Math.sin(t / 300) * 7;
    } else if (moviendo) {
      // Cuerpo de persona: pasos con bote y balanceo.
      const paso = Math.sin(t / 85);
      yOff = -Math.abs(paso) * 9;
      angulo = paso * 3.5;
      sy = 1 + Math.abs(paso) * 0.03;
    } else {
      sy = 1 + 0.012 * Math.sin(t / 420);
    }
    this.jugador.setScale(esc * sx * this.vuelta, esc * sy);
    this.jugador.setAngle(Phaser.Math.Linear(this.jugador.angle, angulo, 0.2));
    this.jugador.setPosition(this.px, this.py + yOff).setDepth(this.py);
    this.sombra.setPosition(this.px, this.py + 4).setDepth(this.py - 1).setScale(humo ? 0.9 + yOff / 120 : 0.8, 1);

    this.tRastro -= dt;
    if (moviendo && this.tRastro <= 0) {
      this.tRastro = this.reparto ? 0.05 : humo ? 0.09 : 0.2;
      this.rastro(humo);
    }
  }

  girar(nuevo) {
    this.dir = nuevo;
    if (this.giro) this.giro.stop();
    this.giro = this.tweens.addCounter({
      from: 0, to: 1, duration: 170, ease: 'Sine.inOut',
      onUpdate: tw => {
        const v = tw.getValue();
        this.vuelta = Math.max(0.1, Math.abs(Math.cos(v * Math.PI)));
        if (v >= 0.5) this.dirVisual = this.dir;
      },
      onComplete: () => { this.vuelta = 1; this.dirVisual = this.dir; },
    });
  }

  rastro(humo) {
    const atras = this.px - this.dir * 55;
    if (humo) {
      const p = this.add.image(atras, this.py - 40 + Phaser.Math.Between(-20, 20), 'humo').setScale(0.09).setTint(0xd8cfe6).setAlpha(0.7).setDepth(this.py - 2);
      this.tweens.add({ targets: p, scale: 0.2, alpha: 0, y: p.y - 24, x: atras - this.dir * 30, duration: 520, onComplete: () => p.destroy() });
    } else {
      const p = this.add.image(atras, this.py, 'miga').setScale(0.8).setTint(0xbfae9a).setAlpha(0.6).setDepth(this.py - 2);
      this.tweens.add({ targets: p, scale: 2, alpha: 0, y: this.py - 10, duration: 400, onComplete: () => p.destroy() });
    }
    if (this.reparto) {
      // Líneas de velocidad de rider.
      const y = this.py - Phaser.Math.Between(40, 140);
      const l = this.add.rectangle(atras, y, Phaser.Math.Between(30, 70), 5, 0xffffff, 0.9).setDepth(this.py - 2);
      this.tweens.add({ targets: l, x: atras - this.dir * 120, alpha: 0, duration: 260, onComplete: () => l.destroy() });
    }
  }

  // Pantalla que palpita con latido cuando el hambre aprieta o la vida baja.
  palpitar(dms) {
    const urgencia = Phaser.Math.Clamp(Math.max((ESTADO.hambre - 70) / 30, (35 - ESTADO.vida) / 35), 0, 1);
    if (urgencia <= 0) { this.vineta.setAlpha(0); return; }
    const periodo = 950 - urgencia * 400;
    const antes = this.faseLatido;
    this.faseLatido = (this.faseLatido + dms / periodo) % 1;
    if (this.faseLatido < antes && !this.modal) sfx(this, 'latido', { volume: 0.35 + urgencia * 0.4 });
    const f = this.faseLatido;
    const golpe = Math.exp(-f * 9) + (f > 0.24 ? 0.7 * Math.exp(-(f - 0.24) * 9) : 0);
    this.vineta.setAlpha(Math.min(1, urgencia * (0.35 + 0.65 * golpe)));
    this.cameras.main.setZoom(1 + golpe * 0.006 * urgencia);
  }

  masCercana() {
    let mejor = null;
    let dMejor = 170;
    this.cosas.forEach(c => {
      if (c.oculta) return;
      const d = Math.abs(c.x - this.px);
      // Lo que está en alto (la Pompa en el techo) cuenta desde el suelo que tiene debajo.
      const dy = Math.abs(Math.max(c.y, SALAS[this.sala].suelo[0]) - this.py);
      if (d < dMejor && dy < 300) { mejor = c; dMejor = d; }
    });
    return mejor;
  }

  // Necesidades, encargos, señal amarilla y el blancazo corren aunque no te muevas.
  tiempos(dt) {
    const eraHumo = enMundoHumo();
    const liado = Object.values(ESTADO.situaciones || {}).some(x => x.aceptada) ? 0.6 : 1;
    ESTADO.colocon = Math.max(0, ESTADO.colocon - dt / 7 * liado * (1 + bonoDeco('colocon')));
    ESTADO.hambre = Math.min(100, ESTADO.hambre + dt * (0.15 + ESTADO.colocon * 0.006) * (1 + bonoDeco('hambre')));
    if (ESTADO.hambre >= 85) ESTADO.vida -= dt * 1.8;
    else if (ESTADO.hambre < 50) ESTADO.vida = Math.min(100, ESTADO.vida + dt * 0.4);
    if (eraHumo !== enMundoHumo()) this.cambioDeMundo();
    if (ESTADO.vida <= 0) return this.desmayo();

    this.tGuardar -= dt;
    if (this.tGuardar <= 0) { this.tGuardar = 2; ESTADO.x = this.px; ESTADO.y = this.py; guardarPartida(); }

    if (this.reparto) {
      this.reparto.restante -= dt;
      const f = Math.max(0, this.reparto.restante / this.reparto.total);
      this.barraReparto.width = 560 * f;
      this.barraReparto.fillColor = f < 0.25 ? HEX.rojo : HEX.amarillo;
      this.textoRuta.setText(`${Math.ceil(this.reparto.restante)} s · ${this.ruta(this.reparto.destino.sala)}`);
      if (this.reparto.restante <= 0) this.repartoFallido();
    }
    if (this.senal) {
      this.senal.restante -= dt;
      if (this.senal.restante <= 0) this.senal = null;
    } else if (!this.reparto && totalEstrellas() >= 3 && enMundoHumo() && !ESTADO.blancazo) {
      this.tSenal -= dt;
      if (this.tSenal <= 0) this.encenderSenal();
    }
    if (enMundoHumo() && !this.reparto) {
      this.tSituacion -= dt;
      if (this.tSituacion <= 0) { this.tSituacion = Phaser.Math.Between(60, 110); this.nuevaSituacionBarrio(); }
    }
    if (!this.reparto && !this.notif) {
      this.tNotif -= dt;
      if (this.tNotif <= 0) this.notificar();
    }
    this.tNegocio = (this.tNegocio || 0) - dt;
    if (this.tNegocio <= 0) {
      this.tNegocio = 1;
      actualizarNegocio();
      if (this.textoCaja) this.textoCaja.setText(negocio().caja >= 1 ? `+${Math.floor(negocio().caja)}` : '');
    }
    this.tHistoria = (this.tHistoria || 0) - dt;
    if (this.tHistoria <= 0) { this.tHistoria = 0.4; this.historia(); }
    if (!this.reparto && !this.modal) {
      this.tSuceso -= dt;
      if (this.tSuceso <= 0) { this.tSuceso = Phaser.Math.Between(40, 75); sucesoBarrio(this); }
    }
    this.tLogros -= dt;
    if (this.tLogros <= 0) { this.tLogros = 1; this.revisarLogros(); }
    this.tAmbiente -= dt;
    if (this.tAmbiente <= 0) { this.tAmbiente = Phaser.Math.Between(9, 15); this.charlaAmbiente(); }
    if (ESTADO.blancazoEn > 0 && enMundoHumo()) {
      ESTADO.blancazoEn -= dt;
      if (ESTADO.blancazoEn <= 0) this.empezarBlancazo();
    }
    if (ESTADO.blancazo) {
      ESTADO.blancazo.restante -= dt;
      if (ESTADO.blancazo.restante <= 0) {
        ESTADO.blancazo = null;
        golpeTexto(this, ANCHO / 2, 300, 'A Blancaso se le ha pasado solo. Te mira raro.', COLOR.crema, 32);
        if (this.sala === 'plaza') this.cargarSala('plaza');
      }
    }
    this.lineaAviso();
  }

  // Lo más urgente, en una sola línea arriba.
  lineaAviso() {
    let t = '';
    let color = COLOR.amarillo;
    if (ESTADO.blancazo) t = `¡A Blancaso le ha dado un blancaso! Está en la plaza · ${this.ruta('plaza')} · ${Math.ceil(ESTADO.blancazo.restante)} s`;
    else if (this.senal) t = `¡Señal amarilla! Ve a la M del cuarto de Vuper · ${this.ruta('cuarto')} · ${Math.ceil(this.senal.restante)} s · monchis x2`;
    else if (ESTADO.vida < 35) { t = `¡Te quedas sin vida! Come algo o tómate un resucitador · ${this.ruta('tienda')}`; color = COLOR.rosa; }
    else if (ESTADO.hambre > 70) { t = `¡Monchis! Tienes hambre · ${this.ruta('tienda')}`; color = COLOR.rosa; }
    else if (this.mundo === 'normal' && stat('fumadas') >= 1 && !this.reparto) {
      const falta = this.faltanLiar();
      t = falta.length ? `Se te ha pasado. Para volver al mundo humo te falta: ${falta.join(', ')}` : 'Lo tienes todo: al sofá de Unaké a liarte';
      color = COLOR.rosa;
    }
    else if (this.buscando()) {
      const b = this.buscando();
      t = `Busca ${b.nombre}s para ${QUIEN[b.id].nombre} (${b.hechos}/${b.n}) · hay en: ${b.salas}`;
      color = COLOR.verde;
    }
    else if (ESTADO.recado) {
      const r = ESTADO.recado;
      const nombre = QUIEN[r.a].nombre;
      const cosa = r.item ? TIENDA.find(p => p.id === r.item).nombre.split(' (')[0].toLowerCase() : '';
      t = r.tipo === 'mensaje' ? `Recado: díselo a ${nombre} · ${this.ruta(this.salaDe(r.a))}`
        : r.llevo ? `Recado: lleva ${cosa} a ${nombre} · ${this.ruta(this.salaDe(r.a))}`
          : `Recado: compra ${cosa} para ${nombre} · ${this.ruta('tienda')}`;
      color = COLOR.verde;
    }
    this.linea.setVisible(!!t && !this.reparto).setText(t).setColor(color);
  }

  encenderSenal() {
    this.senal = { restante: 45 };
    this.tSenal = Phaser.Math.Between(60, 100);
    sfx(this, 'zumbido-m');
    this.cameras.main.flash(300, 255, 210, 63);
    golpeTexto(this, ANCHO / 2, 300, '¡SEÑAL AMARILLA!', COLOR.amarillo, 72);
  }

  empezarBlancazo() {
    ESTADO.blancazoEn = 0;
    ESTADO.blancazo = { restante: 120 };
    guardarPartida();
    sfx(this, 'temblor');
    sfx(this, 'zumbido-m');
    this.cameras.main.flash(400, 255, 255, 255);
    this.cameras.main.shake(500, 0.01);
    golpeTexto(this, ANCHO / 2, 280, '¡A Blancaso le ha dado un blancaso!', COLOR.amarillo, 46);
    if (this.sala === 'plaza') this.cargarSala('plaza');
  }

  desmayo() {
    if (this.cambiando) return;
    this.cambiando = true;
    this.reparto = null;
    this.panelReparto.setVisible(false);
    sfx(this, 'arcada');
    this.cameras.main.shake(400, 0.015);
    golpeTexto(this, ANCHO / 2, 300, '¡Te ha dado un amarillo!', COLOR.amarillo, 60);
    this.time.delayedCall(900, () => cortinaHumo(this, () => {
      const perdidos = Math.min(20, ESTADO.monchis);
      Object.assign(ESTADO, { vida: 45, hambre: 30, colocon: 0, monchis: ESTADO.monchis - perdidos });
      sumarStat('desmayos');
      this.py = 600;
      this.cargarSala('cuarto');
      this.px = 420;
      destaparHumo(this);
      this.refrescarHud();
      this.cambiando = false;
      golpeTexto(this, ANCHO / 2, 300, `Despiertas en tu cuarto. Se te cayeron ${perdidos} monchis.`, COLOR.crema, 32);
    }));
  }

  // Qué salida coger para llegar a una sala (búsqueda en anchura por el barrio).
  ruta(destino) {
    if (destino === this.sala) return '¡Es aquí!';
    const vecinos = n => {
      const s = SALAS[n];
      const v = [];
      if (s.izq) v.push([s.izq, `« ${SALAS[s.izq].nombre}`]);
      if (s.der) v.push([s.der, `${SALAS[s.der].nombre} »`]);
      if (n === 'fuera') v.push(['dentro', 'Puerta de Unaké (Perico)']);
      return v;
    };
    const cola = [[this.sala, null]];
    const visto = new Set([this.sala]);
    while (cola.length) {
      const [n, primera] = cola.shift();
      for (const [m, etiqueta] of vecinos(n)) {
        if (visto.has(m)) continue;
        const salida = primera || etiqueta;
        if (m === destino) return `Ve a: ${salida}`;
        visto.add(m);
        cola.push([m, salida]);
      }
    }
    return '';
  }

  // ---------- Interacciones ----------

  interactuar(c) {
    if (c.img) this.tweens.add({ targets: c.img, y: c.img.y - 14, duration: 110, yoyo: true, ease: 'Sine.out' });
    // Un recado para esta persona va antes que nada.
    const r = ESTADO.recado;
    if (r && r.a === c.id && (r.tipo === 'mensaje' || r.llevo)) return this.cumplirRecado(c);
    // Perico es la puerta: con un encargo se pasa siempre, y de día hace de portero aunque tenga un problema.
    const esPuerta = c.tipo === 'puerta';
    if (esPuerta && this.reparto) {
      this.charla(c, '¿Contraseña? …Ah, el rider. Pasa, pasa.');
      return this.time.delayedCall(700, () => this.cambiarSala('dentro', 'puerta'));
    }
    if (ESTADO.situaciones[c.id] && !(esPuerta && this.mundo === 'normal')) return this.situacion(c);
    const charlar = { etiqueta: 'Charlar', accion: () => { this.cerrarModal(); this.encuentro(c); }, color: HEX.azul };
    switch (c.tipo) {
      case 'charla': return this.encuentro(c);
      case 'mision':
        if (this.mundo === 'normal') return this.deNoche(c);
        return this.tarjeta(c.mision, null, null, [charlar]);
      case 'taller': return this.taller();
      case 'tienda': return this.tienda();
      case 'barra': return this.barra(c);
      case 'sofa': return this.sofa();
      case 'negocio': return this.abrirNegocio();
      case 'tragaperras': return irA(this, 'Tragaperras');
      case 'carrera': return irA(this, 'Carrera');
      case 'subir':
        if (!salaAbierta('techo')) return this.charla(c, 'La escalera da al techo. Está cerrado hasta que se inaugure (Obras, en el negocio).');
        if (this.mundo === 'normal') return this.charla(c, 'De día no se sube al techo: ahí solo se llega flotando.');
        return this.cambiarSala('techo', 'escalera');
      case 'bajar': return this.cambiarSala('reservado', 'escalera');
      case 'mirador': return this.charla(c, Phaser.Utils.Array.GetRandom(['Desde aquí se ve todo el barrio. Y el barrio, desde aquí, parece pequeño.', 'Las chimeneas echan humo. Las nubes también. Aquí arriba todo es lo mismo.', 'Allí está la tienda de 24 h. Siempre encendida. Como tú.']));
      case 'blancaso':
        if (ESTADO.blancazo) return this.tarjeta('Blancazo', null, '¡Ahora! Puky ya viene de camino.');
        if ((ESTADO.capitulo || 0) >= 1) return this.hucha(c);
        if (this.misionDe(c)) return this.tarjeta('Blancazo', null, 'Revivir el blancazo.', [charlar]);
        return this.encuentro(c);
      case 'reparto':
        if (this.reparto) return this.charla(c, 'Ya llevas un encargo. ¡Corre!');
        return this.tarjeta('Reparto', () => this.empezarReparto(0));
      case 'senal':
        if (this.mundo === 'normal') return this.charla(c, 'De día la M no se enciende. Es solo un cartel.');
        if (totalEstrellas() < 3) return this.charla(c, `La M está apagada. Se enciende cuando tengas 3 estrellas (llevas ${totalEstrellas()}).`);
        return this.tarjeta('Rescate', null, this.senal ? '¡Señal encendida: monchis x2!' : null);
      case 'puerta':
        if (this.reparto) {
          this.charla(c, '¿Contraseña? …Ah, el rider. Pasa, pasa.');
          return this.time.delayedCall(700, () => this.cambiarSala('dentro', 'puerta'));
        }
        if (ESTADO.dentro) {
          return this.tarjeta('Contrasena', null, null, [{ etiqueta: 'Pasar', accion: () => { this.cerrarModal(); this.cambiarSala('dentro', 'puerta'); } }, charlar]);
        }
        return this.tarjeta('Contrasena', null, null, [charlar]);
      default: return null;
    }
  }

  // Saca de una lista sin repetir hasta haberla agotado (una baraja por lista).
  sinRepetir(lista) {
    this.barajas = this.barajas || new Map();
    let b = this.barajas.get(lista);
    if (!b || !b.length) { b = Phaser.Utils.Array.Shuffle([...lista]); this.barajas.set(lista, b); }
    return b.pop();
  }

  // ---------- La historia ----------

  historia() {
    this.pintarObjetivos();
    if (historiaAcabada() || this.modal || this.cambiando) return;
    // Tras cerrar un capítulo, un respiro para leer el «completado» antes de la escena siguiente.
    if (this.time.now < (this.pausaHistoria || 0)) return;
    const n = ESTADO.capitulo || 0;
    const cap = capituloActual();
    if (ESTADO.introCap !== n) {
      return this.abrirEscena([['titulo', `Capítulo ${n + 1} · ${cap.titulo}`, cap.arte], ...cap.intro, ['objetivos', '']], () => {
        ESTADO.introCap = n;
        guardarPartida();
        this.situacionesDeCapitulo(cap);
      });
    }
    if ((cap.situaciones || []).some(([id, pl]) => stat(`sit_${pl}`) < 1 && !(ESTADO.situaciones[id] && (ESTADO.situaciones[id].pl === pl || ESTADO.situaciones[id].aceptada)))) this.situacionesDeCapitulo(cap);
    if (cap.objetivos.every(o => o.hecho())) this.completarCapitulo(cap, n);
  }

  // La historia dispara situaciones concretas al empezar cada capítulo (en orden cronológico).
  situacionesDeCapitulo(cap) {
    (cap.situaciones || []).forEach(([id, plId], i) => {
      const actual = ESTADO.situaciones[id];
      if (stat(`sit_${plId}`) >= 1 || (actual && (actual.pl === plId || actual.aceptada))) return;
      const s = nuevaSituacion(id, plId);
      if (!s) return;
      ESTADO.situaciones[id] = s;
      this.time.delayedCall(800 + i * 2500, () => this.toast(`${QUIEN[id].nombre} tiene un problema`, `«${s.titulo}» · búscale (${SALAS[this.salaDe(id)].nombre})`));
    });
    guardarPartida();
    this.marcarSituaciones();
  }

  completarCapitulo(cap, n) {
    this.pausaHistoria = this.time.now + 3200;
    ESTADO.capitulo = n + 1;
    ESTADO.monchis += cap.premio;
    guardarPartida();
    this.refrescarHud();
    sfx(this, 'platillo', { volume: 0.6 });
    sfx(this, 'campanita');
    if (cap.final) {
      golpeTexto(this, ANCHO / 2, 300, '¡La hucha está llena!', COLOR.amarillo, 64);
      return this.time.delayedCall(1500, () => irA(this, 'Final'));
    }
    golpeTexto(this, ANCHO / 2, 280, `Capítulo ${n + 1} completado`, COLOR.amarillo, 56);
    if (cap.premio) this.time.delayedCall(700, () => golpeTexto(this, ANCHO / 2, 360, `+${cap.premio} monchis`, COLOR.verde, 40));
  }

  // Objetivos del capítulo, arriba a la derecha (solo se repinta si algo cambia).
  pintarObjetivos() {
    const acabada = historiaAcabada();
    const cap = capituloActual();
    const n = ESTADO.capitulo || 0;
    const lineas = acabada ? [] : cap.objetivos.map(o => [o.hecho(), o.texto + (o.progreso && !o.hecho() ? ` (${o.progreso()})` : '')]);
    const sits = Object.entries(ESTADO.situaciones || {}).map(([id, s]) => {
      const p = s.pasos[s.paso];
      const estado = !s.aceptada ? 'tiene un problema' : p && p.recoger ? `${RECOGIBLES[p.recoger].nombre}s ${p.hechos}/${p.n}` : `¡a jugar! (${MISIONES[p.mision].nombre})`;
      return `${QUIEN[id].nombre}: ${estado}`;
    });
    const cn = cuentasNegocio();
    if (cn.total > 0) sits.push(`${cn.rango}: ${Math.floor(cn.clientes)} clientes · caja ${Math.floor(negocio().caja)}`);
    const R = retosDeHoy();
    const hechos = R.lista.filter(r => r.hecho).length;
    sits.push(hechos < 3 ? `Retos de la noche: ${hechos}/3 · pulsa L` : 'Retos de la noche: ¡los tres! Vuelve mañana');
    const firma = JSON.stringify([n, lineas, ESTADO.hucha, sits]);
    if (firma === this.firmaObjetivos) return;
    const nuevo = this.firmaObjetivos !== '' && firma !== this.firmaObjetivos;
    this.firmaObjetivos = firma;
    const c = this.panelObjetivos;
    c.removeAll(true);
    const ancho = 340;
    const filas = acabada ? 1 : lineas.length;
    const alto = 42 + filas * 30 + (n >= 1 ? 28 : 0) + sits.length * 24 + (sits.length ? 8 : 0);
    c.add(this.add.graphics().fillStyle(HEX.tinta, 0.78).fillRoundedRect(-ancho, 0, ancho, alto, 16));
    c.add(this.add.text(-ancho + 14, 10, acabada ? 'Modo libre' : `Cap. ${n + 1} · ${cap.titulo}`, { fontFamily: FUENTE, fontSize: '17px', color: COLOR.amarillo }));
    if (acabada) c.add(this.add.text(-ancho + 14, 40, 'Unaké se ha salvado. ¡A por los récords!', { fontFamily: FUENTE, fontSize: '14px', color: COLOR.crema }));
    lineas.forEach(([hecho, txt], i) => {
      const y = 50 + i * 30;
      const bola = this.add.circle(-ancho + 22, y, 8, hecho ? 0x7ee081 : 0x000000, hecho ? 1 : 0.3).setStrokeStyle(2, HEX.crema);
      const t = this.add.text(-ancho + 38, y, txt, { fontFamily: FUENTE, fontSize: '14px', color: hecho ? '#9be7a0' : COLOR.crema, wordWrap: { width: ancho - 50 } }).setOrigin(0, 0.5);
      if (hecho) t.setAlpha(0.75);
      c.add([bola, t]);
    });
    sits.forEach((t, i) => {
      const y = 50 + filas * 30 + i * 24;
      c.add(this.add.text(-ancho + 14, y, '?', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.rosa }).setOrigin(0, 0.5));
      c.add(this.add.text(-ancho + 38, y, t, { fontFamily: FUENTE, fontSize: '14px', color: '#ffb3d1' }).setOrigin(0, 0.5));
    });
    if (n >= 1) {
      const y = alto - 22;
      const f = Math.min(1, ESTADO.hucha / META_HUCHA);
      c.add(this.add.text(-ancho + 14, y, 'Hucha', { fontFamily: FUENTE, fontSize: '14px', color: COLOR.crema }).setOrigin(0, 0.5));
      c.add(this.add.rectangle(-ancho + 70, y, 200, 12, 0x000000, 0.5).setOrigin(0, 0.5).setStrokeStyle(2, HEX.crema));
      c.add(this.add.rectangle(-ancho + 70, y, 200 * f, 12, HEX.amarillo).setOrigin(0, 0.5));
      c.add(this.add.text(-14, y, `${ESTADO.hucha}/${META_HUCHA}`, { fontFamily: FUENTE, fontSize: '13px', color: COLOR.amarillo }).setOrigin(1, 0.5));
    }
    if (nuevo) this.tweens.add({ targets: c, scale: 1.06, duration: 120, yoyo: true });
  }

  // Escena de diálogo: retrato del que habla y el texto escribiéndose. E (o tocar) para seguir.
  abrirEscena(lineas, alAcabar) {
    this.objetivo = null;
    this.aviso.setVisible(false);
    const velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.7).setDepth(950).setInteractive();
    const c = this.add.container(0, 0).setDepth(951);
    this.modal = { velo, c };
    let i = -1;
    let escribiendo = null;
    let retrato = null;
    const caja = this.add.graphics().fillStyle(HEX.morado, 1).fillRoundedRect(140, 470, 1000, 200, 30).lineStyle(8, HEX.tinta, 1).strokeRoundedRect(140, 470, 1000, 200, 30);
    const nombre = this.add.text(180, 488, '', { fontFamily: FUENTE, fontSize: '26px', color: COLOR.amarillo });
    const cuerpo = this.add.text(180, 528, '', { fontFamily: FUENTE, fontSize: '25px', color: COLOR.crema, wordWrap: { width: 920 }, lineSpacing: 6 });
    const sigue = this.add.text(1110, 650, 'E ▸', { fontFamily: FUENTE, fontSize: '20px', color: COLOR.azul }).setOrigin(1, 1);
    this.tweens.add({ targets: sigue, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
    c.add([caja, nombre, cuerpo, sigue]);
    const humo = this.mundo === 'humo';
    const SPRITE = {
      palicaso: humo ? 'palicaso-contando' : 'n-palicaso-hablando', blancaso: humo ? 'blancaso' : 'n-blancaso-hablando',
      lasslow: humo ? 'lasslow-digno' : 'n-lasslow-hablando', perico: humo ? 'perico-cotilleando' : 'n-perico-hablando',
      cotine: humo ? 'cotine' : 'n-cotine-hablando', pompa: humo ? 'pompa-mira' : 'n-pompa-hablando', vuper: humo ? 'vuper' : 'vn-hablando',
    };
    const siguiente = () => {
      if (escribiendo) { escribiendo.remove(); escribiendo = null; cuerpo.setText(lineas[i][1]); return; }
      i++;
      if (retrato) { retrato.destroy(); retrato = null; }
      if (this.arteCapitulo && i > 0) this.arteCapitulo.setTint(0x8a7fa0);
      if (i >= lineas.length) { this.arteCapitulo = null; this.cerrarModal(); if (alAcabar) alAcabar(); return; }
      const [quien, txt] = lineas[i];
      caja.setVisible(quien !== 'titulo');
      if (quien === 'titulo') {
        nombre.setText('');
        cuerpo.setText('');
        sigue.setVisible(false);
        // Si hay ilustración del capítulo (Gemini), de fondo a pantalla completa con un zoom lento.
        const arte = lineas[i][2];
        if (arte && this.textures.exists(arte)) {
          const a = this.add.image(ANCHO / 2, ALTO / 2, arte);
          a.setScale(Math.max(ANCHO / a.width, ALTO / a.height));
          this.tweens.add({ targets: a, scale: a.scale * 1.06, duration: 6000 });
          c.addAt(a, 0);
          this.arteCapitulo = a;
        }
        const t = texto(this, ANCHO / 2, 300, txt, 60, COLOR.amarillo, 1100).setScale(0);
        c.add(t);
        sfx(this, 'sting', { volume: 0.5 });
        this.tweens.add({ targets: t, scale: 1, duration: 500, ease: 'Back.out' });
        retrato = t;
        this.time.delayedCall(1300, () => { sigue.setVisible(true); });
        return;
      }
      if (quien === 'objetivos') {
        nombre.setText('Objetivos');
        cuerpo.setText(capituloActual().objetivos.map(o => `· ${o.texto}`).join('\n'));
        return;
      }
      nombre.setText(quien === 'narrador' ? '' : QUIEN[quien].nombre);
      if (quien !== 'narrador' && this.textures.exists(SPRITE[quien])) {
        retrato = this.add.image(1010, 470, SPRITE[quien]).setOrigin(0.5, 1);
        retrato.setScale(300 / retrato.height);
        c.addAt(retrato, 0);
        this.tweens.add({ targets: retrato, y: 460, duration: 160, yoyo: true });
      }
      cuerpo.setFontStyle(quien === 'narrador' ? 'italic' : 'normal');
      sfx(this, 'pop', { volume: 0.3 });
      let n = 0;
      cuerpo.setText('');
      escribiendo = this.time.addEvent({
        delay: 22, repeat: txt.length - 1,
        callback: () => { n++; cuerpo.setText(txt.slice(0, n)); if (n >= txt.length) escribiendo = null; },
      });
    };
    velo.on('pointerdown', siguiente);
    this.modalCerrar = siguiente;
    this.modalAccion = siguiente;
    siguiente();
  }

  // Blancaso lleva las cuentas: aquí se aporta a la hucha de la aso.
  hucha(c) {
    const aportar = n => {
      const cant = Math.min(n, ESTADO.monchis, META_HUCHA - ESTADO.hucha);
      if (ESTADO.hucha >= META_HUCHA) { this.cerrarModal(); return this.charla(c, 'La hucha ya está llena. ¡Unaké se queda!'); }
      if (cant <= 0) { this.cerrarModal(); return this.charla(c, 'Sin monchis no hay hucha. Haz encargos, rider.'); }
      ESTADO.monchis -= cant;
      ESTADO.hucha += cant;
      guardarPartida();
      this.refrescarHud();
      this.cerrarModal();
      sfx(this, 'lata');
      sfx(this, 'campanita');
      this.poseNpc(c, 'riendo');
      this.charla(c, ESTADO.hucha >= META_HUCHA ? '¡Mil! ¡Unaké se queda!' : Phaser.Utils.Array.GetRandom(['Apuntado. Las cuentas casi cuadran.', 'Gracias. Una noche menos de bajón.', 'Esto sí que es una aso.']));
      golpeTexto(this, ANCHO / 2, 300, `Hucha +${cant}  ·  ${ESTADO.hucha}/${META_HUCHA}`, COLOR.amarillo, 44);
    };
    const acciones = [() => aportar(50), () => aportar(100), () => aportar(ESTADO.monchis), () => { this.cerrarModal(); this.encuentro(c); }];
    this.abrirModal(m => {
      const img = this.add.image(-300, -10, c.img ? c.img.texture.key : 'blancaso');
      img.setScale(240 / img.height);
      m.add(img);
      m.add(texto(this, 90, -190, 'La hucha de la aso', 40, COLOR.amarillo));
      m.add(this.add.text(90, -120, '«El casero quiere 1.000 monchis o cierra Unaké. Lo que aportes, lo apunto.»', { fontFamily: FUENTE, fontSize: '21px', color: COLOR.crema, align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5));
      m.add(this.add.rectangle(-170, -50, 520, 22, 0x000000, 0.5).setOrigin(0, 0.5).setStrokeStyle(3, HEX.crema));
      m.add(this.add.rectangle(-170, -50, 520 * Math.min(1, ESTADO.hucha / META_HUCHA), 22, HEX.amarillo).setOrigin(0, 0.5));
      m.add(texto(this, 90, -14, `${ESTADO.hucha} / ${META_HUCHA}  ·  tienes ${ESTADO.monchis}`, 22, COLOR.crema));
      ['1 · Aportar 50', '2 · Aportar 100', '3 · Todo lo que llevo', '4 · Charlar'].forEach((t, i) => {
        m.add(boton(this, -60 + (i % 2) * 300, 70 + Math.floor(i / 2) * 80, t, acciones[i], { ancho: 280, alto: 62, tam: 21, color: i === 3 ? HEX.azul : HEX.amarillo }));
      });
      m.add(boton(this, 90, 215, 'Cerrar (Esc)', () => this.cerrarModal(), { ancho: 220, alto: 46, tam: 20, color: HEX.crema }));
    }, () => this.cerrarModal());
    this.modal.numeros = acciones;
  }

  // ---------- El negocio de Unaké ----------

  // Clientes de humo sentados en el bar: tantos como clientes tenga el local.
  montarClientela(sala = 'dentro') {
    const c = cuentasNegocio();
    const SITIOS = {
      dentro: [[130, 560], [205, 552], [270, 566], [1060, 572], [1130, 566], [1200, 574], [440, 468], [530, 470], [745, 470], [850, 468], [300, 630], [960, 636]],
      reservado: [[420, 560], [530, 556], [750, 556], [860, 560], [330, 650], [960, 650], [1120, 640], [80, 640]],
      techo: [[400, 420], [560, 380], [760, 400], [900, 360], [1150, 440], [300, 520]],
      bano: [[300, 650], [600, 640]],
    };
    if (!SITIOS[sala]) return;
    // Los clientes llenan primero el bar y luego las salas nuevas, en orden.
    const orden = ['dentro', 'reservado', 'techo', 'bano'].filter(n => n === 'dentro' || salaAbierta(n));
    let resto = Math.floor(c.clientes);
    for (const n of orden) { if (n === sala) break; resto -= SITIOS[n].length; }
    const sitios = SITIOS[sala].slice(0, Math.max(0, resto));
    const tonos = [0xd8cfe6, 0xc9f3ff, 0xffd6e8, 0xe0ffd8, 0xfff1c2];
    const n = Math.min(sitios.length, Math.floor(c.clientes));
    for (let i = 0; i < n; i++) {
      const [x, y] = sitios[i];
      const f = this.add.container(x, y - 40).setDepth(y - 2);
      f.add(this.add.image(0, 0, 'humo').setScale(0.46).setTint(tonos[i % tonos.length]));
      [-13, 13].forEach(dx => {
        f.add(this.add.circle(dx, -3, 8, 0xffffff).setStrokeStyle(2, HEX.tinta));
        f.add(this.add.circle(dx + 1, -2, 4, HEX.tinta));
      });
      const paga = this.time.addEvent({ delay: Phaser.Math.Between(2600, 5200), loop: true, callback: () => {
        if (!f.active) return paga.remove();
        const t = texto(this, f.x, f.y - 40, `+${Math.max(1, Math.round(c.porCliente))}`, 20, COLOR.amarillo).setDepth(f.depth + 1);
        this.tweens.add({ targets: t, y: t.y - 50, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
      } });
      this.tweens.add({ targets: f, y: y - 46, duration: 700 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.objSala.push(f);
    }
  }

  abrirNegocio() {
    actualizarNegocio();
    const n = negocio();
    const c = cuentasNegocio();
    const cobrar = () => {
      const m = Math.floor(n.caja);
      const b = Math.floor(n.bolsitas);
      const hoy = new Date().toDateString();
      const bono = n.ultimoDia !== hoy && m > 0 ? 25 : 0;
      if (!m && !b) { sfx(this, 'bonk', { volume: 0.4 }); return; }
      n.caja -= m;
      n.bolsitas -= b;
      if (bono) n.ultimoDia = hoy;
      sumarStat('cobros');
      ESTADO.monchis += m + bono;
      ESTADO.inv.bolsita += b;
      guardarPartida();
      this.refrescarHud();
      sfx(this, 'lata');
      sfx(this, 'campanita');
      this.cerrarModal();
      golpeTexto(this, ANCHO / 2, 300, `+${m} monchis${b ? ` · +${b} bolsita${b > 1 ? 's' : ''}` : ''}${bono ? ` · bono del día +${bono}` : ''}`, COLOR.amarillo, 40);
    };
    const comprar = mj => {
      if (nivelNegocio(mj.id) >= NIVEL_MAX) return;
      if (!this.pagar(precioMejora(mj))) return;
      n.niveles[mj.id] = nivelNegocio(mj.id) + 1;
      sfx(this, 'tiroriro');
      // Metas del negocio que se cumplen al mejorar.
      let cn = cuentasNegocio();
      while (METAS_NEGOCIO[n.metas] && METAS_NEGOCIO[n.metas].hecho(cn)) {
        const meta = METAS_NEGOCIO[n.metas];
        ESTADO.monchis += meta.premio;
        n.metas++;
        this.time.delayedCall(600, () => this.toast('Meta del negocio cumplida', `${meta.texto} · +${meta.premio} monchis`));
        cn = cuentasNegocio();
      }
      guardarPartida();
      this.refrescarHud();
      this.cerrarModal();
      if (this.sala === 'dentro') this.cargarSala('dentro');
      this.abrirNegocio();
      golpeTexto(this, ANCHO / 2, 640, `${mj.nombre}: nivel ${nivelNegocio(mj.id)}`, COLOR.verde, 34).setDepth(1001);
    };
    this.abrirModal(m => {
      // Columna izquierda: cómo va el local.
      m.add(texto(this, -250, -210, 'El negocio de Unaké', 30, COLOR.amarillo));
      m.add(texto(this, -250, -176, `Rango: ${c.rango}${rangoSiguiente(c.total) ? `\nsiguiente: ${rangoSiguiente(c.total)}` : ''}`, 15, COLOR.rosa, 300));
      const datos = [
        `Clientes: ${Math.floor(c.clientes)} (caben ${c.aforo})`,
        `Cada cliente deja ${c.porCliente.toFixed(1)}/min`,
        `Total: ${c.porMin.toFixed(1)} monchis/min`,
        `Caja: ${Math.floor(n.caja)} / ${c.tope}`,
        c.minPorBolsita ? `Bolsitas listas: ${Math.floor(n.bolsitas)} (una cada ${Math.round(c.minPorBolsita)} min)` : 'Bolsitas: compra la máquina',
      ];
      m.add(this.add.text(-390, -136, datos.join('\n'), { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema, lineSpacing: 8 }));
      m.add(this.add.rectangle(-390, 40, 280, 14, 0x000000, 0.5).setOrigin(0, 0.5).setStrokeStyle(2, HEX.crema));
      m.add(this.add.rectangle(-390, 40, 280 * Math.min(1, n.caja / c.tope), 14, HEX.amarillo).setOrigin(0, 0.5));
      m.add(boton(this, -250, 100, `Cobrar la caja (E)`, cobrar, { ancho: 300, alto: 60, tam: 22, color: HEX.verde }));
      const meta = METAS_NEGOCIO[n.metas];
      m.add(texto(this, -250, 170, meta ? `Meta: ${meta.texto} (+${meta.premio})` : '¡Todas las metas cumplidas!', 16, COLOR.azul, 360));
      m.add(boton(this, -330, 214, 'Obras (8)', () => this.obras(), { ancho: 150, alto: 44, tam: 18, color: HEX.rosa }));
      m.add(boton(this, -165, 214, 'Decoración (9)', () => this.deco(), { ancho: 170, alto: 44, tam: 18, color: HEX.azul }));
      // Columna derecha: mejoras.
      MEJORAS_NEGOCIO.forEach((mj, i) => {
        const y = -205 + i * 58;
        const nv = nivelNegocio(mj.id);
        m.add(this.add.text(-40, y - 16, `${i + 1} · ${mj.nombre}`, { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema }));
        m.add(this.add.text(-40, y + 6, mj.desc, { fontFamily: FUENTE, fontSize: '13px', color: COLOR.azul }));
        for (let k = 0; k < NIVEL_MAX; k++) m.add(this.add.circle(210 + k * 13, y + 14, 5, k < nv ? HEX.amarillo : 0x000000, k < nv ? 1 : 0.4).setStrokeStyle(2, HEX.crema));
        if (nv >= NIVEL_MAX) m.add(texto(this, 330, y, 'Al máximo', 16, COLOR.verde));
        else {
          const precio = precioMejora(mj);
          m.add(boton(this, 330, y, `${precio}`, () => comprar(mj), { ancho: 110, alto: 42, tam: 18, color: ESTADO.monchis >= precio ? HEX.amarillo : 0x8a7fa0 }));
        }
      });
    }, () => this.cerrarModal(), cobrar);
    this.modal.numeros = [...MEJORAS_NEGOCIO.map(mj => () => comprar(mj)), () => this.obras(), () => this.deco()];
  }

  // Obras: lanzar una ampliación (paga y encarga la obra de inauguración a quien toca).
  obras() {
    const n = negocio();
    const lanzar = a => {
      if (n.salas[a.id] || !a.requiere()) return;
      const enCurso = Object.values(ESTADO.situaciones).some(s => s.ampliacion === a.id);
      if (enCurso) return;
      const ocupado = ESTADO.situaciones[a.quien];
      if (ocupado && ocupado.aceptada) return golpeTexto(this, ANCHO / 2, 640, `Termina antes lo que tienes con ${QUIEN[a.quien].nombre}`, COLOR.rosa, 30).setDepth(1001);
      if (!this.pagar(a.precio)) return;
      const pasos = a.obra.pasos.map(p => ({ ...p }));
      const cuantos = (pasos.find(p => p.recoger) || {}).n || 0;
      ESTADO.situaciones[a.quien] = { pl: `obra_${a.id}`, titulo: a.obra.titulo, texto: a.obra.texto.replace('{n}', cuantos), pasos, paso: 0, aceptada: false, premio: { monchis: 30 }, ampliacion: a.id };
      guardarPartida();
      this.cerrarModal();
      this.marcarSituaciones();
      sfx(this, 'tiroriro');
      this.toast(`Obra lanzada: ${a.nombre}`, `Habla con ${QUIEN[a.quien].nombre} (${SALAS[this.salaDe(a.quien)].nombre})`);
    };
    this.abrirModal(m => {
      m.add(texto(this, 0, -205, 'Obras: ampliar Unaké', 34, COLOR.rosa));
      m.add(texto(this, 0, -168, 'Cada sala nueva trae más gente y sitio para decorar. Se inaugura con una obra.', 16, COLOR.crema, 760));
      AMPLIACIONES.forEach((a, i) => {
        const y = -100 + i * 100;
        const abierta = !!n.salas[a.id];
        const enCurso = Object.values(ESTADO.situaciones).some(s => s.ampliacion === a.id);
        m.add(this.add.text(-380, y - 30, `${i + 1} · ${a.nombre}`, { fontFamily: FUENTE, fontSize: '22px', color: COLOR.crema }));
        m.add(this.add.text(-380, y + 2, `+${a.aforo} de aforo · +${a.atraccion} de clientela · obra con ${QUIEN[a.quien].nombre}`, { fontFamily: FUENTE, fontSize: '15px', color: COLOR.azul }));
        if (abierta) m.add(texto(this, 290, y, 'Abierta', 22, COLOR.verde));
        else if (enCurso) m.add(texto(this, 290, y, 'En obras', 22, COLOR.amarillo));
        else if (!a.requiere()) m.add(texto(this, 290, y, a.requisito, 15, COLOR.rosa, 220));
        else m.add(boton(this, 290, y, `${a.precio} monchis`, () => lanzar(a), { ancho: 200, alto: 50, tam: 19, color: ESTADO.monchis >= a.precio ? HEX.amarillo : 0x8a7fa0 }));
      });
      m.add(boton(this, 0, 210, 'Volver al negocio (Esc)', () => { this.cerrarModal(); this.abrirNegocio(); }, { ancho: 300, alto: 46, tam: 18, color: HEX.crema }));
    }, () => { this.cerrarModal(); this.abrirNegocio(); });
    this.modal.numeros = AMPLIACIONES.map(a => () => lanzar(a));
  }

  // Decoración: opcional, se coloca a la vista y mejora algo.
  deco() {
    ESTADO.deco = ESTADO.deco || {};
    const comprar = d => {
      if (ESTADO.deco[d.id] || !salaAbierta(d.sala)) return;
      if (!this.pagar(d.precio)) return;
      ESTADO.deco[d.id] = true;
      guardarPartida();
      sfx(this, 'tiroriro');
      this.cerrarModal();
      if (this.sala === d.sala) this.cargarSala(this.sala);
      this.toast(`¡${d.nombre}!`, `${d.efecto} · colocada en ${SALAS[d.sala].nombre}`);
    };
    this.abrirModal(m => {
      m.add(texto(this, 0, -212, 'Decoración', 34, COLOR.azul));
      DECORACION.forEach((d, i) => {
        const col = i % 2;
        const fila = Math.floor(i / 2);
        const x = col ? 20 : -400;
        const y = -160 + fila * 70;
        const img = this.add.image(x + 26, y, `deco-${d.id === 'estatua' ? 'bola' : d.id}`);
        if (d.id === 'estatua') img.setTexture('monchiman').setTint(0xb8b8b8);
        img.setScale(46 / Math.max(img.width, img.height));
        m.add(img);
        m.add(this.add.text(x + 56, y - 22, d.nombre, { fontFamily: FUENTE, fontSize: '16px', color: COLOR.crema }));
        m.add(this.add.text(x + 56, y, `${d.efecto} · ${SALAS[d.sala].nombre}`, { fontFamily: FUENTE, fontSize: '12px', color: COLOR.azul, wordWrap: { width: 230 } }));
        if (ESTADO.deco[d.id]) m.add(texto(this, x + 330, y, 'Puesta', 16, COLOR.verde));
        else if (!salaAbierta(d.sala)) m.add(texto(this, x + 330, y, 'Sala cerrada', 13, COLOR.rosa));
        else m.add(boton(this, x + 330, y, `${d.precio}`, () => comprar(d), { ancho: 90, alto: 40, tam: 17, color: ESTADO.monchis >= d.precio ? HEX.amarillo : 0x8a7fa0 }));
      });
      m.add(boton(this, 0, 222, 'Volver al negocio (Esc)', () => { this.cerrarModal(); this.abrirNegocio(); }, { ancho: 300, alto: 42, tam: 18, color: HEX.crema }));
    }, () => { this.cerrarModal(); this.abrirNegocio(); });
  }

  // La decoración comprada, colocada en su sala (con su brillo y su movimiento).
  montarDeco(sala) {
    const d = ESTADO.deco || {};
    DECORACION.filter(x => d[x.id] && x.sala === sala).forEach(x => {
      let img;
      if (x.id === 'estatua') {
        const pie = this.add.rectangle(x.x, x.y, 120, 30, 0x8a8f99).setStrokeStyle(4, HEX.tinta).setDepth(x.y - 1);
        img = this.add.image(x.x, x.y - 14, 'monchiman').setOrigin(0.5, 1).setScale(0.38).setTint(0xb8b8b8).setDepth(x.y);
        this.objSala.push(pie);
      } else {
        img = this.add.image(x.x, x.y, `deco-${x.id}`).setOrigin(0.5, x.id === 'bola' ? 0.5 : 1).setDepth(x.id === 'alfombra' ? 1 : x.y);
        const alto = { bola: 120, planta: 140, poster: 130, pinball: 170, pecera: 120, alfombra: 70, lava: 140, trono: 170, gramola: 180 }[x.id] || 120;
        img.setScale(alto / img.height);
      }
      if (x.id === 'bola') this.tweens.add({ targets: img, angle: 360, duration: 6000, repeat: -1 });
      if (x.id === 'lava' || x.id === 'pecera') this.tweens.add({ targets: img, scaleY: img.scaleY * 1.03, duration: 900, yoyo: true, repeat: -1 });
      this.objSala.push(img);
    });
  }

  // ---------- Situaciones: problemas de cada personaje ----------

  nuevaSituacionBarrio() {
    ESTADO.situaciones = ESTADO.situaciones || {};
    if (Object.keys(ESTADO.situaciones).length >= 2) return;
    const candidatos = DESTINOS.filter(d => !ESTADO.situaciones[d.id] && (ESTADO.dentro || (d.sala !== 'dentro' && d.sala !== 'cocina')))
      .map(d => d.id).filter(id => (SITUACIONES[id] || []).some(p => (ESTADO.capitulo || 0) >= p.desde));
    if (!candidatos.length) return;
    const id = Phaser.Utils.Array.GetRandom(candidatos);
    const s = nuevaSituacion(id);
    if (!s) return;
    ESTADO.situaciones[id] = s;
    guardarPartida();
    this.marcarSituaciones();
    this.toast(`${QUIEN[id].nombre} tiene un problema`, `«${s.titulo}» · búscale (${SALAS[this.salaDe(id)].nombre})`);
  }

  // Logros y retos: se miran cada segundo; lo nuevo sale en aviso dorado (de uno en uno).
  revisarLogros() {
    if (this.cambiando) return;
    const cola = this.colaDorada = this.colaDorada || [];
    comprobarLogros().forEach(l => cola.push([`¡Logro! ${l.nombre}`, `${l.texto} · +${l.premio} monchis`]));
    const { nuevos, tres } = comprobarRetos();
    nuevos.forEach(r => cola.push(['Reto de la noche cumplido', `${r.texto} · +${r.premio} monchis`]));
    if (tres) cola.push(['¡Los tres retos de hoy!', `+${PREMIO_TRES_RETOS} monchis · mañana, otros tres`]);
    if (cola.length && !this.modal && this.time.now > (this.siguienteDorado || 0)) {
      avisoDorado(this, ...cola.shift());
      this.siguienteDorado = this.time.now + 4800;
      this.refrescarHud();
    }
  }

  // Los retos de hoy y todos los logros, por páginas.
  logros(pagina = 0) {
    const porPagina = 10;
    const paginas = Math.ceil(LOGROS.length / porPagina);
    pagina = (pagina + paginas) % paginas;
    ESTADO.logros = ESTADO.logros || {};
    const R = retosDeHoy();
    this.abrirModal(c => {
      c.add(texto(this, 0, -222, 'Retos de la noche', 30, COLOR.amarillo));
      R.lista.forEach((r, i) => {
        const y = -184 + i * 30;
        const p = progresoReto(r);
        c.add(this.add.circle(-370, y, 9, r.hecho ? 0x7ee081 : 0x000000, r.hecho ? 1 : 0.35).setStrokeStyle(2, HEX.crema));
        c.add(this.add.text(-350, y, r.texto, { fontFamily: FUENTE, fontSize: '18px', color: r.hecho ? '#9be7a0' : COLOR.crema }).setOrigin(0, 0.5));
        c.add(this.add.rectangle(120, y, 160, 12, 0x000000, 0.4).setOrigin(0, 0.5).setStrokeStyle(2, HEX.crema));
        c.add(this.add.rectangle(120, y, 160 * p / r.n, 12, r.hecho ? 0x7ee081 : HEX.amarillo).setOrigin(0, 0.5));
        c.add(this.add.text(390, y, r.hecho ? '¡Hecho!' : `${p}/${r.n} · +${r.premio}`, { fontFamily: FUENTE, fontSize: '15px', color: COLOR.amarillo }).setOrigin(1, 0.5));
      });
      const conseguidos = LOGROS.filter(l => ESTADO.logros[l.id]).length;
      c.add(texto(this, 0, -80, `Logros · ${conseguidos}/${LOGROS.length}`, 26, COLOR.rosa));
      LOGROS.slice(pagina * porPagina, (pagina + 1) * porPagina).forEach((l, i) => {
        const x = i % 2 ? 20 : -390;
        const y = -38 + Math.floor(i / 2) * 50;
        const si = !!ESTADO.logros[l.id];
        c.add(this.add.star(x + 16, y + 6, 5, 7, 15, si ? HEX.amarillo : 0x4a3d5c).setStrokeStyle(3, HEX.tinta));
        c.add(this.add.text(x + 40, y - 10, l.nombre, { fontFamily: FUENTE, fontSize: '17px', color: si ? COLOR.amarillo : '#b9aecb' }));
        c.add(this.add.text(x + 40, y + 12, `${l.texto} · ${si ? 'conseguido' : `+${l.premio}`}`, { fontFamily: FUENTE, fontSize: '13px', color: si ? '#9be7a0' : COLOR.crema }));
      });
      c.add(boton(this, -250, 215, '← (1)', () => this.logros(pagina - 1), { ancho: 130, alto: 46, tam: 18, color: HEX.azul }));
      c.add(texto(this, -100, 215, `${pagina + 1}/${paginas}`, 18, COLOR.crema));
      c.add(boton(this, 50, 215, '→ (2)', () => this.logros(pagina + 1), { ancho: 130, alto: 46, tam: 18, color: HEX.azul }));
      c.add(boton(this, 260, 215, 'Cerrar (Esc)', () => this.cerrarModal(), { ancho: 200, alto: 46, tam: 18, color: HEX.crema }));
    }, () => this.cerrarModal(), () => this.logros(pagina + 1));
    this.modal.numeros = [() => this.logros(pagina - 1), () => this.logros(pagina + 1)];
  }

  // Aviso que entra por la derecha y se va solo.
  toast(titulo, sub) {
    const t = this.add.container(-260, 230).setDepth(905);
    t.add(this.add.graphics().fillStyle(HEX.tinta, 0.92).fillRoundedRect(-230, -40, 460, 80, 18).lineStyle(3, HEX.rosa, 0.8).strokeRoundedRect(-230, -40, 460, 80, 18));
    t.add(texto(this, -196, 0, '?', 40, COLOR.rosa));
    t.add(this.add.text(-170, -26, titulo, { fontFamily: FUENTE, fontSize: '19px', color: COLOR.crema }));
    t.add(this.add.text(-170, 4, sub, { fontFamily: FUENTE, fontSize: '14px', color: COLOR.amarillo, wordWrap: { width: 380 } }));
    this.tweens.add({ targets: t, x: 250, duration: 380, ease: 'Back.out' });
    sfx(this, 'campanita', { volume: 0.5 });
    this.time.delayedCall(6000, () => this.tweens.add({ targets: t, x: -260, duration: 260, onComplete: () => t.destroy() }));
  }

  marcarSituaciones() {
    (this.marcasSit || []).forEach(m => m.destroy());
    this.marcasSit = [];
    (this.cosas || []).forEach(c => {
      if (!ESTADO.situaciones[c.id]) return;
      const y = c.y - c.alto - 40;
      const m = texto(this, c.x - 64, y, '?', 50, COLOR.rosa).setDepth(801);
      this.tweens.add({ targets: m, y: y - 12, angle: { from: -8, to: 8 }, duration: 450, yoyo: true, repeat: -1 });
      this.marcasSit.push(m);
    });
  }

  situacion(c) {
    const s = ESTADO.situaciones[c.id];
    // Si es Perico (la puerta) y ya sabes la contraseña, siempre puedes pasar sin atender su problema.
    const puedePasar = c.tipo === 'puerta' && ESTADO.dentro;
    const pasar = () => { this.cerrarModal(); this.cambiarSala('dentro', 'puerta'); };
    if (this.mundo === 'normal') { this.poseNpc(c, 'hablando'); return this.charla(c, 'Tengo un problema, pero de día no se habla de eso. Vuelve de noche.'); }
    const paso = s.pasos[s.paso];
    if (!s.aceptada) {
      const pasos = s.pasos.map((p, i) => `${i + 1}. ${p.recoger ? `Busca ${p.n} ${RECOGIBLES[p.recoger].nombre}${p.n > 1 ? 's' : ''} por el barrio` : `Minijuego: ${MISIONES[p.mision].nombre}`}`).join('\n');
      const aceptar = () => {
        s.aceptada = true;
        guardarPartida();
        this.cerrarModal();
        if (s.pasos[0].mision) return this.situacion(c);
        this.empezarPaso(c.id);
        this.poseNpc(c, 'riendo');
        this.charla(c, '¡Gracias! Sabía que podía contar contigo.');
      };
      this.abrirModal(m => {
        const arte = `sit-${s.pl}`;
        if (this.textures.exists(arte)) {
          const img = this.add.image(-270, -10, arte);
          img.setScale(260 / Math.max(img.width, img.height));
          m.add(this.add.rectangle(-270, -10, img.displayWidth + 12, img.displayHeight + 12, HEX.tinta));
          m.add(img);
        } else {
          const img = this.add.image(-300, -20, c.img ? c.img.texture.key : 'vuper');
          img.setScale(230 / img.height);
          flotar(this, img, { amplitud: 5 });
          m.add(img);
        }
        m.add(texto(this, 90, -200, s.titulo, 38, COLOR.rosa, 560));
        m.add(this.add.text(90, -110, s.texto, { fontFamily: FUENTE, fontSize: '21px', color: COLOR.crema, align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5));
        m.add(this.add.text(-170, -10, pasos, { fontFamily: FUENTE, fontSize: '19px', color: COLOR.azul, lineSpacing: 8 }));
        m.add(texto(this, 90, 110, `Premio: ${textoPremio(s.premio)}`, 20, COLOR.amarillo, 560));
        if (puedePasar) {
          m.add(boton(this, -200, 190, 'Aceptar (E)', aceptar, { ancho: 230, tam: 22, color: HEX.verde }));
          m.add(boton(this, 50, 190, 'Solo pasar (2)', pasar, { ancho: 230, tam: 22, color: HEX.azul }));
          m.add(boton(this, 290, 190, 'Ahora no (Esc)', () => this.cerrarModal(), { ancho: 220, tam: 20, color: HEX.crema }));
        } else {
          m.add(boton(this, -60, 190, 'Aceptar (E)', aceptar, { ancho: 260, tam: 24, color: HEX.verde }));
          m.add(boton(this, 240, 190, 'Ahora no (Esc)', () => this.cerrarModal(), { ancho: 240, tam: 22, color: HEX.crema }));
        }
      }, () => this.cerrarModal(), aceptar);
      this.modal.numeros = puedePasar ? [aceptar, pasar] : [aceptar];
      return;
    }
    if (paso && paso.recoger) {
      this.poseNpc(c, 'hablando');
      const salas = [...new Set(ESTADO.recogibles.filter(r => r.sit === c.id).map(r => SALAS[r.sala].nombre))].join(', ');
      this.charla(c, `Aún me faltan ${paso.n - paso.hechos}. Creo que hay en: ${salas}.${puedePasar ? ' Pasa, pasa.' : ''}`);
      if (puedePasar) this.time.delayedCall(900, () => this.cambiarSala('dentro', 'puerta'));
      return;
    }
    if (paso && paso.mision) {
      const jugar = () => { ESTADO.situacionEnJuego = c.id; this.lanzar(paso.mision); };
      return this.tarjeta(paso.mision, jugar, `Para ${QUIEN[c.id].nombre}: ${s.titulo}`, puedePasar ? [{ etiqueta: 'Pasar', accion: pasar, color: HEX.azul }] : []);
    }
  }

  // Prepara el paso en curso: si es recoger, siembra las cosas por el barrio.
  empezarPaso(id) {
    const s = ESTADO.situaciones[id];
    const p = s.pasos[s.paso];
    if (!p) {
      // Sin más pasos (solo había que recoger): resuelta aquí mismo.
      const premio = completarSituacion(id);
      this.refrescarHud();
      sfx(this, 'platillo', { volume: 0.5 });
      this.toast(`Problema de ${QUIEN[id].nombre} resuelto`, premio);
      this.marcarSituaciones();
      return;
    }
    if (p.recoger) {
      const salas = [...SALAS_BOQUILLA, ...(ESTADO.dentro ? ['dentro'] : [])];
      for (let i = 0; i < p.n; i++) {
        const sala = Phaser.Utils.Array.GetRandom(salas);
        const [y0, y1] = SALAS[sala].suelo;
        ESTADO.recogibles.push({ sit: id, tipo: p.recoger, sala, x: Phaser.Math.Between(160, ANCHO - 160), y: Phaser.Math.Between(y0, y1) });
      }
      golpeTexto(this, ANCHO / 2, 280, `Busca ${p.n} ${RECOGIBLES[p.recoger].nombre}${p.n > 1 ? 's' : ''} por el barrio`, COLOR.verde, 40);
    } else {
      golpeTexto(this, ANCHO / 2, 280, `Vuelve con ${QUIEN[id].nombre}`, COLOR.verde, 40);
    }
    guardarPartida();
    this.montarRecogibles();
    this.marcarSituaciones();
  }

  montarRecogibles() {
    (this.recogiblesSala || []).forEach(o => { o.img.destroy(); o.brillo.destroy(); });
    this.recogiblesSala = [];
    (ESTADO.recogibles || []).filter(r => r.sala === this.sala).forEach(r => {
      const R = RECOGIBLES[r.tipo];
      const brillo = this.add.star(r.x, r.y - 30, 4, 8, 36, 0xffb3d1, 0.9).setDepth(r.y - 1);
      this.tweens.add({ targets: brillo, angle: 90, scale: 0.6, duration: 650, yoyo: true, repeat: -1 });
      const img = this.add.image(r.x, r.y - 14, R.sprite).setScale(R.escala).setDepth(r.y);
      this.tweens.add({ targets: img, y: r.y - 24, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.recogiblesSala.push({ r, img, brillo });
    });
  }

  recogidaCercana() {
    const o = (this.recogiblesSala || []).find(x => Math.hypot(x.r.x - this.px, x.r.y - this.py) < 80);
    if (!o) return;
    this.recogiblesSala = this.recogiblesSala.filter(x => x !== o);
    ESTADO.recogibles = ESTADO.recogibles.filter(x => x !== o.r);
    o.brillo.destroy();
    this.tweens.add({ targets: o.img, y: o.img.y - 80, scale: 0, duration: 380, ease: 'Back.in', onComplete: () => o.img.destroy() });
    const s = ESTADO.situaciones[o.r.sit];
    sfx(this, 'campanita');
    if (!s) return guardarPartida();
    const p = s.pasos[s.paso];
    p.hechos++;
    golpeTexto(this, this.px, this.py - 220, `${RECOGIBLES[p.recoger].nombre} ${p.hechos}/${p.n}`, COLOR.verde, 38);
    if (p.hechos >= p.n) {
      s.paso++;
      this.time.delayedCall(600, () => this.empezarPaso(o.r.sit));
    }
    guardarPartida();
  }

  // Lo que se está buscando ahora (para la línea de aviso).
  buscando() {
    for (const [id, s] of Object.entries(ESTADO.situaciones || {})) {
      const p = s.aceptada && s.pasos[s.paso];
      if (p && p.recoger) {
        const salas = [...new Set(ESTADO.recogibles.filter(r => r.sit === id).map(r => SALAS[r.sala].nombre))].join(', ');
        return { id, nombre: RECOGIBLES[p.recoger].nombre, hechos: p.hechos, n: p.n, salas };
      }
    }
    return null;
  }

  // ---------- Encuentros en modo libre: cada vez, algo distinto según la situación ----------

  encuentro(c) {
    if (!TONTERIAS[c.id]) return this.charla(c, '…');
    const faltan = this.faltanLiar();
    const puedeRegalo = Date.now() - (ESTADO.ultimoRegalo || 0) > 45000;
    const pesos = {
      tonteria: 3,
      colocada: ESTADO.colocon > 65 ? 2 : 0,
      meme: 2, video: 1.6, noticia: 1.2, chat: 1.2,
      trivial: 1,
      pista: faltan.length ? 2.2 : 0.5,
      recado: ESTADO.recado ? 0 : 1.3,
      regalo: puedeRegalo ? (ESTADO.hambre > 60 || ESTADO.vida < 50 ? 3 : 0.7) : 0,
    };
    if (this.ultimoEncuentro) pesos[this.ultimoEncuentro] *= 0.15;
    const total = Object.values(pesos).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    const tipo = Object.keys(pesos).find(k => (r -= pesos[k]) <= 0) || 'tonteria';
    this.ultimoEncuentro = tipo;

    const al = lista => this.sinRepetir(lista);
    if (tipo === 'tonteria') { this.poseNpc(c, 'hablando'); return this.charla(c, al(TONTERIAS[c.id])); }
    if (tipo === 'colocada') { this.poseNpc(c, 'sorprendido'); return this.charla(c, al(COLOCADAS)); }
    if (tipo === 'pista') return this.pista(c, faltan);
    if (tipo === 'recado') return this.nuevoRecado(c);
    if (tipo === 'regalo') return this.regalo(c);
    if (tipo === 'trivial') return this.trivial(c);
    // El móvil: primero te lo anuncia, luego lo saca.
    const contenido = tipo === 'meme' ? { tipo, m: Math.random() < 0.55 ? memeGenerado() : al(MEMES) }
      : tipo === 'video' ? { tipo, v: al(VIDEOS) }
        : tipo === 'noticia' ? { tipo, n: al(NOTICIAS) }
          : { tipo: 'chat', mensajes: Math.random() < 0.35 ? chatDinamico() : al(CHATS) };
    this.poseNpc(c, 'riendo');
    this.charla(c, al(['¡Mira esto, mira!', '¿Has visto esto? JAJA', 'Te lo enseño, que es buenísimo', 'Ojo a esto…', 'Esto lo tienes que ver']));
    this.bloqueado = true;
    this.time.delayedCall(800, () => { this.bloqueado = false; this.abrirMovil(c, contenido); });
  }

  // Pose de reacción del personaje (hablando, riendo, sorprendido) y vuelta a su pose.
  poseNpc(c, pose, ms = 2600) {
    if (!c.img || c.recorte) return;
    const humo = this.mundo === 'humo';
    const HUMO = {
      palicaso: { hablando: 'palicaso-contando', riendo: 'palicaso-riendo', sorprendido: 'palicaso-contando' },
      lasslow: { hablando: 'lasslow-digno', riendo: 'lasslow', sorprendido: 'lasslow-horror' },
      pompa: { hablando: 'pompa-mira', riendo: 'pompa-mira', sorprendido: 'pompa-horror' },
      perico: { hablando: 'perico-cotilleando', riendo: 'perico-silbando', sorprendido: 'perico-horror' },
      blancaso: { hablando: 'blancaso-esperanza', riendo: 'blancaso-esperanza', sorprendido: 'blancaso-mareado' },
      cotine: {},
    };
    const nueva = humo ? (HUMO[c.id] || {})[pose] : `${c.sprite}-${pose}`;
    if (!nueva || !this.textures.exists(nueva)) return;
    const base = c.sprite;
    const alto = c.alto;
    const poner = clave => {
      if (!c.img.active) return;
      c.img.setTexture(clave);
      c.img.setScale(alto / c.img.height);
    };
    poner(nueva);
    this.tweens.add({ targets: c.img, scaleX: c.img.scaleX * 1.12, scaleY: c.img.scaleY * 0.9, duration: 90, yoyo: true });
    if (this.poseVuelta) this.poseVuelta.remove();
    this.poseVuelta = this.time.delayedCall(ms, () => poner(base));
  }

  // Lo de la noche, de día no: te dicen que vuelvas cuando estés en el mundo humo.
  deNoche(c) {
    this.poseNpc(c, 'hablando');
    this.charla(c, Phaser.Utils.Array.GetRandom([
      'De día no, hombre. Esto es cosa de la noche. Vuelve cuando estés… ya sabes.',
      'Ahora no. Cuando estés en el humo, hablamos.',
      'De día soy una persona normal. Normalísima. Vuelve de noche.',
    ]));
  }

  faltanLiar() {
    const inv = ESTADO.inv;
    return ['papel', 'boquilla', 'bolsita', 'mechero'].filter(k => (k === 'mechero' ? !inv.mechero : !inv[k]));
  }

  pista(c, faltan) {
    this.poseNpc(c, 'hablando');
    const b = ESTADO.boquillaEn;
    const frases = {
      boquilla: b ? `He visto una boquilla brillando en ${SALAS[b.sala].nombre}. No me preguntes qué hacía yo mirando el suelo.` : 'Boquillas… siempre hay alguna tirada por el barrio. Mira bien el suelo.',
      bolsita: 'Lo de la aso te lo pone Palicaso en la barra. Lleva monchis.',
      papel: 'Papel tienen en la tienda de 24 h. El gato te mira mal, pero no muerde.',
      mechero: 'Mechero, en la tienda. O pídeselo a Perico… no, a Perico no, que no lo devuelve.',
    };
    if (faltan.length) return this.charla(c, frases[Phaser.Utils.Array.GetRandom(faltan)]);
    const sinJugar = ['Tarta', 'Lasslow', 'Contrasena'].find(k => !ESTADO.estrellas[k]);
    const misiones = { Tarta: 'Cotine anda liada con una tarta en la cocina. Échale una mano. O dos.', Lasslow: 'Lasslow dice que hoy es un señor. Alguien tiene que vigilarle.', Contrasena: 'Perico está aburrido en la puerta. Dale conversación.' };
    this.charla(c, sinJugar && Math.random() < 0.5 ? misiones[sinJugar] : 'Lo tienes todo para liarte. ¿Qué haces aquí? Al sofá de Unaké, hombre.');
  }

  regalo(c) {
    ESTADO.ultimoRegalo = Date.now();
    this.poseNpc(c, 'riendo');
    if (ESTADO.hambre > 60) { this.charla(c, 'Toma, que tienes cara de monchis.'); return this.comer(TIENDA[1]); }
    if (ESTADO.vida < 50) { this.charla(c, 'Estás blanco. Bueno, más. Tómate esto.'); return this.comer(TIENDA[2]); }
    if (Math.random() < 0.5) {
      ESTADO.inv.papel++;
      this.charla(c, 'Toma un papel, que siempre viene bien.');
      golpeTexto(this, this.px, this.py - 220, '+1 papel', COLOR.amarillo, 36);
    } else {
      const n = Phaser.Math.Between(10, 25);
      ESTADO.monchis += n;
      this.charla(c, 'Te debía esto. Creo. Da igual, tómalo.');
      golpeTexto(this, this.px, this.py - 220, `+${n} monchis`, COLOR.amarillo, 36);
    }
    sfx(this, 'campanita');
    guardarPartida();
    this.refrescarHud();
  }

  trivial(c) {
    const q = this.sinRepetir(TRIVIAL);
    const opciones = Phaser.Utils.Array.Shuffle([...q.r]);
    this.poseNpc(c, 'hablando', 6000);
    const contestar = o => {
      this.cerrarModal();
      if (o === q.r[0]) {
        ESTADO.monchis += 15;
        sumarStat('trivial');
        this.refrescarHud();
        sfx(this, 'campanita');
        this.poseNpc(c, 'riendo');
        this.charla(c, '¡Eso es! Toma 15 monchis.');
      } else {
        sfx(this, 'golpe');
        this.poseNpc(c, 'sorprendido');
        this.charla(c, `¡Que no! Es «${q.r[0]}». ¿Tú de qué barrio eres?`);
      }
    };
    this.abrirModal(m => {
      const img = this.add.image(-300, -20, c.img ? c.img.texture.key : 'vuper');
      img.setScale(230 / Math.max(img.width, img.height));
      m.add(img);
      m.add(texto(this, 90, -180, 'Pregunta del barrio', 36, COLOR.amarillo));
      m.add(texto(this, 90, -100, q.p, 30, COLOR.crema, 560));
      opciones.forEach((o, i) => m.add(boton(this, 90, -10 + i * 76, `${i + 1} · ${o}`, () => contestar(o), { ancho: 520, alto: 62, tam: 22 })));
      m.add(texto(this, 90, 215, 'Acierta y te llevas 15 monchis', 18, COLOR.azul));
    }, () => this.cerrarModal());
    this.modal.numeros = opciones.map(o => () => contestar(o));
  }

  // ---------- Recados ----------

  salaDe(id) {
    const d = DESTINOS.find(x => x.id === id);
    return d ? d.sala : 'fuera';
  }

  nuevoRecado(c) {
    const comida = TIENDA.filter(p => p.hambre || p.vida);
    if (Math.random() < 0.5) {
      const posibles = DESTINOS.filter(d => d.id !== c.id && (ESTADO.dentro || d.sala !== 'dentro' && d.sala !== 'cocina'));
      const a = Phaser.Utils.Array.GetRandom(posibles).id;
      const texto = Phaser.Utils.Array.GetRandom(MENSAJES);
      ESTADO.recado = { tipo: 'mensaje', de: c.id, a, texto, premio: 20 };
      this.charla(c, `Oye, ¿le dices a ${QUIEN[a].nombre} ${texto}? Te lo pago.`);
    } else {
      const p = Phaser.Utils.Array.GetRandom(comida);
      ESTADO.recado = { tipo: 'traer', de: c.id, a: c.id, item: p.id, llevo: false, premio: p.precio * 2 + 10 };
      this.charla(c, `¿Me traes ${p.nombre.split(' (')[0].toLowerCase()} de la tienda? Te lo pago doble.`);
    }
    this.poseNpc(c, 'hablando');
    sfx(this, 'campanita', { volume: 0.5 });
    golpeTexto(this, ANCHO / 2, 250, '¡Recado nuevo!', COLOR.verde, 44);
    guardarPartida();
    this.marcarRecado();
  }

  cumplirRecado(c) {
    const r = ESTADO.recado;
    ESTADO.recado = null;
    ESTADO.monchis += r.premio;
    sumarStat('recados');
    this.refrescarHud();
    this.marcarRecado();
    sfx(this, 'campanita');
    this.poseNpc(c, 'riendo');
    this.charla(c, r.tipo === 'mensaje' ? Phaser.Utils.Array.GetRandom(RESPUESTAS) : '¡Gracias! Toma, y lo que sobra para ti.');
    golpeTexto(this, this.px, this.py - 220, `Recado hecho · +${r.premio} monchis`, COLOR.amarillo, 36);
  }

  // Marca «Recado» encima de quien lo espera, si está en esta sala.
  marcarRecado() {
    if (this.marcaRecado) { this.marcaRecado.destroy(); this.marcaRecado = null; }
    const r = ESTADO.recado;
    if (!r || (r.tipo === 'traer' && !r.llevo)) return;
    const c = (this.cosas || []).find(x => x.id === r.a);
    if (!c) return;
    const y = c.y - c.alto - 20;
    this.marcaRecado = texto(this, c.x + 70, y, 'Recado', 22, COLOR.verde).setDepth(801);
    this.tweens.add({ targets: this.marcaRecado, y: y - 10, duration: 450, yoyo: true, repeat: -1 });
  }

  // ---------- Tu móvil: te mandan cosas mientras paseas ----------

  notificar() {
    this.tNotif = Phaser.Math.Between(55, 100);
    const remitente = Phaser.Utils.Array.GetRandom(['palicaso', 'blancaso', 'pompa', 'lasslow', 'cotine', 'perico']);
    const tipo = Phaser.Utils.Array.GetRandom(['meme', 'meme', 'video', 'noticia', 'chat']);
    const al = l => this.sinRepetir(l);
    const contenido = tipo === 'meme' ? { tipo, m: Math.random() < 0.55 ? memeGenerado() : al(MEMES) } : tipo === 'video' ? { tipo, v: al(VIDEOS) } : tipo === 'noticia' ? { tipo, n: al(NOTICIAS) } : { tipo, mensajes: Math.random() < 0.35 ? chatDinamico() : al(CHATS) };
    const que = { meme: 'un meme', video: 'un vídeo', noticia: 'una noticia', chat: 'mensajes en el grupo' }[tipo];
    const t = this.add.container(-260, 320).setDepth(905);
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 0.92).fillRoundedRect(-230, -40, 460, 80, 18).lineStyle(3, HEX.crema, 0.6).strokeRoundedRect(-230, -40, 460, 80, 18);
    // El iconito del móvil.
    g.fillStyle(HEX.crema, 1).fillRoundedRect(-212, -26, 30, 52, 7);
    g.fillStyle(0x9b4dff, 1).fillRoundedRect(-208, -20, 22, 38, 4);
    t.add(g);
    t.add(this.add.text(-170, -26, `${QUIEN[remitente].nombre} te ha mandado ${que}`, { fontFamily: FUENTE, fontSize: '19px', color: COLOR.crema }));
    t.add(this.add.text(-170, 4, 'Pulsa M (o toca aquí) para mirarlo', { fontFamily: FUENTE, fontSize: '15px', color: COLOR.amarillo }));
    t.setSize(460, 80).setInteractive({ useHandCursor: true });
    t.on('pointerdown', () => this.abrirNotificacion());
    this.tweens.add({ targets: t, x: 250, duration: 380, ease: 'Back.out' });
    this.tweens.add({ targets: t, angle: { from: -2, to: 2 }, duration: 50, yoyo: true, repeat: 5, delay: 380 });
    sfx(this, 'campanita', { volume: 0.5 });
    this.notif = { remitente, contenido, t };
    this.notif.caduca = this.time.delayedCall(8000, () => this.quitarNotificacion());
  }

  quitarNotificacion() {
    if (!this.notif) return;
    const { t, caduca } = this.notif;
    caduca.remove();
    this.notif = null;
    this.tweens.add({ targets: t, x: -260, duration: 260, ease: 'Sine.in', onComplete: () => t.destroy() });
  }

  abrirNotificacion() {
    if (!this.notif || this.modal) return;
    const { remitente, contenido } = this.notif;
    this.quitarNotificacion();
    this.abrirMovil({ img: this.jugador }, contenido, remitente);
  }

  // Charlas de ambiente: en Unaké hablan entre ellos; en las demás salas, alguno suelta lo suyo.
  charlaAmbiente() {
    if (this.modal || this.cambiando) return;
    const conImg = this.cosas.filter(c => c.img && QUIEN[c.id]);
    const por = id => conImg.find(c => c.id === id);
    const posibles = DIALOGOS.filter(d => d.every(([id]) => por(id)));
    if (posibles.length && Math.random() < 0.7) {
      Phaser.Utils.Array.GetRandom(posibles).forEach(([id, frase], i) => this.time.delayedCall(i * 2200, () => this.burbujaAmbiente(por(id), frase)));
      return;
    }
    const lejos = conImg.filter(c => Math.abs(c.x - this.px) > 260 && TONTERIAS[c.id]);
    if (lejos.length && Math.random() < 0.45) {
      const c = Phaser.Utils.Array.GetRandom(lejos);
      this.burbujaAmbiente(c, Phaser.Utils.Array.GetRandom(ESTADO.colocon > 65 ? COLOCADAS : TONTERIAS[c.id]));
    }
  }

  burbujaAmbiente(c, frase) {
    if (!c || !c.img || !c.img.active || this.modal) return;
    this.poseNpc(c, 'hablando', 2000);
    // Por encima de las marcas («!», estrellas, «E · …») para que no se tapen.
    const y = c.y - c.alto - (this.misionDe(c) ? 150 : 95);
    const b = bocadillo(this, Phaser.Math.Clamp(c.x, 190, ANCHO - 190), Math.max(150, y), frase, { tam: 19, ancho: 320 }).setDepth(850);
    this.burbujasAmb.push(b);
    sfx(this, 'pop', { volume: 0.15 });
    this.time.delayedCall(2300, () => { if (b.active) this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 200, onComplete: () => b.destroy() }); });
  }

  // ---------- El móvil ----------

  abrirMovil(c, contenido, remitente) {
    if (this.modal) return;
    this.objetivo = null;
    this.aviso.setVisible(false);
    const velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.6).setDepth(950).setInteractive();
    const cont = this.add.container(0, 0).setDepth(951);
    // Quien te lo enseña, a un lado, partiéndose.
    const clave = c.img ? c.img.texture.key : 'vuper';
    const quien = this.add.image(270, ALTO + 40, clave).setOrigin(0.5, 1);
    quien.setScale(380 / quien.height);
    cont.add(quien);
    this.tweens.add({ targets: quien, y: ALTO - 10, duration: 400, ease: 'Back.out' });
    this.tweens.add({ targets: quien, angle: { from: -3, to: 3 }, duration: 260, yoyo: true, repeat: -1, delay: 400 });
    if (remitente) cont.add(texto(this, 1030, 330, `${QUIEN[remitente].nombre}
te ha mandado esto`, 24, COLOR.amarillo));
    if (this.burbuja) this.burbuja.destroy();
    const m = movil(this, contenido);
    sumarStat('movil');
    m.c.setScale(0.92).setPosition(660, ALTO + 420);
    cont.add(m.c);
    this.tweens.add({ targets: m.c, y: 370, angle: { from: 8, to: -2 }, duration: 480, ease: 'Back.out' });
    sfx(this, 'campanita', { volume: 0.6 });
    this.cameras.main.shake(120, 0.003);
    const cerrar = () => {
      m.parar();
      this.tweens.add({ targets: m.c, y: ALTO + 420, duration: 260, ease: 'Sine.in' });
      this.time.delayedCall(260, () => this.cerrarModal());
    };
    const reir = () => {
      sfx(this, 'risas', { volume: 0.4 });
      ESTADO.monchis += 2;
      sumarStat('risas');
      this.refrescarHud();
      golpeTexto(this, 1020, 300, '+2 de buen rollo', COLOR.amarillo, 30).setDepth(1001);
      cerrar();
    };
    cont.add(boton(this, 1030, 420, 'JAJAJA (E)', reir, { ancho: 260, tam: 26, color: HEX.amarillo }));
    cont.add(boton(this, 1030, 510, 'Pasar (Esc)', cerrar, { ancho: 260, tam: 22, color: HEX.crema }));
    this.modal = { velo, c: cont };
    this.modalCerrar = cerrar;
    this.modalAccion = reir;
  }

  charla(c, linea) {
    if (this.burbuja) this.burbuja.destroy();
    const y = Math.max(140, c.y - c.alto - 70);
    this.burbuja = bocadillo(this, Phaser.Math.Clamp(c.x, 230, ANCHO - 230), y, linea, { tam: 24, ancho: 420 }).setDepth(850);
    sfx(this, 'pop', { volume: 0.4 });
    const b = this.burbuja;
    this.time.delayedCall(2600, () => { if (b.active) b.destroy(); });
  }

  cogerBoquilla() {
    const { img, brillo } = this.boquilla;
    this.boquilla = null;
    ESTADO.boquillaEn = null;
    ESTADO.inv.boquilla += 2;
    guardarPartida();
    sfx(this, 'campanita');
    brillo.destroy();
    this.tweens.add({ targets: img, x: this.ranuras[1].img.x, y: this.ranuras[1].img.y, scale: 0.2, duration: 450, ease: 'Sine.in', onComplete: () => { img.destroy(); this.refrescarHud(); } });
    golpeTexto(this, this.px, this.py - 200, '¡Una boquilla!', COLOR.amarillo, 40);
  }

  // ---------- Ventanas ----------

  abrirModal(construir, alCerrar, accion) {
    if (this.modal) this.cerrarModal(); // nunca dos ventanas a la vez
    this.objetivo = null;
    this.aviso.setVisible(false);
    const velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.55).setDepth(950).setInteractive();
    const c = this.add.container(ANCHO / 2, ALTO / 2).setDepth(951).setScale(0);
    const g = this.add.graphics();
    g.fillStyle(HEX.morado, 1).fillRoundedRect(-420, -250, 840, 500, 34);
    g.lineStyle(8, HEX.tinta, 1).strokeRoundedRect(-420, -250, 840, 500, 34);
    c.add(g);
    construir(c);
    this.tweens.add({ targets: c, scale: 1, duration: 280, ease: 'Back.out' });
    this.modal = { velo, c };
    this.modalCerrar = alCerrar;
    this.modalAccion = accion || alCerrar;
  }

  cerrarModal() {
    if (!this.modal) return;
    this.modal.velo.destroy();
    this.modal.c.destroy();
    this.modal = null;
  }

  // extras: botones de más, como { etiqueta, accion, color } (Pasar, Charlar…).
  tarjeta(clave, accionPropia, nota, extras = []) {
    const m = MISIONES[clave];
    const jugar = accionPropia
      ? () => { this.cerrarModal(); accionPropia(); }
      : () => this.lanzar(clave);
    this.abrirModal(c => {
      const normales = { perico: 'n-perico', cotine: 'n-cotine', 'lasslow-digno': 'n-lasslow' };
      const img = this.add.image(-280, -30, this.mundo === 'normal' && normales[m.sprite] ? normales[m.sprite] : m.sprite);
      img.setScale(220 / Math.max(img.width, img.height));
      flotar(this, img, { amplitud: 6 });
      c.add(img);
      c.add(texto(this, 110, -180, m.nombre, 40, COLOR.amarillo, 560));
      c.add(this.add.text(110, -70, m.texto, {
        fontFamily: FUENTE, fontSize: '22px', color: COLOR.crema, align: 'center', wordWrap: { width: 500 },
      }).setOrigin(0.5));
      c.add(estrellas(this, 110, 40, ESTADO.estrellas[clave] || 0, 20));
      const rec = leerRecord(clave);
      const unidad = clave === 'Reparto' ? 'entregas seguidas' : 'puntos';
      c.add(texto(this, 110, 86, `${rec ? `Récord: ${rec} ${unidad}  ·  ` : ''}Estrellas: ${m.umbrales.join(' · ')}`, 18, COLOR.crema, 540));
      if (nota) c.add(texto(this, 110, 122, nota, 22, COLOR.amarillo, 540));
      const botones = [
        { etiqueta: 'Jugar (E)', accion: jugar, color: HEX.amarillo },
        ...extras,
        { etiqueta: 'Ahora no (Esc)', accion: () => this.cerrarModal(), color: HEX.crema },
      ];
      const ancho = Math.min(250, 780 / botones.length - 14);
      botones.forEach((b, i) => {
        const x = -390 + (780 / botones.length) * (i + 0.5);
        const etiqueta = i > 0 && i < botones.length - 1 ? `${b.etiqueta} (${i + 1})` : b.etiqueta;
        c.add(boton(this, x, 190, etiqueta, b.accion, { ancho, tam: botones.length > 3 ? 19 : 24, color: b.color || HEX.verde }));
      });
    }, () => this.cerrarModal(), jugar);
    this.modal.numeros = [jugar, ...extras.map(e => e.accion)];
  }

  lanzar(clave, datos = {}) {
    ESTADO.x = this.px;
    ESTADO.y = this.py;
    guardarPartida();
    this.cerrarModal();
    irA(this, clave, { rotulo: Phaser.Utils.Array.GetRandom(ROTULOS), senal: clave === 'Rescate' && !!this.senal, ...datos });
  }

  // Lista de cosas con precio, para el taller, la tienda y la barra.
  lista(c, filas, y0 = -110, paso = 66) {
    filas.forEach((f, i) => {
      const y = y0 + i * paso;
      const img = this.add.image(-360, y, f.sprite);
      img.setScale(52 / Math.max(img.width, img.height));
      c.add(img);
      c.add(this.add.text(-318, y - 24, f.nombre, { fontFamily: FUENTE, fontSize: '22px', color: COLOR.crema }));
      c.add(this.add.text(-318, y + 4, f.efecto, { fontFamily: FUENTE, fontSize: '16px', color: COLOR.azul }));
      if (f.hecho) c.add(texto(this, 290, y, f.hecho, 22, COLOR.verde));
      else {
        const puede = ESTADO.monchis >= f.precio;
        c.add(boton(this, 290, y, `${i + 1} · ${f.precio} monchis`, f.accion, { ancho: 220, alto: 50, tam: 20, color: puede ? HEX.amarillo : 0x8a7fa0 }));
      }
    });
  }

  pagar(precio) {
    if (ESTADO.monchis >= precio) {
      ESTADO.monchis -= precio;
      guardarPartida();
      this.refrescarHud();
      return true;
    }
    sfx(this, 'golpe');
    this.cameras.main.shake(150, 0.006);
    golpeTexto(this, ANCHO / 2, 640, `Te faltan ${precio - ESTADO.monchis} monchis. Haz encargos en la tienda.`, COLOR.rosa, 28).setDepth(1001);
    return false;
  }

  taller() {
    this.abrirModal(c => {
      c.add(texto(this, 0, -210, 'Taller de inventos', 40, COLOR.amarillo));
      c.add(texto(this, 0, -168, `Tienes ${ESTADO.monchis} monchis`, 22, COLOR.crema));
      this.lista(c, INVENTOS.map(inv => ({
        ...inv, hecho: tiene(inv.id) ? 'Lo tienes' : null,
        accion: () => this.comprarInvento(inv),
      })), -116);
      c.add(boton(this, 0, 215, 'Cerrar (Esc)', () => this.cerrarModal(), { ancho: 220, alto: 46, tam: 20, color: HEX.crema }));
    }, () => this.cerrarModal());
    this.modal.numeros = INVENTOS.map(inv => () => { if (!tiene(inv.id)) this.comprarInvento(inv); });
  }

  comprarInvento(inv) {
    if (!this.pagar(inv.precio)) return;
    ESTADO.inventos[inv.id] = true;
    guardarPartida();
    sfx(this, 'tiroriro');
    this.cerrarModal();
    this.taller();
    golpeTexto(this, ANCHO / 2, 640, `¡${inv.nombre}!`, COLOR.amarillo, 40).setDepth(1001);
  }

  tienda() {
    const r = ESTADO.recado;
    const filas = TIENDA.map(p => ({
      ...p, hecho: p.id === 'mechero' && ESTADO.inv.mechero ? 'Lo tienes' : null,
      accion: () => this.comprarTienda(p),
    }));
    if (r && r.tipo === 'traer' && !r.llevo) {
      const p = TIENDA.find(x => x.id === r.item);
      filas.unshift({
        ...p, nombre: `Para ${QUIEN[r.de].nombre}: ${p.nombre.split(' (')[0].toLowerCase()}`, efecto: 'Recado: te lo pagan doble',
        accion: () => {
          if (!this.pagar(p.precio)) return;
          r.llevo = true;
          guardarPartida();
          sfx(this, 'campanita');
          this.cerrarModal();
          golpeTexto(this, ANCHO / 2, 600, `Ahora llévaselo a ${QUIEN[r.de].nombre}`, COLOR.verde, 34);
        },
      });
    }
    this.abrirModal(c => {
      c.add(texto(this, 0, -210, 'La tienda de 24 h', 40, COLOR.amarillo));
      c.add(texto(this, 0, -168, `Tienes ${ESTADO.monchis} monchis · Hambre ${Math.round(ESTADO.hambre)} · Vida ${Math.round(ESTADO.vida)}`, 20, COLOR.crema));
      this.lista(c, filas, filas.length > 5 ? -128 : -116, filas.length > 5 ? 56 : 66);
      c.add(boton(this, 0, 215, 'Cerrar (Esc)', () => this.cerrarModal(), { ancho: 220, alto: 46, tam: 20, color: HEX.crema }));
    }, () => this.cerrarModal());
    this.modal.numeros = filas.map(f => (f.hecho ? () => {} : f.accion));
  }

  comprarTienda(p) {
    if (!this.pagar(p.precio)) return;
    if (p.id === 'papel' || p.id === 'mechero') {
      if (p.id === 'papel') ESTADO.inv.papel++;
      else ESTADO.inv.mechero = true;
      guardarPartida();
      sfx(this, p.id === 'papel' ? 'papel' : 'mechero');
      this.refrescarHud();
      this.cerrarModal();
      this.tienda();
      return;
    }
    this.cerrarModal();
    this.comer(p);
  }

  // Comer o beber en el momento, con su animación (también lo usan los regalos).
  comer(p) {
    ESTADO.hambre = Math.max(0, ESTADO.hambre - (p.hambre || 0));
    ESTADO.vida = Math.min(100, ESTADO.vida + (p.vida || 0));
    ESTADO.colocon = Math.max(0, ESTADO.colocon + (p.colocon || 0));
    sumarStat('comidas');
    this.comiendo = 1.4;
    const comida = this.add.image(this.px + this.dir * 40, this.py - 120, p.sprite).setScale(0.25).setDepth(this.py + 1);
    this.tweens.add({ targets: comida, scale: 0.05, x: this.px, y: this.py - 90, duration: 900, ease: 'Sine.in', onComplete: () => comida.destroy() });
    sfx(this, p.id === 'lata' ? 'sorbo' : 'nam');
    if (p.id !== 'lata') this.time.delayedCall(450, () => sfx(this, 'nam', { volume: 0.7 }));
    const migas = this.add.particles(this.px, this.py - 100, 'miga', {
      speed: { min: 80, max: 220 }, angle: { min: 200, max: 340 }, gravityY: 700, lifespan: 600,
      tint: p.id === 'lata' ? [0xb68cff, 0xffffff] : [0xf5d23a, 0xffd23f, 0xff8fc0], emitting: false,
    }).setDepth(this.py + 2);
    migas.explode(18);
    this.time.delayedCall(800, () => migas.destroy());
    golpeTexto(this, this.px, this.py - 330, p.id === 'lata' ? `¡Glu, glu! Vida +${p.vida}` : `¡Ñam! Hambre −${p.hambre}`, COLOR.amarillo, 36);
  }

  // Palicaso en la barra: «lo de la aso» (la bolsita) y charla.
  barra(c) {
    const humo = this.mundo === 'humo';
    const pedir = () => {
      if (!this.pagar(PRECIO_BOLSITA)) return;
      ESTADO.inv.bolsita++;
      guardarPartida();
      this.refrescarHud();
      sfx(this, 'campanita');
      this.cerrarModal();
      golpeTexto(this, ANCHO / 2, 600, '¡La bolsita! Ahora al sofá.', COLOR.verde, 36);
    };
    this.abrirModal(m => {
      const img = this.add.image(-290, -20, humo ? 'palicaso' : 'n-palicaso');
      img.setScale(240 / Math.max(img.width, img.height));
      flotar(this, img, { amplitud: 6 });
      m.add(img);
      m.add(texto(this, 100, -180, 'La barra de Unaké', 40, COLOR.amarillo));
      m.add(this.add.text(100, -80, humo ? '«¡Escucha, escucha! ¿Lo de siempre? La cuota de la aso y te pongo lo tuyo en una bolsita.»' : '«¡Buenos días! Aquí de día es un café… pero para los de la aso, lo de siempre.»', {
        fontFamily: FUENTE, fontSize: '22px', color: COLOR.crema, align: 'center', wordWrap: { width: 500 },
      }).setOrigin(0.5));
      m.add(texto(this, 100, 20, `Llevas ${ESTADO.inv.bolsita} bolsita${ESTADO.inv.bolsita === 1 ? '' : 's'} · ${ESTADO.monchis} monchis`, 20, COLOR.azul));
      m.add(boton(this, -60, 150, `La bolsita · ${PRECIO_BOLSITA} monchis (E)`, pedir, { ancho: 380, tam: 22 }));
      m.add(boton(this, 260, 150, 'Ahora no (Esc)', () => this.cerrarModal(), { ancho: 220, tam: 22, color: HEX.crema }));
    }, () => this.cerrarModal(), pedir);
  }

  // El sofá de Unaké: si llevas todo, a liar; si no, qué falta y dónde se consigue.
  sofa() {
    const inv = ESTADO.inv;
    const b = ESTADO.boquillaEn;
    const filas = [
      { k: 'papel', nombre: 'Papel de liar', tengo: inv.papel > 0, donde: 'En la tienda de 24 h' },
      { k: 'boquilla', nombre: 'Boquilla', tengo: inv.boquilla > 0, donde: b ? `Brilla en: ${SALAS[b.sala].nombre}` : 'Brilla en algún sitio del barrio' },
      { k: 'bolsita', nombre: 'La bolsita', tengo: inv.bolsita > 0, donde: negocio().bolsitas >= 1 ? 'Tu máquina tiene: recógela en el negocio' : 'Pídesela a Palicaso en la barra' },
      { k: 'mechero', nombre: 'Mechero', tengo: inv.mechero, donde: 'En la tienda de 24 h' },
    ];
    const todo = filas.every(f => f.tengo);
    const liar = () => {
      if (!todo) return this.cerrarModal();
      inv.papel--; inv.boquilla--; inv.bolsita--;
      if (!inv.boquilla) this.esconderBoquilla();
      guardarPartida();
      this.lanzar('Liar', { mundo: this.mundo });
    };
    this.abrirModal(c => {
      c.add(texto(this, 0, -205, todo ? '¡Lo tienes todo!' : 'Para liar te falta…', 40, COLOR.amarillo));
      filas.forEach((f, i) => {
        const y = -120 + i * 72;
        const img = this.add.image(-330, y, `obj-${f.k}`).setAlpha(f.tengo ? 1 : 0.35);
        img.setScale(56 / Math.max(img.width, img.height));
        c.add(img);
        c.add(this.add.text(-280, y - 24, f.nombre, { fontFamily: FUENTE, fontSize: '24px', color: COLOR.crema }));
        c.add(this.add.text(-280, y + 6, f.donde, { fontFamily: FUENTE, fontSize: '17px', color: COLOR.azul }));
        c.add(texto(this, 300, y, f.tengo ? 'Lo tienes' : 'Falta', 24, f.tengo ? COLOR.verde : COLOR.rosa));
      });
      if (todo) c.add(boton(this, -150, 200, '¡A liar! (E)', liar, { ancho: 280, tam: 28, color: HEX.verde }));
      c.add(boton(this, todo ? 170 : 0, 200, 'Cerrar (Esc)', () => this.cerrarModal(), { ancho: 240, alto: 60, tam: 22, color: HEX.crema }));
    }, () => this.cerrarModal(), liar);
  }

  // ---------- Encargos de rider ----------

  empezarReparto(racha) {
    const posibles = DESTINOS.filter(d => d.sala !== this.sala && (ESTADO.dentro || d.sala === 'plaza' || d.sala === 'fuera' || racha > 0));
    const destino = Phaser.Utils.Array.GetRandom(posibles.length ? posibles : DESTINOS);
    const pedido = Phaser.Utils.Array.GetRandom(PEDIDOS);
    const total = 30 - Math.min(racha * 1.5, 12) + (tiene('mochila') ? 10 : 0);
    this.reparto = { destino, pedido, racha, total, restante: total };
    this.iconoPedido.setTexture(pedido.clave).setScale(56 / this.textures.get(pedido.clave).getSourceImage().height);
    const quien = destino.id === 'pompa' ? 'la Pompa' : destino.id.charAt(0).toUpperCase() + destino.id.slice(1);
    this.textoPedido.setText(`Lleva ${pedido.nombre} a ${quien}${racha ? `  ·  racha x${racha + 1}` : ''}  ·  Esc: dejarlo`);
    this.panelReparto.setVisible(true);
    sfx(this, 'campanita', { volume: 0.5 });
  }

  comprobarEntrega() {
    const d = this.reparto.destino;
    if (d.sala !== this.sala) return;
    const c = this.cosas.find(x => x.id === d.id);
    if (!c || Math.abs(c.x - this.px) > 160 || Math.abs(Math.max(c.y, SALAS[this.sala].suelo[0]) - this.py) > 320) return;
    const r = this.reparto;
    const racha = r.racha + 1;
    const pago = Math.round((4 + Math.floor(r.restante / 3)) * (1 + Math.min(r.racha, 4) * 0.2));
    sumarStat('entregas');
    this.reparto = null;
    const res = apuntar('Reparto', racha, pago);
    this.refrescarHud();
    sfx(this, 'campanita');
    sfx(this, 'lata', { volume: 0.5 });
    if (c.img) this.tweens.add({ targets: c.img, y: c.img.y - 24, duration: 140, yoyo: true, repeat: 1 });
    this.charla(c, Phaser.Utils.Array.GetRandom(['¡Gracias, rider!', '¡Por fin!', 'Justo lo que necesitaba.', '¿Y la propina? …Era broma.']));
    golpeTexto(this, this.px, this.py - 200, `+${pago} monchis`, COLOR.amarillo, 44);
    if (res.estrellasNuevas) this.time.delayedCall(500, () => golpeTexto(this, ANCHO / 2, 260, '¡Estrella nueva!', COLOR.verde, 56));
    this.time.delayedCall(900, () => { if (!this.cambiando) this.empezarReparto(racha); });
  }

  // Esc durante un encargo: se cierra la racha (lo cobrado, cobrado está).
  dejarRacha() {
    const racha = this.reparto.racha;
    this.reparto = null;
    this.panelReparto.setVisible(false);
    sfx(this, 'rimshot', { volume: 0.5 });
    golpeTexto(this, ANCHO / 2, 300, racha ? `Racha cerrada: ${racha} entrega${racha > 1 ? 's' : ''}` : 'Encargo dejado', COLOR.crema, 44);
  }

  repartoFallido() {
    const racha = this.reparto.racha;
    this.reparto = null;
    this.panelReparto.setVisible(false);
    sfx(this, 'oooh', { volume: 0.6 });
    golpeTexto(this, ANCHO / 2, 300, '¡Se ha enfriado!', COLOR.rosa, 60);
    this.time.delayedCall(900, () => golpeTexto(this, ANCHO / 2, 380,
      racha ? `Racha de ${racha} entrega${racha > 1 ? 's' : ''} · récord ${leerRecord('Reparto')}` : 'Vuelve a la tienda a por otro encargo', COLOR.crema, 32));
  }
}

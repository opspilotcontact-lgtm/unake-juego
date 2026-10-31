// En su punto (la Pompa, caps. 3 y 14): la Pompa llega POR ENCIMA de su punto, hinchada, temblando, a una brisa de
// reventar. Hay que devolverla a su punto (dos aros verdes) y mantenerla ahí mientras el bar sopla:
//   · ESPACIO (mantén) = tu mano de nube le deja escapar aire; al soltar, el tamaño se queda quieto.
//   · ← → / A D = apartarla de las rachas (y de los alfileres de las paredes, y de las bocanadas).
// Los empujones de fuera la suben solos: las risas de Lasslow (picos pequeños), las rachas de la gente
// (la empujan de lado, niveles 2-3) y las rondas de Palicaso (bocanadas de humo que flotan hacia ella, nivel 3).
// Ganas si aguantas ≈45 s acumulados dentro de su punto. Pierdes con un plop (se pasa o toca un alfiler)
// o con un pffff (se queda sin aire). Niveles de la escalera: 1, 2 y 3 como en la ficha; del 4.º en adelante,
// el 3.º con más dureza. Con datos.nerviosa (cap. 14) su punto se mueve solo.

MISIONES.EnSuPunto = {
  nombre: 'En su punto', sprite: 'pompa', umbrales: [650, 1100, 1550],
  texto: 'La Pompa viene hinchada, a una brisa de reventar. Mantén ESPACIO para soltarle aire y llévala a su punto (los aros verdes). Que ni se desinfle ni explote; ← → para apartarla de las rachas.',
};
if (typeof MUSICA_ESCENA !== 'undefined') MUSICA_ESCENA.EnSuPunto = 'minijuego';
if (typeof CORTINA_DE !== 'undefined') CORTINA_DE.EnSuPunto = 'burbuja';
if (typeof REACCION_PIERDE !== 'undefined' && typeof UNAKE !== 'undefined') REACCION_PIERDE.EnSuPunto = ['pompa-horror', UNAKE.cian];

// Lo que cambia por nivel. mitad = media anchura de su punto (sobre 0-1 de tamaño); deriva = lo que sube sola por segundo.
const ESP_NIVELES = {
  1: { centro: 0.5, mitad: 0.13, deriva: 0.012, objetivo: 40, risa: [3.8, 5.6], dRisa: 0.045, gente: false, cactus: false, ronda: false },
  2: { centro: 0.5, mitad: 0.095, deriva: 0.018, objetivo: 45, risa: [3.4, 5.0], dRisa: 0.055, gente: true, cactus: true, ronda: false, fuerza: 190, dura: 1.3, cada: [6.5, 9] },
  3: { centro: 0.46, mitad: 0.07, deriva: 0.024, objetivo: 50, risa: [3.0, 4.4], dRisa: 0.065, gente: true, cactus: true, ronda: true, fuerza: 240, dura: 1.4, cada: [5.5, 7.5], doble: 0.4 },
};
const ESP_FRASES = {
  empieza: '…Un poco menos. No tanto. Un poquito menos que ese poquito.',
  entra: 'Ahí. …No, ahí era antes.',
  risa: 'Siento un cosquilleo. Creo que es una risa. De otro.',
  tiembla: 'Si me ves temblar, no es la música.',
  brisa: 'Esa brisa ya me la habías prometido hace un rato.',
  alfileres: 'Alfileres a la izquierda. Lo digo ya, que luego se me pasa.',
  punto: 'Mi punto. Qué casa tan pequeña y tan mía.',
  salvada: 'Plop… no. Todavía no. Gracias.',
};
const ESP_GRITOS = ['¡Ronda para todos!', '¡Esta la invito yo!', '¡Escucha, escucha: ronda!'];
const ESP_X0 = 640, ESP_Y0 = 372; // dónde flota la Pompa
const ESP_G = { x: 1195, arriba: 112, abajo: 500 }; // el medidor vertical

class EnSuPunto extends Phaser.Scene {
  constructor() { super('EnSuPunto'); }

  create(datos) {
    // Todo flag de partida se resetea aquí: scene.start reutiliza la instancia.
    this.fase = 'inicio';
    this.t = 0;
    this.nivelJuego = nivelDe('EnSuPunto');
    const base = ESP_NIVELES[Math.min(this.nivelJuego, 3)];
    const extra = Math.max(0, this.nivelJuego - 3);
    this.P = { ...base, deriva: base.deriva + extra * 0.002, mitad: Math.max(0.05, base.mitad - extra * 0.004), objetivo: base.objetivo + extra * 2 };
    this.nerviosa = !!(datos && datos.nerviosa);
    this.c = this.P.centro;
    this.w = this.P.mitad;
    this.s = Math.min(0.92, this.c + this.w + 0.2); // arranca por encima de su punto
    this.cola = 0; // empujones pendientes (se aplican suaves)
    this.px = ESP_X0; this.py = ESP_Y0; this.vxIn = 0;
    this.aireV = 0;
    this.tBanda = 0; this.racha = 0; this.puntos = 0; this.fuera = 0; this.dentroAntes = false; this.estuvo = false; this.maxS = 0;
    this.gust = null; this.gustCola = null; this.bocanadas = []; this.streaks = [];
    this.tRisa = 3; this.tGust = 7.5; this.tRonda = 11; this.soploFinal = false;
    this.dichas = {}; this.proxHabla = 0; this.hablando = false; this.tLatido = 0; this.tTension = 0; this.tAireFx = 0; this.sAire = null;
    this.limiteVisto = false; this.quitoLasslow = 0;
    this.tIzq = false; this.tDer = false; this.tAire = false; this.tomados = {};
    this.angGrietas = Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.25, 0.25));

    this.tactil = MOVIL || (typeof Tactil !== 'undefined' && Tactil.activo);
    const humo = enMundoHumo();
    fondo(this, humo ? 'bg-dentro' : 'bgn-dentro').setDepth(0);
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.5).setDepth(1);
    this.luzG = this.add.graphics().setDepth(2); // el halo de alarma

    this.crearParedes();
    this.crearPersonajes();

    // La Pompa y sus aros.
    this.aros = this.add.graphics().setDepth(12);
    this.grietas = this.add.graphics().setDepth(11);
    this.pompa = this.add.image(this.px, this.py, 'pompa').setDepth(10);
    this.W = this.anchoDe(this.s);
    this.pompa.setScale(this.W / this.pompa.width);

    // HUD.
    this.hudG = this.add.graphics().setDepth(40);
    this.medidorG = this.add.graphics().setDepth(41);
    this.textoPuntos = texto(this, 150, 34, '0 puntos', 28, COLOR.amarillo).setDepth(50);
    this.textoRacha = texto(this, 150, 76, '', 22, COLOR.verde).setDepth(50);
    this.textoTiempo = texto(this, ANCHO / 2, 34, '', 22, COLOR.crema).setDepth(50);
    this.etPlop = texto(this, ESP_G.x, ESP_G.arriba - 26, 'PLOP', 20, COLOR.rojo).setDepth(50);
    this.etPffff = texto(this, ESP_G.x, ESP_G.abajo + 26, 'pffff', 20, COLOR.azul).setDepth(50);
    this.marcador = this.add.triangle(ESP_G.x - 30, ESP_G.abajo, 0, -14, 0, 14, 24, 0, HEX.crema).setStrokeStyle(4, HEX.tinta).setDepth(52);
    this.pintarMedidor();
    this.hint = texto(this, ANCHO / 2, 676, this.tactil ? 'Mantén el botón de aire · flechas: apártala' : 'Mantén ESPACIO: suelta aire  ·  ← →: apártala', 24, COLOR.crema, 900).setDepth(50).setAlpha(0);

    this.crearMandos();
    this.crearTeclas();
    this.crearBurbuja();
    this.mostrarEstado(true);
    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 450, () => this.tarjetaInicio());
  }

  // ---------- Montaje ----------
  anchoDe(s) { return 150 + 190 * s; }

  crearParedes() {
    this.paredes = null;
    if (!this.P.cactus) return;
    // Dos tiras con alfileres hacia dentro: tocarlos = plop.
    const g = this.add.graphics().setDepth(5);
    const L = 205, R = 1075, y0 = 118, y1 = 560;
    g.fillStyle(0x3a2a4c, 1).lineStyle(5, HEX.tinta, 1);
    g.fillRect(L - 34, y0, 34, y1 - y0).strokeRect(L - 34, y0, 34, y1 - y0);
    g.fillRect(R, y0, 34, y1 - y0).strokeRect(R, y0, 34, y1 - y0);
    for (let y = y0 + 14; y < y1 - 10; y += 30) {
      g.fillStyle(0xe9e4f2, 1).lineStyle(4, HEX.tinta, 1);
      g.fillTriangle(L, y - 11, L, y + 11, L + 30, y).strokeTriangle(L, y - 11, L, y + 11, L + 30, y);
      g.fillTriangle(R, y - 11, R, y + 11, R - 30, y).strokeTriangle(R, y - 11, R, y + 11, R - 30, y);
      g.fillStyle(0xff5a4f, 1).fillCircle(L + 30, y, 4).fillCircle(R - 30, y, 4);
    }
    this.paredes = { izq: L + 30, der: R - 30 };
  }

  crearPersonajes() {
    const quien = (k, x, h) => {
      const clave = [].concat(k).find(c => this.textures.exists(c));
      if (!clave) return null;
      const o = this.add.image(x, 712, clave).setOrigin(0.5, 1).setDepth(4);
      o.setScale(h / o.height); o.h = h; o.x0 = x;
      return o;
    };
    this.lasslow = quien(['lasslow-digno', 'lasslow'], 600, 185);
    this.lasslow.base = 'lasslow-digno';
    if (this.P.gente) {
      this.gIzq = quien(['blancaso', 'blancaso-mareado'], 400, 150);
      this.gDer = quien(['perico-cotilleando'], 1030, 150);
    }
    if (this.P.ronda) this.palicaso = quien(['palicaso'], 880, 190);
    [this.lasslow, this.gIzq, this.gDer, this.palicaso].forEach((o, i) => { if (o) this.tweens.add({ targets: o, y: o.y - 5, duration: 1200 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.inOut' }); });
  }

  crearTeclas() {
    this.k = this.input.keyboard.addKeys({ izq: 'LEFT', der: 'RIGHT', a: 'A', d: 'D', esp: 'SPACE' });
    this.input.keyboard.on('keydown-SPACE', e => { if (this.fase === 'inicio' && this.tarjeta && !e.repeat) this.empezar(); });
    this.input.keyboard.on('keydown-ENTER', () => { if (this.fase === 'inicio' && this.tarjeta) this.empezar(); });
  }

  // Mandos en pantalla (móvil): dos flechas a la izquierda y el botón gordo de aire a la derecha.
  crearMandos() {
    this.mandos = [];
    while (this.input.manager.pointersTotal < 4) this.input.addPointer(1);
    this.input.on('pointerup', p => this.soltarPuntero(p));
    this.input.on('gameout', () => { this.tomados = {}; this.tIzq = this.tDer = this.tAire = false; });
    if (!this.tactil) return;
    const mk = (nombre, x, y, r, color, dib) => {
      const c = this.add.container(x, y).setDepth(60);
      const g = this.add.graphics();
      g.fillStyle(color, 0.62).fillCircle(0, 0, r).lineStyle(6, HEX.tinta, 0.9).strokeCircle(0, 0, r);
      c.add(g);
      dib(c, g);
      const z = this.add.circle(x, y, r + 14, 0xffffff, 0.001).setDepth(61).setInteractive();
      z.on('pointerdown', p => { this.tomados[nombre] = p.id; this.fijarMando(nombre, true); c.setScale(0.92); });
      z.on('pointerout', p => { if (this.tomados[nombre] === p.id) this.soltarPuntero(p); });
      this.mandos.push(c, z);
      c.nombre = nombre;
      return c;
    };
    const flecha = dir => (c, g) => {
      g.fillStyle(HEX.crema, 1).lineStyle(5, HEX.tinta, 1);
      g.fillTriangle(-dir * 24, 0, dir * 18, -28, dir * 18, 28).strokeTriangle(-dir * 24, 0, dir * 18, -28, dir * 18, 28);
    };
    mk('izq', 95, 628, 62, HEX.rosa, flecha(1));
    mk('der', 240, 628, 62, HEX.azul, flecha(-1));
    mk('aire', 1105, 612, 84, HEX.amarillo, c => c.add(texto(this, 0, 0, 'SOLTAR\nAIRE', 26, COLOR.tinta)));
    this.cAire = this.mandos.find(m => m.nombre === 'aire');
    this.mandos.forEach(m => m.setVisible(false)); // aparecen al empezar
  }

  fijarMando(nombre, v) {
    if (nombre === 'izq') this.tIzq = v; else if (nombre === 'der') this.tDer = v; else if (nombre === 'aire') this.tAire = v;
  }

  soltarPuntero(p) {
    Object.keys(this.tomados).forEach(n => {
      if (this.tomados[n] === p.id) {
        delete this.tomados[n];
        this.fijarMando(n, false);
        const c = this.mandos.find(m => m.nombre === n);
        if (c) c.setScale(1);
      }
    });
  }

  // ---------- Tarjeta de inicio ----------
  tarjetaInicio() {
    if (this.fase !== 'inicio' || !this.sys.isActive()) return;
    const c = this.add.container(ANCHO / 2, ALTO / 2).setDepth(700).setScale(0);
    const g = this.add.graphics();
    g.fillStyle(HEX.morado, 1).fillRoundedRect(-380, -250, 760, 500, 34).lineStyle(8, HEX.tinta, 1).strokeRoundedRect(-380, -250, 760, 500, 34);
    c.add(g);
    c.add(texto(this, 0, -200, 'En su punto', 56, COLOR.amarillo, 700));
    c.add(texto(this, 0, -125, 'Llega a una brisa de reventar.\nLlévala a su punto, ni más ni menos.', 26, COLOR.crema, 700));
    // El dibujo en pequeño de la idea: aro verde y la flecha.
    const ico = this.add.graphics();
    ico.lineStyle(7, 0x7ee081, 1).strokeEllipse(0, -22, 130, 108).lineStyle(5, 0x7ee081, 0.7).strokeEllipse(0, -22, 90, 74);
    ico.lineStyle(6, HEX.tinta, 1).fillStyle(HEX.rosa, 1).fillEllipse(-170, -22, 150, 124).strokeEllipse(-170, -22, 150, 124);
    ico.fillStyle(HEX.crema, 1).fillTriangle(-80, -22, -105, -40, -105, -4);
    c.add(ico);
    c.add(texto(this, 0, 40, this.tactil ? 'Botón: suelta aire. Flechas: apártala.'
      : 'ESPACIO: suelta aire.  ← →: apártala.', 24, COLOR.azul, 700));
    c.add(estrellas(this, 0, 98, ESTADO.estrellas.EnSuPunto || 0, 24));
    c.add(texto(this, 0, 148, `Nivel ${this.nivelJuego}: aguanta ${this.P.objetivo} s`, 24, COLOR.crema, 700));
    c.add(boton(this, 0, 208, '¡Vamos! (Espacio)', () => this.empezar(), { ancho: 360, alto: 64, tam: 28 }));
    this.tweens.add({ targets: c, scale: ESCALA_UI, duration: 380, ease: 'Back.out' });
    this.tarjeta = c;
  }

  empezar() {
    if (this.fase !== 'inicio' || !this.tarjeta) return;
    const c = this.tarjeta;
    this.tarjeta = null;
    this.tweens.add({ targets: c, scale: 0, duration: 200, ease: 'Back.in', onComplete: () => c.destroy() });
    this.fase = 'juego';
    this.mandos.forEach(m => m.setVisible(true));
    this.tweens.add({ targets: this.hint, alpha: 1, duration: 300 });
    this.time.delayedCall(6500, () => { if (this.hint && this.hint.active) this.tweens.add({ targets: this.hint, alpha: 0, duration: 500 }); });
    this.time.delayedCall(1200, () => this.decir('empieza', ESP_FRASES.empieza));
  }

  // ---------- Habla de la Pompa (siempre tarde, siempre calma) ----------
  crearBurbuja() {
    const c = this.add.container(ANCHO / 2, 118).setDepth(55).setAlpha(0);
    this.bFondo = this.add.graphics();
    this.bTexto = this.add.text(0, 0, '', { fontFamily: FUENTE, fontSize: `${MOVIL ? 28 : 26}px`, color: COLOR.tinta, align: 'center', wordWrap: { width: 720 } }).setOrigin(0.5);
    c.add([this.bFondo, this.bTexto]);
    this.burbuja = c;
  }

  decir(id, txt, repetible = false) {
    if (this.fase !== 'juego' || this.hablando || this.t < this.proxHabla) return false;
    if (!repetible && this.dichas[id]) return false;
    this.dichas[id] = true;
    this.hablando = true;
    this.bTexto.setText(txt);
    const w = Math.min(780, this.bTexto.width + 56), h = this.bTexto.height + 28;
    this.bFondo.clear().fillStyle(0xffffff, 1).lineStyle(5, HEX.tinta, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 22).strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    this.bFondo.fillTriangle(-20, h / 2 - 2, 20, h / 2 - 2, 0, h / 2 + 24).lineBetween(-20, h / 2 + 1, 0, h / 2 + 24).lineBetween(20, h / 2 + 1, 0, h / 2 + 24);
    this.burbuja.setAlpha(1).setScale(0.8);
    this.tweens.add({ targets: this.burbuja, scale: 1, duration: 180, ease: 'Back.out' });
    this.time.delayedCall(Math.max(2600, txt.length * 55), () => {
      this.tweens.add({ targets: this.burbuja, alpha: 0, duration: 300, onComplete: () => { this.hablando = false; this.proxHabla = this.t + 2.5; } });
    });
    return true;
  }

  // ---------- Bucle ----------
  update(_tt, delta) {
    if (!this.sys.isActive()) return;
    const dt = Math.min(delta, 50) / 1000;
    if (this.fase === 'inicio') { this.t += dt; this.mostrarEstado(false); return; }
    if (this.fase !== 'juego') { this.mostrarEstado(false); return; }
    this.t += dt;
    const k = this.k;
    const eje = ((k.der.isDown || k.d.isDown || this.tDer) ? 1 : 0) - ((k.izq.isDown || k.a.isDown || this.tIzq) ? 1 : 0);
    const aire = k.esp.isDown || this.tAire;

    // Tu mano de nube: sube y baja despacio (no es un interruptor).
    this.aireV = Phaser.Math.Clamp(this.aireV + (aire ? 1 : -1) * dt * 9, 0, 1);
    this.sonidoAire(aire);
    if (this.aireV > 0.2) this.chorritoAire(dt);

    // El tamaño: lo que escapa, lo que sube sola y los empujones que van llegando.
    const entra = Math.min(this.cola, 0.5 * dt);
    this.cola -= entra;
    this.s += -0.2 * this.aireV * dt + this.P.deriva * dt + entra;
    this.s = Math.min(this.s, 1);
    this.maxS = Math.max(this.maxS, this.s);
    if (this.nerviosa) this.c = this.P.centro + 0.12 * Math.sin(this.t * 0.45);

    this.moverPompa(eje, dt);
    this.eventos(dt);
    this.puntuar(dt);
    this.avisos(dt);
    this.mostrarEstado(false);
    this.pintarMedidor();
    this.textoTiempo.setText(`En su punto: ${Math.floor(this.tBanda)} / ${this.P.objetivo} s`);

    if (this.s >= 1) return this.plop('tamano');
    if (this.s <= 0.015) return this.pffff();
    if (this.paredes) {
      const mitad = this.W / 2 * 0.8;
      if (this.px - mitad < this.paredes.izq || this.px + mitad > this.paredes.der) return this.plop('alfiler');
    }
    if (this.tBanda >= this.P.objetivo) return this.ganar();
  }

  moverPompa(eje, dt) {
    const objetivo = eje * 330;
    this.vxIn += Phaser.Math.Clamp(objetivo - this.vxIn, -2400 * dt, 2400 * dt);
    const g = this.gust && this.gust.activa ? this.gust.dir * this.gust.fuerza : 0;
    this.px += (this.vxIn + g) * dt;
    const mitad = this.W / 2 * 0.8;
    if (!this.paredes) this.px = Phaser.Math.Clamp(this.px, 250 + mitad, 1030 - mitad); // sin alfileres, una pared blanda
    this.py = ESP_Y0 + Math.sin(this.t * 1.5) * 7;
  }

  puntuar(dt) {
    const dentro = this.s >= this.c - this.w && this.s <= this.c + this.w;
    if (dentro) {
      this.tBanda += dt;
      this.racha += dt;
      const mult = 1 + Math.min(2, Math.floor(this.racha / 5) * 0.5);
      this.puntos += 15 * mult * dt;
      if (!this.dentroAntes) {
        this.estuvo = true;
        sfx(this, 'campanita', { volume: 0.25 });
        this.decir('entra', ESP_FRASES.entra);
      }
      if (this.racha > 6) this.decir('punto', ESP_FRASES.punto);
    } else {
      if (this.dentroAntes && this.racha > 1.5) golpeTexto(this, this.px, this.py - 170, 'Se ha ido…', COLOR.rosa, 28);
      this.racha = 0;
      if (this.estuvo) this.fuera += dt;
    }
    this.dentroAntes = dentro;
    this.dentro = dentro;
    const mult = 1 + Math.min(2, Math.floor(this.racha / 5) * 0.5);
    this.textoPuntos.setText(`${Math.round(this.puntos)} puntos`);
    this.textoRacha.setText(this.racha >= 5 ? `Seguida x${mult}` : '');
  }

  // Frases y aviso sonoro de la tensión.
  avisos(dt) {
    const sobre = this.s - (this.c + this.w);
    const peligro = Phaser.Math.Clamp(sobre / (1 - (this.c + this.w)), 0, 1);
    this.peligro = peligro;
    if (peligro > 0.35) this.decir('tiembla', ESP_FRASES.tiembla);
    if (peligro > 0.8) {
      if (!this.limiteVisto) { this.limiteVisto = true; this.enfasis('tension'); }
    } else if (this.limiteVisto && peligro < 0.5) {
      this.limiteVisto = false;
      this.decir('salvada', ESP_FRASES.salvada, true);
    }
    if (this.paredes && (this.px - this.W / 2 * 0.8 < this.paredes.izq + 70)) this.decir('alfileres', ESP_FRASES.alfileres);
    // Latido: más rápido y fuerte cuanto más cerca del plop.
    if (peligro > 0.12) {
      this.tLatido -= dt;
      if (this.tLatido <= 0) {
        this.tLatido = 0.75 - 0.5 * peligro;
        sfx(this, 'latido', { volume: 0.12 + 0.4 * peligro });
      }
    }
  }

  enfasis(tipo) {
    if (typeof Comic === 'undefined' || !Comic.enfasis || this.t < this.tTension) return;
    this.tTension = this.t + 6;
    try { Comic.enfasis(this, tipo, { x: this.px, y: this.py - 150, profundidad: 70 }); } catch (e) { /* el efecto es un extra */ }
  }

  // ---------- Los empujones de fuera ----------
  eventos(dt) {
    const P = this.P;
    // Risa de Lasslow: se le nota antes de que llegue.
    this.tRisa -= dt;
    if (this.tRisa <= 0) {
      this.tRisa = Phaser.Math.FloatBetween(P.risa[0], P.risa[1]);
      this.risaLasslow();
    }
    if (P.gente) {
      this.tGust -= dt;
      if (this.tGust <= 0 && !this.gust) {
        this.tGust = Phaser.Math.FloatBetween(P.cada[0], P.cada[1]);
        const dir = Phaser.Math.Between(0, 1) ? 1 : -1;
        this.lanzarRacha(dir, P.fuerza, P.dura);
        if (P.doble && Math.random() < P.doble) this.gustCola = { en: P.dura + 1.0, dir: -dir };
      }
    }
    if (this.gust) this.rachaViva(dt);
    if (this.gustCola && !this.gust) {
      this.gustCola.en -= dt;
      if (this.gustCola.en <= 0) { const d = this.gustCola.dir; this.gustCola = null; this.lanzarRacha(d, P.fuerza * 1.05, P.dura * 0.9); }
    }
    if (P.ronda) {
      this.tRonda -= dt;
      if (this.tRonda <= 0) { this.tRonda = Phaser.Math.FloatBetween(8, 10.5); this.rondaPalicaso(); }
      // El soplo gordo del final.
      if (!this.soploFinal && this.tBanda >= P.objetivo - 8) {
        this.soploFinal = true;
        this.lanzarRacha(Phaser.Math.Between(0, 1) ? 1 : -1, P.fuerza * 1.25, 1.5, true);
        this.time.delayedCall(900, () => { if (this.fase === 'juego') this.cola += 0.09; });
      }
    }
    this.moverBocanadas(dt);
    this.moverStreaks(dt);
  }

  risaLasslow() {
    const l = this.lasslow;
    if (!l) return;
    sfx(this, 'risa-lasslow', { volume: 0.3 });
    if (this.textures.exists('lasslow-risa-floja')) l.setTexture('lasslow-risa-floja').setScale(l.h / l.height);
    this.tweens.add({ targets: l, x: l.x0 + 6, duration: 55, yoyo: true, repeat: 8 });
    this.decir('risa', ESP_FRASES.risa);
    const ja = texto(this, l.x, l.y - l.h, 'JA', 40, COLOR.amarillo).setDepth(30).setAngle(-8);
    // Va de Lasslow a la Pompa y, al llegar, le mete un empujón.
    this.tweens.add({
      targets: ja, x: this.px, y: this.py, scale: 1.4, angle: 10, duration: 650, delay: 350, ease: 'Sine.in',
      onComplete: () => { ja.destroy(); if (this.fase === 'juego') { this.cola += this.P.dRisa * Phaser.Math.FloatBetween(0.85, 1.2); this.pompaSacude(); } },
    });
    this.time.delayedCall(1500, () => { if (l.active && this.textures.exists(l.base)) l.setTexture(l.base).setScale(l.h / l.height); });
  }

  pompaSacude() {
    sfx(this, 'pop', { volume: 0.25 });
    this.tweens.add({ targets: this, pulso: 0.12, duration: 90, yoyo: true });
  }

  // Racha lateral de la gente: aviso (soplan los mofletes), luego empuja.
  lanzarRacha(dir, fuerza, dura, gorda = false) {
    this.gust = { dir, fuerza, dura, aviso: 0.9, activa: false, t: 0, gorda };
    const quien = dir > 0 ? this.gIzq : this.gDer; // el viento viene del lado contrario al empuje
    this.gust.quien = quien;
    if (quien) this.tweens.add({ targets: quien, scaleX: quien.scaleX * 1.22, scaleY: quien.scaleY * 1.22, duration: 160, yoyo: true, repeat: 4 });
    this.decir('brisa', ESP_FRASES.brisa);
    sfx(this, 'fiu', { volume: 0.3 });
    // Chevrones del lado por el que viene.
    const x = dir > 0 ? 330 : 950;
    const txt = texto(this, x, 300, dir > 0 ? '>>>' : '<<<', gorda ? 80 : 56, COLOR.crema).setDepth(45).setAlpha(0);
    this.tweens.add({ targets: txt, alpha: 0.9, duration: 150, yoyo: true, repeat: 2, onComplete: () => txt.destroy() });
    this.gust.aviso_txt = txt;
  }

  rachaViva(dt) {
    const g = this.gust;
    if (g.aviso > 0) {
      g.aviso -= dt;
      if (g.aviso <= 0) { g.activa = true; sfx(this, 'whoosh', { volume: g.gorda ? 0.6 : 0.4 }); }
      return;
    }
    g.t += dt;
    if (Math.random() < 0.9) this.nuevoStreak(g.dir);
    if (g.t >= g.dura) this.gust = null;
  }

  nuevoStreak(dir) {
    const y = Phaser.Math.Between(150, 540);
    const l = Phaser.Math.Between(70, 170);
    const g = this.add.rectangle(dir > 0 ? 150 : 1130, y, l, 4, 0xffffff, 0.55).setDepth(13);
    this.streaks.push({ o: g, v: dir * Phaser.Math.Between(900, 1300), vida: 1.2 });
  }

  moverStreaks(dt) {
    this.streaks = this.streaks.filter(s => {
      s.vida -= dt;
      s.o.x += s.v * dt;
      s.o.alpha = Math.min(0.55, s.vida);
      if (s.vida <= 0) { s.o.destroy(); return false; }
      return true;
    });
  }

  // Palicaso invita: bocanadas de humo que flotan hacia ella.
  rondaPalicaso() {
    const p = this.palicaso;
    if (!p) return;
    const n = Math.random() < 0.4 ? 2 : 1;
    const grito = texto(this, p.x, p.y - p.h - 14, Phaser.Utils.Array.GetRandom(ESP_GRITOS), 24, COLOR.amarillo, 320).setDepth(45).setAlpha(0);
    this.tweens.add({ targets: grito, alpha: 1, duration: 150 });
    this.tweens.add({ targets: grito, alpha: 0, duration: 300, delay: 1500, onComplete: () => grito.destroy() });
    if (this.textures.exists('palicaso-riendo')) { p.setTexture('palicaso-riendo').setScale(p.h / p.height); this.time.delayedCall(1800, () => { if (p.active) p.setTexture('palicaso').setScale(p.h / p.height); }); }
    for (let i = 0; i < n; i++) this.time.delayedCall(700 + i * 800, () => { if (this.fase === 'juego') this.bocanada(p.x - 20, p.y - p.h * 0.6); });
  }

  bocanada(x, y) {
    const c = this.add.container(x, y).setDepth(14);
    const g = this.add.graphics();
    g.fillStyle(0xe6e2ee, 0.92).lineStyle(4, HEX.tinta, 1);
    [[0, 0, 30], [-26, 10, 22], [24, 12, 24], [4, -20, 20]].forEach(([dx, dy, r]) => g.fillCircle(dx, dy, r).strokeCircle(dx, dy, r));
    g.fillStyle(0xe6e2ee, 1);
    [[0, 0, 28], [-26, 10, 20], [24, 12, 22], [4, -20, 18]].forEach(([dx, dy, r]) => g.fillCircle(dx, dy, r));
    c.add(g);
    sfx(this, 'fiuuu', { volume: 0.25 });
    this.bocanadas.push({ o: c, vx: 0, vy: -80, vida: 5.5 });
  }

  moverBocanadas(dt) {
    this.bocanadas = this.bocanadas.filter(b => {
      b.vida -= dt;
      const dx = this.px - b.o.x, dy = this.py - b.o.y, d = Math.hypot(dx, dy) || 1;
      b.vx += (dx / d * 175 - b.vx) * 0.55 * dt;
      b.vy += (dy / d * 175 - b.vy) * 0.55 * dt;
      b.o.x += b.vx * dt; b.o.y += b.vy * dt;
      b.o.setScale(1 + Math.sin(this.t * 6 + b.vida) * 0.06);
      if (d < this.W / 2 * 0.8 + 26) {
        // Con la mano de nube puesta (soltando aire) te lo apartas a medias.
        this.cola += this.aireV > 0.5 ? 0.04 : 0.085;
        golpeTexto(this, b.o.x, b.o.y - 30, '¡pof!', COLOR.crema, 32);
        sfx(this, 'pop', { volume: 0.4 });
        this.pompaSacude();
        b.o.destroy();
        return false;
      }
      if (b.vida <= 0) { this.tweens.add({ targets: b.o, alpha: 0, duration: 300, onComplete: () => b.o.destroy() }); return false; }
      return true;
    });
  }

  // ---------- Se ve y se oye ----------
  sonidoAire(aire) {
    if (aire && !this.sAire) {
      this.sAire = sfx(this, 'deshinchar', { volume: 0.35 });
    } else if (!aire && this.sAire) {
      try { if (this.sAire.isPlaying) this.sAire.stop(); this.sAire.destroy(); } catch (e) { /* ya estaba parado */ }
      this.sAire = null;
    }
    // Si el sonido acabó solo (destruido), se vuelve a armar en la siguiente pulsación larga.
    if (this.sAire && !this.sAire.isPlaying) this.sAire = aire ? null : this.sAire;
  }

  chorritoAire(dt) {
    this.tAireFx -= dt;
    if (this.tAireFx > 0) return;
    this.tAireFx = 0.09;
    const x = this.px + Phaser.Math.Between(-30, 30), y = this.py + this.W * 0.3;
    const p = this.add.circle(x, y, Phaser.Math.Between(6, 12), 0xffffff, 0.7).setDepth(9);
    this.tweens.add({ targets: p, y: y + 90, x: x + Phaser.Math.Between(-30, 30), alpha: 0, scale: 0.4, duration: 520, onComplete: () => p.destroy() });
  }

  // Pinta la Pompa, sus aros, el temblor, las grietas de luz y el halo de alarma.
  mostrarEstado(quieta) {
    const s = this.s, bajo = this.c - this.w, alto = this.c + this.w;
    const sobre = Phaser.Math.Clamp((s - alto) / Math.max(0.01, 1 - alto), 0, 1);
    const falta = s < bajo;
    const dentro = !falta && s <= alto;
    this.W = this.anchoDe(s);
    const tx = (k) => this.textures.exists(k) ? k : null;
    const propio = falta ? tx('pompa-desinflada') : dentro ? tx('pompa-punto') : sobre > 0.78 ? (tx('pompa-limite') || tx('pompa-hinchada')) : tx('pompa-hinchada');
    this.pompa.setTexture(propio || 'pompa');
    // Temblor y latido (más fuertes cuanto más arriba).
    const amp = sobre > 0 ? 2 + sobre * sobre * 15 : 0;
    const f = 1.4 + 7 * sobre;
    const lat = sobre > 0 ? 1 + (0.025 + 0.05 * sobre) * Math.sin(this.t * f * Math.PI * 2) : 1 + 0.012 * Math.sin(this.t * 2.2);
    let sx = this.W / this.pompa.width * lat, sy = sx;
    if (falta) { const arr = Phaser.Math.Clamp((bajo - s) / Math.max(0.05, bajo), 0, 1); sy = sx * (0.9 - 0.25 * arr + 0.02 * Math.sin(this.t * 5)); this.pompa.setAngle(Math.sin(this.t * 2) * 4); }
    else this.pompa.setAngle(sobre > 0 ? Math.sin(this.t * 40) * (1 + sobre * 3) : 0);
    this.pompa.setScale(sx * (1 + (this.pulso || 0)), sy * (1 + (this.pulso || 0)));
    this.pompa.setPosition(this.px + (amp ? Phaser.Math.FloatBetween(-amp, amp) : 0), this.py + (amp ? Phaser.Math.FloatBetween(-amp, amp) * 0.6 : 0));
    // Sin el arte propio: se tiñe (azul si falta, a rojo si se pasa).
    if (!propio) {
      if (falta) this.pompa.setTint(0x9fb8ff);
      else if (sobre > 0) { const c = Phaser.Display.Color.Interpolate.ColorWithColor(new Phaser.Display.Color(255, 255, 255), new Phaser.Display.Color(255, 70, 70), 100, Math.round(sobre * 100)); this.pompa.setTint(Phaser.Display.Color.GetColor(c.r, c.g, c.b)); }
      else this.pompa.clearTint();
    } else this.pompa.clearTint();

    // Los dos aros de su punto: la Pompa tiene que caber entre ellos.
    const asp = this.pompa.height / this.pompa.width;
    const g = this.aros.clear();
    const dW = this.anchoDe(alto), bW = this.anchoDe(bajo);
    const pulso = 0.55 + 0.45 * Math.sin(this.t * 6);
    const col = dentro ? 0xb9ffb0 : 0x7ee081;
    g.fillStyle(0x7ee081, dentro ? 0.2 : 0.08).fillEllipse(this.px, this.py, dW * 1.04, dW * 1.04 * asp);
    g.lineStyle(dentro ? 8 : 5, col, dentro ? 0.7 + 0.3 * pulso : 0.85).strokeEllipse(this.px, this.py, dW * 1.04, dW * 1.04 * asp);
    // El aro de dentro, a trazos.
    const rx = bW / 2, ry = bW / 2 * asp;
    for (let a = 0; a < 24; a++) {
      const a0 = a / 24 * Math.PI * 2, a1 = (a + 0.55) / 24 * Math.PI * 2;
      g.lineStyle(dentro ? 7 : 4, col, 0.85);
      g.lineBetween(this.px + Math.cos(a0) * rx, this.py + Math.sin(a0) * ry, this.px + Math.cos(a1) * rx, this.py + Math.sin(a1) * ry);
    }

    // Grietas de luz.
    const gr = this.grietas.clear();
    if (sobre > 0.5) {
      const n = Math.round((sobre - 0.4) * 14);
      const r = this.W / 2 * 0.82;
      for (let i = 0; i < Math.min(n, this.angGrietas.length); i++) {
        const a = this.angGrietas[i];
        const l = 24 + 40 * sobre + 8 * Math.sin(this.t * 25 + i);
        const x0 = this.pompa.x + Math.cos(a) * r * 0.55, y0 = this.pompa.y + Math.sin(a) * r * 0.55 * asp;
        const xm = this.pompa.x + Math.cos(a + 0.12) * (r + l * 0.4), ym = this.pompa.y + Math.sin(a + 0.12) * (r + l * 0.4) * asp;
        const x1 = this.pompa.x + Math.cos(a - 0.05) * (r + l), y1 = this.pompa.y + Math.sin(a - 0.05) * (r + l) * asp;
        gr.lineStyle(9, 0xfff6a0, 0.35).beginPath().moveTo(x0, y0).lineTo(xm, ym).lineTo(x1, y1).strokePath();
        gr.lineStyle(4, 0xffffff, 0.95).beginPath().moveTo(x0, y0).lineTo(xm, ym).lineTo(x1, y1).strokePath();
      }
    }
    // Halo rojo en los bordes cuando está a una brisa.
    const lg = this.luzG.clear();
    if (sobre > 0.55) {
      const a = (sobre - 0.55) / 0.45 * (0.2 + 0.12 * Math.sin(this.t * f * Math.PI * 2));
      lg.fillStyle(0xff3a3a, Math.max(0, a)).fillRect(0, 0, ANCHO, 40).fillRect(0, ALTO - 40, ANCHO, 40).fillRect(0, 0, 40, ALTO).fillRect(ANCHO - 40, 0, 40, ALTO);
    }
    if (quieta) return;
  }

  pintarMedidor() {
    const { x, arriba, abajo } = ESP_G, H = abajo - arriba, w = 34;
    const yDe = v => abajo - v * H;
    const g = this.medidorG.clear();
    g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(x - w / 2, arriba - 6, w, H + 12, 12);
    // Zona de plop arriba, su punto en verde, zona de pffff abajo.
    g.fillStyle(0xff5a4f, 0.55).fillRect(x - w / 2 + 3, yDe(1), w - 6, yDe(0.9) - yDe(1));
    g.fillStyle(0x5ad1ff, 0.3).fillRect(x - w / 2 + 3, yDe(0.08), w - 6, yDe(0) - yDe(0.08));
    const y1 = yDe(this.c + this.w), y2 = yDe(this.c - this.w);
    g.fillStyle(0x7ee081, this.dentro ? 1 : 0.8).fillRect(x - w / 2 + 3, y1, w - 6, y2 - y1);
    g.lineStyle(5, HEX.tinta, 1).strokeRoundedRect(x - w / 2, arriba - 6, w, H + 12, 12);
    this.marcador.setPosition(x - w / 2 - 14, yDe(Phaser.Math.Clamp(this.s, 0, 1)));
    // Barra de tiempo en su punto.
    const bw = 440, bx = ANCHO / 2 - bw / 2, by = 56, p = Math.min(1, this.tBanda / this.P.objetivo);
    const h = this.hudG.clear();
    h.fillStyle(HEX.tinta, 0.8).fillRoundedRect(bx, by, bw, 16, 8);
    if (p > 0) h.fillStyle(0x7ee081, 1).fillRoundedRect(bx, by, Math.max(14, bw * p), 16, 8);
    h.lineStyle(4, HEX.tinta, 1).strokeRoundedRect(bx, by, bw, 16, 8);
  }

  // ---------- Finales ----------
  ganar() {
    if (this._acabado) return;
    this._acabado = true; this.fase = 'fin';
    this.cortarAire();
    this.tweens.add({ targets: this, pulso: 0.1, duration: 160, yoyo: true, repeat: 3 });
    sfx(this, 'platillo', { volume: 0.5 });
    golpeTexto(this, this.px, this.py - 190, '¡En su punto!', COLOR.verde, 52);
    if (typeof Comic !== 'undefined') { Comic.confeti(this, { profundidad: 80 }); this.tTension = 0; this.enfasis('alegria'); }
    this.cerrar(true, 'plop-no');
  }

  plop(motivo) {
    if (this._acabado) return;
    this._acabado = true; this.fase = 'fin';
    this.cortarAire();
    sfx(this, 'plop', { volume: 0.7 });
    this.cameras.main.shake(300, 0.012);
    this.cameras.main.flash(180, 255, 255, 255);
    const { px, py } = this;
    this.grietas.clear(); this.luzG.clear(); this.aros.clear();
    if (this.textures.exists('pompa-plop')) {
      this.pompa.setTexture('pompa-plop').setAngle(0).setTint(0xffffff).clearTint();
      this.pompa.setScale(this.W * 1.15 / this.pompa.width);
      this.tweens.add({ targets: this.pompa, alpha: 0, duration: 520, delay: 380 });
    } else this.pompa.setVisible(false);
    // Los trocitos de la Pompa.
    for (let i = 0; i < 18; i++) {
      const a = Phaser.Math.FloatBetween(0, Math.PI * 2), d = Phaser.Math.Between(120, 330);
      const pz = this.add.circle(px, py, Phaser.Math.Between(8, 20), Phaser.Utils.Array.GetRandom([HEX.rosa, 0xffffff, 0xffb3d1]), 1).setStrokeStyle(4, HEX.tinta).setDepth(60);
      this.tweens.add({ targets: pz, x: px + Math.cos(a) * d, y: py + Math.sin(a) * d * 0.7 + 90, alpha: 0, scale: 0.4, duration: 900, ease: 'Quad.out', onComplete: () => pz.destroy() });
    }
    if (typeof Comic !== 'undefined') Comic.impacto(this, px, py, { tam: 140, profundidad: 90 });
    golpeTexto(this, px, py - 170, motivo === 'alfiler' ? '¡Alfiler! PLOP' : '¡PLOP!', COLOR.rosa, 64);
    this.cerrar(false, motivo === 'alfiler' ? 'alfiler' : 'plop');
  }

  pffff() {
    if (this._acabado) return;
    this._acabado = true; this.fase = 'fin';
    this.cortarAire();
    sfx(this, 'suspiro', { volume: 0.6 });
    this.grietas.clear(); this.luzG.clear();
    this.tweens.add({ targets: this.pompa, scaleY: this.pompa.scaleY * 0.28, scaleX: this.pompa.scaleX * 1.08, y: this.pompa.y + 110, duration: 900, ease: 'Sine.in' });
    golpeTexto(this, this.px, this.py - 150, 'pffff…', COLOR.azul, 60);
    this.cerrar(false, 'pffff');
  }

  cortarAire() {
    this.sonidoAire(false);
    this.mandos.forEach(m => m.setVisible(false));
    if (this.hint) this.hint.setVisible(false);
  }

  cerrar(gana, motivo) {
    const textos = {
      'plop-no': ['En su punto', 'La Pompa se ha quedado en su punto. Te da las gracias tres frases tarde.'],
      plop: ['¡PLOP!', 'Se ha pasado de su punto. Lasslow se ríe. Claro que se ríe.'],
      alfiler: ['Alfileres', 'Los alfileres de la pared tenían razón. Lo había avisado, eso sí. Después.'],
      pffff: ['Pffff', 'Se ha quedado sin aire. Dice que, bien mirado, tampoco se estaba mal.'],
    };
    const [titulo, linea] = textos[motivo];
    // Bonus por una partida limpia: casi sin salir de su punto una vez dentro.
    if (gana && this.fuera <= 3) { this.puntos += 300; }
    const puntos = Math.round(this.puntos);
    this.time.delayedCall(gana ? 1500 : 1300, () => panelFinal(this, { titulo, linea, puntos, clave: 'EnSuPunto', gana }));
  }
}

// Viñetas jugables: el principio del juego contado en cómic, sin vídeo (17/11/2026, pedido del usuario:
// «los vídeos del principio incrustados no me terminan de convencer»). Sustituye a cine.js.
//
// Una viñeta es una pantalla entera con su fondo, los dibujos de los personajes, un bocadillo cada vez
// (una sola voz, criterio §2) y, de vez en cuando, LA MANO DEL JUGADOR: elegir qué decir, pulsar rápido,
// mantener pulsado o quedarse quieto. Nunca más de 3-4 bocadillos seguidos sin que el jugador haga algo.
// Animaciones cortas y que no tapan: las cortinillas de cómic de siempre (comic.js) para cambiar de plano.
//
// Uso:  Vinetas.ver(scene, [paso, paso, …], alAcabar, { barrio: true })
// Cada paso es una función (v, seguir). Los de serie están en Vinetas.* (dice, elige, machaca…).
// En el Barrio se registra como su ventana (scene.modal), así que el vigilante, Esc y E funcionan igual.

const Vinetas = {
  actual: null, // la que está abierta (una como mucho)

  ver(scene, pasos, alAcabar, opc = {}) {
    const v = new Vineta(scene, opc);
    v.correr(pasos, alAcabar);
    return v;
  },

  // ---------- Pasos ----------
  fondo: (clave, opc) => (v, seguir) => { v.fondo(clave, opc); seguir(); },
  actor: (id, clave, x, y, alto, opc) => (v, seguir) => { v.actor(id, clave, x, y, alto, opc); seguir(); },
  pose: (id, clave) => (v, seguir) => { v.pose(id, clave); seguir(); },
  hacer: fn => (v, seguir) => { fn(v); seguir(); },
  espera: ms => (v, seguir) => v.tras(ms, seguir),
  dice: (id, txt, opc) => (v, seguir) => v.decir(id, txt, opc || {}, seguir),
  cartucho: (txt, opc) => (v, seguir) => v.cartucho(txt, opc || {}, seguir),
  elige: (ops, opc) => (v, seguir) => v.elegir(ops, opc || {}, seguir),
  pulsa: (txt, opc) => Vinetas.elige([{ texto: txt }], opc),
  machaca: opc => (v, seguir) => v.machacar(opc, seguir),
  manten: opc => (v, seguir) => v.mantener(opc, seguir),
  quieto: opc => (v, seguir) => v.quedarQuieto(opc, seguir),
  corte: (tipo, montar) => (v, seguir) => v.cortar(tipo, montar, seguir),
  // Pasos que dependen de lo que hizo el jugador (v.eleccion, v.resultado).
  si: (cond, pasos, otros = []) => (v, seguir) => v.sub(cond(v) ? pasos : otros, seguir),

  // La mano de Vuper: lo que lleva apuntado (o nada). Devuelve el contenedor (va en el plano).
  mano(v, tinta, { x = 160, y = 150, pie = 'Tu mano' } = {}) {
    const s = v.s;
    const c = s.add.container(x, y).setAngle(-5);
    const g = s.add.graphics().fillStyle(0xb9bfd0, 1).lineStyle(5, HEX.tinta, 1).fillRoundedRect(-120, -78, 240, 156, 36).strokeRoundedRect(-120, -78, 240, 156, 36);
    const t = s.add.text(0, -4, tinta || '', { fontFamily: FUENTE, fontSize: '26px', color: '#2b3fd6', align: 'center', lineSpacing: 2 }).setOrigin(0.5);
    const p = s.add.text(0, 96, pie, { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema, stroke: COLOR.tinta, strokeThickness: 5 }).setOrigin(0.5);
    c.add([g, t, p]);
    c.tinta = t;
    c.setScale(0);
    s.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.out' });
    v.poner(c);
    return c;
  },

  // Rótulo pequeño del mundo en que estás (enseña los dos mundos sin explicarlos).
  mundo(v, humo) {
    const t = texto(v.s, 24, 30, humo ? 'El mundo humo · de noche' : 'El mundo normal · de día', 22, humo ? COLOR.rosa : COLOR.crema).setOrigin(0, 0.5);
    v.poner(t);
    return t;
  },
};

class Vineta {
  constructor(scene, { barrio = false, saltable = true, alSaltar = null, musica = null } = {}) {
    this.s = scene;
    this.barrio = barrio;
    this.alSaltar = alSaltar;
    this.actores = {};
    this.globo = null;
    this.vivo = true;
    this.alTocar = null;
    this.pulsandoDedo = false;
    this.relojes = [];
    this.eleccion = -1;
    this.resultado = null;
    this.modo = null; // lo que espera ahora: leer | elegir | machaca | manten | quieto (lo miran las pruebas)
    Vinetas.actual = this;
    if (barrio) {
      if (scene.modal) scene.cerrarModal(); // nunca dos ventanas a la vez
      scene.objetivo = null;
      if (scene.aviso) scene.aviso.setVisible(false);
    }
    this.velo = scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, UNAKE.noche, 1).setDepth(950).setInteractive();
    this.raiz = scene.add.container(0, 0).setDepth(951);
    this.escenario = scene.add.container(0, 0);
    this.ui = scene.add.container(0, 0);
    this.raiz.add([this.escenario, this.ui]);
    this.velo.on('pointerdown', () => { this.pulsandoDedo = true; this.tocar(); });
    this._soltar = () => { this.pulsandoDedo = false; };
    scene.input.on('pointerup', this._soltar);
    this.espacio = scene.input.keyboard ? scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) : null;
    if (barrio) {
      this.modal = { velo: this.velo, c: this.raiz, alQuitar: () => this.cerrar() };
      scene.modal = this.modal;
      scene.modalAccion = () => this.tocar();
      scene.modalCerrar = () => this.saltar();
    } else if (scene.input.keyboard) {
      this._tecla = e => {
        if (e.repeat) return;
        if (e.code === 'Space' || e.code === 'Enter') this.tocar();
        else if (e.code === 'Escape') this.saltar();
        else { const n = ['1', '2', '3', '4'].indexOf(e.key); if (n >= 0 && this.numeros && this.numeros[n]) this.numeros[n](); }
      };
      scene.input.keyboard.on('keydown', this._tecla);
    }
    this._apagar = () => this.cerrar(true);
    scene.events.once('shutdown', this._apagar);
    if (saltable) {
      const b = boton(scene, ANCHO - 96, ALTO - 40, 'Saltar »', () => this.saltar(), { ancho: 150, alto: 46, tam: 19, color: HEX.crema });
      b.setAlpha(0.8);
      this.ui.add(b);
    }
    if (musica && typeof Musica !== 'undefined') Musica.poner(scene, musica);
  }

  // ---------- Secuencia ----------
  correr(pasos, alAcabar) {
    this.alAcabar = alAcabar;
    this.sub(pasos, () => this.terminar());
  }

  sub(pasos, alFinal) {
    let i = -1;
    const siguiente = () => {
      if (!this.vivo) return;
      i += 1;
      if (i >= pasos.length) return alFinal();
      let hecho = false;
      const una = () => { if (hecho) return; hecho = true; this.alTocar = null; this.modo = null; siguiente(); };
      try { pasos[i](this, una); } catch (e) { console.error('[vinetas]', e); una(); }
    };
    siguiente();
  }

  tras(ms, fn) {
    const r = this.s.time.delayedCall(ms, () => { if (this.vivo) fn(); });
    this.relojes.push(r);
    return r;
  }

  cada(ms, fn) {
    const r = this.s.time.addEvent({ delay: ms, loop: true, callback: () => { if (this.vivo) fn(); } });
    this.relojes.push(r);
    return r;
  }

  tocar() { if (this.vivo && this.alTocar) this.alTocar(); }
  pulsando() { return this.pulsandoDedo || !!(this.espacio && this.espacio.isDown); }

  // Lo que sale de una línea de texto, según la opción de velocidad de lectura.
  msLectura(txt) {
    const k = { lenta: 1.5, normal: 1, rapida: 0.7 }[(ESTADO.opciones || {}).texto || 'normal'] || 1;
    return Math.round((1500 + txt.length * 52) * k);
  }

  // ---------- El plano: fondo y dibujos ----------
  poner(obj) { this.escenario.add(obj); return obj; }

  fondo(clave, { x, y, escala, origen, tinte, oscuro = 0 } = {}) {
    const s = this.s;
    const k = s.textures.exists(clave) ? clave : 'bg-dentro';
    const img = s.add.image(x ?? ANCHO / 2, y ?? ALTO / 2, k);
    if (origen !== undefined) img.setOrigin(origen);
    img.setScale(escala ?? Math.max(ANCHO / img.width, ALTO / img.height));
    if (tinte) img.setTint(tinte);
    this.escenario.addAt(img, 0);
    if (oscuro) this.escenario.addAt(s.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, oscuro), 1);
    return img;
  }

  actor(id, clave, x, y, alto, { flip = false, flota = false } = {}) {
    const s = this.s;
    if (!s.textures.exists(clave)) return null;
    const img = s.add.image(x, y, clave).setOrigin(0.5, 1).setFlipX(flip);
    img.setScale(alto / img.height);
    this.escenario.add(img);
    if (flota) flotar(s, img, { amplitud: 8, periodo: 1500 });
    this.actores[id] = { img, alto };
    return img;
  }

  pose(id, clave) {
    const a = this.actores[id];
    if (!a || !this.s.textures.exists(clave)) return;
    a.img.setTexture(clave);
    a.img.setScale(a.alto / a.img.height);
  }

  mover(id, props, ms = 600, ease = 'Sine.inOut') {
    const a = this.actores[id];
    if (!a) return null;
    return this.s.tweens.add({ targets: a.img, ...props, duration: ms, ease });
  }

  // Rótulo de onomatopeya (¡PLOP!, ¡ÑAM!), por encima de la viñeta.
  letrero(txt, x, y, color = COLOR.amarillo, tam = 54) {
    const t = golpeTexto(this.s, x, y, txt, color, tam);
    if (t) t.setDepth(990);
    return t;
  }

  limpiarPlano() {
    this.quitarGlobo();
    this.escenario.removeAll(true);
    this.actores = {};
  }

  quitarGlobo() { if (this.globo && this.globo.scene) this.globo.destroy(); this.globo = null; }

  // ---------- Hablar ----------
  decir(id, txt, opc, seguir) {
    const s = this.s;
    this.quitarGlobo();
    const a = this.actores[id];
    if (opc.pose) this.pose(id, opc.pose);
    let ax = opc.x ?? ANCHO / 2, ay = opc.y ?? 120;
    if (a && opc.x === undefined) { ax = a.img.x + (opc.dx || 0); ay = a.img.y - a.img.displayHeight - 46 + (opc.dy || 0); }
    const crear = cola => bocadillo(s, ax, ay, txt, { ancho: opc.ancho || 460, tam: opc.tam || 28, cola });
    let b = crear('abajo');
    const hw = b.anchoB / 2, hh = b.altoB / 2;
    const bx = Phaser.Math.Clamp(ax, hw + 14, ANCHO - hw - 14), by = Phaser.Math.Clamp(ay, hh + 8, ALTO - 210);
    // Si el bocadillo se ha tenido que apartar, el pico apunta hacia quien habla.
    if (a && Math.abs(bx - (a.img.x)) > hw * 0.45) { b.destroy(); b = crear(a.img.x < bx ? 'izq' : 'der'); }
    b.setPosition(bx, by);
    if (opc.estilo && Comic.estiloBocadillo) Comic.estiloBocadillo(s, b, opc.estilo, a && a.img.x < bx ? 'izq' : 'der');
    this.ui.addAt(b, 0);
    this.globo = b;
    sfx(s, opc.sonido || 'pop', { volume: 0.35 });
    if (a && !opc.quieto) {
      const sx = a.img.scaleX, sy = a.img.scaleY;
      s.tweens.add({ targets: a.img, scaleX: sx * 1.08, scaleY: sy * 0.93, duration: 90, yoyo: true, onComplete: () => { if (a.img.scene) a.img.setScale(sx, sy); } });
    }
    // Cartela la primera vez que sale alguien (como en las escenas de capítulo).
    const vistas = (ESTADO.cartelasVistas = ESTADO.cartelasVistas || {});
    if (typeof CARTELAS !== 'undefined' && CARTELAS[id] && !vistas[id] && a) {
      vistas[id] = true;
      const [nom, sub, col] = CARTELAS[id];
      const cart = Comic.cartela(s, nom, sub, col, { x: ANCHO - 470, y: ALTO - 300, ms: 2200 });
      cart.setDepth(992);
    }
    const ms = opc.ms ?? this.msLectura(txt);
    this.modo = 'leer';
    const r = this.tras(ms, seguir);
    this.tras(280, () => { this.alTocar = () => { r.remove(); seguir(); }; });
  }

  // Cartucho amarillo del narrador (arriba): lo justo, nunca dos seguidos.
  cartucho(txt, opc, seguir) {
    const s = this.s;
    this.quitarGlobo();
    const tam = MOVIL ? 32 : 26;
    const ancho = Math.min(980, ANCHO - 140);
    const c = s.add.container(opc.x ?? 60, opc.y ?? 34).setAngle(-1.2);
    const t = s.add.text(22, 14, txt, { fontFamily: FUENTE, fontSize: `${tam}px`, color: COLOR.tinta, wordWrap: { width: ancho - 44 }, lineSpacing: 4 });
    const alto = t.height + 28, w = Math.min(ancho, t.width + 44);
    const g = s.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRect(7, 7, w, alto);
    g.fillStyle(UNAKE.amarillo, 1).fillRect(0, 0, w, alto).lineStyle(6, HEX.tinta, 1).strokeRect(0, 0, w, alto);
    c.add([g, t]);
    c.x = -1100;
    s.tweens.add({ targets: c, x: opc.x ?? 60, duration: 240, ease: 'Back.out' });
    this.ui.addAt(c, 0);
    this.globo = c;
    sfx(s, 'zas', { volume: 0.3 });
    this.modo = 'leer';
    const r = this.tras(opc.ms ?? this.msLectura(txt), seguir);
    this.tras(280, () => { this.alTocar = () => { r.remove(); seguir(); }; });
  }

  // ---------- La mano del jugador ----------
  // Pista (lo que hay que hacer) + el gesto + barra. `interactivo`: el gesto es un botón de verdad.
  panelMano(textoAccion, pista, { barra = false, tam = 34, flojo = 1 } = {}) {
    const s = this.s;
    const c = s.add.container(0, 0);
    const y = ALTO - 98;
    if (pista) c.add(texto(s, ANCHO / 2, y - 66, pista, 24, COLOR.crema));
    const etiqueta = s.add.text(0, 0, textoAccion, { fontFamily: FUENTE, fontSize: `${Math.round((MOVIL ? tam * 1.12 : tam) * flojo)}px`, color: COLOR.tinta, align: 'center' }).setOrigin(0.5);
    const w = etiqueta.width + 70, h = etiqueta.height + 30;
    const g = s.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22);
    g.fillStyle(HEX.amarillo, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 22).lineStyle(6, HEX.tinta, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    const gesto = s.add.container(ANCHO / 2, y, [g, etiqueta]);
    s.tweens.add({ targets: gesto, scale: 1.05, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    c.add(gesto);
    let relleno = null, marco = null;
    if (barra) {
      marco = s.add.rectangle(ANCHO / 2, y + 52, 420, 22, HEX.tinta).setStrokeStyle(4, HEX.crema);
      relleno = s.add.rectangle(ANCHO / 2 - 206, y + 52, 0, 14, 0xff7a2f).setOrigin(0, 0.5);
      c.add([marco, relleno]);
    }
    this.ui.add(c);
    return { c, etiqueta, gesto, relleno, marco, llenar: k => { if (relleno) relleno.width = 412 * Phaser.Math.Clamp(k, 0, 1); } };
  }

  remate(txt) {
    if (!txt) return;
    this.letrero(txt, ANCHO / 2, ALTO / 2 - 40, COLOR.amarillo, 52);
  }

  elegir(ops, opc, seguir) {
    const s = this.s;
    const flojo = opc.flojo || 1;
    const c = s.add.container(0, 0);
    if (opc.pista) c.add(texto(s, ANCHO / 2, ALTO - 148, opc.pista, 24, COLOR.crema));
    const n = ops.length;
    // Botones a la medida de su texto, abajo del todo: que no tapen la cara de nadie.
    const largo = Math.max(...ops.map(o => o.texto.length));
    const ancho = Math.round(Math.min(520, (ANCHO - 140) / n - 24, Math.max(220, largo * 17 * flojo + 90) * (MOVIL ? 1.15 : 1)));
    let hecho = false;
    const acciones = ops.map((op, k) => () => {
      if (hecho) return;
      hecho = true;
      this.numeros = null;
      if (this.modal) this.modal.numeros = null;
      c.destroy();
      this.eleccion = k;
      if (op.alElegir) op.alElegir(this);
      seguir();
    });
    ops.forEach((op, k) => {
      const x = ANCHO / 2 + (k - (n - 1) / 2) * (ancho + 24);
      const b = boton(s, x, ALTO - 78, op.texto, acciones[k], { ancho, alto: 72, tam: Math.round(28 * flojo), color: op.color || HEX.amarillo });
      if (flojo < 1) b.setAlpha(0.55 + 0.45 * flojo);
      b.setScale(0);
      s.tweens.add({ targets: b, scale: 1, duration: 220, delay: 80 * k, ease: 'Back.out' });
      c.add(b);
    });
    this.ui.add(c);
    this.modo = 'elegir';
    this.numeros = acciones;
    if (this.modal) this.modal.numeros = acciones;
    // Con una sola opción, el espacio (o tocar la pantalla) también vale.
    if (n === 1) this.tras(350, () => { if (!hecho) this.alTocar = acciones[0]; });
  }

  // Pulsar rápido antes de que se acabe el tiempo. `imposible`: no se puede ganar (en el piloto tampoco).
  machacar({ texto: t = '¡RÁPIDO!', pista = 'Pulsa rápido', n = 12, ms = 3000, imposible = false, bien, mal, alPulsar } = {}, seguir) {
    const p = this.panelMano(t, pista, { barra: true });
    this.modo = 'machaca';
    let cuenta = 0, acabado = false;
    const ini = this.s.time.now;
    const fin = ok => {
      if (acabado) return;
      acabado = true;
      reloj.remove();
      p.c.destroy();
      this.alTocar = null;
      this.resultado = ok;
      this.remate(ok ? bien : mal);
      this.tras(ok || bien || mal ? 900 : 200, seguir);
    };
    const reloj = this.cada(60, () => {
      const queda = 1 - (this.s.time.now - ini) / ms;
      if (p.marco) p.marco.setAlpha(Math.max(0.3, queda));
      if (queda <= 0) fin(false);
    });
    this.alTocar = () => {
      cuenta += 1;
      p.llenar(cuenta / n);
      p.gesto.setScale(0.92);
      if (alPulsar) alPulsar(this, cuenta);
      if (cuenta >= n && !imposible) fin(true);
    };
  }

  // Mantener pulsado (el dedo o el espacio) hasta llenar la barra. Si sueltas, baja.
  mantener({ texto: t = 'MANTÉN PULSADO', pista = '', ms = 2000, alCargar } = {}, seguir) {
    const p = this.panelMano(t, pista, { barra: true });
    this.modo = 'manten';
    let carga = 0, antes = this.s.time.now, acabado = false;
    this.alTocar = () => {}; // el toque cuenta como «pulsando» (se mira en cada tic)
    const reloj = this.cada(40, () => {
      if (acabado) return;
      const ahora = this.s.time.now, dt = Math.min(100, ahora - antes);
      antes = ahora;
      carga = Phaser.Math.Clamp(carga + (this.pulsando() ? dt : -dt * 1.2), 0, ms);
      p.llenar(carga / ms);
      if (alCargar) alCargar(this, carga / ms);
      if (carga >= ms) {
        acabado = true;
        reloj.remove();
        p.c.destroy();
        this.alTocar = null;
        this.resultado = true;
        this.tras(250, seguir);
      }
    });
  }

  // No tocar nada durante `ms`. Si tocas, sigue igual (no se castiga), pero cambia el remate.
  quedarQuieto({ texto: t = 'No toques nada', pista = '', ms = 3000, bien, mal } = {}, seguir) {
    const p = this.panelMano(t, pista, { barra: true });
    p.gesto.list[0].setAlpha(0.6);
    this.modo = 'quieto';
    let movida = false;
    const ini = this.s.time.now;
    this.alTocar = () => { if (!movida) { movida = true; p.etiqueta.setText('…'); if (p.relleno) p.relleno.fillColor = HEX.rosa; } };
    const reloj = this.cada(60, () => {
      const k = (this.s.time.now - ini) / ms;
      p.llenar(k);
      if (k >= 1) {
        reloj.remove();
        p.c.destroy();
        this.alTocar = null;
        this.resultado = !movida;
        this.remate(movida ? mal : bien);
        this.tras(900, seguir);
      }
    });
  }

  // ---------- Cortes de plano ----------
  // tipo: 'seco' | 'humo' | una cortinilla de comic.js (estrella, burbuja, pringue, iris, barrido).
  cortar(tipo, montar, seguir) {
    const cambiar = () => { if (!this.vivo) return; this.limpiarPlano(); if (montar) montar(this); };
    if (tipo === 'seco' || !tipo) { cambiar(); return seguir(); }
    if (tipo === 'humo') return cortinaHumo(this.s, () => { cambiar(); destaparHumo(this.s); this.tras(320, seguir); });
    const cubrir = Comic.cubrir[tipo], destapar = Comic.destapar[tipo];
    if (!cubrir) { cambiar(); return seguir(); }
    cubrir(this.s, () => { cambiar(); if (this.vivo && destapar) destapar(this.s); this.tras(320, seguir); });
  }

  // ---------- Final ----------
  saltar() {
    if (!this.vivo) return;
    if (this.alSaltar) { const f = this.alSaltar; this.alSaltar = null; this.alAcabar = null; this.cerrar(); return f(); }
    this.terminar();
  }

  terminar() {
    if (!this.vivo || this._terminando) return;
    this._terminando = true;
    if (!this.barrio) return this.cerrar();
    // En el barrio, como las escenas de capítulo: se cierra en iris y se abre sobre Vuper.
    this.alTocar = null;
    Comic.cubrir.iris(this.s, () => {
      const s = this.s;
      this.cerrar();
      if (!s.modal) Comic.destapar.iris(s, { x: s.px || ANCHO / 2, y: (s.py || ALTO / 2) - 110 });
    });
  }

  cerrar(apagando = false) {
    if (!this.vivo) return;
    this.vivo = false;
    this.alTocar = null;
    if (Vinetas.actual === this) Vinetas.actual = null;
    this.relojes.forEach(r => r.remove(false));
    this.relojes = [];
    const s = this.s;
    if (s.input) s.input.off('pointerup', this._soltar);
    if (this._tecla && s.input && s.input.keyboard) s.input.keyboard.off('keydown', this._tecla);
    if (!apagando) s.events.off('shutdown', this._apagar);
    if (this.barrio && s.modal === this.modal) s.modal = null;
    if (this.velo && this.velo.scene) this.velo.destroy();
    if (this.raiz && this.raiz.scene) this.raiz.destroy();
    if (apagando) return;
    if (this.barrio && typeof Musica !== 'undefined') Musica.alEntrar(s);
    const f = this.alAcabar;
    this.alAcabar = null;
    if (f) f();
  }
}

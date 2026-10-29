// La portada: el callejón de Unaké de noche con el neón que parpadea y humo que pasa. Primero
// «Toca para entrar» (ese toque arranca la música: los navegadores no dejan sonar nada antes);
// luego cae el título con una explosión de humo, entra el menú y aparece todo el reparto, que
// va soltando sus frases. El menú se maneja con ratón, dedo o teclado (↑ ↓ y Enter).

const VERSION = 'v0.8 · prueba';
const FRASES_PORTADA = [
  ['vuper', '¿Vamos a Unaké?'], ['perico', '¿A una qué?'], ['palicaso', '¡A una aso!'],
  ['blancaso', 'Otra vez no…'], ['lasslow', '¡Que se me ha escapao!'], ['cotine', '¿Qué? Tenía hambre.'],
  ['pompa', 'Yo no, que exploto.'], ['perico', 'Pin pin.'], ['palicaso', '¡Escucha, escucha!'],
  ['puky', '¿Me llamabais?'], ['vuper', 'Vale, vale…'], ['lasslow', 'Soy un señor. JA… perdón.'],
];

class Portada extends Phaser.Scene {
  constructor() { super('Portada'); }

  create(datos) {
    ESTADO.edadOk = true;
    this.sound.mute = !(ESTADO.opciones ? ESTADO.opciones.sonido !== false : true);
    this.fondo();
    this.teclas = this.input.keyboard.addKeys('UP,DOWN,W,S,ENTER,SPACE,E,ESC');
    this.panel = this.add.container(390, 480).setDepth(40);
    this.opciones = [];
    entrar(this, datos);
    // Si ya se ha entrado esta sesión (vuelta desde el juego), directo al menú.
    if (Portada.yaEntro) this.entrada(true); else this.tocaParaEntrar();
  }

  // ---------- El escenario ----------

  fondo() {
    this.add.image(ANCHO / 2, 515, 'bg-fuera-apagado').setScale(1.25);
    this.neon = this.add.image(ANCHO / 2, 515, 'bg-fuera').setScale(1.25).setAlpha(0);
    this.time.addEvent({ delay: 3100, loop: true, callback: () => this.tweens.add({ targets: this.neon, alpha: 0.35, duration: 60, yoyo: true, repeat: Phaser.Math.Between(0, 2) }) });
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.3);
    // Viñeta suave a la izquierda para que el menú se lea.
    const g = this.add.graphics();
    for (let i = 0; i < 12; i++) g.fillStyle(HEX.tinta, 0.05).fillRect(0, 0, 760 - i * 40, ALTO);
    for (let i = 0; i < 7; i++) {
      const h = this.add.image(Phaser.Math.Between(0, ANCHO), Phaser.Math.Between(420, 700), 'niebla').setScale(Phaser.Math.FloatBetween(1.6, 2.8)).setAlpha(0.2).setTint(0xd8c8ff).setDepth(5);
      this.tweens.add({ targets: h, x: h.x + Phaser.Math.Between(180, 360), duration: Phaser.Math.Between(9000, 15000), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    // Chispas de neón que suben.
    this.add.particles(0, ALTO + 10, 'miga', {
      x: { min: 0, max: ANCHO }, speedY: { min: -40, max: -90 }, speedX: { min: -10, max: 10 }, scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 }, lifespan: 6000, frequency: 260, tint: [0xff5fa2, 0x5ad1ff, 0xffd23f],
    }).setDepth(6);
  }

  // Todo el reparto, cada uno a su manera.
  reparto() {
    const d = 20;
    const perico = this.add.image(1062, 360, 'perico-cotilleando').setScale(0.3).setDepth(d);
    this.tweens.add({ targets: perico, y: 352, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const pompa = this.add.image(900, -120, 'pompa').setScale(0.3).setDepth(d);
    this.tweens.add({ targets: pompa, y: 120, duration: 1400, ease: 'Sine.out', delay: 300 });
    this.time.delayedCall(1700, () => flotar(this, pompa, { amplitud: 14, periodo: 2200 }));
    // El grupo: botan cada uno a su ritmo.
    const grupo = [['lasslow-digno', 860, 200], ['blancaso', 1180, 190], ['cotine', 990, 230], ['vuper', 1100, 170]];
    this.cast = { perico, pompa };
    grupo.forEach(([clave, x, alto], i) => {
      const img = this.add.image(x, ALTO + 260, clave).setOrigin(0.5, 1).setDepth(d + 1 + i);
      img.setScale(alto / img.height);
      const esc = img.scaleX;
      this.tweens.add({ targets: img, y: ALTO - 20, duration: 700, ease: 'Back.out', delay: 200 + i * 160 });
      this.tweens.add({ targets: img, scaleY: esc * 1.05, scaleX: esc * 0.97, duration: 500 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 900 + i * 160 });
      this.cast[clave.split('-')[0]] = img;
    });
    // Palicaso cruza como estrella fugaz, cada rato.
    const fugaz = () => {
      const p = this.add.image(-120, Phaser.Math.Between(60, 200), 'palicaso').setScale(0.22).setDepth(d - 1).setAngle(-20);
      sfx(this, 'fiu', { volume: 0.3 });
      this.tweens.add({ targets: p, x: ANCHO + 140, y: p.y + 120, duration: 1500, ease: 'Sine.in', onComplete: () => p.destroy() });
      const rastro = this.time.addEvent({ delay: 40, repeat: 34, callback: () => {
        const h = this.add.image(p.x - 40, p.y, 'miga').setTint(0xffd23f).setScale(1.2).setDepth(d - 2);
        this.tweens.add({ targets: h, alpha: 0, scale: 0.2, duration: 500, onComplete: () => h.destroy() });
      } });
      this.time.delayedCall(1500, () => rastro.remove());
    };
    this.time.delayedCall(2200, fugaz);
    this.time.addEvent({ delay: 11000, loop: true, callback: fugaz });
    // Puky asoma por abajo de vez en cuando.
    this.time.addEvent({ delay: 9000, loop: true, callback: () => {
      const p = this.add.image(Phaser.Math.Between(700, 1200), ALTO + 120, 'puky').setOrigin(0.5, 1).setScale(0.28).setDepth(d + 10);
      sfx(this, 'blurp', { volume: 0.25 });
      this.tweens.add({ targets: p, y: ALTO + 30, duration: 450, ease: 'Back.out', yoyo: true, hold: 1200, onComplete: () => p.destroy() });
    } });
    // Frases de la serie, en bocadillos que saltan.
    let i = 0;
    this.time.addEvent({ delay: 3300, loop: true, callback: () => {
      const [quien, frase] = FRASES_PORTADA[i++ % FRASES_PORTADA.length];
      const img = this.cast[quien];
      const x = img ? Phaser.Math.Clamp(img.x, 820, 1140) : 1000;
      const y = img ? Math.max(140, img.y - img.displayHeight - 40) : 600;
      const b = bocadillo(this, x, quien === 'puky' ? 560 : y, frase, { tam: 20, ancho: 260 }).setDepth(60);
      if (img) this.tweens.add({ targets: img, y: img.y - 10, duration: 120, yoyo: true });
      this.time.delayedCall(2600, () => { if (b.active) this.tweens.add({ targets: b, scale: 0, duration: 200, onComplete: () => b.destroy() }); });
    } });
  }

  // ---------- Toca para entrar ----------

  tocaParaEntrar() {
    const t = this.add.image(ANCHO / 2, 300, 'titulo').setScale(0.7).setDepth(30);
    this.tweens.add({ targets: t, scale: 0.74, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const toca = texto(this, ANCHO / 2, 540, this.sys.game.device.input.touch ? 'Toca para entrar a Unaké' : 'Pulsa una tecla para entrar a Unaké', 34, COLOR.amarillo).setDepth(30);
    this.tweens.add({ targets: toca, alpha: 0.35, duration: 650, yoyo: true, repeat: -1 });
    const entrar = () => {
      if (this.entrado) return;
      this.entrado = true;
      Portada.yaEntro = true;
      this.tweens.killTweensOf([t, toca]);
      this.tweens.add({ targets: [t, toca], alpha: 0, duration: 250, onComplete: () => { t.destroy(); toca.destroy(); } });
      sfx(this, 'neon', { volume: 0.5 });
      this.entrada(false);
    };
    this.input.once('pointerdown', entrar);
    this.input.keyboard.once('keydown', entrar);
  }

  // El título cae con una explosión de humo, se enciende el neón y entra el menú.
  entrada(rapida) {
    this.musica = this.sound.add('musica-intro', { volume: 0.35, loop: true });
    this.musica.play();
    this.tweens.chain({ targets: this.neon, tweens: [{ alpha: 1, duration: 80 }, { alpha: 0.2, duration: 90 }, { alpha: 1, duration: 120 }] });
    this.titulo = this.add.image(390, rapida ? 150 : -200, 'titulo').setScale(0.6).setDepth(30);
    const brillo = this.add.image(390, this.titulo.y, 'titulo').setScale(0.62).setTintFill(0xff9ad5).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(29);
    const caer = rapida ? 0 : 700;
    this.tweens.add({ targets: [this.titulo, brillo], y: 150, duration: caer, ease: 'Bounce.out' });
    this.time.delayedCall(caer, () => {
      if (!rapida) {
        sfx(this, 'boing', { volume: 0.5 });
        this.cameras.main.shake(250, 0.006);
        for (let i = 0; i < 14; i++) {
          const h = this.add.image(390 + Phaser.Math.Between(-260, 260), 170 + Phaser.Math.Between(-40, 60), 'humo').setScale(0.1).setTint(0xe8e2f0).setAlpha(0.9).setDepth(28);
          this.tweens.add({ targets: h, scale: Phaser.Math.FloatBetween(0.3, 0.6), alpha: 0, y: h.y - 60, duration: 1200, onComplete: () => h.destroy() });
        }
      }
      brillo.setAlpha(0.25);
      this.tweens.add({ targets: [this.titulo, brillo], y: 140, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: brillo, alpha: 0.05, duration: 1300, yoyo: true, repeat: -1 });
      const sub = texto(this, 390, 262, 'La noche más larga de la aso', 26, COLOR.crema).setDepth(30).setAlpha(0);
      this.tweens.add({ targets: sub, alpha: 1, duration: 400 });
      texto(this, ANCHO - 80, ALTO - 18, VERSION, 14, COLOR.azul).setDepth(30);
      texto(this, 390, ALTO - 18, 'Todo es humo · Aquí nadie juzga', 16, COLOR.rosa).setDepth(30);
      this.reparto();
      this.panel.x = -400;
      this.tweens.add({ targets: this.panel, x: 390, duration: 450, ease: 'Back.out' });
      this.menu();
    });
  }

  // ---------- El menú ----------

  limpiar() {
    this.panel.removeAll(true);
    this.opciones = [];
    this.sel = 0;
  }

  marco(alto) {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(-286, -alto / 2 + 10, 580, alto, 30);
    g.fillStyle(HEX.tinta, 0.9).fillRoundedRect(-290, -alto / 2, 580, alto, 30);
    g.lineStyle(4, HEX.rosa, 0.8).strokeRoundedRect(-290, -alto / 2, 580, alto, 30);
    g.lineStyle(2, HEX.azul, 0.5).strokeRoundedRect(-282, -alto / 2 + 8, 564, alto - 16, 24);
    this.panel.add(g);
  }

  opcion(y, etiqueta, accion, { color = HEX.amarillo, sub = '' } = {}) {
    const b = boton(this, 0, y, etiqueta, () => { sfx(this, 'pop', { volume: 0.4 }); accion(); }, { ancho: 440, alto: sub ? 74 : 60, tam: 24, color });
    if (sub) {
      b.etiqueta.setY(-12);
      b.add(this.add.text(0, 18, sub, { fontFamily: FUENTE, fontSize: '14px', color: '#3d3350' }).setOrigin(0.5));
    }
    this.panel.add(b);
    this.opciones.push({ b, accion });
    b.on('pointerover', () => { this.sel = this.opciones.findIndex(o => o.b === b); this.resaltar(); });
    return b;
  }

  resaltar() {
    this.opciones.forEach((o, i) => o.b.setScale(i === this.sel ? 1.06 : 1).setAlpha(i === this.sel ? 1 : 0.85));
    if (!this.cursor) {
      this.cursor = this.add.text(0, 0, '▸', { fontFamily: 'Arial', fontSize: '38px', color: COLOR.amarillo }).setOrigin(0.5).setDepth(41);
      this.tweens.add({ targets: this.cursor, alpha: 0.4, duration: 400, yoyo: true, repeat: -1 });
    }
    const o = this.opciones[this.sel];
    if (o) this.cursor.setPosition(this.panel.x - 250, this.panel.y + o.b.y).setVisible(true);
  }

  update() {
    if (!this.opciones || !this.opciones.length) return;
    if (this.cursor && this.opciones[this.sel]) this.cursor.setPosition(this.panel.x - 250, this.panel.y + this.opciones[this.sel].b.y);
    const k = this.teclas;
    const pulsado = t => Phaser.Input.Keyboard.JustDown(t);
    if (pulsado(k.DOWN) || pulsado(k.S)) { this.sel = (this.sel + 1) % this.opciones.length; this.resaltar(); sfx(this, 'pop', { volume: 0.2 }); }
    if (pulsado(k.UP) || pulsado(k.W)) { this.sel = (this.sel + this.opciones.length - 1) % this.opciones.length; this.resaltar(); sfx(this, 'pop', { volume: 0.2 }); }
    if (pulsado(k.ENTER) || pulsado(k.SPACE) || pulsado(k.E)) this.opciones[this.sel].accion();
    if (pulsado(k.ESC) && this.volver) this.volver();
  }

  menu() {
    this.limpiar();
    this.volver = null;
    const hay = ESTADO.introVista;
    this.marco(hay ? 400 : 300);
    const y0 = hay ? -150 : -100;
    if (hay) {
      const cap = historiaAcabada() ? 'Modo libre' : `Cap. ${(ESTADO.capitulo || 0) + 1} · ${capituloActual().titulo}`;
      this.opcion(y0, 'Seguir la noche', () => this.seguir(), { sub: `${cap} · ${ESTADO.monchis} monchis · hucha ${ESTADO.hucha || 0}/${META_HUCHA}` });
      this.opcion(y0 + 92, 'Partida nueva', () => this.confirmarNueva(), { color: HEX.rosa });
      this.opcion(y0 + 164, 'Ver la intro', () => irA(this, 'Intro'), { color: HEX.crema });
      this.opcion(y0 + 236, 'Opciones', () => this.ajustes(), { color: HEX.azul });
      this.opcion(y0 + 308, 'Créditos', () => this.creditos(), { color: HEX.crema });
      this.hoy();
    } else {
      this.opcion(y0, 'Empezar la noche', () => { this.completaEnMovil(); irA(this, 'Intro'); }, { sub: 'Una historia en 6 capítulos' });
      this.opcion(y0 + 92, 'Opciones', () => this.ajustes(), { color: HEX.azul });
      this.opcion(y0 + 164, 'Créditos', () => this.creditos(), { color: HEX.crema });
    }
    this.resaltar();
  }

  // «Hoy en Unaké»: cómo va la partida, arriba a la derecha.
  hoy() {
    if (this.tarjetaHoy) this.tarjetaHoy.destroy();
    actualizarNegocio();
    const cn = cuentasNegocio();
    const c = this.add.container(ANCHO - 200, 52).setDepth(45).setAlpha(0);
    c.add(this.add.graphics().fillStyle(HEX.tinta, 0.85).fillRoundedRect(-185, -40, 370, 80, 18).lineStyle(3, HEX.amarillo, 0.6).strokeRoundedRect(-185, -40, 370, 80, 18));
    c.add(this.add.text(-170, -32, 'Hoy en Unaké', { fontFamily: FUENTE, fontSize: '16px', color: COLOR.rosa }));
    c.add(this.add.star(-158, 8, 5, 6, 14, HEX.amarillo).setStrokeStyle(3, HEX.tinta));
    const caja = Math.floor(negocio().caja);
    c.add(this.add.text(-138, -14, `${totalEstrellas()} estrellas · ${cn.rango}${cn.total ? ` · caja ${caja}` : ''}`, { fontFamily: FUENTE, fontSize: '17px', color: COLOR.crema }));
    const retos = retosDeHoy().lista.filter(r => r.hecho).length;
    const logros = LOGROS.filter(l => (ESTADO.logros || {})[l.id]).length;
    c.add(this.add.text(-138, 10, `Retos de hoy ${retos}/3 · Logros ${logros}/${LOGROS.length}`, { fontFamily: FUENTE, fontSize: '15px', color: COLOR.amarillo }));
    this.tweens.add({ targets: c, alpha: 1, duration: 500, delay: 300 });
    this.tarjetaHoy = c;
  }

  completaEnMovil() {
    if (this.sys.game.device.input.touch && !this.scale.isFullscreen) { try { this.scale.startFullscreen(); } catch (e) { /* el navegador puede negarse */ } }
  }

  seguir() {
    this.completaEnMovil();
    sfx(this, 'campanita');
    irA(this, 'Barrio');
  }

  confirmarNueva() {
    this.limpiar();
    this.marco(300);
    this.volver = () => this.menu();
    this.panel.add(texto(this, 0, -100, '¿Empezar de cero?', 32, COLOR.rosa));
    this.panel.add(this.add.text(0, -48, 'Se borra la partida: historia, monchis, estrellas, inventos y negocio.', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.crema, align: 'center', wordWrap: { width: 480 } }).setOrigin(0.5));
    this.opcion(30, 'Sí, partida nueva', () => {
      const opciones = ESTADO.opciones;
      ESTADO = structuredClone(ESTADO_INICIAL);
      Object.assign(ESTADO, { edadOk: true, opciones });
      guardarPartida();
      this.completaEnMovil();
      irA(this, 'Intro');
    }, { color: HEX.rosa });
    this.opcion(104, 'No, volver (Esc)', () => this.menu(), { color: HEX.crema });
    this.sel = 1;
    this.resaltar();
  }

  ajustes() {
    this.limpiar();
    this.marco(330);
    this.volver = () => this.menu();
    ESTADO.opciones = ESTADO.opciones || { sonido: true };
    this.panel.add(texto(this, 0, -126, 'Opciones', 32, COLOR.azul));
    const sonido = this.opcion(-50, `Sonido: ${ESTADO.opciones.sonido !== false ? 'Sí' : 'No'}`, () => {
      ESTADO.opciones.sonido = ESTADO.opciones.sonido === false;
      this.sound.mute = !ESTADO.opciones.sonido;
      guardarPartida();
      sonido.etiqueta.setText(`Sonido: ${ESTADO.opciones.sonido ? 'Sí' : 'No'}`);
    }, { color: HEX.amarillo });
    this.opcion(24, this.scale.isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa', () => {
      if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen();
      this.time.delayedCall(300, () => this.ajustes());
    }, { color: HEX.verde });
    this.opcion(98, 'Volver (Esc)', () => this.menu(), { color: HEX.crema });
    this.resaltar();
  }

  creditos() {
    this.limpiar();
    this.marco(380);
    this.volver = () => this.menu();
    this.panel.add(texto(this, 0, -150, 'Créditos', 32, COLOR.amarillo));
    const lineas = [
      'UNAKÉ · una serie de VOPPË',
      'Vuper, Palicaso, Blancaso, Perico, Cotine, la Pompa, Lasslow y Puky',
      'Música: «Whistling through the quiet night»',
      'Juego hecho con Phaser · prueba para los amigos',
      '«¿Vamos a Unaké?» «¿A una qué?» «A una aso.»',
    ];
    this.panel.add(this.add.text(0, -40, lineas.join('\n\n'), { fontFamily: FUENTE, fontSize: '17px', color: COLOR.crema, align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5));
    this.opcion(140, 'Volver (Esc)', () => this.menu(), { color: HEX.crema });
    this.resaltar();
  }
}

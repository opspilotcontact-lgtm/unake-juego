// Fumar en el sofá de Unaké con Lasslow y Blancaso. Sin misión: es disfrutar.
// - Empieza encendiendo (el mechero falla una vez, como todos).
// - MANTENER = calada: Vuper se hincha (fumar hincha) y se echa atrás. Soltar en la zona verde =
//   calada perfecta: aguanta temblando con los mofletes llenos, suelta de golpe y salen aros.
//   Pasarse = tos (y los colegas se ríen). Cada calada sube el colocón.
// - P = pasarlo: el porro vuela hasta el colega, que fuma, suelta y reacciona. Si Blancaso fuma,
//   al rato le da un blancaso.
// - En el mundo normal (de día, poses con cuerpo de persona), la primera calada buena hace efecto:
//   Vuper se parte en energía y cortinilla al mundo humo.
// - El humo se queda en la sala: cuanto más se fuma, más cargado el ambiente.

const CHARLAS_SOFA = {
  lasslow: ['¿Te has fijado en que el techo respira?', 'Yo es que soy un señor, ¿eh? JAJA… perdón.', 'Este sofá me está abrazando.', 'Si me río, no es por ti. Bueno, un poco sí.'],
  blancaso: ['Hoy sí. Hoy disfruto de mi bar.', 'Qué a gusto… de momento.', '¿Alguien ha visto mis cuentas? Da igual.', 'Esta noche no me da el bajón. Hoy no.'],
};

// Poses por mundo. Las que faltan caen en `base`.
const POSES_SOFA = {
  humo: {
    vuper: { base: 'vuper-fumando', calada: 'vuper-calada', aguanta: 'vuper-aguanta', suelta: 'vuper-suelta', tos: 'vuper-tos', pasar: 'vuper-pasando', mechero: 'vuper-fumando', riendo: 'vuper-fumado', sin: 'vuper' },
    lasslow: { base: 'lasslow-digno', calada: 'lasslow-calada', suelta: 'lasslow-calada', riendo: 'lasslow-risa-floja', tos: 'lasslow-horror' },
    blancaso: { base: 'blancaso', calada: 'blancaso-calada', suelta: 'blancaso-calada', riendo: 'blancaso-esperanza', tos: 'blancaso-mareado' },
  },
  normal: {
    vuper: { base: 'vn-fumando-calada', calada: 'vn-fumando-calada', aguanta: 'vn-fumando-aguanta', suelta: 'vn-fumando-suelta', tos: 'vn-fumando-tos', pasar: 'vn-hablando', mechero: 'vn-fumando-mechero', riendo: 'vn-riendo', sin: 'vn-riendo' },
    lasslow: { base: 'n-lasslow', calada: 'n-lasslow-fumando-calada', aguanta: 'n-lasslow-fumando-aguanta', suelta: 'n-lasslow-fumando-suelta', riendo: 'n-lasslow-riendo', tos: 'n-lasslow-fumando-tos' },
    blancaso: { base: 'n-blancaso', calada: 'n-blancaso-fumando-calada', aguanta: 'n-blancaso-fumando-aguanta', suelta: 'n-blancaso-fumando-suelta', riendo: 'n-blancaso-riendo', tos: 'n-blancaso-sorprendido' },
  },
};

// Dónde van sentados y cuánto miden (en el normal se recortan las piernas: el sofá las tapa).
const SITIO = {
  lasslow: { x: 420, alto: { humo: 200, normal: 330 } },
  vuper: { x: 640, alto: { humo: 235, normal: 350 } },
  blancaso: { x: 880, alto: { humo: 190, normal: 330 } },
};
// Dónde está la punta del porro (o la llama del mechero) en cada dibujo, medido con rejilla:
// el fuego sale de ahí, y si la pose no enseña el porro, no sale fuego.
const PUNTAS = {
  'vuper-fumando': [0.84, 0.46], 'vuper-calada': [0.88, 0.62], 'vuper-tos': [0.98, 0.8],
  // Mundo normal, medido de nuevo con rejilla ampliada (29-oct): la punta encendida del porro.
  'vn-fumando-calada': [0.45, 0.365], 'vn-fumando-mechero': [0.632, 0.386],
};
// Dónde está la boca del mechero en las poses de encender: la llama sale de ahí y se tuerce hasta la punta.
const MECHEROS = { 'vn-fumando-mechero': [0.54, 0.45] };
const ASIENTO = 600;
const SENTADO = 0.66; // parte del cuerpo normal que asoma por encima del cojín

class Fumar extends Phaser.Scene {
  constructor() { super('Fumar'); }

  create(datos) {
    this.datos = datos || {};
    const calidad = this.datos.calidad ?? 60;
    this.potencia = 0.6 + calidad / 250;
    this.porro = 60 + calidad * 0.6;
    this.porroMax = this.porro;
    this.inhala = 0;
    this.combo = 0;
    this.perfectas = 0;
    this.pases = 0;
    this.subido = 0;
    this.ocupado = 2.4;      // empieza encendiendo
    this.blancasoFumo = false;
    this.mundo = this.datos.mundo === 'normal' ? 'normal' : 'humo';
    this.acabado = false;
    // Phaser reutiliza la escena: lo de la sesión anterior no puede quedarse puesto.
    this.porroFuera = false;
    this.rompiendo = false;
    this.aguantando = false;
    this.cambiado = false;

    this.bg = fondo(this, this.mundo === 'humo' ? 'bg-sofa' : 'bgn-sofa');
    // Ambiente: humo que se va quedando en la sala.
    this.ambiente = [0, 1, 2, 3].map(i => {
      const h = this.add.image(200 + i * 300, 170 + (i % 2) * 80, 'tex-niebla').setScale(1.8 + i * 0.25).setAlpha(0).setDepth(4);
      this.tweens.add({ targets: h, x: h.x + 120, duration: 9000 + i * 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return h;
    });
    this.velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.morado, 0).setDepth(5);

    this.actores = {};
    ['lasslow', 'blancaso', 'vuper'].forEach(id => {
      const img = this.add.image(SITIO[id].x, ASIENTO, 'vuper').setDepth(id === 'vuper' ? 11 : 10);
      this.actores[id] = { id, img, pose: 'base', hincha: 1 };
    });
    this.ponerMundo();

    this.marcadores();
    this.teclas = this.input.keyboard.addKeys('SPACE,P');
    this.dedo = false;
    this.input.on('pointerdown', (_p, sobre) => { if (!sobre.length) this.dedo = true; });
    this.input.on('pointerup', () => { this.dedo = false; });
    this.input.keyboard.on('keydown-P', () => this.pasar());
    this.input.keyboard.on('keydown-ESC', () => this.terminar());

    this.time.addEvent({ delay: 7500, loop: true, callback: () => this.charlaSofa() });
    this.time.addEvent({ delay: 14000, loop: true, callback: () => this.suceso() });
    entrar(this, datos);
    this.encender();
  }

  marcadores() {
    texto(this, 120, 40, 'PORRO', 22, COLOR.crema).setDepth(50);
    this.add.rectangle(330, 40, 316, 24, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(50);
    this.barraPorro = this.add.rectangle(176, 40, 308, 16, 0xfff6e8).setOrigin(0, 0.5).setDepth(50);
    this.brasaBarra = this.add.circle(176 + 308, 40, 9, 0xff7a2f).setDepth(51);
    texto(this, 120, 80, 'COLOCÓN', 22, COLOR.crema).setDepth(50);
    this.add.rectangle(330, 80, 316, 24, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(50);
    this.barraColocon = this.add.rectangle(176, 80, 0, 16, 0xb68cff).setOrigin(0, 0.5).setDepth(50);
    this.textoCombo = texto(this, 1100, 44, '', 30, COLOR.amarillo).setDepth(50);
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(1150, 200, 56, 340, 16);
    g.fillStyle(0x7ee081, 0.9).fillRect(1160, 530 - 320 * 0.85, 36, 320 * 0.3);
    this.barraCalada = this.add.rectangle(1178, 530, 28, 0, 0xffffff).setOrigin(0.5, 1).setDepth(51);
    texto(this, 1178, 566, 'Calada', 18, COLOR.crema).setDepth(50);
    texto(this, ANCHO / 2, 690, 'MANTÉN = calada · suelta en lo verde · P = pásalo', 22, COLOR.crema).setDepth(50);
    this.botones = [
      boton(this, 150, 640, 'Pásalo (P)', () => this.pasar(), { ancho: 220, alto: 60, tam: 22, color: HEX.verde }).setDepth(60),
      boton(this, ANCHO - 130, 640, 'Levantarse (Esc)', () => this.terminar(), { ancho: 220, alto: 56, tam: 20, color: HEX.crema }).setDepth(60),
    ];
  }

  // ---------- Actores ----------

  ponerMundo() {
    this.bg.setTexture(this.mundo === 'humo' ? 'bg-sofa' : 'bgn-sofa');
    Object.values(this.actores).forEach(a => this.pose(a.id, a.pose === 'base' ? 'base' : a.pose));
  }

  // Pone la pose con su tamaño; en el mundo normal, sentado (sin piernas, el cojín las tapa).
  pose(id, nombre, ms) {
    if (this.rompiendo && id === 'vuper') return;
    // Mientras el porro lo tiene otro, Vuper no puede tener uno en la mano.
    if (id === 'vuper' && this.porroFuera && nombre !== 'pasar') nombre = 'sin';
    const a = this.actores[id];
    const lista = POSES_SOFA[this.mundo][id];
    const clave = lista[nombre] || lista.base;
    a.pose = nombre;
    a.img.setTexture(clave);
    const normal = this.mundo === 'normal';
    const h = a.img.height;
    a.esc = SITIO[id].alto[this.mundo] / (normal ? h * SENTADO : h);
    if (normal) a.img.setOrigin(0.5, SENTADO).setCrop(0, 0, a.img.width, h * SENTADO);
    else a.img.setOrigin(0.5, 1).setCrop();
    if (a.vuelta) a.vuelta.remove();
    if (ms) a.vuelta = this.time.delayedCall(ms, () => { if (!this.acabado) this.pose(id, 'base'); });
    // Cambio de pose con rebote.
    a.rebote = 1.12;
  }

  boca(id) {
    const a = this.actores[id];
    const img = a.img;
    const visible = img.displayHeight * (this.mundo === 'normal' ? SENTADO : 1);
    const arriba = img.y - visible;
    return this.mundo === 'normal'
      ? { x: img.x + img.displayWidth * 0.06, y: arriba + img.displayHeight * 0.3 }
      : { x: img.x + img.displayWidth * 0.12, y: arriba + visible * 0.6 };
  }

  puntaPorro(id = 'vuper', tabla = PUNTAS) {
    const img = this.actores[id].img;
    const f = tabla[img.texture.key];
    if (!f) return null;
    return {
      x: img.x + (f[0] - img.originX) * img.displayWidth * (img.flipX ? -1 : 1),
      y: img.y + (f[1] - img.originY) * img.displayHeight,
    };
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.animarActores(dt);
    if (this.acabado) return;
    this.ocupado -= dt;
    const pulsa = (this.teclas.SPACE.isDown || this.dedo) && this.ocupado <= 0;

    if (pulsa) {
      if (this.inhala === 0) {
        this.pose('vuper', 'calada');
        this.sonidoCalada = sfx(this, 'calada', { volume: 0.7 });
      }
      this.inhala += dt * 50;
      this.porro -= dt * 6;
      if (Math.random() < 0.3) this.chispa();
      if (this.inhala >= 100) this.tos();
    } else if (this.inhala > 0) {
      this.soltarCalada();
    }

    this.barraCalada.setSize(28, 320 * Math.min(1, this.inhala / 100)); // setSize recoloca el ancla: crece hacia arriba
    this.barraCalada.fillColor = this.inhala > 85 ? HEX.rojo : this.inhala > 55 ? 0x7ee081 : 0xffffff;
    const f = Math.max(0, this.porro / this.porroMax);
    this.barraPorro.width = 308 * f;
    this.brasaBarra.setPosition(176 + 308 * f, 40).setScale(this.inhala > 0 ? 1.3 + Math.random() * 0.3 : 1);
    const colocon = Math.min(100, ESTADO.colocon + this.subido);
    this.barraColocon.width = 308 * colocon / 100;

    // El mundo se ondula y el humo se queda en la sala.
    const k = colocon / 100;
    this.cameras.main.setRotation(Math.sin(this.time.now / 1400) * 0.012 * k);
    this.cameras.main.setZoom(1 + Math.sin(this.time.now / 900) * 0.01 * k);
    this.velo.fillAlpha = 0.1 * k;
    const cargado = Math.min(0.45, (this.subido + this.pases * 4) / 90);
    this.ambiente.forEach(h => h.setAlpha(cargado));

    if (this.porro <= 0) this.terminar();
  }

  // Respirar, hincharse con la calada, temblar aguantando y rebotar al cambiar de pose.
  animarActores(dt) {
    const t = this.time.now;
    Object.values(this.actores).forEach((a, i) => {
      a.rebote = Phaser.Math.Linear(a.rebote || 1, 1, Math.min(1, dt * 10));
      let sx = 1 + 0.015 * Math.sin(t / 420 + i);
      let sy = 1 - 0.015 * Math.sin(t / 420 + i);
      let ang = 0;
      let dx = 0;
      if (a.id === 'vuper') {
        const hincha = 1 + Math.min(this.inhala, 100) / 100 * 0.14;
        a.hincha = Phaser.Math.Linear(a.hincha, this.aguantando ? 1.16 : hincha, Math.min(1, dt * 8));
        sx *= a.hincha;
        sy *= 1 + (a.hincha - 1) * 0.6;
        ang = -this.inhala / 100 * 5;
        if (this.aguantando) dx = Math.sin(t / 25) * 2.5;
        if (a.pose === 'tos') { dx = Math.sin(t / 30) * 6; ang = Math.sin(t / 60) * 6; }
      } else if (a.pose === 'riendo') {
        sy *= 1 + Math.abs(Math.sin(t / 90)) * 0.05;
        ang = Math.sin(t / 110) * 4;
      }
      a.img.setScale(a.esc * sx * a.rebote, a.esc * sy / a.rebote);
      a.img.setAngle(ang);
      a.img.x = SITIO[a.id].x + dx;
      a.img.y = ASIENTO;
    });
  }

  // ---------- Encender ----------

  encender() {
    this.pose('vuper', 'mechero');
    let b = this.puntaPorro() || this.boca('vuper');
    const llama = this.add.container(b.x, b.y - 8).setDepth(30).setVisible(false);
    const fuera = this.add.ellipse(0, 0, 18, 34, 0xffb43a);
    const dentro = this.add.ellipse(0, 4, 8, 18, 0xfff3a0);
    llama.add([fuera, dentro]);
    // Se coloca cuando la pose ya está quieta (el cambio de pose rebota y descuadraría la medida).
    const colocar = () => {
      b = this.puntaPorro() || this.boca('vuper');
      const m = this.puntaPorro('vuper', MECHEROS);
      if (!m) { llama.setPosition(b.x, b.y - 8).setAngle(0); return; }
      // La llama nace en el mechero y se tuerce hasta tocar la punta (se la chupa al encender).
      const largo = Math.max(24, Phaser.Math.Distance.Between(m.x, m.y, b.x, b.y));
      fuera.setSize(12, largo).setOrigin(0.5, 1).setPosition(0, 0);
      dentro.setSize(5, largo * 0.55).setOrigin(0.5, 1).setPosition(0, 2);
      fuera.geom.setSize(12, largo); dentro.geom.setSize(5, largo * 0.55);
      fuera.updateDisplayOrigin(); dentro.updateDisplayOrigin();
      llama.setPosition(m.x, m.y).setAngle(Phaser.Math.RadToDeg(Math.atan2(b.y - m.y, b.x - m.x)) + 90);
    };
    this.tweens.add({ targets: llama, scaleY: 1.12, scaleX: 0.85, duration: 90, yoyo: true, repeat: -1 });
    const t1 = texto(this, ANCHO / 2, 250, 'Enciende…', 40, COLOR.crema).setDepth(60);
    this.time.delayedCall(500, () => { colocar(); sfx(this, 'mechero-falla'); this.chispa(b.x, b.y); });
    this.time.delayedCall(1200, () => {
      colocar();
      sfx(this, 'mechero');
      llama.setVisible(true);
      this.chispa(b.x, b.y);
    });
    this.time.delayedCall(2100, () => {
      llama.destroy();
      t1.setText('¡Prende! MANTÉN para la primera calada');
      this.tweens.add({ targets: t1, alpha: 0, delay: 1600, duration: 400, onComplete: () => t1.destroy() });
      this.pose('vuper', 'base');
      this.voluta(b.x, b.y - 10, 0.08, false);
    });
  }

  chispa(x, y) {
    const p = x === undefined ? this.puntaPorro() : { x, y };
    if (!p) return;
    const ch = this.add.particles(p.x, p.y, 'miga', {
      speed: { min: 30, max: 120 }, scale: { start: 0.45, end: 0 }, lifespan: 380, tint: [0xff7a2f, 0xffd23f], emitting: false,
    }).setDepth(31);
    ch.explode(4);
    this.time.delayedCall(450, () => ch.destroy());
  }

  // ---------- Calada ----------

  soltarCalada() {
    const i = this.inhala;
    this.inhala = 0;
    if (this.sonidoCalada) this.sonidoCalada.stop();
    if (i < 20) { this.pose('vuper', 'base'); return; }
    const perfecta = i >= 55 && i <= 85;
    this.subido += (perfecta ? 9 : 5) * this.potencia;
    // De día, la primera calada buena siempre hace efecto: te deja justo pasado el umbral del mundo humo.
    if (this.mundo === 'normal' && !this.cambiado) this.subido = Math.max(this.subido, UMBRAL_HUMO - ESTADO.colocon + 2);
    if (perfecta) {
      this.combo++;
      this.perfectas++;
      this.textoCombo.setText(`¡Perfecta! x${this.combo}`);
      this.pose('vuper', 'aguanta');
      this.aguantando = true;
      this.ocupado = 0.9;
      this.time.delayedCall(850, () => { this.aguantando = false; this.exhalar('vuper', true); });
    } else {
      this.combo = 0;
      this.textoCombo.setText('');
      this.exhalar('vuper', false);
    }
    // Primera calada buena en el mundo normal: hace efecto.
    if (this.mundo === 'normal' && !this.cambiado && ESTADO.colocon + this.subido >= UMBRAL_HUMO) {
      this.cambiado = true;
      this.ocupado = 3;
      this.time.delayedCall(perfecta ? 1500 : 800, () => this.haceEfecto());
    }
  }

  exhalar(id, perfecta) {
    if (this.acabado) return;
    this.pose(id, 'suelta', 1100);
    if (id === 'vuper') this.actores.vuper.hincha = 0.9; // se desinfla de golpe
    sfx(this, 'fup', { volume: 0.5 });
    const p = this.boca(id);
    if (!perfecta || id !== 'vuper') {
      for (let i = 0; i < 5; i++) this.time.delayedCall(i * 60, () => this.voluta(p.x + 10, p.y, 0.2, true));
      return;
    }
    // Calada perfecta: cada vez sale el humo de una forma distinta (sin repetir la anterior).
    const estilos = ['aros', 'dragon', 'corazon', 'tornado', 'aroDentro', 'cascada', 'carita'].filter(e => e !== this.ultimoEstilo);
    const estilo = Phaser.Utils.Array.GetRandom(estilos);
    this.ultimoEstilo = estilo;
    this[`humo_${estilo}`](p);
    if (this.combo >= 2 || Math.random() < 0.6) this.time.delayedCall(800, () => this.reaccionar(estilo));
  }

  humo_aros(p) {
    this.cartel('¡Tres aros!');
    for (let i = 0; i < 3; i++) this.time.delayedCall(250 + i * 280, () => this.aro(p.x + 30, p.y - 10, 80 + i * 40, 1));
  }

  humo_dragon(p) {
    this.cartel('¡Calada de dragón!');
    this.cameras.main.shake(300, 0.006);
    sfx(this, 'whoosh', { volume: 0.5 });
    for (let i = 0; i < 16; i++) this.time.delayedCall(i * 35, () => this.voluta(p.x + 20 + i * 14, p.y + Phaser.Math.Between(-20, 20), 0.34, true));
  }

  humo_corazon(p) {
    this.cartel('Humo con amor');
    const c = this.add.container(p.x + 60, p.y - 30).setDepth(30).setScale(0.3).setAlpha(0.95);
    const tex = this.mundo === 'normal' ? 'tex-niebla' : 'humo';
    [[-22, -10], [22, -10], [0, 18], [-11, 6], [11, 6]].forEach(([x, y]) => c.add(this.add.image(x, y, tex).setScale(this.mundo === 'normal' ? 0.35 : 0.14).setTint(0xffc2dc)));
    this.tweens.add({ targets: c, y: p.y - 260, scale: 1.4, alpha: 0, duration: 2600, ease: 'Sine.out', onComplete: () => c.destroy() });
    this.time.delayedCall(500, () => sfx(this, 'campanita', { volume: 0.3 }));
  }

  humo_tornado(p) {
    this.cartel('¡Tornado!');
    for (let i = 0; i < 14; i++) {
      this.time.delayedCall(i * 70, () => {
        const a = i * 0.9;
        this.voluta(p.x + 40 + Math.cos(a) * (20 + i * 3), p.y - i * 14 + Math.sin(a) * 10, 0.18, false);
      });
    }
  }

  humo_aroDentro(p) {
    this.cartel('¡Un aro dentro de otro!');
    this.aro(p.x + 30, p.y - 10, 100, 1.4);
    this.time.delayedCall(500, () => this.aro(p.x + 30, p.y - 10, 100, 0.7, true));
  }

  humo_cascada(p) {
    this.cartel('Cascada de humo');
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 80, () => {
        const tex = this.mundo === 'normal' ? 'tex-niebla' : 'humo';
        const h = this.add.image(p.x + 10, p.y + 10, tex).setScale(this.mundo === 'normal' ? 0.2 : 0.08).setTint(0xf2eef8).setAlpha(0.9).setDepth(29);
        this.tweens.add({ targets: h, y: p.y + 160, x: h.x + Phaser.Math.Between(-60, 60), scale: h.scale * 2.5, alpha: 0, duration: 1600, ease: 'Sine.in', onComplete: () => h.destroy() });
      });
    }
  }

  humo_carita(p) {
    this.cartel('El humo te guiña un ojo');
    const c = this.add.container(p.x + 70, p.y - 20).setDepth(30).setScale(0.4);
    c.add(this.add.image(0, 0, this.mundo === 'normal' ? 'tex-niebla' : 'humo').setScale(this.mundo === 'normal' ? 0.6 : 0.3).setTint(0xf2eef8));
    c.add(this.add.circle(-12, -4, 6, HEX.tinta));
    const guino = this.add.rectangle(12, -4, 14, 4, HEX.tinta);
    c.add(guino);
    c.add(this.add.arc(0, 8, 12, 20, 160, false).setStrokeStyle(4, HEX.tinta));
    this.tweens.add({ targets: c, y: p.y - 250, scale: 1.1, duration: 2400, ease: 'Sine.out' });
    this.tweens.add({ targets: c, alpha: 0, duration: 600, delay: 1800, onComplete: () => c.destroy() });
    this.tweens.add({ targets: guino, scaleY: 3, duration: 150, yoyo: true, repeat: 2, delay: 600 });
  }

  aro(x, y, deriva, tam, dentro) {
    const aro = this.add.ellipse(x, y, 50 * tam, 26 * tam).setStrokeStyle(dentro ? 6 : 8, 0xf2eef8, 0.95).setDepth(30);
    this.tweens.add({ targets: aro, y: y - 280, x: x + deriva, scaleX: dentro ? 2.2 : 2.6, scaleY: dentro ? 1.8 : 2.2, alpha: 0, duration: dentro ? 1900 : 2400, ease: 'Sine.out', onComplete: () => aro.destroy() });
  }

  // Rótulo corto de lo que acaba de pasar (arriba, sin tapar a nadie).
  cartel(t) {
    golpeTexto(this, ANCHO / 2, 170, t, COLOR.amarillo, 40);
  }

  // Los colegas reaccionan a tu calada, cada vez de una forma.
  reaccionar(estilo) {
    if (this.acabado || this.porroFuera) return;
    const id = Math.random() < 0.55 ? 'lasslow' : 'blancaso';
    const REACCIONES = {
      lasslow: [
        ['riendo', '¡Bravo, caballero!', 'risas'], ['riendo', 'JAJAJA… perdón, es la emoción.', 'risa-lasslow'],
        ['tos', 'Eso no lo hago yo ni ensayando.', 'tos-pequena'], ['riendo', '*aplaude con los piececillos*', 'oooh'],
        ['calada', 'Enséñame, enséñame.', 'pop'], ['riendo', estilo === 'corazon' ? '¿Eso es para mí? Me sonrojo.' : '¡Ese humo tiene más clase que yo!', 'aaah'],
      ],
      blancaso: [
        ['riendo', 'Qué arte…', 'aaah'], ['tos', 'Me mareo solo de verlo.', 'suspiro'], ['riendo', 'Esto no sale en las cuentas, pero vale oro.', 'pop'],
        ['calada', 'Hoy sí que disfruto de mi bar.', 'campanita'], ['tos', estilo === 'dragon' ? '¡Que me quemas las cejas!' : 'Otra vez no… ah, que es bueno.', 'suspiro'],
      ],
    };
    const [pose, frase, sonido] = Phaser.Utils.Array.GetRandom(REACCIONES[id]);
    this.pose(id, pose, 1600);
    this.decir(this.actores[id], frase);
    sfx(this, sonido, { volume: 0.45 });
  }

  voluta(x, y, tam, grande) {
    const normal = this.mundo === 'normal';
    const h = this.add.image(x, y, normal ? 'tex-niebla' : 'humo').setScale(tam * (normal ? 0.9 : 0.35)).setTint(0xf2eef8).setAlpha(grande ? 0.9 : 0.5).setDepth(29);
    this.tweens.add({
      targets: h, x: x + Phaser.Math.Between(grande ? 30 : -40, grande ? 180 : 40), y: y - Phaser.Math.Between(140, 280),
      scale: tam * (grande ? 2.4 : 2) * (normal ? 2.5 : 1), alpha: 0, angle: Phaser.Math.Between(-40, 40), duration: grande ? 2000 : 1500, ease: 'Sine.out', onComplete: () => h.destroy(),
    });
  }

  tos() {
    this.inhala = 0;
    this.combo = 0;
    this.textoCombo.setText('¡Cof, cof!');
    if (this.sonidoCalada) this.sonidoCalada.stop();
    this.subido += 2;
    this.ocupado = 1.4;
    this.pose('vuper', 'tos', 1400);
    this.actores.vuper.hincha = 0.92;
    sfx(this, 'tos-grande');
    this.cameras.main.shake(500, 0.012);
    const p = this.boca('vuper');
    for (let i = 0; i < 9; i++) this.time.delayedCall(i * 70, () => this.voluta(p.x + 10, p.y + 10, 0.24, true));
    // Los colegas se parten.
    this.time.delayedCall(350, () => {
      this.pose('lasslow', 'riendo', 1600);
      this.pose('blancaso', 'riendo', 1600);
      sfx(this, 'risa-fondo', { volume: 0.5 });
    });
  }

  // ---------- Pasarlo ----------

  // Vuelo del porro de una mano a otra (en arco y girando, con la brasa).
  volarPorro(de, a, alAcabar) {
    const porro = this.add.image(de.x, de.y, 'porrito').setDepth(32);
    const brasa = this.add.circle(0, 0, 5, 0xff7a2f).setDepth(33);
    this.tweens.addCounter({
      from: 0, to: 1, duration: 620, ease: 'Sine.inOut',
      onUpdate: tw => {
        const v = tw.getValue();
        porro.x = Phaser.Math.Linear(de.x, a.x, v);
        porro.y = Phaser.Math.Linear(de.y, a.y, v) - Math.sin(v * Math.PI) * 120;
        porro.angle += 6;
        brasa.setPosition(porro.x - Math.cos(Phaser.Math.DegToRad(porro.angle)) * 26, porro.y - Math.sin(Phaser.Math.DegToRad(porro.angle)) * 26);
      },
      onComplete: () => { porro.destroy(); brasa.destroy(); if (alAcabar) alAcabar(); },
    });
    sfx(this, 'whoosh', { volume: 0.3 });
  }

  mano(id) {
    const b = this.boca(id);
    return { x: b.x, y: b.y + 30 };
  }

  // Pasarlo: cada vez puede pasar una cosa distinta con el colega (y se puede ir de ronda).
  pasar() {
    if (this.acabado || this.ocupado > 0 || this.inhala > 0) return;
    this.pases++;
    this.porro -= 10;
    // En la historia del blancazo, el primer pase es para Blancaso (es lo que pide el objetivo).
    const primeroBlancaso = desdeCapId('blancazo') && stat('blancasoFumo') < 1;
    const id = (this.pases % 2 === 1) !== primeroBlancaso ? 'lasslow' : 'blancaso';
    const otro = id === 'lasslow' ? 'blancaso' : 'lasslow';
    const desde = this.puntaPorro() || this.boca('vuper');
    this.porroFuera = true;
    this.pose('vuper', 'pasar', 900);
    if (id === 'blancaso') this.blancasoFumo = true;
    const variantes = ['normal', 'larga', 'aros', 'pillado', 'ronda', 'anecdota'].filter(v => v !== this.ultimaVariante);
    const v = Phaser.Utils.Array.GetRandom(variantes);
    this.ultimaVariante = v;
    const ANECDOTAS = {
      lasslow: ['Una vez me reí en un funeral. Era el mío. Bueno, casi.', 'Yo de joven era un culo inquieto. Ahora soy un culo con pajarita.'],
      blancaso: ['La última vez que fumé así cuadré las cuentas. Mentira.', 'Cuando era copo, nevaba más. Ahora solo me derrito.'],
    };
    const devolver = (quien, retraso) => this.time.delayedCall(retraso, () => this.volarPorro(this.mano(quien), { x: desde.x - 20, y: desde.y }, () => {
      this.porroFuera = false;
      if (!this.acabado) this.pose('vuper', 'base');
    }));
    const duracion = { normal: 3200, larga: 3900, aros: 3900, pillado: 5200, ronda: 5600, anecdota: 4200 }[v];
    this.ocupado = duracion / 1000 + 0.2;
    this.volarPorro({ x: desde.x - 20, y: desde.y }, this.mano(id), () => {
      this.pose(id, 'calada');
      sfx(this, 'calada', { volume: 0.45 });
    });
    if (v === 'normal') {
      this.time.delayedCall(1700, () => { this.exhalar(id, false); this.reaccionPase(id); });
      devolver(id, 2700);
    } else if (v === 'larga') {
      this.time.delayedCall(1400, () => this.cartel(`¡${QUIEN[id].nombre} se marca una calada eterna!`));
      this.time.delayedCall(2400, () => {
        this.pose(id, 'tos', 1500);
        sfx(this, 'tos-grande', { volume: 0.7 });
        const p = this.boca(id);
        for (let i = 0; i < 7; i++) this.time.delayedCall(i * 70, () => this.voluta(p.x, p.y, 0.24, true));
        this.time.delayedCall(500, () => { this.pose('vuper', 'riendo', 1200); sfx(this, 'risa-fondo', { volume: 0.4 }); });
      });
      devolver(id, 3400);
    } else if (v === 'aros') {
      this.time.delayedCall(1700, () => {
        this.pose(id, 'suelta', 1200);
        this.cartel(`${QUIEN[id].nombre} también sabe hacer aros`);
        const p = this.boca(id);
        for (let i = 0; i < 3; i++) this.time.delayedCall(i * 260, () => this.aro(p.x + 20, p.y - 10, id === 'lasslow' ? 60 + i * 30 : -60 - i * 30, 0.9));
        this.time.delayedCall(900, () => { this.pose('vuper', 'riendo', 1000); this.decir(this.actores.vuper, '¡Eh, que esos son míos!'); });
      });
      devolver(id, 3400);
    } else if (v === 'pillado') {
      // Se queda pillado con el porro en la mano: se para todo un momento.
      this.time.delayedCall(1500, () => {
        this.cartel(`${QUIEN[id].nombre} se ha quedado pillado…`);
        const a = this.actores[id];
        this.tweens.add({ targets: a.img, angle: id === 'lasslow' ? -6 : 6, duration: 600, yoyo: true, repeat: 1 });
      });
      this.time.delayedCall(3200, () => { this.pose('vuper', 'pasar', 900); this.decir(this.actores.vuper, '¡Eh! ¡Que es para hoy!'); });
      this.time.delayedCall(4000, () => { this.exhalar(id, false); this.decir(this.actores[id], '¿Eh? Ah, sí. Toma, toma.'); });
      devolver(id, 4600);
    } else if (v === 'ronda') {
      // Se lo pasa al otro y vuelve después de la ronda.
      this.time.delayedCall(1700, () => {
        this.exhalar(id, false);
        this.volarPorro(this.mano(id), this.mano(otro), () => { this.pose(otro, 'calada'); sfx(this, 'calada', { volume: 0.4 }); });
        this.cartel('¡Ronda!');
        if (otro === 'blancaso') this.blancasoFumo = true;
      });
      this.time.delayedCall(3700, () => { this.exhalar(otro, false); this.reaccionPase(otro); });
      devolver(otro, 4700);
    } else {
      this.time.delayedCall(1700, () => {
        this.exhalar(id, false);
        this.pose(id, 'riendo', 2200);
        this.decir(this.actores[id], Phaser.Utils.Array.GetRandom(ANECDOTAS[id]));
      });
      devolver(id, 3600);
    }
  }

  reaccionPase(id) {
    if (id === 'lasslow') {
      const r = Phaser.Utils.Array.GetRandom([
        ['riendo', '¡JAJAJA… espera, ¿de qué me río?', 'risa-lasslow'], ['riendo', 'Qué buen rollo, caballeros.', 'pop'], ['tos', 'Cof… sigo siendo un señor. Cof.', 'tos-pequena'],
      ]);
      this.pose('lasslow', r[0], 1800);
      sfx(this, r[2]);
      this.decir(this.actores.lasslow, r[1]);
    } else {
      const r = Phaser.Utils.Array.GetRandom([
        ['tos', 'Esto… está fuerte, ¿no?', 'suspiro'], ['riendo', 'Hoy sí. Hoy disfruto.', 'aaah'], ['tos', 'Me están dando ganas de cuadrar las cuentas. Mal síntoma.', 'suspiro'],
      ]);
      this.pose('blancaso', r[0], 1600);
      sfx(this, r[2]);
      this.decir(this.actores.blancaso, r[1]);
    }
  }

  // Visitas sorpresa en el sofá: cada rato pasa algo distinto.
  suceso() {
    if (this.acabado || this.ocupado > 0 || this.inhala > 0 || this.mundo !== 'humo') return;
    const opciones = ['puky', 'perico', 'pompa', 'palicaso', 'cotine', 'luces'].filter(o => o !== this.ultimoSuceso);
    const o = Phaser.Utils.Array.GetRandom(opciones);
    this.ultimoSuceso = o;
    this.ocupado = 2.5;
    const entra = (clave, x, y, alto) => {
      const img = this.add.image(x, y, clave).setOrigin(0.5, 1).setDepth(12);
      img.setScale(alto / img.height);
      return img;
    };
    if (o === 'puky') {
      const img = entra('puky', 640, 760, 120);
      this.tweens.add({ targets: img, y: 660, duration: 400, ease: 'Back.out' });
      this.time.delayedCall(400, () => { sfx(this, 'blurp'); this.decir({ img }, '¿Me llamabais?'); ['lasslow', 'blancaso'].forEach(id => this.pose(id, 'tos', 1500)); });
      this.time.delayedCall(2000, () => this.tweens.add({ targets: img, y: 800, duration: 300, onComplete: () => img.destroy() }));
    } else if (o === 'perico') {
      const img = entra('perico-volando', -100, 260, 120);
      sfx(this, 'pin-pin');
      this.tweens.add({ targets: img, x: ANCHO + 120, duration: 1800, ease: 'Sine.inOut', onComplete: () => img.destroy() });
      this.time.delayedCall(800, () => this.cartel('¡Perico se lleva el mechero! Pin pin'));
    } else if (o === 'pompa') {
      const img = entra('pompa', 640, -40, 130);
      this.tweens.add({ targets: img, y: 200, duration: 900, ease: 'Sine.out', yoyo: true, hold: 900, onComplete: () => img.destroy() });
      this.time.delayedCall(950, () => this.decir({ img }, '…Huele bien aquí abajo. Vuelvo arriba.'));
    } else if (o === 'palicaso') {
      const img = entra('palicaso-contando', ANCHO + 80, 420, 150);
      this.tweens.add({ targets: img, x: ANCHO - 120, duration: 400, ease: 'Back.out' });
      this.time.delayedCall(450, () => { this.decir({ img }, '¡Escucha, escucha! ¿Qué le dice el sofá al cojín? ¡Que no se levante nadie!'); sfx(this, 'rimshot'); });
      this.time.delayedCall(1800, () => { this.pose('lasslow', 'riendo', 1500); sfx(this, 'risa-lasslow', { volume: 0.6 }); });
      this.time.delayedCall(2300, () => this.tweens.add({ targets: img, x: ANCHO + 120, duration: 300, onComplete: () => img.destroy() }));
    } else if (o === 'cotine') {
      const img = entra('cotine', -80, 640, 170);
      this.tweens.add({ targets: img, x: 180, duration: 600, ease: 'Sine.out' });
      this.time.delayedCall(650, () => this.decir({ img }, '¿Alguien quiere tarta? …¿No? Pues me la como.'));
      this.time.delayedCall(1700, () => { sfx(this, 'nam'); this.tweens.add({ targets: img, scaleX: img.scaleX * 1.15, duration: 120, yoyo: true, repeat: 2 }); });
      this.time.delayedCall(2300, () => this.tweens.add({ targets: img, x: -100, duration: 400, onComplete: () => img.destroy() }));
    } else {
      this.cartel('…¿Habéis visto eso?');
      this.cameras.main.flash(250, 182, 140, 255);
      this.time.delayedCall(300, () => this.cameras.main.flash(200, 255, 95, 162));
      ['lasslow', 'blancaso'].forEach(id => this.pose(id, 'riendo', 1200));
      sfx(this, 'neon', { volume: 0.4 });
    }
  }

  decir(actor, linea) {
    if (this.burbuja) this.burbuja.destroy();
    const img = actor.img;
    const visible = img.displayHeight * (this.mundo === 'normal' ? SENTADO : 1);
    this.burbuja = bocadillo(this, Phaser.Math.Clamp(img.x, 240, ANCHO - 240), Math.max(130, img.y - visible - 50), linea, { tam: 24, ancho: 400 });
    const b = this.burbuja;
    this.time.delayedCall(2600, () => { if (b.active) b.destroy(); });
  }

  charlaSofa() {
    if (this.acabado || this.ocupado > 0) return;
    const id = Math.random() < 0.5 ? 'lasslow' : 'blancaso';
    this.pose(id, 'riendo', 1500);
    this.decir(this.actores[id], Phaser.Utils.Array.GetRandom(CHARLAS_SOFA[id]));
  }

  // ---------- Hace efecto: del mundo normal al humo ----------

  haceEfecto() {
    if (this.acabado) return;
    const v = this.actores.vuper;
    if (v.vuelta) v.vuelta.remove();
    this.rompiendo = true;
    v.img.setTexture('vn-rotura').setOrigin(0.5, SENTADO).setCrop(0, 0, v.img.width, v.img.height * SENTADO);
    v.esc = SITIO.vuper.alto.normal / (v.img.height * SENTADO);
    v.rebote = 1.3;
    sfx(this, 'temblor');
    sfx(this, 'zumbido-m', { volume: 0.6 });
    this.cameras.main.shake(900, 0.014);
    this.cameras.main.flash(500, 230, 255, 160);
    const t = texto(this, ANCHO / 2, 230, 'Hace efecto…', 64, COLOR.amarillo).setDepth(60).setScale(0);
    this.tweens.add({ targets: t, scale: 1, duration: 400, ease: 'Back.out' });
    this.time.delayedCall(1200, () => cortinaHumo(this, () => {
      t.destroy();
      this.mundo = 'humo';
      this.rompiendo = false;
      this.bg.setTexture('bg-sofa');
      Object.keys(this.actores).forEach(id => this.pose(id, 'base'));
      destaparHumo(this);
      golpeTexto(this, ANCHO / 2, 250, 'Mundo humo', COLOR.rosa, 60);
      this.ocupado = 0.6;
    }));
  }

  terminar() {
    if (this.acabado) return;
    this.acabado = true;
    if (this.sonidoCalada) this.sonidoCalada.stop();
    this.cameras.main.setRotation(0);
    // Nada vivo debajo del panel final: medidor a cero y fuera los botones.
    this.inhala = 0;
    this.aguantando = false;
    this.barraCalada.setSize(28, 0);
    this.botones.forEach(b => b.destroy());
    ESTADO.colocon = Math.min(100, ESTADO.colocon + this.subido);
    ESTADO.hambre = Math.min(100, ESTADO.hambre + 15);
    const historiaBlancazo = desdeCapId('blancazo');
    if (this.blancasoFumo && !ESTADO.blancazo && historiaBlancazo) ESTADO.blancazoEn = 12;
    if (this.subido > 0) sumarStat('fumadas');
    if (this.blancasoFumo && historiaBlancazo) sumarStat('blancasoFumo');
    const premio = this.perfectas * 2 + this.pases * 3;
    ESTADO.monchis += premio;
    Object.assign(ESTADO, { sala: 'dentro', x: 260, y: 600 });
    guardarPartida();
    this.pose('vuper', 'riendo');
    const c = this.add.container(ANCHO / 2, ALTO / 2).setDepth(700).setScale(0);
    const g = this.add.graphics();
    g.fillStyle(HEX.morado, 1).fillRoundedRect(-380, -200, 760, 400, 34);
    g.lineStyle(8, HEX.tinta, 1).strokeRoundedRect(-380, -200, 760, 400, 34);
    c.add(g);
    c.add(texto(this, 0, -130, this.porro <= 0 ? 'Se acabó el porro' : 'Te levantas del sofá', 46, COLOR.amarillo));
    c.add(texto(this, 0, -30, `Caladas perfectas: ${this.perfectas} · Pases: ${this.pases}\nColocón +${Math.round(this.subido)} · +${premio} monchis de buen rollo`, 26, COLOR.crema, 700));
    c.add(texto(this, 0, 60, 'Te está entrando un hambre…', 26, COLOR.rosa));
    const salir = () => irA(this, 'Barrio', { aviso: '¡Monchis! Busca la tienda' });
    c.add(boton(this, 0, 140, 'Al barrio (E)', salir, { ancho: 300 }));
    this.tweens.add({ targets: c, scale: 1, duration: 380, ease: 'Back.out' });
    this.input.keyboard.once('keydown-E', salir);
    this.input.keyboard.once('keydown-ENTER', salir);
  }
}

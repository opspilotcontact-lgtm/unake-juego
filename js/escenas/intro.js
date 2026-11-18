// La entrada en frío del piloto «¿Una qué?» (guion-v3), contada en viñetas jugables (vinetas.js), sin vídeo.
// Estructura CANON: Perico «contraseña» en bucle → «¿…Unaké?» → «¿Una quéeee?» → los recuerdos metidos unos
// dentro de otros → la salida al revés → negro → intro → despertador, «milmonchista». El día sigue en el
// barrio (guia.js) y acaba como empieza: en la misma puerta (escenas/puerta.js).
// Enseña los dos mundos sin explicarlos: esto es de noche y con humo; el despertar, de día y normal.
// Cada 2-4 bocadillos la mano es del jugador (elegir, pulsar rápido, mantener, quedarse quieto).
// Lo que no está en el guion (la mano que se queda pequeña, el hilo amarillo, los palotes al pasar página)
// es PROPUESTA para el juego.

const TINTA_MANO = 'UNAKÉ ·\nUNA ASO ·\nDE ~~~';

// Los sitios del piloto, montados como plano (se usan al bajar y otra vez, al revés, al salir).
const PLANOS_PILOTO = {
  puerta(v) {
    v.fondo('bg-fuera', { x: -220, y: -332, origen: 0, escala: 1.5 });
    v.poner(v.s.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.22));
    v.actor('perico', 'perico', 812, 402, 204);
  },
  palicaso(v) {
    v.fondo('bg-dentro');
    v.actor('vuper', 'vuper-colocado', 330, 700, 210);
    v.actor('palicaso', 'palicaso-contando', 880, 700, 300, { flota: true });
  },
  lasslow(v) {
    v.fondo('bg-dentro', { escala: 1.45, x: 420, y: 380 });
    v.actor('vuper', 'vuper', 330, 700, 190);
    v.actor('lasslow', 'lasslow-digno', 860, 700, 310);
  },
  cotine(v, { entera = false } = {}) {
    v.fondo('bg-cocina');
    v.actor('vuper', 'vuper', 290, 700, 190);
    v.actor('cotine', 'cotine', 960, 700, 320);
    v.tarta = PLANOS_PILOTO.tarta(v, 600, 450, entera);
  },
  // La tarta de la contraseña: plato, bizcocho y glaseado con letras (se van comiendo por el final).
  tarta(v, x, y, entera) {
    const s = v.s;
    const c = s.add.container(x, y);
    const g = s.add.graphics();
    g.fillStyle(0xffffff, 1).lineStyle(6, HEX.tinta, 1).fillEllipse(0, 70, 360, 70).strokeEllipse(0, 70, 360, 70);
    g.fillStyle(0xd98a4a, 1).fillRoundedRect(-150, -20, 300, 96, 18).strokeRoundedRect(-150, -20, 300, 96, 18);
    g.fillStyle(0xffc6dc, 1).fillEllipse(0, -20, 300, 70).strokeEllipse(0, -20, 300, 70);
    const vela = s.add.rectangle(0, -78, 14, 52, 0xfff6e8).setStrokeStyle(4, HEX.tinta);
    const llama = s.add.ellipse(0, -112, 16, 26, 0xffb000).setStrokeStyle(3, HEX.tinta);
    c.add([g, vela, llama]);
    const palabras = ['DE', 'LOS', 'HERMANOS', 'ASO'];
    c.palabras = palabras.map((p, i) => {
      const t = s.add.text(-104 + [0, 52, 0, 0][i], [-38, -38, -14, 10][i], p, { fontFamily: FUENTE, fontSize: '22px', color: '#a0306a' });
      if (i === 2) t.setX(-64);
      if (i === 3) t.setX(-24);
      c.add(t);
      return t;
    });
    c.vela = [vela, llama];
    if (!entera) c.setScale(0.98);
    v.poner(c);
    return c;
  },
  // Mientras lees (pulsas), Cotine se come la tarta por el final: «ASO», «HERMANOS», «LOS».
  comer(v, n) {
    const p = v.tarta && v.tarta.palabras;
    const k = [4, 8, 11].indexOf(n);
    if (!p || k < 0) return;
    const quitar = [p[3], p[2], p[1]][k];
    if (!quitar || !quitar.visible) return;
    quitar.setVisible(false);
    sfx(v.s, 'nam', { volume: 0.5 });
    v.letrero('ñam', 960, 330, COLOR.rosa, 34);
  },
  pompa(v) {
    v.fondo('bg-techo');
    const s = v.s;
    v.burbuja = v.poner(s.add.circle(380, 420, 160, UNAKE.cian, 0.22).setStrokeStyle(6, HEX.tinta));
    v.poner(s.add.ellipse(320, 340, 60, 30, 0xffffff, 0.6).setAngle(-30));
    v.actor('vuper', 'vuper', 380, 520, 180);
    v.actor('pompa', 'pompa-mira', 900, 620, 250, { flota: true });
  },
  blancaso(v) {
    v.fondo('bg-sofa');
    v.actor('vuper', 'vuper', 330, 700, 190);
    v.actor('blancaso', 'blancaso', 860, 700, 320);
    // Su nubecita le nieva encima: cuatro copos, lentos, solo sobre él.
    const s = v.s;
    for (let i = 0; i < 5; i++) {
      const copo = v.poner(s.add.circle(800 + i * 30, 330, 6, 0xffffff, 0.9));
      s.tweens.add({ targets: copo, y: 560, x: copo.x + Phaser.Math.Between(-20, 20), alpha: 0, duration: 2600, delay: i * 520, repeat: -1 });
    }
  },
  puky(v) {
    v.fondo('bg-canerias', { oscuro: 0.72 });
    v.actor('vuper', 'vuper', 330, 700, 180);
    v.actor('puky', 'puky', 880, 700, 290);
  },
};

// Páginas de palotes de Blancaso: grupos de cinco (cuatro y uno cruzado), cada página más llena.
function dibujarPalotes(g, n, x0, y0, ancho, alto, tam = 34) {
  const sep = tam * 1.9;
  const porFila = Math.max(1, Math.floor(ancho / sep));
  for (let k = 0; k < n; k++) {
    const x = x0 + (k % porFila) * sep, y = y0 + Math.floor(k / porFila) * (tam + 14);
    if (y + tam > y0 + alto) break;
    g.lineStyle(4, 0x2b3fd6, 1);
    for (let p = 0; p < 4; p++) g.lineBetween(x + p * 8, y, x + p * 8 + 2, y + tam);
    g.lineBetween(x - 6, y + tam * 0.7, x + 32, y + tam * 0.25);
  }
}

class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }

  create(datos) {
    this._despierto = false; // scene.start reutiliza la instancia: se resetea en cada partida
    this.tema = null;
    this.cameras.main.setBackgroundColor('#000000');
    entrar(this, datos);
    if (typeof Musica !== 'undefined') Musica.silencio();
    this.time.delayedCall(250, () => {
      this.vineta = Vinetas.ver(this, this.guion(), () => this.despertar('Otra vez ese sueño…'), { alSaltar: () => this.despertar() });
    });
  }

  // Fue un recuerdo de anoche: la partida nueva empieza de día, en tu cuarto, sin colocón.
  despertar(frase) {
    if (this._despierto) return;
    this._despierto = true;
    if (this.tema) this.tema.stop();
    ESTADO.introVista = true;
    if ((ESTADO.introCap ?? -1) < 0) Object.assign(ESTADO, { colocon: 0, sala: 'cuarto', x: 420, y: 600 });
    guardarPartida();
    irA(this, 'Barrio', { rotulo: frase || 'A la mañana siguiente…' });
  }

  guion() {
    const s = this;
    const V = Vinetas;
    const pregunta = (flojo, extra = {}) => V.pulsa(flojo > 0.8 ? '«¿De quién es la aso?»' : '«…¿de quién es la aso?»', { flojo, ...extra });
    return [
      // ---------- 1 · LA PUERTA (mundo humo, de noche) ----------
      V.dice('off', 'Contraseña. Contraseña. Contraseña…', { x: ANCHO / 2, y: ALTO / 2, ms: 2200 }),
      V.corte('iris', v => { PLANOS_PILOTO.puerta(v); V.mundo(v, true); if (typeof Musica !== 'undefined') Musica.poner(s, 'noche'); }),
      V.dice('perico', 'Contraseña. Contraseña.', { ms: 1500 }),
      // Mientras repite, la gente entra sin decirla (vuelta de hoja 1: no se subraya).
      V.hacer(v => {
        const c = s.textures.exists('obj-cotine-hinchada') ? v.poner(s.add.image(-160, 330, 'obj-cotine-hinchada').setScale(0.7)) : null;
        if (c) s.tweens.add({ targets: c, x: 760, y: -260, duration: 3600, ease: 'Sine.inOut' });
      }),
      V.dice('perico', 'Contraseña. Contraseña.', { ms: 1700 }),
      V.hacer(v => {
        const l = v.actor('lasslow', 'lasslow-digno', -120, 712, 250);
        if (!l) return;
        s.tweens.chain({ targets: l, tweens: [
          { x: 760, duration: 1500, ease: 'Sine.out' },
          { scaleX: -l.scaleX, duration: 120 },
          { x: 820, alpha: 0, duration: 450, ease: 'Quad.in', onStart: () => sfx(s, 'puerta', { volume: 0.5 }) },
        ] });
      }),
      V.dice('perico', 'Contraseña…', { ms: 2300 }),
      V.hacer(v => { const p = v.actor('puky', 'puky', 812, 900, 210); if (p) s.tweens.add({ targets: p, y: 790, duration: 380, ease: 'Back.out' }); }),
      V.dice('puky', '¿Me llamabais?', { y: 470, x: 812, ms: 1500 }),
      V.dice('perico', '¡Por debajo no! ¡Por debajo no!', { pose: 'perico-horror', ms: 1700 }),
      V.hacer(v => { v.mover('puky', { y: 1000 }, 300, 'Quad.in'); v.pose('perico', 'perico-silbando'); }),
      V.dice('perico', '…Contraseña.', { ms: 1500 }),
      // Entra Vuper, encogido, con media contraseña en la mano.
      V.hacer(v => {
        const vu = v.actor('vuper', 'vuper', -140, 640, 220);
        if (vu) s.tweens.add({ targets: vu, x: 420, duration: 1100, ease: 'Sine.out', onComplete: () => flotar(s, vu, { amplitud: 6 }) });
      }),
      V.espera(1100),
      V.hacer(v => { v.manoPuerta = V.mano(v, TINTA_MANO, { x: 170, y: 190 }); }),
      V.pulsa('«¿…Unaké?»', { pista: 'Díselo. Bajito.' }),
      V.dice('vuper', '¿…Unaké?', { tam: 22, ms: 1100 }),
      V.hacer(v => v.pose('perico', 'perico-cotilleando')), // un segundo de ilusión: alguien se ha parado
      V.espera(550),
      (v, seguir) => { Comic.reaccion(s, 'perico-graznando', { color: UNAKE.rosa, ms: 600 }).then(seguir); },
      V.dice('perico', '¿Una quéeeee?', { pose: 'perico-graznando', ms: 1600 }),
      V.hacer(v => { if (v.manoPuerta) s.tweens.add({ targets: v.manoPuerta, scale: 1.15, duration: 200, yoyo: true, repeat: 1 }); }),
      V.pulsa('«¿Una… aso?»', { pista: 'Léelo de tu mano' }),
      V.dice('vuper', '¿Una… aso?', { ms: 1100 }),
      V.dice('perico', '¿De quién? ¿De quién?', { ms: 1600 }),
      V.pulsa('«…¿De…?»', { pista: 'Después de «DE», tinta corrida', flojo: 0.85 }),
      V.hacer(v => { v.quitarGlobo(); sfx(s, 'grillos', { volume: 0.5 }); v.letrero('cri, cri', 560, 470, COLOR.crema, 30); }),
      V.espera(1200),
      V.dice('perico', 'Nuevo. Nuevo.', { pose: 'perico-cotilleando', ms: 1500 }),
      // El arañazo detrás de la puerta (se recoge en los poscréditos: los palotes de la cara interior).
      V.hacer(v => { v.quitarGlobo(); sfx(s, 'toc-toc', { volume: 0.4 }); v.letrero('rasc', 900, 560, COLOR.crema, 34); }),
      V.espera(900),
      V.dice('perico', 'Te lo explico. Te lo explico.', { pose: 'perico-graznando', ms: 1700 }),

      // ---------- 2 · LOS RECUERDOS, unos dentro de otros ----------
      // Cada uno sabe la respuesta y falla por lo que es. La pregunta de Vuper sale cada vez más pequeña.
      V.corte('humo', v => PLANOS_PILOTO.palicaso(v)),
      V.dice('palicaso', '¡Escucha, escucha! ¡Esta no te la he contado!'),
      pregunta(1),
      V.dice('palicaso', '¡De quién va a ser! De los…', { pose: 'palicaso-contando' }),
      V.dice('palicaso', '¡Que esto me recuerda a una vez que Lasslow…!', { pose: 'palicaso-riendo' }),
      V.corte('estrella', v => PLANOS_PILOTO.lasslow(v)),
      V.dice('lasslow', 'Caballero. La contraseña es un asunto serio. Se dice sin reírse.'),
      pregunta(0.9),
      V.dice('lasslow', 'De los… No me mire así. De los her…', { pose: 'lasslow-aguantando' }),
      V.hacer(v => { v.pose('lasslow', 'lasslow-risa-floja'); v.quitarGlobo(); sfx(s, 'risa-lasslow', { volume: 0.6 }); v.letrero('¡JAJAJA!', 860, 300); }),
      V.espera(900),
      V.hacer(v => {
        v.pose('lasslow', 'lasslow-pedo');
        sfx(s, 'pedo', { volume: 0.6 });
        v.letrero('¡PRRRT!', 640, 320, COLOR.verde);
        v.mover('vuper', { x: -200, angle: -40 }, 520, 'Quad.in');
        v.mover('lasslow', { x: 1400 }, 520, 'Quad.in');
      }),
      V.espera(600),
      V.corte('barrido', v => PLANOS_PILOTO.cotine(v)),
      V.dice('cotine', 'La tarta de la contraseña. Para el nuevo. Así no se le olvida.'),
      // Leer la tarta antes de que se la coma: se come las palabras por el final.
      V.machaca({
        texto: '¡LEE!', pista: 'Pulsa rápido: léela antes de que se la coma', n: 14, ms: 2600, imposible: true,
        bien: '«De… los…»', mal: '«De… los…»',
        alPulsar: (v, n) => PLANOS_PILOTO.comer(v, n),
      }),
      V.hacer(v => { if (v.tarta) { v.tarta.palabras.forEach(t => t.setVisible(false)); v.tarta.vela.forEach(o => o.setVisible(false)); } }),
      V.dice('cotine', '¿Qué? Tenía hambre.'),
      V.hacer(v => { v.pose('cotine', 'cotine-plop'); sfx(s, 'hinchar', { volume: 0.5 }); v.mover('cotine', { y: 380, scaleX: '*=1.15', scaleY: '*=1.15' }, 700, 'Sine.out'); }),
      V.dice('cotine', '¡Me voy pa\'rriba!', { ms: 1300 }),
      V.corte('burbuja', v => PLANOS_PILOTO.pompa(v)),
      // En la burbuja todo suena lejos y por primera vez Vuper está quieto.
      pregunta(0.75, { pista: 'Aquí arriba no hay prisa' }),
      V.espera(1800),
      V.dice('pompa', '…Una aso.', { ms: 1800 }),
      V.dice('vuper', '…Eso me lo preguntaron hace cinco preguntas.'),
      V.dice('off', '¡Pompa! ¡Ronda!', { x: 640, y: 640, ms: 1300 }),
      V.dice('pompa', 'Yo no, que exploto.', { ms: 1600 }),
      V.hacer(v => { v.pose('pompa', 'pompa-hinchada'); v.quitarGlobo(); sfx(s, 'hinchar', { volume: 0.5 }); }),
      V.espera(600),
      V.hacer(v => { v.pose('pompa', 'pompa-plop'); sfx(s, 'plop', { volume: 0.7 }); v.letrero('¡PLOP!', 900, 300, COLOR.azul); if (v.burbuja) v.burbuja.setVisible(false); }),
      V.espera(500),
      V.corte('barrido', v => PLANOS_PILOTO.blancaso(v)),
      V.dice('blancaso', 'Otra vez no…', { ms: 1500 }),
      pregunta(0.6),
      V.dice('blancaso', 'Mía. Y de mi hermano.'),
      V.dice('vuper', 'Ya. Pero la contraseña.'),
      V.dice('blancaso', '¿Para qué? Mañana no te acuerdas.'),
      // La agenda: páginas y páginas de palotes (vuelta de hoja 2: Vuper no es nuevo).
      V.hacer(v => {
        v.quitarGlobo();
        v.pose('blancaso', 'blancaso-cuenta');
        const c = s.add.container(640, 300).setScale(0);
        const papel = s.add.graphics().fillStyle(0xfff6e8, 1).lineStyle(6, HEX.tinta, 1).fillRoundedRect(-300, -170, 600, 340, 16).strokeRoundedRect(-300, -170, 600, 340, 16).lineBetween(0, -170, 0, 170);
        const g = s.add.graphics();
        c.add([papel, g]);
        v.agenda = { c, g, pagina: 0 };
        dibujarPalotes(g, 9, -270, -140, 250, 290);
        dibujarPalotes(g, 9, 30, -140, 250, 290);
        v.poner(c);
        s.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.out' });
      }),
      ...[0, 1].flatMap(k => [V.pulsa('Pasar la página', { pista: k === 0 ? 'Es su agenda' : '' }), V.hacer(v => {
        const a = v.agenda;
        if (!a) return;
        sfx(s, 'papel', { volume: 0.6 });
        a.g.clear();
        const tam = k === 0 ? 26 : 18;
        dibujarPalotes(a.g, 60, -270, -140, 250, 290, tam);
        dibujarPalotes(a.g, 60, 30, -140, 250, 290, tam);
        s.tweens.add({ targets: a.c, scaleX: 0.9, duration: 90, yoyo: true });
      })]),
      // Hace uno nuevo delante de él.
      V.hacer(v => {
        const a = v.agenda;
        if (!a) return;
        const nuevo = s.add.graphics();
        a.c.add(nuevo);
        s.tweens.addCounter({ from: 0, to: 1, duration: 500, onUpdate: tw => { nuevo.clear().lineStyle(7, 0xd92b2b, 1).lineBetween(250, 120, 250, 120 + 40 * tw.getValue()); } });
        sfx(s, 'zas', { volume: 0.4 });
      }),
      V.dice('blancaso', 'Siempre llegas hasta aquí.', { y: 560, x: 900 }),
      V.hacer(v => { if (v.agenda) s.tweens.add({ targets: v.agenda.c, scale: 0, duration: 200, ease: 'Back.in' }); }),
      V.dice('vuper', '¿Hasta aquí? ¿Y luego?'),
      // Por debajo de la puerta del fondo se cuela un hilo amarillo. Blancaso ni se gira.
      V.hacer(v => {
        const hilo = v.poner(s.add.graphics());
        s.tweens.addCounter({ from: 0, to: 1, duration: 1400, onUpdate: tw => {
          const k = tw.getValue();
          hilo.clear().lineStyle(9, 0xf2d23c, 1).beginPath();
          for (let x = 0; x <= 700 * k; x += 20) hilo.lineTo(ANCHO - x, 705 + Math.sin(x / 40) * 5);
          hilo.strokePath();
        } });
      }),
      V.dice('blancaso', 'Luego viene ese.', { ms: 1700 }),
      V.corte('iris', v => PLANOS_PILOTO.puky(v)),
      // ---------- PUKY, el fondo ----------
      V.hacer(v => { const p = v.actores.puky; if (p) { p.img.setAlpha(0.15); s.tweens.add({ targets: p.img, alpha: 1, duration: 900 }); } sfx(s, 'goteo', { volume: 0.5 }); }),
      V.espera(900),
      V.dice('puky', '¿Me llamabais?', { pose: 'puky-que-rico' }),
      V.dice('vuper', 'No.', { ms: 1000 }),
      V.dice('puky', 'Nunca me llamáis. …Pero siempre venís.'),
      pregunta(0.45),
      V.dice('puky', '¡De los blbl-blblbl blbl!', { estilo: 'ondulado' }),
      V.dice('vuper', '¿Qué?', { ms: 900 }),
      V.dice('puky', 'Espera, que te lo digo al oído.', { pose: 'puky-estirado' }),
      V.machaca({
        texto: '¡HUYE!', pista: 'Pulsa rápido', n: 40, ms: 2000, imposible: true, mal: 'Siempre llega.',
        alPulsar: v => { v.mover('vuper', { x: '-=7' }, 80); v.mover('puky', { x: '-=9' }, 80); },
      }),
      V.hacer(v => v.mover('puky', { x: (v.actores.vuper ? v.actores.vuper.img.x + 120 : 450) }, 260, 'Quad.in')),
      V.espera(260),
      V.corte('pringue', v => { PLANOS_PILOTO.puky(v); v.actores.vuper && v.actores.vuper.img.setTint(0xf2d23c); v.letrero('¡BLURP!', 640, 300, COLOR.amarillo, 72); }),
      V.espera(700),

      // ---------- 3 · LA SALIDA, al revés y cada vez más rápido ----------
      (v, seguir) => this.salida(v, seguir),

      // ---------- 4 · LA INTRO ----------
      V.corte('seco', v => {
        const t = s.textures.exists('titulo') ? v.poner(s.add.image(ANCHO / 2, -200, 'titulo').setScale(0.7)) : null;
        if (t) s.tweens.add({ targets: t, y: ALTO / 2 - 20, duration: 900, ease: 'Bounce.out', delay: 300 });
        this.tema = sfx(s, 'musica-intro', { volume: 0.55 });
      }),
      V.espera(3200),
      // ---------- 5 · EL DESPERTAR (mundo normal, de día) ----------
      V.hacer(v => { if (this.tema) { s.tweens.add({ targets: this.tema, volume: 0, duration: 500, onComplete: () => this.tema && this.tema.stop() }); } }),
      V.corte('seco', v => { v.letrero('RIIIIING', ANCHO / 2, ALTO / 2, COLOR.amarillo, 80); [0, 260, 520].forEach(ms => s.time.delayedCall(ms, () => sfx(s, 'campanita', { volume: 0.5 }))); }),
      V.espera(1100),
      V.corte('barrido', v => {
        v.fondo((typeof SALAS !== 'undefined' && SALAS.cuarto && SALAS.cuarto.fondoN) || 'bgn-cuarto');
        V.mundo(v, false);
        const vu = v.actor('vuper', 'vn-sorprendido', 560, 900, 420);
        if (vu) {
          vu.setTint(0xf2d23c, 0xffffff, 0xffffff, 0xffffff); // el pelo un poco amarillo, por un lado
          s.tweens.add({ targets: vu, y: 720, duration: 260, ease: 'Back.out' });
        }
      }),
      V.hacer(v => { Comic.emote(s, 640, 330, 'gota', { profundidad: 990 }); }),
      V.espera(700),
      // Se sacude el pelo y se le va el amarillo.
      V.hacer(v => {
        const a = v.actores.vuper;
        if (!a) return;
        s.tweens.add({ targets: a.img, angle: 6, duration: 70, yoyo: true, repeat: 3 });
        v.tras(600, () => { if (a.img.scene) { a.img.clearTint(); a.img.setAngle(0); } });
      }),
      V.espera(650),
      V.pulsa('Mirarte la mano', { pista: 'Anoche la llevabas escrita' }),
      V.hacer(v => { v.manoCuarto = V.mano(v, '', { x: 960, y: 260, pie: 'Limpia.' }); }),
      V.espera(900),
      V.dice('vuper', 'Joder, joder, joder. Qué mierda ser milmonchista y tener que currar.', { pose: 'vn-hablando' }),
      V.hacer(v => {
        if (v.manoCuarto) v.manoCuarto.destroy();
        const m = s.textures.exists('obj-movil') ? v.poner(s.add.image(980, 330, 'obj-movil').setScale(0.6)) : null;
        const t = v.poner(texto(s, 980, 520, 'NUEVO PEDIDO', 30, COLOR.verde));
        if (m) s.tweens.add({ targets: m, angle: 6, duration: 60, yoyo: true, repeat: 7 });
        sfx(s, 'tiroriro', { volume: 0.5 });
        t.setScale(0);
        s.tweens.add({ targets: t, scale: 1, duration: 240, ease: 'Back.out' });
      }),
      V.espera(900),
      V.dice('vuper', 'Vale, vale…', { pose: 'vuper-normal', ms: 1500 }),
    ];
  }

  // La salida: todos los sitios en orden inverso, uno por plano y cada vez más rápido. En la cocina, durante
  // un instante, la tarta se lee entera («DE LOS HERMANOS ASO») y Vuper pasa de espaldas sin verla.
  // Al final todo el mundo humo se encoge en una bocanada que se aleja. Tocar acelera hasta el negro.
  salida(v, seguir) {
    const s = this;
    const planos = [
      v2 => { PLANOS_PILOTO.blancaso(v2); },
      v2 => { PLANOS_PILOTO.pompa(v2); },
      v2 => { PLANOS_PILOTO.cotine(v2, { entera: true }); v2.actores.vuper && v2.actores.vuper.img.setFlipX(true); },
      v2 => { PLANOS_PILOTO.lasslow(v2); v2.pose('lasslow', 'lasslow-serio'); },
      v2 => { PLANOS_PILOTO.palicaso(v2); },
      v2 => { PLANOS_PILOTO.puerta(v2); },
    ];
    let i = 0, prisa = false;
    v.alTocar = () => { prisa = true; };
    const paso = () => {
      if (!v.vivo) return;
      if (i >= planos.length) return encoger();
      v.limpiarPlano();
      planos[i](v);
      v.poner(s.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0xf2d23c, 0.18)); // todo un poco amarillo
      sfx(s, 'fiu', { volume: 0.35 });
      const ms = prisa ? 120 : (i === 2 ? 520 : Math.max(240, 480 - i * 50));
      i += 1;
      v.tras(ms, paso);
    };
    const encoger = () => {
      sfx(s, 'whoosh', { volume: 0.5 });
      s.tweens.add({
        targets: v.escenario, scale: 0.02, x: ANCHO / 2, y: ALTO / 2, alpha: 0.2, duration: prisa ? 250 : 700, ease: 'Quad.in',
        onComplete: () => { v.limpiarPlano(); v.escenario.setScale(1).setPosition(0, 0).setAlpha(1); v.alTocar = null; v.tras(prisa ? 300 : 1200, seguir); },
      });
    };
    paso();
  }
}

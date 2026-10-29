// Lo que hace que el barrio tire para volver: logros (para siempre), los retos de cada noche
// (tres al día, cambian con la fecha) y los sucesos del barrio (cosas que pasan solas y que se
// pueden pillar al vuelo). Todo se mide con los contadores de historia.js (stat / sumarStat).

// ---------- Logros ----------

const LOGROS = [
  { id: 'calada1', nombre: 'Bienvenido al humo', texto: 'Fúmate el primero en el sofá', hecho: () => stat('fumadas') >= 1, premio: 20 },
  { id: 'calada10', nombre: 'El sofá tiene tu forma', texto: 'Fúmate 10', hecho: () => stat('fumadas') >= 10, premio: 80 },
  { id: 'calada30', nombre: 'Leyenda del sofá', texto: 'Fúmate 30', hecho: () => stat('fumadas') >= 30, premio: 250 },
  { id: 'comer10', nombre: 'Monchis profesional', texto: 'Come 10 veces', hecho: () => stat('comidas') >= 10, premio: 40 },
  { id: 'comer50', nombre: 'Agujero negro', texto: 'Come 50 veces', hecho: () => stat('comidas') >= 50, premio: 200 },
  { id: 'rider10', nombre: 'Rider del mes', texto: 'Haz 10 encargos de la tienda', hecho: () => stat('entregas') >= 10, premio: 60 },
  { id: 'rider8', nombre: 'Sin frenos', texto: 'Racha de 8 encargos seguidos', hecho: () => leerRecord('Reparto') >= 8, premio: 120 },
  { id: 'gana10', nombre: 'Esto se me da bien', texto: 'Gana 10 minijuegos', hecho: () => stat('victorias') >= 10, premio: 60 },
  { id: 'gana50', nombre: 'Rey de la aso', texto: 'Gana 50 minijuegos', hecho: () => stat('victorias') >= 50, premio: 300 },
  { id: 'una-mas', nombre: 'Una más y lo dejo', texto: 'Juega 100 minijuegos', hecho: () => stat('partidas') >= 100, premio: 400 },
  { id: 'estrellas10', nombre: 'Constelación', texto: 'Junta 10 estrellas', hecho: () => totalEstrellas() >= 10, premio: 80 },
  { id: 'estrellas20', nombre: 'Vía Láctea', texto: 'Junta 20 estrellas', hecho: () => totalEstrellas() >= 20, premio: 200 },
  { id: 'estrellas-todas', nombre: 'Estrella fugaz', texto: 'Las 3 estrellas en todos los minijuegos', hecho: () => Object.keys(MISIONES).every(k => (ESTADO.estrellas[k] || 0) >= 3), premio: 1000 },
  { id: 'rico', nombre: 'Forrado de monchis', texto: 'Ten 1.000 monchis a la vez', hecho: () => ESTADO.monchis >= 1000, premio: 50 },
  { id: 'ganados', nombre: 'Economía de barrio', texto: 'Gana 5.000 monchis en total', hecho: () => stat('monchisGanados') >= 5000, premio: 300 },
  { id: 'risas', nombre: 'Te ríes de todo', texto: 'JAJAJA a 20 cosas del móvil', hecho: () => stat('risas') >= 20, premio: 40 },
  { id: 'movil', nombre: 'Adicto al Humogram', texto: 'Mira 60 cosas en el móvil', hecho: () => stat('movil') >= 60, premio: 100 },
  { id: 'sit5', nombre: 'El que lo arregla todo', texto: 'Resuelve 5 problemas', hecho: () => stat('situaciones') >= 5, premio: 100 },
  { id: 'sit20', nombre: 'Psicólogo del barrio', texto: 'Resuelve 20 problemas', hecho: () => stat('situaciones') >= 20, premio: 400 },
  { id: 'blancazo3', nombre: 'Ángel de Blancaso', texto: 'Salva a Blancaso 3 veces', hecho: () => stat('blancazos') >= 3, premio: 150 },
  { id: 'rescate5', nombre: 'Amigo de Monchiman', texto: '5 rescates con la señal', hecho: () => stat('rescates') >= 5, premio: 120 },
  { id: 'trivial', nombre: 'Sabe de todo', texto: 'Acierta 10 preguntas del barrio', hecho: () => stat('trivial') >= 10, premio: 80 },
  { id: 'recados', nombre: 'Correveidile', texto: 'Cumple 10 recados', hecho: () => stat('recados') >= 10, premio: 80 },
  { id: 'perico', nombre: 'Amigo de Perico', texto: 'Juega 20 veces a la contraseña', hecho: () => stat('jugada_Contrasena') >= 20, premio: 80 },
  { id: 'negocio10', nombre: 'Empresario', texto: 'Negocio a nivel 10', hecho: () => cuentasNegocio().total >= 10, premio: 100 },
  { id: 'negocio25', nombre: 'Magnate del humo', texto: 'Negocio a nivel 25', hecho: () => cuentasNegocio().total >= 25, premio: 400 },
  { id: 'salas', nombre: 'Unaké crece', texto: 'Abre las tres ampliaciones', hecho: () => ['reservado', 'bano', 'techo'].every(s => negocio().salas[s]), premio: 300 },
  { id: 'deco3', nombre: 'Con gusto', texto: 'Pon 3 decoraciones', hecho: () => Object.keys(ESTADO.deco || {}).length >= 3, premio: 60 },
  { id: 'deco-todas', nombre: 'Interiorista', texto: 'Todas las decoraciones', hecho: () => DECORACION.every(d => (ESTADO.deco || {})[d.id]), premio: 500 },
  { id: 'sucesos', nombre: 'Ojo de halcón', texto: 'Pilla 15 sucesos del barrio', hecho: () => stat('sucesos') >= 15, premio: 120 },
  { id: 'amarillo', nombre: 'Ha sido el amarillo', texto: 'Desmáyate una vez (no presumas)', hecho: () => stat('desmayos') >= 1, premio: 10 },
  { id: 'retos', nombre: 'Constante', texto: 'Completa 9 retos de la noche', hecho: () => stat('retos') >= 9, premio: 200 },
  { id: 'noches3', nombre: 'Vuelves siempre', texto: 'Juega 3 noches distintas', hecho: () => stat('noches') >= 3, premio: 100 },
  { id: 'noches7', nombre: 'Parte del mobiliario', texto: 'Juega 7 noches distintas', hecho: () => stat('noches') >= 7, premio: 400 },
  { id: 'historia', nombre: 'La noche más larga', texto: 'Acaba la historia', hecho: () => historiaAcabada(), premio: 500 },
];

// Devuelve los logros recién conseguidos (y los apunta y paga).
function comprobarLogros() {
  ESTADO.logros = ESTADO.logros || {};
  const nuevos = LOGROS.filter(l => !ESTADO.logros[l.id] && l.hecho());
  nuevos.forEach(l => { ESTADO.logros[l.id] = Date.now(); ESTADO.monchis += l.premio; });
  if (nuevos.length) guardarPartida();
  return nuevos;
}

// ---------- Retos de la noche: tres por día, iguales para todo el que juegue ese día ----------

const RETOS = [
  { stat: 'partidas', n: 5, texto: 'Juega 5 minijuegos', premio: 60 },
  { stat: 'victorias', n: 3, texto: 'Gana 3 minijuegos', premio: 80 },
  { stat: 'fumadas', n: 2, texto: 'Fúmate 2 en el sofá', premio: 50 },
  { stat: 'comidas', n: 4, texto: 'Come 4 veces', premio: 40 },
  { stat: 'entregas', n: 4, texto: 'Haz 4 encargos de la tienda', premio: 60 },
  { stat: 'risas', n: 5, texto: 'Ríete de 5 cosas del móvil', premio: 30 },
  { stat: 'situaciones', n: 1, texto: 'Resuelve el problema de alguien', premio: 90 },
  { stat: 'monchisGanados', n: 300, texto: 'Gana 300 monchis', premio: 70 },
  { stat: 'sucesos', n: 3, texto: 'Pilla 3 sucesos del barrio', premio: 50 },
  { stat: 'recados', n: 2, texto: 'Cumple 2 recados', premio: 50 },
  { stat: 'trivial', n: 3, texto: 'Acierta 3 preguntas del barrio', premio: 40 },
  { stat: 'cobros', n: 3, texto: 'Cobra la caja de Unaké 3 veces', premio: 40, dentro: true },
  { stat: 'jugada_Barra', n: 2, texto: 'Sirve la barra 2 veces', premio: 50, dentro: true },
  { stat: 'jugada_Tarta', n: 2, texto: 'Ayuda a Cotine 2 veces', premio: 50, dentro: true },
];
const PREMIO_TRES_RETOS = 100;

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Los retos de hoy: si ha cambiado el día, se eligen otros (con la fecha de semilla) y se
// apunta una noche más jugada.
function retosDeHoy() {
  const fecha = hoy();
  if (!ESTADO.retos || ESTADO.retos.fecha !== fecha) {
    let semilla = [...fecha].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const azar = () => { semilla = (semilla * 1103515245 + 12345) >>> 0; return semilla / 4294967296; };
    const posibles = RETOS.filter(r => !r.dentro || ESTADO.dentro);
    const elegidos = [];
    while (elegidos.length < 3 && posibles.length) elegidos.push(posibles.splice(Math.floor(azar() * posibles.length), 1)[0]);
    ESTADO.retos = { fecha, lista: elegidos.map(r => ({ stat: r.stat, n: r.n, texto: r.texto, premio: r.premio, desde: stat(r.stat), hecho: false })), bono: false };
    sumarStat('noches');
  }
  return ESTADO.retos;
}

function progresoReto(r) { return Math.min(r.n, stat(r.stat) - r.desde); }

// Devuelve los retos recién cumplidos (y si con ellos se han hecho los tres).
function comprobarRetos() {
  const R = retosDeHoy();
  const nuevos = R.lista.filter(r => !r.hecho && progresoReto(r) >= r.n);
  nuevos.forEach(r => { r.hecho = true; ESTADO.monchis += r.premio; sumarStat('retos'); });
  let tres = false;
  if (!R.bono && R.lista.every(r => r.hecho)) { R.bono = true; tres = true; ESTADO.monchis += PREMIO_TRES_RETOS; }
  if (nuevos.length) guardarPartida();
  return { nuevos, tres };
}

// Aviso dorado (logros y retos): entra por arriba, brilla y se va.
function avisoDorado(scene, titulo, sub) {
  const c = scene.add.container(ANCHO / 2, -70).setDepth(1200);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.35).fillRoundedRect(-266, -36, 540, 84, 22);
  g.fillStyle(HEX.amarillo, 1).fillRoundedRect(-270, -42, 540, 84, 22);
  g.lineStyle(5, HEX.tinta, 1).strokeRoundedRect(-270, -42, 540, 84, 22);
  c.add(g);
  c.add(scene.add.star(-226, 0, 5, 12, 28, 0xffffff).setStrokeStyle(4, HEX.tinta));
  c.add(scene.add.text(-188, -30, titulo, { fontFamily: FUENTE, fontSize: '22px', color: '#1b1028' }));
  c.add(scene.add.text(-188, 2, sub, { fontFamily: FUENTE, fontSize: '16px', color: '#5a2a7a', wordWrap: { width: 440 } }));
  scene.tweens.add({ targets: c, y: 130, duration: 500, ease: 'Back.out' });
  scene.tweens.add({ targets: c, angle: { from: -2, to: 2 }, duration: 120, yoyo: true, repeat: 3, delay: 500 });
  sfx(scene, 'tiroriro', { volume: 0.6 });
  const chispas = scene.add.particles(ANCHO / 2, 130, 'miga', {
    speed: { min: 120, max: 320 }, lifespan: 900, scale: { start: 1, end: 0 }, gravityY: 300,
    tint: [0xffd23f, 0xffffff, 0xff5fa2], emitting: false,
  }).setDepth(1199);
  scene.time.delayedCall(500, () => chispas.explode(30));
  scene.time.delayedCall(4200, () => scene.tweens.add({ targets: c, y: -80, duration: 300, ease: 'Sine.in', onComplete: () => { c.destroy(); chispas.destroy(); } }));
}

// ---------- Sucesos del barrio: lo que pasa solo y se puede pillar ----------
// Cada uno recibe la escena del barrio. Lo que se pilla se coge tocándolo o pasando por encima.

const SUCESOS = [
  // Monchiman cruza corriendo y se le caen monchis de la mochila.
  { id: 'monchiman', humo: true, peso: 3, hacer: s => {
    const y = s.py - 40;
    const m = s.add.image(-100, y - 160, 'monchiman').setScale(0.28).setDepth(870);
    sfx(s, 'whoosh');
    s.tweens.add({ targets: m, x: ANCHO + 120, duration: 2600, onComplete: () => m.destroy() });
    s.tweens.add({ targets: m, y: y - 190, duration: 180, yoyo: true, repeat: 7 });
    const suelo = SALAS[s.sala].suelo;
    for (let i = 0; i < 5; i++) {
      s.time.delayedCall(300 + i * 420, () => {
        if (!s.scene.isActive()) return;
        const x = 160 + i * 230 + Phaser.Math.Between(-40, 40);
        const yy = Phaser.Math.Between(suelo[0], suelo[1]);
        const p = s.add.image(m.x, m.y, 'patatas').setScale(0.14).setDepth(yy);
        s.tweens.add({ targets: p, x, y: yy - 20, duration: 500, ease: 'Bounce.out' });
        pillable(s, p, () => { ESTADO.monchis += 6; return '+6 monchis'; }, 9000);
      });
    }
    return '¡Monchiman! Se le caen las patatas';
  } },
  // Palicaso cruza como estrella fugaz: tócalo y pide un deseo.
  { id: 'fugaz', humo: true, peso: 2, hacer: s => {
    const p = s.add.image(-120, Phaser.Math.Between(160, 260), 'palicaso').setScale(0.2).setDepth(870).setAngle(-20);
    sfx(s, 'fiu', { volume: 0.4 });
    s.tweens.add({ targets: p, x: ANCHO + 140, y: p.y + 140, duration: 3400, ease: 'Sine.inOut', onComplete: () => p.destroy() });
    const rastro = s.time.addEvent({ delay: 50, loop: true, callback: () => {
      if (!p.active) return rastro.remove();
      const h = s.add.image(p.x - 30, p.y, 'miga').setTint(0xffd23f).setScale(1.3).setDepth(869);
      s.tweens.add({ targets: h, alpha: 0, scale: 0.2, duration: 600, onComplete: () => h.destroy() });
    } });
    pillable(s, p, () => {
      const deseo = Phaser.Utils.Array.GetRandom([
        () => { ESTADO.hambre = Math.max(0, ESTADO.hambre - 30); return 'Deseo: se te quita el hambre'; },
        () => { ESTADO.vida = Math.min(100, ESTADO.vida + 30); return 'Deseo: vida +30'; },
        () => { ESTADO.monchis += 25; return 'Deseo: +25 monchis'; },
        () => { ESTADO.colocon = Math.min(100, ESTADO.colocon + 15); return 'Deseo: un poquito más de humo'; },
      ]);
      return deseo();
    }, 3400, { lejos: true });
    return '¡Una estrella fugaz! Tócala y pide un deseo';
  } },
  // Lluvia de humo morado: sube el colocón un poco.
  { id: 'lluvia', humo: true, peso: 1.2, hacer: s => {
    const lluvia = s.add.particles(0, -20, 'humo', {
      x: { min: 0, max: ANCHO }, speedY: { min: 60, max: 120 }, speedX: { min: -20, max: 20 }, scale: { start: 0.12, end: 0.3 },
      alpha: { start: 0.5, end: 0 }, lifespan: 5000, frequency: 90, tint: [0xb68cff, 0xff9ad5, 0xe8e2f0],
    }).setDepth(860);
    s.time.delayedCall(9000, () => { lluvia.stop(); s.time.delayedCall(5000, () => lluvia.destroy()); });
    ESTADO.colocon = Math.min(100, ESTADO.colocon + 8);
    sumarStat('sucesos');
    return 'Llueve humo en el barrio · colocón +8';
  } },
  // Puky asoma y, si lo tocas, te da un resucitador «que ha encontrado».
  { id: 'puky', humo: true, peso: 1.5, hacer: s => {
    const x = Phaser.Math.Between(300, ANCHO - 300);
    const p = s.add.image(x, ALTO + 140, 'puky').setOrigin(0.5, 1).setScale(0.3).setDepth(870);
    sfx(s, 'puky-gracioso', { volume: 0.5 });
    s.tweens.add({ targets: p, y: ALTO + 20, duration: 500, ease: 'Back.out', yoyo: true, hold: 3500, onComplete: () => p.destroy() });
    pillable(s, p, () => { ESTADO.vida = Math.min(100, ESTADO.vida + 25); return 'Puky: «Toma, lo encontré en el baño». Vida +25'; }, 4500, { lejos: true });
    return 'Puky asoma… ¿Le tocas?';
  } },
  // Apagón: se va la luz, solo se ven ojos, y vuelve con un «pin pin».
  { id: 'apagon', humo: true, peso: 1, hacer: s => {
    const negro = s.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0).setDepth(890);
    s.tweens.add({ targets: negro, fillAlpha: 0.92, duration: 120 });
    sfx(s, 'deshinchar', { volume: 0.4 });
    const ojos = [];
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(120, ANCHO - 120);
      const y = Phaser.Math.Between(200, 600);
      [-14, 14].forEach(dx => ojos.push(s.add.ellipse(x + dx, y, 14, 20, 0xffffff).setDepth(891).setAlpha(0)));
    }
    s.tweens.add({ targets: ojos, alpha: 1, duration: 200, delay: s.tweens.stagger(80) });
    s.tweens.add({ targets: ojos, scaleY: 0.1, duration: 80, yoyo: true, repeat: 3, delay: 900 });
    s.time.delayedCall(2600, () => {
      sfx(s, 'pin-pin');
      sfx(s, 'neon', { volume: 0.5 });
      s.tweens.add({ targets: [negro, ...ojos], alpha: 0, duration: 250, onComplete: () => { negro.destroy(); ojos.forEach(o => o.destroy()); } });
    });
    sumarStat('sucesos');
    return '¡Apagón! …¿Quién ha sido?';
  } },
  // La Pompa se ha soltado y cruza flotando por arriba: tócala y devuélvela.
  { id: 'pompa', humo: true, peso: 1.2, hacer: s => {
    const p = s.add.image(ANCHO + 80, 200, 'pompa-mira').setScale(0.24).setDepth(870);
    s.tweens.add({ targets: p, x: -100, duration: 9000, onComplete: () => p.destroy() });
    s.tweens.add({ targets: p, y: 170, angle: { from: -8, to: 8 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    pillable(s, p, () => { ESTADO.monchis += 15; return 'La Pompa: «…gracias. Toma 15»'; }, 9000, { lejos: true });
    return 'La Pompa se ha soltado del techo';
  } },
  // Mundo normal: alguien del grupo pasa por la calle, te saluda y a veces suelta algo.
  { id: 'paseo', humo: false, peso: 3, hacer: s => {
    const quien = Phaser.Utils.Array.GetRandom(['blancaso', 'cotine', 'lasslow', 'palicaso', 'pompa']);
    const clave = `n-${quien}-caminando`;
    if (!s.textures.exists(clave)) return null;
    const izq = Math.random() < 0.5;
    const y = SALAS[s.sala].suelo[1] - 10;
    const p = s.add.image(izq ? -120 : ANCHO + 120, y, clave).setOrigin(0.5, 1).setDepth(y);
    p.setScale(300 / p.height).setFlipX(!izq);
    s.tweens.add({ targets: p, x: izq ? ANCHO + 140 : -140, duration: 7000, onComplete: () => p.destroy() });
    s.tweens.add({ targets: p, y: y - 8, duration: 220, yoyo: true, repeat: -1 });
    s.time.delayedCall(2600, () => {
      if (!p.active) return;
      const frase = Phaser.Utils.Array.GetRandom(['¡Ey! ¿Esta noche qué?', '¿Vamos a Unaké luego?', 'Qué buen día. Sospechoso.', '¡Hola, Vuper!', 'Voy por pan. Y por lo otro.']);
      const b = bocadillo(s, Phaser.Math.Clamp(p.x, 200, ANCHO - 200), y - p.displayHeight - 40, frase, { tam: 20, ancho: 280 }).setDepth(880);
      s.time.delayedCall(2200, () => b.destroy());
    });
    pillable(s, p, () => { ESTADO.monchis += 5; return `${QUIEN[quien].nombre} te invita a un café · +5`; }, 7000, { lejos: true });
    return null;
  } },
  // Mundo normal: una moneda de monchis brilla en el suelo.
  { id: 'brillo', humo: false, peso: 2, hacer: s => {
    const suelo = SALAS[s.sala].suelo;
    const x = Phaser.Math.Between(200, ANCHO - 200);
    const y = Phaser.Math.Between(suelo[0], suelo[1]);
    const p = s.add.image(x, y - 20, 'caramelo').setScale(0.13).setDepth(y);
    s.tweens.add({ targets: p, y: y - 34, duration: 500, yoyo: true, repeat: -1 });
    s.tweens.add({ targets: p, angle: 360, duration: 2000, repeat: -1 });
    pillable(s, p, () => { ESTADO.hambre = Math.max(0, ESTADO.hambre - 10); ESTADO.monchis += 8; return 'Un caramelo en el suelo · +8 monchis'; }, 14000);
    return 'Algo brilla en el suelo…';
  } },
];

// Hace que algo se pueda pillar: tocándolo, o (si no es «lejos») pasando por encima.
// premio() aplica el efecto y devuelve el texto.
function pillable(s, obj, premio, dura, { lejos = false } = {}) {
  let hecho = false;
  const coger = () => {
    if (hecho || !obj.active) return;
    hecho = true;
    const txt = premio();
    sumarStat('sucesos');
    guardarPartida();
    if (s.refrescarHud) s.refrescarHud();
    sfx(s, 'campanita', { volume: 0.6 });
    golpeTexto(s, Phaser.Math.Clamp(obj.x, 200, ANCHO - 200), Math.max(160, obj.y - 60), txt, COLOR.amarillo, 26).setDepth(1001);
    s.tweens.killTweensOf(obj);
    s.tweens.add({ targets: obj, scale: obj.scale * 1.4, alpha: 0, duration: 250, onComplete: () => obj.destroy() });
  };
  obj.setInteractive({ useHandCursor: true }).on('pointerdown', coger);
  s.objSuceso = s.objSuceso || [];
  s.objSuceso.push(obj);
  if (!lejos) {
    s.pillables = s.pillables || [];
    s.pillables.push({ obj, coger });
  }
  s.time.delayedCall(dura, () => { if (!hecho && obj.active) s.tweens.add({ targets: obj, alpha: 0, duration: 300, onComplete: () => obj.destroy() }); });
}

// Lo del suelo se coge al pasar por encima.
function recogerPillables(s) {
  if (!s.pillables || !s.pillables.length) return;
  s.pillables = s.pillables.filter(p => p.obj.active);
  s.pillables.forEach(p => { if (Math.abs(p.obj.x - s.px) < 70 && Math.abs(p.obj.y - s.py) < 70) p.coger(); });
}

function sucesoBarrio(s) {
  const humo = enMundoHumo();
  const posibles = SUCESOS.filter(x => x.humo === humo && x.id !== s.ultimoSuceso);
  const total = posibles.reduce((a, x) => a + x.peso, 0);
  let r = Math.random() * total;
  const suc = posibles.find(x => (r -= x.peso) <= 0) || posibles[0];
  if (!suc) return;
  s.ultimoSuceso = suc.id;
  const aviso = suc.hacer(s);
  if (aviso) golpeTexto(s, ANCHO / 2, 250, aviso, COLOR.azul, 30).setDepth(1001);
}

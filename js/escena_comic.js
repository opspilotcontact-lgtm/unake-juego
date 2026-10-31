// Escenas de capítulo contadas como cómic (lenguaje del E00): portada con rayos o ilustración,
// los que hablan de pie en su sala, corte de cámara al que habla (plano/contraplano con zoom),
// bocadillo que se escribe, reacciones de los demás, cartela la primera vez que sale alguien,
// cartuchos amarillos para el narrador, pantalla de reacción en los «¿Una qué?» y cierre en iris.
// Usa las mismas líneas de historia.js (['quien', 'texto']), así que no hay que reescribir nada.

// Claves de SALAS (el sofá es «reservado»). Si alguna faltara, la escena usa el bar.
// Por id de capítulo (historia.js); los que no aparezcan (y el modo libre) usan el bar.
const FONDO_CAPITULO = { 'una-que': 'fuera', cuota: 'dentro', blancazo: 'reservado', senor: 'dentro', caja: 'dentro', perico: 'dentro', inspeccion: 'dentro', epica: 'reservado' };

const CARTELAS = {
  vuper: ['VUPER', 'el rider', COLOR.crema], palicaso: ['PALICASO', 'el que habla', COLOR.amarillo],
  blancaso: ['BLANCASO', 'el que lleva las cuentas', '#bfe8ff'], perico: ['PERICO', 'el portero', '#d0d4dc'],
  lasslow: ['LASSLOW', 'un señor', '#ffb38a'], cotine: ['COTINE', 'la repostera', '#ff8fc0'], pompa: ['LA POMPA', 'la DJ', '#9fe7ff'],
  puky: ['PUKY', 'el que nunca está invitado', '#f2d23c'], casero: ['EL CASERO', 'el que tiene la llave', '#d9b77a'],
};

// Poses por mundo: [de pie, hablando, sorprendido].
function posesDe(id, humo) {
  // Puky solo existe en el humo; el casero, hasta tener su dibujo, es su llave («el que tiene la llave»).
  if (id === 'puky') return ['puky', 'puky-que-rico', 'puky-horror'];
  if (id === 'casero') {
    return humo ? [arteO('casero', 'obj-llave'), arteO('casero-mira', arteO('casero', 'obj-llave')), arteO('casero-mareado', arteO('casero', 'obj-llave'))]
      : [arteO('n-casero', 'obj-llave'), arteO('n-casero-hablando', arteO('n-casero', 'obj-llave')), arteO('n-casero-sorprendido', arteO('n-casero', 'obj-llave'))];
  }
  if (humo) {
    return {
      vuper: ['vuper', 'vuper', 'vuper-colocado'], palicaso: ['palicaso', 'palicaso-contando', 'palicaso-riendo'],
      blancaso: ['blancaso', 'blancaso-esperanza', 'blancaso-mareado'], lasslow: ['lasslow-digno', 'lasslow-digno', 'lasslow-horror'],
      perico: ['perico', 'perico-cotilleando', 'perico-horror'], cotine: ['cotine', 'cotine', 'cotine-plop'], pompa: ['pompa-mira', 'pompa-mira', 'pompa-horror'],
    }[id];
  }
  if (id === 'vuper') return ['vuper-normal', 'vn-hablando', 'vn-sorprendido'];
  return [`n-${id}`, `n-${id}-hablando`, `n-${id}-sorprendido`];
}

// Quién es quién en el texto (para centrar el momento persona en el nombrado).
const NOMBRES_EN_TEXTO = { blancaso: /Blancaso/, palicaso: /Palicaso/, lasslow: /Lasslow/, perico: /Perico/, cotine: /Cotine/, pompa: /Pompa/, puky: /Puky/, vuper: /Vuper/ };

// Onomatopeyas del juego (en minúsculas, sin signos).
const ONOMATOPEYAS = 'plof|plink|plaf|plop|blurp|glups|ñam|slurp|pum|zas|crac|boing|prrr+t|pff+|pof|chof|splash|puaj|glub|bzzz+|ring';
const RE_ONO_LINEA = new RegExp('^(?:' + ONOMATOPEYAS + ')$', 'i');
const RE_ONO_FRASE = new RegExp('(?:^|[.!?…]\\s+)(¡?(?:' + ONOMATOPEYAS + ')[.!]*)(?=\\s|$)', 'i');

// Qué énfasis le toca a una línea de historia, sin que el guion marque nada. Conservador:
// devuelve { tipo, texto } o null. La dosis (un efecto fuerte cada 3 líneas) la aplica quien llama.
Comic.enfasisAuto = function (quien, txt, { esUltimaDeCierre = false, esPrimera = false, tensionHecha = false } = {}) {
  if (esUltimaDeCierre) return { tipo: 'chiste' };
  if (/se (?:le|les) limpian? (?:los )?ojos/i.test(txt)) return { tipo: 'ternura' };
  // Onomatopeya: la línea entera (cualquier hablante) o una frase suelta del narrador.
  const limpio = txt.replace(/[¡!¿?.…\-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const pocas = limpio.split(' ').length <= 2 && limpio.length <= 12;
  if (pocas && (RE_ONO_LINEA.test(limpio) || (limpio === limpio.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{3,}/.test(limpio)))) return { tipo: 'golpe', texto: '¡' + limpio.toUpperCase() + '!' };
  if (quien === 'narrador') {
    const m = RE_ONO_FRASE.exec(txt);
    if (m) return { tipo: 'golpe', texto: '¡' + m[1].replace(/[¡!.]/g, '').toUpperCase() + '!' };
  }
  if (/otra vez no/i.test(txt)) return { tipo: 'bajon' };
  if (!tensionHecha && ((quien === 'casero' && esPrimera) || /inspecci[oó]n|amarill/i.test(txt))) return { tipo: 'tension' };
  // Gritos: mayúsculas o varios «!» seguidos. Con insulto u orden, bronca; si no, sorpresa.
  if (quien !== 'narrador') {
    const letras = txt.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
    const mayus = letras.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length;
    const gritaMay = letras.length >= 4 && mayus / letras.length >= 0.7 && !/^(?:ja|je|ji)+$/i.test(letras);
    const gritaAdm = /!!|¡¡|(?:!.*){3,}/.test(txt);
    if (gritaMay || gritaAdm) {
      const bronca = gritaMay || /c[aá]llate|fuera|largo|idiota|basta|te dije|harto|ya est[aá] bien|devu[eé]lve|\bno\b/i.test(txt);
      return { tipo: bronca && !/[¿?]/.test(txt) ? 'bronca' : 'sorpresa' };
    }
  }
  return null;
};

Comic.escena = function (scene, lineas, alAcabar, opciones = {}) {
  const humo = scene.mundo === 'humo';
  const sala = FONDO_CAPITULO[opciones.cap ?? capId()] || (capId() === 'libre' ? FONDO_CAPITULO.epica : 'dentro');
  const datosSala = SALAS[sala] || SALAS.dentro;
  const fondoClave = humo ? datosSala.fondo : datosSala.fondoN;

  scene.objetivo = null;
  scene.aviso.setVisible(false);
  if (scene.modal) scene.cerrarModal(); // nunca dos ventanas a la vez
  const velo = scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 1).setDepth(950).setInteractive();
  const raiz = scene.add.container(0, 0).setDepth(951);
  // Si algo la cierra antes de tiempo, su final (la historia) se ejecuta igual, una sola vez.
  let acabada = false;
  const acabar = () => { if (acabada) return; acabada = true; if (typeof Musica !== 'undefined') Musica.alEntrar(scene); if (alAcabar) alAcabar(); };
  // Si la ventana se cierra desde fuera, no queda ningún énfasis vivo.
  scene.modal = { velo, c: raiz, alQuitar: () => { Comic.limpiarEnfasis(scene); scene.time.delayedCall(10, acabar); } };

  // El escenario: fondo + personajes, dentro de un contenedor que hace de cámara.
  const escenario = scene.add.container(0, 0);
  raiz.add(escenario);
  const bg = scene.add.image(ANCHO / 2, ALTO / 2, scene.textures.exists(fondoClave) ? fondoClave : 'bg-dentro');
  bg.setScale(Math.max(ANCHO / bg.width, ALTO / bg.height) * 1.05);
  escenario.add(bg);
  // Capas del énfasis de cómic: «fondo» (entre el fondo y los personajes, se mueve con la cámara),
  // «frente» (viñetas y tintes, por debajo del bocadillo) y «sobre» (rótulos y letras, por encima).
  const capaFondo = scene.add.container(0, 0);
  escenario.add(capaFondo);
  const capaFrente = scene.add.container(0, 0);
  raiz.add(capaFrente);
  const ui = scene.add.container(0, 0);
  raiz.add(ui);
  const capaSobre = scene.add.container(0, 0);
  raiz.add(capaSobre);
  const capas = { fondo: capaFondo, frente: capaFrente, sobre: capaSobre };

  // Reparto: los que hablan, repartidos por el suelo (Vuper a la izquierda si sale).
  const ids = [...new Set(lineas.map(l => l[0]).filter(q => posesDe(q, humo)))];
  ids.sort((a, b) => (a === 'vuper' ? -1 : b === 'vuper' ? 1 : 0));
  const actores = {};
  ids.forEach((id, i) => {
    const poses = posesDe(id, humo).map(k => (scene.textures.exists(k) ? k : null));
    if (!poses[0]) return;
    const x = ids.length === 1 ? ANCHO / 2 : 260 + (i * (ANCHO - 520)) / (ids.length - 1);
    const img = scene.add.image(x, 690, poses[0]).setOrigin(0.5, 1);
    const alto = id === 'pompa' && humo ? 230 : 340;
    img.setScale(alto / img.height);
    img.setFlipX(x > ANCHO / 2 && id !== 'pompa');
    escenario.add(img);
    scene.tweens.add({ targets: img, y: 684, duration: 1300 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    actores[id] = { img, poses: poses.map(p => p || poses[0]), alto, x };
  });
  const pose = (a, k) => { if (!a) return; a.img.setTexture(a.poses[k]); a.img.setScale(a.alto / a.img.height); };

  // Cámara: encuadra un punto con zoom (0 ms = corte seco).
  let mira = null; // el encuadre de la línea (para acercar y volver)
  const camActual = { cx: 0, cy: 0, z: 1 };
  const encuadre = (fx, fy, z, ms = 0, esEfecto = false) => {
    const x = ANCHO / 2 - fx * z;
    const y = ALTO / 2 - fy * z;
    const cx = Phaser.Math.Clamp(x, ANCHO - ANCHO * z * 1.02, 0);
    const cy = Phaser.Math.Clamp(y, ALTO - ALTO * z * 1.02, 0);
    if (!esEfecto) { mira = { fx, fy, z }; camActual.cx = cx; camActual.cy = cy; camActual.z = z; }
    scene.tweens.killTweensOf(escenario);
    if (!ms) escenario.setScale(z).setPosition(cx, cy);
    else scene.tweens.add({ targets: escenario, scale: z, x: cx, y: cy, duration: ms, ease: 'Sine.inOut' });
  };

  let i = -1;
  let escribiendo = null;
  let piezas = [];
  let bloqueado = false;
  // Estado del énfasis de la línea: ritmo de escritura, rebote del actor, atenuado de los demás.
  let ritmoK = 1, rebote = null, tweensFx = [];
  let ultimaFuerte = -99, tensionHecha = false;
  const frenarFx = () => {
    Comic.limpiarEnfasis(scene);
    if (rebote) { rebote.stop(); rebote = null; }
    tweensFx.forEach(t => t.stop());
    tweensFx = [];
    ritmoK = 1;
    Object.values(actores).forEach(a => { if (a.img.scene) { a.img.setAlpha(1); a.img.setScale(a.alto / a.img.height); } });
  };
  const limpiar = () => { piezas.forEach(p => p.destroy()); piezas = []; frenarFx(); };
  const rebotar = (id) => {
    const a = actores[id];
    if (!a) return;
    const sc = a.alto / a.img.height;
    if (rebote) rebote.stop();
    rebote = scene.tweens.addCounter({ from: 0, to: 1, duration: 120, yoyo: true, repeat: 2, onUpdate: t => { const v = t.getValue(); a.img.setScale(sc * (1 - 0.1 * v), sc * (1 + 0.14 * v)); }, onComplete: () => a.img.setScale(sc) });
  };
  const escribir = (txtObj, txt, alFin) => {
    let k = 0;
    txtObj.setText('');
    escribiendo = { fin: () => { if (escribiendo) { escribiendo.ev.remove(); escribiendo = null; txtObj.setText(txt); if (alFin) alFin(); } } };
    const ritmo = Math.round({ lenta: 44, normal: 24, rapida: 9 }[(ESTADO.opciones || {}).texto || 'normal'] * ritmoK);
    escribiendo.ev = scene.time.addEvent({ delay: ritmo, repeat: txt.length - 1, callback: () => { k++; txtObj.setText(txt.slice(0, k)); if (k >= txt.length && escribiendo) { escribiendo = null; if (alFin) alFin(); } } });
  };
  const vistas = (ESTADO.cartelasVistas = ESTADO.cartelasVistas || {});
  let ultimo = null;

  const terminar = () => {
    if (bloqueado === 'fin') return;
    bloqueado = 'fin';
    if (escribiendo) escribiendo.fin();
    limpiar();
    const miModal = scene.modal;
    Comic.cubrir.iris(scene, () => {
      scene.cerrarModal(miModal); // solo la suya: si ya se abrió otra ventana, no se toca
      if (!scene.modal || scene.modal === miModal) Comic.destapar.iris(scene, { x: scene.px, y: scene.py - 110 });
      acabar();
    }, { x: ANCHO / 2, y: ALTO / 2 - 60 });
  };

  // Decide (guion o reglas automáticas, con dosis) y lanza el énfasis de la línea i. Devuelve si salió uno.
  const lanzarFx = (quien, txt, extra, ctx) => {
    let tipo = null, texto = extra && extra.texto, explicito = false;
    if (extra && 'fx' in extra) { tipo = extra.fx; explicito = !!tipo; } // { fx: null } lo apaga
    else {
      const esPrimera = lineas.slice(0, i).every(l => l[0] === 'titulo');
      const esUltimaDeCierre = !!opciones.momento && i === lineas.length - 1;
      const auto = Comic.enfasisAuto(quien, txt, { esUltimaDeCierre, esPrimera, tensionHecha });
      if (auto) { tipo = auto.tipo; texto = texto || auto.texto; }
    }
    if (!tipo) return false;
    // Dosis: un efecto fuerte como mucho cada 3 líneas. Los suaves (golpe) y los dos reservados
    // (momento persona y remate) no cuentan. Lo explícito del guion siempre sale.
    const real = Comic.ALIAS_ENFASIS[tipo] || tipo;
    const suave = real === 'golpe', reservado = real === 'chiste' || real === 'ternura';
    if (!explicito && !suave && !reservado && i - ultimaFuerte < 3) return false;
    if (ctx && ctx.preguntaCorta && !explicito) return false;
    // Con quién va el efecto: el que habla o el nombrado en el texto (narrador).
    const id = actores[quien] ? quien : Object.keys(NOMBRES_EN_TEXTO).find(k => actores[k] && NOMBRES_EN_TEXTO[k].test(txt));
    const af = id ? actores[id] : null;
    if (quien === 'narrador' && af && real === 'ternura') encuadre(af.x, 690 - af.alto * 0.62, 1.5, 700); // el momento persona se acerca a quien toca
    const cabeza = af ? { x: Phaser.Math.Clamp(camActual.cx + camActual.z * af.x, 200, ANCHO - 200), y: Phaser.Math.Clamp(camActual.cy + camActual.z * (690 - af.alto * 0.85), 220, ALTO - 260) } : null;
    // La cara del otro (asco): la pose de sorpresa del siguiente en hablar.
    const otro = ctx && ctx.sigue && actores[ctx.sigue];
    const res = Comic.enfasis(scene, tipo, {
      capas, cabeza, texto,
      foco: af ? { x: af.x, y: 690 - af.alto * 0.5 } : null,
      acercar: (k, ms) => { if (mira) encuadre(mira.fx, mira.fy, mira.z * k, ms, true); },
      rebote: () => rebotar(id),
      atenuar: () => Object.entries(actores).forEach(([k, a]) => { if (k !== id) tweensFx.push(scene.tweens.add({ targets: a.img, alpha: 0.25, duration: 500 })); }),
      bocadillo: ctx && ctx.b, cola: ctx && ctx.cola, estiloFijo: ctx && ctx.estiloFijo,
      cara: otro ? otro.poses[2] : null,
      retardo: Math.min(1200, txt.length * 24 + 300),
    });
    if (!res) return false;
    if (!suave) ultimaFuerte = i;
    if (real === 'tension') tensionHecha = true;
    ritmoK = res.lento;
    if (res.pausa) {
      // Pausa dramática: no se puede pasar de línea por accidente. Solo si no hay otro bloqueo.
      if (!bloqueado) {
        bloqueado = 'fx';
        scene.time.delayedCall(res.pausa, () => { if (bloqueado === 'fx') bloqueado = false; });
      }
    }
    return true;
  };

  const siguiente = () => {
    if (bloqueado) return;
    if (escribiendo) return escribiendo.fin();
    i++;
    limpiar();
    if (i >= lineas.length) return terminar();
    const [quien, txt, arte] = lineas[i];
    const extra = arte && typeof arte === 'object' ? arte : null; // { fx: 'terror' | null, texto, bocadillo }
    if (musicaPendiente && quien !== 'titulo') { musicaPendiente = false; Musica.poner(scene, huecoEscena); }

    if (quien === 'titulo') {
      // Portada del capítulo: la ilustración si existe; si no, tarjeta morada con rayos que giran.
      if (arte && scene.textures.exists(arte)) {
        const a = scene.add.image(ANCHO / 2, ALTO / 2, arte);
        a.setScale(Math.max(ANCHO / a.width, ALTO / a.height));
        scene.tweens.add({ targets: a, scale: a.scale * 1.07, duration: 6000 });
        ui.add(a); piezas.push(a);
      } else {
        const fondoT = scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, UNAKE.morado);
        const rayos = scene.add.graphics({ x: ANCHO / 2, y: ALTO / 2 });
        for (let r = 0; r < 14; r++) {
          const a0 = (r / 14) * Math.PI * 2;
          rayos.fillStyle(r % 2 ? 0x5b2a86 : 0x3a1c52, 1).fillTriangle(0, 0, Math.cos(a0) * 1200, Math.sin(a0) * 1200, Math.cos(a0 + 0.22) * 1200, Math.sin(a0 + 0.22) * 1200);
        }
        scene.tweens.add({ targets: rayos, angle: 360, duration: 40000, repeat: -1 });
        ui.add([fondoT, rayos]); piezas.push(fondoT, rayos);
      }
      const [capN, nombre] = txt.split(' · ');
      const t1 = texto(scene, ANCHO / 2, 250, capN, 40, COLOR.crema).setScale(0);
      const t2 = texto(scene, ANCHO / 2, -120, nombre || txt, 84, COLOR.amarillo, 1100);
      ui.add([t1, t2]); piezas.push(t1, t2);
      sfx(scene, 'sting', { volume: 0.5 });
      scene.tweens.add({ targets: t1, scale: 1, duration: 400, ease: 'Back.out' });
      scene.tweens.add({ targets: t2, y: 360, duration: 900, ease: 'Bounce.out', delay: 250 });
      scene.time.delayedCall(1150, () => { if (t2.active) { scene.cameras.main.shake(160, 0.005); sfx(scene, 'golpe', { volume: 0.4 }); } });
      encuadre(ANCHO / 2, ALTO / 2, 1);
      return;
    }

    if (quien === 'objetivos') {
      // Cierre: plano general y la lista de lo que hay que hacer, como cartela de cómic.
      encuadre(ANCHO / 2, ALTO / 2, 1, 500);
      const objetivos = capituloActual().objetivos;
      const caja = scene.add.container(ANCHO / 2, ALTO / 2).setAngle(-2).setScale(0);
      const alto = 120 + objetivos.length * 46;
      const g = scene.add.graphics();
      g.fillStyle(HEX.tinta, 1).fillRect(-430 + 10, -alto / 2 + 10, 860, alto);
      g.fillStyle(UNAKE.amarillo, 1).fillRect(-430, -alto / 2, 860, alto).lineStyle(8, HEX.tinta, 1).strokeRect(-430, -alto / 2, 860, alto);
      caja.add(g);
      caja.add(scene.add.text(0, -alto / 2 + 22, 'Esta noche toca:', { fontFamily: FUENTE, fontSize: '34px', color: COLOR.tinta }).setOrigin(0.5, 0));
      objetivos.forEach((o, k) => caja.add(scene.add.text(-390, -alto / 2 + 78 + k * 46, `▸ ${o.texto}`, { fontFamily: FUENTE, fontSize: '22px', color: '#3a1c52', wordWrap: { width: 780 } })));
      ui.add(caja); piezas.push(caja);
      scene.tweens.add({ targets: caja, scale: 1, duration: 380, ease: 'Back.out' });
      sfx(scene, 'campanita', { volume: 0.5 });
      return;
    }

    if (quien === 'narrador' || !actores[quien]) {
      // Cartucho del narrador: plano general con un zoom lento.
      encuadre(ANCHO / 2, ALTO / 2 + 40, 1.0, 0);
      encuadre(ANCHO / 2, ALTO / 2 + 40, 1.06, 4000);
      const caja = scene.add.container(60, 50).setAngle(-1.5);
      const t = scene.add.text(26, 18, '', { fontFamily: FUENTE, fontSize: '28px', color: COLOR.tinta, wordWrap: { width: 980 }, lineSpacing: 6 });
      const medida = scene.add.text(0, 0, txt, { fontFamily: FUENTE, fontSize: '28px', wordWrap: { width: 980 }, lineSpacing: 6 }).setVisible(false);
      const g = scene.add.graphics();
      g.fillStyle(HEX.tinta, 1).fillRect(8, 8, 1040, medida.height + 36);
      g.fillStyle(UNAKE.amarillo, 1).fillRect(0, 0, 1040, medida.height + 36).lineStyle(6, HEX.tinta, 1).strokeRect(0, 0, 1040, medida.height + 36);
      // Trama de puntos (halftone) sutil sobre el amarillo, como en un cómic impreso.
      const trama = scene.add.tileSprite(0, 0, 1040, medida.height + 36, Comic.texTrama(scene)).setOrigin(0).setTint(0xe0a800).setAlpha(0.3).setTileScale(0.32);
      medida.destroy();
      caja.add([g, trama, t]);
      caja.x = -1100;
      scene.tweens.add({ targets: caja, x: 60, duration: 260, ease: 'Back.out' });
      ui.add(caja); piezas.push(caja);
      sfx(scene, 'zas', { volume: 0.35 });
      Object.values(actores).forEach(a => pose(a, 0));
      ultimo = null;
      lanzarFx(quien, txt, extra, null);
      escribir(t, txt);
      return;
    }

    // Alguien habla: corte seco a su plano, pose de hablar, los demás a la escucha.
    const a = actores[quien];
    Object.entries(actores).forEach(([id, o]) => pose(o, id === quien ? 1 : 0));
    const z = Object.keys(actores).length > 1 ? 1.55 : 1.3;
    encuadre(a.x, 690 - a.alto * 0.62, z, 0);
    if (ultimo && ultimo !== quien) {
      // El corte se nota: golpecito de escala (como el «snap» del motor).
      escenario.setScale(escenario.scale * 1.04);
      scene.tweens.add({ targets: escenario, scale: z, duration: 160, ease: 'Quad.out' });
    }
    ultimo = quien;
    const sx = a.img.scaleX;
    a.img.setScale(sx * 1.12, sx * 0.9);
    scene.tweens.add({ targets: a.img, scaleX: sx, scaleY: sx, duration: 260, ease: 'Back.out' });
    const b = bocadillo(scene, ANCHO / 2 + (a.x < ANCHO / 2 ? 170 : -170), 130, txt, { tam: 30, ancho: 640, cola: a.x < ANCHO / 2 ? 'izq' : 'der' });
    b.setDepth(0);
    ui.add(b); piezas.push(b);
    sfx(scene, 'pop', { volume: 0.3 });
    // Forma del bocadillo: la que pide el guion o la que sugiere el texto (pensamiento, susurro).
    const estiloGuion = extra && extra.bocadillo;
    const estiloTexto = /^\(.*\)$/.test(txt.trim()) ? 'nube' : /^(?:shh|psst|chist)|\(en voz baja\)/i.test(txt.trim()) ? 'susurro' : null;
    const estilo = estiloGuion || estiloTexto;
    if (estilo) Comic.estiloBocadillo(scene, b, estilo, a.x < ANCHO / 2 ? 'izq' : 'der');
    // Si la línea es una pregunta corta, la pantalla de reacción manda sobre el énfasis automático.
    const siguienteQuien = lineas[i + 1] && lineas[i + 1][0];
    const preguntaCorta = txt.length < 18 && txt.includes('?') && actores[siguienteQuien] && siguienteQuien !== quien;
    const hayFx = lanzarFx(quien, txt, extra, { b, a, cola: a.x < ANCHO / 2 ? 'izq' : 'der', estiloFijo: !!estilo, preguntaCorta, sigue: siguienteQuien });
    escribir(b.list[1], txt);

    // Cartela la primera vez que sale alguien.
    if (CARTELAS[quien] && !vistas[quien]) {
      vistas[quien] = true;
      guardarPartida();
      const [nom, sub, col] = CARTELAS[quien];
      const cart = Comic.cartela(scene, nom, sub, col, { x: 60, y: ALTO - 190, ms: 2600 });
      cart.setDepth(0);
      ui.add(cart);
      piezas.push(cart); // se va con la línea
    }
    // Remates según la frase (solo si no ha salido ya un énfasis, para no apilar efectos).
    const pantalla = { x: ANCHO / 2, y: 260 };
    if (hayFx) { /* ya tiene su efecto */ }
    else if (/JA/.test(txt)) { scene.cameras.main.shake(220, 0.006); Comic.emote(scene, pantalla.x - 120, pantalla.y, 'chispas', { profundidad: 990 }); }
    else if (/¡Escucha/.test(txt)) Comic.emote(scene, pantalla.x - 140, pantalla.y + 20, 'chispas', { profundidad: 990 });
    else if (/…$|Otra vez no/.test(txt)) Comic.emote(scene, pantalla.x - 130, pantalla.y + 40, 'gota', { profundidad: 990 });
    else if (/casero|cierra|alquiler/.test(txt)) Comic.emote(scene, pantalla.x - 130, pantalla.y + 30, 'calavera', { profundidad: 990, tam: 64 });
    // Pregunta corta («¿Una qué?»): pantalla de reacción del que tiene que contestar.
    if (preguntaCorta) {
      ultimaFuerte = i;
      bloqueado = true;
      scene.time.delayedCall(700, () => {
        Comic.reaccion(scene, actores[siguienteQuien].poses[2], { color: UNAKE.rosa, ms: 600 }).then(() => { bloqueado = false; });
      });
    }
  };

  // La portada del capítulo suena sola (la cortinilla de la serie); la canción entra después.
  const huecoEscena = opciones.momento ? 'momento' : 'escena';
  let musicaPendiente = false;
  if (typeof Musica !== 'undefined') {
    if (lineas[0] && lineas[0][0] === 'titulo') { Musica.silencio(); musicaPendiente = true; } else Musica.poner(scene, huecoEscena);
  }
  const saltar = boton(scene, ANCHO - 110, ALTO - 50, 'Saltar ▸', () => terminar(), { ancho: 170, alto: 50, tam: 20, color: HEX.crema });
  saltar.etiqueta.setText('Saltar »');
  raiz.add(saltar);
  velo.on('pointerdown', siguiente);
  scene.modalAccion = siguiente;
  scene.modalCerrar = terminar; // Esc: se salta la escena
  // Salta un poco de humo al empezar, como entrada en frío.
  destaparHumo(scene);
  siguiente();
};

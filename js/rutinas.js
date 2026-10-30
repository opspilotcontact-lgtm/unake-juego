// La vida propia de los del barrio: no se quedan esperando a que llegue Vuper.
// - Rutinas: cada uno pasea un poco por su sala y, cada tanto, hace lo suyo (Perico come pipas,
//   Lasslow suelta uno disimulado y los demás reaccionan, Blancaso suda con las cuentas…).
// - Visitas: al entrar en una sala puede haber alguien de fuera que ha venido a lo suyo; llega
//   andando, suelta su frase, se queda un rato (se puede hablar con él) y se va.
// Quien tiene un problema abierto se queda en su sitio (el panel dice dónde buscarle).

const ACTIVIDADES = {
  perico: { humo: 'perico-pipas', fx: 'cascaras', dice: ['*crac*', 'Pipa.', 'Pin pin… *crac*'] },
  lasslow: { humo: 'lasslow-pedo', fx: 'pedo', sonido: 'pedo-silencioso', dice: ['…', 'Yo no he sido.', 'Qué noche más agradable, ¿verdad?'], reaccion: true },
  blancaso: { humo: 'blancaso-mareado', fx: 'sudor', dice: ['No cuadra…', 'Otra factura…', '¿Quién ha pedido catorce bolsas de patatas?'] },
  cotine: { humo: 'cotine-plop', fx: 'migas', sonido: 'nam', dice: ['Ñam.', 'Solo una miguita.', 'Esto era para la tarta. Era.'] },
  palicaso: { humo: 'palicaso-riendo', dice: ['¡JAJAJA! ¡Qué bueno!', '¡Escucha esto, que es buenísimo!'] },
  pompa: { humo: 'pompa-mira', fx: 'notas', dice: ['♪', '♪ ♫ ♪'] },
  puky: { humo: 'puky-eructo', sonido: 'blurp', dice: ['*BURP*', 'Perdón. No, en verdad no.'] },
};

const VISITAS = {
  tienda: [
    { id: 'cotine', dice: ['¿Esto lleva azúcar? Me lo llevo.', 'Vengo a por harina. Y patatas. Y…'] },
    { id: 'lasslow', dice: ['Un señor también compra patatas. Con dignidad.'] },
    { id: 'perico', dice: ['¿Tienen pipas? ¿Y más pipas?'] },
  ],
  plaza: [
    { id: 'lasslow', dice: ['Tomando el aire. El aire lo necesita más que yo.'] },
    { id: 'palicaso', dice: ['¡Escucha! Aquí también se habla.'] },
    { id: 'cotine', dice: ['Aquí no hay tartas. Qué triste es la calle.'] },
  ],
  fuera: [
    { id: 'palicaso', dice: ['Salgo a que me dé el aire. Y a contarle cosas al aire.'] },
    { id: 'blancaso', dice: ['Si viene el casero, no estoy.'] },
    { id: 'lasslow', dice: ['Aquí fuera se respira mejor. Por razones.'] },
  ],
  cocina: [
    { id: 'palicaso', dice: ['Cotine, ¿queda algo? …Ya veo que no.'] },
    { id: 'blancaso', dice: ['Vengo a ver cuánto gastamos en azúcar. Mejor no.'] },
  ],
  dentro: [
    { id: 'puky', dice: ['¡Me han invitado! ¿Lo sabíais? Me han invitado.', '¿Me llamabais? …Ah, no. Estoy invitado, no hace falta.'], requiere: () => ESTADO.pukyInvitado },
  ],
  cuarto: [
    { id: 'palicaso', dice: ['¡Escucha! Tu cuarto huele a héroe. Y a otra cosa.'] },
    { id: 'cotine', dice: ['¿Tienes algo de comer aquí? …¿Debajo de la cama?'] },
  ],
};

// Charlas entre ellos que solo pasan cuando coinciden (las visitas las hacen posibles).
DIALOGOS.push(
  [['cotine', '¿Alguien quiere tarta?'], ['lasslow', '¿Queda?'], ['cotine', '…No.']],
  [['blancaso', 'Lasslow, ¿has pagado la cuota?'], ['lasslow', 'Un señor paga… en dignidad.']],
  [['palicaso', '¡Blancaso! ¡Escucha!'], ['blancaso', 'No. Hoy no. Hoy cuadro las cuentas.']],
  [['perico', 'Pin pin. ¿Contraseña?'], ['palicaso', '¡Que estamos en la calle!'], ['perico', 'Por si acaso.']],
  [['cotine', 'Perico, ¿me das una pipa?'], ['perico', 'No.']],
  [['blancaso', 'Cotine, ¿y la tarta de la aso?'], ['cotine', 'Estaba así cuando llegué.']],
  [['lasslow', 'Buenas noches, Blancaso.'], ['blancaso', '¿Qué es ese olor? …Ah. Ya.']],
  [['palicaso', '¡Cotine! ¿Me guardas un trozo?'], ['cotine', 'Claro. *ñam* Ya no.']],
  [['lasslow', 'Perico, es usted un portero excelente.'], ['perico', 'Lo sé. Contraseña.']],
  [['palicaso', '¿Sabes que la tragaperras la puse yo?'], ['blancaso', '¿Y QUIÉN LA PAGÓ?']],
);

function npcLibre(s, c) {
  return c.img && c.img.active && !c.oculta && !c.recorte && !c.caminando && !ESTADO.situaciones[c.id] && QUIEN[c.id];
}

// Mueve a alguien con todo lo suyo (marca, zona de toque, estrellas) y le pone a andar.
function moverNpc(s, c, x, alLlegar) {
  const dx = x - c.x;
  if (Math.abs(dx) < 8) { if (alLlegar) alLlegar(); return; }
  c.caminando = true;
  const humo = s.mundo === 'humo';
  const andar = `${c.sprite}-caminando`;
  if (!humo && s.textures.exists(andar)) { c.img.setTexture(andar); c.img.setScale(c.alto / c.img.height); }
  c.img.setFlipX(dx < 0 ? (MIRA[c.img.texture.key] || 1) > 0 : (MIRA[c.img.texture.key] || 1) < 0);
  const dura = Math.abs(dx) / (humo ? 90 : 110) * 1000;
  const balanceo = s.tweens.add({ targets: c.img, angle: { from: -5, to: 5 }, duration: humo ? 420 : 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  const cosas = [c.img, c.marca, c.zona, c.est].filter(Boolean);
  s.tweens.add({
    targets: cosas, x: `+=${dx}`, duration: dura, ease: 'Sine.inOut',
    onUpdate: () => { c.x = c.img.x; },
    onComplete: () => {
      balanceo.remove();
      if (!c.img.active) return;
      c.img.setAngle(0);
      c.x = c.img.x;
      c.caminando = false;
      if (!humo && c.img.texture.key === andar) { c.img.setTexture(c.sprite); c.img.setScale(c.alto / c.img.height); }
      if (alLlegar) alLlegar();
    },
  });
}

// Pone una pose un rato y vuelve a la suya (cada uno con su propio reloj).
function poseUnRato(s, c, clave, ms) {
  if (!c.img || !c.img.active || c.recorte || !s.textures.exists(clave)) return false;
  const poner = k => { if (c.img.active && !c.caminando) { c.img.setTexture(k); c.img.setScale(c.alto / c.img.height); } };
  poner(clave);
  s.tweens.add({ targets: c.img, scaleX: c.img.scaleX * 1.12, scaleY: c.img.scaleY * 0.9, duration: 90, yoyo: true });
  if (c.vuelta) c.vuelta.remove();
  c.vuelta = s.time.delayedCall(ms, () => poner(c.sprite));
  return true;
}

function efectoActividad(s, c, fx) {
  const x = c.x;
  const y = c.y - c.alto * 0.6;
  if (fx === 'pedo') {
    const clave = s.textures.exists('fx-nube-pedo') ? 'fx-nube-pedo' : 'humo';
    const n = s.add.image(x - 30, c.y - c.alto * 0.25, clave).setDepth(c.y + 1).setAlpha(0.85).setScale(0.05);
    if (clave === 'humo') n.setTint(0xc8a83c);
    s.tweens.add({ targets: n, scale: clave === 'humo' ? 0.35 : 70 / n.height, y: n.y - 60, alpha: 0, duration: 2200, onComplete: () => n.destroy() });
  } else if (fx === 'cascaras' || fx === 'migas') {
    for (let i = 0; i < 6; i++) {
      const m = s.add.image(x, y, 'miga').setTint(fx === 'cascaras' ? 0x6b5a45 : 0xffc2dc).setDepth(c.y + 1);
      s.tweens.add({ targets: m, x: x + Phaser.Math.Between(-90, 90), y: c.y - Phaser.Math.Between(0, 20), angle: 360, duration: 600, delay: i * 90, ease: 'Quad.in', onComplete: () => s.tweens.add({ targets: m, alpha: 0, delay: 1500, duration: 400, onComplete: () => m.destroy() }) });
    }
  } else if (fx === 'sudor') {
    const g = s.textures.exists('fx-gota-sudor') ? s.add.image(x + 40, y - 20, 'fx-gota-sudor') : s.add.ellipse(x + 40, y - 20, 14, 20, HEX.azul).setStrokeStyle(3, HEX.tinta);
    if (g.texture) g.setScale(36 / g.height);
    g.setDepth(c.y + 1);
    s.tweens.add({ targets: g, y: g.y + 50, alpha: 0, duration: 1200, onComplete: () => g.destroy() });
  } else if (fx === 'notas') {
    for (let i = 0; i < 3; i++) {
      const n = texto(s, x + Phaser.Math.Between(-40, 40), y, Phaser.Utils.Array.GetRandom(['♪', '♫']), 30, COLOR.azul).setDepth(c.y + 1);
      s.tweens.add({ targets: n, y: y - 90, x: n.x + Phaser.Math.Between(-30, 30), alpha: 0, duration: 1600, delay: i * 300, onComplete: () => n.destroy() });
    }
  } else if (fx === 'calada') {
    for (let i = 0; i < 3; i++) {
      const h = s.add.image(x + 20, c.y - c.alto * 0.75, 'humo').setScale(0.05).setTint(0xe8e2f0).setAlpha(0.8).setDepth(c.y + 1);
      s.tweens.add({ targets: h, scale: 0.18, alpha: 0, y: h.y - 80, duration: 1500, delay: 600 + i * 250, onComplete: () => h.destroy() });
    }
  }
}

// Una cosa suya: pose, efecto, frase corta y (si toca) que los demás reaccionen.
function hacerLoSuyo(s, c) {
  const humo = s.mundo === 'humo';
  // Cap. 6: Perico grita el secreto por el bar y los demás se ríen (nadie le cree).
  if (c.id === 'perico' && (ESTADO.capitulo || 0) === 5 && stat('secretoPerico') < 1 && humo && Math.random() < 0.6) {
    if (!s.voz(() => s.burbujaAmbiente(c, Phaser.Utils.Array.GetRandom(['¡VUPER ES MONCHIMAN!', '¡Que Vuper es Monchiman, os lo juro!', 'Pin pin… ¡MONCHIMAN! ¡VUPER!'])), { prioridad: 2, dura: 2600 })) return;
    s.time.delayedCall(900, () => s.cosas.filter(o => o !== c && o.img && o.img.active).forEach(o => poseUnRato(s, o, { lasslow: 'lasslow-risa-floja', palicaso: 'palicaso-riendo' }[o.id] || o.sprite, 1500)));
    return;
  }
  const a = ACTIVIDADES[c.id] || {};
  let ok;
  if (humo) ok = a.humo && poseUnRato(s, c, a.humo, 2600);
  else {
    // De día: echan un piti o se ríen solos.
    const pose = Phaser.Utils.Array.GetRandom(['fumando-calada', 'riendo', 'hablando']);
    ok = poseUnRato(s, c, `${c.sprite}-${pose}`, 2600);
    if (ok && pose === 'fumando-calada') efectoActividad(s, c, 'calada');
  }
  if (!ok) return;
  if (humo && a.fx) efectoActividad(s, c, a.fx);
  // El emote de cada uno (dibujos de Gemini): mareo de Blancaso, chispas de Palicaso, corazón de Cotine…
  const emote = { blancaso: 'mareo', palicaso: 'chispas', cotine: 'corazon', puky: 'calavera', perico: 'rayo' }[c.id];
  if (humo && emote && typeof Comic !== 'undefined') Comic.emote(s, c.x, c.y - c.alto - 30, emote, { tam: emote === 'mareo' ? 90 : 60 });
  if (humo && a.sonido && Math.abs(c.x - s.px) < 600) sfx(s, a.sonido, { volume: 0.3 });
  // La frase solo si hay turno; la acción (pose, efecto) se ve igual.
  if (humo && a.dice && Math.random() < 0.6 && !(s.burbuja && s.burbuja.active)) s.voz(() => s.burbujaAmbiente(c, Phaser.Utils.Array.GetRandom(a.dice)), { dura: 2300 });
  if (humo && a.reaccion) {
    // El pedo de Lasslow: los de al lado se dan cuenta.
    s.time.delayedCall(900, () => s.cosas.filter(o => o !== c && o.img && o.img.active && Math.abs(o.x - c.x) < 500).forEach((o, i) => {
      s.time.delayedCall(i * 250, () => {
        const clave = { palicaso: 'palicaso-contando', pompa: 'pompa-horror', perico: 'perico-horror', blancaso: 'blancaso-mareado', puky: 'puky-horror' }[o.id];
        if (clave) poseUnRato(s, o, clave, 1600);
      });
    }));
  }
}

// Cada pocos segundos, alguien de la sala hace algo.
function rutinasNpc(s, dt) {
  if (s.modal || s.cambiando || !s.cosas) return;
  s.tRutina = (s.tRutina ?? 4) - dt;
  if (s.tRutina > 0) return;
  s.tRutina = Phaser.Math.FloatBetween(4, 8);
  const libres = s.cosas.filter(c => npcLibre(s, c) && Math.abs(c.x - s.px) > 200);
  if (!libres.length) return;
  const c = Phaser.Utils.Array.GetRandom(libres);
  // La Pompa de noche está colgada del techo: no pasea. Perico en la mirilla, tampoco.
  const quieto = (s.mundo === 'humo' && (c.id === 'pompa' || c.id === 'perico')) || c.tipo === 'puerta' && s.mundo === 'humo';
  if (!quieto && Math.random() < 0.5) {
    c.casa = c.casa ?? c.x;
    const destino = Phaser.Math.Clamp(c.casa + Phaser.Math.Between(-140, 140), 120, ANCHO - 120);
    moverNpc(s, c, destino);
  } else hacerLoSuyo(s, c);
}

// ---------- El paradero: cada uno está en un solo sitio ----------
// Quien sale de visita deja de estar en su casa: se le ve irse andando hacia la salida que toca,
// el viaje tarda, llega andando por el borde por el que viene, se queda un rato y vuelve igual.
// ESTADO.paradero[id] = { sala, llega, hasta, desde } (hasta = 0: vuelve a casa y ahí se borra).
// No salen Palicaso ni Perico (la barra y la puerta siempre atendidas), ni quien tenga un problema,
// un encargo o un recado pendiente.

const VISITANTES = ['cotine', 'lasslow', 'blancaso', 'puky'];
const VIAJE_MS = 9000;

function casaDe(id) {
  for (const [n, s] of Object.entries(SALAS)) if (s.cosas.some(c => c.id === id)) return n;
  return null;
}
// Dónde está alguien ahora mismo (si va de camino, todavía no ha llegado a ningún sitio visible).
function dondeEsta(id) {
  const p = ESTADO.paradero && ESTADO.paradero[id];
  return p ? p.sala : casaDe(id);
}
// ¿Está a la vista en esta sala? (en casa y sin viaje, o de visita ya llegado)
function estaEn(id, sala) {
  const p = ESTADO.paradero && ESTADO.paradero[id];
  if (!p) return casaDe(id) === sala;
  return p.sala === sala && Date.now() >= p.llega;
}

// Por dónde se sale (o se entra) de esta sala hacia otra: x del borde o de la puerta.
function bordeHacia(s, sala) {
  const r = s.ruta(sala);
  if (r.startsWith('Ve a: «')) return -90;
  if (r.endsWith('»')) return ANCHO + 90;
  if (r.includes('Puerta')) return s.sala === 'fuera' ? 860 : 130;
  return Math.random() < 0.5 ? -90 : ANCHO + 90;
}

function quitarCosa(s, c) {
  [c.img, c.zona, c.marca, c.est].forEach(o => { if (o && o.active) o.destroy(); });
  c.oculta = true;
}

function salirAndando(s, c, haciaSala) {
  if (!c || !c.img || !c.img.active) return;
  const x = bordeHacia(s, haciaSala);
  const porPuerta = x > 0 && x < ANCHO;
  moverNpc(s, c, x, () => {
    if (porPuerta) s.tweens.add({ targets: c.img, alpha: 0, duration: 300, onComplete: () => quitarCosa(s, c) });
    else quitarCosa(s, c);
  });
}

// Monta a alguien de visita (sentado, o llegando andando desde `desdeSala`).
function montarVisita(s, id, desdeSala) {
  const humo = s.mundo === 'humo';
  const sprite = humo ? QUIEN[id].sprite : `n-${id}`;
  if (!s.textures.exists(sprite)) return null;
  const suelo = SALAS[s.sala].suelo;
  const ocupados = s.cosas.filter(c => !c.oculta).map(c => c.x).concat([s.px]);
  const huecos = [260, 420, 580, 740, 900, 1040].filter(x => ocupados.every(o => Math.abs(o - x) > 170));
  const x = huecos.length ? Phaser.Utils.Array.GetRandom(huecos) : 640;
  const alto = s.textures.get(sprite).getSourceImage().height;
  const c = s.montarCosa({ id, tipo: 'charla', sprite, x, y: suelo[1] - 12, escala: (humo ? 170 : 290) / alto, nombre: `${QUIEN[id].nombre} (de visita)`, visita: true });
  s.cosas.push(c);
  if (desdeSala) {
    const desde = bordeHacia(s, desdeSala);
    [c.img, c.zona, c.marca, c.est].filter(Boolean).forEach(o => { o.x = desde; });
    c.x = desde;
    moverNpc(s, c, x, () => {
      const v = (VISITAS[s.sala] || []).find(k => k.id === id);
      if (v) s.voz(() => { if (c.img && c.img.active) s.burbujaAmbiente(c, Phaser.Utils.Array.GetRandom(v.dice)); }, { prioridad: 2, dura: 2400, encolar: true });
    });
  }
  return c;
}

// Vuelve a montar a alguien en su casa, entrando andando desde `desdeSala`.
function llegarACasa(s, id, desdeSala) {
  const def = SALAS[s.sala].cosas.find(c => c.id === id);
  if (!def || s.cosas.some(c => c.id === id && !c.oculta)) return;
  const humo = s.mundo === 'humo';
  if (def.soloHumo && !humo) return;
  const c = s.montarCosa(humo ? def : { ...def, ...(def.n || {}) });
  s.cosas.push(c);
  const destino = c.x;
  const desde = bordeHacia(s, desdeSala);
  [c.img, c.zona, c.marca, c.est].filter(Boolean).forEach(o => { o.x = desde; });
  c.x = desde;
  moverNpc(s, c, destino);
}

// Lo que hay a la vista al entrar en una sala: las visitas que ya han llegado.
function visitasDeSala(s, nombre) {
  if (!ESTADO.paradero) return [];
  const out = [];
  Object.entries(ESTADO.paradero).forEach(([id, p]) => {
    if (p.sala === nombre && nombre !== casaDe(id) && Date.now() >= p.llega) {
      const c = montarVisita(s, id, null);
      if (c) { s.cosas.pop(); out.push(c); }
    }
  });
  return out;
}

// Cada segundo: salidas, llegadas y vueltas.
function agendaVisitas(s) {
  if (typeof guiaActiva === 'function' && guiaActiva()) return;
  if (s.modal || s.cambiando) return;
  ESTADO.paradero = ESTADO.paradero || {};
  const ahora = Date.now();
  for (const [id, p] of Object.entries(ESTADO.paradero)) {
    const casa = casaDe(id);
    // Llega a donde iba.
    if (!p.llegado && ahora >= p.llega) {
      p.llegado = true;
      if (p.sala === casa) {
        delete ESTADO.paradero[id];
        if (s.sala === casa) llegarACasa(s, id, p.desde);
      } else if (s.sala === p.sala && !s.cosas.some(c => c.id === id && !c.oculta)) montarVisita(s, id, p.desde || casa);
      guardarPartida();
      continue;
    }
    // Se acaba la visita: vuelve a casa.
    if (p.hasta && ahora >= p.hasta) {
      const visita = s.sala === p.sala && s.cosas.find(c => c.id === id && !c.oculta);
      ESTADO.paradero[id] = { sala: casa, llega: ahora + VIAJE_MS, hasta: 0, desde: p.sala };
      if (visita) salirAndando(s, visita, casa);
      guardarPartida();
    }
  }
  // ¿Sale alguien?
  if (ahora < (ESTADO.proximaVisita || 0)) return;
  ESTADO.proximaVisita = ahora + Phaser.Math.Between(45, 85) * 1000;
  const humo = s.mundo === 'humo';
  const r = ESTADO.recado;
  const cand = VISITANTES.filter(id => !ESTADO.paradero[id] && !ESTADO.situaciones[id]
    && !(id === 'blancaso' && (ESTADO.blancazo || ESTADO.blancazoEn > 0)) && !(id === 'puky' && !(ESTADO.pukyInvitado && humo))
    && !(s.reparto && s.reparto.destino.id === id) && !(r && (r.a === id || r.de === id))
    && s.textures.exists(humo ? QUIEN[id].sprite : `n-${id}`));
  if (!cand.length) return;
  const id = Phaser.Utils.Array.GetRandom(cand);
  const casa = casaDe(id);
  const destinos = Object.entries(VISITAS).filter(([n, l]) => n !== casa && SALAS[n] && l.some(v => v.id === id)).map(([n]) => n);
  if (!destinos.length) return;
  const dest = Phaser.Utils.Array.GetRandom(destinos);
  ESTADO.paradero[id] = { sala: dest, llega: ahora + VIAJE_MS, hasta: ahora + Phaser.Math.Between(70, 140) * 1000, desde: casa };
  guardarPartida();
  // Si estás en su casa, le ves irse hacia la salida que toca.
  if (s.sala === casa) salirAndando(s, s.cosas.find(c => c.id === id && !c.oculta), dest);
}

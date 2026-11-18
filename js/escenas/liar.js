// Liar: primer plano sobre la bandeja de VOPPË, con tus manos (guantes de tela en el mundo normal,
// manos de nube en el humo; generadas en Gemini el 29/10/2026). Seis pasos, cada uno con su gesto:
//   1. Picar: aporrear; las manos desmenuzan y cae al montón.
//   2. La boquilla: la mano la lleva de un lado a otro sobre el papel; pulsar cuando esté en la marca.
//   3. Rellenar: mantener; la mano espolvorea recorriendo el papel; soltar en la zona verde.
//   4. Liar: aporrear; las manos enrollan.
//   5. Pegar: pulsar en el centro; las manos aprietan la costura.
//   6. Encender: insistir con el mechero, que falla, como todos.
// La nota media dice qué tal ha quedado (la CALIDAD: chustero, dedo gordo, apañao, obra de arte) y cómo lo has
// liado decide la FORMA (zanahoria, trompeta, cucurucho...). Se dibuja por código y se guarda en ESTADO.porroForma.

const PAPEL = { x: 640, y: 400, ancho: 520, alto: 160 };
const MONTON = { x: 340, y: 560 };
// Con el dedo no hay ESPACIO ni flechas: los dos pasos que las nombran, dichos para los botones táctiles.
const AYUDA_PASOS_MOVIL = {
  picar: 'Aporrea el botón (o toca) para desmenuzar',
  retorcer: 'Toca ◄ y ► a un lado y a otro para retorcerla',
};
const DEF_PASOS = {
  picar: { id: 'picar', titulo: 'Pica', ayuda: 'Aporrea ESPACIO (o toca) para desmenuzar' },
  boquilla: { id: 'boquilla', titulo: 'La boquilla', ayuda: 'Pulsa cuando la boquilla esté sobre la marca verde' },
  rellenar: { id: 'rellenar', titulo: 'Rellena', ayuda: 'MANTÉN para echar y suelta en la zona verde' },
  cruzar: { id: 'cruzar', titulo: 'Cruza el segundo papel', ayuda: 'Pulsa justo cuando los dos papeles se crucen (3 veces)' },
  liar: { id: 'liar', titulo: 'Lía', ayuda: 'Aporrea para enrollar' },
  pegar: { id: 'pegar', titulo: 'Pega', ayuda: 'Pulsa cuando la marca esté en el centro' },
  retorcer: { id: 'retorcer', titulo: 'Retuerce la punta', ayuda: 'Alterna ← → (o toca a un lado y a otro) para retorcerla' },
  encender: { id: 'encender', titulo: 'Enciende', ayuda: 'Dale al mechero hasta que prenda' },
};

// ======================================================================================
// LOS TIPOS DE LIADO (ampliación 16/11/2026). Cada uno cambia los pasos, las tolerancias y lo que da después:
//   dur = cuánto dura el porro · sube = colocón que da · margen = pulso que pide la calada (más = más fácil)
//   pase = lo que cuesta cada pase (menos = aguanta más pasadas) · bono = puntos extra (o menos) a la nota del liado
//   aj = ajustes del liado: picar/liar = golpes · relleno = zona buena (%) · tol = tolerancia de boquilla y pegado · marca = ancho de la marca
// El resultado sigue pasando por FORMA × CALIDAD: el tipo solo empuja qué formas salen (`formas`).
// `desde` = fumadas que hacen falta para tenerlo (stat `fumadas`); la primera vez solo está el recto.
// ======================================================================================
const TIPOS_LIAR = {
  recto: {
    nombre: 'Recto clásico', frase: 'El de toda la vida: seis pasos y a fumar.', efecto: 'Sin sorpresas. Dura lo normal.', desde: 0,
    dur: 1, sube: 1, margen: 1, pase: 1, bono: 0,
    pasos: ['picar', 'boquilla', 'rellenar', 'liar', 'pegar', 'encender'], aj: { picar: 14, liar: 10, relleno: [60, 80], tol: 18, marca: 64 },
  },
  fino: {
    nombre: 'Fino de diario', frase: 'Rápido y flaquito, sin pegar. Para el día a día.', efecto: 'Casi no falla, pero dura poco y cada pase se lo come.', desde: 1,
    dur: 0.65, sube: 0.8, margen: 1.15, pase: 1.3, bono: -4,
    pasos: ['picar', 'boquilla', 'rellenar', 'liar', 'encender'], aj: { picar: 9, liar: 7, relleno: [30, 50], tol: 28, marca: 90 },
    formas: ['palillo', 'palillo', 'clasico'], puro: false,
  },
  cono: {
    nombre: 'Cono', frase: 'Ancho de boca y fino de punta. Pide paciencia.', efecto: 'Dura más y sube más, pero pide más relleno y más enrollado.', desde: 2,
    dur: 1.35, sube: 1.15, margen: 0.95, pase: 0.9, bono: 0,
    pasos: ['picar', 'boquilla', 'rellenar', 'liar', 'pegar', 'encender'], aj: { picar: 18, liar: 14, relleno: [70, 90], tol: 18, marca: 56 },
    formas: ['cucurucho', 'trompeta', 'zanahoria'],
  },
  tulipan: {
    nombre: 'Tulipán', frase: 'La punta se retuerce como una flor. Con mucho estilo.', efecto: 'Un paso más (retorcer la punta). Sube mucho y dura algo más.', desde: 4,
    dur: 1.1, sube: 1.3, margen: 1, pase: 1, bono: 3,
    pasos: ['picar', 'boquilla', 'rellenar', 'liar', 'pegar', 'retorcer', 'encender'], aj: { picar: 14, liar: 10, relleno: [60, 80], tol: 16, marca: 64, retorcer: 8 },
    formas: ['trompeta', 'trompeta', 'cucurucho', 'zanahoria'], puro: false,
  },
  cruzado: {
    nombre: 'El cruzado', frase: 'Dos papeles en cruz. Solo para valientes.', efecto: 'Dura el doble y aguanta más pasadas, pero la calada pide pulso firme.', desde: 6,
    dur: 1.7, sube: 1.35, margen: 0.9, pase: 0.7, bono: 6,
    pasos: ['picar', 'boquilla', 'rellenar', 'cruzar', 'liar', 'pegar', 'encender'], aj: { picar: 16, liar: 14, relleno: [62, 80], tol: 14, marca: 48, cruces: 3 },
    formas: ['puro', 'churro', 'zanahoria'],
  },
};
const ORDEN_TIPOS = ['recto', 'fino', 'cono', 'tulipan', 'cruzado'];
function tipoDesbloqueado(id) { return stat('fumadas') >= TIPOS_LIAR[id].desde; }
// Las manos: ancho en pantalla y punto de trabajo (yemas, boquilla, porro o llama) como origen,
// medido sobre cada imagen con una rejilla del 10 % (29/10/2026).
const MANOS = {
  normal: { pref: 'mano-n', ancho: { 1: 470, 3: 430, 4: 720, 5: 720, 6: 380 }, origen: { 1: [0.5, 0.2], 3: [0.39, 0.27], 4: [0.5, 0.38], 5: [0.5, 0.42], 6: [0.48, 0.25] } },
  humo: { pref: 'mano-h', ancho: { 1: 380, 3: 210, 4: 580, 5: 580, 6: 240 }, origen: { 1: [0.5, 0.45], 3: [0.08, 0.42], 4: [0.5, 0.35], 5: [0.5, 0.25], 6: [0.7, 0.1] } },
};

// ======================================================================================
// EL PORRO CON FORMA Y CALIDAD (todo por código, con Graphics; lo comparten Liar y Fumar).
//   FORMA   = lo que parece (zanahoria, trompeta, cucurucho...): sale de cómo lo has liado.
//   CALIDAD = qué tal está hecho (chustero, dedo gordo, apañao, obra de arte): sale de la nota.
//   MUNDO   = el acabado: «normal» es papel real, apagado; «humo» es neón, humo y brillos.
// Se guarda en ESTADO.porroForma = { forma, calidad, nombre, nota } y Fumar dibuja exactamente ese.
// ======================================================================================

// Las formas. radio(t) y curva(t): t = 0 es la punta de la brasa (a la izquierda) y t = 1 la boquilla.
const FORMAS_PORRO = {
  clasico: { nombre: 'Un clásico', de: 'cono de toda la vida', frase: 'Cónico, recto y de toda la vida.', largo: 320, radio: t => 19 - 11 * t, curva: () => 0, color: null, punta: 'hierba' },
  zanahoria: { nombre: 'Una zanahoria', de: 'zanahoria', frase: 'Cónica, torcida y con sus hojitas.', largo: 320, radio: t => 6 + 17 * Math.pow(1 - t, 0.9), curva: t => 15 * Math.sin(t * Math.PI * 1.3), color: 0xf59a3a, punta: 'hojas', extra: 'aros' },
  trompeta: { nombre: 'Una trompeta', de: 'trompeta', frase: 'Se abre al final. Suena a fiesta.', largo: 320, radio: t => 7 + 27 * Math.pow(1 - t, 3.2), curva: () => 0, color: 0xe8b830, punta: 'campana' },
  cucurucho: { nombre: 'Un cucurucho', de: 'cucurucho', frase: 'Con su bola de helado y todo.', largo: 300, radio: t => 7 + 19 * (1 - t), curva: () => 0, color: 0xe9c27e, punta: 'bola', extra: 'waffle' },
  palillo: { nombre: 'Un palillo', de: 'palillo', frase: 'Fino, finísimo. Casi un secreto.', largo: 350, radio: t => 6 - t, curva: () => 0, color: null, punta: 'hierba' },
  puro: { nombre: 'El puro', de: 'puro', frase: 'Gordo, señorial y con su anilla.', largo: 290, radio: t => 24 - 3 * t, curva: () => 0, color: 0x9a5f2e, punta: 'plano', sinFiltro: true, extra: 'anilla' },
  churro: { nombre: 'Un churro', de: 'churro', frase: 'Rayado, dorado y un poco ondulado.', largo: 300, radio: () => 16, curva: t => 6 * Math.sin(t * Math.PI * 2), color: 0xd9a24b, punta: 'hierba', extra: 'rayas' },
};

// Las calidades (de peor a mejor). Cada una lleva sus nombres graciosos y cuánto margen da en la calada.
const CALIDADES_PORRO = [
  { id: 'chustero', nombres: ['Un chustero', 'Una penca'], texto: 'Arrugado, torcido y con el papel roto.', desde: 0, margen: 0.85, glow: 0x7ee081 },
  { id: 'dedo', nombres: ['Un dedo gordo', 'Un morcillón'], texto: 'Gordote y deforme, pero tira.', desde: 45, margen: 0.95, glow: 0xff9a3c },
  { id: 'apanao', nombres: ['Un apañao', 'Un porro de andar por casa'], texto: 'Limpio y a su manera. Cumple.', desde: 65, margen: 1, glow: 0x39f0ff },
  { id: 'obra', nombres: ['Obra de arte', 'Una joya'], texto: 'Perfecto, con brillo y destellos.', desde: 85, margen: 1.15, glow: 0xff5fa2 },
];

function calidadDePorro(nota) {
  let q = 0;
  CALIDADES_PORRO.forEach((c, i) => { if (nota >= c.desde) q = i; });
  return q;
}

// La forma sale de cómo lo has liado: pasarte de relleno = puro, quedarte corto = palillo, y si no, una al azar.
function elegirFormaPorro(relleno, notas, tipo) {
  const T = tipo && TIPOS_LIAR[tipo];
  // Un tipo de liado empuja las formas que salen (el recto sigue como siempre).
  if (T && T.formas) {
    if (relleno > 0.92 && T.puro !== false) return 'puro';
    return Phaser.Utils.Array.GetRandom(T.formas);
  }
  if (relleno > 0.92) return 'puro';
  if (relleno < 0.4) return 'palillo';
  const liar = (notas && notas[3]) || 70;
  const pool = liar >= 80 ? ['clasico', 'cucurucho', 'zanahoria', 'trompeta', 'churro'] : ['zanahoria', 'trompeta', 'cucurucho', 'churro', 'zanahoria'];
  return Phaser.Utils.Array.GetRandom(pool);
}

// El porro que usa Fumar: el que se acaba de liar (misma nota) o, si no hay ninguno, uno inventado.
function porroActual(nota) {
  const p = ESTADO.porroForma;
  if (p && FORMAS_PORRO[p.forma] && (nota === undefined || p.nota === nota)) return p;
  const n = nota === undefined ? 70 : nota;
  const calidad = calidadDePorro(n);
  const hecho = { forma: elegirFormaPorro(0.7, [70, 70, 70, 70]), calidad, nombre: Phaser.Utils.Array.GetRandom(CALIDADES_PORRO[calidad].nombres), nota: n };
  ESTADO.porroForma = hecho;
  return hecho;
}

// «Una zanahoria: un chustero» · «Obra de arte en forma de trompeta».
function nombreDePorro(p) {
  const f = FORMAS_PORRO[p.forma];
  if (p.calidad === 3) return `${p.nombre} en forma de ${f.de}`;
  return `${f.nombre}: ${p.nombre.charAt(0).toLowerCase()}${p.nombre.slice(1)}`;
}

function mezclaColor(a, b, k) {
  const c = s => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k);
  return (c(16) << 16) | (c(8) << 8) | c(0);
}
// Apaga un color hacia el gris (el mundo normal tiene colores de papel real).
function apagarColor(c, k) {
  const g = Math.round((((c >> 16) & 255) + ((c >> 8) & 255) + (c & 255)) / 3);
  return mezclaColor(c, (g << 16) | (g << 8) | g, k);
}

// Geometría de la forma retocada por la calidad: el chustero sale torcido y desigual, el dedo gordo, hinchado.
function geomPorro(f, q) {
  if (q === 0) {
    return {
      largo: f.largo * 0.94,
      radio: t => Math.max(4, f.radio(t) * (0.8 + 0.2 * Math.sin(t * 13 + 1) + 0.08 * Math.sin(t * 29))),
      curva: t => f.curva(t) + 9 * Math.sin(t * 8 + 0.5) + 16 * Math.sin(t * 2.4),
    };
  }
  if (q === 1) {
    return {
      largo: f.largo * 0.86,
      radio: t => f.radio(t) * 1.28 + 5 * Math.sin(Math.PI * t) + 2.5 * Math.sin(t * 17),
      curva: t => f.curva(t) * 0.5 + 3 * Math.sin(t * 5),
    };
  }
  return { largo: f.largo, radio: f.radio, curva: f.curva };
}

// Dibuja el porro centrado en (0, 0) con la brasa a la izquierda y la boquilla a la derecha.
function dibujarPorro(g, id, mundo, q) {
  const f = FORMAS_PORRO[id] || FORMAS_PORRO.clasico;
  const noche = mundo === 'humo';
  const G = geomPorro(f, q);
  const L = G.largo, N = 30;
  const X = t => -L / 2 + t * L;
  const R = t => G.radio(t), C = t => G.curva(t);
  const tinta = HEX.tinta;
  // Banda entre dos alturas relativas (k = -1 arriba, 1 abajo) de un tramo; grow la ensancha (contorno, halo).
  const banda = (t0, t1, k0, k1, grow = 0) => {
    const pts = [];
    for (let i = 0; i <= N; i++) { const t = t0 + (t1 - t0) * i / N; pts.push({ x: X(t) + (t0 === 0 && i === 0 ? -grow : 0), y: C(t) + k0 * (R(t) + grow) }); }
    for (let i = N; i >= 0; i--) { const t = t0 + (t1 - t0) * i / N; pts.push({ x: X(t) + (t1 === 1 && i === N ? grow : 0), y: C(t) + k1 * (R(t) + grow) }); }
    return pts;
  };
  const veta = (t0, t1, k, ancho, color, alfa = 1) => {
    g.lineStyle(ancho, color, alfa).beginPath();
    for (let i = 0; i <= 14; i++) { const t = t0 + (t1 - t0) * i / 14; const x = X(t), y = C(t) + k * R(t); if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.strokePath();
  };
  const cruce = (t, k0, k1, ancho, color, alfa = 1) => g.lineStyle(ancho, color, alfa).lineBetween(X(t), C(t) + k0 * R(t), X(t), C(t) + k1 * R(t));
  const destello = (cx, cy, r, color) => {
    g.fillStyle(color, 1).fillPoints([{ x: cx, y: cy - r }, { x: cx + r * 0.26, y: cy - r * 0.26 }, { x: cx + r, y: cy }, { x: cx + r * 0.26, y: cy + r * 0.26 }, { x: cx, y: cy + r }, { x: cx - r * 0.26, y: cy + r * 0.26 }, { x: cx - r, y: cy }, { x: cx - r * 0.26, y: cy - r * 0.26 }], true);
  };

  g.translateCanvas(460, 260);
  g.scaleCanvas(2, 2);

  // Colores según el mundo: el normal es papel real y apagado; el humo es plano y saturado.
  let papel = f.color || (noche ? 0xf2fbff : 0xf3efe6);
  if (!noche && f.color) papel = apagarColor(f.color, 0.4);
  if (q === 0) papel = mezclaColor(papel, 0x8d8470, noche ? 0.25 : 0.38);
  if (q === 3) papel = mezclaColor(papel, 0xffffff, 0.18);
  const sombra = mezclaColor(papel, 0x000000, 0.14);
  const filtro = noche ? 0xffd9a0 : 0xcfb08a;
  const fx = f.sinFiltro ? 1 : 0.86;

  // Sombra en el suelo (solo el normal) o halo de neón (el humo).
  if (!noche) {
    g.fillStyle(0x000000, 0.16).fillEllipse(6, C(0.5) + R(0.5) + 20, L * 0.9, 18);
  } else {
    const glow = CALIDADES_PORRO[q].glow;
    g.fillStyle(glow, 0.12).fillPoints(banda(0, 1, -1, 1, 20), true);
    g.fillStyle(glow, 0.22).fillPoints(banda(0, 1, -1, 1, 12), true);
  }
  // Contorno grueso, papel, sombra por debajo, boquilla.
  g.fillStyle(tinta, 1).fillPoints(banda(0, 1, -1, 1, 7), true);
  g.fillStyle(papel, 1).fillPoints(banda(0, fx, -1, 1), true);
  g.fillStyle(sombra, 1).fillPoints(banda(0, fx, 0.4, 1), true);
  if (!f.sinFiltro) {
    g.fillStyle(filtro, 1).fillPoints(banda(fx, 1, -1, 1), true);
    [0.25, 0.5, 0.75].forEach(i => cruce(fx + (1 - fx) * i, -0.9, 0.9, 2, mezclaColor(filtro, 0x000000, 0.35)));
    cruce(fx, -1, 1, 4, tinta);
  }
  veta(0.07, fx - 0.04, 0.45, 3, mezclaColor(papel, 0x000000, 0.22));        // la costura
  veta(0.08, fx - 0.06, -0.55, 3, 0xffffff, noche ? 0.55 : 0.4);              // el brillo del papel

  // Adornos propios de cada forma.
  if (f.extra === 'aros') [0.22, 0.42, 0.6, 0.76].forEach(t => cruce(t, -0.7, 0.2, 3, mezclaColor(papel, 0x000000, 0.3)));
  if (f.extra === 'waffle') {
    for (let t = 0.06; t < 0.8; t += 0.1) {
      g.lineStyle(2.5, mezclaColor(papel, 0x000000, 0.3), 1);
      g.lineBetween(X(t), C(t) - R(t) * 0.85, X(t + 0.08), C(t + 0.08) + R(t + 0.08) * 0.85);
      g.lineBetween(X(t + 0.08), C(t + 0.08) - R(t + 0.08) * 0.85, X(t), C(t) + R(t) * 0.85);
    }
  }
  if (f.extra === 'rayas') for (let t = 0.07; t < 0.84; t += 0.075) cruce(t, -0.95, 0.95, 3, mezclaColor(papel, 0x000000, 0.3));
  if (f.extra === 'anilla') {
    g.fillStyle(tinta, 1).fillPoints(banda(0.36, 0.48, -1, 1, 3), true);
    g.fillStyle(noche ? 0xffd23f : 0xc9a24a, 1).fillPoints(banda(0.375, 0.465, -1, 1, 0.5), true);
    cruce(0.42, -0.85, 0.85, 2, noche ? 0xff7a2f : 0x8a6a22);
  }

  // La punta de la brasa.
  const x0 = X(0), y0 = C(0), r0 = R(0);
  const hierba = noche ? 0x6fe05a : 0x5f8a45;
  if (f.punta === 'hierba') {
    g.fillStyle(tinta, 1).fillEllipse(x0 - 3, y0, 24, r0 * 2 + 4);
    g.fillStyle(hierba, 1).fillEllipse(x0 - 3, y0, 17, r0 * 2 - 4);
  } else if (f.punta === 'hojas') {
    [[-0.9, 30], [0, 36], [0.9, 30]].forEach(([a, l]) => {
      const ang = Math.PI + a * 0.55, px = x0 - 2, py = y0;
      const pts = [{ x: px, y: py - 7 }, { x: px + Math.cos(ang) * l - 5, y: py + Math.sin(ang) * l - 9 }, { x: px + Math.cos(ang) * l + 5, y: py + Math.sin(ang) * l + 9 }, { x: px, y: py + 7 }];
      g.fillStyle(tinta, 1).fillPoints([{ x: pts[0].x, y: pts[0].y - 3 }, { x: pts[1].x - 3, y: pts[1].y - 3 }, { x: pts[2].x - 3, y: pts[2].y + 3 }, { x: pts[3].x, y: pts[3].y + 3 }], true);
      g.fillStyle(noche ? 0x5fe06a : 0x5f8a45, 1).fillPoints(pts, true);
    });
  } else if (f.punta === 'bola') {
    g.fillStyle(tinta, 1).fillCircle(x0 - r0 * 0.5, y0, r0 + 11);
    g.fillStyle(noche ? 0x8fffd0 : 0x9ccbb3, 1).fillCircle(x0 - r0 * 0.5, y0, r0 + 6);
    g.fillStyle(0xffffff, noche ? 0.7 : 0.45).fillCircle(x0 - r0 * 0.5 - 8, y0 - 9, 6);
    g.fillStyle(noche ? 0xff5f7a : 0xb05a5a, 1).fillCircle(x0 - r0 * 0.5 + 3, y0 - r0 - 4, 5);
  } else if (f.punta === 'campana') {
    g.fillStyle(tinta, 1).fillEllipse(x0, y0, 22, r0 * 2 + 8);
    g.fillStyle(mezclaColor(papel, 0x000000, 0.5), 1).fillEllipse(x0 - 1, y0, 15, r0 * 2 - 2);
    g.fillStyle(hierba, 1).fillEllipse(x0 - 2, y0, 8, r0 * 1.2);
  } else {
    g.fillStyle(tinta, 1).fillEllipse(x0, y0, 20, r0 * 2 + 6);
    g.fillStyle(mezclaColor(papel, 0x000000, 0.3), 1).fillEllipse(x0, y0, 12, r0 * 2 - 2);
  }
  // La brasa (en la bola del cucurucho, encima; en lo demás, en la punta).
  const rb = Math.min(13, Math.max(7, r0 * 0.6));
  const bx = f.punta === 'bola' ? x0 - r0 * 0.5 : x0 - 4;
  if (noche) g.fillStyle(0xffd23f, 0.35).fillCircle(bx, y0, rb + 10);
  g.fillStyle(noche ? 0xff7a2f : 0xd9692a, 1).fillCircle(bx, y0, rb);
  g.fillStyle(noche ? 0xffe27a : 0xe9a24a, 1).fillCircle(bx - 2, y0 - 2, rb * 0.45);

  // El carácter de cada calidad.
  if (q === 0) {
    // Arrugas, un mordisco en el papel con la hierba asomando y hilachas.
    for (let t = 0.12; t < 0.8; t += 0.11) g.lineStyle(2.5, mezclaColor(papel, 0x000000, 0.4), 1).lineBetween(X(t), C(t) - R(t) * 0.5, X(t + 0.035), C(t + 0.035) + R(t) * 0.1);
    const rot = [];
    for (let i = 0; i <= 6; i++) { const t = 0.4 + i * 0.03; rot.push({ x: X(t), y: C(t) - R(t) * (i % 2 ? 0.2 : -0.95) }); }
    g.fillStyle(tinta, 1).fillPoints(rot, true);
    g.fillStyle(hierba, 1).fillPoints(rot.map((p, i) => ({ x: p.x, y: p.y + (i % 2 ? -2 : 3) })), true);
    [-0.6, 0, 0.6].forEach((k, i) => g.lineStyle(2.5, mezclaColor(papel, 0xffffff, 0.4), 1).lineBetween(x0 - 8, y0 + k * r0, x0 - 24 - i * 3, y0 + k * r0 * 1.8 + (i - 1) * 3));
    if (!noche) g.fillStyle(0x6b4a2a, 0.25).fillCircle(X(0.62), C(0.62) + R(0.62) * 0.2, 9);
  }
  if (q === 1) {
    // Los nudillos del dedo gordo.
    [0.3, 0.55].forEach(t => {
      g.lineStyle(2.5, mezclaColor(papel, 0x000000, 0.38), 1);
      g.lineBetween(X(t), C(t) - R(t) * 0.35, X(t) + 4, C(t) + R(t) * 0.1);
      g.lineBetween(X(t) + 4, C(t) + R(t) * 0.1, X(t) - 1, C(t) + R(t) * 0.4);
    });
    g.fillStyle(noche ? 0xffb0a0 : 0xe3b9a6, 0.4).fillPoints(banda(0.05, 0.4, -0.9, -0.1), true);
  }
  if (q === 3) {
    // Brillo y destellos: la costura de oro y estrellitas.
    veta(0.1, fx - 0.08, -0.2, 2.5, noche ? 0xffe27a : 0xe3cf9a, 0.9);
    const n = noche ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const t = 0.1 + (i + 0.4) / n * 0.75;
      destello(X(t) + 6, C(t) - R(t) - 22 - (i % 2) * 16, noche ? 14 - (i % 2) * 4 : 9, noche ? 0xffffff : 0xf4e9c4);
    }
    if (noche) destello(x0 - 38, y0 - r0 - 12, 12, 0xffd23f);
  }
  // Humo del mundo humo saliendo de la brasa (quieto; en pantalla se mueve aparte).
  if (noche) [[-6, -34, 11], [-18, -56, 8], [-4, -76, 6]].forEach(([dx, dy, rr]) => g.fillStyle(0xe8e2f0, 0.5).fillCircle(x0 + dx, y0 - r0 + dy, rr));
}

// Genera (una vez) la textura del porro con esa forma, calidad y mundo. 920 x 520 (el doble), con el centro en medio.
function texturaPorro(scene, id, mundo, q) {
  const clave = `porro-${mundo}-${id}-${q}`;
  if (scene.textures.exists(clave)) return clave;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  dibujarPorro(g, id, mundo, q);
  g.generateTexture(clave, 920, 520);
  g.destroy();
  return clave;
}

class Liar extends Phaser.Scene {
  constructor() { super('Liar'); }

  create(datos) {
    this.datos = datos || {};
    this.normal = this.datos.mundo === 'normal';
    this.paso = -1;
    this.humoTimer = null;
    this.porro = null;
    // scene.start reutiliza la instancia: lo de la partida anterior no puede quedarse puesto.
    this.activo = false;
    this.pulsando = false;
    this.cuenta = 0;
    this.intentos = 0;
    this.lado = 1;
    this.notas = [];
    this.estado = { picado: 0, relleno: 0, enrollado: 0, boquilla: null, sellado: false, encendido: false, enManos: false };
    // Tipo de liado y acompañantes: la primera vez (aún sin fumadas) solo el recto y los de siempre, sin menús.
    this.selectorAbierto = false;
    this.tipo = 'recto';
    this.compas = compasValidos(ESTADO.sofaCompas, this.normal ? 'normal' : 'humo');
    if (stat('fumadas') >= 1 && ESTADO.sofaTipo && TIPOS_LIAR[ESTADO.sofaTipo] && tipoDesbloqueado(ESTADO.sofaTipo)) this.tipo = ESTADO.sofaTipo;
    this.fijarTipo(this.tipo);

    fondo(this, this.normal ? 'bgn-sofa' : 'bg-sofa');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.55);
    // La bandeja de VOPPË, con la bolsita abierta en una esquina.
    const b = this.add.graphics();
    b.fillStyle(0x000000, 0.35).fillRoundedRect(182, 226, 940, 440, 46);
    b.fillStyle(HEX.tinta, 1).fillRoundedRect(170, 210, 940, 440, 46);
    b.fillStyle(0xc77dff, 1).fillRoundedRect(184, 222, 912, 414, 38);
    b.fillStyle(0xb066f0, 1).fillRoundedRect(214, 252, 852, 354, 28);
    this.add.text(1040, 590, 'VOPPË', { fontFamily: FUENTE, fontSize: '34px', color: '#9a52d8' }).setOrigin(1, 0.5);
    this.add.image(250, 300, 'obj-bolsita').setScale(0.8).setAngle(-18);
    this.g = this.add.graphics().setDepth(2);
    this.boquillaImg = this.add.image(0, 0, 'obj-boquilla').setVisible(false).setDepth(3);
    this.llama = this.add.container(0, 0).setVisible(false).setDepth(4);
    this.mano = this.add.image(0, 0, `${MANOS[this.normal ? 'normal' : 'humo'].pref}-1`).setVisible(false).setDepth(10);

    this.titulo = texto(this, ANCHO / 2, 64, '', 52, COLOR.amarillo).setDepth(20);
    this.ayuda = texto(this, ANCHO / 2, 128, '', 26, COLOR.crema, 1000).setDepth(20);
    this.puntitos = [];
    this.medidor = this.add.container(0, 0).setDepth(15);
    this.pintarPuntitos();

    this.teclas = this.input.keyboard.addKeys('SPACE,LEFT,RIGHT,ENTER');
    this.pulsando = false;
    this.input.on('pointerdown', (p, sobre) => {
      if (sobre.length || this.selectorAbierto) return;
      this.pulsando = true;
      // En «retorcer» se toca a un lado y a otro de la pantalla.
      if (this.activo && this.pasos[this.paso] === 'retorcer') return this.pulsar(true, p.x < ANCHO / 2 ? -1 : 1);
      this.pulsar();
    });
    this.input.on('pointerup', () => { this.pulsando = false; this.soltar(); });
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat && !this.selectorAbierto) this.pulsar(); });
    this.input.keyboard.on('keydown-LEFT', () => this.pulsar(true, -1));
    this.input.keyboard.on('keydown-RIGHT', () => this.pulsar(true, 1));
    this.input.keyboard.on('keyup-SPACE', () => this.soltar());

    this.pintar();
    entrar(this, datos);
    // Con alguna fumada a la espalda: primero se elige con quién y cómo (la primera vez, directo a liar).
    const abrir = () => { if (stat('fumadas') >= 1) this.abrirSelector(); else this.siguiente(); };
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 500, abrir);
  }

  // Deja el tipo de liado puesto: sus pasos, sus tolerancias y sus puntitos.
  fijarTipo(id) {
    this.tipo = id;
    const T = TIPOS_LIAR[id];
    this.pasos = T.pasos.slice();
    this.A = T.aj;
  }

  pintarPuntitos() {
    this.puntitos.forEach(p => p.destroy());
    const n = this.pasos.length;
    this.puntitos = this.pasos.map((_, i) => this.add.circle(ANCHO / 2 - (n - 1) * 25 + i * 50, 172, 10, 0x3d3350).setStrokeStyle(3, HEX.tinta).setDepth(20));
  }

  // ---------- Las manos ----------

  // Saca la mano n con su punto de trabajo en (x, y). En el mundo normal entra desde abajo
  // (son tus manos); en el humo aparece con rebote.
  sacarMano(n, x, y) {
    const cfg = MANOS[this.normal ? 'normal' : 'humo'];
    const m = this.mano;
    this.tweens.killTweensOf(m);
    m.setTexture(`${cfg.pref}-${n}`).setOrigin(...cfg.origen[n]).setAngle(0).setAlpha(1).setVisible(true);
    m.escala = cfg.ancho[n] / m.width;
    // En el normal son tus brazos: la manga tiene que salir por debajo de la pantalla, sin que se vea el corte.
    if (this.normal) m.escala = Math.max(m.escala, (ALTO + 30 - y) / ((1 - cfg.origen[n][1]) * m.height));
    m.setScale(m.escala);
    m.base = { x, y };
    if (this.normal) {
      m.setPosition(x, y + 420);
      this.tweens.add({ targets: m, y, duration: 380, ease: 'Back.out' });
    } else {
      m.setPosition(x, y).setScale(0);
      this.tweens.add({ targets: m, scale: m.escala, duration: 320, ease: 'Back.out' });
    }
  }

  retirarMano() {
    const m = this.mano;
    this.tweens.killTweensOf(m);
    if (this.normal) this.tweens.add({ targets: m, y: m.y + 460, duration: 320, ease: 'Sine.in', onComplete: () => m.setVisible(false) });
    else this.tweens.add({ targets: m, scale: 0, alpha: 0, duration: 240, ease: 'Back.in', onComplete: () => m.setVisible(false) });
  }

  // Sacudida corta (desmenuzar, enrollar): alterna de lado en cada golpe.
  meneo(dx, ang) {
    const m = this.mano;
    this.lado = -(this.lado || 1);
    this.tweens.add({ targets: m, x: m.base.x + dx * this.lado, angle: ang * this.lado, duration: 70, yoyo: true, ease: 'Sine.out' });
    this.tweens.add({ targets: m, scaleY: m.escala * 0.95, scaleX: m.escala * 1.03, duration: 70, yoyo: true });
  }

  // ---------- Pasos ----------

  siguiente(nota) {
    if (nota !== undefined) {
      this.notas.push(nota);
      this.puntitos[this.paso].setFillStyle(nota >= 80 ? 0x7ee081 : nota >= 50 ? HEX.amarillo : HEX.rojo);
      golpeTexto(this, ANCHO / 2, 300, nota >= 80 ? '¡Perfecto!' : nota >= 50 ? 'Vale' : 'Uf…', nota >= 80 ? COLOR.verde : COLOR.amarillo, 44).setDepth(30);
    }
    this.paso++;
    this.medidor.removeAll(true);
    this.t0 = this.time.now;
    this.cuenta = 0;
    if (this.paso >= this.pasos.length) return this.time.delayedCall(700, () => this.terminado());
    const p = DEF_PASOS[this.pasos[this.paso]];
    this.activo = false;
    this.time.delayedCall(nota !== undefined ? 700 : 0, () => {
      this.titulo.setText(`${this.paso + 1}. ${p.titulo}`).setScale(0);
      this.tweens.add({ targets: this.titulo, scale: 1, duration: 300, ease: 'Back.out' });
      this.ayuda.setText((MOVIL && AYUDA_PASOS_MOVIL[p.id]) || p.ayuda);
      this.puntitos[this.paso].setFillStyle(0xffffff);
      this.preparar(p.id);
      this.t0 = this.time.now;
      this.activo = true;
    });
  }

  preparar(id) {
    const izq = PAPEL.x - PAPEL.ancho / 2;
    const der = PAPEL.x + PAPEL.ancho / 2;
    if (id === 'picar') {
      this.sacarMano(1, MONTON.x + 20, MONTON.y - 110);
      this.barraProgreso();
    }
    if (id === 'boquilla') {
      // La marca verde en el extremo del papel; la mano con la boquilla va y viene.
      this.objetivoX = der - 40;
      const marca = this.add.rectangle(this.objetivoX, PAPEL.y, this.A.marca, PAPEL.alto - 20).setStrokeStyle(5, 0x7ee081);
      this.tweens.add({ targets: marca, alpha: 0.4, duration: 300, yoyo: true, repeat: -1 });
      this.medidor.add(marca);
      this.sacarMano(3, izq + 40, PAPEL.y);
      this.time.delayedCall(400, () => this.tweens.add({ targets: this.mano, x: der + 30, duration: 950, yoyo: true, repeat: -1, ease: 'Sine.inOut' }));
    }
    if (id === 'rellenar') {
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(1130, 230, 60, 380, 16);
      const [lo, hi] = this.A.relleno;
      g.fillStyle(0x7ee081, 0.9).fillRect(1140, 600 - 360 * hi / 100, 40, 360 * (hi - lo) / 100);
      this.medidor.add(g);
      this.llenado = this.add.rectangle(1160, 600, 30, 0, 0xffffff).setOrigin(0.5, 1);
      this.medidor.add(this.llenado);
      this.medidor.add(texto(this, 1160, 630, 'Lleno', 18, COLOR.crema));
      this.sacarMano(1, izq + 60, PAPEL.y - 70);
    }
    if (id === 'liar') {
      this.estado.enManos = true;
      this.pintar();
      this.sacarMano(4, PAPEL.x, PAPEL.y);
      this.barraProgreso();
    }
    if (id === 'cruzar') {
      // Dos papeles que se cruzan en una barra: pulsar justo cuando coinciden (tantas veces como pida el tipo).
      const y = 250;
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(ANCHO / 2 - 260, y - 20, 520, 40, 14);
      g.fillStyle(0x7ee081, 1).fillRect(ANCHO / 2 - 4, y - 16, 8, 32);
      this.medidor.add(g);
      this.cruces = [];
      this.curA = this.add.rectangle(ANCHO / 2 - 250, y, 12, 46, 0xffffff).setStrokeStyle(3, HEX.tinta);
      this.curB = this.add.rectangle(ANCHO / 2 + 250, y, 12, 46, 0xffd23f).setStrokeStyle(3, HEX.tinta);
      this.medidor.add([this.curA, this.curB]);
      this.tweens.add({ targets: this.curA, x: ANCHO / 2 + 250, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: this.curB, x: ANCHO / 2 - 250, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (id === 'retorcer') {
      if (!this.mano.visible) this.sacarMano(5, PAPEL.x, PAPEL.y);
      this.cuentaRetorcer = 0;
      this.ultimoLado = 0;
      this.barraProgreso();
    }
    if (id === 'pegar') {
      this.sacarMano(5, PAPEL.x, PAPEL.y);
      const y = 250;
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(ANCHO / 2 - 260, y - 20, 520, 40, 14);
      g.fillStyle(0x7ee081, 1).fillRect(ANCHO / 2 - 22, y - 14, 44, 28);
      this.medidor.add(g);
      this.cursor = this.add.rectangle(ANCHO / 2 - 250, y, 10, 46, 0xffffff).setStrokeStyle(3, HEX.tinta);
      this.medidor.add(this.cursor);
      this.objetivoX = ANCHO / 2;
      this.tweens.add({ targets: this.cursor, x: ANCHO / 2 + 250, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    if (id === 'encender') {
      this.intentos = 0;
      this.sacarMano(6, izq - 26, PAPEL.y + 4);
    }
  }

  barraProgreso() {
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(ANCHO / 2 - 260, 232, 520, 26, 12);
    this.medidor.add(g);
    this.progreso = this.add.rectangle(ANCHO / 2 - 252, 245, 0, 14, HEX.amarillo).setOrigin(0, 0.5);
    this.medidor.add(this.progreso);
  }

  pulsar(flecha, lado) {
    if (!this.activo) return;
    const id = this.pasos[this.paso];
    const izq = PAPEL.x - PAPEL.ancho / 2;
    if (id === 'picar') {
      this.cuenta++;
      this.estado.picado = Math.min(1, this.cuenta / this.A.picar);
      this.progreso.width = 504 * this.estado.picado;
      sfx(this, 'fup', { volume: 0.4, rate: 0.9 + Math.random() * 0.4 });
      this.meneo(10, 4);
      this.migas(this.mano.base.x, this.mano.base.y + 10, 5, MONTON.y);
      this.pintar();
      if (this.cuenta >= this.A.picar) {
        const s = (this.time.now - this.t0) / 1000;
        this.activo = false;
        this.retirarMano();
        this.siguiente(Math.round(Phaser.Math.Clamp(100 - (s - 2.5) * 15, 40, 100)));
      }
    } else if (id === 'liar') {
      this.cuenta++;
      this.estado.enrollado = Math.min(1, this.cuenta / this.A.liar);
      this.progreso.width = 504 * this.estado.enrollado;
      sfx(this, 'papel', { volume: 0.35, rate: 1 + Math.random() * 0.3 });
      this.meneo(14, 6);
      if (this.cuenta >= this.A.liar) {
        const s = (this.time.now - this.t0) / 1000;
        this.activo = false;
        // Sin paso de pegar (el fino), el porro queda listo en cuanto lo enrollas.
        if (!this.pasos.includes('pegar')) {
          this.time.delayedCall(500, () => { this.estado.sellado = true; this.estado.enrollado = 1; this.estado.enManos = false; this.retirarMano(); this.pintar(); });
        }
        this.siguiente(Math.round(Phaser.Math.Clamp(100 - (s - 2) * 18, 40, 100)));
      }
    } else if (id === 'cruzar' && !flecha) {
      // Dos papeles que se cruzan: nota por lo cerca que estaban los dos marcadores.
      const d = Math.abs(this.curA.x - this.curB.x);
      const n = Math.round(Phaser.Math.Clamp(100 - Math.max(0, d - 14) * 0.7, 20, 100));
      this.cruces.push(n);
      sfx(this, 'pop', { volume: 0.5, rate: 0.9 + this.cruces.length * 0.15 });
      golpeTexto(this, ANCHO / 2, 320, n >= 85 ? '¡Cruzado!' : n >= 55 ? 'Casi' : 'Torcido', n >= 85 ? COLOR.verde : COLOR.crema, 36).setDepth(30);
      if (this.cruces.length >= this.A.cruces) {
        this.tweens.killTweensOf(this.curA); this.tweens.killTweensOf(this.curB);
        this.activo = false;
        this.siguiente(Math.round(this.cruces.reduce((a, b) => a + b, 0) / this.cruces.length));
      }
    } else if (id === 'retorcer' && flecha) {
      // Retorcer la punta: hay que alternar izquierda y derecha (repetir el mismo lado no cuenta).
      if (lado === this.ultimoLado) return;
      this.ultimoLado = lado;
      this.cuentaRetorcer++;
      this.progreso.width = 504 * Math.min(1, this.cuentaRetorcer / this.A.retorcer);
      sfx(this, 'papel', { volume: 0.35, rate: 1.1 + Math.random() * 0.3 });
      this.meneo(18, 9);
      if (this.cuentaRetorcer >= this.A.retorcer) {
        const s = (this.time.now - this.t0) / 1000;
        this.activo = false;
        this.retirarMano();
        this.estado.enManos = false;
        this.pintar();
        golpeTexto(this, ANCHO / 2, 520, '¡Punta en flor!', COLOR.rosa, 38).setDepth(30);
        this.siguiente(Math.round(Phaser.Math.Clamp(100 - (s - 2.5) * 16, 40, 100)));
      }
    } else if (id === 'boquilla' && !flecha) {
      this.tweens.killTweensOf(this.mano);
      const x = this.mano.x;
      const error = Math.abs(x - this.objetivoX);
      const nota = Math.round(Phaser.Math.Clamp(100 - Math.max(0, error - this.A.tol) * 0.6, 20, 100));
      this.activo = false;
      // Baja, la deja y se va.
      this.tweens.add({
        targets: this.mano, y: this.mano.y + 14, duration: 120, yoyo: true,
        onYoyo: () => { this.estado.boquilla = x; sfx(this, 'pop'); this.pintar(); },
        onComplete: () => this.retirarMano(),
      });
      this.siguiente(nota);
    } else if (id === 'pegar' && !flecha) {
      this.tweens.killTweensOf(this.cursor);
      const error = Math.abs(this.cursor.x - this.objetivoX);
      const nota = Math.round(Phaser.Math.Clamp(100 - Math.max(0, error - this.A.tol) * 0.6, 20, 100));
      this.activo = false;
      const m = this.mano;
      this.tweens.add({ targets: m, scaleY: m.escala * 0.92, scaleX: m.escala * 1.04, duration: 110, yoyo: true, repeat: 1 });
      sfx(this, 'sorbo', { volume: 0.6 });
      golpeTexto(this, ANCHO / 2, 520, '¡Slurp!', COLOR.rosa, 40).setDepth(30);
      // En el tulipán, después hay que retorcer la punta: el porro sigue en las manos.
      const sigueEnManos = this.pasos[this.paso + 1] === 'retorcer';
      this.time.delayedCall(500, () => {
        this.estado.sellado = true;
        this.estado.enrollado = 1;
        if (!sigueEnManos) { this.estado.enManos = false; this.retirarMano(); }
        this.pintar();
      });
      this.siguiente(nota);
    } else if (id === 'encender' && !flecha) {
      this.intentos++;
      const m = this.mano;
      this.tweens.add({ targets: m, angle: -10, y: m.base.y + 6, duration: 70, yoyo: true });
      const chispas = this.add.particles(izq - 26, PAPEL.y, 'miga', {
        speed: { min: 60, max: 200 }, scale: { start: 0.5, end: 0 }, lifespan: 300, tint: [0xffd23f, 0xff7a2f], emitting: false,
      }).setDepth(12);
      chispas.explode(10);
      this.time.delayedCall(400, () => chispas.destroy());
      // El mechero falla a veces, como todos los mecheros.
      if (this.intentos < 2 || Math.random() > 0.45) {
        sfx(this, 'mechero-falla', { volume: 0.7 });
        if (this.intentos === 4) golpeTexto(this, ANCHO / 2, 300, 'Venga, hombre…', COLOR.crema, 36).setDepth(30);
        return;
      }
      sfx(this, 'mechero');
      this.activo = false;
      this.estado.encendido = true;
      this.pintar();
      this.time.delayedCall(500, () => this.retirarMano());
      this.siguiente(Math.round(Phaser.Math.Clamp(124 - this.intentos * 12, 40, 100)));
    }
  }

  soltar() {
    if (!this.activo || this.pasos[this.paso] !== 'rellenar' || this.estado.relleno <= 0) return;
    this.activo = false;
    const r = this.estado.relleno * 100;
    const [lo, hi] = this.A.relleno;
    const nota = r >= lo && r <= hi ? 100 : Math.round(Phaser.Math.Clamp(100 - Math.min(Math.abs(r - lo), Math.abs(r - hi)) * 3, 20, 100));
    if (r > 92) golpeTexto(this, ANCHO / 2, 520, '¡Te has pasado!', COLOR.rosa, 36).setDepth(30);
    if (r < 40) golpeTexto(this, ANCHO / 2, 520, 'Esto va a salir flaco…', COLOR.crema, 32).setDepth(30);
    this.retirarMano();
    this.siguiente(nota);
  }

  update(_t, dms) {
    if (!this.activo) return;
    if (this.pasos[this.paso] === 'rellenar' && (this.pulsando || this.teclas.SPACE.isDown)) {
      this.estado.relleno = Math.min(1, this.estado.relleno + dms / 1000 * 0.42);
      this.llenado.setSize(30, 360 * this.estado.relleno); // setSize recoloca el ancla: crece hacia arriba
      this.llenado.fillColor = this.estado.relleno > 0.8 ? HEX.rojo : 0xffffff;
      // La mano recorre el papel espolvoreando, con un temblor de dedos.
      const izq = PAPEL.x - PAPEL.ancho / 2;
      const x = izq + 60 + (PAPEL.ancho - 180) * Math.min(1, this.estado.relleno / 0.8);
      this.mano.setPosition(x + Math.sin(this.time.now / 40) * 4, PAPEL.y - 70 + Math.sin(this.time.now / 55) * 3);
      this.mano.base = { x, y: PAPEL.y - 70 };
      if (Math.random() < 0.6) this.migas(x, PAPEL.y - 60, 1, PAPEL.y);
      this.pintar();
      if (this.estado.relleno >= 1) this.soltar();
    }
  }

  // Trocitos verdes que caen de los dedos hasta `hasta` (el montón o el papel).
  migas(x, y, n, hasta) {
    for (let i = 0; i < n; i++) {
      const m = this.add.circle(x + Phaser.Math.Between(-18, 18), y, Phaser.Math.Between(3, 6), Phaser.Utils.Array.GetRandom([0x6fbf4a, 0x4e9a35, 0x8fd46a])).setDepth(9);
      this.tweens.add({ targets: m, y: hasta + Phaser.Math.Between(-8, 8), x: m.x + Phaser.Math.Between(-14, 14), duration: Phaser.Math.Between(260, 420), ease: 'Quad.in', onComplete: () => m.destroy() });
    }
  }

  // Dibuja el montón, el papel, el relleno, el porro enrollado, la boquilla y la brasa.
  pintar() {
    const g = this.g;
    const e = this.estado;
    g.clear();
    // Montoncito picado en la bandeja.
    if (e.picado > 0 && e.relleno < 0.05) {
      g.fillStyle(0x4e9a35, 1);
      const n = Math.floor(e.picado * 30);
      for (let i = 0; i < n; i++) g.fillCircle(MONTON.x + ((i * 37) % 110) - 55, MONTON.y + 10 - ((i * 13) % 34), 9);
      g.fillStyle(0x8fd46a, 1);
      for (let i = 0; i < n / 2; i++) g.fillCircle(MONTON.x + ((i * 53) % 90) - 45, MONTON.y + 4 - ((i * 17) % 28), 5);
    }
    this.boquillaImg.setVisible(false);
    if (e.enManos) { this.llama.setVisible(false); return; } // lo tienen las manos
    const izq = PAPEL.x - PAPEL.ancho / 2;
    const der = PAPEL.x + PAPEL.ancho / 2;
    const liado = e.enrollado >= 1;
    if (!liado) {
      g.fillStyle(0x000000, 0.25).fillRoundedRect(izq + 8, PAPEL.y - PAPEL.alto / 2 + 10, PAPEL.ancho, PAPEL.alto, 6);
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(izq - 6, PAPEL.y - PAPEL.alto / 2 - 6, PAPEL.ancho + 12, PAPEL.alto + 12, 8);
      g.fillStyle(0xfffdf6, 1).fillRoundedRect(izq, PAPEL.y - PAPEL.alto / 2, PAPEL.ancho, PAPEL.alto, 6);
      g.fillStyle(0xe9e2d0, 1).fillRect(izq, PAPEL.y + PAPEL.alto / 2 - 18, PAPEL.ancho, 12);
      if (e.relleno > 0) {
        g.fillStyle(0x4e9a35, 1);
        const h = 70 * e.relleno;
        const largo = (PAPEL.ancho - 120) * Math.min(1, e.relleno / 0.8);
        g.fillRoundedRect(izq + 20, PAPEL.y - h / 2, Math.max(10, largo), Math.max(6, h), 10);
        g.fillStyle(0x8fd46a, 1);
        for (let x = izq + 30; x < izq + 20 + largo; x += 22) g.fillCircle(x, PAPEL.y - h / 4 + ((x * 7) % 9), 4);
      }
      if (e.boquilla !== null) {
        const bx = Phaser.Math.Clamp(e.boquilla, der - 80, der - 10);
        this.boquillaImg.setVisible(true).setPosition(bx, PAPEL.y).setScale(0.8, 1.6).setAngle(90);
      }
    } else {
      // El porro liado: cono (ancho a la izquierda, boquilla a la derecha) con su costura.
      const ancho = 30 + e.relleno * 18;
      g.fillStyle(0x000000, 0.25).fillTriangle(izq + 10, PAPEL.y + 14 - ancho, izq + 10, PAPEL.y + 14 + ancho, der + 10, PAPEL.y + 14);
      g.fillStyle(HEX.tinta, 1);
      g.fillPoints([{ x: izq - 6, y: PAPEL.y - ancho - 6 }, { x: der - 60, y: PAPEL.y - 22 }, { x: der - 60, y: PAPEL.y + 22 }, { x: izq - 6, y: PAPEL.y + ancho + 6 }], true);
      g.fillStyle(0xfffdf6, 1);
      g.fillPoints([{ x: izq, y: PAPEL.y - ancho }, { x: der - 64, y: PAPEL.y - 16 }, { x: der - 64, y: PAPEL.y + 16 }, { x: izq, y: PAPEL.y + ancho }], true);
      if (e.sellado) g.lineStyle(3, 0xd8cfb8, 1).lineBetween(izq + 14, PAPEL.y + ancho * 0.35, der - 70, PAPEL.y + 6);
      g.fillStyle(0x4e9a35, 1).fillEllipse(izq, PAPEL.y, 16, ancho * 2 - 6);
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(der - 66, PAPEL.y - 22, 70, 44, 8);
      g.fillStyle(0xe4c08a, 1).fillRoundedRect(der - 62, PAPEL.y - 18, 62, 36, 6);
      g.lineStyle(2, 0xb98d55, 1);
      [der - 50, der - 34, der - 18].forEach(x => g.lineBetween(x, PAPEL.y - 16, x - 6, PAPEL.y + 16));
    }
    if (e.encendido && !this.llama.visible) {
      this.llama.removeAll(true).setVisible(true);
      const brasa = this.add.circle(izq - 2, PAPEL.y, 20, 0xff7a2f);
      this.llama.add([this.add.circle(izq - 2, PAPEL.y, 34, 0xffd23f, 0.35), brasa]);
      this.tweens.add({ targets: brasa, alpha: 0.6, scale: 1.15, duration: 220, yoyo: true, repeat: -1 });
      this.humoTimer = this.time.addEvent({
        delay: 240, loop: true, callback: () => {
          const h = this.add.image(izq - 10, PAPEL.y - 20, this.normal ? 'niebla' : 'humo').setScale(this.normal ? 0.25 : 0.08).setAlpha(0.7).setTint(0xe8e2f0).setDepth(5);
          this.tweens.add({ targets: h, y: h.y - 170, x: h.x - 30 + Math.random() * 60, scale: this.normal ? 0.8 : 0.3, alpha: 0, duration: 1700, onComplete: () => h.destroy() });
        },
      });
    }
  }

  terminado() {
    const T = TIPOS_LIAR[this.tipo];
    // La nota (con el bono del tipo: el cruzado premia al valiente, el fino resta) decide la CALIDAD
    // (chustero, dedo gordo, apañao, obra de arte) y cómo lo has liado, la FORMA.
    const media = Phaser.Math.Clamp(Math.round(this.notas.reduce((a, b) => a + b, 0) / this.notas.length) + T.bono, 0, 100);
    const calidad = calidadDePorro(media);
    const C = CALIDADES_PORRO[calidad];
    const forma = elegirFormaPorro(this.estado.relleno, this.notas, this.tipo);
    const porro = { forma, calidad, nombre: Phaser.Utils.Array.GetRandom(C.nombres), nota: media, tipo: this.tipo };
    ESTADO.porroForma = porro;
    ESTADO.sofaTipo = this.tipo;
    guardarPartida();
    this.porro = porro;
    this.titulo.setText(nombreDePorro(porro));
    if (this.titulo.width > 1180) this.titulo.setScale(1180 / this.titulo.width);
    this.ayuda.setText(`${T.nombre}. ${FORMAS_PORRO[forma].frase} ${C.texto}\n${T.efecto}`);
    sfx(this, calidad >= 2 ? 'campanita' : 'rimshot');
    // Fuera las manos y el humo viejo: el protagonista ahora es el porro, con su forma.
    if (this.humoTimer) this.humoTimer.remove();
    this.estado.enManos = true;
    this.pintar();
    this.llama.setVisible(false);
    this.retirarMano();
    this.presentarPorro(porro, media);
    const ir = () => irA(this, 'Fumar', { calidad: media, mundo: this.datos.mundo, porro, tipo: this.tipo, compas: this.compas });
    boton(this, ANCHO / 2, 640, MOVIL ? '¡A fumar!' : '¡A fumar! (E)', ir, { ancho: 320, color: HEX.verde }).setDepth(40);
    this.input.keyboard.once('keydown-E', ir);
    this.input.keyboard.once('keydown-ENTER', ir);
  }

  // Presentación del porro terminado: gira, brilla y «¡tachán!». Queda grande, flotando, con el sello de la nota.
  presentarPorro(porro, media) {
    const mundo = this.normal ? 'normal' : 'humo';
    const clave = texturaPorro(this, porro.forma, mundo, porro.calidad);
    const k = 0.5 * 1.75;
    const cx = ANCHO / 2, cy = 400;
    const img = this.add.image(cx, cy, clave).setDepth(12).setScale(0).setAngle(-540);
    // Un fogonazo detrás y el giro con rebote.
    const flash = this.add.circle(cx, cy, 40, 0xffffff, 0.9).setDepth(11);
    this.tweens.add({ targets: flash, scale: 4.5, alpha: 0, duration: 520, ease: 'Quad.out', onComplete: () => flash.destroy() });
    this.tweens.add({ targets: img, scale: k, angle: -3, duration: 760, ease: 'Back.out', onComplete: () => {
      // Flota con una oscilación suave.
      this.tweens.add({ targets: img, y: cy - 14, angle: 2, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    } });
    this.time.delayedCall(560, () => {
      golpeTexto(this, ANCHO / 2, 540, porro.calidad === 3 ? '¡Tachán!' : porro.calidad === 0 ? '¡Tachán… supongo!' : '¡Tachán!', porro.calidad === 3 ? COLOR.amarillo : COLOR.crema, 54).setDepth(30);
      Comic.impacto(this, cx - 120, cy - 40, { tam: 70, profundidad: 20 });
      if (porro.calidad === 3) { Comic.confeti(this, { n: 16, profundidad: 25 }); sfx(this, 'tiroriro', { volume: 0.5 }); }
      else if (porro.calidad === 0) sfx(this, 'pedo', { volume: 0.35 });
    });
    // Destellos que saltan alrededor (más cuanto mejor está hecho).
    const n = [2, 3, 5, 9][porro.calidad];
    for (let i = 0; i < n; i++) {
      this.time.delayedCall(700 + i * 160, () => {
        const e = this.add.star(cx + Phaser.Math.Between(-250, 250), cy + Phaser.Math.Between(-110, 70), 4, 4, 16, i % 2 ? 0xffffff : 0xffd23f).setDepth(13).setScale(0);
        this.tweens.add({ targets: e, scale: 1, angle: 90, duration: 280, yoyo: true, ease: 'Sine.out', onComplete: () => e.destroy() });
      });
    }
    // El sello con la nota, al lado.
    const sello = this.add.container(cx + 330, cy - 150).setDepth(14).setScale(0).setAngle(12);
    sello.add(this.add.circle(0, 0, 62, HEX.tinta));
    sello.add(this.add.circle(0, 0, 54, [0xff5fa2, 0xffd23f, 0x39f0ff, 0x7ee081][porro.calidad]));
    sello.add(texto(this, 0, -8, `${media}`, 52, COLOR.crema));
    sello.add(texto(this, 0, 28, '/ 100', 18, COLOR.crema));
    this.tweens.add({ targets: sello, scale: 1, duration: 360, delay: 900, ease: 'Back.out' });
    this.porroImg = img;
  }
}

// ======================================================================================
// EL SELECTOR de antes de liar: «¿Con quién te lo fumas?» (hasta 2) y «¿Cómo lo lías?».
// Solo sale a partir de la segunda vez (la primera, directo a liar). Por defecto, lo de la última vez.
// Si la historia obliga a alguien (pásale el porro a Blancaso), sale fijo, con candado.
// ======================================================================================
Object.assign(Liar.prototype, {

  abrirSelector() {
    this.selectorAbierto = true;
    this.activo = false;
    const mundo = this.normal ? 'normal' : 'humo';
    const ids = compasDisponibles(mundo);
    const obl = compasObligados();
    const raiz = this.add.container(0, 0).setDepth(100);
    this.selRaiz = raiz;
    // Un fondo que se come los clics (nada de aporrear el liado por debajo).
    const velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.93).setInteractive();
    raiz.add(velo);
    raiz.add(texto(this, ANCHO / 2, 44, '¿Con quién te lo fumas?', 40, COLOR.amarillo));
    raiz.add(texto(this, ANCHO / 2, 86, obl.length ? 'Esta noche hay uno fijo. Elige el otro hueco.' : (MOVIL ? 'Hasta 2 · toca a quien quieras' : 'Hasta 2 · pulsa su número'), 20, COLOR.crema));

    // --- Las tarjetas de acompañantes ---
    const w = 158, h = 228, sep = 8, y = 222;
    const x0 = ANCHO / 2 - (ids.length * (w + sep) - sep) / 2 + w / 2;
    this.tarjetas = {};
    ids.forEach((id, i) => {
      const C = COMPAS[id];
      const c = this.add.container(x0 + i * (w + sep), y);
      const g = this.add.graphics();
      const k = this.add.image(0, -50, C.poses.humo.base);
      k.setScale(Math.min(110 / k.height, 130 / k.width));
      const nombre = texto(this, 0, 30, C.nombre, 22, COLOR.crema);
      const pista = this.add.text(0, 58, C.pista, { fontFamily: FUENTE, fontSize: '13px', color: COLOR.crema, align: 'center', wordWrap: { width: w - 18 } }).setOrigin(0.5, 0);
      const tecla = this.add.text(-w / 2 + 10, -h / 2 + 12, String(i + 1), { fontFamily: FUENTE, fontSize: '16px', color: COLOR.crema }).setOrigin(0, 0.5);
      tecla.setVisible(!MOVIL);
      c.add([g, k, nombre, pista, tecla]);
      if (obl.includes(id)) {
        // El candado: cuerpo, arco y la palabra «Fijo».
        const cd = this.add.graphics();
        cd.fillStyle(HEX.amarillo, 1).fillRoundedRect(w / 2 - 38, -h / 2 + 18, 24, 18, 4);
        cd.lineStyle(4, HEX.amarillo, 1).beginPath().arc(w / 2 - 26, -h / 2 + 18, 7, Math.PI, 0, false).strokePath();
        c.add([cd, this.add.text(w / 2 - 26, -h / 2 + 46, 'Fijo', { fontFamily: FUENTE, fontSize: '13px', color: COLOR.amarillo }).setOrigin(0.5)]);
      }
      c.setSize(w, h).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => this.alternarCompa(id));
      c.g = g;
      this.tarjetas[id] = c;
      raiz.add(c);
      this.input.keyboard.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'][i]}`, () => { if (this.selectorAbierto) this.alternarCompa(id); });
    });
    this.textoMod = this.add.text(ANCHO / 2, 356, '', { fontFamily: FUENTE, fontSize: '17px', color: COLOR.azul, align: 'center', wordWrap: { width: 1120 } }).setOrigin(0.5, 0);
    raiz.add(this.textoMod);

    // --- Los tipos de liado ---
    raiz.add(texto(this, ANCHO / 2, 418, '¿Cómo lo lías?', 34, COLOR.amarillo));
    const tw = 228, th = 118, ty = 500;
    const tx0 = ANCHO / 2 - (ORDEN_TIPOS.length * (tw + 10) - 10) / 2 + tw / 2;
    this.tarjetasTipo = {};
    ORDEN_TIPOS.forEach((id, i) => {
      const T = TIPOS_LIAR[id], abierto = tipoDesbloqueado(id);
      const c = this.add.container(tx0 + i * (tw + 10), ty);
      const g = this.add.graphics();
      const nombre = texto(this, 0, -34, T.nombre, 22, abierto ? COLOR.crema : '#9d8fb3');
      const frase = this.add.text(0, -8, abierto ? T.frase : `Se desbloquea tras ${T.desde} fumada${T.desde > 1 ? 's' : ''}`, { fontFamily: FUENTE, fontSize: '14px', color: abierto ? COLOR.crema : '#9d8fb3', align: 'center', wordWrap: { width: tw - 18 } }).setOrigin(0.5, 0);
      const tecla = this.add.text(-tw / 2 + 10, -th / 2 + 12, ['Q', 'W', 'E', 'R', 'T'][i], { fontFamily: FUENTE, fontSize: '15px', color: COLOR.crema }).setOrigin(0, 0.5);
      tecla.setVisible(!MOVIL);
      c.add([g, nombre, frase, tecla]);
      c.setSize(tw, th).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => this.elegirTipo(id));
      c.g = g;
      this.tarjetasTipo[id] = c;
      raiz.add(c);
      this.input.keyboard.on(`keydown-${['Q', 'W', 'E', 'R', 'T'][i]}`, () => { if (this.selectorAbierto) this.elegirTipo(id); });
    });
    this.textoEfecto = this.add.text(ANCHO / 2, 572, '', { fontFamily: FUENTE, fontSize: '19px', color: COLOR.verde, align: 'center', wordWrap: { width: 1100 } }).setOrigin(0.5, 0);
    raiz.add(this.textoEfecto);

    // --- Botones ---
    raiz.add(boton(this, 330, 662, 'Como siempre', () => this.comoSiempre(), { ancho: 260, alto: 58, tam: 22, color: HEX.crema }));
    raiz.add(boton(this, 820, 662, MOVIL ? '¡A liar!' : '¡A liar! (Enter)', () => this.confirmarSelector(), { ancho: 340, alto: 62, tam: 26, color: HEX.verde }));
    this.input.keyboard.on('keydown-ENTER', () => { if (this.selectorAbierto) this.confirmarSelector(); });

    this.refrescarSelector();
  },

  // «Como siempre»: los dos de siempre (con el fijo de la historia dentro, si lo hay) y el tipo recto.
  comoSiempre() {
    this.compas = compasValidos(COMPAS_POR_DEFECTO, this.normal ? 'normal' : 'humo');
    this.tipo = 'recto';
    sfx(this, 'pop', { volume: 0.4 });
    this.refrescarSelector();
  },

  alternarCompa(id) {
    if (!this.selectorAbierto) return;
    const obl = compasObligados();
    if (obl.includes(id)) {
      golpeTexto(this, ANCHO / 2, 330, 'Esta noche toca con él', COLOR.amarillo, 28).setDepth(120);
      return;
    }
    const i = this.compas.indexOf(id);
    if (i >= 0) {
      if (this.compas.length <= 1) { golpeTexto(this, ANCHO / 2, 330, 'Mejor con alguien, ¿no?', COLOR.crema, 26).setDepth(120); return; }
      this.compas.splice(i, 1);
    } else {
      // Con dos ya elegidos, entra en lugar del primero que no sea fijo.
      if (this.compas.length >= 2) { const j = this.compas.findIndex(c => !obl.includes(c)); if (j >= 0) this.compas.splice(j, 1); }
      this.compas.push(id);
    }
    // Se conserva el orden de elección (así «el primero que elegiste» es el que se va); se ordena al confirmar.
    this.compas = compasValidos(this.compas, this.normal ? 'normal' : 'humo', false);
    sfx(this, 'pop', { volume: 0.35, rate: 1.1 });
    this.refrescarSelector();
  },

  elegirTipo(id) {
    if (!this.selectorAbierto) return;
    if (!tipoDesbloqueado(id)) { golpeTexto(this, ANCHO / 2, 540, `${TIPOS_LIAR[id].nombre}: se desbloquea tras ${TIPOS_LIAR[id].desde} fumadas`, COLOR.crema, 26).setDepth(120); return; }
    this.tipo = id;
    sfx(this, 'pop', { volume: 0.35, rate: 1.3 });
    this.refrescarSelector();
  },

  refrescarSelector() {
    const obl = compasObligados();
    Object.entries(this.tarjetas).forEach(([id, c]) => {
      const sel = this.compas.includes(id);
      c.g.clear();
      c.g.fillStyle(sel ? 0x2e6b3a : 0x2a1a40, 1).fillRoundedRect(-79, -114, 158, 228, 18);
      c.g.lineStyle(sel ? 7 : 4, sel ? (obl.includes(id) ? 0xffd23f : HEX.verde) : 0x6b5a85, 1).strokeRoundedRect(-79, -114, 158, 228, 18);
      c.setAlpha(sel || this.compas.length < 2 ? 1 : 0.72);
    });
    Object.entries(this.tarjetasTipo).forEach(([id, c]) => {
      const sel = this.tipo === id, abierto = tipoDesbloqueado(id);
      c.g.clear();
      c.g.fillStyle(sel ? 0x2e6b3a : abierto ? 0x2a1a40 : 0x1d1430, 1).fillRoundedRect(-114, -59, 228, 118, 16);
      c.g.lineStyle(sel ? 7 : 4, sel ? HEX.verde : 0x6b5a85, 1).strokeRoundedRect(-114, -59, 228, 118, 16);
      c.setAlpha(abierto ? 1 : 0.6);
    });
    this.textoMod.setText(this.compas.map(id => `${COMPAS[id].nombre}: ${COMPAS[id].mod}`).join('   ·   '));
    this.textoEfecto.setText(`${TIPOS_LIAR[this.tipo].nombre}: ${TIPOS_LIAR[this.tipo].efecto}`);
  },

  confirmarSelector() {
    if (!this.selectorAbierto) return;
    this.selectorAbierto = false;
    this.compas = compasValidos(this.compas, this.normal ? 'normal' : 'humo');
    ESTADO.sofaCompas = this.compas.slice();
    ESTADO.sofaTipo = this.tipo;
    guardarPartida();
    this.fijarTipo(this.tipo);
    this.pintarPuntitos();
    this.selRaiz.destroy();
    this.selRaiz = null;
    sfx(this, 'campanita', { volume: 0.35 });
    this.siguiente();
  },
});

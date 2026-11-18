// Las cámaras de Unaké: estás sentado delante del monitor de vigilancia del bar.
// Entre 5 y 6 cámaras que reutilizan los fondos de las salas. Hay una lista de cosas que encontrar a
// contrarreloj («¿Quién se lleva los mecheros?»…): cada una la hace alguien en algún momento y en alguna
// cámara. El culpable solo cuenta mientras hace lo suyo, y a veces está a oscuras o tapado:
// - VISIÓN NOCTURNA: ve en las cámaras sin luz (y deslumbra en las que la tienen). Gasta batería.
// - TÉRMICA: ve a través de lo que tapa, y al que hace algo lo ve más caliente. Gasta más batería.
// La batería se recarga con la imagen normal: decidir cuándo usarla es el juego.
// Se marca tocando al sospechoso. Si fallas, la imagen se corta y pierdes tiempo (el reloj salta).
// Todo se dibuja con sprites que ya existen, Graphics, tintes y mezclas (vale en Canvas y en WebGL).

const CAM_SX = 28, CAM_SY = 62, CAM_SW = 960, CAM_SH = 540, CAM_ESC = 0.75;

// Cada cámara: su fondo, dónde se puede estar de pie y dónde están las «mesas» donde ocurre lo que se busca.
const CAM_DEF = [
  { id: 'barra', n: 'BARRA', bg: 'bg-dentro', suelo: [[260, 640], [520, 655], [780, 655], [1030, 640]], mesas: [[430, 480], [640, 480], [850, 480]] },
  { id: 'cocina', n: 'COCINA', bg: 'bg-cocina', suelo: [[300, 650], [560, 660], [820, 650], [1050, 640]], mesas: [[300, 465], [500, 460], [714, 445]] },
  { id: 'reservado', n: 'RESERVADO', bg: 'bg-sofa', suelo: [[250, 640], [480, 665], [800, 665], [1040, 640]], mesas: [[470, 585], [640, 585], [850, 585]] },
  { id: 'techo', n: 'TECHO', bg: 'bg-techo', suelo: [[250, 650], [520, 680], [800, 680], [1040, 650]], mesas: [[470, 575], [800, 575]] },
  { id: 'fuera', n: 'PUERTA', bg: 'bg-fuera', suelo: [[250, 620], [520, 640], [700, 600], [1030, 640]], mesas: [[850, 330]] },
  { id: 'plaza', n: 'PLAZA', bg: 'bg-plaza', suelo: [[260, 640], [500, 660], [760, 650], [1040, 640]], mesas: [[830, 485], [130, 485]] },
];

// Quién sale y a qué altura se dibuja (en el mundo de 1280×720).
const CAM_SPR = {
  palicaso: ['palicaso', 215], blancaso: ['blancaso', 215], lasslow: ['lasslow', 180], cotine: ['cotine', 215],
  pompa: ['pompa', 170], perico: ['perico', 195], puky: ['puky', 165],
};
const CAM_NOMBRE = { palicaso: 'Palicaso', blancaso: 'Blancaso', lasslow: 'Lasslow', cotine: 'Cotine', pompa: 'La Pompa', perico: 'Perico', puky: 'Puky' };

// Los casos. `accion`: cómo se mueve el culpable mientras lo hace. `cue`: lo que se ve en la mesa.
// `fase`: 'antes' (el objeto ya está ahí) o 'despues' (lo que deja a su paso).
const CAM_CASOS = [
  { id: 'mecheros', corta: 'Los mecheros', pregunta: '¿Quién se lleva los mecheros?', cue: 'obj-mechero-grande', alto: 92, cams: ['barra', 'reservado', 'cocina'], quienes: ['perico', 'puky', 'cotine', 'palicaso', 'lasslow'], peso: { perico: 3 }, accion: 'roba' },
  { id: 'tarta', corta: 'La tarta', pregunta: '¿Quién se está comiendo la tarta?', cue: 'tarta', alto: 96, cams: ['cocina', 'barra'], quienes: ['cotine', 'puky', 'palicaso', 'lasslow', 'blancaso'], peso: { cotine: 2 }, accion: 'come' },
  { id: 'puky', corta: 'Puky colado', pregunta: 'Puky se ha colado: ¿por dónde?', cue: 'fx-charco-amarillo', alto: 62, cams: ['fuera', 'plaza', 'techo', 'barra', 'cocina', 'reservado'], quienes: ['puky'], accion: 'repta', multi: true, fase: 'despues' },
  { id: 'puerta', corta: 'Puerta abierta', pregunta: 'Alguien se ha dejado la puerta abierta', cue: null, cams: ['fuera'], quienes: ['palicaso', 'blancaso', 'lasslow', 'pompa', 'perico', 'cotine'], accion: 'puerta' },
  { id: 'propinas', corta: 'Las propinas', pregunta: '¿Quién se ha llevado el bote de propinas?', cue: 'obj-bote-propinas', alto: 90, cams: ['barra'], quienes: ['perico', 'palicaso', 'puky', 'pompa'], accion: 'roba' },
  { id: 'pedo', corta: 'Huele fatal', pregunta: 'Algo huele fatal por aquí: ¿quién ha sido?', cue: 'fx-nube-pedo', alto: 120, cams: ['reservado', 'techo', 'barra'], quienes: ['lasslow', 'cotine', 'puky', 'palicaso'], peso: { lasslow: 2 }, accion: 'pedo' },
  { id: 'agenda', corta: 'La agenda', pregunta: '¿Quién ha cogido la agenda de Blancaso?', cue: 'obj-agenda-blancaso', alto: 78, cams: ['barra', 'reservado'], quienes: ['puky', 'perico', 'palicaso', 'pompa', 'lasslow'], accion: 'roba' },
  { id: 'kebab', corta: 'El kebab', pregunta: '¿Quién se ha zampado el kebab?', cue: 'obj-kebab', alto: 90, cams: ['barra', 'cocina', 'reservado'], quienes: ['cotine', 'puky', 'palicaso', 'lasslow'], peso: { cotine: 2 }, accion: 'come' },
];

// Las voces por la radio (frases cortas; la sensación se ve, no se nombra).
const CAM_PILLADO = {
  palicaso: ['¡Escucha, escucha! Puedo explicarlo. Todo empezó cuando…', '¡Escucha! Era un préstamo. Te cuento…'],
  blancaso: ['Iba a apuntarlo. Lo juro. Tenía el boli en la mano.', 'Lo tenía todo controlado. Menos esto.'],
  lasslow: ['Un señor jamás… JAJA… perdón. Fui yo.', 'Pfff… no es lo que parece. JA.'],
  cotine: ['¿Qué? Tenía hambre.', 'Solo probaba. Un poquito. Entero.'],
  pompa: ['…Yo no. …… …Vale, fui yo.', '…¿Ya me habéis visto? …Qué rápido.'],
  perico: ['Pin pin. No fui yo. (Pin pin. Fui yo.)', 'Pin pin. Es para que no se pierdan. Por colores.'],
  puky: ['¿Me llamabais?', '¿Qué? Solo pasaba. Y esto estaba ahí.'],
};
const CAM_INOCENTE = {
  palicaso: ['¡Escucha, escucha! ¿Yo? Te cuento por qué no…'],
  blancaso: ['Esto lo apunto. Acusación falsa. Con fecha.'],
  lasslow: ['Un señor, acusado. Qué digno. JA.'],
  cotine: ['¿Yo? Estaba pasando. Con un bocata. ¿Qué?'],
  pompa: ['…Yo no. …¿De qué me acusas? …Ah.'],
  perico: ['Pin pin. ¿Yo? Siempre yo. (Hoy no.)'],
  puky: ['¿Me llamabais?'],
};
const CAM_ESCAPA = [['blancaso', 'Se ha escapado. Lo apunto. En la lista larga.'], ['palicaso', '¡Escucha, escucha! Se nos ha ido, y yo mirando.'], ['perico', 'Pin pin. Os dije que mirarais. (No lo dije.)']];

function camRng(sem) {
  let a = sem >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Parámetros por nivel: más casos, ventanas más cortas, más cámaras y menos pistas.
function camNivel(n) {
  return {
    casos: n <= 1 ? 3 : n === 2 ? 4 : Math.min(7, n + 2), // sube con el nivel: la escalera no se corta
    ventana: Math.max(7.5, 14 - (n - 1) * 1.6),
    espacio: Math.max(11.5, 18 - (n - 1) * 1.4),
    camaras: n <= 1 ? 5 : 6,
    cueAntes: n <= 2 ? 4 : 1,
    pistas: n <= 2,
    // Probabilidades de visto / oscuro / tapado.
    oc: n <= 1 ? [0.45, 0.35, 0.2] : n === 2 ? [0.3, 0.4, 0.3] : [0.2, 0.4, 0.4],
    vuelos: n <= 1 ? 2 : 3,
  };
}

class Camaras extends Phaser.Scene {
  constructor() { super('Camaras'); }

  create(datos) {
    datos = datos || {};
    // Todo lo de la partida se reinicia aquí: Phaser reutiliza la instancia de la escena.
    this.activo = false;
    this.congelado = false;
    this.t = 0;
    this.puntos = 0;
    this.fallos = 0;
    this.resueltos = 0;
    this.modo = 'normal';
    this.bateria = 100;
    this.sinBateria = false;
    this.camActual = 0;
    this.susto = null;
    this.vozHasta = 0;
    this.cortada = 0;
    this.primeraNoche = true;
    this.primeraTermica = true;
    this.osc = 0;
    this.agentes = [];
    this.casos = [];
    this.apagones = [];
    this.sustos = [];
    this.pulso = 0;
    this._claveBotones = null;

    this.nivel = datos.nivel || (typeof nivelDe === 'function' ? nivelDe('Camaras') : 1);
    this.par = camNivel(this.nivel);
    this.semilla = datos.semilla !== undefined ? datos.semilla : Math.floor(Math.random() * 1e9);
    this.r = camRng(this.semilla);
    this.camDefs = CAM_DEF.slice(0, this.par.camaras === 5 ? 5 : 6);

    this.texturas();
    this.montarMonitor();
    this.prepararCasos(datos.forzar);
    this.prepararAgentes();
    this.prepararSustos();
    this.montarHud();
    this.montarMandos();
    this.cambiarCamara(0, true);

    entrar(this, datos);
    this.time.delayedCall(datos.rotulo ? 1900 : 300, () => this.empezar());
  }

  // ---------- Utilidades del sorteo (con semilla) ----------

  rint(a, b) { return a + Math.floor(this.r() * (b - a + 1)); }
  rfl(a, b) { return a + this.r() * (b - a); }
  elige(arr) { return arr[Math.floor(this.r() * arr.length)]; }
  baraja(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  pesos(lista, peso) {
    const total = lista.reduce((s, k) => s + ((peso && peso[k]) || 1), 0);
    let x = this.r() * total;
    for (const k of lista) { x -= (peso && peso[k]) || 1; if (x <= 0) return k; }
    return lista[0];
  }

  // ---------- Texturas dibujadas (Canvas y WebGL) ----------

  texturas() {
    if (!this.textures.exists('cam-lineas')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000, 0.3).fillRect(0, 0, 4, 2);
      g.generateTexture('cam-lineas', 4, 4);
      g.destroy();
    }
    if (!this.textures.exists('cam-grano')) {
      const c = this.textures.createCanvas('cam-grano', 256, 256);
      const ctx = c.getContext();
      const im = ctx.createImageData(256, 256);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.floor(Math.random() * 255); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 70; }
      ctx.putImageData(im, 0, 0);
      c.refresh();
    }
    if (!this.textures.exists('cam-vineta')) {
      const c = this.textures.createCanvas('cam-vineta', 480, 270);
      const ctx = c.getContext();
      const gr = ctx.createRadialGradient(240, 135, 90, 240, 135, 300);
      gr.addColorStop(0, 'rgba(0,0,0,0)');
      gr.addColorStop(1, 'rgba(0,0,0,0.78)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, 480, 270);
      c.refresh();
    }
    dibujarTextura(this, 'cam-caja', 200, 190, (g, w, h) => {
      g.fillStyle(0x1b1028, 1).fillRoundedRect(0, 0, w, h, 10);
      g.fillStyle(0xb98a52, 1).fillRoundedRect(6, 6, w - 12, h - 12, 8);
      g.fillStyle(0xcfa56a, 1).fillRect(6, 6, w - 12, 34);
      g.fillStyle(0xe8d9a8, 1).fillRect(w / 2 - 16, 6, 32, h - 12);
      g.lineStyle(4, 0x1b1028, 1).lineBetween(6, 40, w - 6, 40);
      g.fillStyle(0x1b1028, 0.5).fillRect(30, h - 56, 60, 10).fillRect(30, h - 40, 40, 8);
    });
  }

  // ---------- El monitor (marco, barrido, grano, viñeta) ----------

  montarMonitor() {
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x17102a).setDepth(-50);
    // El mundo de la cámara: un contenedor de 1280×720 a escala 0,75 dentro del marco.
    this.vista = this.add.container(CAM_SX, CAM_SY).setScale(CAM_ESC).setDepth(10);
    this.bg = this.add.image(ANCHO / 2, ALTO / 2, 'bg-dentro').setDepth(-100);
    this.vista.add(this.bg);
    this.capaObjetos = [];
    // Capas de imagen dentro del mundo.
    this.velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0).setDepth(9000);
    this.verde = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x0c3a18, 0).setDepth(9001).setBlendMode(Phaser.BlendModes.ADD);
    this.brillo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x3a3a3a, 0).setDepth(9002).setBlendMode(Phaser.BlendModes.ADD);
    this.vista.add([this.velo, this.verde, this.brillo]);
    this.puertaG = this.add.graphics().setDepth(40);
    this.vista.add(this.puertaG);

    // Tapa lo que se sale del mundo (zoom, personajes que entran por el borde) con el escritorio.
    const d = 0x17102a;
    this.add.rectangle(CAM_SX + CAM_SW / 2, CAM_SY / 2 - 5, ANCHO, CAM_SY + 10, d).setDepth(50);
    this.add.rectangle(CAM_SX + CAM_SW / 2, CAM_SY + CAM_SH + (ALTO - CAM_SY - CAM_SH) / 2 + 5, ANCHO, ALTO - CAM_SY - CAM_SH + 10, d).setDepth(50);
    this.add.rectangle(CAM_SX / 2 - 5, ALTO / 2, CAM_SX + 10, ALTO, d).setDepth(50);
    this.add.rectangle(CAM_SX + CAM_SW + (ANCHO - CAM_SX - CAM_SW) / 2 + 5, ALTO / 2, ANCHO - CAM_SX - CAM_SW + 10, ALTO, d).setDepth(50);
    // El marco del monitor.
    const m = this.add.graphics().setDepth(51);
    m.lineStyle(18, 0x34304a, 1).strokeRoundedRect(CAM_SX - 9, CAM_SY - 9, CAM_SW + 18, CAM_SH + 18, 26);
    m.lineStyle(5, HEX.tinta, 1).strokeRoundedRect(CAM_SX - 18, CAM_SY - 18, CAM_SW + 36, CAM_SH + 36, 30);
    m.lineStyle(4, HEX.tinta, 1).strokeRoundedRect(CAM_SX, CAM_SY, CAM_SW, CAM_SH, 18);
    this.led = this.add.circle(CAM_SX + CAM_SW - 14, CAM_SY + CAM_SH + 12, 5, 0x7ee081).setDepth(52);

    // Barrido, grano y viñeta: encima de la imagen y dentro del marco.
    this.lineas = this.add.tileSprite(CAM_SX, CAM_SY, CAM_SW, CAM_SH, 'cam-lineas').setOrigin(0).setDepth(30);
    this.grano = this.add.tileSprite(CAM_SX, CAM_SY, CAM_SW, CAM_SH, 'cam-grano').setOrigin(0).setDepth(31).setAlpha(0.2);
    this.vineta = this.add.image(CAM_SX, CAM_SY, 'cam-vineta').setOrigin(0).setDepth(32).setDisplaySize(CAM_SW, CAM_SH);
    this.barrido = this.add.rectangle(CAM_SX + CAM_SW / 2, CAM_SY, CAM_SW, 30, 0xffffff, 0.06).setDepth(33);
    // Estática de «señal cortada» (al fallar).
    this.estatica = this.add.tileSprite(CAM_SX, CAM_SY, CAM_SW, CAM_SH, 'cam-grano').setOrigin(0).setDepth(34).setAlpha(0);
    this.cortes = this.add.rectangle(CAM_SX + CAM_SW / 2, CAM_SY + 200, CAM_SW, 26, 0xffffff, 0).setDepth(35);
  }

  // ---------- Los casos y la agenda de cada personaje ----------

  prepararCasos(forzar) {
    const par = this.par;
    const activas = this.camDefs.map(c => c.id);
    let pool = CAM_CASOS.filter(c => c.cams.some(id => activas.includes(id)));
    // Variedad sin repetir: lo último que salió se deja para el final.
    ESTADO.camarasVistos = Array.isArray(ESTADO.camarasVistos) ? ESTADO.camarasVistos : [];
    let elegidos = [];
    if (forzar && forzar.length) elegidos = forzar.map(f => CAM_CASOS.find(c => c.id === f.id)).filter(Boolean);
    else {
      const nuevos = this.baraja(pool.filter(c => !ESTADO.camarasVistos.includes(c.id)));
      const viejos = this.baraja(pool.filter(c => ESTADO.camarasVistos.includes(c.id)));
      elegidos = nuevos.concat(viejos).slice(0, par.casos);
      ESTADO.camarasVistos = ESTADO.camarasVistos.concat(elegidos.map(c => c.id)).slice(-6);
      if (typeof guardarPartida === 'function') guardarPartida();
    }
    // Quién la hace: nadie repite, porque cada uno está en un solo sitio.
    const usados = [];
    const camsUsadas = [];
    let inicio = 6 + this.rfl(0, 2);
    elegidos.forEach((def, i) => {
      const f = forzar && forzar[i] ? forzar[i] : {};
      const libres = def.quienes.filter(q => !usados.includes(q));
      const quien = f.quien || this.pesos(libres.length ? libres : def.quienes, def.peso);
      usados.push(quien);
      const caso = { def, i, quien, paradas: [], resuelto: false, escapo: false, pista: false };
      const ocs = ['visto', 'oscuro', 'tapado'];
      const elOc = () => { let x = this.r(); for (let k = 0; k < 3; k++) { x -= par.oc[k]; if (x <= 0) return ocs[k]; } return 'visto'; };
      const n = def.multi ? 3 : 1;
      const dur = def.multi ? Math.max(4.4, par.ventana * 0.42) : par.ventana;
      let t0 = inicio;
      let camPrev = null;
      for (let k = 0; k < n; k++) {
        let opciones = def.cams.filter(id => activas.includes(id) && id !== camPrev);
        if (!def.multi) { const sinUsar = opciones.filter(id => !camsUsadas.includes(id)); if (sinUsar.length) opciones = sinUsar; }
        const cid = f.cam || this.elige(opciones);
        const cam = CAM_DEF.find(c => c.id === cid);
        const ocupadas = this.casos.concat([caso]).flatMap(c => c.paradas.filter(p => p.cam === cid).map(p => p.mi));
        const libresM = cam.mesas.map((_, mi) => mi).filter(mi => !ocupadas.includes(mi));
        const mi = f.mesa !== undefined ? f.mesa : this.elige(libresM.length ? libresM : cam.mesas.map((_, x) => x));
        const mesa = cam.mesas[mi];
        let oc = f.oc || elOc();
        if (def.multi && k === 2 && !caso.paradas.some(p => p.oc === 'visto') && oc !== 'visto') oc = 'visto';
        if (i === 0 && !f.oc && !def.multi) oc = 'visto'; // el primero de la noche siempre se ve bien
        caso.paradas.push({ cam: cid, mi, mx: mesa[0], my: mesa[1], x: mesa[0], y: Math.min(690, mesa[1] + 150), t0, t1: t0 + dur, oc });
        if (cid === 'fuera') caso.paradas[caso.paradas.length - 1].y = 575;
        camsUsadas.push(cid);
        camPrev = cid;
        t0 += dur;
      }
      caso.ini = caso.paradas[0].t0;
      caso.fin = caso.paradas[caso.paradas.length - 1].t1;
      this.casos.push(caso);
      inicio = caso.ini + par.espacio + this.rfl(0, 2.5);
    });
    this.T = Math.round(this.casos.reduce((m, c) => Math.max(m, c.fin), 0) + 6);
    // A oscuras: la cámara se queda sin luz un rato antes y después.
    this.casos.forEach(c => c.paradas.forEach(p => { if (p.oc === 'oscuro') this.apagones.push({ cam: p.cam, a: p.t0 - 1.6, b: p.t1 + 1.4 }); }));
    // Lo que se ve en la mesa.
    this.casos.forEach(c => c.paradas.forEach(p => {
      if (c.def.cue) {
        const suelo = c.def.fase === 'despues';
        const img = this.add.image(suelo ? p.x + 70 : p.mx + 118, suelo ? p.y + 2 : p.my + 6, c.def.cue).setOrigin(0.5, 1).setDepth(suelo ? p.y - 2 : p.my + 1);
        img.setScale(c.def.alto / img.height);
        img.setVisible(false);
        this.vista.add(img);
        p.cueImg = img;
      }
      if (p.oc === 'tapado') {
        const caja = this.add.image(p.x, p.y + 6, 'cam-caja').setOrigin(0.5, 1).setDepth(p.y + 40);
        caja.setScale(0.8);
        caja.setVisible(false);
        this.vista.add(caja);
        p.caja = caja;
      }
    }));
  }

  prepararAgentes() {
    const todos = Object.keys(CAM_SPR);
    const nCulp = this.casos.length;
    // Con pocas cámaras y pocos casos salen menos personajes (menos ruido que mirar).
    const total = this.nivel <= 1 ? 6 : 7;
    const culp = this.casos.map(c => c.quien);
    const resto = this.baraja(todos.filter(q => !culp.includes(q))).slice(0, Math.max(0, total - nCulp));
    const camIds = this.camDefs.map(c => c.id);
    const nombres = culp.concat(resto);
    const forzadas = {};
    this.casos.forEach(c => { forzadas[c.quien] = c; });
    nombres.forEach(q => {
      const [clave, alto] = CAM_SPR[q];
      const img = this.add.image(0, 0, clave).setOrigin(0.5, 1).setVisible(false);
      const esc = alto / img.height;
      img.setScale(esc);
      const sombra = this.add.ellipse(0, 0, alto * 0.7, alto * 0.12, 0x000000, 0.38).setVisible(false);
      this.vista.add([sombra, img]);
      const a = { q, img, sombra, esc, alto, stops: [], k: 0, cam: null, x: 0, y: 0, px: 0, dir: 1, mov: false, accion: null, culpable: null, oculto: false };
      this.agentes.push(a);
    });
    // Rutas: los culpables con sus paradas fijas, el resto, vagando.
    this.agentes.forEach(a => {
      const caso = forzadas[a.q];
      const fijas = caso ? caso.paradas.map(p => ({ t0: p.t0, t1: p.t1, cam: p.cam, x: p.x, y: p.y, fija: p, caso })) : [];
      this.rutaAgente(a, fijas, camIds);
    });
  }

  // Rellena los huecos de la agenda con paseos de 4 a 8 s por las cámaras.
  rutaAgente(a, fijas, camIds) {
    const stops = [];
    let t = -2;
    const choca = (cam, x, t0, t1) => this.casos.some(c => c.paradas.some(p => p.cam === cam && Math.abs(p.mx - x) < 330 && t0 < p.t1 + 2 && t1 > p.t0 - 4));
    const pasear = (hasta) => {
      let ultimaCam = stops.length ? stops[stops.length - 1].cam : null;
      while (hasta - t > 0.01) {
        let dur = this.rfl(4, 8);
        if (hasta - t - dur < 3.2) dur = hasta - t;
        let cam = null, x = 0, y = 0;
        for (let intento = 0; intento < 10; intento++) {
          const opciones = camIds.filter(id => id !== ultimaCam);
          cam = this.elige(opciones.length ? opciones : camIds);
          const def = CAM_DEF.find(c => c.id === cam);
          const s = this.elige(def.suelo);
          x = s[0] + this.rint(-40, 40); y = s[1] + this.rint(-10, 10);
          if (!choca(cam, x, t, t + dur)) break;
        }
        stops.push({ t0: t, t1: t + dur, cam, x, y });
        ultimaCam = cam;
        t += dur;
      }
    };
    fijas.forEach(f => {
      if (f.t0 - t > 3.2) pasear(f.t0);
      else if (stops.length) { stops[stops.length - 1].t1 = f.t0; t = f.t0; }
      else t = f.t0;
      stops.push(f);
      t = f.t1;
    });
    pasear(this.T + 12);
    a.stops = stops;
  }

  // ---------- Sustos: Puky pegado a la lente, Perico tapando la cámara con el culo ----------

  prepararSustos() {
    const tipos = this.baraja(['puky', 'perico', 'puky', 'perico']);
    for (let i = 0; i < this.par.vuelos; i++) {
      for (let intento = 0; intento < 8; intento++) {
        const ts = this.rfl(10, Math.max(14, this.T - 8));
        const cam = this.elige(this.camDefs).id;
        const choca = this.casos.some(c => c.paradas.some(p => p.cam === cam && ts < p.t1 + 1 && ts + 3 > p.t0 - 1));
        const cerca = this.sustos.some(s => Math.abs(s.t - ts) < 7);
        if (!choca && !cerca) { this.sustos.push({ t: ts, cam, tipo: tipos[i % tipos.length], hecho: false }); break; }
      }
    }
  }

  // ---------- La lista, el reloj y los botones ----------

  montarHud() {
    // Barra de arriba: reloj, puntos y fallos.
    this.tTiempo = texto(this, 120, 30, '', 30, COLOR.crema).setDepth(60);
    this.tPuntos = texto(this, 500, 30, '0 puntos', 28, COLOR.amarillo).setDepth(60);
    this.tFallos = texto(this, 800, 30, '', 26, COLOR.rosa).setDepth(60);
    this.tNivel = texto(this, 1140, 30, `Nivel ${this.nivel}`, 24, COLOR.azul).setDepth(60);

    // Dentro de la pantalla: nombre de cámara, REC, fecha y modo.
    this.tCam = texto(this, CAM_SX + 16, CAM_SY + 24, '', 28, COLOR.crema).setOrigin(0, 0.5).setDepth(40);
    this.rec = texto(this, CAM_SX + CAM_SW - 16, CAM_SY + 24, 'REC', 26, COLOR.rojo).setOrigin(1, 0.5).setDepth(40);
    this.recPunto = this.add.circle(this.rec.x - this.rec.width - 16, CAM_SY + 24, 9, 0xff3b30).setDepth(40);
    this.tFecha = texto(this, CAM_SX + CAM_SW - 16, CAM_SY + 54, '', 20, COLOR.crema).setOrigin(1, 0.5).setDepth(40);
    this.tModo = texto(this, CAM_SX + 16, CAM_SY + CAM_SH - 24, '', 24, COLOR.verde).setOrigin(0, 0.5).setDepth(40);
    this.tSenal = texto(this, CAM_SX + CAM_SW / 2, CAM_SY + CAM_SH - 130, '', 44, COLOR.crema).setDepth(41);

    // Radio (subtítulo en la parte baja de la pantalla).
    this.radioCaja = this.add.rectangle(CAM_SX + CAM_SW / 2, CAM_SY + 132, CAM_SW - 40, 92, 0x000000, 0.74).setDepth(42).setVisible(false);
    this.radioQuien = texto(this, CAM_SX + 34, CAM_SY + 98, '', 20, COLOR.amarillo).setOrigin(0, 0.5).setDepth(43);
    this.radioTxt = texto(this, CAM_SX + CAM_SW / 2, CAM_SY + 143, '', MOVIL ? 19 : 24, COLOR.crema, CAM_SW - 80).setDepth(43);

    // Panel de la derecha: la lista de casos.
    const PX = 1138;
    const p = this.add.graphics().setDepth(55);
    p.fillStyle(0x241a3d, 1).fillRoundedRect(1010, 62, 256, 262, 18);
    p.lineStyle(5, HEX.tinta, 1).strokeRoundedRect(1010, 62, 256, 262, 18);
    texto(this, PX, 84, 'CASOS', 22, COLOR.amarillo).setDepth(56);
    this.filas = this.casos.map((c, i) => {
      const y = 126 + i * 46;
      const marca = this.add.circle(1038, y, 11, 0x5a4d78).setStrokeStyle(3, HEX.tinta).setDepth(56);
      const t = texto(this, 1056, y - (this.par.pistas ? 9 : 0), c.def.corta, 20, COLOR.crema).setOrigin(0, 0.5).setDepth(56);
      const pista = texto(this, 1056, y + 14, '', 14, COLOR.azul).setOrigin(0, 0.5).setDepth(56);
      return { marca, t, pista };
    });
    this.casos.forEach((c, i) => { this.filas[i].caso = c; });

    // Batería.
    this.add.graphics().setDepth(55).fillStyle(0x241a3d, 1).fillRoundedRect(1010, 332, 256, 44, 14).lineStyle(5, HEX.tinta, 1).strokeRoundedRect(1010, 332, 256, 44, 14);
    this.tBat = texto(this, 1056, 354, 'PILA', 18, COLOR.crema).setDepth(56);
    this.batFondo = this.add.rectangle(1166, 354, 150, 20, 0x000000, 0.6).setStrokeStyle(3, HEX.crema).setDepth(56);
    this.batBarra = this.add.rectangle(1092, 354, 144, 14, HEX.verde).setOrigin(0, 0.5).setDepth(57);
  }

  montarMandos() {
    // Botones de cámara, abajo.
    const n = this.camDefs.length;
    const ancho = n === 5 ? 186 : 154;
    const sep = 10;
    const x0 = CAM_SX + (CAM_SW - (n * ancho + (n - 1) * sep)) / 2;
    this.botonesCam = this.camDefs.map((c, i) => this.botonModo(x0 + ancho / 2 + i * (ancho + sep), 674, ancho, 84, `${i + 1} ${c.n}`, () => this.cambiarCamara(i), n === 5 ? 20 : 17));
    this.puntosMov = this.camDefs.map((c, i) => this.add.circle(this.botonesCam[i].x + ancho / 2 - 16, 674 - 30, 8, 0xff3b30).setStrokeStyle(2, HEX.tinta).setDepth(72).setVisible(false));
    // Modos de visión, en el panel.
    this.botonNormal = this.botonModo(1138, 440, 244, 84, MOVIL ? 'NORMAL' : 'NORMAL [Espacio]', () => this.pedirModo('normal'), 20);
    this.botonNoche = this.botonModo(1138, 534, 244, 84, MOVIL ? 'NOCTURNA' : 'NOCTURNA [N]', () => this.pedirModo('noche'), 20);
    this.botonTermica = this.botonModo(1138, 628, 244, 84, MOVIL ? 'TÉRMICA' : 'TÉRMICA [T]', () => this.pedirModo('termica'), 20);

    this.input.on('pointerdown', (p, sobre) => { if (!sobre || !sobre.length) this.tocar(p.x, p.y); });
    this.input.keyboard.on('keydown', e => {
      if (e.repeat) return;
      const n = Number(e.key);
      if (n >= 1 && n <= this.camDefs.length) return this.cambiarCamara(n - 1);
      if (e.key === 'ArrowLeft') return this.cambiarCamara((this.camActual + this.camDefs.length - 1) % this.camDefs.length);
      if (e.key === 'ArrowRight') return this.cambiarCamara((this.camActual + 1) % this.camDefs.length);
      const k = String(e.key).toLowerCase();
      if (k === 'n') this.pedirModo(this.modo === 'noche' ? 'normal' : 'noche');
      else if (k === 't') this.pedirModo(this.modo === 'termica' ? 'normal' : 'termica');
      else if (e.key === ' ' || k === 'v') this.pedirModo('normal');
    });
  }

  // Botón de modo/cámara con estado (se repinta al activarse).
  botonModo(x, y, w, h, etiqueta, accion, tam) {
    const c = this.add.container(x, y).setDepth(70);
    const g = this.add.graphics();
    const t = this.add.text(0, 0, etiqueta, { fontFamily: FUENTE, fontSize: `${MOVIL ? Math.round(tam * 1.12) : tam}px`, color: COLOR.tinta, align: 'center', wordWrap: { width: w - 16 } }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.w = w; c.h = h; c.g = g; c.t = t;
    c.pintar = (color, activo, apagado) => {
      g.clear();
      g.fillStyle(HEX.tinta, 1).fillRoundedRect(-w / 2 + 3, -h / 2 + 7, w, h, 18);
      g.fillStyle(color, apagado ? 0.45 : 1).fillRoundedRect(-w / 2, -h / 2, w, h, 18);
      g.lineStyle(activo ? 9 : 5, activo ? 0xffffff : HEX.tinta, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    };
    c.pintar(HEX.crema, false);
    c.on('pointerdown', () => { if (this.activo) accion(); });
    return c;
  }

  // ---------- Empezar ----------

  empezar() {
    if (!this.sys.isActive()) return;
    this.sonidoRuido = sfx(this, 'zumbido-m', { volume: 0.12, loop: true });
    const lista = this.casos.map((c, i) => `${i + 1}. ${c.def.pregunta}`).join('\n');
    const caja = this.add.rectangle(CAM_SX + CAM_SW / 2, CAM_SY + CAM_SH / 2, CAM_SW - 80, 420, 0x000000, 0.82).setDepth(80).setStrokeStyle(4, HEX.crema);
    const titulo = texto(this, CAM_SX + CAM_SW / 2, CAM_SY + 100, 'TURNO DE VIGILANCIA', 40, COLOR.amarillo).setDepth(81);
    const cuerpo = texto(this, CAM_SX + CAM_SW / 2, CAM_SY + 270, lista, 24, COLOR.crema, CAM_SW - 140).setDepth(81);
    const ayuda = texto(this, CAM_SX + CAM_SW / 2, CAM_SY + 440, MOVIL ? 'Toca las cámaras de abajo. Toca al culpable.\nLa NOCTURNA y la TÉRMICA gastan pila.' : 'Cámaras: 1-6 o flechas · N nocturna · T térmica\nToca (clic) al culpable. La pila se recarga con la imagen normal.', 22, COLOR.azul, CAM_SW - 140).setDepth(81);
    this.time.delayedCall(3200, () => {
      [caja, titulo, cuerpo, ayuda].forEach(o => o.destroy());
      this.activo = true;
      this.radio('blancaso', 'Turno de noche. Os vigilo. Lo apunto todo.', 2800);
    });
  }

  // ---------- Cambiar de cámara y de modo ----------

  cambiarCamara(i, silencio) {
    if (this.congelado && !silencio) return;
    if (i === this.camActual && !silencio && this.bg.texture.key === this.camDefs[i].bg) return;
    this.camActual = i;
    this.bg.setTexture(this.camDefs[i].bg);
    this.bg.setScale(Math.max(ANCHO / this.bg.width, ALTO / this.bg.height));
    this.tCam.setText(`CAM ${i + 1} · ${this.camDefs[i].n}`);
    if (!silencio) {
      sfx(this, 'fup', { volume: 0.35 });
      this.cortada = Math.max(this.cortada, 0.22);
    }
    this.botonesCam.forEach((b, k) => b.pintar(k === i ? HEX.amarillo : HEX.crema, k === i));
    this.refrescarVista();
  }

  pedirModo(m) {
    if (!this.activo || this.congelado) return;
    if (m !== 'normal' && this.sinBateria) { this.radio('perico', 'Pin pin. Sin pila. Esperad. Os lo dije.', 2200); return; }
    if (m === this.modo) return;
    this.modo = m;
    if (m === 'noche') { sfx(this, 'neon', { volume: 0.35 }); if (this.primeraNoche) { this.primeraNoche = false; this.radio('lasslow', 'Visión nocturna. Un señor ve en la oscuridad. JA.', 2600); } }
    if (m === 'termica') { sfx(this, 'zumbido-m', { volume: 0.4 }); if (this.primeraTermica) { this.primeraTermica = false; this.radio('cotine', 'Todo naranja. Parece un horno. Me ha entrado hambre.', 2800); } }
    this.cortada = Math.max(this.cortada, 0.18);
    this.refrescarVista();
  }

  // ---------- Qué hay en cada cámara en este instante ----------

  oscuraAhora(cam) { return this.apagones.some(a => a.cam === cam && this.t >= a.a && this.t <= a.b); }

  // Posición de un personaje según el reloj (todo depende solo de `t`).
  colocar(a) {
    const S = a.stops;
    while (a.k < S.length - 1 && this.t >= S[a.k].t1) a.k++;
    const s = S[a.k], prev = S[a.k - 1], next = S[a.k + 1];
    const ENT = 1.3;
    let x = s.x, y = s.y, mov = false;
    const u = this.t - s.t0;
    if (prev && prev.cam !== s.cam) {
      if (u < ENT) { const bx = s.x < 640 ? -150 : 1430; const k = Math.max(0, u) / ENT; x = bx + (s.x - bx) * k; mov = true; }
    } else if (prev) {
      const W = Math.min(2, (s.t1 - s.t0) * 0.5);
      if (u < W) { const k = Math.max(0, u) / W; x = prev.x + (s.x - prev.x) * k; y = prev.y + (s.y - prev.y) * k; mov = true; }
    } else if (u < ENT) { const bx = s.x < 640 ? -150 : 1430; const k = Math.max(0, u) / ENT; x = bx + (s.x - bx) * k; mov = true; }
    if (next && next.cam !== s.cam) {
      const rest = s.t1 - this.t;
      if (rest < ENT) { const bx = s.x < 640 ? -150 : 1430; const k = 1 - rest / ENT; x = s.x + (bx - s.x) * k; y = s.y; mov = true; }
    }
    a.cam = s.cam;
    if (Math.abs(x - a.x) > 0.5) a.dir = x > a.x ? 1 : -1;
    a.x = x; a.y = y; a.mov = mov;
    a.stop = s;
    // ¿Está haciendo lo suyo? (solo el culpable, en su parada, ya llegado)
    a.accion = null; a.culpable = null;
    if (s.fija && !mov) a.accion = s.caso.def.accion;
    if (s.fija && this.t >= s.t0 + 0.5 && this.t <= s.t1 + 0.8 && !s.caso.resuelto) a.culpable = s.caso;
  }

  // Dibuja todo lo que se ve en la cámara actual y con el modo actual.
  refrescarVista() {
    const cam = this.camDefs[this.camActual];
    if (!cam) return;
    const oscura = this.oscuraAhora(cam.id);
    const modo = this.modo;
    const calle = modo === 'termica' ? 0x9fa6ff : modo === 'noche' ? 0xb8ffc8 : null;
    this.vistaOscura = oscura;
    // El fondo.
    if (calle !== null) this.bg.setTint(modo === 'termica' ? 0x6a58c0 : 0xb8ffc8); else this.bg.clearTint();
    // Objetos (lo de la mesa).
    this.casos.forEach(c => c.paradas.forEach(p => {
      const aqui = p.cam === cam.id;
      if (p.cueImg) {
        const antes = c.def.fase !== 'despues';
        const ventana = antes ? (this.t >= p.t0 - this.par.cueAntes && this.t <= p.t1 + 0.3) : (this.t >= p.t1 - 0.5 && this.t <= p.t1 + 7);
        const veo = aqui && ventana && !(oscura && modo === 'normal') && modo !== 'termica';
        p.cueImg.setVisible(veo);
        if (veo) { if (modo === 'noche') p.cueImg.setTint(0xb8ffc8); else p.cueImg.clearTint(); }
      }
      if (p.caja) {
        const v = aqui && this.t >= p.t0 - 2 && this.t <= p.t1 + 2.5 && !(oscura && modo === 'normal');
        p.caja.setVisible(v);
        p.caja.setAlpha(modo === 'termica' ? 0.28 : 1);
        if (modo === 'noche') p.caja.setTint(0xb8ffc8); else if (modo === 'termica') p.caja.setTint(0x6670ff); else p.caja.clearTint();
      }
    }));
    this.pintarPuerta(cam, oscura, modo);
    // Los personajes.
    this.agentes.forEach(a => this.pintarAgente(a, cam, oscura, modo));
    // Capas de imagen.
    this.verde.setFillStyle(0x0c3a18, modo === 'noche' ? 1 : 0);
    this.brillo.setFillStyle(0x2e2e2e, modo === 'noche' && !oscura ? 1 : 0);
    this.velo.setFillStyle(0x000000, oscura && modo === 'normal' ? 0.93 : 0);
    this.tModo.setText(modo === 'noche' ? 'VISIÓN NOCTURNA' : modo === 'termica' ? 'TÉRMICA' : oscura ? 'SIN LUZ' : '').setColor(modo === 'termica' ? COLOR.amarillo : oscura && modo === 'normal' ? COLOR.rosa : COLOR.verde);
    this.grano.setAlpha(modo === 'noche' ? 0.42 : modo === 'termica' ? 0.28 : oscura ? 0.32 : 0.2);
    const clave = `${modo}${this.sinBateria}`;
    if (clave !== this._claveBotones) {
      this._claveBotones = clave;
      this.botonNormal.pintar(modo === 'normal' ? HEX.amarillo : HEX.crema, modo === 'normal');
      this.botonNoche.pintar(modo === 'noche' ? 0x7ee081 : 0xb8e8c0, modo === 'noche', this.sinBateria);
      this.botonTermica.pintar(modo === 'termica' ? 0xffa03a : 0xf3c49a, modo === 'termica', this.sinBateria);
    }
  }

  pintarPuerta(cam, oscura, modo) {
    const g = this.puertaG;
    g.clear();
    const c = this.casos.find(k => k.def.id === 'puerta');
    if (!c || cam.id !== 'fuera') return;
    const p = c.paradas[0];
    if (!(this.t >= p.t0 - this.par.cueAntes && this.t <= p.t1 + 2.5)) return;
    if ((oscura && modo === 'normal') || modo === 'termica') return;
    // La puerta abierta: hueco oscuro con luz cálida, la hoja abatida y la luz que sale a la calle.
    g.fillStyle(0xffc860, 0.2).fillTriangle(780, 356, 940, 356, 1120, 690).fillTriangle(780, 356, 1120, 690, 640, 690);
    g.fillStyle(0x0a0612, 1).fillRect(774, 112, 168, 244);
    g.fillStyle(0xffc860, 0.5).fillRect(786, 124, 144, 232);
    g.fillStyle(0x2c2238, 1).fillTriangle(774, 112, 716, 146, 716, 388).fillTriangle(774, 112, 774, 356, 716, 388);
    g.lineStyle(5, HEX.tinta, 1).strokeRect(774, 112, 168, 244).strokeTriangle(774, 112, 716, 146, 716, 388);
  }

  // Agachado tras la caja: ya ha llegado a su parada, es de los que se tapan y nadie le ha pillado.
  estaTapado(a) {
    const s = a.stop;
    return !!(s && s.fija && s.fija.oc === 'tapado' && !a.mov && this.t >= s.t0 && this.t <= s.t1 && !s.caso.resuelto);
  }

  pintarAgente(a, cam, oscura, modo) {
    const aqui = a.cam === cam.id;
    const tapado = this.estaTapado(a);
    const ciclo = (this.t * 0.5) % 1;
    const asoma = tapado && ciclo > 0.7 && ciclo < 0.93;
    let visible = aqui;
    if (visible && oscura && modo === 'normal') visible = false;
    if (visible && tapado && modo !== 'termica' && !asoma) visible = false;
    a.oculto = !visible;
    a.img.setVisible(visible);
    a.sombra.setVisible(visible && !(tapado && modo !== 'termica'));
    if (!visible) return;
    a.img.setDepth(a.y);
    a.sombra.setDepth(a.y - 1);
    if (modo === 'termica') {
      // El que hace algo está más caliente.
      a.img.setTint(a.culpable ? 0xfff27a : 0xff7a2a);
    } else if (modo === 'noche') a.img.setTint(0xb8ffc8);
    else a.img.clearTint();
  }

  // Cada frame: bob, gestos y sombra de los personajes visibles.
  animarAgentes(dt) {
    const cam = this.camDefs[this.camActual];
    const T = this.t;
    this.agentes.forEach(a => {
      if (a.oculto || a.cam !== cam.id) return;
      const img = a.img;
      let dx = 0, dy = 0, sy = 1, ang = 0, flip = a.dir < 0;
      const tapado = this.estaTapado(a);
      if (a.mov) { dy = -Math.abs(Math.sin(T * 9)) * 9; ang = Math.sin(T * 9) * 3; }
      else if (a.accion === 'come') { sy = 1 + Math.sin(T * 12) * 0.045; ang = Math.sin(T * 6) * 2; }
      else if (a.accion === 'roba') { flip = Math.sin(T * 3.1) > 0; dx = Math.sin(T * 14) * 1.5; sy = 0.96; }
      else if (a.accion === 'pedo') { dx = Math.sin(T * 30) * 3; ang = Math.sin(T * 24) * 2.5; }
      else if (a.accion === 'repta') { sy = 0.9 + Math.sin(T * 5) * 0.05; ang = Math.sin(T * 4) * 3; }
      else if (a.accion === 'puerta') { ang = Math.sin(T * 5) * 2; dy = -Math.abs(Math.sin(T * 2.2)) * 5; }
      else { sy = 1 + Math.sin(T * 2 + a.alto) * 0.015; }
      // Tapado: agachado detrás de la caja, salvo cuando asoma.
      const ciclo = (T * 0.5) % 1;
      if (tapado && this.modo !== 'termica') sy *= (ciclo > 0.7 && ciclo < 0.93) ? 1 : 0.55;
      img.setPosition(a.x + dx, a.y + dy);
      img.setScale(a.esc * (flip ? -1 : 1) * (MIRA[a.img.texture.key] ? MIRA[a.img.texture.key] : 1), a.esc * sy);
      img.setAngle(ang);
      a.sombra.setPosition(a.x, a.y - 2);
    });
  }

  // ---------- Tocar ----------

  // Coordenadas de la pantalla (canvas del juego) → mundo de la cámara.
  aMundo(sx, sy) { return [(sx - this.vista.x) / this.vista.scaleX, (sy - this.vista.y) / this.vista.scaleY]; }
  aPantalla(wx, wy) { return [this.vista.x + wx * this.vista.scaleX, this.vista.y + wy * this.vista.scaleY]; }

  tocar(sx, sy) {
    if (!this.activo || this.congelado) return;
    if (sx < CAM_SX || sx > CAM_SX + CAM_SW || sy < CAM_SY || sy > CAM_SY + CAM_SH) return;
    if (this.susto && this.susto.cam === this.camDefs[this.camActual].id && this.t < this.susto.hasta) return; // la lente está tapada
    const [wx, wy] = this.aMundo(sx, sy);
    const cam = this.camDefs[this.camActual];
    let mejor = null, d2 = 1e12;
    this.agentes.forEach(a => {
      if (a.oculto || a.cam !== cam.id) return;
      const w = a.alto * 0.62 + 34, h = a.alto + 40;
      const cx = a.x, cy = a.y - a.alto / 2;
      if (Math.abs(wx - cx) <= w / 2 && wy >= a.y - h + 18 && wy <= a.y + 28) {
        const d = (wx - cx) ** 2 + (wy - cy) ** 2;
        if (d < d2) { d2 = d; mejor = a; }
      }
    });
    if (!mejor) {
      // Un toque en el vacío no cuesta nada (el dedo es gordo): solo un aviso suave.
      const r = this.add.circle(sx, sy, 8, 0xffffff, 0.5).setDepth(45);
      this.tweens.add({ targets: r, scale: 3, alpha: 0, duration: 260, onComplete: () => r.destroy() });
      return;
    }
    if (mejor.culpable) this.acierto(mejor, mejor.culpable);
    else this.fallo(mejor);
  }

  acierto(a, caso) {
    caso.resuelto = true;
    this.resueltos++;
    const p = caso.paradas.find(k => this.t >= k.t0 && this.t <= k.t1 + 1) || caso.paradas[0];
    const rapidez = Math.max(0, Math.min(1, 1 - (this.t - p.t0) / Math.max(1, p.t1 - p.t0)));
    const ganado = 250 + Math.round(rapidez * 100);
    this.puntos += ganado;
    caso.puntos = ganado;
    this.tPuntos.setText(`${this.puntos} puntos`);
    sfx(this, 'campanita', { volume: 0.6 });
    sfx(this, 'rimshot', { volume: 0.4 });
    this.zoom(a, caso, ganado);
  }

  fallo(a) {
    this.fallos++;
    this.t += 4; // el reloj salta: los casos abiertos se cierran antes
    this.cortada = 0.7;
    this.tSenal.setText('SEÑAL PERDIDA').setColor(COLOR.crema).setScale(1).setAngle(0);
    sfx(this, 'bonk', { volume: 0.5 });
    this.cameras.main.shake(220, 0.007);
    const [sx, sy] = this.aPantalla(a.x, a.y - a.alto / 2);
    golpeTexto(this, sx, sy, '-4 s', COLOR.rojo, 36);
    this.estatica.setAlpha(0.8);
    this.tweens.add({ targets: this.estatica, alpha: 0, duration: 500 });
    const lista = CAM_INOCENTE[a.q];
    this.radio(a.q, this.elige(lista), 2400);
  }

  // Zoom a la cara del culpable, el sello y su excusa por la radio.
  zoom(a, caso, ganado) {
    this.congelado = true;
    const Z = 1.7;
    const cx = CAM_SX + CAM_SW / 2, cy = CAM_SY + CAM_SH / 2;
    let vx = cx - a.x * Z, vy = cy - (a.y - a.alto * 0.62) * Z;
    vx = Math.min(CAM_SX, Math.max(CAM_SX + CAM_SW - ANCHO * Z, vx));
    vy = Math.min(CAM_SY, Math.max(CAM_SY + CAM_SH - ALTO * Z, vy));
    const mira = this.add.graphics().setDepth(20000);
    mira.lineStyle(10, 0xff3b30, 1).strokeCircle(a.x, a.y - a.alto * 0.55, a.alto * 0.62);
    mira.lineStyle(6, 0xff3b30, 1).lineBetween(a.x - a.alto * 0.85, a.y - a.alto * 0.55, a.x - a.alto * 0.45, a.y - a.alto * 0.55).lineBetween(a.x + a.alto * 0.45, a.y - a.alto * 0.55, a.x + a.alto * 0.85, a.y - a.alto * 0.55);
    this.vista.add(mira);
    this.tweens.add({ targets: this.vista, x: vx, y: vy, scaleX: Z, scaleY: Z, duration: 340, ease: 'Back.out' });
    this.tSenal.setText('¡PILLADO!').setColor(COLOR.rojo).setScale(0).setAngle(-6);
    this.tweens.add({ targets: this.tSenal, scale: 1.2, duration: 260, ease: 'Back.out', delay: 200 });
    if (typeof Comic !== 'undefined') Comic.impacto(this, cx - 360, cy + 70, { tam: 90, profundidad: 70 });
    this.radio(a.q, this.elige(a.q === 'perico' && caso.def.id === 'mecheros' ? CAM_PILLADO.perico.slice(1) : CAM_PILLADO[a.q]), 2800);
    this.time.delayedCall(1100, () => {
      this.tSenal.setText('');
      mira.destroy();
      this.tweens.add({ targets: this.vista, x: CAM_SX, y: CAM_SY, scaleX: CAM_ESC, scaleY: CAM_ESC, duration: 320, ease: 'Sine.inOut', onComplete: () => { this.congelado = false; } });
      this.refrescarVista();
    });
    golpeTexto(this, cx, CAM_SY + CAM_SH - 60, `+${ganado} · ${caso.def.corta}`, COLOR.verde, 34);
    if (this.resueltos === this.casos.length) this.time.delayedCall(1800, () => this.final());
  }

  // ---------- La radio ----------

  radio(quien, txt, ms = 2400) {
    this.vozHasta = this.time.now + ms;
    this.radioCaja.setVisible(true);
    this.radioQuien.setText(`RADIO · ${CAM_NOMBRE[quien] || quien}`);
    this.radioTxt.setText(`«${txt}»`);
    this.time.delayedCall(ms, () => {
      if (this.time.now >= this.vozHasta - 50 && this.radioCaja.active) { this.radioCaja.setVisible(false); this.radioQuien.setText(''); this.radioTxt.setText(''); }
    });
  }

  // ---------- Cada frame ----------

  update(_t, dms) {
    if (!this.sys || !this.vista || !this.vista.active) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.pulso += dt;
    // Imagen viva aunque el juego no haya empezado: grano, barrido, REC.
    this.grano.setTilePosition(Math.random() * 256, Math.random() * 256);
    this.estatica.setTilePosition(Math.random() * 256, Math.random() * 256);
    this.barrido.y = CAM_SY + ((this.pulso * 90) % (CAM_SH + 60)) - 30;
    this.recPunto.setVisible(Math.floor(this.pulso * 1.6) % 2 === 0);
    this.led.setFillStyle(Math.floor(this.pulso * 3) % 7 === 0 ? 0x2a5a30 : 0x7ee081);
    // La señal cortada (al cambiar de cámara o fallar): líneas de ruido que saltan.
    if (this.cortada > 0) {
      this.cortada -= dt;
      this.cortes.setFillStyle(0xffffff, 0.16 + Math.random() * 0.2).setY(CAM_SY + 40 + Math.random() * (CAM_SH - 80)).setScale(1, 0.3 + Math.random() * 1.2);
      if (this.cortada <= 0) { this.cortes.setFillStyle(0xffffff, 0); if (this.tSenal.text === 'SEÑAL PERDIDA') this.tSenal.setText(''); }
    }
    if (!this.activo) return;

    if (!this.congelado) {
      this.t += dt;
      if (this.t < 0) this.t = 0;
    }
    // Batería: la nocturna y la térmica la gastan; con imagen normal se recarga.
    if (this.modo === 'noche') this.bateria -= 14 * dt;
    else if (this.modo === 'termica') this.bateria -= 22 * dt;
    else this.bateria += 12 * dt;
    this.bateria = Math.max(0, Math.min(100, this.bateria));
    if (this.bateria <= 0 && this.modo !== 'normal') {
      this.sinBateria = true;
      this.modo = 'normal';
      sfx(this, 'suspiro', { volume: 0.4 });
      this.radio('perico', 'Pin pin. Se ha acabado la pila. Os lo dije.', 2400);
      this.refrescarVista();
    }
    if (this.sinBateria && this.bateria >= 35) { this.sinBateria = false; this.refrescarVista(); }
    const bp = this.bateria / 100;
    this.batBarra.width = 144 * bp;
    this.batBarra.setFillStyle(this.sinBateria ? HEX.rojo : bp < 0.3 ? HEX.rojo : bp < 0.6 ? HEX.amarillo : HEX.verde);
    this.tBat.setText(this.sinBateria ? 'PILA…' : 'PILA');

    // Dónde está cada uno, y qué cuenta como visible.
    this.agentes.forEach(a => this.colocar(a));
    this.estadoCasos();
    this.sustosUpdate();
    this.refrescarVista();
    this.animarAgentes(dt);
    this.vista.sort('depth');
    this.movimiento();

    // Texto del reloj.
    const resta = Math.max(0, Math.ceil(this.T - this.t));
    this.tTiempo.setText(`Tiempo ${resta}`);
    this.tFallos.setText(this.fallos ? `Fallos ${this.fallos}` : '');
    const seg = 2 * 3600 + 47 * 60 + Math.floor(this.t);
    this.tFecha.setText(`16/11/2026  ${String(Math.floor(seg / 3600) % 24).padStart(2, '0')}:${String(Math.floor(seg / 60) % 60).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`);

    if (this.t >= this.T && !this.congelado) this.final();
  }

  // Marca de movimiento en los botones de cámara (hay alguien que se mueve, sea quien sea).
  movimiento() {
    this.camDefs.forEach((c, i) => {
      const hay = this.agentes.some(a => a.cam === c.id && (a.mov || a.accion));
      this.puntosMov[i].setVisible(hay && i !== this.camActual && Math.floor(this.pulso * 3) % 2 === 0);
    });
  }

  // La lista de la derecha, las pistas y los casos que se escapan.
  estadoCasos() {
    this.casos.forEach((c, i) => {
      const f = this.filas[i];
      const abierto = !c.resuelto && !c.escapo && this.t >= c.ini && this.t <= c.fin + 0.8;
      f.marca.setFillStyle(c.resuelto ? HEX.verde : c.escapo ? HEX.rojo : abierto ? HEX.amarillo : 0x5a4d78);
      f.t.setColor(c.resuelto ? COLOR.verde : c.escapo ? COLOR.rojo : COLOR.crema);
      if (this.par.pistas && abierto) {
        const p = c.paradas.find(k => this.t >= k.t0 - 1 && this.t <= k.t1 + 1) || c.paradas[0];
        f.pista.setText(`mira: ${CAM_DEF.find(k => k.id === p.cam).n}`);
      } else f.pista.setText(c.resuelto ? 'resuelto' : c.escapo ? 'se escapó' : '');
      // Pista de la radio a mitad de ventana en niveles altos.
      if (!this.par.pistas && abierto && !c.pista && this.t > c.ini + (c.fin - c.ini) * 0.55) {
        c.pista = true;
        const p = c.paradas.find(k => this.t <= k.t1) || c.paradas[0];
        this.radio('palicaso', `¡Escucha, escucha! Se mueve algo en ${CAM_DEF.find(k => k.id === p.cam).n}.`, 2400);
      }
      if (!c.resuelto && !c.escapo && this.t > c.fin + 0.8) {
        c.escapo = true;
        this.t = Math.max(this.t, 0);
        sfx(this, 'abucheo', { volume: 0.35 });
        const r = this.elige(CAM_ESCAPA);
        this.radio(r[0], r[1], 2400);
      }
    });
    if (this.casos.every(c => c.resuelto || c.escapo) && !this.congelado) this.final();
  }

  // ---------- Sustos ----------

  sustosUpdate() {
    const cam = this.camDefs[this.camActual].id;
    this.sustos.forEach(s => {
      if (!s.hecho && this.t >= s.t) {
        s.hecho = true;
        this.susto = { cam: s.cam, tipo: s.tipo, hasta: this.t + 2.6, obj: null };
        sfx(this, s.tipo === 'puky' ? 'puky-gracioso' : 'pin-pin', { volume: 0.6 });
      }
    });
    const su = this.susto;
    if (!su) return;
    const vivo = this.t < su.hasta;
    if (vivo && cam === su.cam && !su.obj) su.obj = this.pintarSusto(su.tipo);
    if ((!vivo || cam !== su.cam) && su.obj) { su.obj.destroy(); su.obj = null; }
    if (!vivo) this.susto = null;
    else if (su.obj) { su.obj.setPosition(CAM_SX + CAM_SW / 2 + Math.sin(this.pulso * 30) * 4, CAM_SY + CAM_SH / 2 + Math.sin(this.pulso * 23) * 4); }
  }

  pintarSusto(tipo) {
    const c = this.add.container(CAM_SX + CAM_SW / 2, CAM_SY + CAM_SH / 2).setDepth(29);
    if (tipo === 'puky') {
      // Puky con la cara pegada a la lente.
      const cara = this.add.image(0, 90, 'puky-riendo').setOrigin(0.5);
      cara.setScale(560 / cara.height);
      c.add(cara);
      const b = bocadillo(this, 0, 0, '¿Me llamabais?', { tam: 26, ancho: 300, cola: 'abajo' }).setDepth(0).setPosition(-300, -10);
      c.add(b);
    } else {
      // El culo de Perico tapando la lente.
      const g = this.add.graphics();
      g.fillStyle(HEX.tinta, 1).fillEllipse(0, 20, 760, 560);
      g.fillStyle(0x3fa65a, 1).fillEllipse(0, 14, 744, 544);
      g.fillStyle(0x6ed17f, 1).fillEllipse(-90, -30, 420, 300);
      g.lineStyle(6, HEX.tinta, 1);
      for (let k = -3; k <= 3; k++) { g.lineBetween(k * 90, 160, k * 100, 250); }
      g.fillStyle(0xff5a4f, 1).fillEllipse(-210, 240, 90, 160).fillStyle(0x5ad1ff, 1).fillEllipse(0, 260, 90, 170).fillStyle(0xffd23f, 1).fillEllipse(210, 240, 90, 160);
      g.lineStyle(7, HEX.tinta, 1).beginPath().arc(0, -40, 150, 0.15 * Math.PI, 0.85 * Math.PI).strokePath();
      c.add(g);
      c.add(texto(this, 0, -10, 'pin pin', 54, COLOR.crema));
      const b = bocadillo(this, 0, 0, 'Aquí se ve mejor.', { tam: 26, ancho: 300, cola: 'abajo' }).setDepth(0).setPosition(-300, -10);
      c.add(b);
    }
    this.cortada = Math.max(this.cortada, 0.2);
    return c;
  }

  // ---------- El final ----------

  final() {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    if (this.sonidoRuido) { try { this.sonidoRuido.stop(); } catch (e) { /* nada */ } }
    // Lo que queda de reloj solo cuenta si se ha resuelto algo; sin fallos, premio.
    const sobra = Math.max(0, this.T - this.t);
    const mitad = this.resueltos >= Math.ceil(this.casos.length / 2);
    if (mitad) this.puntos += Math.round(sobra * 4);
    if (mitad && this.fallos === 0) this.puntos += 150;
    this.puntos = Math.max(0, this.puntos);
    this.tPuntos.setText(`${this.puntos} puntos`);
    const gana = this.resueltos >= Math.ceil(this.casos.length / 2) && this.puntos >= MISIONES.Camaras.umbrales[0];
    const todos = this.resueltos === this.casos.length;
    if (todos) { sfx(this, 'aaah', { volume: 0.5 }); if (typeof Comic !== 'undefined') Comic.confeti(this, { profundidad: 590 }); }
    if (gana && this.fallos === 0 && typeof sumarStat === 'function') sumarStat('camarasLimpio');
    const titulo = todos ? '¡Turno limpio!' : gana ? 'Turno aguantado' : 'Se os ha escapado la noche';
    const linea = todos ? 'Todo resuelto, y Blancaso lo ha apuntado con boli rojo.'
      : gana ? `Pillaste ${this.resueltos} de ${this.casos.length}. Lo demás se lo llevó la oscuridad.`
        : 'El monitor se queda en negro. Alguien, en algún sitio, se está comiendo algo.';
    this.time.delayedCall(900, () => panelFinal(this, { titulo, linea, puntos: this.puntos, clave: 'Camaras', gana }));
  }
}

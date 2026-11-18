// Mandos táctiles para el móvil: un joystick a la izquierda y botones grandes a la derecha que
// cambian según la escena. No tocan la lógica del juego: «pulsan» las mismas teclas que el teclado
// (eventos de teclado sintéticos), así que valen para todos los minijuegos tal cual.
// Van en HTML encima del lienzo (dentro de #juego, para que sigan en pantalla completa) y solo
// salen en pantallas táctiles.

const TECLAS = {
  ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, ' ': 32, Enter: 13, Escape: 27, Shift: 16,
  e: 69, p: 80, x: 88, l: 76, o: 79, a: 65, s: 83, d: 68, m: 77,
};
const CODIGOS = { ' ': 'Space', Enter: 'Enter', Escape: 'Escape', Shift: 'ShiftLeft' };

function teclaSintetica(tipo, key) {
  const ev = new KeyboardEvent(tipo, { key, code: CODIGOS[key] || (key.length === 1 ? `Key${key.toUpperCase()}` : key), bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'keyCode', { get: () => TECLAS[key] });
  Object.defineProperty(ev, 'which', { get: () => TECLAS[key] });
  window.dispatchEvent(ev);
}

// Qué lleva cada escena. joy: 'libre' (8 direcciones), 'h' (solo izquierda/derecha) o nada.
// Botones: [etiqueta, tecla, { mantener, color }]. Los que ya tienen botones grandes en pantalla no llevan nada.
const MANDOS = {
  // Barrio: los botones van al margen derecho cuando lo hay (en el lienzo tapaban a Lasslow y el «Jugar» de la puerta).
  Barrio: { joy: 'libre', botones: [['Usar', 'e', { color: '#ffd23f', grande: true, lado: 'der' }], ['Objetivos', 'o', { color: '#5ad1ff', lado: 'der' }]] },
  Tarta: { joy: 'h' },
  DJ: { botones: [['←', 'ArrowLeft', { color: '#ff5fa2', grande: true }], ['↓', 'ArrowDown', { color: '#5ad1ff', grande: true }], ['→', 'ArrowRight', { color: '#ffd23f', grande: true }]], fila: true },
  Blancazo: { joy: 'libre', botones: [['Nube', 'Shift', { color: '#fff6e8' }], ['Resucitador', 'x', { color: '#b68cff' }]] }, // sin «Caramelo»: el disparo ya es automático (ESPACIO no hacía nada)
  Liar: s => mandosLiar(s),
  Fumar: s => mandosFumar(s),
  Aires: { joy: 'h', botones: [['Pedo', ' ', { mantener: true, color: '#c8a83c', grande: true }]] },
  Sigilo: { joy: 'libre', botones: [['Sigilo', 'Shift', { mantener: true, color: '#9fe7ff', grande: true }]] },
  Palo: { joy: 'libre', botones: [['Disparar', ' ', { mantener: true, color: '#ff8fc0', grande: true }]] },
};

// Liar y Fumar piden cosas distintas según el momento, así que su configuración se calcula de la escena.
// Los botones van en los márgenes negros del lienzo (a los lados), con lado: 'izq' o 'der', para no tapar nada.
// «id» distingue cada estado: cuando cambia, se vuelven a montar los botones.
const ETIQUETA_PASO = { picar: 'Pica', boquilla: '¡Ya!', rellenar: 'Echa', cruzar: '¡Ya!', liar: 'Lía', pegar: '¡Ya!', encender: 'Enciende' };
function mandosLiar(s) {
  // Con el selector abierto (acompañantes y tipos) se toca en pantalla: ningún mando por encima.
  if (s.selectorAbierto || s.porro || !s.pasos) return null;
  const paso = s.pasos[s.paso];
  if (!paso) return null;
  if (paso === 'retorcer') {
    return { id: 'Liar-retorcer', botones: [['◄', 'ArrowLeft', { color: '#ff5fa2', grande: true, lado: 'izq' }], ['►', 'ArrowRight', { color: '#5ad1ff', grande: true, lado: 'der' }]] };
  }
  return { id: `Liar-${paso}`, botones: [[ETIQUETA_PASO[paso] || 'Acción', ' ', { mantener: true, color: '#ffd23f', grande: true, lado: 'der' }]] };
}
function mandosFumar(s) {
  if (s.acabado || !s.sys.isActive()) return null;
  const h = s.habilidad;
  if (!h) return { id: 'Fumar-calada', botones: [['Calada', ' ', { mantener: true, color: '#ffd23f', grande: true, lado: 'der' }]] };
  if (h.id === 'dragon') {
    return { id: 'Fumar-dragon', botones: [['◄', 'ArrowLeft', { color: '#ff5fa2', grande: true, lado: 'izq' }], ['►', 'ArrowRight', { color: '#5ad1ff', grande: true, lado: 'der' }]] };
  }
  const etiqueta = h.id === 'nube' ? 'Sopla' : h.id === 'fantasma' ? (h.fase === 0 ? 'Sopla' : '¡Ya!') : '¡Ya!';
  const mantener = h.id === 'nube' || (h.id === 'fantasma' && h.fase === 0);
  return { id: `Fumar-${h.id}-${etiqueta}`, botones: [[etiqueta, ' ', { mantener, color: '#ffd23f', grande: true, lado: 'der' }]] };
}

const Tactil = {
  activo: false,
  escena: null,
  pulsadas: new Set(),

  iniciar() {
    const tactil = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (!tactil) return;
    this.activo = true;
    window.TACTIL_UI = true;
    const raiz = document.getElementById('juego');
    raiz.style.position = 'relative';
    const css = document.createElement('style');
    css.textContent = `
      #mandos { position: absolute; inset: 0; pointer-events: none; z-index: 5; font-family: 'Caprasimo', serif; user-select: none; -webkit-user-select: none; }
      #mandos .joy { position: absolute; left: max(14px, env(safe-area-inset-left)); bottom: max(14px, env(safe-area-inset-bottom)); width: 132px; height: 132px; border-radius: 50%;
        background: rgba(27,16,40,.38); border: 4px solid rgba(255,246,232,.55); pointer-events: auto; touch-action: none; }
      #mandos .joy.h { height: 92px; width: 168px; border-radius: 46px; }
      #mandos .palo { position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px; border-radius: 50%;
        background: #ffd23f; border: 4px solid #1b1028; box-shadow: 0 4px 0 #1b1028; transition: transform .05s; }
      #mandos .botones { position: absolute; right: max(14px, env(safe-area-inset-right)); bottom: max(14px, env(safe-area-inset-bottom)); display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 10px; pointer-events: none; }
      #mandos .botones.izq { right: auto; left: max(14px, env(safe-area-inset-left)); align-items: flex-start; }
      #mandos .botones.margen { bottom: max(28px, env(safe-area-inset-bottom)); }
      #mandos .botones.margen .bt.grande { min-width: 0; width: 64px; height: 64px; border-radius: 32px; padding: 0; font-size: 16px; }
      #mandos .botones.margen .bt:not(.grande) { min-width: 0; width: 64px; height: 44px; border-radius: 22px; padding: 0; font-size: 10px; }
      #mandos .botones.fila { left: 50%; right: auto; transform: translateX(-50%); flex-direction: row; align-items: flex-end; }
      #mandos .bt { pointer-events: auto; touch-action: none; min-width: 64px; height: 52px; padding: 0 14px; border-radius: 26px; border: 4px solid #1b1028;
        box-shadow: 0 5px 0 #1b1028; color: #1b1028; font-size: 17px; display: flex; align-items: center; justify-content: center; opacity: .92; }
      #mandos .bt.grande { min-width: 86px; height: 86px; border-radius: 43px; font-size: 19px; }
      #mandos .botones.fila .bt.grande { min-width: 96px; font-size: 34px; }
      #mandos .bt.on { transform: translateY(4px); box-shadow: 0 1px 0 #1b1028; filter: brightness(1.15); }
      #mandos .pantalla { position: absolute; top: 46%; left: max(8px, env(safe-area-inset-left)); width: 40px; height: 40px; border-radius: 12px;
        background: rgba(27,16,40,.55); border: 3px solid rgba(255,246,232,.6); color: #fff6e8; font-size: 20px; display: flex; align-items: center; justify-content: center; pointer-events: auto; }
    `;
    document.head.appendChild(css);
    this.capa = document.createElement('div');
    this.capa.id = 'mandos';
    raiz.appendChild(this.capa);
    this.prepararPantallaCompleta();
    // En el móvil, los objetivos empiezan plegados (se abren con el botón).
    if (typeof ESTADO !== 'undefined' && ESTADO.ocultarObjetivos === undefined) ESTADO.ocultarObjetivos = true;
    setInterval(() => this.vigilar(), 250);
  },

  // Pantalla completa de la página entera (lienzo + mandos + aviso de girar dentro).
  // El navegador solo la concede dentro de un gesto que «activa» (pointerup/touchend/click con el dedo,
  // NO pointerdown): por eso el ⛶ de antes, que iba en pointerdown, no hacía nada en Android.
  // En iPhone no existe para la página: allí se avisa una vez de «Añadir a pantalla de inicio».
  fsPosible() { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); },
  fsActiva() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
  instalada() {
    try { return !!navigator.standalone || window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches; } catch (e) { return false; }
  },

  pantallaCompleta() {
    if (this.fsActiva() || !this.fsPosible() || this.pidiendo) return; // pointerup y touchend del mismo toque: una sola petición
    this.pidiendo = true;
    setTimeout(() => { this.pidiendo = false; }, 600);
    const raiz = document.documentElement;
    const girar = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* solo Android en pantalla completa */ } };
    try {
      const r = raiz.requestFullscreen ? raiz.requestFullscreen({ navigationUI: 'hide' }) : raiz.webkitRequestFullscreen();
      if (r && r.then) r.then(girar, () => {}); else girar();
    } catch (e) { /* el navegador puede negarse */ }
  },

  prepararPantallaCompleta() {
    if (this.instalada()) return; // abierta desde la pantalla de inicio: ya va sin barras
    if (this.fsPosible()) {
      // ⛶ para volver a entrar si se sale (atrás, gesto del sistema). Solo se ve fuera de pantalla completa.
      const pc = document.createElement('div');
      pc.className = 'pantalla';
      pc.textContent = '⛶';
      pc.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); });
      pc.addEventListener('click', e => { e.stopPropagation(); this.pantallaCompleta(); });
      this.capa.appendChild(pc);
      const ver = () => { pc.style.display = this.fsActiva() ? 'none' : 'flex'; };
      ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, ver));
      // Primer toque en cualquier sitio (el «Toca para entrar» de la portada): entra solo. Hasta 3 intentos
      // si el navegador se niega; en cuanto entra, no se vuelve a forzar (si el jugador sale, es cosa suya).
      let intentos = 0;
      const fin = () => { ['pointerup', 'touchend'].forEach(t => window.removeEventListener(t, toque, true)); };
      const toque = e => {
        if (e.type === 'pointerup' && e.pointerType === 'mouse') return;
        if (this.fsActiva() || ++intentos > 3) return fin();
        this.pantallaCompleta();
      };
      ['pointerup', 'touchend'].forEach(t => window.addEventListener(t, toque, true));
      ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => { if (this.fsActiva()) fin(); }));
    } else if (/iPhone|iPod|iPad/.test(navigator.userAgent)) {
      // Se enseña con el primer toque (cuando en Android entraría a pantalla completa), no mientras carga.
      const toque = () => { window.removeEventListener('touchend', toque, true); this.pistaIOS(); };
      window.addEventListener('touchend', toque, true);
    }
  },

  // iPhone: una sola vez, discreta y se quita sola o con un toque.
  pistaIOS() {
    try { if (localStorage.getItem('unake_pista_ios')) return; localStorage.setItem('unake_pista_ios', '1'); } catch (e) { /* sin memoria: se enseña igual */ }
    const p = document.createElement('div');
    p.id = 'pista-ios';
    p.innerHTML = 'Para jugar a pantalla completa: <b>Compartir</b> → <b>Añadir a pantalla de inicio</b> <span>✕</span>';
    p.style.cssText = 'position:absolute;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:max-content;max-width:calc(100% - 40px);'
      + 'background:rgba(27,16,40,.88);color:#fff6e8;border:2px solid rgba(255,210,63,.7);border-radius:14px;padding:7px 12px;'
      + 'font:14px/1.3 Caprasimo,serif;text-align:center;pointer-events:auto;z-index:6;transition:opacity .4s;';
    const quitar = () => { p.style.opacity = '0'; setTimeout(() => p.remove(), 450); };
    p.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); quitar(); });
    setTimeout(quitar, 9000);
    this.capa.appendChild(p);
  },

  // Mira qué escena está delante y monta sus mandos (y los quita si hay un modal en el barrio).
  vigilar() {
    const juego = window.juego;
    if (!juego || !juego.scene) return;
    const activas = juego.scene.getScenes(true);
    const s = activas[activas.length - 1];
    const clave = s ? s.scene.key : null;
    const conModal = (clave === 'Barrio' && s.modal) || (s && s.panelAbierto);
    let cfg = conModal ? null : MANDOS[clave];
    if (typeof cfg === 'function') { try { cfg = cfg(s); } catch (e) { cfg = null; } }
    const id = cfg && cfg.id ? cfg.id : `${clave}${conModal ? '-modal' : ''}`;
    if (id === this.escena) return;
    this.escena = id;
    this.montar(cfg);
  },

  soltarTodo() {
    this.pulsadas.forEach(k => teclaSintetica('keyup', k));
    this.pulsadas.clear();
  },

  montar(cfg) {
    this.soltarTodo();
    this.capa.querySelectorAll('.joy, .botones').forEach(n => n.remove());
    if (!cfg) return;
    if (cfg.joy) this.joystick(cfg.joy);
    if (cfg.botones) {
      // Botones con «lado»: uno en cada margen del lienzo (si el margen es estrecho, a la esquina).
      const lienzo = window.juego && window.juego.canvas ? window.juego.canvas.getBoundingClientRect() : null;
      const margenIzq = lienzo ? lienzo.left : 0, margenDer = lienzo ? window.innerWidth - lienzo.right : 0;
      const cajas = {};
      cfg.botones.forEach(([etiqueta, key, op = {}]) => {
        const lado = op.lado || 'libre';
        if (!cajas[lado]) {
          const caja = document.createElement('div');
          caja.className = `botones${cfg.fila ? ' fila' : ''}${lado === 'izq' ? ' izq' : ''}`;
          const margen = lado === 'izq' ? margenIzq : lado === 'der' ? margenDer : 0;
          if (margen >= 70) { caja.classList.add('margen'); caja.style[lado === 'izq' ? 'left' : 'right'] = `max(${Math.round((margen - 64) / 2)}px, env(safe-area-inset-${lado === 'izq' ? 'left' : 'right'}))`; } // fuera del notch
          cajas[lado] = caja;
          this.capa.appendChild(caja);
        }
        cajas[lado].appendChild(this.boton(etiqueta, key, op));
      });
    }
  },

  boton(etiqueta, key, { mantener = false, color = '#ffd23f', grande = false } = {}) {
    const b = document.createElement('div');
    b.className = `bt${grande ? ' grande' : ''}`;
    b.style.background = color;
    b.textContent = etiqueta;
    const abajo = e => {
      e.preventDefault(); e.stopPropagation();
      b.classList.add('on');
      if (navigator.vibrate) navigator.vibrate(8);
      teclaSintetica('keydown', key);
      this.pulsadas.add(key);
      if (!mantener) setTimeout(() => { teclaSintetica('keyup', key); this.pulsadas.delete(key); b.classList.remove('on'); }, 90);
    };
    const arriba = e => {
      e.preventDefault(); e.stopPropagation();
      if (!mantener) return;
      b.classList.remove('on');
      teclaSintetica('keyup', key);
      this.pulsadas.delete(key);
    };
    b.addEventListener('pointerdown', abajo);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, arriba));
    return b;
  },

  joystick(modo) {
    const j = document.createElement('div');
    j.className = `joy${modo === 'h' ? ' h' : ''}`;
    const palo = document.createElement('div');
    palo.className = 'palo';
    j.appendChild(palo);
    this.capa.appendChild(j);
    let dedo = null;
    const dirs = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };
    const poner = (k, on) => {
      if (dirs[k] === on) return;
      dirs[k] = on;
      teclaSintetica(on ? 'keydown' : 'keyup', k);
      if (on) this.pulsadas.add(k); else this.pulsadas.delete(k);
    };
    const mover = e => {
      const r = j.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2);
      let dy = modo === 'h' ? 0 : e.clientY - (r.top + r.height / 2);
      const max = modo === 'h' ? r.width / 2 - 20 : r.width / 2 - 14;
      const d = Math.hypot(dx, dy);
      if (d > max) { dx *= max / d; dy *= max / d; }
      palo.style.transform = `translate(${dx}px, ${dy}px)`;
      const zona = 18;
      poner('ArrowLeft', dx < -zona);
      poner('ArrowRight', dx > zona);
      poner('ArrowUp', dy < -zona * 1.2);
      poner('ArrowDown', dy > zona * 1.2);
    };
    const soltar = () => {
      dedo = null;
      palo.style.transform = '';
      Object.keys(dirs).forEach(k => poner(k, false));
    };
    j.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); dedo = e.pointerId; j.setPointerCapture(e.pointerId); mover(e); });
    j.addEventListener('pointermove', e => { if (e.pointerId === dedo) mover(e); });
    ['pointerup', 'pointercancel'].forEach(t => j.addEventListener(t, e => { if (e.pointerId === dedo) soltar(); }));
  },
};

window.addEventListener('load', () => Tactil.iniciar());

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
  Barrio: { joy: 'libre', botones: [['Usar', 'e', { color: '#ffd23f', grande: true }], ['Objetivos', 'o', { color: '#5ad1ff' }]] },
  Tarta: { joy: 'h' },
  DJ: { botones: [['←', 'ArrowLeft', { color: '#ff5fa2', grande: true }], ['↓', 'ArrowDown', { color: '#5ad1ff', grande: true }], ['→', 'ArrowRight', { color: '#ffd23f', grande: true }]], fila: true },
  Blancazo: { joy: 'libre', botones: [['Caramelo', ' ', { mantener: true, color: '#ffd23f', grande: true }], ['Nube', 'Shift', { color: '#fff6e8' }], ['Resucitador', 'x', { color: '#b68cff' }]] },
  Liar: { joy: 'h', botones: [['Acción', ' ', { mantener: true, color: '#ffd23f', grande: true }]] },
  Fumar: { botones: [['Calada', ' ', { mantener: true, color: '#ffd23f', grande: true }]] },
};

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
      #mandos .joy { position: absolute; left: max(14px, env(safe-area-inset-left)); bottom: 14px; width: 132px; height: 132px; border-radius: 50%;
        background: rgba(27,16,40,.38); border: 4px solid rgba(255,246,232,.55); pointer-events: auto; touch-action: none; }
      #mandos .joy.h { height: 92px; width: 168px; border-radius: 46px; }
      #mandos .palo { position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px; border-radius: 50%;
        background: #ffd23f; border: 4px solid #1b1028; box-shadow: 0 4px 0 #1b1028; transition: transform .05s; }
      #mandos .botones { position: absolute; right: max(14px, env(safe-area-inset-right)); bottom: 14px; display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 10px; pointer-events: none; }
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
    // Pantalla completa (las barras del navegador se comen media pantalla en horizontal).
    const pc = document.createElement('div');
    pc.className = 'pantalla';
    pc.textContent = '⛶';
    pc.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.pantallaCompleta(); });
    this.capa.appendChild(pc);
    // En el móvil, los objetivos empiezan plegados (se abren con el botón).
    if (typeof ESTADO !== 'undefined' && ESTADO.ocultarObjetivos === undefined) ESTADO.ocultarObjetivos = true;
    setInterval(() => this.vigilar(), 250);
  },

  pantallaCompleta() {
    const juego = window.juego;
    if (!juego) return;
    try { if (juego.scale.isFullscreen) juego.scale.stopFullscreen(); else juego.scale.startFullscreen(); } catch (e) { /* el navegador puede negarse */ }
  },

  // Mira qué escena está delante y monta sus mandos (y los quita si hay un modal en el barrio).
  vigilar() {
    const juego = window.juego;
    if (!juego || !juego.scene) return;
    const activas = juego.scene.getScenes(true);
    const s = activas[activas.length - 1];
    const clave = s ? s.scene.key : null;
    const conModal = (clave === 'Barrio' && s.modal) || (s && s.panelAbierto);
    const id = `${clave}${conModal ? '-modal' : ''}`;
    if (id === this.escena) return;
    this.escena = id;
    this.montar(conModal ? null : MANDOS[clave]);
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
      const caja = document.createElement('div');
      caja.className = `botones${cfg.fila ? ' fila' : ''}`;
      cfg.botones.forEach(([etiqueta, key, op = {}]) => caja.appendChild(this.boton(etiqueta, key, op)));
      this.capa.appendChild(caja);
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

// La música del juego: cada situación tiene su hueco (ver 07_juego/musica-encargo.md). Las canciones
// del grupo van en 04_audio/musica/juego/<hueco>.mp3; preparar_assets.py las copia y las anota en
// MUSICA_DISPONIBLE (arte.js). Mientras falte una, suena su respaldo (el tema de la intro) o nada.
// Una sola música a la vez, con fundido al cambiar; el volumen sale de las opciones del menú.

// Qué hueco suena en cada escena (el barrio decide el suyo según el mundo y la sala).
const MUSICA_ESCENA = {
  Portada: 'portada', Intro: null, DJ: null,
  Contrasena: 'minijuego', Tarta: 'minijuego', Barra: 'minijuego', Pipas: 'minijuego', Cuentas: 'minijuego',
  Periquito: 'minijuego', Aires: 'minijuego', Lasslow: 'tension', Rescate: 'tension', Blancazo: 'jefe', Palo: 'jefe',
  Inspeccion: 'sigilo', Sigilo: 'sigilo', Farol: 'apuestas', Tragaperras: 'apuestas', Carrera: 'apuestas',
  Liar: 'sofa', Fumar: 'sofa', Final: 'final', Poscreditos: 'poscreditos',
};
// Respaldo mientras no estén las canciones del grupo (lo que sonaba hasta ahora).
const MUSICA_RESPALDO = { portada: ['musica-intro', 0.7], sofa: ['musica-intro', 0.45], final: ['musica-intro', 1] };

function volumenMusica() { const o = ESTADO.opciones || {}; return o.musica ?? 0.6; }
function volumenEfectos() { const o = ESTADO.opciones || {}; return o.efectos ?? 1; }

const Musica = {
  actual: null, // { hueco, snd }

  hueco(scene) {
    const k = scene.scene.key;
    if (k !== 'Barrio') return MUSICA_ESCENA[k] ?? null;
    if (scene.mundo !== 'humo') return 'dia';
    return ['dentro', 'reservado', 'cocina', 'bano', 'techo'].includes(scene.sala) ? 'unake' : 'noche';
  },

  alEntrar(scene) { this.poner(scene, this.hueco(scene)); },

  poner(scene, hueco) {
    if (this.actual && this.actual.hueco === hueco && this.actual.snd && this.actual.snd.isPlaying) return;
    let clave = null;
    let base = 0.6;
    if (hueco && typeof MUSICA_DISPONIBLE !== 'undefined' && MUSICA_DISPONIBLE.includes(hueco)) clave = `m-${hueco}`;
    else if (MUSICA_RESPALDO[hueco]) [clave, base] = MUSICA_RESPALDO[hueco];
    // Sin canción para este hueco: silencio (como hasta ahora), con fundido.
    this.parar(scene);
    if (!clave || !scene.cache.audio.exists(clave)) return;
    const snd = scene.sound.add(clave, { loop: true, volume: 0 });
    snd.esMusica = true;
    snd.base = base;
    snd.play();
    scene.tweens.addCounter({ from: 0, to: 1, duration: 900, onUpdate: tw => { if (snd.isPlaying) snd.setVolume(tw.getValue() * base * volumenMusica()); } });
    this.actual = { hueco, snd };
  },

  parar(scene) {
    const a = this.actual;
    this.actual = null;
    if (!a || !a.snd) return;
    const snd = a.snd;
    const desde = snd.volume;
    let paso = 0;
    // Fundido con setTimeout: la escena que lo pidió puede cerrarse mientras tanto.
    const t = setInterval(() => {
      paso++;
      try { snd.setVolume(desde * (1 - paso / 8)); } catch (e) { /* ya destruido */ }
      if (paso >= 8) { clearInterval(t); try { snd.stop(); snd.destroy(); } catch (e) { /* ya parado */ } }
    }, 60);
  },

  // Cuando cambian las opciones, se ajusta lo que suena.
  ajustar() {
    const a = this.actual;
    if (a && a.snd && a.snd.isPlaying) a.snd.setVolume(a.snd.base * volumenMusica());
  },
};

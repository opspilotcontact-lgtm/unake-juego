// La música del juego: cada situación tiene su hueco (ver 07_juego/musica-encargo.md y los créditos
// en 04_audio/musica/juego/CREDITOS.md). Los temas están en assets/musica/<hueco>.mp3 y se cargan la
// primera vez que hacen falta (no al arrancar). Mientras falte alguno, suena su respaldo (el tema de la
// intro) o nada. Una sola música a la vez, con fundido; el volumen sale de las opciones del menú.

// Qué hueco suena en cada escena (el barrio decide el suyo según el mundo y la sala).
const MUSICA_ESCENA = {
  Portada: 'portada', Intro: null, DJ: null,
  Contrasena: 'minijuego', Tarta: 'minijuego', Barra: 'minijuego', Pipas: 'minijuego', Cuentas: 'minijuego',
  Periquito: 'minijuego', Aires: 'minijuego', Lasslow: 'tension', Rescate: 'tension', Blancazo: 'jefe', Palo: 'jefe',
  Inspeccion: 'sigilo', Sigilo: 'sigilo', Farol: 'apuestas', Tragaperras: 'apuestas', Carrera: 'apuestas',
  Liar: 'sofa', Fumar: 'sofa', Final: 'final', Poscreditos: 'poscreditos',
};
// Respaldo para los huecos sin tema propio: la intro de la serie (la firma de UNAKÉ).
const MUSICA_RESPALDO = { portada: ['musica-intro', 0.7], sofa: ['musica-intro', 0.45], final: ['musica-intro', 1] };
// Volumen relativo de cada hueco (el ambiente del barrio, más bajo que los minijuegos).
const MUSICA_BASE = { noche: 0.45, unake: 0.45, dia: 0.4, escena: 0.4, momento: 0.5, sofa: 0.5, poscreditos: 0.6 };

function volumenMusica() { const o = ESTADO.opciones || {}; return o.musica ?? 0.6; }
function volumenEfectos() { const o = ESTADO.opciones || {}; return o.efectos ?? 1; }

const Musica = {
  actual: null,  // { hueco, snd }
  deseado: null, // el último hueco pedido (si llega tarde una descarga, solo suena si sigue siendo este)

  hueco(scene) {
    const k = scene.scene.key;
    if (k !== 'Barrio') return MUSICA_ESCENA[k] ?? null;
    if (scene.mundo !== 'humo') return 'dia';
    return ['dentro', 'reservado', 'cocina', 'bano', 'techo'].includes(scene.sala) ? 'unake' : 'noche';
  },

  alEntrar(scene) { this.poner(scene, this.hueco(scene)); },

  poner(scene, hueco) {
    this.deseado = hueco;
    if (this.actual && this.actual.hueco === hueco) return;
    const propio = hueco && typeof MUSICA_DISPONIBLE !== 'undefined' && MUSICA_DISPONIBLE.includes(hueco);
    if (propio) {
      const clave = `m-${hueco}`;
      if (scene.cache.audio.exists(clave)) return this.sonar(scene, hueco, clave, MUSICA_BASE[hueco] ?? 0.6);
      // Se descarga ahora; mientras, se apaga lo anterior.
      this.parar();
      if (!this.cargando) this.cargando = {};
      if (this.cargando[clave]) return;
      this.cargando[clave] = true;
      scene.load.audio(clave, `assets/musica/${hueco}.mp3`);
      scene.load.once(`filecomplete-audio-${clave}`, () => {
        this.cargando[clave] = false;
        const activa = window.juego && window.juego.scene.getScenes(true)[0];
        if (this.deseado === hueco && activa) this.sonar(activa, hueco, clave, MUSICA_BASE[hueco] ?? 0.6);
      });
      scene.load.start();
      return;
    }
    if (MUSICA_RESPALDO[hueco]) {
      const [clave, base] = MUSICA_RESPALDO[hueco];
      if (scene.cache.audio.exists(clave)) return this.sonar(scene, hueco, clave, base);
    }
    // Sin tema para este hueco: silencio (con fundido).
    this.parar();
  },

  sonar(scene, hueco, clave, base) {
    if (this.actual && this.actual.hueco === hueco) return;
    this.parar();
    const snd = scene.sound.add(clave, { loop: true, volume: 0 });
    snd.esMusica = true;
    snd.base = base;
    snd.play();
    this.actual = { hueco, snd };
    this.fundido(snd, 0, base * volumenMusica(), 900);
  },

  // Fundidos con setTimeout: la escena que los pidió puede cerrarse mientras tanto.
  fundido(snd, desde, hasta, ms, alAcabar) {
    const pasos = Math.max(1, Math.round(ms / 60));
    let i = 0;
    const t = setInterval(() => {
      i++;
      try { snd.setVolume(desde + (hasta - desde) * (i / pasos)); } catch (e) { clearInterval(t); return; }
      if (i >= pasos) { clearInterval(t); if (alAcabar) alAcabar(); }
    }, 60);
  },

  parar() {
    const a = this.actual;
    this.actual = null;
    if (!a || !a.snd) return;
    const snd = a.snd;
    this.fundido(snd, snd.volume, 0, 500, () => { try { snd.stop(); snd.destroy(); } catch (e) { /* ya parado */ } });
  },

  // Cuando cambian las opciones, se ajusta lo que suena.
  ajustar() {
    const a = this.actual;
    if (a && a.snd && a.snd.isPlaying) a.snd.setVolume(a.snd.base * volumenMusica());
  },
};

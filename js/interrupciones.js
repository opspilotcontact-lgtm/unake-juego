// Interrupciones ⚡ entre capítulos (diseño del director, 17/11/2026: guiones/interrupciones.md).
// PROPUESTA para el juego: la madre de Vuper y El Mirón en el cuarto son lore nuevo, no canon de la serie.
//
// No son capítulos: algo que no esperas rompe la rutina entre dos capítulos. Cada una salta UNA vez, tras cerrar el
// capítulo `tras`, con el jugador libre en el barrio y un retraso de 20-60 s; nunca bloquea la historia.
//   madre1 (cuota) · niebla (blancazo) · control (nuevo) · madre2 (caja) · ojo (senal) · float (miron) · madre3 (pesado)
//
// Estado guardado (ESTADO):
//   interrupciones = { id: 'hecha' | 'pillado' }      las migra `migrar()`: si el capítulo SIGUIENTE al `tras` ya quedó atrás, se da por vista
//   intCurso = { id, fase, ... }                       la que está en marcha (fase 'madre' con su cuenta atrás, o la que espera a que vuelvas de un minijuego)
//
// Enganches en barrio.js (una línea cada uno): `Interrupciones.tick(this, dt)` en tiempos(), `Interrupciones.cosas(...)` en
// cargarSala() y `Interrupciones.interactuar(...)` al empezar interactuar(). La historia (historia.js) no se toca: mientras
// una espera, se retiene la entrada del capítulo siguiente con `pausaHistoria`, que es lo que ya hace el cierre de capítulo.
//
// TEXTO NUEVO mío (el director lo revisará): todos los diálogos de este archivo, salvo los marcados «del guion» (guiones/actos-3-4.js,
// capítulo 14 y tareas miron_separar / miron_neon del 13), que están reutilizados.

// ---------- Datos ----------

// Las tareas de la madre. `corto` es lo que sale en el aviso de arriba; `vivo` se comprueba solo (no se «hace»).
const TAREAS_MADRE = {
  vent: { corto: 'Ventilar' },
  liar: { corto: 'Lo de liar' },
  m: { corto: 'Tapar la M' },
  mascara: { corto: 'La máscara' },
  cena: { corto: 'Cena' },
  cuarto: { corto: 'Cuarto sin humo', vivo: true },
};
// Dónde están, en el cuarto, las zonas nuevas (sobre el fondo, sin dibujo propio): `texto` es lo que sale al hacerlo.
const ZONAS_MADRE = {
  vent: { x: 150, y: 600, nombre: 'La ventana', etiqueta: 'Ventilar', texto: 'Ventana abierta: el humo se va' },
  liar: { x: 545, y: 590, nombre: 'La mesilla (lo de liar)', etiqueta: 'Esconder lo de liar', texto: 'Papel, bolsita y mechero, al cajón' },
  mascara: { x: 400, y: 610, nombre: 'Debajo de la cama', etiqueta: 'Esconder la máscara', texto: 'La máscara, bajo el colchón' },
  cena: { x: 860, y: 600, nombre: 'Pedir la cena', etiqueta: 'Pedir la cena', texto: 'Cena pedida' },
};
const COSTE_CENA = 20;

const INTERRUPCIONES = {
  madre1: { tras: 'cuota', tipo: 'madre', segundos: 180, tareas: ['vent', 'liar', 'm', 'cuarto'], nivelTormenta: 1, multa: 25 },
  niebla: { tras: 'blancazo', tipo: 'escena' },
  control: { tras: 'nuevo', tipo: 'minijuego' },
  madre2: { tras: 'caja', tipo: 'madre', segundos: 120, tareas: ['vent', 'mascara', 'm', 'cena', 'cuarto'], nivelTormenta: 2, multa: 40 },
  ojo: { tras: 'senal', tipo: 'escena' },
  float: { tras: 'miron', tipo: 'minijuego' },
  madre3: { tras: 'pesado', tipo: 'escena' },
};
// En el orden en que caen en la historia.
const ORDEN_INTERRUPCIONES = ['madre1', 'niebla', 'control', 'madre2', 'ojo', 'float', 'madre3'];

// ---------- Textos (nuevos, salvo lo marcado «del guion») ----------

const TXT_INT = {
  madre1: {
    aviso: [
      ['narrador', 'El móvil vibra encima de la cama. «Mamá».'],
      ['madre', 'Cariño, voy para tu casa. Te llevo un táper. Llego en tres minutos.'],
      ['vuper', '¿En tres…? Mamá, no hace falta.'],
      ['madre', 'Ya he cogido el autobús. Abre la ventana, que se te quedan los olores.'],
      ['vuper', 'Vale, vale… Ventilar, esconder lo de liar, tapar la M.'],
      ['narrador', 'Tu madre llega en 3 minutos. Y tú, en tu cuarto y sin el humo puesto.'],
    ],
    gana: [
      ['narrador', 'Ding dong.'],
      ['madre-taper', 'Hola, cariño. Mira qué cuarto. Huele a limpio.'],
      ['vuper', 'Siempre lo tengo así.'],
      ['madre-taper', 'Te he traído lentejas. Y no me mires así: estás más flaco.'],
      ['vuper', 'Estoy igual, mamá.'],
      ['madre-taper', 'Estás cansado. Se te nota en cómo te sientas.'],
      ['madre-taper', 'Cómetelo todo. Y abre más la ventana: tienes el techo lleno de nubes.'],
    ],
    pilladaHumo: [
      ['narrador', 'Tu madre te encuentra. Siempre te encuentra. Es lo que tienen las madres.'],
      ['madre-bronca', 'Cariño… ¿qué es ese olor?'],
      ['vuper', 'Es ambientador. De pino.'],
      ['madre-bronca', '¡HIJO MÍO, TE ESTOY VIENDO LA CARA!'],
      ['narrador', 'Ante tus ojos, tu madre se hincha como una tormenta. Corre.'],
    ],
    pilladaDesorden: [
      ['narrador', 'Tu madre llega. Había avisado, así que no hay excusa.'],
      ['madre-bronca', 'Cariño. ¿Qué es todo esto? ¿Y esa tela? ¿Y ese cajón que huele?'],
      ['vuper', 'Mamá, puedo explicarlo.'],
      ['madre-bronca', '¡PUES EMPIEZA!'],
      ['narrador', 'Ante tus ojos, tu madre se hincha como una tormenta. Corre.'],
    ],
    deudaPierde: [
      ['madre-bronca', 'Esta noche el táper te lo comes tú solo. Y me debes una cena.'],
      ['vuper', '¿Y la explicación?'],
      ['madre-bronca', 'Esa, primero.'],
    ],
    deudaGana: [
      ['madre-bronca', 'Anda que… Mañana hablamos. Ya has cenado, que te he visto.'],
      ['vuper', 'Sí, mamá.'],
    ],
  },
  madre2: {
    aviso: [
      ['narrador', 'Otra vez el móvil. «Mamá».'],
      ['madre', 'Cariño, esta noche me quedo a dormir. Mañana tengo médico cerca. Llego en dos minutos.'],
      ['vuper', 'Mamá, que ayer… ¿en dos minutos?'],
      ['madre', 'Compra algo de cena, que no se te vea la nevera vacía.'],
      ['vuper', 'Ya voy. Ya voy.'],
      ['narrador', 'Tu madre llega en 2 minutos. Ventana, máscara, M, cena. Y sin humo.'],
    ],
    gana: [
      ['narrador', 'Ding dong.'],
      ['madre-taper', 'Ya estoy, cariño. Qué bien huele. ¿Es pizza?'],
      ['vuper', 'Es la cena. Ha llegado justo.'],
      ['madre-taper', '¿Y esa M de la pared?'],
      ['vuper', 'Es de mi trabajo.'],
      ['madre-taper', '¿Repartes comida y tienes un cartel luminoso?'],
      ['vuper', 'Es un barrio muy grande.'],
      ['madre-taper', 'Duerme tú en la cama, anda. Yo me apaño. Trabajas mucho, aunque no me lo cuentes.'],
      ['madre-taper', 'Buenas noches. Y apaga esa M, que parpadea y no me deja dormir.'],
      ['narrador', 'La M, tapada con una sábana, parpadea igual.'],
    ],
    pilladaHumo: [
      ['narrador', 'Tu madre llega con la maleta. Y con una nariz muy fina.'],
      ['madre-bronca', 'Aquí hay humo. Y no es de la cena.'],
      ['vuper', 'Mamá, es la calefacción.'],
      ['madre-bronca', '¡TÚ NO TIENES CALEFACCIÓN, HIJO!'],
      ['narrador', 'Esta vez la tormenta trae maleta. Corre.'],
    ],
    pilladaDesorden: [
      ['narrador', 'Tu madre llega con la maleta. Y mira por todas partes.'],
      ['madre-bronca', 'La cena sin hacer. Una máscara en la cama. Y esa M…'],
      ['vuper', 'Mamá, todo tiene explicación.'],
      ['madre-bronca', '¡PUES DALA, QUE ME QUEDO A DORMIR!'],
      ['narrador', 'Esta vez la tormenta trae maleta. Corre.'],
    ],
    deudaPierde: [
      ['madre-bronca', 'Me quedo igualmente. Y mañana, esta casa, patas arriba. Limpia.'],
      ['vuper', '¿Todo?'],
      ['madre-bronca', 'Y lo que no se ve también.'],
    ],
    deudaGana: [
      ['madre-bronca', 'Bueno. Me has ganado por velocidad. Pero me quedo a dormir.'],
      ['vuper', 'Claro, mamá.'],
    ],
  },
  madre3: [
    ['narrador', 'Una señora cruza la plaza con un táper. Se detiene delante de Monchiman.'],
    ['madre-taper', 'Tú eres el del cartel. Monchiman.'],
    ['monchiman', '…'],
    ['madre-taper', 'Mi vecina dice que le salvaste el kebab. Gracias.'],
    ['monchiman', '…'],
    ['madre-taper', 'Yo tengo un hijo, ¿sabes? Reparte comida por ahí. Nunca le ve nadie.'],
    ['monchiman', '…'],
    ['madre-taper', 'Pasa mucho tiempo en su cuarto. Creo que está haciendo algo importante. No sé qué.'],
    ['narrador', 'Se le limpian los ojos bajo el antifaz. No puede decir nada. Ella no lo sabe.'],
    ['madre-taper', 'Toma, un táper. Y si ves a mi hijo, dile que coma.'],
    ['madre-taper', 'Lo reconocerás enseguida: parece que siempre anda en las nubes.'],
    ['narrador', 'Monchiman mira hacia otro lado. Con mucho interés.'],
  ],
  niebla: [
    ['niebla', '¡Rider! Siéntate. Te cuento lo que llevas. Me lo sé de memoria. Más o menos.'],
    ['vuper', 'Vale, vale…'],
    ['niebla', 'Llegaste a una puerta. Había un loro. Te pidió una contraseña y dijiste… Pepinillo.'],
    ['vuper', 'No era Pepinillo.'],
    ['niebla', 'Pues Pepinillo estuvo bien. Luego el de las cuentas, Blancazo, te pidió monchis.'],
    ['vuper', 'Blancaso. Y era para la hucha.'],
    ['niebla', 'Eso. Para que no cierre Unaké. O el casero. Uno de los dos.'],
    ['niebla', 'Después hubo una burbuja que no bajaba. Se llamaba Pompón.'],
    ['vuper', 'La Pompa.'],
    ['niebla', 'Pompón me gusta más. Y a uno le dio un blancazo y vino uno amarillo. O al revés.'],
    ['niebla', 'Lo importante, que se me iba. Llevabas muchas noches llegando a esa puerta. Y hoy has pasado.'],
    ['narrador', 'Vuper no dice nada. Se le limpian los ojos.'],
    ['niebla', 'A ti no se me olvida. …¿Cómo te llamabas?'],
    ['vuper', 'Vuper.'],
    ['niebla', 'Qué bonito. ¿Es nuevo?'],
  ],
  ojo: [
    ['narrador', 'Es tarde. En tu cuarto, la luz de la M zumba bajito. Algo te mira desde la ventana.'],
    ['narrador', 'Un ojo. Uno solo. Enorme. Sin parpadear.'],
    ['vuper', '…'],
    ['narrador', 'Vuper esconde la máscara debajo de la cama. Apaga la M. Cierra la cortina de golpe.'],
    ['vuper', 'No hay nadie. Es un reflejo. Es una farola.'],
    ['narrador', 'El ojo parpadea. Una vez. Se aleja.'],
    ['miron', 'Solo miraba.'],
    ['vuper', 'Mañana cierro la ventana con llave.'],
    ['narrador', 'Al otro lado del cristal, alguien anota algo. En la pared de enfrente, la M tapada sigue parpadeando.'],
  ],
  control: {
    antes: [
      ['narrador', 'Reparto de noche. Cinco kilómetros sin un alma. Y de pronto, luces azules.'],
      ['vuper', 'Ahora no. Con el pedido caliente.'],
      ['narrador', 'Un agente del humo te hace señas con una linterna. Esto no estaba en el mapa.'],
    ],
    gana: [
      ['agente', 'Circule. Y la próxima vez, lleve papeles.'],
      ['vuper', 'Siempre los llevo. Son de liar.'],
      ['agente', '…Circule.'],
    ],
    pierde: [
      ['agente', 'Multa de 30 monchis. Por conducir con cara de nervios.'],
      ['vuper', 'Eso no existe.'],
      ['agente', 'Desde esta noche, sí.'],
    ],
  },
  float: {
    // Escena A: del guion (cap. 14: Lasslow se declara) y miron_separar (13), con mis dos puentes (Mirón y subir).
    a: [
      ['titulo', 'Breathe and float · La noche de la pajarita'],
      ['lasslow', 'Rider. Una confesión. Esta noche me declaro.'],
      ['vuper', '¿A quién?'],
      ['lasslow', 'A la dama del techo.'],
      ['narrador', 'Arriba, pegada al techo, la Pompa se mece con la música. Alguien le ha preguntado algo hace un rato. Todavía no ha contestado.'],
      ['pompa', '…Sí, me gusta el jazz.'],
      ['lasslow', 'Llevo meses de señor para que ella me mire. Esta noche me mira. O me hundo.'],
      ['lasslow', 'JA… JAJAJA. Perdón, caballero, es que me acuerdo de la feria.'],
      ['miron', 'Esa risa es mía. Alguien se la ha dado.'],
      ['lasslow', 'No es de nadie, señor. Es de la feria.'],
      ['miron', 'Una declaración. En un techo. Con testigos. Sospechoso.'],
      ['lasslow', 'Rider, no hay escalera. Yo solo sé subir de una manera.'],
      ['vuper', 'Mejor no me lo digas.'],
    ],
    // Escena B (entre Por los aires y En su punto): reparto del guion, con el neón de miron_neon (13).
    bGana: [['narrador', 'Lasslow se ha quedado a un palmo de la Pompa. Con los pies colgando y una flor de humo en la solapa.']],
    bPierde: [['narrador', 'No ha salido como esperaba. Lasslow sube igualmente: la risa no entiende de puntería.']],
    b: [
      ['lasslow', 'Buenas noches, señorita.'],
      ['pompa', '…Hace tres frases que te iba a decir hola.'],
      ['narrador', 'Los nervios hinchan. La Pompa se está estirando, temblando, a una brisa de reventar.'],
      ['pompa', 'Yo no… que exploto.'],
      ['narrador', 'Abajo, bajo el neón de Unaké, el Mirón se sienta. Nadie le mira. Por una vez, nadie le mira.'],
    ],
    // Escena C: el cierre del guion (momento persona de Lasslow y su último chiste).
    c: [
      ['narrador', 'La Pompa recupera su punto exacto: ni desinflada ni a punto de explotar.'],
      ['lasslow', 'Señorita… llevo meses de señor para que usted me vuelva a mirar como aquella primera noche.'],
      ['pompa', 'Me acuerdo. Te miré como se mira a un señor.'],
      ['narrador', 'A Lasslow le lloran los ojos, esta vez de felicidad. Se le limpian los ojos.'],
      ['pompa', 'Qué detalle.'],
      ['miron', '…Qué raro. No sospecho de nadie.'],
      ['lasslow', 'Señorita… ¿le gusto yo… o solo el caramelo? JA… JAJAJA. Perdón.'],
      ['pompa', '…El caramelo.'],
    ],
  },
};

// ---------- Motor ----------

const Interrupciones = {
  retraso: [20000, 60000], // ms entre que toca y salta (las pruebas lo acortan)
  PREMIO_FLOAT: 80,
  PREMIO_MADRE3: 40,

  datos: id => INTERRUPCIONES[id],
  estado(id) { ESTADO.interrupciones = ESTADO.interrupciones || {}; return id ? ESTADO.interrupciones[id] : ESTADO.interrupciones; },
  fin(id, como = 'hecha') { this.estado()[id] = como; ESTADO.intCurso = null; guardarPartida(); },

  // Partidas viejas: si ya se ha pasado el capítulo SIGUIENTE al `tras`, se da por vista (no salta tarde y fuera de sitio).
  migrar() {
    const E = this.estado();
    ORDEN_INTERRUPCIONES.forEach(id => {
      const i = capIdx(INTERRUPCIONES[id].tras);
      if (E[id] || i === Infinity) return;
      if ((ESTADO.capitulo || 0) > i + 1) E[id] = 'hecha';
    });
  },
  // La que toca ahora (en el capítulo siguiente a su `tras`), o null.
  pendiente() {
    if (historiaAcabada()) return null;
    const E = this.estado();
    return ORDEN_INTERRUPCIONES.find(id => {
      const i = capIdx(INTERRUPCIONES[id].tras);
      return !E[id] && i !== Infinity && (ESTADO.capitulo || 0) === i + 1;
    }) || null;
  },

  // Un tic por fotograma desde Barrio.tiempos(): programa la que toca y lleva las que están en marcha.
  tick(s, dt) {
    if (!s.sys || !s.sys.isActive()) return;
    this.migrar();
    // Salto explícito (el bot de e2e, o quien lo pida): se dan por vistas las que tocarían.
    if (typeof window !== 'undefined' && window.INTERRUPCIONES_SALTAR) return this.saltar(s);
    const cur = ESTADO.intCurso;
    if (cur) {
      if (!introVistaDeCap()) s.pausaHistoria = Math.max(s.pausaHistoria || 0, s.time.now + 1500); // la entrada del capítulo siguiente espera
      return this.seguir(s, dt, cur);
    }
    this.quitarPanel(s);
    const id = this.pendiente();
    if (!id) { s._intListo = false; return; }
    // Hasta que acabe el cierre del capítulo anterior no empieza la cuenta. Luego se retiene la entrada del siguiente.
    if (!s._intListo) {
      if (s.modal || s.cambiando || s.time.now < (s.pausaHistoria || 0) - 4000) return;
      s._intListo = true;
      s._intT = Phaser.Math.Between(this.retraso[0], this.retraso[1]) / 1000;
    }
    if (!introVistaDeCap()) s.pausaHistoria = Math.max(s.pausaHistoria || 0, s.time.now + 1500);
    if (s.reparto || s.senal || ESTADO.blancazo || (typeof guiaActiva === 'function' && guiaActiva())) return;
    s._intT -= dt;
    if (s._intT > 0 || s._intLanzando) return;
    s._intLanzando = true;
    s.cuandoLibre(() => { s._intLanzando = false; s._intListo = false; if (!ESTADO.intCurso && this.pendiente() === id) this.lanzar(s, id); });
  },
  saltar(s) {
    const E = this.estado();
    ORDEN_INTERRUPCIONES.forEach(id => { const i = capIdx(INTERRUPCIONES[id].tras); if (!E[id] && i !== Infinity && (ESTADO.capitulo || 0) > i) E[id] = 'hecha'; });
    ESTADO.intCurso = null;
    this.quitarPanel(s);
  },

  // Una escena de cómic (escena_comic.js) y, al acabar, lo siguiente.
  escena(s, lineas, opciones, fin) {
    s.cuandoLibre(() => s.abrirEscena(lineas, () => { try { if (fin) fin(); } catch (e) { console.error('[interrupciones]', e); const id = ESTADO.intCurso ? ESTADO.intCurso.id : this.pendiente(); if (id) this.fin(id, 'hecha'); } }, { mundo: s.mundo, ...opciones }));
  },
  // Salta a un minijuego pasado un momento (que el iris de la escena termine de cerrarse). La fase «de vuelta» se pone
  // justo al lanzar, para que el tic no crea que ya has vuelto durante la espera.
  jugar(s, cur, fase, clave, datos = {}) {
    cur.fase = 'espera';
    cur.esperaDesde = 0;
    guardarPartida();
    s.time.delayedCall(700, () => { cur.fase = fase; guardarPartida(); s.lanzar(clave, datos); });
  },
  base(clave) { return { gana: stat('gana_' + clave), jug: stat('jugada_' + clave) }; },

  lanzar(s, id) {
    const D = INTERRUPCIONES[id];
    if (D.tipo === 'madre') return this.arrancarMadre(s, id);
    return this['lanzar_' + id](s);
  },

  // ----- La madre (madre1, madre2) -----

  arrancarMadre(s, id) {
    const D = INTERRUPCIONES[id];
    this.escena(s, TXT_INT[id].aviso, { fondo: 'cuarto' }, () => {
      ESTADO.intCurso = { id, fase: 'madre', restante: D.segundos, t: {} };
      guardarPartida();
      s.cargarSala(s.sala); // si estás en el cuarto, aparecen sus zonas
      sfx(s, 'campanita', { volume: 0.5 });
    });
  },
  tareasDe(id) { return INTERRUPCIONES[id].tareas; },

  seguir(s, dt, cur) {
    if (cur.fase === 'madre') return this.tickMadre(s, dt, cur);
    if (['tormenta', 'control', 'aires', 'punto'].includes(cur.fase)) {
      if (s.modal || s.cambiando || s._saliendo) return;
      const fase = cur.fase;
      cur.fase = 'espera'; // una sola vez
      return this.alVolver(s, cur, fase);
    }
    // 'espera' (hay una escena en marcha) u otra cosa: no hacer nada. Si se quedó colgada sin ventana, se retoma.
    if (cur.fase === 'espera' && !s.modal && !s.cambiando && !s._saliendo) {
      cur.esperaDesde = (cur.esperaDesde || 0) + dt;
      if (cur.esperaDesde > 20) this.fin(cur.id, 'hecha');
    }
  },

  tickMadre(s, dt, cur) {
    const D = INTERRUPCIONES[cur.id];
    if (cur.llega !== undefined) {
      cur.llega -= dt;
      this.pintarPanel(s, cur);
      if (cur.llega <= 0) { cur.fase = 'espera'; this.quitarPanel(s); this.llegaMadre(s, cur, true); }
      return;
    }
    cur.restante -= dt;
    const enCuarto = s.sala === 'cuarto' && !enMundoHumo();
    // Con la ventana abierta, el aire del cuarto despeja: se baja el colocón solo mientras estés dentro.
    if (cur.ventilando && s.sala === 'cuarto') ESTADO.colocon = Math.max(0, ESTADO.colocon - dt * 6);
    cur.t.cuarto = enCuarto;
    const todas = D.tareas.every(k => cur.t[k]);
    if (todas) {
      cur.llega = 3.5;
      sfx(s, 'puerta', { volume: 0.5 });
      golpeTexto(s, ANCHO / 2, 300, '¡Ding dong!', COLOR.amarillo, 56);
    } else if (cur.restante <= 0) {
      cur.fase = 'espera';
      this.quitarPanel(s);
      this.llegaMadre(s, cur, false);
    }
    this.pintarPanel(s, cur);
  },

  llegaMadre(s, cur, bien) {
    const id = cur.id, D = INTERRUPCIONES[id], T = TXT_INT[id];
    s.cargarSala(s.sala); // fuera las zonas
    if (bien) {
      return this.escena(s, T.gana, { fondo: 'cuarto', mundo: 'normal', momento: true }, () => {
        let premio;
        if (id === 'madre1') { ESTADO.hambre = 0; premio = 'El táper te llena el hambre'; }
        else premio = this.regaloMadre2(s);
        this.fin(id, 'hecha');
        s.refrescarHud();
        golpeTexto(s, ANCHO / 2, 300, premio, COLOR.verde, 40);
      });
    }
    const humo = enMundoHumo();
    sumarStat('madrePillado'); // la cuenta de la noche y el logro «Hola, mamá» (vida.js)
    const lineas = humo ? T.pilladaHumo : T.pilladaDesorden;
    this.escena(s, lineas, { fondo: s.sala in SALAS ? s.sala : 'cuarto', mundo: s.mundo }, () => {
      // Tormenta: nivel 1 en madre1 y 2 en madre2 (se restaura al volver).
      ESTADO.niveles = ESTADO.niveles || {};
      cur.nivelAntes = ESTADO.niveles.Tormenta;
      cur.nivelForzado = D.nivelTormenta;
      ESTADO.niveles.Tormenta = D.nivelTormenta;
      cur.base = this.base('Tormenta');
      this.jugar(s, cur, 'tormenta', 'Tormenta');
    });
  },
  // Una prenda del armario que aún no tengas; si no, monchis.
  regaloMadre2(s) {
    const a = armario();
    const p = (typeof ARMARIO !== 'undefined' ? ARMARIO : []).find(x => !a.tiene[x.id] && prendaDisponible(x, s));
    if (p) { a.tiene[p.id] = true; guardarPartida(); return `Tu madre te ha comprado: ${p.nombre}`; }
    ESTADO.monchis += 60;
    return 'Tu madre te deja 60 monchis en la mesilla';
  },

  // ----- Al volver de un minijuego -----

  alVolver(s, cur, fase) {
    const id = cur.id;
    if (fase === 'tormenta') {
      const gano = stat('gana_Tormenta') > cur.base.gana;
      ESTADO.niveles = ESTADO.niveles || {};
      const subio = (ESTADO.niveles.Tormenta || 1) > cur.nivelForzado;
      if (cur.nivelAntes === undefined && !subio) delete ESTADO.niveles.Tormenta; else ESTADO.niveles.Tormenta = (cur.nivelAntes || 1) + (subio ? 1 : 0);
      const T = TXT_INT[id];
      return this.escena(s, gano ? T.deudaGana : T.deudaPierde, { fondo: 'cuarto', mundo: 'normal' }, () => {
        let aviso = '';
        if (!gano) { const m = Math.min(ESTADO.monchis, INTERRUPCIONES[id].multa); ESTADO.monchis -= m; aviso = `Deuda con tu madre: −${m} monchis`; }
        this.fin(id, 'pillado');
        s.refrescarHud();
        if (aviso) golpeTexto(s, ANCHO / 2, 300, aviso, COLOR.rosa, 40);
      });
    }
    if (fase === 'control') {
      const gano = stat('gana_Control') > cur.base.gana;
      const T = TXT_INT.control;
      return this.escena(s, gano ? T.gana : T.pierde, { fondo: 'carretera', mundo: 'humo', momento: true }, () => {
        let aviso = '';
        if (!gano) { const m = Math.min(ESTADO.monchis, 30); ESTADO.monchis -= m; aviso = `Multa: −${m} monchis`; }
        this.fin(id, 'hecha');
        s.refrescarHud();
        if (aviso) golpeTexto(s, ANCHO / 2, 300, aviso, COLOR.rosa, 40);
      });
    }
    if (fase === 'aires') {
      const gano = stat('gana_Aires') > cur.base.gana;
      const T = TXT_INT.float;
      return this.escena(s, [...(gano ? T.bGana : T.bPierde), ...T.b], { fondo: 'dentro', mundo: 'humo' }, () => {
        cur.base = this.base('EnSuPunto');
        this.jugar(s, cur, 'punto', 'EnSuPunto', { nerviosa: true });
      });
    }
    if (fase === 'punto') {
      return this.escena(s, TXT_INT.float.c, { fondo: 'dentro', mundo: 'humo', momento: true }, () => {
        ESTADO.monchis += this.PREMIO_FLOAT;
        this.fin(id, 'hecha');
        s.refrescarHud();
        golpeTexto(s, ANCHO / 2, 300, `+${this.PREMIO_FLOAT} monchis de Lasslow`, COLOR.verde, 40);
      });
    }
  },

  // ----- Las que no son la madre -----

  lanzar_niebla(s) {
    this.escena(s, TXT_INT.niebla, { fondo: 'plaza', mundo: 'normal', momento: true }, () => this.fin('niebla', 'hecha'));
  },
  lanzar_madre3(s) {
    this.escena(s, TXT_INT.madre3, { fondo: 'plaza', mundo: 'normal', momento: true }, () => {
      ESTADO.hambre = 0;
      ESTADO.monchis += this.PREMIO_MADRE3;
      this.fin('madre3', 'hecha');
      s.refrescarHud();
      golpeTexto(s, ANCHO / 2, 300, `Táper: hambre a cero · +${this.PREMIO_MADRE3} monchis`, COLOR.verde, 36);
    });
  },
  lanzar_ojo(s) {
    // Antes de la escena, un ojo enorme a pantalla completa (por encima de lo que haya, sin tocar los velos de 950/951).
    s.cambiando = true;
    const velo = s.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x000000, 0.88).setDepth(960);
    const ojo = s.add.container(ANCHO / 2, ALTO / 2).setDepth(961).setScale(0.4, 0);
    const g = s.add.graphics();
    g.fillStyle(0xfff6e8, 1).fillEllipse(0, 0, 440, 230).lineStyle(8, HEX.tinta, 1).strokeEllipse(0, 0, 440, 230);
    g.fillStyle(0xc9b8ff, 1).fillCircle(0, 0, 84).lineStyle(6, HEX.tinta, 1).strokeCircle(0, 0, 84);
    g.fillStyle(HEX.tinta, 1).fillCircle(0, 0, 30);
    g.fillStyle(0xffffff, 0.9).fillCircle(-22, -24, 11);
    ojo.add(g);
    sfx(s, 'zumbido-m', { volume: 0.4 });
    s.tweens.add({ targets: ojo, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.out' });
    s.tweens.add({ targets: g, x: 40, duration: 500, delay: 700, yoyo: true, ease: 'Sine.inOut' });
    s.tweens.add({ targets: ojo, scaleY: 0.05, duration: 120, delay: 1700, yoyo: true });
    s.time.delayedCall(2300, () => {
      velo.destroy(); ojo.destroy(); s.cambiando = false;
      const antifaz = typeof prendaPuesta === 'function' ? prendaPuesta('ojos') : null;
      const lineas = TXT_INT.ojo.slice();
      // Lo que lleves de Monchiman puesto se esconde también.
      if (antifaz && antifaz.id === 'antifaz') lineas.splice(4, 0, ['narrador', 'El antifaz de Monchiman vuela a un cajón.']);
      this.escena(s, lineas, { fondo: 'cuarto', mundo: 'humo', momento: true }, () => this.fin('ojo', 'hecha'));
    });
  },
  lanzar_control(s) {
    this.escena(s, TXT_INT.control.antes, { fondo: 'carretera', mundo: 'humo' }, () => {
      ESTADO.intCurso = { id: 'control', fase: 'espera', base: this.base('Control') };
      this.jugar(s, ESTADO.intCurso, 'control', 'Control');
    });
  },
  lanzar_float(s) {
    this.escena(s, TXT_INT.float.a, { fondo: 'dentro', mundo: 'humo' }, () => {
      ESTADO.intCurso = { id: 'float', fase: 'espera', base: this.base('Aires') };
      this.jugar(s, ESTADO.intCurso, 'aires', 'Aires');
    });
  },

  // ----- Zonas del cuarto, tareas y aviso de la madre -----

  // Las zonas nuevas del cuarto mientras la madre viene (sin dibujo: la marca es un texto pequeño).
  cosas(s, sala) {
    s._madreMarcas = {};
    const cur = ESTADO.intCurso;
    if (!cur || cur.fase !== 'madre' || sala !== 'cuarto') return [];
    const out = [];
    this.tareasDe(cur.id).forEach(t => {
      const z = ZONAS_MADRE[t];
      const hecho = !!cur.t[t];
      if (z) {
        out.push({ id: 'madre_' + t, tipo: 'madre', x: z.x, y: z.y, nombre: z.nombre });
        this.etiqueta(s, t, z.x, z.y - 120, z.etiqueta, hecho);
      }
      if (t === 'm') {
        this.etiqueta(s, 'm', 830, 340, 'Tapar la M', hecho);
        if (hecho) this.sabana(s);
      }
    });
    return out;
  },
  etiqueta(s, t, x, y, str, hecho) {
    const e = texto(s, x, y, hecho ? `✓ ${str}` : str, 20, hecho ? COLOR.verde : COLOR.amarillo).setDepth(800).setAlpha(hecho ? 0.65 : 1);
    if (!hecho) s.tweens.add({ targets: e, y: y - 10, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    s.objSala.push(e);
    s._madreMarcas[t] = { e, str };
  },
  sabana(s) {
    if (!s.textures.exists('obj-sabana-m')) return;
    const img = s.add.image(640, 365, 'obj-sabana-m').setOrigin(0.5, 1).setDepth(300);
    img.setScale(350 / img.width);
    s.objSala.push(img);
  },
  interactuar(s, c) {
    const cur = ESTADO.intCurso;
    if (!cur || cur.fase !== 'madre') return false;
    const t = c.id === 'm' ? 'm' : String(c.id).startsWith('madre_') ? c.id.slice(6) : null;
    if (!t || !this.tareasDe(cur.id).includes(t)) return false;
    if (cur.t[t]) { golpeTexto(s, Phaser.Math.Clamp(c.x, 220, ANCHO - 220), Math.max(160, c.y - 150), 'Eso ya está', COLOR.crema, 26); return true; }
    const z = ZONAS_MADRE[t];
    let msg = z ? z.texto : 'La M, tapada con una sábana';
    if (t === 'cena') {
      const m = Math.min(ESTADO.monchis, COSTE_CENA); // nunca bloquea: con menos monchis, cena de nevera
      ESTADO.monchis -= m;
      msg = m ? `Cena pedida: −${m} monchis` : 'Cena de nevera: tortilla de lo que haya';
      s.refrescarHud();
    }
    cur.t[t] = true;
    if (t === 'vent') cur.ventilando = true;
    if (t === 'm') this.sabana(s);
    const marca = s._madreMarcas && s._madreMarcas[t];
    if (marca && marca.e.active) { s.tweens.killTweensOf(marca.e); marca.e.setText(`✓ ${marca.str}`).setColor(COLOR.verde).setAlpha(0.65); }
    sfx(s, 'pop', { volume: 0.5 });
    golpeTexto(s, Phaser.Math.Clamp(c.x, 260, ANCHO - 260), Math.max(160, c.y - 170), msg, COLOR.amarillo, 30);
    guardarPartida();
    return true;
  },

  // El aviso de arriba: pequeño, bajo el rótulo de la sala (no tapa nada). La cuenta atrás y la lista tachándose.
  pintarPanel(s, cur) {
    const tareas = this.tareasDe(cur.id);
    let p = s._panelMadre;
    if (!p || !p.c.active) {
      const c = s.add.container(ANCHO / 2, 100).setDepth(899);
      const fondo = s.add.graphics();
      fondo.fillStyle(HEX.tinta, 0.86).fillRoundedRect(-270, 0, 540, 68, 16).lineStyle(3, HEX.rosa, 0.9).strokeRoundedRect(-270, 0, 540, 68, 16);
      const titulo = s.add.text(0, 8, '', { fontFamily: FUENTE, fontSize: '20px', color: COLOR.amarillo }).setOrigin(0.5, 0);
      const tachado = s.add.graphics();
      const etiquetas = tareas.map((t, i) => s.add.text(-250 + (i + 0.5) * (500 / tareas.length), 44, TAREAS_MADRE[t].corto, { fontFamily: FUENTE, fontSize: '15px', color: COLOR.crema }).setOrigin(0.5, 0));
      c.add([fondo, titulo, tachado, ...etiquetas]);
      if (window.TACTIL_UI) c.setScale(1.25);
      p = s._panelMadre = { c, titulo, tachado, etiquetas };
    }
    const r = Math.max(0, Math.ceil(cur.restante));
    p.titulo.setText(cur.llega !== undefined ? '¡Ding dong! Tu madre está en la puerta' : `Tu madre llega en ${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`)
      .setColor(r <= 30 && cur.llega === undefined ? COLOR.rosa : COLOR.amarillo);
    p.tachado.clear().lineStyle(3, HEX.verde, 0.95);
    p.etiquetas.forEach((e, i) => {
      const hecho = !!cur.t[tareas[i]];
      e.setColor(hecho ? '#9be7a0' : COLOR.crema).setAlpha(hecho ? 0.75 : 1);
      if (hecho) p.tachado.lineBetween(e.x - e.width / 2 - 2, e.y + e.height / 2 + 1, e.x + e.width / 2 + 2, e.y + e.height / 2 + 1);
    });
  },
  quitarPanel(s) {
    if (s._panelMadre) { if (s._panelMadre.c.active) s._panelMadre.c.destroy(); s._panelMadre = null; }
  },
};

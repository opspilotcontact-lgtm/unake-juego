// El prólogo guiado (capítulo 1): enseña el juego de uno en uno, sin agobiar.
// Una sola indicación en pantalla («Paso N de 8»), una flecha hacia dónde ir y un aro sobre lo que hay
// que tocar. Mientras dura, el resto del juego (objetivos, logros, retos, sucesos, móvil, problemas de
// los personajes) espera: se van abriendo después, cuando ya sabes moverte por el barrio.

const PASOS_GUIA = [
  {
    texto: () => (window.TACTIL_UI ? 'Muévete con el joystick (o tocando el suelo).' : 'Muévete con las flechas o WASD (o haciendo clic en el suelo).'),
    hecho: s => (s.recorridoGuia || 0) > 260,
  },
  {
    texto: () => 'Gana tus primeros monchis (el dinero del barrio): en la tienda de 24 h, coge un ENCARGO y llévalo a tiempo.',
    sala: 'tienda', cosa: 'encargos', hecho: () => stat('entregas') >= 1,
    escena: 'rider', // el bucle de rider del piloto: «Otra vez tú» · «Todavía no»
  },
  {
    texto: () => 'Compra papel y un mechero en el mostrador de la tienda.',
    sala: 'tienda', cosa: 'mostrador', hecho: () => ESTADO.inv.papel > 0 && ESTADO.inv.mechero,
    escena: 'tienda', // Palicaso en la cola y la mano apuntada
  },
  {
    texto: () => 'Busca la boquilla: brilla en algún sitio del barrio. Pasa por encima para cogerla.',
    sala: () => ESTADO.boquillaEn && ESTADO.boquillaEn.sala, hecho: () => ESTADO.inv.boquilla > 0,
  },
  {
    // La plaza del piloto: Cotine es la primera que le mira, y su calada es el primer cruce de mundo.
    texto: () => 'Último pedido del día: llévalo al banco de la plaza. Te espera alguien con hambre.',
    sala: 'plaza', hecho: () => ESTADO.pilotoPlaza || ESTADO.dentro || stat('fumadas') >= 1,
    alLlegar: s => Guia.plaza(s),
  },
  {
    texto: () => 'Ve a la puerta de Unaké. Esta noche, llega hasta el final de la contraseña.',
    sala: 'fuera', cosa: 'perico', hecho: () => ESTADO.dentro,
  },
  {
    texto: () => 'Ya estás dentro. Pídele la bolsita a Palicaso, en la barra.',
    sala: 'dentro', cosa: 'palicaso', hecho: () => ESTADO.inv.bolsita > 0,
  },
  {
    texto: () => 'Lo tienes todo. Siéntate en el sofá: lía y fuma. Así se vuelve al humo cada noche.',
    sala: 'dentro', cosa: 'sofa', hecho: () => stat('fumadas') >= 1,
  },
];

function guiaActiva() { return enCap('una-que') && !ESTADO.guiaHecha; }

// Consejos que salen una sola vez, justo cuando hacen falta (después del prólogo).
const CONSEJOS = [
  { id: 'hambre', cuando: () => ESTADO.hambre > 60, titulo: 'Tienes hambre', texto: 'Come en la tienda de 24 h. Con mucha hambre pierdes vida, y sin vida te da un amarillo.' },
  { id: 'pasado', cuando: s => s.mundo === 'normal' && stat('fumadas') >= 1, titulo: 'Se te ha pasado', texto: 'Has vuelto al mundo normal (de día). Para volver al humo, lía y fuma otra vez en el sofá.' },
  { id: 'objetivos', cuando: () => desdeCapId('cuota'), titulo: 'Tus objetivos', texto: 'Arriba a la derecha, los del capítulo. Puedes plegarlos con el botón (o la tecla O).' },
  { id: 'misiones', cuando: s => s.mundo === 'humo' && desdeCapId('cuota'), titulo: 'Las misiones', texto: 'Los «!» sobre la gente son minijuegos: estrellas, monchis y niveles. De noche pagan más.' },
  { id: 'vida', cuando: () => ESTADO.vida < 50, titulo: 'Ojo con la vida', texto: 'El resucitador de la tienda te da vida de golpe. Comer también ayuda.' },
];

// Las escenas del día del piloto (guion-v3, 10 y 11), en cómic, entre misión y misión. Sin vídeo.
const ESCENAS_PILOTO = {
  // El bucle de rider: el mismo plano y el mismo «NUEVO PEDIDO». El que repite delante de una puerta es Vuper.
  rider: {
    opciones: { fondo: 'fuera', mundo: 'normal' },
    lineas: [
      ['narrador', 'Llamas. Sale una mano, coge la bolsa y la puerta se cierra en «Su ped…». NUEVO PEDIDO.'],
      ['narrador', 'Otra. Más rápido: «Su…». NUEVO PEDIDO. La tercera puerta se abre del todo.'],
      ['blancaso', 'Otra vez tú.'],
      ['vuper', '¿Nos conocemos?'],
      ['blancaso', 'Todavía no.'],
      ['narrador', 'Hace un palote en una libreta y cierra. En la farola de enfrente, un periquito con tupé no te quita ojo.'],
      ['perico', 'Repartidor. Repartidor.'],
    ],
  },
  // La cola de la tienda: la mano apuntada y el mostrador rayado con su letra.
  tienda: {
    opciones: { fondo: 'tienda', mundo: 'normal' },
    lineas: [
      ['palicaso', '…y el pájaro te dice «contraseña», y tú «Unaké», y él «¿una qué?», y tú «una aso», y él «¿de quién?», y tú «de»…'],
      ['narrador', 'Coges el boli atado al mostrador y te lo apuntas en la mano: UNAKÉ · UNA ASO · DE.'],
      ['narrador', 'La madera del mostrador está rayada con esa misma frase. Muchas veces. Con tu letra.'],
      ['palicaso', '¡Escucha, escucha! ¡Que esta no te la he contado!'],
      ['vuper', 'Perdona… ¿de quién?'],
      ['palicaso', '¡Hostia, Crujis!'],
      ['narrador', 'Estira el brazo a través de ti, coge una bolsa de la estantería y se va hablando solo. El dependiente, sin mirarte: «Siguiente».'],
    ],
  },
};

// «Esto ya lo has vivido»: la primera vez que hablas con cada uno dentro de Unaké, su recuerdo del piloto
// (Vuper ha estado aquí cientos de noches). Corto, con la mano del jugador, su momento persona y el último
// chiste. Solo en el acto I: más tarde ya no sería un recuerdo, sería una interrupción.
// El momento persona y el remate de cada uno son PROPUESTA para el juego.
const RECUERDOS_PILOTO = {
  palicaso: () => {
    const V = Vinetas;
    return [
      V.corte('seco', v => PLANOS_PILOTO.palicaso(v)),
      V.cartucho('Esto ya lo has vivido…', { ms: 1600 }),
      V.dice('palicaso', '¡Escucha, escucha! ¡Esta no te la he contado!'),
      V.dice('vuper', 'Me la has contado. Muchas noches.'),
      V.dice('palicaso', '¡Pues esta no! ¿Y qué es Unaké?', { pose: 'palicaso-contando' }),
      V.elige([{ texto: '«¿Una qué?»' }, { texto: '«Una aso. Ya lo sé.»' }]),
      V.si(v => v.eleccion === 0, [V.dice('palicaso', '¡UNA ASO! ¡Lo pilla!')], [V.dice('palicaso', '¡Lo pilla! ¡Lo pilla antes que yo!')]),
      V.dice('palicaso', '¿Y de quién es la aso? ¡De quién va a ser! De los…'),
      V.dice('palicaso', '¡Que esto me recuerda a una vez que Lasslow…!', { pose: 'palicaso-riendo' }),
      V.dice('palicaso', '…Oye. Tú siempre te quedas hasta el final. Nadie se queda hasta el final.', { pose: 'palicaso-callado' }),
      V.dice('vuper', 'Es que nunca llegas al final.'),
      V.dice('palicaso', '¡Uy! ¡Eso me recuerda a una vez que…!', { pose: 'palicaso-contando' }),
    ];
  },
  lasslow: () => {
    const V = Vinetas;
    let ultima = null;
    return [
      V.corte('seco', v => PLANOS_PILOTO.lasslow(v)),
      V.cartucho('Esto ya lo has vivido…', { ms: 1600 }),
      V.dice('lasslow', 'Caballero. Lasslow, para servirle.'),
      V.dice('vuper', 'Ya nos conocemos. La contraseña. Sin reírse.'),
      V.dice('lasslow', 'Un asunto serio. Usted no se ríe, y yo tampoco.'),
      V.manten({
        pista: 'Aguantad la cara seria, los dos', ms: 2000,
        alCargar: (v, k) => { const p = k > 0.66 ? 'lasslow-aguanta2' : k > 0.33 ? 'lasslow-aguanta1' : 'lasslow-aguantando'; if (p !== ultima) { ultima = p; v.pose('lasslow', p); } },
      }),
      V.dice('lasslow', 'De los… her…', { pose: 'lasslow-aguanta2', ms: 1300 }),
      V.hacer(v => { v.quitarGlobo(); v.pose('lasslow', 'lasslow-risa-floja'); sfx(v.s, 'risa-lasslow', { volume: 0.6 }); v.letrero('¡JAJAJA!', 860, 300); }),
      V.espera(800),
      V.dice('lasslow', '¡Que se me ha escapao!', { sonido: 'se-me-ha-escapao' }),
      V.dice('lasslow', '…Perdone. Cuando algo me importa, me da la risa.', { pose: 'lasslow-serio' }),
      V.dice('vuper', '¿Y esto te importa?'),
      V.dice('lasslow', 'Usted me importa, caballero.'),
      V.hacer(v => {
        v.quitarGlobo();
        v.pose('lasslow', 'lasslow-pedo');
        sfx(v.s, 'pedo-silencioso', { volume: 0.7 });
        if (v.s.textures.exists('fx-nube-pedo')) { const n = v.poner(v.s.add.image(760, 560, 'fx-nube-pedo').setScale(0.5).setAlpha(0.9)); v.s.tweens.add({ targets: n, x: 600, scale: 0.8, alpha: 0, duration: 1600 }); }
        v.letrero('prrrt', 760, 470, COLOR.verde, 40);
      }),
      V.espera(700),
      V.dice('lasslow', '…Eso no ha sido la risa.', { pose: 'lasslow-horror' }),
    ];
  },
  cotine: () => {
    const V = Vinetas;
    return [
      V.corte('seco', v => PLANOS_PILOTO.cotine(v)),
      V.cartucho('Esto ya lo has vivido…', { ms: 1600 }),
      V.dice('cotine', 'La tarta de la contraseña. Para el nuevo. Así no se le olvida.'),
      V.dice('vuper', 'No soy nuevo. Pero esta vez la leo entera.'),
      V.machaca({ texto: '¡LEE!', pista: 'Pulsa rápido: léela antes de que se la coma', n: 16, ms: 3000, imposible: true, mal: '«De… los…»', alPulsar: (v, n) => PLANOS_PILOTO.comer(v, n) }),
      V.hacer(v => { if (v.tarta) { v.tarta.palabras.forEach(t => t.setVisible(false)); v.tarta.vela.forEach(o => o.setVisible(false)); } }),
      V.dice('cotine', '¿Qué? Tenía hambre.'),
      V.dice('cotine', 'Eres el único que se para a leerla, ¿sabes?'),
      V.dice('vuper', 'Y tú la única que me hace tarta.'),
      V.hacer(v => { v.quitarGlobo(); v.letrero('O', 560, 560, COLOR.crema, 44); }),
      V.dice('vuper', '…Una miga con forma de «O». Con esto no entro.'),
      V.dice('cotine', '¿Te la vas a comer?'),
    ];
  },
  pompa: () => {
    const V = Vinetas;
    return [
      V.corte('seco', v => PLANOS_PILOTO.pompa(v)),
      V.cartucho('Esto ya lo has vivido…', { ms: 1600 }),
      V.dice('vuper', '¿De quién es la aso?', { tam: 24 }),
      V.quieto({ pista: 'Aquí arriba se está bien. Espera su respuesta.', ms: 3200, bien: 'Qué paz.', mal: 'La has movido.' }),
      V.dice('pompa', '…Una aso.', { ms: 1800 }),
      V.dice('vuper', 'Eso me lo preguntaron hace cinco preguntas.'),
      V.si(v => v.resultado, [V.dice('pompa', '…Tú esperas. Nadie espera a que conteste.', { ms: 2800 })], [V.dice('pompa', '…Casi esperas.', { ms: 2000 })]),
      V.dice('vuper', '¿Y cuándo llegas a la mía?'),
      V.hacer(v => { v.quitarGlobo(); v.pose('pompa', 'pompa-punto'); }),
      V.espera(1300),
      V.dice('off', '¡Pompa! ¡Ronda!', { x: 640, y: 640, ms: 1300 }),
      V.dice('pompa', 'Yo no, que exploto.', { pose: 'pompa-mira', ms: 1600 }),
      V.hacer(v => { v.quitarGlobo(); v.pose('pompa', 'pompa-hinchada'); sfx(v.s, 'hinchar', { volume: 0.5 }); }),
      V.espera(600),
      V.hacer(v => { v.pose('pompa', 'pompa-plop'); sfx(v.s, 'plop', { volume: 0.7 }); v.letrero('¡PLOP!', 900, 300, COLOR.azul); if (v.burbuja) v.burbuja.setVisible(false); }),
      V.espera(900),
    ];
  },
};

const Guia = {
  // ¿Ya se vio esta escena del piloto? (cuenta también lo visto en vídeo en partidas de antes del 17/11).
  visto(id) { return !!((ESTADO.pilotoVisto && ESTADO.pilotoVisto[id]) || (ESTADO.cineVisto && ESTADO.cineVisto[id])); },
  marcar(id) { ESTADO.pilotoVisto = ESTADO.pilotoVisto || {}; ESTADO.pilotoVisto[id] = true; guardarPartida(); },

  // Una escena del día del piloto (rider, tienda), en cómic, una sola vez.
  escena(s, id) {
    const e = ESCENAS_PILOTO[id];
    if (!e || Guia.visto(id)) return;
    Guia.marcar(id);
    s.abrirEscena(e.lineas, null, e.opciones);
  },

  // «Esto ya lo has vivido». Devuelve true si lo ha puesto (y llama a `despues` al acabar).
  recuerdo(s, c, despues) {
    const id = c && c.id;
    if (!RECUERDOS_PILOTO[id] || Guia.visto(id) || !ESTADO.dentro || s.mundo !== 'humo' || s.modal || s.reparto) return false;
    if ((ESTADO.capitulo || 0) > 3) return false; // solo en el acto I
    Guia.marcar(id);
    Vinetas.ver(s, RECUERDOS_PILOTO[id](), despues, { barrio: true, musica: 'momento' });
    return true;
  },

  // La plaza (guion-v3, 12): Cotine se come el pedido, te mira y te pasa el suyo. La primera calada es tuya
  // (mantener pulsado) y con ella cruzas al mundo humo. Después, el barrio ya es de noche.
  plaza(s) {
    const cruzar = () => {
      ESTADO.pilotoPlaza = true;
      ESTADO.colocon = 100;
      guardarPartida();
      s._guiaLlegada = false;
      if (s.mundo !== 'humo') { s.cargarSala(s.sala); golpeTexto(s, ANCHO / 2, 300, 'Hace efecto…', COLOR.crema, 52); }
    };
    const V = Vinetas;
    let ultima = null;
    Vinetas.ver(s, [
      V.corte('seco', v => {
        v.fondo((SALAS.plaza && SALAS.plaza.fondoN) || 'bgn-plaza');
        Vinetas.mundo(v, false);
        v.actor('vuper', 'vuper-normal', 380, 712, 400);
        v.actor('cotine', 'n-cotine', 900, 712, 400);
      }),
      V.hacer(v => { sfx(s, 'nam', { volume: 0.6 }); v.letrero('¡ÑAM!', 900, 260, COLOR.rosa); }),
      V.espera(700),
      V.dice('cotine', '¿Qué? Tenía hambre.', { pose: 'n-cotine-hablando' }),
      V.cartucho('Te mira. Es la primera persona del día que te mira a la cara.'),
      V.dice('cotine', '¿Te sientas?', { pose: 'n-cotine' }),
      V.elige([{ texto: 'Sentarte' }, { texto: '«Vale, vale…»' }]),
      V.dice('cotine', 'Toma.', { pose: 'n-cotine-fumando-suelta', ms: 1200 }),
      V.manten({
        pista: 'Dale una calada', ms: 1800,
        alCargar: (v, k) => { const p = k > 0.5 ? 'vn-fumando-aguanta' : 'vn-fumando-calada'; if (p !== ultima) { ultima = p; v.pose('vuper', p); if (p === 'vn-fumando-calada') sfx(s, 'calada', { volume: 0.6 }); } },
      }),
      V.hacer(v => { v.pose('vuper', 'vn-fumando-suelta'); v.quitarGlobo(); }),
      V.espera(700),
      // El cruce de mundo: la plaza de día pasa a ser la plaza de noche del mundo humo.
      V.corte('humo', v => {
        v.fondo((SALAS.plaza && SALAS.plaza.fondo) || 'bg-plaza');
        Vinetas.mundo(v, true);
        v.actor('vuper', 'vuper-colocado', 380, 700, 240, { flota: true });
        v.actor('cotine', 'cotine', 900, 700, 320);
      }),
      V.dice('cotine', '¿Vienes a Unaké?'),
      V.dice('vuper', '¿A una qué?'),
      V.dice('cotine', 'A una aso.'),
      V.dice('vuper', '¡¿De quién?!'),
      V.dice('cotine', 'Ay, eso es lo del pájaro. Tú ni caso, que la puerta está…'),
      V.hacer(v => { v.pose('cotine', 'cotine-plop'); sfx(s, 'hinchar', { volume: 0.5 }); v.mover('cotine', { y: 330 }, 1800, 'Sine.in'); }),
      V.dice('cotine', '¡Ay, que me voy! ¡Que está abieeer…!', { y: 110, ms: 1600 }),
      V.hacer(v => v.mover('cotine', { y: -200 }, 900, 'Quad.in')),
      V.dice('vuper', '¿Que está qué?'),
      V.hacer(v => {
        v.quitarGlobo();
        const p = s.textures.exists('perico-volando') ? v.poner(s.add.image(1380, 150, 'perico-volando').setScale(0.22)) : null;
        if (p) s.tweens.add({ targets: p, x: 980, y: 120, duration: 1600 });
      }),
      V.dice('off', 'Contraseña. Contraseña.', { x: 980, y: 210, tam: 20, ms: 1600 }),
      V.hacer(v => { Vinetas.mano(v, 'UNAKÉ ·\nUNA ASO ·\nDE ~~~', { x: 170, y: 190, pie: 'Con el humo, se ha corrido' }); }),
      V.espera(1500),
    ], cruzar, { barrio: true, musica: 'momento' });
  },

  // La puerta del capítulo 1 (escenas/puerta.js).
  puerta(s) { irA(s, 'Puerta'); },

  montar(s) {
    const c = s.add.container(ANCHO / 2, 128).setDepth(905).setVisible(false);
    const g = s.add.graphics();
    c.add(g);
    const paso = s.add.text(-360, -30, '', { fontFamily: FUENTE, fontSize: '17px', color: COLOR.amarillo });
    const t = s.add.text(-360, -6, '', { fontFamily: FUENTE, fontSize: '20px', color: COLOR.crema, wordWrap: { width: 720 } });
    const ruta = s.add.text(-360, 0, '', { fontFamily: FUENTE, fontSize: '18px', color: COLOR.verde });
    c.add([paso, t, ruta]);
    s.guia = { c, g, paso, t, ruta, indice: -1 };
    s.aroGuia = s.add.graphics().setDepth(870);
  },

  actualizar(s) {
    if (!s.guia) return;
    // Consejos sueltos (fuera del prólogo).
    if (!guiaActiva() && !s.modal && !s.cambiando) {
      ESTADO.consejos = ESTADO.consejos || {};
      const c = CONSEJOS.find(k => !ESTADO.consejos[k.id] && k.cuando(s));
      if (c && s.time.now > (s.proximoConsejo || 0)) {
        ESTADO.consejos[c.id] = true;
        s.proximoConsejo = s.time.now + 15000;
        guardarPartida();
        s.toast(c.titulo, c.texto);
      }
    }
    const activa = guiaActiva() && !s.modal;
    s.guia.c.setVisible(activa);
    s.aroGuia.clear();
    if (!activa) return;
    const i = PASOS_GUIA.findIndex(p => !p.hecho(s));
    if (i < 0) return;
    const p = PASOS_GUIA[i];
    if (i !== s.guia.indice) {
      if (s.guia.indice >= 0) {
        sfx(s, 'campanita', { volume: 0.5 }); golpeTexto(s, ANCHO / 2, 260, '¡Bien!', COLOR.verde, 44);
        // Entre misión y misión, su escena del piloto en cómic (una sola vez).
        const hecho = PASOS_GUIA[s.guia.indice];
        if (hecho && hecho.escena && i > s.guia.indice && !Guia.visto(hecho.escena)) {
          s.time.delayedCall(900, () => s.cuandoLibre(() => Guia.escena(s, hecho.escena)));
        }
      }
      s.guia.indice = i;
      s.guia.c.setScale(0.9);
      s.tweens.add({ targets: s.guia.c, scale: 1, duration: 220, ease: 'Back.out' });
    }
    const sala = typeof p.sala === 'function' ? p.sala() : p.sala;
    if (p.alLlegar && sala === s.sala && !s.cambiando && !s._guiaLlegada) { s._guiaLlegada = true; s.time.delayedCall(700, () => s.cuandoLibre(() => p.alLlegar(s))); }
    const ruta = sala ? s.ruta(sala) : '';
    s.guia.paso.setText(`Paso ${i + 1} de ${PASOS_GUIA.length}`);
    s.guia.t.setText(p.texto());
    s.guia.ruta.setText(ruta && ruta !== '¡Es aquí!' ? `→ ${ruta}` : '').setY(-6 + s.guia.t.height + 4);
    const alto = 40 + s.guia.t.height + (s.guia.ruta.text ? 28 : 0);
    s.guia.g.clear().fillStyle(HEX.tinta, 0.88).fillRoundedRect(-380, -40, 760, alto, 18).lineStyle(4, HEX.amarillo, 1).strokeRoundedRect(-380, -40, 760, alto, 18);
    // Aro sobre lo que hay que tocar (si está en esta sala) o flecha hacia la salida.
    const pulso = 0.6 + 0.4 * Math.sin(s.time.now / 160);
    const objetivo = p.cosa && sala === s.sala ? s.cosas.find(c => c.id === p.cosa) : null;
    if (objetivo) {
      const r = Math.max(60, (objetivo.alto || 80) * 0.6);
      s.aroGuia.lineStyle(7, HEX.amarillo, pulso).strokeCircle(objetivo.x, objetivo.y - (objetivo.alto || 80) / 2, r);
    } else if (sala === s.sala && sala && ESTADO.boquillaEn && p.sala && typeof p.sala === 'function') {
      // La boquilla: aro donde brilla.
      s.aroGuia.lineStyle(7, HEX.amarillo, pulso).strokeCircle(ESTADO.boquillaEn.x, ESTADO.boquillaEn.y - 20, 50);
    } else if (ruta.startsWith('Ve a: «') || ruta.endsWith('»')) {
      // Flecha dibujada en el borde hacia el que hay que salir (la letra no tiene flechas).
      const izq = ruta.startsWith('Ve a: «');
      const x = izq ? 46 + pulso * 14 : ANCHO - 46 - pulso * 14;
      const d = izq ? -1 : 1;
      s.aroGuia.fillStyle(HEX.amarillo, 1).lineStyle(6, HEX.tinta, 1);
      s.aroGuia.fillTriangle(x + d * 30, 560, x - d * 20, 520, x - d * 20, 600).strokeTriangle(x + d * 30, 560, x - d * 20, 520, x - d * 20, 600);
    } else if (ruta.includes('Puerta de Unaké')) {
      const perico = s.cosas.find(c => c.id === 'perico');
      if (perico) s.aroGuia.lineStyle(7, HEX.amarillo, pulso).strokeCircle(perico.x, perico.y - perico.alto / 2, 70);
    }
  },
};

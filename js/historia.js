// La historia: «La noche más larga de Unaké» (arco aprobado para el juego el 29/10/2026, ver
// 07_juego/arco-propuesta.md). Tres actos y ocho capítulos con objetivos que se comprueban solos.
// El hilo: el casero sube el alquiler y, si la aso no junta 1.000 monchis en la hucha, cierra Unaké.
// Cada capítulo empieza con una escena en cómic y se cierra con su momento persona (a alguien se le
// limpian los ojos) y el último chiste para el estado. Al acabar, modo libre.
// PROPUESTA de guion para el juego: nada de esto es canon de la serie.

const META_HUCHA = 1000;

function stat(k) { return (ESTADO.stats && ESTADO.stats[k]) || 0; }
function sumarStat(k, n = 1) {
  ESTADO.stats = ESTADO.stats || {};
  ESTADO.stats[k] = stat(k) + n;
  guardarPartida();
}
// Lo que se ha hecho desde que empezó el capítulo en curso (la foto se toma al acabar su escena).
function desdeCap(k) { return stat(k) - ((ESTADO.baseCap && ESTADO.baseCap[k]) || 0); }
function estrellasDeMision(k) { return ESTADO.estrellas[k] || 0; }

const CAPITULOS = [
  // ---------- Acto I · La aso ----------
  {
    titulo: '¿Una qué?',
    arte: 'cap-cap1',
    intro: [
      ['narrador', 'Anoche probaste el mundo humo. Hoy es de día y todo es normal. Demasiado normal.'],
      ['vuper', 'Quiero volver. Dicen que en Unaké, la aso del barrio, saben cómo. Solo entra quien se sabe la contraseña.'],
      // El bucle de la contraseña, tal cual el E00 (guion-v1-canon.md).
      ['perico', '¿Contraseña? ¿Contraseña?'],
      ['vuper', 'Unaké.'],
      ['perico', '¿Una qué?'],
      ['vuper', 'Una aso.'],
      ['perico', '¿De quién?'],
      ['vuper', 'De los hermanos Aso, Palicaso y Blancaso, que tienen Unaké.'],
      ['perico', '¿Una qué?'],
      ['narrador', 'Vuper abre la boca… y la cierra. Está en un bucle.'],
      ['narrador', 'Para liarte hace falta papel, boquilla, la bolsita de la aso y mechero. Y para todo eso, monchis.'],
    ],
    objetivos: [
      { texto: 'Gana monchis: haz un encargo de la tienda de 24 h', hecho: () => stat('entregas') >= 1 },
      { texto: 'Entra en Unaké: Perico pide la contraseña', hecho: () => ESTADO.dentro },
      { texto: 'Lía y fuma en el sofá: vuelve al mundo humo', hecho: () => stat('fumadas') >= 1 },
    ],
    // Momento persona de Perico (y siembra del cap. 6).
    cierre: [
      ['perico', 'Pasa, pasa. Pero que conste que te he visto, rider.'],
      ['vuper', '¿Visto el qué?'],
      ['perico', 'Pin pin.'],
    ],
    premio: 30,
  },
  {
    titulo: 'La cuota de la aso',
    arte: 'cap-cap2',
    intro: [
      ['palicaso', '¡Escucha, escucha! Ya eres de la aso, rider. Aquí cada uno tiene su puesto.'],
      ['blancaso', 'No hay nada que celebrar. Ha llegado carta del casero: nos sube el alquiler.'],
      ['blancaso', 'O juntamos 1.000 monchis en la hucha, o cierra Unaké. Yo llevo las cuentas: lo que aportes, me lo das a mí, en la plaza.'],
      ['palicaso', '¿Una qué?'],
      ['blancaso', 'Otra vez no…'],
      // Siembra del cap. 5: nadie le escucha.
      ['palicaso', '¡Escucha! Tengo un plan para salvar el bar: una máquina tragaperras. La pongo en la tienda y…'],
      ['blancaso', 'No.'],
      ['palicaso', '…si ni me has escuchado.'],
      ['palicaso', 'Bueno. Pues otra cosa: si mejoramos el local, viene más gente y la caja se llena sola. Mira el negocio, en la barra.'],
    ],
    situaciones: [['palicaso', 'genero']],
    objetivos: [
      { texto: 'Palicaso: se acaba el género (búscale y sirve la barra)', hecho: () => stat('sit_genero') >= 1 },
      { texto: 'De noche, ayuda a Cotine con la tarta (1 estrella)', hecho: () => estrellasDeMision('Tarta') >= 1 },
      { texto: 'Invierte en el negocio: compra una mejora (en la barra)', hecho: () => cuentasNegocio().total >= 1 },
      { texto: 'Aporta 100 monchis a la hucha (Blancaso, en la plaza)', hecho: () => ESTADO.hucha >= 100 },
    ],
    // Momento persona de Blancaso: su deseo.
    cierre: [
      ['blancaso', 'Algún día me sentaré ahí, en mi sofá, a disfrutar de mi propio bar. Solo eso.'],
      ['palicaso', '¡Escucha! Hoy mismo, si quieres. Y mientras te cuento una cosa…'],
      ['blancaso', 'Otra vez no…'],
    ],
    premio: 40,
  },

  // ---------- Acto II · Todo se tuerce ----------
  {
    titulo: 'El blancazo',
    arte: 'cap-cap3',
    intro: [
      ['blancaso', 'Hoy me lo merezco. Esta noche me siento en mi sofá y disfruto de mi bar.'],
      ['lasslow', 'Caballero, eso hay que celebrarlo. JA… perdón.'],
      ['narrador', 'Nadie olvida la noche que estuvo de Blancaso.'],
    ],
    objetivos: [
      { texto: 'En el sofá, pásale el porro a Blancaso (P)', hecho: () => stat('blancasoFumo') >= 1 },
      { texto: 'Salva a Blancaso de Puky', hecho: () => stat('blancazos') >= 1 },
    ],
    // Momento persona de Puky: lo único que quiere.
    cierre: [
      ['puky', 'Yo solo quería que me invitarais…'],
      ['blancaso', '¿A ti? …Bueno. Algún día.'],
      ['puky', '¿Me llamabais? ¿Ya? ¿Ahora?'],
      ['blancaso', 'Otra vez no…'],
    ],
    premio: 60,
  },
  {
    titulo: 'Un señor ante el casero',
    arte: 'cap-cap4',
    intro: [
      ['blancaso', 'Gracias… otra vez. Pero el casero viene a cenar para inspeccionar, y se me han volado sus facturas.'],
      ['casero', 'Buenas. Soy el casero. El jueves ceno aquí y veo el local. Y las cuentas.'],
      ['lasslow', 'Para una cena con el casero hace falta un señor. Y el señor soy yo. Si encuentro mi pajarita.'],
      ['perico', 'Pin pin. He oído que en tu cuarto inventas cosas, rider. Cosas de héroe.'],
      ['palicaso', '¡Escucha! Si la hucha no llega, en la tienda he puesto una tragaperras, y en la plaza se apuesta a las carreras. Paga. A veces.'],
    ],
    situaciones: [['lasslow', 'pajarita'], ['blancaso', 'facturas']],
    objetivos: [
      { texto: 'Lasslow: encuentra su pajarita y aguanta la cena', hecho: () => stat('sit_pajarita') >= 1 },
      { texto: 'Blancaso: las facturas del casero', hecho: () => stat('sit_facturas') >= 1 },
      { texto: 'Compra un invento en el taller de tu cuarto', hecho: () => Object.keys(ESTADO.inventos).length >= 1 },
      { texto: 'Sube Unaké a «Bareto» (nivel 5 del negocio)', hecho: () => cuentasNegocio().total >= 5, progreso: () => `${cuentasNegocio().total}/5` },
      { texto: 'Hucha de la aso: 400 monchis', hecho: () => ESTADO.hucha >= 400, progreso: () => `${ESTADO.hucha}/400` },
    ],
    // Momento persona de Lasslow (un señor de verdad)… y el estado se queda el último chiste.
    cierre: [
      ['casero', 'La cena, correcta. El caballero, muy caballero. Ese olor, no tanto.'],
      ['lasslow', 'Ha sido el periquito.'],
      ['casero', 'Volveré. De noche. A ver qué es esto de una aso de verdad.'],
    ],
    premio: 80,
  },
  {
    titulo: 'La caja',
    intro: [
      ['blancaso', 'La hucha no cuadra. Faltan monchis. Muchos.'],
      ['lasslow', 'Caballeros, yo solo he cogido un caramelo. Y una servilleta.'],
      ['blancaso', 'La tragaperras de la tienda queda precintada hasta que sepa qué ha pasado.'],
      ['palicaso', '¡Escucha, escucha! Seguro que hay una explicación. Una muy larga.'],
      ['narrador', 'Perico se entera de todo lo que pasa en el barrio. Alguien tendría que preguntarle.'],
    ],
    // Desaparece parte de la hucha: Palicaso se la ha jugado en su máquina.
    alEmpezar: () => {
      const falta = Math.min(150, ESTADO.hucha || 0);
      ESTADO.hucha -= falta;
      ESTADO.faltaCaja = falta;
      ESTADO.precinto = true;
    },
    objetivos: [
      { texto: 'Cuadra la caja con Blancaso (gana «La caja no cuadra»)', hecho: () => desdeCap('gana_Cuentas') >= 1 },
      { texto: 'Pregúntale a Perico quién va a la tienda a las cuatro', hecho: () => stat('pistaCaja') >= 1 },
      { texto: 'Pilla a Palicaso: gánale a El farol (en la barra)', hecho: () => stat('gana_Farol') >= 1 },
    ],
    // Momento persona de Palicaso: por una vez, le escuchan.
    cierre: [
      ['palicaso', '…'],
      ['narrador', 'Por primera vez en su vida, Palicaso no dice nada.'],
      ['palicaso', 'Lo de la máquina era para salvar el bar. Lo dije. Nadie me escuchó.'],
      ['vuper', 'Yo te escucho.'],
      ['palicaso', '¿Sí? …Pues escucha, escucha, que esto tiene historia…'],
      ['blancaso', 'Otra vez no…'],
    ],
    premio: 90,
  },
  {
    titulo: 'Perico lo sabe',
    intro: [
      ['perico', '¡VUPER ES MONCHIMAN! ¡VUPER ES MONCHIMAN!'],
      ['lasslow', 'JA… JAJAJA. Perdón. JAJAJA.'],
      ['palicaso', '¡Escucha! ¿Quieres pipas, periquito?'],
      ['perico', 'Pin pin.'],
      ['blancaso', 'El casero vuelve esta semana. Si oye esto, nos cierra por locos.'],
      ['vuper', 'Vale, vale… Habrá que callarle. Y hablar con él.'],
    ],
    situaciones: [['perico', 'apuesta']],
    objetivos: [
      { texto: 'Calla a Perico: gánale a ¡Periquito! (en la puerta, de noche)', hecho: () => stat('gana_Periquito') >= 1 },
      { texto: 'Gánale la apuesta de pipas a Perico', hecho: () => stat('sit_apuesta') >= 1 },
      { texto: 'De día, habla con Perico a solas', hecho: () => stat('secretoPerico') >= 1 },
      { texto: 'Hucha de la aso: 550 monchis', hecho: () => ESTADO.hucha >= 550, progreso: () => `${ESTADO.hucha}/550` },
    ],
    cierre: [
      ['perico', 'Oye, rider. ¿Pipa?'],
      ['vuper', 'Vale.'],
      ['perico', 'Era la última. Ahora me debes una. Pin pin.'],
    ],
    premio: 100,
  },

  // ---------- Acto III · La noche más larga ----------
  {
    titulo: 'La inspección',
    intro: [
      ['narrador', 'La noche de la inspección, a medio barrio le da un amarillo. La M de tu cuarto parpadea.'],
      ['casero', 'Buenas noches. Vengo a ver esta aso. Por dentro. Y a fondo.'],
      ['pompa', '…Y yo pincho esta noche. Si alguien encuentra mis discos.'],
      ['vuper', 'Vale, vale… Nadie sabe que soy yo. Que siga así.'],
    ],
    situaciones: [['pompa', 'pinchar']],
    objetivos: [
      { texto: 'Pasa la inspección del casero (está en Unaké)', hecho: () => stat('gana_Inspeccion') >= 1 },
      { texto: 'La Pompa pincha la noche de la inspección', hecho: () => stat('sit_pinchar') >= 1 },
      { texto: 'Al casero le ha dado un amarillo: rescate de Monchiman', hecho: () => desdeCap('gana_Rescate') >= 1 },
      { texto: 'Unaké tiene que aguantar una inspección: «Bareto» (nivel 5)', hecho: () => cuentasNegocio().total >= 5, progreso: () => `${cuentasNegocio().total}/5` },
      { texto: 'Hucha de la aso: 750 monchis', hecho: () => ESTADO.hucha >= 750, progreso: () => `${ESTADO.hucha}/750` },
    ],
    cierre: [
      ['casero', '¿Qué… qué ha pasado? Estaba en el sofá, todo daba vueltas, y luego… patatas.'],
      ['blancaso', 'Ha venido Monchiman. Viene cuando hace falta.'],
      ['casero', 'Pues este sitio cuida de la gente. El alquiler, lo que tengáis en la hucha. Y no se lo contéis a nadie.'],
      ['palicaso', '¡Escucha, escucha! ¿Eso es un sí?'],
      ['casero', 'Es un «no me hagáis volver».'],
    ],
    premio: 120,
  },
  {
    titulo: 'La noche épica',
    intro: [
      ['blancaso', 'Faltan los últimos. Si llegamos a mil, esta noche… me siento.'],
      ['cotine', 'Y yo hago una tarta. Entera. Para ti. Te lo juro.'],
      ['perico', 'Pin pin. Me apuesto mis pipas a que se la come.'],
      ['palicaso', '¡Escucha! Si se salva el bar, fiesta. Y si no, también. Pero menos.'],
    ],
    objetivos: [
      { texto: 'Cotine sirve una tarta entera (Tarta, 2 estrellas)', hecho: () => estrellasDeMision('Tarta') >= 2 },
      { texto: `Completa la hucha: ${META_HUCHA} monchis`, hecho: () => ESTADO.hucha >= META_HUCHA, progreso: () => `${ESTADO.hucha}/${META_HUCHA}` },
    ],
    // El final: la noche que estuvo de Blancaso, esta vez por buena. Momento persona de Vuper.
    cierre: [
      ['blancaso', 'Mil. Unaké se queda.'],
      ['cotine', 'Tu tarta. Entera. No le falta nada. …Casi nada.'],
      ['palicaso', '¡Escucha, escucha! ¡Un brindis! ¡Por Monchiman, que le salvó la vida al casero!'],
      ['lasslow', '¡Por Monchiman! JAJAJA.'],
      ['blancaso', 'Y por Vuper. Que siempre está, aunque nadie le vea.'],
      ['narrador', 'Nadie olvida la noche que estuvo de Blancaso. Esta vez, por buena.'],
      ['lasslow', '¡Que se me ha escapao!'],
    ],
    premio: 0,
    final: true,
  },
];

// Partidas de antes del arco de 8 capítulos: quien iba por el 5 o más empieza en «La caja».
if (ESTADO.arco !== 2) {
  if ((ESTADO.capitulo || 0) >= 4) { ESTADO.capitulo = 4; ESTADO.introCap = 3; }
  ESTADO.arco = 2;
}

function capituloActual() {
  return CAPITULOS[Math.min(ESTADO.capitulo || 0, CAPITULOS.length - 1)];
}
function historiaAcabada() {
  return (ESTADO.capitulo || 0) >= CAPITULOS.length;
}

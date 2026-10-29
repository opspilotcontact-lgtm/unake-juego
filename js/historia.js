// La historia: «La noche más larga de Unaké». Seis capítulos con objetivos que se comprueban solos.
// El hilo: el casero sube el alquiler y, si la aso no junta 1.000 monchis en la hucha, cierra Unaké.
// Cada capítulo empieza con una escena (diálogo) y se cierra con premio. Al acabar, modo libre.
// PROPUESTA de guion para el juego: nada de esto es canon de la serie.

const META_HUCHA = 1000;

function stat(k) { return (ESTADO.stats && ESTADO.stats[k]) || 0; }
function sumarStat(k, n = 1) {
  ESTADO.stats = ESTADO.stats || {};
  ESTADO.stats[k] = stat(k) + n;
  guardarPartida();
}
function estrellasDeMision(k) { return ESTADO.estrellas[k] || 0; }

const CAPITULOS = [
  {
    titulo: '¿Una qué?',
    arte: 'cap-cap1',
    intro: [
      ['narrador', 'Anoche probaste el mundo humo. Hoy es de día y todo es normal. Demasiado normal.'],
      ['vuper', 'Quiero volver. Dicen que en Unaké, la aso del barrio, saben cómo. Solo entra quien se sabe la contraseña.'],
      ['narrador', 'Para liarte hace falta papel, boquilla, la bolsita de la aso y mechero. Y para todo eso, monchis.'],
    ],
    objetivos: [
      { texto: 'Gana monchis: haz un encargo de la tienda de 24 h', hecho: () => stat('entregas') >= 1 },
      { texto: 'Entra en Unaké: Perico pide la contraseña', hecho: () => ESTADO.dentro },
      { texto: 'Lía y fuma en el sofá: vuelve al mundo humo', hecho: () => stat('fumadas') >= 1 },
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
      ['palicaso', 'Y encima se me acaba el género de la barra. Rider, te necesito.'],
      ['palicaso', '¡Escucha! Y otra cosa: si mejoramos el local, viene más gente y la caja se llena sola. Mira el negocio, en la barra.'],
    ],
    situaciones: [['palicaso', 'genero']],
    objetivos: [
      { texto: 'Palicaso: se acaba el género (búscale y sirve la barra)', hecho: () => stat('sit_genero') >= 1 },
      { texto: 'De noche, ayuda a Cotine con la tarta (1 estrella)', hecho: () => estrellasDeMision('Tarta') >= 1 },
      { texto: 'Invierte en el negocio: compra una mejora (en la barra)', hecho: () => cuentasNegocio().total >= 1 },
      { texto: 'Aporta 100 monchis a la hucha (Blancaso, en la plaza)', hecho: () => ESTADO.hucha >= 100 },
    ],
    premio: 40,
  },
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
    premio: 60,
  },
  {
    titulo: 'Un señor ante el casero',
    arte: 'cap-cap4',
    intro: [
      ['blancaso', 'Gracias… otra vez. Pero el casero viene a cenar para inspeccionar, y se me han volado sus facturas.'],
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
    premio: 80,
  },
  {
    titulo: 'Que no cunda el amarillo',
    arte: 'cap-cap5',
    intro: [
      ['narrador', 'La noche de la inspección, a medio barrio le da un amarillo. La M de tu cuarto parpadea.'],
      ['pompa', '…Y yo pincho esta noche. Si alguien encuentra mis discos.'],
      ['vuper', 'Vale, vale… Nadie sabe que soy yo. Que siga así.'],
    ],
    situaciones: [['pompa', 'pinchar']],
    objetivos: [
      { texto: 'La Pompa pincha la noche de la inspección', hecho: () => stat('sit_pinchar') >= 1 },
      { texto: 'Rescate de Monchiman (1 estrella)', hecho: () => estrellasDeMision('Rescate') >= 1 },
      { texto: 'Junta 6 estrellas en total', hecho: () => totalEstrellas() >= 6, progreso: () => `${totalEstrellas()}/6` },
      { texto: 'Hucha de la aso: 700 monchis', hecho: () => ESTADO.hucha >= 700, progreso: () => `${ESTADO.hucha}/700` },
    ],
    premio: 100,
  },
  {
    titulo: 'La noche más larga',
    arte: 'cap-cap6',
    intro: [
      ['blancaso', 'Faltan los últimos. Si llegamos a mil, Unaké se queda.'],
      ['perico', 'Pin pin. Me apuesto mis pipas a que no llegáis.'],
      ['palicaso', '¡Escucha! Si se salva el bar, fiesta. Y si no, también. Pero menos.'],
    ],
    situaciones: [['perico', 'apuesta']],
    objetivos: [
      { texto: 'Gánale la apuesta a Perico', hecho: () => stat('sit_apuesta') >= 1 },
      { texto: `Completa la hucha: ${META_HUCHA} monchis`, hecho: () => ESTADO.hucha >= META_HUCHA, progreso: () => `${ESTADO.hucha}/${META_HUCHA}` },
    ],
    premio: 0,
    final: true,
  },
];

function capituloActual() {
  return CAPITULOS[Math.min(ESTADO.capitulo || 0, CAPITULOS.length - 1)];
}
function historiaAcabada() {
  return (ESTADO.capitulo || 0) >= CAPITULOS.length;
}

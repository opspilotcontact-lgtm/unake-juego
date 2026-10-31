// Situaciones: cada cierto tiempo, a alguien del barrio le pasa algo. Son misiones secundarias
// procedurales: se elige una plantilla del personaje (solo las que permite el capítulo en curso,
// para que sigan el orden de la historia), se sortean cuántas cosas hay que buscar, dónde aparecen,
// el texto y el premio. Los pasos encadenan «recoger» (brillos por el barrio) y «mision» (un minijuego).
// La lógica de aparecer, marcar y entregar está en barrio.js; aquí, el contenido y el premio.

// desde: id del capítulo mínimo (historia.js, p. ej. 'cuota'). {n} = cuántas cosas hay que buscar.
const SITUACIONES = {
  palicaso: [
    {
      id: 'genero', desde: 'cuota', titulo: 'Se acaba el género',
      textos: [
        '«¡Escucha! Se me acaba el género de la barra. El repartidor dejó {n} cajas tiradas por el barrio. Tráemelas y esta noche servimos.»',
        '«¡Escucha, escucha! Viene medio barrio y la barra está vacía. ¿Me buscas {n} cajas? Te invito a lo que quieras. Bueno, a casi.»',
      ],
      pasos: [{ recoger: 'caja', n: [2, 4] }, { mision: 'Barra' }], premio: { monchis: [25, 50], bolsita: [1, 2] },
    },
    {
      id: 'karaoke', desde: 'blancazo', titulo: 'Noche de karaoke',
      textos: ['«Esta noche, karaoke. Yo canto, tú sirves. Si sale bien, lo que saquemos va para la hucha del casero.»'],
      pasos: [{ mision: 'Barra' }], premio: { monchis: [20, 35], hucha: [20, 40] },
    },
    {
      id: 'repartobarra', desde: 'senor', titulo: 'El reparto de la barra',
      textos: ['«¡Escucha! El de las bebidas ha dejado {n} cajas en la calle porque no se sabe la contraseña. ¡Ni el repartidor! Tráelas y servimos.»'],
      pasos: [{ recoger: 'caja', n: [3, 4] }, { mision: 'Barra' }], premio: { monchis: [35, 60], papel: [1, 2] },
    },
  ],
  perico: [
    {
      id: 'apuesta', desde: 'una-que', titulo: 'La apuesta de pipas',
      textos: ['«Pin pin. Te apuesto lo que quieras a que no metes una pipa en la papelera. Ni una.»', '«¿Pipas? Pipas. El que más meta en la papelera, gana. Yo siempre gano.»'],
      pasos: [{ mision: 'Pipas' }], premio: { monchis: [15, 35], pista: 1 },
    },
    {
      id: 'chivatazo', desde: 'blancazo', titulo: 'El chivatazo',
      textos: ['«Pin pin. Sé dónde hay una boquilla. Te lo cambio por… ganarme a las pipas.»'],
      pasos: [{ mision: 'Pipas' }], premio: { monchis: [10, 20], boquilla: 1 },
    },
    {
      id: 'pipasparque', desde: 'caja', titulo: 'Las pipas del parque',
      textos: ['«Pin pin. El casero dice que el que tire pipas al suelo paga multa. Al suelo no: a la papelera. Demuéstralo.»'],
      pasos: [{ mision: 'Pipas' }], premio: { monchis: [20, 30], hucha: [15, 30] },
    },
  ],
  pompa: [
    {
      id: 'pinchar', desde: 'blancazo', titulo: 'Pincha esta noche',
      textos: ['«…Se me han caído {n} discos del techo. Si los encuentras… pincho. Despacito.»', '«Esta noche pincho yo. Bueno, tú. Yo floto. Busca mis {n} discos.»'],
      pasos: [{ recoger: 'disco', n: [2, 3] }, { mision: 'DJ' }], premio: { monchis: [30, 55], colocon: 15 },
    },
    {
      id: 'silencio', desde: 'senor', titulo: 'El silencio de la Pompa',
      textos: ['«…Esta noche el bar está muy callado. Me pone nerviosa. Pon algo. Lo que sea. Pero a tiempo.»'],
      pasos: [{ mision: 'DJ' }], premio: { monchis: [25, 45], colocon: 10 },
    },
  ],
  blancaso: [
    {
      id: 'caja', desde: 'cuota', titulo: 'La caja no cuadra',
      textos: ['«La caja no cuadra. Otra vez. Ayúdame a ordenar: lo que salvemos va derecho a la hucha.»'],
      pasos: [{ mision: 'Cuentas' }], premio: { hucha: [20, 40] },
    },
    {
      id: 'facturas', desde: 'senor', titulo: 'Las facturas del casero',
      textos: ['«El casero manda facturas nuevas y {n} se han volado por el barrio. Búscalas antes de que las encuentre Perico y lo cuente.»'],
      pasos: [{ recoger: 'factura', n: [2, 4] }, { mision: 'Cuentas' }], premio: { hucha: [40, 70], monchis: [10, 20] },
    },
    {
      id: 'agenda', desde: 'blancazo', titulo: 'La agenda perdida',
      textos: ['«He perdido las hojas de la agenda. Ahí estaba todo apuntado: quién debe, quién paga y quién se hace el loco. {n} hojas.»'],
      pasos: [{ recoger: 'factura', n: [2, 3] }], premio: { monchis: [20, 35], hucha: [10, 20] },
    },
  ],
  cotine: [
    {
      id: 'ingredientes', desde: 'cuota', titulo: 'Sin ingredientes',
      textos: ['«Me he comido los ingredientes. Todos. ¿Me traes {n} fresas? Las vi rodando por el barrio.»'],
      pasos: [{ recoger: 'fresa', n: [2, 4] }, { mision: 'Tarta' }], premio: { monchis: [25, 45], papel: [1, 2] },
    },
    {
      id: 'encargotarta', desde: 'senor', titulo: 'Una tarta para el casero',
      textos: ['«El casero ha encargado una tarta. Si llega entera, igual nos rebaja algo. Si llega… como siempre, no.»'],
      pasos: [{ mision: 'Tarta' }], premio: { hucha: [30, 50], monchis: [10, 20] },
    },
  ],
  lasslow: [
    {
      id: 'pajarita', desde: 'senor', titulo: 'La pajarita perdida',
      textos: ['«Un señor sin pajarita no es un señor. Y el casero viene a cenar. La he perdido por el barrio.»'],
      pasos: [{ recoger: 'pajarita', n: [1, 1] }, { mision: 'Lasslow' }], premio: { monchis: [30, 50], hucha: [10, 20] },
    },
    {
      id: 'ensayo', desde: 'caja', titulo: 'Ensayo de señor',
      textos: ['«Caballero, necesito ensayar. Si aguanto una cena entera sin… incidentes, invito yo. JA… perdón.»'],
      pasos: [{ mision: 'Lasslow' }], premio: { monchis: [30, 45] },
    },
  ],
};

// Lo que se recoge: textura e icono de cada cosa.
const RECOGIBLES = {
  caja: { sprite: 'obj-caja', nombre: 'caja', escala: 0.6 },
  disco: { sprite: 'obj-disco', nombre: 'disco', escala: 0.6 },
  fresa: { sprite: 'obj-fresa', nombre: 'fresa', escala: 0.7 },
  factura: { sprite: 'obj-factura', nombre: 'factura', escala: 0.6 },
  pajarita: { sprite: 'pajarita', nombre: 'pajarita', escala: 0.32 },
};

const entre = ([a, b]) => Phaser.Math.Between(a, b);

// Crea una situación nueva para un personaje (o null si no tiene ninguna para este capítulo).
// Con `plId`, esa plantilla en concreto (la historia la pide aunque no toque por capítulo).
function nuevaSituacion(id, plId) {
  const plantillas = (SITUACIONES[id] || []).filter(p => (plId ? p.id === plId : desdeCapRef(p.desde)));
  if (!plantillas.length) return null;
  const pl = Phaser.Utils.Array.GetRandom(plantillas);
  const pasos = pl.pasos.map(p => (p.recoger ? { recoger: p.recoger, n: entre(p.n), hechos: 0 } : { ...p }));
  const n = (pasos.find(p => p.recoger) || {}).n || 0;
  const premio = {};
  Object.entries(pl.premio).forEach(([k, v]) => { premio[k] = Array.isArray(v) ? entre(v) : v; });
  return { pl: pl.id, titulo: pl.titulo, texto: Phaser.Utils.Array.GetRandom(pl.textos).replace('{n}', n), pasos, paso: 0, aceptada: false, premio };
}

function textoPremio(p) {
  const partes = [];
  if (p.monchis) partes.push(`+${p.monchis} monchis`);
  if (p.hucha) partes.push(`+${p.hucha} a la hucha`);
  if (p.bolsita) partes.push(`+${p.bolsita} bolsita${p.bolsita > 1 ? 's' : ''}`);
  if (p.papel) partes.push(`+${p.papel} papel`);
  if (p.boquilla) partes.push('+1 boquilla');
  if (p.pista) partes.push('una pista');
  if (p.colocon) partes.push('buen rollo (colocón)');
  return partes.join(' · ');
}

// Da el premio y cierra la situación. Devuelve el texto del premio.
function completarSituacion(id) {
  const s = ESTADO.situaciones && ESTADO.situaciones[id];
  if (!s) return '';
  const p = s.premio;
  ESTADO.monchis += p.monchis || 0;
  ESTADO.hucha = Math.min(META_HUCHA, (ESTADO.hucha || 0) + (p.hucha || 0));
  ESTADO.inv.bolsita += p.bolsita || 0;
  ESTADO.inv.papel += p.papel || 0;
  ESTADO.inv.boquilla += p.boquilla || 0;
  if (p.boquilla) ESTADO.boquillaEn = null;
  if (p.colocon) ESTADO.colocon = Math.min(100, ESTADO.colocon + p.colocon);
  if (p.pista) ESTADO.pistaPendiente = true;
  let extra = '';
  if (s.ampliacion) {
    negocio().salas[s.ampliacion] = true;
    const a = AMPLIACIONES.find(x => x.id === s.ampliacion);
    extra = ` · ¡Nueva sala abierta: ${a.nombre}!`;
  }
  delete ESTADO.situaciones[id];
  sumarStat('situaciones');
  sumarStat(`sit_${s.pl}`);
  guardarPartida();
  return textoPremio(p) + extra;
}

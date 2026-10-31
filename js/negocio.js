// El negocio de Unaké (bucle de tycoon): se invierten monchis en mejoras del bar, eso trae
// clientela, la caja se llena sola (también mientras no se juega, hasta un tope) y se cobra para
// volver a invertir. La máquina de bolsitas fabrica lo de la aso para liar. Hay rango del local
// y metas con premio, para que siempre haya un siguiente gran paso que dejar para otro día.
// Todo se calcula con la hora real (Date.now), así que funciona igual dentro y fuera del juego.

const MEJORAS_NEGOCIO = [
  { id: 'neon', nombre: 'Neón de la puerta', desc: 'Atrae clientela', base: 50 },
  { id: 'sofas', nombre: 'Sofás nuevos', desc: 'Más aforo: caben más', base: 70 },
  { id: 'barra', nombre: 'Barra de Palicaso', desc: 'Cada cliente deja más', base: 90 },
  { id: 'maquina', nombre: 'Máquina de monchis', desc: 'Vende sola y agranda la caja', base: 80 },
  { id: 'horno', nombre: 'Horno de Cotine', desc: 'Tartas que se venden solas', base: 140 },
  { id: 'dj', nombre: 'Cabina de la Pompa', desc: 'Música: más clientela', base: 160 },
  { id: 'bolsitas', nombre: 'Máquina de bolsitas', desc: 'Fabrica lo de la aso para liar', base: 220 },
];
const NIVEL_MAX = 5;
// Hasta qué nivel deja subir cada mejora según el capítulo. Hoy no hay puerta: el director la conecta
// con los capítulos nuevos (barrio.js debe usarla en vez de NIVEL_MAX al comprar y al pintar).
function nivelMaxPorCapitulo(cap) { return NIVEL_MAX; }
// Los niveles 4 y 5 salen x2 y x3 (se indexa por el nivel que ya se tiene).
const MULT_PRECIO_NIVEL = [1, 1, 1, 2, 3];
const RANGOS = [
  [0, 'Antro'], [5, 'Bareto'], [12, 'Aso de barrio'], [20, 'Local de moda'], [28, 'Leyenda del humo'], [32, 'Templo del humo'], [35, 'Leyenda del barrio'],
];
const METAS_NEGOCIO = [
  { texto: 'Compra tu primera mejora', hecho: c => c.total >= 1, premio: 20 },
  { texto: 'Ten 3 clientes a la vez', hecho: c => c.clientes >= 3, premio: 40 },
  { texto: 'Gana 15 monchis por minuto', hecho: c => c.porMin >= 15, premio: 60 },
  { texto: 'Todas las mejoras a nivel 1', hecho: c => MEJORAS_NEGOCIO.every(m => c.niv[m.id] >= 1), premio: 100 },
  { texto: 'Rango «Aso de barrio» (nivel 12)', hecho: c => c.total >= 12, premio: 150 },
  { texto: 'Gana 50 monchis por minuto', hecho: c => c.porMin >= 50, premio: 200 },
  { texto: 'Todas las mejoras a nivel 3', hecho: c => MEJORAS_NEGOCIO.every(m => c.niv[m.id] >= 3), premio: 300 },
  { texto: 'Leyenda del humo (nivel 28)', hecho: c => c.total >= 28, premio: 500 },
  { texto: 'Templo del humo (nivel 32)', hecho: c => c.total >= 32, premio: 600 },
  { texto: 'Leyenda del barrio (nivel 35)', hecho: c => c.total >= 35, premio: 1000 },
];

function negocio() {
  ESTADO.negocio = ESTADO.negocio || { niveles: {}, caja: 0, bolsitas: 0, ultimo: Date.now(), metas: 0, ultimoDia: '' };
  ESTADO.negocio.salas = ESTADO.negocio.salas || {};
  return ESTADO.negocio;
}

function nivelNegocio(id) { return negocio().niveles[id] || 0; }

function precioMejora(m) { const n = nivelNegocio(m.id); return Math.round(m.base * Math.pow(1.9, n) * (MULT_PRECIO_NIVEL[n] || 1)); }

// Las cuentas del local con los niveles actuales.
function cuentasNegocio() {
  const niv = {};
  MEJORAS_NEGOCIO.forEach(m => { niv[m.id] = nivelNegocio(m.id); });
  const total = Object.values(niv).reduce((a, b) => a + b, 0);
  const salas = AMPLIACIONES.filter(a => negocio().salas[a.id]);
  const aforo = 2 + 2 * niv.sofas + salas.reduce((x, a) => x + a.aforo, 0);
  const atraccion = 1 + 1.6 * niv.neon + 1.2 * niv.dj + salas.reduce((x, a) => x + a.atraccion, 0) + bonoDeco('atraccion');
  const clientes = Math.min(aforo, atraccion);
  const porCliente = 1 + 0.5 * niv.barra + bonoDeco('porCliente');
  const porMin = clientes * porCliente + 2 * niv.maquina + 1.5 * niv.horno;
  const tope = Math.round(Math.max(60, porMin * (45 + 10 * niv.maquina) * (1 + bonoDeco('tope'))));
  const minPorBolsita = niv.bolsitas ? 24 / niv.bolsitas : 0;
  const rango = RANGOS.filter(([n]) => total >= n).pop()[1];
  return { niv, total, aforo, atraccion, clientes, porCliente, porMin, tope, minPorBolsita, rango };
}

// Pone al día la caja y la máquina de bolsitas con la hora real. Devuelve lo ganado.
function actualizarNegocio() {
  const n = negocio();
  const c = cuentasNegocio();
  const ahora = Date.now();
  const min = Math.max(0, (ahora - n.ultimo) / 60000);
  n.ultimo = ahora;
  const antes = n.caja;
  // Fuera del juego (más de 5 min sin pasar por aquí) el bar rinde al 60 %: de día hay menos gente.
  const efectivo = min > 5 ? min * 0.6 : min;
  n.caja = Math.min(c.tope, n.caja + efectivo * c.porMin);
  if (c.minPorBolsita) n.bolsitas = Math.min(5, n.bolsitas + min / c.minPorBolsita);
  return { ganado: n.caja - antes, minutos: min };
}

function rangoSiguiente(total) {
  const s = RANGOS.find(([n]) => n > total);
  return s ? `${s[1]} (nivel ${s[0]})` : null;
}

// ---------- Ampliaciones: salas nuevas contiguas a Unaké ----------
// Se lanzan desde el negocio pagando la obra; eso encarga una «obra de inauguración» (situación) al
// personaje que pega. Al terminarla, la sala abre: más aforo, más clientela y sitio para decorar.
const AMPLIACIONES = [
  {
    id: 'reservado', nombre: 'El reservado', precio: 350, aforo: 4, atraccion: 1.5, quien: 'palicaso',
    requiere: () => cuentasNegocio().total >= 4, requisito: 'Negocio a nivel 4',
    obra: {
      titulo: 'Inauguración: el reservado',
      texto: '«¡Escucha! Si abrimos el reservado, cabe medio barrio más. Tráeme {n} cajas de material y hacemos la noche de estreno en la barra.»',
      pasos: [{ recoger: 'caja', n: 4, hechos: 0 }, { mision: 'Barra' }],
    },
  },
  {
    id: 'bano', nombre: 'Los baños de Unaké', precio: 600, aforo: 3, atraccion: 1, quien: 'blancaso',
    requiere: () => !!negocio().salas.reservado, requisito: 'Abrir antes el reservado',
    obra: {
      titulo: 'Obra: los baños',
      texto: '«Los baños dan miedo hasta a Puky. Bueno, a Puky no. Se han volado {n} facturas de la fontanería: búscalas y cuadramos la obra.»',
      pasos: [{ recoger: 'factura', n: 3, hechos: 0 }, { mision: 'Cuentas' }],
    },
  },
  {
    id: 'techo', nombre: 'El techo de la Pompa', precio: 1000, aforo: 5, atraccion: 2.5, quien: 'pompa',
    requiere: () => !!negocio().salas.bano, requisito: 'Abrir antes los baños',
    obra: {
      titulo: 'Estreno: el techo',
      texto: '«…Si me dejáis el techo entero, pincho para todo el barrio. Busca mis {n} discos y subimos.»',
      pasos: [{ recoger: 'disco', n: 3, hechos: 0 }, { mision: 'DJ' }],
    },
  },
];

// ---------- Decoración: opcional, se ve en el sitio y mejora algo ----------
const DECORACION = [
  { id: 'bola', nombre: 'Bola de discoteca', precio: 90, sala: 'dentro', x: 640, y: 150, efecto: '+0,5 de clientela', bono: { atraccion: 0.5 } },
  { id: 'planta', nombre: 'Planta-nube', precio: 70, sala: 'dentro', x: 70, y: 540, efecto: 'El hambre sube un 10 % más lento', bono: { hambre: -0.1 } },
  { id: 'poster', nombre: 'Póster de los hermanos Aso', precio: 60, sala: 'dentro', x: 420, y: 340, efecto: '+0,2 por cliente', bono: { porCliente: 0.2 } },
  { id: 'pinball', nombre: 'Máquina de pinball', precio: 160, sala: 'dentro', x: 1235, y: 600, efecto: '+0,3 por cliente', bono: { porCliente: 0.3 } },
  { id: 'pecera', nombre: 'Pecera con pez colocado', precio: 140, sala: 'reservado', x: 1110, y: 560, efecto: 'La caja aguanta un 20 % más', bono: { tope: 0.2 } },
  { id: 'alfombra', nombre: 'Alfombra de neón', precio: 120, sala: 'reservado', x: 640, y: 672, efecto: '+1 de clientela', bono: { atraccion: 1 } },
  { id: 'lava', nombre: 'Lámpara de lava', precio: 110, sala: 'cuarto', x: 300, y: 470, efecto: 'El colocón dura un 15 % más', bono: { colocon: -0.15 } },
  { id: 'estatua', nombre: 'Estatua de Monchiman', precio: 300, sala: 'cuarto', x: 840, y: 600, efecto: 'Las misiones pagan un 10 % más', bono: { pago: 0.1 } },
  { id: 'trono', nombre: 'El trono de Puky', precio: 200, sala: 'bano', x: 1180, y: 690, efecto: 'Puky deja de colarse en la barra', bono: { sinPuky: 1 } },
  { id: 'gramola', nombre: 'Gramola del techo', precio: 260, sala: 'techo', x: 1020, y: 520, efecto: '+1,5 de clientela', bono: { atraccion: 1.5 } },
];

function bonoDeco(k) {
  const d = ESTADO.deco || {};
  return DECORACION.filter(x => d[x.id] && x.bono[k]).reduce((a, x) => a + x.bono[k], 0);
}

function salaAbierta(n) {
  const a = AMPLIACIONES.find(x => x.id === n);
  return !a || !!negocio().salas[a.id];
}

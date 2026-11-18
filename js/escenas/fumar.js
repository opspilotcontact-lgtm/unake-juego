// Fumar en el sofá de Unaké con Lasslow y Blancaso. Sin misión: es disfrutar.
// - Empieza encendiendo (el mechero falla una vez, como todos).
// - MANTENER = calada: Vuper se hincha (fumar hincha) y se echa atrás. Soltar en la zona verde =
//   calada perfecta: aguanta temblando con los mofletes llenos, suelta de golpe y salen aros.
//   Pasarse = tos (y los colegas se ríen). Cada calada sube el colocón.
// - La zona buena son franjas anidadas (Bien > Buena > Muy buena > Épica > Leyenda > Snoop Dogo > 420), cada
//   vez más estrechas y con su animación propia, en escalada. Hay frases por nivel y mundo, garabatos de humo
//   y frases flotando. Lo conseguido se apunta en ESTADO.stats (calada_420, calada_leyenda...).
// - El porro que sujeta Vuper es el que has liado (forma y calidad, ver liar.js) y cambia de acabado con el mundo.
// - P = pasarlo: el porro vuela hasta el colega, que fuma, suelta y reacciona. Si Blancaso fuma,
//   al rato le da un blancaso.
// - En el mundo normal (de día, poses con cuerpo de persona), la primera calada buena hace efecto:
//   Vuper se parte en energía y cortinilla al mundo humo.
// - El humo se queda en la sala: cuanto más se fuma, más cargado el ambiente.

// ======================================================================================
// CON QUIÉN TE LO FUMAS, CÓMO LO SUELTAS Y CÓMO LO LÍAS (ampliación 16/11/2026)
//   · COMPAS: los acompañantes que se pueden sentar al lado (hasta 2). Cada uno cambia la sesión de forma visible:
//     cómo reacciona, qué te pide, cómo echa él el humo y un modificador pequeño. La sensación NUNCA se nombra
//     (criterio.md, regla 1): la `pista` solo cuenta lo que hace.
//   · FORMAS_HUMO: cómo se echa el humo tras la calada, cada una con su mini-habilidad y su puntuación. Se
//     desbloquean con las fumadas (stat `fumadas`); la primera vez solo está «Sin más».
//   · Los tipos de liado (recto, fino, cono, tulipán, cruzado) están en liar.js (TIPOS_LIAR).
// ======================================================================================

const SOFA_X = { izq: 420, vuper: 640, der: 880 };
const COMPAS_POR_DEFECTO = ['lasslow', 'blancaso'];
const ORDEN_COMPAS = ['lasslow', 'blancaso', 'palicaso', 'cotine', 'pompa', 'perico', 'puky'];

// Poses de los acompañantes que se parecen: base, calada, aguanta, suelta, riendo, tos. Las que faltan caen en `base`.
const poseNormal = (id, riendo, tos) => ({ base: `n-${id}`, calada: `n-${id}-fumando-calada`, aguanta: `n-${id}-fumando-aguanta`, suelta: `n-${id}-fumando-suelta`, riendo, tos });

const COMPAS = {
  lasslow: {
    nombre: 'Lasslow', pista: 'Se ríe justo en el momento serio.', mod: 'Su risa te mueve el pulso.', humo: 'aros',
    alto: { humo: 200, normal: 330 },
    poses: {
      humo: { base: 'lasslow-digno', calada: 'lasslow-calada', suelta: 'lasslow-calada', riendo: 'lasslow-risa-floja', tos: 'lasslow-horror' },
      normal: poseNormal('lasslow', 'n-lasslow-riendo', 'n-lasslow-fumando-tos'),
    },
    charlas: ['¿Te has fijado en que el techo respira?', 'Yo es que soy un señor, ¿eh? JAJA… perdón.', 'Este sofá me está abrazando.', 'Si me río, no es por ti. Bueno, un poco sí.'],
    reacciones: [
      ['riendo', '¡Bravo, caballero!', 'risas'], ['riendo', 'JAJAJA… perdón, es la emoción.', 'risa-lasslow'],
      ['tos', 'Eso no lo hago yo ni ensayando.', 'tos-pequena'], ['riendo', '*aplaude con los piececillos*', 'oooh'],
      ['calada', 'Enséñame, enséñame.', 'pop'], ['riendo', '¡Ese humo tiene más clase que yo!', 'aaah'],
    ],
    pase: [['riendo', '¡JAJAJA…! Espera, ¿de qué me río?', 'risa-lasslow'], ['riendo', 'Qué buen rollo, caballeros.', 'pop'], ['tos', 'Cof… sigo siendo un señor. Cof.', 'tos-pequena']],
    anecdotas: ['Una vez me reí en un funeral. Era el mío. Bueno, casi.', 'Yo de joven era un culo inquieto. Ahora soy un culo con pajarita.'],
    aplaude: ['¡Esa! ¡Esa era la buena!', 'JAJA… perdón. Qué arte.'], decepcion: ['Hm. Seriedad. …JAJA, no, es que me río yo solo.'],
    leyenda: ['JAJAJAJA… ¿de qué me río?', '¡Me parto! No sé de qué.', 'Jiji… el techo ha dicho algo.'],
  },
  blancaso: {
    nombre: 'Blancaso', pista: 'Apunta hasta la diversión en la agenda.', mod: 'Lo apunta todo: cada racha de 3 caladas buenas da premio.', humo: 'cascada',
    alto: { humo: 190, normal: 330 },
    poses: {
      humo: { base: 'blancaso', calada: 'blancaso-calada', suelta: 'blancaso-calada', riendo: 'blancaso-esperanza', tos: 'blancaso-mareado' },
      normal: poseNormal('blancaso', 'n-blancaso-riendo', 'n-blancaso-sorprendido'),
    },
    charlas: ['Hoy sí. Hoy disfruto de mi bar.', 'Qué a gusto… de momento.', '¿Alguien ha visto mis cuentas? Da igual.', 'Esta noche no me da el bajón. Hoy no.'],
    reacciones: [
      ['riendo', 'Qué arte…', 'aaah'], ['tos', 'Me mareo solo de verlo.', 'suspiro'], ['riendo', 'Esto no sale en las cuentas, pero vale oro.', 'pop'],
      ['calada', 'Hoy sí que disfruto de mi bar.', 'campanita'], ['tos', 'Cof… lo apunto… ah, que es bueno.', 'suspiro'],
    ],
    pase: [['tos', 'Esto… está fuerte, ¿no?', 'suspiro'], ['riendo', 'Hoy sí. Hoy disfruto.', 'aaah'], ['tos', 'Me están dando ganas de cuadrar las cuentas. Mal síntoma.', 'suspiro']],
    anecdotas: ['La última vez que fumé así cuadré las cuentas. Mentira.', 'Cuando era copo, nevaba más. Ahora solo me derrito.'],
    aplaude: ['Apuntado. En rojo, de la alegría.', 'Esto va a la columna del haber.'], decepcion: ['Lo apunto en el debe. Con cariño.'],
    leyenda: ['Esto no sale en las cuentas. Vale oro.', 'Hoy no cuadro nada. Y qué bien.', 'Apuntadlo en el libro de las alegrías.'],
  },
  palicaso: {
    nombre: 'Palicaso', pista: 'No deja hueco para que hablen los demás.', mod: 'Te tapa el humo con sus bocadillos, pero cortarle el chiste con una buena calada da premio.', humo: 'dragon',
    alto: { humo: 200, normal: 330 },
    poses: {
      humo: { base: 'palicaso', calada: 'palicaso-contando', suelta: 'palicaso-contando', riendo: 'palicaso-riendo', tos: 'palicaso-riendo' },
      normal: poseNormal('palicaso', 'n-palicaso-riendo', 'n-palicaso-fumando-tos'),
    },
    charlas: ['¡Escucha, escucha! Y mientras escuchas, yo sigo.', 'Como iba diciendo… ¿dónde iba?', '¿Qué le dice un sofá a otro? Espera, que lo cuento bien.', 'Déjame acabar. Y luego te dejo empezar. Luego.'],
    reacciones: [
      ['riendo', '¡Escucha, escucha! Eso ha sido un aro. Digo, una tesis.', 'risas'], ['calada', 'Yo eso lo hacía con diecisiete años. Y con una mano. Y hablando.', 'pop'],
      ['riendo', 'Pues yo una vez hice uno que… bueno, ya os lo cuento.', 'aaah'], ['riendo', '¡Ese es de los míos! Los buenos ruidos, digo.', 'oooh'],
    ],
    pase: [['riendo', '¡Escucha, escucha! …Ah, que fumo. Escuchad luego.', 'risas'], ['tos', 'Cof… ¿qué decía? Cof… ah, sí.', 'tos-pequena'], ['riendo', 'Esto lo cuento yo en el bar mañana.', 'pop']],
    anecdotas: ['¡Escucha, escucha! Una vez le conté un chiste a un espejo y se rio el espejo.', 'Y entonces le digo: «yo lo cuento mejor». Y me dice: «pues cuéntalo». Y no me dejó.'],
    aplaude: ['¡Escucha, escucha! ¡Eso sí que es un espectáculo!', '¡Lo has bordado! Yo lo habría contado más largo.'], decepcion: ['Bueno, bueno… yo lo habría hecho con más palabras.'],
    leyenda: ['¡Escucha, escucha!', '¡Escucha, escucha! …no, déjalo.', '¡Escucha! ¿Qué le dice una calada a otra?'],
  },
  cotine: {
    nombre: 'Cotine', pista: 'Se come lo que cocina.', mod: 'Da más monchis, pero te deja con más hambre al levantarte.', humo: 'corazon',
    alto: { humo: 200, normal: 330 },
    poses: {
      humo: { base: 'cotine', calada: 'cotine', suelta: 'cotine', riendo: 'cotine', tos: 'cotine-plop' },
      normal: poseNormal('cotine', 'n-cotine-riendo', 'n-cotine-fumando-tos'),
    },
    charlas: ['¿Qué? Tenía hambre.', 'Si fuera tarta, ya me habría comido el sofá.', 'Guardad un poquito. Un poquito. Para mí.', 'Esto huele a bizcocho. ¿O soy yo?'],
    reacciones: [
      ['riendo', 'Mmm… ¡qué bueno! ¿Se come?', 'nam'], ['calada', 'Yo lo haría en forma de rosquilla.', 'pop'], ['riendo', '¡Eso parece una nata montada!', 'aaah'], ['tos', 'Se me ha quitado el hambre. Medio segundo.', 'tos-pequena'],
    ],
    pase: [['riendo', 'Qué cosa más rica. Digo, más buena.', 'nam'], ['tos', 'Cof… ¿había tarta? Cof… da igual.', 'tos-pequena'], ['riendo', 'Esto da hambre. Qué raro.', 'pop']],
    anecdotas: ['Una vez me comí el postre antes que el plato. Y el plato después. Y el mantel.', 'Mi bizcocho mejor salió cuando no miraba. Es que me lo comí antes.'],
    aplaude: ['¡Qué rico! Digo, qué bonito.', '¡Eso se come con los ojos!'], decepcion: ['No pasa nada. Yo me como lo que sobre.'],
    leyenda: ['¡Qué hambre me ha dado esto!', '¡Que alguien me pase una tarta!', 'Hoy me como el techo.'],
  },
  pompa: {
    nombre: 'La Pompa', pista: 'Dice que no. Y contesta… luego.', mod: 'Todo va más lento, el porro dura y una nube gorda bien aguantada puntúa más.', humo: 'nube', retraso: 2600,
    alto: { humo: 150, normal: 330 },
    poses: {
      humo: { base: 'pompa', calada: 'pompa-mira', suelta: 'pompa-mira', riendo: 'pompa-mira', tos: 'pompa-horror' },
      normal: poseNormal('pompa', 'n-pompa-riendo', 'n-pompa-fumando-tos'),
    },
    charlas: ['No.', '…Hace un rato me hablaste. Pues no.', 'Todo está bien si no te mueves.', 'Me cuesta menos flotar que hablar.'],
    reacciones: [
      ['riendo', '…Eso que hiciste antes. Sí. Estaba bien.', 'suspiro'], ['calada', 'No. …Bueno, vale. Un poco.', 'pop'], ['riendo', 'Lo vi. Ya. Hace un rato. Bonito.', 'aaah'],
    ],
    pase: [['tos', 'No. …Ah, que era para mí. Pues vale.', 'suspiro'], ['riendo', '…Qué buena. La que me pasaste antes.', 'aaah'], ['tos', 'Todo despacio. Así sabe mejor. Despacio.', 'suspiro']],
    anecdotas: ['Una vez tardé una hora en reírme de un chiste. Fue un buen chiste.', 'Nunca llego tarde. Los demás llegan pronto.'],
    aplaude: ['…Eso. Sí. Bien hecho. Hace un rato.', 'Despacio. Y bien. Así.'], decepcion: ['No. …Bueno. Otra vez.'],
    leyenda: ['No. …Sí. Todo.', 'Despacio… despacio… ¡ah!', 'Me ha subido hasta yo.'],
  },
  perico: {
    nombre: 'Perico', pista: 'Repite y nadie le cree.', mod: 'Lo repite todo («pin pin») y sus peticiones valen el doble.', humo: 'carita',
    alto: { humo: 140, normal: 310 },
    poses: {
      humo: { base: 'perico', calada: 'perico-silbando', suelta: 'perico-silbando', riendo: 'perico-graznando', tos: 'perico-horror' },
      normal: poseNormal('perico', 'n-perico-sorprendido', 'n-perico-fumando-tos'),
    },
    charlas: ['Pin pin. Lo vi antes. Pin pin.', 'Yo ya lo dije. Dos veces. Nadie me cree.', 'Pin pin. Pin pin. ¿Qué?', 'Que conste que yo avisé.'],
    reacciones: [
      ['riendo', 'Pin pin. Eso. Eso mismo. Eso.', 'pin-pin'], ['calada', 'Yo lo vi primero. Pin pin.', 'pin-pin'], ['riendo', '¿Lo has visto? ¿Lo has visto? Lo he visto.', 'aaah'],
    ],
    pase: [['tos', 'Pin pin. Cof. Pin pin.', 'pin-pin'], ['riendo', 'Buena. Buena. Muy buena. Buena.', 'pop'], ['tos', 'Yo ya lo sabía. Ya lo sabía.', 'tos-pequena']],
    anecdotas: ['Una vez dije la verdad. Dos veces. Nadie me creyó ninguna.', 'Pin pin. Una vez me pillaron con un mechero. Y con otro. Y con otro.'],
    aplaude: ['¡Pin pin! ¡Otra vez! ¡Otra vez!', 'Eso. Eso. ¡Eso!'], decepcion: ['Pin pin. Yo ya lo sabía. Lo sabía.'],
    leyenda: ['¡Pin pin pin pin!', '¡Eso lo he dicho yo antes!', 'Pin pin. Nadie me cree. Esta vez sí.'],
  },
  puky: {
    nombre: 'Puky', pista: 'Aparece cuando nadie le llama.', mod: 'Se come un poco de brasa, pero cada visita suya deja monchis.', humo: 'eructo', solo: 'humo',
    alto: { humo: 140, normal: 140 },
    poses: {
      humo: { base: 'puky', calada: 'puky-que-rico', suelta: 'puky-que-rico', riendo: 'puky-riendo', tos: 'puky-horror' },
      normal: { base: 'puky' },
    },
    charlas: ['¿Me llamabais?', 'Yo solo quería que me invitarais…', '¿Eso se come? ¿Me lo dais?', 'Blurp. Perdón.'],
    reacciones: [
      ['riendo', '¡Qué bonito! ¿Es para mí?', 'puky-gracioso'], ['calada', 'Ay, qué rico.', 'blurp'], ['riendo', '¿Me llamabais? ¿Ahora? ¡Ah, bien!', 'puky-gracioso'],
    ],
    pase: [['riendo', 'Qué rico… ¿puedo otra?', 'puky-gracioso'], ['tos', 'Blurp. Cof. Blurp.', 'blurp'], ['riendo', 'Me han invitado. ¡Me han invitado!', 'puky-gracioso']],
    anecdotas: ['Yo solo quería que me invitarais. Y ya me habéis invitado. Qué bonito.', 'Una vez me caí por la rendija. Y salí por otra. No me llamó nadie.'],
    aplaude: ['¡Me encanta! ¡Hazlo otra vez!', '¡Qué bonito!'], decepcion: ['Bueno. Yo me lo como igual.'],
    leyenda: ['¿Me llamabais?', '¡Qué bonito! ¡Qué bonito!', 'Blurp. Qué bonito.'],
  },
};

// ¿Quién puede sentarse hoy? Lo que la historia aún no ha presentado no sale (criterio.md: el chiste espera al lore).
function compasDisponibles(mundo) {
  const ok = {
    lasslow: true, blancaso: true, palicaso: true,
    cotine: desdeCapId('cuota'), pompa: desdeCapId('pompa'), perico: desdeCapId('caja'), puky: desdeCapId('mejor-amigo'),
  };
  return ORDEN_COMPAS.filter(id => ok[id] && !(COMPAS[id].solo === 'humo' && mundo === 'normal'));
}
// Los que la historia obliga a sentar (el objetivo «pásale el porro a Blancaso» del capítulo `blancazo`).
function compasObligados() {
  return desdeCapId('blancazo') && stat('blancasoFumo') < 1 ? ['blancaso'] : [];
}
// Deja una lista de acompañantes válida: sin repetidos, solo los disponibles, los obligados dentro y entre 1 y 2.
function compasValidos(lista, mundo, ordenar = true) {
  const dispo = compasDisponibles(mundo);
  const obl = compasObligados();
  let l = [...new Set(lista || [])].filter(id => COMPAS[id] && dispo.includes(id));
  obl.forEach(id => { if (!l.includes(id)) l.unshift(id); });
  if (l.length > 2) l = [...obl, ...l.filter(id => !obl.includes(id))].slice(0, 2);
  if (!l.length) l = COMPAS_POR_DEFECTO.filter(id => dispo.includes(id)).slice(0, 2);
  // El orden de las plazas es estable: Lasslow a la izquierda y Blancaso a la derecha si están.
  return ordenar ? l.sort((a, b) => ORDEN_COMPAS.indexOf(a) - ORDEN_COMPAS.indexOf(b)) : l;
}

// Poses por mundo. Las que faltan caen en `base`. Los acompañantes salen de COMPAS.
const POSES_SOFA = {
  humo: {
    vuper: { base: 'vuper-fumando', calada: 'vuper-calada', aguanta: 'vuper-aguanta', suelta: 'vuper-suelta', tos: 'vuper-tos', pasar: 'vuper-pasando', mechero: 'vuper-fumando', riendo: 'vuper-fumado', sin: 'vuper' },
  },
  normal: {
    vuper: { base: 'vn-fumando-calada', calada: 'vn-fumando-calada', aguanta: 'vn-fumando-aguanta', suelta: 'vn-fumando-suelta', tos: 'vn-fumando-tos', pasar: 'vn-hablando', mechero: 'vn-fumando-mechero', riendo: 'vn-riendo', sin: 'vn-riendo' },
  },
};
ORDEN_COMPAS.forEach(id => { POSES_SOFA.humo[id] = COMPAS[id].poses.humo; POSES_SOFA.normal[id] = COMPAS[id].poses.normal; });

// Dónde van sentados y cuánto miden (en el normal se recortan las piernas: el sofá las tapa). La `x` de los
// acompañantes depende de la plaza (SOFA_X.izq / .der) y se pone al sentarlos.
const SITIO = { vuper: { x: SOFA_X.vuper, alto: { humo: 235, normal: 350 } } };
ORDEN_COMPAS.forEach(id => { SITIO[id] = { x: SOFA_X.izq, alto: COMPAS[id].alto }; });

// ---------- Cómo echar el humo (cada forma, su mini-habilidad) ----------
// `desde` = fumadas que hacen falta; `base` = puntos (monchis) que da una ejecución perfecta; `colocon` = lo que sube.
const FORMAS_HUMO = {
  libre: { nombre: 'Sin más', desde: 0, base: 0, colocon: 0, ayuda: '' },
  aros: { nombre: 'Aros', desde: 1, base: 10, colocon: 2, ayuda: 'ESPACIO cuando el aro llegue al círculo (4 aros)', pide: ['¡Hazme un aro!', 'Un aro, anda. Uno redondo.', '¿Sabes hacer aros o solo lo dicen?'] },
  nube: { nombre: 'Nube gorda', desde: 2, base: 11, colocon: 4, ayuda: 'MANTÉN ESPACIO y suelta antes de la zona roja', pide: ['¡Una nube gorda! Que tape el techo.', 'Aguanta, aguanta… y échala toda.', 'Hazme una nube que se vea desde el piso de arriba.'] },
  cascada: { nombre: 'Cascada', desde: 3, base: 12, colocon: 2, ayuda: 'ESPACIO cuando la gota cruce la raya dorada (3 gotas)', pide: ['Échalo en cascada, anda.', '¿Sabes hacer una cascada? Enséñamela.', 'Que caiga como una catarata. Una cascada, digo.'] },
  dragon: { nombre: 'Dragón', desde: 4, base: 12, colocon: 3, ayuda: 'Alterna ◄ ► (o A y D) lo más rápido que puedas', pide: ['¡Por la nariz! ¡Como un dragón!', 'Un dragón, venga. Con fuego.', '¿Echas humo por la nariz? Pues hazlo.'] },
  fantasma: { nombre: 'Fantasma', desde: 6, base: 14, colocon: 3, ayuda: 'MANTÉN para soltarlo · suelta y ESPACIO al volver a tu nariz', pide: ['Suéltalo y recógelo. Un fantasma, anda.', 'Hazme un fantasma. Que vaya y vuelva.', 'Eso del humo que se va y se vuelve. ¿Sabes?'] },
};
const ORDEN_FORMAS = ['libre', 'aros', 'nube', 'cascada', 'dragon', 'fantasma'];
function formaDesbloqueada(id) { return stat('fumadas') >= FORMAS_HUMO[id].desde; }
// Dónde está la punta del porro (o la llama del mechero) en cada dibujo, medido con rejilla:
// el fuego sale de ahí, y si la pose no enseña el porro, no sale fuego.
const PUNTAS = {
  'vuper-fumando': [0.84, 0.46], 'vuper-calada': [0.88, 0.62], 'vuper-tos': [0.98, 0.8],
  // Mundo normal, medido de nuevo con rejilla ampliada (29-oct): la punta encendida del porro.
  'vn-fumando-calada': [0.45, 0.365], 'vn-fumando-mechero': [0.632, 0.386],
};
// Dónde está la boca del mechero en las poses de encender: la llama sale de ahí y se tuerce hasta la punta.
const MECHEROS = { 'vn-fumando-mechero': [0.54, 0.45] };
const ASIENTO = 600;
const SENTADO = 0.66; // parte del cuerpo normal que asoma por encima del cojín

// ---------- La calada por niveles de epicidad ----------
// Los nombres, juntos para cambiarlos fácil («Snoop Dogo» es una parodia: nunca el nombre real).
const NOMBRES_CALADA = ['Bien', 'Buena', 'Muy buena', 'Épica', 'Leyenda', 'Snoop Dogo', '420'];
// Franjas anidadas alrededor del centro de la barra (70 de 100): `mitad` = lo que mide a cada lado.
// `sube` = colocón que da (se multiplica por la potencia del porro), `monchis` = premio extra, `ocupado` =
// lo que dura su animación (nadie da otra calada encima) y `freno` = cuánto se frena la barra dentro de la
// franja (cuanto más épica, más tiempo para clavarla: la de 420 sigue siendo una rayita, pero se puede).
const CENTRO_CALADA = 70;
const NIVELES_CALADA = [
  { id: 'bien', nombre: NOMBRES_CALADA[0], mitad: 15, color: 0x7ee081, sube: 9, monchis: 0, ocupado: 0.9, freno: 1 },
  { id: 'buena', nombre: NOMBRES_CALADA[1], mitad: 11.5, color: 0x5adceb, sube: 10, monchis: 0, ocupado: 1.7, freno: 1 },
  { id: 'muybuena', nombre: NOMBRES_CALADA[2], mitad: 8.5, color: 0x4d8bff, sube: 12, monchis: 1, ocupado: 2.4, freno: 1 },
  { id: 'epica', nombre: NOMBRES_CALADA[3], mitad: 6, color: 0xb68cff, sube: 15, monchis: 2, ocupado: 3.1, freno: 0.6 },
  { id: 'leyenda', nombre: NOMBRES_CALADA[4], mitad: 4, color: 0xff5fa2, sube: 19, monchis: 4, ocupado: 3.4, freno: 0.45 },
  { id: 'snoop', nombre: NOMBRES_CALADA[5], mitad: 2.4, color: 0xff9a3c, sube: 24, monchis: 7, ocupado: 3.8, freno: 0.32 },
  { id: '420', nombre: NOMBRES_CALADA[6], mitad: 1.1, color: 0xffd23f, sube: 32, monchis: 15, ocupado: 4.4, freno: 0.3 },
];
// Frases por nivel y mundo (día = normal, noche = humo): la sensación se ve, nunca se nombra la sustancia.
const FRASES_CALADA = {
  bien: {
    normal: ['Qué bien sienta esto.', 'Ahí va. Despacito.', 'Y el mundo, un poquito más blando.', 'Mmm. Esto sí que es una pausa.'],
    humo: ['Ya se nota.', 'Esto empieza a tener color.', 'Suave, suave…', 'Que nadie me hable un minuto.'],
  },
  buena: {
    normal: ['Un aro. Redondo y todo.', 'El humo sabe geometría.', 'Eso sí que tiene gracia.', 'Ahí va una redonda.'],
    humo: ['Ni a escuadra lo haces mejor.', '¡Mira qué aro! Alguien aplauda.', 'Redondo como las promesas.', 'El humo hoy tiene forma.'],
  },
  muybuena: {
    normal: ['Uno, dos, tres… ¡y otro!', 'Eso no lo hace cualquiera.', 'Aros en cadena. Calma, calma.', 'El humo se organiza solo.'],
    humo: ['Esto ya es un tren de aros.', 'Se pasan el testigo entre ellos.', 'El humo hace cola en el techo.', '¡Que los cuente alguien!'],
  },
  epica: {
    normal: ['Eso ha salido con intención.', 'El humo ha dibujado. Sin permiso.', 'Lo juro: lo he visto yo también.', 'Esto es arte. Con mala ventilación.'],
    humo: ['El humo me ha firmado un dibujo.', 'Ni lo planeé. Ni lo repito.', 'Hay obras así en los museos. Peor ventiladas.', 'Eso… eso estaba escrito en el techo.'],
  },
  leyenda: {
    normal: ['Se me ha caído el cielo… para bien.', '¿Habéis visto eso? Yo tampoco.', 'Ahora sí que no sé dónde estoy.', 'Que alguien lo apunte. Que yo no puedo.'],
    humo: ['La sala entera se ha ido de viaje.', 'Esto ya lo cuentan en el barrio.', 'Hasta las paredes me han mirado.', 'Los de arriba también lo han oído.'],
  },
  snoop: {
    normal: ['Todo despacito. Hasta el reloj.', 'Suave como un sofá recién estrenado.', 'Nadie corre. Nadie debe correr.', 'Las gafas me las ha traído el humo.'],
    humo: ['Cámara lenta. Y con buen gusto.', 'Esto lleva banda sonora propia.', 'Llevo las gafas y el mundo, de serie.', 'Tranqui. El humo manda.'],
  },
  420: {
    normal: ['A esta hora… precisamente a esta hora.', 'Se ha parado el reloj. Qué bien sienta.', 'Ya puedo retirarme. Con honores.', 'Eso no vuelve a salir. O sí. Otra vez.'],
    humo: ['¡CUATRO-VEINTE! Que lo sepa el barrio.', 'El humo hoy ha hecho historia.', 'Nunca lo he visto igual. Nadie.', 'Enmarcad esta calada.'],
  },
};
// Frases sueltas que flotan en el humo mientras se fuma (sin venir a cuento, con cuentagotas).
const FRASES_HUMO = {
  normal: ['Respira. Y otra vez.', 'Nadie tiene prisa.', 'El sofá lo sabe todo.', 'Mañana ya veremos.', 'Qué bien se está aquí.'],
  humo: ['Todo vibra un poquito.', 'El techo respira.', 'Esto ya es otra altura.', 'Suena una canción que no existe.', 'El humo dibuja solo.'],
};
// Dónde sujeta Vuper el porro en cada dibujo: [boquilla] y [brasa] como fracción de la imagen (medido con rejilla).
// Si la pose no enseña el porro (mofletes llenos), no hay entrada y no se dibuja.
const AGARRE = {
  'vuper-fumando': [[0.49, 0.59], [0.85, 0.52]], 'vuper-calada': [[0.60, 0.62], [0.90, 0.70]], 'vuper-tos': [[0.83, 0.665], [0.97, 0.775]],
  'vn-fumando-calada': [[0.40, 0.42], [0.53, 0.31]], 'vn-fumando-aguanta': [[0.37, 0.46], [0.47, 0.36]],
  'vn-fumando-mechero': [[0.70, 0.37], [0.54, 0.33]], 'vn-fumando-tos': [[0.87, 0.76], [0.99, 0.82]],
};
// Figuras que dibuja el humo en la calada épica.
const FIGURAS_HUMO = [
  { id: 'corazon', nombre: 'un corazón', tinte: 0xffc2dc }, { id: 'estrella', nombre: 'una estrella', tinte: 0xfff3a0 },
  { id: 'eme', nombre: 'la M', tinte: 0xd6c2ff }, { id: 'infinito', nombre: 'el infinito', tinte: 0xbdf4ff },
];
// Garabatos que dibuja el humo de vez en cuando por su cuenta.
const GARABATOS = ['espiral', 'ondas', 'exclamacion', 'estrella', 'corazon', 'infinito'];

// Puntos (de -1 a 1) a lo largo de una figura, repartidos por igual en n pasos.
function puntosFigura(id, n) {
  const muestrear = (poly, cerrar) => {
    const seg = [];
    let total = 0;
    const lista = cerrar ? poly.concat([poly[0]]) : poly;
    for (let i = 0; i < lista.length - 1; i++) { const l = Math.hypot(lista[i + 1][0] - lista[i][0], lista[i + 1][1] - lista[i][1]); seg.push(l); total += l; }
    const pts = [];
    for (let k = 0; k < n; k++) {
      let d = total * k / (cerrar ? n : n - 1), i = 0;
      while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
      const f = seg[i] ? Math.min(1, d / seg[i]) : 0;
      pts.push([lista[i][0] + (lista[i + 1][0] - lista[i][0]) * f, lista[i][1] + (lista[i + 1][1] - lista[i][1]) * f]);
    }
    return pts;
  };
  const pts = [];
  if (id === 'corazon') {
    for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; pts.push([16 * Math.pow(Math.sin(t), 3) / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]); }
    return pts;
  }
  if (id === 'estrella') {
    const v = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.42 : 1; v.push([Math.cos(a) * r, Math.sin(a) * r]); }
    return muestrear(v, true);
  }
  if (id === 'eme') return muestrear([[-0.9, 0.9], [-0.9, -0.9], [0, 0.1], [0.9, -0.9], [0.9, 0.9]], false);
  if (id === 'infinito') { for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; pts.push([Math.cos(t), Math.sin(2 * t) / 2]); } return pts; }
  if (id === 'espiral') { for (let i = 0; i < n; i++) { const t = i / n; const a = t * Math.PI * 5; pts.push([Math.cos(a) * t, Math.sin(a) * t]); } return pts; }
  if (id === 'ondas') { for (let i = 0; i < n; i++) { const x = -1 + 2 * i / (n - 1); pts.push([x, Math.sin(x * 7) * 0.3]); } return pts; }
  // exclamación: la raya y el punto.
  const raya = muestrear([[0, -1], [0, 0.35]], false).slice(0, n - 2);
  return raya.concat([[0, 0.8], [0, 0.82]]);
}

class Fumar extends Phaser.Scene {
  constructor() { super('Fumar'); }

  create(datos) {
    this.datos = datos || {};
    const calidad = this.datos.calidad ?? 60;
    // El tipo de liado (liar.js) cambia cuánto dura, cuánto sube y cuánto margen da; sin tipo = recto clásico.
    const tipoId = (this.datos.tipo && TIPOS_LIAR[this.datos.tipo]) ? this.datos.tipo : ((this.datos.porro && TIPOS_LIAR[this.datos.porro.tipo]) ? this.datos.porro.tipo : 'recto');
    this.tipo = tipoId;
    const T = TIPOS_LIAR[tipoId];
    this.potencia = (0.6 + calidad / 250) * T.sube;
    this.porro = (60 + calidad * 0.6) * T.dur;
    this.porroMax = this.porro;
    this.costePase = 10 * T.pase;
    this.inhala = 0;
    this.combo = 0;
    this.perfectas = 0;
    this.pases = 0;
    this.subido = 0;
    this.ocupado = 2.4;      // empieza encendiendo
    this.blancasoFumo = false;
    this.mundo = this.datos.mundo === 'normal' ? 'normal' : 'humo';
    this.acabado = false;
    // Phaser reutiliza la escena: lo de la sesión anterior no puede quedarse puesto.
    this.porroFuera = false;
    this.rompiendo = false;
    this.aguantando = false;
    this.cambiado = false;
    this.encendido = false;
    this.nivelVisto = -1;
    this.mejorNivel = -1;
    this.bonoMonchis = 0;
    this.zoomExtra = 1;
    this.ritmo = 0;
    this.fx = [];
    this.bolsas = {};
    this.ultimaBolsa = {};
    this.fraseViva = null;
    this.time.timeScale = 1;
    this.tweens.timeScale = 1;
    this.events.once('shutdown', () => { this.time.timeScale = 1; this.tweens.timeScale = 1; });
    // El porro que has liado (forma y calidad); la calidad del liado da más o menos margen en la calada.
    this.porroDatos = (this.datos.porro && FORMAS_PORRO[this.datos.porro.forma]) ? this.datos.porro : porroActual(this.datos.calidad);
    this.margen = CALIDADES_PORRO[this.porroDatos.calidad].margen * T.margen;

    // Con quién te lo fumas: lo elegido en el selector (liar.js), si no lo último, si no los de siempre. Siempre válido.
    this.compas = compasValidos(this.datos.compas || ESTADO.sofaCompas, this.mundo);
    ESTADO.sofaCompas = this.compas.slice();
    // Modificadores pequeños que suman los acompañantes (ver COMPAS[...].mod).
    this.m = {
      lento: this.compas.includes('pompa') ? 0.8 : 1,      // la barra sube más despacio y el porro dura más
      nube: this.compas.includes('pompa') ? 1.5 : 1,        // una nube gorda bien aguantada puntúa más
      premio: this.compas.includes('cotine') ? 1.25 : 1,    // más monchis…
      hambre: this.compas.includes('cotine') ? 10 : 0,      // …y más hambre al levantarte
      peticion: this.compas.includes('perico') ? 2 : 1,     // sus peticiones valen el doble
    };
    // Cómo echar el humo: lo último que elegiste si sigue desbloqueado, si no «Sin más».
    this.forma = (ESTADO.sofaForma && FORMAS_HUMO[ESTADO.sofaForma] && formaDesbloqueada(ESTADO.sofaForma)) ? ESTADO.sofaForma : 'libre';
    this.habilidad = null;
    this.cola = { esp: false, izq: false, der: false };
    this.antesPulsa = false;
    this.peticion = null;
    this.tPedir = 13 + Math.random() * 5;
    this.peticionesPedidas = 0;
    this.peticionesOk = 0;
    this.formasHechas = {};
    this.puntosForma = 0;
    this.bonoCompas = 0;
    this.risaHasta = 0;
    this.chisteHasta = 0;
    this.turnoEvento = 0;
    this.chips = [];
    this.fumadasAntes = stat('fumadas');

    this.bg = fondo(this, this.mundo === 'humo' ? 'bg-sofa' : 'bgn-sofa');
    // Ambiente: humo que se va quedando en la sala.
    this.ambiente = [0, 1, 2, 3].map(i => {
      const h = this.add.image(200 + i * 300, 170 + (i % 2) * 80, 'tex-niebla').setScale(1.8 + i * 0.25).setAlpha(0).setDepth(4);
      this.tweens.add({ targets: h, x: h.x + 120, duration: 9000 + i * 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return h;
    });
    this.velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.morado, 0).setDepth(5);

    this.actores = {};
    // Plazas: con dos acompañantes, uno a cada lado; con uno solo, a la derecha.
    const plaza = {};
    if (this.compas.length === 1) plaza[this.compas[0]] = SOFA_X.der;
    else { plaza[this.compas[0]] = SOFA_X.izq; plaza[this.compas[1]] = SOFA_X.der; }
    [...this.compas, 'vuper'].forEach(id => {
      const img = this.add.image(id === 'vuper' ? SOFA_X.vuper : plaza[id], ASIENTO, 'vuper').setDepth(id === 'vuper' ? 11 : 10);
      this.actores[id] = { id, img, x: img.x, pose: 'base', hincha: 1 };
    });
    this.ponerMundo();
    this.porroMano = this.add.image(0, 0, this.texturaDelPorro()).setDepth(11.5).setVisible(false);

    this.marcadores();
    this.teclas = this.input.keyboard.addKeys('SPACE,P');
    this.dedo = false;
    this.input.on('pointerdown', (_p, sobre) => { if (!sobre.length) { this.dedo = true; this.cola.esp = true; } });
    this.input.on('pointerup', () => { this.dedo = false; });
    this.input.keyboard.on('keydown-SPACE', e => { if (!e.repeat) this.cola.esp = true; });
    ['LEFT', 'A'].forEach(k => this.input.keyboard.on(`keydown-${k}`, e => { if (!e.repeat) this.cola.izq = true; }));
    ['RIGHT', 'D'].forEach(k => this.input.keyboard.on(`keydown-${k}`, e => { if (!e.repeat) this.cola.der = true; }));
    ORDEN_FORMAS.forEach((f, i) => this.input.keyboard.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'][i]}`, () => this.elegirForma(f)));
    this.input.keyboard.on('keydown-P', () => this.pasar());
    this.input.keyboard.on('keydown-ESC', () => this.terminar());

    this.time.addEvent({ delay: 7500, loop: true, callback: () => this.charlaSofa() });
    this.time.addEvent({ delay: 14000, loop: true, callback: () => this.suceso() });
    this.time.addEvent({ delay: 6500, loop: true, callback: () => this.garabato() });
    this.time.addEvent({ delay: 9000, loop: true, callback: () => this.eventoCompas() });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.vigilarPeticion() });
    entrar(this, datos);
    this.encender();
  }

  marcadores() {
    texto(this, 162, 40, 'PORRO', 22, COLOR.crema).setOrigin(1, 0.5).setDepth(50); // etiquetas pegadas a la barra por la derecha (en el móvil «COLOCÓN» se cortaba)
    this.add.rectangle(330, 40, 316, 24, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(50);
    this.barraPorro = this.add.rectangle(176, 40, 308, 16, 0xfff6e8).setOrigin(0, 0.5).setDepth(50);
    this.brasaBarra = this.add.circle(176 + 308, 40, 9, 0xff7a2f).setDepth(51);
    texto(this, 162, 80, 'COLOCÓN', 22, COLOR.crema).setOrigin(1, 0.5).setDepth(50);
    this.add.rectangle(330, 80, 316, 24, HEX.tinta).setStrokeStyle(4, HEX.crema).setDepth(50);
    this.barraColocon = this.add.rectangle(176, 80, 0, 16, 0xb68cff).setOrigin(0, 0.5).setDepth(50);
    this.textoCombo = texto(this, 1100, 44, '', 30, COLOR.amarillo).setDepth(50);
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(HEX.tinta, 0.85).fillRoundedRect(1150, 200, 56, 340, 16);
    // Franjas anidadas: la más ancha es «Bien» y la más fina, «420» (una rayita dorada que brilla).
    NIVELES_CALADA.forEach(N => g.fillStyle(N.color, 0.95).fillRect(1160, 530 - 3.2 * (CENTRO_CALADA + N.mitad * this.margen), 36, 6.4 * N.mitad * this.margen));
    const oro = this.add.rectangle(1178, 530 - 3.2 * CENTRO_CALADA, 46, 12, 0xffd23f, 0.5).setDepth(50);
    this.tweens.add({ targets: oro, alpha: 0.15, scaleY: 1.8, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // Leyenda de los niveles a la izquierda de la barra (de fuera a dentro).
    NIVELES_CALADA.forEach((N, i) => {
      this.add.rectangle(1132, 214 + i * 22, 12, 12, N.color).setStrokeStyle(2, HEX.tinta).setDepth(50);
      texto(this, 1122, 214 + i * 22, N.nombre, 15, COLOR.crema).setOrigin(1, 0.5).setAlpha(0.8).setDepth(50);
    });
    this.etiquetaNivel = texto(this, 1140, 172, '', 30, COLOR.crema).setDepth(52);
    // El porro que has liado, con su nombre.
    this.hudPorro = this.add.image(112, 134, this.texturaDelPorro()).setScale(0.15).setDepth(50);
    this.nombreHud = texto(this, 170, 134, nombreDePorro(this.porroDatos), 18, COLOR.crema).setOrigin(0, 0.5).setDepth(50);
    this.barraCalada = this.add.rectangle(1178, 530, 28, 0, 0xffffff).setOrigin(0.5, 1).setDepth(51);
    texto(this, 1178, 566, 'Calada', 18, COLOR.crema).setDepth(50);
    this.textoAyuda = texto(this, ANCHO / 2, 698, MOVIL ? 'MANTÉN = calada · suelta en el centro de la barra' : 'MANTÉN = calada · suelta en el centro de la barra · P = pásalo', 22, COLOR.crema).setDepth(50);
    this.crearChips();
    this.botones = [
      boton(this, 150, MOVIL ? 636 : 640, MOVIL ? 'Pásalo' : 'Pásalo (P)', () => this.pasar(), { ancho: 220, alto: MOVIL ? 70 : 60, tam: 22, color: HEX.verde }).setDepth(60),
      boton(this, ANCHO - 130, MOVIL ? 636 : 640, MOVIL ? 'Levantarse' : 'Levantarse (Esc)', () => this.terminar(), { ancho: 220, alto: MOVIL ? 68 : 56, tam: 20, color: HEX.crema }).setDepth(60),
    ];
  }

  // ---------- Actores ----------

  ponerMundo() {
    this.bg.setTexture(this.mundo === 'humo' ? 'bg-sofa' : 'bgn-sofa');
    Object.values(this.actores).forEach(a => this.pose(a.id, a.pose === 'base' ? 'base' : a.pose));
  }

  // Pone la pose con su tamaño; en el mundo normal, sentado (sin piernas, el cojín las tapa).
  pose(id, nombre, ms) {
    if (this.rompiendo && id === 'vuper') return;
    // Mientras el porro lo tiene otro, Vuper no puede tener uno en la mano.
    if (id === 'vuper' && this.porroFuera && nombre !== 'pasar') nombre = 'sin';
    const a = this.actores[id];
    const lista = POSES_SOFA[this.mundo][id];
    const clave = lista[nombre] || lista.base;
    a.pose = nombre;
    a.img.setTexture(clave);
    const normal = this.mundo === 'normal';
    const h = a.img.height;
    a.esc = SITIO[id].alto[this.mundo] / (normal ? h * SENTADO : h);
    if (normal) a.img.setOrigin(0.5, SENTADO).setCrop(0, 0, a.img.width, h * SENTADO);
    else a.img.setOrigin(0.5, 1).setCrop();
    if (a.vuelta) a.vuelta.remove();
    if (ms) a.vuelta = this.time.delayedCall(ms, () => { if (!this.acabado) this.pose(id, 'base'); });
    // Cambio de pose con rebote.
    a.rebote = 1.12;
  }

  boca(id) {
    const a = this.actores[id];
    const img = a.img;
    const visible = img.displayHeight * (this.mundo === 'normal' ? SENTADO : 1);
    const arriba = img.y - visible;
    return this.mundo === 'normal'
      ? { x: img.x + img.displayWidth * 0.06, y: arriba + img.displayHeight * 0.3 }
      : { x: img.x + img.displayWidth * 0.12, y: arriba + visible * 0.6 };
  }

  puntaPorro(id = 'vuper', tabla = PUNTAS) {
    const img = this.actores[id].img;
    const f = tabla[img.texture.key];
    if (!f) return null;
    return {
      x: img.x + (f[0] - img.originX) * img.displayWidth * (img.flipX ? -1 : 1),
      y: img.y + (f[1] - img.originY) * img.displayHeight,
    };
  }

  // ---------- Bucle ----------

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.animarActores(dt);
    if (this.acabado) return;
    this.ocupado -= dt;
    if (this.habilidad) this.actualizarHabilidad(dt);
    else { this.cola.esp = false; this.cola.izq = false; this.cola.der = false; }
    const pulsa = (this.teclas.SPACE.isDown || this.dedo) && this.ocupado <= 0 && !this.habilidad;

    if (pulsa) {
      if (this.inhala === 0) {
        this.pose('vuper', 'calada');
        this.sonidoCalada = sfx(this, 'calada', { volume: 0.7 });
      }
      // Dentro de las franjas buenas la barra se frena (cuanto más épica, más tiempo para clavarla).
      const nv0 = this.nivelDe(this.inhala);
      this.inhala += dt * 50 * this.m.lento * (nv0 >= 0 ? NIVELES_CALADA[nv0].freno : 1);
      // La risa de Lasslow te mueve el pulso: la barra tiembla mientras se parte.
      if (this.risaHasta > this.time.now) this.inhala = Math.max(1, this.inhala + Math.cos(this.time.now / 60) * 60 * dt);
      const nv = this.nivelDe(this.inhala);
      if (nv !== this.nivelVisto) this.verNivel(nv);
      this.porro -= dt * 6 * this.m.lento;
      if (Math.random() < 0.3) this.chispa();
      if (this.inhala >= 100) this.tos();
    } else if (this.inhala > 0) {
      this.soltarCalada();
    }

    this.barraCalada.setSize(28, 320 * Math.min(1, this.inhala / 100)); // setSize recoloca el ancla: crece hacia arriba
    const nvB = this.nivelDe(this.inhala);
    this.barraCalada.fillColor = nvB >= 0 ? NIVELES_CALADA[nvB].color : this.inhala > CENTRO_CALADA + 15 * this.margen ? HEX.rojo : 0xffffff;
    const f = Math.max(0, this.porro / this.porroMax);
    this.barraPorro.width = 308 * f;
    this.brasaBarra.setPosition(176 + 308 * f, 40).setScale(this.inhala > 0 ? 1.3 + Math.random() * 0.3 : 1);
    const colocon = Math.min(100, ESTADO.colocon + this.subido);
    this.barraColocon.width = 308 * colocon / 100;

    // El mundo se ondula y el humo se queda en la sala.
    const k = colocon / 100;
    this.cameras.main.setRotation(Math.sin(this.time.now / 1400) * 0.012 * k);
    this.cameras.main.setZoom((1 + Math.sin(this.time.now / 900) * 0.01 * k) * this.zoomExtra);
    this.velo.fillAlpha = 0.1 * k;
    const cargado = Math.min(0.45, (this.subido + this.pases * 4) / 90);
    this.ambiente.forEach(h => h.setAlpha(cargado));

    if (this.porro <= 0) this.terminar();
  }

  // Respirar, hincharse con la calada, temblar aguantando y rebotar al cambiar de pose.
  animarActores(dt) {
    const t = this.time.now;
    Object.values(this.actores).forEach((a, i) => {
      a.rebote = Phaser.Math.Linear(a.rebote || 1, 1, Math.min(1, dt * 10));
      let sx = 1 + 0.015 * Math.sin(t / 420 + i);
      let sy = 1 - 0.015 * Math.sin(t / 420 + i);
      let ang = 0;
      let dx = 0;
      if (a.id === 'vuper') {
        const hincha = 1 + Math.min(this.inhala, 100) / 100 * 0.14;
        a.hincha = Phaser.Math.Linear(a.hincha, this.aguantando ? 1.16 : hincha, Math.min(1, dt * 8));
        sx *= a.hincha;
        sy *= 1 + (a.hincha - 1) * 0.6;
        ang = -this.inhala / 100 * 5;
        if (this.aguantando) dx = Math.sin(t / 25) * 2.5;
        if (a.pose === 'tos') { dx = Math.sin(t / 30) * 6; ang = Math.sin(t / 60) * 6; }
      } else if (a.pose === 'riendo') {
        sy *= 1 + Math.abs(Math.sin(t / 90)) * 0.05;
        ang = Math.sin(t / 110) * 4;
      }
      a.img.setScale(a.esc * sx * a.rebote, a.esc * sy / a.rebote);
      a.img.setAngle(ang);
      a.img.x = a.x + dx;
      a.img.y = ASIENTO - (this.ritmo ? Math.abs(Math.sin(t / 210)) * 9 * this.ritmo : 0);
    });
    this.colocarPorro();
  }

  // ---------- El porro de Vuper (forma y calidad del liado) ----------

  texturaDelPorro() { return texturaPorro(this, this.porroDatos.forma, this.mundo, this.porroDatos.calidad); }

  // Cambia el acabado del porro (papel real / neón) cuando cambia el mundo.
  actualizarPorro() {
    const k = this.texturaDelPorro();
    this.porroMano.setTexture(k);
    if (this.hudPorro) this.hudPorro.setTexture(k);
  }

  // Pone el porro en la mano de Vuper, de la boquilla a la brasa, según el dibujo que lleve puesto.
  colocarPorro() {
    const o = this.porroMano;
    if (!o) return;
    const img = this.actores.vuper.img;
    const ag = AGARRE[img.texture.key];
    if (!ag || !this.encendido || this.porroFuera || this.rompiendo || this.acabado) { o.setVisible(false); return; }
    const c = Math.cos(img.rotation), s = Math.sin(img.rotation);
    const pt = f => {
      const dx = (f[0] - img.originX) * img.displayWidth, dy = (f[1] - img.originY) * img.displayHeight;
      return { x: img.x + dx * c - dy * s, y: img.y + dx * s + dy * c };
    };
    const m = pt(ag[0]), b = pt(ag[1]);
    const dx = b.x - m.x, dy = b.y - m.y;
    const largo = FORMAS_PORRO[this.porroDatos.forma].largo * 2;
    // La textura tiene la brasa a la izquierda: si la brasa cae a la derecha, se voltea.
    o.setVisible(true).setPosition((m.x + b.x) / 2, (m.y + b.y) / 2).setFlipX(dx > 0);
    o.setRotation(dx > 0 ? Math.atan2(dy, dx) : Math.atan2(-dy, -dx));
    o.setScale(Math.hypot(dx, dy) / largo * 1.12);
  }

  // Etiqueta de la franja en la que va la barra mientras mantienes.
  verNivel(nv) {
    const antes = this.nivelVisto;
    this.nivelVisto = nv;
    if (nv < 0) { this.etiquetaNivel.setText(''); return; }
    const N = NIVELES_CALADA[nv];
    this.etiquetaNivel.setText(N.nombre).setColor(this.cssColor(N.color)).setScale(1.5);
    this.tweens.add({ targets: this.etiquetaNivel, scale: 1, duration: 160, ease: 'Back.out' });
    if (nv > antes && nv > 0) sfx(this, 'pop', { volume: 0.25, rate: 0.9 + nv * 0.12 });
  }

  // ---------- Encender ----------

  encender() {
    this.pose('vuper', 'mechero');
    let b = this.puntaPorro() || this.boca('vuper');
    const llama = this.add.container(b.x, b.y - 8).setDepth(30).setVisible(false);
    const fuera = this.add.ellipse(0, 0, 18, 34, 0xffb43a);
    const dentro = this.add.ellipse(0, 4, 8, 18, 0xfff3a0);
    llama.add([fuera, dentro]);
    // Se coloca cuando la pose ya está quieta (el cambio de pose rebota y descuadraría la medida).
    const colocar = () => {
      b = this.puntaPorro() || this.boca('vuper');
      const m = this.puntaPorro('vuper', MECHEROS);
      if (!m) { llama.setPosition(b.x, b.y - 8).setAngle(0); return; }
      // La llama nace en el mechero y se tuerce hasta tocar la punta (se la chupa al encender).
      const largo = Math.max(24, Phaser.Math.Distance.Between(m.x, m.y, b.x, b.y));
      fuera.setSize(12, largo).setOrigin(0.5, 1).setPosition(0, 0);
      dentro.setSize(5, largo * 0.55).setOrigin(0.5, 1).setPosition(0, 2);
      fuera.geom.setSize(12, largo); dentro.geom.setSize(5, largo * 0.55);
      fuera.updateDisplayOrigin(); dentro.updateDisplayOrigin();
      llama.setPosition(m.x, m.y).setAngle(Phaser.Math.RadToDeg(Math.atan2(b.y - m.y, b.x - m.x)) + 90);
    };
    this.tweens.add({ targets: llama, scaleY: 1.12, scaleX: 0.85, duration: 90, yoyo: true, repeat: -1 });
    const t1 = texto(this, ANCHO / 2, 250, 'Enciende…', 40, COLOR.crema).setDepth(60);
    this.time.delayedCall(500, () => { colocar(); sfx(this, 'mechero-falla'); this.chispa(b.x, b.y); });
    this.time.delayedCall(1200, () => {
      colocar();
      sfx(this, 'mechero');
      llama.setVisible(true);
      this.chispa(b.x, b.y);
    });
    this.time.delayedCall(2100, () => {
      llama.destroy();
      t1.setText('¡Prende! MANTÉN para la primera calada');
      this.tweens.add({ targets: t1, alpha: 0, delay: 1600, duration: 400, onComplete: () => t1.destroy() });
      this.pose('vuper', 'base');
      this.encendido = true;
      this.voluta(b.x, b.y - 10, 0.08, false);
    });
  }

  chispa(x, y) {
    const p = x === undefined ? this.puntaPorro() : { x, y };
    if (!p) return;
    const ch = this.add.particles(p.x, p.y, 'miga', {
      speed: { min: 30, max: 120 }, scale: { start: 0.45, end: 0 }, lifespan: 380, tint: [0xff7a2f, 0xffd23f], emitting: false,
    }).setDepth(31);
    ch.explode(4);
    this.time.delayedCall(450, () => ch.destroy());
  }

  // ---------- Utilidades de los efectos ----------

  // Temporizador de la escena que se calla si ya se ha acabado la partida (nada sobrevive a la escena).
  en(ms, f) {
    return this.time.delayedCall(ms, () => { if (!this.acabado && this.sys && this.sys.isActive()) f(); });
  }

  // Apunta un objeto de efecto para destruirlo al terminar si sigue vivo.
  nuevo(o) { this.fx.push(o); return o; }

  limpiarFx() {
    this.cerrarHabilidad();
    this.time.timeScale = 1;
    this.tweens.timeScale = 1;
    this.ritmo = 0;
    this.zoomExtra = 1;
    this.fx.splice(0).forEach(o => { if (o && o.scene) { this.tweens.killTweensOf(o); o.destroy(); } });
    if (this.porroMano) this.porroMano.setVisible(false);
  }

  cssColor(hex) { return `#${hex.toString(16).padStart(6, '0')}`; }

  // Elige de una lista sin repetir hasta agotarla (y sin que la primera de la bolsa nueva sea la última de la vieja).
  bolsaItem(clave, lista) {
    const b = this.bolsas[clave] = this.bolsas[clave] || [];
    if (!b.length) {
      const nueva = Phaser.Utils.Array.Shuffle(lista.slice());
      if (nueva.length > 1 && nueva[nueva.length - 1] === this.ultimaBolsa[clave]) nueva.unshift(nueva.pop());
      this.bolsas[clave] = nueva;
    }
    const x = this.bolsas[clave].pop();
    this.ultimaBolsa[clave] = x;
    return x;
  }

  // Un pegote de humo de tamaño en píxeles (en el mundo normal es la niebla de fotos).
  puff(x, y, px, tinte = 0xf2eef8, alpha = 0.9, depth = 30) {
    const h = this.add.image(x, y, this.mundo === 'normal' ? 'tex-niebla' : 'humo').setTint(tinte).setAlpha(alpha).setDepth(depth);
    h.setScale(px / h.width);
    return this.nuevo(h);
  }

  // El humo dibuja una figura puff a puff (n pasos) y luego se deshace subiendo.
  trazar(figura, cx, cy, escala, tinte, { n = 26, px = 44, paso = 34 } = {}) {
    puntosFigura(figura, n).forEach(([x, y], i) => this.en(i * paso, () => {
      const h = this.puff(cx + x * escala, cy + y * escala, px * 0.4, tinte, 0, 30);
      const fin = h.scale * 2.5;
      this.tweens.add({ targets: h, alpha: 0.95, scale: fin, duration: 220, ease: 'Back.out' });
      this.tweens.add({ targets: h, alpha: 0, y: h.y - 30, delay: (n - i) * paso + 900, duration: 700, onComplete: () => h.destroy() });
    }));
  }

  // Frase que flota dentro del humo (un pegote detrás, sube despacio y se va).
  fraseHumo(x, y, str, { color = COLOR.crema, tam = 24 } = {}) {
    if (this.fraseViva && this.fraseViva.scene) return;
    const t = texto(this, 0, 0, str, tam, color, 360);
    const nube = this.puff(0, 0, Math.max(220, t.width + 90), 0xf2eef8, 0.5, 0);
    const c = this.nuevo(this.add.container(x, y, [nube, t]).setDepth(48).setAlpha(0).setScale(0.6));
    this.fraseViva = c;
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 320, ease: 'Back.out' });
    this.tweens.add({ targets: c, y: y - 110, duration: 2600, ease: 'Sine.out' });
    this.tweens.add({ targets: c, alpha: 0, delay: 2000, duration: 700, onComplete: () => c.destroy() });
  }

  // Frase del nivel (por mundo), sin repetir seguidas.
  fraseNivel(N, p, n) {
    const lista = FRASES_CALADA[N.id][this.mundo];
    this.fraseHumo(Phaser.Math.Clamp(p.x + 110, 300, ANCHO - 330), Math.max(180, p.y - 150), this.bolsaItem(`f_${N.id}_${this.mundo}`, lista), { color: this.cssColor(N.color), tam: 24 + n });
  }

  // Rótulo del nivel, más grande cuanto más épico.
  cartelNivel(N, n) {
    golpeTexto(this, ANCHO / 2, 170, N.nombre, this.cssColor(N.color), 32 + n * 4);
  }

  // Zoom corto de cámara (sube, aguanta y vuelve), sin pelearse con el vaivén del colocón.
  zoom(valor, subida, mantener) {
    this.tweens.add({ targets: this, zoomExtra: valor, duration: subida, hold: mantener, yoyo: true, ease: 'Sine.out' });
  }

  // Aro que sale de Vuper al ritmo (golpe de graves).
  onda(color = 0xff9a3c) {
    const v = this.actores.vuper.img;
    const r = this.nuevo(this.add.circle(v.x, v.y - v.displayHeight * 0.5, 40).setStrokeStyle(10, color, 0.9).setDepth(34));
    this.tweens.add({ targets: r, scale: 7, alpha: 0, duration: 700, ease: 'Quad.out', onComplete: () => r.destroy() });
  }

  // Gafas de sol (dibujadas con Graphics) que caerán sobre la cara de Vuper. Devuelve el contenedor con su `cy` de destino.
  gafas() {
    const v = this.actores.vuper.img;
    const normal = this.mundo === 'normal';
    const cx = v.x + v.displayWidth * (normal ? 0.02 : 0.04);
    const top = v.y - v.displayHeight * (normal ? SENTADO : 1);
    const cy = top + v.displayHeight * (normal ? 0.235 : 0.4);
    const ancho = v.displayWidth * (normal ? 0.5 : 0.62);
    const g = this.add.graphics();
    g.fillStyle(HEX.tinta, 1).fillRoundedRect(-124, -36, 108, 76, 28).fillRoundedRect(16, -36, 108, 76, 28).fillRect(-20, -20, 40, 13);
    g.lineStyle(11, HEX.tinta, 1).lineBetween(-122, -16, -146, -28).lineBetween(122, -16, 146, -28);
    g.fillStyle(0x39f0ff, 0.28).fillRoundedRect(-114, -28, 88, 58, 22).fillRoundedRect(26, -28, 88, 58, 22);
    g.fillStyle(0xffffff, 0.85).fillTriangle(-104, -22, -80, -22, -108, 12).fillTriangle(36, -22, 60, -22, 32, 12);
    g.fillStyle(0xffffff, 0.5).fillTriangle(-70, -22, -60, -22, -84, 12).fillTriangle(70, -22, 80, -22, 56, 12);
    const c = this.nuevo(this.add.container(cx, -120, [g]).setDepth(35).setScale(ancho / 290));
    c.cy = cy;
    return c;
  }

  // ---------- Calada ----------

  // Nivel (índice) de una calada soltada en `valor`, o -1 si no cae en ninguna franja. El liado da margen.
  nivelDe(valor) {
    for (let n = NIVELES_CALADA.length - 1; n >= 0; n--) if (Math.abs(valor - CENTRO_CALADA) <= NIVELES_CALADA[n].mitad * this.margen) return n;
    return -1;
  }

  soltarCalada() {
    const i = this.inhala;
    this.inhala = 0;
    this.nivelVisto = -1;
    this.etiquetaNivel.setText('');
    if (this.sonidoCalada) this.sonidoCalada.stop();
    if (i < 20) { this.pose('vuper', 'base'); return; }
    const nivel = this.nivelDe(i);
    const perfecta = nivel >= 0;
    const N = perfecta ? NIVELES_CALADA[nivel] : null;
    this.subido += (perfecta ? N.sube : 5) * this.potencia;
    // De día, la primera calada buena siempre hace efecto: te deja justo pasado el umbral del mundo humo.
    if (this.mundo === 'normal' && !this.cambiado) this.subido = Math.max(this.subido, UMBRAL_HUMO - ESTADO.colocon + 2);
    if (perfecta) {
      this.combo++;
      this.perfectas++;
      this.textoCombo.setText(nivel === 0 ? `¡Perfecta! x${this.combo}` : `¡${N.nombre}! x${this.combo}`);
      if (nivel > this.mejorNivel) this.mejorNivel = nivel;
      this.bonoMonchis += N.monchis;
      this.efectosCompasEnPerfecta();
      sumarStat(`calada_${N.id}`);
      this.pose('vuper', 'aguanta');
      this.aguantando = true;
      this.ocupado = N.ocupado;
      this.time.delayedCall(nivel >= 4 ? 1150 : 850, () => { this.aguantando = false; this.exhalar('vuper', true, nivel); });
    } else {
      this.combo = 0;
      this.textoCombo.setText('');
      this.exhalar('vuper', false);
    }
    // Primera calada buena en el mundo normal: hace efecto (antes se ve un trozo de su animación).
    if (this.mundo === 'normal' && !this.cambiado && ESTADO.colocon + this.subido >= UMBRAL_HUMO) {
      this.cambiado = true;
      this.ocupado = 3;
      this.time.delayedCall(perfecta ? Math.min(2800, 1000 + nivel * 450) : 800, () => this.haceEfecto());
    }
  }

  exhalar(id, perfecta, nivel) {
    if (this.acabado) return;
    // Con otra forma de echar el humo elegida, empieza su mini-habilidad (salvo en las calada tan buenas que el humo sale solo).
    if (id === 'vuper' && this.forma !== 'libre' && !(perfecta && nivel >= 4) && this.mundo === 'humo' && !this.rompiendo) {
      if (this.empezarForma(perfecta, nivel)) return;
    }
    this.pose(id, 'suelta', 1100);
    if (id === 'vuper') this.actores.vuper.hincha = 0.9; // se desinfla de golpe
    sfx(this, 'fup', { volume: 0.5 });
    const p = this.boca(id);
    if (id !== 'vuper') return this.soploCompa(id, p);
    if (!perfecta) {
      for (let i = 0; i < 5; i++) this.time.delayedCall(i * 60, () => this.voluta(p.x + 10, p.y, 0.2, true));
      if (id === 'vuper' && Math.random() < 0.22) this.en(500, () => this.fraseHumo(p.x + 120, p.y - 140, this.bolsaItem(`h_${this.mundo}`, FRASES_HUMO[this.mundo])));
      return;
    }
    const N = NIVELES_CALADA[nivel];
    this[`nivel_${N.id === '420' ? 'cuatroveinte' : N.id}`](p, N, nivel);
    // La frase del nivel flota en el humo cuando ya se ha visto lo principal.
    if (nivel > 0) this.en([0, 450, 600, 1000, 2300, 2500, 2900][nivel], () => this.fraseNivel(N, p, nivel));
    else if (Math.random() < 0.4) this.en(600, () => this.fraseNivel(N, p, 0));
  }

  // 0 · Bien: bocanada normal (y, de vez en cuando, una de las vistosas de siempre).
  nivel_bien(p) {
    for (let i = 0; i < 5; i++) this.time.delayedCall(i * 60, () => this.voluta(p.x + 10, p.y, 0.2, true));
    if (Math.random() < 0.3) {
      const e = Phaser.Utils.Array.GetRandom(['dragon', 'tornado', 'cascada', 'carita', 'corazon'].filter(x => x !== this.ultimoEstilo));
      this.ultimoEstilo = e;
      this[`humo_${e}`](p);
    }
    if (this.combo >= 2 || Math.random() < 0.5) this.en(800, () => this.reaccionar('bien'));
  }

  // 1 · Buena: un aro de humo y otro más pequeño que lo persigue.
  nivel_buena(p, N, n) {
    this.cartelNivel(N, n);
    sfx(this, 'pop', { volume: 0.4 });
    this.aro(p.x + 30, p.y - 10, 90, 1.3, false, 0xe8fbff);
    this.en(380, () => { sfx(this, 'pop', { volume: 0.3, rate: 1.3 }); this.aro(p.x + 30, p.y - 6, 90, 0.7, true, 0xe8fbff); });
    for (let i = 0; i < 3; i++) this.time.delayedCall(i * 80, () => this.voluta(p.x + 10, p.y, 0.16, true));
    if (Math.random() < 0.5) this.en(900, () => this.reaccionar('aros'));
  }

  // 2 · Muy buena: aros encadenados, cada uno más grande y de otro tono.
  nivel_muybuena(p, N, n) {
    this.cartelNivel(N, n);
    const tonos = [0xe8fbff, 0xbfe3ff, 0xd6c2ff, 0xffd6f0, 0xfff3c4];
    for (let i = 0; i < 5; i++) {
      this.en(i * 230, () => {
        sfx(this, 'pop', { volume: 0.3, rate: 0.9 + i * 0.12 });
        this.aro(p.x + 30 + i * 8, p.y - 10 - i * 4, 70 + i * 26, 1.2 - i * 0.12, i % 2 === 1, tonos[i]);
      });
    }
    this.en(1200, () => this.reaccionar('aros'));
  }

  // 3 · Épica: el humo dibuja una figura (corazón, estrella, la M, el infinito) con un zoom corto.
  nivel_epica(p, N, n) {
    this.cartelNivel(N, n);
    const fig = this.bolsaItem('figuras', FIGURAS_HUMO);
    this.zoom(1.04, 380, 600);
    sfx(this, 'whoosh', { volume: 0.4 });
    this.trazar(fig.id, p.x + 170, p.y - 200, 130, fig.tinte, { n: 28, px: 46 });
    this.en(1000, () => { sfx(this, 'campanita', { volume: 0.4 }); Comic.impacto(this, p.x + 170, p.y - 200, { tam: 60, profundidad: 36 }); });
    this.en(1300, () => golpeTexto(this, ANCHO / 2, 235, `Humo en forma de ${fig.nombre}`, this.cssColor(N.color), 30));
    this.en(1500, () => this.reaccionar(fig.id));
  }

  // ---------- Las caladas grandes: el humo hace el número ----------
  // Pedido del usuario (17/11/2026): las animaciones eran invasivas (pantalla tapada, temblores, cámara lenta) y
  // siempre iguales. Ahora lo que luce es el humo, encima del sofá y sin quitarte el mando, y cada nivel tiene
  // varias figuras que salen por turnos sin repetirse (bolsaItem).

  // Humo que recorre un camino: fn(k), con k de 0 a 1, devuelve [x, y]. Deja una estela que se deshace subiendo.
  camino(fn, { n = 30, ms = 1400, px = 46, tinte = 0xf2eef8, vida = 900, alfa = 0.9, depth = 30 } = {}) {
    for (let i = 0; i < n; i++) {
      this.en(i * ms / n, () => {
        const k = n > 1 ? i / (n - 1) : 0;
        const [x, y] = fn(k);
        const h = this.puff(Phaser.Math.Clamp(x, 30, ANCHO - 30), Math.max(40, y), px * 0.45, typeof tinte === 'function' ? tinte(k) : tinte, 0, depth);
        const s = h.scale;
        this.tweens.add({ targets: h, alpha: alfa, scale: s * 2.2, duration: 200, ease: 'Back.out' });
        this.tweens.add({ targets: h, alpha: 0, y: h.y - 34, scale: s * 3, delay: vida, duration: 650, onComplete: () => h.destroy() });
      });
    }
  }

  // Color del arcoíris suave para el humo (k de 0 a 1).
  iris(k, s = 0.42) {
    const c = Phaser.Display.Color.HSVToRGB(((k % 1) + 1) % 1, s, 1);
    return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
  }

  // Reparte n puntos a lo largo de una línea quebrada [[x, y], ...].
  muestrear(pts, n) {
    const largos = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
    const total = largos.reduce((a, b) => a + b, 0) || 1;
    return Array.from({ length: n }, (_, i) => {
      let d = (i / (n - 1)) * total, j = 0;
      while (j < largos.length - 1 && d > largos[j]) { d -= largos[j]; j++; }
      const k = largos[j] ? d / largos[j] : 0;
      return [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * k, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * k];
    });
  }

  // Nombre de la figura, pequeño, bajo el rótulo del nivel.
  subtitulo(str, N, ms = 900) {
    this.en(ms, () => golpeTexto(this, ANCHO / 2, 226, str, this.cssColor(N.color), 28));
  }

  // 4 · Leyenda: el humo cobra vida un momento.
  nivel_leyenda(p, N, n) {
    this.cartelNivel(N, n);
    sfx(this, 'whoosh', { volume: 0.45 });
    this.zoom(1.04, 300, 700);
    this[`leyenda_${this.bolsaItem('var_leyenda', ['serpiente', 'enhebrar', 'medusa', 'doble'])}`](p, N);
    this.compas.forEach(id => this.en(1100, () => this.pose(id, 'riendo', 1800)));
    this.en(1700, () => this.reaccionar('aros'));
  }

  leyenda_serpiente(p, N) {
    this.subtitulo('Una serpiente de humo', N);
    const x0 = p.x + 20, y0 = p.y - 10;
    const fn = k => [x0 + 400 * k, y0 - 170 * k - 44 * Math.sin(k * Math.PI * 5)];
    this.camino(fn, { n: 34, ms: 1500, px: 50, tinte: k => this.iris(0.78 + k * 0.2, 0.3), vida: 1100 });
    // La cabeza: dos ojos que miran al sofá y se deshacen con la estela.
    this.en(1500, () => {
      const [x, y] = fn(1);
      const cab = this.nuevo(this.add.container(Phaser.Math.Clamp(x, 60, ANCHO - 60), Math.max(70, y), [
        this.add.image(0, 0, this.mundo === 'normal' ? 'tex-niebla' : 'humo').setTint(0xf2eef8).setDisplaySize(84, 84),
        this.add.circle(-12, -4, 5, HEX.tinta), this.add.circle(10, -4, 5, HEX.tinta),
      ]).setDepth(31).setScale(0));
      sfx(this, 'pop', { volume: 0.4 });
      this.tweens.add({ targets: cab, scale: 1, duration: 220, ease: 'Back.out' });
      this.tweens.add({ targets: cab, angle: -14, duration: 260, yoyo: true, repeat: 1, delay: 300 });
      this.tweens.add({ targets: cab, alpha: 0, y: cab.y - 40, delay: 1200, duration: 500, onComplete: () => cab.destroy() });
    });
  }

  leyenda_enhebrar(p, N) {
    this.subtitulo('Tres aros por dentro de uno', N);
    const cx = Math.min(ANCHO - 150, p.x + 200), cy = Math.max(150, p.y - 150);
    const grande = this.nuevo(this.add.ellipse(cx, cy, 110, 170).setStrokeStyle(10, 0xffd6f0, 0.95).setDepth(30).setAlpha(0).setScale(0.3));
    this.tweens.add({ targets: grande, alpha: 1, scale: 1, duration: 420, ease: 'Back.out' });
    this.tweens.add({ targets: grande, alpha: 0, scale: 1.5, delay: 2500, duration: 600, onComplete: () => grande.destroy() });
    for (let i = 0; i < 3; i++) {
      this.en(650 + i * 480, () => {
        sfx(this, 'pop', { volume: 0.35, rate: 1 + i * 0.15 });
        const a = this.nuevo(this.add.ellipse(p.x + 30, p.y - 10, 26, 40).setStrokeStyle(6, [0xe8fbff, 0xd6c2ff, 0xfff3c4][i], 0.95).setDepth(31));
        this.tweens.add({ targets: a, x: cx + (cx - p.x - 30), y: cy + (cy - p.y + 10), scale: 2.1, alpha: 0, duration: 1300, ease: 'Sine.out', onComplete: () => a.destroy() });
        this.en(560, () => { if (grande.scene) this.tweens.add({ targets: grande, scaleX: 1.14, scaleY: 0.94, duration: 110, yoyo: true }); });
      });
    }
  }

  leyenda_medusa(p, N) {
    this.subtitulo('Una medusa de humo', N);
    const cx = Math.min(ANCHO - 170, p.x + 170), cy = Math.max(170, p.y - 190), r = 86;
    this.camino(k => [cx + Math.cos(Math.PI + k * Math.PI) * r, cy + Math.sin(Math.PI + k * Math.PI) * r * 0.8], { n: 16, ms: 480, px: 58, tinte: 0xe6d8ff, vida: 1900 });
    for (let t = 0; t < 5; t++) {
      const x0 = cx - r + 12 + t * ((r * 2 - 24) / 4), fase = t * 1.3;
      this.en(520 + t * 70, () => this.camino(k => [x0 + Math.sin(k * 7 + fase) * 12, cy + 6 + k * 150], { n: 12, ms: 900, px: 26, tinte: t % 2 ? 0xffc2dc : 0xcdb4ff, vida: 800, alfa: 0.8 }));
    }
  }

  leyenda_doble(p, N) {
    const [a, b] = Phaser.Utils.Array.Shuffle(FIGURAS_HUMO.slice());
    this.subtitulo(`${a.nombre[0].toUpperCase()}${a.nombre.slice(1)} dentro de ${b.nombre}`, N, 1300);
    const cx = Math.min(ANCHO - 190, p.x + 180), cy = Math.max(190, p.y - 200);
    this.trazar(a.id, cx, cy, 62, a.tinte, { n: 20, px: 34, paso: 28 });
    this.en(650, () => this.trazar(b.id, cx, cy, 150, b.tinte, { n: 30, px: 44, paso: 28 }));
    this.en(1500, () => sfx(this, 'campanita', { volume: 0.4 }));
  }

  // 5 · Snoop Dogo: despacio y con estilo.
  nivel_snoop(p, N, n) {
    this.cartelNivel(N, n);
    sfx(this, 'sting', { volume: 0.4 });
    this[`snoop_${this.bolsaItem('var_snoop', ['gafas', 'helice', 'niebla', 'ochos'])}`](p, N);
    this.en(1300, () => this.compas.forEach(id => this.pose(id, 'riendo', 1500)));
    this.en(2200, () => this.reaccionar('aros'));
  }

  // Las gafas de sol y cuatro aros perezosos, uno por golpe de bajo.
  snoop_gafas(p, N) {
    this.subtitulo('Con las gafas puestas', N);
    const g = this.gafas();
    this.tweens.add({ targets: g, y: g.cy, duration: 650, ease: 'Bounce.out' });
    this.en(660, () => sfx(this, 'bonk', { volume: 0.45 }));
    for (let b = 0; b < 4; b++) {
      this.en(800 + b * 430, () => {
        sfx(this, 'bonk', { volume: 0.22, rate: 0.7 });
        this.aro(p.x + 30, p.y - 10, 70 + b * 30, 1 + b * 0.25, false, [0xffb3d9, 0xffd9a0, 0xd6c2ff, 0xbdf4ff][b]);
        this.compas.forEach(id => { this.actores[id].rebote = 1.06; });
      });
    }
    this.en(2700, () => this.tweens.add({ targets: g, y: -160, alpha: 0, duration: 500, ease: 'Back.in', onComplete: () => g.destroy() }));
  }

  // Dos hilos de humo que suben enroscados.
  snoop_helice(p, N) {
    this.subtitulo('Doble hélice', N);
    const x0 = p.x + 90, y0 = p.y - 6;
    [[0, 0xff9ad0], [Math.PI, 0xcdb4ff]].forEach(([fase, tinte]) => {
      this.camino(k => [x0 + Math.sin(k * Math.PI * 6 + fase) * (26 + 56 * k), y0 - 300 * k], { n: 36, ms: 1900, px: 36, tinte, vida: 900 });
    });
  }

  // Niebla baja que se derrama por el sofá hacia los dos lados.
  snoop_niebla(p, N) {
    this.subtitulo('Niebla baja', N);
    const v = this.actores.vuper.img;
    for (let i = 0; i < 16; i++) {
      this.en(i * 110, () => {
        const lado = i % 2 ? 1 : -1;
        const h = this.puff(v.x + lado * 20, ASIENTO - 30 + Phaser.Math.Between(-10, 14), 90, i % 3 ? 0xf2eef8 : 0xe6d8ff, 0, 29);
        this.tweens.add({ targets: h, alpha: 0.6, duration: 300 });
        this.tweens.add({ targets: h, x: v.x + lado * Phaser.Math.Between(260, 560), scale: h.scale * 2.6, duration: 2500, ease: 'Sine.out' });
        this.tweens.add({ targets: h, alpha: 0, delay: 1700, duration: 800, onComplete: () => h.destroy() });
      });
    }
    this.en(900, () => this.compas.forEach(id => { this.actores[id].rebote = 1.08; }));
  }

  // Un cometa de humo que dibuja el ocho tumbado dos veces.
  snoop_ochos(p, N) {
    this.subtitulo('Ochos en el aire', N);
    const cx = Math.min(ANCHO - 230, Math.max(230, p.x + 150)), cy = Math.max(170, p.y - 180), a = 190;
    this.camino(k => {
      const t = k * Math.PI * 4, d = 1 + Math.sin(t) * Math.sin(t);
      return [cx + a * Math.cos(t) / d, cy + a * Math.sin(t) * Math.cos(t) / d];
    }, { n: 52, ms: 2500, px: 40, tinte: k => this.iris(0.55 + k * 0.5, 0.35), vida: 420 });
  }

  // 6 · 420: el premio gordo. Lo escribe el humo; el logro, la primera vez.
  nivel_cuatroveinte(p, N, n) {
    const primera = !(ESTADO.logros && ESTADO.logros.calada420);
    this.cartelNivel(N, n);
    this.zoom(1.05, 260, 900);
    sfx(this, 'campanita', { volume: 0.5 });
    this.en(350, () => sfx(this, 'aaah', { volume: 0.45 }));
    this[`cv_${this.bolsaItem('var_420', ['escrito', 'fuegos', 'remolino'])}`](p, N);
    this.en(900, () => Comic.confeti(this, { n: 10 }));
    this.compas.forEach(id => this.en(700, () => this.pose(id, 'riendo', 2600)));
    if (primera) {
      ESTADO.logros = ESTADO.logros || {};
      ESTADO.logros.calada420 = Date.now();
      ESTADO.monchis += 420;
      guardarPartida();
      this.en(2400, () => Comic.cartela(this, '¡Logro!', 'Cuatro-veinte · +420 monchis', COLOR.amarillo, { ms: 3400 }));
    }
  }

  // El humo escribe «420», cifra a cifra, en dorado.
  cv_escrito(p) {
    const an = 96, al = 150, hueco = 34;
    const x0 = ANCHO / 2 - (an * 3 + hueco * 2) / 2, y0 = 165;
    const cifras = [
      [[0.72, 1], [0.72, 0], [0, 0.66], [1, 0.66]],
      [[0, 0.22], [0.25, 0], [0.75, 0], [1, 0.22], [1, 0.42], [0, 1], [1, 1]],
      Array.from({ length: 17 }, (_, i) => [0.5 + 0.5 * Math.sin(i / 16 * Math.PI * 2), 0.5 - 0.5 * Math.cos(i / 16 * Math.PI * 2)]),
    ];
    cifras.forEach((c, i) => {
      const pts = this.muestrear(c, 18).map(([x, y]) => [x0 + i * (an + hueco) + x * an, y0 + y * al]);
      this.en(i * 520, () => {
        sfx(this, 'pop', { volume: 0.35, rate: 0.9 + i * 0.15 });
        this.camino(k => pts[Math.min(pts.length - 1, Math.round(k * (pts.length - 1)))], { n: 18, ms: 460, px: 40, tinte: i === 1 ? 0xfff3a0 : 0xffd96a, vida: 2300 - i * 520 });
      });
    });
    this.en(1700, () => sfx(this, 'platillo', { volume: 0.4 }));
  }

  // Fuegos artificiales de humo: suben y estallan en colores.
  cv_fuegos(p) {
    const xs = Phaser.Utils.Array.Shuffle([250, 450, 640, 830, 1030]);
    xs.forEach((x, i) => {
      this.en(i * 330, () => {
        const y = Phaser.Math.Between(150, 280);
        const sube = this.puff(x, ASIENTO - 60, 26, 0xfff3c4, 0.9, 30);
        this.tweens.add({ targets: sube, y, duration: 480, ease: 'Quad.out', onComplete: () => {
          sube.destroy();
          if (this.acabado) return;
          sfx(this, 'pop', { volume: 0.4, rate: 0.8 + i * 0.1 });
          for (let j = 0; j < 12; j++) {
            const a = j / 12 * Math.PI * 2, r = Phaser.Math.Between(80, 130);
            const h = this.puff(x, y, 30, this.iris(i / 5 + j / 40, 0.5), 0.95, 30);
            this.tweens.add({ targets: h, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r + 24, scale: h.scale * 1.8, alpha: 0, duration: 1100, ease: 'Cubic.out', onComplete: () => h.destroy() });
          }
        } });
      });
    });
  }

  // El remolino arcoíris, encima del sofá y sin tapar la pantalla.
  cv_remolino(p) {
    const remolino = this.nuevo(this.add.container(ANCHO / 2, 250).setDepth(30).setScale(0.15));
    for (let i = 0; i < 26; i++) {
      const a = i * 0.6, r = 10 + i * 8;
      const h = this.puff(Math.cos(a) * r, Math.sin(a) * r, 46 + i, this.iris(i / 26, 0.55), 0.8, 0);
      remolino.add(h);
    }
    this.tweens.add({ targets: remolino, angle: 500, scale: 0.9, duration: 2600, ease: 'Sine.out' });
    this.tweens.add({ targets: remolino, alpha: 0, delay: 2100, duration: 600, onComplete: () => remolino.destroy() });
    this.en(1300, () => sfx(this, 'tiroriro', { volume: 0.4 }));
  }

  // Garabato de humo que sale solo de vez en cuando (a veces con una frase flotando).
  garabato() {
    if (this.acabado || this.ocupado > 0 || this.inhala > 0 || this.porroFuera || !this.encendido || Math.random() < 0.35) return;
    const id = this.bolsaItem('garabatos', GARABATOS);
    const b = this.boca('vuper');
    const tinte = Phaser.Utils.Array.GetRandom([0xf2eef8, 0xffd6f0, 0xd6e8ff, 0xfff3c4]);
    this.trazar(id, b.x + 150, b.y - 160, 80, tinte, { n: 20, px: 36, paso: 40 });
    if (Math.random() < 0.55) this.en(500, () => this.fraseHumo(b.x + 150, b.y - 290, this.bolsaItem(`h_${this.mundo}`, FRASES_HUMO[this.mundo])));
  }

  humo_aros(p) {
    this.cartel('¡Tres aros!');
    for (let i = 0; i < 3; i++) this.time.delayedCall(250 + i * 280, () => this.aro(p.x + 30, p.y - 10, 80 + i * 40, 1));
  }

  humo_dragon(p) {
    this.cartel('¡Calada de dragón!');
    sfx(this, 'whoosh', { volume: 0.5 });
    for (let i = 0; i < 16; i++) this.time.delayedCall(i * 35, () => this.voluta(p.x + 20 + i * 14, p.y + Phaser.Math.Between(-20, 20), 0.34, true));
  }

  humo_corazon(p) {
    this.cartel('Humo con amor');
    const c = this.add.container(p.x + 60, p.y - 30).setDepth(30).setScale(0.3).setAlpha(0.95);
    const tex = this.mundo === 'normal' ? 'tex-niebla' : 'humo';
    [[-22, -10], [22, -10], [0, 18], [-11, 6], [11, 6]].forEach(([x, y]) => c.add(this.add.image(x, y, tex).setScale(this.mundo === 'normal' ? 0.35 : 0.14).setTint(0xffc2dc)));
    this.tweens.add({ targets: c, y: p.y - 260, scale: 1.4, alpha: 0, duration: 2600, ease: 'Sine.out', onComplete: () => c.destroy() });
    this.time.delayedCall(500, () => sfx(this, 'campanita', { volume: 0.3 }));
  }

  humo_tornado(p) {
    this.cartel('¡Tornado!');
    for (let i = 0; i < 14; i++) {
      this.time.delayedCall(i * 70, () => {
        const a = i * 0.9;
        this.voluta(p.x + 40 + Math.cos(a) * (20 + i * 3), p.y - i * 14 + Math.sin(a) * 10, 0.18, false);
      });
    }
  }

  humo_aroDentro(p) {
    this.cartel('¡Un aro dentro de otro!');
    this.aro(p.x + 30, p.y - 10, 100, 1.4);
    this.time.delayedCall(500, () => this.aro(p.x + 30, p.y - 10, 100, 0.7, true));
  }

  humo_cascada(p) {
    this.cartel('Cascada de humo');
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 80, () => {
        const tex = this.mundo === 'normal' ? 'tex-niebla' : 'humo';
        const h = this.add.image(p.x + 10, p.y + 10, tex).setScale(this.mundo === 'normal' ? 0.2 : 0.08).setTint(0xf2eef8).setAlpha(0.9).setDepth(29);
        this.tweens.add({ targets: h, y: p.y + 160, x: h.x + Phaser.Math.Between(-60, 60), scale: h.scale * 2.5, alpha: 0, duration: 1600, ease: 'Sine.in', onComplete: () => h.destroy() });
      });
    }
  }

  humo_carita(p) {
    this.cartel('El humo te guiña un ojo');
    const c = this.add.container(p.x + 70, p.y - 20).setDepth(30).setScale(0.4);
    c.add(this.add.image(0, 0, this.mundo === 'normal' ? 'tex-niebla' : 'humo').setScale(this.mundo === 'normal' ? 0.6 : 0.3).setTint(0xf2eef8));
    c.add(this.add.circle(-12, -4, 6, HEX.tinta));
    const guino = this.add.rectangle(12, -4, 14, 4, HEX.tinta);
    c.add(guino);
    c.add(this.add.arc(0, 8, 12, 20, 160, false).setStrokeStyle(4, HEX.tinta));
    this.tweens.add({ targets: c, y: p.y - 250, scale: 1.1, duration: 2400, ease: 'Sine.out' });
    this.tweens.add({ targets: c, alpha: 0, duration: 600, delay: 1800, onComplete: () => c.destroy() });
    this.tweens.add({ targets: guino, scaleY: 3, duration: 150, yoyo: true, repeat: 2, delay: 600 });
  }

  aro(x, y, deriva, tam, dentro, color = 0xf2eef8) {
    const aro = this.add.ellipse(x, y, 50 * tam, 26 * tam).setStrokeStyle(dentro ? 6 : 8, color, 0.95).setDepth(30);
    this.tweens.add({ targets: aro, y: y - 280, x: x + deriva, scaleX: dentro ? 2.2 : 2.6, scaleY: dentro ? 1.8 : 2.2, alpha: 0, duration: dentro ? 1900 : 2400, ease: 'Sine.out', onComplete: () => aro.destroy() });
  }

  // Rótulo corto de lo que acaba de pasar (arriba, sin tapar a nadie).
  cartel(t) {
    golpeTexto(this, ANCHO / 2, 170, t, COLOR.amarillo, 40);
  }

  // Los colegas reaccionan a tu calada, cada vez de una forma.
  reaccionar(estilo) {
    if (this.acabado || this.porroFuera) return;
    // Reacciona uno de los que están en el sofá, y cada uno a su manera (COMPAS[...].reacciones).
    const id = this.bolsaItem('quienReacciona', this.compas);
    const C = COMPAS[id];
    const [pose, frase0, sonido] = this.bolsaItem(`reac_${id}`, C.reacciones);
    let frase = frase0;
    if (estilo === 'corazon' && id === 'lasslow') frase = '¿Eso es para mí? Me sonrojo.';
    if (estilo === 'dragon' && id === 'blancaso') frase = '¡Que me quemas las cejas!';
    const hacer = () => {
      if (this.acabado || this.porroFuera || !this.actores[id]) return;
      this.pose(id, pose, 1600);
      this.decir(this.actores[id], frase);
      sfx(this, sonido, { volume: 0.45 });
      // Perico lo repite todo, y nadie le cree.
      if (id === 'perico') this.en(2200, () => this.decir(this.actores.perico, `Pin pin. ${frase.split(/[.!?]/)[0].trim()}. Que conste.`));
    };
    // La Pompa contesta tres frases tarde.
    if (C.retraso) this.en(C.retraso, hacer); else hacer();
  }

  voluta(x, y, tam, grande) {
    const normal = this.mundo === 'normal';
    const h = this.add.image(x, y, normal ? 'tex-niebla' : 'humo').setScale(tam * (normal ? 0.9 : 0.35)).setTint(0xf2eef8).setAlpha(grande ? 0.9 : 0.5).setDepth(29);
    this.tweens.add({
      targets: h, x: x + Phaser.Math.Between(grande ? 30 : -40, grande ? 180 : 40), y: y - Phaser.Math.Between(140, 280),
      scale: tam * (grande ? 2.4 : 2) * (normal ? 2.5 : 1), alpha: 0, angle: Phaser.Math.Between(-40, 40), duration: grande ? 2000 : 1500, ease: 'Sine.out', onComplete: () => h.destroy(),
    });
  }

  tos() {
    this.inhala = 0;
    this.combo = 0;
    this.textoCombo.setText('¡Cof, cof!');
    if (this.sonidoCalada) this.sonidoCalada.stop();
    this.subido += 2;
    this.ocupado = 1.4;
    this.pose('vuper', 'tos', 1400);
    this.actores.vuper.hincha = 0.92;
    sfx(this, 'tos-grande');
    this.cameras.main.shake(180, 0.006); // corto: la tos se ve en Vuper y en las volutas, no en la pantalla
    const p = this.boca('vuper');
    for (let i = 0; i < 9; i++) this.time.delayedCall(i * 70, () => this.voluta(p.x + 10, p.y + 10, 0.24, true));
    // Los colegas se parten.
    this.time.delayedCall(350, () => {
      if (this.acabado) return;
      this.compas.forEach(id => this.pose(id, 'riendo', 1600));
      sfx(this, 'risa-fondo', { volume: 0.5 });
    });
  }

  // ---------- Pasarlo ----------

  // Vuelo del porro de una mano a otra (en arco y girando, con la brasa).
  volarPorro(de, a, alAcabar) {
    // Vuela el porro que has liado, con su forma y su calidad (la brasa ya va dibujada en él).
    const porro = this.add.image(de.x, de.y, this.texturaDelPorro()).setScale(0.11).setDepth(32);
    this.tweens.addCounter({
      from: 0, to: 1, duration: 620, ease: 'Sine.inOut',
      onUpdate: tw => {
        const v = tw.getValue();
        porro.x = Phaser.Math.Linear(de.x, a.x, v);
        porro.y = Phaser.Math.Linear(de.y, a.y, v) - Math.sin(v * Math.PI) * 120;
        porro.angle += 6;
      },
      onComplete: () => { porro.destroy(); if (alAcabar) alAcabar(); },
    });
    sfx(this, 'whoosh', { volume: 0.3 });
  }

  mano(id) {
    const b = this.boca(id);
    return { x: b.x, y: b.y + 30 };
  }

  // Pasarlo: cada vez puede pasar una cosa distinta con el colega (y se puede ir de ronda).
  pasar() {
    if (this.acabado || this.ocupado > 0 || this.inhala > 0) return;
    this.pases++;
    this.porro -= this.costePase;
    // Se lo pasas a los de tu sofá por turnos. En la historia del blancazo, el primer pase es para Blancaso
    // (es lo que pide el objetivo), por eso él sale fijo en el selector.
    const primeroBlancaso = desdeCapId('blancazo') && stat('blancasoFumo') < 1 && this.compas.includes('blancaso') && !this.blancasoFumo;
    const id = primeroBlancaso ? 'blancaso' : this.compas[(this.pases - 1) % this.compas.length];
    const otro = this.compas.find(c => c !== id) || id;
    const desde = this.puntaPorro() || this.boca('vuper');
    this.porroFuera = true;
    this.pose('vuper', 'pasar', 900);
    if (id === 'blancaso') this.blancasoFumo = true;
    const variantes = ['normal', 'larga', 'aros', 'pillado', 'ronda', 'anecdota'].filter(v => v !== this.ultimaVariante && (v !== 'ronda' || otro !== id));
    const v = Phaser.Utils.Array.GetRandom(variantes);
    this.ultimaVariante = v;
    const ANECDOTAS = Object.fromEntries(ORDEN_COMPAS.map(c => [c, COMPAS[c].anecdotas]));
    const devolver = (quien, retraso) => this.time.delayedCall(retraso, () => this.volarPorro(this.mano(quien), { x: desde.x - 20, y: desde.y }, () => {
      this.porroFuera = false;
      if (!this.acabado) this.pose('vuper', 'base');
    }));
    const duracion = { normal: 3200, larga: 3900, aros: 3900, pillado: 5200, ronda: 5600, anecdota: 4200 }[v];
    this.ocupado = duracion / 1000 + 0.2;
    this.volarPorro({ x: desde.x - 20, y: desde.y }, this.mano(id), () => {
      this.pose(id, 'calada');
      sfx(this, 'calada', { volume: 0.45 });
    });
    if (v === 'normal') {
      this.time.delayedCall(1700, () => { this.exhalar(id, false); this.reaccionPase(id); });
      devolver(id, 2700);
    } else if (v === 'larga') {
      this.time.delayedCall(1400, () => this.cartel(`¡${QUIEN[id].nombre} se marca una calada eterna!`));
      this.time.delayedCall(2400, () => {
        this.pose(id, 'tos', 1500);
        sfx(this, 'tos-grande', { volume: 0.7 });
        const p = this.boca(id);
        for (let i = 0; i < 7; i++) this.time.delayedCall(i * 70, () => this.voluta(p.x, p.y, 0.24, true));
        this.time.delayedCall(500, () => { this.pose('vuper', 'riendo', 1200); sfx(this, 'risa-fondo', { volume: 0.4 }); });
      });
      devolver(id, 3400);
    } else if (v === 'aros') {
      this.time.delayedCall(1700, () => {
        this.pose(id, 'suelta', 1200);
        this.cartel(`${QUIEN[id].nombre} también sabe hacer aros`);
        const p = this.boca(id);
        for (let i = 0; i < 3; i++) this.time.delayedCall(i * 260, () => this.aro(p.x + 20, p.y - 10, id === 'lasslow' ? 60 + i * 30 : -60 - i * 30, 0.9));
        this.time.delayedCall(900, () => { this.pose('vuper', 'riendo', 1000); this.decir(this.actores.vuper, '¡Eh, que esos son míos!'); });
      });
      devolver(id, 3400);
    } else if (v === 'pillado') {
      // Se queda pillado con el porro en la mano: se para todo un momento.
      this.time.delayedCall(1500, () => {
        this.cartel(`${QUIEN[id].nombre} se ha quedado pillado…`);
        const a = this.actores[id];
        this.tweens.add({ targets: a.img, angle: id === 'lasslow' ? -6 : 6, duration: 600, yoyo: true, repeat: 1 });
      });
      this.time.delayedCall(3200, () => { this.pose('vuper', 'pasar', 900); this.decir(this.actores.vuper, '¡Eh! ¡Que es para hoy!'); });
      this.time.delayedCall(4000, () => { this.exhalar(id, false); this.decir(this.actores[id], '¿Eh? Ah, sí. Toma, toma.'); });
      devolver(id, 4600);
    } else if (v === 'ronda') {
      // Se lo pasa al otro y vuelve después de la ronda.
      this.time.delayedCall(1700, () => {
        this.exhalar(id, false);
        this.volarPorro(this.mano(id), this.mano(otro), () => { this.pose(otro, 'calada'); sfx(this, 'calada', { volume: 0.4 }); });
        this.cartel('¡Ronda!');
        if (otro === 'blancaso') this.blancasoFumo = true;
      });
      this.time.delayedCall(3700, () => { this.exhalar(otro, false); this.reaccionPase(otro); });
      devolver(otro, 4700);
    } else {
      this.time.delayedCall(1700, () => {
        this.exhalar(id, false);
        this.pose(id, 'riendo', 2200);
        this.decir(this.actores[id], Phaser.Utils.Array.GetRandom(ANECDOTAS[id]));
      });
      devolver(id, 3600);
    }
  }

  reaccionPase(id) {
    if (!this.actores[id]) return;
    const r = this.bolsaItem(`pase_${id}`, COMPAS[id].pase);
    this.pose(id, r[0], 1800);
    sfx(this, r[2]);
    this.decir(this.actores[id], r[1]);
  }

  // Visitas sorpresa en el sofá: cada rato pasa algo distinto.
  suceso() {
    if (this.acabado || this.ocupado > 0 || this.inhala > 0 || this.mundo !== 'humo') return;
    // Los que ya están sentados no hacen de visita.
    const opciones = ['puky', 'perico', 'pompa', 'palicaso', 'cotine', 'luces'].filter(o => o !== this.ultimoSuceso && !this.compas.includes(o));
    const o = Phaser.Utils.Array.GetRandom(opciones);
    this.ultimoSuceso = o;
    this.ocupado = 2.5;
    const entra = (clave, x, y, alto) => {
      const img = this.add.image(x, y, clave).setOrigin(0.5, 1).setDepth(12);
      img.setScale(alto / img.height);
      return img;
    };
    if (o === 'puky') {
      const img = entra('puky', 640, 760, 120);
      this.tweens.add({ targets: img, y: 660, duration: 400, ease: 'Back.out' });
      this.time.delayedCall(400, () => { sfx(this, 'blurp'); this.decir({ img }, '¿Me llamabais?'); if (!this.acabado) this.compas.forEach(id => this.pose(id, 'tos', 1500)); });
      this.time.delayedCall(2000, () => this.tweens.add({ targets: img, y: 800, duration: 300, onComplete: () => img.destroy() }));
    } else if (o === 'perico') {
      const img = entra('perico-volando', -100, 260, 120);
      sfx(this, 'pin-pin');
      this.tweens.add({ targets: img, x: ANCHO + 120, duration: 1800, ease: 'Sine.inOut', onComplete: () => img.destroy() });
      this.time.delayedCall(800, () => this.cartel('¡Perico se lleva el mechero! Pin pin'));
    } else if (o === 'pompa') {
      const img = entra('pompa', 640, -40, 130);
      this.tweens.add({ targets: img, y: 200, duration: 900, ease: 'Sine.out', yoyo: true, hold: 900, onComplete: () => img.destroy() });
      this.time.delayedCall(950, () => this.decir({ img }, '…Huele bien aquí abajo. Vuelvo arriba.'));
    } else if (o === 'palicaso') {
      const img = entra('palicaso-contando', ANCHO + 80, 420, 150);
      this.tweens.add({ targets: img, x: ANCHO - 120, duration: 400, ease: 'Back.out' });
      this.time.delayedCall(450, () => { this.decir({ img }, '¡Escucha, escucha! ¿Qué le dice el sofá al cojín? ¡Que no se levante nadie!'); sfx(this, 'rimshot'); });
      this.time.delayedCall(1800, () => { if (this.acabado) return; this.pose(this.compas[0], 'riendo', 1500); sfx(this, 'risa-lasslow', { volume: 0.6 }); });
      this.time.delayedCall(2300, () => this.tweens.add({ targets: img, x: ANCHO + 120, duration: 300, onComplete: () => img.destroy() }));
    } else if (o === 'cotine') {
      const img = entra('cotine', -80, 640, 170);
      this.tweens.add({ targets: img, x: 180, duration: 600, ease: 'Sine.out' });
      this.time.delayedCall(650, () => this.decir({ img }, '¿Alguien quiere tarta? …¿No? Pues me la como.'));
      this.time.delayedCall(1700, () => { sfx(this, 'nam'); this.tweens.add({ targets: img, scaleX: img.scaleX * 1.15, duration: 120, yoyo: true, repeat: 2 }); });
      this.time.delayedCall(2300, () => this.tweens.add({ targets: img, x: -100, duration: 400, onComplete: () => img.destroy() }));
    } else {
      this.cartel('…¿Habéis visto eso?');
      // Dos focos de color que cruzan la pared (antes, dos destellos a pantalla completa).
      [[0xb68cff, 0], [0xff5fa2, 300]].forEach(([c, ms]) => this.time.delayedCall(ms, () => {
        if (this.acabado) return;
        const x = Phaser.Math.Between(260, ANCHO - 260);
        const foco = this.add.ellipse(x, Phaser.Math.Between(150, 260), 340, 200, c, 0).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: foco, fillAlpha: 0.38, x: x + Phaser.Math.Between(-140, 140), duration: 220, yoyo: true, hold: 120, onComplete: () => foco.destroy() });
      }));
      this.compas.forEach(id => this.pose(id, 'riendo', 1200));
      sfx(this, 'neon', { volume: 0.4 });
    }
  }

  decir(actor, linea) {
    if (this.burbuja) this.burbuja.destroy();
    const img = actor.img;
    const visible = img.displayHeight * (this.mundo === 'normal' ? SENTADO : 1);
    this.burbuja = bocadillo(this, Phaser.Math.Clamp(img.x, 240, ANCHO - 240), Math.max(130, img.y - visible - 50), linea, { tam: 24, ancho: 400 });
    const b = this.burbuja;
    this.time.delayedCall(2600, () => { if (b.active) b.destroy(); });
  }

  charlaSofa() {
    if (this.acabado || this.ocupado > 0) return;
    const id = this.bolsaItem('quienCharla', this.compas);
    this.pose(id, 'riendo', 1500);
    this.decir(this.actores[id], this.bolsaItem(`charla_${id}`, COMPAS[id].charlas));
  }

  // ---------- Hace efecto: del mundo normal al humo ----------

  haceEfecto() {
    if (this.acabado) return;
    this.limpiarFx(); // si había una animación de calada a medias (o cámara lenta), se corta aquí
    const v = this.actores.vuper;
    if (v.vuelta) v.vuelta.remove();
    this.rompiendo = true;
    v.img.setTexture('vn-rotura').setOrigin(0.5, SENTADO).setCrop(0, 0, v.img.width, v.img.height * SENTADO);
    v.esc = SITIO.vuper.alto.normal / (v.img.height * SENTADO);
    v.rebote = 1.3;
    sfx(this, 'temblor');
    sfx(this, 'zumbido-m', { volume: 0.6 });
    // Juice local: un golpe corto de cámara, una onda verde que sale de Vuper y unas chispas (sin destello que tape).
    this.cameras.main.shake(200, 0.007);
    const pc = this.boca('vuper') || { x: v.img.x, y: v.img.y - 120 };
    [0, 160].forEach(ms => this.time.delayedCall(ms, () => {
      const onda = this.add.circle(pc.x, pc.y, 40).setStrokeStyle(8, 0xe6ffa0, 0.9).setDepth(31);
      this.tweens.add({ targets: onda, scale: 4.2, alpha: 0, duration: 520, ease: 'Sine.out', onComplete: () => onda.destroy() });
    }));
    const chis = this.add.particles(pc.x, pc.y, 'miga', { speed: { min: 120, max: 340 }, scale: { start: 0.8, end: 0 }, lifespan: 520, tint: [0xe6ffa0, 0xb68cff, 0xffd23f], emitting: false }).setDepth(31);
    chis.explode(18);
    this.time.delayedCall(600, () => chis.destroy());
    const t = texto(this, ANCHO / 2, 230, 'Hace efecto…', 64, COLOR.amarillo).setDepth(60).setScale(0);
    this.tweens.add({ targets: t, scale: 1, duration: 400, ease: 'Back.out' });
    this.time.delayedCall(1200, () => cortinaHumo(this, () => {
      t.destroy();
      this.mundo = 'humo';
      this.rompiendo = false;
      this.bg.setTexture('bg-sofa');
      this.actualizarPorro(); // el mismo porro, con el acabado del mundo humo
      this.actualizarChips();
      Object.keys(this.actores).forEach(id => this.pose(id, 'base'));
      destaparHumo(this);
      golpeTexto(this, ANCHO / 2, 250, 'Mundo humo', COLOR.rosa, 60);
      this.ocupado = 0.6;
    }));
  }

  terminar() {
    if (this.acabado) return;
    this.acabado = true;
    this.limpiarFx();
    if (this.sonidoCalada) this.sonidoCalada.stop();
    this.cameras.main.setRotation(0);
    // Nada vivo debajo del panel final: medidor a cero y fuera los botones.
    this.inhala = 0;
    this.aguantando = false;
    this.barraCalada.setSize(28, 0);
    this.botones.forEach(b => b.destroy());
    this.chips.forEach(ch => ch.destroy());
    this.chips = [];
    if (this.textoAyuda) this.textoAyuda.setVisible(false);
    ESTADO.colocon = Math.min(100, ESTADO.colocon + this.subido);
    ESTADO.hambre = Math.min(100, ESTADO.hambre + 15 + this.m.hambre);
    const historiaBlancazo = desdeCapId('blancazo');
    if (this.blancasoFumo && !ESTADO.blancazo && historiaBlancazo) ESTADO.blancazoEn = 12;
    if (this.subido > 0) sumarStat('fumadas');
    if (this.blancasoFumo && historiaBlancazo) sumarStat('blancasoFumo');
    // Lo nuevo que se desbloquea con esta fumada (formas de echar el humo y tipos de liado).
    const ahora = stat('fumadas');
    const nuevos = [
      ...ORDEN_FORMAS.filter(f => FORMAS_HUMO[f].desde > this.fumadasAntes && FORMAS_HUMO[f].desde <= ahora).map(f => `Echar el humo: ${FORMAS_HUMO[f].nombre}`),
      ...Object.keys(TIPOS_LIAR).filter(t => TIPOS_LIAR[t].desde > this.fumadasAntes && TIPOS_LIAR[t].desde <= ahora).map(t => `Liar: ${TIPOS_LIAR[t].nombre}`),
    ];
    // Puntuación de la sesión: lo de siempre + las formas de echar el humo + lo que aportan los acompañantes.
    const base = this.perfectas * 2 + this.pases * 3 + this.bonoMonchis;
    const premio = Math.round(base * this.m.premio);
    ESTADO.monchis += premio;
    ESTADO.sofaForma = this.forma;
    Object.assign(ESTADO, { sala: 'dentro', x: 260, y: 600 });
    guardarPartida();
    this.pose('vuper', 'riendo');
    const T = TIPOS_LIAR[this.tipo];
    const nombres = this.compas.map(id => COMPAS[id].nombre).join(' y ');
    const humos = Object.keys(this.formasHechas).map(f => `${FORMAS_HUMO[f].nombre.toLowerCase()} ×${this.formasHechas[f].veces} (mejor ${Math.round(this.formasHechas[f].mejor * 100)} %)`);
    const mejor = this.mejorNivel >= 0 ? ` · Mejor calada: ${NIVELES_CALADA[this.mejorNivel].nombre}` : '';
    const pet = this.peticionesPedidas ? ` · Peticiones: ${this.peticionesOk}/${this.peticionesPedidas}` : '';
    const extra = this.m.premio > 1 ? ` (con ${COMPAS.cotine.nombre}: x${String(this.m.premio).replace('.', ',')})` : '';
    const c = this.add.container(ANCHO / 2, ALTO / 2).setDepth(700).setScale(0);
    const g = this.add.graphics();
    g.fillStyle(HEX.morado, 1).fillRoundedRect(-430, -290, 860, 580, 34);
    g.lineStyle(8, HEX.tinta, 1).strokeRoundedRect(-430, -290, 860, 580, 34);
    c.add(g);
    c.add(texto(this, 0, -240, this.porro <= 0 ? 'Se acabó el porro' : 'Te levantas del sofá', 46, COLOR.amarillo));
    c.add(texto(this, 0, -130, `Liado ${T.nombre.toLowerCase()}: ${nombreDePorro(this.porroDatos)}\nCon ${nombres}\nHumo: ${humos.length ? humos.join(' · ') : 'sin más'}`, 24, COLOR.crema, 800));
    c.add(texto(this, 0, -10, `Perfectas: ${this.perfectas} · Pases: ${this.pases}${mejor}${pet}\nColocón +${Math.round(this.subido)} · +${premio} monchis de buen rollo${extra}`, 24, COLOR.crema, 800));
    if (nuevos.length) c.add(texto(this, 0, 80, `¡Nuevo! ${nuevos.join(' · ')}`, 24, COLOR.amarillo, 800));
    c.add(texto(this, 0, 140, this.m.hambre ? 'Te está entrando un hambre… de las gordas' : 'Te está entrando un hambre…', 26, COLOR.rosa));
    const salir = () => irA(this, 'Barrio', { aviso: '¡Monchis! Busca la tienda' });
    c.add(boton(this, 0, 225, MOVIL ? 'Al barrio' : 'Al barrio (E)', salir, { ancho: 300 }));
    this.tweens.add({ targets: c, scale: 1, duration: 380, ease: 'Back.out' });
    this.input.keyboard.once('keydown-E', salir);
    this.input.keyboard.once('keydown-ENTER', salir);
  }
}

// ======================================================================================
// Ampliación: chips de formas de echar el humo, peticiones, acompañantes y mini-habilidades.
// (Va aparte para no tocar el resto de la escena; se añade al prototipo de Fumar.)
// ======================================================================================
// Con el dedo no hay ESPACIO: lo mismo de las ayudas, dicho para el botón táctil.
const AYUDA_FORMAS_MOVIL = {
  aros: 'Toca el botón cuando el aro llegue al círculo (4 aros)',
  nube: 'MANTÉN el botón y suelta antes de la zona roja',
  cascada: 'Toca cuando la gota cruce la raya dorada (3 gotas)',
  dragon: 'Alterna ◄ ► lo más rápido que puedas',
  fantasma: 'MANTÉN para soltarlo · suelta y toca al volver a tu nariz',
};

Object.assign(Fumar.prototype, {

  // ---------- Elegir cómo echar el humo ----------

  crearChips() {
    this.chips = [];
    const n = ORDEN_FORMAS.length, w = 112, sep = 6, y = MOVIL ? 634 : 638;
    this.altoChip = MOVIL ? 62 : 50; // más altos en el móvil: que el dedo acierte
    const x0 = ANCHO / 2 - (n * (w + sep) - sep) / 2 + w / 2;
    ORDEN_FORMAS.forEach((f, i) => {
      const c = this.add.container(x0 + i * (w + sep), y).setDepth(55);
      const g = this.add.graphics();
      const t = this.add.text(0, 3, '', { fontFamily: FUENTE, fontSize: `${MOVIL ? 19 : 16}px`, color: COLOR.tinta, align: 'center', wordWrap: { width: w - 12 } }).setOrigin(0.5);
      const k = this.add.text(-w / 2 + 9, -16, String(i + 1), { fontFamily: FUENTE, fontSize: '13px', color: COLOR.tinta }).setOrigin(0, 0.5);
      k.setVisible(!MOVIL);
      c.add([g, t, k]);
      c.setSize(w, this.altoChip).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => this.elegirForma(f));
      c.f = f; c.g = g; c.t = t;
      this.chips.push(c);
    });
    this.actualizarChips();
  },

  // Los chips solo salen cuando ya has fumado una vez (la primera vez, lo mínimo) y en el mundo humo.
  chipsVisibles() { return this.mundo === 'humo' && stat('fumadas') >= 1 && !this.acabado; },

  actualizarChips() {
    const ver = this.chipsVisibles() && !this.habilidad;
    this.chips.forEach(c => {
      if (!c.scene) return;
      c.setVisible(ver);
      const F = FORMAS_HUMO[c.f], abierta = formaDesbloqueada(c.f), sel = this.forma === c.f;
      c.g.clear();
      const hh = this.altoChip;
      c.g.fillStyle(HEX.tinta, 1).fillRoundedRect(-52, -hh / 2 + 8, 112, hh, 14);
      c.g.fillStyle(sel ? HEX.verde : abierta ? HEX.crema : 0x6b5a85, 1).fillRoundedRect(-56, -hh / 2, 112, hh, 14);
      c.g.lineStyle(4, sel ? 0xffd23f : HEX.tinta, 1).strokeRoundedRect(-56, -hh / 2, 112, hh, 14);
      c.t.setText(abierta ? F.nombre : `Tras ${F.desde} fumada${F.desde > 1 ? 's' : ''}`).setAlpha(abierta ? 1 : 0.7);
      this.tweens.killTweensOf(c);
      c.setScale(1);
      // El chip de lo que te piden late un poco.
      if (ver && this.peticion && this.peticion.forma === c.f) this.tweens.add({ targets: c, scale: 1.12, duration: 320, yoyo: true, repeat: -1 });
    });
    if (this.textoAyuda) this.textoAyuda.setText(MOVIL
      ? (ver ? 'MANTÉN = calada · toca cómo soltar el humo' : 'MANTÉN = calada · suelta en el centro de la barra')
      : (ver ? 'MANTÉN = calada · P = pásalo · 1-6 = cómo soltar el humo' : 'MANTÉN = calada · suelta en el centro de la barra · P = pásalo'));
  },

  elegirForma(f) {
    if (this.acabado || this.habilidad || !this.chipsVisibles()) return;
    const F = FORMAS_HUMO[f];
    if (!formaDesbloqueada(f)) {
      golpeTexto(this, ANCHO / 2, 580, `${F.nombre}: se desbloquea tras ${F.desde} fumada${F.desde > 1 ? 's' : ''}`, COLOR.crema, 26);
      return;
    }
    this.forma = f;
    ESTADO.sofaForma = f;
    sfx(this, 'pop', { volume: 0.3, rate: 1.2 });
    this.actualizarChips();
  },

  // ---------- Peticiones de los acompañantes («¡hazme un aro!») ----------

  vigilarPeticion() {
    if (this.acabado || this.mundo !== 'humo' || stat('fumadas') < 1) return;
    if (this.peticion) {
      if (this.time.now > this.peticion.hasta) {
        this.peticion = null;
        this.tPedir = 12 + Math.random() * 8;
        this.actualizarChips();
      }
      return;
    }
    this.tPedir -= 1;
    if (this.tPedir > 0 || this.ocupado > 0 || this.inhala > 0 || this.habilidad || !this.encendido || this.porroFuera || this.rompiendo) return;
    const posibles = ORDEN_FORMAS.filter(f => f !== 'libre' && formaDesbloqueada(f));
    if (!posibles.length) return;
    const forma = this.bolsaItem('pedidas', posibles);
    const quien = this.bolsaItem('quienPide', this.compas);
    const retraso = COMPAS[quien].retraso || 0;
    this.peticion = { forma, quien, hasta: this.time.now + 17000 + retraso };
    this.peticionesPedidas++;
    this.actualizarChips();
    this.en(retraso, () => {
      this.pose(quien, 'riendo', 1500);
      this.decir(this.actores[quien], this.bolsaItem(`pide_${forma}`, FORMAS_HUMO[forma].pide));
      sfx(this, 'pop', { volume: 0.35, rate: 1.4 });
    });
  },

  resolverPeticion(forma, q) {
    const pet = this.peticion;
    if (!pet || pet.forma !== forma) return;
    this.peticion = null;
    this.tPedir = 12 + Math.random() * 8;
    const C = COMPAS[pet.quien];
    const espera = 900 + (C.retraso || 0);
    if (q >= 0.5) {
      const prem = Math.round(6 * this.m.peticion);
      this.bonoMonchis += prem;
      this.peticionesOk++;
      this.en(espera, () => {
        this.pose(pet.quien, 'riendo', 1600);
        this.decir(this.actores[pet.quien], this.bolsaItem(`aplaude_${pet.quien}`, C.aplaude));
        sfx(this, 'campanita', { volume: 0.4 });
        golpeTexto(this, this.actores[pet.quien].x, 300, `¡Pedido cumplido! +${prem}`, COLOR.amarillo, 30);
        Comic.confeti(this, { n: 8 });
      });
    } else {
      this.en(espera, () => {
        this.pose(pet.quien, 'tos', 1400);
        this.decir(this.actores[pet.quien], this.bolsaItem(`decep_${pet.quien}`, C.decepcion));
      });
    }
  },

  // ---------- Lo que hace cada acompañante (el modificador pequeño de cada uno) ----------

  eventoCompas() {
    if (this.acabado || this.habilidad || this.rompiendo || !this.encendido) return;
    const id = this.compas[this.turnoEvento++ % this.compas.length];
    const A = this.actores[id];
    if (!A) return;
    // Lasslow se ríe justo en el momento serio, aunque estés manteniendo la calada: te mueve el pulso.
    if (id === 'lasslow') {
      this.risaHasta = this.time.now + 3200;
      this.pose('lasslow', 'riendo', 3000);
      sfx(this, 'risa-lasslow', { volume: 0.5 });
      this.decir(A, Phaser.Utils.Array.GetRandom(['JAJA… perdón. Sigue, sigue.', 'Jiji… ahora no, ahora no…', 'No me mires, que me río.']));
      return;
    }
    if (this.ocupado > 0 || this.inhala > 0 || this.porroFuera) return;
    if (id === 'palicaso') {
      // No deja hueco: un bocadillo enorme te tapa el humo.
      this.chisteHasta = this.time.now + 3400;
      this.pose('palicaso', 'riendo', 3200);
      const linea = Phaser.Utils.Array.GetRandom(['¡Escucha, escucha! Estaba yo en el bar y llega uno y me dice… no, espera, empiezo por el principio…', 'Y entonces le digo: «oye, tú». Y me dice: «¿yo?». Y le digo: «sí, tú, ¿quién va a ser?». Y…', '¡Escucha! Un señor entra en un sofá. No, un sofá entra en un señor. Espera, espera, que lo cuento bien…']);
      if (this.chisteBurbuja && this.chisteBurbuja.scene) this.chisteBurbuja.destroy();
      this.chisteBurbuja = this.nuevo(bocadillo(this, 640, 300, linea, { tam: 26, ancho: 560 })).setDepth(49);
      const b = this.chisteBurbuja;
      this.time.delayedCall(3400, () => { if (b.scene) b.destroy(); });
      return;
    }
    if (id === 'cotine') {
      this.pose('cotine', 'riendo', 1500);
      this.decir(A, Phaser.Utils.Array.GetRandom(['¿Qué? Tenía hambre.', 'Mmm… ¿eso se come? Digo, ¿se come?', 'Ay, qué hambre. Un poco de bizcocho y vuelvo.']));
      sfx(this, 'nam', { volume: 0.5 });
      this.bonoMonchis += 1;
      golpeTexto(this, A.x, 330, '+1 monchi', COLOR.amarillo, 26);
      return;
    }
    if (id === 'blancaso') {
      this.pose('blancaso', 'calada', 1500);
      this.decir(A, Phaser.Utils.Array.GetRandom(['Apunto: «hoy, disfrutar». Con fecha.', 'Esto lo pongo en la agenda: «descansar». Subrayado.', 'Tres puntos si no pienso en el alquiler.']));
      return;
    }
    if (id === 'pompa') {
      this.decir(A, 'No.');
      this.en(2800, () => { this.pose('pompa', 'riendo', 1500); this.decir(A, '…Vale. Sí. Era bonito.'); });
      return;
    }
    if (id === 'perico') {
      this.decir(A, 'Pin pin.');
      sfx(this, 'pin-pin', { volume: 0.5 });
      this.en(1900, () => { this.decir(A, 'Pin pin. Lo he dicho antes. Nadie me cree.'); sfx(this, 'pin-pin', { volume: 0.5 }); });
      return;
    }
    if (id === 'puky' && this.porro > 12) {
      // Aparece cuando nadie le llama y se come un poco de brasa… pero deja monchis.
      this.porro -= 4;
      this.bonoMonchis += 3;
      this.pose('puky', 'riendo', 1600);
      this.decir(A, Phaser.Utils.Array.GetRandom(['¿Me llamabais?', 'Blurp. Perdón. Era brasa.', '¿Eso era vuestro? Qué rico.']));
      sfx(this, 'blurp', { volume: 0.5 });
      golpeTexto(this, A.x, 330, '¡Puky se come brasa! +3', COLOR.verde, 26);
      for (let i = 0; i < 4; i++) this.en(i * 90, () => {
        const h = this.puff(A.x + Phaser.Math.Between(-30, 30), 520, 60, 0xb6e06a, 0.8, 31);
        this.tweens.add({ targets: h, y: 400, alpha: 0, scale: h.scale * 1.8, duration: 1100, onComplete: () => h.destroy() });
      });
    }
  },

  // Efectos de los acompañantes cuando clavas una calada buena.
  efectosCompasEnPerfecta() {
    const ahora = this.time.now;
    if (this.risaHasta > ahora && this.compas.includes('lasslow')) {
      this.risaHasta = 0;
      this.bonoMonchis += 3;
      golpeTexto(this, this.actores.lasslow.x, 320, '¡Clavada con la risa! +3', COLOR.rosa, 28);
    }
    if (this.chisteHasta > ahora && this.compas.includes('palicaso')) {
      this.chisteHasta = 0;
      this.bonoMonchis += 4;
      if (this.chisteBurbuja && this.chisteBurbuja.scene) this.chisteBurbuja.destroy();
      golpeTexto(this, 640, 300, '¡Le has cortado el chiste! +4', COLOR.amarillo, 30);
      this.pose('palicaso', 'tos', 1500);
    }
    if (this.compas.includes('blancaso') && this.combo > 0 && this.combo % 3 === 0) {
      this.bonoMonchis += 5;
      this.en(500, () => { this.decir(this.actores.blancaso, 'Tres seguidas. Apuntado en la columna de las alegrías.'); golpeTexto(this, this.actores.blancaso.x, 330, 'En la agenda +5', COLOR.azul, 26); });
    }
  },

  // Cómo echa el humo cada acompañante cuando le toca (visible, sin nombrar nada).
  soploCompa(id, p) {
    const estilo = COMPAS[id].humo;
    const izq = this.actores[id].x < SOFA_X.vuper;
    const mundoN = this.mundo === 'normal';
    if (estilo === 'aros') {
      for (let i = 0; i < 3; i++) this.en(i * 260, () => this.aro(p.x + 20, p.y - 10, (izq ? 1 : -1) * (60 + i * 30), 0.9));
    } else if (estilo === 'cascada') {
      for (let i = 0; i < 8; i++) this.en(i * 80, () => {
        const h = this.puff(p.x + 10, p.y + 10, 70, 0xf2eef8, 0.85, 29);
        this.tweens.add({ targets: h, y: p.y + 150, x: h.x + Phaser.Math.Between(-40, 40), alpha: 0, scale: h.scale * 2.2, duration: 1500, ease: 'Sine.in', onComplete: () => h.destroy() });
      });
    } else if (estilo === 'dragon') {
      for (let i = 0; i < 12; i++) this.en(i * 40, () => this.voluta(p.x + 20 + (izq ? 1 : -1) * i * 12, p.y + Phaser.Math.Between(-18, 18), 0.3, true));
    } else if (estilo === 'corazon') {
      for (let i = 0; i < 4; i++) this.en(i * 150, () => {
        const h = this.puff(p.x + 20, p.y - 10, 90, 0xffc2dc, 0.9, 30);
        this.tweens.add({ targets: h, y: p.y - 200, x: h.x + (i % 2 ? 40 : -10), alpha: 0, scale: h.scale * 1.6, duration: 1900, ease: 'Sine.out', onComplete: () => h.destroy() });
      });
    } else if (estilo === 'nube') {
      const h = this.puff(p.x + 20, p.y - 20, mundoN ? 200 : 160, 0xe8f6ff, 0.8, 30);
      this.tweens.add({ targets: h, y: p.y - 180, alpha: 0, scale: h.scale * 2.4, duration: 3400, ease: 'Sine.out', onComplete: () => h.destroy() });
    } else if (estilo === 'carita') {
      for (let i = 0; i < 3; i++) this.en(i * 200, () => { sfx(this, 'pop', { volume: 0.25, rate: 1.5 }); this.voluta(p.x + 10, p.y, 0.12, false); });
    } else {
      sfx(this, 'eructo', { volume: 0.35 });
      for (let i = 0; i < 5; i++) this.en(i * 90, () => {
        const h = this.puff(p.x + 10, p.y, 60, 0xb6e06a, 0.85, 29);
        this.tweens.add({ targets: h, y: p.y + 90, alpha: 0, scale: h.scale * 2, duration: 1200, ease: 'Sine.in', onComplete: () => h.destroy() });
      });
    }
  },

  // ---------- Las mini-habilidades de echar el humo ----------

  uiHab(o) { this.habilidad.ui.push(o); return this.nuevo(o); },

  // Arranca la forma elegida; devuelve false si no se puede (entonces se echa el humo de siempre).
  empezarForma(perfecta, nivel) {
    const id = this.forma;
    if (this.habilidad || typeof this[`hab_${id}`] !== 'function') return false;
    this.habilidad = { id, t: 0, perfecta, nivel: nivel ?? -1, ui: [], res: [], fase: 0, cx: ANCHO / 2 };
    this.ocupado = 99;
    this.cola.esp = this.cola.izq = this.cola.der = false;
    this.actualizarChips();
    this.pose('vuper', 'aguanta');
    if (MOVIL && this.nombreHud) this.nombreHud.setAlpha(0); // en el móvil la ayuda ocupa ese sitio
    this.uiHab(texto(this, ANCHO / 2 + 90, 120, (MOVIL && AYUDA_FORMAS_MOVIL[id]) || FORMAS_HUMO[id].ayuda, 22, COLOR.crema, 700).setDepth(60));
    this[`hab_${id}`](this.habilidad, 0, true);
    return true;
  },

  actualizarHabilidad(dt) {
    const h = this.habilidad;
    h.t += dt;
    this[`hab_${h.id}`](h, dt, false);
    this.cola.esp = this.cola.izq = this.cola.der = false;
  },

  // Quita lo que la habilidad tenga en pantalla (sin dar puntos).
  cerrarHabilidad() {
    const h = this.habilidad;
    if (!h) return;
    if (this.nombreHud && this.nombreHud.scene) this.nombreHud.setAlpha(1);
    this.habilidad = null;
    h.ui.forEach(o => { if (o && o.scene) { this.tweens.killTweensOf(o); o.destroy(); } });
    this.aguantando = false;
  },

  // Fin de la habilidad con una calidad q de 0 a 1: puntos, humo, petición y reacción.
  cerrarForma(q) {
    const h = this.habilidad;
    if (!h) return;
    const id = h.id, F = FORMAS_HUMO[id];
    this.cerrarHabilidad();
    q = Phaser.Math.Clamp(q, 0, 1) * (h.perfecta ? 1 : 0.7);
    const mult = (1 + Math.max(0, h.nivel) * 0.15) * (id === 'nube' ? this.m.nube : 1);
    const puntos = Math.round(F.base * q * mult);
    this.bonoMonchis += puntos;
    this.puntosForma += puntos;
    const reg = this.formasHechas[id] = this.formasHechas[id] || { veces: 0, mejor: 0 };
    reg.veces++;
    reg.mejor = Math.max(reg.mejor, q);
    sumarStat(`humo_${id}`);
    this.subido += F.colocon * q * this.potencia;
    this.pose('vuper', 'suelta', 1100);
    this.actores.vuper.hincha = 0.9;
    sfx(this, 'fup', { volume: 0.5 });
    const p = this.boca('vuper');
    this[`soltar_${id}`](p, q);
    const nota = q >= 0.9 ? '¡Perfecto!' : q >= 0.65 ? '¡Bien!' : q >= 0.35 ? 'Regular' : 'Uf…';
    golpeTexto(this, ANCHO / 2, 150, `${F.nombre}: ${nota}${puntos ? ` +${puntos}` : ''}`, q >= 0.65 ? COLOR.amarillo : COLOR.crema, 38);
    if (q >= 0.9) sfx(this, 'campanita', { volume: 0.4 });
    // El nivel de la calada sigue contando: su frase flota en el humo.
    if (h.perfecta && h.nivel >= 1) this.en(700, () => this.fraseNivel(NIVELES_CALADA[h.nivel], p, h.nivel));
    this.resolverPeticion(id, q);
    this.ocupado = 1.3;
    this.actualizarChips();
    if (q >= 0.6 && Math.random() < 0.6) this.en(1100, () => this.reaccionar(id));
  },

  // --- 1 · Aros (ritmo): ESPACIO cuando el aro llegue al círculo ---
  hab_aros(h, dt, ini) {
    if (ini) {
      h.cy = 235;
      h.beats = [0.9, 1.7, 2.5, 3.3];
      h.viaje = 0.8;
      h.pulsos = h.beats.map(() => null);
      h.res = h.beats.map(() => null);
      this.uiHab(this.add.circle(h.cx, h.cy, 44).setStrokeStyle(8, 0xffd23f, 1).setDepth(58));
      return;
    }
    h.beats.forEach((b, k) => {
      if (h.res[k] !== null) return;
      const falta = b - h.t;
      if (falta <= h.viaje && !h.pulsos[k]) h.pulsos[k] = this.uiHab(this.add.circle(h.cx, h.cy, 44).setStrokeStyle(6, 0xffffff, 0.9).setDepth(59));
      if (h.pulsos[k]) h.pulsos[k].setScale(1 + Math.max(0, falta) / h.viaje * 1.6);
      if (falta < -0.3) this.aroResultado(h, k, 0);
    });
    if (this.cola.esp) {
      let mejor = -1, dif = 9;
      h.beats.forEach((b, k) => { if (h.res[k] === null && h.pulsos[k]) { const d = Math.abs(h.t - b); if (d < dif) { dif = d; mejor = k; } } });
      if (mejor >= 0 && dif < 0.34) this.aroResultado(h, mejor, Math.max(0, 1 - Math.max(0, dif - 0.06) / 0.28));
    }
    if (this.habilidad === h && h.res.every(r => r !== null)) this.cerrarForma(h.res.reduce((a, b) => a + b, 0) / h.res.length);
  },

  aroResultado(h, k, q) {
    h.res[k] = q;
    if (h.pulsos[k]) { h.pulsos[k].destroy(); h.pulsos[k] = null; }
    const p = this.boca('vuper');
    if (q > 0.05) {
      sfx(this, 'pop', { volume: 0.4, rate: 0.9 + k * 0.1 });
      this.aro(p.x + 30 + k * 8, p.y - 10 - k * 4, 40 + k * 35, 0.5 + q * 1.1, k % 2 === 1, q > 0.75 ? 0xfff3c4 : 0xe8fbff);
    } else this.voluta(p.x + 10, p.y, 0.14, false);
    golpeTexto(this, h.cx, h.cy + 70, q > 0.8 ? '¡Redondo!' : q > 0.4 ? 'Casi' : q > 0.05 ? 'Torcido' : 'Fuera', q > 0.8 ? COLOR.amarillo : COLOR.crema, 26);
  },

  // --- 2 · Nube gorda (aguantar): mantén y suelta antes de la zona roja ---
  hab_nube(h, dt, ini) {
    if (ini) {
      h.llenado = 0; h.agarrado = false; h.espera = 0;
      const g = this.uiHab(this.add.graphics().setDepth(58));
      g.fillStyle(HEX.tinta, 0.9).fillRoundedRect(h.cx - 190, 215, 380, 38, 14);
      g.fillStyle(HEX.rojo, 0.95).fillRect(h.cx - 186 + 372 * 0.9, 221, 372 * 0.1, 26);
      h.barra = this.uiHab(this.add.rectangle(h.cx - 186, 234, 0, 26, 0xffffff).setOrigin(0, 0.5).setDepth(59));
      return;
    }
    const abajo = this.teclas.SPACE.isDown || this.dedo;
    if (!h.agarrado) {
      if (abajo) { h.agarrado = true; this.aguantando = true; sfx(this, 'calada', { volume: 0.4 }); }
      else { h.espera += dt; if (h.espera > 2.4) this.cerrarForma(0.25); }
      return;
    }
    if (abajo) {
      h.llenado += dt * 0.38 * this.m.lento;
      h.barra.width = 372 * Math.min(1, h.llenado);
      h.barra.fillColor = h.llenado > 0.9 ? HEX.rojo : h.llenado > 0.65 ? 0xffd23f : 0xffffff;
      if (h.llenado >= 1) { this.cerrarHabilidad(); this.tos(); }
    } else this.cerrarForma(Math.min(1, h.llenado / 0.9));
  },

  // --- 3 · Cascada (cruce): ESPACIO cuando la gota cruce la raya dorada ---
  hab_cascada(h, dt, ini) {
    if (ini) {
      h.n = 0; h.estado = 'espera'; h.espera = 0.5; h.y0 = 140; h.a = 420;
      this.uiHab(this.add.rectangle(h.cx, 240, 6, 230, 0xffffff, 0.35).setDepth(57));
      h.marca = this.uiHab(this.add.rectangle(h.cx, 300, 110, 10, 0xffd23f).setDepth(58));
      return;
    }
    if (h.estado === 'espera') {
      h.espera -= dt;
      if (h.espera > 0) return;
      h.estado = 'cae'; h.tg = 0;
      h.yBand = 262 + Math.random() * 60;
      h.tBand = Math.sqrt(2 * (h.yBand - h.y0) / h.a);
      h.marca.y = h.yBand;
      h.gota = this.puff(h.cx, h.y0, 58, 0xf2eef8, 0.95, 59);
      h.ui.push(h.gota);
      return;
    }
    h.tg += dt;
    h.gota.y = h.y0 + 0.5 * h.a * h.tg * h.tg;
    let q = null;
    if (this.cola.esp) q = Math.max(0, 1 - Math.max(0, Math.abs(h.tg - h.tBand) - 0.05) / 0.25);
    else if (h.gota.y > h.yBand + 80) q = 0;
    if (q === null) return;
    h.res.push(q);
    const g = h.gota;
    this.tweens.add({ targets: g, scale: g.scale * 2.2, alpha: 0, duration: 380, onComplete: () => g.destroy() });
    sfx(this, q > 0.05 ? 'pop' : 'deshinchar', { volume: 0.35, rate: 0.9 + h.n * 0.15 });
    golpeTexto(this, h.cx + 140, h.yBand, q > 0.8 ? '¡Justo!' : q > 0.4 ? 'Cerca' : q > 0.05 ? 'Tarde' : 'Fuera', q > 0.8 ? COLOR.amarillo : COLOR.crema, 24);
    h.n++;
    h.estado = 'espera'; h.espera = 0.45;
    if (h.n >= 3) this.cerrarForma(h.res.reduce((a, b) => a + b, 0) / 3);
  },

  // --- 4 · Dragón por la nariz (dos teclas): alterna ← → (o A y D) ---
  hab_dragon(h, dt, ini) {
    if (ini) {
      h.fuego = 0; h.max = 0; h.ult = null; h.dur = 3.4;
      const g = this.uiHab(this.add.graphics().setDepth(58));
      g.fillStyle(HEX.tinta, 0.9).fillRoundedRect(h.cx - 190, 215, 380, 38, 14);
      h.barra = this.uiHab(this.add.rectangle(h.cx - 186, 234, 0, 26, 0xff9a3c).setOrigin(0, 0.5).setDepth(59));
      // Para el móvil (o el ratón): las dos teclas en pantalla.
      if (!window.TACTIL_UI) {
      h.ui.push(boton(this, 470, 640, '← (A)', () => { this.cola.izq = true; }, { ancho: 210, alto: 64, tam: 24, color: HEX.rosa }).setDepth(60));
      h.ui.push(boton(this, 810, 640, '(D) →', () => { this.cola.der = true; }, { ancho: 210, alto: 64, tam: 24, color: HEX.azul }).setDepth(60));
      }
      return;
    }
    const lados = [];
    if (this.cola.izq) lados.push('i');
    if (this.cola.der) lados.push('d');
    lados.forEach(l => {
      if (l !== h.ult) { h.fuego += 0.09; sfx(this, 'pop', { volume: 0.18, rate: 1 + h.fuego }); }
      else h.fuego -= 0.03;
      h.ult = l;
    });
    h.fuego = Phaser.Math.Clamp(h.fuego - 0.12 * dt, 0, 1);
    h.max = Math.max(h.max, h.fuego);
    h.barra.width = 372 * h.fuego;
    const p = this.boca('vuper');
    if (h.fuego > 0.05 && Math.random() < 0.25 + h.fuego) {
      const f = this.puff(p.x + 20, p.y + Phaser.Math.Between(-10, 10), 26 + h.fuego * 60, Phaser.Utils.Array.GetRandom([0xff9a3c, 0xffd23f, 0xff5a4f]), 0.9, 34);
      this.tweens.add({ targets: f, x: f.x + 110 + h.fuego * 140, y: f.y - Phaser.Math.Between(0, 50), alpha: 0, scale: f.scale * 2, duration: 520, onComplete: () => f.destroy() });
    }
    if (h.t >= h.dur || h.fuego >= 1) this.cerrarForma(h.fuego >= 1 ? 1 : h.max);
  },

  // --- 5 · Fantasma (soltar y recoger): mantén para soltarlo, suelta y ESPACIO cuando vuelva ---
  hab_fantasma(h, dt, ini) {
    if (ini) {
      h.soplo = 0; h.agarrado = false; h.espera = 0; h.fase = 0;
      const g = this.uiHab(this.add.graphics().setDepth(58));
      g.fillStyle(HEX.tinta, 0.9).fillRoundedRect(h.cx - 150, 215, 300, 38, 14);
      h.barra = this.uiHab(this.add.rectangle(h.cx - 146, 234, 0, 26, 0xe8f6ff).setOrigin(0, 0.5).setDepth(59));
      return;
    }
    const abajo = this.teclas.SPACE.isDown || this.dedo;
    if (h.fase === 0) {
      if (!h.agarrado) {
        if (abajo) { h.agarrado = true; this.aguantando = true; }
        else { h.espera += dt; if (h.espera > 2.4) this.cerrarForma(0.2); }
        return;
      }
      if (abajo && h.soplo < 1.2) { h.soplo += dt; h.barra.width = 292 * h.soplo / 1.2; return; }
      // Lo suelta: el fantasma sale de la nariz y se va… para volver.
      h.fase = 1;
      this.aguantando = false;
      h.k = h.soplo / 1.2;
      h.T = 0.9 + 1.3 * h.k;
      h.D = 150 + 280 * h.k;
      h.t1 = 0;
      const nariz = this.boca('vuper');
      h.nx = nariz.x + 30; h.ny = nariz.y - 20;
      const cuerpo = this.puff(0, 0, 150, 0xf4f0fa, 0.95, 0);
      const ojos = this.add.graphics();
      ojos.fillStyle(HEX.tinta, 1).fillCircle(-20, -10, 9).fillCircle(20, -10, 9).fillEllipse(0, 26, 22, 28);
      h.f = this.nuevo(this.add.container(h.nx, h.ny, [cuerpo, ojos]).setDepth(57));
      h.ui.push(this.add.circle(h.nx, h.ny, 48).setStrokeStyle(7, 0xffd23f, 1).setDepth(58));
      sfx(this, 'whoosh', { volume: 0.4 });
      this.pose('vuper', 'suelta');
      return;
    }
    h.t1 += dt;
    const p = h.t1 / h.T;
    const s = Math.sin(Math.min(1, p) * Math.PI);
    h.f.setPosition(h.nx + s * h.D * 0.9, h.ny - s * h.D * 0.5 - (p > 1 ? (p - 1) * 160 : 0));
    h.f.setAngle(Math.sin(h.t1 * 7) * 8);
    if (this.cola.esp) {
      const q = Math.max(0, 1 - Math.max(0, Math.abs(h.t1 - h.T) - 0.06) / 0.34) * (0.45 + 0.55 * h.k);
      const f = h.f;
      this.tweens.add({ targets: f, x: h.nx, y: h.ny, scale: 0, duration: 200, ease: 'Back.in', onComplete: () => f.destroy() });
      sfx(this, 'sorbo', { volume: 0.4 });
      this.cerrarForma(q);
    } else if (h.t1 > h.T + 0.4) {
      const f = h.f;
      this.tweens.add({ targets: f, y: f.y - 200, alpha: 0, duration: 700, onComplete: () => f.destroy() });
      this.cerrarForma(0.15);
    }
  },

  // ---------- El humo de cada forma al terminar ----------

  soltar_aros(p, q) {
    for (let i = 0; i < 3; i++) this.en(i * 70, () => this.voluta(p.x + 10, p.y, 0.14, true));
  },

  soltar_nube(p, q) {
    const n = 3 + Math.round(q * 5);
    this.zoom(1 + 0.05 * q, 360, 600);
    sfx(this, 'whoosh', { volume: 0.3 + q * 0.3 });
    for (let i = 0; i < n; i++) this.en(i * 110, () => {
      const h = this.puff(p.x + 20 + i * 14, p.y - i * 8, 110 + q * 230, i % 2 ? 0xf2eef8 : 0xe6d8ff, 0.85, 38);
      this.tweens.add({ targets: h, y: h.y - 170 - i * 14, x: h.x + 60 + i * 20, scale: h.scale * 2.3, alpha: 0, duration: 2300, ease: 'Sine.out', onComplete: () => h.destroy() });
    });
  },

  soltar_cascada(p, q) {
    const n = 7 + Math.round(q * 10);
    sfx(this, 'whoosh', { volume: 0.3 });
    for (let i = 0; i < n; i++) this.en(i * 65, () => {
      const h = this.puff(p.x + 10 + Phaser.Math.Between(-10, 20), p.y + 10, 60 + q * 40, 0xf2eef8, 0.9, 29);
      this.tweens.add({ targets: h, y: p.y + 120 + q * 70, x: h.x + Phaser.Math.Between(-80, 80), scale: h.scale * 2.6, alpha: 0, duration: 1700, ease: 'Sine.in', onComplete: () => h.destroy() });
    });
  },

  soltar_dragon(p, q) {
    this.cameras.main.shake(180, 0.003 + 0.005 * q);
    sfx(this, 'whoosh', { volume: 0.5 });
    const n = 8 + Math.round(q * 14);
    for (let i = 0; i < n; i++) this.en(i * 35, () => {
      const f = this.puff(p.x + 20 + i * 14, p.y + Phaser.Math.Between(-16, 16), 40 + q * 40, Phaser.Utils.Array.GetRandom([0xff9a3c, 0xffd23f, 0xf2eef8]), 0.9, 34);
      this.tweens.add({ targets: f, x: f.x + 140, alpha: 0, scale: f.scale * 2.2, duration: 900, onComplete: () => f.destroy() });
    });
    if (q > 0.6) this.chispa(p.x + 60, p.y);
  },

  soltar_fantasma(p, q) {
    for (let i = 0; i < 4; i++) this.en(i * 90, () => this.voluta(p.x + 10, p.y, 0.16, true));
  },
});

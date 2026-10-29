// Lo que comentan los del barrio según el capítulo en curso: el ambiente sigue la historia.
// Las frases sueltas salen en las charlas de ambiente y al hablar con ellos; las conversaciones,
// cuando coinciden en la sala. Índice = capítulo (0 = cap. 1). PROPUESTA de guion para el juego.

const CHARLAS_CAP = {
  0: {
    palicaso: ['¡Escucha! Hoy viene uno nuevo. Lo noto. Lo noto en el aire.', 'De día esto es un café. Un café muy, muy tranquilo.'],
    perico: ['Pin pin. ¿Contraseña? Es broma. O no.', 'Hoy hay alguien que no se sabe la contraseña. Lo huelo.'],
    blancaso: ['Mientras no llegue ninguna carta, todo bien.', 'Las cuentas cuadran. De día, cuadran.'],
    cotine: ['¿Has desayunado? Yo sí. Dos veces.'],
    lasslow: ['Buenos días, joven. Un señor madruga. Bueno, hoy no.'],
  },
  1: {
    blancaso: ['Mil monchis. Mil. ¿Sabes cuántas bolsas de patatas son mil monchis?', 'Cada monchi a la hucha es una noche menos de bajón.', 'El casero no contesta. Mala señal.'],
    palicaso: ['¡Escucha! Si mejoramos el local, se llena solo. Lo dice la ciencia.', 'Se me ha acabado el género. Otra vez. ¿Quién se lo bebe todo?'],
    cotine: ['Una tarta para la hucha. Si llega entera. Que no llegará.'],
    lasslow: ['Caballeros, aporto mi dignidad a la causa. Y dos monchis.'],
    perico: ['Pin pin. Yo aporto pipas. ¿Valen pipas?'],
  },
  2: {
    blancaso: ['Esta noche me siento y disfruto. Esta noche sí.', 'Si me ves raro, es que estoy bien. Muy bien. Demasiado.'],
    lasslow: ['Blancaso dice que hoy disfruta. JA… perdón. Me alegro por él.'],
    palicaso: ['¡Escucha! Hoy Blancaso fuma con nosotros. Histórico.'],
    pompa: ['…hoy va a pasar algo. Lo veo desde arriba.'],
  },
  3: {
    lasslow: ['¿Alguien ha visto una pajarita? Burdeos. Elegante. Mía.', 'Cenar con el casero. Como un señor. Sin… incidentes.'],
    blancaso: ['Las facturas del casero estaban aquí. Estaban.', 'Si el casero ve esto así, nos cierra. Y con razón.'],
    palicaso: ['¡Escucha! La tragaperras de la tienda paga. A veces. Casi.'],
    perico: ['Pin pin. El casero tiene cara de llave. Lo digo y lo mantengo.'],
    cotine: ['Para la cena con el casero hago postre. Si sobrevive.'],
  },
  4: {
    blancaso: ['Faltan monchis de la hucha. Y nadie sabe nada. Qué raro.', 'Precinto a la tragaperras. Hasta nueva orden.'],
    palicaso: ['¡Escucha! No he sido yo. Bueno, escucha, depende de lo que entiendas por «yo».', 'Hoy no me apetece hablar. …Es broma. Escucha.'],
    perico: ['Pin pin. Yo sé quién ha sido. Pregúntame.', 'A las cuatro, en la tienda, había una estrella. Solo digo eso.'],
    lasslow: ['Yo solo cogí un caramelo. Lo juro por mi pajarita.'],
    cotine: ['¿La hucha? Yo solo me como lo que se come. La hucha no se come.'],
  },
  5: {
    perico: ['Pin pin. Yo sé un secreto. Uno gordo.', '¡Vuper es…! …nada, nada. Pipas.'],
    palicaso: ['¡Escucha! El periquito dice que el rider es un superhéroe. JAJAJA.'],
    lasslow: ['¿El rider, un héroe? JA… perdón. Aunque tiene algo, ¿eh?'],
    blancaso: ['Si el casero oye las tonterías de Perico, nos toma por locos.'],
    cotine: ['Monchiman me salvó una vez con una tarta. ¿O era yo la tarta?'],
  },
  6: {
    blancaso: ['Esta noche viene el casero. A fondo. Que no se vea nada raro.', 'Si pasa la inspección, me siento en el sofá una semana.'],
    pompa: ['…sin mis discos no pincho. Y sin música el casero lo ve todo.'],
    palicaso: ['¡Escucha! Hoy hablo poco. El casero se pone nervioso si hablo.'],
    lasslow: ['Me pongo la pajarita. Para inspirar confianza. Y para tapar.'],
    perico: ['Pin pin. Si el casero pregunta, yo soy decoración.'],
  },
  7: {
    blancaso: ['Ya casi. Si llegamos a mil, esta noche me siento. De verdad.', 'Nunca había visto la hucha tan llena. Me da miedo tocarla.'],
    cotine: ['La tarta de esta noche no me la como. No. No. …No.', 'Entera. Para Blancaso. Que conste en acta.'],
    palicaso: ['¡Escucha! Si se salva el bar, hago un discurso. Uno largo.'],
    perico: ['Pin pin. Apuesto mis pipas a que Cotine se come la tarta.'],
    lasslow: ['Para la fiesta llevo mi mejor pajarita. Y aire fresco.'],
  },
};

const DIALOGOS_CAP = {
  1: [[['blancaso', 'Mil monchis, Palicaso. Mil.'], ['palicaso', '¡Escucha! Eso son… muchos monchis.'], ['blancaso', 'Otra vez no…']]],
  3: [[['lasslow', '¿Y si al casero le cuento un chiste?'], ['blancaso', 'Ni se te ocurra.'], ['lasslow', 'JA… vale.']]],
  4: [[['blancaso', 'Palicaso, ¿y la caja?'], ['palicaso', '¡Escucha! ¿Qué caja? ¿Esa caja? Ah, esa caja…'], ['blancaso', '…']]],
  5: [[['perico', '¡Vuper es Monchiman!'], ['palicaso', '¡Y yo soy la luna!'], ['perico', 'Pin pin. Tú eres una estrella.']]],
  6: [[['pompa', '…¿y mis discos?'], ['blancaso', 'Los tiene el casero. De fianza.'], ['pompa', '…pues vaya noche.']]],
  7: [[['cotine', 'Blancaso, no mires la cocina.'], ['blancaso', '¿Por qué?'], ['cotine', 'Sorpresa. Entera. Casi.']]],
};

// Una frase del capítulo para alguien (o null si no tiene).
function fraseCapitulo(id) {
  const c = CHARLAS_CAP[Math.min(ESTADO.capitulo || 0, 7)];
  return c && c[id] && c[id].length ? Phaser.Utils.Array.GetRandom(c[id]) : null;
}

// Las noches de cada personaje (fase 4 del arco, 07_juego/arco-propuesta.md): subir de nivel su
// minijuego abre su pequeña historia en tres escenas de cómic (niveles 3, 5 y 8). La última es su
// momento persona. Algunas abren un minijuego nuevo (Por los aires, El palo).
// PROPUESTA de guion para el juego, aprobada el 29/10/2026: no es canon de la serie.

const NOCHES = {
  cotine: {
    nombre: 'La noche de Cotine', mision: 'Tarta',
    pasos: [
      { nivel: 3, premio: 40, lineas: [
        ['cotine', 'Rider, tengo un plan: una tarta para Blancaso. Entera. Que nunca le ha llegado una entera.'],
        ['vuper', '¿Y si te la comes?'],
        ['cotine', '¿Qué? Tenía hambre. …Esta vez no. Te lo juro por el palo.'],
      ] },
      { nivel: 5, premio: 70, abre: 'Palo', lineas: [
        ['cotine', '¡Mi palo! ¡Alguien se ha llevado mi palo!'],
        ['perico', 'Pin pin. Era una percha perfecta.'],
        ['narrador', 'Sin palo, Cotine no tiene freno: se hincha, y con la tarta en la cabeza empieza a subir por encima del barrio. (Nuevo minijuego: El palo, hablando con Cotine.)'],
      ] },
      { nivel: 8, premio: 150, lineas: [
        ['cotine', 'Blancaso. Toma. Entera. No le falta ni una miga.'],
        ['blancaso', '…Es la primera tarta entera que veo en Unaké.'],
        ['narrador', 'A Cotine se le limpian los ojos. Por una vez, lo que quería le ha salido entero.'],
        ['cotine', '…¿Me das un trocito?'],
      ] },
    ],
  },
  lasslow: {
    nombre: 'La noche de Lasslow', mision: 'Lasslow',
    pasos: [
      { nivel: 3, premio: 40, lineas: [
        ['lasslow', 'Joven, una consulta entre caballeros. ¿Cómo se le habla a una dama que vive en el techo?'],
        ['vuper', '¿La Pompa?'],
        ['lasslow', 'Shhh. JA… perdón. Es que me pongo nervioso.'],
      ] },
      { nivel: 5, premio: 70, abre: 'Aires', lineas: [
        ['lasslow', 'Lo he decidido: subiré hasta ella. Como un señor.'],
        ['vuper', '¿Cómo?'],
        ['lasslow', 'Llevo toda la noche aguantándome. Tengo… combustible.'],
        ['narrador', 'Nuevo minijuego: Por los aires, hablando con Lasslow.'],
      ] },
      { nivel: 8, premio: 150, lineas: [
        ['lasslow', 'Señorita Pompa. Llevo años mirándola desde abajo. Es usted… la calma.'],
        ['pompa', '…'],
        ['pompa', '…Gracias. Nadie había subido tan alto por mí.'],
        ['narrador', 'A Lasslow se le limpian los ojos. Un señor, de verdad.'],
        ['lasslow', '¡Que se me ha escapao!'],
      ] },
    ],
  },
  pompa: {
    nombre: 'La noche de la Pompa', mision: 'DJ',
    pasos: [
      { nivel: 3, premio: 40, lineas: [
        ['pompa', '…¿Puedes bajar un poco el mundo? Es que suena muy alto.'],
        ['vuper', 'Lo intento.'],
      ] },
      { nivel: 5, premio: 70, lineas: [
        ['pompa', 'Hoy pincho algo tranquilo. Que nadie me sople.'],
        ['palicaso', '¡ESCUCHA, ESCUCHA!'],
        ['pompa', '…Ya está. Ya me he movido.'],
      ] },
      { nivel: 8, premio: 150, lineas: [
        ['pompa', 'Mira. Todo el bar bailando… y yo quieta. Quieta del todo.'],
        ['narrador', 'A la Pompa se le limpian los ojos. Por fin, quietud.'],
        ['pompa', 'Yo no, que exploto. …Bueno, hoy no.'],
      ] },
    ],
  },
  blancaso: {
    nombre: 'La noche de Blancaso', mision: 'Cuentas',
    pasos: [
      { nivel: 3, premio: 40, lineas: [
        ['blancaso', 'Cuadra. La caja cuadra. Es la primera vez en… nunca.'],
        ['palicaso', '¡Escucha! ¡Eso hay que celebrarlo!'],
        ['blancaso', 'Otra vez no…'],
      ] },
      { nivel: 5, premio: 70, lineas: [
        ['blancaso', 'Rider, ¿me ayudas? Quiero sentarme en mi sofá. Solo sentarme. Sin que se rompa nada.'],
        ['narrador', 'Se rompe la cafetera.'],
        ['blancaso', '…Mañana.'],
      ] },
      { nivel: 8, premio: 150, lineas: [
        ['blancaso', 'Sentado. En mi sofá. En mi bar. Y no se ha roto nada.'],
        ['narrador', 'A Blancaso se le limpian los ojos. Nadie olvida la noche que estuvo de Blancaso.'],
        ['blancaso', '…Se ha roto algo, ¿verdad?'],
      ] },
    ],
  },
  perico: {
    nombre: 'La noche de Perico', mision: 'Pipas',
    pasos: [
      { nivel: 3, premio: 40, lineas: [
        ['perico', 'Pin pin. Te apuesto mis pipas a que no adivinas mi secreto.'],
        ['vuper', '¿Que eres un periquito?'],
        ['perico', 'Pin pin. …Eso no es un secreto.'],
      ] },
      { nivel: 5, premio: 70, lineas: [
        ['perico', 'Me llamo Perico. Pe-ri-co. Pero todos me llamáis…'],
        ['vuper', 'Periquito.'],
        ['perico', 'Pin pin. ¿Ves? No lo puedo evitar.'],
      ] },
      { nivel: 8, premio: 150, lineas: [
        ['perico', 'Toma. Mi mejor pipa. La guardo desde que abrió Unaké.'],
        ['vuper', '¿Para mí?'],
        ['narrador', 'A Perico se le limpian los ojos. Alguien le ha tomado en serio, y él ha tomado en serio a alguien.'],
        ['perico', 'Me la debes. Pin pin.'],
      ] },
    ],
  },
  palicaso: {
    nombre: 'La noche de Palicaso', mision: 'Barra',
    pasos: [
      { nivel: 3, premio: 40, lineas: [
        ['palicaso', '¡Escucha! ¿Te he contado cómo abrimos Unaké? El del registro nos preguntó: «¿Una qué?».'],
        ['blancaso', 'Y se quedó el nombre. Lo contamos todas las noches.'],
      ] },
      { nivel: 5, premio: 70, lineas: [
        ['palicaso', 'Revancha. Dados. Esta vez no me enrollo.'],
        ['vuper', 'Ya te estás enrollando.'],
        ['palicaso', '¡Escucha, escucha! Eso es parte de la estrategia.'],
      ] },
      { nivel: 8, premio: 150, lineas: [
        ['palicaso', 'Oye, rider…'],
        ['palicaso', '¿Y tú qué? Cuéntame. De verdad. Te escucho.'],
        ['narrador', 'A Palicaso se le limpian los ojos. Por una vez, el que escucha es él.'],
        ['palicaso', '…Que, por cierto, eso me recuerda una historia…'],
      ] },
    ],
  },
  monchiman: {
    nombre: 'La noche de Monchiman', mision: 'Rescate',
    pasos: [
      { nivel: 3, premio: 40, lineas: [
        ['narrador', 'En su cuarto, Monchiman prueba un invento nuevo: un resucitador con pajita.'],
        ['vuper', 'Vale, vale… funciona. Más o menos.'],
      ] },
      { nivel: 5, premio: 70, lineas: [
        ['lasslow', 'JAJAJA… ¡No, no, que estoy bien! ¡Solo me estaba riendo!'],
        ['narrador', 'Monchiman el pesado: rescata a todo el que ve. Lo necesite o no.'],
        ['vuper', 'Vale, vale… Igual me he pasado.'],
      ] },
      { nivel: 8, premio: 150, lineas: [
        ['narrador', 'Hace años, en una fiesta, a Vuper le dio su primer amarillo. Solo. Nadie le ayudó. Algo dulce le salvó.'],
        ['vuper', 'Juré que a nadie más le pasaría solo.'],
        ['narrador', 'Así nació Monchiman. ¡Que no cunda el amarillo!'],
      ] },
    ],
  },
};

// ¿Hay algún paso de noche pendiente? Devuelve [id, índice, paso] o null.
function nochePendiente() {
  ESTADO.noches = ESTADO.noches || {};
  for (const [id, n] of Object.entries(NOCHES)) {
    for (let i = 0; i < n.pasos.length; i++) {
      const k = `${id}-${i}`;
      if (ESTADO.noches[k]) continue;
      if (nivelDe(n.mision) >= n.pasos[i].nivel) return [id, i, n.pasos[i]];
      break; // los pasos van en orden
    }
  }
  return null;
}

// Minijuegos que abre una noche: quién los ofrece en su tarjeta.
function minijuegosAbiertos(id) {
  const n = NOCHES[id];
  if (!n || !ESTADO.noches) return [];
  return n.pasos.filter((p, i) => p.abre && ESTADO.noches[`${id}-${i}`]).map(p => p.abre);
}

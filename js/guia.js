// El prólogo guiado (capítulo 1): enseña el juego de uno en uno, sin agobiar.
// Una sola indicación en pantalla («Paso N de 7»), una flecha hacia dónde ir y un aro sobre lo que hay
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
  },
  {
    texto: () => 'Compra papel y un mechero en el mostrador de la tienda.',
    sala: 'tienda', cosa: 'mostrador', hecho: () => ESTADO.inv.papel > 0 && ESTADO.inv.mechero,
  },
  {
    texto: () => 'Busca la boquilla: brilla en algún sitio del barrio. Pasa por encima para cogerla.',
    sala: () => ESTADO.boquillaEn && ESTADO.boquillaEn.sala, hecho: () => ESTADO.inv.boquilla > 0,
  },
  {
    texto: () => 'Ve a la puerta de Unaké. Perico pide la contraseña: tu primer minijuego.',
    sala: 'fuera', cosa: 'perico', hecho: () => ESTADO.dentro,
  },
  {
    texto: () => 'Ya estás dentro. Pídele la bolsita a Palicaso, en la barra.',
    sala: 'dentro', cosa: 'palicaso', hecho: () => ESTADO.inv.bolsita > 0,
  },
  {
    texto: () => 'Lo tienes todo. Siéntate en el sofá: lía y fuma, y verás el mundo humo.',
    sala: 'dentro', cosa: 'sofa', hecho: () => stat('fumadas') >= 1,
  },
];

function guiaActiva() { return (ESTADO.capitulo || 0) === 0 && !ESTADO.guiaHecha; }

// Consejos que salen una sola vez, justo cuando hacen falta (después del prólogo).
const CONSEJOS = [
  { id: 'hambre', cuando: () => ESTADO.hambre > 60, titulo: 'Tienes hambre', texto: 'Come en la tienda de 24 h. Con mucha hambre pierdes vida, y sin vida te da un amarillo.' },
  { id: 'pasado', cuando: s => s.mundo === 'normal' && stat('fumadas') >= 1, titulo: 'Se te ha pasado', texto: 'Has vuelto al mundo normal (de día). Para volver al humo, lía y fuma otra vez en el sofá.' },
  { id: 'objetivos', cuando: () => (ESTADO.capitulo || 0) >= 1, titulo: 'Tus objetivos', texto: 'Arriba a la derecha, los del capítulo. Puedes plegarlos con el botón (o la tecla O).' },
  { id: 'misiones', cuando: s => s.mundo === 'humo' && (ESTADO.capitulo || 0) >= 1, titulo: 'Las misiones', texto: 'Los «!» sobre la gente son minijuegos: estrellas, monchis y niveles. De noche pagan más.' },
  { id: 'vida', cuando: () => ESTADO.vida < 50, titulo: 'Ojo con la vida', texto: 'El resucitador de la tienda te da vida de golpe. Comer también ayuda.' },
];

const Guia = {
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
      if (s.guia.indice >= 0) { sfx(s, 'campanita', { volume: 0.5 }); golpeTexto(s, ANCHO / 2, 260, '¡Bien!', COLOR.verde, 44); }
      s.guia.indice = i;
      s.guia.c.setScale(0.9);
      s.tweens.add({ targets: s.guia.c, scale: 1, duration: 220, ease: 'Back.out' });
    }
    const sala = typeof p.sala === 'function' ? p.sala() : p.sala;
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

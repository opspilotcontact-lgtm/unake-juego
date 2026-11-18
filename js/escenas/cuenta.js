// «La cuenta de la noche» (guinda §3): al acabar, entre los créditos y los poscréditos, tus números
// en la agenda de Blancaso, cada uno con el comentario de quien toca. Se lee a tu ritmo (E para pasar).
// PROPUESTA para el juego: nada de esto es canon de la serie.

// La hoja de la agenda (la de circulo.js): papel crema, rayas azules, margen rojo; con `cuadros`, de cuadros.
function hojaAgenda(g, w, h, paso = 34, cuadros = false) {
  g.fillStyle(0xf6ecc8, 1).lineStyle(6, HEX.tinta, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 10).strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
  g.lineStyle(2, 0x9bb7d6, cuadros ? 0.4 : 0.7);
  for (let y = -h / 2 + 50; y <= h / 2 - 20; y += paso) g.lineBetween(-w / 2 + 20, y, w / 2 - 20, y);
  if (cuadros) for (let x = -w / 2 + 20 + paso; x < w / 2 - 20; x += paso) g.lineBetween(x, -h / 2 + 16, x, h / 2 - 16);
  g.lineStyle(3, 0xd9584f, 0.6).lineBetween(-w / 2 + 70, -h / 2, -w / 2 + 70, h / 2);
  return g;
}

// El tiempo jugado: un reloj que solo cuenta con la pestaña a la vista y fuera de la portada.
setInterval(() => {
  try {
    const j = window.juego;
    if (document.hidden || !j || !j.scene || j.scene.isActive('Portada') || j.scene.isActive('Arranque')) return;
    ESTADO.msJugados = (ESTADO.msJugados || 0) + 5000;
  } catch (e) { /* sin juego todavía */ }
}, 5000);

// Tinta de cada uno sobre el papel (los colores de QUIEN no se leen en crema).
const TINTA_CUENTA = { blancaso: '#2b3fd6', palicaso: '#a86a00', cotine: '#c2185b', lasslow: '#b5542a', perico: '#5a6070', pompa: '#1d84a8', vuper: '#2e7d32', nadie: '#6b5b7b' };
const NOMBRE_CUENTA = { blancaso: 'BLANCASO', palicaso: 'PALICASO', cotine: 'COTINE', lasslow: 'LASSLOW', perico: 'PERICO', pompa: 'LA POMPA', vuper: 'VUPER', nadie: '' };

function vecesCuenta(n, una, varias) { return `${n} ${n === 1 ? una : varias}`; }

// Las líneas: [quién, frase, (lo que entra tarde: [quién, frase])].
function lineasCuenta() {
  const ms = ESTADO.msJugados || 0;
  const horas = Math.floor(ms / 3600000);
  const tiempo = horas >= 1 ? `${vecesCuenta(horas, 'hora', 'horas')}. Las he contado. Dos veces.` : `${Math.max(1, Math.round(ms / 60000))} minutos. Los he contado. Dos veces.`;
  const ganadas = stat('victorias'), perdidas = Math.max(0, stat('partidas') - ganadas);
  const madre = stat('madrePillado') || Object.values(ESTADO.interrupciones || {}).filter(v => v === 'pillado').length;
  const comidas = stat('comidas');
  return [
    ['blancaso', `${tiempo}`],
    ['palicaso', `¡Escucha! ${stat('fumadas')} en el sofá. El sofá tiene tu forma y la mía, que yo una vez…`],
    ['cotine', `Has comido ${vecesCuenta(comidas, 'vez', 'veces')}.`, ['cotine', `(ñam) Yo ${comidas + 1}.`]],
    ['lasslow', `${vecesCuenta(stat('pedosRespirados'), 'pedo respirado', 'pedos respirados')}, caballero. Pido disculpas al respetable. A usted en concreto.`],
    ['perico', `Ganadas ${ganadas}. Ganadas ${ganadas}. Perdidas… ${perdidas ? 'no lo digo. No lo digo.' : 'ninguna. Ninguna.'}`],
    ['pompa', `${vecesCuenta(totalEstrellas(), 'estrella', 'estrellas')}.`, ['pompa', '…Bien.']],
    ['blancaso', `${stat('monchisGanados')} monchis. Ni un recibo.`],
    ['nadie', `El gato tuerto se ha dejado acariciar ${vecesCuenta(stat('gatos'), 'vez', 'veces')}. Él dice que ninguna.`],
    madre ? ['vuper', `Mi madre me pilló ${vecesCuenta(madre, 'vez', 'veces')}.`, ['perico', 'Lo he visto. Lo he visto.']]
      : ['vuper', 'Mi madre no me ha pillado nunca.', ['perico', 'Mentira. Mentira.']],
    ['blancaso', `${vecesCuenta(stat('desmayos'), 'palote', 'palotes')}. Tachados.`],
  ];
}

class Cuenta extends Phaser.Scene {
  constructor() { super('Cuenta'); }

  create(datos) {
    this.fase = 0;        // 0 = escribiendo, 1 = todo escrito, 2 = saliendo
    this.desdePortada = !!(datos && datos.desdePortada); // abierta desde el menú: vuelve a la portada
    this.input.enabled = true; // irA() lo apaga al salir y la escena se reutiliza si se vuelve a abrir
    this.relojes = [];
    fondo(this, 'bg-sofa');
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.82);
    const W = 1160, H = 610;
    this.hoja = this.add.container(ANCHO / 2, ALTO / 2 - 12).setAngle(-0.6);
    this.hoja.add(hojaAgenda(this.add.graphics(), W, H, 44, true));
    this.hoja.add(this.add.text(0, -H / 2 + 34, 'La cuenta de la noche', { fontFamily: FUENTE, fontSize: '34px', color: '#2b3fd6' }).setOrigin(0.5).setAngle(-1.5));
    const lineas = lineasCuenta();
    const x0 = -W / 2 + 90, xTxt = x0 + 150, y0 = -H / 2 + 92, paso = 46;
    this.filas = lineas.map(([quien, frase, tarde], i) => {
      const y = y0 + i * paso;
      const c = this.add.container(0, 0).setAlpha(0);
      c.add(this.add.text(x0, y, NOMBRE_CUENTA[quien], { fontFamily: FUENTE, fontSize: '17px', color: TINTA_CUENTA[quien] }).setOrigin(0, 0.5));
      const t = this.add.text(xTxt, y, `«${frase}»`, { fontFamily: FUENTE, fontSize: '19px', color: '#2b2b3a' }).setOrigin(0, 0.5);
      if (quien === 'nadie') t.setText(frase).setColor(TINTA_CUENTA.nadie);
      c.add(t);
      let tardeT = null;
      if (tarde) {
        const voz = tarde[0] === quien ? '' : `${NOMBRE_CUENTA[tarde[0]]}: `;
        tardeT = this.add.text(t.x + t.width + 14, y, `${voz}«${tarde[1]}»`, { fontFamily: FUENTE, fontSize: '17px', color: TINTA_CUENTA[tarde[0]] }).setOrigin(0, 0.5).setAlpha(0);
        c.add(tardeT);
      }
      this.hoja.add(c);
      return { c, tardeT };
    });
    // El último chiste: lo apunta, cierra… y no se va.
    const yFin = y0 + lineas.length * paso + 12;
    this.remate = [
      this.add.text(x0, yFin, 'BLANCASO', { fontFamily: FUENTE, fontSize: '17px', color: TINTA_CUENTA.blancaso }).setOrigin(0, 0.5),
      this.add.text(xTxt, yFin, '«Y esto también lo apunto.»', { fontFamily: FUENTE, fontSize: '21px', color: '#2b3fd6' }).setOrigin(0, 0.5),
    ];
    this.remate.push(this.add.text(this.remate[1].x + this.remate[1].width + 18, yFin, '«…Me voy a casa.»', { fontFamily: FUENTE, fontSize: '21px', color: '#2b3fd6' }).setOrigin(0, 0.5));
    this.remate.push(this.add.text(this.remate[2].x + this.remate[2].width + 14, yFin + 2, '(No se va.)', { fontFamily: FUENTE, fontSize: '16px', color: TINTA_CUENTA.nadie }).setOrigin(0, 0.5));
    this.remate.forEach(o => { o.setAlpha(0); this.hoja.add(o); });

    // Una fila cada medio segundo; lo que entra tarde, un segundo después (como la Pompa).
    this.filas.forEach((f, i) => {
      this.relojes.push(this.time.delayedCall(700 + i * 520, () => {
        this.tweens.add({ targets: f.c, alpha: 1, duration: 220 });
        sfx(this, 'papel', { volume: 0.12, rate: 1.2 + (i % 3) * 0.1 });
      }));
      if (f.tardeT) this.relojes.push(this.time.delayedCall(1700 + i * 520, () => this.tweens.add({ targets: f.tardeT, alpha: 1, duration: 260 })));
    });
    const tFin = 700 + this.filas.length * 520 + 1100;
    [0, 1].forEach(k => this.relojes.push(this.time.delayedCall(tFin, () => this.tweens.add({ targets: this.remate[k], alpha: 1, duration: 260 }))));
    this.relojes.push(this.time.delayedCall(tFin + 1300, () => this.tweens.add({ targets: this.remate[2], alpha: 1, duration: 260 })));
    this.relojes.push(this.time.delayedCall(tFin + 2500, () => this.listo()));

    this.input.keyboard.on('keydown-E', () => this.pasar());
    this.input.keyboard.on('keydown-SPACE', () => this.pasar());
    entrar(this, datos);
  }

  // Primera E: se escribe todo de golpe. Segunda: a los poscréditos.
  pasar() {
    if (this.fase === 0) return this.listo();
    if (this.fase === 1) return this.salir();
  }

  listo() {
    if (this.fase !== 0) return;
    this.fase = 1;
    this.relojes.forEach(r => r.remove());
    this.filas.forEach(f => { f.c.setAlpha(1); if (f.tardeT) f.tardeT.setAlpha(1); });
    this.remate.forEach(o => o.setAlpha(1));
    sfx(this, 'campanita', { volume: 0.35 });
    boton(this, ANCHO / 2, 690, this.desdePortada ? 'Volver (E)' : 'Después de los créditos… (E)', () => this.salir(), { ancho: 460, alto: 52, tam: 22 }).setDepth(40);
  }

  // Cierra la agenda (un plegado corto) y sigue.
  salir() {
    if (this.fase === 2) return;
    this.fase = 2;
    sfx(this, 'fup', { volume: 0.4 });
    this.tweens.add({ targets: this.hoja, scaleY: 0.04, duration: 260, ease: 'Sine.in', onComplete: () => irA(this, this.desdePortada ? 'Portada' : 'Poscreditos') });
  }
}

// El lenguaje de cómic de la serie (E00 y motor/v1/transiciones.py) llevado al juego:
// - Cortinillas con firma de personaje: estrella (Palicaso), burbuja (la Pompa), pringue (Puky),
//   iris (la puerta), barrido (cambio rápido). La de humo de siempre sigue en comun.js.
// - Pantallas de cómic: reacción a color con líneas de concentración, viñetas que entran torcidas,
//   impacto con estrella, emotes dibujados (fx-* de Gemini) y cartela de personaje.
// Duraciones como en la serie: reacción ~0,5 s, viñeta cada 0,18 s, cortinillas 0,35-0,6 s.

const UNAKE = { amarillo: 0xffd628, rosa: 0xfe78aa, morado: 0x46245c, cian: 0x5adceb, crema: 0xfff6e8, verde: 0x96c846, noche: 0x1a1026 };

const Comic = {
  // ---------- Cortinillas: cubrir(scene, alCubrir) y destapar(scene) ----------
  cubrir: {
    estrella(scene, hecho) {
      const e = scene.add.star(ANCHO / 2, ALTO / 2, 5, 60, 140, UNAKE.amarillo).setStrokeStyle(10, HEX.tinta).setDepth(1000).setScale(0);
      sfx(scene, 'fiuuu', { volume: 0.5 });
      scene.tweens.add({ targets: e, scale: 9, angle: 220, duration: 520, ease: 'Quad.in', onComplete: () => { hecho(); e.destroy(); } });
    },
    burbuja(scene, hecho) {
      const c = scene.add.container(ANCHO / 2, ALTO / 2).setDepth(1000).setScale(0);
      c.add(scene.add.circle(0, 0, 120, UNAKE.cian, 1).setStrokeStyle(8, HEX.tinta));
      c.add(scene.add.ellipse(-40, -50, 50, 26, 0xffffff, 0.8).setAngle(-30));
      sfx(scene, 'hinchar', { volume: 0.5 });
      scene.tweens.add({ targets: c, scale: 7, duration: 560, ease: 'Back.in', onComplete: () => { hecho(); c.destroy(); } });
    },
    pringue(scene, hecho) {
      const g = scene.add.graphics().setDepth(1000);
      sfx(scene, 'blurp', { volume: 0.6 });
      scene.tweens.addCounter({
        from: 0, to: 1, duration: 560, ease: 'Quad.in',
        onUpdate: tw => Comic.pintarPringue(g, tw.getValue() * (ALTO + 160), scene.time.now),
        onComplete: () => { hecho(); g.destroy(); },
      });
    },
    iris(scene, hecho, at = { x: ANCHO / 2, y: ALTO / 2 }) {
      const g = scene.add.graphics().setDepth(1000);
      sfx(scene, 'whoosh', { volume: 0.5 });
      scene.tweens.addCounter({
        from: 900, to: 0, duration: 520, ease: 'Quad.in',
        onUpdate: tw => Comic.pintarIris(g, at, tw.getValue()),
        onComplete: () => { hecho(); g.destroy(); },
      });
    },
    barrido(scene, hecho) {
      const c = Comic.capaBarrido(scene);
      c.x = -ANCHO * 1.3;
      sfx(scene, 'zas', { volume: 0.5 });
      scene.tweens.add({ targets: c, x: 0, duration: 300, ease: 'Quad.in', onComplete: () => { hecho(); c.destroy(); } });
    },
  },

  destapar: {
    estrella(scene) {
      const e = scene.add.star(ANCHO / 2, ALTO / 2, 5, 60, 140, UNAKE.amarillo).setStrokeStyle(10, HEX.tinta).setDepth(1000).setScale(9);
      scene.tweens.add({ targets: e, scale: 0, angle: 360, duration: 480, ease: 'Quad.out', onComplete: () => e.destroy() });
    },
    burbuja(scene) {
      const fondo = scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, UNAKE.cian).setDepth(1000);
      sfx(scene, 'pop', { volume: 0.6 });
      scene.time.delayedCall(60, () => {
        fondo.destroy();
        for (let i = 0; i < 28; i++) {
          const a = (i / 28) * Math.PI * 2;
          const g = scene.add.circle(ANCHO / 2, ALTO / 2, Phaser.Math.Between(10, 26), UNAKE.cian).setStrokeStyle(4, HEX.tinta).setDepth(1000);
          scene.tweens.add({ targets: g, x: ANCHO / 2 + Math.cos(a) * 900, y: ALTO / 2 + Math.sin(a) * 600, scale: 0.3, duration: 520, ease: 'Quad.out', onComplete: () => g.destroy() });
        }
      });
    },
    pringue(scene) {
      const g = scene.add.graphics().setDepth(1000);
      scene.tweens.addCounter({
        from: 0, to: 1, duration: 520, ease: 'Quad.in',
        onUpdate: tw => { g.clear(); g.y = tw.getValue() * (ALTO + 200); Comic.pintarPringue(g, ALTO + 160, scene.time.now, true); },
        onComplete: () => g.destroy(),
      });
    },
    iris(scene, at = { x: ANCHO / 2, y: ALTO / 2 }) {
      const g = scene.add.graphics().setDepth(1000);
      scene.tweens.addCounter({
        from: 0, to: 900, duration: 560, ease: 'Quad.out',
        onUpdate: tw => Comic.pintarIris(g, at, tw.getValue()),
        onComplete: () => g.destroy(),
      });
    },
    barrido(scene) {
      const c = Comic.capaBarrido(scene);
      scene.tweens.add({ targets: c, x: ANCHO * 1.3, duration: 320, ease: 'Quad.out', onComplete: () => c.destroy() });
    },
  },

  // Cortina amarilla de Puky con el borde de abajo ondulado y goterones.
  pintarPringue(g, alto, t, sinLimpiar) {
    if (!sinLimpiar) g.clear();
    g.fillStyle(0xf2d23c, 1).lineStyle(8, HEX.tinta, 1);
    const pts = [{ x: -20, y: -40 }, { x: ANCHO + 20, y: -40 }];
    for (let x = ANCHO + 20; x >= -20; x -= 40) {
      const gota = Math.max(0, Math.sin(x * 0.037 + 1.3)) * 70;
      pts.push({ x, y: alto - 80 + Math.sin(x / 90 + t / 160) * 18 + gota });
    }
    g.fillPoints(pts, true).strokePoints(pts, true);
  },

  // Fundido en círculo: un aro de grosor enorme deja un agujero de radio r.
  pintarIris(g, at, r) {
    g.clear();
    const grueso = 3200;
    g.lineStyle(grueso, UNAKE.noche, 1).strokeCircle(at.x, at.y, r + grueso / 2);
    if (r > 4) g.lineStyle(10, UNAKE.crema, 1).strokeCircle(at.x, at.y, r);
  },

  capaBarrido(scene) {
    const c = scene.add.container(0, 0).setDepth(1000);
    c.add(scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO * 1.2, ALTO, UNAKE.morado));
    for (let i = 0; i < 14; i++) {
      const y = Phaser.Math.Between(0, ALTO);
      c.add(scene.add.rectangle(Phaser.Math.Between(-200, ANCHO), y, Phaser.Math.Between(200, 600), Phaser.Math.Between(4, 14), 0xffffff, 0.7));
    }
    return c;
  },

  // ---------- Pantallas de cómic ----------

  // Líneas de concentración desde los bordes (una textura por fase, se alternan).
  texturasLineas(scene) {
    if (scene.textures.exists('lineas-0')) return;
    for (let f = 0; f < 3; f++) {
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 1);
      for (let i = 0; i < 70; i++) {
        const a = (i / 70) * Math.PI * 2 + f * 0.03 + Math.random() * 0.04;
        const r1 = 330 + Math.random() * 80;
        const ancho = 0.012 + Math.random() * 0.018;
        g.fillTriangle(
          ANCHO / 2 + Math.cos(a) * 1100, ALTO / 2 + Math.sin(a) * 1100,
          ANCHO / 2 + Math.cos(a + ancho) * 1100, ALTO / 2 + Math.sin(a + ancho) * 1100,
          ANCHO / 2 + Math.cos(a) * r1, ALTO / 2 + Math.sin(a) * r1 * 0.6,
        );
      }
      g.generateTexture(`lineas-${f}`, ANCHO, ALTO);
      g.destroy();
    }
  },

  // Pantalla de reacción: el personaje llena el cuadro sobre color plano, medio segundo.
  reaccion(scene, sprite, { color = UNAKE.amarillo, ms = 650, sonido = 'golpe' } = {}) {
    return new Promise(res => {
      if (!scene.textures.exists(sprite)) return res();
      Comic.texturasLineas(scene);
      const c = scene.add.container(0, 0).setDepth(970);
      c.add(scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, color));
      const l = scene.add.image(ANCHO / 2, ALTO / 2, 'lineas-0').setAlpha(0.55);
      c.add(l);
      const img = scene.add.image(ANCHO / 2, ALTO / 2 + 30, sprite);
      img.setScale(Math.min(600 / img.height, 900 / img.width));
      c.add(img);
      const borde = scene.add.graphics().lineStyle(18, HEX.tinta, 1).strokeRect(9, 9, ANCHO - 18, ALTO - 18);
      c.add(borde);
      sfx(scene, sonido, { volume: 0.6 });
      scene.cameras.main.shake(180, 0.006);
      const s0 = img.scale;
      img.setScale(s0 * 1.25);
      scene.tweens.add({ targets: img, scale: s0, duration: 220, ease: 'Back.out' });
      let f = 0;
      const ev = scene.time.addEvent({ delay: 80, loop: true, callback: () => l.setTexture(`lineas-${++f % 3}`) });
      // Respaldo con setTimeout: si la escena tiene el reloj parado (pausa, tarjeta de ayuda), no se queda colgada.
      let hecho = false;
      const acabar = () => { if (hecho) return; hecho = true; ev.remove(); if (c.scene) c.destroy(); res(); };
      scene.time.delayedCall(ms, acabar);
      setTimeout(acabar, ms + 400);
    });
  },

  // Viñetas: primeros planos que entran de golpe, torcidos, uno cada 0,18 s.
  vinetas(scene, sprites, { ms = 1300, colores = [UNAKE.amarillo, UNAKE.rosa, UNAKE.cian, UNAKE.verde] } = {}) {
    return new Promise(res => {
      const lista = sprites.filter(k => scene.textures.exists(k)).slice(0, 4);
      if (!lista.length) return res();
      const capa = scene.add.container(0, 0).setDepth(970);
      capa.add(scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 0.85));
      const n = lista.length;
      const anchoV = (ANCHO - 60 - (n - 1) * 18) / n;
      const angulos = [-3, 2.5, -1.5, 3];
      lista.forEach((k, i) => {
        scene.time.delayedCall(i * 180, () => {
          const x = 30 + anchoV / 2 + i * (anchoV + 18);
          const v = scene.add.container(x, ALTO / 2).setAngle(angulos[i]).setScale(1.35);
          v.add(scene.add.rectangle(0, 0, anchoV, ALTO - 120, colores[i % colores.length]).setStrokeStyle(12, HEX.tinta));
          const img = scene.add.image(0, 40, k);
          img.setScale(Math.min((ALTO - 200) / img.height, (anchoV - 30) / img.width));
          v.add(img);
          capa.add(v);
          sfx(scene, 'golpe', { volume: 0.4 });
          scene.tweens.add({ targets: v, scale: 1, duration: 200, ease: 'Back.out' });
        });
      });
      let hecho = false;
      const acabar = () => { if (hecho) return; hecho = true; if (capa.scene) capa.destroy(); res(); };
      scene.time.delayedCall(ms + n * 180, () => scene.tweens.add({ targets: capa, alpha: 0, duration: 200, onComplete: acabar }));
      setTimeout(acabar, ms + n * 180 + 800);
    });
  },

  // Estrella de golpe (blanca debajo, amarilla encima), con la explosión de Gemini si está.
  impacto(scene, x, y, { tam = 110, profundidad = 990 } = {}) {
    if (scene.textures.exists('fx-explosion-pop')) {
      const p = scene.add.image(x, y, 'fx-explosion-pop').setDepth(profundidad).setScale(0);
      const e = (tam * 2) / p.height;
      scene.tweens.chain({ targets: p, tweens: [{ scale: e, duration: 120, ease: 'Back.out' }, { scale: e * 0.9, alpha: 0, duration: 260, delay: 120 }], onComplete: () => p.destroy() });
    }
    const b = scene.add.star(x, y, 8, tam * 0.4, tam, 0xffffff).setStrokeStyle(6, HEX.tinta).setDepth(profundidad + 1).setScale(0);
    const a = scene.add.star(x, y, 8, tam * 0.3, tam * 0.75, UNAKE.amarillo).setDepth(profundidad + 2).setScale(0);
    scene.tweens.add({ targets: [b, a], scale: 1.2, duration: 110, yoyo: true, hold: 60, onComplete: () => { a.destroy(); b.destroy(); } });
  },

  // Confeti de Gemini (o rectángulos de colores) que cae desde arriba.
  confeti(scene, { n = 22, profundidad = 990 } = {}) {
    const hay = scene.textures.exists('obj-confeti');
    for (let i = 0; i < n; i++) {
      const x = Phaser.Math.Between(60, ANCHO - 60);
      const o = hay ? scene.add.image(x, -60, 'obj-confeti') : scene.add.rectangle(x, -20, 14, 22, Phaser.Utils.Array.GetRandom([UNAKE.amarillo, UNAKE.rosa, UNAKE.cian, UNAKE.verde]));
      if (hay) o.setScale(Phaser.Math.FloatBetween(70, 130) / o.height);
      o.setDepth(profundidad).setAngle(Phaser.Math.Between(0, 360));
      scene.tweens.add({ targets: o, y: ALTO + 120, x: x + Phaser.Math.Between(-150, 150), angle: `+=${Phaser.Math.Between(180, 720)}`, duration: Phaser.Math.Between(1300, 2300), delay: i * 40, ease: 'Sine.in', onComplete: () => o.destroy() });
    }
  },

  // Emote dibujado encima de alguien: corazon, calavera, gota, mareo, rayo, fuego, lagrima, chispas, humo.
  emote(scene, x, y, tipo, { tam = 70, ms = 1100, profundidad = 880 } = {}) {
    const clave = { corazon: 'fx-corazon', calavera: 'fx-calavera', gota: 'fx-gota-sudor', mareo: 'fx-estrellas-mareo', rayo: 'fx-rayo', fuego: 'fx-fuego', lagrima: 'fx-lagrima', chispas: 'fx-chispas', humo: 'fx-humo-puff' }[tipo];
    if (!clave || !scene.textures.exists(clave)) return null;
    const e = scene.add.image(x, y, clave).setDepth(profundidad).setScale(0);
    const s = tam / e.height;
    sfx(scene, tipo === 'corazon' ? 'campanita' : 'boing', { volume: 0.3 });
    const tweens = tipo === 'mareo'
      ? [{ scale: s, duration: 160, ease: 'Back.out' }, { angle: 360, duration: ms, ease: 'Linear' }, { scale: 0, duration: 140 }]
      : tipo === 'gota' || tipo === 'lagrima'
        ? [{ scale: s, duration: 140, ease: 'Back.out' }, { y: y + 40, alpha: 0.2, duration: ms, ease: 'Quad.in' }]
        : [{ scale: s, duration: 160, ease: 'Back.out' }, { y: y - 30, duration: ms, ease: 'Sine.out' }, { scale: 0, duration: 140 }];
    scene.tweens.chain({ targets: e, tweens, onComplete: () => e.destroy() });
    return e;
  },

  // Cartela de personaje: nombre grande en su color + subtítulo, entra con muelle y se mece.
  cartela(scene, nombre, sub, color = COLOR.amarillo, { x = 70, y = ALTO - 150, ms = 2400 } = {}) {
    const c = scene.add.container(x, y).setDepth(860);
    const t = scene.add.text(0, 0, nombre, { fontFamily: FUENTE, fontSize: '64px', color, stroke: COLOR.tinta, strokeThickness: 12 }).setShadow(6, 6, '#000', 0, true, true);
    const s = scene.add.text(6, 74, sub, { fontFamily: FUENTE, fontSize: '26px', color: COLOR.tinta, backgroundColor: COLOR.crema, padding: { x: 12, y: 4 } });
    c.add([t, s]);
    c.setScale(0).setAngle(-6);
    scene.tweens.add({ targets: c, scale: 1, angle: -2, duration: 380, ease: 'Back.out' });
    scene.tweens.add({ targets: c, angle: 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 380 });
    scene.time.delayedCall(ms, () => { if (c.scene) scene.tweens.add({ targets: c, scale: 0, duration: 200, ease: 'Back.in', onComplete: () => c.destroy() }); });
    return c;
  },
};

// La cortinilla de cada minijuego: la firma de su personaje.
const CORTINA_DE = {
  Barra: 'estrella', DJ: 'burbuja', Blancazo: 'pringue', Rescate: 'pringue', Contrasena: 'iris',
  Pipas: 'barrido', Cuentas: 'barrido', Tragaperras: 'estrella', Carrera: 'barrido', Farol: 'estrella', Periquito: 'iris',
};

// Quién reacciona al perder cada minijuego (pantalla de reacción) y con qué color.
const REACCION_PIERDE = {
  Contrasena: ['perico-graznando', UNAKE.cian], Tarta: ['cotine-plop', UNAKE.rosa], Lasslow: ['lasslow-horror', UNAKE.verde],
  Rescate: ['puky-riendo', UNAKE.amarillo], Blancazo: ['blancaso-derritiendose', UNAKE.verde], Barra: ['palicaso-contando', UNAKE.amarillo],
  Pipas: ['perico-pipas', UNAKE.cian], DJ: ['pompa-horror', UNAKE.cian], Cuentas: ['blancaso-mareado', UNAKE.verde],
  Farol: ['palicaso-riendo', UNAKE.amarillo], Periquito: ['perico-graznando', UNAKE.rosa],
};

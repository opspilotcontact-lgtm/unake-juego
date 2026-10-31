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
      if (!scene.sys || !scene.sys.isActive() || !scene.textures.exists(sprite)) return res();
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
      if (!scene.sys || !scene.sys.isActive()) return res();
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

  // «¡RACHA x5!»: rótulo torcido que entra de golpe con líneas de velocidad (no para el juego).
  racha(scene, n, { x = ANCHO / 2, y = 210 } = {}) {
    Comic.texturasLineas(scene);
    const l = scene.add.image(ANCHO / 2, ALTO / 2, 'lineas-0').setDepth(64).setAlpha(0.35).setTint(0xffd23f);
    scene.tweens.add({ targets: l, alpha: 0, duration: 650, onComplete: () => l.destroy() });
    const t = texto(scene, x, y, `¡RACHA x${n}!`, 58, COLOR.amarillo).setDepth(65).setAngle(-7).setScale(1.8);
    scene.tweens.chain({ targets: t, tweens: [{ scale: 1, duration: 180, ease: 'Back.out' }, { angle: -3, duration: 500 }, { alpha: 0, y: y - 30, duration: 250 }], onComplete: () => t.destroy() });
    Comic.impacto(scene, x - 230, y, { tam: 60, profundidad: 63 });
    sfx(scene, 'tiroriro', { volume: 0.45 });
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

// ======================================================================================
// ÉNFASIS DE CÓMIC: un efecto propio, corto (0,4-1,2 s) y reconocible por emoción.
//   Comic.enfasis(scene, tipo, opciones) -> { tipo, ms, pausa, lento } | null
//   Tipos: bronca, terror (miedo), asco, sorpresa (shock), alegria (fiesta), tension, bajon,
//          ternura (momento), golpe (onomatopeya), chiste.
// Dos modos:
//   - Escena de historia: sin x/y. Pantalla completa; las capas (`capas.fondo|frente|sobre`) las da
//     escena_comic.js para que el efecto quede detrás del bocadillo y no tape el texto.
//   - Sobre un personaje (barrio): con `x, y`. Versión pequeña (escala 0,4), sin cámara ni pantalla
//     entera, a profundidad 990 (o `profundidad`). `objetivo` (sprite) tiembla si el efecto lo pide.
// Todo lo que crea queda anotado en scene._fxE y se destruye al acabar, con Comic.limpiarEnfasis(scene)
// o al cerrar la escena ('shutdown'). Nada de timers que sobrevivan.
// ======================================================================================
Comic.ALIAS_ENFASIS = { miedo: 'terror', shock: 'sorpresa', fiesta: 'alegria', momento: 'ternura', onomatopeya: 'golpe' };
Comic.TIPOS_ENFASIS = ['bronca', 'terror', 'asco', 'sorpresa', 'alegria', 'tension', 'bajon', 'ternura', 'golpe', 'chiste'];

// Registro de lo creado. scene.start reutiliza la instancia, así que se vuelve a armar tras cada 'shutdown'.
Comic._reg = function (scene) {
  if (!scene._fxE) {
    scene._fxE = { objs: new Set(), timers: new Set(), kill: new Set(), lim: [] };
    scene.events.once('shutdown', () => { Comic.limpiarEnfasis(scene); scene._fxE = null; });
  }
  return scene._fxE;
};

// Quita al instante todo énfasis vivo (cambio de línea, «Saltar», cierre de escena).
Comic.limpiarEnfasis = function (scene) {
  const R = scene && scene._fxE;
  if (!R) return;
  R.lim.splice(0).forEach(f => { try { f(); } catch (e) { /* ya no existe */ } });
  R.timers.forEach(t => t.remove(false));
  R.timers.clear();
  const tw = scene.tweens;
  R.kill.forEach(o => { if (tw) tw.killTweensOf(o); });
  R.kill.clear();
  R.objs.forEach(o => { if (tw) tw.killTweensOf(o); if (o.scene) o.destroy(); });
  R.objs.clear();
};

// Viñeteados y brillos: gradientes radiales en un canvas pequeño que se estira (barato en móvil).
Comic.texVig = function (scene, clave) {
  const k = `fx-vig-${clave}`;
  if (scene.textures.exists(k)) return k;
  const D = {
    rojo: { c: '214,26,40', i: 0.3, a: 0.95, w: 256, h: 144 },
    terror: { c: '26,4,46', i: 0.25, a: 1, w: 256, h: 144 },
    negro: { c: '0,0,0', i: 0.4, a: 0.9, w: 256, h: 144 },
    calido: { c: '255,196,100', inv: true, a: 1, w: 128, h: 128 },
  }[clave];
  const tex = scene.textures.createCanvas(k, D.w, D.h);
  const ctx = tex.getContext();
  if (D.inv) {
    const gr = ctx.createRadialGradient(D.w / 2, D.h / 2, 0, D.w / 2, D.h / 2, D.w / 2);
    gr.addColorStop(0, `rgba(${D.c},${D.a})`); gr.addColorStop(0.5, `rgba(${D.c},${D.a * 0.55})`); gr.addColorStop(1, `rgba(${D.c},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, D.w, D.h);
  } else {
    // Se dibuja en un cuadrado y se estira en horizontal: el borde de arriba pesa como el de los lados.
    const q = D.h;
    ctx.setTransform(D.w / D.h, 0, 0, 1, 0, 0);
    const gr = ctx.createRadialGradient(q / 2, q / 2, 0, q / 2, q / 2, q * 0.62);
    gr.addColorStop(0, `rgba(${D.c},0)`); gr.addColorStop(D.i, `rgba(${D.c},0)`); gr.addColorStop(1, `rgba(${D.c},${D.a})`);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, q, q);
  }
  tex.refresh();
  return k;
};

// Trama de puntos (halftone) en blanco para teñir: dos filas desplazadas, 64 px (potencia de 2).
Comic.texTrama = function (scene) {
  if (scene.textures.exists('fx-trama')) return 'fx-trama';
  const tex = scene.textures.createCanvas('fx-trama', 64, 64);
  const ctx = tex.getContext();
  ctx.fillStyle = '#fff';
  [[16, 16], [48, 48]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); });
  tex.refresh();
  return 'fx-trama';
};

// Temblor de un objeto (letras de un grito). Se desactiva solo al limpiar.
Comic.temblar = function (scene, obj, px) {
  const R = Comic._reg(scene);
  R.kill.add(obj);
  const x0 = obj.x, y0 = obj.y;
  scene.tweens.add({ targets: obj, x: x0 + px, duration: 37, yoyo: true, repeat: -1 });
  scene.tweens.add({ targets: obj, y: y0 - px * 0.7, duration: 53, yoyo: true, repeat: -1 });
  R.lim.push(() => { if (obj.scene) { obj.x = x0; obj.y = y0; } });
};

// ---------- Bocadillos con carácter ----------
// Punto del perímetro de un rectángulo centrado (t en píxeles recorridos) y radio hasta el borde por ángulo.
Comic._perim = function (t, hw, hh) {
  const w = hw * 2, h = hh * 2, per = 2 * (w + h);
  t = ((t % per) + per) % per;
  if (t < w) return { x: -hw + t, y: -hh };
  t -= w; if (t < h) return { x: hw, y: -hh + t };
  t -= h; if (t < w) return { x: hw - t, y: hh };
  t -= w; return { x: -hw, y: hh - t };
};
Comic._radioRect = (a, hw, hh) => 1 / Math.max(Math.abs(Math.cos(a)) / hw, Math.abs(Math.sin(a)) / hh);

// Rehace el dibujo de un bocadillo de comun.js (container [graphics, texto] con anchoB/altoB).
// estilo: 'pinchos' (bronca) | 'ondulado' (miedo) | 'nube' (pensamiento) | 'susurro' (borde punteado).
Comic.estiloBocadillo = function (scene, b, estilo, cola = 'abajo') {
  if (!b || !b.scene || !b.list || b.list.length < 2 || !estilo || estilo === 'normal' || b._estilo) return;
  b._estilo = estilo;
  const w = b.anchoB, h = b.altoB - 32, hw = w / 2, hh = h / 2;
  const px = cola === 'izq' ? -w / 4 : cola === 'der' ? w / 4 : 0;
  const dir = cola === 'izq' ? -1 : cola === 'der' ? 1 : 0;
  const g = scene.add.graphics();
  const trianguloPico = (relleno) => {
    const p = [px - 16, h / 2 - 3, px + 16, h / 2 - 3, px + dir * 30, h / 2 + 30];
    g.fillStyle(relleno, 1).fillTriangle(...p).lineStyle(5, HEX.tinta, 1);
    g.lineBetween(p[0], p[1] + 3, p[4], p[5]).lineBetween(p[2], p[3] + 3, p[4], p[5]);
  };
  const tb = b.list[1];
  if (estilo === 'pinchos') {
    const n = 28, pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = Comic._radioRect(a, hw, hh) + (i % 2 ? 30 : 6);
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    g.fillStyle(0xffe3dc, 1).lineStyle(5, HEX.tinta, 1).fillPoints(pts, true).strokePoints(pts, true);
    trianguloPico(0xffe3dc);
  } else if (estilo === 'ondulado') {
    const pts = [];
    for (let i = 0; i < 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      const r = Comic._radioRect(a, hw, hh) + 10 + 6 * Math.sin(a * 11);
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    g.fillStyle(0xece6ff, 1).lineStyle(5, HEX.tinta, 1).fillPoints(pts, true).strokePoints(pts, true);
    trianguloPico(0xece6ff);
  } else if (estilo === 'nube') {
    const per = 2 * (w + h), n = Math.max(10, Math.round(per / 44));
    const cs = [];
    for (let i = 0; i < n; i++) {
      const p = Comic._perim((i / n) * per, hw - 4, hh - 4);
      cs.push({ x: p.x, y: p.y, r: 26 + (i % 3) * 3 });
    }
    g.lineStyle(5, HEX.tinta, 1);
    cs.forEach(c => g.strokeCircle(c.x, c.y, c.r));
    g.fillStyle(0xffffff, 1);
    cs.forEach(c => g.fillCircle(c.x, c.y, c.r - 1));
    g.fillRoundedRect(-hw + 6, -hh + 6, w - 12, h - 12, 18);
    // Cola de burbujitas hacia quien piensa.
    [[px + dir * 6, h / 2 + 22, 12], [px + dir * 20, h / 2 + 44, 8], [px + dir * 30, h / 2 + 60, 5]].forEach(([x, y, r]) => {
      g.lineStyle(4, HEX.tinta, 1).strokeCircle(x, y, r).fillStyle(0xffffff, 1).fillCircle(x, y, r - 1);
    });
  } else if (estilo === 'susurro') {
    g.fillStyle(0xf1f1f6, 1).fillRoundedRect(-hw, -hh, w, h, 22);
    g.lineStyle(4, HEX.tinta, 1);
    const per = 2 * (w + h);
    for (let t = 0; t < per; t += 24) {
      const a = Comic._perim(t, hw, hh), z = Comic._perim(t + 13, hw, hh);
      if (Math.abs(a.x - z.x) > 1 && Math.abs(a.y - z.y) > 1) continue; // sin cortar esquinas
      g.lineBetween(a.x, a.y, z.x, z.y);
    }
    const p = [px - 14, h / 2 - 3, px + 14, h / 2 - 3, px + dir * 26, h / 2 + 26];
    g.fillStyle(0xf1f1f6, 1).fillTriangle(...p).lineStyle(4, HEX.tinta, 1);
    g.lineBetween(p[0], p[1] + 3, p[4], p[5]);
    tb.setColor('#555566').setAlpha(0.9);
  }
  b.remove(b.list[0], true);
  b.addAt(g, 0);
};

// ---------- El catálogo ----------
Comic.enfasis = function (scene, tipo, o = {}) {
  if (!scene || !scene.sys || !scene.sys.isActive() || !scene.add) return null;
  tipo = Comic.ALIAS_ENFASIS[tipo] || tipo;
  const fx = Comic.fx[tipo];
  if (!fx) return null;
  const R = Comic._reg(scene);
  const pos = o.x != null && o.y != null;
  const prof = o.profundidad ?? 990;
  const k = pos ? (o.escala ?? 0.4) : 1;
  const cab = o.cabeza || (pos ? { x: o.x, y: o.y } : { x: ANCHO / 2, y: 330 });
  const c = {
    scene, o, pos, tipo, k, cab,
    x: pos ? o.x : ANCHO / 2, y: pos ? o.y : ALTO / 2,
    // Anota el objeto y lo mete en su capa (o a profundidad fija si va suelto sobre el barrio).
    nuevo(obj, capa) {
      R.objs.add(obj);
      const cont = !pos && o.capas && o.capas[capa];
      if (cont) cont.add(obj); else obj.setDepth(prof);
      return obj;
    },
    quitar(obj) { R.objs.delete(obj); scene.tweens.killTweensOf(obj); if (obj.scene) obj.destroy(); },
    fade(objs, retardo, dur = 250) {
      const l = [].concat(objs);
      scene.tweens.add({ targets: l, alpha: 0, delay: retardo, duration: dur, onComplete: () => l.forEach(x => c.quitar(x)) });
    },
    en(ms, f) {
      const t = scene.time.delayedCall(ms, () => { R.timers.delete(t); if (scene.sys && scene.sys.isActive()) f(); });
      R.timers.add(t);
      return t;
    },
    cada(ms, f) { const t = scene.time.addEvent({ delay: ms, loop: true, callback: f }); R.timers.add(t); return t; },
    alLimpiar(f) { R.lim.push(f); },
    sonido(n, v = 0.4) { sfx(scene, n, { volume: v }); },
    sacudir(ms, inten) { if (!pos && o.camara !== false) scene.cameras.main.shake(ms, inten); },
    acercar(z, ms) { if (!pos && o.acercar) o.acercar(z, ms); },
    // Estrella de golpe: blanca debajo, de color encima.
    pop(x, y, tam, color = UNAKE.amarillo, capa = 'sobre') {
      const b = c.nuevo(scene.add.star(x, y, 8, tam * 0.4, tam, 0xffffff).setStrokeStyle(5, HEX.tinta).setScale(0), capa);
      const a = c.nuevo(scene.add.star(x, y, 8, tam * 0.3, tam * 0.75, color).setScale(0), capa);
      scene.tweens.add({ targets: [b, a], scale: 1.15, duration: 110, yoyo: true, hold: 90, onComplete: () => { c.quitar(a); c.quitar(b); } });
    },
    // Rótulo de cómic con contorno que entra de golpe (desde grande) y rebota.
    rotulo(str, x, y, tam, color, ang = 0, capa = 'sobre', desde = 1.9) {
      const t = c.nuevo(scene.add.text(x, y, str, { fontFamily: FUENTE, fontSize: `${Math.round(tam)}px`, color, stroke: COLOR.tinta, strokeThickness: Math.max(5, Math.round(tam / 7)), align: 'center' }).setOrigin(0.5).setAngle(ang).setScale(desde).setAlpha(0), capa);
      t.setShadow(0, Math.round(tam / 10), '#000', 0, true, true);
      scene.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 190, ease: 'Back.out' });
      return t;
    },
    // Estrellitas que suben y se apagan.
    estrellitas(n, x, y, radio, colores, dur, tam, capa = 'sobre', puntas = 5) {
      for (let i = 0; i < n; i++) {
        const sx = x + Phaser.Math.Between(-radio, radio), sy = y + Phaser.Math.Between(-Math.round(radio * 0.5), Math.round(radio * 0.5));
        const s = c.nuevo(scene.add.star(sx, sy, puntas, tam * 0.4, tam, colores[i % colores.length]).setStrokeStyle(3, HEX.tinta).setScale(0), capa);
        scene.tweens.add({ targets: s, scale: Phaser.Math.FloatBetween(0.7, 1.2), duration: 200, delay: i * 60, ease: 'Back.out' });
        scene.tweens.add({ targets: s, y: sy - Phaser.Math.Between(50, 110) * (pos ? 0.6 : 1), angle: Phaser.Math.Between(-120, 120), alpha: 0, duration: dur, delay: 200 + i * 60, ease: 'Sine.out', onComplete: () => c.quitar(s) });
      }
    },
    gota(x, y, s = 1) {
      const g = c.nuevo(scene.add.graphics().setPosition(x, y), 'sobre');
      g.fillStyle(HEX.tinta, 1).fillTriangle(0, -20 * s, -11 * s, 2 * s, 11 * s, 2 * s).fillCircle(0, 4 * s, 11 * s);
      g.fillStyle(0x9fe7ff, 1).fillTriangle(0, -15 * s, -8 * s, 2 * s, 8 * s, 2 * s).fillCircle(0, 4 * s, 8 * s);
      return g;
    },
    // Bocadillo: forma y temblor de las letras (si el guion no fija ya otro estilo).
    bocadillo(estilo, px, color) {
      const b = o.bocadillo;
      if (!b || !b.scene) return;
      if (!o.estiloFijo) Comic.estiloBocadillo(scene, b, estilo, o.cola);
      const tb = b.list[1];
      if (color && !o.estiloFijo) tb.setColor(color);
      if (px) Comic.temblar(scene, tb, px);
    },
    // Tiembla un sprite (versión barrio).
    temblar(obj, px, ms) {
      if (!obj || !obj.scene) return;
      const x0 = obj.x;
      scene.tweens.add({ targets: obj, x: x0 + px, duration: 40, yoyo: true, repeat: Math.ceil(ms / 80) });
      c.alLimpiar(() => { if (obj.scene) obj.x = x0; });
    },
  };
  const r = fx(c) || {};
  return { tipo, ms: r.ms || 900, pausa: r.pausa || 0, lento: r.lento || 1 };
};

Comic.fx = {
  // Sacudida fuerte, viñeta roja, bocadillo de pinchos y letras temblando.
  bronca(c) {
    const { scene, pos } = c;
    c.sonido('golpe', 0.5);
    if (pos) {
      c.pop(c.x + 26, c.y - 70, 46, 0xe0202e, null);
      c.fade(c.rotulo('¡!', c.x + 26, c.y - 70, 40, '#ffffff', -8, null, 1.5), 450, 200);
      c.temblar(c.o.objetivo, 3, 600);
      return { ms: 700 };
    }
    c.sacudir(350, 0.012);
    const vig = c.nuevo(scene.add.image(ANCHO / 2, ALTO / 2, Comic.texVig(scene, 'rojo')).setDisplaySize(ANCHO, ALTO).setAlpha(0.6), 'frente');
    scene.tweens.add({ targets: vig, alpha: 1, duration: 140, yoyo: true, repeat: 3 });
    c.fade(vig, 800, 300);
    Comic.texturasLineas(scene);
    const l = c.nuevo(scene.add.image(ANCHO / 2, ALTO / 2, 'lineas-1').setTint(0xff3b30).setAlpha(0.5), 'frente');
    c.fade(l, 250, 350);
    c.pop(c.cab.x, c.cab.y - 20, 100, 0xe0202e);
    c.bocadillo('pinchos', 2.4, '#8a0f1c');
    return { ms: 1100 };
  },

  // Viñeteado morado y negro, temblor fino, bocadillo ondulado, gotas de sudor y zoom lento.
  terror(c) {
    const { scene, pos } = c;
    if (pos) {
      for (let i = 0; i < 3; i++) {
        const g = c.gota(c.x + (i - 1) * 22, c.y - 60, 0.7);
        g.setAlpha(0);
        scene.tweens.add({ targets: g, alpha: 1, y: g.y + 36, duration: 700, delay: i * 160, onComplete: () => c.fade(g, 0, 160) });
      }
      c.temblar(c.o.objetivo, 1.5, 900);
      return { ms: 1000 };
    }
    c.sonido('temblor', 0.35);
    c.sacudir(1000, 0.0025);
    const vig = c.nuevo(scene.add.image(ANCHO / 2, ALTO / 2, Comic.texVig(scene, 'terror')).setDisplaySize(ANCHO, ALTO).setAlpha(0), 'frente');
    scene.tweens.add({ targets: vig, alpha: 1, duration: 350 });
    c.fade(vig, 1100, 400);
    if (scene.textures.exists('fx-ojos-oscuridad')) {
      const ojos = c.nuevo(scene.add.image(ANCHO * 0.9, ALTO * 0.78, 'fx-ojos-oscuridad').setAlpha(0), 'frente');
      ojos.setScale(90 / ojos.height);
      scene.tweens.add({ targets: ojos, alpha: 0.85, duration: 500, delay: 300 });
      c.fade(ojos, 1000, 300);
    }
    for (let i = 0; i < 4; i++) {
      const g = c.gota(c.cab.x + 70 + (i % 2) * 34, c.cab.y - 70 + i * 6, 0.9);
      g.setAlpha(0);
      scene.tweens.add({ targets: g, alpha: 1, y: g.y + 90, duration: 760, delay: 200 + i * 170, ease: 'Quad.in', onComplete: () => c.fade(g, 0, 120) });
    }
    c.bocadillo('ondulado', 1.2);
    c.acercar(1.1, 1100);
    return { ms: 1200, lento: 1.3 };
  },

  // Tinte verdoso, ondas de olor y la cara del otro como protagonista.
  asco(c) {
    const { scene, pos } = c;
    c.sonido('chapoteo', 0.35);
    const ondas = (x, y, n, s) => {
      for (let i = 0; i < n; i++) {
        const g = c.nuevo(scene.add.graphics().setPosition(x + (i - (n - 1) / 2) * 34 * s, y), 'sobre');
        const pts = [];
        for (let yy = 0; yy <= 100 * s; yy += 8) pts.push({ x: Math.sin(yy / (13 * s) + i) * 10 * s, y: -yy });
        g.lineStyle(10 * s, HEX.tinta, 1).strokePoints(pts, false).lineStyle(5 * s, 0xb6e35a, 1).strokePoints(pts, false);
        g.setAlpha(0);
        scene.tweens.add({ targets: g, alpha: 1, y: y - 40 * s, duration: 350, delay: i * 140 });
        c.fade(g, 700 + i * 140, 300);
      }
    };
    if (pos) { ondas(c.x, c.y - 30, 2, 0.5); return { ms: 1000 }; }
    const velo = c.nuevo(scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x7fc43a, 0).setBlendMode(Phaser.BlendModes.MULTIPLY), 'frente');
    scene.tweens.add({ targets: velo, fillAlpha: 0.5, duration: 300 });
    c.fade(velo, 1100, 250);
    if (scene.textures.exists('fx-nube-pedo')) {
      const n = c.nuevo(scene.add.image(c.cab.x + 30, c.cab.y, 'fx-nube-pedo').setAlpha(0.9).setScale(0), 'sobre');
      scene.tweens.add({ targets: n, scale: 150 / n.height, duration: 400, ease: 'Back.out' });
      c.fade(n, 800, 300);
    }
    ondas(c.cab.x + 20, c.cab.y - 20, 3, 1);
    // La cara del otro, en un recuadro torcido (si se conoce).
    if (c.o.cara && scene.textures.exists(c.o.cara)) {
      const v = c.nuevo(scene.add.container(ANCHO - 190, ALTO - 250).setAngle(5).setScale(0), 'sobre');
      v.add(scene.add.rectangle(0, 0, 230, 230, 0xb6e35a).setStrokeStyle(8, HEX.tinta));
      const im = scene.add.image(0, 14, c.o.cara);
      im.setScale(Math.min(200 / im.height, 200 / im.width));
      v.add(im);
      scene.tweens.add({ targets: v, scale: 1, duration: 260, ease: 'Back.out' });
      c.fade(v, 1000, 250);
    }
    return { ms: 1250 };
  },

  // Líneas cinéticas, zoom de golpe y «!!».
  sorpresa(c) {
    const { scene, pos } = c;
    c.sonido('zas', 0.45);
    if (pos) {
      c.fade(c.rotulo('!', c.x, c.y - 70, 54, '#ffd628', -6, null, 1.6), 450, 200);
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.42;
        const g = c.nuevo(scene.add.graphics().setPosition(c.x, c.y - 70), null);
        g.lineStyle(5, HEX.tinta, 1).lineBetween(Math.cos(a) * 36, Math.sin(a) * 36, Math.cos(a) * 58, Math.sin(a) * 58);
        c.fade(g, 450, 200);
      }
      return { ms: 700 };
    }
    c.sacudir(200, 0.006);
    Comic.texturasLineas(scene);
    const l = c.nuevo(scene.add.image(ANCHO / 2, ALTO / 2, 'lineas-0').setAlpha(0.6), 'frente');
    let f = 0;
    c.cada(70, () => { if (l.scene) l.setTexture(`lineas-${++f % 3}`); });
    c.fade(l, 700, 250);
    c.acercar(1.1, 80);
    c.en(230, () => c.acercar(1, 220));
    const t = c.rotulo('!!', c.cab.x + 110, c.cab.y - 120, 130, '#ffd628', -9);
    c.bocadillo(null, 1.4);
    c.fade(t, 750, 200);
    return { ms: 950 };
  },

  // Fondo de trama de puntos en colores, estrellitas y rebote.
  alegria(c) {
    const { scene, pos } = c;
    c.sonido('tiroriro', 0.35);
    if (pos) { c.estrellitas(6, c.x, c.y - 40, 40, [UNAKE.amarillo, UNAKE.rosa, UNAKE.cian], 800, 12, null); return { ms: 900 }; }
    const tex = Comic.texTrama(scene);
    [[UNAKE.rosa, 0], [UNAKE.cian, 20]].forEach(([col, off]) => {
      const t = c.nuevo(scene.add.tileSprite(ANCHO / 2, ALTO / 2, ANCHO * 1.1, ALTO * 1.1, tex).setTint(col).setAlpha(0).setTileScale(0.6), 'fondo');
      t.tilePositionX = off; t.tilePositionY = off;
      scene.tweens.add({ targets: t, alpha: 0.2, duration: 200 });
      scene.tweens.add({ targets: t, tilePositionX: off + 50, tilePositionY: off + 30, duration: 1300 });
      c.fade(t, 1000, 300);
    });
    c.estrellitas(9, c.cab.x, c.cab.y, 190, [UNAKE.amarillo, UNAKE.rosa, UNAKE.cian, 0xffffff], 900, 15);
    if (c.o.rebote) c.o.rebote();
    return { ms: 1300 };
  },

  // Silencio visual: bandas negras que se cierran y pulso lento.
  tension(c) {
    const { scene, pos } = c;
    c.sonido('latido', 0.5);
    if (pos) {
      const r = c.nuevo(scene.add.circle(c.x, c.y - 30, 30).setStrokeStyle(6, HEX.tinta), null);
      scene.tweens.add({ targets: r, scale: 1.8, alpha: 0.1, duration: 600, repeat: 1, onComplete: () => c.quitar(r) });
      return { ms: 1200 };
    }
    const vig = c.nuevo(scene.add.image(ANCHO / 2, ALTO / 2, Comic.texVig(scene, 'negro')).setDisplaySize(ANCHO, ALTO).setAlpha(0), 'frente');
    scene.tweens.add({ targets: vig, alpha: 1, duration: 500 });
    scene.tweens.add({ targets: vig, alpha: 0.6, duration: 560, delay: 500, yoyo: true, repeat: 1, ease: 'Sine.inOut' });
    const alto = 80;
    const arr = c.nuevo(scene.add.rectangle(ANCHO / 2, -alto / 2, ANCHO, alto, 0x000000), 'frente');
    const aba = c.nuevo(scene.add.rectangle(ANCHO / 2, ALTO + alto / 2, ANCHO, alto, 0x000000), 'frente');
    scene.tweens.add({ targets: arr, y: alto / 2, duration: 520, ease: 'Sine.in' });
    scene.tweens.add({ targets: aba, y: ALTO - alto / 2, duration: 520, ease: 'Sine.in' });
    c.en(1250, () => {
      scene.tweens.add({ targets: arr, y: -alto / 2, duration: 260 });
      scene.tweens.add({ targets: aba, y: ALTO + alto / 2, duration: 260 });
    });
    c.fade(vig, 1250, 300);
    return { ms: 1550, lento: 1.6 };
  },

  // Desaturar, nubecita de lluvia y todo más lento.
  bajon(c) {
    const { scene, pos } = c;
    const s = pos ? 0.6 : 1;
    c.sonido('suspiro', 0.4);
    const lado = c.o.cola === 'izq' ? -1 : 1; // el bocadillo va al otro lado
    const cx = pos ? c.x : c.cab.x - lado * 120, cy = pos ? c.y - 80 : c.cab.y - 40;
    const nube = c.nuevo(scene.add.graphics().setPosition(cx, cy), 'sobre');
    const bola = [[-34, 4, 26], [0, -12, 34], [36, 4, 26], [0, 12, 28]];
    nube.lineStyle(5, HEX.tinta, 1);
    bola.forEach(([x, y, r]) => nube.strokeCircle(x, y, r));
    nube.fillStyle(0x8c93a8, 1);
    bola.forEach(([x, y, r]) => nube.fillCircle(x, y, r - 1));
    nube.setScale(0);
    scene.tweens.add({ targets: nube, scale: s, duration: 300, ease: 'Back.out' });
    const gotas = [];
    for (let i = 0; i < 5; i++) {
      const d = c.nuevo(scene.add.rectangle(cx + (i - 2) * 22 * s, cy + 40 * s, 4, 14, 0x7fb8e8), 'sobre');
      scene.tweens.add({ targets: d, y: cy + 40 * s + 80 * s, alpha: 0, duration: 520, delay: 250 + i * 110, repeat: 2 });
      gotas.push(d);
    }
    c.fade([nube, ...gotas], pos ? 1100 : 1400, 300);
    if (!pos) {
      const velo = c.nuevo(scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x59627a, 0), 'frente');
      scene.tweens.add({ targets: velo, fillAlpha: 0.42, duration: 450 });
      c.fade(velo, 1400, 400);
    }
    return { ms: 1700, lento: 1.5 };
  },

  // El momento persona: destello suave, el fondo se apaga, queda el personaje con brillo cálido.
  ternura(c) {
    const { scene, pos } = c;
    c.sonido('campanita', 0.35);
    const f = pos ? { x: c.x, y: c.y - 30 } : (c.o.foco || { x: ANCHO / 2, y: 430 });
    const brillo = c.nuevo(scene.add.image(f.x, f.y, Comic.texVig(scene, 'calido')).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0), 'fondo');
    const lado = pos ? 150 : 620;
    brillo.setDisplaySize(lado, lado);
    scene.tweens.add({ targets: brillo, alpha: 0.85, duration: 700 });
    scene.tweens.add({ targets: brillo, alpha: 0.55, duration: 1100, delay: 700, yoyo: true, repeat: 1, ease: 'Sine.inOut' });
    c.estrellitas(pos ? 4 : 7, f.x, f.y - (pos ? 10 : 90), pos ? 28 : 150, [0xfff3c4, UNAKE.amarillo, 0xffffff], 1700, pos ? 9 : 13, 'fondo', 4);
    if (pos) { c.fade(brillo, 1400, 400); return { ms: 1800 }; }
    // Se apaga el fondo (detrás de los personajes) y los demás quedan en segundo plano.
    const oscuro = c.nuevo(scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO * 1.6, ALTO * 1.6, 0x14081e, 0), 'fondo');
    if (c.o.capas && c.o.capas.fondo) c.o.capas.fondo.sendToBack(oscuro);
    scene.tweens.add({ targets: oscuro, fillAlpha: 0.62, duration: 600 });
    if (c.o.camara !== false) scene.cameras.main.flash(420, 255, 236, 200);
    if (c.o.atenuar) c.o.atenuar(true);
    c.acercar(1.1, 1800);
    c.fade([oscuro, brillo], 3200, 700);
    return { ms: 3600, pausa: 1100, lento: 1.4 };
  },

  // Letras gigantes de cómic con contorno y rebote: PLOF, PLINK, ¡PRRRT!...
  golpe(c) {
    const { scene, pos } = c;
    const str = c.o.texto || '¡PLOF!';
    const col = Phaser.Utils.Array.GetRandom(['#ffd628', '#fe78aa', '#5adceb', '#ffffff']);
    const tam = pos ? 56 : Math.min(150, 900 / (str.length * 0.62));
    const x = pos ? c.x : ANCHO / 2 + Phaser.Math.Between(-120, 120), y = pos ? c.y - 80 : ALTO * 0.52;
    const ang = Phaser.Math.Between(-9, 9);
    c.sonido('golpe', 0.35);
    const capa = pos ? null : 'sobre';
    if (!pos) {
      c.sacudir(130, 0.004);
      const st = c.nuevo(scene.add.star(x, y, 12, tam * 0.75, tam * 1.35, UNAKE.rosa).setStrokeStyle(8, HEX.tinta).setAngle(ang).setScale(0), 'sobre');
      scene.tweens.add({ targets: st, scale: 1, duration: 170, ease: 'Back.out' });
      c.fade(st, 650, 220);
    }
    const t = c.rotulo(str, x, y, tam, col, ang, capa, 2.2);
    scene.tweens.add({ targets: t, angle: ang + 3, duration: 55, delay: 220, yoyo: true, repeat: 4 });
    c.fade(t, pos ? 700 : 760, 220);
    return { ms: 1000 };
  },

  // El remate: pausa, zoom corto, rebote y «ba-dum… tss».
  chiste(c) {
    const { pos } = c;
    const d = c.o.retardo ?? 500;
    const bx = pos ? c.x : ANCHO - 300, by = pos ? c.y - 80 : ALTO - 190;
    const capa = pos ? null : 'sobre';
    c.en(d, () => {
      c.sonido('rimshot', 0.5);
      c.acercar(1.12, 100);
      c.en(190, () => c.acercar(1, 150));
      c.en(330, () => { c.acercar(1.07, 90); c.en(110, () => c.acercar(1, 140)); });
      if (c.o.rebote) c.o.rebote();
      const a = c.rotulo('¡BA-DUM!', bx, by, pos ? 30 : 54, '#5adceb', -6, capa, 1.6);
      c.fade(a, 1000, 250);
      c.en(380, () => {
        const tx = bx + (pos ? 20 : 120), ty = by - (pos ? 26 : 70);
        const b = c.rotulo('¡TSS!', tx, ty, pos ? 26 : 46, '#ffd628', 7, capa, 1.6);
        c.pop(tx, ty, pos ? 30 : 60, UNAKE.rosa, capa);
        c.fade(b, 700, 250);
      });
    });
    return { ms: d + 1300 };
  },
};

// La cortinilla de cada minijuego: la firma de su personaje.
const CORTINA_DE = {
  Barra: 'estrella', DJ: 'burbuja', Blancazo: 'pringue', Rescate: 'pringue', Contrasena: 'iris',
  Pipas: 'barrido', Cuentas: 'barrido', Tragaperras: 'estrella', Carrera: 'barrido', Farol: 'estrella', Periquito: 'iris', Inspeccion: 'iris', Aires: 'burbuja', Palo: 'estrella', Sigilo: 'iris',
};

// Quién reacciona al perder cada minijuego (pantalla de reacción) y con qué color.
const REACCION_PIERDE = {
  Contrasena: ['perico-graznando', UNAKE.cian], Tarta: ['cotine-plop', UNAKE.rosa], Lasslow: ['lasslow-horror', UNAKE.verde],
  Rescate: ['puky-riendo', UNAKE.amarillo], Blancazo: ['blancaso-derritiendose', UNAKE.verde], Barra: ['palicaso-contando', UNAKE.amarillo],
  Pipas: ['perico-pipas', UNAKE.cian], DJ: ['pompa-horror', UNAKE.cian], Cuentas: ['blancaso-mareado', UNAKE.verde],
  Farol: ['palicaso-riendo', UNAKE.amarillo], Periquito: ['perico-graznando', UNAKE.rosa], Inspeccion: ['lasslow-horror', UNAKE.verde],
  Aires: ['lasslow-horror', UNAKE.verde], Palo: ['cotine-plop', UNAKE.rosa], Sigilo: ['vn-sorprendido', UNAKE.amarillo],
};

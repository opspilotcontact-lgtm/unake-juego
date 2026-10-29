// Escenas de capítulo contadas como cómic (lenguaje del E00): portada con rayos o ilustración,
// los que hablan de pie en su sala, corte de cámara al que habla (plano/contraplano con zoom),
// bocadillo que se escribe, reacciones de los demás, cartela la primera vez que sale alguien,
// cartuchos amarillos para el narrador, pantalla de reacción en los «¿Una qué?» y cierre en iris.
// Usa las mismas líneas de historia.js (['quien', 'texto']), así que no hay que reescribir nada.

const FONDO_CAPITULO = ['fuera', 'dentro', 'sofa', 'dentro', 'cuarto', 'dentro'];

const CARTELAS = {
  vuper: ['VUPER', 'el rider', COLOR.crema], palicaso: ['PALICASO', 'el que habla', COLOR.amarillo],
  blancaso: ['BLANCASO', 'el que lleva las cuentas', '#bfe8ff'], perico: ['PERICO', 'el portero', '#d0d4dc'],
  lasslow: ['LASSLOW', 'un señor', '#ffb38a'], cotine: ['COTINE', 'la repostera', '#ff8fc0'], pompa: ['LA POMPA', 'la DJ', '#9fe7ff'],
};

// Poses por mundo: [de pie, hablando, sorprendido].
function posesDe(id, humo) {
  if (humo) {
    return {
      vuper: ['vuper', 'vuper', 'vuper-colocado'], palicaso: ['palicaso', 'palicaso-contando', 'palicaso-riendo'],
      blancaso: ['blancaso', 'blancaso-esperanza', 'blancaso-mareado'], lasslow: ['lasslow-digno', 'lasslow-digno', 'lasslow-horror'],
      perico: ['perico', 'perico-cotilleando', 'perico-horror'], cotine: ['cotine', 'cotine', 'cotine-plop'], pompa: ['pompa-mira', 'pompa-mira', 'pompa-horror'],
    }[id];
  }
  if (id === 'vuper') return ['vuper-normal', 'vn-hablando', 'vn-sorprendido'];
  return [`n-${id}`, `n-${id}-hablando`, `n-${id}-sorprendido`];
}

Comic.escena = function (scene, lineas, alAcabar) {
  const humo = scene.mundo === 'humo';
  const n = Math.min(ESTADO.capitulo || 0, FONDO_CAPITULO.length - 1);
  const sala = FONDO_CAPITULO[n];
  const fondoClave = humo ? SALAS[sala].fondo : SALAS[sala].fondoN;

  scene.objetivo = null;
  scene.aviso.setVisible(false);
  const velo = scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, HEX.tinta, 1).setDepth(950).setInteractive();
  const raiz = scene.add.container(0, 0).setDepth(951);
  scene.modal = { velo, c: raiz };

  // El escenario: fondo + personajes, dentro de un contenedor que hace de cámara.
  const escenario = scene.add.container(0, 0);
  raiz.add(escenario);
  const bg = scene.add.image(ANCHO / 2, ALTO / 2, scene.textures.exists(fondoClave) ? fondoClave : 'bg-dentro');
  bg.setScale(Math.max(ANCHO / bg.width, ALTO / bg.height) * 1.05);
  escenario.add(bg);
  const ui = scene.add.container(0, 0);
  raiz.add(ui);

  // Reparto: los que hablan, repartidos por el suelo (Vuper a la izquierda si sale).
  const ids = [...new Set(lineas.map(l => l[0]).filter(q => posesDe(q, humo)))];
  ids.sort((a, b) => (a === 'vuper' ? -1 : b === 'vuper' ? 1 : 0));
  const actores = {};
  ids.forEach((id, i) => {
    const poses = posesDe(id, humo).map(k => (scene.textures.exists(k) ? k : null));
    if (!poses[0]) return;
    const x = ids.length === 1 ? ANCHO / 2 : 260 + (i * (ANCHO - 520)) / (ids.length - 1);
    const img = scene.add.image(x, 690, poses[0]).setOrigin(0.5, 1);
    const alto = id === 'pompa' && humo ? 230 : 340;
    img.setScale(alto / img.height);
    img.setFlipX(x > ANCHO / 2 && id !== 'pompa');
    escenario.add(img);
    scene.tweens.add({ targets: img, y: 684, duration: 1300 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    actores[id] = { img, poses: poses.map(p => p || poses[0]), alto, x };
  });
  const pose = (a, k) => { if (!a) return; a.img.setTexture(a.poses[k]); a.img.setScale(a.alto / a.img.height); };

  // Cámara: encuadra un punto con zoom (0 ms = corte seco).
  const encuadre = (fx, fy, z, ms = 0) => {
    const x = ANCHO / 2 - fx * z;
    const y = ALTO / 2 - fy * z;
    const cx = Phaser.Math.Clamp(x, ANCHO - ANCHO * z * 1.02, 0);
    const cy = Phaser.Math.Clamp(y, ALTO - ALTO * z * 1.02, 0);
    scene.tweens.killTweensOf(escenario);
    if (!ms) escenario.setScale(z).setPosition(cx, cy);
    else scene.tweens.add({ targets: escenario, scale: z, x: cx, y: cy, duration: ms, ease: 'Sine.inOut' });
  };

  let i = -1;
  let escribiendo = null;
  let piezas = [];
  let bloqueado = false;
  const limpiar = () => { piezas.forEach(p => p.destroy()); piezas = []; };
  const escribir = (txtObj, txt, alFin) => {
    let k = 0;
    txtObj.setText('');
    escribiendo = { fin: () => { if (escribiendo) { escribiendo.ev.remove(); escribiendo = null; txtObj.setText(txt); if (alFin) alFin(); } } };
    escribiendo.ev = scene.time.addEvent({ delay: 24, repeat: txt.length - 1, callback: () => { k++; txtObj.setText(txt.slice(0, k)); if (k >= txt.length && escribiendo) { escribiendo = null; if (alFin) alFin(); } } });
  };
  const vistas = (ESTADO.cartelasVistas = ESTADO.cartelasVistas || {});
  let ultimo = null;

  const terminar = () => {
    if (bloqueado === 'fin') return;
    bloqueado = 'fin';
    if (escribiendo) escribiendo.fin();
    limpiar();
    Comic.cubrir.iris(scene, () => {
      scene.cerrarModal();
      Comic.destapar.iris(scene, { x: scene.px, y: scene.py - 110 });
      if (alAcabar) alAcabar();
    }, { x: ANCHO / 2, y: ALTO / 2 - 60 });
  };

  const siguiente = () => {
    if (bloqueado) return;
    if (escribiendo) return escribiendo.fin();
    i++;
    limpiar();
    if (i >= lineas.length) return terminar();
    const [quien, txt, arte] = lineas[i];

    if (quien === 'titulo') {
      // Portada del capítulo: la ilustración si existe; si no, tarjeta morada con rayos que giran.
      if (arte && scene.textures.exists(arte)) {
        const a = scene.add.image(ANCHO / 2, ALTO / 2, arte);
        a.setScale(Math.max(ANCHO / a.width, ALTO / a.height));
        scene.tweens.add({ targets: a, scale: a.scale * 1.07, duration: 6000 });
        ui.add(a); piezas.push(a);
      } else {
        const fondoT = scene.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, UNAKE.morado);
        const rayos = scene.add.graphics({ x: ANCHO / 2, y: ALTO / 2 });
        for (let r = 0; r < 14; r++) {
          const a0 = (r / 14) * Math.PI * 2;
          rayos.fillStyle(r % 2 ? 0x5b2a86 : 0x3a1c52, 1).fillTriangle(0, 0, Math.cos(a0) * 1200, Math.sin(a0) * 1200, Math.cos(a0 + 0.22) * 1200, Math.sin(a0 + 0.22) * 1200);
        }
        scene.tweens.add({ targets: rayos, angle: 360, duration: 40000, repeat: -1 });
        ui.add([fondoT, rayos]); piezas.push(fondoT, rayos);
      }
      const [capN, nombre] = txt.split(' · ');
      const t1 = texto(scene, ANCHO / 2, 250, capN, 40, COLOR.crema).setScale(0);
      const t2 = texto(scene, ANCHO / 2, -120, nombre || txt, 84, COLOR.amarillo, 1100);
      ui.add([t1, t2]); piezas.push(t1, t2);
      sfx(scene, 'sting', { volume: 0.5 });
      scene.tweens.add({ targets: t1, scale: 1, duration: 400, ease: 'Back.out' });
      scene.tweens.add({ targets: t2, y: 360, duration: 900, ease: 'Bounce.out', delay: 250 });
      scene.time.delayedCall(1150, () => { if (t2.active) { scene.cameras.main.shake(160, 0.005); sfx(scene, 'golpe', { volume: 0.4 }); } });
      encuadre(ANCHO / 2, ALTO / 2, 1);
      return;
    }

    if (quien === 'objetivos') {
      // Cierre: plano general y la lista de lo que hay que hacer, como cartela de cómic.
      encuadre(ANCHO / 2, ALTO / 2, 1, 500);
      const objetivos = capituloActual().objetivos;
      const caja = scene.add.container(ANCHO / 2, ALTO / 2).setAngle(-2).setScale(0);
      const alto = 120 + objetivos.length * 46;
      const g = scene.add.graphics();
      g.fillStyle(HEX.tinta, 1).fillRect(-430 + 10, -alto / 2 + 10, 860, alto);
      g.fillStyle(UNAKE.amarillo, 1).fillRect(-430, -alto / 2, 860, alto).lineStyle(8, HEX.tinta, 1).strokeRect(-430, -alto / 2, 860, alto);
      caja.add(g);
      caja.add(scene.add.text(0, -alto / 2 + 22, 'Esta noche toca:', { fontFamily: FUENTE, fontSize: '34px', color: COLOR.tinta }).setOrigin(0.5, 0));
      objetivos.forEach((o, k) => caja.add(scene.add.text(-390, -alto / 2 + 78 + k * 46, `▸ ${o.texto}`, { fontFamily: FUENTE, fontSize: '22px', color: '#3a1c52', wordWrap: { width: 780 } })));
      ui.add(caja); piezas.push(caja);
      scene.tweens.add({ targets: caja, scale: 1, duration: 380, ease: 'Back.out' });
      sfx(scene, 'campanita', { volume: 0.5 });
      return;
    }

    if (quien === 'narrador' || !actores[quien]) {
      // Cartucho del narrador: plano general con un zoom lento.
      encuadre(ANCHO / 2, ALTO / 2 + 40, 1.0, 0);
      encuadre(ANCHO / 2, ALTO / 2 + 40, 1.06, 4000);
      const caja = scene.add.container(60, 50).setAngle(-1.5);
      const t = scene.add.text(26, 18, '', { fontFamily: FUENTE, fontSize: '28px', color: COLOR.tinta, wordWrap: { width: 980 }, lineSpacing: 6 });
      const medida = scene.add.text(0, 0, txt, { fontFamily: FUENTE, fontSize: '28px', wordWrap: { width: 980 }, lineSpacing: 6 }).setVisible(false);
      const g = scene.add.graphics();
      g.fillStyle(HEX.tinta, 1).fillRect(8, 8, 1040, medida.height + 36);
      g.fillStyle(UNAKE.amarillo, 1).fillRect(0, 0, 1040, medida.height + 36).lineStyle(6, HEX.tinta, 1).strokeRect(0, 0, 1040, medida.height + 36);
      medida.destroy();
      caja.add([g, t]);
      caja.x = -1100;
      scene.tweens.add({ targets: caja, x: 60, duration: 260, ease: 'Back.out' });
      ui.add(caja); piezas.push(caja);
      sfx(scene, 'zas', { volume: 0.35 });
      escribir(t, txt);
      Object.values(actores).forEach(a => pose(a, 0));
      ultimo = null;
      return;
    }

    // Alguien habla: corte seco a su plano, pose de hablar, los demás a la escucha.
    const a = actores[quien];
    Object.entries(actores).forEach(([id, o]) => pose(o, id === quien ? 1 : 0));
    const z = Object.keys(actores).length > 1 ? 1.55 : 1.3;
    encuadre(a.x, 690 - a.alto * 0.62, z, 0);
    if (ultimo && ultimo !== quien) {
      // El corte se nota: golpecito de escala (como el «snap» del motor).
      escenario.setScale(escenario.scale * 1.04);
      scene.tweens.add({ targets: escenario, scale: z, duration: 160, ease: 'Quad.out' });
    }
    ultimo = quien;
    const sx = a.img.scaleX;
    a.img.setScale(sx * 1.12, sx * 0.9);
    scene.tweens.add({ targets: a.img, scaleX: sx, scaleY: sx, duration: 260, ease: 'Back.out' });
    const b = bocadillo(scene, ANCHO / 2 + (a.x < ANCHO / 2 ? 170 : -170), 130, txt, { tam: 30, ancho: 640, cola: a.x < ANCHO / 2 ? 'izq' : 'der' });
    b.setDepth(0);
    ui.add(b); piezas.push(b);
    const tb = b.list[1];
    escribir(tb, txt);
    sfx(scene, 'pop', { volume: 0.3 });

    // Cartela la primera vez que sale alguien.
    if (CARTELAS[quien] && !vistas[quien]) {
      vistas[quien] = true;
      guardarPartida();
      const [nom, sub, col] = CARTELAS[quien];
      const cart = Comic.cartela(scene, nom, sub, col, { x: 60, y: ALTO - 190, ms: 2600 });
      cart.setDepth(0);
      ui.add(cart);
      piezas.push(cart); // se va con la línea
    }
    // Remates según la frase.
    const pantalla = { x: ANCHO / 2, y: 260 };
    if (/JA/.test(txt)) { scene.cameras.main.shake(220, 0.006); Comic.emote(scene, pantalla.x - 120, pantalla.y, 'chispas', { profundidad: 990 }); }
    else if (/¡Escucha/.test(txt)) Comic.emote(scene, pantalla.x - 140, pantalla.y + 20, 'chispas', { profundidad: 990 });
    else if (/…$|Otra vez no/.test(txt)) Comic.emote(scene, pantalla.x - 130, pantalla.y + 40, 'gota', { profundidad: 990 });
    else if (/casero|cierra|alquiler/.test(txt)) Comic.emote(scene, pantalla.x - 130, pantalla.y + 30, 'calavera', { profundidad: 990, tam: 64 });
    // Pregunta corta («¿Una qué?»): pantalla de reacción del que tiene que contestar.
    const siguienteQuien = lineas[i + 1] && lineas[i + 1][0];
    if (txt.length < 18 && txt.includes('?') && actores[siguienteQuien] && siguienteQuien !== quien) {
      bloqueado = true;
      scene.time.delayedCall(700, () => {
        Comic.reaccion(scene, actores[siguienteQuien].poses[2], { color: UNAKE.rosa, ms: 600 }).then(() => { bloqueado = false; });
      });
    }
  };

  velo.on('pointerdown', siguiente);
  scene.modalAccion = siguiente;
  scene.modalCerrar = terminar; // Esc: se salta la escena
  // Salta un poco de humo al empezar, como entrada en frío.
  destaparHumo(scene);
  siguiente();
};

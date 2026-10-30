// Noche de barra (Palicaso): los de la aso piden en la barra de Unaké. Cada cliente trae su pedido
// en un bocadillo y una barra de paciencia. Pulsar 1-4 sirve ese producto al cliente que lo pide y
// lleva más rato esperando. Si alguien se cansa, se va indignado (una vida menos). Si se cuela Puky,
// X para echarlo antes de que pringue la barra. Dura 60 s y cada vez llegan más rápido.

const PRODUCTOS = [
  { clave: 'lata', nombre: 'resucitador' },
  { clave: 'patatas', nombre: 'patatas' },
  { clave: 'caramelo', nombre: 'caramelo' },
  { clave: 'obj-bolsita', nombre: 'lo de la aso' },
];
const CLIENTES = ['lasslow-digno', 'cotine', 'perico', 'pompa-mira', 'blancaso', 'vuper'];
const SITIOS_BARRA = [300, 520, 760, 980];
const DURACION_BARRA = 60;

class Barra extends Phaser.Scene {
  constructor() { super('Barra'); }

  create(datos) {
    this.puntos = 0;
    this.vidas = 3;
    this.servidos = 0;
    this.combo = 0;
    this.restante = DURACION_BARRA;
    this.proximo = 1;
    this.activo = false;
    this.sitios = SITIOS_BARRA.map(x => ({ x, cliente: null }));
    // Los niveles cambian la noche: desde el 3, Lasslow suelta nubes que tapan pedidos; desde el 5, hay más prisa.
    this.nivel = nivelDe('Barra');
    this.tNube = 6;

    fondo(this, enMundoHumo() ? 'bg-dentro' : 'bgn-dentro');
    this.palicaso = this.add.image(640, 458, 'palicaso').setOrigin(0.5, 1).setDepth(2);
    this.palicaso.setScale(200 / this.palicaso.height);
    flotar(this, this.palicaso, { amplitud: 4 });

    // Marcadores.
    this.estrellasVida = [0, 1, 2].map(i => this.add.star(46 + i * 50, 44, 5, 10, 22, HEX.amarillo).setStrokeStyle(4, HEX.tinta).setDepth(50));
    this.textoPuntos = texto(this, ANCHO - 150, 40, '0 puntos', 30, COLOR.amarillo).setDepth(50);
    this.textoTiempo = texto(this, ANCHO / 2, 40, '', 30, COLOR.crema).setDepth(50);
    this.textoCombo = texto(this, ANCHO - 150, 80, '', 22, COLOR.verde).setDepth(50);

    // Botones de servir (1-4) y echar (X).
    PRODUCTOS.forEach((p, i) => {
      const b = boton(this, 230 + i * 190, 670, '', () => this.servir(i), { ancho: 170, alto: 76, tam: 20 }).setDepth(60);
      b.etiqueta.setText(`${i + 1}`).setPosition(-56, 0).setFontSize(30);
      const img = this.add.image(18, 0, p.clave);
      img.setScale(54 / Math.max(img.width, img.height));
      b.add(img);
    });
    boton(this, 1060, 670, 'X · ¡Fuera!', () => this.echar(), { ancho: 220, alto: 76, tam: 24, color: HEX.rosa }).setDepth(60);
    this.input.keyboard.on('keydown', e => {
      const n = ['1', '2', '3', '4'].indexOf(e.key);
      if (n >= 0) this.servir(n);
      if (e.key === 'x' || e.key === 'X') this.echar();
    });

    entrar(this, datos);
    this.time.delayedCall(datos && datos.rotulo ? 1900 : 400, () => {
      const c = this.add.container(ANCHO / 2, 300).setDepth(80);
      c.add(this.add.graphics().fillStyle(HEX.tinta, 0.88).fillRoundedRect(-480, -110, 960, 220, 24));
      c.add(texto(this, 0, -60, '¡Noche de barra!', 40, COLOR.amarillo));
      c.add(texto(this, 0, 10, 'Sirve a cada uno lo que pide con 1-4 antes de que se canse.\nSi se cuela Puky, X para echarlo.', 24, COLOR.crema, 900));
      this.time.delayedCall(3200, () => {
        c.destroy();
        this.activo = true;
        // La noche empieza con gente: dos clientes casi de inmediato.
        this.nuevoCliente();
        this.time.delayedCall(700, () => this.nuevoCliente());
        this.proximo = 2;
      });
    });
  }

  nuevoCliente() {
    const libres = this.sitios.filter(s => !s.cliente);
    if (!libres.length) return;
    const sitio = Phaser.Utils.Array.GetRandom(libres);
    const puky = !bonoDeco('sinPuky') && Math.random() < Math.min(0.12 + (DURACION_BARRA - this.restante) / 400, 0.25);
    const clave = puky ? 'puky' : Phaser.Utils.Array.GetRandom(CLIENTES);
    const img = this.add.image(sitio.x, ALTO + 200, clave).setOrigin(0.5, 1).setDepth(10);
    const esc = (puky ? 160 : 190) / img.height;
    img.setScale(esc);
    this.tweens.add({ targets: img, y: 610, duration: 380, ease: 'Back.out' });
    const pedido = puky ? -1 : Phaser.Math.Between(0, PRODUCTOS.length - 1);
    const paciencia = (puky ? 3.2 : Math.max(4, 9 - (DURACION_BARRA - this.restante) / 12)) * (this.nivel >= 5 ? 0.85 : 1);
    // Bocadillo con el pedido (o «¿Me llamabais?» si es Puky).
    const b = this.add.container(sitio.x, 330).setDepth(20).setScale(0);
    b.add(this.add.graphics().fillStyle(0xffffff, 1).lineStyle(5, HEX.tinta, 1).fillRoundedRect(-52, -46, 104, 92, 22).strokeRoundedRect(-52, -46, 104, 92, 22).fillTriangle(-12, 44, 12, 44, 0, 66));
    if (puky) b.add(texto(this, 0, 0, '?', 50, COLOR.rosa));
    else {
      const ic = this.add.image(0, 0, PRODUCTOS[pedido].clave);
      ic.setScale(64 / Math.max(ic.width, ic.height));
      b.add(ic);
    }
    this.tweens.add({ targets: b, scale: 1, duration: 260, ease: 'Back.out', delay: 200 });
    const arco = this.add.graphics().setDepth(21);
    sitio.cliente = { img, esc, pedido, puky, paciencia, t: paciencia, b, arco, clave };
    sfx(this, puky ? 'blurp' : 'pop', { volume: 0.5 });
    if (puky) sitio.cliente.dice = bocadillo(this, sitio.x, 220, '¿Me llamabais?', { tam: 20 }).setDepth(22);
  }

  servir(n) {
    if (!this.activo) return;
    const quieren = this.sitios.filter(s => s.cliente && !s.cliente.puky && s.cliente.pedido === n);
    if (!quieren.length) {
      this.combo = 0;
      this.textoCombo.setText('');
      sfx(this, 'bonk', { volume: 0.5 });
      golpeTexto(this, 640, 260, '¡Eso no lo ha pedido nadie!', COLOR.rosa, 32);
      return;
    }
    const s = quieren.sort((a, b) => a.cliente.t - b.cliente.t)[0];
    const c = s.cliente;
    // Lo servido vuela por la barra hasta el cliente.
    const vuela = this.add.image(640, 400, PRODUCTOS[n].clave).setDepth(25);
    vuela.setScale(60 / Math.max(vuela.width, vuela.height));
    this.tweens.add({ targets: vuela, x: s.x, y: 470, angle: 360, duration: 280, ease: 'Sine.in', onComplete: () => vuela.destroy() });
    sfx(this, 'zas', { volume: 0.4 });
    this.palicaso.setTexture('palicaso-riendo');
    this.time.delayedCall(300, () => this.palicaso.setTexture('palicaso'));
    this.combo++;
    if (this.combo % 4 === 0) Comic.racha(this, this.combo);
    const propina = Math.round(40 + 60 * (c.t / c.paciencia));
    const pts = Math.round(propina * (1 + Math.floor(this.combo / 4) * 0.5));
    this.sumar(pts);
    this.servidos++;
    this.textoCombo.setText(this.combo >= 4 ? `Racha x${1 + Math.floor(this.combo / 4) * 0.5}` : '');
    this.time.delayedCall(280, () => {
      sfx(this, 'campanita', { volume: 0.4 });
      golpeTexto(this, s.x, 240, `+${pts}`, COLOR.verde, 34);
      this.irse(s, true);
    });
    s.cliente = { ...c, servido: true };
  }

  echar() {
    if (!this.activo) return;
    const s = this.sitios.find(x => x.cliente && x.cliente.puky);
    if (!s) {
      golpeTexto(this, 640, 260, 'No hay nadie a quien echar', COLOR.crema, 30);
      return;
    }
    sfx(this, 'zas');
    golpeTexto(this, s.x, 240, '¡FUERA!', COLOR.amarillo, 44);
    Comic.impacto(this, s.x, 470, { tam: 90, profundidad: 30 });
    this.sumar(60);
    const img = s.cliente.img;
    this.tweens.add({ targets: img, x: img.x + 500, angle: 200, y: img.y - 200, duration: 450, ease: 'Sine.in', onComplete: () => img.destroy() });
    s.cliente.b.destroy();
    s.cliente.arco.destroy();
    if (s.cliente.dice) s.cliente.dice.destroy();
    s.cliente = null;
  }

  irse(s, contento) {
    const c = s.cliente;
    if (!c) return;
    s.cliente = null;
    c.b.destroy();
    c.arco.destroy();
    if (c.dice) c.dice.destroy();
    this.tweens.add({ targets: c.img, scaleY: c.esc * 1.15, duration: 120, yoyo: true });
    this.tweens.add({ targets: c.img, y: ALTO + 260, duration: 420, delay: contento ? 250 : 500, ease: 'Back.in', onComplete: () => c.img.destroy() });
    if (!contento) c.img.setTint(0xff9a9a);
  }

  perder(s, texto_) {
    this.vidas--;
    this.combo = 0;
    this.textoCombo.setText('');
    this.estrellasVida[this.vidas].setFillStyle(0x3d3350);
    sfx(this, 'abucheo', { volume: 0.5 });
    this.cameras.main.shake(250, 0.01);
    golpeTexto(this, s.x, 240, texto_, COLOR.rosa, 34);
    Comic.emote(this, s.x + 40, 400, 'rayo', { tam: 60, profundidad: 30 });
    this.irse(s, false);
    if (this.vidas <= 0) this.final();
  }

  sumar(n) {
    this.puntos += n;
    this.textoPuntos.setText(`${this.puntos} puntos`);
  }

  update(_t, dms) {
    if (!this.activo) return;
    const dt = Math.min(dms / 1000, 0.05);
    this.restante -= dt;
    this.textoTiempo.setText(`${Math.ceil(Math.max(0, this.restante))} s`);
    // Nivel 3+: una nube de Lasslow tapa el pedido de alguien un rato.
    if (this.nivel >= 3) {
      this.tNube -= dt;
      const ocupados = this.sitios.filter(s => s.cliente && !s.cliente.puky && !s.cliente.servido);
      if (this.tNube <= 0 && ocupados.length) {
        this.tNube = Phaser.Math.Between(7, 11);
        const s = Phaser.Utils.Array.GetRandom(ocupados);
        const n = this.add.image(s.x, 330, this.textures.exists('fx-nube-pedo') ? 'fx-nube-pedo' : 'humo').setDepth(26).setAlpha(0);
        n.setScale(150 / n.height);
        sfx(this, 'pedo-silencioso', { volume: 0.5 });
        this.tweens.chain({ targets: n, tweens: [{ alpha: 0.95, duration: 250 }, { alpha: 0.95, duration: 2000 }, { alpha: 0, duration: 400 }], onComplete: () => n.destroy() });
        if (!this.avisoNube) { this.avisoNube = true; golpeTexto(this, 640, 200, 'Lasslow se ha tirado uno: ¡no se ve el pedido!', COLOR.rosa, 28); }
      }
    }
    this.proximo -= dt;
    if (this.proximo <= 0) {
      this.nuevoCliente();
      this.proximo = Math.max(0.7, 2.3 - (DURACION_BARRA - this.restante) / 30) + Math.random() * 0.6;
    }
    this.sitios.forEach(s => {
      const c = s.cliente;
      if (!c || c.servido) return;
      c.t -= dt;
      const f = Math.max(0, c.t / c.paciencia);
      c.arco.clear().lineStyle(8, f < 0.3 ? HEX.rojo : f < 0.6 ? HEX.amarillo : 0x7ee081, 1).beginPath().arc(s.x, 330, 66, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2).strokePath();
      // Impaciencia: se mueve más cuanto menos le queda.
      c.img.x = s.x + Math.sin(this.time.now / 60) * (1 - f) * 6;
      if (c.t <= 0) this.perder(s, c.puky ? '¡Puky pringa la barra!' : '¡Hmpf! Me voy');
    });
    if (this.restante <= 0) this.final();
  }

  final() {
    if (this._acabado) return;
    this._acabado = true;
    this.activo = false;
    this.time.delayedCall(800, () => panelFinal(this, {
      titulo: this.vidas > 0 ? '¡Cierre de barra!' : 'La barra se vacía',
      linea: `Has servido a ${this.servidos} de la aso. ${this.vidas > 0 ? 'Palicaso no ha parado de hablar en toda la noche.' : 'Demasiada gente enfadada. Palicaso sigue hablando solo.'}`,
      // Ganar = acabar la noche con vidas y llegar a la primera estrella (si no, no cuenta para la situación).
      puntos: this.puntos, clave: 'Barra', gana: this.vidas > 0 && this.puntos >= 900, // aprobar es fácil; las estrellas, no
    }));
  }
}

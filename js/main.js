// Arranca el juego cuando la letra de dibujo animado (Caprasimo) ya está cargada.

function arrancar() {
  window.juego = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'juego',
    width: ANCHO,
    height: ALTO,
    backgroundColor: COLOR.tinta,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, fullscreenTarget: 'juego' },
    input: { activePointers: 3 },
    scene: [Arranque, Portada, Intro, Barrio, Contrasena, Tarta, Lasslow, Rescate, Liar, Fumar, Blancazo, Final, Barra, Pipas, DJ, Cuentas, Tragaperras, Carrera, Farol, Periquito],
  });
}

const fuenteLista = document.fonts ? document.fonts.load(`40px ${FUENTE}`) : Promise.resolve();
Promise.race([fuenteLista, new Promise(r => setTimeout(r, 3000))]).finally(arrancar);

// Arranca el juego cuando la letra de dibujo animado (Caprasimo) ya está cargada.

function arrancar() {
  window.juego = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'juego',
    width: ANCHO,
    height: ALTO,
    backgroundColor: COLOR.tinta,
    // FIT a 1280x720: todas las escenas colocan con ANCHO/ALTO fijos (EXPAND enseñaría zonas fuera del diseño).
    // Pantalla completa sobre la página entera, no solo #juego: así entran también el aviso de girar y los mandos.
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, fullscreenTarget: document.documentElement },
    input: { activePointers: 3 },
    scene: [Arranque, Casetas, Portada, Intro, Barrio, Puerta, Circulo, Contrasena, Tarta, Lasslow, Rescate, Liar, Fumar, Blancazo, Final, Barra, Pipas, DJ, Cuentas, Tragaperras, Carrera, Farol, Periquito, Inspeccion, Cuenta, Poscreditos, Aires, Palo, Sigilo, Furgo, Control, EnSuPunto, Rendija, Compostura, Escucha, Camaras, TiroPato, Mirando, Recuerdo, Recreativa, Tormenta, Amarillo],
  });
}

const fuenteLista = document.fonts ? document.fonts.load(`40px ${FUENTE}`) : Promise.resolve();
Promise.race([fuenteLista, new Promise(r => setTimeout(r, 3000))]).finally(arrancar);

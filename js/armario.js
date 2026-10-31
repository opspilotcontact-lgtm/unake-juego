// El armario de Vuper (en su cuarto): prendas y pieles que se compran con monchis y se ven puestas.
// Un hueco por tipo (cabeza, ojos, cuello, piel). Cada cosa da una ventaja pequeña, para que valga
// la pena ahorrar sin romper el juego. Las prendas son dibujos de Gemini (arte/objetos/acc-*.png);
// si alguna no está, no sale en el armario. Las pieles son efectos de color, no necesitan dibujo.

const ARMARIO = [
  { id: 'gorra', nombre: 'Gorra del revés', hueco: 'cabeza', sprite: 'obj-acc-gorra', precio: 300, efecto: '+5 % de monchis', bono: { pago: 0.05 } },
  { id: 'cascos', nombre: 'Cascos de la Pompa (al cuello)', hueco: 'cabeza', sprite: 'obj-acc-cascos', precio: 450, efecto: '+8 % de monchis', bono: { pago: 0.08 } },
  { id: 'chistera', nombre: 'Chistera de señor', hueco: 'cabeza', sprite: 'obj-acc-chistera', precio: 550, efecto: 'Un señor cobra mejor: +10 %', bono: { pago: 0.1 } },
  { id: 'corona', nombre: 'Corona de humo', hueco: 'cabeza', sprite: 'obj-acc-corona', precio: 1200, efecto: 'Rey de la aso: +18 % de monchis', bono: { pago: 0.18 } },
  { id: 'gafas', nombre: 'Gafas de neón', hueco: 'ojos', sprite: 'obj-acc-gafas', precio: 400, efecto: 'El colocón dura más', bono: { colocon: -0.15 } },
  { id: 'antifaz', nombre: 'Antifaz de incógnito', hueco: 'ojos', sprite: 'obj-acc-antifaz', precio: 700, efecto: 'Monchiman de paisano: colocón y hambre, mejor', bono: { colocon: -0.1, hambre: -0.1 } },
  { id: 'bufanda', nombre: 'Bufanda de punto', hueco: 'cuello', sprite: 'obj-acc-bufanda', precio: 350, efecto: 'El hambre sube más despacio', bono: { hambre: -0.15 } },
  { id: 'cadena', nombre: 'Cadena con la M', hueco: 'cuello', sprite: 'obj-acc-cadena', precio: 800, efecto: '+12 % de monchis', bono: { pago: 0.12 } },
  { id: 'dorado', nombre: 'Piel dorada', hueco: 'piel', tinte: 0xffd36b, precio: 600, efecto: 'Brillas: +5 % de monchis', bono: { pago: 0.05 } },
  { id: 'neon', nombre: 'Piel de neón', hueco: 'piel', tinte: 'neon', precio: 500, efecto: 'Te ven de lejos. El colocón dura algo más', bono: { colocon: -0.05 } },
  { id: 'arcoiris', nombre: 'Piel arcoíris', hueco: 'piel', tinte: 'arcoiris', precio: 1000, efecto: 'Leyenda del barrio: +10 % de monchis', bono: { pago: 0.1 } },
];

function armario() {
  ESTADO.armario = ESTADO.armario || { tiene: {}, puesto: {} };
  return ESTADO.armario;
}
function prendaPuesta(hueco) {
  const id = armario().puesto[hueco];
  return id ? ARMARIO.find(p => p.id === id) : null;
}
// Suma de las ventajas de lo que llevas puesto (misma escala que bonoDeco: 0,1 = 10 %).
function bonoArmario(k) {
  return ['cabeza', 'ojos', 'cuello', 'piel'].reduce((a, h) => { const p = prendaPuesta(h); return a + ((p && p.bono[k]) || 0); }, 0);
}
function prendaDisponible(p, scene) { return p.hueco === 'piel' || scene.textures.exists(p.sprite); }

// Color de la piel puesta (o null).
function tintePiel(t) {
  const p = prendaPuesta('piel');
  if (!p) return null;
  if (p.tinte === 'neon') return Math.sin(t / 300) > 0 ? 0x7ff3ff : 0xff8ad8;
  if (p.tinte === 'arcoiris') return Phaser.Display.Color.HSVToRGB((t / 2500) % 1, 0.45, 1).color;
  return p.tinte;
}

// Dónde va cada prenda sobre el dibujo de Vuper: [alto desde los pies, ancho, origen vertical], en
// fracciones de su tamaño (de noche es una nube; de día, una persona con la nube por cabeza). Los
// sombreros se APOYAN en la cabeza (origen abajo), las cadenas CUELGAN del cuello (origen arriba) y
// las gafas van centradas en los ojos: así no tapan la cara (medido con fotos el 31/10/2026).
const ANCLAS_ARMARIO = {
  humo: { cabeza: [0.8, 0.5, 1], ojos: [0.6, 0.56, 0.5], cuello: [0.13, 0.5, 0.5] },
  normal: { cabeza: [0.9, 0.36, 1], ojos: [0.8, 0.34, 0.5], cuello: [0.53, 0.32, 0.5] },
};
// Prendas con forma propia: la cadena cuelga y los cascos van colgados al cuello, de DJ
// (el dibujo mira de frente: puestos en la cabeza tapaban la cara).
const ANCLAS_PRENDA = {
  cadena: { humo: [0.24, 0.3, 0], normal: [0.6, 0.24, 0] },
  cascos: { humo: [0.14, 0.66, 0.5], normal: [0.52, 0.44, 0.5] },
};

// Monta (o actualiza) las prendas encima de Vuper; se llama cada fotograma desde el barrio.
function vestirVuper(s) {
  const j = s.jugador;
  if (!j) return;
  s.prendas = s.prendas || {};
  const mundo = s.mundo === 'humo' ? 'humo' : 'normal';
  ['cabeza', 'ojos', 'cuello'].forEach(h => {
    const p = prendaPuesta(h);
    let img = s.prendas[h];
    if (!p || !s.textures.exists(p.sprite)) { if (img) img.setVisible(false); return; }
    if (!img || !img.active) img = s.prendas[h] = s.add.image(0, 0, p.sprite);
    if (img.texture.key !== p.sprite) img.setTexture(p.sprite);
    const [alto, ancho, origen] = (ANCLAS_PRENDA[p.id] && ANCLAS_PRENDA[p.id][mundo]) || ANCLAS_ARMARIO[mundo][h];
    img.setOrigin(0.5, origen).setScale(j.displayWidth * ancho / img.width).setVisible(j.visible);
    // Gira con Vuper: la x se refleja si va dado la vuelta.
    const lado = j.flipX ? -1 : 1;
    const desvio = mundo === 'humo' ? 0 : lado * j.displayWidth * 0.04;
    const rad = Phaser.Math.DegToRad(j.angle);
    const dy = -j.displayHeight * alto;
    img.setPosition(j.x + desvio - Math.sin(rad) * dy, j.y + Math.cos(rad) * dy);
    img.setAngle(j.angle).setFlipX(j.flipX).setDepth(j.depth + 1).setAlpha(j.alpha);
  });
  const tinte = tintePiel(s.time.now);
  if (tinte) j.setTint(tinte); else j.clearTint();
}

// Generado por herramientas/preparar_assets.py: el arte de Gemini que hay ahora mismo.
const ARTE = ["meme-blancaso-cuentas", "meme-cotine-migas", "cap-cap1"];
const ARTE_PNG = ["obj-bandera-meta", "obj-ficha-monchi", "obj-gato", "obj-monton-monchis", "obj-paloma", "obj-pizarra-carrera", "obj-tragaperras", "fx-charco-amarillo", "fx-nube-pedo"];
// La pieza de Gemini si existe; si no, la de respaldo (dibujada por código o de la serie).
function arteO(clave, respaldo) { return ARTE_PNG.includes(clave) ? clave : respaldo; }

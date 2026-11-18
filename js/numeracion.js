// Numeración de capítulos para enseñar al jugador (17/11/2026). CAPITULOS tiene 17 ids, pero la historia
// promete 16: «La feria» y «La señal» son UN capítulo doble, «12 · I» y «12 · II». Todo lo que enseñe un
// número de capítulo pasa por aquí; el código sigue hablando en ids e índices de CAPITULOS.
const CAP_PARTES = { feria: 'I', senal: 'II' }; // partes de un mismo capítulo, en orden

// Número que se enseña del capítulo en la posición `indice` de CAPITULOS: '1'…'11', '12 · I', '12 · II', '13'…'16'.
function etiquetaCap(indice) {
  const lista = typeof CAPITULOS !== 'undefined' ? CAPITULOS : [];
  if (!lista.length) return String((indice || 0) + 1);
  const i = Math.max(0, Math.min(indice || 0, lista.length - 1));
  let num = 0;
  for (let k = 0; k <= i; k++) {
    const parte = CAP_PARTES[(lista[k] || {}).id];
    const anterior = k > 0 && CAP_PARTES[(lista[k - 1] || {}).id];
    if (!parte || !anterior) num++; // la segunda parte de un doble no suma
  }
  const parte = CAP_PARTES[(lista[i] || {}).id];
  return parte ? `${num} · ${parte}` : String(num);
}

// Cuántos capítulos tiene la historia contando el doble como uno (16).
function totalCapitulos() {
  const lista = typeof CAPITULOS !== 'undefined' ? CAPITULOS : [];
  return lista.filter((c, k) => !(CAP_PARTES[c.id] && k > 0 && CAP_PARTES[(lista[k - 1] || {}).id])).length;
}

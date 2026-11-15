// Filtra las filas de la tabla por nombre y por nivel de stock (sin recargar la pagina)
(function () {
  const q = document.getElementById('buscar'), n = document.getElementById('nivel');
  const filas = document.querySelectorAll('#tabla tbody tr[data-nombre]');
  function filtrar() {
    const t = (q ? q.value : '').trim().toLowerCase(), v = n ? n.value : '';
    filas.forEach(f => { f.style.display = (!t || f.dataset.nombre.includes(t)) && (!v || f.dataset.nivel === v) ? '' : 'none'; });
  }
  if (q) q.addEventListener('input', filtrar);
  if (n) n.addEventListener('change', filtrar);
})();

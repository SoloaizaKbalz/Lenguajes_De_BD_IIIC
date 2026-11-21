// ===============================
// Punto de venta (POS)
// Gestiona el carrito de compras y registra ventas
// ===============================

// Carrito de compras almacenado en memoria
// id -> {id, nombre, precio, stock, cantidad}

(function () {
  const IVA = 0.13;
  const carrito = new Map(); // id -> { id, nombre, precio, stock, cantidad }

  // Función auxiliar para obtener elementos del DOM por id
  const $ = id => document.getElementById(id);
  const colones = n => '₡' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');


// ===============================
// Renderizar el carrito y calcula totales
// ===============================
  function pintar() {
    const cont = $('lineas'); cont.innerHTML = '';
    let subtotal = 0;
    if (carrito.size === 0) cont.innerHTML = '<p class="carrito-vacio">Aún no hay productos en la venta.</p>';
    carrito.forEach(l => {
      subtotal += l.precio * l.cantidad;
      const d = document.createElement('div'); d.className = 'linea';
      d.innerHTML = `<div class="nom"><b></b><small>${colones(l.precio)} c/u</small></div>
        <div class="cant"><button data-a="-" data-id="${l.id}">−</button><span>${l.cantidad}</span><button data-a="+" data-id="${l.id}">+</button></div>
        <div class="sub">${colones(l.precio * l.cantidad)}</div><button class="quitar" data-a="x" data-id="${l.id}" title="Quitar">✕</button>`;
      d.querySelector('b').textContent = l.nombre; cont.appendChild(d);
    });
    $('subtotal').textContent = colones(subtotal);
    $('iva').textContent = colones(subtotal * IVA);
    $('total').textContent = colones(subtotal * (1 + IVA));
    $('registrar').disabled = carrito.size === 0;
  }

// ===============================
// Muestra mensajes de éxito o error
// ===============================

  function aviso(texto, ok) { $('mensaje').innerHTML = `<div class="alerta ${ok ? 'ok' : 'error'}"></div>`; $('mensaje').firstChild.textContent = texto; }

  document.querySelectorAll('.prod .btn[data-id]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.id; const l = carrito.get(id) || { id, nombre: b.dataset.nombre, precio: Number(b.dataset.precio), stock: Number(b.dataset.stock), cantidad: 0 };
    if (l.cantidad >= l.stock) return aviso(`Solo hay ${l.stock} unidades de ${l.nombre}.`, false);
    l.cantidad++; carrito.set(id, l); $('mensaje').innerHTML = ''; pintar();
  }));
  $('lineas').addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return;
    const l = carrito.get(b.dataset.id); if (!l) return;
    if (b.dataset.a === '+') { if (l.cantidad < l.stock) l.cantidad++; else aviso(`Solo hay ${l.stock} unidades de ${l.nombre}.`, false); }
    if (b.dataset.a === '-') l.cantidad--;
    if (b.dataset.a === 'x' || l.cantidad <= 0) carrito.delete(b.dataset.id);
    pintar();
  });

// ===============================
// Filtros del catálogo
// Permiten buscar por nombre y categoría
// ===============================
  let cat = '';
  function filtrar() {
    const t = $('buscar').value.trim().toLowerCase();
    document.querySelectorAll('.prod').forEach(p => { p.style.display = (!t || p.dataset.nombre.includes(t)) && (!cat || p.dataset.cat === cat) ? '' : 'none'; });
  }
  $('buscar').addEventListener('input', filtrar);
  $('chips').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    document.querySelectorAll('.chip').forEach(x => x.classList.remove('activo')); c.classList.add('activo'); cat = c.dataset.cat; filtrar();
  });

  $('registrar').addEventListener('click', async () => {
    const btn = $('registrar'); btn.disabled = true;
    try {
      const r = await fetch('/ventas', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCliente: $('cliente').value, idEmpleado: $('empleado').value, items: [...carrito.values()].map(l => ({ id: l.id, cantidad: l.cantidad })) }) });
      const d = await r.json();
      if (!d.ok) { aviso(d.mensaje, false); btn.disabled = false; return; }
      window.location.href = `/ventas/${d.idVenta}?ok=${encodeURIComponent(d.mensaje)}`;
    } catch (e) { aviso('No se pudo contactar al servidor.', false); btn.disabled = false; }
  });

// ===============================
// Inicializa la interfaz
// ===============================
  pintar();
})();


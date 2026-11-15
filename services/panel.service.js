const { vista } = require('../config/db');
const { nivelStock } = require('./productos.service');

const aMes = f => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
async function resumen() {
  const [productos, ventas, clientes, stockBajo, detalle, proveedores] = await Promise.all([
    vista('VW_PRODUCTOS_DETALLE'), vista('VW_VENTAS_REGISTRADAS', 'ORDER BY IDVENTA DESC'), vista('VW_CLIENTES'),
    vista('VW_STOCK_BAJO'), vista('VW_DETALLE_VENTAS'), vista('VW_PRODUCTOS_PROVEEDOR')
  ]);
  const hoy = new Date(); const mes = aMes(hoy);
  const ventasMes = ventas.filter(v => aMes(new Date(v.FECHAVENTA)) === mes);
  const suma = a => a.reduce((s, v) => s + Number(v.TOTALVENTA || 0), 0);

  // ventas de los ultimos 7 dias
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy); d.setDate(d.getDate() - i);
    const total = suma(ventas.filter(v => new Date(v.FECHAVENTA).toDateString() === d.toDateString()));
    dias.push({ etiqueta: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][d.getDay()], total, hoy: i === 0 });
  }
  // ventas por mes (ultimos 7 meses)
  const meses = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    meses.push({ etiqueta: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()],
      total: suma(ventas.filter(v => aMes(new Date(v.FECHAVENTA)) === aMes(d))), actual: i === 0 });
  }
  // mas vendidos
  const acum = {};
  for (const d of detalle) acum[d.NOMBREPRODUCTO] = (acum[d.NOMBREPRODUCTO] || 0) + Number(d.CANTIDADDETALLE);
  const masVendidos = Object.entries(acum).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([nombre, unidades]) => ({ nombre, unidades }));

  return {
    totalProductos: productos.length, totalClientes: clientes.length, stockBajo,
    agotados: productos.filter(p => nivelStock(p.EXISTENCIASPRODUCTO) === 'AGOTADO').length,
    ventasMes: suma(ventasMes), cantidadVentasMes: ventasMes.length,
    ticket: ventasMes.length ? suma(ventasMes) / ventasMes.length : 0,
    ultimasVentas: ventas.slice(0, 5), dias, meses, masVendidos,
    valorInventario: proveedores.reduce((s, p) => s + Number(p.VALORINVENTARIO || 0), 0), proveedores
  };
}
module.exports = { resumen };

// =====================================================
// DATOS DE EJEMPLO DEL SISTEMA
// Simulan la información de Oracle cuando la aplicación
// se ejecuta en modo de demostración (MODO_DEMO = true).
// Las columnas utilizan nombres en MAYÚSCULA para
// mantiene compatibilidad con oracledb.
// =====================================================

const { calcularIvaCentimos } = require('./iva');
const bcrypt = require('bcrypt');

const hoy = new Date();
const dia = n => { const d = new Date(hoy); d.setDate(d.getDate() - n); d.setHours(10, 30, 0, 0); return d; };

const productos = [
  { IDPRODUCTO: 1, NOMBREPRODUCTO: 'Laptop Dell Inspiron', PRECIOPRODUCTO: 650000, EXISTENCIASPRODUCTO: 15, NOMBRECATEGORIA: 'Laptops', NOMBREMARCA: 'Dell', NOMBREPROVEEDOR: 'Tecno Import CR', IDCATEGORIA: 1, IDMARCA: 1, IDPROVEEDOR: 1 },
  { IDPRODUCTO: 2, NOMBREPRODUCTO: 'Mouse Logitech G203', PRECIOPRODUCTO: 18500, EXISTENCIASPRODUCTO: 45, NOMBRECATEGORIA: 'Perifericos', NOMBREMARCA: 'Logitech', NOMBREPROVEEDOR: 'Distribuidora Digital', IDCATEGORIA: 2, IDMARCA: 2, IDPROVEEDOR: 2 },
  { IDPRODUCTO: 3, NOMBREPRODUCTO: 'Memoria Kingston 16GB', PRECIOPRODUCTO: 28000, EXISTENCIASPRODUCTO: 30, NOMBRECATEGORIA: 'Componentes', NOMBREMARCA: 'Kingston', NOMBREPROVEEDOR: 'Compu Mayoreo', IDCATEGORIA: 3, IDMARCA: 3, IDPROVEEDOR: 3 },
  { IDPRODUCTO: 4, NOMBREPRODUCTO: 'Teclado Logitech K380', PRECIOPRODUCTO: 24000, EXISTENCIASPRODUCTO: 8, NOMBRECATEGORIA: 'Perifericos', NOMBREMARCA: 'Logitech', NOMBREPROVEEDOR: 'Distribuidora Digital', IDCATEGORIA: 2, IDMARCA: 2, IDPROVEEDOR: 2 },
  { IDPRODUCTO: 5, NOMBREPRODUCTO: 'Monitor HP 24"', PRECIOPRODUCTO: 95000, EXISTENCIASPRODUCTO: 0, NOMBRECATEGORIA: 'Accesorios', NOMBREMARCA: 'HP', NOMBREPROVEEDOR: 'Tecno Import CR', IDCATEGORIA: 4, IDMARCA: 4, IDPROVEEDOR: 1 },
  { IDPRODUCTO: 6, NOMBREPRODUCTO: 'SSD Kingston 1TB', PRECIOPRODUCTO: 52000, EXISTENCIASPRODUCTO: 120, NOMBRECATEGORIA: 'Componentes', NOMBREMARCA: 'Kingston', NOMBREPROVEEDOR: 'Compu Mayoreo', IDCATEGORIA: 3, IDMARCA: 3, IDPROVEEDOR: 3 }
];
const clientes = [
  ['Ana Mora Rojas', '1-1234-5678', '8888-1111', 'ana.mora@correo.com', 4, 218500],
  ['Luis Perez Soto', '2-0456-0789', '8777-2222', 'luis.perez@correo.com', 2, 73000],
  ['Maria Vargas Leon', '1-0987-0654', '8666-3333', 'maria.vargas@correo.com', 7, 512000],
  ['Carlos Jimenez Mata', '3-0321-0987', '8555-4444', 'carlos.jimenez@correo.com', 1, 24000],
  ['Daniela Rojas Cruz', '1-1122-3344', '8444-5555', 'daniela.rojas@correo.com', 3, 96500],
  ['Jorge Solano Brenes', '4-0123-0456', '8333-6666', 'jorge.solano@correo.com', 5, 301000]
].map((c, i) => ({ IDCLIENTE: i + 1, NOMBRECOMPLETO: c[0], CEDULA: c[1], TELEFONO: c[2], CORREO: c[3], NOMBREPROVINCIA: 'San Jose', NOMBRECANTON: 'Puriscal', NOMBREDISTRITO: 'Santiago', CANTIDADVENTAS: c[4], TOTALCOMPRADO: c[5] }));
const empleados = [
  [1, '1-1111-1111', 'Cristian Ortiz Chavarria', 'Administrador', 'Sucursal Central', 'Activo'],
  [2, '1-2222-2222', 'Sofia Loaiza Cabalceta', 'Vendedor', 'Sucursal Central', 'Activo'],
  [3, '1-3333-3333', 'Naomy Chan Chacon', 'Tecnico', 'Sucursal Central', 'Activo'],
  [4, '1-4444-4444', 'Jenny Liang Jiang', 'Vendedor', 'Sucursal Puriscal', 'Inactivo']
].map(e => ({ IDEMPLEADO: e[0], CEDULA: e[1], NOMBRECOMPLETO: e[2], NOMBREROL: e[3], NOMBRESUCURSAL: e[4], ESTADOEMPLEADO: e[5], ID_SUCURSAL: e[4].includes('Central') ? 1 : 2 }));
const usuarios = [
  [1, 'admin@extremetech.demo', 'Admin123!', 1, 1, null],
  [2, 'vendedor@extremetech.demo', 'Vendedor123!', 2, 2, null],
  [3, 'tecnico@extremetech.demo', 'Tecnico123!', 4, 3, null],
  [4, 'cliente@extremetech.demo', 'Cliente123!', 3, null, 1]
].map(u => ({
  IDUSUARIO: u[0],
  CORREO: u[1],
  PASSWORD_HASH: bcrypt.hashSync(u[2], 10),
  IDROL: u[3],
  IDEMPLEADO: u[4],
  IDCLIENTE: u[5],
  ESTADO: 'Activo'
}));
const ventas = [[1042, 0, 1, 1, 73450], [1041, 1, 3, 2, 520000], [1040, 1, 2, 2, 45200], [1039, 2, 5, 2, 96500], [1038, 3, 4, 1, 24000], [1037, 4, 6, 2, 156000], [1036, 6, 1, 1, 650000], [1035, 8, 3, 2, 18500]]
  .map(v => ({ IDVENTA: v[0], FECHAVENTA: dia(v[1]), IDCLIENTE: v[2], NOMBRECLIENTE: clientes[v[2] - 1].NOMBRECOMPLETO, IDEMPLEADO: v[3], NOMBREEMPLEADO: empleados[v[3] - 1].NOMBRECOMPLETO, TOTALVENTA: v[4] }));
const detalle = [
  [1, 1042, 'Mouse Logitech G203', 2, 18500], [2, 1042, 'Memoria Kingston 16GB', 1, 28000],
  [3, 1041, 'Laptop Dell Inspiron', 1, 650000], [4, 1040, 'SSD Kingston 1TB', 1, 52000], [5, 1039, 'Mouse Logitech G203', 3, 18500],
  [6, 1038, 'Teclado Logitech K380', 1, 24000], [7, 1037, 'SSD Kingston 1TB', 3, 52000], [8, 1036, 'Laptop Dell Inspiron', 1, 650000]
].map(d => ({ IDDETALLE: d[0], IDVENTA: d[1], FECHAVENTA: ventas.find(v => v.IDVENTA === d[1]).FECHAVENTA, NOMBREPRODUCTO: d[2], CANTIDADDETALLE: d[3], PRECIOUNITARIO: d[4], TOTALPARCIAL: d[3] * d[4] }));
const devoluciones = [
  [1, 3, 1, 2, 'Falla de fabrica', 1, 'Aceptada'], [2, 5, 2, 4, 'Producto equivocado', 1, 'Pendiente'],
  [3, 10, 4, 3, 'No compatible', 1, 'Aceptada'], [4, 18, 3, 5, 'Dano por uso', 1, 'Rechazada']
].map(d => ({ IDDEVOLUCION: d[0], FECHADEVOLUCION: dia(d[1]), IDCLIENTE: d[2], NOMBRECLIENTE: clientes[d[2] - 1].NOMBRECOMPLETO, IDPRODUCTO: d[3], NOMBREPRODUCTO: productos[d[3] - 1].NOMBREPRODUCTO, MOTIVODEVOLUCION: d[4], CANTIDADDEVUELTA: d[5], ESTADODEVOLUCION: d[6] }));
const inicio = n => { const d = dia(n); d.setHours(0, 0, 0, 0); return d; };
const garantias = [
  [1, 1, 1, 7, 365, 'Vigente'], [2, 5, 2, 340, 365, 'Vigente'], [3, 6, 3, 400, 365, 'Expirada'], [4, 4, 5, 12, 365, 'Vigente'], [5, 2, 4, 90, 90, 'Anulada']
].map(g => ({ IDGARANTIA: g[0], IDCLIENTE: g[2], NOMBRECLIENTE: clientes[g[2] - 1].NOMBRECOMPLETO, IDPRODUCTO: g[1], NOMBREPRODUCTO: productos[g[1] - 1].NOMBREPRODUCTO, FECHAINICIOGARANTIA: inicio(g[3]), FECHAFINGARANTIA: new Date(inicio(g[3]).getTime() + g[4] * 864e5), ESTADOGARANTIA: g[5] }));
const servicios = [
  [31, 1, 1, 1, 'No enciende', 'Pendiente', 0], [32, 2, 2, 5, 'Lineas en pantalla', 'Pendiente', 0],
  [29, 4, 5, 4, 'Teclas sin respuesta', 'En reparacion', 15000], [30, 3, 4, 2, 'Clic defectuoso', 'En reparacion', 8000],
  [27, 6, 3, 6, 'Cambio de unidad', 'Finalizado', 12000]
].map(s => ({ IDSERVICIO: s[0], IDCLIENTE: s[2], IDPRODUCTO: s[3], NOMBRECLIENTE: clientes[s[2] - 1].NOMBRECOMPLETO.split(' ').slice(0, 2).join(' '), NOMBREPRODUCTO: productos[s[3] - 1].NOMBREPRODUCTO, FECHAINGRESO: dia(s[1]), DESCRIPCIONPROBLEMA: s[4], ESTADOSERVICIO: s[5], COSTOSERVICIO: s[6] }));
const nivel = n => (n === 0 ? 'AGOTADO' : n < 10 ? 'BAJO' : n < 30 ? 'MEDIO' : 'ALTO');

const vistas = {
  VW_PRODUCTOS_DETALLE: () => productos,
  VW_CLIENTES: () => clientes,
  VW_RESUMEN_CLIENTES: () => clientes,
  VW_EMPLEADOS: () => empleados,
  VW_VENTAS_REGISTRADAS: () => ventas,
  VW_DETALLE_VENTAS: () => detalle,
  VW_DEVOLUCIONES: () => devoluciones,
  VW_GARANTIAS_ACTIVAS: () => garantias,
  VW_SERVICIO_TECNICO: () => servicios,
  VW_STOCK_BAJO: () => productos.filter(p => p.EXISTENCIASPRODUCTO < 10).map(p => ({ IDPRODUCTO: p.IDPRODUCTO, NOMBREPRODUCTO: p.NOMBREPRODUCTO, EXISTENCIASPRODUCTO: p.EXISTENCIASPRODUCTO, NIVELSTOCK: nivel(p.EXISTENCIASPRODUCTO) })),
  VW_PRODUCTOS_PROVEEDOR: () => [1, 2, 3].map(i => { const ps = productos.filter(p => p.IDPROVEEDOR === i); return { IDPROVEEDOR: i, NOMBREPROVEEDOR: ps[0].NOMBREPROVEEDOR, CANTIDADPRODUCTOS: ps.length, VALORINVENTARIO: ps.reduce((s, p) => s + p.PRECIOPRODUCTO * p.EXISTENCIASPRODUCTO, 0) }; })
};
const cursores = {
  SP_BUSCAR_USUARIO_LOGIN: correo => usuarios
    .filter(u => u.CORREO.toLowerCase() === String(correo || '').trim().toLowerCase())
    .map(u => ({ ...u })),
  SP_CONSULTAR_CATEGORIA: () => [[1, 'Laptops'], [2, 'Perifericos'], [3, 'Componentes'], [4, 'Accesorios']].map(c => ({ IDCATEGORIA: c[0], NOMBRECATEGORIA: c[1] })),
  SP_CONSULTAR_MARCA: () => [[1, 'Dell'], [2, 'Logitech'], [3, 'Kingston'], [4, 'HP']].map(c => ({ IDMARCA: c[0], NOMBREMARCA: c[1] })),
  SP_CONSULTAR_PROVEEDOR: () => [[1, 'Tecno Import CR'], [2, 'Distribuidora Digital'], [3, 'Compu Mayoreo']].map(c => ({ IDPROVEEDOR: c[0], NOMBREPROVEEDOR: c[1] })),
  SP_CONSULTAR_SUCURSAL: () => [[1, 'Sucursal Central'], [2, 'Sucursal Puriscal']].map(c => ({ IDSUCURSAL: c[0], NOMBRESUCURSAL: c[1] })),
  SP_BUSCAR_PRODUCTO: id => productos.filter(p => p.IDPRODUCTO === Number(id)).map(p => ({ IDPRODUCTO: p.IDPRODUCTO, NOMBREPRODUCTO: p.NOMBREPRODUCTO, PRECIOPRODUCTO: p.PRECIOPRODUCTO, EXISTENCIASPRODUCTO: p.EXISTENCIASPRODUCTO, IDCATEGORIA: p.IDCATEGORIA, IDPROVEEDOR: p.IDPROVEEDOR, IDMARCA: p.IDMARCA })),
  SP_BUSCAR_SERVICIO_TECNICO: id => servicios.filter(s => s.IDSERVICIO === Number(id)),
  SP_BUSCAR_EMPLEADO: id => empleados.filter(e => e.IDEMPLEADO === Number(id))
};

function vista(nombre, binds = {}) {
  const f = vistas[nombre.toUpperCase()];
  if (!f) throw new Error(`Modo demo: la vista ${nombre} no tiene datos de ejemplo.`);
  let filas = f();
  if (nombre === 'VW_VENTAS_REGISTRADAS' && binds.idCliente !== undefined) {
    filas = filas.filter(v => v.IDCLIENTE === binds.idCliente);
  }
  if (binds.id !== undefined && filas[0] && 'IDVENTA' in filas[0]) filas = filas.filter(r => r.IDVENTA === Number(binds.id));
  return filas;
}
let contador = 100;
function llamarSP(nombre, args = []) {
  const n = nombre.toUpperCase();
  const salidas = args.filter(a => a && a.dir);
  const conCursor = salidas.some(a => a.type && String(a.type).length && a === args[args.length - 1] && n.startsWith('SP_') && cursores[n]);
  if (cursores[n]) { const entradas = args.filter(a => !(a && a.dir)); return [cursores[n](entradas[0])]; }
  const ent = args.filter(a => !(a && a.dir));
  // El demo guarda las ventas en memoria para poder probar el punto de venta
  if (n === 'SP_REGISTRAR_VENTA') {
    const id = Math.max(...ventas.map(v => v.IDVENTA)) + 1;
    ventas.push({ IDVENTA: id, FECHAVENTA: ent[0], IDCLIENTE: ent[1], NOMBRECLIENTE: clientes[ent[1] - 1].NOMBRECOMPLETO, IDEMPLEADO: ent[2], NOMBREEMPLEADO: empleados[ent[2] - 1].NOMBRECOMPLETO, TOTALVENTA: 0 });
    return [id];
  }
  if (n === 'SP_AGREGAR_DETALLE_VENTA') {
    const v = ventas.find(x => x.IDVENTA === ent[0]); const p = productos.find(x => x.IDPRODUCTO === ent[1]);
    if (p.EXISTENCIASPRODUCTO < ent[2]) throw new Error(`ORA-20103: Stock insuficiente para ${p.NOMBREPRODUCTO}`);
    p.EXISTENCIASPRODUCTO -= ent[2];
    detalle.push({ IDDETALLE: detalle.length + 1, IDVENTA: v.IDVENTA, FECHAVENTA: v.FECHAVENTA, NOMBREPRODUCTO: p.NOMBREPRODUCTO, CANTIDADDETALLE: ent[2], PRECIOUNITARIO: p.PRECIOPRODUCTO, TOTALPARCIAL: p.PRECIOPRODUCTO * ent[2] });
    const subtotalCentimos = detalle.filter(l => l.IDVENTA === v.IDVENTA)
      .reduce((total, l) => total + Math.round(l.TOTALPARCIAL * 100), 0);
    v.TOTALVENTA = (subtotalCentimos + calcularIvaCentimos(subtotalCentimos)) / 100;
    return [++contador];
  }
  console.log(`[demo] ${n}`, ent);
  return salidas.map(() => ++contador);
}
module.exports = { vista, llamarSP, nivel };

//Codigo verificado

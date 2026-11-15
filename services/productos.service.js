const { vista, llamarSP, cursor, OUT } = require('../config/db');

const nivelStock = n => (n <= 0 ? 'AGOTADO' : n < 10 ? 'BAJO' : n < 30 ? 'MEDIO' : 'ALTO'); // igual que FN_CLASIFICAR_STOCK

async function listar() {
  const filas = await vista('VW_PRODUCTOS_DETALLE', 'ORDER BY IDPRODUCTO');
  return filas.map(p => ({ ...p, NIVEL: nivelStock(p.EXISTENCIASPRODUCTO) }));
}
async function buscar(id) {
  const filas = await cursor('SP_BUSCAR_PRODUCTO', [Number(id)]);
  return filas[0] || null;
}
async function catalogos() {
  const [categorias, marcas, proveedores] = await Promise.all([
    cursor('SP_CONSULTAR_CATEGORIA'), cursor('SP_CONSULTAR_MARCA'), cursor('SP_CONSULTAR_PROVEEDOR')
  ]);
  return { categorias, marcas, proveedores };
}
async function insertar(d) {
  const [id] = await llamarSP('SP_INSERTAR_PRODUCTO', [d.nombre, Number(d.precio), Number(d.existencias),
    Number(d.categoria), Number(d.proveedor), Number(d.marca), OUT.NUM]);
  return id;
}
async function actualizar(id, d) {
  await llamarSP('SP_ACTUALIZAR_PRODUCTO', [Number(id), d.nombre, Number(d.precio), Number(d.existencias),
    Number(d.categoria), Number(d.proveedor), Number(d.marca)]);
}
async function eliminar(id) { await llamarSP('SP_ELIMINAR_PRODUCTO', [Number(id)]); }

module.exports = { nivelStock, listar, buscar, catalogos, insertar, actualizar, eliminar };

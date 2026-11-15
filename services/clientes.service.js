const { vista, llamarSP, OUT } = require('../config/db');
async function listar() {
  const [datos, resumen] = await Promise.all([vista('VW_CLIENTES', 'ORDER BY IDCLIENTE'), vista('VW_RESUMEN_CLIENTES')]);
  const mapa = new Map(resumen.map(r => [r.IDCLIENTE, r]));
  return datos.map(c => ({ ...c, CANTIDADVENTAS: (mapa.get(c.IDCLIENTE) || {}).CANTIDADVENTAS || 0, TOTALCOMPRADO: (mapa.get(c.IDCLIENTE) || {}).TOTALCOMPRADO || 0 }));
}
async function registrar(d) {
  const [id] = await llamarSP('SP_REGISTRAR_CLIENTE_COMPLETO', [d.cedula, d.nombre, d.apellido1, d.apellido2 || null,
    d.telefono, d.correo, d.provincia, d.canton, d.distrito, d.otrassenas || null, OUT.NUM]);
  return id;
}
async function eliminar(id) { await llamarSP('SP_ELIMINAR_CLIENTE', [Number(id)]); }
module.exports = { listar, registrar, eliminar };

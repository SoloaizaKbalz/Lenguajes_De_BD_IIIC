const { vista, llamarSP, OUT } = require('../config/db');
async function listar() { return vista('VW_GARANTIAS_ACTIVAS', 'ORDER BY IDGARANTIA DESC'); }
async function insertar(d) {
  const [id] = await llamarSP('SP_INSERTAR_GARANTIA', [Number(d.producto), Number(d.cliente),
    new Date(d.inicio + 'T00:00:00'), new Date(d.fin + 'T00:00:00'), 'Vigente', OUT.NUM]);
  return id;
}
async function eliminar(id) { await llamarSP('SP_ELIMINAR_GARANTIA', [Number(id)]); }
module.exports = { listar, insertar, eliminar };

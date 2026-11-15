const { vista, llamarSP, OUT } = require('../config/db');
async function listar() { return vista('VW_DEVOLUCIONES', 'ORDER BY IDDEVOLUCION DESC'); }
async function insertar(d) {
  const [id] = await llamarSP('SP_INSERTAR_DEVOLUCION', [Number(d.cliente), Number(d.producto), new Date(d.fecha + 'T00:00:00'),
    d.motivo, Number(d.cantidad), 'Pendiente', OUT.NUM]);
  return id;
}
// nuevoEstado: 'Aceptada' o 'Rechazada' (si se acepta, el procedimiento reintegra el stock)
async function resolver(id, nuevoEstado) { await llamarSP('SP_RESOLVER_DEVOLUCION', [Number(id), nuevoEstado]); }
module.exports = { listar, insertar, resolver };

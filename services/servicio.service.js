const { vista, llamarSP, cursor, OUT } = require('../config/db');
async function listar() { return vista('VW_SERVICIO_TECNICO', 'ORDER BY IDSERVICIO DESC'); }
async function insertar(d) {
  const [id] = await llamarSP('SP_INSERTAR_SERVICIO_TECNICO', [Number(d.cliente), Number(d.producto), new Date(),
    d.problema, 'Pendiente', 0, OUT.NUM]);
  return id;
}
// Pasa la orden a "En reparacion": se lee el registro y se actualiza con el nuevo estado
async function iniciarReparacion(id) {
  const [s] = await cursor('SP_BUSCAR_SERVICIO_TECNICO', [Number(id)]);
  if (!s) throw new Error('La orden de servicio no existe.');
  await llamarSP('SP_ACTUALIZAR_SERVICIO_TECNICO', [s.IDSERVICIO, s.IDCLIENTE, s.IDPRODUCTO, s.FECHAINGRESO,
    s.DESCRIPCIONPROBLEMA, 'En reparacion', s.COSTOSERVICIO]);
}
async function cerrar(id, costo) { await llamarSP('SP_CERRAR_SERVICIO_TECNICO', [Number(id), Number(costo)]); }
module.exports = { listar, insertar, iniciarReparacion, cerrar };

const { vista, llamarSP, cursor, OUT } = require('../config/db');
async function listar() { return vista('VW_EMPLEADOS', 'ORDER BY IDEMPLEADO'); }
async function sucursales() { return cursor('SP_CONSULTAR_SUCURSAL'); }
async function buscar(id) { return (await cursor('SP_BUSCAR_EMPLEADO', [Number(id)]))[0] || null; }
// La persona (cedula) debe existir previamente en EXT_PERSONAS_TB
async function insertar(d) { const [id] = await llamarSP('SP_INSERTAR_EMPLEADO', [d.cedula, d.estado, Number(d.sucursal), OUT.NUM]); return id; }
async function actualizar(id, d) { await llamarSP('SP_ACTUALIZAR_EMPLEADO', [Number(id), d.cedula, d.estado, Number(d.sucursal)]); }
async function eliminar(id) { await llamarSP('SP_ELIMINAR_EMPLEADO', [Number(id)]); }
module.exports = { listar, sucursales, buscar, insertar, actualizar, eliminar };

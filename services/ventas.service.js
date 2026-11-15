const { vista, llamarSP, usarConexion, OUT, DEMO } = require('../config/db');

async function historial() { return vista('VW_VENTAS_REGISTRADAS', 'ORDER BY IDVENTA DESC'); }
async function detalle(id) { return vista('VW_DETALLE_VENTAS', 'WHERE IDVENTA = :id ORDER BY IDDETALLE', { id: Number(id) }); }

// Registra la venta y sus lineas usando SOLO procedimientos almacenados.
// Los triggers de Oracle descuentan el stock y calculan el total de la venta.
async function registrar({ idCliente, idEmpleado, items }) {
  if (!idCliente) throw new Error('Seleccione un cliente.');
  if (!idEmpleado) throw new Error('Seleccione el empleado que registra la venta.');
  if (!Array.isArray(items) || items.length === 0) throw new Error('Agregue al menos un producto a la venta.');
  const lineas = items.map(i => ({ id: Number(i.id), cantidad: Number(i.cantidad) }));
  if (lineas.some(l => !Number.isInteger(l.cantidad) || l.cantidad <= 0)) throw new Error('Las cantidades deben ser enteros mayores a cero.');

  const hacer = async cn => {
    const [idVenta] = await llamarSP('SP_REGISTRAR_VENTA', [new Date(), Number(idCliente), Number(idEmpleado), OUT.NUM], cn);
    try {
      for (const l of lineas) await llamarSP('SP_AGREGAR_DETALLE_VENTA', [idVenta, l.id, l.cantidad, OUT.NUM], cn);
    } catch (err) {
      // Los procedimientos confirman (COMMIT) cada paso; si una linea falla, se elimina la venta incompleta.
      try { await llamarSP('SP_ELIMINAR_VENTA', [idVenta], cn); } catch (_) { /* se informa el error original */ }
      throw err;
    }
    return idVenta;
  };
  return DEMO ? hacer(null) : usarConexion(hacer);
}
module.exports = { historial, detalle, registrar };


const { vista, llamarSP, usarConexion, OUT, DEMO } = require('../config/db');

async function historial(idCliente) {
  if (idCliente === undefined) return vista('VW_VENTAS_REGISTRADAS', 'ORDER BY IDVENTA DESC');
  if (!Number.isSafeInteger(idCliente) || idCliente <= 0) return [];
  return vista('VW_VENTAS_REGISTRADAS', 'WHERE IDCLIENTE = :idCliente ORDER BY IDVENTA DESC', { idCliente });
}

async function detalle(id) {
  return vista(
    'VW_DETALLE_VENTAS',
    'WHERE IDVENTA = :id ORDER BY IDDETALLE',
    { id: Number(id) }
  );
}

async function registrar({ idCliente, idEmpleado, items }) {
  if (!Number.isInteger(Number(idCliente)) || Number(idCliente) <= 0) {
    throw new Error('Seleccione un cliente válido.');
  }

  if (!Number.isInteger(Number(idEmpleado)) || Number(idEmpleado) <= 0) {
    throw new Error('El empleado no es válido.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Agregue al menos un producto a la venta.');
  }

  const lineas = items.map(i => ({
    id: Number(i.id),
    cantidad: Number(i.cantidad)
  }));

  if (lineas.some(l =>
    !Number.isInteger(l.id) ||
    l.id <= 0 ||
    !Number.isInteger(l.cantidad) ||
    l.cantidad <= 0
  )) {
    throw new Error('Los productos y cantidades deben ser válidos.');
  }

  const hacer = async cn => {
    const [idVenta] = await llamarSP(
      'SP_REGISTRAR_VENTA',
      [new Date(), Number(idCliente), Number(idEmpleado), OUT.NUM],
      cn
    );

    try {
      for (const linea of lineas) {
        await llamarSP(
          'SP_AGREGAR_DETALLE_VENTA',
          [idVenta, linea.id, linea.cantidad, OUT.NUM],
          cn
        );
      }
    } catch (error) {
      if (cn) {
        try {
          // Los detalles anteriores ya quedaron confirmados en Oracle.
          await llamarSP('SP_REVERTIR_VENTA_INCOMPLETA', [idVenta], cn);
        } catch (errorReversion) {
          console.error('Falló la reversión de la venta', idVenta, { error, errorReversion });
          throw new Error(
            `No se pudo confirmar la reversión de la venta #${idVenta}. Revise el historial antes de volver a registrarla.`,
            { cause: errorReversion }
          );
        }
      }
      throw error;
    }

    return idVenta;
  };

  if (DEMO) {
    return hacer(null);
  }

  return usarConexion(hacer);
}

module.exports = {
  historial,
  detalle,
  registrar
};


const { vista, llamarSP, usarConexion, OUT, DEMO } = require('../config/db');

async function historial() {
  return vista('VW_VENTAS_REGISTRADAS', 'ORDER BY IDVENTA DESC');
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

    for (const linea of lineas) {
      await llamarSP(
        'SP_AGREGAR_DETALLE_VENTA',
        [idVenta, linea.id, linea.cantidad, OUT.NUM],
        cn
      );
    }

    return idVenta;
  };

  if (DEMO) {
    return hacer(null);
  }

  return usarConexion(async cn => {
    try {
      const idVenta = await hacer(cn);

      await cn.commit();

      return idVenta;
    } catch (error) {
      await cn.rollback();
      throw error;
    }
  });
}

module.exports = {
  historial,
  detalle,
  registrar
};

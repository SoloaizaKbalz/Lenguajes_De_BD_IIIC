const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const ventas = require('../services/ventas.service');
const productos = require('../services/productos.service');
const clientes = require('../services/clientes.service');
const empleados = require('../services/empleados.service');
const permitirRoles = require('./permitirRoles');
const { comercial, CLIENTE } = require('../config/roles');
const { TASA_IVA, calcularIvaCentimos } = require('../config/iva');

const permitirRegistro = permitirRoles(...comercial);

// Pantalla "Registrar venta" (punto de venta)
router.get('/nueva', permitirRegistro, seguro(async (req, res) => {
  const [prods, cls, emps] = await Promise.all([productos.listar(), clientes.listar(), empleados.listar()]);
  res.render('ventas/nueva', { productos: prods, clientes: cls, empleados: emps.filter(e => e.ESTADOEMPLEADO === 'Activo') });
}));


// La pantalla envia la venta en JSON y recibe el resultado en JSON

router.post('/', permitirRegistro, async (req, res) => {
  try {
    const usuario = res.locals.usuario;

    if (!usuario || !usuario.id) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tiene un empleado asociado para registrar ventas.'
      });
    }

    const datosVenta = {
      ...req.body,
      idEmpleado: Number(usuario.id)
    };

    const idVenta = await ventas.registrar(datosVenta);

    res.json({
      ok: true,
      idVenta,
      mensaje: `Venta #${idVenta} registrada correctamente`
    });

  } catch (e) {
    res.status(400).json({
      ok: false,
      mensaje: mensajeError(e)
    });
  }
});


const clienteDeConsulta = usuario => Number(usuario.idRol) === CLIENTE ? Number(usuario.idCliente) : undefined;

router.get('/', seguro(async (req, res) => {
  const idCliente = clienteDeConsulta(res.locals.usuario);
  if (Number.isNaN(idCliente)) {
    return volver(res, '/login', { error: 'Vuelva a iniciar sesión para consultar sus ventas.' });
  }
  if (idCliente === 0) {
    return res.status(403).render('error', {
      titulo: 'Historial no disponible',
      mensaje: 'La sesión no tiene un cliente asociado.'
    });
  }
  res.render('ventas/historial', { ventas: await ventas.historial(idCliente) });
}));
router.get('/:id', seguro(async (req, res) => {
  const cab = (await ventas.historial(clienteDeConsulta(res.locals.usuario))).find(v => String(v.IDVENTA) === req.params.id);
  if (!cab) return volver(res, '/ventas', { error: 'La venta no existe.' });
  const lineas = await ventas.detalle(cab.IDVENTA);
  const subtotalCentimos = lineas.reduce((suma, linea) => suma + Math.round(Number(linea.TOTALPARCIAL) * 100), 0);
  const totalCentimos = Math.round(Number(cab.TOTALVENTA) * 100);
  const ivaCentimos = totalCentimos - subtotalCentimos;
  const ivaEsperado = calcularIvaCentimos(subtotalCentimos);
  const iva = ivaCentimos === 0 || ivaCentimos === ivaEsperado ? ivaCentimos / 100 : null;
  const etiquetaIva = ivaCentimos === ivaEsperado ? `IVA ${TASA_IVA} %` : 'IVA';
  res.render('ventas/detalle', { v: cab, lineas, subtotal: subtotalCentimos / 100, iva, etiquetaIva });
}, '/ventas'));
module.exports = router;

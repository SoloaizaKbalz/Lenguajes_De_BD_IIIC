const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const ventas = require('../services/ventas.service');
const productos = require('../services/productos.service');
const clientes = require('../services/clientes.service');
const empleados = require('../services/empleados.service');

function permitirVentas(req, res, next) {
  const usuario = res.locals.usuario;

  if (!usuario) {
    return res.redirect('/login');
  }

  if (![1, 2].includes(Number(usuario.idRol))) {
    return res.status(403).json({
      ok: false,
      mensaje: 'No tiene permisos para registrar ventas.'
    });
  }

  next();
}

router.use(permitirVentas);


// Pantalla "Registrar venta" (punto de venta)
router.get('/nueva', seguro(async (req, res) => {
  const [prods, cls, emps] = await Promise.all([productos.listar(), clientes.listar(), empleados.listar()]);
  res.render('ventas/nueva', { productos: prods, clientes: cls, empleados: emps.filter(e => e.ESTADOEMPLEADO === 'Activo') });
}));


// La pantalla envia la venta en JSON y recibe el resultado en JSON

router.post('/', async (req, res) => {
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


router.get('/', seguro(async (req, res) => res.render('ventas/historial', { ventas: await ventas.historial() })));
router.get('/:id', seguro(async (req, res) => {
  const lineas = await ventas.detalle(req.params.id);
  const cab = (await ventas.historial()).find(v => String(v.IDVENTA) === req.params.id);
  if (!cab) return volver(res, '/ventas', { error: 'La venta no existe.' });
  res.render('ventas/detalle', { v: cab, lineas });
}, '/ventas'));
module.exports = router;

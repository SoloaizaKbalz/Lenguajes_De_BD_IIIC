const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const { comercial, reparaciones, puedeCrearOrdenServicio, puedeActualizarOrdenServicio } = require('../config/roles');
const permitirRoles = require('./permitirRoles');
const s = require('../services/servicio.service');
const clientes = require('../services/clientes.service');
const productos = require('../services/productos.service');
const datos = async () => ({ clientes: await clientes.listar(), productos: await productos.listar() });
const permitirCrear = permitirRoles(...comercial);
const permitirActualizar = permitirRoles(...reparaciones);

router.get('/', seguro(async (req, res) => {
  const { usuario } = res.locals;
  res.render('servicio/index', {
    ordenes: await s.listar(),
    puedeCrear: puedeCrearOrdenServicio(usuario),
    puedeActualizar: puedeActualizarOrdenServicio(usuario)
  });
}));
router.get('/nueva', permitirCrear, seguro(async (req, res) => res.render('servicio/form', { o: null, ...(await datos()), error: null })));
router.post('/nueva', permitirCrear, async (req, res) => {
  try { const id = await s.insertar(req.body); volver(res, '/servicio-tecnico', { ok: `Orden registrada con N.º ${id}` }); }
  catch (e) { res.render('servicio/form', { o: req.body, ...(await datos()), error: mensajeError(e) }); }
});
router.post('/reparar/:id', permitirActualizar, seguro(async (req, res) => { await s.iniciarReparacion(req.params.id); volver(res, '/servicio-tecnico', { ok: 'La orden pasó a reparación' }); }, '/servicio-tecnico'));
router.post('/cerrar/:id', permitirActualizar, seguro(async (req, res) => { await s.cerrar(req.params.id, req.body.costo || 0); volver(res, '/servicio-tecnico', { ok: 'Orden finalizada' }); }, '/servicio-tecnico'));
module.exports = router;

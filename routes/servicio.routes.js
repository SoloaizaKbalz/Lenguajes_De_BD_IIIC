const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const s = require('../services/servicio.service');
const clientes = require('../services/clientes.service');
const productos = require('../services/productos.service');
const datos = async () => ({ clientes: await clientes.listar(), productos: await productos.listar() });
router.get('/', seguro(async (req, res) => res.render('servicio/index', { ordenes: await s.listar() })));
router.get('/nueva', seguro(async (req, res) => res.render('servicio/form', { o: null, ...(await datos()), error: null })));
router.post('/nueva', async (req, res) => {
  try { const id = await s.insertar(req.body); volver(res, '/servicio-tecnico', { ok: `Orden registrada con N.º ${id}` }); }
  catch (e) { res.render('servicio/form', { o: req.body, ...(await datos()), error: mensajeError(e) }); }
});
router.post('/reparar/:id', seguro(async (req, res) => { await s.iniciarReparacion(req.params.id); volver(res, '/servicio-tecnico', { ok: 'La orden pasó a reparación' }); }, '/servicio-tecnico'));
router.post('/cerrar/:id', seguro(async (req, res) => { await s.cerrar(req.params.id, req.body.costo || 0); volver(res, '/servicio-tecnico', { ok: 'Orden finalizada' }); }, '/servicio-tecnico'));
module.exports = router;

const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const s = require('../services/devoluciones.service');
const clientes = require('../services/clientes.service');
const productos = require('../services/productos.service');
const datos = async () => ({ clientes: await clientes.listar(), productos: await productos.listar() });
router.get('/', seguro(async (req, res) => res.render('devoluciones/index', { devoluciones: await s.listar() })));
router.get('/nueva', seguro(async (req, res) => res.render('devoluciones/form', { d: null, ...(await datos()), error: null })));
router.post('/nueva', async (req, res) => {
  try { const id = await s.insertar(req.body); volver(res, '/devoluciones', { ok: `Devolución registrada con N.º ${id}` }); }
  catch (e) { res.render('devoluciones/form', { d: req.body, ...(await datos()), error: mensajeError(e) }); }
});
router.post('/resolver/:id', seguro(async (req, res) => {
  const estado = req.body.estado === 'Aceptada' ? 'Aceptada' : 'Rechazada';
  await s.resolver(req.params.id, estado);
  volver(res, '/devoluciones', { ok: `Devolución ${estado === 'Aceptada' ? 'aceptada' : 'rechazada'}` });
}, '/devoluciones'));
module.exports = router;

const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const s = require('../services/garantias.service');
const clientes = require('../services/clientes.service');
const productos = require('../services/productos.service');
const datos = async () => ({ clientes: await clientes.listar(), productos: await productos.listar() });
router.get('/', seguro(async (req, res) => res.render('garantias/index', { garantias: await s.listar() })));
router.get('/nueva', seguro(async (req, res) => res.render('garantias/form', { g: null, ...(await datos()), error: null })));
router.post('/nueva', async (req, res) => {
  try { const id = await s.insertar(req.body); volver(res, '/garantias', { ok: `Garantía registrada con N.º ${id}` }); }
  catch (e) { res.render('garantias/form', { g: req.body, ...(await datos()), error: mensajeError(e) }); }
});
router.post('/borrar/:id', seguro(async (req, res) => { await s.eliminar(req.params.id); volver(res, '/garantias', { ok: 'Garantía eliminada' }); }, '/garantias'));
module.exports = router;

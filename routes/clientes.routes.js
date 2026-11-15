const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const s = require('../services/clientes.service');
router.get('/', seguro(async (req, res) => res.render('clientes/index', { clientes: await s.listar() })));
router.get('/nuevo', (req, res) => res.render('clientes/form', { c: null, error: null }));
router.post('/nuevo', async (req, res) => {
  try { const id = await s.registrar(req.body); volver(res, '/clientes', { ok: `Cliente registrado con ID ${id}` }); }
  catch (e) { res.render('clientes/form', { c: req.body, error: mensajeError(e) }); }
});
router.post('/borrar/:id', seguro(async (req, res) => { await s.eliminar(req.params.id); volver(res, '/clientes', { ok: 'Cliente eliminado' }); }, '/clientes'));
module.exports = router;

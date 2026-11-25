
const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const s = require('../services/productos.service');
const permitirRoles = require('./permitirRoles');
const { administracion } = require('../config/roles');

router.get('/', seguro(async (req, res) => {
  const productos = await s.listar();
  res.render('productos/index', { productos });
}));

router.use(permitirRoles(...administracion));

router.get('/nuevo', seguro(async (req, res) => {
  res.render('productos/form', {
    p: null,
    cat: await s.catalogos(),
    accion: '/productos/nuevo',
    titulo: 'Nuevo producto',
    error: null
  });
}));

router.post('/nuevo', async (req, res) => {
  try {
    const id = await s.insertar(req.body);
    volver(res, '/productos', { ok: `Producto creado con ID ${id}` });
  } catch (e) {
    res.render('productos/form', {
      p: req.body,
      cat: await s.catalogos(),
      accion: '/productos/nuevo',
      titulo: 'Nuevo producto',
      error: mensajeError(e)
    });
  }
});

router.get('/editar/:id', seguro(async (req, res) => {
  const p = await s.buscar(req.params.id);
  if (!p) return volver(res, '/productos', { error: 'El producto no existe.' });

  res.render('productos/form', {
    p,
    cat: await s.catalogos(),
    accion: `/productos/editar/${req.params.id}`,
    titulo: 'Editar producto',
    error: null
  });
}, '/productos'));

router.post('/editar/:id', async (req, res) => {
  try {
    await s.actualizar(req.params.id, req.body);
    volver(res, '/productos', { ok: 'Producto actualizado correctamente' });
  } catch (e) {
    res.render('productos/form', {
      p: { ...req.body, IDPRODUCTO: req.params.id },
      cat: await s.catalogos(),
      accion: `/productos/editar/${req.params.id}`,
      titulo: 'Editar producto',
      error: mensajeError(e)
    });
  }
});

router.post('/borrar/:id', seguro(async (req, res) => {
  await s.eliminar(req.params.id);
  volver(res, '/productos', { ok: 'Producto eliminado' });
}, '/productos'));

module.exports = router;

const router = require('express').Router();
const { volver, seguro, mensajeError } = require('./util');
const s = require('../services/empleados.service');
function soloAdministrador(req, res, next) {
  const usuario = res.locals.usuario;

  if (!usuario) {
    return res.redirect('/login');
  }

  if (Number(usuario.idRol) !== 1) {
    return res.status(403).render('error', {
      titulo: 'Acceso denegado',
      mensaje: 'Esta sección es exclusiva para administradores.'
    });
  }

  next();
}

router.use(soloAdministrador);
router.get('/', seguro(async (req, res) => res.render('empleados/index', { empleados: await s.listar() })));
router.get('/nuevo', seguro(async (req, res) => res.render('empleados/form', { e: null, sucursales: await s.sucursales(), accion: '/empleados/nuevo', titulo: 'Nuevo empleado', error: null })));
router.post('/nuevo', async (req, res) => {
  try { const id = await s.insertar(req.body); volver(res, '/empleados', { ok: `Empleado creado con ID ${id}` }); }
  catch (e) { res.render('empleados/form', { e: req.body, sucursales: await s.sucursales(), accion: '/empleados/nuevo', titulo: 'Nuevo empleado', error: mensajeError(e) }); }
});
router.get('/editar/:id', seguro(async (req, res) => {
  const e = await s.buscar(req.params.id);
  if (!e) return volver(res, '/empleados', { error: 'El empleado no existe.' });
  res.render('empleados/form', { e: { cedula: e.CEDULA, estado: e.ESTADOEMPLEADO, sucursal: e.ID_SUCURSAL }, sucursales: await s.sucursales(), accion: `/empleados/editar/${req.params.id}`, titulo: 'Editar empleado', error: null });
}, '/empleados'));
router.post('/editar/:id', async (req, res) => {
  try { await s.actualizar(req.params.id, req.body); volver(res, '/empleados', { ok: 'Empleado actualizado correctamente' }); }
  catch (e) { res.render('empleados/form', { e: req.body, sucursales: await s.sucursales(), accion: `/empleados/editar/${req.params.id}`, titulo: 'Editar empleado', error: mensajeError(e) }); }
});
module.exports = router;

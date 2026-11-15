const router = require('express').Router();
const { vista } = require('../config/db');
const { mensajeError } = require('./util');

router.get('/login', (req, res) => res.render('login', { error: req.query.error || null }));

// Ingreso con la cedula de un empleado ACTIVO (consulta VW_EMPLEADOS)
router.post('/login', async (req, res) => {
  try {
    const cedula = String(req.body.cedula || '').trim();
    const empleados = await vista('VW_EMPLEADOS');
    const e = empleados.find(x => x.CEDULA === cedula);
    if (!e) return res.render('login', { error: 'No existe un empleado con esa cédula.' });
    if (e.ESTADOEMPLEADO !== 'Activo') return res.render('login', { error: 'El empleado está inactivo.' });
    const dato = Buffer.from(JSON.stringify({ id: e.IDEMPLEADO, nombre: e.NOMBRECOMPLETO, rol: e.NOMBREROL })).toString('base64');
    res.setHeader('Set-Cookie', `et_usuario=${encodeURIComponent(dato)}; Path=/; HttpOnly; SameSite=Lax`);
    res.redirect('/panel');
  } catch (err) { res.render('login', { error: mensajeError(err) }); }
});
router.get('/salir', (req, res) => {
  res.setHeader('Set-Cookie', 'et_usuario=; Path=/; Max-Age=0');
  res.redirect('/login');
});
module.exports = router;

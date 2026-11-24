const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { cursor } = require('../config/db');

router.get('/login', (req, res) => {
  res.render('login', { error: req.query.error || null });
});

router.post('/login', async (req, res) => {
  try {
    const correo = String(req.body.correo || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!correo || !password) {
      return res.status(400).render('login', {
        error: 'Ingrese su correo y contraseña.'
      });
    }

    const usuarios = await cursor('SP_BUSCAR_USUARIO_LOGIN', [correo]);
    const usuario = usuarios[0];

    const valido = usuario &&
      await bcrypt.compare(password, usuario.PASSWORD_HASH);

    if (!valido || usuario.ESTADO !== 'Activo') {
      return res.status(401).render('login', {
        error: 'Correo o contraseña incorrectos, o cuenta inactiva.'
      });
    }

    const token = jwt.sign(
      {
        idUsuario: usuario.IDUSUARIO,
        idEmpleado: usuario.IDEMPLEADO,
        idRol: usuario.IDROL,
        correo: usuario.CORREO
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.cookie('et_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
      path: '/'
    });

    return res.redirect('/panel');
  } catch (error) {
    console.error('Error de autenticación:', error.message);

    return res.status(500).render('login', {
      error: 'No se pudo iniciar sesión. Inténtelo nuevamente.'
    });
  }
});

router.get('/salir', (req, res) => {
  res.clearCookie('et_token', { path: '/' });
  res.clearCookie('et_usuario', { path: '/' });
  res.redirect('/login');
});

module.exports = router;
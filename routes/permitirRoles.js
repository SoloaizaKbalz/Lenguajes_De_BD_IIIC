function permitirRoles(...roles) {
  return (req, res, next) => {
    const { usuario } = res.locals;
    if (!usuario) return res.redirect('/login');
    if (roles.includes(Number(usuario.idRol))) return next();

    const mensaje = 'Su rol no tiene permisos para acceder a esta página.';
    if (req.is('application/json')) return res.status(403).json({ ok: false, mensaje });
    return res.status(403).render('error', { titulo: 'Acceso denegado', mensaje });
  };
}

module.exports = permitirRoles;

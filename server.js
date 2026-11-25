const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('node:path');
const { iniciarOracle, DEMO, mensajeError } = require('./config/db');
const { nivelStock } = require('./services/productos.service');
const { accesos, nombreRol, puedeVer, puedeEditarProductos, puedeEditarGarantias, puedeRegistrarVenta } = require('./config/roles');
const permitirRoles = require('./routes/permitirRoles');
const { TASA_IVA } = require('./config/iva');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Ayudas disponibles en todas las vistas ----------
const miles = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
app.locals.colones = n => '₡' + miles(n);
app.locals.colonesVenta = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format;
app.locals.tasaIva = TASA_IVA;
app.locals.fecha = f => {
  if (!f) return '';
  const d = new Date(f);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
app.locals.fechaInput = f => (f ? new Date(f).toISOString().slice(0, 10) : '');
app.locals.nivelStock = nivelStock;
app.locals.demo = DEMO;
Object.assign(app.locals, { puedeVer, puedeEditarProductos, puedeEditarGarantias, puedeRegistrarVenta });

// ---------- Sesion sencilla por cookie (sin dependencias extra) ----------

function leerUsuario(req) {
  const cookies = req.headers.cookie || '';
  const tokenCookie = cookies
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('et_token='));

  if (!tokenCookie || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const token = decodeURIComponent(
      tokenCookie.slice('et_token='.length)
    );

    const datos = jwt.verify(token, process.env.JWT_SECRET);

    return {
      id: datos.idEmpleado,
      idUsuario: datos.idUsuario,
      idCliente: datos.idCliente,
      idRol: datos.idRol,
      rol: nombreRol(datos.idRol),
      nombre: datos.correo,
      correo: datos.correo
    };
  } catch (error) {
    return null;
  }
}

app.use((req, res, next) => {
  res.locals.usuario = leerUsuario(req);
  res.locals.ok = req.query.ok || null;
  res.locals.error = req.query.error || null;
  res.locals.ruta = req.path;
  const libre = req.path === '/login' || req.path === '/salir';
  if (!res.locals.usuario && !libre) return res.redirect('/login');
  next();
});

app.use('/', require('./routes/auth.routes'));
app.use('/panel', permitirRoles(...accesos.panel), require('./routes/panel.routes'));
app.use('/productos', permitirRoles(...accesos.productos), require('./routes/productos.routes'));
app.use('/ventas', permitirRoles(...accesos.ventas), require('./routes/ventas.routes'));
app.use('/clientes', permitirRoles(...accesos.clientes), require('./routes/clientes.routes'));
app.use('/empleados', require('./routes/empleados.routes'));
app.use('/devoluciones', permitirRoles(...accesos.devoluciones), require('./routes/devoluciones.routes'));
app.use('/garantias', permitirRoles(...accesos.garantias), require('./routes/garantias.routes'));
app.use('/servicio-tecnico', permitirRoles(...accesos.servicio), require('./routes/servicio.routes'));
app.use('/reportes', permitirRoles(...accesos.reportes), require('./routes/reportes.routes'));

app.get('/', (req, res) => {
  if (puedeVer(res.locals.usuario, 'panel')) return res.redirect('/panel');
  if (puedeVer(res.locals.usuario, 'ventas')) return res.redirect('/ventas');
  return res.render('sesion');
});
app.use((req, res) => res.status(404).render('error', { titulo: 'Página no encontrada', mensaje: 'La dirección que busca no existe.' }));
app.use((err, req, res, next) => res.status(500).render('error', { titulo: 'Ocurrió un error', mensaje: mensajeError(err) }));

try {
  iniciarOracle();
  app.listen(PORT, () => console.log(`ExtremeTech Manager en http://localhost:${PORT}`));
} catch (error) {
  console.error('No se pudo iniciar la aplicacion:', error.message);
  process.exit(1);
}

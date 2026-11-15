const express = require('express');
const path = require('node:path');
const { iniciarOracle, DEMO, mensajeError } = require('./config/db');
const { nivelStock } = require('./services/productos.service');

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
app.locals.fecha = f => {
  if (!f) return '';
  const d = new Date(f);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
app.locals.fechaInput = f => (f ? new Date(f).toISOString().slice(0, 10) : '');
app.locals.nivelStock = nivelStock;
app.locals.demo = DEMO;

// ---------- Sesion sencilla por cookie (sin dependencias extra) ----------
function leerUsuario(req) {
  const m = (req.headers.cookie || '').match(/et_usuario=([^;]+)/);
  if (!m) return null;
  try { return JSON.parse(Buffer.from(decodeURIComponent(m[1]), 'base64').toString('utf8')); } catch { return null; }
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
app.use('/panel', require('./routes/panel.routes'));
app.use('/productos', require('./routes/productos.routes'));
app.use('/ventas', require('./routes/ventas.routes'));
app.use('/clientes', require('./routes/clientes.routes'));
app.use('/empleados', require('./routes/empleados.routes'));
app.use('/devoluciones', require('./routes/devoluciones.routes'));
app.use('/garantias', require('./routes/garantias.routes'));
app.use('/servicio-tecnico', require('./routes/servicio.routes'));
app.use('/reportes', require('./routes/reportes.routes'));

app.get('/', (req, res) => res.redirect('/panel'));
app.use((req, res) => res.status(404).render('error', { titulo: 'Página no encontrada', mensaje: 'La dirección que busca no existe.' }));
app.use((err, req, res, next) => res.status(500).render('error', { titulo: 'Ocurrió un error', mensaje: mensajeError(err) }));

try {
  iniciarOracle();
  app.listen(PORT, () => console.log(`ExtremeTech Manager en http://localhost:${PORT}`));
} catch (error) {
  console.error('No se pudo iniciar la aplicacion:', error.message);
  process.exit(1);
}

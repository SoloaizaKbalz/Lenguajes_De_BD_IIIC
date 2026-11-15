const { mensajeError } = require('../config/db');
// Redirige con un mensaje de exito (ok) o de error en la direccion
const volver = (res, ruta, { ok, error } = {}) => {
  const q = ok ? `ok=${encodeURIComponent(ok)}` : error ? `error=${encodeURIComponent(error)}` : '';
  res.redirect(q ? `${ruta}?${q}` : ruta);
};
// Envuelve un manejador async para convertir errores de Oracle en mensajes
const seguro = (fn, rutaError) => async (req, res, next) => {
  try { await fn(req, res, next); }
  catch (e) { rutaError ? volver(res, typeof rutaError === 'function' ? rutaError(req) : rutaError, { error: mensajeError(e) }) : next(e); }
};
module.exports = { volver, seguro, mensajeError };

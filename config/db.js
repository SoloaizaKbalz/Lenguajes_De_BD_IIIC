// Conexion a Oracle Autonomous Database con Wallet (modo Thin, sin Instant Client).
// Misma base que la guia del curso (conexion.js) + funciones para llamar procedimientos almacenados.
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const oracledb = require('oracledb');
const demo = require('./demo');

const DEMO = process.env.MODO_DEMO === 'true';
const ESQUEMA = process.env.ORACLE_SCHEMA || 'EXTREMETECH_PROD';
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; // las filas llegan como objetos { COLUMNA: valor }

function iniciarOracle() {
  if (DEMO) { console.log('MODO DEMO: datos de ejemplo, sin conexion a Oracle.'); return; }
  const campos = ['ORACLE_USER', 'ORACLE_PASSWORD', 'ORACLE_CONNECT_STRING',
    'ORACLE_WALLET_LOCATION', 'ORACLE_WALLET_PASSWORD'];
  for (const campo of campos) {
    if (!process.env[campo]) throw new Error(`Falta ${campo} en .env`);
  }
  const wallet = path.resolve(process.env.ORACLE_WALLET_LOCATION);
  for (const nombre of ['tnsnames.ora', 'ewallet.pem']) {
    if (!fs.existsSync(path.join(wallet, nombre)))
      throw new Error(`No existe ${nombre} en ${wallet}. Para Thin mTLS necesita ese archivo.`);
  }
  if (!oracledb.thin) throw new Error('El controlador esta en modo Thick; no use initOracleClient.');
  console.log('Modo Thin activo:', oracledb.thin);
}

async function conexion() {
  return oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
    configDir: process.env.ORACLE_WALLET_LOCATION,
    walletLocation: process.env.ORACLE_WALLET_LOCATION,
    walletPassword: process.env.ORACLE_WALLET_PASSWORD
  });
}

// Abre una conexion, ejecuta fn(cn) y siempre la cierra.
async function usarConexion(fn) {
  const cn = await conexion();
  try { return await fn(cn); } finally { await cn.close(); }
}

// Lectura de VISTAS del esquema (solo lectura). Ej.: vista('VW_CLIENTES')
async function vista(nombre, where = '', binds = {}) {
  if (DEMO) return demo.vista(nombre, binds);
  return usarConexion(async cn => {
    const r = await cn.execute(`SELECT * FROM ${ESQUEMA}.${nombre} ${where}`, binds);
    return r.rows;
  });
}

// Marca de parametro de salida para llamarSP
const OUT = { NUM: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } };

// Ejecuta un procedimiento almacenado: llamarSP('SP_INSERTAR_MARCA', ['Dell', OUT.NUM])
// Devuelve el arreglo de valores de los parametros OUT (en orden). Si el OUT es CURSOR devuelve las filas.
async function llamarSP(nombre, args = [], cn = null) {
  if (DEMO) return demo.llamarSP(nombre, args);
  const run = async c => {
    const binds = {}; const marcas = [];
    args.forEach((a, i) => { binds['p' + i] = a; if (a && a.dir) marcas.push(i); });
    const lista = args.map((_, i) => ':p' + i).join(', ');
    const r = await c.execute(`BEGIN ${ESQUEMA}.${nombre}(${lista}); END;`, binds);
    const salida = [];
    for (const i of marcas) {
      const v = r.outBinds['p' + i];
      if (v && typeof v.getRows === 'function') { salida.push(await v.getRows(1000)); await v.close(); }
      else salida.push(v);
    }
    return salida;
  };
  return cn ? run(cn) : usarConexion(run);
}

// Procedimientos SP_CONSULTAR_* / SP_BUSCAR_* que devuelven un SYS_REFCURSOR
async function cursor(nombre, args = []) {
  const [filas] = await llamarSP(nombre, [...args, OUT.CURSOR]);
  return filas;
}

// Traduce errores de Oracle (incluidos los RAISE_APPLICATION_ERROR del Avance 2) a texto para el usuario
function mensajeError(err) {
  const m = String(err && err.message || err);
  const propio = m.match(/ORA-20\d{3}:\s*([^\n]+)/);
  if (propio) return propio[1].trim();
  if (/ORA-00001/.test(m)) return 'Ya existe un registro con ese valor (dato duplicado).';
  if (/ORA-02292/.test(m)) return 'No se puede eliminar: tiene registros relacionados.';
  if (/ORA-02291/.test(m)) return 'Alguno de los datos relacionados no existe.';
  if (/ORA-01031/.test(m)) return 'Su usuario no tiene permiso para esta operacion.';
  if (/ORA-00942/.test(m)) return 'El objeto consultado no existe o no esta autorizado.';
  if (/ORA-01017/.test(m)) return 'Usuario o clave de Oracle invalidos. Revise el archivo .env.';
  return m.split('\n')[0];
}

module.exports = { DEMO, ESQUEMA, iniciarOracle, conexion, usarConexion, vista, llamarSP, cursor, OUT, mensajeError, oracledb };

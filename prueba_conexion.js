// Prueba de conexion: debe aprobarse antes de levantar la aplicacion (npm run test:db)
const { iniciarOracle, conexion } = require('./config/db');
(async () => {
  let cn;
  try {
    iniciarOracle();
    cn = await conexion();
    const r = await cn.execute('SELECT USER AS USUARIO, SYSDATE AS FECHA_SERVIDOR FROM DUAL');
    console.table(r.rows);
    console.log('Conexion exitosa con Oracle Cloud.');
  } catch (e) {
    console.error('Error de conexion:', e.message);
    process.exitCode = 1;
  } finally {
    if (cn) await cn.close();
  }
})();

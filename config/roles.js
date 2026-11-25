const ADMINISTRADOR = 1;
const VENDEDOR = 2;
const CLIENTE = 3;
const TECNICO = 4;

const nombres = {
  [ADMINISTRADOR]: 'Administrador',
  [VENDEDOR]: 'Vendedor',
  [CLIENTE]: 'Cliente',
  [TECNICO]: 'Técnico'
};

const administracion = [ADMINISTRADOR];
const comercial = [ADMINISTRADOR, VENDEDOR];
const personal = [ADMINISTRADOR, VENDEDOR, TECNICO];
const ventas = [...comercial, CLIENTE];
const reparaciones = [ADMINISTRADOR, TECNICO];
const accesos = {
  panel: personal,
  productos: personal,
  ventas,
  clientes: comercial,
  empleados: administracion,
  devoluciones: comercial,
  garantias: personal,
  servicio: personal,
  reportes: administracion
};

const nombreRol = id => nombres[Number(id)] ?? '';
const puedeVer = (usuario, seccion) => accesos[seccion].includes(Number(usuario?.idRol));
const puedeEditarProductos = usuario => administracion.includes(Number(usuario?.idRol));
const puedeEditarGarantias = usuario => comercial.includes(Number(usuario?.idRol));
const puedeCrearOrdenServicio = usuario => comercial.includes(Number(usuario?.idRol));
const puedeActualizarOrdenServicio = usuario => reparaciones.includes(Number(usuario?.idRol));
const puedeRegistrarVenta = usuario => comercial.includes(Number(usuario?.idRol));

module.exports = {
  accesos, administracion, comercial, reparaciones, CLIENTE,
  nombreRol, puedeVer, puedeEditarProductos, puedeEditarGarantias,
  puedeCrearOrdenServicio, puedeActualizarOrdenServicio, puedeRegistrarVenta
};

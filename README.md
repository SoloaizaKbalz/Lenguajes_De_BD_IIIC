# ExtremeTech Manager – Front-end (Node.js + Express + EJS + Oracle Cloud)

Proyecto del curso SC-504 · Grupo 2 · Universidad Fidélitas.
Implementa las 10 pantallas del diseño de Figma y se conecta a Oracle Autonomous Database con **Wallet (modo Thin)**, igual que el proyecto del profesor. Todas las operaciones de escritura usan **procedimientos almacenados**; las consultas usan las **vistas** de `EXTREMETECH_PROD`.

## 1. Requisitos
- Node.js 18 o superior (https://nodejs.org) y Visual Studio Code.
- La carpeta del **Wallet** descomprimida (la que trae `tnsnames.ora` y `ewallet.pem`).

## 2. Cómo correrlo en Visual Studio Code
1. `Archivo > Abrir carpeta…` y elija la carpeta `extremetech-app`.
2. Abra la terminal integrada: `Terminal > Nueva terminal` (Ctrl + Ñ).
3. Instale dependencias: `npm install`
4. Copie `.env.example` a `.env` (clic derecho > Copiar / Pegar y renombre) y complete:
   - `ORACLE_USER=USR_FINAL` y su `ORACLE_PASSWORD`
   - `ORACLE_SCHEMA=EXTREMETECH_PROD`
   - `ORACLE_CONNECT_STRING` = alias de `tnsnames.ora` (ej. `extremetech_high`)
   - `ORACLE_WALLET_LOCATION` = ruta de la carpeta del wallet (en Windows use `/` o `\\`)
   - `ORACLE_WALLET_PASSWORD` = contraseña del wallet
5. Pruebe la conexión: `npm run test:db`
6. Inicie la app: `npm start` (o `npm run dev` para reinicio automático) y abra http://localhost:3000
7. Inicio de sesión: cédula de un empleado **Activo** (vista `VW_EMPLEADOS`).

### Modo demo (sin Oracle)
Sirve para ver el diseño y probar el flujo sin conexión. En la terminal de VS Code:
- PowerShell: `$env:MODO_DEMO="true"; npm start`
- CMD: `set MODO_DEMO=true && npm start`
- Mac/Linux/Git Bash: `MODO_DEMO=true npm start`

Cédula de prueba en demo: `1-1111-1111`. Los datos demo viven en memoria y se pierden al reiniciar.

## 3. Estructura
```
server.js            Express, sesión por cookie y rutas
config/db.js         Conexión Oracle (wallet), llamarSP(), vista(), cursor()
config/demo.js       Datos de ejemplo para MODO_DEMO
services/*.js        Lógica de cada módulo (llaman SP y vistas)
routes/*.routes.js   Rutas Express por módulo
views/               Pantallas EJS (partials/head y foot = menú lateral)
public/css, js, img  Estilos con los colores del Figma, POS, filtros, logo
```

## 4. Pantallas ↔ Figma
Inicio de sesión · Panel · Productos (lista y formulario) · Registrar venta (POS) · Historial/Detalle de ventas · Clientes · Empleados · Devoluciones · Garantías · Servicio técnico (tablero) · Reportes.

## 5. Notas importantes
- Los procedimientos hacen `COMMIT` internamente, por eso una venta se registra en pasos (cabecera + líneas). Si una línea falla, la app elimina la venta incompleta con `SP_ELIMINAR_VENTA`.
- Los nombres de estados (Pendiente, En reparacion, Finalizado, Vigente, Aceptada…) deben coincidir con los `CHECK` de sus tablas; si su BD usa otros, cámbielos en `services/*.service.js` y en las vistas.
- Nunca suba `.env` ni el wallet a GitHub (ya están en `.gitignore`).

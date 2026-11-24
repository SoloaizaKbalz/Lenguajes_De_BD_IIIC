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
   - `ORACLE_USER=USR_FINAL` y su `ORACLE_PASSWORD` entre comillas, especialmente si contiene `#`.
   - `ORACLE_SCHEMA=EXTREMETECH_PROD`
   - `ORACLE_CONNECT_STRING` = alias de `tnsnames.ora` (ej. `extremetech_high`)
   - `ORACLE_WALLET_LOCATION` = ruta de la carpeta del wallet (en Windows use `/` o `\\`)
   - `ORACLE_WALLET_PASSWORD` = contraseña del wallet
   - `JWT_SECRET` = secreto local para firmar las sesiones. Genere uno con `node -p "require('node:crypto').randomBytes(32).toString('hex')"`.
5. Pruebe la conexión: `npm run test:db`
6. Inicie la app con `npm start` y abra http://localhost:3000/login, o use el puerto configurado en `PORT`.
7. Inicie sesión con el correo y la contraseña de una cuenta activa de ExtremeTech.

### Modo demo (sin Oracle)
Configura los datos de ejemplo para el entorno de demostración. En la terminal de VS Code:
- PowerShell: `$env:MODO_DEMO="true"; npm start`
- CMD: `set MODO_DEMO=true && npm start`
- Mac/Linux/Git Bash: `MODO_DEMO=true npm start`

Los datos demo viven en memoria y se pierden al reiniciar.

Puede iniciar sesión con cualquiera de estas cuentas:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@extremetech.demo` | `Admin123!` |
| Vendedor | `vendedor@extremetech.demo` | `Vendedor123!` |
| Técnico | `tecnico@extremetech.demo` | `Tecnico123!` |
| Cliente | `cliente@extremetech.demo` | `Cliente123!` |

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
- El complemento [extremetech_login_y_reversion.sql](database/extremetech_login_y_reversion.sql) se ejecuta como `EXTREMETECH_PROD` después de crear las tablas base y el usuario Oracle `USR_FINAL`. Agrega el procedimiento de login y el de reversión, con sus permisos de ejecución. Las cuentas de la aplicación se crean por separado con contraseñas propias.
- Oracle confirma cada línea de venta al insertarla. Si una línea falla, la app llama a `SP_REVERTIR_VENTA_INCOMPLETA` para borrar los detalles confirmados, reponer el stock mediante el trigger y borrar la cabecera.
- Los nombres de estados (Pendiente, En reparacion, Finalizado, Vigente, Aceptada…) deben coincidir con los `CHECK` de sus tablas; si su BD usa otros, cámbielos en `services/*.service.js` y en las vistas.
- Nunca suba `.env` ni el wallet a GitHub (ya están en `.gitignore`).

-- Ejecutar como EXTREMETECH_PROD.
-- Requiere las tablas base y EXT_USUARIOS_TB.
-- No contiene contrasenas ni hashes reales.

WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

BEGIN
    IF USER <> 'EXTREMETECH_PROD' THEN
        RAISE_APPLICATION_ERROR(
            -20991,
            'Ejecute como EXTREMETECH_PROD'
        );
    END IF;
END;
/

-- 1. Registrar los cuatro roles si no existen.

MERGE INTO EXT_ROL_TB r
USING (
    SELECT 1 IDROL, 'Administrador' NOMBREROL FROM DUAL
    UNION ALL
    SELECT 2, 'Vendedor' FROM DUAL
    UNION ALL
    SELECT 3, 'Cliente' FROM DUAL
    UNION ALL
    SELECT 4, 'Tecnico' FROM DUAL
) datos
ON (r.IDROL = datos.IDROL)
WHEN NOT MATCHED THEN
    INSERT (IDROL, NOMBREROL)
    VALUES (datos.IDROL, datos.NOMBREROL);

COMMIT;

-- 2. Procedimiento local para crear usuarios de prueba.
-- Los hashes deben generarse mediante bcrypt.
-- No guardar hashes ni contrasenas en GitHub.
-- Verificar previamente los IDs de empleados y clientes.

DECLARE
    PROCEDURE crear_usuario (
        p_correo VARCHAR2,
        p_hash VARCHAR2,
        p_rol NUMBER,
        p_empleado NUMBER,
        p_cliente NUMBER
    )
    IS
        v_existe NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_existe
        FROM EXT_USUARIOS_TB
        WHERE LOWER(CORREO) = LOWER(p_correo);

        IF v_existe = 0 THEN
            IF p_hash IS NULL OR LENGTH(p_hash) <> 60
               OR SUBSTR(p_hash, 1, 4)
                  NOT IN ('$2a$', '$2b$') THEN
                RAISE_APPLICATION_ERROR(
                    -20993,
                    'Se requiere un hash bcrypt valido'
                );
            END IF;

            INSERT INTO EXT_USUARIOS_TB (
                CORREO,
                PASSWORD_HASH,
                IDROL,
                IDEMPLEADO,
                IDCLIENTE,
                ESTADO
            )
            VALUES (
                p_correo,
                p_hash,
                p_rol,
                p_empleado,
                p_cliente,
                'Activo'
            );
        END IF;
    END;

BEGIN
    -- Sustituir NULL por hashes bcrypt generados localmente
    -- cuando sea necesario crear usuarios nuevos.

    crear_usuario(
        'admin.pruebas@example.com',
        NULL, 1, 1, NULL
    );

    crear_usuario(
        'vendedor.pruebas@example.com',
        NULL, 2, 2, NULL
    );

    crear_usuario(
        'cliente.pruebas@example.com',
        NULL, 3, NULL, 1
    );

    crear_usuario(
        'tecnico.pruebas@example.com',
        NULL, 4, 4, NULL
    );

    COMMIT;
END;
/

-- 3. Verificar los roles.

SELECT IDROL, NOMBREROL
FROM EXT_ROL_TB
ORDER BY IDROL;

-- 4. Verificar los usuarios sin exponer hashes.

SELECT IDUSUARIO,
       CORREO,
       IDROL,
       IDEMPLEADO,
       IDCLIENTE,
       ESTADO
FROM EXT_USUARIOS_TB
ORDER BY IDUSUARIO;
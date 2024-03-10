CREATE DATABASE IF NOT EXISTS Base_Inventario;

CREATE TABLE IF NOT EXISTS Products(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    tipo_unidad VARCHAR(255),
    precio BIGINT(20)
);

CREATE TABLE IF NOT EXISTS Inventario (
    id  INT AUTO_INCREMENT PRIMARY KEY,
    Mes VARCHAR(100),
    Cartera BIGINT, 
    Mercancia BIGINT,
    PorPagar BIGINT,
    PorRecoger BIGINT,
    Efectivo BIGINT,
    UtilidadAnterior BIGINT,
    Utilidad BIGINT
);

CREATE TABLE IF NOT EXISTS Products_inventario (
    id  INT AUTO_INCREMENT PRIMARY KEY,
    id_product INT,
    id_mes INT,
    NombreP VARCHAR(255),
    Tipo_unidad VARCHAR(20),
    Precio BIGINT,
    Cantidad INT,
    Total BIGINT,
    FOREIGN KEY (id_product) REFERENCES Products(id),
    FOREIGN KEY (id_mes) REFERENCES Inventario(id)  ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'trabajador') NOT NULL
);



INSERT IGNORE INTO Usuarios (nombre_usuario, contrasena, rol) VALUES
('admin', 'admin12', 'administrador'),
('trabajador', '2024', 'trabajador');


CREATE INDEX idx_id_product ON Products_inventario (id_product);
CREATE INDEX idx_id_mes ON Products_inventario (id_mes);
CREATE INDEX idx_id_inventario ON Inventario (id);




-- Codigo para crear usuario remoto(celular del dueño del negocio)

-- -- Crear el usuario 'android' con contraseña 'usuarioandroid'
-- CREATE USER 'android'@'%' IDENTIFIED BY 'usuarioandroid';

-- -- Otorgar privilegios CRUD en la base de datos 'Gamadb' al usuario 'android'
-- GRANT SELECT, INSERT, UPDATE, DELETE ON Gamadb.* TO 'android'@'%';

-- -- Actualizar los privilegios
-- FLUSH PRIVILEGES;

-- ejemplo de configuracion en celular:

-- export const config = {
--   host: 'Esta ip deberia ser tu port local', 
--   user: 'usuario',
--   password: 'usuarioandroid',
--   database: 'Base_Inventario'  
-- }
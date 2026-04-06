-- ============================================================
--  QuizSloth DB - DDL + Datos de prueba
--  Evidencia 1: Estructura de la base de datos
-- ============================================================

CREATE DATABASE IF NOT EXISTS quizzsloth_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE quizzsloth_db;

-- ------------------------------------------------------------
-- 1. Usuarios (Profesores y Alumnos)
--    Los invitados son puntuales y no se persisten en BD.
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)  NOT NULL,
    email           VARCHAR(100)  UNIQUE NOT NULL,
    password        VARCHAR(255),                          -- Hash bcrypt
    rol             ENUM('profesor', 'alumno') NOT NULL,
    odoo_id         INT           NULL,                    -- Sincronización con Odoo (Evidencia 2)
    fecha_registro  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. Cursos
-- ------------------------------------------------------------
CREATE TABLE cursos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_profesor INT,
    FOREIGN KEY (id_profesor) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 3. Categorías
-- ------------------------------------------------------------
CREATE TABLE categorias (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 4. Histórico de Documentos
-- ------------------------------------------------------------
CREATE TABLE documentos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo      VARCHAR(255) NOT NULL,
    ruta_almacenamiento VARCHAR(500) NOT NULL,
    fecha_subida        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    id_usuario          INT,
    id_curso            INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)  ON DELETE SET NULL,
    FOREIGN KEY (id_curso)   REFERENCES cursos(id)    ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 5. Quizzes
-- ------------------------------------------------------------
CREATE TABLE quizzes (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    titulo         VARCHAR(200) NOT NULL,
    id_documento   INT,
    id_categoria   INT,
    dificultad     ENUM('facil', 'normal', 'dificil', 'extremo') DEFAULT 'normal',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_documento) REFERENCES documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 6. Preguntas
-- ------------------------------------------------------------
CREATE TABLE preguntas (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    id_quiz           INT,
    enunciado         TEXT   NOT NULL,
    opcion_a          VARCHAR(255) NOT NULL,
    opcion_b          VARCHAR(255) NOT NULL,
    opcion_c          VARCHAR(255) NOT NULL,
    opcion_d          VARCHAR(255) NOT NULL,
    respuesta_correcta CHAR(1) NOT NULL,                  -- 'A', 'B', 'C' o 'D'
    dificultad        ENUM('facil', 'normal', 'dificil', 'extremo') DEFAULT 'normal',
    FOREIGN KEY (id_quiz) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 7. Calificaciones
-- ------------------------------------------------------------
CREATE TABLE calificaciones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT,
    id_quiz          INT,
    puntuacion       DECIMAL(5,2) NOT NULL,
    fecha_completado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)  ON DELETE SET NULL,
    FOREIGN KEY (id_quiz)    REFERENCES quizzes(id)   ON DELETE SET NULL
);


-- ============================================================
--  DATOS DE PRUEBA
-- ============================================================

-- Categorías
INSERT INTO categorias (nombre) VALUES
    ('Programación'),
    ('Bases de Datos'),
    ('Redes'),
    ('Sistemas Operativos');

-- Usuarios  (passwords: hash ficticio para pruebas)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Ana García',    'ana.garcia@quizzsloth.com',    '$2a$10$hashedPassword1', 'profesor'),
    ('Luis Martínez', 'luis.martinez@quizzsloth.com', '$2a$10$hashedPassword2', 'profesor'),
    ('Carlos López',  'carlos.lopez@quizzsloth.com',  '$2a$10$hashedPassword3', 'alumno'),
    ('Marta Sánchez', 'marta.sanchez@quizzsloth.com', '$2a$10$hashedPassword4', 'alumno'),
    ('Pedro Ruiz',    'pedro.ruiz@quizzsloth.com',    '$2a$10$hashedPassword5', 'alumno');

-- Cursos
INSERT INTO cursos (nombre, descripcion, id_profesor) VALUES
    ('Programación en Java',    'Curso completo de Java desde cero hasta POO avanzada.', 1),
    ('Bases de Datos MySQL',    'Diseño, creación y consulta de bases de datos relacionales.', 2),
    ('Redes y Comunicaciones',  'Fundamentos de redes, protocolos TCP/IP y seguridad.', 1);

-- Documentos
INSERT INTO documentos (nombre_archivo, ruta_almacenamiento, id_usuario, id_curso) VALUES
    ('tema1_java_poo.pdf',         '/uploads/cursos/1/tema1_java_poo.pdf',         1, 1),
    ('tema2_java_colecciones.pdf', '/uploads/cursos/1/tema2_java_colecciones.pdf', 1, 1),
    ('tema1_sql_ddl.pdf',          '/uploads/cursos/2/tema1_sql_ddl.pdf',          2, 2),
    ('tema1_redes_protocolos.pdf', '/uploads/cursos/3/tema1_redes_protocolos.pdf', 1, 3);

-- Quizzes
INSERT INTO quizzes (titulo, id_documento, id_categoria, dificultad) VALUES
    ('Quiz POO en Java',           1, 1, 'normal'),
    ('Quiz Colecciones Java',      2, 1, 'dificil'),
    ('Quiz DDL y Tipos de Datos',  3, 2, 'facil'),
    ('Quiz Protocolos de Red',     4, 3, 'extremo');

-- Preguntas (4 por quiz de ejemplo)
INSERT INTO preguntas (id_quiz, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad) VALUES
    -- Quiz 1: POO en Java
    (1, '¿Qué es la herencia en POO?',
        'Copiar código de otra clase',
        'Mecanismo por el que una clase adquiere atributos y métodos de otra',
        'Crear objetos de forma dinámica',
        'Definir métodos abstractos',
        'B', 'normal'),
    (1, '¿Cuál es la palabra clave para heredar en Java?',
        'implements', 'inherits', 'extends', 'super',
        'C', 'facil'),
    (1, '¿Qué es el polimorfismo?',
        'Tener varios constructores',
        'La capacidad de un objeto de tomar muchas formas',
        'Ocultar atributos con private',
        'Crear interfaces',
        'B', 'normal'),
    (1, '¿Cuál de estas NO es un pilar de la POO?',
        'Herencia', 'Encapsulamiento', 'Compilación', 'Polimorfismo',
        'C', 'facil'),

    -- Quiz 2: Colecciones Java
    (2, '¿Qué interfaz implementa ArrayList?',
        'Map', 'Set', 'List', 'Queue',
        'C', 'normal'),
    (2, '¿Cuál colección NO permite duplicados?',
        'ArrayList', 'LinkedList', 'HashSet', 'Vector',
        'C', 'normal'),
    (2, '¿Qué estructura usa HashMap internamente?',
        'Árbol binario', 'Array de listas enlazadas', 'Pila', 'Cola circular',
        'B', 'dificil'),
    (2, '¿Qué método elimina todos los elementos de una colección?',
        'remove()', 'delete()', 'clear()', 'flush()',
        'C', 'facil'),

    -- Quiz 3: DDL y Tipos de Datos
    (3, '¿Qué sentencia se usa para crear una tabla en SQL?',
        'MAKE TABLE', 'NEW TABLE', 'CREATE TABLE', 'ADD TABLE',
        'C', 'facil'),
    (3, '¿Qué tipo de dato usarías para almacenar texto largo?',
        'VARCHAR(10)', 'INT', 'TEXT', 'BOOLEAN',
        'C', 'facil'),
    (3, '¿Qué restricción impide valores nulos en una columna?',
        'UNIQUE', 'NOT NULL', 'DEFAULT', 'CHECK',
        'B', 'normal'),
    (3, '¿Qué hace ON DELETE CASCADE?',
        'Borra solo el registro padre',
        'Impide el borrado si hay hijos',
        'Borra automáticamente los registros hijos al borrar el padre',
        'Pone NULL en los hijos',
        'C', 'normal'),

    -- Quiz 4: Protocolos de Red
    (4, '¿En qué capa del modelo OSI opera TCP?',
        'Capa de Red', 'Capa de Transporte', 'Capa de Sesión', 'Capa Física',
        'B', 'normal'),
    (4, '¿Cuál es el puerto por defecto de HTTPS?',
        '80', '21', '443', '8080',
        'C', 'facil'),
    (4, '¿Qué protocolo resuelve nombres de dominio a IPs?',
        'DHCP', 'FTP', 'DNS', 'SMTP',
        'C', 'normal'),
    (4, '¿Qué significa el flag SYN en el handshake TCP?',
        'Sincronización para iniciar conexión',
        'Señal de fin de transmisión',
        'Confirmación de recepción',
        'Solicitud de retransmisión',
        'A', 'extremo');

-- Calificaciones de ejemplo
INSERT INTO calificaciones (id_usuario, id_quiz, puntuacion) VALUES
    (3, 1, 75.00),
    (3, 3, 100.00),
    (4, 1, 50.00),
    (4, 2, 87.50),
    (5, 3, 62.50),
    (5, 4, 25.00);
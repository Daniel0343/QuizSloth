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
-- 3. Matrículas (alumno ↔ curso, many-to-many)
-- ------------------------------------------------------------
CREATE TABLE curso_alumno (
    id_curso  INT NOT NULL,
    id_alumno INT NOT NULL,
    PRIMARY KEY (id_curso, id_alumno),
    FOREIGN KEY (id_curso)  REFERENCES cursos(id)   ON DELETE CASCADE,
    FOREIGN KEY (id_alumno) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. Categorías
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
    id_creador     INT,
    id_categoria   INT,
    dificultad     ENUM('facil', 'normal', 'dificil', 'extremo') DEFAULT 'normal',
    es_plantilla   TINYINT(1) NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_documento) REFERENCES documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (id_creador)   REFERENCES usuarios(id)   ON DELETE SET NULL,
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

-- Usuarios
INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Administrador', 'administrador@gmail.com', '123456', 'profesor');


-- ------------------------------------------------------------
-- 9. Apuntes
-- ------------------------------------------------------------
CREATE TABLE apuntes (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    titulo         VARCHAR(300) NOT NULL,
    contenido_json LONGTEXT,
    id_usuario     INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 10. Colecciones
-- ------------------------------------------------------------
CREATE TABLE colecciones (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 11. Colección ↔ Quizzes (many-to-many)
-- ------------------------------------------------------------
CREATE TABLE coleccion_quizzes (
    coleccion_id INT NOT NULL,
    quiz_id      INT NOT NULL,
    PRIMARY KEY (coleccion_id, quiz_id),
    FOREIGN KEY (coleccion_id) REFERENCES colecciones(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id)      REFERENCES quizzes(id)     ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 12. Colección ↔ Apuntes (many-to-many)
-- ------------------------------------------------------------
CREATE TABLE coleccion_apuntes (
    coleccion_id INT NOT NULL,
    apunte_id    INT NOT NULL,
    PRIMARY KEY (coleccion_id, apunte_id),
    FOREIGN KEY (coleccion_id) REFERENCES colecciones(id) ON DELETE CASCADE,
    FOREIGN KEY (apunte_id)    REFERENCES apuntes(id)     ON DELETE CASCADE
);

-- Calificaciones de ejemplo
INSERT INTO calificaciones (id_usuario, id_quiz, puntuacion) VALUES
    (3, 1, 75.00),
    (3, 3, 100.00),
    (4, 1, 50.00),
    (4, 2, 87.50),
    (5, 3, 62.50),
    (5, 4, 25.00);
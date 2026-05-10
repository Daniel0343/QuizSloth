SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
--  QuizSloth DB - DDL + Datos de prueba
-- ============================================================
CREATE DATABASE IF NOT EXISTS quizzsloth_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE quizzsloth_db;

-- ------------------------------------------------------------
-- 1. Usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)  NOT NULL,
    email           VARCHAR(100)  UNIQUE NOT NULL,
    password        VARCHAR(255),
    rol             ENUM('profesor', 'alumno') NOT NULL,
    odoo_id         INT           NULL,
    fecha_registro  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. Cursos
-- ------------------------------------------------------------
CREATE TABLE cursos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    descripcion TEXT,
    color       VARCHAR(20)  DEFAULT '#24833D',
    id_profesor INT,
    FOREIGN KEY (id_profesor) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 3. Matrículas (alumno ↔ curso)
-- ------------------------------------------------------------
CREATE TABLE curso_alumnos (
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
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    creado_por_email VARCHAR(100) NULL
);

-- ------------------------------------------------------------
-- 5. Documentos
-- ------------------------------------------------------------
CREATE TABLE documentos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo      VARCHAR(255) NOT NULL,
    ruta_almacenamiento VARCHAR(500) NOT NULL,
    fecha_subida        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    id_usuario          INT,
    id_curso            INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (id_curso)   REFERENCES cursos(id)   ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 6. Quizzes
-- ------------------------------------------------------------
CREATE TABLE quizzes (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    titulo         VARCHAR(200) NOT NULL,
    color          VARCHAR(20)  NULL,
    borrador       TINYINT(1)   NOT NULL DEFAULT 0,
    id_documento   INT,
    id_creador     INT,
    id_categoria   INT,
    dificultad     ENUM('facil', 'normal', 'dificil', 'extremo') DEFAULT 'normal',
    es_plantilla   TINYINT(1)   NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_documento) REFERENCES documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (id_creador)   REFERENCES usuarios(id)   ON DELETE SET NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 7. Preguntas
-- ------------------------------------------------------------
CREATE TABLE preguntas (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    id_quiz            INT,
    enunciado          TEXT         NOT NULL,
    opcion_a           VARCHAR(255) NOT NULL,
    opcion_b           VARCHAR(255) NOT NULL,
    opcion_c           VARCHAR(255) NOT NULL,
    opcion_d           VARCHAR(255) NOT NULL,
    respuesta_correcta CHAR(1)      NOT NULL,
    dificultad         ENUM('facil', 'normal', 'dificil', 'extremo') DEFAULT 'normal',
    orden              INT          DEFAULT 0,
    peso               DECIMAL(5,2) DEFAULT 1.00,
    segundos           INT          DEFAULT 30,
    FOREIGN KEY (id_quiz) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 8. Calificaciones
-- ------------------------------------------------------------
CREATE TABLE calificaciones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT,
    id_quiz          INT,
    puntuacion       DECIMAL(5,2) NOT NULL,
    fecha_completado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (id_quiz)    REFERENCES quizzes(id)  ON DELETE SET NULL
);

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

CREATE TABLE coleccion_quizzes (
    coleccion_id INT NOT NULL,
    quiz_id      INT NOT NULL,
    PRIMARY KEY (coleccion_id, quiz_id),
    FOREIGN KEY (coleccion_id) REFERENCES colecciones(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id)      REFERENCES quizzes(id)     ON DELETE CASCADE
);

CREATE TABLE coleccion_apuntes (
    coleccion_id INT NOT NULL,
    apunte_id    INT NOT NULL,
    PRIMARY KEY (coleccion_id, apunte_id),
    FOREIGN KEY (coleccion_id) REFERENCES colecciones(id) ON DELETE CASCADE,
    FOREIGN KEY (apunte_id)    REFERENCES apuntes(id)     ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 11. Secciones y elementos de curso
-- ------------------------------------------------------------
CREATE TABLE secciones_curso (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    titulo   VARCHAR(200) NOT NULL,
    orden    INT DEFAULT 0,
    id_curso INT,
    FOREIGN KEY (id_curso) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE elementos_curso (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tipo        ENUM('TEXTO','ENLACE','PDF','QUIZ','APUNTE') NOT NULL,
    titulo      VARCHAR(300),
    contenido   TEXT,
    orden       INT DEFAULT 0,
    id_seccion  INT,
    id_quiz     INT NULL,
    id_apunte   INT NULL,
    FOREIGN KEY (id_seccion) REFERENCES secciones_curso(id) ON DELETE CASCADE,
    FOREIGN KEY (id_quiz)    REFERENCES quizzes(id)         ON DELETE SET NULL,
    FOREIGN KEY (id_apunte)  REFERENCES apuntes(id)         ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 12. Plantillas de quizzes prediseñados
-- ------------------------------------------------------------
CREATE TABLE plantillas (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    titulo       VARCHAR(200) NOT NULL,
    id_categoria INT,
    dificultad   ENUM('facil', 'normal', 'dificil', 'extremo') DEFAULT 'normal',
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE preguntas_plantilla (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    id_plantilla       INT,
    enunciado          TEXT         NOT NULL,
    opcion_a           VARCHAR(255) NOT NULL,
    opcion_b           VARCHAR(255) NOT NULL,
    opcion_c           VARCHAR(255) NOT NULL,
    opcion_d           VARCHAR(255) NOT NULL,
    respuesta_correcta CHAR(1)      NOT NULL,
    dificultad         ENUM('facil', 'normal', 'dificil', 'extremo') DEFAULT 'normal',
    orden              INT          DEFAULT 0,
    peso               DECIMAL(5,2) DEFAULT 1.00,
    segundos           INT          DEFAULT 30,
    FOREIGN KEY (id_plantilla) REFERENCES plantillas(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 13. Salas (partidas en tiempo real)
-- ------------------------------------------------------------
CREATE TABLE salas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    codigo      VARCHAR(10)  UNIQUE NOT NULL,
    estado      ENUM('esperando','en_curso','finalizada') DEFAULT 'esperando',
    id_quiz     INT,
    id_host     INT,
    creada_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_quiz)  REFERENCES quizzes(id)   ON DELETE SET NULL,
    FOREIGN KEY (id_host)  REFERENCES usuarios(id)  ON DELETE SET NULL
);

CREATE TABLE sala_participantes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    id_sala      INT,
    id_usuario   INT NULL,
    nombre       VARCHAR(100),
    puntuacion   INT DEFAULT 0,
    FOREIGN KEY (id_sala)    REFERENCES salas(id)    ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);


-- ============================================================
--  DATOS DE PRUEBA
-- ============================================================

-- Categorías
INSERT INTO categorias (nombre) VALUES
    ('Programación'),
    ('Bases de Datos'),
    ('Redes'),
    ('Sistemas Operativos'),
    ('Matemáticas'),
    ('Historia'),
    ('Lengua'),
    ('Biología');

-- Usuarios de prueba
INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Profesor Prueba', 'profesor@gmail.com', '123456', 'profesor');

-- Clase del profesor de prueba (id_profesor = 1)
INSERT INTO cursos (nombre, descripcion, color, id_profesor) VALUES
    ('Programación', 'Clase de Programación', '#24833D', 1);

-- Quizzes del profesor de prueba (borrador = 0 para que sean visibles)
INSERT INTO quizzes (titulo, id_creador, id_categoria, dificultad, es_plantilla, borrador) VALUES
    ('Programación Básica',  1, 1, 'normal', 0, 0),
    ('Introducción a SQL',   1, 2, 'normal', 0, 0),
    ('Fundamentos de Redes', 1, 3, 'facil',  0, 0);

-- Preguntas del quiz 1: Programación Básica
INSERT INTO preguntas (id_quiz, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad) VALUES
(1, '¿Qué es una variable?',                        'Un bucle',                                'Un espacio de memoria con nombre',     'Una función',         'Un tipo de dato fijo',    'B', 'facil'),
(1, '¿Qué significa POO?',                          'Proceso de Optimización de Operaciones',  'Programación Orientada a Objetos',     'Protocolo Online',    'Procesamiento Ordenado',  'B', 'facil'),
(1, '¿Qué hace el operador módulo (%)?',            'Multiplica dos números',                  'Divide dos números',                   'Devuelve el resto',   'Devuelve el cociente',    'C', 'facil'),
(1, '¿Qué es la recursividad?',                     'Un tipo de bucle for',                    'Una función que se llama a sí misma',  'Una variable global', 'Un operador lógico',      'B', 'normal'),
(1, '¿Cuál es la complejidad de búsqueda binaria?', 'O(n)',                                    'O(n²)',                                'O(log n)',            'O(1)',                    'C', 'dificil');

-- Preguntas del quiz 2: Introducción a SQL
INSERT INTO preguntas (id_quiz, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad) VALUES
(2, '¿Qué significa SQL?',               'System Query Language',      'Structured Query Language',               'Simple Query Logic',       'Sequential Query List',    'B', 'facil'),
(2, '¿Qué hace la sentencia SELECT?',    'Borra registros',            'Inserta datos',                           'Recupera datos',           'Crea una tabla',           'C', 'facil'),
(2, '¿Qué es una clave primaria?',       'Un campo que se repite',     'Identificador único de cada fila',        'Una contraseña',           'Un índice secundario',     'B', 'facil'),
(2, '¿Para qué sirve el JOIN?',          'Eliminar tablas duplicadas', 'Combinar filas de varias tablas',         'Ordenar resultados',       'Filtrar columnas',         'B', 'normal'),
(2, '¿Qué es la normalización?',         'Hacer copias de seguridad',  'Organizar datos y eliminar redundancias', 'Cifrar los datos',         'Aumentar el rendimiento',  'B', 'normal');

-- Preguntas del quiz 3: Fundamentos de Redes
INSERT INTO preguntas (id_quiz, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad) VALUES
(3, '¿Qué es una dirección IP?',                   'Un nombre de dominio',    'Un identificador único de dispositivo en red', 'Un protocolo de red',  'Un tipo de cable',            'B', 'facil'),
(3, '¿Qué significa DNS?',                         'Dynamic Network System',  'Domain Name System',                           'Data Network Service', 'Direct Node Sync',            'B', 'facil'),
(3, '¿Cuántas capas tiene el modelo OSI?',         '4',                       '5',                                            '6',                    '7',                           'D', 'normal'),
(3, '¿Qué protocolo se usa para navegar por web?', 'FTP',                     'SMTP',                                         'HTTP',                 'SSH',                         'C', 'facil'),
(3, '¿Qué es una subred?',                         'Un tipo de servidor',     'Una red dentro de otra red mayor',             'Un cable de red',      'Un protocolo de seguridad',   'B', 'normal');


-- ============================================================
--  PLANTILLAS PREDISEÑADAS
-- ============================================================

SET @cat_prog   = (SELECT id FROM categorias WHERE nombre = 'Programación'   LIMIT 1);
SET @cat_bbdd   = (SELECT id FROM categorias WHERE nombre = 'Bases de Datos' LIMIT 1);
SET @cat_mat    = (SELECT id FROM categorias WHERE nombre = 'Matemáticas'    LIMIT 1);
SET @cat_hist   = (SELECT id FROM categorias WHERE nombre = 'Historia'       LIMIT 1);
SET @cat_lengua = (SELECT id FROM categorias WHERE nombre = 'Lengua'         LIMIT 1);
SET @cat_bio    = (SELECT id FROM categorias WHERE nombre = 'Biología'       LIMIT 1);

INSERT INTO plantillas (titulo, id_categoria, dificultad) VALUES
    ('Programación - Fundamentos',        @cat_prog,   'normal'),
    ('Bases de Datos - SQL Esencial',      @cat_bbdd,   'normal'),
    ('Matemáticas - Álgebra y Aritmética', @cat_mat,    'normal'),
    ('Historia - Edad Contemporánea',      @cat_hist,   'normal'),
    ('Lengua Española - Gramática',        @cat_lengua, 'normal'),
    ('Biología - Célula y Genética',       @cat_bio,    'normal');

SET @p_prog   = (SELECT id FROM plantillas WHERE titulo = 'Programación - Fundamentos'        LIMIT 1);
SET @p_bbdd   = (SELECT id FROM plantillas WHERE titulo = 'Bases de Datos - SQL Esencial'      LIMIT 1);
SET @p_mat    = (SELECT id FROM plantillas WHERE titulo = 'Matemáticas - Álgebra y Aritmética' LIMIT 1);
SET @p_hist   = (SELECT id FROM plantillas WHERE titulo = 'Historia - Edad Contemporánea'      LIMIT 1);
SET @p_lengua = (SELECT id FROM plantillas WHERE titulo = 'Lengua Española - Gramática'        LIMIT 1);
SET @p_bio    = (SELECT id FROM plantillas WHERE titulo = 'Biología - Célula y Genética'       LIMIT 1);

-- PROGRAMACIÓN
INSERT INTO preguntas_plantilla (id_plantilla, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad, orden) VALUES
(@p_prog, '¿Qué es una variable en programación?',                          'Un bucle que se repite',                                                           'Un espacio de memoria con nombre que almacena un valor',                           'Una función que devuelve datos',                                       'Un tipo de dato fijo',                                                    'B', 'facil',  0),
(@p_prog, '¿Cuál es la diferencia entre compilado e interpretado?',         'No hay diferencia',                                                                'El compilado traduce todo el código antes de ejecutarlo; el interpretado línea a línea', 'El interpretado es más rápido siempre',                          'El compilado solo funciona en Windows',                                   'B', 'normal', 1),
(@p_prog, '¿Qué es la recursividad?',                                       'Un tipo de bucle for',                                                             'Una función que se llama a sí misma',                                              'Una variable global',                                                  'Un operador lógico',                                                      'B', 'normal', 2),
(@p_prog, '¿Qué significa POO?',                                            'Programación Orientada a Objetos',                                                 'Proceso de Optimización de Operaciones',                                           'Protocolo de Operaciones Online',                                      'Programación de Operaciones Ordenadas',                                   'A', 'facil',  3),
(@p_prog, '¿Cuál de estos es un lenguaje de programación de alto nivel?',   'Ensamblador',                                                                      'Python',                                                                           'Código máquina',                                                       'Binario',                                                                 'B', 'facil',  4),
(@p_prog, '¿Qué es una excepción en programación?',                         'Un error de compilación',                                                          'Un evento que interrumpe el flujo normal del programa y puede ser capturado',      'Una variable sin valor',                                               'Un tipo de bucle infinito',                                               'B', 'normal', 5),
(@p_prog, '¿Qué hace el operador módulo (%)?',                              'Divide dos números',                                                               'Devuelve el cociente de una división',                                             'Devuelve el resto de una división entera',                             'Multiplica dos números',                                                  'C', 'facil',  6),
(@p_prog, '¿Qué es una API?',                                               'Un lenguaje de programación',                                                      'Una interfaz que permite comunicar aplicaciones entre sí',                         'Un tipo de base de datos',                                             'Un sistema operativo',                                                    'B', 'normal', 7),
(@p_prog, '¿Cuál es la complejidad de búsqueda binaria en lista ordenada?', 'O(n)',                                                                             'O(n²)',                                                                            'O(log n)',                                                             'O(1)',                                                                    'C', 'dificil',8),
(@p_prog, '¿Qué es el paradigma funcional?',                                'Programar solo con clases',                                                        'Un enfoque donde las funciones son ciudadanos de primera clase y se evitan efectos secundarios', 'Usar solo bucles for',                                   'Programar sin variables',                                                 'B', 'dificil',9),
(@p_prog, '¿Qué estructura de datos opera bajo el principio LIFO?',         'Cola',                                                                             'Árbol',                                                                            'Pila',                                                                 'Grafo',                                                                   'C', 'normal', 10);

-- BASES DE DATOS
INSERT INTO preguntas_plantilla (id_plantilla, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad, orden) VALUES
(@p_bbdd, '¿Qué significa SQL?',                                'System Query Language',        'Structured Query Language',                                                    'Simple Query Logic',                                           'Sequential Query List',                                           'B', 'facil',  0),
(@p_bbdd, '¿Qué hace la sentencia SELECT?',                     'Borra registros de una tabla', 'Inserta nuevos datos',                                                         'Recupera datos de una o más tablas',                           'Crea una nueva tabla',                                            'C', 'facil',  1),
(@p_bbdd, '¿Qué es una clave primaria?',                        'Un campo que puede repetirse', 'Un identificador único para cada fila de una tabla',                           'Una contraseña de la base de datos',                           'Un índice secundario',                                            'B', 'facil',  2),
(@p_bbdd, '¿Para qué sirve el JOIN en SQL?',                    'Para eliminar tablas duplicadas','Para combinar filas de dos o más tablas basándose en una columna relacionada','Para ordenar resultados',                                      'Para filtrar columnas',                                           'B', 'normal', 3),
(@p_bbdd, '¿Qué diferencia hay entre DELETE y TRUNCATE?',       'No hay diferencia',            'DELETE elimina filas con condición y registra cambios; TRUNCATE elimina todo sin registro','TRUNCATE es más lento',                           'DELETE elimina la tabla entera',                                  'B', 'normal', 4),
(@p_bbdd, '¿Qué es la normalización?',                          'Hacer copias de seguridad',    'Un proceso para organizar datos y eliminar redundancias',                       'Cifrar los datos',                                             'Aumentar el rendimiento del servidor',                            'B', 'normal', 5),
(@p_bbdd, '¿Qué es una clave foránea?',                         'La clave principal de la BD',  'Un campo que referencia la clave primaria de otra tabla',                      'Un índice único',                                              'Una columna de solo lectura',                                     'B', 'normal', 6),
(@p_bbdd, '¿Qué hace GROUP BY?',                                'Ordena resultados ascendentemente','Agrupa filas con el mismo valor en columnas especificadas',                'Filtra filas duplicadas',                                      'Une dos tablas',                                                  'B', 'normal', 7),
(@p_bbdd, '¿Qué es una transacción en bases de datos?',         'Una consulta simple',          'Una unidad de trabajo que se ejecuta de forma completa o no se ejecuta',        'Un tipo de índice',                                            'Una vista de la base de datos',                                   'B', 'dificil',8),
(@p_bbdd, '¿Qué significa ACID en bases de datos?',             'Atomicidad, Consistencia, Aislamiento, Durabilidad','Acceso, Control, Integridad, Datos',                    'Autenticación, Cifrado, Integridad, Distribución',             'Almacenamiento, Consulta, Índice, Dominio',                       'A', 'dificil',9);

-- MATEMÁTICAS
INSERT INTO preguntas_plantilla (id_plantilla, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad, orden) VALUES
(@p_mat, '¿Cuánto es 15 al cuadrado?',                                  '175',                 '200',              '225',              '250',              'C', 'facil',  0),
(@p_mat, '¿Cuál es el resultado de resolver 2x + 6 = 14?',              'x = 3',               'x = 4',            'x = 5',            'x = 10',           'B', 'facil',  1),
(@p_mat, '¿Qué es un número primo?',                                     'Divisible por 2',     'Solo divisible por 1 y por sí mismo','Un número negativo','Un número par mayor que 10','B', 'facil',  2),
(@p_mat, '¿Cuánto es la raíz cuadrada de 144?',                         '10',                  '11',               '12',               '13',               'C', 'facil',  3),
(@p_mat, '¿Cuál es el área de un círculo de radio 5? (pi ≈ 3.14)',      '31.4',                '62.8',             '78.5',             '15.7',             'C', 'normal', 4),
(@p_mat, '¿Qué es la derivada de f(x) = 3x²?',                         '3x',                  '6x',               'x²',               '9x',               'B', 'dificil',5),
(@p_mat, '¿Cuánto es seno de 90 grados?',                               '0',                   '0.5',              '0.87',             '1',                'D', 'normal', 6),
(@p_mat, 'Si log₁₀(x) = 2, ¿cuánto vale x?',                           '20',                  '100',              '1000',             '10',               'B', 'normal', 7),
(@p_mat, '¿Cuál es el mínimo común múltiplo de 4 y 6?',                 '8',                   '10',               '12',               '24',               'C', 'facil',  8),
(@p_mat, '¿Qué es una función par?',                                     'f(-x) = -f(x)',       'f(-x) = f(x)',     'f(x) = f(x+1)',    'f(x) = 0',         'B', 'normal', 9),
(@p_mat, '¿Cuántos grados tiene la suma de ángulos interiores de un triángulo?','90',           '270',              '180',              '360',              'C', 'facil',  10),
(@p_mat, '¿Cuánto es la integral de 2x dx?',                            'x + C',               'x² + C',           '2x² + C',          '2 + C',            'B', 'dificil',11);

-- HISTORIA
INSERT INTO preguntas_plantilla (id_plantilla, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad, orden) VALUES
(@p_hist, '¿En qué año comenzó la Primera Guerra Mundial?',                    '1905', '1910', '1914', '1918', 'C', 'facil',  0),
(@p_hist, '¿Quién fue el líder de la Revolución Rusa de 1917?',               'Stalin', 'Lenin', 'Trotski', 'Kerenski', 'B', 'normal', 1),
(@p_hist, '¿En qué año cayó el Muro de Berlín?',                              '1985', '1987', '1989', '1991', 'C', 'facil',  2),
(@p_hist, '¿Qué tratado puso fin a la Primera Guerra Mundial?',               'Tratado de París', 'Tratado de Versalles', 'Tratado de Berlín', 'Tratado de Roma', 'B', 'normal', 3),
(@p_hist, '¿En qué año comenzó la Guerra Civil Española?',                    '1931', '1934', '1936', '1939', 'C', 'normal', 4),
(@p_hist, '¿Cuál fue el plan de ayuda económica de EE.UU. a Europa tras la WWII?', 'Plan Truman', 'Plan Marshall', 'Plan Roosevelt', 'Plan Wilson', 'B', 'normal', 5),
(@p_hist, '¿Qué acontecimiento marcó el inicio de la Segunda Guerra Mundial?','El bombardeo de Pearl Harbor', 'La invasión de Polonia por Alemania', 'La ocupación de Francia', 'La batalla de Stalingrado', 'B', 'normal', 6),
(@p_hist, '¿En qué año se fundó la ONU?',                                     '1944', '1945', '1947', '1950', 'B', 'normal', 7),
(@p_hist, '¿Qué sistema político imperaba en Sudáfrica hasta 1994?',          'Comunismo', 'Apartheid', 'Monarquía absoluta', 'Teocracia', 'B', 'normal', 8);

-- LENGUA
INSERT INTO preguntas_plantilla (id_plantilla, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad, orden) VALUES
(@p_lengua, '¿Qué es un sustantivo?',                                  'Una palabra que modifica al verbo', 'Una palabra que nombra personas, animales o cosas', 'Una palabra que expresa acción', 'Una palabra que une oraciones', 'B', 'facil',  0),
(@p_lengua, '¿Cuál de estas palabras es un adjetivo?',                 'Correr', 'Rápidamente', 'Veloz', 'Mesa', 'C', 'facil',  1),
(@p_lengua, '¿Qué tipo de oración es "El gato duerme"?',               'Compuesta', 'Simple', 'Subordinada', 'Yuxtapuesta', 'B', 'facil',  2),
(@p_lengua, '¿Qué es una metáfora?',                                   'Una comparación usando como o cual', 'Identificar un objeto con otro por su semejanza sin nexo comparativo', 'Una exageración para enfatizar', 'Una contradicción aparente', 'B', 'normal', 3),
(@p_lengua, '¿Cuál es el sujeto de "Los niños juegan en el parque"?',  'Juegan en el parque', 'Los niños', 'En el parque', 'Juegan', 'B', 'facil',  4),
(@p_lengua, '¿Qué es el hipérbaton?',                                  'Una figura que exagera', 'Una alteración del orden lógico de las palabras en la oración', 'Una repetición de sonidos', 'Un tipo de rima', 'B', 'normal', 5),
(@p_lengua, '¿Qué es la sinonimia?',                                   'Palabras con significado opuesto', 'Palabras con el mismo o parecido significado', 'Palabras que suenan igual', 'Palabras derivadas de la misma raíz', 'B', 'facil',  6),
(@p_lengua, '¿Cuál tiene un complemento directo?',                     'María camina despacio', 'Luis compró un libro', 'El sol brilla', 'Ella llegó tarde', 'B', 'normal', 7),
(@p_lengua, '¿Qué es la ironía literaria?',                            'Decir lo contrario de lo que se piensa', 'Una exageración humorística', 'Una repetición de palabras', 'Una comparación directa', 'A', 'normal', 8),
(@p_lengua, '¿Qué es un morfema?',                                     'La unidad mínima con significado de una palabra', 'Una oración compuesta', 'Un tipo de verbo', 'Un conector textual', 'A', 'dificil',9),
(@p_lengua, '¿Cuál es el tiempo verbal de "Habría comido"?',           'Pretérito perfecto simple', 'Futuro imperfecto', 'Condicional compuesto', 'Pretérito pluscuamperfecto', 'C', 'dificil',10),
(@p_lengua, '¿Qué es la deixis en lingüística?',                       'La entonación de una frase', 'El fenómeno de señalar elementos del contexto mediante palabras', 'Un tipo de acento', 'La puntuación de un texto', 'B', 'dificil',11),
(@p_lengua, '¿Qué figura retórica repite sonidos al inicio de palabras?','Anáfora', 'Aliteración', 'Asíndeton', 'Pleonasmo', 'B', 'normal', 12);

-- BIOLOGÍA
INSERT INTO preguntas_plantilla (id_plantilla, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, dificultad, orden) VALUES
(@p_bio, '¿Cuál es la unidad básica de la vida?',                              'El tejido',        'El órgano',       'La célula',       'La molécula',      'C', 'facil',  0),
(@p_bio, '¿Qué función tiene el núcleo celular?',                              'Producir energía', 'Contener el material genético y controlar las actividades celulares', 'Sintetizar proteínas', 'Almacenar lípidos', 'B', 'facil',  1),
(@p_bio, '¿Qué es la mitosis?',                                                'División que produce células sexuales', 'División que produce dos células hijas idénticas', 'Fusión de dos células', 'Muerte celular programada', 'B', 'normal', 2),
(@p_bio, '¿Cuál es la molécula portadora de información genética?',            'ARN',              'ATP',             'ADN',             'Glucosa',          'C', 'facil',  3),
(@p_bio, '¿Qué es la fotosíntesis?',                                           'Proceso por el que las plantas obtienen agua', 'Proceso por el que las plantas producen glucosa usando luz solar y CO2', 'Respiración celular nocturna', 'Digestión de nutrientes en plantas', 'B', 'normal', 4),
(@p_bio, '¿Qué tipo de célula no tiene núcleo definido?',                      'Célula animal',    'Célula vegetal',  'Célula procariota','Célula eucariota', 'C', 'normal', 5),
(@p_bio, '¿Qué es la meiosis?',                                                'División que produce dos células idénticas', 'División que produce cuatro células con la mitad de cromosomas', 'Fusión de células somáticas', 'Replicación del ADN', 'B', 'normal', 6),
(@p_bio, '¿Cuál es la función de las mitocondrias?',                           'Síntesis de proteínas', 'Producción de energía mediante respiración celular (ATP)', 'Digestión intracelular', 'Fotosíntesis', 'B', 'normal', 7),
(@p_bio, '¿Qué es un gen?',                                                    'Un tipo de proteína', 'Una secuencia de ADN que codifica una proteína o tiene función específica', 'Un cromosoma completo', 'Una célula especializada', 'B', 'normal', 8),
(@p_bio, '¿Cuántos cromosomas tiene una célula humana normal?',                '23',               '44',              '46',              '48',               'C', 'normal', 9),
(@p_bio, '¿Qué es la selección natural?',                                      'La reproducción artificial de especies', 'El proceso por el que organismos mejor adaptados sobreviven y se reproducen más', 'La mutación espontánea de genes', 'La extinción de especies débiles', 'B', 'dificil',10),
(@p_bio, '¿Qué es la homeostasis?',                                            'La reproducción celular', 'La capacidad de un organismo de mantener su equilibrio interno', 'El movimiento de nutrientes', 'La síntesis de hormonas', 'B', 'dificil',11),
(@p_bio, '¿Qué son los ribosomas?',                                            'Orgánulos que producen energía', 'Orgánulos encargados de la síntesis de proteínas', 'El sistema de transporte celular', 'Orgánulos de digestión intracelular', 'B', 'normal', 12),
(@p_bio, '¿Qué es la epigenética?',                                            'El estudio de la estructura del ADN', 'El estudio de cambios en la expresión génica sin alterar la secuencia de ADN', 'La herencia de caracteres adquiridos', 'El análisis de proteínas celulares', 'B', 'dificil',13);

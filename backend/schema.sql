-- ============================================
-- SISTEMA DE VOTACIÓN - ESQUEMA DE BASE DE DATOS
-- ============================================

-- Tabla de administradores
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de encuestas
CREATE TABLE encuestas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    slug VARCHAR(150) UNIQUE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador', -- borrador, activa, cerrada
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    creada_por INT NOT NULL REFERENCES admins(id),
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de candidatos
CREATE TABLE candidatos (
    id SERIAL PRIMARY KEY,
    encuesta_id INT NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    foto_url TEXT,
    orden_visual INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de sesiones de votante (control de token)
CREATE TABLE votantes_sesion (
    id SERIAL PRIMARY KEY,
    encuesta_id INT NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    token_votante VARCHAR(255) NOT NULL,
    ip VARCHAR(80),
    user_agent TEXT,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (encuesta_id, token_votante)
);

-- Tabla de votos
CREATE TABLE votos (
    id SERIAL PRIMARY KEY,
    encuesta_id INT NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    candidato_id INT NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    token_votante VARCHAR(255) NOT NULL,
    ip VARCHAR(80),
    user_agent TEXT,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (encuesta_id, token_votante)
);

-- Índices para rendimiento
CREATE INDEX idx_candidatos_encuesta_id ON candidatos(encuesta_id);
CREATE INDEX idx_votos_encuesta_id ON votos(encuesta_id);
CREATE INDEX idx_votos_candidato_id ON votos(candidato_id);
CREATE INDEX idx_votos_token_votante ON votos(token_votante);
CREATE INDEX idx_encuestas_slug ON encuestas(slug);
CREATE INDEX idx_votantes_sesion_encuesta ON votantes_sesion(encuesta_id, token_votante);

-- ============================================
-- ADMIN INICIAL (contraseña: Admin123!)
-- Generar hash real con: node -e "const b=require('bcrypt');b.hash('Admin123!',12).then(console.log)"
-- ============================================
-- INSERT INTO admins (nombre, email, password_hash)
-- VALUES ('Administrador', 'admin@ejemplo.com', '$2b$12$HASH_GENERADO_AQUI');

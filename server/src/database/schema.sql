-- Script de inicialización de base de datos Oracle
-- Ejecutar este script en Oracle SQL Developer o con SQL*Plus

-- Tabla de Usuarios
CREATE TABLE mi_agenda_usuarios (
    id VARCHAR2(36) PRIMARY KEY,
    email VARCHAR2(255) UNIQUE NOT NULL,
    nombre VARCHAR2(255) NOT NULL,
    password VARCHAR2(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Eventos
CREATE TABLE mi_agenda_eventos (
    id VARCHAR2(36) PRIMARY KEY,
    titulo VARCHAR2(500) NOT NULL,
    descripcion CLOB,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    ubicacion VARCHAR2(500),
    usuario_id VARCHAR2(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evento_usuario FOREIGN KEY (usuario_id) 
        REFERENCES mi_agenda_usuarios(id) ON DELETE CASCADE
);

-- Tabla de Contactos
CREATE TABLE mi_agenda_contactos (
    id VARCHAR2(36) PRIMARY KEY,
    nombre VARCHAR2(255) NOT NULL,
    apellido VARCHAR2(255),
    email VARCHAR2(255),
    telefono VARCHAR2(50),
    notas CLOB,
    usuario_id VARCHAR2(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contacto_usuario FOREIGN KEY (usuario_id) 
        REFERENCES mi_agenda_usuarios(id) ON DELETE CASCADE
);

-- Tabla de Tareas
CREATE TABLE mi_agenda_tareas (
    id VARCHAR2(36) PRIMARY KEY,
    titulo VARCHAR2(500) NOT NULL,
    descripcion CLOB,
    completada NUMBER(1) DEFAULT 0,
    fecha_limite TIMESTAMP,
    prioridad VARCHAR2(20) DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA')),
    usuario_id VARCHAR2(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tarea_usuario FOREIGN KEY (usuario_id) 
        REFERENCES mi_agenda_usuarios(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_mi_agenda_eventos_usuario ON mi_agenda_eventos(usuario_id);
CREATE INDEX idx_mi_agenda_eventos_fecha ON mi_agenda_eventos(fecha_inicio);
CREATE INDEX idx_mi_agenda_contactos_usuario ON mi_agenda_contactos(usuario_id);
CREATE INDEX idx_mi_agenda_tareas_usuario ON mi_agenda_tareas(usuario_id);
CREATE INDEX idx_mi_agenda_tareas_completada ON mi_agenda_tareas(completada);

-- Trigger para actualizar updated_at en Usuarios
CREATE OR REPLACE TRIGGER trg_mi_agenda_usuarios_upd
BEFORE UPDATE ON mi_agenda_usuarios
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger para actualizar updated_at en Eventos
CREATE OR REPLACE TRIGGER trg_mi_agenda_eventos_upd
BEFORE UPDATE ON mi_agenda_eventos
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger para actualizar updated_at en Contactos
CREATE OR REPLACE TRIGGER trg_mi_agenda_contactos_upd
BEFORE UPDATE ON mi_agenda_contactos
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger para actualizar updated_at en Tareas
CREATE OR REPLACE TRIGGER trg_mi_agenda_tareas_upd
BEFORE UPDATE ON mi_agenda_tareas
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

COMMIT;

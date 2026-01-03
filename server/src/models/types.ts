export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  ubicacion?: string;
  usuario_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Contacto {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  notas?: string;
  usuario_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  fecha_limite?: Date;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  usuario_id: string;
  created_at?: Date;
  updated_at?: Date;
}

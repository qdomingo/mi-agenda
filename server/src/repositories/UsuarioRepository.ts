import { executeQuery, executeCommand } from '../database/connection';
import { Usuario } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class UsuarioRepository {
  /**
   * Buscar usuario por email
   */
  static async findByEmail(email: string): Promise<Usuario | null> {
    const sql = `
      SELECT
        id         AS "id",
        email      AS "email",
        nombre     AS "nombre",
        password   AS "password_hash",
        created_at AS "created_at",
        updated_at AS "updated_at"
      FROM mi_agenda_usuarios
      WHERE email = :email
    `;

    const rows = await executeQuery<Usuario>(sql, { email });
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id: string): Promise<Usuario | null> {
    const sql = `
      SELECT
        id         AS "id",
        email      AS "email",
        nombre     AS "nombre",
        password   AS "password_hash",
        created_at AS "created_at",
        updated_at AS "updated_at"
      FROM mi_agenda_usuarios
      WHERE id = :id
    `;

    const rows = await executeQuery<Usuario>(sql, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Crear nuevo usuario
   */
  static async create(data: {
    email: string;
    nombre: string;
    password_hash: string;
  }): Promise<Usuario> {
    const id = uuidv4();
    
    const sql = `
      INSERT INTO mi_agenda_usuarios (id, email, nombre, password)
      VALUES (:id, :email, :nombre, :password)
    `;

    await executeCommand(sql, {
      id,
      email: data.email,
      nombre: data.nombre,
      password: data.password_hash,
    });

    // Buscar el usuario recién creado
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new Error('Error al crear usuario');
    }

    return usuario;
  }

  /**
   * Actualizar usuario
   */
  static async update(id: string, data: Partial<Usuario>): Promise<Usuario | null> {
    const fields: string[] = [];
    const values: any = { id };

    if (data.nombre !== undefined) {
      fields.push('nombre = :nombre');
      values.nombre = data.nombre;
    }
    if (data.email !== undefined) {
      fields.push('email = :email');
      values.email = data.email;
    }
    if (data.password_hash !== undefined) {
      fields.push('password = :password');
      values.password = data.password_hash;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const sql = `
      UPDATE mi_agenda_usuarios
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id
    `;

    await executeCommand(sql, values);
    return this.findById(id);
  }
}

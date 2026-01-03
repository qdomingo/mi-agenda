import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeCommand } from '../database/connection';
import { Contacto } from '../models/types';

export class ContactoRepository {
  /**
   * Obtener todos los contactos de un usuario
   */
  static async findByUserId(usuarioId: string): Promise<Contacto[]> {
    const sql = `
      SELECT
        id AS "id",
        nombre AS "nombre",
        apellido AS "apellido",
        email AS "email",
        telefono AS "telefono",
        notas AS "notas",
        usuario_id AS "usuario_id",
        created_at AS "created_at",
        updated_at AS "updated_at"
      FROM mi_agenda_contactos
      WHERE usuario_id = :1
      ORDER BY nombre ASC, apellido ASC
    `;
    return executeQuery<Contacto>(sql, [usuarioId]);
  }

  /**
   * Obtener un contacto por ID
   */
  static async findById(id: string): Promise<Contacto | null> {
    const sql = `
      SELECT
        id AS "id",
        nombre AS "nombre",
        apellido AS "apellido",
        email AS "email",
        telefono AS "telefono",
        notas AS "notas",
        usuario_id AS "usuario_id",
        created_at AS "created_at",
        updated_at AS "updated_at"
      FROM mi_agenda_contactos
      WHERE id = :1
    `;
    const result = await executeQuery<Contacto>(sql, [id]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Crear un nuevo contacto
   */
  static async create(contacto: Omit<Contacto, 'id' | 'created_at' | 'updated_at'>): Promise<Contacto> {
    const id = uuidv4();
    const sql = `
      INSERT INTO mi_agenda_contactos (id, nombre, apellido, email, telefono, notas, usuario_id)
      VALUES (:1, :2, :3, :4, :5, :6, :7)
    `;
    await executeCommand(sql, [
      id,
      contacto.nombre,
      contacto.apellido || null,
      contacto.email || null,
      contacto.telefono || null,
      contacto.notas || null,
      contacto.usuario_id,
    ]);
    return this.findById(id) as Promise<Contacto>;
  }

  /**
   * Actualizar un contacto
   */
  static async update(id: string, contacto: Partial<Contacto>): Promise<Contacto | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (contacto.nombre !== undefined) {
      fields.push('nombre = :' + (fields.length + 1));
      values.push(contacto.nombre);
    }
    if (contacto.apellido !== undefined) {
      fields.push('apellido = :' + (fields.length + 1));
      values.push(contacto.apellido);
    }
    if (contacto.email !== undefined) {
      fields.push('email = :' + (fields.length + 1));
      values.push(contacto.email);
    }
    if (contacto.telefono !== undefined) {
      fields.push('telefono = :' + (fields.length + 1));
      values.push(contacto.telefono);
    }
    if (contacto.notas !== undefined) {
      fields.push('notas = :' + (fields.length + 1));
      values.push(contacto.notas);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE mi_agenda_contactos SET ${fields.join(', ')} WHERE id = :${fields.length + 1}`;
    await executeCommand(sql, values);
    return this.findById(id);
  }

  /**
   * Eliminar un contacto
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM mi_agenda_contactos WHERE id = :1';
    const result = await executeCommand(sql, [id]);
    return (result.rowsAffected || 0) > 0;
  }
}

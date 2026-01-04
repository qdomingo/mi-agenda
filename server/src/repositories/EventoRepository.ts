import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeCommand } from '../database/connection';
import { Evento } from '../models/types';

export class EventoRepository {
  // Convierte Date a string ISO local (sin 'Z') para evitar desfase de zona horaria
  private static dateToLocalString(date: Date | undefined): string | undefined {
    if (!date || !(date instanceof Date)) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private static toEvento(row: any): Evento {
    return {
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion ?? undefined,
      fecha_inicio: this.dateToLocalString(row.fecha_inicio) as any,
      fecha_fin: this.dateToLocalString(row.fecha_fin) as any,
      ubicacion: row.ubicacion ?? undefined,
      usuario_id: row.usuario_id,
      created_at: row.created_at ?? undefined,
      updated_at: row.updated_at ?? undefined,
    };
  }

  /**
   * Obtener todos los eventos de un usuario
   */
  static async findByUserId(usuarioId: string): Promise<Evento[]> {
    const sql = `
      SELECT
        id AS "id",
        titulo AS "titulo",
        descripcion AS "descripcion",
        fecha_inicio AS "fecha_inicio",
        fecha_fin AS "fecha_fin",
        ubicacion AS "ubicacion",
        usuario_id AS "usuario_id",
        created_at AS "created_at",
        updated_at AS "updated_at"
      FROM mi_agenda_eventos
      WHERE usuario_id = :1
      ORDER BY fecha_inicio DESC
    `;
    const rows = await executeQuery<any>(sql, [usuarioId]);
    return rows.map(this.toEvento.bind(this));
  }

  /**
   * Obtener un evento por ID
   */
  static async findById(id: string): Promise<Evento | null> {
    const sql = `
      SELECT
        id AS "id",
        titulo AS "titulo",
        descripcion AS "descripcion",
        fecha_inicio AS "fecha_inicio",
        fecha_fin AS "fecha_fin",
        ubicacion AS "ubicacion",
        usuario_id AS "usuario_id",
        created_at AS "created_at",
        updated_at AS "updated_at"
      FROM mi_agenda_eventos
      WHERE id = :1
    `;
    const result = await executeQuery<any>(sql, [id]);
    return result.length > 0 ? this.toEvento(result[0]) : null;
  }

  /**
   * Crear un nuevo evento
   */
  static async create(evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'> & { fecha_inicio?: Date; fecha_fin?: Date }): Promise<Evento> {
    const id = uuidv4();
    const sql = `
      INSERT INTO mi_agenda_eventos (id, titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, usuario_id)
      VALUES (:1, :2, :3, :4, :5, :6, :7)
    `;
    await executeCommand(sql, [
      id,
      evento.titulo,
      evento.descripcion || null,
      evento.fecha_inicio || null,
      evento.fecha_fin || null,
      evento.ubicacion || null,
      evento.usuario_id,
    ]);
    return this.findById(id) as Promise<Evento>;
  }

  /**
   * Actualizar un evento
   */
  static async update(id: string, evento: Partial<Evento>): Promise<Evento | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (evento.titulo !== undefined) {
      fields.push('titulo = :' + (fields.length + 1));
      values.push(evento.titulo);
    }
    if (evento.descripcion !== undefined) {
      fields.push('descripcion = :' + (fields.length + 1));
      values.push(evento.descripcion);
    }
    if (evento.fecha_inicio !== undefined) {
      fields.push('fecha_inicio = :' + (fields.length + 1));
      values.push(evento.fecha_inicio);
    }
    if (evento.fecha_fin !== undefined) {
      fields.push('fecha_fin = :' + (fields.length + 1));
      values.push(evento.fecha_fin);
    }
    if (evento.ubicacion !== undefined) {
      fields.push('ubicacion = :' + (fields.length + 1));
      values.push(evento.ubicacion);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE mi_agenda_eventos SET ${fields.join(', ')} WHERE id = :${fields.length + 1}`;
    await executeCommand(sql, values);
    return this.findById(id);
  }

  /**
   * Eliminar un evento
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM mi_agenda_eventos WHERE id = :1';
    const result = await executeCommand(sql, [id]);
    return (result.rowsAffected || 0) > 0;
  }
}

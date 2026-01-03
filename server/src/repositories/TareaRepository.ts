import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeCommand } from '../database/connection';
import { Tarea } from '../models/types';

export class TareaRepository {
  private static toTarea(row: any): Tarea {
    const completada = row.completada === 1 || row.completada === true;
    return {
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion ?? undefined,
      completada,
      fecha_limite: row.fecha_limite ?? undefined,
      prioridad: row.prioridad,
      usuario_id: row.usuario_id,
      created_at: row.created_at ?? undefined,
      updated_at: row.updated_at ?? undefined,
    };
  }

  /**
   * Obtener todas las tareas de un usuario
   */
  static async findByUserId(usuarioId: string): Promise<Tarea[]> {
    const sql = `
      SELECT
        id          AS "id",
        titulo      AS "titulo",
        descripcion AS "descripcion",
        completada  AS "completada",
        fecha_limite AS "fecha_limite",
        prioridad   AS "prioridad",
        usuario_id  AS "usuario_id",
        created_at  AS "created_at",
        updated_at  AS "updated_at"
      FROM mi_agenda_tareas
      WHERE usuario_id = :1
      ORDER BY 
        CASE prioridad 
          WHEN 'ALTA' THEN 1 
          WHEN 'MEDIA' THEN 2 
          ELSE 3 
        END,
        fecha_limite ASC NULLS LAST
    `;
    const rows = await executeQuery<any>(sql, [usuarioId]);
    return rows.map(this.toTarea);
  }

  /**
   * Obtener una tarea por ID
   */
  static async findById(id: string): Promise<Tarea | null> {
    const sql = `
      SELECT
        id          AS "id",
        titulo      AS "titulo",
        descripcion AS "descripcion",
        completada  AS "completada",
        fecha_limite AS "fecha_limite",
        prioridad   AS "prioridad",
        usuario_id  AS "usuario_id",
        created_at  AS "created_at",
        updated_at  AS "updated_at"
      FROM mi_agenda_tareas
      WHERE id = :1
    `;
    const rows = await executeQuery<any>(sql, [id]);
    if (rows.length === 0) return null;
    return this.toTarea(rows[0]);
  }

  /**
   * Crear una nueva tarea
   */
  static async create(tarea: Omit<Tarea, 'id' | 'created_at' | 'updated_at'>): Promise<Tarea> {
    const id = uuidv4();
    const sql = `
      INSERT INTO mi_agenda_tareas (id, titulo, descripcion, completada, fecha_limite, prioridad, usuario_id)
      VALUES (:1, :2, :3, :4, :5, :6, :7)
    `;
    await executeCommand(sql, [
      id,
      tarea.titulo,
      tarea.descripcion || null,
      tarea.completada ? 1 : 0,
      tarea.fecha_limite || null,
      tarea.prioridad,
      tarea.usuario_id,
    ]);
    return this.findById(id) as Promise<Tarea>;
  }

  /**
   * Actualizar una tarea
   */
  static async update(id: string, tarea: Partial<Tarea>): Promise<Tarea | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (tarea.titulo !== undefined) {
      fields.push('titulo = :' + (fields.length + 1));
      values.push(tarea.titulo);
    }
    if (tarea.descripcion !== undefined) {
      fields.push('descripcion = :' + (fields.length + 1));
      values.push(tarea.descripcion);
    }
    if (tarea.completada !== undefined) {
      fields.push('completada = :' + (fields.length + 1));
      values.push(tarea.completada ? 1 : 0);
    }
    if (tarea.fecha_limite !== undefined) {
      fields.push('fecha_limite = :' + (fields.length + 1));
      values.push(tarea.fecha_limite);
    }
    if (tarea.prioridad !== undefined) {
      fields.push('prioridad = :' + (fields.length + 1));
      values.push(tarea.prioridad);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE mi_agenda_tareas SET ${fields.join(', ')} WHERE id = :${fields.length + 1}`;
    await executeCommand(sql, values);
    return this.findById(id);
  }

  /**
   * Eliminar una tarea
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM mi_agenda_tareas WHERE id = :1';
    const result = await executeCommand(sql, [id]);
    return (result.rowsAffected || 0) > 0;
  }
}

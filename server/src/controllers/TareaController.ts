// Parsea string 'YYYY-MM-DDTHH:mm' como local (sin UTC)
function parseDateLocal(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  // Solo procesa si es string tipo 'YYYY-MM-DDTHH:mm' o 'YYYY-MM-DDTHH:mm:ss'
  const match = dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  if (!match) return new Date(dateString); // fallback
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}
import { Request, Response } from 'express';
import { TareaRepository } from '../repositories/TareaRepository';
import { AuthRequest } from '../middleware/auth';

function getUserId(req: Request): string | undefined {
  const authUserId = (req as AuthRequest).userId;
  if (authUserId) return authUserId;

  const q = req.query as any;
  if (typeof q.usuarioId === 'string') return q.usuarioId;

  const b = req.body as any;
  if (typeof b?.usuario_id === 'string') return b.usuario_id;

  return undefined;
}

export class TareaController {
  /**
   * GET /api/tareas?usuarioId=xxx
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = getUserId(req);

      if (!usuarioId) {
        res.status(400).json({ error: 'usuarioId es requerido' });
        return;
      }

      const tareas = await TareaRepository.findByUserId(usuarioId);
      res.json(tareas);
    } catch (error) {
      console.error('Error getting tareas:', error);
      res.status(500).json({ error: 'Error al obtener tareas' });
    }
  }

  /**
   * GET /api/tareas/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tarea = await TareaRepository.findById(id);

      if (!tarea) {
        res.status(404).json({ error: 'Tarea no encontrada' });
        return;
      }

      res.json(tarea);
    } catch (error) {
      console.error('Error getting tarea:', error);
      res.status(500).json({ error: 'Error al obtener tarea' });
    }
  }

  /**
   * POST /api/tareas
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { titulo, descripcion, completada, fecha_limite, prioridad } = req.body;
      const usuarioId = getUserId(req);

      if (!titulo || !usuarioId) {
        res.status(400).json({ error: 'titulo es requerido' });
        return;
      }

      // Forzamos a que siempre sea Date (no undefined) para cumplir el tipo
      const fechaLimiteParsed = parseDateLocal(fecha_limite) || new Date();
      const tarea = await TareaRepository.create({
        titulo,
        descripcion,
        completada: completada || false,
        fecha_limite: fechaLimiteParsed,
        prioridad: prioridad || 'MEDIA',
        usuario_id: usuarioId,
      });

      res.status(201).json(tarea);
    } catch (error) {
      console.error('Error creating tarea:', error);
      res.status(500).json({ error: 'Error al crear tarea' });
    }
  }

  /**
   * PUT /api/tareas/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Convertir fecha si viene como string
      if (updates.fecha_limite) {
        updates.fecha_limite = parseDateLocal(updates.fecha_limite) || new Date();
      }

      const tarea = await TareaRepository.update(id, updates);

      if (!tarea) {
        res.status(404).json({ error: 'Tarea no encontrada' });
        return;
      }

      res.json(tarea);
    } catch (error) {
      console.error('Error updating tarea:', error);
      res.status(500).json({ error: 'Error al actualizar tarea' });
    }
  }

  /**
   * DELETE /api/tareas/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await TareaRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Tarea no encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting tarea:', error);
      res.status(500).json({ error: 'Error al eliminar tarea' });
    }
  }
}

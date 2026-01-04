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
import { EventoRepository } from '../repositories/EventoRepository';
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

export class EventoController {
  /**
   * GET /api/eventos?usuarioId=xxx
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = getUserId(req);

      if (!usuarioId) {
        res.status(400).json({ error: 'usuarioId es requerido' });
        return;
      }

      const eventos = await EventoRepository.findByUserId(usuarioId);
      res.json(eventos);
    } catch (error) {
      console.error('Error getting eventos:', error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  /**
   * GET /api/eventos/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const evento = await EventoRepository.findById(id);

      if (!evento) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }

      res.json(evento);
    } catch (error) {
      console.error('Error getting evento:', error);
      res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  /**
   * POST /api/eventos
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { titulo, descripcion, fecha_inicio, fecha_fin, ubicacion } = req.body;
      const usuarioId = getUserId(req);

      if (!titulo || !fecha_inicio || !fecha_fin || !usuarioId) {
        res.status(400).json({ 
          error: 'titulo, fecha_inicio y fecha_fin son requeridos' 
        });
        return;
      }

      const evento = await EventoRepository.create({
        titulo,
        descripcion,
        fecha_inicio: parseDateLocal(fecha_inicio),
        fecha_fin: parseDateLocal(fecha_fin),
        ubicacion,
        usuario_id: usuarioId,
      });

      res.status(201).json(evento);
    } catch (error) {
      console.error('Error creating evento:', error);
      res.status(500).json({ error: 'Error al crear evento' });
    }
  }

  /**
   * PUT /api/eventos/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Convertir fechas si vienen como strings
      if (updates.fecha_inicio) {
        updates.fecha_inicio = parseDateLocal(updates.fecha_inicio);
      }
      if (updates.fecha_fin) {
        updates.fecha_fin = parseDateLocal(updates.fecha_fin);
      }

      const evento = await EventoRepository.update(id, updates);

      if (!evento) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }

      res.json(evento);
    } catch (error) {
      console.error('Error updating evento:', error);
      res.status(500).json({ error: 'Error al actualizar evento' });
    }
  }

  /**
   * DELETE /api/eventos/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await EventoRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting evento:', error);
      res.status(500).json({ error: 'Error al eliminar evento' });
    }
  }
}

import { Request, Response } from 'express';
import { ContactoRepository } from '../repositories/ContactoRepository';
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

export class ContactoController {
  /**
   * GET /api/contactos?usuarioId=xxx
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = getUserId(req);

      if (!usuarioId) {
        res.status(400).json({ error: 'usuarioId es requerido' });
        return;
      }

      const contactos = await ContactoRepository.findByUserId(usuarioId);
      res.json(contactos);
    } catch (error) {
      console.error('Error getting contactos:', error);
      res.status(500).json({ error: 'Error al obtener contactos' });
    }
  }

  /**
   * GET /api/contactos/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contacto = await ContactoRepository.findById(id);

      if (!contacto) {
        res.status(404).json({ error: 'Contacto no encontrado' });
        return;
      }

      res.json(contacto);
    } catch (error) {
      console.error('Error getting contacto:', error);
      res.status(500).json({ error: 'Error al obtener contacto' });
    }
  }

  /**
   * POST /api/contactos
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, apellido, email, telefono, notas } = req.body;
      const usuarioId = getUserId(req);

      if (!nombre || !usuarioId) {
        res.status(400).json({ error: 'nombre es requerido' });
        return;
      }

      const contacto = await ContactoRepository.create({
        nombre,
        apellido,
        email,
        telefono,
        notas,
        usuario_id: usuarioId,
      });

      res.status(201).json(contacto);
    } catch (error) {
      console.error('Error creating contacto:', error);
      res.status(500).json({ error: 'Error al crear contacto' });
    }
  }

  /**
   * PUT /api/contactos/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const contacto = await ContactoRepository.update(id, updates);

      if (!contacto) {
        res.status(404).json({ error: 'Contacto no encontrado' });
        return;
      }

      res.json(contacto);
    } catch (error) {
      console.error('Error updating contacto:', error);
      res.status(500).json({ error: 'Error al actualizar contacto' });
    }
  }

  /**
   * DELETE /api/contactos/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await ContactoRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Contacto no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting contacto:', error);
      res.status(500).json({ error: 'Error al eliminar contacto' });
    }
  }
}

import { Router } from 'express';
import { EventoController } from '../controllers/EventoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas las rutas de eventos requieren autenticación
router.use(authenticateToken);

// GET /api/eventos?usuarioId=xxx - Obtener todos los eventos de un usuario
router.get('/', EventoController.getAll);

// GET /api/eventos/:id - Obtener un evento por ID
router.get('/:id', EventoController.getById);

// POST /api/eventos - Crear un nuevo evento
router.post('/', EventoController.create);

// PUT /api/eventos/:id - Actualizar un evento
router.put('/:id', EventoController.update);

// DELETE /api/eventos/:id - Eliminar un evento
router.delete('/:id', EventoController.delete);

export default router;

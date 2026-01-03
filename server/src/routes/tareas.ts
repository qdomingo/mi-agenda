import { Router } from 'express';
import { TareaController } from '../controllers/TareaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas las rutas de tareas requieren autenticación
router.use(authenticateToken);

// GET /api/tareas?usuarioId=xxx - Obtener todas las tareas de un usuario
router.get('/', TareaController.getAll);

// GET /api/tareas/:id - Obtener una tarea por ID
router.get('/:id', TareaController.getById);

// POST /api/tareas - Crear una nueva tarea
router.post('/', TareaController.create);

// PUT /api/tareas/:id - Actualizar una tarea
router.put('/:id', TareaController.update);

// DELETE /api/tareas/:id - Eliminar una tarea
router.delete('/:id', TareaController.delete);

export default router;

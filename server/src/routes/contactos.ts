import { Router } from 'express';
import { ContactoController } from '../controllers/ContactoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas las rutas de contactos requieren autenticación
router.use(authenticateToken);

// GET /api/contactos?usuarioId=xxx - Obtener todos los contactos de un usuario
router.get('/', ContactoController.getAll);

// GET /api/contactos/:id - Obtener un contacto por ID
router.get('/:id', ContactoController.getById);

// POST /api/contactos - Crear un nuevo contacto
router.post('/', ContactoController.create);

// PUT /api/contactos/:id - Actualizar un contacto
router.put('/:id', ContactoController.update);

// DELETE /api/contactos/:id - Eliminar un contacto
router.delete('/:id', ContactoController.delete);

export default router;

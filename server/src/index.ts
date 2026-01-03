import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno PRIMERO
dotenv.config({ path: path.join(__dirname, '../../.env') });

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { initializePool, closePool, executeCommand, executeQuery } from './database/connection';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Importar rutas
import authRoutes from './routes/auth';
import eventosRoutes from './routes/eventos';
import contactosRoutes from './routes/contactos';
import tareasRoutes from './routes/tareas';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running', database: 'Oracle Autonomous' });
});

// Endpoint de prueba para insertar usuario directamente
app.post('/api/test/insert-user', async (req: Request, res: Response) => {
  try {
    const { email, nombre, password } = req.body;
    
    if (!email || !nombre || !password) {
      res.status(400).json({ error: 'email, nombre y password son requeridos' });
      return;
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);

    console.log('🧪 TEST: Intentando insertar usuario:', { id, email, nombre });

    // Inserción directa
    const sql = `
      INSERT INTO mi_agenda_usuarios (id, email, nombre, password)
      VALUES (:id, :email, :nombre, :password)
    `;

    const result = await executeCommand(sql, {
      id,
      email,
      nombre,
      password: password_hash,
    });

    console.log('✅ TEST: Insert ejecutado, resultado:', result);

    // Verificar que se insertó
    const checkSql = `SELECT id, email, nombre FROM mi_agenda_usuarios WHERE id = :id`;
    const checkRows = await executeQuery(checkSql, { id });

    console.log('🔍 TEST: Usuario verificado:', checkRows);

    res.json({
      success: true,
      message: 'Usuario insertado correctamente',
      usuario: checkRows[0] || null,
      debug: {
        id,
        rowsAffected: result.rowsAffected,
      },
    });
  } catch (error: any) {
    console.error('❌ TEST: Error insertando usuario:', error);
    res.status(500).json({ 
      error: 'Error al insertar usuario',
      details: error.message,
      code: error.code,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/tareas', tareasRoutes);

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/build');
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Inicializar conexión a Oracle y arrancar servidor
async function startServer() {
  try {
    await initializePool();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: Oracle Autonomous`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing connections...');
  await closePool();
  process.exit(0);
});

startServer();

export default app;

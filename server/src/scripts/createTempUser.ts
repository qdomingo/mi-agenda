import 'dotenv/config';
import { initializePool, executeCommand, closePool } from '../database/connection';

async function createTempUser() {
  try {
    await initializePool();
    console.log('✅ Conectado a la base de datos');

    // Verificar si el usuario ya existe
    const checkSql = `SELECT id, email, nombre FROM mi_agenda_usuarios WHERE id = 'temp-user-123'`;
    const result = await executeCommand(checkSql);
    
    if (result.rowsAffected && result.rowsAffected > 0) {
      console.log('✅ Usuario temporal ya existe');
    } else {
      console.log('❌ Usuario no encontrado, creándolo...');
      
      // Crear usuario temporal
      const insertSql = `
        INSERT INTO mi_agenda_usuarios (id, email, nombre, password)
        VALUES ('temp-user-123', 'demo@miagenda.com', 'Usuario Demo', 'temp-hash')
      `;
      
      await executeCommand(insertSql);
      console.log('✅ Usuario temporal creado exitosamente');
    }
    
    await closePool();
    console.log('✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTempUser();

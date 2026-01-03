import { executeCommand } from './connection';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Inicializa la base de datos ejecutando el script SQL
 */
export async function initDatabase(): Promise<void> {
  try {
    console.log('🔄 Inicializando base de datos Oracle...');
    
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );

    // Dividir el script en comandos individuales
    const commands = sqlScript
      .split(/;[\s]*\n/)
      .filter(cmd => cmd.trim().length > 0 && !cmd.trim().startsWith('--'));

    for (const command of commands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand) {
        try {
          await executeCommand(trimmedCommand, []);
          console.log('✅ Comando ejecutado correctamente');
        } catch (error: any) {
          // Ignorar errores de "objeto ya existe"
          if (error.errorNum !== 955 && error.errorNum !== 942) {
            console.error('Error ejecutando comando:', error.message);
          }
        }
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

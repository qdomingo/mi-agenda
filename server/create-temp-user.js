require('dotenv').config();
const oracledb = require('oracledb');

process.env.TNS_ADMIN = 'C:\\Users\\qdomi\\OneDrive\\Escritorio\\NuevasApps\\AppMiAgenda\\server\\wallet';

async function createTempUser() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });
    
    console.log('✅ Conectado a Oracle');
    
    // Verificar si el usuario existe
    const checkResult = await connection.execute(
      `SELECT id, email, nombre FROM mi_agenda_usuarios WHERE id = 'temp-user-123'`
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Usuario temporal ya existe:', checkResult.rows[0]);
    } else {
      console.log('❌ Usuario no encontrado, creándolo...');
      
      // Crear usuario temporal
      await connection.execute(
        `INSERT INTO mi_agenda_usuarios (id, email, nombre, password_hash)
         VALUES ('temp-user-123', 'demo@miagenda.com', 'Usuario Demo', 'temp-hash')`,
        [],
        { autoCommit: true }
      );
      
      console.log('✅ Usuario temporal creado exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.close();
      console.log('✅ Conexión cerrada');
    }
  }
}

createTempUser();

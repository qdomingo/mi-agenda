const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const oracledb = require('oracledb');

console.log('🔍 Diagnóstico de conexión Oracle\n');

console.log('📋 Variables de entorno:');
console.log('  ORACLE_USER:', process.env.ORACLE_USER);
console.log('  ORACLE_PASSWORD:', process.env.ORACLE_PASSWORD ? '***' + process.env.ORACLE_PASSWORD.slice(-3) : 'NO CONFIGURADA');
console.log('  ORACLE_CONNECT_STRING:', process.env.ORACLE_CONNECT_STRING);
console.log('  WALLET_LOCATION:', process.env.WALLET_LOCATION);
console.log('  WALLET_PASSWORD:', process.env.WALLET_PASSWORD ? '*** (configurada)' : 'NO CONFIGURADA');
console.log('  TNS_ADMIN (desde env):', process.env.TNS_ADMIN);

// Configurar TNS_ADMIN
if (process.env.WALLET_LOCATION) {
  process.env.TNS_ADMIN = path.normalize(process.env.WALLET_LOCATION);
  console.log('\n✅ TNS_ADMIN configurado desde WALLET_LOCATION');
} else {
  console.log('\n⚠️  WALLET_LOCATION no está configurado');
}

console.log('  TNS_ADMIN (final):', process.env.TNS_ADMIN);

async function testConnection() {
  let connection;
  
  try {
    console.log('\n🔌 Intentando conectar con oracledb.getConnection()...');
    
    const config = {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    };

    // En modo Thin, hay que pasar el wallet explícitamente
    if (process.env.WALLET_LOCATION) {
      const walletDir = path.normalize(process.env.WALLET_LOCATION);
      config.configDir = walletDir;
      config.walletLocation = walletDir;
      if (process.env.WALLET_PASSWORD) {
        config.walletPassword = process.env.WALLET_PASSWORD;
      }
    }
    
    console.log('📝 Configuración de conexión:');
    console.log('  user:', config.user);
    console.log('  password:', config.password ? '***' + config.password.slice(-3) : 'NO CONFIGURADA');
    console.log('  connectString:', config.connectString);
    if (config.configDir) console.log('  configDir:', config.configDir);
    if (config.walletLocation) console.log('  walletLocation:', config.walletLocation);
    if (config.walletPassword) console.log('  walletPassword: *** (configurada)');
    
    connection = await oracledb.getConnection(config);
    
    console.log('\n✅ ¡Conexión exitosa!');
    
    // Probar una query simple
    console.log('\n🧪 Probando query simple...');
    const result = await connection.execute('SELECT 1 as TEST FROM DUAL');
    console.log('✅ Query ejecutada:', result.rows);
    
    // Probar acceso a la tabla usuarios
    console.log('\n🧪 Probando acceso a mi_agenda_usuarios...');
    const countResult = await connection.execute('SELECT COUNT(*) as TOTAL FROM mi_agenda_usuarios');
    console.log('✅ Usuarios en la tabla:', countResult.rows[0]);
    
    console.log('\n🎉 ¡Todo funciona correctamente!');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:');
    console.error('  Código:', error.code);
    console.error('  Mensaje:', error.message);
    if (error.cause) {
      console.error('  Causa:', error.cause);
    }
    console.error('\nStack:', error.stack);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\n🔒 Conexión cerrada');
      } catch (err) {
        console.error('Error cerrando conexión:', err);
      }
    }
  }
}

testConnection();

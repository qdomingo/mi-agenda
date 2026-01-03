import oracledb from 'oracledb';
import path from 'path';

// Evitar que campos CLOB se devuelvan como objetos LOB (no serializables a JSON).
// Esto es clave porque `descripcion`/`notas` son CLOB en el esquema.
try {
  const clobType = (oracledb as any).CLOB ?? (oracledb as any).DB_TYPE_CLOB;
  if (clobType) {
    (oracledb as any).fetchAsString = [clobType];
  }
} catch {
  // No-op: si el driver no expone el tipo, seguimos sin configurar.
}

const walletLocation = process.env.WALLET_LOCATION
  ? path.normalize(process.env.WALLET_LOCATION)
  : undefined;
const walletPassword = process.env.WALLET_PASSWORD;

// Configurar Oracle client para usar el wallet
if (walletLocation) {
  process.env.TNS_ADMIN = walletLocation;
}

// Configuración de conexión
const dbConfig: any = {
  user: process.env.ORACLE_USER || 'ADMIN',
  password: process.env.ORACLE_PASSWORD || '',
  connectString: process.env.ORACLE_CONNECT_STRING || '',
};

// En modo Thin, TNS_ADMIN/sqlnet.ora no se usan automáticamente.
// Para ADB con wallet hay que indicar configDir y walletLocation explícitamente.
if (walletLocation) {
  dbConfig.configDir = walletLocation;
  dbConfig.walletLocation = walletLocation;
  // Some wallets (or key material inside them) require the wallet download password.
  // This is NOT the same as the database user password.
  if (walletPassword) {
    dbConfig.walletPassword = walletPassword;
  }
}

// Pool de conexiones
let pool: any = null;

/**
 * Inicializa el pool de conexiones
 */
export async function initializePool(): Promise<void> {
  try {
    pool = await oracledb.createPool({
      ...dbConfig,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
      queueTimeout: 120000, // 2 minutos
      poolTimeout: 60, // 60 segundos para conexiones inactivas
      enableStatistics: true,
    });
    console.log('✅ Oracle connection pool initialized');
  } catch (error) {
    console.error('❌ Error initializing Oracle pool:', error);
    throw error;
  }
}

/**
 * Obtiene una conexión del pool
 */
export async function getConnection(): Promise<any> {
  if (!pool) {
    await initializePool();
  }
  return pool!.getConnection();
}

/**
 * Cierra el pool de conexiones
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log('Oracle connection pool closed');
  }
}

/**
 * Ejecuta una query y retorna los resultados
 */
export async function executeQuery<T = any>(
  sql: string,
  binds: any = {},
  options: any = {}
): Promise<T[]> {
  let connection: any;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    });
    return (result.rows || []) as T[];
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

/**
 * Ejecuta un comando (INSERT, UPDATE, DELETE) y hace commit
 */
export async function executeCommand(
  sql: string,
  binds: any = {}
): Promise<any> {
  let connection: any;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, { autoCommit: true });
    return result;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export default {
  initializePool,
  getConnection,
  closePool,
  executeQuery,
  executeCommand,
};

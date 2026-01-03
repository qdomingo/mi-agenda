# Mi Agenda - Aplicación de Gestión Personal

Aplicación full-stack para gestionar agenda personal con eventos, contactos y tareas.

## 🛠️ Tecnologías

### Frontend
- React 19 con TypeScript
- Tailwind CSS
- React Router (para añadir)

### Backend
- Node.js con Express
- TypeScript
- Oracle Autonomous Database

## 📁 Estructura del Proyecto

```
AppMiAgenda/
├── client/              # Frontend React
│   ├── src/
│   ├── public/
│   └── package.json
├── server/              # Backend Express
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── .env                 # Variables de entorno
├── .gitignore
├── Procfile            # Para Heroku
└── package.json        # Root package
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd AppMiAgenda
```

### 2. Configurar variables de entorno
Edita el archivo `.env` con tus credenciales de Oracle (ATP) y JWT:

```env
# Oracle ATP
ORACLE_USER=ADMIN
ORACLE_PASSWORD=TU_PASSWORD_DB
ORACLE_CONNECT_STRING=tu_alias_de_tnsnames (ej: kbryvuiplud4wz9t_tpurgent)

# Wallet (carpeta donde están sqlnet.ora / tnsnames.ora)
WALLET_LOCATION=C:\\ruta\\a\\server\\wallet
WALLET_PASSWORD=PASSWORD_DESCARGA_WALLET (si aplica)

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_clave_secreta_segura
```

**Para Oracle Autonomous Database:**
1. Descarga el Wallet desde OCI Console
2. Extrae los archivos en `server/wallet/`
3. Usa el alias de `tnsnames.ora` como `ORACLE_CONNECT_STRING`

### 3. Instalar dependencias
```bash
npm run install-all
```

### 4. Base de datos
El esquema SQL está en `server/src/database/schema.sql`.

## 💻 Desarrollo

### Ejecutar en modo desarrollo (ambos servidores)

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev:client
```

El frontend estará en `http://localhost:3000` y hará proxy al backend en `http://localhost:5000`.

### Comandos útiles

```bash
# Instalar todas las dependencias
npm run install-all

# Desarrollo - Backend
npm run dev:server

# Desarrollo - Frontend  
npm run dev:client

# Build completo
npm run build:all

# Iniciar en producción
npm start
```

## 📦 Deploy a Heroku

Este repo está preparado para desplegar en **una sola app** (API + frontend estático). En producción, el backend sirve `client/build`.

### 1) Crear app
```bash
heroku create mi-agenda
```

### 2) Configurar variables (config vars)
```bash
heroku config:set NODE_ENV=production --app mi-agenda
heroku config:set JWT_SECRET=TU_SECRETO_LARGO --app mi-agenda

heroku config:set ORACLE_USER=ADMIN --app mi-agenda
heroku config:set ORACLE_PASSWORD=TU_PASSWORD_DB --app mi-agenda
heroku config:set ORACLE_CONNECT_STRING=tu_alias_de_tnsnames --app mi-agenda

# En Heroku usa ruta Linux (no uses rutas de Windows)
heroku config:set WALLET_LOCATION=/tmp/mi-agenda-wallet --app mi-agenda
heroku config:set WALLET_PASSWORD=PASSWORD_DESCARGA_WALLET --app mi-agenda
```

### 3) Subir el Wallet sin commitearlo (recomendado)
El wallet **no debe** subirse a git. Se inyecta como zip en base64 y el servidor lo descomprime en `prestart`.

Opción recomendada (troceado por límite de comandos en Windows):
```powershell
Compress-Archive -Path .\server\wallet\* -DestinationPath .\wallet.zip -Force
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\wallet.zip"))

$chunkSize = 3000
$chunks = [Math]::Ceiling($b64.Length / $chunkSize)

for ($i=0; $i -lt $chunks; $i++) {
   $part = $b64.Substring($i*$chunkSize, [Math]::Min($chunkSize, $b64.Length - $i*$chunkSize))
   $name = "WALLET_ZIP_BASE64_{0}" -f ($i+1)
   heroku config:set "$name=$part" --app mi-agenda
}
```

### 4) Deploy
```bash
git push heroku master
```

### 5) Verificar
```bash
heroku open --app mi-agenda
heroku logs --tail --app mi-agenda
```

## 🔁 Heroku mantenible (operación diaria)

- Actualizar con cambios: `git push heroku master`
- Ver logs: `heroku logs --tail --app mi-agenda`
- Ver variables: `heroku config --app mi-agenda`
- Reiniciar dyno: `heroku restart --app mi-agenda`

## 🗃️ Base de Datos - Oracle Autonomous

El esquema incluye:
- **Usuarios**: Gestión de usuarios con autenticación
- **Eventos**: Calendario de eventos con fecha/hora
- **Contactos**: Lista de contactos con información
- **Tareas**: Lista de tareas con prioridades

### Configuración de Oracle Autonomous Database

1. **Wallet Configuration**:
   - Crea carpeta: `mkdir server/wallet`
   - Descarga el wallet desde OCI Console
   - Extrae en `server/wallet/`

2. **Variables de entorno**:
   ```bash
   export TNS_ADMIN=/ruta/completa/a/server/wallet
   export LD_LIBRARY_PATH=/ruta/instantclient:$LD_LIBRARY_PATH
   ```

3. **Prisma Studio**:
   ```bash
   cd server
   npx prisma studio
   ```

## 🔐 Autenticación
Autenticación con JWT (register/login/me) usando `bcryptjs` + `jsonwebtoken`.

## 📝 Próximos pasos

1. Mejorar UX (edición avanzada, validación)
2. Añadir tests y CI
3. Mejorar observabilidad (logs estructurados)

## 🐛 Troubleshooting

### Error de conexión a Oracle
- Verifica `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING`
- Verifica `WALLET_LOCATION` y que el wallet se haya descomprimido correctamente
- Verifica que el wallet esté descomprimido correctamente

Nota: Este proyecto usa `oracledb` en modo Thin con wallet, no requiere Instant Client.

### Puerto en uso
Cambia el `PORT` en `.env` si el 5000 está ocupado.

### Build falla en Heroku
Asegúrate de tener el `Procfile` y los scripts `heroku-postbuild` configurados.

## 📄 Licencia

ISC

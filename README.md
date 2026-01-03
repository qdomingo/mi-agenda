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
- Prisma ORM
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
│   ├── prisma/
│   │   └── schema.prisma
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
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Oracle:
```env
DATABASE_URL="oracle://admin:tu_password@tu_connection_string"
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_segura
```

**Para Oracle Autonomous Database:**
1. Descarga el Wallet desde OCI Console
2. Extrae los archivos en `server/wallet/`
3. Configura `TNS_ADMIN` apuntando al wallet:
   ```bash
   export TNS_ADMIN=/ruta/a/server/wallet
   ```
4. Usa el connection string del archivo `tnsnames.ora`

### 3. Instalar dependencias
```bash
npm run install-all
```

### 4. Configurar la base de datos
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

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
npm run build

# Iniciar en producción
npm start
```

## 📦 Deploy a Heroku

### 1. Crear aplicación en Heroku
```bash
heroku create nombre-de-tu-app
```

### 2. Configurar Oracle Autonomous Database
```bash
# No se usa addon de Heroku, configura la conexión manual
heroku config:set DATABASE_URL="oracle://admin:password@connection_string"
heroku config:set TNS_ADMIN=/app/server/wallet
```

**Nota**: Deberás incluir el wallet en el repositorio o usar buildpack personalizado.

### 3. Configurar variables de entorno
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_clave_secreta_segura
```

### 4. Deploy
```bash
git push heroku main
```

### 5. Ejecutar migraciones
```bash
heroku run npm run prisma:migrate --prefix server
```

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

El proyecto está preparado para implementar JWT. Las dependencias ya están instaladas:
- `bcryptjs` para hash de passwords
- `jsonwebtoken` para tokens JWT

## 📝 Próximos pasos

1. Implementar autenticación (registro/login)
2. Crear componentes para Eventos, Contactos y Tareas
3. Añadir React Router para navegación
4. Implementar formularios con validación
5. Añadir filtros y búsqueda
6. Implementar notificaciones

## 🐛 Troubleshooting

### Error de conexión a Oracle
- Verifica que `DATABASE_URL` sea correcto
- Asegúrate de que `TNS_ADMIN` apunte al wallet
- Verifica que el wallet esté descomprimido correctamente
- Comprueba que Oracle Instant Client esté instalado

### Puerto en uso
Cambia el `PORT` en `.env` si el 5000 está ocupado.

### Build falla en Heroku
Asegúrate de tener el `Procfile` y los scripts `heroku-postbuild` configurados.

## 📄 Licencia

ISC

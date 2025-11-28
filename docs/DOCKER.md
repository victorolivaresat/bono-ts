# Bonos App - Docker

## 🚀 Inicio Rápido

### Opción 1: Con Docker Compose (Recomendado)

Incluye PostgreSQL y la aplicación:

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (limpieza completa)
docker-compose down -v
```

La aplicación estará disponible en: http://localhost:3000

### Opción 2: Solo Docker (BD externa)

Si ya tienes PostgreSQL corriendo:

```bash
# Construir la imagen
docker build -t bonos-app .

# Ejecutar el contenedor
docker run -d \
  --name bonos-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://usuario:password@host:5432/bonos_db" \
  -e NEXTAUTH_SECRET="tu-secret-key" \
  bonos-app
```

## 🔧 Variables de Entorno

Crea un archivo `.env.docker` para producción:

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/bonos_db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cambiar-esto-en-produccion
```

## 📦 Comandos Útiles

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de la app
docker logs -f bonos-app

# Ejecutar comandos dentro del contenedor
docker exec -it bonos-app sh

# Ejecutar migraciones manualmente
docker exec bonos-app npx prisma db push

# Rebuilder después de cambios
docker-compose up -d --build
```

## 🗄️ Base de Datos

- **Host:** postgres (en docker-compose) o tu host externo
- **Puerto:** 5432
- **Usuario:** postgres
- **Password:** password (cambiar en producción)
- **Base de datos:** bonos_db

### Migraciones de Base de Datos

#### Opción 1: Usando Docker Compose (Automático)

El contenedor ejecuta automáticamente las migraciones al iniciar:

```bash
docker-compose up -d
```

Esto ejecuta:

1. `prisma db push` - Sincroniza el schema con la BD
2. `prisma db seed` - Crea datos iniciales

#### Opción 2: Migraciones Manuales (Local)

Si tienes la BD en otro servidor y quieres migrar desde tu máquina:

```bash
# 1. Asegúrate de tener las variables en .env apuntando a tu BD
# DATABASE_URL=postgresql://usuario:password@host:puerto/base_de_datos

# 2. Sincronizar schema (sin archivos de migración)
npx prisma db push

# 3. Crear datos iniciales
npx prisma db seed

# O si prefieres crear archivos de migración:
npx prisma migrate dev --name init
```

#### Opción 3: Dentro del Contenedor

Si ya tienes el contenedor corriendo:

```bash
# Ejecutar migraciones dentro del contenedor
docker exec bonos-app npx prisma db push

# Ejecutar seed
docker exec bonos-app npx prisma db seed

# Ver el estado de las migraciones
docker exec bonos-app npx prisma migrate status
```

#### Opción 4: Base de Datos Externa (Producción)

Para una BD remota sin Docker:

```bash
# 1. Construir la imagen
docker build -t bonos-app .

# 2. Ejecutar solo las migraciones
docker run --rm \
  -e DATABASE_URL="postgresql://usuario:password@host:puerto/base_de_datos" \
  bonos-app \
  sh -c "npx prisma db push && npx prisma db seed"

# 3. Ejecutar la aplicación
docker run -d \
  --name bonos-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://usuario:password@host:puerto/base_de_datos" \
  -e NEXTAUTH_URL="https://tu-dominio.com" \
  -e NEXTAUTH_SECRET="tu-secret-key" \
  bonos-app
```

### Archivo de Migraciones SQL

Si prefieres revisar o ejecutar el SQL manualmente:

```bash
# Generar SQL de las migraciones (sin ejecutar)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

# Luego ejecuta el SQL en tu base de datos con tu cliente preferido
```

## 👤 Credenciales Iniciales

Después de ejecutar el seed:

- **Email:** admin@bonos.com
- **Password:** admin123

## 📝 Notas

- El contenedor ejecuta automáticamente `prisma db push` y `prisma db seed` al iniciar
- Los datos de PostgreSQL se persisten en un volumen Docker
- La aplicación usa Next.js en modo standalone para optimizar el tamaño de la imagen
- Para bases de datos remotas, configura `DATABASE_URL` en el `.env` antes de iniciar
- En producción, usa `prisma migrate deploy` en lugar de `prisma db push`

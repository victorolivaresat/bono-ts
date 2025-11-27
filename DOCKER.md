# Guía de Dockerización - Aplicación Bono-TS

## Descripción

Esta aplicación Next.js está completamente dockerizada y lista para desplegarse en cualquier servidor Linux. Incluye:

- ✅ Aplicación Next.js optimizada con multi-stage build
- ✅ Base de datos PostgreSQL 16
- ✅ Migraciones automáticas de Prisma
- ✅ Health checks integrados
- ✅ Configuración de producción
- ✅ Puerto configurado: **3070**

---

## Requisitos Previos

En tu servidor Linux, necesitas tener instalado:

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)

### Instalación de Docker en Linux

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker (opcional, evita usar sudo)
sudo usermod -aG docker $USER
```

---

## Configuración Inicial

### 1. Preparar Variables de Entorno

Copia el archivo de ejemplo y edítalo con tus valores:

```bash
cp .env.example .env
```

Edita el archivo `.env` y cambia estas variables:

```env
# IMPORTANTE: Genera un secret seguro con:
# openssl rand -base64 32
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"

# URL de tu servidor (cambia localhost por tu dominio o IP)
NEXTAUTH_URL="http://tu-servidor.com:3070"

# Base de datos (puedes dejar estos valores o cambiarlos)
DATABASE_URL="postgresql://bono_user:bono_password@db:5432/bono_db"
```

### 2. Generar Secret de NextAuth

```bash
# En tu servidor Linux, ejecuta:
openssl rand -base64 32
```

Copia el resultado y pégalo como valor de `NEXTAUTH_SECRET` en tu archivo `.env`.

---

## Despliegue

### Opción 1: Con Docker Compose (Recomendado)

#### Iniciar la aplicación

```bash
# Build y arrancar los contenedores
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app
```

#### Primera ejecución con seed

Si es la primera vez y quieres cargar datos de ejemplo:

```bash
# Edita docker-compose.yml y cambia:
# RUN_SEED=true

# Luego reinicia
docker-compose down
docker-compose up -d --build
```

### Opción 2: Solo con Docker

```bash
# 1. Crear red
docker network create bono-network

# 2. Iniciar PostgreSQL
docker run -d \
  --name bono-ts-db \
  --network bono-network \
  -e POSTGRES_USER=bono_user \
  -e POSTGRES_PASSWORD=bono_password \
  -e POSTGRES_DB=bono_db \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Build de la aplicación
docker build -t bono-ts-app .

# 4. Iniciar la aplicación
docker run -d \
  --name bono-ts-app \
  --network bono-network \
  -p 3070:3000 \
  -e DATABASE_URL=postgresql://bono_user:bono_password@db:5432/bono_db \
  -e NEXTAUTH_URL=http://localhost:3070 \
  -e NEXTAUTH_SECRET=tu-secret-aqui \
  bono-ts-app
```

---

## Comandos Útiles

### Ver estado de los contenedores

```bash
docker-compose ps
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo la aplicación
docker-compose logs -f app

# Solo la base de datos
docker-compose logs -f db
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo la app
docker-compose restart app
```

### Detener y eliminar contenedores

```bash
# Detener
docker-compose stop

# Detener y eliminar (mantiene volúmenes)
docker-compose down

# Detener, eliminar contenedores y volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v
```

### Ejecutar comandos dentro del contenedor

```bash
# Entrar a la terminal de la app
docker-compose exec app sh

# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy

# Ver logs de Prisma
docker-compose exec app npx prisma studio
```

### Backup de la base de datos

```bash
# Crear backup
docker-compose exec db pg_dump -U bono_user bono_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T db psql -U bono_user bono_db < backup_20241127_123456.sql
```

---

## Health Check

La aplicación incluye un endpoint de health check:

```bash
# Verificar estado
curl http://localhost:3070/api/health

# Respuesta esperada:
# {"status":"healthy","timestamp":"2024-11-27T..","database":"connected"}
```

---

## Acceso a la Aplicación

Una vez iniciado, accede a:

- **Aplicación**: http://localhost:3070
- **En servidor remoto**: http://tu-servidor-ip:3070

---

## Firewall (Si usas UFW en Linux)

```bash
# Permitir el puerto 3070
sudo ufw allow 3070/tcp

# Verificar
sudo ufw status
```

---

## Actualización de la Aplicación

```bash
# 1. Detener contenedores
docker-compose down

# 2. Obtener últimos cambios (si usas git)
git pull

# 3. Rebuild y reiniciar
docker-compose up -d --build

# 4. Verificar logs
docker-compose logs -f app
```

---

## Troubleshooting

### La aplicación no inicia

```bash
# Ver logs detallados
docker-compose logs app

# Verificar que PostgreSQL esté listo
docker-compose logs db
```

### Error de conexión a la base de datos

```bash
# Verificar que la URL de la BD sea correcta
docker-compose exec app printenv DATABASE_URL

# Reiniciar la base de datos
docker-compose restart db
```

### Puerto 3070 ya en uso

```bash
# Verificar qué usa el puerto
sudo lsof -i :3070

# O cambiar el puerto en docker-compose.yml:
# ports:
#   - "3060:3000"  # Cambiar 3070 por 3060
```

### Limpiar todo y empezar de cero

```bash
# CUIDADO: Esto elimina TODOS los datos
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## Monitoreo de Recursos

```bash
# Ver uso de recursos
docker stats

# Ver uso solo de la app
docker stats bono-ts-app
```

---

## Seguridad

### Recomendaciones para Producción:

1. **Cambia todas las contraseñas por defecto**
   - NEXTAUTH_SECRET
   - POSTGRES_PASSWORD
   - Credenciales de la base de datos

2. **Usa HTTPS con nginx/caddy como reverse proxy**

3. **No expongas el puerto 5432 de PostgreSQL** (quítalo del docker-compose.yml)

4. **Configura backups automáticos**

5. **Usa variables de entorno desde archivos seguros**, no hardcodeadas

---

## Soporte

Si tienes problemas:

1. Verifica los logs: `docker-compose logs -f`
2. Verifica el health check: `curl http://localhost:3070/api/health`
3. Verifica conexión a DB: `docker-compose exec app npx prisma db push --preview-feature`

---

## Cambiar de Puerto

Si quieres usar el puerto 3060 en lugar de 3070:

1. Edita `docker-compose.yml`:
   ```yaml
   ports:
     - "3060:3000"  # Cambiar 3070 por 3060
   ```

2. Edita `.env`:
   ```env
   NEXTAUTH_URL="http://tu-servidor:3060"
   ```

3. Reinicia:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

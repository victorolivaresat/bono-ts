# 🐳 Docker - Bono-TS

Aplicación Next.js dockerizada simple que se conecta a tu PostgreSQL existente.

## 🚀 Uso

### 1. Configurar `.env`

```bash
cp .env.example .env
nano .env
```

Edita con tus datos reales:
```env
# Para conectar desde el contenedor a PostgreSQL del host, usa:
# - host.docker.internal (recomendado en Docker 20.10+)
# - 172.17.0.1 (gateway por defecto)
# - IP real de tu servidor
DATABASE_URL="postgresql://tu_usuario:tu_password@host.docker.internal:5432/tu_bd"
NEXTAUTH_URL="http://tu-servidor:3070"
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"
```

### 2. Levantar

```bash
docker-compose up -d --build
```

### 3. Ver logs

```bash
docker-compose logs -f
```

### 4. Detener

```bash
docker-compose down
```

## 📝 Notas

- **Puerto expuesto:** `3070:3000` (línea 7 de docker-compose.yml)
- Para conectar a PostgreSQL del host desde el contenedor:
  - Usa `host.docker.internal` en DATABASE_URL (Docker 20.10+)
  - O usa `172.17.0.1` (gateway de Docker)
  - O usa la IP real del servidor
- Lee variables desde `.env` automáticamente
- PostgreSQL debe estar corriendo en el servidor

## ✅ Verificar

```bash
curl http://localhost:3070/api/health
```

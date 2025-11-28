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
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/tu_bd"
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

- Puerto: **3070** (mapea al 3000 interno)
- Usa `network_mode: host` para conectarse a PostgreSQL local
- Lee variables desde `.env` automáticamente
- PostgreSQL debe estar corriendo en el servidor

## ✅ Verificar

```bash
curl http://localhost:3070/api/health
```

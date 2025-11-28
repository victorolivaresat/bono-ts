# 🚀 Quick Start - Docker

Tu aplicación **Bono-TS** ya está completamente dockerizada con **pnpm**.

## ⚡ Inicio Rápido en Servidor Linux

### 1. Subir archivos al servidor

```bash
# En tu servidor Linux
cd /home/tu-usuario
git clone <tu-repositorio>  # O sube los archivos por SFTP/SCP
cd bono-ts
```

### 2. Configurar variables de entorno

```bash
# Copiar template
cp .env.example .env

# Generar secret seguro
openssl rand -base64 32

# Editar .env y pegar el secret generado
nano .env
```

**IMPORTANTE:** Cambia estos valores en `.env`:
```env
# Tu base de datos PostgreSQL existente
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/tu_base_datos"

# Secret generado
NEXTAUTH_SECRET="pega-aqui-el-secret-generado"

# URL de tu servidor
NEXTAUTH_URL="http://tu-servidor-ip:3070"
```

### 3. Dar permisos y desplegar

```bash
# Dar permisos a scripts
chmod +x deploy.sh docker-entrypoint.sh

# Iniciar aplicación
./deploy.sh start
```

### 4. Verificar que funciona

```bash
# Ver logs
./deploy.sh logs

# Verificar salud
curl http://localhost:3070/api/health
```

**¡Listo!** Tu aplicación está en: `http://tu-servidor-ip:3070`

---

## 🖥️ Probar Localmente en Windows

### Requisitos
- Tener **Docker Desktop** instalado y ejecutándose

### Pasos

1. **Iniciar Docker Desktop** (icono de Docker en la bandeja del sistema)

2. **Abrir terminal en el proyecto**
   ```bash
   cd C:\proyectos\bono-ts
   ```

3. **Configurar entorno**
   ```bash
   copy .env.example .env
   # Edita .env con tus valores
   ```

4. **Iniciar con Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

5. **Ver logs**
   ```bash
   docker-compose logs -f
   ```

6. **Acceder a la app**
   ```
   http://localhost:3070
   ```

---

## 📋 Comandos Útiles

```bash
./deploy.sh start    # Iniciar
./deploy.sh stop     # Detener
./deploy.sh restart  # Reiniciar
./deploy.sh logs     # Ver logs
./deploy.sh status   # Ver estado
./deploy.sh backup   # Backup de BD
./deploy.sh update   # Actualizar app
```

---

## 🔧 Cambiar Puerto

Para usar **3060** en lugar de **3070**:

1. Edita `docker-compose.yml`:
   ```yaml
   ports:
     - "3060:3000"  # Cambiar aquí
   ```

2. Edita `.env`:
   ```env
   NEXTAUTH_URL="http://localhost:3060"
   ```

3. Reinicia:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## 📚 Documentación Completa

Para más detalles, troubleshooting, backups y configuración avanzada:
- Ver **[DOCKER.md](./DOCKER.md)** - Documentación completa

---

## ⚠️ Importante para Producción

Antes de desplegar en producción:

1. ✅ Cambia `NEXTAUTH_SECRET` por uno generado con `openssl rand -base64 32`
2. ✅ Cambia las contraseñas de PostgreSQL en `docker-compose.yml`
3. ✅ Actualiza `NEXTAUTH_URL` con tu dominio real
4. ✅ Considera usar HTTPS con nginx/caddy como reverse proxy
5. ✅ Configura backups automáticos de la base de datos
6. ✅ No expongas el puerto 5432 de PostgreSQL (quítalo de docker-compose.yml)

---

## 🐛 Problemas Comunes

### Docker Desktop no está ejecutándose (Windows)
**Error:** `open //./pipe/dockerDesktopLinuxEngine: El sistema no puede encontrar...`

**Solución:** Inicia Docker Desktop desde el menú de Windows

### Puerto ya en uso
**Error:** `port is already allocated`

**Solución:** Cambia el puerto en `docker-compose.yml` o detén el proceso que lo usa

### Aplicación no inicia
```bash
# Ver logs para identificar el problema
docker-compose logs app

# Verificar PostgreSQL
docker-compose logs db
```

---

## 📞 Soporte

- **Logs:** `./deploy.sh logs` o `docker-compose logs -f`
- **Estado:** `./deploy.sh status`
- **Health:** `curl http://localhost:3070/api/health`
- **Documentación completa:** [DOCKER.md](./DOCKER.md)

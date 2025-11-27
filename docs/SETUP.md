# 🚀 Instrucciones de Configuración - Sistema de Gestión de Bonos

## ⚠️ PASOS OBLIGATORIOS ANTES DE EJECUTAR

### 1. Configurar Base de Datos PostgreSQL

Debes tener PostgreSQL instalado y ejecutándose. Luego crea la base de datos:

```bash
# En tu terminal de PostgreSQL o usando psql:
createdb bonos_db

# O si tienes credenciales específicas:
createdb -U tu_usuario bonos_db
```

### 2. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto con tus credenciales reales:

```env
# Database - REEMPLAZA CON TUS CREDENCIALES
DATABASE_URL="postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/bonos_db?schema=public"

# NextAuth - CAMBIA EL SECRET EN PRODUCCIÓN
NEXTAUTH_SECRET="tu-secreto-muy-seguro-cambialo-en-produccion"
NEXTAUTH_URL="http://localhost:3000"
```

**Ejemplo:**

```env
DATABASE_URL="postgresql://postgres:mipassword@localhost:5432/bonos_db?schema=public"
```

### 3. Generar Cliente de Prisma y Ejecutar Migraciones

```bash
# Genera el cliente de Prisma
npx prisma generate

# Ejecuta las migraciones para crear las tablas
npx prisma migrate dev --name init
```

### 4. Poblar la Base de Datos (Opcional pero Recomendado)

```bash
# Ejecuta el seed para crear usuario admin y bonos de ejemplo
pnpm db:seed
```

Esto creará:

- **Usuario Admin**:
  - Email: `admin@bonos.com`
  - Password: `admin123`
- **3 Bonos de ejemplo** para probar el sistema

### 5. Iniciar el Servidor

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📚 Guía de Uso

### Primera Vez

1. **Crear cuenta**: Ve a la página de inicio y haz clic en "Crear Cuenta"
2. **O usa el admin**: Si ejecutaste el seed, puedes usar `admin@bonos.com` / `admin123`
3. **Accede al dashboard**: Después de iniciar sesión serás redirigido al panel

### Gestión de Bonos

- **Crear bono**: Click en "Nuevo Bono"
- **Buscar**: Usa la barra de búsqueda para filtrar por nombre, ticket o documento
- **Filtrar**: Usa el selector de estado para ver solo bonos activos, cobrados, etc.
- **Editar**: Click en "Editar" en cualquier fila de la tabla
- **Eliminar**: Click en "Eliminar" (te pedirá confirmación)

---

## 🗄️ Comandos Útiles de Base de Datos

```bash
# Abrir Prisma Studio (interfaz visual de la BD)
pnpm db:studio

# Crear nueva migración después de cambios en schema.prisma
npx prisma migrate dev --name nombre_migracion

# Resetear la base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset

# Push cambios sin crear migración (desarrollo)
pnpm db:push

# Ver estado de migraciones
npx prisma migrate status
```

---

## 🔍 Verificar que Todo Funciona

### Checklist:

- [ ] PostgreSQL está ejecutándose
- [ ] Base de datos `bonos_db` existe
- [ ] Variables en `.env` están configuradas correctamente
- [ ] `npx prisma generate` ejecutado sin errores
- [ ] `npx prisma migrate dev --name init` completado
- [ ] (Opcional) `pnpm db:seed` ejecutado
- [ ] `pnpm dev` inicia sin errores
- [ ] Puedes acceder a http://localhost:3000
- [ ] Puedes iniciar sesión o crear una cuenta
- [ ] Puedes ver y crear bonos en el dashboard

---

## ❌ Solución de Problemas Comunes

### Error: "Can't reach database server"

- Verifica que PostgreSQL esté ejecutándose
- Verifica las credenciales en `DATABASE_URL`
- Asegúrate de que el puerto (5432) sea correcto

### Error: "PrismaClient is unable to run in the browser"

- Asegúrate de que los componentes del servidor no se marquen como "use client"
- El cliente de Prisma solo debe usarse en Server Components o API Routes

### Error: "Invalid credentials"

- Si usaste seed, las credenciales son: `admin@bonos.com` / `admin123`
- Si no, crea una cuenta nueva desde la página de registro

### Error en migraciones

```bash
# Resetea y vuelve a crear todo
npx prisma migrate reset
npx prisma generate
pnpm db:seed
```

---

## 📝 Estructura de la Base de Datos

### Tabla: User

- `id`: ID único del usuario
- `email`: Email único
- `password`: Contraseña hasheada
- `name`: Nombre del usuario
- `role`: Rol (user/admin)

### Tabla: Bono

- `id`: ID único del bono
- `clientName`: Nombre del cliente
- `ticketNumber`: Número de ticket (único)
- `documentType`: Tipo de documento (DNI, Pasaporte, etc.)
- `documentNumber`: Número de documento
- `phoneNumber`: Teléfono del cliente
- `startDate`: Fecha de inicio del bono
- `expirationDate`: Fecha de expiración
- `status`: Estado (activo, inactivo, cobrado, no_cobrado)
- `observations`: Observaciones opcionales
- `validatedBy`: ID del usuario que validó (relación con User)

---

## 🚀 Despliegue a Producción

### Consideraciones:

1. **Cambia `NEXTAUTH_SECRET`** en `.env` por algo seguro
2. **Usa una base de datos PostgreSQL en la nube** (Railway, Supabase, Neon, etc.)
3. **Actualiza `NEXTAUTH_URL`** con tu dominio de producción
4. **Ejecuta las migraciones** en producción:
   ```bash
   npx prisma migrate deploy
   ```

### Plataformas recomendadas:

- **Vercel** (Frontend + API Routes)
- **Railway** / **Render** (PostgreSQL + Full Stack)
- **Supabase** / **Neon** (Solo PostgreSQL)

---

## 📞 Soporte

Si tienes problemas, verifica:

1. Los logs en la terminal
2. La consola del navegador
3. Que todas las dependencias estén instaladas: `pnpm install`
4. Que PostgreSQL esté corriendo: `pg_ctl status` o `systemctl status postgresql`

---

¡Listo! Tu sistema de gestión de bonos está configurado y funcionando. 🎉

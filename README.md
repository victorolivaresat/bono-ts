# Sistema de Gestión de Bonos

Aplicación completa de gestión de bonos con autenticación, construida con Next.js 15, TypeScript, Prisma, PostgreSQL y shadcn/ui.

## 🚀 Características

- ✅ Sistema de autenticación completo (registro e inicio de sesión)
- ✅ Gestión CRUD de bonos
- ✅ Validación y seguimiento de bonos
- ✅ Panel de administración con filtros y búsqueda
- ✅ Interfaz moderna con shadcn/ui
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ Protección de rutas con middleware
- ✅ Formularios validados con Zod y React Hook Form

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL instalado y ejecutándose
- pnpm (recomendado) o npm

## ⚡ Inicio Rápido

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar PostgreSQL

Crea la base de datos:

```bash
createdb bonos_db
```

### 3. Configurar variables de entorno

Edita `.env` con tus credenciales de PostgreSQL:

```env
DATABASE_URL="postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/bonos_db?schema=public"
NEXTAUTH_SECRET="tu-secreto-muy-seguro"
```

### 4. Configurar Prisma

```bash
# Genera el cliente de Prisma
npx prisma generate

# Ejecuta las migraciones
npx prisma migrate dev --name init

# Opcional: Poblar con datos de ejemplo
pnpm db:seed
```

### 5. Iniciar la aplicación

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Scripts Disponibles

```bash
pnpm dev          # Modo desarrollo
pnpm build        # Build producción
pnpm start        # Ejecutar producción
pnpm lint         # Linter
pnpm db:push      # Push schema a BD (dev)
pnpm db:seed      # Poblar base de datos
pnpm db:studio    # Abrir Prisma Studio
```

## 📦 Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL + Prisma
- **Autenticación**: NextAuth v5
- **UI**: shadcn/ui + Tailwind CSS v4
- **Validación**: Zod + React Hook Form

## 🔒 Características de Seguridad

- Contraseñas hasheadas con bcryptjs
- Sesiones JWT seguras
- Validación de datos con Zod
- Rutas protegidas con middleware
- Variables de entorno para secretos

## 📄 Licencia

MIT

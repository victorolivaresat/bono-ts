# 📊 Modelos de Datos - Sistema de Gestión de Bonos

Este documento describe la estructura de la base de datos del sistema.

## 🗄️ Esquema de Base de Datos

### Modelo: User (Usuario)

Representa los usuarios del sistema que pueden autenticarse y gestionar bonos.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  validatedBonos Bono[] @relation("ValidatedBy")
}
```

**Campos:**

- `id`: Identificador único (CUID)
- `email`: Email único del usuario (usado para login)
- `password`: Contraseña hasheada con bcryptjs
- `name`: Nombre completo del usuario
- `role`: Rol del usuario (`user` o `admin`)
- `createdAt`: Fecha de creación del registro
- `updatedAt`: Fecha de última actualización
- `validatedBonos`: Relación con bonos que este usuario ha validado

---

### Modelo: Bono

Representa un bono otorgado a un cliente.

```prisma
model Bono {
  id                String   @id @default(cuid())
  clientName        String
  ticketNumber      String   @unique
  validatedBy       String?
  validatedByUser   User?    @relation("ValidatedBy", fields: [validatedBy], references: [id])
  status            String   @default("activo")
  documentNumber    String
  documentType      String
  phoneNumber       String
  startDate         DateTime
  expirationDate    DateTime
  observations      String?  @db.Text
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([ticketNumber])
  @@index([documentNumber])
  @@index([status])
}
```

**Campos:**

| Campo             | Tipo     | Descripción                                     | Requerido  | Único |
| ----------------- | -------- | ----------------------------------------------- | ---------- | ----- |
| `id`              | String   | Identificador único (CUID)                      | Sí         | Sí    |
| `clientName`      | String   | Nombre completo del cliente                     | Sí         | No    |
| `ticketNumber`    | String   | Número de ticket del bono                       | Sí         | Sí    |
| `documentType`    | String   | Tipo de documento (DNI, Pasaporte, RUC, Cédula) | Sí         | No    |
| `documentNumber`  | String   | Número del documento de identidad               | Sí         | No    |
| `phoneNumber`     | String   | Número de teléfono del cliente                  | Sí         | No    |
| `startDate`       | DateTime | Fecha de inicio de validez del bono             | Sí         | No    |
| `expirationDate`  | DateTime | Fecha de expiración del bono                    | Sí         | No    |
| `status`          | String   | Estado del bono (ver abajo)                     | Sí         | No    |
| `observations`    | String   | Notas u observaciones adicionales               | No         | No    |
| `validatedBy`     | String   | ID del usuario que validó el bono               | No         | No    |
| `validatedByUser` | User     | Relación con el usuario validador               | No         | No    |
| `createdAt`       | DateTime | Fecha de creación del registro                  | Automático | No    |
| `updatedAt`       | DateTime | Fecha de última actualización                   | Automático | No    |

**Estados posibles del bono:**

- `activo`: Bono activo y disponible para usar
- `inactivo`: Bono desactivado temporalmente
- `cobrado`: Bono ya fue cobrado/utilizado
- `no_cobrado`: Bono no ha sido cobrado aún

**Índices:**

- Índice en `ticketNumber` para búsquedas rápidas
- Índice en `documentNumber` para búsquedas por documento
- Índice en `status` para filtros por estado

---

## 🔗 Relaciones

### User → Bono (Uno a Muchos)

Un usuario puede validar múltiples bonos, pero cada bono es validado por un solo usuario (o ninguno).

```typescript
// Obtener un usuario con todos sus bonos validados
const userWithBonos = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    validatedBonos: true,
  },
});

// Obtener un bono con el usuario que lo validó
const bonoWithValidator = await prisma.bono.findUnique({
  where: { id: bonoId },
  include: {
    validatedByUser: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});
```

---

## 📝 Ejemplos de Uso

### Crear un nuevo bono

```typescript
const newBono = await prisma.bono.create({
  data: {
    clientName: "Juan Pérez",
    ticketNumber: "TKT-2024-001",
    documentType: "DNI",
    documentNumber: "12345678",
    phoneNumber: "+51 999 888 777",
    startDate: new Date("2024-01-01"),
    expirationDate: new Date("2024-12-31"),
    status: "activo",
    observations: "Bono promocional",
    validatedBy: userId,
  },
});
```

### Buscar bonos con filtros

```typescript
// Buscar bonos activos que expiran pronto
const expiringBonos = await prisma.bono.findMany({
  where: {
    status: "activo",
    expirationDate: {
      gte: new Date(),
      lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    },
  },
  include: {
    validatedByUser: {
      select: {
        name: true,
        email: true,
      },
    },
  },
  orderBy: {
    expirationDate: "asc",
  },
});
```

### Actualizar el estado de un bono

```typescript
const updatedBono = await prisma.bono.update({
  where: { id: bonoId },
  data: {
    status: "cobrado",
    observations: "Cobrado el 15/05/2024",
  },
});
```

### Buscar por número de ticket

```typescript
const bono = await prisma.bono.findUnique({
  where: { ticketNumber: "TKT-2024-001" },
  include: {
    validatedByUser: true,
  },
});
```

---

## 🔐 Consideraciones de Seguridad

1. **Contraseñas**: Siempre se almacenan hasheadas con bcryptjs
2. **Validación**: Todos los datos se validan con Zod antes de guardarse
3. **Relaciones**: El campo `validatedBy` puede ser null si el bono no ha sido validado
4. **Índices**: Se usan índices para mejorar el rendimiento de las búsquedas

---

## 🚀 Migración de Datos

Si necesitas migrar datos existentes, puedes usar el siguiente script como referencia:

```typescript
// scripts/migrate-bonos.ts
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

async function migrate() {
  const csv = readFileSync("bonos.csv", "utf-8");
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of records) {
    await prisma.bono.create({
      data: {
        clientName: record.clientName,
        ticketNumber: record.ticketNumber,
        documentType: record.documentType,
        documentNumber: record.documentNumber,
        phoneNumber: record.phoneNumber,
        startDate: new Date(record.startDate),
        expirationDate: new Date(record.expirationDate),
        status: record.status,
        observations: record.observations,
      },
    });
  }
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 📊 Estadísticas Útiles

### Contar bonos por estado

```typescript
const stats = await prisma.bono.groupBy({
  by: ["status"],
  _count: true,
});
```

### Bonos próximos a expirar

```typescript
const expiringSoon = await prisma.bono.count({
  where: {
    status: "activo",
    expirationDate: {
      lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    },
  },
});
```

### Usuario con más bonos validados

```typescript
const topValidator = await prisma.user.findFirst({
  include: {
    _count: {
      select: { validatedBonos: true },
    },
  },
  orderBy: {
    validatedBonos: {
      _count: "desc",
    },
  },
});
```

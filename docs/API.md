# 🔌 Documentación de API - Sistema de Gestión de Bonos

Este documento describe todos los endpoints disponibles en la API.

## 🔐 Autenticación

Todos los endpoints (excepto `/api/register` y `/api/auth/*`) requieren autenticación mediante sesión.

---

## 📍 Endpoints de Autenticación

### Registro de Usuario

```http
POST /api/register
```

**Body:**

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (201):**

```json
{
  "id": "clxxx...",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "role": "user",
  "createdAt": "2024-11-27T10:00:00.000Z"
}
```

**Errores:**

- `400`: Usuario ya existe o datos inválidos
- `500`: Error del servidor

---

### Iniciar Sesión

```http
POST /api/auth/callback/credentials
```

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

Usa el hook `signIn` de NextAuth en el cliente:

```typescript
import { signIn } from "next-auth/react";

const result = await signIn("credentials", {
  email: "juan@example.com",
  password: "password123",
  redirect: false,
});

if (result?.error) {
  console.error("Login failed");
} else {
  console.log("Login successful");
}
```

---

### Cerrar Sesión

```http
POST /api/auth/signout
```

Usa el hook `signOut` de NextAuth:

```typescript
import { signOut } from "next-auth/react";

await signOut({ callbackUrl: "/login" });
```

---

## 🎟️ Endpoints de Bonos

### Listar Bonos

```http
GET /api/bonos
```

**Query Parameters:**

- `status` (opcional): Filtrar por estado (`activo`, `inactivo`, `cobrado`, `no_cobrado`)
- `search` (opcional): Buscar por nombre, ticket o documento

**Ejemplos:**

```bash
# Todos los bonos
GET /api/bonos

# Bonos activos
GET /api/bonos?status=activo

# Buscar por nombre
GET /api/bonos?search=Juan

# Combinar filtros
GET /api/bonos?status=activo&search=TKT-001
```

**Respuesta exitosa (200):**

```json
[
  {
    "id": "clxxx...",
    "clientName": "Juan Pérez García",
    "ticketNumber": "TKT-2024-001",
    "documentType": "DNI",
    "documentNumber": "12345678",
    "phoneNumber": "+51 999 888 777",
    "startDate": "2024-01-01T00:00:00.000Z",
    "expirationDate": "2024-12-31T00:00:00.000Z",
    "status": "activo",
    "observations": "Bono promocional",
    "validatedBy": "clyyy...",
    "validatedByUser": {
      "id": "clyyy...",
      "name": "Admin",
      "email": "admin@bonos.com"
    },
    "createdAt": "2024-11-27T10:00:00.000Z",
    "updatedAt": "2024-11-27T10:00:00.000Z"
  }
]
```

---

### Obtener Bono por ID

```http
GET /api/bonos/:id
```

**Ejemplo:**

```bash
GET /api/bonos/clxxx...
```

**Respuesta exitosa (200):**

```json
{
  "id": "clxxx...",
  "clientName": "Juan Pérez García",
  "ticketNumber": "TKT-2024-001",
  "documentType": "DNI",
  "documentNumber": "12345678",
  "phoneNumber": "+51 999 888 777",
  "startDate": "2024-01-01T00:00:00.000Z",
  "expirationDate": "2024-12-31T00:00:00.000Z",
  "status": "activo",
  "observations": "Bono promocional",
  "validatedBy": "clyyy...",
  "validatedByUser": {
    "id": "clyyy...",
    "name": "Admin",
    "email": "admin@bonos.com"
  },
  "createdAt": "2024-11-27T10:00:00.000Z",
  "updatedAt": "2024-11-27T10:00:00.000Z"
}
```

**Errores:**

- `404`: Bono no encontrado
- `401`: No autenticado

---

### Crear Bono

```http
POST /api/bonos
```

**Body:**

```json
{
  "clientName": "María López",
  "ticketNumber": "TKT-2024-002",
  "documentType": "DNI",
  "documentNumber": "87654321",
  "phoneNumber": "+51 988 777 666",
  "startDate": "2024-11-27",
  "expirationDate": "2025-11-27",
  "status": "activo",
  "observations": "Bono por referido",
  "validatedBy": "clyyy..."
}
```

**Campos requeridos:**

- `clientName`: String (mínimo 1 carácter)
- `ticketNumber`: String único (mínimo 1 carácter)
- `documentType`: String (DNI, Pasaporte, Cédula, RUC)
- `documentNumber`: String (mínimo 1 carácter)
- `phoneNumber`: String (mínimo 1 carácter)
- `startDate`: String en formato ISO (YYYY-MM-DD)
- `expirationDate`: String en formato ISO (YYYY-MM-DD)
- `status`: Enum ("activo", "inactivo", "cobrado", "no_cobrado")

**Campos opcionales:**

- `observations`: String
- `validatedBy`: String (ID del usuario)

**Respuesta exitosa (201):**

```json
{
  "id": "clzzz...",
  "clientName": "María López",
  "ticketNumber": "TKT-2024-002",
  "documentType": "DNI",
  "documentNumber": "87654321",
  "phoneNumber": "+51 988 777 666",
  "startDate": "2024-11-27T00:00:00.000Z",
  "expirationDate": "2025-11-27T00:00:00.000Z",
  "status": "activo",
  "observations": "Bono por referido",
  "validatedBy": "clyyy...",
  "validatedByUser": {
    "id": "clyyy...",
    "name": "Admin",
    "email": "admin@bonos.com"
  },
  "createdAt": "2024-11-27T11:00:00.000Z",
  "updatedAt": "2024-11-27T11:00:00.000Z"
}
```

**Errores:**

- `400`: Datos inválidos o ticket duplicado
- `401`: No autenticado

---

### Actualizar Bono

```http
PATCH /api/bonos/:id
```

**Body (todos los campos son opcionales):**

```json
{
  "status": "cobrado",
  "observations": "Cobrado el 27/11/2024"
}
```

**Campos actualizables:**

- `clientName`
- `ticketNumber`
- `documentType`
- `documentNumber`
- `phoneNumber`
- `startDate`
- `expirationDate`
- `status`
- `observations`
- `validatedBy`

**Ejemplo de actualización de estado:**

```bash
PATCH /api/bonos/clxxx...
Content-Type: application/json

{
  "status": "cobrado"
}
```

**Respuesta exitosa (200):**

```json
{
  "id": "clxxx...",
  "clientName": "Juan Pérez García",
  "ticketNumber": "TKT-2024-001",
  "status": "cobrado",
  "observations": "Cobrado el 27/11/2024",
  "updatedAt": "2024-11-27T12:00:00.000Z",
  ...
}
```

**Errores:**

- `400`: Datos inválidos
- `404`: Bono no encontrado
- `401`: No autenticado

---

### Eliminar Bono

```http
DELETE /api/bonos/:id
```

**Ejemplo:**

```bash
DELETE /api/bonos/clxxx...
```

**Respuesta exitosa (200):**

```json
{
  "message": "Bono eliminado correctamente"
}
```

**Errores:**

- `404`: Bono no encontrado
- `401`: No autenticado

---

## 📝 Ejemplos de Uso con JavaScript/TypeScript

### Crear un bono

```typescript
async function createBono(data: BonoData) {
  const response = await fetch("/api/bonos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear bono");
  }

  return await response.json();
}

// Uso
const newBono = await createBono({
  clientName: "Carlos Rodríguez",
  ticketNumber: "TKT-2024-003",
  documentType: "DNI",
  documentNumber: "11223344",
  phoneNumber: "+51 977 666 555",
  startDate: "2024-11-27",
  expirationDate: "2025-05-27",
  status: "activo",
});
```

### Obtener bonos con filtro

```typescript
async function getBonos(filters?: { status?: string; search?: string }) {
  const params = new URLSearchParams();

  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const response = await fetch(`/api/bonos?${params}`);

  if (!response.ok) {
    throw new Error("Error al obtener bonos");
  }

  return await response.json();
}

// Uso
const activeBonos = await getBonos({ status: "activo" });
const searchResults = await getBonos({ search: "Juan" });
```

### Actualizar un bono

```typescript
async function updateBono(id: string, updates: Partial<BonoData>) {
  const response = await fetch(`/api/bonos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar bono");
  }

  return await response.json();
}

// Uso
const updated = await updateBono("clxxx...", {
  status: "cobrado",
  observations: "Cobrado en sucursal principal",
});
```

### Eliminar un bono

```typescript
async function deleteBono(id: string) {
  const response = await fetch(`/api/bonos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al eliminar bono");
  }

  return await response.json();
}

// Uso
await deleteBono("clxxx...");
```

---

## 🔍 Validación de Datos

Todos los endpoints validan los datos usando Zod. Los errores de validación devuelven:

```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "El nombre del cliente es requerido",
      "path": ["clientName"]
    }
  ]
}
```

---

## 🚦 Códigos de Estado HTTP

| Código | Significado           |
| ------ | --------------------- |
| `200`  | Éxito                 |
| `201`  | Recurso creado        |
| `400`  | Petición inválida     |
| `401`  | No autenticado        |
| `404`  | Recurso no encontrado |
| `500`  | Error del servidor    |

---

## 🔒 Seguridad

1. **Autenticación requerida**: Todos los endpoints de bonos requieren sesión activa
2. **Validación de datos**: Zod valida todos los inputs
3. **Unicidad de tickets**: Los números de ticket deben ser únicos
4. **SQL Injection**: Prisma protege contra inyecciones SQL
5. **XSS**: Next.js escapa automáticamente las salidas

---

## 📊 Rate Limiting

Actualmente no hay rate limiting implementado. Para producción, considera agregar:

```typescript
// middleware.ts
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de peticiones
});
```

---

## 🧪 Testing

Ejemplos de tests con fetch o libraries como axios:

```typescript
describe("API Bonos", () => {
  it("debe crear un bono", async () => {
    const response = await fetch("/api/bonos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: "Test User",
        ticketNumber: "TKT-TEST-001",
        // ... otros campos
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.ticketNumber).toBe("TKT-TEST-001");
  });
});
```

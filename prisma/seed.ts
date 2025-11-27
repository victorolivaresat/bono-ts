import bcrypt from "bcryptjs";
import { Client } from "pg";
import "dotenv/config";

async function seed() {
  console.log("🌱 Iniciando seed...");

  const dbUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/bonos_db";

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log("✅ Conectado a la base de datos");

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const userResult = await client.query(
      `
      INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET id = "User".id
      RETURNING id
    `,
      [
        "admin-" + Date.now(),
        "admin@bonos.com",
        hashedPassword,
        "Administrador",
        "admin",
      ]
    );

    const userId = userResult.rows[0].id;
    console.log("✅ Usuario administrador creado: admin@bonos.com");

    // Crear tipos de bonos
    const tiposBonos = [];

    const tipo1 = await client.query(
      `
      INSERT INTO "TipoBono" (
        id, nombre, descripcion, "fechaInicio", "fechaFin",
        activo, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (nombre) DO UPDATE SET id = "TipoBono".id
      RETURNING id
    `,
      [
        "tipo1-" + Date.now(),
        "Bono Apertura Cuenta",
        "Bono promocional por apertura de cuenta nueva",
        "2024-01-01",
        "2024-12-31",
        true,
      ]
    );
    tiposBonos.push(tipo1.rows[0].id);
    console.log(`✅ Tipo de bono creado: Bono Apertura Cuenta`);

    const tipo2 = await client.query(
      `
      INSERT INTO "TipoBono" (
        id, nombre, descripcion, "fechaInicio", "fechaFin",
        activo, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (nombre) DO UPDATE SET id = "TipoBono".id
      RETURNING id
    `,
      [
        "tipo2-" + Date.now(),
        "Bono Referido",
        "Bono por traer nuevos clientes",
        "2024-01-01",
        "2024-12-31",
        true,
      ]
    );
    tiposBonos.push(tipo2.rows[0].id);
    console.log(`✅ Tipo de bono creado: Bono Referido`);

    const tipo3 = await client.query(
      `
      INSERT INTO "TipoBono" (
        id, nombre, descripcion, "fechaInicio", "fechaFin",
        activo, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (nombre) DO UPDATE SET id = "TipoBono".id
      RETURNING id
    `,
      [
        "tipo3-" + Date.now(),
        "Bono Premium",
        "Bono por compra de productos premium",
        "2024-03-01",
        "2024-09-30",
        true,
      ]
    );
    tiposBonos.push(tipo3.rows[0].id);
    console.log(`✅ Tipo de bono creado: Bono Premium`);

    // Crear bonos asignados de ejemplo
    const bonosAsignados = [
      {
        id: "bono1-" + Date.now(),
        ticketNumber: "TKT-2024-001",
        tipoBonoId: tiposBonos[0],
        clientName: "Juan Pérez García",
        documentType: "DNI",
        documentNumber: "12345678",
        phoneNumber: "+51 999 888 777",
        status: "activo",
        observations: "Cliente frecuente",
        validatedBy: null,
      },
      {
        id: "bono2-" + Date.now() + 1,
        ticketNumber: "TKT-2024-002",
        tipoBonoId: tiposBonos[1],
        clientName: "María López Sánchez",
        documentType: "DNI",
        documentNumber: "87654321",
        phoneNumber: "+51 988 777 666",
        status: "cobrado",
        observations: "Referido por Juan Pérez",
        validatedBy: userId,
        validatedAt: "2024-02-20",
      },
      {
        id: "bono3-" + Date.now() + 2,
        ticketNumber: "TKT-2024-003",
        tipoBonoId: tiposBonos[2],
        clientName: "Carlos Rodríguez Martínez",
        documentType: "Pasaporte",
        documentNumber: "AB123456",
        phoneNumber: "+51 977 666 555",
        status: "activo",
        observations: "Compra en tienda física",
        validatedBy: null,
      },
    ];

    for (const bono of bonosAsignados) {
      await client.query(
        `
        INSERT INTO "BonoAsignado" (
          id, "ticketNumber", "tipoBonoId", "clientName",
          "documentType", "documentNumber", "phoneNumber",
          status, observations, "validatedBy", "validatedAt",
          "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        ON CONFLICT ("documentType", "documentNumber") DO NOTHING
      `,
        [
          bono.id,
          bono.ticketNumber,
          bono.tipoBonoId,
          bono.clientName,
          bono.documentType,
          bono.documentNumber,
          bono.phoneNumber,
          bono.status,
          bono.observations,
          bono.validatedBy,
          bono.validatedAt || null,
        ]
      );
      console.log(`✅ Bono asignado creado: ${bono.ticketNumber}`);
    }

    console.log("\n📝 Credenciales de acceso:");
    console.log("  Email: admin@bonos.com");
    console.log("  Password: admin123");
    console.log("\n✨ Seed completado exitosamente!");
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();

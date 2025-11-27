import bcrypt from "bcryptjs";
import { Client } from "pg";
import "dotenv/config";

async function seed() {
  const dbUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/bonos_db";

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();

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
        "prevencion@apuestatotal.com",
        hashedPassword,
        "Administrador",
        "admin",
      ]
    );

    console.log(
      `Usuario admin creado o ya existente: ${userResult.rows[0].id}`
    );
  } catch (error) {
    console.error("Error en seed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();

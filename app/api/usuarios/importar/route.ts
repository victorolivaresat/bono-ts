import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se ha proporcionado ningún archivo" },
        { status: 400 }
      );
    }

    // Leer el archivo
    const buffer = await file.arrayBuffer();
    let data: any[];

    // Detectar si es CSV o Excel
    if (file.name.endsWith(".csv")) {
      const text = new TextDecoder().decode(buffer);
      const workbook = XLSX.read(text, { type: "string" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    } else {
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: "El archivo está vacío" },
        { status: 400 }
      );
    }

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 porque empieza en 1 y la primera fila es encabezado

      try {
        // Convertir todos los campos a string para evitar problemas con tipos
        const nombre = String(row.nombre || "").trim();
        const email = String(row.email || "").trim();
        const password = String(row.password || "").trim();
        const rol = String(row.rol || "").trim();

        // Validar campos requeridos
        if (!nombre || !email || !password || !rol) {
          errors.push(
            `Fila ${rowNumber}: Faltan campos requeridos (nombre, email, password, rol)`
          );
          errorCount++;
          continue;
        }

        // Validar rol
        if (rol !== "user" && rol !== "admin") {
          errors.push(`Fila ${rowNumber}: El rol debe ser 'user' o 'admin'`);
          errorCount++;
          continue;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`Fila ${rowNumber}: Email inválido (${email})`);
          errorCount++;
          continue;
        }

        // Verificar si el email ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          errors.push(
            `Fila ${rowNumber}: Ya existe un usuario con el email ${email}`
          );
          errorCount++;
          continue;
        }

        // Hash de la contraseña (ahora password es string)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        await prisma.user.create({
          data: {
            name: nombre,
            email: email,
            password: hashedPassword,
            role: rol,
          },
        });

        processedCount++;
      } catch (error) {
        console.error(`Error en fila ${rowNumber}:`, error);
        errors.push(
          `Fila ${rowNumber}: Error al procesar - ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
        errorCount++;
      }
    }

    return NextResponse.json({
      processedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing users:", error);
    return NextResponse.json(
      { error: "Error al importar usuarios" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Crear datos de ejemplo para la plantilla
    const data = [
      {
        nombre: "Juan Pérez",
        email: "juan.perez@example.com",
        password: "password123",
        rol: "user",
      },
      {
        nombre: "María García",
        email: "maria.garcia@example.com",
        password: "password456",
        rol: "admin",
      },
    ];

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Retornar archivo
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=plantilla_usuarios.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Error al generar la plantilla" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Crear datos de ejemplo para la plantilla
    const data = [
      {
        cliente: "Juan Pérez",
        dni: "12345678",
        tipo_documento: "DNI",
        telefono: "999888777",
      },
      {
        cliente: "María García",
        dni: "87654321",
        tipo_documento: "DNI",
        telefono: "988777666",
      },
    ];

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bonos");

    // Ajustar ancho de columnas
    worksheet["!cols"] = [
      { wch: 20 }, // cliente
      { wch: 12 }, // dni
      { wch: 18 }, // tipo_documento
      { wch: 12 }, // telefono
    ];

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Retornar el archivo como respuesta
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=plantilla_bonos.xlsx",
      },
    });
  } catch (error) {
    console.error("Error al generar plantilla:", error);
    return NextResponse.json(
      { error: "Error al generar la plantilla" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import * as XLSX from "xlsx";

interface ExcelRow {
  cliente?: string;
  dni?: string;
  tipo_documento?: string;
  tipo_bono?: string;
  telefono?: string;
  observaciones?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipoBonoId = formData.get("tipoBonoId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    if (!tipoBonoId) {
      return NextResponse.json(
        { error: "Debe seleccionar un tipo de bono" },
        { status: 400 }
      );
    }

    // Verificar que sea un archivo Excel
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "El archivo debe ser un Excel (.xlsx o .xls)" },
        { status: 400 }
      );
    }

    // Leer el archivo Excel
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "El archivo Excel está vacío" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const bonos: Array<{ id: string; ticketNumber: string | null }> = [];
    let processedCount = 0;
    let errorCount = 0;

    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 porque Excel empieza en 1 y tiene header

      try {
        // Convertir todos los campos a string para evitar problemas con tipos
        const cliente = String(row.cliente || "").trim();
        const dni = String(row.dni || "").trim();
        const tipoDocumento = String(row.tipo_documento || "").trim();
        const telefono = row.telefono
          ? String(row.telefono).trim()
          : "Sin teléfono";
        const observaciones = row.observaciones
          ? String(row.observaciones).trim()
          : null;

        // Validar campos requeridos
        if (!cliente || !dni || !tipoDocumento) {
          errors.push(
            `Fila ${rowNumber}: Faltan campos requeridos (cliente, dni, tipo_documento)`
          );
          errorCount++;
          continue;
        }

        // Verificar si ya existe un bono con la misma combinación de documentType y documentNumber
        const existingBono = await prisma.bonoAsignado.findUnique({
          where: {
            documentType_documentNumber: {
              documentType: tipoDocumento,
              documentNumber: dni,
            },
          },
        });

        if (existingBono) {
          errors.push(
            `Fila ${rowNumber}: Ya existe un bono para ${tipoDocumento} ${dni}`
          );
          errorCount++;
          continue;
        }

        // Generar ticket number único
        const ticketNumber = `TKT-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Crear el bono asignado
        const bono = await prisma.bonoAsignado.create({
          data: {
            clientName: cliente,
            ticketNumber: ticketNumber,
            tipoBonoId: tipoBonoId,
            documentNumber: dni,
            documentType: tipoDocumento,
            phoneNumber: telefono,
            status: "activo",
            observations: observaciones,
          },
        });

        bonos.push(bono);
        processedCount++;
      } catch (error) {
        errorCount++;
        errors.push(
          `Fila ${rowNumber}: Error al procesar - ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${processedCount} bonos correctamente`,
      processedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      bonos,
    });
  } catch (error) {
    console.error("Error al procesar archivo Excel:", error);
    return NextResponse.json(
      {
        error: "Error al procesar el archivo Excel",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

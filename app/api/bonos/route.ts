import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const bonoSchema = z.object({
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  ticketNumber: z.string().optional(),
  tipoBonoId: z.string().min(1, "El tipo de bono es requerido"),
  documentNumber: z.string().min(1, "El número de documento es requerido"),
  documentType: z.string().min(1, "El tipo de documento es requerido"),
  phoneNumber: z.string().min(1, "El número de teléfono es requerido"),
  status: z.enum(["cobrado", "no_cobrado", "activo", "inactivo"]),
  observations: z.string().optional(),
  validatedBy: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: {
      status?: string;
      OR?: Array<{
        clientName?: { contains: string; mode: "insensitive" };
        ticketNumber?: { contains: string; mode: "insensitive" };
        documentNumber?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { documentNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const bonos = await prisma.bonoAsignado.findMany({
      where,
      include: {
        tipoBono: true,
        validatedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bonos);
  } catch (error) {
    console.error("Error fetching bonos:", error);
    return NextResponse.json(
      { error: "Error al obtener los bonos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = bonoSchema.parse(body);

    // Verificar si ya existe un bono con la misma combinación de documentType y documentNumber
    const existingBono = await prisma.bonoAsignado.findUnique({
      where: {
        documentType_documentNumber: {
          documentType: validated.documentType,
          documentNumber: validated.documentNumber,
        },
      },
    });

    if (existingBono) {
      return NextResponse.json(
        {
          error: `Ya existe un bono asignado para ${validated.documentType} ${validated.documentNumber}`,
        },
        { status: 400 }
      );
    }

    // Solo usar ticketNumber si se proporciona, de lo contrario guardar como null
    const ticketNumber = validated.ticketNumber || null;

    const bono = await prisma.bonoAsignado.create({
      data: {
        clientName: validated.clientName,
        ticketNumber,
        tipoBonoId: validated.tipoBonoId,
        documentNumber: validated.documentNumber,
        documentType: validated.documentType,
        phoneNumber: validated.phoneNumber,
        status: validated.status,
        observations: validated.observations,
        validatedBy: validated.validatedBy,
      },
      include: {
        tipoBono: true,
        validatedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(bono, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating bono:", error);
    return NextResponse.json(
      { error: "Error al crear el bono" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const tipoBonoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  fechaInicio: z.string(),
  fechaFin: z.string(),
  activo: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const tiposBonos = await prisma.tipoBono.findMany({
      include: {
        _count: {
          select: { bonosAsignados: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tiposBonos);
  } catch (error) {
    console.error("Error fetching tipos de bonos:", error);
    return NextResponse.json(
      { error: "Error al obtener los tipos de bonos" },
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
    const validated = tipoBonoSchema.parse(body);

    const tipoBono = await prisma.tipoBono.create({
      data: {
        nombre: validated.nombre,
        descripcion: validated.descripcion,
        fechaInicio: new Date(validated.fechaInicio),
        fechaFin: new Date(validated.fechaFin),
        activo: validated.activo,
      },
    });

    return NextResponse.json(tipoBono, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating tipo bono:", error);
    return NextResponse.json(
      { error: "Error al crear el tipo de bono" },
      { status: 500 }
    );
  }
}

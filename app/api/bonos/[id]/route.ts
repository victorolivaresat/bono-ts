import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const bonoUpdateSchema = z.object({
  clientName: z.string().min(1).optional(),
  ticketNumber: z.string().min(1).optional(),
  tipoBonoId: z.string().optional(),
  documentNumber: z.string().min(1).optional(),
  documentType: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  status: z.enum(["cobrado", "no_cobrado", "activo", "inactivo"]).optional(),
  observations: z.string().optional(),
  validatedBy: z.string().optional(),
  validatedAt: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const bono = await prisma.bonoAsignado.findUnique({
      where: { id },
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

    if (!bono) {
      return NextResponse.json(
        { error: "Bono no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(bono);
  } catch (error) {
    console.error("Error fetching bono:", error);
    return NextResponse.json(
      { error: "Error al obtener el bono" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = bonoUpdateSchema.parse(body);

    const updateData: {
      clientName?: string;
      ticketNumber?: string;
      tipoBonoId?: string;
      documentNumber?: string;
      documentType?: string;
      phoneNumber?: string;
      status?: "cobrado" | "no_cobrado" | "activo" | "inactivo";
      observations?: string;
      validatedBy?: string;
      validatedAt?: Date | string;
    } = { ...validated };

    if (validated.validatedAt) {
      updateData.validatedAt = new Date(validated.validatedAt);
    }

    const bono = await prisma.bonoAsignado.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(bono);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating bono:", error);
    return NextResponse.json(
      { error: "Error al actualizar el bono" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.bonoAsignado.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Bono eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting bono:", error);
    return NextResponse.json(
      { error: "Error al eliminar el bono" },
      { status: 500 }
    );
  }
}

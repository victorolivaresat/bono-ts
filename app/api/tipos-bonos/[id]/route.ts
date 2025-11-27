import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const tipoBonoUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  activo: z.boolean().optional(),
});

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
    const validated = tipoBonoUpdateSchema.parse(body);

    const updateData: {
      nombre?: string;
      descripcion?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
      activo?: boolean;
    } = {};

    if (validated.nombre) updateData.nombre = validated.nombre;
    if (validated.descripcion !== undefined)
      updateData.descripcion = validated.descripcion;
    if (validated.fechaInicio)
      updateData.fechaInicio = new Date(validated.fechaInicio);
    if (validated.fechaFin) updateData.fechaFin = new Date(validated.fechaFin);
    if (validated.activo !== undefined) updateData.activo = validated.activo;

    const tipoBono = await prisma.tipoBono.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(tipoBono);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating tipo bono:", error);
    return NextResponse.json(
      { error: "Error al actualizar el tipo de bono" },
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

    await prisma.tipoBono.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Tipo de bono eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting tipo bono:", error);
    return NextResponse.json(
      { error: "Error al eliminar el tipo de bono" },
      { status: 500 }
    );
  }
}

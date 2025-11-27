import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get("documentType");
    const documentNumber = searchParams.get("documentNumber");

    if (!documentType || !documentNumber) {
      return NextResponse.json(
        { error: "Tipo de documento y número son requeridos" },
        { status: 400 }
      );
    }

    const bono = await prisma.bonoAsignado.findFirst({
      where: {
        documentType,
        documentNumber,
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
      orderBy: {
        createdAt: "desc", // Retorna el más reciente si hay varios
      },
    });

    if (!bono) {
      return NextResponse.json(
        { error: "No se encontró ningún bono" },
        { status: 404 }
      );
    }

    return NextResponse.json(bono);
  } catch (error) {
    console.error("Error en búsqueda de bono:", error);
    return NextResponse.json(
      { error: "Error al buscar el bono" },
      { status: 500 }
    );
  }
}

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoBono" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoBono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonoAsignado" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "tipoBonoId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'activo',
    "observations" TEXT,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonoAsignado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TipoBono_nombre_key" ON "TipoBono"("nombre");

-- CreateIndex
CREATE INDEX "TipoBono_activo_idx" ON "TipoBono"("activo");

-- CreateIndex
CREATE INDEX "TipoBono_nombre_idx" ON "TipoBono"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "BonoAsignado_ticketNumber_key" ON "BonoAsignado"("ticketNumber");

-- CreateIndex
CREATE INDEX "BonoAsignado_ticketNumber_idx" ON "BonoAsignado"("ticketNumber");

-- CreateIndex
CREATE INDEX "BonoAsignado_documentNumber_idx" ON "BonoAsignado"("documentNumber");

-- CreateIndex
CREATE INDEX "BonoAsignado_status_idx" ON "BonoAsignado"("status");

-- CreateIndex
CREATE INDEX "BonoAsignado_tipoBonoId_idx" ON "BonoAsignado"("tipoBonoId");

-- AddForeignKey
ALTER TABLE "BonoAsignado" ADD CONSTRAINT "BonoAsignado_tipoBonoId_fkey" FOREIGN KEY ("tipoBonoId") REFERENCES "TipoBono"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonoAsignado" ADD CONSTRAINT "BonoAsignado_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

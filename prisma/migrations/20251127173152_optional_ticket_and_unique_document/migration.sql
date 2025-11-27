/*
  Warnings:

  - A unique constraint covering the columns `[documentType,documentNumber]` on the table `BonoAsignado` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BonoAsignado_ticketNumber_key";

-- AlterTable
ALTER TABLE "BonoAsignado" ALTER COLUMN "ticketNumber" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BonoAsignado_documentType_documentNumber_key" ON "BonoAsignado"("documentType", "documentNumber");

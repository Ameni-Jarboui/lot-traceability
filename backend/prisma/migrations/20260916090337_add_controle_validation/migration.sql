/*
  Warnings:

  - Made the column `operateurId` on table `Controle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Controle" DROP CONSTRAINT "Controle_operateurId_fkey";

-- AlterTable
ALTER TABLE "Controle" ADD COLUMN     "valide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "valideParId" TEXT,
ALTER COLUMN "operateurId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Controle" ADD CONSTRAINT "Controle_operateurId_fkey" FOREIGN KEY ("operateurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

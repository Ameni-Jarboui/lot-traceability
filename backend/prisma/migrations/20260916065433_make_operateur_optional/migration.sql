-- DropForeignKey
ALTER TABLE "Controle" DROP CONSTRAINT "Controle_operateurId_fkey";

-- AlterTable
ALTER TABLE "Controle" ALTER COLUMN "operateurId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Controle" ADD CONSTRAINT "Controle_operateurId_fkey" FOREIGN KEY ("operateurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

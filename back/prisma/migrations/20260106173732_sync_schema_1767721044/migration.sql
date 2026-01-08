/*
  Warnings:

  - A unique constraint covering the columns `[id_taller]` on the table `Assistencia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institucio]` on the table `Inscripcions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coordinador]` on the table `Inscripcions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[responsable]` on the table `Institucions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tallerista]` on the table `Tallers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Usuaris` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documents` to the `Inscripcions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contacte` to the `Institucions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Usuaris` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Usuaris` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inscripcions` ADD COLUMN `documents` TEXT NULL,
    ADD COLUMN `estat` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `Institucions` ADD COLUMN `codi_centre` VARCHAR(191) NULL,
    ADD COLUMN `contacte` VARCHAR(191) NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `Tallers` ADD COLUMN `admet_insc` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `Usuaris` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `token` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Assistencia_id_taller_key` ON `Assistencia`(`id_taller`);

-- CreateIndex
CREATE UNIQUE INDEX `Inscripcions_institucio_key` ON `Inscripcions`(`institucio`);

-- CreateIndex
CREATE UNIQUE INDEX `Inscripcions_coordinador_key` ON `Inscripcions`(`coordinador`);

-- CreateIndex
CREATE UNIQUE INDEX `Institucions_responsable_key` ON `Institucions`(`responsable`);

-- CreateIndex
CREATE UNIQUE INDEX `Tallers_tallerista_key` ON `Tallers`(`tallerista`);

-- CreateIndex
CREATE UNIQUE INDEX `Usuaris_email_key` ON `Usuaris`(`email`);

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_tallerista_fkey` FOREIGN KEY (`tallerista`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Institucions` ADD CONSTRAINT `Institucions_responsable_fkey` FOREIGN KEY (`responsable`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_coordinador_fkey` FOREIGN KEY (`coordinador`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assistencia` ADD CONSTRAINT `Assistencia_id_taller_fkey` FOREIGN KEY (`id_taller`) REFERENCES `Tallers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to alter the column `curs` on the `Tallers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[id_taller]` on the table `Assistencia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institucio]` on the table `Inscripcions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coordinador]` on the table `Inscripcions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[responsable]` on the table `Institucions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tallerista]` on the table `Tallers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Usuaris` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documents` to the `Inscripcions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taller_id` to the `Inscripcions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contacte` to the `Institucions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Usuaris` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Usuaris` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inscripcions` ADD COLUMN `documents` TEXT NOT NULL,
    ADD COLUMN `estat` BOOLEAN NULL,
    ADD COLUMN `puntuacio` DOUBLE NULL,
    ADD COLUMN `taller_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Institucions` ADD COLUMN `codi_centre` VARCHAR(191) NULL,
    ADD COLUMN `contacte` VARCHAR(191) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `Tallers` ADD COLUMN `admet_insc` BOOLEAN NULL,
    MODIFY `curs` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Usuaris` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `token` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Periodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataIni` DATETIME(3) NOT NULL,
    `dataFi` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Historic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_institucio` INTEGER NOT NULL,
    `periode` INTEGER NOT NULL,
    `assistencia` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_curs_fkey` FOREIGN KEY (`curs`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_tallerista_fkey` FOREIGN KEY (`tallerista`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Institucions` ADD CONSTRAINT `Institucions_responsable_fkey` FOREIGN KEY (`responsable`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_taller_id_fkey` FOREIGN KEY (`taller_id`) REFERENCES `Tallers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_coordinador_fkey` FOREIGN KEY (`coordinador`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assistencia` ADD CONSTRAINT `Assistencia_id_taller_fkey` FOREIGN KEY (`id_taller`) REFERENCES `Tallers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historic` ADD CONSTRAINT `Historic_id_institucio_fkey` FOREIGN KEY (`id_institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historic` ADD CONSTRAINT `Historic_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

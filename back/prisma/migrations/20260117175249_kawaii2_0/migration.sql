/*
  Warnings:

  - You are about to drop the column `coordinador` on the `Inscripcions` table. All the data in the column will be lost.
  - You are about to drop the column `trimestre` on the `Inscripcions` table. All the data in the column will be lost.
  - You are about to drop the column `contacte` on the `Institucions` table. All the data in the column will be lost.
  - You are about to drop the column `responsable` on the `Institucions` table. All the data in the column will be lost.
  - You are about to drop the column `tipus` on the `Institucions` table. All the data in the column will be lost.
  - You are about to drop the column `curs` on the `Tallers` table. All the data in the column will be lost.
  - You are about to drop the column `duracio` on the `Tallers` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `Tallers` table. All the data in the column will be lost.
  - The values [D] on the enum `Tallers_modalitat` will be removed. If these variants are still used in the database, this will fail.
  - The values [Extern] on the enum `Usuaris_rol` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `periode` to the `Inscripcions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codi_postal` to the `Institucions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccio` to the `Institucions` table without a default value. This is not possible if the table is not empty.
  - Made the column `codi_centre` on table `Institucions` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `admin` to the `Tallers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periode` to the `Tallers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefon` to the `Usuaris` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Inscripcions` DROP FOREIGN KEY `Inscripcions_coordinador_fkey`;

-- DropForeignKey
ALTER TABLE `Inscripcions` DROP FOREIGN KEY `Inscripcions_institucio_fkey`;

-- DropForeignKey
ALTER TABLE `Institucions` DROP FOREIGN KEY `Institucions_responsable_fkey`;

-- DropForeignKey
ALTER TABLE `Tallers` DROP FOREIGN KEY `Tallers_curs_fkey`;

-- DropForeignKey
ALTER TABLE `Tallers` DROP FOREIGN KEY `Tallers_tallerista_fkey`;

-- DropIndex
DROP INDEX `Inscripcions_coordinador_key` ON `Inscripcions`;

-- DropIndex
DROP INDEX `Inscripcions_institucio_key` ON `Inscripcions`;

-- DropIndex
DROP INDEX `Institucions_responsable_key` ON `Institucions`;

-- DropIndex
DROP INDEX `Tallers_curs_fkey` ON `Tallers`;

-- DropIndex
DROP INDEX `Tallers_tallerista_key` ON `Tallers`;

-- AlterTable
ALTER TABLE `Inscripcions` DROP COLUMN `coordinador`,
    DROP COLUMN `trimestre`,
    ADD COLUMN `periode` INTEGER NOT NULL,
    MODIFY `referents` TEXT NULL,
    MODIFY `docents_referents` VARCHAR(191) NULL,
    MODIFY `comentari` TEXT NULL,
    MODIFY `documents` TEXT NULL,
    MODIFY `autoritzat` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Institucions` DROP COLUMN `contacte`,
    DROP COLUMN `responsable`,
    DROP COLUMN `tipus`,
    ADD COLUMN `codi_postal` VARCHAR(191) NOT NULL,
    ADD COLUMN `direccio` VARCHAR(191) NOT NULL,
    MODIFY `codi_centre` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Tallers` DROP COLUMN `curs`,
    DROP COLUMN `duracio`,
    DROP COLUMN `target`,
    ADD COLUMN `admin` INTEGER NOT NULL,
    ADD COLUMN `periode` INTEGER NOT NULL,
    MODIFY `tallerista` VARCHAR(191) NOT NULL,
    MODIFY `modalitat` ENUM('A', 'B', 'C') NOT NULL;

-- AlterTable
ALTER TABLE `Usuaris` ADD COLUMN `telefon` INTEGER NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `rol` ENUM('Admin', 'Professorat') NOT NULL,
    MODIFY `institucio` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_admin_fkey` FOREIGN KEY (`admin`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuaris` ADD CONSTRAINT `Usuaris_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

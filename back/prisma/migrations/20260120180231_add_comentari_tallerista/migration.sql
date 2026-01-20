-- AlterTable
ALTER TABLE `Tallers` ADD COLUMN `comentari_profe` TEXT NULL,
    ADD COLUMN `comentari_tallerista` VARCHAR(191) NULL,
    ADD COLUMN `mailTallerista` VARCHAR(191) NULL;

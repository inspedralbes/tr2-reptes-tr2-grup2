-- DropForeignKey
ALTER TABLE `Assistencia` DROP FOREIGN KEY `Assistencia_id_taller_fkey`;

-- DropIndex
DROP INDEX `Assistencia_id_taller_key` ON `Assistencia`;

-- AlterTable
ALTER TABLE `Tallers` ADD COLUMN `comentari_profe` TEXT NULL,
    ADD COLUMN `comentari_tallerista` VARCHAR(191) NULL,
    ADD COLUMN `imatge` VARCHAR(191) NULL,
    ADD COLUMN `mailTallerista` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CriterisWeights` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `criteri` VARCHAR(191) NOT NULL,
    `pes` INTEGER NOT NULL DEFAULT 20,
    `periode` INTEGER NULL,
    `dataActualitzacio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CriterisWeights_criteri_key`(`criteri`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `selectedPeriodeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
-- ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CriterisWeights` ADD CONSTRAINT `CriterisWeights_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SystemSettings` ADD CONSTRAINT `SystemSettings_selectedPeriodeId_fkey` FOREIGN KEY (`selectedPeriodeId`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

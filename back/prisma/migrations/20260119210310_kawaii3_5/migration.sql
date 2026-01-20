-- DropForeignKey
ALTER TABLE `Inscripcions` DROP FOREIGN KEY `Inscripcions_taller_id_fkey`;

-- DropIndex
DROP INDEX `Inscripcions_taller_id_fkey` ON `Inscripcions`;

-- AlterTable
ALTER TABLE `Inscripcions` ADD COLUMN `NE` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `taller_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_taller_id_fkey` FOREIGN KEY (`taller_id`) REFERENCES `Tallers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

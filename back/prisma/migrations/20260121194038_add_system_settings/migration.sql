-- CreateTable
CREATE TABLE `SystemSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `selectedPeriodeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SystemSettings` ADD CONSTRAINT `SystemSettings_selectedPeriodeId_fkey` FOREIGN KEY (`selectedPeriodeId`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

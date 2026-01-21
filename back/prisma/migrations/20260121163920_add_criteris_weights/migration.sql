-- CreateTable
CREATE TABLE `CriterisWeights` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `criterio` VARCHAR(191) NOT NULL,
    `peso` INTEGER NOT NULL DEFAULT 20,
    `periode` INTEGER NULL,
    `fechaActualizacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CriterisWeights_criterio_key`(`criterio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CriterisWeights` ADD CONSTRAINT `CriterisWeights_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

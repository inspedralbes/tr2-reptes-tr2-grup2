-- AlterTable
ALTER TABLE `CriterisWeights` 
DROP INDEX `CriterisWeights_criterio_key`,
CHANGE COLUMN `criterio` `criteri` VARCHAR(191) NOT NULL,
CHANGE COLUMN `peso` `pes` INT NOT NULL DEFAULT 20,
CHANGE COLUMN `fechaActualizacion` `dataActualitzacio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
ADD CONSTRAINT `CriterisWeights_criteri_key` UNIQUE KEY (`criteri`);

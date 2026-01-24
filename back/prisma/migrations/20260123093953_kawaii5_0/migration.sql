-- AddForeignKey
ALTER TABLE `Assistencia` ADD CONSTRAINT `Assistencia_id_taller_fkey` FOREIGN KEY (`id_taller`) REFERENCES `Tallers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

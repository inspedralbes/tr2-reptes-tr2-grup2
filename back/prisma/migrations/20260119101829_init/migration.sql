-- CreateTable
CREATE TABLE `Tallers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `descripcio` TEXT NOT NULL,
    `institucio` INTEGER NOT NULL,
    `tallerista` VARCHAR(191) NOT NULL,
    `places_max` INTEGER NOT NULL,
    `places_disp` INTEGER NOT NULL,
    `modalitat` ENUM('A', 'B', 'C') NOT NULL,
    `direccio` VARCHAR(191) NOT NULL,
    `horari` TEXT NOT NULL,
    `periode` INTEGER NOT NULL,
    `autoritzat` BOOLEAN NOT NULL DEFAULT false,
    `admin` INTEGER NOT NULL,
    `admet_insc` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Institucions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `codi_centre` VARCHAR(191) NOT NULL,
    `direccio` VARCHAR(191) NOT NULL,
    `codi_postal` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscripcions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `institucio` INTEGER NOT NULL,
    `primera_vegada` BOOLEAN NOT NULL,
    `periode` INTEGER NOT NULL,
    `alumnes` TEXT NOT NULL,
    `referents` TEXT NULL,
    `docents_referents` VARCHAR(191) NULL,
    `comentari` TEXT NULL,
    `documents` TEXT NULL,
    `autoritzat` BOOLEAN NOT NULL DEFAULT false,
    `estat` BOOLEAN NULL,
    `puntuacio` DOUBLE NULL,
    `NE` BOOLEAN NOT NULL DEFAULT false,
    `taller_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuaris` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `telefon` INTEGER NOT NULL,
    `token` VARCHAR(191) NULL,
    `rol` ENUM('Admin', 'Professorat') NOT NULL,
    `institucio` INTEGER NULL,
    `autoritzat` BOOLEAN NOT NULL,
    `responsable` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Usuaris_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assistencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_taller` INTEGER NOT NULL,
    `dia` DATETIME(3) NOT NULL,
    `llista_alumnes` TEXT NOT NULL,
    `llista_professors` TEXT NOT NULL,
    `autoritzat` BOOLEAN NOT NULL,

    UNIQUE INDEX `Assistencia_id_taller_key`(`id_taller`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_admin_fkey` FOREIGN KEY (`admin`) REFERENCES `Usuaris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tallers` ADD CONSTRAINT `Tallers_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_taller_id_fkey` FOREIGN KEY (`taller_id`) REFERENCES `Tallers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcions` ADD CONSTRAINT `Inscripcions_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuaris` ADD CONSTRAINT `Usuaris_institucio_fkey` FOREIGN KEY (`institucio`) REFERENCES `Institucions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assistencia` ADD CONSTRAINT `Assistencia_id_taller_fkey` FOREIGN KEY (`id_taller`) REFERENCES `Tallers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historic` ADD CONSTRAINT `Historic_id_institucio_fkey` FOREIGN KEY (`id_institucio`) REFERENCES `Institucions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historic` ADD CONSTRAINT `Historic_periode_fkey` FOREIGN KEY (`periode`) REFERENCES `Periodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

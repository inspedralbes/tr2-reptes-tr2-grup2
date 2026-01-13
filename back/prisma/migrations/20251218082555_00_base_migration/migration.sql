-- CreateTable
CREATE TABLE `Tallers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `descripcio` TEXT NOT NULL,
    `target` ENUM('Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres') NOT NULL,
    `institucio` INTEGER NOT NULL,
    `tallerista` INTEGER NOT NULL,
    `places_max` INTEGER NOT NULL,
    `places_disp` INTEGER NOT NULL,
    `duracio` INTEGER NOT NULL,
    `modalitat` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `direccio` VARCHAR(191) NOT NULL,
    `horari` TEXT NOT NULL,
    `curs` VARCHAR(191) NOT NULL,
    `autoritzat` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Institucions` (
    `id` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `tipus` ENUM('CentreEducatiu', 'AgentExtern') NOT NULL,
    `responsable` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscripcions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `institucio` INTEGER NOT NULL,
    `coordinador` INTEGER NOT NULL,
    `primera_vegada` BOOLEAN NOT NULL,
    `trimestre` ENUM('Primer', 'Segon', 'Tercer') NOT NULL,
    `alumnes` TEXT NOT NULL,
    `referents` TEXT NOT NULL,
    `docents_referents` VARCHAR(191) NOT NULL,
    `comentari` TEXT NOT NULL,
    `autoritzat` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuaris` (
    `id` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `rol` ENUM('Admin', 'Professorat', 'Extern') NOT NULL,
    `institucio` INTEGER NOT NULL,
    `autoritzat` BOOLEAN NOT NULL,

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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

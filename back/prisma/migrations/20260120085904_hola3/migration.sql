/*
  Warnings:

  - A unique constraint covering the columns `[codi_centre]` on the table `Institucions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Institucions_codi_centre_key` ON `Institucions`(`codi_centre`);

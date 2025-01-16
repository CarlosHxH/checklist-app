-- DropForeignKey
ALTER TABLE `inspection` DROP FOREIGN KEY `Inspection_userId_fkey`;

-- DropForeignKey
ALTER TABLE `inspection` DROP FOREIGN KEY `Inspection_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `vehiclekey` DROP FOREIGN KEY `vehicleKey_userId_fkey`;

-- DropForeignKey
ALTER TABLE `vehiclekey` DROP FOREIGN KEY `vehicleKey_vehicleId_fkey`;

-- DropIndex
DROP INDEX `vehicleKey_userId_fkey` ON `vehiclekey`;

-- DropIndex
DROP INDEX `vehicleKey_vehicleId_fkey` ON `vehiclekey`;

-- AlterTable
ALTER TABLE `inspection` MODIFY `fotoVeiculo` MEDIUMTEXT NULL;

-- AddForeignKey
ALTER TABLE `vehicleKey` ADD CONSTRAINT `vehicleKey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicleKey` ADD CONSTRAINT `vehicleKey_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inspection` ADD CONSTRAINT `Inspection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inspection` ADD CONSTRAINT `Inspection_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `inspection` RENAME INDEX `Inspection_userId_fkey` TO `Inspection_userId_idx`;

-- RenameIndex
ALTER TABLE `inspection` RENAME INDEX `Inspection_vehicleId_fkey` TO `Inspection_vehicleId_idx`;

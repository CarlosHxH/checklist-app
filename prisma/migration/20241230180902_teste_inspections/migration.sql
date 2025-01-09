-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "dataInspecao" DATETIME NOT NULL,
    "crlvEmDia" TEXT NOT NULL,
    "certificadoTacografoEmDia" TEXT NOT NULL,
    "nivelAgua" TEXT NOT NULL,
    "nivelOleo" TEXT NOT NULL,
    "eixo" TEXT NOT NULL,
    "dianteira" TEXT,
    "descricaoDianteira" TEXT,
    "tracao" TEXT,
    "descricaoTracao" TEXT,
    "truck" TEXT,
    "descricaoTruck" TEXT,
    "quartoEixo" TEXT,
    "descricaoQuartoEixo" TEXT,
    "avariasCabine" TEXT,
    "descricaoAvariasCabine" TEXT,
    "bauPossuiAvarias" TEXT,
    "descricaoAvariasBau" TEXT,
    "funcionamentoParteEletrica" TEXT,
    "descricaoParteEletrica" TEXT,
    "fotoVeiculo" TEXT,
    CONSTRAINT "Inspection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inspection_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Inspection" ("avariasCabine", "bauPossuiAvarias", "certificadoTacografoEmDia", "crlvEmDia", "dataInspecao", "descricaoAvariasBau", "descricaoAvariasCabine", "descricaoDianteira", "descricaoParteEletrica", "descricaoQuartoEixo", "descricaoTracao", "descricaoTruck", "dianteira", "eixo", "fotoVeiculo", "funcionamentoParteEletrica", "id", "nivelAgua", "nivelOleo", "quartoEixo", "tracao", "truck", "userId", "vehicleId") SELECT "avariasCabine", "bauPossuiAvarias", "certificadoTacografoEmDia", "crlvEmDia", "dataInspecao", "descricaoAvariasBau", "descricaoAvariasCabine", "descricaoDianteira", "descricaoParteEletrica", "descricaoQuartoEixo", "descricaoTracao", "descricaoTruck", "dianteira", "eixo", "fotoVeiculo", "funcionamentoParteEletrica", "id", "nivelAgua", "nivelOleo", "quartoEixo", "tracao", "truck", "userId", "vehicleId" FROM "Inspection";
DROP TABLE "Inspection";
ALTER TABLE "new_Inspection" RENAME TO "Inspection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs'

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.inspection.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  // Criação de um usuário e veículo para associar à inspeção
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: await hash('#5s2024@', 12),
        name: 'Administrador',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'driver1@gmail.com',
        password: await hash('password123', 12),
        name: 'João Silva',
        role: 'DRIVER',
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'driver2@gmail.com',
        password: await hash('password123', 12),
        name: 'Maria Santos',
        role: 'DRIVER',
        emailVerified: new Date(),
      },
    }),
  ])

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        make: 'FIAT',
        model: 'Fiorino',
        year: '2022',
        eixo: '1',
        licensePlate: 'HGF9I05'
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Volkswagem',
        model: 'Express',
        year: '2021',
        eixo: '2',
        licensePlate: 'XYZ9Q87'
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Mercedes',
        model: 'Truck',
        year: '2021',
        eixo: '3',
        licensePlate: 'KYZ1W87'
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Mercedes-Benz',
        model: 'Bi-truck',
        year: '2021',
        eixo: '4',
        licensePlate: 'GYH9A17'
      },
    }),
  ])

  const data = {
    userId: "cm56qvyq00002hsvs15o2e7xj",
    vehicleId: "cm56utvk10006hsc0roitlqpp",
    dataInspecao: "2024-12-27T19:30:21.018Z",
    crlvEmDia: "SIM",
    certificadoTacografoEmDia: "SIM",
    nivelAgua: "Normal",
    nivelOleo: "Normal",
    eixo: 4,
    dianteira: "RUIM",
    descricaoDianteira: "11111111",
    tracao: "RUIM",
    descricaoTracao: "22222222222",
    truck: "RUIM",
    descricaoTruck: "3333333333",
    quartoEixo: "RUIM",
    descricaoQuartoEixo: "44444444444",
    avariasCabine: "SIM",
    descricaoAvariasCabine: "000000",
    bauPossuiAvarias: "SIM",
    descricaoAvariasBau: "99999999999",
    funcionamentoParteEletrica: "RUIM",
    descricaoParteEletrica: "888888888888"
  }
  // Criação de uma inspeção
  const inspection = await Promise.all([
    prisma.inspection.create({
      data: {
        userId: users[1].id,
        vehicleId: vehicles[0].id,
        dataInspecao: new Date(),
        crlvEmDia: "SIM",
        certificadoTacografoEmDia: "SIM",
        nivelAgua: "Normal",
        nivelOleo: "Normal",
        eixo: 4,
        dianteira: "RUIM",
        descricaoDianteira: "11111111",
        tracao: "RUIM",
        descricaoTracao: "22222222222",
        truck: "RUIM",
        descricaoTruck: "3333333333",
        quartoEixo: "RUIM",
        descricaoQuartoEixo: "44444444444",
        avariasCabine: "SIM",
        descricaoAvariasCabine: "000000",
        bauPossuiAvarias: "SIM",
        descricaoAvariasBau: "99999999999",
        funcionamentoParteEletrica: "RUIM",
        descricaoParteEletrica: "888888888888",
        fotoVeiculo:"",
      },
    }),
  ])

  console.log({ inspection });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
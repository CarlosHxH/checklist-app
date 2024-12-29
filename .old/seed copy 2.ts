
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const password = await bcrypt.hash('#5s2024@', 10)

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password,
      name: 'John Doe',
      image: 'https://example.com/image.jpg',
      role: 'admin',
    },
  });

  console.log('Created user:', user);

  // Create a vehicle
  const vehicle = await prisma.vehicles.create({
    data: {
      make: 'Ford',
      model: 'F-150',
      year: 2020,
      licensePlate: 'ABC1234',
      userId: user.id, // Associate the vehicle with the user
    },
  });

  console.log('Created vehicle:', vehicle);

  // Create an inspection
  const inspection = await prisma.inspections.create({
    data: {
      userId: user.id,
      vehicleId: vehicle.id,
      dataInspecao: new Date(),
      crlvEmDia: true,
      fotoCRLV: 'https://example.com/fotoCRLV.jpg',
      certificadoTacografoEmDia: true,
      fotoTacografo: 'https://example.com/fotoTacografo.jpg',
      nivelAgua: 'Adequado',
      fotoNivelAgua: 'https://example.com/fotoNivelAgua.jpg',
      nivelOleo: 'Adequado',
      fotoNivelOleo: 'https://example.com/fotoNivelOleo.jpg',
      situacaoPneus: 'Bom',
      fotosPneusBom: 'https://example.com/fotosPneusBom.jpg',
      motivoPneuRuim: 'N/A',
      fotosPneusRuim: 'N/A',
      pneuFurado: false,
      fotoPneuFurado: 'N/A',
      avariasCabine: false,
      descricaoAvariasCabine: 'N/A',
      fotosAvariasCabine: 'N/A',
      bauPossuiAvarias: false,
      descricaoAvariasBau: 'N/A',
      fotosAvariasBau: 'N/A',
      funcionamentoParteEletrica: true,
      motivoParteEletricaRuim: 'N/A',
      fotosParteEletricaRuim: 'N/A',
      sugestao: 'Tudo em ordem',
    },
  });

  console.log('Created inspection:', inspection);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });